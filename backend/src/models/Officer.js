import mongoose from 'mongoose';

function isValidCoords(v) {
  return Array.isArray(v) && v.length === 2 && v.every((n) => Number.isFinite(n));
}

function sanitizeGeo(obj) {
  if (!obj) return undefined;
  const { type, coordinates } = obj || {};
  if (type === 'Point' && isValidCoords(coordinates)) {
    return { type: 'Point', coordinates };
  }
  return undefined;
}

const GeoPointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'] }, // no default
    coordinates: {
      type: [Number],
      validate: {
        validator: (v) => v == null || isValidCoords(v),
        message: 'coordinates must be [longitude, latitude]'
      }
    }
  },
  { _id: false }
);

const OfficerSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    phoneVerified: { type: Boolean, default: false },

    fullName: { type: String },
    personalContact: { type: String },
    employeeId: { type: String },
    rank: { type: String },
    agency: { type: String },

    dutyStatus: { type: String, enum: ['on', 'off'], default: 'off' },

    currentLocation: { type: GeoPointSchema, default: undefined },

    lastStatusAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

OfficerSchema.index({ currentLocation: '2dsphere' });

OfficerSchema.pre('save', function(next) {
  if (this.currentLocation) this.currentLocation = sanitizeGeo(this.currentLocation);
  next();
});

OfficerSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() || {};
  const $set = update.$set || update;

  if ($set.currentLocation) {
    const cleaned = sanitizeGeo($set.currentLocation);
    if (cleaned) $set.currentLocation = cleaned; else delete $set.currentLocation;
  }

  if (!update.$set && $set !== update) update.$set = $set;
  this.setUpdate(update);
  next();
});

export default mongoose.model('Officer', OfficerSchema);
