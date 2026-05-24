import React, {useState} from 'react'
import API from '../services/api'
import { Link, useNavigate } from 'react-router-dom'

export default function Register(){
  const [form, setForm] = useState({name:'', email:'', password:''});
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState(''); // 'success' or 'error'
  const navigate = useNavigate();

  const onChange = e => setForm({...form, [e.target.name]: e.target.value});
  const onSubmit = async e => {
    e.preventDefault();
    setMsg('');
    setStatus('');
    try{
      const res = await API.post('/auth/register', form);
      setStatus('success');
      setMsg('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }catch(err){
      setStatus('error');
      setMsg(err.response?.data?.message || 'Error occurred during registration');
    }
  }

  return (
    <div className="max-w-md w-full mx-auto py-12">
      <div className="glass-panel rounded-3xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Create Account</h2>
          <p className="text-slate-400 text-sm">Join TravelSphere and explore the world</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
            <input 
              name="name" 
              value={form.name} 
              onChange={onChange} 
              placeholder="Jane Doe"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
            <input 
              name="email" 
              type="email"
              value={form.email} 
              onChange={onChange} 
              placeholder="jane@example.com"
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
            <input 
              name="password" 
              type="password"
              value={form.password} 
              onChange={onChange} 
              placeholder="••••••••"
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] mt-4"
          >
            Create Account
          </button>
        </form>

        {msg && (
          <div className={`mt-6 p-4 rounded-xl text-center text-sm border ${
            status === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {msg}
          </div>
        )}

        <div className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
