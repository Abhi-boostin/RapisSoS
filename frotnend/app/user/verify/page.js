"use client";
import { useState, useEffect } from "react";

export default function VerifyUser() {
	const [phone, setPhone] = useState("");
	const [code, setCode] = useState("");
	const [status, setStatus] = useState("");

	useEffect(()=>{ setPhone(localStorage.getItem("phone") || ""); },[]);

	const verify = async (e) => {
		e.preventDefault();
		setStatus("Verifying...");
		try {
			const res = await fetch("http://localhost:4000/api/otp/verify-phone", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ phone, code })
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Invalid or expired code");
			setStatus("Verified!");
		} catch (e) { setStatus(String(e.message || e)); }
	};

	return (
		<div className="max-w-md mx-auto p-6 space-y-4">
			<h1 className="text-2xl font-semibold">Verify Phone</h1>
			<form onSubmit={verify} className="space-y-3">
				<input className="w-full border p-2 rounded" placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} />
				<input className="w-full border p-2 rounded" placeholder="6-digit code" value={code} onChange={e=>setCode(e.target.value)} />
				<button className="w-full bg-black text-white py-2 rounded">Verify</button>
			</form>
			<p className="text-sm text-gray-600">{status}</p>
		</div>
	);
} 