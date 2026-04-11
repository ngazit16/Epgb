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
| Hosting | Netlify (סטטי בלבד — אין Functions) |
| דומיין | epgb.co.il |
| GitHub | ngazit16/Epgb |
| האתר הנוכחי | radio-epgb.netlify.app |

### Cardcom פרטי טסט
- Terminal: 1000
- User: CardTest1994
- Password: Terminaltest2026
- API: LowProfile
- SuccessUrl: https://radio-epgb.netlify.app/success.html
- ErrorUrl: https://radio-epgb.netlify.app/error.html
- WebhookUrl: `https://qdgedsxhlcmgtrkxaxsu.supabase.co/functions/v1/payment-webhook`

### Supabase
- Project Ref: `qdgedsxhlcmgtrkxaxsu`
- Edge Functions URL: `https://qdgedsxhlcmgtrkxaxsu.supabase.co/functions/v1/`
- Anon Key: בדשבורד של Supabase → Settings → API

---

## ✅ מה שנעשה — היסטוריה

### אתר (index.html)
- דף ראשי מלא בסגנון CBGB גראנג'י שחור + אדום
- Ticker אנימציה בראש
- Hero section עם כותרת ענקית + flicker effect
- Grain texture כבד + scratch lines
- כתובת נכונה: שד"ל 7

### דף רכישה (ticket-purchase.html) ✅
- 3 שלבים: בחירת כרטיס → פרטים → תשלום
- **זיהוי לקוח חוזר לפי טלפון** — שלב 2 מתמלא אוטומטית
- לקוח חוזר קופץ ישר משלב 1 לשלב 3 (ללא הקלדה)
- מחירים: 50 / 100 / 150 ₪
- סגנון CBGB גראנג'י מלא
- קריאה ל-Supabase Edge Function

### Supabase Edge Functions ✅
- `supabase/functions/create-payment/index.ts` — יוצר תשלום Cardcom + שומר הזמנה
- `supabase/functions/payment-webhook/index.ts` — מקבל אישור + יוצר QR tokens + מעדכן לקוח
- Secrets מוגדרים ב-Supabase Dashboard
- **מחליפות את Netlify Functions לחלוטין** → אין מגבלת 125k/חודש

### טבלאות Supabase ✅ (11 טבלאות)
| טבלה | תוכן |
|------|-------|
| `customers` | לקוחות מועדון — טלפון, מגדר, ביקורים, VIP |
| `events` | אירועים — תאריך, שעה, תיאור |
| `ticket_types` | סוגי כרטיסים עם הגבלות מגדר |
| `orders` | הזמנות + פרטי Cardcom |
| `tickets` | QR codes לסריקה (entry/drink/chaser) |
| `staff` | צוות עם תפקידים + PIN |
| `drink_coupons` | קופוני דרינקים |
| `drink_scans` | לוג כל סריקה |
| `gifts` | מתנות + פינוקים ידניים |
| `secret_links` | לינקים סודיים ליחצנים |
| `shift_reports` | דוחות סגירת משמרת |

---

## 🎫 מחירי כרטיסים
| סוג | מחיר | תוכן |
|-----|------|-------|
| BASIC | ₪50 | כניסה + צייסר |
| STANDARD ⭐ | ₪100 | כניסה + 2 דרינקים + צייסר |
| PREMIUM | ₪150 | כניסה + 5 דרינקים + צייסר |

### QR שמופקים אחרי תשלום:
- **₪50** — QR כניסה + QR צייסר
- **₪100** — QR כניסה + 2× QR דרינק + QR צייסר
- **₪150** — QR כניסה + 5× QR דרינק + QR צייסר
- נשלחים: מסך + אימייל + WhatsApp/SMS

---

## 🚧 מה שנשאר לעשות

### עדיפות גבוהה
- [ ] כרטיסים מעוצבים עם QR אחרי תשלום
- [ ] שליחת כרטיסים באימייל אוטומטי
- [ ] שליחה ב-WhatsApp/SMS דרך Make
- [ ] דף סריקה לצוות (web-based)
- [ ] עדכון SUPABASE_URL + ANON_KEY בתוך ticket-purchase.html

### מערכת לקוחות
- [ ] מועדון לקוחות עם היסטוריה
- [ ] תמונת זיהוי ללקוח
- [ ] מתנת יומולדת אוטומטית
- [ ] פינוק ידני (דרינק/צייסר/מתנה) — QR קוד
- [ ] שיווק אוטומטי עם תקציב

### ניהול פנימי
- [ ] סידור עבודה לצוות
- [ ] מערכת תקשורת פנימית (סגנון Dex)
- [ ] דוח סגירת משמרת יומי
- [ ] מעקב מחירי ספקים שבועי אוטומטי

---

## 📋 פקודות שימושיות

### Git — שמירה ל-GitHub
```bash
cd C:\Users\pc\Epgb
git add .
git commit -m "תיאור השינוי"
git push
```

### Supabase — Deploy Edge Functions
```bash
cd C:\Users\pc\Epgb
supabase functions deploy create-payment --project-ref qdgedsxhlcmgtrkxaxsu
supabase functions deploy payment-webhook --project-ref qdgedsxhlcmgtrkxaxsu
```

### Git — אם נדחה (fetch first)
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
