import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Props = {
  title: string;
  description: string;
  path: string;
  collection: string;
};
type Entry = Record<string, unknown>;

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

export function CapabilityCard({ title, description, path, collection }: Props) {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<Record<string, unknown>>(path)
      .then((response) => {
        const data = response[collection];
        if (!isEntryArray(data)) throw new Error('Invalid response format.');
        if (active) setEntries(data);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Please try again.');
      });

    return () => {
      active = false;
    };
  }, [collection, path]);

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
          <p>No {collection} available.</p>
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
