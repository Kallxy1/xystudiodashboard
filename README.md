# XyStudio Admin Dashboard

Private admin dashboard untuk `admin.xystudio.my.id`.

## Fitur awal

- Login via allowed email + admin passcode.
- Session cookie HTTP-only, signed, sameSite strict.
- Monitor status banyak site dari `ADMIN_SITES_JSON`.
- Monitor GitHub Actions frontend/engine.
- Placeholder monitoring pendapatan iklan via `ADMIN_ADS_MANUAL_JSON`.
- Security headers dan robots noindex.

## Deploy

1. Buat repository baru, contoh: `xystudio-admindashboard`.
2. Upload isi folder ini.
3. Import ke Vercel.
4. Tambahkan domain: `admin.xystudio.my.id`.
5. Set env dari `.env.example`.
6. Deploy.

## Env penting

```env
ADMIN_ALLOWED_EMAILS=you@example.com
ADMIN_LOGIN_PASSCODE=random-panjang
ADMIN_SESSION_SECRET=random-sangat-panjang
GITHUB_TOKEN=github_pat_xxx
ADMIN_SITES_JSON=[{"name":"BuildBox","url":"https://build.xystudio.my.id"}]
```

## Catatan keamanan

- Jangan expose `GITHUB_TOKEN` ke client.
- Jangan gunakan passcode pendek.
- Untuk level lebih tinggi, ganti login passcode ke Google OAuth/Auth.js + allowlist email.
- Aktifkan Vercel deployment protection kalau dashboard masih testing.
- `ADMIN_ADS_MANUAL_JSON` hanya placeholder; integrasi AdSense real butuh OAuth Google AdSense Management API.
