
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { Order, OrderStatus, Product, User, UserRole } from './types';
import { MOCK_ORDERS, MOCK_PRODUCTS, COMPANY_LOGO } from './constants';
import OrderForm from './components/OrderForm';
import OrderTable from './components/OrderTable';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import ProductList from './components/ProductList';

const NavItem: React.FC<{ to: string; label: string; icon: React.ReactNode }> = ({ to, label, icon }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
          isActive
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

const ProtectedRoute: React.FC<{ user: User | null; allowedRoles?: UserRole[]; children: React.ReactNode }> = ({ user, allowedRoles, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
     return <div className="p-10 text-center text-slate-500">Access Denied.</div>;
  }
  return <>{children}</>;
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  
  // Order Form State (Create or Edit)
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Create or Update Order
  const handleSaveOrder = (order: Order) => {
    if (editingOrder) {
        // Edit Mode
        setOrders(prev => prev.map(o => o.id === order.id ? order : o));
        setEditingOrder(null);
    } else {
        // Create Mode
        setOrders(prev => [order, ...prev]);
    }
    setShowOrderForm(false);
  };

  const handleCancelOrderForm = () => {
      setShowOrderForm(false);
      setEditingOrder(null);
  }

  const handleEditOrder = (order: Order) => {
      setEditingOrder(order);
      setShowOrderForm(true);
  }

  const handleDeleteOrder = (orderId: string) => {
      // Explicitly use window.confirm
      if (window.confirm("确定要删除这个订单吗？此操作无法撤销。\nAre you sure you want to delete this order?")) {
          setOrders(prev => prev.filter(o => o.id !== orderId));
      }
  }

  const handleUpdateStatus = (orderId: string, status: OrderStatus, proofImage?: string) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId 
      ? { ...o, status, packingProof: proofImage || o.packingProof, packedAt: status === OrderStatus.PACKED ? new Date().toISOString() : o.packedAt, packedBy: user?.username } 
      : o
    ));
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [...prev, newProduct]);
  };

  const getMyOrders = () => {
      if (!user) return [];
      return orders.filter(o => o.createdBy === user.id);
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 hidden md:flex flex-col">
          <div className="p-6">
            {/* New Logo Design - Using Image */}
            <div className="flex flex-col items-center justify-center mb-8">
              <img 
                src={COMPANY_LOGO} 
                alt="Jiangsu Pineng" 
                className="h-16 w-auto object-contain mb-2"
              />
              <div className="text-center">
                 <h1 className="font-bold text-slate-800 leading-tight tracking-tight">TradeFlow AI</h1>
                 <p className="text-[10px] text-slate-400 font-medium">Jiangsu Pineng Tools</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              {(user.role === 'BOSS' || user.role === 'SALES') && (
                <NavItem 
                    to="/" 
                    label="业绩面板 (Dashboard)" 
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} 
                />
              )}

              {user.role === 'SALES' && (
                  <NavItem 
                    to="/my-orders" 
                    label="我的订单 (My Orders)" 
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} 
                  />
              )}

              {user.role === 'BOSS' && (
                  <NavItem 
                    to="/all-orders" 
                    label="所有订单 (All Orders)" 
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} 
                  />
              )}
              
              <NavItem 
                to="/packing" 
                label="仓库打包 (Packing)" 
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} 
              />

              {(user.role === 'BOSS' || user.role === 'SALES') && (
                <NavItem 
                  to="/products" 
                  label="产品列表 (Products)" 
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} 
                />
              )}
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-200">
                  {user.username.substring(0, 2).toUpperCase()}
               </div>
               <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 truncate">{user.username}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role.toLowerCase()}</p>
               </div>
            </div>
            <button onClick={handleLogout} className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-colors font-medium">
              退出登录 (Logout)
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="bg-white border-b border-slate-200 px-6 py-4 md:hidden flex justify-between items-center">
             <span className="font-bold text-slate-800 flex items-center gap-2">
                 <img src={COMPANY_LOGO} alt="Logo" className="w-8 h-8 object-contain" />
                 TradeFlow AI
             </span>
             <button onClick={handleLogout} className="text-sm text-slate-500">Logout</button>
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
               <Routes>
                  <Route path="/" element={
                      <ProtectedRoute user={user} allowedRoles={['BOSS', 'SALES']}>
                          <Dashboard orders={orders} user={user} />
                      </ProtectedRoute>
                  } />

                  <Route path="/my-orders" element={
                      <ProtectedRoute user={user} allowedRoles={['SALES']}>
                           {showOrderForm ? (
                               <OrderForm 
                                  products={products} 
                                  userId={user.id}
                                  initialOrder={editingOrder}
                                  onSubmit={handleSaveOrder} 
                                  onCancel={handleCancelOrderForm} 
                               />
                           ) : (
                               <div className="space-y-6">
                                  <div className="flex justify-between items-center">
                                     <h2 className="text-2xl font-bold text-slate-800">我的订单 (My Orders)</h2>
                                     <button 
                                        onClick={() => setShowOrderForm(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                                     >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        新建订单
                                     </button>
                                  </div>
                                  <OrderTable 
                                    orders={getMyOrders()} 
                                    role={user.role} 
                                    currentUserId={user.id}
                                    onEdit={handleEditOrder}
                                    onDelete={handleDeleteOrder}
                                  />
                               </div>
                           )}
                      </ProtectedRoute>
                  } />

                  <Route path="/all-orders" element={
                      <ProtectedRoute user={user} allowedRoles={['BOSS']}>
                          <div className="space-y-6">
                              <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-slate-800">所有订单 (All Orders)</h2>
                                <button 
                                    onClick={() => setShowOrderForm(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    新建订单
                                </button>
                              </div>
                              {showOrderForm ? (
                                 <OrderForm 
                                    products={products} 
                                    userId={user.id}
                                    initialOrder={editingOrder}
                                    onSubmit={handleSaveOrder} 
                                    onCancel={handleCancelOrderForm} 
                                 />
                              ) : (
                                <OrderTable 
                                    orders={orders} 
                                    role={user.role} 
                                    showSalesFilter={true} 
                                    currentUserId={user.id}
                                    onEdit={handleEditOrder}
                                    onDelete={handleDeleteOrder}
                                />
                              )}
                          </div>
                      </ProtectedRoute>
                  } />

                  <Route path="/packing" element={
                       <div className="space-y-6">
                           <h2 className="text-2xl font-bold text-slate-800">仓库打包 (Packing List)</h2>
                           <OrderTable 
                              orders={orders} 
                              role={user.role} 
                              onUpdateStatus={handleUpdateStatus} 
                            />
                       </div>
                  } />

                  <Route path="/products" element={
                       <ProtectedRoute user={user} allowedRoles={['BOSS', 'SALES']}>
                          <ProductList products={products} role={user.role} onAddProduct={handleAddProduct} />
                       </ProtectedRoute>
                  } />

                  <Route path="*" element={<Navigate to={user.role === 'PACKER' ? '/packing' : '/'} replace />} />
               </Routes>
            </div>
          </div>
          
          <nav className="md:hidden bg-white border-t border-slate-200 flex justify-around p-2 pb-safe">
             {(user.role === 'BOSS' || user.role === 'SALES') && (
                <NavLink to="/" className={({isActive}) => `flex flex-col items-center p-2 rounded ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                   <span className="text-[10px]">Dashboard</span>
                </NavLink>
             )}
             {user.role === 'SALES' && (
                <NavLink to="/my-orders" className={({isActive}) => `flex flex-col items-center p-2 rounded ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                   <span className="text-[10px]">Orders</span>
                </NavLink>
             )}
             {user.role === 'BOSS' && (
                <NavLink to="/all-orders" className={({isActive}) => `flex flex-col items-center p-2 rounded ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                   <span className="text-[10px]">All</span>
                </NavLink>
             )}
             <NavLink to="/packing" className={({isActive}) => `flex flex-col items-center p-2 rounded ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                <span className="text-[10px]">Packing</span>
             </NavLink>
          </nav>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
