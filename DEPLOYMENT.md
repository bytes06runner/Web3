# Deployment Guide - Yield Raiders

This project is configured for deployment on **Vercel** as a full-stack application (React Frontend + Serverless Node.js Backend).

## Prerequisites
- A [Vercel](https://vercel.com) account.
- A [MongoDB Atlas](https://www.mongodb.com/atlas) database (Free Tier is fine).
- A [Google Gemini API Key](https://ai.google.dev/) (for AI Puzzles).

## 1. Project Structure
- `frontend/`: React + Vite application.
- `api/`: Serverless functions (Node.js).
- `vercel.json`: Routing configuration.

## 2. Environment Variables
You must set the following Environment Variables in your Vercel Project Settings:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | Connection string for MongoDB (e.g., `mongodb+srv://...`) |
| `GEMINI_API_KEY` | API Key from Google AI Studio |

## 3. Vercel Configuration
When importing the project into Vercel:

1. **Root Directory**: Select `ProjectMain` (or if it's the repo root, leave as `./ProjectMain` if that's how you monorepo it, but typically `./`).
   *Note: If your repo *is* ProjectMain, then root is `./`.*
2. **Framework Preset**: Vercel might detect Vite, but since we have a custom structure:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install` (Installs root dependencies including backend libs like `mongoose`)

## 4. Deploy
1. Push your code to GitHub/GitLab.
2. Import repository in Vercel.
3. Configure the Build settings as above.
4. Add Environment Variables.
5. Deploy!

## Troubleshooting
- **404 on API**: Ensure `vercel.json` exists in the root and properly rewrites `/api/*`.
- **Database Connection Fail**: Check `MONGODB_URI` in Vercel logs. Ensure IP Access List in Atlas allows `0.0.0.0/0` (Allow from Anywhere) since Vercel IPs change.
