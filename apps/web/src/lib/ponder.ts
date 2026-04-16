const PONDER_URL = process.env.PONDER_URL ?? "http://localhost:42069"

export async function ponderQuery<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${PONDER_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 15 }, // ISR: refetch every 15s
  })

  if (!res.ok) {
    throw new Error(`Ponder query failed: ${res.status} ${res.statusText}`)
  }

  const json = await res.json()

  if (json.errors?.length) {
    throw new Error(`Ponder GraphQL error: ${json.errors[0].message}`)
  }

  return json.data as T
}
