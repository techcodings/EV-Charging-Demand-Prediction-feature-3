import React, { useEffect, useRef } from 'react'

function colorForScore(s) {
  // 0..1 -> blue -> green -> yellow -> orange -> red
  const stops = [
    [0.0, [23,37,84]],    // navy
    [0.25,[37,99,235]],   // blue
    [0.5, [34,197,94]],   // green
    [0.7, [253,224,71]],  // yellow
    [0.85,[251,146,60]],  // orange
    [1.0, [239,68,68]],   // red
  ];
  for (let i=1;i<stops.length;i++) {
    if (s <= stops[i][0]) {
      const [p, c1] = stops[i-1];
      const [q, c2] = stops[i];
      const t = (s - p) / (q - p);
      const mix = (a,b)=>Math.round(a + t*(b-a));
      return `rgba(${mix(c1[0],c2[0])},${mix(c1[1],c2[1])},${mix(c1[2],c2[2])},0.9)`;
    }
  }
  return 'rgba(239,68,68,0.9)';
}

export default function HeatmapCanvas({ center, bboxKm, gridSize, heatmap, stations=[] }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0,0,rect.width, rect.height);

    if (!heatmap?.cells?.length) return;

    const latSpan = bboxKm / 111; // deg
    const lngSpan = bboxKm / (111 * Math.cos(center.lat*Math.PI/180));

    const latMin = center.lat - latSpan/2;
    const latMax = center.lat + latSpan/2;
    const lngMin = center.lng - lngSpan/2;
    const lngMax = center.lng + lngSpan/2;

    const x = lng => ( (lng - lngMin) / (lngMax - lngMin) ) * rect.width;
    const y = lat => ( 1 - (lat - latMin) / (latMax - latMin) ) * rect.height;

    // draw cells
    const cellW = rect.width / gridSize;
    const cellH = rect.height / gridSize;

    for (const c of heatmap.cells) {
      const px = x(c.lng) - cellW/2;
      const py = y(c.lat) - cellH/2;
      ctx.fillStyle = colorForScore(c.score);
      ctx.fillRect(px, py, cellW, cellH);
    }

    // station overlay
    ctx.fillStyle = 'white';
    for (const s of stations) {
      const lat = s?.AddressInfo?.Latitude;
      const lng = s?.AddressInfo?.Longitude;
      if (typeof lat !== 'number' || typeof lng !== 'number') continue;
      const px = x(lng);
      const py = y(lat);
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI*2);
      ctx.fill();
    }

    // border
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0,0,rect.width, rect.height);
  }, [center.lat, center.lng, bboxKm, gridSize, heatmap, stations]);

  return <div className="canvas-wrap"><canvas ref={ref}></canvas></div>
}
