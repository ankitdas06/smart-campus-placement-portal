/**
 * Smart Campus Placement Preparation Portal
 * Admin Panel & Question Bank CRUD Controller
 */

let editingQuestionId = null;

document.addEventListener('DOMContentLoaded', function() {
  const user = requireAuth(['admin']);
  if (!user) return;

  initAdminDashboard();
});

function initAdminDashboard() {
  loadAdminMetrics();
  loadStudentsTable();
  loadQuestionsTable();
  loadTestAuditTable();

  // Bind Question Modal Handlers
  const openAddBtn = document.getElementById('btn-open-add-q-modal');
  const modalOverlay = document.getElementById('question-modal-overlay');
  const closeModalBtn = document.getElementById('btn-close-q-modal');
  const cancelModalBtn = document.getElementById('btn-cancel-q-modal');
  const questionForm = document.getElementById('form-question-crud');

  if (openAddBtn) {
    openAddBtn.addEventListener('click', () => {
      openQuestionModal(null);
    });
  }

  if (closeModalBtn && modalOverlay) {
    closeModalBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));
  }

  if (cancelModalBtn && modalOverlay) {
    cancelModalBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));
  }

  if (questionForm) {
    questionForm.addEventListener('submit', handleSaveQuestion);
  }

  // Filter Question Bank
  const catFilter = document.getElementById('admin-q-cat-filter');
  if (catFilter) {
    catFilter.addEventListener('change', () => {
      loadQuestionsTable(catFilter.value);
    });
  }

  // Reset Default Questions Button
  const resetBtn = document.getElementById('btn-reset-default-questions');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset the question repository to the original placement bank?')) {
        DB.resetDefaultQuestions();
        Toast.show('Reset Completed', 'Question bank restored to default placement set.', 'success');
        loadQuestionsTable();
        loadAdminMetrics();
      }
    });
  }
}

/**
 * Calculate & Render Campus-Wide Metrics
 */
function loadAdminMetrics() {
  const users = DB.getUsers();
  const students = users.filter(u => u.role === 'student');
  const questions = DB.getAllQuestions();
  const history = DB.getAllTestHistory();

  let avgCampusScore = 0;
  if (history.length > 0) {
    const sum = history.reduce((acc, h) => acc + Number(h.scorePercent || 0), 0);
    avgCampusScore = Math.round(sum / history.length);
  }

  setText('admin-stat-students', students.length);
  setText('admin-stat-tests', history.length);
  setText('admin-stat-questions', questions.length);
  setText('admin-stat-avg-score', `${avgCampusScore}%`);
}

/**
 * Render Registered Students
 */
function loadStudentsTable() {
  const tbody = document.getElementById('admin-students-tbody');
  if (!tbody) return;

  const users = DB.getUsers();
  const students = users.filter(u => u.role === 'student');
  const history = DB.getAllTestHistory();

  tbody.innerHTML = '';

  if (students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted p-4">No registered students found yet.</td></tr>';
    return;
  }

  students.forEach((st, idx) => {
    const studentTests = history.filter(h => h.userId === st.id);
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td><strong>#${idx + 1}</strong></td>
      <td>
        <div class="fw-bold text-navy">${escapeHTML(st.name)}</div>
        <small class="text-muted">${escapeHTML(st.email)}</small>
      </td>
      <td>${escapeHTML(st.college || 'BCA College')}</td>
      <td>${st.registeredDate || '2026-10-15'}</td>
      <td><span class="badge badge-purple">${studentTests.length} Tests Attempted</span></td>
      <td>
        <button class="btn btn-sm btn-outline-primary btn-inspect-student" data-user-id="${st.id}" data-name="${escapeHTML(st.name)}">
          <i class="fa-solid fa-eye"></i> View Tests
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Bind inspect button
  document.querySelectorAll('.btn-inspect-student').forEach(btn => {
    btn.addEventListener('click', function() {
      const uId = this.getAttribute('data-user-id');
      const uName = this.getAttribute('data-name');
      filterAuditByUser(uId, uName);
    });
  });
}

/**
 * Render Question Bank Table with Edit & Delete actions
 */
function loadQuestionsTable(category = 'all') {
  const tbody = document.getElementById('admin-questions-tbody');
  if (!tbody) return;

  const questions = DB.getQuestionsByCategory(category);
  tbody.innerHTML = '';

  if (questions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted p-4">No questions found in this category.</td></tr>';
    return;
  }

  const letters = ['A', 'B', 'C', 'D'];

  questions.forEach((q, idx) => {
    const tr = document.createElement('tr');

    let catBadge = 'badge-purple';
    if (q.category === 'reasoning') catBadge = 'badge-warning';
    if (q.category === 'verbal') catBadge = 'badge-info';
    if (q.category === 'programming') catBadge = 'badge-success';

    const shortQ = q.question.length > 70 ? q.question.substring(0, 70) + '...' : q.question;

    tr.innerHTML = `
      <td><strong>#${idx + 1}</strong></td>
      <td><span class="badge ${catBadge}">${q.category}</span></td>
      <td><strong>${escapeHTML(q.topic)}</strong></td>
      <td>${escapeHTML(shortQ)}</td>
      <td><span class="badge badge-navy">Opt ${letters[q.correctIndex]}</span></td>
      <td>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-light btn-edit-q" data-id="${q.id}" title="Edit Question">
            <i class="fa-solid fa-pen-to-square text-primary"></i>
          </button>
          <button class="btn btn-sm btn-light btn-delete-q" data-id="${q.id}" title="Delete Question">
            <i class="fa-solid fa-trash-can text-danger"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Bind Edit and Delete
  document.querySelectorAll('.btn-edit-q').forEach(btn => {
    btn.addEventListener('click', function() {
      const qId = this.getAttribute('data-id');
      openQuestionModal(qId);
    });
  });

  document.querySelectorAll('.btn-delete-q').forEach(btn => {
    btn.addEventListener('click', function() {
      const qId = this.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this question from the active bank?')) {
        DB.deleteQuestion(qId);
        Toast.show('Deleted', 'Question removed successfully.', 'info');
        loadQuestionsTable(document.getElementById('admin-q-cat-filter')?.value || 'all');
        loadAdminMetrics();
      }
    });
  });
}

/**
 * Open Modal for Add or Edit
 */
function openQuestionModal(qId = null) {
  const modal = document.getElementById('question-modal-overlay');
  const title = document.getElementById('modal-q-title');
  const catField = document.getElementById('mq-category');
  const topicField = document.getElementById('mq-topic');
  const questionField = document.getElementById('mq-question');
  const optAField = document.getElementById('mq-opt-a');
  const optBField = document.getElementById('mq-opt-b');
  const optCField = document.getElementById('mq-opt-c');
  const optDField = document.getElementById('mq-opt-d');
  const correctField = document.getElementById('mq-correct');
  const explField = document.getElementById('mq-explanation');

  if (!modal) return;

  editingQuestionId = qId;

  if (qId) {
    // Edit Mode
    title.textContent = 'Edit Question';
    const all = DB.getAllQuestions();
    const q = all.find(item => item.id === qId);
    if (!q) return;

    catField.value = q.category;
    topicField.value = q.topic;
    questionField.value = q.question;
    optAField.value = q.options[0] || '';
    optBField.value = q.options[1] || '';
    optCField.value = q.options[2] || '';
    optDField.value = q.options[3] || '';
    correctField.value = q.correctIndex;
    explField.value = q.explanation || '';
  } else {
    // Add Mode
    title.textContent = 'Add New Placement Question';
    document.getElementById('form-question-crud').reset();
    correctField.value = '0';
  }

  modal.classList.add('active');
}

/**
 * Handle Save (Add / Update) Question
 */
function handleSaveQuestion(e) {
  e.preventDefault();

  const catField = document.getElementById('mq-category');
  const topicField = document.getElementById('mq-topic');
  const questionField = document.getElementById('mq-question');
  const optAField = document.getElementById('mq-opt-a');
  const optBField = document.getElementById('mq-opt-b');
  const optCField = document.getElementById('mq-opt-c');
  const optDField = document.getElementById('mq-opt-d');
  const correctField = document.getElementById('mq-correct');
  const explField = document.getElementById('mq-explanation');

  const category = catField.value;
  const topic = topicField.value.trim();
  const question = questionField.value.trim();
  const optA = optAField.value.trim();
  const optB = optBField.value.trim();
  const optC = optCField.value.trim();
  const optD = optDField.value.trim();
  const correctIndex = parseInt(correctField.value, 10);
  const explanation = explField.value.trim();

  if (!topic || !question || !optA || !optB || !optC || !optD || !explanation) {
    Toast.show('Incomplete Fields', 'Please complete all question fields, options, and explanation.', 'warning');
    return;
  }

  const questionPayload = {
    category: category,
    topic: topic,
    question: question,
    options: [optA, optB, optC, optD],
    correctIndex: correctIndex,
    explanation: explanation
  };

  if (editingQuestionId) {
    DB.updateQuestion(editingQuestionId, questionPayload);
    Toast.show('Updated', 'Question updated successfully.', 'success');
  } else {
    DB.addQuestion(questionPayload);
    Toast.show('Added', 'New question added to bank successfully.', 'success');
  }

  document.getElementById('question-modal-overlay').classList.remove('active');
  loadQuestionsTable(document.getElementById('admin-q-cat-filter')?.value || 'all');
  loadAdminMetrics();
}

/**
 * Load Test Audit Log
 */
function loadTestAuditTable(filterUserId = null) {
  const tbody = document.getElementById('admin-audit-tbody');
  if (!tbody) return;

  const history = DB.getAllTestHistory();
  const filtered = filterUserId ? history.filter(h => h.userId === filterUserId) : history;

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted p-4">No test records matching this filter.</td></tr>';
    return;
  }

  filtered.forEach((h, idx) => {
    const tr = document.createElement('tr');
    const formattedDate = h.date ? new Date(h.date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'N/A';

    let scoreBadge = 'badge-danger';
    if (h.scorePercent >= 80) scoreBadge = 'badge-success';
    else if (h.scorePercent >= 60) scoreBadge = 'badge-purple';
    else if (h.scorePercent >= 40) scoreBadge = 'badge-warning';

    tr.innerHTML = `
      <td><strong>#${idx + 1}</strong></td>
      <td><strong>${escapeHTML(h.userName || 'Student')}</strong></td>
      <td>${escapeHTML(h.categoryTitle || h.category)}</td>
      <td><span class="badge ${scoreBadge}">${h.scorePercent}%</span></td>
      <td><span class="text-success fw-bold">${h.correctCount}</span> / <span class="text-danger fw-bold">${h.wrongCount}</span></td>
      <td>${formattedDate}</td>
      <td>
        <a href="result.html?id=${h.id}" class="btn btn-sm btn-outline-primary" target="_blank">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Audit
        </a>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterAuditByUser(userId, userName) {
  const auditHeader = document.getElementById('audit-table-title');
  if (auditHeader) {
    auditHeader.innerHTML = `Audit Tests for: <span class="text-primary">${escapeHTML(userName)}</span> <button class="btn btn-sm btn-light ms-2" onclick="loadTestAuditTable(); document.getElementById('audit-table-title').textContent='All Student Test Results Log';">Reset Filter</button>`;
  }
  loadTestAuditTable(userId);
  document.getElementById('section-test-audit')?.scrollIntoView({ behavior: 'smooth' });
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
