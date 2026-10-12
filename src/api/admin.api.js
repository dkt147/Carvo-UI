import { apiRequest, API_URL, getToken } from "./client.js";

const unwrapData = (response) => response?.data ?? response ?? null;
const unwrapList = (response) => {
  const value = response?.data ?? response;
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.rows)) return value.rows;
  return [];
};

const json = (method, body) => ({ method, body: JSON.stringify(body) });

export const getAdminDashboard = async () => unwrapData(await apiRequest("/admin/dashboard"));

export const getDocuments = async () => unwrapList(await apiRequest("/admin/documents?page=1&limit=100"));
export const getDocument = async (id) => unwrapData(await apiRequest(`/admin/documents/${encodeURIComponent(id)}`));
export const downloadDocumentFile = async (id) => {
  const response = await fetch(`${API_URL}/admin/documents/${encodeURIComponent(id)}/file`, {
    headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
  });
  if (!response.ok) {
    let message = `Download failed (${response.status})`;
    try { const body = await response.json(); message = body?.message || message; } catch {}
    throw new Error(message);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = response.headers.get("content-disposition")?.match(/filename="?([^";]+)"?/i)?.[1] || `carvo-document-${id}`;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
};
export const createDocument = async ({ title, description, file }) => {
  if (!(file instanceof File)) throw new Error("Select a PDF or DOCX file to upload.");
  const form = new FormData();
  form.append("title", title);
  if (description) form.append("description", description);
  form.append("file", file);
  return unwrapData(await apiRequest("/admin/documents", { method: "POST", body: form }));
};
export const createDocumentVersion = async (id, content) => unwrapData(await apiRequest(`/admin/documents/${encodeURIComponent(id)}/versions`, json("POST", { content })));
export const updateDocumentStatus = async (id, status) => unwrapData(await apiRequest(`/admin/documents/${encodeURIComponent(id)}/status`, json("PATCH", { status })));

export const getKnowledge = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.approvalStatus && filters.approvalStatus !== "ALL") params.set("approvalStatus", filters.approvalStatus);
  if (filters.type && filters.type !== "ALL") params.set("type", filters.type);
  if (filters.documentId) params.set("documentId", filters.documentId);
  const query = params.toString() ? `?${params.toString()}` : "";
  return unwrapList(await apiRequest(`/admin/knowledge${query}`));
};
export const getKnowledgeById = async (id) => unwrapData(await apiRequest(`/admin/knowledge/${encodeURIComponent(id)}`));
export const createKnowledge = async (body) => unwrapData(await apiRequest("/admin/knowledge", json("POST", body)));
export const updateKnowledge = async (id, body) => unwrapData(await apiRequest(`/admin/knowledge/${encodeURIComponent(id)}`, json("PATCH", body)));
export const deleteKnowledge = async (id) => unwrapData(await apiRequest(`/admin/knowledge/${encodeURIComponent(id)}`, { method: "DELETE" }));

export const getReviews = async (status = "ALL") => {
  const query = status && status !== "ALL" ? `?status=${encodeURIComponent(status)}` : "";
  return unwrapList(await apiRequest(`/admin/reviews${query}`));
};
export const getReview = async (id) => unwrapData(await apiRequest(`/admin/reviews/${encodeURIComponent(id)}`));
export const createReview = async (body) => unwrapData(await apiRequest("/admin/reviews", json("POST", body)));
export const updateReview = async (id, body) => unwrapData(await apiRequest(`/admin/reviews/${encodeURIComponent(id)}`, json("PATCH", body)));
export const answerClarification = async (id, answer) => unwrapData(await apiRequest(`/admin/reviews/${encodeURIComponent(id)}/clarification`, json("POST", { answer })));
export const requestReviewChanges = async (id, correction, question) => unwrapData(await apiRequest(`/admin/reviews/${encodeURIComponent(id)}/request-changes`, json("POST", { correction, question })));
export const approveReview = async (id, knowledgeItems) => unwrapData(await apiRequest(`/admin/reviews/${encodeURIComponent(id)}/approve`, json("POST", { knowledgeItems })));
export const rejectReview = async (id, correction) => unwrapData(await apiRequest(`/admin/reviews/${encodeURIComponent(id)}/reject`, json("POST", { correction })));

export const getProtocols = async () => unwrapList(await apiRequest("/admin/protocols"));
export const getProtocol = async (id) => unwrapData(await apiRequest(`/admin/protocols/${encodeURIComponent(id)}`));
export const createProtocol = async (body) => unwrapData(await apiRequest("/admin/protocols", json("POST", body)));
export const updateProtocol = async (id, body) => unwrapData(await apiRequest(`/admin/protocols/${encodeURIComponent(id)}`, json("PATCH", body)));
export const updateProtocolStatus = async (id, status) => unwrapData(await apiRequest(`/admin/protocols/${encodeURIComponent(id)}/status`, json("PATCH", { status })));
export const createProtocolVersion = async (id, content) => unwrapData(await apiRequest(`/admin/protocols/${encodeURIComponent(id)}/versions`, json("POST", { content })));
export const getProtocolVersions = async (id) => unwrapList(await apiRequest(`/admin/protocols/${encodeURIComponent(id)}/versions`));
export const linkKnowledge = async (protocolId, versionId, knowledgeItemId) => unwrapData(await apiRequest(`/admin/protocols/${encodeURIComponent(protocolId)}/versions/${encodeURIComponent(versionId)}/knowledge`, json("POST", { knowledgeItemId })));
export const unlinkKnowledge = async (protocolId, versionId, knowledgeId) => unwrapData(await apiRequest(`/admin/protocols/${encodeURIComponent(protocolId)}/versions/${encodeURIComponent(versionId)}/knowledge/${encodeURIComponent(knowledgeId)}`, { method: "DELETE" }));

export const getVersions = async () => unwrapData(await apiRequest("/admin/versions"));
export const getAnalyses = async () => unwrapList(await apiRequest("/admin/analyses"));
export const getAnalysis = async (id) => unwrapData(await apiRequest(`/admin/analyses/${encodeURIComponent(id)}`));
export const getAiJobs = async () => unwrapList(await apiRequest("/admin/ai/jobs"));
export const getAiJob = async (id) => unwrapData(await apiRequest(`/admin/ai/jobs/${encodeURIComponent(id)}`));

export const getUsers = async () => unwrapList(await apiRequest("/admin/users"));
export const getUser = async (id) => unwrapData(await apiRequest(`/admin/users/${encodeURIComponent(id)}`));
export const createUser = async (body) => unwrapData(await apiRequest("/admin/users", json("POST", body)));
export const updateUser = async (id, body) => unwrapData(await apiRequest(`/admin/users/${encodeURIComponent(id)}`, json("PATCH", body)));

export const getAuditLogs = async () => unwrapList(await apiRequest("/admin/audit-logs"));
export const getAuditLog = async (id) => unwrapData(await apiRequest(`/admin/audit-logs/${encodeURIComponent(id)}`));
export const getSettings = async () => unwrapData(await apiRequest("/admin/settings"));

// Notifications are intentionally account-scoped because the administration API
// does not expose system-wide notification administration.
export const getNotifications = async () => unwrapList(await apiRequest("/notifications"));
export const getUnreadNotificationCount = async () => Number((await apiRequest("/notifications/unread-count"))?.data?.count || 0);
export const markNotificationAsRead = async (id) => unwrapData(await apiRequest(`/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" }));
export const markAllNotificationsAsRead = async () => unwrapData(await apiRequest("/notifications/read-all", { method: "PATCH" }));

window.CARVO_ADMIN_API = {
  getAdminDashboard, getDocuments, getDocument, downloadDocumentFile, createDocument, createDocumentVersion, updateDocumentStatus,
  getKnowledge, getKnowledgeById, createKnowledge, updateKnowledge, deleteKnowledge,
  getReviews, getReview, createReview, updateReview, answerClarification, requestReviewChanges, approveReview, rejectReview,
  getProtocols, getProtocol, createProtocol, updateProtocol, updateProtocolStatus, createProtocolVersion, getProtocolVersions, linkKnowledge, unlinkKnowledge,
  getVersions, getAnalyses, getAnalysis, getAiJobs, getAiJob, getUsers, getUser, createUser, updateUser,
  getAuditLogs, getAuditLog, getSettings, getNotifications, getUnreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead,
};
