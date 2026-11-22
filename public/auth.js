const tabButtons = document.querySelectorAll('.tab-btn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authMessage = document.getElementById('authMessage');

function showTab(tab) {
  tabButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.tab === tab);
  });
  loginForm.classList.toggle('hidden', tab !== 'login');
  registerForm.classList.toggle('hidden', tab !== 'register');
  authMessage.textContent = '';
}

tabButtons.forEach(button => {
  button.addEventListener('click', () => showTab(button.dataset.tab));
});

loginForm.addEventListener('submit', async event => {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed.');

    authMessage.textContent = data.message;
    authMessage.className = 'auth-message success';
    window.location.href = '/';
  } catch (error) {
    authMessage.textContent = error.message;
    authMessage.className = 'auth-message error';
  }
});

registerForm.addEventListener('submit', async event => {
  event.preventDefault();

  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Registration failed.');

    authMessage.textContent = data.message;
    authMessage.className = 'auth-message success';
    window.location.href = '/';
  } catch (error) {
    authMessage.textContent = error.message;
    authMessage.className = 'auth-message error';
  }
});
