# 🎸 Radio E.P.G.B — סיכום פרויקט
> עדכון אחרון: 21 אפריל 2026

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
| event.html?id=xxx | דף אירוע + כרטיסים דינמיים + sold-out + drawer | ✅ |
| ticket-purchase.html | רכישת כרטיס + בדיקת זמינות לפני תשלום | ✅ |
| drinks.html | שתייה בבר — תוקף עד 8:00 למחרת | ✅ |
| success.html | כרטיסים + QR הדרגתי + WhatsApp + מייל | ✅ |
| scan.html | סריקה — localStorage session, מצלמה רגילה עובדת | ⚠️ חלקי |
| staff.html | PIN + תפריט הרשאות + קרדיט מ-DB + כפתור דף הבית | ✅ |
| gift.html | פינוק + הצטרפות מועדון + יומולדת חובה + כפתור דף הבית | ✅ |
| admin.html | עובדים + אירועים + כרטיסים + קרדיטים + יומולדת | ✅ |
| reports.html | דוחות מלאים + כפתור דף הבית | ✅ |
| error.html | שגיאה | ✅ |

---

## Edge Functions

| פונקציה | תיאור |
|---------|--------|
| create-payment | יצירת תשלום Cardcom |
| payment-webhook | אישור תשלום + sold-out check + יצירת tickets + status paid ✅ |
| send-email | אימייל עיצוב EPGB דרך Resend — from: tickets@epgb.co.il ✅ |
| birthday-gifts | מתנות יומולדת אוטומטיות — cron 10:00 UTC = 12:00 IL |

---

## טבלאות Supabase

customers, events, orders, tickets, staff, gifts, drink_coupons, role_credits, staff_credits, credit_usage, birthday_settings, shift_reports, secret_links, **ticket_types**, **ticket_templates**

### ticket_types — שדות חדשים:
description, early_bird_price, early_bird_until, sale_start, sale_end, max_per_order, is_active, is_free, link_token, gender, sort_order

### ticket_templates — טבלה חדשה:
תבניות כרטיסים קבועות לשימוש חוזר

### Constraints שעודכנו:
- tickets.type: entry, drink, chaser, gift, beer ✅
- ticket_types.name: פתוח (הוסר constraint) ✅

---

## פיצ'רים שנבנו

### מערכת כרטיסים
- כרטיסים דינמיים לכל אירוע (לא BASIC/STANDARD/PREMIUM קבועים)
- תבניות קבועות — ניהול מלא + שיוך לאירוע בלחיצה
- שיוך תבנית לאירוע עם תאריכים אוטומטיים (Early Bird, פתיחה, סגירה)
- הגדרות ברירת מחדל לזמנים (localStorage)
- Drag & drop לסידור כרטיסים
- כפתור "שמור כתבנית" על כרטיס קיים
- כרטיס חינמי עם לינק ייחודי
- Early Bird — מחיר מוזל עד תאריך
- חלון מכירה — פתיחה וסגירה אוטומטית
- Sold-out check — 3 שכבות: event.html + ticket-purchase.html + payment-webhook
- "נותרו X כרטיסים" כשנשאר מעט (≤5)
- שליחה מחדש של כרטיסים ללקוח לפי טלפון
- שכפול אירוע עם כרטיסים

### ניהול אירועים (admin.html)
- טאב כרטיסים עם סרגל ניווט צדדי (4 סעיפים)
- מכירות לפי סוג כרטיס על כל אירוע בזמן אמת
- שכפול אירוע
- כפתור דף הבית בכל מסכי צוות

### מערכת כרטיסים כללית
- event → payment → success → QR
- QR הדרגתי ב-success.html
- WhatsApp + מייל אוטומטי אחרי רכישה
- localStorage session לאנשי צוות
- יומולדת אוטומטית + admin settings
- ולידציה מלאה (+972)
- דוחות מלאים

---

## בעיות פתוחות

1. **scan.html — סריקה real-time** — לא עובדת על Chrome iOS. פתרון זמני: מצלמת האייפון הרגילה → לינק → תיקוף אוטומטי ✅
2. **מועדון לקוחות** — חיפוש אוטומטי, Web Contacts API
3. **דוח משמרת**

---

## מה שנשאר לבנות

### עדיפות גבוהה
- מועדון לקוחות מפותח
- דוח משמרת

### עדיפות בינונית
- תזכורת WhatsApp יום לפני אירוע
- זיהוי VIP בסריקה
- scan.html real-time (Chrome iOS)

### עתידי
- סידור עבודה לצוות
- מערכת תקשורת פנימית
- מעקב מחירי ספקים
- שיווק אוטומטי (Make)
- Multi-tenant

---

## מערכת כרטיסים — סוגים

| סוג | מחיר | תוכן |
|-----|------|-------|
| BASIC | 50 | כניסה + צייסר |
| STANDARD | 100 | כניסה + 2 דרינקים + צייסר |
| PREMIUM | 150 | כניסה + 5 דרינקים + צייסר |
| DRINKS_STANDARD | 100 | 2 דרינקים + צייסר |
| DRINKS_PREMIUM | 150 | 5 דרינקים + צייסר |
| BEER_STANDARD | 100 | 3 בירה/יין/ערק + צייסר |
| BEER_PREMIUM | 150 | 6 בירה/יין/ערק + צייסר |
| כל שם חופשי | כל מחיר | לפי הגדרה בטאב כרטיסים |

---

## פיצ'רים לפיתוח במערכת כרטיסים (מחקר Getin/Tickchak/Selector/Eventer)
קוד קופון + לינק הנחה אוטומטי, לינק סוכן מכירות עם מעקב, ביטול/החזר, דשבורד כניסות real-time, ייצוא רשימת קונים

---

## עקרונות מפתח
- "כל פינוק ושתייה יוצאים רק עם QR מתועד. שום שתייה לא יוצאת בלי לוג."
- כל באג שנוצר בקוד — נוצר על ידי קלוד בלבד. נימרוד לא נוגע בקוד ללא קלוד.
- כל שינוי בקובץ אחד — לבדוק אם צריך עדכון בכל שאר קבצי ה-HTML.
- כל פיצ'ר מלא ועשיר — UX מתקדם, הגדרות גמישות, פיצ'רים נוספים.
