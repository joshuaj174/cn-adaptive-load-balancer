export type ServerStatus =
  | "available"
  | "busy"
  | "offline";

export interface Server {
  id: number;
  name: string;

  /**
   * Baseline load of the server before
   * simulated requests are added.
   */
  baseLoad: number;

  /**
   * Current dynamic server load.
   */
  currentLoad: number;

  maxLoad: number;

  /**
   * Baseline response time when the server
   * is back at its initial state.
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