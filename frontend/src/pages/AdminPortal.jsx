import React, { useEffect, useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function AdminPortal(){
  const [activeTab, setActiveTab] = useState('packages'); // 'packages' or 'destinations'
  const [packages, setPackages] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  
  // Package Form State
  const [editingPkgId, setEditingPkgId] = useState(null);
  const [pkgForm, setPkgForm] = useState({
    title: '',
    destination: '',
    price: 10000,
    currency: 'INR',
    durationDays: 1,
    description: '',
    category: 'other',
    tags: '',
    itinerarySummary: '',
    image: ''
  });

  // Destination Form State
  const [editingDestId, setEditingDestId] = useState(null);
  const [destForm, setDestForm] = useState({
    name: '',
    city: '',
    country: '',
    description: '',
    category: 'other',
    tags: '',
    image: '',
    attractionsRaw: '' // Newline separated "Name: Description"
  });

  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const checkAdminAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'admin';
    } catch(e) {
      return false;
    }
  };

  const loadData = async () => {
    try {
      const [pkgsRes, destsRes] = await Promise.all([
        API.get('/packages'),
        API.get('/destinations')
      ]);
      setPackages(pkgsRes.data);
      setDestinations(destsRes.data);
      
      // Default select the first destination in package form
      if (destsRes.data.length > 0 && !pkgForm.destination) {
        setPkgForm(prev => ({ ...prev, destination: destsRes.data[0]._id }));
      }
    } catch(err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isAdmin = checkAdminAuth();
    if (!isAdmin) {
      alert('Access Denied: Admin role required.');
      navigate('/');
      return;
    }
    setAuthorized(true);
    loadData();
  }, [navigate]);

  // Packages CRUD operations
  const handlePkgInputChange = (e) => {
    const { name, value } = e.target;
    setPkgForm(prev => ({ ...prev, [name]: value }));
  };

  const resetPkgForm = () => {
    setPkgForm({
      title: '',
      destination: destinations[0]?._id || '',
      price: 10000,
      currency: 'INR',
      durationDays: 1,
      description: '',
      category: 'other',
      tags: '',
      itinerarySummary: '',
      image: ''
    });
    setEditingPkgId(null);
    setMsg('');
    setStatus('');
  };

  const handlePkgSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setStatus('');

    const payload = {
      title: pkgForm.title,
      destination: pkgForm.destination,
      price: Number(pkgForm.price),
      currency: pkgForm.currency,
      durationDays: Number(pkgForm.durationDays),
      description: pkgForm.description,
      category: pkgForm.category,
      tags: pkgForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      itinerarySummary: pkgForm.itinerarySummary.split('\n').map(l => l.trim()).filter(Boolean),
      images: pkgForm.image ? [pkgForm.image] : []
    };

    try {
      if (editingPkgId) {
        await API.put(`/packages/${editingPkgId}`, payload);
        setStatus('success');
        setMsg('Package updated successfully!');
      } else {
        await API.post('/packages', payload);
        setStatus('success');
        setMsg('New package created successfully!');
      }
      resetPkgForm();
      loadData();
    } catch(err) {
      setStatus('error');
      setMsg(err.response?.data?.message || 'Error saving package.');
    }
  };

  const startPkgEdit = (pkg) => {
    setEditingPkgId(pkg._id);
    setPkgForm({
      title: pkg.title || '',
      destination: pkg.destination?._id || pkg.destination || '',
      price: pkg.price || 10000,
      currency: pkg.currency || 'INR',
      durationDays: pkg.durationDays || 1,
      description: pkg.description || '',
      category: pkg.category || 'other',
      tags: (pkg.tags || []).join(', '),
      itinerarySummary: (pkg.itinerarySummary || []).join('\n'),
      image: pkg.images?.[0] || ''
    });
    setMsg('');
    setStatus('');
  };

  const handlePkgDelete = async (id) => {
    if (!window.confirm('Delete this package?')) return;
    try {
      await API.delete(`/packages/${id}`);
      loadData();
    } catch(err) {
      alert('Delete failed.');
    }
  };


  // Destinations CRUD operations
  const handleDestInputChange = (e) => {
    const { name, value } = e.target;
    setDestForm(prev => ({ ...prev, [name]: value }));
  };

  const resetDestForm = () => {
    setDestForm({
      name: '',
      city: '',
      country: '',
      description: '',
      category: 'other',
      tags: '',
      image: '',
      attractionsRaw: ''
    });
    setEditingDestId(null);
    setMsg('');
    setStatus('');
  };

  const handleDestSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setStatus('');

    // Parse attractions raw text
    const attractions = destForm.attractionsRaw.split('\n').map(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        return { name: parts[0].trim(), description: parts.slice(1).join(':').trim() };
      } else if (line.trim()) {
        return { name: line.trim(), description: 'Attraction point.' };
      }
      return null;
    }).filter(Boolean);

    const payload = {
      name: destForm.name,
      city: destForm.city,
      country: destForm.country,
      description: destForm.description,
      category: destForm.category,
      tags: destForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      images: destForm.image ? [destForm.image] : [],
      attractions
    };

    try {
      if (editingDestId) {
        await API.put(`/destinations/${editingDestId}`, payload);
        setStatus('success');
        setMsg('Destination updated successfully!');
      } else {
        await API.post('/destinations', payload);
        setStatus('success');
        setMsg('New destination created successfully!');
      }
      resetDestForm();
      loadData();
    } catch(err) {
      setStatus('error');
      setMsg(err.response?.data?.message || 'Error saving destination.');
    }
  };

  const startDestEdit = (dest) => {
    setEditingDestId(dest._id);
    const attractionsText = (dest.attractions || []).map(a => `${a.name}: ${a.description}`).join('\n');
    setDestForm({
      name: dest.name || '',
      city: dest.city || '',
      country: dest.country || '',
      description: dest.description || '',
      category: dest.category || 'other',
      tags: (dest.tags || []).join(', '),
      image: dest.images?.[0] || '',
      attractionsRaw: attractionsText
    });
    setMsg('');
    setStatus('');
  };

  const handleDestDelete = async (id) => {
    if (!window.confirm('Delete this destination? (Warning: This will make packages assigned to it unpopulated)')) return;
    try {
      await API.delete(`/destinations/${id}`);
      loadData();
    } catch(err) {
      alert('Delete failed.');
    }
  };

  if (!authorized) return null;

  if (loading) {
    return <div className="animate-pulse py-12 space-y-6">
      <div className="h-10 bg-slate-900 rounded w-1/4"></div>
      <div className="h-64 bg-slate-900 rounded-3xl w-full"></div>
    </div>
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-900">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Admin Portal</h2>
          <p className="text-slate-400">Configure and manage holiday tour destinations and packages.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/80 w-full md:w-auto">
          <button 
            onClick={() => { setActiveTab('packages'); setMsg(''); setStatus(''); }}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'packages' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Manage Packages
          </button>
          <button 
            onClick={() => { setActiveTab('destinations'); setMsg(''); setStatus(''); }}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'destinations' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Manage Destinations
          </button>
        </div>
      </div>

      {activeTab === 'packages' ? (
        /* MANAGE PACKAGES TAB */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Package Form */}
          <div className="glass-panel rounded-3xl p-6 lg:col-span-1 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                {editingPkgId ? 'Edit Package' : 'Create Package'}
              </h3>
              <p className="text-xs text-slate-400">
                {editingPkgId ? 'Modify details of the package.' : 'Enter new details to add a package.'}
              </p>
            </div>

            <form onSubmit={handlePkgSubmit} className="space-y-4 text-xs font-semibold text-slate-300">
              <div>
                <label className="block uppercase tracking-wider mb-1.5">Package Title</label>
                <input 
                  name="title" 
                  value={pkgForm.title} 
                  onChange={handlePkgInputChange} 
                  placeholder="e.g. Autumn in Kyoto Tour"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider mb-1.5">Category</label>
                  <select 
                    name="category"
                    value={pkgForm.category}
                    onChange={handlePkgInputChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="other">Other</option>
                    <option value="luxury">Luxury</option>
                    <option value="adventure">Adventure</option>
                    <option value="budget">Budget</option>
                    <option value="family">Family</option>
                    <option value="honeymoon">Honeymoon</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1.5">Destination</label>
                  <select 
                    name="destination"
                    value={pkgForm.destination}
                    onChange={handlePkgInputChange}
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {destinations.length === 0 ? (
                      <option value="">(Create a destination first!)</option>
                    ) : (
                      destinations.map(d => (
                        <option key={d._id} value={d._id}>{d.name} ({d.city || d.country})</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider mb-1.5">Price (INR)</label>
                  <input 
                    name="price" 
                    type="number"
                    value={pkgForm.price} 
                    onChange={handlePkgInputChange} 
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1.5">Duration (Days)</label>
                  <input 
                    name="durationDays" 
                    type="number"
                    value={pkgForm.durationDays} 
                    onChange={handlePkgInputChange} 
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1.5">Cover Image URL</label>
                <input 
                  name="image" 
                  value={pkgForm.image} 
                  onChange={handlePkgInputChange} 
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1.5">Tags (comma-separated)</label>
                <input 
                  name="tags" 
                  value={pkgForm.tags} 
                  onChange={handlePkgInputChange} 
                  placeholder="hiking, history, culture"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1.5">Description</label>
                <textarea 
                  name="description" 
                  value={pkgForm.description} 
                  onChange={handlePkgInputChange} 
                  rows={3}
                  placeholder="Write a summary..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1.5">Itinerary Summary (One item per line)</label>
                <textarea 
                  name="itinerarySummary" 
                  value={pkgForm.itinerarySummary} 
                  onChange={handlePkgInputChange} 
                  rows={4}
                  placeholder="Day 1: Arrival & Hotel check-in&#10;Day 2: City Sightseeing..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md shadow-indigo-600/10 transition-all active:scale-[0.98]"
                >
                  {editingPkgId ? 'Update Package' : 'Create Package'}
                </button>
                {editingPkgId && (
                  <button 
                    type="button"
                    onClick={resetPkgForm}
                    className="px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-300 rounded-xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {msg && (
              <div className={`p-4 rounded-xl text-center text-sm border ${
                status === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {msg}
              </div>
            )}
          </div>

          {/* Packages List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel rounded-3xl p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Existing Packages</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/50">
                    {packages.map(p => (
                      <tr key={p._id} className="hover:bg-slate-900/20 transition-colors text-slate-300">
                        <td className="py-3.5 px-4 font-bold text-white">{p.title}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-450 font-sans">
                          {p.destination?.name || '—'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-400">₹{p.price}</td>
                        <td className="py-3.5 px-4 font-medium">{p.durationDays} Days</td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button 
                            onClick={() => startPkgEdit(p)}
                            className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 hover:border-indigo-500/30 text-indigo-400 rounded-lg font-bold transition-all"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handlePkgDelete(p._id)}
                            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 rounded-lg font-bold transition-all"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MANAGE DESTINATIONS TAB */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Destination Form */}
          <div className="glass-panel rounded-3xl p-6 lg:col-span-1 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                {editingDestId ? 'Edit Destination' : 'Create Destination'}
              </h3>
              <p className="text-xs text-slate-400">
                {editingDestId ? 'Modify details of this destination.' : 'Enter details to introduce a new travel location.'}
              </p>
            </div>

            <form onSubmit={handleDestSubmit} className="space-y-4 text-xs font-semibold text-slate-300">
              <div>
                <label className="block uppercase tracking-wider mb-1.5">Destination Name</label>
                <input 
                  name="name" 
                  value={destForm.name} 
                  onChange={handleDestInputChange} 
                  placeholder="e.g. Switzerland"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider mb-1.5">City</label>
                  <input 
                    name="city" 
                    value={destForm.city} 
                    onChange={handleDestInputChange} 
                    placeholder="e.g. Zurich"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1.5">Country</label>
                  <input 
                    name="country" 
                    value={destForm.country} 
                    onChange={handleDestInputChange} 
                    placeholder="e.g. Switzerland"
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider mb-1.5">Category</label>
                  <select 
                    name="category"
                    value={destForm.category}
                    onChange={handleDestInputChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="other">Other</option>
                    <option value="luxury">Luxury</option>
                    <option value="adventure">Adventure</option>
                    <option value="budget">Budget</option>
                    <option value="family">Family</option>
                    <option value="honeymoon">Honeymoon</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1.5 font-sans">Tags (comma-separated)</label>
                  <input 
                    name="tags" 
                    value={destForm.tags} 
                    onChange={handleDestInputChange} 
                    placeholder="nature, skiing, scenic"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1.5">Banner Image URL</label>
                <input 
                  name="image" 
                  value={destForm.image} 
                  onChange={handleDestInputChange} 
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1.5">Description</label>
                <textarea 
                  name="description" 
                  value={destForm.description} 
                  onChange={handleDestInputChange} 
                  rows={3}
                  placeholder="Write a travel description..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1.5">Tourist Attractions (Format: "Name: Description" - One per line)</label>
                <textarea 
                  name="attractionsRaw" 
                  value={destForm.attractionsRaw} 
                  onChange={handleDestInputChange} 
                  rows={4}
                  placeholder="Lake Zurich: A beautiful scenic lake.&#10;Swiss Alps: Incredible mountain ranges."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed font-sans"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md shadow-indigo-600/10 transition-all active:scale-[0.98]"
                >
                  {editingDestId ? 'Update Destination' : 'Create Destination'}
                </button>
                {editingDestId && (
                  <button 
                    type="button"
                    onClick={resetDestForm}
                    className="px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-300 rounded-xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {msg && (
              <div className={`p-4 rounded-xl text-center text-sm border ${
                status === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {msg}
              </div>
            )}
          </div>

          {/* Destinations List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel rounded-3xl p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Existing Destinations</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">City/Country</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Attractions Count</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/50">
                    {destinations.map(d => (
                      <tr key={d._id} className="hover:bg-slate-900/20 transition-colors text-slate-300">
                        <td className="py-3.5 px-4 font-bold text-white">{d.name}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-450">
                          {d.city || '—'}, {d.country}
                        </td>
                        <td className="py-3.5 px-4 uppercase font-bold text-indigo-400 text-[10px]">{d.category}</td>
                        <td className="py-3.5 px-4 font-medium">{(d.attractions || []).length} Points</td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button 
                            onClick={() => startDestEdit(d)}
                            className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 hover:border-indigo-500/30 text-indigo-400 rounded-lg font-bold transition-all"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDestDelete(d._id)}
                            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 rounded-lg font-bold transition-all"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
