import PlannerApp from "@/components/planner/PlannerApp";
import RequireAuth from "@/components/RequireAuth";

export default function PlannerPage() {
  return (
    <RequireAuth next="/planner">
      <PlannerApp />
    </RequireAuth>
  );
}
