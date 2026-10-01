import React, { useState, useEffect } from 'react';
import { mapAPI } from '@/api';
import type { MapPin } from '@/types';
import { PuducherryMap } from '@/components/map/PuducherryMap';
import { WARDS, CATEGORY_CONFIG, PRIORITY_CONFIG } from '@/utils/constants';
import { PUDUCHERRY_AUTHENTIC_PINS, PUDUCHERRY_WARDS_GEOJSON } from '@/utils/mapFallbacks';
import { Filter, Flame, Layers, MapPin as MapPinIcon, AlertTriangle, Radio, RefreshCw, CheckCircle2 } from 'lucide-react';

export const MapPage: React.FC = () => {
  const [pins, setPins] = useState<MapPin[]>(PUDUCHERRY_AUTHENTIC_PINS);
  const [wardBoundaries, setWardBoundaries] = useState<any>(PUDUCHERRY_WARDS_GEOJSON);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  async function loadMapData() {
    setLoading(true);
    try {
      const [pinsData, wardsData] = await Promise.all([
        mapAPI.getPins().catch(() => null),
        mapAPI.getWards().catch(() => null),
      ]);
      if (pinsData && Array.isArray(pinsData) && pinsData.length > 0) {
        setPins(pinsData);
        setIsLive(true);
      } else {
        setPins(PUDUCHERRY_AUTHENTIC_PINS);
        setIsLive(false);
      }
      setWardBoundaries(
        wardsData && wardsData.features?.length > 0 ? wardsData : PUDUCHERRY_WARDS_GEOJSON
      );
    } catch (err) {
      console.warn('Using authentic local GIS map dataset:', err);
      setPins(PUDUCHERRY_AUTHENTIC_PINS);
      setWardBoundaries(PUDUCHERRY_WARDS_GEOJSON);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
              <MapPinIcon size={20} className="text-accent" />
              Puducherry Map GIS
            </h2>
            <button
              onClick={loadMapData}
              title="Refresh GIS Pin Data"
              className="p-1 rounded-lg hover:bg-primary/20 text-text-muted hover:text-accent transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Interactive GIS plotting across all 10 Puducherry Wards with priority glow
          </p>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-bg-elevated border border-primary/20 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-success animate-pulse' : 'bg-accent'}`} />
            <span className="font-semibold text-text-primary">
              {isLive ? 'Live API Synchronized' : 'Offline-Resilient GIS'}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent font-bold text-[10px]">
            {filteredPins.length} Plotted
          </span>
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

        {/* Quick Filter Chips */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-text-muted uppercase">Quick Focus</label>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              onClick={() => { setSelectedCategory(''); setSelectedPriority(''); setSelectedWard(''); }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                !selectedCategory && !selectedPriority && !selectedWard
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-bg-elevated border border-primary/20 text-text-muted hover:text-text-primary'
              }`}
            >
              All ({pins.length})
            </button>
            <button
              onClick={() => { setSelectedPriority('CRITICAL'); setSelectedCategory(''); }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedPriority === 'CRITICAL'
                  ? 'bg-danger text-white shadow-sm'
                  : 'bg-bg-elevated border border-primary/20 text-danger hover:bg-danger/10'
              }`}
            >
              🔴 Critical
            </button>
            <button
              onClick={() => { setSelectedCategory('ROADS'); setSelectedPriority(''); }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedCategory === 'ROADS'
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-bg-elevated border border-primary/20 text-text-secondary hover:text-text-primary'
              }`}
            >
              🛣️ Roads
            </button>
            <button
              onClick={() => { setSelectedCategory('WATER'); setSelectedPriority(''); }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedCategory === 'WATER'
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-bg-elevated border border-primary/20 text-text-secondary hover:text-text-primary'
              }`}
            >
              💧 Water
            </button>
            <button
              onClick={() => { setSelectedCategory('WASTE'); setSelectedPriority(''); }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedCategory === 'WASTE'
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-bg-elevated border border-primary/20 text-text-secondary hover:text-text-primary'
              }`}
            >
              🗑️ Waste
            </button>
          </div>
        </div>

        {/* Detailed Filters */}
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
              <span className={`px-2 py-0.5 rounded text-[10px] ${
                selectedPin.priority === 'CRITICAL' ? 'bg-danger/20 text-danger' :
                selectedPin.priority === 'HIGH' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
              }`}>{selectedPin.priority}</span>
            </div>
            <h4 className="font-bold text-text-primary text-sm line-clamp-2">{selectedPin.title}</h4>
            <p className="text-text-muted text-[11px]">Ward: <strong>{selectedPin.ward}</strong></p>
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
