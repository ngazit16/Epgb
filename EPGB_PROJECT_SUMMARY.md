# 🎸 Radio E.P.G.B — סיכום פרויקט
> עדכון אחרון: 17 אפריל 2026

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
| אימייל | Resend (דומיין epgb.co.il — בתהליך אימות DNS) |

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
| success.html | כרטיסים + QR הדרגתי | ✅ |
| scan.html | סריקה — כפתור פותח מצלמה | ⚠️ חלקי |
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
| send-email | אימייל עיצוב EPGB דרך Resend |
| birthday-gifts | מתנות יומולדת אוטומטיות — cron 10:00 UTC = 12:00 IL |

---

## טבלאות Supabase

customers, events, orders (email_sent), tickets (expires_at), staff, gifts (status), drink_coupons, role_credits, staff_credits, credit_usage, birthday_settings, shift_reports, secret_links

### Constraints שעודכנו:
- tickets.type: entry, drink, chaser, gift, beer ✅

---

## פיצ'רים שנבנו

- מערכת כרטיסים מלאה: event → payment → success → QR
- QR הדרגתי ב-success.html (entry פתוח, שאר נעולים + polling)
- WhatsApp אוטומטי אחרי רכישה
- אימייל אחרי רכישה דרך Resend
- drinks.html — תוקף 8:00 בבוקר
- scan.html — בדיקת expires_at
- יומולדת אוטומטית — cron יומי + admin settings
- gift.html — יומולדת חובה בהצטרפות מועדון
- admin.html — טאב יומולדת מלא
- ולידציה מלאה בכל הטפסים (+972 נתמך)
- reports.html — דוחות מלאים

---

## בעיות פתוחות

1. **scan.html** — הכפתור פותח מצלמה אבל jsQR לא מגיב לתמונה. פתרון זמני: מצלמה רגילה של האייפון סורקת QR → מוביל ל-epgb.co.il/scan.html?token=... → PIN → תיקוף אוטומטי ✅
2. **success.html** — WhatsApp נפתח וגורם לברקודים להיעלם
3. **success.html** — "כרטיס לא נמצא" בהודעת WhatsApp
4. **Resend** — לאמת DNS ולעדכן send-email ל-noreply@epgb.co.il

---

## מה שנשאר לבנות

### עדיפות גבוהה
- תיקון סריקה ישירה ב-scan.html (html5-qrcode לא עובד על iOS Chrome)
- אימות דומיין Resend
- מועדון לקוחות מפותח (חיפוש אוטומטי, Web Contacts API)
- דוח משמרת

### עדיפות בינונית
- תזכורת WhatsApp יום לפני אירוע
- זיהוי VIP בסריקה
- תיקון WhatsApp ב-success.html

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

## Deploy Edge Function

```powershell
npx supabase functions deploy birthday-gifts
npx supabase functions deploy send-email
npx supabase functions deploy payment-webhook
```

---

## עקרונות מפתח
- "כל פינוק ושתייה יוצאים רק עם QR מתועד. שום שתייה לא יוצאת בלי לוג."
- כל באג שנוצר בקוד — נוצר על ידי קלוד בלבד. נימרוד לא נוגע בקוד ללא קלוד.
- כל פיצ'ר מלא ועשיר — UX מתקדם, הגדרות גמישות, פיצ'רים נוספים.
