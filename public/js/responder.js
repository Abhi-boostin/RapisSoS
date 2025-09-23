// Responder (Officer/Ambulance) related functions

// Toggle availability status
async function toggleStatus() {
    try {
        const newStatus = state.status === 'available' ? 'off' : 'available';
        const endpoint = state.role === 'officer' ? '/officers/status' : '/ambulances/status';

        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: state.phone,
                status: newStatus
            })
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        // Update state and UI
        state.status = newStatus;
        updateStatusButton();

    } catch (err) {
        alert(err.message || 'Failed to update status');
    }
}

// Update status button appearance
function updateStatusButton() {
    const button = document.getElementById('statusToggle');
    if (state.status === 'available') {
        button.textContent = 'Available';
        button.classList.remove('bg-gray-200', 'text-gray-700');
        button.classList.add('bg-green-500', 'text-white');
    } else {
        button.textContent = 'Offline';
        button.classList.remove('bg-green-500', 'text-white');
        button.classList.add('bg-gray-200', 'text-gray-700');
    }
}

// Start polling for new requests
function startRequestsPolling() {
    // Poll every 10 seconds
    setInterval(async () => {
        if (state.status === 'available') {
            await checkForRequests();
        }
    }, 10000);
}

// Check for new requests
async function checkForRequests() {
    try {
        const endpoint = state.role === 'officer' ? '/officers/requests' : '/ambulances/requests';
        const response = await fetch(`${API_BASE}${endpoint}?phone=${state.phone}`, {
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        updateRequestsList(data.requests);

    } catch (err) {
        console.error('Error checking requests:', err);
    }
}

// Update requests list in UI
function updateRequestsList(requests) {
    const requestsList = document.getElementById('requestsList');
    
    if (!requests.length) {
        requestsList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                No pending requests
            </div>
        `;
        return;
    }

    requestsList.innerHTML = requests.map(request => `
        <div class="bg-white rounded-lg shadow-lg p-6 space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-gray-900">Emergency Request</h3>
                <span class="text-sm text-gray-500">
                    ${Math.floor(request.secondsRemaining / 60)}:${String(request.secondsRemaining % 60).padStart(2, '0')}
                </span>
            </div>
            <div class="space-y-2 text-sm">
                <div class="flex items-center justify-between">
                    <span class="text-gray-600">Distance:</span>
                    <span class="font-medium">${(request.distanceMeters / 1000).toFixed(1)} km</span>
                </div>
            </div>
            <div class="flex space-x-3">
                <button onclick="acceptRequest('${request.id}')" 
                        class="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                    Accept
                </button>
                <button onclick="declineRequest('${request.id}')"
                        class="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                    Decline
                </button>
            </div>
            <div class="text-center">
                <a href="${request.mapsUrl}" target="_blank" 
                   class="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Open in Maps
                </a>
            </div>
        </div>
    `).join('');
}

// Accept emergency request
async function acceptRequest(requestId) {
    try {
        const endpoint = state.role === 'officer' 
            ? `/officers/requests/${requestId}/accept`
            : `/ambulances/requests/${requestId}/accept`;

        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                [`${state.role}Phone`]: state.phone
            })
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        // Update state and UI
        state.status = 'busy';
        updateStatusButton();
        // Open maps in new tab
        window.open(data.mapsUrl, '_blank');

    } catch (err) {
        alert(err.message || 'Failed to accept request');
    }
}

// Decline emergency request
async function declineRequest(requestId) {
    try {
        const endpoint = state.role === 'officer' 
            ? `/officers/requests/${requestId}/decline`
            : `/ambulances/requests/${requestId}/decline`;

        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                [`${state.role}Phone`]: state.phone
            })
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        // Remove request from list
        checkForRequests();

    } catch (err) {
        alert(err.message || 'Failed to decline request');
    }
}