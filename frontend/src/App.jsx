import React, { useEffect, useState } from 'react'
import { Routes, Route, NavLink, Link, useNavigate, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Destinations from './pages/Destinations'
import DestinationDetail from './pages/DestinationDetail'
import Packages from './pages/Packages'
import PackageDetail from './pages/PackageDetail'
import ItineraryBuilder from './pages/ItineraryBuilder'
import AdminPortal from './pages/AdminPortal'
import API, { setAuthToken } from './services/api'

export default function App(){
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  const loadCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      try {
        const res = await API.get('/users/me');
        setCurrentUser(res.data);
      } catch(e) {
        console.error('Session expired or invalid token');
        localStorage.removeItem('token');
        setAuthToken(null);
        setCurrentUser(null);
      }
    }
    setAuthLoading(false);
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setCurrentUser(null);
    navigate('/login');
  };

  const isAdmin = currentUser?.role === 'admin';

  const navLinkClass = ({ isActive }) => 
    `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive 
        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 shadow-md shadow-indigo-500/5' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
    }`;

  // Route protection wrapper for authenticated pages
  const Protected = ({ children }) => {
    if (authLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm mt-4 font-medium">Verifying credentials...</p>
        </div>
      );
    }
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // Route protection wrapper to prevent double login/signup screens
  const Public = ({ children }) => {
    if (authLoading) return null;
    if (currentUser) {
      return <Navigate to="/destinations" replace />;
    }
    return children;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative bg-grid-pattern">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:opacity-85 transition-opacity">
              ★ TravelSphere
            </span>
          </Link>

          {currentUser && (
            <nav className="flex items-center gap-2">
              <NavLink to="/destinations" className={navLinkClass}>Destinations</NavLink>
              <NavLink to="/packages" className={navLinkClass}>Packages</NavLink>
              <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
              {isAdmin && <NavLink to="/admin" className={navLinkClass}>Admin Portal</NavLink>}
            </nav>
          )}

          <div className="flex items-center gap-3">
            {authLoading ? (
              <div className="w-16 h-8 bg-slate-900 animate-pulse rounded-xl"></div>
            ) : currentUser ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/15 text-indigo-400 border border-indigo-500/35 flex items-center justify-center font-bold text-sm shadow-md">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-semibold text-slate-300 group-hover:text-slate-100 transition-colors">
                    {currentUser.name || 'Traveler'}
                  </span>
                </Link>
                <div className="w-px h-4 bg-slate-800"></div>
                <button 
                  onClick={handleLogout}
                  className="text-xs font-bold text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 relative z-10">
        <Routes>    
          <Route path="/register" element={<Public><Register/></Public>} />
          <Route path="/login" element={<Public><Login onLoginSuccess={setCurrentUser} /></Public>} />
          
          <Route path="/profile" element={<Protected><Profile onLogout={handleLogout} /></Protected>} />
          <Route path="/destinations" element={<Protected><Destinations/></Protected>} />
          <Route path="/destinations/:id" element={<Protected><DestinationDetail/></Protected>} />
          <Route path="/packages" element={<Protected><Packages/></Protected>} />
          <Route path="/packages/:id" element={<Protected><PackageDetail/></Protected>} />
          <Route path="/itineraries/:id" element={<Protected><ItineraryBuilder/></Protected>} />
          <Route path="/admin" element={<Protected><AdminPortal/></Protected>} />
          
          <Route path="/" element={<Protected>
            <div className="flex flex-col items-center text-center justify-center py-20 max-w-3xl mx-auto">
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-6">
                ✨ Plan your next luxury getaway
              </span>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                Design Your Perfect Trip with <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">TravelSphere</span>
              </h1>
              <p className="text-lg text-slate-400 mb-8 max-w-2xl">
                Choose exquisite destinations, unlock pre-packaged luxury itineraries, and build custom daily travel plans with interactive tools.
              </p>
              <div className="flex gap-4">
                <Link to="/destinations" className="px-6 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02]">
                  Explore Destinations
                </Link>
                <Link to="/packages" className="px-6 py-3.5 text-base font-semibold text-slate-300 hover:text-white glass-panel hover:bg-slate-900/60 rounded-xl transition-all hover:scale-[1.02]">
                  View Packages
                </Link>
              </div>
            </div>
          </Protected>} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 mt-auto z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div>© 2026 TravelSphere Inc. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
