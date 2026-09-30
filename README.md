# BTL Computer Store Mobile

Ứng dụng bán laptop, PC, điện thoại và linh kiện gồm Expo mobile, Express API
và MySQL. Repository đang được hoàn thiện theo từng lát cắt chạy được; chưa phải
phiên bản production.

Quy tắc bắt buộc khi phát triển nằm tại [docs/PROJECT_RULES.md](docs/PROJECT_RULES.md).
Backlog và thứ tự hoàn thiện nằm tại
[docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md).
Schema hiện có nằm tại `BE_Mobile_DaNenTang/schema.sql`.

## Stack đã xác nhận

- Mobile: Expo SDK `~54.0.36`, React `19.1.0`, React Native `0.81.5`, React
  Navigation 7, JavaScript + TypeScript incremental.
- Backend: Node.js, Express 5, CommonJS, MySQL2, JWT, bcryptjs.
- Database: MySQL/InnoDB, schema `computer_store_db`.
- Frontend hiện giữ cấu trúc `src/components`, `src/screens`, `src/context`,
  `src/data`, đồng thời dùng thêm `src/config`, `src/services`, `src/hooks`.

## Nguồn UI/UX và nguyên tắc thiết kế

- [Material 3 Navigation Bar](https://m3.material.io/components/navigation-bar/overview):
  navigation chính 3-5 mục, trạng thái active rõ và thao tác một chạm.
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/tab-bars):
  tab bar ổn định, label ngắn và không thay đổi vị trí tùy trạng thái.
- [React Navigation Bottom Tabs](https://reactnavigation.org/docs/bottom-tab-navigator/):
  implementation navigation phù hợp React Navigation 7.
- [Baymard Mobile E-commerce Research](https://baymard.com/lists/cart-abandonment-rate):
  giảm ma sát trong cart/checkout, minh bạch chi phí và tránh form dư thừa.

UI ưu tiên mật độ vừa phải, card radius tối đa 8px, touch target tối thiểu 44px,
icon Lucide, màu semantic và nội dung có thể quét nhanh. Không dùng màn landing,
banner giảm giá giả hoặc control chưa có hành vi.

TypeScript đang được chuyển dần, không rewrite toàn bộ. `App`, navigation,
design tokens, catalog types/screen và product card đã là `.ts/.tsx`; file JS cũ
tiếp tục chạy nhờ `allowJs`. Kiểm tra bằng:

```powershell
npm run typecheck
```

## Trạng thái hiện tại

| Nhóm | Đã có | Còn thiếu/chưa đạt |
|---|---|---|
| Catalog mobile | Home gọn 8 sản phẩm, tab Catalog dùng FlatList, search/category, loading/error/retry/pull-to-refresh, ảnh fallback | Pagination/filter backend, nhiều variant, rating/review, sold/best-seller, home sections |
| Product detail | Giá, tồn kho, SKU/cấu hình, bảo hành, ảnh và giới hạn quantity từ variant | Gallery, chọn variant, related/bought-together, favorites, review |
| Cart mobile | Cart khách theo variant; sau đăng nhập tự merge và đồng bộ `/api/cart`; backend kiểm tra tồn kho khi add/update | Persist cart khách sau restart, thông báo merge chi tiết khi một item lỗi |
| Checkout mobile | Google Map address, quote server-side, Delivery/Pickup, showroom, shipping, special request, voucher, COD và idempotency | Shipping zones/store stock và payment online callback |
| Auth mobile/backend | Register/login/me, restore session, SecureStore native, profile và logout local | Refresh/logout/revoke phía server, rate limit và recovery password |
| Catalog backend | CRUD category/brand/product/image/variant; mutation đã khóa staff/admin | Public query phía server vẫn cần lọc ACTIVE, search/filter/pagination và response thống nhất |
| Cart/order backend | Cart có stock guard; order transaction, snapshot item, voucher, trừ/hoàn kho, trạng thái, COD và note max 500 | Idempotency, shipping thật, user usage voucher và test concurrency |
| Build PC | Có template/custom build và checkout | Chưa kiểm tra socket, DDR, PSU, case, công suất hoặc mục đích sử dụng |
| Order mobile | Danh sách, chi tiết, timeline, tổng tiền và hủy đơn PENDING/CONFIRMED | Phân trang, hoàn trả/refund và tracking đơn vị vận chuyển |
| Warranty/notification | Mobile list/lookup warranty; notification unread/read-all và deep link tới order | Warranty request workflow, upload ảnh và push notification |
| Favorites/reviews | Favorites và verified-purchase reviews end-to-end | Admin moderation UI, pagination nâng cao và ảnh review |
| PC Builder | Chọn linh kiện, server validate socket/DDR/RAM slot/PSU/GPU length/cooler và thêm cấu hình hợp lệ vào cart | Save/share aggregate build, recommendation theo mục đích và compatibility nâng cao |
| Laptop Upgrade | Profile giới hạn, chọn RAM/SSD, validate server, configured cart và snapshot order | Option gắn tồn kho linh kiện thật, phí lắp đặt và profile admin quản lý |

## Khoảng trống so với phạm vi sản phẩm

Các phần sau chưa nên bắt đầu ở UI trước khi có contract/schema tương ứng:

- Delivery/Pickup, cửa hàng nhận hàng, shipping method/fee và thời gian giao.
- Special requests của đơn hàng và validation note tối đa 500 ký tự.
- Laptop upgrade và dữ liệu giới hạn RAM/SSD theo model.
- PC compatibility (socket, RAM generation/capacity/slot, PSU, case/GPU).
- Product comparison 2-4 sản phẩm.
- Favorites, review API và rating aggregate.
- Warranty request/history trạng thái RECEIVED/INSPECTING/REPAIRING/COMPLETED.
- Refresh token, revoke session, rate limit và quên mật khẩu.
- Home sections theo bán chạy/doanh thu từ order items.
- Lint/test runner, OpenAPI, migration versioning và CI.
- `npm audit` hiện báo 11 moderate và 3 high trong dependency tree Expo 54;
  đề xuất tự động yêu cầu nâng lên Expo 57 nên chưa áp dụng để tránh phá SDK.

## Chạy dự án

Yêu cầu: Node.js 20+, npm, MySQL và Expo Go/dev build tương thích SDK 54.

### 1. Backend

```powershell
cd BE_Mobile_DaNenTang
npm install
```

Tạo `BE_Mobile_DaNenTang/.env` theo README của backend, tạo database bằng
`schema.sql`, sau đó chạy:

```powershell
npm start
```

API mặc định chạy tại `http://localhost:8000/api`.

### 2. Mobile

```powershell
cd D:\react-mobile
npm install
Copy-Item .env.example .env
npm start
```

Sửa `EXPO_PUBLIC_API_URL` trong `.env`:

- Android emulator mặc định có thể dùng `http://10.0.2.2:8000/api`.
- iOS simulator/web có thể dùng `http://localhost:8000/api`.
- Expo Go trên điện thoại thật phải dùng IP LAN của máy chạy backend, ví dụ
  `http://192.168.1.10:8000/api`; điện thoại và máy tính phải cùng mạng.

Không đặt secret trong biến `EXPO_PUBLIC_*` vì giá trị sẽ nằm trong app bundle.

### Google Maps

Map picker dùng `react-native-maps` và `expo-location`. Thêm API key đã giới
hạn vào `.env.local` rồi tạo development/standalone build mới:

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_restricted_key
```

Google Cloud cần bật Maps SDK for Android/iOS. Giới hạn Android theo package
`com.btlcomputerstore.mobile` + SHA-1, và iOS theo bundle identifier cùng tên.
Không commit key thật. Expo Go có thể hiển thị map trong development nhưng cấu
hình key production chỉ có hiệu lực sau native build.

## Thứ tự triển khai tiếp theo

1. Chuẩn hóa public catalog API: chỉ ACTIVE, gộp product/variant/image,
   pagination/search/filter và test contract.
2. Migration checkout cho fulfillment, pickup store, shipping method/fee và
   special requests; thêm idempotency cho tạo order.
3. Refresh/logout/revoke, rate limit và password recovery.
4. Favorites/reviews, rating aggregate và recommendation.
5. Warranty request, upload ảnh và push notification.
6. PC compatibility, laptop upgrade và comparison.
7. Lint/test runner, OpenAPI, migration versioning và CI.

Không đánh dấu một nhóm hoàn thành chỉ vì đã có bảng hoặc route; cần có
validation, authorization, UI states, test và luồng chạy end-to-end.
