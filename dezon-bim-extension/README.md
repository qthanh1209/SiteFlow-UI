# Dezon Bim — SketchUp Extension

Extension SketchUp thật (Ruby + `UI::HtmlDialog`), là phần "chạy trong SketchUp"
tương ứng với trang `bim.html` trong SiteFlow-UI. Đây là bản khung sườn:

- **Objects: hoạt động thật.** Quét toàn bộ Group/Component trong model đang mở
  (kể cả lồng nhau), gán GUID ổn định + đọc/ghi IFC class và Product vào một
  attribute dictionary riêng (`DezonBIM`) trên từng entity, chọn/zoom tới object
  trong model khi bấm vào 1 thẻ trong panel.
- **Level: hoạt động thật.** Tự khai báo Level (tên + cao độ + chiều cao) —
  lưu vào attribute dictionary của **model** nên chỉ cần khai báo 1 lần cho cả
  file. Mỗi object khi Scan được tự động xếp vào Level có khoảng cao độ chứa
  đáy bounding box của nó (tính từ `entity.bounds.min.z` thật, không phải số
  mẫu).
- **BOQ: bóc khối lượng thật từ hình học.** Khi gán Product cho 1 object, chọn
  luôn cách đo (đếm đối tượng / diện tích / thể tích / chiều dài) — số lượng
  được tính trực tiếp từ hình học SketchUp (`face.area`, `entity.volume`,
  bounding box), không phải số liệu giả lập. Tab BOQ cộng dồn theo Product,
  cập nhật mỗi lần Scan lại, và có nút **Xuất CSV** (dùng `UI.savepanel` để
  lưu file thật ra đĩa).
- **Material: hoạt động thật.** Bóc diện tích theo **vật liệu SketchUp** đang
  thực sự tô trên hình học (không cần gán Product) — quét toàn bộ face trong
  model, cộng dồn `face.area` theo tên vật liệu (cả mặt trước lẫn mặt sau nếu
  khác nhau), lấy màu thật của material để hiển thị ô màu.
- **Room-Space / Filter: khung giao diện + dữ liệu mẫu.** Chưa đọc dữ liệu
  thật từ model (cần thuật toán dò boundary polygon phức tạp hơn) — để làm ở
  vòng sau.

## Cấu trúc

```
dezon-bim-extension/
├── dezon_bim.rb              # file loader — copy vào thư mục Plugins/ của SketchUp
└── dezon_bim/                # copy cả thư mục này vào Plugins/ (cùng cấp với dezon_bim.rb)
    ├── main.rb                # đăng ký menu Extensions + toolbar
    ├── scanner.rb             # logic quét model thật (Group/ComponentInstance, attribute dictionary)
    ├── panel.rb               # UI::HtmlDialog — cầu nối Ruby ⇄ JS
    └── html/
        ├── panel.html
        ├── panel.css
        └── panel.js
```

## Cài đặt để test

1. Mở SketchUp → **Window ▸ Preferences ▸ Extensions ▸ Open Extensions Folder**
   (hoặc **Window ▸ Extension Manager** trên bản mới, có nút mở thư mục Plugins).
2. Copy **cả 2 mục**: `dezon_bim.rb` và thư mục `dezon_bim/` vào đúng thư mục
   Plugins đó (không đổi tên, giữ nguyên cấu trúc lồng nhau).
3. Khởi động lại SketchUp.
4. Vào **Window ▸ Extension Manager**, đảm bảo "Dezon Bim" đang bật (mặc định
   `Sketchup.register_extension(ext, true)` tự bật khi cài lần đầu).
5. Mở một file model bất kỳ có sẵn vài Group/Component (hoặc tạo nhanh vài khối,
   Right click ▸ Make Group).
6. Menu **Extensions ▸ Dezon Bim ▸ Mở bảng điều khiển** — panel hiện ra bên phải
   màn hình dưới dạng cửa sổ dialog riêng.
7. Bấm **"Scan / Đồng bộ Objects"** — danh sách Group/Component trong model sẽ
   hiện ra trong panel với: tên, definition, kích thước, và 2 pill "Chưa gán
   IFC" / "Chưa gán Product".
8. Bấm vào pill "Chưa gán IFC" hoặc "Chưa gán Product" trên 1 thẻ → nhập giá trị
   → panel tự Scan lại và cập nhật pill thành màu tím ("đã gán"). Giá trị này
   được ghi thật vào attribute dictionary `DezonBIM` của entity đó trong file
   SketchUp — Save file rồi mở lại, Scan lại sẽ vẫn thấy dữ liệu (kể cả GUID
   không đổi, vì được lưu vào entity chứ không phải chỉ trong bộ nhớ panel).
9. Bấm vào 1 thẻ object (ngoài 2 pill) → SketchUp tự **Select + Zoom** tới
   đúng object đó trong model — hữu ích để xác nhận đúng object trước khi gán.
10. Khi bấm pill "Chưa gán Product", sau khi nhập tên Product, panel sẽ hỏi
    tiếp **cách đo bóc** (1 = Đếm đối tượng, 2 = Diện tích, 3 = Thể tích,
    4 = Chiều dài). Chọn xong, thẻ object hiện luôn số lượng đo được — và
    sang tab **BOQ** sẽ thấy bảng khối lượng cộng dồn theo Product, tính từ
    hình học thật trong model (không phải số liệu mẫu).
    - *Diện tích*: cộng `face.area` của mọi mặt bên trong group/component.
    - *Thể tích*: dùng `entity.volume` — chỉ có giá trị khác 0 nếu hình học
      là khối **solid khép kín** (không hở mặt nào); nếu ra 0, kiểm tra lại
      hình học bằng công cụ Solid Inspector trước.
    - *Chiều dài*: lấy cạnh lớn nhất trong bounding box của object.
11. Tab **BOQ** có nút "Xuất CSV" — mở hộp thoại Save thật của hệ điều hành,
    ghi ra file CSV (có BOM UTF-8 để Excel hiển thị đúng tiếng Việt).
12. Tab **Level**: bấm "Thêm Level", nhập Tên / Cao độ (m) / Chiều cao (m) —
    Level được lưu vào model, và mọi object sẽ tự xếp vào đúng Level dựa theo
    cao độ đáy thật của nó khi Scan lại. Bấm nút x trên 1 dòng Level để xoá.
13. Tab **Material**: tự động liệt kê mọi vật liệu SketchUp đang được tô lên
    model kèm tổng diện tích — không cần thao tác gì thêm, cứ Scan là ra số
    liệu (hữu ích để đối chiếu diện tích sơn/ốp lát mà không cần gán Product
    cho từng mặt).

## Vì sao tách 2 file `dezon_bim.rb` và `dezon_bim/main.rb`

Đây là quy ước chuẩn của extension SketchUp: `dezon_bim.rb` (nằm trực tiếp
trong `Plugins/`) chỉ làm mỗi việc **đăng ký** extension với
`Sketchup.register_extension`, KHÔNG load logic thật. Logic thật (`main.rb`,
`scanner.rb`, `panel.rb`) chỉ được `require` khi người dùng thật sự bật
extension đó trong Extension Manager — giúp SketchUp khởi động nhanh hơn khi
có nhiều extension đồng thời cùng cài.

## Đóng gói `.rbz` để phân phối

Khi sẵn sàng chia sẻ cho người khác cài (thay vì copy tay vào Plugins/), nén
toàn bộ thư mục `dezon-bim-extension/` (giữ nguyên cấu trúc `dezon_bim.rb` +
`dezon_bim/`) thành file zip rồi đổi đuôi `.zip` → `.rbz`. Người dùng cài bằng
**Extension Manager ▸ Install Extension** rồi chọn file `.rbz` đó — không cần
tự copy vào Plugins/.

## Giới hạn hiện tại / việc cần làm tiếp

- `entity.persistent_id` chỉ ổn định **trong cùng 1 file đã lưu** — nếu copy
  object sang file khác, `persistent_id` sẽ khác nhưng GUID lưu trong attribute
  dictionary (`DezonBIM/guid`) vẫn giữ nguyên, nên nên dùng `guid` (không phải
  `persistent_id`) làm khoá đồng bộ với backend thật sau này.
- Tab Room-Space/Filter vẫn là dữ liệu mẫu tĩnh trong `panel.html`. Room/Space
  cần thuật toán dò boundary polygon của các mặt sàn (nhóm face nằm ngang,
  liền kề, không thuộc tường/nội thất) — phức tạp hơn nhiều so với Level nên
  để ở vòng sau. Filter cần một Query DSL thật để lọc theo IFC class/Level/
  thuộc tính tuỳ ý.
- BOQ hiện chỉ có **số lượng** (đo thật), chưa có **đơn giá/thành tiền** — bảng
  giá (pricing policy) là dữ liệu thuộc tổ chức, đúng kiến trúc nên nằm ở
  Dezon Bim Workspace (backend), không lưu cứng trong file SketchUp.
- Method 'volume' phụ thuộc hoàn toàn vào chất lượng hình học — nếu object
  không phải solid khép kín (thường gặp khi model từ SketchUp import/kéo thả
  không cẩn thận), `entity.volume` trả về 0. Chưa có cảnh báo rõ ràng trong UI
  khi việc này xảy ra (chỉ ra số 0, dễ nhầm là "chưa đo") — nên thêm cảnh báo
  riêng ở vòng sau.
- Material takeoff cộng cả 2 mặt (trước/sau) nếu khác vật liệu — đúng cho vật
  liệu ốp 2 mặt khác màu, nhưng nếu model có face "rác" (2 mặt chồng nhau
  cùng vị trí, lỗi thường gặp khi import từ CAD), số liệu sẽ bị cộng trùng.
  Không có bước lọc face trùng lặp ở bản này.
- Chưa có kết nối mạng thật tới Dezon Bim Workspace (phần `bim.html` phía
  SiteFlow) — hiện tại 2 bên là 2 dự án tách biệt, dùng chung ý tưởng dữ liệu
  nhưng chưa có API đồng bộ qua lại.
