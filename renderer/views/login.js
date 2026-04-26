// ==================== Login View ====================
class LoginView {
  static render() {
    return `
      <div class="login-container">
        <div class="login-bg"></div>
        <div class="login-card">
          <div class="login-header">
            <span class="login-icon">☕</span>
            <h1>Aroma Cafe</h1>
            <p>Ingresa tus credenciales para continuar</p>
          </div>
          
          <div class="login-error" id="login-error">
            <span id="login-error-text">Credenciales inválidas</span>
          </div>
          
          <form id="login-form">
            <div class="form-group">
              <label for="login-username">Usuario</label>
              <input type="text" id="login-username" class="form-input" placeholder="Ingresa tu usuario" autocomplete="off" required>
            </div>
            
            <div class="form-group">
              <label for="login-password">Contraseña</label>
              <input type="password" id="login-password" class="form-input" placeholder="Ingresa tu contraseña" required>
            </div>
            
            <button type="submit" class="btn btn-primary" id="login-btn">
              Iniciar Sesión
            </button>
          </form>
          
          <div class="login-footer">
            <p>v1.0 — Sistema de Gestión de Cafetería</p>
          </div>
        </div>
      </div>
    `;
  }
  
  static attachEvents(onLogin) {
    const form = document.getElementById('login-form');
    const errorDiv = document.getElementById('login-error');
    const errorText = document.getElementById('login-error-text');
    const btn = document.getElementById('login-btn');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      
      if (!username || !password) {
        errorText.textContent = 'Por favor completa todos los campos';
        errorDiv.classList.add('visible');
        return;
      }
      
      btn.textContent = 'Verificando...';
      btn.disabled = true;
      
      try {
        const user = await window.api.login(username, password);
        
        if (user) {
          errorDiv.classList.remove('visible');
          onLogin(user);
        } else {
          errorText.textContent = 'Usuario o contraseña incorrectos';
          errorDiv.classList.add('visible');
          btn.textContent = 'Iniciar Sesión';
          btn.disabled = false;
          // Shake animation
          errorDiv.style.animation = 'none';
          setTimeout(() => errorDiv.style.animation = 'shake 0.4s ease', 10);
        }
      } catch (err) {
        errorText.textContent = 'Error de conexión';
        errorDiv.classList.add('visible');
        btn.textContent = 'Iniciar Sesión';
        btn.disabled = false;
      }
    });
    
    // Focus first input
    setTimeout(() => document.getElementById('login-username').focus(), 300);
  }
}
