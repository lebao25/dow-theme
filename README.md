Theme Downloader - Công Cụ Clone Giao Diện Website

Tổng Quan

Theme Downloader là công cụ dòng lệnh Node.js giúp sao chép giao diện website, tải về các tài nguyên tĩnh như HTML, CSS, JavaScript, hình ảnh, font, icon, và media. Công cụ giữ nguyên cấu trúc đường dẫn gốc (ví dụ: /assets/css/style.css) và chuyển URL tuyệt đối thành tương đối để theme hoạt động offline. Phù hợp cho lập trình viên, nhà thiết kế, hoặc nhà nghiên cứu muốn sao lưu hoặc phân tích giao diện website như https://nappay.vn/.

Tính năng chính:





Tự động tải tất cả trang nội bộ và tài nguyên liên quan.



Hỗ trợ CSS @import, url(), inline SVG, font (WOFF/TTF), hình ảnh (PNG/SVG), v.v.



Giữ file lớn nhất nếu trùng tên.



Nén toàn bộ thành file ZIP.

Lưu ý: Sử dụng hợp pháp, tuân thủ điều khoản dịch vụ của website (ví dụ: nappay.vn). Chỉ dùng cho mục đích học tập, lưu trữ, hoặc phát triển.

Tính Năng





Tải tài nguyên: HTML, CSS, JS, hình ảnh (PNG/JPG/SVG/WebP), font (WOFF/WOFF2/TTF/OTF/EOT), icon (ICO/CUR), media (MP4/MP3).



Cấu trúc gốc: Giữ đường dẫn như website (ví dụ: assets/js/script.js).



URL tương đối: Chuyển https://nappay.vn/path/file.css thành /path/file.css.



Xử lý lỗi: Bỏ qua lỗi 404 (như file JS hết hạn) và ghi log.



Giao diện CLI: Nhập URL và tên file ZIP dễ dàng.



Tải toàn bộ: Không giới hạn số lượng trang.

Yêu Cầu





Node.js (khuyến nghị v14+) từ nodejs.org.



Terminal (Linux, macOS, Windows, hoặc Codespaces).

Cài Đặt





Tạo thư mục dự án:

mkdir dow-theme && cd dow-theme



Khởi tạo npm và cài thư viện:

npm init -y
npm install axios cheerio jszip css



Lưu script vào theme-downloader.js trong /workspaces/dow-theme.

Cách Sử Dụng

Chạy công cụ:

node theme-downloader.js

Nhập:





URL website (ví dụ: https://nappay.vn/).



Tên file ZIP (ví dụ: nappay-clone.zip).

Công cụ sẽ:





Tìm và tải tất cả link nội bộ.



Lưu trang và tài nguyên vào downloaded_theme/.



Nén thành file ZIP trong downloaded_theme/.

Ví dụ kết quả:

Đang tìm link...
Tìm thấy 20 link, đang tải tất cả...
Tải trang: index.html
Tải: assets/css/style.css (4500 bytes)
Tải: images/logo.png (12000 bytes)
...
Giao diện đã được tải và nén thành nappay-clone.zip!

Cấu Trúc Đầu Ra

Thư mục downloaded_theme/ phản ánh cấu trúc gốc:

downloaded_theme/
├── index.html                  # Trang chủ
├── account/
│   └── login.html             # Trang con
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   └── images/
│       └── logo.png
├── fonts/
│   └── font.woff2
├── icons/
│   └── favicon.ico
├── media/
│   └── video.mp4
└── nappay-clone.zip            # File ZIP

Tích Hợp Git

Khởi tạo và đẩy code lên GitHub:

git init
git config --global user.name "lebao25"
git config --global user.email "baolegia352@gmail.com"
echo "downloaded_theme/" >> .gitignore
git add .
git commit -m "Add theme-downloader and README"
git remote add origin https://github.com/lebao25/dow-theme.git
git push origin main

Lưu ý: Nếu remote origin đã tồn tại, kiểm tra:

git remote -v

Ví Dụ

Clone nappay.vn

node theme-downloader.js
# Nhập: https://nappay.vn/
# Nhập: nappay-clone.zip





Tải trang như account/login.html.



Giữ đường dẫn như /assets/css/style.css.



Bỏ qua lỗi 404 (như file JS hết hạn).

Hạn Chế





Chỉ tải tài nguyên tĩnh; nội dung động (API, SPA) cần tích hợp Puppeteer.



Một số website chặn yêu cầu (CORS, rate limit); cần proxy nếu bị chặn.



Không thực thi JavaScript động; chỉ xử lý script inline.



Website lớn tốn thời gian/bộ nhớ; theo dõi qua console.log.

Khắc Phục Sự Cố





Lỗi remote origin already exists: Kiểm tra git remote -v và dùng git push origin main.



Lỗi thiếu module: Chạy lại npm install.



Lỗi 404: Bình thường với tài nguyên cũ; công cụ bỏ qua.



Lỗi quyền truy cập: Chạy sudo chmod -R u+w /workspaces/dow-theme.



Lỗi $: command not found: Không gõ $ trong lệnh.

Đóng Góp





Fork repo và gửi PR để thêm tính năng (như hỗ trợ Puppeteer).



Báo lỗi qua GitHub.

Giấy Phép

MIT License - Miễn phí sử dụng, chỉnh sửa, phân phối.

Lời Cảm Ơn

Xây dựng với Axios, Cheerio, JSZip, CSS parser. Lấy cảm hứng từ HTTrack.



Cập nhật lần cuối: 03/10/2025
