"use client";

import type {
  NetworkRequest,
  Server,
} from "@/types";

interface HybridScorePanelProps {
  request:
    NetworkRequest | null;

  /*
   * These remain in the props because the
   * existing homepage already passes them.
   *
   * The historical decision snapshot stored
   * inside the request is now used instead.
   */
  servers: Server[];

  alpha: number;

  highPriorityThreshold:
    number;
}

export default function HybridScorePanel(
  props: HybridScorePanelProps
) {
  const request =
    props.request;

  if (!request) {
    return (
      <section className="mt-6 rounded-xl bg-slate-900 p-6">
        <h2 className="text-xl font-semibold">
          Hybrid Score Transparency
        </h2>

        <p className="mt-3 text-slate-400">
          Generate a Hybrid request to
          view its server-selection
          calculation.
        </p>
      </section>
    );
  }

  const decision =
    request.hybridDecision;

  if (!decision) {
    return (
      <section className="mt-6 rounded-xl bg-slate-900 p-6">
        <h2 className="text-xl font-semibold">
          Hybrid Score Transparency
        </h2>

        <p className="mt-3 text-slate-400">
          This request does not contain a
          Hybrid decision snapshot yet.
        </p>
      </section>
    );
  }

  const isHighPriority =
    request.priority >=
    decision.highPriorityThreshold;

  const selectedEvaluation =
    decision.evaluations.find(
      (evaluation) =>
        evaluation.serverId ===
        decision.selectedServerId
    );

  return (
    <section className="mt-6 rounded-xl bg-slate-900 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Hybrid Score Transparency
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Exact Hybrid scores captured
          when this request was assigned
          to a server.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-slate-800 p-4">
          <p className="text-xs text-slate-400">
            Request
          </p>

          <p className="mt-1 font-semibold">
            {request.id}
          </p>
        </div>

        <div className="rounded-lg bg-slate-800 p-4">
          <p className="text-xs text-slate-400">
            Priority
          </p>

          <p className="mt-1 font-semibold">
            {request.priority}
          </p>
        </div>

        <div className="rounded-lg bg-slate-800 p-4">
          <p className="text-xs text-slate-400">
            Priority Class
          </p>

          <p className="mt-1 font-semibold">
            {isHighPriority
              ? "High Priority"
              : "Normal Priority"}
          </p>
        </div>

        <div className="rounded-lg bg-slate-800 p-4">
          <p className="text-xs text-slate-400">
            Alpha at Assignment
          </p>

          <p className="mt-1 font-semibold">
            {decision.alpha.toFixed(
              2
            )}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-slate-700 bg-slate-950 p-4">
        <p className="text-sm font-semibold">
          Hybrid Formula
        </p>

        <p className="mt-2 font-mono text-sm text-slate-300">
          Score = α × R_fast +
          (1 - α) × R_bal
        </p>

        <p className="mt-3 text-sm text-slate-400">
          R_fast = server response
          time at the moment the
          request was evaluated.
        </p>

        <p className="mt-1 text-sm text-slate-400">
          R_bal = load-balancing
          component at the same
          moment.
        </p>

        <p className="mt-1 text-sm text-slate-400">
          The available server with
          the minimum score was
          selected.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-slate-700 text-slate-400">
            <tr>
              <th className="p-3">
                Server
              </th>

              <th className="p-3">
                Load
              </th>

              <th className="p-3">
                Response Time
              </th>

              <th className="p-3">
                R_fast
              </th>

              <th className="p-3">
                R_bal
              </th>

              <th className="p-3">
                Hybrid Score
              </th>

              <th className="p-3">
                Result
              </th>
            </tr>
          </thead>

          <tbody>
            {decision.evaluations.map(
              (evaluation) => {
                const selected =
                  evaluation.serverId ===
                  decision.selectedServerId;

                return (
                  <tr
                    key={
                      evaluation.serverId
                    }
                    className={`border-b border-slate-800 ${
                      selected
                        ? "bg-green-950/30"
                        : ""
                    }`}
                  >
                    <td className="p-3 font-semibold">
                      {
                        evaluation.serverName
                      }
                    </td>

                    <td className="p-3">
                      {evaluation.currentLoad.toFixed(
                        2
                      )}
                    </td>

                    <td className="p-3">
                      {evaluation.responseTime.toFixed(
                        2
                      )}{" "}
                      ms
                    </td>

                    <td className="p-3">
                      {evaluation.rFast.toFixed(
                        4
                      )}
                    </td>

                    <td className="p-3">
                      {evaluation.rBal.toFixed(
                        4
                      )}
                    </td>

                    <td className="p-3 font-semibold">
                      {evaluation.score.toFixed(
                        4
                      )}
                    </td>

                    <td className="p-3">
                      {selected ? (
                        <span className="rounded-full bg-green-900 px-3 py-1 text-xs font-semibold text-green-300">
                          Selected
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          Candidate
                        </span>
                      )}
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>

      {selectedEvaluation && (
        <div className="mt-5 rounded-lg border border-green-900 bg-green-950/30 p-4">
          <p className="font-semibold text-green-300">
            Decision
          </p>

          <p className="mt-2 text-sm text-slate-300">
            {
              selectedEvaluation.serverName
            }{" "}
            was selected with the
            minimum Hybrid score of{" "}
            {selectedEvaluation.score.toFixed(
              4
            )}
            .
          </p>
        </div>
      )}

      <div className="mt-4 rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm text-slate-400">
        These values are an
        assignment-time snapshot.
        Later changes in server load
        or response time do not modify
        this decision record.
      </div>
    </section>
  );
}