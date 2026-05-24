import React, {useEffect, useState} from 'react'
import API, { setAuthToken } from '../services/api'
import { Link, useNavigate } from 'react-router-dom'

export default function Profile({ onLogout }){
  const [user, setUser] = useState(null);
  const [prefs, setPrefs] = useState({});
  const [prefsText, setPrefsText] = useState('{}');
  const [jsonError, setJsonError] = useState('');
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(()=>{
    const token = localStorage.getItem('token');
    if(!token) {
      navigate('/login');
      return;
    }
    setAuthToken(token);
    API.get('/users/me')
      .then(r => { 
        setUser(r.data); 
        const p = r.data.preferences || {};
        setPrefs(p); 
        setPrefsText(JSON.stringify(p, null, 2));
      })
      .catch((err) => {
        console.error(err);
        if (onLogout) {
          onLogout();
        } else {
          localStorage.removeItem('token');
          setAuthToken(null);
          navigate('/login');
        }
      })
      .finally(() => setLoading(false));
  }, [navigate, onLogout]);

  const onPrefsTextChange = (val) => {
    setPrefsText(val);
    try {
      if(!val.trim()) {
        setPrefs({});
        setJsonError('');
        return;
      }
      const parsed = JSON.parse(val);
      setPrefs(parsed);
      setJsonError('');
    } catch(err) {
      setJsonError('Invalid JSON format (must be key-value pairs inside curly braces)');
    }
  }

  const savePrefs = async () => {
    if (jsonError) {
      setStatus('error');
      setMsg('Cannot save: Please fix the JSON syntax errors first.');
      return;
    }
    setMsg('');
    setStatus('');
    try{
      const res = await API.put('/users/me/preferences', prefs);
      setStatus('success');
      setMsg('Preferences updated successfully!');
    }catch(err){
      setStatus('error');
      setMsg('Failed to update preferences. Try again.');
    }
  }

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      setAuthToken(null);
      navigate('/');
    }
  };

  if(loading) {
    return <div className="animate-pulse py-12 space-y-6 max-w-xl mx-auto">
      <div className="h-10 bg-slate-900 rounded w-1/4"></div>
      <div className="h-40 bg-slate-900 rounded-3xl w-full"></div>
    </div>
  }

  if(!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-900">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-1">Account & Profile</h2>
          <p className="text-slate-400 text-sm">Manage your profile details and trip planning preferences.</p>
        </div>
        <button 
          onClick={handleLogoutClick}
          className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-rose-400 hover:text-rose-350 border border-slate-800 rounded-xl font-bold text-xs transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="glass-panel rounded-3xl p-6 h-fit space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/25 flex items-center justify-center font-black text-2xl">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">{user.name || 'Traveler'}</h3>
              <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded">
                Role: {user.role}
              </span>
            </div>
          </div>

          <div className="w-full h-px bg-slate-900"></div>

          <div className="space-y-4 text-xs font-medium">
            <div>
              <span className="text-slate-500 uppercase tracking-widest block mb-1">User ID</span>
              <span className="text-slate-300 select-all font-mono break-all">{user._id}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-widest block mb-1">Email Address</span>
              <span className="text-slate-300">{user.email || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-widest block mb-1">Phone Contact</span>
              <span className="text-slate-300">{user.phone || '—'}</span>
            </div>
          </div>
        </div>

        {/* Preferences Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Trip Preferences</h3>
              <p className="text-xs text-slate-400">
                Configure your customized travel preferences in JSON format. These preferences will help filter suggested activities during itinerary generation.
              </p>
            </div>

            <div className="relative">
              <textarea 
                value={prefsText} 
                onChange={e => onPrefsTextChange(e.target.value)} 
                rows={8}
                className={`w-full bg-slate-900 border ${
                  jsonError ? 'border-rose-500/60 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                } rounded-2xl p-4 text-xs font-mono text-slate-200 placeholder-slate-650 focus:outline-none transition-colors leading-relaxed`}
              />
              {jsonError && (
                <div className="mt-2 text-xs text-rose-400 font-medium flex items-center gap-1.5">
                  ⚠️ {jsonError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-900/80">
              <div className="text-[11px] text-slate-500 font-medium">
                Example: <code className="text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">{"{ \"interests\": [\"beach\"], \"budget\": \"luxury\" }"}</code>
              </div>
              <button 
                onClick={savePrefs}
                disabled={!!jsonError}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all ${
                  jsonError 
                    ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98]'
                }`}
              >
                Save Preferences
              </button>
            </div>

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
        </div>
      </div>
    </div>
  )
}
