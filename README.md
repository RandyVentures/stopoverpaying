# StopOverpaying.io

> Find the bills you can shrink in one scan.

A privacy-first web app that analyzes bank statements to identify recurring charges and shows users how to pay less for the same services.

---

## 🎯 What It Does

1. **Upload** your bank statement (CSV or PDF)
2. **Analyze** recurring charges automatically
3. **Preview** potential savings (free)
4. **Pay $5** to unlock the full report
5. **Save money** with actionable alternatives and negotiation scripts

Unlike subscription cancellation tools, we help people **pay less** by finding cheaper alternatives, not just canceling everything.

---

## 🚀 Features

### For Users
- **Privacy-first:** All processing happens client-side in your browser
- **No data storage:** Files auto-delete after 48 hours
- **121+ services:** Streaming, utilities, insurance, phone, fitness, software, and more
- **Actionable advice:** Specific alternatives, pricing, and negotiation scripts
- **One-time payment:** $5 flat fee, no subscriptions

### Tech Stack
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Processing:** Client-side CSV/PDF parsing
- **AI:** Claude API for merchant name matching
- **Payments:** Stripe
- **Hosting:** Vercel (serverless)

---

## 📊 Database

Our savings database includes **121 services** across **14 categories:**

- 🤖 AI Tools (ChatGPT, Claude, Midjourney, etc.)
- 📺 Streaming (Netflix, Spotify, Hulu, etc.)
- 💻 Software (Adobe, Microsoft 365, Grammarly, etc.)
- ☁️ Cloud Storage (Dropbox, Google One, iCloud+, etc.)
- 📱 Telecom (Verizon, AT&T, Comcast, etc.)
- 🍔 Food Delivery (DoorDash, Uber One, Instacart+, etc.)
- 💪 Fitness (Planet Fitness, Peloton, Orange Theory, etc.)
- 🔒 VPN & Security (ExpressVPN, 1Password, etc.)
- 📚 Entertainment (Audible, Kindle Unlimited, NYT, etc.)
- 💬 Communication (Zoom, Slack, Discord Nitro, etc.)
- 🎓 Learning (LinkedIn Premium, Coursera, MasterClass, etc.)
- ✈️ Travel (TSA PreCheck, AAA, Clear, etc.)
- 🛡️ Insurance (Auto, Home, Life, Pet, etc.)
- ⚡ Utilities (Electric, Gas, Water, etc.)

Each service includes 2-4 savings strategies with realistic pricing and effort estimates.

---

## 🏗️ Project Structure

```
stopoverpaying/
├── app/                    # Next.js pages
│   ├── page.tsx           # Landing page
│   ├── analyze/           # CSV upload & preview
│   ├── report/            # Full savings report
│   ├── privacy/           # Privacy policy
│   └── terms/             # Terms of service
├── components/            # Reusable UI components
├── lib/                   # Core logic
│   ├── parsers/           # CSV & PDF parsing
│   ├── matching.ts        # Merchant name matching
│   ├── recurring.ts       # Recurring charge detection
│   ├── report.ts          # Savings report builder
│   └── subscriptions.ts   # Database queries
├── data/
│   └── subscriptions.json # Savings database
└── public/                # Static assets
```

---

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Stripe account (test keys)
- Claude API key

### Setup

```bash
# Clone repo
git clone https://github.com/RandyVentures/stopoverpaying.git
cd stopoverpaying

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your keys

# Run development server
npm run dev
```

Open http://localhost:3000

### Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional (for analytics)
# NEXT_PUBLIC_ANALYTICS_ID=...
```

---

## 🧪 Testing

### Test with Sample Data

1. Export a CSV from your bank (Chase, BofA, Capital One, etc.)
2. Upload to `/analyze`
3. Use Stripe test card: `4242 4242 4242 4242`
4. Verify full report displays

### Test Banks Supported
- Chase
- Bank of America
- Capital One
- Wells Fargo
- American Express
- Apple Card

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Connect repo at https://vercel.com/new
3. Add environment variables in Vercel dashboard
4. Deploy!

See `FINAL_DEPLOYMENT_CHECKLIST.md` for complete deployment guide.

### Environment Setup
- Add all env vars from `.env.local`
- Use **production** Stripe keys for live site
- Set up Stripe webhook: `https://yourdomain.com/api/stripe/webhook`

---

## 📈 Economics

### Revenue Model
- **One-time payment:** $5 per report
- **Affiliate revenue:** $4-9 per conversion (VPNs, streaming, etc.)
- **Target margin:** ~$8 net per user

### Costs
- **Claude API:** ~$0.30 per report
- **Stripe fees:** $0.20 per transaction
- **Hosting:** Free tier → $20/mo at scale

### Projections
- **Week 1:** 100 visitors, 2 payments = $10 revenue
- **Month 1:** 1,000 visitors, 20 payments = $100 revenue
- **Month 3:** 5,000 visitors, 100 payments = $500 revenue
- **Month 6:** 20,000 visitors, 500 payments = $2,500 revenue

---

## 🔒 Privacy & Security

- **Client-side processing:** Bank data never leaves your browser
- **No database:** We don't store your transactions
- **Auto-delete:** All data expires after 48 hours
- **Stripe security:** PCI compliant payment processing
- **Security headers:** CSP, HSTS, X-Frame-Options, etc.

Read our [Privacy Policy](https://stopoverpaying.io/privacy) for details.

---

## 📚 Documentation

- **FINAL_DEPLOYMENT_CHECKLIST.md** - Step-by-step deployment guide
- **PRE_LAUNCH_CHECKLIST.md** - Pre-launch quality checklist
- **DEPLOYMENT_OPTIONS.md** - Hosting platform comparison
- **DATABASE_EXPANSION_REPORT.md** - Database structure & growth

---

## 🤝 Contributing

This is a private commercial project. Not accepting external contributions at this time.

---

## 📄 License

Proprietary. All rights reserved.

---

## 🎉 Launch Status

- ✅ MVP complete
- ✅ Legal pages (Privacy, Terms)
- ✅ Security headers configured
- ✅ SEO optimized
- ⏳ Ready for Vercel deployment
- ⏳ Awaiting ProductHunt launch

---

## 📞 Support

For questions or issues: support@stopoverpaying.io

---

**Built with ❤️ by RandyVentures**  
**Domain:** [stopoverpaying.io](https://stopoverpaying.io)  
**Started:** January 12, 2026
