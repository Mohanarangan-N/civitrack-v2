import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { issuesAPI } from '../api'
import { Issue, Comment, CATEGORY_EMOJI, PRIORITY_COLOR, STATUS_COLOR } from '../types'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Heart, ArrowLeft, MapPin, Clock, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function IssueDetailPage() {
  const { id } = useParams<{id:string}>()
  const { user } = useAuthStore()
  const nav = useNavigate()
  const qc = useQueryClient()
  const [comment, setComment] = useState('')

  const { data: issue, isLoading } = useQuery<Issue>({
    queryKey: ['issue', id],
    queryFn: () => issuesAPI.get(id!).then(r => r.data)
  })
  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ['comments', id],
    queryFn: () => issuesAPI.getComments(id!).then(r => r.data)
  })

  const likeMut = useMutation({ mutationFn: () => issuesAPI.like(id!), onSuccess: () => qc.invalidateQueries({queryKey:['issue',id]}) })
  const commentMut = useMutation({
    mutationFn: () => issuesAPI.addComment(id!, { content: comment }),
    onSuccess: () => { setComment(''); qc.invalidateQueries({queryKey:['comments',id]}) }
  })
  const citizenVerifyMut = useMutation({
    mutationFn: () => issuesAPI.citizenVerify(id!),
    onSuccess: () => { toast.success('Resolution confirmed! Thank you.'); qc.invalidateQueries({queryKey:['issue',id]}) }
  })

  if (isLoading) return <div className="flex items-center justify-center h-64 text-[#8BAF9A] text-sm">Loading issue...</div>
  if (!issue) return <div className="text-center py-12 text-[#8BAF9A]">Issue not found</div>

  const isReporter = user && issue.reporter_id === user.id
  const canVerify = isReporter && issue.status === 'RESOLVED' && !issue.citizen_verified_resolved

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={()=>nav(-1)} className="flex items-center gap-2 text-sm text-[#8BAF9A] hover:text-[#E8F5EE] mb-5 transition">
        <ArrowLeft size={16}/> Back
      </button>

      <div className="bg-[#111E17] border border-[#1E3028] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#1E3028]">
          <div className="flex items-start gap-3">
            <div className="text-3xl">{CATEGORY_EMOJI[issue.category]}</div>
            <div className="flex-1">
              <h1 className="font-semibold text-[#E8F5EE] text-base mb-2">{issue.title}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-full font-medium" style={{background:`${PRIORITY_COLOR[issue.priority]}20`,color:PRIORITY_COLOR[issue.priority]}}>{issue.priority}</span>
                <span className="text-xs px-2 py-1 rounded-full" style={{background:`${STATUS_COLOR[issue.status]}20`,color:STATUS_COLOR[issue.status]}}>{issue.status.replace(/_/g,' ')}</span>
                <span className="text-xs text-[#8BAF9A] flex items-center gap-1"><MapPin size={11}/>{issue.ward}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Photo */}
        {issue.attachments?.length > 0 && (
          <img src={issue.attachments[0].file_url} alt="Issue" className="w-full max-h-64 object-cover"/>
        )}

        {/* Body */}
        <div className="p-5">
          <p className="text-sm text-[#8BAF9A] leading-relaxed mb-4">{issue.description}</p>

          {/* AI Badge */}
          {issue.ai?.confidence > 0 && (
            <div className="bg-[#162219] border border-[#1E3028] rounded-xl p-3 mb-4">
              <div className="text-xs font-medium text-[#22A66A] mb-1">🤖 AI Classification</div>
              <div className="flex gap-3 text-xs text-[#8BAF9A]">
                <span>Category: <span className="text-[#E8F5EE]">{issue.ai.category}</span></span>
                <span>Confidence: <span className="text-[#E8F5EE]">{Math.round(issue.ai.confidence*100)}%</span></span>
                <span>Score: <span className="text-[#E8F5EE]">{issue.ai.total_score?.toFixed(1)}/100</span></span>
              </div>
              {issue.ai.summary && <p className="text-xs text-[#8BAF9A] mt-2 italic">{issue.ai.summary}</p>}
            </div>
          )}

          {/* Citizen verify */}
          {canVerify && (
            <div className="bg-[#22A66A]/10 border border-[#22A66A]/30 rounded-xl p-4 mb-4">
              <div className="text-sm font-medium text-[#22A66A] mb-1">✅ Issue marked as resolved</div>
              <p className="text-xs text-[#8BAF9A] mb-3">Please confirm if the issue has been physically fixed.</p>
              <button onClick={()=>citizenVerifyMut.mutate()} className="text-xs bg-[#22A66A] text-white px-4 py-2 rounded-lg hover:bg-[#1a8a56] transition">
                Confirm Resolution
              </button>
            </div>
          )}

          {/* Status timeline */}
          <div className="mb-4">
            <div className="text-xs font-medium text-[#8BAF9A] mb-3">Status Timeline</div>
            <div className="space-y-2">
              {issue.status_history?.map((h,i)=>(
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{background:STATUS_COLOR[h.status]||'#888'}}/>
                  <div>
                    <div className="text-xs font-medium text-[#E8F5EE]">{h.status.replace(/_/g,' ')}</div>
                    <div className="text-[10px] text-[#8BAF9A]">{h.note} · {h.changed_at ? formatDistanceToNow(new Date(h.changed_at),{addSuffix:true}) : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t border-[#1E3028] pt-4">
            <button onClick={()=>likeMut.mutate()} className="flex items-center gap-2 px-4 py-2 bg-[#162219] border border-[#1E3028] rounded-lg text-sm text-[#8BAF9A] hover:text-[#E85038] transition">
              <Heart size={15}/> {issue.like_count}
            </button>
            <button onClick={()=>{navigator.clipboard.writeText(window.location.href); toast.success('Link copied!')}} className="flex items-center gap-2 px-4 py-2 bg-[#162219] border border-[#1E3028] rounded-lg text-sm text-[#8BAF9A] hover:text-[#22A66A] transition">
              Share
            </button>
          </div>
        </div>

        {/* Comments */}
        <div className="border-t border-[#1E3028] p-5">
          <div className="text-sm font-medium text-[#E8F5EE] mb-4">Comments ({comments.length})</div>
          <div className="space-y-3 mb-4">
            {comments.map((c:Comment)=>(
              <div key={c.id} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#22A66A]/20 flex items-center justify-center text-xs font-bold text-[#22A66A] flex-shrink-0">{c.user_name[0]}</div>
                <div className="flex-1 bg-[#162219] rounded-xl px-3 py-2">
                  <div className="text-xs font-medium text-[#E8F5EE]">{c.user_name} <span className="text-[#8BAF9A] font-normal">· {c.user_role}</span></div>
                  <div className="text-xs text-[#8BAF9A] mt-1">{c.content}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-[#162219] border border-[#1E3028] rounded-lg px-3 py-2 text-sm text-[#E8F5EE] outline-none focus:border-[#22A66A]"/>
            <button onClick={()=>comment&&commentMut.mutate()} disabled={!comment||commentMut.isPending} className="px-4 py-2 bg-[#22A66A] text-white text-sm rounded-lg hover:bg-[#1a8a56] disabled:opacity-50 transition">Post</button>
          </div>
        </div>
      </div>
    </div>
  )
}
