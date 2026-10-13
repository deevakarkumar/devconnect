import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api } from '../api';

export default function Search() {
  const [f, setF] = useState({ q: '', skill: '', location: '' }), [page, setPage] = useState(1);
  const qs = new URLSearchParams({ ...f, page: String(page) }).toString();
  const q = useQuery({ queryKey: ['search', qs], queryFn: () => api(`/users?${qs}`), placeholderData: keepPreviousData });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => { setF({ ...f, [k]: e.target.value }); setPage(1); };
  return <div className="space-y-3"><div className="grid sm:grid-cols-3 gap-2">
    <input className="input" placeholder="Name or username" value={f.q} onChange={set('q')} /><input className="input" placeholder="Skill" value={f.skill} onChange={set('skill')} /><input className="input" placeholder="Location" value={f.location} onChange={set('location')} /></div>
    {q.isLoading ? <p className="animate-pulse">Searching…</p> : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{(q.data?.items ?? []).map((u: any) => <Link key={u.id} to={`/u/${u.username}`} className="card hover:border-indigo-400">
      <b>{u.name}</b> <span className="text-sm text-slate-500">@{u.username}</span><p className="text-sm">{u.location}</p><p className="text-xs text-slate-500">{(u.skills ?? []).map((s: any) => s.name).join(', ') || 'No skills yet'}</p></Link>)}</div>}
    <div className="flex gap-2 items-center justify-center"><button className="btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button><span className="text-sm">{page} / {q.data?.pages || 1}</span><button className="btn-ghost" disabled={page >= (q.data?.pages || 1)} onClick={() => setPage(page + 1)}>Next</button></div></div>;
}
