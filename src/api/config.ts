
// API URLs
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:5000';

// Ключи для хранения в localStorage
export const ACCESS_TOKEN_KEY = 'lokalchat_access_token';
export const REFRESH_TOKEN_KEY = 'lokalchat_refresh_token';
export const USER_KEY = 'lokalchat_user';

// Конфигурационные параметры
export const API_CONFIG = {
  TIMEOUT: 10000, // Таймаут запросов (10 секунд)
  RETRY_COUNT: 3, // Количество повторных попыток при ошибке
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // Максимальный размер загружаемого файла (5MB)
};

// Настройки WebSocket
export const SOCKET_CONFIG = {
  RECONNECT_INTERVAL: 5000, // Интервал переподключения (5 секунд)
  MAX_RECONNECT_ATTEMPTS: 10, // Максимальное количество попыток переподключения
};
