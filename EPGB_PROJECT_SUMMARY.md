# 🎸 Radio E.P.G.B — סיכום פרויקט
> עדכון אחרון: 22 אפריל 2026

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
| scan.html | סריקה — PIN צוות, מצלמה רגילה עובדת זמנית | ⚠️ חלקי |
| staff.html | PIN + תפריט הרשאות + קרדיט + חיפוש לקוח | ✅ |
| gift.html | פינוק + הצטרפות מועדון + יומולדת + שם + QR | ✅ |
| admin.html | עובדים + אירועים + כרטיסים + קרדיטים + יומולדת + אירוע חי | ✅ |
| customers.html | מועדון לקוחות מלא — חיפוש, סינון, WA המוני, ייצוא | ✅ |
| reports.html | דוחות מלאים | ✅ |
| error.html | שגיאה | ✅ |

---

## Edge Functions

| פונקציה | תיאור |
|---------|--------|
| create-payment | יצירת תשלום Cardcom |
| payment-webhook | אישור תשלום + sold-out check + יצירת tickets + status paid ✅ + הצטרפות אוטומטית למועדון |
| send-email | אימייל עיצוב EPGB דרך Resend — from: tickets@epgb.co.il ✅ |
| birthday-gifts | מתנות יומולדת אוטומטיות — cron 10:00 UTC = 12:00 IL |

---

## טבלאות Supabase

customers, events, orders, tickets, staff, gifts, drink_coupons, role_credits, staff_credits, credit_usage, birthday_settings, shift_reports, secret_links, ticket_types, ticket_templates

### customers — שדות חשובים:
id, name, email, phone, gender, visit_count, is_vip, birthday, notes, tags,
imported_from, marketing_consent, consent_date, is_club_member, club_join_date, **is_blocked**

### Supabase Functions:
- **search_customers(q text)** — RPC לחיפוש לקוח לפי שם/טלפון (מטפל בעברית)
- **normalize_phone()** — Trigger אוטומטי שמנרמל כל טלפון חדש ל-05XXXXXXXX

### Policies:
- customers: anon_read, anon_insert, anon_update ✅
- gifts: anon_read, anon_insert, anon_update ✅

---

## מועדון לקוחות — סטטוס

- **2,489 לקוחות** יובאו מ-Eventer ✅
- כולם: marketing_consent=true, is_club_member=true
- **customers.html** — דף ניהול מלא ✅
  - רשימה עם pagination (טעינת כולם)
  - חיפוש + 5 פילטרים
  - בחירה מרובה + WA המוני עם {שם}
  - פרופיל: עריכה / היסטוריה / פעולות
  - הוספת לקוח / חסימה / מחיקה
  - ייצוא CSV
- **staff.html** — חיפוש לקוח live דרך RPC ✅
- **gift.html** — הצטרפות אוטומטית בקבלת פינוק + שם + יומולדת ✅
- **payment-webhook** — הצטרפות אוטומטית בכל רכישה ✅

---

## נרמול טלפון

- **DB**: Trigger normalize_phone() — כל מספר נשמר כ-05XXXXXXXX
- **קוד**: פונקציה toWAPhone() בכל הקבצים — ממירה כל פורמט ל-972XXXXXXXX לפני WA
- פורמטים שנתמכים: 05X, +972X, 972X, 5X

---

## בעיות פתוחות

1. **scan.html — סריקה real-time** לא עובדת על Chrome iOS
   - פתרון זמני: מצלמה רגילה → לינק → scan.html?token=UUID → דורש PIN
   - ⚠️ **בעיית אבטחה**: כרגע מי שמביא את הלינק יכול לתקף בלי PIN
   - מטרה: html5-qrcode + jsQR כמו commit 0e68d0c
   - קבצים לבדוק: scan_old_working.html, scan_working.html

2. **admin יומולדת** — שגיאת טעינה (query birthday)

3. **admin טאב חי** — אירועים לא נטענים

---

## משימות עתידיות

### עדיפות גבוהה
- תיקון scan.html — סריקה אמיתית עם PIN
- תיקון טאב חי + יומולדת ב-admin
- unsubscribe אוטומטי בכל הודעה שיווקית
- דף/תהליך חזרה למועדון אחרי הסרה

### עדיפות בינונית
- דוח משמרת
- תזכורת WA יום לפני אירוע
- WA "תודה שבאת" + בקשת דירוג גוגל
- Win-back: "לא ראינו אותך" + הצעה מיוחדת
- זיהוי VIP בסריקה + התראה לצוות
- לינק סוכן מכירות עם מעקב

### עתידי
- נגישות חוקית (תקן 5568 + WCAG)
- אבטחה: RLS מלא, rate limiting
- שיווק וקידום: SEO, Make, Instagram
- סידור עבודה לצוות
- מערכת תקשורת פנימית
- מעקב מחירי ספקים
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

## עקרונות מפתח
- "כל פינוק ושתייה יוצאים רק עם QR מתועד. שום שתייה לא יוצאת בלי לוג."
- כל באג שנוצר בקוד — נוצר על ידי קלוד בלבד. נימרוד לא נוגע בקוד ללא קלוד.
- כל שינוי בקובץ אחד — לבדוק אם צריך עדכון בכל שאר קבצי ה-HTML.
- כל פיצ'ר מלא ועשיר — UX מתקדם, הגדרות גמישות, פיצ'רים נוספים.
- כשנימרוד כותב "..." או "ץץץ" — בוצע, שמור בזיכרון.
