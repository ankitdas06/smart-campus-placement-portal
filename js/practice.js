/**
 * Smart Campus Placement Preparation Portal
 * Practice Arena Controller - Interactive Learning & Explanations
 */

let allQuestions = [];
let filteredQuestions = [];
let currentCategory = 'all';
let currentTopic = 'all';
let practiceStats = {
  attempted: 0,
  correct: 0,
  wrong: 0
};

document.addEventListener('DOMContentLoaded', function() {
  const user = requireAuth(['student', 'admin']);
  if (!user) return;

  initPracticeArena();
});

function initPracticeArena() {
  allQuestions = DB.getAllQuestions();

  // Parse URL query parameter: ?cat=aptitude
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('cat');
  if (catParam) {
    currentCategory = catParam.toLowerCase();
  }

  // Setup Category Navigation Buttons
  const catButtons = document.querySelectorAll('.category-filter-btn');
  catButtons.forEach(btn => {
    const cat = btn.getAttribute('data-category');
    if (cat === currentCategory) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }

    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = cat;
      currentTopic = 'all';
      updateTopicPills();
      filterAndRenderQuestions();
    });
  });

  // Setup Search Input
  const searchInput = document.getElementById('practice-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterAndRenderQuestions(e.target.value.trim().toLowerCase());
    });
  }

  updateTopicPills();
  filterAndRenderQuestions();
}

/**
 * Generate Topic Filter Pills based on active Category
 */
function updateTopicPills() {
  const container = document.getElementById('topic-pills-container');
  if (!container) return;

  container.innerHTML = '';

  // Get unique topics for the selected category
  const relevant = currentCategory === 'all' 
    ? allQuestions 
    : allQuestions.filter(q => q.category === currentCategory);

  const topics = ['all', ...new Set(relevant.map(q => q.topic))];

  topics.forEach(topic => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = `filter-pill ${topic === currentTopic ? 'active' : ''}`;
    pill.textContent = topic === 'all' ? 'All Topics' : topic;

    pill.addEventListener('click', () => {
      container.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentTopic = topic;
      filterAndRenderQuestions();
    });

    container.appendChild(pill);
  });
}

/**
 * Filter questions and render into container
 */
function filterAndRenderQuestions(searchQuery = '') {
  filteredQuestions = allQuestions.filter(q => {
    const matchesCat = (currentCategory === 'all' || q.category === currentCategory);
    const matchesTopic = (currentTopic === 'all' || q.topic === currentTopic);
    const matchesSearch = !searchQuery || 
      q.question.toLowerCase().includes(searchQuery) || 
      q.topic.toLowerCase().includes(searchQuery);
    return matchesCat && matchesTopic && matchesSearch;
  });

  renderQuestionsList();
}

/**
 * Render list of interactive practice cards
 */
function renderQuestionsList() {
  const listContainer = document.getElementById('practice-questions-list');
  const countBadge = document.getElementById('practice-count-badge');
  const emptyBox = document.getElementById('practice-empty-state');

  if (!listContainer) return;
  listContainer.innerHTML = '';

  if (countBadge) {
    countBadge.textContent = `${filteredQuestions.length} Questions Available`;
  }

  if (filteredQuestions.length === 0) {
    if (emptyBox) emptyBox.style.display = 'block';
    return;
  }

  if (emptyBox) emptyBox.style.display = 'none';

  filteredQuestions.forEach((q, index) => {
    const card = document.createElement('div');
    card.className = 'practice-card';
    card.id = `practice-card-${q.id}`;

    // Format category badge color
    let catClass = 'badge-purple';
    if (q.category === 'reasoning') catClass = 'badge-warning';
    if (q.category === 'verbal') catClass = 'badge-info';
    if (q.category === 'programming') catClass = 'badge-success';

    // Build Options HTML
    let optionsHtml = '';
    const optionLetters = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, optIndex) => {
      optionsHtml += `
        <div class="option-item" data-q-id="${q.id}" data-opt-idx="${optIndex}">
          <span class="option-letter">${optionLetters[optIndex]}</span>
          <span class="option-text">${escapeHTML(opt)}</span>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="practice-card-header">
        <div class="d-flex align-items-center gap-2">
          <span class="badge ${catClass}">${q.category}</span>
          <span class="badge badge-navy">${escapeHTML(q.topic)}</span>
        </div>
        <span class="text-muted fw-semibold">Question ${index + 1} of ${filteredQuestions.length}</span>
      </div>

      <div class="question-text">${formatQuestionText(q.question)}</div>

      <div class="options-list">
        ${optionsHtml}
      </div>

      <div class="d-flex align-items-center justify-content-between mt-3 flex-wrap gap-2">
        <button type="button" class="btn btn-sm btn-outline-primary btn-toggle-explanation" data-target="expl-${q.id}">
          <i class="fa-regular fa-lightbulb"></i> <span class="expl-btn-text">Show Solution</span>
        </button>
        <span class="feedback-msg text-muted fw-semibold" id="feedback-${q.id}">Select an option to test your knowledge</span>
      </div>

      <div class="explanation-box" id="expl-${q.id}">
        <h5 class="fw-bold text-navy mb-2"><i class="fa-solid fa-circle-info text-primary"></i> Step-by-Step Solution & Explanation:</h5>
        <p class="text-main mb-2">${escapeHTML(q.explanation)}</p>
        <small class="text-success fw-bold">Correct Option: ${optionLetters[q.correctIndex]} - ${escapeHTML(q.options[q.correctIndex])}</small>
      </div>
    `;

    listContainer.appendChild(card);
  });

  bindPracticeEvents();
}

/**
 * Handle Option Clicks & Explanation Toggles
 */
function bindPracticeEvents() {
  // Option selection
  const optionItems = document.querySelectorAll('.practice-card .option-item');
  optionItems.forEach(item => {
    item.addEventListener('click', function() {
      const qId = this.getAttribute('data-q-id');
      const chosenIdx = parseInt(this.getAttribute('data-opt-idx'), 10);
      const question = allQuestions.find(q => q.id === qId);
      if (!question) return;

      const card = document.getElementById(`practice-card-${qId}`);
      if (!card) return;

      // Prevent re-selection if already evaluated
      if (card.dataset.answered === 'true') return;
      card.dataset.answered = 'true';

      const optionsInCard = card.querySelectorAll('.option-item');
      const feedbackEl = document.getElementById(`feedback-${qId}`);
      const explBox = document.getElementById(`expl-${qId}`);
      const explBtn = card.querySelector('.btn-toggle-explanation');

      practiceStats.attempted++;

      if (chosenIdx === question.correctIndex) {
        // Correct Choice
        this.classList.add('correct');
        practiceStats.correct++;
        if (feedbackEl) {
          feedbackEl.className = 'feedback-msg text-success fw-bold';
          feedbackEl.innerHTML = '<i class="fa-solid fa-check"></i> Correct Answer! Great job!';
        }
      } else {
        // Wrong Choice
        this.classList.add('wrong');
        practiceStats.wrong++;
        // Highlight correct option
        optionsInCard[question.correctIndex].classList.add('correct');
        if (feedbackEl) {
          feedbackEl.className = 'feedback-msg text-danger fw-bold';
          feedbackEl.innerHTML = '<i class="fa-solid fa-xmark"></i> Incorrect! See correct answer highlighted in green.';
        }
      }

      // Automatically reveal explanation
      if (explBox) {
        explBox.classList.add('show');
        if (explBtn) {
          explBtn.querySelector('.expl-btn-text').textContent = 'Hide Solution';
        }
      }

      updatePracticeStats();
    });
  });

  // Toggle Explanation Button
  const explButtons = document.querySelectorAll('.btn-toggle-explanation');
  explButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const box = document.getElementById(targetId);
      const textSpan = this.querySelector('.expl-btn-text');

      if (box) {
        box.classList.toggle('show');
        if (box.classList.contains('show')) {
          textSpan.textContent = 'Hide Solution';
        } else {
          textSpan.textContent = 'Show Solution';
        }
      }
    });
  });
}

function updatePracticeStats() {
  const attEl = document.getElementById('stat-practice-attempted');
  const corEl = document.getElementById('stat-practice-correct');
  const accEl = document.getElementById('stat-practice-accuracy');

  if (attEl) attEl.textContent = practiceStats.attempted;
  if (corEl) corEl.textContent = practiceStats.correct;
  if (accEl) {
    const acc = practiceStats.attempted > 0 
      ? Math.round((practiceStats.correct / practiceStats.attempted) * 100) 
      : 0;
    accEl.textContent = `${acc}%`;
  }
}

function formatQuestionText(text) {
  if (!text) return '';
  // Check if text has code snippet
  if (text.includes('\n')) {
    const lines = text.split('\n');
    const header = lines[0];
    const code = lines.slice(1).join('\n');
    return `<div>${escapeHTML(header)}</div><pre class="bg-dark text-white p-3 rounded my-2" style="background:#0f172a;color:#f8fafc;border-radius:8px;padding:0.85rem;overflow-x:auto;"><code>${escapeHTML(code)}</code></pre>`;
  }
  return escapeHTML(text);
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
