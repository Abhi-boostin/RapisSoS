import mongoose from 'mongoose';

const RequestSchema = new mongoose.Schema({
	userPhone: { type: String, required: true },
	serviceType: { type: String, enum: ['police', 'ambulance'], required: true },

	userLocation: {
		type: { type: String, enum: ['Point'], default: 'Point' },
		coordinates: { type: [Number], required: true } // [lng, lat]
	},
	mapsUrl: { type: String },

	// initial target computed at dispatch
	assignedResponderType: { type: String, enum: ['officer', 'ambulance'], required: true },
	assignedResponderPhone: { type: String, required: true },
	assignedDistanceMeters: { type: Number },

	status: { type: String, enum: ['pending', 'accepted', 'declined', 'expired'], default: 'pending' },
	acceptedAt: { type: Date },
	declinedAt: { type: Date },
	expireAt: { type: Date },

	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

RequestSchema.index({ userLocation: '2dsphere' });

export default mongoose.model('Request', RequestSchema); 