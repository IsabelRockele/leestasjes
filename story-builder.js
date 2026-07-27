(function(){
  const source=window.BONUS_MISSION || getJefPoesSource();
  if(!source || !source.image || !source.tasks || source.tasks.length<4) return;

  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='story-builder.css?v=9';
  document.head.appendChild(css);

  const emptyPictures={
    'assets/games/noor-bal-missie.webp':'assets/games/builder-noor-bal-empty.png',
    'assets/games/jef-poes-zoekplaat.webp':'assets/games/builder-jef-poes-empty.png',
    'assets/games/jef-bos-missie.webp':'assets/games/builder-jef-bos-empty.png',
    'assets/games/nore-schatkaart-missie.webp':'assets/games/builder-nore-schatkaart-empty.png',
    'assets/games/nore-sleutel-missie.webp':'assets/games/builder-nore-sleutel-empty.png',
    'assets/games/jef-bosspeurtocht-missie.webp':'assets/games/builder-jef-bosspeurtocht-empty.png',
    'assets/games/jef-brandweer-missie.webp':'assets/games/builder-jef-brandweer-empty.png',
    'assets/games/nore-molen-missie.webp':'assets/games/builder-nore-molen-empty.png',
    'assets/games/jef-zee-missie.webp':'assets/games/builder-jef-zee-empty.png',
    'assets/games/nore-tijdcapsule-missie.webp':'assets/games/builder-nore-tijdcapsule-empty.png',
    'assets/games/jef-bosklassen-missie.webp':'assets/games/builder-jef-bosklassen-empty.png',
    'assets/games/nore-verhaal-missie.webp':'assets/games/builder-nore-verhaal-empty.png'
  };
  const emptyImage=emptyPictures[source.image];
  if(!emptyImage) return;

  const page=decodeURIComponent(location.pathname.split('/').pop());
  const specialPlaces={
    'spelletjes_noor_en_de_bal_M3.html':{
      noor:'links voor de houten omheining',
      bas:'rechts van Noor, voor de houten omheining',
      bal:'onder Bas, in het gras',
      emmer:'helemaal rechts onderaan, voor de bloemenstruik',
      bloem:'onderaan bij de grote boom'
    },
    'spelletjes_jef_en_de_poes_M3.html':{
      jef:'links op het tuinpad, onder de vlinder',
      vlinder:'boven Jef, voor de blauwe lucht',
      poes:'rechts van Jef, voor de huisdeur',
      deur:'rechts bovenaan, in de stenen huismuur',
      gieter:'helemaal rechts onderaan, naast de huisdeur'
    },
    'spelletjes_jef_en_het_bos_E3.html':{
      jef:'rechts vooraan op het bospad, voor de mossige boomstam',
      tuur:'links vooraan op het bospad, naast de grote boomstam',
      juf:'midden achteraan op het bospad',
      eekhoorn:'links tegen de grote boom'
    },
    'spelletjes_nore_en_de_schatkaart_E3.html':{
      nore:'links van het stenen pad, voor de haag',
      bas:'vlak links van het stenen pad, voor de haag',
      kaart:'in de handen van Nore'
    },
    'spelletjes_nore_en_de_geheime_sleutel_M4.html':{
      sleutel:'in het lage, brede vak op de lichtstraal onderaan',
      kist:'in het grote vak onderaan, rechts van het midden',
      knikker:'in het kleinste vak helemaal onderaan, links',
      foto:'in het vak rechts van de kist',
      deken:'in het grote vak helemaal links onderaan',
      klok:'in het kleine vak rechts bovenaan',
      vaas:'in het hoge vak rechts onder de klok'
    }
  };
  const match=page.match(/_(M3|E3|M4|E4|M5|E5)\.html$/i);
  const level=match ? match[1].toUpperCase() : 'M4';
  const eligible=source.tasks.filter(task=>!['boom','mos','vijver'].includes(task.target));
  const desiredCount={M3:5,E3:6,M4:7,E4:7,M5:6,E5:6}[level] || 6;
  const chosen=eligible.slice(0,Math.min(desiredCount,eligible.length));
  const rounds=chosen.map(task=>[task]);

  const card=document.createElement('div');
  card.className='game-card builder-card';
  card.innerHTML='<div class="peel"></div><span class="icon">🖼️</span>'+
    '<h3>Bouw het verhaal</h3><p>Lees, sleep en maak de prent</p>';
  card.addEventListener('click',openBuilder);
  document.querySelector('.card-grid').appendChild(card);

  const screen=document.createElement('div');
  screen.id='game-story-builder';
  screen.className='screen';
  screen.innerHTML='<div class="topbar">'+
    '<button class="back-btn builder-back">←</button><h2>🖼️ Bouw het verhaalplaatje</h2></div>'+
    '<div class="progress-dots" id="builder-dots"></div>'+
    '<div class="builder-wrap">'+
      '<div class="builder-prompt"><div class="builder-prompt-text"></div>'+
      '<button class="builder-listen" type="button" aria-label="Luister naar de opdracht">🔊</button></div>'+
      '<div class="builder-stage"><img src="'+emptyImage+'" alt="Lege scène uit het verhaal"></div>'+
      '<div class="builder-bank" aria-label="Beeldstickers"></div>'+
      '<div class="builder-feedback" aria-live="polite"></div>'+
      '<div class="builder-actions"><button class="btn secondary builder-hint">💡 Help mij</button>'+
      '<button class="btn secondary builder-reset">Opnieuw</button></div>'+
    '</div>';
  document.body.insertBefore(screen,document.querySelector('script'));

  const stage=screen.querySelector('.builder-stage');
  const bank=screen.querySelector('.builder-bank');
  const prompt=screen.querySelector('.builder-prompt-text');
  const feedback=screen.querySelector('.builder-feedback');
  let roundIndex=0,selected=null,placed=0,drag=null,pendingDrag=null;

  screen.querySelector('.builder-back').addEventListener('click',function(){
    if('speechSynthesis' in window) speechSynthesis.cancel();
    screen.classList.remove('active');
    document.getElementById('hub').classList.add('active');
  });
  screen.querySelector('.builder-listen').addEventListener('click',function(){
    if(typeof window.speakText==='function') window.speakText(prompt.textContent,this);
  });
  screen.querySelector('.builder-hint').addEventListener('click',showHint);
  screen.querySelector('.builder-reset').addEventListener('click',resetBuilder);

  function openBuilder(){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    screen.classList.add('active');
    resetBuilder();
  }

  function resetBuilder(){
    roundIndex=0;
    buildScene();
    loadRound();
  }

  function buildScene(){
    stage.querySelectorAll('.builder-zone').forEach(z=>z.remove());
    bank.innerHTML='';
    chosen.forEach(makeZone);
    shuffleCopy(chosen).forEach(makePiece);
  }

  function loadRound(){
    selected=null; placed=0;
    feedback.textContent='';
    feedback.className='builder-feedback';
    renderDots('builder-dots',rounds.length,roundIndex);
    if(roundIndex>=rounds.length){
      prompt.textContent='Je verhaalplaatje is klaar!';
      feedback.innerHTML='<div class="end-card"><div class="stars">🖼️⭐🎉</div><h2>Knap gebouwd!</h2>'+
        '<p>Alle figuren en voorwerpen staan weer op hun plek.</p>'+
        '<div class="action-row"><button class="btn builder-again">Nog eens</button></div></div>';
      screen.querySelector('.builder-actions').style.display='none';
      feedback.querySelector('.builder-again').addEventListener('click',resetBuilder);
      if(typeof window.celebrate==='function') celebrate();
      return;
    }
    screen.querySelector('.builder-actions').style.display='flex';
    const tasks=rounds[roundIndex];
    prompt.textContent=makeInstruction(tasks);
    const current=new Set(tasks.map(t=>t.target));
    stage.querySelectorAll('.builder-zone:not(.filled)').forEach(zone=>{
      const active=current.has(zone.dataset.target);
      zone.disabled=false;
      zone.classList.toggle('waiting',!active);
    });
    bank.querySelectorAll('.builder-piece:not(.placed)').forEach(piece=>{
      const active=current.has(piece.dataset.target);
      piece.disabled=!active;
      piece.classList.toggle('waiting',!active);
    });
  }

  function makeZone(task,index){
    const zone=document.createElement('button');
    zone.type='button';
    zone.className='builder-zone';
    zone.dataset.target=task.target;
    zone.setAttribute('aria-label','Plek voor '+label(task.target));
    zone.style.cssText='left:'+task.x+'%;top:'+task.y+'%;width:'+task.w+'%;height:'+task.h+'%';
    zone.addEventListener('click',function(){ if(selected) tryPlace(selected,zone); });
    stage.appendChild(zone);
  }

  function makePiece(task){
    const piece=document.createElement('button');
    piece.type='button';
    piece.className='builder-piece';
    piece.dataset.target=task.target;
    piece.setAttribute('aria-label',label(task.target)+' verplaatsen');
    applySticker(piece,task,false);
    piece.innerHTML='<span>'+escapeHtml(label(task.target))+'</span>';
    piece.addEventListener('click',function(){
      if(piece.classList.contains('placed')) return;
      bank.querySelectorAll('.builder-piece').forEach(p=>p.classList.remove('selected'));
      stage.querySelectorAll('.builder-zone').forEach(z=>z.classList.remove('ready'));
      selected=selected===piece ? null : piece;
      if(selected){
        piece.classList.add('selected');
        stage.querySelectorAll('.builder-zone:not(.filled)').forEach(z=>z.classList.add('ready'));
        feedback.textContent='Tik nu op de juiste plek in de prent.';
      }else feedback.textContent='';
    });
    piece.addEventListener('pointerdown',startDrag);
    bank.appendChild(piece);
  }

  function startDrag(event){
    const piece=event.currentTarget;
    if(piece.classList.contains('placed') || event.pointerType==='mouse' && event.button!==0) return;
    const rect=piece.getBoundingClientRect();
    pendingDrag={piece,startX:event.clientX,startY:event.clientY,rect};
    piece.setPointerCapture(event.pointerId);
    piece.addEventListener('pointermove',moveDrag);
    piece.addEventListener('pointerup',endDrag,{once:true});
    piece.addEventListener('pointercancel',endDrag,{once:true});
  }

  function moveDrag(event){
    if(!pendingDrag && !drag) return;
    if(!drag){
      const distance=Math.hypot(event.clientX-pendingDrag.startX,event.clientY-pendingDrag.startY);
      if(distance<8) return;
      const p=pendingDrag;
      drag={piece:p.piece,home:p.piece.parentNode,next:p.piece.nextSibling,
        dx:p.startX-p.rect.left,dy:p.startY-p.rect.top};
      pendingDrag=null;
      drag.piece.style.width=p.rect.width+'px';
      drag.piece.style.height=p.rect.height+'px';
      drag.piece.classList.add('dragging');
    }
    event.preventDefault();
    drag.piece.style.left=(event.clientX-drag.dx)+'px';
    drag.piece.style.top=(event.clientY-drag.dy)+'px';
    stage.querySelectorAll('.builder-zone:not(.filled)').forEach(z=>z.classList.add('ready'));
  }

  function endDrag(event){
    if(!drag){
      if(pendingDrag) pendingDrag.piece.removeEventListener('pointermove',moveDrag);
      pendingDrag=null;
      return;
    }
    const current=drag;
    current.piece.removeEventListener('pointermove',moveDrag);
    const droppedRect=current.piece.getBoundingClientRect();
    current.piece.classList.remove('dragging');
    current.piece.style.left=current.piece.style.top=current.piece.style.width=current.piece.style.height='';
    current.home.insertBefore(current.piece,current.next);
    const zones=[...stage.querySelectorAll('.builder-zone:not(.filled)')];
    const candidates=zones.map(z=>{
      const r=z.getBoundingClientRect();
      const fingerInside=event.clientX>=r.left-12 && event.clientX<=r.right+12 &&
        event.clientY>=r.top-12 && event.clientY<=r.bottom+12;
      const overlapWidth=Math.max(0,Math.min(droppedRect.right,r.right)-Math.max(droppedRect.left,r.left));
      const overlapHeight=Math.max(0,Math.min(droppedRect.bottom,r.bottom)-Math.max(droppedRect.top,r.top));
      const overlap=overlapWidth*overlapHeight;
      const smallestArea=Math.min(droppedRect.width*droppedRect.height,r.width*r.height);
      const overlapPart=smallestArea ? overlap/smallestArea : 0;
      return {zone:z,score:(fingerInside?2:0)+overlapPart,accepted:fingerInside||overlapPart>=.18};
    }).filter(item=>item.accepted).sort((a,b)=>b.score-a.score);
    const correctCandidate=candidates.find(item=>item.zone.dataset.target===current.piece.dataset.target);
    const zone=correctCandidate ? correctCandidate.zone : (candidates.length ? candidates[0].zone : null);
    drag=null;
    if(zone) tryPlace(current.piece,zone);
    else stage.querySelectorAll('.builder-zone').forEach(z=>z.classList.remove('ready'));
  }

  function tryPlace(piece,zone){
    stage.querySelectorAll('.builder-zone').forEach(z=>z.classList.remove('ready'));
    bank.querySelectorAll('.builder-piece').forEach(p=>p.classList.remove('selected'));
    selected=null;
    if(piece.dataset.target===zone.dataset.target){
      const task=chosen.find(t=>t.target===piece.dataset.target);
      if(task) applySticker(zone,task,true);
      zone.classList.add('filled');
      piece.classList.add('placed');
      piece.disabled=true;
      placed++;
      feedback.textContent='Juist! Dat stukje staat goed. 👍';
      feedback.className='builder-feedback good';
      if(placed===rounds[roundIndex].length){
        feedback.textContent='Het plaatje klopt! Goed gelezen. 🎉';
        if(typeof window.celebrate==='function') celebrate();
        setTimeout(function(){roundIndex++;loadRound();},1250);
      }
    }else{
      zone.classList.remove('oops');
      void zone.offsetWidth;
      zone.classList.add('oops');
      feedback.textContent='Dat stukje hoort niet op deze plek. Probeer opnieuw.';
      feedback.className='builder-feedback bad';
      setTimeout(()=>zone.classList.remove('oops'),650);
    }
  }

  function showHint(){
    const piece=[...bank.querySelectorAll('.builder-piece:not(.placed):not(.waiting)')][0];
    if(!piece) return;
    const zone=stage.querySelector('.builder-zone[data-target="'+cssEscape(piece.dataset.target)+'"]');
    piece.classList.add('selected');
    zone.classList.add('hint');
    feedback.textContent='Kijk naar de plek die knippert. Daar hoort '+label(piece.dataset.target)+'.';
    feedback.className='builder-feedback';
    setTimeout(function(){piece.classList.remove('selected');zone.classList.remove('hint');},2600);
  }

  function makeInstruction(tasks){
    return tasks.map(t=>{
      const place=(specialPlaces[page]||{})[t.target];
      if(place) return 'Zet '+article(t.target)+' '+label(t.target)+' '+place+'.';
      if(roundIndex>0){
        const reference=findNearbyReference(t);
        if(reference) return relativeInstruction(t,reference);
      }
      return 'Zet '+article(t.target)+' '+label(t.target)+' in '+zoneDescription(t)+'.';
    }).join(' ');
  }

  function findNearbyReference(current){
    const placedTasks=chosen.slice(0,roundIndex);
    let best=null,bestDistance=Infinity;
    placedTasks.forEach(previous=>{
      const currentX=current.x+current.w/2,currentY=current.y+current.h/2;
      const previousX=previous.x+previous.w/2,previousY=previous.y+previous.h/2;
      const centerDistance=Math.hypot(currentX-previousX,currentY-previousY);
      const horizontalGap=Math.max(0,current.x-(previous.x+previous.w),previous.x-(current.x+current.w));
      const verticalGap=Math.max(0,current.y-(previous.y+previous.h),previous.y-(current.y+current.h));
      const edgeDistance=Math.hypot(horizontalGap,verticalGap);
      if(centerDistance<=30 && edgeDistance<=12 && centerDistance<bestDistance){
        best=previous;
        bestDistance=centerDistance;
      }
    });
    return best;
  }

  function relativeInstruction(current,previous){
    const currentX=current.x+current.w/2,currentY=current.y+current.h/2;
    const previousX=previous.x+previous.w/2,previousY=previous.y+previous.h/2;
    const dx=currentX-previousX,dy=currentY-previousY;
    const previousName=(article(previous.target)+' '+label(previous.target)).trim();
    let relation;
    if(Math.abs(dx)>=7){
      relation=(dx>0?'rechts van ':'links van ')+previousName;
      if(Math.abs(dy)>=14) relation+=' en wat '+(dy>0?'lager':'hoger');
    }else{
      relation=(dy>0?'onder ':'boven ')+previousName;
    }
    return 'Zet '+article(current.target)+' '+label(current.target)+' '+relation+'.';
  }

  function zoneDescription(t){
    const cx=t.x+t.w/2,cy=t.y+t.h/2;
    const ratio=t.w/t.h,area=t.w*t.h;
    const size=area<115?'kleine ':area>500?'grote ':'';
    const shape=ratio>1.55?'lage, brede ':ratio<0.68?'hoge, smalle ':'';
    const horizontal=cx<22?'helemaal links':cx<42?'links van het midden':
      cx<58?'in het midden':cx<78?'rechts van het midden':'helemaal rechts';
    const vertical=cy<27?'bovenaan':cy<50?'boven het midden':cy<72?'onder het midden':'onderaan';
    return 'het '+size+shape+'vak '+horizontal+', '+vertical;
  }

  function placePhrase(t){
    const cx=t.x+t.w/2,cy=t.y+t.h/2;
    const horizontal=cx<34?'links':cx>66?'rechts':'in het midden';
    const vertical=cy<35?'bovenaan':cy>69?'onderaan':'';
    return vertical ? horizontal+' '+vertical : horizontal;
  }

  function applySticker(element,t,isZone){
    element.style.backgroundImage='url("'+stickerPath(t.target)+'")';
    element.style.backgroundSize='contain';
    element.style.backgroundPosition='center';
    element.style.backgroundRepeat='no-repeat';
  }

  function stickerPath(target){
    const sourceName=source.image.split('/').pop().replace(/\.[^.]+$/,'').toLowerCase().replace(/[^a-z0-9_-]+/g,'-');
    const targetName=String(target).toLowerCase().replace(/[^a-z0-9_-]+/g,'-');
    return 'assets/builder-cutouts/'+sourceName+'/'+targetName+'.png';
  }

  function label(word){
    const value=String(word).replace(/[-_]/g,' ');
    return /^(jef|noor|nore|bas|tuur|sven|juf|oma)$/i.test(value)
      ? value.charAt(0).toUpperCase()+value.slice(1)
      : value;
  }
  function article(word){
    return /^(jef|noor|nore|bas|tuur|sven|juf|oma|molenaar)$/i.test(word)?'':(/\b(deur|boom|bal|kaart|kist|bank|bloem|munt|veer|brug|slang|ladder|brief|foto|lamp|hut|pen|sleutel|knikker|poes|roos|vis|fles|krab|schelp|vlag|boot|plank|zak|klok|vaas|gieter)\b/i.test(word)?'de':'het');
  }
  function shuffleCopy(items){
    const copy=items.slice();
    for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
    return copy;
  }
  function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function cssEscape(value){return window.CSS&&CSS.escape?CSS.escape(value):String(value).replace(/"/g,'\\"');}

  function getJefPoesSource(){
    if(!/spelletjes_jef_en_de_poes_M3\.html$/i.test(location.pathname)) return null;
    return {image:'assets/games/jef-poes-zoekplaat.webp',alt:'Jef en de poes in de tuin',tasks:[
      {target:'boom',x:0,y:0,w:24,h:72},{target:'jef',x:20,y:12,w:24,h:62},
      {target:'vlinder',x:42,y:13,w:8,h:14},{target:'poes',x:46,y:40,w:20,h:34},
      {target:'deur',x:65,y:0,w:24,h:59},{target:'gieter',x:81,y:57,w:18,h:28}
    ]};
  }
})();
