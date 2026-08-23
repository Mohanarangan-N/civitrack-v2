import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useTranslation } from 'react-i18next'
import { Home, Map, PlusCircle, Trophy, BarChart2, Bell, User, LogOut, Shield, Building2 } from 'lucide-react'

export default function Layout() {
  const { user, logout, lang, setLang } = useAuthStore()
  const { t, i18n } = useTranslation()
  const nav = useNavigate()

  const handleLang = (l: 'en'|'ta'|'fr') => {
    setLang(l); i18n.changeLanguage(l)
  }

  const links = [
    { to:'/feed', icon:<Home size={20}/>, label:t('feed') },
    { to:'/map', icon:<Map size={20}/>, label:t('map') },
    { to:'/report', icon:<PlusCircle size={20}/>, label:t('report') },
    { to:'/leaderboard', icon:<Trophy size={20}/>, label:t('leaderboard') },
    { to:'/analytics', icon:<BarChart2 size={20}/>, label:t('analytics') },
    { to:'/notifications', icon:<Bell size={20}/>, label:t('notifications') },
    { to:'/profile', icon:<User size={20}/>, label:t('profile') },
    ...(user?.role==='NGO' ? [{ to:'/ngo', icon:<Shield size={20}/>, label:'NGO Dashboard' }] : []),
    ...(user?.role==='AUTHORITY' ? [{ to:'/authority', icon:<Building2 size={20}/>, label:'Authority' }] : []),
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-[#111E17] border-r border-[#1E3028] flex flex-col">
        <div className="p-4 border-b border-[#1E3028]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">C</div>
            <div>
              <div className="text-sm font-semibold text-[#E8F5EE]">CiviTrack</div>
              <div className="text-[10px] text-[#8BAF9A]">Puducherry</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} className={({isActive})=>`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isActive?'bg-primary text-white':'text-[#8BAF9A] hover:bg-[#162219] hover:text-[#E8F5EE]'}`}>
              {l.icon}<span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-[#1E3028] space-y-2">
          {/* Language toggle */}
          <div className="flex gap-1">
            {(['en','ta','fr'] as const).map(l => (
              <button key={l} onClick={()=>handleLang(l)} className={`flex-1 text-xs py-1 rounded ${lang===l?'bg-primary text-white':'bg-[#162219] text-[#8BAF9A]'}`}>{l==='en'?'EN':l==='ta'?'த':'FR'}</button>
            ))}
          </div>
          {/* User + logout */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center text-xs font-bold text-white">{user?.name[0]}</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-[#E8F5EE] truncate">{user?.name}</div>
              <div className="text-[10px] text-[#8BAF9A]">{user?.eco_score} pts</div>
            </div>
            <button onClick={()=>{logout();nav('/')}} className="text-[#8BAF9A] hover:text-red-400"><LogOut size={14}/></button>
          </div>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-[#0A1510]">
        <Outlet />
      </main>
    </div>
  )
}
