import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth.jsx'
import { api } from '../api.js'

function useGeolocation() {
  const [coords, setCoords] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!('geolocation' in navigator)) { setError('Geolocation unavailable'); return }
    navigator.geolocation.getCurrentPosition(
      (pos)=> setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err)=> setError(err.message),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    )
  }, [])
  return { coords, error }
}

export default function CitizenDashboard() {
  const { phone } = useAuth()
  const [name, setName] = useState({ first: '', middle: '', last: '' })
  const [emergencyContacts, setEmergencyContacts] = useState([{ name: '', relationship: '', phone: '' }])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const { coords } = useGeolocation()

  const locationPayload = useMemo(() => coords ? ({ type: 'Point', coordinates: [coords.lng, coords.lat] }) : null, [coords])

  const update = async (e) => {
    e.preventDefault()
    setSaving(true); setMsg('')
    try {
      const res = await api.updateUser({ phone, name, emergencyContacts, location: locationPayload })
      if (res.success) setMsg('Profile saved')
    } catch (e) { setMsg(e.message) } finally { setSaving(false) }
  }

  const sendSOS = async (kind) => {
    if (!locationPayload) { setMsg('Enable location'); return }
    try {
      const fn = kind === 'police' ? api.sosOfficer : api.sosAmbulance
      const res = await fn(phone, locationPayload)
      if (!res.success) throw new Error(res.message)
      setMsg(`${kind === 'police' ? 'Police' : 'Ambulance'} notified. ETA ${res[kind==='police'?'officer':'ambulance'].estimatedMinutes} min`)
    } catch (e) { setMsg(e.message) }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Citizen Dashboard</h1>
        <form onSubmit={update} className="space-y-4 bg-slate-900/70 p-6 rounded-xl border border-slate-800">
          <div className="grid md:grid-cols-3 gap-3">
            <input className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700" placeholder="First" value={name.first} onChange={(e)=>setName({...name, first: e.target.value})} />
            <input className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700" placeholder="Middle" value={name.middle} onChange={(e)=>setName({...name, middle: e.target.value})} />
            <input className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700" placeholder="Last" value={name.last} onChange={(e)=>setName({...name, last: e.target.value})} />
          </div>
          <div className="space-y-2">
            <div className="text-sm text-slate-300">Emergency Contacts</div>
            {emergencyContacts.map((c, i) => (
              <div key={i} className="grid md:grid-cols-3 gap-3">
                <input className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700" placeholder="Name" value={c.name} onChange={(e)=>{
                  const copy=[...emergencyContacts]; copy[i]={...copy[i], name:e.target.value}; setEmergencyContacts(copy)
                }} />
                <input className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700" placeholder="Relationship" value={c.relationship} onChange={(e)=>{
                  const copy=[...emergencyContacts]; copy[i]={...copy[i], relationship:e.target.value}; setEmergencyContacts(copy)
                }} />
                <input className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700" placeholder="Phone" value={c.phone} onChange={(e)=>{
                  const copy=[...emergencyContacts]; copy[i]={...copy[i], phone:e.target.value}; setEmergencyContacts(copy)
                }} />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button disabled={saving} className="px-4 py-2 rounded-lg bg-teal-500 text-slate-900 font-semibold disabled:opacity-60">{saving? 'Saving...' : 'Save Details'}</button>
          </div>
        </form>

        <div className="bg-slate-900/70 p-6 rounded-xl border border-slate-800">
          <div className="text-sm text-slate-300 mb-2">Your location will be sent with SOS</div>
          <div className="flex gap-4">
            <button onClick={()=>sendSOS('police')} className="px-4 py-3 rounded-lg bg-blue-500 text-slate-900 font-semibold">SOS Police</button>
            <button onClick={()=>sendSOS('ambulance')} className="px-4 py-3 rounded-lg bg-rose-500 text-slate-900 font-semibold">SOS Ambulance</button>
          </div>
        </div>
        {msg && <div className="text-slate-200">{msg}</div>}
      </div>
    </div>
  )
} 