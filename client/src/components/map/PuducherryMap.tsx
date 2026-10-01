import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import type { MapPin, IssueCategory, IssuePriority } from '@/types';
import { CATEGORY_CONFIG, PRIORITY_CONFIG, PUDUCHERRY_CENTER, PUDUCHERRY_ZOOM } from '@/utils/constants';
import { Link } from 'react-router-dom';

interface PuducherryMapProps {
  pins: MapPin[];
  wardBoundaries?: any;
  showHeatmap?: boolean;
  selectedWard?: string;
  onPinClick?: (pin: MapPin) => void;
}

// Create custom emoji marker HTML icon
function createEmojiIcon(category: IssueCategory, priority: IssuePriority) {
  const cat = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.OTHER;
  const pri = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
  const isHighOrCritical = priority === 'CRITICAL' || priority === 'HIGH';
  const pulseRing = isHighOrCritical
    ? `<div style="
        position: absolute;
        top: -6px;
        left: -6px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: 2px solid ${pri.color};
        animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        opacity: 0.75;
        pointer-events: none;
      "></div>`
    : '';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative;">
        ${pulseRing}
        <div style="
          background: #111E17;
          border: 2.5px solid ${pri.color};
          box-shadow: ${pri.glow};
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          transition: transform 0.2s;
        " class="hover:scale-125">
          ${cat.emoji}
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

// Ward health score -> color gradient (red = bad, green = good)
function healthScoreColor(score: number): string {
  if (score >= 75) return '#22A66A'; // green
  if (score >= 60) return '#3B9ED4'; // blue
  if (score >= 45) return '#E8D61A'; // yellow
  if (score >= 30) return '#E8901A'; // orange
  return '#E85038'; // red
}

// Component to handle map center updates with smooth fly animation
function FlyToView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// Heatmap layer component
function HeatmapLayer({ pins, visible }: { pins: MapPin[]; visible: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!visible || pins.length === 0) return;

    const heatData = pins.map((pin) => {
      const coords = pin.location?.coordinates;
      if (!coords || coords.length !== 2) return null;
      // Priority-based intensity
      const intensityMap: Record<string, number> = {
        CRITICAL: 1.0,
        HIGH: 0.8,
        MEDIUM: 0.5,
        LOW: 0.3,
      };
      return [coords[1], coords[0], intensityMap[pin.priority] || 0.5];
    }).filter(Boolean) as [number, number, number][];

    const heat = (L as any).heatLayer(heatData, {
      radius: 35,
      blur: 25,
      maxZoom: 16,
      max: 1.0,
      gradient: {
        0.2: '#22A66A',
        0.4: '#3B9ED4',
        0.6: '#E8D61A',
        0.8: '#E8901A',
        1.0: '#E85038',
      },
    });

    heat.addTo(map);
    return () => { map.removeLayer(heat); };
  }, [pins, visible, map]);

  return null;
}

export const PuducherryMap: React.FC<PuducherryMapProps> = ({
  pins,
  wardBoundaries,
  showHeatmap = false,
  selectedWard,
  onPinClick,
}) => {
  // Compute center based on selected ward
  const mapCenter = useMemo<[number, number]>(() => {
    if (selectedWard && wardBoundaries?.features) {
      const feature = wardBoundaries.features.find(
        (f: any) => f.properties?.name === selectedWard
      );
      if (feature?.properties?.center) {
        return [feature.properties.center[0], feature.properties.center[1]];
      }
    }
    return PUDUCHERRY_CENTER;
  }, [selectedWard, wardBoundaries]);

  const mapZoom = selectedWard ? 14 : PUDUCHERRY_ZOOM;

  const wardStyle = (feature: any) => {
    const isSelected = selectedWard && feature?.properties?.name === selectedWard;
    const healthScore = feature?.properties?.health_score || 50;
    const baseColor = healthScoreColor(healthScore);

    return {
      color: isSelected ? '#22A66A' : baseColor,
      weight: isSelected ? 3 : 1.5,
      dashArray: isSelected ? undefined : '4, 4',
      fillColor: baseColor,
      fillOpacity: isSelected ? 0.3 : 0.12,
    };
  };

  const onEachWard = (feature: any, layer: L.Layer) => {
    if (feature.properties) {
      const { name, name_ta, health_score } = feature.properties;
      const color = healthScoreColor(health_score);

      // Count issues in this ward
      const issueCount = pins.filter((p) => p.ward === name).length;
      const criticalCount = pins.filter((p) => p.ward === name && p.priority === 'CRITICAL').length;

      layer.bindTooltip(
        `<div style="font-family: Inter, sans-serif; padding: 4px 0;">
          <div style="font-weight: 800; font-size: 13px; color: #E8F5EE; margin-bottom: 4px;">
            ${name}${name_ta ? ` <span style="font-weight: 500; opacity: 0.6; font-size: 11px;">${name_ta}</span>` : ''}
          </div>
          <div style="display: flex; gap: 8px; font-size: 11px;">
            <span style="color: ${color}; font-weight: 700;">Health: ${health_score}/100</span>
            <span style="color: #8BAF9A;">Issues: ${issueCount}</span>
            ${criticalCount > 0 ? `<span style="color: #E85038; font-weight: 700;">🔴 ${criticalCount} CRITICAL</span>` : ''}
          </div>
        </div>`,
        { permanent: false, direction: 'center', className: 'ward-tooltip' }
      );
    }
  };

  const [tileProvider, setTileProvider] = React.useState<'carto' | 'osm' | 'voyager'>('carto');

  const tileConfigs = {
    carto: {
      label: 'Dark GIS',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    },
    osm: {
      label: 'OpenStreetMap',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
    },
    voyager: {
      label: 'Light GIS',
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    },
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-primary/30 shadow-2xl">
      {/* Floating Tile Switcher */}
      <div className="absolute top-3 right-3 z-[1000] flex bg-bg-surface/90 backdrop-blur-md rounded-xl p-1 border border-primary/30 shadow-lg text-xs gap-1">
        {(['carto', 'osm', 'voyager'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setTileProvider(mode)}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              tileProvider === mode
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tileConfigs[mode].label}
          </button>
        ))}
      </div>

      <MapContainer
        center={PUDUCHERRY_CENTER}
        zoom={PUDUCHERRY_ZOOM}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: '450px' }}
      >
        <FlyToView center={mapCenter} zoom={mapZoom} />

        {/* Selected Tile Layer with dynamic URL */}
        <TileLayer
          key={tileProvider}
          attribution={tileConfigs[tileProvider].attribution}
          url={tileConfigs[tileProvider].url}
        />

        {/* Ward Boundary GeoJSON Polygons with health-score coloring */}
        {wardBoundaries && (
          <GeoJSON
            key={selectedWard || 'all'}
            data={wardBoundaries}
            style={wardStyle}
            onEachFeature={onEachWard}
          />
        )}

        {/* Heatmap Layer */}
        <HeatmapLayer pins={pins} visible={showHeatmap} />

        {/* Emoji Markers (hidden when heatmap is active for clarity) */}
        {!showHeatmap && pins.map((pin) => {
          const coords = pin.location?.coordinates;
          if (!coords || coords.length !== 2) return null;
          const lat = coords[1];
          const lng = coords[0];

          return (
            <Marker
              key={pin.id}
              position={[lat, lng]}
              icon={createEmojiIcon(pin.category, pin.priority)}
              eventHandlers={{
                click: () => onPinClick && onPinClick(pin),
              }}
            >
              <Popup>
                <div className="p-1 max-w-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span>{CATEGORY_CONFIG[pin.category]?.emoji}</span>
                    <strong className="text-xs text-text-primary truncate">{pin.title}</strong>
                  </div>
                  <div className="text-[11px] text-text-muted mb-2">
                    Ward: {pin.ward} • Priority: <span className="font-bold text-accent">{pin.priority}</span>
                  </div>
                  <Link
                    to={`/issues/${pin.id}`}
                    className="inline-block bg-accent hover:bg-primary text-white text-[11px] font-semibold px-3 py-1 rounded-lg transition-colors"
                  >
                    View Full Details →
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
