# 🎸 Radio E.P.G.B — סיכום פרויקט
> עדכון אחרון: 12 אפריל 2026 — שיחה 4

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
| תשלומים | Cardcom LowProfile — פרמטר: **SumToBill** |
| Hosting | Cloudflare Pages (Workers) |
| דומיין זמני | epgb.ngazit16.workers.dev |
| דומיין רשמי | epgb.co.il ✅ פעיל! |
| GitHub | ngazit16/Epgb |

### Cardcom טסט
- Terminal: 1000 | User: CardTest1994 | Password: Terminaltest2026
- כרטיס טסט: `4580280000000008` | תוקף: 10/2028 | CVV: 123 | ת.ז: 000000018

### Supabase
- Project Ref: `qdgedsxhlcmgtrkxaxsu`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkZ2Vkc3hobGNtZ3Rya3hheHN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MTkxMTksImV4cCI6MjA5MTI5NTExOX0.RlXd13uq8tdq2ca4WpNOyfY4_tkPvgi0_bsqYFtFvl4`

### Staff
- נימרוד: PIN `1234`, role: admin

---

## ✅ מה שנבנה ועובד

### דפי אתר
- `index.html` — דף ראשי גראנג'י ✅
- `ticket-purchase.html` — דף רכישה כרטיסי כניסה ✅
- `drinks.html` — דף רכישת שתייה לאנשים שכבר בפנים ✅
- `admin.html` — פאנל ניהול ✅
- `scan.html` — דף סריקה fullscreen לצוות ✅
- `success.html` — דף כרטיסים עם פתיחה בלחיצה ✅
- `error.html` — דף שגיאה ✅

### חבילות כרטיסים
| סוג | מחיר | תוכן |
|-----|------|-------|
| BASIC | ₪50 | כניסה + צייסר |
| STANDARD ⭐ | ₪100 | כניסה + 2 דרינקים + צייסר |
| PREMIUM | ₪150 | כניסה + 5 דרינקים + צייסר |
| DRINKS_STANDARD | ₪100 | 2 דרינקים + צייסר (בלי כניסה) |
| DRINKS_PREMIUM | ₪150 | 5 דרינקים + צייסר (בלי כניסה) |
| BEER_STANDARD | ₪100 | 3 בירה/יין/ערק + צייסר (בלי כניסה) |
| BEER_PREMIUM | ₪150 | 6 בירה/יין/ערק + צייסר (בלי כניסה) |

### scan.html
- מצלמה fullscreen
- flash ירוק שנייה (תקף) / אדום 1.5 שניות (נוצל/לא תקף)
- תאריך ושעת מימוש
- בדיקת תוקף עד 8:00 למחרת (לא ל-drinks/general)

---

## ⚠️ צ'קליסט — הוספת סוג כרטיס חדש

בכל פעם שמוסיפים סוג חדש — לעדכן ב-5 מקומות:

**1. Supabase SQL:**
```sql
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_ticket_type_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_gender_check;
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_type_check;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_gender_check;
```

**2. success.html:**
- הוסף לפונקציה `confirmPaymentAndCreateTickets`
- הוסף למערך `order_types`
- הוסף לאובייקט `QR_LABELS`

**3. scan.html:**
- הוסף לאובייקט `TYPE_NAMES`
- הוסף לתנאי דילוג תוקף אם event_id לא UUID

**4. drinks.html:** שלח ישירות ל-`create-payment`

**5. בדיקה:** סרוק token ידנית לפני שמסיימים

---

## 🌐 דומיין
- `epgb.co.il` ✅ פעיל!
- Nameservers: `arvind.ns.cloudflare.com` + `mallory.ns.cloudflare.com`

---

## 🚧 מה שנשאר
- [ ] שליחת כרטיסים באימייל
- [ ] מתנת יומולדת אוטומטית
- [ ] שיפור עיצוב
- [ ] WhatsApp/SMS
- [ ] זיהוי לקוח (סלפי)

---

## 📋 פקודות Git (PowerShell)
```powershell
cd C:\Users\pc\Epgb
git add .
git commit -m "תיאור"
git push

# אם נדחה:
git pull --rebase
git push

# אם conflict:
git rebase --abort
git push origin main --force
```

---

## 🎨 סגנון
- **צבעים:** שחור #050403 · אדום #c41a1a · קרם #d8d0c0
- **פונטים:** Bebas Neue · Special Elite · Frank Ruhl Libre
