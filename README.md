# StopOverpaying.io

> Help people pay less for the same stuff they already have.

## Quick Start

1. Read `plan.md` for full project details
2. Review `data/subscriptions.json` for database structure
3. Reference: https://github.com/rohunvora/just-fucking-cancel

## Project Structure

```
stopoverpaying/
├── plan.md                    # Complete project plan & architecture
├── data/
│   └── subscriptions.json     # Savings database (20 services, expand to 150+)
└── README.md                  # This file
```

## What We're Building

A Next.js web app that:
1. Analyzes bank statements (CSV upload)
2. Identifies recurring charges
3. Shows how to pay less for each one
4. Provides negotiation scripts + alternative links
5. Charges $7 for full report

## Economics

- Cost per user: $0.50 (Claude API + Stripe)
- Revenue per user: $7 + $4-9 affiliates
- Net profit: ~$10/user
- Target: $10k+/mo at scale

## Next Steps

1. Hand off plan.md to Codex
2. Build Phase 1 MVP (3 weeks)
3. Launch on ProductHunt
4. Scale to $10k/mo

---

**Domain:** stopoverpaying.io (available)  
**Started:** January 12, 2026  
**Status:** Planning complete, ready to build
