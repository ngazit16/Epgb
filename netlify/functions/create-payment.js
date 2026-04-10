// netlify/functions/create-payment.js

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { buyerName, buyerEmail, buyerPhone, ticketType, quantity, totalPrice, eventName } = JSON.parse(event.body);

  const params = new URLSearchParams({
    TerminalNumber: '1000',
    UserName: 'CardTest1994',
    APILevel: '10',
    codepage: '65001',
    Operation: '1',
    Currency: '1',
    SumToBill: String(totalPrice),
    ProductName: `${eventName} - ${ticketType}`,
    Quantity: String(quantity),
    ReturnValue: `${buyerEmail}|${ticketType}|${quantity}`,
    SuccessRedirectUrl: 'https://radio-epgb.netlify.app/success.html',
    ErrorRedirectUrl: 'https://radio-epgb.netlify.app/error.html',
    IndicatorUrl: 'https://radio-epgb.netlify.app/.netlify/functions/payment-webhook',
    Language: 'he',
    CustName: buyerName,
    email: buyerEmail,
    phone: buyerPhone,
    MaxPayments: '1',
  });

  try {
    const response = await fetch(
      'https://secure.cardcom.solutions/Interface/LowProfile.aspx',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: params.toString(),
      }
    );

    const text = await response.text();
    console.log('Cardcom raw response:', text);

    // Cardcom מחזיר תגובה עם & כמפריד
    const result = {};
    text.split('&').forEach(part => {
      const idx = part.indexOf('=');
      if (idx > -1) {
        const key = part.substring(0, idx).trim();
        const val = decodeURIComponent(part.substring(idx + 1).trim());
        result[key] = val;
      }
    });

    console.log('Parsed result:', JSON.stringify(result));

    // בדוק גם ResponseCode וגם Description=OK
    const isSuccess = result.ResponseCode === '0' || result.Description === 'OK';
    const paymentUrl = result.url;

    if (isSuccess && paymentUrl) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, paymentUrl }),
      };
    } else {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          success: false, 
          error: result.Description || 'שגיאה בסליקה',
          debug: result
        }),
      };
    }
  } catch (err) {
    console.error('Cardcom error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
