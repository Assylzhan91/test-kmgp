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
