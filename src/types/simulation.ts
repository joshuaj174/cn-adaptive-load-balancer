import type { LoadBalancingAlgorithm } from "./algorithm";
import type { NetworkRequest } from "./request";
import type { Server } from "./server";

export interface SimulationMetrics {
  totalRequests: number;
  completedRequests: number;
  failedRequests: number;

  averageResponseTimeMs: number;
  averageWaitingTimeMs: number;
  averageServerLoad: number;
}

export interface SimulationState {
  algorithm: LoadBalancingAlgorithm;

  servers: Server[];

  requestQueue: NetworkRequest[];

  completedRequests: NetworkRequest[];

  metrics: SimulationMetrics;

  isRunning: boolean;
}