// netlify/functions/payment-webhook.js
// Cardcom קורא לפה אחרי תשלום מוצלח

exports.handler = async (event) => {
  const params = new URLSearchParams(event.body);
  
  const responseCode = params.get('ResponseCode');
  const totalPrice = params.get('TotalPrice');
  const returnValue = params.get('ReturnValue'); // email|ticketType|quantity
  const cardcomDealNumber = params.get('InternalDealNumber');

  if (responseCode !== '0') {
    console.log('Payment failed:', responseCode);
    return { statusCode: 200, body: 'ok' };
  }

  // פיצול ReturnValue
  const [buyerEmail, ticketType, quantity] = (returnValue || '').split('|');

  // TODO: כאן נשמור ב-Supabase:
  // 1. עדכן order ל-paid
  // 2. צור ticket עם QR
  // 3. שלח מייל עם QR ל-buyerEmail

  console.log('Payment success:', { buyerEmail, ticketType, quantity, totalPrice, cardcomDealNumber });

  return { statusCode: 200, body: 'ok' };
};
