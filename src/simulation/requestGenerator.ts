import type {
  NetworkRequest,
  RequestPriority,
} from "@/types";

let requestCounter = 1;

function randomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRequest(): NetworkRequest {
  const priority = randomInteger(1, 5) as RequestPriority;
  const complexity = randomInteger(1, 10);

  // Request size used to increase server load.
  const requestSize = randomInteger(1, 10);

  const now = Date.now();

  return {
    id: `REQ-${requestCounter++}`,
    priority,
    requestSize,
    complexity,
    status: "created",
    arrivalTime: now,
    queueEntryTime: now,
  };
}