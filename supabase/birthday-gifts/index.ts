// supabase/functions/birthday-gifts/index.ts
// מריץ כל יום בבוקר — שולח מתנת יומולדת ללקוחות
// Deploy: supabase functions deploy birthday-gifts
// Cron: הגדר ב-Supabase Dashboard → Edge Functions → birthday-gifts → Schedule: "0 8 * * *"

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const BASE_URL = Deno.env.get("SITE_URL") || "https://epgb.co.il";

    // תאריך היום — חודש ויום בלבד
    const now   = new Date();
    const month = now.getMonth() + 1;
    const day   = now.getDate();

    // מצא לקוחות שיום הולדתם היום
    const { data: customers, error } = await supabase
      .from("customers")
      .select("id, name, phone, email, birthday")
      .not("birthday", "is", null);

    if (error) throw error;

    const birthdayCustomers = (customers || []).filter(c => {
      if (!c.birthday) return false;
      const bd = new Date(c.birthday);
      return bd.getMonth() + 1 === month && bd.getDate() === day;
    });

    console.log(`נמצאו ${birthdayCustomers.length} לקוחות יומולדת היום`);

    const results = [];

    for (const customer of birthdayCustomers) {
      try {
        // צור gift record
        const giftId   = crypto.randomUUID();
        const qrToken  = crypto.randomUUID();

        // תוקף — 7 ימים
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const { error: giftErr } = await supabase
          .from("gifts")
          .insert({
            id:          giftId,
            customer_id: customer.id,
            gift_type:   "birthday",
            qr_token:    qrToken,
            note:        `🎂 מתנת יומולדת — ${customer.name}`,
            given_by:    "system",
            redeemed:    false,
            expires_at:  expiresAt.toISOString(),
          });

        if (giftErr) {
          console.error(`שגיאה ביצירת מתנה ל-${customer.name}:`, giftErr);
          continue;
        }

        // צור ticket
        await supabase.from("tickets").insert({
          order_id:  null,
          type:      "gift",
          qr_token:  qrToken,
          redeemed:  false,
          expires_at: expiresAt.toISOString(),
        });

        const giftUrl = `${BASE_URL}/gift.html?id=${giftId}`;

        // שלח WhatsApp
        if (customer.phone) {
          const phone = customer.phone.replace(/\D/g,'').replace(/^0/, '972');
          const msg = encodeURIComponent(
            `🎂 *יום הולדת שמח ${customer.name}!*\n\n` +
            `Radio E.P.G.B שולחים לך מתנה קטנה 🎁\n\n` +
            `לפתיחת המתנה שלך:\n${giftUrl}\n\n` +
            `_תוקף: 7 ימים_\n` +
            `SHADAL 7 · TLV 🎸`
          );
          // לוג — בפרודקשן תרצה לשלוח דרך API של WhatsApp Business
          console.log(`WhatsApp לשלוח ל-${phone}: https://wa.me/${phone}?text=${msg}`);
        }

        // שלח אימייל אם יש
        if (customer.email) {
          await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
              "apikey": Deno.env.get("SUPABASE_ANON_KEY")!,
            },
            body: JSON.stringify({
              to:           customer.email,
              customerName: customer.name,
              ticketType:   "BIRTHDAY_GIFT",
              ticketPrice:  "0",
              ticketContent: "מתנת יומולדת — כניסה או שתייה",
              successUrl:   giftUrl,
              eventTitle:   "🎂 יום הולדת שמח!",
            }),
          }).catch(e => console.error("email error:", e));
        }

        results.push({ customer: customer.name, giftId, status: "sent" });
        console.log(`✅ מתנה נשלחה ל-${customer.name}`);

      } catch(e) {
        console.error(`שגיאה ל-${customer.name}:`, e);
        results.push({ customer: customer.name, status: "error" });
      }
    }

    return new Response(
      JSON.stringify({ date: `${day}/${month}`, sent: results.length, results }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );

  } catch(err) {
    console.error("birthday function error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
