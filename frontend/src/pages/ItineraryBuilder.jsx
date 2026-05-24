import React, {useEffect, useState, useMemo} from 'react'
import { useParams, Link } from 'react-router-dom'
import API from '../services/api'

function ActivityCard({ activity, onRemove }){
  return (
    <div className="activity-card flex items-start gap-3 relative">
      <div className="text-slate-500 font-bold shrink-0 mt-0.5 select-none cursor-grab active:cursor-grabbing">☰</div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-bold text-sm text-slate-200 line-clamp-1">
            {activity.title}
          </h4>
          {onRemove && (
            <button 
              onClick={onRemove}
              className="text-slate-600 hover:text-rose-400 text-xs transition-colors shrink-0 p-0.5"
              title="Remove activity"
            >
              ✕
            </button>
          )}
        </div>
        <div className="text-[10px] text-slate-500 font-semibold mt-1 flex items-center gap-1.5 flex-wrap">
          <span>🕒 {activity.time}</span>
          <span>·</span>
          <span>⏱️ {activity.durationMinutes || 0} mins</span>
          <span>·</span>
          <span className="text-emerald-500 font-bold">₹{activity.cost || 0}</span>
        </div>
        {activity.description && (
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {activity.description}
          </p>
        )}
      </div>
    </div>
  )
}

const sampleSuggestions = [
  { title: 'Hotel Check-In', time: '14:00', durationMinutes: 30, cost: 0, description: 'Check-in to the accommodations and refresh.' },
  { title: 'Guided City Walking Tour', time: '10:00', durationMinutes: 180, cost: 35, description: 'Explore historic avenues and major landmarks with an expert.' },
  { title: 'Scenic Beachfront Lounge', time: '16:00', durationMinutes: 120, cost: 15, description: 'Relax by the sunset and enjoy complimentary mocktails.' },
  { title: 'Fine Dining Cruise', time: '19:00', durationMinutes: 150, cost: 95, description: 'Four-course local cuisine dinner while sailing along the river/coast.' },
  { title: 'Water Sports Adventure', time: '11:00', durationMinutes: 120, cost: 60, description: 'Snorkeling, jet-skiing, and guided marine life discovery.' }
]

export default function ItineraryBuilder(){
  const { id } = useParams();
  const [it, setIt] = useState(null);
  const [dragData, setDragData] = useState(null);
  const [activeDragOverDay, setActiveDragOverDay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    if(!id) return;
    setLoading(true);
    API.get(`/itineraries/${id}`)
      .then(r => setIt(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  },[id]);

  const addDay = () => {
    const dayNum = (it.days?.length || 0) + 1;
    const newDay = { dayNumber: dayNum, summary: `Day ${dayNum} Summary`, activities: [] };
    const newIt = { ...it, days: [...(it.days||[]), newDay] };
    setIt(newIt);
  }

  const addActivity = (dayIndex, base) => {
    if (dayIndex < 0) {
      alert('Please add a day first!');
      return;
    }
    const act = base || { title: 'New Activity', description: 'Custom activity detail.', time: '09:00', durationMinutes: 60, cost: 0 };
    const newDays = it.days.map((d,i)=> i===dayIndex ? {...d, activities: [...(d.activities || []), act]} : d);
    setIt({...it, days: newDays});
  }

  const removeActivity = (dayIndex, activityIndex) => {
    const newDays = it.days.map((d, i) => {
      if (i !== dayIndex) return d;
      const newActs = [...(d.activities || [])];
      newActs.splice(activityIndex, 1);
      return { ...d, activities: newActs };
    });
    setIt({ ...it, days: newDays });
  }

  const onDragStart = (e, activity, fromDayIndex) => {
    setDragData({ activity, fromDayIndex });
    e.dataTransfer.setData('text/plain', 'activity');
  }

  const onDropToDay = (e, toDayIndex) => {
    e.preventDefault();
    setActiveDragOverDay(null);
    if(!dragData) return;
    const { activity, fromDayIndex } = dragData;
    
    // Check if dragging within same day or Suggestion
    if (fromDayIndex === undefined || fromDayIndex === null) return;
    if (fromDayIndex === toDayIndex) return;

    const newDays = it.days.map(d => ({ ...d, activities: [...(d.activities || [])] }));
    const srcActs = newDays[fromDayIndex].activities;
    
    // Find matching activity to move
    const idx = srcActs.findIndex(a => a.title === activity.title && a.time === activity.time);
    if(idx > -1) {
      const [moved] = srcActs.splice(idx, 1);
      newDays[toDayIndex].activities.push(moved);
      setIt({ ...it, days: newDays });
    }
    setDragData(null);
  }

  const totals = useMemo(()=>{
    if(!it) return { totalCost:0, totalMinutes:0 };
    let cost = 0, mins = 0;
    (it.days||[]).forEach(d=> (d.activities||[]).forEach(a=>{ cost += a.cost || 0; mins += a.durationMinutes || 0 }))
    return { totalCost: cost, totalMinutes: mins };
  },[it]);

  const onSave = async () => {
    try{
      await API.put(`/itineraries/${it._id}`, it);
      alert('Itinerary saved successfully!');
    }catch(err){
      console.error(err);
      alert('Save failed. Check network connection.');
    }
  }

  if(loading) {
    return <div className="animate-pulse py-12 space-y-6">
      <div className="h-10 bg-slate-900 rounded w-1/4"></div>
      <div className="h-64 bg-slate-900 rounded-3xl w-full"></div>
    </div>
  }

  if(!it) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center text-slate-400">
        Itinerary could not be loaded. <Link to="/destinations" className="text-indigo-400">Go back</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-4">
      {/* Header Panel */}
      <div className="glass-panel rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider block mb-1">Custom Planner</span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">{it.title}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex gap-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <div>
              <span className="text-[10px] text-slate-500 block">Est. Cost</span>
              <span className="text-base font-black text-emerald-400">₹{totals.totalCost}</span>
            </div>
            <div className="w-px bg-slate-800"></div>
            <div>
              <span className="text-[10px] text-slate-500 block">Total Hours</span>
              <span className="text-base font-black text-indigo-400">{Math.round(totals.totalMinutes/60)} hrs</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={addDay}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl transition-all"
            >
              + Add Day
            </button>
            <button 
              onClick={onSave}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/15 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              Save Itinerary
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Days Kanban board (3 Columns wide) */}
        <div className="lg:col-span-3">
          {(!it.days || it.days.length === 0) ? (
            <div className="glass-panel rounded-3xl p-16 text-center text-slate-500 border border-dashed border-slate-800/80">
              No days added to this itinerary yet. Click "+ Add Day" to start budgeting and scheduling!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {it.days.map((day, di)=> (
                <div 
                  key={di} 
                  onDragOver={(e) => { e.preventDefault(); setActiveDragOverDay(di); }}
                  onDragLeave={() => setActiveDragOverDay(null)}
                  onDrop={(e) => onDropToDay(e, di)} 
                  className={`day-column ${
                    activeDragOverDay === di ? 'border-indigo-500/40 bg-slate-900/60 shadow-lg shadow-indigo-500/5' : ''
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex justify-between items-center mb-4 border-b border-slate-800/50 pb-2">
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">{day.summary || `Day ${day.dayNumber}`}</h4>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mt-0.5">
                        {(day.activities || []).length} activities
                      </span>
                    </div>
                  </div>

                  {/* Activity Stack */}
                  <div className="space-y-3 min-h-[120px]">
                    {(day.activities || []).length === 0 ? (
                      <div className="text-[11px] text-slate-600 text-center py-8 border border-dashed border-slate-850 rounded-xl select-none">
                        Drop activities here
                      </div>
                    ) : (
                      (day.activities || []).map((a, ai) => (
                        <div 
                          key={ai} 
                          draggable 
                          onDragStart={(e) => onDragStart(e, a, di)}
                        >
                          <ActivityCard 
                            activity={a} 
                            onRemove={() => removeActivity(di, ai)} 
                          />
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Custom Activity */}
                  <button 
                    onClick={() => addActivity(di)}
                    className="w-full mt-4 py-2 border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/20 hover:bg-slate-950/40 rounded-xl text-center text-xs text-slate-500 hover:text-slate-400 font-bold transition-all"
                  >
                    + Add Custom Activity
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggestions Sidebar (1 Column wide) */}
        <aside className="glass-panel rounded-3xl p-6 space-y-6">
          <div>
            <h3 className="font-bold text-white text-base">Suggestions</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              Quickly add pre-modeled travel routines to the latest day, then drag them around to organize.
            </p>
          </div>

          <div className="space-y-4">
            {sampleSuggestions.map((s, si) => (
              <div 
                key={si} 
                className="p-3.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-850 rounded-2xl flex flex-col justify-between gap-3 group transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{s.title}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
                    <span>🕒 {s.time}</span>
                    <span>·</span>
                    <span>⏱️ {s.durationMinutes}m</span>
                    <span>·</span>
                    <span className="text-emerald-500">₹{s.cost}</span>
                  </p>
                  {s.description && (
                    <p className="text-[10px] text-slate-450 mt-1.5 leading-normal line-clamp-2">
                      {s.description}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => addActivity((it.days?.length || 1) - 1, s)}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold shadow-md transition-all active:scale-[0.98]"
                >
                  Add to Itinerary
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-[10px] text-slate-500 text-center leading-normal pt-2 border-t border-slate-900">
            💡 Drag activities between days to rearrange your schedule. Estimate metrics will update live!
          </div>
        </aside>
      </div>
    </div>
  )
}
