const API_URL = '/api';

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
  return request('/campaigns');
}

export async function createCampaign(data) {
  return request('/campaigns', {
    method: 'POST',
    body: JSON.stringify(data),
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
  return request('/analytics');
}

export async function fetchPostPreview(url) {
  return request(`/posts/preview?url=${encodeURIComponent(url)}`);
}

export async function getMediaPosts() {
  return request('/posts/media');
}
