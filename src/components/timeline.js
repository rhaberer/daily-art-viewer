export function renderTimeline(containerId, pieces, onDateSelect) {
  const container = document.getElementById(containerId);
  const dates = [...new Set(pieces.map(p => p.date))].sort().reverse();

  container.innerHTML = `
    <div class="p-3">
      <h2 class="text-xs font-bold text-gray-300 uppercase tracking-wider mb-4">Timeline</h2>
      <div id="timeline-list" class="space-y-1"></div>
      <button id="clear-filter" class="w-full mt-4 text-xs py-2 px-2 bg-slate-800 hover:bg-slate-700 rounded transition-colors">Show All</button>
    </div>
  `;

  const list = document.getElementById('timeline-list');
  const clearBtn = document.getElementById('clear-filter');

  dates.forEach(date => {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.innerHTML = `
      <div class="font-semibold text-sm">${date}</div>
    `;

    item.addEventListener('click', () => {
      document.querySelectorAll('.timeline-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      onDateSelect(date);
    });

    list.appendChild(item);
  });

  clearBtn.addEventListener('click', () => {
    document.querySelectorAll('.timeline-item').forEach(el => el.classList.remove('active'));
    onDateSelect(null);
  });
}
