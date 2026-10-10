"use client";

import Link from "next/link";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  LoadBalancingAlgorithm,
  NetworkRequest,
  RequestPriority,
  SimulationState,
} from "@/types";

import LiveCharts from "@/components/LiveCharts";

import {
  initialServers,
} from "@/simulation/initialServers";

import {
  generateRequest,
} from "@/simulation/requestGenerator";

import {
  processSimulationTick,
} from "@/simulation/simulator";

const createInitialState =
  (): SimulationState => ({
    algorithm: "hybrid",

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

    isRunning: false,
  });

export default function Home() {
  const [
    simulationState,
    setSimulationState,
  ] = useState<SimulationState>(
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
    priority,
    setPriority,
  ] =
    useState<RequestPriority>(5);

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
  ] = useState<string | null>(null);

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

  const requestCounter =
    useRef(1);

  /*
   * Main simulation engine.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulationState(
        (currentState) =>
          processSimulationTick(
            currentState,
            {
              alpha: 0.5,
              highPriorityThreshold: 4,
            },
            Date.now()
          )
      );
    }, 100);

    return () =>
      clearInterval(timer);
  }, []);

  /*
   * Automatic traffic generator.
   */
  useEffect(() => {
    if (!autoTrafficRunning) {
      return;
    }

    const intervalMs =
      1000 / requestsPerSecond;

    const trafficTimer =
      setInterval(() => {
        const generatedRequest =
          generateRequest();

        const request: NetworkRequest = {
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

  function handleSendRequest() {
    const now = Date.now();

    const request: NetworkRequest = {
      id: `MANUAL-${requestCounter.current++}`,

      priority,

      requestSize,

      complexity,

      status: "queued",

      arrivalTime: now,

      queueEntryTime: now,
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
    setAutoTrafficRunning(true);

    setSimulationState(
      (currentState) => ({
        ...currentState,
        algorithm,
        isRunning: true,
      })
    );
  }

  function handleStopAutoTraffic() {
    setAutoTrafficRunning(false);

    setSimulationState(
      (currentState) => ({
        ...currentState,
        isRunning: false,
      })
    );
  }

  function handleReset() {
    setAutoTrafficRunning(false);

    setSimulationState(
      createInitialState()
    );

    setLastRequestId(null);

    requestCounter.current = 1;

    setChartResetKey(
      (currentKey) =>
        currentKey + 1
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
                Adaptive Hybrid Load
                Balancing Simulator
              </h1>

              <p className="mt-2 text-slate-400">
                FRLB, PBLB and Hybrid
                FRLB-PBLB simulation
              </p>
            </div>

            <Link
              href="/compare"
              className="rounded-lg bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-500"
            >
              Compare Algorithms
            </Link>
          </div>
        </header>

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
                  value={algorithm}
                  onChange={(event) =>
                    setAlgorithm(
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

              {/* TRAFFIC RATE */}
              <div>
                <label className="mb-1 block text-sm">
                  Auto Traffic Rate
                </label>

                <select
                  value={
                    requestsPerSecond
                  }
                  onChange={(event) =>
                    setRequestsPerSecond(
                      Number(
                        event.target.value
                      )
                    )
                  }
                  disabled={
                    autoTrafficRunning
                  }
                  className="w-full rounded bg-slate-800 p-2 disabled:opacity-50"
                >
                  <option value={1}>
                    1 request / second
                  </option>

                  <option value={2}>
                    2 requests / second
                  </option>

                  <option value={5}>
                    5 requests / second
                  </option>

                  <option value={10}>
                    10 requests / second
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
                  Start Auto Traffic
                </button>
              ) : (
                <button
                  type="button"
                  onClick={
                    handleStopAutoTraffic
                  }
                  className="w-full rounded bg-red-600 px-4 py-2 font-semibold hover:bg-red-500"
                >
                  Stop Auto Traffic
                </button>
              )}

              {/* MANUAL REQUEST */}
              <div className="border-t border-slate-700 pt-5">
                <h3 className="mb-4 font-semibold">
                  Manual Request
                </h3>

                <div className="space-y-4">

                  {/* PRIORITY */}
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
                        setPriority(
                          Number(
                            event.target
                              .value
                          ) as RequestPriority
                        )
                      }
                      className="w-full"
                    />
                  </div>

                  {/* REQUEST SIZE */}
                  <div>
                    <label className="mb-1 block text-sm">
                      Request Size:{" "}
                      {requestSize}
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
                        setRequestSize(
                          Number(
                            event.target
                              .value
                          )
                        )
                      }
                      className="w-full"
                    />
                  </div>

                  {/* COMPLEXITY */}
                  <div>
                    <label className="mb-1 block text-sm">
                      Complexity:{" "}
                      {complexity}
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
                        setComplexity(
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
                    Send Manual Request
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
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
                      ) * 100,
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
                          Response Time:{" "}
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
                          Active Requests:{" "}
                          {
                            server.activeRequests
                          }
                        </p>

                        <p>
                          Completed Requests:{" "}
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
          <div className="rounded-xl bg-slate-900 p-4">
            <p className="text-sm text-slate-400">
              Queue Length
            </p>

            <p className="mt-1 text-2xl font-semibold">
              {
                simulationState
                  .requestQueue
                  .length
              }
            </p>
          </div>

          <div className="rounded-xl bg-slate-900 p-4">
            <p className="text-sm text-slate-400">
              Active Requests
            </p>

            <p className="mt-1 text-2xl font-semibold">
              {
                simulationState
                  .activeRequests
                  .length
              }
            </p>
          </div>

          <div className="rounded-xl bg-slate-900 p-4">
            <p className="text-sm text-slate-400">
              Total Requests
            </p>

            <p className="mt-1 text-2xl font-semibold">
              {
                simulationState
                  .metrics
                  .totalRequests
              }
            </p>
          </div>

          <div className="rounded-xl bg-slate-900 p-4">
            <p className="text-sm text-slate-400">
              Completed
            </p>

            <p className="mt-1 text-2xl font-semibold">
              {
                simulationState
                  .metrics
                  .completedRequests
              }
            </p>
          </div>

          <div className="rounded-xl bg-slate-900 p-4">
            <p className="text-sm text-slate-400">
              Avg Server Load
            </p>

            <p className="mt-1 text-2xl font-semibold">
              {simulationState.metrics.averageServerLoad.toFixed(
                2
              )}
            </p>
          </div>
        </section>

        {/* LATEST REQUEST */}
        <section className="mt-6 rounded-xl bg-slate-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Latest Request
          </h2>

          {!lastRequest ? (
            <p className="text-slate-400">
              No request has been
              generated yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div>
                <p className="text-xs text-slate-400">
                  Request
                </p>

                <p>
                  {
                    lastRequest.id
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Priority
                </p>

                <p>
                  {
                    lastRequest.priority
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Request Size
                </p>

                <p>
                  {
                    lastRequest.requestSize
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Complexity
                </p>

                <p>
                  {
                    lastRequest.complexity
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Status
                </p>

                <p>
                  {
                    lastRequest.status
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Selected Server
                </p>

                <p>
                  {lastRequest.assignedServerId
                    ? `Server ${lastRequest.assignedServerId}`
                    : "Waiting in queue"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Waiting Time
                </p>

                <p>
                  {(
                    lastRequest.waitingTimeMs ??
                    0
                  ).toFixed(2)}{" "}
                  ms
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Total Response Time
                </p>

                <p>
                  {(
                    lastRequest.totalResponseTimeMs ??
                    0
                  ).toFixed(2)}{" "}
                  ms
                </p>
              </div>
            </div>
          )}
        </section>

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