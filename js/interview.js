/**
 * Smart Campus Placement Preparation Portal
 * Interview Preparation Hub Controller
 * HR, Technical, STAR Project Framework, GD Topics, and Placement Checklist
 */

document.addEventListener('DOMContentLoaded', function() {
  const user = requireAuth(['student', 'admin']);
  if (!user) return;

  initInterviewHub();
});

function initInterviewHub() {
  // Tab Switching
  const tabButtons = document.querySelectorAll('.interview-tab-btn');
  const tabPanes = document.querySelectorAll('.interview-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.style.display = 'none');

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.style.display = 'block';
      }
    });
  });

  // Accordion Expand/Collapse Toggles
  bindAccordionToggles();

  // Search Filter
  const searchInput = document.getElementById('interview-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      filterInterviewCards(query);
    });
  }

  // Interactive Checklist Persistence
  initChecklistPersistence();
}

function bindAccordionToggles() {
  const headers = document.querySelectorAll('.accordion-header');
  headers.forEach(header => {
    header.addEventListener('click', function() {
      const parent = this.closest('.accordion-item');
      if (parent) {
        parent.classList.toggle('open');
      }
    });
  });
}

function filterInterviewCards(query) {
  const items = document.querySelectorAll('.accordion-item');
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    if (!query || text.includes(query)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

function initChecklistPersistence() {
  const checkboxes = document.querySelectorAll('.interview-chk');
  const STORAGE_KEY = 'scpp_interview_checklist';

  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {}

  checkboxes.forEach((chk, idx) => {
    if (saved[idx]) {
      chk.checked = true;
    }

    chk.addEventListener('change', () => {
      saved[idx] = chk.checked;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      updateChecklistCounter();
    });
  });

  updateChecklistCounter();
}

function updateChecklistCounter() {
  const checkboxes = document.querySelectorAll('.interview-chk');
  const countSpan = document.getElementById('checklist-completed-count');
  if (!countSpan || checkboxes.length === 0) return;

  let completed = 0;
  checkboxes.forEach(c => {
    if (c.checked) completed++;
  });

  countSpan.textContent = `${completed} / ${checkboxes.length} Tasks Ready`;
}
