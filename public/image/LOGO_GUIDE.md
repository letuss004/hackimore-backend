# Hướng dẫn tạo Logo PNG cho Google Search

## Vấn đề
Google Search **KHÔNG hỗ trợ SVG** cho logo trong kết quả tìm kiếm. Bạn cần chuyển đổi `favicon.svg` sang PNG.

## Yêu cầu của Google
- **Định dạng**: PNG, JPG, GIF, hoặc WebP (KHÔNG phải SVG)
- **Kích thước tối thiểu**: 112x112px
- **Kích thước khuyến nghị**: 512x512px hoặc lớn hơn
- **Tỷ lệ**: Hình vuông (1:1) hoặc gần vuông
- **Nền**: Nên có nền trắng hoặc trong suốt

## Cách tạo logo PNG từ SVG

### Phương pháp 1: Sử dụng Online Tool
1. Truy cập: https://cloudconvert.com/svg-to-png
2. Upload file `/public/favicon.svg`
3. Chọn kích thước: 512x512px
4. Download và lưu thành `logo-512x512.png` trong thư mục `/public/image/`

### Phương pháp 2: Sử dụng ImageMagick (Command Line)
```bash
# Cài đặt ImageMagick nếu chưa có
sudo apt-get install imagemagick  # Ubuntu/Debian
# hoặc
brew install imagemagick  # macOS

# Chuyển đổi SVG sang PNG
convert -background none -size 512x512 public/favicon.svg public/image/logo-512x512.png
```

### Phương pháp 3: Sử dụng Figma/Adobe Illustrator
1. Mở `favicon.svg` trong Figma hoặc Illustrator
2. Export as PNG
3. Kích thước: 512x512px
4. Lưu thành `logo-512x512.png`

## Tệp cần tạo
Tạo tệp sau trong thư mục `/public/image/`:
- `logo-512x512.png` (512x512px, PNG)

## Sau khi tạo xong

1. **Kiểm tra Structured Data**:
   - Truy cập: https://search.google.com/test/rich-results
   - Nhập URL: https://webpod.org
   - Xác nhận logo hiển thị đúng

2. **Yêu cầu Google Index lại**:
   - Truy cập Google Search Console
   - Request indexing cho trang chủ
   - Đợi 1-2 tuần để Google cập nhật

3. **Kiểm tra kết quả**:
   - Search "webpod.org" hoặc "POD Pay On Delight" trên Google
   - Logo sẽ hiển thị trong Knowledge Panel (nếu có)

## Tài liệu tham khảo
- [Google Logo Guidelines](https://developers.google.com/search/docs/appearance/structured-data/logo)
- [Structured Data Testing Tool](https://search.google.com/test/rich-results)

