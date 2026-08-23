import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ngoAPI, issuesAPI } from '../api'
import { Issue, CATEGORY_EMOJI, PRIORITY_COLOR } from '../types'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { Shield } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const REJECT_REASONS = ['UNCLEAR_PHOTO','WRONG_LOCATION','NOT_CIVIC_ISSUE','DUPLICATE','INAPPROPRIATE']

export default function NGODashboard() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [rejectId, setRejectId] = useState<string|null>(null)
  const [reason, setReason] = useState('NOT_CIVIC_ISSUE')

  const { data: pending=[], isLoading } = useQuery({
    queryKey: ['ngo-pending'],
    queryFn: () => ngoAPI.pending().then(r => r.data),
    refetchInterval: 15000,
  })

  const verifyMut = useMutation({
    mutationFn: ({id,action,reason}:{id:string,action:string,reason?:string}) => issuesAPI.verify(id,{action,reason}),
    onSuccess: (_, vars) => {
      toast.success(vars.action === 'APPROVE' ? '✅ Issue approved & published!' : '❌ Issue rejected')
      setRejectId(null)
      qc.invalidateQueries({queryKey:['ngo-pending']})
    }
  })

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-5">
        <Shield size={20} className="text-[#22A66A]"/>
        <div>
          <h1 className="font-semibold text-[#E8F5EE]">NGO Verification Dashboard</h1>
          <p className="text-xs text-[#8BAF9A]">Ward: {user?.ward} · {pending.length} pending</p>
        </div>
      </div>

      {isLoading && <div className="text-center py-12 text-[#8BAF9A] text-sm">Loading pending issues...</div>}

      {!isLoading && pending.length === 0 && (
        <div className="text-center py-12 bg-[#111E17] border border-[#1E3028] rounded-2xl">
          <div className="text-4xl mb-3">✅</div>
          <div className="text-sm text-[#8BAF9A]">No pending issues in {user?.ward}!</div>
          <div className="text-xs text-[#8BAF9A] mt-1">Great job — your ward is all clear.</div>
        </div>
      )}

      <div className="space-y-4">
        {pending.map((issue:Issue)=>(
          <div key={issue.id} className="bg-[#111E17] border border-[#1E3028] rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-start gap-3 p-4 border-b border-[#1E3028]">
              <div className="text-2xl">{CATEGORY_EMOJI[issue.category]}</div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-[#E8F5EE]">{issue.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{background:`${PRIORITY_COLOR[issue.priority]}20`,color:PRIORITY_COLOR[issue.priority]}}>{issue.priority}</span>
                  <span className="text-xs text-[#8BAF9A]">{issue.ward}</span>
                  <span className="text-xs text-[#8BAF9A]">{formatDistanceToNow(new Date(issue.created_at),{addSuffix:true})}</span>
                </div>
              </div>
            </div>

            {/* Photo */}
            {issue.attachments?.[0] && <img src={issue.attachments[0].file_url} alt="Evidence" className="w-full h-40 object-cover"/>}

            {/* Description */}
            <div className="p-4 border-b border-[#1E3028]">
              <p className="text-xs text-[#8BAF9A] leading-relaxed">{issue.description}</p>
              {issue.ai?.confidence > 0 && (
                <div className="mt-2 text-xs text-[#22A66A]">🤖 AI: {issue.ai.category} · {Math.round(issue.ai.confidence*100)}% confidence · Score: {issue.ai.total_score?.toFixed(0)}/100</div>
              )}
            </div>

            {/* Reject modal */}
            {rejectId === issue.id && (
              <div className="p-4 bg-[#E85038]/5 border-b border-[#1E3028]">
                <div className="text-xs font-medium text-[#E85038] mb-2">Select rejection reason:</div>
                <select value={reason} onChange={e=>setReason(e.target.value)} className="w-full bg-[#0A1510] border border-[#1E3028] rounded-lg px-3 py-2 text-xs text-[#E8F5EE] mb-3 outline-none">
                  {REJECT_REASONS.map(r=><option key={r}>{r.replace('_',' ')}</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={()=>verifyMut.mutate({id:issue.id,action:'REJECT',reason})} className="flex-1 bg-[#E85038] text-white text-xs py-2 rounded-lg">Confirm Reject</button>
                  <button onClick={()=>setRejectId(null)} className="flex-1 border border-[#1E3028] text-[#8BAF9A] text-xs py-2 rounded-lg">Cancel</button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 p-4">
              <button onClick={()=>verifyMut.mutate({id:issue.id,action:'APPROVE'})} disabled={verifyMut.isPending} className="flex-1 bg-[#22A66A] text-white text-sm py-2.5 rounded-xl font-medium hover:bg-[#1a8a56] transition disabled:opacity-50">✅ Approve & Publish</button>
              <button onClick={()=>verifyMut.mutate({id:issue.id,action:'ESCALATE'})} className="px-4 text-sm border border-[#E85038] text-[#E85038] rounded-xl hover:bg-[#E85038]/10 transition">⬆️ Critical</button>
              <button onClick={()=>setRejectId(issue.id)} className="px-4 text-sm border border-[#1E3028] text-[#8BAF9A] rounded-xl hover:bg-[#162219] transition">❌ Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
