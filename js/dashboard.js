/**
 * Smart Campus Placement Preparation Portal
 * Student Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', function() {
  const user = requireAuth(['student', 'admin']);
  if (!user) return;

  loadStudentDashboard(user);
});

function loadStudentDashboard(user) {
  // Update welcome greeting
  const welcomeEl = document.getElementById('dashboard-greeting');
  if (welcomeEl) {
    welcomeEl.textContent = `Welcome back, ${user.name}! 🚀`;
  }

  // Fetch metrics from DB
  const metrics = DB.getStudentMetrics(user.id);
  const testHistory = DB.getUserTestHistory(user.id);

  // Update Metric Cards
  setText('metric-total-tests', metrics.totalTests);
  setText('metric-avg-score', `${metrics.averageScore}%`);
  setText('metric-highest-score', `${metrics.highestScore}%`);
  setText('metric-total-attempted', metrics.totalQuestionsAttempted);

  // Update Placement Readiness Indicator
  const readinessEl = document.getElementById('metric-readiness-badge');
  if (readinessEl) {
    if (metrics.totalTests === 0) {
      readinessEl.className = 'badge badge-warning';
      readinessEl.textContent = 'Not Started';
    } else if (metrics.averageScore >= 80) {
      readinessEl.className = 'badge badge-success';
      readinessEl.textContent = 'Placement Ready';
    } else if (metrics.averageScore >= 60) {
      readinessEl.className = 'badge badge-purple';
      readinessEl.textContent = 'Intermediate';
    } else {
      readinessEl.className = 'badge badge-danger';
      readinessEl.textContent = 'Needs Revision';
    }
  }

  // Update Subject-wise Progress Bars
  renderSubjectProgress(metrics.categoryPerformance);

  // Render Recent Test History Table
  renderRecentTestsTable(testHistory);
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function renderSubjectProgress(perf) {
  const categories = [
    { key: 'aptitude', label: 'Quantitative Aptitude', colorClass: 'fill-purple' },
    { key: 'reasoning', label: 'Logical Reasoning', colorClass: 'fill-amber' },
    { key: 'verbal', label: 'Verbal Ability', colorClass: 'fill-cyan' },
    { key: 'programming', label: 'Programming & Logic', colorClass: 'fill-emerald' }
  ];

  const container = document.getElementById('subject-progress-container');
  if (!container) return;

  container.innerHTML = '';

  categories.forEach(cat => {
    const score = perf[cat.key] || 0;
    const item = document.createElement('div');
    item.className = 'progress-bar-wrapper';
    item.innerHTML = `
      <div class="progress-header">
        <span class="text-navy fw-semibold">${cat.label}</span>
        <span class="text-muted fw-bold">${score}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill ${cat.colorClass}" style="width: ${score}%;"></div>
      </div>
    `;
    container.appendChild(item);
  });
}

function renderRecentTestsTable(history) {
  const tableBody = document.getElementById('recent-tests-tbody');
  const emptyState = document.getElementById('recent-tests-empty');
  const tableContainer = document.getElementById('recent-tests-table-wrapper');

  if (!tableBody) return;

  if (!history || history.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (tableContainer) tableContainer.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (tableContainer) tableContainer.style.display = 'block';

  tableBody.innerHTML = '';

  // Show up to 5 most recent tests
  const recentTests = history.slice(0, 5);

  recentTests.forEach((test, idx) => {
    const tr = document.createElement('tr');

    const formattedDate = test.date ? new Date(test.date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) : 'Recent';

    let scoreBadge = 'badge-danger';
    if (test.scorePercent >= 80) scoreBadge = 'badge-success';
    else if (test.scorePercent >= 60) scoreBadge = 'badge-purple';
    else if (test.scorePercent >= 40) scoreBadge = 'badge-warning';

    tr.innerHTML = `
      <td><strong>#${idx + 1}</strong></td>
      <td>
        <div class="fw-semibold text-navy">${escapeHTML(test.categoryTitle || test.category)}</div>
        <small class="text-muted text-uppercase">${test.category}</small>
      </td>
      <td>${formattedDate}</td>
      <td>
        <span class="text-navy fw-bold">${test.correctCount} / ${test.totalQuestions}</span>
      </td>
      <td>
        <span class="badge ${scoreBadge}">${test.scorePercent}%</span>
      </td>
      <td>
        <a href="result.html?id=${test.id}" class="btn btn-sm btn-outline-primary">
          <i class="fa-solid fa-chart-simple"></i> Review
        </a>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
