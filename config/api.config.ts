export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  TIMEOUT: 15000,
  RETRY_COUNT: 2,
  RETRY_DELAY: 500,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  MASTER_DATA: {
    COMPANY: '/companyMaster',
    BRANCH: '/branches',
    ROLES: '/roles',
  },
};