// Candidate for etheia-agent-map — no existing equivalent could be inspected.
// See: https://github.com/Etheia-Consulting-LLC/etheia-agent-map
import { searchSearxng } from './searxng';

export const searchWeb = async (query: string) => {
  const provider = process.env.WEB_SEARCH_PROVIDER || 'searxng';
  if (provider === 'searxng') return searchSearxng(query);
  if (provider !== 'serper') {
    throw new Error(`Unknown web search provider: ${provider}`);
  }

  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) throw new Error('SERPER_API_KEY is required');
  const baseURL = (
    process.env.SERPER_BASE_URL || 'https://google.serper.dev'
  ).replace(/\/+$/, '');
  const response = await fetch(`${baseURL}/search`, {
    method: 'POST',
    headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, num: 10 }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) {
    throw new Error(`Web search error: HTTP ${response.status}`);
  }
  const data = await response.json();
  const results: Awaited<ReturnType<typeof searchSearxng>>['results'] = (
    data.organic || []
  ).map((result: { title: string; link: string; snippet?: string }) => ({
    title: result.title,
    url: result.link,
    content: result.snippet || '',
  }));
  return { results, suggestions: [] as string[] };
};
