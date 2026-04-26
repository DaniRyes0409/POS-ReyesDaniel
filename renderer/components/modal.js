// ==================== Modal Component ====================
class Modal {
  static show({ title, content, footer, width, onClose }) {
    this.close(); // Close any existing modal
    
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';
    
    overlay.innerHTML = `
      <div class="modal" style="${width ? `max-width:${width}px` : ''}">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="modal-close" id="modal-close-btn">✕</button>
        </div>
        <div class="modal-body">${content}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    overlay.querySelector('#modal-close-btn').addEventListener('click', () => {
      if (onClose) onClose();
      this.close();
    });
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        if (onClose) onClose();
        this.close();
      }
    });
    
    return overlay;
  }
  
  static close() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
      overlay.remove();
    }
  }
  
  static confirm({ title, message, confirmText, cancelText, onConfirm, onCancel, danger }) {
    const content = `<p style="color:var(--text-secondary);font-size:14px;line-height:1.6">${message}</p>`;
    const footer = `
      <button class="btn btn-secondary" id="modal-cancel">${cancelText || 'Cancelar'}</button>
      <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" style="${danger ? '' : 'width:auto'}" id="modal-confirm">${confirmText || 'Confirmar'}</button>
    `;
    
    const overlay = this.show({ title, content, footer });
    
    overlay.querySelector('#modal-cancel').addEventListener('click', () => {
      if (onCancel) onCancel();
      this.close();
    });
    
    overlay.querySelector('#modal-confirm').addEventListener('click', () => {
      if (onConfirm) onConfirm();
      this.close();
    });
  }
}

// ==================== Toast Notifications ====================
class Toast {
  static container = null;
  
  static init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }
  
  static show(message, type = 'success', duration = 3000) {
    this.init();
    
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || '📢'}</span><span>${message}</span>`;
    
    this.container.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
  
  static success(message) { this.show(message, 'success'); }
  static error(message) { this.show(message, 'error'); }
  static info(message) { this.show(message, 'info'); }
}
