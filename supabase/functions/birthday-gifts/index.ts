// supabase/functions/birthday-gifts/index.ts
// רץ כל יום בשעה 12:00 — שולח מתנות יומולדת לפי הגדרות admin

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

    const BASE_URL  = Deno.env.get("SITE_URL") || "https://epgb.co.il";
    const ANON_KEY  = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPA_URL  = Deno.env.get("SUPABASE_URL")!;

    // שלוף הגדרות
    const { data: settings } = await supabase
      .from("birthday_settings")
      .select("*")
      .limit(1)
      .single();

    if (!settings || !settings.is_active) {
      return new Response(JSON.stringify({ message: "יומולדת כבויה" }), {
        headers: { ...CORS, "Content-Type": "application/json" }
      });
    }

    // בדוק תקופת קמפיין
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    if (settings.campaign_from && todayStr < settings.campaign_from) {
      return new Response(JSON.stringify({ message: "הקמפיין עדיין לא התחיל" }), {
        headers: { ...CORS, "Content-Type": "application/json" }
      });
    }
    if (settings.campaign_to && todayStr > settings.campaign_to) {
      return new Response(JSON.stringify({ message: "הקמפיין הסתיים" }), {
        headers: { ...CORS, "Content-Type": "application/json" }
      });
    }

    const month = today.getMonth() + 1;
    const day   = today.getDate();

    // שלוף לקוחות
    let query = supabase
      .from("customers")
      .select("id, name, phone, email, birthday, gender")
      .not("birthday", "is", null);

    if (settings.gender_filter !== "all") {
      query = query.eq("gender", settings.gender_filter);
    }

    const { data: customers } = await query;

    const birthdayCustomers = (customers || []).filter(c => {
      const bd = new Date(c.birthday);
      return bd.getMonth() + 1 === month && bd.getDate() === day;
    });

    // הגבלת מקסימום ביום
    const limited = birthdayCustomers.slice(0, settings.max_per_day || 10);

    console.log(`${limited.length} לקוחות יומולדת היום`);

    if (settings.gift_type === "none") {
      return new Response(JSON.stringify({ message: "gift_type=none, לא שולחים", count: limited.length }), {
        headers: { ...CORS, "Content-Type": "application/json" }
      });
    }

    const results = [];

    for (const customer of limited) {
      try {
        const giftId  = crypto.randomUUID();
        const qrToken = crypto.randomUUID();

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const status = settings.requires_approval ? "pending" : "sent";

        // צור gift
        await supabase.from("gifts").insert({
          id:          giftId,
          customer_id: customer.id,
          gift_type:   "birthday",
          qr_token:    qrToken,
          note:        `🎂 ${settings.gift_type} — יומולדת ${customer.name}`,
          given_by:    "system",
          redeemed:    false,
          expires_at:  expiresAt.toISOString(),
          status,
          ...(settings.event_id ? { event_id: settings.event_id } : {}),
        });

        // צור ticket
        await supabase.from("tickets").insert({
          order_id:   null,
          type:       settings.gift_type === "entry" ? "entry" :
                      settings.gift_type === "drink"  ? "drink"  :
                      settings.gift_type === "beer"   ? "beer"   : "chaser",
          qr_token:   qrToken,
          redeemed:   false,
          expires_at: expiresAt.toISOString(),
        });

        // שלח רק אם אושר אוטומטית
        if (status === "sent") {
          const giftUrl = `${BASE_URL}/gift.html?id=${giftId}`;
          const giftLabels: Record<string,string> = {
            entry:'כניסה', drink:'דרינק', chaser:'צייסר', beer:'בירה'
          };

          if (customer.phone) {
            const phone = customer.phone.replace(/\D/g,'').replace(/^0/,'972');
            const msg = encodeURIComponent(
              `🎂 *יום הולדת שמח ${customer.name}!*\n\n` +
              `Radio E.P.G.B שולחים לך ${giftLabels[settings.gift_type]||'מתנה'} מתנה 🎁\n\n` +
              `לפתיחת המתנה:\n${giftUrl}\n\n` +
              `_תוקף: 7 ימים_\nSHADAL 7 · TLV 🎸`
            );
            console.log(`WhatsApp: https://wa.me/${phone}?text=${msg}`);
          }

          // אימייל
          if (customer.email) {
            await fetch(`${SUPA_URL}/functions/v1/send-email`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ANON_KEY}`,
                "apikey": ANON_KEY,
              },
              body: JSON.stringify({
                to:           customer.email,
                customerName: customer.name,
                ticketType:   "BIRTHDAY_GIFT",
                ticketPrice:  "0",
                ticketContent: `מתנת יומולדת — ${giftLabels[settings.gift_type]||'מתנה'}`,
                successUrl:   `${BASE_URL}/gift.html?id=${giftId}`,
                eventTitle:   "🎂 יום הולדת שמח!",
              }),
            }).catch(e => console.error("email:", e));
          }
        }

        results.push({ name: customer.name, status, giftId });

      } catch(e) {
        console.error(`שגיאה ל-${customer.name}:`, e);
        results.push({ name: customer.name, status: "error" });
      }
    }

    return new Response(
      JSON.stringify({ date: todayStr, sent: results.length, results }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );

  } catch(err) {
    console.error("birthday error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
