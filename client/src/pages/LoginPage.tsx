import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [loading,setLoading]=useState(false)
  const { setAuth } = useAuthStore(); const nav = useNavigate()

  const submit = async (e:any) => {
    e.preventDefault(); setLoading(true)
    try {
      const { data } = await authAPI.login({ email, password })
      setAuth(data.user, data.access_token)
      toast.success(`Welcome back, ${data.user.name}!`)
      nav('/feed')
    } catch { toast.error('Invalid credentials') } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0A1510] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#22A66A] rounded-xl flex items-center justify-center font-bold text-white text-xl mx-auto mb-3">C</div>
          <h1 className="text-xl font-semibold text-[#E8F5EE]">CiviTrack V2</h1>
          <p className="text-xs text-[#8BAF9A] mt-1">Urban Decision Support System</p>
        </div>
        <form onSubmit={submit} className="bg-[#111E17] border border-[#1E3028] rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-xs text-[#8BAF9A] mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-[#0A1510] border border-[#1E3028] rounded-lg px-3 py-2.5 text-sm text-[#E8F5EE] outline-none focus:border-[#22A66A] transition" placeholder="citizen@demo.com" required/>
          </div>
          <div>
            <label className="text-xs text-[#8BAF9A] mb-1.5 block">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-[#0A1510] border border-[#1E3028] rounded-lg px-3 py-2.5 text-sm text-[#E8F5EE] outline-none focus:border-[#22A66A] transition" placeholder="password123" required/>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#22A66A] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a8a56] transition disabled:opacity-50">
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div className="text-xs text-center text-[#8BAF9A]">
            No account? <Link to="/register" className="text-[#22A66A] hover:underline">Register</Link>
          </div>
        </form>
        <div className="mt-4 text-xs text-[#8BAF9A] text-center space-y-1">
          <div className="font-medium text-[#E8F5EE]">Demo accounts (password: password123)</div>
          {['citizen@demo.com','ngo@demo.com','authority@demo.com'].map(e=>(
            <button key={e} onClick={()=>{setEmail(e);setPassword('password123')}} className="block w-full text-[#22A66A] hover:underline">{e}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
