import type { Order } from './order';

export interface Invoice {
  id: number | string;
  invoiceNumber: string;
  orderId: number | string;
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
  order: Order;
}

export interface InvoiceResponse {
  success: boolean;
  message: string;
  data: Invoice;
}
