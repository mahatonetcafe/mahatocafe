# Mahato Net Cafe Website

Live site: https://mahatocafe.tech

Mahato Net Cafe (Baliapur, Dhanbad) ki website. Customer service chunta hai, document upload karta hai, online payment karta hai, aur receiving download karta hai. Admin panel se orders, rate, services aur settings sambhale jaate hain.

Poori site Cloudflare ke free plan pe chalti hai: Next.js app vinext ke through Workers pe, database D1 me, aur saari files encrypted form me private GitHub repo me.

## Website ka dhaancha

| Hissa | Kahan |
|---|---|
| Rendering | Durable Object `SiteRenderer` (`worker/index.ts`) |
| Database | Cloudflare D1, tables app khud banata hai |
| Documents aur receiving | Private GitHub repo `mahatonetcafe/mahato-documents` |
| Domain aur HTTPS | Cloudflare |

Rendering Durable Object me isliye hai kyunki free plan pe Worker ko sirf 10 ms CPU milta hai aur page render iske kinare pe tha (Error 1102). Durable Object ko isi free plan me 30 second milte hain. Free limit: roz 1 lakh requests aur 13,000 GB-s.

## Local me chalana

Node.js 22 ya usse naya chahiye.

```bash
npm install
npm run dev:vinext
```

Local settings `.dev.vars` file me rakhein (ye GitHub pe nahi jati):

```
ADMIN_MOBILE=9000000000
ADMIN_PASSWORD=local-password
GITHUB_REPO=owner/private-repo
GITHUB_TOKEN=token
```

## Live karna

```bash
npx cf auth login
npm run deploy:vinext
```

## Live settings

Plain settings `cloudflare.config.ts` me hain. Ye secrets Cloudflare Dashboard → Workers & Pages → mahato-net-cafe → Settings → Variables and Secrets me daalein:

| Secret | Kaam |
|---|---|
| `ADMIN_PASSWORD` | Admin ka pehla password. Pehle login pe account banta hai; baad me yahan badalne se password nahi badalta |
| `GITHUB_TOKEN` | Documents aur receiving ki storage |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Online payment |
| `RAZORPAY_WEBHOOK_SECRET` | Customer page band kar de tab bhi payment record ho |

- **GitHub token:** fine-grained, sirf `mahato-documents` repo ke liye, Contents read and write. Repo public hua to upload apne aap ruk jayega.
- **Razorpay:** payment capture Automatic rakhein. Webhook me event `payment.captured` aur URL `https://mahatocafe.tech/api/razorpay/webhook` daalein.
- **Policies aur rate:** `src/lib/policies.ts` padh lein. Rate aur samay Admin → Services aur Rate me sahi karein.

## Customer documents kaise surakshit hain

Har file upload se pehle AES-256-GCM se apni alag key se encrypt hoti hai, aur key sirf database me rehti hai. Git deleted files ko history me rakhta hai, isliye admin delete karne par file repo se hat jati hai aur uski key bhi mit jati hai. Iske baad history wali copy koi nahi padh sakta. Customer upload ke baad apni file dobara nahi khol sakta, use sirf receiving milti hai.

## Android app

`android-app` folder me hai. Build aur Play Store ke steps [android-app/README.md](android-app/README.md) me hain.

## Admin panel

`/admin` par login karein.

- **Orders:** payment dekhna, documents download, sudhar maangna, receiving upload, Mark Done, documents delete
- **Services aur Rate:** naam, rate, delivery samay, category, nayi service
- **Settings:** phone, WhatsApp, pata, Android app ke links, beta on/off, QR Se Print promotion
