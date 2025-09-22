// Small helper to safely parse JSON responses.
// Returns parsed object when possible, otherwise null.
export async function parseJSONSafe(response) {
  if (!response) return null;
  // Read raw text first — response.json() throws on empty body
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (err) {
    // If it's not valid JSON, return null so callers can handle it
    return null;
  }
}

export default parseJSONSafe;
