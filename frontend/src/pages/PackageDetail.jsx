import React, {useEffect, useState} from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import API from '../services/api'

export default function PackageDetail(){
  const { id } = useParams();
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(()=>{
    API.get(`/packages/${id}`)
      .then(r => setPack(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  },[id]);

  const startItinerary = async () => {
    try{
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in or create an account to start customizing itineraries!');
        navigate('/login');
        return;
      }
      
      const body = { 
        title: `Trip Plan: ${pack.title}`, 
        package: pack._id, 
        days: (pack.itinerarySummary || []).map((summary, idx) => ({
          dayNumber: idx + 1,
          summary: summary.split(': ')[1] || summary,
          activities: [
            {
              time: '09:00',
              title: summary.split(': ')[1] || summary,
              description: 'Standard activity pre-seeded from tour guide package.',
              cost: 0,
              durationMinutes: 120
            }
          ]
        }))
      };
      const res = await API.post('/itineraries', body);
      navigate(`/itineraries/${res.data._id}`);
    }catch(err){
      console.error(err);
      alert('Error creating itinerary. Please check if you are logged in.');
    }
  }

  if(loading) {
    return <div className="animate-pulse py-12 space-y-6">
      <div className="h-64 bg-slate-900 rounded-3xl w-full"></div>
      <div className="h-8 bg-slate-900 rounded w-1/3"></div>
      <div className="h-20 bg-slate-900 rounded w-full"></div>
    </div>
  }

  if(!pack) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center text-slate-400">
        Package details could not be loaded. <Link to="/packages" className="text-indigo-400">Go back</Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 py-4">
      {/* Back button */}
      <Link to="/packages" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
        ← Back to Packages
      </Link>

      {/* Hero Banner */}
      <div className="h-80 w-full rounded-3xl overflow-hidden relative shadow-2xl bg-slate-900">
        <img 
          src={pack.images?.[0] || pack.destination?.images?.[0] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'} 
          alt={pack.title} 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-full border border-indigo-400/20 mb-3 inline-block">
              {pack.category}
            </span>
            <h1 className="text-4xl font-black text-white tracking-tight">{pack.title}</h1>
            {pack.destination && (
              <p className="text-slate-300 font-medium mt-1">
                📍 {pack.destination.city || pack.destination.name}, {pack.destination.country}
              </p>
            )}
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md text-right">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Custom Package</span>
            <span className="text-3xl font-black text-white">
              ₹{pack.price} <span className="text-xs text-slate-400 font-semibold">{pack.currency || 'INR'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Content Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description & Scheduled Days */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="glass-panel rounded-3xl p-8 space-y-4">
            <h3 className="text-xl font-bold text-white">Package Overview</h3>
            <p className="text-slate-300 leading-relaxed font-light">{pack.description}</p>
          </div>

          {/* Day Summaries */}
          <div className="glass-panel rounded-3xl p-8 space-y-6">
            <h3 className="text-xl font-bold text-white">Itinerary Schedule Summary</h3>
            <div className="space-y-4 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800/80">
              {(pack.itinerarySummary || []).map((summary, idx) => (
                <div key={idx} className="flex gap-6 relative z-10 group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center font-extrabold text-indigo-400 shrink-0 group-hover:border-indigo-500/30 transition-all duration-300">
                    {idx + 1}
                  </div>
                  <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl flex-1 group-hover:border-slate-800 transition-colors">
                    <div className="font-bold text-slate-200 mb-1">
                      {summary.includes(': ') ? summary.split(': ')[0] : `Day ${idx + 1}`}
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed font-light">
                      {summary.includes(': ') ? summary.split(': ').slice(1).join(': ') : summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Actions Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-8 space-y-5">
            <h3 className="text-xl font-bold text-white">Details Summary</h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2.5 border-b border-slate-900">
                <span className="text-slate-500 font-medium">Duration</span>
                <span className="text-slate-200 font-bold">{pack.durationDays} Days</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-900">
                <span className="text-slate-500 font-medium">Available Spots</span>
                <span className="text-slate-200 font-bold">Limited (Customizable)</span>
              </div>
              {pack.destination && (
                <div className="flex justify-between py-2.5 border-b border-slate-900">
                  <span className="text-slate-500 font-medium">Primary Destination</span>
                  <Link 
                    to={`/destinations/${pack.destination._id}`} 
                    className="text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    {pack.destination.name} →
                  </Link>
                </div>
              )}
            </div>

            <button 
              onClick={startItinerary}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Personalizing Itinerary
            </button>
            <div className="text-xs text-slate-500 text-center font-medium">
              This will generate an editable planner based on this preset package.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
