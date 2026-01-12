# 🚀 StopOverpaying.io - Final Deployment Checklist

**Date:** January 12, 2026  
**Status:** Code complete, ready for deployment prep

---

## 📋 Pre-Deployment (Do These First)

### ☑️ Step 1: Update Placeholder Content (5 min)

**Files to edit:**

1. **`app/privacy/page.tsx`** - Replace `support@stopoverpaying.io`
2. **`app/terms/page.tsx`** - Replace `support@stopoverpaying.io`
3. **`public/sitemap.xml`** - Confirm domain is `https://stopoverpaying.io`
4. **`public/robots.txt`** - Confirm domain is `https://stopoverpaying.io`

**Quick find/replace:**
```bash
cd /home/claw/clawd/stopoverpaying
grep -r "support@stopoverpaying.io" app/
grep -r "stopoverpaying.io" public/
```

---

### ☑️ Step 2: Domain Setup (10 min)

**If you haven't bought the domain yet:**
- [ ] Purchase `stopoverpaying.io` from Namecheap/Cloudflare/etc
- [ ] Note: Don't configure DNS yet, we'll do that after Vercel setup

**If you already own it:**
- [ ] Have DNS access ready
- [ ] Note current nameservers

---

### ☑️ Step 3: Stripe Account Setup (15 min)

**Create/Configure Stripe:**
- [ ] Sign up at https://stripe.com (if you don't have account)
- [ ] Complete business verification (required for live mode)
- [ ] Get your API keys:
  - Test mode: `sk_test_...` and `pk_test_...`
  - Live mode: `sk_live_...` and `pk_live_...`

**Set up webhook endpoint (we'll update URL after deployment):**
- [ ] Go to Stripe Dashboard → Developers → Webhooks
- [ ] Click "Add endpoint" (we'll come back to this)
- [ ] Events to listen for: `checkout.session.completed`

**Get webhook signing secret:**
- [ ] After creating webhook, copy the signing secret `whsec_...`
- [ ] Save it for later

---

### ☑️ Step 4: Claude API Key (2 min)

**Get API key:**
- [ ] Go to https://console.anthropic.com/
- [ ] Settings → API Keys
- [ ] Create new key (name it "StopOverpaying Production")
- [ ] Copy `sk-ant-...` key

---

### ☑️ Step 5: Local Testing (30 min)

**Install and test:**

```bash
cd /home/claw/clawd/stopoverpaying

# 1. Install dependencies
npm install

# 2. Create .env.local with REAL keys
cat > .env.local << 'ENVEOF'
# Required for production
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional (add if using analytics)
# NEXT_PUBLIC_ANALYTICS_ID=
ENVEOF

# 3. Start dev server
npm run dev
```

**Manual Test Checklist:**

- [ ] **Landing page** (http://localhost:3000)
  - [ ] Page loads without errors
  - [ ] All links work (How it works, FAQ, etc.)
  - [ ] "Start analysis" button goes to /analyze
  - [ ] Footer links work (Privacy, Terms)

- [ ] **Privacy & Terms pages**
  - [ ] /privacy loads correctly
  - [ ] /terms loads correctly
  - [ ] No placeholder text visible
  - [ ] Links in footer work

- [ ] **Analyze page** (http://localhost:3000/analyze)
  - [ ] Page loads
  - [ ] Can drop/select CSV file
  - [ ] File upload has 10MB limit message
  - [ ] Test with a real bank CSV:
    - [ ] Parsing works
    - [ ] Shows recurring charges
    - [ ] Shows preview of savings
    - [ ] "Unlock full report" button appears

- [ ] **Stripe Checkout** (TEST MODE)
  - [ ] Click "Unlock full report"
  - [ ] Redirects to Stripe checkout
  - [ ] Use test card: `4242 4242 4242 4242`, any future date, any CVC
  - [ ] Completes payment
  - [ ] Redirects back to /report?paid=true

- [ ] **Report page** (http://localhost:3000/report)
  - [ ] Shows full savings report
  - [ ] All services listed with alternatives
  - [ ] Savings calculations shown
  - [ ] Instructions/scripts visible
  - [ ] Links to alternatives work

- [ ] **Mobile responsiveness**
  - [ ] Open Chrome DevTools → Toggle device toolbar
  - [ ] Test iPhone SE, iPhone 12 Pro, iPad
  - [ ] All buttons clickable
  - [ ] No horizontal scroll
  - [ ] Text readable

- [ ] **Console Errors**
  - [ ] Open DevTools → Console
  - [ ] No errors on any page
  - [ ] No warnings that look problematic

**If anything fails:**
- [ ] Fix issues before deploying
- [ ] Re-test until everything works

---

## 🚀 Deployment to Vercel

### ☑️ Step 6: Git Commit & Push (5 min)

```bash
cd /home/claw/clawd/stopoverpaying

# Check what's changed
git status

# Add all changes
git add .

# Commit
git commit -m "Launch prep: Legal pages, security headers, SEO, error handling"

# Push to GitHub (if not already)
git remote add origin https://github.com/YOUR_USERNAME/stopoverpaying.git
git branch -M main
git push -u origin main
```

**If you don't have a GitHub repo yet:**
```bash
# Create new repo at github.com/new
# Name it: stopoverpaying
# Keep it private for now
# Then run the commands above
```

---

### ☑️ Step 7: Deploy to Vercel (10 min)

**Option A: Vercel Dashboard (Easier)**

1. [ ] Go to https://vercel.com/new
2. [ ] Sign in with GitHub
3. [ ] Click "Import Project"
4. [ ] Select your `stopoverpaying` repo
5. [ ] Vercel auto-detects Next.js ✅
6. [ ] Click "Deploy"
7. [ ] Wait 2-3 minutes for build
8. [ ] Note your deployment URL: `stopoverpaying.vercel.app`

**Option B: Vercel CLI (Faster for repeat deploys)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts
```

---

### ☑️ Step 8: Configure Environment Variables in Vercel (10 min)

**In Vercel Dashboard:**

1. [ ] Go to your project
2. [ ] Settings → Environment Variables
3. [ ] Add these variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Production |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Production ⚠️ |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Production ⚠️ |
| `NEXT_PUBLIC_SITE_URL` | `https://stopoverpaying.io` | Production |

⚠️ **Important:** Use LIVE Stripe keys for production, not test keys!

4. [ ] Click "Save"
5. [ ] Redeploy: Deployments → Latest → "Redeploy"

---

### ☑️ Step 9: Update Stripe Webhook (5 min)

**Now that you have a live URL:**

1. [ ] Go to Stripe Dashboard → Developers → Webhooks
2. [ ] Click "Add endpoint"
3. [ ] Endpoint URL: `https://stopoverpaying.vercel.app/api/stripe/webhook`
4. [ ] Select events: `checkout.session.completed`
5. [ ] Click "Add endpoint"
6. [ ] Copy the new webhook secret `whsec_...`
7. [ ] Update `STRIPE_WEBHOOK_SECRET` in Vercel (Step 8)
8. [ ] Redeploy again

---

### ☑️ Step 10: Point Domain to Vercel (10 min)

**In Vercel Dashboard:**

1. [ ] Go to your project → Settings → Domains
2. [ ] Add domain: `stopoverpaying.io`
3. [ ] Add www redirect: `www.stopoverpaying.io` → `stopoverpaying.io`
4. [ ] Vercel will show DNS instructions

**In Your Domain Registrar (Namecheap/Cloudflare/etc):**

**Option A: Point nameservers to Vercel (Recommended)**
- [ ] Set nameservers to Vercel's (shown in Vercel dashboard)
- [ ] Wait 1-2 hours for propagation

**Option B: Add A record**
- [ ] Add A record: `@` → `76.76.21.21`
- [ ] Add CNAME: `www` → `cname.vercel-dns.com`
- [ ] Wait 10-30 minutes

**Verify:**
- [ ] Wait for DNS propagation
- [ ] Visit https://stopoverpaying.io
- [ ] SSL certificate should auto-provision (2-5 min)
- [ ] Green padlock in browser

---

## ✅ Post-Deployment Testing (30 min)

### ☑️ Step 11: Production Smoke Test

**Test LIVE site:**

- [ ] Visit https://stopoverpaying.io
- [ ] Landing page loads
- [ ] All links work
- [ ] Privacy & Terms pages accessible
- [ ] No console errors

**Test full user flow with REAL Stripe:**

⚠️ **Warning:** This will charge a real $7 payment!

1. [ ] Go to https://stopoverpaying.io/analyze
2. [ ] Upload a real bank CSV
3. [ ] Verify parsing works
4. [ ] Click "Unlock full report" ($7)
5. [ ] Use REAL credit card (or test in Stripe test mode first)
6. [ ] Complete payment
7. [ ] Verify redirect to /report?paid=true
8. [ ] Verify full report displays
9. [ ] Check Stripe Dashboard → Payments
10. [ ] Verify webhook received (Events tab)

**If webhook fails:**
- [ ] Check webhook URL is correct
- [ ] Check webhook secret in Vercel env vars
- [ ] Check Stripe Dashboard → Webhook → Recent deliveries

---

### ☑️ Step 12: Mobile Testing (15 min)

**Test on real devices:**

- [ ] **iPhone:** Visit site in Safari
  - [ ] Upload CSV works
  - [ ] Payment works
  - [ ] Report displays correctly

- [ ] **Android:** Visit site in Chrome
  - [ ] Upload CSV works
  - [ ] Payment works
  - [ ] Report displays correctly

**If no real devices:**
- [ ] Use BrowserStack (browserstack.com - free trial)
- [ ] Test iPhone 13 + Android Galaxy S21

---

### ☑️ Step 13: Performance Check (5 min)

**Run Lighthouse:**

1. [ ] Open https://stopoverpaying.io in Chrome
2. [ ] Open DevTools → Lighthouse tab
3. [ ] Run audit (Mobile + Desktop)
4. [ ] Target scores:
   - Performance: 90+
   - Accessibility: 95+
   - Best Practices: 95+
   - SEO: 100

**If scores are low:**
- [ ] Check console for errors
- [ ] Verify images optimized
- [ ] Check bundle size: `npm run build` locally

---

## 🎉 Launch Preparation

### ☑️ Step 14: Set Up Analytics (15 min)

**Option A: Plausible (Recommended - Privacy-first)**

1. [ ] Sign up at https://plausible.io
2. [ ] Add site: `stopoverpaying.io`
3. [ ] Copy tracking script
4. [ ] Add to `app/layout.tsx` in `<head>`:

```tsx
<Script
  defer
  data-domain="stopoverpaying.io"
  src="https://plausible.io/js/script.js"
/>
```

5. [ ] Redeploy
6. [ ] Verify tracking works (visit site, check Plausible)

**Option B: Posthog (Free tier, includes session replay)**

1. [ ] Sign up at https://posthog.com
2. [ ] Create project
3. [ ] Copy snippet
4. [ ] Add to `app/layout.tsx`

---

### ☑️ Step 15: Error Tracking (10 min)

**Set up Sentry:**

1. [ ] Sign up at https://sentry.io
2. [ ] Create new project (Next.js)
3. [ ] Install: `npm install @sentry/nextjs`
4. [ ] Run: `npx @sentry/wizard@latest -i nextjs`
5. [ ] Follow wizard (auto-configures)
6. [ ] Commit changes
7. [ ] Redeploy

---

### ☑️ Step 16: Monitoring (5 min)

**Set up uptime monitoring:**

1. [ ] Sign up at https://uptimerobot.com (free)
2. [ ] Add monitor: `https://stopoverpaying.io`
3. [ ] Check interval: 5 minutes
4. [ ] Alert email: Your email
5. [ ] Add webhook monitor: `https://stopoverpaying.io/api/stripe/webhook`

---

## 🚀 Launch Day!

### ☑️ Step 17: Pre-Launch Final Check (15 min)

**Run through everything one more time:**

- [ ] Site loads at https://stopoverpaying.io
- [ ] SSL works (green padlock)
- [ ] Privacy & Terms pages complete
- [ ] Upload → Parse → Pay → Report flow works
- [ ] Stripe payments working
- [ ] Webhook receiving events
- [ ] Analytics tracking
- [ ] Error tracking configured
- [ ] Mobile works
- [ ] No console errors
- [ ] Lighthouse scores good

---

### ☑️ Step 18: Soft Launch (Optional)

**Before public launch:**

- [ ] Share with 5-10 friends/family
- [ ] Ask them to test the full flow
- [ ] Collect feedback
- [ ] Fix any critical bugs
- [ ] Refund test payments if needed

---

### ☑️ Step 19: ProductHunt Launch (D-Day)

**Prepare assets:**

- [ ] Create ProductHunt account
- [ ] Schedule launch (hunt.app)
- [ ] Prepare:
  - [ ] Tagline: "Find the bills you can shrink in one scan"
  - [ ] First comment (explain the product)
  - [ ] Product images/GIFs
  - [ ] Maker intro

**Launch day:**

- [ ] Submit to ProductHunt (early morning best)
- [ ] Reply to all comments
- [ ] Share on Twitter
- [ ] Monitor uptime & errors

---

### ☑️ Step 20: Marketing Push

**After launch:**

- [ ] Post Twitter thread explaining the problem/solution
- [ ] Post on relevant subreddits (r/personalfinance, r/frugal)
- [ ] Share in startup communities
- [ ] Write launch blog post
- [ ] Email friends/family

---

## 📊 Post-Launch Monitoring (Week 1)

### Daily Checks:

- [ ] Check Stripe Dashboard for payments
- [ ] Check analytics for traffic
- [ ] Check Sentry for errors
- [ ] Check UptimeRobot for downtime
- [ ] Respond to user feedback
- [ ] Monitor webhook delivery rate

### Weekly Checks:

- [ ] Review analytics trends
- [ ] Calculate conversion rate (views → payments)
- [ ] Review most common errors
- [ ] Check performance metrics
- [ ] Plan next improvements

---

## 🎯 Success Metrics

**Week 1 Goals:**
- [ ] 100+ unique visitors
- [ ] 10+ CSV uploads
- [ ] 2+ payments ($14+ revenue)
- [ ] 0 critical bugs
- [ ] <1% error rate

**Month 1 Goals:**
- [ ] 1,000+ unique visitors
- [ ] 100+ CSV uploads  
- [ ] 20+ payments ($140+ revenue)
- [ ] Positive user feedback
- [ ] 3+ repeat visitors

---

## 🚨 Troubleshooting

### If payments fail:
1. Check Stripe Dashboard → Logs
2. Verify webhook endpoint URL
3. Check webhook secret matches
4. Test in Stripe test mode first

### If CSV parsing fails:
1. Check browser console for errors
2. Verify file size < 10MB
3. Check CSV has required columns
4. Test with sample bank CSVs

### If site is down:
1. Check Vercel Dashboard → Deployments
2. Check for failed builds
3. Review error logs
4. Check DNS settings

### If analytics not tracking:
1. Check script is in `<head>`
2. Verify domain matches
3. Check ad blockers disabled
4. Wait 5-10 minutes for first data

---

## ✅ Final Checklist Summary

**Before deployment:**
- [x] Update placeholder emails
- [x] Get Stripe keys
- [x] Get Claude API key
- [x] Test locally completely
- [x] Commit to GitHub

**Deployment:**
- [ ] Deploy to Vercel
- [ ] Add environment variables
- [ ] Set up Stripe webhook
- [ ] Point domain
- [ ] Verify SSL

**Post-deployment:**
- [ ] Test production flow
- [ ] Mobile testing
- [ ] Set up analytics
- [ ] Set up error tracking
- [ ] Set up monitoring

**Launch:**
- [ ] Soft launch with friends
- [ ] ProductHunt launch
- [ ] Marketing push
- [ ] Monitor & iterate

---

## 🎉 You're Ready!

Once you complete this checklist, StopOverpaying.io will be LIVE and ready to make money!

**Estimated Total Time:** 4-6 hours (including testing)

**Questions?** Check back to specific sections above.

**Good luck with the launch! 🚀**
