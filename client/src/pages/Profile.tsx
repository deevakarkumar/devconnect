import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export default function Profile() {
  const { username } = useParams(), qc = useQueryClient();
  const q = useQuery({ queryKey: ['user', username], queryFn: () => api(`/users/${username}`) });
  const inv = () => { qc.invalidateQueries({ queryKey: ['user', username] }); qc.invalidateQueries({ queryKey: ['me'] }); };
  const [edit, setEdit] = useState(false), [f, setF] = useState<any>({}), [skill, setSkill] = useState(''), [p, setP] = useState<any>({ title: '', description: '', techStack: '', liveUrl: '', repoUrl: '' });
  const act = useMutation({ mutationFn: (fn: () => Promise<unknown>) => fn(), onSuccess: inv, onError: (e: Error) => alert(e.message) });
  if (q.isLoading) return <p className="p-6 animate-pulse">Loading…</p>;
  if (q.error) return <p className="p-6 text-red-600">{(q.error as Error).message}</p>;
  const u = q.data ?? { id: '', username: username ?? '', name: 'User', bio: '', location: '', isMe: false, mutualConnections: 0, skills: [], projects: [], connection: null };
  const c = u.connection, connected = c?.status === 'ACCEPTED';
  const compress = (file: File) => new Promise<Blob>(res => { const img = new Image(); img.onload = () => { const s = Math.min(1, 800 / Math.max(img.width, img.height)), cv = document.createElement('canvas'); cv.width = img.width * s; cv.height = img.height * s; cv.getContext('2d')!.drawImage(img, 0, 0, cv.width, cv.height); cv.toBlob(b => res(b!), 'image/jpeg', 0.85); }; img.src = URL.createObjectURL(file); });
  return <div className="space-y-4">
    <section className="card flex flex-col sm:flex-row gap-4 items-start">
      <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`} className="w-24 h-24 rounded-full object-cover" alt="" />
      <div className="flex-1 space-y-1">
        {edit ? <><input className="input" defaultValue={u.name} onChange={e => setF({ ...f, name: e.target.value })} /><textarea className="input" defaultValue={u.bio || ''} placeholder="Bio" onChange={e => setF({ ...f, bio: e.target.value })} /><input className="input" defaultValue={u.location || ''} placeholder="Location" onChange={e => setF({ ...f, location: e.target.value })} />
          <input type="file" accept="image/*" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; const fd = new FormData(); fd.append('image', await compress(file), 'avatar.jpg'); act.mutate(() => api('/users/me/avatar', { form: fd })); }} />
          <button className="btn" onClick={() => { act.mutate(() => api('/users/me', { method: 'PUT', body: f })); setEdit(false); }}>Save</button></>
        : <><h1 className="text-2xl font-bold">{u.name} <span className="text-sm text-slate-500">@{u.username}</span></h1><p>{u.bio}</p><p className="text-sm text-slate-500">📍 {u.location || 'Unknown'}{!u.isMe && ` · ${u.mutualConnections} mutual`}</p></>}
      </div>
      {u.isMe ? !edit && <button className="btn-ghost" onClick={() => setEdit(true)}>Edit profile</button>
        : !c ? <button className="btn" onClick={() => act.mutate(() => api(`/connections/${u.id}`, { method: 'POST', body: {} }))}>Connect</button>
        : connected ? <button className="btn-ghost" onClick={() => act.mutate(() => api(`/connections/${c.id}`, { method: 'DELETE' }))}>Remove</button> : <span className="text-sm text-slate-500">Pending</span>}
    </section>
    <section className="card"><h2 className="font-semibold mb-2">Skills</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{(u.skills ?? []).map((s: any) => <div key={s.id} className="border rounded-lg p-2 text-sm flex justify-between items-center">
        <span>{s.name} · <b>{s._count?.endorsements ?? 0}</b></span>
        {u.isMe ? <button onClick={() => act.mutate(() => api(`/users/me/skills/${s.id}`, { method: 'DELETE' }))}>✕</button>
          : connected && <button className="text-indigo-600" onClick={() => act.mutate(() => api(`/endorse/${s.id}`, { method: s.endorsements?.length ? 'DELETE' : 'POST', body: s.endorsements?.length ? undefined : {} }))}>{s.endorsements?.length ? 'Endorsed ✓' : '+1'}</button>}
      </div>)}</div>
      {u.isMe && <form className="flex gap-2 mt-3" onSubmit={e => { e.preventDefault(); act.mutate(() => api('/users/me/skills', { body: { name: skill } })); setSkill(''); }}><input className="input" placeholder="Add skill" value={skill} onChange={e => setSkill(e.target.value)} /><button className="btn">Add</button></form>}
    </section>
    <section className="card"><h2 className="font-semibold mb-2">Projects</h2>
      <div className="grid sm:grid-cols-2 gap-3">{(u.projects ?? []).map((pr: any) => <div key={pr.id} className="border rounded-lg p-3 text-sm space-y-1">
        <b>{pr.title}</b><p>{pr.description}</p><p className="text-slate-500">{(pr.techStack ?? []).join(' · ')}</p>
        <div className="flex gap-3">{pr.liveUrl && <a className="text-indigo-600" href={pr.liveUrl} target="_blank" rel="noreferrer">Live</a>}{pr.repoUrl && <a className="text-indigo-600" href={pr.repoUrl} target="_blank" rel="noreferrer">Repo</a>}{u.isMe && <button onClick={() => act.mutate(() => api(`/users/me/projects/${pr.id}`, { method: 'DELETE' }))}>Delete</button>}</div></div>)}</div>
      {u.isMe && <form className="grid gap-2 mt-3" onSubmit={e => { e.preventDefault(); act.mutate(() => api('/users/me/projects', { body: { ...p, techStack: p.techStack.split(',').map((s: string) => s.trim()).filter(Boolean) } })); setP({ title: '', description: '', techStack: '', liveUrl: '', repoUrl: '' }); }}>
        {(['title', 'description', 'techStack', 'liveUrl', 'repoUrl'] as const).map(k => <input key={k} className="input" placeholder={k === 'techStack' ? 'Tech stack (comma separated)' : k} value={p[k]} onChange={e => setP({ ...p, [k]: e.target.value })} required={k === 'title' || k === 'description'} />)}<button className="btn">Add project</button></form>}
    </section>
  </div>;
}
