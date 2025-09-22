"use client";
import { useEffect, useState } from "react";

export default function SOS() {
	const [phone, setPhone] = useState("");
	const [serviceType, setServiceType] = useState("police");
	const [status, setStatus] = useState("");

	useEffect(()=>{ setPhone(localStorage.getItem("phone") || ""); },[]);

	const sendSOS = async () => {
		setStatus("Locating...");
		navigator.geolocation.getCurrentPosition(async pos => {
			const { latitude, longitude } = pos.coords;
			setStatus("Dispatching...");
			try {
				await fetch("http://localhost:4000/api/sos", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ phone, type: serviceType, lat: latitude, lng: longitude })
				});
				const res = await fetch("http://localhost:4000/api/dispatch/create", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ phone, serviceType, lat: latitude, lng: longitude })
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Failed to dispatch");
				setStatus(`Assigned. Request ID: ${data.requestId}`);
			} catch (e) {
				setStatus(String(e.message || e));
			}
		}, err => setStatus(err.message), { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
	};

	return (
		<div className="max-w-md mx-auto p-6 space-y-4">
			<h1 className="text-2xl font-semibold">SOS</h1>
			<select className="w-full border p-2 rounded" value={serviceType} onChange={e=>setServiceType(e.target.value)}>
				<option value="police">Police</option>
				<option value="ambulance">Ambulance</option>
			</select>
			<button className="w-full bg-red-600 text-white py-2 rounded" onClick={sendSOS}>Send SOS</button>
			<p className="text-sm text-gray-600 break-all">{status}</p>
		</div>
	);
} 