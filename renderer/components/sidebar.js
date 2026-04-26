// ==================== Sidebar Component ====================
class Sidebar {
  static render(user, activeView) {
    const isAdmin = user.role === 'admin';
    
    const adminLinks = [
      { id: 'dashboard', icon: '📊', label: 'Dashboard' },
      { id: 'pos', icon: '🛒', label: 'Punto de Venta' },
      { id: 'sales', icon: '💰', label: 'Ventas' },
      { id: 'products', icon: '📦', label: 'Productos' },
      { id: 'expenses', icon: '📋', label: 'Gastos' },
      { id: 'users', icon: '👥', label: 'Usuarios' }
    ];
    
    let links = adminLinks;
    if (!isAdmin) {
      links = adminLinks.filter(l => l.id === 'pos' || (user.permissions && user.permissions.includes(l.id)));
    }
    const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    
    return `
      <div class="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-user">
            <div class="sidebar-avatar">${initials}</div>
            <div class="sidebar-user-info">
              <h3>${user.name}</h3>
              <span>${isAdmin ? '👑 Administrador' : '👤 Empleado'}</span>
            </div>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <div class="sidebar-section">
            <div class="sidebar-section-title">${isAdmin ? 'Administración' : 'Operaciones'}</div>
            ${links.map(link => `
              <a class="sidebar-link ${activeView === link.id ? 'active' : ''}" data-view="${link.id}">
                <span class="sidebar-link-icon">${link.icon}</span>
                <span>${link.label}</span>
              </a>
            `).join('')}
          </div>
        </nav>
        
        <div class="sidebar-footer">
          <a class="sidebar-link logout" id="btn-logout">
            <span class="sidebar-link-icon">🚪</span>
            <span>Cerrar Sesión</span>
          </a>
        </div>
      </div>
    `;
  }
  
  static attachEvents(onNavigate, onLogout) {
    document.querySelectorAll('.sidebar-link[data-view]').forEach(link => {
      link.addEventListener('click', () => {
        const view = link.dataset.view;
        // Update active state
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        onNavigate(view);
      });
    });
    
    document.getElementById('btn-logout').addEventListener('click', () => {
      Modal.confirm({
        title: 'Cerrar Sesión',
        message: '¿Estás seguro que deseas cerrar sesión?',
        confirmText: 'Salir',
        cancelText: 'Cancelar',
        onConfirm: onLogout
      });
    });
  }
}
