// Data loaded from API (Database)
const API_BASE_URL = 'http://localhost:3000';

let mockEvents = [];
let mockBeaches = [];
let leaderboardData = [];
let badges = [];
let config = { defaultCoordinates: [48.3733, -4.4180], defaultMapZoom: 12, defaultMapCenter: [48.3733, -4.4180] };

// Load data from API (Database)
async function loadData() {
    try {
        console.log('Loading data from API...');
        
        // Load events from API
        const eventsRes = await fetch(`${API_BASE_URL}/events`);
        if (eventsRes.ok) {
            mockEvents = await eventsRes.json();
            console.log('Events loaded:', mockEvents.length);
            console.log('Events data:', mockEvents);
            if (mockEvents.length === 0) {
                console.warn('No events returned from API');
            }
        } else {
            console.warn('Failed to load events from API, status:', eventsRes.status);
            mockEvents = [];
        }
        
        // Load beaches from API
        const beachesRes = await fetch(`${API_BASE_URL}/beaches`);
        if (beachesRes.ok) {
            mockBeaches = await beachesRes.json();
            console.log('Beaches loaded:', mockBeaches.length);
        } else {
            console.warn('Failed to load beaches from API');
            mockBeaches = [];
        }
        
        // Load leaderboard from API
        const leaderboardRes = await fetch(`${API_BASE_URL}/leaderboard`);
        if (leaderboardRes.ok) {
            leaderboardData = await leaderboardRes.json();
            console.log('Leaderboard loaded:', leaderboardData.length);
        } else {
            console.warn('Failed to load leaderboard from API');
            leaderboardData = [];
        }
        
        // Load badges from API
        const badgesRes = await fetch(`${API_BASE_URL}/badges`);
        if (badgesRes.ok) {
            badges = await badgesRes.json();
            console.log('Badges loaded:', badges.length);
        } else {
            console.warn('Failed to load badges from API');
            badges = [];
        }
        
        // Load custom events from localStorage and merge with API events
        // NOTE: Commented out to only use events from database
        // const customEvents = loadCustomEvents();
        // if (customEvents && customEvents.length > 0) {
        //     // Merge custom events with API events
        //     const existingIds = new Set(mockEvents.map(e => e.id));
        //     customEvents.forEach(event => {
        //         const existingIndex = mockEvents.findIndex(e => e.id === event.id);
        //         if (existingIndex !== -1) {
        //             // Update existing event (e.g., participant count)
        //             mockEvents[existingIndex] = { ...mockEvents[existingIndex], ...event };
        //         } else if (!existingIds.has(event.id)) {
        //             // Add new custom event
        //             mockEvents.push(event);
        //         }
        //     });
        //     // Sort events by date
        //     mockEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        // }
        
        // Data initialized (no additional tables needed)
        
        console.log('Data loaded successfully from API', {
            events: mockEvents.length,
            beaches: mockBeaches.length,
            leaderboard: leaderboardData.length,
            badges: badges.length
        });
        
        // Log first event and beach for debugging
        if (mockEvents.length > 0) {
            console.log('First event sample:', JSON.stringify(mockEvents[0], null, 2));
        }
        if (mockBeaches.length > 0) {
            console.log('First beach sample:', JSON.stringify(mockBeaches[0], null, 2));
        }
    } catch (error) {
        console.error('Error loading data from API:', error);
        console.error('Error details:', error.message);
        // Initialize with empty data to prevent crashes
        mockEvents = [];
        mockBeaches = [];
        leaderboardData = [];
        badges = [];
        
        // Try to load custom events from localStorage even if API fails
        // NOTE: Commented out to only use events from database
        // const customEvents = loadCustomEvents();
        // if (customEvents && customEvents.length > 0) {
        //     mockEvents = customEvents;
        // }
    }
}

// Save custom events to localStorage
function saveCustomEvents() {
    try {
        // Get all custom events (events not in the original JSON)
        const originalEventIds = ['e1', 'e2', 'e3', 'e4']; // IDs from the original JSON
        const customEvents = mockEvents.filter(event => !originalEventIds.includes(event.id));
        
        // Also save events that have been modified (e.g., participant count changed)
        const modifiedEvents = mockEvents.filter(event => {
            if (originalEventIds.includes(event.id)) {
                // Check if this event has been modified (e.g., participants changed)
                const storedEvents = loadCustomEvents();
                const storedEvent = storedEvents.find(e => e.id === event.id);
                if (storedEvent && storedEvent.participants !== event.participants) {
                    return true; // Event was modified
                }
            }
            return false;
        });
        
        // Combine custom and modified events
        const allCustomEvents = [...customEvents];
        modifiedEvents.forEach(event => {
            if (!allCustomEvents.find(e => e.id === event.id)) {
                allCustomEvents.push(event);
            }
        });
        
        localStorage.setItem('customEvents', JSON.stringify(allCustomEvents));
        console.log('Custom events saved to localStorage:', allCustomEvents.length);
    } catch (error) {
        console.error('Error saving custom events:', error);
    }
}

// Load custom events from localStorage
function loadCustomEvents() {
    try {
        const customEventsJson = localStorage.getItem('customEvents');
        if (customEventsJson) {
            return JSON.parse(customEventsJson);
        }
    } catch (error) {
        console.error('Error loading custom events:', error);
    }
    return [];
}

// Clear custom events from localStorage (useful for debugging)
function clearCustomEvents() {
    try {
        localStorage.removeItem('customEvents');
        console.log('Custom events cleared from localStorage');
    } catch (error) {
        console.error('Error clearing custom events:', error);
    }
}


// Authentication functions
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true' && localStorage.getItem('userId');
}

function handleAuth() {
    if (isLoggedIn()) {
        // Logout - supprimer toutes les données utilisateur
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userNom');
        localStorage.removeItem('userPrenom');
        localStorage.removeItem('userDateNaissance');
        localStorage.removeItem('userNiveau');
        localStorage.removeItem('userNbCollecte');
        localStorage.removeItem('userNbUserParraine');
        // Destroy map if it exists
        if (map) {
            map.remove();
            map = null;
            markers = { events: [], beaches: [], bins: [] };
        }
        // Redirect to login page
        window.location.href = 'pages/login.html';
    } else {
        // Redirect to login page
        window.location.href = 'pages/login.html';
    }
}

function updateAuthUI() {
    const authLink = document.getElementById('nav-login');
    const welcomeMessage = document.getElementById('welcome-message');
    if (authLink) {
        if (isLoggedIn()) {
            authLink.textContent = 'Déconnexion';
            if (welcomeMessage) {
                const userName = localStorage.getItem('userName') || 'Utilisateur';
                welcomeMessage.textContent = `Bienvenue, ${userName} ! Vue d'ensemble de votre activité`;
            }
        } else {
            authLink.textContent = 'Connexion';
            if (welcomeMessage) {
                welcomeMessage.textContent = 'Vue d\'ensemble de votre activité';
            }
        }
    }
}

// Navigation
function showPage(pageName) {
    // Update navigation active state
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
    const navLink = document.getElementById('nav-' + pageName);
    if (navLink) {
        navLink.classList.add('active');
    }

    // Load page content dynamically
    const pageContent = document.getElementById('page-content');
    if (!pageContent) {
        console.error('page-content element not found');
        return;
    }

    const pageFile = `pages/${pageName}.html`;

    fetch(pageFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            if (!html || html.trim() === '') {
                throw new Error('Page content is empty');
            }
            pageContent.innerHTML = html;

            // Make sure the loaded page is visible by adding 'active' class
            const loadedPage = pageContent.querySelector('.page');
            if (loadedPage) {
                loadedPage.classList.add('active');
            }

            // Initialize page-specific functionality after a small delay to ensure DOM is ready
            setTimeout(() => {
                try {
                    if (pageName === 'dashboard') {
                        renderUpcomingEvents();
                        renderDashboardStats();
                    } else if (pageName === 'map') {
                    // Reset filter buttons opacity
                    const filterButtons = ['filterEvents', 'filterBeaches'];
                    filterButtons.forEach(btnId => {
                        const btn = document.getElementById(btnId);
                        if (btn) {
                            btn.style.opacity = '1';
                        }
                    });
                    // Reset filters to default
                    filters = { events: true, beaches: true };
                    initMap();
                    // Update map markers after a short delay to ensure data is loaded
                    setTimeout(() => {
                        if (map) {
                            updateMapMarkers();
                        }
                    }, 500);
                } else if (pageName === 'stats') {
                    renderLeaderboard();
                    renderStatsData();
                } else if (pageName === 'history') {
                    renderHistory();
                    renderHistoryStats();
                } else if (pageName === 'profile') {
                    renderProfileData();
                } else if (pageName === 'events') {
                    // Attach event form handler
                    const eventForm = document.getElementById('eventForm');
                    if (eventForm && !eventForm.dataset.listenerAttached) {
                        eventForm.dataset.listenerAttached = 'true';
                        eventForm.addEventListener('submit', function(e) {
                            e.preventDefault();
                            
                            // Get form values
                            const title = document.getElementById('eventTitle').value;
                            const type = document.getElementById('eventType').value;
                            const date = document.getElementById('eventDate').value;
                            const location = document.getElementById('eventLocation').value;
                            const maxParticipants = document.getElementById('eventMaxParticipants').value;
                            
                            // Create new event
                            const newEvent = {
                                id: 'e' + (mockEvents.length + 1),
                                title: title,
                                date: date,
                                location: location,
                                coordinates: config.defaultCoordinates || [48.3733, -4.4180],
                                participants: 0,
                                wasteCollected: 0,
                                status: 'upcoming',
                                type: type
                            };
                            
                            // Add to mockEvents array
                            mockEvents.push(newEvent);
                            
                            // Save custom events to localStorage
                            saveCustomEvents();
                            
                            // Update map if it exists
                            if (map) {
                                updateMapMarkers();
                            }
                            
                            // Reset form
                            eventForm.reset();
                            
                            // Show success message
                            alert('Événement créé avec succès !');
                            
                            // Redirect to dashboard and refresh the events list
                            showPage('dashboard');
                        });
                    }
                }
                } catch (error) {
                    console.error('Error rendering page:', error);
                }
            }, 10);
        })
        .catch(error => {
            console.error('Error loading page:', error);
            pageContent.innerHTML = `
                <div class="page-content">
                    <h1>Erreur de chargement</h1>
                    <p>Impossible de charger la page "${pageName}".</p>
                    <p style="font-size: 0.875rem; color: #6b6b6b;">Erreur: ${error.message}</p>
                    <p style="font-size: 0.875rem; color: #6b6b6b;">Assurez-vous que le serveur est bien lancé.</p>
                </div>
            `;
        });
}

// Render upcoming events
function renderUpcomingEvents() {
    const container = document.getElementById('upcomingEvents');
    if (!container) {
        console.warn('Container upcomingEvents not found');
        return;
    }
    
    console.log('renderUpcomingEvents called with', mockEvents.length, 'events');
    
    if (!mockEvents || mockEvents.length === 0) {
        console.warn('No events to display');
        container.innerHTML = '<p style="color: #6b6b6b;">Aucun événement à venir</p>';
        return;
    }
    
    // Log all event statuses for debugging
    const statusCounts = {};
    mockEvents.forEach(e => {
        statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
    });
    console.log('Event status breakdown:', statusCounts);
    
    const upcoming = mockEvents.filter(e => e.status === 'upcoming');
    console.log('Filtered upcoming events:', upcoming.length);
    
    if (upcoming.length === 0) {
        console.warn('No upcoming events found. Showing all events instead.');
        // Show all events if no upcoming events
        const allEvents = mockEvents.slice(0, 5); // Show first 5 events
        container.innerHTML = allEvents.map((event, index) => `
        <div class="event-card">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <h3 style="flex: 1;">${event.title || 'Sans titre'}</h3>
                <span class="badge badge-green">
                    ${event.type === 'beach' ? 'Plage' : event.type === 'coastal' ? 'Cotier' : event.type === 'underwater' ? 'Plongee' : 'Autre'}
                </span>
            </div>
            <p style="color: #6b6b6b; font-size: 0.875rem; margin-bottom: 0.5rem;">
                Date: ${event.date ? new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Non spécifiée'}
            </p>
            <p style="color: #6b6b6b; font-size: 0.875rem; margin-bottom: 0.5rem;">
                Lieu: ${event.location || 'Non spécifié'}
            </p>
            <p style="color: #6b6b6b; font-size: 0.875rem; margin-bottom: 1rem;">
                ${event.participants || 0} participants inscrits
            </p>
            <p style="color: #6b6b6b; font-size: 0.75rem; margin-bottom: 1rem;">
                Statut: ${event.status || 'inconnu'}
            </p>
            ${event.status === 'upcoming' ? '<button class="btn btn-primary register-event-btn" style="width: 100%;" data-event-id="' + event.id + '">S\'inscrire</button>' : ''}
        </div>
    `).join('');
        
        // Attach event listeners to register buttons
        container.querySelectorAll('.register-event-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const eventId = this.getAttribute('data-event-id');
                registerToEvent(eventId);
            });
        });
        return;
    }
    
    container.innerHTML = upcoming.map((event, index) => `
        <div class="event-card">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <h3 style="flex: 1;">${event.title}</h3>
                <span class="badge badge-green">
                    ${event.type === 'beach' ? 'Plage' : event.type === 'coastal' ? 'Cotier' : 'Plongee'}
                </span>
            </div>
            <p style="color: #6b6b6b; font-size: 0.875rem; margin-bottom: 0.5rem;">
                Date: ${new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <p style="color: #6b6b6b; font-size: 0.875rem; margin-bottom: 0.5rem;">
                Lieu: ${event.location}
            </p>
            <p style="color: #6b6b6b; font-size: 0.875rem; margin-bottom: 1rem;">
                ${event.participants} participants inscrits
            </p>
            <button class="btn btn-primary register-event-btn" style="width: 100%;" data-event-id="${event.id}">S'inscrire</button>
        </div>
    `).join('');
    
    // Attach event listeners to register buttons
    container.querySelectorAll('.register-event-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = this.getAttribute('data-event-id');
            registerToEvent(eventId);
        });
    });
}

// Register to an event
function registerToEvent(eventId) {
    const event = mockEvents.find(e => e.id === eventId);
    if (!event) {
        alert('Événement introuvable');
        return;
    }
    
    // Increment participants
    event.participants += 1;
    
    // Save custom events to localStorage (to preserve participant count)
    saveCustomEvents();
    
    // Show success popup
    alert('Vous êtes bien inscrit à l\'événement "' + event.title + '" !');
    
    // Refresh the events list
    renderUpcomingEvents();
}

// Render leaderboard
function renderLeaderboard() {
    const container = document.getElementById('leaderboard');
    if (!container) return;
    
    if (!leaderboardData || leaderboardData.length === 0) {
        container.innerHTML = '<p style="color: #6b6b6b;">Aucune donnée disponible</p>';
        return;
    }
    
    container.innerHTML = leaderboardData.map((user, index) => `
        <div class="leaderboard-item">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div class="rank-badge rank-${index < 3 ? index + 1 : 'other'}">${index + 1}</div>
                <div>
                    <div style="font-weight: 600;">${user.name}</div>
                    <div style="font-size: 0.875rem; color: #6b6b6b;">Niveau ${user.level}</div>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 1.25rem; font-weight: 700; color: var(--ocean-blue);">${user.waste} kg</div>
                <div style="font-size: 0.875rem; color: #6b6b6b;">${user.events} événements</div>
            </div>
        </div>
    `).join('');
}

// Render history
function renderHistory() {
    const container = document.getElementById('historyEvents');
    if (!container) return;
    
    if (!mockEvents || mockEvents.length === 0) {
        container.innerHTML = '<p style="color: #6b6b6b;">Aucun historique disponible</p>';
        return;
    }
    
    const completed = mockEvents.filter(e => e.status === 'completed');
    
    if (completed.length === 0) {
        container.innerHTML = '<p style="color: #6b6b6b;">Aucun événement terminé</p>';
        return;
    }

    container.innerHTML = completed.map(event => `
        <div class="card" style="margin-bottom: 1rem;">
            <div class="card-header">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h3 class="card-title">${event.title}</h3>
                        <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                            <span class="badge" style="background-color: #dcfce7; color: #166534;">Termine</span>
                            <span class="badge badge-green">
                                ${event.type === 'beach' ? 'Plage' : event.type === 'coastal' ? 'Cotier' : 'Plongee'}
                            </span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <div style="text-align: center; padding: 1rem; background-color: var(--sand-light); border-radius: 0.5rem; min-width: 100px;">
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--ocean-blue);">${event.wasteCollected}kg</div>
                            <div style="font-size: 0.75rem; color: #6b6b6b;">Dechets</div>
                        </div>
                        <div style="text-align: center; padding: 1rem; background-color: var(--sand-light); border-radius: 0.5rem; min-width: 100px;">
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--algae-green);">${event.participants}</div>
                            <div style="font-size: 0.75rem; color: #6b6b6b;">Participants</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-content">
                <p style="color: #6b6b6b; font-size: 0.875rem; margin-bottom: 0.5rem;">
                    Date: ${new Date(event.date).toLocaleDateString('fr-FR')} - Lieu: ${event.location}
                </p>
            </div>
        </div>
    `).join('');
}

// Render dashboard stats
async function renderDashboardStats() {
    // Try to fetch data from API first, fallback to JSON if API is not available
    try {
        const apiBaseUrl = 'http://localhost:3000';
        
        // Fetch number of users (participants)
        const nbUsersRes = await fetch(`${apiBaseUrl}/nb_users`);
        if (nbUsersRes.ok) {
            const nbUsersData = await nbUsersRes.json();
            const participantsEl = document.getElementById('dashboardParticipants');
            if (participantsEl) participantsEl.textContent = nbUsersData.count || 0;
        }
        
        // Fetch number of events
        const nbEventsRes = await fetch(`${apiBaseUrl}/nb_events`);
        if (nbEventsRes.ok) {
            const nbEventsData = await nbEventsRes.json();
            const eventsEl = document.getElementById('dashboardEvents');
            if (eventsEl) eventsEl.textContent = nbEventsData.count || 0;
        }
        
        // Fetch number of upcoming events
        const nbUpcomingRes = await fetch(`${apiBaseUrl}/nb_events_upcoming`);
        if (nbUpcomingRes.ok) {
            const nbUpcomingData = await nbUpcomingRes.json();
            const upcomingEl = document.getElementById('dashboardUpcoming');
            if (upcomingEl) upcomingEl.textContent = (nbUpcomingData.count || 0) + ' a venir';
        }
        
        // Fetch total waste
        const totalWasteRes = await fetch(`${apiBaseUrl}/total_waste`);
        if (totalWasteRes.ok) {
            const totalWasteData = await totalWasteRes.json();
            const wasteEl = document.getElementById('dashboardWaste');
            if (wasteEl) wasteEl.textContent = (totalWasteData.total || 0) + ' kg';
        }
        
        // Fetch number of cleaned beaches
        const nbBeachesRes = await fetch(`${apiBaseUrl}/nb_beaches_cleaned`);
        if (nbBeachesRes.ok) {
            const nbBeachesData = await nbBeachesRes.json();
            const beachesEl = document.getElementById('dashboardBeaches');
            if (beachesEl) beachesEl.textContent = nbBeachesData.count || 0;
        }
        
    } catch (error) {
        console.error('Error loading dashboard stats from API:', error);
        // Show error or default values
        const participantsEl = document.getElementById('dashboardParticipants');
        const eventsEl = document.getElementById('dashboardEvents');
        const wasteEl = document.getElementById('dashboardWaste');
        const beachesEl = document.getElementById('dashboardBeaches');
        
        if (participantsEl) participantsEl.textContent = '0';
        if (eventsEl) eventsEl.textContent = '0';
        if (wasteEl) wasteEl.textContent = '0 kg';
        if (beachesEl) beachesEl.textContent = '0';
    }
}


// Render history stats (calculated from events)
async function renderHistoryStats() {
    try {
        // Calculate from completed events
        const completedEvents = mockEvents.filter(e => e.status === 'completed');
        const totalWaste = completedEvents.reduce((sum, e) => sum + (e.wasteCollected || 0), 0);
        const totalParticipants = completedEvents.reduce((sum, e) => sum + (e.participants || 0), 0);
        
        const eventsEl = document.getElementById('historyEventsCount');
        const wasteEl = document.getElementById('historyWaste');
        const coParticipantsEl = document.getElementById('historyCoParticipants');
        
        if (eventsEl) eventsEl.textContent = completedEvents.length;
        if (wasteEl) wasteEl.textContent = totalWaste + ' kg';
        if (coParticipantsEl) coParticipantsEl.textContent = totalParticipants;
    } catch (error) {
        console.error('Error rendering history stats:', error);
    }
}

// Render stats data (from API)
async function renderStatsData() {
    try {
        const apiBaseUrl = API_BASE_URL;
        
        // Fetch all stats from API
        const [totalWasteRes, totalEventsRes, nbUsersRes, nbBeachesRes] = await Promise.all([
            fetch(`${apiBaseUrl}/total_waste`),
            fetch(`${apiBaseUrl}/nb_events`),
            fetch(`${apiBaseUrl}/nb_users`),
            fetch(`${apiBaseUrl}/nb_beaches_cleaned`)
        ]);
        
        const totalWaste = totalWasteRes.ok ? (await totalWasteRes.json()).total : 0;
        const totalEvents = totalEventsRes.ok ? (await totalEventsRes.json()).count : 0;
        const totalParticipants = nbUsersRes.ok ? (await nbUsersRes.json()).count : 0;
        const beachesCleaned = nbBeachesRes.ok ? (await nbBeachesRes.json()).count : 0;
        
        // Calculate averages
        const avgWaste = totalEvents > 0 ? Math.round(totalWaste / totalEvents) : 0;
        const totalParticipantsCount = mockEvents.reduce((sum, e) => sum + (e.participants || 0), 0);
        const avgParticipants = totalEvents > 0 ? Math.round(totalParticipantsCount / totalEvents) : 0;
        const avgIndividual = totalParticipantsCount > 0 ? (totalWaste / totalParticipantsCount).toFixed(1) : 0;
        
        const totalWasteEl = document.getElementById('statsTotalWaste');
        const totalEventsEl = document.getElementById('statsTotalEvents');
        const totalParticipantsEl = document.getElementById('statsTotalParticipants');
        const beachesEl = document.getElementById('statsBeachesCleaned');
        const avgWasteEl = document.getElementById('statsAvgWaste');
        const avgParticipantsEl = document.getElementById('statsAvgParticipants');
        const avgIndividualEl = document.getElementById('statsAvgIndividual');
        
        if (totalWasteEl) totalWasteEl.textContent = totalWaste + ' kg';
        if (totalEventsEl) totalEventsEl.textContent = totalEvents;
        if (totalParticipantsEl) totalParticipantsEl.textContent = totalParticipants;
        if (beachesEl) beachesEl.textContent = beachesCleaned;
        if (avgWasteEl) avgWasteEl.textContent = avgWaste + ' kg';
        if (avgParticipantsEl) avgParticipantsEl.textContent = avgParticipants;
        if (avgIndividualEl) avgIndividualEl.textContent = avgIndividual + ' kg';
    } catch (error) {
        console.error('Error rendering stats data:', error);
    }
}

// Render profile data
async function renderProfileData() {
    const initialsEl = document.getElementById('profileInitials');
    const nameEl = document.getElementById('profileName');
    const emailEl = document.getElementById('profileEmail');
    const memberSinceEl = document.getElementById('profileMemberSince');
    const levelEl = document.getElementById('profileLevel');
    const levelProgressEl = document.getElementById('profileLevelProgress');
    const progressBarEl = document.getElementById('profileProgressBar');
    const wasteInfoEl = document.getElementById('profileWasteInfo');
    const wasteEl = document.getElementById('profileWaste');
    const eventsEl = document.getElementById('profileEvents');
    const badgesEl = document.getElementById('profileBadges');
    const badgesGridEl = document.getElementById('badgesGrid');
    
    // Vérifier si l'utilisateur est connecté
    const userId = localStorage.getItem('userId');
    let userData = null;
    
    // Charger les données depuis l'API si l'utilisateur est connecté
    if (userId && isLoggedIn()) {
        try {
            const response = await fetch(`${API_BASE_URL}/user/${userId}`);
            if (response.ok) {
                userData = await response.json();
                console.log('User data loaded from API:', userData);
                
                // Mettre à jour localStorage avec les données fraîches
                localStorage.setItem('userEmail', userData.email);
                localStorage.setItem('userName', `${userData.prenom} ${userData.nom}`);
                localStorage.setItem('userNom', userData.nom);
                localStorage.setItem('userPrenom', userData.prenom);
                localStorage.setItem('userNiveau', userData.niveau);
                localStorage.setItem('userNbCollecte', userData.nbCollecte);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
    
    // Get user data from localStorage (from registration/login)
    const userName = localStorage.getItem('userName') || '';
    const userEmail = localStorage.getItem('userEmail') || '';
    const userNom = localStorage.getItem('userNom') || '';
    const userPrenom = localStorage.getItem('userPrenom') || '';
    const registeredName = localStorage.getItem('registeredName') || userName;
    
    // Utiliser les données de l'API si disponibles, sinon localStorage, sinon defaults
    const displayFirstName = userData ? userData.prenom : (userPrenom || registeredName.split(' ')[0] || profileData.firstName || '');
    const displayLastName = userData ? userData.nom : (userNom || registeredName.split(' ').slice(1).join(' ') || profileData.lastName || '');
    const displayEmail = userData ? userData.email : (userEmail || profileData.email || '');
    const displayName = (displayFirstName + ' ' + displayLastName).trim() || 'Utilisateur';
    
    // Get member since date
    let memberSinceDate = userData?.dateNaissance || profileData.memberSince;
    if (!memberSinceDate && userEmail) {
        memberSinceDate = new Date().toISOString().split('T')[0];
    }
    
    // Utiliser les données de l'API pour les stats
    const displayLevel = userData ? userData.niveau : (parseInt(localStorage.getItem('userNiveau')) || profileData.level || 1);
    const displayLevelName = displayLevel === 1 ? 'Débutant' : displayLevel === 2 ? 'Intermédiaire' : displayLevel === 3 ? 'Avancé' : 'Expert';
    const displayLevelProgress = Math.min(100, Math.max(0, (userData ? userData.totalDechets : 0) / 50 * 100));
    const displayWasteCollected = userData ? userData.totalDechets : (parseInt(localStorage.getItem('userNbCollecte')) || profileData.wasteCollected || 0);
    const displayWasteRequired = 50; // Fixe pour l'instant
    const displayEventsParticipated = userData ? userData.nbEvenements : (profileData.eventsParticipated || 0);
    const displayBadgesCount = userData ? userData.nbBadges : (profileData.badgesCount || 0);
    
    // Render profile information
    if (initialsEl) {
        if (displayFirstName && displayLastName) {
            const initials = (displayFirstName[0] + displayLastName[0]).toUpperCase();
            initialsEl.textContent = initials;
        } else if (displayName) {
            const nameParts = displayName.split(' ');
            const initials = nameParts.map(n => n[0]).join('').toUpperCase().substring(0, 2);
            initialsEl.textContent = initials;
        } else {
            initialsEl.textContent = '??';
        }
    }
    
    if (nameEl) nameEl.textContent = displayName;
    if (emailEl) emailEl.textContent = displayEmail || 'Non renseigné';
    
    if (memberSinceEl && memberSinceDate) {
        memberSinceEl.textContent = 'Membre depuis le ' + new Date(memberSinceDate).toLocaleDateString('fr-FR');
    } else if (memberSinceEl) {
        memberSinceEl.textContent = 'Membre depuis récemment';
    }
    
    if (levelEl) levelEl.textContent = 'Niveau ' + displayLevel + ' - ' + displayLevelName;
    if (levelProgressEl) levelProgressEl.textContent = displayLevelProgress + '% vers le niveau ' + (displayLevel + 1);
    if (progressBarEl) progressBarEl.style.width = displayLevelProgress + '%';
    if (wasteInfoEl) wasteInfoEl.innerHTML = '<span>' + displayWasteCollected + ' kg collectes</span><span>' + displayWasteRequired + ' kg requis</span>';
    if (wasteEl) wasteEl.textContent = displayWasteCollected + ' kg';
    if (eventsEl) eventsEl.textContent = displayEventsParticipated;
    if (badgesEl) badgesEl.textContent = displayBadgesCount;
    
    // Afficher les badges de l'utilisateur (depuis l'API si disponible, sinon depuis la liste globale)
    const userBadges = userData?.badges || [];
    const badgesToDisplay = userBadges.length > 0 ? userBadges : badges;
    
    if (badgesGridEl && badgesToDisplay.length > 0) {
        badgesGridEl.innerHTML = badgesToDisplay.map(badge => `
            <div style="padding: 1rem; background-color: var(--sand-light); border-radius: 0.5rem;">
                <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">${badge.icon === 'star' ? '*' : badge.icon === 'ocean' ? '~' : badge.icon === 'runner' ? '>' : '⭐'}</div>
                <h4 style="font-weight: 600; margin-bottom: 0.25rem;">${badge.name || badge.nom}</h4>
                <p style="font-size: 0.875rem; color: #6b6b6b;">${badge.description || ''}</p>
            </div>
        `).join('');
    } else if (badgesGridEl) {
        badgesGridEl.innerHTML = '<p style="color: #6b6b6b; text-align: center;">Aucun badge obtenu pour le moment</p>';
    }
}

// Map functionality
let map;
let markers = { events: [], beaches: [] };
let filters = { events: true, beaches: true };

function initMap() {
    // Check if map container exists
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }

        // Destroy existing map if it exists
        if (map) {
            map.remove();
            map = null;
            markers = { events: [], beaches: [] };
        }

    // Wait a bit for the DOM to be ready
    setTimeout(() => {
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('Map element not found after delay');
            return;
        }

        // Initialize new map
        const mapCenter = config.defaultMapCenter || [48.3733, -4.4180];
        const mapZoom = config.defaultMapZoom || 12;
        map = L.map('map').setView(mapCenter, mapZoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Invalidate size to ensure proper rendering
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
                updateMapMarkers();
                console.log('Map initialized with', mockEvents.length, 'events and', mockBeaches.length, 'beaches');
            }
        }, 100);
    }, 50);
}

function toggleFilter(type) {
    filters[type] = !filters[type];
    const btnId = 'filter' + type.charAt(0).toUpperCase() + type.slice(1);
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.style.opacity = filters[type] ? '1' : '0.5';
    }
    updateMapMarkers();
}

function updateMapMarkers() {
    if (!map) {
        console.warn('Map not initialized, cannot update markers');
        return;
    }

    console.log('Updating map markers with', mockEvents.length, 'events and', mockBeaches.length, 'beaches');

    // Clear existing markers
    Object.values(markers).forEach(group => {
        group.forEach(marker => map.removeLayer(marker));
    });
    markers = { events: [], beaches: [] };

    // Add event markers
    if (filters.events) {
        let eventsAdded = 0;
        mockEvents.forEach(event => {
            // Vérifier que les coordonnées sont valides
            if (!event.coordinates || !Array.isArray(event.coordinates) || event.coordinates.length !== 2) {
                console.warn('Event without valid coordinates:', event);
                return;
            }
            
            const marker = L.marker(event.coordinates, {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34]
                })
            }).addTo(map);

            marker.bindPopup(`
                <div style="padding: 0.5rem; min-width: 200px;">
                    <h3 style="color: var(--ocean-blue); margin-bottom: 0.5rem;">${event.title || 'Événement sans titre'}</h3>
                    <p style="font-size: 0.875rem; margin-bottom: 0.25rem;">Date: ${event.date ? new Date(event.date).toLocaleDateString('fr-FR') : 'Non spécifiée'}</p>
                    <p style="font-size: 0.875rem; margin-bottom: 0.25rem;">Lieu: ${event.location || 'Non spécifié'}</p>
                    <p style="font-size: 0.875rem;">${event.participants || 0} participants</p>
                </div>
            `);

            markers.events.push(marker);
            eventsAdded++;
        });
        console.log(`Added ${eventsAdded} event markers to map`);
    }

    // Add beach markers
    if (filters.beaches) {
        let beachesAdded = 0;
        mockBeaches.forEach(beach => {
            // Vérifier que les coordonnées sont valides
            if (!beach.coordinates || !Array.isArray(beach.coordinates) || beach.coordinates.length !== 2) {
                console.warn('Beach without valid coordinates:', beach);
                return;
            }
            
            const color = beach.status === 'clean' ? '#3FA796' :
                        beach.status === 'needs-cleaning' ? '#FFB74D' : '#dc2626';

            L.circle(beach.coordinates, {
                radius: 300,
                color: color,
                fillColor: color,
                fillOpacity: 0.2
            }).addTo(map);

            const marker = L.marker(beach.coordinates, {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34]
                })
            }).addTo(map);

            marker.bindPopup(`
                <div style="padding: 0.5rem; min-width: 200px;">
                    <h3 style="color: var(--algae-green); margin-bottom: 0.5rem;">${beach.name || 'Plage sans nom'}</h3>
                    <p style="font-size: 0.875rem;">
                        ${beach.status === 'clean' ? 'Propre' :
                          beach.status === 'needs-cleaning' ? 'A nettoyer' : 'Critique'}
                    </p>
                </div>
            `);

            markers.beaches.push(marker);
            beachesAdded++;
        });
        console.log(`Added ${beachesAdded} beach markers to map`);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, initializing application...');
    
    try {
        // Load data from API (Database)
        console.log('Loading data from API...');
        await loadData();
        console.log('Data loaded, updating UI...');
        
        // Check login status on page load
        updateAuthUI();

        // Load default page (dashboard)
        console.log('Loading dashboard page...');
        showPage('dashboard');
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        console.error('Error stack:', error.stack);
        
        // Show error message to user
        const pageContent = document.getElementById('page-content');
        if (pageContent) {
            pageContent.innerHTML = `
                <div class="page-content" style="padding: 2rem;">
                    <h1 style="color: #dc2626;">Erreur de chargement</h1>
                    <p>Impossible de charger l'application. Veuillez vérifier :</p>
                    <ul style="margin: 1rem 0; padding-left: 2rem;">
                        <li>Que le serveur est bien lancé</li>
                        <li>Que tous les fichiers JSON sont présents dans le dossier data/</li>
                        <li>Que vous accédez à l'application via http://localhost:8000/V2/index.html</li>
                    </ul>
                    <p style="font-size: 0.875rem; color: #6b6b6b; margin-top: 1rem;">
                        <strong>Erreur technique:</strong> ${error.message}
                    </p>
                    <p style="font-size: 0.75rem; color: #6b6b6b; margin-top: 0.5rem;">
                        Ouvrez la console du navigateur (F12) pour plus de détails.
                    </p>
                </div>
            `;
        }
    }
});