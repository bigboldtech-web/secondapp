import { useState, useEffect } from "react";

const A = "#E8553D";

const CATS = [
  { id: null, name: "All", d: "M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" },
  { id: "phones", name: "Phones", d: "M15.5 1h-8A2.5 2.5 0 005 3.5v17A2.5 2.5 0 007.5 23h8a2.5 2.5 0 002.5-2.5v-17A2.5 2.5 0 0015.5 1zm-4 21a1 1 0 110-2 1 1 0 010 2zm4.5-4H7V4h9v14z" },
  { id: "laptops", name: "Laptops", d: "M20 18l2 2H2l2-2V4a2 2 0 012-2h12a2 2 0 012 2v14zM6 4v12h12V4H6z" },
  { id: "tablets", name: "Tablets", d: "M19 1H5a2 2 0 00-2 2v18a2 2 0 002 2h14a2 2 0 002-2V3a2 2 0 00-2-2zm-7 20a1 1 0 110-2 1 1 0 010 2zm7-4H5V4h14v13z" },
  { id: "cars", name: "Cars", d: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8a1 1 0 001 1h1a1 1 0 001-1v-1h12v1a1 1 0 001 1h1a1 1 0 001-1v-8l-2.08-5.99zM6.5 16a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm11 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM5 11l1.5-4.5h11L19 11H5z" },
  { id: "bikes", name: "Bikes", d: "M19 13a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4zM5 13a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4zM16 6l-3 5h3l1-2h2l-1.5-3H16zm-5 5l2-3.5L11.5 5H8l3 6z" },
  { id: "macbooks", name: "MacBooks", d: "M20 18l2 2H2l2-2V4a2 2 0 012-2h12a2 2 0 012 2v14zM6 4v12h12V4H6z" },
  { id: "gaming", name: "Gaming", d: "M21 6H3a2 2 0 00-2 2v8a2 2 0 002 2h18a2 2 0 002-2V8a2 2 0 00-2-2zm-10 7H9v2H7v-2H5v-2h2V9h2v2h2v2zm4.5 2a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4-3a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" },
  { id: "accessories", name: "More", d: "M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" },
];

const CITIES = ["All India","Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Pune","Kolkata"];

const ITEMS = [
  { id:1, t:"iPhone 15 Pro Max 256GB", p:"₹89,999", c:"Like New", v:"PhoneHub", loc:"Mumbai", ago:"2h", cat:"phones", s:["256GB","Titanium"] },
  { id:2, t:"MacBook Air M2 2023", p:"₹72,999", c:"Excellent", v:"LaptopWorld", loc:"Delhi", ago:"5h", cat:"macbooks", s:["512GB"] },
  { id:3, t:"Samsung Galaxy S24 Ultra", p:"₹62,500", c:"Good", v:"GadgetKing", loc:"Bangalore", ago:"1h", cat:"phones", s:["256GB"] },
  { id:4, t:"iPad Pro 12.9\" M2", p:"₹68,000", c:"Like New", v:"TabZone", loc:"Pune", ago:"3h", cat:"tablets", s:["256GB"] },
  { id:5, t:"Honda City 2022 V CVT", p:"₹11,50,000", c:"Excellent", v:"AutoMart", loc:"Hyderabad", ago:"6h", cat:"cars", s:["Petrol"] },
  { id:6, t:"Royal Enfield Classic 350", p:"₹1,45,000", c:"Good", v:"BikeZone", loc:"Chennai", ago:"4h", cat:"bikes", s:["349cc"] },
  { id:7, t:"OnePlus 12 5G", p:"₹42,999", c:"Excellent", v:"PhoneHub", loc:"Mumbai", ago:"30m", cat:"phones", s:["256GB"] },
  { id:8, t:"Dell XPS 15 9530", p:"₹85,000", c:"Like New", v:"LaptopWorld", loc:"Delhi", ago:"7h", cat:"laptops", s:["1TB SSD"] },
  { id:9, t:"iPhone 14 128GB", p:"₹38,999", c:"Good", v:"MobiDeals", loc:"Kolkata", ago:"1d", cat:"phones", s:["128GB"] },
  { id:10, t:"Hyundai Creta 2023 SX", p:"₹14,20,000", c:"Like New", v:"CarBazaar", loc:"Mumbai", ago:"8h", cat:"cars", s:["Diesel"] },
  { id:11, t:"PS5 Slim Digital", p:"₹32,999", c:"Like New", v:"GameStop", loc:"Bangalore", ago:"2h", cat:"gaming", s:["1TB"] },
  { id:12, t:"AirPods Pro 2", p:"₹14,999", c:"Excellent", v:"PhoneHub", loc:"Mumbai", ago:"5h", cat:"accessories", s:["USB-C"] },
  { id:13, t:"ThinkPad X1 Carbon", p:"₹78,500", c:"Excellent", v:"CorpTech", loc:"Delhi", ago:"12h", cat:"laptops", s:["512GB"] },
  { id:14, t:"Yamaha MT-15 V2", p:"₹1,28,000", c:"Good", v:"BikeZone", loc:"Pune", ago:"9h", cat:"bikes", s:["155cc"] },
  { id:15, t:"iPhone 13 Mini 128GB", p:"₹28,500", c:"Good", v:"QuickSell", loc:"Kolkata", ago:"1d", cat:"phones", s:["128GB"] },
  { id:16, t:"Galaxy Tab S9 FE", p:"₹27,999", c:"Like New", v:"TabZone", loc:"Delhi", ago:"3h", cat:"tablets", s:["128GB"] },
  { id:17, t:"Maruti Swift 2022 ZXi", p:"₹7,20,000", c:"Excellent", v:"AutoMart", loc:"Pune", ago:"5h", cat:"cars", s:["Petrol"] },
  { id:18, t:"MacBook Pro 14\" M3", p:"₹1,45,000", c:"Like New", v:"LaptopWorld", loc:"Bangalore", ago:"1h", cat:"macbooks", s:["512GB"] },
];

const CB = { "Like New":"#166534", "Excellent":"#1e40af", "Good":"#92400e" };
const CBG = { "Like New":"#f0fdf4", "Excellent":"#eff6ff", "Good":"#fffbeb" };

function Card({ p, compact }) {
  const [saved, setSaved] = useState(false);
  const icon = CATS.find(c => c.id === p.cat)?.d || CATS[1].d;
  return (
    <div style={{ background:"#fff", borderRadius:compact?8:10, overflow:"hidden", border:"1px solid #eee", cursor:"pointer", transition:"box-shadow .2s,transform .15s" }}
      onMouseEnter={e=>{if(!compact){e.currentTarget.style.boxShadow="0 2px 16px rgba(0,0,0,.06)";e.currentTarget.style.transform="translateY(-1px)"}}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none"}}>
      <div style={{ aspectRatio:compact?"1/1":"4/3", background:"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
        <svg width={compact?24:32} height={compact?24:32} viewBox="0 0 24 24" fill="#ccc"><path d={icon}/></svg>
        <span style={{ position:"absolute", bottom:compact?4:8, left:compact?4:8, background:CBG[p.c], color:CB[p.c], fontSize:compact?9:10, fontWeight:600, padding:compact?"1px 4px":"2px 6px", borderRadius:3 }}>{p.c}</span>
        <button onClick={e=>{e.stopPropagation();setSaved(!saved)}}
          style={{ position:"absolute", top:compact?4:8, right:compact?4:8, width:compact?24:28, height:compact?24:28, borderRadius:"50%", border:"none", background:"rgba(255,255,255,.85)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width={compact?11:13} height={compact?11:13} viewBox="0 0 24 24" fill={saved?A:"none"} stroke={saved?A:"#999"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </button>
      </div>
      <div style={{ padding:compact?"6px 8px 8px":"10px 12px 12px" }}>
        <p style={{ fontSize:compact?13:15, fontWeight:700, color:"#111", marginBottom:compact?1:3 }}>{p.p}</p>
        <p style={{ fontSize:compact?11:13, fontWeight:500, color:"#444", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", lineHeight:1.3, marginBottom:compact?3:6 }}>{p.t}</p>
        {!compact && <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:6 }}>{p.s.map(s=><span key={s} style={{ fontSize:10, color:"#888", background:"#f5f5f5", padding:"2px 5px", borderRadius:3 }}>{s}</span>)}</div>}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:compact?10:11, color:"#aaa" }}>
          <span>{p.loc}</span><span>{p.ago}</span>
        </div>
      </div>
    </div>
  );
}

function BottomNav({ tab, setTab }) {
  const items = [
    { id:"home", label:"Home", d:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" },
    { id:"search", label:"Explore", d:"M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" },
    { id:"sell", label:"Sell", d:"M12 5v14M5 12h14" },
    { id:"inbox", label:"Inbox", d:"M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
    { id:"me", label:"Me", d:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  ];
  return (
    <nav style={{ position:"fixed", bottom:0, left:0, right:0, background:"#fff", borderTop:"1px solid #eee", display:"flex", zIndex:200, paddingBottom:"env(safe-area-inset-bottom)" }}>
      {items.map(it=>(
        <button key={it.id} onClick={()=>setTab(it.id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"8px 0 6px", border:"none", background:"none", cursor:"pointer", fontFamily:"inherit" }}>
          {it.id==="sell"?(
            <div style={{ width:40, height:40, borderRadius:"50%", background:A, display:"flex", alignItems:"center", justifyContent:"center", marginTop:-16, boxShadow:`0 2px 8px ${A}40` }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d={it.d}/></svg>
            </div>
          ):(
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tab===it.id?A:"#999"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={it.d}/></svg>
          )}
          <span style={{ fontSize:10, fontWeight:tab===it.id?600:400, color:it.id==="sell"?A:tab===it.id?A:"#999" }}>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default function App() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("All India");
  const [cat, setCat] = useState(null);
  const [cOpen, setCOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [tab, setTab] = useState("home");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const ck=()=>setIsMobile(window.innerWidth<640);ck();
    window.addEventListener("resize",ck);
    const h=()=>setScrolled(window.scrollY>5);
    window.addEventListener("scroll",h);
    return()=>{window.removeEventListener("resize",ck);window.removeEventListener("scroll",h)};
  }, []);

  const list = ITEMS.filter(p=>(!cat||p.cat===cat)&&(!q||p.t.toLowerCase().includes(q.toLowerCase()))&&(city==="All India"||p.loc===city));

  return (
    <div style={{ fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif", background:"#fafafa", minHeight:"100vh", color:"#222" }}>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}::placeholder{color:#bbb}input:focus{outline:none}
        @keyframes fi{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
        .g{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
        @media(max-width:639px){.g{grid-template-columns:repeat(2,1fr);gap:8px}.desk{display:none!important}}
        @media(min-width:640px){.mob{display:none!important}}
        .cats{display:flex;gap:2px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding:0 0 6px}.cats::-webkit-scrollbar{display:none}
        .cp{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 10px;cursor:pointer;border-radius:8px;border:1.5px solid transparent;background:none;font-family:inherit;transition:all .1s;min-width:52px;flex-shrink:0}
        .cp:hover{background:#f3f3f3}.cp.on{background:#fdf4f3;border-color:#f0d0ca}.cp.on .cl{color:${A};font-weight:600}
        .cl{font-size:10px;color:#999;white-space:nowrap;font-weight:500}
        .ci{width:28px;height:28px;border-radius:6px;background:#f0f0f0;display:flex;align-items:center;justify-content:center}.cp.on .ci{background:#fdf4f3}
        .dd{position:absolute;top:calc(100% + 4px);left:0;background:#fff;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,.08);border:1px solid #eee;overflow:hidden;z-index:50;min-width:160px}
        .di{padding:8px 14px;font-size:13px;cursor:pointer;color:#555;font-family:inherit}.di:hover{background:#fafafa}.di.se{color:${A};font-weight:600;background:#fdf4f3}
      `}</style>

      <header style={{ position:"sticky", top:0, zIndex:100, background:scrolled?"rgba(255,255,255,.97)":"#fff", borderBottom:"1px solid #eee", backdropFilter:"blur(8px)", boxShadow:scrolled?"0 1px 4px rgba(0,0,0,.02)":"none" }}>
        <div style={{ maxWidth:1140, margin:"0 auto", padding:"0 12px" }}>
          {/* Desktop */}
          <div className="desk" style={{ display:"flex", alignItems:"center", gap:10, height:52 }}>
            <span style={{ fontSize:18, fontWeight:800, letterSpacing:"-.03em", color:"#222", flexShrink:0 }}>Second <span style={{ color:A }}>App</span></span>
            <div style={{ width:1, height:20, background:"#eee", flexShrink:0 }}/>
            <div style={{ position:"relative", flexShrink:0 }}>
              <button onClick={()=>setCOpen(!cOpen)} style={{ display:"flex", alignItems:"center", gap:3, padding:"5px 8px", borderRadius:6, border:"1px solid #eee", background:"#fff", cursor:"pointer", fontSize:12, fontWeight:500, color:"#555", fontFamily:"inherit" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {city}<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {cOpen&&<div className="dd">{CITIES.map(c=><div key={c} className={`di ${c===city?"se":""}`} onClick={()=>{setCity(c);setCOpen(false)}}>{c}</div>)}</div>}
            </div>
            <div style={{ flex:1, maxWidth:480 }}>
              <div style={{ display:"flex", alignItems:"center", background:"#f5f5f5", borderRadius:8, padding:"0 8px", border:"1.5px solid transparent", transition:"all .12s" }}
                onFocus={e=>{e.currentTarget.style.borderColor="#ddd";e.currentTarget.style.background="#fff"}}
                onBlur={e=>{e.currentTarget.style.borderColor="transparent";e.currentTarget.style.background="#f5f5f5"}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input type="text" placeholder="Search for anything..." value={q} onChange={e=>setQ(e.target.value)} style={{ flex:1, border:"none", background:"transparent", padding:"8px 6px", fontSize:13, fontFamily:"inherit", color:"#222" }}/>
                {q&&<button onClick={()=>setQ("")} style={{ border:"none", background:"none", cursor:"pointer", color:"#ccc", display:"flex", padding:2 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button>}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
              <button style={{ padding:"6px 12px", borderRadius:6, border:"1px solid #eee", background:"#fff", fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"inherit", color:"#555" }}>Log in</button>
              <button style={{ padding:"6px 14px", borderRadius:6, border:"none", background:A, color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>+ Sell</button>
            </div>
          </div>
          {/* Mobile */}
          <div className="mob" style={{ display:"flex", alignItems:"center", gap:8, height:48, padding:"0 4px" }}>
            <span style={{ fontSize:16, fontWeight:800, letterSpacing:"-.03em", flexShrink:0 }}>Second <span style={{ color:A }}>App</span></span>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", background:"#f0f0f0", borderRadius:20, padding:"0 10px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input type="text" placeholder="Search..." value={q} onChange={e=>setQ(e.target.value)} style={{ flex:1, border:"none", background:"transparent", padding:"7px 6px", fontSize:13, fontFamily:"inherit", color:"#222" }}/>
              </div>
            </div>
            <div style={{ position:"relative", flexShrink:0 }}>
              <button onClick={()=>setCOpen(!cOpen)} style={{ display:"flex", alignItems:"center", gap:2, padding:"4px 6px", border:"none", background:"none", cursor:"pointer", fontSize:11, color:"#777", fontFamily:"inherit" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {city==="All India"?"India":city}
              </button>
              {cOpen&&<div className="dd" style={{ right:0, left:"auto" }}>{CITIES.map(c=><div key={c} className={`di ${c===city?"se":""}`} onClick={()=>{setCity(c);setCOpen(false)}}>{c}</div>)}</div>}
            </div>
          </div>
          <div className="cats">{CATS.map(c=>(
            <button key={c.name} className={`cp ${cat===c.id?"on":""}`} onClick={()=>setCat(c.id)}>
              <div className="ci"><svg width="12" height="12" viewBox="0 0 24 24" fill={cat===c.id?A:"#bbb"}><path d={c.d}/></svg></div>
              <span className="cl">{c.name}</span>
            </button>
          ))}</div>
        </div>
      </header>

      <main style={{ maxWidth:1140, margin:"0 auto", padding:isMobile?"10px 8px 80px":"14px 12px 48px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10, padding:"0 4px" }}>
          <h2 style={{ fontSize:isMobile?14:15, fontWeight:700, color:"#222" }}>
            {cat?CATS.find(c=>c.id===cat)?.name:"Fresh listings"}
            {city!=="All India"&&<span style={{ fontWeight:400, color:"#bbb" }}> in {city}</span>}
          </h2>
          <span style={{ fontSize:11, color:"#bbb" }}>{list.length} items</span>
        </div>
        {list.length>0?(
          <div className="g">{list.map((p,i)=>(<div key={p.id} style={{ animation:`fi .2s ease ${Math.min(i*.02,.25)}s both` }}><Card p={p} compact={isMobile}/></div>))}</div>
        ):(
          <div style={{ textAlign:"center", padding:"40px 16px", color:"#bbb" }}>
            <p style={{ fontSize:14, fontWeight:600, color:"#888", marginBottom:4 }}>No results found</p>
            <p style={{ fontSize:12, marginBottom:10 }}>Try a different search or filter</p>
            <button onClick={()=>{setQ("");setCat(null);setCity("All India")}} style={{ padding:"6px 16px", borderRadius:6, border:"none", background:"#222", color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Clear filters</button>
          </div>
        )}
        {!q&&(
          <div style={{ marginTop:24, background:"#fff", border:"1px solid #eee", borderRadius:isMobile?8:10, padding:isMobile?"12px 14px":"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:"#222", marginBottom:2 }}>Can't find what you need?</p>
              <p style={{ fontSize:11, color:"#aaa" }}>Get notified when new items match your search.</p>
            </div>
            <button style={{ padding:"7px 14px", borderRadius:6, border:"1px solid #eee", background:"#fff", color:"#555", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Set alert</button>
          </div>
        )}
      </main>

      <footer className="desk" style={{ borderTop:"1px solid #eee", padding:"20px 16px", background:"#fff" }}>
        <div style={{ maxWidth:1140, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:10, color:"#ccc" }}>&copy; 2026 Second App</span>
          <div style={{ display:"flex", gap:16 }}>{["About","Help","Terms","Privacy"].map(l=><a key={l} href="#" style={{ fontSize:11, color:"#bbb", textDecoration:"none" }}>{l}</a>)}</div>
        </div>
      </footer>

      {isMobile&&<BottomNav tab={tab} setTab={setTab}/>}
      {cOpen&&<div style={{ position:"fixed", inset:0, zIndex:40 }} onClick={()=>setCOpen(false)}/>}
    </div>
  );
}
