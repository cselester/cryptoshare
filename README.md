# Cryptoshare

Cryptoshare is a full-stack secret sharing app for sending sensitive text through a one-time link and a separate 6-digit code.

The frontend encrypts the secret in the browser using AES-GCM before it is sent to the backend. The backend stores only the encrypted payload, enforces expiry and attempt limits, and deletes the secret after it is viewed.

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

- Frontend: React, Vite, React Router
- Backend: FastAPI, SQLAlchemy
- Database: SQLite
- Encryption: Web Crypto API with PBKDF2 + AES-GCM

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
|   \-- requirements.txt
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- pages/
|   |   \-- utils/
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

## Setup

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

The backend runs at:

```text
http://127.0.0.1:8000
```

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

The frontend runs at:

```text
http://localhost:5173
```

## Environment Variables

Frontend variables:

- `VITE_API_BASE_URL`: Base URL for the backend API
- `VITE_APP_BASE_URL`: Base URL used when generating share links

Current backend settings are defined in code in `backend/app/core/config.py`:

- Share expiry: `10` minutes
- Max failed attempts: `5`
- Max ciphertext length: `50000`
- Allowed CORS origin: `http://localhost:5173`

## API Overview

Base path:

```text
/api/shares
```

Endpoints:

- `POST /api/shares` creates a secret share
- `GET /api/shares/{share_id}` fetches encrypted share metadata
- `POST /api/shares/{share_id}/attempt` records a failed decryption attempt
- `POST /api/shares/{share_id}/consume` deletes the secret after successful decryption

Example create payload:

```json
{
  "ciphertext": "base64-ciphertext",
  "salt": "base64-salt",
  "iv": "base64-iv"
}
```

## Database

- SQLite is used for storage.
- The database file is created as `cryptoshare.db`.
- Tables are created automatically when the FastAPI app starts.

## Security Notes

- Secrets are encrypted in the browser before being uploaded.
- The backend does not perform decryption.
- Share the link and the 6-digit code through different channels for better security.
- This project is suitable as a learning project or internal prototype. For production use, harden configuration, secrets handling, logging, deployment, and cleanup behavior.

## Development Notes

- The backend currently uses a local SQLite database.
- The frontend uses `import.meta.env` for configuration.
- There is no automated test suite in the repository yet.
- `frontend/README.md` is still the default Vite template and can be replaced or removed later.

## Future Improvements

- Add automated tests for backend routes and frontend flows
- Move backend settings to environment variables
- Add scheduled cleanup for expired secrets
- Add rate limiting and audit logging
- Add Docker support
- Replace SQLite for multi-user production deployment

## License

Add your preferred license here.
