# 🎸 Radio E.P.G.B — סיכום פרויקט
> עדכון אחרון: 12 אפריל 2026 — שיחה 3

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
| דומיין רשמי | epgb.co.il (מחובר, ממתין להתפשטות DNS) |
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
- `ticket-purchase.html` — דף רכישה 3 שלבים + זיהוי לקוח חוזר ✅
- `admin.html` — פאנל ניהול (login: nimrod/epgb2024) ✅
- `scan.html` — דף סריקה fullscreen לצוות ✅
- `success.html` — דף כרטיסים עם פתיחה בלחיצה ✅
- `error.html` — דף שגיאה ✅

### מערכת כרטיסים — עובדת במלואה ✅
- רכישה → תשלום Cardcom → יצירת tickets עם QR
- QR מכיל URL מלא: `scan.html?token=UUID`
- מניעת כרטיסים כפולים (בדיקה לפני יצירה)

### success.html — חוויית כרטיס
- כל כרטיס/קופון מוצג סגור עם אייקון צבעוני
- לחיצה → נפתח QR גדול (220px) + זמזום
- רק קופון אחד פתוח בכל פעם
- אחרי סריקה → מוצג כ"נוצל" עם חותמת אפורה

### scan.html — סריקה לצוות
- מצלמה נפתחת **fullscreen** על כל המסך
- מסגרת סריקה גדולה עם קו אדום נע
- **תקף** → flash ירוק שנייה + ✅ ענק כרקע + שם לקוח + סוג + שעת מימוש
- **נוצל** → flash אדום 1.5 שניות + ⛔ ענק כרקע + תאריך/שעת מימוש המקורי
- **לא תקף** → flash אדום + ❌ ענק כרקע
- בדיקת תוקף — כרטיס תקף עד 8:00 למחרת האירוע
- סטטיסטיקות בזמן אמת (כניסות/דרינקים/צייסרים)
- מצב ידני — הכנסת token ידנית

### פאנל ניהול (admin.html)
- יצירת אירוע + לינק לשיתוף ✅
- עריכת אירוע (שם, תאריך, תמונה, מלל חופשי) ✅
- שכפול אירוע ✅
- מחיקה עם אישור כפול ✅
- כפתור 🔗 לפתיחת לינק + 📤 WhatsApp ✅
- פינוקים ידניים ללקוחות ✅
- ניהול צוות ✅
- דוחות מכירות ✅

### Supabase Edge Functions
- `create-payment` — יוצר תשלום Cardcom ✅

### טבלאות Supabase (11)
customers, events, ticket_types, orders, tickets, staff, drink_coupons, drink_scans, gifts, secret_links, shift_reports

- טבלת `events` יש עמודות: id, title, title_en, **date**, start_time, description, image_url
- טבלת `tickets` יש עמודת `event_date` (נוספה 12/04/2026)

---

## 🎫 מחירי כרטיסים
| סוג | מחיר | תוכן |
|-----|------|-------|
| BASIC | ₪50 | כניסה + צייסר |
| STANDARD ⭐ | ₪100 | כניסה + 2 דרינקים + צייסר |
| PREMIUM | ₪150 | כניסה + 5 דרינקים + צייסר |

---

## 🌐 דומיין epgb.co.il
- נרכש ב-Box.co.il ✅
- Nameservers הוחלפו ל-Cloudflare: `arvind.ns.cloudflare.com` + `mallory.ns.cloudflare.com` ✅
- DNS Records ב-Cloudflare: CNAME @ + www → epgb.ngazit16.workers.dev ✅
- Custom domain מחובר ב-Cloudflare Workers ✅
- ממתין להתפשטות DNS (עד 24 שעות) ⏳

---

## 🚧 מה שנשאר

### עדיפות גבוהה
- [ ] בדיקה שepgb.co.il עלה (DNS propagation)
- [ ] שליחת כרטיסים באימייל
- [ ] מתנת יומולדת אוטומטית

### עדיפות בינונית
- [ ] שיפור עיצוב כל הדפים
- [ ] WhatsApp/SMS דרך Make
- [ ] שיווק אוטומטי

### רעיונות עתידיים
- [ ] זיהוי לקוח (סלפי) להצגה לברמן
- [ ] סידור עבודה לצוות
- [ ] מערכת תקשורת פנימית
- [ ] דוח סגירת משמרת יומי
- [ ] מעקב מחירי ספקים אוטומטי

---

## 📋 פקודות שימושיות

```powershell
# Git (PowerShell — כל פקודה בנפרד!)
cd C:\Users\pc\Epgb
git add .
git commit -m "תיאור"
git push

# אם נדחה
git pull --rebase
git push

# אם יש conflict
git rebase --abort
git push origin main --force
```

---

## 🎨 סגנון עיצוב
- **צבעים:** שחור #050403 · אדום #c41a1a · קרם #d8d0c0
- **פונטים:** Bebas Neue · Special Elite · Frank Ruhl Libre
- **אווירה:** CBGB גראנג'י, רטרו underground TLV
