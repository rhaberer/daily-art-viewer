import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Enable CORS for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Path to local daily-art repo (adjust if needed)
const ART_DIR = path.resolve('../daily-art/art');

console.log(`Serving art from: ${ART_DIR}`);

app.get('/api/art-pieces', async (req, res) => {
  try {
    const entries = await fs.readdir(ART_DIR, { withFileTypes: true });
    const dateDirs = entries.filter(e => e.isDirectory());

    const pieces = await Promise.all(
      dateDirs.map(async dir => {
        const dateStr = dir.name;
        const baseName = dateStr.replace(/\s+\(\d+\)$/, ''); // Remove " (1)", " (2)" etc.
        
        const mdPath = path.join(ART_DIR, dateStr, `${baseName}.md`);
        const pngPath = path.join(ART_DIR, dateStr, `${baseName}.png`);

        try {
          const mdContent = await fs.readFile(mdPath, 'utf-8');
          
          // Check if PNG exists
          try {
            await fs.access(pngPath);
          } catch {
            return null; // PNG doesn't exist
          }

          const { highlights, basePrompt, refinedPrompt } = parseMarkdown(mdContent);

          return {
            date: baseName, // Use clean date without suffix
            imageUrl: `/api/image/${baseName}?dir=${encodeURIComponent(dateStr)}`,
            mdUrl: `file://${mdPath}`,
            highlights,
            basePrompt,
            refinedPrompt,
          };
        } catch (err) {
          // Silently skip directories with issues
          return null;
        }
      })
    );

    const sorted = pieces
      .filter(p => p !== null)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log(`✅ Found ${sorted.length} art pieces`);
    res.json(sorted);
  } catch (error) {
    console.error('Error reading art directory:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/image/:dateStr', async (req, res) => {
  try {
    const { dateStr } = req.params;
    const dirName = req.query.dir || dateStr; // Use actual dir name if provided
    const imagePath = path.join(ART_DIR, dirName, `${dateStr}.png`);
    const imageData = await fs.readFile(imagePath);
    res.set('Content-Type', 'image/png');
    res.send(imageData);
  } catch (error) {
    console.error(`Error serving image for ${req.params.dateStr}:`, error.message);
    res.status(404).json({ error: 'Image not found' });
  }
});

function parseMarkdown(content) {
  const highlights = [];
  const basePromptMatch = content.match(/## Base Prompt[\s\S]*?```text([\s\S]*?)```/);
  const refinedPromptMatch = content.match(/## Refined Pixel Prompt[\s\S]*?```text([\s\S]*?)```/);

  const highlightsSection = content.match(/## Highlights([\s\S]*?)(?=##|$)/);
  if (highlightsSection) {
    const lines = highlightsSection[1].split('\n');
    lines.forEach(line => {
      if (line.trim().startsWith('*')) {
        highlights.push(line.replace(/^\*\s*/, '').trim());
      }
    });
  }

  return {
    highlights,
    basePrompt: basePromptMatch ? basePromptMatch[1].trim() : '',
    refinedPrompt: refinedPromptMatch ? refinedPromptMatch[1].trim() : '',
  };
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n✨ Art API server running on http://localhost:${PORT}`);
  console.log(`📂 Reading from: ${ART_DIR}\n`);
});
