import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildEmailHTML(data: {
  customerName: string;
  ticketType: string;
  ticketPrice: string;
  ticketContent: string;
  successUrl: string;
  eventTitle?: string;
  eventDate?: string;
  eventTime?: string;
  eventDescription?: string;
}) {
  const {
    customerName,
    ticketType,
    ticketPrice,
    ticketContent,
    successUrl,
    eventTitle,
    eventDate,
    eventTime,
    eventDescription,
  } = data;

  const eventSection = eventTitle ? `
    <tr>
      <td style="padding: 0 40px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border: 2px solid #c41a1a; padding: 20px;">
          <tr>
            <td>
              <p style="font-family: 'Bebas Neue', Impact, sans-serif; font-size: 22px; color: #c41a1a; margin: 0 0 10px; letter-spacing: 2px;">🎵 פרטי האירוע</p>
              <p style="font-family: Georgia, serif; font-size: 20px; color: #d8d0c0; margin: 0 0 6px;">${eventTitle}</p>
              ${eventDate ? `<p style="font-family: Georgia, serif; font-size: 15px; color: #999; margin: 0 0 4px;">📅 ${eventDate}</p>` : ""}
              ${eventTime ? `<p style="font-family: Georgia, serif; font-size: 15px; color: #999; margin: 0 0 4px;">🕐 ${eventTime}</p>` : ""}
              ${eventDescription ? `<p style="font-family: Georgia, serif; font-size: 14px; color: #aaa; margin: 10px 0 0; line-height: 1.6;">${eventDescription}</p>` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  ` : "";

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>כרטיס Radio E.P.G.B</title>
</head>
<body style="margin:0; padding:0; background-color:#050403; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050403; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#0a0908; border: 1px solid #222;">

          <!-- HEADER -->
          <tr>
            <td style="background:#c41a1a; padding: 30px 40px; text-align:center;">
              <p style="font-family: Impact, sans-serif; font-size: 38px; color: #050403; margin:0; letter-spacing: 4px;">RADIO E.P.G.B</p>
              <p style="font-family: Georgia, serif; font-size: 13px; color: #050403; margin: 4px 0 0; letter-spacing: 2px;">SHADAL 7 · TEL AVIV · SINCE 2009</p>
            </td>
          </tr>

          <!-- GREETING -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align:right;">
              <p style="font-family: Georgia, serif; font-size: 16px; color: #d8d0c0; margin: 0 0 8px;">היי ${customerName},</p>
              <p style="font-family: Georgia, serif; font-size: 14px; color: #999; margin: 0; line-height: 1.7;">
                הכרטיס שלך מוכן. שמור על הלינק — זה הכרטיס שלך לכניסה.
              </p>
            </td>
          </tr>

          <!-- TICKET INFO -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#111; border-right: 4px solid #c41a1a; padding: 20px;">
                <tr>
                  <td>
                    <p style="font-family: Impact, sans-serif; font-size: 28px; color: #d8d0c0; margin: 0 0 6px; letter-spacing: 2px;">${ticketType}</p>
                    <p style="font-family: Georgia, serif; font-size: 14px; color: #aaa; margin: 0 0 10px;">${ticketContent}</p>
                    <p style="font-family: Impact, sans-serif; font-size: 24px; color: #c41a1a; margin: 0;">₪${ticketPrice}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- EVENT INFO -->
          ${eventSection}

          <!-- CTA BUTTON -->
          <tr>
            <td style="padding: 0 40px 30px; text-align:center;">
              <a href="${successUrl}" style="display:inline-block; background:#c41a1a; color:#d8d0c0; font-family: Impact, sans-serif; font-size: 20px; letter-spacing: 3px; text-decoration:none; padding: 16px 40px; border: 2px solid #d8d0c0;">
                הצג כרטיס ו-QR
              </a>
              <p style="font-family: Georgia, serif; font-size: 12px; color: #555; margin: 12px 0 0;">שמור את הלינק הזה — תצטרך אותו בכניסה</p>
            </td>
          </tr>

          <!-- RULES -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d; border-top: 1px solid #333; padding: 20px;">
                <tr>
                  <td>
                    <p style="font-family: Impact, sans-serif; font-size: 16px; color: #c41a1a; margin: 0 0 12px; letter-spacing: 2px;">⚠️ חשוב לדעת</p>
                    <p style="font-family: Georgia, serif; font-size: 13px; color: #888; margin: 0 0 6px; line-height: 1.7;">• כניסה עם תעודה מזהה בלבד — תעודת זהות או דרכון פיזי</p>
                    <p style="font-family: Georgia, serif; font-size: 13px; color: #888; margin: 0 0 6px; line-height: 1.7;">• אין כניסה עם שתייה, אוכל, נשק או חפצים אסורים</p>
                    <p style="font-family: Georgia, serif; font-size: 13px; color: #888; margin: 0; line-height: 1.7;">• יש לעמוד בתנאי האבטחה של המקום</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 20px 40px; text-align:center; border-top: 1px solid #1a1a1a;">
              <p style="font-family: Georgia, serif; font-size: 12px; color: #444; margin: 0;">Radio E.P.G.B · שד"ל 7, תל אביב</p>
              <p style="font-family: Georgia, serif; font-size: 12px; color: #444; margin: 4px 0 0;">epgb.co.il</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const html = buildEmailHTML(body);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Radio E.P.G.B <tickets@epgb.co.il>",
        to: [body.to],
        subject: `🎸 הכרטיס שלך ל-${body.eventTitle || "Radio E.P.G.B"}`,
        html,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
