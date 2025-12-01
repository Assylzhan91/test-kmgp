import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, delay } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { DataResponse, Order, Product } from '../models/orders.models';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private ordersCache: Order[] | null = null;
  private productsCache: Product[] | null = null;

  getOrders(): Observable<Order[]> {
    if (this.ordersCache) {
      return of(this.ordersCache);
    }
    return this.http.get<DataResponse>('/data.json').pipe(
      map(response => {
        this.ordersCache = response.orders;
        return response.orders;
      }),
    );
  }

  getOrderById(id: number): Observable<Order> {
    return this.getOrders().pipe(
      map(orders => {
        const order = orders.find(o => o.id === id);
        if (!order) {
          throw new Error('Order not found');
        }
        return order;
      }),
    );
  }

  getProducts(): Observable<Product[]> {
    if (this.productsCache) {
      return of(this.productsCache);
    }
    return this.http.get<DataResponse>('/data.json').pipe(
      map(response => {
        this.productsCache = response.products;
        return response.products;
      }),
    );
  }

  updateOrder(id: number, order: Order): Observable<Order> {
    return of(order).pipe(
      delay(1000),
      map(() => {
        //Обновляем кеш
        if (this.ordersCache) {
          const index = this.ordersCache.findIndex(o => o.id === id);
          if (index !== -1) {
            this.ordersCache[index] = order;
          }
        }
        return order;
      }),
    );
  }

  deleteOrder(id: number): Observable<void> {
    return of(void 0).pipe(
      delay(1000),
      map(() => {
        //Удаляем из кеша
        if (this.ordersCache) {
          this.ordersCache = this.ordersCache.filter(o => o.id !== id);
        }
      }),
    );
  }

  clearCache(): void {
    this.ordersCache = null;
    this.productsCache = null;
  }
}
