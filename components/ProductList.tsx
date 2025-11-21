import React, { useState } from 'react';
import { Product, UserRole } from '../types';
import { parseProductInfoWithAI } from '../services/geminiService';

interface ProductListProps {
  products: Product[];
  role: UserRole;
  onAddProduct: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, role, onAddProduct }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // Add Product Form State
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    model: '', name: '', price: 0, weight: '', size: '', 
    qtyPerCarton: 1, cartonSize: '', grossWeight: 0, description: ''
  });
  const [rawPaste, setRawPaste] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Calculator State (Tracking input per product ID)
  const [calcInputs, setCalcInputs] = useState<Record<string, number>>({});

  const handleAIParse = async () => {
    if (!rawPaste) return;
    setIsParsing(true);
    try {
      const result = await parseProductInfoWithAI(rawPaste);
      setNewProduct(prev => ({
        ...prev,
        ...result,
        // Ensure numbers are valid
        price: result.price || 0,
        qtyPerCarton: result.qtyPerCarton || 1,
        grossWeight: result.grossWeight || 0
      }));
    } catch (e) {
      alert("AI 解析失败");
    } finally {
      setIsParsing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.model) return;

    const product: Product = {
      id: Date.now().toString(),
      image: previewImage || 'https://via.placeholder.com/150',
      ...(newProduct as Product),
      qtyPerCarton: Number(newProduct.qtyPerCarton) || 1,
      grossWeight: Number(newProduct.grossWeight) || 0,
      price: Number(newProduct.price) || 0
    };
    onAddProduct(product);
    setShowAddModal(false);
    setNewProduct({});
    setPreviewImage(null);
    setRawPaste('');
  };

  // CBM Calculation Logic
  const calculatePacking = (product: Product, qty: number) => {
    if (!qty) return null;
    const cartons = Math.ceil(qty / (product.qtyPerCarton || 1));
    
    // Rough parsing logic looking for 3 numbers
    let cbmPerCarton = 0.05; // fallback
    const dims = product.cartonSize?.match(/(\d+(\.\d+)?)/g);
    if (dims && dims.length >= 3) {
        // Assuming cm
        const l = parseFloat(dims[0]) / 100;
        const w = parseFloat(dims[1]) / 100;
        const h = parseFloat(dims[2]) / 100;
        cbmPerCarton = l * w * h;
    }

    const totalCBM = cartons * cbmPerCarton;
    const totalWeight = cartons * (product.grossWeight || 0);

    return { cartons, totalCBM, totalWeight };
  };

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase().trim();
    const matchesTerm = !term || 
                        p.model.toLowerCase().includes(term) || 
                        p.name.toLowerCase().includes(term);
    
    const price = p.price;
    const min = minPrice !== '' ? parseFloat(minPrice) : -Infinity;
    const max = maxPrice !== '' ? parseFloat(maxPrice) : Infinity;
    const matchesPrice = price >= min && price <= max;

    return matchesTerm && matchesPrice;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">产品目录 (Product Catalog)</h2>
        {role === 'SALES' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            添加产品
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            type="text" 
            placeholder="搜索产品型号或名称..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
           <span className="text-sm font-medium text-slate-600 whitespace-nowrap">价格 ($):</span>
           <input 
             type="number" 
             placeholder="Min" 
             value={minPrice}
             onChange={(e) => setMinPrice(e.target.value)}
             className="w-20 md:w-24 border border-slate-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-center"
           />
           <span className="text-slate-400">-</span>
           <input 
             type="number" 
             placeholder="Max" 
             value={maxPrice}
             onChange={(e) => setMaxPrice(e.target.value)}
             className="w-20 md:w-24 border border-slate-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-center"
           />
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
         <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <svg className="w-16 h-16 text-slate-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-slate-500">没有找到匹配的产品</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(p => {
            const calc = calculatePacking(p, calcInputs[p.id]);
            return (
              <div key={p.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="relative aspect-video bg-slate-100 group">
                    <img src={p.image} alt={p.model} className="w-full h-full object-contain" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-white">
                      <h3 className="font-bold text-lg">{p.model}</h3>
                      <p className="text-xs opacity-90 truncate">{p.name}</p>
                    </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div className="bg-slate-50 p-1 rounded">单价: <span className="font-bold text-green-600">${p.price}</span></div>
                      <div className="bg-slate-50 p-1 rounded">装箱: <span className="font-bold">{p.qtyPerCarton}</span> pcs/ctn</div>
                      <div className="bg-slate-50 p-1 rounded">箱规: {p.cartonSize || '-'}</div>
                      <div className="bg-slate-50 p-1 rounded">单箱重: {p.grossWeight}kg</div>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                    
                    {/* Calculator Area */}
                    {role === 'SALES' && (
                      <div className="mt-auto pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <label className="text-xs font-bold text-blue-800">模拟订货数:</label>
                            <input 
                              type="number" 
                              className="w-20 px-2 py-1 text-sm border border-blue-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                              placeholder="Qty"
                              onChange={(e) => setCalcInputs(prev => ({ ...prev, [p.id]: parseInt(e.target.value) }))}
                            />
                        </div>
                        {calc && (
                            <div className="bg-blue-50 p-2 rounded text-xs space-y-1 animate-fade-in">
                              <div className="flex justify-between">
                                  <span className="text-slate-600">总箱数:</span>
                                  <span className="font-bold text-blue-700">{calc.cartons} ctns</span>
                              </div>
                              <div className="flex justify-between">
                                  <span className="text-slate-600">总体积:</span>
                                  <span className="font-bold text-blue-700">{calc.totalCBM.toFixed(3)} CBM</span>
                              </div>
                              <div className="flex justify-between">
                                  <span className="text-slate-600">总毛重:</span>
                                  <span className="font-bold text-blue-700">{calc.totalWeight.toFixed(1)} kg</span>
                              </div>
                            </div>
                        )}
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="text-xl font-bold text-slate-800">录入新产品</h3>
                 <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              
              <div className="p-6 space-y-6">
                 {/* AI Section */}
                 <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <label className="block text-sm font-bold text-purple-800 mb-2 flex items-center gap-2">
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                       智能识别 (复制 supplier 聊天记录)
                    </label>
                    <div className="flex gap-2">
                       <textarea 
                          className="flex-1 text-sm p-2 border border-purple-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-300 h-20 resize-none"
                          placeholder="粘贴产品信息，例如: Model 5w1, 50pcs/ctn, 60*40*30cm, 20kg..."
                          value={rawPaste}
                          onChange={e => setRawPaste(e.target.value)}
                       />
                       <button 
                          onClick={handleAIParse}
                          disabled={isParsing}
                          className="bg-purple-600 text-white px-4 rounded font-bold text-sm hover:bg-purple-700 disabled:bg-purple-300 flex flex-col items-center justify-center min-w-[80px]"
                       >
                          {isParsing ? (
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          ) : (
                            '填充'
                          )}
                       </button>
                    </div>
                 </div>

                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                       <div className="w-full md:w-32 h-32 bg-slate-100 rounded border-2 border-dashed border-slate-300 flex items-center justify-center relative overflow-hidden group flex-shrink-0 hover:border-blue-400 transition-colors">
                          {previewImage ? (
                             <>
                               <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
                               <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition-opacity">
                                 更换图片
                               </div>
                             </>
                          ) : (
                             <div className="text-center">
                               <svg className="w-8 h-8 text-slate-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                               <span className="text-xs text-slate-500 mt-1 block">点击上传</span>
                             </div>
                          )}
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                       </div>
                       <div className="flex-1 space-y-3">
                          <div>
                             <label className="block text-xs font-bold text-slate-600 mb-1">型号 (Model) *</label>
                             <input required type="text" value={newProduct.model} onChange={e => setNewProduct(p => ({...p, model: e.target.value}))} className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-slate-600 mb-1">名称 (Name)</label>
                             <input type="text" value={newProduct.name} onChange={e => setNewProduct(p => ({...p, name: e.target.value}))} className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold text-slate-600 mb-1">建议单价 ($)</label>
                             <input type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct(p => ({...p, price: parseFloat(e.target.value)}))} className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-600 mb-1">产品尺寸</label>
                             <input type="text" value={newProduct.size} onChange={e => setNewProduct(p => ({...p, size: e.target.value}))} className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 bg-slate-50 p-3 rounded border border-slate-200">
                        <div>
                             <label className="block text-xs font-bold text-slate-600 mb-1">每箱数量</label>
                             <input type="number" value={newProduct.qtyPerCarton} onChange={e => setNewProduct(p => ({...p, qtyPerCarton: parseInt(e.target.value)}))} className="w-full border border-slate-300 rounded px-2 py-1.5 text-center" />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-600 mb-1">外箱尺寸</label>
                             <input type="text" placeholder="60x40x30" value={newProduct.cartonSize} onChange={e => setNewProduct(p => ({...p, cartonSize: e.target.value}))} className="w-full border border-slate-300 rounded px-2 py-1.5 text-center" />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-600 mb-1">整箱毛重</label>
                             <input type="number" step="0.1" value={newProduct.grossWeight} onChange={e => setNewProduct(p => ({...p, grossWeight: parseFloat(e.target.value)}))} className="w-full border border-slate-300 rounded px-2 py-1.5 text-center" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">描述 / 配件</label>
                        <textarea rows={2} value={newProduct.description} onChange={e => setNewProduct(p => ({...p, description: e.target.value}))} className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">保存产品</button>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;