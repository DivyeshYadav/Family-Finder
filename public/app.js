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
    <div class="container">
      <div class="card" style="max-width: 500px; margin: 50px auto;">
        <h2 style="text-align: center; color: #667eea; margin-bottom: 30px;">Family Finder</h2>
        <div id="authForm">
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="authEmail" placeholder="your@email.com">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="authPassword" placeholder="Password">
          </div>
          <div class="form-group">
            <label>Username</label>
            <input type="text" id="authUsername" placeholder="Username">
          </div>
          <button onclick="register()" style="width: 100%; margin-bottom: 10px;">Register</button>
          <button onclick="login()" class="btn-secondary" style="width: 100%;">Login</button>
        </div>
        <div id="authMessage"></div>
      </div>
    </div>
  `;
}

function getMainAppHTML() {
  return `
    <header>
      <div class="logo">
        <h1>👨‍👩‍👧‍👦 Family Finder</h1>
      </div>
      <button class="hamburger" onclick="toggleMenu()">☰</button>
      <div class="hamburger-menu" id="hamburgerMenu">
        <a onclick="goToPage('home')">Home</a>
        <a onclick="goToPage('familyTree')">Go to Family Tree</a>
        <a onclick="goToPage('notifications')">Notifications</a>
        <a onclick="goToPage('profile')">${state.profileCreated ? 'Edit Profile' : 'Make Profile'}</a>
        <button onclick="logout()">Logout</button>
      </div>
    </header>
    <div class="container">
      <div id="homePage" class="page active">${getHomePageHTML()}</div>
      <div id="familyTreePage" class="page">${getFamilyTreePageHTML()}</div>
      <div id="notificationsPage" class="page">${getNotificationsPageHTML()}</div>
      <div id="profilePage" class="page">${getProfilePageHTML()}</div>
    </div>
  `;
}

function getHomePageHTML() {
  return `
    <div class="card">
      <h2>Welcome to Family Finder! 👋</h2>
      <p>Find your family members through relationship mapping.</p>
      <h3>Get Started:</h3>
      <ol>
        <li>Click on "${state.profileCreated ? 'Edit' : 'Make'} Profile" to ${state.profileCreated ? 'update' : 'create'} your profile</li>
        <li>Add your family members to your family tree</li>
        <li>Check notifications for potential family matches</li>
        <li>View other profiles when you find a match!</li>
      </ol>
      <p style="margin-top: 20px; color: #666; font-size: 14px;">
        <strong>How it works:</strong> When you share 3 or more family members with someone, they'll appear in your notifications! 
        If you both have profile pictures, we'll also check if your faces match.
      </p>
    </div>
  `;
}

function getFamilyTreePageHTML() {
  return `
    <div class="card">
      <h2>Family Tree Editor</h2>
      <div id="familyTreeForm">
        <div class="form-group">
          <label>Family Member Name</label>
          <input type="text" id="memberName" placeholder="e.g., John Smith">
        </div>
        <div class="form-group">
          <label>Relation</label>
          <select id="memberRelation">
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
        <div class="form-group">
          <label>Date of Birth</label>
          <input type="date" id="memberDOB">
        </div>
        <button onclick="addFamilyMember()">Add Family Member</button>
      </div>
      <div id="familyMembersList" style="margin-top: 30px;"></div>
      <div id="treeMessage"></div>
    </div>
  `;
}

function getNotificationsPageHTML() {
  return `
    <div class="card">
      <h2>Notifications 🔔</h2>
      <div id="notificationsList" class="notifications-list"></div>
    </div>
  `;
}

function getProfilePageHTML() {
  return `
    <div class="profile-card">
      <h2>${state.profileCreated ? 'Edit Profile' : 'Create Profile'}</h2>
      <div id="profileForm">
        <div class="profile-picture-input">
          <img id="profilePicturePreview" class="profile-picture-preview" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23ddd'/%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='30' fill='%23999'%3E📷%3C/text%3E%3C/svg%3E" alt="Profile Picture">
          <label for="profilePictureInput" class="file-input-label">Upload Photo</label>
          <input type="file" id="profilePictureInput" accept="image/*">
        </div>
        <div class="form-group">
          <label>First Name</label>
          <input type="text" id="firstName" placeholder="First Name">
        </div>
        <div class="form-group">
          <label>Last Name</label>
          <input type="text" id="lastName" placeholder="Last Name">
        </div>
        <div class="form-group">
          <label>Date of Birth</label>
          <input type="date" id="dateOfBirth">
        </div>
        <div class="form-group">
          <label>Bio</label>
          <textarea id="bio" placeholder="Tell us about yourself..." rows="4"></textarea>
        </div>
        <button onclick="saveProfile()" style="width: 100%;">Save Profile</button>
      </div>
      <div id="profileMessage"></div>
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

function toggleMenu() {
  const menu = document.getElementById('hamburgerMenu');
  menu.classList.toggle('active');
  document.addEventListener('click', (e) => {
    if (!e.target.closest('header')) {
      menu.classList.remove('active');
    }
  });
}

function goToPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(page + 'Page').classList.add('active');
  document.getElementById('hamburgerMenu').classList.remove('active');
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
    showMessage('authMessage', 'Please fill all fields', 'error');
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
      showMessage('authMessage', data.message || 'Registration failed', 'error');
    }
  })
  .catch(err => showMessage('authMessage', 'Error: ' + err.message, 'error'));
}

function login() {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  if (!email || !password) {
    showMessage('authMessage', 'Please fill all fields', 'error');
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
      showMessage('authMessage', data.message || 'Login failed', 'error');
    }
  })
  .catch(err => showMessage('authMessage', 'Error: ' + err.message, 'error'));
}

function logout() {
  localStorage.clear();
  state.token = null;
  state.userId = null;
  renderApp();
}

function saveProfile() {
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const dateOfBirth = document.getElementById('dateOfBirth').value;
  const bio = document.getElementById('bio').value;
  const profilePicture = document.getElementById('profilePicturePreview').src;
  if (!firstName || !lastName) {
    showMessage('profileMessage', 'Please fill in first and last name', 'error');
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
  .catch(err => showMessage('profileMessage', 'Error: ' + err.message, 'error'));
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
    showMessage('treeMessage', 'Please enter a name', 'error');
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
  .catch(err => showMessage('treeMessage', 'Error: ' + err.message, 'error'));
}

function loadFamilyTree() {
  fetch(API_BASE + '/family/get-tree', {
    headers: { 'Authorization': 'Bearer ' + state.token }
  })
  .then(r => r.json())
  .then(data => {
    const list = document.getElementById('familyMembersList');
    if (data.familyMembers && data.familyMembers.length > 0) {
      list.innerHTML = data.familyMembers.map(member => `
        <div class="family-member-card">
          <div class="family-member-info">
            <h3>${member.name}</h3>
            <p><strong>Relation:</strong> ${member.relation}</p>
            <p><strong>DOB:</strong> ${member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'Not specified'}</p>
          </div>
          <div class="family-member-actions">
            <button class="btn-sm" onclick="editMember('${member._id}')">Edit</button>
            <button class="btn-sm btn-danger" onclick="deleteMember('${member._id}')">Delete</button>
          </div>
        </div>
      `).join('');
    } else {
      list.innerHTML = '<p style="color: #999; text-align: center;">No family members added yet</p>';
    }
  })
  .catch(err => console.error('Error loading family tree:', err));
}

function deleteMember(memberId) {
  if (!confirm('Are you sure?')) return;
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
    if (notifications && notifications.length > 0) {
      list.innerHTML = notifications.map(notif => `
        <div class="notification-item ${!notif.read ? 'unread' : ''}">
          <img src="${notif.userProfilePicture || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23ddd%22/%3E%3C/svg%3E'}" alt="User">
          <div class="notification-content">
            <p><strong>He/She may be your family member!</strong></p>
            <p><strong>Name:</strong> ${notif.userName}</p>
            <div class="matched-members">
              Matched: ${notif.matchedMembers.join(', ')}
              ${notif.faceMatch ? ' ✅ Face Match' : ''}
            </div>
          </div>
          <button class="btn-sm" onclick="viewProfile('${notif.userId}')">View Profile</button>
        </div>
      `).join('');
    } else {
      list.innerHTML = '<p style="color: #999; text-align: center;">No notifications yet. Check back later!</p>';
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
    alert(`
Name: ${data.profile.firstName} ${data.profile.lastName}
Bio: ${data.profile.bio || 'N/A'}
DOB: ${data.profile.dateOfBirth ? new Date(data.profile.dateOfBirth).toLocaleDateString() : 'N/A'}
    `);
  })
  .catch(err => console.error('Error loading profile:', err));
}

function showMessage(elementId, message, type) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `<div class="message ${type}">${message}</div>`;
  }
}
