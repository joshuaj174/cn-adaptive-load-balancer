import type { NetworkRequest } from "@/types";

/**
 * Returns the request that should be processed next.
 *
 * PBLB rule:
 * SelectedRequest = arg max P_i
 *
 * Higher priority values are processed first.
 *
 * Tie-break:
 * Earlier arrival time wins.
 */
export function getNextPriorityRequest(
  requests: NetworkRequest[]
): NetworkRequest | null {
  if (requests.length === 0) {
    return null;
  }

  return [...requests].sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }

    if (a.arrivalTime !== b.arrivalTime) {
      return a.arrivalTime - b.arrivalTime;
    }

    return a.id.localeCompare(b.id);
  })[0];
}

/**
 * Sorts the complete queue according to PBLB priority.
 */
export function sortPriorityQueue(
  requests: NetworkRequest[]
): NetworkRequest[] {
  return [...requests].sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }

    if (a.arrivalTime !== b.arrivalTime) {
      return a.arrivalTime - b.arrivalTime;
    }

    return a.id.localeCompare(b.id);
  });
}   