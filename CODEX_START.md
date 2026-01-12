# 👋 CODEX: Start Here

## Mission
Build **StopOverpaying.io** - a web app that helps people find cheaper alternatives for their recurring bills.

## Quick Context
- Users upload bank statements (CSV or PDF)
- AI analyzes recurring charges
- We show them how to save money (cheaper alternatives + negotiation scripts)
- $7 one-time payment for full report
- 90%+ profit margins + affiliate revenue

## Your Task: Build Phase 1 MVP (3 weeks)

### 📚 Read First
1. **plan.md** - Complete architecture, timeline, and technical details
2. **data/subscriptions.json** - Database structure (expand this to 50+ services)
3. Reference: https://github.com/rohunvora/just-fucking-cancel

### ✅ Confirmed Decisions
- File support: CSV **AND** PDF
- AI: Claude Sonnet 4.5
- Banks: Chase, BoA, Capital One, Amex, Wells Fargo
- Pricing: $7 one-time
- Domain: stopoverpaying.io

### 🛠 Tech Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + Shadcn/ui
- Claude Sonnet 4.5 API
- Stripe payment
- No database (localStorage only)
- Deploy: Vercel

### 📋 Build Checklist

**Week 1: Core Functionality**
- [ ] Expand subscriptions.json from 20 to 50+ services
- [ ] Initialize Next.js project with TypeScript
- [ ] Build CSV parser (client-side)
- [ ] Build PDF parser (pdf-parse library)
- [ ] Transaction categorization logic
- [ ] Claude API integration
- [ ] Preview page (shows potential savings)

**Week 2: Payment & Report**
- [ ] Stripe integration ($7 checkout)
- [ ] Full report generation (HTML)
- [ ] Savings calculation engine
- [ ] Negotiation scripts display
- [ ] Email delivery
- [ ] Download as PDF

**Week 3: Polish & Launch**
- [ ] Landing page with copy
- [ ] FAQ section
- [ ] Privacy policy
- [ ] Mobile responsive
- [ ] Testing with real bank CSVs
- [ ] Deploy to Vercel
- [ ] Domain setup

### 🎯 Critical Requirements

**Privacy First:**
- Parse CSV/PDF on client-side only
- Never send raw transactions to server
- Send only patterns to Claude: "NETFLIX.COM $15.49 - monthly"
- Store results in localStorage only
- Auto-delete after 48 hours

**Database Matching:**
- Fuzzy match merchant names
- "NETFLIX INC" = "NETFLIX.COM" = "Netflix"
- Handle variations gracefully
- Generic advice if no match found

**Cost Control:**
- Keep Claude API calls minimal (~$0.05/user)
- Don't send full CSVs to AI
- Optimize token usage

### 🔑 Environment Variables
Create `.env.local`:
```
ANTHROPIC_API_KEY=your_key_here
STRIPE_PUBLIC_KEY=your_key_here
STRIPE_SECRET_KEY=your_key_here
STRIPE_WEBHOOK_SECRET=your_key_here
NEXT_PUBLIC_DOMAIN=stopoverpaying.io
```

### 📊 Success Metrics
- Process CSV/PDF in <10 seconds
- Show preview for free
- $7 payment flow works smoothly
- Report shows average $800+/year in savings
- Works on mobile

### 🚨 Important Notes

1. **Study the reference repo:** https://github.com/rohunvora/just-fucking-cancel
   - See how they parse CSVs client-side
   - Copy their subscriptions.json structure
   - Learn from their report generation

2. **Client-side processing is key:**
   - Users are paranoid about financial data
   - "Your data never leaves your browser" is the pitch
   - Only send anonymized patterns to Claude

3. **Database is your moat:**
   - The savings database is what makes this valuable
   - Spend time expanding it to 50+ services
   - Include real negotiation scripts
   - Test the savings calculations

4. **Make it beautiful:**
   - This is a consumer product
   - UI matters
   - Make the report feel premium ($7 should feel worth it)

### 📞 Questions?
- Read plan.md for detailed answers
- Check subscriptions.json for data structure
- Reference the Just Cancel repo for patterns

---

**Let's build this. 3 weeks to MVP. Go! 🚀**
