/**
 * Smart Campus Placement Preparation Portal
 * Database Layer & Centralized LocalStorage State Manager
 * Preloaded with comprehensive Placement Questions across 4 Core Categories
 */

const DB_KEYS = {
  USERS: 'scpp_users_data',
  CURRENT_USER: 'scpp_active_session',
  QUESTIONS: 'scpp_question_bank',
  TEST_HISTORY: 'scpp_exam_results'
};

// Initial Seed Questions Bank covering all BCA placement topics
const INITIAL_QUESTIONS = [
  /* ==========================================
     CATEGORY: APTITUDE
     Topics: Percentage, Profit and Loss, Average, Time and Work,
             Number System, Simple Interest, Ratio and Proportion
     ========================================== */
  {
    id: 'apt-01',
    category: 'aptitude',
    topic: 'Percentage',
    question: 'If the price of sugar increases by 25%, by what percentage should a household reduce its consumption so that the expenditure remains unchanged?',
    options: ['20%', '25%', '16.66%', '30%'],
    correctIndex: 0,
    explanation: 'Required reduction = [r / (100 + r)] * 100% = [25 / (100 + 25)] * 100 = (25 / 125) * 100 = 20%.'
  },
  {
    id: 'apt-02',
    category: 'aptitude',
    topic: 'Profit and loss',
    question: 'A shopkeeper sells an article for ₹840 at a gain of 20%. What was the cost price of the article?',
    options: ['₹680', '₹700', '₹720', '₹750'],
    correctIndex: 1,
    explanation: 'Cost Price (CP) = Selling Price / (1 + Profit%) = 840 / 1.20 = ₹700.'
  },
  {
    id: 'apt-03',
    category: 'aptitude',
    topic: 'Average',
    question: 'The average weight of 8 students increases by 1.5 kg when a new student replaces one weighing 65 kg. What is the weight of the new student?',
    options: ['75 kg', '77 kg', '79 kg', '81 kg'],
    correctIndex: 1,
    explanation: 'Total increase in weight = 8 * 1.5 kg = 12 kg. Weight of new student = Old weight + Total increase = 65 + 12 = 77 kg.'
  },
  {
    id: 'apt-04',
    category: 'aptitude',
    topic: 'Time and work',
    question: 'A can complete a piece of work in 12 days and B can complete it in 18 days. If they work together, how many days will they take to complete the work?',
    options: ['6.5 days', '7.2 days', '8 days', '9.5 days'],
    correctIndex: 1,
    explanation: 'Combined 1 day work = 1/12 + 1/18 = (3 + 2)/36 = 5/36. Total days needed = 36/5 = 7.2 days.'
  },
  {
    id: 'apt-05',
    category: 'aptitude',
    topic: 'Number system',
    question: 'What is the unit digit in the product (781 * 349 * 426 * 115)?',
    options: ['0', '5', '6', '1'],
    correctIndex: 0,
    explanation: 'Notice unit digits: 1 * 9 * 6 * 5. Here 6 * 5 = 30 (unit digit 0). Multiplying any whole number by 0 gives unit digit 0.'
  },
  {
    id: 'apt-06',
    category: 'aptitude',
    topic: 'Simple interest',
    question: 'At what rate of simple interest per annum will a sum of money double itself in 8 years?',
    options: ['10%', '11.5%', '12.5%', '15%'],
    correctIndex: 2,
    explanation: 'If principal is P and Amount is 2P, SI = P. Formula: SI = (P * R * T)/100 => P = (P * R * 8)/100 => R = 100 / 8 = 12.5%.'
  },
  {
    id: 'apt-07',
    category: 'aptitude',
    topic: 'Ratio and proportion',
    question: 'Two numbers are in the ratio 3 : 5. If 9 is subtracted from each, the new ratio becomes 12 : 23. Find the smaller number.',
    options: ['27', '33', '36', '45'],
    correctIndex: 1,
    explanation: 'Let numbers be 3x and 5x. (3x - 9)/(5x - 9) = 12/23. 23(3x - 9) = 12(5x - 9) => 69x - 207 = 60x - 108 => 9x = 99 => x = 11. Smaller number = 3 * 11 = 33.'
  },
  {
    id: 'apt-08',
    category: 'aptitude',
    topic: 'Percentage',
    question: 'A student scored 32% marks and failed by 12 marks. Another student scored 42% and got 28 marks more than the pass mark. What is the maximum mark?',
    options: ['300', '400', '500', '600'],
    correctIndex: 1,
    explanation: 'Difference in percentage = 42% - 32% = 10%. Difference in marks = 28 - (-12) = 40. Since 10% = 40 marks, 100% = 400 marks.'
  },

  /* ==========================================
     CATEGORY: LOGICAL REASONING
     Topics: Number series, Coding and decoding, Blood relations,
             Direction sense, Odd one out, Logical puzzles
     ========================================== */
  {
    id: 'rea-01',
    category: 'reasoning',
    topic: 'Number series',
    question: 'Find the next number in the series: 3, 7, 15, 31, 63, ?',
    options: ['125', '127', '129', '131'],
    correctIndex: 1,
    explanation: 'Pattern: Each term is (2 * previous term) + 1. (63 * 2) + 1 = 126 + 1 = 127.'
  },
  {
    id: 'rea-02',
    category: 'reasoning',
    topic: 'Coding and decoding',
    question: 'In a certain code, COMPUTER is written as RFUVQNPC. How is MEDICINE written in that code?',
    options: ['EOJDEJFM', 'MFEJDJOE', 'EOJDJEFM', 'EMDJOFJE'],
    correctIndex: 2,
    explanation: 'Reverse the order of letters and then shift each letter: C-O-M-P-U-T-E-R becomes R-E-T-U-P-M-O-C. The ends remain R and C while internal letters shift by +1. Following the identical pattern for MEDICINE yields EOJDJEFM.'
  },
  {
    id: 'rea-03',
    category: 'reasoning',
    topic: 'Blood relations',
    question: 'Pointing to a photograph, Rohit said, "She is the daughter of the only son of my grandfather." How is Rohit related to the girl?',
    options: ['Brother', 'Father', 'Uncle', 'Cousin'],
    correctIndex: 0,
    explanation: 'The only son of Rohit\'s grandfather is Rohit\'s father. The daughter of Rohit\'s father is Rohit\'s sister. Therefore, Rohit is her brother.'
  },
  {
    id: 'rea-04',
    category: 'reasoning',
    topic: 'Direction sense',
    question: 'A man walks 5 km East, turns right and walks 3 km, then turns right again and walks 9 km. How far is he from his starting point?',
    options: ['3 km', '4 km', '5 km', '7 km'],
    correctIndex: 2,
    explanation: 'Net displacement in East-West = 5 km East - 9 km West = -4 km (West). Net displacement in North-South = 3 km South. By Pythagoras theorem: √(4² + 3²) = √(16 + 9) = √25 = 5 km.'
  },
  {
    id: 'rea-05',
    category: 'reasoning',
    topic: 'Odd one out',
    question: 'Find the odd one out among the given options: 27, 64, 125, 144, 216',
    options: ['27', '64', '144', '216'],
    correctIndex: 2,
    explanation: '27 = 3³, 64 = 4³, 125 = 5³, 216 = 6³ are all perfect cubes. 144 is 12² (a square, not a cube of an integer).'
  },
  {
    id: 'rea-06',
    category: 'reasoning',
    topic: 'Logical puzzles',
    question: 'Five colleagues (P, Q, R, S, T) sit in a row. S is to the immediate right of Q. P is between R and T. If R is at the extreme left end and Q is next to T, who sits in the middle?',
    options: ['P', 'Q', 'T', 'S'],
    correctIndex: 2,
    explanation: 'R is at extreme left. P is between R and T => Order so far: R - P - T. Q is next to T and S is to the right of Q => R - P - T - Q - S. The person in the middle (3rd position) is T.'
  },
  {
    id: 'rea-07',
    category: 'reasoning',
    topic: 'Number series',
    question: 'What comes next: 2, 6, 12, 20, 30, 42, ?',
    options: ['52', '56', '60', '64'],
    correctIndex: 1,
    explanation: 'Differences are 4, 6, 8, 10, 12. Next difference is 14. 42 + 14 = 56. (Also represents n² + n for n = 1, 2, 3, 4, 5, 6, 7 => 7² + 7 = 56).'
  },
  {
    id: 'rea-08',
    category: 'reasoning',
    topic: 'Direction sense',
    question: 'Anil starts walking facing the Sun early in the morning. After 10m, he turns left and walks 5m. In which direction is he facing now?',
    options: ['East', 'West', 'North', 'South'],
    correctIndex: 2,
    explanation: 'In the morning the Sun is in the East. Walking towards the Sun means heading East. Turning left from East points to North.'
  },

  /* ==========================================
     CATEGORY: VERBAL ABILITY
     Topics: English grammar, Synonyms and antonyms, Sentence correction,
             Vocabulary, Reading comprehension
     ========================================== */
  {
    id: 'vbl-01',
    category: 'verbal',
    topic: 'English grammar',
    question: 'Choose the correct preposition: "Neither the manager nor the employees _____ present at the board meeting yesterday."',
    options: ['was', 'were', 'is', 'are'],
    correctIndex: 1,
    explanation: 'With "neither...nor", the verb agrees with the subject closest to it. Here, "employees" is plural and the event is past tense ("yesterday"), so "were" is correct.'
  },
  {
    id: 'vbl-02',
    category: 'verbal',
    topic: 'Synonyms and antonyms',
    question: 'Select the synonym of the word CANDID:',
    options: ['Secretive', 'Frank', 'Deceitful', 'Hesitant'],
    correctIndex: 1,
    explanation: 'Candid means truthful, straightforward, and outspoken. The exact synonym is "Frank".'
  },
  {
    id: 'vbl-03',
    category: 'verbal',
    topic: 'Sentence correction',
    question: 'Identify the error in: "One of my friend (A) / is working (B) / as a software engineer (C) / in Bangalore (D)."',
    options: ['Part A', 'Part B', 'Part C', 'Part D'],
    correctIndex: 0,
    explanation: 'The phrase "One of..." is always followed by a plural noun. It must be "One of my friends", hence Part A is incorrect.'
  },
  {
    id: 'vbl-04',
    category: 'verbal',
    topic: 'Vocabulary',
    question: 'What is the antonym of the word METICULOUS?',
    options: ['Careful', 'Precise', 'Careless', 'Diligent'],
    correctIndex: 2,
    explanation: 'Meticulous means showing great attention to detail. Its opposite is "Careless" or negligent.'
  },
  {
    id: 'vbl-05',
    category: 'verbal',
    topic: 'English grammar',
    question: 'Choose the correct form: "Hardly had we reached the examination hall _____ the bell rang."',
    options: ['than', 'when', 'then', 'before'],
    correctIndex: 1,
    explanation: 'The correlative conjunction pair is "Hardly / Scarcely ... when". ("No sooner" takes "than").'
  },
  {
    id: 'vbl-06',
    category: 'verbal',
    topic: 'Reading comprehension',
    question: 'In the sentence: "The candidate demonstrated exemplary tenacity throughout the rigorous internship", what does TENACITY convey?',
    options: ['Persistence and determination', 'Carelessness', 'Humility', 'Incompetence'],
    correctIndex: 0,
    explanation: 'Tenacity denotes persistent determination, perseverance, and firmness of purpose.'
  },
  {
    id: 'vbl-07',
    category: 'verbal',
    topic: 'Synonyms and antonyms',
    question: 'Find the antonym of the word EPHEMERAL:',
    options: ['Transient', 'Permanent', 'Fleeting', 'Brief'],
    correctIndex: 1,
    explanation: 'Ephemeral means lasting for a very short time. The antonym is "Permanent" or eternal.'
  },
  {
    id: 'vbl-08',
    category: 'verbal',
    topic: 'Vocabulary',
    question: 'Fill in the blank with the most appropriate idiom: "After months of hard preparation, the placement results came as a breath of _____."',
    options: ['fresh air', 'cold water', 'sweet wind', 'warm sun'],
    correctIndex: 0,
    explanation: 'The standard idiomatic expression is "a breath of fresh air", which means a refreshing, pleasant change.'
  },

  /* ==========================================
     CATEGORY: PROGRAMMING PRACTICE
     Topics: Java fundamentals, C programming basics, HTML and CSS,
             JavaScript fundamentals, Output-based questions, Basic logic
     ========================================== */
  {
    id: 'prg-01',
    category: 'programming',
    topic: 'C programming basics',
    question: 'What will be the output of the following C code snippet?\nint a = 5;\nprintf("%d %d %d", a, ++a, a++);',
    options: ['5 6 6', '7 7 5', 'Undefined behavior / Compiler dependent', '5 7 7'],
    correctIndex: 2,
    explanation: 'In C, modifying a variable multiple times in an unsequenced expression (like printf arguments) violates sequence point rules and results in Undefined Behavior.'
  },
  {
    id: 'prg-02',
    category: 'programming',
    topic: 'Java fundamentals',
    question: 'Which of the following OOP concepts in Java enables runtime polymorphism?',
    options: ['Method Overloading', 'Method Overriding', 'Encapsulation', 'Abstraction with interfaces only'],
    correctIndex: 1,
    explanation: 'Runtime polymorphism (dynamic method dispatch) is achieved in Java when a subclass overrides a superclass method and the call is resolved at runtime based on object type.'
  },
  {
    id: 'prg-03',
    category: 'programming',
    topic: 'JavaScript fundamentals',
    question: 'What is the output of the JavaScript expression: console.log(typeof NaN); ?',
    options: ['"undefined"', '"nan"', '"number"', '"object"'],
    correctIndex: 2,
    explanation: 'In JavaScript specification (IEEE 754), NaN stands for "Not-a-Number", but its programmatic data type is technically "number".'
  },
  {
    id: 'prg-04',
    category: 'programming',
    topic: 'HTML and CSS',
    question: 'Which CSS property is used in modern web layouts to create a flexible one-dimensional row or column system?',
    options: ['display: grid', 'display: flex', 'float: left', 'position: relative'],
    correctIndex: 1,
    explanation: 'Flexbox (`display: flex`) is designed for one-dimensional layouts (row or column), whereas CSS Grid is two-dimensional (rows and columns simultaneously).'
  },
  {
    id: 'prg-05',
    category: 'programming',
    topic: 'Java fundamentals',
    question: 'Why are String objects immutable in Java?',
    options: ['For security, caching in the String Constant Pool, and thread safety', 'Because the char array is declared public', 'To prevent inheritance from Object class', 'To reduce JVM memory to zero'],
    correctIndex: 0,
    explanation: 'Strings are immutable in Java so they can safely reside in the String Pool, be shared across threads without synchronization, and guarantee security for network/database parameters.'
  },
  {
    id: 'prg-06',
    category: 'programming',
    topic: 'Output-based questions',
    question: 'What will the following JavaScript code output?\nconsole.log(1 + "2" + 3);',
    options: ['6', '"123"', '"33"', 'Error'],
    correctIndex: 1,
    explanation: 'Operations execute left-to-right. 1 + "2" triggers string concatenation resulting in "12". Then "12" + 3 triggers string concatenation giving "123".'
  },
  {
    id: 'prg-07',
    category: 'programming',
    topic: 'C programming basics',
    question: 'In C, what is the size of a pointer variable on a standard 64-bit architecture?',
    options: ['2 bytes', '4 bytes', '8 bytes', '16 bytes'],
    correctIndex: 2,
    explanation: 'On a 64-bit architecture, a memory address is 64 bits wide, which equals 8 bytes regardless of the pointer data type (int*, char*, etc.).'
  },
  {
    id: 'prg-08',
    category: 'programming',
    topic: 'Basic programming logic',
    question: 'What is the worst-case time complexity of searching an element in a balanced Binary Search Tree (BST) having n elements?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctIndex: 1,
    explanation: 'In a balanced BST, the height is approximately log₂(n), so search, insertion, and deletion operations take O(log n) time in the worst case.'
  }
];

// Preloaded Demo Accounts
const INITIAL_USERS = [
  {
    id: 'usr-admin',
    name: 'Placement Administrator',
    email: 'admin@smartcampus.edu',
    password: 'admin123',
    role: 'admin',
    college: 'BCA Placement Cell',
    registeredDate: '2026-10-01'
  },
  {
    id: 'usr-student-01',
    name: 'Rahul Sharma',
    email: 'student@smartcampus.edu',
    password: 'student123',
    role: 'student',
    college: 'Government Science & BCA College',
    registeredDate: '2026-10-15'
  }
];

// Helper to construct preloaded question logs for demo test results
function buildDemoHistoryQuestions(questionIds, wrongIndices = []) {
  return questionIds.map((id, index) => {
    const q = INITIAL_QUESTIONS.find(item => item.id === id);
    if (!q) return null;
    const isWrong = wrongIndices.includes(index);
    const studentChoice = isWrong ? (q.correctIndex === 0 ? 1 : 0) : q.correctIndex;
    return {
      questionId: q.id,
      question: q.question,
      category: q.category,
      topic: q.topic,
      options: q.options,
      correctIndex: q.correctIndex,
      studentChoice: studentChoice,
      isCorrect: !isWrong,
      isUnanswered: false,
      explanation: q.explanation
    };
  }).filter(Boolean);
}

// Preloaded test history for demo student to make dashboard stats immediately rich
const INITIAL_HISTORY = [
  {
    id: 'hist-001',
    userId: 'usr-student-01',
    userName: 'Rahul Sharma',
    category: 'aptitude',
    categoryTitle: 'Aptitude Practice Test',
    totalQuestions: 6,
    correctCount: 5,
    wrongCount: 1,
    unansweredCount: 0,
    scorePercent: 83.3,
    timeTakenSeconds: 320,
    date: '2026-11-10T11:30:00Z',
    questions: buildDemoHistoryQuestions(['apt-01', 'apt-02', 'apt-03', 'apt-04', 'apt-05', 'apt-06'], [3])
  },
  {
    id: 'hist-002',
    userId: 'usr-student-01',
    userName: 'Rahul Sharma',
    category: 'programming',
    categoryTitle: 'Core Technical Assessment',
    totalQuestions: 6,
    correctCount: 6,
    wrongCount: 0,
    unansweredCount: 0,
    scorePercent: 100,
    timeTakenSeconds: 240,
    date: '2026-11-12T14:15:00Z',
    questions: buildDemoHistoryQuestions(['prg-01', 'prg-02', 'prg-03', 'prg-04', 'prg-05', 'prg-06'], [])
  },
  {
    id: 'hist-003',
    userId: 'usr-student-01',
    userName: 'Rahul Sharma',
    category: 'reasoning',
    categoryTitle: 'Logical Reasoning Mock',
    totalQuestions: 6,
    correctCount: 4,
    wrongCount: 2,
    unansweredCount: 0,
    scorePercent: 66.7,
    timeTakenSeconds: 380,
    date: '2026-11-14T09:45:00Z',
    questions: buildDemoHistoryQuestions(['rea-01', 'rea-02', 'rea-03', 'rea-04', 'rea-05', 'rea-06'], [1, 4])
  }
];

// Central Database API
const DB = {
  // Initialize storage if empty
  init: function() {
    try {
      if (!localStorage.getItem(DB_KEYS.USERS)) {
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      }
      if (!localStorage.getItem(DB_KEYS.QUESTIONS)) {
        localStorage.setItem(DB_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
      }
      if (!localStorage.getItem(DB_KEYS.TEST_HISTORY)) {
        localStorage.setItem(DB_KEYS.TEST_HISTORY, JSON.stringify(INITIAL_HISTORY));
      }
    } catch (e) {
      console.error('LocalStorage initialization error:', e);
    }
  },

  // User Management
  getUsers: function() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.USERS)) || [];
    } catch (e) {
      return [];
    }
  },

  saveUser: function(userObj) {
    const users = this.getUsers();
    // Check duplicate email
    const exists = users.some(u => u.email.toLowerCase() === userObj.email.toLowerCase());
    if (exists) {
      return { success: false, message: 'This email address is already registered.' };
    }
    userObj.id = 'usr-' + Date.now();
    userObj.registeredDate = new Date().toISOString().split('T')[0];
    users.push(userObj);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    return { success: true, user: userObj };
  },

  findUserByEmail: function(email) {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  // Session Management
  getCurrentUser: function() {
    try {
      const session = localStorage.getItem(DB_KEYS.CURRENT_USER);
      return session ? JSON.parse(session) : null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser: function(user) {
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'student',
      college: user.college || 'BCA College'
    };
    localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(safeUser));
  },

  logout: function() {
    localStorage.removeItem(DB_KEYS.CURRENT_USER);
  },

  // Question Bank Operations
  getAllQuestions: function() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.QUESTIONS)) || [];
    } catch (e) {
      return [];
    }
  },

  getQuestionsByCategory: function(category) {
    const all = this.getAllQuestions();
    if (!category || category === 'all') return all;
    return all.filter(q => q.category.toLowerCase() === category.toLowerCase());
  },

  addQuestion: function(questionObj) {
    const questions = this.getAllQuestions();
    questionObj.id = 'q-' + Date.now();
    questions.push(questionObj);
    localStorage.setItem(DB_KEYS.QUESTIONS, JSON.stringify(questions));
    return questionObj;
  },

  updateQuestion: function(id, updatedData) {
    const questions = this.getAllQuestions();
    const index = questions.findIndex(q => q.id === id);
    if (index !== -1) {
      questions[index] = { ...questions[index], ...updatedData };
      localStorage.setItem(DB_KEYS.QUESTIONS, JSON.stringify(questions));
      return true;
    }
    return false;
  },

  deleteQuestion: function(id) {
    let questions = this.getAllQuestions();
    questions = questions.filter(q => q.id !== id);
    localStorage.setItem(DB_KEYS.QUESTIONS, JSON.stringify(questions));
    return true;
  },

  resetDefaultQuestions: function() {
    localStorage.setItem(DB_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
    return INITIAL_QUESTIONS;
  },

  // Test Results Management
  saveTestResult: function(resultObj) {
    this.init();
    const history = this.getAllTestHistory();
    resultObj.id = 'hist-' + Date.now();
    resultObj.date = new Date().toISOString();
    history.unshift(resultObj); // Add newest first
    localStorage.setItem(DB_KEYS.TEST_HISTORY, JSON.stringify(history));
    return resultObj;
  },

  getAllTestHistory: function() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.TEST_HISTORY)) || [];
    } catch (e) {
      return [];
    }
  },

  getUserTestHistory: function(userId) {
    const all = this.getAllTestHistory();
    return all.filter(h => h.userId === userId);
  },

  // Aggregate Metrics for a Student
  getStudentMetrics: function(userId) {
    const history = this.getUserTestHistory(userId);
    const totalTests = history.length;
    if (totalTests === 0) {
      return {
        totalTests: 0,
        averageScore: 0,
        highestScore: 0,
        totalQuestionsAttempted: 0,
        categoryPerformance: {
          aptitude: 0,
          reasoning: 0,
          verbal: 0,
          programming: 0
        }
      };
    }

    const scores = history.map(h => Number(h.scorePercent) || 0);
    const sumScore = scores.reduce((a, b) => a + b, 0);
    const highestScore = Math.max(...scores);
    const totalQuestionsAttempted = history.reduce((sum, h) => sum + (h.totalQuestions || 0), 0);

    // Subject breakdown
    const categories = ['aptitude', 'reasoning', 'verbal', 'programming'];
    const catPerf = {};
    categories.forEach(cat => {
      const catTests = history.filter(h => h.category === cat);
      if (catTests.length > 0) {
        const catAvg = catTests.reduce((sum, t) => sum + Number(t.scorePercent), 0) / catTests.length;
        catPerf[cat] = Math.round(catAvg);
      } else {
        catPerf[cat] = 0;
      }
    });

    return {
      totalTests: totalTests,
      averageScore: Math.round(sumScore / totalTests),
      highestScore: Math.round(highestScore),
      totalQuestionsAttempted: totalQuestionsAttempted,
      categoryPerformance: catPerf
    };
  }
};

// Global Toast System
const Toast = {
  container: null,

  initContainer: function() {
    if (!this.container) {
      let el = document.getElementById('toast-container');
      if (!el) {
        el = document.createElement('div');
        el.id = 'toast-container';
        el.className = 'toast-container';
        document.body.appendChild(el);
      }
      this.container = el;
    }
  },

  show: function(title, message, type = 'info', duration = 3500) {
    this.initContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-solid fa-circle-info';
    if (type === 'success') iconClass = 'fa-solid fa-circle-check';
    if (type === 'danger') iconClass = 'fa-solid fa-circle-exclamation';
    if (type === 'warning') iconClass = 'fa-solid fa-triangle-exclamation';

    toast.innerHTML = `
      <i class="${iconClass} toast-icon"></i>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 300);
    }, duration);
  }
};

// Auto-run DB initialize
DB.init();
