import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { DataResponse, Order } from '../models/orders.models';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);

  getOrders(): Observable<Order[]> {
    return this.http.get<DataResponse>('/data.json').pipe(map(response => response.orders));
  }

  getProducts(): Observable<Order[]> {
    return this.http.get<DataResponse>('/data.json').pipe(map(response => response.orders));
  }

  getAllData(): Observable<DataResponse> {
    return this.http.get<DataResponse>('/data.json');
  }
}
