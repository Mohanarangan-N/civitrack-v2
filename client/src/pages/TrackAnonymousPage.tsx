import { useState } from 'react'
import { issuesAPI } from '../api'
import { Link } from 'react-router-dom'
import { STATUS_COLOR } from '../types'
import toast from 'react-hot-toast'

export default function TrackAnonymousPage() {
  const [token,setToken]=useState('')
  const [result,setResult]=useState<any>(null)
  const [loading,setLoading]=useState(false)

  const track = async () => {
    if(!token.trim()) return
    setLoading(true)
    try {
      const { data } = await issuesAPI.trackAnonymous(token.toUpperCase())
      setResult(data)
    } catch { toast.error('Token not found. Please check and try again.') } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0A1510] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎭</div>
          <h1 className="text-xl font-semibold text-[#E8F5EE]">Track Anonymous Report</h1>
          <p className="text-xs text-[#8BAF9A] mt-2">Enter your 6-digit tracking code to check status</p>
        </div>

        <div className="bg-[#111E17] border border-[#1E3028] rounded-2xl p-6">
          <input
            value={token}
            onChange={e=>setToken(e.target.value.toUpperCase())}
            placeholder="e.g. A3F9B2"
            maxLength={6}
            className="w-full bg-[#0A1510] border border-[#1E3028] rounded-lg px-4 py-3 text-center text-xl font-mono text-[#E8F5EE] outline-none focus:border-[#B57BFF] tracking-widest mb-4"
          />
          <button onClick={track} disabled={loading||token.length<6} className="w-full bg-[#B57BFF] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#9b5fe8] transition disabled:opacity-50">
            {loading ? 'Searching...' : 'Track Issue'}
          </button>
        </div>

        {result && (
          <div className="mt-4 bg-[#111E17] border border-[#1E3028] rounded-2xl p-5">
            <div className="text-sm font-medium text-[#E8F5EE] mb-4">Issue Found</div>
            {[
              {label:'Status',value:result.status,color:STATUS_COLOR[result.status as any]||'#8BAF9A'},
              {label:'Category',value:result.category,color:'#E8F5EE'},
              {label:'Priority',value:result.priority,color:'#E8F5EE'},
              {label:'Ward',value:result.ward,color:'#E8F5EE'},
            ].map(r=>(
              <div key={r.label} className="flex justify-between py-2 border-b border-[#1E3028] last:border-0">
                <span className="text-xs text-[#8BAF9A]">{r.label}</span>
                <span className="text-xs font-medium" style={{color:r.color}}>{r.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-[#22A66A] hover:underline">← Back to CiviTrack</Link>
        </div>
      </div>
    </div>
  )
}
