/**
 * Smart Campus Placement Preparation Portal
 * Mock Examination Simulator with Timer, Palette, and Auto-Submission
 */

let examConfig = {
  category: 'all',
  categoryTitle: 'Comprehensive Placement Mock Test',
  durationMinutes: 10,
  timeRemainingSeconds: 600,
  timerInterval: null
};

let examQuestions = [];
let currentIndex = 0;
// Tracking student responses: array of objects { chosenIndex: null | 0..3, status: 'not-visited' | 'unanswered' | 'answered' | 'flagged' }
let studentAnswers = [];
let isSubmitted = false;

document.addEventListener('DOMContentLoaded', function() {
  const user = requireAuth(['student', 'admin']);
  if (!user) return;

  initMockExam(user);
});

function initMockExam(user) {
  // Check URL param ?category=...
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('category') || 'all';

  examConfig.category = cat;
  if (cat === 'aptitude') examConfig.categoryTitle = 'Quantitative Aptitude Mock Test';
  else if (cat === 'reasoning') examConfig.categoryTitle = 'Logical Reasoning Mock Test';
  else if (cat === 'verbal') examConfig.categoryTitle = 'Verbal Ability Mock Test';
  else if (cat === 'programming') examConfig.categoryTitle = 'Technical & Coding Mock Test';
  else examConfig.categoryTitle = 'Comprehensive All-Subject Mock Test';

  const titleEl = document.getElementById('mock-exam-title');
  if (titleEl) titleEl.textContent = examConfig.categoryTitle;

  // Load questions for the exam
  let pool = DB.getQuestionsByCategory(cat);
  if (pool.length === 0) {
    pool = DB.getAllQuestions(); // Fallback to all if category empty
  }

  // Shuffle and pick up to 10 questions for the mock test
  examQuestions = shuffleArray([...pool]).slice(0, 10);

  // Initialize state tracker
  studentAnswers = examQuestions.map(() => ({
    chosenIndex: null,
    status: 'not-visited'
  }));

  // Mark first question as unanswered/visited
  studentAnswers[0].status = 'unanswered';

  // Render Palette Grid
  renderPaletteGrid();

  // Load first question
  loadQuestion(0);

  // Start Timer
  startTimer(user);

  // Bind Exam Action Controls
  bindExamControls(user);
}

/**
 * Timer implementation with auto submission on 0
 */
function startTimer(user) {
  examConfig.timeRemainingSeconds = examConfig.durationMinutes * 60;
  const timerBadge = document.getElementById('exam-timer');

  updateTimerDisplay(timerBadge, examConfig.timeRemainingSeconds);

  examConfig.timerInterval = setInterval(() => {
    examConfig.timeRemainingSeconds--;

    updateTimerDisplay(timerBadge, examConfig.timeRemainingSeconds);

    if (examConfig.timeRemainingSeconds <= 120 && timerBadge) {
      timerBadge.classList.add('warning');
    }

    if (examConfig.timeRemainingSeconds <= 0) {
      clearInterval(examConfig.timerInterval);
      Toast.show('Time Expired!', 'Your examination time has ended. Submitting automatically...', 'warning');
      submitExam(user, true);
    }
  }, 1000);
}

function updateTimerDisplay(el, totalSeconds) {
  if (!el) return;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  el.innerHTML = `<i class="fa-regular fa-clock"></i> ${padZero(minutes)}:${padZero(seconds)}`;
}

function padZero(num) {
  return num < 10 ? '0' + num : num;
}

/**
 * Render Question Palette Grid (1..N buttons)
 */
function renderPaletteGrid() {
  const container = document.getElementById('question-palette-grid');
  if (!container) return;

  container.innerHTML = '';

  examQuestions.forEach((_, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'palette-btn';
    btn.id = `palette-btn-${idx}`;
    btn.textContent = idx + 1;

    btn.addEventListener('click', () => {
      saveCurrentQuestionState();
      loadQuestion(idx);
    });

    container.appendChild(btn);
  });

  updatePaletteStatus();
}

/**
 * Update Palette colors and legend count badges
 */
function updatePaletteStatus() {
  let countAnswered = 0;
  let countUnanswered = 0;
  let countFlagged = 0;
  let countNotVisited = 0;

  studentAnswers.forEach((ans, idx) => {
    const btn = document.getElementById(`palette-btn-${idx}`);
    if (!btn) return;

    btn.className = 'palette-btn';

    if (idx === currentIndex) {
      btn.classList.add('active-current');
    }

    if (ans.status === 'answered') {
      btn.classList.add('answered');
      countAnswered++;
    } else if (ans.status === 'flagged') {
      btn.classList.add('flagged');
      countFlagged++;
    } else if (ans.status === 'unanswered') {
      btn.classList.add('unanswered');
      countUnanswered++;
    } else {
      countNotVisited++;
    }
  });

  // Update legend count texts
  setText('legend-count-answered', countAnswered);
  setText('legend-count-unanswered', countUnanswered);
  setText('legend-count-flagged', countFlagged);
  setText('legend-count-notvisited', countNotVisited);
}

/**
 * Load Question into Viewport
 */
function loadQuestion(index) {
  if (index < 0 || index >= examQuestions.length) return;

  currentIndex = index;
  const q = examQuestions[index];

  // Mark status if it was not-visited
  if (studentAnswers[index].status === 'not-visited') {
    studentAnswers[index].status = 'unanswered';
  }

  // Update question header info
  setText('current-q-number', `Question ${index + 1} of ${examQuestions.length}`);
  setText('current-q-category', q.category.toUpperCase());
  setText('current-q-topic', q.topic);

  // Render Question Text
  const textEl = document.getElementById('mock-question-text');
  if (textEl) {
    textEl.innerHTML = formatExamQuestionText(q.question);
  }

  // Render 4 Options
  const optionsContainer = document.getElementById('mock-options-container');
  if (optionsContainer) {
    optionsContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    q.options.forEach((opt, optIdx) => {
      const isSelected = studentAnswers[index].chosenIndex === optIdx;
      const optDiv = document.createElement('div');
      optDiv.className = `option-item ${isSelected ? 'selected' : ''}`;
      optDiv.setAttribute('data-idx', optIdx);

      optDiv.innerHTML = `
        <span class="option-letter">${letters[optIdx]}</span>
        <span class="option-text">${escapeHTML(opt)}</span>
      `;

      optDiv.addEventListener('click', () => {
        // Clear previous selected in UI
        optionsContainer.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected'));
        optDiv.classList.add('selected');

        // Record response
        studentAnswers[index].chosenIndex = optIdx;
        studentAnswers[index].status = 'answered';
        updatePaletteStatus();
      });

      optionsContainer.appendChild(optDiv);
    });
  }

  // Manage Prev / Next button states
  const prevBtn = document.getElementById('btn-prev-q');
  const nextBtn = document.getElementById('btn-next-q');

  if (prevBtn) prevBtn.disabled = (currentIndex === 0);
  if (nextBtn) {
    if (currentIndex === examQuestions.length - 1) {
      nextBtn.innerHTML = 'Review Summary <i class="fa-solid fa-list-check"></i>';
    } else {
      nextBtn.innerHTML = 'Next Question <i class="fa-solid fa-arrow-right"></i>';
    }
  }

  updatePaletteStatus();
}

function saveCurrentQuestionState() {
  // If an answer was picked, mark as answered, else keep unanswered
  if (studentAnswers[currentIndex].chosenIndex !== null) {
    if (studentAnswers[currentIndex].status !== 'flagged') {
      studentAnswers[currentIndex].status = 'answered';
    }
  }
}

/**
 * Bind Action Buttons
 */
function bindExamControls(user) {
  // Next Button
  const nextBtn = document.getElementById('btn-next-q');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      saveCurrentQuestionState();
      if (currentIndex < examQuestions.length - 1) {
        loadQuestion(currentIndex + 1);
      } else {
        openSubmitModal();
      }
    });
  }

  // Prev Button
  const prevBtn = document.getElementById('btn-prev-q');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      saveCurrentQuestionState();
      if (currentIndex > 0) {
        loadQuestion(currentIndex - 1);
      }
    });
  }

  // Clear Response Button
  const clearBtn = document.getElementById('btn-clear-response');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      studentAnswers[currentIndex].chosenIndex = null;
      studentAnswers[currentIndex].status = 'unanswered';

      const options = document.querySelectorAll('#mock-options-container .option-item');
      options.forEach(opt => opt.classList.remove('selected'));

      updatePaletteStatus();
      Toast.show('Cleared', 'Your answer selection for this question has been cleared.', 'info');
    });
  }

  // Mark / Flag for Review Button
  const flagBtn = document.getElementById('btn-flag-review');
  if (flagBtn) {
    flagBtn.addEventListener('click', () => {
      if (studentAnswers[currentIndex].status === 'flagged') {
        studentAnswers[currentIndex].status = studentAnswers[currentIndex].chosenIndex !== null ? 'answered' : 'unanswered';
        Toast.show('Unflagged', 'Question removed from review flag.', 'info');
      } else {
        studentAnswers[currentIndex].status = 'flagged';
        Toast.show('Flagged', 'Question marked for review.', 'warning');
      }
      updatePaletteStatus();
    });
  }

  // Submit Modal Triggers
  const submitBtn = document.getElementById('btn-open-submit-modal');
  const modalOverlay = document.getElementById('submit-modal-overlay');
  const cancelSubmitBtn = document.getElementById('btn-cancel-submit');
  const closeSubmitModalBtn = document.getElementById('btn-close-submit-modal');
  const confirmSubmitBtn = document.getElementById('btn-confirm-submit');

  if (submitBtn) {
    submitBtn.addEventListener('click', openSubmitModal);
  }

  if (cancelSubmitBtn && modalOverlay) {
    cancelSubmitBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });
  }

  if (closeSubmitModalBtn && modalOverlay) {
    closeSubmitModalBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });
  }

  if (confirmSubmitBtn) {
    confirmSubmitBtn.addEventListener('click', () => {
      submitExam(user, false);
    });
  }
}

function openSubmitModal() {
  const modalOverlay = document.getElementById('submit-modal-overlay');
  if (!modalOverlay) return;

  saveCurrentQuestionState();

  // Calculate summary counts
  const total = examQuestions.length;
  let answered = 0;
  let flagged = 0;
  let unanswered = 0;

  studentAnswers.forEach(ans => {
    if (ans.chosenIndex !== null) answered++;
    if (ans.status === 'flagged') flagged++;
    if (ans.chosenIndex === null) unanswered++;
  });

  setText('modal-total-q', total);
  setText('modal-answered-q', answered);
  setText('modal-unanswered-q', unanswered);
  setText('modal-flagged-q', flagged);

  modalOverlay.classList.add('active');
}

/**
 * Submit Exam & Compute Evaluation
 */
function submitExam(user, isAutoSubmit = false) {
  if (isSubmitted) return; // Prevent double submit
  isSubmitted = true;

  if (examConfig.timerInterval) {
    clearInterval(examConfig.timerInterval);
  }

  // Evaluation
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  const evaluatedQuestions = examQuestions.map((q, idx) => {
    const studentChoice = studentAnswers[idx].chosenIndex;
    const isCorrect = (studentChoice !== null && studentChoice === q.correctIndex);
    const isUnanswered = (studentChoice === null);

    if (isUnanswered) unansweredCount++;
    else if (isCorrect) correctCount++;
    else wrongCount++;

    return {
      questionId: q.id,
      question: q.question,
      category: q.category,
      topic: q.topic,
      options: q.options,
      correctIndex: q.correctIndex,
      studentChoice: studentChoice,
      isCorrect: isCorrect,
      isUnanswered: isUnanswered,
      explanation: q.explanation
    };
  });

  const totalQuestions = examQuestions.length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const timeTaken = (examConfig.durationMinutes * 60) - examConfig.timeRemainingSeconds;

  const resultRecord = {
    userId: user.id,
    userName: user.name,
    category: examConfig.category,
    categoryTitle: examConfig.categoryTitle,
    totalQuestions: totalQuestions,
    correctCount: correctCount,
    wrongCount: wrongCount,
    unansweredCount: unansweredCount,
    scorePercent: scorePercent,
    timeTakenSeconds: timeTaken,
    isAutoSubmitted: isAutoSubmit,
    questions: evaluatedQuestions
  };

  // Save to DB
  const saved = DB.saveTestResult(resultRecord);

  // Store active result in session for quick access
  localStorage.setItem('scpp_active_result', JSON.stringify(saved));

  Toast.show('Test Completed', 'Your test has been evaluated. Redirecting to performance analysis...', 'success');

  setTimeout(() => {
    window.location.href = `result.html?id=${saved.id}`;
  }, 1000);
}

function formatExamQuestionText(text) {
  if (!text) return '';
  if (text.includes('\n')) {
    const lines = text.split('\n');
    const header = lines[0];
    const code = lines.slice(1).join('\n');
    return `<div class="mb-2">${escapeHTML(header)}</div><pre style="background:#0f172a;color:#f8fafc;padding:1rem;border-radius:8px;font-size:0.9rem;overflow-x:auto;"><code>${escapeHTML(code)}</code></pre>`;
  }
  return escapeHTML(text);
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
