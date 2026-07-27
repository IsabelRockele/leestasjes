(function(){
  const screen=document.getElementById('game-wrong');
  if(!screen || typeof window.loadWrong!=='function') return;

  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='wrong-game-helper.css';
  document.head.appendChild(css);

  const pictures={
    'spelletjes_noor_en_de_bal_M3.html':'assets/games/noor-bal-missie.webp',
    'spelletjes_jef_en_de_poes_M3.html':'assets/games/jef-poes-zoekplaat.webp',
    'spelletjes_jef_en_het_bos_E3.html':'assets/games/jef-bos-missie.webp',
    'spelletjes_nore_en_de_schatkaart_E3.html':'assets/games/nore-schatkaart-missie.webp',
    'spelletjes_nore_en_de_geheime_sleutel_M4.html':'assets/games/nore-sleutel-missie.webp',
    'spelletjes_jef_op_bosspeurtocht_M4.html':'assets/games/jef-bosspeurtocht-missie.webp',
    'spelletjes_jef_bij_de_brandweer_E4.html':'assets/games/jef-brandweer-missie.webp',
    'spelletjes_nore_en_het_geheim_van_de_molen_E4.html':'assets/games/nore-molen-missie.webp',
    'spelletjes_jef_en_de_klas_aan_zee_M5.html':'assets/games/jef-zee-missie.webp',
    'spelletjes_nore_en_de_tijdscapsule_M5.html':'assets/games/nore-tijdcapsule-missie.webp',
    'spelletjes_jef_op_bosklassen_E5.html':'assets/games/jef-bosklassen-missie.webp',
    'spelletjes_nore_het_verhaal_dat_doorgaat_E5.html':'assets/games/nore-verhaal-missie.webp'
  };
  const page=decodeURIComponent(location.pathname.split('/').pop());
  const image=pictures[page];
  if(!image) return;

  const feedback=document.getElementById('wrong-feedback');
  const support=document.createElement('div');
  support.className='wrong-support';
  support.innerHTML='<button class="wrong-support-btn wrong-listen" type="button" aria-label="Laat de zin voorlezen">🔊 Luister naar de zin</button>'+
    '<button class="wrong-support-btn wrong-help" type="button" aria-expanded="false">🖼️ Toon een prent</button>';

  const picture=document.createElement('div');
  picture.className='wrong-picture-help';
  picture.innerHTML='<img src="'+image+'" alt="Prent uit het verhaal als hulp">'+
    '<p>Bekijk de prent goed. Welk woord in de zin past niet bij het verhaal?</p>';

  feedback.parentNode.insertBefore(support,feedback);
  feedback.parentNode.insertBefore(picture,feedback);

  const listen=support.querySelector('.wrong-listen');
  const help=support.querySelector('.wrong-help');

  listen.addEventListener('click',function(){
    if(typeof wrongSet==='undefined' || typeof wIndex==='undefined' || !wrongSet[wIndex]) return;
    const sentence=wrongSet[wIndex].words.join(' ').replace(/\s+([.,!?])/g,'$1');
    if(typeof window.speakText==='function') window.speakText(sentence,listen);
  });

  help.addEventListener('click',function(){
    const showing=picture.classList.toggle('show');
    help.setAttribute('aria-expanded',String(showing));
    help.textContent=showing?'✕ Sluit de prent':'🖼️ Toon een prent';
    if(showing) picture.scrollIntoView({behavior:'smooth',block:'nearest'});
  });

  const originalLoadWrong=window.loadWrong;
  window.loadWrong=function(){
    originalLoadWrong();
    const active=typeof wrongSet!=='undefined' && typeof wIndex!=='undefined' && wIndex<wrongSet.length;
    support.style.display=active?'flex':'none';
    picture.classList.remove('show');
    picture.style.display='';
    help.setAttribute('aria-expanded','false');
    help.textContent='🖼️ Toon een prent';
  };
})();
