// supabase/functions/create-payment/index.ts
// מחליף את netlify/functions/create-payment.js
// Deploy: supabase functions deploy create-payment

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Cardcom config ──
const CARDCOM_TERMINAL = Deno.env.get("CARDCOM_TERMINAL") || "1000";
const CARDCOM_USER     = Deno.env.get("CARDCOM_USER")     || "CardTest1994";
const CARDCOM_PASSWORD = Deno.env.get("CARDCOM_PASSWORD") || "Terminaltest2026";
const BASE_URL         = Deno.env.get("SITE_URL")         || "https://radio-epgb.netlify.app";

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const body = await req.json();
    const { ticketType, name, email, phone, gender, eventId, customerId } = body;
    const amount = Number(body.amount);

    // ── ולידציה בסיסית ──
    if (!amount || !ticketType || !name || !email || !phone) {
      return new Response(
        JSON.stringify({ error: "חסרים פרטים" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // ── שמירת הזמנה ב-Supabase (pending) ──
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

    // ── קריאה ל-Cardcom LowProfile ──
    const cardcomPayload = new URLSearchParams({
      TerminalNumber: CARDCOM_TERMINAL,
      UserName:       CARDCOM_USER,
      APILevel:       "10",
      codepage:       "65001",
      Operation:      "1",            // חיוב רגיל
      Amount:         String(amount),
      CoinID:         "1",            // שקל
      Language:       "he",
      ProductName:    `EPGB ${ticketType}`,
      CustomerName:   name,
      SendInvoiceByEmail: email ? "true" : "false",
      InvoiceHead_CustName:   name,
      InvoiceHead_CustEmail:  email,
      InvoiceHead_CustAddressStreet: "שד'ל 7, תל אביב",
      ReturnValue:    orderId,        // נחזור איתו ב-webhook
      SuccessRedirectUrl: `${BASE_URL}/success.html?order=${orderId}`,
      ErrorRedirectUrl:   `${BASE_URL}/error.html?order=${orderId}`,
      WebHookUrl:         `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-webhook`,
    });

    const cardcomRes = await fetch(
      "https://secure.cardcom.solutions/Interface/LowProfile.aspx",
      {
        method: "POST",
        body:   cardcomPayload,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const text = await cardcomRes.text();

    // Cardcom מחזיר string: "ResponseCode=0&LowProfileCode=xxx&url=https://..."
    const params = new URLSearchParams(text);
    const responseCode = params.get("ResponseCode");
    const payUrl       = params.get("url");

    if (responseCode !== "0" || !payUrl) {
      console.error("Cardcom error:", text);
      throw new Error("Cardcom לא החזיר קישור תשלום");
    }

    // ── עדכון order עם low_profile_code ──
    await supabase
      .from("orders")
      .update({ cardcom_low_profile_code: params.get("LowProfileCode") })
      .eq("id", orderId);

    return new Response(
      JSON.stringify({ url: payUrl, orderId }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
