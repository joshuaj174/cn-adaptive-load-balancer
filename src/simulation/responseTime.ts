import type {
  NetworkRequest,
  Server,
} from "@/types";

/**
 * Response-time model based on Equation (3) from the paper:
 *
 * ART = k * (L * Q * C) / (R * S)
 *
 * Paper variables:
 * L = system load
 * Q = queue length
 * C = task complexity
 * R = resource availability
 * S = system configuration factor
 * k = proportionality constant
 *
 * The paper does not provide fixed numerical values for k or S,
 * so this web simulation treats them as explicit assumptions.
 */
export function calculateDynamicResponseTime(
  server: Server,
  request: NetworkRequest,
  queueLength: number
): number {
  const k = 0.05;

  const loadFactor = Math.max(server.currentLoad, 1);

  // Avoid zero because Equation (3) multiplies by Q.
  const queueFactor = Math.max(queueLength, 1);

  const complexityFactor = Math.max(request.complexity, 1);

  /**
   * Simulation assumption:
   * higher bandwidth represents greater resource availability.
   *
   * Normalized relative to 100 Mbps.
   */
  const resourceAvailability =
    Math.max(server.bandwidthMbps / 100, 1);

  /**
   * No dynamic system configuration changes are being simulated
   * in this version, so S = 1.
   */
  const configurationFactor = 1;

  const responseTime =
    k *
    ((loadFactor * queueFactor * complexityFactor) /
      (resourceAvailability * configurationFactor));

  return Math.max(responseTime, 0.1);
}