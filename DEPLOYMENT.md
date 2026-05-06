# Deployment Guide

This project is a Next.js app backed by MongoDB. The recommended deployment is Vercel for the app and MongoDB Atlas for the database.

## Required Environment Variables

Set these in both platforms:

- `MONGODB_URI`: your MongoDB Atlas connection string
- `MONGODB_DB`: database name, for example `nf_system`

You can use [`.env.example`](.env.example) as the template.

## MongoDB Atlas

1. Create a cluster in MongoDB Atlas.
2. Create a database user with read/write access.
3. Add your local IP and the deployment platform IPs to Network Access, or allow access from anywhere if you understand the security tradeoff.
4. Copy the connection string and set `MONGODB_URI`.

## Deploying on Vercel

1. Import this repository into Vercel.
2. Set `MONGODB_URI` and `MONGODB_DB` in Project Settings > Environment Variables.
3. Keep the defaults for build and start:
   - Build command: `next build`
   - Output: handled automatically by Next.js
4. Deploy.

Notes:
- No extra runtime file is required for Vercel.
- The app uses the App Router and the built-in Next.js serverless runtime for API routes.

## Deploying on Railway

Railway is optional if you want to host the app outside Vercel. The steps are the same:

1. Create a new Railway project from this repository.
2. Add the same environment variables:
   - `MONGODB_URI`
   - `MONGODB_DB`
3. Use the existing scripts:
   - Build command: `npm run build`
   - Start command: `npm run start`
4. Deploy.

Notes:
- Railway will provide `PORT` automatically.
- `npm run start` already respects the platform port.

## Exact Vercel Deployment Checklist

Follow these steps in order to deploy your app to Vercel with MongoDB Atlas.

### Prerequisites

- [ ] GitHub account (with this repo pushed)
- [ ] Vercel account (free tier works)
- [ ] MongoDB Atlas account (free tier works)

### Step 1: Prepare GitHub Repository

- [ ] Open your terminal and run:
  ```bash
  git add .
  git commit -m "Prepare for deployment"
   git push origin master
  ```
- [ ] Verify the latest code is on GitHub (check github.com/YOUR_USERNAME/nf-system or your repo name)

### Step 2: Create MongoDB Atlas Cluster

1. [ ] Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. [ ] Click **"Create"** (or **"Build a Cluster"**)
3. [ ] Select **"M0 Shared"** tier (free)
4. [ ] Choose region closest to your location
5. [ ] Click **"Create"**
6. [ ] Wait for cluster to deploy (2-5 minutes)
7. [ ] Click **"Database Access"** on the left menu
8. [ ] Click **"Add New Database User"**
9. [ ] Username: `nf_system_user` (or any name)
10. [ ] Password: Generate a secure password and **save it** (you'll need it)
11. [ ] Database User Privileges: Select **"Read and write to any database"**
12. [ ] Click **"Add User"**

### Step 3: Configure Network Access

1. [ ] Click **"Network Access"** on the left menu
2. [ ] Click **"Add IP Address"**
3. [ ] Select **"Allow access from anywhere"** (for simplicity; you can restrict later)
4. [ ] Click **"Confirm"**

### Step 4: Get MongoDB Connection String

1. [ ] Go back to **"Clusters"** (main database view)
2. [ ] Click **"Connect"** on your cluster
3. [ ] Select **"Drivers"**
4. [ ] Choose **"Node.js"** and version **5.x or higher**
5. [ ] Copy the connection string (should look like):
   ```
   mongodb+srv://nf_system_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
6. [ ] **Replace `<password>`** with the database user password you created
7. [ ] **Save this string** — you'll need it for Vercel

### Step 5: Create Vercel Project

1. [ ] Go to [Vercel](https://vercel.com)
2. [ ] Click **"Add New"** → **"Project"**
3. [ ] Click **"Import"** next to your GitHub repository (`nf-system` or your repo name)
4. [ ] Click **"Import"** (Vercel will auto-detect Next.js)
5. [ ] **Project Name**: `nf-system` (or your preferred name)
6. [ ] **Framework Preset**: Verify it says **"Next.js"**
7. [ ] Click **"Continue"**

### Step 6: Set Environment Variables in Vercel

1. [ ] You'll see an **"Environment Variables"** section
2. [ ] Add two variables:

   **Variable 1:**
   - Name: `MONGODB_URI`
   - Value: (paste your connection string from Step 4)
   - Click **"Add"**

   **Variable 2:**
   - Name: `MONGODB_DB`
   - Value: `nf_system`
   - Click **"Add"**

3. [ ] Click **"Deploy"**
4. [ ] Wait for deployment (5-10 minutes)
5. [ ] Look for a **"✓ Production"** badge with a green checkmark

### Step 7: Verify Deployment

1. [ ] Click the **"Visit"** button (or go to the deployment URL shown)
2. [ ] You should see your app homepage
3. [ ] [ ] Test the following:
   - Homepage loads (page displays "Gerenciador de Notas" or equivalent)
   - `/api/notes` endpoint works (open in browser: `https://your-vercel-url/api/notes` → should return `[]` or existing notes as JSON)
   - Try creating a note in the UI and refresh to confirm it persists
   - Check `/relatorio` page loads without errors

### Step 8: Monitor Deployment

- [ ] Go back to Vercel dashboard
- [ ] Check **"Deployments"** tab for any recent errors
- [ ] If deployment failed:
  - [ ] Click the failed deployment
  - [ ] Check **"Logs"** for error messages
  - [ ] Common issues:
    - `MONGODB_URI` not set or typo in password
    - Connection string missing password replacement
    - Network Access in MongoDB Atlas not configured
- [ ] If successful, deployment is complete!

### Troubleshooting

| Issue | Solution |
|-------|----------|
| **"Cannot connect to MongoDB"** | Verify `MONGODB_URI` in Vercel environment is correct and password is replaced |
| **"Network error"** | Check MongoDB Atlas Network Access allows Vercel's IPs (use "Allow from anywhere" temporarily) |
| **API returns empty or 500 error** | Check Vercel logs (`Vercel Dashboard` → `Deployment` → `Logs`) |
| **UI doesn't load** | Verify build succeeded (check Vercel deployment logs) and no TypeScript errors |

### Post-Deploy Checks

After deployment, verify:

1. [ ] `/` loads correctly
2. [ ] `/api/notes` returns JSON array (empty `[]` is fine)
3. [ ] Create a note through the UI and refresh to confirm it persists
4. [ ] `/relatorio` opens without runtime errors
5. [ ] Visit `/lancar` and `/oficinas` pages — they should load
