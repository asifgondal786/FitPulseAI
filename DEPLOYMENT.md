# FitPulseAI Deployment Guide

## Architecture

```
Vercel (Frontend)  →  Hetzner VPS (Backend API + AI Service)  →  Supabase (PostgreSQL)
```

- **Frontend**: React + Vite SPA, deployed on Vercel
- **Backend API**: Node.js HTTP server on port 4000
- **AI Service**: Python HTTP server on port 8001 (internal, called by backend only)
- **Database**: Supabase-hosted PostgreSQL

---

## Frontend (Vercel)

The frontend is already deployed. Ensure the Vercel project has this environment variable set:

| Variable | Value | When |
|---|---|---|
| `VITE_API_BASE_URL` | `https://your-hetzner-ip` or your domain | Production |

Without this, the app falls back to `http://localhost:4000` and API calls will fail in production.

### Local frontend build

```powershell
cd Frontend
npm install
npm run build   # outputs to dist/
npm run dev     # dev server at http://localhost:5173
```

---

## Backend (Hetzner VPS)

### Option A: Docker (recommended)

```bash
# 1. SSH into your Hetzner VPS
ssh root@your-server-ip

# 2. Clone the repo
git clone https://github.com/your-username/FitPulseAI.git
cd FitPulseAI

# 3. Create .env from template and fill in real values
cp Backend/.env.example Backend/.env
nano Backend/.env   # add your Supabase keys, CORS origins, etc.

# 4. Build and start the container
cd Backend
docker compose up -d --build

# 5. Verify
curl http://localhost:4000/health
curl http://localhost:4000/health/database
```

The container runs both the Node.js API (port 4000) and Python AI service (port 8001). Only port 4000 needs to be exposed to the public.

### Option B: Direct Node.js + Python

```bash
# Install Node.js 22 and Python 3.12 on the VPS first

# 1. Clone and install
git clone https://github.com/your-username/FitPulseAI.git
cd FitPulseAI/Backend
npm ci --omit=dev

# 2. Set up environment
cp .env.example .env
nano .env   # fill in real values

# 3. Install Python dependencies
cd ai-service
pip install -r requirements.txt

# 4. Start both services (use tmux or systemd)
cd ../
node src/server.js &          # API on port 4000
cd ai-service && python main.py &  # AI service on port 8001
```

For production use, set up **systemd services** or use **pm2** instead of background processes.

### Reverse proxy (Nginx + SSL)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # AI service is internal only — do NOT expose port 8001
}
```

Use **Certbot** for free SSL certificates:
```bash
sudo certbot --nginx -d api.yourdomain.com
```

---

## Database (Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API** and copy:
   - Project URL → `SUPABASE_URL`
   - anon public key → `SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
   - JWT secret → `SUPABASE_JWT_SECRET`
3. Go to **Project Settings → Database → Connection string** and copy the **pooler URL** → `SUPABASE_DATABASE_URL`
4. Initialize the schema:
   ```bash
   # On the VPS, with .env configured:
   curl -X POST http://localhost:4000/api/bootstrap \
     -H "x-bootstrap-secret: YOUR_BOOTSTRAP_SECRET"
   ```
   Or run `schema.sql` directly in the Supabase SQL editor.

---

## Environment Variables Summary

### Backend `.env`

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | API port (default 4000) |
| `AI_SERVICE_URL` | No | Python service URL (default http://localhost:8001) |
| `ALLOWED_ORIGINS` | **Yes** | Comma-separated allowed browser origins |
| `BOOTSTRAP_SECRET` | No | Secret for schema init endpoint |
| `SUPABASE_DATABASE_URL` | **Yes** | PostgreSQL connection string |
| `SUPABASE_URL` | No | Supabase project URL |
| `SUPABASE_ANON_KEY` | No | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase service role key |
| `SUPABASE_JWT_SECRET` | No | Supabase JWT secret |
| `AI_PROVIDER_URL` | No | External LLM endpoint (optional) |
| `AI_PROVIDER_API_KEY` | No | External LLM API key (optional) |

### Frontend (Vercel)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | **Yes** | Backend API URL (e.g. `https://api.yourdomain.com`) |

---

## CI

GitHub Actions runs on every push/PR to `main`/`master`:

1. **Frontend**: `npm ci` → `lint` → `build`
2. **Backend**: `npm ci` → `node --check` → `npm test`
3. **AI Service**: `py_compile` → install deps → run tests
4. **Docker**: build the backend image to validate the Dockerfile

---

## Quick Deploy Checklist

- [ ] Vercel: set `VITE_API_BASE_URL` environment variable
- [ ] Hetzner: clone repo, create `Backend/.env` with real Supabase credentials
- [ ] Hetzner: set `ALLOWED_ORIGINS` to your Vercel frontend URL
- [ ] Hetzner: `docker compose up -d --build`
- [ ] Supabase: run `schema.sql` or call `/api/bootstrap`
- [ ] DNS: point `api.yourdomain.com` to your Hetzner IP
- [ ] SSL: run `certbot --nginx`
- [ ] Verify: `curl https://api.yourdomain.com/health`
- [ ] Verify: frontend can register/login against the backend
