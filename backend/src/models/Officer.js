import mongoose from 'mongoose';

const OfficerSchema = new mongoose.Schema({
	phone: { type: String, required: true, unique: true },
	phoneVerified: { type: Boolean, default: false },

	fullName: { type: String },
	personalContact: { type: String },
	employeeId: { type: String },
	rank: { type: String },
	agency: { type: String },

	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Officer', OfficerSchema); 