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
  const completed = state.completedRequests;

  const averageResponseTimeMs =
    completed.length === 0
      ? 0
      : completed.reduce(
          (sum, request) =>
            sum +
            (request.totalResponseTimeMs ?? 0),
          0
        ) / completed.length;

  const averageWaitingTimeMs =
    completed.length === 0
      ? 0
      : completed.reduce(
          (sum, request) =>
            sum +
            (request.waitingTimeMs ?? 0),
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

    failedRequests: state.metrics.failedRequests,

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
    return selectFRLBServer(state.servers);
  }

  if (state.algorithm === "hybrid") {
    const result = selectHybridServer(
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

function completeFinishedRequests(
  state: SimulationState,
  now: number
): SimulationState {
  const finishedRequests =
    state.activeRequests.filter(
      (request) =>
        request.completionTime !== undefined &&
        request.completionTime <= now
    );

  if (finishedRequests.length === 0) {
    return state;
  }

  let servers = [...state.servers];

  const completedRequests: NetworkRequest[] = [
    ...state.completedRequests,
  ];

  for (const request of finishedRequests) {
    if (request.assignedServerId === undefined) {
      continue;
    }

    servers = servers.map((server) =>
      server.id === request.assignedServerId
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
        request.completionTime === undefined ||
        request.completionTime > now
    );

  return {
    ...state,
    servers,
    activeRequests,
    completedRequests,
  };
}

function assignRequest(
  request: NetworkRequest,
  state: SimulationState,
  options: SimulationOptions,
  now: number
): SimulationState {
  const selectedServer = chooseServer(
    request,
    state,
    options
  );

  if (!selectedServer) {
    return state;
  }

  const waitingTimeMs =
    now - (request.queueEntryTime ?? request.arrivalTime);

  const responseTime =
    calculateDynamicResponseTime(
      selectedServer,
      request,
      state.requestQueue.length
    );

  const processingTimeMs =
    responseTime * 100;

  const completionTime =
    now + processingTimeMs;

  const updatedRequest: NetworkRequest = {
    ...request,
    status: "processing",
    assignedServerId: selectedServer.id,
    processingStartTime: now,
    waitingTimeMs,
    processingTimeMs,
    completionTime,
    totalResponseTimeMs:
      waitingTimeMs + processingTimeMs,
  };

  const servers = state.servers.map((server) =>
    server.id === selectedServer.id
      ? {
          ...updateServerAfterAssignment(
            server,
            request.requestSize
          ),
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
          queuedRequest.id !== request.id
      ),
    activeRequests: [
      ...state.activeRequests,
      updatedRequest,
    ],
  };
}

function processPBLB(
  state: SimulationState,
  options: SimulationOptions,
  now: number
): SimulationState {
  const selection = runPBLBSelection(
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
    now
  );
}

export function processSimulationTick(
  currentState: SimulationState,
  options: SimulationOptions,
  now = Date.now()
): SimulationState {
  let state = completeFinishedRequests(
    currentState,
    now
  );

  if (state.requestQueue.length === 0) {
    return {
      ...state,
      metrics: calculateMetrics(state),
    };
  }

  if (state.algorithm === "pblb") {
    state = processPBLB(
      state,
      options,
      now
    );
  } else {
    const request = state.requestQueue[0];

    state = assignRequest(
      request,
      state,
      options,
      now
    );
  }

  return {
    ...state,
    metrics: calculateMetrics(state),
  };
}