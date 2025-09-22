import mongoose from 'mongoose';

const OfficerSchema = new mongoose.Schema({
	phone: { type: String, required: true, unique: true },
	phoneVerified: { type: Boolean, default: false },

	fullName: { type: String },
	personalContact: { type: String },
	employeeId: { type: String },
	rank: { type: String },
	agency: { type: String },

	dutyStatus: { type: String, enum: ['on', 'off'], default: 'off' },
	currentLocation: {
		type: { type: String, enum: ['Point'], default: 'Point' },
		coordinates: { type: [Number], default: undefined }
	},
	lastStatusAt: { type: Date, default: Date.now },

	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

OfficerSchema.index({ currentLocation: '2dsphere' });

export default mongoose.model('Officer', OfficerSchema); 