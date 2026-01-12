# StopOverpaying.io - Project Plan

## Overview
A web app that analyzes bank statements to find recurring expenses and shows users how to pay less for the same services. Unlike subscription cancellation tools, we help people **save money** by finding cheaper alternatives.

**Domain:** stopoverpaying.io  
**Pricing:** $7 one-time payment  
**Value Prop:** Upload 2-3 months of statements → Get personalized savings plan with links & scripts

---

## 🎯 Core Concept

### What Makes This Different
| Just Cancel (Reference) | StopOverpaying (Ours) |
|-------------------------|----------------------|
| Find subscriptions → Cancel them | Find recurring expenses → Pay less |
| One category (subscriptions) | **Multiple categories** (subscriptions, utilities, insurance, phone, gym, etc.) |
| Links to cancellation pages | **Links to cheaper alternatives + negotiation scripts** |
| $5 one-time | **$7 one-time** |
| No recurring revenue | **Affiliate revenue** when they switch |

### User Flow
1. Upload CSV from bank (2-3 months of transactions)
2. AI analyzes and identifies recurring charges
3. See preview: "Found $1,247/year in potential savings"
4. Pay $7 to unlock full report
5. Get personalized report with:
   - How to get each service cheaper
   - Alternative providers with pricing
   - Negotiation scripts for utilities
   - Direct links (including affiliate links)

---

## 📚 Reference Project

**GitHub:** https://github.com/rohunvora/just-fucking-cancel

### What They Built
- Next.js web app + Claude Code skill (open source)
- CSV upload → AI analysis → Results
- Client-side processing (privacy-first)
- localStorage only (no database)
- Stripe payment ($5)
- Data file: `data/subscriptions.json` (pricing for 100+ services)

### Key Files to Study
- `/data/subscriptions.json` - Service pricing database (our template)
- Main app logic - CSV parsing, AI analysis
- Report generation - HTML output with savings calculations

---

## 🏗 Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/ui** (for components)

### Backend
- **Next.js API Routes**
- **Claude API** (for CSV analysis)
- **Stripe** (payment processing)

### Storage
- **None** - Everything in browser localStorage
- Auto-delete after 48 hours (privacy)

### Deployment
- **Vercel** (free tier works for MVP)

### Why This Stack
- Same proven stack as reference project
- Serverless = low costs
- Privacy-first = no database needed
- Fast to build

---

## 📊 Database Structure (JSON Files)

### File: `data/subscriptions.json`
Based on reference project but expanded with our savings data.

```json
{
  "meta": {
    "lastUpdated": "2026-01-12",
    "categories": ["streaming", "software", "fitness", "utilities", "insurance", "telecom"],
    "version": "1.0"
  },
  "categories": {
    "streaming": {
      "label": "Streaming Services",
      "icon": "📺",
      "items": [
        {
          "name": "Netflix",
          "typical_price": 15.49,
          "tier": "Standard",
          "savings_options": [
            {
              "method": "Switch to ad-supported tier",
              "new_price": 6.99,
              "savings_monthly": 8.50,
              "savings_annual": 102,
              "effort": "easy",
              "link": "https://netflix.com/plans",
              "affiliate": false,
              "instructions": "Log in → Account → Change Plan → Select Basic with Ads"
            },
            {
              "method": "Share family plan (5 people)",
              "new_price": 3.10,
              "savings_monthly": 12.39,
              "savings_annual": 148,
              "effort": "medium",
              "link": null,
              "affiliate": false,
              "instructions": "Split Premium plan ($15.49) with 4 other people"
            },
            {
              "method": "Use T-Mobile perk (if eligible)",
              "new_price": 0,
              "savings_monthly": 15.49,
              "savings_annual": 186,
              "effort": "easy",
              "link": "https://t-mobile.com/netflix",
              "affiliate": false,
              "instructions": "T-Mobile Magenta plans include free Netflix Basic"
            }
          ]
        }
      ]
    },
    "telecom": {
      "label": "Phone & Internet",
      "icon": "📱",
      "items": [
        {
          "name": "Verizon",
          "typical_price": 85,
          "tier": "Unlimited",
          "savings_options": [
            {
              "method": "Switch to Mint Mobile",
              "new_price": 15,
              "savings_monthly": 70,
              "savings_annual": 840,
              "effort": "medium",
              "link": "https://mintmobile.com",
              "affiliate": true,
              "affiliate_id": "TBD",
              "instructions": "Mint runs on T-Mobile network. 10GB/month plan is $15/mo with annual prepay."
            },
            {
              "method": "Switch to Visible",
              "new_price": 25,
              "savings_monthly": 60,
              "savings_annual": 720,
              "effort": "easy",
              "link": "https://visible.com",
              "affiliate": true,
              "affiliate_id": "TBD",
              "instructions": "Visible is Verizon-owned. Unlimited for $25/mo, no contract."
            },
            {
              "method": "Call for retention discount",
              "new_price": 65,
              "savings_monthly": 20,
              "savings_annual": 240,
              "effort": "easy",
              "link": null,
              "affiliate": false,
              "negotiation_script": "Hi, I've been a customer for [X years] and I'm reviewing my bills. I see [competitor] offers similar service for $[amount]. Can you offer me a better rate or discount to keep my business?"
            }
          ]
        },
        {
          "name": "Comcast/Xfinity Internet",
          "typical_price": 89,
          "tier": "300 Mbps",
          "savings_options": [
            {
              "method": "Call for promotional rate",
              "new_price": 50,
              "savings_monthly": 39,
              "savings_annual": 468,
              "effort": "easy",
              "link": null,
              "affiliate": false,
              "negotiation_script": "Hi, my promotional rate expired and my bill jumped to $89. I've been a loyal customer for [X years]. Can you put me back on a promotional rate? I'm seeing competitors offer similar speeds for $40-50/month."
            },
            {
              "method": "Threaten to cancel (retention dept)",
              "new_price": 45,
              "savings_monthly": 44,
              "savings_annual": 528,
              "effort": "medium",
              "link": null,
              "affiliate": false,
              "negotiation_script": "I need to cancel my service. (When transferred to retention:) I like your service but can't justify $89/mo. [Competitor] offered me $45. Can you match that?"
            }
          ]
        }
      ]
    },
    "utilities": {
      "label": "Utilities",
      "icon": "⚡",
      "items": [
        {
          "name": "Electric Bill",
          "typical_price": 150,
          "tier": "Average household",
          "savings_options": [
            {
              "method": "Switch to cheaper provider (deregulated states)",
              "new_price": 110,
              "savings_monthly": 40,
              "savings_annual": 480,
              "effort": "medium",
              "link": "https://www.energybot.com",
              "affiliate": true,
              "affiliate_id": "TBD",
              "instructions": "Compare rates in your area. Switch takes 2-3 weeks, no service interruption.",
              "note": "Only works in deregulated states: TX, PA, OH, IL, NJ, MD, etc."
            },
            {
              "method": "Negotiate with current provider",
              "new_price": 135,
              "savings_monthly": 15,
              "savings_annual": 180,
              "effort": "easy",
              "link": null,
              "affiliate": false,
              "negotiation_script": "Hi, I'm reviewing my energy bill and noticed my rate is $0.14/kWh. I've seen competitors offering $0.10/kWh. I've been a customer for [X years]. Can you match that rate or offer a discount?"
            },
            {
              "method": "Time-of-use plan (if available)",
              "new_price": 130,
              "savings_monthly": 20,
              "savings_annual": 240,
              "effort": "easy",
              "link": null,
              "affiliate": false,
              "instructions": "Ask about time-of-use rates. Run dishwasher/laundry at night when rates are lower."
            }
          ]
        }
      ]
    },
    "insurance": {
      "label": "Insurance",
      "icon": "🛡️",
      "items": [
        {
          "name": "Car Insurance",
          "typical_price": 150,
          "tier": "Full coverage",
          "savings_options": [
            {
              "method": "Compare quotes (Policygenius)",
              "new_price": 110,
              "savings_monthly": 40,
              "savings_annual": 480,
              "effort": "medium",
              "link": "https://www.policygenius.com/auto-insurance/",
              "affiliate": true,
              "affiliate_id": "TBD",
              "instructions": "Get 5+ quotes in 10 minutes. Average savings: $400/year"
            },
            {
              "method": "Bundle with home insurance",
              "new_price": 120,
              "savings_monthly": 30,
              "savings_annual": 360,
              "effort": "medium",
              "link": null,
              "affiliate": false,
              "instructions": "Most insurers give 15-25% discount for bundling auto + home/renters"
            },
            {
              "method": "Raise deductible ($500 → $1000)",
              "new_price": 125,
              "savings_monthly": 25,
              "savings_annual": 300,
              "effort": "easy",
              "link": null,
              "affiliate": false,
              "instructions": "Call your insurer and ask to raise deductible. Instant discount."
            }
          ]
        }
      ]
    },
    "fitness": {
      "label": "Fitness & Wellness",
      "icon": "💪",
      "items": [
        {
          "name": "Planet Fitness",
          "typical_price": 24.99,
          "tier": "Black Card",
          "savings_options": [
            {
              "method": "Downgrade to basic membership",
              "new_price": 10,
              "savings_monthly": 14.99,
              "savings_annual": 180,
              "effort": "easy",
              "link": null,
              "affiliate": false,
              "instructions": "Visit your home club and ask to switch to $10 basic membership"
            }
          ]
        },
        {
          "name": "LA Fitness / 24 Hour Fitness",
          "typical_price": 49.99,
          "tier": "Monthly",
          "savings_options": [
            {
              "method": "Negotiate when canceling",
              "new_price": 29.99,
              "savings_monthly": 20,
              "savings_annual": 240,
              "effort": "easy",
              "link": null,
              "affiliate": false,
              "negotiation_script": "I need to cancel my membership. (Wait for retention offer) I like the gym but can't justify $50/mo. Can you offer me a better rate?"
            },
            {
              "method": "Annual membership",
              "new_price": 33.25,
              "savings_monthly": 16.74,
              "savings_annual": 201,
              "effort": "medium",
              "link": null,
              "affiliate": false,
              "instructions": "Pay $399 upfront for 12 months = $33.25/mo vs $49.99/mo"
            }
          ]
        }
      ]
    },
    "software": {
      "label": "Software & Tools",
      "icon": "💻",
      "items": [
        {
          "name": "Adobe Creative Cloud",
          "typical_price": 59.99,
          "tier": "All Apps",
          "savings_options": [
            {
              "method": "Switch to Photography plan (if you only use PS/LR)",
              "new_price": 9.99,
              "savings_monthly": 50,
              "savings_annual": 600,
              "effort": "easy",
              "link": "https://adobe.com/plans",
              "affiliate": false,
              "instructions": "If you only use Photoshop + Lightroom, downgrade to Photography plan"
            },
            {
              "method": "Annual prepay discount",
              "new_price": 54.99,
              "savings_monthly": 5,
              "savings_annual": 60,
              "effort": "easy",
              "link": "https://adobe.com/plans",
              "affiliate": false,
              "instructions": "Pay annually instead of monthly for automatic discount"
            }
          ]
        }
      ]
    }
  }
}
```

### Data Requirements

**Phase 1 (MVP):** 50 services minimum
- Streaming: Netflix, Hulu, Disney+, HBO Max, Spotify, Apple Music, YouTube Premium
- Telecom: Verizon, AT&T, T-Mobile, Comcast, Spectrum, Mint Mobile, Visible
- Utilities: Electric (generic), Gas (generic), Water (generic)
- Insurance: Car insurance (generic), Home insurance (generic)
- Fitness: Planet Fitness, LA Fitness, 24 Hour Fitness, Crunch
- Software: Adobe, Microsoft 365, Notion, Dropbox, Google One

**Phase 2:** 150+ services
- Add more niche services
- Add regional providers
- Add more software/SaaS tools

---

## 💰 Economics

### Cost Per User
- Claude API (Sonnet 4.5): ~$0.05
  - Input: $3/1M tokens
  - Output: $15/1M tokens
  - Typical usage: 6k input + 2k output tokens per analysis
- Stripe fees: $0.45 (2.9% + $0.30)
- **Total cost:** $0.50

**Profit per user:** $6.50 (93% margin)

**Why Claude Sonnet 4.5:**
- Same pricing as Sonnet 3.5
- Superior pattern recognition for transaction matching
- Better at fuzzy merchant name matching ("NETFLIX INC" vs "Netflix")
- Handles edge cases well (quarterly/annual charges)

### Affiliate Revenue (Bonus)
- 20-30% of users click through
- Average commission: $20-30
- **Additional $4-9 per user**

### Projected Revenue

**Month 1 (Conservative):**
- 50 users × $7 = $350
- Affiliates: $200
- **Total: $550/mo**

**Month 3:**
- 300 users × $7 = $2,100
- Affiliates: $1,500
- **Total: $3,600/mo**

**Month 6:**
- 1,000 users × $7 = $7,000
- Affiliates: $6,000
- **Total: $13,000/mo**

---

## 🛠 Phase 1: MVP (Week 1-3)

### Week 1: Core Functionality
**Goal:** CSV upload → AI analysis → Preview

#### Tasks
1. **Project Setup**
   - Initialize Next.js project with TypeScript
   - Set up Tailwind + Shadcn/ui
   - Configure environment variables
   - Set up Git repo

2. **CSV & PDF Parser**
   - **Priority banks:** Chase, Bank of America, Capital One, Amex, Wells Fargo
   - Support CSV format from all banks
   - Support PDF statements (use pdf-parse library)
   - Client-side parsing (privacy - never send raw files to server)
   - Extract: date, merchant, amount, category
   - Handle various date formats, currency symbols, etc.

3. **Transaction Categorization**
   - Identify recurring charges (same merchant, ~monthly pattern)
   - Match against subscriptions database
   - Calculate frequency and monthly average

4. **AI Integration (Claude API)**
   - Send recurring patterns to Claude (not raw data)
   - Prompt engineering: "Categorize these recurring charges"
   - Handle edge cases (annual charges, quarterly, etc.)
   - Response parsing

5. **Preview Generation**
   - Calculate total annual spending
   - Calculate potential savings (basic)
   - Show top 3 opportunities
   - "Found $X,XXX/year in potential savings"

**Deliverable:** Working prototype that analyzes CSV and shows preview

---

### Week 2: Payment & Report

#### Tasks
1. **Stripe Integration**
   - Set up Stripe account
   - Implement Checkout
   - Handle webhooks
   - Store payment status in localStorage

2. **Full Report Generation**
   - HTML report with all categories
   - For each subscription:
     - Current cost
     - Savings options (from database)
     - Links to alternatives
     - Negotiation scripts (where applicable)
   - Total savings calculation
   - Effort indicators (easy/medium/hard)

3. **Report Features**
   - Checkboxes for tracking
   - Copy-to-clipboard functionality
   - Privacy blur toggle
   - Download as PDF
   - Email delivery

4. **Database Loading**
   - Load subscriptions.json
   - Match user's charges to database entries
   - Handle fuzzy matching (Netflix vs NETFLIX INC)
   - Show generic advice if no match

**Deliverable:** Full paid flow working end-to-end

---

### Week 3: Polish & Launch

#### Tasks
1. **Landing Page**
   - Hero section with value prop
   - How it works (3 steps)
   - Social proof placeholder
   - FAQ section
   - Privacy policy
   - Terms of service

2. **Copy & Design**
   - Write compelling copy
   - Design report template
   - Create email templates
   - Add branding/logo

3. **Testing**
   - Test with 10+ bank CSV formats
   - Test payment flow
   - Test report generation
   - Mobile responsiveness

4. **Analytics**
   - Google Analytics
   - Conversion tracking
   - Error logging (Sentry)

5. **Launch Prep**
   - Domain setup (stopoverpaying.io)
   - Deploy to Vercel
   - Set up email (hello@stopoverpaying.io)

**Deliverable:** Live product ready for first users

---

## 🚀 Phase 2: Scale (Week 4-8)

### Week 4-5: Database Expansion
- Expand to 150+ services
- Add more categories
- Research affiliate programs
- Set up affiliate tracking

### Week 6: Features
- Quarterly re-scan ($3/mo subscription option)
- Share results on Twitter
- Referral program (refer 3 friends = free)

### Week 7: Marketing
- ProductHunt launch
- Twitter thread
- Reddit posts (r/personalfinance, r/Frugal)
- Outreach to finance bloggers

### Week 8: Optimization
- A/B test pricing ($5 vs $7 vs $10)
- Optimize AI prompts
- Add more bank formats
- Performance improvements

---

## 🔧 Technical Implementation Details

### CSV Parsing Strategy
Reference the Just Cancel approach but add our own handling:

```typescript
interface Transaction {
  date: Date;
  merchant: string;
  amount: number;
  category?: string;
  raw: string;
}

interface RecurringCharge {
  merchant: string;
  normalizedName: string; // "NETFLIX INC" → "Netflix"
  averageAmount: number;
  frequency: 'monthly' | 'quarterly' | 'annual';
  occurrences: Transaction[];
  confidence: number; // 0-1
}
```

### AI Prompt Strategy
Don't send raw transactions - send patterns:

```
Input to Claude:
"Analyze these recurring charges and match to known services:
1. NETFLIX.COM $15.49 - occurs monthly (3 times)
2. SPOTIFY USA $10.99 - occurs monthly (3 times)
3. AMZN PRIME $14.99 - occurs monthly (3 times)
...

Available services database: [subset of our JSON]

Output: JSON array of matched services with confidence scores"
```

### Savings Calculation
```typescript
interface SavingsReport {
  totalCurrentCost: number; // annual
  totalPotentialSavings: number; // annual
  categories: CategoryReport[];
}

interface CategoryReport {
  name: string;
  items: SavingsItem[];
  totalSavings: number;
}

interface SavingsItem {
  service: string;
  currentCost: number; // monthly
  bestSavingsOption: SavingsOption;
  allOptions: SavingsOption[];
  annualSavings: number;
}
```

---

## 📝 Affiliate Programs to Research

### Priority (High Commission)
- Mint Mobile - $15-25 per signup
- Visible - $20 per signup
- Policygenius (insurance) - $10-30 per quote
- EnergyBot (utilities) - $20-50 per switch

### Secondary
- Streaming services (low commission but high volume)
- VPNs (NordVPN, Surfshark) - 30-40% commission
- Software alternatives - varies

**Action:** Sign up for affiliate networks:
- Impact
- ShareASale
- CJ Affiliate
- Direct partnerships

---

## 🎯 Success Metrics

### Phase 1 (MVP)
- [ ] 50 paying users in first month
- [ ] Average savings shown: $800+/year
- [ ] 90%+ successful payment completion
- [ ] <5% refund rate

### Phase 2 (Scale)
- [ ] 500 users by month 3
- [ ] 20%+ affiliate click-through rate
- [ ] $5k+ monthly revenue
- [ ] Featured on ProductHunt

---

## ⚠️ Risks & Mitigations

### Risk: AI costs higher than expected
**Mitigation:** Use GPT-4o-mini instead of Claude, or pre-process client-side

### Risk: Bank CSV formats too varied
**Mitigation:** Start with top 5 banks, add more based on user requests

### Risk: Savings database out of date
**Mitigation:** Add "last verified" dates, quarterly review process

### Risk: Users expect automatic cancellation
**Mitigation:** Clear copy that we provide links/scripts, not automation

---

## 📋 Handoff Checklist for Codex

### Environment Setup
- [ ] Node.js + npm installed
- [ ] Git initialized
- [ ] GitHub repo created
- [ ] Vercel account ready
- [ ] Stripe account created (test mode)
- [ ] Claude API key obtained

### Reference Materials
- [ ] Review Just Cancel GitHub: https://github.com/rohunvora/just-fucking-cancel
- [ ] Study their subscriptions.json format
- [ ] Understand their CSV parsing approach

### Build Order
1. Create subscriptions.json database (50 services minimum)
2. Set up Next.js project structure
3. Build CSV parser
4. Integrate Claude API
5. Build preview page
6. Add Stripe payment
7. Build full report
8. Create landing page
9. Deploy to Vercel

### ✅ Decisions Made
- [x] **File support:** CSV AND PDF (use pdf-parse for PDF extraction)
- [x] **Priority banks:** Chase, Bank of America, Capital One, Amex, Wells Fargo
- [x] **AI Model:** Claude Sonnet 4.5 (cheap + effective)
- [x] **Pricing:** $7 one-time payment
- [x] **Domain:** stopoverpaying.io

---

## 🎬 Next Steps

1. **Review this plan** - Make sure architecture makes sense
2. **Create database** - Start building subscriptions.json with 50+ services
3. **Set up environment** - Get API keys, create accounts
4. **Hand off to Codex** - Let them build Phase 1
5. **Test & iterate** - Randy tests with real bank statements
6. **Launch** - Push to production and start marketing

---

## 🚀 CODEX: START HERE

### Quick Reference
- **Domain:** stopoverpaying.io (needs to be purchased)
- **Tech Stack:** Next.js 15 + TypeScript + Tailwind + Claude Sonnet 4.5 + Stripe
- **File Support:** CSV AND PDF
- **Priority Banks:** Chase, BoA, Capital One, Amex, Wells Fargo
- **Database:** `data/subscriptions.json` (expand from 20 to 50+ services for MVP)

### Build Order
1. Expand `data/subscriptions.json` to 50+ services
2. Set up Next.js project with all dependencies
3. Build CSV + PDF parser (client-side)
4. Integrate Claude Sonnet 4.5 API
5. Build preview page (free)
6. Add Stripe payment ($7)
7. Build full report generation
8. Create landing page
9. Deploy to Vercel

### Critical Implementation Notes

**CSV/PDF Parsing:**
- Parse on client-side (privacy first)
- Never send raw transactions to server
- Send only anonymized patterns to Claude
- Example: "NETFLIX.COM $15.49 - occurs monthly (3 times)"

**Claude Integration:**
- Use Sonnet 4.5 (anthropic.messages.create)
- Send transaction patterns, not raw CSVs
- Include fuzzy matching logic in prompt
- Request JSON response format

**Database Matching:**
- Fuzzy match merchant names (handle variations)
- "NETFLIX INC" = "NETFLIX.COM" = "Netflix"
- Use Levenshtein distance or similar
- Fall back to generic advice if no match

**Privacy:**
- localStorage only (no database)
- Auto-delete after 48 hours
- Clear communication: "Your data never leaves your browser"

### Environment Variables Needed
```
ANTHROPIC_API_KEY=your_claude_api_key
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_DOMAIN=stopoverpaying.io
```

### Reference Implementation
Study this repo for CSV parsing + report generation patterns:
https://github.com/rohunvora/just-fucking-cancel

Pay special attention to:
- How they parse CSVs client-side
- How they structure the subscriptions database
- How they generate the HTML report
- Their localStorage approach

---

**Ready to build? Let's go. 🚀**
