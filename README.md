# EV Demand UI (React + Vite)

Simple UI to call your Netlify Functions backend:
- Heatmap canvas (no external map libs)
- Controls for lat/lng, bbox, grid size, dates, weights
- Scenario runner (EV adoption + new stations)
- Text-to-Speech for the summary

## Run Locally
```bash
npm i
npm run dev
```
If the UI is on the **same Netlify site** as the functions, you don't need any config.
If the functions are on a different origin, create `.env` with:

```
VITE_API_BASE=https://your-site.netlify.app
```

Then the UI will call `${VITE_API_BASE}/.netlify/functions/*`.
