export interface Product {
  id: number;
  sku: string;
  title: string;
  price: number;
  stock: number;
  updatedAt: string;
}

export interface OrderItem {
  productId: number;
  qty: number;
  price: number;
}

export interface Order {
  id: number;
  number: string;
  customerName: string;
  status: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
}

export interface DataResponse {
  products: Product[];
  orders: Order[];
}

export enum StatusOrder {
  All = 'All',
  New = 'New',
  Processing = 'Processing',
}

export interface Tab {
  status: StatusOrder;
  value: string;
}

export interface OrderListQueryParams {
  _page: string;
  _limit: string;
  _sort: string;
  _order: string;
  status: string;
  q: string;
}
