import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const WARDS = ['White Town','Lawspet','Oulgaret','Mudaliarpet','Villianur','Ariyankuppam','Bahour','Mannadipet','Nettapakkam','Embalam']
const ROLES = [{ value:'CITIZEN', label:'Citizen', desc:'Report and track civic issues' },{ value:'NGO', label:'NGO', desc:'Verify reports for your ward' },{ value:'AUTHORITY', label:'Authority', desc:'Assign and resolve issues' }]

export default function RegisterPage() {
  const [form,setForm]=useState({ name:'',email:'',password:'',role:'CITIZEN',ward:'White Town',language:'en' })
  const [loading,setLoading]=useState(false)
  const { setAuth } = useAuthStore(); const nav = useNavigate()
  const set = (k:string,v:string) => setForm(f=>({...f,[k]:v}))

  const submit = async (e:any) => {
    e.preventDefault(); setLoading(true)
    try {
      const { data } = await authAPI.register(form)
      setAuth(data.user, data.access_token)
      toast.success('Welcome to CiviTrack! +25 EcoScore bonus!')
      nav('/feed')
    } catch(err:any) { toast.error(err?.response?.data?.detail || 'Registration failed') } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0A1510] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-10 h-10 bg-[#22A66A] rounded-xl flex items-center justify-center font-bold text-white mx-auto mb-2">C</div>
          <h1 className="text-lg font-semibold text-[#E8F5EE]">Join CiviTrack V2</h1>
          <p className="text-xs text-[#8BAF9A]">Urban Decision Support System</p>
        </div>
        <form onSubmit={submit} className="bg-[#111E17] border border-[#1E3028] rounded-2xl p-6 space-y-4">
          <input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Full name" required className="w-full bg-[#0A1510] border border-[#1E3028] rounded-lg px-3 py-2.5 text-sm text-[#E8F5EE] outline-none focus:border-[#22A66A]"/>
          <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="Email address" required className="w-full bg-[#0A1510] border border-[#1E3028] rounded-lg px-3 py-2.5 text-sm text-[#E8F5EE] outline-none focus:border-[#22A66A]"/>
          <input type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="Password (min 6 chars)" required className="w-full bg-[#0A1510] border border-[#1E3028] rounded-lg px-3 py-2.5 text-sm text-[#E8F5EE] outline-none focus:border-[#22A66A]"/>
          <div>
            <label className="text-xs text-[#8BAF9A] mb-2 block">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(r=>(
                <button key={r.value} type="button" onClick={()=>set('role',r.value)} className={`p-2 rounded-lg border text-left transition ${form.role===r.value?'border-[#22A66A] bg-[#22A66A]/10':'border-[#1E3028] hover:bg-[#162219]'}`}>
                  <div className="text-xs font-medium text-[#E8F5EE]">{r.label}</div>
                  <div className="text-[10px] text-[#8BAF9A] mt-0.5 leading-tight">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-[#8BAF9A] mb-1.5 block">Ward</label>
            <select value={form.ward} onChange={e=>set('ward',e.target.value)} className="w-full bg-[#0A1510] border border-[#1E3028] rounded-lg px-3 py-2.5 text-sm text-[#E8F5EE] outline-none focus:border-[#22A66A]">
              {WARDS.map(w=><option key={w}>{w}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#8BAF9A] mb-1.5 block">Language</label>
            <div className="flex gap-2">
              {[['en','English'],['ta','தமிழ்'],['fr','Français']].map(([v,l])=>(
                <button key={v} type="button" onClick={()=>set('language',v)} className={`flex-1 py-2 rounded-lg text-xs border transition ${form.language===v?'border-[#22A66A] bg-[#22A66A]/10 text-[#22A66A]':'border-[#1E3028] text-[#8BAF9A] hover:bg-[#162219]'}`}>{l}</button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#22A66A] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a8a56] transition disabled:opacity-50">
            {loading ? 'Creating account...' : 'Register (+25 EcoScore bonus!)'}
          </button>
          <div className="text-xs text-center text-[#8BAF9A]">Already have an account? <Link to="/login" className="text-[#22A66A] hover:underline">Login</Link></div>
        </form>
      </div>
    </div>
  )
}
