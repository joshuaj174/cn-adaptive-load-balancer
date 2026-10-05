export type RequestPriority = 1 | 2 | 3 | 4 | 5;

export type RequestStatus =
  | "created"
  | "queued"
  | "waiting"
  | "evaluating"
  | "assigned"
  | "processing"
  | "completed"
  | "failed";

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
}