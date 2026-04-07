import { useState, useEffect, useRef } from "react";
import { SLIDE_COUNT } from "./src/notes.js";

const channel = new BroadcastChannel("deck-sync");

/* ── Shared sub-components ── */
function SlideButton({onClick,children,active,clr}){
  return(
    <button onClick={onClick} style={{padding:"20px 52px",borderRadius:14,fontWeight:600,fontSize:28,border:active?`3px solid ${clr||"#f59e0b"}`:"3px solid #334155",background:active?"rgba(245,158,11,0.1)":"rgba(30,41,59,0.5)",color:active?(clr||"#f59e0b"):"#94a3b8",cursor:"pointer",transition:"all 0.2s"}}>{children}</button>
  );
}
function SlideTitle({children}){
  return <h1 style={{fontSize:84,fontWeight:700,color:"#f59e0b",textAlign:"center",marginBottom:28,letterSpacing:"-0.5px"}}>{children}</h1>;
}
function KeyInsight({children}){
  return(
    <div style={{fontSize:36,color:"#fbbf24",textAlign:"center",padding:"36px 56px",border:"3px solid rgba(245,158,11,0.4)",borderRadius:20,margin:"40px auto",maxWidth:1700,fontWeight:600,background:"rgba(245,158,11,0.06)",lineHeight:1.5}}>{children}</div>
  );
}
function SectionBreak({part,title,subtitle}){
  return(
    <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",height:"100%",background:"linear-gradient(135deg,#1e293b 0%,#334155 100%)"}}>
      <div style={{fontSize:28,color:"#64748b",letterSpacing:4,textTransform:"uppercase",marginBottom:20}}>{part}</div>
      <div style={{fontSize:72,fontWeight:700,color:"#f8fafc",textAlign:"center",maxWidth:1200,lineHeight:1.3}}>{title}</div>
      {subtitle&&<div style={{fontSize:30,color:"#94a3b8",marginTop:20,textAlign:"center",maxWidth:1000}}>{subtitle}</div>}
    </div>
  );
}

/* ── Beetle SVG (grows exponentially with progress) ── */
function Beetle({scale}){
  const s = Math.max(0.15, scale);
  return(
    <svg width={48*s} height={36*s} viewBox="0 0 48 36" style={{transition:"all 0.6s ease"}}>
      {/* body */}
      <ellipse cx="24" cy="20" rx={12} ry={10} fill="#4ade80" stroke="#166534" strokeWidth="1.5"/>
      {/* wing line */}
      <line x1="24" y1="10" x2="24" y2="30" stroke="#166534" strokeWidth="1"/>
      {/* head */}
      <ellipse cx="24" cy="9" rx={6} ry={5} fill="#22c55e" stroke="#166534" strokeWidth="1.5"/>
      {/* eyes */}
      <circle cx="21" cy="7" r="1.5" fill="#0f172a"/><circle cx="27" cy="7" r="1.5" fill="#0f172a"/>
      {/* antennae */}
      <line x1="20" y1="5" x2="14" y2="1" stroke="#166534" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="28" y1="5" x2="34" y2="1" stroke="#166534" strokeWidth="1.2" strokeLinecap="round"/>
      {/* legs */}
      <line x1="14" y1="16" x2="6" y2="12" stroke="#166534" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="14" y1="22" x2="5" y2="24" stroke="#166534" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="14" y1="28" x2="7" y2="33" stroke="#166534" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="34" y1="16" x2="42" y2="12" stroke="#166534" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="34" y1="22" x2="43" y2="24" stroke="#166534" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="34" y1="28" x2="41" y2="33" stroke="#166534" strokeWidth="1.2" strokeLinecap="round"/>
      {/* shell pattern */}
      <ellipse cx="19" cy="18" rx="4" ry="5" fill="none" stroke="#166534" strokeWidth="0.6" opacity="0.5"/>
      <ellipse cx="29" cy="18" rx="4" ry="5" fill="none" stroke="#166534" strokeWidth="0.6" opacity="0.5"/>
    </svg>
  );
}

/* ── MLE demo data (Moulton 9×10) ── */
const MLE_OBS = [
  [0,1,1,1,1,1,1,1,0,1], // A (missing item 1 coded as 0 for simplicity — 8/9 effective)
  [1,1,1,1,1,1,1,0,1,0], // B
  [1,1,1,1,1,1,0,1,0,0], // C
  [1,1,1,1,1,1,0,1,0,0], // D
  [1,1,1,1,1,1,0,1,0,0], // E
  [1,1,1,1,1,0,1,0,0,0], // F
  [1,1,1,1,0,1,0,0,0,0], // G
  [1,0,1,0,1,0,0,0,0,0], // H
  [0,1,0,1,0,0,0,0,0,0], // I
];
const MLE_LABELS = ["A","B","C","D","E","F","G","H","I"];
const MLE_ITEMS = ["I1","I2","I3","I4","I5","I6","I7","I8","I9","I10"];

function mleExpected(abilities, difficulties){
  return abilities.map(b=>difficulties.map(d=>{const v=Math.exp(b-d);return v/(1+v);}));
}
function mleIterate(obs, ab0, di0, steps){
  let ab=[...ab0], di=[...di0];
  const history=[{ab:[...ab],di:[...di],exp:mleExpected(ab,di)}];
  for(let s=0;s<steps;s++){
    const exp=mleExpected(ab,di);
    // update persons
    const newAb=ab.map((b,p)=>{
      let sumR=0,sumV=0;
      for(let i=0;i<di.length;i++){const e=exp[p][i];sumR+=obs[p][i]-e;sumV+=e*(1-e);}
      return b-sumR/(-sumV);
    });
    // update items
    const newDi=di.map((d,i)=>{
      let sumR=0,sumV=0;
      for(let p=0;p<ab.length;p++){const e=exp[p][i];sumR+=obs[p][i]-e;sumV+=e*(1-e);}
      return d+sumR/(-sumV);
    });
    // center items
    const dm=newDi.reduce((a,b)=>a+b,0)/newDi.length;
    const centeredDi=newDi.map(d=>d-dm);
    ab=newAb;di=centeredDi;
    history.push({ab:[...ab],di:[...di],exp:mleExpected(ab,di)});
  }
  return history;
}
const MLE_INIT_AB = MLE_OBS.map(row=>{const s=row.reduce((a,b)=>a+b,0);const p=s/row.length;return Math.log(Math.max(p,0.05)/Math.max(1-p,0.05));});
const MLE_INIT_DI_RAW = MLE_OBS[0].map((_,i)=>{const s=MLE_OBS.reduce((sum,r)=>sum+r[i],0);const p=s/MLE_OBS.length;return Math.log(Math.max(1-p,0.05)/Math.max(p,0.05));});
const MLE_INIT_DI = (()=>{const m=MLE_INIT_DI_RAW.reduce((a,b)=>a+b,0)/MLE_INIT_DI_RAW.length;return MLE_INIT_DI_RAW.map(d=>d-m);})();
const MLE_HISTORY = mleIterate(MLE_OBS, MLE_INIT_AB, MLE_INIT_DI, 6);

/* ── ICC component for fit slides ── */
function ICC({difficulty,observedPoints,label,misfitType}){
  const w=700,h=320,pad=50;
  const pts=[];
  for(let x=-5;x<=5;x+=0.1){const p=Math.exp(x-difficulty)/(1+Math.exp(x-difficulty));pts.push({x,p});}
  const sx=v=>(v+5)/10*(w-2*pad)+pad;
  const sy=v=>(1-v)*(h-2*pad)+pad;
  return(
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:"auto"}}>
      <rect x={0} y={0} width={w} height={h} fill="rgba(15,23,42,0.3)" rx={12}/>
      {/* axes */}
      <line x1={pad} y1={h-pad} x2={w-pad} y2={h-pad} stroke="#475569" strokeWidth={1.5}/>
      <line x1={pad} y1={pad} x2={pad} y2={h-pad} stroke="#475569" strokeWidth={1.5}/>
      <text x={w/2} y={h-8} textAnchor="middle" fill="#94a3b8" fontSize={14}>Ability (logits)</text>
      <text x={12} y={h/2} textAnchor="middle" fill="#94a3b8" fontSize={14} transform={`rotate(-90,12,${h/2})`}>P(correct)</text>
      {/* ICC curve */}
      <path d={pts.map((p,i)=>`${i===0?"M":"L"}${sx(p.x).toFixed(1)},${sy(p.p).toFixed(1)}`).join(" ")} fill="none" stroke="#f59e0b" strokeWidth={2.5} opacity={0.7}/>
      {/* observed points */}
      {observedPoints&&observedPoints.map((op,i)=>(
        <g key={i}>
          <circle cx={sx(op.ability)} cy={sy(op.proportion)} r={8} fill={misfitType?"#ef4444":"#22c55e"} stroke="#fff" strokeWidth={2}/>
        </g>
      ))}
      {label&&<text x={w/2} y={pad-10} textAnchor="middle" fill="#f8fafc" fontSize={18} fontWeight="bold">{label}</text>}
    </svg>
  );
}

/* ── Main App ── */
export default function App(){
  const [currentSlide,setCurrentSlide]=useState(0);
  // MLE slide state
  const [mleStep,setMleStep]=useState(0);
  // Autofocus slide state
  const [focusStep,setFocusStep]=useState(0);
  // Triple panel slider
  const [logitDiff,setLogitDiff]=useState(0);
  // Fit demo state
  const [fitView,setFitView]=useState(0);

  useEffect(()=>{
    setMleStep(0);setFocusStep(0);setFitView(0);setLogitDiff(0);
  },[currentSlide]);

  useEffect(()=>{
    const h=e=>{if(e.data?.type==="nav")setCurrentSlide(e.data.slide);};
    channel.addEventListener("message",h);
    return()=>channel.removeEventListener("message",h);
  },[]);

  const go=s=>{const ns=Math.max(0,Math.min(SLIDE_COUNT-1,s));setCurrentSlide(ns);channel.postMessage({type:"nav",slide:ns});};

  useEffect(()=>{
    const h=e=>{
      if(e.key==="ArrowRight"||e.key===" ")go(currentSlide+1);
      else if(e.key==="ArrowLeft")go(currentSlide-1);
      else if(e.key==="p"||e.key==="P")window.open("./src/presenter.html","presenter","width=900,height=700");
    };
    window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);
  },[currentSlide]);

  // Beetle grows exponentially: base scale 0.15, multiplied by 1.22^slide
  const beetleScale = 0.15 * Math.pow(1.22, currentSlide);
  const progress = currentSlide/(SLIDE_COUNT-1);

  const slides = [

    // ═══ SLIDE 0 — Title ═══
    ()=>(
      <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",height:"100%",gap:24}}>
        <div style={{fontSize:36,color:"#94a3b8",letterSpacing:2,marginBottom:8}}>SESSION 2</div>
        <div style={{fontSize:84,fontWeight:700,color:"#f59e0b",textAlign:"center",marginBottom:28,letterSpacing:"-0.5px"}}>A <span style={{fontStyle:"italic"}}>tiny</span> bit more about the Rasch Model</div>
        <div style={{fontSize:40,color:"#f8fafc",fontWeight:300,textAlign:"center",lineHeight:1.5,maxWidth:1400}}>Revisiting the Fundamentals of Human Measurement and Digging Deeper into Reliability, Validity, and What Human Measurement Is All About Anyway</div>
      </div>
    ),

    // ═══ SLIDE 1 — Where We Left Off ═══
    ()=>(
      <div style={{padding:"60px 100px"}}>
        <SlideTitle>Where We Left Off</SlideTitle>
        <div style={{display:"flex",flexDirection:"column",gap:40,marginTop:40,maxWidth:1500,margin:"40px auto"}}>
          {[
            {icon:"1",title:"Unidimensionality",desc:"A single latent trait — one continuum of ability"},
            {icon:"2",title:"Persons & Items on the Same Scale",desc:"Items located by difficulty, persons by ability — both in logits"},
            {icon:"3",title:"Invariance",desc:"Person comparisons independent of items; item comparisons independent of persons"},
          ].map((item,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:36}}>
              <div style={{width:80,height:80,borderRadius:"50%",background:"rgba(245,158,11,0.15)",border:"3px solid #f59e0b",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,fontWeight:700,color:"#f59e0b",flexShrink:0}}>{item.icon}</div>
              <div><div style={{fontSize:36,fontWeight:600,color:"#f8fafc"}}>{item.title}</div><div style={{fontSize:28,color:"#94a3b8",marginTop:4}}>{item.desc}</div></div>
            </div>
          ))}
        </div>
        <KeyInsight>Today's question: HOW does the Rasch model build the continuum from a matrix of ones and zeros?</KeyInsight>
      </div>
    ),

    // ═══ SECTION BREAK — Part 1 ═══
    ()=>(<SectionBreak part="Part 1" title="Building the Model" subtitle="What the Rasch model does with your data"/>),

    // ═══ SLIDE 2 — Items as Windows ═══
    ()=>(
      <div style={{padding:"60px 100px"}}>
        <SlideTitle>Items as Windows</SlideTitle>
        <div style={{position:"relative",margin:"20px auto",maxWidth:1400}}>
          {/* Latent trait bar */}
          <div style={{position:"relative",height:100,margin:"60px 0"}}>
            <div style={{position:"absolute",top:44,left:0,right:0,height:12,background:"linear-gradient(90deg,#1e3a5f,#f59e0b,#dc2626)",borderRadius:6,opacity:0.7}}/>
            <div style={{position:"absolute",top:0,left:"5%",textAlign:"center"}}><div style={{fontSize:60}}>📖</div><div style={{fontSize:20,color:"#4ade80",fontWeight:600}}>Easy</div></div>
            <div style={{position:"absolute",top:0,left:"30%",textAlign:"center"}}><div style={{fontSize:60}}>📝</div><div style={{fontSize:20,color:"#38bdf8",fontWeight:600}}>Moderate</div></div>
            <div style={{position:"absolute",top:0,left:"55%",textAlign:"center"}}><div style={{fontSize:60}}>📊</div><div style={{fontSize:20,color:"#fbbf24",fontWeight:600}}>Challenging</div></div>
            <div style={{position:"absolute",top:0,left:"80%",textAlign:"center"}}><div style={{fontSize:60}}>🧠</div><div style={{fontSize:20,color:"#ef4444",fontWeight:600}}>Hard</div></div>
          </div>
          {/* Arrow pointing down to construct */}
          <div style={{textAlign:"center",fontSize:32,color:"#64748b",margin:"30px 0"}}>Each item is a window onto a different level of...</div>
          <div style={{textAlign:"center",fontSize:48,fontWeight:700,color:"#22c55e",padding:"20px",border:"3px solid rgba(34,197,94,0.4)",borderRadius:16,background:"rgba(34,197,94,0.06)"}}>THE LATENT TRAIT</div>
        </div>
        <KeyInsight>Combined in an assessment, items form a cohesive whole — each contributing a piece of the same unidimensional puzzle</KeyInsight>
      </div>
    ),

    // ═══ SLIDE 3a — We Are Not Potatoes ═══
    ()=>(
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 40px",gap:10}}>
        <div style={{fontSize:84,fontWeight:700,color:"#f59e0b",textAlign:"center",marginBottom:28,letterSpacing:"-0.5px"}}>Turns out we <span style={{fontStyle:"italic"}}>are</span> a lot like potatoes</div>
        {/* Hero image */}
        <div style={{position:"relative",width:"100%",maxWidth:1500,borderRadius:20,overflow:"hidden",boxShadow:"0 12px 60px rgba(0,0,0,0.7)"}}>
          <img src="./potatoe.jpg" alt="Fundamental Equality of Person and Potato" style={{width:"100%",display:"block"}}/>
        </div>
      </div>
    ),

    // ═══ SLIDE 3b — What Is a Model? ═══
    ()=>(
      <div style={{padding:"40px 70px"}}>
        <SlideTitle>What Is "a Model"?</SlideTitle>
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:0,margin:"20px auto",maxWidth:1400}}>
          {[
            {step:"1",label:"Collect Data",desc:"Persons × Items\nOnes and zeros"},
            {step:"2",label:"Build Model",desc:"Estimate abilities\n& difficulties"},
            {step:"3",label:"Model = Criterion",desc:"Check each item\nagainst the model"},
            {step:"4",label:"Diagnose Misfit",desc:"Items that don't\nconform → problem"},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center"}}>
              <div style={{width:240,padding:"18px 16px",background:"rgba(56,189,248,0.1)",border:"2px solid #38bdf8",borderRadius:14,textAlign:"center"}}>
                <div style={{fontSize:40,fontWeight:700,color:"#38bdf8"}}>{s.step}</div>
                <div style={{fontSize:22,fontWeight:600,color:"#f8fafc",margin:"4px 0"}}>{s.label}</div>
                <div style={{fontSize:17,color:"#94a3b8",whiteSpace:"pre-line"}}>{s.desc}</div>
              </div>
              {i<3&&<div style={{fontSize:36,color:"#475569",margin:"0 6px"}}>→</div>}
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:28,margin:"24px auto",maxWidth:1400,alignItems:"stretch"}}>
          <div style={{flex:1,padding:"24px 28px",background:"rgba(239,68,68,0.08)",border:"2px solid rgba(239,68,68,0.3)",borderRadius:16}}>
            <div style={{fontSize:26,fontWeight:700,color:"#ef4444",marginBottom:8}}>Other Models (2PL, 3PL)</div>
            <div style={{fontSize:22,color:"#cbd5e1",lineHeight:1.7}}>Add discrimination & guessing parameters<br/>Bend the model to fit the data<br/><span style={{color:"#ef4444",fontWeight:600}}>→ Destroy invariance</span></div>
          </div>
          <div style={{flex:1,padding:"24px 28px",background:"rgba(34,197,94,0.08)",border:"2px solid rgba(34,197,94,0.3)",borderRadius:16}}>
            <div style={{fontSize:26,fontWeight:700,color:"#22c55e",marginBottom:8}}>Rasch Model</div>
            <div style={{fontSize:22,color:"#cbd5e1",lineHeight:1.7}}>No extra parameters — data must fit the model<br/>Misfit = diagnostic information<br/><span style={{color:"#22c55e",fontWeight:600}}>→ Preserve invariance</span></div>
          </div>
        </div>
      </div>
    ),

    // ═══ SLIDE 4a — MLE: Autofocus ═══
    ()=>{
      const blurs=[20,14,9,5,2,0.5,0];
      const b=blurs[Math.min(focusStep,blurs.length-1)];
      const locked=focusStep>=blurs.length-1;
      return(
        <div style={{padding:"30px 70px"}}>
          <SlideTitle>Maximum Likelihood Estimation</SlideTitle>
          <div style={{fontSize:28,color:"#94a3b8",textAlign:"center",marginBottom:16}}>The measurement is already in the data. The algorithm finds the point of sharpest clarity.</div>
          <div style={{display:"flex",gap:40,margin:"0 auto",maxWidth:1500,alignItems:"center"}}>
            {/* Viewfinder */}
            <div style={{flex:1.3,position:"relative"}}>
              <div style={{position:"relative",background:"#000",borderRadius:16,overflow:"hidden",border:"3px solid #334155",aspectRatio:"4/3"}}>
                {/* The "scene" — a simple landscape with a person, progressively sharpening */}
                <svg viewBox="0 0 400 300" style={{width:"100%",display:"block",filter:`blur(${b}px)`,transition:"filter 0.8s ease"}}>
                  {/* Sky */}
                  <rect width="400" height="180" fill="#1e3a5f"/>
                  {/* Stars */}
                  {[{x:50,y:30},{x:120,y:60},{x:200,y:20},{x:280,y:50},{x:350,y:35},{x:90,y:90},{x:320,y:80}].map((s,i)=><circle key={i} cx={s.x} cy={s.y} r={1.5} fill="#f8fafc" opacity={0.6}/>)}
                  {/* Mountains */}
                  <polygon points="0,180 80,100 160,180" fill="#334155"/>
                  <polygon points="100,180 200,80 300,180" fill="#475569"/>
                  <polygon points="220,180 340,110 400,180" fill="#334155"/>
                  {/* Ground */}
                  <rect y="180" width="400" height="120" fill="#166534"/>
                  <rect y="180" width="400" height="120" fill="url(#grass)" opacity="0.3"/>
                  <defs><pattern id="grass" width="8" height="8" patternUnits="userSpaceOnUse"><line x1="4" y1="8" x2="4" y2="4" stroke="#22c55e" strokeWidth="1" opacity="0.5"/></pattern></defs>
                  {/* Potato image in the scene */}
                  <image href="./potatoe_2.png" x="160" y="125" width="80" height="100" preserveAspectRatio="xMidYMid meet"/>
                  {/* Shrubs in the scene */}
                  {[{x:60,y:215},{x:110,y:230},{x:155,y:210},{x:250,y:218},{x:295,y:232},{x:335,y:212},{x:370,y:225}].map((p,i)=>(
                    <g key={i}>
                      <ellipse cx={p.x} cy={p.y} rx={14} ry={10} fill="#166534"/>
                      <ellipse cx={p.x} cy={p.y-4} rx={11} ry={8} fill="#22c55e" opacity={0.7}/>
                      <ellipse cx={p.x+3} cy={p.y-2} rx={8} ry={6} fill="#4ade80" opacity={0.4}/>
                      <rect x={p.x-1.5} y={p.y+6} width={3} height={8} rx={1} fill="#854d0e"/>
                    </g>
                  ))}
                </svg>
                {/* Focus bracket overlay */}
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                  <div style={{width:locked?"45%":"60%",height:locked?"45%":"60%",border:`2px solid ${locked?"#22c55e":"#ef4444"}`,borderRadius:4,transition:"all 0.8s ease",boxShadow:locked?"0 0 20px rgba(34,197,94,0.4)":"none"}}>
                    {locked&&<div style={{position:"absolute",top:-24,left:"50%",transform:"translateX(-50)",fontSize:14,color:"#22c55e",fontWeight:700,whiteSpace:"nowrap"}}>FOCUS LOCKED</div>}
                  </div>
                </div>
                {/* Iteration counter overlay */}
                <div style={{position:"absolute",top:12,right:16,background:"rgba(0,0,0,0.7)",padding:"6px 14px",borderRadius:8}}>
                  <span style={{color:locked?"#22c55e":"#f59e0b",fontSize:18,fontWeight:700}}>{focusStep===0?"Unfocused":`Iteration ${focusStep}${locked?" — Converged":""}`}</span>
                </div>
              </div>
            </div>
            {/* Right — explanation */}
            <div style={{flex:0.8,display:"flex",flexDirection:"column",gap:16}}>
              <div style={{fontSize:26,color:"#f8fafc",lineHeight:1.7}}>
                Like autofocus on a camera:
              </div>
              <div style={{fontSize:22,color:"#cbd5e1",lineHeight:1.8}}>
                <div style={{marginBottom:12}}><span style={{color:"#f59e0b",fontWeight:600}}>1.</span> Start with a blurry image (crude initial estimates)</div>
                <div style={{marginBottom:12}}><span style={{color:"#f59e0b",fontWeight:600}}>2.</span> Evaluate sharpness (compare predicted to observed)</div>
                <div style={{marginBottom:12}}><span style={{color:"#f59e0b",fontWeight:600}}>3.</span> Adjust the lens (update estimates to improve fit)</div>
                <div style={{marginBottom:12}}><span style={{color:"#f59e0b",fontWeight:600}}>4.</span> Repeat until locked (residuals below threshold)</div>
              </div>
              <div style={{padding:"16px 24px",background:"rgba(15,23,42,0.5)",borderRadius:12,borderLeft:"4px solid #22c55e"}}>
                <div style={{fontSize:22,color:"#f8fafc",lineHeight:1.5}}>The image is already there. The algorithm finds the point of <span style={{color:"#22c55e",fontWeight:600}}>maximum sharpness</span> — the estimates that make the observed data as probable as possible.</div>
              </div>
            </div>
          </div>
          {/* Controls */}
          <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:16}}>
            <SlideButton onClick={e=>{e.stopPropagation();setFocusStep(0);}} active={focusStep===0}>Unfocused</SlideButton>
            {[1,2,3,4,5].map(s=><SlideButton key={s} onClick={e=>{e.stopPropagation();setFocusStep(s);}} active={focusStep===s}>Focus {s}</SlideButton>)}
            <SlideButton onClick={e=>{e.stopPropagation();setFocusStep(6);}} active={focusStep===6} clr="#22c55e">Locked</SlideButton>
          </div>
        </div>
      );
    },

    // ═══ SLIDE 4b — MLE: The Iteration ═══
    ()=>{
      const step=Math.min(mleStep,MLE_HISTORY.length-1);
      const h=MLE_HISTORY[step];
      // Compute total residual for this step
      const totalResidual=MLE_OBS.reduce((sum,row,p)=>sum+row.reduce((s,obs,i)=>s+Math.abs(obs-h.exp[p][i]),0),0);
      return(
        <div style={{padding:"30px 50px"}}>
          <div style={{fontSize:48,fontWeight:700,color:"#f59e0b",textAlign:"center",marginBottom:4}}>The Iteration Process</div>
          <div style={{display:"flex",gap:28,margin:"10px auto",maxWidth:1700,justifyContent:"center",alignItems:"flex-start"}}>
            {/* Left: Number line with persons and items */}
            <div style={{flex:1.2}}>
              <div style={{fontSize:20,color:"#94a3b8",marginBottom:8,textAlign:"center"}}>{step===0?"Initial Estimates":"Iteration "+step+" — estimates settling"}</div>
              <svg viewBox="0 0 600 320" style={{width:"100%"}}>
                {/* Number line */}
                <line x1={40} y1={160} x2={560} y2={160} stroke="#475569" strokeWidth={2}/>
                {[-4,-3,-2,-1,0,1,2,3,4].map(v=>(
                  <g key={v}><line x1={40+(v+4)/8*520} y1={152} x2={40+(v+4)/8*520} y2={168} stroke="#64748b" strokeWidth={1.5}/><text x={40+(v+4)/8*520} y={185} textAnchor="middle" fill="#64748b" fontSize={12}>{v}</text></g>
                ))}
                <text x={300} y={200} textAnchor="middle" fill="#64748b" fontSize={12}>Logits</text>
                {/* Person dots */}
                {MLE_LABELS.map((lb,p)=>{
                  const x=40+((h.ab[p]+4)/8)*520;
                  return(<g key={`p${p}`}><circle cx={x} cy={130} r={10} fill="#38bdf8" stroke="#fff" strokeWidth={1.5} style={{transition:"cx 0.8s ease"}}/><text x={x} y={118} textAnchor="middle" fill="#38bdf8" fontSize={11} fontWeight="bold">{lb}</text></g>);
                })}
                {/* Item dots */}
                {["I1","I2","I3","I4","I5","I6","I7","I8","I9","I10"].map((it,i)=>{
                  const x=40+((h.di[i]+4)/8)*520;
                  return(<g key={`i${i}`}><polygon points={`${x},195 ${x-7},210 ${x+7},210`} fill="#f59e0b" stroke="#fff" strokeWidth={1} style={{transition:"all 0.8s ease"}}/><text x={x} y={225} textAnchor="middle" fill="#f59e0b" fontSize={9} fontWeight="bold">{it}</text></g>);
                })}
                <text x={40} y={130} textAnchor="end" fill="#38bdf8" fontSize={11}>Persons</text>
                <text x={40} y={210} textAnchor="end" fill="#f59e0b" fontSize={11}>Items</text>
                {/* Residual indicator */}
                <rect x={380} y={240} width={180} height={60} rx={10} fill="rgba(15,23,42,0.8)" stroke={totalResidual<1?"#22c55e":"#f59e0b"} strokeWidth={2}/>
                <text x={470} y={258} textAnchor="middle" fill="#94a3b8" fontSize={11}>Total |Residual|</text>
                <text x={470} y={283} textAnchor="middle" fill={totalResidual<1?"#22c55e":"#f59e0b"} fontSize={22} fontWeight="bold">{totalResidual.toFixed(3)}</text>
              </svg>
            </div>
            {/* Right: Residual heatmap */}
            <div style={{flex:0.8}}>
              <div style={{fontSize:20,color:"#94a3b8",marginBottom:8,textAlign:"center"}}>{step===0?"Observed Data":"Residuals (Observed − Expected)"}</div>
              <div style={{display:"grid",gridTemplateColumns:`36px repeat(10,36px)`,gap:2,margin:"0 auto",width:"fit-content"}}>
                <div/>
                {["1","2","3","4","5","6","7","8","9","10"].map((it,i)=><div key={i} style={{textAlign:"center",fontSize:11,fontWeight:600,color:"#f59e0b",padding:"2px 0"}}>{it}</div>)}
                {MLE_LABELS.map((lb,p)=>(
                  [<div key={`l${p}`} style={{fontSize:12,fontWeight:600,color:"#38bdf8",display:"flex",alignItems:"center",justifyContent:"center"}}>{lb}</div>,
                  ...Array.from({length:10},(_,i)=>{
                    if(p===0&&i===0&&step===0) return <div key={`c${p}${i}`} style={{textAlign:"center",fontSize:11,padding:"6px 2px",borderRadius:4,background:"rgba(100,116,139,0.3)",color:"#64748b"}}>.</div>;
                    const obs=p<MLE_OBS.length&&i<MLE_OBS[0].length?MLE_OBS[p][i]:0;
                    const exp=h.exp[p][i];
                    if(step===0){
                      return <div key={`c${p}${i}`} style={{textAlign:"center",fontSize:13,fontWeight:700,padding:"6px 2px",borderRadius:4,background:obs===1?"rgba(34,197,94,0.25)":"rgba(239,68,68,0.2)",color:"#f8fafc"}}>{obs}</div>;
                    }
                    const r=obs-exp;
                    const intensity=Math.min(Math.abs(r)*3,1);
                    const bg=Math.abs(r)<0.05?"rgba(34,197,94,0.15)":r>0?`rgba(34,197,94,${0.1+intensity*0.4})`:`rgba(239,68,68,${0.1+intensity*0.4})`;
                    return <div key={`c${p}${i}`} style={{textAlign:"center",fontSize:11,padding:"6px 2px",borderRadius:4,background:bg,color:"#f8fafc"}}>{r>0?"+":""}{r.toFixed(2)}</div>;
                  })]
                )).flat()}
              </div>
              {step>0&&<div style={{textAlign:"center",fontSize:14,color:"#64748b",marginTop:8}}>Green = positive residual, Red = negative. Fading = converging.</div>}
            </div>
          </div>
          {/* Controls */}
          <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:12}}>
            <SlideButton onClick={e=>{e.stopPropagation();setMleStep(0);}} active={step===0}>Raw Data</SlideButton>
            {[1,2,3,4,5,6].map(s=><SlideButton key={s} onClick={e=>{e.stopPropagation();setMleStep(s);}} active={step===s}>Iteration {s}</SlideButton>)}
          </div>
        </div>
      );
    },

    // ═══ SECTION BREAK — Part 2 ═══
    ()=>(<SectionBreak part="Part 2" title="Reliability, Validity, and Fit" subtitle="How we know the model is working — and what goes wrong when it isn't"/>),

    // ═══ Reliability ═══
    ()=>(
      <div style={{padding:"40px 80px"}}>
        <SlideTitle>Forget Everything You've Been Told About Reliability</SlideTitle>
        <div style={{display:"flex",gap:50,margin:"16px auto",maxWidth:1500,alignItems:"flex-start"}}>
          {/* Left — the misconception vs reality */}
          <div style={{flex:1.1}}>
            <div style={{padding:"24px 32px",background:"rgba(239,68,68,0.08)",border:"2px solid rgba(239,68,68,0.25)",borderRadius:16,marginBottom:20}}>
              <div style={{fontSize:24,fontWeight:700,color:"#ef4444",marginBottom:8}}>The traditional view (cart before horse)</div>
              <div style={{fontSize:24,color:"#cbd5e1",lineHeight:1.6}}>"Reliability is the repeatability of an assessment — if we gave the test again, would we get the same result?"</div>
              <div style={{fontSize:22,color:"#94a3b8",marginTop:8}}>This is simplistic and misleading.</div>
            </div>
            <div style={{padding:"24px 32px",background:"rgba(34,197,94,0.08)",border:"2px solid rgba(34,197,94,0.25)",borderRadius:16}}>
              <div style={{fontSize:24,fontWeight:700,color:"#22c55e",marginBottom:8}}>What reliability actually is</div>
              <div style={{fontSize:24,color:"#f8fafc",lineHeight:1.6}}>How precisely we can <span style={{color:"#22c55e",fontWeight:700}}>separate persons</span> and place them according to their abilities — given the error in our measurements.</div>
              <div style={{fontSize:22,color:"#94a3b8",marginTop:8}}>Repeatability is a <em>consequence</em> of good separation, not the definition of it.</div>
            </div>
          </div>
          {/* Right — equation + targeting */}
          <div style={{flex:1}}>
            {/* Person Separation Index */}
            <div style={{padding:"24px 32px",background:"rgba(56,189,248,0.06)",border:"2px solid rgba(56,189,248,0.25)",borderRadius:16,marginBottom:20}}>
              <div style={{fontSize:22,fontWeight:600,color:"#38bdf8",marginBottom:16}}>Person Separation Index</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,padding:"8px 0"}}>
                <span style={{fontSize:44,color:"#f8fafc",fontFamily:"Georgia, serif",fontStyle:"italic"}}>r</span>
                <span style={{fontSize:36,color:"#64748b"}}>=</span>
                {/* Fraction built with vertical flex */}
                <div style={{display:"inline-flex",flexDirection:"column",alignItems:"center"}}>
                  <div style={{fontSize:30,color:"#f8fafc",fontFamily:"Georgia, serif",padding:"0 12px",whiteSpace:"nowrap"}}>
                    <span style={{fontStyle:"italic"}}>σ</span><span style={{fontSize:20,verticalAlign:"super"}}>2</span><span style={{fontSize:18,color:"#38bdf8",verticalAlign:"sub"}}>β̂</span>
                    <span style={{margin:"0 8px",color:"#94a3b8"}}>−</span>
                    <span style={{fontStyle:"italic"}}>σ</span><span style={{fontSize:20,verticalAlign:"super"}}>2</span><span style={{fontSize:18,color:"#ef4444",verticalAlign:"sub"}}>ε</span>
                  </div>
                  <div style={{width:"100%",height:3,background:"#94a3b8",borderRadius:2}}/>
                  <div style={{fontSize:30,color:"#f8fafc",fontFamily:"Georgia, serif",padding:"4px 12px 0",whiteSpace:"nowrap"}}>
                    <span style={{fontStyle:"italic"}}>σ</span><span style={{fontSize:20,verticalAlign:"super"}}>2</span><span style={{fontSize:18,color:"#38bdf8",verticalAlign:"sub"}}>β̂</span>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"center",gap:40,marginTop:16,fontSize:20}}>
                <span><span style={{color:"#38bdf8",fontWeight:600}}>σ²β̂</span> <span style={{color:"#94a3b8"}}>= variance of ability estimates</span></span>
                <span><span style={{color:"#ef4444",fontWeight:600}}>σ²ε</span> <span style={{color:"#94a3b8"}}>= mean squared standard errors</span></span>
              </div>
            </div>
            {/* Targeting drives reliability */}
            <div style={{padding:"24px 32px",background:"rgba(245,158,11,0.06)",border:"2px solid rgba(245,158,11,0.25)",borderRadius:16}}>
              <div style={{fontSize:22,fontWeight:600,color:"#f59e0b",marginBottom:10}}>Why targeting drives reliability</div>
              <div style={{fontSize:22,color:"#cbd5e1",lineHeight:1.7}}>
                Items give <span style={{color:"#f59e0b",fontWeight:600}}>maximum information</span> when difficulty matches ability (P ≈ 0.5).
                <br/><br/>
                If items are too easy (P → 1) or too hard (P → 0), error explodes and we cannot tell people apart — no matter how "repeatable" the scores might be.
              </div>
            </div>
          </div>
        </div>
      </div>
    ),

    // ═══ SLIDE 5 — What Does Fit Mean? ═══
    ()=>(
      <div style={{padding:"60px 80px"}}>
        <SlideTitle>What Does Fit Mean?</SlideTitle>
        <div style={{display:"flex",gap:60,justifyContent:"center",alignItems:"flex-start",margin:"30px auto",maxWidth:1500}}>
          <div style={{flex:1}}>
            <ICC difficulty={0} observedPoints={[{ability:-2,proportion:0.12},{ability:-0.5,proportion:0.35},{ability:0.5,proportion:0.58},{ability:1.5,proportion:0.82},{ability:3,proportion:0.95}]} label="Good Fit: Observed matches predicted"/>
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",paddingTop:40}}>
            <div style={{fontSize:32,color:"#f8fafc",lineHeight:1.8}}>
              <p>The model predicts a probability of success for every person-item combination.</p>
              <p style={{marginTop:20}}>Group persons by ability. Compare <span style={{color:"#22c55e",fontWeight:700}}>observed proportions</span> to the <span style={{color:"#f59e0b",fontWeight:700}}>theoretical ICC</span>.</p>
              <p style={{marginTop:20}}>When dots sit close to the curve → the item <span style={{color:"#22c55e"}}>fits</span>.</p>
              <p style={{marginTop:20}}>When they deviate systematically → <span style={{color:"#ef4444"}}>misfit</span>.</p>
            </div>
          </div>
        </div>
      </div>
    ),

    // ═══ SLIDE 6 — Item Misfit ═══
    ()=>(
      <div style={{padding:"50px 60px"}}>
        <SlideTitle>Item Misfit</SlideTitle>
        <div style={{display:"flex",gap:30,justifyContent:"center",margin:"20px auto",maxWidth:1700}}>
          <div style={{flex:1}}>
            <ICC difficulty={0} observedPoints={[{ability:-2,proportion:0.20},{ability:-0.5,proportion:0.38},{ability:0.5,proportion:0.55},{ability:1.5,proportion:0.68},{ability:3,proportion:0.78}]} label="Under-discrimination" misfitType={true}/>
            <div style={{textAlign:"center",fontSize:22,color:"#94a3b8",marginTop:8}}>Flatter than ICC — item is noisy</div>
          </div>
          <div style={{flex:1}}>
            <ICC difficulty={0} observedPoints={[{ability:-2,proportion:0.02},{ability:-0.5,proportion:0.15},{ability:0.5,proportion:0.88},{ability:1.5,proportion:0.97},{ability:3,proportion:0.99}]} label="Over-discrimination" misfitType={true}/>
            <div style={{textAlign:"center",fontSize:22,color:"#94a3b8",marginTop:8}}>Steeper than ICC — red flag in Rasch</div>
          </div>
          <div style={{flex:1}}>
            <ICC difficulty={0} observedPoints={[{ability:-2,proportion:0.30},{ability:-0.5,proportion:0.15},{ability:0.5,proportion:0.70},{ability:1.5,proportion:0.50},{ability:3,proportion:0.90}]} label="Erratic misfit" misfitType={true}/>
            <div style={{textAlign:"center",fontSize:22,color:"#94a3b8",marginTop:8}}>Haphazard — item lacks coherence</div>
          </div>
        </div>
        <KeyInsight>The ICC is the criterion — the theoretical expectation against which reality is judged</KeyInsight>
      </div>
    ),

    // ═══ SLIDE 7 — Sources of Misfit ═══
    ()=>(
      <div style={{padding:"60px 100px"}}>
        <SlideTitle>Sources of Misfit</SlideTitle>
        <div style={{display:"flex",flexDirection:"column",gap:36,margin:"40px auto",maxWidth:1400}}>
          {[
            {title:"Local Dependence",desc:"Getting item 3 right BECAUSE you got item 2 right — not because of ability. Responses are linked to each other, not just to the trait.",color:"#f59e0b",icon:"🔗"},
            {title:"Multidimensionality",desc:"The item taps a second trait. A maths word problem that requires advanced reading is measuring two things at once.",color:"#38bdf8",icon:"📐"},
            {title:"Guessing",desc:"Correct responses not driven by ability. On a 4-option MCQ, 25% correct by chance. Those responses are noise, not measurement.",color:"#ef4444",icon:"🎲"},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:28,padding:"28px 40px",background:`rgba(30,41,59,0.6)`,border:`2px solid ${s.color}33`,borderRadius:16}}>
              <div style={{fontSize:56,flexShrink:0}}>{s.icon}</div>
              <div><div style={{fontSize:32,fontWeight:700,color:s.color}}>{s.title}</div><div style={{fontSize:26,color:"#cbd5e1",marginTop:6,lineHeight:1.5}}>{s.desc}</div></div>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",fontSize:28,color:"#64748b",marginTop:20}}>Each is a story for a future session — the Rasch model's rigidity lets us detect them</div>
      </div>
    ),

    // ═══ SLIDE 8 — The Rigidity Is the Point ═══
    ()=>(
      <div style={{padding:"60px 100px"}}>
        <SlideTitle>The Rigidity Is the Point</SlideTitle>
        <div style={{maxWidth:1400,margin:"30px auto"}}>
          <div style={{fontSize:30,color:"#f8fafc",lineHeight:1.8}}>
            <p>The Rasch model doesn't accommodate misbehaving data with extra parameters. It holds firm.</p>
            <p style={{marginTop:20}}>If an item doesn't fit the model built from all items together, <span style={{color:"#ef4444",fontWeight:600}}>the item has a problem</span> — not the model.</p>
            <p style={{marginTop:20}}>This rigidity is what preserves invariance. It is what makes the Rasch model a <span style={{color:"#22c55e",fontWeight:600}}>measurement</span> model — not merely a statistical one.</p>
          </div>
          <div style={{maxWidth:1300,margin:"40px auto",padding:"32px 44px",background:"rgba(15,23,42,0.5)",borderRadius:16,borderLeft:"4px solid #22c55e"}}>
            <div style={{fontSize:32,color:"#f8fafc",fontStyle:"italic",lineHeight:1.6}}>"I tried to make the data tell me what they were about, and not I should tell the data how they should behave. That's what statisticians usually do."</div>
            <div style={{fontSize:22,color:"#22c55e",marginTop:14}}>— Georg Rasch, 1978</div>
          </div>
        </div>
      </div>
    ),

    // ═══ SECTION BREAK — Part 3 ═══
    ()=>(<SectionBreak part="Part 3" title="The Mathematics of Nature" subtitle="Odds, log-odds, probability — and why the Rasch model mirrors biology"/>),

    // ═══ SLIDE 9 — The Beetle ═══
    ()=>(
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 40px",gap:6}}>
        <SlideTitle>The Beetle</SlideTitle>
        {/* Melbourne Museum photo — hero image */}
        <div style={{position:"relative",width:"100%",maxWidth:1600,borderRadius:20,overflow:"hidden",boxShadow:"0 12px 60px rgba(0,0,0,0.7)"}}>
          <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center, transparent 60%, rgba(15,23,42,0.4) 100%)",zIndex:1,pointerEvents:"none"}}/>
          <img src="./melbourne_museum.png" alt="Dung beetles and stag beetles arranged in spirals, Melbourne Museum" style={{width:"100%",display:"block"}}/>
          {/* Overlaid caption */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"16px 24px",background:"linear-gradient(transparent, rgba(15,23,42,0.85))",zIndex:2}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
              <div>
                <span style={{fontSize:22,color:"#f59e0b",fontWeight:700}}>Absolute growth</span><span style={{fontSize:22,color:"#94a3b8"}}> is exponential.  </span>
                <span style={{fontSize:22,color:"#22c55e",fontWeight:700}}>Relative growth</span><span style={{fontSize:22,color:"#94a3b8"}}> is constant.</span>
              </div>
              <div style={{fontSize:16,color:"#94a3b8",fontStyle:"italic",textAlign:"right"}}>Photo by Paul Montuoro<br/>(in a moment of shock). Melbourne Museum.</div>
            </div>
          </div>
        </div>
        {/* Rasch quote below */}
        <div style={{maxWidth:1200,padding:"12px 28px",background:"rgba(15,23,42,0.5)",borderRadius:12,borderLeft:"4px solid #f59e0b",marginTop:4}}>
          <div style={{fontSize:22,color:"#f8fafc",fontStyle:"italic",lineHeight:1.4}}>"My meeting with Julian Huxley, that assured me that this is really an important line of research. And I continued to stick to it — to individuals — ever since."</div>
          <div style={{fontSize:16,color:"#f59e0b",marginTop:4}}>— Georg Rasch, 1978</div>
        </div>
      </div>
    ),

    // ═══ SLIDE 10 — Three Views of the Same Thing ═══
    ()=>{
      const odds=Math.exp(logitDiff);
      const prob=odds/(1+odds);
      return(
        <div style={{padding:"50px 60px"}}>
          <SlideTitle>Three Views, One Reality</SlideTitle>
          <div style={{display:"flex",gap:24,justifyContent:"center",margin:"20px auto",maxWidth:1700}}>
            {/* Odds panel */}
            <div style={{flex:1,padding:"20px",background:"rgba(245,158,11,0.06)",border:"2px solid rgba(245,158,11,0.3)",borderRadius:16}}>
              <div style={{textAlign:"center",fontSize:26,fontWeight:700,color:"#f59e0b",marginBottom:12}}>ODDS</div>
              <svg viewBox="0 0 300 200" style={{width:"100%"}}>
                <line x1={40} y1={180} x2={280} y2={180} stroke="#475569" strokeWidth={1}/><line x1={40} y1={180} x2={40} y2={10} stroke="#475569" strokeWidth={1}/>
                {/* curve */}
                {Array.from({length:100},(_,i)=>{const x=-5+i*0.1;const y=Math.min(Math.exp(x),150);const sx=40+(x+5)/10*240;const sy=180-y/150*170;return i===0?null:<line key={i} x1={40+((x-0.1)+5)/10*240} y1={180-Math.min(Math.exp(x-0.1),150)/150*170} x2={sx} y2={sy} stroke="#f59e0b" strokeWidth={2}/>;}).filter(Boolean)}
                {/* marker */}
                <circle cx={40+(logitDiff+5)/10*240} cy={180-Math.min(odds,150)/150*170} r={6} fill="#f59e0b" stroke="#fff" strokeWidth={2}/>
                <text x={150} y={198} textAnchor="middle" fill="#94a3b8" fontSize={11}>Exponential: 0 → ∞</text>
              </svg>
              <div style={{textAlign:"center",fontSize:36,fontWeight:700,color:"#f59e0b"}}>{odds<100?odds.toFixed(2):odds.toFixed(0)}</div>
            </div>
            {/* Log-odds panel */}
            <div style={{flex:1,padding:"20px",background:"rgba(34,197,94,0.06)",border:"2px solid rgba(34,197,94,0.3)",borderRadius:16}}>
              <div style={{textAlign:"center",fontSize:26,fontWeight:700,color:"#22c55e",marginBottom:12}}>LOG-ODDS (Logits)</div>
              <svg viewBox="0 0 300 200" style={{width:"100%"}}>
                <line x1={40} y1={180} x2={280} y2={180} stroke="#475569" strokeWidth={1}/><line x1={40} y1={100} x2={280} y2={100} stroke="#475569" strokeWidth={0.5} strokeDasharray="4"/>
                <line x1={40} y1={180} x2={40} y2={10} stroke="#475569" strokeWidth={1}/>
                {/* straight line */}
                <line x1={40} y1={180} x2={280} y2={10} stroke="#22c55e" strokeWidth={2.5}/>
                {/* marker */}
                <circle cx={40+(logitDiff+5)/10*240} cy={180-(logitDiff+5)/10*170} r={6} fill="#22c55e" stroke="#fff" strokeWidth={2}/>
                <text x={150} y={198} textAnchor="middle" fill="#94a3b8" fontSize={11}>Linear: -∞ → +∞</text>
              </svg>
              <div style={{textAlign:"center",fontSize:36,fontWeight:700,color:"#22c55e"}}>{logitDiff.toFixed(2)}</div>
            </div>
            {/* Probability panel */}
            <div style={{flex:1,padding:"20px",background:"rgba(56,189,248,0.06)",border:"2px solid rgba(56,189,248,0.3)",borderRadius:16}}>
              <div style={{textAlign:"center",fontSize:26,fontWeight:700,color:"#38bdf8",marginBottom:12}}>PROBABILITY</div>
              <svg viewBox="0 0 300 200" style={{width:"100%"}}>
                <line x1={40} y1={180} x2={280} y2={180} stroke="#475569" strokeWidth={1}/><line x1={40} y1={10} x2={280} y2={10} stroke="#475569" strokeWidth={0.5} strokeDasharray="4"/>
                <line x1={40} y1={180} x2={40} y2={10} stroke="#475569" strokeWidth={1}/>
                {/* sigmoid */}
                {Array.from({length:100},(_,i)=>{const x=-5+i*0.1;const p2=Math.exp(x)/(1+Math.exp(x));const sx=40+(x+5)/10*240;const sy=180-p2*170;const px=-5+(i-1)*0.1;const pp=Math.exp(px)/(1+Math.exp(px));return i===0?null:<line key={i} x1={40+(px+5)/10*240} y1={180-pp*170} x2={sx} y2={sy} stroke="#38bdf8" strokeWidth={2}/>;}).filter(Boolean)}
                {/* marker */}
                <circle cx={40+(logitDiff+5)/10*240} cy={180-prob*170} r={6} fill="#38bdf8" stroke="#fff" strokeWidth={2}/>
                <text x={150} y={198} textAnchor="middle" fill="#94a3b8" fontSize={11}>Sigmoid: 0 → 1</text>
              </svg>
              <div style={{textAlign:"center",fontSize:36,fontWeight:700,color:"#38bdf8"}}>{prob.toFixed(3)}</div>
            </div>
          </div>
          {/* Slider */}
          <div style={{maxWidth:800,margin:"24px auto",textAlign:"center"}}>
            <div style={{fontSize:22,color:"#94a3b8",marginBottom:8}}>Ability minus Difficulty (β − δ)</div>
            <input type="range" min={-5} max={5} step={0.1} value={logitDiff} onChange={e=>setLogitDiff(Number(e.target.value))} style={{width:"100%",accentColor:"#f59e0b",height:8}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:18,color:"#64748b"}}><span>-5</span><span>0</span><span>+5</span></div>
          </div>
        </div>
      );
    },

    // ═══ SLIDE 11 — Why Logits Are the Scale ═══
    ()=>(
      <div style={{padding:"60px 100px"}}>
        <SlideTitle>Why Logits Are the Scale</SlideTitle>
        <div style={{display:"flex",gap:60,justifyContent:"center",alignItems:"center",margin:"40px auto",maxWidth:1500}}>
          <div style={{flex:1}}>
            <div style={{fontSize:30,color:"#f8fafc",lineHeight:1.8}}>
              <p>A <span style={{color:"#22c55e",fontWeight:700}}>1-logit</span> increase in ability <em>always</em> multiplies the odds by <span style={{color:"#f59e0b",fontWeight:700}}>e ≈ 2.72</span></p>
              <p style={{marginTop:24}}>Whether at the bottom or the top of the scale — one logit means the same thing</p>
              <p style={{marginTop:24}}>Just as the beetle's <span style={{color:"#22c55e"}}>relative growth rate</span> is the same at every stage</p>
            </div>
          </div>
          <div style={{flex:1}}>
            <div style={{background:"rgba(30,41,59,0.6)",padding:"36px",borderRadius:20,border:"2px solid #334155"}}>
              {[{logit:-2,odds:0.14,label:"Low ability"},{logit:-1,odds:0.37,label:""},{logit:0,odds:1.00,label:"Equal match"},{logit:1,odds:2.72,label:""},{logit:2,odds:7.39,label:"High ability"}].map((r,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:16,marginBottom:i<4?16:0}}>
                  <div style={{width:80,fontSize:24,fontWeight:700,color:"#22c55e",textAlign:"right"}}>{r.logit}</div>
                  <div style={{flex:1,height:28,background:"#1e293b",borderRadius:14,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(r.odds/8*100,100)}%`,background:"linear-gradient(90deg,#22c55e,#f59e0b)",borderRadius:14,transition:"width 0.5s"}}/></div>
                  <div style={{width:80,fontSize:20,color:"#f59e0b",textAlign:"left"}}>{r.odds.toFixed(2)}</div>
                  {i<4&&<div style={{position:"absolute",right:60,fontSize:20,color:"#475569"}}>×2.72</div>}
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",marginTop:12,fontSize:18,color:"#64748b"}}><span>Logit</span><span>Odds</span></div>
            </div>
          </div>
        </div>
        <KeyInsight>The logarithm linearises the exponential — and linearity is where equal-interval measurement lives</KeyInsight>
      </div>
    ),

    // ═══ SLIDE 12 — Probability as Growth Under Constraint ═══
    ()=>(
      <div style={{padding:"60px 100px"}}>
        <SlideTitle>Probability: Growth Under Constraint</SlideTitle>
        <div style={{display:"flex",gap:60,alignItems:"center",margin:"40px auto",maxWidth:1500}}>
          <div style={{flex:1.2}}>
            <svg viewBox="0 0 500 350" style={{width:"100%"}}>
              {/* Ceiling line */}
              <line x1={50} y1={30} x2={450} y2={30} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="8"/>
              <text x={460} y={35} fill="#ef4444" fontSize={14}>P = 1 (certainty)</text>
              {/* Sigmoid */}
              {Array.from({length:200},(_,i)=>{const x=-6+i*0.06;const p=Math.exp(x)/(1+Math.exp(x));const sx=50+(x+6)/12*400;const sy=320-p*290;const px=x-0.06;const pp=Math.exp(px)/(1+Math.exp(px));return i===0?null:<line key={i} x1={50+(px+6)/12*400} y1={320-pp*290} x2={sx} y2={sy} stroke="#38bdf8" strokeWidth={3}/>;}).filter(Boolean)}
              {/* Exponential for comparison */}
              {Array.from({length:200},(_,i)=>{const x=-6+i*0.06;const y=Math.min(Math.exp(x),20)/20;const sx=50+(x+6)/12*400;const sy=320-y*290;const px=x-0.06;const py=Math.min(Math.exp(px),20)/20;return i===0?null:<line key={i} x1={50+(px+6)/12*400} y1={320-py*290} x2={sx} y2={sy} stroke="#f59e0b" strokeWidth={2} opacity={0.4} strokeDasharray="4"/>;}).filter(Boolean)}
              <text x={380} y={310} fill="#38bdf8" fontSize={14} fontWeight="bold">Probability (bounded)</text>
              <text x={350} y={100} fill="#f59e0b" fontSize={14} opacity={0.6}>Odds (unbounded)</text>
              <text x={250} y={345} textAnchor="middle" fill="#94a3b8" fontSize={13}>β − δ</text>
            </svg>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:30,color:"#f8fafc",lineHeight:1.8}}>
              <p>No organism can grow forever. There is always <span style={{color:"#ef4444",fontWeight:600}}>environmental resistance</span>.</p>
              <p style={{marginTop:24}}>No probability can reach 1. There is always a chance of error.</p>
              <p style={{marginTop:24}}>P = odds / (1 + odds)</p>
              <p style={{marginTop:16}}>The <span style={{color:"#ef4444"}}>"+1"</span> in the denominator <em>is</em> the constraint.</p>
              <p style={{marginTop:24,color:"#94a3b8",fontSize:26}}>Exponential capacity meets a ceiling → the sigmoid</p>
            </div>
          </div>
        </div>
      </div>
    ),

    // ═══ SLIDE 13 — Rasch Meets Huxley ═══
    ()=>(
      <div style={{padding:"60px 100px"}}>
        <SlideTitle>Rasch Meets Huxley</SlideTitle>
        <div style={{display:"flex",gap:60,alignItems:"flex-start",margin:"30px auto",maxWidth:1500}}>
          <div style={{flex:1}}>
            <div style={{fontSize:28,color:"#f8fafc",lineHeight:1.8}}>
              <p><span style={{color:"#f59e0b",fontWeight:700}}>London, 1935.</span> The young Danish mathematician Georg Rasch is studying with Ronald Fisher.</p>
              <p style={{marginTop:20}}>He brings data on crabs — shell measurements sorted by size. Plotted on a log scale, the growth segments follow precise straight lines from a centre of growth.</p>
              <p style={{marginTop:20}}>He shows this to <span style={{color:"#22c55e",fontWeight:700}}>Julian Huxley</span> — the biologist who had written <em style={{color:"#fbbf24"}}>Problems of Relative Growth</em> (1932), the foundational work on allometric scaling.</p>
            </div>
          </div>
          <div style={{flex:1}}>
            <div style={{padding:"36px",background:"rgba(245,158,11,0.06)",border:"2px solid rgba(245,158,11,0.3)",borderRadius:20}}>
              <div style={{fontSize:28,color:"#f8fafc",fontStyle:"italic",lineHeight:1.7}}>
                "I showed this to Julian Huxley, and he was <span style={{color:"#f59e0b",fontWeight:700}}>completely flabbergasted</span>."
              </div>
              <div style={{fontSize:22,color:"#94a3b8",marginTop:16,lineHeight:1.7}}>
                "My meeting with Julian Huxley, that assured me that this is really an important line of research. And I continued to stick to it — <span style={{color:"#22c55e"}}>to individuals</span> — ever since."
              </div>
              <div style={{fontSize:20,color:"#f59e0b",marginTop:20}}>— Georg Rasch, 1978 interview</div>
            </div>
          </div>
        </div>
        <KeyInsight>The Rasch model's exponential structure reflects how biological systems develop. Rasch knew this. Huxley confirmed it.</KeyInsight>
      </div>
    ),

    // ═══ SLIDE 14 — The Beetle Revisited ═══
    ()=>(
      <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",height:"100%",gap:32}}>
        <SlideTitle>The Beetle Revisited</SlideTitle>
        <div style={{fontSize:36,color:"#f8fafc",textAlign:"center",maxWidth:1300,lineHeight:1.7}}>
          You've been watching <span style={{color:"#4ade80",fontWeight:700}}>exponential growth</span> this entire lecture.
        </div>
        <div style={{margin:"20px 0"}}><Beetle scale={3.5}/></div>
        <div style={{display:"flex",gap:60,justifyContent:"center",margin:"20px 0"}}>
          <div style={{textAlign:"center"}}><div style={{fontSize:56,fontWeight:700,color:"#f59e0b"}}>Odds</div><div style={{fontSize:26,color:"#94a3b8"}}>The exponential<br/>Nature's raw growth</div></div>
          <div style={{textAlign:"center"}}><div style={{fontSize:56,fontWeight:700,color:"#22c55e"}}>Logits</div><div style={{fontSize:26,color:"#94a3b8"}}>The logarithm<br/>Where measurement lives</div></div>
          <div style={{textAlign:"center"}}><div style={{fontSize:56,fontWeight:700,color:"#38bdf8"}}>Probability</div><div style={{fontSize:26,color:"#94a3b8"}}>Growth meets the real world<br/>The S-curve</div></div>
        </div>
        <div style={{fontSize:30,color:"#64748b",marginTop:20}}>Next session: Person estimation, standard errors, and the extremes of the scale</div>
      </div>
    ),
  ];

  return(
    <div style={{width:"100vw",height:"100vh",background:"#0f172a",color:"#f8fafc",fontFamily:"system-ui,-apple-system,sans-serif",overflow:"hidden",position:"relative",}} onClick={e=>{if(e.clientX>window.innerWidth/2)go(currentSlide+1);else go(currentSlide-1);}}>
      <style>{`*, *::before, *::after { cursor: auto !important; } button, input[type=range] { cursor: pointer !important; }`}</style>
      {/* Slide content */}
      <div style={{width:"100%",height:"calc(100% - 70px)",overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"center"}}>{slides[currentSlide]()}</div>
      {/* Bottom bar */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:70,background:"rgba(15,23,42,0.95)",borderTop:"1px solid #1e293b",display:"flex",alignItems:"center",padding:"0 30px"}}>
        {/* Progress track */}
        <div style={{flex:1,height:8,background:"#1e293b",borderRadius:4,position:"relative",marginRight:20}}>
          <div style={{width:`${progress*100}%`,height:"100%",background:"linear-gradient(90deg,#166534,#4ade80)",borderRadius:4,transition:"width 0.4s"}}/>
          {/* Beetle on the track */}
          <div style={{position:"absolute",bottom:10,left:`${progress*100}%`,transform:"translateX(-50%)",transition:"left 0.4s"}}><Beetle scale={beetleScale}/></div>
        </div>
        <div style={{color:"#64748b",fontSize:18,marginRight:20}}>{currentSlide+1}/{SLIDE_COUNT}</div>
        <button onClick={e=>{e.stopPropagation();window.open("./src/presenter.html","presenter","width=900,height=700");}} style={{background:"none",border:"1px solid #334155",color:"#64748b",padding:"8px 16px",borderRadius:8,cursor:"pointer",fontSize:16}}>Presenter (P)</button>
      </div>
    </div>
  );
}
