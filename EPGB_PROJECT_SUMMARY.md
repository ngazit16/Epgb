# 🎸 Radio E.P.G.B — סיכום פרויקט
> עדכון אחרון: 11 אפריל 2026

---

## 📍 פרטי המקום
- **שם:** Radio E.P.G.B
- **בעלים:** נימרוד גזית
- **כתובת:** שד"ל 7, תל אביב
- **פעילות:** מאז 2009
- **סגנון:** גראנג'י, אינדי/אלטרנטיב, CBGB vibes
- **פתוח:** ימי שלישי עד שבת

---

## 💻 Stack טכני
| רכיב | כלי |
|------|-----|
| Backend/DB | Supabase |
| Edge Functions | Supabase Edge Functions (Deno) |
| תשלומים | Cardcom |
| אוטומציה | Make (Integromat) |
| Hosting | Cloudflare Pages (חינמי, ללא הגבלה) |
| דומיין זמני | epgb.ngazit16.workers.dev |
| דומיין קבוע | epgb.co.il (לחבר) |
| GitHub | ngazit16/Epgb |

### Cardcom פרטי טסט
- Terminal: 1000
- User: CardTest1994
- Password: Terminaltest2026
- API: LowProfile
- SuccessUrl: https://epgb.ngazit16.workers.dev/success.html
- ErrorUrl: https://epgb.ngazit16.workers.dev/error.html
- WebhookUrl: `https://qdgedsxhlcmgtrkxaxsu.supabase.co/functions/v1/payment-webhook`

### Supabase
- Project Ref: `qdgedsxhlcmgtrkxaxsu`
- Edge Functions URL: `https://qdgedsxhlcmgtrkxaxsu.supabase.co/functions/v1/`

---

## ✅ מה שנעשה

### אתר (index.html)
- דף ראשי מלא בסגנון CBGB גראנג'י שחור + אדום
- Ticker אנימציה + Hero section + flicker effect
- Grain texture כבד + scratch lines
- כתובת נכונה: שד"ל 7

### דף רכישה (ticket-purchase.html) ✅
- 3 שלבים: בחירת כרטיס → פרטים → תשלום
- זיהוי לקוח חוזר לפי טלפון — פרטים מתמלאים אוטומטית
- לקוח חוזר קופץ ישר משלב 1 לשלב 3
- מחירים: 50 / 100 / 150 ₪

### Supabase Edge Functions ✅
- `create-payment` — יוצר תשלום Cardcom + שומר הזמנה
- `payment-webhook` — מקבל אישור + יוצר QR tokens + מעדכן לקוח
- מחליפות את Netlify Functions → אין מגבלה

### טבלאות Supabase ✅ (11 טבלאות)
| טבלה | תוכן |
|------|-------|
| `customers` | לקוחות מועדון |
| `events` | אירועים |
| `ticket_types` | סוגי כרטיסים |
| `orders` | הזמנות + Cardcom |
| `tickets` | QR codes |
| `staff` | צוות + תפקידים |
| `drink_coupons` | קופוני דרינקים |
| `drink_scans` | לוג סריקות |
| `gifts` | מתנות + פינוקים |
| `secret_links` | לינקים ליחצנים |
| `shift_reports` | דוחות משמרת |

### Hosting ✅
- עבר מ-Netlify (הגיע ללימיט) → Cloudflare Pages
- חינמי לנצח, ללא הגבלת bandwidth
- מתעדכן אוטומטית מכל git push

---

## 🎫 מחירי כרטיסים
| סוג | מחיר | תוכן |
|-----|------|-------|
| BASIC | ₪50 | כניסה + צייסר |
| STANDARD ⭐ | ₪100 | כניסה + 2 דרינקים + צייסר |
| PREMIUM | ₪150 | כניסה + 5 דרינקים + צייסר |

---

## 🚧 מה שנשאר לעשות

### עדיפות גבוהה
- [ ] לחבר דומיין epgb.co.il ל-Cloudflare
- [ ] עדכון SUPABASE_URL + ANON_KEY ב-ticket-purchase.html
- [ ] עדכון SITE_URL ב-Supabase Secrets לכתובת החדשה
- [ ] כרטיסים מעוצבים עם QR אחרי תשלום
- [ ] שליחת כרטיסים באימייל אוטומטי
- [ ] שליחה ב-WhatsApp/SMS דרך Make
- [ ] דף סריקה לצוות (web-based)

### מערכת לקוחות
- [ ] מועדון לקוחות עם היסטוריה
- [ ] תמונת זיהוי ללקוח
- [ ] מתנת יומולדת אוטומטית
- [ ] פינוק ידני — QR קוד
- [ ] שיווק אוטומטי עם תקציב

### ניהול פנימי
- [ ] סידור עבודה לצוות
- [ ] מערכת תקשורת פנימית
- [ ] דוח סגירת משמרת יומי
- [ ] מעקב מחירי ספקים שבועי

---

## 📋 פקודות שימושיות

### Git
```bash
cd C:\Users\pc\Epgb
git add .
git commit -m "תיאור"
git push
```

### Supabase Edge Functions
```bash
cd C:\Users\pc\Epgb
supabase functions deploy create-payment --project-ref qdgedsxhlcmgtrkxaxsu
supabase functions deploy payment-webhook --project-ref qdgedsxhlcmgtrkxaxsu
```

### Git — אם נדחה
```bash
git pull --rebase
git push
```

---

## 🎨 סגנון עיצוב
- **צבעים:** שחור #050403 · אדום #c41a1a · קרם #d8d0c0
- **פונטים:** Bebas Neue · Special Elite · Frank Ruhl Libre
- **אווירה:** CBGB גראנג'י, רטרו underground TLV
- **Grain:** כבד מאוד + scratch lines + cursor crosshair
