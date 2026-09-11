import { apiRequest } from "./client.js";

/**
 * CARVO Admin API
 *
 * Module 2:
 * - Dashboard data
 * - Documents
 * - Document versions
 * - Knowledge
 * - Protocols
 * - Audit
 * - Notifications
 * - Users
 *
 * All requests use the centralized API client.
 * The API URL comes only from VITE_API_URL.
 */

/* -------------------------------------------------------------------------- */
/* Documents                                                                  */
/* -------------------------------------------------------------------------- */

export const getDocuments = async () => {
  const response = await apiRequest("/documents");

  return Array.isArray(response?.data) ? response.data : [];
};

export const getDocument = async (documentId) => {
  const response = await apiRequest(
    `/documents/${encodeURIComponent(documentId)}`,
  );

  return response?.data || null;
};

export const createDocument = async ({
  title,
  description,
  fileName,
  fileUrl,
}) => {
  const response = await apiRequest("/documents", {
    method: "POST",
    body: JSON.stringify({
      title,
      description,
      fileName,
      fileUrl,
    }),
  });

  return response?.data || null;
};

export const createDocumentVersion = async (documentId, content) => {
  const response = await apiRequest(
    `/documents/${encodeURIComponent(documentId)}/versions`,
    {
      method: "POST",
      body: JSON.stringify({
        content,
      }),
    },
  );

  return response?.data || null;
};

/* -------------------------------------------------------------------------- */
/* Knowledge                                                                  */
/* -------------------------------------------------------------------------- */

export const getKnowledge = async () => {
  const response = await apiRequest("/knowledge");

  return Array.isArray(response?.data) ? response.data : [];
};

export const getKnowledgeById = async (knowledgeId) => {
  const response = await apiRequest(
    `/knowledge/${encodeURIComponent(knowledgeId)}`,
  );

  return response?.data || null;
};

/* -------------------------------------------------------------------------- */
/* Protocols                                                                  */
/* -------------------------------------------------------------------------- */

export const getProtocols = async () => {
  const response = await apiRequest("/protocols");

  return Array.isArray(response?.data) ? response.data : [];
};

export const getProtocolById = async (protocolId) => {
  const response = await apiRequest(
    `/protocols/${encodeURIComponent(protocolId)}`,
  );

  return response?.data || null;
};

/* -------------------------------------------------------------------------- */
/* Audit                                                                      */
/* -------------------------------------------------------------------------- */

export const getAuditLogs = async () => {
  const response = await apiRequest("/audit-logs");

  return Array.isArray(response?.data) ? response.data : [];
};

export const getAuditLogById = async (auditId) => {
  const response = await apiRequest(
    `/audit-logs/${encodeURIComponent(auditId)}`,
  );

  return response?.data || null;
};

/* -------------------------------------------------------------------------- */
/* Notifications                                                              */
/* -------------------------------------------------------------------------- */

export const getNotifications = async () => {
  const response = await apiRequest("/notifications");

  return Array.isArray(response?.data) ? response.data : [];
};

export const getUnreadNotifications = async () => {
  const response = await apiRequest("/notifications/unread");

  return Array.isArray(response?.data) ? response.data : [];
};

export const getUnreadNotificationCount = async () => {
  const response = await apiRequest("/notifications/unread-count");

  return Number(response?.data?.count || 0);
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await apiRequest(
    `/notifications/${encodeURIComponent(notificationId)}/read`,
    {
      method: "PATCH",
    },
  );

  return response?.data || null;
};

export const markAllNotificationsAsRead = async () => {
  const response = await apiRequest("/notifications/read-all", {
    method: "PATCH",
  });

  return response?.data || null;
};

/* -------------------------------------------------------------------------- */
/* Users                                                                      */
/* -------------------------------------------------------------------------- */

export const getUsers = async () => {
  const response = await apiRequest("/users");

  return Array.isArray(response?.data) ? response.data : [];
};

export const getUserById = async (userId) => {
  const response = await apiRequest(`/users/${encodeURIComponent(userId)}`);

  return response?.data || null;
};

export const createUser = async ({ name, email, password, role }) => {
  const response = await apiRequest("/users", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      role,
    }),
  });

  return response?.data || null;
};

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The current backend does not expose a dedicated dashboard statistics
 * endpoint, so the dashboard derives the available metrics from the
 * existing read APIs.
 */
export const getAdminDashboardData = async () => {
  const results = await Promise.allSettled([
    getDocuments(),
    getKnowledge(),
    getProtocols(),
    getAuditLogs(),
    getUnreadNotificationCount(),
  ]);

  const documents = results[0].status === "fulfilled" ? results[0].value : [];

  const knowledge = results[1].status === "fulfilled" ? results[1].value : [];

  const protocols = results[2].status === "fulfilled" ? results[2].value : [];

  const auditLogs = results[3].status === "fulfilled" ? results[3].value : [];

  const unreadNotifications =
    results[4].status === "fulfilled" ? results[4].value : 0;

  return {
    documents,
    knowledge,
    protocols,
    auditLogs,
    unreadNotifications,

    stats: {
      totalDocuments: documents.length,

      processingDocuments: documents.filter(
        (document) => String(document.status).toUpperCase() === "PROCESSING",
      ).length,

      processedDocuments: documents.filter(
        (document) => String(document.status).toUpperCase() === "PROCESSED",
      ).length,

      approvedDocuments: documents.filter(
        (document) => String(document.status).toUpperCase() === "APPROVED",
      ).length,

      totalKnowledge: knowledge.length,

      activeProtocols: protocols.filter(
        (protocol) => String(protocol.status).toUpperCase() === "ACTIVE",
      ).length,

      totalProtocols: protocols.length,

      unreadNotifications,
    },
  };
};
