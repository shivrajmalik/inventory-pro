import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  LogOut, 
  Activity,
  User,
  RefreshCw,
  Menu,
  X
} from 'lucide-react';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import DatabaseViewer from './pages/DatabaseViewer';
import Toasts from './components/Toasts';

import { authAPI, productsAPI, customersAPI, ordersAPI, statsAPI } from './api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard'); // dashboard, products, customers, orders
  const [loading, setLoading] = useState(false);
  
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);

  const [toasts, setToasts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Authenticate / fetch user
  useEffect(() => {
    if (token) {
      authAPI.me()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        });
    }
  }, [token]);

  // Fetch all data
  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        statsAPI.getStats(),
        productsAPI.getAll(),
        customersAPI.getAll(),
        ordersAPI.getAll()
      ]).then(([s, p, c, o]) => {
        setStats(s);
        setProducts(p);
        setCustomers(c);
        setOrders(o);
      }).finally(() => setLoading(false));
    }
  }, [user, refreshKey]);

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Toast actions
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Product actions
  const handleCreateProduct = async (data) => {
    await productsAPI.create(data);
    addToast('Product created successfully');
    triggerRefresh();
  };

  const handleUpdateProduct = async (id, data) => {
    await productsAPI.update(id, data);
    addToast('Product updated successfully');
    triggerRefresh();
  };

  const handleDeleteProduct = async (id) => {
    await productsAPI.delete(id);
    addToast('Product deleted', 'warning');
    triggerRefresh();
  };

  // Customer actions
  const handleCreateCustomer = async (data) => {
    await customersAPI.create(data);
    addToast('Customer profile created!', 'success');
    triggerRefresh();
  };

  const handleUpdateCustomer = async (id, data) => {
    await customersAPI.update(id, data);
    addToast('Customer updated successfully');
    triggerRefresh();
  };

  const handleDeleteCustomer = async (id) => {
    await customersAPI.delete(id);
    addToast('Customer profile deleted', 'warning');
    triggerRefresh();
  };

  // Order actions
  const handleCreateOrder = async (data) => {
    try {
      await ordersAPI.create(data);
      addToast('Order placed successfully!', 'success');
      triggerRefresh();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to place order', 'error');
    }
  };

  const handleDeleteOrder = async (id) => {
    await ordersAPI.delete(id);
    addToast('Order cancelled and stock restored', 'warning');
    triggerRefresh();
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#080b11] relative text-gray-200">
      {/* Background radial lights */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Mobile Header */}
      <header className="lg:hidden h-16 flex items-center justify-between px-6 border-b border-white/5 relative z-50 bg-[#080b11]/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Inventory<span className="text-blue-400">Pro</span></span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar - Desktop and Mobile Overlay */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-[#0a0d16]/95 lg:bg-[#0a0d16] border-r border-white/5 flex flex-col justify-between shrink-0 transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
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
                  onClick={() => {
                    setView(link.viewName);
                    setIsSidebarOpen(false);
                  }}
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

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <main className="grow p-4 md:p-8 lg:p-10 overflow-y-auto relative z-10 w-full">
        {loading && (
          <div className="absolute inset-0 bg-[#080b11]/50 backdrop-blur-xs flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-3">
              <span className="border-4 border-blue-500/20 border-t-blue-500 h-10 w-10 rounded-full animate-spin"></span>
              <span className="text-xs text-gray-400 font-semibold tracking-widest uppercase">Syncing portal...</span>
            </div>
          </div>
        )}

        <div className="max-w-[1600px] mx-auto">
            {view === 'dashboard' && stats && <Dashboard stats={stats} setView={setView} />}
          {view === 'dashboard' && !stats && (
            <div className="flex flex-col items-center justify-center py-20 grayscale opacity-30">
              <RefreshCw className="w-12 h-12 animate-spin mb-4" />
              <p className="font-bold tracking-widest uppercase text-xs">Awaiting Statistics...</p>
            </div>
          )}
          
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

          {view === 'database' && (
            <DatabaseViewer />
          )}
        </div>
      </main>

      <Toasts toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
