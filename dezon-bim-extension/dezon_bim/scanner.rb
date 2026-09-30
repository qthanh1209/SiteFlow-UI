# Quét model SketchUp thật: liệt kê Group / ComponentInstance, gán GUID ổn định,
# đọc/ghi dữ liệu BIM (IFC class, Product, cách đo bóc...) vào attribute
# dictionary riêng của Dezon Bim, tự động gán Level theo cao độ, bóc khối
# lượng theo Product (BOQ) và theo Vật liệu SketchUp — tất cả tính trực tiếp
# từ hình học thật trong model, không dùng số liệu giả lập.

require 'securerandom'
require 'json'
require 'csv'

module DezonBim
  module Scanner
    DICT_NAME = 'DezonBIM'.freeze          # attribute dictionary trên từng entity
    MODEL_DICT_NAME = 'DezonBIM_Model'.freeze # attribute dictionary trên model (lưu danh sách Level)
    INCH_TO_METER = 0.0254

    METHODS = {
      'count'  => { label: 'Đếm đối tượng', unit: 'cái' },
      'area'   => { label: 'Diện tích',     unit: 'm²' },
      'volume' => { label: 'Thể tích',      unit: 'm³' },
      'length' => { label: 'Chiều dài',     unit: 'm' }
    }.freeze

    DEFAULT_LEVELS = [
      { 'name' => 'Tầng 01', 'elevation' => 0.0, 'height' => 3.6 }
    ].freeze

    # ===================== LEVEL =====================
    # Level do người dùng tự khai báo (tên + cao độ + chiều cao), lưu vào
    # attribute dictionary của MODEL (không phải của từng entity) nên chỉ cần
    # khai báo 1 lần cho cả file. Object được tự động gán vào Level có
    # khoảng [elevation, elevation + height) chứa cao độ đáy bounding box.
    def self.get_levels(model)
      dict = model.attribute_dictionary(MODEL_DICT_NAME, true)
      raw = dict['levels']
      levels =
        if raw.nil? || raw.to_s.empty?
          DEFAULT_LEVELS.map(&:dup)
        else
          JSON.parse(raw)
        end
      levels.sort_by { |l| l['elevation'].to_f }
    end

    def self.save_levels(model, levels)
      dict = model.attribute_dictionary(MODEL_DICT_NAME, true)
      dict['levels'] = levels.to_json
      get_levels(model)
    end

    def self.level_for_elevation(levels, z_meters)
      match = levels.find do |l|
        lo = l['elevation'].to_f
        hi = lo + l['height'].to_f
        z_meters >= lo && z_meters < hi
      end
      match ? match['name'] : nil
    end

    # ===================== OBJECTS =====================
    def self.scan(model = Sketchup.active_model)
      return [] unless model

      results = []
      levels = get_levels(model)
      model.start_operation('Dezon Bim — Scan objects', true)
      begin
        visit_entities(model.entities, results, levels)
      ensure
        model.commit_operation
      end
      results
    end

    def self.visit_entities(entities, results, levels)
      entities.each do |entity|
        next unless entity.is_a?(Sketchup::Group) || entity.is_a?(Sketchup::ComponentInstance)

        results << describe_instance(entity, levels)

        child_entities = entity.is_a?(Sketchup::Group) ? entity.entities : entity.definition.entities
        visit_entities(child_entities, results, levels)
      end
    end

    def self.describe_instance(entity, levels)
      dict = entity.attribute_dictionary(DICT_NAME, true)

      guid = dict['guid']
      if guid.nil? || guid.to_s.empty?
        guid = SecureRandom.uuid
        dict['guid'] = guid
      end

      definition = entity.definition
      bounds = entity.bounds
      method_key = dict['method'].to_s
      method_key = 'count' unless METHODS.key?(method_key)

      bottom_z_m = (bounds.min.z.to_f * INCH_TO_METER).round(3)
      level_name = level_for_elevation(levels, bottom_z_m) || 'Chưa xác định'

      {
        instance_id: entity.persistent_id.to_s,
        guid: guid,
        name: entity.name.to_s.empty? ? definition.name : entity.name,
        definition: definition.name,
        ifc_class: dict['ifc_class'].to_s,
        product: dict['product'].to_s,
        method: method_key,
        method_label: METHODS[method_key][:label],
        unit: METHODS[method_key][:unit],
        quantity: compute_quantity(entity, method_key),
        level: level_name,
        elevation_m: bottom_z_m,
        tag_layer: entity.layer ? entity.layer.name : 'Layer0',
        type: entity.is_a?(Sketchup::Group) ? 'Group' : 'Component',
        width_m: (bounds.width.to_f * INCH_TO_METER).round(3),
        height_m: (bounds.height.to_f * INCH_TO_METER).round(3),
        depth_m: (bounds.depth.to_f * INCH_TO_METER).round(3)
      }
    end

    # Đo khối lượng thật từ hình học của entity, theo phương pháp đã chọn.
    # area/volume tính trên toàn bộ face lồng bên trong group/component
    # (kể cả các group/component con), không chỉ face trực tiếp. Với face có
    # lỗ mở (cửa/cửa sổ được cắt thật vào tường), SketchUp's face.area đã tự
    # trừ diện tích lỗ mở — không cần tính bù thủ công.
    def self.compute_quantity(entity, method_key)
      case method_key
      when 'area'
        (total_face_area(entity) * INCH_TO_METER * INCH_TO_METER).round(3)
      when 'volume'
        vol = entity.volume.to_f # 0 nếu hình học không khép kín (không phải solid)
        (vol * INCH_TO_METER**3).round(4)
      when 'length'
        bounds = entity.bounds
        dims = [bounds.width.to_f, bounds.height.to_f, bounds.depth.to_f]
        (dims.max * INCH_TO_METER).round(3)
      else # 'count'
        1
      end
    end

    def self.total_face_area(entity)
      entities = entity.is_a?(Sketchup::Group) ? entity.entities : entity.definition.entities
      sum_face_area(entities)
    end

    def self.sum_face_area(entities)
      total = 0.0
      entities.each do |e|
        case e
        when Sketchup::Face
          total += e.area.to_f
        when Sketchup::Group
          total += sum_face_area(e.entities)
        when Sketchup::ComponentInstance
          total += sum_face_area(e.definition.entities)
        end
      end
      total
    end

    # Ghi 1 trường dữ liệu BIM (vd: ifc_class, product, method) vào attribute
    # dictionary của entity tương ứng, tìm theo persistent_id do UI gửi lên.
    # Trả về true nếu tìm thấy và ghi thành công.
    def self.assign_attribute(model, persistent_id, key, value)
      entity = find_by_persistent_id(model, persistent_id)
      return false unless entity

      allowed_keys = %w[ifc_class product method]
      return false unless allowed_keys.include?(key)
      return false if key == 'method' && !METHODS.key?(value)

      dict = entity.attribute_dictionary(DICT_NAME, true)
      dict[key] = value
      true
    end

    def self.find_by_persistent_id(model, persistent_id, entities = nil)
      entities ||= model.entities
      entities.each do |entity|
        next unless entity.is_a?(Sketchup::Group) || entity.is_a?(Sketchup::ComponentInstance)
        return entity if entity.persistent_id.to_s == persistent_id.to_s

        child_entities = entity.is_a?(Sketchup::Group) ? entity.entities : entity.definition.entities
        found = find_by_persistent_id(model, persistent_id, child_entities)
        return found if found
      end
      nil
    end

    # ===================== BOQ (theo Product) =====================
    # Gộp toàn bộ object đã có Product thành bảng khối lượng (BOQ) thật —
    # cộng dồn theo Product, giữ nguyên cách đo/đơn vị của Product đó.
    def self.build_boq(objects)
      groups = {}
      objects.each do |obj|
        next if obj[:product].to_s.empty?

        key = obj[:product] + '||' + obj[:method]
        groups[key] ||= {
          product: obj[:product],
          method: obj[:method],
          method_label: obj[:method_label],
          unit: obj[:unit],
          quantity: 0.0,
          object_count: 0
        }
        groups[key][:quantity] += obj[:quantity].to_f
        groups[key][:object_count] += 1
      end

      groups.values.map do |row|
        row[:quantity] = row[:quantity].round(3)
        row
      end.sort_by { |row| -row[:quantity] }
    end

    def self.export_boq_csv(rows)
      path = UI.savepanel('Xuất BOQ ra CSV', '', 'dezon-bim-boq.csv')
      return nil unless path

      path += '.csv' unless path.downcase.end_with?('.csv')
      csv_text = CSV.generate do |csv|
        csv << ['San pham (Product)', 'Cach do boc', 'So luong', 'Don vi', 'So object']
        rows.each { |r| csv << [r[:product], r[:method_label], r[:quantity], r[:unit], r[:object_count]] }
      end

      File.open(path, 'wb') do |f|
        f.write("\xEF\xBB\xBF") # BOM để Excel nhận đúng chữ có dấu
        f.write(csv_text)
      end
      path
    end

    # ===================== VẬT LIỆU (theo Material SketchUp) =====================
    # Bóc khối lượng theo vật liệu SketchUp đang thực sự gán trên hình học —
    # không cần gán Product, chỉ cần model đã tô vật liệu là ra ngay số liệu.
    # Đây là góc nhìn bóc tách độc lập với BOQ theo Product ở trên (thường
    # dùng cho sơn/ốp lát/hoàn thiện thay vì cấu kiện rời).
    def self.compute_materials_takeoff(model)
      totals = Hash.new(0.0)
      counts = Hash.new(0)

      visit_faces(model.entities) do |face|
        front = face.material
        back = face.back_material
        mats = []
        mats << front if front
        mats << back if back && back != front
        mats << nil if mats.empty?

        mats.each do |mat|
          name = mat ? mat.display_name : '(Chưa gán vật liệu)'
          totals[name] += face.area.to_f
          counts[name] += 1
        end
      end

      totals.map do |name, area_sqin|
        {
          name: name,
          area_m2: (area_sqin * INCH_TO_METER * INCH_TO_METER).round(3),
          face_count: counts[name],
          color: material_color_hex(model, name)
        }
      end.sort_by { |m| -m[:area_m2] }
    end

    def self.visit_faces(entities, &block)
      entities.each do |e|
        case e
        when Sketchup::Face
          block.call(e)
        when Sketchup::Group
          visit_faces(e.entities, &block)
        when Sketchup::ComponentInstance
          visit_faces(e.definition.entities, &block)
        end
      end
    end

    def self.material_color_hex(model, name)
      mat = model.materials[name]
      return '#CBD1DA' unless mat && mat.color

      c = mat.color
      format('#%02X%02X%02X', c.red, c.green, c.blue)
    end
  end
end
