// A simple toast utility that doesn't depend on external packages
// This is a temporary solution to fix build issues with sonner

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const defaultOptions: ToastOptions = {
  duration: 3000,
  position: 'top-right'
};

const createToast = (message: string, type: ToastType, options: ToastOptions = {}) => {
  const { duration, position } = { ...defaultOptions, ...options };
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type} toast-${position}`;
  toast.textContent = message;
  
  // Style the toast
  Object.assign(toast.style, {
    position: 'fixed',
    padding: '12px 16px',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    color: '#fff',
    fontFamily: 'inherit',
    fontSize: '14px',
    zIndex: '9999',
    maxWidth: '350px',
    animation: 'toast-in 0.3s ease-in-out forwards',
  });
  
  // Set position
  switch (position) {
    case 'top-right':
      Object.assign(toast.style, { top: '20px', right: '20px' });
      break;
    case 'top-left':
      Object.assign(toast.style, { top: '20px', left: '20px' });
      break;
    case 'bottom-right':
      Object.assign(toast.style, { bottom: '20px', right: '20px' });
      break;
    case 'bottom-left':
      Object.assign(toast.style, { bottom: '20px', left: '20px' });
      break;
  }
  
  // Set type-specific styles
  switch (type) {
    case 'success':
      toast.style.backgroundColor = '#10b981';
      break;
    case 'error':
      toast.style.backgroundColor = '#ef4444';
      break;
    case 'warning':
      toast.style.backgroundColor = '#f59e0b';
      break;
    case 'info':
      toast.style.backgroundColor = '#3b82f6';
      break;
  }
  
  // Add animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes toast-in {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes toast-out {
      from { transform: translateY(0); opacity: 1; }
      to { transform: translateY(-20px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  
  // Add to DOM
  document.body.appendChild(toast);
  
  // Remove after duration
  setTimeout(() => {
    toast.style.animation = 'toast-out 0.3s ease-in-out forwards';
    setTimeout(() => {
      document.body.removeChild(toast);
      document.head.removeChild(style);
    }, 300);
  }, duration);
};

export const toast = {
  success: (message: string, options?: ToastOptions) => createToast(message, 'success', options),
  error: (message: string, options?: ToastOptions) => createToast(message, 'error', options),
  warning: (message: string, options?: ToastOptions) => createToast(message, 'warning', options),
  info: (message: string, options?: ToastOptions) => createToast(message, 'info', options),
};
