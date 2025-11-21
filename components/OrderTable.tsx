
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, UserRole } from '../types';
import { DateFilterBar, DateRangeType, filterOrdersByDate } from './DateFilterBar';

interface OrderTableProps {
  orders: Order[];
  role: UserRole;
  showSalesFilter?: boolean; // Only for Boss
  currentUserId?: string;
  onUpdateStatus?: (orderId: string, status: OrderStatus, proofImage?: string) => void;
  onEdit?: (order: Order) => void;
  onDelete?: (orderId: string) => void;
}

interface MobileCardProps {
  order: Order;
  role: UserRole;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  onFileUpload: (orderId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  currentUserId?: string;
  onEdit?: (order: Order) => void;
  onDelete?: (orderId: string) => void;
}

const MobileCard: React.FC<MobileCardProps> = ({ 
  order, role, copiedId, onCopy, onFileUpload,
  currentUserId, onEdit, onDelete 
}) => {
  // Calculate total qty for display
  const totalQty = order.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4 ${order.isRepurchase ? 'border-l-4 border-l-green-500' : ''}`}>
        <div className="p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{order.date}</span>
                <span className="text-[10px] bg-slate-100 px-1 rounded text-slate-500">By: {order.createdBy}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                order.status === OrderStatus.PACKED 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                {order.status}
                </span>
            </div>

            {/* Items List */}
            <div className="space-y-3 mb-3">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                        <div className="w-16 h-16 flex-shrink-0">
                            {item.productImage ? (
                                <img src={item.productImage} alt="" className="w-full h-full object-contain rounded bg-slate-50 border border-slate-100" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 rounded flex items-center justify-center text-xs text-slate-400">No Img</div>
                            )}
                        </div>
                        <div className="flex-1">
                             <div className="flex justify-between">
                                 <div className="font-bold text-slate-800 text-sm">{item.productModel}</div>
                                 <div className="font-bold text-blue-600">x{item.quantity}</div>
                             </div>
                             {role !== 'PACKER' && (
                                 <div className="text-xs text-slate-500 mt-1">Price: ${item.unitPrice}</div>
                             )}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                 <div className="flex items-center gap-2">
                    <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-xs font-medium border border-purple-100">{order.plugType}</span>
                    {order.isRepurchase && <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px]">复购</span>}
                 </div>
                 {role !== 'PACKER' && (
                     <div className="font-bold text-slate-800">Total: ${order.totalPrice.toFixed(2)}</div>
                 )}
            </div>

             {/* Copyable Head Mark */}
            <div className="mt-3">
               <div 
                    className="bg-blue-50 rounded px-2 py-2 flex items-center justify-between border border-blue-100 cursor-pointer active:bg-blue-100"
                    onClick={() => onCopy(order.headMark, `hm-${order.id}`)}
                >
                    <div className="text-sm font-mono text-blue-800 font-bold break-all whitespace-normal">{order.headMark}</div>
                    <div className="text-[10px] text-blue-400 flex-shrink-0 ml-2">
                        {copiedId === `hm-${order.id}` ? '已复制' : '复制'}
                    </div>
                </div>
            </div>

            {/* Address Area */}
            <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 relative">
                <div className="font-bold text-slate-800 mb-1">
                    {order.customerName} / {order.recipientName} <span className="font-normal text-slate-500">({order.country})</span>
                </div>
                <div className="text-xs text-slate-500 mb-1">{order.recipientPhone}</div>
                <div className="text-xs leading-snug break-words">{order.recipientAddress}</div>
                
                <button 
                    onClick={() => onCopy(`${order.recipientName} ${order.recipientPhone} ${order.recipientAddress}`, `addr-${order.id}`)}
                    className="absolute top-2 right-2 p-1 bg-white rounded border border-slate-200 shadow-sm text-slate-400 active:text-blue-600 active:border-blue-400"
                >
                    {copiedId === `addr-${order.id}` ? (
                        <span className="text-xs text-green-600 font-bold">Copied!</span>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    )}
                </button>
            </div>
            
            {/* Footer Actions */}
            {role === 'PACKER' ? (
                <div className="mt-4 pt-3 border-t border-slate-100">
                    {order.status === OrderStatus.PENDING ? (
                        <label className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-lg font-bold active:bg-blue-700 transition-colors cursor-pointer">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            拍照并确认
                            <input 
                                type="file" 
                                accept="image/*" 
                                capture="environment"
                                className="hidden" 
                                onChange={(e) => onFileUpload(order.id, e)}
                            />
                        </label>
                    ) : (
                        <div className="flex items-center justify-center gap-2 text-green-600 font-bold bg-green-50 py-2 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            已完成
                            {order.packingProof && <a href={order.packingProof} target="_blank" rel="noreferrer" className="text-xs underline text-blue-500 ml-2">查看凭证</a>}
                        </div>
                    )}
                </div>
            ) : (
                 /* Edit/Delete Actions for Mobile */
                 <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-3">
                     {(role === 'BOSS' || (role === 'SALES' && order.createdBy === currentUserId && order.status === OrderStatus.PENDING)) && (
                         <>
                             <button 
                                type="button"
                                onClick={() => onEdit && onEdit(order)}
                                className="flex items-center gap-1 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold"
                             >
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                 编辑
                             </button>
                             <button 
                                type="button"
                                onClick={() => onDelete && onDelete(order.id)}
                                className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold"
                             >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                删除
                             </button>
                         </>
                     )}
                 </div>
            )}
        </div>
    </div>
  );
};

const OrderTable: React.FC<OrderTableProps> = ({ orders, role, showSalesFilter, currentUserId, onUpdateStatus, onEdit, onDelete }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeType>('ALL');
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('ALL');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<'ALL' | 'BIG' | 'SMALL'>('ALL');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('ALL');

  // Extract options for filters
  const userOptions = useMemo(() => Array.from(new Set(orders.map(o => o.createdBy))), [orders]);
  const productOptions = useMemo(() => {
      const products = new Set<string>();
      orders.forEach(o => o.items.forEach(i => products.add(i.productModel)));
      return Array.from(products);
  }, [orders]);

  const filteredOrders = useMemo(() => {
      // 1. Date Filter
      let res = filterOrdersByDate(orders, dateRange);

      // 2. Search Filter (Global)
      if (searchTerm) {
          const lowerTerm = searchTerm.toLowerCase();
          res = res.filter(o => 
              o.customerName.toLowerCase().includes(lowerTerm) ||
              o.country.toLowerCase().includes(lowerTerm) ||
              o.items.some(i => i.productModel.toLowerCase().includes(lowerTerm))
          );
      }

      // 3. Role-based Filters
      if (role === 'BOSS' || role === 'PACKER') {
          // Boss and Packer can filter by Sales Rep
          if (selectedUserFilter !== 'ALL') {
              res = res.filter(o => o.createdBy === selectedUserFilter);
          }
      }

      if (role === 'PACKER') {
          // Size Filter (Big >= 20, Small < 20)
          if (selectedSizeFilter !== 'ALL') {
              res = res.filter(o => {
                  const totalQty = o.items.reduce((acc, i) => acc + i.quantity, 0);
                  return selectedSizeFilter === 'BIG' ? totalQty >= 20 : totalQty < 20;
              });
          }
          // Product Filter
          if (selectedProductFilter !== 'ALL') {
              res = res.filter(o => o.items.some(i => i.productModel === selectedProductFilter));
          }
      }

      return res;
  }, [orders, dateRange, searchTerm, selectedUserFilter, selectedSizeFilter, selectedProductFilter, role]);

  const handleFileUpload = (orderId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateStatus) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onUpdateStatus(orderId, OrderStatus.PACKED, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <>
      <div className="flex flex-col gap-4 mb-4">
        {/* Top Bar: Date Filter + Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <DateFilterBar activeRange={dateRange} onChange={setDateRange} />
            
            <div className="relative w-full md:w-64">
                <input 
                    type="text" 
                    placeholder="搜索客户, 国家, 产品..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
        </div>
        
        {/* Advanced Filters (Role Specific) */}
        <div className="flex flex-wrap items-center gap-3">
            {(role === 'BOSS' || role === 'PACKER') && (
                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-500">筛选业务员:</label>
                    <select 
                        value={selectedUserFilter} 
                        onChange={(e) => setSelectedUserFilter(e.target.value)}
                        className="text-sm border border-slate-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="ALL">全部 (All Users)</option>
                        {userOptions.map(u => (
                            <option key={u} value={u}>{u}</option>
                        ))}
                    </select>
                </div>
            )}

            {role === 'PACKER' && (
                <>
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-500">订单规模:</label>
                        <select 
                            value={selectedSizeFilter} 
                            onChange={(e) => setSelectedSizeFilter(e.target.value as any)}
                            className="text-sm border border-slate-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="ALL">全部 (All Sizes)</option>
                            <option value="BIG">📦 大订单 (&ge;20)</option>
                            <option value="SMALL">📧 小散单 (&lt;20)</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-500">筛选产品:</label>
                        <select 
                            value={selectedProductFilter} 
                            onChange={(e) => setSelectedProductFilter(e.target.value)}
                            className="text-sm border border-slate-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 outline-none max-w-[150px]"
                        >
                            <option value="ALL">全部 (All Products)</option>
                            {productOptions.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                </>
            )}
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        {filteredOrders.length === 0 ? (
            <div className="text-center py-10 text-slate-400">暂无订单</div>
        ) : (
            filteredOrders.map(order => (
              <MobileCard 
                key={order.id} 
                order={order} 
                role={role}
                copiedId={copiedId}
                onCopy={copyToClipboard}
                onFileUpload={handleFileUpload}
                currentUserId={currentUserId}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-lg shadow-sm bg-white">
        <table className="w-full text-sm text-left text-slate-600 whitespace-nowrap">
          <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-xs">
            <tr>
              <th className="px-3 py-3">日期</th>
              <th className="px-3 py-3">业务员</th>
              <th className="px-3 py-3">产品 (Products)</th>
              <th className="px-3 py-3 text-center">数量</th>
              
              {role !== 'PACKER' && (
                <>
                  <th className="px-3 py-3 text-right">单价</th>
                </>
              )}

              <th className="px-3 py-3">插头</th>
              <th className="px-3 py-3">客户</th>
              <th className="px-3 py-3 w-32">唛头 (Head Mark)</th>
              <th className="px-3 py-3">收货信息</th>
              <th className="px-3 py-3">备注</th>
              
              {role !== 'PACKER' && (
                <>
                  <th className="px-3 py-3 text-right">运费</th>
                  <th className="px-3 py-3 text-right">总价</th>
                </>
              )}

              <th className="px-3 py-3">订单号</th>
              <th className="px-3 py-3">状态</th>
              <th className="px-3 py-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={role === 'PACKER' ? 12 : 15} className="px-4 py-8 text-center text-slate-400">
                  暂无订单数据
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  className={`hover:bg-opacity-50 transition-colors ${
                    order.isRepurchase ? 'bg-green-50 hover:bg-green-100' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <td className="px-3 py-3 font-medium align-top">
                      {order.date}
                      {order.updatedAt && (
                          <span className="block text-[10px] text-amber-600 font-bold mt-1 bg-amber-50 px-1 rounded w-fit">已修改</span>
                      )}
                  </td>
                  <td className="px-3 py-3 text-xs font-mono text-slate-500 align-top">{order.createdBy}</td>
                  
                  {/* Stacked Items */}
                  <td className="px-3 py-3 align-top">
                      <div className="space-y-2">
                          {order.items.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-2">
                                {item.productImage ? (
                                    <img src={item.productImage} alt="" className="w-8 h-8 object-contain rounded border border-slate-200 bg-white" />
                                ) : (
                                    <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-[8px]">N/A</div>
                                )}
                                <span className="font-medium text-xs">{item.productModel}</span>
                             </div>
                          ))}
                      </div>
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-blue-600 align-top">
                      <div className="space-y-4">
                          {order.items.map((item, idx) => (
                              <div key={idx} className="h-8 flex items-center justify-center">{item.quantity}</div>
                          ))}
                      </div>
                  </td>

                  {role !== 'PACKER' && (
                      <td className="px-3 py-3 text-right text-slate-500 align-top">
                          <div className="space-y-4">
                              {order.items.map((item, idx) => (
                                  <div key={idx} className="h-8 flex items-center justify-end">${item.unitPrice}</div>
                              ))}
                          </div>
                      </td>
                  )}

                  <td className="px-3 py-3 align-top">
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded border border-purple-100 text-xs font-bold">
                          {order.plugType}
                      </span>
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-800 align-top">
                    {order.customerName}
                    {order.isRepurchase && (
                      <div className="mt-1">
                          <span className="inline-block px-1 py-0.5 text-[10px] bg-green-200 text-green-800 rounded border border-green-300">
                          复购
                          </span>
                      </div>
                    )}
                  </td>
                  
                  {/* Optimized Head Mark Display with CSS */}
                  <td className="px-3 py-3 align-top max-w-[150px]">
                      <div className="flex flex-col gap-1">
                          <div 
                              className="font-mono text-blue-700 font-bold bg-blue-50 rounded px-2 py-1 text-xs break-all whitespace-normal cursor-pointer hover:bg-blue-100"
                              onClick={() => copyToClipboard(order.headMark, `hm-d-${order.id}`)}
                          >
                              {order.headMark}
                          </div>
                          {copiedId === `hm-d-${order.id}` && <span className="text-[10px] text-green-600">已复制</span>}
                      </div>
                  </td>

                  <td className="px-3 py-3 max-w-xs whitespace-normal text-xs leading-relaxed group relative align-top">
                      <div className="font-bold text-slate-700">{order.recipientName} <span className="font-normal text-slate-500">({order.country})</span></div>
                      <div className="text-slate-500 mb-1">{order.recipientPhone}</div>
                      <div className="text-slate-400 break-words">
                          {order.recipientAddress}
                      </div>
                      <button onClick={() => copyToClipboard(`${order.recipientName} ${order.recipientPhone} ${order.recipientAddress}`, `addr-d-${order.id}`)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-blue-500 bg-white rounded-full p-1 shadow transition-opacity">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </button>
                  </td>
                  <td className="px-3 py-3 max-w-[150px] whitespace-normal text-xs text-red-500 font-medium align-top">{order.remarks}</td>
                  
                  {role !== 'PACKER' && (
                    <>
                      <td className="px-3 py-3 text-right text-slate-500 align-top">{order.freight.toFixed(2)}</td>
                      <td className="px-3 py-3 text-right font-bold text-slate-800 align-top">{order.totalPrice.toFixed(2)}</td>
                    </>
                  )}

                  <td className="px-3 py-3 text-xs text-slate-500 font-mono max-w-[120px] truncate align-top">
                      {order.orderNumber}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                      order.status === OrderStatus.PACKED 
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-100 text-amber-700 border-amber-200'
                    }`}>
                      {order.status}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-center align-middle">
                    {role === 'PACKER' ? (
                        order.status === OrderStatus.PENDING ? (
                           <label className="cursor-pointer inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded shadow transition-colors">
                              拍照
                              <input 
                                  type="file" 
                                  accept="image/*" 
                                  capture="environment"
                                  className="hidden" 
                                  onChange={(e) => handleFileUpload(order.id, e)}
                              />
                           </label>
                        ) : (
                           <span className="text-green-600 text-xs font-bold">√ 完成</span>
                        )
                    ) : (
                       /* Actions for Sales/Boss */
                       <div className="flex gap-2 justify-center">
                           {(role === 'BOSS' || (role === 'SALES' && order.createdBy === currentUserId && order.status === OrderStatus.PENDING)) && (
                               <>
                                   <button 
                                      type="button"
                                      onClick={() => onEdit && onEdit(order)}
                                      className="text-blue-500 hover:text-blue-700 p-1"
                                      title="编辑"
                                   >
                                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                   </button>
                                   <button 
                                      type="button"
                                      onClick={() => onDelete && onDelete(order.id)}
                                      className="text-red-500 hover:text-red-700 p-1"
                                      title="删除"
                                   >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                   </button>
                               </>
                           )}
                       </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default OrderTable;
