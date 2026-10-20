# PLACENTRA — Production Deployment & Hosting Guide

This guide provides end-to-end instructions for deploying the **PLACENTRA** platform across **Supabase**, **Resend**, **Render**, and **Vercel**.

---

## 1. Target Hosting Architecture

```mermaid
graph TD
    Client[Browser / User] -->|HTTPS| Vercel[Vercel: React + Vite Frontend]
    Client -->|HTTPS REST API| Render[Render: Django REST API + WhiteNoise + Gunicorn]
    Vercel -->|CORS API Requests| Render
    Render -->|PostgreSQL TLS / Session Pooler| SupabaseDB[(Supabase PostgreSQL)]
    Render -->|HTTPS API| Resend[Resend Email Service]
    Render -->|S3 Protocol| SupabaseStorage[(Supabase Object Storage)]
```

- **Frontend:** Vercel (React 19 + Vite SPA, rewritten via `vercel.json`)
- **Backend API:** Render (Python 3.12 + Django REST Framework + Gunicorn + WhiteNoise)
- **Database:** Supabase PostgreSQL (connected via Session Pooler with SSL)
- **Transactional Emails:** Resend API (via `django-anymail[resend]`)
- **Durable Storage:** Supabase Storage (S3-compatible via `django-storages[boto3]`)
- **Authentication:** DRF SimpleJWT (Bearer tokens in `localStorage`)

---

## 2. Prerequisites & Accounts Required

Sign up for the following free-tier or paid accounts before deployment:

1. **GitHub:** [https://github.com](https://github.com) (Host for the repository)
2. **Supabase:** [https://supabase.com](https://supabase.com) (PostgreSQL Database & Storage)
3. **Resend:** [https://resend.com](https://resend.com) (Transactional Email Delivery)
4. **Render:** [https://render.com](https://render.com) (Backend Web Service)
5. **Vercel:** [https://vercel.com](https://vercel.com) (Frontend Static & SPA Hosting)

---

## 3. Step-by-Step Deployment Instructions

### Step 1: Set Up Supabase (Database & Storage)

1. **Create a Supabase Project:**
   - Log in to [Supabase Dashboard](https://supabase.com/dashboard) and click **New project**.
   - Set **Name**: `placentra-prod`.
   - Set a strong **Database Password** (store this in a secure password manager).
   - Select the **Region** closest to your target users (e.g., `South Asia (Mumbai)` or `East US`).
   - Click **Create new project** and wait ~2 minutes for provisioning.

2. **Retrieve the Database Connection String (Session Pooler):**
   > [!IMPORTANT]
   > Render web services run on IPv4 infrastructure. Supabase direct connections use IPv6. You **must** use the **Supabase Session Pooler** connection string to connect Render to Supabase without requiring an IPv4 add-on.
   - Go to **Project Settings** (gear icon) → **Database**.
   - Scroll to **Connection string**.
   - Select the **URI** tab.
   - Select **Mode: Session** (port `5432` or `6543`).
   - Copy the URI. It will look like:
     ```text
     postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require
     ```
   - Replace `[YOUR-PASSWORD]` with the database password set during project creation.

3. **Enable `pgvector` Extension (Optional / Future AI Features):**
   - In Supabase Dashboard, go to **Database** → **Extensions**.
   - Search for `vector`.
   - Toggle to **Enable**. (The current PLACENTRA schema does not require `vector` for initial launch, but enabling it prepares the database for upcoming AI candidate-job matching).

4. **Configure Supabase Object Storage (For Resumes & Photos):**
   - In Supabase Dashboard, go to **Storage** → **New bucket**.
   - Bucket name: `placentra-media`.
   - Leave **Public bucket** **OFF / Disabled** (this ensures resumes, degree certificates, and marksheets remain private and protected).
   - Click **Save bucket**.
   - To obtain S3 credentials for Django:
     - Go to **Project Settings** → **Storage** → **S3 Access Keys**.
     - Click **Generate new credentials**.
     - Save the **Access Key ID** and **Secret Access Key**.
     - The S3 endpoint URL is: `https://[YOUR-PROJECT-REF].supabase.co/storage/v1/s3`
     - Region: `us-east-1` (or your Supabase project region).

---

---

### Step 2: Set Up Outgoing Email Delivery Transport

PLACENTRA supports two transactional email delivery transports: **Gmail API** (recommended for your direct `@gmail.com` mailbox) and **Resend API** (optional fallback).

#### Option A: Gmail API via OAuth 2.0 (Recommended for `placentraeducation@gmail.com`)

The Gmail API allows PLACENTRA to send emails over HTTPS directly from `placentraeducation@gmail.com` using the sender name `PLACENTRA Education <placentraeducation@gmail.com>`, preserving all OTPs, shortlist notices, interview schedules, and offer letters with PDF attachments.

##### 1. Google Cloud Console Setup
1. Log in to [Google Cloud Console](https://console.cloud.google.com) with your `placentraeducation@gmail.com` account.
2. Create a new project (e.g., `PLACENTRA-Email-Service`).
3. Enable the Gmail API:
   - Go to **APIs & Services** → **Library**.
   - Search for `Gmail API` and click **Enable**.
4. Configure the OAuth Consent Screen:
   - Go to **APIs & Services** → **OAuth consent screen**.
   - Select **User Type**: **External** (or **Internal** if using Google Workspace).
   - App Name: `PLACENTRA`.
   - User Support Email: `placentraeducation@gmail.com`.
   - Developer Contact Email: `placentraeducation@gmail.com`.
   - Click **Save and Continue**.
   - In **Scopes**, click **Add or Remove Scopes**, and add the narrow sending scope:
     ```text
     https://www.googleapis.com/auth/gmail.send
     ```
   - In **Test Users**, click **Add Users** and add:
     ```text
     placentraeducation@gmail.com
     ```
   - Click **Save and Continue**.
5. Create OAuth 2.0 Client Credentials:
   - Go to **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**.
   - Application Type: **Desktop app** (Important: Desktop app allows local terminal authorization without pre-registering dynamic redirect URIs).
   - Name: `PLACENTRA Desktop Auth`.
   - Click **Create**.
   - Download the JSON credential file and save it locally as `client_secret.json` in your repository root (this file is excluded by `.gitignore`).

##### 2. Generate the OAuth 2.0 Refresh Token Locally
Run the helper script on your local machine (where a web browser is available):
```bash
python scripts/get_gmail_oauth_token.py
```
1. A browser window will open asking you to sign in with `placentraeducation@gmail.com`.
2. Review the permissions (`Send email on your behalf`) and click **Continue / Allow**.
3. The script will securely capture the refresh token and save the environment variables to `backend/.env.gmail` (protected by `.gitignore`).
4. Sensitive values are masked in the terminal output to prevent accidental exposure.

##### 3. Gmail API & OAuth Limitations to Keep in Mind
> [!IMPORTANT]
> **7-Day Refresh Token Expiration in Testing Status:**
> When a Google Cloud project's OAuth Consent Screen is in **Testing** status with User Type **External**, Google enforces a security limit: **refresh tokens expire after 7 days (168 hours)**.
>
> **How to achieve durable production operation:**
> - **Google Workspace Accounts:** Set User Type to **Internal**. Refresh tokens for internal users never expire.
> - **Standard `@gmail.com` Accounts:** On the OAuth Consent Screen, click **Publish App** to switch from "Testing" to **"In production"**.
>   - Because `https://www.googleapis.com/auth/gmail.send` is classified by Google as a **Sensitive Scope**, Google will prompt for app verification (requiring a privacy policy link and an explanation of the app).
>   - However, for personal and small-scale deployments sending under the 100-user cap, publishing the app eliminates the 7-day refresh token expiration.
>
> **Sending Quotas:**
> - Free personal Gmail accounts (`@gmail.com`): **500 emails per 24 hours**.
> - Google Workspace accounts: **2,000 emails per 24 hours**.

---

#### Option B: Resend API via django-anymail (Optional Fallback)

If you prefer to keep Resend as a fallback:
1. Log in to [Resend Dashboard](https://resend.com/overview).
2. Create an API Key (`re_...`).
3. For custom domain sending, verify your domain DNS records.
4. If `USE_GMAIL_API=False` and `RESEND_API_KEY` is present, PLACENTRA routes outgoing emails through Resend automatically.


---

### Step 3: Deploy Backend on Render

1. **Push Changes to GitHub:**
   - After approving the local changes, commit and push to your GitHub repository `main` branch.

2. **Create Web Service on Render:**
   - Log in to [Render Dashboard](https://dashboard.render.com).
   - Click **New +** → **Web Service**.
   - Connect your GitHub repository: `abhinand-kk/PLACENTRA-An-automated-placement-platform`.
   - Select **Branch**: `main`.
   - Configure the following settings:
     - **Name**: `placentra-backend`
     - **Root Directory**: `backend`
     - **Runtime**: `Python`
     - **Build Command**: `bash build.sh`
     - **Start Command**: `gunicorn placentra.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 120`
     - **Plan**: `Free`
     - **Health Check Path**: `/health/`

3. **Configure Render Environment Variables:**
   Under the **Environment** tab, add the following variables:

   | Variable Name | Value / Source |
   | :--- | :--- |
   | `PYTHON_VERSION` | `3.12.10` |
   | `DEBUG` | `False` |
   | `SECRET_KEY` | *Generate a 50+ character random string (Render can generate this)* |
   | `DATABASE_URL` | *Your Supabase Session Pooler URI with `?sslmode=require`* |
   | `ALLOWED_HOSTS` | `localhost,127.0.0.1,placentra-backend.onrender.com` |
   | `CORS_ALLOWED_ORIGINS` | `https://your-frontend-app.vercel.app` *(update after Step 4)* |
   | `CSRF_TRUSTED_ORIGINS` | `https://your-frontend-app.vercel.app,https://placentra-backend.onrender.com` |
   | **Outgoing Email (Gmail API)** | *(Set these to enable sending via placentraeducation@gmail.com)* |
   | `USE_GMAIL_API` | `True` |
   | `EMAIL_BACKEND_TYPE` | `gmail_api` |
   | `GMAIL_CLIENT_ID` | *OAuth 2.0 Client ID from Google Cloud Console* |
   | `GMAIL_CLIENT_SECRET` | *OAuth 2.0 Client Secret from Google Cloud Console* |
   | `GMAIL_REFRESH_TOKEN` | *Refresh token generated via `scripts/get_gmail_oauth_token.py`* |
   | `GMAIL_SENDER_EMAIL` | `placentraeducation@gmail.com` |
   | `DEFAULT_FROM_EMAIL` | `PLACENTRA Education <placentraeducation@gmail.com>` |
   | **Outgoing Email (Resend Fallback)** | *(Leave configured as fallback if desired)* |
   | `RESEND_API_KEY` | *Your Resend API key (`re_...`)* |
   | **Object Storage (Supabase S3)** | |
   | `USE_S3_STORAGE` | `True` *(set `False` if delaying storage setup)* |
   | `AWS_ACCESS_KEY_ID` | *Supabase S3 Access Key ID* |
   | `AWS_SECRET_ACCESS_KEY` | *Supabase S3 Secret Access Key* |
   | `AWS_STORAGE_BUCKET_NAME` | `placentra-media` |
   | `AWS_S3_ENDPOINT_URL` | `https://[PROJECT-REF].supabase.co/storage/v1/s3` |
   | `AWS_S3_REGION_NAME` | `us-east-1` |


4. **Deploy and Run Initial Migrations:**
   - Click **Create Web Service**.
   - Render will build the container, install dependencies, and run `collectstatic`.
   - Once the service is live, open the **Shell** tab in the Render dashboard and run the one-time database migration:
     ```bash
     python manage.py migrate --no-input
     ```
   - Create a superuser for Django Admin:
     ```bash
     python manage.py createsuperuser
     ```

5. **Verify Backend Health:**
   - Open in your browser: `https://placentra-backend.onrender.com/health/`
   - You should see:
     ```json
     {"status": "healthy", "database": "healthy", "service": "placentra-api"}
     ```

---

### Step 4: Deploy Frontend on Vercel

1. **Import Project to Vercel:**
   - Log in to [Vercel Dashboard](https://vercel.com/dashboard).
   - Click **Add New...** → **Project**.
   - Select your GitHub repository: `abhinand-kk/PLACENTRA-An-automated-placement-platform`.
   - Configure the project settings:
     - **Framework Preset**: `Vite`
     - **Root Directory**: `./` (leave blank or select root)
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

2. **Configure Frontend Environment Variable:**
   Under **Environment Variables**, add:

   | Variable Name | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://placentra-backend.onrender.com` *(no trailing slash)* |

   > [!NOTE]
   > Do **not** add any private keys, database credentials, or secret tokens here. Only `VITE_API_BASE_URL` is needed.

3. **Deploy:**
   - Click **Deploy**.
   - Vercel will build the React SPA in ~45 seconds and assign a production URL (e.g., `https://placentra-portal.vercel.app`).

4. **Sync CORS on Render:**
   - Copy the deployed Vercel URL.
   - Go back to Render Dashboard → `placentra-backend` → **Environment**.
   - Update `CORS_ALLOWED_ORIGINS` to include your exact Vercel URL:
     ```text
     https://placentra-portal.vercel.app
     ```
   - Update `CSRF_TRUSTED_ORIGINS`:
     ```text
     https://placentra-portal.vercel.app,https://placentra-backend.onrender.com
     ```
   - Render will automatically trigger a zero-downtime redeploy with the new origins.

---

## 4. Verification & Smoke Test Checklist

Once both services are deployed, test the following key flows:

- [ ] **Liveness Probe:** Visit `https://placentra-backend.onrender.com/health/` → Returns HTTP 200 with `"database": "healthy"`.
- [ ] **API Documentation:** Visit `https://placentra-backend.onrender.com/api/docs/` → Swagger UI loads and renders schemas.
- [ ] **Frontend Load:** Visit your Vercel URL → Landing page loads cleanly with styles, logos, and fonts.
- [ ] **Client Routing:** Navigate to `/login`, `/register`, or `/student/dashboard` and press Refresh (F5) → Verify no 404 error occurs (ensured by `vercel.json` SPA rewrite).
- [ ] **Authentication:** Register a new test student or log in with existing credentials → Verify JWT tokens (`access_token`, `refresh_token`) are saved in `localStorage`.
- [ ] **Student Dashboard:** Navigate through Profile, Academics, Experience, Documents, and Placement Drives → Confirm data loads without console CORS errors.
- [ ] **Dynamic PDF Generation:** Navigate to Student Resume → Click "Download PDF" → Confirm PDF generates and downloads cleanly via ReportLab.
- [ ] **Recruiter Workflow & Offer Email:** In Recruiter Dashboard, select a test candidate → Confirm status changes to `Selected` and an email is dispatched via Resend.

---

## 5. Troubleshooting & Common Fixes

### 1. CORS Errors (`Access-Control-Allow-Origin` Missing)
- **Symptom:** Browser console shows `CORS policy: No 'Access-Control-Allow-Origin' header is present`.
- **Cause:** The Vercel URL in `CORS_ALLOWED_ORIGINS` has a trailing slash or does not match the exact domain.
- **Fix:** In Render environment variables, ensure `CORS_ALLOWED_ORIGINS` has no trailing slash (e.g., `https://placentra-portal.vercel.app`).

### 2. Database Connection Error (`psycopg2.OperationalError`)
- **Symptom:** Render backend returns 503 or logs timeout connecting to database.
- **Cause:** Render web service attempted to connect to Supabase IPv6 direct endpoint.
- **Fix:** Verify `DATABASE_URL` is using the **Session Pooler** host (`aws-0-[region].pooler.supabase.com`) on port `5432` or `6543`, with `?sslmode=require`.

### 3. Migration Errors During Deploy
- **Symptom:** `django.db.utils.OperationalError: ... already exists`.
- **Cause:** Running migrations automatically on every startup can collide with pooled connections.
- **Fix:** Keep migrations out of the start command. Run `python manage.py migrate --no-input` explicitly in the Render Shell.

### 4. Emails Not Arriving via Resend
- **Symptom:** Status updates succeed, but no email is received.
- **Cause:** Using `onboarding@resend.dev` to email an unverified student email address.
- **Fix:** On Resend's free tier without a custom domain, emails can only be sent to the email address of the Resend account owner. For public delivery, add and verify your custom sending domain in Resend.

---

## 6. Hosting Plan & Free-Tier Gotchas

1. **Render Free Tier Spin-Down:**
   - Render free web services automatically spin down after 15 minutes of inactivity.
   - The first request after sleep will take ~45–60 seconds while the container boots up. Subsequent requests respond instantly.
   - For continuous 24/7 uptime without sleep, upgrade the web service to the Starter plan ($7/mo) or configure a free external uptime monitor (e.g., UptimeRobot) to ping `/health/` every 10 minutes.

2. **Supabase Inactivity Auto-Pause:**
   - Free-tier Supabase projects pause after 7 days of inactivity.
   - Visiting your application or pinging the database keeps it active.

3. **Vercel Bandwidth & Functions:**
   - Free Hobby accounts provide 100 GB/month bandwidth, which is more than sufficient for PLACENTRA's frontend SPA assets.

---

## 7. Data Privacy & Production Boundary Reminder

- Do **not** transfer local student records, contact numbers, or real documents to the hosted Supabase database without explicit institution authorization.
- Initial public testing should be performed using sanitized test accounts.
- Private student documents (resumes, marksheets) remain in private Supabase Storage buckets accessible only through authenticated API sessions.
