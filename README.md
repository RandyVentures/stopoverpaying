# StopOverpaying.io

> Find the bills you can shrink in one scan.

A privacy-first web app that analyzes bank statements to identify recurring charges and shows you how to pay less for the same services.

**Reference:** Inspired by [just-fucking-cancel](https://github.com/rohunvora/just-fucking-cancel)

---

## 🎯 What It Does

1. **Upload** your bank statement (CSV or PDF)
2. **Analyze** recurring charges automatically  
3. **Get savings suggestions** - cheaper alternatives, negotiation scripts, pricing comparisons

Unlike subscription cancellation tools, this helps you **pay less** by finding cheaper alternatives, not just canceling everything.

---

## ✨ Features

- **Privacy-first:** All processing happens client-side in your browser
- **No data storage:** Files never leave your machine
- **121+ services:** Streaming, utilities, insurance, phone, fitness, software, and more
- **Actionable advice:** Specific alternatives with pricing and instructions
- **Optional payment:** Add Stripe if you want to monetize your version

---

## 🗂️ Database Coverage

Our savings database includes **121 services** across **14 categories:**

- 🤖 AI Tools (ChatGPT, Claude, Midjourney, Grammarly, etc.)
- 📺 Streaming (Netflix, Spotify, Hulu, Disney+, etc.)
- 💻 Software (Adobe, Microsoft 365, Notion, etc.)
- ☁️ Cloud Storage (Dropbox, Google One, iCloud+, etc.)
- 📱 Telecom (Verizon, AT&T, T-Mobile, Comcast, etc.)
- 🍔 Food Delivery (DoorDash, Uber One, Instacart+, etc.)
- 💪 Fitness (Planet Fitness, Peloton, LA Fitness, etc.)
- 🔒 VPN & Security (ExpressVPN, NordVPN, 1Password, etc.)
- 📚 Entertainment (Audible, Kindle Unlimited, NYT, etc.)
- 💬 Communication (Zoom, Slack, Discord Nitro, etc.)
- 🎓 Learning (LinkedIn Premium, Coursera, MasterClass, etc.)
- ✈️ Travel (TSA PreCheck, AAA, Clear, etc.)
- 🛡️ Insurance (Auto, Home, Life, Pet, Health, etc.)
- ⚡ Utilities (Electric, Gas, Water, Trash, etc.)

Each service includes 2-4 savings strategies with realistic pricing and effort estimates.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Claude API key (get one at https://console.anthropic.com/)
- *Optional:* Stripe account for payment processing

### Installation

```bash
# Clone the repo
git clone https://github.com/RandyVentures/stopoverpaying.git
cd stopoverpaying

# Install dependencies
npm install

# Set up environment variables
cp .env.local .env.local.example
```

### Environment Setup

**Minimum required (free usage):**
```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
```

**Optional (if you want payments):**
```bash
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Run Locally

```bash
npm run dev
```

Open http://localhost:3000

---

## 🧪 Testing

1. Export a CSV from your bank:
   - Chase, Bank of America, Capital One, Wells Fargo, Amex, Apple Card
2. Upload to `/analyze`
3. View your savings report!

**If you enabled Stripe:**
- Test card: `4242 4242 4242 4242`
- Any future expiry, any CVC

---

## 🏗️ Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Processing:** Client-side CSV/PDF parsing (papaparse, pdf-parse)
- **AI:** Claude API for merchant name matching
- **Payments:** Stripe (optional)
- **Hosting:** Vercel, Netlify, or any Next.js host

---

## 📂 Project Structure

```
stopoverpaying/
├── app/
│   ├── page.tsx           # Landing page
│   ├── analyze/           # Upload & preview
│   ├── report/            # Full savings report
│   ├── privacy/           # Privacy policy
│   └── terms/             # Terms of service
├── components/            # UI components
├── lib/
│   ├── parsers/           # CSV & PDF parsing
│   ├── matching.ts        # Merchant name fuzzy matching
│   ├── recurring.ts       # Recurring charge detection
│   └── subscriptions.ts   # Database queries
├── data/
│   └── subscriptions.json # Savings database (121 services)
└── public/                # Static assets
```

---

## 🔧 Customization

### Adding Your Own Services

Edit `data/subscriptions.json`:

```json
{
  "name": "YourService",
  "aliases": ["SERVICE", "YOUR SERVICE INC"],
  "typical_price": 19.99,
  "tier": "Premium",
  "savings_options": [
    {
      "method": "Switch to cheaper alternative",
      "new_price": 9.99,
      "savings_monthly": 10,
      "savings_annual": 120,
      "effort": "easy",
      "link": "https://alternative.com",
      "instructions": "Step-by-step guide here..."
    }
  ]
}
```

### Disabling Payments

The app works without Stripe! Just don't set the Stripe env vars and it will:
- Show full report immediately (no paywall)
- Skip the payment step entirely

### Changing Pricing

Edit `lib/constants.ts`:
```typescript
export const CHECKOUT_PRICE = 5; // Change to your price
```

---

## 🔒 Privacy & Security

- **Client-side processing:** Bank data never leaves the browser
- **No database:** Nothing is stored server-side
- **Optional auto-delete:** Files expire from localStorage after 48 hours
- **Security headers:** CSP, X-Frame-Options, etc. configured
- **No tracking:** Add your own analytics if desired

---

## 🤝 Contributing

Contributions welcome! To contribute:

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a pull request

**Areas we'd love help with:**
- Adding more services to the database
- Supporting more bank CSV formats
- Improving merchant name matching
- Better savings strategies
- UI/UX improvements

---

## 📄 License

MIT License - feel free to use this for your own projects!

---

## 🙏 Credits

- Inspired by [just-fucking-cancel](https://github.com/rohunvora/just-fucking-cancel) by Rohun Vora
- Built with Next.js, Claude API, and Stripe
- Database compiled from public sources and user research

---

## 📞 Questions?

- Open an issue on GitHub
- Check the documentation in the repo
- Review the code - it's all here!

---

**Built with ❤️ by RandyVentures**  
**Started:** January 12, 2026
