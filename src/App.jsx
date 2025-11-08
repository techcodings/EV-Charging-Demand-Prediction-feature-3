import React, { useEffect, useState } from 'react'
import HeatmapCanvas from './components/HeatmapCanvas.jsx'
import ControlPanel from './components/ControlPanel.jsx'
import { api } from './lib/api.js'

const today = new Date().toISOString().slice(0,10);
const lastMonth = new Date(Date.now()-30*24*3600*1000).toISOString().slice(0,10);

export default function App() {
  const [values, setValues] = useState({
    lat: 37.7749,
    lng: -122.4194,
    bbox_km: 10,
    grid_size: 20,
    start: lastMonth, end: today,
    history_csv_url: '',
    w_weather: 0.35, w_access: 0.45, w_trend: 0.20,
    adoption_growth: 0.15,
    add_stations: ''
  });
  const [busy, setBusy] = useState(false);
  const [stations, setStations] = useState([]);
  const [heatmap, setHeatmap] = useState(null);
  const [summary, setSummary] = useState('');
  const [kpi, setKpi] = useState({ peak: 0, stations: 0, hours: 0 });

  async function refreshStations() {
    const out = await api.stations({ lat: values.lat, lng: values.lng, radius_km: values.bbox_km });
    setStations(out.items || []);
  }

  async function onPredict() {
    setBusy(true);
    try {
      await refreshStations();
      const payload = {
        center: { lat: Number(values.lat), lng: Number(values.lng) },
        bbox_km: Number(values.bbox_km),
        grid_size: Number(values.grid_size),
        timerange: { start: values.start, end: values.end },
        history_csv_url: values.history_csv_url || '',
        weights: { 
          weather: Number(values.w_weather), 
          station_access: Number(values.w_access), 
          trend: Number(values.w_trend) 
        }
      };
      const res = await api.predict(payload);
      setHeatmap(res.heatmap);
      setSummary(res.summary);
      setKpi({ 
        peak: res.peak_load_kw, 
        stations: res.inputs.counts.stations, 
        hours: res.inputs.counts.weather_hours 
      });
    } catch (e) {
      alert('Prediction error: ' + e);
    } finally {
      setBusy(false);
    }
  }

  async function onScenario() {
    setBusy(true);
    try {
      const addStations = values.add_stations
        .split(';')
        .map(s => s.trim())
        .filter(Boolean)
        .map(p => { const [a,b] = p.split(','); return { lat: Number(a), lng: Number(b) }; });
      const res = await api.scenario({
        center: { lat: Number(values.lat), lng: Number(values.lng) },
        bbox_km: Number(values.bbox_km),
        grid_size: Number(values.grid_size),
        adoption_growth: Number(values.adoption_growth),
        add_stations: addStations
      });
      // visualize scenario as heatmap too
      setHeatmap({ size: values.grid_size, cells: res.grid });
      setSummary(`Scenario Demand Index: ${res.demand_index.toFixed?.(2) ?? res.demand_index}. Growth=${values.adoption_growth}. Added stations=${addStations.length}.`);
    } catch (e) {
      alert('Scenario error: ' + e);
    } finally {
      setBusy(false);
    }
  }

  function onSpeak() {
    const s = window.speechSynthesis;
    if (!s || !summary) return;
    const u = new SpeechSynthesisUtterance(summary);
    u.rate = 1.05;
    u.pitch = 1;
    s.cancel();
    s.speak(u);
  }

  useEffect(() => { refreshStations().catch(()=>{}); }, []);

  return (
    <div className="container">
      {/* 🔹 Header with Back to Home button */}
      <header 
        className="mb-12" 
        style={{ 
          display:'flex', 
          justifyContent:'space-between', 
          alignItems:'center', 
          gap:12 
        }}
      >
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <h1>EV Charging Demand Prediction</h1>
          <span className="muted">AI-based Heatmap & Forecast</span>
        </div>

        {/* ✅ Back to Home button */}
        <a
          href="https://energy-verse-portal.netlify.app/?feature=3"
          className="btn-back"
          style={{
            background:'#caff37',
            color:'#000',
            padding:'6px 14px',
            borderRadius:'8px',
            fontWeight:'600',
            textDecoration:'none',
            boxShadow:'0 0 10px rgba(186,255,55,0.6)',
            transition:'0.3s',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 16px rgba(186,255,55,0.9)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 10px rgba(186,255,55,0.6)'}
        >
          ← Back to Home
        </a>
      </header>

      <ControlPanel 
        values={values} 
        setValues={setValues} 
        onPredict={onPredict} 
        onScenario={onScenario} 
        busy={busy} 
        summary={summary} 
        onSpeak={onSpeak} 
      />

      <div className="card grid">
        <div className="flex">
          <h2 style={{marginRight:8}}>EV Charging Demand Prediction</h2>
          <span className="badge">Heatmap</span>
          <span className="badge">Stations: {stations.length}</span>
        </div>

        <HeatmapCanvas
          center={{ lat: Number(values.lat), lng: Number(values.lng) }}
          bboxKm={Number(values.bbox_km)}
          gridSize={Number(values.grid_size)}
          heatmap={heatmap}
          stations={stations}
        />

        <div className="flex" style={{justifyContent:'space-between'}}>
          <div className="legend" style={{flex:1, marginRight:16}}>
            <div className="legend-bar"></div>
            <small className="muted">Low &nbsp;→&nbsp; High demand</small>
          </div>
          <div className="kpi" style={{minWidth:360}}>
            <div className="metric">
              <div className="val">{kpi.peak}</div>
              <div className="label">Peak Load (kW)</div>
            </div>
            <div className="metric">
              <div className="val">{kpi.stations}</div>
              <div className="label">Stations</div>
            </div>
            <div className="metric">
              <div className="val">{kpi.hours}</div>
              <div className="label">Weather Hours</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
