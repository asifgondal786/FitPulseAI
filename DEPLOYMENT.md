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

The stack is four containers: Postgres, the Python AI service, the Node API, and the built frontend
served by nginx. The AI service is not published to the host — the browser never calls it
(PROJECT.md §17), so its only route in is the API over the compose network.

```bash
# 1. SSH into your Hetzner VPS
ssh root@your-server-ip

# 2. Clone the three repositories side by side. The project repo holds this file and the compose file
#    at its root; the two application repos sit inside it and are what the images build from.
git clone git@github.com:asifgondal786/FitPulseAI-Project.git fitpulse
git clone git@github.com:asifgondal786/FitPulseAI-Backend.git fitpulse/Backend
git clone git@github.com:asifgondal786/FitPulseAI.git fitpulse/Frontend

cd fitpulse

# 3. Fill in real values — compose reads this file for the substitutions in docker-compose.yml
cp Backend/.env.example .env
nano .env   # POSTGRES_PASSWORD, ALLOWED_ORIGINS, and any provider keys

# 4. Build and start the whole stack
docker compose up -d --build

# 5. Verify
curl http://localhost:4000/health           # the API
curl http://localhost:4000/health/database  # the API's view of Postgres
curl -I http://localhost:8080/              # the frontend
```

Only 4000 and 8080 need to reach the internet, and only 8080 belongs behind a TLS terminator.
Postgres and the AI service stay on the compose network.

The backend can also come up on its own, without the frontend:

```bash
cd Backend
cp .env.example .env
docker compose up -d --build
```

Two things worth knowing before this is deployed for real:

- **`VITE_API_BASE_URL` is a build argument, not an environment variable.** Vite inlines it into the
  bundle at build time, so pointing the frontend somewhere else means `docker compose build frontend`,
  not a restart. Left empty, the bundle is built with no API URL and refuses every request rather than
  quietly defaulting to localhost.
- **`ALLOWED_ORIGINS` must contain the origin the browser actually loads the frontend from.** Getting
  this wrong is the CORS refusal PROJECT.md §23 records, and the symptom is a sign-in that never
  arrives rather than an error anyone can read.

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
