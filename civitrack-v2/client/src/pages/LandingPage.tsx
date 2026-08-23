import { useNavigate } from 'react-router-dom'
import { Shield, Brain, Map, Trophy, Users, Zap } from 'lucide-react'

export default function LandingPage() {
  const nav = useNavigate()
  return (
    <div className="min-h-screen bg-[#0A1510] text-[#E8F5EE]">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-[#1E3028]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#22A66A] rounded-lg flex items-center justify-center font-bold text-white">C</div>
          <div>
            <div className="font-semibold text-lg">CiviTrack V2</div>
            <div className="text-xs text-[#8BAF9A]">Urban Decision Support System</div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={()=>nav('/login')} className="px-4 py-2 text-sm border border-[#1E3028] rounded-lg hover:bg-[#162219] transition">Login</button>
          <button onClick={()=>nav('/register')} className="px-4 py-2 text-sm bg-[#22A66A] rounded-lg hover:bg-[#1a8a56] transition text-white font-medium">Get Started</button>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center py-20 px-6">
        <div className="inline-flex items-center gap-2 bg-[#162219] border border-[#1E3028] rounded-full px-4 py-1.5 text-xs text-[#22A66A] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#22A66A] animate-pulse inline-block"></span>
          Live in Puducherry
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-3xl mx-auto leading-tight">
          Citizen Intelligence for <span className="text-[#22A66A]">Smarter Cities</span>
        </h1>
        <p className="text-[#8BAF9A] max-w-xl mx-auto mb-8 text-base leading-relaxed">
          CiviTrack converts citizen-generated data into actionable intelligence for municipal planning. Not a complaint app — an AI-powered Urban Decision Support System.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={()=>nav('/register')} className="px-6 py-3 bg-[#22A66A] text-white rounded-lg font-medium hover:bg-[#1a8a56] transition">Report an Issue</button>
          <button onClick={()=>nav('/track')} className="px-6 py-3 border border-[#1E3028] rounded-lg text-[#8BAF9A] hover:bg-[#162219] transition text-sm">Track Anonymous Report</button>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 pb-12 max-w-4xl mx-auto">
        {[['94.2%','AI Accuracy'],['10','Puducherry Wards'],['3','User Roles'],['14','Achievements']].map(([v,l])=>(
          <div key={l} className="bg-[#111E17] border border-[#1E3028] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#22A66A]">{v}</div>
            <div className="text-xs text-[#8BAF9A] mt-1">{l}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="px-8 pb-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold text-center mb-8">Why governments choose CiviTrack</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {icon:<Brain size={22}/>,title:'AI Classification',desc:'MobileNetV3 + IndicBERT classify issues in 2 seconds with 94.2% accuracy',color:'text-[#B57BFF]'},
            {icon:<Shield size={22}/>,title:'Ward NGO Verification',desc:'Only ward-specific NGOs verify reports — ensuring data quality and accountability',color:'text-[#3B9ED4]'},
            {icon:<Shield size={22}/>,title:'Zero-Knowledge Anonymity',desc:'DPDP Act 2023 compliant. Reporter identity is mathematically unrecoverable',color:'text-[#22A66A]'},
            {icon:<Map size={22}/>,title:'3D Puducherry Map',desc:'Real-time emoji markers, heatmap, ward boundaries on interactive Leaflet map',color:'text-[#E8901A]'},
            {icon:<Trophy size={22}/>,title:'EcoScore Gamification',desc:'5 citizen levels, 14 badges, streak multipliers, weekly ward challenges',color:'text-[#FFD060]'},
            {icon:<Users size={22}/>,title:'WhatsApp + SMS',desc:'Elderly and rural citizens report without smartphones via WhatsApp chatbot',color:'text-[#4CC88A]'},
          ].map(f=>(
            <div key={f.title} className="bg-[#111E17] border border-[#1E3028] rounded-xl p-5">
              <div className={`${f.color} mb-3`}>{f.icon}</div>
              <div className="font-medium mb-1.5 text-sm">{f.title}</div>
              <div className="text-xs text-[#8BAF9A] leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Demo accounts */}
      <section className="text-center pb-12 px-6">
        <div className="inline-block bg-[#111E17] border border-[#1E3028] rounded-xl px-6 py-4 text-sm text-[#8BAF9A]">
          <div className="font-medium text-[#E8F5EE] mb-2">Demo Accounts (password: password123)</div>
          <div className="space-y-1 text-xs">
            <div>citizen@demo.com → Citizen</div>
            <div>ngo@demo.com → NGO (White Town ward)</div>
            <div>authority@demo.com → Authority</div>
          </div>
        </div>
      </section>
    </div>
  )
}
