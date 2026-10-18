"use client";

import type {
  LoadBalancingAlgorithm,
  NetworkRequest,
} from "@/types";

interface PriorityQueuePanelProps {
  requests: NetworkRequest[];
  algorithm: LoadBalancingAlgorithm;
}

function getPriorityStyle(priority: number): string {
  if (priority === 5) {
    return "border-red-500/40 bg-red-950/30 text-red-300";
  }

  if (priority === 4) {
    return "border-orange-500/40 bg-orange-950/30 text-orange-300";
  }

  if (priority === 3) {
    return "border-yellow-500/40 bg-yellow-950/30 text-yellow-300";
  }

  if (priority === 2) {
    return "border-blue-500/40 bg-blue-950/30 text-blue-300";
  }

  return "border-slate-600 bg-slate-800 text-slate-300";
}

function orderRequests(
  requests: NetworkRequest[],
  algorithm: LoadBalancingAlgorithm
): NetworkRequest[] {
  const copiedRequests = [...requests];

  if (algorithm === "pblb") {
    return copiedRequests.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }

      if (a.arrivalTime !== b.arrivalTime) {
        return a.arrivalTime - b.arrivalTime;
      }

      return a.id.localeCompare(b.id);
    });
  }

  return copiedRequests.sort(
    (a, b) => a.arrivalTime - b.arrivalTime
  );
}

export default function PriorityQueuePanel({
  requests,
  algorithm,
}: PriorityQueuePanelProps) {
  const orderedRequests = orderRequests(
    requests,
    algorithm
  );

  const visibleRequests =
    orderedRequests.slice(0, 12);

  const hiddenCount = Math.max(
    orderedRequests.length -
      visibleRequests.length,
    0
  );

  const isPBLB = algorithm === "pblb";

  return (
    <section className="mt-6 rounded-xl bg-slate-900 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            Request Queue
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {isPBLB
              ? "PBLB orders queued requests by priority. Higher priority values are processed first."
              : "Requests are shown in arrival order. Select PBLB to visualize priority-based ordering."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
            {orderedRequests.length} queued
          </span>

          <span
            className={`rounded-full px-3 py-1 text-sm ${
              isPBLB
                ? "bg-violet-900 text-violet-200"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {isPBLB
              ? "Priority Order"
              : "Arrival Order"}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleRequests.length === 0 ? (
          <div className="col-span-full rounded-lg border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center">
            <p className="font-medium text-slate-300">
              Queue is empty
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Queued requests will appear here
              when traffic builds up.
            </p>
          </div>
        ) : (
          visibleRequests.map(
            (request, index) => {
              const isNext =
                isPBLB && index === 0;

              return (
                <div
                  key={request.id}
                  className={`relative rounded-lg border p-4 ${getPriorityStyle(
                    request.priority
                  )}`}
                >
                  {isNext && (
                    <div className="absolute right-3 top-3 rounded-full bg-violet-600 px-2 py-1 text-xs font-semibold text-white">
                      NEXT
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950/60 text-sm font-bold">
                      #{index + 1}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {request.id}
                      </p>

                      <p className="text-xs opacity-70">
                        Queue position{" "}
                        {index + 1}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-xs opacity-60">
                        Priority
                      </p>

                      <p className="font-semibold">
                        {request.priority}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs opacity-60">
                        Size
                      </p>

                      <p className="font-semibold">
                        {request.requestSize}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs opacity-60">
                        Complexity
                      </p>

                      <p className="font-semibold">
                        {request.complexity}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-white/10 pt-3 text-xs opacity-70">
                    Status: {request.status}
                  </div>
                </div>
              );
            }
          )
        )}
      </div>

      {hiddenCount > 0 && (
        <p className="mt-4 text-center text-sm text-slate-400">
          + {hiddenCount} more requests
          waiting in the queue
        </p>
      )}

      {isPBLB &&
        orderedRequests.length > 1 && (
          <div className="mt-5 rounded-lg border border-violet-900 bg-violet-950/20 p-4">
            <p className="text-sm font-semibold text-violet-200">
              How to read this queue
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              Position #1 is the next request
              PBLB will process. Priority 5 is
              highest and Priority 1 is lowest.
              When two requests have the same
              priority, the request that arrived
              earlier appears first.
            </p>
          </div>
        )}
    </section>
  );
}