import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  LogOut, 
  Activity,
  User,
  RefreshCw
} from 'lucide-react';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Toasts from './components/Toasts';

import { authAPI, productsAPI, customersAPI, ordersAPI, statsAPI } from './api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Core Data States
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total_products: 0,
    total_customers: 0,
    total_orders: 0,
    low_stock_products: []
  });

  const [toasts, setToasts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Authenticate / fetch user
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      authAPI.me()
        .then(u => setUser(u))
        .catch(() => handleLogout());
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  // Load app data
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    Promise.all([
      productsAPI.getAll(),
      customersAPI.getAll(),
      ordersAPI.getAll(),
      statsAPI.getStats()
    ])
      .then(([prods, custs, ords, st]) => {
        setProducts(prods);
        setCustomers(custs);
        setOrders(ords);
        setStats(st);
      })
      .catch((err) => console.error("Error loading application data:", err))
      .finally(() => setLoading(false));
  }, [user, refreshKey]);

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
  };

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Product actions
  const handleCreateProduct = async (data) => {
    const newProd = await productsAPI.create(data);
    addToast('Product created successfully!', 'success');
    triggerRefresh();
    return newProd;
  };

  const handleUpdateProduct = async (id, data) => {
    const updatedProd = await productsAPI.update(id, data);
    addToast('Product updated successfully!', 'success');
    triggerRefresh();
    return updatedProd;
  };

  const handleDeleteProduct = async (id) => {
    await productsAPI.delete(id);
    addToast('Product deleted.', 'success');
    triggerRefresh();
  };

  // Customer actions
  // Customer actions
  const handleCreateCustomer = async (data) => {
    const newCust = await customersAPI.create(data);
    addToast('Customer profile created!', 'success');
    triggerRefresh();
    return newCust;
  };

  const handleUpdateCustomer = async (id, data) => {
    const updatedCust = await customersAPI.update(id, data);
    addToast('Customer profile updated!', 'success');
    triggerRefresh();
    return updatedCust;
  };

  const handleDeleteCustomer = async (id) => {
    await customersAPI.delete(id);
    addToast('Customer deleted.', 'success');
    triggerRefresh();
  };

  // Order actions
  const handleCreateOrder = async (data) => {
    const newOrder = await ordersAPI.create(data);
    addToast('Order placed successfully!', 'success');
    triggerRefresh();
    return newOrder;
  };

  const handleDeleteOrder = async (id) => {
    await ordersAPI.delete(id);
    addToast('Order cancelled and stock restored.', 'success');
    triggerRefresh();
  };

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (!token || !user) {
    return (
      <Login 
        onLogin={handleLogin} 
        registerAPI={authAPI.register} 
        loginAPI={authAPI.login} 
      />
    );
  }

  const sidebarLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, viewName: 'dashboard' },
    { name: 'Products', icon: Package, viewName: 'products' },
    { name: 'Customers', icon: Users, viewName: 'customers' },
    { name: 'Orders', icon: ShoppingCart, viewName: 'orders' },
  ];

  return (
    <div className="flex min-h-screen bg-[#080b11] relative text-gray-200">
      {/* Background radial lights */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0d16] border-r border-white/5 flex flex-col justify-between shrink-0 relative z-20">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-wide">
              Inventory<span className="text-blue-400 font-light">Pro</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = view === link.viewName;
              return (
                <button
                  key={link.viewName}
                  onClick={() => setView(link.viewName)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600/10 border border-blue-500/25 text-blue-400 shadow-md' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {link.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User profile and Action buttons */}
        <div className="p-4 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-white/5 border border-white/10 rounded-full">
              <User className="w-4 h-4 text-blue-300" />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-gray-500 block">Logged in as</span>
              <span className="text-sm font-bold text-white block truncate">{user.username}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={triggerRefresh}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white transition flex items-center justify-center grow"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={handleLogout}
              className="p-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-rose-400 hover:text-rose-300 transition flex items-center justify-center grow"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="grow p-8 overflow-y-auto relative z-10">
        {loading && (
          <div className="absolute inset-0 bg-[#080b11]/50 backdrop-blur-xs flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-3">
              <span className="border-4 border-blue-500/20 border-t-blue-500 h-10 w-10 rounded-full animate-spin"></span>
              <span className="text-xs text-gray-400 font-semibold tracking-widest uppercase">Syncing portal...</span>
            </div>
          </div>
        )}

        {view === 'dashboard' && <Dashboard stats={stats} setView={setView} />}
        
        {view === 'products' && (
          <Products 
            products={products} 
            onCreate={handleCreateProduct}
            onUpdate={handleUpdateProduct}
            onDelete={handleDeleteProduct}
          />
        )}

        {view === 'customers' && (
          <Customers 
            customers={customers} 
            onCreate={handleCreateCustomer}
            onUpdate={handleUpdateCustomer}
            onDelete={handleDeleteCustomer}
          />
        )}

        {view === 'orders' && (
          <Orders 
            orders={orders} 
            products={products}
            customers={customers}
            onCreate={handleCreateOrder}
            onDelete={handleDeleteOrder}
          />
        )}
      </main>

      <Toasts toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
