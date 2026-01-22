# 🌍 International SEO Implementation Plan - NestJS Static Serve
## Kế hoạch triển khai Subdirectories cho English (/en/)

**Ngày tạo:** January 22, 2026  
**Cập nhật lần cuối:** January 22, 2026  
**Kiến trúc:** NestJS Backend + ServeStaticModule (KHÔNG phải Next.js)  
**Chiến lược:** SUBDIRECTORIES (`/en/` cho tiếng Anh)

---

## 📌 HIỂU RÕ KIẾN TRÚC HIỆN TẠI

### ✅ Cấu trúc thực tế:
```
hackimore-backend/
├── src/
│   └── module/
│       └── app.module.ts  ← ServeStaticModule config
├── public/
│   ├── index.html         ← Vietnamese landing page
│   ├── sitemap.xml        ← Đã có hreflang cho /en/
│   ├── robots.txt
│   ├── manifest.json
│   ├── favicon.svg
│   ├── css/
│   ├── js/
│   └── image/
└── ...
```

### ⚠️ KHÔNG PHẢI Next.js
Tài liệu cũ nhầm lẫn với Next.js i18n. Thực tế:
- **Backend:** NestJS
- **Frontend:** Static HTML/CSS/JS served bởi `ServeStaticModule`
- **Không có framework frontend** (không React, không Next.js)

### ServeStaticModule Config hiện tại:
```typescript
// src/module/app.module.ts
ServeStaticModule.forRoot({
  rootPath: path.join(__dirname, '../..', 'public'),
  serveRoot: '/',
}),
```

---

## 🎯 CHIẾN LƯỢC TRIỂN KHAI

### Cách 1: Multi-folder Static Serve ✅ RECOMMENDED
Tạo folder `/public/en/` với `index.html` riêng cho tiếng Anh.

**Ưu điểm:**
- Đơn giản nhất, không cần code backend
- ServeStaticModule tự động serve `/en/index.html` cho route `/en/`
- CSS/JS/images có thể share từ thư mục gốc

**Cấu trúc:**
```
public/
├── index.html              ← Vietnamese (/)
├── en/
│   └── index.html          ← English (/en/)
├── css/
│   └── styles.css          ← Shared CSS
├── js/
│   ├── analytics.js
│   ├── form-validation.js
│   ├── slider.js
│   └── tailwind-config.js  ← Shared JS
├── image/
│   └── ...                 ← Shared images
├── sitemap.xml
├── robots.txt
└── manifest.json
```

### Cách 2: NestJS Controller + Template Engine ❌ KHÔNG CẦN
Dùng Handlebars để render động. Phức tạp hơn, không cần thiết cho landing page đơn giản.

### Cách 3: nginx/Reverse Proxy Routing ❌ OPT-IN LATER
Có thể tối ưu sau bằng nginx rules. Không cần cho giai đoạn đầu.

---

## 📋 KẾ HOẠCH TRIỂN KHAI CHI TIẾT

### Phase 1: Setup Cấu Trúc (Week 1)

#### Task 1.1: Tạo folder `/public/en/`
```bash
mkdir -p public/en
```

#### Task 1.2: Tạo `/public/en/index.html`
Copy từ `index.html` gốc và thay đổi:

1. **`<html lang="en">` thay vì `lang="vi"`**

2. **Title & Meta tags tiếng Anh:**
```html
<title>POD - Pay On Delight | Free Website & Web App Development</title>
<meta name="title" content="POD - Pay On Delight | Free Website & Web App Development"/>
<meta name="description" content="POD provides free web development services. Demo in 1 week, pay only when delighted. Modern Next.js, Nest.js technology."/>
<meta name="keywords" content="web development, create website, free website, web app, IT outsourcing Vietnam, Next.js, Nest.js"/>
```

3. **Canonical URL:**
```html
<link rel="canonical" href="https://webpod.org/en/" />
```

4. **Open Graph tiếng Anh:**
```html
<meta property="og:url" content="https://webpod.org/en/" />
<meta property="og:title" content="POD - Pay On Delight | Free Website & Web App Development"/>
<meta property="og:locale" content="en_US" />
```

5. **Schema JSON-LD tiếng Anh:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "POD - Pay On Delight",
  "description": "Free web development services, pay only when delighted",
  ...
}
```

6. **Nội dung HTML body tiếng Anh:**
- Hero section
- Model section
- Why Choose Us
- About Us
- Services
- FAQ
- Contact form

7. **Giữ nguyên paths cho CSS/JS/images:**
```html
<!-- QUAN TRỌNG: Dùng absolute paths -->
<script src="/js/analytics.js"></script>
<link rel="stylesheet" href="/css/styles.css" />
<script src="/js/slider.js"></script>
<script src="/js/form-validation.js"></script>
```

#### Task 1.3: Thêm Language Switcher
Thêm vào cả 2 file `index.html`:

```html
<!-- Trong header, cạnh CTA button -->
<div class="flex items-center gap-2">
  <a href="/" class="text-xs text-slate-400 hover:text-white">🇻🇳 VI</a>
  <span class="text-slate-600">|</span>
  <a href="/en/" class="text-xs text-slate-400 hover:text-white">🇬🇧 EN</a>
</div>
```

#### Task 1.4: Kiểm tra ServeStaticModule
Không cần thay đổi config. NestJS tự động:
- `GET /` → serve `/public/index.html`
- `GET /en/` → serve `/public/en/index.html`
- `GET /css/styles.css` → serve `/public/css/styles.css`

---

### Phase 2: Content Translation (Week 1-2)

#### Task 2.1: Dịch Hero Section
```html
<!-- Vietnamese -->
<h1>Chúng tôi tạo Web App doanh nghiệp cho bạn
  <span class="text-brand-accent">HOÀN TOÀN MIỄN PHÍ</span>
</h1>
<h2>Trả phí khi thực sự hài lòng!</h2>

<!-- English -->
<h1>We build enterprise Web Apps for you
  <span class="text-brand-accent">100% FREE</span>
</h1>
<h2>Pay only when truly delighted!</h2>
```

#### Task 2.2: Dịch Navigation
```html
<!-- Vietnamese -->
<button data-slide="1">Mô hình</button>
<button data-slide="2">Tại sao</button>
<button data-slide="3">Về chúng tôi</button>
<button data-slide="4">Dịch vụ</button>
<button data-slide="5">FAQ</button>

<!-- English -->
<button data-slide="1">Model</button>
<button data-slide="2">Why Us</button>
<button data-slide="3">About</button>
<button data-slide="4">Services</button>
<button data-slide="5">FAQ</button>
```

#### Task 2.3: Dịch Model Section
```html
<!-- English -->
<h2>Pay On Delight</h2>
<p>Try for free, pay only when delighted (absolutely satisfied)</p>
<p>If you see real value (increased productivity, cost savings), we collaborate. If not – you lose nothing!</p>

<h3>Lightning Speed</h3>
<p>Less than 1 week to experience a complete demo, real-world testing.</p>

<h3>Leading Technology</h3>
<p>Using Next.js + Nest.js – high performance, easy to scale, strong security.</p>

<h3>Just Bring Your Idea</h3>
<p>You describe, we handle from design to testing. No coding or upfront investment needed!</p>
```

#### Task 2.4: Dịch các sections còn lại
- Why Choose Us
- About Us
- Services
- FAQ
- Contact Form

#### Task 2.5: Localize cho thị trường quốc tế
**QUAN TRỌNG:** Không chỉ dịch, mà phải localize:

```html
<!-- Vietnamese: VND, Vietnam references -->
<p>Tiết kiệm chi phí hơn so với các đơn vị outsourcing IT Việt Nam khác</p>

<!-- English: USD, international references -->
<p>Save costs compared to typical offshore development agencies</p>
```

---

### Phase 3: SEO Optimization (Week 2-3)

#### Task 3.1: Update sitemap.xml ✅ (Đã có)
File `/public/sitemap.xml` đã có hreflang cho `/en/`.

#### Task 3.2: Update hreflang trong index.html ✅ (Đã có)
Đã có trong `/public/index.html`:
```html
<link rel="alternate" hreflang="vi" href="https://webpod.org/" />
<link rel="alternate" hreflang="en" href="https://webpod.org/en/" />
<link rel="alternate" hreflang="x-default" href="https://webpod.org/" />
```

#### Task 3.3: Thêm hreflang vào `/public/en/index.html`
```html
<link rel="alternate" hreflang="vi" href="https://webpod.org/" />
<link rel="alternate" hreflang="en" href="https://webpod.org/en/" />
<link rel="alternate" hreflang="x-default" href="https://webpod.org/" />
```

#### Task 3.4: Tạo manifest-en.json (Optional)
Nếu muốn PWA riêng cho English:
```json
{
  "name": "POD - Pay On Delight",
  "short_name": "POD",
  "description": "Free web development services",
  "lang": "en",
  ...
}
```

#### Task 3.5: Different Keywords per Language
```html
<!-- Vietnamese keywords -->
<meta name="keywords" content="tạo web, tạo website, phát triển web app, outsourcing IT Việt Nam, làm web miễn phí" />

<!-- English keywords -->
<meta name="keywords" content="web development, create website, web app development, IT outsourcing Vietnam, offshore development, free website development" />
```

---

### Phase 4: Analytics & Tracking (Week 3)

#### Task 4.1: Track Language in Google Analytics
Update `/public/js/analytics.js`:

```javascript
// Detect current language
const currentLang = window.location.pathname.startsWith('/en') ? 'en' : 'vi';

// Configure GA with custom dimension
gtag('config', 'G-TS4BKGY1H4', {
  'custom_map': {
    'dimension1': 'language'
  }
});

// Send language with page view
gtag('event', 'page_view', {
  'language': currentLang
});
```

#### Task 4.2: Track Form Submissions per Language
Update `/public/js/form-validation.js`:

```javascript
// In form submit handler
gtag('event', 'demo_request', {
  'language': currentLang,
  'event_category': 'conversion',
  'event_label': 'demo_form_submit'
});
```

#### Task 4.3: Google Search Console
- Single property: webpod.org
- Filter reports by URL path: `/` vs `/en/`
- Monitor both separately

---

### Phase 5: Testing & Validation (Week 3)

#### Task 5.1: Test hreflang
- Use Google's hreflang Testing Tool
- Verify bidirectional links
- Check x-default fallback

#### Task 5.2: Test Schema.org
- Use Google Rich Results Test
- Validate Organization schema
- Validate FAQPage schema

#### Task 5.3: Test SEO Basics
- Title tags unique per language
- Meta descriptions unique
- Canonical URLs correct
- No duplicate content warnings

#### Task 5.4: Test User Experience
- Language switcher works
- All links correct (không 404)
- Forms submit correctly
- Analytics tracking works

---

## 📁 FILES CẦN TẠO/UPDATE

### Cần tạo mới:
| File | Mô tả |
|------|-------|
| `/public/en/index.html` | English landing page |

### Cần update:
| File | Thay đổi |
|------|----------|
| `/public/index.html` | Thêm language switcher |
| `/public/js/analytics.js` | Track language dimension |
| `/public/js/form-validation.js` | Track language in form events |

### Không cần thay đổi:
| File | Lý do |
|------|-------|
| `/src/module/app.module.ts` | ServeStaticModule tự handle /en/ |
| `/public/sitemap.xml` | Đã có hreflang ✅ |
| `/public/robots.txt` | Không cần thay đổi |
| `/public/css/styles.css` | Shared between languages |
| `/public/js/slider.js` | Shared, language-agnostic |
| `/public/js/tailwind-config.js` | Shared config |

---

## 💰 CHI PHÍ ƯỚC TÍNH

### Development Time:
| Task | Thời gian |
|------|-----------|
| Create `/en/index.html` structure | 1 hour |
| Translate all content | 4-6 hours |
| Add language switcher | 30 min |
| Update analytics | 1 hour |
| Testing & validation | 2 hours |
| **Total** | **8-10 hours** |

### External Costs:
| Item | Chi phí |
|------|---------|
| Native English proofreading (optional) | $50-100 |
| SEO tools (Ahrefs/SEMrush) | $0-99/month |
| **Total** | **$50-200** |

---

## ⏰ TIMELINE

```
Week 1:
├── Day 1-2: Create /public/en/index.html structure
├── Day 3-4: Translate content (Hero, Model, Why Us)
└── Day 5: Translate remaining sections

Week 2:
├── Day 1-2: Add language switcher
├── Day 3: Update analytics tracking
├── Day 4: SEO validation
└── Day 5: Testing & bug fixes

Week 3:
├── Day 1-2: Deploy to production
├── Day 3: Submit updated sitemap to Google
├── Day 4-5: Monitor Search Console
```

---

## ✅ CHECKLIST TRIỂN KHAI

### Phase 1: Structure ✅ DONE
- [x] Create `/public/en/` folder
- [x] Create `/public/en/index.html` with correct structure
- [x] Update `<html lang="en">`
- [x] Update canonical URL to `/en/`
- [x] Keep absolute paths for CSS/JS/images

### Phase 2: Content ✅ DONE
- [x] Translate Title & Meta tags
- [x] Translate Hero section
- [x] Translate Model section
- [x] Translate Why Choose Us
- [x] Translate About Us
- [x] Translate Services
- [x] Translate FAQ
- [x] Translate Contact form labels
- [x] Update Schema.org to English
- [x] Update Open Graph to English

### Phase 3: UX ✅ DONE
- [x] Add language switcher to Vietnamese version
- [x] Add language switcher to English version
- [x] Test navigation between languages

### Phase 4: SEO ✅ DONE
- [x] Verify hreflang in both pages
- [x] Verify canonical URLs
- [x] Verify sitemap is correct
- [ ] Test with hreflang testing tool (manual)
- [ ] Test with Rich Results Test (manual)

### Phase 5: Analytics ✅ DONE
- [x] Update analytics.js with language tracking
- [x] Update form-validation.js with language
- [ ] Test events in GA4 debug mode (manual)

### Phase 6: Deploy ⬜
- [ ] Deploy to staging
- [ ] Full QA testing
- [ ] Deploy to production
- [ ] Submit sitemap to Google Search Console
- [ ] Request indexing for /en/

---

## 🎯 SUCCESS METRICS

### Week 1 after launch:
- [ ] `/en/` indexed by Google
- [ ] No crawl errors in Search Console
- [ ] hreflang validated

### Month 1:
- [ ] 50+ organic visits to `/en/`
- [ ] 1+ demo request from international

### Month 3:
- [ ] 200+ organic visits to `/en/`
- [ ] 5+ demo requests from international
- [ ] Top 10 for "IT outsourcing Vietnam"

### Month 6:
- [ ] 1,000+ organic visits to `/en/`
- [ ] 20+ demo requests from international
- [ ] Top 5 for target keywords

---

## 📚 THAM KHẢO

- [Google Multi-regional and multilingual sites](https://developers.google.com/search/docs/specialty/international)
- [hreflang x-default specification](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [NestJS ServeStaticModule](https://docs.nestjs.com/recipes/serve-static)

---

**Document Version:** 1.1  
**Status:** ✅ Implementation Complete - Ready for Deploy  
**Next Step:** Deploy to staging and test

