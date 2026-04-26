// ==================== Products Management View ====================
class ProductsView {
  static products = [];
  static categories = [];
  
  static async render() {
    this.products = await window.api.getProducts(true);
    this.categories = await window.api.getCategories();
    
    return `
      <div class="page">
        <div class="page-header">
          <div>
            <h1>📦 Productos</h1>
            <p>Administra los productos de tu cafetería</p>
          </div>
          <div class="flex gap-sm">
            <button class="btn btn-secondary" id="btn-manage-categories">🏷️ Categorías</button>
            <button class="btn btn-primary" style="width:auto" id="btn-add-product">➕ Nuevo Producto</button>
          </div>
        </div>
        
        <div class="products-manage-grid" id="products-manage-list">
          ${this.renderProductCards()}
        </div>
      </div>
    `;
  }
  
  static renderProductCards() {
    if (this.products.length === 0) {
      return `<div class="empty-state" style="grid-column: 1/-1"><span class="empty-state-icon">📦</span><h3>Sin productos</h3><p>Agrega tu primer producto</p></div>`;
    }
    return this.products.map(p => `
      <div class="product-manage-card ${!p.active ? 'opacity-50' : ''}">
        <div class="product-manage-header">
          <div class="product-manage-info">
            <h3>${p.category_icon || '📦'} ${p.name} ${!p.active ? '<span class="badge badge-danger">Inactivo</span>' : ''}</h3>
            <p>${p.description || 'Sin descripción'}</p>
          </div>
          <div class="product-manage-actions">
            <button class="btn-icon" title="Editar" data-edit="${p.id}">✏️</button>
            <button class="btn-icon" title="${p.active ? 'Desactivar' : 'Activar'}" data-toggle="${p.id}" data-active="${p.active}">${p.active ? '🗑️' : '♻️'}</button>
          </div>
        </div>
        <div class="product-manage-meta">
          <span class="product-manage-price">$${p.price.toFixed(2)}</span>
          <span class="product-manage-category">${p.category_icon || ''} ${p.category_name || 'Sin categoría'}</span>
        </div>
      </div>
    `).join('');
  }
  
  static attachEvents() {
    // Add product
    document.getElementById('btn-add-product').addEventListener('click', () => this.showProductForm());
    
    // Categories
    document.getElementById('btn-manage-categories').addEventListener('click', () => this.showCategoriesModal());
    
    // Edit / Toggle
    document.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => this.showProductForm(parseInt(btn.dataset.edit)));
    });
    
    document.querySelectorAll('[data-toggle]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset.toggle);
        const isActive = btn.dataset.active === '1';
        
        if (isActive) {
          Modal.confirm({
            title: 'Desactivar Producto',
            message: '¿Estás seguro de desactivar este producto? Ya no aparecerá en el punto de venta.',
            confirmText: 'Desactivar',
            danger: true,
            onConfirm: async () => {
              await window.api.deleteProduct(id);
              Toast.success('Producto desactivado');
              await this.refresh();
            }
          });
        } else {
          await window.api.updateProduct(id, { active: true });
          Toast.success('Producto reactivado');
          await this.refresh();
        }
      });
    });
  }
  
  static async refresh() {
    this.products = await window.api.getProducts(true);
    document.getElementById('products-manage-list').innerHTML = this.renderProductCards();
    // Re-attach events on list
    document.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => this.showProductForm(parseInt(btn.dataset.edit)));
    });
    document.querySelectorAll('[data-toggle]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset.toggle);
        const isActive = btn.dataset.active === '1';
        if (isActive) {
          Modal.confirm({
            title: 'Desactivar Producto',
            message: '¿Desactivar este producto?',
            confirmText: 'Desactivar',
            danger: true,
            onConfirm: async () => {
              await window.api.deleteProduct(id);
              Toast.success('Producto desactivado');
              await this.refresh();
            }
          });
        } else {
          await window.api.updateProduct(id, { active: true });
          Toast.success('Producto reactivado');
          await this.refresh();
        }
      });
    });
  }
  
  static showProductForm(editId) {
    const product = editId ? this.products.find(p => p.id === editId) : null;
    const isEdit = !!product;
    
    let options = { hasSizes: false, sizeMediano: '', sizeGrande: '', milks: [], flavors: [], extras: [] };
    if (isEdit && product.options) {
      try { 
        const parsed = JSON.parse(product.options);
        options = { ...options, ...parsed };
      } catch {}
    }
    
    const content = `
      <form id="product-form">
        <div class="form-group">
          <label>Nombre del Producto</label>
          <input type="text" class="form-input" id="prod-name" value="${isEdit ? product.name : ''}" placeholder="Ej: Cappuccino" required>
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <input type="text" class="form-input" id="prod-desc" value="${isEdit ? (product.description || '') : ''}" placeholder="Breve descripción del producto">
        </div>
        <div class="form-row">
          <div class="form-group" id="group-base-price" style="${options.hasSizes ? 'opacity:0.5;' : 'opacity:1;'}">
            <label>Precio Base ($)</label>
            <input type="number" class="form-input" id="prod-price" value="${isEdit ? product.price : ''}" step="0.01" min="0" placeholder="0.00" ${options.hasSizes ? 'disabled' : 'required'}>
          </div>
          <div class="form-group">
            <label>Categoría</label>
            <select id="prod-category" class="form-select">
              <option value="">Sin categoría</option>
              ${this.categories.map(c => `
                <option value="${c.id}" ${isEdit && product.category_id == c.id ? 'selected' : ''}>${c.icon} ${c.name}</option>
              `).join('')}
            </select>
          </div>
        </div>
        
        <div class="options-container" style="border-top:1px solid var(--border); padding-top:1rem; margin-top:1rem;">
          <label style="display:flex; align-items:center; gap:0.5rem; font-weight:600; font-size:14px; margin-bottom:0.5rem; cursor:pointer;">
            <input type="checkbox" id="toggle-has-sizes" ${options.hasSizes ? 'checked' : ''}>
            ¿Tiene tamaños predeterminados (Mediano y Grande)?
          </label>
          
          <div id="sizes-group" style="${options.hasSizes ? 'display:flex;' : 'display:none;'} gap:1rem; margin-bottom:1rem; padding:10px; background:var(--bg-lighter); border-radius:8px;">
            <div class="form-group" style="flex:1; margin-bottom:0;">
              <label>Precio Mediano ($)</label>
              <input type="number" class="form-input" id="prod-size-mediano" value="${options.sizeMediano}" step="0.01" min="0" placeholder="0.00">
            </div>
            <div class="form-group" style="flex:1; margin-bottom:0;">
              <label>Precio Grande ($)</label>
              <input type="number" class="form-input" id="prod-size-grande" value="${options.sizeGrande}" step="0.01" min="0" placeholder="0.00">
            </div>
          </div>
          
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <p style="font-weight:600; font-size:14px;">Sabores Adicionales</p>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-add-flavor" style="padding:0.25rem 0.5rem; width:auto;">+ Sabor</button>
          </div>
          <div id="flavors-list" style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1rem;"></div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <p style="font-weight:600; font-size:14px;">Tipos de Leche</p>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-add-milk" style="padding:0.25rem 0.5rem; width:auto;">+ Leche</button>
          </div>
          <div id="milks-list" style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1rem;"></div>
          
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <p style="font-weight:600; font-size:14px;">Ingredientes / Extras Generales</p>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-add-extra" style="padding:0.25rem 0.5rem; width:auto;">+ Extra</button>
          </div>
          <div id="extras-list" style="display:flex; flex-direction:column; gap:0.5rem;"></div>
        </div>
      </form>
    `;
    
    Modal.show({
      title: isEdit ? '✏️ Editar Producto' : '➕ Nuevo Producto',
      content,
      footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
        <button class="btn btn-primary" style="width:auto" id="btn-save-product">${isEdit ? 'Guardar Cambios' : 'Crear Producto'}</button>
      `
    });
    
    const renderOptionRow = (container, name = '', price = '') => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.gap = '0.5rem';
      row.className = 'opt-row';
      row.innerHTML = `
        <input type="text" class="form-input opt-name" value="${name}" placeholder="Nombre" style="flex:2">
        <input type="number" class="form-input opt-price" value="${price}" step="0.01" min="0" placeholder="$" style="flex:1">
        <button type="button" class="btn-icon" onclick="this.parentElement.remove()" style="color:var(--text-secondary)">✕</button>
      `;
      document.getElementById(container).appendChild(row);
    };
    
    options.flavors.forEach(f => renderOptionRow('flavors-list', f.name, f.price));
    options.milks.forEach(m => renderOptionRow('milks-list', m.name, m.price));
    options.extras.forEach(e => renderOptionRow('extras-list', e.name, e.price));
    
    document.getElementById('btn-add-flavor').addEventListener('click', () => renderOptionRow('flavors-list'));
    document.getElementById('btn-add-milk').addEventListener('click', () => renderOptionRow('milks-list'));
    document.getElementById('btn-add-extra').addEventListener('click', () => renderOptionRow('extras-list'));
    
    document.getElementById('toggle-has-sizes').addEventListener('change', (e) => {
      const checked = e.target.checked;
      document.getElementById('sizes-group').style.display = checked ? 'flex' : 'none';
      const basePriceInp = document.getElementById('prod-price');
      basePriceInp.disabled = checked;
      document.getElementById('group-base-price').style.opacity = checked ? '0.5' : '1';
    });
    
    document.getElementById('btn-save-product').addEventListener('click', async () => {
      const name = document.getElementById('prod-name').value.trim();
      const desc = document.getElementById('prod-desc').value.trim();
      const hasSizes = document.getElementById('toggle-has-sizes').checked;
      let price = parseFloat(document.getElementById('prod-price').value);
      const catId = document.getElementById('prod-category').value || null;
      
      const sizeMediano = parseFloat(document.getElementById('prod-size-mediano').value) || 0;
      const sizeGrande = parseFloat(document.getElementById('prod-size-grande').value) || 0;
      
      if (!name) { Toast.error('Ingresa un nombre'); return; }
      if (!hasSizes && (isNaN(price) || price < 0)) { Toast.error('Ingresa un precio base numérico válido'); return; }
      
      if (hasSizes) price = sizeMediano; // Simbólico para el listado
      
      const newOptions = { hasSizes, sizeMediano, sizeGrande, milks: [], flavors: [], extras: [] };
      
      const readRows = (containerId, array) => {
        document.querySelectorAll(`#${containerId} .opt-row`).forEach(row => {
          const n = row.querySelector('.opt-name').value.trim();
          const p = parseFloat(row.querySelector('.opt-price').value);
          if (n && !isNaN(p)) array.push({ name: n, price: p });
        });
      };
      
      readRows('milks-list', newOptions.milks);
      readRows('flavors-list', newOptions.flavors);
      readRows('extras-list', newOptions.extras);
      
      const optionsJson = JSON.stringify(newOptions);
      
      try {
        if (isEdit) {
          await window.api.updateProduct(editId, { name, description: desc, price, category_id: catId, options: optionsJson });
          Toast.success('Producto actualizado');
        } else {
          const result = await window.api.createProduct(name, desc, price, catId, '', optionsJson);
          if (!result.success) { Toast.error(result.error); return; }
          Toast.success('Producto creado');
        }
        Modal.close();
        await this.refresh();
      } catch (err) {
        Toast.error('Error: ' + err.message);
      }
    });
  }
  
  static showCategoriesModal() {
    const content = `
      <div id="categories-list" style="margin-bottom:16px">
        ${this.categories.map(c => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:14px">${c.icon} ${c.name}</span>
            <div class="flex gap-sm">
              <button class="btn-icon btn-sm" data-edit-cat="${c.id}" data-cat-name="${c.name}" data-cat-icon="${c.icon}">✏️</button>
              <button class="btn-icon btn-sm" data-del-cat="${c.id}">🗑️</button>
            </div>
          </div>
        `).join('')}
      </div>
      <div style="border-top:1px solid var(--border);padding-top:16px">
        <h3 style="font-size:14px;margin-bottom:12px;color:var(--text-secondary)">Agregar categoría</h3>
        <div class="form-row">
          <div class="form-group">
            <input type="text" class="form-input" id="new-cat-name" placeholder="Nombre">
          </div>
          <div class="form-group" style="max-width:100px">
            <input type="text" class="form-input" id="new-cat-icon" placeholder="Emoji" maxlength="4" value="📦">
          </div>
        </div>
        <button class="btn btn-secondary" id="btn-add-category">➕ Agregar</button>
      </div>
    `;
    
    Modal.show({ title: '🏷️ Categorías', content, width: 480 });
    
    document.getElementById('btn-add-category').addEventListener('click', async () => {
      const name = document.getElementById('new-cat-name').value.trim();
      const icon = document.getElementById('new-cat-icon').value.trim() || '📦';
      if (!name) { Toast.error('Ingresa un nombre'); return; }
      const result = await window.api.createCategory(name, icon);
      if (result.success) {
        Toast.success('Categoría creada');
        this.categories = await window.api.getCategories();
        Modal.close();
        this.showCategoriesModal();
      } else {
        Toast.error(result.error);
      }
    });
    
    document.querySelectorAll('[data-del-cat]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await window.api.deleteCategory(parseInt(btn.dataset.delCat));
        Toast.success('Categoría eliminada');
        this.categories = await window.api.getCategories();
        Modal.close();
        this.showCategoriesModal();
      });
    });
    
    document.querySelectorAll('[data-edit-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.editCat);
        const oldName = btn.dataset.catName;
        const oldIcon = btn.dataset.catIcon;
        Modal.close();
        
        const editContent = `
          <div class="form-group">
            <label>Nombre</label>
            <input type="text" class="form-input" id="edit-cat-name" value="${oldName}">
          </div>
          <div class="form-group">
            <label>Icono (emoji)</label>
            <input type="text" class="form-input" id="edit-cat-icon" value="${oldIcon}" maxlength="4">
          </div>
        `;
        
        Modal.show({
          title: '✏️ Editar Categoría',
          content: editContent,
          footer: `
            <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
            <button class="btn btn-primary" style="width:auto" id="btn-save-cat">Guardar</button>
          `
        });
        
        document.getElementById('btn-save-cat').addEventListener('click', async () => {
          const name = document.getElementById('edit-cat-name').value.trim();
          const icon = document.getElementById('edit-cat-icon').value.trim();
          if (!name) { Toast.error('Ingresa un nombre'); return; }
          await window.api.updateCategory(id, name, icon);
          Toast.success('Categoría actualizada');
          this.categories = await window.api.getCategories();
          Modal.close();
        });
      });
    });
  }
}
