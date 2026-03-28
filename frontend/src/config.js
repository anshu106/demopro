// In development: uses http://localhost:3001
// In Docker (VITE_API_URL=""): uses relative URLs, proxied by nginx
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
export const SOCKET_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
