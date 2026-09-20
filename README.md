# 💊 Pharmacology for All

**Pharmacology for All** est un écosystème logiciel *cloud-native* de référentiel pharmaceutique numérique s'appuyant sur une architecture moderne en microservices. Développée comme projet de fin d'études à l'**École Nationale Supérieure Polytechnique de Douala (ENSPD)**, cette plateforme vise à briser l'indisponibilité de l'information médicamenteuse au sein des établissements de santé disposant de ressources limitées.

La plateforme intègre nativement un **assistant conversationnel médical intelligent et 100% local (RAG)** permettant aux patients et professionnels d'interroger un corpus massif de plus de **106 283 médicaments** tout en préservant la confidentialité totale des données de santé.

---

## 🚀 Fonctionnalités Clés

### 🌐 Écosystème Orbital & Consultation (Innovation Majeure)
* **Visualisation Orbitale (D3.js)** : Représentation graphique immersive interactive. Un médicament central est entouré de 8 bulles domaines animées (Composition, Posologie, Interactions, Contre-indications, Allergies, Indications, Sécurité, Présentations).
* **Moteur de Recherche Synchrone** : Recherche globale full-text avec autocomplétion ultra-rapide (<100ms).
* **Équivalences Internationales** : Correspondances croisées de médicaments à travers **58 pays** (plus de 530 176 lignes d'équivalences).

### 🤖 MedocAssistant : IA Médicale Locale & RAG
* **LLM Local Non-Cloud** : Propulsé par **Qwen2.5 (variante 1.5B)** déployé localement via **Ollama**, n'exigeant aucune connexion à des API externes et garantissant le secret médical.
* **Enrichissement Contextuel (RAG)** : Le système interroge parallèlement les bases MariaDB lors de la saisie utilisateur (`Promise.all`) pour injecter les données réelles des molécules directement dans le prompt système du LLM.

### 🔐 Gestion Métier & Sécurité
* **Authentification Forte** : Double profil (Médecin / Patient) avec contrôle d'accès strict (RBAC), isolation des fonctionnalités de CRUD (réservé aux médecins) et jetons éphémères **JWT hachés via bcrypt**.
* **Pharmacovigilance & Interactions** : Algorithme à trois étapes croisant les classes d'interactions chimiques de sévérité plutôt que les simples noms de marques.

---

## 🏗️ Architecture Technique (Monorepo)

Le système applique les concepts de la *Cloud Native Computing Foundation (CNCF)* distribués sur **17 conteneurs Docker combinés** interconnectés au travers d'un pattern **BFF (Backend For Frontend)**.

```text
       [ Navigateur Web Client ] 
                   │  (Next.js 14 + TailwindCSS + Zustand) [Port 4000]
                   ▼
         [ API GATEWAY (NestJS) ] [Port 3000]
                   │  (http-proxy-middleware + CORS + JWT Validation)
         ┌─────────┴────────────────────────────────────────┐
         ▼                                                  ▼
 ┌──────────────┐                                   ┌──────────────┐
 │ Auth Service │ [Port 3001]                       │ Drug Service │ [Port 3002]
 └──────┬───────┘                                   └──────┬───────┘
        ▼                                                  ▼
 ┌──────────────┐                                   ┌──────────────┐
 │ Search Serv. │ [Port 3005]                       │ Interact. MS │ [Port 3004]
 └──────┬───────┘                                   └──────┬───────┘
        ▼                                                  ▼
 ┌──────────────┐                                   ┌──────────────┐
 │ Chat IA (RAG)│ [Port 3013]                       │ 8 autres MS  │ ...
 └──────┬───────┘                                   └──────┬───────┘
        │                                                  │
        ▼                                                  ▼
 ┌─────────────────────────────────────────────────────────────────┐
 │   [ MariaDB Core (10.11) ]  ─  [ Redis 7 ]  ─  [ RabbitMQ 3 ]    │
 └────────────────────────────────┬────────────────────────────────┘
                                  │ (host.docker.internal)
                                  ▼
                     [ Ollama Server (Qwen2.5:1.5b) ] [VM Port 11434]
```

### Stack Technologique
* **Frontend** : Next.js 14 (App Router, Client Components), TailwindCSS, Zustand (Gestion d'état persistée).
* **Backend** : NestJS (TypeScript), TypeORM (Couche d'accès relationnelle).
* **Bases de Données & Cache** : MariaDB 10.11 (+260 tables relationnelles, ~1 Go de données médicales), Redis 7 (Cache de sessions & JWT Blacklist).
* **Messagerie Synchrone / Asynchrone** : RabbitMQ 3 (Événements inter-services).
* **Conteneurisation** : Docker & Docker Compose.

---

## 📊 Cartographie des 13 Microservices

Chaque domaine métier pharmaceutique est totalement encapsulé :

| Code | Microservice | Port | Rôle Principal |
| :--- | :--- | :--- | :--- |
| **MS1** | `auth-service` | `3001` | Cycle de vie utilisateur, profils Medecin/Patient, JWT |
| **MS2** | `drug-service` | `3002` | Cœur du catalogue, agrégateur de l'écosystème orbital |
| **MS3** | `posology-service` | `3003` | Gestion fine des dosages AMM selon les populations cibles |
| **MS4** | `interaction-service`| `3004` | Analyse des risques croisés, contre-indications et allergies |
| **MS5** | `search-service` | `3005` | Recherche Full-Text & Autocomplete optimisée en base |
| **MS6** | `indication-service` | `3006` | Cartographie des pathologies thérapeutiques (CIM-10, ATC) |
| **MS7** | `safety-service` | `3007` | Centralisation de la pharmacovigilance (effets indésirables) |
| **MS8** | `international-serv` | `3008` | Table d'équivalences de marques sur 58 pays étrangers |
| **MS9** | `document-service` | `3009` | Notices officielles réglementaires et RCP pour médecins |
| **MS10**| `patient-service` | `3010` | Carnet de santé numérique, ordonnances, favoris |
| **MS11**| `notification-serv`  | `3011` | Rappels asynchrones de prises de médicaments |
| **MS12**| `advisor-service` | `3012` | Moteur d'analyse de symptômes par extraction de mots-clés |
| **MS13**| `chat-service` | `3013` | Orchestration du pipeline RAG avec le LLM Qwen2.5 |

---

## 🛠️ Installation et Déploiement Local

Le déploiement est conçu pour s'exécuter sur un environnement **Ubuntu Server** (en machine virtuelle VirtualBox).

### Prérequis
* Docker & Docker Compose installés
* Node.js v18+ & npm
* Ollama configuré sur la machine hôte

### 1. Configuration de l'IA Locale (Ollama)
Installez Ollama de manière native sur votre serveur Ubuntu pour bénéficier des ressources directes du CPU :
```bash
curl -fsSL https://ollama.com | sh
ollama pull qwen2.5:1.5b
ollama serve &
```

### 2. Variables d'Environnement
Créez un fichier `.env` à la racine pour sécuriser vos accès MariaDB (ne pas pousser sur GitHub) :
```text
MARIADB_ROOT_PASSWORD=VotreMotDePasseFort
MARIADB_DATABASE=vxp_database
MARIADB_USER=staelpro
MARIADB_PASSWORD=VotreMotDePasseUtilisateur
JWT_SECRET=VotreCleSecreteSuperLongue
OLLAMA_HOST=http://docker.internal
```

### 3. Lancement de l'Infrastructure Backend (16 conteneurs)
```bash
cd ~/votredossier
docker compose up -d --build
```
*Vérifiez l'état des conteneurs avec `docker compose ps` ou `docker ps`.*

### 4. Lancement du Frontend Next.js
Dans un autre terminal ou en tâche de fond :
```bash
cd ~/votredossier/frontend
npm install
npm run dev -- --port 4000
```
L'application est désormais accessible sur : `http://IP:4000`

---

## 🧪 Données de Test Préenregistrées
Pour tester l'application directement après l'initialisation des schémas de base de données :

* **Profil Patient** :
  * **Email** : `patient@test.com`
  * **Mot de passe** : `Patient123!`
* **Profil Médecin** (Donne accès au privilège d'édition et CRUD) :
  * **Email** : `medecin@test.com`
  * **Mot de passe** : `Medecin123!`

---
