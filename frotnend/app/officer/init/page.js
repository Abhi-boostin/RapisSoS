"use client";
import { useState } from "react";

export default function OfficerInit() {
	const [form, setForm] = useState({ phone: "", fullName: "", personalContact: "", employeeId: "", rank: "", agency: "" });
	const [status, setStatus] = useState("");

	const save = async (e) => {
		e.preventDefault();
		setStatus("Saving...");
		try {
			const res = await fetch("http://localhost:4000/api/officers/init", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form)
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed");
			localStorage.setItem("officerPhone", form.phone);
			setStatus("Saved. Send OTP next.");
		} catch (e) { setStatus(String(e.message || e)); }
	};

	return (
		<div className="max-w-md mx-auto p-6 space-y-4">
			<h1 className="text-2xl font-semibold">Officer Onboarding</h1>
			<form onSubmit={save} className="space-y-3">
				<input className="w-full border p-2 rounded" placeholder="Phone (+E.164)" value={form.phone} onChange={e=>setForm(f=>({...f, phone:e.target.value}))} />
				<input className="w-full border p-2 rounded" placeholder="Full Name" value={form.fullName} onChange={e=>setForm(f=>({...f, fullName:e.target.value}))} />
				<input className="w-full border p-2 rounded" placeholder="Personal Contact" value={form.personalContact} onChange={e=>setForm(f=>({...f, personalContact:e.target.value}))} />
				<input className="w-full border p-2 rounded" placeholder="Employee ID" value={form.employeeId} onChange={e=>setForm(f=>({...f, employeeId:e.target.value}))} />
				<input className="w-full border p-2 rounded" placeholder="Rank" value={form.rank} onChange={e=>setForm(f=>({...f, rank:e.target.value}))} />
				<input className="w-full border p-2 rounded" placeholder="Agency" value={form.agency} onChange={e=>setForm(f=>({...f, agency:e.target.value}))} />
				<button className="w-full bg-black text-white py-2 rounded">Save</button>
			</form>
			<p className="text-sm text-gray-600">{status}</p>
		</div>
	);
} 