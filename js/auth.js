/**
 * Smart Campus Placement Preparation Portal
 * Authentication, Form Validation & Session Guard Module
 */

document.addEventListener('DOMContentLoaded', function() {
  initAuthUI();
});

function initAuthUI() {
  // Tab Switching between Login & Register (if present on auth.html)
  const tabLogin = document.getElementById('tab-login-btn');
  const tabRegister = document.getElementById('tab-register-btn');
  const formLogin = document.getElementById('login-form-container');
  const formRegister = document.getElementById('register-form-container');

  if (tabLogin && tabRegister && formLogin && formRegister) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      formLogin.style.display = 'block';
      formRegister.style.display = 'none';
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      formRegister.style.display = 'block';
      formLogin.style.display = 'none';
    });

    // Handle URL parameters like ?action=register or ?role=demo
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'register') {
      tabRegister.click();
    }
  }

  // Quick Demo Auto-Fill Handlers
  const btnDemoStudent = document.getElementById('btn-demo-student');
  const btnDemoAdmin = document.getElementById('btn-demo-admin');
  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');

  if (btnDemoStudent && emailInput && passInput) {
    btnDemoStudent.addEventListener('click', () => {
      if (tabLogin) tabLogin.click();
      emailInput.value = 'student@smartcampus.edu';
      passInput.value = 'student123';
      Toast.show('Demo Credentials Loaded', 'Student credentials filled. Click "Sign In" to proceed.', 'info');
    });
  }

  if (btnDemoAdmin && emailInput && passInput) {
    btnDemoAdmin.addEventListener('click', () => {
      if (tabLogin) tabLogin.click();
      emailInput.value = 'admin@smartcampus.edu';
      passInput.value = 'admin123';
      Toast.show('Demo Credentials Loaded', 'Admin credentials filled. Click "Sign In" to proceed.', 'info');
    });
  }

  // Auto-fill if demo parameter is present in URL
  const queryParams = new URLSearchParams(window.location.search);
  if (queryParams.get('role') === 'demo' || queryParams.get('demo') === 'student') {
    if (btnDemoStudent) btnDemoStudent.click();
  } else if (queryParams.get('role') === 'admin' || queryParams.get('demo') === 'admin') {
    if (btnDemoAdmin) btnDemoAdmin.click();
  }

  // Bind Form Submissions
  const loginForm = document.getElementById('form-login');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  const registerForm = document.getElementById('form-register');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  // Setup Sidebar User Info and Logout if present
  renderSessionInfo();
}

/**
 * Handle Student / Admin Login
 */
function handleLogin(e) {
  e.preventDefault();

  const emailField = document.getElementById('login-email');
  const passField = document.getElementById('login-password');

  const email = emailField.value.trim();
  const password = passField.value.trim();

  // Reset feedback
  resetFeedback([emailField, passField]);

  let isValid = true;
  if (!email || !isValidEmail(email)) {
    showError(emailField, 'Please enter a valid email address.');
    isValid = false;
  }

  if (!password) {
    showError(passField, 'Please enter your password.');
    isValid = false;
  }

  if (!isValid) return;

  // Verify against DB
  const user = DB.findUserByEmail(email);

  if (!user || user.password !== password) {
    Toast.show('Login Failed', 'Invalid email address or password. Please try again.', 'danger');
    showError(passField, 'Invalid credentials');
    return;
  }

  // Save session
  DB.setCurrentUser(user);
  Toast.show('Welcome Back!', `Logged in successfully as ${user.name}`, 'success');

  setTimeout(() => {
    if (user.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'dashboard.html';
    }
  }, 700);
}

/**
 * Handle Student Registration with Validations
 */
function handleRegister(e) {
  e.preventDefault();

  const nameField = document.getElementById('reg-name');
  const emailField = document.getElementById('reg-email');
  const collegeField = document.getElementById('reg-college');
  const passField = document.getElementById('reg-password');
  const confirmPassField = document.getElementById('reg-confirm-password');

  const name = nameField.value.trim();
  const email = emailField.value.trim();
  const college = collegeField ? collegeField.value.trim() : 'BCA';
  const password = passField.value.trim();
  const confirmPassword = confirmPassField.value.trim();

  resetFeedback([nameField, emailField, passField, confirmPassField]);

  let isValid = true;

  if (!name || name.length < 3) {
    showError(nameField, 'Full name must contain at least 3 characters.');
    isValid = false;
  }

  if (!email || !isValidEmail(email)) {
    showError(emailField, 'Please provide a valid college or personal email.');
    isValid = false;
  }

  if (!password || password.length < 6) {
    showError(passField, 'Password must be at least 6 characters long.');
    isValid = false;
  }

  if (password !== confirmPassword) {
    showError(confirmPassField, 'Passwords do not match.');
    isValid = false;
  }

  if (!isValid) return;

  // Check duplicate email
  const existing = DB.findUserByEmail(email);
  if (existing) {
    showError(emailField, 'This email address is already registered. Please log in.');
    Toast.show('Registration Failed', 'Email address already exists in system.', 'warning');
    return;
  }

  // Create new student
  const newStudent = {
    name: name,
    email: email,
    college: college || 'BCA Student',
    password: password,
    role: 'student'
  };

  const res = DB.saveUser(newStudent);
  if (res.success) {
    DB.setCurrentUser(res.user);
    Toast.show('Account Created!', 'Registration successful. Redirecting to your dashboard...', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 900);
  } else {
    Toast.show('Error', res.message, 'danger');
  }
}

/**
 * Email Regex Validator
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Form Validation Error Presentation Helpers
 */
function showError(inputElement, message) {
  inputElement.classList.add('is-invalid');
  const parent = inputElement.closest('.form-group');
  if (parent) {
    let feedback = parent.querySelector('.invalid-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      parent.appendChild(feedback);
    }
    feedback.textContent = message;
    feedback.classList.add('show');
  }
}

function resetFeedback(inputElements) {
  inputElements.forEach(el => {
    if (el) {
      el.classList.remove('is-invalid');
      const parent = el.closest('.form-group');
      if (parent) {
        const feedback = parent.querySelector('.invalid-feedback');
        if (feedback) feedback.classList.remove('show');
      }
    }
  });
}

/**
 * Global Route Authentication Guard
 */
function requireAuth(allowedRoles = ['student', 'admin']) {
  const user = DB.getCurrentUser();
  if (!user) {
    alert('Please sign in or register to access the placement preparation portal.');
    window.location.href = 'auth.html';
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    alert('Unauthorized: You do not have permission to view this administrative page.');
    window.location.href = 'dashboard.html';
    return null;
  }

  return user;
}

/**
 * Render Active Session Data in Portal Sidebar / Header
 */
function renderSessionInfo() {
  const user = DB.getCurrentUser();
  const userNameElements = document.querySelectorAll('.session-user-name');
  const userRoleElements = document.querySelectorAll('.session-user-role');
  const userAvatarElements = document.querySelectorAll('.session-user-avatar');

  if (user) {
    userNameElements.forEach(el => el.textContent = user.name);
    userRoleElements.forEach(el => el.textContent = user.role === 'admin' ? 'Placement Officer / Admin' : (user.college || 'BCA Scholar'));
    userAvatarElements.forEach(el => {
      const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      el.textContent = initials || 'ST';
    });
  }

  // Bind logout buttons
  const logoutButtons = document.querySelectorAll('.btn-logout-trigger');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to log out from Smart Campus Placement Portal?')) {
        DB.logout();
        Toast.show('Logged Out', 'You have been logged out securely.', 'info');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 500);
      }
    });
  });
}
