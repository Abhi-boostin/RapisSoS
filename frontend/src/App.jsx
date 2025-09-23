import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Role from './pages/Role.jsx'
import Verify from './pages/Verify.jsx'
import CitizenDashboard from './pages/CitizenDashboard.jsx'
import ResponderDashboard from './pages/ResponderDashboard.jsx'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/role" replace />} />
        <Route path="/role" element={<Role />} />
        <Route path="/verify/:role" element={<Verify />} />
        <Route path="/dashboard/citizen" element={<CitizenDashboard />} />
        <Route path="/dashboard/officer" element={<ResponderDashboard kind="officer" />} />
        <Route path="/dashboard/ambulance" element={<ResponderDashboard kind="ambulance" />} />
        <Route path="*" element={<Navigate to="/role" replace />} />
      </Routes>
    </>
  )
}

export default App
