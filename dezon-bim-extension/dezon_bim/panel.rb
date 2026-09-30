# HtmlDialog controller: mở panel Dezon Bim, nhận lệnh từ JS (scan, gán thuộc
# tính, chọn object trong model) và đẩy dữ liệu ngược lại cho UI qua
# execute_script.

require 'json'

module DezonBim
  module Panel
    @dialog = nil

    def self.toggle
      if @dialog && @dialog.visible?
        @dialog.close
      else
        show
      end
    end

    def self.show
      create_dialog unless @dialog
      @dialog.show
      push_scan_result
    end

    def self.scan_and_show
      show
    end

    def self.create_dialog
      html_path = File.join(File.dirname(__FILE__), 'html', 'panel.html')

      @dialog = UI::HtmlDialog.new(
        dialog_title: 'Dezon Bim',
        preferences_key: 'com.dezonbim.panel',
        scrollable: true,
        resizable: true,
        width: 420,
        height: 720,
        min_width: 360,
        min_height: 480,
        style: UI::HtmlDialog::STYLE_DIALOG
      )
      @dialog.set_file(html_path)

      @dialog.add_action_callback('scan') do |_context, _params|
        push_scan_result
      end

      @dialog.add_action_callback('assignAttribute') do |_context, params|
        data = JSON.parse(params)
        model = Sketchup.active_model
        ok = false
        model.start_operation('Dezon Bim — Gán dữ liệu', true)
        begin
          ok = Scanner.assign_attribute(model, data['instance_id'], data['key'], data['value'])
        ensure
          model.commit_operation
        end
        push_scan_result if ok
      end

      @dialog.add_action_callback('selectInModel') do |_context, params|
        data = JSON.parse(params)
        model = Sketchup.active_model
        entity = Scanner.find_by_persistent_id(model, data['instance_id'])
        next unless entity

        model.selection.clear
        model.selection.add(entity)
        model.active_view.zoom(model.selection)
      end

      @dialog.add_action_callback('saveLevels') do |_context, params|
        levels = JSON.parse(params)
        model = Sketchup.active_model
        model.start_operation('Dezon Bim — Cập nhật Level', true)
        begin
          Scanner.save_levels(model, levels)
        ensure
          model.commit_operation
        end
        push_scan_result
      end

      @dialog.add_action_callback('exportBoqCsv') do |_context, _params|
        model = Sketchup.active_model
        objects = Scanner.scan(model)
        rows = Scanner.build_boq(objects)
        if rows.empty?
          UI.messagebox('Chưa có object nào được gán Product — không có gì để xuất.')
          next
        end
        path = Scanner.export_boq_csv(rows)
        UI.messagebox(path ? "Đã xuất BOQ ra:\n#{path}" : 'Đã huỷ xuất file.')
      end

      @dialog.set_on_closed { @dialog = nil }
    end

    def self.push_scan_result
      return unless @dialog

      model = Sketchup.active_model
      unless model
        @dialog.execute_script('window.DezonBim && window.DezonBim.setError("Không có model nào đang mở.");')
        return
      end

      objects = Scanner.scan(model)
      payload = {
        model_name: model.title.to_s.empty? ? 'Untitled' : model.title,
        model_guid: model.respond_to?(:guid) ? model.guid.to_s : '—',
        saved: !model.path.to_s.empty?,
        object_count: objects.length,
        assigned_count: objects.count { |o| !o[:product].to_s.empty? },
        objects: objects,
        boq: Scanner.build_boq(objects),
        levels: Scanner.get_levels(model),
        materials: Scanner.compute_materials_takeoff(model)
      }
      @dialog.execute_script("window.DezonBim && window.DezonBim.setScanResult(#{payload.to_json});")
    end
  end
end
