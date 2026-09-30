# Quy tắc triển khai dự án

File này là checklist bắt buộc khi tiếp tục phát triển ứng dụng. Nếu tài liệu
khác mâu thuẫn với code/schema hiện tại, phải kiểm tra lại và cập nhật tài liệu
trước khi triển khai.

## 1. Nguồn sự thật

1. Expo/React Native: dùng đúng Expo SDK `~54.0.36`, React Native `0.81.5` và
   đọc tài liệu versioned tại `https://docs.expo.dev/versions/v54.0.0/` trước
   khi thêm hoặc đổi API/package native.
2. Database: `BE_Mobile_DaNenTang/schema.sql` là schema hiện có. Không giả định
   có `schema.sql` ở thư mục gốc và không sửa database thủ công bỏ qua migration.
3. Backend: giữ Node.js, Express 5, CommonJS, MySQL2 và cấu trúc
   `router -> controller -> service -> model` hiện tại.
4. Frontend: giữ Expo, React Navigation và cấu trúc `src` hiện tại. Được thêm
   thư mục/file theo feature khi cần, nhưng không di chuyển hoặc rewrite hàng
   loạt nếu chưa có lý do và kế hoạch chuyển đổi.
5. API thực tế trong code có ưu tiên cao hơn README. Khi contract thay đổi,
   code backend, adapter mobile và README phải được cập nhật cùng nhau.

## 2. Ranh giới kiến trúc

- Screen không gọi `fetch` trực tiếp. Mọi HTTP request đi qua `src/services`.
- Response backend phải được chuyển đổi ở adapter/service trước khi đưa vào UI.
- Component dùng lại không chứa SQL, URL backend cố định hoặc nghiệp vụ quyền.
- Mobile không kết nối MySQL và không chứa DB credential, JWT secret hay khóa
  thanh toán.
- Chỉ biến bắt đầu bằng `EXPO_PUBLIC_` được Expo đưa vào bundle; tuyệt đối không
  đặt secret trong các biến này.
- Không tạo model/table/service song song nếu aggregate tương ứng đã tồn tại.

## 3. Quy tắc catalog

- Chỉ hiển thị category, product và variant có trạng thái `ACTIVE`.
- Sản phẩm phải có ít nhất một variant active mới được mua.
- Giá, SKU, tồn kho, cấu hình và bảo hành lấy từ `product_variants`; không lấy
  giá hard-code từ mobile.
- UI phải xử lý loading, empty, error, retry, ảnh lỗi và hết hàng.
- Tìm kiếm/lọc phía client chỉ là bước đầu cho tập dữ liệu nhỏ. Khi thêm phân
  trang, filter/search phải chuyển sang backend và có query contract rõ ràng.
- Rating, số lượng bán và best-seller chỉ hiển thị khi backend có dữ liệu thật;
  không bịa số liệu để lấp giao diện.

## 4. Quy tắc tiền, giỏ hàng và checkout

- Backend là nguồn sự thật cho price, discount, shipping fee, stock, voucher,
  compatibility và total. Frontend chỉ hiển thị estimate trước xác nhận.
- Cart item phải định danh theo `product_variant_id`, không chỉ theo product.
- Tạo order phải atomic, idempotent, kiểm tra lại tồn kho và snapshot tên/SKU/
  giá vào `order_items`.
- Không xóa cart hoặc báo đặt hàng thành công trước khi API tạo order trả về
  thành công.
- Checkout phải hỗ trợ DELIVERY/PICKUP, shipping method, special requests,
  order note tối đa 500 ký tự và payment method theo enum thật của schema.
- Mọi phép tính tiền trên mobile phải tránh dựa vào số thực làm nguồn quyết định.

## 5. Authentication và authorization

- Public chỉ gồm catalog đang active và auth register/login cần thiết.
- CRUD role/user/catalog/inventory/order status phải được bảo vệ bằng
  `authenticate` và role phù hợp ở router/backend; ẩn nút trên mobile không phải
  authorization.
- Resource của customer phải kiểm tra ownership bằng `req.user.id`; không nhận
  `user_id` từ body làm nguồn tin cậy.
- Token phải được lưu bằng secure storage khi làm auth. Không log token,
  password, địa chỉ đầy đủ hoặc payload thanh toán.
- Cần refresh-token/rotation hoặc chiến lược session tương đương trước khi coi
  auth production-ready.

## 6. API và lỗi

- Contract thành công dùng `data`; danh sách có pagination phải có metadata.
- Contract lỗi mục tiêu là `{ code, message, details? }`. Trong giai đoạn chuyển
  tiếp mobile phải xử lý được response cũ chỉ có `message`.
- Dùng status phù hợp: 400 validation, 401 unauthenticated, 403 forbidden,
  404 not found, 409 conflict/out-of-stock, 429 rate limit, 5xx server.
- Không trả stack trace hoặc chi tiết SQL ở production.
- Request có side effect quan trọng cần idempotency/deduplication.

## 7. Database và migration

- Không đổi tên/xóa cột, bảng, enum hoặc foreign key hiện có mà chưa có migration,
  backward compatibility và rollback.
- Seed phải chạy lại an toàn hoặc được ghi rõ chỉ chạy một lần.
- Mọi thay đổi stock tạo `inventory_transactions` và nằm cùng transaction với
  thay đổi order/cart liên quan.
- Các tính năng còn thiếu schema như fulfillment, shipping, special request,
  warranty request, laptop upgrade và PC compatibility phải được thiết kế bằng
  migration versioned, không nhét dữ liệu không cấu trúc tùy tiện.

## 8. Thứ tự triển khai

1. M0: config môi trường, API client, error handling, lint/test và catalog thật.
2. M1: khóa quyền backend, chuẩn hóa response/error, auth/session mobile.
3. M2: product detail/variant, search/filter/pagination, favorites/reviews.
4. M3: cart server, voucher validation, delivery/pickup và checkout COD.
5. M4: order history/timeline, notification, payment state machine.
6. M5: PC compatibility, laptop upgrade, warranty request/history, comparison.
7. M6: admin/operations, audit, monitoring và release readiness.

Không bắt đầu payment online trước khi COD, order transaction và webhook
idempotency đã có test.

## 9. Definition of Done

- Có acceptance criteria và đối chiếu schema/API trước khi code.
- Có validation và authorization backend cho dữ liệu quan trọng.
- UI có loading, empty, error, retry, disabled và accessibility state phù hợp.
- Đã chạy syntax/type/lint/test/build mà repository hỗ trợ; lỗi còn lại phải được
  ghi rõ, không đánh dấu hoàn tất.
- Không có secret, dữ liệu cá nhân hoặc mock ngầm trong production path.
- README/API docs/migration được cập nhật nếu cách chạy hoặc contract thay đổi.
- Không làm hỏng Android/iOS; web chỉ được tuyên bố hỗ trợ sau khi kiểm tra riêng.

