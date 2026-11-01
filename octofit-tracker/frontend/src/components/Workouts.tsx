import { getJson } from '../api/client.js';
import { CapabilityCard, useLoad } from './CapabilityCard.js';

const userEmail = 'mona@example.com';

export default function Workouts() {
  const state = useLoad(() => getJson<Record<string, unknown>>(`/api/workouts/suggestions/${encodeURIComponent(userEmail)}`), 'suggestions');
  return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." emptyMessage="No workout suggestions yet." state={state} />;
}
