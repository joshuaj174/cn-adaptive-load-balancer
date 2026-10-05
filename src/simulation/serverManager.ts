import type { Server } from "@/types";

export function isServerAvailable(server: Server): boolean {
  return (
    server.status !== "offline" &&
    server.currentLoad < server.maxLoad
  );
}

export function getAvailableServers(servers: Server[]): Server[] {
  return servers.filter(isServerAvailable);
}

export function updateServerAfterAssignment(
  server: Server,
  requestSize: number
): Server {
  const updatedLoad = Math.min(
    server.currentLoad + requestSize,
    server.maxLoad
  );

  return {
    ...server,
    currentLoad: updatedLoad,
    activeRequests: server.activeRequests + 1,
    status:
      updatedLoad >= server.maxLoad ? "busy" : "available",
  };
}