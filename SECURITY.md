# Security Overview

This document outlines the security measures implemented in StopOverpaying.

## Security Features

### 1. Rate Limiting ✅

**Implementation:** In-memory rate limiter for API endpoints.

**Limits:**
- Claude API: 10 requests per minute per IP
- Stripe Checkout: 5 requests per minute per IP

**Location:** `lib/rate-limit.ts`

**Upgrade Path:** For production with multiple instances, replace with Redis-backed solution:
```bash
npm install @upstash/ratelimit @upstash/redis
```

### 2. Data Encryption ✅

**Implementation:** AES encryption for sensitive financial data in localStorage.

**Details:**
- Per-session encryption keys (stored in sessionStorage)
- Keys are cleared when browser tab closes
- Automatic expiry after 48 hours

**Location:** `lib/secure-storage.ts`

**Protected Data:**
- Bank transactions
- Recurring charges
- Savings reports
- Matched services

### 3. Security Headers ✅

**Implemented:**
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options (DENY)
- X-Content-Type-Options (nosniff)
- Referrer-Policy
- Permissions-Policy

**Location:** `next.config.mjs`

### 4. Input Validation ✅

**File Upload Validation:**
- Maximum file size: 10MB
- Allowed types: CSV, PDF
- File extension verification
- Path traversal prevention

**CSV Injection Prevention:**
- Cells starting with `=`, `+`, `-`, or `@` are sanitized
- Prevents formula injection attacks

**Location:** `lib/file-validation.ts`, `lib/parsers/csv.ts`

### 5. Dependency Security ✅

**Measures:**
- All dependencies updated to latest versions
- Critical Next.js vulnerabilities patched (upgraded to 15.5.9)
- Pre-commit hooks to prevent secrets in commits

**Commands:**
```bash
npm audit                    # Check for vulnerabilities
npm audit fix                # Auto-fix vulnerabilities
npm outdated                 # Check for outdated packages
```

## Security Best Practices

### Environment Variables

**Required for production:**
```bash
# .env.local (NEVER commit this file)
ANTHROPIC_API_KEY=sk-ant-xxx
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

**Git protection:**
- `.env.local` is in `.gitignore`
- Pre-commit hook blocks `.env*` files
- Pre-commit hook warns about potential secrets

### API Key Management

**Stripe:**
- Use publishable key restrictions (domain whitelist)
- Rotate keys regularly
- Monitor dashboard for unusual activity

**Claude API:**
- Monitor usage and costs
- Set up billing alerts
- Rate limiting prevents abuse

### Data Protection

**Client-side:**
- All processing happens in browser
- No data sent to server except for AI matching
- Encrypted localStorage for sensitive data
- 48-hour auto-expiry

**Server-side:**
- API routes are stateless
- No data stored in database
- Rate limiting on expensive operations

### CORS & Origin Validation

API routes check origin headers to prevent:
- Cross-site request forgery (CSRF)
- Unauthorized API access

**Note:** Add CSRF tokens if you implement user accounts.

## Known Limitations

### Current In-Memory Rate Limiting

**Issue:** Rate limits are per-process, not shared across multiple instances.

**Risk:** If deployed to multiple servers, each has its own limit counters.

**Solution:** Use Redis-backed rate limiting for production:
```typescript
// Example with Upstash Redis
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});
```

### localStorage Security

**Issue:** Even with encryption, localStorage can be accessed by:
- XSS attacks (if any exist)
- Browser extensions
- Users with physical access

**Mitigation:**
- CSP headers prevent XSS
- Encryption adds defense-in-depth
- 48-hour auto-expiry limits exposure

**Better Alternative:** Don't store sensitive data at all. Process and display, then discard.

## Incident Response

### If API Keys Are Compromised

1. **Immediately rotate keys:**
   - Anthropic: console.anthropic.com
   - Stripe: dashboard.stripe.com

2. **Check for unauthorized usage:**
   - Review API logs
   - Check billing for unusual activity

3. **Update environment variables:**
   ```bash
   # Update .env.local with new keys
   # Redeploy application
   ```

### If Suspicious Activity Detected

1. **Check rate limit logs** (add logging if not present)
2. **Review Stripe webhook events**
3. **Monitor Claude API usage**
4. **Consider temporarily disabling features**

## Security Checklist

Before deploying to production:

- [ ] All environment variables are set securely (not committed)
- [ ] HTTPS is enforced (Strict-Transport-Security header)
- [ ] Rate limiting is enabled and tested
- [ ] Security headers are configured
- [ ] Dependencies are up-to-date (no critical vulnerabilities)
- [ ] File upload validation is working
- [ ] Sensitive data is encrypted in storage
- [ ] Error messages don't leak sensitive info
- [ ] Monitoring/logging is set up (recommended: Sentry)
- [ ] Stripe webhook signature verification (if using webhooks)
- [ ] Regular security audits scheduled

## Reporting Security Issues

If you discover a security vulnerability, please email: [your-email]@example.com

**Please do not:**
- Open a public GitHub issue
- Share details publicly before a fix is available

**Please include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Stripe Security Best Practices](https://stripe.com/docs/security)
- [Anthropic API Security](https://docs.anthropic.com/claude/docs/api-security)

---

**Last Updated:** January 13, 2026  
**Security Review:** Completed ✅
