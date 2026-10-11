import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mapAPI } from '@/api';
import type { MapPin } from '@/types';
import { PuducherryMap } from '@/components/map/PuducherryMap';
import { WARDS, CATEGORY_CONFIG, PRIORITY_CONFIG } from '@/utils/constants';
import { PUDUCHERRY_AUTHENTIC_PINS, PUDUCHERRY_WARDS_GEOJSON } from '@/utils/mapFallbacks';
import { Filter, Flame, Layers, MapPin as MapPinIcon, AlertTriangle, Radio, RefreshCw, CheckCircle2, X, ArrowRight } from 'lucide-react';

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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

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
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden bg-bg relative">
      
      {/* ═══ DESKTOP SIDEBAR FILTER PANEL (Hidden on Mobile) ═══ */}
      <aside className="hidden md:flex w-80 bg-bg-surface border-r border-primary/20 p-4 flex-col gap-4 flex-shrink-0 overflow-y-auto">
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
          <span className="text-[10px] px-2 py-0.5 rounded bg-primary/40 font-mono">
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
              onClick={() => { setSelectedPriority(selectedPriority === 'CRITICAL' ? '' : 'CRITICAL'); setSelectedCategory(''); }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedPriority === 'CRITICAL'
                  ? 'bg-danger text-white shadow-sm'
                  : 'bg-bg-elevated border border-primary/20 text-danger hover:bg-danger/10'
              }`}
            >
              🔴 Critical
            </button>
            <button
              onClick={() => { setSelectedCategory(selectedCategory === 'ROADS' ? '' : 'ROADS'); setSelectedPriority(''); }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedCategory === 'ROADS'
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-bg-elevated border border-primary/20 text-text-secondary hover:text-text-primary'
              }`}
            >
              🛣️ Roads
            </button>
            <button
              onClick={() => { setSelectedCategory(selectedCategory === 'WATER' ? '' : 'WATER'); setSelectedPriority(''); }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedCategory === 'WATER'
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-bg-elevated border border-primary/20 text-text-secondary hover:text-text-primary'
              }`}
            >
              💧 Water
            </button>
            <button
              onClick={() => { setSelectedCategory(selectedCategory === 'WASTE' ? '' : 'WASTE'); setSelectedPriority(''); }}
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

        {/* Desktop Selected Marker Preview Box */}
        {selectedPin && (
          <div className="mt-auto p-4 bg-bg-elevated border border-accent/40 rounded-xl text-xs space-y-2 animate-slide-up shadow-lg">
            <div className="flex items-center justify-between font-bold text-accent">
              <span>{CATEGORY_CONFIG[selectedPin.category]?.emoji} {selectedPin.category}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] ${
                selectedPin.priority === 'CRITICAL' ? 'bg-danger/20 text-danger' :
                selectedPin.priority === 'HIGH' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
              }`}>{selectedPin.priority}</span>
            </div>
            <h4 className="font-bold text-text-primary text-sm line-clamp-2">{selectedPin.title}</h4>
            <div className="flex items-center justify-between pt-1">
              <span className="text-text-muted text-[11px]">Ward: <strong>{selectedPin.ward}</strong></span>
              <Link to={`/issues/${selectedPin.id}`} className="text-accent hover:underline font-bold flex items-center gap-1">
                Details <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* ═══ MOBILE TOP FLOATING FILTER BAR ═══ */}
      <div className="md:hidden absolute top-3 left-3 right-3 z-30 flex items-center gap-2 pointer-events-none">
        {/* Horizontal Quick Focus Scrolling Pills */}
        <div className="flex-1 flex items-center gap-1.5 overflow-x-auto py-1 px-2.5 rounded-2xl bg-bg-surface/90 backdrop-blur-xl border border-primary/30 shadow-xl pointer-events-auto scrollbar-none">
          <button
            onClick={() => { setSelectedCategory(''); setSelectedPriority(''); setSelectedWard(''); }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              !selectedCategory && !selectedPriority && !selectedWard
                ? 'bg-accent text-white shadow-md'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            All ({filteredPins.length})
          </button>
          <button
            onClick={() => setSelectedPriority(selectedPriority === 'CRITICAL' ? '' : 'CRITICAL')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedPriority === 'CRITICAL'
                ? 'bg-danger text-white shadow-md'
                : 'text-danger hover:bg-danger/10'
            }`}
          >
            🔴 Critical
          </button>
          <button
            onClick={() => setSelectedCategory(selectedCategory === 'ROADS' ? '' : 'ROADS')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'ROADS'
                ? 'bg-accent text-white shadow-md'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            🛣️ Roads
          </button>
          <button
            onClick={() => setSelectedCategory(selectedCategory === 'WATER' ? '' : 'WATER')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'WATER'
                ? 'bg-accent text-white shadow-md'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            💧 Water
          </button>
          <button
            onClick={() => setSelectedCategory(selectedCategory === 'WASTE' ? '' : 'WASTE')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'WASTE'
                ? 'bg-accent text-white shadow-md'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            🗑️ Waste
          </button>
        </div>

        {/* Heatmap Toggle Button */}
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`p-2.5 rounded-2xl border shadow-xl pointer-events-auto transition-all ${
            showHeatmap
              ? 'bg-warning text-black border-warning shadow-warning/30'
              : 'bg-bg-surface/90 backdrop-blur-xl border-primary/30 text-text-secondary'
          }`}
          title="Toggle Heatmap"
        >
          <Flame size={16} />
        </button>

        {/* More Filters Toggle */}
        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className={`p-2.5 rounded-2xl border shadow-xl pointer-events-auto transition-all ${
            mobileDrawerOpen || selectedWard
              ? 'bg-accent text-white border-accent shadow-accent/30'
              : 'bg-bg-surface/90 backdrop-blur-xl border-primary/30 text-text-secondary'
          }`}
          title="Filter by Ward & Priority"
        >
          <Filter size={16} />
        </button>
      </div>

      {/* ═══ MOBILE FILTER MODAL / DRAWER ═══ */}
      {mobileDrawerOpen && (
        <div className="md:hidden absolute inset-x-3 top-16 z-40 bg-bg-surface/95 backdrop-blur-2xl border border-primary/30 rounded-3xl p-5 shadow-2xl animate-slide-up space-y-4">
          <div className="flex items-center justify-between border-b border-primary/20 pb-3">
            <span className="font-extrabold text-sm text-text-primary flex items-center gap-2">
              <Filter size={16} className="text-accent" /> Filter Map Issues
            </span>
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="p-1 rounded-lg hover:bg-primary/20 text-text-muted"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-text-muted uppercase mb-1">Ward Area</label>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="input-field text-xs"
              >
                <option value="">All 10 Puducherry Wards</option>
                {WARDS.map((w) => (
                  <option key={w} value={w}>{w} Ward</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-muted uppercase mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field text-xs"
              >
                <option value="">All Categories ({pins.length})</option>
                {Object.entries(CATEGORY_CONFIG).map(([catKey, cfg]) => (
                  <option key={catKey} value={catKey}>{cfg.emoji} {cfg.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-muted uppercase mb-1">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="input-field text-xs font-semibold"
              >
                <option value="">All Priorities</option>
                <option value="CRITICAL">🔴 CRITICAL</option>
                <option value="HIGH">🟠 HIGH</option>
                <option value="MEDIUM">🟡 MEDIUM</option>
                <option value="LOW">🟢 LOW</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setSelectedCategory(''); setSelectedPriority(''); setSelectedWard(''); setMobileDrawerOpen(false); }}
                className="btn-secondary flex-1 py-2.5 text-xs font-bold"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="btn-primary flex-1 py-2.5 text-xs font-bold"
              >
                Apply Filters ({filteredPins.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MOBILE BOTTOM PIN SELECTION CARD ═══ */}
      {selectedPin && (
        <div className="md:hidden absolute inset-x-3 bottom-24 z-40 bg-bg-surface/95 backdrop-blur-2xl border border-accent/40 rounded-3xl p-4 shadow-2xl animate-slide-up">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{CATEGORY_CONFIG[selectedPin.category]?.emoji}</span>
              <span className="font-extrabold text-xs text-accent uppercase">{selectedPin.category}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                selectedPin.priority === 'CRITICAL' ? 'bg-danger/20 text-danger border border-danger/40' :
                selectedPin.priority === 'HIGH' ? 'bg-warning/20 text-warning border border-warning/40' : 'bg-success/20 text-success border border-success/40'
              }`}>
                {selectedPin.priority}
              </span>
              <button onClick={() => setSelectedPin(null)} className="p-1 rounded-lg text-text-muted hover:text-white">
                <X size={16} />
              </button>
            </div>
          </div>

          <h4 className="font-extrabold text-sm text-text-primary line-clamp-2 mb-1">{selectedPin.title}</h4>
          <p className="text-xs text-text-muted mb-3 flex items-center gap-1">
            <MapPinIcon size={12} className="text-accent" /> {selectedPin.ward} Ward
          </p>

          <Link
            to={`/issues/${selectedPin.id}`}
            className="btn-primary w-full py-2.5 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-accent/25"
          >
            <span>View Full Civic Report</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* ═══ MAIN LEAFLET MAP VIEW ═══ */}
      <main className="flex-1 h-full p-0 sm:p-4 relative">
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

export default MapPage;
