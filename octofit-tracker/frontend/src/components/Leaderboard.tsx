import { getJson } from '../api/client.js';
import { CapabilityCard, useLoad } from './CapabilityCard.js';

export default function Leaderboard() {
  const state = useLoad(() => getJson<Record<string, unknown>>('/api/leaderboard'), 'leaderboard');
  return <CapabilityCard title="Leaderboard" description="Compare team point totals." emptyMessage="No leaderboard scores yet." state={state} />;
}
