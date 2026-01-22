CREATE DATABASE IF NOT EXISTS backlog_db;
USE backlog_db;

-- ----------------------------------------------------------
-- Script MySQL pour le backlog complet (ordre correct)
-- ----------------------------------------------------------

-- ----------------------------
-- Tables indépendantes (pas de FK vers d'autres tables)
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

-- User (doit être avant evenement)
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
-- Tables dépendantes (FK vers user, evenement, badge)
-- ----------------------------

-- Evenement (dépend de user)
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

-- Chat (dépend de evenement)
CREATE TABLE chat (
  id_chat INT NOT NULL AUTO_INCREMENT,
  type VARCHAR(50) NOT NULL COMMENT 'global ou event',
  id_event INT DEFAULT NULL,
  PRIMARY KEY (id_chat),
  FOREIGN KEY (id_event) REFERENCES evenement(id_event) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Message (dépend de chat et user)
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

-- Se_deroule (plage ↔ evenement)
CREATE TABLE se_deroule (
  id_plage INT NOT NULL,
  id_event INT NOT NULL,
  PRIMARY KEY (id_plage, id_event),
  FOREIGN KEY (id_plage) REFERENCES plage_a_collecter(id_plage) ON DELETE CASCADE,
  FOREIGN KEY (id_event) REFERENCES evenement(id_event) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Participe (user ↔ evenement)
CREATE TABLE participe (
  id_event INT NOT NULL,
  id_user INT NOT NULL,
  date_inscription DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_event, id_user),
  FOREIGN KEY (id_event) REFERENCES evenement(id_event) ON DELETE CASCADE,
  FOREIGN KEY (id_user) REFERENCES user(id_user) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Obtient (user ↔ badge)
CREATE TABLE obtient (
  id_user INT NOT NULL,
  id_badge INT NOT NULL,
  date_obtention DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_user, id_badge),
  FOREIGN KEY (id_user) REFERENCES user(id_user) ON DELETE CASCADE,
  FOREIGN KEY (id_badge) REFERENCES badge(id_badge) ON DELETE CASCADE
) ENGINE=InnoDB;

-- User_commune (association user ↔ commune)
CREATE TABLE user_commune (
  id_user INT NOT NULL,
  id_commune INT NOT NULL,
  PRIMARY KEY (id_user, id_commune),
  FOREIGN KEY (id_user) REFERENCES user(id_user) ON DELETE CASCADE,
  FOREIGN KEY (id_commune) REFERENCES commune(id_commune) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Historique_participation (user ↔ evenement)
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

-- Photo (user ↔ evenement)
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
