import { apiRequest } from "./client.js";

/**
 * Minister workspace API.
 *
 * This file is the single integration boundary for the Minister UI.
 * The UI never talks to fetch() directly.
 */

const unwrapList = (response) => {
  const value = response?.data ?? response;
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.rows)) return value.rows;
  return [];
};

const unwrapData = (response) => response?.data ?? response ?? null;
const idPath = (id) => encodeURIComponent(String(id));

export const getMinisterSituations = async () =>
  unwrapList(await apiRequest("/situations"));

export const getMinisterActions = async () =>
  unwrapList(await apiRequest("/actions"));

export const getMinisterProjects = async () =>
  unwrapList(await apiRequest("/projects"));

export const getMinisterProtocols = async () => {
  const protocols = unwrapList(await apiRequest("/protocols"));
  return Promise.all(protocols.map(async (protocol) => {
    if (Array.isArray(protocol.versions)) return protocol;
    try {
      const versions = await getMinisterProtocolVersions(protocol.id);
      return { ...protocol, versions };
    } catch (error) {
      console.warn("[CARVO] Could not load protocol versions:", protocol.id, error);
      return { ...protocol, versions: [] };
    }
  }));
};

export const getMinisterNotifications = async () =>
  unwrapList(await apiRequest("/notifications"));

export const getMinisterUnreadNotificationCount = async () =>
  Number((await apiRequest("/notifications/unread-count"))?.data?.count || 0);

export const markMinisterNotificationAsRead = async (id) =>
  unwrapData(await apiRequest(`/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" }));

export const markAllMinisterNotificationsAsRead = async () =>
  unwrapData(await apiRequest("/notifications/read-all", { method: "PATCH" }));

export const deleteMinisterNotification = async (id) =>
  unwrapData(await apiRequest(`/notifications/${encodeURIComponent(id)}`, { method: "DELETE" }));

export const getMinisterResults = async () =>
  unwrapList(await apiRequest("/results"));

export const getMinisterFeedback = async () =>
  unwrapList(await apiRequest("/feedback"));

export const getMinisterEvents = async () =>
  unwrapList(await apiRequest("/events"));

export const getMinisterAuditLogs = async () =>
  unwrapList(await apiRequest("/audit-logs"));

export const deleteMinisterEvent = async (id) =>
  unwrapData(await apiRequest(`/events/${idPath(id)}`, { method: "DELETE" }));
export const deleteMinisterResult = async (id) =>
  unwrapData(await apiRequest(`/results/${idPath(id)}`, { method: "DELETE" }));
export const deleteMinisterFeedback = async (id) =>
  unwrapData(await apiRequest(`/feedback/${idPath(id)}`, { method: "DELETE" }));

export const getMinisterDashboard = async () => {
  const [
    situations,
    actions,
    projects,
    notifications,
    unreadNotifications,
    protocols,
    results,
    feedback,
    events,
    auditLogs,
  ] = await Promise.all([
    getMinisterSituations(),
    getMinisterActions(),
    getMinisterProjects(),
    getMinisterNotifications(),
    getMinisterUnreadNotificationCount(),
    getMinisterProtocols(),
    getMinisterResults(),
    getMinisterFeedback(),
    getMinisterEvents(),
    getMinisterAuditLogs(),
  ]);

  return {
    situations,
    actions,
    projects,
    notifications,
    unreadNotifications,
    protocols,
    results,
    feedback,
    events,
    auditLogs,
  };
};

export const createMinisterSituation = async ({ title, description }) =>
  unwrapData(
    await apiRequest("/situations", {
      method: "POST",
      body: JSON.stringify({ title, description }),
    }),
  );

export const requestMinisterAnalysis = async (
  situationId,
  { projectId = null, protocolVersionId = null } = {},
) =>
  unwrapData(
    await apiRequest("/ai/analyses", {
      method: "POST",
      body: JSON.stringify({
        situationId,
        ...(projectId ? { projectId } : {}),
        ...(protocolVersionId ? { protocolVersionId } : {}),
      }),
    }),
  );

export const getMinisterAnalysisJob = async (jobId) =>
  unwrapData(await apiRequest(`/ai/analyses/${idPath(jobId)}`));

export const getMinisterAnalysis = async (analysisId) =>
  unwrapData(await apiRequest(`/analyses/${idPath(analysisId)}`));

export const getMinisterRecommendations = async (analysisId) =>
  unwrapList(await apiRequest(`/recommendations/analysis/${encodeURIComponent(analysisId)}`));

export const getMinisterProtocol = async (protocolId) =>
  unwrapData(await apiRequest(`/protocols/${encodeURIComponent(protocolId)}`));

export const getMinisterProtocolVersions = async (protocolId) =>
  unwrapList(await apiRequest(`/protocols/${encodeURIComponent(protocolId)}/versions`));

export const getMinisterSituationAnalyses = async (situationId) =>
  unwrapList(await apiRequest(`/analyses/situation/${idPath(situationId)}`));

export const createMinisterAction = async ({
  title,
  description,
  dueDate,
  situationId,
  recommendationId,
}) =>
  unwrapData(
    await apiRequest("/actions", {
      method: "POST",
      body: JSON.stringify({
        title,
        description,
        ...(dueDate ? { dueDate } : {}),
        ...(situationId ? { situationId } : {}),
        ...(recommendationId ? { recommendationId } : {}),
      }),
    }),
  );

export const updateMinisterActionStatus = async (id, status) =>
  unwrapData(
    await apiRequest(`/actions/${idPath(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  );

export const createMinisterProject = async ({
  name,
  description,
  pointA,
  pointB,
}) =>
  unwrapData(
    await apiRequest("/projects", {
      method: "POST",
      body: JSON.stringify({
        name,
        ...(description ? { description } : {}),
        ...(pointA ? { pointA } : {}),
        ...(pointB ? { pointB } : {}),
      }),
    }),
  );

export const updateMinisterProjectStatus = async (id, status) =>
  unwrapData(
    await apiRequest(`/projects/${idPath(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  );

export const getMinisterProjectMilestones = async (projectId) =>
  unwrapList(await apiRequest(`/milestones/project/${idPath(projectId)}`));

export const createMinisterMilestone = async ({ title, description, dueDate, projectId }) =>
  unwrapData(await apiRequest("/milestones", {
    method: "POST",
    body: JSON.stringify({ title, ...(description ? { description } : {}), ...(dueDate ? { dueDate } : {}), projectId }),
  }));

export const updateMinisterMilestoneCompletion = async (id, completed) =>
  unwrapData(
    await apiRequest(`/milestones/${idPath(id)}/completion`, {
      method: "PATCH",
      body: JSON.stringify({ completed }),
    }),
  );

export const createMinisterEvent = async ({
  type,
  title,
  description,
  occurredAt,
  projectId,
  situationId,
  actionId,
  milestoneId,
}) =>
  unwrapData(
    await apiRequest("/events", {
      method: "POST",
      body: JSON.stringify({
        type,
        title,
        ...(description ? { description } : {}),
        ...(occurredAt ? { occurredAt } : {}),
        ...(projectId ? { projectId } : {}),
        ...(situationId ? { situationId } : {}),
        ...(actionId ? { actionId } : {}),
        ...(milestoneId ? { milestoneId } : {}),
      }),
    }),
  );

export const createMinisterResult = async ({
  title,
  description,
  status,
  eventId,
}) =>
  unwrapData(
    await apiRequest("/results", {
      method: "POST",
      body: JSON.stringify({
        title,
        description,
        ...(status ? { status } : {}),
        eventId,
      }),
    }),
  );

export const updateMinisterResultStatus = async (id, status) =>
  unwrapData(
    await apiRequest(`/results/${idPath(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  );

export const createMinisterFeedback = async ({
  type,
  content,
  resultId,
}) =>
  unwrapData(
    await apiRequest("/feedback", {
      method: "POST",
      body: JSON.stringify({ type, content, resultId }),
    }),
  );

export const getMinisterResult = async (id) =>
  unwrapData(await apiRequest(`/results/${idPath(id)}`));

export const getMinisterNotificationsUnreadCount =
  getMinisterUnreadNotificationCount;

/*
 * The Minister page is a bundled non-module document.
 * Keep the browser bridge small and explicit.
 */
window.CARVO_MINISTER_API = {
  getMinisterDashboard,
  getMinisterSituations,
  getMinisterActions,
  getMinisterProjects,
  getMinisterProtocols,
  getMinisterNotifications,
  getMinisterUnreadNotificationCount,
  markMinisterNotificationAsRead,
  markAllMinisterNotificationsAsRead,
  deleteMinisterNotification,
  getMinisterResults,
  getMinisterFeedback,
  getMinisterEvents,
  getMinisterAuditLogs,
  deleteMinisterEvent,
  deleteMinisterResult,
  deleteMinisterFeedback,
  createMinisterSituation,
  requestMinisterAnalysis,
  getMinisterAnalysisJob,
  getMinisterAnalysis,
  getMinisterRecommendations,
  getMinisterProtocol,
  getMinisterProtocolVersions,
  getMinisterSituationAnalyses,
  createMinisterAction,
  updateMinisterActionStatus,
  createMinisterProject,
  updateMinisterProjectStatus,
  getMinisterProjectMilestones,
  createMinisterMilestone,
  updateMinisterMilestoneCompletion,
  createMinisterEvent,
  createMinisterResult,
  updateMinisterResultStatus,
  createMinisterFeedback,
  getMinisterResult,
};
