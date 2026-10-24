import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Questions(){
  const [questions,setQuestions]=useState([]);
  const [subTab,setSubTab]=useState("questions"); // questions | addition
  const [answers,setAnswers]=useState({}); // qid -> choice
  const [results,setResults]=useState({}); // qid -> result
  const [form,setForm]=useState({question:"",option_a:"",option_b:"",option_c:"",option_d:"",correct:"A",category:"general"});
  const [msg,setMsg]=useState("");

  const load = ()=>{
    axios.get("/api/questions/").then(r=>setQuestions(r.data.questions||[])).catch(()=>{});
  };
  useEffect(()=>{ load(); },[]);

  const seed = ()=> axios.post("/api/questions/seed").then(load);
  const submitAnswer = (qid)=>{
    const choice = answers[qid];
    if(!choice) return;
    axios.post("/api/questions/answer",{question_id:qid, choice}).then(r=>{
      setResults(prev=>({...prev,[qid]: r.data}));
    });
  };
  const create = ()=>{
    if(!form.question || !form.option_a || !form.option_b) { setMsg("Fill question + at least A/B"); return; }
    axios.post("/api/questions/", form).then(()=>{
      setMsg("Added!");
      setForm({question:"",option_a:"",option_b:"",option_c:"",option_d:"",correct:"A",category:"general"});
      load();
      setTimeout(()=>setMsg(""),2000);
    }).catch(e=>setMsg("Error: "+e.message));
  };
  const remove = (id)=> axios.delete(`/api/questions/${id}`).then(load);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-black">Questions <span className="text-gold">— Every Run</span></h1>
          <p className="text-xs text-white/50">Always appears on every run • Multiple choices • Addition tab to create new • Persisted in unified DB</p>
          <div className="text-[11px] font-mono bg-white/5 border border-white/10 rounded px-2 py-1 mt-2">Count: {questions.length} • Run: {new Date().toISOString().slice(0,10)} • Auto-seeded if empty</div>
        </div>
        <div className="flex gap-2">
          <button onClick={seed} className="bg-white/10 border border-white/20 px-3 py-1.5 rounded text-xs">Re-seed 7</button>
          <button onClick={load} className="bg-white text-black px-3 py-1.5 rounded text-xs font-bold">Reload</button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/10">
        <button onClick={()=>setSubTab("questions")} className={`px-4 py-2 text-xs font-bold border-b-2 ${subTab==="questions" ? "border-gold text-gold" : "border-transparent text-white/60"}`}>Question Tab — Multiple Choices</button>
        <button onClick={()=>setSubTab("addition")} className={`px-4 py-2 text-xs font-bold border-b-2 ${subTab==="addition" ? "border-gold text-gold" : "border-transparent text-white/60"}`}>Addition Tab — Add New</button>
      </div>

      {subTab==="questions" && (
        <div className="space-y-3">
          {questions.length===0 ? <div className="text-xs text-white/40 border border-dashed border-white/20 rounded p-4">No questions — auto-seeding on first load. Click Re-seed.</div> :
          questions.map((q,idx)=>(
            <div key={q.id} className="border border-white/10 rounded-xl p-4 bg-white/[0.03] text-xs space-y-3">
              <div className="flex justify-between">
                <div className="font-bold text-white">Q{idx+1}: {q.question} <span className="text-white/30">[{q.category}]</span></div>
                <button onClick={()=>remove(q.id)} className="text-red-400 text-[10px]">delete</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["A", q.option_a],
                  ["B", q.option_b],
                  ["C", q.option_c],
                  ["D", q.option_d],
                ].map(([letter, text])=>(
                  <label key={letter} className={`flex gap-2 items-center border rounded-lg px-3 py-2 cursor-pointer ${answers[q.id]===letter ? "bg-white text-black border-white" : "bg-black border-white/20 hover:bg-white/5"}`}>
                    <input type="radio" name={`q-${q.id}`} checked={answers[q.id]===letter} onChange={()=>setAnswers(prev=>({...prev,[q.id]:letter}))} />
                    <span className="font-black">{letter}.</span> {text}
                  </label>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <button onClick={()=>submitAnswer(q.id)} className="bg-gold text-black px-3 py-1 rounded text-xs font-bold">Submit</button>
                {results[q.id] && (
                  <span className={`text-xs font-bold ${results[q.id].is_correct ? "text-emerald-400" : "text-red-400"}`}>
                    {results[q.id].is_correct ? "✅ Correct!" : `❌ Wrong — Correct: ${results[q.id].correct_answer}`} {results[q.id].explanation ? `• ${results[q.id].explanation}` : ""}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab==="addition" && (
        <div className="border border-gold/30 rounded-xl p-4 bg-white/[0.02] space-y-3 max-w-3xl">
          <h2 className="text-sm font-bold text-gold">Addition Tab — Add New Question</h2>
          <input placeholder="Question text" value={form.question} onChange={e=>setForm({...form,question:e.target.value})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-xs" />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Option A" value={form.option_a} onChange={e=>setForm({...form,option_a:e.target.value})} className="bg-black border border-white/20 rounded px-3 py-2 text-xs" />
            <input placeholder="Option B" value={form.option_b} onChange={e=>setForm({...form,option_b:e.target.value})} className="bg-black border border-white/20 rounded px-3 py-2 text-xs" />
            <input placeholder="Option C" value={form.option_c} onChange={e=>setForm({...form,option_c:e.target.value})} className="bg-black border border-white/20 rounded px-3 py-2 text-xs" />
            <input placeholder="Option D" value={form.option_d} onChange={e=>setForm({...form,option_d:e.target.value})} className="bg-black border border-white/20 rounded px-3 py-2 text-xs" />
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-xs">Correct:</label>
            <select value={form.correct} onChange={e=>setForm({...form,correct:e.target.value})} className="bg-black border border-white/20 rounded px-2 py-1 text-xs">
              <option>A</option><option>B</option><option>C</option><option>D</option>
            </select>
            <input placeholder="category (general/publisher/funnel/manychat)" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="flex-1 bg-black border border-white/20 rounded px-3 py-1 text-xs" />
          </div>
          <button onClick={create} className="bg-gold text-black px-4 py-1.5 rounded text-xs font-bold w-full">Add Question → appears every run</button>
          {msg && <div className="text-xs text-emerald-400">{msg}</div>}
          <div className="text-[11px] text-white/30">Questions stored in unified DB `Question` table — loaded via GET /api/questions/ on every app start (auto-seeded if empty).</div>
        </div>
      )}
    </div>
  );
}
