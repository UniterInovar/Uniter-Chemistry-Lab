import React, { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls, Stars } from '@react-three/drei';
import { Activity, Atom, Award, BookOpen, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, Compass, FlaskConical, GraduationCap, HelpCircle, Home, Info, Layers3, Maximize2, Menu, Pause, Play, RotateCcw, Search, Settings2, Sparkles, Target, X } from 'lucide-react';
import * as THREE from 'three';

const CATEGORIES = ['All topics', 'Atomic Structure', 'Chemical Bonding', 'Molecular Shapes', 'States of Matter', 'Chemical Reactions', 'Acids, Bases and Salts', 'Electrochemistry', 'Reaction Rates', 'Chemical Equilibrium', 'Gas Laws', 'Organic Chemistry', 'Periodic Table'];
const library = [
  { title: 'Molecular Geometry Explorer', category: 'Molecular Shapes', description: 'Build molecules and discover how electron regions shape three-dimensional structures.', level: 'Core', time: '12 min', symbol: 'VSEPR', color: 'mint', functional: true },
  { title: 'Atomic Structure', category: 'Atomic Structure', description: 'Explore proton, neutron and electron arrangements in the atom.', level: 'Core', time: '8 min', symbol: 'p⁺', color: 'blue' },
  { title: 'Bonding & Polarity', category: 'Chemical Bonding', description: 'Compare ionic, covalent and polar bonds with electron-pair diagrams.', level: 'Core', time: '10 min', symbol: 'δ±', color: 'violet' },
  { title: 'States of Matter', category: 'States of Matter', description: 'Connect particle motion and spacing to the properties of solids, liquids and gases.', level: 'Core', time: '9 min', symbol: 'H₂O', color: 'cyan' },
  { title: 'Reaction Rates', category: 'Reaction Rates', description: 'Investigate how concentration, temperature and surface area affect collisions.', level: 'Extension', time: '14 min', symbol: '→', color: 'amber' },
  { title: 'Acids, Bases & pH', category: 'Acids, Bases and Salts', description: 'Explore the pH scale and neutralisation using an interactive indicator.', level: 'Core', time: '11 min', symbol: 'pH', color: 'rose' },
  { title: 'Gas Laws', category: 'Gas Laws', description: 'Relate pressure, volume and temperature using particle-level models.', level: 'Extension', time: '12 min', symbol: 'PV', color: 'blue' },
  { title: 'Electrolysis Cell', category: 'Electrochemistry', description: 'Trace ion movement and electrode reactions in an electrolytic cell.', level: 'Extension', time: '15 min', symbol: 'e⁻', color: 'violet' },
  { title: 'Periodic Table Explorer', category: 'Periodic Table', description: 'Reveal patterns in atomic radius, reactivity and electron configuration.', level: 'Core', time: '10 min', symbol: 'Ne', color: 'mint' },
  { title: 'Chemical Equilibrium', category: 'Chemical Equilibrium', description: 'Observe how a dynamic system responds to changes in conditions.', level: 'Extension', time: '13 min', symbol: '⇌', color: 'cyan' },
  { title: 'Organic Molecule Builder', category: 'Organic Chemistry', description: 'Connect carbon atoms and functional groups to form simple molecules.', level: 'Core', time: '12 min', symbol: 'CH₃', color: 'amber' },
  { title: 'Reaction Equation Lab', category: 'Chemical Reactions', description: 'Balance atom counts and see how conservation of mass is represented.', level: 'Core', time: '9 min', symbol: '⚗', color: 'rose' },
];

const norm = (v) => new THREE.Vector3(...v).normalize().toArray();
const tetra = [[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(norm);
const trig = [0, 120, 240].map(a => norm([Math.cos(a * Math.PI / 180), Math.sin(a * Math.PI / 180), 0]));
const tbp = [norm([0,0,1]), norm([0,0,-1]), ...[0,120,240].map(a => norm([Math.cos(a * Math.PI / 180), Math.sin(a * Math.PI / 180),0]))];
const oct = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
const shapes = {
  '2,0': { electron: 'Linear', molecular: 'Linear', angle: '180°', positions: [norm([1,0,0]), norm([-1,0,0])], lonePositions: [] },
  '3,0': { electron: 'Trigonal planar', molecular: 'Trigonal planar', angle: '120°', positions: trig, lonePositions: [] },
  '2,1': { electron: 'Trigonal planar', molecular: 'Bent', angle: '≈120°*', positions: [trig[0], trig[1]], lonePositions: [trig[2]] },
  '4,0': { electron: 'Tetrahedral', molecular: 'Tetrahedral', angle: '109.5°', positions: tetra, lonePositions: [] },
  '3,1': { electron: 'Tetrahedral', molecular: 'Trigonal pyramidal', angle: '≈107°', positions: tetra.slice(0,3), lonePositions: [tetra[3]] },
  '2,2': { electron: 'Tetrahedral', molecular: 'Bent', angle: '≈104.5°', positions: tetra.slice(0,2), lonePositions: tetra.slice(2) },
  '5,0': { electron: 'Trigonal bipyramidal', molecular: 'Trigonal bipyramidal', angle: '90°, 120°, 180°', positions: tbp, lonePositions: [] },
  '4,1': { electron: 'Trigonal bipyramidal', molecular: 'Seesaw', angle: '<90°, <120°, 180°', positions: [tbp[0],tbp[1],tbp[2],tbp[3]], lonePositions: [tbp[4]] },
  '3,2': { electron: 'Trigonal bipyramidal', molecular: 'T-shaped', angle: '≈90°, 180°', positions: [tbp[0],tbp[1],tbp[2]], lonePositions: [tbp[3],tbp[4]] },
  '2,3': { electron: 'Trigonal bipyramidal', molecular: 'Linear', angle: '180°', positions: [tbp[0],tbp[1]], lonePositions: [tbp[2],tbp[3],tbp[4]] },
  '6,0': { electron: 'Octahedral', molecular: 'Octahedral', angle: '90°, 180°', positions: oct, lonePositions: [] },
  '5,1': { electron: 'Octahedral', molecular: 'Square pyramidal', angle: '≈90°, 180°', positions: oct.slice(0,5), lonePositions: [oct[5]] },
  '4,2': { electron: 'Octahedral', molecular: 'Square planar', angle: '90°, 180°', positions: oct.slice(0,4), lonePositions: [oct[4],oct[5]] },
};
const molecule = (formula, central, ligands, lone, angle, polarity, note, bondOrder = 1) => {
  const model = shapes[`${ligands.length},${lone}`];
  return { ...model, formula, central, ligands, lone, angle, polarity, note, bondOrder };
};
const molecules = [
  molecule('BeCl₂','Be',['Cl','Cl'],0,'180°','Non-polar','Two bonding regions repel into opposite directions, producing a linear molecule.'),
  molecule('CO₂','C',['O','O'],0,'180°','Non-polar','Each C=O double bond counts as one electron region. The equal bond dipoles cancel.',2),
  molecule('BF₃','B',['F','F','F'],0,'120°','Non-polar','Three bonding regions spread evenly in one plane; the symmetric bond dipoles cancel.'),
  molecule('SO₂','S',['O','O'],1,'≈119°','Polar','A lone pair occupies one trigonal-planar region and pushes the two S–O bonding regions closer together.',2),
  molecule('CH₄','C',['H','H','H','H'],0,'109.5°','Non-polar','Four bonding regions point toward the corners of a tetrahedron; the symmetric bond dipoles cancel.'),
  molecule('NH₃','N',['H','H','H'],1,'≈107°','Polar','One lone pair compresses the H–N–H angles from the ideal tetrahedral angle.'),
  molecule('H₂O','O',['H','H'],2,'≈104.5°','Polar','Two lone pairs repel more strongly than bonding pairs and compress the H–O–H angle.'),
  molecule('PCl₅','P',['Cl','Cl','Cl','Cl','Cl'],0,'90°, 120°, 180°','Non-polar','Three equatorial bonds and two axial bonds form a trigonal-bipyramidal arrangement.'),
  molecule('SF₄','S',['F','F','F','F'],1,'<90°, <120°, 180°','Polar','The lone pair prefers an equatorial region, where it has fewer 90° interactions; the shape is seesaw.'),
  molecule('ClF₃','Cl',['F','F','F'],2,'≈90°, 180°','Polar','Two equatorial lone pairs leave three bonded atoms in a T-shaped arrangement.'),
  molecule('XeF₂','Xe',['F','F'],3,'180°','Non-polar','Three equatorial lone pairs leave two axial bonds opposite one another.'),
  molecule('SF₆','S',['F','F','F','F','F','F'],0,'90°, 180°','Non-polar','Six bonding regions occupy the vertices of an octahedron.'),
];
const quizQuestions = [
  { q: 'What is the molecular geometry of NH₃?', options: ['Trigonal planar','Trigonal pyramidal','Tetrahedral','Bent'], answer: 1, explain: 'NH₃ has four electron regions (three bonding pairs and one lone pair), giving a tetrahedral electron geometry and trigonal-pyramidal molecular shape.' },
  { q: 'How many lone pairs are on the central atom in H₂O?', options: ['0','1','2','3'], answer: 2, explain: 'Oxygen has two O–H bonding regions and two lone-pair regions.' },
  { q: 'Which molecule has a linear shape and a 180° bond angle?', options: ['BF₃','CH₄','CO₂','NH₃'], answer: 2, explain: 'CO₂ has two electron regions around carbon. They arrange 180° apart.' },
  { q: 'What is the electron-pair geometry of SF₄?', options: ['Tetrahedral','Trigonal bipyramidal','Octahedral','Seesaw'], answer: 1, explain: 'Four bonding regions plus one lone pair make five electron regions: trigonal bipyramidal.' },
  { q: 'Why is H₂O bent rather than linear?', options: ['Oxygen is too large','Two lone pairs repel bonding regions','Hydrogen has lone pairs','It has a double bond'], answer: 1, explain: 'The two lone pairs occupy electron regions and repel the O–H bonding pairs, producing a bent shape.' },
  { q: 'What is the molecular shape of XeF₂?', options: ['Bent','T-shaped','Linear','Seesaw'], answer: 2, explain: 'XeF₂ has five electron regions. Three lone pairs occupy equatorial positions, leaving two axial bonds 180° apart.' },
];
const readSaved = (key, fallback) => { try { const val = localStorage.getItem(key); return val ? JSON.parse(val) : fallback; } catch { return fallback; } };
const VALENCE_ELECTRONS = { H:1, He:2, Be:2, B:3, C:4, N:5, O:6, F:7, Ne:8, Al:3, Si:4, P:5, S:6, Cl:7, Ar:8, Ga:3, Ge:4, As:5, Se:6, Br:7, Kr:8, In:3, Sn:4, Sb:5, Te:6, I:7, Xe:8, Tl:3, Pb:4, Bi:5, Po:6, At:7, Rn:8 };
const SHELL_OPTIONS = { H:[2], He:[2], Be:[4,8], B:[6,8], Al:[6,8,10,12,14], C:[8], N:[8], O:[8], F:[8], Ne:[8], Si:[8,10,12,14], P:[8,10,12,14], S:[8,10,12,14], Cl:[8,10,12,14], Ar:[8,10,12,14], Ga:[8,10,12,14], Ge:[8,10,12,14], As:[8,10,12,14], Se:[8,10,12,14], Br:[8,10,12,14], Kr:[8,10,12,14], In:[8,10,12,14], Sn:[8,10,12,14], Sb:[8,10,12,14], Te:[8,10,12,14], I:[8,10,12,14], Xe:[8,10,12,14], Tl:[8,10,12,14], Pb:[8,10,12,14], Bi:[8,10,12,14], Po:[8,10,12,14], At:[8,10,12,14], Rn:[8,10,12,14] };
function solveLewisStructure(atoms, bonds, charge = 0) {
  if (!atoms.length || atoms.some(atom => VALENCE_ELECTRONS[atom.element] === undefined)) return null;
  if (atoms.length > 16 || bonds.length > 20) return null;
  const atomIndex = new Map(atoms.map((atom,index)=>[atom.id,index]));
  const edges = bonds.map(bond=>({a:atomIndex.get(bond.a),b:atomIndex.get(bond.b)}));
  if (edges.some(edge=>edge.a===undefined||edge.b===undefined||edge.a===edge.b)) return null;
  const totalElectrons=atoms.reduce((sum,atom)=>sum+VALENCE_ELECTRONS[atom.element],0)-charge;
  if (totalElectrons<0 || totalElectrons%2!==0) return null;
  const incident=atoms.map(()=>[]);
  edges.forEach((edge,index)=>{incident[edge.a].push(index);incident[edge.b].push(index);});
  const maxBondOrder=atoms.map((atom,index)=>Math.floor(Math.max(...(SHELL_OPTIONS[atom.element]||[8]))/2));
  const orderSums=atoms.map(()=>0);
  const orders=edges.map(()=>1);
  let best=null, visited=0;
  const budget=400000;
  const resolveAtoms=()=>{
    let states=new Map([[0,{cost:0,choices:[]}]]);
    for(let i=0;i<atoms.length;i++){
      const atom=atoms[i], valence=VALENCE_ELECTRONS[atom.element], bondSum=orderSums[i];
      const options=(SHELL_OPTIONS[atom.element]||[8]).flatMap(shell=>{
        const remaining=shell-2*bondSum;
        if(remaining<0||remaining%2!==0)return [];
        const lonePairs=remaining/2;
        const formalCharge=valence-bondSum-2*lonePairs;
        const cost=5.5*Math.abs(formalCharge)+3.5*formalCharge*formalCharge+Math.max(0,shell-8)*.35+Math.max(0,8-shell)*.15;
        return [{lonePairs,formalCharge,shellElectrons:shell,cost}];
      });
      if(!options.length)return;
      const next=new Map();
      for(const [sum,state] of states) for(const option of options){
        const nextSum=sum+option.formalCharge;
        if(Math.abs(nextSum-charge)>atoms.length*3)continue;
        const candidate={cost:state.cost+option.cost,choices:[...state.choices,option]};
        if(!next.has(nextSum)||candidate.cost<next.get(nextSum).cost)next.set(nextSum,candidate);
      }
      states=next;
    }
    const state=states.get(charge);
    if(state){
      const cost=state.cost+orders.reduce((sum,order)=>sum+.025*(order-1),0);
      if(!best||cost<best.cost)best={cost,orders:[...orders],choices:state.choices};
    }
  };
  const search=(edgeIndex)=>{
    if(visited++>budget)return;
    if(edgeIndex===edges.length){resolveAtoms();return;}
    const edge=edges[edgeIndex];
    for(let order=1;order<=3;order++){
      if(orderSums[edge.a]+order>maxBondOrder[edge.a]||orderSums[edge.b]+order>maxBondOrder[edge.b])continue;
      orders[edgeIndex]=order;orderSums[edge.a]+=order;orderSums[edge.b]+=order;
      let possible=true;
      for(const index of [edge.a,edge.b]){
        const remainingEdges=incident[index].filter(edgeId=>edgeId>edgeIndex).length;
        if(orderSums[index]+remainingEdges>maxBondOrder[index])possible=false;
      }
      if(possible)search(edgeIndex+1);
      orderSums[edge.a]-=order;orderSums[edge.b]-=order;
      if(visited>budget)return;
    }
  };
  if(edges.length===0)resolveAtoms();else search(0);
  if(!best)return null;
  return {totalElectrons,orders:best.orders,atoms:best.choices,searchLimitReached:visited>budget};
}

function Brand({ compact = false }) { return <div className={`brand ${compact ? 'brand-compact' : ''}`}><div className="brand-mark"><Atom size={21} strokeWidth={1.7}/><span /></div>{!compact && <div><strong>UNITER</strong><small>CHEMISTRY LAB</small></div>}</div>; }
function Sidebar({ page, setPage, mobileOpen, setMobileOpen }) {
  const nav = [{ id: 'home', label: 'Overview', icon: Home }, { id: 'library', label: 'Simulation library', icon: Layers3 }, { id: 'lab', label: 'Molecular lab', icon: Atom }];
  return <><aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}><div className="side-top"><Brand/><button className="icon-btn sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={18}/></button></div><div className="workspace-chip"><div className="workspace-avatar">U</div><div><b>Learning space</b><span>Student workspace</span></div><ChevronDown size={15}/></div><span className="nav-caption">WORKSPACE</span><nav>{nav.map(item => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => {setPage(item.id);setMobileOpen(false);}}><item.icon size={18}/><span>{item.label}</span>{item.id === 'lab' && <i className="nav-dot"/>}</button>)}</nav><div className="side-divider"/><span className="nav-caption">YOUR PROGRESS</span><button className="nav-item" onClick={() => {setPage('home');setMobileOpen(false);}}><Award size={18}/><span>Achievements</span></button><button className="nav-item" onClick={() => {setPage('home');setMobileOpen(false);}}><Activity size={18}/><span>Learning activity</span></button><div className="sidebar-bottom"><div className="teacher-card"><div className="teacher-icon"><GraduationCap size={19}/></div><b>Learning together</b><p>Explore concepts at your own pace. Every discovery starts with a question.</p></div><div className="profile-row"><div className="profile-avatar">S</div><div><b>Student</b><span>Independent learner</span></div><Settings2 size={17}/></div></div></aside>{mobileOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)}/>}</>;
}
function Header({ title, breadcrumb, onMenu, onSearch }) { return <header className="topbar"><button className="icon-btn mobile-menu" onClick={onMenu} aria-label="Open menu"><Menu size={20}/></button><div className="breadcrumb"><span>UNITER</span><ChevronRight size={14}/><b>{breadcrumb || title}</b></div><div className="topbar-actions"><button className="top-search" onClick={onSearch}><Search size={16}/><span>Search simulations</span><kbd>⌘ K</kbd></button><div className="top-avatar">S</div></div></header>; }
function CardArt({ item }) { return <div className={`card-art art-${item.color}`}><div className="art-orbit orbit-a"/><div className="art-orbit orbit-b"/><span className="art-symbol">{item.symbol}</span><span className="art-glow"/></div>; }
function SimulationCard({ item, onStart, compact = false }) { return <article className={`simulation-card ${compact ? 'compact-card' : ''}`} onClick={() => item.functional && onStart()}><CardArt item={item}/><div className="card-content"><div className="card-tags"><span>{item.category}</span>{item.functional ? <span className="available"><i/>Interactive</span> : <span className="coming">In development</span>}</div><h3>{item.title}</h3><p>{item.description}</p><div className="card-meta"><span><span className="level-dot"/> {item.level}</span><span><Clock3 size={13}/> {item.time}</span></div><button className={`card-action ${!item.functional ? 'disabled' : ''}`} onClick={(e) => {e.stopPropagation(); if(item.functional) onStart();}}>{item.functional ? <>Open simulation <ChevronRight size={15}/></> : <>Preview topic <ChevronRight size={15}/></>}</button></div></article>; }
function Dashboard({ setPage, openLab, progress, recent, searchTerm, setSearchTerm }) {
  const recentItems = recent.map(id => molecules.find(m => m.formula === id)).filter(Boolean);
  const shapeCount = new Set(progress.explored.map(formula => molecules.find(m => m.formula === formula)?.molecular).filter(Boolean)).size;
  return <main className="page-content dashboard-page"><section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line"/>YOUR DIGITAL SCIENCE LAB</div><h1>Curiosity is a <span>great place to start.</span></h1><p>Explore the invisible world. Test an idea, observe what changes, and make chemistry make sense.</p><div className="welcome-actions"><button className="primary-btn" onClick={openLab}><Atom size={17}/> Enter molecular lab <ChevronRight size={16}/></button><button className="text-btn" onClick={() => setPage('library')}>Browse all simulations <ChevronRight size={16}/></button></div></div><div className="welcome-visual"><div className="visual-ring ring-1"/><div className="visual-ring ring-2"/><div className="visual-core"><Atom size={62} strokeWidth={1.15}/><span/></div><div className="float-label label-bond">BOND ANGLE <b>109.5°</b></div><div className="float-label label-shape"><span className="tiny-atom"/> MOLECULAR SHAPE</div><div className="float-dot dot-one"/><div className="float-dot dot-two"/></div></section><section className="stats-row"><div className="stat-card"><span className="stat-icon stat-mint"><FlaskConical size={17}/></span><div><small>SIMULATIONS EXPLORED</small><b>{progress.explored.length.toString().padStart(2,'0')} <em>/ 12</em></b></div><div className="mini-bars"><i/><i/><i/><i/><i/></div></div><div className="stat-card"><span className="stat-icon stat-violet"><Target size={17}/></span><div><small>CHALLENGE SCORE</small><b>{progress.bestScore}<em> pts</em></b></div><span className="stat-note">personal best</span></div><div className="stat-card"><span className="stat-icon stat-amber"><Award size={17}/></span><div><small>SHAPE TYPES EXPLORED</small><b>{shapeCount} <em>/ 9</em></b></div><span className="progress-ring"><span>{Math.round(shapeCount/9*100)}%</span></span></div></section><section className="section-block"><div className="section-heading"><div><div className="eyebrow">A PLACE TO BEGIN</div><h2>Featured simulation</h2></div><button className="link-btn" onClick={() => setPage('library')}>View library <ChevronRight size={15}/></button></div><article className="feature-card"><div className="feature-copy"><div className="feature-label"><Sparkles size={14}/> FEATURED LAB</div><h3>Molecular Geometry<br/><span>Explorer</span></h3><p>Step inside a molecule. Rotate it, reveal its electron regions, and discover why every atom finds its own position in space.</p><div className="feature-info"><span><Clock3 size={14}/> 12 min</span><span><span className="level-dot"/> Core concepts</span><span className="feature-new">12 molecules</span></div><button className="primary-btn" onClick={openLab}>Start exploring <ChevronRight size={16}/></button></div><div className="feature-art"><div className="feature-grid"/><div className="feature-orbit f-orbit-one"/><div className="feature-orbit f-orbit-two"/><div className="feature-mol-center">C</div><div className="feature-mol atom-f1">H</div><div className="feature-mol atom-f2">H</div><div className="feature-mol atom-f3">H</div><div className="feature-mol atom-f4">H</div><div className="feature-caption">TETRAHEDRAL · CH₄</div><div className="feature-art-badge"><span/> 3D INTERACTIVE</div></div></article></section><section className="section-block explore-section"><div className="section-heading"><div><div className="eyebrow">FOLLOW YOUR CURIOSITY</div><h2>Explore by topic</h2></div><button className="link-btn" onClick={() => setPage('library')}>All topics <ChevronRight size={15}/></button></div><div className="topic-row">{[{name:'Atomic structure',icon:'01',tint:'blue'},{name:'Chemical bonding',icon:'02',tint:'violet'},{name:'Molecular shapes',icon:'03',tint:'mint'},{name:'States of matter',icon:'04',tint:'cyan'}].map(t=><button key={t.name} className="topic-chip" onClick={()=>{setSearchTerm(t.name==='Molecular shapes'?'Molecular Shapes':t.name);setPage('library')}}><span className={`topic-num topic-${t.tint}`}>{t.icon}</span><b>{t.name}</b><ChevronRight size={15}/></button>)}</div></section>{recentItems.length>0&&<section className="section-block recent-section"><div className="section-heading"><div><div className="eyebrow">PICK UP WHERE YOU LEFT OFF</div><h2>Recently explored</h2></div><span className="muted-small">Saved on this device</span></div><div className="recent-strip">{recentItems.slice(0,4).map(m=><button className="recent-pill" key={m.formula} onClick={openLab}><span className="recent-symbol">{m.formula}</span><span><b>{m.formula}</b><small>{m.molecular}</small></span><ChevronRight size={15}/></button>)}</div></section>}</main>;
}
function LibraryPage({ openLab, progress, query, setQuery, selectedCategory, setSelectedCategory }) {
  const filtered = library.filter(item => (selectedCategory === 'All topics' || item.category === selectedCategory) && `${item.title} ${item.category} ${item.description}`.toLowerCase().includes(query.toLowerCase()));
  return <main className="page-content library-page"><div className="page-title-row"><div><div className="eyebrow"><span className="eyebrow-line"/>LEARN BY EXPLORING</div><h1>Simulation library</h1><p>Choose a lab, change the conditions, and see chemistry from a new angle.</p></div><div className="library-count"><b>12</b><span>learning modules</span></div></div><div className="library-toolbar"><label className="library-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search topics, concepts, simulations…"/><kbd>/</kbd></label><span className="filter-label">FILTER BY</span></div><div className="category-filters">{CATEGORIES.map(c=><button key={c} className={selectedCategory===c?'selected':''} onClick={()=>setSelectedCategory(c)}>{c}</button>)}</div><div className="results-line"><b>{filtered.length} simulations</b><span>•</span><span>{selectedCategory}</span></div><div className="library-grid">{filtered.map((item,i)=><SimulationCard key={item.title} item={item} onStart={openLab}/>)}</div>{filtered.length===0&&<div className="empty-state"><Search size={25}/><h3>No matching simulations</h3><p>Try a different search or select another topic.</p><button className="text-btn" onClick={()=>{setQuery('');setSelectedCategory('All topics')}}>Clear filters <X size={14}/></button></div>}<div className="library-note"><Info size={16}/><span>Interactive simulations are clearly marked. More hands-on labs are in development and will be added to this library.</span></div></main>;
}
function MoleculeModel({ data, mode, toggles, selectedPart, setSelectedPart, animate }) {
  if (data.graph) return <MoleculeGraphModel data={data} mode={mode} toggles={toggles} selectedPart={selectedPart} setSelectedPart={setSelectedPart} animate={animate}/>;
  const centralColor = '#69d6c3';
  const atomColors = { H:'#f3f5f7', C:'#6677e8', N:'#6188ff', O:'#ef7081', F:'#75c99a', Cl:'#7bbd81', Be:'#e6b968', B:'#e2a858', S:'#e6bd61', P:'#e78759', Xe:'#9a83df' };
  const scale = mode === 'Space-filling' ? 1.14 : 1;
  const ball = toggles.atoms;
  const bondVisible = toggles.bonds && mode !== 'Space-filling';
  const pairsVisible = toggles.regions && mode === 'Electron pairs';
  const atomRadius = mode === 'Space-filling' ? 0.43 : 0.25;
  const atomClick = (name) => setSelectedPart(selectedPart === name ? null : name);
  return <group rotation={animate ? [0, Math.sin(Date.now() * .0004) * .09, 0] : [0,0,0]}>
    {data.positions.map((p,i)=><group key={`ligand-${i}`}>
      {bondVisible&&<Bond start={p.map(v=>v*.38)} end={p.map(v=>v*1.28)} color={selectedPart===`bond-${i}`?'#f1bd6b':'#8496a7'} order={data.bondOrders?.[i]||data.bondOrder||1} onClick={()=>atomClick(`bond-${i}`)}/>}
      {pairsVisible&&<ElectronRegion position={p.map(v=>v*.8)} lone={false} selected={selectedPart===`bond-${i}`} onClick={()=>atomClick(`bond-${i}`)}/>}
      {ball&&<AtomSphere position={p.map(v=>v*1.53)} radius={atomRadius*scale} color={atomColors[data.ligands[i]]||'#dce5ed'} label={toggles.labels?data.ligands[i]:null} selected={selectedPart===`atom-${i}`} onClick={()=>atomClick(`atom-${i}`)}/>}
    </group>)}
    {data.loneDirections.map((p,i)=><group key={`lone-${i}`}><LonePair position={p.map(v=>v*.94)} visible={toggles.lonePairs} label={toggles.labels?'LP':null} onClick={()=>atomClick(`lone-${i}`)}/></group>)}
    {ball&&<AtomSphere position={[0,0,0]} radius={.38*scale} color={centralColor} label={toggles.labels?data.central:null} selected={selectedPart==='central'} onClick={()=>atomClick('central')}/>}
  </group>;
}
function MoleculeGraphModel({data,mode,toggles,selectedPart,setSelectedPart,animate}) {
  const atomColors = {H:'#f3f5f7',C:'#6677e8',N:'#6188ff',O:'#ef7081',F:'#75c99a',Cl:'#7bbd81',Be:'#e6b968',B:'#e2a858',S:'#e6bd61',P:'#e78759',Xe:'#9a83df'};
  const scale = mode === 'Space-filling' ? 1.14 : 1;
  const atomRadius = mode === 'Space-filling' ? .4 : .24;
  const selected = (part) => setSelectedPart(selectedPart === part ? null : part);
  return <group rotation={animate ? [0,Math.sin(Date.now()*.0004)*.09,0] : [0,0,0]}>
    {data.graph.bonds.map((bond,index)=>{
      const start=data.graph.atoms.find(atom=>atom.id===bond.a)?.position;
      const end=data.graph.atoms.find(atom=>atom.id===bond.b)?.position;
      if(!start||!end)return null;
      const id=`graph-bond-${index}`;
      return <group key={id}>
        {toggles.bonds&&mode!=='Space-filling'&&<Bond start={start} end={end} color={selectedPart===id?'#f1bd6b':'#8496a7'} order={bond.order} onClick={()=>selected(id)}/>}
        {toggles.regions&&mode==='Electron pairs'&&<ElectronRegion position={start.map((value,i)=>(value+end[i])/2)} lone={false} selected={selectedPart===id} onClick={()=>selected(id)}/>}
      </group>;
    })}
    {data.graph.atoms.map(atom=><group key={atom.id}>
      {toggles.atoms&&<AtomSphere position={atom.position} radius={(atom.element==='C'||atom.element==='O'||atom.element==='N'?atomRadius+.04:atomRadius)*scale} color={atomColors[atom.element]||'#dce5ed'} label={toggles.labels?`${atom.element}${atom.formalCharge?`${Math.abs(atom.formalCharge)>1?Math.abs(atom.formalCharge):''}${atom.formalCharge>0?'+':'−'}`:''}`:null} selected={selectedPart===`graph-atom-${atom.id}`} onClick={()=>selected(`graph-atom-${atom.id}`)}/>}
      {atom.lonePairs>0&&toggles.lonePairs&&Array.from({length:atom.lonePairs},(_,index)=><LonePair key={`lp-${index}`} position={atom.lonePositions?.[index]||[atom.position[0],atom.position[1]+.42+index*.13,atom.position[2]+.12]} visible label={toggles.labels?'LP':null} onClick={()=>selected(`graph-lp-${atom.id}-${index}`)}/>)}
    </group>)}
  </group>;
}
function Bond({ start, end, color, order, onClick }) {
  const a = new THREE.Vector3(...start), b = new THREE.Vector3(...end), direction = b.clone().sub(a), midpoint = a.clone().add(b).multiplyScalar(.5);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), direction.clone().normalize());
  return <group position={midpoint.toArray()} quaternion={quaternion} onClick={onClick}>{Array.from({length:order},(_,i)=><mesh key={i} position={[(i-(order-1)/2)*.1,0,0]} castShadow><cylinderGeometry args={[.045,.045,direction.length(),8]}/><meshStandardMaterial color={color} metalness={.3} roughness={.38}/></mesh>)}</group>;
}
function AtomSphere({position,radius,color,label,selected,onClick}) { return <group position={position} onClick={onClick}><mesh castShadow receiveShadow><sphereGeometry args={[radius,24,18]}/><meshStandardMaterial color={color} roughness={.26} metalness={.1} emissive={selected?'#bf8950':'#000000'} emissiveIntensity={selected ? .32 : 0}/></mesh>{label&&<Html center distanceFactor={8} style={{pointerEvents:'none'}}><span className="atom-label">{label}</span></Html>}</group>; }
function ElectronRegion({position,lone,selected,onClick}) { return <group position={position} onClick={onClick}><mesh rotation={[0,0,-.55]}><sphereGeometry args={[.18,18,14]}/><meshStandardMaterial color={lone?'#e7ab69':'#4da7c3'} transparent opacity={.55} roughness={.32} emissive={lone?'#c8783e':'#246784'} emissiveIntensity={selected?.5:.2}/></mesh><mesh position={[-.11,.03,0]} scale={[.2,.2,.2]}><sphereGeometry args={[.1,12,10]}/><meshBasicMaterial color={lone?'#f4c58a':'#83dced'}/></mesh><mesh position={[.11,-.03,0]} scale={[.2,.2,.2]}><sphereGeometry args={[.1,12,10]}/><meshBasicMaterial color={lone?'#f4c58a':'#83dced'}/></mesh></group>; }
function LonePair({position,visible,label,onClick}) { if(!visible)return null;return <group position={position} onClick={onClick}><mesh rotation={[0,0,-.65]} scale={[1.15,.62,.65]}><sphereGeometry args={[.2,20,14]}/><meshStandardMaterial color="#edbc7e" transparent opacity={.66} roughness={.28}/></mesh><mesh position={[-.08,.025,.02]}><sphereGeometry args={[.035,12,8]}/><meshBasicMaterial color="#fff0d6"/></mesh><mesh position={[.08,-.025,-.02]}><sphereGeometry args={[.035,12,8]}/><meshBasicMaterial color="#fff0d6"/></mesh>{label&&<Html center distanceFactor={8}><span className="lp-label">LP</span></Html>}</group>; }
function localVseprDomains(atom, degree) {
  const known = shapes[`${degree},${atom.lonePairs}`];
  if (known) return { bondVectors:known.positions, loneVectors:known.lonePositions, electron:known.electron, molecular:known.molecular };
  const domains=degree+atom.lonePairs;
  const vectors={2:[norm([1,0,0]),norm([-1,0,0])],3:trig,4:tetra,5:tbp,6:oct}[domains]||[norm([1,0,0]),norm([-1,0,0]),norm([0,1,0]),norm([0,-1,0]),norm([0,0,1]),norm([0,0,-1])];
  const electron={2:'Linear',3:'Trigonal planar',4:'Tetrahedral',5:'Trigonal bipyramidal',6:'Octahedral'}[domains]||'Unclassified';
  return {bondVectors:vectors.slice(0,degree),loneVectors:vectors.slice(degree,degree+atom.lonePairs),electron,molecular:degree===2&&atom.lonePairs>0?'Bent':electron};
}
function layoutVseprGraph(atoms,bonds) {
  if(atoms.length===0||bonds.length!==atoms.length-1)return null;
  const adjacency=new Map(atoms.map(atom=>[atom.id,[]]));
  for(const bond of bonds){adjacency.get(bond.a)?.push(bond.b);adjacency.get(bond.b)?.push(bond.a);}
  const root=atoms.reduce((best,atom)=>adjacency.get(atom.id).length>adjacency.get(best.id).length?atom:best,atoms[0]);
  const positions=new Map([[root.id,[0,0,0]]]);
  const local=new Map(atoms.map(atom=>[atom.id,localVseprDomains(atom,adjacency.get(atom.id)?.length||0)]));
  const parentMap=new Map([[root.id,null]]);
  const queue=[root.id];
  while(queue.length){
    const parentId=queue.shift(), parentPosition=positions.get(parentId), parentDomain=local.get(parentId), parentOffset=parentMap.get(parentId)?1:0, children=adjacency.get(parentId).filter(id=>id!==parentMap.get(parentId));
    children.forEach((childId,index)=>{
      const direction=parentDomain.bondVectors[index+parentOffset];
      if(!direction)return;
      const childPosition=parentPosition.map((value,axis)=>value+direction[axis]*1.18);
      positions.set(childId,childPosition);parentMap.set(childId,parentId);queue.push(childId);
    });
  }
  if(positions.size!==atoms.length)return null;
  const placed=atoms.map(atom=>{
    const position=positions.get(atom.id),parentId=parentMap.get(atom.id),domain=local.get(atom.id);
    let rotation=new THREE.Quaternion();
    if(parentId){
      const parentPosition=positions.get(parentId);
      const toParent=new THREE.Vector3(...parentPosition).sub(new THREE.Vector3(...position)).normalize();
      const canonical=domain.bondVectors[0];
      if(canonical)rotation.setFromUnitVectors(new THREE.Vector3(...canonical).normalize(),toParent);
    }
    const lonePositions=domain.loneVectors.map(vector=>new THREE.Vector3(...vector).applyQuaternion(rotation).multiplyScalar(.52).add(new THREE.Vector3(...position)).toArray());
    return {...atom,position,lonePositions,electronGeometry:domain.electron,molecularGeometry:domain.molecular};
  });
  return placed;
}
function GeometryGuide({data, show}) { if(!show||data.graph||!data.positions||data.positions.length<2)return null;const p1=new THREE.Vector3(...data.positions[0]).multiplyScalar(1.48),p2=new THREE.Vector3(...data.positions[1]).multiplyScalar(1.48),mid=p1.clone().add(p2).multiplyScalar(.5);return <Html position={mid.add(new THREE.Vector3(0,.35,0)).toArray()} center distanceFactor={9}><span className="angle-label">∠ {data.angle}</span></Html>; }
function MoleculeCanvas({ data, mode, toggles, selectedPart, setSelectedPart, animate, onReset, fullScreen, setFullScreen }) {
  return <div className={`canvas-wrap ${fullScreen?'canvas-full':''}`}><Canvas dpr={[1,1.5]} camera={{position:[3.7,2.7,5.1],fov:42}} shadows gl={{antialias:false,powerPreference:'low-power'}}><color attach="background" args={['#101e2b']}/><ambientLight intensity={1.05}/><directionalLight position={[4,5,3]} intensity={2.2} castShadow shadow-mapSize-width={512} shadow-mapSize-height={512}/><pointLight position={[-3,-2,-2]} intensity={.6} color="#4a91a3"/><Stars radius={20} depth={12} count={150} factor={1.1} saturation={.1} fade speed={.15}/><MoleculeModel data={data} mode={mode} toggles={toggles} selectedPart={selectedPart} setSelectedPart={setSelectedPart} animate={animate}/><GeometryGuide data={data} show={toggles.angles}/><OrbitControls makeDefault enableDamping dampingFactor={.08} minDistance={2.5} maxDistance={10} enablePan={false} autoRotate={animate} autoRotateSpeed={.55}/></Canvas><div className="view-hint"><Compass size={13}/> DRAG TO ROTATE <span/> SCROLL TO ZOOM</div><div className="canvas-tools"><button title="Reset camera" onClick={onReset}><RotateCcw size={15}/></button><button title={fullScreen?'Exit full screen':'Full screen'} onClick={()=>setFullScreen(!fullScreen)}><Maximize2 size={15}/></button></div><div className="canvas-top-chip"><span className="live-dot"/> LIVE 3D MODEL</div>{fullScreen&&<button className="fullscreen-close" onClick={()=>setFullScreen(false)}><X size={18}/></button>}</div>;
}
function MoleculeDetails({data,selectedPart}) { return <div className="detail-panel"><div className="detail-header"><span className="detail-tag">{data.graph?'CONNECTED MOLECULE':'MOLECULE PROFILE'}</span><span className={`polarity-badge ${data.polarity==='Polar'?'polar':data.polarity==='Non-polar'?'nonpolar':'estimated'}`}><i/>{data.polarity}</span></div><div className="formula-title">{data.formula}<small>{data.graph?'Connected molecule':`${data.molecular} geometry`}</small></div>{data.graph?<><div className="data-grid"><div><span>Atoms</span><b>{data.graph.atoms.length}</b></div><div><span>Bonds</span><b>{data.graph.bonds.length}</b></div><div><span>Multiple bonds</span><b>{data.graph.bonds.filter(bond=>bond.order>1).length}</b></div><div><span>Valence electrons</span><b>{data.valenceElectrons}</b></div><div><span>Overall charge</span><b>{data.charge===0?'0':`${Math.abs(data.charge)}${data.charge>0?'+':'−'}`}</b></div></div><div className="geometry-pair"><div><small>LOCAL VSEPR SHAPES</small><b>{data.graph.atoms.filter(atom=>atom.element!=='H'&&atom.element!=='He').map(atom=>atom.molecularGeometry).filter(Boolean).join(' · ')||'See Lewis summary'}</b></div><div><small>BONDING MODEL</small><b>Orders inferred from valence electrons</b></div></div><div className="explanation-box"><div className="explain-icon"><Info size={15}/></div><div><b>How to read this model</b><p>{data.note} Each bond order is shown explicitly. Rotate the model to inspect the full connected structure.</p></div></div></>:<><div className="data-grid"><div><span>Central atom</span><b>{data.central}</b></div><div><span>Bonding regions</span><b>{data.ligands.length}</b></div><div><span>Lone pairs</span><b>{data.lone}</b></div><div><span>Total regions</span><b>{data.ligands.length+data.lone}</b></div>{data.charge!==undefined&&<div><span>Overall charge</span><b>{data.charge===0?'0':`${Math.abs(data.charge)}${data.charge>0?'+':'−'}`}</b></div>}</div><div className="geometry-pair"><div><small>ELECTRON-PAIR GEOMETRY</small><b>{data.electron}</b></div><div><small>MOLECULAR GEOMETRY</small><b>{data.molecular}</b></div></div><div className="angle-row"><span><span className="angle-icon">∠</span> Approx. bond angle</span><b>{data.angle}</b></div><div className="explanation-box"><div className="explain-icon"><Info size={15}/></div><div><b>Why this shape?</b><p>{data.note} Electron regions repel and arrange themselves as far apart as possible. Lone pairs occupy space but are not included when naming the molecular shape.</p></div></div></>}{selectedPart&&<div className="selection-note"><span className="selection-dot"/> Selected: {selectedPart.replace('-', ' ')}</div>}</div>;<div className="local-shapes-list">{data.graph.atoms.filter(({element})=>element!=='H'&&element!=='He').map((atom,index)=><div key={atom.id}><span>{atom.element}{index+1}</span><b>{atom.molecularGeometry}</b><small>{data.graph.bonds.filter(bond=>bond.a===atom.id||bond.b===atom.id).length} bonded atoms + {atom.lonePairs} lone pair{atom.lonePairs===1?'':'s'} · {atom.electronGeometry}</small></div>)}</div>; }
function LearningPanel({data,step,setStep,answer,setAnswer,completeStep}) { if(data.graph)return <div className="learning-panel"><div className="learning-question"><span className="step-number"><Atom size={15}/></span><div><small>CONNECTED MOLECULE</small><h3>Explore local bonding</h3><p>{data.formula} has multiple bonded atoms, so it does not have one central-atom VSEPR shape. Use the 3D model to inspect each bond and local environment.</p></div></div></div>; const total=data.ligands.length+data.lone;const steps=[['Identify the central atom',`Which atom is at the centre of ${data.formula}?`,data.central],['Count bonding regions','Count each bond to the central atom as one region (even a multiple bond).',`${data.ligands.length} bonding regions`],['Count lone-pair regions','How many lone pairs are on the central atom?',`${data.lone} lone pair${data.lone===1?'':'s'}`],['Find total electron regions','Add bonding regions and lone-pair regions.',`${data.ligands.length} + ${data.lone} = ${total} regions`],['Predict electron geometry','Use the total number of electron regions.',data.electron],['Determine molecular shape','Name the arrangement of atoms only; do not include lone pairs.',data.molecular],['Estimate the bond angle','Lone pairs may compress ideal angles.',data.angle],['Compare with the 3D model','Reveal the molecular model and compare your prediction.',`The model is ${data.molecular.toLowerCase()}.`]];const item=steps[step];return <div className="learning-panel"><div className="learning-progress"><div><span>GUIDED EXPLORATION</span><b>Step {step+1} <em>of {steps.length}</em></b></div><div className="step-track">{steps.map((_,i)=><i key={i} className={i<=step?'done':''}/>)}</div></div><div className="learning-question"><span className="step-number">{String(step+1).padStart(2,'0')}</span><div><small>STEP {step+1}</small><h3>{item[0]}</h3><p>{item[1]}</p></div></div>{step<steps.length-1?<div className="answer-area"><label>{step===0?'SELECT AN ANSWER':'YOUR PREDICTION'}</label>{step===0?<div className="choice-row">{[data.central,...['C','N','O','S','P','Xe'].filter(x=>x!==data.central).slice(0,3)].map((a,i)=><button key={`${a}${i}`} className={answer===a?'chosen':''} onClick={()=>setAnswer(a)}>{a}</button>)}</div>:<input value={answer||''} onChange={e=>setAnswer(e.target.value)} placeholder="Type your answer…"/>}<button className="reveal-btn" onClick={()=>completeStep(item[2])}><HelpCircle size={15}/> Reveal answer</button></div>:<div className="compare-answer"><Check size={18}/><div><b>{item[2]}</b><span>Compare your prediction with the interactive model in the viewport.</span></div><button onClick={()=>setStep(0)}><RotateCcw size={14}/> Start again</button></div>}<div className="learning-footer"><button className="step-nav" disabled={step===0} onClick={()=>{setStep(step-1);setAnswer('')}}><ChevronLeft size={16}/> Previous</button><button className="step-nav next" onClick={()=>{if(step<steps.length-1){setStep(step+1);setAnswer('')}else setStep(0)}}>{step===steps.length-1?'Finish':'Next step'} <ChevronRight size={16}/></button></div></div>; }
function ChallengePanel({score,setScore,answer,setAnswer,questionIndex,setQuestionIndex,answers,setAnswers,onFinish,progress}) {const startedAt=useState(Date.now())[0];const q=quizQuestions[questionIndex%quizQuestions.length];const lastTime=progress.completionSeconds?`${Math.floor(progress.completionSeconds/60)}m ${progress.completionSeconds%60}s`:'—';const chosen=answers[questionIndex];const submitted=chosen!==undefined;const next=()=>{if(!submitted){if(answer===null)return;const correct=answer===q.answer;setAnswers({...answers,[questionIndex]:{choice:answer,correct}});setScore(score+(correct?10:0));setAnswer(null);}else if(questionIndex+1>=quizQuestions.length){onFinish(score, answers, Math.round((Date.now()-startedAt)/1000));setQuestionIndex(0);setAnswers({});setScore(0);setAnswer(null);}else{setQuestionIndex(questionIndex+1);setAnswer(null);}};const activeChoice=submitted?chosen.choice:answer;const isCorrect=submitted?chosen.correct:activeChoice===q.answer;return <div className="challenge-panel"><div className="challenge-head"><div><span>KNOWLEDGE CHECK</span><b>Challenge mode</b></div><div className="score-chip"><Award size={15}/>{score} pts</div></div>{progress.quizCount>0&&<div className="challenge-history"><span>PREVIOUS RUN</span><b>{lastTime}</b><span>{progress.correctAnswers||0} correct · {progress.incorrectAnswers||0} incorrect overall</span></div>}<div className="quiz-progress"><span>QUESTION {questionIndex+1} <em>OF {quizQuestions.length}</em></span><div>{quizQuestions.map((_,i)=><i key={i} className={i<questionIndex?'complete':i===questionIndex?'current':''}/>)}</div></div><h3>{q.q}</h3><div className="quiz-options">{q.options.map((op,i)=><button key={op} onClick={()=>!submitted&&setAnswer(i)} className={`${activeChoice===i?'picked':''} ${submitted&&i===q.answer?'right':''} ${submitted&&i===activeChoice&&!isCorrect?'wrong':''}`}><span className="option-letter">{String.fromCharCode(65+i)}</span>{op}{submitted&&i===q.answer&&<Check size={16}/>}</button>)}</div>{submitted&&<div className={`feedback-box ${isCorrect?'correct':'incorrect'}`}><b>{isCorrect?'Exactly right.':'Not quite—keep exploring.'}</b><p>{q.explain}</p></div>}<div className="challenge-actions"><span>{Object.keys(answers).length} answered · {Object.values(answers).filter(item=>item.correct).length} correct · {Object.values(answers).filter(item=>!item.correct).length} incorrect</span><button className="primary-btn" disabled={!submitted&&answer===null} onClick={next}>{submitted?questionIndex+1>=quizQuestions.length?'Finish challenge':'Next question':'Check answer'}<ChevronRight size={15}/></button></div></div>; }
function CustomBuilder({ onBuild }) {
  const [builderMode, setBuilderMode] = useState('vsepr');
  const [central, setCentral] = useState('C');
  const [terminalAtoms, setTerminalAtoms] = useState(['H', 'H', 'H', 'H']);
  const [charge, setCharge] = useState(0);
  const bondCount = terminalAtoms.length;
  const elements = ['H', 'He', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Al', 'Si', 'P', 'S', 'Cl', 'He', 'Ne', 'Ar', 'Kr', 'Br', 'I', 'Se', 'Te', 'Pb', 'Bi', 'Po', 'At', 'Rn'];
  const subscript = (count) => String(count).replace(/\d/g, digit => '₀₁₂₃₄₅₆₇₈₉'[Number(digit)]);
  const superscript = (value) => String(value).replace(/\d/g, digit => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(digit)]);
  const baseFormula = (() => {
    const counts = new Map([[central, 1]]);
    terminalAtoms.forEach(atom => counts.set(atom, (counts.get(atom) || 0) + 1));
    return [...counts].map(([atom, count]) => `${atom}${count > 1 ? subscript(count) : ''}`).join('');
  })();
  const chargeSuffix = charge === 0 ? '' : `${Math.abs(charge) > 1 ? superscript(Math.abs(charge)) : ''}${charge > 0 ? '⁺' : '⁻'}`;
  const formula = charge === 0 ? baseFormula : `[${baseFormula}]${chargeSuffix}`;
  const builderAtoms=[{id:'central',element:central},...terminalAtoms.map((element,index)=>({id:`terminal-${index}`,element}))];
  const builderBonds=terminalAtoms.map((_,index)=>({a:'central',b:`terminal-${index}`}));
  const lewis=useMemo(()=>solveLewisStructure(builderAtoms,builderBonds,charge),[central,terminalAtoms,charge]);
  const lone=lewis?.atoms[0].lonePairs??0;
  const key = `${bondCount},${lone}`;
  const geometry = shapes[key];
  const totalRegions = bondCount + lone;
  const valenceElectrons=lewis?.totalElectrons??builderAtoms.reduce((sum,atom)=>sum+(VALENCE_ELECTRONS[atom.element]||0),0)-charge;
  const inferredBondOrders=lewis?.orders||[];
  const suggestedLone=lewis?.atoms[0].lonePairs??null;
  if (builderMode === 'graph') return <div className="builder-card">
    <div className="builder-header"><div className="builder-icon"><Atom size={18}/></div><div><b>Draw a connected molecule</b><p>Add atoms and connect them; the model infers bond order from valence electrons.</p></div></div>
    <div className="builder-mode-switch"><button type="button" onClick={() => setBuilderMode('vsepr')}>Back to single-center VSEPR builder</button></div>
    <MoleculeGraphBuilder onBuild={onBuild}/>
  </div>;
  const setTerminalAtom = (index, atom) => setTerminalAtoms(current => current.map((item, i) => i === index ? atom : item));
  const build = () => {
    if (!geometry) return;
    onBuild({
      ...geometry,
      formula,
      central,
      ligands: [...terminalAtoms],
      bondOrders: [...inferredBondOrders],
      lone,
      charge,
      polarity: 'Model estimate',
      note: `${formula} has ${valenceElectrons} valence electrons. The Lewis model assigns ${bondCount} bonding region${bondCount===1?'':'s'} and ${lone} lone pair${lone===1?'':'s'} to the central atom; the overall charge is included in the electron count.`,
      bondOrder: 1,
    });
  };

  return <div className="builder-card">
    <div className="builder-header">
      <div className="builder-icon"><Settings2 size={18}/></div>
      <div><b>Build a molecular shape</b><p>Choose the centre, add surrounding atoms, then count lone pairs.</p></div>
    </div>
    <div className="builder-mode-switch"><button type="button" onClick={() => setBuilderMode('graph')}>Need multiple centers or multiple bonds? Draw a molecule →</button></div>
    <div className="ion-examples"><span>TRY AN ION</span>{[
      { formula: '[NH₄]⁺', central: 'N', terminals: ['H', 'H', 'H', 'H'], charge: 1 },
      { formula: '[H₃O]⁺', central: 'O', terminals: ['H', 'H', 'H'], charge: 1 },
      { formula: '[NO₂]⁺', central: 'N', terminals: ['O', 'O'], charge: 1 },
      { formula: '[NO₂]⁻', central: 'N', terminals: ['O', 'O'], charge: -1 },
      { formula: '[CO₃]²⁻', central: 'C', terminals: ['O', 'O', 'O'], charge: -2 },
      { formula: '[SO₄]²⁻', central: 'S', terminals: ['O', 'O', 'O', 'O'], charge: -2 },
    ].map(example => <button type="button" key={example.formula} onClick={() => { setCentral(example.central); setTerminalAtoms(example.terminals); setCharge(example.charge); }}>{example.formula}</button>)}</div>
    <div className="builder-fields builder-fields-interactive">
      <label className="builder-central-field">Central atom
        <select value={central} onChange={event => setCentral(event.target.value)} aria-label="Choose central atom">
          {['C', 'N', 'O', 'S', 'P', 'Xe', 'B', 'Be', 'Al', 'Si', 'Cl', 'He', 'Ne', 'Ar', 'Kr', 'Br', 'I', 'Se', 'Te', 'Pb', 'Bi', 'Po', 'At', 'Rn'].map(atom => <option key={atom}>{atom}</option>)}
        </select>
      </label>
      <label className="builder-central-field">Overall charge
        <select value={charge} onChange={event => setCharge(Number(event.target.value))} aria-label="Choose overall molecular or ion charge">
          <option value={0}>Neutral (0)</option>
          {[-3, -2, -1, 1, 2, 3].map(value => <option key={value} value={value}>{Math.abs(value)} {value > 0 ? 'positive' : 'negative'}</option>)}
        </select>
      </label>
      <div className="terminal-atom-editor">
        <div className="terminal-atom-heading"><span>Terminal atoms</span><span>{bondCount} added</span></div>
        <div className="terminal-atom-list">
          {terminalAtoms.map((atom, index) => <div className="terminal-atom-row" key={index}>
            <span className="terminal-atom-number">{index + 1}</span>
            <label className="sr-only" htmlFor={`terminal-atom-${index}`}>Terminal atom {index + 1}</label>
            <select id={`terminal-atom-${index}`} value={atom} onChange={event => setTerminalAtom(index, event.target.value)}>
              {elements.map(element => <option key={element}>{element}</option>)}
            </select>
            <span className="inferred-bond-order" aria-label={`${inferredBondOrders[index]||1} bond order`}>{inferredBondOrders[index]===3?'≡':inferredBondOrders[index]===2?'═':'—'}</span>
            <button type="button" className="terminal-remove" disabled={bondCount <= 2} onClick={() => setTerminalAtoms(current => current.filter((_, i) => i !== index))} aria-label={`Remove terminal atom ${index + 1}`} title="Remove terminal atom">−</button>
          </div>)}
        </div>
        <button type="button" className="terminal-add" disabled={bondCount >= 6 || totalRegions >= 6} onClick={() => { if(bondCount < 6 && totalRegions < 6)setTerminalAtoms(current=>[...current,'H']); }}><span>+</span> Add terminal atom</button>
      </div>
      <div className="stepper-field builder-lone-stepper"><span>Lewis lone pairs on central atom <small>{suggestedLone === null ? 'No closed-shell Lewis structure found' : `Automatically inferred: ${suggestedLone}`}</small></span><b>{suggestedLone??'—'}</b></div>
    </div>
    <div className="builder-summary builder-summary-detailed" aria-live="polite">
      <div className="electron-dots">{Array.from({ length: totalRegions }, (_, index) => <i key={index} className={index >= bondCount ? 'lone-dot' : ''}/>)}</div>
      <div className="builder-calculation"><b>{formula}</b><span><strong>{valenceElectrons} total valence electrons</strong> · {bondCount} bonded atoms + {suggestedLone??'—'} central lone pairs</span></div>
      <div className="builder-geometry"><small>MOLECULAR SHAPE</small><b>{geometry?.molecular || 'Not available'}</b></div>
    </div>
    <p className="builder-guidance">The model assigns bond orders and lone pairs from total valence electrons, formal charge, duet/octet rules, and common electron-deficient or expanded-shell patterns. A multiple bond still counts as one VSEPR region.</p>
    <button className="primary-btn builder-apply" disabled={!geometry||!lewis} onClick={build}>{geometry&&lewis ? 'Apply inferred structure to 3D model' : 'No supported closed-shell Lewis structure'}<ChevronRight size={15}/></button>
  </div>;
}
function LabPage({progress,setProgress,completeLab}) {
  const [selected,setSelected]=useState(4);
  const [custom,setCustom]=useState(null);
  const [query,setQuery]=useState('');
  const [mode,setMode]=useState('Ball & stick');
  const [toggles,setToggles]=useState({labels:true,angles:false,regions:false,lonePairs:true,bonds:true,atoms:true});
  const [animate,setAnimate]=useState(false);
  const [tab,setTab]=useState('explore');
  const [step,setStep]=useState(0);
  const [answer,setAnswer]=useState('');
  const [selectedPart,setSelectedPart]=useState(null);
  const [fullScreen,setFullScreen]=useState(false);
  const [quizScore,setQuizScore]=useState(0);
  const [quizAnswer,setQuizAnswer]=useState(null);
  const [questionIndex,setQuestionIndex]=useState(0);
  const [answers,setAnswers]=useState({});
  const [filteredCategory,setFilteredCategory]=useState('All');
  const [cameraKey,setCameraKey]=useState(0);
  const data=custom||molecules[selected];
  useEffect(()=>{
    if(custom)return;
    const list=readSaved('uniter-recent',[]);
    localStorage.setItem('uniter-recent',JSON.stringify([data.formula,...list.filter(item=>item!==data.formula)].slice(0,4)));
    setProgress(current=>({...current,explored:[...new Set([...current.explored,data.formula])]}));
  },[data.formula,custom,setProgress]);
  const filteredMolecules=molecules.filter(item=>(filteredCategory==='All'||item.electron===filteredCategory)&&item.formula.toLowerCase().includes(query.toLowerCase()));
  const categories=['All',...new Set(molecules.map(item=>item.electron))];
  const toggle=key=>setToggles(current=>({...current,[key]:!current[key]}));
  const buildCustom=model=>{setCustom(model);setTab('explore');setSelectedPart(null);setCameraKey(key=>key+1);};
  const reveal=correct=>{const expected=String(correct).toLowerCase(),given=(answer||'').trim().toLowerCase();setAnswer(given===expected?`Correct — ${correct}`:`Review: ${correct}`);};
  const viewData=custom?.graph?data:{...data,loneDirections:data.loneDirections||data.lonePositions||shapes[`${data.ligands.length},${data.lone}`]?.lone||[]};
  return <main className="lab-page">
    <div className="lab-titlebar"><div><div className="eyebrow"><span className="eyebrow-line"/>INTERACTIVE SIMULATION <span className="lab-version">VSEPR · 3D</span></div><h1>Molecular Geometry <span>Explorer</span></h1><p>Count valence electrons, infer Lewis bonds, and predict molecular shape.</p></div><div className="lab-title-actions"><button className="lab-status"><span/> Autosaved</button><button className="icon-btn" title="Reset simulation" onClick={()=>{setSelected(4);setCustom(null);setMode('Ball & stick');setTab('explore');setCameraKey(key=>key+1);}}><RotateCcw size={16}/></button></div></div>
    <div className="lab-layout">
      <aside className="lab-sidebar"><div className="lab-side-tabs"><button className={!custom?'on':''} onClick={()=>{setCustom(null);setTab('explore')}}>Molecule presets</button><button className={tab==='build'?'on':''} onClick={()=>setTab('build')}>Shape builder</button></div><div className="molecule-search"><Search size={15}/><input placeholder="Find a molecule…" value={query} onChange={event=>setQuery(event.target.value)}/></div><div className="geometry-filter"><label>GEOMETRY</label><select value={filteredCategory} onChange={event=>setFilteredCategory(event.target.value)}>{categories.map(category=><option key={category}>{category}</option>)}</select></div><div className="molecule-list">{filteredMolecules.map(item=>{const index=molecules.indexOf(item);return <button key={item.formula} className={`molecule-item ${!custom&&selected===index?'selected':''}`} onClick={()=>{setSelected(index);setCustom(null);setSelectedPart(null);setTab('explore')}}><span className="molecule-icon">{item.central}</span><span className="molecule-label"><b>{item.formula}</b><small>{item.molecular}</small></span><span className="region-count">{item.ligands.length+item.lone}e⁻</span></button>;})}{filteredMolecules.length===0&&<div className="no-molecules">No molecules found.</div>}</div><div className="sidebar-tip"><Sparkles size={15}/><p><b>Quick tip</b><br/>Multiple bonds count as one VSEPR region. Use the connected-molecule builder for multiple centers.</p></div></aside>
      <div className="lab-main"><div className="lab-tabs"><button className={tab==='explore'?'active':''} onClick={()=>setTab('explore')}><Atom size={15}/> Explore model</button><button className={tab==='learn'?'active':''} onClick={()=>setTab('learn')}><BookOpen size={15}/> Guided learning</button><button className={tab==='challenge'?'active':''} onClick={()=>setTab('challenge')}><Target size={15}/> Challenge</button><span className="tab-spacer"/><span className="autosave-note"><span/> Progress saved</span></div>
        {tab==='build'?<div className="lab-workspace"><CustomBuilder onBuild={buildCustom}/></div>:<><div className="lab-workspace"><div className="visual-column"><div className="model-heading"><div><span className="model-kicker">CURRENT MODEL</span><h2>{data.formula} <span>·</span> {data.molecular}</h2></div><div className="visual-mode"><span>VIEW</span><select value={mode} onChange={event=>setMode(event.target.value)}>{['Ball & stick','Electron pairs','Space-filling'].map(view=><option key={view}>{view}</option>)}</select></div></div><MoleculeCanvas key={cameraKey} data={viewData} mode={mode} toggles={toggles} selectedPart={selectedPart} setSelectedPart={setSelectedPart} animate={animate} onReset={()=>setCameraKey(key=>key+1)} fullScreen={fullScreen} setFullScreen={setFullScreen}/><div className="model-controls"><div className="control-group"><button className={animate?'control-on':''} onClick={()=>setAnimate(value=>!value)}>{animate?<Pause size={14}/>:<Play size={14}/>}<span>{animate?'Pause rotation':'Rotate model'}</span></button><button onClick={()=>setCameraKey(key=>key+1)}><RotateCcw size={14}/><span>Reset view</span></button></div><div className="control-toggles">{[{key:'atoms',label:'Atoms'},{key:'labels',label:'Labels'},{key:'angles',label:'Angles'},{key:'lonePairs',label:'Lone pairs'},{key:'regions',label:'Electron regions'}].map(item=><button key={item.key} className={toggles[item.key]?'toggle-on':''} onClick={()=>toggle(item.key)}>{item.label}</button>)}</div></div></div><aside className="info-column"><MoleculeDetails data={data} selectedPart={selectedPart}/><div className="insight-card"><Sparkles size={15}/><p>Lewis bonding is inferred from total valence electrons. VSEPR shape follows the number of bonding regions and lone pairs around each center.</p></div></aside></div>{tab==='learn'&&<LearningPanel data={data} step={step} setStep={setStep} answer={answer} setAnswer={setAnswer} completeStep={reveal}/ >}{tab==='challenge'&&<ChallengePanel score={quizScore} setScore={setQuizScore} answer={quizAnswer} setAnswer={setQuizAnswer} questionIndex={questionIndex} setQuestionIndex={setQuestionIndex} answers={answers} setAnswers={setAnswers} onFinish={completeLab} progress={progress}/>}</>}
      </div>
    </div>
  </main>;
}
function SearchOverlay({open,onClose,onSelect}) {
  const [query,setQuery]=useState('');
  useEffect(()=>{if(!open)setQuery('');},[open]);
  if(!open)return null;
  const results=[...library.filter(item=>item.title.toLowerCase().includes(query.toLowerCase())),...molecules.filter(item=>item.formula.toLowerCase().includes(query.toLowerCase())).map(item=>({title:`${item.formula} · ${item.molecular}`,category:'Molecular Shapes',functional:true}))].slice(0,7);
  return <div className="search-overlay" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><div className="search-modal"><div className="search-modal-input"><Search size={19}/><input autoFocus value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search simulations and molecules…"/><button onClick={onClose}>ESC</button></div><div className="search-results"><span className="search-section-label">{query?'SEARCH RESULTS':'SUGGESTED'}</span>{results.map((item,index)=><button key={`${item.title}-${index}`} onClick={()=>{onSelect(item.functional);onClose()}}><span className="result-icon">{item.category==='Molecular Shapes'?<Atom size={17}/>:<FlaskConical size={17}/>}</span><span><b>{item.title}</b><small>{item.category}</small></span><ChevronRight size={15}/></button>)}{results.length===0&&<p className="no-results">No results. Try a topic or molecule formula.</p>}</div><div className="search-hint"><span>ESC close</span></div></div></div>;
}
export default function App() {
  const [page,setPage]=useState('home');
  const [mobileOpen,setMobileOpen]=useState(false);
  const [query,setQuery]=useState('');
  const [selectedCategory,setSelectedCategory]=useState('All topics');
  const [searchOpen,setSearchOpen]=useState(false);
  const [progress,setProgress]=useState(()=>readSaved('uniter-progress',{explored:[],bestScore:0,mastered:0,quizCount:0,correctAnswers:0,incorrectAnswers:0,completionSeconds:0}));
  const [recent,setRecent]=useState(()=>readSaved('uniter-recent',[]));
  useEffect(()=>{localStorage.setItem('uniter-progress',JSON.stringify(progress));},[progress]);
  useEffect(()=>{if(page==='home')setRecent(readSaved('uniter-recent',[]));},[page]);
  useEffect(()=>{const handle=event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();setSearchOpen(true);}if(event.key==='Escape')setSearchOpen(false);};window.addEventListener('keydown',handle);return()=>window.removeEventListener('keydown',handle);},[]);
  const openLab=()=>{setPage('lab');setRecent(readSaved('uniter-recent',[]));};
  const completeLab=(score,answers={},seconds=0)=>setProgress(current=>({...current,bestScore:Math.max(current.bestScore,score),quizCount:current.quizCount+1,correctAnswers:(current.correctAnswers||0)+Object.values(answers).filter(item=>item.correct).length,incorrectAnswers:(current.incorrectAnswers||0)+Object.values(answers).filter(item=>!item.correct).length,completionSeconds:seconds}));
  const selectSearchResult=functional=>{if(functional)openLab();else setPage('library');};
  return <div className="app-shell"><Sidebar page={page} setPage={setPage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/><div className="main-shell"><Header title={page==='home'?'Overview':page==='library'?'Simulation library':'Molecular lab'} breadcrumb={page==='home'?'Overview':page==='library'?'Library':'Molecular Geometry Explorer'} onMenu={()=>setMobileOpen(true)} onSearch={()=>setSearchOpen(true)}/>{page==='home'?<Dashboard setPage={setPage} openLab={openLab} progress={progress} recent={recent} searchTerm={query} setSearchTerm={setQuery}/>:page==='library'?<LibraryPage openLab={openLab} progress={progress} query={query} setQuery={setQuery} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}/>:<LabPage progress={progress} setProgress={setProgress} completeLab={completeLab}/>}<footer className="app-footer"><Brand compact/><span>Curiosity is the first step to discovery.</span><span>© 2026 UNITER CHEMISTRY LAB</span></footer></div><SearchOverlay open={searchOpen} onClose={()=>setSearchOpen(false)} onSelect={selectSearchResult}/></div>;
}
function MoleculeGraphBuilder({onBuild}) {
  const templates = {
    ethanol: {
      atoms:[
        {id:'a1',element:'C',position:[-1.05,0,0]},{id:'a2',element:'C',position:[.05,0,0]},{id:'a3',element:'O',position:[1.12,.12,0]},
        {id:'a4',element:'H',position:[-1.47,.85,0]},{id:'a5',element:'H',position:[-1.55,-.36,.74]},{id:'a6',element:'H',position:[-1.55,-.36,-.74]},
        {id:'a7',element:'H',position:[.05,.82,.7]},{id:'a8',element:'H',position:[.05,-.82,-.7]},{id:'a9',element:'H',position:[1.47,.83,0]},
      ],
      bonds:[['a1','a2',1],['a2','a3',1],['a3','a9',1],['a1','a4',1],['a1','a5',1],['a1','a6',1],['a2','a7',1],['a2','a8',1]],
    },
    ethene: {atoms:[{id:'a1',element:'C',position:[-.62,0,0]},{id:'a2',element:'C',position:[.62,0,0]},{id:'a3',element:'H',position:[-1.05,.83,0]},{id:'a4',element:'H',position:[-1.05,-.83,0]},{id:'a5',element:'H',position:[1.05,.83,0]},{id:'a6',element:'H',position:[1.05,-.83,0]}],bonds:[['a1','a2',2],['a1','a3',1],['a1','a4',1],['a2','a5',1],['a2','a6',1]]},
    carbonDioxide: {atoms:[{id:'a1',element:'O',position:[-1.1,0,0]},{id:'a2',element:'C',position:[0,0,0]},{id:'a3',element:'O',position:[1.1,0,0]}],bonds:[['a1','a2',2],['a2','a3',2]]},
    nitronium: {atoms:[{id:'a1',element:'O',position:[-1.18,0,0]},{id:'a2',element:'N',position:[0,0,0]},{id:'a3',element:'O',position:[1.18,0,0]}],bonds:[['a1','a2',1],['a2','a3',1]],charge:1},
    nitrogen: {atoms:[{id:'a1',element:'N',position:[-.55,0,0]},{id:'a2',element:'N',position:[.55,0,0]}],bonds:[['a1','a2',3]]},
  };
  const [atoms,setAtoms]=useState(templates.ethanol.atoms);
  const [bonds,setBonds]=useState(templates.ethanol.bonds.map(([a,b,order])=>({a,b,order})));
  const [charge,setCharge]=useState(0);
  const [bondStart,setBondStart]=useState('a1');
  const [bondEnd,setBondEnd]=useState('a2');
  const elementList=['C','H','O','N','S','P','F','Cl','Br','He','Be','B','Al','Si','Ne','Ar','As','Se','Kr','I','Xe','Sn','Sb','Te','Pb','Bi','Po','At','Rn'];
  const subscript=count=>String(count).replace(/\d/g,digit=>'₀₁₂₃₄₅₆₇₈₉'[Number(digit)]);
  const superscript=count=>String(count).replace(/\d/g,digit=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(digit)]);
  const counts=atoms.reduce((result,atom)=>({...result,[atom.element]:(result[atom.element]||0)+1}),{});
  const formulaElements=Object.keys(counts).sort((a,b)=>a==='C'?-1:b==='C'?1:a==='H'?-1:b==='H'?1:a.localeCompare(b));
  const baseFormula=formulaElements.map(element=>`${element}${counts[element]>1?subscript(counts[element]):''}`).join('');
  const suffix=charge===0?'':`${Math.abs(charge)>1?superscript(Math.abs(charge)):''}${charge>0?'⁺':'⁻'}`;
  const formula=charge===0?baseFormula:`[${baseFormula}]${suffix}`;
  const totalValenceElectrons=atoms.reduce((sum,atom)=>sum+(VALENCE_ELECTRONS[atom.element]||0),0)-charge;
  const lewis=useMemo(()=>solveLewisStructure(atoms,bonds,charge),[atoms,bonds,charge]);
  const isConnected=useMemo(()=>{
    if(atoms.length===0)return false;
    const visited=new Set([atoms[0].id]);
    const queue=[atoms[0].id];
    while(queue.length){const current=queue.shift();for(const bond of bonds){const next=bond.a===current?bond.b:bond.b===current?bond.a:null;if(next&&!visited.has(next)){visited.add(next);queue.push(next);}}}
    return visited.size===atoms.length;
  },[atoms,bonds]);
  const loadTemplate=name=>{
    const template=templates[name];
    setAtoms(template.atoms.map(atom=>({...atom})));
    setBonds(template.bonds.map(([a,b])=>({a,b,order:1})));
    setBondStart(template.atoms[0].id);setBondEnd(template.atoms[1]?.id||template.atoms[0].id);
    setCharge(template.charge||0);
  };
  const addAtom=()=>{
    const id=`a${Date.now()}${Math.floor(Math.random()*1000)}`;
    const last=atoms[atoms.length-1];
    setAtoms(current=>[...current,{id,element:'C',position:[(last?.position[0]||0)+.9,(last?.position[1]||0)+.5,0]}]);
    if(atoms.length===0)setBondStart(id);
    else setBondEnd(id);
  };
  const addBond=()=>{
    if(!bondStart||!bondEnd||bondStart===bondEnd||bonds.some(bond=>(bond.a===bondStart&&bond.b===bondEnd)||(bond.a===bondEnd&&bond.b===bondStart)))return;
    setBonds(current=>[...current,{a:bondStart,b:bondEnd,order:1}]);
  };
  const build=()=>{
    if(!lewis||!isConnected)return;
    const enrichedAtoms=atoms.map((atom,index)=>({...atom,lonePairs:lewis.atoms[index].lonePairs,formalCharge:lewis.atoms[index].formalCharge,shellElectrons:lewis.atoms[index].shellElectrons}));
    const solvedBonds=bonds.map((bond,index)=>({...bond,order:lewis.orders[index]}));
    const center=[0,1,2].map(axis=>atoms.reduce((sum,atom)=>sum+atom.position[axis],0)/Math.max(atoms.length,1));
    const manualLayout=enrichedAtoms.map(atom=>({...atom,position:atom.position.map((value,axis)=>value-center[axis])}));
    const centered=layoutVseprGraph(enrichedAtoms,solvedBonds)||manualLayout;
    const charges=centered.filter(atom=>atom.formalCharge!==0).map((atom,index)=>`${atom.element}${centered.indexOf(atom)+1} ${atom.formalCharge>0?'+':''}${atom.formalCharge}`).join(', ')||'none';
    const shellNotes=centered.filter(atom=>atom.shellElectrons!==8&&atom.element!=='H'&&atom.element!=='He').map(atom=>`${atom.element}${centered.indexOf(atom)+1}: ${atom.shellElectrons} e⁻${atom.shellElectrons<8?' (electron-deficient)': ' (expanded octet)'}`).join('; ')||'all atoms satisfy duet/octet';
    const localShapes=centered.filter(atom=>atom.element!=='H'&&atom.element!=='He').map(atom=>{const degree=solvedBonds.filter(bond=>bond.a===atom.id||bond.b===atom.id).length;const domain=localVseprDomains(atom,degree);return `${atom.element}${centered.indexOf(atom)+1}: ${domain.molecular} (${domain.electron} electron geometry)`;}).join('; ');
    onBuild({graph:{atoms:centered,bonds:solvedBonds},formula,central:'Multiple',ligands:[],lone:0,charge,valenceElectrons:lewis.totalElectrons,positions:[],lonePositions:[],electron:'Multiple centers',molecular:'Connected molecule',angle:'—',polarity:'Model estimate',note:`The model starts with ${lewis.totalElectrons} total valence electrons. Lewis formal charges: ${charges}. Shell check: ${shellNotes}. Local VSEPR shapes: ${localShapes}.`});
  };
  return <div className="graph-builder">
    <div className="graph-presets"><span>START WITH</span>{[['ethanol','Ethanol · C₂H₆O'],['ethene','Ethene · C₂H₄'],['carbonDioxide','Carbon dioxide · CO₂'],['nitronium','Nitronium · [NO₂]⁺'],['nitrogen','Nitrogen · N₂']].map(([key,label])=><button type="button" key={key} onClick={()=>loadTemplate(key)}>{label}</button>)}</div>
    <div className="graph-editor-heading"><b>Atoms <span>{atoms.length}</span></b><button type="button" disabled={atoms.length>=16} onClick={addAtom}>+ Add atom</button></div>
    <div className="graph-atom-list">{atoms.map((atom,index)=><div className="graph-atom-row" key={atom.id}><span>{index+1}</span><select aria-label={`Atom ${index+1} element`} value={atom.element} onChange={event=>setAtoms(current=>current.map(item=>item.id===atom.id?{...item,element:event.target.value}:item))}>{elementList.map(element=><option key={element}>{element}</option>)}</select><button type="button" disabled={atoms.length<=2} aria-label={`Remove atom ${index+1}`} onClick={()=>{const remaining=atoms.filter(item=>item.id!==atom.id);setAtoms(remaining);setBonds(current=>current.filter(bond=>bond.a!==atom.id&&bond.b!==atom.id));setBondStart(remaining[0]?.id||'');setBondEnd(remaining[1]?.id||remaining[0]?.id||'');}}>×</button></div>)}</div>
    <div className="graph-editor-heading"><b>Bonds <span>{bonds.length}</span></b></div>
    <div className="graph-add-bond"><label>From<select value={bondStart} onChange={event=>setBondStart(event.target.value)}>{atoms.map((atom,index)=><option key={atom.id} value={atom.id}>{index+1}. {atom.element}</option>)}</select></label><label>To<select value={bondEnd} onChange={event=>setBondEnd(event.target.value)}>{atoms.map((atom,index)=><option key={atom.id} value={atom.id}>{index+1}. {atom.element}</option>)}</select></label><button type="button" onClick={addBond} disabled={bonds.length>=20||!bondStart||!bondEnd||bondStart===bondEnd||bonds.some(bond=>(bond.a===bondStart&&bond.b===bondEnd)||(bond.a===bondEnd&&bond.b===bondStart))}>Connect atoms</button></div>
    <div className="graph-bond-list">{bonds.map((bond,index)=>{const a=atoms.find(atom=>atom.id===bond.a),b=atoms.find(atom=>atom.id===bond.b);const inferredOrder=lewis?.orders[index];return <div key={`${bond.a}-${bond.b}`}><span>{a?.element}{atoms.findIndex(atom=>atom.id===bond.a)+1} {inferredOrder===1?'—':inferredOrder===2?'═':inferredOrder===3?'≡':'?'} {b?.element}{atoms.findIndex(atom=>atom.id===bond.b)+1}</span><b>{inferredOrder?`${['','Single','Double','Triple'][inferredOrder]} · inferred`:'Unresolved'}</b><button type="button" aria-label={`Remove bond ${index+1}`} onClick={()=>setBonds(current=>current.filter((_,i)=>i!==index))}>Remove</button></div>;})}</div>
    <div className="graph-charge-row"><label>Overall charge<select value={charge} onChange={event=>setCharge(Number(event.target.value))}><option value={0}>Neutral (0)</option>{[-3,-2,-1,1,2,3].map(value=><option key={value} value={value}>{Math.abs(value)} {value>0?'positive':'negative'}</option>)}</select></label><p>{formula} · {totalValenceElectrons} valence e⁻ · {atoms.length} atoms</p></div>
    {lewis?<div className="lewis-result"><b>{lewis.searchLimitReached?'Lewis structure candidate found':'Lewis structure inferred'}</b><span>{lewis.totalElectrons} valence e⁻ · formal charges sum to {charge===0?'0':`${charge>0?'+':''}${charge}`} · bond orders optimized for stable shells{lewis.searchLimitReached?' · search limit reached; not guaranteed optimal':''}</span>{lewis.atoms.map((result,index)=><small key={atoms[index].id}>{atoms[index].element}{index+1}: {result.formalCharge===0?'formal charge 0':`formal charge ${result.formalCharge>0?'+':''}${result.formalCharge}`} · {result.lonePairs} lone pairs · {result.shellElectrons===2?'duet':result.shellElectrons<8?`${result.shellElectrons}-electron deficient shell`:result.shellElectrons===8?'octet':`${result.shellElectrons}-electron expanded shell`}</small>)}</div>:<div className="lewis-result lewis-error"><b>No closed-shell Lewis structure found</b><span>Check the overall charge, atom connections, and electron count. Odd-electron species are not modeled yet.</span></div>}
    {!isConnected&&<p className="graph-connect-warning">Connect every atom into one structure before applying it as a molecule.</p>}
    <p className="builder-guidance">Bond orders are inferred from the complete valence-electron count and formal-charge distribution. H/He follow the duet rule; B, Be and Al may be electron-deficient; period 3 and heavier atoms can use expanded shells. The output shows one Lewis resonance form where multiple equivalent forms exist.</p>
    <button className="primary-btn builder-apply" disabled={atoms.length<2||!lewis||lewis.searchLimitReached||!isConnected} onClick={build}>{lewis?.searchLimitReached?'Simplify structure to finish inference':'Apply inferred Lewis structure to 3D model'} <ChevronRight size={15}/></button>
  </div>;
}
