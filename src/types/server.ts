export type ServerStatus = "available" | "busy" | "offline";

export interface Server {
  id: number;
  name: string;

  // Current server load Li
  currentLoad: number;

  // Maximum load threshold Lmax
  maxLoad: number;

  // Current / estimated response time RTi in milliseconds
  responseTime: number;

  // Server bandwidth in Mbps
  bandwidthMbps: number;

  // Current operational state
  status: ServerStatus;

  // Useful for our simulation and metrics
  activeRequests: number;
  completedRequests: number;
}