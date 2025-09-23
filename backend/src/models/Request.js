import mongoose from 'mongoose';

const RequestSchema = new mongoose.Schema({
    userPhone: { 
        type: String, 
        required: true,
        index: true 
    },
    serviceType: { 
        type: String, 
        enum: ['ambulance', 'police'], 
        required: true 
    },
    userLocation: {
        type: { 
            type: String, 
            default: 'Point' 
        },
        coordinates: [Number]
    },
    mapsUrl: String,
    assignedResponderPhone: {
        type: String,
        index: true
    },
    assignedResponderType: { 
        type: String, 
        enum: ['ambulance', 'officer'] 
    },
    assignedDistanceMeters: Number,
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'declined', 'completed', 'expired'],
        default: 'pending',
        index: true
    },
    expireAt: {
        type: Date,
        index: true
    },
    acceptedAt: Date,
    declinedAt: Date,
    completedAt: Date,
    meta: {
        estimatedArrivalMinutes: Number,
        distance: Number
    }
}, {
    timestamps: true
});

// Compound index for faster request lookups
RequestSchema.index({ assignedResponderPhone: 1, status: 1 });

// Index for geospatial queries
RequestSchema.index({ userLocation: '2dsphere' });

// TTL index for auto-cleanup of expired requests
RequestSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// Middleware to handle request expiration
RequestSchema.pre('save', function(next) {
    if (this.expireAt && this.expireAt <= new Date()) {
        this.status = 'expired';
    }
    next();
});

// Virtual for remaining time
RequestSchema.virtual('secondsRemaining').get(function() {
    if (!this.expireAt) return 0;
    return Math.max(0, Math.floor((new Date(this.expireAt) - new Date()) / 1000));
});

export default mongoose.model('Request', RequestSchema);