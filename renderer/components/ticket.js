// ==================== Ticket Generator ====================
class Ticket {
  static generate(sale) {
    const date = new Date(sale.date || Date.now());
    const dateStr = date.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const timeStr = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    
    const itemsHtml = sale.items.map(item => `
      <div class="ticket-item-row">
        <span>${item.quantity}x ${item.product_name}</span>
        <span>$${(item.unit_price * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');
    
    return `
      <div class="ticket-preview" id="ticket-print">
        <div class="ticket-header">
          <h3>☕ Cafetería</h3>
          <p>Sistema de Gestión</p>
        </div>
        
        <div class="ticket-info">
          <p><strong>Ticket:</strong> ${sale.ticket_number}</p>
          <p><strong>Fecha:</strong> ${dateStr} ${timeStr}</p>
          <p><strong>Atendió:</strong> ${sale.user_name || 'N/A'}</p>
          ${sale.payment_method ? `<p><strong>Pago:</strong> ${sale.payment_method}</p>` : ''}
        </div>
        
        <div class="ticket-items">
          <div class="ticket-item-row" style="font-weight:700;margin-bottom:4px">
            <span>Producto</span>
            <span>Importe</span>
          </div>
          ${itemsHtml}
        </div>
        
        <div class="ticket-totals">
          <div class="ticket-total-row">
            <span>Subtotal:</span>
            <span>$${sale.subtotal.toFixed(2)}</span>
          </div>
          <div class="ticket-total-row grand">
            <span>TOTAL:</span>
            <span>$${sale.total.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="ticket-footer">
          <p>¡Gracias por su compra!</p>
          <p>Vuelva pronto 😊</p>
        </div>
      </div>
    `;
  }
  
  static showTicketModal(sale) {
    const ticketHtml = this.generate(sale);
    
    Modal.show({
      title: '🧾 Ticket de Venta',
      content: ticketHtml,
      footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cerrar</button>
        <button class="btn btn-primary" style="width:auto" id="btn-print-ticket">🖨️ Imprimir</button>
      `,
      width: 420
    });
    
    document.getElementById('btn-print-ticket').addEventListener('click', () => {
      Ticket.print();
    });
  }
  
  static print() {
    const ticketEl = document.getElementById('ticket-print');
    if (!ticketEl) return;
    
    const win = window.open('', '_blank', 'width=350,height=600');
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ticket</title>
        <style>
          body { font-family: 'Courier New', monospace; margin: 0; padding: 10px; }
          .ticket-header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 8px; margin-bottom: 8px; }
          .ticket-header h3 { font-size: 18px; margin: 0 0 4px; }
          .ticket-header p { font-size: 11px; color: #666; margin: 0; }
          .ticket-info { font-size: 11px; margin-bottom: 8px; }
          .ticket-info p { margin: 2px 0; }
          .ticket-items { border-top: 1px dashed #ccc; border-bottom: 1px dashed #ccc; padding: 6px 0; margin-bottom: 8px; }
          .ticket-item-row { display: flex; justify-content: space-between; font-size: 12px; padding: 2px 0; }
          .ticket-totals { border-bottom: 2px dashed #ccc; padding-bottom: 8px; margin-bottom: 8px; }
          .ticket-total-row { display: flex; justify-content: space-between; font-size: 12px; padding: 2px 0; }
          .ticket-total-row.grand { font-size: 16px; font-weight: 700; border-top: 1px solid #ccc; margin-top: 4px; padding-top: 6px; }
          .ticket-footer { text-align: center; font-size: 11px; color: #888; }
          .ticket-footer p { margin: 2px 0; }
          @media print { body { margin: 0; padding: 5px; } }
        </style>
      </head>
      <body>${ticketEl.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.print();
    setTimeout(() => win.close(), 1000);
  }
}
