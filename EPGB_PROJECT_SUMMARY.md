# 🎸 Radio E.P.G.B — סיכום פרויקט
> עדכון אחרון: 12 אפריל 2026 — שיחה 4 (סוף יום)

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
| Hosting | Cloudflare Workers |
| דומיין | epgb.co.il ✅ פעיל |
| GitHub | ngazit16/Epgb |

### Cardcom טסט
- Terminal: 1000 | User: CardTest1994 | Password: Terminaltest2026
- כרטיס: `4580280000000008` | תוקף: 10/2028 | CVV: 123 | ת.ז: 000000018

### Supabase
- Project Ref: `qdgedsxhlcmgtrkxaxsu`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkZ2Vkc3hobGNtZ3Rya3hheHN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MTkxMTksImV4cCI6MjA5MTI5NTExOX0.RlXd13uq8tdq2ca4WpNOyfY4_tkPvgi0_bsqYFtFvl4`

### Staff
- נימרוד: PIN `1234`, role: admin

---

## ✅ מה שנבנה ועובד

### דפי אתר
| דף | תיאור | סטטוס |
|----|--------|--------|
| `index.html` | דף ראשי + כרטיסים + שתייה | ✅ |
| `ticket-purchase.html` | רכישת כרטיסי כניסה | ✅ |
| `drinks.html` | רכישת שתייה לאנשים בפנים | ✅ |
| `success.html` | כרטיסים עם QR פתיחה בלחיצה | ✅ |
| `scan.html` | סריקה fullscreen לצוות | ✅ |
| `staff.html` | פורטל צוות עם PIN + הרשאות | ✅ |
| `gift.html` | פינוק ללקוח + הצטרפות מועדון | ✅ |
| `admin.html` | ניהול אירועים | ✅ |
| `error.html` | דף שגיאה | ✅ |

### חבילות כרטיסים
| סוג | מחיר | תוכן |
|-----|------|-------|
| BASIC | ₪50 | כניסה + צייסר |
| STANDARD | ₪100 | כניסה + 2 דרינקים + צייסר |
| PREMIUM | ₪150 | כניסה + 5 דרינקים + צייסר |
| DRINKS_STANDARD | ₪100 | 2 דרינקים + צייסר |
| DRINKS_PREMIUM | ₪150 | 5 דרינקים + צייסר |
| BEER_STANDARD | ₪100 | 3 בירה/יין/ערק + צייסר |
| BEER_PREMIUM | ₪150 | 6 בירה/יין/ערק + צייסר |

### מערכת צוות (staff.html)
- כניסה עם PIN — תפריט לפי הרשאות
- תפקידים: Admin, מנהל משמרת, ברמן, יחצן, דיגי
- שליחת פינוקים (כניסה/דרינק/צייסר/בירה) עם WhatsApp
- מצב אישור — ברירת מחדל שולח לבד / נימרוד מאשר
- ממתינים לאישור מוצגים ל-Admin

### מועדון לקוחות (gift.html)
- לקוח מקבל WhatsApp עם לינק לפינוק
- חייב להצטרף למועדון (צ'קבוקס הסכמה) לפני פתיחת QR
- חבר קיים — פותח ישר בלי הסכמה מחדש
- הסכמה שיווקית חוקית עם אפשרות ביטול

### scan.html
- Fullscreen מצלמה
- Flash ירוק שנייה (תקף) / אדום 1.5 שניות (נוצל/לא תקף)
- תאריך ושעת מימוש
- תומך: כרטיסי כניסה, דרינקים, בירה, gift tickets

---

## ⚠️ צ'קליסט — הוספת סוג כרטיס חדש

```sql
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_ticket_type_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_gender_check;
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_type_check;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_gender_check;
```

ואז לעדכן ב:
1. `success.html` — יצירת tickets + order_types + QR_LABELS
2. `scan.html` — TYPE_NAMES
3. `drinks.html` — PKG_CONFIG
4. `index.html` — סקשן המחירים

---

## 🚧 מה שנשאר לבנות

### עדיפות גבוהה
- [ ] **אימייל** — שליחת כרטיסים אחרי רכישה
- [ ] **ניהול עובדים** — הוספת/עריכת עובדים מ-admin.html
- [ ] **קרדיט לעובדים** — כמה פינוקים מותר לכל עובד
- [ ] **דוח משמרת** — סיכום יומי אוטומטי

### עדיפות בינונית
- [ ] **יומולדת אוטומטית** — מתנה ללקוחות ביומהולדת
- [ ] **תזכורת WhatsApp** — יום לפני האירוע
- [ ] **זיהוי VIP בסריקה** — מוצג לברמן
- [ ] **לינק לצוות בפוטר** — כניסה ל-staff.html מהאתר

### עתידי
- [ ] סידור עבודה לצוות
- [ ] מערכת תקשורת פנימית
- [ ] מעקב מחירי ספקים
- [ ] שיווק אוטומטי

---

## 📋 פקודות Git (PowerShell)
```powershell
cd C:\Users\pc\Epgb
git add .
git commit -m "תיאור"
git push

# conflict:
git rebase --abort
git push origin main --force
```

---

## 🎨 סגנון
- **צבעים:** שחור #050403 · אדום #c41a1a · קרם #d8d0c0
- **פונטים:** Bebas Neue · Special Elite · Frank Ruhl Libre
