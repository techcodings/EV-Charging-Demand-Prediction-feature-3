// Resolve base URL; if UI & functions on same Netlify site, this can be blank (same-origin)
const base = '';

async function get(path, params={}) {
  const url = new URL((base + path), window.location.origin);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function post(path, body={}) {
  const url = (base + path);
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  health: () => get('https://endearing-donut-855404.netlify.app/.netlify/functions/health'),
  stations: ({lat,lng,radius_km}) => get('https://endearing-donut-855404.netlify.app/.netlify/functions/stations', { lat, lng, radius_km }),
  weather: ({lat,lng,start,end}) => get('https://endearing-donut-855404.netlify.app/.netlify/functions/weather', { lat, lng, start, end }),
  predict: (payload) => post('https://endearing-donut-855404.netlify.app/.netlify/functions/demand-predict', payload),
  scenario: (payload) => post('https://endearing-donut-855404.netlify.app/.netlify/functions/scenario', payload),
};
