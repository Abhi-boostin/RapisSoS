// Get current location
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    type: 'Point',
                    coordinates: [position.coords.longitude, position.coords.latitude]
                });
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
};

// Format phone number to E.164 format
export const formatPhone = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present
    return cleaned.startsWith('91') ? `+${cleaned}` : `+91${cleaned}`;
};

// Format distance for display
export const formatDistance = (meters) => {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
};

// Format time remaining
export const formatTimeRemaining = (seconds) => {
    if (seconds < 60) {
        return `${seconds}s`;
    }
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

// Open location in Google Maps
export const openInMaps = (mapsUrl) => {
    window.open(mapsUrl, '_blank');
};