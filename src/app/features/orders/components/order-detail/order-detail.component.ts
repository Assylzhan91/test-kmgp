import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { OrderService } from '../../../../core/services/order.service';
import { Order, OrderItem, Product } from '../../../../core/models/orders.models';

@Component({
  selector: 'kmgp-order-detail',
  standalone: true,
  imports: [
    MatProgressSpinner,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
})
export class OrderDetailComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  orderForm!: FormGroup;
  loading = true;
  saving = false;
  orderId: number | null = null;
  availableProducts: Product[] = [];
  displayedColumns = ['product', 'quantity', 'price', 'subtotal', 'actions'];
  itemsDataSource = new MatTableDataSource<unknown>([]);

  private originalOrderData: Order | null = null;

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.orderId = +params['id'];
      this.loadOrder();
    });
    this.loadProducts();
  }

  private loadProducts(): void {
    this.orderService
      .getProducts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(products => {
        this.availableProducts = products;
      });
  }

  private loadOrder(): void {
    if (!this.orderId) return;

    this.orderService
      .getOrderById(this.orderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: order => {
          this.originalOrderData = JSON.parse(JSON.stringify(order));
          this.initForm(order);
          this.loading = false;
        },
        error: () => {
          this.snackBar.open('Ошибка загрузки заказа', 'Закрыть', { duration: 3000 });
          this.router.navigate(['/orders']).then();
        },
      });
  }

  private initForm(order: Order): void {
    this.orderForm = this.fb.group({
      number: [{ value: order.number, disabled: true }],
      customerName: [order.customerName, [Validators.required, Validators.minLength(3)]],
      status: [order.status, Validators.required],
      items: this.fb.array(order.items.map(item => this.createItemFormGroup(item))),
    });

    //Обновляем dataSource для таблицы
    this.updateItemsDataSource();

    this.orderForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.calculateTotal();
    });
  }

  private createItemFormGroup(item?: OrderItem): FormGroup {
    return this.fb.group({
      productId: [item?.productId || null, Validators.required],
      qty: [item?.qty || 1, [Validators.required, Validators.min(1)]],
      price: [item?.price || 0, [Validators.required, Validators.min(0)]],
    });
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  getSubtotal(item: AbstractControl<OrderItem, never>): number {
    return (item.value.qty || 0) * (item.value.price || 0);
  }

  calculateTotal(): number {
    return this.items.controls.reduce((sum, item) => sum + this.getSubtotal(item), 0);
  }

  onProductChange(index: number): void {
    const item = this.items.at(index);
    const productId = item.get('productId')?.value;
    const product = this.availableProducts.find(p => p.id === productId);

    if (product) {
      item.patchValue({
        price: product.price,
      });
    }
  }

  addItem(): void {
    this.items.push(this.createItemFormGroup());
    this.updateItemsDataSource();
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.updateItemsDataSource();
    } else {
      this.snackBar.open('В заказе должна быть хотя бы одна позиция', 'Закрыть', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
  }

  private updateItemsDataSource(): void {
    this.itemsDataSource.data = this.items.controls;
  }

  onSave(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      this.snackBar.open('Заполните все обязательные поля', 'Закрыть', { duration: 3000 });
      return;
    }

    if (!this.orderId || !this.originalOrderData) return;

    const formValue = this.orderForm.getRawValue();
    const updatedOrder: Order = {
      ...this.originalOrderData,
      customerName: formValue.customerName,
      status: formValue.status,
      items: formValue.items,
      total: this.calculateTotal(),
    };

    this.saving = true;
    const previousData = this.originalOrderData;

    this.orderService
      .updateOrder(this.orderId, updatedOrder)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving = false;
          this.originalOrderData = JSON.parse(JSON.stringify(updatedOrder));
          this.snackBar.open('Заказ успешно сохранён', 'Закрыть', { duration: 3000 });
        },
        error: () => {
          this.saving = false;
          this.initForm(previousData);
          this.snackBar.open('Ошибка сохранения. Изменения отменены', 'Закрыть', {
            duration: 3000,
          });
        },
      });
  }

  onDelete(): void {
    if (!this.orderId) return;

    if (!confirm('Вы уверены, что хотите удалить этот заказ?')) {
      return;
    }

    this.saving = true;

    this.orderService
      .deleteOrder(this.orderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open('Заказ удалён', 'Закрыть', { duration: 3000 });
          //Очищаем кеш перед навигацией, чтобы список перезагрузился
          this.orderService.clearCache();
          this.router.navigate(['/orders'], {
            queryParams: {
              _page: 1,
              _limit: 5,
              _sort: 'createdAt',
              _order: 'desc',
              status: 'all',
              q: '',
            },
          });
        },
        error: () => {
          this.saving = false;
          this.snackBar.open('Ошибка удаления заказа', 'Закрыть', { duration: 3000 });
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/orders']).then();
  }
}
