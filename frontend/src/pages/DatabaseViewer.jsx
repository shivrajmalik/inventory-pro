import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, Users, Package, ShoppingCart, ClipboardList, User } from 'lucide-react';
import { productsAPI, customersAPI, ordersAPI, authAPI } from '../api';

const TABLE_CONFIG = [
  {
    key: 'users',
    label: 'Users',
    icon: User,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/25',
    columns: ['id', 'username'],
    fetch: null, // special case
  },
  {
    key: 'products',
    label: 'Products',
    icon: Package,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/25',
    columns: ['id', 'name', 'sku', 'price', 'quantity'],
    fetch: productsAPI.getAll,
  },
  {
    key: 'customers',
    label: 'Customers',
    icon: Users,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/25',
    columns: ['id', 'name', 'email', 'phone'],
    fetch: customersAPI.getAll,
  },
  {
    key: 'orders',
    label: 'Orders',
    icon: ShoppingCart,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/25',
    columns: ['id', 'customer_id', 'status', 'total_price', 'created_at'],
    fetch: ordersAPI.getAll,
  },
  {
    key: 'order_items',
    label: 'Order Items',
    icon: ClipboardList,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/25',
    columns: ['id', 'order_id', 'product_id', 'quantity', 'unit_price'],
    fetch: null, // derived from orders
  },
];

function formatValue(key, value) {
  if (value === null || value === undefined) return <span className="text-gray-600 italic">null</span>;
  if (key === 'price' || key === 'total_price' || key === 'unit_price') {
    return <span className="text-emerald-400 font-semibold">${parseFloat(value).toFixed(2)}</span>;
  }
  if (key === 'quantity') {
    const n = parseInt(value);
    const cls = n === 0 ? 'text-rose-400 font-bold' : n < 10 ? 'text-orange-400 font-semibold' : 'text-white';
    return <span className={cls}>{n}</span>;
  }
  if (key === 'status') {
    const colors = {
      pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
      completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      cancelled: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    };
    const cls = colors[value] || 'bg-gray-500/15 text-gray-400 border-gray-500/30';
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wider ${cls}`}>{value}</span>;
  }
  if (key === 'created_at') {
    return <span className="text-gray-400 text-xs font-mono">{new Date(value).toLocaleString()}</span>;
  }
  if (key === 'hashed_password') {
    return <span className="text-gray-600 font-mono text-xs">{String(value).substring(0, 20)}…</span>;
  }
  if (key === 'id' || key.endsWith('_id')) {
    return <span className="text-gray-400 font-mono text-sm">#{value}</span>;
  }
  return <span className="text-gray-200">{String(value)}</span>;
}

export default function DatabaseViewer() {
  const [data, setData] = useState({
    users: [], products: [], customers: [], orders: [], order_items: []
  });
  const [activeTable, setActiveTable] = useState('products');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [products, customers, orders] = await Promise.all([
        productsAPI.getAll(),
        customersAPI.getAll(),
        ordersAPI.getAll(),
      ]);

      // Extract order_items from orders
      const orderItems = orders.flatMap(o =>
        (o.items || []).map(item => ({
          id: item.id,
          order_id: o.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }))
      );

      setData({
        users: [{ id: 1, username: 'admin', hashed_password: '••••••••••••••••••••' }],
        products,
        customers,
        orders,
        order_items: orderItems,
      });
      setLastRefresh(new Date());
    } catch (err) {
      console.error('DB Viewer error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const activeConfig = TABLE_CONFIG.find(t => t.key === activeTable);
  const rows = data[activeTable] || [];

  // Dynamically detect columns from actual data
  const detectedColumns = rows.length > 0
    ? Object.keys(rows[0]).filter(k => k !== 'items')
    : activeConfig?.columns || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-400" />
            Database Viewer
          </h1>
          <p className="text-gray-400 mt-1">
            Live view of all database tables · SQLite
            {lastRefresh && (
              <span className="ml-2 text-gray-600 text-xs">
                Last synced: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-semibold transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Table Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {TABLE_CONFIG.map(t => {
          const Icon = t.icon;
          const count = (data[t.key] || []).length;
          const isActive = activeTable === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTable(t.key)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all duration-200 ${
                isActive
                  ? `${t.bg} border-opacity-60 shadow-lg scale-105`
                  : 'bg-white/3 border-white/8 hover:bg-white/6 hover:scale-102'
              }`}
            >
              <div className={`p-2.5 rounded-xl border ${t.bg}`}>
                <Icon className={`w-5 h-5 ${t.color}`} />
              </div>
              <div>
                <p className={`text-sm font-bold ${isActive ? t.color : 'text-gray-300'}`}>{t.label}</p>
                <p className="text-xs text-gray-500">{count} row{count !== 1 ? 's' : ''}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeConfig && (
              <>
                <div className={`p-2 rounded-lg border ${activeConfig.bg}`}>
                  <activeConfig.icon className={`w-4 h-4 ${activeConfig.color}`} />
                </div>
                <div>
                  <h2 className="text-white font-bold">{activeConfig.label}</h2>
                  <p className="text-gray-500 text-xs">{rows.length} record{rows.length !== 1 ? 's' : ''} total</p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-mono bg-white/5 px-3 py-1 rounded-full border border-white/8">
              TABLE: {activeTable}
            </span>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <span className="border-4 border-blue-500/20 border-t-blue-500 h-10 w-10 rounded-full animate-spin" />
              <span className="text-gray-500 text-sm">Loading table data…</span>
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Database className="w-12 h-12 text-gray-700 mb-4" />
            <p className="text-gray-400 font-semibold">Table is empty</p>
            <p className="text-gray-600 text-sm mt-1">No records found in <span className="font-mono text-gray-500">{activeTable}</span></p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  {detectedColumns.map(col => (
                    <th key={col} className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {col.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/3 transition-colors group">
                    {detectedColumns.map(col => (
                      <td key={col} className="py-3.5 px-5 text-sm whitespace-nowrap">
                        {formatValue(col, row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {rows.length > 0 && (
          <div className="px-6 py-3 border-t border-white/5 bg-white/1 flex items-center justify-between">
            <span className="text-xs text-gray-600">{rows.length} row{rows.length !== 1 ? 's' : ''} · {detectedColumns.length} column{detectedColumns.length !== 1 ? 's' : ''}</span>
            <span className="text-xs text-gray-700 font-mono">inventory.db</span>
          </div>
        )}
      </div>
    </div>
  );
}
