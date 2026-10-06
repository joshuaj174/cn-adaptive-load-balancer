import type {
  NetworkRequest,
  Server,
  SimulationMetrics,
  SimulationState,
} from "@/types";

import {
  selectFRLBServer,
  runPBLBSelection,
  selectHybridServer,
} from "@/algorithms";

import {
  updateServerAfterAssignment,
  updateServerAfterCompletion,
} from "./serverManager";

import {
  calculateDynamicResponseTime,
} from "./responseTime";

export interface SimulationOptions {
  alpha: number;
  highPriorityThreshold: number;
}

function calculateMetrics(
  state: SimulationState
): SimulationMetrics {
  const completed =
    state.completedRequests;

  const averageResponseTimeMs =
    completed.length === 0
      ? 0
      : completed.reduce(
          (sum, request) =>
            sum +
            (
              request.totalResponseTimeMs ??
              0
            ),
          0
        ) / completed.length;

  const averageWaitingTimeMs =
    completed.length === 0
      ? 0
      : completed.reduce(
          (sum, request) =>
            sum +
            (
              request.waitingTimeMs ??
              0
            ),
          0
        ) / completed.length;

  const averageServerLoad =
    state.servers.length === 0
      ? 0
      : state.servers.reduce(
          (sum, server) =>
            sum + server.currentLoad,
          0
        ) / state.servers.length;

  return {
    totalRequests:
      state.requestQueue.length +
      state.activeRequests.length +
      state.completedRequests.length,

    completedRequests:
      state.completedRequests.length,

    failedRequests:
      state.metrics.failedRequests,

    averageResponseTimeMs,

    averageWaitingTimeMs,

    averageServerLoad,
  };
}

function chooseServer(
  request: NetworkRequest,
  state: SimulationState,
  options: SimulationOptions
): Server | null {
  if (state.algorithm === "frlb") {
    return selectFRLBServer(
      state.servers
    );
  }

  if (state.algorithm === "hybrid") {
    const result =
      selectHybridServer(
        request,
        state.servers,
        {
          alpha: options.alpha,
          highPriorityThreshold:
            options.highPriorityThreshold,
        }
      );

    return result?.server ?? null;
  }

  return null;
}

/**
 * Recalculates each server's response time
 * using its current load and active requests.
 */
function refreshServerResponseTimes(
  state: SimulationState
): SimulationState {
  const servers =
    state.servers.map((server) => {
      const serverRequests =
        state.activeRequests.filter(
          (request) =>
            request.assignedServerId ===
            server.id
        );

      const averageComplexity =
        serverRequests.length === 0
          ? 1
          : serverRequests.reduce(
              (sum, request) =>
                sum + request.complexity,
              0
            ) / serverRequests.length;

      const responseTime =
        calculateDynamicResponseTime(
          server,
          averageComplexity,
          state.requestQueue.length,
          serverRequests.length
        );

      return {
        ...server,
        responseTime,
      };
    });

  return {
    ...state,
    servers,
  };
}

/**
 * Completes requests whose processing time
 * has expired.
 */
function completeFinishedRequests(
  state: SimulationState,
  now: number
): SimulationState {
  const finishedRequests =
    state.activeRequests.filter(
      (request) =>
        request.completionTime !==
          undefined &&
        request.completionTime <= now
    );

  if (finishedRequests.length === 0) {
    return state;
  }

  let servers = [
    ...state.servers,
  ];

  const completedRequests: NetworkRequest[] =
    [
      ...state.completedRequests,
    ];

  for (
    const request of finishedRequests
  ) {
    if (
      request.assignedServerId ===
      undefined
    ) {
      continue;
    }

    servers = servers.map(
      (server) =>
        server.id ===
        request.assignedServerId
          ? updateServerAfterCompletion(
              server,
              request.requestSize
            )
          : server
    );

    completedRequests.push({
      ...request,
      status: "completed",
    });
  }

  const activeRequests =
    state.activeRequests.filter(
      (request) =>
        request.completionTime ===
          undefined ||
        request.completionTime > now
    );

  return {
    ...state,
    servers,
    activeRequests,
    completedRequests,
  };
}

/**
 * Assigns a request to a server.
 *
 * If a server is already selected, such as
 * during PBLB selection, it is used directly.
 *
 * Otherwise FRLB or Hybrid performs the
 * server-selection step here.
 */
function assignRequest(
  request: NetworkRequest,
  state: SimulationState,
  options: SimulationOptions,
  now: number,
  preselectedServer?: Server
): SimulationState {
  const selectedServer =
    preselectedServer ??
    chooseServer(
      request,
      state,
      options
    );

  if (!selectedServer) {
    return state;
  }

  const waitingTimeMs =
    now -
    (
      request.queueEntryTime ??
      request.arrivalTime
    );

  /**
   * Paper Algorithm 1:
   *
   * Li = Li + request size
   */
  const serverAfterAssignment =
    updateServerAfterAssignment(
      selectedServer,
      request.requestSize
    );

  const queueLengthAfterAssignment =
    Math.max(
      state.requestQueue.length - 1,
      0
    );

  /**
   * Calculate response time using the
   * updated server load.
   */
  const responseTime =
    calculateDynamicResponseTime(
      serverAfterAssignment,
      request.complexity,
      queueLengthAfterAssignment,
      serverAfterAssignment.activeRequests
    );

  /**
   * Converts simulated response time into
   * a visible processing duration.
   */
  const processingTimeMs =
    responseTime * 100;

  const completionTime =
    now + processingTimeMs;

  const updatedRequest: NetworkRequest = {
    ...request,

    status: "processing",

    assignedServerId:
      selectedServer.id,

    processingStartTime: now,

    waitingTimeMs,

    processingTimeMs,

    completionTime,

    totalResponseTimeMs:
      waitingTimeMs +
      processingTimeMs,
  };

  const servers =
    state.servers.map(
      (server) =>
        server.id ===
        selectedServer.id
          ? {
              ...serverAfterAssignment,
              responseTime,
            }
          : server
    );

  return {
    ...state,

    servers,

    requestQueue:
      state.requestQueue.filter(
        (queuedRequest) =>
          queuedRequest.id !==
          request.id
      ),

    activeRequests: [
      ...state.activeRequests,
      updatedRequest,
    ],
  };
}

/**
 * PBLB:
 *
 * 1. Select highest-priority request.
 * 2. Select server.
 * 3. Assign that request to the selected server.
 */
function processPBLB(
  state: SimulationState,
  options: SimulationOptions,
  now: number
): SimulationState {
  const selection =
    runPBLBSelection(
      state.requestQueue,
      state.servers
    );

  if (!selection) {
    return state;
  }

  return assignRequest(
    selection.request,
    state,
    options,
    now,
    selection.server
  );
}

export function processSimulationTick(
  currentState: SimulationState,
  options: SimulationOptions,
  now = Date.now()
): SimulationState {
  /**
   * 1. Complete finished requests.
   */
  let state =
    completeFinishedRequests(
      currentState,
      now
    );

  /**
   * 2. Update response times after any
   * completed requests reduced server load.
   */
  state =
    refreshServerResponseTimes(
      state
    );

  /**
   * 3. Process one queued request.
   */
  if (
    state.requestQueue.length > 0
  ) {
    if (
      state.algorithm === "pblb"
    ) {
      state = processPBLB(
        state,
        options,
        now
      );
    } else {
      const request =
        state.requestQueue[0];

      state = assignRequest(
        request,
        state,
        options,
        now
      );
    }
  }

  /**
   * 4. Assignment may have changed load,
   * so refresh response times again.
   */
  state =
    refreshServerResponseTimes(
      state
    );

  /**
   * 5. Recalculate metrics.
   */
  return {
    ...state,

    metrics:
      calculateMetrics(state),
  };
}