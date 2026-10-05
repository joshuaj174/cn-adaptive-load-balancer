import type { NetworkRequest, Server } from "@/types";
import { getAvailableServers } from "@/simulation";

export interface HybridOptions {
  /**
   * Weight between FRLB and PBLB terms.
   * Must be between 0 and 1.
   *
   * Paper:
   * Score(i) = alpha * R_fast(i) + (1 - alpha) * R_bal(i)
   */
  alpha: number;

  /**
   * The paper uses priorities 1-5 in its experiment,
   * but Algorithm 1 only distinguishes "high priority"
   * from other requests without defining the numeric cutoff.
   *
   * Therefore this threshold is configurable.
   */
  highPriorityThreshold: number;
}

export interface HybridEvaluation {
  serverId: number;
  serverName: string;

  rFast: number;
  rBal: number;
  score: number;

  currentLoad: number;
  responseTime: number;
}

export interface HybridSelectionResult {
  request: NetworkRequest;
  server: Server;
  evaluation: HybridEvaluation[];
}

/**
 * Ensures alpha stays inside the range defined by the paper:
 * 0 <= alpha <= 1
 */
function clampAlpha(alpha: number): number {
  return Math.max(0, Math.min(1, alpha));
}

/**
 * FRLB component from the paper:
 *
 * R_fast(i) = current_response_time(i)
 */
export function calculateRFast(server: Server): number {
  return server.responseTime;
}

/**
 * PBLB/load component according to Algorithm 1.
 *
 * High priority:
 * R_bal(i) = load(i)
 *
 * Otherwise:
 * R_bal(i) = load(i) / maxLoad
 */
export function calculateRBal(
  server: Server,
  request: NetworkRequest,
  highPriorityThreshold: number
): number {
  const isHighPriority =
    request.priority >= highPriorityThreshold;

  if (isHighPriority) {
    return server.currentLoad;
  }

  if (server.maxLoad <= 0) {
    return Number.POSITIVE_INFINITY;
  }

  return server.currentLoad / server.maxLoad;
}

/**
 * Hybrid score from Equation (6):
 *
 * Score(i) =
 * alpha * R_fast(i)
 * + (1 - alpha) * R_bal(i)
 */
export function calculateHybridScore(
  rFast: number,
  rBal: number,
  alpha: number
): number {
  const safeAlpha = clampAlpha(alpha);

  return (
    safeAlpha * rFast +
    (1 - safeAlpha) * rBal
  );
}

/**
 * Evaluates every currently available server.
 */
export function evaluateHybridServers(
  request: NetworkRequest,
  servers: Server[],
  options: HybridOptions
): HybridEvaluation[] {
  const availableServers = getAvailableServers(servers);

  return availableServers.map((server) => {
    const rFast = calculateRFast(server);

    const rBal = calculateRBal(
      server,
      request,
      options.highPriorityThreshold
    );

    const score = calculateHybridScore(
      rFast,
      rBal,
      options.alpha
    );

    return {
      serverId: server.id,
      serverName: server.name,
      rFast,
      rBal,
      score,
      currentLoad: server.currentLoad,
      responseTime: server.responseTime,
    };
  });
}

/**
 * Runs the Hybrid FRLB-PBLB server-selection step.
 *
 * The server with the minimum hybrid score is selected.
 */
export function selectHybridServer(
  request: NetworkRequest,
  servers: Server[],
  options: HybridOptions
): HybridSelectionResult | null {
  const evaluation = evaluateHybridServers(
    request,
    servers,
    options
  );

  if (evaluation.length === 0) {
    return null;
  }

  const bestEvaluation = evaluation.reduce(
    (best, current) => {
      if (current.score < best.score) {
        return current;
      }

      // Deterministic tie-breaker
      if (
        current.score === best.score &&
        current.serverId < best.serverId
      ) {
        return current;
      }

      return best;
    }
  );

  const selectedServer = servers.find(
    (server) => server.id === bestEvaluation.serverId
  );

  if (!selectedServer) {
    return null;
  }

  return {
    request,
    server: selectedServer,
    evaluation,
  };
}