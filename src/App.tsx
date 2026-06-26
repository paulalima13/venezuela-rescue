import { useState, useEffect } from "react";

const SUPABASE_URL = "https://zvcyuajyltbfawhukwid.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2Y3l1YWp5bHRiZmF3aHVrd2lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NDQ1ODEsImV4cCI6MjA5ODAyMDU4MX0.Y8Ed7udW8G_jStsQrIII6nqrqcFBEuRqqmt6PJUhXGQ";
const HEADERS = {
  apikey: SUPABASE_ANON,
  Authorization: `Bearer ${SUPABASE_ANON}`,
  "Content-Type": "application/json",
};

async function dbGet(table: string) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    headers: HEADERS,
  });
  return r.json();
}
async function dbInsert(table: string, data: object) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...HEADERS, Prefer: "return=representation" },
    body: JSON.stringify(data),
  });
  return r.json();
}

const TIPOS_EQUIPO = [
  "Excavadora",
  "Grúa",
  "Bulldozer",
  "Cargador",
  "Camión",
  "Generador",
];
const TIPOS_TRANSPORTE = [
  "Camión plataforma",
  "Grúa de remolque",
  "Camión articulado",
  "Camioneta 4x4",
  "Otro",
];

const COLOR_ESTADO = {
  disponible: "#22c55e",
  desplegado: "#f97316",
  no_disponible: "#6b7280",
};
const COLOR_URGENCIA = { 1: "#fbbf24", 2: "#f97316", 3: "#ef4444" };
const LABEL_URGENCIA = { 1: "Moderada", 2: "Alta", 3: "Crítica" };
const LABEL_ESTADO = {
  disponible: "Disponible",
  desplegado: "Desplegado",
  no_disponible: "No disponible",
};

function estadoKey(s) {
  return s === "available"
    ? "disponible"
    : s === "deployed"
    ? "desplegado"
    : "no_disponible";
}

function distanciaKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function BotonUbicacion({ lat, lng, onUbicacion }) {
  const [estadoGps, setEstadoGps] = useState("idle");
  const [modoManual, setModoManual] = useState(false);
  const [latManual, setLatManual] = useState("");
  const [lngManual, setLngManual] = useState("");

  function obtenerUbicacion() {
    if (!navigator.geolocation) {
      setEstadoGps("error");
      return;
    }
    setEstadoGps("cargando");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onUbicacion(pos.coords.latitude, pos.coords.longitude);
        setEstadoGps("ok");
        setModoManual(false);
      },
      () => setEstadoGps("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function aplicarManual() {
    const la = parseFloat(latManual),
      lo = parseFloat(lngManual);
    if (!isNaN(la) && !isNaN(lo)) {
      onUbicacion(la, lo);
      setEstadoGps("ok");
    }
  }

  const configs = {
    idle: {
      bg: "#1e3a5f",
      border: "#2563eb",
      color: "#93c5fd",
      icon: "📍",
      texto: "Usar mi ubicación actual",
    },
    cargando: {
      bg: "#1e293b",
      border: "#334155",
      color: "#64748b",
      icon: "⏳",
      texto: "Obteniendo ubicación…",
    },
    ok: {
      bg: "#052e16",
      border: "#16a34a",
      color: "#4ade80",
      icon: "✅",
      texto: "Ubicación capturada — tocar para actualizar",
    },
    error: {
      bg: "#1c0f0f",
      border: "#7f1d1d",
      color: "#fca5a5",
      icon: "⚠️",
      texto: "No se pudo obtener. Intenta de nuevo.",
    },
  };
  const c = configs[estadoGps];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <label
          style={{
            color: "#64748b",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}
        >
          Ubicación *
        </label>
        <button
          onClick={() => setModoManual((m) => !m)}
          style={{
            background: "none",
            border: "none",
            color: modoManual ? "#60a5fa" : "#475569",
            fontSize: 11,
            cursor: "pointer",
            textDecoration: "underline",
            padding: 0,
          }}
        >
          {modoManual ? "← Usar GPS" : "Escribir manualmente"}
        </button>
      </div>
      {!modoManual && (
        <button
          onClick={obtenerUbicacion}
          disabled={estadoGps === "cargando"}
          style={{
            background: c.bg,
            border: `1px solid ${c.border}`,
            borderRadius: 8,
            color: c.color,
            padding: "14px 16px",
            fontSize: 15,
            fontWeight: 600,
            cursor: estadoGps === "cargando" ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            touchAction: "manipulation",
          }}
        >
          <span style={{ fontSize: 20 }}>{c.icon}</span>
          {c.texto}
        </button>
      )}
      {lat && lng && (
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: 6,
            padding: "6px 10px",
            fontSize: 11,
            color: "#475569",
            fontFamily: "monospace",
          }}
        >
          {lat.toFixed(5)}, {lng.toFixed(5)} ·{" "}
          <a
            href={`https://maps.google.com/?q=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#60a5fa", textDecoration: "none" }}
          >
            Ver en mapa ↗
          </a>
        </div>
      )}
      {(modoManual || estadoGps === "error") && (
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: 8,
            padding: 12,
          }}
        >
          <p style={{ color: "#475569", fontSize: 12, margin: "0 0 10px" }}>
            💡 Abre Google Maps → mantén presionada tu ubicación → copia los
            números.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <label style={{ color: "#475569", fontSize: 11 }}>Latitud</label>
              <input
                type="number"
                placeholder="ej. 10.491"
                value={latManual}
                onChange={(e) => setLatManual(e.target.value)}
                style={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: 6,
                  color: "#e2e8f0",
                  padding: "10px",
                  fontSize: 15,
                  outline: "none",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <label style={{ color: "#475569", fontSize: 11 }}>Longitud</label>
              <input
                type="number"
                placeholder="ej. -66.902"
                value={lngManual}
                onChange={(e) => setLngManual(e.target.value)}
                style={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: 6,
                  color: "#e2e8f0",
                  padding: "10px",
                  fontSize: 15,
                  outline: "none",
                }}
              />
            </div>
            <button
              onClick={aplicarManual}
              style={{
                background: "#1e40af",
                border: "none",
                borderRadius: 8,
                color: "#bfdbfe",
                padding: "12px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                touchAction: "manipulation",
              }}
            >
              Confirmar ubicación
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MapaCanvas({ equipos, solicitudes, onSeleccionar, viewBox }) {
  const { minLat, maxLat, minLng, maxLng } = viewBox;
  const W = 800,
    H = 400;

  function proyectar(lat, lng) {
    return {
      x: ((lng - minLng) / (maxLng - minLng)) * W,
      y: H - ((lat - minLat) / (maxLat - minLat)) * H,
    };
  }

  const ciudades = [
    { nombre: "La Guaira", lat: 10.601, lng: -66.934 },
    { nombre: "Caracas", lat: 10.48, lng: -66.903 },
    { nombre: "Los Teques", lat: 10.347, lng: -67.039 },
    { nombre: "Guarenas", lat: 10.467, lng: -66.536 },
  ];

  return (
    <div
      style={{
        position: "relative",
        background: "#0a0f1e",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #1e293b",
      }}
    >
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#1a2744"
              strokeWidth="0.5"
            />
          </pattern>
          <radialGradient id="glow-red" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="#0a0f1e" />
        <rect width={W} height={H} fill="url(#grid)" />

        {/* Coastline */}
        <path
          d="M 0 88 Q 150 68 310 72 Q 420 70 500 80 Q 650 85 800 75"
          fill="none"
          stroke="#1e3a5f"
          strokeWidth="2"
          strokeDasharray="6 3"
          opacity="0.7"
        />
        <text
          x="12"
          y="60"
          fill="#1e3a5f"
          fontSize="11"
          opacity="0.8"
          fontStyle="italic"
        >
          Mar Caribe
        </text>

        {/* City reference dots */}
        {ciudades.map((c) => {
          const p = proyectar(c.lat, c.lng);
          return (
            <g key={c.nombre}>
              <circle cx={p.x} cy={p.y} r={3} fill="#334155" />
              <text x={p.x + 6} y={p.y + 4} fill="#475569" fontSize="9">
                {c.nombre}
              </text>
            </g>
          );
        })}

        {/* Request triangles */}
        {solicitudes.map((sol) => {
          const p = proyectar(sol.lat, sol.lng);
          const color = COLOR_URGENCIA[sol.urgency] || "#fbbf24";
          return (
            <g
              key={sol.id}
              onClick={() => onSeleccionar({ ...sol, _tipo: "solicitud" })}
              style={{ cursor: "pointer" }}
            >
              {sol.urgency === 3 && (
                <circle cx={p.x} cy={p.y - 5} r={20} fill="url(#glow-red)" />
              )}
              <polygon
                points={`${p.x},${p.y - 18} ${p.x + 15},${p.y + 10} ${
                  p.x - 15
                },${p.y + 10}`}
                fill={color}
                stroke="#0a0f1e"
                strokeWidth="1"
                opacity={0.92}
              />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fontSize="10"
                fill="#0a0f1e"
                fontWeight="bold"
              >
                !
              </text>
            </g>
          );
        })}

        {/* Equipment circles */}
        {equipos.map((eq) => {
          const p = proyectar(eq.lat, eq.lng);
          const color = COLOR_ESTADO[estadoKey(eq.status)] || "#22c55e";
          return (
            <g
              key={eq.id}
              onClick={() => onSeleccionar({ ...eq, _tipo: "equipo" })}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={14}
                fill={color}
                stroke="#0a0f1e"
                strokeWidth="1"
                opacity={0.92}
              />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fontSize="10"
                fill="#0a0f1e"
              >
                {eq.verified ? "✓" : "?"}
              </text>
            </g>
          );
        })}

        <text x={W - 8} y={H - 6} textAnchor="end" fontSize="9" fill="#1e3a5f">
          Venezuela · Junio 2026
        </text>
      </svg>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: 8,
          background: "rgba(10,15,30,0.95)",
          borderRadius: 8,
          padding: "6px 10px",
          border: "1px solid #1e293b",
        }}
      >
        {[
          ["disponible", "Disponible"],
          ["desplegado", "Desplegado"],
          ["no_disponible", "No disp."],
        ].map(([s, label]) => (
          <div
            key={s}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginBottom: 2,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: COLOR_ESTADO[s],
              }}
            />
            <span style={{ color: "#94a3b8", fontSize: 9 }}>{label}</span>
          </div>
        ))}
        {[
          [3, "Crítica"],
          [2, "Alta"],
          [1, "Moderada"],
        ].map(([u, label]) => (
          <div
            key={u}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginBottom: 2,
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderBottom: `7px solid ${COLOR_URGENCIA[u]}`,
              }}
            />
            <span style={{ color: "#94a3b8", fontSize: 9 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BottomSheet({ item, onClose }) {
  if (!item) return null;
  const esEquipo = item._tipo === "equipo";
  const esSolicitud = item._tipo === "solicitud";
  const estadoK = estadoKey(item.status || "available");
  const telefono = esEquipo ? item.owner_phone : item.contact_phone;
  const waLink = `https://wa.me/${(telefono || "").replace(/\D/g, "")}`;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 200,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 201,
          background: "#0f172a",
          borderRadius: "20px 20px 0 0",
          border: "1px solid #1e293b",
          padding: "0 0 48px",
          animation: "slideUp 0.25s ease-out",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 8px",
          }}
        >
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              background: "#334155",
            }}
          />
        </div>
        <div style={{ padding: "0 20px" }}>
          <div
            style={{
              fontSize: 11,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 8,
            }}
          >
            {esEquipo ? "🚜 Equipo registrado" : "🚨 Solicitud de rescate"}
          </div>
          {esEquipo && (
            <>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#f8fafc",
                  marginBottom: 4,
                }}
              >
                {item.equipment_type}
              </div>
              <div style={{ fontSize: 15, color: "#94a3b8", marginBottom: 12 }}>
                {item.owner_name}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 16,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    background: COLOR_ESTADO[estadoK] + "22",
                    color: COLOR_ESTADO[estadoK],
                    border: `1px solid ${COLOR_ESTADO[estadoK]}44`,
                    borderRadius: 6,
                    padding: "4px 10px",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {LABEL_ESTADO[estadoK]}
                </span>
                <span
                  style={{
                    background: item.verified ? "#22c55e22" : "#f59e0b22",
                    color: item.verified ? "#22c55e" : "#f59e0b",
                    border: `1px solid ${
                      item.verified ? "#22c55e44" : "#f59e0b44"
                    }`,
                    borderRadius: 6,
                    padding: "4px 10px",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {item.verified ? "✓ Verificado" : "Sin verificar"}
                </span>
              </div>
            </>
          )}
          {esSolicitud && (
            <>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#f8fafc",
                  marginBottom: 4,
                }}
              >
                {item.location_name}
              </div>
              <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 4 }}>
                Necesita:{" "}
                <span style={{ color: "#e2e8f0", fontWeight: 600 }}>
                  {item.equipment_needed}
                </span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <span
                  style={{
                    background: COLOR_URGENCIA[item.urgency] + "22",
                    color: COLOR_URGENCIA[item.urgency],
                    border: `1px solid ${COLOR_URGENCIA[item.urgency]}44`,
                    borderRadius: 6,
                    padding: "4px 10px",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Urgencia {LABEL_URGENCIA[item.urgency]}
                </span>
              </div>
            </>
          )}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              width: "100%",
              background: "#16a34a",
              color: "#fff",
              padding: "16px",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              textDecoration: "none",
              touchAction: "manipulation",
              boxSizing: "border-box",
            }}
          >
            📱 Contactar por WhatsApp · {telefono}
          </a>
          <button
            onClick={onClose}
            style={{
              marginTop: 10,
              width: "100%",
              background: "none",
              border: "1px solid #1e293b",
              borderRadius: 12,
              color: "#475569",
              padding: "14px",
              fontSize: 15,
              cursor: "pointer",
              touchAction: "manipulation",
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
}

function Campo({ label, value, onChange, type = "text", opciones, requerido }) {
  const base = {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 8,
    color: "#e2e8f0",
    padding: "12px",
    fontSize: 15,
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label
        style={{
          color: "#64748b",
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
        {requerido && " *"}
      </label>
      {opciones ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={base}
        >
          <option value="">Seleccionar…</option>
          {opciones.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={base}
        />
      )}
    </div>
  );
}

function CampoTelefono({ label, value, onChange, requerido }) {
  const [local, setLocal] = useState("");
  function manejarCambio(e) {
    let v = e.target.value.replace(/[^\d\s]/g, "");
    if (v.startsWith("0")) v = v.slice(1);
    setLocal(v);
    const digits = v.replace(/\s/g, "");
    if (digits.length >= 3)
      onChange(
        `+58 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(
          6,
          10
        )}`.trim()
      );
    else onChange("");
  }
  const valido = value && value.replace(/\D/g, "").length >= 10;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label
        style={{
          color: "#64748b",
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
        {requerido && " *"}
      </label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#1e293b",
          border: `1px solid ${valido ? "#16a34a" : "#334155"}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <span
          style={{
            padding: "12px",
            color: "#60a5fa",
            fontWeight: 700,
            fontSize: 15,
            borderRight: "1px solid #334155",
            whiteSpace: "nowrap",
          }}
        >
          +58
        </span>
        <input
          type="tel"
          value={local}
          onChange={manejarCambio}
          placeholder="414 123 4567"
          style={{
            background: "transparent",
            border: "none",
            color: "#e2e8f0",
            padding: "12px",
            fontSize: 15,
            outline: "none",
            width: "100%",
          }}
        />
      </div>
      {value && (
        <div
          style={{
            fontSize: 11,
            color: valido ? "#4ade80" : "#f59e0b",
            fontFamily: "monospace",
          }}
        >
          {valido ? `✓ Se guardará como: ${value}` : "Número incompleto"}
        </div>
      )}
      <div style={{ fontSize: 11, color: "#334155" }}>
        Operadoras: 0412, 0414, 0416, 0424, 0426
      </div>
    </div>
  );
}

export default function App() {
  const [equipos, setEquipos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [transportes, setTransportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorConexion, setErrorConexion] = useState(false);
  const [bottomSheet, setBottomSheet] = useState(null);
  const [tab, setTab] = useState("solicitar");
  const [enviado, setEnviado] = useState(null);
  const [formEq, setFormEq] = useState({
    owner_name: "",
    owner_phone: "",
    equipment_type: "",
    lat: null,
    lng: null,
  });
  const [formSol, setFormSol] = useState({
    location_name: "",
    lat: null,
    lng: null,
    equipment_needed: "",
    urgency: 3,
    contact_phone: "",
  });
  const [formTrans, setFormTrans] = useState({
    owner_name: "",
    owner_phone: "",
    vehicle_type: "",
    capacity: "",
    lat: null,
    lng: null,
  });

  async function cargarDatos() {
    try {
      const [eqs, sols] = await Promise.all([
        dbGet("equipment"),
        dbGet("requests"),
      ]);
      if (Array.isArray(eqs)) setEquipos(eqs);
      if (Array.isArray(sols)) setSolicitudes(sols);
      setErrorConexion(false);
    } catch (e) {
      setErrorConexion(true);
    } finally {
      setCargando(false);
    }
    try {
      const trans = await dbGet("transport");
      if (Array.isArray(trans)) setTransportes(trans);
    } catch (e) {}
  }

  useEffect(() => {
    cargarDatos();
  }, []);
  useEffect(() => {
    const t = setInterval(cargarDatos, 30000);
    return () => clearInterval(t);
  }, []);

  const stats = {
    disponibles: equipos.filter((e) => e.status === "available").length,
    desplegados: equipos.filter((e) => e.status === "deployed").length,
    abiertas: solicitudes.filter((s) => s.status === "open").length,
    criticas: solicitudes.filter((s) => s.urgency === 3 && s.status === "open")
      .length,
  };

  const viewBox = {
    minLat: 10.25,
    maxLat: 10.7,
    minLng: -67.15,
    maxLng: -66.45,
  };

  async function enviarEquipo() {
    if (
      !formEq.owner_name ||
      !formEq.owner_phone ||
      !formEq.equipment_type ||
      !formEq.lat
    )
      return;
    setEnviado("cargando");
    await dbInsert("equipment", {
      owner_name: formEq.owner_name,
      owner_phone: formEq.owner_phone,
      equipment_type: formEq.equipment_type,
      lat: formEq.lat,
      lng: formEq.lng,
      status: "available",
      verified: false,
    });
    await cargarDatos();
    setEnviado("equipo");
    setFormEq({
      owner_name: "",
      owner_phone: "",
      equipment_type: "",
      lat: null,
      lng: null,
    });
    setTimeout(() => {
      setEnviado(null);
      setTab("mapa");
    }, 2500);
  }

  async function enviarSolicitud() {
    if (
      !formSol.location_name ||
      !formSol.lat ||
      !formSol.equipment_needed ||
      !formSol.contact_phone
    )
      return;
    setEnviado("cargando");
    await dbInsert("requests", {
      location_name: formSol.location_name,
      lat: formSol.lat,
      lng: formSol.lng,
      equipment_needed: formSol.equipment_needed,
      urgency: formSol.urgency,
      contact_phone: formSol.contact_phone,
      status: "open",
    });
    await cargarDatos();
    setEnviado("solicitud");
    setFormSol({
      location_name: "",
      lat: null,
      lng: null,
      equipment_needed: "",
      urgency: 3,
      contact_phone: "",
    });
    setTimeout(() => {
      setEnviado(null);
      setTab("mapa");
    }, 2500);
  }

  async function enviarTransporte() {
    if (
      !formTrans.owner_name ||
      !formTrans.owner_phone ||
      !formTrans.vehicle_type ||
      !formTrans.lat
    )
      return;
    setEnviado("cargando");
    await dbInsert("transport", {
      owner_name: formTrans.owner_name,
      owner_phone: formTrans.owner_phone,
      vehicle_type: formTrans.vehicle_type,
      capacity: formTrans.capacity,
      lat: formTrans.lat,
      lng: formTrans.lng,
      status: "available",
    });
    await cargarDatos();
    setEnviado("transporte");
    setFormTrans({
      owner_name: "",
      owner_phone: "",
      vehicle_type: "",
      capacity: "",
      lat: null,
      lng: null,
    });
    setTimeout(() => {
      setEnviado(null);
      setTab("mapa");
    }, 2500);
  }

  function cercanoDisponible(sol) {
    const candidatos = equipos.filter(
      (e) =>
        e.status === "available" && e.equipment_type === sol.equipment_needed
    );
    if (!candidatos.length) return null;
    return candidatos.reduce((mejor, e) => {
      const d = distanciaKm(sol.lat, sol.lng, e.lat, e.lng);
      return !mejor || d < mejor.dist ? { ...e, dist: d } : mejor;
    }, null);
  }

  const btnStyle = (active, color) => ({
    marginTop: 18,
    width: "100%",
    border: "none",
    borderRadius: 10,
    padding: "16px",
    fontWeight: 700,
    fontSize: 16,
    cursor: active ? "pointer" : "not-allowed",
    touchAction: "manipulation",
    background: active ? color : "#1e293b",
    color: active ? "#fff" : "#475569",
  });

  const TABS = [
    { id: "solicitar", label: "🚨 Necesito equipo" },
    { id: "registrar", label: "🚜 Tengo equipo" },
    { id: "transporte", label: "🚛 Tengo transporte" },
    { id: "mapa", label: "🗺 Mapa" },
  ];

  const formCompleto = (form, campos) => campos.every((c) => form[c]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#e2e8f0",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "12px 12px 80px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#ef4444",
              boxShadow: "0 0 8px #ef4444",
              animation: "pulso 1.5s infinite",
            }}
          />
          <span
            style={{
              color: "#ef4444",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Respuesta activa
          </span>
          {!cargando && (
            <span
              style={{ color: "#334155", fontSize: 10, marginLeft: "auto" }}
            >
              ↻ 30s
            </span>
          )}
        </div>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#f8fafc",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Equipos de Rescate — Venezuela
        </h1>
        <p style={{ color: "#475569", fontSize: 12, margin: "3px 0 0" }}>
          Conecta maquinaria con sitios de rescate · Jun 2026
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 6,
          marginBottom: 14,
        }}
      >
        {[
          { label: "Disp.", value: stats.disponibles, color: "#22c55e" },
          { label: "Desp.", value: stats.desplegados, color: "#f97316" },
          { label: "Solic.", value: stats.abiertas, color: "#60a5fa" },
          { label: "Crít.", value: stats.criticas, color: "#ef4444" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: 10,
              padding: "10px 8px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: s.color,
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {errorConexion && (
        <div
          style={{
            background: "#1c0f0f",
            border: "1px solid #7f1d1d",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 12,
            color: "#fca5a5",
            fontSize: 13,
          }}
        >
          ⚠️ No se pudo conectar. Revisa tu conexión a internet.
        </div>
      )}

      {cargando ? (
        <div style={{ textAlign: "center", padding: 60, color: "#475569" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
          <div style={{ fontSize: 14 }}>Cargando datos en tiempo real…</div>
        </div>
      ) : (
        <>
          {/* SOLICITAR */}
          {tab === "solicitar" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {enviado === "solicitud" ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 48,
                    background: "#0f172a",
                    borderRadius: 12,
                    border: "1px solid #1e293b",
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🚨</div>
                  <div
                    style={{ color: "#f97316", fontWeight: 700, fontSize: 18 }}
                  >
                    Solicitud enviada
                  </div>
                  <div style={{ color: "#475569", fontSize: 13, marginTop: 6 }}>
                    Los coordinadores están siendo notificados.
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <h2
                    style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}
                  >
                    🚨 Necesito equipo de rescate
                  </h2>
                  <p
                    style={{
                      color: "#475569",
                      fontSize: 13,
                      margin: "0 0 16px",
                    }}
                  >
                    Registra qué necesitas y alguien te contactará.
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    <Campo
                      label="Nombre del lugar"
                      value={formSol.location_name}
                      onChange={(v) =>
                        setFormSol((f) => ({ ...f, location_name: v }))
                      }
                      requerido
                    />
                    <BotonUbicacion
                      lat={formSol.lat}
                      lng={formSol.lng}
                      onUbicacion={(lat, lng) =>
                        setFormSol((f) => ({ ...f, lat, lng }))
                      }
                    />
                    <Campo
                      label="Equipo necesario"
                      value={formSol.equipment_needed}
                      onChange={(v) =>
                        setFormSol((f) => ({ ...f, equipment_needed: v }))
                      }
                      opciones={TIPOS_EQUIPO}
                      requerido
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      <label
                        style={{
                          color: "#64748b",
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                        }}
                      >
                        Urgencia *
                      </label>
                      <div style={{ display: "flex", gap: 8 }}>
                        {[1, 2, 3].map((u) => (
                          <button
                            key={u}
                            onClick={() =>
                              setFormSol((f) => ({ ...f, urgency: u }))
                            }
                            style={{
                              flex: 1,
                              padding: "12px 6px",
                              borderRadius: 8,
                              border: `2px solid ${
                                formSol.urgency === u
                                  ? COLOR_URGENCIA[u]
                                  : "#1e293b"
                              }`,
                              background:
                                formSol.urgency === u
                                  ? COLOR_URGENCIA[u] + "22"
                                  : "#1e293b",
                              color:
                                formSol.urgency === u
                                  ? COLOR_URGENCIA[u]
                                  : "#475569",
                              fontWeight: 700,
                              fontSize: 13,
                              cursor: "pointer",
                              touchAction: "manipulation",
                            }}
                          >
                            {LABEL_URGENCIA[u]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <CampoTelefono
                      label="Tu teléfono / WhatsApp"
                      value={formSol.contact_phone}
                      onChange={(v) =>
                        setFormSol((f) => ({ ...f, contact_phone: v }))
                      }
                      requerido
                    />
                  </div>
                  <button
                    onClick={enviarSolicitud}
                    disabled={
                      enviado === "cargando" ||
                      !formCompleto(formSol, [
                        "location_name",
                        "lat",
                        "equipment_needed",
                        "contact_phone",
                      ])
                    }
                    style={btnStyle(
                      formCompleto(formSol, [
                        "location_name",
                        "lat",
                        "equipment_needed",
                        "contact_phone",
                      ]),
                      "#b91c1c"
                    )}
                  >
                    {enviado === "cargando"
                      ? "Enviando…"
                      : "Enviar solicitud de rescate"}
                  </button>
                </div>
              )}
              {solicitudes.filter((s) => s.status === "open").length > 0 && (
                <div
                  style={{
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#475569",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: 10,
                    }}
                  >
                    Solicitudes activas
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {solicitudes
                      .filter((s) => s.status === "open")
                      .sort((a, b) => b.urgency - a.urgency)
                      .map((s) => {
                        const match = cercanoDisponible(s);
                        return (
                          <div
                            key={s.id}
                            style={{
                              padding: "12px",
                              borderRadius: 8,
                              background: "#020617",
                              border: `1px solid ${
                                COLOR_URGENCIA[s.urgency]
                              }44`,
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: 14,
                                marginBottom: 4,
                              }}
                            >
                              {s.location_name}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: match ? 8 : 0,
                              }}
                            >
                              <span style={{ fontSize: 12, color: "#64748b" }}>
                                {s.equipment_needed}
                              </span>
                              <span
                                style={{
                                  background: COLOR_URGENCIA[s.urgency] + "22",
                                  color: COLOR_URGENCIA[s.urgency],
                                  border: `1px solid ${
                                    COLOR_URGENCIA[s.urgency]
                                  }44`,
                                  borderRadius: 4,
                                  padding: "2px 8px",
                                  fontSize: 12,
                                  fontWeight: 600,
                                }}
                              >
                                {LABEL_URGENCIA[s.urgency]}
                              </span>
                            </div>
                            {match && (
                              <div
                                style={{
                                  background: "#052e16",
                                  border: "1px solid #166534",
                                  borderRadius: 6,
                                  padding: "8px 10px",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "#4ade80",
                                    fontWeight: 700,
                                    marginBottom: 2,
                                  }}
                                >
                                  EQUIPO MÁS CERCANO
                                </div>
                                <div style={{ fontSize: 13 }}>
                                  {match.owner_name} · {match.dist.toFixed(1)}{" "}
                                  km
                                </div>
                                <a
                                  href={`https://wa.me/${match.owner_phone.replace(
                                    /\D/g,
                                    ""
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: "inline-block",
                                    marginTop: 6,
                                    background: "#16a34a",
                                    color: "#fff",
                                    padding: "6px 12px",
                                    borderRadius: 6,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    textDecoration: "none",
                                  }}
                                >
                                  📱 Contactar por WhatsApp
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* REGISTRAR EQUIPO */}
          {tab === "registrar" && (
            <div
              style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: 12,
                padding: 16,
              }}
            >
              {enviado === "equipo" ? (
                <div style={{ textAlign: "center", padding: 48 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <div
                    style={{ color: "#22c55e", fontWeight: 700, fontSize: 18 }}
                  >
                    Equipo registrado
                  </div>
                  <div style={{ color: "#475569", fontSize: 13, marginTop: 6 }}>
                    Un coordinador se comunicará contigo directamente.
                  </div>
                </div>
              ) : (
                <>
                  <h2
                    style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}
                  >
                    🚜 Tengo equipo disponible
                  </h2>
                  <p
                    style={{
                      color: "#475569",
                      fontSize: 13,
                      margin: "0 0 16px",
                    }}
                  >
                    Registra tu máquina y aparecerás en el mapa.
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    <Campo
                      label="Tu nombre"
                      value={formEq.owner_name}
                      onChange={(v) =>
                        setFormEq((f) => ({ ...f, owner_name: v }))
                      }
                      requerido
                    />
                    <CampoTelefono
                      label="Tu teléfono / WhatsApp"
                      value={formEq.owner_phone}
                      onChange={(v) =>
                        setFormEq((f) => ({ ...f, owner_phone: v }))
                      }
                      requerido
                    />
                    <Campo
                      label="Tipo de equipo"
                      value={formEq.equipment_type}
                      onChange={(v) =>
                        setFormEq((f) => ({ ...f, equipment_type: v }))
                      }
                      opciones={TIPOS_EQUIPO}
                      requerido
                    />
                    <BotonUbicacion
                      lat={formEq.lat}
                      lng={formEq.lng}
                      onUbicacion={(lat, lng) =>
                        setFormEq((f) => ({ ...f, lat, lng }))
                      }
                    />
                  </div>
                  <button
                    onClick={enviarEquipo}
                    disabled={
                      enviado === "cargando" ||
                      !formCompleto(formEq, [
                        "owner_name",
                        "owner_phone",
                        "equipment_type",
                        "lat",
                      ])
                    }
                    style={btnStyle(
                      formCompleto(formEq, [
                        "owner_name",
                        "owner_phone",
                        "equipment_type",
                        "lat",
                      ]),
                      "#16a34a"
                    )}
                  >
                    {enviado === "cargando" ? "Guardando…" : "Agregar al mapa"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* REGISTRAR TRANSPORTE */}
          {tab === "transporte" && (
            <div
              style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: 12,
                padding: 16,
              }}
            >
              {enviado === "transporte" ? (
                <div style={{ textAlign: "center", padding: 48 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <div
                    style={{ color: "#22c55e", fontWeight: 700, fontSize: 18 }}
                  >
                    Transporte registrado
                  </div>
                  <div style={{ color: "#475569", fontSize: 13, marginTop: 6 }}>
                    Un coordinador te contactará para coordinar el traslado.
                  </div>
                </div>
              ) : (
                <>
                  <h2
                    style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}
                  >
                    🚛 Tengo transporte disponible
                  </h2>
                  <p
                    style={{
                      color: "#475569",
                      fontSize: 13,
                      margin: "0 0 16px",
                    }}
                  >
                    ¿Tienes camión de plataforma u otro vehículo para mover
                    maquinaria? Regístrate aquí.
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    <Campo
                      label="Tu nombre"
                      value={formTrans.owner_name}
                      onChange={(v) =>
                        setFormTrans((f) => ({ ...f, owner_name: v }))
                      }
                      requerido
                    />
                    <CampoTelefono
                      label="Tu teléfono / WhatsApp"
                      value={formTrans.owner_phone}
                      onChange={(v) =>
                        setFormTrans((f) => ({ ...f, owner_phone: v }))
                      }
                      requerido
                    />
                    <Campo
                      label="Tipo de vehículo"
                      value={formTrans.vehicle_type}
                      onChange={(v) =>
                        setFormTrans((f) => ({ ...f, vehicle_type: v }))
                      }
                      opciones={TIPOS_TRANSPORTE}
                      requerido
                    />
                    <Campo
                      label="Capacidad (toneladas)"
                      value={formTrans.capacity}
                      onChange={(v) =>
                        setFormTrans((f) => ({ ...f, capacity: v }))
                      }
                    />
                    <BotonUbicacion
                      lat={formTrans.lat}
                      lng={formTrans.lng}
                      onUbicacion={(lat, lng) =>
                        setFormTrans((f) => ({ ...f, lat, lng }))
                      }
                    />
                  </div>
                  <button
                    onClick={enviarTransporte}
                    disabled={
                      enviado === "cargando" ||
                      !formCompleto(formTrans, [
                        "owner_name",
                        "owner_phone",
                        "vehicle_type",
                        "lat",
                      ])
                    }
                    style={btnStyle(
                      formCompleto(formTrans, [
                        "owner_name",
                        "owner_phone",
                        "vehicle_type",
                        "lat",
                      ]),
                      "#1e40af"
                    )}
                  >
                    {enviado === "cargando"
                      ? "Guardando…"
                      : "Registrar transporte"}
                  </button>
                  {transportes.filter((t) => t.status === "available").length >
                    0 && (
                    <div style={{ marginTop: 16 }}>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#475569",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          marginBottom: 10,
                        }}
                      >
                        Transportes disponibles
                      </div>
                      {transportes
                        .filter((t) => t.status === "available")
                        .map((t) => (
                          <div
                            key={t.id}
                            style={{
                              padding: "12px",
                              borderRadius: 8,
                              background: "#020617",
                              border: "1px solid #1e40af44",
                              marginBottom: 8,
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: 14,
                                marginBottom: 3,
                              }}
                            >
                              {t.vehicle_type}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#64748b",
                                marginBottom: 8,
                              }}
                            >
                              {t.owner_name}
                              {t.capacity ? ` · ${t.capacity}t` : ""}
                            </div>
                            <a
                              href={`https://wa.me/${t.owner_phone.replace(
                                /\D/g,
                                ""
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-block",
                                background: "#16a34a",
                                color: "#fff",
                                padding: "6px 12px",
                                borderRadius: 6,
                                fontSize: 13,
                                fontWeight: 600,
                                textDecoration: "none",
                              }}
                            >
                              📱 Contactar por WhatsApp
                            </a>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* MAPA */}
          {tab === "mapa" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <MapaCanvas
                equipos={equipos}
                solicitudes={solicitudes}
                onSeleccionar={setBottomSheet}
                viewBox={viewBox}
              />
              <p style={{ color: "#334155", fontSize: 11, margin: 0 }}>
                Toca un marcador para ver detalles y contactar por WhatsApp.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div
                  style={{
                    fontSize: 12,
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Solicitudes abiertas
                </div>
                {solicitudes.filter((s) => s.status === "open").length === 0 ? (
                  <div style={{ color: "#334155", fontSize: 13 }}>
                    Sin solicitudes activas
                  </div>
                ) : (
                  solicitudes
                    .filter((s) => s.status === "open")
                    .sort((a, b) => b.urgency - a.urgency)
                    .map((s) => (
                      <div
                        key={s.id}
                        onClick={() =>
                          setBottomSheet({ ...s, _tipo: "solicitud" })
                        }
                        style={{
                          padding: "12px",
                          borderRadius: 8,
                          background: "#0f172a",
                          border: `1px solid ${COLOR_URGENCIA[s.urgency]}44`,
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            marginBottom: 3,
                          }}
                        >
                          {s.location_name}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ fontSize: 12, color: "#64748b" }}>
                            {s.equipment_needed}
                          </span>
                          <span
                            style={{
                              background: COLOR_URGENCIA[s.urgency] + "22",
                              color: COLOR_URGENCIA[s.urgency],
                              border: `1px solid ${
                                COLOR_URGENCIA[s.urgency]
                              }44`,
                              borderRadius: 4,
                              padding: "2px 8px",
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {LABEL_URGENCIA[s.urgency]}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Bottom sheet */}
      <BottomSheet item={bottomSheet} onClose={() => setBottomSheet(null)} />

      {/* Bottom nav */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#0f172a",
          borderTop: "1px solid #1e293b",
          display: "flex",
          zIndex: 100,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: "14px 2px 18px",
              border: "none",
              background: "none",
              color: tab === t.id ? "#60a5fa" : "#475569",
              fontSize: 11,
              fontWeight: tab === t.id ? 700 : 400,
              cursor: "pointer",
              touchAction: "manipulation",
              borderTop: `2px solid ${
                tab === t.id ? "#60a5fa" : "transparent"
              }`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes pulso { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}
