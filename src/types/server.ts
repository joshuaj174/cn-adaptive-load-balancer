export type ServerStatus =
  | "available"
  | "busy"
  | "offline";

export interface Server {
  id: number;
  name: string;

  currentLoad: number;
  maxLoad: number;

  /**
   * Baseline response time of the server when it is not
   * under simulated request pressure.
   */
  baseResponseTime: number;

  /**
   * Current dynamic response time.
   */
  responseTime: number;

  bandwidthMbps: number;

  status: ServerStatus;

  activeRequests: number;
  completedRequests: number;
}