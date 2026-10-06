import type { Server } from "@/types";

/**
 * Numerical simulation assumptions.
 *
 * The paper gives the relationship:
 *
 * ART = k * (L * Q * C) / (R * S)
 *
 * but does not specify fixed numerical values for all
 * constants required for this web simulation.
 */
const RESPONSE_TIME_K = 0.1;
const CONFIGURATION_FACTOR = 1;

/**
 * Calculates the current simulated response time of a server.
 *
 * The dynamic penalty is based on Equation (3) from the paper:
 *
 * ART = k * (L * Q * C) / (R * S)
 *
 * L = current server load
 * Q = effective queue length
 * C = task complexity
 * R = resource availability
 * S = configuration factor
 *
 * Implementation assumption:
 *
 * The calculated term is treated as additional delay on top
 * of the server's baseline response time.
 */
export function calculateDynamicResponseTime(
  server: Server,
  averageComplexity: number,
  queueLength: number,
  activeRequestCount: number
): number {
  /**
   * When the server has no active work and there is no queue,
   * return to its baseline response time.
   */
  if (
    activeRequestCount === 0 &&
    queueLength === 0
  ) {
    return server.baseResponseTime;
  }

  const loadFactor = Math.max(
    server.currentLoad,
    1
  );

  /**
   * Equation (3) contains queue length Q.
   *
   * During processing, Q may temporarily be zero even though
   * the server is still handling active requests.
   *
   * We therefore use an effective minimum of 1 while the
   * server is active.
   */
  const queueFactor = Math.max(
    queueLength,
    1
  );

  const complexityFactor = Math.max(
    averageComplexity,
    1
  );

  /**
   * Simulation assumption:
   *
   * Bandwidth is used as our representation of available
   * network resources R.
   *
   * Dividing by 100 normalizes the 100-1000 Mbps range.
   */
  const resourceAvailability = Math.max(
    server.bandwidthMbps / 100,
    1
  );

  const dynamicDelay =
    RESPONSE_TIME_K *
    (
      loadFactor *
      queueFactor *
      complexityFactor
    ) /
    (
      resourceAvailability *
      CONFIGURATION_FACTOR
    );

  return (
    server.baseResponseTime +
    dynamicDelay
  );
}