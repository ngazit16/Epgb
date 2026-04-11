// supabase/functions/create-payment/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CARDCOM_TERMINAL = Deno.env.get("CARDCOM_TERMINAL") || "1000";
const CARDCOM_USER     = Deno.env.get("CARDCOM_USER")     || "CardTest1994";
const CARDCOM_PASSWORD = Deno.env.get("CARDCOM_PASSWORD") || "Terminaltest2026";
const BASE_URL         = Deno.env.get("SITE_URL")         || "https://epgb.ngazit16.workers.dev";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const body = await req.json();
    console.log("body received:", JSON.stringify(body));

    const ticketType  = body.ticketType;
    const name        = body.name;
    const email       = body.email;
    const phone       = body.phone;
    const gender      = body.gender;
    const eventId     = body.eventId;
    const customerId  = body.customerId;
    const amount      = Number(body.amount);

    console.log("amount:", amount, "type:", typeof amount);

    if (!amount || amount <= 0 || !ticketType || !name || !email || !phone) {
      return new Response(
        JSON.stringify({ error: "חסרים פרטים או סכום שגוי" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        ticket_type:  ticketType,
        amount,
        name,
        email,
        phone,
        gender,
        event_id:    eventId || "general",
        customer_id: customerId || null,
        status:      "pending",
      })
      .select("id")
      .single();

    if (orderErr) throw new Error("שגיאה בשמירת הזמנה: " + orderErr.message);

    const orderId = order.id;
    console.log("order created:", orderId);

    const cardcomPayload = new URLSearchParams({
      TerminalNumber:               CARDCOM_TERMINAL,
      UserName:                     CARDCOM_USER,
      APILevel:                     "10",
      codepage:                     "65001",
      Operation:                    "1",
      SumToBill:                    String(amount),
      Currency:                     "1",
      Language:                     "he",
      ProductName:                  `EPGB ${ticketType}`,
      CustomerName:                 name,
      SendInvoiceByEmail:           email ? "true" : "false",
      InvoiceHead_CustName:         name,
      InvoiceHead_CustEmail:        email,
      InvoiceHead_CustAddressStreet:"שד'ל 7, תל אביב",
      ReturnValue:                  orderId,
      SuccessRedirectUrl:           `${BASE_URL}/success.html?order=${orderId}`,
      ErrorRedirectUrl:             `${BASE_URL}/error.html?order=${orderId}`,
      WebHookUrl:                   `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-webhook`,
    });

    console.log("sending to Cardcom, amount:", amount.toFixed(2));

    const cardcomRes = await fetch(
      "https://secure.cardcom.solutions/Interface/LowProfile.aspx",
      {
        method:  "POST",
        body:    cardcomPayload,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const text = await cardcomRes.text();
    console.log("Cardcom response:", text);

    const params       = new URLSearchParams(text);
    const responseCode = params.get("ResponseCode");
    const payUrl       = params.get("url");

    if (responseCode !== "0" || !payUrl) {
      throw new Error("Cardcom error: " + text);
    }

    await supabase
      .from("orders")
      .update({ cardcom_low_profile_code: params.get("LowProfileCode") })
      .eq("id", orderId);

    return new Response(
      JSON.stringify({ url: payUrl, orderId }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("error:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
