import API from "../../app/axios";

const invoiceAPI = {
  // Get dashboard summary statistics
  getBillingStats: () => 
    API.get("/invoices/stats"),

  // Create an invoice for a specific Order
  createInvoice: (orderId, data) => 
    API.post(`/invoices/create/${orderId}`, data),

  // Retrieve an invoice linked to an Order
  getInvoiceByOrderId: (orderId) => 
    API.get(`/invoices/order/${orderId}`),

  // Retrieve a single invoice by ID
  getInvoice: (id) => 
    API.get(`/invoices/${id}`),

  // Record an installment or final payment against an invoice balance
  collectPayment: (id, data) => 
    API.post(`/invoices/${id}/payments`, data),

  // Cancel an active invoice
  cancelInvoice: (id) => 
    API.post(`/invoices/${id}/cancel`),

  // Retrieve a list of all invoices with search/filter params
  getInvoices: (params) => 
    API.get("/invoices", { params }),

  // Soft delete an invoice
  deleteInvoice: (id) => 
    API.delete(`/invoices/${id}`)
};

export default invoiceAPI;
