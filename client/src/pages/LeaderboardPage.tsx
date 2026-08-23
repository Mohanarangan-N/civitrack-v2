import { useQuery } from '@tanstack/react-query'
import { leaderboardAPI } from '../api'
import { LEVEL_EMOJI } from '../types'
import { useAuthStore } from '../store/authStore'

export default function LeaderboardPage() {
  const { user } = useAuthStore()
  const { data: citizens=[] } = useQuery({ queryKey:['leaderboard'], queryFn:()=>leaderboardAPI.city().then(r=>r.data) })
  const { data: wards=[] } = useQuery({ queryKey:['ward-leaderboard'], queryFn:()=>leaderboardAPI.ward().then(r=>r.data) })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-semibold text-[#E8F5EE] mb-5">🏆 Leaderboard</h1>
      <div className="grid grid-cols-2 gap-4">
        {/* Citizens */}
        <div className="bg-[#111E17] border border-[#1E3028] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1E3028]">
            <div className="text-sm font-medium text-[#E8F5EE]">Top Citizens</div>
            <div className="text-xs text-[#8BAF9A]">By EcoScore</div>
          </div>
          <div className="divide-y divide-[#1E3028]">
            {citizens.slice(0,10).map((c:any)=>(
              <div key={c.id} className={`flex items-center gap-3 px-4 py-3 ${c.id===user?.id?'bg-[#22A66A]/5':''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${c.rank===1?'bg-[#FFD060] text-black':c.rank===2?'bg-[#C0C0C0] text-black':c.rank===3?'bg-[#CD7F32] text-black':'bg-[#1E3028] text-[#8BAF9A]'}`}>{c.rank}</div>
                <div className="w-7 h-7 rounded-full bg-[#22A66A]/20 flex items-center justify-center text-xs font-bold text-[#22A66A]">{c.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-[#E8F5EE] truncate">{c.name}</div>
                  <div className="text-[10px] text-[#8BAF9A]">{LEVEL_EMOJI[c.level as any]} {c.level?.replace('_',' ')}</div>
                </div>
                <div className="text-xs font-medium text-[#22A66A]">{c.eco_score}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wards */}
        <div className="bg-[#111E17] border border-[#1E3028] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1E3028]">
            <div className="text-sm font-medium text-[#E8F5EE]">Ward Rankings</div>
            <div className="text-xs text-[#8BAF9A]">By health score</div>
          </div>
          <div className="divide-y divide-[#1E3028]">
            {wards.map((w:any,i:number)=>(
              <div key={w.ward} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i===0?'bg-[#FFD060] text-black':i===1?'bg-[#C0C0C0] text-black':i===2?'bg-[#CD7F32] text-black':'bg-[#1E3028] text-[#8BAF9A]'}`}>{i+1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-[#E8F5EE] truncate">{w.ward}</div>
                  <div className="text-[10px] text-[#8BAF9A]">{w.ward_ta} · {w.open_issues} open</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-[#22A66A]">{w.health_score?.toFixed(0)}</div>
                  <div className="text-[10px] text-[#8BAF9A]">health</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
