# StopOverpaying.io - Pre-Launch Checklist

**Review Date:** January 12, 2026  
**Status:** Code complete, needs polish before launch

---

## 🚨 CRITICAL (Must Fix Before Launch)

### 1. **Legal Pages** ❌ MISSING
- [ ] Privacy Policy page (`app/privacy/page.tsx`)
- [ ] Terms of Service page (`app/terms/page.tsx`)
- [ ] Update footer links to point to real pages (currently says "placeholder")
- [ ] Include GDPR/CCPA compliance language
- [ ] Mention Stripe as payment processor

**Why Critical:** Legal requirement, Stripe won't approve without these

---

### 2. **SEO & Metadata** ⚠️ INCOMPLETE
- [x] Basic title/description in layout
- [ ] Add Open Graph tags for social sharing
- [ ] Add favicon and app icons
- [ ] Create `robots.txt` and `sitemap.xml`
- [ ] Add proper meta description per page
- [ ] Schema.org structured data for SaaS product

**Current metadata:**
```tsx
title: "StopOverpaying.io"
description: "Analyze bank statements locally and uncover savings on recurring bills."
```

**Needs:** More compelling copy, OG images, Twitter cards

---

### 3. **Analytics & Tracking** ❌ MISSING
- [ ] Add analytics (Plausible, Fathom, or Posthog recommended)
- [ ] Track conversions: Upload → Preview → Payment → Report
- [ ] Error tracking (Sentry or similar)
- [ ] Stripe payment success/failure tracking

**Why Critical:** Can't optimize what you don't measure

---

### 4. **Error Handling & User Feedback** ⚠️ PARTIAL
- [x] Basic error states in analyze page
- [x] Stripe checkout error handling
- [ ] Better error messages (more user-friendly)
- [ ] Network timeout handling
- [ ] File size limits (what if someone uploads 100MB?)
- [ ] Invalid CSV format - show example of correct format
- [ ] Rate limiting protection

---

## ⚠️ HIGH PRIORITY (Should Fix Before Launch)

### 5. **Security Headers** ❌ MISSING
Current `next.config.mjs` has no security headers.

**Add:**
```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
      ]
    }
  ];
}
```

---

### 6. **Performance Optimization** ⚠️ NEEDS REVIEW
- [ ] Image optimization (add Next.js Image component)
- [ ] Code splitting verification
- [ ] Bundle size analysis (`npm run build` and check)
- [ ] Lazy load heavy dependencies (pdf-parse, papaparse)
- [ ] Add loading skeletons during parsing

---

### 7. **Mobile Experience** ⚠️ NEEDS TESTING
- [x] Basic responsive design
- [ ] Test on real devices (iOS Safari, Chrome Android)
- [ ] File upload works on mobile?
- [ ] Buttons are thumb-friendly (min 44px tap targets)
- [ ] Horizontal scroll issues?

---

### 8. **Copy & Messaging** ⚠️ NEEDS POLISH
**Landing Page:**
- Headline is good but could be punchier
- FAQ section is good but add more questions:
  - "Do you sell my data?" (No, we don't even store it)
  - "How accurate is the matching?"
  - "Can I cancel after paying?" (No refunds policy)
  - "What if I don't find savings?" (Set expectations)

**Analyze Page:**
- Add instructions: "How to export CSV from your bank"
- Show example CSV format
- Better empty state messages

---

### 9. **Testing Checklist** ❌ NOT DONE
- [ ] Test with real CSVs from each supported bank
- [ ] Test edge cases:
  - Empty CSV
  - CSV with only 1-2 transactions
  - Very large CSV (10k+ transactions)
  - Malformed CSV
  - PDF with weird formatting
- [ ] Test Stripe flow end-to-end
- [ ] Test Claude API timeout/failure
- [ ] Cross-browser testing
- [ ] Mobile device testing

---

## 💡 NICE TO HAVE (Post-Launch)

### 10. **User Experience Enhancements**
- [ ] Sample CSV download button ("Not sure what format? Download example")
- [ ] Progress bar during parsing
- [ ] Email report option (collect email, send PDF)
- [ ] Save report as PDF (client-side generation)
- [ ] Share results (generate shareable link with blurred amounts)

---

### 11. **Marketing & Growth**
- [ ] Add testimonials section (once you have real users)
- [ ] ProductHunt launch assets
- [ ] Twitter thread draft
- [ ] Blog post: "How we built this"
- [ ] Referral program ("Save $2 when you refer a friend")

---

### 12. **Monitoring & Maintenance**
- [ ] Set up uptime monitoring (UptimeRobot, etc.)
- [ ] Stripe webhook monitoring
- [ ] Error rate alerts
- [ ] Weekly analytics review

---

## 🔧 Code Quality Improvements

### 13. **Code Organization** ✅ GOOD
- Code structure is clean
- TypeScript types are defined
- Components are modular

**Could improve:**
- [ ] Add JSDoc comments to complex functions
- [ ] Extract magic numbers to constants (file size limits, etc.)
- [ ] Add unit tests for parsers and matching logic

---

### 14. **Environment Variables** ✅ DOCUMENTED
Current `.env.local` template is good:
```
ANTHROPIC_API_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

**Add:**
- [ ] `NEXT_PUBLIC_SITE_URL` (for production)
- [ ] `NEXT_PUBLIC_ANALYTICS_ID` (if using analytics)
- [ ] Document in README which are required vs optional

---

## 📝 Documentation Needed

### 15. **README Updates**
Current README is basic. Add:
- [ ] Installation instructions
- [ ] Environment setup guide
- [ ] How to test locally
- [ ] How to deploy
- [ ] Troubleshooting section

---

### 16. **Deployment Guide**
- [ ] Document environment variables for production
- [ ] Stripe webhook endpoint setup
- [ ] Domain configuration
- [ ] SSL certificate verification
- [ ] Post-deployment testing checklist

---

## 🎯 Pre-Launch Priority Order

### Week 1 (Before soft launch)
1. ✅ Add Privacy Policy & Terms pages
2. ✅ Add security headers
3. ✅ Add analytics tracking
4. ✅ Add error tracking (Sentry)
5. ✅ Test with real bank CSVs
6. ✅ Mobile testing
7. ✅ SEO metadata & OG tags

### Week 2 (Polish)
8. Improve error messages
9. Add FAQ items
10. Performance optimization
11. Add sample CSV download
12. Documentation updates

### Week 3 (Launch)
13. Deploy to production
14. Set up monitoring
15. ProductHunt launch
16. Marketing push

---

## ✅ What's Already Good

- Clean, modern design
- Privacy-first architecture (no server storage)
- Good error handling basics
- Mobile-responsive layout
- Fast page loads
- Simple, clear user flow
- Comprehensive savings database (121 services)

---

**Next Action:** Prioritize the CRITICAL items and knock them out in order.
