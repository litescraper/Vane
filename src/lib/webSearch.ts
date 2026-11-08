// Candidate for etheia-agent-map — no existing equivalent could be inspected.
// See: https://github.com/Etheia-Consulting-LLC/etheia-agent-map
import { searchSearxng } from './searxng';

export const searchWeb = async (query: string) => {
  const provider = process.env.WEB_SEARCH_PROVIDER || 'searxng';
  if (provider === 'searxng') return searchSearxng(query);
  if (provider !== 'litescrape') {
    throw new Error(`Unknown web search provider: ${provider}`);
  }

  const apiKey = process.env.LITESCRAPE_API_KEY;
  if (!apiKey) throw new Error('LITESCRAPE_API_KEY is required');
  const baseURL = (
    process.env.LITESCRAPE_BASE_URL || 'https://api.litescrape.com'
  ).replace(/\/+$/, '');
  const url = new URL(`${baseURL}/api/google/search`);
  url.searchParams.set('q', query);
  url.searchParams.set('num', '10');
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) {
    throw new Error(`Web search error: HTTP ${response.status}`);
  }
  const data = await response.json();
  const results: Awaited<ReturnType<typeof searchSearxng>>['results'] = (
    data.organic_results || []
  ).map((result: { title: string; link: string; snippet?: string }) => ({
    title: result.title,
    url: result.link,
    content: result.snippet || '',
  }));
  return { results, suggestions: [] as string[] };
};
