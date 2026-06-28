import { useState } from "react";

// PDF generation using jsPDF (loaded from CDN dynamically)
async function generarPDF(form: FormData, veredicto: string) {
  // Load jsPDF dynamically
  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  document.head.appendChild(script);
  await new Promise(resolve => script.onload = resolve);

  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210, M = 15;
  let y = 15;

  const veredictoColors: Record<string, number[]> = {
    "Habitable": [34, 197, 94],
    "Precaucion": [251, 191, 36],
    "Acceso Restringido": [249, 115, 22],
    "Inhabitable": [239, 68, 68]
  };
  const veredictoLabels: Record<string, string> = {
    "Habitable": "HABITABLE",
    "Precaucion": "PRECAUCION",
    "Acceso Restringido": "ACCESO RESTRINGIDO",
    "Inhabitable": "INHABITABLE"
  };

  const color = veredictoColors[veredicto] || [100, 100, 100];
  const fecha = new Date().toLocaleDateString("es-VE");

  // Header
  doc.setFillColor(0, 68, 136);
  doc.rect(0, 0, W, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("HOJA DE INSPECCION TECNICA", W / 2, 10, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Brigada de Inspeccion Tecnica Estructural - UCV (BITE-UCV)", W / 2, 15, { align: "center" });
  y = 30;

  // Veredicto box
  doc.setFillColor(color[0], color[1], color[2]);
  doc.rect(M, y, W - M * 2, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`DIAGNOSTICO: ${veredictoLabels[veredicto] || veredicto.toUpperCase()}`, W / 2, y + 8, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const msgs: Record<string, string> = {
    "Habitable": "Estructura con desempeno elastico adecuado. Inmueble seguro.",
    "Precaucion": "Danos en mamposterua. Precaucion ante caida de objetos.",
    "Acceso Restringido": "Riesgo estructural moderado. Solo personal autorizado.",
    "Inhabitable": "Falla estructural severa. EVACUACION OBLIGATORIA."
  };
  doc.text(msgs[veredicto] || "", W / 2, y + 14, { align: "center" });
  y += 24;

  // Section helper
  const section = (title: string) => {
    doc.setFillColor(224, 231, 237);
    doc.rect(M, y, W - M * 2, 6, "F");
    doc.setTextColor(0, 68, 136);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(title, M + 2, y + 4);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    y += 8;
  };

  const field = (label: string, value: string, x: number, fieldW: number) => {
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(label + ":", x, y);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.text(value || "-", x, y + 4);
    doc.setDrawColor(200, 200, 200);
    doc.line(x, y + 5, x + fieldW - 2, y + 5);
  };

  const checkbox = (label: string, checked: boolean) => {
    doc.setDrawColor(100, 100, 100);
    doc.rect(M, y, 3.5, 3.5);
    if (checked) {
      doc.setTextColor(0, 68, 136);
      doc.setFontSize(8);
      doc.text("v", M + 0.5, y + 3);
    }
    doc.setTextColor(checked ? 0 : 100, checked ? 68 : 100, checked ? 136 : 100);
    doc.setFontSize(8);
    doc.setFont("helvetica", checked ? "bold" : "normal");
    doc.text(label, M + 5, y + 3);
    doc.setFont("helvetica", "normal");
    y += 6;
  };

  // 1. IDENTIFICACION
  section("1. IDENTIFICACION Y UBICACION");
  const col = (W - M * 2) / 3;
  field("Inspector", form.inspector, M, col);
  field("Tipo", form.tipo_edificacion, M + col, col);
  field("Nombre/Apellido", form.nombre_habitante, M + col * 2, col);
  y += 8;
  field("C.I.", form.cedula, M, col);
  field("Telefono", form.telefono_contacto, M + col, col);
  field("Condicion", form.condicion_habitante, M + col * 2, col);
  y += 8;
  field("Esquina", form.esquina, M, col);
  field("Calle", form.calle, M + col, col);
  field("Avenida", form.avenida, M + col * 2, col);
  y += 8;
  field("Urbanizacion", form.urbanizacion, M, col);
  field("Parroquia", form.parroquia, M + col, col);
  field("Consejo Comunal", form.consejo_comunal, M + col * 2, col);
  y += 8;
  field("Municipio", form.municipio, M, col);
  field("Ciudad", form.ciudad, M + col, col);
  field("Estado", form.estado, M + col * 2, col);
  y += 10;

  // GPS
  if (form.lat && form.lng) {
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text("Coordenadas GPS:", M, y);
    doc.setTextColor(0, 68, 136);
    doc.setFontSize(8);
    doc.text(`Lat: ${form.lat.toFixed(6)}  Lng: ${form.lng.toFixed(6)}`, M + 35, y);
    y += 5;
  }
  y += 2;

  // 2. FUNDACIONES
  section("2. FUNDACIONES Y SUELO");
  const half = (W - M * 2) / 2;
  const savedY = y;
  checkbox("Asentamiento Diferencial", form.asentamiento_diferencial);
  const leftH = y;
  y = savedY;
  const origX = M;
  // right column
  doc.setDrawColor(100, 100, 100);
  doc.rect(M + half, savedY, 3.5, 3.5);
  if (form.socavacion_zapatas) { doc.setTextColor(0,68,136); doc.text("v", M + half + 0.5, savedY + 3); }
  doc.setTextColor(form.socavacion_zapatas ? 0 : 100, form.socavacion_zapatas ? 68 : 100, form.socavacion_zapatas ? 136 : 100);
  doc.setFont("helvetica", form.socavacion_zapatas ? "bold" : "normal");
  doc.text("Socavacion / Exposicion de Zapatas", M + half + 5, savedY + 3);
  doc.setFont("helvetica", "normal");
  y = Math.max(leftH, savedY + 6);
  y += 2;

  // 3. SISTEMA ESTRUCTURAL
  section("3. SISTEMA ESTRUCTURAL (COLUMNAS, VIGAS, NODOS)");
  const s3Y = y;
  checkbox("Columna: Falla por Corte", form.columna_falla_corte);
  const s3mid = y;
  y = s3Y;
  doc.rect(M + half, s3Y, 3.5, 3.5);
  if (form.columna_pandeo_acero) { doc.setTextColor(0,68,136); doc.text("v", M+half+0.5, s3Y+3); }
  doc.setTextColor(form.columna_pandeo_acero?0:100, form.columna_pandeo_acero?68:100, form.columna_pandeo_acero?136:100);
  doc.setFont("helvetica", form.columna_pandeo_acero?"bold":"normal");
  doc.text("Columna: Pandeo de Acero", M+half+5, s3Y+3);
  doc.setFont("helvetica","normal"); doc.setTextColor(0,0,0);
  y = Math.max(s3mid, s3Y+6);
  const s3bY = y;
  checkbox("Viga: Falla en Nodos/Extremos", form.viga_falla_nodos);
  const s3bend = y;
  y = s3bY;
  doc.rect(M+half, s3bY, 3.5, 3.5);
  if (form.viga_flexion_centro) { doc.setTextColor(0,68,136); doc.text("v", M+half+0.5, s3bY+3); }
  doc.setTextColor(form.viga_flexion_centro?0:100, form.viga_flexion_centro?68:100, form.viga_flexion_centro?136:100);
  doc.setFont("helvetica", form.viga_flexion_centro?"bold":"normal");
  doc.text("Viga: Flexion (Centro)", M+half+5, s3bY+3);
  doc.setFont("helvetica","normal"); doc.setTextColor(0,0,0);
  y = Math.max(s3bend, s3bY+6) + 2;

  // 4. MAMPOSTERIA
  section("4. ANALISIS PATOLOGICO DE MAMPOSTERUA");
  field("Morfologia de grieta", form.morfologia_grieta, M, half);
  field("Ancho grieta (mm)", form.ancho_grieta_mm || "0", M + half, half / 2);
  y += 8;
  field("Tipo de muro", form.tipo_muro, M, half);
  const despY = y;
  doc.rect(M + half, despY - 8, 3.5, 3.5);
  if (form.desprendimiento_friso) { doc.setTextColor(0,68,136); doc.text("v", M+half+0.5, despY-5); }
  doc.setTextColor(form.desprendimiento_friso?0:100, form.desprendimiento_friso?68:100, form.desprendimiento_friso?136:100);
  doc.setFont("helvetica", form.desprendimiento_friso?"bold":"normal");
  doc.text("Desprendimiento de friso", M+half+5, despY-5);
  doc.setFont("helvetica","normal"); doc.setTextColor(0,0,0);
  y += 4;

  // 5. SERVICIOS
  section("5. ELECTROMECANICA, ESCALERAS Y SERVICIOS");
  const s5Y = y;
  checkbox("Reservorios / Tanques", form.reservorios_grietas);
  const s5mid = y; y = s5Y;
  doc.rect(M+half, s5Y, 3.5, 3.5);
  if (form.ascensores_bloqueados) { doc.setTextColor(0,68,136); doc.text("v", M+half+0.5, s5Y+3); }
  doc.setTextColor(form.ascensores_bloqueados?0:100, form.ascensores_bloqueados?68:100, form.ascensores_bloqueados?136:100);
  doc.setFont("helvetica", form.ascensores_bloqueados?"bold":"normal");
  doc.text("Ascensores / Elevadores", M+half+5, s5Y+3);
  doc.setFont("helvetica","normal"); doc.setTextColor(0,0,0);
  y = Math.max(s5mid, s5Y+6);
  const s5bY = y;
  checkbox("Riesgo Electrico / Canalizaciones", form.riesgo_electrico);
  const s5bend = y; y = s5bY;
  doc.rect(M+half, s5bY, 3.5, 3.5);
  if (form.falla_aduccion) { doc.setTextColor(0,68,136); doc.text("v", M+half+0.5, s5bY+3); }
  doc.setTextColor(form.falla_aduccion?0:100, form.falla_aduccion?68:100, form.falla_aduccion?136:100);
  doc.setFont("helvetica", form.falla_aduccion?"bold":"normal");
  doc.text("Falla Aduccion (Ruptura/Fuga)", M+half+5, s5bY+3);
  doc.setFont("helvetica","normal"); doc.setTextColor(0,0,0);
  y = Math.max(s5bend, s5bY+6);
  field("Escaleras", form.escaleras_estado, M, W - M * 2);
  y += 8;

  // 6. FACHADAS
  section("6. EVALUACION POR FACHADAS");
  const fachadaColor = (v: string) => {
    if (v === "Sin dano" || v === "Sin dano") return [34,197,94];
    if (v === "Fisuras leve") return [251,191,36];
    if (v === "Grietas moderadas") return [249,115,22];
    if (v === "Dano severo") return [239,68,68];
    return [150,150,150];
  };
  const fachadas = [
    { label: "Norte", value: form.fachada_norte },
    { label: "Sur", value: form.fachada_sur },
    { label: "Este", value: form.fachada_este },
    { label: "Oeste", value: form.fachada_oeste },
  ];
  const fW = (W - M * 2) / 4;
  fachadas.forEach((f, i) => {
    const fc = fachadaColor(f.value);
    doc.setFillColor(fc[0], fc[1], fc[2]);
    doc.rect(M + i * fW, y, fW - 1, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(f.label, M + i * fW + fW / 2, y + 3.5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text(f.value || "No evaluado", M + i * fW + fW / 2, y + 7, { align: "center" });
  });
  doc.setTextColor(0, 0, 0);
  y += 12;

  // Observaciones
  if (form.observaciones) {
    section("OBSERVACIONES DEL INSPECTOR");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    const lines = doc.splitTextToSize(form.observaciones, W - M * 2);
    doc.text(lines, M, y);
    y += lines.length * 4 + 4;
  }

  // Footer
  y = Math.max(y, 260);
  doc.setDrawColor(0, 68, 136);
  doc.line(M, y, W - M, y);
  y += 4;
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(`Fecha de inspeccion: ${fecha}`, M, y);
  doc.text("BITE-UCV | Paula Lima — Infraestructura de datos", W - M, y, { align: "right" });

  // Save
  const filename = `inspeccion_${(form.urbanizacion || form.calle || "edificio").replace(/\s/g, "_")}_${fecha.replace(/\//g, "-")}.pdf`;
  doc.save(filename);
}


const SUPABASE_URL = "https://beguduormupycmwkfagg.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZ3VkdW9ybXVweWNtd2tmYWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1ODE2NDQsImV4cCI6MjA5ODE1NzY0NH0.81thnXTxZGkMbXwRqzx4_2kLOJqVOnsmXQCz9wTV5oo";
const HEADERS = { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, "Content-Type": "application/json" };

async function dbInsert(data: object) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/inspecciones`, {
    method: "POST", headers: { ...HEADERS, Prefer: "return=representation" }, body: JSON.stringify(data)
  });
  return r.json();
}

async function dbGet() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/inspecciones?select=*&order=creado_en.desc`, { headers: HEADERS });
  return r.json();
}

function toUTM(lat: number, lng: number) {
  const a = 6378137.0, f = 1 / 298.257223563;
  const b = a * (1 - f), e2 = 1 - (b * b) / (a * a);
  const k0 = 0.9996, lng0 = -63;
  const latR = (lat * Math.PI) / 180, lngR = (lng * Math.PI) / 180, lng0R = (lng0 * Math.PI) / 180;
  const N = a / Math.sqrt(1 - e2 * Math.sin(latR) ** 2);
  const T = Math.tan(latR) ** 2, C = (e2 / (1 - e2)) * Math.cos(latR) ** 2;
  const A = Math.cos(latR) * (lngR - lng0R);
  const e4 = e2 * e2, e6 = e4 * e2;
  const M = a * ((1 - e2 / 4 - (3 * e4) / 64 - (5 * e6) / 256) * latR
    - ((3 * e2) / 8 + (3 * e4) / 32 + (45 * e6) / 1024) * Math.sin(2 * latR)
    + ((15 * e4) / 256 + (45 * e6) / 1024) * Math.sin(4 * latR)
    - ((35 * e6) / 3072) * Math.sin(6 * latR));
  const x = k0 * N * (A + ((1 - T + C) * A ** 3) / 6 + ((5 - 18 * T + T * T + 72 * C - 58) * A ** 5) / 120) + 500000;
  const y = k0 * (M + N * Math.tan(latR) * (A ** 2 / 2 + ((5 - T + 9 * C + 4 * C * C) * A ** 4) / 24 + ((61 - 58 * T + T * T + 600 * C - 330) * A ** 6) / 720));
  return { este: Math.round(x), norte: Math.round(y < 0 ? y + 10000000 : y) };
}

type FormData = {
  inspector: string; tipo_edificacion: string; nombre_habitante: string; cedula: string;
  telefono_contacto: string; condicion_habitante: string; esquina: string; calle: string;
  avenida: string; urbanizacion: string; parroquia: string; consejo_comunal: string;
  municipio: string; ciudad: string; estado: string; lat: number | null; lng: number | null;
  asentamiento_diferencial: boolean; socavacion_zapatas: boolean;
  columna_falla_corte: boolean; columna_pandeo_acero: boolean;
  viga_falla_nodos: boolean; viga_flexion_centro: boolean;
  morfologia_grieta: string; ancho_grieta_mm: string; tipo_muro: string; desprendimiento_friso: boolean;
  reservorios_grietas: boolean; ascensores_bloqueados: boolean; riesgo_electrico: boolean;
  falla_aduccion: boolean; escaleras_estado: string;
  fachada_norte: string; fachada_sur: string; fachada_este: string; fachada_oeste: string;
  veredicto: string; observaciones: string;
};

const EMPTY_FORM: FormData = {
  inspector: "", tipo_edificacion: "", nombre_habitante: "", cedula: "",
  telefono_contacto: "", condicion_habitante: "", esquina: "", calle: "",
  avenida: "", urbanizacion: "", parroquia: "", consejo_comunal: "",
  municipio: "", ciudad: "", estado: "", lat: null, lng: null,
  asentamiento_diferencial: false, socavacion_zapatas: false,
  columna_falla_corte: false, columna_pandeo_acero: false,
  viga_falla_nodos: false, viga_flexion_centro: false,
  morfologia_grieta: "", ancho_grieta_mm: "", tipo_muro: "", desprendimiento_friso: false,
  reservorios_grietas: false, ascensores_bloqueados: false, riesgo_electrico: false,
  falla_aduccion: false, escaleras_estado: "",
  fachada_norte: "", fachada_sur: "", fachada_este: "", fachada_oeste: "",
  veredicto: "", observaciones: ""
};

function calcularVeredicto(form: FormData): string {
  const ancho = parseFloat(form.ancho_grieta_mm) || 0;
  const morf = form.morfologia_grieta;
  const tipoMuro = form.tipo_muro;
  const fachadaSevera = [form.fachada_norte, form.fachada_sur, form.fachada_este, form.fachada_oeste].includes("Daño severo");
  const mampCritica = morf === "Patron en X (Corte Severo)" ||
    (morf === "Diagonal 45 (Corte/Sismo)" && ancho > 3) ||
    (tipoMuro === "Muro de Carga / Estructural" && ancho > 2);
  if (form.columna_pandeo_acero || form.columna_falla_corte || form.socavacion_zapatas ||
    form.asentamiento_diferencial || form.escaleras_estado === "Dano severo (Falla en apoyos/Inservible)") return "Inhabitable";
  if (form.viga_falla_nodos || form.viga_flexion_centro || mampCritica || fachadaSevera ||
    form.escaleras_estado === "Dano moderado (Desalineacion leve)") return "Acceso Restringido";
  if (form.desprendimiento_friso || ancho > 1) return "Precaucion";
  return "Habitable";
}

const VC: Record<string, string> = { "Habitable": "#22c55e", "Precaucion": "#fbbf24", "Acceso Restringido": "#f97316", "Inhabitable": "#ef4444" };
const VI: Record<string, string> = { "Habitable": "Habitable", "Precaucion": "Precaución", "Acceso Restringido": "Acceso Restringido", "Inhabitable": "Inhabitable" };

// Colors
const BG = "#f1f5f9", CARD = "#ffffff", BORDER = "#e2e8f0", TEXT = "#0f172a", MUTED = "#64748b", INPUT = "#f8fafc", BLUE = "#1e40af";

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{num}</div>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: BLUE, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>{title}</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>{children}</div>
    </div>
  );
}

function Campo({ label, value, onChange, type = "text", opciones, requerido, placeholder }: any) {
  const base = { background: INPUT, border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, padding: "11px 12px", fontSize: 15, width: "100%", boxSizing: "border-box" as const, outline: "none" };
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 4 }}>
      <label style={{ color: MUTED, fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.07em" }}>{label}{requerido && " *"}:</label>
      {opciones
        ? <select value={value} onChange={(e: any) => onChange(e.target.value)} style={base}>
            <option value="">Seleccionar...</option>
            {opciones.map((o: string) => <option key={o} value={o}>{o}</option>)}
          </select>
        : <input type={type} value={value} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder || ""} style={base} />}
    </div>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{children}</div>;
}

function CheckItem({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!checked)}
      style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px", borderRadius: 8, background: checked ? "#eff6ff" : INPUT, border: `1px solid ${checked ? BLUE : BORDER}`, cursor: "pointer", touchAction: "manipulation" }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checked ? BLUE : "#cbd5e1"}`, background: checked ? BLUE : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
        {checked && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>v</span>}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: checked ? BLUE : TEXT }}>{label}</div>
        <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  );
}

function FachadaSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const opts = ["Sin dano", "Fisuras leve", "Grietas moderadas", "Dano severo"];
  const labels: Record<string, string> = { "Sin dano": "Sin daño", "Fisuras leve": "Fisuras leve", "Grietas moderadas": "Grietas moderadas", "Dano severo": "Daño severo" };
  const colors: Record<string, string> = { "Sin dano": "#22c55e", "Fisuras leve": "#fbbf24", "Grietas moderadas": "#f97316", "Dano severo": "#ef4444" };
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 4 }}>
      <label style={{ color: MUTED, fontSize: 11, textTransform: "uppercase" as const }}>{label}:</label>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
        {opts.map(o => (
          <button key={o} onClick={() => onChange(o)}
            style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${value === o ? colors[o] : BORDER}`, background: value === o ? colors[o] + "22" : INPUT, color: value === o ? colors[o] : MUTED, fontSize: 11, fontWeight: value === o ? 700 : 400, cursor: "pointer", touchAction: "manipulation" }}>
            {labels[o]}
          </button>
        ))}
      </div>
    </div>
  );
}

function GpsCapture({ lat, lng, onCapture }: { lat: number | null; lng: number | null; onCapture: (lat: number, lng: number) => void }) {
  const [estado, setEstado] = useState<string>("idle");
  const [manual, setManual] = useState(false);
  const [latM, setLatM] = useState(""); const [lngM, setLngM] = useState("");

  function capturar() {
    if (!navigator.geolocation) { setEstado("error"); return; }
    setEstado("cargando");
    navigator.geolocation.getCurrentPosition(
      p => { onCapture(p.coords.latitude, p.coords.longitude); setEstado("ok"); },
      () => setEstado("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const utm = lat && lng ? toUTM(lat, lng) : null;
  const cfg: Record<string, any> = {
    idle:     { bg: "#eff6ff", border: "#2563eb", color: "#1d4ed8", icon: "P", txt: "Capturar ubicacion GPS" },
    cargando: { bg: INPUT, border: BORDER, color: MUTED, icon: "...", txt: "Obteniendo senal..." },
    ok:       { bg: "#f0fdf4", border: "#16a34a", color: "#15803d", icon: "OK", txt: "Ubicacion capturada" },
    error:    { bg: "#fef2f2", border: "#fca5a5", color: "#dc2626", icon: "!", txt: "Sin senal. Usar coordenadas manuales." },
  };
  const c = cfg[estado];

  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label style={{ color: MUTED, fontSize: 11, textTransform: "uppercase" as const }}>Coordenadas GPS</label>
        <button onClick={() => setManual(m => !m)} style={{ background: "none", border: "none", color: MUTED, fontSize: 11, cursor: "pointer", textDecoration: "underline" }}>
          {manual ? "Usar GPS" : "Ingresar manualmente"}
        </button>
      </div>
      {!manual && (
        <button onClick={capturar} disabled={estado === "cargando"}
          style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, color: c.color, padding: "13px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, touchAction: "manipulation", width: "100%" }}>
          <span style={{ fontSize: 16 }}>{c.icon}</span>{c.txt}
        </button>
      )}
      {lat && lng && (
        <div style={{ background: INPUT, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Coordenadas capturadas</div>
          <div style={{ fontFamily: "monospace", fontSize: 12, color: TEXT, marginBottom: 6 }}>Lat: {lat.toFixed(6)} · Lng: {lng.toFixed(6)}</div>
          {utm && <div style={{ fontFamily: "monospace", fontSize: 12, color: BLUE }}>UTM Zona 20N · Este: {utm.este.toLocaleString()} · Norte: {utm.norte.toLocaleString()}</div>}
        </div>
      )}
      {(manual || estado === "error") && (
        <div style={{ background: INPUT, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 12 }}>
          <p style={{ color: MUTED, fontSize: 11, margin: "0 0 10px" }}>Abra Google Maps, mantenga presionada su ubicacion y copie los numeros.</p>
          <Grid2>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 3 }}>
              <label style={{ color: MUTED, fontSize: 11 }}>Latitud</label>
              <input type="number" placeholder="ej. 10.601" value={latM} onChange={e => setLatM(e.target.value)}
                style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, color: TEXT, padding: "10px", fontSize: 14, outline: "none" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 3 }}>
              <label style={{ color: MUTED, fontSize: 11 }}>Longitud</label>
              <input type="number" placeholder="ej. -66.934" value={lngM} onChange={e => setLngM(e.target.value)}
                style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, color: TEXT, padding: "10px", fontSize: 14, outline: "none" }} />
            </div>
          </Grid2>
          <button onClick={() => { const la = parseFloat(latM), lo = parseFloat(lngM); if (!isNaN(la) && !isNaN(lo)) { onCapture(la, lo); setEstado("ok"); } }}
            style={{ marginTop: 10, width: "100%", background: BLUE, border: "none", borderRadius: 8, color: "#fff", padding: "11px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Confirmar coordenadas
          </button>
        </div>
      )}
    </div>
  );
}

function Dashboard({ inspecciones }: { inspecciones: any[] }) {
  const total = inspecciones.length;
  const hab = inspecciones.filter(i => i.veredicto === "Habitable").length;
  const prec = inspecciones.filter(i => i.veredicto === "Precaucion").length;
  const rest = inspecciones.filter(i => i.veredicto === "Acceso Restringido").length;
  const inhab = inspecciones.filter(i => i.veredicto === "Inhabitable").length;

  const porParroquia: Record<string, number> = {};
  inspecciones.forEach(i => { if (i.parroquia) porParroquia[i.parroquia] = (porParroquia[i.parroquia] || 0) + 1; });

  const porTipo: Record<string, number> = {};
  inspecciones.forEach(i => { if (i.tipo_edificacion) porTipo[i.tipo_edificacion] = (porTipo[i.tipo_edificacion] || 0) + 1; });

  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px", gridColumn: "1 / -1" }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: TEXT, lineHeight: 1 }}>{total}</div>
          <div style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>Total de inspecciones</div>
        </div>
        {[
          { label: "Habitable", value: hab, color: "#22c55e", icon: "G" },
          { label: "Precaucion", value: prec, color: "#fbbf24", icon: "Y" },
          { label: "Acceso Restringido", value: rest, color: "#f97316", icon: "O" },
          { label: "Inhabitable", value: inhab, color: "#ef4444", icon: "R" },
        ].map(s => (
          <div key={s.label} style={{ background: CARD, border: `1px solid ${s.color}33`, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: s.color, marginBottom: 8 }} />
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{VI[s.label] || s.label}</div>
            {total > 0 && <div style={{ fontSize: 11, color: s.color, marginTop: 2 }}>{Math.round(s.value / total * 100)}%</div>}
          </div>
        ))}
      </div>

      {total > 0 && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 12 }}>Distribucion por veredicto</div>
          {[{ label: "Habitable", value: hab, color: "#22c55e" }, { label: "Precaucion", value: prec, color: "#fbbf24" }, { label: "Acceso Restringido", value: rest, color: "#f97316" }, { label: "Inhabitable", value: inhab, color: "#ef4444" }].map(s => (
            <div key={s.label} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: MUTED }}>{VI[s.label] || s.label}</span>
                <span style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.value}</span>
              </div>
              <div style={{ height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${total > 0 ? s.value / total * 100 : 0}%`, background: s.color, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {Object.keys(porParroquia).length > 0 && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 12 }}>Por parroquia</div>
          {Object.entries(porParroquia).sort((a, b) => b[1] - a[1]).map(([par, count]) => (
            <div key={par} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${BG}` }}>
              <span style={{ fontSize: 13, color: MUTED }}>{par}</span>
              <span style={{ fontSize: 13, color: BLUE, fontWeight: 600 }}>{count}</span>
            </div>
          ))}
        </div>
      )}

      {Object.keys(porTipo).length > 0 && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 12 }}>Por tipo de edificacion</div>
          {Object.entries(porTipo).sort((a, b) => b[1] - a[1]).map(([tipo, count]) => (
            <div key={tipo} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${BG}` }}>
              <span style={{ fontSize: 13, color: MUTED }}>{tipo}</span>
              <span style={{ fontSize: 13, color: BLUE, fontWeight: 600 }}>{count}</span>
            </div>
          ))}
        </div>
      )}

      {inspecciones.length > 0 && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 12 }}>Ultimas inspecciones</div>
          {inspecciones.slice(0, 10).map(i => (
            <div key={i.id} style={{ padding: "10px 0", borderBottom: `1px solid ${BG}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{i.urbanizacion || i.calle || "Sin direccion"}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{i.parroquia} · {i.tipo_edificacion}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>Inspector: {i.inspector}</div>
                </div>
                <span style={{ background: (VC[i.veredicto] || "#888") + "22", color: VC[i.veredicto] || "#888", border: `1px solid ${(VC[i.veredicto] || "#888")}44`, borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" as const }}>
                  {VI[i.veredicto] || i.veredicto}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {total === 0 && (
        <div style={{ textAlign: "center" as const, padding: 48, color: MUTED }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15 }}>No hay inspecciones registradas aun.</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Inicia la primera inspeccion con el boton de abajo.</div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<string>("dashboard");
  const [form, setForm] = useState<FormData>({ ...EMPTY_FORM });
  const [paso, setPaso] = useState<number>(1);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [inspecciones, setInspecciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  const set = (key: keyof FormData) => (val: any) => setForm(f => ({ ...f, [key]: val }));

  async function cargar() {
    setCargando(true);
    try { const data = await dbGet(); if (Array.isArray(data)) setInspecciones(data); } catch (e) {}
    setCargando(false);
  }

  async function enviar() {
    if (!form.inspector || !form.tipo_edificacion || !form.veredicto) return;
    setEnviando(true);
    try {
      await dbInsert({
        inspector: form.inspector, tipo_edificacion: form.tipo_edificacion,
        nombre_habitante: form.nombre_habitante || null, cedula: form.cedula || null,
        telefono_contacto: form.telefono_contacto || null, condicion_habitante: form.condicion_habitante || null,
        esquina: form.esquina || null, calle: form.calle || null, avenida: form.avenida || null,
        urbanizacion: form.urbanizacion || null, parroquia: form.parroquia || null,
        consejo_comunal: form.consejo_comunal || null, municipio: form.municipio || null,
        ciudad: form.ciudad || null, estado: form.estado || null,
        lat: form.lat, lng: form.lng,
        asentamiento_diferencial: form.asentamiento_diferencial, socavacion_zapatas: form.socavacion_zapatas,
        columna_falla_corte: form.columna_falla_corte, columna_pandeo_acero: form.columna_pandeo_acero,
        viga_falla_nodos: form.viga_falla_nodos, viga_flexion_centro: form.viga_flexion_centro,
        morfologia_grieta: form.morfologia_grieta || null,
        ancho_grieta_mm: form.ancho_grieta_mm ? parseFloat(form.ancho_grieta_mm) : null,
        tipo_muro: form.tipo_muro || null, desprendimiento_friso: form.desprendimiento_friso,
        reservorios_grietas: form.reservorios_grietas, ascensores_bloqueados: form.ascensores_bloqueados,
        riesgo_electrico: form.riesgo_electrico, falla_aduccion: form.falla_aduccion,
        escaleras_estado: form.escaleras_estado || null,
        fachada_norte: form.fachada_norte || null, fachada_sur: form.fachada_sur || null,
        fachada_este: form.fachada_este || null, fachada_oeste: form.fachada_oeste || null,
        veredicto: form.veredicto, observaciones: form.observaciones || null
      });
      setEnviado(true); setForm({ ...EMPTY_FORM }); setPaso(1); await cargar();
      setTimeout(() => { setEnviado(false); setTab("dashboard"); }, 3000);
    } catch (e) {}
    setEnviando(false);
  }

  const handleTab = (t: string) => { setTab(t); if (t === "dashboard" || t === "mapa") cargar(); };

  const TABS = [{ id: "dashboard", label: "Metricas" }, { id: "mapa", label: "Mapa" }, { id: "form", label: "Nueva inspeccion" }];
  const PASOS = ["Identificacion", "Ubicacion", "Estructura", "Mamposterua", "Servicios", "Fachadas", "Veredicto"];

  const VEREDICTOS = [
    { v: "Habitable", color: "#22c55e", desc: "Estructura segura para habitar" },
    { v: "Precaucion", color: "#fbbf24", desc: "Habitable con observaciones menores" },
    { v: "Acceso Restringido", color: "#f97316", desc: "Solo personal autorizado puede ingresar" },
    { v: "Inhabitable", color: "#ef4444", desc: "No se puede ingresar - riesgo inminente" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Inter', system-ui, sans-serif", padding: "12px 12px 80px" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 3 }}>Venezuela - Junio 2026</div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: TEXT, margin: 0, lineHeight: 1.2 }}>Inspeccion Tecnica Estructural</h1>
        <p style={{ color: MUTED, fontSize: 12, margin: "3px 0 8px" }}>BITE-UCV & Paula Lima — Infraestructura de datos</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
          {[{ color: "#22c55e", label: "Habitable" }, { color: "#fbbf24", label: "Precaucion" }, { color: "#f97316", label: "Acceso Restringido" }, { color: "#ef4444", label: "Inhabitable" }].map(v => (
            <div key={v.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: v.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: MUTED }}>{VI[v.label] || v.label}</span>
            </div>
          ))}
        </div>
      </div>

      {tab === "dashboard" && (
        cargando
          ? <div style={{ textAlign: "center" as const, padding: 60, color: MUTED }}><div style={{ fontSize: 32 }}>⏳</div><div style={{ marginTop: 12 }}>Cargando datos...</div></div>
          : <Dashboard inspecciones={inspecciones} />
      )}

      {tab === "form" && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
          {enviado ? (
            <div style={{ textAlign: "center" as const, padding: 48 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div style={{ color: "#22c55e", fontWeight: 700, fontSize: 18 }}>Inspeccion guardada</div>
              <div style={{ color: MUTED, fontSize: 13, marginTop: 6 }}>Redirigiendo a metricas...</div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 4, marginBottom: 20, overflowX: "auto" as const }}>
                {PASOS.map((p, i) => (
                  <div key={p} onClick={() => setPaso(i + 1)}
                    style={{ flexShrink: 0, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: paso === i + 1 ? 700 : 400, cursor: "pointer",
                      background: paso === i + 1 ? BLUE : paso > i + 1 ? "#dcfce7" : "#e2e8f0",
                      color: paso === i + 1 ? "#fff" : paso > i + 1 ? "#16a34a" : MUTED,
                      border: `1px solid ${paso === i + 1 ? BLUE : paso > i + 1 ? "#16a34a" : BORDER}` }}>
                    {i + 1}. {p}
                  </div>
                ))}
              </div>

              {paso === 1 && (
                <Section num="1" title="Identificacion">
                  <Campo label="Inspector" value={form.inspector} onChange={set("inspector")} requerido placeholder="Nombre del ingeniero inspector" />
                  <Campo label="Tipo de edificacion" value={form.tipo_edificacion} onChange={set("tipo_edificacion")} requerido opciones={["Casa Unifamiliar","Apartamento","Edificio Residencial","Edificio Comercial","Galpon Industrial"]} />
                  <Campo label="Nombre del habitante" value={form.nombre_habitante} onChange={set("nombre_habitante")} />
                  <Grid2>
                    <Campo label="C.I." value={form.cedula} onChange={set("cedula")} placeholder="V-12345678" />
                    <Campo label="Telefono" value={form.telefono_contacto} onChange={set("telefono_contacto")} placeholder="+58 414..." />
                  </Grid2>
                  <Campo label="Condicion del habitante" value={form.condicion_habitante} onChange={set("condicion_habitante")} opciones={["Propietario","Habitante","Co-Propietario","Vocero del Consejo Comunal","Miembro de la Junta de Condominio"]} />
                </Section>
              )}

              {paso === 2 && (
                <Section num="2" title="Ubicacion">
                  <GpsCapture lat={form.lat} lng={form.lng} onCapture={(la, lo) => setForm(f => ({ ...f, lat: la, lng: lo }))} />
                  <Grid2>
                    <Campo label="Esquina" value={form.esquina} onChange={set("esquina")} />
                    <Campo label="Calle" value={form.calle} onChange={set("calle")} />
                  </Grid2>
                  <Grid2>
                    <Campo label="Avenida" value={form.avenida} onChange={set("avenida")} />
                    <Campo label="Urbanizacion" value={form.urbanizacion} onChange={set("urbanizacion")} />
                  </Grid2>
                  <Grid2>
                    <Campo label="Parroquia" value={form.parroquia} onChange={set("parroquia")} />
                    <Campo label="Consejo Comunal" value={form.consejo_comunal} onChange={set("consejo_comunal")} />
                  </Grid2>
                  <Grid2>
                    <Campo label="Municipio" value={form.municipio} onChange={set("municipio")} />
                    <Campo label="Ciudad" value={form.ciudad} onChange={set("ciudad")} />
                  </Grid2>
                  <Campo label="Estado" value={form.estado} onChange={set("estado")} />
                </Section>
              )}

              {paso === 3 && (
                <Section num="3" title="Sistema Estructural">
                  <div style={{ fontSize: 12, color: MUTED, marginBottom: 4 }}>Fundaciones y Suelo</div>
                  <CheckItem label="Asentamiento Diferencial" desc="Grietas diagonales que nacen en el piso y suben hacia las paredes." checked={form.asentamiento_diferencial} onChange={set("asentamiento_diferencial")} />
                  <CheckItem label="Socavacion / Exposicion de Zapatas" desc="Perdida de material portante bajo la base de la estructura." checked={form.socavacion_zapatas} onChange={set("socavacion_zapatas")} />
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 8, marginBottom: 4 }}>Columnas, Vigas y Nodos</div>
                  <CheckItem label="Columna: Falla por Corte" desc="Patron en X o diagonal." checked={form.columna_falla_corte} onChange={set("columna_falla_corte")} />
                  <CheckItem label="Columna: Pandeo de Acero" desc="Concreto desprendido." checked={form.columna_pandeo_acero} onChange={set("columna_pandeo_acero")} />
                  <CheckItem label="Viga: Falla en Nodos/Extremos" desc="Grietas en la union viga-columna." checked={form.viga_falla_nodos} onChange={set("viga_falla_nodos")} />
                  <CheckItem label="Viga: Flexion (Centro)" desc="Grietas verticales en zona central." checked={form.viga_flexion_centro} onChange={set("viga_flexion_centro")} />
                </Section>
              )}

              {paso === 4 && (
                <Section num="4" title="Analisis Patologico de Mamposterua">
                  <Campo label="Morfologia de grieta" value={form.morfologia_grieta} onChange={set("morfologia_grieta")} opciones={["Ninguna / Capilar","Horizontal (Gravedad/Asentamiento)","Diagonal 45 (Corte/Sismo)","Vertical (Flexion)","Patron en X (Corte Severo)","Escalonada (Asentamiento)"]} />
                  <Campo label="Ancho de grieta (mm)" value={form.ancho_grieta_mm} onChange={set("ancho_grieta_mm")} type="number" placeholder="ej. 2.5" />
                  <Campo label="Tipo de muro" value={form.tipo_muro} onChange={set("tipo_muro")} opciones={["Tabique (Divisorio)","Muro de Carga / Estructural"]} />
                  <CheckItem label="Desprendimiento de friso" desc="Caida o separacion del revestimiento de las paredes." checked={form.desprendimiento_friso} onChange={set("desprendimiento_friso")} />
                </Section>
              )}

              {paso === 5 && (
                <Section num="5" title="Electromecanica, Escaleras y Servicios">
                  <CheckItem label="Reservorios / Tanques" desc="Grietas o perdida de nivel." checked={form.reservorios_grietas} onChange={set("reservorios_grietas")} />
                  <CheckItem label="Ascensores / Elevadores" desc="Desalineados o bloqueados." checked={form.ascensores_bloqueados} onChange={set("ascensores_bloqueados")} />
                  <CheckItem label="Riesgo Electrico / Canalizaciones" desc="Cables expuestos, tableros danados." checked={form.riesgo_electrico} onChange={set("riesgo_electrico")} />
                  <CheckItem label="Falla Aduccion (Ruptura/Fuga)" desc="Tuberias de agua rotas o con fugas." checked={form.falla_aduccion} onChange={set("falla_aduccion")} />
                  <Campo label="Estado de escaleras" value={form.escaleras_estado} onChange={set("escaleras_estado")} opciones={["Sin danos aparentes","Dano leve (Acabados/Fisuras)","Dano moderado (Desalineacion leve)","Dano severo (Falla en apoyos/Inservible)"]} />
                </Section>
              )}

              {paso === 6 && (
                <Section num="6" title="Evaluacion por Fachadas">
                  <FachadaSelect label="Norte" value={form.fachada_norte} onChange={set("fachada_norte")} />
                  <FachadaSelect label="Sur" value={form.fachada_sur} onChange={set("fachada_sur")} />
                  <FachadaSelect label="Este" value={form.fachada_este} onChange={set("fachada_este")} />
                  <FachadaSelect label="Oeste" value={form.fachada_oeste} onChange={set("fachada_oeste")} />
                </Section>
              )}

              {paso === 7 && (
                <Section num="7" title="Veredicto Final">
                  {(() => {
                    const auto = calcularVeredicto(form);
                    const autoColor = VC[auto] || "#888";
                    const msgs: Record<string, string> = {
                      "Habitable": "Su estructura muestra un desempeno elastico adecuado. Inmueble seguro.",
                      "Precaucion": "Danos significativos en mamposterua. Precaucion ante caida de objetos.",
                      "Acceso Restringido": "Riesgo estructural moderado. Acceso restringido a personal autorizado.",
                      "Inhabitable": "Falla estructural severa o dano en cimientos. Riesgo inminente. EVACUACION OBLIGATORIA."
                    };
                    return (
                      <>
                        <div style={{ background: autoColor + "22", border: `2px solid ${autoColor}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                          <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 6 }}>Diagnostico calculado automaticamente</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <div style={{ width: 20, height: 20, borderRadius: "50%", background: autoColor }} />
                            <span style={{ fontSize: 20, fontWeight: 800, color: autoColor }}>{VI[auto] || auto}</span>
                          </div>
                          <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.4 }}>{msgs[auto]}</div>
                        </div>
                        <div style={{ fontSize: 12, color: MUTED, marginBottom: 10 }}>El inspector puede confirmar o modificar el veredicto:</div>
                        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                          {VEREDICTOS.map(({ v, color, desc }) => {
                            const isAuto = v === auto;
                            const isSelected = form.veredicto === v || (!form.veredicto && isAuto);
                            if (!form.veredicto && isAuto) setTimeout(() => set("veredicto")(auto), 0);
                            return (
                              <button key={v} onClick={() => set("veredicto")(v)}
                                style={{ padding: "14px", borderRadius: 10, border: `2px solid ${isSelected ? color : BORDER}`, background: isSelected ? color + "22" : INPUT, color: isSelected ? color : MUTED, fontSize: 14, fontWeight: 700, cursor: "pointer", touchAction: "manipulation", display: "flex", alignItems: "center", gap: 12, textAlign: "left" as const }}>
                                <div style={{ width: 16, height: 16, borderRadius: "50%", background: color, flexShrink: 0 }} />
                                <div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    {VI[v] || v}
                                    {isAuto && <span style={{ fontSize: 10, background: color + "33", color, padding: "1px 6px", borderRadius: 4 }}>calculado</span>}
                                  </div>
                                  <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.7, marginTop: 2 }}>{desc}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" as const, gap: 4, marginTop: 16 }}>
                          <label style={{ color: MUTED, fontSize: 11, textTransform: "uppercase" as const }}>Observaciones del inspector:</label>
                          <textarea value={form.observaciones} onChange={(e: any) => set("observaciones")(e.target.value)} rows={4}
                            placeholder="Describa los hallazgos principales, recomendaciones y proximos pasos..."
                            style={{ background: INPUT, border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, padding: "12px", fontSize: 14, outline: "none", resize: "vertical" as const, width: "100%", boxSizing: "border-box" as const }} />
                        </div>
                      </>
                    );
                  })()}
                </Section>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                {paso > 1 && (
                  <button onClick={() => setPaso(p => p - 1)}
                    style={{ flex: 1, background: INPUT, border: `1px solid ${BORDER}`, borderRadius: 10, color: MUTED, padding: "14px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                    Anterior
                  </button>
                )}
                {paso < 7 ? (
                  <button onClick={() => setPaso(p => p + 1)}
                    style={{ flex: 2, background: BLUE, border: "none", borderRadius: 10, color: "#fff", padding: "14px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                    Siguiente
                  </button>
                ) : (
                  <button
                    onClick={async () => { await enviar(); if (form.veredicto && form.inspector) generarPDF(form, form.veredicto); }}
                    disabled={enviando || !form.inspector || !form.tipo_edificacion || !form.veredicto}
                    style={{ flex: 2, background: form.veredicto ? (VC[form.veredicto] || BLUE) : INPUT, border: "none", borderRadius: 10, color: form.veredicto ? "#fff" : MUTED, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                    {enviando ? "Guardando y generando PDF..." : "Guardar y generar PDF"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}


      {tab === "mapa" && (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
          {/* Stats bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {[
              { label: "Habitable", color: "#22c55e", value: inspecciones.filter(i => i.veredicto === "Habitable").length },
              { label: "Precaucion", color: "#fbbf24", value: inspecciones.filter(i => i.veredicto === "Precaucion").length },
              { label: "Restringido", color: "#f97316", value: inspecciones.filter(i => i.veredicto === "Acceso Restringido").length },
              { label: "Inhabitable", color: "#ef4444", value: inspecciones.filter(i => i.veredicto === "Inhabitable").length },
            ].map(s => (
              <div key={s.label} style={{ background: CARD, border: `1px solid ${s.color}33`, borderRadius: 10, padding: "8px", textAlign: "center" as const }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, margin: "0 auto 4px" }} />
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 9, color: MUTED }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* SVG Map */}
          {inspecciones.length === 0 ? (
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 48, textAlign: "center" as const, color: MUTED }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🗺</div>
              <div>No hay inspecciones aun.</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>Las inspecciones apareceran en el mapa cuando sean registradas.</div>
            </div>
          ) : (() => {
            const conCoords = inspecciones.filter(i => i.lat && i.lng);
            if (conCoords.length === 0) return (
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 48, textAlign: "center" as const, color: MUTED }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📍</div>
                <div>Ninguna inspeccion tiene coordenadas GPS.</div>
              </div>
            );

            // Fixed viewbox covering Caracas, La Guaira, Los Teques
            const minLat = 10.25, maxLat = 10.70, minLng = -67.15, maxLng = -66.45;
            const W = 800, H = 500;

            const colorMap: Record<string, string> = {
              "Habitable": "#22c55e",
              "Precaucion": "#fbbf24",
              "Acceso Restringido": "#f97316",
              "Inhabitable": "#ef4444"
            };

            return (
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
                  <defs>
                    <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width={W} height={H} fill="#f8fafc" />
                  <rect width={W} height={H} fill="url(#mapgrid)" />

                  {/* Coastline */}
                  <path d="M 0 88 Q 150 68 310 72 Q 420 70 500 80 Q 650 85 800 75"
                    fill="none" stroke="#bfdbfe" strokeWidth="2" strokeDasharray="6 3" opacity="0.8" />
                  <text x="12" y="60" fill="#93c5fd" fontSize="11" opacity="0.9" fontStyle="italic">Mar Caribe</text>

                  {/* City reference dots */}
                  {[
                    { nombre: "La Guaira", lat: 10.601, lng: -66.934 },
                    { nombre: "Caracas", lat: 10.480, lng: -66.903 },
                    { nombre: "Los Teques", lat: 10.347, lng: -67.039 },
                    { nombre: "Guarenas", lat: 10.467, lng: -66.536 },
                    { nombre: "Maiquetia", lat: 10.596, lng: -66.978 },
                    { nombre: "Macuto", lat: 10.614, lng: -66.894 },
                    { nombre: "Carabelleda", lat: 10.621, lng: -66.861 },
                  ].map((c: any) => {
                    const px = ((c.lng - minLng) / (maxLng - minLng)) * W;
                    const py = H - ((c.lat - minLat) / (maxLat - minLat)) * H;
                    return (
                      <g key={c.nombre}>
                        <circle cx={px} cy={py} r={3} fill="#cbd5e1" />
                        <text x={px + 5} y={py + 4} fill="#94a3b8" fontSize="9">{c.nombre}</text>
                      </g>
                    );
                  })}

                  {/* Inspection dots */}
                  {conCoords.map((insp: any) => {
                    const p = { x: ((insp.lng - minLng) / (maxLng - minLng)) * W, y: H - ((insp.lat - minLat) / (maxLat - minLat)) * H };
                    const color = colorMap[insp.veredicto] || "#94a3b8";
                    return (
                      <g key={insp.id}>
                        <circle cx={p.x} cy={p.y} r={10} fill={color} stroke="#fff" strokeWidth={2} opacity={0.9} />
                        <circle cx={p.x} cy={p.y} r={16} fill={color} opacity={0.15} />
                      </g>
                    );
                  })}

                  <text x={W - 8} y={H - 8} textAnchor="end" fontSize="9" fill="#94a3b8">BITE-UCV · Venezuela 2026</text>
                </svg>
              </div>
            );
          })()}

          {/* List of inspections */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 12 }}>
              {inspecciones.length} inspecciones registradas
            </div>
            {inspecciones.slice(0, 20).map((i: any) => (
              <div key={i.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${BG}` }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: VC[i.veredicto] || "#94a3b8", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{i.urbanizacion || i.calle || "Sin direccion"}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{i.parroquia} · {i.tipo_edificacion} · {i.inspector}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: VC[i.veredicto] || "#94a3b8" }}>{VI[i.veredicto] || i.veredicto}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: CARD, borderTop: `1px solid ${BORDER}`, boxShadow: "0 -1px 8px rgba(0,0,0,0.06)", display: "flex", zIndex: 100 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => handleTab(t.id)}
            style={{ flex: 1, padding: "14px 4px 18px", border: "none", background: "none", color: tab === t.id ? BLUE : MUTED, fontSize: 13, fontWeight: tab === t.id ? 700 : 400, cursor: "pointer", touchAction: "manipulation", borderTop: `2px solid ${tab === t.id ? BLUE : "transparent"}` }}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
