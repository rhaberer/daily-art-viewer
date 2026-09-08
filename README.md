# Daily Art Gallery

A rich, immersive timeline gallery viewer for the [rhaberer/daily-art](https://github.com/rhaberer/daily-art) pixel art collection. Built with vanilla JavaScript, Tailwind CSS, and Vite.

## Features

- 🎨 **Timeline Sidebar** — Scroll through dates with visual density indicators
- 📱 **Responsive Grid** — Lazy-loaded thumbnail gallery
- 🎬 **Modal Viewer** — Full image, highlights, base prompt, and refined prompt
- ⌨️ **Keyboard Navigation** — Arrow keys to browse, Escape to close
- 🚀 **Vercel Ready** — Deploy to Vercel with zero config
- 💨 **Fast** — Vite dev server, minimal dependencies

## Local Setup

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
git clone https://github.com/rhaberer/daily-art-viewer.git
cd daily-art-viewer
npm install
```

### Configuration

Create `.env.local` in the project root:

```env
VITE_GITHUB_OWNER=rhaberer
VITE_GITHUB_REPO=daily-art
VITE_GITHUB_TOKEN=your_token_here  # Optional, for higher rate limits
```

To generate a GitHub token:
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select `public_repo` scope
4. Copy and paste into `.env.local`

### Development

```bash
npm run dev
```

This opens http://localhost:5173 in your browser with hot reload.

### Build for Production

```bash
npm run build
npm run preview
```

## Deployment to Vercel

### Option 1: Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option 2: GitHub Integration

1. Push to GitHub
2. Go to https://vercel.com/import
3. Select your repository
4. Add environment variables (same as `.env.local`)
5. Deploy

## Usage

### Timeline Sidebar
- **Click a date** to filter pieces by that date
- **Drag/scroll** to navigate through dates
- **Click "Show All"** to clear the filter

### Gallery Grid
- **Click any card** to open the modal viewer
- **Hover** to see preview effects

### Modal Viewer
- **← Previous / Next →** buttons to browse pieces
- **Arrow Keys** (left/right) for keyboard navigation
- **Escape** to close
- **View Source** link to see the raw markdown in GitHub

## Architecture

```
src/
├── main.js              # Entry point
├── style.css            # Tailwind styles + custom CSS
├── gallery.js           # Main gallery logic
├── api.js               # GitHub API fetching
└── components/
    ├── timeline.js      # Timeline sidebar rendering
    ├── grid.js          # Gallery grid rendering
    └── modal.js         # Modal viewer component
```

## File Structure Expected in daily-art Repo

```
art/
├── 2026-04-23/
│   ├── 2026-04-23.png   # 160×80 pixel art
│   └── 2026-04-23.md    # Metadata (highlights, prompts)
├── 2026-04-24/
│   ├── 2026-04-24.png
│   └── 2026-04-24.md
└── ...
```

## API Rate Limiting

Without a GitHub token, you're limited to 60 requests/hour. With a token, you get 5,000 requests/hour.

For 1000+ pieces, a token is recommended.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern evergreen browsers

## License

MIT — See LICENSE in the repository.

## Contributing

Contributions welcome! Please open an issue or PR.
