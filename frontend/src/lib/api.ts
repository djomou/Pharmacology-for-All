const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ─── Requête brute — retourne la réponse JSON complète ───────
async function request<T>(endpoint: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string,string> = { 'Content-Type':'application/json', ...(options.headers as any) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `Erreur HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Unwrap universel ─────────────────────────────────────────
// Gère toutes les structures : { success, data: X } ou { data: X } ou X
export function unwrap(res: any): any {
  if (res === null || res === undefined) return res;
  // { success:true, data: X, timestamp }
  if ('success' in res && 'data' in res) return res.data;
  // { data: X } sans success
  if ('data' in res && Object.keys(res).length <= 3) return res.data;
  return res;
}

// ─── AUTH ─────────────────────────────────────────────────────
export const authApi = {
  login:    (email: string, password: string) =>
    request<any>('/api/auth/login', { method:'POST', body:JSON.stringify({ email, password }) }),
  register: (data: any) =>
    request<any>('/api/auth/register', { method:'POST', body:JSON.stringify(data) }),
  profile:  (token: string) => request<any>('/api/auth/profile', {}, token),
};

// ─── DRUGS ────────────────────────────────────────────────────
export const drugsApi = {
  search: (q: string, page = 1, limit = 20, token?: string) =>
    request<any>(`/api/drugs?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`, {}, token),
  getOne: (id: number, token?: string) =>
    request<any>(`/api/drugs/${id}`, {}, token),
  getEcosystem: (id: number, token?: string) =>
    request<any>(`/api/drugs/${id}/ecosystem`, {}, token),
  stats: (token?: string) => request<any>('/api/drugs/stats', {}, token),
  autocomplete: (q: string) =>
    request<any>(`/api/search/autocomplete?q=${encodeURIComponent(q)}`),
};

// ─── SEARCH ───────────────────────────────────────────────────
export const searchApi = {
  global:   (q: string) => request<any>(`/api/search?q=${encodeURIComponent(q)}`),
  advanced: (params: any) => request<any>(`/api/search/advanced?${new URLSearchParams(params)}`),
  stats:    () => request<any>('/api/search/stats'),
};

// ─── INTERACTIONS ─────────────────────────────────────────────
export const interactionsApi = {
  checkByName: (name1: string, name2: string) =>
    request<any>(`/api/interactions/check?name1=${encodeURIComponent(name1)}&name2=${encodeURIComponent(name2)}`),
  contraindications: (page = 1, q?: string) =>
    request<any>(`/api/interactions/contraindications?page=${page}${q ? `&q=${encodeURIComponent(q)}` : ''}`),
  allergies: (page = 1, q?: string) =>
    request<any>(`/api/interactions/allergies?page=${page}${q ? `&q=${encodeURIComponent(q)}` : ''}`),
  stats: () => request<any>('/api/interactions/stats'),
};

// ─── INDICATIONS ──────────────────────────────────────────────
export const indicationsApi = {
  search:           (q: string, page = 1) =>
    request<any>(`/api/indications?q=${encodeURIComponent(q)}&page=${page}`),
  searchCim10:      (q: string, page = 1) =>
    request<any>(`/api/indications/cim10?q=${encodeURIComponent(q)}&page=${page}`),
  searchAtc:        (q: string, page = 1) =>
    request<any>(`/api/indications/atc?q=${encodeURIComponent(q)}&page=${page}`),
  drugsByIndication:(q: string, page = 1) =>
    request<any>(`/api/indications/drugs?q=${encodeURIComponent(q)}&page=${page}`),
  stats: () => request<any>('/api/indications/stats'),
};

// ─── SAFETY ───────────────────────────────────────────────────
export const safetyApi = {
  sideEffects: (q?: string, page = 1) =>
    request<any>(`/api/safety/side-effects?page=${page}${q ? `&q=${encodeURIComponent(q)}` : ''}`),
  warnings:    (q?: string, page = 1) =>
    request<any>(`/api/safety/warnings?page=${page}${q ? `&q=${encodeURIComponent(q)}` : ''}`),
  precautions: (q?: string, page = 1) =>
    request<any>(`/api/safety/precautions?page=${page}${q ? `&q=${encodeURIComponent(q)}` : ''}`),
  byDrug: (name: string) =>
    request<any>(`/api/safety/by-drug?name=${encodeURIComponent(name)}`),
  stats: () => request<any>('/api/safety/stats'),
};

// ─── INTERNATIONAL ────────────────────────────────────────────
export const internationalApi = {
  search:     (q: string, page = 1) =>
    request<any>(`/api/international/search?q=${encodeURIComponent(q)}&page=${page}`),
  equivalents:(id: number)           => request<any>(`/api/international/equivalents/${id}`),
  byCountry:  (countryId: number, q?: string, page = 1) =>
    request<any>(`/api/international/country/${countryId}?page=${page}${q ? `&q=${encodeURIComponent(q)}` : ''}`),
  countries:  () => request<any>('/api/international/countries'),
  stats:      () => request<any>('/api/international/stats'),
};

// ─── PATIENT ──────────────────────────────────────────────────
export const patientApi = {
  getProfile:     (userId: number, token: string) =>
    request<any>(`/api/patients/${userId}/profile`, {}, token),
  updateProfile:  (userId: number, data: any, token: string) =>
    request<any>(`/api/patients/${userId}/profile`, { method:'PUT', body:JSON.stringify(data) }, token),
  prescriptions:  (userId: number, token: string) =>
    request<any>(`/api/patients/${userId}/prescriptions`, {}, token),
  addPrescription:(userId: number, data: any, token: string) =>
    request<any>(`/api/patients/${userId}/prescriptions`, { method:'POST', body:JSON.stringify(data) }, token),
  favorites:      (userId: number, token: string) =>
    request<any>(`/api/patients/${userId}/favorites`, {}, token),
  addFavorite:    (userId: number, data: any, token: string) =>
    request<any>(`/api/patients/${userId}/favorites`, { method:'POST', body:JSON.stringify(data) }, token),
};

// ─── NOTIFICATIONS ────────────────────────────────────────────
export const notificationsApi = {
  getMine:     (userId: number, token: string) =>
    request<any>(`/api/notifications/user/${userId}`, {}, token),
  markRead:    (userId: number, id: number, token: string) =>
    request<any>(`/api/notifications/user/${userId}/read/${id}`, { method:'PUT' }, token),
  markAllRead: (userId: number, token: string) =>
    request<any>(`/api/notifications/user/${userId}/read-all`, { method:'PUT' }, token),
};

// ─── ADVISOR ──────────────────────────────────────────────────
export const advisorApi = {
  analyze: (description: string, userId?: number, token?: string) =>
    request<any>('/api/advisor/analyze', { method:'POST', body:JSON.stringify({ description, userId }) }, token),
  symptoms: () => request<any>('/api/advisor/symptoms'),
};

// Endpoints supplémentaires pour les listes déroulantes
export const listsApi = {
  // Toutes les substances actives (molécules)
  allMolecules: () =>
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/molecules?limit=500`)
      .then(r => r.json()).then(d => d?.data?.data || d?.data || []),
  // Tous les médicaments (pour les listes)
  allDrugs: () =>
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/search/advanced?limit=200&marketStatus=1`)
      .then(r => r.json()).then(d => d?.data?.data || d?.data || []),
};
