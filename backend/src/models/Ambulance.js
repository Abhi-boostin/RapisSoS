import mongoose from "mongoose";

function isValidCoords(v) {
  return Array.isArray(v) && v.length === 2 && v.every((n) => Number.isFinite(n));
}

function sanitizeGeo(obj) {
  if (!obj) return undefined;
  const { type, coordinates } = obj || {};
  if (type === 'Point' && isValidCoords(coordinates)) {
    return { type: 'Point', coordinates };
  }
  return undefined; // drop invalid/partial geo
}

const CrewSchema = new mongoose.Schema(
  {
    driverName: String,
    paramedicName: String,
    attendantName: String,
    contactPhone: String,
    contactEmail: String
  },
  { _id: false }
);

const CapabilitiesSchema = new mongoose.Schema(
  {
    level: { type: String, enum: ["BLS", "ALS", "ICU"], default: "BLS" },
    oxygen: { type: Boolean, default: true },
    defibrillator: { type: Boolean, default: false },
    ventilator: { type: Boolean, default: false },
    neonatal: { type: Boolean, default: false }
  },
  { _id: false }
);

const GeoPointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"] }, // no default; only set when valid
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

const AmbulanceSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    phoneVerified: { type: Boolean, default: false },

    unitId: String,
    vehiclePlate: String,
    registrationNumber: String,
    makeModel: String,
    color: String,

    agencyName: String,
    ownership: { type: String, enum: ["public", "private", "ngo"], default: "public" },
    region: String,

    baseStation: {
      name: String,
      address: String,
      location: { type: GeoPointSchema, default: undefined } // only present when valid
    },

    capabilities: CapabilitiesSchema,
    crew: CrewSchema,

    status: { type: String, enum: ["available", "enroute", "busy", "offline"], default: "available" },

    currentLocation: { type: GeoPointSchema, default: undefined }, // only present when valid

    lastStatusAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Geospatial index stays; absent field is fine, invalid geo is not
AmbulanceSchema.index({ currentLocation: '2dsphere' });

// Sanitize before save
AmbulanceSchema.pre('save', function(next) {
  if (this.currentLocation) this.currentLocation = sanitizeGeo(this.currentLocation);
  if (this.baseStation && this.baseStation.location)
    this.baseStation.location = sanitizeGeo(this.baseStation.location);
  next();
});

// Sanitize in atomic updates
AmbulanceSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() || {};
  const $set = update.$set || update;

  if ($set.currentLocation) {
    const cleaned = sanitizeGeo($set.currentLocation);
    if (cleaned) $set.currentLocation = cleaned; else delete $set.currentLocation;
  }
  if ($set.baseStation?.location) {
    const cleaned = sanitizeGeo($set.baseStation.location);
    if (cleaned) $set['baseStation.location'] = cleaned; else {
      delete $set['baseStation.location'];
      if ($set.baseStation) delete $set.baseStation.location;
    }
  }
  if (!update.$set && $set !== update) update.$set = $set; // normalize
  this.setUpdate(update);
  next();
});

export default mongoose.model('Ambulance', AmbulanceSchema);
