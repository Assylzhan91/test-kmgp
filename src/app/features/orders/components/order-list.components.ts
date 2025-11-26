import { AfterViewInit, Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { catchError, delay } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';

import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/orders.models';

@Component({
  selector: 'kmgp-orders-list',
  standalone: true,
  templateUrl: './order-list.components.html',
  imports: [
    ReactiveFormsModule,
    MatProgressSpinner,
    MatPaginatorModule,
    MatFormFieldModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatInputModule,
    MatSortModule,
    MatTabsModule,
    MatIconModule,
    CommonModule,
  ],
  styleUrl: './order-list.components.scss',
})
export class OrderListComponent implements OnInit, AfterViewInit {
  private destroyRef = inject(DestroyRef);
  orderService = inject(OrderService);

  loading = true;
  totalOrders = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];

  displayedColumns: string[] = ['number', 'customerName', 'status', 'total', 'createdAt'];
  orders = new MatTableDataSource<Order>([]);
  allOrders: Order[] = [];

  selectedTab = 0;
  searchControl = new FormControl('');

  tabs = [
    { label: 'All', value: 'all' },
    { label: 'New', value: 'new' },
    { label: 'Processing', value: 'processing' },
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  ngOnInit(): void {
    this.loadOrders();
    this.subscribeToSearch();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.paginator) {
        this.orders.paginator = this.paginator;
      }
      if (this.sort) {
        this.orders.sort = this.sort;
      }
    });
  }

  private subscribeToSearch(): void {
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyFilters());
  }

  onTabChange(index: number): void {
    this.selectedTab = index;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filteredOrders = [...this.allOrders];

    const selectedTabValue = this.tabs[this.selectedTab].value;
    if (selectedTabValue !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === selectedTabValue);
    }

    const searchValue = this.searchControl.value;
    if (searchValue) {
      filteredOrders = filteredOrders.filter(order =>
        order.customerName.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }

    this.orders.data = filteredOrders;
    this.totalOrders = filteredOrders.length;

    if (this.paginator) {
      this.orders.paginator = this.paginator;
      this.paginator.firstPage();
    }

    if (this.sort) {
      this.orders.sort = this.sort;
    }
  }

  private loadOrders(): void {
    this.orderService
      .getOrders()
      .pipe(
        delay(1000),
        catchError(() => of([])),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((orders: Order[]) => {
        this.allOrders = orders;
        this.orders.data = orders;
        this.totalOrders = orders.length;
        this.loading = false;

        setTimeout(() => {
          if (this.paginator) {
            this.orders.paginator = this.paginator;
          }
          if (this.sort) {
            this.orders.sort = this.sort;
          }
        });
      });
  }
}
