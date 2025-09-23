// App initialization and shared utilities

// Check for existing session
document.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('role');
    const phone = localStorage.getItem('phone');

    if (role && phone) {
        // Restore session
        state.role = role;
        state.phone = phone;
        
        // Show appropriate dashboard
        document.getElementById('roleSelection').classList.add('hidden');
        if (role === 'user') {
            document.getElementById('userDashboard').classList.remove('hidden');
        } else {
            document.getElementById('responderDashboard').classList.remove('hidden');
            // Initialize responder status
            updateStatusButton();
            startRequestsPolling();
        }
    }
});

// Handle logout (can be called from browser console)
function logout() {
    localStorage.removeItem('role');
    localStorage.removeItem('phone');
    location.reload();
}

// Error handler utility
function handleError(error, userMessage = 'Something went wrong. Please try again.') {
    console.error(error);
    alert(userMessage);
}