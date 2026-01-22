-- ============================================
-- REQUETES SQL POUR LES BOUTONS INTERACTIFS
-- ============================================

-- ============================================
-- 1. BOUTON "S'inscrire" à un événement
-- ============================================
-- Insère une participation d'un utilisateur à un événement
INSERT INTO participe (id_event, id_user, date_inscription)
VALUES (?, ?, NOW());

-- Vérifier si l'utilisateur est déjà inscrit
SELECT COUNT(*) 
FROM participe 
WHERE id_event = ? AND id_user = ?;

-- Incrémenter le nombre de participants (si nécessaire via trigger ou application)
-- Note: Le nombre de participants peut être calculé avec:
SELECT COUNT(*) as nb_participants
FROM participe
WHERE id_event = ?;

-- ============================================
-- 2. BOUTON "Créer un événement"
-- ============================================
-- Insère un nouvel événement dans la base de données
INSERT INTO evenement (titre, description, date_deb, date_fin, dechet_collecte, status, creator_id)
VALUES (?, ?, ?, ?, 0, 1, ?);

-- Récupérer l'ID de l'événement créé
SELECT LAST_INSERT_ID() as id_event;

-- Associer l'événement à une plage (si nécessaire)
INSERT INTO se_deroule (id_plage, id_event)
VALUES (?, ?);

-- ============================================
-- 3. BOUTON "Connexion" (Login)
-- ============================================
-- Vérifier les identifiants de connexion
SELECT id_user, mail, nom, prenom, niveau, nb_collecte, nb_user_parraine
FROM user
WHERE mail = ? AND hash_mdp = ?;

-- Note: Le hash_mdp doit être comparé avec le hash du mot de passe fourni
-- En production, utiliser une fonction de hachage comme bcrypt ou SHA-256

-- ============================================
-- 4. BOUTON "Inscription" (Register)
-- ============================================
-- Créer un nouvel utilisateur
INSERT INTO user (mail, nom, prenom, hash_mdp, date_naissance, niveau, nb_collecte, nb_user_parraine, id_parrainage)
VALUES (?, ?, ?, ?, ?, 1, 0, 0, ?);

-- Vérifier si l'email existe déjà
SELECT COUNT(*) 
FROM user 
WHERE mail = ?;

-- Si un code de parrainage est fourni, récupérer l'ID du parrainage
SELECT id_parrainage 
FROM parrainage 
WHERE code = ?;

-- Incrémenter le nombre d'utilisateurs parrainés
UPDATE user 
SET nb_user_parraine = nb_user_parraine + 1 
WHERE id_user = (SELECT id_user FROM user WHERE id_parrainage = ? LIMIT 1);

-- ============================================
-- 5. BOUTON "Déconnexion"
-- ============================================
-- Pas de requête SQL nécessaire (gestion côté client/session)
-- Mais on peut logger la déconnexion si nécessaire

-- ============================================
-- 6. BOUTON "Mettre à jour le profil"
-- ============================================
-- Mettre à jour les informations du profil utilisateur
UPDATE user 
SET nom = ?, prenom = ?, date_naissance = ?
WHERE id_user = ?;

-- ============================================
-- 7. BOUTON "Ajouter des déchets collectés" (après un événement)
-- ============================================
-- Mettre à jour le nombre de déchets collectés pour un événement
UPDATE evenement 
SET dechet_collecte = dechet_collecte + ?
WHERE id_event = ?;

-- Mettre à jour le nombre de collectes de l'utilisateur
UPDATE user 
SET nb_collecte = nb_collecte + 1
WHERE id_user = ?;

-- Calculer et mettre à jour le niveau de l'utilisateur (exemple: 1 niveau tous les 5 événements)
UPDATE user 
SET niveau = FLOOR(nb_collecte / 5) + 1
WHERE id_user = ?;

-- ============================================
-- 8. BOUTON "Marquer une plage comme nettoyée"
-- ============================================
-- Mettre à jour le statut d'une plage
UPDATE plage_a_collecter 
SET status = 2
WHERE id_plage = ?;

-- ============================================
-- 9. BOUTON "Créer un badge"
-- ============================================
-- Insérer un nouveau badge
INSERT INTO badge (nom, description)
VALUES (?, ?);

-- Attribuer un badge à un utilisateur
INSERT INTO obtient (id_user, id_badge)
VALUES (?, ?);

-- ============================================
-- 10. BOUTON "Envoyer un message" (chat)
-- ============================================
-- Récupérer ou créer un chat pour un événement
SELECT id_chat 
FROM chat 
WHERE type = 'event' AND id_event = ?;

-- Si le chat n'existe pas, le créer
INSERT INTO chat (type, id_event)
VALUES ('event', ?);

-- Insérer un message dans le chat
INSERT INTO message (chat_id, id_user, contenu, date_envoie)
VALUES (?, ?, ?, NOW());

-- ============================================
-- 11. REQUETES DE LECTURE POUR L'AFFICHAGE
-- ============================================

-- Récupérer tous les événements à venir
SELECT e.id_event, e.titre, e.description, e.date_deb, e.date_fin, 
       e.dechet_collecte, e.status, u.nom as creator_nom, u.prenom as creator_prenom,
       COUNT(p.id_user) as nb_participants
FROM evenement e
LEFT JOIN user u ON e.creator_id = u.id_user
LEFT JOIN participe p ON e.id_event = p.id_event
WHERE e.status = 1 AND e.date_deb > NOW()
GROUP BY e.id_event
ORDER BY e.date_deb ASC;

-- Récupérer tous les événements terminés
SELECT e.id_event, e.titre, e.description, e.date_deb, e.date_fin, 
       e.dechet_collecte, e.status, u.nom as creator_nom, u.prenom as creator_prenom,
       COUNT(p.id_user) as nb_participants
FROM evenement e
LEFT JOIN user u ON e.creator_id = u.id_user
LEFT JOIN participe p ON e.id_event = p.id_event
WHERE e.status = 0 OR e.date_fin < NOW()
GROUP BY e.id_event
ORDER BY e.date_fin DESC;

-- Récupérer toutes les plages
SELECT id_plage, nom, lat, lng, status
FROM plage_a_collecter
ORDER BY nom;

-- Récupérer le classement des utilisateurs (leaderboard)
SELECT u.id_user, u.nom, u.prenom, u.niveau, u.nb_collecte,
       COALESCE(SUM(e.dechet_collecte), 0) as total_dechets,
       COUNT(DISTINCT p.id_event) as nb_evenements
FROM user u
LEFT JOIN participe p ON u.id_user = p.id_user
LEFT JOIN evenement e ON p.id_event = e.id_event
GROUP BY u.id_user
ORDER BY total_dechets DESC, nb_evenements DESC
LIMIT 10;

-- Récupérer les statistiques du dashboard
SELECT 
    COUNT(DISTINCT e.id_event) as total_evenements,
    COUNT(DISTINCT CASE WHEN e.date_deb > NOW() THEN e.id_event END) as evenements_a_venir,
    COUNT(DISTINCT p.id_user) as total_participants,
    COALESCE(SUM(e.dechet_collecte), 0) as total_dechets,
    COUNT(DISTINCT CASE WHEN pl.status = 2 THEN pl.id_plage END) as plages_nettoyees
FROM evenement e
LEFT JOIN participe p ON e.id_event = p.id_event
LEFT JOIN se_deroule sd ON e.id_event = sd.id_event
LEFT JOIN plage_a_collecter pl ON sd.id_plage = pl.id_plage;

-- Récupérer les badges d'un utilisateur
SELECT b.id_badge, b.nom, b.description
FROM badge b
INNER JOIN obtient o ON b.id_badge = o.id_badge
WHERE o.id_user = ?;

-- Récupérer l'historique d'un utilisateur
SELECT e.id_event, e.titre, e.date_deb, e.date_fin, e.dechet_collecte,
       COUNT(DISTINCT p.id_user) as nb_participants
FROM evenement e
INNER JOIN participe p ON e.id_event = p.id_event
WHERE p.id_user = ? AND (e.status = 0 OR e.date_fin < NOW())
GROUP BY e.id_event
ORDER BY e.date_fin DESC;

-- ============================================
-- 12. REQUETES POUR LA CARTE INTERACTIVE
-- ============================================

-- Récupérer les événements avec leurs coordonnées (via les plages associées)
SELECT e.id_event, e.titre, e.date_deb, pl.lat, pl.lng
FROM evenement e
INNER JOIN se_deroule sd ON e.id_event = sd.id_event
INNER JOIN plage_a_collecter pl ON sd.id_plage = pl.id_plage
WHERE e.status = 1;

-- Récupérer toutes les plages avec leurs coordonnées
SELECT id_plage, nom, lat, lng, status
FROM plage_a_collecter;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. Toutes les requêtes utilisent des paramètres (?) qui doivent être remplacés
--    par les valeurs réelles dans le code de l'application
-- 2. Les mots de passe doivent être hashés avant d'être stockés (NE JAMAIS stocker en clair)
-- 3. Utiliser des transactions pour les opérations multiples
-- 4. Ajouter des index sur les colonnes fréquemment utilisées dans les WHERE et JOIN
-- 5. Valider toutes les entrées utilisateur avant de les utiliser dans les requêtes SQL
-- 6. Utiliser des requêtes préparées pour éviter les injections SQL
