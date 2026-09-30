# Dezon Bim — SketchUp extension loader.
#
# Cách cài đặt:
#   1. Sao chép cả 2 mục sau vào thư mục Plugins của SketchUp
#      (Window > Preferences > Extensions > Open Extensions Folder):
#        - dezon_bim.rb          (file này)
#        - dezon_bim/            (toàn bộ thư mục)
#   2. Khởi động lại SketchUp, vào Window > Extension Manager để bật "Dezon Bim"
#      nếu chưa được bật tự động.
#   3. Menu Extensions > Dezon Bim sẽ xuất hiện.

require 'sketchup.rb'
require 'extensions.rb'

module DezonBim
  PLUGIN_ROOT = File.dirname(__FILE__).freeze
  VERSION = '0.1.0'.freeze

  unless file_loaded?(__FILE__)
    ext = SketchupExtension.new('Dezon Bim', File.join(PLUGIN_ROOT, 'dezon_bim', 'main.rb'))
    ext.description = 'Gắn dữ liệu BIM (IFC class, Product, Tag) lên object trong SketchUp và xem lại trong bảng điều khiển Dezon Bim.'
    ext.version = VERSION
    ext.creator = 'SiteFlow / Dezon Bim'
    ext.copyright = "2026, #{ext.creator}"
    Sketchup.register_extension(ext, true)
    file_loaded(__FILE__)
  end
end
