import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { MapPin, WardFeature, IssueCategory, IssuePriority } from '@/types';
import { CATEGORY_CONFIG, PRIORITY_CONFIG, PUDUCHERRY_CENTER, PUDUCHERRY_ZOOM } from '@/utils/constants';
import { Link } from 'react-router-dom';
import { Sparkles, Layers } from 'lucide-react';

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
  const criticalClass = priority === 'CRITICAL' ? 'animate-pulse-critical' : '';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background: #111E17;
        border: 2px solid ${pri.color};
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
      " class="${criticalClass}">
        ${cat.emoji}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

// Component to handle map center updates
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export const PuducherryMap: React.FC<PuducherryMapProps> = ({
  pins,
  wardBoundaries,
  showHeatmap = false,
  selectedWard,
  onPinClick,
}) => {
  const wardStyle = (feature: any) => {
    const isSelected = selectedWard && feature?.properties?.name === selectedWard;
    return {
      color: isSelected ? '#22A66A' : '#0D5C3A',
      weight: isSelected ? 3 : 1.5,
      dashArray: '4, 4',
      fillColor: isSelected ? '#22A66A' : '#0D5C3A',
      fillOpacity: isSelected ? 0.25 : 0.08,
    };
  };

  const onEachWard = (feature: any, layer: L.Layer) => {
    if (feature.properties) {
      const { name, name_ta, health_score } = feature.properties;
      layer.bindTooltip(
        `<div style="font-weight: bold; font-size: 12px; color: #E8F5EE;">
          ${name} / ${name_ta || name}
          <div style="font-size: 10px; color: #22A66A;">Health Score: ${health_score}/100</div>
        </div>`,
        { permanent: false, direction: 'center', className: 'ward-tooltip' }
      );
    }
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-primary/30 shadow-2xl">
      <MapContainer
        center={PUDUCHERRY_CENTER}
        zoom={PUDUCHERRY_ZOOM}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: '450px' }}
      >
        <ChangeView center={PUDUCHERRY_CENTER} zoom={PUDUCHERRY_ZOOM} />

        {/* Free Dark OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Ward Boundary GeoJSON Polygons */}
        {wardBoundaries && (
          <GeoJSON data={wardBoundaries} style={wardStyle} onEachFeature={onEachWard} />
        )}

        {/* Emoji Markers */}
        {pins.map((pin) => {
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
                    className="inline-block bg-accent hover:bg-primary text-white text-[11px] font-semibold px-3 py-1 rounded transition-colors"
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
