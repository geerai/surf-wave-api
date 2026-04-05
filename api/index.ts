import { fetchMarineData } from '../src/marineApi';

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '');
  const lon = parseFloat(searchParams.get('lon') || '');

  if (isNaN(lat) || isNaN(lon)) {
    return new Response(JSON.stringify({ error: 'Invalid coordinates' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await fetchMarineData(lat, lon);

  return new Response(JSON.stringify(result.data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Methods': 'GET, OPTIONS'
    },
  });
}