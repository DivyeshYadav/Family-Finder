const state = {
  token: localStorage.getItem('token'),
  userId: localStorage.getItem('userId'),
  profileCreated: localStorage.getItem('profileCreated') === 'true',
  currentPage: 'home'
};

const API_BASE = 'http://localhost:5000/api';
const socket = io();

document.addEventListener('DOMContentLoaded', () => {
  renderApp();
  setupEventListeners();
  if (state.token) {
    loadNotifications();
  }
});

function renderApp() {
  const app = document.getElementById('app');
  if (!state.token) {
    app.innerHTML = getAuthPageHTML();
  } else {
    app.innerHTML = getMainAppHTML();
  }
}

function getAuthPageHTML() {
  return `
    <nav class="navbar navbar-expand-lg navbar-light">
      <div class="container-fluid px-4">
        <span class="navbar-brand">
          <i class="fas fa-users"></i> Family Finder
        </span>
      </div>
    </nav>

    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-8 col-lg-6">
          <div class="card shadow">
            <div class="card-body p-5">
              <h2 class="card-title text-center mb-4">
                <i class="fas fa-home text-primary"></i> Welcome
              </h2>
              <div id="authForm">
                <div class="form-group mb-3">
                  <label for="authEmail" class="form-label">Email</label>
                  <input type="email" id="authEmail" class="form-control" placeholder="your@email.com">
                </div>
                <div class="form-group mb-3">
                  <label for="authPassword" class="form-label">Password</label>
                  <input type="password" id="authPassword" class="form-control" placeholder="Password">
                </div>
                <div class="form-group mb-4">
                  <label for="authUsername" class="form-label">Username</label>
                  <input type="text" id="authUsername" class="form-control" placeholder="Username">
                </div>
                <div class="d-grid gap-3">
                  <button onclick="register()" class="btn btn-primary btn-lg">
                    <i class="fas fa-user-plus"></i> Register
                  </button>
                  <button onclick="login()" class="btn btn-outline-secondary btn-lg">
                    <i class="fas fa-sign-in-alt"></i> Login
                  </button>
                </div>
              </div>
              <div id="authMessage" class="mt-3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getMainAppHTML() {
  return `
    <nav class="navbar navbar-expand-lg navbar-light sticky-top">
      <div class="container-fluid px-4">
        <span class="navbar-brand">
          <i class="fas fa-users"></i> Family Finder
        </span>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a class="nav-link" href="#" onclick="goToPage('home')">
                <i class="fas fa-home"></i> Home
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" onclick="goToPage('familyTree')">
                <i class="fas fa-tree"></i> Family Tree
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" onclick="goToPage('notifications')">
                <i class="fas fa-bell"></i> Notifications
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" onclick="goToPage('profile')">
                <i class="fas fa-user"></i> ${state.profileCreated ? 'Profile' : 'Create Profile'}
              </a>
            </li>
            <li class="nav-item">
              <button class="nav-link btn btn-link text-danger" onclick="logout()" style="text-decoration: none;">
                <i class="fas fa-sign-out-alt"></i> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <div class="container-fluid px-4 py-4">
      <div id="homePage" class="page">${getHomePageHTML()}</div>
      <div id="familyTreePage" class="page" style="display:none;">${getFamilyTreePageHTML()}</div>
      <div id="notificationsPage" class="page" style="display:none;">${getNotificationsPageHTML()}</div>
      <div id="profilePage" class="page" style="display:none;">${getProfilePageHTML()}</div>
    </div>
  `;
}

function getHomePageHTML() {
  return `
    <div class="hero">
      <h1 class="mb-3">
        <i class="fas fa-users-line"></i> Welcome to Family Finder
      </h1>
      <p class="lead">Find your family members through relationship mapping</p>
      
      <div class="row g-4 mt-5">
        <div class="col-md-6 col-lg-3">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-user-check"></i>
            </div>
            <h3>Create Profile</h3>
            <p>Add your profile with photo and information</p>
          </div>
        </div>
        <div class="col-md-6 col-lg-3">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-sitemap"></i>
            </div>
            <h3>Add Family</h3>
            <p>Build your family tree with relations</p>
          </div>
        </div>
        <div class="col-md-6 col-lg-3">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-search"></i>
            </div>
            <h3>Find Matches</h3>
            <p>Discover potential family connections</p>
          </div>
        </div>
        <div class="col-md-6 col-lg-3">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-face-smile"></i>
            </div>
            <h3>AI Face Match</h3>
            <p>Match faces with your family members</p>
          </div>
        </div>
      </div>

      <div class="mt-5 p-4 bg-light rounded">
        <h4 class="mb-3">
          <i class="fas fa-lightbulb text-warning"></i> How It Works
        </h4>
        <ol class="mb-0">
          <li>Click on "Create Profile" to build your profile</li>
          <li>Add your family members to your family tree</li>
          <li>When you share 3+ members with someone, they appear in notifications!</li>
          <li>We'll also check if your faces match</li>
        </ol>
      </div>
    </div>
  `;
}

function getFamilyTreePageHTML() {
  return `
    <div class="family-tree-container">
      <div class="tree-header">
        <h2><i class="fas fa-tree"></i> Family Tree Editor</h2>
        <button class="add-member-btn" data-bs-toggle="offcanvas" data-bs-target="#addMemberOffcanvas">
          <i class="fas fa-user-plus"></i> Add Member
        </button>
      </div>

      <div class="offcanvas offcanvas-end" tabindex="-1" id="addMemberOffcanvas">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title">Add Family Member</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
        </div>
        <div class="offcanvas-body">
          <div id="familyTreeForm">
            <div class="form-group mb-3">
              <label for="memberName" class="form-label">Family Member Name</label>
              <input type="text" id="memberName" class="form-control" placeholder="e.g., John Smith">
            </div>
            <div class="form-group mb-3">
              <label for="memberRelation" class="form-label">Relation</label>
              <select id="memberRelation" class="form-select">
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Grandfather">Grandfather</option>
                <option value="Grandmother">Grandmother</option>
                <option value="Aunt">Aunt</option>
                <option value="Uncle">Uncle</option>
                <option value="Cousin">Cousin</option>
              </select>
            </div>
            <div class="form-group mb-4">
              <label for="memberDOB" class="form-label">Date of Birth</label>
              <input type="date" id="memberDOB" class="form-control">
            </div>
            <button onclick="addFamilyMember(); bootstrap.Offcanvas.getInstance(document.getElementById('addMemberOffcanvas')).hide();" class="btn btn-primary w-100">
              <i class="fas fa-plus"></i> Add Member
            </button>
          </div>
          <div id="treeMessage" class="mt-3"></div>
        </div>
      </div>

      <div id="familyMembersList" class="mt-4"></div>
    </div>
  `;
}

function getNotificationsPageHTML() {
  return `
    <div class="notifications-container">
      <h2 class="mb-4">
        <i class="fas fa-bell"></i> Notifications <span class="badge bg-danger" id="notificationCount">0</span>
      </h2>
      <div id="notificationsList" class="notifications-list"></div>
    </div>
  `;
}

function getProfilePageHTML() {
  return `
    <div class="row justify-content-center">
      <div class="col-12 col-lg-8">
        <div class="profile-card">
          <div class="profile-header"></div>
          <div class="profile-info">
            <div class="profile-picture-input mb-4">
              <img id="profilePicturePreview" class="profile-avatar rounded-circle" 
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23e0e0e0'/%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='48' fill='%23999'%3E👤%3C/text%3E%3C/svg%3E">
              <label for="profilePictureInput" class="file-input-label">
                <i class="fas fa-camera"></i> Upload Photo
              </label>
              <input type="file" id="profilePictureInput" accept="image/*">
            </div>

            <h3>${state.profileCreated ? 'Edit Your Profile' : 'Create Your Profile'}</h3>

            <div id="profileForm" class="mt-4">
              <div class="form-group mb-3">
                <label for="firstName" class="form-label">First Name</label>
                <input type="text" id="firstName" class="form-control" placeholder="First Name">
              </div>
              <div class="form-group mb-3">
                <label for="lastName" class="form-label">Last Name</label>
                <input type="text" id="lastName" class="form-control" placeholder="Last Name">
              </div>
              <div class="form-group mb-3">
                <label for="dateOfBirth" class="form-label">Date of Birth</label>
                <input type="date" id="dateOfBirth" class="form-control">
              </div>
              <div class="form-group mb-4">
                <label for="bio" class="form-label">Bio</label>
                <textarea id="bio" class="form-control" placeholder="Tell us about yourself..." rows="4"></textarea>
              </div>
              <button onclick="saveProfile()" class="btn btn-primary w-100 btn-lg">
                <i class="fas fa-save"></i> Save Profile
              </button>
            </div>
            <div id="profileMessage" class="mt-3"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function setupEventListeners() {
  const fileInput = document.getElementById('profilePictureInput');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        document.getElementById('profilePicturePreview').src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
}

function goToPage(page) {
  document.querySelectorAll('.page').forEach(p => {
    p.style.display = 'none';
  });
  document.getElementById(page + 'Page').style.display = 'block';
  
  // Close navbar
  const navbarCollapse = document.querySelector('.navbar-collapse');
  if (navbarCollapse.classList.contains('show')) {
    document.querySelector('.navbar-toggler').click();
  }
  
  state.currentPage = page;
  
  if (page === 'familyTree') {
    loadFamilyTree();
  } else if (page === 'profile') {
    loadProfile();
  } else if (page === 'notifications') {
    loadNotifications();
  }
}

function register() {
  const username = document.getElementById('authUsername').value;
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  
  if (!username || !email || !password) {
    showMessage('authMessage', 'Please fill all fields', 'danger');
    return;
  }
  
  fetch(API_BASE + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  })
  .then(r => r.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('profileCreated', 'false');
      state.token = data.token;
      state.userId = data.userId;
      renderApp();
      setupEventListeners();
    } else {
      showMessage('authMessage', data.message || 'Registration failed', 'danger');
    }
  })
  .catch(err => showMessage('authMessage', 'Error: ' + err.message, 'danger'));
}

function login() {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  
  if (!email || !password) {
    showMessage('authMessage', 'Please fill all fields', 'danger');
    return;
  }
  
  fetch(API_BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  .then(r => r.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('profileCreated', data.profileCreated);
      state.token = data.token;
      state.userId = data.userId;
      state.profileCreated = data.profileCreated;
      renderApp();
      setupEventListeners();
    } else {
      showMessage('authMessage', data.message || 'Login failed', 'danger');
    }
  })
  .catch(err => showMessage('authMessage', 'Error: ' + err.message, 'danger'));
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.clear();
    state.token = null;
    state.userId = null;
    renderApp();
  }
}

function saveProfile() {
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const dateOfBirth = document.getElementById('dateOfBirth').value;
  const bio = document.getElementById('bio').value;
  const profilePicture = document.getElementById('profilePicturePreview').src;
  
  if (!firstName || !lastName) {
    showMessage('profileMessage', 'Please fill in first and last name', 'danger');
    return;
  }
  
  fetch(API_BASE + '/profile/create-or-update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + state.token
    },
    body: JSON.stringify({
      firstName,
      lastName,
      dateOfBirth,
      bio,
      profilePicture
    })
  })
  .then(r => r.json())
  .then(data => {
    if (data.message) {
      localStorage.setItem('profileCreated', 'true');
      state.profileCreated = true;
      showMessage('profileMessage', 'Profile saved successfully!', 'success');
      fetch(API_BASE + '/notifications/check-matches', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + state.token }
      });
    }
  })
  .catch(err => showMessage('profileMessage', 'Error: ' + err.message, 'danger'));
}

function loadProfile() {
  fetch(API_BASE + '/profile/get/' + state.userId, {
    headers: { 'Authorization': 'Bearer ' + state.token }
  })
  .then(r => r.json())
  .then(data => {
    if (data.profile && data.profile.created) {
      document.getElementById('firstName').value = data.profile.firstName || '';
      document.getElementById('lastName').value = data.profile.lastName || '';
      document.getElementById('dateOfBirth').value = data.profile.dateOfBirth ? data.profile.dateOfBirth.split('T')[0] : '';
      document.getElementById('bio').value = data.profile.bio || '';
      if (data.profile.profilePicture) {
        document.getElementById('profilePicturePreview').src = data.profile.profilePicture;
      }
    }
  })
  .catch(err => console.error('Error loading profile:', err));
}

function addFamilyMember() {
  const name = document.getElementById('memberName').value;
  const relation = document.getElementById('memberRelation').value;
  const dateOfBirth = document.getElementById('memberDOB').value;
  
  if (!name) {
    showMessage('treeMessage', 'Please enter a name', 'danger');
    return;
  }
  
  fetch(API_BASE + '/family/add-member', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + state.token
    },
    body: JSON.stringify({ name, relation, dateOfBirth })
  })
  .then(r => r.json())
  .then(data => {
    showMessage('treeMessage', 'Family member added!', 'success');
    document.getElementById('memberName').value = '';
    document.getElementById('memberDOB').value = '';
    loadFamilyTree();
    fetch(API_BASE + '/notifications/check-matches', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + state.token }
    });
  })
  .catch(err => showMessage('treeMessage', 'Error: ' + err.message, 'danger'));
}

function loadFamilyTree() {
  fetch(API_BASE + '/family/get-tree', {
    headers: { 'Authorization': 'Bearer ' + state.token }
  })
  .then(r => r.json())
  .then(data => {
    const list = document.getElementById('familyMembersList');
    if (data.familyMembers && data.familyMembers.length > 0) {
      list.innerHTML = `
        <div class="row g-3">
          ${data.familyMembers.map(member => `
            <div class="col-12 col-md-6 col-lg-4">
              <div class="card family-member-card">
                <div class="card-body">
                  <h5 class="card-title">${member.name}</h5>
                  <p class="card-text">
                    <small class="text-muted">
                      <strong>Relation:</strong> ${member.relation}<br>
                      <strong>DOB:</strong> ${member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'Not specified'}
                    </small>
                  </p>
                  <div class="btn-group w-100" role="group">
                    <button class="btn btn-sm btn-outline-primary" onclick="editMember('${member._id}')">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteMember('${member._id}')">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      list.innerHTML = '<div class="alert alert-info text-center"><i class="fas fa-inbox"></i> No family members added yet</div>';
    }
  })
  .catch(err => console.error('Error loading family tree:', err));
}

function deleteMember(memberId) {
  if (!confirm('Are you sure you want to delete this member?')) return;
  
  fetch(API_BASE + '/family/delete-member/' + memberId, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + state.token }
  })
  .then(r => r.json())
  .then(data => {
    loadFamilyTree();
  })
  .catch(err => console.error('Error deleting member:', err));
}

function loadNotifications() {
  fetch(API_BASE + '/notifications/get', {
    headers: { 'Authorization': 'Bearer ' + state.token }
  })
  .then(r => r.json())
  .then(notifications => {
    const list = document.getElementById('notificationsList');
    const countBadge = document.getElementById('notificationCount');
    
    if (countBadge) {
      countBadge.textContent = notifications?.length || 0;
    }
    
    if (notifications && notifications.length > 0) {
      list.innerHTML = notifications.map(notif => `
        <div class="notification-card ${!notif.read ? 'unread' : ''}">
          <img src="${notif.userProfilePicture || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23ddd%22/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-size=%2748%27 fill=%27%23999%27%3E👤%3C/text%3E%3C/svg%3E'}" 
            class="notification-avatar" alt="${notif.userName}">
          <div class="notification-content">
            <h6 class="notification-title">He/She may be your family member!</h6>
            <p class="mb-2"><strong>${notif.userName}</strong></p>
            <div class="notification-matches">
              ${notif.matchedMembers.map(m => `<span class="match-badge">${m}</span>`).join('')}
              ${notif.faceMatch ? '<span class="match-badge bg-success"><i class="fas fa-check"></i> Face Match</span>' : ''}
            </div>
          </div>
          <button class="btn btn-sm btn-primary" onclick="viewProfile('${notif.userId}')">
            <i class="fas fa-eye"></i> View
          </button>
        </div>
      `).join('');
    } else {
      list.innerHTML = '<div class="alert alert-info text-center"><i class="fas fa-inbox"></i> No notifications yet. Check back later!</div>';
    }
  })
  .catch(err => console.error('Error loading notifications:', err));
}

function viewProfile(userId) {
  fetch(API_BASE + '/profile/get/' + userId, {
    headers: { 'Authorization': 'Bearer ' + state.token }
  })
  .then(r => r.json())
  .then(data => {
    const profile = data.profile;
    alert(`
👤 ${profile.firstName} ${profile.lastName}

📝 Bio: ${profile.bio || 'N/A'}

🎂 DOB: ${profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}
    `);
  })
  .catch(err => console.error('Error loading profile:', err));
}

function showMessage(elementId, message, type) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
  }
}
