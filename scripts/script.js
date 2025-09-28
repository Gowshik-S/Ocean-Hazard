// Wait for the entire HTML document to be loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- SECTION 1: ELEMENT SELECTION ---
    const authModal = document.getElementById('auth-modal');
    const reportModal = document.getElementById('report-modal');
    const loginButton = document.getElementById('login-btn');
    const citizenLoginButton = document.getElementById('citizen-login-btn');
    const reportButtons = document.querySelectorAll('#report-hazard-btn, #hero-report-btn');
    const closeButtons = document.querySelectorAll('.close-button');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const reportForm = document.getElementById('hazard-report-modal-form');
    const navActions = document.querySelector('.nav-actions');

    // Authentication modal elements
    const authTabs = document.querySelectorAll('.auth-tab');
    const authSections = document.querySelectorAll('.auth-section');
    const passwordToggles = document.querySelectorAll('.password-toggle i');

    // --- SECTION 2: UTILITY FUNCTIONS ---
    
    function generateReferenceId() {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `OG-${timestamp}-${randomStr}`;
    }

    function getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject('Geolocation is not supported by this browser');
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude.toFixed(6);
                    const lng = position.coords.longitude.toFixed(6);
                    resolve(`${lat}, ${lng}`);
                },
                (error) => {
                    reject('Unable to retrieve location');
                }
            );
        });
    }

    // --- SECTION 3: MODAL MANAGEMENT ---

    function openModal(modal) {
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // --- SECTION 4: AUTHENTICATION MODAL FUNCTIONALITY ---

    // Tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            // Update active tab
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding section
            authSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${tabName}-section`) {
                    section.classList.add('active');
                }
            });
        });
    });

    // Password visibility toggle
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.parentElement.previousElementSibling;
            const isPassword = input.type === 'password';
            
            input.type = isPassword ? 'text' : 'password';
            toggle.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
        });
    });

    // --- SECTION 5: EVENT LISTENERS ---

    // Open authentication modal
    if (loginButton) {
        loginButton.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(authModal);
        });
    }

    if (citizenLoginButton) {
        citizenLoginButton.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(authModal);
        });
    }

    // Open report modal
    reportButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(reportModal);
        });
    });

    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });

    // Get location button
    const getLocationBtn = document.getElementById('get-location');
    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', async () => {
            const locationInput = document.getElementById('modal-location');
            getLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting Location...';
            getLocationBtn.disabled = true;
            
            try {
                const coords = await getCurrentLocation();
                locationInput.value = coords;
                getLocationBtn.innerHTML = '<i class="fas fa-check"></i> Location Set';
                setTimeout(() => {
                    getLocationBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Use My Location';
                    getLocationBtn.disabled = false;
                }, 2000);
            } catch (error) {
                alert('Could not get your location: ' + error);
                getLocationBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Use My Location';
                getLocationBtn.disabled = false;
            }
        });
    }

    // --- SECTION 6: USER STATE & HEADER MANAGEMENT ---

    function checkLoginState() {
        const user = window.oceanHazardAPI.user;

        if (user) {
            // Update navigation based on user role
            updateNavigationForUser(user);
            
            // Update nav actions
            if (navActions) {
                let navActionsHTML = `<span class="welcome-user">Welcome, ${user.full_name || user.first_name + ' ' + user.last_name}</span>`;
                
                if (user.role === 'public') {
                    navActionsHTML += `
                        <a href="#" class="btn btn--primary" id="report-hazard-btn">New Report</a>
                        <a href="#" id="logout-button" class="btn btn--secondary">Logout</a>
                    `;
                } else if (user.role === 'admin') {
                    navActionsHTML += `
                        <a href="reports.html" class="btn btn--primary">Admin Dashboard</a>
                        <a href="#" id="logout-button" class="btn btn--secondary">Logout</a>
                    `;
                } else if (user.role === 'rescue_team') {
                    navActionsHTML += `
                        <a href="reports.html" class="btn btn--primary">Rescue Dashboard</a>
                        <a href="#" id="logout-button" class="btn btn--secondary">Logout</a>
                    `;
                } else if (user.role === 'authority') {
                    navActionsHTML += `
                        <a href="reports.html" class="btn btn--primary">Authority Dashboard</a>
                        <a href="#" id="logout-button" class="btn btn--secondary">Logout</a>
                    `;
                }
                
                navActions.innerHTML = navActionsHTML;
                
                // Re-add event listeners
                const newReportBtn = document.getElementById('report-hazard-btn');
                const logoutBtn = document.getElementById('logout-button');
                
                if (newReportBtn) {
                    newReportBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        openModal(reportModal);
                    });
                }
                
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', logout);
                }
            }
        }
    }

    function updateNavigationForUser(user) {
        // Update navigation menu based on user role
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;

        // Clear existing menu items
        navMenu.innerHTML = '<li><a href="index.html">Home</a></li>';

        // Add role-specific menu items
        if (user.role === 'public') {
            navMenu.innerHTML += `
                <li><a href="analytics.html">Analytics</a></li>
                <li><a href="my-reports.html">My Reports</a></li>
                <li><a href="#">About Us</a></li>
            `;
        } else if (user.role === 'admin') {
            navMenu.innerHTML += `
                <li><a href="analytics.html">Analytics</a></li>
                <li><a href="reports.html">Incident Reports</a></li>
                <li><a href="my-reports.html">My Reports</a></li>
                <li><a href="#">About Us</a></li>
            `;
        } else if (user.role === 'rescue_team') {
            navMenu.innerHTML += `
                <li><a href="analytics.html">Analytics</a></li>
                <li><a href="reports.html">Incident Reports</a></li>
                <li><a href="my-reports.html">My Reports</a></li>
                <li><a href="#">About Us</a></li>
            `;
        } else if (user.role === 'authority') {
            navMenu.innerHTML += `
                <li><a href="analytics.html">Analytics</a></li>
                <li><a href="reports.html">Incident Reports</a></li>
                <li><a href="my-reports.html">My Reports</a></li>
                <li><a href="#">About Us</a></li>
            `;
        }
    }

    // --- SECTION 7: FORM HANDLING ---

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            try {
                // Use API client for authentication
                const response = await window.oceanHazardAPI.login(username, password);
                
                // Determine redirect based on user role
                let redirectTo = '';
                if (response.user.role === 'public') {
                    redirectTo = 'my-reports.html';
                } else if (['admin', 'authority'].includes(response.user.role)) {
                    redirectTo = 'reports.html';
                }

                alert('Login successful! Redirecting...');
                window.location.href = redirectTo;
                
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed: ' + error.message);
            }
        });
    }

    // Registration form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const formData = new FormData(registerForm);
            const password = formData.get('password');
            const confirmPassword = formData.get('confirm-password');
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            if (password.length < 6) {
                alert('Password must be at least 6 characters long!');
                return;
            }
            
            const userData = {
                username: formData.get('email'), // Use email as username
                email: formData.get('email'),
                first_name: formData.get('firstname'),
                last_name: formData.get('lastname'),
                phone: formData.get('phone'),
                location: formData.get('location'),
                password: password
            };
            
            try {
                // Use API client for registration
                const response = await window.oceanHazardAPI.register(userData);
                alert('Registration successful! Welcome to Ocean Guard!');
                window.location.href = 'my-reports.html';
            } catch (error) {
                console.error('Registration error:', error);
                alert('Registration failed: ' + error.message);
            }
        });
    }

    // Report form submission
    if (reportForm) {
        reportForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const formData = new FormData(reportForm);
            const urgency = document.querySelector('input[name="urgency"]:checked').value;
            
            // Extract coordinates if location contains them
            const location = formData.get('location');
            let latitude = null, longitude = null;
            
            if (location.includes(',')) {
                const coords = location.split(',').map(coord => parseFloat(coord.trim()));
                if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                    latitude = coords[0];
                    longitude = coords[1];
                }
            }
            
            const incidentData = {
                hazard_type: formData.get('hazard-type'),
                location: location,
                latitude: latitude,
                longitude: longitude,
                description: formData.get('description'),
                urgency: urgency,
                contact_info: formData.get('contact')
            };

            try {
                // Use API client to create incident
                const response = await window.oceanHazardAPI.createIncident(incidentData);
                
                // Show success message with reference ID
                closeModal(reportModal);
                
                // Create and show success notification
                const notification = document.createElement('div');
                notification.className = 'success-notification';
                notification.innerHTML = `
                    <div class="notification-content">
                        <i class="fas fa-check-circle"></i>
                        <h3>Report Submitted Successfully!</h3>
                        <p>Your hazard report has been submitted to the authorities.</p>
                        <p><strong>Reference ID: ${response.reference_id}</strong></p>
                        <p>Please save this reference ID for tracking your report.</p>
                        <button class="btn btn--primary" onclick="this.parentElement.parentElement.remove()">Close</button>
                    </div>
                `;
                
                document.body.appendChild(notification);
                
                // Clear the form
                reportForm.reset();
                
                // Check if user is logged in to redirect appropriately
                const user = window.oceanHazardAPI.user;
                if (user && user.role === 'public') {
                    setTimeout(() => {
                        window.location.href = 'my-reports.html';
                    }, 3000);
                }
                
            } catch (error) {
                console.error('Report submission error:', error);
                alert('Failed to submit report: ' + error.message);
            }
        });
    }

    // --- SECTION 8: LOGOUT LOGIC ---

    async function logout(e) {
        e.preventDefault();
        try {
            await window.oceanHazardAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        alert('You have been logged out.');
        window.location.href = 'index.html';
    }

    // Handle logout button in my-reports.html
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // --- SECTION 9: PROTECTED PAGE LOGIC ---
    
    const currentPage = window.location.pathname.split('/').pop();

    // Check authentication and role-based access
    function checkPageAccess() {
        const user = window.oceanHazardAPI.user;
        
        if (!user) {
            // No user logged in - redirect to login
            alert('Please log in to access this page.');
            window.location.href = 'index.html';
            return false;
        }

        // Page-specific access control
        if (currentPage === 'my-reports.html') {
            // My Reports: Accessible by public users and rescue teams
            if (!['public', 'rescue_team'].includes(user.role)) {
                alert('Access Denied. This page is for citizens and rescue teams only.');
                window.location.href = 'index.html';
                return false;
            }
        }

        if (currentPage === 'reports.html') {
            // Incident Reports: Only accessible by admin and rescue teams
            if (!['admin', 'rescue_team'].includes(user.role)) {
                alert('Access Denied. This is a professional portal for administrators and rescue teams only.');
                window.location.href = 'index.html';
                return false;
            }
        }

        if (currentPage === 'analytics.html') {
            // Analytics: Accessible by any logged-in user
            // No additional role check needed - any authenticated user can access
        }

        return true;
    }

    // Run access check for protected pages
    if (['my-reports.html', 'reports.html', 'analytics.html'].includes(currentPage)) {
        checkPageAccess();
    }

    // --- INITIALIZE THE PAGE ---
    checkLoginState();
});
// Add this to your JavaScript file
function initMiniMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Using Leaflet.js for the mini map
            const map = L.map('mini-map', {
                zoomControl: false,
                scrollWheelZoom: false,
                dragging: false
            }).setView([lat, lng], 10);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            
            // Add user location marker
            L.marker([lat, lng]).addTo(map);
            
            // Add 50km radius circle
            L.circle([lat, lng], {
                color: '#005A9C',
                fillColor: '#005A9C',
                fillOpacity: 0.1,
                radius: 50000 // 50km in meters
            }).addTo(map);
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initMiniMap);

// TEMPORARY: API Test function
function testRegistration() {
    const testResults = document.getElementById('test-results');
    
    function log(message) {
        testResults.innerHTML += message + '\n';
        testResults.scrollTop = testResults.scrollHeight;
    }
    
    log('🧪 Starting Registration Test...');
    log('🔗 API Base URL: ' + window.oceanHazardAPI.baseURL);
    
    const testUser = {
        username: 'testuser' + Date.now(),
        email: 'testuser' + Date.now() + '@example.com',
        password: 'test123456',
        first_name: 'Test',
        last_name: 'User',
        phone: '1234567890',
        location: 'Mumbai, India'
    };
    
    log('📤 Testing with user: ' + testUser.email);
    
    window.oceanHazardAPI.register(testUser)
        .then(response => {
            log('✅ Registration successful!');
            log('📄 Response: ' + JSON.stringify(response, null, 2));
        })
        .catch(error => {
            log('❌ Registration failed!');
            log('💥 Error: ' + error.message);
            log('🔍 Full error: ' + JSON.stringify(error, null, 2));
        });
}
