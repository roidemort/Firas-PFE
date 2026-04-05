## Plan: Dashboard LABO Phase 1 + Chat Pharmaciens

Objectif: livrer la Phase 1 prioritaire (chat reponses LABO, notifications, KPI, entonnoir chapitres, export) en reutilisant l'existant et en gardant l'isolation stricte des donnees par LABO.

### 1. Cadrage technique (bloquant)
- Valider contrats API et regles metier:
- Tabs chat: `Non repondues`, `Repondues`, `Toutes`
- Reponse `publique` / `privee`
- Anonymisation pharmacien (`Pharmacien #XXXX`)
- LABO repond uniquement (pas d'initiation)
- Scope Phase 1 uniquement, Phase 2 en backlog

### 2. Modele de donnees Chat (bloquant)
- Etendre le modele conversation (ou modele dedie Q&A) pour:
- question + reponses multiples (thread)
- `isAnswered`
- `visibility` (public/private)
- moderation (`isHidden`, `isDeleted`, `moderatedBy`, `moderatedAt`)
- alias pharmacien non-identifiant
- Ajouter migration idempotente + index (`courseId`, `laboId`, `isAnswered`, `createdAt`)

### 3. API LABO Chat
- Endpoints LABO:
- liste questions par onglet
- detail question (texte, formation, chapitre optionnel, date/heure)
- repondre a une question existante
- Interdire explicitement au LABO d'initier une conversation
- Verifier scope LABO via formations assignees

### 4. API Admin moderation Chat
- Endpoints admin pour masquer/supprimer/restaurer une reponse
- Audit trail obligatoire (soft hide/delete)

### 5. Notifications Chat
- Evenement: nouvelle question non repondue
- Canaux:
- badge dashboard LABO
- email optionnel (parametrable)
- Reutiliser `notification.service` + `email.queue`

### 6. Frontend LABO Chat
- Nouvelle page `Chat Pharmaciens` dans dashboard LABO
- Onglets: `Non repondues`, `Repondues`, `Toutes`
- Liste triee par date
- Fiche question: question + formation + chapitre + date/heure
- Zone de reponse + switch public/prive + bouton `Envoyer`
- Identite pharmacien masquee (alias)

### 7. Frontend Admin moderation Chat
- Ecran admin moderation:
- filtrer par labo/formation/statut
- masquer/supprimer/restaurer reponses

### 8. KPI/Stats LABO (Phase 1)
- Endpoints + UI pour:
- inscrits
- taux completion
- score quiz
- tendance
- entonnoir chapitres (abandon par chapitre)
- Tous les calculs se font cote serveur

### 9. Export (Phase 1)
- Export CSV des stats agregees
- Export PDF rapport synthese
- Aucune donnee personnelle pharmacien

### 10. Temps reel / refresh
- V1: polling 30s pour nouvelles questions non repondues + badge
- V2 possible: WebSocket

### 11. Securite & permissions (transverse)
- LABO voit uniquement ses formations/questions
- LABO n'accede jamais aux donnees personnelles pharmaciens
- Admin peut desactiver acces chat LABO a tout moment

### 12. QA / recette / rollout
- Tests API + smoke UI + verification responsive (desktop/tablette)
- Checklist permission, moderation, notifications, KPI, export

---

## Priorisation Phase 1 (execution)
1. Chat reponses LABO (critique)
2. Notifications chat (haute)
3. KPI formation (critique)
4. Entonnoir chapitres (haute)
5. Export CSV/PDF (haute)
6. Durcissement permissions + recette

## Contraintes techniques a respecter
- SPA (pas de reload complet)
- Responsive desktop prioritaire
- Calculs stats cote serveur uniquement
- Charts via librairie legere deja integree (ApexCharts)
- Isolation LABO par middleware token/role

---

## QA Checklist Export Analytics (CSV + PDF)

Checklist execute-ready pour verifier l export des stats LABO sans donnees personnelles pharmacien.

### 0) Prerequis
- Avoir un compte `LABO` assigne a au moins 1 formation.
- Avoir des inscriptions/avancement sur cette formation (sinon valeurs a 0).
- Backend et frontend demarres localement.

### 1) Demarrage local
1. Backend
	- `cd bachouelmaher-back-api-6bf8828311ea`
	- `npm install`
	- `npm run migration:run`
	- `npm run dev`
2. Frontend
	- `cd bachouelmaher-web-site-f3a188ca3c77`
	- `npm install`
	- `npm start`

### 2) Smoke API Export CSV (PowerShell)
1. Definir variables:
	- `$TOKEN = "<LABO_JWT_TOKEN>"`
	- `$COURSE_ID = "<COURSE_ID_ASSIGNE_AU_LABO>"`
2. Executer:
	- `Invoke-WebRequest -Uri "http://localhost:3000/api/v1/labo/courses/$COURSE_ID/analytics/export?format=csv" -Headers @{ Authorization = "Bearer $TOKEN" } -OutFile ".\analytics.csv"`
3. Verifier:
	- Le fichier `analytics.csv` est cree.
	- Le contenu contient: `KPI`, `Tendency`, `Chapter`.
	- Aucune colonne avec donnees personnelles pharmacien (email, nom, id pharmacien).

### 3) Smoke API Export PDF (PowerShell)
1. Executer:
	- `Invoke-WebRequest -Uri "http://localhost:3000/api/v1/labo/courses/$COURSE_ID/analytics/export?format=pdf" -Headers @{ Authorization = "Bearer $TOKEN" } -OutFile ".\analytics.pdf"`
2. Verifier:
	- Le fichier `analytics.pdf` est cree et lisible.
	- Le PDF contient: KPIs, tendance M/M-1, entonnoir chapitres.
	- Aucune donnee personnelle pharmacien visible.

### 4) Validation format invalide
1. Executer:
	- `Invoke-RestMethod -Method GET -Uri "http://localhost:3000/api/v1/labo/courses/$COURSE_ID/analytics/export?format=xlsx" -Headers @{ Authorization = "Bearer $TOKEN" }`
2. Verifier:
	- Reponse d erreur metier: `format : Format must be csv or pdf`.

### 5) Validation permissions / scope
1. Utiliser un `COURSE_ID` non assigne au LABO.
2. Appeler export CSV puis PDF.
3. Verifier:
	- Reponse refusee (`status=false`/`Error`) dans les deux cas.

### 6) Smoke UI (dashboard LABO)
1. Aller sur `http://localhost:4200/labo/dashboard/courses/:id`.
2. Cliquer `Exporter CSV` puis `Exporter PDF`.
3. Verifier:
	- Le telechargement se declenche dans le navigateur.
	- Nom de fichier attendu: `<course>-analytics-YYYY-MM-DD.csv|pdf`.
	- Pas de blocage UX (bouton desactive pendant export, toast succes/erreur).

### 7) Double-check technique
1. Backend build
	- `cd bachouelmaher-back-api-6bf8828311ea`
	- `npm run build`
2. Frontend build
	- `cd bachouelmaher-web-site-f3a188ca3c77`
	- `npm run build`
3. Diagnostics VS Code
	- verifier absence d erreurs compile sur les fichiers modifies.

### 8) Criteres d acceptance
- Export CSV fonctionne.
- Export PDF fonctionne.
- Donnees exportees = agregees uniquement.
- Scope LABO respecte (formation assignee uniquement).
- Builds backend/frontend passent.
