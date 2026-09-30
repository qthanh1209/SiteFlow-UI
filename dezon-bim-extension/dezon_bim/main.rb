# Entry point loaded by SketchupExtension — registers the menu, toolbar and
# wires up the panel. Kept separate from dezon_bim.rb so the Extension Manager
# can list/enable the extension without loading the rest of the code.

require 'sketchup.rb'
require File.join(File.dirname(__FILE__), 'scanner.rb')
require File.join(File.dirname(__FILE__), 'panel.rb')

module DezonBim
  unless file_loaded?(__FILE__)
    menu = UI.menu('Extensions').add_submenu('Dezon Bim')
    menu.add_item('Mở bảng điều khiển') { DezonBim::Panel.toggle }
    menu.add_item('Scan / Đồng bộ Objects') { DezonBim::Panel.scan_and_show }

    toolbar = UI::Toolbar.new('Dezon Bim')
    cmd = UI::Command.new('Dezon Bim') { DezonBim::Panel.toggle }
    cmd.tooltip = 'Mở Dezon Bim'
    cmd.status_bar_text = 'Mở bảng điều khiển Dezon Bim'
    # cmd.small_icon / cmd.large_icon: thêm file .png vào thư mục icons/ rồi trỏ vào đây nếu muốn icon riêng.
    toolbar.add_item(cmd)
    toolbar.restore

    file_loaded(__FILE__)
  end
end
