import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { issuesAPI, storiesAPI } from '../api'
import { Issue, Story, CATEGORY_EMOJI, PRIORITY_COLOR, STATUS_COLOR } from '../types'
import { Heart, MessageCircle, Share2, Bookmark, MapPin, Clock, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

function StoryRing({ story }: { story: Story }) {
  return (
    <div className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0">
      <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-[#22A66A] to-[#3B9ED4]">
        <div className="w-full h-full rounded-full bg-[#111E17] flex items-center justify-center text-xl border-2 border-[#111E17]">
          {story.story_type === 'NGO_ALERT' ? '🏢' : story.story_type === 'AUTHORITY_UPDATE' ? '🏛️' : '👤'}
        </div>
      </div>
      <span className="text-[10px] text-[#8BAF9A] text-center max-w-[56px] truncate">{story.ward || story.user_name}</span>
    </div>
  )
}

function IssueCard({ issue }: { issue: Issue }) {
  const nav = useNavigate()
  const qc = useQueryClient()
  const likeMut = useMutation({ mutationFn: () => issuesAPI.like(issue.id), onSuccess: () => qc.invalidateQueries({queryKey:['feed']}) })

  const img = issue.attachments?.[0]?.file_url
  const isAnon = issue.anonymous?.is_anonymous
  const name = isAnon ? 'Anonymous Citizen 🎭' : (issue.anonymous?.display_name || 'Citizen')
  const time = issue.anonymous?.timestamp_blurred
    ? formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })
    : formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })

  return (
    <div className="bg-[#111E17] border border-[#1E3028] rounded-2xl overflow-hidden mb-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className="w-9 h-9 rounded-full bg-[#22A66A]/20 flex items-center justify-center text-sm font-bold text-[#22A66A]">{name[0]}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#E8F5EE]">{name}</span>
            {isAnon && <span className="text-[10px] bg-[#B57BFF]/20 text-[#B57BFF] px-1.5 py-0.5 rounded">Anonymous</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{background:`${PRIORITY_COLOR[issue.priority]}20`,color:PRIORITY_COLOR[issue.priority]}}>{issue.priority}</span>
            <span className="text-[10px] text-[#8BAF9A]">{CATEGORY_EMOJI[issue.category]} {issue.category}</span>
            <span className="text-[10px] text-[#8BAF9A]">· {time}</span>
          </div>
        </div>
      </div>
      {/* Image */}
      {img && <div className="relative"><img src={img} alt="Issue" className="w-full h-48 object-cover"/><div className="absolute top-2 right-2 text-2xl">{CATEGORY_EMOJI[issue.category]}</div></div>}
      {!img && <div className="h-24 bg-[#162219] flex items-center justify-center text-4xl">{CATEGORY_EMOJI[issue.category]}</div>}
      {/* Body */}
      <div className="p-4">
        <div className="font-medium text-sm text-[#E8F5EE] mb-1 cursor-pointer hover:text-[#22A66A]" onClick={()=>nav(`/issues/${issue.id}`)}>{issue.title}</div>
        <div className="text-xs text-[#8BAF9A] mb-3 line-clamp-2">{issue.description}</div>
        <div className="flex items-center gap-1 text-xs text-[#8BAF9A] mb-3">
          <MapPin size={11}/><span>{issue.anonymous?.exact_coords_public===false ? issue.ward : (issue.address || issue.ward)}</span>
        </div>
        {/* Status bar */}
        <div className="flex items-center gap-2 p-2 rounded-lg mb-3" style={{background:`${STATUS_COLOR[issue.status]}15`}}>
          <div className="w-2 h-2 rounded-full" style={{background:STATUS_COLOR[issue.status]}}></div>
          <span className="text-xs font-medium" style={{color:STATUS_COLOR[issue.status]}}>{issue.status.replace('_',' ')}</span>
        </div>
        {/* Actions */}
        <div className="flex items-center border-t border-[#1E3028] pt-3 -mx-4 px-4 gap-1">
          {[
            { icon:<Heart size={15}/>, count:issue.like_count, action:()=>likeMut.mutate(), color:'text-[#E85038]' },
            { icon:<MessageCircle size={15}/>, count:issue.comment_count, action:()=>nav(`/issues/${issue.id}`), color:'text-[#3B9ED4]' },
            { icon:<Share2 size={15}/>, count:issue.share_count, action:()=>{navigator.clipboard.writeText(window.location.href+`issues/${issue.id}`);toast.success('Link copied!')}, color:'text-[#22A66A]' },
            { icon:<Bookmark size={15}/>, count:null, action:()=>toast.success('Bookmarked!'), color:'text-[#FFD060]' },
          ].map((a,i)=>(
            <button key={i} onClick={a.action} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#8BAF9A] hover:${a.color} hover:bg-[#162219] transition flex-1 justify-center`}>
              {a.icon}{a.count !== null && <span>{a.count}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function FeedPage() {
  const { data: issues=[], isLoading } = useQuery({ queryKey:['feed'], queryFn: ()=>issuesAPI.list().then(r=>r.data) })
  const { data: stories=[] } = useQuery({ queryKey:['stories'], queryFn: ()=>storiesAPI.get().then(r=>r.data) })

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-semibold text-[#E8F5EE]">Community Feed</h1>
        <span className="text-xs text-[#8BAF9A]">Puducherry</span>
      </div>
      {/* Stories */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <div className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0">
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#22A66A] flex items-center justify-center text-[#22A66A] text-2xl">+</div>
          <span className="text-[10px] text-[#8BAF9A]">Your story</span>
        </div>
        {stories.map((s:Story)=><StoryRing key={s.id} story={s}/>)}
      </div>
      {/* Feed */}
      {isLoading && <div className="text-center py-12 text-[#8BAF9A] text-sm">Loading civic feed...</div>}
      {!isLoading && issues.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🌱</div>
          <div className="text-sm text-[#8BAF9A]">No verified issues yet.</div>
          <div className="text-xs text-[#8BAF9A] mt-1">Be the first to report a civic issue!</div>
        </div>
      )}
      {issues.map((issue:Issue)=><IssueCard key={issue.id} issue={issue}/>)}
    </div>
  )
}
