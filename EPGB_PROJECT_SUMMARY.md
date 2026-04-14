# 🎸 Radio E.P.G.B — סיכום פרויקט
> עדכון אחרון: 14 אפריל 2026

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
| Hosting | Cloudflare Pages |
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
- נימרוד: PIN 1234, role: admin

---

## דפי אתר (כולם עובדים)

| דף | תיאור |
|----|--------|
| index.html | לוגו קטן + אירועים מ-Supabase + כניסה לצוות |
| event.html?id=xxx | דף אירוע + drawer רכישת כרטיס + ולידציה מלאה |
| drinks.html | שתייה בבר — גלילה, תוקף עד 8:00 למחרת, ולידציה |
| success.html | כרטיסים + QR הדרגתי (entry חשוף, שאר נעולים + polling) |
| scan.html | סריקה fullscreen + בדיקת תוקף שתייה |
| staff.html | PIN + תפריט הרשאות + קרדיט מ-DB |
| gift.html | פינוק + הצטרפות מועדון + יומולדת חובה |
| admin.html | עובדים + אירועים + קרדיטים + טאב יומולדת |
| reports.html | דוחות יומי/תקופתי/אירועים/שעות/צוות |
| error.html | שגיאה |

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

---

## פיצ'רים שנבנו

- מערכת כרטיסים מלאה: event → payment → success → QR
- QR הדרגתי ב-success.html (entry פתוח, שאר נעולים + polling)
- WhatsApp אוטומטי אחרי רכישה
- אימייל אחרי רכישה דרך Resend
- drinks.html — תוקף 8:00 בבוקר
- scan.html — בדיקת expires_at
- יומולדת אוטומטית — cron יומי + admin settings (מתנה/מגדר/תקופה/מקסימום/אישור)
- gift.html — יומולדת חובה בהצטרפות מועדון
- admin.html — טאב יומולדת מלא
- ולידציה מלאה בכל הטפסים (+972 נתמך)
- reports.html — דוחות מלאים

---

## בעיות פתוחות

1. scan.html לא מגיב בטלפון — הQR מצביע ל-epgb.ngazit16.workers.dev/scan.html. לבדוק אם הדומיין פעיל — אם לא, לשנות ב-success.html ל-epgb.co.il/scan.html
2. Resend domain — לאמת DNS ולעדכן send-email ל-noreply@epgb.co.il

---

## מה שנשאר לבנות

### עדיפות גבוהה
- תיקון URL סריקה (workers.dev → epgb.co.il)
- אימות דומיין Resend
- מועדון לקוחות מפותח (חיפוש אוטומטי, Web Contacts API)
- דוח משמרת

### עדיפות בינונית
- תזכורת WhatsApp יום לפני אירוע
- זיהוי VIP בסריקה

### עתידי
- סידור עבודה לצוות
- מערכת תקשורת פנימית
- מעקב מחירי ספקים
- שיווק אוטומטי (Make)
- Multi-tenant (מכירה לעסקים אחרים)

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

## פקודות Git

```powershell
cd C:\Users\pc\Epgb
git add .
git commit -m "תיאור"
git push
```

## Deploy Edge Function

```powershell
npx supabase functions deploy birthday-gifts
npx supabase functions deploy send-email
npx supabase functions deploy payment-webhook
```

---

## עיקרון מפתח
"כל פינוק ושתייה יוצאים רק עם QR מתועד. שום שתייה לא יוצאת בלי לוג."

## עיקרון עיצוב
כל פיצ'ר מלא ועשיר — UX מתקדם, הגדרות גמישות, פיצ'רים נוספים שלא ביקשת מפורשות אבל קיימים באתרים מובילים.
