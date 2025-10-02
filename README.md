Theme Downloader - Công Cụ Clone Tài Nguyên Website
Tổng Quan
Theme Downloader là một công cụ dòng lệnh Node.js mạnh mẽ, được thiết kế để sao chép toàn bộ giao diện (theme) của một website bằng cách tải về các trang HTML, CSS, JavaScript, hình ảnh, font chữ, icon, media và các tài nguyên tĩnh khác. Công cụ giữ nguyên cấu trúc thư mục gốc của website (ví dụ: /assets/css/style.css) và chuyển các URL tuyệt đối thành tương đối để theme hoạt động offline. Phù hợp cho các lập trình viên, nhà thiết kế, hoặc nhà nghiên cứu muốn sao lưu hoặc phân tích giao diện website như https://nappay.vn/.
Công cụ hỗ trợ:
Thu thập nhiều trang: Tự động tìm và tải tất cả các link nội bộ.
Trích xuất tài nguyên: CSS @import, url(), inline SVG, font (WOFF, TTF), hình ảnh (PNG, SVG), v.v.
Loại bỏ trùng lặp: Giữ file có kích thước lớn hơn nếu trùng tên.
Nén ZIP: Đóng gói mọi thứ thành một file ZIP duy nhất.
Lưu ý: Sử dụng công cụ một cách hợp pháp và tuân thủ điều khoản dịch vụ của website. Công cụ này chỉ dành cho mục đích học tập, lưu trữ hoặc phát triển.
Tính Năng
Tải toàn bộ tài nguyên: HTML, CSS, JS, hình ảnh (PNG/JPG/SVG/WebP), font (WOFF/WOFF2/TTF/OTF/EOT), icon (ICO/CUR), media (MP4/MP3).
Giữ cấu trúc gốc: Duy trì đường dẫn như website (ví dụ: assets/js/script.js).
Chuyển URL tương đối: Biến https://example.com/path/file.css thành /path/file.css.
Xử lý lỗi: Bỏ qua lỗi 404 (như file JS hết hạn) và ghi log.
Giao diện dòng lệnh tương tác: Nhập URL và tên file ZIP dễ dàng.
Tải toàn bộ: Không giới hạn số lượng trang nội bộ.
Yêu Cầu
Node.js (khuyến nghị v14 trở lên) cài đặt từ nodejs.org.
Truy cập terminal/command prompt cơ bản.