import Link from "next/link";
import type { ReactNode } from "react";

const paperResults = [
  {
    algorithm: "FRLB",
    responseTime: "5.770251044 ms",
    averageLoad: "25",
  },
  {
    algorithm: "PBLB",
    responseTime: "6.833652 ms",
    averageLoad: "25",
  },
  {
    algorithm: "Hybrid FRLB-PBLB",
    responseTime: "3.846154 ms",
    averageLoad: "24.8",
  },
];

const paperSettings = [
  {
    item: "Number of Servers",
    paper: "20",
    project: "5",
  },
  {
    item: "Server Bandwidth",
    paper: "100–1000 Mbps",
    project: "400–800 Mbps",
  },
  {
    item: "Traffic Rate",
    paper: "10 requests / second",
    project:
      "1, 2, 5 or 10 requests / second",
  },
  {
    item: "Task Complexity",
    paper: "1–10",
    project: "1–10",
  },
  {
    item: "Request Priority",
    paper: "1–5",
    project: "1–5",
  },
  {
    item: "Warm-up Period",
    paper: "100 seconds",
    project: "Not simulated",
  },
];

export default function ResearchPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
                Research Reference
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Hybrid FRLB-PBLB Research
              </h1>

              <p className="mt-3 max-w-4xl leading-7 text-slate-400">
                This page explains the
                research paper on which the
                simulator is based, the
                algorithms implemented in
                the project, the equations
                used, and the difference
                between the original
                experiment and our
                five-server web simulation.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-lg bg-slate-800 px-5 py-3 font-semibold transition hover:bg-slate-700"
              >
                Live Simulation
              </Link>

              <Link
                href="/compare"
                className="rounded-lg bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500"
              >
                Compare Algorithms
              </Link>
            </div>
          </div>
        </header>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div>
              <p className="text-sm font-semibold text-blue-400">
                Selected 2026 Research Paper
              </p>

              <h2 className="mt-2 text-2xl font-bold leading-9">
                Intelligent Task
                Distribution Using Hybrid
                Algorithms and Enhancing
                Performance by Integrating
                FRLB and PBLB
              </h2>

              <p className="mt-4 text-slate-300">
                Author:{" "}
                <span className="font-semibold">
                  Yahia Jazyah
                </span>
              </p>

              <p className="mt-1 text-slate-300">
                Journal:{" "}
                <span className="font-semibold">
                  Information, 2026,
                  Volume 17, Article 445
                </span>
              </p>

              <p className="mt-1 text-slate-300">
                Published:{" "}
                <span className="font-semibold">
                  5 May 2026
                </span>
              </p>

              <p className="mt-1 text-slate-300">
                DOI:{" "}
                <span className="font-mono text-blue-300">
                  10.3390/info17050445
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-violet-900 bg-violet-950/20 p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-violet-300">
                Main Research Goal
              </p>

              <p className="mt-3 leading-7 text-slate-300">
                Combine the fast response
                behavior of FRLB with the
                priority-aware and
                load-balancing behavior of
                PBLB so that requests can
                achieve lower response time
                while avoiding excessive
                concentration of workload
                on a small number of
                servers.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-xl bg-slate-900 p-6">
          <h2 className="text-2xl font-bold">
            Why This Research Was Proposed
          </h2>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <ResearchCard
              title="FRLB Strength"
              description="FRLB attempts to reduce delay by selecting the available server with the lowest current response time."
            />

            <ResearchCard
              title="PBLB Strength"
              description="PBLB gives service preference to important requests by processing higher-priority requests before lower-priority requests."
            />

            <ResearchCard
              title="Hybrid Idea"
              description="The Hybrid method considers both current response time and load/priority information instead of optimizing only one objective."
            />
          </div>
        </section>

        <section className="mt-6 rounded-xl bg-slate-900 p-6">
          <p className="text-sm font-semibold text-blue-400">
            Fastest Response Load Balancing
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            FRLB
          </h2>

          <p className="mt-4 max-w-4xl leading-7 text-slate-300">
            FRLB evaluates the response
            times of available servers.
            When a request must be assigned,
            the server having the minimum
            response time is selected.
          </p>

          <Formula>
            Selected Server = arg minᵢ Rᵢ
          </Formula>

          <p className="mt-4 text-sm leading-6 text-slate-400">
            Rᵢ represents the response time
            of server i. For example, if
            Server 1 currently has a response
            time of 4.2 ms and Server 3 has
            3.7 ms, FRLB prefers Server 3
            if both servers are available.
          </p>

          <AlgorithmFlow
            steps={[
              "Incoming request arrives",
              "Identify available servers",
              "Read the current response time of each available server",
              "Find the minimum response time",
              "Assign the request to that server",
              "Update the server state",
            ]}
          />

          <div className="mt-5 rounded-lg border border-amber-900 bg-amber-950/20 p-4">
            <p className="font-semibold text-amber-300">
              Limitation
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              A server that is currently
              very fast may repeatedly
              receive requests. This can
              increase its load and
              eventually increase its
              response time. The Hybrid
              method therefore also
              considers balancing
              information.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-xl bg-slate-900 p-6">
          <p className="text-sm font-semibold text-orange-400">
            Priority-Based Load Balancing
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            PBLB
          </h2>

          <p className="mt-4 max-w-4xl leading-7 text-slate-300">
            PBLB focuses on which request
            should receive service first.
            Requests receive priority
            values and are placed into a
            priority queue. Higher-priority
            requests are processed before
            lower-priority requests.
          </p>

          <Formula>
            Selected Request = arg maxᵢ Pᵢ
          </Formula>

          <p className="mt-4 text-sm leading-6 text-slate-400">
            Pᵢ is the priority of request i.
            The project uses priorities from
            1 to 5, where 5 represents the
            highest priority.
          </p>

          <AlgorithmFlow
            steps={[
              "Incoming requests receive a priority",
              "Requests enter the request queue",
              "PBLB orders requests according to priority",
              "The highest-priority request is selected",
              "An available server is evaluated",
              "The request is assigned to the selected server",
            ]}
          />

          <div className="mt-5 rounded-lg border border-orange-900 bg-orange-950/20 p-4">
            <p className="font-semibold text-orange-300">
              Queue Visualization
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              When PBLB is selected in the
              live simulator, the Request
              Queue visualization shows
              higher-priority requests
              before lower-priority
              requests. Requests with equal
              priorities retain their
              arrival ordering.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-violet-900 bg-slate-900 p-6">
          <p className="text-sm font-semibold text-violet-400">
            Proposed Research Algorithm
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            Hybrid FRLB-PBLB
          </h2>

          <p className="mt-4 max-w-4xl leading-7 text-slate-300">
            The Hybrid algorithm evaluates
            each available server using two
            terms. The FRLB term represents
            current response time, while the
            balancing term represents server
            load with priority-sensitive
            behavior.
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <FormulaCard
              title="FRLB Term"
              formula="R_fast(i) = RTᵢ"
              description="Uses the current response time of server i."
            />

            <FormulaCard
              title="High Priority"
              formula="R_bal(i) = Lᵢ"
              description="High-priority requests strongly prefer servers having lower current load."
            />

            <FormulaCard
              title="Other Priority"
              formula="R_bal(i) = Lᵢ / Lmax"
              description="Other requests use normalized server load."
            />
          </div>

          <Formula>
            Score(i) = α × R_fast(i) +
            (1 − α) × R_bal(i)
          </Formula>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded-lg bg-slate-800 p-5">
              <h3 className="font-semibold">
                Larger α
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                More importance is given to
                response time, so server
                selection becomes more
                response-focused.
              </p>
            </div>

            <div className="rounded-lg bg-slate-800 p-5">
              <h3 className="font-semibold">
                Smaller α
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                More importance is given to
                balancing, so server load
                influences selection more
                strongly.
              </p>
            </div>
          </div>

          <AlgorithmFlow
            steps={[
              "Read the incoming request priority and request size",
              "Identify servers whose current load is below the maximum threshold",
              "Calculate R_fast for every available server",
              "Calculate the priority-sensitive R_bal term",
              "Calculate the Hybrid score for each available server",
              "Select the server with the minimum score",
              "Assign the request to that server",
              "Increase server load using the request size",
              "Update the response time",
              "Repeat for the next request",
            ]}
          />

          <Formula>
            Lᵢ = Lᵢ + request size
          </Formula>
        </section>

        <section className="mt-6 rounded-xl bg-slate-900 p-6">
          <h2 className="text-2xl font-bold">
            Dynamic Response Time
          </h2>

          <p className="mt-3 max-w-4xl leading-7 text-slate-300">
            The paper explains that response
            time can change because of
            system load, queue length,
            transaction complexity,
            available resources and system
            configuration.
          </p>

          <Formula>
            ART = k × (L × Q × C) /
            (R × S)
          </Formula>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="border-b border-slate-700 text-sm text-slate-400">
                <tr>
                  <th className="p-3">
                    Symbol
                  </th>

                  <th className="p-3">
                    Meaning
                  </th>

                  <th className="p-3">
                    Project Representation
                  </th>
                </tr>
              </thead>

              <tbody className="text-sm">
                <EquationRow
                  symbol="L"
                  meaning="System load"
                  implementation="Current server load"
                />

                <EquationRow
                  symbol="Q"
                  meaning="Queue length"
                  implementation="Current request queue length"
                />

                <EquationRow
                  symbol="C"
                  meaning="Transaction complexity"
                  implementation="Request complexity from 1 to 10"
                />

                <EquationRow
                  symbol="R"
                  meaning="Available resources"
                  implementation="Server bandwidth normalized in the simulation"
                />

                <EquationRow
                  symbol="S"
                  meaning="Configuration factor"
                  implementation="Fixed simulation configuration factor"
                />

                <EquationRow
                  symbol="k"
                  meaning="Normalization constant"
                  implementation="Simulation normalization constant"
                />
              </tbody>
            </table>
          </div>

          <div className="mt-5 rounded-lg border border-amber-900 bg-amber-950/20 p-4">
            <p className="font-semibold text-amber-300">
              Implementation Assumption
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              The paper provides the
              response-time relationship but
              does not specify every
              numerical value required to
              create a deterministic browser
              simulation. The project uses
              simulation-specific constants
              while preserving the
              relationship between load,
              queue length, complexity and
              resources.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-xl bg-slate-900 p-6">
          <h2 className="text-2xl font-bold">
            Original Paper vs Our Project
          </h2>

          <p className="mt-3 max-w-4xl leading-7 text-slate-400">
            The algorithms remain the focus
            of the project, while the
            environment is reduced to five
            servers so the system is easier
            to visualize and demonstrate.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-slate-700 text-slate-400">
                <tr>
                  <th className="p-3">
                    Parameter
                  </th>

                  <th className="p-3">
                    Research Paper
                  </th>

                  <th className="p-3">
                    Our Web Simulator
                  </th>
                </tr>
              </thead>

              <tbody>
                {paperSettings.map(
                  (setting) => (
                    <tr
                      key={
                        setting.item
                      }
                      className="border-b border-slate-800"
                    >
                      <td className="p-3 font-semibold">
                        {
                          setting.item
                        }
                      </td>

                      <td className="p-3 text-slate-300">
                        {
                          setting.paper
                        }
                      </td>

                      <td className="p-3 text-blue-300">
                        {
                          setting.project
                        }
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 rounded-lg border border-blue-900 bg-blue-950/20 p-4">
            <p className="font-semibold text-blue-300">
              Why Five Servers?
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              The research experiment uses
              20 servers. Our project uses
              five simulated servers so
              individual server loads,
              response times, routing
              decisions and topology remain
              easy to observe during the
              demonstration.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-xl bg-slate-900 p-6">
          <h2 className="text-2xl font-bold">
            Results Reported by the Paper
          </h2>

          <p className="mt-3 max-w-4xl leading-7 text-slate-400">
            These numbers belong to the
            original 20-server MATLAB
            experiment described by the
            research paper. They are not
            results generated by this
            five-server web simulator.
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {paperResults.map(
              (result) => (
                <div
                  key={
                    result.algorithm
                  }
                  className="rounded-xl border border-slate-700 bg-slate-800 p-5"
                >
                  <h3 className="text-lg font-semibold">
                    {
                      result.algorithm
                    }
                  </h3>

                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Average Response Time
                      </p>

                      <p className="mt-1 text-xl font-semibold">
                        {
                          result.responseTime
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Average Server Load
                      </p>

                      <p className="mt-1 text-xl font-semibold">
                        {
                          result.averageLoad
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="mt-5 rounded-lg border border-violet-900 bg-violet-950/20 p-4">
            <p className="font-semibold text-violet-300">
              Paper Conclusion
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              In the paper&apos;s experiment,
              the Hybrid algorithm reports a
              lower average response time
              than both FRLB and PBLB while
              maintaining a similar average
              server load.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-blue-900 bg-slate-900 p-6">
          <p className="text-sm font-semibold text-blue-400">
            Implemented Project Feature
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            How Our Algorithm Comparison
            Page Works
          </h2>

          <p className="mt-4 max-w-4xl leading-7 text-slate-300">
            The Comparison page performs a
            controlled experiment using the
            project&apos;s simulation engine.
            One deterministic workload is
            generated and that exact workload
            is reused for FRLB, PBLB and
            Hybrid. Therefore all algorithms
            receive identical priorities,
            request sizes, complexities and
            arrival times.
          </p>

          <div className="mt-6 rounded-xl bg-slate-950 p-5">
            <div className="grid gap-3 text-center md:grid-cols-7 md:items-center">
              <FlowBox text="Generate workload once" />

              <FlowArrow />

              <FlowBox text="FRLB" />

              <FlowBox text="PBLB" />

              <FlowBox text="Hybrid" />

              <FlowArrow />

              <FlowBox text="Compare metrics" />
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-400">
            The comparison uses a fixed
            workload seed of 2026 and a
            traffic rate of 10 requests per
            second. The user can compare
            workloads containing 50, 100 or
            200 requests.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Avg Response"
              description="Average total response time of completed requests."
            />

            <MetricCard
              title="Avg Processing"
              description="Average processing time after server assignment."
            />

            <MetricCard
              title="Avg Queue Wait"
              description="Average time requests wait before server assignment."
            />

            <MetricCard
              title="Avg Server Load"
              description="Average simulated workload across the five servers."
            />

            <MetricCard
              title="Peak Queue"
              description="Largest number of requests waiting during the experiment."
            />

            <MetricCard
              title="Throughput"
              description="Number of requests completed per simulated second."
            />

            <MetricCard
              title="Duration"
              description="Total simulated time required to complete the workload."
            />

            <MetricCard
              title="Server Distribution"
              description="Number of requests completed by each of the five servers."
            />
          </div>

          <div className="mt-6 rounded-lg border border-red-900 bg-red-950/20 p-4">
            <p className="font-semibold text-red-300">
              Important Result Distinction
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Results displayed on the
              Comparison page are generated
              by our five-server TypeScript
              simulation. They should not be
              presented as exact
              reproductions of the
              paper&apos;s 20-server MATLAB
              numerical results.
            </p>
          </div>

          <Link
            href="/compare"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
          >
            Open Algorithm Comparison
          </Link>
        </section>

        <section className="mt-6 rounded-xl bg-slate-900 p-6">
          <h2 className="text-2xl font-bold">
            Paper-Defined Logic vs Project
            Assumptions
          </h2>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-green-900 bg-green-950/20 p-5">
              <h3 className="font-semibold text-green-300">
                Directly Based on the Paper
              </h3>

              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <li>
                  • FRLB minimum-response
                  server selection
                </li>

                <li>
                  • PBLB highest-priority
                  request selection
                </li>

                <li>
                  • Priority range 1–5
                </li>

                <li>
                  • Complexity range 1–10
                </li>

                <li>
                  • Server availability
                  using a maximum-load
                  threshold
                </li>

                <li>
                  • Hybrid R_fast term
                </li>

                <li>
                  • Priority-sensitive
                  R_bal term
                </li>

                <li>
                  • Weighted Hybrid score
                  using α
                </li>

                <li>
                  • Minimum-score server
                  selection
                </li>

                <li>
                  • Server load increase
                  using request size
                </li>

                <li>
                  • Dynamic response-time
                  relationship
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-amber-900 bg-amber-950/20 p-5">
              <h3 className="font-semibold text-amber-300">
                Web Simulation Assumptions
              </h3>

              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <li>
                  • Five servers instead of
                  twenty
                </li>

                <li>
                  • Initial demo-server load
                  values
                </li>

                <li>
                  • Initial demo-server
                  response times
                </li>

                <li>
                  • Specific bandwidth
                  values used by the five
                  servers
                </li>

                <li>
                  • Request-size generation
                  range
                </li>

                <li>
                  • High-priority threshold
                  set to 4
                </li>

                <li>
                  • Numerical response-time
                  constants
                </li>

                <li>
                  • Browser processing-time
                  scaling
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-xl bg-slate-900 p-6 text-center">
          <h2 className="text-xl font-semibold">
            Explore the Implementation
          </h2>

          <p className="mt-2 text-slate-400">
            Use the live simulator to
            observe dynamic behavior or run
            the same workload through all
            three algorithms on the
            comparison page.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
            >
              Live Simulator
            </Link>

            <Link
              href="/compare"
              className="rounded-lg bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500"
            >
              Algorithm Comparison
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

interface ResearchCardProps {
  title: string;
  description: string;
}

function ResearchCard({
  title,
  description,
}: ResearchCardProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

interface FormulaProps {
  children: ReactNode;
}

function Formula({
  children,
}: FormulaProps) {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-slate-700 bg-slate-950 p-5">
      <code className="whitespace-nowrap text-lg font-semibold text-cyan-300">
        {children}
      </code>
    </div>
  );
}

interface FormulaCardProps {
  title: string;
  formula: string;
  description: string;
}

function FormulaCard({
  title,
  formula,
  description,
}: FormulaCardProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
      <p className="text-sm font-semibold text-slate-300">
        {title}
      </p>

      <code className="mt-3 block text-base font-semibold text-cyan-300">
        {formula}
      </code>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

interface AlgorithmFlowProps {
  steps: string[];
}

function AlgorithmFlow({
  steps,
}: AlgorithmFlowProps) {
  return (
    <div className="mt-6 rounded-xl bg-slate-950 p-5">
      <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Working
      </p>

      <div className="space-y-3">
        {steps.map(
          (step, index) => (
            <div
              key={step}
              className="flex items-start gap-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold">
                {index + 1}
              </div>

              <div className="pt-1 text-sm leading-6 text-slate-300">
                {step}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

interface EquationRowProps {
  symbol: string;
  meaning: string;
  implementation: string;
}

function EquationRow({
  symbol,
  meaning,
  implementation,
}: EquationRowProps) {
  return (
    <tr className="border-b border-slate-800">
      <td className="p-3 font-mono font-semibold text-cyan-300">
        {symbol}
      </td>

      <td className="p-3 text-slate-300">
        {meaning}
      </td>

      <td className="p-3 text-slate-400">
        {implementation}
      </td>
    </tr>
  );
}

interface MetricCardProps {
  title: string;
  description: string;
}

function MetricCard({
  title,
  description,
}: MetricCardProps) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
      <p className="font-semibold">
        {title}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

interface FlowBoxProps {
  text: string;
}

function FlowBox({
  text,
}: FlowBoxProps) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-4 text-sm font-semibold">
      {text}
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="hidden text-xl text-slate-500 md:block">
      →
    </div>
  );
}