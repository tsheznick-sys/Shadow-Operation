import React, {useEffect,useState} from 'react'
import axios from 'axios'
export default function Queue(){
  const [posts,setPosts]=useState([]); const [content,setContent]=useState([])
  const load=()=>{ axios.get('/api/publish/').then(r=>setPosts(r.data.queue||[])); axios.get('/api/content/').then(r=>setContent(r.data.content||[])) }
  useEffect(()=>load(),[])
  const schedule=()=>axios.post('/api/publish/schedule-day1').then(load)
  const getContent=(cid)=> content.find(c=> c.id===cid) || {}
  return (<div className="p-6 max-w-6xl mx-auto">
    <div className="flex justify-between items-center"><div><h1 className="text-xl font-bold">Publish Queue — <span className="text-gold">G4 Approve</span></h1></div><button onClick={schedule} className="bg-gold text-black px-4 py-1.5 rounded text-xs font-bold">Schedule Day 1 → pending_approval</button></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">{posts.map(p=>{const c=getContent(p.content_id); return (<div key={p.id} className="border-2 border-gold/20 rounded p-3 text-xs"><div className="font-semibold">{c.hook||c.id}</div><div>{c.story}</div><button onClick={()=>axios.post('/api/publish/approve/'+p.id).then(load)} className="bg-black text-gold border border-gold px-2 py-1 rounded mt-2">Approve</button></div>)})}</div>
  </div>)
}
