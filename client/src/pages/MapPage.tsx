import React, { useState, useEffect } from 'react';
import { mapAPI } from '@/api';
import type { MapPin } from '@/types';
import { PuducherryMap } from '@/components/map/PuducherryMap';
import { WARDS, CATEGORY_CONFIG, PRIORITY_CONFIG } from '@/utils/constants';
import { Filter, Flame, Layers, MapPin as MapPinIcon, AlertTriangle } from 'lucide-react';

export const MapPage: React.FC = () => {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [wardBoundaries, setWardBoundaries] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    async function loadMapData() {
      try {
        const [pinsData, wardsData] = await Promise.all([
          mapAPI.getPins(),
          mapAPI.getWards(),
        ]);
        setPins(pinsData || []);
        setWardBoundaries(wardsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMapData();
  }, []);

  const filteredPins = pins.filter((p) => {
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (selectedPriority && p.priority !== selectedPriority) return false;
    if (selectedWard && p.ward !== selectedWard) return false;
    return true;
  });

  const criticalCount = filteredPins.filter((p) => p.priority === 'CRITICAL').length;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden bg-bg">
      
      {/* Sidebar Filter Panel */}
      <aside className="w-full md:w-80 bg-bg-surface border-r border-primary/20 p-4 flex flex-col gap-4 flex-shrink-0 overflow-y-auto">
        <div>
          <h2 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
            <MapPinIcon size={20} className="text-accent" />
            Puducherry Map GIS
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Interactive map with ward GeoJSON boundaries & AI priority glow
          </p>
        </div>

        {/* Critical Alert Bar */}
        {criticalCount > 0 && (
          <div className="p-3 bg-danger/15 border border-danger/40 rounded-xl flex items-center gap-2 text-xs font-bold text-danger animate-pulse">
            <AlertTriangle size={18} />
            <span>{criticalCount} CRITICAL Issues Pulsing on Map</span>
          </div>
        )}

        {/* Heatmap Toggle Button */}
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
            showHeatmap
              ? 'bg-warning/20 border-warning text-warning'
              : 'bg-bg-elevated border-primary/30 text-text-secondary hover:text-text-primary'
          }`}
        >
          <span className="flex items-center gap-2">
            <Flame size={16} />
            Hotspot Heatmap Overlay
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-primary/40">
            {showHeatmap ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Filters */}
        <div className="space-y-3 pt-2 border-t border-primary/10">
          <label className="block text-xs font-bold text-text-muted uppercase">Filter by Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field text-xs"
          >
            <option value="">All Categories ({pins.length})</option>
            {Object.entries(CATEGORY_CONFIG).map(([catKey, cfg]) => (
              <option key={catKey} value={catKey}>
                {cfg.emoji} {cfg.label}
              </option>
            ))}
          </select>

          <label className="block text-xs font-bold text-text-muted uppercase">Filter by Priority Glow</label>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="input-field text-xs font-semibold"
          >
            <option value="">All Priority Glows</option>
            <option value="CRITICAL">🔴 CRITICAL (Red Pulse)</option>
            <option value="HIGH">🟠 HIGH (Orange Glow)</option>
            <option value="MEDIUM">🟡 MEDIUM (Yellow Glow)</option>
            <option value="LOW">🟢 LOW (Green Glow)</option>
          </select>

          <label className="block text-xs font-bold text-text-muted uppercase">Filter by Ward Boundary</label>
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="input-field text-xs"
          >
            <option value="">All 10 Puducherry Wards</option>
            {WARDS.map((w) => (
              <option key={w} value={w}>
                {w} Ward
              </option>
            ))}
          </select>
        </div>

        {/* Selected Marker Preview Box */}
        {selectedPin && (
          <div className="mt-auto p-4 bg-bg-elevated border border-accent/40 rounded-xl text-xs space-y-2 animate-slide-up">
            <div className="flex items-center justify-between font-bold text-accent">
              <span>{CATEGORY_CONFIG[selectedPin.category]?.emoji} {selectedPin.category}</span>
              <span>{selectedPin.priority}</span>
            </div>
            <h4 className="font-bold text-text-primary text-sm line-clamp-1">{selectedPin.title}</h4>
            <p className="text-text-muted text-[11px]">Ward: {selectedPin.ward}</p>
          </div>
        )}
      </aside>

      {/* Main Leaflet Map View */}
      <main className="flex-1 h-full p-4 relative">
        <PuducherryMap
          pins={filteredPins}
          wardBoundaries={wardBoundaries}
          showHeatmap={showHeatmap}
          selectedWard={selectedWard}
          onPinClick={setSelectedPin}
        />
      </main>
    </div>
  );
};
