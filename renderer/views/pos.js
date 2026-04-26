// ==================== POS View (Point of Sale) ====================
class PosView {
  static cart = [];
  static products = [];
  static categories = [];
  
  static async render() {
    this.cart = [];
    this.products = await window.api.getProducts();
    this.categories = await window.api.getCategories();
    
    return `
      <div class="pos-layout">
        <div class="pos-catalog">
          <div class="page-header">
            <div>
              <h1>Punto de Venta</h1>
              <p>Selecciona productos para agregar al pedido</p>
            </div>
          </div>
          
          <div class="category-tabs" id="category-tabs">
            <button class="category-tab active" data-cat="all">🏷️ Todos</button>
            ${this.categories.map(cat => `
              <button class="category-tab" data-cat="${cat.id}">${cat.icon} ${cat.name}</button>
            `).join('')}
          </div>
          
          <div class="products-grid" id="pos-products">
            ${this.renderProducts(this.products)}
          </div>
        </div>
        
        <div class="pos-cart">
          <div class="cart-header">
            <h2>🛒 Pedido <span class="cart-badge" id="cart-count">0</span></h2>
          </div>
          
          <div class="cart-items" id="cart-items">
            <div class="cart-empty">
              <span class="cart-empty-icon">🛒</span>
              <span>Agrega productos al pedido</span>
            </div>
          </div>
          
          <div class="cart-footer">
            <div class="cart-total-row">
              <span class="cart-total-label">Subtotal</span>
              <span class="cart-total-value" id="cart-subtotal">$0.00</span>
            </div>
            <div class="cart-total-row grand-total">
              <span class="cart-total-label">Total</span>
              <span class="cart-total-value" id="cart-total">$0.00</span>
            </div>
            <button class="btn-checkout" id="btn-checkout" disabled>
              💳 Cobrar
            </button>
          </div>
        </div>
      </div>
    `;
  }
  
  static renderProducts(products) {
    if (products.length === 0) {
      return `<div class="empty-state"><span class="empty-state-icon">📦</span><h3>Sin productos</h3><p>No hay productos en esta categoría</p></div>`;
    }
    return products.map(p => `
      <div class="product-card" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}">
        <span class="product-card-emoji">${p.category_icon || '📦'}</span>
        <span class="product-card-name">${p.name}</span>
        <span class="product-card-desc">${p.description || ''}</span>
        <span class="product-card-price">$${p.price.toFixed(2)}</span>
      </div>
    `).join('');
  }
  
  static attachEvents(user) {
    // Category filter
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const catId = tab.dataset.cat;
        const filtered = catId === 'all' 
          ? this.products 
          : this.products.filter(p => p.category_id == catId);
        
        const grid = document.getElementById('pos-products');
        grid.innerHTML = this.renderProducts(filtered);
        this.attachProductClicks();
      });
    });
    
    this.attachProductClicks();
    
    // Checkout
    document.getElementById('btn-checkout').addEventListener('click', () => {
      this.showCheckoutModal(user);
    });
  }
  
  static attachProductClicks() {
    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id);
        const name = card.dataset.name;
        const price = parseFloat(card.dataset.price);
        
        const product = this.products.find(p => p.id === id);
        let hasOptions = false;
        let opts = { hasSizes: false, sizeMediano: 0, sizeGrande: 0, milks: [], flavors: [], extras: [] };
        
        if (product && product.options) {
          try {
            const parsed = JSON.parse(product.options);
            opts = { ...opts, ...parsed };
            if (opts.hasSizes || opts.milks.length > 0 || opts.flavors.length > 0 || opts.extras.length > 0) hasOptions = true;
          } catch {}
        }
        
        if (hasOptions) {
          this.showProductOptionsModal(product, opts);
        } else {
          this.addToCart(id, name, price, {});
        }
      });
    });
  }
  
  static showProductOptionsModal(product, opts) {
    const defaultPrice = product.price;
    const hasSizes = opts.hasSizes;
    const hasMilks = opts.milks && opts.milks.length > 0;
    const hasFlavors = opts.flavors && opts.flavors.length > 0;
    const hasExtras = opts.extras && opts.extras.length > 0;
    
    let content = '<form id="options-form" style="max-height: 400px; overflow-y: auto; overflow-x: hidden; padding-right: 5px;">';
    
    if (hasSizes) {
      content += `<h4 style="margin-bottom:0.5rem">Tamaño</h4><div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1rem;">`;
      content += `<label style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem;border:1px solid var(--border);border-radius:4px;cursor:pointer;">
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <input type="radio" name="prod-size" value="Mediano" data-price="${opts.sizeMediano}" checked>
          <span>Mediano</span>
        </div>
        <span>$${opts.sizeMediano.toFixed(2)}</span>
      </label>`;
      content += `<label style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem;border:1px solid var(--border);border-radius:4px;cursor:pointer;">
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <input type="radio" name="prod-size" value="Grande" data-price="${opts.sizeGrande}">
          <span>Grande</span>
        </div>
        <span>$${opts.sizeGrande.toFixed(2)}</span>
      </label>`;
      content += `</div>`;
    }
    
    if (hasFlavors) {
      content += `<h4 style="margin-bottom:0.5rem">Sabores</h4><div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1rem;">`;
      opts.flavors.forEach(f => {
        content += `<label style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem;border:1px solid var(--border);border-radius:4px;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <input type="checkbox" name="prod-flavor" value="${f.name}" data-price="${f.price}">
            <span>${f.name}</span>
          </div>
          <span>+$${f.price.toFixed(2)}</span>
        </label>`;
      });
      content += `</div>`;
    }

    if (hasMilks) {
      content += `<h4 style="margin-bottom:0.5rem">Tipo de Leche</h4><div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1rem;">`;
      opts.milks.forEach(m => {
        content += `<label style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem;border:1px solid var(--border);border-radius:4px;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <input type="checkbox" name="prod-milk" value="${m.name}" data-price="${m.price}">
            <span>${m.name}</span>
          </div>
          <span>+$${m.price.toFixed(2)}</span>
        </label>`;
      });
      content += `</div>`;
    }
    
    if (hasExtras) {
      content += `<h4 style="margin-bottom:0.5rem">Extras Generales</h4><div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1rem;">`;
      opts.extras.forEach((e) => {
        content += `<label style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem;border:1px solid var(--border);border-radius:4px;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <input type="checkbox" name="prod-extra" value="${e.name}" data-price="${e.price}">
            <span>${e.name}</span>
          </div>
          <span>+$${e.price.toFixed(2)}</span>
        </label>`;
      });
      content += `</div>`;
    }
    content += '</form>';
    
    Modal.show({
      title: 'Ajustes: ' + product.name,
      content,
      footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
        <button class="btn btn-primary" style="width:auto" id="btn-confirm-options">Confirmar Pedido</button>
      `
    });
    
    document.getElementById('btn-confirm-options').addEventListener('click', () => {
      let finalPrice = defaultPrice;
      let finalName = product.name;
      
      if (hasSizes) {
        const checkedSize = document.querySelector('input[name="prod-size"]:checked');
        if (checkedSize) {
           finalPrice = parseFloat(checkedSize.dataset.price);
           finalName += ` (${checkedSize.value})`;
        }
      }
      
      const modifiers = { flavors: [], milks: [], extras: [] };
      const accumulate = (selector, type) => {
        document.querySelectorAll(selector).forEach(cb => {
          finalPrice += parseFloat(cb.dataset.price);
          modifiers[type].push(cb.value);
        });
      };
      
      accumulate('input[name="prod-flavor"]:checked', 'flavors');
      accumulate('input[name="prod-milk"]:checked', 'milks');
      accumulate('input[name="prod-extra"]:checked', 'extras');
      
      const allModNames = [...modifiers.flavors, ...modifiers.milks, ...modifiers.extras];
      if (allModNames.length > 0) {
        finalName += ` +${allModNames.join(', ')}`;
      }
      
      Modal.close();
      this.addToCart(product.id, finalName, finalPrice, modifiers);
    });
  }
  
  static addToCart(productId, name, price, modifiers = {}) {
    const modsKey = JSON.stringify(modifiers);
    const existing = this.cart.find(item => item.product_id === productId && item.product_name === name && JSON.stringify(item.modifiers || {}) === modsKey);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({
        product_id: productId,
        product_name: name,
        unit_price: price,
        quantity: 1,
        modifiers: modifiers
      });
    }
    this.updateCartUI();
  }
  
  static updateCartUI() {
    const itemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('btn-checkout');
    
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (this.cart.length === 0) {
      itemsContainer.innerHTML = `
        <div class="cart-empty">
          <span class="cart-empty-icon">🛒</span>
          <span>Agrega productos al pedido</span>
        </div>
      `;
      subtotalEl.textContent = '$0.00';
      totalEl.textContent = '$0.00';
      checkoutBtn.disabled = true;
      return;
    }
    
    checkoutBtn.disabled = false;
    
    itemsContainer.innerHTML = this.cart.map((item, index) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.product_name}</div>
          <div class="cart-item-price">$${item.unit_price.toFixed(2)} c/u</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" data-action="decrease" data-index="${index}">−</button>
          <span class="cart-item-qty">${item.quantity}</span>
          <button class="qty-btn" data-action="increase" data-index="${index}">+</button>
        </div>
        <span class="cart-item-subtotal">$${(item.unit_price * item.quantity).toFixed(2)}</span>
        <button class="cart-item-remove" data-action="remove" data-index="${index}">✕</button>
      </div>
    `).join('');
    
    const subtotal = this.cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    totalEl.textContent = `$${subtotal.toFixed(2)}`;
    
    // Attach quantity controls
    itemsContainer.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        const action = btn.dataset.action;
        
        if (action === 'increase') {
          this.cart[index].quantity++;
        } else if (action === 'decrease') {
          if (this.cart[index].quantity > 1) this.cart[index].quantity--;
          else this.cart.splice(index, 1);
        } else if (action === 'remove') {
          this.cart.splice(index, 1);
        }
        
        this.updateCartUI();
      });
    });
  }
  
  static showCheckoutModal(user) {
    const subtotal = this.cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    
    const content = `
      <div style="margin-bottom:20px">
        <h3 style="font-size:14px;color:var(--text-secondary);margin-bottom:12px">Resumen del pedido</h3>
        ${this.cart.map(item => `
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;border-bottom:1px solid var(--border)">
            <span>${item.quantity}x ${item.product_name}</span>
            <span style="font-weight:600">$${(item.unit_price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
        <div style="display:flex;justify-content:space-between;padding:12px 0;font-size:18px;font-weight:800;color:var(--accent)">
          <span>Total</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
      </div>
      <div class="form-group">
        <label for="payment-method">Método de Pago</label>
        <select id="payment-method" class="form-select">
          <option value="efectivo">💵 Efectivo</option>
          <option value="tarjeta">💳 Tarjeta</option>
          <option value="transferencia">📱 Transferencia</option>
        </select>
      </div>
      
      <div id="cash-calculator-group" class="form-group" style="padding:10px; background:var(--bg-lighter); border-radius:8px; border:1px solid var(--border); display:block;">
        <label>Efectivo Recibido ($)</label>
        <input type="number" id="cash-received" class="form-input" placeholder="Monto entregado por cliente" step="0.5" min="${subtotal}">
        <div style="display:flex; justify-content:space-between; margin-top:10px; font-weight:bold; font-size:16px;">
          <span>Cambio a entregar:</span>
          <span id="cash-change" style="color:var(--success)">$0.00</span>
        </div>
      </div>
      
      <div class="form-group">
        <label for="sale-notes">Notas (opcional)</label>
        <input type="text" id="sale-notes" class="form-input" placeholder="Notas adicionales...">
      </div>
    `;
    
    Modal.show({
      title: '💳 Cobrar Pedido',
      content,
      footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
        <button class="btn btn-primary" style="width:auto" id="btn-confirm-sale">✅ Confirmar Venta</button>
      `,
      width: 480
    });
    
    // Change calculator logic
    const updateChange = () => {
      const received = parseFloat(document.getElementById('cash-received').value) || 0;
      let change = received - subtotal;
      if (change < 0) change = 0;
      document.getElementById('cash-change').textContent = `$${change.toFixed(2)}`;
    };
    
    document.getElementById('cash-received').addEventListener('input', updateChange);
    
    document.getElementById('payment-method').addEventListener('change', (e) => {
       document.getElementById('cash-calculator-group').style.display = e.target.value === 'efectivo' ? 'block' : 'none';
    });
    
    document.getElementById('btn-confirm-sale').addEventListener('click', async () => {
      const paymentMethod = document.getElementById('payment-method').value;
      const notes = document.getElementById('sale-notes').value;
      const receivedTxt = document.getElementById('cash-received').value;
      
      if (paymentMethod === 'efectivo') {
        const received = parseFloat(receivedTxt);
        if (isNaN(received) || received < subtotal) {
          Toast.error('El monto recibido debe ser mayor o igual al total');
          return;
        }
      }
      
      try {
        const result = await window.api.createSale(this.cart, user.id, paymentMethod, notes);
        
        if (result.success) {
          Modal.close();
          Toast.success(`Venta registrada — Ticket: ${result.ticket_number}`);
          
          // Show ticket
          const sale = await window.api.getSaleById(result.sale_id);
          if (sale) {
            setTimeout(() => Ticket.showTicketModal(sale), 400);
          }
          
          // Clear cart
          this.cart = [];
          this.updateCartUI();
        } else {
          Toast.error('Error al registrar la venta');
        }
      } catch (err) {
        Toast.error('Error: ' + err.message);
      }
    });
  }
}
