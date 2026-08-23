import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { issuesAPI, analyticsAPI } from '../api'
import { Issue, CATEGORY_EMOJI, PRIORITY_COLOR, STATUS_COLOR } from '../types'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { Building2 } from 'lucide-react'

export default function AuthorityDashboard() {
  const qc = useQueryClient()
  const { data: summary } = useQuery({ queryKey:['summary'], queryFn:()=>analyticsAPI.summary().then(r=>r.data) })
  const { data: issues=[] } = useQuery({ queryKey:['authority-issues'], queryFn:()=>issuesAPI.list({limit:50}).then(r=>r.data) })
  const [statusFilter, setStatusFilter] = useState('VERIFIED')

  const updateMut = useMutation({
    mutationFn: ({id,status,note}:{id:string,status:string,note?:string}) => issuesAPI.updateStatus(id,{status,note}),
    onSuccess: () => { toast.success('Status updated!'); qc.invalidateQueries({queryKey:['authority-issues','summary']}) }
  })

  const filtered = issues.filter((i:Issue)=>statusFilter==='ALL'||i.status===statusFilter)
  const STATUS_TABS = ['ALL','VERIFIED','IN_PROGRESS','RESOLVED']

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-5">
        <Building2 size={20} className="text-[#E8901A]"/>
        <h1 className="font-semibold text-[#E8F5EE]">Authority Command Dashboard</h1>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            {label:'Total',value:summary.total_issues,color:'#3B9ED4'},
            {label:'Open',value:summary.open_issues,color:'#E8901A'},
            {label:'Critical',value:summary.critical_issues,color:'#E85038'},
            {label:'Resolved',value:summary.resolved_issues,color:'#4CC88A'},
          ].map(k=>(
            <div key={k.label} className="bg-[#111E17] border border-[#1E3028] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold" style={{color:k.color}}>{k.value}</div>
              <div className="text-xs text-[#8BAF9A] mt-1">{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {STATUS_TABS.map(s=>(
          <button key={s} onClick={()=>setStatusFilter(s)} className={`px-4 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 transition ${statusFilter===s?'bg-[#22A66A] text-white':'bg-[#111E17] text-[#8BAF9A] border border-[#1E3028] hover:bg-[#162219]'}`}>{s.replace('_',' ')}</button>
        ))}
      </div>

      {/* Issues table */}
      <div className="bg-[#111E17] border border-[#1E3028] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1E3028] text-[#8BAF9A]">
                <th className="text-left px-4 py-3">Issue</th>
                <th className="text-left px-4 py-3">Ward</th>
                <th className="text-left px-4 py-3">Priority</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3028]">
              {filtered.map((issue:Issue)=>(
                <tr key={issue.id} className="hover:bg-[#162219] transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{CATEGORY_EMOJI[issue.category]}</span>
                      <div>
                        <div className="font-medium text-[#E8F5EE] max-w-[160px] truncate">{issue.title}</div>
                        <div className="text-[#8BAF9A]">{issue.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#8BAF9A]">{issue.ward}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full font-medium" style={{background:`${PRIORITY_COLOR[issue.priority]}20`,color:PRIORITY_COLOR[issue.priority]}}>{issue.priority}</span></td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full" style={{background:`${STATUS_COLOR[issue.status]}20`,color:STATUS_COLOR[issue.status]}}>{issue.status.replace('_',' ')}</span></td>
                  <td className="px-4 py-3 text-[#8BAF9A]">{formatDistanceToNow(new Date(issue.created_at),{addSuffix:true})}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {issue.status==='VERIFIED' && <button onClick={()=>updateMut.mutate({id:issue.id,status:'IN_PROGRESS',note:'Assigned to field team'})} className="px-2 py-1 bg-[#E8901A]/20 text-[#E8901A] rounded text-[10px] hover:bg-[#E8901A]/30">Assign</button>}
                      {issue.status==='IN_PROGRESS' && <button onClick={()=>updateMut.mutate({id:issue.id,status:'RESOLVED',note:'Issue resolved by field team'})} className="px-2 py-1 bg-[#22A66A]/20 text-[#22A66A] rounded text-[10px] hover:bg-[#22A66A]/30">Resolve</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length===0 && <div className="text-center py-8 text-[#8BAF9A] text-xs">No issues found for this filter</div>}
        </div>
      </div>
    </div>
  )
}
