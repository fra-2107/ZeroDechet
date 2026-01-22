const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:8000', 'http://127.0.0.1:8000', 'http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:4200']
}));

app.use(express.json());

const dbConfig = {
  host: 'mysql',       // Nom du service MySQL dans docker-compose
  user: 'backlog_user',
  password: 'backlog_pass',
  database: 'backlog_db'
};

let db;

function connectWithRetry() {
  db = mysql.createConnection(dbConfig);
  db.connect(err => {
    if (err) {
      console.log('MySQL pas prêt, nouvelle tentative dans 2s...', err.message);
      setTimeout(connectWithRetry, 2000); // retry toutes les 2 secondes
    } else {
      console.log('Connecté à MySQL !');
    }
  });
  
  // Gérer les erreurs de connexion
  db.on('error', (err) => {
    console.log('Erreur MySQL:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('Reconnexion à MySQL...');
      connectWithRetry();
    } else {
      throw err;
    }
  });
}

// Lancer la tentative de connexion
connectWithRetry();

// ============================================
// ENDPOINTS API
// ============================================

// GET /users - Récupérer tous les utilisateurs
app.get('/users', (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  db.query('SELECT id_user, mail, nom, prenom, date_naissance, niveau, nb_collecte, nb_user_parraine FROM user', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET /nb_users - Compter le nombre d'utilisateurs (participants)
app.get('/nb_users', (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  db.query('SELECT COUNT(*) as count FROM user', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ count: results[0].count });
  });
});

// GET /events - Récupérer tous les événements (format frontend)
app.get('/events', (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  const query = `
    SELECT 
      e.id_event as id,
      e.titre as title,
      DATE(e.date_deb) as date,
      pl.nom as location,
      pl.lat as lat,
      pl.lng as lng,
      (SELECT COUNT(*) FROM participe WHERE id_event = e.id_event) as participants,
      e.dechet_collecte as wasteCollected,
      CASE 
        WHEN e.status = 0 OR e.date_fin < NOW() THEN 'completed'
        WHEN e.date_deb > NOW() THEN 'upcoming'
        ELSE 'ongoing'
      END as status,
      'beach' as type
    FROM evenement e
    LEFT JOIN se_deroule sd ON e.id_event = sd.id_event
    LEFT JOIN plage_a_collecter pl ON sd.id_plage = pl.id_plage
    ORDER BY e.date_deb ASC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log(`Found ${results.length} events in database`);
    // Transformer les résultats au format attendu par le frontend
    const formatted = results.map(event => ({
      id: 'e' + event.id,
      title: event.title,
      date: event.date,
      location: event.location || 'Lieu non spécifié',
      coordinates: (event.lat && event.lng) ? [parseFloat(event.lat), parseFloat(event.lng)] : [48.3733, -4.4180],
      participants: parseInt(event.participants) || 0,
      wasteCollected: parseInt(event.wasteCollected) || 0,
      status: event.status,
      type: event.type || 'beach'
    }));
    console.log(`Returning ${formatted.length} formatted events`);
    res.json(formatted);
  });
});

// GET /nb_events - Compter le nombre d'événements
app.get('/nb_events', (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  db.query('SELECT COUNT(*) as count FROM evenement', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ count: results[0].count });
  });
});

// GET /nb_events_upcoming - Compter les événements à venir
app.get('/nb_events_upcoming', (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  db.query('SELECT COUNT(*) as count FROM evenement WHERE status = 1 AND date_deb > NOW()', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ count: results[0].count });
  });
});

// GET /total_waste - Somme totale des déchets collectés
app.get('/total_waste', (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  db.query('SELECT COALESCE(SUM(dechet_collecte), 0) as total FROM evenement', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ total: results[0].total });
  });
});

// GET /nb_beaches_cleaned - Compter les plages nettoyées
app.get('/nb_beaches_cleaned', (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  db.query('SELECT COUNT(*) as count FROM plage_a_collecter WHERE status = 2', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ count: results[0].count });
  });
});

// GET /messages - Récupérer tous les messages
app.get('/messages', (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  db.query('SELECT * FROM message', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


// GET /beaches - Récupérer toutes les plages (format frontend)
app.get('/beaches', (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  db.query('SELECT id_plage, nom, lat, lng, status FROM plage_a_collecter ORDER BY id_plage', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    // Transformer les résultats au format attendu par le frontend
    const formatted = results.map(beach => ({
      id: 'b' + beach.id_plage,
      name: beach.nom || 'Plage sans nom',
      coordinates: (beach.lat && beach.lng) ? [parseFloat(beach.lat), parseFloat(beach.lng)] : [48.3733, -4.4180],
      status: beach.status === 2 ? 'clean' : beach.status === 1 ? 'needs-cleaning' : 'critical'
    }));
    res.json(formatted);
  });
});

// GET /leaderboard - Classement des utilisateurs (format frontend)
app.get('/leaderboard', (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  const query = `
    SELECT 
      u.id_user,
      CONCAT(u.prenom, ' ', u.nom) as name,
      COALESCE(SUM(e.dechet_collecte), 0) as waste,
      COUNT(DISTINCT p.id_event) as events,
      u.niveau as level
    FROM user u
    LEFT JOIN participe p ON u.id_user = p.id_user
    LEFT JOIN evenement e ON p.id_event = e.id_event
    GROUP BY u.id_user, u.nom, u.prenom, u.niveau
    ORDER BY waste DESC, events DESC
    LIMIT 10
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    // Transformer les résultats au format attendu par le frontend
    const formatted = results.map((user, index) => ({
      id: String(index + 1),
      name: user.name,
      waste: parseInt(user.waste) || 0,
      events: parseInt(user.events) || 0,
      level: parseInt(user.level) || 1
    }));
    res.json(formatted);
  });
});

// GET /badges - Récupérer tous les badges (format frontend)
app.get('/badges', (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  db.query('SELECT id_badge, nom, description FROM badge', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    // Transformer les résultats au format attendu par le frontend
    const formatted = results.map(badge => ({
      id: 'badge' + badge.id_badge,
      name: badge.nom,
      description: badge.description || '',
      icon: 'star' // Par défaut, peut être amélioré avec un champ dans la BDD
    }));
    res.json(formatted);
  });
});

// POST /login - Connexion utilisateur
app.post('/login', (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }
  
  // Rechercher l'utilisateur par email
  db.query('SELECT id_user, mail, nom, prenom, date_naissance, niveau, nb_collecte, nb_user_parraine, hash_mdp FROM user WHERE mail = ?', [email], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    const user = results[0];
    
    // Vérifier le mot de passe
    // NOTE: En production, utiliser bcrypt.compare() avec un vrai hash
    // Pour l'instant, comparaison simple (hash_mdp peut être en clair ou base64)
    const passwordMatch = user.hash_mdp === password || 
                         user.hash_mdp === Buffer.from(password).toString('base64') ||
                         user.hash_mdp === Buffer.from(password).toString('hex');
    
    if (passwordMatch) {
      // Connexion réussie - retourner les infos utilisateur (sans le hash)
      res.json({
        id: user.id_user,
        email: user.mail,
        nom: user.nom,
        prenom: user.prenom,
        dateNaissance: user.date_naissance,
        niveau: user.niveau,
        nbCollecte: user.nb_collecte,
        nbUserParraine: user.nb_user_parraine
      });
    } else {
      res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
  });
});

// GET /user/:id - Récupérer les informations d'un utilisateur
app.get('/user/:id', (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  const userId = req.params.id;
  
  db.query(`
    SELECT 
      u.id_user,
      u.mail,
      u.nom,
      u.prenom,
      u.date_naissance,
      u.niveau,
      u.nb_collecte,
      u.nb_user_parraine,
      COUNT(DISTINCT p.id_event) as nb_evenements,
      COALESCE(SUM(e.dechet_collecte), 0) as total_dechets,
      COUNT(DISTINCT o.id_badge) as nb_badges
    FROM user u
    LEFT JOIN participe p ON u.id_user = p.id_user
    LEFT JOIN evenement e ON p.id_event = e.id_event
    LEFT JOIN obtient o ON u.id_user = o.id_user
    WHERE u.id_user = ?
    GROUP BY u.id_user, u.mail, u.nom, u.prenom, u.date_naissance, u.niveau, u.nb_collecte, u.nb_user_parraine
  `, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const user = results[0];
    
    // Récupérer les badges de l'utilisateur
    db.query(`
      SELECT b.id_badge, b.nom, b.description
      FROM badge b
      INNER JOIN obtient o ON b.id_badge = o.id_badge
      WHERE o.id_user = ?
    `, [userId], (err, badgeResults) => {
      if (err) {
        console.error('Error fetching badges:', err);
        badgeResults = [];
      }
      
      res.json({
        id: user.id_user,
        email: user.mail,
        nom: user.nom,
        prenom: user.prenom,
        dateNaissance: user.date_naissance,
        niveau: user.niveau,
        nbCollecte: user.nb_collecte,
        nbUserParraine: user.nb_user_parraine,
        nbEvenements: parseInt(user.nb_evenements) || 0,
        totalDechets: parseInt(user.total_dechets) || 0,
        nbBadges: parseInt(user.nb_badges) || 0,
        badges: badgeResults || []
      });
    });
  });
});

app.listen(3000, () => {
  console.log('API Node lancée sur le port 3000');
});
