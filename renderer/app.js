// ==================== Main Application Controller ====================
class App {
  static currentUser = null;
  static currentView = null;
  
  static init() {
    // Title bar controls
    document.getElementById('btn-minimize').addEventListener('click', () => window.api.minimize());
    document.getElementById('btn-maximize').addEventListener('click', () => window.api.maximize());
    document.getElementById('btn-close').addEventListener('click', () => window.api.close());
    
    // Show login
    this.showLogin();
  }
  
  static showLogin() {
    this.currentUser = null;
    this.currentView = null;
    const app = document.getElementById('app');
    app.innerHTML = LoginView.render();
    LoginView.attachEvents((user) => this.onLogin(user));
  }
  
  static onLogin(user) {
    this.currentUser = user;
    try {
      this.currentUser.permissions = JSON.parse(user.permissions || '[]');
    } catch {
      this.currentUser.permissions = [];
    }
    
    // Determine default view based on role
    const defaultView = user.role === 'admin' ? 'dashboard' : 'pos';
    this.showMainLayout(defaultView);
  }
  
  static showMainLayout(viewName) {
    const app = document.getElementById('app');
    
    app.innerHTML = `
      ${Sidebar.render(this.currentUser, viewName)}
      <div class="main-content" id="main-content">
        <div class="loading-container">
          <div class="spinner"></div>
          <span>Cargando...</span>
        </div>
      </div>
    `;
    
    Sidebar.attachEvents(
      (view) => this.navigateTo(view),
      () => this.showLogin()
    );
    
    this.navigateTo(viewName);
  }
  
  static async navigateTo(viewName) {
    this.currentView = viewName;
    const content = document.getElementById('main-content');
    
    // Show loading
    content.innerHTML = `<div class="loading-container"><div class="spinner"></div><span>Cargando...</span></div>`;
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-link[data-view]').forEach(link => {
      link.classList.toggle('active', link.dataset.view === viewName);
    });
    
    try {
      let html = '';
      
      switch (viewName) {
        case 'pos':
          html = await PosView.render();
          content.innerHTML = html;
          PosView.attachEvents(this.currentUser);
          break;
          
        case 'dashboard':
          html = await DashboardView.render();
          content.innerHTML = html;
          DashboardView.attachEvents();
          break;
          
        case 'products':
          html = await ProductsView.render();
          content.innerHTML = html;
          ProductsView.attachEvents();
          break;
          
        case 'expenses':
          html = await ExpensesView.render();
          content.innerHTML = html;
          ExpensesView.attachEvents(this.currentUser);
          break;
          
        case 'sales':
          html = await SalesView.render();
          content.innerHTML = html;
          SalesView.attachEvents();
          break;
          
        case 'users':
          html = await UsersView.render();
          content.innerHTML = html;
          UsersView.attachEvents();
          break;
          
        default:
          content.innerHTML = '<div class="page"><h1>Vista no encontrada</h1></div>';
      }
    } catch (err) {
      content.innerHTML = `
        <div class="page">
          <div class="empty-state">
            <span class="empty-state-icon">⚠️</span>
            <h3>Error al cargar</h3>
            <p>${err.message}</p>
          </div>
        </div>
      `;
      console.error('Navigation error:', err);
    }
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
