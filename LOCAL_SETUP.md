# Local Development Setup

This guide explains how to run the daily-art-viewer locally with your local copy of the daily-art repository.

## Prerequisites

- Node.js 16+
- npm or yarn
- Local clone of `rhaberer/daily-art` repository

## Step 1: Clone Both Repositories

```bash
# Clone the viewer
git clone https://github.com/rhaberer/daily-art-viewer.git
cd daily-art-viewer

# Clone the art repo in the parent directory
cd ..
git clone https://github.com/rhaberer/daily-art.git
cd daily-art-viewer
```

Your directory structure should look like:
```
parent-directory/
├── daily-art/              # Art repo (with art/ folder)
│   ├── art/
│   │   ├── 2026-04-23/
│   │   │   ├── 2026-04-23.png
│   │   │   └── 2026-04-23.md
│   │   └── ...
│   └── ...
└── daily-art-viewer/       # Viewer repo (this one)
    ├── src/
    ├── server.js
    ├── package.json
    └── ...
```

## Step 2: Install Dependencies

```bash
cd daily-art-viewer
npm install
```

## Step 3: Configure Environment

Create `.env.local`:

```env
VITE_USE_LOCAL_SERVER=true
VITE_GITHUB_OWNER=rhaberer
VITE_GITHUB_REPO=daily-art
```

**Important:** `VITE_USE_LOCAL_SERVER=true` is the key setting for local mode.

## Step 4: Run the Development Servers

**Option A: Run both servers together (recommended)**
```bash
npm run dev
```

This starts:
- 🖥️ Express API server on `http://localhost:3001`
- 🎨 Vite dev server on `http://localhost:5173`

Both open automatically.

**Option B: Run servers separately**

Terminal 1 - Start API server:
```bash
npm run server
```

Terminal 2 - Start Vite dev server:
```bash
npm run dev:github
```

Then navigate to `http://localhost:5173`

## Step 5: Verify It's Working

You should see:
- ✅ "📂 Fetching from local server at http://localhost:3001/api" in browser console
- ✅ Gallery loads with your local art pieces
- ✅ All features work: timeline, grid, modal, keyboard nav

## Troubleshooting

### "Cannot find module 'express'"
```bash
npm install express
```

### "ECONNREFUSED localhost:3001"
- Make sure the API server is running in another terminal
- Check `npm run server` output for errors

### "No art pieces found"
- Verify your `daily-art/art/` folder exists with date directories
- Check that each date directory has both `.png` and `.md` files
- Look at server logs: `Serving art from: ...`

### Image URLs show as "file:///"
This is normal in local mode. The modal viewer displays the actual image through the API route.

### Want to switch back to GitHub API?
```env
VITE_USE_LOCAL_SERVER=false
VITE_GITHUB_TOKEN=your_token_here
```

Then restart dev server.

## Local Mode Details

When `VITE_USE_LOCAL_SERVER=true`:

1. **Frontend** makes requests to `http://localhost:3001/api/art-pieces`
2. **Express server** (`server.js`) reads from `../daily-art/art/`
3. **Parses metadata** from `.md` files (highlights, prompts)
4. **Serves images** from `/api/image/:date` routes
5. **Returns JSON** with all piece data to the gallery

The Express server:
- Reads file metadata directly from disk
- Parses Markdown to extract sections
- No GitHub API calls needed
- Works completely offline

## For Production / GitHub API Mode

To deploy or use GitHub authentication:

1. Set `VITE_USE_LOCAL_SERVER=false`
2. Add `VITE_GITHUB_TOKEN` with proper permissions
3. Run `npm run dev:github` or deploy to Vercel
4. Gallery fetches from GitHub API instead

See README.md for GitHub API setup instructions.
