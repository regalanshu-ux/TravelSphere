import React, {useState} from 'react'
import API, { setAuthToken } from '../services/api'
import { Link, useNavigate } from 'react-router-dom'

export default function Login({ onLoginSuccess }){
  const [form, setForm] = useState({email:'', password:''});
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState(''); // 'success' or 'error'
  const navigate = useNavigate();

  const onChange = e => setForm({...form, [e.target.name]: e.target.value});

  const handleLoginSuccess = async (token) => {
    setAuthToken(token);
    localStorage.setItem('token', token);
    try {
      const res = await API.get('/users/me');
      if (onLoginSuccess) onLoginSuccess(res.data);
      setStatus('success');
      setMsg('Sign-in successful! Redirecting...');
      setTimeout(() => {
        // Redirect based on role
        if (res.data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/destinations');
        }
      }, 1200);
    } catch(err) {
      console.error(err);
      setStatus('error');
      setMsg('Error loading profile details after authentication.');
    }
  }

  const login = async e => {
    e.preventDefault();
    setMsg('');
    setStatus('');
    try{
      const res = await API.post('/auth/login', form);
      const { token } = res.data;
      await handleLoginSuccess(token);
    }catch(err){
      setStatus('error');
      setMsg(err.response?.data?.message || 'Invalid credentials');
    }
  }

  return (
    <div className="max-w-md w-full mx-auto py-12">
      <div className="glass-panel rounded-3xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400 text-sm">Sign in to your TravelSphere account</p>
        </div>

        <form onSubmit={login} className="space-y-5">
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
            Sign In
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
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
