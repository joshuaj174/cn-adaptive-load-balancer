import type { NetworkRequest, Server } from "@/types";
import { getAvailableServers } from "@/simulation";
import { getNextPriorityRequest } from "@/simulation/priorityQueue";

export interface PBLBSelectionResult {
  request: NetworkRequest;
  server: Server;
}

/**
 * Selects the highest-priority request from the queue.
 */
export function selectPBLBRequest(
  requests: NetworkRequest[]
): NetworkRequest | null {
  return getNextPriorityRequest(requests);
}

/**
 * Selects a server for the chosen PBLB request.
 *
 * The paper states that a PBLB implementation aiming
 * to minimize response time may select the server with
 * the minimum current response time.
 */
export function selectPBLBServer(
  servers: Server[]
): Server | null {
  const availableServers = getAvailableServers(servers);

  if (availableServers.length === 0) {
    return null;
  }

  return availableServers.reduce((bestServer, currentServer) => {
    if (currentServer.responseTime < bestServer.responseTime) {
      return currentServer;
    }

    if (
      currentServer.responseTime === bestServer.responseTime &&
      currentServer.id < bestServer.id
    ) {
      return currentServer;
    }

    return bestServer;
  });
}

/**
 * Complete PBLB selection step:
 *
 * 1. Choose highest-priority request.
 * 2. Choose an available server.
 */
export function runPBLBSelection(
  requests: NetworkRequest[],
  servers: Server[]
): PBLBSelectionResult | null {
  const request = selectPBLBRequest(requests);

  if (!request) {
    return null;
  }

  const server = selectPBLBServer(servers);

  if (!server) {
    return null;
  }

  return {
    request,
    server,
  };
}