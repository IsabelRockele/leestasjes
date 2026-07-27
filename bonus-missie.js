(function(){
  const game=window.BONUS_MISSION;
  if(!game) return;

  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='bonus-missie.css';
  document.head.appendChild(css);

  const card=document.createElement('div');
  card.className='game-card bonus-mission-card';
  card.innerHTML=`<div class="peel"></div><span class="icon">${game.icon||'🔎'}</span>
    <h3>${game.cardTitle}</h3><p>${game.cardText}</p>`;
  card.onclick=openBonusMission;
  document.querySelector('.card-grid').appendChild(card);

  const screen=document.createElement('div');
  screen.id='game-bonus-mission';
  screen.className='screen';
  screen.innerHTML=`<div class="topbar">
      <button class="back-btn" id="bonus-back">←</button>
      <h2>${game.icon||'🔎'} ${game.title}</h2>
    </div>
    <div class="progress-dots" id="bonus-dots"></div>
    <div class="bonus-wrap">
      <div class="bonus-prompt">
        <div class="bonus-prompt-text" id="bonus-prompt"></div>
        ${game.listen?'<button class="bonus-listen" id="bonus-listen" aria-label="Luister naar de opdracht" title="Luister">🔊</button>':''}
      </div>
      <div class="bonus-scene" id="bonus-scene">
        <img src="${game.image}" alt="${game.alt}">
      </div>
      <div class="feedback" id="bonus-feedback" aria-live="polite"></div>
      <div class="bonus-actions">
        <button class="btn secondary" id="bonus-hint">Geef een tip</button>
        <button class="btn secondary" id="bonus-reset">Opnieuw</button>
      </div>
    </div>`;
  document.body.insertBefore(screen,document.querySelector('script'));

  const scene=screen.querySelector('#bonus-scene');
  game.tasks.forEach(task=>{
    const b=document.createElement('button');
    b.className='bonus-target';
    b.dataset.target=task.target;
    b.setAttribute('aria-label',task.label||task.target);
    b.style.cssText=`left:${task.x}%;top:${task.y}%;width:${task.w}%;height:${task.h}%`;
    b.onclick=()=>chooseBonusTarget(task.target,b);
    scene.appendChild(b);
  });

  let tasks=[],index=0,mistakes=0;
  function openBonusMission(){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    screen.classList.add('active');
    initBonusMission();
  }
  function initBonusMission(){
    tasks=shuffle(game.tasks);
    index=0;mistakes=0;
    screen.querySelectorAll('.bonus-target').forEach(b=>{
      b.classList.remove('correct','clue','oops');
      b.disabled=false;
    });
    loadBonusTask();
  }
  function loadBonusTask(){
    renderDots('bonus-dots',tasks.length,index);
    const prompt=screen.querySelector('#bonus-prompt');
    const feedback=screen.querySelector('#bonus-feedback');
    screen.querySelectorAll('.bonus-target').forEach(b=>b.classList.remove('correct','clue','oops'));
    feedback.textContent='';
    feedback.className='feedback';
    mistakes=0;
    if(index>=tasks.length){
      prompt.textContent=game.endText||'Missie volbracht!';
      feedback.textContent=game.endFeedback||'Alles gevonden. Wat knap! ⭐';
      feedback.className='feedback good';
      const listen=screen.querySelector('#bonus-listen');
      if(listen) listen.disabled=true;
      renderDots('bonus-dots',tasks.length,tasks.length);
      celebrate();
      return;
    }
    const listen=screen.querySelector('#bonus-listen');
    if(listen) listen.disabled=false;
    prompt.textContent=tasks[index].text;
  }
  function chooseBonusTarget(target,button){
    if(index>=tasks.length) return;
    const task=tasks[index];
    const feedback=screen.querySelector('#bonus-feedback');
    if(target===task.target){
      button.classList.add('correct');
      button.disabled=true;
      feedback.textContent=game.goodText||'Ja, gevonden! 🎉';
      feedback.className='feedback good';
      celebrate();
      index++;
      setTimeout(loadBonusTask,850);
    }else{
      mistakes++;
      button.classList.remove('oops');
      void button.offsetWidth;
      button.classList.add('oops');
      feedback.textContent=mistakes>=2?task.hint:'Kijk nog eens goed.';
      feedback.className='feedback bad';
      if(mistakes>=2) showBonusHint();
    }
  }
  function showBonusHint(){
    if(index>=tasks.length) return;
    const task=tasks[index];
    const target=screen.querySelector(`.bonus-target[data-target="${task.target}"]`);
    const feedback=screen.querySelector('#bonus-feedback');
    feedback.textContent=task.hint;
    feedback.className='feedback bad';
    target.classList.remove('clue');
    void target.offsetWidth;
    target.classList.add('clue');
    setTimeout(()=>target.classList.remove('clue'),2600);
  }
  screen.querySelector('#bonus-back').onclick=()=>{
    if('speechSynthesis' in window) window.speechSynthesis.cancel();
    goHub();
  };
  screen.querySelector('#bonus-hint').onclick=showBonusHint;
  screen.querySelector('#bonus-reset').onclick=initBonusMission;
  const listen=screen.querySelector('#bonus-listen');
  if(listen) listen.onclick=()=>{
    if(index<tasks.length && typeof speakText==='function') speakText(tasks[index].text,listen);
  };
  window.openBonusMission=openBonusMission;
})();
