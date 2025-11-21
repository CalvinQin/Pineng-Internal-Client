
import React, { useMemo, useState } from 'react';
import { Order, OrderStatus, User } from '../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DateFilterBar, DateRangeType, filterOrdersByDate } from './DateFilterBar';

interface DashboardProps {
  orders: Order[];
  user: User;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard: React.FC<DashboardProps> = ({ orders, user }) => {
  const [dateRange, setDateRange] = useState<DateRangeType>('ALL');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('ALL');

  // Get unique users for filter dropdown (Boss Only)
  const userOptions = useMemo(() => {
      const users = new Set(orders.map(o => o.createdBy));
      return Array.from(users);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    // 1. Filter by Role (Sales see own, Boss see all or specific)
    let visibleOrders = orders;
    if (user.role === 'SALES') {
        visibleOrders = orders.filter(o => o.createdBy === user.id);
    } else if (user.role === 'BOSS' && selectedUserFilter !== 'ALL') {
        visibleOrders = orders.filter(o => o.createdBy === selectedUserFilter);
    }

    // 2. Filter by Date
    return filterOrdersByDate(visibleOrders, dateRange);
  }, [orders, dateRange, user, selectedUserFilter]);
  
  const stats = useMemo(() => {
    // Calculate product revenue (sum of item qty * unit price)
    // This logic was previously accessing order properties directly causing NaN
    const productRevenue = filteredOrders.reduce((total, order) => {
        const orderItemsRevenue = (order.items || []).reduce((sum, item) => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.unitPrice) || 0;
            return sum + (qty * price);
        }, 0);
        return total + orderItemsRevenue;
    }, 0);
    
    // Calculate freight revenue
    const freightRevenue = filteredOrders.reduce((sum, o) => sum + (Number(o.freight) || 0), 0);
    
    // Total
    const totalRevenue = productRevenue + freightRevenue;

    const pendingCount = filteredOrders.filter(o => o.status === OrderStatus.PENDING).length;
    const packedCount = filteredOrders.filter(o => o.status === OrderStatus.PACKED).length;
    const totalOrders = filteredOrders.length;

    // Group by country for Pie Chart
    const countryData = filteredOrders.reduce((acc, order) => {
      const existing = acc.find(i => i.name === order.country);
      if (existing) {
        existing.value += 1;
      } else if (order.country) {
        acc.push({ name: order.country, value: 1 });
      }
      return acc;
    }, [] as {name: string, value: number}[]);

    return { productRevenue, freightRevenue, totalRevenue, pendingCount, packedCount, totalOrders, countryData };
  }, [filteredOrders]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800">业绩看板 (Performance)</h2>
          <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
            {user.role === 'BOSS' && (
                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-500">查看业务员:</label>
                    <select 
                        value={selectedUserFilter} 
                        onChange={(e) => setSelectedUserFilter(e.target.value)}
                        className="text-sm border border-slate-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="ALL">全部 (All)</option>
                        {userOptions.map(u => (
                            <option key={u} value={u}>{u}</option>
                        ))}
                    </select>
                </div>
            )}
            <DateFilterBar activeRange={dateRange} onChange={setDateRange} />
          </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Product Revenue */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-200">
          <h3 className="text-blue-100 font-medium text-xs uppercase tracking-wider">产品销售额 (Product Sales)</h3>
          <p className="text-3xl font-bold mt-2">${stats.productRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p className="text-xs text-blue-100 mt-1 opacity-80">*不含运费 (Excl. Freight)</p>
        </div>

        {/* Freight Revenue */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
           <h3 className="text-slate-500 font-medium text-xs uppercase tracking-wider">运费总额 (Freight)</h3>
           <p className="text-3xl font-bold mt-2 text-slate-700">${stats.freightRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-slate-500 font-medium text-xs uppercase tracking-wider">订单总数 (Total Orders)</h3>
          <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold text-slate-800">{stats.totalOrders}</p>
              <span className="text-xs text-slate-400">({stats.packedCount} 完成 / {stats.pendingCount} 待办)</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-4">国家分布 (Orders by Country)</h3>
          <div className="h-64">
            {stats.countryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={stats.countryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    >
                    {stats.countryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-300">
                    暂无数据
                </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-4">销售构成 (Revenue Split)</h3>
           <div className="h-64 flex flex-col items-center justify-center">
               <div className="w-full flex items-center gap-4 mb-4">
                  <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden flex">
                      <div style={{ width: `${(stats.productRevenue / (stats.totalRevenue || 1)) * 100}%`}} className="bg-blue-500 h-full"></div>
                      <div style={{ width: `${(stats.freightRevenue / (stats.totalRevenue || 1)) * 100}%`}} className="bg-slate-400 h-full"></div>
                  </div>
               </div>
               <div className="flex gap-8 text-sm">
                   <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                       <span className="text-slate-600">货值 (Product): {((stats.productRevenue / (stats.totalRevenue || 1)) * 100).toFixed(1)}%</span>
                   </div>
                   <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                       <span className="text-slate-600">运费 (Freight): {((stats.freightRevenue / (stats.totalRevenue || 1)) * 100).toFixed(1)}%</span>
                   </div>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
