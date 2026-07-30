(function(){
  const file=decodeURIComponent(location.pathname.split('/').pop());
  const games={
    'spelletjes_noor_en_de_bal_M3.html':set('noor-bal',[
      ['tuin','de tuin'],['bal','de bal'],['hond','de hond'],['gras','het gras'],
      ['geel','geel'],['boom','de boom'],['zoen','de zoen'],['rolt','rolt'],['blij','blij']
    ]),
    'spelletjes_jef_en_de_poes_M3.html':set('jef-poes',[
      ['huis','het huis'],['vis','de vis'],['poes','de poes'],['moe','moe'],
      ['eet','eet'],['deur','de deur'],['kijkt','kijkt']
    ]),
    'spelletjes_jef_en_het_bos_E3.html':set('jef-bos',[
      ['eekhoorn','de eekhoorn'],['blaadjes','de blaadjes'],['mos','het mos'],
      ['bos','het bos'],['konijn','het konijn'],['nest','het nest'],
      ['struik','de struik'],['fluiten','fluiten'],['tak','de tak']
    ]),
    'spelletjes_nore_en_de_schatkaart_E3.html':set('nore-schatkaart',[
      ['kaart','de kaart'],['briefje','het briefje'],['haag','de haag'],
      ['bank','de bank'],['doosje','het doosje'],['muntje','het muntje'],
      ['steentjes','de steentjes'],['grond','de grond'],['glimt','glimt']
    ]),
    'spelletjes_jef_op_bosspeurtocht_M4.html':set('jef-speurtocht',[
      ['speurtocht','de speurtocht'],['symbool','het symbool'],['kastanje','de kastanje'],
      ['paddenstoel','de paddenstoel'],['boomstronk','de boomstronk'],
      ['vogelveertje','het vogelveertje'],['mos','het mos'],['aarde','de aarde'],
      ['gouden ster','de gouden ster']
    ]),
    'spelletjes_nore_en_de_geheime_sleutel_M4.html':set('nore-sleutel',[
      ['hangslotje','het hangslotje'],['roestig','roestig'],['snuffelt','snuffelt'],
      ['ketting','de ketting'],['sleutel','de sleutel'],['tuinhuisje','het tuinhuisje'],
      ['spinnenweb','het spinnenweb'],['knikker','de knikker'],['hangertje','het hangertje']
    ]),
    'spelletjes_jef_bij_de_brandweer_E4.html':set('jef-brandweer',[
      ['brandweerwagen','de brandweerwagen'],['alarm','het alarm'],
      ['waterslang','de waterslang'],['kazerne','de kazerne'],['sirene','de sirene'],
      ['brandweerhelm','de brandweerhelm'],['uitrusting','de uitrusting'],
      ['brandweerman','de brandweerman'],['oefening','de oefening']
    ]),
    'spelletjes_nore_en_het_geheim_van_de_molen_E4.html':set('nore-molen',[
      ['molen','de molen'],['hangertje','het hangertje'],['tuinhuisje','het tuinhuisje'],
      ['tandwielen','de tandwielen'],['fotoalbum','het fotoalbum'],['meel','het meel'],
      ['ketting','de ketting'],['handgeschreven briefje','het handgeschreven briefje'],
      ['houten wand','de houten wand']
    ]),
    'spelletjes_jef_en_de_klas_aan_zee_M5.html':set('jef-zee',[
      ['zee','de zee'],['strand','het strand'],['vloedlijn','de vloedlijn'],
      ['krab','de krab'],['rots','de rots'],['glazen fles','de glazen fles'],
      ['opgerold briefje','het opgerold briefje'],['golven','de golven'],['zeewier','het zeewier']
    ]),
    'spelletjes_nore_en_de_tijdscapsule_M5.html':set('nore-tijdscapsule',[
      ['fotoalbum','het fotoalbum'],['envelop','de envelop'],['dagboek','het dagboek'],
      ['leren bandje','het leren bandje'],['metalen doos','de metalen doos'],
      ['muntje','het muntje'],['molen','de molen'],['was','de was'],['plakband','het plakband']
    ]),
    'spelletjes_jef_op_bosklassen_E5.html':set('jef-bosklassen',[
      ['slaapzaal','de slaapzaal'],['stapelbed','het stapelbed'],['kampvuur','het kampvuur'],
      ['pootafdruk','de pootafdruk'],['marshmallow','de marshmallow'],
      ['touwbrug','de touwbrug'],['team','het team'],['zaklamp','de zaklamp'],
      ['dennenappel','de dennenappel']
    ]),
    'spelletjes_nore_het_verhaal_dat_doorgaat_E5.html':set('nore-verhaal',[
      ['fotoalbum','het fotoalbum'],['zilveren ketting','de zilveren ketting'],
      ['familieboek','het familieboek'],['tijdscapsule','de tijdscapsule'],
      ['plastic zakje','het plastic zakje'],['stoffig','stoffig'],['molen','de molen'],
      ['zebra-hangertje','het zebra-hangertje'],['houten kistje','het houten kistje']
    ])
  };

  const game=games[file];
  if(!game) return;

  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='memory-game.css?v=5';
  document.head.appendChild(css);

  const card=document.createElement('div');
  card.className='game-card memory-card-link';
  card.innerHTML='<div class="peel"></div><span class="icon">🧠</span>'+
    '<h3>Woord-beeldmemory</h3><p>Zoek het woord bij de juiste prent</p>';
  card.addEventListener('click',openMemory);
  document.querySelector('.card-grid').appendChild(card);

  const screen=document.createElement('div');
  screen.id='game-memory';
  screen.className='screen';
  screen.innerHTML='<div class="topbar">'+
    '<button class="back-btn memory-back-btn" type="button">←</button>'+
    '<h2>🧠 Woord-beeldmemory</h2></div>'+
    '<div class="memory-wrap">'+
      '<div class="memory-help"><span>Draai twee kaartjes om. Zoek het woord bij de prent. Tik op 🔊 als lezen nog moeilijk is.</span>'+
      '<span class="memory-score"></span></div>'+
      '<div class="memory-grid"></div><div class="memory-end"></div>'+
    '</div>';
  document.body.appendChild(screen);

  const grid=screen.querySelector('.memory-grid');
  const score=screen.querySelector('.memory-score');
  const end=screen.querySelector('.memory-end');
  let openCards=[],locked=false,found=0,moves=0;

  screen.querySelector('.memory-back-btn').addEventListener('click',goToHub);

  function set(slug,pairs){return {slug,pairs};}

  function openMemory(){
    document.querySelectorAll('.screen').forEach(item=>item.classList.remove('active'));
    screen.classList.add('active');
    startMemory();
  }

  function goToHub(){
    if('speechSynthesis' in window) speechSynthesis.cancel();
    screen.classList.remove('active');
    document.getElementById('hub').classList.add('active');
  }

  function startMemory(){
    openCards=[];
    locked=false;
    found=0;
    moves=0;
    end.innerHTML='';
    const cards=[];
    game.pairs.forEach((pair,index)=>{
      cards.push({pair:index,type:'word',key:pair[0],word:pair[1]});
      cards.push({pair:index,type:'image',key:pair[0],word:pair[1]});
    });
    shuffle(cards);
    grid.innerHTML='';
    cards.forEach(makeCard);
    requestAnimationFrame(fitAllMemoryWords);
    updateScore();
  }

  function makeCard(item){
    const button=document.createElement('button');
    button.type='button';
    button.className='memory-card';
    if(item.type==='image') button.classList.add('memory-image-card');
    button.dataset.pair=item.pair;
    button.setAttribute('aria-label','Gesloten memorykaart');
    const front=item.type==='image'
      ? '<img class="memory-picture" src="assets/memory/'+game.slug+'/'+assetName(item.key)+'.webp?v=3" alt="'+escapeHtml(item.word)+'">'
      : memoryWordHtml(item.word)+
        '<span class="memory-listen" role="button" tabindex="0" aria-label="Lees '+escapeHtml(item.word)+' voor">🔊</span>';
    button.innerHTML='<span class="memory-face memory-back"><span>?</span></span>'+
      '<span class="memory-face memory-front">'+front+'</span>';
    button.addEventListener('click',event=>{
      const listen=event.target.closest('.memory-listen');
      if(listen){
        event.stopPropagation();
        speak(item.word,listen);
        return;
      }
      turnCard(button);
    });
    button.addEventListener('keydown',event=>{
      if(event.target.classList.contains('memory-listen') && (event.key==='Enter'||event.key===' ')){
        event.preventDefault();
        event.stopPropagation();
        speak(item.word,event.target);
      }
    });
    grid.appendChild(button);
  }

  function turnCard(card){
    if(locked||card.classList.contains('flipped')||card.classList.contains('matched')) return;
    card.classList.add('flipped');
    card.setAttribute('aria-label','Open memorykaart');
    openCards.push(card);
    if(openCards.length<2) return;
    moves++;
    locked=true;
    const match=openCards[0].dataset.pair===openCards[1].dataset.pair;
    setTimeout(()=>{
      if(match){
        openCards.forEach(item=>item.classList.add('matched'));
        found++;
        if(typeof window.celebrate==='function') celebrate();
      }else{
        openCards.forEach(item=>item.classList.remove('flipped'));
      }
      openCards=[];
      locked=false;
      updateScore();
      if(found===game.pairs.length) finishMemory();
    },match?650:1050);
  }

  function finishMemory(){
    end.innerHTML='<div class="end-card"><div class="stars">🧠⭐🎉</div>'+
      '<h2>Alle paren gevonden!</h2><p>Knap gelezen en onthouden.</p>'+
      '<div class="action-row"><button class="btn memory-again">Nog eens</button>'+
      '<button class="btn secondary memory-games">Andere spelletjes</button></div></div>';
    end.querySelector('.memory-again').addEventListener('click',startMemory);
    end.querySelector('.memory-games').addEventListener('click',goToHub);
    end.scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  function updateScore(){
    score.textContent=found+' / '+game.pairs.length+' paren';
  }

  function speak(text,button){
    if(typeof window.speakText==='function'){
      window.speakText(text,button);
      return;
    }
    if(!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(text);
    utterance.lang='nl-BE';
    utterance.rate=.82;
    speechSynthesis.speak(utterance);
  }

  function shuffle(items){
    for(let i=items.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [items[i],items[j]]=[items[j],items[i]];
    }
  }

  function assetName(value){
    return String(value).toLowerCase().replace(/\s+/g,'-').replace(/[ëé]/g,'e');
  }

  function isLongSingleWord(value){
    const word=String(value).trim().replace(/^(de|het)\s+/i,'');
    return !word.includes(' ') && word.length>=12;
  }

  function memoryWordHtml(value){
    const text=String(value).trim();
    const match=text.match(/^(de|het)\s+(.+)$/i);
    const article=match?match[1]:'';
    const main=match?match[2]:text;
    const singleWord=!main.includes(' ');
    return '<span class="memory-word">'+
      (article?'<span class="memory-article">'+escapeHtml(article)+'</span>':'')+
      '<span class="memory-main'+(singleWord?' memory-single-word':'')+
      (isLongSingleWord(text)?' memory-long-word':'')+'">'+escapeHtml(main)+'</span>'+
      '</span>';
  }

  function fitAllMemoryWords(){
    grid.querySelectorAll('.memory-main.memory-single-word').forEach(word=>{
      word.style.fontSize='';
      let size=parseFloat(getComputedStyle(word).fontSize);
      const available=Math.max(1,word.parentElement.clientWidth-8);
      while(word.scrollWidth>available && size>8){
        size-=.5;
        word.style.fontSize=size+'px';
      }
    });
  }

  let resizeTimer=null;
  window.addEventListener('resize',()=>{
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(fitAllMemoryWords,120);
  });

  function escapeHtml(value){
    return String(value).replace(/[&<>"']/g,char=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[char]);
  }
})();
