import React, {useEffect, useState} from 'react'
import API from '../services/api'
import { Link } from 'react-router-dom'

export default function Packages(){
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    API.get('/packages')
      .then(r => setList(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  },[]);

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Curated Travel Packages</h2>
        <p className="text-slate-400">Unlock fully scheduled itineraries designed by professional tour planners.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(n => (
            <div key={n} className="glass-panel rounded-3xl h-96 animate-pulse bg-slate-900/40"></div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-400">
          No travel packages are currently available. Check back soon!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map(p => (
            <div key={p._id} className="glass-panel glass-panel-hover rounded-3xl overflow-hidden flex flex-col group h-[420px]">
              {/* Cover photo */}
              <div className="h-44 overflow-hidden relative bg-slate-900">
                <img 
                  src={p.images?.[0] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'} 
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-600/90 text-white rounded-full border border-indigo-400/20 backdrop-blur-sm">
                  {p.category}
                </span>
                <span className="absolute bottom-4 right-4 px-2 py-1 text-[10px] font-bold bg-slate-950/80 text-slate-200 rounded-lg border border-slate-800 backdrop-blur-sm">
                  🕒 {p.durationDays} Days
                </span>
              </div>

              {/* Card content */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                  {p.title}
                </h3>
                {p.destination && (
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    📍 {p.destination.city || p.destination.name}, {p.destination.country}
                  </div>
                )}
                <p className="text-sm text-slate-400 line-clamp-3 mb-6">
                  {p.description}
                </p>

                {/* Price & Link */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-900/80">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Total Price</span>
                    <span className="text-2xl font-black text-white">
                      ₹{p.price} <span className="text-xs text-slate-400 font-medium">{p.currency || 'INR'}</span>
                    </span>
                  </div>
                  <Link 
                    to={`/packages/${p._id}`} 
                    className="px-4 py-2 bg-indigo-600 group-hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.98]"
                  >
                    View Details
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
