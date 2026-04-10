// netlify/functions/create-payment.js
// Netlify Function — מחבר בין האתר לCardcom API

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { buyerName, buyerEmail, buyerPhone, ticketType, quantity, totalPrice, eventName, eventDate } = JSON.parse(event.body);

  // Cardcom API 10 (Name to Value)
  const cardcomUrl = 'https://secure.cardcom.solutions/Interface/LowProfile.aspx';

  const params = new URLSearchParams({
    TerminalNumber: '1000', // מספר טרמינל טסט — תחליף בהמשך לאמיתי
    UserName: 'CardTest1994',
    APILevel: '10',
    codepage: '65001',
    Operation: '1', // חיוב
    Currency: '1', // שקל
    SumToBill: totalPrice.toString(),
    ProductName: `${eventName} — כרטיס ${ticketType}`,
    Quantity: quantity.toString(),
    ReturnValue: `${buyerEmail}|${ticketType}|${quantity}`,
    SuccessRedirectUrl: 'https://radio-epgb.netlify.app/success.html',
    ErrorRedirectUrl: 'https://radio-epgb.netlify.app/error.html',
    IndicatorUrl: 'https://radio-epgb.netlify.app/.netlify/functions/payment-webhook',
    Language: 'he',
    // פרטי לקוח
    CustName: buyerName,
    email: buyerEmail,
    phone: buyerPhone,
  });

  try {
    const response = await fetch(cardcomUrl, {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const text = await response.text();
    
    // Cardcom מחזיר: ResponseCode=0;Description=...;url=https://...
    const parsed = {};
    text.split(';').forEach(pair => {
      const [key, val] = pair.split('=');
      if (key) parsed[key.trim()] = val ? val.trim() : '';
    });

    if (parsed.ResponseCode === '0') {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, paymentUrl: parsed.url })
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: parsed.Description || 'שגיאה בסליקה' })
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
