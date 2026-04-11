// netlify/functions/payment-webhook.js
// Cardcom קורא לכאן אחרי תשלום מוצלח

const SUPABASE_URL = 'https://qdgedsxhlcmgtrkxaxsu.supabase.co';
const SUPABASE_SECRET = 'sb_secret_QPpDC2I1za_7VE_TQgHaEA_w0pceUmj';

// שמירה ב-Supabase
async function supabaseInsert(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SECRET,
      'Authorization': `Bearer ${SUPABASE_SECRET}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

// יצירת QR token ייחודי
function generateQRToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = 'EPGB-';
  for (let i = 0; i < 12; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

// שליחת מייל עם QR (דרך Netlify Forms / EmailJS בהמשך)
async function sendTicketEmail(buyerEmail, buyerName, eventName, ticketType, qrToken, quantity) {
  // TODO: בהמשך נחבר SendGrid או Resend
  // כרגע רק לוג
  console.log(`📧 שולח כרטיס ל-${buyerEmail}:`, { eventName, ticketType, qrToken, quantity });
}

exports.handler = async (event) => {
  console.log('Webhook received:', event.body);

  // Cardcom שולח GET או POST
  const params = event.httpMethod === 'GET'
    ? Object.fromEntries(new URLSearchParams(event.queryStringParameters))
    : Object.fromEntries(new URLSearchParams(event.body));

  console.log('Parsed params:', JSON.stringify(params));

  const responseCode = params.ResponseCode;
  const totalPrice = params.TotalPrice || params.SumToBill;
  const returnValue = params.ReturnValue || '';
  const cardcomDealNumber = params.InternalDealNumber || params.DealNumber || '';
  const lowProfileCode = params.LowProfileCode || '';

  // רק אם תשלום הצליח
  if (responseCode !== '0') {
    console.log('Payment failed, ResponseCode:', responseCode);
    return { statusCode: 200, body: 'ok' };
  }

  // פיצול ReturnValue: email|ticketType|quantity
  const parts = returnValue.split('|');
  const buyerEmail = parts[0] || '';
  const ticketType = parts[1] || 'BASIC';
  const quantity = parseInt(parts[2] || '1');

  // יצירת QR token לכל כרטיס
  const tickets = [];
  for (let i = 0; i < quantity; i++) {
    tickets.push(generateQRToken());
  }

  try {
    // שמירת הזמנה ב-Supabase
    const orderData = {
      buyer_email: buyerEmail,
      ticket_type: ticketType,
      quantity,
      total_price: parseFloat(totalPrice) || 0,
      cardcom_deal_number: cardcomDealNumber,
      low_profile_code: lowProfileCode,
      payment_status: 'paid',
      qr_tokens: tickets,
      created_at: new Date().toISOString(),
    };

    const savedOrder = await supabaseInsert('orders_simple', orderData);
    console.log('Order saved:', JSON.stringify(savedOrder));

    // שליחת מייל
    await sendTicketEmail(buyerEmail, buyerEmail, 'Radio EPGB', ticketType, tickets[0], quantity);

    return { statusCode: 200, body: 'ok' };
  } catch (err) {
    console.error('Webhook error:', err);
    return { statusCode: 200, body: 'ok' }; // תמיד 200 ל-Cardcom
  }
};
