import React, {useEffect, useState} from 'react'
import { useParams, Link } from 'react-router-dom'
import API from '../services/api'

export default function DestinationDetail(){
  const { id } = useParams();
  const [dest, setDest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    API.get(`/destinations/${id}`)
      .then(r => setDest(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  },[id]);

  if(loading) {
    return <div className="animate-pulse py-12 space-y-6">
      <div className="h-64 bg-slate-900 rounded-3xl w-full"></div>
      <div className="h-8 bg-slate-900 rounded w-1/3"></div>
      <div className="h-20 bg-slate-900 rounded w-full"></div>
    </div>
  }

  if(!dest) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center text-slate-400">
        Destination details could not be loaded. <Link to="/destinations" className="text-indigo-400">Go back</Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 py-4">
      {/* Back button */}
      <Link to="/destinations" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
        ← Back to Destinations
      </Link>

      {/* Hero Banner */}
      <div className="h-80 w-full rounded-3xl overflow-hidden relative shadow-2xl bg-slate-900">
        <img 
          src={dest.images?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'} 
          alt={dest.name} 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-full border border-indigo-400/20 mb-3 inline-block">
              {dest.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{dest.name}</h1>
            <p className="text-slate-300 font-medium mt-1">{dest.city || dest.country}</p>
          </div>
          {dest.meta?.popularity && (
            <div className="flex gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
              <div className="text-center">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Rating</div>
                <div className="text-lg font-bold text-amber-400">★ {dest.meta.rating || '4.8'}</div>
              </div>
              <div className="w-px bg-slate-800"></div>
              <div className="text-center">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Popularity</div>
                <div className="text-lg font-bold text-indigo-400">{dest.meta.popularity}%</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description & Tags */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-8 space-y-6">
            <h3 className="text-xl font-bold text-white">About the Destination</h3>
            <p className="text-slate-300 leading-relaxed font-light">{dest.description}</p>
            
            <div className="pt-4 border-t border-slate-900">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tags & Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {(dest.tags || []).map((t, idx) => (
                  <span key={idx} className="text-xs font-semibold px-3 py-1 bg-slate-900 text-slate-300 rounded-lg border border-slate-800">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Attractions */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-8 space-y-5">
            <h3 className="text-xl font-bold text-white">Popular Attractions</h3>
            <div className="space-y-4">
              {(dest.attractions || []).map((a, idx) => (
                <div key={a._id || idx} className="p-4 bg-slate-900/60 rounded-2xl border border-slate-850 hover:border-slate-800 transition-colors">
                  <div className="font-bold text-slate-200 mb-1">{a.name}</div>
                  <div className="text-xs text-slate-400 leading-relaxed font-light">{a.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 text-center bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-500/20">
            <h4 className="font-bold text-white mb-2">Ready to visit?</h4>
            <p className="text-xs text-slate-400 mb-4">View holiday packages available for this destination.</p>
            <Link 
              to="/packages" 
              className="block w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              Browse Packages
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
