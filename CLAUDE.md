# CLAUDE.md — Quy chuẩn hoàn thiện BTLReact Mobile

## 1. Mục đích và nguồn sự thật

Đây là ứng dụng mobile đa nền tảng cho hệ thống bán máy tính, xây dựng bằng
Expo SDK 54 và React Native. Mục tiêu là hoàn thiện sản phẩm có thể chạy được
end-to-end, không chỉ là tập hợp màn hình mẫu.

Nguồn sự thật của dữ liệu và nghiệp vụ là file `schema.sql` được người dùng cung
cấp tại `D:\react-mobile\schema.sql`. Khi làm việc trên máy khác, phải cấu hình
đường dẫn schema tương đương trong tài liệu dự án hoặc đặt bản sao có kiểm soát
trong thư mục backend/database.

Mọi thay đổi phải tuân theo các nguyên tắc sau:

1. Đọc schema và code hiện có trước khi sửa.
2. Không tự ý đổi tên bảng, cột, enum, khóa ngoại, quy tắc snapshot hoặc ý nghĩa
   trạng thái trong schema.
3. Nếu nghiệp vụ mới cần thay đổi schema, phải ghi rõ migration, lý do,
   tương thích ngược và cách rollback; không sửa trực tiếp database production.
4. Mobile chỉ được gọi API qua lớp service/repository, không đặt SQL hoặc logic
   truy cập database trong màn hình.
5. Không coi dữ liệu mock là hoàn thành. Mock chỉ được dùng cho UI loading,
   empty và error states; phải có cờ rõ ràng và dễ tháo bỏ.
6. Không lưu password, access token, thông tin thanh toán hoặc dữ liệu nhạy cảm
   trong log, AsyncStorage không mã hóa, source code hay file `.env` được commit.
7. Mọi trạng thái loading, lỗi mạng, hết hàng, hết hạn voucher và phiên đăng
   nhập hết hạn phải được thể hiện rõ cho người dùng.
8. Ưu tiên thay đổi nhỏ, có thể kiểm tra; không thực hiện refactor không liên
   quan trong cùng một thay đổi.

## 2. Phạm vi sản phẩm

### 2.1 Vai trò

Schema có ba role:

- `customer`: duyệt sản phẩm, tìm kiếm, yêu thích, giỏ hàng, đặt hàng, thanh
  toán, đánh giá, theo dõi bảo hành và thông báo.
- `staff`: quản lý sản phẩm, biến thể, tồn kho, voucher và xử lý đơn hàng.
- `admin`: toàn quyền quản trị, người dùng, role, dữ liệu và audit nghiệp vụ.

Mobile app trong repository này ưu tiên trải nghiệm `customer`. Các chức năng
quản trị staff/admin nên nằm ở backend/admin web; nếu được đưa vào mobile phải
được bảo vệ bằng permission từ server, không chỉ ẩn nút ở client.

### 2.2 Stack và ranh giới

- Mobile: Expo SDK `~54.0.36`, React `19.1.0`, React Native `0.81.5`,
  React Navigation 7.
- API: Node.js/Express (phải cung cấp contract rõ ràng cho mobile).
- Database: MySQL/InnoDB theo schema.
- Admin: Next.js hoặc ứng dụng web riêng, dùng chung API.
- Ảnh: chỉ lưu URL trong `product_images`, `products.thumbnail_url`,
  `brands.logo_url`, `categories.image_url`; file upload thuộc backend/storage.
- Thanh toán: COD trước; BANK_TRANSFER, MOMO và VNPAY chỉ bật khi backend đã
  xác minh callback/webhook và trạng thái giao dịch.

Không đưa secret, kết nối MySQL trực tiếp hoặc khóa thanh toán vào Expo bundle.

## 3. Mô hình dữ liệu bắt buộc

### 3.1 Các aggregate chính

| Aggregate | Bảng schema | Quy tắc bắt buộc |
|---|---|---|
| Identity | `roles`, `users` | Email và phone duy nhất; password chỉ lưu dạng hash; role do server quyết định. |
| Catalog | `categories`, `brands`, `products`, `product_images`, `product_variants` | Chỉ hiển thị category/brand/product/variant đang hoạt động; SKU duy nhất; giá không âm. |
| Customer | `addresses`, `favorites`, `notifications` | Địa chỉ có thể bị xóa theo user; chỉ user sở hữu mới được sửa dữ liệu của mình. |
| Cart | `carts`, `cart_items` | Mỗi user một cart; mỗi variant chỉ xuất hiện một lần; quantity > 0. |
| Promotion | `vouchers`, `order_vouchers` | Kiểm tra thời gian, status, min order, usage limit và max discount ở server. |
| Order | `orders`, `order_items` | Order item lưu snapshot tên, variant, SKU và giá tại thời điểm mua. |
| Payment | `payments` | Một payment cho một order; không đánh dấu PAID dựa vào client. |
| Inventory | `inventory_transactions`, `product_variants.stock_quantity` | Thay đổi kho phải atomic và có transaction history. |
| Trust | `reviews`, `warranties` | Rating 1–5; warranty có ngày hợp lệ; chỉ người mua hợp lệ được review. |

### 3.2 Trạng thái và chuyển trạng thái

- User: `ACTIVE` → `INACTIVE` hoặc `BLOCKED`; user bị block không được tạo
  session mới.
- Product: `DRAFT` → `ACTIVE` → `INACTIVE`; product draft/inactive không xuất
  hiện trong catalog công khai.
- Voucher: `ACTIVE`/`INACTIVE`; ngoài `start_at`–`end_at` luôn bị từ chối.
- Order: `PENDING` → `CONFIRMED` → `PROCESSING` → `PACKED` → `SHIPPING` →
  `DELIVERED` → `COMPLETED`.
- Nhánh hủy: order chưa hoàn tất có thể chuyển `CANCELLED` nếu thỏa chính sách;
  giao thất bại dùng `DELIVERY_FAILED`.
- Payment: `PENDING` → `PAID`, `FAILED` hoặc `REFUNDED`; phải có idempotency.
- Warranty: `ACTIVE` → `EXPIRED` hoặc `CLAIMED`.
- Review: `PENDING` → `APPROVED` hoặc `HIDDEN`.

Server phải là nơi duy nhất xác nhận transition. Client chỉ hiển thị những
action mà API cho phép.

### 3.3 Nguyên tắc tiền, kho và snapshot

- Tiền trong API truyền bằng số nguyên đơn vị nhỏ nhất hoặc chuỗi decimal nhất
  quán; không dùng số thực JavaScript để tính tổng tiền.
- Server tính lại `subtotal`, `shipping_fee`, `discount_amount` và
  `total_amount` từ cart/variant hiện tại.
- Checkout dùng transaction và khóa/kiểm tra tồn kho để tránh overselling.
- Khi tạo order, lưu snapshot vào `order_items`; thay đổi tên/giá sản phẩm sau
  đó không được làm thay đổi đơn cũ.
- Voucher chỉ tăng `used_count` một lần cho một order thành công; retry request
  không được trừ kho hoặc dùng voucher hai lần.
- Mọi thao tác nhập, bán, hủy, điều chỉnh kho tạo `inventory_transactions`.

## 4. Quy tắc kiến trúc mobile

### 4.1 Cấu trúc đề xuất

Giữ code theo feature, tránh file màn hình khổng lồ:

```text
src/
  api/              # client HTTP, auth interceptor, API types
  components/       # UI dùng lại, không gọi API trực tiếp
  constants/        # màu, spacing, config không bí mật
  context/          # session/cart hoặc state provider nhỏ
  features/
    auth/
    catalog/
    cart/
    checkout/
    orders/
    profile/
    notifications/
    reviews/
    warranties/
  navigation/
  screens/          # route-level composition
  storage/          # secure/session persistence
  utils/
```

Có thể giữ cấu trúc hiện tại trong giai đoạn chuyển tiếp, nhưng màn hình cũ
`Food*` và `foodData` phải được đổi tên hoặc loại bỏ khi feature computer-store
được nối API; không để thuật ngữ food gây hiểu nhầm trong sản phẩm.

### 4.2 UI/UX và accessibility

- Mọi màn hình có đủ loading, success, empty, error và retry state phù hợp.
- Dùng Safe Area, keyboard handling và kích thước touch target tối thiểu 44 pt.
- Component tương tác phải có `accessibilityLabel`, trạng thái disabled và
  focus/keyboard hợp lý.
- Không hard-code màu/khoảng cách lặp lại; dùng design tokens.
- Hiển thị tiền, ngày giờ và số điện thoại theo locale Việt Nam; không làm mất
  precision khi format.
- Ảnh phải có placeholder, kích thước hợp lý và `accessibilityLabel`.
- Không dùng alert im lặng cho lỗi quan trọng; thông báo phải nói rõ cách xử lý.
- Điều hướng back/deep link phải không làm mất cart hoặc dữ liệu form chưa gửi.

### 4.3 Expo SDK 54

- Giữ dependency tương thích Expo SDK 54; dùng `npx expo install` cho Expo
  packages, không tự ghim phiên bản lệch SDK.
- Trước khi thêm hoặc nâng cấp Expo API, đọc tài liệu đúng phiên bản tại
  `https://docs.expo.dev/versions/v54.0.0/`.
- Kiểm tra `app.json`, permissions, scheme, icon, splash và `newArchEnabled`
  theo tài liệu v54.
- Không giả định hành vi native từ SDK cũ. Nếu package cần prebuild/config
  plugin, phải ghi rõ thay đổi và kiểm thử Android, iOS, web nếu có hỗ trợ.
- Không đưa API key công khai giả hoặc permission thừa vào app config.

## 5. API contract tối thiểu

Backend phải cung cấp OpenAPI hoặc tài liệu tương đương. Tên endpoint có thể
thay đổi, nhưng phải bao phủ các nhóm sau:

```text
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /me

GET    /categories
GET    /brands
GET    /products
GET    /products/:id
GET    /products/:id/reviews

GET    /cart
POST   /cart/items
PATCH  /cart/items/:id
DELETE /cart/items/:id

GET    /addresses
POST   /addresses
PATCH  /addresses/:id
DELETE /addresses/:id
POST   /vouchers/validate
POST   /orders
GET    /orders
GET    /orders/:id
POST   /orders/:id/cancel
POST   /orders/:id/payment

GET    /favorites
POST   /favorites/:productId
DELETE /favorites/:productId
POST   /products/:id/reviews
GET    /warranties
GET    /notifications
PATCH  /notifications/:id/read
```

Mỗi response lỗi phải có shape ổn định, tối thiểu gồm `code`, `message` và
`details` tùy trường hợp. Mobile phải phân biệt lỗi validation (4xx), auth
(401/403), conflict/out-of-stock (409), rate limit (429) và server/network
(5xx/transport). Không biến lỗi thành danh sách rỗng.

Các request tạo order, payment, review và thay đổi cart phải hỗ trợ request
retry an toàn; các request có side effect phải có idempotency key hoặc quy tắc
deduplicate tương đương.

## 6. Quy tắc bảo mật và dữ liệu

- Hash password bằng thuật toán phù hợp ở backend; không tự hash ở mobile.
- Access/refresh token lưu trong secure storage phù hợp nền tảng; logout phải
  xóa session cục bộ và revoke/rotate token theo server contract.
- Validate và authorize ở server cho mọi `user_id`, `order_id`, `address_id`,
  `product_id`; không tin ID hay role từ client.
- Dùng parameterized query/ORM; không nối chuỗi SQL từ input.
- Rate-limit login, register, voucher validation và payment endpoints.
- Không log token, password, full payment payload, địa chỉ đầy đủ hoặc thông tin
  cá nhân không cần thiết.
- Cấu hình CORS, HTTPS, secret rotation và error reporting ngoài production
  response; error production không trả stack trace.
- Ảnh/URL upload phải được kiểm tra loại, kích thước, quyền truy cập và
  chống URL không tin cậy nếu backend cho phép upload.

## 7. Quy trình triển khai theo milestone

Chỉ đánh dấu milestone hoàn thành khi có code, test và bằng chứng chạy được.
Mỗi milestone nên là một pull request nhỏ, có migration/contract liên quan và
ghi rõ phần chưa làm.

### M0 — Chuẩn hóa nền tảng

1. Xác nhận Expo SDK 54, Node/npm và lệnh chạy.
2. Loại bỏ hoặc cô lập dữ liệu demo food.
3. Thiết lập lint, format, type-check (nếu chuyển TypeScript), test runner và
   error boundary.
4. Thêm `.env.example`, config API theo môi trường và quy tắc không commit
   secret.
5. Xác định API base URL, timeout, retry giới hạn và schema response lỗi.

**Đạt khi:** `npm start` chạy được, build development chạy trên thiết bị,
không có secret trong git và pipeline kiểm tra cơ bản xanh.

### M1 — Backend/database foundation

1. Tạo database từ schema trong môi trường local/test.
2. Chạy kiểm tra foreign key, unique, check constraint và seed data.
3. Tạo migration versioned thay vì phụ thuộc `DROP DATABASE`.
4. Xây auth, role authorization, request validation và error middleware.
5. Viết OpenAPI cho các endpoint customer tối thiểu.

**Đạt khi:** database tái tạo được từ đầu, seed idempotent ở test, login/refresh
hoạt động và mọi endpoint có test unauthorized/forbidden.

### M2 — Catalog

1. Kết nối categories, brands, products, images và variants.
2. Làm home, category/filter/search, product detail và variant selection.
3. Hiển thị giá so sánh, tồn kho, thông số kỹ thuật, bảo hành và trạng thái.
4. Thêm pagination, debounce search, cache có invalidation và pull-to-refresh.

**Đạt khi:** chỉ dữ liệu ACTIVE xuất hiện; sản phẩm không có variant mua được;
UI xử lý đúng loading/empty/error/offline.

### M3 — Account và discovery

1. Register/login/logout/refresh và session restore.
2. Profile, địa chỉ CRUD, default address.
3. Favorites và notifications unread/read.
4. Secure storage, session expiry và redirect về login.

**Đạt khi:** user A không đọc/sửa dữ liệu user B; reload app không làm mất
session hợp lệ hoặc cart cục bộ theo chính sách đã định.

### M4 — Cart, voucher và checkout

1. Đồng bộ cart với server, quantity guard và xử lý variant inactive.
2. Validate voucher server-side với min/max/time/usage.
3. Checkout address, shipping fee, order summary và confirm.
4. Tạo order idempotent, reserve/giảm kho atomic, ghi snapshot item.

**Đạt khi:** tổng tiền mobile khớp server; retry không tạo order kép; hết hàng
hoặc giá thay đổi được báo rõ và yêu cầu refresh.

### M5 — Payment và order lifecycle

1. COD end-to-end trước.
2. Payment state machine; chỉ webhook/server callback được xác nhận thanh toán.
3. Order list/detail, timeline status, cancel policy và delivery failed.
4. Notification khi order/payment đổi trạng thái.

**Đạt khi:** mỗi trạng thái có action hợp lệ; refresh/deep link không làm sai
timeline; payment timeout/failure không làm mất order.

### M6 — Review, warranty và chất lượng sản phẩm

1. Chỉ cho buyer hợp lệ tạo review; moderation status rõ ràng.
2. Hiển thị review approved và xử lý hidden/pending.
3. Danh sách warranty theo order item, serial, ngày hết hạn và claim state.
4. Deep link từ order/product tới review và warranty.

**Đạt khi:** constraint rating/date được kiểm tra cả client lẫn server; review
không mua hàng không được chấp nhận.

### M7 — Admin/operations và production readiness

1. Admin/staff CRUD catalog, variant, stock, voucher, order và review.
2. RBAC server-side và audit log cho thao tác nhạy cảm.
3. Dashboard inventory/payment/order reconciliation.
4. Monitoring, crash reporting, backup/restore và migration runbook.
5. App store config, privacy policy, terms, support contact và release build.

**Đạt khi:** có thể vận hành đơn hàng từ tạo đến hoàn tất, truy vết tồn kho và
khôi phục dữ liệu; không còn thao tác thủ công không được ghi nhận.

## 8. Chiến lược kiểm thử

Tối thiểu phải có:

- Unit test: money calculation, voucher rule, order transition, quantity guard,
  date/rating validation.
- API/integration test: auth, ownership/RBAC, checkout transaction, payment
  webhook idempotency, inventory concurrency.
- Component test: product card, cart item, price summary, form validation,
  loading/empty/error states.
- E2E smoke trên Android và iOS simulator/device: login → catalog → variant →
  cart → address → COD order → order detail.
- Regression case cho network timeout, token expiry, double tap checkout,
  out-of-stock, inactive voucher, server price change và app restart.

Không giảm coverage bằng cách bỏ qua lỗi hoặc mock toàn bộ service. Test phải
kiểm tra output và side effect quan trọng, không chỉ kiểm tra component render.

## 9. Definition of Done

Một tính năng chỉ được xem là hoàn tất khi:

1. Có acceptance criteria và đã đối chiếu đúng bảng/cột/enum trong schema.
2. Có API contract, authorization và validation tương ứng.
3. Có loading, empty, error, retry và accessibility state cần thiết.
4. Có test phù hợp ở lớp logic/API/UI và đã chạy lệnh kiểm tra liên quan.
5. Không có secret, warning nghiêm trọng, console log nhạy cảm hoặc mock bị
   bật ngoài môi trường phát triển.
6. Có migration/rollback nếu chạm database; seed/test data không phá dữ liệu
   production.
7. Cập nhật README/API docs khi cách chạy hoặc contract thay đổi.
8. QA kiểm tra Android và iOS; web chỉ được tuyên bố hỗ trợ nếu đã kiểm tra
   riêng.

## 10. Checklist trước mỗi PR/release

- [ ] Đã đọc schema và tìm prior art trước khi thêm abstraction.
- [ ] Không đổi schema âm thầm; migration và rollback đã có nếu cần.
- [ ] Không có dữ liệu food/demo còn xuất hiện trong luồng computer-store.
- [ ] API không tin giá, role, stock hoặc payment status từ client.
- [ ] Cart/order/payment retry an toàn và có idempotency.
- [ ] Có test cho success, validation, unauthorized, conflict và network error.
- [ ] Đã kiểm tra Expo SDK v54 docs cho API/package native mới.
- [ ] Đã chạy lint/format/type-check/test và build phù hợp.
- [ ] Đã kiểm tra quyền truy cập, logging, token storage và `.gitignore`.
- [ ] README và release notes phản ánh thay đổi.

## 11. Cách xử lý khi yêu cầu mơ hồ

Nếu có nhiều lựa chọn ảnh hưởng dữ liệu, tiền, bảo mật, UX hoặc khả năng
rollback, phải dừng ở acceptance criteria và hỏi người phụ trách trước khi code.
Nếu lựa chọn không ảnh hưởng contract, chọn phương án đơn giản nhất phù hợp
pattern hiện tại và ghi lại quyết định trong PR. Không tự mở rộng scope chỉ vì
schema có bảng tương ứng; triển khai theo milestone và ưu tiên luồng mua hàng
hoàn chỉnh trước.
