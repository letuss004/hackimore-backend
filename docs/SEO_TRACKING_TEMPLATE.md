# SEO Tracking Spreadsheet Template
## Google Sheets Structure cho Monitoring

---

## Sheet 1: Weekly Traffic & Conversions

| Week | Start Date | End Date | Organic Visits | Paid Visits | Total Visits | Demo Requests | Conv. Rate | Notes |
|------|------------|----------|----------------|-------------|--------------|---------------|------------|-------|
| 1 | 2026-01-13 | 2026-01-19 | 0 | 0 | 0 | 0 | 0% | Initial setup |
| 2 | 2026-01-20 | 2026-01-26 | 10 | 0 | 10 | 0 | 0% | Submitted sitemap |
| 3 | 2026-01-27 | 2026-02-02 | 50 | 0 | 50 | 1 | 2% | First content indexed |
| 4 | 2026-02-03 | 2026-02-09 | 100 | 0 | 100 | 2 | 2% | 3 articles published |
| ... | | | | | | | | |

**Formulas:**
- `Conv. Rate = Demo Requests / Total Visits * 100`
- `Growth % = (This Week - Last Week) / Last Week * 100`

---

## Sheet 2: Keyword Rankings

| Keyword | Volume | Difficulty | Type | Current Rank | Prev Rank | Change | URL | Last Checked |
|---------|--------|------------|------|--------------|-----------|--------|-----|--------------|
| tạo website miễn phí | 8,100 | 55 | Primary | - | - | - | /blog/tao-website-mien-phi | 2026-01-12 |
| phát triển web app | 2,400 | 58 | Primary | - | - | - | / | 2026-01-12 |
| outsourcing IT Việt Nam | 1,300 | 45 | Primary | - | - | - | / | 2026-01-12 |
| tạo website miễn phí có demo | 260 | 25 | Long-tail | - | - | - | / | 2026-01-12 |
| dịch vụ phát triển web trả phí sau | 170 | 18 | Long-tail | - | - | - | / | 2026-01-12 |
| làm web app miễn phí demo 1 tuần | 140 | 15 | Long-tail | - | - | - | / | 2026-01-12 |
| POD Pay On Delight | <10 | 10 | Branded | - | - | - | / | 2026-01-12 |
| ... | | | | | | | | |

**How to track:**
1. **Manual:** Google search in incognito, record position
2. **Search Console:** Performance > Queries (free, accurate)
3. **Paid tools:** SERPWatcher, AccuRanker (trial)

**Update frequency:** Weekly (Monday morning)

**Color coding:**
- 🟢 Green: Rank improved
- 🔴 Red: Rank dropped
- 🟡 Yellow: No change
- ⚪ White: Not ranking yet

---

## Sheet 3: Backlinks Tracker

| Date Added | Source Domain | DA | URL From | URL To | Type | Status | Notes |
|------------|---------------|-----|----------|--------|------|--------|-------|
| 2026-01-13 | google.com | 100 | Google Business | webpod.org | Profile | Active | Claimed GBP |
| 2026-01-13 | facebook.com | 96 | FB Page | webpod.org | Profile | Active | Created page |
| 2026-01-13 | linkedin.com | 99 | Company Page | webpod.org | Profile | Active | Created company |
| 2026-01-14 | startup.gov.vn | 42 | Listing | webpod.org | Directory | Pending | Submitted |
| 2026-01-14 | topdev.vn | 38 | Company Profile | webpod.org | Directory | Active | Approved |
| 2026-01-15 | viblo.asia | 32 | User Profile | webpod.org | Profile | Active | Published article |
| ... | | | | | | | |

**Types:**
- Profile: Social media, community profiles
- Directory: Business listings
- Guest Post: Article on other site
- Editorial: Natural mention/link
- Resource: Listed in resource page
- Comment: Blog comment (low value)

**Status:**
- Pending: Submitted, awaiting approval
- Active: Live link
- Removed: Link removed/broken
- Nofollow: Link has nofollow attribute

**Total Backlinks:** `=COUNTIF(Status, "Active")`  
**Total Referring Domains:** `=COUNTUNIQUE(Source Domain)` (where Status = Active)  
**Avg DA:** `=AVERAGE(DA)` (where Status = Active)

---

## Sheet 4: Content Calendar & Performance

| Title | Target Keyword | Status | Assigned To | Draft Date | Publish Date | URL | Words | Traffic (30d) | Conv. | Notes |
|-------|---------------|--------|-------------|------------|--------------|-----|-------|---------------|-------|-------|
| Tạo Website Miễn Phí: 7 Cách 2026 | tạo website miễn phí | ✅ Published | POD Team | 2026-01-15 | 2026-01-18 | /blog/tao-website-mien-phi | 2,500 | - | - | Cornerstone |
| Phát triển Web App A-Z | phát triển web app | 📝 Writing | POD Team | 2026-01-20 | 2026-01-23 | /blog/phat-trien-web-app | 3,000 | - | - | Cornerstone |
| Outsourcing IT VN Guide | outsourcing IT Việt Nam | 📋 Planned | POD Team | 2026-01-25 | 2026-01-28 | /blog/outsourcing-it-vietnam | 2,500 | - | - | Cornerstone |
| Next.js 14 Tutorial | next.js tutorial | 📋 Planned | Freelancer | 2026-02-01 | 2026-02-05 | /blog/nextjs-14-tutorial | 3,500 | - | - | Technical |
| ... | | | | | | | | | | |

**Status values:**
- 📋 Planned: In content calendar
- 📝 Writing: In progress
- ✏️ Editing: Written, being edited
- 📸 Design: Adding images/design
- ✅ Published: Live
- 🔄 Updated: Refreshed existing

**Performance tracking:**
- Traffic: From GA4 (30 days after publish)
- Conv.: Conversions attributed to this page
- ROI: Revenue / Content cost

**Content budget:**
- Self-written: 0đ
- Freelancer: 400-500k/bài
- Agency: 1-2M/bài

---

## Sheet 5: Technical SEO Audit

| Item | Status | Priority | Date Checked | Date Fixed | Notes |
|------|--------|----------|--------------|------------|-------|
| Google Search Console verified | ✅ Done | P1 | 2026-01-13 | 2026-01-13 | Verified |
| Bing Webmaster verified | ✅ Done | P1 | 2026-01-13 | 2026-01-13 | Verified |
| Sitemap submitted | ✅ Done | P1 | 2026-01-13 | 2026-01-13 | webpod.org/sitemap.xml |
| Google Business claimed | ⏳ Pending | P1 | 2026-01-13 | - | Awaiting verification |
| og-image.jpg created | ❌ Todo | P1 | - | - | 1200x630px needed |
| Images optimized (WebP) | ❌ Todo | P2 | - | - | Use Squoosh |
| Favicon all sizes | ⚠️ Partial | P2 | 2026-01-12 | - | Have SVG, need PNG sizes |
| Alt text all images | ❌ Todo | P2 | - | - | Future images |
| Lazy loading implemented | ❌ Todo | P2 | - | - | Add loading="lazy" |
| PageSpeed score >90 | ⏳ Testing | P2 | 2026-01-12 | - | Currently ~85 |
| Mobile-friendly | ✅ Pass | P1 | 2026-01-12 | - | Responsive |
| HTTPS/SSL | ✅ Active | P1 | 2026-01-12 | - | Valid cert |
| Structured data valid | ✅ Valid | P1 | 2026-01-12 | - | 6 schemas |
| Robots.txt optimized | ✅ Done | P1 | 2026-01-12 | - | Configured |
| ... | | | | | |

**Status:**
- ✅ Done: Completed
- ⏳ Pending: In progress
- ❌ Todo: Not started
- ⚠️ Partial: Partially complete
- 🔴 Issue: Has problem

**Priority:**
- P1: Critical (do first)
- P2: Important (do soon)
- P3: Nice to have (later)

---

## Sheet 6: Competitor Analysis

| Competitor | Domain | DA | Est. Traffic | Top Keywords | Backlinks | Strategy | Our Advantage |
|------------|--------|-----|--------------|--------------|-----------|----------|---------------|
| topdev.vn | topdev.vn | 58 | 500K/mo | tuyển dụng IT, việc làm IT | 15K | Job platform | We focus services, not jobs |
| glints.com/vn | glints.com | 72 | 800K/mo | việc làm, tuyển dụng | 25K | International brand | Better Vietnamese content |
| stringee.com | stringee.com | 45 | 50K/mo | API communication | 5K | Narrow focus | Broader web dev |
| tino.org | tino.org | 38 | 30K/mo | tạo web, website builder | 3K | DIY builder | Custom development |
| sapo.vn | sapo.vn | 62 | 200K/mo | e-commerce, bán hàng | 12K | SaaS subscription | POD model, ownership |

**Track monthly:**
- DA changes (Ahrefs/Moz)
- Traffic estimates (SimilarWeb)
- New content published
- Backlink growth
- Keyword movements

**Competitive gaps:**
- Keywords they rank for (we don't)
- Content topics they cover
- Backlink sources
- Features they offer

**Our differentiation:**
- POD model (unique)
- Modern tech stack
- Zero risk approach
- Full ownership

---

## Sheet 7: Monthly Goals & Results

### January 2026

| Goal | Target | Actual | Status | Notes |
|------|--------|--------|--------|-------|
| Setup Search Console | Done | ✅ Done | ✅ | Verified Jan 13 |
| Setup Google Business | Done | ⏳ Pending | ⏳ | Awaiting verification |
| Publish 3 cornerstone articles | 3 | 0 | ❌ | In progress |
| Get 20 backlinks | 20 | 5 | 🟡 | 5 directory submissions |
| Pages indexed | 10 | 0 | ❌ | Submitted sitemap |
| Organic traffic | 100 | 0 | ❌ | Too early |
| PageSpeed score | 90+ | 85 | 🟡 | Needs optimization |

### February 2026 (Planned)

| Goal | Target | Actual | Status | Notes |
|------|--------|--------|--------|-------|
| Publish 10 articles | 10 | - | 📋 | Planned |
| Get 30 more backlinks | 30 | - | 📋 | Guest posts |
| Keywords TOP 100 | 10 | - | 📋 | Long-tail focus |
| Organic traffic | 500 | - | 📋 | From new content |
| Demo requests | 5 | - | 📋 | 1% conv rate |

### Q1 2026 Goals (Jan-Mar)

- 📊 **Traffic:** 1,000 organic visits/month
- 📝 **Content:** 30 blog posts published
- 🔗 **Backlinks:** 100 total backlinks
- 📈 **Rankings:** 20 keywords in TOP 100
- 💰 **Conversions:** 20 demo requests
- 🎯 **Revenue:** 200M VNĐ from organic (2 projects closed)

---

## Sheet 8: Budget & ROI Tracking

| Month | Content Cost | Tools Cost | Ads Cost | Other | Total Spend | Demo Requests | Closed Deals | Revenue | ROI |
|-------|-------------|------------|----------|-------|-------------|---------------|--------------|---------|-----|
| Jan 2026 | 0đ | 0đ | 0đ | 0đ | 0đ | 0 | 0 | 0đ | - |
| Feb 2026 | 5M | 0đ | 0đ | 0đ | 5M | 5 | 0 | 0đ | -100% |
| Mar 2026 | 5M | 2M | 0đ | 0đ | 7M | 10 | 1 | 100M | 1,329% |
| Apr 2026 | 10M | 2M | 3M | 0đ | 15M | 20 | 2 | 200M | 1,233% |
| ... | | | | | | | | | |

**ROI Formula:**
```
ROI = (Revenue - Total Spend) / Total Spend * 100
```

**Key Metrics:**
- **CAC (Customer Acquisition Cost):** Total Spend / Closed Deals
- **LTV (Lifetime Value):** Avg project value * repeat rate
- **Payback Period:** CAC / Monthly revenue per customer

**Budget allocation recommendations:**
- Month 1-3: 0đ (bootstrap)
- Month 4-6: 5-10M/month (content + tools)
- Month 7-12: 20-30M/month (aggressive growth)

---

## Sheet 9: Action Items & Tasks

| Task | Priority | Assigned | Due Date | Status | Dependencies | Notes |
|------|----------|----------|----------|--------|--------------|-------|
| Create og-image.jpg | P1 | Designer | 2026-01-14 | ❌ Todo | - | 1200x630px |
| Submit Search Console | P1 | Dev | 2026-01-13 | ✅ Done | - | Verified |
| Write article #1 | P1 | Writer | 2026-01-18 | 📝 In Progress | - | Tạo web miễn phí |
| Claim Google Business | P1 | Marketing | 2026-01-13 | ⏳ Pending | - | Awaiting verify |
| 10 directory submissions | P2 | Marketing | 2026-01-20 | 🟡 50% | - | 5/10 done |
| Optimize PageSpeed | P2 | Dev | 2026-01-25 | ❌ Todo | - | Target 90+ |
| Guest post outreach | P2 | Marketing | 2026-02-01 | ❌ Todo | Articles published | Need content first |
| ... | | | | | | |

**Status:**
- ✅ Done
- 📝 In Progress
- ⏳ Pending (waiting)
- 🟡 Partial (50%+)
- ❌ Todo
- 🔴 Blocked

---

## Sheet 10: Notes & Learnings

| Date | Topic | Finding | Action Taken | Result |
|------|-------|---------|--------------|--------|
| 2026-01-12 | Keyword research | "tạo website miễn phí" has 8.1K/mo volume | Added to target list | TBD |
| 2026-01-13 | Competitor analysis | topdev.vn ranks high but focuses jobs | Focus on services, not recruitment | TBD |
| 2026-01-15 | Content | Long-form (2500+ words) ranks better | Aim for 2500+ words per article | TBD |
| 2026-01-20 | Link building | Viblo.asia gives dofollow links | Publish more on Viblo | TBD |
| ... | | | | |

---

## How to Use This Spreadsheet

### Daily (5 minutes)
- [ ] Check GA4 for traffic
- [ ] Check Search Console for errors
- [ ] Update any status changes in Action Items

### Weekly (30 minutes - Monday morning)
- [ ] Update Weekly Traffic sheet
- [ ] Check keyword rankings (top 10 keywords)
- [ ] Add new backlinks discovered
- [ ] Review action items, update priorities
- [ ] Plan next week's tasks

### Monthly (2 hours - First Monday)
- [ ] Full keyword ranking check (all keywords)
- [ ] Backlink audit (clean up broken/lost)
- [ ] Content performance review
- [ ] Competitor analysis update
- [ ] ROI calculation
- [ ] Set next month's goals
- [ ] Budget review

### Quarterly (4 hours)
- [ ] Comprehensive SEO audit
- [ ] Strategy review and adjust
- [ ] Tool evaluation (renew/cancel)
- [ ] Team performance review
- [ ] Big picture goals check

---

## Templates & Formulas

### Traffic Growth %
```
=(This Week - Last Week) / Last Week * 100
```

### Conversion Rate
```
=Demo Requests / Total Visits * 100
```

### ROI
```
=(Revenue - Total Spend) / Total Spend * 100
```

### Avg. Rank
```
=AVERAGE(Current Rank)
```

### Conditional Formatting

**Keyword Rank Changes:**
- Green: Improved 5+ positions
- Light green: Improved 1-4 positions
- Red: Dropped 5+ positions
- Light red: Dropped 1-4 positions
- White: No change

**Traffic Growth:**
- Green: >20% growth
- Yellow: 0-20% growth
- Red: Negative growth

---

## Google Sheets Setup Instructions

1. Create new Google Sheet: "SEO Tracking - webpod.org"
2. Create 10 tabs (sheets) với names above
3. Copy structures & formulas
4. Setup conditional formatting
5. Share with team (view/edit permissions)
6. Setup weekly reminder (Google Calendar)
7. Integrate with GA4 (Google Sheets add-on)
8. Backup monthly (Download as Excel)

---

**Template Version:** 1.0  
**Created:** January 12, 2026  
**Last Updated:** January 12, 2026  

**Access:** [Add your Google Sheets URL here]

