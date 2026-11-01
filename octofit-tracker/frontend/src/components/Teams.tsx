import { getJson } from '../api/client.js';
import { CapabilityCard, useLoad } from './CapabilityCard.js';

export default function Teams() {
  const state = useLoad(() => getJson<Record<string, unknown>>('/api/teams'), 'teams');
  return <CapabilityCard title="Teams" description="Manage teams and members." emptyMessage="No teams yet." state={state} />;
}
