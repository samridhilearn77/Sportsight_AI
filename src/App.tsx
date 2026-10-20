import { useEffect, useRef, useState, type ReactNode } from "react";
import { firebaseIsConfigured, saveAssessment } from "./firebase";

type IconName =
  | "home"
  | "chart"
  | "camera"
  | "user"
  | "search"
  | "bell"
  | "arrow"
  | "upload"
  | "video"
  | "spark"
  | "check"
  | "location"
  | "bookmark"
  | "shield"
  | "chevron";

type Screen = "home" | "assess" | "report" | "profile" | "discover" | "athlete";
type Role = "athlete" | "scout";
type ReportMetric = { label: string; score: number; note: string };
type FullReport = {
  overall_score: number; grade: string; summary: string; metrics: ReportMetric[];
  strengths: string[]; improvements: string[]; drills: string[];
  quality: { detection_rate: number; sharpness: number; tips: string[] };
  timeline: number[];
  measurements?: { avg_knee_angle_deg: number; avg_trunk_lean_deg: number; avg_stance_width_ratio: number; avg_balance_offset: number };
  meta: { engine?: string; engine_note?: string | null; filename?: string; sport?: string; analysed_at?: string; type?: string; duration_sec?: number | null; frames_analysed?: number; fps?: number | null };
};
type AssessmentResult = { status: string; filename?: string; talent_score?: number; assessment?: string; actionable_feedback?: string[]; error?: string; feedback?: string[]; report?: FullReport; };
const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const sprintImage =
  "https://images.unsplash.com/photo-1640504409849-da005a55cbd3?auto=format&fit=crop&w=900&q=86";
const wrestlingImage =
  "https://images.unsplash.com/photo-1771238113788-a8e53cdf85eb?auto=format&fit=crop&w=900&q=86";
const kabaddiImage =
  "https://images.unsplash.com/photo-1706102005359-3d6f2a6ec313?auto=format&fit=crop&w=900&q=86";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></>,
    chart: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>,
    camera: <><rect x="3" y="6" width="18" height="14" rx="3"/><path d="m8 6 1.5-2h5L16 6"/><circle cx="12" cy="13" r="4"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c.7-4 3.3-6 8-6s7.3 2 8 6"/></>,
    search: <><circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 15v5h16v-5"/></>,
    video: <><rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3"/></>,
    spark: <><path d="m12 2 1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    location: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    bookmark: <path d="M6 3h12v18l-6-4-6 4V3Z"/>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-5"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark"><span /></div>
      <div><strong>SportsSight</strong><b>AI</b></div>
    </div>
  );
}

function Header({ role, onToggle }: { role: Role; onToggle: () => void }) {
  return (
    <header className="app-header">
      <Brand />
      <div className="header-actions">
        <button className="role-pill" onClick={onToggle} aria-label={`Switch to ${role === "athlete" ? "scout" : "athlete"} mode`}>
          {role === "athlete" ? "ATHLETE" : "SCOUT"}
        </button>
        <button className="icon-button" aria-label="Notifications"><Icon name="bell" size={19} /><i /></button>
      </div>
    </header>
  );
}

function AthleteHome({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <main className="screen home-screen">
      <section className="hello">
        <div><span className="eyebrow">TUESDAY, 26 MARCH</span><h1>Namaste, Arjun</h1><p>Ready to show what you’ve got?</p></div>
        <button className="avatar" onClick={() => navigate("profile")} aria-label="Open profile">AK</button>
      </section>

      <button className="hero-card" onClick={() => navigate("assess")}>
        <img src={kabaddiImage} alt="Athletes training outdoors" />
        <span className="hero-shade" />
        <span className="hero-grid" />
        <span className="hero-content">
          <span className="live-label"><Icon name="spark" size={14} /> AI PERFORMANCE LAB</span>
          <strong>Turn your effort<br />into evidence.</strong>
          <small>Record or upload a sports video. Get an expert-level AI assessment in minutes.</small>
          <span className="cta">Start new assessment <Icon name="arrow" size={18} /></span>
        </span>
      </button>

      <section>
        <div className="section-head"><div><span className="eyebrow">LATEST INSIGHT</span><h2>Your performance</h2></div><button onClick={() => navigate("report")}>View report</button></div>
        <button className="report-card" onClick={() => navigate("report")}>
          <span className="score-ring"><strong>82</strong><small>OVERALL</small></span>
          <span className="report-info"><span className="sport-tag">KABADDI</span><strong>Raiding assessment</strong><small>Analysed 2 days ago · 01:24 video</small><span className="trend"><b>↑ 6 pts</b> since last assessment</span></span>
          <Icon name="chevron" size={18} />
        </button>
      </section>

      <section>
        <div className="section-head"><div><span className="eyebrow">BUILD YOUR PROFILE</span><h2>Scout visibility</h2></div><strong className="percent">72%</strong></div>
        <div className="visibility-card">
          <div className="progress"><span /></div>
          <p>Add a verified performance report to improve your chances of being discovered.</p>
          <button onClick={() => navigate("profile")}>Complete profile <Icon name="arrow" size={16} /></button>
        </div>
      </section>
      <p className="trust-line"><Icon name="shield" size={16} /> Your videos stay private until you choose to share.</p>
    </main>
  );
}

function CameraRecorder({ onUse, onClose }: { onUse: (file: File) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [recorded, setRecorded] = useState<{ blob: Blob; url: string; type: string } | null>(null);
  const MAX_SECONDS = 180;

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function startCamera(mode: "environment" | "user") {
    stopStream();
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera is not available here. Open the app over HTTPS (or localhost) in a modern browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}); }
    } catch (e) {
      const name = e instanceof DOMException ? e.name : "";
      setError(name === "NotAllowedError" ? "Camera permission denied. Allow camera access in your browser settings and try again."
        : name === "NotFoundError" ? "No camera found on this device." : "Could not open the camera.");
    }
  }

  useEffect(() => {
    startCamera(facing);
    return () => { stopStream(); if (timerRef.current) window.clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facing]);

  useEffect(() => () => { if (recorded) URL.revokeObjectURL(recorded.url); }, [recorded]);

  function startRecording() {
    if (!streamRef.current || typeof MediaRecorder === "undefined") { setError("Recording is not supported in this browser."); return; }
    const types = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
    const mimeType = types.find((t) => MediaRecorder.isTypeSupported(t)) || "";
    chunksRef.current = [];
    const rec = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined);
    rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    rec.onstop = () => {
      const type = rec.mimeType || mimeType || "video/webm";
      const blob = new Blob(chunksRef.current, { type });
      setRecorded({ blob, url: URL.createObjectURL(blob), type });
      stopStream();
    };
    rec.start(500);
    recorderRef.current = rec;
    setSeconds(0); setRecording(true);
    timerRef.current = window.setInterval(() => {
      setSeconds((v) => { if (v + 1 >= MAX_SECONDS) stopRecording(); return v + 1; });
    }, 1000);
  }

  function stopRecording() {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
    setRecording(false);
  }

  function retake() {
    setRecorded(null); setSeconds(0);
    startCamera(facing);
  }

  function useVideo() {
    if (!recorded) return;
    const ext = recorded.type.includes("mp4") ? "mp4" : "webm";
    onUse(new File([recorded.blob], `recording-${Date.now()}.${ext}`, { type: recorded.type }));
  }

  function close() { stopRecording(); stopStream(); onClose(); }
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="cam-overlay" role="dialog" aria-label="Record performance">
      <div className="cam-top">
        <button className="cam-btn" onClick={close} aria-label="Close camera">✕</button>
        {(recording || recorded) && <span className={recording ? "cam-timer rec" : "cam-timer"}>{recording && <i />}{mm}:{ss}</span>}
        {!recorded && <button className="cam-btn" disabled={recording} onClick={() => setFacing(facing === "environment" ? "user" : "environment")} aria-label="Switch camera">⟲</button>}
      </div>
      {error ? <div className="cam-error"><p>{error}</p><button className="primary-button" onClick={() => startCamera(facing)}>Try again</button></div>
        : recorded ? <video className="cam-video" src={recorded.url} controls playsInline />
        : <video className="cam-video" ref={videoRef} muted playsInline autoPlay />}
      <div className="cam-bottom">
        {recorded ? (
          <div className="cam-actions">
            <button className="cam-secondary" onClick={retake}>Retake</button>
            <button className="primary-button" onClick={useVideo}>Use this video</button>
          </div>
        ) : (
          <>
            <p className="cam-hint">{recording ? `Recording… max ${MAX_SECONDS / 60} min` : "Keep your full body in frame"}</p>
            <button className={recording ? "rec-button recording" : "rec-button"} onClick={recording ? stopRecording : startRecording} disabled={!!error} aria-label={recording ? "Stop recording" : "Start recording"}><span /></button>
          </>
        )}
      </div>
    </div>
  );
}

function Assess({ navigate, onResult }: { navigate: (s: Screen) => void; onResult: (result: AssessmentResult) => void }) {
  const [sport, setSport] = useState("Kabaddi");
  const [source, setSource] = useState<"record" | "upload" | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);

  async function beginAnalysis() {
    if (!file) { setError("Please select a photo or video first."); return; }
    setAnalyzing(true); setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("sport", sport);
      const response = await fetch(`${API_BASE}/analyze-file`, { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || result.message || "Could not analyse this file.");
      const enrichedResult = { ...result, assessment: `${sport} · ${result.assessment || "Assessment complete"}` };
      onResult(enrichedResult);
      // Persist report metadata in Firestore when Firebase environment values are configured.
      // A database save failure must not discard the successful AI assessment.
      if (firebaseIsConfigured()) {
        try {
          await saveAssessment({
            sport,
            filename: result.filename || file.name,
            status: result.status || "success",
            talent_score: result.talent_score,
            assessment: enrichedResult.assessment,
            report: result.report,
            actionable_feedback: result.actionable_feedback,
            feedback: result.feedback,
            error: result.error,
          });
        } catch (saveError) {
          console.error("Assessment was analysed but could not be saved to Firebase:", saveError);
          setError("Your analysis is ready, but its report could not be saved to the database. Check Firebase setup and Firestore rules.");
        }
      }
      navigate("report");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not connect to SportsSight AI. Check that the backend is running.");
    } finally { setAnalyzing(false); }
  }

  return (
    <main className="screen assess-screen">
      <div className="page-title">
        <button className="back" onClick={() => navigate("home")} aria-label="Go back">‹</button>
        <div><span className="eyebrow">AI ASSESSMENT</span><h1>Show your performance</h1></div>
      </div>
      <div className="step-row"><span className="active" /><span /><span /></div>
      <section>
        <span className="step-label">01 — CHOOSE YOUR SPORT</span>
        <div className="sport-tabs">
          {["Kabaddi", "Wrestling", "Sprint"].map((item) => (
            <button key={item} className={sport === item ? "selected" : ""} onClick={() => setSport(item)}>
              <span>{item === "Kabaddi" ? "K" : item === "Wrestling" ? "W" : "S"}</span>{item}
            </button>
          ))}
        </div>
      </section>
      <section>
        <span className="step-label">02 — ADD A VIDEO</span>
        <div className="source-grid">
          <button type="button" className={source === "record" ? "source-card selected" : "source-card"} onClick={() => setCameraOpen(true)}>
            <span className="source-icon"><Icon name="video" size={24} /></span><strong>Record now</strong><small>Open in-app camera</small>
            {source === "record" && <i><Icon name="check" size={12} /></i>}
          </button>
          <label className={source === "upload" ? "source-card selected" : "source-card"}>
            <span className="source-icon"><Icon name="upload" size={24} /></span><strong>Upload file</strong><small>Choose video or photo</small>
            <input type="file" accept="video/*,image/*" onChange={e => { const f=e.target.files?.[0]; if(f){setFile(f);setSource("upload");setError("");} }} />
            {source === "upload" && <i><Icon name="check" size={12} /></i>}
          </label>
        </div>
      </section>
      <section className="record-guide">
        <div className="guide-image"><img src={sport === "Wrestling" ? wrestlingImage : sport === "Sprint" ? sprintImage : kabaddiImage} alt={`${sport} performance recording example`} /><span><Icon name="camera" size={18} /> RECORDING GUIDE</span></div>
        <div className="guide-copy"><h2>Capture your best attempt</h2><ul><li><Icon name="check" size={13} /> Keep your full body in frame</li><li><Icon name="check" size={13} /> Record in good natural light</li><li><Icon name="check" size={13} /> 30 seconds to 3 minutes</li></ul></div>
      </section>
      <div className="info-strip"><Icon name="spark" size={18} /><span><strong>What AI will assess</strong>{sport === "Sprint" ? "Start reaction, acceleration, stride mechanics & speed" : sport === "Wrestling" ? "Stance, balance, attack speed & technique" : "Agility, raid movement, balance & recovery"}</span></div>
      {file && <p className="selected-file">Selected: {file.name}</p>}
      {error && <p className="api-error" role="alert">{error}</p>}
      <button className="primary-button" disabled={!file || analyzing} onClick={beginAnalysis}>
        {analyzing ? <><span className="spinner" /> Analysing your performance…</> : <>Analyse my performance <Icon name="arrow" size={19} /></>}
      </button>
      {cameraOpen && <CameraRecorder onClose={() => setCameraOpen(false)} onUse={(f) => { setFile(f); setSource("record"); setError(""); setCameraOpen(false); }} />}
    </main>
  );
}

const metrics = [
  { label: "Agility & footwork", score: 88, note: "Excellent" },
  { label: "Explosive power", score: 84, note: "Strong" },
  { label: "Balance & control", score: 79, note: "Good" },
  { label: "Recovery speed", score: 76, note: "Developing" },
];

function downloadReport(result: AssessmentResult) {
  const r = result.report;
  if (!r) return;
  const lines = [
    "SportsSight AI - Performance Feedback Report",
    `Sport: ${r.meta.sport ?? "-"}   File: ${r.meta.filename ?? "-"}   Date: ${r.meta.analysed_at ? new Date(r.meta.analysed_at).toLocaleString() : "-"}`,
    "", `Overall score: ${r.overall_score}/100 (${r.grade})`, "", r.summary, "", "PERFORMANCE BREAKDOWN",
    ...r.metrics.map((m) => `- ${m.label}: ${m.score}/100 (${m.note})`),
    "", "STRENGTHS", ...r.strengths.map((x) => `- ${x}`),
    "", "AREAS TO IMPROVE", ...r.improvements.map((x) => `- ${x}`),
    "", "RECOMMENDED DRILLS", ...r.drills.map((x) => `- ${x}`),
    ...(r.measurements ? ["", "BODY MEASUREMENTS", `- Avg knee angle: ${Math.round(r.measurements.avg_knee_angle_deg)} deg`, `- Trunk lean: ${Math.round(r.measurements.avg_trunk_lean_deg)} deg`, `- Stance width: ${r.measurements.avg_stance_width_ratio.toFixed(1)}x shoulder width`] : []),
    "", `ANALYSIS ENGINE: ${r.meta.engine === "pose" ? "MediaPipe pose estimation" : "Basic visual analysis"}`,
    "", "VIDEO QUALITY", ...r.quality.tips.map((x) => `- ${x}`),
    "", "Note: Automated visual analysis for development only. Not a final selection or ranking.",
  ];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url; a.download = "sportssight-report.txt"; a.click();
  URL.revokeObjectURL(url);
}

function FullReportView({ r }: { r: FullReport }) {
  const date = r.meta.analysed_at ? new Date(r.meta.analysed_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "";
  return (
    <>
      <section><div className="section-head"><div><span className="eyebrow">SUMMARY</span><h2>Coach's overview</h2></div></div>
        <div className="visibility-card"><p>{r.summary}</p></div></section>
      <section><div className="section-head"><div><span className="eyebrow">PERFORMANCE BREAKDOWN</span><h2>Skill scores</h2></div></div>
        <div className="metrics-card">
          {r.metrics.map((m) => <div className="metric" key={m.label}><div><strong>{m.label}</strong><span>{m.note}</span><b>{m.score}</b></div><div className="metric-bar"><span style={{ width: `${m.score}%` }} /></div></div>)}
        </div></section>
      {r.timeline.length > 1 && <section><div className="section-head"><div><span className="eyebrow">MOVEMENT TIMELINE</span><h2>Activity over time</h2></div></div>
        <div className="metrics-card timeline-card"><div className="timeline">{r.timeline.map((v, i) => <span key={i} style={{ height: `${Math.max(6, v)}%` }} />)}</div><small>Relative movement intensity across the clip</small></div></section>}
      <section className="insight-card strength"><span className="insight-icon"><Icon name="spark" size={20} /></span><div><span className="eyebrow">KEY STRENGTHS</span>
        <ul className="report-list">{r.strengths.map((x, i) => <li key={i}>{x}</li>)}</ul></div></section>
      <section className="insight-card improve"><span className="insight-icon"><Icon name="chart" size={20} /></span><div><span className="eyebrow">FOCUS AREAS</span>
        <ul className="report-list">{r.improvements.map((x, i) => <li key={i}>{x}</li>)}</ul></div></section>
      <section className="insight-card"><span className="insight-icon"><Icon name="check" size={20} /></span><div><span className="eyebrow">RECOMMENDED DRILLS</span>
        <ul className="report-list">{r.drills.map((x, i) => <li key={i}>{x}</li>)}</ul></div></section>
      {r.measurements && <section><div className="section-head"><div><span className="eyebrow">POSE MEASUREMENTS</span><h2>Body mechanics</h2></div></div>
        <div className="metrics-card pose-grid">
          <div><b>{Math.round(r.measurements.avg_knee_angle_deg)}°</b><small>Avg knee angle</small></div>
          <div><b>{Math.round(r.measurements.avg_trunk_lean_deg)}°</b><small>Trunk lean</small></div>
          <div><b>{r.measurements.avg_stance_width_ratio.toFixed(1)}×</b><small>Stance width</small></div>
        </div></section>}
      <section><div className="section-head"><div><span className="eyebrow">RECORDING QUALITY</span><h2>How reliable is this?</h2></div></div>
        <div className="metrics-card">
          <div className="metric"><div><strong>Athlete visible in frames</strong><b>{r.quality.detection_rate}%</b></div><div className="metric-bar"><span style={{ width: `${r.quality.detection_rate}%` }} /></div></div>
          <div className="metric"><div><strong>Image sharpness</strong><b>{r.quality.sharpness}%</b></div><div className="metric-bar"><span style={{ width: `${r.quality.sharpness}%` }} /></div></div>
          <div className="metric"><ul className="report-list">{r.quality.tips.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
        </div></section>
      <p className={r.meta.engine === "pose" ? "engine-badge pose" : "engine-badge"}>{r.meta.engine === "pose" ? "✓ Pose AI (MediaPipe) body tracking" : `Basic visual analysis - pose model unavailable${r.meta.engine_note ? `: ${r.meta.engine_note}` : ""}`}</p>
      <div className="evidence-row"><span><Icon name="video" size={16} /> {r.meta.type === "image" ? "Photo" : `${r.meta.duration_sec ? r.meta.duration_sec + "s video" : "Video"}${r.meta.frames_analysed ? ` · ${r.meta.frames_analysed} frames` : ""}`}</span><span><Icon name="check" size={16} /> {date}</span></div>
    </>
  );
}

function Report({ navigate, scout = false, result }: { navigate: (s: Screen) => void; scout?: boolean; result?: AssessmentResult | null }) {
  const full = result?.report;
  return (
    <main className="screen report-screen">
      <div className="page-title">
        <button className="back" onClick={() => navigate(scout ? "discover" : "home")} aria-label="Go back">‹</button>
        <div><span className="eyebrow">{scout ? "ATHLETE REPORT" : "AI PERFORMANCE REPORT"}</span><h1>{scout ? "Arjun Kumar" : result?.status === "rejected" ? "Assessment needs attention" : result?.filename ? "Your assessment" : "Kabaddi assessment"}</h1></div>
        <button className="icon-button" aria-label="Download report" onClick={() => result && downloadReport(result)} disabled={!full}><Icon name="upload" size={18} /></button>
      </div>
      <section className="report-hero">
        <div className="big-score"><span><strong>{result ? (result.talent_score ?? 0) : 82}</strong><small>/100</small></span><b>{result?.status === "rejected" ? "NOT ASSESSED" : full ? full.grade.toUpperCase() : result ? "ASSESSMENT SCORE" : "DEMO REPORT"}</b></div>
        <div className="report-summary"><span>{full ? `${full.meta.sport ?? ""} · PERFORMANCE`.toUpperCase() : result?.assessment || "KABADDI · PERFORMANCE"}</span><p>{result?.status === "rejected" ? (result.error || "No athlete detected. Please upload a clear photo or video with the athlete visible.") : full ? "Full feedback report generated from your recording. Use it as a training aid." : "This is sample report content. Upload a performance video to view backend results here."}</p></div>
      </section>
      {!full && <div className="evidence-row"><span><Icon name="spark" size={16} /> {result?.filename || "Sample report"}</span><span><Icon name="check" size={16} /> {result ? result.status : "Demo data"}</span></div>}
      {full && <FullReportView r={full} />}
      {result && !full && <section><div className="section-head"><div><span className="eyebrow">FEEDBACK</span><h2>Actionable observations</h2></div></div><div className="metrics-card">{(result.actionable_feedback || result.feedback || [result.error || "No feedback returned."]).map((item, i) => <div className="metric" key={`${i}-${item}`}><strong>{item}</strong></div>)}</div></section>}
      {!result && <section>
        <div className="section-head"><div><span className="eyebrow">SAMPLE PERFORMANCE BREAKDOWN</span><h2>Example observations</h2></div></div>
        <div className="metrics-card">
          {metrics.map((metric) => <div className="metric" key={metric.label}><div><strong>{metric.label}</strong><span>{metric.note}</span><b>{metric.score}</b></div><div className="metric-bar"><span style={{ width: `${metric.score}%` }} /></div></div>)}
        </div>
      </section>}
      {!result && <><section className="insight-card strength"><span className="insight-icon"><Icon name="spark" size={20} /></span><div><span className="eyebrow">KEY STRENGTH</span><h3>Sharp directional change</h3><p>Your centre of gravity stays controlled through cuts, helping you change direction 0.18s faster than your previous attempt.</p></div></section>
      <section className="insight-card improve"><span className="insight-icon"><Icon name="chart" size={20} /></span><div><span className="eyebrow">FOCUS AREA</span><h3>Post-raid recovery</h3><p>Your first three recovery steps lose momentum. Practise 5 × 10m resisted retreats twice weekly.</p></div></section>
      </>}
      {scout ? <button className="primary-button"><Icon name="bookmark" size={18} /> Save athlete to shortlist</button> : <button className="primary-button" onClick={() => navigate("assess")}><Icon name="video" size={18} /> Record another assessment</button>}
      <p className="method-note">This assessment supports development and scout evaluation. It is not a final selection or ranking.</p>
    </main>
  );
}

const athletes = [
  { name: "Arjun Kumar", place: "Rohtak, Haryana", sport: "KABADDI", detail: "Raider · U18", score: 82, image: kabaddiImage },
  { name: "Meera Yadav", place: "Jhansi, Uttar Pradesh", sport: "WRESTLING", detail: "Freestyle · 53kg", score: 87, image: wrestlingImage },
  { name: "Kavya Patil", place: "Satara, Maharashtra", sport: "SPRINT", detail: "100m · U20", score: 84, image: sprintImage },
];

function Discover({ navigate }: { navigate: (s: Screen) => void }) {
  const [filter, setFilter] = useState("All");
  const shown = filter === "All" ? athletes : athletes.filter((a) => a.sport.includes(filter.toUpperCase()));
  return (
    <main className="screen discover-screen">
      <section className="hello scout-hello"><div><span className="eyebrow">SCOUT WORKSPACE</span><h1>Discover talent</h1><p>Evidence-led prospects from across India.</p></div><button className="avatar">RS</button></section>
      <div className="search-box"><Icon name="search" size={19} /><input aria-label="Search athletes" placeholder="Search athlete, district or state" /></div>
      <div className="filter-row">
        {["All", "Kabaddi", "Wrestling", "Sprint"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}
      </div>
      <div className="discovery-summary"><span><strong>{shown.length}</strong> promising profiles</span><button>Filters <span className="filter-dot">2</span></button></div>
      <div className="athlete-list">
        {shown.map((athlete) => (
          <article className="athlete-card" key={athlete.name}>
            <button className="athlete-image" onClick={() => navigate("athlete")}><img src={athlete.image} alt={`${athlete.name}, ${athlete.sport} athlete`} /><span className="verified"><Icon name="check" size={11} /> AI VERIFIED</span></button>
            <div className="athlete-copy">
              <span className="sport-tag">{athlete.sport}</span><h2>{athlete.name}</h2><p>{athlete.detail}</p><small><Icon name="location" size={13} /> {athlete.place}</small>
              <button onClick={() => navigate("athlete")}>View evidence <Icon name="arrow" size={16} /></button>
            </div>
            <div className="mini-score"><strong>{athlete.score}</strong><span>ASSESSMENT</span></div>
            <button className="save-button" aria-label={`Save ${athlete.name}`}><Icon name="bookmark" size={18} /></button>
          </article>
        ))}
      </div>
      <div className="scout-note"><Icon name="shield" size={18} /><p><strong>Assessment, not ranking.</strong> Scores summarise demonstrated performance. Review full evidence before making decisions.</p></div>
    </main>
  );
}

function Profile({ role }: { role: Role }) {
  return (
    <main className="screen profile-screen">
      <div className="profile-cover"><span className="eyebrow">{role.toUpperCase()} PROFILE</span><div className="profile-avatar">{role === "athlete" ? "AK" : "RS"}</div></div>
      <h1>{role === "athlete" ? "Arjun Kumar" : "Rohit Sharma"}</h1>
      <p>{role === "athlete" ? "Kabaddi raider · Rohtak, Haryana" : "Regional sports scout · North India"}</p>
      <div className="profile-stats"><span><strong>{role === "athlete" ? "4" : "18"}</strong><small>{role === "athlete" ? "Assessments" : "Shortlisted"}</small></span><span><strong>{role === "athlete" ? "82" : "42"}</strong><small>{role === "athlete" ? "Best score" : "Profiles viewed"}</small></span><span><strong>100%</strong><small>Verified</small></span></div>
      <section className="settings-card">
        {["Personal details", "Sports profile", "Privacy & sharing", "Language preferences", "Help & support"].map((item) => <button key={item}><span>{item}</span><Icon name="chevron" size={16} /></button>)}
      </section>
    </main>
  );
}

function BottomNav({ role, screen, navigate }: { role: Role; screen: Screen; navigate: (s: Screen) => void }) {
  const athleteItems: [Screen, IconName, string][] = [["home", "home", "Home"], ["report", "chart", "Reports"], ["assess", "camera", "Assess"], ["profile", "user", "Profile"]];
  const scoutItems: [Screen, IconName, string][] = [["discover", "search", "Discover"], ["athlete", "chart", "Evidence"], ["profile", "bookmark", "Shortlist"], ["profile", "user", "Profile"]];
  const items = role === "athlete" ? athleteItems : scoutItems;
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {items.map(([target, icon, label], index) => {
        const active = screen === target || (role === "athlete" && target === "home" && screen === "assess");
        return <button key={`${label}-${index}`} className={active ? "active" : ""} onClick={() => navigate(target)}><span><Icon name={icon} size={20} /></span><small>{label}</small></button>;
      })}
    </nav>
  );
}

export default function App() {
  const [role, setRole] = useState<Role>("athlete");
  const [screen, setScreen] = useState<Screen>("home");
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

  function switchRole() {
    const next = role === "athlete" ? "scout" : "athlete";
    setRole(next);
    setScreen(next === "athlete" ? "home" : "discover");
  }

  function renderScreen() {
    if (screen === "assess") return <Assess navigate={setScreen} onResult={setAssessmentResult} />;
    if (screen === "report") return <Report navigate={setScreen} result={assessmentResult} />;
    if (screen === "athlete") return <Report navigate={setScreen} scout />;
    if (screen === "profile") return <Profile role={role} />;
    if (role === "scout" || screen === "discover") return <Discover navigate={setScreen} />;
    return <AthleteHome navigate={setScreen} />;
  }

  return (
    <div className="stage">
      <div className="phone-shell">
        <div className="status-bar"><span>9:41</span><span className="device-island" /><span className="status-icons">● ◔ ▰</span></div>
        <Header role={role} onToggle={switchRole} />
        <div className="scroll-area">{renderScreen()}</div>
        <BottomNav role={role} screen={screen} navigate={setScreen} />
      </div>
    </div>
  );
}
