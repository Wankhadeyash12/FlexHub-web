// API Configuration
const resolveApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.__API_BASE_URL__) return window.__API_BASE_URL__;
  if (typeof document !== 'undefined') {
    const meta = document.querySelector('meta[name="api-base-url"]');
    if (meta && meta.content) return meta.content;

    const body = document.body;
    if (body && body.dataset && body.dataset.apiBaseUrl) return body.dataset.apiBaseUrl;
  }

  if (typeof window !== 'undefined' && window.location && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://flexhub-web-2.onrender.com/api';
  }

  return '/api';
};

const API_BASE_URL = resolveApiBaseUrl();

// Helper function to get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API calls
const apiCall = async (endpoint, method = 'GET', body = null, isFormData = false) => {
  const options = {
    method,
    headers: isFormData ? {} : {
      'Content-Type': 'application/json',
    },
  };

  const token = getToken();
  if (token && !isFormData) {
    options.headers['Authorization'] = `Bearer ${token}`;
  } else if (token && isFormData) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    if (isFormData) {
      options.body = body;
    } else {
      options.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    const contentType = response.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      throw new Error(data.message || `API request failed (status ${response.status})`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Authentication APIs
const authAPI = {
  register: (userData) => apiCall('/auth/register', 'POST', userData),
  login: (credentials) => apiCall('/auth/login', 'POST', credentials),
};

// Event APIs
const eventAPI = {
  createEvent: (eventData, bannerFile) => {
    const formData = new FormData();
    Object.keys(eventData).forEach((key) => {
      formData.append(key, eventData[key]);
    });
    if (bannerFile) {
      formData.append('banner', bannerFile);
    }
    return apiCall('/events/create', 'POST', formData, true);
  },
  getOrganizerEvents: () => apiCall('/events/organizer-events'),
  getAllPublishedEvents: (search, mode, sortBy) => {
    let url = '/events/browse/all';
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (mode) params.append('mode', mode);
    if (sortBy) params.append('sortBy', sortBy);
    if (params.toString()) url += '?' + params.toString();
    return apiCall(url);
  },
  getEventBySlug: (slug) => apiCall(`/events/public/${slug}`),
  updateEvent: (eventId, eventData, bannerFile) => {
    const formData = new FormData();
    Object.keys(eventData).forEach((key) => {
      formData.append(key, eventData[key]);
    });
    if (bannerFile) {
      formData.append('banner', bannerFile);
    }
    return apiCall(`/events/${eventId}`, 'PUT', formData, true);
  },
  deleteEvent: (eventId) => apiCall(`/events/${eventId}`, 'DELETE'),
  publishEvent: (eventId) => apiCall(`/events/${eventId}/publish`, 'POST'),
  getEventRegistrations: (eventId) => apiCall(`/events/${eventId}/registrations`),
};

// Registration APIs
const registrationAPI = {
  registerForEvent: (registrationData) =>
    apiCall('/registrations/register', 'POST', registrationData),
  getParticipantRegistrations: () => apiCall('/registrations/my-registrations'),
  approveRegistration: (registrationId) =>
    apiCall(`/registrations/${registrationId}/approve`, 'PUT'),
  rejectRegistration: (registrationId) =>
    apiCall(`/registrations/${registrationId}/reject`, 'PUT'),
};

// Payment APIs
const paymentAPI = {
  createCheckoutSession: (registrationData) =>
    apiCall('/payments/create-checkout-session', 'POST', registrationData),
  verifyPayment: (paymentData) =>
    apiCall('/payments/verify-payment', 'POST', paymentData),
  getSessionDetails: (sessionId) =>
    apiCall(`/payments/session-details?sessionId=${sessionId}`),
};

// Analytics APIs
const analyticsAPI = {
  getEventAnalytics: (eventId) => apiCall(`/analytics/event/${eventId}`),
  getOrganizerDashboardAnalytics: () => apiCall('/analytics/dashboard'),
};
