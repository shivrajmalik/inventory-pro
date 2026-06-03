import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, PackageOpen, Eye } from 'lucide-react';

export default function Products({ products, onCreate, onUpdate, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setSku('');
    setPrice('');
    setQuantity('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setSku(product.sku);
    setPrice(product.price);
    setQuantity(product.quantity);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !sku.trim()) {
      setError('Product Name and SKU are required.');
      return;
    }

    const priceNum = parseFloat(price);
    const qtyNum = parseInt(quantity, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      setError('Price must be a positive number.');
      return;
    }

    if (isNaN(qtyNum) || qtyNum < 0) {
      setError('Stock quantity cannot be negative.');
      return;
    }

    try {
      if (editingProduct) {
        await onUpdate(editingProduct.id, { name, sku, price: priceNum, quantity: qtyNum });
      } else {
        await onCreate({ name, sku, price: priceNum, quantity: qtyNum });
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save product. Please make sure SKU is unique.');
    }
  };

  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const handleViewProduct = async (id) => {
    try {
      const prod = await productsAPI.getOne(id);
      setSelectedProduct(prod);
    } catch (err) {
      alert("Failed to fetch product details.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product? This may impact active orders.')) {
      try {
        await onDelete(id);
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to delete product.');
      }
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Product Inventory</h1>
          <p className="text-gray-400 mt-1">Manage and track your products, prices, and stock counts.</p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-gradient px-5 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      {/* Control Bar */}
      <div className="glass-panel p-4 rounded-xl flex items-center">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Product Name or SKU..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input focus:outline-none"
          />
        </div>
      </div>

      {/* Grid or Empty view */}
      {filteredProducts.length === 0 ? (
        <div className="glass-panel py-16 text-center rounded-2xl flex flex-col items-center justify-center">
          <PackageOpen className="w-16 h-16 text-gray-500 mb-4" />
          <p className="text-gray-300 text-lg font-medium">No Products Found</p>
          <p className="text-gray-500 text-sm mt-1">Try creating a product or adjusting your search term.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Product Detail</th>
                  <th className="py-4 px-6 font-semibold">SKU / Code</th>
                  <th className="py-4 px-6 font-semibold">Unit Price</th>
                  <th className="py-4 px-6 font-semibold">Inventory Level</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-6">
                      <span className="text-white font-semibold block">{prod.name}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm text-blue-300">{prod.sku}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-300">
                      ${parseFloat(prod.price).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          prod.quantity === 0 
                            ? 'bg-rose-500 shadow-md shadow-rose-500/50' 
                            : prod.quantity < 10 
                              ? 'bg-orange-500 shadow-md shadow-orange-500/50' 
                              : 'bg-emerald-500'
                        }`}></span>
                        <span className={`font-medium ${
                          prod.quantity === 0 
                            ? 'text-rose-400' 
                            : prod.quantity < 10 
                              ? 'text-orange-400' 
                              : 'text-gray-200'
                        }`}>
                          {prod.quantity} units
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleViewProduct(prod.id)}
                          className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Delete Product"
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel p-8 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">
              {editingProduct ? 'Update Product Details' : 'Add New Product'}
            </h2>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wireless Mouse"
                  className="w-full px-4 py-3 rounded-xl glass-input focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  SKU / Unique Code
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. MS-WIRE-09"
                  className="w-full px-4 py-3 rounded-xl glass-input focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl glass-input focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl glass-input focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-white/10 text-gray-300 rounded-xl font-semibold hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-white btn-gradient rounded-xl font-semibold hover:opacity-90 transition"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel p-8 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 mb-6 pt-2">
              <div className="p-3 bg-blue-500/20 rounded-2xl">
                <PackageOpen className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white leading-tight">{selectedProduct.name}</h2>
                <span className="font-mono text-sm text-blue-300">SKU: {selectedProduct.sku}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white/2 border border-white/5 p-4 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Unit Price</p>
                <p className="text-2xl font-extrabold text-emerald-400">${parseFloat(selectedProduct.price).toFixed(2)}</p>
              </div>
              <div className="bg-white/2 border border-white/5 p-4 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Stock Level</p>
                <p className={`text-2xl font-extrabold ${selectedProduct.quantity < 10 ? 'text-orange-400' : 'text-blue-400'}`}>
                  {selectedProduct.quantity} units
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedProduct(null)}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 rounded-xl font-semibold transition"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
