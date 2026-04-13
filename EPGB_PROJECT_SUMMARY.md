# 🎸 Radio E.P.G.B — סיכום פרויקט
> עדכון אחרון: 13 אפריל 2026 — שיחה 5

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
| אימייל | Resend (דומיין epgb.co.il — בתהליך אימות DNS) |

### Cardcom טסט
- Terminal: 1000 | User: CardTest1994 | Password: Terminaltest2026
- כרטיס: `4580280000000008` | תוקף: 10/2028 | CVV: 123 | ת.ז: 000000018

### Supabase
- Project Ref: `qdgedsxhlcmgtrkxaxsu`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkZ2Vkc3hobGNtZ3Rya3hheHN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MTkxMTksImV4cCI6MjA5MTI5NTExOX0.RlXd13uq8tdq2ca4WpNOyfY4_tkPvgi0_bsqYFtFvl4`

### Resend
- חשבון: radioepgb2@gmail.com
- API Key שמור ב-Supabase Secrets: `RESEND_API_KEY`
- כשהדומיין יאומת — לעדכן `send-email/index.ts` לשלוח מ-`noreply@epgb.co.il`

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
| `success.html` | כרטיסים עם QR + שליחת אימייל | ✅ |
| `scan.html` | סריקה fullscreen לצוות | ✅ |
| `staff.html` | פורטל צוות עם PIN + הרשאות | ✅ |
| `gift.html` | פינוק ללקוח + הצטרפות מועדון | ✅ |
| `admin.html` | ניהול עובדים + אירועים + קרדיטים | ✅ |
| `error.html` | דף שגיאה | ✅ |

### Edge Functions
| פונקציה | תיאור | סטטוס |
|---------|--------|--------|
| `create-payment` | יצירת תשלום Cardcom | ✅ |
| `payment-webhook` | אישור תשלום + יצירת tickets | ✅ |
| `send-email` | שליחת אימייל עם עיצוב EPGB דרך Resend | ✅ |

### טבלאות Supabase
| טבלה | תיאור |
|------|--------|
| `customers` | לקוחות + מועדון |
| `events` | אירועים |
| `orders` | הזמנות (+ עמודת email_sent) |
| `tickets` | QR codes |
| `staff` | עובדים + PIN + תפקיד |
| `gifts` | פינוקים |
| `drink_coupons` | קופונים לשתייה |
| `role_credits` | קרדיט לפי תפקיד |
| `staff_credits` | קרדיט override לעובד ספציפי |
| `credit_usage` | לוג שימוש בקרדיט |

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
- תפקידים: Admin, מנהל משמרת, מנהל אירועים, ברמן, יחצן, דיגי
- שליחת פינוקים (כניסה/דרינק/צייסר/בירה) עם WhatsApp
- מצב אישור — ברירת מחדל שולח לבד / נימרוד מאשר
- ממתינים לאישור מוצגים ל-Admin

### admin.html
- ניהול עובדים: הוסף / ערוך / השבת / מחק
- ניהול אירועים: הוסף / ערוך / פרסם / מחק
- קרדיטים: לפי תפקיד + override לעובד ספציפי
  - סוגים: כניסות / דרינקים / צייסרים / בירה
  - איפוס: משמרת / שבוע / חודש / ידני
  - אישור: ללא / Admin / מנהל משמרת

### מועדון לקוחות (gift.html)
- לקוח מקבל WhatsApp עם לינק לפינוק
- חייב להצטרף למועדון לפני פתיחת QR
- חבר קיים — פותח ישר
- הסכמה שיווקית חוקית עם אפשרות ביטול

### אימייל (success.html + send-email)
- נשלח אוטומטית אחרי רכישה
- כולל: שם לקוח, סוג כרטיס, מחיר, פרטי אירוע, לינק לכרטיס, חוקי כניסה
- עיצוב EPGB מלא (שחור/אדום/קרם)
- נשלח פעם אחת בלבד (email_sent flag)

---

## ⚠️ צ'קליסט — הוספת סוג כרטיס חדש

```sql
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_ticket_type_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_gender_check;
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_type_check;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_gender_check;
```

ואז לעדכן ב:
1. `success.html` — יצירת tickets + order_types + QR_LABELS + TICKET_LABELS
2. `scan.html` — TYPE_NAMES
3. `drinks.html` — PKG_CONFIG
4. `index.html` — סקשן המחירים

---

## 🚧 מה שנשאר לבנות

### עדיפות גבוהה
- [ ] **חיבור קרדיט ל-staff.html** — עובד רואה כמה קרדיט נשאר לו + בדיקה לפני שליחה
- [ ] **דוח משמרת** — סיכום יומי אוטומטי

### עדיפות בינונית
- [ ] **יומולדת אוטומטית** — מתנה ללקוחות ביומהולדת
- [ ] **תזכורת WhatsApp** — יום לפני האירוע
- [ ] **זיהוי VIP בסריקה** — מוצג לברמן
- [ ] **לינק לצוות בפוטר** — כניסה ל-staff.html מהאתר
- [ ] **עדכון send-email** — לשלוח מ-noreply@epgb.co.il אחרי אימות דומיין

### עתידי
- [ ] סידור עבודה לצוות
- [ ] מערכת תקשורת פנימית
- [ ] מעקב מחירי ספקים
- [ ] שיווק אוטומטי
- [ ] מועדון לקוחות מפותח (חיפוש אוטומטי, Web Contacts API, מילוי אוטומטי)

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

## 📋 Deploy Edge Function
```powershell
cd C:\Users\pc\Epgb
npx supabase functions deploy send-email
npx supabase functions deploy payment-webhook
```

---

## 🎨 סגנון
- **צבעים:** שחור #050403 · אדום #c41a1a · קרם #d8d0c0
- **פונטים:** Bebas Neue · Special Elite · Frank Ruhl Libre
