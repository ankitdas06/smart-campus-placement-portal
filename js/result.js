/**
 * Smart Campus Placement Preparation Portal
 * Test Result & Performance Analytics Controller
 */

document.addEventListener('DOMContentLoaded', function() {
  const user = requireAuth(['student', 'admin']);
  if (!user) return;

  loadTestResult(user);
});

function loadTestResult(user) {
  // Get test ID from URL ?id=hist-...
  const params = new URLSearchParams(window.location.search);
  const testId = params.get('id');

  let resultData = null;

  if (testId) {
    const allHistory = DB.getAllTestHistory();
    resultData = allHistory.find(h => h.id === testId);
  }

  // Fallback to active result in session or most recent test history
  if (!resultData) {
    try {
      resultData = JSON.parse(localStorage.getItem('scpp_active_result'));
    } catch (e) {}
  }

  if (!resultData) {
    const userHistory = DB.getUserTestHistory(user.id);
    if (userHistory && userHistory.length > 0) {
      resultData = userHistory[0];
    }
  }

  if (!resultData) {
    alert('No mock test attempts recorded yet. Please attempt a placement mock test first to generate your performance scorecard.');
    window.location.href = 'mock-test.html';
    return;
  }

  renderResultSummary(resultData, user);
  renderImprovementRecommendations(resultData);
  renderQuestionReview(resultData);
}

/**
 * Render Main Score Card & Metric Gauges
 */
function renderResultSummary(result, user) {
  setText('result-student-name', result.userName || user.name);
  setText('result-exam-title', result.categoryTitle || 'Placement Assessment');
  
  const formattedDate = result.date ? new Date(result.date).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Just now';
  setText('result-exam-date', formattedDate);

  // Score percent
  const score = result.scorePercent || 0;
  setText('result-score-percent', `${score}%`);
  
  // Metric Counters
  setText('res-total-q', result.totalQuestions);
  setText('res-correct-q', result.correctCount);
  setText('res-wrong-q', result.wrongCount);
  setText('res-unanswered-q', result.unansweredCount);

  // Accuracy
  const attempted = (result.totalQuestions - result.unansweredCount);
  const accuracy = attempted > 0 ? Math.round((result.correctCount / attempted) * 100) : 0;
  setText('res-accuracy', `${accuracy}%`);

  // Time taken
  const minutes = Math.floor(result.timeTakenSeconds / 60);
  const seconds = result.timeTakenSeconds % 60;
  setText('res-time-taken', `${minutes}m ${seconds}s`);

  // Appraisal Badge
  const appraisalBadge = document.getElementById('result-appraisal-badge');
  if (appraisalBadge) {
    if (score >= 80) {
      appraisalBadge.className = 'badge badge-success';
      appraisalBadge.textContent = '🌟 Outstanding - Placement Ready';
    } else if (score >= 60) {
      appraisalBadge.className = 'badge badge-purple';
      appraisalBadge.textContent = '👍 Good Effort - Above Average';
    } else if (score >= 40) {
      appraisalBadge.className = 'badge badge-warning';
      appraisalBadge.textContent = '⚠️ Average - More Practice Recommended';
    } else {
      appraisalBadge.className = 'badge badge-danger';
      appraisalBadge.textContent = '🚨 Needs Remedial Attention';
    }
  }

  // Setup Retake Link
  const retakeBtn = document.getElementById('btn-retake-exam');
  if (retakeBtn) {
    retakeBtn.href = `mock-test.html?category=${result.category || 'all'}`;
  }

  // Setup Print Button
  const printBtn = document.getElementById('btn-print-scorecard');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

/**
 * Generate Smart Dynamic Placement Suggestions based on test outcome
 */
function renderImprovementRecommendations(result) {
  const container = document.getElementById('improvement-tips-container');
  if (!container) return;

  container.innerHTML = '';

  const tips = [];

  if (result.scorePercent >= 80) {
    tips.push({
      icon: 'fa-solid fa-trophy text-success',
      title: 'Strong Conceptual Foundation',
      desc: 'You demonstrated solid proficiency in this topic! Focus now on speed drills and complex algorithmic edge cases.'
    });
    tips.push({
      icon: 'fa-solid fa-user-tie text-primary',
      title: 'Next Step: Technical & HR Interviews',
      desc: 'Since your aptitude and logic foundations are strong, dive into our Interview Preparation module for STAR project explanations.'
    });
  } else if (result.scorePercent >= 60) {
    tips.push({
      icon: 'fa-solid fa-bolt text-warning',
      title: 'Speed & Accuracy Optimization',
      desc: 'Your conceptual clarity is good, but review questions where you hesitated or made calculation slips. Aim for >85% accuracy.'
    });
    tips.push({
      icon: 'fa-solid fa-book-open text-primary',
      title: 'Targeted Sub-Topic Practice',
      desc: 'Visit the Practice Arena and solve topic-specific questions under timed conditions to eliminate remaining doubt areas.'
    });
  } else {
    tips.push({
      icon: 'fa-solid fa-triangle-exclamation text-danger',
      title: 'Foundational Review Needed',
      desc: 'Carefully inspect each question solution below. Understand why the wrong choices were eliminated and note key formulas.'
    });
    tips.push({
      icon: 'fa-solid fa-rotate-right text-primary',
      title: 'Structured Revision Routine',
      desc: 'Dedicate 45 minutes daily to our Practice section before reattempting the Full Placement Mock Test.'
    });
  }

  // Category specific tips
  if (result.category === 'programming') {
    tips.push({
      icon: 'fa-solid fa-code text-primary',
      title: 'Coding Focus Tip',
      desc: 'Pay special attention to pointer arithmetic in C and dynamic method dispatch / OOP concepts in Java.'
    });
  } else if (result.category === 'aptitude') {
    tips.push({
      icon: 'fa-solid fa-calculator text-primary',
      title: 'Aptitude Focus Tip',
      desc: 'Memorize standard fractional percentage equivalents (1/6 = 16.66%, 1/8 = 12.5%) to cut calculation time in half.'
    });
  }

  tips.forEach(t => {
    const card = document.createElement('div');
    card.className = 'card p-3 mb-2';
    card.innerHTML = `
      <div class="d-flex align-items-start gap-3">
        <div style="font-size:1.4rem;padding-top:2px;">
          <i class="${t.icon}"></i>
        </div>
        <div>
          <h5 class="fw-bold text-navy mb-1">${t.title}</h5>
          <p class="text-muted mb-0" style="font-size:0.9rem;">${t.desc}</p>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

/**
 * Render Question-by-Question Detailed Review
 */
function renderQuestionReview(result) {
  const container = document.getElementById('review-questions-list');
  if (!container) return;

  container.innerHTML = '';

  const questions = result.questions || [];
  if (questions.length === 0) {
    container.innerHTML = '<p class="text-muted">Detailed question log is not available for this legacy record.</p>';
    return;
  }

  const letters = ['A', 'B', 'C', 'D'];

  questions.forEach((q, idx) => {
    const card = document.createElement('div');
    
    let statusClass = 'unanswered-item';
    let badgeHtml = '<span class="badge badge-warning">Unanswered / Skipped</span>';

    if (q.isCorrect) {
      statusClass = 'correct-item';
      badgeHtml = '<span class="badge badge-success"><i class="fa-solid fa-check"></i> Correct</span>';
    } else if (q.studentChoice !== null) {
      statusClass = 'wrong-item';
      badgeHtml = '<span class="badge badge-danger"><i class="fa-solid fa-xmark"></i> Incorrect</span>';
    }

    card.className = `review-card ${statusClass}`;

    let optionsListHtml = '';
    q.options.forEach((opt, optIdx) => {
      let optClass = '';
      if (optIdx === q.correctIndex) {
        optClass = 'correct';
      } else if (optIdx === q.studentChoice && !q.isCorrect) {
        optClass = 'wrong';
      }

      optionsListHtml += `
        <div class="option-item ${optClass}" style="cursor:default;">
          <span class="option-letter">${letters[optIdx]}</span>
          <span class="option-text">${escapeHTML(opt)}</span>
          ${optIdx === q.correctIndex ? '<span class="ms-auto text-success fw-bold"><i class="fa-solid fa-check-circle"></i> Correct Answer</span>' : ''}
          ${optIdx === q.studentChoice && !q.isCorrect ? '<span class="ms-auto text-danger fw-bold"><i class="fa-solid fa-times-circle"></i> Your Choice</span>' : ''}
        </div>
      `;
    });

    card.innerHTML = `
      <div class="d-flex align-items-center justify-content-between mb-2">
        <span class="fw-bold text-navy">Question ${idx + 1} of ${questions.length}</span>
        ${badgeHtml}
      </div>

      <div class="question-text mb-3">${escapeHTML(q.question)}</div>

      <div class="options-list mb-3">
        ${optionsListHtml}
      </div>

      <div class="explanation-box show" style="margin-top:0.75rem;">
        <h5 class="fw-bold text-navy mb-1"><i class="fa-solid fa-circle-info text-primary"></i> Solution & Explanation:</h5>
        <p class="text-main mb-0">${escapeHTML(q.explanation)}</p>
      </div>
    `;

    container.appendChild(card);
  });
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
