# Cryptoshare

Cryptoshare is a full-stack secret sharing app for sending sensitive text through a one-time link and a separate 6-digit code.

The frontend encrypts the secret in the browser using AES-GCM before it is sent to the backend. The backend stores only the encrypted payload, enforces expiry and attempt limits, and deletes the secret after it is viewed.

## Live Demo

- **Frontend:** https://cryptoshare-frontend-698546354721.us-central1.run.app
- **Backend API:** https://cryptoshare-backend-698546354721.us-central1.run.app

## Features

- Client-side encryption with the Web Crypto API
- Random 6-digit access code generated in the browser
- One-time secret retrieval flow
- Automatic expiry after 10 minutes
- Automatic deletion after a successful view
- Failed-attempt tracking with a maximum of 5 attempts
- FastAPI backend with SQLite storage
- React + Vite frontend

## Tech Stack

- Frontend: React, Vite, React Router — deployed on Google Cloud Run (nginx)
- Backend: FastAPI, SQLAlchemy — deployed on Google Cloud Run
- Database: SQLite (ephemeral per Cloud Run instance)
- Encryption: Web Crypto API with PBKDF2 + AES-GCM
- Container Registry: Google Artifact Registry
- CI/CD: Google Cloud Build

## How It Works

1. A user enters secret text in the frontend.
2. The frontend generates a 6-digit code.
3. The secret is encrypted locally in the browser using that code.
4. Only the ciphertext, salt, and IV are sent to the backend.
5. The backend stores the encrypted payload and returns a short share ID.
6. The sender shares the link and code through separate channels.
7. The recipient opens the link, enters the 6-digit code, and decrypts the secret in the browser.
8. After a successful view, the backend deletes the stored secret.

## Project Structure

```text
cryptoshare/
|-- backend/
|   |-- app/
|   |   |-- core/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- db.py
|   |   |-- main.py
|   |   |-- models.py
|   |   \-- schemas.py
|   |-- Dockerfile
|   |-- cloudbuild.yaml
|   \-- requirements.txt
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- pages/
|   |   \-- utils/
|   |-- Dockerfile
|   |-- cloudbuild.yaml
|   |-- nginx.conf
|   |-- package.json
|   \-- vite.config.js
|-- cryptoshare.db
|-- package.json
\-- README.md
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm

## Local Development

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd cryptoshare
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Run the API server:

```bash
uvicorn app.main:app --reload
```

The backend runs at `http://127.0.0.1:8000`.

### 3. Set up the frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_APP_BASE_URL=http://localhost:5173
```

Start the frontend:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Deploying to Google Cloud

### Prerequisites

- Google Cloud project with billing enabled
- `gcloud` CLI installed and authenticated
- Docker (for local builds; Cloud Build handles remote builds)

### 1. Enable APIs and set up Artifact Registry

```bash
PROJECT_ID="your-gcp-project-id"
gcloud config set project $PROJECT_ID

gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com

gcloud artifacts repositories create cryptoshare \
  --repository-format=docker \
  --location=us-central1

PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/storage.admin"
```

### 2. Deploy the backend

```bash
cd backend
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/$PROJECT_ID/cryptoshare/backend

gcloud run deploy cryptoshare-backend \
  --image us-central1-docker.pkg.dev/$PROJECT_ID/cryptoshare/backend \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --set-env-vars "DATABASE_URL=sqlite:////data/cryptoshare.db"
```

Note the `Service URL` printed at the end.

### 3. Deploy the frontend

```bash
cd frontend
BACKEND_URL="https://your-backend-url.us-central1.run.app"

cat > /tmp/cloudbuild-frontend.yaml << EOF
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - build
      - '--build-arg'
      - 'VITE_API_BASE_URL=${BACKEND_URL}/api'
      - '--build-arg'
      - 'VITE_APP_BASE_URL=placeholder'
      - '-t'
      - 'us-central1-docker.pkg.dev/${PROJECT_ID}/cryptoshare/frontend'
      - '.'
images:
  - 'us-central1-docker.pkg.dev/${PROJECT_ID}/cryptoshare/frontend'
EOF

gcloud builds submit --config /tmp/cloudbuild-frontend.yaml .

gcloud run deploy cryptoshare-frontend \
  --image us-central1-docker.pkg.dev/$PROJECT_ID/cryptoshare/frontend \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi
```

Note the frontend `Service URL`, then rebuild with the correct `VITE_APP_BASE_URL` and redeploy.

### 4. Update CORS

```bash
FRONTEND_URL="https://your-frontend-url.us-central1.run.app"
gcloud run services update cryptoshare-backend \
  --region us-central1 \
  --update-env-vars "ALLOWED_ORIGINS=$FRONTEND_URL"
```

## Environment Variables

### Frontend (baked in at build time via Vite)

| Variable            | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Base URL for the backend API (e.g. `https://backend.run.app/api`) |
| `VITE_APP_BASE_URL` | Base URL used when generating share links                         |

### Backend (set as Cloud Run env vars)

| Variable          | Description                                                              |
| ----------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`    | SQLAlchemy connection string (default: `sqlite:////data/cryptoshare.db`) |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins                             |

Backend settings in `backend/app/core/config.py`:

- Share expiry: `10` minutes
- Max failed attempts: `5`
- Max ciphertext length: `50000`

## API Overview

Base path: `/api/shares`

| Method | Endpoint                         | Description                                   |
| ------ | -------------------------------- | --------------------------------------------- |
| `POST` | `/api/shares`                    | Create a new secret share                     |
| `GET`  | `/api/shares/{share_id}`         | Fetch encrypted share metadata                |
| `POST` | `/api/shares/{share_id}/attempt` | Record a failed decryption attempt            |
| `POST` | `/api/shares/{share_id}/consume` | Delete the secret after successful decryption |

Example create payload:

```json
{
  "ciphertext": "base64-ciphertext",
  "salt": "base64-salt",
  "iv": "base64-iv"
}
```

## Database

SQLite is used for local development and is also used in the Cloud Run deployment. Note that Cloud Run containers are stateless — the SQLite file does not persist across restarts or new instances. For production use with persistence, replace SQLite with Cloud SQL (PostgreSQL) and update `DATABASE_URL` accordingly.

## Security Notes

- Secrets are encrypted in the browser before being uploaded.
- The backend never performs decryption — it stores only the ciphertext.
- Share the link and the 6-digit code through different channels for better security.
- This project is suitable as a learning project or internal prototype. For production use, harden configuration, secrets handling, logging, and cleanup behavior.

## Future Improvements

- Replace SQLite with Cloud SQL (PostgreSQL) for persistent, multi-instance storage
- Add automated tests for backend routes and frontend flows
- Add scheduled cleanup for expired secrets
- Add rate limiting and audit logging
- Set up a custom domain via Cloud Run domain mappings
