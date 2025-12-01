import { AfterViewInit, Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
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
import { ActivatedRoute, Params, Router } from '@angular/router';

import { OrderService } from '../../../core/services/order.service';
import { Order, OrderListQueryParams } from '../../../core/models/orders.models';
import { AuthService } from '../../../core/services/auth.service';

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
  private readonly destroyRef = inject(DestroyRef);
  private readonly orderService = inject(OrderService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly authService = inject(AuthService);

  loading = true;
  totalOrders = 0;
  pageSize = 5;
  pageSizeOptions = [5, 10, 25, 50];

  currentPage = 1;
  currentSort = 'createdAt';
  currentOrder = 'desc';
  currentStatus = 'All';
  currentSearch = '';

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
    this.loading = true;

    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params: OrderListQueryParams | Params) => {
        this.currentPage = Number(params['_page']) || 1;
        this.pageSize = Number(params['_limit']) || 5;
        this.currentSort = params['_sort'] || 'createdAt';
        this.currentOrder = params['_order'] || 'desc';
        this.currentStatus = params['status'] || 'all';
        this.currentSearch = params['q'] || '';

        this.searchControl.setValue(this.currentSearch, { emitEvent: false });

        const tabIndex = this.tabs.findIndex(tab => tab.value === this.currentStatus);
        if (tabIndex !== -1) {
          this.selectedTab = tabIndex;
        }
        this.loadOrders();
      });

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
      .subscribe(searchValue => {
        this.currentSearch = searchValue || '';
        this.currentPage = 1;
        this.updateQueryParams();
        this.applyFilters();
      });
  }

  onTabChange(index: number): void {
    this.selectedTab = index;
    this.currentStatus = this.tabs[index].value;
    this.currentPage = 1;
    this.updateQueryParams();
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
          this.applyFilters();
        });
      });
  }
  handlePageEvent(e: PageEvent): void {
    this.currentPage = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.updateQueryParams();
    this.applyFilters();
  }

  private updateQueryParams(): void {
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: {
          _page: this.currentPage,
          _limit: this.pageSize,
          _sort: this.currentSort,
          _order: this.currentOrder,
          status: this.currentStatus,
          q: this.currentSearch,
        },
        queryParamsHandling: 'merge',
      })
      .then();
  }
}
