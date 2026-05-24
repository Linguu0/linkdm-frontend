const API_URL = '/api';

function getIgUserId() {
  return localStorage.getItem('linkdm_token') || '';
}

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Something went wrong' }));
    const errorMsg = errorBody.details 
      ? `${errorBody.error || 'Error'}: ${typeof errorBody.details === 'object' ? JSON.stringify(errorBody.details) : errorBody.details}`
      : (errorBody.error || errorBody.message || `Request failed with status ${response.status}`);
    throw new Error(errorMsg);
  }

  return response.json();
}

export async function getCampaigns() {
  const igUserId = getIgUserId();
  return request(`/campaigns${igUserId ? `?ig_user_id=${igUserId}` : ''}`);
}

export async function createCampaign(data) {
  const igUserId = getIgUserId();
  return request('/campaigns', {
    method: 'POST',
    body: JSON.stringify({ ...data, ig_user_id: igUserId || undefined }),
  });
}

export async function updateCampaign(id, data) {
  return request(`/campaigns/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteCampaign(id) {
  return request(`/campaigns/${id}`, {
    method: 'DELETE',
  });
}

export async function getAnalytics() {
  const igUserId = getIgUserId();
  return request(`/analytics${igUserId ? `?ig_user_id=${igUserId}` : ''}`);
}

export async function fetchPostPreview(url) {
  return request(`/posts/preview?url=${encodeURIComponent(url)}`);
}

export async function getMediaPosts() {
  return request('/posts/media');
}
