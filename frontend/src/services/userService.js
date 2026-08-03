import axios from "axios";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// mock mode-এও যাতে ভুলে এক user এর profile আরেক user এ leak না করে,
// তাই email দিয়ে namespaced key ব্যবহার করা হয়
function mockKey() {
  const email = localStorage.getItem("email") || "guest";
  return `mockProfile:${email}`;
}
function readMockProfile() {
  try { return JSON.parse(localStorage.getItem(mockKey()) || "{}"); }
  catch { return {}; }
}
function writeMockProfile(patch) {
  const current = readMockProfile();
  const merged = { ...current, ...patch };
  localStorage.setItem(mockKey(), JSON.stringify(merged));
  return merged;
}

// ─── GET own profile ───────────────────────────────────────────────────────────
export function getMyProfile() {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const p = readMockProfile();
        resolve({
          fullname: localStorage.getItem("name") || "",
          email:    localStorage.getItem("email") || "",
          title:    p.title    || "",
          location: p.location || "",
          bio:      p.bio      || "",
          skills:   p.skills   || [],
          resume:   p.resume   || "",
          resumeOriginalName: p.resumeOriginalName || "",
        });
      }, 200);
    });
  }
  return axios.get(`${BASE_URL}/api/auth/me`, { headers: authHeader() }).then((res) => res.data.user);
}

// ─── UPDATE own profile ────────────────────────────────────────────────────────
export function updateMyProfile(data) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (data.fullname) localStorage.setItem("name", data.fullname);
        const merged = writeMockProfile(data);
        resolve({ success: true, user: merged });
      }, 300);
    });
  }
  return axios
    .post(`${BASE_URL}/api/auth/profile/update`, data, { headers: authHeader() })
    .then((res) => res.data);
}

// ─── UPLOAD resume (real multipart file — disk-এ save হয়) ─────────────────────
export function uploadResume(file) {
  if (USE_MOCK) {
    // mock mode এ base64 হিসেবেই localStorage-এ রাখা হয় (backend নাই)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const merged = writeMockProfile({ resume: ev.target.result, resumeOriginalName: file.name });
        resolve({ success: true, resume: merged.resume, resumeOriginalName: file.name });
      };
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.readAsDataURL(file);
    });
  }
  const formData = new FormData();
  formData.append("resume", file);
  return axios
    .post(`${BASE_URL}/api/auth/resume/upload`, formData, { headers: authHeader() })
    .then((res) => res.data);
}

// ─── DOWNLOAD resume — auth header দিয়ে blob হিসেবে fetch করে save করে ────────
export function downloadResume(userId, fallbackName) {
  if (USE_MOCK) {
    const p = readMockProfile();
    if (!p.resume) return Promise.reject(new Error("No resume found"));
    const a = document.createElement("a");
    a.href = p.resume;
    a.download = p.resumeOriginalName || fallbackName || "resume.pdf";
    a.click();
    return Promise.resolve();
  }
  return axios
    .get(`${BASE_URL}/api/auth/resume/${userId}`, { headers: authHeader(), responseType: "blob" })
    .then((res) => {
      const disposition = res.headers["content-disposition"] || "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = (match && match[1]) || fallbackName || "resume.pdf";
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    });
}
