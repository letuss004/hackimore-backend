#!/bin/bash

# Script tự động tạo logo PNG từ SVG cho Google Search
# Yêu cầu: ImageMagick hoặc Inkscape

echo "🎨 Bắt đầu tạo logo PNG từ favicon.svg..."

# Kiểm tra thư mục đích
mkdir -p public/image

# Kiểm tra công cụ có sẵn
if command -v convert &> /dev/null; then
    echo "✓ Sử dụng ImageMagick (convert)"

    # Tạo logo 512x512 với nền trong suốt
    convert -background none -resize 512x512 public/favicon.svg public/image/logo-512x512.png

    # Tạo thêm các kích thước khác (optional)
    convert -background none -resize 192x192 public/favicon.svg public/image/logo-192x192.png
    convert -background none -resize 180x180 public/favicon.svg public/image/logo-180x180.png

    echo "✓ Đã tạo logo-512x512.png"
    echo "✓ Đã tạo logo-192x192.png (cho PWA)"
    echo "✓ Đã tạo logo-180x180.png (cho Apple)"

elif command -v inkscape &> /dev/null; then
    echo "✓ Sử dụng Inkscape"

    # Tạo logo 512x512
    inkscape public/favicon.svg --export-type=png --export-filename=public/image/logo-512x512.png --export-width=512 --export-height=512

    # Tạo thêm các kích thước khác
    inkscape public/favicon.svg --export-type=png --export-filename=public/image/logo-192x192.png --export-width=192 --export-height=192
    inkscape public/favicon.svg --export-type=png --export-filename=public/image/logo-180x180.png --export-width=180 --export-height=180

    echo "✓ Đã tạo logo-512x512.png"
    echo "✓ Đã tạo logo-192x192.png"
    echo "✓ Đã tạo logo-180x180.png"

else
    echo "❌ Không tìm thấy ImageMagick hoặc Inkscape!"
    echo ""
    echo "Vui lòng cài đặt một trong các công cụ sau:"
    echo ""
    echo "Ubuntu/Debian:"
    echo "  sudo apt-get install imagemagick"
    echo "  # hoặc"
    echo "  sudo apt-get install inkscape"
    echo ""
    echo "macOS:"
    echo "  brew install imagemagick"
    echo "  # hoặc"
    echo "  brew install inkscape"
    echo ""
    echo "Hoặc chuyển đổi online tại: https://cloudconvert.com/svg-to-png"
    exit 1
fi

echo ""
echo "✅ Hoàn thành! Logo PNG đã được tạo trong thư mục public/image/"
echo ""
echo "📋 Các bước tiếp theo:"
echo "1. Kiểm tra file logo-512x512.png trong public/image/"
echo "2. Truy cập https://search.google.com/test/rich-results để test"
echo "3. Request indexing lại trên Google Search Console"
echo ""

