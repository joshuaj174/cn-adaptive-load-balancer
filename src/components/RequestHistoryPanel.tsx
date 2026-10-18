import type { NetworkRequest } from "@/types";

interface RequestHistoryPanelProps {
  queuedRequests: NetworkRequest[];
  activeRequests: NetworkRequest[];
  completedRequests: NetworkRequest[];
}

function getStatusClass(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-950 text-green-300";

    case "processing":
    case "assigned":
      return "bg-blue-950 text-blue-300";

    case "queued":
    case "waiting":
      return "bg-amber-950 text-amber-300";

    case "failed":
      return "bg-red-950 text-red-300";

    default:
      return "bg-slate-800 text-slate-300";
  }
}

function formatTime(timestamp?: number) {
  if (!timestamp) {
    return "-";
  }

  return new Date(timestamp).toLocaleTimeString();
}

function formatDuration(value?: number) {
  if (value === undefined) {
    return "-";
  }

  return `${value.toFixed(2)} ms`;
}

export default function RequestHistoryPanel({
  queuedRequests,
  activeRequests,
  completedRequests,
}: RequestHistoryPanelProps) {
  const history = [
    ...queuedRequests,
    ...activeRequests,
    ...completedRequests,
  ]
    .sort(
      (a, b) =>
        b.arrivalTime - a.arrivalTime
    )
    .slice(0, 30);

  return (
    <section className="mt-6 rounded-xl bg-slate-900 p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            Request History
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Shows the latest requests generated
            during the simulation, including
            queued, processing and completed
            requests.
          </p>
        </div>

        <div className="rounded-lg bg-slate-800 px-4 py-2 text-sm">
          <span className="text-slate-400">
            Requests shown:{" "}
          </span>

          <span className="font-semibold text-white">
            {history.length}
          </span>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-8 text-center text-slate-400">
          No request history yet. Generate a
          manual request or start automatic
          traffic.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b border-slate-700 text-slate-400">
              <tr>
                <th className="p-3">
                  Request
                </th>

                <th className="p-3">
                  Priority
                </th>

                <th className="p-3">
                  Size
                </th>

                <th className="p-3">
                  Complexity
                </th>

                <th className="p-3">
                  Status
                </th>

                <th className="p-3">
                  Server
                </th>

                <th className="p-3">
                  Arrival
                </th>

                <th className="p-3">
                  Waiting Time
                </th>

                <th className="p-3">
                  Processing Time
                </th>

                <th className="p-3">
                  Total Response
                </th>
              </tr>
            </thead>

            <tbody>
              {history.map((request) => (
                <tr
                  key={request.id}
                  className="border-b border-slate-800 transition hover:bg-slate-800/60"
                >
                  <td className="p-3 font-mono font-semibold text-blue-300">
                    {request.id}
                  </td>

                  <td className="p-3">
                    {request.priority}
                  </td>

                  <td className="p-3">
                    {request.requestSize}
                  </td>

                  <td className="p-3">
                    {request.complexity}
                  </td>

                  <td className="p-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </td>

                  <td className="p-3">
                    {request.assignedServerId
                      ? `Server ${request.assignedServerId}`
                      : "-"}
                  </td>

                  <td className="p-3 text-slate-400">
                    {formatTime(
                      request.arrivalTime
                    )}
                  </td>

                  <td className="p-3">
                    {formatDuration(
                      request.waitingTimeMs
                    )}
                  </td>

                  <td className="p-3">
                    {formatDuration(
                      request.processingTimeMs
                    )}
                  </td>

                  <td className="p-3 font-semibold">
                    {formatDuration(
                      request.totalResponseTimeMs
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <HistoryMetric
          label="Queued"
          value={queuedRequests.length}
        />

        <HistoryMetric
          label="Processing"
          value={activeRequests.length}
        />

        <HistoryMetric
          label="Completed"
          value={completedRequests.length}
        />
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        The table displays the latest 30
        requests for readability. Resetting the
        simulation also clears the request
        history because the simulator uses
        in-memory state.
      </p>
    </section>
  );
}

interface HistoryMetricProps {
  label: string;
  value: number;
}

function HistoryMetric({
  label,
  value,
}: HistoryMetricProps) {
  return (
    <div className="rounded-lg bg-slate-800 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold">
        {value}
      </p>
    </div>
  );
}