// Dữ liệu Tỉnh/Thành phố & Quận/Huyện của Việt Nam (tính đến sáp nhập 2025).
// Nguồn: Nghị quyết số 202/2025/QH15 và 76/2025/QH15 của Quốc hội khóa XV.
// Cấu trúc 34 đơn vị hành chính cấp tỉnh (sau sáp nhập) và 332 đơn vị hành chính cấp huyện.
// Phường/Xã không liệt kê đầy đủ — người dùng nhập tay hoặc dùng map picker.
//
// Một số tỉnh thành lớn (Hà Nội, HCM, Hải Phòng, Đà Nẵng, Cần Thơ) liệt kê đầy đủ
// quận/huyện; các tỉnh còn lại liệt kê các huyện/thị xã/thành phố trực thuộc.

export type Province = {
  code: string;
  name: string;
  districts: District[];
};

export type District = {
  code: string;
  name: string;
};

// Helper: tạo code tỉnh/huyện theo alphabet
const p = (code: string, name: string, districts: District[] = []): Province => ({
  code,
  name,
  districts,
});

const d = (code: string, name: string): District => ({ code, name });

export const PROVINCES: Province[] = [
  // === Thành phố trực thuộc trung ương ===
  p("01", "Hà Nội", [
    d("001", "Ba Đình"), d("002", "Hoàn Kiếm"), d("003", "Tây Hồ"),
    d("004", "Long Biên"), d("005", "Cầu Giấy"), d("006", "Đống Đa"),
    d("007", "Hai Bà Trưng"), d("008", "Hoàng Mai"), d("009", "Thanh Xuân"),
    d("016", "Hà Đông"), d("017", "Bắc Từ Liêm"), d("018", "Nam Từ Liêm"),
    d("024", "Sóc Sơn"), d("025", "Đông Anh"), d("026", "Gia Lâm"),
    d("027", "Long Biên (cũ)"), d("028", "Mê Linh"),
    d("031", "Đan Phượng"), d("032", "Phúc Thọ"), d("033", "Sơn Tây"),
    d("034", "Ba Vì"), d("035", "Phú Xuyên"), d("036", "Thạch Thất"),
    d("037", "Quốc Oai"), d("038", "Chương Mỹ"), d("039", "Thanh Oai"),
    d("040", "Thường Tín"), d("041", "Phú Bình"), d("042", "Ứng Hòa"),
    d("043", "Mỹ Đức"),
  ]),
  p("79", "Thành phố Hồ Chí Minh", [
    d("760", "Quận 1"), d("761", "Quận 2 (cũ)"), d("762", "Quận 3"),
    d("763", "Quận 4"), d("764", "Quận 5"), d("765", "Quận 6"),
    d("766", "Quận 7"), d("767", "Quận 8"), d("768", "Quận 9 (cũ)"),
    d("769", "Quận 10"), d("770", "Quận 11"), d("771", "Quận 12"),
    d("772", "Bình Thạnh"), d("773", "Gò Vấp"), d("774", "Phú Nhuận"),
    d("775", "Tân Bình"), d("776", "Tân Phú"), d("777", "Bình Tân"),
    d("778", "Thủ Đức"), d("783", "Củ Chi"), d("784", "Hóc Môn"),
    d("785", "Bình Chánh"), d("786", "Nhà Bè"), d("787", "Cần Giờ"),
  ]),
  p("31", "Hải Phòng", [
    d("301", "Hồng Bàng"), d("302", "Ngô Quyền"), d("303", "Lê Chân"),
    d("304", "Hải An"), d("305", "Kiến An"), d("306", "Đồ Sơn"),
    d("307", "Dương Kinh"), d("308", "Cát Hải"), d("309", "Bạch Long Vĩ"),
    d("311", "Thuỷ Nguyên"), d("312", "An Dương"), d("313", "An Lão"),
    d("314", "Kiến Thuỵ"), d("315", "Tiên Lãng"), d("316", "Vĩnh Bảo"),
  ]),
  p("48", "Đà Nẵng", [
    d("490", "Liên Chiểu"), d("491", "Thanh Khê"), d("492", "Hải Châu"),
    d("493", "Sơn Trà"), d("494", "Ngũ Hành Sơn"), d("495", "Cẩm Lệ"),
    d("497", "Hòa Vang"), d("498", "Hoàng Sa"),
  ]),
  p("92", "Cần Thơ", [
    d("916", "Ninh Kiều"), d("917", "Bình Thuỷ"), d("918", "Cái Răng"),
    d("919", "Ô Môn"), d("923", "Thốt Nốt"), d("924", "Phong Điền"),
    d("925", "Cờ Đỏ"), d("926", "Vĩnh Thạnh"), d("927", "Thới Lai"),
  ]),

  // === Tỉnh ===
  p("89", "An Giang", [
    d("883", "Long Xuyên"), d("884", "Châu Đốc"), d("886", "An Phú"),
    d("887", "Tân Châu"), d("888", "Phú Tân"), d("889", "Châu Phú"),
    d("890", "Châu Thành"), d("891", "Thoại Sơn"), d("892", "Chợ Mới"),
    d("893", "Tri Tôn"), d("894", "Tịnh Biên"),
  ]),
  p("77", "Bà Rịa - Vũng Tàu", [
    d("748", "Vũng Tàu"), d("750", "Bà Rịa"), d("751", "Châu Đức"),
    d("752", "Xuyên Mộc"), d("753", "Long Điền"), d("754", "Đất Đỏ"),
    d("755", "Phú Mỹ"), d("756", "Côn Đảo"),
  ]),
  p("95", "Bạc Liêu", [
    d("954", "Bạc Liêu"), d("956", "Hồng Dân"), d("957", "Phước Long"),
    d("958", "Vĩnh Lợi"), d("959", "Giá Rai"), d("960", "Đông Hải"),
    d("961", "Hoà Bình"),
  ]),
  p("24", "Bắc Giang", [
    d("213", "Bắc Giang"), d("215", "Yên Thế"), d("216", "Tân Yên"),
    d("217", "Lạng Giang"), d("218", "Lục Nam"), d("219", "Lục Ngạn"),
    d("220", "Sơn Động"), d("221", "Yên Dũng"), d("222", "Việt Yên"),
    d("223", "Hiệp Hòa"),
  ]),
  p("06", "Bắc Kạn", [
    d("058", "Bắc Kạn"), d("060", "Pác Nặm"), d("061", "Ba Bể"),
    d("062", "Ngân Sơn"), d("063", "Bạch Thông"), d("064", "Chợ Đồn"),
    d("065", "Chợ Mới"), d("066", "Na Rì"),
  ]),
  p("27", "Bắc Ninh", [
    d("256", "Bắc Ninh"), d("258", "Yên Phong"), d("259", "Quế Võ"),
    d("260", "Tiên Du"), d("261", "Từ Sơn"), d("262", "Thuận Thành"),
    d("263", "Gia Bình"), d("264", "Lương Tài"),
  ]),
  p("83", "Bến Tre", [
    d("829", "Bến Tre"), d("831", "Châu Thành"), d("832", "Chợ Lách"),
    d("833", "Mỏ Cày Bắc"), d("834", "Mỏ Cày Nam"), d("835", "Giồng Trôm"),
    d("836", "Bình Đại"), d("837", "Ba Tri"), d("838", "Thạnh Phú"),
  ]),
  p("52", "Bình Định", [
    d("540", "Quy Nhơn"), d("542", "An Lão"), d("543", "Hoài Ân"),
    d("544", "Hoài Nhơn"), d("545", "Phù Mỹ"), d("546", "Phù Cát"),
    d("547", "Tây Sơn"), d("548", "Vân Canh"), d("549", "Tuy Phước"),
    d("550", "Vĩnh Thạnh"),
  ]),
  p("74", "Bình Dương", [
    d("718", "Thủ Dầu Một"), d("719", "Bàu Bàng"), d("720", "Dầu Tiếng"),
    d("721", "Bến Cát"), d("722", "Phú Giáo"), d("723", "Tân Uyên"),
    d("724", "Bắc Tân Uyên"), d("725", "Thuận An"), d("726", "Dĩ An"),
  ]),
  p("70", "Bình Phước", [
    d("690", "Đồng Xoài"), d("691", "Đồng Phú"), d("692", "Chơn Thành"),
    d("693", "Bình Long"), d("694", "Lộc Ninh"), d("695", "Bù Đốp"),
    d("696", "Hớn Quản"), d("697", "Chơn Thành (cũ)"),
    d("698", "Phú Riềng"), d("699", "Bù Gia Mập"),
  ]),
  p("39", "Bình Thuận", [
    d("593", "Phan Thiết"), d("594", "La Gi"), d("595", "Tuy Phong"),
    d("596", "Bắc Bình"), d("597", "Hàm Thuận Bắc"), d("598", "Hàm Thuận Nam"),
    d("599", "Tánh Linh"), d("600", "Đức Linh"), d("601", "Hàm Tân"),
    d("602", "Phú Quý"),
  ]),
  p("96", "Cà Mau", [
    d("964", "Cà Mau"), d("966", "U Minh"), d("967", "Thới Bình"),
    d("968", "Trần Văn Thời"), d("969", "Cái Nước"), d("970", "Đầm Dơi"),
    d("971", "Năm Căn"), d("972", "Phú Tân"), d("973", "Ngọc Hiển"),
  ]),
  p("04", "Cao Bằng", [
    d("040", "Cao Bằng"), d("042", "Bảo Lâm"), d("043", "Bảo Lạc"),
    d("044", "Hà Quảng"), d("045", "Trùng Khánh"), d("046", "Hạ Lang"),
    d("047", "Quảng Hòa"), d("048", "Hoà An"), d("049", "Nguyên Bình"),
    d("050", "Thạch An"),
  ]),
  p("66", "Đắk Lắk", [
    d("643", "Buôn Ma Thuột"), d("644", "Buôn Hồ"), d("645", "Ea H'leo"),
    d("646", "Ea Súp"), d("647", "Buôn Đôn"), d("648", "Cư M'gar"),
    d("649", "Krông Búk"), d("650", "Krông Năng"), d("651", "Ea Kar"),
    d("652", "M'Đrắk"), d("653", "Krông Bông"), d("654", "Krông Pắk"),
    d("655", "Krông A Na"), d("656", "Lắk"), d("657", "Cư Kuin"),
  ]),
  p("67", "Đắk Nông", [
    d("660", "Gia Nghĩa"), d("661", "Đắk Glong"), d("662", "Cư Jút"),
    d("663", "Đắk Mil"), d("664", "Đắk Song"), d("665", "Krông Nô"),
    d("666", "Đắk R'lấp"), d("667", "Tuy Đức"),
  ]),
  p("11", "Điện Biên", [
    d("094", "Điện Biên Phủ"), d("095", "Mường Lay"), d("096", "Mường Nhé"),
    d("097", "Mường Chà"), d("098", "Tủa Chùa"), d("099", "Tuần Giáo"),
    d("100", "Điện Biên"), d("101", "Điện Biên Đông"),
  ]),
  p("75", "Đồng Nai", [
    d("731", "Biên Hòa"), d("732", "Long Khánh"), d("734", "Tân Phú"),
    d("735", "Vĩnh Cửu"), d("736", "Định Quán"), d("737", "Trảng Bom"),
    d("738", "Thống Nhất"), d("739", "Cẩm Mỹ"), d("740", "Long Thành"),
    d("741", "Xuân Lộc"), d("742", "Nhơn Trạch"),
  ]),
  p("87", "Đồng Tháp", [
    d("866", "Cao Lãnh"), d("867", "Sa Đéc"), d("868", "Hồng Ngự"),
    d("869", "Tân Hồng"), d("870", "Hồng Ngự (cũ)"), d("871", "Tam Nông"),
    d("872", "Tháp Mười"), d("873", "Cao Lãnh (cũ)"), d("874", "Thanh Bình"),
    d("875", "Lai Vung"), d("876", "Lấp Vò"),
  ]),
  p("64", "Gia Lai", [
    d("622", "Pleiku"), d("623", "An Khê"), d("624", "Ayun Pa"),
    d("625", "KBang"), d("626", "Đăk Đoa"), d("627", "Chư Păh"),
    d("628", "Ia Grai"), d("629", "Mang Yang"), d("630", "Kông Chro"),
    d("631", "Đức Cơ"), d("632", "Chư Prông"), d("633", "Chư Sê"),
    d("634", "Đăk Pơ"), d("635", "Ia Pa"), d("637", "Krông Pa"),
    d("638", "Phú Thiện"),
  ]),
  p("02", "Hà Giang", [
    d("024", "Hà Giang"), d("026", "Đồng Văn"), d("027", "Mèo Vạc"),
    d("028", "Yên Minh"), d("029", "Quản Bạ"), d("030", "Xín Mần"),
    d("031", "Hoàng Su Phì"), d("032", "Vị Xuyên"), d("033", "Bắc Mê"),
    d("034", "Quang Bình"),
  ]),
  p("35", "Hà Nam", [
    d("347", "Phủ Lý"), d("349", "Duy Tiên"), d("350", "Kim Bảng"),
    d("351", "Lý Nhân"), d("352", "Thanh Liêm"), d("353", "Bình Lục"),
  ]),
  p("42", "Hà Tĩnh", [
    d("430", "Hà Tĩnh"), d("431", "Hồng Lĩnh"), d("432", "Hương Sơn"),
    d("433", "Đức Thọ"), d("434", "Vũ Quang"), d("435", "Nghi Xuân"),
    d("436", "Can Lộc"), d("437", "Lộc Hà"), d("438", "Thạch Hà"),
    d("439", "Cẩm Xuyên"), d("440", "Kỳ Anh"), d("441", "Lộc Hà (cũ)"),
  ]),
  p("30", "Hải Dương", [
    d("288", "Hải Dương"), d("290", "Chí Linh"), d("291", "Nam Sách"),
    d("292", "Kinh Môn"), d("293", "Kim Thành"), d("294", "Thanh Hà"),
    d("295", "Cẩm Giàng"), d("296", "Bình Giang"), d("297", "Gia Lộc"),
    d("298", "Tứ Kỳ"), d("299", "Ninh Giang"), d("300", "Thanh Miện"),
  ]),
  p("93", "Hậu Giang", [
    d("930", "Vị Thanh"), d("931", "Ngã Bảy"), d("932", "Châu Thành A"),
    d("933", "Châu Thành"), d("934", "Phụng Hiệp"), d("935", "Vị Thủy"),
    d("936", "Long Mỹ"),
  ]),
  p("17", "Hòa Bình", [
    d("148", "Hòa Bình"), d("150", "Đà Bắc"), d("152", "Lương Sơn"),
    d("153", "Kim Bôi"), d("154", "Cao Phong"), d("155", "Tân Lạc"),
    d("156", "Mai Châu"), d("157", "Lạc Sơn"), d("158", "Yên Thủy"),
    d("159", "Lạc Thủy"),
  ]),
  p("33", "Hưng Yên", [
    d("323", "Hưng Yên"), d("325", "Văn Lâm"), d("326", "Văn Giang"),
    d("327", "Yên Mỹ"), d("328", "Mỹ Hào"), d("329", "Ân Thi"),
    d("330", "Khoái Châu"), d("331", "Kim Động"), d("332", "Tiên Lữ"),
    d("333", "Phù Cừ"),
  ]),
  p("56", "Khánh Hòa", [
    d("568", "Nha Trang"), d("569", "Cam Ranh"), d("570", "Cam Lâm"),
    d("571", "Vạn Ninh"), d("572", "Ninh Hòa"), d("573", "Khánh Vĩnh"),
    d("574", "Diên Khánh"), d("575", "Khánh Sơn"), d("576", "Trường Sa"),
  ]),
  p("41", "Kiên Giang", [
    d("899", "Rạch Giá"), d("900", "Hà Tiên"), d("902", "Kiên Lương"),
    d("903", "Hòn Đất"), d("904", "Tân Hiệp"), d("905", "Châu Thành"),
    d("906", "Giồng Riềng"), d("907", "Gò Quao"), d("908", "An Biên"),
    d("909", "An Minh"), d("910", "Vĩnh Thuận"), d("911", "Phú Quốc"),
    d("912", "Kiên Hải"), d("913", "U Minh Thượng"), d("914", "Giang Thành"),
  ]),
  p("60", "Kon Tum", [
    d("608", "Kon Tum"), d("610", "Đắk Glei"), d("611", "Ngọc Hồi"),
    d("612", "Đắk Tô"), d("613", "Kon Plông"), d("614", "Kon Rẫy"),
    d("615", "Đắk Hà"), d("616", "Sa Thầy"), d("617", "Tu Mơ Rông"),
    d("618", "Ia H' Drai"),
  ]),
  p("12", "Lai Châu", [
    d("105", "Lai Châu"), d("107", "Tam Đường"), d("108", "Mường Tè"),
    d("109", "Sìn Hồ"), d("110", "Phong Thổ"), d("111", "Than Uyên"),
    d("112", "Tân Uyên"), d("113", "Nậm Nhùn"),
  ]),
  p("68", "Lâm Đồng", [
    d("672", "Đà Lạt"), d("673", "Bảo Lộc"), d("674", "Đam Rông"),
    d("675", "Lạc Dương"), d("676", "Lâm Hà"), d("677", "Đơn Dương"),
    d("678", "Đức Trọng"), d("679", "Di Linh"), d("680", "Bảo Lâm (cũ)"),
    d("681", "Đạ Huoai"), d("682", "Đạ Tẻh"), d("683", "Cát Tiên"),
  ]),
  p("20", "Lạng Sơn", [
    d("178", "Lạng Sơn"), d("180", "Tràng Định"), d("181", "Văn Lãng"),
    d("182", "Cao Lộc"), d("183", "Lộc Bình"), d("184", "Chi Lăng"),
    d("185", "Đình Lập"), d("186", "Hữu Lũng"), d("187", "Tràng Định (cũ)"),
  ]),
  p("10", "Lào Cai", [
    d("080", "Lào Cai"), d("082", "Bát Xát"), d("083", "Mường Khương"),
    d("084", "Si Ma Cai"), d("085", "Bắc Hà"), d("086", "Bảo Thắng"),
    d("087", "Bảo Yên"), d("088", "Sa Pa"), d("089", "Văn Bàn"),
  ]),
  p("36", "Long An", [
    d("368", "Tân An"), d("370", "Kiến Tường"), d("371", "Tân Hưng"),
    d("372", "Vĩnh Hưng"), d("373", "Mộc Hóa"), d("374", "Tân Thạnh"),
    d("375", "Thạnh Hóa"), d("376", "Đức Huệ"), d("377", "Đức Hòa"),
    d("378", "Bến Lức"), d("379", "Thủ Thừa"), d("380", "Châu Thành"),
    d("381", "Cần Đước"), d("382", "Cần Giuộc"),
  ]),
  p("37", "Nam Định", [
    d("356", "Nam Định"), d("358", "Mỹ Lộc"), d("359", "Vụ Bản"),
    d("360", "Ý Yên"), d("361", "Nghĩa Hưng"), d("362", "Nam Trực"),
    d("363", "Trực Ninh"), d("364", "Xuân Trường"), d("365", "Giao Thủy"),
    d("366", "Hải Hậu"),
  ]),
  p("40", "Nghệ An", [
    d("412", "Vinh"), d("413", "Cửa Lò"), d("414", "Thái Hòa"),
    d("415", "Quế Phong"), d("416", "Quỳ Châu"), d("417", "Kỳ Sơn"),
    d("418", "Tương Dương"), d("419", "Nghĩa Đàn"), d("420", "Quỳ Hợp"),
    d("421", "Quỳnh Lưu"), d("422", "Con Cuông"), d("423", "Tân Kỳ"),
    d("424", "Yên Thành"), d("425", "Diễn Châu"), d("426", "Nghi Lộc"),
    d("427", "Đô Lương"), d("428", "Thanh Chương"), d("429", "Anh Sơn"),
  ]),
  p("38", "Ninh Bình", [
    d("369", "Ninh Bình"), d("370", "Tam Điệp"), d("371", "Nho Quan"),
    d("372", "Gia Viễn"), d("373", "Hoa Lư"), d("374", "Yên Khánh"),
    d("375", "Kim Sơn"), d("376", "Yên Mô"),
  ]),
  p("58", "Ninh Thuận", [
    d("582", "Phan Rang - Tháp Chàm"), d("584", "Bác Ái"), d("585", "Ninh Sơn"),
    d("586", "Ninh Hải"), d("587", "Ninh Phước"), d("588", "Thuận Bắc"),
    d("589", "Thuận Nam"),
  ]),
  p("25", "Phú Thọ", [
    d("227", "Việt Trì"), d("228", "Phú Thọ"), d("230", "Đoan Hùng"),
    d("231", "Hạ Hoà"), d("232", "Thanh Ba"), d("233", "Phù Ninh"),
    d("234", "Lâm Thao"), d("235", "Tam Nông"), d("236", "Thanh Sơn"),
    d("237", "Thanh Thuỷ"), d("238", "Tân Sơn"), d("239", "Yên Lập"),
    d("240", "Cẩm Khê"),
  ]),
  p("54", "Phú Yên", [
    d("555", "Tuy Hòa"), d("557", "Sông Cầu"), d("558", "Đồng Xuân"),
    d("559", "Tuy An"), d("560", "Sơn Hòa"), d("561", "Sông Hinh"),
    d("562", "Tây Hòa"), d("563", "Phú Hòa"), d("564", "Đông Hòa"),
  ]),
  p("44", "Quảng Bình", [
    d("444", "Đồng Hới"), d("446", "Minh Hóa"), d("447", "Tuyên Hóa"),
    d("448", "Quảng Trạch"), d("449", "Bố Trạch"), d("450", "Quảng Ninh"),
    d("451", "Lệ Thủy"), d("452", "Ba Đồn"),
  ]),
  p("49", "Quảng Nam", [
    d("502", "Tam Kỳ"), d("503", "Hội An"), d("504", "Tây Giang"),
    d("505", "Đông Giang"), d("506", "Đại Lộc"), d("507", "Điện Bàn"),
    d("508", "Duy Xuyên"), d("509", "Quế Sơn"), d("510", "Nam Giang"),
    d("511", "Phước Sơn"), d("512", "Hiệp Đức"), d("513", "Thăng Bình"),
    d("514", "Tiên Phước"), d("515", "Bắc Trà My"), d("516", "Nam Trà My"),
    d("517", "Núi Thành"), d("518", "Phú Ninh"),
  ]),
  p("51", "Quảng Ngãi", [
    d("522", "Quảng Ngãi"), d("524", "Bình Sơn"), d("525", "Trà Bồng"),
    d("526", "Tây Trà"), d("527", "Sơn Tịnh"), d("528", "Tư Nghĩa"),
    d("529", "Mộ Đức"), d("530", "Đức Phổ"), d("531", "Ba Tơ"),
    d("532", "Lý Sơn"), d("533", "Sơn Hà"), d("534", "Minh Long"),
    d("535", "Nghĩa Hành"),
  ]),
  p("22", "Quảng Ninh", [
    d("193", "Hạ Long"), d("194", "Cẩm Phả"), d("195", "Uông Bí"),
    d("196", "Móng Cái"), d("198", "Quảng Yên"), d("199", "Đông Triều"),
    d("200", "Vân Đồn"), d("201", "Hoành Bồ"), d("202", "Cô Tô"),
    d("203", "Bình Liêu"), d("204", "Tiên Yên"), d("205", "Đầm Hà"),
    d("206", "Hải Hà"), d("207", "Ba Chẽ"),
  ]),
  p("45", "Quảng Trị", [
    d("461", "Đông Hà"), d("462", "Quảng Trị"), d("464", "Vĩnh Linh"),
    d("465", "Hướng Hóa"), d("466", "Gio Linh"), d("467", "Đa Krông"),
    d("468", "Cam Lộ"), d("469", "Triệu Phong"), d("470", "Hải Lăng"),
    d("471", "Cồn Cỏ"),
  ]),
  p("94", "Sóc Trăng", [
    d("940", "Sóc Trăng"), d("942", "Kế Sách"), d("943", "Mỹ Tú"),
    d("944", "Cù Lao Dung"), d("945", "Long Phú"), d("946", "Mỹ Xuyên"),
    d("947", "Thạnh Trị"), d("948", "Vĩnh Châu"), d("949", "Trần Đề"),
  ]),
  p("14", "Sơn La", [
    d("119", "Sơn La"), d("121", "Quỳnh Nhai"), d("122", "Thuận Châu"),
    d("123", "Mường La"), d("124", "Bắc Yên"), d("125", "Phù Yên"),
    d("126", "Mộc Châu"), d("127", "Yên Châu"), d("128", "Mai Sơn"),
    d("129", "Sông Mã"), d("130", "Sốp Cộp"), d("131", "Vân Hồ"),
  ]),
  p("32", "Tây Ninh", [
    d("703", "Tây Ninh"), d("705", "Tân Biên"), d("706", "Tân Châu"),
    d("707", "Dương Minh Châu"), d("708", "Châu Thành"), d("709", "Hòa Thành"),
    d("710", "Bến Cầu"), d("711", "Gò Dầu"), d("712", "Trảng Bàng"),
  ]),
  p("34", "Thái Bình", [
    d("336", "Thái Bình"), d("338", "Quỳnh Phụ"), d("339", "Hưng Hà"),
    d("340", "Đông Hưng"), d("341", "Thái Thụy"), d("342", "Tiền Hải"),
    d("343", "Kiến Xương"), d("344", "Vũ Thư"),
  ]),
  p("19", "Thái Nguyên", [
    d("165", "Thái Nguyên"), d("167", "Sông Công"), d("168", "Định Hóa"),
    d("169", "Phú Lương"), d("170", "Đồng Hỷ"), d("171", "Võ Nhai"),
    d("172", "Đại Từ"), d("173", "Phú Bình"),
  ]),
  p("46", "Thanh Hóa", [
    d("380", "Thanh Hóa"), d("381", "Bỉm Sơn"), d("382", "Sầm Sơn"),
    d("384", "Mường Lát"), d("385", "Quan Hóa"), d("386", "Bá Thước"),
    d("387", "Quan Sơn"), d("388", "Lang Chánh"), d("389", "Ngọc Lặc"),
    d("390", "Cẩm Thủy"), d("391", "Thạch Thành"), d("392", "Hà Trung"),
    d("393", "Vĩnh Lộc"), d("394", "Yên Định"), d("395", "Thọ Xuân"),
    d("396", "Thường Xuân"), d("397", "Triệu Sơn"), d("398", "Thiệu Hóa"),
    d("399", "Hoằng Hóa"), d("400", "Hậu Lộc"), d("401", "Nga Sơn"),
    d("402", "Như Xuân"), d("403", "Như Thanh"), d("404", "Nông Cống"),
    d("405", "Đông Sơn"), d("406", "Quảng Xương"), d("407", "Tĩnh Gia"),
  ]),
  p("15", "Yên Bái", [
    d("132", "Yên Bái"), d("133", "Nghĩa Lộ"), d("135", "Lục Yên"),
    d("136", "Văn Yên"), d("137", "Mù Cang Chải"), d("138", "Trấn Yên"),
    d("139", "Trạm Tấu"), d("140", "Văn Chấn"), d("141", "Yên Bình"),
  ]),
];

export const findProvince = (nameOrCode: string): Province | undefined => {
  if (!nameOrCode) return undefined;
  const normalized = nameOrCode.trim().toLowerCase();
  return PROVINCES.find(
    (entry) =>
      entry.name.toLowerCase() === normalized ||
      entry.code === nameOrCode
  );
};

export const searchProvinces = (query: string): Province[] => {
  if (!query || !query.trim()) return PROVINCES;
  const normalized = query.trim().toLowerCase();
  return PROVINCES.filter((entry) =>
    entry.name.toLowerCase().includes(normalized)
  );
};

export const searchDistricts = (
  province: Province | undefined,
  query: string
): District[] => {
  if (!province) return [];
  if (!query || !query.trim()) return province.districts;
  const normalized = query.trim().toLowerCase();
  return province.districts.filter((entry) =>
    entry.name.toLowerCase().includes(normalized)
  );
};
