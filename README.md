# Sales Dashboard / Leaderboard — START jamoasi

Sotuv jamoasi uchun vizual, interaktiv Sales Dashboard va Leaderboard tizimi.
Next.js 14 (App Router) + Tailwind CSS + Recharts + Supabase (auth, database, storage, realtime).

## 1. Supabase loyihasini sozlash

1. [supabase.com](https://supabase.com) da yangi loyiha yarating.
2. **SQL Editor** ga o'ting va ketma-ket ikkita faylni ishga tushiring:
   - `supabase/schema.sql` — jadvallar, RLS siyosatlari, trigger, realtime
   - `supabase/storage.sql` — fayl saqlash siyosatlari (avval quyidagi 3-qadamni bajaring)
3. **Storage** bo'limida ikkita **public** bucket yarating: `avatars` va `receipts`
   (keyin `storage.sql` ni ishga tushiring)
4. **Settings → API** dan `Project URL` va `anon public` kalitni oling
5. Loyiha ildizida `.env.local` fayl yarating (`.env.local.example` dan nusxa oling):

```bash
cp .env.local.example .env.local
```

Va ichiga o'z qiymatlaringizni yozing:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

6. Birinchi admin hisobini yarating — `scripts/README.md` faylidagi yo'riqnomaga amal qiling.

## 2. Ishga tushirish

```bash
npm install
npm run dev
```

Brauzerda oching: http://localhost:3000

## Loyiha strukturasi

```
app/
  layout.jsx                 — Root layout (AuthProvider + DataProvider)
  login/page.jsx              — Login sahifasi (Supabase Auth, email + parol)
  dashboard/
    layout.jsx                 — Himoyalangan shell: Sidebar + Topbar + live toast
    page.jsx                    — Asosiy dashboard
    new-sale/page.jsx           — Yangi sotuv (chek fayli Supabase Storage'ga yuklanadi)
    profile/page.jsx            — Profil sozlamalari (avatar yuklash)
    admin/
      operators/page.jsx         — Sotuvchilar boshqaruvi (yangi hisob yaratish)
      finance/page.jsx           — Moliya va Plan
      calendar/page.jsx          — Kalendar/Arxiv (haqiqiy sana bo'yicha filtr)
      invoices/page.jsx          — Invoices (real-time, tasdiqlash, chek ko'rish)

components/    — UI, layout, dashboard, admin komponentlari
context/
  AuthContext.jsx    — Supabase Auth bilan login/logout/profil
  DataContext.jsx     — Supabase'dan operators/invoices/tariffs, realtime obuna
lib/
  supabaseClient.js  — Supabase klient
  constants.js        — Ranglar, motivatsion iboralar
  format.js            — Raqam formatlash
hooks/
  useLiveSaleToasts.js — Realtime "INSERT" hodisalaridan live toast yaratadi
supabase/
  schema.sql   — Jadvallar, RLS, trigger, realtime yoqish
  storage.sql   — Fayl saqlash siyosatlari
scripts/
  README.md    — Birinchi admin hisobini yaratish yo'riqnomasi
```

- **Telegram bildirishnomasi** — yangi sotuv kiritilganda guruhga darhol
  xabar boradi (chek fayli ko'rsatilmaydi). Har kuni belgilangan vaqtda
  (odatda 23:50) kunlik hisobot yuboriladi. Sozlash: `scripts/TELEGRAM_SETUP.md`.

## Qanday ishlaydi

- **Autentifikatsiya** — Supabase Auth (email + parol). Yangi foydalanuvchi ro'yxatdan
  o'tganda `handle_new_user` trigger'i orqali avtomatik `profiles` qatori yaratiladi.
- **Ma'lumotlar** — barcha sotuvlar `sales` jadvalida saqlanadi, sana bilan birga —
  shuning uchun oy almashganda hech narsa "reset" qilinmaydi, faqat Kalendar/Arxiv
  filtri orqali istalgan oy ko'riladi.
- **Real-vaqt** — yangi sotuv qo'shilganda barcha ochiq sessiyalarda avtomatik
  Postgres Realtime orqali xabar keladi va live toast ko'rsatiladi.
- **Fayllar** — avatar va chek rasmlari Supabase Storage'da, public bucket'larda
  saqlanadi, RLS orqali har kim faqat o'z papkasiga yoza oladi.

## Xavfsizlik bo'yicha eslatmalar

1. **Operatorni to'liq o'chirish** (auth.users darajasida) uchun `service_role`
   kaliti kerak, bu brauzerda ishlatilmaydi. Hozirgi "O'chirish" tugmasi faqat
   profil qatorini o'chiradi. To'liq o'chirish kerak bo'lsa, buni server-side
   (Next.js API Route yoki Supabase Edge Function) orqali qo'shish tavsiya etiladi.
2. **Email tasdiqlash** — Supabase standart holatda yangi hisob uchun email
   tasdiqlashni talab qiladi. Ichki jamoa uchun buni **Authentication → Providers
   → Email → "Confirm email"** sozlamasidan o'chirib qo'yish mumkin.
3. `.env.local` faylini hech qachon Git'ga qo'shmang — `.gitignore` da allaqachon
   istisno qilingan.

## Joylashtirish (Deployment)

Ikkita variant bor:

**A) Vercel (eng oson, avtomatik)** — GitHub'ga push qilinganda avtomatik
qayta joylanadi. Tijorat foydalanish uchun Pro reja tavsiya etiladi.

**B) O'z VPS serveringiz (arzonroq, to'liq nazorat)** — to'liq qo'llanma:
`deploy/VPS_DEPLOYMENT.md`. Kerakli fayllar: `deploy/ecosystem.config.js`
(PM2), `deploy/nginx.conf.example`, `deploy/deploy.sh` (yangilanish skripti).

## Yangi funksiyalar (v3)

- **Bosqichli bonus tizimi** — oylik sotuvga qarab avtomatik: 0-10 mln = 4%,
  10-20 mln = 7%, 20 mln+ = 10%. Har bir operatorning "sotildi" ko'rsatkichi
  endi **faqat joriy oy** bo'yicha hisoblanadi (avval umr bo'yi yig'indi edi).
- **Operator hisobot sahifasi** (`/dashboard/report`) — qo'ng'iroq/lid
  kundaligi (qo'lda kiritiladi), kunlik sotuv va suhbat daqiqalari grafigi,
  o'rtacha suhbat davomiyligi, lidlar soni, konversiya foizi.
- **Tasklar tizimi** (`/dashboard/tasks` operator uchun,
  `/dashboard/admin/tasks` admin uchun) — admin xodimga vazifa tayinlaydi,
  xodim o'zi ham vazifa qo'sha oladi (masalan "10:00 da qo'ng'iroq qilish").
- **Jamoa logotipi** — barcha joyda (sidebar, login, avatar fallback)
  `public/deepai-logo.jpg` ishlatiladi. Avatar yuklamagan xodimlar uchun
  ham shu logotip ko'rinadi.
- **Ish vaqti taymeri** — operator kirganda avtomatik boshlanadi, pastki
  panelda ko'rinadi. 30 daqiqa harakatsizlikdan keyin avtomatik pauzaga
  o'tadi (qo'lda qayta ishga tushiriladi). Rang: 5 soatdan ko'p — yashil,
  4-5 soat — sariq, 4 soatdan kam — qizil. Yonida vaqt boshqaruvi
  maslahatlari va bugungi vazifalar o'ngdan chapga o'tib turadi.

Sozlash uchun: `supabase/migration_v3.sql` faylini SQL Editor'da ishga
tushiring (call_logs, tasks, work_sessions jadvallari va RLS siyosatlari).

## Tuzatishlar va yangi funksiyalar (v4)

1. **Sotuvchi ismi ko'rinmasligi** — tuzatildi. Endi Telegram/Google Sheets
   xabarlari uchun operator ma'lumoti to'g'ridan-to'g'ri bazadan yangilanib
   olinadi (eskirgan holatga tayanmaydi). Real-vaqt "yangi sotuv" popup'i
   ham operator ro'yxati hali yuklanmagan bo'lsa, keyinroq qayta urinadi.
2. **Sotuv sanasi** — "Yangi sotuv" formasida endi sana tanlash maydoni bor.
   Tanlangan sana bo'yicha sotuv o'sha kunning natijasiga qo'shiladi
   (Kalendar/Arxiv, kunlik hisobotlar).
3. **Ikkita jamoa (Kunduzgi/Kechki)** — Dashboard'da "Jamoalar taqqoslash"
   bo'limi qo'shildi: har bir jamoaning nomi, logotipi, bugungi va oylik
   sotuvi ko'rinadi. Yetakchi jamoa yashil, orqada qolgani qizil rangda.
4. **To'liq raqam formati** — barcha sotuv natijalari endi "555 ming" emas,
   "555 000 so'm" ko'rinishida. Admin uchun Leaderboard'da har bir
   xodimning kutilayotgan maoshi (fiksa + bonus) ham ko'rinadi. Reja
   bajarilishi foizi: 0-90% qizil, 90-100% sariq, 100%+ yashil.
5. **Oy oxiri prognozi** — Leaderboard'da har bir operator uchun joriy
   sur'atga asosan oy oxirida qanday foizga yetishi mumkinligi ko'rsatiladi.
6. **Admin — to'liq sotuv boshqaruvi** — Invoices sahifasida endi
   tahrirlash (mijoz, summa, sana, status, sotuvchi) va o'chirish tugmalari
   bor. "Yangi sotuv" sahifasida admin istalgan xodim nomidan sotuv
   kirita oladi.

Sozlash uchun: `supabase/migration_v4.sql` faylini SQL Editor'da ishga
tushiring (jamoa nomlarini Kunduzgi/Kechkiga o'tkazadi).

## Maosh tizimi, lid analitikasi va davomat (v5)

**Fiksa oylik endi 3 qismdan iborat + qo'shimcha bonuslar:**
- Baza (o'zgarmas, admin belgilagan)
- Davomat bonusi: har kuni 09:50–10:10 oralig'ida "check-in" (taymer start)
  qilsa +40,000 so'm/kun (26 kunlik oyda maksimal 1,040,000 so'm)
- Ish soati bonusi: kuniga 5+ soat ishlasa +27,000, 4-5 soat +18,000 so'm/kun
- Sotuv bonusi: mavjud bosqichli tizim (4%/7%/10%)
- Konversiya bonusi: oylik konversiya >5% bo'lsa +500,000, 3-5% bo'lsa
  +200,000 so'm (0-3% — bonus yo'q)

Operator o'z "Hisobot" sahifasida to'liq daromad tarkibini va konversiyasini
doimiy kuzatib borishi mumkin.

**Lid analitikasi (operator, "Hisobot" sahifasida):**
Har kuni jadval ko'rinishida: Prioritet, Aloqa o'rnatildi, Qayta aloqa,
Ma'lumot berildi, To'lovga rozi, Birinchi to'lov, Sotuv — va alohida
Otkaz sabablari: Qimmat, Adashib o'tgan/xato kontakt, Nedozvon, Kerak
emas, Hozir emas. "Umumiy lid" va "Umumiy otkaz" — avtomatik yig'indi,
qo'lda tahrirlanmaydi.

**Admin — Analitika sahifasi** (`/dashboard/admin/analytics`): barcha
xodimlarning lid/otkaz jadvali, ism-familiya bo'yicha, joriy oy uchun.

**Admin — Davomat/Hisobot sahifasi** (`/dashboard/admin/attendance`):
har bir xodim uchun bugungi check-in holati (✅/❎), ishlagan soat,
konversiya — kunlik/haftalik/oylik filtr bilan.

Sozlash uchun: `supabase/migration_v5.sql` faylini SQL Editor'da ishga
tushiring (daily_lead_stats jadvali va RLS siyosatlari).

## Jamoa bo'yicha check-in, taymer va Team Leader (v6)

- **Jamoa bo'yicha check-in vaqti**: Kunduzgi jamoa — 09:50–10:10,
  Kechki jamoa — 13:50–14:10. Davomat bonusi shu oynaga qarab hisoblanadi.
- **Taymer**: bo'sh turish chegarasi 10 daqiqadan **30 daqiqaga**
  o'zgartirildi — operator ishga kirganda taymer avtomatik yonadi,
  30 daqiqa harakatsizlikdan keyingina pauzaga o'tadi, aks holda
  uzluksiz ishlaydi.
- **Team Leader roli**: admin istalgan operatorni "Team Leader" qilib
  belgilashi mumkin (Sotuvchilar boshqaruvida checkbox). Team Leader
  o'z jamoasi uchun qo'shimcha ikkita bo'limga ega bo'ladi:
  - **"Jamoa a'zolari"** (`/dashboard/team/operators`) — o'z jamoasiga
    yangi sotuvchi qo'shish, mavjudlarini tahrirlash/o'chirish
    (faqat o'z jamoasi doirasida).
  - **"Jamoaga task"** (`/dashboard/team/tasks`) — jamoa a'zolariga
    vazifa tayinlash.

Sozlash uchun: `supabase/migration_v6.sql` faylini SQL Editor'da ishga
tushiring (is_team_leader ustuni va tegishli RLS siyosatlari).

## Texnologiyalar

- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Supabase (Postgres, Auth, Storage, Realtime)
- Recharts (grafiklar)
- Lucide React (ikonkalar)
