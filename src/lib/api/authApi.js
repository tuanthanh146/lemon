import api from './axios';

/**
 * POST /auth/login
 * Body: { username, password }
 * Returns: { accessToken, refreshToken, user }
 */
export async function loginApi(username, password) {
  const { data } = await api.post('/auth/login', { username, password });
  return data.data || data; // unwrap TransformInterceptor
}

/**
 * POST /auth/register
 * Body: { username, password }
 * Returns: { accessToken, refreshToken, user }
 */
export async function registerApi(username, password) {
  const { data } = await api.post('/auth/register', { username, password });
  return data.data || data;
}

/**
 * GET /auth/me
 * Requires accessToken
 * Returns: { id, username, createdAt }
 */
export async function getMeApi() {
  const { data } = await api.get('/auth/me');
  return data.data || data;
}

/**
 * POST /auth/logout
 * Requires accessToken
 */
export async function logoutApi() {
  const { data } = await api.post('/auth/logout');
  return data.data || data;
}
