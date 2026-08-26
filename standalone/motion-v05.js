(() => {
  'use strict';
  const stage = document.getElementById('stage');
  const vehicles = [...document.querySelectorAll('.vehicle')];
  const copies = [...document.querySelectorAll('.copy')];
  const dots = [...document.querySelectorAll('[data-go]')];
  const read = document.getElementById('read');
  const status = document.getElementById('status');
  const dragLabel = document.getElementById('dragLabel');
  const sceneMark = document.getElementById('sceneMark');
  const max = vehicles.length - 1;
  const clamp = (v,a,b) => Math.min(b, Math.max(a,v));
  const mix = (a,b,t) => a + (b-a)*t;
  const easeOut = t => 1 - Math.pow(1-clamp(t,0,1), 3);

  let p=0, dragging=false, inertia=true, parallax=true;
  let startX=0, startP=0, lastX=0, lastT=0, velocity=0, raf=0;

  function pose(index){
    if (p >= max - 0.0001) return index === max ? {x:0,y:0,s:1,r:0,o:1} : {x:-108,y:0,s:.84,r:0,o:0};
    const seg = Math.min(max-1, Math.floor(clamp(p,0,max-0.0001)));
    const local = p-seg;
    const e = easeOut(local);
    if(index===seg) return {x:mix(0,-80,e),y:parallax?mix(0,-12,e):0,s:mix(1,.88,e),r:parallax?mix(0,-.8,e):0,o:mix(1,.18,e)};
    if(index===seg+1){ const d=easeOut(clamp((local-.05)/.95,0,1)); return {x:mix(76,0,d),y:parallax?mix(18,0,d):0,s:mix(.9,1,d),r:parallax?mix(.8,0,d):0,o:mix(.20,1,d)}; }
    if(index<seg) return {x:-108,y:0,s:.84,r:0,o:0};
    return {x:108,y:0,s:.84,r:0,o:0};
  }

  function render(){
    const active=clamp(Math.round(p),0,max);
    read.textContent=`${p.toFixed(3)} / ${max}`;
    sceneMark.textContent=String(active+1).padStart(2,'0');
    vehicles.forEach((el,i)=>{
      const q=pose(i);
      el.style.transform=`translate3d(calc(-50% + ${q.x}vw), calc(-50% + ${q.y}px), 0) scale(${q.s}) rotate(${q.r}deg)`;
      el.style.opacity=String(q.o);
      el.style.zIndex=String(40-Math.round(Math.abs(i-p)*3));
      const w=clamp(1-Math.abs(p-i),0,1);
      copies[i].style.opacity=String(w);
      copies[i].style.transform=`translate3d(0, ${(1-w)*22}px, 0)`;
      dots[i].classList.toggle('on', i===active);
    });
  }

  function go(target){
    cancelAnimationFrame(raf);
    const from=p, to=clamp(target,0,max), t0=performance.now(), duration=760;
    function step(now){
      const t=clamp((now-t0)/duration,0,1);
      const e=1-Math.pow(1-t,4);
      p=mix(from,to,e); render();
      if(t<1) raf=requestAnimationFrame(step);
    }
    raf=requestAnimationFrame(step);
  }

  function release(event){
    if(!dragging) return;
    dragging=false; stage.classList.remove('is-dragging'); dragLabel.textContent='Drag';
    if(event && stage.hasPointerCapture && stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    const projected=p+(inertia ? -velocity*.82 : 0);
    go(Math.round(clamp(projected,0,max)));
  }

  stage.addEventListener('pointerdown', event=>{
    if(event.target.closest('button')) return;
    if(event.pointerType==='mouse' && event.button!==0) return;
    cancelAnimationFrame(raf);
    stage.setPointerCapture(event.pointerId);
    dragging=true; stage.classList.add('is-dragging'); dragLabel.textContent='Release';
    startX=lastX=event.clientX; startP=p; lastT=performance.now(); velocity=0;
    event.preventDefault();
  });
  stage.addEventListener('pointermove', event=>{
    if(!dragging) return;
    const width=Math.max(stage.clientWidth*.58,340), now=performance.now(), dt=Math.max(1,now-lastT);
    p=clamp(startP-(event.clientX-startX)/width,0,max);
    velocity=(event.clientX-lastX)/dt; lastX=event.clientX; lastT=now;
    render(); event.preventDefault();
  });
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  window.addEventListener('blur', ()=>release());

  document.getElementById('prev').addEventListener('click',()=>go(Math.round(p)-1));
  document.getElementById('next').addEventListener('click',()=>go(Math.round(p)+1));
  document.getElementById('reset').addEventListener('click',()=>go(0));
  document.getElementById('inertia').addEventListener('click',e=>{inertia=!inertia;e.currentTarget.classList.toggle('on',inertia)});
  document.getElementById('parallax').addEventListener('click',e=>{parallax=!parallax;e.currentTarget.classList.toggle('on',parallax);render()});
  dots.forEach(button=>button.addEventListener('click',()=>go(Number(button.dataset.go))));

  let loaded=0, failed=0;
  const images=[...document.querySelectorAll('.vehicle img')];
  const updateAssets=()=>{ status.textContent=failed?`IMG ERROR ${failed} · ${loaded}/${images.length}`:`JS OK · IMG ${loaded}/${images.length}`; status.className=`status ${failed?'bad':loaded===images.length?'ok':''}`; };
  images.forEach(img=>{
    if(img.complete){ img.naturalWidth ? loaded++ : failed++; updateAssets(); }
    else { img.addEventListener('load',()=>{loaded++;updateAssets()},{once:true}); img.addEventListener('error',()=>{failed++;updateAssets()},{once:true}); }
  });
  status.textContent='JS OK · checking images';
  render();
})();
