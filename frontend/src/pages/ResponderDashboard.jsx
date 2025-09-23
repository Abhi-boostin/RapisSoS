import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth.jsx'
import { api } from '../api.js'

export default function ResponderDashboard({ kind }) {
  const { phone } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    if (!phone) return
    setLoading(true)
    try {
      const res = kind==='officer' ? await api.officerRequests(phone) : await api.ambulanceRequests(phone)
      setRequests(res.requests || [])
    } catch (e) { setMsg(e.message) } finally { setLoading(false) }
  }

  useEffect(()=>{ load() }, [])

  const act = async (id, action) => {
    try {
      const fn = kind==='officer' 
        ? (action==='accept'? api.officerAccept : api.officerDecline)
        : (action==='accept'? api.ambulanceAccept : api.ambulanceDecline)
      const res = await fn(id, phone)
      if (!res.success) throw new Error(res.message)
      setMsg(res.message)
      await load()
    } catch (e) { setMsg(e.message) }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid md:grid-cols-[320px,1fr] gap-6 p-6">
        <aside className="bg-slate-900/70 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Requests</div>
            <button onClick={load} className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700">{loading? '...' : 'Refresh'}</button>
          </div>
          <div className="space-y-2 max-h-[70vh] overflow-auto pr-1">
            {requests.length === 0 && <div className="text-sm text-slate-400">No pending requests</div>}
            {requests.map(r => (
              <div key={r.id} className="p-3 rounded border border-slate-700 bg-slate-800/50">
                <div className="text-sm">{r.user?.name?.first || 'Unknown'} • {Math.round((r.distanceMeters||0))} m</div>
                <div className="text-xs text-slate-400">{r.secondsRemaining}s left</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={()=>act(r.id, 'accept')} className="px-3 py-1 rounded bg-teal-500 text-slate-900 font-semibold">Accept</button>
                  <button onClick={()=>act(r.id, 'decline')} className="px-3 py-1 rounded bg-rose-500 text-slate-900 font-semibold">Decline</button>
                </div>
              </div>
            ))}
          </div>
        </aside>
        <main className="bg-slate-900/70 rounded-xl border border-slate-800 p-4">
          <h1 className="text-2xl font-bold mb-4">{kind === 'officer' ? 'Officer' : 'Ambulance'} Dashboard</h1>
          <div className="text-sm text-slate-300 mb-3">Click a request to see details</div>
          {requests[0] && (
            <div className="space-y-3">
              <div className="text-lg font-semibold">Current Request</div>
              <a className="text-teal-400 underline" href={requests[0].mapsUrl} target="_blank">Open Maps</a>
              <div className="text-sm">User: {requests[0].user?.name?.first} {requests[0].user?.name?.last}</div>
              <div className="text-sm">Phone: {requests[0].user?.phone}</div>
              <div className="text-sm">Blood: {requests[0].user?.bloodGroup || '-'}</div>
              <div className="text-sm">Allergies: {(requests[0].user?.allergies||[]).join(', ')}</div>
              <div className="text-sm">Conditions: {(requests[0].user?.medicalConditions||[]).join(', ')}</div>
              <div className="text-sm">Medications: {(requests[0].user?.medications||[]).join(', ')}</div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Emergency Contacts</div>
                <ul className="text-sm list-disc pl-5">
                  {(requests[0].user?.emergencyContacts||[]).map((c,i)=>(
                    <li key={i}>{c.name} • {c.relationship} • {c.phone}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {msg && <div className="mt-4 text-slate-200">{msg}</div>}
        </main>
      </div>
    </div>
  )
} 