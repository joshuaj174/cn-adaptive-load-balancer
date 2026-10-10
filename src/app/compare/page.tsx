"use client";

import { useState } from "react";

import Link from "next/link";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  runAlgorithmComparison,
} from "@/comparison";

import type {
  ComparisonRun,
} from "@/comparison";

export default function ComparePage() {
  const [
    requestCount,
    setRequestCount,
  ] = useState(100);

  const [
    result,
    setResult,
  ] =
    useState<ComparisonRun | null>(
      null
    );

  const [
    isRunning,
    setIsRunning,
  ] = useState(false);

  function handleRunComparison() {
    setIsRunning(true);

    window.setTimeout(() => {
      const comparison =
        runAlgorithmComparison(
          requestCount,
          2026
        );

      setResult(comparison);

      setIsRunning(false);
    }, 0);
  }

  const responseChartData =
    result?.results.map(
      (item) => ({
        algorithm:
          item.label,

        value:
          Number(
            item.averageResponseTimeMs.toFixed(
              2
            )
          ),
      })
    ) ?? [];

  const processingChartData =
    result?.results.map(
      (item) => ({
        algorithm:
          item.label,

        value:
          Number(
            item.averageProcessingTimeMs.toFixed(
              2
            )
          ),
      })
    ) ?? [];

  const waitingChartData =
    result?.results.map(
      (item) => ({
        algorithm:
          item.label,

        value:
          Number(
            item.averageWaitingTimeMs.toFixed(
              2
            )
          ),
      })
    ) ?? [];

  const loadChartData =
    result?.results.map(
      (item) => ({
        algorithm:
          item.label,

        value:
          Number(
            item.averageServerLoad.toFixed(
              2
            )
          ),
      })
    ) ?? [];

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <Link
            href="/"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            ← Back to Live Simulation
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Algorithm Comparison
          </h1>

          <p className="mt-2 max-w-3xl text-slate-400">
            Compare FRLB, PBLB and Hybrid
            FRLB-PBLB using the exact same
            generated network workload.
          </p>
        </header>

        <section className="rounded-xl bg-slate-900 p-6">
          <h2 className="mb-5 text-xl font-semibold">
            Comparison Settings
          </h2>

          <div className="grid gap-6 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Number of Requests
              </label>

              <select
                value={requestCount}
                onChange={(event) =>
                  setRequestCount(
                    Number(
                      event.target.value
                    )
                  )
                }
                disabled={isRunning}
                className="w-full rounded bg-slate-800 p-3"
              >
                <option value={50}>
                  50 requests
                </option>

                <option value={100}>
                  100 requests
                </option>

                <option value={200}>
                  200 requests
                </option>
              </select>
            </div>

            <div>
              <p className="mb-2 text-sm text-slate-300">
                Traffic Rate
              </p>

              <div className="rounded bg-slate-800 p-3">
                10 requests / second
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-slate-300">
                Workload Seed
              </p>

              <div className="rounded bg-slate-800 p-3">
                2026
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={
              handleRunComparison
            }
            disabled={isRunning}
            className="mt-6 rounded bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning
              ? "Running Comparison..."
              : "Run Algorithm Comparison"}
          </button>

          <p className="mt-4 text-sm text-slate-400">
            One deterministic workload is
            generated and reused for all
            three algorithms. Each algorithm
            therefore receives identical
            priorities, request sizes,
            complexities and arrival times.
          </p>
        </section>

        {!result ? (
          <section className="mt-6 rounded-xl bg-slate-900 p-8 text-center text-slate-400">
            Run the comparison to see the
            results.
          </section>
        ) : (
          <>
            <section className="mt-6 overflow-x-auto rounded-xl bg-slate-900 p-6">
              <h2 className="mb-5 text-xl font-semibold">
                Comparison Results
              </h2>

              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="border-b border-slate-700 text-slate-400">
                  <tr>
                    <th className="p-3">
                      Algorithm
                    </th>

                    <th className="p-3">
                      Completed
                    </th>

                    <th className="p-3">
                      Avg Response
                    </th>

                    <th className="p-3">
                      Avg Processing
                    </th>

                    <th className="p-3">
                      Avg Queue Wait
                    </th>

                    <th className="p-3">
                      Avg Load
                    </th>

                    <th className="p-3">
                      Peak Queue
                    </th>

                    <th className="p-3">
                      Throughput
                    </th>

                    <th className="p-3">
                      Duration
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {result.results.map(
                    (item) => (
                      <tr
                        key={
                          item.algorithm
                        }
                        className="border-b border-slate-800"
                      >
                        <td className="p-3 font-semibold">
                          {item.label}
                        </td>

                        <td className="p-3">
                          {
                            item.completedRequests
                          }
                          /
                          {
                            item.totalRequests
                          }
                        </td>

                        <td className="p-3">
                          {item.averageResponseTimeMs.toFixed(
                            2
                          )}{" "}
                          ms
                        </td>

                        <td className="p-3">
                          {item.averageProcessingTimeMs.toFixed(
                            2
                          )}{" "}
                          ms
                        </td>

                        <td className="p-3">
                          {item.averageWaitingTimeMs.toFixed(
                            2
                          )}{" "}
                          ms
                        </td>

                        <td className="p-3">
                          {item.averageServerLoad.toFixed(
                            2
                          )}
                        </td>

                        <td className="p-3">
                          {
                            item.peakQueueLength
                          }
                        </td>

                        <td className="p-3">
                          {item.throughputPerSecond.toFixed(
                            2
                          )}{" "}
                          req/s
                        </td>

                        <td className="p-3">
                          {item.simulationDurationSeconds.toFixed(
                            2
                          )}{" "}
                          s
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-2">
              <ComparisonChart
                title="Average Response Time"
                data={responseChartData}
                unit="ms"
              />

              <ComparisonChart
                title="Average Processing Time"
                data={
                  processingChartData
                }
                unit="ms"
              />

              <ComparisonChart
                title="Average Queue Waiting Time"
                data={waitingChartData}
                unit="ms"
              />

              <ComparisonChart
                title="Average Server Load"
                data={loadChartData}
              />
            </section>

            <section className="mt-6 rounded-xl bg-slate-900 p-6">
              <h2 className="mb-5 text-xl font-semibold">
                Requests Completed by
                Server
              </h2>

              <div className="grid gap-6 lg:grid-cols-3">
                {result.results.map(
                  (item) => (
                    <div
                      key={
                        item.algorithm
                      }
                      className="rounded-lg border border-slate-700 bg-slate-800 p-5"
                    >
                      <h3 className="mb-4 font-semibold">
                        {item.label}
                      </h3>

                      <div className="space-y-3">
                        {item.serverDistribution.map(
                          (server) => (
                            <div
                              key={
                                server.serverId
                              }
                              className="flex items-center justify-between"
                            >
                              <span className="text-slate-400">
                                Server{" "}
                                {
                                  server.serverId
                                }
                              </span>

                              <span className="font-semibold">
                                {
                                  server.completedRequests
                                }
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>

            <section className="mt-6 rounded-xl border border-amber-900 bg-amber-950/30 p-6">
              <h2 className="font-semibold text-amber-300">
                Research
                Implementation Note
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Average queue waiting time
                may be zero when requests
                arrive at the same rate that
                the simulation scheduler can
                immediately dispatch them.
                A zero queue wait does not
                mean response time is zero:
                processing time still
                contributes to total response
                time.
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                These results come from this
                five-server web simulation
                and are not intended to
                exactly reproduce the
                paper&apos;s MATLAB numerical
                values.
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

interface ComparisonChartProps {
  title: string;

  data: {
    algorithm: string;
    value: number;
  }[];

  unit?: string;
}

function ComparisonChart({
  title,
  data,
  unit,
}: ComparisonChartProps) {
  return (
    <div className="rounded-xl bg-slate-900 p-6">
      <h2 className="mb-4 text-xl font-semibold">
        {title}
      </h2>

      <div className="h-80">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
            />

            <XAxis
              dataKey="algorithm"
              stroke="#94a3b8"
            />

            <YAxis
              stroke="#94a3b8"
            />

            <Tooltip
              formatter={(value) => [
                `${value}${unit ? ` ${unit}` : ""}`,
                title,
              ]}
            />

            <Bar
              dataKey="value"
              name={title}
              fill="#3b82f6"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}