# 🎸 Radio E.P.G.B — סיכום פרויקט
> עדכון אחרון: אפריל 2026

---

## 📍 פרטי המקום
- **שם:** Radio E.P.G.B
- **בעלים:** נימרוד גזית
- **כתובת:** שד"ל 7, תל אביב
- **פעילות:** מאז 2009
- **סגנון:** גראנג'י, אינדי/אלטרנטיב, CBGB vibes
- **פתוח:** ימי שלישי עד שבת

---

## 💻 Stack טכני
| רכיב | כלי |
|------|-----|
| Backend/DB | Supabase |
| Edge Functions | Supabase Edge Functions (Deno) |
| תשלומים | Cardcom |
| אוטומציה | Make (Integromat) |
| Hosting | Netlify (סטטי בלבד) |
| דומיין | epgb.co.il |
| GitHub | ngazit16/Epgb |
| האתר הנוכחי | radio-epgb.netlify.app |

### Cardcom פרטי טסט
- Terminal: 1000
- User: CardTest1994
- Password: Terminaltest2026
- API: LowProfile (Name To Value)
- SuccessUrl: https://radio-epgb.netlify.app/success.html
- ErrorUrl: https://radio-epgb.netlify.app/error.html
- WebhookUrl: `https://qdgedsxhlcmgtrkxaxsu.supabase.co/functions/v1/payment-webhook`

### Supabase
- Project Ref: `qdgedsxhlcmgtrkxaxsu`
- Edge Functions URL: `https://qdgedsxhlcmgtrkxaxsu.supabase.co/functions/v1/`

---

## ✅ מה שנעשה עד עכשיו

### אתר (index.html)
- דף ראשי מלא בסגנון CBGB גראנג'י שחור + אדום
- Ticker אנימציה בראש
- Hero section עם כותרת ענקית + flicker effect
- Section "לא מועדון. 🎸 מקום."
- Section "אין אירועים קרובים"
- Tickets section עם 3 סוגי כרטיסים
- Tape card בסגנון הכרטיסייה של EPGB
- Grain texture כבד + scratch lines
- כתובת נכונה: שד"ל 7

### דף רכישה (ticket-purchase.html) ✅ חדש
- 3 שלבים: בחירת כרטיס → פרטים → תשלום
- זיהוי לקוח חוזר לפי טלפון — שלב 2 מתמלא אוטומטית
- לקוח חוזר קופץ ישר משלב 1 לשלב 3
- מחירים נכונים: 50/100/150₪
- סגנון CBGB גראנג'י מלא
- קריאה ל-Supabase Edge Function

### Supabase Edge Functions ✅ חדש
- `supabase/functions/create-payment/index.ts` — יוצר תשלום ב-Cardcom + שומר הזמנה
- `supabase/functions/payment-webhook/index.ts` — מקבל אישור + יוצר QR tokens + מעדכן לקוח
- מחליפות את Netlify Functions לחלוטין
- Secrets מוגדרים ב-Supabase Dashboard

### Netlify
- משמש לקבצים סטטיים בלבד (HTML/CSS/JS)
- אין יותר Functions ב-Netlify → אין מגבלת 125k/חודש

---

## 🎫 מחירי כרטיסים
| סוג | מחיר | תוכן |
|-----|------|-------|
| BASIC | ₪50 | כניסה + צייסר |
| STANDARD ⭐ | ₪100 | כניסה + 2 דרינקים + צייסר |
| PREMIUM | ₪150 | כניסה + 5 דרינקים + צייסר |

### QR שמופקים אחרי תשלום:
- **₪50** — QR כניסה + QR צייסר
- **₪100** — QR כניסה + 2× QR דרינק + QR צייסר
- **₪150** — QR כניסה + 5× QR דרינק + QR צייסר
- נשלחים: מסך + אימייל + WhatsApp/SMS

---

## 📱 מערכת סריקה לצוות
- דף אינטרנט בטלפון — ללא אפליקציה
- סורק QR → מסך ירוק ✅ / אדום ❌ מיידי
- QR נרשם כ"מומש" ב-Supabase — חד פעמי

---

## 🗄️ טבלאות Supabase (לבנות)
- [ ] `customers` — לקוחות, טלפון, מגדר, visit_count, is_vip
- [ ] `orders` — הזמנות, סטטוס, סוג כרטיס, מחיר
- [ ] `tickets` — QR tokens, סוג (entry/drink/chaser), redeemed

---

## 🚧 מה שנשאר לעשות

### עדיפות גבוהה
- [ ] טבלאות Supabase (customers, orders, tickets)
- [ ] כרטיסים מעוצבים עם QR אחרי תשלום
- [ ] שליחת כרטיסים באימייל אוטומטי
- [ ] שליחה ב-WhatsApp/SMS דרך Make
- [ ] דף סריקה לצוות (web-based)

### מערכת לקוחות
- [ ] מועדון לקוחות עם היסטוריה
- [ ] תמונת זיהוי ללקוח
- [ ] מתנת יומולדת אוטומטית
- [ ] פינוק ידני (דרינק/צייסר/מתנה) — QR קוד
- [ ] שיווק אוטומטי עם תקציב

### ניהול פנימי
- [ ] סידור עבודה לצוות
- [ ] מערכת תקשורת פנימית (סגנון Dex)
- [ ] דוח סגירת משמרת יומי
- [ ] מעקב מחירי ספקים שבועי אוטומטי

---

## 📋 הוראות Push
```bash
cd C:\Users\pc\Epgb
git add .
git commit -m "תיאור השינוי"
git push
```

## 📋 הוראות Deploy Edge Functions
```bash
cd C:\Users\pc\Epgb
supabase functions deploy create-payment --project-ref qdgedsxhlcmgtrkxaxsu
supabase functions deploy payment-webhook --project-ref qdgedsxhlcmgtrkxaxsu
```

---

## 🎨 סגנון עיצוב
- **צבעים:** שחור #050403 · אדום #c41a1a · קרם #d8d0c0
- **פונטים:** Bebas Neue · Special Elite · Frank Ruhl Libre
- **אווירה:** CBGB גראנג'י, רטרו underground TLV
- **Grain:** כבד מאוד + scratch lines + cursor crosshair
