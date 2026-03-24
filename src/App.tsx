import { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Menu, X } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-kl3x.onrender.com';

axios.defaults.baseURL = API_BASE_URL;

const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// --- Main App Component ---
function App() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [siteName, setSiteName] = useState("MyStore Admin");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("User data parse error");
      }
    }

    const fetchSettings = async () => {
      try {
        
        const res = await axios.get(`${API_URL}/api/settings`);
        
        if (res.data && res.data.storeName) {
          setSiteName(res.data.storeName);
        }
      } catch (err) {
        console.log("Backend offline - using default settings");
      } finally {
        setLoading(false); 
      }
    };

    fetchSettings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-blue-600 font-bold">Loading...</div>;

  if (!user) {
    return isRegistering ? (
      <RegisterPage onSwitch={() => setIsRegistering(false)} />
    ) : (
      <LoginPage 
        onLogin={(userData: any) => setUser(userData)} 
        onSwitch={() => setIsRegistering(true)} 
      />
    );
  }

  return (
  <Router>
    
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:flex md:flex-col
      `}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">{siteName}</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <nav className="mt-6 flex-1 px-4 space-y-1">
          
          <div onClick={() => setIsSidebarOpen(false)}>
            <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <NavItem to="/products" icon={<Package size={20} />} label="Products" />
            <NavItem to="/orders" icon={<ShoppingCart size={20} />} label="Orders" />
            <NavItem to="/customers" icon={<Users size={20} />} label="Customers" />
            <NavItem to="/profile" icon={<Users size={20} />} label="Profile" />
            <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
          </div>
        </nav>

        
<div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
  <div className="flex flex-col gap-1">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
      Developed By
    </p>
    <p className="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors cursor-default">
      Thant Zin Oo
    </p>
    <div className="flex items-center gap-2 mt-1">
      <span className="flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
      <p className="text-[11px] text-gray-500 font-medium">v1.0.0 Stable</p>
    </div>
  </div>
</div>

        <button onClick={handleLogout} className="p-6 text-red-500 font-bold flex items-center gap-2 hover:bg-red-50 border-t mt-auto">
          <LogOut size={20} /> Logout
        </button>
      </aside>

     
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 w-full">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 truncate">
              Admin Panel
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm font-medium text-gray-700">
              {user?.name || "Guest"}
            </span>
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "G"}
            </div>
          </div>
        </header>

        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/profile" element={<ProfilePage user={user} />} />
            <Route path="/settings" element={<SettingsPage user={user} setUser={setUser} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  </Router>
);
}


// --- Dashboard Home Page ---
function DashboardHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]); 

 
    
    useEffect(() => {
  const fetchData = async () => {
    try {
      
      const [pRes, oRes] = await Promise.all([
        axios.get(`${API_URL}/api/products`),
        axios.get(`${API_URL}/api/orders`)
      ]);

      setProducts(pRes.data);
      setOrders(oRes.data);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      
    }
  };

  fetchData();
}, []);

  const potentialRevenue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const actualRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const activeOrdersCount = orders.filter(o => o.status !== 'Cancelled').length;

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <StatCard 
          title="Actual Revenue" 
          value={`$${actualRevenue.toLocaleString()}`} 
          change="Real-time" 
          color="text-green-600" 
        />
        
        <StatCard 
          title="Total Orders" 
          value={activeOrdersCount.toString()} 
          change={orders.length > activeOrdersCount ? `(-${orders.length - activeOrdersCount} cancelled)` : "Update"} 
          color="text-blue-600" 
        />

        <StatCard 
          title="Total Products" 
          value={products.length.toString()} 
          change="In Stock" 
          color="text-purple-600" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4">Inventory Value</h3>
          <p className="text-3xl font-bold text-gray-800">${potentialRevenue.toLocaleString()}</p>
          <p className="text-gray-500 text-sm mt-2">လက်ရှိရှိနေတဲ့ ပစ္စည်းတွေအကုန်ရောင်းရရင် ရမယ့်ငွေ</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
          <p className="text-gray-500">
            လက်ရှိမှာ <span className="text-blue-600 font-bold">{activeOrdersCount}</span> ခုသော အော်ဒါများကို စီမံနေပါသည်။
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Product Page ---- //

// --- Product Page Component ---
function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ _id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const authAxios = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        axios.get(`${API_URL}/api/products`),
        axios.get(`${API_URL}/api/products/categories`)
      ]);
      setProducts(pRes.data);
      setCategories(cRes.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (formData: any) => {
    try {
      if (editingProduct) {
        await authAxios.put(`/api/products/${editingProduct._id}`, formData);
      } else {
        await authAxios.post('/api/products', formData);
      }
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      alert("ဒေတာသိမ်းလို့ မရပါဘူးခင်ဗျာ။ (Login ပြန်ဝင်ကြည့်ပါ)");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this product?")) {
      try {
        await authAxios.delete(`/api/products/${id}`);
        fetchData();
      } catch (err) {
        alert("ဖျက်လို့ မရပါဘူးခင်ဗျာ။");
      }
    }
  };

  const handleBuy = async (product: Product) => {
  try {
    const orderData = {
      customerName: "Customer", 
      items: [{
        productId: product._id,
        name: product.name,
        quantity: 1,
        price: product.price
      }],
      totalAmount: product.price,
      status: "Pending"
    };

    
    await axios.post(`${API_URL}/api/orders`, orderData); 
    
    alert(`${product.name} ကို ဝယ်ယူပြီးပါပြီ။`);
    fetchData();
  } catch (error) {
    console.error("Order error:", error);
    alert("အော်ဒါတင်လို့ မရပါဘူးခင်ဗျာ။");
  }
};

  return (
    <div className="p-8">
      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <ProductTable 
          products={products} 
          onOpenModal={() => { setEditingProduct(null); setIsModalOpen(true); }} 
          onEdit={(p: Product) => { setEditingProduct(p); setIsModalOpen(true); }} 
          onDelete={handleDelete} 
          onBuy={handleBuy}
        />
      )}
      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        initialData={editingProduct}
        categories={categories}
        onRefreshCategories={() => fetchData()}
      />
    </div>
  );
}
// --- Orders Page ---
function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products/orders`);
      setOrders(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await axios.patch(`${API_URL}/api/products/orders/${id}`, { status: newStatus });
    fetchOrders(); 
  };

  const activeOrders = orders.filter(order => order.status !== 'Cancelled');

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Active Orders</h3>
        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
          Total: {activeOrders.length}
        </span>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
            <tr className="text-left border-b border-gray-100">
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Items</th> 
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
  {activeOrders.map((order) => (
    <tr key={order._id} className="hover:bg-gray-50 transition">
     
      <td className="px-6 py-4 font-bold text-gray-700 text-sm">
        #{order.orderId || order._id.slice(-5)}
      </td>

     
      <td className="px-6 py-4 font-medium text-sm">
        {order.customerName || "Anonymous Customer"}
      </td>

      <td className="px-6 py-4 text-sm">
  {order.items && order.items.length > 0 ? (
    <div className="flex flex-col gap-1">
      {order.items.map((item: any, index: number) => (
        <span key={index} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-[11px] w-fit font-semibold border border-blue-100">
          
          {item.productName || item.name || item.title || "Unknown Item"} (x{item.quantity})
        </span>
      ))}
    </div>
  ) : (
    <span className="text-gray-400 italic text-xs">No items listed</span>
  )}
</td>

    
      <td className="px-6 py-4 font-bold text-blue-600">${order.totalAmount}</td>

      
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
          order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
          order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {order.status}
        </span>
      </td>

      
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(order.createdAt).toLocaleDateString()}
      </td>

      
      <td className="px-6 py-4">
        <select 
          className="text-xs border border-gray-200 rounded-lg p-1.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
          onChange={(e) => updateStatus(order._id, e.target.value)}
          value={order.status}
        >
          <option value="Pending">Pending</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled (Hide)</option>
        </select>
      </td>
    </tr>
  ))}
</tbody>
        </table>
        
        {activeOrders.length === 0 && (
          <div className="p-10 text-center text-gray-400">
            အော်ဒါစာရင်း မရှိသေးပါဘူးဗျာ။
          </div>
        )}
      </div>
    </div>
  );
}

// --- Customers Page ---
function CustomersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const customerOrders = orders.filter(o => o.customerName === selectedCustomer);

  useEffect(() => {
    axios.get(`${API_URL}/api/products/orders`)
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      });
  }, []);

 
  const customerSummary = orders.reduce((acc: any, order: any) => {
    const name = order.customerName;
    if (!acc[name]) {
      acc[name] = { name: name, totalSpent: 0, orderCount: 0, lastOrder: order.createdAt };
    }
    if (order.status !== 'Cancelled') {
      acc[name].totalSpent += order.totalAmount;
      acc[name].orderCount += 1;
      if (new Date(order.createdAt) > new Date(acc[name].lastOrder)) {
        acc[name].lastOrder = order.createdAt;
      }
    }
    return acc;
  }, {});

  const customers = Object.values(customerSummary);

  return (
    <div className="p-8">
      <h3 className="text-2xl font-bold mb-6">Our Customers</h3>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
            <tr>
              <th className="px-6 py-4">Customer Name</th>
              <th className="px-6 py-4">Orders</th>
              <th className="px-6 py-4">Total Spent</th>
              <th className="px-6 py-4">Last Active</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((customer: any, idx: number) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {customer.name.charAt(0)}
                  </div>
                  <span className="font-medium">{customer.name}</span>
                </td>
                <td className="px-6 py-4">{customer.orderCount} Orders</td>
                <td className="px-6 py-4 font-bold text-green-600">${customer.totalSpent.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(customer.lastOrder).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => { setSelectedCustomer(customer.name); setIsModalOpen(true); }}
                    className="text-blue-600 text-sm font-bold hover:underline"
                  >
                    View History
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">{selectedCustomer}'s Order History</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <div className="space-y-4">
              {customerOrders.map((order: any) => (
                <div key={order._id} className="border border-gray-100 p-4 rounded-xl flex justify-between items-center bg-gray-50">
                  <div>
                    <p className="font-bold text-blue-600">Order #{order.orderId || order._id.slice(-5)}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                    <div className="mt-1">
                      {order.items?.map((item: any, i: number) => (
                        <span key={i} className="text-xs bg-white px-2 py-1 rounded border mr-1">
                          {item.name} x {item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${order.totalAmount}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Profile Page ---
function ProfilePage({ user }: { user: any }) {
  
  const [admin, setAdmin] = useState({
    name: user?.name || "Admin User",
    email: user?.email || "admin@mystore.com",
    role: "Super Admin",
    joinedDate: "2024-01-15",
    avatar: `https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=0D8ABC&color=fff`
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

 
  const handleProfileSave = () => {
    
    setIsEditing(false);
    alert("Profile Update အောင်မြင်ပါတယ်!");
  };

  const handlePasswordUpdate = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      alert("အချက်အလက်များကို ပြည့်စုံစွာ ဖြည့်စွက်ပေးပါဗျ");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      alert("Password အသစ်နှစ်ခု မတူညီပါဘူးဗျ");
      return;
    }

    try {
      await axios.put(`${API_URL}/api/auth/update-password`, {
        userId: user.id,
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      
      alert("Password လဲလှယ်မှု အောင်မြင်ပါတယ်!");
      setShowModal(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      alert(err.response?.data?.message || "Error ဖြစ်သွားပါတယ်");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">Admin Profile</h3>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        
        <div className="px-8 pb-8">
          <div className="relative -mt-12 mb-6">
            <img 
              src={admin.avatar} 
              alt="Avatar" 
              className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Full Name</label>
                {isEditing ? (
                  <input 
                    className="w-full p-2 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500" 
                    value={admin.name} 
                    onChange={e => setAdmin({...admin, name: e.target.value})}
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-800">{admin.name}</p>
                )}
              </div>
              
              <div>
                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Email Address</label>
                <p className="text-gray-600 font-medium">{admin.email}</p>
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Role</label>
                <div className="mt-1">
                  <span className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                    {admin.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Account Created</label>
                <p className="text-gray-600 font-medium">{new Date(admin.joinedDate).toLocaleDateString()}</p>
              </div>

              <div className="pt-4">
                <button 
                  onClick={isEditing ? handleProfileSave : () => setIsEditing(true)}
                  className={`px-6 py-2 rounded-lg font-bold transition-all shadow-sm ${
                    isEditing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isEditing ? "Save Profile" : "Edit Profile"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Security Settings Section --- */}
      <div className="mt-8 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h4 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
          Security Settings
        </h4>
        
        <div className="flex justify-between items-center border-b pb-6 mb-6">
          <div>
            <p className="font-semibold text-gray-700">Password</p>
            <p className="text-sm text-gray-500">Last changed 3 months ago</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="text-blue-600 font-bold text-sm hover:underline hover:text-blue-700 transition"
          >
            Update Password
          </button>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-gray-700">Two-factor Authentication</p>
            <p className="text-sm text-gray-500">Add an extra layer of security</p>
          </div>
          <button className="text-gray-300 font-bold text-sm cursor-not-allowed">
            Enable
          </button>
        </div>
      </div>

      {/* --- Password Update Modal --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Update Password</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Current Password</label>
                <input 
                  type="password" 
                  placeholder="လက်ရှိ password ကိုရိုက်ပါ"
                  className="w-full p-2.5 border border-gray-200 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">New Password</label>
                <input 
                  type="password" 
                  placeholder="password အသစ်ရိုက်ပါ"
                  className="w-full p-2.5 border border-gray-200 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="အသစ်ကို တစ်ခါထပ်ရိုက်ပါ"
                  className="w-full p-2.5 border border-gray-200 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handlePasswordUpdate}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md transition"
              >
                Update Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// SettingsPage 
function SettingsPage() {
  const [siteSettings, setSiteSettings] = useState({
    storeName: "MyStore Admin",
    currency: "MMK",
    adminEmail: "admin@gmail.com"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/settings');
        if (res.data) {
          setSiteSettings(res.data);
        }
      } catch (err) {
        console.log("Settings fetch error - Backend server မပွင့်ထားရင် ဒီအတိုင်းပဲ ဖြစ်နေမှာပါ");
      } finally {
        
        setLoading(false); 
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/settings', siteSettings);
      alert("Settings saved successfully!");
      window.location.reload(); 
    } catch (err) {
      alert("Save failed! Backend logic ကို စစ်ပေးပါဦးဗျ။");
    }
  };

  
  if (loading) return (
    <div className="p-8 flex items-center gap-2 text-blue-600 font-bold">
      <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      Loading Settings...
    </div>
  );

  return (
    <div className="p-8 max-w-2xl">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">General Settings</h3>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Store Name</label>
            <input 
              type="text" 
              value={siteSettings.storeName}
              onChange={(e) => setSiteSettings({...siteSettings, storeName: e.target.value})}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Currency Symbol</label>
            <select 
              value={siteSettings.currency}
              onChange={(e) => setSiteSettings({...siteSettings, currency: e.target.value})}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              <option value="$">USD ($)</option>
              <option value="MMK">MMK (Ks)</option>
              <option value="฿">THB (฿)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Email</label>
            <input 
              type="email" 
              value={siteSettings.adminEmail}
              onChange={(e) => setSiteSettings({...siteSettings, adminEmail: e.target.value})}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            Save Changes
          </button>
        </form>
      </div>

      
      <div className="mt-8 p-6 bg-red-50 rounded-2xl border border-red-100">
        <h4 className="text-red-600 font-bold mb-2">Danger Zone</h4>
        <p className="text-sm text-gray-500 mb-4">သတိထားရန် - Database ထဲက Data အားလုံး ပျက်သွားပါမည်။</p>
        <button className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition">
          Reset All Data
        </button>
      </div>
    </div>
  );
}


// ------------------------------
// 1. REGISTER PAGE COMPONENT
// ------------------------------
function RegisterPage({ onSwitch }: { onSwitch: () => void }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}api/auth/register`, formData);
      alert("Registration Successful! Please Login.");
      onSwitch();
    } catch (err: any) {
      alert(err.response?.data?.message || "Registration failed! Email might already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-blue-600 text-center mb-2">Create Account</h2>
        <p className="text-gray-500 text-center mb-8">Admin အသစ်ဆောက်ရန်</p>
        
        <div className="space-y-4">
          <input 
            type="text" placeholder="Full Name" required
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <input 
            type="email" placeholder="Email Address" required
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" placeholder="Password" required
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
        </div>
        
        <button 
          disabled={loading}
          className={`w-full text-white p-3 rounded-xl font-bold mt-6 transition ${loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? "Registering..." : "Sign Up"}
        </button>
        
        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account? 
          <button type="button" onClick={onSwitch} className="text-blue-600 font-bold ml-1 hover:underline">Login</button>
        </p>
      </form>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string, icon: any, label: string }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-6 py-3 transition ${
        active 
          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
          : 'text-gray-500 hover:bg-gray-50'
      }`}
    >
      {icon} <span className="font-medium">{label}</span>
    </Link>
  );
}

// -----------------------------
// 2. LOGIN PAGE COMPONENT
// -----------------------------
function LoginPage({ onLogin, onSwitch }: { onLogin: (user: any) => void; onSwitch: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      
      if (res.data.token && res.data.user) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user)); 
        onLogin(res.data.user); 
      }
    } catch (err: any) {
     
      const msg = err.response?.data?.message || "Login failed! အီးမေးလ် သို့မဟုတ် ပါတ်စဝပ် မှားနေပါတယ်ဗျ။";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="text-blue-600 w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Admin Login</h2>
          <p className="text-gray-500 mt-2 text-center">ဆက်လက်ဆောင်ရွက်ရန် Login ဝင်ပေးပါ</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100 text-center">
            {error}
          </div>
        )}
        
        <div className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              required
              className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              onChange={e => setPassword(e.target.value)} 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className={`w-full text-white py-3.5 rounded-xl font-bold mt-8 transition-all active:scale-95 ${
            loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100'
          }`}
        >
          {loading ? "Logging in..." : "Login Account"}
        </button>

          {/* Demo Credentials Box */}
<div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1">
    <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
    Demo Account for Portfolio
  </p>
  <div className="space-y-1">
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500">Email:</span>
      <code className="bg-white px-2 py-0.5 rounded border text-blue-700 font-mono">
        demo@admin.com
      </code>
    </div>
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500">Password:</span>
      <code className="bg-white px-2 py-0.5 rounded border text-blue-700 font-mono">
        demo123
      </code>
    </div>
  </div>
  <p className="mt-2 text-[10px] text-blue-400 italic">
    * ကနဦးဝင်ရောက်ကြည့်ရှုရန် ဤအကောင့်ကို အသုံးပြုနိုင်ပါသည်။
  </p>
</div>

        <div className="mt-8 text-center pt-6 border-t border-gray-50">
          <p className="text-sm text-gray-600">
            Don't have an account? 
            <button type="button" onClick={onSwitch} className="text-blue-600 font-bold ml-2 hover:underline">
              Register Now
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

export default App;
