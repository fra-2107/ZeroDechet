// Mock Data
const mockEvents = [
    {
        id: 'e1',
        title: 'Grand nettoyage de la plage du Moulin Blanc',
        date: '2026-02-15',
        location: 'Plage du Moulin Blanc, Brest',
        coordinates: [48.3905, -4.4661],
        participants: 42,
        wasteCollected: 0,
        status: 'upcoming',
        type: 'beach'
    },
    {
        id: 'e2',
        title: 'Ramassage côtier Plougastel',
        date: '2026-02-08',
        location: "Anse de Lauberlac'h, Plougastel",
        coordinates: [48.3733, -4.3697],
        participants: 28,
        wasteCollected: 85,
        status: 'completed',
        type: 'coastal'
    },
    {
        id: 'e3',
        title: 'Action plage de Sainte-Anne-du-Portzic',
        date: '2026-01-20',
        location: 'Sainte-Anne-du-Portzic',
        coordinates: [48.3575, -4.5536],
        participants: 35,
        wasteCollected: 120,
        status: 'completed',
        type: 'beach'
    },
    {
        id: 'e4',
        title: 'Plongée nettoyage port de Brest',
        date: '2026-02-22',
        location: 'Port de Commerce, Brest',
        coordinates: [48.3833, -4.4951],
        participants: 12,
        wasteCollected: 0,
        status: 'upcoming',
        type: 'underwater'
    }
];

const mockBeaches = [
    { id: 'b1', name: 'Plage du Moulin Blanc', coordinates: [48.3905, -4.4661], status: 'needs-cleaning' },
    { id: 'b2', name: "Anse de Lauberlac'h", coordinates: [48.3733, -4.3697], status: 'clean' },
    { id: 'b3', name: 'Plage de Sainte-Anne', coordinates: [48.3575, -4.5536], status: 'clean' },
    { id: 'b4', name: 'Plage de Trez-Hir', coordinates: [48.3427, -4.6242], status: 'critical' }
];

const mockWasteBins = [
    { id: 'w1', name: 'Point tri Moulin Blanc', coordinates: [48.3915, -4.4670], type: 'recycling' },
    { id: 'w2', name: "Poubelle Lauberlac'h", coordinates: [48.3740, -4.3700], type: 'general' },
    { id: 'w3', name: 'Tri sélectif Sainte-Anne', coordinates: [48.3580, -4.5540], type: 'recycling' }
];

const leaderboardData = [
    { id: '1', name: 'Sophie Laurent', waste: 342, events: 22, level: 12 },
    { id: '2', name: 'Thomas Moreau', waste: 318, events: 19, level: 11 },
    { id: '3', name: 'Marie Dupont', waste: 245, events: 15, level: 8 },
    { id: '4', name: 'Lucas Bernard', waste: 198, events: 14, level: 7 },
    { id: '5', name: 'Emma Petit', waste: 175, events: 12, level: 7 }
];

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
        window.location.href = 'login.html';
    } else {
        // Redirect to login page
        window.location.href = 'login.html';
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
                if (pageName === 'dashboard') {
                    renderUpcomingEvents();
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
                } else if (pageName === 'history') {
                    renderHistory();
                } else if (pageName === 'events') {
                    // Attach event form handler
                    const eventForm = document.getElementById('eventForm');
                    if (eventForm) {
                        eventForm.addEventListener('submit', function(e) {
                            e.preventDefault();
                            alert('Événement créé avec succès !');
                            showPage('dashboard');
                        });
                    }
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
    const upcoming = mockEvents.filter(e => e.status === 'upcoming');

    container.innerHTML = upcoming.map(event => `
        <div class="event-card">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <h3 style="flex: 1;">${event.title}</h3>
                <span class="badge badge-green">
                    ${event.type === 'beach' ? '🏖️ Plage' : event.type === 'coastal' ? '🌊 Côtier' : '🤿 Plongée'}
                </span>
            </div>
            <p style="color: #6b6b6b; font-size: 0.875rem; margin-bottom: 0.5rem;">
                📅 ${new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <p style="color: #6b6b6b; font-size: 0.875rem; margin-bottom: 0.5rem;">
                📍 ${event.location}
            </p>
            <p style="color: #6b6b6b; font-size: 0.875rem; margin-bottom: 1rem;">
                👥 ${event.participants} participants inscrits
            </p>
            <button class="btn btn-primary" style="width: 100%;">S'inscrire</button>
        </div>
    `).join('');
}

// Render leaderboard
function renderLeaderboard() {
    const container = document.getElementById('leaderboard');
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
    const completed = mockEvents.filter(e => e.status === 'completed');

    container.innerHTML = completed.map(event => `
        <div class="card" style="margin-bottom: 1rem;">
            <div class="card-header">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h3 class="card-title">${event.title}</h3>
                        <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                            <span class="badge" style="background-color: #dcfce7; color: #166534;">✓ Terminé</span>
                            <span class="badge badge-green">
                                ${event.type === 'beach' ? '🏖️ Plage' : event.type === 'coastal' ? '🌊 Côtier' : '🤿 Plongée'}
                            </span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <div style="text-align: center; padding: 1rem; background-color: var(--sand-light); border-radius: 0.5rem; min-width: 100px;">
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--ocean-blue);">${event.wasteCollected}kg</div>
                            <div style="font-size: 0.75rem; color: #6b6b6b;">Déchets</div>
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
                    📅 ${new Date(event.date).toLocaleDateString('fr-FR')} • 📍 ${event.location}
                </p>
            </div>
        </div>
    `).join('');
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
        map = L.map('map').setView([48.3733, -4.4180], 12);

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
                    <p style="font-size: 0.875rem; margin-bottom: 0.25rem;">📅 ${new Date(event.date).toLocaleDateString('fr-FR')}</p>
                    <p style="font-size: 0.875rem; margin-bottom: 0.25rem;">📍 ${event.location}</p>
                    <p style="font-size: 0.875rem;">👥 ${event.participants} participants</p>
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
                        ${beach.status === 'clean' ? '✓ Propre' :
                          beach.status === 'needs-cleaning' ? '⚠️ À nettoyer' : '🚨 Critique'}
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
                        ${bin.type === 'recycling' ? '♻️ Tri sélectif' : '🗑️ Général'}
                    </p>
                </div>
            `);

            markers.bins.push(marker);
        });
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check login status on page load
    updateAuthUI();

    // Load default page (dashboard)
    showPage('dashboard');
});