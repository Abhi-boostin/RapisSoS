import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

export default function Role() {
  const nav = useNavigate()
  const { setRole } = useAuth()

  const choose = (r) => {
    setRole(r)
    nav(`/verify/${r}`)
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="w-full max-w-xl p-6">
        <h1 className="text-center text-3xl font-bold mb-8">Select Your Role</h1>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { k: 'citizen', label: 'Citizen' },
            { k: 'officer', label: 'Police' },
            { k: 'ambulance', label: 'Ambulance' },
          ].map((o) => (
            <button key={o.k} onClick={() => choose(o.k)} className="group rounded-xl px-6 py-12 bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700 backdrop-blur transition">
              <div className="text-xl font-semibold mb-2">{o.label}</div>
              <div className="text-slate-300 text-sm">Continue as {o.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 