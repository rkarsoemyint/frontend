import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, Settings, 
  LogOut, Menu, X, Lock, Mail, Eye, EyeOff, Plus, Trash2, Edit 
} from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || "https://backend-kl3x.onrender.com";
const API_BASE_URL = API_URL;
axios.defaults.baseURL = API_BASE_URL;

// Token check for Axios Global
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Types for TypeScript
interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

function NavItem({ to, icon, label }: { to: string, icon: any, label: string }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-3 px-6 py-3 transition ${
      active ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-500 hover:bg-gray-50'
    }`}>
      {icon} <span className="font-medium">{label}</span>
    </Link>
  );
}

function StatCard({ title, value, change, color }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <h4 className="text-2xl font-bold">{value}</h4>
      <span className={`text-xs ${color}`}>{change}</span>
    </div>
  );
}

function DashboardHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashData = async () => {
      try {
        const [pRes, oRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/orders')
        ]);
        setProducts(pRes.data || []);
        setOrders(oRes.data || []);
      } catch (err) { console.error(err); }
    };
    fetchDashData();
  }, []);

  const revenue = orders.filter(o => o.status !== 'Cancelled').reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Revenue" value={`$${revenue.toLocaleString()}`} change="Live Updates" color="text-green-600" />
        <StatCard title="Orders" value={orders.length.toString()} change="Current Month" color="text-blue-600" />
        <StatCard title="Products" value={products.length.toString()} change="In Inventory" color="text-purple-600" />
      </div>
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-lg mb-2">Welcome Back, Admin!</h3>
        <p className="text-gray-500">လုပ်ငန်းစဉ်တွေကို ဒီကနေ စီမံခန့်ခွဲနိုင်ပါတယ်ဗျာ။</p>
      </div>
    </div>
  );
}

function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    image: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/products/categories')
      ]);
      setProducts(pRes.data || []);
      setCategories(cRes.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Modal ဖွင့်တဲ့အခါ Data အဟောင်းရှိရင် ဖြည့်ပေးဖို့
  const openModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        category: product.category,
        stock: (product.stock || 0).toString(),
        image: product.image || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', category: '', stock: '', image: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };

      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, payload);
      } else {
        await axios.post('/api/products', payload);
      }
      
      fetchData(); // စာရင်းပြန်ဆွဲမယ်
      setIsModalOpen(false); // Modal ပိတ်မယ်
    } catch (err) {
      alert("Product သိမ်းရတာ အဆင်မပြေပါဘူး။ Data ပြန်စစ်ပေးပါဦး။");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("ဒီ Product ကို ဖျက်မှာ သေချာလား?")) {
      try {
        await axios.delete(`/api/products/${id}`);
        fetchData();
      } catch (err) {
        alert("ဖျက်လို့မရပါဘူး။");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500">Manage your inventory items</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-100 transition-all"
        >
          <Plus size={20} /> Add New Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 italic text-gray-400">Loading products...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Product Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                        <img src={p.image || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-gray-700">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">{p.category}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">${p.price.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${p.stock > 10 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {p.stock} left
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => openModal(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(p._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="text-center py-10 text-gray-400">No products found.</p>}
        </div>
      )}

      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-extrabold mb-6 text-gray-800">
              {editingProduct ? "Update Product" : "Add New Product"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Product Name</label>
                  <input required className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Price ($)</label>
                  <input required type="number" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Stock</label>
                  <input required type="number" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Category</label>
                  <select required className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Image URL (Optional)</label>
                  <input className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="https://..." value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    axios.get('/api/orders').then(res => setOrders(res.data || []));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Order History</h2>
      <div className="bg-white rounded-xl border">
        {orders.map((o: any) => (
          <div key={o._id} className="p-4 border-b last:border-0 flex justify-between items-center">
            <div>
              <p className="font-bold">Order #{o._id.slice(-5)}</p>
              <p className="text-sm text-gray-500">{o.customerName}</p>
            </div>
            <p className="font-bold text-blue-600">${o.totalAmount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomersPage() {
  return <div className="p-8 font-bold">Customers data will be listed here.</div>;
}

function ProfilePage({ user }: any) {
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Profile</h2>
      <div className="space-y-4">
        <div><label className="text-xs text-gray-400 font-bold uppercase">Name</label><p className="text-lg font-medium">{user?.name}</p></div>
        <div><label className="text-xs text-gray-400 font-bold uppercase">Email</label><p className="text-lg font-medium">{user?.email}</p></div>
      </div>
    </div>
  );
}

function SettingsPage() {
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // လက်ရှိ ဆိုင်နာမည်ကို Backend ကနေ အရင်ဆွဲထုတ်မယ်
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/settings');
        if (res.data && res.data.storeName) {
          setStoreName(res.data.storeName);
        }
      } catch (err) {
        console.log("Settings fetching error - using default");
        setStoreName("MyStore Admin");
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Backend ကို သိမ်းခိုင်းမယ်
      await axios.post('/api/settings', { storeName });
      setMessage("Settings updated successfully! ✅");
      
      // Sidebar က နာမည်ပါချက်ချင်းပြောင်းအောင် Page ကို Refresh လုပ်ပေးမယ်
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setMessage("Error updating settings. ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="text-blue-600" size={28} />
        <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Store Display Name
              </label>
              <input 
                type="text"
                className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg"
                placeholder="Enter your store name..."
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
              />
              <p className="mt-2 text-sm text-gray-400">
                Sidebar နဲ့ Dashboard မှာ ပေါ်မယ့် ဆိုင်နာမည် ဖြစ်ပါတယ်။
              </p>
            </div>

            {message && (
              <div className={`p-4 rounded-lg font-medium text-sm ${message.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}

            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                }`}
              >
                {loading ? "Saving Changes..." : "Save All Changes"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-gray-50 p-6 border-t border-gray-100">
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">System Info</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Version</p>
              <p className="text-sm font-bold text-gray-700">v1.0.0 Stable</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Environment</p>
              <p className="text-sm font-bold text-green-600">Production</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginPage({ onLogin }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      onLogin(res.data.user);
    } catch (err) { alert("Login failed"); }
  };
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center text-blue-600">Admin Login</h2>
        <input className="w-full p-3 border rounded-xl" placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input className="w-full p-3 border rounded-xl" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
        <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Login</button>
      </form>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [siteName, setSiteName] = useState("MyStore Admin");

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/settings');
        if (res.data && res.data.storeName) {
          setSiteName(res.data.storeName);
        }
      } catch (err) {
        console.log("Using default site name");
      }
    };
    fetchSettings();
  }, []);

  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r hidden md:flex flex-col">
          <div className="p-6 text-2xl font-bold text-blue-600 border-b truncate">
            {siteName}
          </div>
          
          <nav className="flex-1 mt-4">
            <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <NavItem to="/products" icon={<Package size={20} />} label="Products" />
            <NavItem to="/orders" icon={<ShoppingCart size={20} />} label="Orders" />
            <NavItem to="/customers" icon={<Users size={20} />} label="Customers" />
            <NavItem to="/profile" icon={<Users size={20} />} label="Profile" />
            <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
          </nav>

          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Developed By</p>
            <p className="text-sm font-bold text-gray-700">Thant Zin Oo</p>
          </div>

          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="p-6 text-red-500 font-bold flex items-center gap-2 border-t">
            <LogOut size={20} /> Logout
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-white border-b flex items-center justify-between px-8">
            <span className="font-bold text-gray-400 uppercase tracking-tighter text-xs">Admin Control Panel</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">{user.name}</span>
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          <div className="p-8 overflow-y-auto">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/products" element={<ProductPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/profile" element={<ProfilePage user={user} />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
