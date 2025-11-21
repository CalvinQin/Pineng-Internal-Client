
import React, { useState, useCallback, useEffect } from 'react';
import { Order, OrderItem, OrderStatus, Product } from '../types';
import { parseAddressWithAI } from '../services/geminiService';
import { COUNTRIES, PLUG_TYPES } from '../constants';
import ProductSelector from './ProductSelector';

interface OrderFormProps {
  products: Product[];
  userId: string; // Current User ID
  initialOrder?: Order | null; // For editing
  onSubmit: (order: Order) => void;
  onCancel: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ products, userId, initialOrder, onSubmit, onCancel }) => {
  const [isParsing, setIsParsing] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [rawAddress, setRawAddress] = useState('');
  
  // Form State
  const [formData, setFormData] = useState<Partial<Order>>({
    date: new Date().toISOString().split('T')[0],
    freight: 0,
    isRepurchase: false,
    status: OrderStatus.PENDING,
    customerName: '',
    headMark: '',
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    country: '',
    remarks: '',
    orderNumber: '',
    plugType: '欧规',
    items: [],
  });

  // Initialize for Edit Mode
  useEffect(() => {
    if (initialOrder) {
      setFormData({ ...initialOrder });
    }
  }, [initialOrder]);

  // Handle Product Selection
  const handleProductSelect = (product: Product) => {
    const newItem: OrderItem = {
      productId: product.id,
      productModel: product.model,
      productImage: product.image,
      quantity: 1,
      unitPrice: product.price
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem],
      // Auto-fill remarks if empty
      remarks: prev.remarks ? prev.remarks : product.description
    }));
    setShowProductSelector(false);
  };

  // Handle Item Update
  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...(formData.items || [])];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...(formData.items || [])];
    newItems.splice(index, 1);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  // AI Parsing Handler
  const handleAIParse = async () => {
    if (!rawAddress) return;
    setIsParsing(true);
    try {
      const result = await parseAddressWithAI(rawAddress);
      setFormData(prev => ({
        ...prev,
        recipientName: result.recipientName || prev.recipientName,
        recipientPhone: result.recipientPhone || prev.recipientPhone,
        recipientAddress: result.recipientAddress || prev.recipientAddress,
        country: result.country || prev.country
      }));
    } catch (e) {
      alert("AI 解析失败，请手动输入。");
    } finally {
      setIsParsing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Auto-calculate total
  const calculateTotal = useCallback(() => {
    const itemsTotal = (formData.items || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const freight = Number(formData.freight) || 0;
    return itemsTotal + freight;
  }, [formData.items, formData.freight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.items || formData.items.length === 0) {
        alert("请至少添加一个产品");
        return;
    }

    const total = calculateTotal();
    
    if (initialOrder) {
      // Update existing
      const updatedOrder: Order = {
        ...initialOrder,
        ...formData as Order,
        totalPrice: total,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      };
      onSubmit(updatedOrder);
    } else {
      // Create new
      const newOrder: Order = {
        id: Date.now().toString(),
        createdBy: userId,
        ...formData as Order,
        totalPrice: total,
      };
      onSubmit(newOrder);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-5xl mx-auto border border-slate-200 relative">
      {showProductSelector && (
        <ProductSelector 
          products={products}
          onSelect={handleProductSelect} 
          onClose={() => setShowProductSelector(false)} 
        />
      )}

      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span className="text-blue-600">{initialOrder ? '编辑订单' : '新建订单'}</span> 
        <span className="text-sm font-normal text-slate-400">/ {initialOrder ? 'Edit Order' : 'New Order'}</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">日期 (Date)</label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">订单号 / 支付方式及金额</label>
            <input
              type="text"
              name="orderNumber"
              required
              placeholder="例如: 27049... 或 '西联汇款 500USD'"
              value={formData.orderNumber}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center pt-6">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="isRepurchase"
                checked={formData.isRepurchase}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-slate-700 font-medium">是否复购 (高亮显示)</span>
            </label>
          </div>
        </div>

        {/* Row 2: Products List */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
           <div className="flex justify-between items-center mb-3">
               <label className="block text-sm font-bold text-slate-700">订购产品 (Products)</label>
               <button 
                  type="button"
                  onClick={() => setShowProductSelector(true)}
                  className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
               >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                   添加商品
               </button>
           </div>
           
           <div className="space-y-2">
               {(formData.items || []).length === 0 && (
                   <div className="text-center text-slate-400 py-4 border-2 border-dashed border-slate-300 rounded-lg">
                       暂无商品，请点击上方按钮添加
                   </div>
               )}
               {(formData.items || []).map((item, idx) => (
                   <div key={idx} className="bg-white p-3 rounded shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-4">
                       <div className="w-16 h-16 bg-slate-100 rounded border border-slate-200 flex-shrink-0 overflow-hidden">
                           {item.productImage ? (
                               <img src={item.productImage} alt="" className="w-full h-full object-contain" />
                           ) : (
                               <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No Img</div>
                           )}
                       </div>
                       
                       <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                           <div>
                               <label className="text-xs text-slate-500 block mb-1">型号 (Model)</label>
                               <input 
                                  type="text" 
                                  value={item.productModel} 
                                  readOnly 
                                  className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm text-slate-600" 
                               />
                           </div>
                           <div className="grid grid-cols-2 gap-2">
                               <div>
                                   <label className="text-xs text-slate-500 block mb-1">数量 (Qty)</label>
                                   <input 
                                      type="number" 
                                      min="1"
                                      value={item.quantity}
                                      onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value))}
                                      className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500" 
                                   />
                               </div>
                               <div>
                                   <label className="text-xs text-slate-500 block mb-1">单价 ($)</label>
                                   <input 
                                      type="number" 
                                      step="0.01"
                                      value={item.unitPrice}
                                      onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value))}
                                      className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500" 
                                   />
                               </div>
                           </div>
                           <div className="flex items-end justify-between">
                               <div>
                                   <label className="text-xs text-slate-500 block mb-1">小计 (Subtotal)</label>
                                   <div className="text-sm font-bold text-slate-800">${(item.quantity * item.unitPrice).toFixed(2)}</div>
                               </div>
                               <button 
                                  type="button" 
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-red-400 hover:text-red-600 text-sm underline"
                               >
                                   移除
                               </button>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* Row 3: Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">客户名称</label>
                <input
                type="text"
                name="customerName"
                required
                value={formData.customerName}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">唛头 (Mark)</label>
                <input
                type="text"
                name="headMark"
                required
                value={formData.headMark}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">插头规格</label>
                <select 
                    name="plugType" 
                    value={formData.plugType} 
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
                >
                    {PLUG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">订单备注 (Remarks)</label>
            <input type="text" name="remarks" value={formData.remarks} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="例如: 4.0电池, 易碎品..." />
        </div>

        {/* Row 4: AI Address Parser */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <svg className="w-24 h-24 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6a1 1 0 0 0-1 1v4.59l-3.29 3.29a1 1 0 0 0 1.41 1.42l4-4a1 1 0 0 0 .3-1.09A1 1 0 0 0 12 6z"/></svg>
          </div>
          <div className="flex justify-between items-center mb-2 relative z-10">
            <label className="block text-sm font-bold text-blue-800 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              AI 智能地址识别
            </label>
            <button
              type="button"
              onClick={handleAIParse}
              disabled={isParsing || !rawAddress}
              className={`text-xs px-4 py-1.5 rounded-full font-medium transition-colors shadow-sm ${
                isParsing ? 'bg-blue-200 text-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isParsing ? '正在解析...' : '✨ 一键识别'}
            </button>
          </div>
          <textarea
            placeholder="在此粘贴客户发来的杂乱地址信息，AI将自动提取收件人、电话、地址..."
            value={rawAddress}
            onChange={(e) => setRawAddress(e.target.value)}
            className="w-full text-sm border border-blue-200 rounded-md p-3 focus:ring-2 focus:ring-blue-300 outline-none h-24 bg-white/80 relative z-10"
          />
        </div>

        {/* Row 5: Address Details (Auto-filled) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">收件人姓名</label>
            <input type="text" name="recipientName" value={formData.recipientName} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">联系电话</label>
            <input type="text" name="recipientPhone" value={formData.recipientPhone} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">国家</label>
            <input list="countries" name="country" value={formData.country} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
            <datalist id="countries">
              {COUNTRIES.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">详细地址</label>
            <textarea name="recipientAddress" rows={2} value={formData.recipientAddress} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
        </div>

        {/* Row 6: Totals */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">运费 ($)</label>
            <input type="number" step="0.01" name="freight" value={formData.freight} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-center font-mono" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">订单总价 ($)</label>
            <div className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-center font-bold text-green-600 font-mono text-lg">
              {calculateTotal().toFixed(2)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors"
          >
            取消 (Cancel)
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-md shadow-blue-200 transition-all transform hover:scale-105"
          >
            {initialOrder ? '保存修改 (Save Changes)' : '提交订单 (Submit)'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
