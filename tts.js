// tts.js — eenvoudige Text-To-Speech helper voor FR (female-ish voorkeur)
// Gebruik:
// 1) <script src="./tts.js"></script> in elke pagina
// 2) tts.attachButton(li, () => "Bonjour !")  // voegt 🔊 toe
//    tts.speak("Bonjour !", { rate:0.95, pitch:1.08 })  // direct spreken

(function(global){
  if (global.tts) return; // één keer laden

  const FEMALE_NAME_HINT = /(google.*fr|am[eé]lie|aur[ée]lie|virginie|marie|h[ée]l[èe]ne|chantal|julie|sophie|celine|claire|emma|anna|salma)/i;

  let cachedVoices = [];
  let chosenVoice = null;

  function loadVoices() {
    try {
      cachedVoices = window.speechSynthesis.getVoices() || [];
      // Sorteer FR-stemmen eerst
      const fr = cachedVoices.filter(v => /^fr/i.test(v.lang));
      // 1) FR + female-name hint
      chosenVoice =
        fr.find(v => FEMALE_NAME_HINT.test((v.name||"") + " " + (v.voiceURI||""))) ||
        fr.find(v => /fr[-_]FR/i.test(v.lang)) ||
        fr[0] ||
        cachedVoices[0] || null;
    } catch (_) {
      cachedVoices = [];
      chosenVoice = null;
    }
  }

  if ('speechSynthesis' in window) {
    // browsers laden voices asynchroon
    window.speechSynthesis.onvoiceschanged = function(){
      loadVoices();
    };
    loadVoices();
  }

  function speak(text, opts) {
    if (!('speechSynthesis' in window)) {
      alert('Spreken wordt niet ondersteund door deze browser.');
      return;
    }
    if (!text || !text.trim()) return;

    // Stop lopende spraak
    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text.trim());
    u.lang   = (opts && opts.lang)   || 'fr-FR';
    u.rate   = (opts && typeof opts.rate  === 'number') ? opts.rate  : 0.95; // iets rustiger
    u.pitch  = (opts && typeof opts.pitch === 'number') ? opts.pitch : 1.08; // female-ish
    u.volume = (opts && typeof opts.volume=== 'number') ? opts.volume: 1.0;

    // Voice kiezen (opnieuw ophalen als lijst intussen is gekomen)
    if (!chosenVoice || !cachedVoices.length) loadVoices();
    if (opts && opts.voiceName) {
      const byName = cachedVoices.find(v => (v.name||'').toLowerCase() === String(opts.voiceName).toLowerCase());
      if (byName) chosenVoice = byName;
    }
    u.voice = chosenVoice || null;

    window.speechSynthesis.speak(u);
  }

  // Maak een 🔊-knop en hang aan element
  function attachButton(el, getTextFn, opts){
    if (!el) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'speak-btn';
    btn.title = 'Uitspreken (FR)';
    btn.setAttribute('aria-label','Uitspreken (FR)');
    btn.textContent = '🔊';
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      try {
        const txt = (typeof getTextFn === 'function') ? getTextFn() : (el.textContent || '');
        speak(txt, opts || { lang:'fr-FR', rate:0.95, pitch:1.08 });
      } catch(_) {}
    });
    el.appendChild(btn);
  }

  // Optioneel: forceer een specifieke stem op naam
  function setVoiceByName(name){
    if (!name) return;
    if (!cachedVoices.length) loadVoices();
    const v = cachedVoices.find(v => (v.name||'').toLowerCase() === String(name).toLowerCase());
    if (v) chosenVoice = v;
  }

  // Exporteer API
  global.tts = { speak, attachButton, setVoiceByName };

})(window);
