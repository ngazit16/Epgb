# 🎸 Radio E.P.G.B — סיכום פרויקט
> עדכון אחרון: 19 אפריל 2026

---

## 📍 פרטי המקום
- **שם:** Radio E.P.G.B | **בעלים:** נימרוד גזית
- **כתובת:** שד"ל 7, תל אביב | **פעילות:** מאז 2009

---

## 💻 Stack טכני
| רכיב | כלי |
|------|-----|
| Backend/DB | Supabase |
| Edge Functions | Supabase Edge Functions (Deno) |
| תשלומים | Cardcom LowProfile — פרמטר: SumToBill |
| Hosting | Cloudflare Workers & Pages |
| דומיין | epgb.co.il פעיל |
| GitHub | ngazit16/Epgb |
| אימייל | Resend ✅ — דומיין epgb.co.il מאומת, שולח מ-tickets@epgb.co.il |

### Cardcom טסט
- Terminal: 1000 | User: CardTest1994 | Password: Terminaltest2026
- כרטיס: 4580280000000008 | תוקף: 10/2028 | CVV: 123 | ת.ז: 000000018

### Supabase
- Project Ref: qdgedsxhlcmgtrkxaxsu
- Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkZ2Vkc3hobGNtZ3Rya3hheHN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MTkxMTksImV4cCI6MjA5MTI5NTExOX0.RlXd13uq8tdq2ca4WpNOyfY4_tkPvgi0_bsqYFtFvl4

### Staff
- נימרוד: PIN 0000, role: admin

---

## Deploy — חשוב!

### כל שינוי בקוד:
```powershell
cd C:\Users\pc\Epgb
git add .
git commit -m "תיאור"
git push
```

### Deploy לאתר (ידני):
- dash.cloudflare.com → Workers & Pages → epgb → New deployment
- גרור רק קבצי HTML (ללא: supabase, netlify, .git, epgb.bundle, scan_old, supabase_schema.sql, EPGB_PROJECT_SUMMARY.md)
- לחץ Deploy

### Deploy Edge Function:
```powershell
npx supabase functions deploy send-email --project-ref qdgedsxhlcmgtrkxaxsu
npx supabase functions deploy birthday-gifts --project-ref qdgedsxhlcmgtrkxaxsu
npx supabase functions deploy payment-webhook --project-ref qdgedsxhlcmgtrkxaxsu
```

### בדיקה חשובה בכל שיחה/בעיה:
```powershell
type success.html | findstr "workers.dev"
```
אם יש תוצאה — לשנות ל-epgb.co.il/scan.html

---

## דפי אתר

| דף | תיאור | סטטוס |
|----|--------|--------|
| index.html | לוגו + אירועים מ-Supabase + כניסה לצוות | ✅ |
| event.html?id=xxx | דף אירוע + drawer רכישת כרטיס + ולידציה | ✅ |
| drinks.html | שתייה בבר — תוקף עד 8:00 למחרת | ✅ |
| success.html | כרטיסים + QR הדרגתי + WhatsApp + מייל | ✅ |
| scan.html | סריקה — localStorage session, מצלמה רגילה עובדת | ⚠️ חלקי |
| staff.html | PIN + תפריט הרשאות + קרדיט מ-DB | ✅ |
| gift.html | פינוק + הצטרפות מועדון + יומולדת חובה | ✅ |
| admin.html | עובדים + אירועים + קרדיטים + טאב יומולדת | ✅ |
| reports.html | דוחות מלאים | ✅ |
| error.html | שגיאה | ✅ |

---

## Edge Functions

| פונקציה | תיאור |
|---------|--------|
| create-payment | יצירת תשלום Cardcom |
| payment-webhook | אישור תשלום + יצירת tickets |
| send-email | אימייל עיצוב EPGB דרך Resend — from: tickets@epgb.co.il ✅ |
| birthday-gifts | מתנות יומולדת אוטומטיות — cron 10:00 UTC = 12:00 IL |

---

## טבלאות Supabase

customers, events, orders (email_sent, whatsapp_sent), tickets (expires_at), staff, gifts (status), drink_coupons, role_credits, staff_credits, credit_usage, birthday_settings, shift_reports, secret_links

### Constraints שעודכנו:
- tickets.type: entry, drink, chaser, gift, beer ✅

---

## פיצ'רים שנבנו

- מערכת כרטיסים מלאה: event → payment → success → QR
- QR הדרגתי ב-success.html (entry פתוח, שאר נעולים + polling)
- WhatsApp אוטומטי אחרי רכישה ✅
- מייל אחרי רכישה דרך Resend — tickets@epgb.co.il ✅
- לינק מWhatsApp פותח כרטיסים ✅ (תוקן: pending order עם cardcom_low_profile_code)
- QR לא נעלם אחרי חזרה מWhatsApp ✅ (תוקן: canvas → img סטטי)
- drinks.html — תוקף 8:00 בבוקר
- scan.html — בדיקת expires_at
- scan.html — localStorage session (אנשי צוות לא צריכים PIN כל פעם) ✅
- יומולדת אוטומטית — cron יומי + admin settings
- gift.html — יומולדת חובה בהצטרפות מועדון
- admin.html — טאב יומולדת מלא
- ולידציה מלאה בכל הטפסים (+972 נתמך)
- reports.html — דוחות מלאים

---

## בעיות פתוחות

1. **scan.html — סריקה real-time מהכפתור** — לא עובדת על Chrome iOS. גילינו שהגרסה שעבדה (commit 0e68d0c) השתמשה ב-html5-qrcode + jsQR. **בשיחה הבאה:** לבנות scan.html מחדש עם html5-qrcode + localStorage session + URL epgb.co.il. **פתרון זמני:** מצלמה רגילה של האייפון סורקת QR → מוביל ל-epgb.co.il/scan.html?token=... → PIN (פעם אחת בלבד) → תיקוף אוטומטי ✅
2. **מועדון לקוחות** — חיפוש אוטומטי, Web Contacts API
3. **דוח משמרת**

---

## מה שנשאר לבנות

### עדיפות גבוהה
- תיקון סריקה ישירה ב-scan.html (html5-qrcode — commit 0e68d0c)
- מועדון לקוחות מפותח
- דוח משמרת

### עדיפות בינונית
- תזכורת WhatsApp יום לפני אירוע
- זיהוי VIP בסריקה

### עתידי
- סידור עבודה לצוות
- מערכת תקשורת פנימית
- מעקב מחירי ספקים
- שיווק אוטומטי (Make)
- Multi-tenant

---

## חבילות כרטיסים

| סוג | מחיר | תוכן |
|-----|------|-------|
| BASIC | 50 | כניסה + צייסר |
| STANDARD | 100 | כניסה + 2 דרינקים + צייסר |
| PREMIUM | 150 | כניסה + 5 דרינקים + צייסר |
| DRINKS_STANDARD | 100 | 2 דרינקים + צייסר |
| DRINKS_PREMIUM | 150 | 5 דרינקים + צייסר |
| BEER_STANDARD | 100 | 3 בירה/יין/ערק + צייסר |
| BEER_PREMIUM | 150 | 6 בירה/יין/ערק + צייסר |

---

## עקרונות מפתח
- "כל פינוק ושתייה יוצאים רק עם QR מתועד. שום שתייה לא יוצאת בלי לוג."
- כל באג שנוצר בקוד — נוצר על ידי קלוד בלבד. נימרוד לא נוגע בקוד ללא קלוד.
- כל שינוי בקובץ אחד — לבדוק אם צריך עדכון בכל שאר קבצי ה-HTML.
- כל פיצ'ר מלא ועשיר — UX מתקדם, הגדרות גמישות, פיצ'רים נוספים.
