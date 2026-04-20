// supabase/functions/payment-webhook/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TICKET_LABELS: Record<string, string> = {
  BASIC:    "BASIC — כניסה + צייסר",
  STANDARD: "STANDARD — כניסה + 2 דרינקים + צייסר",
  PREMIUM:  "PREMIUM — כניסה + 5 דרינקים + צייסר",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.text();
    const params = new URLSearchParams(body);

    const responseCode   = params.get("ResponseCode");
    const orderId        = params.get("ReturnValue");
    const last4          = params.get("CardNum") || "";
    const approvalNumber = params.get("ApprovalNumber") || "";

    console.log("Webhook received:", { responseCode, orderId });

    if (!orderId) {
      return new Response("missing orderId", { status: 400 });
    }

    if (responseCode === "0") {

      // שלוף הזמנה
      const { data: order, error: fetchErr } = await supabase
        .from("orders")
        .select("*, customers(id, visit_count, is_vip)")
        .eq("id", orderId)
        .single();

      if (fetchErr || !order) throw new Error("הזמנה לא נמצאה: " + orderId);

      // ── בדיקת זמינות כרטיסים ──
      if (order.event_id && order.event_id !== "general") {
        const eventId = order.event_id;

        const [{ data: evData }, { data: orders }, { data: ttData }] = await Promise.all([
          supabase.from("events").select("max_tickets").eq("id", eventId).single(),
          supabase.from("orders").select("id, ticket_type").eq("event_id", eventId).eq("status", "paid"),
          supabase.from("ticket_types").select("quantity_total").eq("event_id", eventId).eq("name", order.ticket_type).single(),
        ]);

        const totalSold = (orders || []).length;
        const typeSold  = (orders || []).filter((o: any) => o.ticket_type === order.ticket_type).length;

        // בדוק מקסימום אירוע
        if (evData?.max_tickets && totalSold >= evData.max_tickets) {
          await supabase.from("orders").update({ status: "failed" }).eq("id", orderId);
          console.log("SOLD OUT — event max reached:", totalSold, "/", evData.max_tickets);
          return new Response("sold_out_event", { status: 200 });
        }

        // בדוק מקסימום סוג כרטיס
        if (ttData?.quantity_total && typeSold >= ttData.quantity_total) {
          await supabase.from("orders").update({ status: "failed" }).eq("id", orderId);
          console.log("SOLD OUT — ticket type max reached:", typeSold, "/", ttData.quantity_total);
          return new Response("sold_out_type", { status: 200 });
        }
      }

      // עדכן סטטוס → paid
      await supabase
        .from("orders")
        .update({
          status:          "paid",
          approval_number: approvalNumber,
          card_last4:      last4.slice(-4),
          paid_at:         new Date().toISOString(),
        })
        .eq("id", orderId);

      // צור QR codes
      const qrCodes = generateQRCodes(order.ticket_type);

      // שמור tickets
      await supabase.from("tickets").insert(
        qrCodes.map((qr) => ({
          order_id: orderId,
          type:     qr.type,
          qr_token: qr.token,
          redeemed: false,
        }))
      );

      // עדכן / צור לקוח
      if (order.customer_id) {
        await supabase
          .from("customers")
          .update({ visit_count: (order.customers?.visit_count || 0) + 1 })
          .eq("id", order.customer_id);
      } else {
        const { data: newCustomer } = await supabase
          .from("customers")
          .upsert({
            name:        order.name,
            email:       order.email,
            phone:       order.phone,
            gender:      order.gender,
            visit_count: 1,
            is_vip:      false,
          }, { onConflict: "phone" })
          .select("id")
          .single();

        if (newCustomer) {
          await supabase
            .from("orders")
            .update({ customer_id: newCustomer.id })
            .eq("id", orderId);
        }
      }

      // שלוף פרטי אירוע
      let eventTitle = "";
      let eventDate  = "";
      let eventTime  = "";
      let eventDesc  = "";

      if (order.event_id && order.event_id !== "general") {
        const { data: event } = await supabase
          .from("events")
          .select("title, date, start_time, description")
          .eq("id", order.event_id)
          .single();

        if (event) {
          eventTitle = event.title || "";
          eventDate  = event.date  ? new Date(event.date).toLocaleDateString("he-IL") : "";
          eventTime  = event.start_time ? event.start_time.slice(0,5) : "";
          eventDesc  = event.description || "";
        }
      }

      // שלח אימייל
      const BASE_URL    = Deno.env.get("SITE_URL") || "https://epgb.co.il";
      const successUrl  = `${BASE_URL}/success.html?order=${orderId}`;
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
      const ANON_KEY    = Deno.env.get("SUPABASE_ANON_KEY")!;

      if (order.email) {
        await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${ANON_KEY}`,
            "apikey":        ANON_KEY,
          },
          body: JSON.stringify({
            to:            order.email,
            customerName:  order.name,
            ticketType:    order.ticket_type,
            ticketPrice:   String(order.amount),
            ticketContent: TICKET_LABELS[order.ticket_type] || order.ticket_type,
            successUrl,
            eventTitle,
            eventDate,
            eventTime,
            eventDescription: eventDesc,
          }),
        }).catch((e) => console.error("Email error:", e));
      }

      return new Response("OK", { status: 200 });

    } else {
      await supabase
        .from("orders")
        .update({ status: "failed" })
        .eq("id", orderId);

      return new Response("payment_failed", { status: 200 });
    }

  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("error: " + err.message, { status: 500 });
  }
});

function generateQRCodes(ticketType: string): Array<{ type: string; token: string }> {
  const makeToken = () => crypto.randomUUID();
  const tickets: Array<{ type: string; token: string }> = [];

  tickets.push({ type: "entry",  token: makeToken() });
  tickets.push({ type: "chaser", token: makeToken() });

  if (ticketType === "STANDARD") {
    tickets.push({ type: "drink", token: makeToken() });
    tickets.push({ type: "drink", token: makeToken() });
  } else if (ticketType === "PREMIUM") {
    for (let i = 0; i < 5; i++) {
      tickets.push({ type: "drink", token: makeToken() });
    }
  }

  return tickets;
}
