import User from '../models/User.js';
import Officer from '../models/Officer.js';
import Ambulance from '../models/Ambulance.js';

export async function detectUserType(phone) {
  try {
    // Check if phone exists in each model
    const user = await User.findOne({ phone });
    const officer = await Officer.findOne({ phone });
    const ambulance = await Ambulance.findOne({ phone });

    // Return the type and whether they are registered
    if (user) {
      return {
        type: 'user',
        isRegistered: !!user.name,
        hasPhoneVerified: user.phoneVerified
      };
    }

    if (officer) {
      return {
        type: 'officer',
        isRegistered: !!officer.badgeNumber,
        hasPhoneVerified: officer.phoneVerified
      };
    }

    if (ambulance) {
      return {
        type: 'ambulance',
        isRegistered: !!ambulance.vehicleNumber,
        hasPhoneVerified: ambulance.phoneVerified
      };
    }

    // If not found in any model, return null
    return null;
  } catch (err) {
    console.error('Error detecting user type:', err);
    throw new Error('Failed to detect user type');
  }
}