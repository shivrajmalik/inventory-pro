import React from 'react';
import { Package, Users, ShoppingCart, AlertTriangle, ArrowRight } from 'lucide-react';

export default function Dashboard({ stats, setView }) {
  const cards = [
    {
      title: 'Total Products',
      value: stats.total_products,
      icon: Package,
      color: 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30',
      action: () => setView('products')
    },
    {
      title: 'Total Customers',
      value: stats.total_customers,
      icon: Users,
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
      action: () => setView('customers')
    },
    {
      title: 'Total Orders',
      value: stats.total_orders,
      icon: ShoppingCart,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      action: () => setView('orders')
    },
    {
      title: 'Low Stock Alert',
      value: stats.low_stock_products.length,
      icon: AlertTriangle,
      color: stats.low_stock_products.length > 0 
        ? 'from-rose-500/20 to-orange-500/20 text-rose-400 border-rose-500/30 animate-pulse'
        : 'from-gray-500/10 to-gray-500/10 text-gray-400 border-white/10',
      action: null
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 mt-1">Real-time statistics and stock alerts at a glance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`glass-card p-6 rounded-2xl flex flex-col justify-between border relative overflow-hidden group ${
                card.action ? 'cursor-pointer' : ''
              }`}
              onClick={card.action || undefined}
            >
              {/* Subtle background glow */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:scale-150 transition-all duration-500"></div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-3 rounded-xl bg-gradient-to-tr border ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {card.value}
                </span>
                {card.action && (
                  <span className="text-xs text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Manage <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Low Stock Panel */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-rose-500/15 border border-rose-500/25 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Critical Stock Warnings</h2>
            <p className="text-sm text-gray-400">Products with less than 10 units in stock</p>
          </div>
        </div>

        {stats.low_stock_products.length === 0 ? (
          <div className="text-center py-8 bg-white/2 rounded-xl border border-white/5">
            <p className="text-gray-400">All products are healthy. No low stock items detected.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-4 font-semibold">Product Name</th>
                  <th className="py-4 px-4 font-semibold">SKU</th>
                  <th className="py-4 px-4 font-semibold">Price</th>
                  <th className="py-4 px-4 font-semibold">Current Stock</th>
                  <th className="py-4 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.low_stock_products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-4 text-white font-medium">{prod.name}</td>
                    <td className="py-4 px-4 font-mono text-sm text-blue-300">{prod.sku}</td>
                    <td className="py-4 px-4 text-gray-300">${parseFloat(prod.price).toFixed(2)}</td>
                    <td className="py-4 px-4 font-semibold">
                      <span className={prod.quantity === 0 ? 'text-rose-400' : 'text-orange-400'}>
                        {prod.quantity} units
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        prod.quantity === 0 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      }`}>
                        {prod.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
