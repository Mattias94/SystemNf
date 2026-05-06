# Deployment Guide

This project is designed to run on Vercel with MongoDB Atlas as the database.

## Environment Variables

Use the same variables locally and in Vercel:

- `MONGODB_URI`: MongoDB Atlas connection string
- `MONGODB_DB`: database name, usually `nf_system`

Use [`.env.example`](.env.example) as the local template.

## 1. Create MongoDB Atlas

1. Create an Atlas project and a free cluster.
2. Create a database user with read and write access.
3. In Network Access, allow your IP during local development.
4. For a first deployment, you can temporarily allow access from anywhere while you validate the app, then tighten access later if you want.
5. Copy the connection string from Connect > Drivers > Node.js and replace the password.

Your connection string should look like this:

```text
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

## 2. Prepare the Repository

1. Make sure the latest code is pushed to GitHub.
2. If you want to test locally first, create `.env.local` from `.env.example` and fill in the Atlas values.
3. Run `npm run build` locally before deploying if you want a quick sanity check.

## 3. Deploy on Vercel

1. Import the GitHub repository into Vercel.
2. Confirm Vercel detects Next.js automatically.
3. Add these environment variables in Project Settings > Environment Variables:
   - `MONGODB_URI`
   - `MONGODB_DB`
4. Keep the default build command:
   - `npm run build`
5. Deploy the project.

## 4. Verify

After deployment, check these URLs:

- `/` should load the app homepage.
- `/api/notes` should return JSON.
- `/lancar`, `/oficinas`, and `/relatorio` should open without runtime errors.

If something fails, check the Vercel deployment logs first. The most common causes are a missing `MONGODB_URI`, an Atlas password typo, or Atlas Network Access not allowing the request.
