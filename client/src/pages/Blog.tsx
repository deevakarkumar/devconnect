import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { api } from '../api';

export function Blog() {
  const q = useQuery({ queryKey: ['posts'], queryFn: () => api<any[]>('/posts') });
  return <div className="space-y-3"><div className="flex justify-between"><h1 className="text-xl font-bold">Blog</h1><Link className="btn" to="/blog/new">Write post</Link></div>
    {q.isLoading ? <p className="animate-pulse">Loading…</p> : (q.data ?? []).length ? (q.data ?? []).map(p => <Link key={p.id} to={`/blog/${p.id}`} className="card block hover:border-indigo-400"><b>{p.title}</b><p className="text-sm text-slate-500">{p.author?.name ?? 'Unknown author'} · {new Date(p.createdAt).toLocaleDateString()} · {p.views ?? 0} views</p></Link>) : <p className="text-sm text-slate-500">No posts yet. Start the conversation.</p>}</div>;
}
export function Post() {
  const { id } = useParams(), nav = useNavigate(), qc = useQueryClient();
  const q = useQuery({ queryKey: ['post', id], queryFn: () => api(`/posts/${id}`) }), me = useQuery({ queryKey: ['me'], queryFn: () => api('/auth/me') });
  if (q.isLoading) return <p className="animate-pulse">Loading…</p>;
  if (q.error) return <p className="text-red-600">{(q.error as Error).message}</p>;
  const p = q.data ?? { id: '', title: 'Post not found', content: '', author: { username: '', name: 'Unknown' }, createdAt: new Date().toISOString() };
  return <article className="card prose max-w-none"><h1 className="text-2xl font-bold">{p.title}</h1>
    <p className="text-sm text-slate-500"><Link to={`/u/${p.author?.username ?? ''}`}>{p.author?.name ?? 'Unknown author'}</Link> · {new Date(p.createdAt).toLocaleDateString()}</p>
    {me.data?.id === p.author?.id && <div className="flex gap-2 my-2"><Link className="btn-ghost" to={`/blog/${p.id}/edit`}>Edit</Link><button className="btn-ghost" onClick={async () => { await api(`/posts/${p.id}`, { method: 'DELETE' }); qc.invalidateQueries({ queryKey: ['posts'] }); nav('/blog'); }}>Delete</button></div>}
    <div className="[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_h2]:text-xl [&_h2]:font-semibold [&_p]:my-2 [&_pre]:my-3"><ReactMarkdown rehypePlugins={[rehypeHighlight]}>{p.content}</ReactMarkdown></div></article>;
}
export function Editor() {
  const { id } = useParams(), nav = useNavigate(), qc = useQueryClient();
  const ex = useQuery({ queryKey: ['post', id], queryFn: () => api(`/posts/${id}`), enabled: !!id });
  const [t, setT] = useState<string | null>(null), [c, setC] = useState<string | null>(null), [err, setErr] = useState('');
  const title = t ?? ex.data?.title ?? '', content = c ?? ex.data?.content ?? '';
  const save = async () => { try { const r = await api(id ? `/posts/${id}` : '/posts', { method: id ? 'PUT' : 'POST', body: { title, content } }); qc.invalidateQueries({ queryKey: ['posts'] }); qc.invalidateQueries({ queryKey: ['post', id] }); nav(`/blog/${id || r.id}`); } catch (e) { setErr((e as Error).message); } };
  return <div className="grid md:grid-cols-2 gap-3"><div className="space-y-2"><input className="input" placeholder="Title" value={title} onChange={e => setT(e.target.value)} />
    <textarea className="input h-96 font-mono" placeholder="Write in Markdown…" value={content} onChange={e => setC(e.target.value)} />{err && <p className="text-red-600 text-sm">{err}</p>}<button className="btn" onClick={save}>Publish</button></div>
    <div className="card overflow-auto"><ReactMarkdown rehypePlugins={[rehypeHighlight]}>{content || '*Preview*'}</ReactMarkdown></div></div>;
}
