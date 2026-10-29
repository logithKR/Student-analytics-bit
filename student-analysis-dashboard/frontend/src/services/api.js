import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Interceptor to automatically attach JWT token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('bit_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle session expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        localStorage.removeItem('bit_auth_token');
        localStorage.removeItem('bit_auth_user');
      }
    }
    return Promise.reject(error);
  }
);

// ── Authentication Services ──

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axios.get(`${API_URL}/auth/me`);
  return response.data;
};

export const getDemoAccounts = async () => {
  const response = await axios.get(`${API_URL}/auth/demo-accounts`);
  return response.data;
};

export const logoutUser = async () => {
  try {
    await axios.post(`${API_URL}/auth/logout`);
  } catch {
    // Ignore error on logout
  }
  localStorage.removeItem('bit_auth_token');
  localStorage.removeItem('bit_auth_user');
};

// ── Health & Diagnostics ──

export const checkHealth = async () => {
  const response = await axios.get(`${API_URL}/health`);
  return response.data;
};

// ── ML Prediction Engine ──

export const predictSingle = async (studentData) => {
  const response = await axios.post(`${API_URL}/predict/single`, studentData);
  return response.data;
};

export const predictBulk = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_URL}/predict/bulk`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// ── Academic Dashboard Analytics ──

export const getDepartments = async () => {
  const response = await axios.get(`${API_URL}/departments`);
  return response.data.departments;
};

export const getDashboardSummary = async (department = 'All', semester = 'All') => {
  const response = await axios.get(`${API_URL}/dashboard/summary`, { params: { department, semester } });
  return response.data;
};

export const getSemesterTrends = async (department = 'All') => {
  const response = await axios.get(`${API_URL}/dashboard/semester-trends`, { params: { department } });
  return response.data;
};

export const getSubjectAnalytics = async (department = 'All', semester = 'All') => {
  const response = await axios.get(`${API_URL}/dashboard/subject-analytics`, { params: { department, semester } });
  return response.data;
};

export const getStudents = async (department = 'All', semester = 'All', search = '') => {
  const response = await axios.get(`${API_URL}/students`, { params: { department, semester, search } });
  return response.data;
};

export const getStudentDetails = async (registerNumber) => {
  const response = await axios.get(`${API_URL}/students/${registerNumber}`);
  return response.data;
};

export const getTopPerformers = async (department = 'All', semester = 'All', limit = 5) => {
  const response = await axios.get(`${API_URL}/dashboard/top-performers`, { params: { department, semester, limit } });
  return response.data;
};

export const getClassDivision = async (department = 'All', semester = 'All') => {
  const response = await axios.get(`${API_URL}/dashboard/class-division`, { params: { department, semester } });
  return response.data;
};

export const getGradeDistribution = async (department = 'All', semester = 'All') => {
  const response = await axios.get(`${API_URL}/dashboard/grade-distribution`, { params: { department, semester } });
  return response.data;
};

export const getBatchComparison = async (department = 'All') => {
  const response = await axios.get(`${API_URL}/dashboard/batch-comparison`, { params: { department } });
  return response.data;
};

export const getAtRiskStudents = async (department = 'All', semester = 'All') => {
  const response = await axios.get(`${API_URL}/dashboard/at-risk`, { params: { department, semester } });
  return response.data;
};

// ── AI Dynamic Analytics & Chart Services ──

export const queryAI = async (question, mode = 'chat_viz', history = [], conversationId = null) => {
  const payload = { question, mode, history };
  if (conversationId) {
    payload.conversation_id = conversationId;
  }
  const response = await axios.post(`${API_URL}/ai/query`, payload);
  return response.data;
};

export const getAIConversations = async () => {
  const response = await axios.get(`${API_URL}/ai/conversations`);
  return response.data;
};

export const getAIConversation = async (conversationId) => {
  const response = await axios.get(`${API_URL}/ai/conversations/${encodeURIComponent(conversationId)}`);
  return response.data;
};

export const createAIConversation = async (title = 'New Academic Chat') => {
  const response = await axios.post(`${API_URL}/ai/conversations`, { title });
  return response.data;
};

export const deleteAIConversation = async (conversationId) => {
  const response = await axios.delete(`${API_URL}/ai/conversations/${encodeURIComponent(conversationId)}`);
  return response.data;
};

export const getAISchema = async () => {
  const response = await axios.get(`${API_URL}/ai/schema`);
  return response.data;
};

export const executeAIPlan = async (plan) => {
  const response = await axios.post(`${API_URL}/ai/execute-plan`, plan);
  return response.data;
};

// ── AI Audit Logs & Diagnostics Services ──

export const getAILogs = async (params = {}) => {
  const response = await axios.get(`${API_URL}/ai/logs`, { params });
  return response.data;
};

export const getAILogsStats = async () => {
  const response = await axios.get(`${API_URL}/ai/logs/stats`);
  return response.data;
};

export const getAILogById = async (logId) => {
  const response = await axios.get(`${API_URL}/ai/logs/${logId}`);
  return response.data;
};

export const clearAILogs = async () => {
  const response = await axios.delete(`${API_URL}/ai/logs`);
  return response.data;
};

// ── Report Card & Dynamic Report Builder Services ──

export const getReportBuilderStudent = async (registerNumber) => {
  const response = await axios.get(`${API_URL}/report-builder/student/${encodeURIComponent(registerNumber)}`);
  return response.data;
};

export const getReportBuilderDepartment = async (department = 'All', semester = 'All') => {
  const response = await axios.get(`${API_URL}/report-builder/department`, {
    params: { department, semester }
  });
  return response.data;
};

export const generateReportAIInsight = async ({ scope = 'student', data = {}, insight_type = 'summary' }) => {
  const response = await axios.post(`${API_URL}/report-builder/ai-insight`, {
    scope,
    data,
    insight_type
  });
  return response.data;
};

export const sendReportAIChat = async ({
  question,
  scope = 'student',
  entity_data = {},
  available_components = [],
  history = []
}) => {
  const response = await axios.post(`${API_URL}/report-builder/chat`, {
    question,
    scope,
    entity_data,
    available_components,
    history
  });
  return response.data;
};
