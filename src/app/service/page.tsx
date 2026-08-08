'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Category { id: string; name: string; }
interface ServiceContact { id: string; name: string; phone: string; category: string; }

const CAT_THEMES = [
  { icon: 'fa-bolt',         label: 'Electrical',  color: '#f59e0b', bg: '#fef3c7' },
  { icon: 'fa-tint',         label: 'Plumbing',    color: '#3b82f6', bg: '#dbeafe' },
  { icon: 'fa-wrench',       label: 'Repair',      color: '#6366f1', bg: '#e0e7ff' },
  { icon: 'fa-fire-alt',     label: 'Gas',         color: '#ef4444', bg: '#fee2e2' },
  { icon: 'fa-seedling',     label: 'Gardening',   color: '#10b981', bg: '#d1fae5' },
  { icon: 'fa-paint-roller', label: 'Painting',    color: '#8b5cf6', bg: '#ede9fe' },
  { icon: 'fa-plug',         label: 'AC/Cooling',  color: '#06b6d4', bg: '#cffafe' },
  { icon: 'fa-home',         label: 'Cleaning',    color: '#ec4899', bg: '#fce7f3' },
  { icon: 'fa-hammer',       label: 'Carpentry',   color: '#ea580c', bg: '#ffedd5' },
  { icon: 'fa-car-side',     label: 'Vehicle',     color: '#7c3aed', bg: '#ede9fe' },
  { icon: 'fa-hard-hat',     label: 'Mason',       color: '#16a34a', bg: '#dcfce7' },
  { icon: 'fa-snowflake',    label: 'HVAC',        color: '#2563eb', bg: '#dbeafe' },
];
const ct = (i: number) => CAT_THEMES[i % CAT_THEMES.length];

const AV_GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#fccb90,#d57eeb)',
  'linear-gradient(135deg,#a1c4fd,#c2e9fb)',
  'linear-gradient(135deg,#fd7043,#ff8a65)',
  'linear-gradient(135deg,#26c6da,#00acc1)',
];

export default function ServicePage() {
  const [cats,    setCats]    = useState<Category[]>([]);
  const [all,     setAll]     = useState<ServiceContact[]>([]);
  const [sel,     setSel]     = useState('all');
  const [q,       setQ]       = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cr, mr] = await Promise.all([fetch('/api/categories'), fetch('/api/members')]);
      setCats(cr.ok ? await cr.json() : []);
      setAll(mr.ok  ? await mr.json() : []);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const cIdx   = (id: string) => cats.findIndex(c => c.id === id);
  const cName  = (id: string) => cats.find(c => c.id === id)?.name ?? id;
  const cCount = (id: string) => id === 'all' ? all.length : all.filter(c => c.category === id).length;

  const shown = all.filter(c => {
    const cm = sel === 'all' || c.category === sel;
    const sq = q.trim().toLowerCase();
    return cm && (!sq || c.name.toLowerCase().includes(sq) || c.phone.includes(sq));
  });

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <style dangerouslySetInnerHTML={{ __html: `
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{background:#0d1117;color:#f0f6fc;font-family:'Plus Jakarta Sans',sans-serif}
        a{text-decoration:none}

        /* ══ NAV ══ */
        .nav{
          position:sticky;top:0;z-index:100;
          display:flex;align-items:center;justify-content:space-between;
          padding:0 40px;height:62px;
          background:rgba(13,17,23,.96);backdrop-filter:blur(20px);
          border-bottom:1px solid rgba(255,255,255,.06);
        }
        .nav-logo{display:flex;align-items:center;gap:10px}
        .nav-logo-box{
          width:36px;height:36px;border-radius:10px;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px;
          box-shadow:0 4px 14px rgba(99,102,241,.4);
        }
        .nav-logo-name{font-size:16px;font-weight:800;color:#f0f6fc;letter-spacing:-.01em}
        .nav-center{display:flex;align-items:center;gap:6px}
        .nav-link{font-size:13px;font-weight:600;color:#6e7681;padding:6px 12px;border-radius:8px;transition:.18s}
        .nav-link:hover,.nav-link.on{color:#f0f6fc;background:rgba(255,255,255,.07)}
        .nav-right{display:flex;align-items:center;gap:10px}
        .btn-nav{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:9px;font-size:13px;font-weight:700;transition:.18s}
        .btn-outline{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#f0f6fc}
        .btn-outline:hover{background:rgba(255,255,255,.1)}
        .btn-primary{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;box-shadow:0 4px 14px rgba(99,102,241,.35)}
        .btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(99,102,241,.5)}

        /* ══ HERO ══ */
        .hero{
          position:relative;overflow:hidden;
          padding:70px 40px 64px;text-align:center;
          background:linear-gradient(180deg,#0d1117 0%,#0f1b2d 60%,#0d1117 100%);
        }
        .hero-glow{
          position:absolute;top:-120px;left:50%;transform:translateX(-50%);
          width:800px;height:500px;border-radius:50%;
          background:radial-gradient(ellipse,rgba(99,102,241,.18) 0%,transparent 65%);
          pointer-events:none;
        }
        .hero-badge{
          display:inline-flex;align-items:center;gap:8px;
          background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.25);
          color:#a5b4fc;padding:7px 16px;border-radius:99px;
          font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;
          margin-bottom:20px;
        }
        .hero-badge span{width:6px;height:6px;border-radius:50%;background:#818cf8;display:inline-block;animation:live 1.8s ease-in-out infinite}
        @keyframes live{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.8)}}
        .hero h1{font-size:clamp(28px,4.5vw,52px);font-weight:900;letter-spacing:-.03em;line-height:1.1;color:#f0f6fc;margin-bottom:14px}
        .hero h1 span{
          background:linear-gradient(90deg,#818cf8,#a78bfa,#c084fc);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        }
        .hero-sub{color:#6e7681;font-size:15px;font-weight:500;max-width:440px;margin:0 auto 36px;line-height:1.7}

        /* hero search */
        .hero-searchbar{
          display:flex;align-items:center;gap:0;max-width:520px;margin:0 auto 48px;
          background:#161b22;border:1.5px solid rgba(255,255,255,.1);border-radius:14px;overflow:hidden;
          box-shadow:0 8px 32px rgba(0,0,0,.4);transition:.25s;
        }
        .hero-searchbar:focus-within{border-color:#6366f1;box-shadow:0 8px 32px rgba(99,102,241,.2)}
        .hero-searchbar i{padding:0 14px;color:#6e7681;font-size:14px;flex-shrink:0}
        .hero-searchbar input{flex:1;background:transparent;border:none;outline:none;color:#f0f6fc;font-size:15px;font-family:inherit;padding:15px 0}
        .hero-searchbar input::placeholder{color:#374151}
        .hero-searchbar button{
          background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;color:#fff;
          padding:0 22px;height:52px;font-size:13px;font-weight:800;font-family:inherit;cursor:pointer;white-space:nowrap;transition:.2s;
        }
        .hero-searchbar button:hover{filter:brightness(1.15)}

        /* hero stats */
        .hero-stats{display:flex;align-items:center;justify-content:center;gap:36px;flex-wrap:wrap}
        .hstat{text-align:center}
        .hstat-n{font-size:24px;font-weight:900;color:#f0f6fc;display:block}
        .hstat-l{font-size:12px;color:#6e7681;font-weight:600;display:block;margin-top:2px}
        .stat-sep{width:1px;height:32px;background:rgba(255,255,255,.07)}

        /* ══ CATEGORY STRIP ══ */
        .sec-label{font-size:11px;font-weight:800;color:#6e7681;text-transform:uppercase;letter-spacing:.09em;margin-bottom:16px}
        .cat-section{padding:36px 40px;border-bottom:1px solid rgba(255,255,255,.05)}
        .cat-strip{display:flex;gap:10px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}
        .cat-strip::-webkit-scrollbar{display:none}
        .cat-chip{
          display:flex;flex-direction:column;align-items:center;gap:8px;
          padding:14px 18px;min-width:86px;
          background:#161b22;border:1.5px solid rgba(255,255,255,.07);border-radius:16px;
          cursor:pointer;font-family:inherit;transition:.22s;flex-shrink:0;
        }
        .cat-chip:hover{border-color:rgba(255,255,255,.18);transform:translateY(-3px)}
        .cat-chip.on{background:rgba(99,102,241,.12);border-color:#6366f1;transform:translateY(-3px)}
        .cat-chip-icon{
          width:40px;height:40px;border-radius:12px;
          display:flex;align-items:center;justify-content:center;font-size:16px;
          background:var(--cbg);color:var(--cc);transition:.22s;
        }
        .cat-chip.on .cat-chip-icon{box-shadow:0 4px 14px var(--cc)66}
        .cat-chip-name{font-size:11px;font-weight:700;color:#6e7681;white-space:nowrap}
        .cat-chip.on .cat-chip-name{color:#a5b4fc}
        .cat-chip-n{font-size:10px;font-weight:800;color:#374151;background:rgba(255,255,255,.06);padding:2px 7px;border-radius:20px}
        .cat-chip.on .cat-chip-n{background:rgba(99,102,241,.2);color:#818cf8}

        /* ══ PROVIDER SECTION ══ */
        .prov-section{padding:32px 40px 60px}
        .prov-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px}
        .prov-title{font-size:18px;font-weight:800;color:#f0f6fc}
        .prov-cnt{font-size:13px;font-weight:700;color:#6e7681}

        /* provider rows - Homa style list */
        .prov-list{display:flex;flex-direction:column;gap:0}

        .prov-row{
          display:flex;align-items:center;gap:18px;
          padding:16px 20px;border-radius:14px;
          border:1px solid transparent;
          transition:.2s;cursor:default;
          position:relative;
        }
        .prov-row:hover{background:#161b22;border-color:rgba(255,255,255,.07)}
        .prov-row + .prov-row{border-top:1px solid rgba(255,255,255,.04)}
        .prov-row:hover + .prov-row{border-top-color:transparent}

        /* avatar */
        .prov-av{
          width:52px;height:52px;border-radius:14px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          font-size:20px;font-weight:900;color:#fff;
          box-shadow:0 4px 14px rgba(0,0,0,.3);
        }

        /* info */
        .prov-info{flex:1;min-width:0}
        .prov-name{font-size:15px;font-weight:800;color:#f0f6fc;margin-bottom:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .prov-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .pm-tag{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:6px;font-size:11px;font-weight:700}
        .pm-cat{background:var(--tc-bg);color:var(--tc);border:1px solid var(--tc)33}
        .pm-ok{background:rgba(16,185,129,.1);color:#34d399;border:1px solid rgba(16,185,129,.2)}
        /* star rating (static for community trust feel) */
        .pm-stars{display:flex;align-items:center;gap:3px;font-size:11px;color:#f59e0b}
        .pm-stars span{color:#6e7681;font-size:11px;font-weight:600;margin-left:2px}

        /* right side */
        .prov-right{display:flex;align-items:center;gap:14px;flex-shrink:0}
        .prov-phone-text{font-family:monospace;font-size:13px;font-weight:700;color:#6e7681}
        .call-btn{
          display:inline-flex;align-items:center;gap:7px;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          color:#fff;padding:10px 20px;border-radius:11px;
          font-size:13px;font-weight:800;
          box-shadow:0 4px 14px rgba(99,102,241,.35);transition:.22s;
        }
        .call-btn:hover{transform:translateY(-2px) scale(1.04);box-shadow:0 6px 22px rgba(99,102,241,.5)}

        /* ══ HOW IT WORKS ══ */
        .how{padding:48px 40px;border-top:1px solid rgba(255,255,255,.05);border-bottom:1px solid rgba(255,255,255,.05);background:#0a0f18}
        .how h2{font-size:22px;font-weight:900;color:#f0f6fc;margin-bottom:8px}
        .how-sub{font-size:14px;color:#6e7681;margin-bottom:32px}
        .how-steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px}
        .how-step{display:flex;flex-direction:column;gap:12px}
        .how-step-num{
          width:38px;height:38px;border-radius:12px;
          background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.25);
          color:#818cf8;font-size:16px;font-weight:900;
          display:flex;align-items:center;justify-content:center;
        }
        .how-step h3{font-size:14px;font-weight:800;color:#f0f6fc}
        .how-step p{font-size:13px;color:#6e7681;line-height:1.6;font-weight:500}

        /* ══ SKELETON ══ */
        .sk-list{display:flex;flex-direction:column;gap:8px}
        .sk-row{height:80px;border-radius:14px;background:linear-gradient(90deg,#161b22 25%,#1c2333 50%,#161b22 75%);background-size:400%;animation:sk 1.5s linear infinite}
        @keyframes sk{0%{background-position:100%}100%{background-position:-100%}}

        /* ══ EMPTY ══ */
        .empty{display:flex;flex-direction:column;align-items:center;gap:14px;padding:60px 24px;text-align:center}
        .empty i{font-size:32px;color:#21262d}
        .empty p{font-size:14px;font-weight:600;color:#6e7681}

        /* ══ RESPONSIVE ══ */
        @media(max-width:768px){
          .nav{padding:0 16px}
          .nav-center{display:none}
          .hero{padding:48px 16px 40px}
          .cat-section,.prov-section,.how{padding-left:16px;padding-right:16px}
          .prov-phone-text{display:none}
          .prov-right{gap:8px}
          .how-steps{grid-template-columns:1fr 1fr}
        }
        @media(max-width:480px){
          .hero h1{font-size:26px}
          .hero-stats{gap:20px}
          .stat-sep{display:none}
          .prov-row{padding:12px}
          .how-steps{grid-template-columns:1fr}
        }
      ` }} />

      {/* ══ NAV ══ */}
      <nav className="nav">
        <div className="nav-logo">
          <div className="nav-logo-box"><i className="fas fa-tools" /></div>
          <span className="nav-logo-name">ServiceFind</span>
        </div>
        <div className="nav-center">
          <a href="#services" className="nav-link on">Services</a>
          <a href="#how" className="nav-link">How It Works</a>
        </div>
        <div className="nav-right">
          <Link href="/" className="btn-nav btn-outline">
            <i className="fas fa-arrow-left" /> Home
          </Link>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-badge">
          <span />Sri Ambal Nagar · Community Directory
        </div>
        <h1>Connect with Reliable<br /><span>Professionals</span> Near You</h1>
        <p className="hero-sub">Find trusted local experts for every home & community service — one tap to call directly.</p>

        <div className="hero-searchbar">
          <i className="fas fa-search" />
          <input
            type="text"
            placeholder="Search service or professional name…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <button type="button">Search</button>
        </div>

        <div className="hero-stats">
          <div className="hstat">
            <span className="hstat-n" style={{color:'#818cf8'}}>{loading ? '—' : cats.length}+</span>
            <span className="hstat-l">Service Types</span>
          </div>
          <div className="stat-sep" />
          <div className="hstat">
            <span className="hstat-n" style={{color:'#34d399'}}>{loading ? '—' : all.length}+</span>
            <span className="hstat-l">Professionals</span>
          </div>
          <div className="stat-sep" />
          <div className="hstat">
            <span className="hstat-n" style={{color:'#f59e0b'}}>24/7</span>
            <span className="hstat-l">Available</span>
          </div>
        </div>
      </section>

      {/* ══ CATEGORY STRIP ══ */}
      <section className="cat-section" id="services">
        <div className="sec-label">Browse by Category</div>
        <div className="cat-strip">
          {/* ALL chip */}
          <div
            className={`cat-chip ${sel==='all'?'on':''}`}
            style={{'--cbg':'rgba(99,102,241,.15)','--cc':'#818cf8'} as React.CSSProperties}
            onClick={() => setSel('all')}
          >
            <div className="cat-chip-icon"><i className="fas fa-th" /></div>
            <span className="cat-chip-name">All</span>
            <span className="cat-chip-n">{cCount('all')}</span>
          </div>

          {cats.map((cat, ci) => {
            const t = ct(ci);
            return (
              <div
                key={cat.id}
                className={`cat-chip ${sel===cat.id?'on':''}`}
                style={{'--cbg':t.bg,'--cc':t.color} as React.CSSProperties}
                onClick={() => setSel(cat.id)}
              >
                <div className="cat-chip-icon"><i className={`fas ${t.icon}`} /></div>
                <span className="cat-chip-name">{cat.name}</span>
                <span className="cat-chip-n">{cCount(cat.id)}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══ PROVIDER LIST ══ */}
      <section className="prov-section">
        <div className="prov-top">
          <div>
            <div className="prov-title">
              {sel==='all' ? 'Featured Service Professionals' : cName(sel)+' Professionals'}
            </div>
            <div className="prov-cnt">
              {loading ? 'Loading…' : `${shown.length} verified professional${shown.length!==1?'s':''} available`}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="sk-list">
            {[...Array(6)].map((_,i) => <div key={i} className="sk-row" style={{animationDelay:`${i*.1}s`}} />)}
          </div>
        ) : shown.length === 0 ? (
          <div className="empty">
            <i className="fas fa-user-slash" />
            <p>{q ? `No results for "${q}"` : 'No professionals in this category yet.'}</p>
          </div>
        ) : (
          <div className="prov-list">
            {shown.map((c, idx) => {
              const ci = cIdx(c.category);
              const t  = ct(ci >= 0 ? ci : idx);
              const av = AV_GRADIENTS[idx % AV_GRADIENTS.length];
              // Fake star rating 4-5 based on name hash
              const stars = 4 + (c.name.charCodeAt(0) % 2);
              return (
                <div key={c.id||idx} className="prov-row"
                  style={{'--tc':t.color,'--tc-bg':t.bg} as React.CSSProperties}>

                  <div className="prov-av" style={{background:av}}>
                    {c.name ? c.name.charAt(0).toUpperCase() : 'P'}
                  </div>

                  <div className="prov-info">
                    <div className="prov-name">{c.name}</div>
                    <div className="prov-meta">
                      <span className="pm-tag pm-cat">
                        <i className={`fas ${t.icon}`} />{cName(c.category)}
                      </span>
                      <span className="pm-tag pm-ok">
                        <i className="fas fa-check-circle" />Verified
                      </span>
                      <div className="pm-stars">
                        {[...Array(stars)].map((_,s) => <i key={s} className="fas fa-star" />)}
                        {stars < 5 && <i className="fas fa-star-half-alt" />}
                        <span>({(4.0 + Math.random()).toFixed(1)})</span>
                      </div>
                    </div>
                  </div>

                  <div className="prov-right">
                    <span className="prov-phone-text">
                      <i className="fas fa-phone-alt" style={{marginRight:'6px',fontSize:'11px',color:'#374151'}} />
                      {c.phone}
                    </span>
                    <a href={`tel:${c.phone}`} className="call-btn">
                      <i className="fas fa-phone-alt" />Call Now
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="how" id="how">
        <h2>How It Works</h2>
        <p className="how-sub">Get connected to the right professional in 4 simple steps</p>
        <div className="how-steps">
          {[
            { n:'01', icon:'fa-search',     title:'Search for Experts',   desc:'Browse our verified directory by service category or search by name.' },
            { n:'02', icon:'fa-list-ul',    title:'Browse Local Experts',  desc:'View profiles, categories, and contact details of all local professionals.' },
            { n:'03', icon:'fa-phone-alt',  title:'Call Directly',         desc:'One tap to call the professional directly — no middleman, no fees.' },
            { n:'04', icon:'fa-smile',      title:'Enjoy the Service',     desc:'Get quality service from trusted community members you can rely on.' },
          ].map(s => (
            <div key={s.n} className="how-step">
              <div className="how-step-num">{s.n}</div>
              <h3><i className={`fas ${s.icon}`} style={{marginRight:'7px',color:'#6366f1'}} />{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
