# StopOverpaying.io - Next Steps Roadmap

**Date:** January 12, 2026  
**Current Status:** MVP structure built, database expanded, ready for completion

---

## ✅ What's Already Done

### 1. **Project Structure** 
- ✅ Next.js 15 app initialized with TypeScript
- ✅ Tailwind CSS configured
- ✅ All dependencies defined in package.json

### 2. **Database**
- ✅ subscriptions.json expanded to **121 services** across **14 categories**
- ✅ Each service has 2-4 actionable savings options
- ✅ Includes negotiation scripts, affiliate flags, pricing

### 3. **Core Library Functions** (`lib/`)
- ✅ CSV parser (`parsers/csv.ts`)
- ✅ PDF parser (`parsers/pdf.ts`)
- ✅ Fuzzy merchant name matching (`fuzzy.ts`, `matching.ts`)
- ✅ Recurring charge detection (`recurring.ts`)
- ✅ Savings report builder (`report.ts`)
- ✅ LocalStorage utilities with auto-expiry (`storage.ts`)
- ✅ Privacy/anonymization helpers (`anonymize.ts`)

### 4. **Pages Built**
- ✅ Landing page (`app/page.tsx`) - Hero, how it works, FAQ
- ✅ Analyze page (`app/analyze/page.tsx`) - CSV/PDF upload, preview
- ✅ Report page (`app/report/page.tsx`) - (needs verification)

### 5. **API Routes**
- ✅ Claude API integration (`app/api/claude/route.ts`)
- ✅ Stripe checkout (`app/api/stripe/checkout/`)
- ✅ Stripe webhook (`app/api/stripe/webhook/`)

### 6. **Components**
- ✅ Button, Card, Badge, Input, Toggle
- ✅ Site Header & Footer

---

## 🚧 What Needs to Be Completed

### **Phase 1: Environment Setup & Testing** (30 min)
1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   - Create `.env.local` with:
     ```
     ANTHROPIC_API_KEY=sk-...
     STRIPE_SECRET_KEY=sk_test_...
     STRIPE_PUBLISHABLE_KEY=pk_test_...
     STRIPE_WEBHOOK_SECRET=whsec_...
     NEXT_PUBLIC_SITE_URL=http://localhost:3000
     ```

3. **Run dev server**
   ```bash
   npm run dev
   ```

4. **Test basic flow**
   - Does landing page load?
   - Does analyze page accept CSV upload?
   - Do parsers work?

---

### **Phase 2: Complete Missing Pieces** (2-4 hours)

#### **2.1 Verify & Fix Report Page**
- [ ] Check if `app/report/page.tsx` exists and is complete
- [ ] Should display:
  - Full savings breakdown by category
  - Each service with alternatives, pricing, instructions
  - Negotiation scripts where applicable
  - Links to alternatives (including affiliate links)
  - Download as PDF button
- [ ] Test the full flow: Upload → Preview → Pay → Report

#### **2.2 Stripe Integration**
- [ ] Verify Stripe checkout flow works
- [ ] Test webhook receives payment confirmation
- [ ] Ensure report unlocks after successful payment
- [ ] Add proper error handling

#### **2.3 Claude API Integration**
- [ ] Test AI matching of merchant names
- [ ] Verify API calls work with real data
- [ ] Add error handling for API failures
- [ ] Implement fallback to fuzzy matching if API fails

#### **2.4 CSV/PDF Parsing**
- [ ] Test with real bank statements from:
  - Chase
  - Bank of America
  - Apple Card
  - Wells Fargo
  - Capital One
- [ ] Fix any parsing bugs
- [ ] Handle edge cases (weird formats, missing columns)

---

### **Phase 3: Polish & UX** (2-3 hours)

#### **3.1 UI Polish**
- [ ] Loading states for all async operations
- [ ] Error messages that are user-friendly
- [ ] Mobile responsive design
- [ ] Smooth transitions between pages

#### **3.2 Privacy & Security**
- [ ] Verify data stays client-side (no server storage)
- [ ] Auto-delete after 48 hours works
- [ ] Privacy policy page
- [ ] Clear messaging about data handling

#### **3.3 Copy & Messaging**
- [ ] Review all copy for clarity
- [ ] Add FAQ section on landing page
- [ ] Instructions for downloading bank statements
- [ ] Success messages after payment

---

### **Phase 4: Testing** (1-2 hours)

- [ ] **End-to-end test:** Upload real CSV → Preview → Pay (test mode) → Report
- [ ] **Error scenarios:**
  - Invalid CSV format
  - No recurring charges found
  - Payment fails
  - API timeout
- [ ] **Cross-browser testing:** Chrome, Safari, Firefox
- [ ] **Mobile testing:** iOS Safari, Chrome Android

---

### **Phase 5: Deployment** (1 hour)

#### **5.1 Pre-deployment**
- [ ] Add real Stripe API keys (production mode)
- [ ] Add real domain to environment variables
- [ ] Set up Stripe webhook endpoint
- [ ] Test one final time in production mode locally

#### **5.2 Deploy to Vercel**
- [ ] Connect GitHub repo to Vercel
- [ ] Set environment variables in Vercel dashboard
- [ ] Deploy
- [ ] Test live site end-to-end

#### **5.3 DNS & Domain**
- [ ] Point stopoverpaying.io to Vercel
- [ ] Verify SSL certificate
- [ ] Test production site

---

## 📋 Codex Session Prompt

When you kick off codex, use this prompt:

```
Continue building StopOverpaying.io MVP. Current status:

COMPLETED:
- Project structure, Next.js 15 app initialized
- Database expanded to 121 services across 14 categories
- Core library functions built (parsers, matching, recurring detection)
- Landing page, analyze page, API routes for Claude + Stripe
- Components (Button, Card, etc.)

YOUR TASKS:
1. Install dependencies (npm install)
2. Run dev server and verify what works
3. Complete/fix the report page (app/report/page.tsx)
4. Test and fix Stripe payment flow
5. Test and fix Claude API integration
6. Test CSV/PDF parsing with sample data
7. Add loading states and error handling
8. Polish UI/UX
9. Test end-to-end flow
10. Prepare for Vercel deployment

FILES TO FOCUS ON:
- app/report/page.tsx (likely needs completion)
- app/api/stripe/checkout/route.ts (verify payment flow)
- app/api/claude/route.ts (test AI matching)
- All parsers in lib/parsers/

TESTING:
Use sample CSV files from common banks. Focus on making the core flow bulletproof:
Upload → Parse → Detect recurring → Show preview → Pay → Show full report

CONSTRAINTS:
- Everything must work client-side (privacy-first)
- Data auto-deletes after 48 hours
- No database, use localStorage only
- Mobile responsive
- Fast and simple

OUTPUT:
Working MVP ready to deploy to Vercel.
```

---

## 🎯 Success Criteria

The MVP is complete when:
- [ ] You can upload a real bank CSV
- [ ] It detects recurring charges correctly
- [ ] Shows a preview with top savings opportunities
- [ ] Payment flow works (Stripe test mode)
- [ ] Full report displays after payment
- [ ] Report shows alternatives, instructions, links for each service
- [ ] Works on mobile
- [ ] Deployable to Vercel
- [ ] No critical bugs

---

## 📊 Estimated Time

- **Phase 1:** 30 minutes
- **Phase 2:** 2-4 hours
- **Phase 3:** 2-3 hours
- **Phase 4:** 1-2 hours
- **Phase 5:** 1 hour

**Total:** 6-10 hours of focused work

---

## 📝 Notes

- The previous codex session built a strong foundation
- We just expanded the database significantly (74 → 121 services)
- Main unknowns: Report page completion, Stripe integration status
- Focus should be on getting the core flow working end-to-end
- Polish can come later; MVP first

---

**Next Action:** Kick off codex session with the prompt above
