-- ----------------------------------------------------------
-- Création de la base et des tables
-- ----------------------------------------------------------
CREATE DATABASE IF NOT EXISTS backlog_db;
USE backlog_db;

-- ----------------------------
-- Tables indépendantes
-- ----------------------------
-- Badge
CREATE TABLE badge (
  id_badge INT NOT NULL AUTO_INCREMENT,
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  PRIMARY KEY (id_badge)
) ENGINE=InnoDB;

-- Parrainage
CREATE TABLE parrainage (
  id_parrainage INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(255) NOT NULL,
  date_crea DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_parrainage)
) ENGINE=InnoDB;

-- Plage
CREATE TABLE plage_a_collecter (
  id_plage INT NOT NULL AUTO_INCREMENT,
  nom VARCHAR(255),
  lat DOUBLE NOT NULL,
  lng DOUBLE NOT NULL,
  status TINYINT NOT NULL DEFAULT 0 COMMENT '0=pas nettoyée, 1=en cours, 2=nettoyée',
  PRIMARY KEY (id_plage)
) ENGINE=InnoDB;

-- User
CREATE TABLE user (
  id_user INT NOT NULL AUTO_INCREMENT,
  mail VARCHAR(255) NOT NULL UNIQUE,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  hash_mdp VARCHAR(260) NOT NULL,
  date_naissance DATE,
  niveau INT NOT NULL DEFAULT 1,
  nb_collecte INT NOT NULL DEFAULT 0,
  nb_user_parraine INT NOT NULL DEFAULT 0,
  id_parrainage INT DEFAULT NULL,
  PRIMARY KEY (id_user),
  FOREIGN KEY (id_parrainage) REFERENCES parrainage(id_parrainage) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Commune
CREATE TABLE commune (
  id_commune INT NOT NULL AUTO_INCREMENT,
  nom_commune VARCHAR(255) NOT NULL,
  PRIMARY KEY (id_commune)
) ENGINE=InnoDB;

-- ----------------------------
-- Tables dépendantes
-- ----------------------------
-- Evenement
CREATE TABLE evenement (
  id_event INT NOT NULL AUTO_INCREMENT,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  date_deb DATETIME NOT NULL,
  date_fin DATETIME NOT NULL,
  dechet_collecte INT DEFAULT 0,
  status TINYINT NOT NULL DEFAULT 1 COMMENT '0=fermé,1=ouvert',
  creator_id INT NOT NULL,
  PRIMARY KEY (id_event),
  FOREIGN KEY (creator_id) REFERENCES user(id_user) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Chat
CREATE TABLE chat (
  id_chat INT NOT NULL AUTO_INCREMENT,
  type VARCHAR(50) NOT NULL COMMENT 'global ou event',
  id_event INT DEFAULT NULL,
  PRIMARY KEY (id_chat),
  FOREIGN KEY (id_event) REFERENCES evenement(id_event) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Message
CREATE TABLE message (
  id_message INT NOT NULL AUTO_INCREMENT,
  chat_id INT NOT NULL,
  id_user INT NOT NULL,
  contenu TEXT NOT NULL,
  date_envoie DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_message),
  FOREIGN KEY (chat_id) REFERENCES chat(id_chat) ON DELETE CASCADE,
  FOREIGN KEY (id_user) REFERENCES user(id_user) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Se_deroule
CREATE TABLE se_deroule (
  id_plage INT NOT NULL,
  id_event INT NOT NULL,
  PRIMARY KEY (id_plage, id_event),
  FOREIGN KEY (id_plage) REFERENCES plage_a_collecter(id_plage) ON DELETE CASCADE,
  FOREIGN KEY (id_event) REFERENCES evenement(id_event) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Participe
CREATE TABLE participe (
  id_event INT NOT NULL,
  id_user INT NOT NULL,
  date_inscription DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_event, id_user),
  FOREIGN KEY (id_event) REFERENCES evenement(id_event) ON DELETE CASCADE,
  FOREIGN KEY (id_user) REFERENCES user(id_user) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Obtient
CREATE TABLE obtient (
  id_user INT NOT NULL,
  id_badge INT NOT NULL,
  date_obtention DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_user, id_badge),
  FOREIGN KEY (id_user) REFERENCES user(id_user) ON DELETE CASCADE,
  FOREIGN KEY (id_badge) REFERENCES badge(id_badge) ON DELETE CASCADE
) ENGINE=InnoDB;

-- User_commune
CREATE TABLE user_commune (
  id_user INT NOT NULL,
  id_commune INT NOT NULL,
  PRIMARY KEY (id_user, id_commune),
  FOREIGN KEY (id_user) REFERENCES user(id_user) ON DELETE CASCADE,
  FOREIGN KEY (id_commune) REFERENCES commune(id_commune) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Historique_participation
CREATE TABLE historique_participation (
  id_historique INT NOT NULL AUTO_INCREMENT,
  id_user INT NOT NULL,
  id_event INT NOT NULL,
  date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  impact INT DEFAULT 0,
  PRIMARY KEY (id_historique),
  FOREIGN KEY (id_user) REFERENCES user(id_user) ON DELETE CASCADE,
  FOREIGN KEY (id_event) REFERENCES evenement(id_event) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Photo
CREATE TABLE photo (
  id_photo INT NOT NULL AUTO_INCREMENT,
  id_event INT NOT NULL,
  id_user INT NOT NULL,
  type ENUM('avant','apres') NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_photo),
  FOREIGN KEY (id_event) REFERENCES evenement(id_event) ON DELETE CASCADE,
  FOREIGN KEY (id_user) REFERENCES user(id_user) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- Remplissage des données
-- ----------------------------------------------------------
USE backlog_db;

-- Communes
INSERT INTO commune (nom_commune) VALUES
('Brest'),
('Plouzané'),
('Guipavas'),
('Le Relecq-Kerhuon'),
('Plougastel-Daoulas');

-- Badges
INSERT INTO badge (nom, description) VALUES
('Premier ramassage', 'Participation à un premier événement'),
('Héros des plages', 'Plus de 100kg de déchets collectés'),
('Ambassadeur', 'A parrainé 5 utilisateurs'),
('Fidèle', 'Participation à 10 événements');

-- Parrainage
INSERT INTO parrainage (code) VALUES
('BREST-CLEAN-001'),
('OCEAN-029'),
('PLAGE-VERTE');

-- Plages à collecter
INSERT INTO plage_a_collecter (nom, lat, lng, status) VALUES
('Plage du Moulin Blanc', 48.3904, -4.4267, 0),
('Plage de Sainte-Anne-du-Portzic', 48.3646, -4.5672, 1),
('Plage du Trez-Hir', 48.3525, -4.6170, 2),
('Plage de Porz Pabu', 48.3459, -4.6383, 0),
('Plage du Douvez', 48.3561, -4.5854, 0);

-- Utilisateurs
INSERT INTO user (mail, nom, prenom, hash_mdp, date_naissance, niveau, nb_collecte, nb_user_parraine, id_parrainage)
VALUES
('alice@brest.fr', 'Le Guen', 'Alice', 'hash123', '1995-04-12', 3, 5, 1, 1),
('bob@brest.fr', 'Martin', 'Bob', 'hash456', '1990-09-21', 2, 3, 0, NULL),
('charles@brest.fr', 'Durand', 'Charles', 'hash789', '1985-02-03', 5, 12, 2, 2),
('diane@brest.fr', 'Kerjean', 'Diane', 'hashabc', '2000-11-15', 1, 1, 0, NULL),
('eric@brest.fr', 'Le Roux', 'Eric', 'hashdef', '1992-06-30', 4, 8, 3, 3);

-- Association utilisateurs ↔ communes
INSERT INTO user_commune (id_user, id_commune) VALUES
(1, 1),
(2, 1),
(3, 3),
(4, 2),
(5, 5);

-- Événements
INSERT INTO evenement (titre, description, date_deb, date_fin, dechet_collecte, status, creator_id)
VALUES
('Nettoyage du Moulin Blanc','Ramassage de déchets sur la plage du Moulin Blanc','2025-03-15 09:00:00','2025-03-15 12:00:00',85,0,1),
('Opération Portzic propre','Action citoyenne pour préserver le littoral','2025-04-10 10:00:00','2025-04-10 13:00:00',0,1,3),
('Ramassage Trez-Hir','Nettoyage de printemps au Trez-Hir','2025-05-05 14:00:00','2025-05-05 17:00:00',120,0,2);

-- Lieux des événements
INSERT INTO se_deroule (id_plage, id_event) VALUES
(1, 1),
(2, 2),
(3, 3);

-- Participation
INSERT INTO participe (id_event, id_user) VALUES
(1, 1),(1, 2),(1, 4),
(2, 1),(2, 3),(2, 5),
(3, 2),(3, 3),(3, 5);

-- Historique de participation
INSERT INTO historique_participation (id_user, id_event, impact) VALUES
(1, 1, 30),(2, 1, 20),(4, 1, 15),
(1, 2, 25),(3, 2, 40),(5, 2, 35),
(2, 3, 50),(3, 3, 40),(5, 3, 30);

-- Chats
INSERT INTO chat (type, id_event) VALUES
('global', NULL),('event', 1),('event', 2),('event', 3);

-- Messages
INSERT INTO message (chat_id, id_user, contenu) VALUES
(1, 1, 'Bienvenue sur le chat global Brest Clean 🌊'),
(1, 3, 'Merci à tous pour votre engagement !'),
(2, 2, 'Rendez-vous à 9h devant le parking du Moulin Blanc'),
(3, 5, 'Pensez à apporter des gants'),
(4, 3, 'Très belle collecte aujourd’hui 👏');

-- Badges obtenus
INSERT INTO obtient (id_user, id_badge) VALUES
(1, 1),(1, 4),(2, 1),(3, 1),(3, 2),(5, 3);

-- Photos
INSERT INTO photo (id_event, id_user, type, file_path) VALUES
(1, 1, 'avant', '/photos/moulin_blanc_avant.jpg'),
(1, 1, 'apres', '/photos/moulin_blanc_apres.jpg'),
(3, 3, 'avant', '/photos/trez_hir_avant.jpg'),
(3, 3, 'apres', '/photos/trez_hir_apres.jpg');
