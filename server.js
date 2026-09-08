import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

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
        const mdPath = path.join(ART_DIR, dateStr, `${dateStr}.md`);
        const pngPath = path.join(ART_DIR, dateStr, `${dateStr}.png`);

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
            date: dateStr,
            imageUrl: `/api/image/${dateStr}`,
            mdUrl: `file://${mdPath}`,
            highlights,
            basePrompt,
            refinedPrompt,
          };
        } catch (err) {
          console.error(`Error processing ${dateStr}:`, err.message);
          return null;
        }
      })
    );

    const sorted = pieces
      .filter(p => p !== null)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(sorted);
  } catch (error) {
    console.error('Error reading art directory:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/image/:dateStr', async (req, res) => {
  try {
    const { dateStr } = req.params;
    const imagePath = path.join(ART_DIR, dateStr, `${dateStr}.png`);
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
