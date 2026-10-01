import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { issuesAPI, mlAPI } from '@/api';
import { CATEGORY_CONFIG, WARDS, PUDUCHERRY_CENTER } from '@/utils/constants';
import type { IssueCategory } from '@/types';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Sparkles, MapPin, Camera, Lock, CheckCircle2, ArrowLeft, ArrowRight,
  ShieldAlert, X, Upload, Eye, AlertTriangle, ShieldCheck, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CameraCaptureModal } from '@/components/common/CameraCaptureModal';
import toast from 'react-hot-toast';

function LocationMarker({ position, setPosition }: { position: [number, number]; setPosition: (p: [number, number]) => void }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map]);

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  const markerIcon = L.divIcon({
    className: 'custom-pin-marker',
    html: `<div style="background:#22A66A; width:28px; height:28px; border-radius:50%; border:3px solid white; box-shadow:0 0 12px rgba(34,166,106,0.9); display:flex; align-items:center; justify-content:center; color:white; font-size:12px;">📍</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

export const ReportIssuePage: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<IssueCategory>('ROADS');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ward, setWard] = useState(WARDS[0]);
  const [position, setPosition] = useState<[number, number]>(PUDUCHERRY_CENTER);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [validatingVision, setValidatingVision] = useState(false);
  const [visionAnalysis, setVisionAnalysis] = useState<{
    valid: boolean;
    badge: string;
    scene_detected: string;
    summary: string;
    flag?: string | null;
  } | null>(null);
  const [successResult, setSuccessResult] = useState<{ id: string; trackingToken?: string; aiVision?: any } | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{ category: IssueCategory; confidence: number } | null>(null);
  const [naturalQuery, setNaturalQuery] = useState('');
  const [isClassifying, setIsClassifying] = useState(false);

  const navigate = useNavigate();

  const handleAIClassify = async (text: string) => {
    if (!text || text.trim().length < 3) return;
    setIsClassifying(true);
    try {
      const res = await mlAPI.classifyText(text);
      if (res && res.category) {
        const cat = res.category as IssueCategory;
        setAiSuggestion({ category: cat, confidence: res.confidence || 0.95 });
        setCategory(cat);
        toast.success(`✨ AI Auto-Selected: ${CATEGORY_CONFIG[cat]?.label || cat} (${Math.round((res.confidence || 0.95) * 100)}%)`);
      }
    } catch {
      // ignore
    } finally {
      setIsClassifying(false);
    }
  };

  // Run AI Vision consistency pre-check on photo upload
  const runVisionCheck = async (imgData: string, selectedCat: string, currentTitle: string, currentDesc: string) => {
    setValidatingVision(true);
    try {
      const res = await mlAPI.validateImage({
        image: imgData,
        category: selectedCat,
        title: currentTitle,
        description: currentDesc,
      });
      setVisionAnalysis(res.data);
      if (res.data.flag) {
        toast((t) => (
          <div className="flex items-start gap-2">
            <AlertTriangle className="text-warning shrink-0 mt-0.5" size={16} />
            <div className="text-xs">
              <p className="font-bold text-text-primary">AI Vision Discrepancy Note</p>
              <p className="text-text-muted">{res.data.flag}</p>
            </div>
          </div>
        ), { duration: 5000 });
      } else {
        toast.success(`AI Vision Verified: ${res.data.scene_detected}`);
      }
    } catch {
      // fallback
    } finally {
      setValidatingVision(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const img = reader.result as string;
        setAttachments([img]);
        runVisionCheck(img, category, title, description);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGPSDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        toast.success('GPS Location Detected!');
      });
    } else {
      toast.error('Geolocation is not supported');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Please enter a title and description');
      return;
    }
    setLoading(true);

    try {
      const res = await issuesAPI.create({
        title,
        description,
        category,
        ward,
        latitude: position[0],
        longitude: position[1],
        is_anonymous: isAnonymous,
        attachments,
      });

      setSuccessResult({
        id: res.id,
        trackingToken: res.tracking_token,
        aiVision: res.ai_vision,
      });
      toast.success('Issue submitted successfully! 🎉');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to submit issue');
    } finally {
      setLoading(false);
    }
  };

  if (successResult) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-8 text-center border-accent/40 shadow-2xl space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-accent to-primary mx-auto flex items-center justify-center shadow-xl shadow-accent/30 text-3xl">
            🎉
          </div>
          <div>
            <h2 className="text-2xl font-black text-text-primary">Report Registered!</h2>
            <p className="text-xs text-text-muted mt-1">
              Your civic report is now tracked with AI Decision Support.
            </p>
          </div>

          {successResult.aiVision && (
            <div className={`p-4 rounded-2xl border text-left text-xs space-y-1 ${
              successResult.aiVision.valid ? 'bg-success/10 border-success/30' : 'bg-warning/10 border-warning/30'
            }`}>
              <div className="flex items-center gap-1.5 font-bold">
                {successResult.aiVision.valid ? <ShieldCheck size={14} className="text-success" /> : <AlertTriangle size={14} className="text-warning" />}
                <span className={successResult.aiVision.valid ? 'text-success' : 'text-warning'}>
                  {successResult.aiVision.badge} ({successResult.aiVision.scene_detected})
                </span>
              </div>
              <p className="text-text-secondary">{successResult.aiVision.summary}</p>
            </div>
          )}

          {successResult.trackingToken && (
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 text-left space-y-2">
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest block">Anonymous Tracking Token</span>
              <div className="font-mono text-lg font-black text-accent bg-bg-surface px-3 py-2 rounded-xl border border-primary/20 text-center tracking-widest select-all">
                {successResult.trackingToken}
              </div>
              <p className="text-[11px] text-text-muted">Save this code to check your report status without logging in.</p>
            </div>
          )}

          <div className="flex gap-3">
            <Link to="/feed" className="btn-primary flex-1 py-3 text-center text-sm font-bold">
              View Community Feed →
            </Link>
            <Link to={`/issues/${successResult.id}`} className="btn-secondary flex-1 py-3 text-center text-sm font-bold">
              Issue Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-8 px-4 flex flex-col items-center">
      <div className="max-w-xl w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-text-primary">
            Report an <span className="text-accent">Issue</span>
          </h1>
          <p className="text-xs text-text-muted mt-1">Smart, verified civic reporting for Puducherry</p>
        </div>

        {/* Clean Step Indicator */}
        <div className="flex items-center justify-between mb-6 px-4">
          {[
            { s: 1, label: 'Category' },
            { s: 2, label: 'Photo Proof' },
            { s: 3, label: 'Details & Location' },
          ].map(({ s, label }) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step === s ? 'bg-accent text-white shadow-md shadow-accent/40 ring-2 ring-accent/30' :
                step > s ? 'bg-success text-white' : 'bg-bg-elevated border border-primary/30 text-text-muted'
              }`}>
                {step > s ? '✓' : s}
              </div>
              <span className={`text-[11px] font-bold hidden sm:inline ${step === s ? 'text-accent' : 'text-text-muted'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Step Card Container */}
        <div className="bg-bg-surface/90 backdrop-blur-xl border border-primary/20 rounded-3xl p-6 shadow-2xl shadow-black/40">
          
          {/* STEP 1: CATEGORY PICKER */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-base font-extrabold text-text-primary flex items-center gap-2">
                  What type of issue is this?
                </h3>
                <p className="text-xs text-text-muted">Select manually below or let our AI auto-classify your issue description.</p>
              </div>

              {/* AI Auto-Categorize Smart Bar */}
              <div className="p-3.5 rounded-2xl bg-accent/10 border border-accent/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-accent flex items-center gap-1.5">
                    <Sparkles size={14} className="animate-pulse" /> AI Smart Classifier (English / தமிழ்)
                  </span>
                  {aiSuggestion && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-bold">
                      Confidence: {Math.round(aiSuggestion.confidence * 100)}%
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={naturalQuery}
                    onChange={(e) => setNaturalQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAIClassify(naturalQuery))}
                    placeholder="Describe issue (e.g. Broken pothole on Airport Road / குடிநீர் கசிவு)"
                    className="input-field text-xs flex-1 bg-bg-surface"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAIClassify(naturalQuery)}
                    disabled={isClassifying || !naturalQuery.trim()}
                    className="text-xs px-3 shadow-md"
                  >
                    {isClassifying ? 'Analyzing...' : 'AI Classify ✨'}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-text-muted">
                  <span className="font-medium text-text-secondary">Try sample:</span>
                  {[
                    'Deep pothole causing vehicle accidents',
                    'Drinking water pipe leakage on street',
                    'Commercial vegetable waste dumped',
                    'Street lamp broken pitch dark at night',
                  ].map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => {
                        setNaturalQuery(sample);
                        handleAIClassify(sample);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-bg-surface hover:bg-primary/20 border border-primary/20 text-text-muted hover:text-accent transition-colors"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key as IssueCategory)}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border transition-all ${
                      category === key
                        ? 'border-accent bg-accent/15 shadow-lg shadow-accent/20 scale-[1.02]'
                        : 'border-primary/20 bg-bg/50 hover:border-accent/40 hover:bg-bg-elevated'
                    }`}
                  >
                    <span className="text-2xl">{config.emoji}</span>
                    <span className="text-xs font-extrabold text-text-primary text-center">{config.label}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-primary w-full py-3.5 mt-4 flex items-center justify-center gap-2 font-bold text-sm"
              >
                Next: Photo Proof <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 2: PHOTO PROOF & AI VISION SCAN */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-base font-extrabold text-text-primary flex items-center gap-2">
                  <Camera className="text-accent" size={18} /> Attach Photo Proof
                </h3>
                <p className="text-xs text-text-muted">
                  Capture live photo or upload an image. AI validates scene context in real time.
                </p>
              </div>

              {/* Upload buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="p-5 rounded-2xl border-2 border-dashed border-accent/50 bg-accent/10 hover:bg-accent/20 transition-all flex flex-col items-center gap-2 text-center group"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera size={20} className="text-accent" />
                  </div>
                  <span className="text-xs font-bold text-text-primary">Snap Camera</span>
                  <span className="text-[10px] text-text-muted">Live Geotagged</span>
                </button>

                <label className="p-5 rounded-2xl border-2 border-dashed border-primary/30 bg-bg/50 hover:border-primary/60 transition-all flex flex-col items-center gap-2 text-center cursor-pointer group">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload size={20} className="text-text-muted group-hover:text-text-primary" />
                  </div>
                  <span className="text-xs font-bold text-text-primary">Upload File</span>
                  <span className="text-[10px] text-text-muted">Gallery / Files</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              {/* Attached Image Preview + AI Vision Analysis Card */}
              {attachments.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="relative rounded-2xl overflow-hidden border border-accent/40 h-52 bg-black">
                    <img src={attachments[0]} alt="Evidence Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setAttachments([]); setVisionAnalysis(null); }}
                      className="absolute top-3 right-3 bg-black/70 text-white p-1.5 rounded-full hover:bg-black"
                    >
                      <X size={16} />
                    </button>
                    {validatingVision && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-2 text-xs text-white">
                        <Sparkles size={16} className="animate-spin text-accent" /> AI Vision Scanning Evidence…
                      </div>
                    )}
                  </div>

                  {visionAnalysis && (
                    <div className={`p-4 rounded-2xl border text-xs space-y-3 ${
                      visionAnalysis.valid ? 'bg-success/10 border-success/30' : 'bg-warning/10 border-warning/30'
                    }`}>
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold flex items-center gap-1.5">
                          {visionAnalysis.valid ? <ShieldCheck size={14} className="text-success" /> : <AlertTriangle size={14} className="text-warning" />}
                          <span className={visionAnalysis.valid ? 'text-success' : 'text-warning'}>
                            {visionAnalysis.badge}
                          </span>
                        </span>
                        <span className="text-[10px] text-text-muted">AI Evidence Check</span>
                      </div>

                      {/* Severity Meter */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Evidence Severity</span>
                          <span className={`text-xs font-black ${
                            (visionAnalysis as any).evidence_score >= 0.85 ? 'text-success' :
                            (visionAnalysis as any).evidence_score >= 0.65 ? 'text-accent' :
                            (visionAnalysis as any).evidence_score >= 0.45 ? 'text-warning' : 'text-danger'
                          }`}>
                            {((visionAnalysis as any).evidence_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="severity-meter">
                          <div
                            className={`severity-meter-fill ${
                              (visionAnalysis as any).evidence_score >= 0.85 ? 'severity-low' :
                              (visionAnalysis as any).evidence_score >= 0.65 ? 'bg-accent shadow-accent/50' :
                              (visionAnalysis as any).evidence_score >= 0.45 ? 'severity-medium' : 'severity-critical'
                            }`}
                            style={{ width: `${((visionAnalysis as any).evidence_score || 0) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Feature Breakdown */}
                      {(visionAnalysis as any).features && (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-primary/15">
                          {[
                            { label: 'Texture', value: (visionAnalysis as any).features.texture_roughness, icon: '🔲' },
                            { label: 'Edge Density', value: (visionAnalysis as any).features.edge_density, icon: '📐' },
                            { label: 'Sharpness', value: (visionAnalysis as any).features.sharpness, icon: '🔍' },
                            { label: 'Luminance', value: Math.min((visionAnalysis as any).features.luminance / 255, 1), icon: '💡' },
                          ].map(({ label, value, icon }) => (
                            <div key={label} className="flex items-center gap-2">
                              <span className="text-xs">{icon}</span>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <span className="text-[10px] text-text-muted">{label}</span>
                                  <span className="text-[10px] font-bold text-text-primary">{(value * 100).toFixed(0)}%</span>
                                </div>
                                <div className="h-1 bg-primary/20 rounded-full overflow-hidden mt-0.5">
                                  <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: `${value * 100}%` }} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Scene & Summary */}
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="px-2 py-0.5 rounded-full bg-primary/20 text-text-muted font-semibold">{visionAnalysis.scene_detected}</span>
                        {(visionAnalysis as any).features?.is_blurry && (
                          <span className="px-2 py-0.5 rounded-full bg-warning/20 text-warning font-semibold">Blurry</span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-secondary leading-relaxed">{visionAnalysis.summary}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1 py-3.5 font-bold text-xs"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-primary flex-[2] py-3.5 font-bold text-xs flex items-center justify-center gap-2"
                >
                  Next: Details & Location <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DETAILS & LOCATION (AI HANDLES HECTICITY/PRIORITY AUTOMATICALLY) */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-base font-extrabold text-text-primary">Describe & Locate Issue</h3>
                <p className="text-xs text-text-muted">AI will calculate priority score & area context automatically.</p>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Large pothole near White Town junction"
                  className="input-field text-sm"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the issue and how it affects citizens..."
                  className="input-field text-sm resize-none"
                  required
                />
              </div>

              {/* Ward & Anonymous Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Puducherry Ward</label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="input-field text-xs font-semibold text-accent"
                  >
                    {WARDS.map((w) => (
                      <option key={w} value={w}>{w} Ward</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Privacy</label>
                  <button
                    type="button"
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`w-full py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isAnonymous ? 'border-accent bg-accent/20 text-accent' : 'border-primary/20 bg-bg text-text-muted'
                    }`}
                  >
                    <Lock size={12} /> {isAnonymous ? 'Anonymous 🎭' : 'Public Profile'}
                  </button>
                </div>
              </div>

              {/* Location Pin & Map */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-1">
                    <MapPin size={12} className="text-accent" /> Pin Exact Location
                  </label>
                  <button
                    type="button"
                    onClick={handleGPSDetect}
                    className="text-[11px] text-accent hover:underline font-bold"
                  >
                    📍 Use My GPS
                  </button>
                </div>

                <div className="h-44 rounded-2xl overflow-hidden border border-primary/30 relative bg-[#e5e3df]">
                  <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%', background: '#e5e3df' }}>
                    <TileLayer
                      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                      maxZoom={19}
                    />
                    <LocationMarker position={position} setPosition={setPosition} />
                  </MapContainer>
                </div>
              </div>

              {/* AI Auto-Score Assurance */}
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-2.5 text-xs text-text-muted">
                <Zap size={16} className="text-accent shrink-0" />
                <span>
                  <strong>AI Scoring Active:</strong> Location priority and urgency will be calculated automatically by CiviTrack AI.
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-secondary flex-1 py-3.5 font-bold text-xs"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !title.trim() || !description.trim()}
                  className="btn-primary flex-[2] py-3.5 font-extrabold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? 'Submitting Report…' : 'Publish Civic Report 🚀'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(img) => {
          setAttachments([img]);
          setIsCameraOpen(false);
          runVisionCheck(img, category, title, description);
        }}
        locationName={`${ward} Ward`}
      />
    </div>
  );
};
