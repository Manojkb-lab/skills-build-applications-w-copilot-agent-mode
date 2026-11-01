import { CapabilityCard } from './CapabilityCard.js';
export default function Workouts() {
  return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." path={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`} collection="suggestions" />;
}
