import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsAPI } from '../api'
import { Bell, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const TYPE_ICON: Record<string,string> = {
  STATUS_UPDATE:'📋',NGO_DECISION:'🏢',COMMENT:'💬',ACHIEVEMENT:'🏅',WARD_CHALLENGE:'🏆',SYSTEM:'🔔',AUTHORITY_ACTION:'🏛️'
}

export default function NotificationsPage() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey:['notifications'], queryFn:()=>notificationsAPI.get().then(r=>r.data) })
  const readMut = useMutation({ mutationFn:()=>notificationsAPI.readAll(), onSuccess:()=>qc.invalidateQueries({queryKey:['notifications']}) })

  const notifications = data?.notifications || []
  const unread = data?.unread_count || 0

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-[#E8F5EE]"/>
          <h1 className="font-semibold text-[#E8F5EE]">Notifications</h1>
          {unread>0 && <span className="bg-[#E85038] text-white text-xs px-2 py-0.5 rounded-full">{unread}</span>}
        </div>
        {unread>0 && <button onClick={()=>readMut.mutate()} className="flex items-center gap-1 text-xs text-[#22A66A] hover:underline"><CheckCheck size={13}/>Mark all read</button>}
      </div>

      {notifications.length===0 ? (
        <div className="text-center py-16 text-[#8BAF9A]"><div className="text-4xl mb-3">🔔</div><div className="text-sm">No notifications yet</div></div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n:any)=>(
            <div key={n.id} className={`bg-[#111E17] border rounded-xl p-4 transition ${!n.is_read?'border-[#22A66A]/30 bg-[#22A66A]/5':'border-[#1E3028]'}`}>
              <div className="flex items-start gap-3">
                <div className="text-xl flex-shrink-0">{TYPE_ICON[n.type]||'🔔'}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#E8F5EE]">{n.title}</div>
                  <div className="text-xs text-[#8BAF9A] mt-0.5">{n.message}</div>
                  <div className="text-[10px] text-[#8BAF9A] mt-1">{formatDistanceToNow(new Date(n.created_at),{addSuffix:true})}</div>
                </div>
                {!n.is_read && <div className="w-2 h-2 rounded-full bg-[#22A66A] flex-shrink-0 mt-1"/>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
