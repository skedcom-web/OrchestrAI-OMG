// Production API Service connecting Frontend to Render Backend & Neon Cloud DB

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://orchestrai-omg.onrender.com/api';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    return await res.json();
  } catch (err) {
    console.warn('API Health check offline, using local mode fallback:', err);
    return null;
  }
}

export async function fetchCloudAssets() {
  try {
    const res = await fetch(`${API_BASE_URL}/assets`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend offline or initializing, fallback to local storage:', err);
  }
  return null;
}

export async function createCloudAsset(assetData: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetData),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Cloud API post failed, fallback to local store:', err);
  }
  return null;
}
