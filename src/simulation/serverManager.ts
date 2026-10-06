import type { Server } from "@/types";

export function isServerAvailable(
  server: Server
): boolean {
  return (
    server.status !== "offline" &&
    server.currentLoad < server.maxLoad
  );
}

export function getAvailableServers(
  servers: Server[]
): Server[] {
  return servers.filter(isServerAvailable);
}

export function updateServerAfterAssignment(
  server: Server,
  requestSize: number
): Server {
  /**
   * Research algorithm:
   *
   * Li = Li + request size
   */
  const updatedLoad =
    server.currentLoad + requestSize;

  return {
    ...server,

    currentLoad: updatedLoad,

    activeRequests:
      server.activeRequests + 1,

    status:
      updatedLoad >= server.maxLoad
        ? "busy"
        : "available",
  };
}

export function updateServerAfterCompletion(
  server: Server,
  requestSize: number
): Server {
  /**
   * Remove the completed request's load,
   * but never allow the simulated server
   * to drop below its baseline load.
   */
  const updatedLoad = Math.max(
    server.currentLoad - requestSize,
    server.baseLoad
  );

  const updatedActiveRequests = Math.max(
    server.activeRequests - 1,
    0
  );

  return {
    ...server,

    currentLoad: updatedLoad,

    activeRequests:
      updatedActiveRequests,

    completedRequests:
      server.completedRequests + 1,

    status:
      server.status === "offline"
        ? "offline"
        : updatedLoad >= server.maxLoad
          ? "busy"
          : "available",
  };
}