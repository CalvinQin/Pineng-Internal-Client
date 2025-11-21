import React from 'react';
import { Product } from '../types';

interface ProductSelectorProps {
  products: Product[];
  onSelect: (product: Product) => void;
  onClose: () => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ products, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">选择产品 (Select Product)</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {products.length === 0 ? (
            <div className="text-center py-10 text-slate-400">暂无产品，请先在产品列表添加。</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div 
                  key={product.id}
                  onClick={() => onSelect(product)}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-400 transition-all cursor-pointer group"
                >
                  <div className="aspect-square bg-slate-100 relative">
                    <img src={product.image} alt={product.model} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors" />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800">{product.model}</h4>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-mono font-bold">${product.price}</span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3 h-10">{product.description}</p>
                    <div className="flex gap-2 text-xs text-slate-400">
                      <span className="bg-slate-100 px-2 py-1 rounded">Wt: {product.weight}</span>
                      <span className="bg-slate-100 px-2 py-1 rounded">Box: {product.qtyPerCarton}pcs</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSelector;