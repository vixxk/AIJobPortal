import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isLoggingOut = false;

const showSessionExpiredModal = (message) => {
  if (typeof document === 'undefined') return;

  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-[99999] flex items-center justify-center p-4';
  
  // Backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-500 ease-out opacity-0';
  modal.appendChild(backdrop);

  // Card container
  const card = document.createElement('div');
  card.className = 'relative w-full max-w-sm bg-white/95 dark:bg-slate-900/95 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-2xl z-10 text-center flex flex-col items-center transform scale-95 translate-y-4 opacity-0 transition-all duration-500 ease-out backdrop-blur-lg';
  
  // Icon
  const iconDiv = document.createElement('div');
  iconDiv.className = 'w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-500 mb-6 shadow-md shadow-rose-100/50 dark:shadow-none animate-bounce';
  iconDiv.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-2h2zm0-4h-2V7h2z"/>
    </svg>
  `;
  card.appendChild(iconDiv);

  // Title
  const title = document.createElement('h3');
  title.className = 'text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2';
  title.innerText = 'Session Expired';
  card.appendChild(title);

  // Description / Message
  const desc = document.createElement('p');
  desc.className = 'text-slate-500 dark:text-slate-400 text-sm font-semibold mb-6 leading-relaxed';
  desc.innerHTML = `${message || 'Your session has timed out.'}<br/>Logging you out in <span id="logout-countdown" class="text-rose-500 font-bold">3</span> seconds...`;
  card.appendChild(desc);

  // Progress Bar Container
  const progContainer = document.createElement('div');
  progContainer.className = 'w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden';
  
  const progBar = document.createElement('div');
  progBar.className = 'h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full';
  progBar.style.width = '100%';
  progBar.style.transition = 'width 3000ms linear';
  progContainer.appendChild(progBar);
  card.appendChild(progContainer);

  modal.appendChild(card);
  document.body.appendChild(modal);

  // Trigger entering animations after a brief microtask delay
  setTimeout(() => {
    backdrop.classList.remove('opacity-0');
    backdrop.classList.add('opacity-100');
    card.classList.remove('opacity-0', 'scale-95', 'translate-y-4');
    card.classList.add('opacity-100', 'scale-100', 'translate-y-0');
    progBar.style.width = '0%';
  }, 50);

  // Countdown timer logic
  let count = 3;
  const countdownSpan = card.querySelector('#logout-countdown');
  const timer = setInterval(() => {
    count--;
    if (countdownSpan) {
      countdownSpan.textContent = count;
    }
    if (count <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || '';
    const url = error.config?.url || '';

    const isUnauthorized = status === 401;
    const isSuspended = status === 403 && (
      message.toLowerCase().includes('suspended') || 
      message.toLowerCase().includes('suspend')
    );
    const isUserNotFound = status === 404 && url.includes('/auth/me');
    const isTokenExpired = isUnauthorized || isSuspended || isUserNotFound;

    const isAuthEndpoint = 
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/google') ||
      url.includes('/auth/verify-otp') ||
      url.includes('/auth/send-otp') ||
      url.includes('/auth/admin/login');

    const token = localStorage.getItem('token');

    if (isTokenExpired && !isAuthEndpoint && !isLoggingOut && token) {
      isLoggingOut = true;
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Format a clean message
      let displayMessage = 'Your session has expired. Please log in again.';
      if (message.toLowerCase().includes('suspended')) {
        displayMessage = 'Your account has been suspended. Contact support for assistance.';
      } else if (isUserNotFound) {
        displayMessage = 'User account not found. Please log in again.';
      }

      showSessionExpiredModal(displayMessage);

      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    }

    return Promise.reject(error);
  }
);

export default api;

