import { fetchArtPieces } from './api.js';
import { renderTimeline } from './components/timeline.js';
import { renderGrid } from './components/grid.js';
import { Modal } from './components/modal.js';

let allPieces = [];
let filteredPieces = [];
let currentModalPiece = null;
let modal = null;

export async function initGallery() {
  const app = document.getElementById('app');
  const loading = document.getElementById('loading');

  try {
    // Fetch art pieces from GitHub
    allPieces = await fetchArtPieces();
    filteredPieces = [...allPieces];

    if (allPieces.length === 0) {
      loading.innerHTML = `
        <div class="text-center">
          <p class="text-gray-400">No art pieces found. Make sure the rhaberer/daily-art repo has art/ folder.</p>
          <p class="text-xs text-gray-500 mt-2">Configure VITE_GITHUB_REPO and VITE_GITHUB_TOKEN in .env.local</p>
        </div>
      `;
      return;
    }

    // Build UI
    app.innerHTML = `
      <aside class="timeline-sidebar" id="timeline"></aside>
      <main class="flex-1 flex flex-col">
        <div class="bg-slate-900 border-b border-slate-800 px-6 py-4">
          <h1 class="text-2xl font-bold">Daily Art Gallery</h1>
          <p class="text-xs text-gray-400 mt-1">160×80 pixel art • ${allPieces.length} pieces</p>
        </div>
        <div class="gallery-grid" id="gallery"></div>
      </main>
    `;

    // Initialize modal
    modal = new Modal(onPieceSelected);

    // Render components
    renderTimeline('timeline', allPieces, onDateSelected);
    renderGrid('gallery', filteredPieces, openModal);

    // Keyboard navigation
    setupKeyboardNav();
  } catch (error) {
    console.error('Failed to load gallery:', error);
    loading.innerHTML = `
      <div class="text-center">
        <p class="text-red-400">Failed to load gallery</p>
        <p class="text-xs text-gray-500 mt-2">${error.message}</p>
      </div>
    `;
  }
}

function onDateSelected(date) {
  if (date) {
    filteredPieces = allPieces.filter(p => p.date === date);
  } else {
    filteredPieces = [...allPieces];
  }
  renderGrid('gallery', filteredPieces, openModal);
}

function openModal(piece) {
  currentModalPiece = piece;
  modal.open(piece);
}

function onPieceSelected(piece) {
  currentModalPiece = piece;
  modal.open(piece);
}

function setupKeyboardNav() {
  document.addEventListener('keydown', (e) => {
    if (!modal.isOpen || !currentModalPiece) return;

    const currentIndex = filteredPieces.findIndex(p => p.date === currentModalPiece.date);

    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      openModal(filteredPieces[currentIndex - 1]);
    } else if (e.key === 'ArrowRight' && currentIndex < filteredPieces.length - 1) {
      openModal(filteredPieces[currentIndex + 1]);
    } else if (e.key === 'Escape') {
      modal.close();
    }
  });
}
