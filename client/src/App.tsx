import { useEffect } from 'react';
import { Routes, Route, Navigate, Link, Outlet, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { api, API } from './api';
import { useUI } from './store';
import { Login, Register } from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Network from './pages/Network';
import { Blog, Post, Editor } from './pages/Blog';

const Spinner = () => <div className="p-10 text-center text-slate-500 animate-pulse">Loading…</div>;

function Shell() {
  const nav = useNavigate(), qc = useQueryClient();
  const { menuOpen, toggleMenu, toasts, pushToast, clearToasts } = useUI();
  const me = useQuery({ queryKey: ['me'], queryFn: () => api('/auth/me'), retry: false });
  const notes = useQuery({ queryKey: ['notes'], queryFn: () => api<any[]>('/notifications'), enabled: !!me.data });
  useEffect(() => {
    if (!me.data) return;
    const s = io(API || undefined, { withCredentials: true });
    s.on('notification', n => { pushToast(n); qc.invalidateQueries({ queryKey: ['notes'] }); qc.invalidateQueries({ queryKey: ['connections'] }); });
    return () => { s.close(); };
  }, [me.data?.id]);
  if (me.isLoading) return <Spinner />;
  if (!me.data) return <Navigate to="/login" replace />;
  const unread = notes.data?.filter(n => !n.read).length || 0;
  const links: [string, string][] = [['/dashboard', 'Dashboard'], ['/search', 'Discover'], ['/network', 'Network'], ['/blog', 'Blog']];
  return <div className="min-h-screen pb-16 md:pb-0">
    <header className="bg-white border-b sticky top-0 z-10"><div className="max-w-5xl mx-auto flex items-center justify-between p-3">
      <Link to="/dashboard" className="font-bold text-indigo-600">DevConnect</Link>
      <nav className="hidden md:flex gap-4 text-sm">{links.map(([to, l]) => <Link key={to} to={to} className="hover:text-indigo-600">{l}</Link>)}</nav>
      <div className="flex items-center gap-3 text-sm">
        <button className="relative" aria-label="Notifications" onClick={() => { toggleMenu(); api('/notifications/read', { method: 'POST', body: {} }).then(() => qc.invalidateQueries({ queryKey: ['notes'] })); }}>🔔{unread > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-[10px] px-1">{unread}</span>}</button>
        <Link to={`/u/${me.data.username}`}>@{me.data.username}</Link>
        <button className="btn-ghost" onClick={async () => { await api('/auth/logout', { method: 'POST', body: {} }); qc.clear(); nav('/login'); }}>Logout</button>
      </div></div></header>
    {menuOpen && <div className="max-w-5xl mx-auto p-3"><div className="card space-y-2"><b>Notifications</b>{notes.data?.length ? notes.data.slice(0, 8).map(n => <p key={n.id} className="text-sm border-t pt-2">{n.message}</p>) : <p className="text-sm text-slate-500">Nothing yet.</p>}</div></div>}
    <main className="max-w-5xl mx-auto p-3"><Outlet /></main>
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t flex justify-around py-2 text-xs">{links.map(([to, l]) => <Link key={to} to={to} className="px-2 py-1">{l}</Link>)}</nav>
    <div className="fixed top-14 right-3 space-y-2 z-20">{toasts.slice(0, 3).map(t => <div key={t.id} className="bg-slate-900 text-white text-sm rounded-lg px-3 py-2 shadow" onClick={clearToasts}>{t.message}</div>)}</div>
  </div>;
}

export default function App() {
  return <Routes>
    <Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} />
    <Route element={<Shell />}>
      <Route path="/dashboard" element={<Dashboard />} /><Route path="/search" element={<Search />} /><Route path="/network" element={<Network />} />
      <Route path="/u/:username" element={<Profile />} />
      <Route path="/blog" element={<Blog />} /><Route path="/blog/new" element={<Editor />} /><Route path="/blog/:id/edit" element={<Editor />} /><Route path="/blog/:id" element={<Post />} />
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>;
}
