import { useEffect, useState } from 'react';

type Props = {
  title: string;
  description: string;
  emptyMessage: string;
  state: LoadState;
};
type Entry = Record<string, unknown>;
export type LoadState = { entries: Entry[] | null; error: string | null };

function isEntryArray(value: unknown): value is Entry[] {
  return Array.isArray(value) && value.every(
    (entry): entry is Entry => entry !== null && typeof entry === 'object' && !Array.isArray(entry),
  );
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(formatValue).join(', ');
  if (value !== null && typeof value === 'object') return JSON.stringify(value);
  return String(value ?? '');
}

export function useLoad(load: () => Promise<Record<string, unknown>>, collection: string): LoadState {
  const [state, setState] = useState<LoadState>({ entries: null, error: null });

  useEffect(() => {
    let active = true;
    load()
      .then((response) => {
        const data = response[collection];
        if (!isEntryArray(data)) throw new Error('Invalid response format.');
        if (active) setState({ entries: data, error: null });
      })
      .catch((cause: unknown) => {
        if (active) setState({ entries: null, error: cause instanceof Error ? cause.message : 'Please try again.' });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection]);

  return state;
}

export function CapabilityCard({ title, description, emptyMessage, state }: Props) {
  const { entries, error } = state;
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {error !== null ? (
          <p role="alert">Unable to load {title.toLowerCase()}. {error}</p>
        ) : entries === null ? (
          <p role="status">Loading {title.toLowerCase()}...</p>
        ) : entries.length === 0 ? (
          <p>{emptyMessage}</p>
        ) : (
          <ul className="list-group">
            {entries.map((entry, index) => (
              <li className="list-group-item" key={String(entry._id ?? index)}>
                {Object.entries(entry).map(([field, value]) => (
                  <span className="me-3" key={field}>
                    <strong>{field}:</strong> {formatValue(value)}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
