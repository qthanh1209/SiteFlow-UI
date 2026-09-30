(function(){
  'use strict';

  /* ---- Chuyển tab ---- */
  document.querySelectorAll('.tab').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.tab').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var target = btn.getAttribute('data-tab');
      document.querySelectorAll('.panel').forEach(function(p){
        p.classList.toggle('active', p.getAttribute('data-panel') === target);
      });
    });
  });

  function escHtml(s){
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function callRuby(name, payload){
    // `sketchup` là đối tượng cầu nối do SketchUp HtmlDialog tự inject.
    // Mỗi action callback đăng ký ở panel.rb (add_action_callback) trở thành
    // một hàm sketchup.<tên> nhận đúng 1 tham số (chuỗi JSON).
    if(typeof sketchup === 'undefined'){
      console.warn('Chưa chạy trong SketchUp HtmlDialog — bỏ qua gọi ' + name);
      return;
    }
    sketchup[name](JSON.stringify(payload || {}));
  }

  var scanBtn = document.getElementById('scanBtn');
  var errorHint = document.getElementById('errorHint');
  var statusLabel = document.getElementById('statusLabel');
  var statusDot = document.getElementById('statusDot');

  var METHOD_MENU = { '1':'count', '2':'area', '3':'volume', '4':'length' };
  var METHOD_LABEL = { count:'Đếm đối tượng', area:'Diện tích', volume:'Thể tích', length:'Chiều dài' };
  var METHOD_UNIT = { count:'cái', area:'m²', volume:'m³', length:'m' };

  scanBtn.addEventListener('click', function(){
    scanBtn.disabled = true;
    scanBtn.textContent = 'Đang scan model...';
    errorHint.style.display = 'none';
    callRuby('scan');
  });

  function renderObject(obj){
    var card = document.createElement('div');
    card.className = 'obj-card';
    var qtyLine = obj.product
      ? '<div class="obj-qty">' + obj.method_label + ' · <span class="strong">' + fmtQty(obj.quantity) + ' ' + obj.unit + '</span></div>'
      : '';
    card.innerHTML =
      '<div class="obj-name">' + escHtml(obj.name) + '</div>' +
      '<div class="obj-def">' + escHtml(obj.definition) + ' · #' + escHtml(obj.instance_id) + '</div>' +
      '<div class="obj-meta">' +
        '<span class="pill' + (obj.ifc_class ? ' set' : ' unset') + '" data-role="ifc">' + (obj.ifc_class ? escHtml(obj.ifc_class) : 'Chưa gán IFC') + '</span>' +
        '<span class="pill' + (obj.product ? ' set' : ' unset') + '" data-role="product">' + (obj.product ? escHtml(obj.product) : 'Chưa gán Product') + '</span>' +
        '<span class="pill">' + escHtml(obj.level) + '</span>' +
        '<span class="pill">' + escHtml(obj.tag_layer) + '</span>' +
      '</div>' +
      qtyLine +
      '<div class="obj-dims">' + obj.width_m + ' × ' + obj.height_m + ' × ' + obj.depth_m + ' m · ' + escHtml(obj.type) + '</div>';

    card.querySelector('[data-role="ifc"]').addEventListener('click', function(e){
      e.stopPropagation();
      var val = prompt('Nhập IFC class cho "' + obj.name + '" (vd: IfcDoor, IfcWall, IfcFurniture):', obj.ifc_class || '');
      if(val === null) return;
      callRuby('assignAttribute', { instance_id: obj.instance_id, key: 'ifc_class', value: val.trim() });
    });
    card.querySelector('[data-role="product"]').addEventListener('click', function(e){
      e.stopPropagation();
      var name = prompt('Nhập tên Product cho "' + obj.name + '":', obj.product || '');
      if(name === null || !name.trim()) return;

      var defaultChoice = Object.keys(METHOD_MENU).filter(function(k){ return METHOD_MENU[k] === obj.method; })[0] || '1';
      var choice = prompt(
        'Cách đo bóc cho "' + name.trim() + '" — dùng để tính khối lượng thật từ hình học:\n' +
        '1 = Đếm đối tượng (cái)\n2 = Diện tích bề mặt (m²)\n3 = Thể tích — cần khối solid khép kín (m³)\n4 = Chiều dài — cạnh lớn nhất (m)',
        defaultChoice
      );
      if(choice === null) return;
      var method = METHOD_MENU[choice.trim()] || 'count';

      callRuby('assignAttribute', { instance_id: obj.instance_id, key: 'product', value: name.trim() });
      callRuby('assignAttribute', { instance_id: obj.instance_id, key: 'method', value: method });
    });
    card.addEventListener('click', function(){
      callRuby('selectInModel', { instance_id: obj.instance_id });
    });

    return card;
  }

  function fmtQty(n){
    var num = Number(n) || 0;
    return num.toLocaleString('vi-VN', { maximumFractionDigits: 3 });
  }

  function renderBoq(rows){
    var box = document.getElementById('boqList');
    box.innerHTML = '';
    if(!rows || !rows.length){
      box.innerHTML = '<div class="empty-state">Chưa có object nào được gán Product.<br>Sang tab Objects, bấm vào pill "Chưa gán Product" để bắt đầu bóc khối lượng.</div>';
      return;
    }
    rows.forEach(function(row){
      var el = document.createElement('div');
      el.className = 'data-row';
      el.innerHTML =
        '<div class="grow">' +
          '<div class="row-title">' + escHtml(row.product) + '</div>' +
          '<div class="row-sub">' + escHtml(row.method_label) + ' · ' + row.object_count + ' object' + (row.object_count > 1 ? 's' : '') + '</div>' +
        '</div>' +
        '<span class="mono strong">' + fmtQty(row.quantity) + ' ' + escHtml(row.unit) + '</span>';
      box.appendChild(el);
    });
  }

  /* ---- Level ---- */
  var currentLevels = [];

  function renderLevels(levels, objects){
    currentLevels = levels || [];
    var box = document.getElementById('levelList');
    box.innerHTML = '';
    if(!currentLevels.length){
      box.innerHTML = '<div class="empty-state">Chưa khai báo Level nào. Bấm "Thêm Level" bên dưới.</div>';
      return;
    }
    var counts = {};
    (objects || []).forEach(function(o){ counts[o.level] = (counts[o.level] || 0) + 1; });

    currentLevels.forEach(function(lvl, idx){
      var el = document.createElement('div');
      el.className = 'data-row';
      el.innerHTML =
        '<div class="chip active">' + escHtml(lvl.name.slice(0, 3).toUpperCase()) + '</div>' +
        '<div class="grow">' +
          '<div class="row-title">' + escHtml(lvl.name) + '</div>' +
          '<div class="row-sub">Cao độ ' + fmtQty(lvl.elevation) + ' m · Cao ' + fmtQty(lvl.height) + ' m · ' + (counts[lvl.name] || 0) + ' object</div>' +
        '</div>' +
        '<button class="remove-btn" data-idx="' + idx + '" title="Xoá Level"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
      el.querySelector('.remove-btn').addEventListener('click', function(){
        if(!confirm('Xoá Level "' + lvl.name + '"? Object đang thuộc Level này sẽ chuyển về "Chưa xác định".')) return;
        currentLevels.splice(idx, 1);
        callRuby('saveLevels', currentLevels);
      });
      box.appendChild(el);
    });
  }

  document.getElementById('addLevelBtn').addEventListener('click', function(){
    var name = prompt('Tên Level (vd: Tầng 02, Mái, Tầng hầm):', '');
    if(name === null || !name.trim()) return;
    var elevation = parseFloat(prompt('Cao độ bắt đầu (m), tính từ gốc toạ độ model:', '0'));
    if(isNaN(elevation)) { alert('Cao độ không hợp lệ.'); return; }
    var height = parseFloat(prompt('Chiều cao Level (m):', '3.6'));
    if(isNaN(height) || height <= 0) { alert('Chiều cao không hợp lệ.'); return; }

    currentLevels.push({ name: name.trim(), elevation: elevation, height: height });
    callRuby('saveLevels', currentLevels);
  });

  /* ---- Material (thật, theo material SketchUp) ---- */
  function renderMaterials(materials){
    var box = document.getElementById('materialList');
    box.innerHTML = '';
    if(!materials || !materials.length){
      box.innerHTML = '<div class="empty-state">Model chưa có mặt nào được tô vật liệu, hoặc chưa Scan lần nào.</div>';
      return;
    }
    materials.forEach(function(mat){
      var el = document.createElement('div');
      el.className = 'data-row';
      el.innerHTML =
        '<div class="swatch" style="background:' + escHtml(mat.color) + ';"></div>' +
        '<div class="grow">' +
          '<div class="row-title">' + escHtml(mat.name) + '</div>' +
          '<div class="row-sub">' + mat.face_count + ' mặt</div>' +
        '</div>' +
        '<span class="mono strong">' + fmtQty(mat.area_m2) + ' m²</span>';
      box.appendChild(el);
    });
  }

  document.getElementById('exportBoqBtn').addEventListener('click', function(){
    callRuby('exportBoqCsv');
  });

  /* ---- Nhận dữ liệu từ Ruby (panel.rb gọi execute_script vào đây) ---- */
  window.DezonBim = {
    setScanResult: function(data){
      scanBtn.disabled = false;
      scanBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/></svg>Scan / Đồng bộ Objects';

      document.getElementById('modelName').textContent = data.model_name;
      document.getElementById('modelSavedLabel').textContent = data.saved ? 'Đã lưu' : 'Chưa lưu file — hãy Save trước khi scan để giữ ổn định GUID';
      document.getElementById('modelGuid').textContent = data.model_guid;
      document.getElementById('objectCountLabel').textContent = data.object_count;
      document.getElementById('assignedCountLabel').textContent = data.assigned_count + ' / ' + data.object_count;

      statusLabel.textContent = 'Đã đồng bộ · ' + data.object_count + ' objects';
      statusDot.querySelector('.dot').style.background = '#1E8E5A';

      var list = document.getElementById('objectsList');
      list.innerHTML = '';
      if(!data.objects.length){
        list.innerHTML = '<div class="empty-state">Không tìm thấy Group/Component nào trong model.<br>Vẽ hoặc tạo Group/Component rồi bấm Scan lại.</div>';
      } else {
        data.objects.forEach(function(obj){ list.appendChild(renderObject(obj)); });
      }

      renderBoq(data.boq);
      renderLevels(data.levels, data.objects);
      renderMaterials(data.materials);
    },
    setError: function(message){
      scanBtn.disabled = false;
      scanBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/></svg>Scan / Đồng bộ Objects';
      errorHint.textContent = message;
      errorHint.style.display = 'block';
      statusLabel.textContent = 'Lỗi';
      statusDot.querySelector('.dot').style.background = '#C0392B';
    }
  };
})();
