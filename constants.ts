
import { Order, OrderStatus, Product, User } from "./types";

// REPLACE this URL with your specific logo image URL
export const COMPANY_LOGO = "https://ui-avatars.com/api/?name=Jiangsu+Pineng&background=FFD700&color=0056b3&size=200&font-size=0.33&length=2&bold=true"; 

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    model: '5w1',
    name: '5-in-1 Power Tool Set',
    image: 'https://i.imgur.com/fFq2C2c.jpeg', // Placeholder for the tool set
    price: 88.6,
    weight: '16.6kg',
    size: '64x52x17cm',
    description: '包含: 角磨机*1, 圆锯*1, 电动扳手*1, 电钻*1, 电锤*1, 3Ah电池*4, 充电器*2',
    qtyPerCarton: 2,
    cartonSize: '65x53x35cm',
    grossWeight: 34
  },
  {
    id: 'p2',
    model: 'Drill-Pro',
    name: 'Brushless Drill Kit',
    image: 'https://picsum.photos/200/200?random=20',
    price: 45.0,
    weight: '3.5kg',
    size: '30x25x10cm',
    description: '无刷电钻套装, 2电池1充',
    qtyPerCarton: 5,
    cartonSize: '52x32x27cm',
    grossWeight: 18
  },
  {
    id: 'p3',
    model: 'Wrench-Max',
    name: 'Impact Wrench',
    image: 'https://picsum.photos/200/200?random=21',
    price: 62.5,
    weight: '4.2kg',
    size: '35x28x12cm',
    description: '强力冲击扳手',
    qtyPerCarton: 4,
    cartonSize: '58x30x26cm',
    grossWeight: 17.5
  }
];

export const MOCK_USERS: User[] = [
  { id: 'boss1', username: 'admin', role: 'BOSS', password: '123' },
  { id: 'u1', username: 'sales01', role: 'SALES', password: '123' },
  { id: 'u2', username: 'sales02', role: 'SALES', password: '123' },
  { id: 'u3', username: 'packer01', role: 'PACKER', password: '123' },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    date: '2025-04-08',
    createdBy: 'u1',
    items: [
      {
        productId: 'p1',
        productModel: '5w1',
        productImage: 'https://i.imgur.com/fFq2C2c.jpeg',
        quantity: 1,
        unitPrice: 80.60
      }
    ],
    customerName: 'HUASEBENEVA',
    isRepurchase: false,
    plugType: '欧规',
    headMark: 'LOME TOGO',
    recipientName: 'Miss du',
    recipientPhone: '13724182219',
    recipientAddress: '广东省佛山市南海区里水镇水口路西7号炜兴五金厂内',
    country: '多哥',
    remarks: '小心轻放',
    freight: 4.00,
    totalPrice: 84.60,
    orderNumber: '270496931501023057',
    status: OrderStatus.PACKED,
    packedAt: '2025-04-09T10:00:00Z',
    packingProof: 'https://picsum.photos/100/100?random=10'
  },
  {
    id: '2',
    date: '2025-05-08',
    createdBy: 'u1',
    items: [
      {
        productId: 'p2',
        productModel: 'Drill-Pro',
        productImage: 'https://picsum.photos/200/200?random=20',
        quantity: 1,
        unitPrice: 8.90
      }
    ],
    customerName: 'Wantula Sinkamba',
    isRepurchase: true, 
    plugType: '英规',
    headMark: 'PN4HH',
    recipientName: 'PN4HH Feiyue',
    recipientPhone: '18825157676',
    recipientAddress: '广州市白云区白云湖街道大朗北路28号A非越(PN4HH) 邮编：510450',
    country: '赞比亚',
    remarks: '加急发货',
    freight: 2.00,
    totalPrice: 10.90,
    orderNumber: '271181795001025257',
    status: OrderStatus.PENDING,
  },
  {
    id: '3',
    date: '2025-05-08',
    createdBy: 'u2',
    items: [
      {
        productId: 'p3',
        productModel: 'Wrench-Max',
        productImage: 'https://picsum.photos/200/200?random=21',
        quantity: 6,
        unitPrice: 39.80
      }
    ],
    customerName: 'Paterne Hounhouenou',
    isRepurchase: false,
    plugType: '欧规',
    headMark: 'NEWVIS',
    recipientName: '蒋军泽',
    recipientPhone: '13631371575/13380090345',
    recipientAddress: '广州市白云区鹤龙街道边村联兴路20号SEA仓非快国际 17999-SEA-benin',
    country: '贝宁',
    remarks: '4.0电池',
    freight: 12.00,
    totalPrice: 250.80,
    orderNumber: '270801146001025875',
    status: OrderStatus.PENDING,
  }
];

export const COUNTRIES = [
  "美国", "中国", "多哥", "赞比亚", "贝宁", "尼日利亚", "加纳", "南非", "英国", "法国", "德国"
];

export const PLUG_TYPES = [
  "英规", "美规", "澳规", "欧规", "中国"
];
