export class Modal {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.isOpen = false;
    this.currentPiece = null;
    this.setupModal();
  }

  setupModal() {
    const modalHTML = `
      <div id="modal-overlay" class="modal-overlay hidden" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="modal-title" class="text-xl font-bold"></h2>
            <span class="modal-close" id="modal-close">&times;</span>
          </div>
          <div class="modal-body">
            <div class="modal-image">
              <img id="modal-img" src="" alt="" />
            </div>

            <div class="modal-section">
              <div class="modal-section-title">Highlights</div>
              <div class="modal-section-content" id="modal-highlights">
                <p class="text-gray-500">Loading...</p>
              </div>
            </div>

            <div class="modal-section">
              <div class="modal-section-title">Base Prompt</div>
              <div class="modal-section-content" id="modal-base-prompt">
                <p class="text-gray-500">Loading...</p>
              </div>
            </div>

            <div class="modal-section">
              <div class="modal-section-title">Refined Pixel Prompt</div>
              <div class="modal-section-content" id="modal-refined-prompt">
                <p class="text-gray-500">Loading...</p>
              </div>
            </div>

            <div class="modal-nav">
              <button id="modal-prev" class="bg-slate-700 hover:bg-slate-600">← Previous</button>
              <button id="modal-next" class="bg-slate-700 hover:bg-slate-600">Next →</button>
              <a id="modal-source-link" href="" target="_blank" class="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors text-center">View Source</a>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    this.overlay = document.getElementById('modal-overlay');
    this.closeBtn = document.getElementById('modal-close');
    this.prevBtn = document.getElementById('modal-prev');
    this.nextBtn = document.getElementById('modal-next');

    this.closeBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', e => {
      if (e.target === this.overlay) this.close();
    });
  }

  open(piece) {
    this.currentPiece = piece;
    this.isOpen = true;

    document.getElementById('modal-title').textContent = piece.date;
    document.getElementById('modal-img').src = piece.imageUrl;
    document.getElementById('modal-img').alt = piece.date;

    // Highlights
    const highlightsHtml = piece.highlights
      .map(h => `<p class="mb-2">• ${h}</p>`)
      .join('');
    document.getElementById('modal-highlights').innerHTML = highlightsHtml || '<p class="text-gray-500">No highlights</p>';

    // Prompts
    document.getElementById('modal-base-prompt').innerHTML = piece.basePrompt
      ? `<pre>${piece.basePrompt}</pre>`
      : '<p class="text-gray-500">No base prompt</p>';
    document.getElementById('modal-refined-prompt').innerHTML = piece.refinedPrompt
      ? `<pre>${piece.refinedPrompt}</pre>`
      : '<p class="text-gray-500">No refined prompt</p>';

    // Source link
    const sourceLink = document.getElementById('modal-source-link');
    sourceLink.href = piece.mdUrl;

    // Navigation
    this.prevBtn.onclick = () => this.onNavigate(-1);
    this.nextBtn.onclick = () => this.onNavigate(1);

    this.overlay.style.display = 'flex';
  }

  close() {
    this.isOpen = false;
    this.currentPiece = null;
    this.overlay.style.display = 'none';
  }
}
