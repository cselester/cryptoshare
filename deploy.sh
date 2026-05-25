#!/bin/bash
# deploy.sh — Deploy Cryptoshare to Google Cloud Run
# Usage: bash deploy.sh
# Prerequisites: gcloud CLI installed and authenticated

set -e

# ─── CONFIG — edit these ─────────────────────────────────────────────────────
PROJECT_ID="your-gcp-project-id"       # gcloud projects list
REGION="us-central1"                   # Cloud Run region
BACKEND_SERVICE="cryptoshare-backend"
FRONTEND_SERVICE="cryptoshare-frontend"
# ─────────────────────────────────────────────────────────────────────────────

IMAGE_REGISTRY="gcr.io/$PROJECT_ID"

echo "=== Setting project ==="
gcloud config set project "$PROJECT_ID"

echo "=== Enabling required APIs ==="
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com

# ─── BACKEND ──────────────────────────────────────────────────────────────────
echo ""
echo "=== Building & pushing backend image ==="
cd backend

# Copy updated files over originals
cp -f deploy/db.py app/db.py
cp -f deploy/config.py app/core/config.py

gcloud builds submit \
  --tag "$IMAGE_REGISTRY/$BACKEND_SERVICE" \
  --project "$PROJECT_ID"

echo "=== Deploying backend to Cloud Run ==="
gcloud run deploy "$BACKEND_SERVICE" \
  --image "$IMAGE_REGISTRY/$BACKEND_SERVICE" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 3 \
  --set-env-vars "DATABASE_URL=sqlite:////data/cryptoshare.db"

BACKEND_URL=$(gcloud run services describe "$BACKEND_SERVICE" \
  --region "$REGION" --format "value(status.url)")
echo "Backend deployed at: $BACKEND_URL"

cd ..

# ─── FRONTEND ─────────────────────────────────────────────────────────────────
echo ""
echo "=== Building & pushing frontend image ==="
echo "Using backend URL: $BACKEND_URL"

cd frontend

gcloud builds submit \
  --tag "$IMAGE_REGISTRY/$FRONTEND_SERVICE" \
  --project "$PROJECT_ID" \
  --substitutions "_VITE_API_BASE_URL=$BACKEND_URL/api,_VITE_APP_BASE_URL=PLACEHOLDER"

# We need a two-pass: first deploy frontend to get its URL, then rebuild with correct VITE_APP_BASE_URL
echo "=== First-pass frontend deploy to get URL ==="
gcloud run deploy "$FRONTEND_SERVICE" \
  --image "$IMAGE_REGISTRY/$FRONTEND_SERVICE" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi \
  --min-instances 0 \
  --max-instances 3

FRONTEND_URL=$(gcloud run services describe "$FRONTEND_SERVICE" \
  --region "$REGION" --format "value(status.url)")
echo "Frontend URL: $FRONTEND_URL"

echo "=== Rebuilding frontend with correct VITE_APP_BASE_URL ==="
gcloud builds submit \
  --tag "$IMAGE_REGISTRY/$FRONTEND_SERVICE" \
  --project "$PROJECT_ID" \
  --build-arg "VITE_API_BASE_URL=$BACKEND_URL/api" \
  --build-arg "VITE_APP_BASE_URL=$FRONTEND_URL"

gcloud run deploy "$FRONTEND_SERVICE" \
  --image "$IMAGE_REGISTRY/$FRONTEND_SERVICE" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi

echo ""
echo "=== Updating backend CORS to allow frontend ==="
gcloud run services update "$BACKEND_SERVICE" \
  --region "$REGION" \
  --update-env-vars "ALLOWED_ORIGINS=$FRONTEND_URL"

echo ""
echo "✅  Deployment complete!"
echo "   Frontend: $FRONTEND_URL"
echo "   Backend:  $BACKEND_URL"

cd ..
