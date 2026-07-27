(function(){
  const storyImages={
    "jef-poes":"assets/games/jef-poes-zoekplaat.webp",
    "noor-bal":"assets/games/noor-bal-missie.webp",
    "jef-bos":"assets/games/jef-bos-missie.webp",
    "nore-schatkaart":"assets/games/nore-schatkaart-missie.webp",
    "jef-speurtocht":"assets/games/jef-bosspeurtocht-missie.webp",
    "nore-sleutel":"assets/games/nore-sleutel-missie.webp",
    "jef-brandweer":"assets/games/jef-brandweer-missie.webp",
    "nore-molen":"assets/games/nore-molen-missie.webp",
    "jef-zee":"assets/games/jef-zee-missie.webp",
    "nore-tijdscapsule":"assets/games/nore-tijdcapsule-missie.webp",
    "jef-bosklassen":"assets/games/jef-bosklassen-missie.webp",
    "nore-verhaal":"assets/games/nore-verhaal-missie.webp"
  };
  const story=document.body.dataset.story;
  const image=storyImages[story];
  const game=document.getElementById('game-sentence');
  if(!game || !image || typeof checkSentence!=='function') return;

  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='sentence-puzzle-helper.css';
  document.head.appendChild(css);

  const support=document.createElement('div');
  support.className='sentence-support';
  support.innerHTML=`<img src="${image}" alt="Prent bij het verhaal">`;
  const prompt=game.querySelector('.prompt-box');
  prompt.insertAdjacentElement('afterend',support);

  const tipButton=document.createElement('button');
  tipButton.type='button';
  tipButton.className='btn sentence-tip-btn';
  tipButton.textContent='💡 Zet het eerste woord';
  tipButton.hidden=true;
  tipButton.onclick=giveSentenceTip;
  game.querySelector('.action-row').prepend(tipButton);

  let resetTimer=null;
  const originalLoadSentence=loadSentence;
  loadSentence=function(){
    if(resetTimer){clearTimeout(resetTimer);resetTimer=null;}
    originalLoadSentence();
    tipButton.hidden=true;
    tipButton.disabled=false;
  };

  checkSentence=function(){
    const slots=[...document.querySelectorAll('#sentence-slots .slot')];
    if(slots.some(s=>!s.firstChild)) return;
    const attempt=slots.map(s=>s.firstChild.textContent).join(' ')+'.';
    const fb=document.getElementById('sentence-feedback');
    if(attempt===sentences[sIndex]){
      fb.textContent='Goed zo! 🎉';
      fb.className='feedback good';
      celebrate();
      slots.forEach(s=>s.firstChild.dataset.locked='1');
      tipButton.hidden=true;
      setTimeout(()=>{
        sIndex++;
        if(sIndex<sentences.length){
          loadSentence();
        }else{
          fb.textContent='Alle zinnen gelukt! Je bent een echte leesheld! 🦓⭐';
          renderDots('sentence-dots',sentences.length,sentences.length);
        }
      },1100);
    }else{
      fb.textContent='Nog niet juist. Alle woorden gaan terug naar beneden.';
      fb.className='feedback bad';
      slots.forEach(s=>s.firstChild.dataset.locked='1');
      tipButton.hidden=false;
      resetTimer=setTimeout(()=>{
        returnSentenceWords();
        fb.textContent='Probeer opnieuw of vraag een tip.';
        resetTimer=null;
      },700);
    }
  };

  function returnSentenceWords(){
    const bank=document.getElementById('sentence-bank');
    const slots=[...document.querySelectorAll('#sentence-slots .slot')];
    const chips=[...document.querySelectorAll('#sentence-slots .chip, #sentence-bank .chip')];
    shuffle(chips).forEach(chip=>{
      chip.classList.remove('placed');
      delete chip.dataset.locked;
      bank.appendChild(chip);
    });
    slots.forEach(slot=>slot.classList.remove('filled'));
  }

  function giveSentenceTip(){
    if(resetTimer){clearTimeout(resetTimer);resetTimer=null;}
    returnSentenceWords();
    const firstWord=sentences[sIndex].replace(/\.$/,'').split(' ')[0];
    const chip=[...document.querySelectorAll('#sentence-bank .chip')].find(c=>c.textContent===firstWord);
    const firstSlot=document.querySelector('#sentence-slots .slot');
    if(!chip || !firstSlot) return;
    firstSlot.appendChild(chip);
    firstSlot.classList.add('filled');
    chip.classList.add('placed');
    chip.dataset.locked='1';
    tipButton.disabled=true;
    const fb=document.getElementById('sentence-feedback');
    fb.textContent='Tip: het eerste woord staat al goed.';
    fb.className='feedback good';
  }
})();
