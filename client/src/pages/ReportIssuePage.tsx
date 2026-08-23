import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { issuesAPI } from '@/api';
import { CATEGORY_CONFIG, WARDS, PUDUCHERRY_CENTER } from '@/utils/constants';
import type { IssueCategory, AreaType, HecticLevel } from '@/types';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Sparkles, MapPin, Camera, Lock, CheckCircle2, ArrowLeft, ArrowRight, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

function LocationMarker({ position, setPosition }: { position: [number, number]; setPosition: (p: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  const markerIcon = L.divIcon({
    className: 'custom-pin-marker',
    html: `<div style="background:#22A66A; width:28px; height:28px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(34,166,106,0.8);"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

export const ReportIssuePage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<IssueCategory>('ROADS');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ward, setWard] = useState(WARDS[0]);
  const [position, setPosition] = useState<[number, number]>(PUDUCHERRY_CENTER);
  const [areaType, setAreaType] = useState<AreaType>('RESIDENTIAL');
  const [hecticLevel, setHecticLevel] = useState<HecticLevel>('MODERATE');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<{ id: string; trackingToken?: string } | null>(null);

  const navigate = useNavigate();

  const handleGPSDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        toast.success('GPS Location Detected!');
      });
    } else {
      toast.error('Geolocation is not supported by your browser');
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
        area_type: areaType,
        hectic_level: hecticLevel,
        is_anonymous: isAnonymous,
      });

      setSuccessResult({ id: res.id, trackingToken: res.tracking_token });
      toast.success('Issue submitted successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to submit issue');
    } finally {
      setLoading(false);
    }
  };

  if (successResult) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="card p-8 border-accent/40 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center text-accent mx-auto mb-4">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-2xl font-extrabold mb-2">Report Submitted!</h2>
          <p className="text-xs text-text-muted mb-6">
            ML classifier is analyzing category & priority (~2 seconds). The ward NGO will verify your issue shortly.
          </p>

          {successResult.trackingToken && (
            <div className="p-4 bg-bg-elevated border-2 border-warning/50 rounded-xl mb-6 text-left">
              <span className="text-xs font-bold text-warning flex items-center gap-1 mb-1">
                <ShieldAlert size={14} /> Anonymous 6-Digit Tracking Token:
              </span>
              <div className="text-2xl font-mono font-black text-warning tracking-widest text-center py-2 bg-black/40 rounded-lg">
                {successResult.trackingToken}
              </div>
              <p className="text-[10px] text-text-muted mt-2 text-center">
                Save this token! Plaintext is NOT stored (bcrypt hash only). Use it on /track to check status.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={() => navigate('/feed')} className="flex-1">
              View Feed
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/issues/${successResult.id}`)} className="flex-1">
              View Detail
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      
      {/* Wizard Progress Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold mb-2">Report a Civic Issue</h1>
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between max-w-xl mx-auto mt-4 text-xs font-semibold text-text-muted">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`flex items-center gap-1 ${step >= s ? 'text-accent' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                  step === s
                    ? 'bg-accent text-white border-accent'
                    : step > s
                    ? 'bg-accent/20 text-accent border-accent/40'
                    : 'bg-bg-surface border-primary/30'
                }`}
              >
                {s}
              </div>
              <span className="hidden sm:inline">
                {s === 1 ? 'Category' : s === 2 ? 'Details' : s === 3 ? 'Map Pin' : s === 4 ? 'Photos' : 'Privacy'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Contents */}
      <div className="card p-6 shadow-2xl">
        
        {/* STEP 1: Category Selection */}
        {step === 1 && (
          <div>
            <h3 className="text-lg font-bold mb-4">Step 1: Select Issue Category</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.entries(CATEGORY_CONFIG) as [IssueCategory, typeof CATEGORY_CONFIG.ROADS][]).map(
                ([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setCategory(key)}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                      category === key
                        ? 'bg-accent/20 border-accent text-accent shadow-lg shadow-accent/10 scale-105'
                        : 'bg-bg-elevated border-primary/20 hover:border-primary/40 text-text-primary'
                    }`}
                  >
                    <span className="text-3xl">{cfg.emoji}</span>
                    <span className="text-xs font-bold">{cfg.label}</span>
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Title & Description */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold mb-2">Step 2: Title & Description</h3>
            
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Ward Location</label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="input-field font-semibold text-accent"
              >
                {WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w} Ward
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Title (English or Tamil)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Deep pothole on MG Road near junction"
                className="input-field font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Detailed Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the issue, exact location landmarks, and safety hazard..."
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Area Type (Location Weight)</label>
                <select
                  value={areaType}
                  onChange={(e) => setAreaType(e.target.value as AreaType)}
                  className="input-field text-xs"
                >
                  <option value="HIGHWAY">Highway (30 pts weight)</option>
                  <option value="SCHOOL_HOSPITAL">School / Hospital (28 pts)</option>
                  <option value="COMMERCIAL">Commercial Zone (25 pts)</option>
                  <option value="INDUSTRIAL">Industrial Zone (20 pts)</option>
                  <option value="RESIDENTIAL">Residential Area (15 pts)</option>
                  <option value="RURAL">Rural Area (10 pts)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Hectic Level (Crowd Density)</label>
                <select
                  value={hecticLevel}
                  onChange={(e) => setHecticLevel(e.target.value as HecticLevel)}
                  className="input-field text-xs"
                >
                  <option value="EXTREMELY_BUSY">Extremely Busy (30 pts)</option>
                  <option value="BUSY">Busy (22 pts)</option>
                  <option value="MODERATE">Moderate (15 pts)</option>
                  <option value="LOW">Low (8 pts)</option>
                  <option value="VERY_LOW">Very Low (3 pts)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Leaflet Pin Drop */}
        {step === 3 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">Step 3: Drop Pin on Leaflet Map</h3>
              <Button size="sm" variant="secondary" onClick={handleGPSDetect}>
                <MapPin size={14} /> Detect My GPS
              </Button>
            </div>
            <div className="h-80 rounded-xl overflow-hidden border border-primary/30 mb-2">
              <MapContainer center={position} zoom={13} style={{ width: '100%', height: '100%' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>
            <p className="text-[11px] text-text-muted">
              Click anywhere on the map to pin exact coordinates: [{position[0].toFixed(4)}, {position[1].toFixed(4)}]
            </p>
          </div>
        )}

        {/* STEP 4: Photos */}
        {step === 4 && (
          <div className="text-center py-8">
            <Camera size={48} className="text-accent mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-1">Step 4: Attach Photo Proof (Optional)</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto mb-4">
              Photos increase AI priority confidence score. EXIF metadata (GPS, device info) is automatically stripped before saving.
            </p>
            <input type="file" accept="image/*" className="hidden" id="photo-upload" />
            <label
              htmlFor="photo-upload"
              className="btn-secondary text-xs inline-flex items-center gap-2 cursor-pointer"
            >
              Upload Photo (Max 5MB)
            </label>
          </div>
        )}

        {/* STEP 5: Privacy Toggle */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Step 5: Privacy Settings</h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setIsAnonymous(false)}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  !isAnonymous
                    ? 'bg-accent/15 border-accent text-text-primary ring-2 ring-accent'
                    : 'bg-bg-elevated border-primary/20 text-text-muted'
                }`}
              >
                <div className="font-bold text-sm text-accent mb-1">Public Report 👤</div>
                <p className="text-xs text-text-secondary leading-relaxed mb-2">
                  Your profile name will appear on the post. You will earn +10 EcoScore points for submitting.
                </p>
                <span className="text-[10px] text-accent font-semibold">+10 EcoScore Pts</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAnonymous(true)}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  isAnonymous
                    ? 'bg-warning/15 border-warning text-text-primary ring-2 ring-warning'
                    : 'bg-bg-elevated border-primary/20 text-text-muted'
                }`}
              >
                <div className="font-bold text-sm text-warning mb-1">Anonymous Report 🎭</div>
                <p className="text-xs text-text-secondary leading-relaxed mb-2">
                  Zero-Knowledge Safety. Identity is technically unrecoverable. Receive a 6-digit tracking token.
                </p>
                <span className="text-[10px] text-warning font-semibold">Zero-Knowledge Protected</span>
              </button>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-primary/20">
          {step > 1 ? (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              <ArrowLeft size={16} /> Back
            </Button>
          ) : <div />}

          {step < 5 ? (
            <Button onClick={() => setStep(step + 1)}>
              Next Step <ArrowRight size={16} />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="px-8 shadow-xl shadow-accent/25">
              {loading ? 'Submitting & Classifying...' : 'Submit Issue to Ward NGO'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
