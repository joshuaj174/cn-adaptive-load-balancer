export type RequestPriority =
  | 1
  | 2
  | 3
  | 4
  | 5;

export type RequestStatus =
  | "created"
  | "queued"
  | "waiting"
  | "evaluating"
  | "assigned"
  | "processing"
  | "completed"
  | "failed";

export interface HybridServerEvaluationSnapshot {
  serverId: number;

  serverName: string;

  rFast: number;

  rBal: number;

  score: number;

  currentLoad: number;

  responseTime: number;
}

export interface HybridDecisionSnapshot {
  alpha: number;

  highPriorityThreshold: number;

  selectedServerId: number;

  evaluations:
    HybridServerEvaluationSnapshot[];
}

export interface NetworkRequest {
  id: string;

  // Priority defined on a 1-5 scale
  priority: RequestPriority;

  // Request size used when updating server load
  requestSize: number;

  // Paper experiment uses task complexity levels 1-10
  complexity: number;

  status: RequestStatus;

  arrivalTime: number;

  queueEntryTime?: number;

  assignedServerId?: number;

  processingStartTime?: number;

  completionTime?: number;

  waitingTimeMs?: number;

  processingTimeMs?: number;

  totalResponseTimeMs?: number;

  /*
   * Stored only when the Hybrid algorithm
   * performs the server-selection step.
   *
   * This preserves the exact scores that
   * existed at assignment time.
   */
  hybridDecision?: HybridDecisionSnapshot;
}