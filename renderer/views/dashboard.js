// ==================== Dashboard View ====================
class DashboardView {
  static async render() {
    const daily = await window.api.getDailySummary();
    const weekly = await window.api.getWeeklySummary();
    
    return `
      <div class="page">
        <div class="page-header">
          <div>
            <h1>📊 Dashboard</h1>
            <p>Resumen general de la cafetería</p>
          </div>
          <div class="tab-switcher">
            <button class="tab-switch active" data-period="daily">Hoy</button>
            <button class="tab-switch" data-period="weekly">Semana</button>
          </div>
        </div>
        
        <!-- Daily Stats -->
        <div id="stats-daily">
          <div class="stats-grid">
            <div class="stat-card accent-green">
              <div class="stat-icon">💰</div>
              <div class="stat-value">$${daily.total_income.toFixed(2)}</div>
              <div class="stat-label">Ingresos del día</div>
            </div>
            <div class="stat-card accent-pink">
              <div class="stat-icon">📉</div>
              <div class="stat-value">$${daily.total_expenses.toFixed(2)}</div>
              <div class="stat-label">Gastos del día</div>
            </div>
            <div class="stat-card accent-purple">
              <div class="stat-icon">📊</div>
              <div class="stat-value">$${daily.net_profit.toFixed(2)}</div>
              <div class="stat-label">Ganancia neta</div>
            </div>
            <div class="stat-card accent-orange">
              <div class="stat-icon">🧾</div>
              <div class="stat-value">${daily.sales_count}</div>
              <div class="stat-label">Ventas realizadas</div>
            </div>
          </div>
          
          ${daily.top_products.length > 0 ? `
          <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
            <div class="card">
              <div class="card-header">
                <h2>🏆 Productos más vendidos hoy</h2>
              </div>
              <div class="card-body">
                <div class="chart-bar-container">
                  ${daily.top_products.map((p, i) => {
                    const maxQty = daily.top_products[0].total_qty;
                    const pct = (p.total_qty / maxQty) * 100;
                    return `
                      <div class="chart-bar-row">
                        <span class="chart-bar-label">${i + 1}. ${p.product_name}</span>
                        <div class="chart-bar-track">
                          <div class="chart-bar-fill" style="width:${pct}%"></div>
                        </div>
                        <span class="chart-bar-value">${p.total_qty} uds</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            ${daily.top_flavors && daily.top_flavors.length > 0 ? `
            <div class="card">
              <div class="card-header">
                <h2>🍦 Sabores más pedidos</h2>
              </div>
              <div class="card-body">
                <div class="chart-bar-container">
                  ${daily.top_flavors.map((f, i) => {
                    const maxQty = daily.top_flavors[0].count;
                    const pct = (f.count / maxQty) * 100;
                    return `
                      <div class="chart-bar-row">
                        <span class="chart-bar-label">${i + 1}. ${f.name}</span>
                        <div class="chart-bar-track">
                          <div class="chart-bar-fill" style="width:${pct}%;background:linear-gradient(90deg, #ff9a9e, #fecfef)"></div>
                        </div>
                        <span class="chart-bar-value">${f.count} uds</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
            ` : ''}

            ${daily.top_milks && daily.top_milks.length > 0 ? `
            <div class="card">
              <div class="card-header">
                <h2>🥛 Tipos de leche (Top)</h2>
              </div>
              <div class="card-body">
                <div class="chart-bar-container">
                  ${daily.top_milks.map((m, i) => {
                    const maxQty = daily.top_milks[0].count;
                    const pct = (m.count / maxQty) * 100;
                    return `
                      <div class="chart-bar-row">
                        <span class="chart-bar-label">${i + 1}. ${m.name}</span>
                        <div class="chart-bar-track">
                          <div class="chart-bar-fill" style="width:${pct}%;background:linear-gradient(90deg, #a1c4fd, #c2e9fb)"></div>
                        </div>
                        <span class="chart-bar-value">${m.count} uds</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
            ` : ''}
          </div>
          ` : `
          <div class="card">
            <div class="card-body">
              <div class="empty-state">
                <span class="empty-state-icon">📊</span>
                <h3>Sin ventas hoy</h3>
                <p>Aún no se han registrado ventas el día de hoy</p>
              </div>
            </div>
          </div>
          `}
        </div>
        
        <!-- Weekly Stats (hidden by default) -->
        <div id="stats-weekly" style="display:none">
          <div class="stats-grid">
            <div class="stat-card accent-green">
              <div class="stat-icon">💰</div>
              <div class="stat-value">$${weekly.total_income.toFixed(2)}</div>
              <div class="stat-label">Ingresos de la semana</div>
            </div>
            <div class="stat-card accent-pink">
              <div class="stat-icon">📉</div>
              <div class="stat-value">$${weekly.total_expenses.toFixed(2)}</div>
              <div class="stat-label">Gastos de la semana</div>
            </div>
            <div class="stat-card accent-purple">
              <div class="stat-icon">📊</div>
              <div class="stat-value">$${weekly.net_profit.toFixed(2)}</div>
              <div class="stat-label">Ganancia neta</div>
            </div>
            <div class="stat-card accent-orange">
              <div class="stat-icon">🧾</div>
              <div class="stat-value">${weekly.sales_count}</div>
              <div class="stat-label">Ventas totales</div>
            </div>
          </div>
          
          ${weekly.daily_breakdown.length > 0 ? `
          <div class="dashboard-grid">
            <div class="card">
              <div class="card-header">
                <h2>📅 Ventas por día</h2>
              </div>
              <div class="card-body">
                <div class="chart-bar-container">
                  ${weekly.daily_breakdown.map(d => {
                    const maxTotal = Math.max(...weekly.daily_breakdown.map(x => x.total));
                    const pct = maxTotal > 0 ? (d.total / maxTotal) * 100 : 0;
                    const dayName = new Date(d.day + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' });
                    return `
                      <div class="chart-bar-row">
                        <span class="chart-bar-label">${dayName}</span>
                        <div class="chart-bar-track">
                          <div class="chart-bar-fill" style="width:${pct}%"></div>
                        </div>
                        <span class="chart-bar-value">$${d.total.toFixed(0)}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
            
            <div class="card">
              <div class="card-header">
                <h2>🏆 Top Productos</h2>
              </div>
              <div class="card-body">
                <div class="chart-bar-container">
                  ${weekly.top_products.slice(0, 5).map((p, i) => {
                    const maxQty = weekly.top_products[0].total_qty;
                    const pct = (p.total_qty / maxQty) * 100;
                    return `
                      <div class="chart-bar-row">
                        <span class="chart-bar-label">${i + 1}. ${p.product_name}</span>
                        <div class="chart-bar-track">
                          <div class="chart-bar-fill" style="width:${pct}%;background:linear-gradient(90deg,var(--accent2),var(--accent2-light))"></div>
                        </div>
                        <span class="chart-bar-value">${p.total_qty} uds</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            ${weekly.top_flavors && weekly.top_flavors.length > 0 ? `
            <div class="card">
              <div class="card-header">
                <h2>🍦 Sabores más pedidos</h2>
              </div>
              <div class="card-body">
                <div class="chart-bar-container">
                  ${weekly.top_flavors.map((f, i) => {
                    const maxQty = weekly.top_flavors[0].count;
                    const pct = (f.count / maxQty) * 100;
                    return `
                      <div class="chart-bar-row">
                        <span class="chart-bar-label">${i + 1}. ${f.name}</span>
                        <div class="chart-bar-track">
                          <div class="chart-bar-fill" style="width:${pct}%;background:linear-gradient(90deg, #ff9a9e, #fecfef)"></div>
                        </div>
                        <span class="chart-bar-value">${f.count} uds</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
            ` : ''}

            ${weekly.top_milks && weekly.top_milks.length > 0 ? `
            <div class="card">
              <div class="card-header">
                <h2>🥛 Tipos de leche (Top)</h2>
              </div>
              <div class="card-body">
                <div class="chart-bar-container">
                  ${weekly.top_milks.map((m, i) => {
                    const maxQty = weekly.top_milks[0].count;
                    const pct = (m.count / maxQty) * 100;
                    return `
                      <div class="chart-bar-row">
                        <span class="chart-bar-label">${i + 1}. ${m.name}</span>
                        <div class="chart-bar-track">
                          <div class="chart-bar-fill" style="width:${pct}%;background:linear-gradient(90deg, #a1c4fd, #c2e9fb)"></div>
                        </div>
                        <span class="chart-bar-value">${m.count} uds</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
            ` : ''}
          </div>
          ` : `
          <div class="card">
            <div class="card-body">
              <div class="empty-state">
                <span class="empty-state-icon">📊</span>
                <h3>Sin datos</h3>
                <p>No hay ventas registradas esta semana</p>
              </div>
            </div>
          </div>
          `}
        </div>
      </div>
    `;
  }
  
  static attachEvents() {
    document.querySelectorAll('.tab-switch').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-switch').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const period = tab.dataset.period;
        document.getElementById('stats-daily').style.display = period === 'daily' ? 'block' : 'none';
        document.getElementById('stats-weekly').style.display = period === 'weekly' ? 'block' : 'none';
      });
    });
  }
}
