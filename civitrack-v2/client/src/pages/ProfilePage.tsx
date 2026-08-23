import { useAuthStore } from '../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../api'
import { LEVEL_EMOJI, LEVEL_THRESHOLDS } from '../types'

const BADGE_INFO: Record<string,{name:string,icon:string}> = {
  FIRST_REPORT:{name:'First Report',icon:'🌱'}, REPORTS_10:{name:'10 Reports',icon:'🔟'},
  FIRST_RESOLVED:{name:'Problem Solver',icon:'✅'}, STREAK_7:{name:'Week Warrior',icon:'🔥'},
  STREAK_30:{name:'Month Guardian',icon:'💫'}, MAP_EXPLORER:{name:'Map Explorer',icon:'🗺️'},
  EARLY_BIRD:{name:'Early Bird',icon:'🌅'}, NIGHT_WATCHMAN:{name:'Night Watchman',icon:'🌙'},
}

export default function ProfilePage() {
  const { user } = useAuthStore()
  if(!user) return null

  const level = user.level
  const [min,max] = LEVEL_THRESHOLDS[level]
  const progress = Math.min(100, ((user.eco_score - min) / (max - min)) * 100)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-semibold text-[#E8F5EE] mb-5">Profile</h1>
      {/* Profile card */}
      <div className="bg-[#111E17] border border-[#1E3028] rounded-2xl p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-[#22A66A]/20 flex items-center justify-center text-2xl font-bold text-[#22A66A]">{user.name[0]}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-[#E8F5EE]">{user.name}</h2>
              {user.is_verified && <span className="text-[#22A66A] text-sm">✓</span>}
            </div>
            <div className="text-xs text-[#8BAF9A] mt-0.5">{user.role} · {user.ward}, Puducherry</div>
            <div className="flex items-center gap-4 mt-3 text-xs text-[#8BAF9A]">
              <span><span className="text-[#E8F5EE] font-medium">{user.followers_count}</span> followers</span>
              <span><span className="text-[#E8F5EE] font-medium">{user.following_count}</span> following</span>
              <span><span className="text-[#E8F5EE] font-medium">{user.streak_days}</span> day streak 🔥</span>
            </div>
          </div>
        </div>
      </div>

      {/* EcoScore */}
      <div className="bg-[#111E17] border border-[#1E3028] rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-[#8BAF9A]">EcoScore</div>
            <div className="text-2xl font-bold text-[#22A66A]">{user.eco_score} pts</div>
          </div>
          <div className="text-right">
            <div className="text-2xl">{LEVEL_EMOJI[level]}</div>
            <div className="text-xs font-medium text-[#E8F5EE]">{level.replace('_',' ')}</div>
          </div>
        </div>
        <div className="w-full bg-[#1E3028] rounded-full h-2 mb-2">
          <div className="h-2 rounded-full bg-[#22A66A] transition-all" style={{width:`${Math.max(2,progress)}%`}}/>
        </div>
        <div className="flex justify-between text-[10px] text-[#8BAF9A]">
          <span>{min} pts</span>
          <span>{level==='ECO_CHAMPION' ? 'Max level!' : `${max} pts`}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          {label:'Reports',value:user.report_count||0,icon:'📋'},
          {label:'Streak',value:`${user.streak_days}d`,icon:'🔥'},
          {label:'Badges',value:user.achievements?.length||0,icon:'🏅'},
        ].map(s=>(
          <div key={s.label} className="bg-[#111E17] border border-[#1E3028] rounded-xl p-4 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-lg font-semibold text-[#E8F5EE]">{s.value}</div>
            <div className="text-[10px] text-[#8BAF9A]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="bg-[#111E17] border border-[#1E3028] rounded-2xl p-5">
        <h3 className="text-sm font-medium text-[#E8F5EE] mb-4">Achievement Badges</h3>
        {user.achievements?.length > 0 ? (
          <div className="grid grid-cols-4 gap-3">
            {user.achievements.map((a:any)=>{
              const info = BADGE_INFO[a.badge_key]||{name:a.badge_key,icon:'🏆'}
              return (
                <div key={a.badge_key} className="text-center p-3 bg-[#162219] rounded-xl border border-[#1E3028]">
                  <div className="text-2xl mb-1">{info.icon}</div>
                  <div className="text-[10px] text-[#8BAF9A] leading-tight">{info.name}</div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-[#8BAF9A] text-xs">
            <div className="text-3xl mb-2">🌱</div>
            Start reporting issues to earn badges!
          </div>
        )}
      </div>
    </div>
  )
}
