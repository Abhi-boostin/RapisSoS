import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { api } from '../api.js'

export default function Verify() {
  const { role: routeRole } = useParams()
  const nav = useNavigate()
  const { setPhone, setRole } = useAuth()
  const [phone, setPhoneInput] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const toE164 = (p) => (p.startsWith('+91') ? p : `+91${p.replace(/^\+?91/, '').replace(/\D/g,'')}`)

  const send = async () => {
    setError(''); setInfo(''); setSending(true)
    try {
      const phoneFmt = toE164(phone)
      if (routeRole === 'citizen') await api.sendUserOtp(phoneFmt)
      if (routeRole === 'officer') await api.sendOfficerOtp(phoneFmt)
      if (routeRole === 'ambulance') await api.sendAmbulanceOtp(phoneFmt)
      setInfo('OTP sent. Check your SMS.')
    } catch (e) { setError(e.message) } finally { setSending(false) }
  }

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setInfo('')
    setLoading(true)
    try {
      const phoneFmt = toE164(phone)
      let res
      if (routeRole === 'citizen') res = await api.verifyUser(phoneFmt, code)
      if (routeRole === 'officer') res = await api.verifyOfficer(phoneFmt, code)
      if (routeRole === 'ambulance') res = await api.verifyAmbulance(phoneFmt, code)
      if (!res?.success) throw new Error(res?.message || 'Verification failed')
      setPhone(phoneFmt)
      setRole(routeRole)
      if (routeRole === 'citizen') nav('/dashboard/citizen')
      if (routeRole === 'officer') nav('/dashboard/officer')
      if (routeRole === 'ambulance') nav('/dashboard/ambulance')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-950 text-white">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 bg-slate-900/70 p-6 rounded-xl border border-slate-800">
        <h1 className="text-2xl font-bold">Verify Phone ({routeRole})</h1>
        <input className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700" placeholder="Phone (+91...)" value={phone} onChange={(e)=>setPhoneInput(e.target.value)} required />
        <div className="flex gap-2">
          <button type="button" onClick={send} disabled={sending || !phone} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-60">{sending? 'Sending...' : 'Send OTP'}</button>
        </div>
        <input className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700" placeholder="OTP Code" value={code} onChange={(e)=>setCode(e.target.value)} required />
        {error && <div className="text-red-400 text-sm">{error}</div>}
        {info && <div className="text-teal-400 text-sm">{info}</div>}
        <button disabled={loading} className="w-full py-3 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold disabled:opacity-60">
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    </div>
  )
} 