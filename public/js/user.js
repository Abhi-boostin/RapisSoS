// User related functions

// Send SOS request
async function sendSOS(type) {
    try {
        // Get user's location
        const position = await getCurrentPosition();
        const location = {
            type: 'Point',
            coordinates: [position.coords.longitude, position.coords.latitude]
        };

        // Send request
        const endpoint = type === 'police' ? '/users/sos/officer' : '/users/sos/ambulance';
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: state.phone,
                location
            })
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Failed to send SOS');

        // Show status panel
        showSOSStatus(type, data);
        // Start polling for updates
        startSOSStatusPolling(data.requestId);

    } catch (err) {
        alert(err.message || 'Failed to send SOS. Please try again.');
    }
}

// Show SOS status panel
function showSOSStatus(type, data) {
    const sosStatus = document.getElementById('sosStatus');
    const sosDetails = document.getElementById('sosDetails');
    const responder = data[type === 'police' ? 'officer' : 'ambulance'];

    sosStatus.classList.remove('hidden');
    sosDetails.innerHTML = `
        <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">Distance:</span>
            <span class="font-medium">${responder.distance} km</span>
        </div>
        <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">ETA:</span>
            <span class="font-medium">${responder.estimatedMinutes} minutes</span>
        </div>
        <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">${type === 'police' ? 'Badge Number' : 'Vehicle Number'}:</span>
            <span class="font-medium">${type === 'police' ? responder.badgeNumber : responder.vehicleNumber}</span>
        </div>
        <div class="mt-4">
            <a href="${data.mapsUrl}" target="_blank" 
               class="block w-full py-2 text-center text-blue-600 hover:text-blue-700 font-medium">
                Open in Maps
            </a>
        </div>
    `;
}

// Get current position
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
        }
        
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    });
}

// Poll for SOS status updates
function startSOSStatusPolling(requestId) {
    state.requestId = requestId;
    // Poll every 10 seconds
    const pollInterval = setInterval(async () => {
        try {
            const response = await fetch(`${API_BASE}/users/requests/${requestId}`, {
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            
            // Update UI based on status
            if (data.status === 'accepted') {
                clearInterval(pollInterval);
                // Update UI to show responder is on the way
                updateSOSStatus(data);
            } else if (data.status === 'completed' || data.status === 'expired') {
                clearInterval(pollInterval);
                resetSOSStatus();
            }
        } catch (err) {
            console.error('Error polling status:', err);
        }
    }, 10000);
}

// Update SOS status display
function updateSOSStatus(data) {
    const sosDetails = document.getElementById('sosDetails');
    // Update ETA and other details
}

// Reset SOS status
function resetSOSStatus() {
    const sosStatus = document.getElementById('sosStatus');
    sosStatus.classList.add('hidden');
    state.requestId = null;
}