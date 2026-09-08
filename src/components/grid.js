export function renderGrid(containerId, pieces, onCardClick) {
  const container = document.getElementById(containerId);

  if (pieces.length === 0) {
    container.innerHTML = `
      <div class="empty-state col-span-full">
        <p>No pieces found for this date</p>
      </div>
    `;
    return;
  }

  container.innerHTML = pieces
    .map(
      piece => `
      <div class="gallery-card" data-date="${piece.date}">
        <div class="gallery-card-image-wrapper">
          <img 
            src="${piece.imageUrl}" 
            alt="${piece.date}" 
            loading="lazy"
            onerror="console.error('Image failed to load:', this.src)"
            onload="console.log('Image loaded:', this.src)"
          />
        </div>
        <div class="gallery-card-meta">
          <div class="gallery-card-date">${piece.date}</div>
          <div class="text-gray-500 text-xs">Click to expand</div>
        </div>
      </div>
    `
    )
    .join('');

  // Log all image URLs for debugging
  console.log('Image URLs:', pieces.map(p => p.imageUrl));

  container.querySelectorAll('.gallery-card').forEach(card => {
    card.addEventListener('click', () => {
      const date = card.dataset.date;
      const piece = pieces.find(p => p.date === date);
      if (piece) onCardClick(piece);
    });
  });
}
