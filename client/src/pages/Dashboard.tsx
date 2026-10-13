import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export default function Dashboard() {
  const q = useQuery({ queryKey: ['dashboard'], queryFn: () => api('/dashboard') });
  if (q.isLoading) return <p className="animate-pulse">Loading…</p>;
  if (q.error) return <p className="text-red-600">{(q.error as Error).message}</p>;
  const d = q.data ?? { stats: { connections: 0, posts: 0, endorsements: 0 }, feed: [], trending: [], suggestions: [], topSkills: [] };
  return <div className="space-y-4">
    <div className="grid grid-cols-3 gap-3 text-center">{Object.entries(d.stats).map(([k, v]) => <div key={k} className="card"><div className="text-2xl font-bold">{Number(v) || 0}</div><div className="text-xs capitalize text-slate-500">{k}</div></div>)}</div>
    <div className="grid md:grid-cols-2 gap-4">
      <section className="card"><h2 className="font-semibold mb-2">Activity feed</h2>{d.feed.length ? d.feed.map((p: any) => <Link key={p.id} to={`/blog/${p.id}`} className="block text-sm py-1"><b>{p.author?.name ?? 'Someone'}</b> posted “{p.title}”</Link>) : <p className="text-sm text-slate-500">Connect with developers to see their posts.</p>}</section>
      <section className="card"><h2 className="font-semibold mb-2">Trending posts</h2>{d.trending.length ? d.trending.map((p: any) => <Link key={p.id} to={`/blog/${p.id}`} className="block text-sm py-1">{p.title} <span className="text-slate-500">· {p.views ?? 0} views</span></Link>) : <p className="text-sm text-slate-500">No trending posts yet.</p>}</section>
      <section className="card"><h2 className="font-semibold mb-2">People you may know</h2>{d.suggestions.length ? d.suggestions.map((u: any) => <Link key={u.id} to={`/u/${u.username}`} className="block text-sm py-1">{u.name} <span className="text-slate-500">@{u.username}</span></Link>) : <p className="text-sm text-slate-500">Your suggestions will appear here.</p>}</section>
      <section className="card"><h2 className="font-semibold mb-2">Your top skills</h2>{d.topSkills.length ? d.topSkills.map((s: any) => <p key={s.name} className="text-sm">{s.name} · {s._count?.endorsements ?? 0} endorsements</p>) : <p className="text-sm text-slate-500">Add a skill to start building your profile.</p>}</section></div></div>;
}
