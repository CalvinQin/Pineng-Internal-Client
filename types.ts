
export enum OrderStatus {
  PENDING = '待打包', // Waiting for packing
  PACKED = '已打包',   // Packed and ready/shipped
}

export type UserRole = 'SALES' | 'PACKER' | 'BOSS'; // SALES = Sales Rep, BOSS = Boss, PACKER = Packer

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
}

export interface Product {
  id: string;
  model: string;
  name: string;
  image: string;
  price: number;
  weight: string; // Product weight
  size: string; // Product dimensions
  description: string;
  
  // New Packing Specs for CBM Calculator
  qtyPerCarton: number; 
  cartonSize: string; // e.g., "60x40x50cm"
  grossWeight: number; // Weight per carton in kg
}

export interface OrderItem {
  productId: string;
  productModel: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  date: string;
  createdBy: string; // User ID of the Sales Rep who created it
  
  // Multi-product support
  items: OrderItem[];

  customerName: string;
  isRepurchase: boolean; 
  plugType: string; 
  headMark: string; 
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  country: string;
  remarks: string;
  freight: number; 
  totalPrice: number;
  orderNumber: string; 
  status: OrderStatus;
  
  packedBy?: string;
  packedAt?: string;
  packingProof?: string | null; 

  // Edit tracking
  updatedAt?: string;
  updatedBy?: string;
}

export interface AddressParseResult {
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  country: string;
}

export interface ProductParseResult {
  model: string;
  name: string;
  size: string;
  price: number;
  qtyPerCarton: number;
  cartonSize: string;
  grossWeight: number;
  description: string;
}
