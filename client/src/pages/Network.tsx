import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export default function Network() {
  const qc = useQueryClient(), q = useQuery({ queryKey: ['connections'], queryFn: () => api('/connections') });
  const m = useMutation({ mutationFn: (fn: () => Promise<unknown>) => fn(), onSuccess: () => qc.invalidateQueries({ queryKey: ['connections'] }) });
  if (q.isLoading) return <p className="animate-pulse">Loading…</p>;
  if (q.error) return <p className="text-red-600">{(q.error as Error).message}</p>;
  const { connections = [], incoming = [], outgoing = [] } = q.data ?? {};
  return <div className="space-y-4">
    <section className="card"><h2 className="font-semibold mb-2">Requests ({incoming.length})</h2>{incoming.length ? incoming.map((c: any) => <div key={c.id} className="flex justify-between items-center py-1"><Link to={`/u/${c.requester?.username ?? ''}`}>{c.requester?.name ?? 'User'}</Link>
      <span className="flex gap-2"><button className="btn" onClick={() => m.mutate(() => api(`/connections/${c.id}`, { method: 'PATCH', body: { action: 'accept' } }))}>Accept</button><button className="btn-ghost" onClick={() => m.mutate(() => api(`/connections/${c.id}`, { method: 'PATCH', body: { action: 'reject' } }))}>Reject</button></span></div>) : <p className="text-sm text-slate-500">No pending requests.</p>}
      {outgoing.length > 0 && <p className="text-sm text-slate-500 mt-2">{outgoing.length} sent request(s) pending</p>}</section>
    <section className="card"><h2 className="font-semibold mb-2">Connections ({connections.length})</h2>{connections.length ? connections.map((c: any) => <div key={c.id} className="flex justify-between py-1"><Link to={`/u/${c.user?.username ?? ''}`}>{c.user?.name ?? 'User'}</Link><button className="btn-ghost" onClick={() => m.mutate(() => api(`/connections/${c.id}`, { method: 'DELETE' }))}>Remove</button></div>) : <p className="text-sm text-slate-500">You do not have any connections yet.</p>}</section></div>;
}
