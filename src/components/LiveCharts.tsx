"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type { Server } from "@/types";

interface LiveChartsProps {
  servers: Server[];
  isRunning: boolean;
  resetKey: number;
}

interface ServerHistoryPoint {
  time: number;

  load1: number;
  load2: number;
  load3: number;
  load4: number;
  load5: number;

  response1: number;
  response2: number;
  response3: number;
  response4: number;
  response5: number;
}

const MAX_HISTORY_POINTS = 60;

export default function LiveCharts({
  servers,
  isRunning,
  resetKey,
}: LiveChartsProps) {
  const [history, setHistory] =
    useState<ServerHistoryPoint[]>([]);

  /*
   * Keep the latest server state available to
   * the interval without recreating the interval
   * every time server data changes.
   */
  const serversRef = useRef<Server[]>(servers);

  /*
   * null means that a simulation run has not
   * started yet.
   *
   * Date.now() is intentionally NOT called here
   * because React requires render to stay pure.
   */
  const startTimeRef =
    useRef<number | null>(null);

  useEffect(() => {
    serversRef.current = servers;
  }, [servers]);

  /*
   * Clear chart history whenever the parent
   * resets the simulation.
   *
   * The state update is scheduled asynchronously
   * rather than executed directly inside the
   * effect body.
   */
  useEffect(() => {
    startTimeRef.current = null;

    const resetTimer =
      window.setTimeout(() => {
        setHistory([]);
      }, 0);

    return () => {
      window.clearTimeout(resetTimer);
    };
  }, [resetKey]);

  /*
   * Collect live server snapshots while
   * automatic traffic is running.
   */
  useEffect(() => {
    if (!isRunning) {
      return;
    }

    /*
     * Start a new chart timeline when the
     * simulation begins for the first time
     * after a reset.
     */
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }

    const captureSnapshot = () => {
      const currentServers =
        serversRef.current;

      if (currentServers.length < 5) {
        return;
      }

      const startTime =
        startTimeRef.current;

      if (startTime === null) {
        return;
      }

      const elapsedSeconds =
        (Date.now() - startTime) / 1000;

      const point: ServerHistoryPoint = {
        time: Number(
          elapsedSeconds.toFixed(1)
        ),

        load1:
          currentServers[0].currentLoad,

        load2:
          currentServers[1].currentLoad,

        load3:
          currentServers[2].currentLoad,

        load4:
          currentServers[3].currentLoad,

        load5:
          currentServers[4].currentLoad,

        response1:
          currentServers[0].responseTime,

        response2:
          currentServers[1].responseTime,

        response3:
          currentServers[2].responseTime,

        response4:
          currentServers[3].responseTime,

        response5:
          currentServers[4].responseTime,
      };

      setHistory((currentHistory) => {
        const updatedHistory = [
          ...currentHistory,
          point,
        ];

        return updatedHistory.slice(
          -MAX_HISTORY_POINTS
        );
      });
    };

    /*
     * Capture immediately so the chart does not
     * wait half a second before showing data.
     */
    captureSnapshot();

    const timer =
      window.setInterval(
        captureSnapshot,
        500
      );

    return () => {
      window.clearInterval(timer);
    };
  }, [isRunning]);

  const requestDistribution =
    servers.map((server) => ({
      server: `S${server.id}`,
      completed:
        server.completedRequests,
    }));

  return (
    <section className="mt-6 rounded-xl bg-slate-900 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Live Performance Charts
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Server conditions sampled during
          the current simulation run.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="mb-3 font-semibold">
            Server Load Over Time
          </h3>

          <div className="h-80 w-full rounded-lg bg-slate-950 p-3">
            {history.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Start auto traffic to
                collect load history.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={history}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                  />

                  <XAxis
                    dataKey="time"
                    stroke="#94a3b8"
                    tickFormatter={(value) =>
                      `${value}s`
                    }
                  />

                  <YAxis
                    stroke="#94a3b8"
                    domain={[0, 100]}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        "#0f172a",
                      border:
                        "1px solid #334155",
                      borderRadius: "8px",
                    }}
                    labelFormatter={(value) =>
                      `${value} seconds`
                    }
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="load1"
                    name="Server 1"
                    stroke="#3b82f6"
                    dot={false}
                    strokeWidth={2}
                  />

                  <Line
                    type="monotone"
                    dataKey="load2"
                    name="Server 2"
                    stroke="#22c55e"
                    dot={false}
                    strokeWidth={2}
                  />

                  <Line
                    type="monotone"
                    dataKey="load3"
                    name="Server 3"
                    stroke="#eab308"
                    dot={false}
                    strokeWidth={2}
                  />

                  <Line
                    type="monotone"
                    dataKey="load4"
                    name="Server 4"
                    stroke="#ef4444"
                    dot={false}
                    strokeWidth={2}
                  />

                  <Line
                    type="monotone"
                    dataKey="load5"
                    name="Server 5"
                    stroke="#a855f7"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-semibold">
            Response Time Over Time
          </h3>

          <div className="h-80 w-full rounded-lg bg-slate-950 p-3">
            {history.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Start auto traffic to
                collect response-time
                history.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={history}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                  />

                  <XAxis
                    dataKey="time"
                    stroke="#94a3b8"
                    tickFormatter={(value) =>
                      `${value}s`
                    }
                  />

                  <YAxis
                    stroke="#94a3b8"
                    unit=" ms"
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        "#0f172a",
                      border:
                        "1px solid #334155",
                      borderRadius: "8px",
                    }}
                    labelFormatter={(value) =>
                      `${value} seconds`
                    }
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="response1"
                    name="Server 1"
                    stroke="#3b82f6"
                    dot={false}
                    strokeWidth={2}
                  />

                  <Line
                    type="monotone"
                    dataKey="response2"
                    name="Server 2"
                    stroke="#22c55e"
                    dot={false}
                    strokeWidth={2}
                  />

                  <Line
                    type="monotone"
                    dataKey="response3"
                    name="Server 3"
                    stroke="#eab308"
                    dot={false}
                    strokeWidth={2}
                  />

                  <Line
                    type="monotone"
                    dataKey="response4"
                    name="Server 4"
                    stroke="#ef4444"
                    dot={false}
                    strokeWidth={2}
                  />

                  <Line
                    type="monotone"
                    dataKey="response5"
                    name="Server 5"
                    stroke="#a855f7"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-semibold">
            Completed Requests by Server
          </h3>

          <div className="h-80 w-full rounded-lg bg-slate-950 p-3">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={
                  requestDistribution
                }
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                />

                <XAxis
                  dataKey="server"
                  stroke="#94a3b8"
                />

                <YAxis
                  stroke="#94a3b8"
                  allowDecimals={false}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      "#0f172a",
                    border:
                      "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />

                <Bar
                  dataKey="completed"
                  name="Completed Requests"
                  fill="#3b82f6"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}