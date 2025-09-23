// Authentication related functions

// Handles initial role selection
function selectRole(role) {
    state.role = role;
    document.getElementById('roleSelection').classList.add('hidden');
    document.getElementById('phoneVerification').classList.remove('hidden');
    
    // Update verification title based on role
    const title = document.getElementById('verificationTitle');
    switch(role) {
        case 'user':
            title.textContent = 'Enter Your Phone Number';
            break;
        case 'officer':
            title.textContent = 'Officer Verification';
            break;
        case 'ambulance':
            title.textContent = 'Ambulance Service Verification';
            break;
    }
}

// Get endpoint based on role
function getVerifyEndpoint() {
    switch(state.role) {
        case 'user':
            return '/users/verifyotp';
        case 'officer':
            return '/officers/verifyotp';
        case 'ambulance':
            return '/ambulances/verifyotp';
        default:
            throw new Error('Invalid role');
    }
}

// Handle phone verification flow
async function handleVerification() {
    const phoneInput = document.getElementById('phone');
    const otpInput = document.getElementById('otp');
    const errorDiv = document.getElementById('errorMessage');
    const verifyButton = document.getElementById('verifyButton');
    const otpSection = document.getElementById('otpSection');

    try {
        if (otpSection.classList.contains('hidden')) {
            // Send OTP
            let phone = phoneInput.value;
            if (!phone) throw new Error('Please enter your phone number');
            if (!/^[6-9]\d{9}$/.test(phone)) throw new Error('Please enter a valid 10-digit number');
            
            phone = '+91' + phone;
            state.phone = phone;

            // Show OTP input
            otpSection.classList.remove('hidden');
            verifyButton.textContent = 'Verify OTP';
            phoneInput.disabled = true;

        } else {
            // Verify OTP
            const otp = otpInput.value;
            if (!otp || !/^\d{6}$/.test(otp)) throw new Error('Please enter valid 6-digit OTP');

            const response = await fetch(`${API_BASE}${getVerifyEndpoint()}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: state.phone,
                    code: otp
                })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'Verification failed');

            // Store in localStorage
            localStorage.setItem('role', state.role);
            localStorage.setItem('phone', state.phone);

            // Show appropriate dashboard
            document.getElementById('phoneVerification').classList.add('hidden');
            if (state.role === 'user') {
                document.getElementById('userDashboard').classList.remove('hidden');
            } else {
                document.getElementById('responderDashboard').classList.remove('hidden');
                // Start polling for requests
                startRequestsPolling();
            }
        }

        errorDiv.classList.add('hidden');

    } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.classList.remove('hidden');
    }
}