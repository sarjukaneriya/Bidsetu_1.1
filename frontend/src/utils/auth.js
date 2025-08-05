export function getValidToken() {
  const token = localStorage.getItem('token');
  if (token && typeof token === 'string' && token.length > 10 && token.includes('.')) {
    return token;
  }
  localStorage.removeItem('token');
  return null;
} 