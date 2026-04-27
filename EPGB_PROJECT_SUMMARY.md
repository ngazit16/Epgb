# 🎸 Radio E.P.G.B — סיכום פרויקט
> עדכון אחרון: 27 אפריל 2026

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
| אימייל | Resend ✅ — from: tickets@epgb.co.il |

### Cardcom טסט
- Terminal: 1000 | User: CardTest1994 | Password: Terminaltest2026
- כרטיס: 4580280000000008 | תוקף: 10/2028 | CVV: 123 | ת.ז: 000000018

### Supabase
- Project Ref: qdgedsxhlcmgtrkxaxsu
- Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkZ2Vkc3hobGNtZ3Rya3hheHN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MTkxMTksImV4cCI6MjA5MTI5NTExOX0.RlXd13uq8tdq2ca4WpNOyfY4_tkPvgi0_bsqYFtFvl4

### Staff
- נימרוד: PIN 0000, role: admin

---

## Deploy

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

### Deploy Edge Function:
```powershell
npx supabase functions deploy [name] --project-ref qdgedsxhlcmgtrkxaxsu
```

### בדיקה חשובה:
```powershell
type success.html | findstr "workers.dev"
```

---

## דפי אתר

| דף | תיאור | סטטוס |
|----|--------|--------|
| index.html | לוגו + אירועים | ✅ |
| event.html?id=xxx | דף אירוע + כרטיסים + ?free= redirect | ✅ |
| ticket-purchase.html | רכישת כרטיס | ✅ |
| drinks.html | שתייה בבר | ✅ |
| success.html | כרטיסים + QR הדרגתי | ✅ |
| scan.html | PIN פעם ביום + html5-qrcode + מצלמה רגילה | ⚠️ חלקי |
| staff.html | PIN + תפריט + חיפוש לקוח RPC + פינוק | ✅ |
| gift.html | פינוק + מועדון + שם + יומולדת + QR | ✅ |
| admin.html | ניהול מלא + אירוע חי + יומולדת | ✅ |
| customers.html | מועדון לקוחות מלא + הזמנה לאירוע | ✅ |
| free-ticket.html | כרטיסים חינמיים עם מכסה + זיהוי חבר | ✅ |
| unsubscribe.html | הסרה מרשימת תפוצה | ✅ |
| reports.html | דוחות | ✅ |
| error.html | שגיאה | ✅ |

---

## Edge Functions

| פונקציה | תיאור |
|---------|--------|
| create-payment | יצירת תשלום Cardcom |
| payment-webhook | אישור תשלום + sold-out + tickets + הצטרפות מועדון |
| send-email | אימייל דרך Resend |
| birthday-gifts | מתנות יומולדת — cron 10:00 UTC |

---

## מועדון לקוחות

- **2,489 לקוחות** מ-Eventer ✅
- **customers.html** — רשימה, חיפוש, סינון 5 ממדים, WA המוני, הזמנה לאירוע, ייצוא CSV ✅
- **search_customers(q)** — RPC לחיפוש עברית ✅
- **free-ticket.html** — כרטיסים חינמיים עם מכסה + זיהוי חבר מועדון ✅
- **unsubscribe.html** — הסרה מרשימת תפוצה ✅
- **ניחוש מגדר** — SQL guess_gender.sql הורץ, תוצאות ממתינות בשיחה חדשה

---

## נרמול טלפון

- **DB**: Trigger normalize_phone() — כל מספר → 05XXXXXXXX
- **קוד**: toWAPhone() בכל הקבצים → 972XXXXXXXX לפני WA
- Policies: anon_insert_orders ✅, anon_insert_tickets ✅, anon_read/insert/update gifts ✅

---

## Scan — סטטוס

- ✅ PIN פעם ביום (localStorage עם תאריך)
- ✅ html5-qrcode 2.3.8 מ-cdnjs — cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js
- ✅ סריקה עובדת דרך מצלמה רגילה → scan.html?token=UUID → PIN → תיקוף
- ⚠️ html5-qrcode כפתור לא עובד על iOS
- **הצלחה היסטורית 25.4.2026** — סריקה ראשונה אחרי שבועיים!

---

## בעיות פתוחות

1. **scan.html** — html5-qrcode לא עובד על iOS
2. **מגדר לקוחות** — SQL הורץ, לאמת תוצאות בשיחה חדשה
3. **דוח משמרת** — לא נבנה

---

## משימות עתידיות

### עדיפות גבוהה
- אירוע חי — שליחת פינוק לפי פילטרים (מגדר, גיל, שעת הגעה רבעי שעה, סוג כרטיס, מימש/לא)
- unsubscribe בכל הודעה שיווקית (קיים בפינוק, צריך ב-WA המוני)

### עדיפות בינונית
- דוח משמרת
- תזכורת WA יום לפני אירוע
- Win-back "לא ראינו אותך"
- זיהוי VIP בסריקה + התראה לצוות

### עתידי
- נגישות חוקית (תקן 5568 + WCAG)
- אבטחה מלאה
- SEO + שיווק + Make
- סידור עבודה לצוות

---

## עקרונות מפתח
- נימרוד לא נוגע בקוד — Claude בלבד
- "..." או "ץץץ" = בוצע, שמור בזיכרון
- כל שינוי בקובץ → לבדוק ripple effects
- toWAPhone() בכל שליחת WA
- עבודה שלב-שלב, נימרוד מאשר כל שלב
