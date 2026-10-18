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
  const [simulationState, setSimulationState] =
    useState<SimulationState>(createInitialState);

  const [algorithm, setAlgorithm] =
    useState<LoadBalancingAlgorithm>("hybrid");

  const [alpha, setAlpha] = useState(0.5);

  const [priority, setPriority] =
    useState<RequestPriority>(5);

  const [requestSize, setRequestSize] = useState(5);

  const [complexity, setComplexity] = useState(5);

  const [lastRequestId, setLastRequestId] =
    useState<string | null>(null);

  const [autoTrafficRunning, setAutoTrafficRunning] =
    useState(false);

  const [requestsPerSecond, setRequestsPerSecond] =
    useState(5);

  const [chartResetKey, setChartResetKey] =
    useState(0);

  const [selectedScenario, setSelectedScenario] =
    useState<ScenarioId>("custom");

  const requestCounter = useRef(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setSimulationState((currentState) =>
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

    return () => clearInterval(timer);
  }, [alpha]);

  useEffect(() => {
    if (!autoTrafficRunning) {
      return;
    }

    const intervalMs =
      1000 / requestsPerSecond;

    const trafficTimer = setInterval(() => {
      const generatedRequest =
        generateRequest();

      const request: NetworkRequest = {
        ...generatedRequest,

        id: `AUTO-${requestCounter.current++}`,

        status: "queued",

        queueEntryTime: Date.now(),
      };

      setLastRequestId(request.id);

      setSimulationState((currentState) => ({
        ...currentState,

        algorithm,

        requestQueue: [
          ...currentState.requestQueue,
          request,
        ],

        isRunning: true,
      }));
    }, intervalMs);

    return () =>
      clearInterval(trafficTimer);
  }, [
    autoTrafficRunning,
    requestsPerSecond,
    algorithm,
  ]);

  const lastRequest =
    simulationState.activeRequests.find(
      (request) =>
        request.id === lastRequestId
    ) ??
    simulationState.completedRequests.find(
      (request) =>
        request.id === lastRequestId
    ) ??
    simulationState.requestQueue.find(
      (request) =>
        request.id === lastRequestId
    ) ??
    null;

  const activeScenario =
    selectedScenario === "custom"
      ? null
      : simulationScenarios.find(
          (scenario) =>
            scenario.id === selectedScenario
        ) ?? null;

  function handleScenarioChange(
    scenarioId: ScenarioId
  ) {
    setSelectedScenario(scenarioId);

    if (scenarioId === "custom") {
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

    setAlgorithm(scenario.algorithm);
    setAlpha(scenario.alpha);

    setRequestsPerSecond(
      scenario.requestsPerSecond
    );

    setPriority(scenario.priority);
    setRequestSize(scenario.requestSize);
    setComplexity(scenario.complexity);

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
    setSelectedScenario("custom");
  }

  function handleTrafficRateChange(
    value: number
  ) {
    setRequestsPerSecond(value);
    setSelectedScenario("custom");
  }

  function handlePriorityChange(
    value: RequestPriority
  ) {
    setPriority(value);
    setSelectedScenario("custom");
  }

  function handleRequestSizeChange(
    value: number
  ) {
    setRequestSize(value);
    setSelectedScenario("custom");
  }

  function handleComplexityChange(
    value: number
  ) {
    setComplexity(value);
    setSelectedScenario("custom");
  }

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

    setLastRequestId(request.id);

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

    setAlgorithm("hybrid");
    setAlpha(0.5);
    setPriority(5);
    setRequestSize(5);
    setComplexity(5);
    setRequestsPerSecond(5);
    setSelectedScenario("custom");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* TOP NAVIGATION */}
      <div className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-sm font-bold tracking-wide text-blue-400">
              CN MINI PROJECT
            </p>

            <p className="text-xs text-slate-500">
              Adaptive Load Balancing Simulator
            </p>
          </div>

          <nav className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500"
            >
              Simulator
            </Link>

            <Link
              href="/compare"
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
            >
              Comparison
            </Link>

            <Link
              href="/research"
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
            >
              Research
            </Link>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6">
        {/* HERO */}
        <header className="mb-8 overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 p-7">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge text="FRLB" />
                <Badge text="PBLB" />
                <Badge text="Hybrid FRLB-PBLB" />
                <Badge text="5 Simulated Servers" />
              </div>

              <h1 className="text-3xl font-bold sm:text-4xl">
                Adaptive Hybrid FRLB-PBLB
                Load Balancing Simulator
              </h1>

              <p className="mt-4 max-w-2xl leading-7 text-slate-400">
                A web-based network simulation
                demonstrating fastest-response,
                priority-based and hybrid load
                balancing using dynamic server
                load, response time and request
                traffic.
              </p>
            </div>

            <div
              className={`rounded-xl border px-5 py-4 ${
                autoTrafficRunning
                  ? "border-green-800 bg-green-950/30"
                  : "border-slate-700 bg-slate-900"
              }`}
            >
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Simulation Status
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`h-3 w-3 rounded-full ${
                    autoTrafficRunning
                      ? "bg-green-400"
                      : "bg-slate-500"
                  }`}
                />

                <span
                  className={`font-semibold ${
                    autoTrafficRunning
                      ? "text-green-300"
                      : "text-slate-300"
                  }`}
                >
                  {autoTrafficRunning
                    ? "Running"
                    : "Stopped"}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                {algorithm.toUpperCase()} ·{" "}
                {requestsPerSecond} req/s
              </p>
            </div>
          </div>
        </header>

        {/* SECTION TITLE */}
        <SectionHeading
          eyebrow="Workload"
          title="Simulation Scenarios"
          description="Choose a preset workload or manually configure the simulator. Scenarios only change workload controls and do not modify the research algorithms."
        />

        {/* SCENARIOS */}
        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_2fr]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Scenario Preset
              </label>

              <select
                value={selectedScenario}
                onChange={(event) =>
                  handleScenarioChange(
                    event.target
                      .value as ScenarioId
                  )
                }
                disabled={autoTrafficRunning}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="custom">
                  Custom Configuration
                </option>

                {simulationScenarios.map(
                  (scenario) => (
                    <option
                      key={scenario.id}
                      value={scenario.id}
                    >
                      {scenario.name}
                    </option>
                  )
                )}
              </select>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                Select a scenario before
                starting automatic traffic.
              </p>
            </div>

            {activeScenario ? (
              <div className="rounded-xl border border-blue-900 bg-blue-950/20 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-blue-400">
                      Active Scenario
                    </p>

                    <h3 className="mt-1 text-lg font-semibold">
                      {activeScenario.name}
                    </h3>
                  </div>

                  <span className="rounded-full bg-blue-900/60 px-3 py-1 text-xs font-semibold text-blue-200">
                    {
                      activeScenario.algorithm
                    }
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {
                    activeScenario.description
                  }
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <ScenarioValue
                    label="Traffic"
                    value={`${activeScenario.requestsPerSecond} req/s`}
                  />

                  <ScenarioValue
                    label="Priority"
                    value={
                      activeScenario.priority
                    }
                  />

                  <ScenarioValue
                    label="Size"
                    value={
                      activeScenario.requestSize
                    }
                  />

                  <ScenarioValue
                    label="Complexity"
                    value={
                      activeScenario.complexity
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
                <p className="font-semibold">
                  Custom Configuration
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Adjust the algorithm,
                  traffic rate, priority,
                  request size, complexity
                  and Hybrid alpha manually.
                </p>
              </div>
            )}
          </div>
        </section>

        <SectionHeading
          eyebrow="Control"
          title="Live Simulation"
          description="Configure traffic and observe how requests are distributed across the five simulated servers."
        />

        {/* CONTROLS + SERVERS */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* CONTROLS */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-5 text-xl font-semibold">
              Simulation Controls
            </h2>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Algorithm
                </label>

                <select
                  value={algorithm}
                  onChange={(event) =>
                    handleAlgorithmChange(
                      event.target
                        .value as LoadBalancingAlgorithm
                    )
                  }
                  disabled={autoTrafficRunning}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 outline-none focus:border-blue-500 disabled:opacity-50"
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

              {algorithm === "hybrid" && (
                <div className="rounded-xl border border-violet-900 bg-violet-950/20 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        Hybrid Alpha
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Response vs load balance
                      </p>
                    </div>

                    <span className="rounded-lg bg-violet-900 px-3 py-1 font-semibold text-violet-200">
                      {alpha.toFixed(2)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={alpha}
                    onChange={(event) =>
                      handleAlphaChange(
                        Number(
                          event.target.value
                        )
                      )
                    }
                    disabled={autoTrafficRunning}
                    className="mt-4 w-full"
                  />

                  <div className="mt-2 flex justify-between text-xs text-slate-500">
                    <span>
                      Load Focus
                    </span>

                    <span>
                      Response Focus
                    </span>
                  </div>

                  <div className="mt-3 rounded-lg bg-slate-950 p-3 text-center font-mono text-xs text-cyan-300">
                    Score = α × R_fast +
                    (1 − α) × R_bal
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Auto Traffic Rate
                </label>

                <select
                  value={requestsPerSecond}
                  onChange={(event) =>
                    handleTrafficRateChange(
                      Number(
                        event.target.value
                      )
                    )
                  }
                  disabled={autoTrafficRunning}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 outline-none focus:border-blue-500 disabled:opacity-50"
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

              {!autoTrafficRunning ? (
                <button
                  type="button"
                  onClick={
                    handleStartAutoTraffic
                  }
                  className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold transition hover:bg-green-500"
                >
                  ▶ Start Auto Traffic
                </button>
              ) : (
                <button
                  type="button"
                  onClick={
                    handleStopAutoTraffic
                  }
                  className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold transition hover:bg-red-500"
                >
                  ■ Stop Auto Traffic
                </button>
              )}

              <div className="border-t border-slate-700 pt-5">
                <div className="mb-4">
                  <h3 className="font-semibold">
                    Manual Request
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Create one custom request.
                  </p>
                </div>

                <div className="space-y-4">
                  <SliderControl
                    label="Priority"
                    value={priority}
                    min={1}
                    max={5}
                    onChange={(value) =>
                      handlePriorityChange(
                        value as RequestPriority
                      )
                    }
                  />

                  <SliderControl
                    label="Request Size"
                    value={requestSize}
                    min={1}
                    max={10}
                    onChange={
                      handleRequestSizeChange
                    }
                  />

                  <SliderControl
                    label="Complexity"
                    value={complexity}
                    min={1}
                    max={10}
                    onChange={
                      handleComplexityChange
                    }
                  />

                  <button
                    type="button"
                    onClick={
                      handleSendRequest
                    }
                    disabled={autoTrafficRunning}
                    className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Send Manual Request
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
              >
                Reset Simulation
              </button>
            </div>
          </section>

          {/* LIVE SERVERS */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">
                  Live Servers
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current load and response
                  state of all five servers.
                </p>
              </div>

              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                5 Servers
              </span>
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
                      key={server.id}
                      className="rounded-xl border border-slate-700 bg-slate-800/70 p-4 transition hover:border-slate-600"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {server.name}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            {
                              server.bandwidthMbps
                            }{" "}
                            Mbps
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            server.status ===
                            "available"
                              ? "bg-green-950 text-green-300"
                              : server.status ===
                                  "busy"
                                ? "bg-amber-950 text-amber-300"
                                : "bg-red-950 text-red-300"
                          }`}
                        >
                          {server.status}
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex justify-between text-xs">
                          <span className="text-slate-500">
                            Server Load
                          </span>

                          <span className="font-semibold">
                            {loadPercentage.toFixed(
                              0
                            )}
                            %
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all duration-300"
                            style={{
                              width: `${loadPercentage}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <ServerValue
                          label="Load"
                          value={`${server.currentLoad.toFixed(
                            1
                          )} / ${server.maxLoad}`}
                        />

                        <ServerValue
                          label="Response"
                          value={`${server.responseTime.toFixed(
                            2
                          )} ms`}
                        />

                        <ServerValue
                          label="Active"
                          value={
                            server.activeRequests
                          }
                        />

                        <ServerValue
                          label="Completed"
                          value={
                            server.completedRequests
                          }
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </section>
        </div>

        {/* METRICS */}
        <section className="mt-8">
          <SectionHeading
            eyebrow="Metrics"
            title="Live Performance"
            description="Real-time statistics generated from the current simulation state."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <MetricBox
              label="Queue Length"
              value={
                simulationState.requestQueue
                  .length
              }
              detail="Waiting"
            />

            <MetricBox
              label="Active Requests"
              value={
                simulationState.activeRequests
                  .length
              }
              detail="Processing"
            />

            <MetricBox
              label="Total Requests"
              value={
                simulationState.metrics
                  .totalRequests
              }
              detail="Generated"
            />

            <MetricBox
              label="Completed"
              value={
                simulationState.metrics
                  .completedRequests
              }
              detail="Finished"
            />

            <MetricBox
              label="Avg Server Load"
              value={simulationState.metrics.averageServerLoad.toFixed(
                2
              )}
              detail="Across 5 servers"
            />
          </div>
        </section>

        {/* PRIORITY QUEUE */}
        <PriorityQueuePanel
          requests={
            simulationState.requestQueue
          }
          algorithm={algorithm}
        />

        {/* LATEST REQUEST */}
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">
              Latest Request
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Most recently generated
              request in the simulation.
            </p>
          </div>

          {!lastRequest ? (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center text-slate-500">
              No request has been generated
              yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <RequestDetail
                label="Request"
                value={lastRequest.id}
              />

              <RequestDetail
                label="Priority"
                value={lastRequest.priority}
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
                value={lastRequest.status}
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
                ).toFixed(2)} ms`}
              />

              <RequestDetail
                label="Total Response"
                value={`${(
                  lastRequest.totalResponseTimeMs ??
                  0
                ).toFixed(2)} ms`}
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

        {/* HYBRID SCORE */}
        {algorithm === "hybrid" && (
          <HybridScorePanel
            request={lastRequest}
            servers={
              simulationState.servers
            }
            alpha={alpha}
            highPriorityThreshold={
              HIGH_PRIORITY_THRESHOLD
            }
          />
        )}

        {/* TOPOLOGY */}
        <NetworkTopology
          selectedServerId={
            lastRequest?.assignedServerId
          }
          requestStatus={
            lastRequest?.status
          }
        />

        {/* CHARTS */}
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

        {/* FOOTER */}
        <footer className="mt-10 border-t border-slate-800 py-8 text-center">
          <p className="font-semibold text-slate-300">
            Adaptive Hybrid FRLB-PBLB
            Load Balancing Simulator
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Computer Networks Mini Project
            · Research-based Web Simulation
          </p>
        </footer>
      </div>
    </main>
  );
}

interface BadgeProps {
  text: string;
}

function Badge({
  text,
}: BadgeProps) {
  return (
    <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
      {text}
    </span>
  );
}

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="mb-4">
      <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-2xl font-bold">
        {title}
      </h2>

      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

interface ScenarioValueProps {
  label: string;
  value: string | number;
}

function ScenarioValue({
  label,
  value,
}: ScenarioValueProps) {
  return (
    <div className="rounded-lg bg-slate-950/70 p-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold">
        {value}
      </p>
    </div>
  );
}

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function SliderControl({
  label,
  value,
  min,
  max,
  onChange,
}: SliderControlProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm text-slate-300">
          {label}
        </label>

        <span className="rounded bg-slate-800 px-2 py-1 text-xs font-semibold">
          {value}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) =>
          onChange(
            Number(event.target.value)
          )
        }
        className="w-full"
      />
    </div>
  );
}

interface ServerValueProps {
  label: string;
  value: string | number;
}

function ServerValue({
  label,
  value,
}: ServerValueProps) {
  return (
    <div className="rounded-lg bg-slate-900 p-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {value}
      </p>
    </div>
  );
}

interface MetricBoxProps {
  label: string;
  value: string | number;
  detail: string;
}

function MetricBox({
  label,
  value,
  detail,
}: MetricBoxProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-600">
        {detail}
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
    <div className="rounded-xl bg-slate-800 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}