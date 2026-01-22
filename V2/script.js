// Data loaded from JSON files
let mockEvents = [];
let mockBeaches = [];
let mockWasteBins = [];
let leaderboardData = [];
let dashboardStats = {};
let challenges = [];
let profileData = {};
let badges = [];
let historyStats = {};
let statsData = {};
let config = {};

// Load data from JSON files
async function loadData() {
    try {
        const [eventsRes, beachesRes, wasteBinsRes, leaderboardRes, dashboardStatsRes, challengesRes, profileRes, badgesRes, historyRes, statsRes, configRes] = await Promise.all([
            fetch('data/events.json'),
            fetch('data/beaches.json'),
            fetch('data/wasteBins.json'),
            fetch('data/leaderboard.json'),
            fetch('data/dashboardStats.json'),
            fetch('data/challenges.json'),
            fetch('data/profileData.json'),
            fetch('data/badges.json'),
            fetch('data/historyStats.json'),
            fetch('data/statsData.json'),
            fetch('data/config.json')
        ]);

        // Check if all responses are ok
        if (!eventsRes.ok) throw new Error('Failed to load events.json');
        if (!beachesRes.ok) throw new Error('Failed to load beaches.json');
        if (!wasteBinsRes.ok) throw new Error('Failed to load wasteBins.json');
        if (!leaderboardRes.ok) throw new Error('Failed to load leaderboard.json');
        if (!dashboardStatsRes.ok) throw new Error('Failed to load dashboardStats.json');
        if (!challengesRes.ok) throw new Error('Failed to load challenges.json');
        if (!profileRes.ok) throw new Error('Failed to load profileData.json');
        if (!badgesRes.ok) throw new Error('Failed to load badges.json');
        if (!historyRes.ok) throw new Error('Failed to load historyStats.json');
        if (!statsRes.ok) throw new Error('Failed to load statsData.json');
        if (!configRes.ok) throw new Error('Failed to load config.json');

        mockEvents = await eventsRes.json();
        mockBeaches = await beachesRes.json();
        mockWasteBins = await wasteBinsRes.json();
        leaderboardData = await leaderboardRes.json();
        dashboardStats = await dashboardStatsRes.json();
        challenges = await challengesRes.json();
        profileData = await profileRes.json();
        badges = await badgesRes.json();
        historyStats = await historyRes.json();
        statsData = await statsRes.json();
        config = await configRes.json();
        
        // Load custom events from localStorage and merge with JSON events
        const customEvents = loadCustomEvents();
        if (customEvents && customEvents.length > 0) {
            // Merge custom events with JSON events
            const existingIds = new Set(mockEvents.map(e => e.id));
            customEvents.forEach(event => {
                const existingIndex = mockEvents.findIndex(e => e.id === event.id);
                if (existingIndex !== -1) {
                    // Update existing event (e.g., participant count)
                    mockEvents[existingIndex] = { ...mockEvents[existingIndex], ...event };
                } else if (!existingIds.has(event.id)) {
                    // Add new custom event
                    mockEvents.push(event);
                }
            });
            // Sort events by date
            mockEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        }
        
        console.log('Data loaded successfully', {
            events: mockEvents.length,
            beaches: mockBeaches.length,
            wasteBins: mockWasteBins.length,
            leaderboard: leaderboardData.length,
            customEvents: customEvents ? customEvents.length : 0
        });
    } catch (error) {
        console.error('Error loading data:', error);
        console.error('Error details:', error.message, error.stack);
        // Initialize with empty data to prevent crashes
        mockEvents = [];
        mockBeaches = [];
        mockWasteBins = [];
        leaderboardData = [];
        dashboardStats = {};
        challenges = [];
        profileData = {};
        badges = [];
        historyStats = {};
        statsData = {};
        config = { defaultCoordinates: [48.3733, -4.4180], defaultMapZoom: 12, defaultMapCenter: [48.3733, -4.4180] };
        
        // Try to load custom events from localStorage even if JSON fails
        const customEvents = loadCustomEvents();
        if (customEvents && customEvents.length > 0) {
            mockEvents = customEvents;
        }
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

// Export events to JSON file (download)
function exportEventsToJSON() {
    try {
        const dataStr = JSON.stringify(mockEvents, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'events.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('Events exported to JSON file');
    } catch (error) {
        console.error('Error exporting events:', error);
        alert('Erreur lors de l\'export des événements');
    }
}

// Authentication functions
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

function handleAuth() {
    if (isLoggedIn()) {
        // Logout
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
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
                        renderChallenges();
                    } else if (pageName === 'map') {
                    // Reset filter buttons opacity
                    const filterButtons = ['filterEvents', 'filterBeaches', 'filterBins'];
                    filterButtons.forEach(btnId => {
                        const btn = document.getElementById(btnId);
                        if (btn) {
                            btn.style.opacity = '1';
                        }
                    });
                    // Reset filters to default
                    filters = { events: true, beaches: true, bins: true };
                    initMap();
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
                            
                            // Show success message with option to export
                            const exportConfirm = confirm('Événement créé avec succès !\n\nSouhaitez-vous télécharger le fichier events.json mis à jour ?');
                            if (exportConfirm) {
                                exportEventsToJSON();
                            }
                            
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
    if (!container) return;
    
    if (!mockEvents || mockEvents.length === 0) {
        container.innerHTML = '<p style="color: #6b6b6b;">Aucun événement à venir</p>';
        return;
    }
    
    const upcoming = mockEvents.filter(e => e.status === 'upcoming');

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
function renderDashboardStats() {
    if (Object.keys(dashboardStats).length === 0) return;
    
    const wasteEl = document.getElementById('dashboardWaste');
    const wasteMonthEl = document.getElementById('dashboardWasteMonth');
    const eventsEl = document.getElementById('dashboardEvents');
    const upcomingEl = document.getElementById('dashboardUpcoming');
    const participantsEl = document.getElementById('dashboardParticipants');
    const beachesEl = document.getElementById('dashboardBeaches');
    
    if (wasteEl) wasteEl.textContent = dashboardStats.wasteCollected + ' kg';
    if (wasteMonthEl) wasteMonthEl.textContent = '+' + dashboardStats.wasteCollectedThisMonth + 'kg ce mois';
    if (eventsEl) eventsEl.textContent = dashboardStats.events;
    if (upcomingEl) upcomingEl.textContent = dashboardStats.upcomingEvents + ' a venir';
    if (participantsEl) participantsEl.textContent = dashboardStats.participants;
    if (beachesEl) beachesEl.textContent = dashboardStats.beachesCleaned;
}

// Render challenges
function renderChallenges() {
    if (challenges.length === 0) return;
    
    if (challenges[0]) {
        const progress1 = (challenges[0].current / challenges[0].target) * 100;
        const progressEl1 = document.getElementById('challenge1Progress');
        const barEl1 = document.getElementById('challenge1Bar');
        const deadlineEl1 = document.getElementById('challenge1Deadline');
        
        if (progressEl1) progressEl1.textContent = challenges[0].current + ' / ' + challenges[0].target;
        if (barEl1) barEl1.style.width = progress1 + '%';
        if (deadlineEl1) deadlineEl1.textContent = 'Date limite: ' + new Date(challenges[0].deadline).toLocaleDateString('fr-FR');
    }
    
    if (challenges[1]) {
        const progress2 = (challenges[1].current / challenges[1].target) * 100;
        const progressEl2 = document.getElementById('challenge2Progress');
        const barEl2 = document.getElementById('challenge2Bar');
        const deadlineEl2 = document.getElementById('challenge2Deadline');
        
        if (progressEl2) progressEl2.textContent = challenges[1].current + ' / ' + challenges[1].target;
        if (barEl2) barEl2.style.width = progress2 + '%';
        if (deadlineEl2) deadlineEl2.textContent = 'Date limite: ' + new Date(challenges[1].deadline).toLocaleDateString('fr-FR');
    }
}

// Render history stats
function renderHistoryStats() {
    if (Object.keys(historyStats).length === 0) return;
    
    const eventsEl = document.getElementById('historyEventsCount');
    const wasteEl = document.getElementById('historyWaste');
    const coParticipantsEl = document.getElementById('historyCoParticipants');
    
    if (eventsEl) eventsEl.textContent = historyStats.eventsParticipated;
    if (wasteEl) wasteEl.textContent = historyStats.wasteCollected + ' kg';
    if (coParticipantsEl) coParticipantsEl.textContent = historyStats.coParticipants;
}

// Render stats data
function renderStatsData() {
    if (Object.keys(statsData).length === 0) return;
    
    const totalWasteEl = document.getElementById('statsTotalWaste');
    const totalEventsEl = document.getElementById('statsTotalEvents');
    const totalParticipantsEl = document.getElementById('statsTotalParticipants');
    const beachesEl = document.getElementById('statsBeachesCleaned');
    const avgWasteEl = document.getElementById('statsAvgWaste');
    const avgParticipantsEl = document.getElementById('statsAvgParticipants');
    const avgIndividualEl = document.getElementById('statsAvgIndividual');
    
    if (totalWasteEl) totalWasteEl.textContent = statsData.totalWaste + ' kg';
    if (totalEventsEl) totalEventsEl.textContent = statsData.totalEvents;
    if (totalParticipantsEl) totalParticipantsEl.textContent = statsData.totalParticipants;
    if (beachesEl) beachesEl.textContent = statsData.beachesCleaned;
    if (avgWasteEl) avgWasteEl.textContent = statsData.averageWastePerEvent + ' kg';
    if (avgParticipantsEl) avgParticipantsEl.textContent = statsData.averageParticipantsPerEvent;
    if (avgIndividualEl) avgIndividualEl.textContent = statsData.averageWastePerParticipant + ' kg';
}

// Render profile data
function renderProfileData() {
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
    
    // Get user data from localStorage (from registration/login)
    const userName = localStorage.getItem('userName') || '';
    const userEmail = localStorage.getItem('userEmail') || '';
    const registeredName = localStorage.getItem('registeredName') || userName;
    
    // Parse name to get first and last name
    let firstName = '';
    let lastName = '';
    if (registeredName || userName) {
        const fullName = registeredName || userName;
        const nameParts = fullName.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
    }
    
    // Use JSON data as defaults if user is not logged in or data is missing
    const displayFirstName = firstName || (profileData.firstName || '');
    const displayLastName = lastName || (profileData.lastName || '');
    const displayEmail = userEmail || (profileData.email || '');
    const displayName = (displayFirstName + ' ' + displayLastName).trim() || 'Utilisateur';
    
    // Get member since date (use current date if new user, or from JSON)
    let memberSinceDate = profileData.memberSince;
    if (!memberSinceDate && userEmail) {
        // New user - use current date
        memberSinceDate = new Date().toISOString().split('T')[0];
    }
    
    // Use JSON data for stats if available, otherwise use defaults
    const displayLevel = profileData.level || 1;
    const displayLevelName = profileData.levelName || 'Débutant';
    const displayLevelProgress = profileData.levelProgress || 0;
    const displayWasteCollected = profileData.wasteCollected || 0;
    const displayWasteRequired = profileData.wasteRequired || 50;
    const displayEventsParticipated = profileData.eventsParticipated || 0;
    const displayBadgesCount = profileData.badgesCount || 0;
    
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
    
    if (badgesGridEl && badges.length > 0) {
        badgesGridEl.innerHTML = badges.map(badge => `
            <div style="padding: 1rem; background-color: var(--sand-light); border-radius: 0.5rem;">
                <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">${badge.icon === 'star' ? '*' : badge.icon === 'ocean' ? '~' : badge.icon === 'runner' ? '>' : ''}</div>
                <h4 style="font-weight: 600; margin-bottom: 0.25rem;">${badge.name}</h4>
                <p style="font-size: 0.875rem; color: #6b6b6b;">${badge.description}</p>
            </div>
        `).join('');
    } else if (badgesGridEl) {
        badgesGridEl.innerHTML = '<p style="color: #6b6b6b; text-align: center;">Aucun badge obtenu pour le moment</p>';
    }
}

// Map functionality
let map;
let markers = { events: [], beaches: [], bins: [] };
let filters = { events: true, beaches: true, bins: true };

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
        markers = { events: [], beaches: [], bins: [] };
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
    if (!map) return;

    // Clear existing markers
    Object.values(markers).forEach(group => {
        group.forEach(marker => map.removeLayer(marker));
    });
    markers = { events: [], beaches: [], bins: [] };

    // Add event markers
    if (filters.events) {
        mockEvents.forEach(event => {
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
                    <h3 style="color: var(--ocean-blue); margin-bottom: 0.5rem;">${event.title}</h3>
                    <p style="font-size: 0.875rem; margin-bottom: 0.25rem;">Date: ${new Date(event.date).toLocaleDateString('fr-FR')}</p>
                    <p style="font-size: 0.875rem; margin-bottom: 0.25rem;">Lieu: ${event.location}</p>
                    <p style="font-size: 0.875rem;">${event.participants} participants</p>
                </div>
            `);

            markers.events.push(marker);
        });
    }

    // Add beach markers
    if (filters.beaches) {
        mockBeaches.forEach(beach => {
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
                    <h3 style="color: var(--algae-green); margin-bottom: 0.5rem;">${beach.name}</h3>
                    <p style="font-size: 0.875rem;">
                        ${beach.status === 'clean' ? 'Propre' :
                          beach.status === 'needs-cleaning' ? 'A nettoyer' : 'Critique'}
                    </p>
                </div>
            `);

            markers.beaches.push(marker);
        });
    }

    // Add bin markers
    if (filters.bins) {
        mockWasteBins.forEach(bin => {
            const marker = L.marker(bin.coordinates, {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34]
                })
            }).addTo(map);

            marker.bindPopup(`
                <div style="padding: 0.5rem; min-width: 150px;">
                    <h3 style="color: #FFB74D; margin-bottom: 0.5rem;">${bin.name}</h3>
                    <p style="font-size: 0.875rem;">
                        ${bin.type === 'recycling' ? 'Tri selectif' : 'General'}
                    </p>
                </div>
            `);

            markers.bins.push(marker);
        });
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, initializing application...');
    
    try {
        // Load data from JSON files
        console.log('Loading data from JSON files...');
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