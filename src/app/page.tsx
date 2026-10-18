"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type {
  LoadBalancingAlgorithm,
  NetworkRequest,
  RequestPriority,
  SimulationState,
} from "@/types";

import LiveCharts from "@/components/LiveCharts";
import NetworkTopology from "@/components/NetworkTopology";
import HybridScorePanel from "@/components/HybridScorePanel";
import PriorityQueuePanel from "@/components/PriorityQueuePanel";
import RequestHistoryPanel from "@/components/RequestHistoryPanel";

import { initialServers } from "@/simulation/initialServers";
import { generateRequest } from "@/simulation/requestGenerator";
import { processSimulationTick } from "@/simulation/simulator";

const HIGH_PRIORITY_THRESHOLD = 4;

type ScenarioId =
  | "custom"
  | "balanced"
  | "response-focus"
  | "priority-traffic"
  | "high-load";

interface SimulationScenario {
  id: ScenarioId;
  name: string;
  description: string;
  algorithm: LoadBalancingAlgorithm;
  alpha: number;
  requestsPerSecond: number;
  priority: RequestPriority;
  requestSize: number;
  complexity: number;
}

const simulationScenarios: SimulationScenario[] = [
  {
    id: "balanced",
    name: "Balanced Hybrid",
    description:
      "Moderate traffic using Hybrid FRLB-PBLB with equal response-time and load-balancing importance.",
    algorithm: "hybrid",
    alpha: 0.5,
    requestsPerSecond: 5,
    priority: 3,
    requestSize: 5,
    complexity: 5,
  },
  {
    id: "response-focus",
    name: "Response-Time Focus",
    description:
      "Hybrid routing gives more importance to server response time by using a higher alpha value.",
    algorithm: "hybrid",
    alpha: 0.8,
    requestsPerSecond: 5,
    priority: 3,
    requestSize: 5,
    complexity: 6,
  },
  {
    id: "priority-traffic",
    name: "Priority Traffic",
    description:
      "PBLB mode with high-priority requests to demonstrate priority-based request selection.",
    algorithm: "pblb",
    alpha: 0.5,
    requestsPerSecond: 10,
    priority: 5,
    requestSize: 6,
    complexity: 7,
  },
  {
    id: "high-load",
    name: "High Load",
    description:
      "Maximum automatic traffic rate with larger and more complex requests to increase server load.",
    algorithm: "hybrid",
    alpha: 0.5,
    requestsPerSecond: 10,
    priority: 4,
    requestSize: 9,
    complexity: 9,
  },
];

const createInitialState = (): SimulationState => ({
  algorithm: "hybrid",

  servers: initialServers.map((server) => ({
    ...server,
  })),

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

  isRunning: false,
});

export default function Home() {
  const [
    simulationState,
    setSimulationState,
  ] =
    useState<SimulationState>(
      createInitialState
    );

  const [
    algorithm,
    setAlgorithm,
  ] =
    useState<LoadBalancingAlgorithm>(
      "hybrid"
    );

  const [
    alpha,
    setAlpha,
  ] = useState(0.5);

  const [
    priority,
    setPriority,
  ] =
    useState<RequestPriority>(
      5
    );

  const [
    requestSize,
    setRequestSize,
  ] = useState(5);

  const [
    complexity,
    setComplexity,
  ] = useState(5);

  const [
    lastRequestId,
    setLastRequestId,
  ] =
    useState<string | null>(
      null
    );

  const [
    autoTrafficRunning,
    setAutoTrafficRunning,
  ] = useState(false);

  const [
    requestsPerSecond,
    setRequestsPerSecond,
  ] = useState(5);

  const [
    chartResetKey,
    setChartResetKey,
  ] = useState(0);

  const [
    selectedScenario,
    setSelectedScenario,
  ] =
    useState<ScenarioId>(
      "custom"
    );

  const requestCounter =
    useRef(1);

  /*
   * Main simulation engine.
   */
  useEffect(() => {
    const timer =
      setInterval(() => {
        setSimulationState(
          (currentState) =>
            processSimulationTick(
              currentState,
              {
                alpha,
                highPriorityThreshold:
                  HIGH_PRIORITY_THRESHOLD,
              },
              Date.now()
            )
        );
      }, 100);

    return () =>
      clearInterval(timer);
  }, [alpha]);

  /*
   * Automatic traffic generator.
   */
  useEffect(() => {
    if (!autoTrafficRunning) {
      return;
    }

    const intervalMs =
      1000 /
      requestsPerSecond;

    const trafficTimer =
      setInterval(() => {
        const generatedRequest =
          generateRequest();

        const request: NetworkRequest =
          {
            ...generatedRequest,

            id: `AUTO-${requestCounter.current++}`,

            status: "queued",

            queueEntryTime:
              Date.now(),
          };

        setLastRequestId(
          request.id
        );

        setSimulationState(
          (currentState) => ({
            ...currentState,

            algorithm,

            requestQueue: [
              ...currentState.requestQueue,
              request,
            ],

            isRunning: true,
          })
        );
      }, intervalMs);

    return () =>
      clearInterval(
        trafficTimer
      );
  }, [
    autoTrafficRunning,
    requestsPerSecond,
    algorithm,
  ]);

  const lastRequest =
    simulationState.activeRequests.find(
      (request) =>
        request.id ===
        lastRequestId
    ) ??
    simulationState.completedRequests.find(
      (request) =>
        request.id ===
        lastRequestId
    ) ??
    simulationState.requestQueue.find(
      (request) =>
        request.id ===
        lastRequestId
    ) ??
    null;

  const activeScenario =
    selectedScenario ===
    "custom"
      ? null
      : simulationScenarios.find(
          (scenario) =>
            scenario.id ===
            selectedScenario
        ) ?? null;

  function handleScenarioChange(
    scenarioId: ScenarioId
  ) {
    setSelectedScenario(
      scenarioId
    );

    if (
      scenarioId === "custom"
    ) {
      return;
    }

    const scenario =
      simulationScenarios.find(
        (item) =>
          item.id === scenarioId
      );

    if (!scenario) {
      return;
    }

    setAlgorithm(
      scenario.algorithm
    );

    setAlpha(
      scenario.alpha
    );

    setRequestsPerSecond(
      scenario.requestsPerSecond
    );

    setPriority(
      scenario.priority
    );

    setRequestSize(
      scenario.requestSize
    );

    setComplexity(
      scenario.complexity
    );

    setSimulationState(
      (currentState) => ({
        ...currentState,

        algorithm:
          scenario.algorithm,
      })
    );
  }

  function handleAlgorithmChange(
    value: LoadBalancingAlgorithm
  ) {
    setAlgorithm(value);

    setSelectedScenario(
      "custom"
    );

    setSimulationState(
      (currentState) => ({
        ...currentState,

        algorithm: value,
      })
    );
  }

  function handleAlphaChange(
    value: number
  ) {
    setAlpha(value);

    setSelectedScenario(
      "custom"
    );
  }

  function handleTrafficRateChange(
    value: number
  ) {
    setRequestsPerSecond(
      value
    );

    setSelectedScenario(
      "custom"
    );
  }

  function handlePriorityChange(
    value: RequestPriority
  ) {
    setPriority(value);

    setSelectedScenario(
      "custom"
    );
  }

  function handleRequestSizeChange(
    value: number
  ) {
    setRequestSize(value);

    setSelectedScenario(
      "custom"
    );
  }

  function handleComplexityChange(
    value: number
  ) {
    setComplexity(value);

    setSelectedScenario(
      "custom"
    );
  }

  function handleSendRequest() {
    const now =
      Date.now();

    const request: NetworkRequest =
      {
        id: `MANUAL-${requestCounter.current++}`,

        priority,

        requestSize,

        complexity,

        status:
          "queued",

        arrivalTime:
          now,

        queueEntryTime:
          now,
      };

    setLastRequestId(
      request.id
    );

    setSimulationState(
      (currentState) => ({
        ...currentState,

        algorithm,

        requestQueue: [
          ...currentState.requestQueue,
          request,
        ],
      })
    );
  }

  function handleStartAutoTraffic() {
    setAutoTrafficRunning(
      true
    );

    setSimulationState(
      (currentState) => ({
        ...currentState,

        algorithm,

        isRunning: true,
      })
    );
  }

  function handleStopAutoTraffic() {
    setAutoTrafficRunning(
      false
    );

    setSimulationState(
      (currentState) => ({
        ...currentState,

        isRunning: false,
      })
    );
  }

  function handleReset() {
    setAutoTrafficRunning(
      false
    );

    setSimulationState(
      createInitialState()
    );

    setLastRequestId(
      null
    );

    requestCounter.current =
      1;

    setChartResetKey(
      (currentKey) =>
        currentKey + 1
    );

    setAlgorithm(
      "hybrid"
    );

    setAlpha(
      0.5
    );

    setPriority(
      5
    );

    setRequestSize(
      5
    );

    setComplexity(
      5
    );

    setRequestsPerSecond(
      5
    );

    setSelectedScenario(
      "custom"
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                Adaptive Hybrid
                Load Balancing
                Simulator
              </h1>

              <p className="mt-2 text-slate-400">
                FRLB, PBLB and
                Hybrid FRLB-PBLB
                simulation
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/research"
                className="rounded-lg bg-slate-800 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
              >
                Research
              </Link>

              <Link
                href="/compare"
                className="rounded-lg bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-500"
              >
                Compare Algorithms
              </Link>
            </div>
          </div>
        </header>

        {/* SIMULATION SCENARIOS */}
        <section className="mb-6 rounded-xl border border-blue-900 bg-slate-900 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-400">
                Workload Presets
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Simulation Scenarios
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Scenarios only
                configure the
                workload and
                simulator controls.
                They do not change
                the FRLB, PBLB or
                Hybrid algorithm
                logic.
              </p>
            </div>

            <div className="w-full sm:w-72">
              <label className="mb-2 block text-sm text-slate-300">
                Select Scenario
              </label>

              <select
                value={
                  selectedScenario
                }
                onChange={(
                  event
                ) =>
                  handleScenarioChange(
                    event.target
                      .value as ScenarioId
                  )
                }
                disabled={
                  autoTrafficRunning
                }
                className="w-full rounded-lg bg-slate-800 p-3 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="custom">
                  Custom
                  Configuration
                </option>

                {simulationScenarios.map(
                  (scenario) => (
                    <option
                      key={
                        scenario.id
                      }
                      value={
                        scenario.id
                      }
                    >
                      {
                        scenario.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {activeScenario && (
            <div className="mt-5 grid gap-4 lg:grid-cols-[2fr_1fr]">
              <div className="rounded-lg bg-slate-800 p-5">
                <h3 className="font-semibold text-blue-300">
                  {
                    activeScenario.name
                  }
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {
                    activeScenario.description
                  }
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-800 p-5 text-sm">
                <div>
                  <p className="text-xs text-slate-500">
                    Algorithm
                  </p>

                  <p className="mt-1 font-semibold uppercase">
                    {
                      activeScenario.algorithm
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Traffic
                  </p>

                  <p className="mt-1 font-semibold">
                    {
                      activeScenario.requestsPerSecond
                    }{" "}
                    req/s
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Priority
                  </p>

                  <p className="mt-1 font-semibold">
                    {
                      activeScenario.priority
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Complexity
                  </p>

                  <p className="mt-1 font-semibold">
                    {
                      activeScenario.complexity
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* CONTROLS + SERVERS */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* SIMULATION CONTROLS */}
          <section className="rounded-xl bg-slate-900 p-6">
            <h2 className="mb-5 text-xl font-semibold">
              Simulation Controls
            </h2>

            <div className="space-y-4">
              {/* ALGORITHM */}
              <div>
                <label className="mb-1 block text-sm">
                  Algorithm
                </label>

                <select
                  value={
                    algorithm
                  }
                  onChange={(
                    event
                  ) =>
                    handleAlgorithmChange(
                      event.target
                        .value as LoadBalancingAlgorithm
                    )
                  }
                  disabled={
                    autoTrafficRunning
                  }
                  className="w-full rounded bg-slate-800 p-2 disabled:opacity-50"
                >
                  <option value="frlb">
                    FRLB
                  </option>

                  <option value="pblb">
                    PBLB
                  </option>

                  <option value="hybrid">
                    Hybrid FRLB-PBLB
                  </option>
                </select>
              </div>

              {/* ALPHA */}
              {algorithm ===
                "hybrid" && (
                <div className="rounded-lg border border-violet-900 bg-violet-950/20 p-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold">
                      Hybrid Alpha
                    </label>

                    <span className="rounded bg-violet-900 px-2 py-1 text-sm font-semibold text-violet-200">
                      {alpha.toFixed(
                        2
                      )}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={
                      alpha
                    }
                    onChange={(
                      event
                    ) =>
                      handleAlphaChange(
                        Number(
                          event.target
                            .value
                        )
                      )
                    }
                    disabled={
                      autoTrafficRunning
                    }
                    className="mt-3 w-full"
                  />

                  <div className="mt-2 flex justify-between text-xs text-slate-400">
                    <span>
                      0 = Load focus
                    </span>

                    <span>
                      1 = Response focus
                    </span>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-slate-400">
                    Score = α ×
                    R_fast + (1 -
                    α) × R_bal
                  </p>
                </div>
              )}

              {/* TRAFFIC RATE */}
              <div>
                <label className="mb-1 block text-sm">
                  Auto Traffic
                  Rate
                </label>

                <select
                  value={
                    requestsPerSecond
                  }
                  onChange={(
                    event
                  ) =>
                    handleTrafficRateChange(
                      Number(
                        event.target
                          .value
                      )
                    )
                  }
                  disabled={
                    autoTrafficRunning
                  }
                  className="w-full rounded bg-slate-800 p-2 disabled:opacity-50"
                >
                  <option value={1}>
                    1 request /
                    second
                  </option>

                  <option value={2}>
                    2 requests /
                    second
                  </option>

                  <option value={5}>
                    5 requests /
                    second
                  </option>

                  <option value={10}>
                    10 requests /
                    second
                  </option>
                </select>
              </div>

              {/* START / STOP */}
              {!autoTrafficRunning ? (
                <button
                  type="button"
                  onClick={
                    handleStartAutoTraffic
                  }
                  className="w-full rounded bg-green-600 px-4 py-2 font-semibold hover:bg-green-500"
                >
                  Start Auto
                  Traffic
                </button>
              ) : (
                <button
                  type="button"
                  onClick={
                    handleStopAutoTraffic
                  }
                  className="w-full rounded bg-red-600 px-4 py-2 font-semibold hover:bg-red-500"
                >
                  Stop Auto
                  Traffic
                </button>
              )}

              {/* MANUAL REQUEST */}
              <div className="border-t border-slate-700 pt-5">
                <h3 className="mb-4 font-semibold">
                  Manual Request
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm">
                      Priority:{" "}
                      {priority}
                    </label>

                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={
                        priority
                      }
                      onChange={(
                        event
                      ) =>
                        handlePriorityChange(
                          Number(
                            event.target
                              .value
                          ) as RequestPriority
                        )
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm">
                      Request Size:{" "}
                      {
                        requestSize
                      }
                    </label>

                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={
                        requestSize
                      }
                      onChange={(
                        event
                      ) =>
                        handleRequestSizeChange(
                          Number(
                            event.target
                              .value
                          )
                        )
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm">
                      Complexity:{" "}
                      {
                        complexity
                      }
                    </label>

                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={
                        complexity
                      }
                      onChange={(
                        event
                      ) =>
                        handleComplexityChange(
                          Number(
                            event.target
                              .value
                          )
                        )
                      }
                      className="w-full"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleSendRequest
                    }
                    disabled={
                      autoTrafficRunning
                    }
                    className="w-full rounded bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Send Manual
                    Request
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  handleReset
                }
                className="w-full rounded bg-slate-700 px-4 py-2 hover:bg-slate-600"
              >
                Reset Simulation
              </button>
            </div>
          </section>

          {/* LIVE SERVERS */}
          <section className="rounded-xl bg-slate-900 p-6 lg:col-span-2">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">
                Live Servers
              </h2>

              <div
                className={`rounded-full px-3 py-1 text-sm ${
                  autoTrafficRunning
                    ? "bg-green-900 text-green-300"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {autoTrafficRunning
                  ? "Simulation Running"
                  : "Simulation Stopped"}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {simulationState.servers.map(
                (server) => {
                  const loadPercentage =
                    Math.min(
                      (
                        server.currentLoad /
                        server.maxLoad
                      ) *
                        100,
                      100
                    );

                  return (
                    <div
                      key={
                        server.id
                      }
                      className="rounded-lg border border-slate-700 bg-slate-800 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">
                          {
                            server.name
                          }
                        </h3>

                        <span className="text-xs text-slate-400">
                          {loadPercentage.toFixed(
                            0
                          )}
                          %
                        </span>
                      </div>

                      <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-700">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all duration-300"
                          style={{
                            width: `${loadPercentage}%`,
                          }}
                        />
                      </div>

                      <div className="mt-4 space-y-1 text-sm text-slate-300">
                        <p>
                          Load:{" "}
                          {server.currentLoad.toFixed(
                            1
                          )}{" "}
                          /{" "}
                          {
                            server.maxLoad
                          }
                        </p>

                        <p>
                          Response
                          Time:{" "}
                          {server.responseTime.toFixed(
                            2
                          )}{" "}
                          ms
                        </p>

                        <p>
                          Bandwidth:{" "}
                          {
                            server.bandwidthMbps
                          }{" "}
                          Mbps
                        </p>

                        <p>
                          Active
                          Requests:{" "}
                          {
                            server.activeRequests
                          }
                        </p>

                        <p>
                          Completed
                          Requests:{" "}
                          {
                            server.completedRequests
                          }
                        </p>

                        <p>
                          Status:{" "}
                          {
                            server.status
                          }
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </section>
        </div>

        {/* LIVE METRICS */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricBox
            label="Queue Length"
            value={
              simulationState.requestQueue
                .length
            }
          />

          <MetricBox
            label="Active Requests"
            value={
              simulationState.activeRequests
                .length
            }
          />

          <MetricBox
            label="Total Requests"
            value={
              simulationState.metrics
                .totalRequests
            }
          />

          <MetricBox
            label="Completed"
            value={
              simulationState.metrics
                .completedRequests
            }
          />

          <MetricBox
            label="Avg Server Load"
            value={simulationState.metrics.averageServerLoad.toFixed(
              2
            )}
          />
        </section>

        {/* PRIORITY QUEUE */}
        <PriorityQueuePanel
          requests={
            simulationState.requestQueue
          }
          algorithm={
            algorithm
          }
        />

        {/* LATEST REQUEST */}
        <section className="mt-6 rounded-xl bg-slate-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Latest Request
          </h2>

          {!lastRequest ? (
            <p className="text-slate-400">
              No request has
              been generated
              yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <RequestDetail
                label="Request"
                value={
                  lastRequest.id
                }
              />

              <RequestDetail
                label="Priority"
                value={
                  lastRequest.priority
                }
              />

              <RequestDetail
                label="Request Size"
                value={
                  lastRequest.requestSize
                }
              />

              <RequestDetail
                label="Complexity"
                value={
                  lastRequest.complexity
                }
              />

              <RequestDetail
                label="Status"
                value={
                  lastRequest.status
                }
              />

              <RequestDetail
                label="Selected Server"
                value={
                  lastRequest.assignedServerId
                    ? `Server ${lastRequest.assignedServerId}`
                    : "Waiting in queue"
                }
              />

              <RequestDetail
                label="Waiting Time"
                value={`${(
                  lastRequest.waitingTimeMs ??
                  0
                ).toFixed(
                  2
                )} ms`}
              />

              <RequestDetail
                label="Total Response Time"
                value={`${(
                  lastRequest.totalResponseTimeMs ??
                  0
                ).toFixed(
                  2
                )} ms`}
              />
            </div>
          )}
        </section>

        {/* REQUEST HISTORY */}
        <RequestHistoryPanel
          queuedRequests={
            simulationState.requestQueue
          }
          activeRequests={
            simulationState.activeRequests
          }
          completedRequests={
            simulationState.completedRequests
          }
        />

        {/* HYBRID TRANSPARENCY */}
        {algorithm ===
          "hybrid" && (
          <HybridScorePanel
            request={
              lastRequest
            }
            servers={
              simulationState.servers
            }
            alpha={
              alpha
            }
            highPriorityThreshold={
              HIGH_PRIORITY_THRESHOLD
            }
          />
        )}

        {/* NETWORK TOPOLOGY */}
        <NetworkTopology
          selectedServerId={
            lastRequest?.assignedServerId
          }
          requestStatus={
            lastRequest?.status
          }
        />

        {/* LIVE CHARTS */}
        <LiveCharts
          servers={
            simulationState.servers
          }
          isRunning={
            autoTrafficRunning
          }
          resetKey={
            chartResetKey
          }
        />
      </div>
    </main>
  );
}

interface MetricBoxProps {
  label: string;
  value: string | number;
}

function MetricBox({
  label,
  value,
}: MetricBoxProps) {
  return (
    <div className="rounded-xl bg-slate-900 p-4">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}

interface RequestDetailProps {
  label: string;
  value: string | number;
}

function RequestDetail({
  label,
  value,
}: RequestDetailProps) {
  return (
    <div>
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p>
        {value}
      </p>
    </div>
  );
}