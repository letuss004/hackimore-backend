# Facebook Sharing Debug Guide

## Vấn đề
Facebook không hiển thị thumbnail và title khi share link, chỉ hiển thị URL.

## Nguyên nhân phổ biến

1. **Facebook cache cũ** - Facebook lưu cache Open Graph data
2. **Thiếu Open Graph tags** - Không có hoặc thiếu thông tin meta tags
3. **Image không accessible** - Facebook crawler không truy cập được ảnh
4. **HTTPS issues** - Facebook yêu cầu HTTPS cho images
5. **Image size không đúng** - Kích thước ảnh không đáp ứng yêu cầu của Facebook

## Giải pháp đã triển khai

### 1. Cập nhật Open Graph Tags (✅ Hoàn tất)

Đã thêm đầy đủ Open Graph meta tags trong `index.html`:

```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://webpod.org/">
<meta property="og:title" content="POD - Pay On Delight | Phát triển Website & Web App Miễn Phí">
<meta property="og:description" content="Demo miễn phí trong 1 tuần, chỉ trả phí khi thực sự hài lòng. Giải pháp doanh nghiệp với Next.js & Nest.js.">
<meta property="og:image" content="https://webpod.org/og-image.jpg">
<meta property="og:image:secure_url" content="https://webpod.org/og-image.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="POD - Pay On Delight | Phát triển Website & Web App Miễn Phí">
<meta property="og:locale" content="vi_VN">
<meta property="og:site_name" content="POD - Pay On Delight">
```

### 2. Thêm CORS Headers (✅ Hoàn tất)

Cập nhật `.htaccess` để cho phép Facebook crawler truy cập images:

```apache
# CORS for Open Graph images (allow social media crawlers)
<FilesMatch "\.(jpg|jpeg|png|gif|webp|svg)$">
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, OPTIONS"
    Header set Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept"
</FilesMatch>
```

### 3. Tạo Debug Tool (✅ Hoàn tất)

Tạo file `og-debug.html` để kiểm tra Open Graph tags một cách trực quan.

## Các bước để fix Facebook sharing

### Bước 1: Kiểm tra Open Graph Tags

Truy cập: `https://webpod.org/og-debug.html`

### Bước 2: Xóa Facebook Cache

1. Truy cập [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. Nhập URL: `https://webpod.org/`
3. Click **"Debug"**
4. Kiểm tra warnings/errors
5. Click **"Scrape Again"** để xóa cache và lấy dữ liệu mới

### Bước 3: Kiểm tra lại

1. Sau khi scrape lại, kiểm tra phần "Link Preview"
2. Đảm bảo thấy:
   - ✅ Title đúng
   - ✅ Description đúng
   - ✅ Image hiển thị (1200x630px)

### Bước 4: Test Share

1. Thử share link trên Facebook
2. Preview sẽ hiển thị đầy đủ thông tin

## Yêu cầu cho Open Graph Image

### Kích thước khuyến nghị:
- **Tối ưu**: 1200 x 630 pixels (tỷ lệ 1.91:1)
- **Tối thiểu**: 600 x 315 pixels
- **Tối đa**: 8MB

### Format hỗ trợ:
- ✅ JPG/JPEG
- ✅ PNG
- ❌ SVG (không hỗ trợ)
- ❌ GIF động (không khuyến khích)

### Best practices:
- Sử dụng HTTPS (bắt buộc)
- Absolute URL (https://webpod.org/og-image.jpg)
- Nội dung rõ ràng, dễ đọc
- Tránh chữ quá nhỏ (khó đọc trên mobile)
- File size < 300KB để tải nhanh

## Tools để kiểm tra

### 1. Facebook Debugger (Quan trọng nhất!)
🔗 https://developers.facebook.com/tools/debug/

**Sử dụng để:**
- Xóa cache Facebook
- Kiểm tra lỗi Open Graph
- Preview link trước khi share

### 2. Twitter Card Validator
🔗 https://cards-dev.twitter.com/validator

**Sử dụng để:**
- Kiểm tra Twitter Cards
- Đảm bảo tương thích cross-platform

### 3. LinkedIn Post Inspector
🔗 https://www.linkedin.com/post-inspector/

**Sử dụng để:**
- Test sharing trên LinkedIn
- Xóa LinkedIn cache

### 4. Google Rich Results Test
🔗 https://search.google.com/test/rich-results

**Sử dụng để:**
- Kiểm tra structured data
- SEO validation

## Troubleshooting

### Vấn đề: Image không hiển thị

**Giải pháp:**
1. Kiểm tra image URL có accessible không (mở trực tiếp trên browser)
2. Đảm bảo HTTPS được enable
3. Kiểm tra CORS headers đã được cấu hình đúng
4. Verify image size >= 600x315px

### Vấn đề: Facebook vẫn hiển thị cache cũ

**Giải pháp:**
1. Sử dụng Facebook Debugger
2. Click "Scrape Again" nhiều lần
3. Đợi 5-10 phút để cache update
4. Clear browser cache và thử lại

### Vấn đề: Title/Description không đúng

**Giải pháp:**
1. Kiểm tra meta tags trong HTML source
2. Đảm bảo không có duplicate tags
3. Verify tags nằm trong `<head>` section
4. Check encoding (UTF-8)

## Checklist trước khi share

- [ ] Open Graph tags đã được thêm vào `<head>`
- [ ] Image URL là absolute và HTTPS
- [ ] Image có kích thước phù hợp (1200x630)
- [ ] CORS headers đã được cấu hình
- [ ] Đã test với Facebook Debugger
- [ ] Đã click "Scrape Again" để clear cache
- [ ] Preview hiển thị đúng trong Debugger
- [ ] Đã test share thực tế trên Facebook

## Files đã được cập nhật

1. ✅ `/public/index.html` - Thêm đầy đủ Open Graph tags
2. ✅ `/public/.htaccess` - Thêm CORS headers
3. ✅ `/public/og-debug.html` - Tool debug mới
4. ✅ `/docs/FACEBOOK_SHARING_FIX.md` - Tài liệu này

## Lưu ý quan trọng

### Cache Behavior
- Facebook cache Open Graph data trong **7 ngày**
- Chỉ có thể force refresh bằng Debugger tool
- Sau khi update tags, **bắt buộc** phải dùng Debugger

### Image Requirements
- **Phải** là HTTPS
- **Phải** là absolute URL
- **Không được** bị redirect
- **Phải** accessible publicly (không cần login)

### Testing
- Test trên **nhiều loại post** (timeline, group, page)
- Test trên **mobile và desktop**
- Kiểm tra **sau vài giờ** để đảm bảo stable

## Contact & Support

Nếu vẫn gặp vấn đề sau khi làm theo hướng dẫn:

1. Check server logs xem Facebook bot có request không
2. Verify DNS và SSL certificate
3. Test với curl:
   ```bash
   curl -I https://webpod.org/og-image.jpg
   ```
4. Kiểm tra robots.txt không block Facebook bot

## References

- [Facebook Sharing Best Practices](https://developers.facebook.com/docs/sharing/webmasters/)
- [Open Graph Protocol](https://ogp.me/)
- [Facebook Crawler](https://developers.facebook.com/docs/sharing/webmasters/crawler/)

---

**Last Updated:** January 9, 2026
**Status:** ✅ All fixes implemented
**Next Action:** Run Facebook Debugger to scrape new data

