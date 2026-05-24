import React, {useEffect, useState} from 'react'
import API from '../services/api'
import { Link } from 'react-router-dom'

export default function Destinations(){
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const fetchDestinations = () => {
    setLoading(true);
    let url = '/destinations';
    const params = [];
    if(search) params.push(`q=${encodeURIComponent(search)}`);
    if(category) params.push(`category=${encodeURIComponent(category)}`);
    if(params.length) url += `?${params.join('&')}`;

    API.get(url)
      .then(r => setList(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDestinations();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDestinations();
  };

  // Category list
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'budget', label: 'Budget' },
    { value: 'family', label: 'Family' },
    { value: 'honeymoon', label: 'Honeymoon' }
  ];

  return (
    <div className="space-y-8 py-4">
      {/* Search & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-900">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Explore Destinations</h2>
          <p className="text-slate-400">Discover handpicked destinations around the world.</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search city, country..."
            className="w-full md:w-64 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button 
            type="submit" 
            className="px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm shadow-md transition-all active:scale-[0.98]"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all ${
              category === c.value
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Destinations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(n => (
            <div key={n} className="glass-panel rounded-3xl h-80 animate-pulse bg-slate-900/40"></div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 border border-dashed border-slate-800/80">
          No destinations found matching your criteria. Try adjustments!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map(d => (
            <div key={d._id} className="glass-panel glass-panel-hover rounded-3xl overflow-hidden flex flex-col group h-[400px]">
              {/* Cover photo */}
              <div className="h-48 overflow-hidden relative bg-slate-900">
                <img 
                  src={d.images?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'} 
                  alt={d.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {d.category && (
                  <span className="absolute top-4 left-4 px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-600/90 text-white rounded-full backdrop-blur-sm border border-indigo-400/20">
                    {d.category}
                  </span>
                )}
                {d.meta?.rating && (
                  <span className="absolute top-4 right-4 px-2 py-1 text-[10px] font-bold bg-slate-900/90 text-amber-400 rounded-lg backdrop-blur-sm border border-slate-800 flex items-center gap-1">
                    ★ {d.meta.rating}
                  </span>
                )}
              </div>

              {/* Card content */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                  {d.name}
                </h3>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  {d.city || d.country}
                </p>
                <p className="text-sm text-slate-400 line-clamp-3 mb-6">
                  {d.description}
                </p>
                
                {/* Spacer & Link */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-900/80">
                  <div className="flex gap-1">
                    {(d.tags || []).slice(0, 2).map((t, idx) => (
                      <span key={idx} className="text-[10px] font-medium px-2 py-0.5 bg-slate-900 rounded-md text-slate-400 border border-slate-800">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <Link 
                    to={`/destinations/${d._id}`} 
                    className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors flex items-center gap-1"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
