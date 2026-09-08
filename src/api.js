const REPO_OWNER = import.meta.env.VITE_GITHUB_OWNER || 'rhaberer';
const REPO_NAME = import.meta.env.VITE_GITHUB_REPO || 'daily-art';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const USE_LOCAL_SERVER = import.meta.env.VITE_USE_LOCAL_SERVER === 'true';

const API_BASE = 'https://api.github.com';
const RAW_BASE = 'https://raw.githubusercontent.com';
const LOCAL_API = 'http://localhost:3001/api';

const headers = GITHUB_TOKEN
  ? { Authorization: `token ${GITHUB_TOKEN}` }
  : {};

export async function fetchArtPieces() {
  try {
    // Use local server if enabled
    if (USE_LOCAL_SERVER) {
      console.log('📂 Fetching from local server at', LOCAL_API);
      const response = await fetch(`${LOCAL_API}/art-pieces`);
      if (!response.ok) {
        throw new Error(`Local server error: ${response.status}`);
      }
      return await response.json();
    }

    // Otherwise use GitHub API
    console.log('🌐 Fetching from GitHub API');
    const response = await fetch(
      `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/art`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const contents = await response.json();
    const dateDirs = contents.filter(item => item.type === 'dir');

    // Fetch metadata for each date
    const pieces = await Promise.all(
      dateDirs.map(dir => fetchPieceMetadata(dir.name))
    );

    // Sort by date descending (newest first)
    return pieces
      .filter(p => p !== null)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error fetching art pieces:', error);
    return [];
  }
}

async function fetchPieceMetadata(dateStr) {
  try {
    const mdPath = `art/${dateStr}/${dateStr}.md`;
    const pngPath = `art/${dateStr}/${dateStr}.png`;

    // Fetch markdown content
    const mdUrl = `${RAW_BASE}/${REPO_OWNER}/${REPO_NAME}/main/${mdPath}`;
    const mdResponse = await fetch(mdUrl);

    if (!mdResponse.ok) return null;

    const mdContent = await mdResponse.text();
    const { highlights, basePrompt, refinedPrompt } = parseMarkdown(mdContent);

    return {
      date: dateStr,
      imageUrl: `${RAW_BASE}/${REPO_OWNER}/${REPO_NAME}/main/${pngPath}`,
      mdUrl,
      highlights,
      basePrompt,
      refinedPrompt,
    };
  } catch (error) {
    console.error(`Error fetching metadata for ${dateStr}:`, error);
    return null;
  }
}

function parseMarkdown(content) {
  const highlights = [];
  const basePromptMatch = content.match(/## Base Prompt[\s\S]*?```text([\s\S]*?)```/);
  const refinedPromptMatch = content.match(/## Refined Pixel Prompt[\s\S]*?```text([\s\S]*?)```/);

  // Extract highlights from ## Highlights section
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
