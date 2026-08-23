import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { issuesAPI } from '../api'
import { CATEGORY_EMOJI } from '../types'
import toast from 'react-hot-toast'

const CATS = ['ROADS','WATER','WASTE','LIGHTING','AIR_QUALITY','PARKS','PUBLIC_PROPERTY','OTHER']
const AREA_TYPES = ['HIGHWAY','SCHOOL_HOSPITAL','COMMERCIAL','INDUSTRIAL','RESIDENTIAL','RURAL']
const HECTIC_LEVELS = ['EXTREMELY_BUSY','BUSY','MODERATE','LOW','VERY_LOW']
const WARDS = ['White Town','Lawspet','Oulgaret','Mudaliarpet','Villianur','Ariyankuppam','Bahour','Mannadipet','Nettapakkam','Embalam']

export default function ReportPage() {
  const [step,setStep]=useState(1)
  const [form,setForm]=useState({ title:'',description:'',category:'ROADS',latitude:11.9139,longitude:79.8145,ward:'White Town',area_type:'RESIDENTIAL',hectic_level:'MODERATE',is_anonymous:false })
  const [photos,setPhotos]=useState<File[]>([])
  const [loading,setLoading]=useState(false)
  const [trackingToken,setTrackingToken]=useState<string|null>(null)
  const nav = useNavigate()

  const set = (k:string,v:any) => setForm(f=>({...f,[k]:v}))

  const submit = async () => {
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k,v])=>fd.append(k,String(v)))
      photos.forEach(p=>fd.append('photos',p))
      const { data } = await issuesAPI.create(fd)
      if(data.tracking_token) { setTrackingToken(data.tracking_token) }
      else { toast.success('Issue submitted! NGO will verify shortly.'); nav('/feed') }
    } catch { toast.error('Submission failed') } finally { setLoading(false) }
  }

  if(trackingToken) return (
    <div className="max-w-md mx-auto px-4 py-12 text-center">
      <div className="text-5xl mb-4">🎭</div>
      <h2 className="text-lg font-semibold text-[#E8F5EE] mb-2">Anonymous Report Submitted!</h2>
      <p className="text-sm text-[#8BAF9A] mb-6">Save this tracking code — it cannot be recovered:</p>
      <div className="bg-[#111E17] border-2 border-[#22A66A] rounded-xl p-6 mb-6">
        <div className="text-3xl font-bold text-[#22A66A] font-mono tracking-widest">{trackingToken}</div>
        <div className="text-xs text-[#8BAF9A] mt-2">CT-{trackingToken}</div>
      </div>
      <button onClick={()=>nav('/track')} className="w-full bg-[#22A66A] text-white py-3 rounded-lg font-medium mb-3">Track This Issue</button>
      <button onClick={()=>nav('/feed')} className="w-full border border-[#1E3028] text-[#8BAF9A] py-3 rounded-lg text-sm">Go to Feed</button>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="font-semibold text-[#E8F5EE] mb-2">Report Civic Issue</h1>
      <p className="text-xs text-[#8BAF9A] mb-5">Your report becomes an Urban Decision Support data point for Puducherry municipality</p>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1,2,3,4].map(s=>(
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${step>=s?'bg-[#22A66A] text-white':'bg-[#111E17] text-[#8BAF9A] border border-[#1E3028]'}`}>{s}</div>
            {s<4&&<div className={`flex-1 h-0.5 ${step>s?'bg-[#22A66A]':'bg-[#1E3028]'}`}/>}
          </div>
        ))}
      </div>

      <div className="bg-[#111E17] border border-[#1E3028] rounded-2xl p-5">
        {/* Step 1 - Category */}
        {step===1 && (
          <div>
            <h3 className="font-medium text-sm text-[#E8F5EE] mb-4">Select issue category</h3>
            <div className="grid grid-cols-4 gap-2">
              {CATS.map(c=>(
                <button key={c} onClick={()=>set('category',c)} className={`p-3 rounded-xl border text-center transition ${form.category===c?'border-[#22A66A] bg-[#22A66A]/10':'border-[#1E3028] hover:bg-[#162219]'}`}>
                  <div className="text-2xl mb-1">{CATEGORY_EMOJI[c as any]}</div>
                  <div className="text-[10px] text-[#8BAF9A]">{c.replace('_',' ')}</div>
                </button>
              ))}
            </div>
            <button onClick={()=>setStep(2)} className="w-full mt-5 bg-[#22A66A] text-white py-2.5 rounded-lg text-sm font-medium">Next →</button>
          </div>
        )}

        {/* Step 2 - Details */}
        {step===2 && (
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-[#E8F5EE]">Issue details</h3>
            <div>
              <label className="text-xs text-[#8BAF9A] mb-1.5 block">Title *</label>
              <input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Large pothole on MG Road" className="w-full bg-[#0A1510] border border-[#1E3028] rounded-lg px-3 py-2.5 text-sm text-[#E8F5EE] outline-none focus:border-[#22A66A]"/>
            </div>
            <div>
              <label className="text-xs text-[#8BAF9A] mb-1.5 block">Description *</label>
              <textarea value={form.description} onChange={e=>set('description',e.target.value)} rows={4} placeholder="Describe the issue in detail..." className="w-full bg-[#0A1510] border border-[#1E3028] rounded-lg px-3 py-2.5 text-sm text-[#E8F5EE] outline-none focus:border-[#22A66A] resize-none"/>
            </div>
            <div>
              <label className="text-xs text-[#8BAF9A] mb-1.5 block">Ward</label>
              <select value={form.ward} onChange={e=>set('ward',e.target.value)} className="w-full bg-[#0A1510] border border-[#1E3028] rounded-lg px-3 py-2.5 text-sm text-[#E8F5EE] outline-none focus:border-[#22A66A]">
                {WARDS.map(w=><option key={w}>{w}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={()=>setStep(1)} className="flex-1 border border-[#1E3028] text-[#8BAF9A] py-2.5 rounded-lg text-sm">← Back</button>
              <button onClick={()=>setStep(3)} disabled={!form.title||!form.description} className="flex-1 bg-[#22A66A] text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">Next →</button>
            </div>
          </div>
        )}

        {/* Step 3 - Location + Context */}
        {step===3 && (
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-[#E8F5EE]">Location & Context</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#8BAF9A] mb-1.5 block">Latitude</label>
                <input type="number" value={form.latitude} onChange={e=>set('latitude',parseFloat(e.target.value))} className="w-full bg-[#0A1510] border border-[#1E3028] rounded-lg px-3 py-2.5 text-sm text-[#E8F5EE] outline-none focus:border-[#22A66A]"/>
              </div>
              <div>
                <label className="text-xs text-[#8BAF9A] mb-1.5 block">Longitude</label>
                <input type="number" value={form.longitude} onChange={e=>set('longitude',parseFloat(e.target.value))} className="w-full bg-[#0A1510] border border-[#1E3028] rounded-lg px-3 py-2.5 text-sm text-[#E8F5EE] outline-none focus:border-[#22A66A]"/>
              </div>
            </div>
            <div>
              <label className="text-xs text-[#8BAF9A] mb-1.5 block">Area type (affects AI priority scoring)</label>
              <select value={form.area_type} onChange={e=>set('area_type',e.target.value)} className="w-full bg-[#0A1510] border border-[#1E3028] rounded-lg px-3 py-2.5 text-sm text-[#E8F5EE] outline-none focus:border-[#22A66A]">
                {AREA_TYPES.map(a=><option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#8BAF9A] mb-1.5 block">How busy is this location?</label>
              <select value={form.hectic_level} onChange={e=>set('hectic_level',e.target.value)} className="w-full bg-[#0A1510] border border-[#1E3028] rounded-lg px-3 py-2.5 text-sm text-[#E8F5EE] outline-none focus:border-[#22A66A]">
                {HECTIC_LEVELS.map(h=><option key={h}>{h.replace('_',' ')}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={()=>setStep(2)} className="flex-1 border border-[#1E3028] text-[#8BAF9A] py-2.5 rounded-lg text-sm">← Back</button>
              <button onClick={()=>setStep(4)} className="flex-1 bg-[#22A66A] text-white py-2.5 rounded-lg text-sm font-medium">Next →</button>
            </div>
          </div>
        )}

        {/* Step 4 - Photo + Anonymous */}
        {step===4 && (
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-[#E8F5EE]">Photos & Privacy</h3>
            <div>
              <label className="text-xs text-[#8BAF9A] mb-1.5 block">Photos (up to 5)</label>
              <input type="file" accept="image/*" multiple onChange={e=>setPhotos(Array.from(e.target.files||[]).slice(0,5))} className="w-full text-xs text-[#8BAF9A] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#22A66A] file:text-white file:text-xs file:cursor-pointer"/>
              {photos.length>0 && <div className="text-xs text-[#22A66A] mt-1">{photos.length} photo(s) selected</div>}
            </div>
            {/* Anonymous toggle */}
            <div className={`p-4 rounded-xl border transition ${form.is_anonymous?'border-[#B57BFF] bg-[#B57BFF]/10':'border-[#1E3028]'}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-medium text-[#E8F5EE]">🎭 Anonymous Reporting</div>
                  <div className="text-xs text-[#8BAF9A]">DPDP Act 2023 compliant — identity unrecoverable</div>
                </div>
                <button onClick={()=>set('is_anonymous',!form.is_anonymous)} className={`w-11 h-6 rounded-full transition-all ${form.is_anonymous?'bg-[#B57BFF]':'bg-[#1E3028]'} relative`}>
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${form.is_anonymous?'left-5':'left-0.5'}`}/>
                </button>
              </div>
              {form.is_anonymous && <div className="text-xs text-[#B57BFF] bg-[#B57BFF]/10 rounded-lg p-2">⚠️ No EcoScore points for anonymous reports. You'll get a 6-digit tracking code instead.</div>}
            </div>
            <div className="flex gap-3">
              <button onClick={()=>setStep(3)} className="flex-1 border border-[#1E3028] text-[#8BAF9A] py-2.5 rounded-lg text-sm">← Back</button>
              <button onClick={submit} disabled={loading} className="flex-1 bg-[#22A66A] text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
