/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Types for the online clothing and accessory store

export interface Product {
  id: number;
  product_name: string;
  slug: string;
  description: string;
  specifications?: string;
  price: number;
  compare_at_price: number | null;
  category_id: number;
  category_name: string;
  sku: string;
  is_active: boolean;
  image_url: string;
  images: string[];
  sizes: string[];
  colors: string[];
  rating: number;
  reviews_count: number;
  stock: number;
}

export interface Review {
  id: number;
  customer_id?: number;
  user_name: string;
  is_admin?: boolean;
  product_id: number;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Category {
  id: number;
  category_name: string;
  parent_id: number | null;
  slug: string;
  description: string;
  icon: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Coupon {
  id: number;
  coupon_code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  is_active: boolean;
}

export interface ActivityLog {
  id: number;
  user_id?: number;
  action: string;
  ip_address?: string;
  details: string;
  created_at?: string;
  timestamp?: string;
}

export interface PresetQuery {
  id: string;
  title: string;
  description: string;
  sql: string;
}

// Types for the Database Tables representation in SQL simulation

export interface DbTableColumn {
  name: string;
  type: string;
  isPk: boolean;
  isFk: boolean;
  fkRef?: string;
  nullable: boolean;
  defaultValue?: string;
  description: string;
}

export interface DbTableSchema {
  tableName: string;
  description: string;
  arabicDescription: string;
  group: "users" | "products" | "carts" | "orders" | "services";
  columns: DbTableColumn[];
}

export interface QueryResult {
  columns: string[];
  rows: any[];
  executionTimeMs: number;
  affectedRows?: number;
  error?: string;
}
