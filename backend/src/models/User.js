import mongoose from 'mongoose';

const EmergencyContactSchema = new mongoose.Schema(
  { name: String, relationship: String, phone: String, email: String },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    phoneVerified: { type: Boolean, default: false },
    name: { first: String, middle: String, last: String },
    dob: Date,
    bloodGroup: String,
    allergies: [String],
    medicalConditions: [String],
    medications: [String],
    specialNeeds: [String],
    emergencyContacts: [EmergencyContactSchema],
    aadhaarNumber: String,
    homeAddress: String,
    photoUrl: String,
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
