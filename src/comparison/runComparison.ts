import type {
  LoadBalancingAlgorithm,
  NetworkRequest,
  RequestPriority,
  SimulationState,
} from "@/types";

import { initialServers } from "@/simulation/initialServers";
import { processSimulationTick } from "@/simulation/simulator";

export interface AlgorithmComparisonResult {
  algorithm: LoadBalancingAlgorithm;
  label: string;

  totalRequests: number;
  completedRequests: number;

  averageResponseTimeMs: number;
  averageProcessingTimeMs: number;
  averageWaitingTimeMs: number;

  averageServerLoad: number;

  peakQueueLength: number;

  throughputPerSecond: number;

  simulationDurationSeconds: number;

  serverDistribution: {
    serverId: number;
    completedRequests: number;
  }[];
}

export interface ComparisonRun {
  requestCount: number;
  requestsPerSecond: number;
  seed: number;

  results: AlgorithmComparisonResult[];
}

const SIMULATION_TICK_MS = 100;

const REQUESTS_PER_SECOND = 10;

const REQUEST_INTERVAL_MS =
  1000 / REQUESTS_PER_SECOND;

const MAX_SIMULATION_TICKS = 100000;

function createSeededRandom(seed: number) {
  let value = seed >>> 0;

  return function random(): number {
    value =
      (1664525 * value + 1013904223) >>> 0;

    return value / 4294967296;
  };
}

function randomInteger(
  random: () => number,
  min: number,
  max: number
): number {
  return (
    Math.floor(
      random() * (max - min + 1)
    ) + min
  );
}

/**
 * Creates one deterministic workload.
 *
 * The exact same generated requests are
 * reused for FRLB, PBLB and Hybrid.
 */
export function createComparisonWorkload(
  requestCount: number,
  seed = 2026
): NetworkRequest[] {
  const random =
    createSeededRandom(seed);

  return Array.from(
    { length: requestCount },
    (_, index) => {
      const arrivalTime =
        index * REQUEST_INTERVAL_MS;

      return {
        id: `COMPARE-${index + 1}`,

        priority: randomInteger(
          random,
          1,
          5
        ) as RequestPriority,

        requestSize: randomInteger(
          random,
          1,
          10
        ),

        complexity: randomInteger(
          random,
          1,
          10
        ),

        status: "queued",

        arrivalTime,

        queueEntryTime:
          arrivalTime,
      };
    }
  );
}

function createInitialComparisonState(
  algorithm: LoadBalancingAlgorithm
): SimulationState {
  return {
    algorithm,

    servers: initialServers.map(
      (server) => ({
        ...server,
      })
    ),

    requestQueue: [],

    activeRequests: [],

    completedRequests: [],

    metrics: {
      totalRequests: 0,
      completedRequests: 0,
      failedRequests: 0,
      averageResponseTimeMs: 0,
      averageWaitingTimeMs: 0,
      averageServerLoad: 0,
    },

    isRunning: true,
  };
}

function getAlgorithmLabel(
  algorithm: LoadBalancingAlgorithm
): string {
  if (algorithm === "frlb") {
    return "FRLB";
  }

  if (algorithm === "pblb") {
    return "PBLB";
  }

  return "Hybrid FRLB-PBLB";
}

function calculateAverageProcessingTime(
  requests: NetworkRequest[]
): number {
  if (requests.length === 0) {
    return 0;
  }

  return (
    requests.reduce(
      (sum, request) =>
        sum +
        (request.processingTimeMs ?? 0),
      0
    ) / requests.length
  );
}

function calculateAverageWaitingTime(
  requests: NetworkRequest[]
): number {
  if (requests.length === 0) {
    return 0;
  }

  return (
    requests.reduce(
      (sum, request) =>
        sum +
        (request.waitingTimeMs ?? 0),
      0
    ) / requests.length
  );
}

function calculateAverageResponseTime(
  requests: NetworkRequest[]
): number {
  if (requests.length === 0) {
    return 0;
  }

  return (
    requests.reduce(
      (sum, request) =>
        sum +
        (
          request.totalResponseTimeMs ??
          0
        ),
      0
    ) / requests.length
  );
}

function runSingleAlgorithm(
  algorithm: LoadBalancingAlgorithm,
  workload: NetworkRequest[]
): AlgorithmComparisonResult {
  let state =
    createInitialComparisonState(
      algorithm
    );

  let simulatedTime = 0;

  let nextRequestIndex = 0;

  let tickCount = 0;

  let peakQueueLength = 0;

  let totalAverageLoad = 0;

  let loadSampleCount = 0;

  while (
    tickCount <
    MAX_SIMULATION_TICKS
  ) {
    const arrivingRequests:
      NetworkRequest[] = [];

    while (
      nextRequestIndex <
        workload.length &&
      workload[nextRequestIndex]
        .arrivalTime <= simulatedTime
    ) {
      arrivingRequests.push({
        ...workload[
          nextRequestIndex
        ],
      });

      nextRequestIndex += 1;
    }

    if (
      arrivingRequests.length > 0
    ) {
      state = {
        ...state,

        requestQueue: [
          ...state.requestQueue,
          ...arrivingRequests,
        ],
      };
    }

    peakQueueLength = Math.max(
      peakQueueLength,
      state.requestQueue.length
    );

    state =
      processSimulationTick(
        state,
        {
          alpha: 0.5,
          highPriorityThreshold: 4,
        },
        simulatedTime
      );

    const currentAverageLoad =
      state.servers.reduce(
        (sum, server) =>
          sum +
          server.currentLoad,
        0
      ) / state.servers.length;

    totalAverageLoad +=
      currentAverageLoad;

    loadSampleCount += 1;

    peakQueueLength = Math.max(
      peakQueueLength,
      state.requestQueue.length
    );

    simulatedTime +=
      SIMULATION_TICK_MS;

    tickCount += 1;

    const allRequestsArrived =
      nextRequestIndex >=
      workload.length;

    const queueEmpty =
      state.requestQueue.length === 0;

    const noActiveRequests =
      state.activeRequests.length === 0;

    if (
      allRequestsArrived &&
      queueEmpty &&
      noActiveRequests
    ) {
      break;
    }
  }

  const simulationDurationSeconds =
    simulatedTime / 1000;

  const completedRequests =
    state.completedRequests;

  const completedRequestCount =
    completedRequests.length;

  const averageServerLoad =
    loadSampleCount === 0
      ? 0
      : totalAverageLoad /
        loadSampleCount;

  const throughputPerSecond =
    simulationDurationSeconds === 0
      ? 0
      : completedRequestCount /
        simulationDurationSeconds;

  return {
    algorithm,

    label:
      getAlgorithmLabel(
        algorithm
      ),

    totalRequests:
      workload.length,

    completedRequests:
      completedRequestCount,

    averageResponseTimeMs:
      calculateAverageResponseTime(
        completedRequests
      ),

    averageProcessingTimeMs:
      calculateAverageProcessingTime(
        completedRequests
      ),

    averageWaitingTimeMs:
      calculateAverageWaitingTime(
        completedRequests
      ),

    averageServerLoad,

    peakQueueLength,

    throughputPerSecond,

    simulationDurationSeconds,

    serverDistribution:
      state.servers.map(
        (server) => ({
          serverId:
            server.id,

          completedRequests:
            server.completedRequests,
        })
      ),
  };
}

export function runAlgorithmComparison(
  requestCount = 100,
  seed = 2026
): ComparisonRun {
  const workload =
    createComparisonWorkload(
      requestCount,
      seed
    );

  const algorithms:
    LoadBalancingAlgorithm[] = [
      "frlb",
      "pblb",
      "hybrid",
    ];

  const results =
    algorithms.map(
      (algorithm) =>
        runSingleAlgorithm(
          algorithm,
          workload
        )
    );

  return {
    requestCount,

    requestsPerSecond:
      REQUESTS_PER_SECOND,

    seed,

    results,
  };
}