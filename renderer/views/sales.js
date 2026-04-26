// ==================== Sales View ====================
class SalesView {
  static async render() {
    const salesToday = await window.api.getSalesToday();
    const salesWeek = await window.api.getSalesWeek();
    
    const totalToday = salesToday.reduce((sum, s) => sum + s.total, 0);
    
    return `
      <div class="page">
        <div class="page-header">
          <div>
            <h1>💰 Ventas</h1>
            <p>Historial de ventas realizadas</p>
          </div>
          <div class="tab-switcher">
            <button class="tab-switch active" data-sales-period="today">Hoy</button>
            <button class="tab-switch" data-sales-period="week">Semana</button>
          </div>
        </div>
        
        <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:24px">
          <div class="stat-card accent-green">
            <div class="stat-icon">💵</div>
            <div class="stat-value">$${totalToday.toFixed(2)}</div>
            <div class="stat-label">Total hoy</div>
          </div>
          <div class="stat-card accent-orange">
            <div class="stat-icon">🧾</div>
            <div class="stat-value">${salesToday.length}</div>
            <div class="stat-label">Ventas hoy</div>
          </div>
          <div class="stat-card accent-purple">
            <div class="stat-icon">📊</div>
            <div class="stat-value">${salesToday.length > 0 ? '$' + (totalToday / salesToday.length).toFixed(2) : '$0.00'}</div>
            <div class="stat-label">Ticket promedio</div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h2 id="sales-table-title">Ventas de Hoy</h2>
          </div>
          <div style="overflow-x:auto">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Fecha / Hora</th>
                  <th>Atendió</th>
                  <th>Método</th>
                  <th class="text-right">Total</th>
                  <th class="text-center">Detalle</th>
                </tr>
              </thead>
              <tbody id="sales-table-body">
                ${this.renderSalesRows(salesToday)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
  
  static renderSalesRows(sales) {
    if (sales.length === 0) {
      return `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">No hay ventas en este período</td></tr>`;
    }
    return sales.map(s => {
      const date = new Date(s.date);
      return `
        <tr>
          <td><span class="badge badge-success">${s.ticket_number}</span></td>
          <td>${date.toLocaleDateString('es-MX')} ${date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</td>
          <td>${s.user_name || 'N/A'}</td>
          <td>${s.payment_method === 'efectivo' ? '💵' : s.payment_method === 'tarjeta' ? '💳' : '📱'} ${s.payment_method}</td>
          <td class="text-right" style="font-weight:700;color:var(--accent)">$${s.total.toFixed(2)}</td>
          <td class="text-center">
            <button class="btn-icon btn-sm" data-view-sale="${s.id}" title="Ver ticket">🧾</button>
          </td>
        </tr>
      `;
    }).join('');
  }
  
  static attachEvents() {
    // Period tabs
    document.querySelectorAll('[data-sales-period]').forEach(tab => {
      tab.addEventListener('click', async () => {
        document.querySelectorAll('.tab-switch').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const period = tab.dataset.salesPeriod;
        const sales = period === 'today' ? await window.api.getSalesToday() : await window.api.getSalesWeek();
        const title = document.getElementById('sales-table-title');
        title.textContent = period === 'today' ? 'Ventas de Hoy' : 'Ventas de la Semana';
        
        document.getElementById('sales-table-body').innerHTML = this.renderSalesRows(sales);
        this.attachViewButtons();
      });
    });
    
    this.attachViewButtons();
  }
  
  static attachViewButtons() {
    document.querySelectorAll('[data-view-sale]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const saleId = parseInt(btn.dataset.viewSale);
        const sale = await window.api.getSaleById(saleId);
        if (sale) {
          Ticket.showTicketModal(sale);
        }
      });
    });
  }
}
