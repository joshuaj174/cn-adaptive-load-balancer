"use client";

import { useState } from "react";

import type {
  LoadBalancingAlgorithm,
  NetworkRequest,
  RequestPriority,
  SimulationState,
} from "@/types";

import { initialServers } from "@/simulation/initialServers";
import { processSimulationTick } from "@/simulation/simulator";

const createInitialState = (): SimulationState => ({
  algorithm: "hybrid",
  servers: initialServers.map((server) => ({ ...server })),
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

  const [priority, setPriority] =
    useState<RequestPriority>(5);

  const [requestSize, setRequestSize] =
    useState(5);

  const [complexity, setComplexity] =
    useState(5);

  const [lastRequest, setLastRequest] =
    useState<NetworkRequest | null>(null);

  function handleSendRequest() {
    const now = Date.now();

    const request: NetworkRequest = {
      id: `REQ-${now}`,
      priority,
      requestSize,
      complexity,
      status: "queued",
      arrivalTime: now,
      queueEntryTime: now,
    };

    const stateWithRequest: SimulationState = {
      ...simulationState,
      algorithm,
      requestQueue: [
        ...simulationState.requestQueue,
        request,
      ],
    };

    const updatedState = processSimulationTick(
      stateWithRequest,
      {
        alpha: 0.5,
        highPriorityThreshold: 4,
      },
      now
    );

    const processedRequest =
      updatedState.activeRequests.find(
        (activeRequest) =>
          activeRequest.id === request.id
      ) ??
      updatedState.requestQueue.find(
        (queuedRequest) =>
          queuedRequest.id === request.id
      ) ??
      request;

    setSimulationState(updatedState);
    setLastRequest(processedRequest);
  }

  function handleReset() {
    setSimulationState(createInitialState());
    setLastRequest(null);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">
            Adaptive Hybrid Load Balancing Simulator
          </h1>

          <p className="mt-2 text-slate-400">
            FRLB, PBLB and Hybrid FRLB-PBLB simulation
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-xl bg-slate-900 p-6">
            <h2 className="mb-5 text-xl font-semibold">
              Send Request
            </h2>

            <div className="space-y-4">
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
                  className="w-full rounded bg-slate-800 p-2"
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

              <div>
                <label className="mb-1 block text-sm">
                  Priority: {priority}
                </label>

                <input
                  type="range"
                  min="1"
                  max="5"
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      Number(
                        event.target.value
                      ) as RequestPriority
                    )
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm">
                  Request Size: {requestSize}
                </label>

                <input
                  type="range"
                  min="1"
                  max="10"
                  value={requestSize}
                  onChange={(event) =>
                    setRequestSize(
                      Number(event.target.value)
                    )
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm">
                  Complexity: {complexity}
                </label>

                <input
                  type="range"
                  min="1"
                  max="10"
                  value={complexity}
                  onChange={(event) =>
                    setComplexity(
                      Number(event.target.value)
                    )
                  }
                  className="w-full"
                />
              </div>

              <button
                onClick={handleSendRequest}
                className="w-full rounded bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-500"
              >
                Send Request
              </button>

              <button
                onClick={handleReset}
                className="w-full rounded bg-slate-700 px-4 py-2 hover:bg-slate-600"
              >
                Reset Simulation
              </button>
            </div>
          </section>

          <section className="rounded-xl bg-slate-900 p-6 lg:col-span-2">
            <h2 className="mb-5 text-xl font-semibold">
              Servers
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {simulationState.servers.map(
                (server) => (
                  <div
                    key={server.id}
                    className="rounded-lg border border-slate-700 bg-slate-800 p-4"
                  >
                    <h3 className="font-semibold">
                      {server.name}
                    </h3>

                    <div className="mt-3 space-y-1 text-sm text-slate-300">
                      <p>
                        Load:{" "}
                        {server.currentLoad.toFixed(
                          1
                        )}{" "}
                        / {server.maxLoad}
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
                        {server.bandwidthMbps} Mbps
                      </p>

                      <p>
                        Active Requests:{" "}
                        {server.activeRequests}
                      </p>

                      <p>
                        Status: {server.status}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-xl bg-slate-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Latest Request
          </h2>

          {!lastRequest ? (
            <p className="text-slate-400">
              No request has been sent yet.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-slate-400">
                  Request
                </p>
                <p>{lastRequest.id}</p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Priority
                </p>
                <p>{lastRequest.priority}</p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Status
                </p>
                <p>{lastRequest.status}</p>
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
                    lastRequest.waitingTimeMs ?? 0
                  ).toFixed(2)}{" "}
                  ms
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Processing Time
                </p>
                <p>
                  {(
                    lastRequest.processingTimeMs ?? 0
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

              <div>
                <p className="text-xs text-slate-400">
                  Algorithm
                </p>
                <p>{algorithm.toUpperCase()}</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}