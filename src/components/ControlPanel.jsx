import React from 'react'

export default function ControlPanel({ values, setValues, onPredict, onScenario, busy, summary, onSpeak }) {
  const v = values;
  const set = (k) => (e) => setValues({ ...v, [k]: e.target.value });

  return (
    <div className="card">
      <h2>Controls</h2>
      <div className="input-row">
        <div>
          <label>Latitude</label>
          <input type="number" step="0.0001" value={v.lat} onChange={set('lat')} />
        </div>
        <div>
          <label>Longitude</label>
          <input type="number" step="0.0001" value={v.lng} onChange={set('lng')} />
        </div>
      </div>
      <div className="input-row">
        <div>
          <label>BBox Size (km)</label>
          <input type="number" value={v.bbox_km} onChange={set('bbox_km')} />
        </div>
        <div>
          <label>Grid Size</label>
          <input type="number" value={v.grid_size} onChange={set('grid_size')} />
        </div>
      </div>
      <div className="input-row">
        <div>
          <label>Start date</label>
          <input type="date" value={v.start} onChange={set('start')} />
        </div>
        <div>
          <label>End date</label>
          <input type="date" value={v.end} onChange={set('end')} />
        </div>
      </div>
      <div className="input-row">
        <div>
          <label>History CSV URL (optional)</label>
          <input type="text" value={v.history_csv_url} onChange={set('history_csv_url')} placeholder="https://.../usage.csv" />
        </div>
        <div>
          <label>Adoption Growth (scenario)</label>
          <input type="number" step="0.05" value={v.adoption_growth} onChange={set('adoption_growth')} />
        </div>
      </div>
      <div className="input-row">
        <div>
          <label>Weights: Weather</label>
          <input type="number" step="0.05" value={v.w_weather} onChange={set('w_weather')} />
        </div>
        <div>
          <label>Weights: Access</label>
          <input type="number" step="0.05" value={v.w_access} onChange={set('w_access')} />
        </div>
      </div>
      <div className="input-row">
        <div>
          <label>Weights: Trend</label>
          <input type="number" step="0.05" value={v.w_trend} onChange={set('w_trend')} />
        </div>
        <div>
          <label>New Stations (lat,lng;...)</label>
          <input type="text" value={v.add_stations} onChange={set('add_stations')} placeholder="37.78,-122.41;37.76,-122.43" />
        </div>
      </div>

      <div className="flex">
        <button className="primary" disabled={busy} onClick={onPredict}>Run Prediction</button>
        <button className="secondary" disabled={busy} onClick={onScenario}>Run Scenario</button>
        <button className="secondary" disabled={!summary} onClick={onSpeak}>Speak Summary</button>
      </div>

      {summary && <>
        <hr className="sep" />
        <div className="badge">Summary</div>
        <div className="code">{summary}</div>
      </>}
    </div>
  )
}
