import React, { useState } from 'react';
import { Plus, Trash2, X, ShoppingCart, Info, Eye, Trash, User, Package, Calendar, MapPin, ReceiptText } from 'lucide-react';
import { ordersAPI } from '../api';

export default function Orders({ orders, products, customers, onCreate, onDelete }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Create Order States
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [error, setError] = useState('');

  const openCreateModal = () => {
    setCustomerId('');
    setItems([{ product_id: '', quantity: 1 }]);
    setError('');
    setIsCreateOpen(true);
  };

  const handleAddItem = () => {
    setItems([...items, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    if (field === 'product_id') {
      newItems[index].product_id = parseInt(value, 10) || '';
    } else if (field === 'quantity') {
      newItems[index].quantity = Math.max(1, parseInt(value, 10) || 1);
    }
    setItems(newItems);
  };

  // Helper to calculate total amount live
  const calculateLiveTotal = () => {
    let total = 0;
    for (const item of items) {
      if (item.product_id) {
        const prod = products.find((p) => p.id === item.product_id);
        if (prod) {
          total += parseFloat(prod.price) * item.quantity;
        }
      }
    }
    return total.toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!customerId) {
      setError('Please select a customer.');
      return;
    }

    if (items.some((item) => !item.product_id)) {
      setError('Please select a product for all items.');
      return;
    }

    // Client-side stock check before sending
    for (const item of items) {
      const prod = products.find((p) => p.id === item.product_id);
      if (prod && prod.quantity < item.quantity) {
        setError(`Insufficient stock for "${prod.name}". Available: ${prod.quantity}, Requested: ${item.quantity}.`);
        return;
      }
    }

    try {
      await onCreate({
        customer_id: parseInt(customerId, 10),
        items: items.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
        })),
      });
      setIsCreateOpen(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to place order. Try again.');
    }
  };

  const handleViewOrder = async (id) => {
    try {
      const order = await ordersAPI.getOne(id);
      setSelectedOrder(order);
    } catch (err) {
      alert("Failed to fetch invoice details.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to cancel/delete this order? Stocks will be automatically restored.')) {
      try {
        await onDelete(id);
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to delete order.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Orders Board</h1>
          <p className="text-gray-400 mt-1">Generate invoices, trace transactions, and handle stock checkouts.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-gradient px-5 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" /> Create Order
        </button>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="glass-panel py-16 text-center rounded-2xl flex flex-col items-center justify-center">
          <ShoppingCart className="w-16 h-16 text-gray-500 mb-4" />
          <p className="text-gray-300 text-lg font-medium">No Orders Placed Yet</p>
          <p className="text-gray-500 text-sm mt-1">Start by creating products, customers, and placing an order.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Order ID</th>
                  <th className="py-4 px-6 font-semibold">Customer</th>
                  <th className="py-4 px-6 font-semibold">Placing Date</th>
                  <th className="py-4 px-6 font-semibold">Total Invoice</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm text-blue-300">#ORD-{order.id}</span>
                    </td>
                    <td className="py-4 px-6 text-white font-medium">
                      {order.customer?.name || <span className="text-gray-500 italic">Unknown</span>}
                    </td>
                    <td className="py-4 px-6 text-gray-300 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-emerald-400 font-bold">
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleViewOrder(order.id)}
                          className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors"
                          title="View Invoice Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Cancel/Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl glass-panel p-8 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 rounded-2xl">
                  <ReceiptText className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight uppercase">Invoice</h2>
                  <span className="font-mono text-xs text-blue-400 font-bold uppercase tracking-widest">#{selectedOrder.id}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest block mb-1">Issue Date</span>
                <span className="text-white text-sm font-semibold">{new Date(selectedOrder.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Customer Details */}
              <div className="bg-white/2 border border-white/5 p-4 rounded-xl">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Customer Information
                </h3>
                <p className="text-white font-bold">{selectedOrder.customer?.name}</p>
                <p className="text-gray-400 text-sm">{selectedOrder.customer?.email}</p>
                {selectedOrder.customer?.phone && (
                  <p className="text-gray-400 text-sm mt-1">{selectedOrder.customer.phone}</p>
                )}
              </div>

              {/* Summary details */}
              <div className="bg-white/2 border border-white/5 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" /> Items Count
                  </h3>
                  <p className="text-white font-semibold">
                    {selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)} items ordered
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 mt-4">
                  <span className="text-gray-400 text-xs block">Total Invoice Paid</span>
                  <span className="text-xl font-extrabold text-emerald-400">
                    ${parseFloat(selectedOrder.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-white/5 rounded-xl overflow-hidden mb-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/2 text-xs text-gray-400 uppercase font-semibold">
                    <th className="p-3">Product</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Quantity</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {selectedOrder.items.map((item) => (
                    <tr key={item.id} className="hover:bg-white/2 transition-colors">
                      <td className="p-3 text-white font-medium">{item.product?.name}</td>
                      <td className="p-3 font-mono text-xs text-blue-300">{item.product?.sku}</td>
                      <td className="p-3 text-right text-gray-300">
                        ${parseFloat(item.product?.price || 0).toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-white font-semibold">{item.quantity}</td>
                      <td className="p-3 text-right text-emerald-400 font-bold">
                        ${(parseFloat(item.product?.price || 0) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 rounded-xl font-semibold transition"
              >
                Close Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl glass-panel p-8 rounded-2xl shadow-2xl relative my-8">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">Create New Order Invoice</h2>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Select Customer */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Bill To Customer
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input focus:outline-none"
                  required
                >
                  <option value="" disabled className="bg-[#0b0f19]">Select a customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0b0f19]">
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Invoice Line Items
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Product Item
                  </button>
                </div>

                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {items.map((item, index) => {
                    const selectedProd = products.find(p => p.id === item.product_id);
                    return (
                      <div key={index} className="flex gap-3 items-end bg-white/2 border border-white/5 p-3 rounded-xl">
                        {/* Select Product */}
                        <div className="flex-1">
                          <label className="block text-[10px] text-gray-500 uppercase font-semibold mb-1">
                            Product
                          </label>
                          <select
                            value={item.product_id}
                            onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg glass-input text-sm focus:outline-none"
                            required
                          >
                            <option value="" disabled className="bg-[#0b0f19]">Select product</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id} disabled={p.quantity === 0} className="bg-[#0b0f19]">
                                {p.name} - ${parseFloat(p.price).toFixed(2)} ({p.quantity === 0 ? 'Out of Stock' : `${p.quantity} avail.`})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div className="w-24">
                          <label className="block text-[10px] text-gray-500 uppercase font-semibold mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg glass-input text-sm focus:outline-none text-center"
                            required
                          />
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          disabled={items.length === 1}
                          className="p-2.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div>
                  <span className="text-xs text-gray-400 block uppercase font-semibold">Grand Total</span>
                  <span className="text-3xl font-extrabold text-emerald-400">${calculateLiveTotal()}</span>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-5 py-3 border border-white/10 text-gray-300 rounded-xl font-semibold hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-gradient px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition"
                  >
                    Checkout Order
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
