const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: 'http://localhost:5000'
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
      console.log('MySQL pas prêt, nouvelle tentative dans 2s...');
      setTimeout(connectWithRetry, 2000); // retry toutes les 2 secondes
    } else {
      console.log('Connecté à MySQL !');
    }
  });
}

// Lancer la tentative de connexion
connectWithRetry();

// Exemple d'API
app.get('/user', (req, res) => {
  db.query('SELECT * FROM user', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.listen(3000, () => {
  console.log('API Node lancée sur le port 3000');
});
