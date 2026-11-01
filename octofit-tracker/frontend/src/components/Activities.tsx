import { getJson } from '../api/client.js';
import { CapabilityCard, useLoad } from './CapabilityCard.js';

export default function Activities() {
  const state = useLoad(() => getJson<Record<string, unknown>>('/api/activities'), 'activities');
  return <CapabilityCard title="Activities" description="Track student activity minutes and points." emptyMessage="No activities yet." state={state} />;
}
