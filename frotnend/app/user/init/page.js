"use client";

import { useState } from "react";

export default function UserInit() {
	const [form, setForm] = useState({ phone: "", first: "", middle: "", last: "", aadhaarNumber: "" });
	const [status, setStatus] = useState("");

	const submit = async (e) => {
		e.preventDefault();
		setStatus("Saving...");
		try {
			const res = await fetch("http://localhost:4000/api/users/init", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					phone: form.phone,
					name: { first: form.first, middle: form.middle, last: form.last },
					aadhaarNumber: form.aadhaarNumber
				})
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed");
			localStorage.setItem("phone", form.phone);
			setStatus("Saved. Proceed to Verify Phone OTP.");
		} catch (e) {
			setStatus(String(e.message || e));
		}
	};

	return (
		<div className="max-w-md mx-auto p-6 space-y-4">
			<h1 className="text-2xl font-semibold">User Onboarding</h1>
			<form onSubmit={submit} className="space-y-3">
				<input className="w-full border p-2 rounded" placeholder="Phone (+E.164)" value={form.phone} onChange={e=>setForm(f=>({...f, phone:e.target.value}))} />
				<div className="grid grid-cols-3 gap-2">
					<input className="border p-2 rounded" placeholder="First" value={form.first} onChange={e=>setForm(f=>({...f, first:e.target.value}))} />
					<input className="border p-2 rounded" placeholder="Middle" value={form.middle} onChange={e=>setForm(f=>({...f, middle:e.target.value}))} />
					<input className="border p-2 rounded" placeholder="Last" value={form.last} onChange={e=>setForm(f=>({...f, last:e.target.value}))} />
				</div>
				<input className="w-full border p-2 rounded" placeholder="Aadhaar Number" value={form.aadhaarNumber} onChange={e=>setForm(f=>({...f, aadhaarNumber:e.target.value}))} />
				<button className="w-full bg-black text-white py-2 rounded">Save</button>
			</form>
			<p className="text-sm text-gray-600">{status}</p>
		</div>
	);
} 