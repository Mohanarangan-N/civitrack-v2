import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { mapAPI } from '../api'
import { MapPin as MapPinType, CATEGORY_EMOJI, PRIORITY_COLOR } from '../types'
import { useNavigate } from 'react-router-dom'

const CATS = ['ROADS','WATER','WASTE','LIGHTING','AIR_QUALITY','PARKS','PUBLIC_PROPERTY','OTHER']
const PRIS = ['LOW','MEDIUM','HIGH','CRITICAL']

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInst = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const heatRef = useRef<any>(null)
  const [selectedPin, setSelectedPin] = useState<MapPinType|null>(null)
  const [catFilter, setCatFilter] = useState<string[]>(CATS)
  const [priFilter, setPriFilter] = useState<string[]>(PRIS)
  const [showHeat, setShowHeat] = useState(true)
  const nav = useNavigate()

  const { data: pins=[] } = useQuery({ queryKey:['mapPins'], queryFn:()=>mapAPI.pins().then(r=>r.data), refetchInterval:30000 })
  const { data: heatData=[] } = useQuery({ queryKey:['heatmap'], queryFn:()=>mapAPI.heatmap().then(r=>r.data) })

  useEffect(()=>{
    if(mapInst.current || !mapRef.current) return
    const script = document.createElement('script')
    script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      const L = (window as any).L
      const map = L.map(mapRef.current,{center:[11.9139,79.8145],zoom:12})
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{attribution:'© OSM'}).addTo(map)
      mapInst.current = map

      // Ward boundaries (simplified)
      const wards = [
        {name:'White Town',name_ta:'வெள்ளை நகர்',coords:[[11.928,79.830],[11.934,79.830],[11.934,79.842],[11.928,79.842]],color:'#F4A460'},
        {name:'Lawspet',name_ta:'லாஸ்பேட்',coords:[[11.944,79.820],[11.953,79.820],[11.953,79.834],[11.944,79.834]],color:'#98FB98'},
        {name:'Oulgaret',name_ta:'உழவர்கரை',coords:[[11.953,79.805],[11.962,79.805],[11.962,79.820],[11.953,79.820]],color:'#FFD060'},
        {name:'Mudaliarpet',name_ta:'முதலியார்பேட்டை',coords:[[11.930,79.834],[11.944,79.834],[11.944,79.842],[11.930,79.842]],color:'#7EC8E3'},
        {name:'Villianur',name_ta:'வில்லியனூர்',coords:[[11.898,79.810],[11.920,79.810],[11.920,79.834],[11.898,79.834]],color:'#4CC88A'},
      ]
      wards.forEach(w=>{
        L.polygon(w.coords,{color:w.color,weight:1.5,fillOpacity:0.08,dashArray:'4 4'}).addTo(map)
          .bindTooltip(`<b style="color:${w.color}">${w.name}</b><br><small>${w.name_ta}</small>`,{permanent:false,className:'ward-tip'})
      })
    }
    document.head.appendChild(script)
  },[])

  // Add markers when pins change
  useEffect(()=>{
    const L = (window as any).L; const map = mapInst.current
    if(!L || !map) return
    markersRef.current.forEach(m=>map.removeLayer(m)); markersRef.current=[]
    const filtered = pins.filter((p:MapPinType)=>catFilter.includes(p.category)&&priFilter.includes(p.priority))
    filtered.forEach((pin:MapPinType)=>{
      const bounce = pin.priority==='CRITICAL' ? 'animation:bounce-marker 0.8s ease-in-out infinite;' : ''
      const icon = L.divIcon({
        html:`<div style="font-size:${pin.priority==='CRITICAL'?26:pin.priority==='HIGH'?22:18}px;filter:drop-shadow(0 2px 4px ${pin.color}80);cursor:pointer;${bounce}">${pin.emoji}</div>`,
        className:'',iconSize:[30,30],iconAnchor:[15,15]
      })
      const m = L.marker([pin.lat,pin.lng],{icon}).addTo(map).on('click',()=>setSelectedPin(pin))
      markersRef.current.push(m)
    })
  },[pins,catFilter,priFilter])

  // Heatmap
  useEffect(()=>{
    const L = (window as any).L; const map = mapInst.current
    if(!L || !map || !heatData.length) return
    const heatScript = document.createElement('script')
    heatScript.src='https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js'
    heatScript.onload=()=>{
      if(heatRef.current) map.removeLayer(heatRef.current)
      if(showHeat) {
        heatRef.current = (L as any).heatLayer(heatData,{radius:35,blur:25,gradient:{'0.2':'#4CC88A','0.5':'#FFD060','0.75':'#E8901A','1':'#E85038'}}).addTo(map)
      }
    }
    document.head.appendChild(heatScript)
  },[heatData,showHeat])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-52 bg-[#111E17] border-r border-[#1E3028] p-3 overflow-y-auto">
        <div className="text-xs font-medium text-[#8BAF9A] uppercase tracking-wider mb-3">Filters</div>
        <label className="flex items-center gap-2 text-xs text-[#8BAF9A] mb-3 cursor-pointer">
          <input type="checkbox" checked={showHeat} onChange={e=>setShowHeat(e.target.checked)} className="accent-[#22A66A]"/>
          Heatmap overlay
        </label>
        <div className="text-xs text-[#8BAF9A] mb-2">Categories</div>
        {CATS.map(c=>(
          <label key={c} className="flex items-center gap-2 text-xs text-[#8BAF9A] mb-1.5 cursor-pointer">
            <input type="checkbox" checked={catFilter.includes(c)} onChange={e=>{setCatFilter(f=>e.target.checked?[...f,c]:f.filter(x=>x!==c))}} className="accent-[#22A66A]"/>
            {CATEGORY_EMOJI[c as any]} {c}
          </label>
        ))}
        <div className="text-xs text-[#8BAF9A] mt-3 mb-2">Priority</div>
        {PRIS.map(p=>(
          <label key={p} className="flex items-center gap-2 text-xs mb-1.5 cursor-pointer" style={{color:PRIORITY_COLOR[p as any]}}>
            <input type="checkbox" checked={priFilter.includes(p)} onChange={e=>{setPriFilter(f=>e.target.checked?[...f,p]:f.filter(x=>x!==p))}}/>
            <span className="w-2 h-2 rounded-full inline-block" style={{background:PRIORITY_COLOR[p as any]}}></span>{p}
          </label>
        ))}
      </div>
      {/* Map */}
      <div className="flex-1 relative">
        <style>{`.ward-tip{background:rgba(13,22,18,0.95)!important;border:1px solid #1E3028!important;border-radius:8px!important;color:#E8F5EE!important;font-family:inherit!important;padding:6px 10px!important}.ward-tip::before{display:none!important}@keyframes bounce-marker{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
        <div ref={mapRef} className="w-full h-full"/>
        {/* Issue detail panel */}
        {selectedPin && (
          <div className="absolute top-4 right-4 bg-[#111E17] border border-[#1E3028] rounded-xl p-4 w-56 shadow-xl">
            <button onClick={()=>setSelectedPin(null)} className="absolute top-3 right-3 text-[#8BAF9A] hover:text-white">×</button>
            <div className="text-2xl mb-2">{selectedPin.emoji}</div>
            <div className="text-sm font-medium text-[#E8F5EE] mb-2">{selectedPin.title}</div>
            <div className="flex gap-1.5 mb-3 flex-wrap">
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{background:`${PRIORITY_COLOR[selectedPin.priority]}20`,color:PRIORITY_COLOR[selectedPin.priority]}}>{selectedPin.priority}</span>
              <span className="text-[10px] text-[#8BAF9A]">{selectedPin.ward}</span>
            </div>
            <div className="text-xs text-[#8BAF9A] mb-3">❤️ {selectedPin.likes} upvotes</div>
            <button onClick={()=>nav(`/issues/${selectedPin.id}`)} className="w-full text-xs bg-[#22A66A] text-white py-2 rounded-lg hover:bg-[#1a8a56] transition">View Issue →</button>
          </div>
        )}
        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-[#111E17]/90 border border-[#1E3028] rounded-xl p-3 text-xs">
          <div className="text-[#8BAF9A] mb-2">Priority</div>
          {[['CRITICAL','#E85038'],['HIGH','#E8901A'],['MEDIUM','#FFD060'],['LOW','#4CC88A']].map(([p,c])=>(
            <div key={p} className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{background:c}}></div>
              <span style={{color:c}}>{p}</span>
            </div>
          ))}
        </div>
        {/* Stats */}
        <div className="absolute top-4 left-4 bg-[#111E17]/90 border border-[#1E3028] rounded-xl px-3 py-2">
          <div className="text-xs text-[#8BAF9A]">{pins.length} issues on map · Puducherry</div>
        </div>
      </div>
    </div>
  )
}
