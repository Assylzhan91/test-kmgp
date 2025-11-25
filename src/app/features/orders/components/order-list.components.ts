import { AfterViewInit, Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { catchError, delay } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';

import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/orders.models';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  templateUrl: './order-list.components.html',
  imports: [
    MatProgressSpinner,
    MatPaginatorModule,
    MatFormFieldModule,
    MatTableModule,
    MatInputModule,
    MatSortModule,
    CommonModule,
  ],
  styleUrl: './order-list.components.scss',
})
export class OrderListComponents implements OnInit, AfterViewInit {
  private destroyRef = inject(DestroyRef);
  orderService = inject(OrderService);

  loading = true;
  totalOrders = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];

  displayedColumns: string[] = ['number', 'customerName', 'status', 'total', 'createdAt'];
  orders = new MatTableDataSource<Order>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  ngOnInit(): void {
    this.loadOrders();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.orders.paginator = this.paginator;
    }
  }

  private loadOrders(): void {
    this.orderService
      .getOrders()
      .pipe(
        delay(2000),
        catchError(() => of([])),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((orders: Order[]) => {
        this.orders.data = orders;
        this.totalOrders = orders.length;
        this.loading = false;
      });
  }
}
