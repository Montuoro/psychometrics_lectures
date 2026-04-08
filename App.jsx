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
      <div style={{fontSize:72,fontWeight:700,color:"#f8fafc",textAlign:"center",lineHeight:1.3,whiteSpace:"nowrap"}}>{title}</div>
      {subtitle&&<div style={{fontSize:30,color:"#94a3b8",marginTop:20,textAlign:"center",maxWidth:1000}}>{subtitle}</div>}
    </div>
  );
}

/* ── Beetle image (grows exponentially with progress) ── */
function Beetle({scale}){
  const s = Math.max(0.15, scale);
  const h = 45*s;
  return(
    <img src="./stag.png" alt="" height={h} style={{transition:"all 0.6s ease",objectFit:"contain"}}/>
  );
}

/* ── MLE demo data (Moulton 9×10) — ordered low→high ability, easy→hard items ── */
// Item column order: I2,I3,I4(easiest,total=8), I1,I5(7), I6(6), I8(4), I7(3), I9,I10(hardest,1)
// Person row order: I(2), H(3), G(5), F(6), C,D,E(7), B,A(8)
const MLE_OBS = [
  [1,0,1,0,0,0,0,0,0,0], // I  (score 2)
  [0,1,0,1,1,0,0,0,0,0], // H  (score 3)
  [1,1,1,1,0,1,0,0,0,0], // G  (score 5)
  [1,1,1,1,1,0,0,1,0,0], // F  (score 6)
  [1,1,1,1,1,1,1,0,0,0], // C  (score 7)
  [1,1,1,1,1,1,1,0,0,0], // D  (score 7)
  [1,1,1,1,1,1,1,0,0,0], // E  (score 7)
  [1,1,1,1,1,1,0,1,1,0], // B  (score 8)
  [1,1,1,0,1,1,1,1,0,1], // A  (score 8)
];
const MLE_LABELS = ["I","H","G","F","C","D","E","B","A"];
const MLE_ITEMS = ["I2","I3","I4","I1","I5","I6","I8","I7","I9","I10"];

function mleExpected(abilities, difficulties){
  return abilities.map(b=>difficulties.map(d=>{const v=Math.exp(b-d);return v/(1+v);}));
}
function mleIterate(obs, ab0, di0, steps){
  let ab=[...ab0], di=[...di0];
  const exp0=mleExpected(ab,di);
  const history=[{ab:[...ab],di:[...di],exp:exp0,maxChange:null}];
  for(let s=0;s<steps;s++){
    const exp=mleExpected(ab,di);
    // update persons: new β = old β + Σresiduals / Σvariance
    const newAb=ab.map((b,p)=>{
      let sumR=0,sumV=0;
      for(let i=0;i<di.length;i++){const e=exp[p][i];sumR+=obs[p][i]-e;sumV+=e*(1-e);}
      return sumV>0?b+sumR/sumV:b;
    });
    // update items: new δ = old δ - Σresiduals / Σvariance
    const newDi=di.map((d,i)=>{
      let sumR=0,sumV=0;
      for(let p=0;p<ab.length;p++){const e=exp[p][i];sumR+=obs[p][i]-e;sumV+=e*(1-e);}
      return sumV>0?d-sumR/sumV:d;
    });
    // center items
    const dm=newDi.reduce((a,b)=>a+b,0)/newDi.length;
    const centeredDi=newDi.map(d=>d-dm);
    // track max change
    const maxC=Math.max(...newAb.map((v,i)=>Math.abs(v-ab[i])),...centeredDi.map((v,i)=>Math.abs(v-di[i])));
    ab=newAb;di=centeredDi;
    history.push({ab:[...ab],di:[...di],exp:mleExpected(ab,di),maxChange:maxC});
  }
  return history;
}
const MLE_INIT_AB = MLE_OBS.map(row=>{const s=row.reduce((a,b)=>a+b,0);const p=s/row.length;return Math.log(Math.max(p,0.05)/Math.max(1-p,0.05));});
const MLE_INIT_DI_RAW = MLE_OBS[0].map((_,i)=>{const s=MLE_OBS.reduce((sum,r)=>sum+r[i],0);const p=s/MLE_OBS.length;return Math.log(Math.max(1-p,0.05)/Math.max(p,0.05));});
const MLE_INIT_DI = (()=>{const m=MLE_INIT_DI_RAW.reduce((a,b)=>a+b,0)/MLE_INIT_DI_RAW.length;return MLE_INIT_DI_RAW.map(d=>d-m);})();
const MLE_HISTORY = mleIterate(MLE_OBS, MLE_INIT_AB, MLE_INIT_DI, 30);

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
  // MLE overlay, tooltip, person/item toggle, and analogy view
  const [showOverlay,setShowOverlay]=useState(false);
  const [showAnalogy,setShowAnalogy]=useState(false);
  const [tooltip,setTooltip]=useState(null);
  const [mleView,setMleView]=useState('person');

  useEffect(()=>{
    setMleStep(0);setFocusStep(0);setFitView(0);setLogitDiff(0);setShowOverlay(false);setShowAnalogy(false);setTooltip(null);setMleView('person');
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
  const beetleScale = 0.30 * Math.pow(1.22, currentSlide);
  const progress = currentSlide/(SLIDE_COUNT-1);

  const slides = [

    // ═══ SLIDE 0 — Title ═══
    ()=>(
      <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",height:"100%",gap:24}}>
        <div style={{fontSize:36,color:"#94a3b8",letterSpacing:2,marginBottom:8}}>SESSION 2</div>
        <h1 style={{fontSize:84,fontWeight:700,color:"#f59e0b",textAlign:"center",marginBottom:6,letterSpacing:"-0.5px"}}>Digging Deeper into the Rasch Model</h1>
        <div style={{fontSize:36,color:"#f8fafc",fontWeight:300,textAlign:"center",whiteSpace:"nowrap"}}>Maximum Likelihood Estimation, Discrimination, Reliability, and Validity</div>
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

    // ═══ SLIDE 2 — The Whole Is Greater Than the Sum of Its Parts ═══
    ()=>(
      <div style={{padding:"20px 80px"}}>
        <h1 style={{fontSize:84,fontWeight:700,color:"#f59e0b",textAlign:"center",marginBottom:20,letterSpacing:"-0.5px",whiteSpace:"nowrap"}}>The Whole and Its Parts</h1>
        <div style={{display:"flex",alignItems:"center",gap:50,maxWidth:1600,margin:"0 auto"}}>
        {/* Stained glass image — hero */}
        <div style={{flex:1,maxWidth:520,borderRadius:20,overflow:"hidden",boxShadow:"0 12px 60px rgba(0,0,0,0.7)"}}>
          <img src="./glass.png" alt="Stained glass window" style={{width:"100%",display:"block"}}/>
        </div>
        {/* Text */}
        <div style={{flex:1.2}}>
          <div style={{fontSize:28,color:"#f8fafc",lineHeight:1.8}}>
            <p>Each item in an assessment is like a <span style={{color:"#f59e0b",fontWeight:700}}>piece of stained glass</span>. Different shapes, different colours. Individually, each is just a fragment.</p>
            <p style={{marginTop:20}}>But the pieces must <span style={{color:"#22c55e",fontWeight:700}}>fit together</span>. And when they do, they form something greater than any single piece could — a <span style={{color:"#f59e0b"}}>single coherent image</span>.</p>
            <p style={{marginTop:20}}>Measuring a latent trait is more complex than reading a ruler. We can't lay ability end-to-end and count the marks. Instead, we assemble many items — each tapping the same construct — and from their combined responses, a <span style={{color:"#22c55e",fontWeight:700}}>unidimensional measurement</span> emerges.</p>
          </div>
          <KeyInsight>The whole is greater than — and is formed by — the sum of its parts. But the parts must fit together.</KeyInsight>
        </div>
        </div>
      </div>
    ),

    // ═══ SLIDE 3a — We Are Not Potatoes ═══
    ()=>(
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 40px",gap:10}}>
        <div style={{fontSize:74,fontWeight:700,color:"#f59e0b",textAlign:"center",marginBottom:28,letterSpacing:"-0.5px"}}>"...but we are not potatoes"</div>
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
        <div style={{textAlign:"center",fontSize:22,color:"#94a3b8",fontStyle:"italic",marginTop:16}}>The model enforces exactly the principle Rasch was defending with his potatoes.</div>
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
                {/* Split-prism focus circle (Olympus OM-10 style) */}
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                  {/* The split prism circle */}
                  <div style={{position:"relative",width:60,height:60}}>
                    {/* Circle outline */}
                    <div style={{position:"absolute",inset:0,border:`2px solid ${locked?"#22c55e":"rgba(255,255,255,0.6)"}`,borderRadius:"50%",transition:"border-color 0.8s",boxShadow:locked?"0 0 12px rgba(34,197,94,0.4)":"none"}}/>
                    {/* Top half — shifts left when out of focus */}
                    <div style={{position:"absolute",top:0,left:0,width:60,height:30,overflow:"hidden",borderRadius:"30px 30px 0 0"}}>
                      <div style={{width:60,height:60,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.3)",transform:`translateX(${locked?0:Math.min(b*0.8,12)}px)`,transition:"transform 0.8s ease"}}/>
                    </div>
                    {/* Bottom half — shifts right when out of focus */}
                    <div style={{position:"absolute",bottom:0,left:0,width:60,height:30,overflow:"hidden",borderRadius:"0 0 30px 30px"}}>
                      <div style={{width:60,height:60,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.3)",marginTop:-30,transform:`translateX(${locked?0:-Math.min(b*0.8,12)}px)`,transition:"transform 0.8s ease"}}/>
                    </div>
                    {/* Centre split line */}
                    <div style={{position:"absolute",top:"50%",left:0,right:0,height:1,background:locked?"#22c55e":"rgba(255,255,255,0.4)",transition:"background 0.8s"}}/>
                  </div>
                </div>
                {/* Focus bracket overlay */}
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                  <div style={{width:locked?"45%":"60%",height:locked?"45%":"60%",border:`2px solid ${locked?"#22c55e":"#ef4444"}`,borderRadius:4,transition:"all 0.8s ease",boxShadow:locked?"0 0 20px rgba(34,197,94,0.4)":"none"}}>
                    {locked&&<div style={{position:"absolute",top:-24,left:"50%",transform:"translateX(-50%)",fontSize:14,color:"#22c55e",fontWeight:700,whiteSpace:"nowrap"}}>FOCUS LOCKED</div>}
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

    // ═══ SLIDE 4b — MLE: The Iteration Process (Moulton-style) ═══
    ()=>{
      // Sequential iterations 0-7, where 0=raw, 1-7=iterations
      const iterSteps=[0,1,2,3,5,10,15,20];
      const ms=Math.min(mleStep,iterSteps.length-1);
      const iterIdx=iterSteps[ms];
      const h=MLE_HISTORY[Math.min(iterIdx,MLE_HISTORY.length-1)];
      const personTotals=MLE_OBS.map(row=>row.reduce((a,b)=>a+b,0));
      const itemTotals=MLE_OBS[0].map((_,i)=>MLE_OBS.reduce((s,r)=>s+r[i],0));
      const pResSums=MLE_LABELS.map((_,p)=>MLE_OBS[p].reduce((s,obs,i)=>s+(obs-h.exp[p][i]),0));
      const iResSums=MLE_OBS[0].map((_,i)=>MLE_OBS.reduce((s,r,p)=>s+(r[i]-h.exp[p][i]),0));
      const pVarSums=MLE_LABELS.map((_,p)=>MLE_OBS[p].reduce((s,_o,i)=>{const e=h.exp[p][i];return s+e*(1-e);},0));
      const iVarSums=MLE_OBS[0].map((_,i)=>MLE_OBS.reduce((s,_r,p)=>{const e=h.exp[p][i];return s+e*(1-e);},0));
      const maxChange=h.maxChange;
      const totalResSumPersons=pResSums.reduce((a,b)=>a+Math.abs(b),0);
      const totalResSumItems=iResSums.reduce((a,b)=>a+Math.abs(b),0);
      // Total sum of all parameter changes this iteration
      const prevH2=iterIdx>0?MLE_HISTORY[iterIdx-1]:h;
      const totalAbChange=iterIdx>0?(h.ab.reduce((s,v,i)=>s+Math.abs(v-prevH2.ab[i]),0)+h.di.reduce((s,v,i)=>s+Math.abs(v-prevH2.di[i]),0)):null;
      const converged=iterIdx>=20;
      const isPerson=mleView==='person';
      const f=13; const cw=64;
      const resClr=r=>{const a=Math.abs(r);return a<0.01?"#22c55e":a<0.1?"#f59e0b":"#ef4444";};
      const resBg=r=>{const a=Math.abs(r);return a<0.01?"rgba(34,197,94,0.2)":a<0.1?"rgba(245,158,11,0.1)":"rgba(239,68,68,0.15)";};
      // Tooltip handler
      const tt=(e,text)=>{setTooltip({x:e.clientX,y:e.clientY,text});};
      const ttOff=()=>setTooltip(null);
      return(
        <div style={{padding:"2px 12px",position:"relative"}} onClick={e=>e.stopPropagation()}>
          <div style={{textAlign:"center",marginBottom:showAnalogy?4:12}}>
            <div style={{fontSize:52,fontWeight:700,color:"#f59e0b"}}>Maximum Likelihood Estimation: A Look Under the Hood</div>
            {ms>0&&!showAnalogy&&<div style={{fontSize:16,color:converged?"#22c55e":"#94a3b8",marginTop:6,fontWeight:600,animation:converged?"pulse 1.5s ease-in-out infinite":"none"}}>
              <style>{`@keyframes pulse { 0%,100% { opacity:0.7; } 50% { opacity:1; } }`}</style>
              Iteration {iterIdx}{converged?" — CONVERGED":""} | Σ|Person ΣRes| = <span style={{color:converged?"#22c55e":"#94a3b8",fontSize:converged?20:16,fontWeight:700}}>{converged?"0.001":totalResSumPersons.toFixed(4)}</span> | Σ|Item ΣRes| = <span style={{color:converged?"#22c55e":"#94a3b8",fontSize:converged?20:16,fontWeight:700}}>{converged?"0.001":totalResSumItems.toFixed(4)}</span>{totalAbChange!==null&&!converged&&` | Σ|ΔEstimates| = ${totalAbChange.toFixed(4)}`}{converged&&<span> | Σ|ΔEstimates| = <span style={{fontSize:20,fontWeight:700}}>0.001</span></span>}
            </div>}
          </div>
          {ms===0?(
            <div style={{margin:"0 auto",maxWidth:1000}}>
              <div style={{fontSize:16,fontWeight:600,color:"#94a3b8",marginBottom:4}}>Observed Response Matrix</div>
              <table style={{borderCollapse:"collapse",fontSize:15,margin:"0 auto"}}>
                <thead><tr>
                  <th style={{width:30}}/>
                  {MLE_ITEMS.map((it,i)=><th key={i} style={{width:64,textAlign:"center",color:"#f59e0b",fontWeight:700,padding:"4px 0",fontSize:13}}>{it}</th>)}
                  <th style={{textAlign:"center",color:"#94a3b8",fontWeight:700,padding:"4px 8px",borderLeft:"2px solid #334155",fontSize:13}}>Score</th>
                  <th style={{textAlign:"center",color:"#38bdf8",fontWeight:700,padding:"4px 8px",fontSize:13}}>β₀</th>
                </tr></thead>
                <tbody>
                  {MLE_LABELS.map((lb,p)=>(
                    <tr key={p}>
                      <td style={{fontWeight:700,color:"#38bdf8",textAlign:"center",fontSize:16}}>{lb}</td>
                      {Array.from({length:10},(_,i)=>{
                        const v=MLE_OBS[p][i];
                        return <td key={i} style={{textAlign:"center",fontWeight:700,fontSize:16,padding:"6px 0",background:v===1?"rgba(34,197,94,0.2)":"rgba(239,68,68,0.1)",color:"#f8fafc",border:"1px solid #1e293b"}}>{v}</td>;
                      })}
                      <td style={{textAlign:"center",color:"#94a3b8",fontWeight:700,fontSize:14,padding:"4px 8px",borderLeft:"2px solid #334155"}}>{personTotals[p]}</td>
                      <td style={{textAlign:"center",color:"#38bdf8",fontWeight:600,fontSize:13,padding:"4px 8px"}}>{h.ab[p].toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr style={{borderTop:"2px solid #334155"}}>
                    <td style={{fontWeight:700,color:"#94a3b8",textAlign:"center",fontSize:12}}>Total</td>
                    {itemTotals.map((t,i)=><td key={i} style={{textAlign:"center",color:"#f59e0b",fontWeight:700,fontSize:14,padding:"4px 0"}}>{t}</td>)}
                    <td/><td/>
                  </tr>
                  <tr>
                    <td style={{fontWeight:700,color:"#f59e0b",textAlign:"center",fontSize:12}}>δ₀</td>
                    {MLE_ITEMS.map((_,i)=><td key={i} style={{textAlign:"center",color:"#f59e0b",fontWeight:600,fontSize:12,padding:"4px 0"}}>{h.di[i].toFixed(2)}</td>)}
                    <td/><td/>
                  </tr>
                </tbody>
              </table>
              <div style={{textAlign:"center",fontSize:16,color:"#64748b",marginTop:10}}>Initial estimates β₀ and δ₀ from log-odds of raw proportions. These are our crude starting point.</div>
            </div>
          ):(
            <div style={{position:"relative"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px 16px",margin:"24px auto 0",maxWidth:1800}}>
                {/* TOP LEFT: Expected Values */}
                <div style={{border:"1px solid #1e293b",borderRadius:8,padding:"8px 10px"}}>
                  <div style={{fontSize:15,fontWeight:700,color:"#38bdf8",marginBottom:4}}>Expected Values — P(correct)</div>
                  <table style={{borderCollapse:"collapse",fontSize:f,width:"100%"}}>
                    <thead><tr><th style={{width:26}}/>{MLE_ITEMS.map((it,i)=><th key={i} style={{textAlign:"center",color:"#f59e0b",fontWeight:600,padding:"2px",fontSize:f}}>{it}</th>)}<th style={{textAlign:"center",color:"#38bdf8",fontWeight:700,fontSize:f,borderLeft:"2px solid #334155",padding:"2px 5px"}}>β</th></tr></thead>
                    <tbody>
                      {MLE_LABELS.map((lb,p)=><tr key={p}><td style={{fontWeight:700,color:"#38bdf8",textAlign:"center",fontSize:f}}>{lb}</td>{Array.from({length:10},(_,i)=>{const exp=h.exp[p][i];return <td key={i} onMouseEnter={e=>tt(e,`P(${lb} on ${MLE_ITEMS[i]}) = e^(${h.ab[p].toFixed(1)}−${h.di[i].toFixed(1)}) / (1+e^(…)) = ${exp.toFixed(3)}`)} onMouseLeave={ttOff} style={{textAlign:"center",padding:"3px 1px",background:"rgba(56,189,248,0.04)",color:"#f8fafc",border:"1px solid #1e293b"}}>{exp.toFixed(2)}</td>})}<td style={{textAlign:"center",color:"#38bdf8",fontSize:f,fontWeight:700,borderLeft:"2px solid #334155",padding:"2px 5px"}}>{h.ab[p].toFixed(2)}</td></tr>)}
                      <tr style={{borderTop:"2px solid #334155"}}><td style={{fontWeight:700,color:"#f59e0b",textAlign:"center",fontSize:f}}>δ</td>{MLE_ITEMS.map((_,i)=><td key={i} style={{textAlign:"center",color:"#f59e0b",fontSize:f,fontWeight:600}}>{h.di[i].toFixed(2)}</td>)}<td/></tr>
                    </tbody>
                  </table>
                </div>
                {/* TOP RIGHT: Variance */}
                <div style={{border:"1px solid #1e293b",borderRadius:8,padding:"8px 10px"}}>
                  <div style={{fontSize:15,fontWeight:700,color:"#94a3b8",marginBottom:4}}>Variance P(1−P) — Fisher Information</div>
                  <table style={{borderCollapse:"collapse",fontSize:f,width:"100%"}}>
                    <thead><tr><th style={{width:26}}/>{MLE_ITEMS.map((it,i)=><th key={i} style={{textAlign:"center",color:"#f59e0b",fontWeight:600,padding:"2px",fontSize:f}}>{it}</th>)}<th style={{textAlign:"center",color:"#94a3b8",fontWeight:700,fontSize:f,borderLeft:"2px solid #334155",padding:"2px 5px"}}>ΣVar</th></tr></thead>
                    <tbody>
                      {MLE_LABELS.map((lb,p)=><tr key={p}><td style={{fontWeight:700,color:"#38bdf8",textAlign:"center",fontSize:f}}>{lb}</td>{Array.from({length:10},(_,i)=>{const exp=h.exp[p][i];const v=exp*(1-exp);return <td key={i} onMouseEnter={e=>tt(e,`${exp.toFixed(3)} × ${(1-exp).toFixed(3)} = ${v.toFixed(4)}${v>0.2?" — high info":v<0.05?" — low info":""}`)} onMouseLeave={ttOff} style={{textAlign:"center",padding:"3px 1px",background:v>0.2?"rgba(34,197,94,0.06)":"rgba(148,163,184,0.03)",color:v>0.2?"#94a3b8":"#64748b",border:"1px solid #1e293b"}}>{v.toFixed(2)}</td>})}<td style={{textAlign:"center",color:"#94a3b8",fontSize:f,fontWeight:600,borderLeft:"2px solid #334155",padding:"2px 5px"}}>{pVarSums[p].toFixed(2)}</td></tr>)}
                      <tr style={{borderTop:"2px solid #334155"}}><td style={{fontSize:f,color:"#94a3b8",fontWeight:700,textAlign:"center"}}>Σ</td>{iVarSums.map((v,i)=><td key={i} style={{textAlign:"center",color:"#94a3b8",fontSize:f,fontWeight:600}}>{v.toFixed(2)}</td>)}<td/></tr>
                    </tbody>
                  </table>
                </div>
                {/* BOTTOM LEFT: Residuals + adjustments */}
                <div style={{border:"1px solid #1e293b",borderRadius:8,padding:"8px 10px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <div style={{fontSize:15,fontWeight:700,color:"#fbbf24"}}>Residuals (Observed − Expected)</div>
                    <div style={{display:"flex",gap:4}}>
                      <button onClick={e=>{e.stopPropagation();setMleView('person');}} style={{padding:"2px 10px",borderRadius:6,border:`1px solid ${isPerson?"#38bdf8":"#334155"}`,background:isPerson?"rgba(56,189,248,0.15)":"transparent",color:isPerson?"#38bdf8":"#64748b",cursor:"pointer",fontSize:12,fontWeight:600}}>Persons</button>
                      <button onClick={e=>{e.stopPropagation();setMleView('item');}} style={{padding:"2px 10px",borderRadius:6,border:`1px solid ${!isPerson?"#f59e0b":"#334155"}`,background:!isPerson?"rgba(245,158,11,0.15)":"transparent",color:!isPerson?"#f59e0b":"#64748b",cursor:"pointer",fontSize:12,fontWeight:600}}>Items</button>
                    </div>
                  </div>
                  <table style={{borderCollapse:"collapse",fontSize:f,width:"100%"}}>
                    <thead><tr>
                      <th style={{width:26}}/>
                      {MLE_ITEMS.map((it,i)=><th key={i} style={{textAlign:"center",color:"#f59e0b",fontWeight:600,padding:"2px",fontSize:f}}>{it}</th>)}
                      <th style={{textAlign:"center",color:"#fbbf24",fontWeight:700,fontSize:f,borderLeft:"2px solid #334155",padding:"2px 4px",opacity:isPerson?1:0.3}}>ΣRes</th>
                      <th style={{textAlign:"center",color:"#22c55e",fontWeight:700,fontSize:f,padding:"2px 4px",opacity:isPerson?1:0.3}}>Δβ</th>
                    </tr></thead>
                    <tbody>
                      {MLE_LABELS.map((lb,p)=>{const adj=pVarSums[p]>0?pResSums[p]/pVarSums[p]:0;return <tr key={p}>
                        <td style={{fontWeight:700,color:"#38bdf8",textAlign:"center",fontSize:f}}>{lb}</td>
                        {Array.from({length:10},(_,i)=>{const r=MLE_OBS[p][i]-h.exp[p][i];return <td key={i} onMouseEnter={e=>tt(e,`Obs ${MLE_OBS[p][i]} − Exp ${h.exp[p][i].toFixed(3)} = ${r>=0?"+":""}${r.toFixed(3)}`)} onMouseLeave={ttOff} style={{textAlign:"center",padding:"3px 1px",background:resBg(r),color:resClr(r),border:"1px solid #1e293b",fontWeight:600}}>{r>=0?"+":""}{r.toFixed(2)}</td>})}
                        <td style={{textAlign:"center",color:"#fbbf24",fontSize:f,fontWeight:700,borderLeft:"2px solid #334155",padding:"2px 4px",background:isPerson?"rgba(251,191,36,0.12)":"rgba(251,191,36,0.03)",opacity:isPerson?1:0.3,transition:"opacity 0.3s"}}>{pResSums[p]>=0?"+":""}{pResSums[p].toFixed(3)}</td>
                        <td style={{textAlign:"center",color:"#22c55e",fontSize:f,fontWeight:700,padding:"2px 4px",background:isPerson?"rgba(34,197,94,0.12)":"rgba(34,197,94,0.03)",opacity:isPerson?1:0.3,transition:"opacity 0.3s"}}>{adj>=0?"+":""}{adj.toFixed(3)}</td>
                      </tr>})}
                      {/* Item residual sums row */}
                      <tr style={{borderTop:"2px solid #334155"}}>
                        <td style={{fontSize:f,color:"#fbbf24",fontWeight:700,textAlign:"center"}}>ΣRes</td>
                        {iResSums.map((r,i)=><td key={i} style={{textAlign:"center",color:"#fbbf24",fontSize:f,fontWeight:700,background:!isPerson?"rgba(251,191,36,0.12)":"rgba(251,191,36,0.03)",opacity:!isPerson?1:0.3,transition:"opacity 0.3s"}}>{r>=0?"+":""}{r.toFixed(2)}</td>)}
                        <td style={{textAlign:"center",color:converged?"#22c55e":"#fbbf24",fontSize:converged?15:f,fontWeight:700,borderLeft:"2px solid #334155",background:converged?"rgba(34,197,94,0.2)":"rgba(251,191,36,0.15)",padding:"3px 4px",animation:converged?"pulse 1.5s ease-in-out infinite":"none"}}>{converged?"0.001":(isPerson?totalResSumPersons:totalResSumItems).toFixed(3)}</td>
                        <td/>
                      </tr>
                      {/* Item adjustment row */}
                      <tr>
                        <td style={{fontSize:f,color:"#22c55e",fontWeight:700,textAlign:"center"}}>Δδ</td>
                        {MLE_OBS[0].map((_,i)=>{const adj=iVarSums[i]>0?-iResSums[i]/iVarSums[i]:0;return <td key={i} style={{textAlign:"center",color:"#22c55e",fontSize:f,fontWeight:700,background:!isPerson?"rgba(34,197,94,0.12)":"rgba(34,197,94,0.03)",opacity:!isPerson?1:0.3,transition:"opacity 0.3s"}}>{adj>=0?"+":""}{adj.toFixed(2)}</td>})}
                        <td/><td/>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* BOTTOM RIGHT: Formula + convergence */}
                <div style={{border:"1px solid #1e293b",borderRadius:8,padding:"6px 12px",display:"flex",flexDirection:"column",justifyContent:"center",gap:6,opacity:showOverlay?0.1:1,transition:"opacity 0.3s"}}>
                  <div style={{fontSize:16,color:"#f8fafc",padding:"10px 14px",background:"rgba(15,23,42,0.5)",borderRadius:8,textAlign:"center",lineHeight:1.8}}>
                    <div style={{color:"#38bdf8",fontWeight:600,marginBottom:4}}>Person: β<sub>new</sub> = β<sub>old</sub> + ΣRes / ΣVar</div>
                    <div style={{color:"#f59e0b",fontWeight:600}}>Item: δ<sub>new</sub> = δ<sub>old</sub> − ΣRes / ΣVar</div>
                  </div>
                  <div style={{fontSize:14,color:"#64748b",lineHeight:1.5,textAlign:"center"}}>
                    Residuals = <em>direction</em>. Variance = <em>how far</em>.<br/>Persons and items adjust simultaneously.
                  </div>
                  {converged&&<div style={{padding:"8px 12px",borderRadius:8,background:"rgba(34,197,94,0.1)",border:"2px solid #22c55e",textAlign:"center",animation:"pulse 1.5s ease-in-out infinite"}}>
                    <div style={{fontSize:16,color:"#22c55e",fontWeight:700}}>CONVERGED at 0.001 — these are your measurements</div>
                  </div>}
                </div>
              </div>
              {/* Overlay explanations — bordered paragraphs positioned over each matrix */}
              {showOverlay&&<div style={{position:"absolute",inset:"0",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px 16px",maxWidth:1800,margin:"0 auto",zIndex:10,pointerEvents:"none"}}>
                <div style={{border:"3px solid #3b82f6",borderRadius:10,background:"rgba(15,23,42,0.93)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
                  <div style={{fontSize:17,color:"#93c5fd",lineHeight:1.8,textAlign:"center"}}>Each cell is the model's predicted probability of a correct response: e<sup>(β−δ)</sup> / (1+e<sup>(β−δ)</sup>). These are NOT observed — they are what the model thinks should happen given the current estimates. The initial logits (β₀, δ₀) are crude starting points — simply the log of the raw proportion correct divided by proportion incorrect. These early rough estimates are then refined through iteration.</div>
                </div>
                <div style={{border:"3px solid #3b82f6",borderRadius:10,background:"rgba(15,23,42,0.93)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
                  <div style={{fontSize:17,color:"#93c5fd",lineHeight:1.8,textAlign:"center"}}>Variance = P × (1−P). This is the Fisher information for each interaction. It is maximised when P = 0.5 (item difficulty matches person ability — most informative). The row and column sums are the total information available for adjusting each person and item estimate — this controls how far we dare to adjust.</div>
                </div>
                <div style={{border:"3px solid #3b82f6",borderRadius:10,background:"rgba(15,23,42,0.93)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
                  <div style={{fontSize:17,color:"#93c5fd",lineHeight:1.8,textAlign:"center"}}>Residual = Observed − Expected. Positive means the person did better than predicted; negative means worse. The sum of residuals tells us which direction to adjust. The adjustment (Δβ) = ΣRes ÷ ΣVar. The variance determines how confident the step is. Items adjust simultaneously using column sums with the same logic.</div>
                </div>
                <div style={{border:"3px solid #3b82f6",borderRadius:10,background:"rgba(15,23,42,0.93)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
                  <div style={{fontSize:17,color:"#93c5fd",lineHeight:1.8,textAlign:"center"}}>The residuals tell us the direction to move each estimate. The variance tells us how far. We divide sum of residuals by sum of variance to get the adjustment. This is Newton-Raphson: slope divided by curvature gives the optimal step. Persons and items are updated simultaneously, then we iterate until the adjustments are negligible.</div>
                </div>
              </div>}
              {/* ANALOGY OVERLAY — simulation metaphor */}
            </div>
          )}
          {/* Controls + Show Explanations */}
          <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:24}}>
            <SlideButton onClick={e=>{e.stopPropagation();setMleStep(0);}} active={ms===0}>Raw Data</SlideButton>
            {iterSteps.slice(1).map((it,i)=><SlideButton key={i} onClick={e=>{e.stopPropagation();setMleStep(i+1);}} active={ms===i+1} clr={it>=20?"#22c55e":undefined}>Iteration {it}</SlideButton>)}
          </div>
          {ms>0&&<div style={{display:"flex",justifyContent:"center",gap:12,marginTop:20}}>
            <button onClick={e=>{e.stopPropagation();setShowAnalogy(false);setShowOverlay(!showOverlay);}} style={{padding:"10px 28px",borderRadius:8,border:"2px solid #22c55e",background:showOverlay?"rgba(34,197,94,0.2)":"transparent",color:"#22c55e",cursor:"pointer",fontSize:17,fontWeight:600}}>
              {showOverlay?"Hide":"Show"} Explanations
            </button>
            <button onClick={e=>{e.stopPropagation();setShowOverlay(false);setShowAnalogy(!showAnalogy);}} style={{padding:"10px 28px",borderRadius:8,border:"2px solid #22c55e",background:showAnalogy?"rgba(34,197,94,0.2)":"transparent",color:"#22c55e",cursor:"pointer",fontSize:17,fontWeight:600}}>
              {showAnalogy?"Hide":"Show"} Analogy
            </button>
          </div>}
          {/* Floating tooltip */}
          {tooltip&&<div style={{position:"fixed",left:tooltip.x+12,top:tooltip.y-40,background:"rgba(15,23,42,0.95)",border:"1px solid #f59e0b",borderRadius:8,padding:"8px 14px",fontSize:13,color:"#f8fafc",maxWidth:400,zIndex:100,pointerEvents:"none",lineHeight:1.5}}>{tooltip.text}</div>}
        </div>
      );
    },

    // ═══ SECTION BREAK — Part 2 ═══
    ()=>(<SectionBreak part="Part 2" title="Discrimination, Reliability, and Validity" subtitle="How we know the model is working — and what goes wrong when it isn't"/>),

    // ═══ Discrimination: Conceptual ═══
    ()=>(
      <div style={{padding:"20px 80px"}}>
        <SlideTitle>Discrimination and the Unit</SlideTitle>
        <div style={{display:"flex",gap:36,margin:"8px auto",maxWidth:1600,alignItems:"flex-start"}}>
          {/* ICC graph — smaller, higher */}
          <div style={{flex:1.1}}>
            <svg viewBox="0 0 560 340" style={{width:"100%"}}>
              {/* Axes */}
              <line x1={55} y1={290} x2={520} y2={290} stroke="#475569" strokeWidth={2}/>
              <line x1={55} y1={290} x2={55} y2={15} stroke="#475569" strokeWidth={2}/>
              <text x={288} y={320} textAnchor="middle" fill="#94a3b8" fontSize={14}>Ability (logits)</text>
              <text x={16} y={155} textAnchor="middle" fill="#94a3b8" fontSize={14} transform="rotate(-90,16,155)">P(correct)</text>
              {[-4,-2,0,2,4].map(v=><g key={v}><line x1={55+(v+5)/10*465} y1={290} x2={55+(v+5)/10*465} y2={297} stroke="#64748b" strokeWidth={1.5}/><text x={55+(v+5)/10*465} y={312} textAnchor="middle" fill="#64748b" fontSize={12}>{v}</text></g>)}
              {[0,0.25,0.5,0.75,1].map(v=><g key={v}><line x1={48} y1={290-v*275} x2={55} y2={290-v*275} stroke="#64748b" strokeWidth={1.5}/><text x={44} y={294-v*275} textAnchor="end" fill="#64748b" fontSize={11}>{v.toFixed(2)}</text></g>)}
              {/* High discrimination ICC */}
              {Array.from({length:200},(_,i)=>{const x=-5+i*0.05;const p=1/(1+Math.exp(-(2.0*x)));const sx=55+(x+5)/10*465;const sy=290-p*275;const px=x-0.05;const pp=1/(1+Math.exp(-(2.0*px)));return i===0?null:<line key={`h${i}`} x1={55+(px+5)/10*465} y1={290-pp*275} x2={sx} y2={sy} stroke="#22c55e" strokeWidth={3}/>;}).filter(Boolean)}
              {/* Low discrimination ICC */}
              {Array.from({length:200},(_,i)=>{const x=-5+i*0.05;const p=1/(1+Math.exp(-(0.6*x)));const sx=55+(x+5)/10*465;const sy=290-p*275;const px=x-0.05;const pp=1/(1+Math.exp(-(0.6*px)));return i===0?null:<line key={`l${i}`} x1={55+(px+5)/10*465} y1={290-pp*275} x2={sx} y2={sy} stroke="#ef4444" strokeWidth={3} strokeDasharray="8,4"/>;}).filter(Boolean)}
              {/* Labels — top left and bottom right */}
              <text x={65} y={35} fill="#22c55e" fontSize={15} fontWeight="bold">High discrimination</text>
              <text x={65} y={53} fill="#22c55e" fontSize={12}>Steep gradient — small unit — precise</text>
              <text x={515} y={250} fill="#ef4444" fontSize={15} fontWeight="bold" textAnchor="end">Low discrimination</text>
              <text x={515} y={268} fill="#ef4444" fontSize={12} textAnchor="end">Flat gradient — large unit — imprecise</text>
            </svg>
          </div>
          {/* Text — no KeyInsight, moved to notes */}
          <div style={{flex:1}}>
            <div style={{fontSize:26,color:"#f8fafc",lineHeight:1.8}}>
              <p><span style={{color:"#f59e0b",fontWeight:700}}>Discrimination</span> is the rate of change in the probability of a correct response as ability increases.</p>
              <p style={{marginTop:16}}>A <span style={{color:"#22c55e",fontWeight:600}}>high-discriminating</span> item: probability rises steeply. A small difference in ability produces a large change in the chance of success. <span style={{color:"#22c55e"}}>Small unit. Precise measurement.</span></p>
              <p style={{marginTop:16}}>A <span style={{color:"#ef4444",fontWeight:600}}>low-discriminating</span> item: probability rises slowly. A large difference in ability barely changes the outcome. <span style={{color:"#ef4444"}}>Large unit. Imprecise measurement.</span></p>
            </div>
          </div>
        </div>
        {/* Bottom: C. diff images with mm/µm rulers */}
        <div style={{maxWidth:1500,margin:"12px auto 0"}}>
          {/* Three bacteria images */}
          <div style={{display:"flex",justifyContent:"center",alignItems:"flex-end",gap:24,marginBottom:8}}>
            <div style={{textAlign:"center"}}><img src="./c_diff_1.png" alt="C. diff A" style={{height:50,borderRadius:4}}/><div style={{fontSize:13,color:"#38bdf8",fontWeight:600}}>A</div></div>
            <div style={{textAlign:"center"}}><img src="./c_diff_2.png" alt="C. diff B" style={{height:50,borderRadius:4}}/><div style={{fontSize:13,color:"#f59e0b",fontWeight:600}}>B</div></div>
            <div style={{textAlign:"center"}}><img src="./c_diff_3.png" alt="C. diff C" style={{height:50,borderRadius:4}}/><div style={{fontSize:13,color:"#22c55e",fontWeight:600}}>C</div></div>
          </div>
          {/* Two rulers side by side */}
          <div style={{display:"flex",gap:20}}>
            {/* mm ruler — no separation */}
            <div style={{flex:1,padding:"8px 16px",background:"rgba(239,68,68,0.06)",border:"2px solid rgba(239,68,68,0.3)",borderRadius:10}}>
              <svg viewBox="0 0 400 40" style={{width:"100%"}}>
                {[0,1,2,3,4,5,6,7,8].map(i=><g key={i}><line x1={20+i*45} y1={5} x2={20+i*45} y2={25} stroke="#ef4444" strokeWidth={i%5===0?2:1}/><text x={20+i*45} y={38} textAnchor="middle" fill="#ef4444" fontSize={10}>{i}mm</text></g>)}
                <line x1={20} y1={15} x2={380} y2={15} stroke="#ef4444" strokeWidth={1.5}/>
                <circle cx={22} cy={15} r={4} fill="#38bdf8"/><circle cx={24} cy={15} r={4} fill="#f59e0b"/><circle cx={26} cy={15} r={4} fill="#22c55e"/>
              </svg>
              <div style={{fontSize:14,color:"#ef4444",textAlign:"center",fontWeight:600}}>mm ruler — all three ≈ 0 mm — no separation</div>
            </div>
            {/* µm ruler — clear separation */}
            <div style={{flex:1,padding:"8px 16px",background:"rgba(34,197,94,0.06)",border:"2px solid rgba(34,197,94,0.3)",borderRadius:10}}>
              <svg viewBox="0 0 400 40" style={{width:"100%"}}>
                {[0,1,2,3,4,5,6,7,8].map(i=><g key={i}><line x1={20+i*45} y1={5} x2={20+i*45} y2={25} stroke="#22c55e" strokeWidth={i%2===0?2:1}/><text x={20+i*45} y={38} textAnchor="middle" fill="#22c55e" fontSize={10}>{i}µm</text></g>)}
                <line x1={20} y1={15} x2={380} y2={15} stroke="#22c55e" strokeWidth={1.5}/>
                <circle cx={20+3.2*45} cy={15} r={5} fill="#38bdf8" stroke="#fff" strokeWidth={1}/><circle cx={20+4.1*45} cy={15} r={5} fill="#f59e0b" stroke="#fff" strokeWidth={1}/><circle cx={20+5.8*45} cy={15} r={5} fill="#22c55e" stroke="#fff" strokeWidth={1}/>
              </svg>
              <div style={{fontSize:14,color:"#22c55e",textAlign:"center",fontWeight:600}}>µm ruler — A, B, C clearly separated</div>
            </div>
          </div>
        </div>
      </div>
    ),

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

    // ═══ SLIDE 5 — What Does Fit Mean? (Validity) ═══
    ()=>(
      <div style={{padding:"60px 80px"}}>
        <SlideTitle>Fit and Construct Validity</SlideTitle>
        <div style={{fontSize:22,color:"#94a3b8",textAlign:"center",marginBottom:16,lineHeight:1.6}}>The Rasch model is a validity machine. It creates a simulation so we can examine whether items operate in unison, reflecting the overall model. That examination is fit.</div>
        <div style={{display:"flex",gap:60,justifyContent:"center",alignItems:"flex-start",margin:"10px auto",maxWidth:1500}}>
          <div style={{flex:1}}>
            <ICC difficulty={0} observedPoints={[{ability:-3,proportion:0.06},{ability:-1.5,proportion:0.20},{ability:0,proportion:0.50},{ability:1.5,proportion:0.80},{ability:3,proportion:0.94},{ability:4,proportion:0.97}]} label="Good Fit: Observed matches predicted"/>
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",paddingTop:20}}>
            <div style={{fontSize:30,color:"#f8fafc",lineHeight:1.8}}>
              <p>The model predicts a probability of success for every person-item combination.</p>
              <p style={{marginTop:16}}>Group persons by ability. Compare <span style={{color:"#22c55e",fontWeight:700}}>observed proportions</span> to the <span style={{color:"#f59e0b",fontWeight:700}}>theoretical ICC</span>.</p>
              <p style={{marginTop:16}}>When dots sit close to the curve → the item <span style={{color:"#22c55e"}}>fits</span>.</p>
              <p style={{marginTop:16}}>When they deviate systematically → <span style={{color:"#ef4444"}}>misfit</span>.</p>
            </div>
          </div>
        </div>
      </div>
    ),

    // ═══ SLIDE 6 — Item Misfit ═══
    ()=>(
      <div style={{padding:"50px 60px"}}>
        <SlideTitle>Item Misfit</SlideTitle>
        <div style={{display:"flex",gap:60,justifyContent:"center",margin:"20px auto",maxWidth:1500}}>
          <div style={{flex:1}}>
            <ICC difficulty={0} observedPoints={[{ability:-3,proportion:0.22},{ability:-1.5,proportion:0.32},{ability:0,proportion:0.48},{ability:1.5,proportion:0.62},{ability:3,proportion:0.72},{ability:4,proportion:0.78}]} label="Low Discrimination" misfitType={true}/>
            <div style={{textAlign:"center",fontSize:22,color:"#94a3b8",marginTop:8}}>Flatter than the ICC — item is noisy</div>
          </div>
          <div style={{flex:1}}>
            <ICC difficulty={0} observedPoints={[{ability:-2,proportion:0.05},{ability:-0.5,proportion:0.18},{ability:0,proportion:0.50},{ability:0.5,proportion:0.82},{ability:1.5,proportion:0.95},{ability:3,proportion:0.98}]} label="High Discrimination" misfitType={true}/>
            <div style={{textAlign:"center",fontSize:22,color:"#94a3b8",marginTop:8}}>Steeper than the ICC — a different unit</div>
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
        <div style={{textAlign:"center",fontSize:28,color:"#64748b",marginTop:20}}>Each is a story for a future session — but why does the Rasch model refuse to accommodate them? That rigidity is the point.</div>
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
            <div style={{fontSize:32,color:"#f8fafc",fontStyle:"italic",lineHeight:1.6,textAlign:"center"}}>"I tried to make the data tell me what they were about, and not I should tell the data how they should behave. That's what statisticians usually do."</div>
            <div style={{fontSize:22,color:"#22c55e",marginTop:14,textAlign:"center"}}>— Georg Rasch, 1978</div>
          </div>
        </div>
      </div>
    ),

    // ═══ SECTION BREAK — Part 3 ═══
    ()=>(<SectionBreak part="Part 3" title="The Mathematics of Nature" subtitle="What does it all mean? The model, the simulation, the estimation — what is it packaged in?"/>),

    // ═══ SLIDE 9 — The Beetle ═══
    ()=>(
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 40px",gap:6}}>
        <SlideTitle>The Beetle</SlideTitle>
        {/* Melbourne Museum photo — hero image */}
        <div style={{position:"relative",width:"90%",maxWidth:1440,borderRadius:20,overflow:"hidden",boxShadow:"0 12px 60px rgba(0,0,0,0.7)"}}>
          <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center, transparent 60%, rgba(15,23,42,0.4) 100%)",zIndex:1,pointerEvents:"none"}}/>
          <img src="./melbourne_museum.png" alt="Dung beetles and stag beetles arranged in spirals, Melbourne Museum" style={{width:"100%",display:"block"}}/>
          {/* Overlaid caption */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"16px 24px",background:"linear-gradient(transparent, rgba(15,23,42,0.85))",zIndex:2}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
              <div>
                <span style={{fontSize:22,color:"#f59e0b",fontWeight:700}}>Absolute growth</span><span style={{fontSize:22,color:"#94a3b8"}}> is exponential.  </span>
                <span style={{fontSize:22,color:"#22c55e",fontWeight:700}}>Relative growth</span><span style={{fontSize:22,color:"#94a3b8"}}> is constant.</span>
              </div>
              <div style={{fontSize:16,color:"#94a3b8",fontStyle:"italic",textAlign:"right"}}>Photo by Paul Montuoro, Melbourne Museum.</div>
            </div>
          </div>
        </div>
        {/* Rasch quote below */}
        <div style={{maxWidth:1200,padding:"12px 28px",background:"rgba(15,23,42,0.5)",borderRadius:12,borderLeft:"4px solid #f59e0b",marginTop:4}}>
          <div style={{fontSize:22,color:"#f8fafc",fontStyle:"italic",lineHeight:1.4,textAlign:"center"}}>"My meeting with Julian Huxley, that assured me that this is really an important line of research. And I continued to stick to it — to individuals — ever since."</div>
          <div style={{fontSize:16,color:"#f59e0b",marginTop:4,textAlign:"center"}}>— Georg Rasch, 1978</div>
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
                <line x1={40} y1={180} x2={280} y2={180} stroke="#475569" strokeWidth={1}/>
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
              {[{logit:-3,odds:0.05,label:"Low ability"},{logit:-2,odds:0.14,label:""},{logit:-1,odds:0.37,label:""},{logit:0,odds:1.00,label:"Equal match"},{logit:1,odds:2.72,label:""},{logit:2,odds:7.39,label:""},{logit:3,odds:20.09,label:"High ability"}].map((r,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:16,marginBottom:i<6?12:0}}>
                  <div style={{width:80,fontSize:24,fontWeight:700,color:"#22c55e",textAlign:"right"}}>{r.logit}</div>
                  <div style={{flex:1,height:24,background:"#1e293b",borderRadius:12,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(r.odds/20.09*100,100)}%`,background:"linear-gradient(90deg,#22c55e,#f59e0b)",borderRadius:12,transition:"width 0.5s"}}/></div>
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

    // ═══ SLIDE 13 — Rasch Meets the Heavy Hitters (Final) ═══
    ()=>(
      <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:"30px 80px",gap:24}}>
        <SlideTitle>Rasch Meets Fisher, Huxley</SlideTitle>
        <div style={{display:"flex",gap:40,alignItems:"center",maxWidth:1500}}>
          {/* E. coli GIF */}
          <div style={{flex:0.7,borderRadius:16,overflow:"hidden",boxShadow:"0 8px 30px rgba(0,0,0,0.5)"}}>
            <img src="./ecoli_growth.gif" alt="E. coli colony growing exponentially" style={{width:"100%",display:"block"}}/>
            <div style={{fontSize:12,color:"#64748b",textAlign:"center",padding:"4px",background:"rgba(15,23,42,0.8)"}}>E. coli exponential growth. Stewart et al., CC BY-SA 4.0</div>
          </div>
          {/* Statement + quote */}
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:24}}>
            <div style={{padding:"24px 36px",background:"rgba(245,158,11,0.06)",border:"3px solid rgba(245,158,11,0.4)",borderRadius:16}}>
              <div style={{fontSize:30,color:"#f8fafc",fontWeight:600,lineHeight:1.6}}>The Rasch model's exponential structure reflects how biological systems develop. Measurement must deal with the individual — and the exponential is nature's way of doing that.</div>
            </div>
            <div style={{padding:"24px 36px",background:"rgba(15,23,42,0.5)",borderRadius:16,borderLeft:"4px solid #22c55e"}}>
              <div style={{fontSize:28,color:"#f8fafc",fontStyle:"italic",lineHeight:1.7,textAlign:"center"}}>"I showed this to Julian Huxley, and he was <span style={{color:"#f59e0b",fontWeight:700}}>completely flabbergasted</span>."</div>
              <div style={{fontSize:18,color:"#22c55e",marginTop:10,textAlign:"center"}}>— Georg Rasch, 1978 interview with David Andrich</div>
            </div>
          </div>
        </div>
      </div>
    ),

    // ═══ SLIDE — The End ═══
    ()=>(
      <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",height:"100%",background:"linear-gradient(135deg,#1e293b 0%,#334155 100%)"}}>
        <div style={{fontSize:80,fontWeight:700,color:"#f8fafc",marginBottom:24}}>Thank You</div>
        <div style={{fontSize:36,color:"#94a3b8"}}>Questions?</div>
      </div>
    ),

  ];

  return(
    <div style={{width:"100vw",height:"100vh",background:"#0f172a",color:"#f8fafc",fontFamily:"system-ui,-apple-system,sans-serif",overflow:"hidden",position:"relative",}} onClick={e=>{if(e.clientX>window.innerWidth/2)go(currentSlide+1);else go(currentSlide-1);}}>
      <style>{`*, *::before, *::after { cursor: auto !important; } button, input[type=range] { cursor: pointer !important; }`}</style>
      {/* Slide content */}
      <div style={{width:"100%",height:"calc(100% - 70px)",overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"center"}}>{slides[currentSlide]()}</div>
      {/* Analogy overlay — rendered outside slide content to avoid flex centering issues */}
      {showAnalogy&&<div onClick={e=>{e.stopPropagation();setShowAnalogy(false);}} style={{position:"fixed",top:"10%",left:"8%",width:"84%",height:"80%",display:"flex",flexDirection:"column",padding:"10px 16px",background:"rgba(15,23,42,0.99)",borderRadius:12,zIndex:50,cursor:"pointer",boxShadow:"0 0 60px rgba(0,0,0,0.8)"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gridTemplateRows:"1fr 1fr",gap:"14px 18px",flex:1}}>
          <div style={{border:"3px solid #3b82f6",borderRadius:12,background:"rgba(15,23,42,0.97)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:16,overflow:"hidden"}}>
            <div style={{borderRadius:8,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.5)",maxWidth:"90%",maxHeight:"78%"}}><img src="./sim.png" alt="Flight Simulator 2020" style={{width:"100%",display:"block"}}/></div>
            <div style={{fontSize:24,color:"#93c5fd",fontWeight:700,marginTop:10}}>THE MODEL = THE SIMULATION</div>
          </div>
          <div style={{border:"3px solid #3b82f6",borderRadius:12,background:"rgba(15,23,42,0.97)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:16,overflow:"hidden"}}>
            <div style={{display:"flex",gap:16,alignItems:"flex-start",maxWidth:"90%",maxHeight:"72%"}}>
              <div style={{flex:1,textAlign:"center"}}>
                <div style={{borderRadius:6,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.4)"}}><img src="./real.png" alt="Real world — close" style={{width:"100%",display:"block"}}/></div>
                <div style={{fontSize:17,color:"#22c55e",fontWeight:700,marginTop:6}}>Close — high information</div>
              </div>
              <div style={{flex:1,textAlign:"center"}}>
                <div style={{borderRadius:6,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.4)",filter:"blur(4px)",opacity:0.35}}><img src="./real.png" alt="Real world — far" style={{width:"100%",display:"block"}}/></div>
                <div style={{fontSize:17,color:"#ef4444",fontWeight:700,marginTop:6}}>Far — low information</div>
              </div>
            </div>
            <div style={{fontSize:22,color:"#93c5fd",fontWeight:700,marginTop:10}}>VARIANCE = HOW WELL CAN WE SEE REALITY?</div>
          </div>
          <div style={{border:"3px solid #3b82f6",borderRadius:12,background:"rgba(15,23,42,0.97)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:16,overflow:"hidden"}}>
            <div style={{borderRadius:8,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.5)",maxWidth:"85%",maxHeight:"80%"}}><img src="./real_sim.png" alt="Real World vs Flight Simulator comparison" style={{width:"100%",height:"100%",objectFit:"contain",display:"block"}}/></div>
            <div style={{fontSize:22,color:"#93c5fd",fontWeight:700,marginTop:8}}>THE RESIDUAL: WHERE DOES SIM DIFFER FROM REALITY?</div>
          </div>
          <div style={{border:"3px solid #3b82f6",borderRadius:12,background:"rgba(15,23,42,0.97)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:16,overflow:"hidden"}}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              {["30%","50%","70%","90%","100%"].map((pct,i)=>(<div key={i} style={{width:70,height:50,borderRadius:8,background:`rgba(59,130,246,${0.08+i*0.18})`,border:`2px solid rgba(59,130,246,${0.2+i*0.18})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"#93c5fd",fontWeight:700}}>{pct}</div>))}
            </div>
            <div style={{fontSize:28,color:"#93c5fd",fontWeight:700,marginTop:16}}>CONVERGENCE</div>
            <div style={{fontSize:20,color:"#94a3b8",textAlign:"center",lineHeight:1.6,marginTop:6}}>Each iteration, the simulation gets closer to reality.</div>
          </div>
        </div>
        <div style={{padding:"10px 20px",background:"rgba(245,158,11,0.1)",borderTop:"2px solid #f59e0b",borderRadius:"0 0 8px 8px",textAlign:"center",animation:"pulse 2.5s ease-in-out infinite",marginTop:6}}>
          <style>{`@keyframes pulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }`}</style>
          <div style={{fontSize:17,color:"#f59e0b",fontWeight:700,lineHeight:1.6}}>The model is the simulation, the simulation is the model.</div>
        </div>
      </div>}
      {/* Bottom bar */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:70,background:"rgba(15,23,42,0.95)",borderTop:"1px solid #1e293b",display:"flex",alignItems:"center",padding:"0 30px"}}>
        {/* Progress track */}
        <div style={{flex:1,height:8,background:"#1e293b",borderRadius:4,position:"relative",marginRight:20}}>
          <div style={{width:`${progress*100}%`,height:"100%",background:"linear-gradient(90deg,#166534,#4ade80)",borderRadius:4,transition:"width 0.4s"}}/>
          {/* Beetle on the track */}
          <div style={{position:"absolute",bottom:10,left:`${Math.min(progress*100,92)}%`,transform:"translateX(-50%)",transition:"left 0.4s"}}><Beetle scale={beetleScale}/></div>
        </div>
        <div style={{color:"#64748b",fontSize:18,marginRight:20}}>{currentSlide+1}/{SLIDE_COUNT}</div>
        <button onClick={e=>{e.stopPropagation();window.open("./src/presenter.html","presenter","width=900,height=700");}} style={{background:"none",border:"1px solid #334155",color:"#64748b",padding:"8px 16px",borderRadius:8,cursor:"pointer",fontSize:16}}>Presenter (P)</button>
      </div>
    </div>
  );
}
