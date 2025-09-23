import mongoose from "mongoose";

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
      location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: undefined }
      }
    },
    capabilities: CapabilitiesSchema,
    crew: CrewSchema,
    status: { type: String, enum: ["available", "enroute", "busy", "offline"], default: "available" },
    currentLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: undefined }
    },
    lastStatusAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

AmbulanceSchema.index({ currentLocation: '2dsphere' });

export default mongoose.model('Ambulance', AmbulanceSchema);
