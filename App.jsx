import { useState, useEffect, useRef } from "react";
import { SLIDE_COUNT } from "./src/notes.js";

// 40 persons × 20 items — no extreme scores (scores range 1–19)
const NUM_PERSONS=40, NUM_ITEMS=20;
const PERSON_POSITIONS=Array.from({length:NUM_PERSONS},(_,i)=>-4.5+i*(9/(NUM_PERSONS-1)));
const ITEM_POSITIONS=Array.from({length:NUM_ITEMS},(_,i)=>-3.5+i*(7/(NUM_ITEMS-1)));
// Deterministic Guttman: person 0 = score 1, persons 1..38 = scores 1..19, person 39 = perfect 20
const DETERMINISTIC=(()=>{const rows=[];for(let p=0;p<NUM_PERSONS;p++){const score=p===NUM_PERSONS-1?NUM_ITEMS:Math.round(1+(p/(NUM_PERSONS-2))*(NUM_ITEMS-2));const row=Array.from({length:NUM_ITEMS},(_,i)=>i<score?1:0);rows.push(row);}return rows;})();
// Probabilistic: same expected scores but with noisier random flips
const PROBABILISTIC=(()=>{const seed=[3,7,2,9,1,6,4,8,5,0,7,3,9,2,6,1,8,4,0,5];const rows=[];for(let p=0;p<NUM_PERSONS;p++){const score=Math.round(1+(p/(NUM_PERSONS-1))*(NUM_ITEMS-2));const row=Array.from({length:NUM_ITEMS},(_,i)=>{const dist=Math.abs(i-score+0.5);if(dist>4)return i<score?1:0;const h=(seed[(p*3+i*7)%20]+seed[(p*5+i*2)%20])%10;if(dist<=1)return h>4?(i<score?0:1):(i<score?1:0);if(dist<=2)return h>6?(i<score?0:1):(i<score?1:0);if(dist<=3)return h>7?(i<score?0:1):(i<score?1:0);return h>8?(i<score?0:1):(i<score?1:0);});const s=row.reduce((a,b)=>a+b,0);if(s===0)row[0]=1;if(s===NUM_ITEMS)row[NUM_ITEMS-1]=0;rows.push(row);}return rows;})();
// Misfit: probabilistic base with item 10 (index 9) behaving erratically — not perfectly inverted
const MISFIT_COL=9;
const MISFIT=(()=>{const seed=[3,7,2,9,1,6,4,8,5,0,7,3,9,2,6,1,8,4,0,5];const rows=[];for(let p=0;p<NUM_PERSONS;p++){const score=Math.round(1+(p/(NUM_PERSONS-1))*(NUM_ITEMS-2));const row=Array.from({length:NUM_ITEMS},(_,i)=>{if(i===MISFIT_COL){const h=(seed[(p*4+i*3)%20]+seed[(p*2+i*5)%20])%10;return(i<score)?(h>3?0:1):(h>3?1:0);}return i<score?1:0;});rows.push(row);}return rows;})();

const channel = new BroadcastChannel("deck-sync");

function SlideButton({onClick,children,active,clr}){
  return(
    <button onClick={onClick} style={{padding:"20px 52px",borderRadius:14,fontWeight:600,fontSize:28,border:active?`3px solid ${clr||"#f59e0b"}`:"3px solid #334155",background:active?"rgba(245,158,11,0.1)":"rgba(30,41,59,0.5)",color:active?(clr||"#f59e0b"):"#94a3b8",cursor:"pointer",transition:"all 0.2s"}}>{children}</button>
  );
}

function SlideTitle({children}){
  return <h1 style={{fontSize:88,fontWeight:700,color:"#f59e0b",textAlign:"center",marginBottom:32,letterSpacing:"-0.5px"}}>{children}</h1>;
}

function KeyInsight({children}){
  return(
    <div style={{fontSize:38,color:"#fbbf24",textAlign:"center",padding:"40px 64px",border:"3px solid rgba(245,158,11,0.4)",borderRadius:20,margin:"44px auto",maxWidth:1700,fontWeight:600,background:"rgba(245,158,11,0.06)",lineHeight:1.5}}>{children}</div>
  );
}

function ContinuumLine({items,persons,highlightPerson=-1,visItems=null,pA=null,pB=null}){
  const mn=-5,mx=6,w=2000;
  const scaleToX=v=>((v-mn)/(mx-mn))*w;
  return(
    <svg width={w+80} height={240} style={{display:"block",margin:"0 auto"}}>
      <line x1={40} y1={130} x2={w+40} y2={130} stroke="#475569" strokeWidth={3}/>
      {[-4,-3,-2,-1,0,1,2,3,4,5].map(v=>(
        <g key={v}><line x1={scaleToX(v)+40} y1={120} x2={scaleToX(v)+40} y2={140} stroke="#64748b" strokeWidth={2}/>
        <text x={scaleToX(v)+40} y={168} textAnchor="middle" fill="#64748b" fontSize={20}>{v}</text></g>
      ))}
      {items&&ITEM_POSITIONS.map((p,i)=>{
        const vis=visItems?visItems.includes(i):true;
        return(<g key={`i${i}`} opacity={vis?1:0.12}>
          <circle cx={scaleToX(p)+40} cy={152} r={10} fill="#f59e0b"/>
          <text x={scaleToX(p)+40} y={192} textAnchor="middle" fill="#f59e0b" fontSize={14} fontWeight="bold">{i+1}</text>
        </g>);
      })}
      {persons&&PERSON_POSITIONS.map((p,i)=>{
        const hl=i<=highlightPerson;const cur=i===highlightPerson;
        return(<g key={`p${i}`} opacity={highlightPerson===-1?0.4:hl?1:0.08}>
          <circle cx={scaleToX(p)+40} cy={104} r={cur?14:8} fill="#38bdf8" stroke={cur?"#fff":"none"} strokeWidth={cur?2:0}/>
          {cur&&<text x={scaleToX(p)+40} y={80} textAnchor="middle" fill="#38bdf8" fontSize={16} fontWeight="bold">P{i+1}</text>}
        </g>);
      })}
      {pA!==null&&(<g>
        <circle cx={scaleToX(pA)+40} cy={96} r={20} fill="#38bdf8" stroke="#fff" strokeWidth={3}/>
        <text x={scaleToX(pA)+40} y={68} textAnchor="middle" fill="#38bdf8" fontSize={26} fontWeight="bold">A</text>
      </g>)}
      {pB!==null&&(<g>
        <circle cx={scaleToX(pB)+40} cy={96} r={20} fill="#fb923c" stroke="#fff" strokeWidth={3}/>
        <text x={scaleToX(pB)+40} y={68} textAnchor="middle" fill="#fb923c" fontSize={26} fontWeight="bold">B</text>
      </g>)}
      {pA!==null&&pB!==null&&(<g>
        <line x1={scaleToX(pB)+40} y1={96} x2={scaleToX(pA)+40} y2={96} stroke="#22c55e" strokeWidth={3} strokeDasharray="8"/>
        <text x={scaleToX((pA+pB)/2)+40} y={36} textAnchor="middle" fill="#22c55e" fontSize={28} fontWeight="bold">Difference = {(pA-pB).toFixed(1)} units</text>
      </g>)}
    </svg>
  );
}

function Grid({data,highlightPerson=-1,misfitCol=-1,showAll=true}){
  const nItems=data[0].length;
  const cs=68;
  return(
    <div style={{display:"grid",gridTemplateColumns:`60px repeat(${nItems},${cs}px) 60px`,gap:2,margin:"0 auto",width:"fit-content"}}>
      <div/>
      {Array.from({length:nItems},(_,i)=>(
        <div key={i} style={{textAlign:"center",color:misfitCol===i?"#ef4444":"#f59e0b",fontWeight:700,fontSize:16,padding:"4px 0"}}>{i+1}</div>
      ))}
      <div style={{textAlign:"center",color:"#38bdf8",fontWeight:700,fontSize:16,padding:"4px 0"}}>{"\u03A3"}</div>
      {data.map((row,ri)=>{
        const vis=showAll||ri<=highlightPerson;const cur=highlightPerson>=0&&ri===highlightPerson;const sc=row.reduce((a,b)=>a+b,0);
        return[
          <div key={`l${ri}`} style={{textAlign:"center",fontSize:15,padding:"3px 0",color:cur?"#38bdf8":vis?"#cbd5e1":"#1e293b",fontWeight:cur?700:400,transition:"all 0.3s",display:"flex",alignItems:"center",justifyContent:"center"}}>{ri+1}</div>,
          ...row.map((v,ci)=>{
            const mis=misfitCol===ci;
            let bg="#0f172a",clr="#1e293b";
            if(vis){
              if(v===1){bg=mis?"#7f1d1d":"#14532d";clr=mis?"#fca5a5":"#4ade80";}
              else{bg=mis?"#450a0a":"#1e293b";clr=mis?"#fca5a5":"#64748b";}
            }
            return(
              <div key={`c${ri}${ci}`} style={{textAlign:"center",fontSize:18,fontWeight:700,padding:"3px 0",background:bg,color:clr,border:cur?"2px solid #38bdf8":`1px solid ${mis&&vis?"#7f1d1d":"#1e293b"}`,borderRadius:3,transition:"all 0.3s",minHeight:28,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {vis?v:""}
              </div>
            );
          }),
          <div key={`s${ri}`} style={{textAlign:"center",fontSize:15,padding:"3px 0",color:cur?"#38bdf8":vis?"#e2e8f0":"#1e293b",fontWeight:cur?700:600,transition:"all 0.3s",display:"flex",alignItems:"center",justifyContent:"center"}}>{vis?sc:""}</div>
        ];
      })}
    </div>
  );
}

export default function App(){
  const[currentSlide,setCurrentSlide]=useState(0);
  const[animPersonIndex,setAnimPersonIndex]=useState(-1);
  const[animRunning,setAnimRunning]=useState(false);
  const animIntervalRef=useRef(null);
  const[itemSubset,setItemSubset]=useState("all");
  const[gridMode,setGridMode]=useState("det");
  const presenterRef=useRef(null);

  const changeSlide=(slide)=>{
    const s=Math.max(0,Math.min(SLIDE_COUNT-1,slide));
    setCurrentSlide(s);
    channel.postMessage({type:"slide-change",slide:s});
  };

  const openPresenter=()=>{
    if(presenterRef.current&&!presenterRef.current.closed){
      presenterRef.current.focus();
      return;
    }
    presenterRef.current=window.open("/src/presenter.html","presenter","width=900,height=700");
  };

  useEffect(()=>{
    const handler=e=>{
      if(e.data.type==="slide-change"){
        setCurrentSlide(e.data.slide);
      }
      if(e.data.type==="presenter-ready"){
        channel.postMessage({type:"slide-change",slide:currentSlide});
      }
    };
    channel.addEventListener("message",handler);
    return()=>channel.removeEventListener("message",handler);
  });

  useEffect(()=>{
    const handler=e=>{
      if(e.target.tagName==="BUTTON")return;
      if(e.key==="ArrowRight")changeSlide(currentSlide+1);
      if(e.key==="ArrowLeft")changeSlide(currentSlide-1);
      if(e.key.toLowerCase()==="p")openPresenter();
    };
    window.addEventListener("keydown",handler);
    return()=>window.removeEventListener("keydown",handler);
  });

  useEffect(()=>{
    if(currentSlide!==4){clearInterval(animIntervalRef.current);setAnimPersonIndex(-1);setAnimRunning(false);}
    if(currentSlide!==5)setItemSubset("all");
    if(currentSlide!==8)setGridMode("det");
  },[currentSlide]);

  useEffect(()=>()=>clearInterval(animIntervalRef.current),[]);

  const startAnim=(speed)=>{
    clearInterval(animIntervalRef.current);setAnimPersonIndex(-1);setAnimRunning(true);
    let idx=-1;
    animIntervalRef.current=setInterval(()=>{
      idx++;if(idx>=NUM_PERSONS){clearInterval(animIntervalRef.current);setAnimRunning(false);setAnimPersonIndex(NUM_PERSONS-1);return;}
      setAnimPersonIndex(idx);
    },speed);
  };

  const slides=[
    // Slide 0 — The Hook
    ()=>(<div style={{textAlign:"center"}}>
      <p style={{fontSize:44,color:"#64748b",marginBottom:60,letterSpacing:"3px",textTransform:"uppercase"}}>In the last session, Shiraj Shamshir asked the following question about computer adaptive testing...</p>
      <h1 style={{fontSize:64,fontWeight:600,color:"#f8fafc",maxWidth:1700,margin:"0 auto",lineHeight:1.5,fontStyle:"italic"}}>
        "If one student consistently receives easier questions and another receives harder questions based on performance, how are their final scores fairly compared? Would it be measured with the weighting of the questions presented to student A vs B?"
      </h1>
      <div style={{marginTop:100,fontSize:44,color:"#f59e0b",fontWeight:600}}>
        This question cuts to the heart of psychometrics and validity.
      </div>
    </div>),

    // Slide 1 — Counting vs Measuring
    ()=>(<div>
      <SlideTitle>Counting vs. Measuring</SlideTitle>
      <div style={{display:"flex",justifyContent:"center",gap:80,marginTop:60}}>
        <div style={{textAlign:"center",padding:60,background:"#1e293b",borderRadius:24,width:620}}>
          <div style={{fontSize:88,marginBottom:24}}>&#x1FAA8;</div>
          <h2 style={{fontSize:48,color:"#94a3b8",marginBottom:16}}>Counting</h2>
          <div style={{fontSize:100,fontWeight:700,color:"#64748b"}}>30</div>
          <p style={{fontSize:30,color:"#64748b",marginTop:14}}>rocks in a bucket</p>
          <p style={{fontSize:34,color:"#94a3b8",marginTop:28}}>We have a number.</p>
        </div>
        <div style={{textAlign:"center",padding:60,background:"#14532d",borderRadius:24,width:620,border:"3px solid #22c55e"}}>
          <div style={{fontSize:88,marginBottom:24}}>&#x2696;&#xFE0F;</div>
          <h2 style={{fontSize:48,color:"#4ade80",marginBottom:16}}>Measuring</h2>
          <div style={{fontSize:100,fontWeight:700,color:"#4ade80"}}>642g</div>
          <p style={{fontSize:30,color:"#4ade80",marginTop:14}}>on a weighing scale</p>
          <p style={{fontSize:34,color:"#bbf7d0",marginTop:28}}>We have a measurement.</p>
        </div>
      </div>
      <KeyInsight>"Counting stuff does not result in a magnitude. Therefore, counting stuff does not result in true measurement."</KeyInsight>
      <p style={{fontSize:34,color:"#94a3b8",textAlign:"center",maxWidth:1500,margin:"0 auto",lineHeight:1.6}}>Five large rocks might weigh 500g. Thirty small rocks might weigh 200g. A count requires a unit of the magnitude you're actually measuring.</p>
      <div style={{fontSize:28,color:"#64748b",textAlign:"center",maxWidth:1600,margin:"36px auto 0",lineHeight:1.7,fontStyle:"italic",borderTop:"1px solid #334155",paddingTop:32}}><strong style={{color:"#94a3b8"}}>Magnitude:</strong> a position on a continuum, expressed in equal-interval units. 642g is a magnitude &mdash; it tells us exactly where on the continuum of mass this object sits, in units that mean the same thing everywhere on the scale.<br/><br/><span style={{fontStyle:"normal",color:"#94a3b8"}}>Formally, magnitudes are amounts of a quantitative attribute that can be <strong>ordered</strong> (one is greater or less than another), <strong>combined additively</strong> (200g and 300g together give 500g), and expressed as <strong>ratios</strong> relative to a chosen unit. Following Roche (<em>The Mathematics of Measurement</em>, 1998), measurement is the estimation of the ratio of a magnitude to a unit of the same kind.</span></div>
    </div>),

    // Slide 2 — The Education Problem
    ()=>(<div>
      <SlideTitle>The Education Problem</SlideTitle>
      <div style={{display:"flex",justifyContent:"center",gap:80,marginTop:60,alignItems:"center"}}>
        <div style={{textAlign:"center",padding:60,background:"#1e293b",borderRadius:24,width:480}}>
          <div style={{fontSize:110,fontWeight:700,color:"#f8fafc"}}>15<span style={{fontSize:48,color:"#64748b"}}>/30</span></div>
          <p style={{fontSize:34,color:"#94a3b8",marginTop:20}}>items correct</p>
        </div>
        <div style={{fontSize:80,color:"#334155"}}>&rarr;</div>
        <div style={{textAlign:"center",padding:60,background:"#1e293b",borderRadius:24,width:700}}>
          <h2 style={{fontSize:48,color:"#f59e0b",marginBottom:28}}>Is this a measurement of ability?</h2>
          <p style={{fontSize:38,color:"#e2e8f0"}}>Or just a count of correct responses?</p>
        </div>
      </div>
      <KeyInsight>In adaptive testing, different students answer different items. Does 15/30 mean the same thing for two students who did completely different items?</KeyInsight>
    </div>),

    // Slide 3 — Latent Trait
    ()=>(<div>
      <SlideTitle>Latent Trait</SlideTitle>
      <p style={{fontSize:34,color:"#94a3b8",textAlign:"center",maxWidth:1600,margin:"0 auto 40px",lineHeight:1.6}}>With rocks, we measure <strong style={{color:"#e2e8f0"}}>mass</strong> &mdash; a physical quantity we can feel and observe. In education, we measure <strong style={{color:"#f59e0b"}}>ability</strong> &mdash; but ability is not physical. It is <strong style={{color:"#f59e0b"}}>latent</strong>.</p>
      <div style={{display:"flex",justifyContent:"center",gap:80,alignItems:"center"}}>
        {/* Brain neural map */}
        <div style={{textAlign:"center",flex:"0 0 auto"}}>
          <div style={{width:1230,margin:"0 auto",borderRadius:24,overflow:"hidden"}}>
            <img src="/brain.png" alt="Neural map of mouse brain" style={{width:1230,height:"auto",display:"block"}}/>
          </div>
          <p style={{fontSize:26,color:"#64748b",marginTop:16,fontStyle:"italic"}}>Hidden inside the mind &mdash; invisible, intangible, but real.</p>
        </div>
        {/* Ability continuum */}
        <div style={{width:900}}>
          <div style={{textAlign:"center",fontSize:36,color:"#f59e0b",fontWeight:700,letterSpacing:"2px",marginBottom:20}}>ABILITY CONTINUUM</div>
          <div style={{position:"relative",height:60,margin:"0 40px"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:14,background:"linear-gradient(to right, #ef4444, #f59e0b 40%, #22c55e)",borderRadius:7,opacity:0.9}}/>
            <div style={{position:"absolute",top:30,left:0,fontSize:26,color:"#ef4444"}}>Lower</div>
            <div style={{position:"absolute",top:30,right:0,fontSize:26,color:"#22c55e"}}>Higher</div>
          </div>
          <p style={{fontSize:28,color:"#e2e8f0",textAlign:"center",marginTop:20,lineHeight:1.6}}>Ability exists on a continuum.</p>
        </div>
      </div>
      <KeyInsight>Ability is a phenomenon &mdash; like mass, gravity, ambient temperature, or radiation &mdash; whose magnitude we express by defining units, and then measure. But it is latent: hidden within the mind.</KeyInsight>
      <div style={{display:"flex",justifyContent:"center",gap:60,marginTop:20}}>
        <div style={{fontSize:26,color:"#64748b",textAlign:"center",maxWidth:700,lineHeight:1.6,fontStyle:"italic",borderTop:"1px solid #334155",paddingTop:24}}><strong style={{color:"#94a3b8"}}>Latent trait:</strong> an unobservable attribute or construct of a person that exists on a continuum and can only be inferred from observable behaviour. Its manifestations are as close as we can get to it.</div>
        <div style={{fontSize:26,color:"#64748b",textAlign:"center",maxWidth:700,lineHeight:1.6,fontStyle:"italic",borderTop:"1px solid #334155",paddingTop:24}}><strong style={{color:"#94a3b8"}}>Manifestation:</strong> the observable outcome that occurs when a latent trait interacts with a task &mdash; e.g. a correct answer, a written response, a performance. It is evidence of the trait, not the trait itself.</div>
      </div>
      <div style={{fontSize:20,color:"#475569",textAlign:"center",maxWidth:1600,margin:"28px auto 0",lineHeight:1.5,fontStyle:"italic"}}>Image: 3D map of 84,000 neurons and 524 million synaptic connections in one cubic millimetre of mouse brain, from the MICrONS project. Even with this extraordinary level of detail, neuroscience cannot yet meaningfully differentiate between brains of different ability levels. Psychometrics achieves what brain imaging cannot. &mdash; Naddaf, M. (2025). "Biggest brain map ever details huge number of neurons and their activity." <em>Nature</em>, 9 April 2025.</div>
    </div>),

    // Slide 4 — Guttman Structure
    ()=>(<div>
      <SlideTitle>The Guttman Structure</SlideTitle>
      <p style={{textAlign:"center",color:"#94a3b8",fontSize:30,marginBottom:20}}>When performances show order, we have evidence of underlying ability. (Deterministic pattern shown)</p>
      <ContinuumLine items persons highlightPerson={animPersonIndex}/>
      <div style={{marginTop:24}}><Grid data={DETERMINISTIC} highlightPerson={animPersonIndex} showAll={animPersonIndex===-1}/></div>
      <div style={{display:"flex",justifyContent:"center",gap:28,marginTop:40}}>
        <SlideButton onClick={()=>startAnim(2000)} active={animRunning}>{"\u25B6"} Slow</SlideButton>
        <SlideButton onClick={()=>startAnim(1000)} active={animRunning}>{"\u25B6"} Medium</SlideButton>
        <SlideButton onClick={()=>startAnim(500)} active={animRunning}>{"\u25B6"} Fast</SlideButton>
        <SlideButton onClick={()=>{clearInterval(animIntervalRef.current);setAnimPersonIndex(-1);setAnimRunning(false)}}>{"\u27F2"} Reset</SlideButton>
      </div>
    </div>),

    // Slide 5 — Invariance
    ()=>{
      const vis=itemSubset==="all"?null:itemSubset==="odd"?Array.from({length:10},(_,i)=>i*2):Array.from({length:10},(_,i)=>i*2+1);
      const pA=itemSubset==="all"?2.0:itemSubset==="odd"?2.15:1.85;
      const pB=itemSubset==="all"?-1.0:itemSubset==="odd"?-0.85:-1.15;
      return(<div>
        <SlideTitle>Invariance</SlideTitle>
        <ContinuumLine items pA={pA} pB={pB} visItems={vis}/>
        <div style={{display:"flex",justifyContent:"center",gap:28,marginTop:40}}>
          <SlideButton onClick={()=>setItemSubset("all")} active={itemSubset==="all"}>All 20 Items</SlideButton>
          <SlideButton onClick={()=>setItemSubset("odd")} active={itemSubset==="odd"}>Odd Items Only</SlideButton>
          <SlideButton onClick={()=>setItemSubset("even")} active={itemSubset==="even"}>Even Items Only</SlideButton>
        </div>
        <KeyInsight>The comparison between Person A and Person B remains the same &mdash; regardless of which items are used.</KeyInsight>
        <div style={{fontSize:30,color:"#cbd5e1",textAlign:"left",padding:"36px 56px",borderLeft:"6px solid #f59e0b",margin:"36px auto",maxWidth:1700,fontStyle:"italic",lineHeight:1.7,background:"rgba(245,158,11,0.03)",borderRadius:"0 12px 12px 0"}}>
          "The comparison between two stimuli should be independent of which particular individuals were instrumental for the comparison; and it should also be independent of which other stimuli within the considered class were or might also have been compared. Symmetrically, a comparison between two individuals should be independent of which particular stimuli within the class considered were instrumental for the comparison."
          <div style={{marginTop:20,fontStyle:"normal",color:"#f59e0b",fontWeight:600,fontSize:28}}>— Georg Rasch, 1961</div>
        </div>
      </div>);
    },

    // Slide 6 — Why Invariance Is Possible
    ()=>(<div>
      <SlideTitle>Why Invariance Is Possible</SlideTitle>
      <div style={{display:"flex",justifyContent:"center",gap:72,marginTop:60}}>
        <div style={{padding:56,background:"#1e293b",borderRadius:24,width:700,textAlign:"center"}}>
          <div style={{fontSize:80,marginBottom:20}}>{"\u2696\uFE0F"}</div>
          <h3 style={{color:"#f59e0b",fontSize:40,marginBottom:24}}>Two Scales, One Phenomenon</h3>
          <p style={{color:"#e2e8f0",fontSize:30,lineHeight:1.7}}>Two different scales give the same result for the same pile of rocks &mdash; because both tap into the <strong>same underlying phenomenon: mass</strong>.</p>
        </div>
        <div style={{padding:56,background:"#1e293b",borderRadius:24,width:700,textAlign:"center"}}>
          <div style={{fontSize:80,marginBottom:20}}>{"\uD83D\uDCD0"}</div>
          <h3 style={{color:"#f59e0b",fontSize:40,marginBottom:24}}>Different Items, One Trait</h3>
          <p style={{color:"#e2e8f0",fontSize:30,lineHeight:1.7}}>Different sets of items give the same comparison between persons &mdash; because they all tap into the <strong>same underlying latent trait</strong>.</p>
        </div>
      </div>
      <KeyInsight>Invariance is not just possible because the items measure the same underlying phenomenon. Invariance <em>is</em> the items measuring the same underlying phenomenon.</KeyInsight>
    </div>),

    // Slide 7 — From Ordering to Measurement
    ()=>(<div>
      <SlideTitle>From Ordering to Measurement</SlideTitle>
      <div style={{display:"flex",justifyContent:"center",gap:72,marginTop:60}}>
        <div style={{textAlign:"center",padding:56,background:"#1e293b",borderRadius:24,width:700}}>
          <h3 style={{color:"#64748b",fontSize:40,marginBottom:28}}>Guttman: Ordering</h3>
          <svg width={600} height={120} style={{display:"block",margin:"0 auto"}}>
            <line x1={30} y1={60} x2={570} y2={60} stroke="#475569" strokeWidth={3}/>
            <circle cx={190} cy={60} r={18} fill="#fb923c"/>
            <text x={190} y={100} textAnchor="middle" fill="#fb923c" fontSize={22}>B</text>
            <circle cx={420} cy={60} r={18} fill="#38bdf8"/>
            <text x={420} y={100} textAnchor="middle" fill="#38bdf8" fontSize={22}>A</text>
          </svg>
          <p style={{color:"#94a3b8",fontSize:32,marginTop:18}}>Person A {">"} Person B</p>
          <p style={{color:"#64748b",fontSize:28,marginTop:14}}>Order, but no units. How far apart?</p>
        </div>
        <div style={{textAlign:"center",padding:56,background:"#14532d",borderRadius:24,width:700,border:"3px solid #22c55e"}}>
          <h3 style={{color:"#4ade80",fontSize:40,marginBottom:28}}>Rasch: Measurement</h3>
          <svg width={600} height={120} style={{display:"block",margin:"0 auto"}}>
            <line x1={30} y1={60} x2={570} y2={60} stroke="#22c55e" strokeWidth={3}/>
            {[0,1,2,3,4,5].map(i=>(
              <line key={i} x1={30+i*108} y1={48} x2={30+i*108} y2={72} stroke="#22c55e" strokeWidth={2}/>
            ))}
            <circle cx={138} cy={60} r={18} fill="#fb923c" stroke="#fff" strokeWidth={3}/>
            <text x={138} y={100} textAnchor="middle" fill="#fb923c" fontSize={22}>B</text>
            <circle cx={462} cy={60} r={18} fill="#38bdf8" stroke="#fff" strokeWidth={3}/>
            <text x={462} y={100} textAnchor="middle" fill="#38bdf8" fontSize={22}>A</text>
            <line x1={138} y1={30} x2={462} y2={30} stroke="#22c55e" strokeWidth={3} strokeDasharray="6"/>
            <text x={300} y={22} textAnchor="middle" fill="#22c55e" fontSize={22} fontWeight="bold">2.3 logits</text>
          </svg>
          <p style={{color:"#bbf7d0",fontSize:32,marginTop:18}}>A is <strong>2.3 logits</strong> above B</p>
          <p style={{color:"#4ade80",fontSize:28,marginTop:14}}>Probabilistic units. Invariant measurement.</p>
          <div style={{marginTop:24,padding:"20px 0",borderTop:"2px solid rgba(74,222,128,0.2)"}}>
            <div style={{fontSize:40,color:"#f8fafc",fontFamily:"Georgia,serif",letterSpacing:"1px"}}>
              P(<span style={{fontStyle:"italic"}}>x</span>=1) = <span style={{fontSize:36}}>e<sup style={{fontSize:28}}>(<span style={{color:"#38bdf8"}}>&beta;</span> &minus; <span style={{color:"#f59e0b"}}>&delta;</span>)</sup></span> &frasl; (1 + <span style={{fontSize:36}}>e<sup style={{fontSize:28}}>(<span style={{color:"#38bdf8"}}>&beta;</span> &minus; <span style={{color:"#f59e0b"}}>&delta;</span>)</sup></span>)
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:40,marginTop:12}}>
              <span style={{color:"#38bdf8",fontSize:22}}>&beta; = ability</span>
              <span style={{color:"#f59e0b",fontSize:22}}>&delta; = difficulty</span>
            </div>
          </div>
        </div>
      </div>
      <KeyInsight>Guttman gave us ordering. Rasch gave us units. Computer adaptive testing is invariance in action &mdash; different items, same unit, fair comparison.</KeyInsight>
      <div style={{display:"flex",justifyContent:"center",gap:72,marginTop:36}}>
        <div style={{padding:"28px 40px",background:"rgba(100,116,139,0.08)",borderRadius:16,width:700,border:"2px solid #334155"}}>
          <h4 style={{color:"#64748b",fontSize:26,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:"1px"}}>Representational Theory</h4>
          <p style={{color:"#94a3b8",fontSize:26,lineHeight:1.6}}>Numbers are <em>assigned</em> to represent observed relations. If you can order it, you can number it.</p>
          <p style={{color:"#64748b",fontSize:20,marginTop:8}}>Stevens; Krantz, Luce, Suppes &amp; Tversky (1971)</p>
        </div>
        <div style={{padding:"28px 40px",background:"rgba(74,222,128,0.06)",borderRadius:16,width:700,border:"2px solid #22c55e"}}>
          <h4 style={{color:"#4ade80",fontSize:26,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:"1px"}}>Classical Theory</h4>
          <p style={{color:"#bbf7d0",fontSize:26,lineHeight:1.6}}>Numbers are <em>discovered</em> as ratios of a magnitude to a unit of the same kind. Measurement requires a unit.</p>
          <p style={{color:"#4ade80",fontSize:20,marginTop:8}}>Michell (1997); Humphry &amp; Andrich (2008)</p>
        </div>
      </div>
    </div>),

    // Slide 8 — Order, Probability, and Misfit
    ()=>{
      const d=gridMode==="det"?DETERMINISTIC:gridMode==="prob"?PROBABILISTIC:MISFIT;
      const mc=gridMode==="mis"?MISFIT_COL:-1;
      return(<div>
        <SlideTitle>Order, Probability, and Misfit</SlideTitle>
        <div style={{marginTop:16}}><Grid data={d} misfitCol={mc}/></div>
        <div style={{display:"flex",justifyContent:"center",gap:28,marginTop:40}}>
          <SlideButton onClick={()=>setGridMode("det")} active={gridMode==="det"}>Deterministic</SlideButton>
          <SlideButton onClick={()=>setGridMode("prob")} active={gridMode==="prob"} clr="#22c55e">+ Probabilistic Noise</SlideButton>
          <SlideButton onClick={()=>setGridMode("mis")} active={gridMode==="mis"} clr="#ef4444">+ Misfit</SlideButton>
        </div>
        <div style={{textAlign:"center",marginTop:36,fontSize:32,color:"#cbd5e1",maxWidth:1600,margin:"36px auto",lineHeight:1.6}}>
          {gridMode==="det"&&"Perfect deterministic order. Every person answers correctly all items below their ability and incorrectly all items above. Beautiful \u2014 but is this realistic?"}
          {gridMode==="prob"&&"Real human measurement is probabilistic. The overall pattern holds, but with natural variation. This is what we expect \u2014 and what the Rasch model is designed for."}
          {gridMode==="mis"&&<span>Notice <strong style={{color:"#ef4444"}}>Item 10 (highlighted in red)</strong>: low-ability students answer it correctly, high-ability students answer it incorrectly. This item doesn't measure the same ability as the others. <strong>Misfit is diagnostic &mdash; it reveals where measurement breaks down.</strong></span>}
        </div>
      </div>);
    },

    // Slide 9 — Back to the Question
    ()=>(<div style={{textAlign:"center"}}>
      <p style={{fontSize:42,color:"#64748b",marginBottom:52,letterSpacing:"3px",textTransform:"uppercase"}}>Back to Shiraj's question...</p>
      <h1 style={{fontSize:52,fontWeight:600,color:"#f8fafc",maxWidth:1700,margin:"0 auto",lineHeight:1.5,fontStyle:"italic"}}>
        "If one student consistently receives easier questions and another receives harder questions based on performance, how are their final scores fairly compared?"
      </h1>
      <div style={{marginTop:60,maxWidth:1500,margin:"60px auto"}}>
        <div style={{fontSize:46,color:"#4ade80",fontWeight:700,marginBottom:36}}>Now we can answer:</div>
        <div style={{fontSize:36,color:"#e2e8f0",lineHeight:2,textAlign:"left",maxWidth:1300,margin:"0 auto"}}>
          Because of <strong style={{color:"#f59e0b"}}>invariance</strong> &mdash; comparisons don't depend on specific items.<br/>
          Because of <strong style={{color:"#f59e0b"}}>the unit</strong> &mdash; a defined scale makes measurements comparable.<br/>
          Because we measure <strong style={{color:"#f59e0b"}}>on a continuum</strong> &mdash; not just counting correct answers.
        </div>
      </div>
      <KeyInsight>Different items. Same unit. Fair comparison.</KeyInsight>
      <div style={{display:"flex",justifyContent:"center",gap:56,marginTop:20}}>
        <div style={{padding:"20px 36px",background:"rgba(100,116,139,0.08)",borderRadius:14,width:640,border:"1px solid #334155",textAlign:"left"}}>
          <h4 style={{color:"#64748b",fontSize:22,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:"1px"}}>Classical Test Theory</h4>
          <p style={{color:"#94a3b8",fontSize:24,lineHeight:1.6}}>X = T + E &mdash; treats total score as measurement. Ability and difficulty confounded. No invariance.</p>
        </div>
        <div style={{padding:"20px 36px",background:"rgba(74,222,128,0.06)",borderRadius:14,width:640,border:"1px solid #22c55e",textAlign:"left"}}>
          <h4 style={{color:"#4ade80",fontSize:22,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:"1px"}}>Modern Test Theory (Rasch)</h4>
          <p style={{color:"#bbf7d0",fontSize:24,lineHeight:1.6}}>Separates ability from difficulty. Provides the unit. Makes invariant measurement possible.</p>
        </div>
      </div>
    </div>),
  ];

  return(
    <div style={{minHeight:"100vh",background:"#0f172a",color:"#f8fafc",display:"flex",flexDirection:"column",fontFamily:"system-ui,-apple-system,sans-serif"}}>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 80px",overflow:"auto"}}>
        <div style={{width:"100%",maxWidth:2200}}>{slides[currentSlide]()}</div>
      </div>
      <div style={{position:"relative",padding:"16px 48px",background:"#020617",borderTop:"1px solid #1e293b"}}>
        <div style={{position:"absolute",left:0,top:0,height:3,background:"#f59e0b",width:`${((currentSlide)/(SLIDE_COUNT-1))*100}%`,transition:"width 0.5s ease",opacity:0.4}}/>
        <div style={{position:"absolute",left:`${((currentSlide)/(SLIDE_COUNT-1))*100}%`,top:-58,transition:"left 0.5s ease",fontSize:72,transform:"translateX(-50%)",filter:"drop-shadow(0 0 12px rgba(245,158,11,0.45))"}}>{"\uD83D\uDC30"}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <button onClick={()=>changeSlide(currentSlide-1)} style={{color:"#475569",background:"none",border:"none",fontSize:24,cursor:"pointer",padding:"14px 28px"}}>&larr; Previous</button>
        <div style={{display:"flex",gap:28,alignItems:"center"}}>
          <span style={{color:"#334155",fontSize:22}}>Slide {currentSlide+1} / {SLIDE_COUNT}</span>
          <button onClick={openPresenter} style={{color:"#475569",background:"none",border:"1px solid #1e293b",fontSize:20,cursor:"pointer",padding:"8px 24px",borderRadius:6}}>Presenter (P)</button>
          <span style={{color:"#1e293b",fontSize:18}}>&larr; &rarr; keys</span>
        </div>
        <button onClick={()=>changeSlide(currentSlide+1)} style={{color:"#475569",background:"none",border:"none",fontSize:24,cursor:"pointer",padding:"14px 28px"}}>Next &rarr;</button>
        </div>
      </div>
    </div>
  );
}
