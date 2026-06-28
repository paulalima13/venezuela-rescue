# 🚨 Venezuela Rescue — Mapa de Equipos de Rescate

**Live app:** https://venezuela-rescue.netlify.app

A real-time disaster response tool built in response to the June 2026 earthquakes in Venezuela. Connects heavy equipment owners with rescue sites where people are trapped under collapsed buildings.

Built in one afternoon by a data engineer based in Miami, FL.

---

## What it does

- **🚨 Necesito equipo** — Anyone at a collapse site can submit a rescue request with GPS location, equipment needed, and urgency level
- **🚜 Tengo equipo** — Equipment owners (excavators, cranes, trucks, generators) register their machine and location
- **🚛 Tengo transporte** — Flatbed truck owners register to help move heavy equipment
- **🗺 Mapa en vivo** — All equipment and requests plotted on a live map of the affected zone (La Guaira, Caracas, Los Teques, Guarenas). Tap any marker to see details and contact via WhatsApp
- Auto-refreshes every 30 seconds
- GPS capture with manual fallback
- Venezuelan phone format (+58) auto-formatted and WhatsApp-ready

---

## Tech stack

| Layer | Tool |
|---|---|
| Frontend | React (Vite) |
| Database | Supabase (PostgreSQL + PostGIS) |
| Hosting | Netlify |
| Maps | SVG custom renderer |

---

## Database schema

Three tables: `equipment`, `requests`, `transport`

PostGIS enabled for proximity queries. The `nearest_match()` SQL function finds the closest available equipment for any open rescue request.

See `schema.sql` for the full schema.

---

## How to deploy your own instance

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run `schema.sql` in the SQL Editor
4. Fork this repo
5. Replace `SUPABASE_URL` and `SUPABASE_ANON` in `src/App.tsx` with your project credentials
6. Deploy to [netlify.com](https://netlify.com) — connect your GitHub repo, click Deploy

Total setup time: ~15 minutes.

---

## Adapting for other disasters

This tool is designed to be forked and redeployed for any disaster requiring heavy equipment coordination. To adapt:

- Change the map `viewBox` coordinates to your affected region
- Update city reference points in `MapaCanvas`
- Update equipment types in `TIPOS_EQUIPO` as needed
- Redeploy

---

## Built by

Paula Lima — Data Engineer, Miami FL  
Built June 24–25, 2026 in response to the Venezuela earthquakes

---

## License

MIT — free to use, fork, and deploy for humanitarian purposes.
