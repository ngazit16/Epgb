// supabase/functions/payment-webhook/index.ts
// מחליף את netlify/functions/payment-webhook.js
// Deploy: supabase functions deploy payment-webhook

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Cardcom שולח POST עם form data
    const body = await req.text();
    const params = new URLSearchParams(body);

    const responseCode    = params.get("ResponseCode");
    const lowProfileCode  = params.get("LowProfileCode");
    const orderId         = params.get("ReturnValue");   // מה ששלחנו ב-create-payment
    const last4           = params.get("CardNum") || "";
    const approvalNumber  = params.get("ApprovalNumber") || "";

    console.log("Webhook received:", { responseCode, orderId, lowProfileCode });

    if (!orderId) {
      return new Response("missing orderId", { status: 400 });
    }

    // ── תשלום הצליח ──
    if (responseCode === "0") {

      // שלוף את ההזמנה
      const { data: order, error: fetchErr } = await supabase
        .from("orders")
        .select("*, customers(id, visit_count, is_vip)")
        .eq("id", orderId)
        .single();

      if (fetchErr || !order) throw new Error("הזמנה לא נמצאה: " + orderId);

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

      // ── צור QR codes ──
      const qrCodes = await generateQRCodes(orderId, order.ticket_type, supabase);

      // ── שמור QR codes ──
      await supabase.from("tickets").insert(
        qrCodes.map((qr) => ({
          order_id:   orderId,
          type:       qr.type,      // "entry" | "drink" | "chaser"
          qr_token:   qr.token,
          redeemed:   false,
        }))
      );

      // ── עדכן לקוח קיים ──
      if (order.customer_id) {
        await supabase
          .from("customers")
          .update({ visit_count: (order.customers?.visit_count || 0) + 1 })
          .eq("id", order.customer_id);
      } else {
        // ── צור לקוח חדש ──
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

      // ── שלח אימייל + WhatsApp דרך Make webhook ──
      const makeWebhookUrl = Deno.env.get("MAKE_WEBHOOK_URL");
      if (makeWebhookUrl) {
        await fetch(makeWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            ticketType:  order.ticket_type,
            name:        order.name,
            email:       order.email,
            phone:       order.phone,
            amount:      order.amount,
            qrCodes:     qrCodes.map((q) => ({ type: q.type, token: q.token })),
          }),
        }).catch((e) => console.error("Make webhook error:", e));
      }

      return new Response("OK", { status: 200 });

    } else {
      // ── תשלום נכשל ──
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

// ── יצירת QR tokens לפי סוג כרטיס ──
async function generateQRCodes(
  orderId: string,
  ticketType: string,
  supabase: any
): Promise<Array<{ type: string; token: string }>> {
  const makeToken = () => crypto.randomUUID();

  const tickets: Array<{ type: string; token: string }> = [];

  // תמיד: כניסה + צייסר
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
