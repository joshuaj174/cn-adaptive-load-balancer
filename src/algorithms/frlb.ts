import type { Server } from "@/types";
import { getAvailableServers } from "@/simulation";

export interface FRLBEvaluation {
  serverId: number;
  serverName: string;
  responseTime: number;
}

/**
 * Evaluates all currently available servers using FRLB.
 *
 * In FRLB, the response-time term is simply the current
 * response time of each server.
 *
 * R_fast(i) = RT_i
 */
export function evaluateFRLB(servers: Server[]): FRLBEvaluation[] {
  const availableServers = getAvailableServers(servers);

  return availableServers.map((server) => ({
    serverId: server.id,
    serverName: server.name,
    responseTime: server.responseTime,
  }));
}

/**
 * Selects the available server with the minimum response time.
 *
 * SelectedServer = arg min RT_i
 *
 * Returns null when no server is available.
 */
export function selectFRLBServer(servers: Server[]): Server | null {
  const availableServers = getAvailableServers(servers);

  if (availableServers.length === 0) {
    return null;
  }

  return availableServers.reduce((fastestServer, currentServer) => {
    if (currentServer.responseTime < fastestServer.responseTime) {
      return currentServer;
    }

    // Deterministic tie-break:
    // if response times are identical, select lower server ID.
    if (
      currentServer.responseTime === fastestServer.responseTime &&
      currentServer.id < fastestServer.id
    ) {
      return currentServer;
    }

    return fastestServer;
  });
}