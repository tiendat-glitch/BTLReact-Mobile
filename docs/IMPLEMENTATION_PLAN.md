# Kế hoạch hoàn thiện toàn bộ ứng dụng

Tài liệu này là backlog sau milestone Google Maps + commerce foundation. Thứ tự
được xếp theo dependency và rủi ro dữ liệu; không triển khai UI trước khi backend
contract tương ứng ổn định.

## Trạng thái đã có

- [x] Expo SDK 54, TypeScript incremental, bottom tabs và design tokens.
- [x] Catalog API phân trang/search/category/sort và mobile `FlatList`.
- [x] 7 category, mỗi category 60 product/variant/image seed idempotent.
- [x] Auth register/login/me, SecureStore, session restore và local logout.
- [x] Cart server theo variant, stock guard và merge cart guest khi login.
- [x] Địa chỉ CRUD, latitude/longitude, Google Map picker, current location và
  reverse geocode.
- [x] Checkout quote server-side, DELIVERY/PICKUP, showroom, shipping method,
  special requests, note, voucher, COD và idempotent order creation.
- [x] Order list/detail/timeline/cancel và inventory transaction.
- [x] Favorites end-to-end, không duplicate và ownership theo token.
- [x] Reviews verified-purchase, moderation status và UI xem/gửi review.
- [x] Product comparison 2-4 sản phẩm cùng category.
- [x] PC Builder validation socket/DDR/RAM slot/PSU/GPU length/cooler.
- [x] Laptop Upgrade RAM/SSD, giới hạn phần cứng, cart config và order snapshot.
- [x] Notification list/read/read-all và warranty list/lookup.
- [x] Migration runner versioned, retry an toàn.

## P0 - Ổn định nền tảng và bảo mật

### P0.1 Chuẩn hóa API contract

- Thêm error middleware chung `{ code, message, details, requestId }`.
- Chuẩn hóa controller cũ đang trả `success` hoặc chỉ `message`.
- Pagination thống nhất cho catalog, order, notification, review, warranty.
- OpenAPI cho toàn bộ public/customer endpoints.

**Đạt khi:** mobile không cần đoán response shape; contract test cho 2xx, 4xx,
401, 403, 409 và 5xx đều xanh.

### P0.2 Authentication production-ready

- Access token ngắn hạn + refresh token rotation/reuse detection.
- `POST /auth/refresh`, `POST /auth/logout`, revoke toàn bộ phiên.
- Quên/đặt lại mật khẩu bằng token một lần và thời hạn ngắn.
- Rate limit login/register/reset/voucher/payment.
- Audit login thất bại và khóa tạm theo chính sách.

**Đạt khi:** token hết hạn được refresh một lần; logout/revoke vô hiệu phiên;
không lưu refresh token ngoài secure storage.

### P0.3 Test và CI

- ESLint/Prettier, unit runner frontend/backend và coverage threshold.
- Integration database riêng, migration + seed trong CI.
- Test transaction checkout, concurrent stock, idempotency và voucher per-user.
- Component tests cho form/auth/cart/checkout/map fallback.
- Android/iOS E2E smoke: login -> product -> cart -> address -> COD -> order.

## P1 - Hoàn thiện catalog và product detail

### P1.1 Catalog public an toàn

- Ngừng dùng các CRUD GET cũ cho customer hoặc lọc ACTIVE server-side.
- Filter brand, price range, stock, CPU/RAM/storage/GPU/screen.
- Sort popular/rating/newest/price có index và query plan.
- Cache + invalidation và debounce/cancel request tìm kiếm.

### P1.2 Product detail đầy đủ

- Endpoint detail hợp nhất product/images/all active variants/review summary.
- Gallery ảnh, chọn variant, trạng thái hết hàng theo variant.
- Specifications theo key/value thay vì danh sách chuỗi không có nhãn.
- Related products và bought-together từ category/order data.
- Chính sách bảo hành/đổi trả lấy từ database.

### P1.3 Home sections kiểu cửa hàng công nghệ

- Promotions từ DB đã có; bổ sung CMS/admin CRUD.
- Sections: deal, laptop, PC, linh kiện, gaming gear, điện thoại, combo,
  recommended và recently viewed.
- Best-seller tính từ order item DELIVERED/COMPLETED, không dùng số giả.
- Deep link banner tới category/product/promotion.

## P2 - Cart, promotion và checkout nâng cao

### P2.1 Cart type hoàn chỉnh

- `PRODUCT`, `LAPTOP_UPGRADE`, `PC_BUILD`, `COMBO` với schema/adapter rõ ràng.
- PC Build được lưu thành một configured cart item hoặc aggregate có snapshot,
  không chỉ thêm các linh kiện rời như phiên bản hiện tại.
- Đồng bộ giá/tồn kho, unavailable item và server reconciliation khi mở cart.
- Persist guest cart an toàn qua restart rồi merge có báo cáo từng item.

### P2.2 Shipping thực tế

- Vùng giao hàng, postcode/province/district rule và same-day availability.
- Shipping fee theo địa chỉ/kho/khối lượng thay vì chỉ `base_fee`.
- Store inventory và thời gian sẵn sàng pickup.
- Google Maps key production được giới hạn package/SHA-1 và bundle ID.
- Test denied permission, GPS off, reverse-geocode fail và manual fallback.

### P2.3 Voucher/promotion

- Eligibility theo category/product/brand/user segment.
- Free shipping voucher và priority giữa nhiều promotion.
- Reservation/rollback usage khi payment fail hoặc order cancel.
- Voucher wallet, usage history và admin reporting.

## P3 - Payment và order hậu mãi

### P3.1 Payment

- COD hoàn thiện reconciliation.
- BANK_TRANSFER QR/dynamic reference.
- MOMO/VNPAY/ZALOPAY chỉ bật khi có merchant credentials, webhook signature,
  idempotency và retry policy.
- Không nhận `PAID` từ mobile; chỉ callback/server reconciliation cập nhật.

### P3.2 Order lifecycle

- Status history table thay vì suy ra từ status hiện tại.
- Tracking code/carrier, expected delivery và delivery events.
- Cancel policy theo trạng thái, lý do chuẩn hóa.
- Return/refund/exchange request và inventory/payment compensation.
- Invoice/VAT fields và hóa đơn điện tử nếu cần.

## P4 - PC Builder và Laptop Upgrade nâng cao

### P4.1 PC Builder

- Save/load/share custom build theo user.
- Mục đích Gaming/Văn phòng/Đồ họa/AI tác động recommendation thật.
- Compatibility bổ sung form factor, cooler height/radiator, connector,
  storage interface, PCIe lane và estimated power headroom.
- Build template theo ngân sách và benchmark.
- Checkout PC build dưới một aggregate, giữ snapshot từng linh kiện.

### P4.2 Laptop Upgrade

- Profile/model cụ thể do admin quản lý thay vì seed suy luận.
- RAM soldered/free slot, dual-channel, SSD interface/form factor và slot used.
- Option gắn variant linh kiện thật để quản lý tồn kho nâng cấp.
- Service/labor fee và thời gian lắp đặt.

## P5 - Warranty, support và engagement

### P5.1 Warranty request

- Customer tạo request từ warranty/order item.
- Upload ảnh có giới hạn type/size và signed URL/storage backend.
- Workflow RECEIVED/INSPECTING/REPAIRING/COMPLETED/REJECTED.
- Timeline, staff note đã lọc và preferred contact.

### P5.2 Notification

- Expo Push Notification token lifecycle và opt-in permission.
- Push cho order/payment/warranty/price drop/voucher.
- Deep link tới resource, deduplicate và preference theo loại.

### P5.3 Support

- FAQ, chính sách, hotline/showroom map và contact form.
- Chat chỉ thêm khi có backend/operator workflow, không dựng nút giả.

## P6 - Admin và vận hành

- CRUD category/brand/product/variant/image/spec/component compatibility.
- Promotion/voucher/store/shipping method/laptop profile management.
- Order/payment/warranty/review moderation queues.
- Inventory import/adjustment, low-stock alert và reconciliation.
- RBAC chi tiết, audit log và soft-delete/archive policy.
- Dashboard revenue/order/inventory nhưng không đặt trong customer mobile app.

## P7 - Release readiness

- App icon/splash/name/slug/package production.
- Privacy policy, terms, warranty/return policy và support contact.
- Crash reporting, API monitoring, structured logging và alerting.
- Database backup/restore drill và migration rollback runbook.
- Android/iOS physical-device QA, accessibility, low-end performance/offline.
- EAS development/preview/production profiles và store submission checklist.

## Phụ thuộc cần người phụ trách cung cấp

- Google Maps API key đã bật Maps SDK Android/iOS và bị giới hạn đúng package
  `com.btlcomputerstore.mobile`, SHA-1 và iOS bundle identifier.
- Merchant sandbox/production credentials và webhook URL cho payment online.
- SMTP/SMS provider cho password reset/order communication.
- Object storage credentials cho review/warranty images.
- Chính sách nghiệp vụ thật: shipping zones/fee, return/refund, warranty,
  cancellation, invoice/VAT và store inventory.

