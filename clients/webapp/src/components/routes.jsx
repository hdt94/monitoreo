import Home from "./pages/Home";

import Analysis from "./pages/analytics/Analysis";
import Executions from "./pages/analytics/Executions";
import Jobs from "./pages/analytics/Jobs";
import JobStream from "./pages/analytics/JobStream"

import Analyses from "./pages/registry/Analyses";
import Instruments from "./pages/registry/Instruments";
import Measures from "./pages/registry/Measures";
import Reports from "./pages/registry/Reports";
import Structures from "./pages/registry/Structures";

export const routes = [
  { path: "/", element: <Home /> },
  {
    name: "Registry",
    path: "/registry",
    children: [
      // TODO extended view in registry for each category
      // children: [{ path: ":id" }],
      { path: "analyses", element: <Analyses />, name: "Analyses" },
      { path: "instruments", element: <Instruments />, name: "Instruments" },
      { path: "measures", element: <Measures />, name: "Measures" },
      { path: "reports", element: <Reports />, name: "Reports" },
      { path: "structures", element: <Structures />, name: "Structures" },
    ],
  },
  {
    name: "Analytics",
    path: "/analytics",
    children: [
      {
        path: "analysis",
        element: <Analysis />,
        name: "Analysis",
      },
      {
        path: "monitoring",
        element: <h2>Monitoring</h2>,
        name: "Monitoring",
      },
      {
        path: "executions",
        element: <Executions />,
        name: "Executions",
      },
      {
        path: "jobs",
        name: "Jobs",
        children: [
          {
            path: '',
            element: <Jobs />,
          },
          {
            path: 'new-stream',
            element: <JobStream />
          }
        ]
      },
    ],
  },
  { path: "*", element: <h1>Route not found</h1> },
];
