// tts.js — NLFR: Text-To-Speech helper (FR) met spraakvriendelijke leestekens
// - Slash "/" => "barre oblique"
// - Haakjes "(…)" => "entre parenthèses … fin de parenthèses"
// - Female-ish FR stem voorkeur
//
// Gebruik:
//   tts.speak("vouvoiement / tutoiement");         // leest “barre oblique”
//   tts.speak("Merci d’être venu(e/s).");          // leest “entre parenthèses e barre oblique s …”
//   tts.attachButton(el, () => "…");               // voegt 🔊-knop toe
//
// Opties:
//   tts.speak(txt, { rate:0.95, pitch:1.08, lang:'fr-FR' });
//   tts.config({ readSlash:true, readParentheses:true }); // aan/uit zetten van deze uitbreidingen

(function (global) {
  if (global.tts) return;

  // ====== Config ======
  const state = {
    readSlash: true,
    readParentheses: true,
    defaultLang: 'fr-FR',
    defaultRate: 0.95,
    defaultPitch: 1.08,
    defaultVolume: 1.0
  };

  function config(opts){
    if (!opts) return;
    ['readSlash','readParentheses','defaultLang','defaultRate','defaultPitch','defaultVolume']
      .forEach(k => (k in opts) && (state[k] = opts[k]));
  }

  // ====== Voice selectie (FR, bij voorkeur female-ish) ======
  const FEMALE_NAME_HINT = /(google.*fr|am[eé]lie|aur[ée]lie|virginie|marie|h[ée]l[èe]ne|chantal|julie|sophie|celine|claire|emma|anna|salma)/i;

  let cachedVoices = [];
  let chosenVoice = null;

  function loadVoices() {
    try {
      cachedVoices = window.speechSynthesis.getVoices() || [];
      const fr = cachedVoices.filter(v => /^fr/i.test(v.lang));
      chosenVoice =
        fr.find(v => FEMALE_NAME_HINT.test(((v.name||'') + ' ' + (v.voiceURI||'')))) ||
        fr.find(v => /fr[-_]FR/i.test(v.lang)) ||
        fr[0] ||
        cachedVoices[0] || null;
    } catch (_) {
      cachedVoices = []; chosenVoice = null;
    }
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = function(){ loadVoices(); };
    loadVoices();
  }

  // ====== Tekst-normalisatie met uitgesproken leestekens ======
  function normalizeForSpeech(input){
    if (!input) return '';

    let text = String(input);

    // Unicode/apostrof normaliseren
    text = text.replace(/\u2019/g, "'").replace(/\u00A0/g, ' ');

    // Haakjes uitspreken (binnenste paren eerst)
    if (state.readParentheses) {
      // Gebruik een loop om meerdere sets haakjes te behandelen
      const parenNameOpen  = " entre parenthèses ";
      const parenNameClose = " fin de parenthèses ";

      // We vervangen telkens de meest binnenste (…) met genoemde formulering
      let safety = 0;
      while (/\([^()]*\)/.test(text) && safety < 20) {
        text = text.replace(/\(([^()]*)\)/g, (_, inside) => {
          // Binnen haakjes ook slash uitspreken
          if (state.readSlash) {
            inside = inside.replace(/\//g, " barre oblique ");
          }
          return parenNameOpen + inside.trim() + parenNameClose;
        });
        safety++;
      }
    } else {
      // Als haakjes niet uitgesproken hoeven te worden: verwijder alleen de haakjes
      text = text.replace(/[()]/g, '');
    }

    // Slash uitspreken
    if (state.readSlash) {
      // Spaties rondom slash worden netjes gemaakt
      text = text.replace(/\s*\/\s*/g, " barre oblique ");
    }

    // Spaties opschonen (meervoudige spaties)
    text = text.replace(/\s{2,}/g, ' ').trim();

    return text;
  }

  // ====== Spreken ======
  function speak(text, opts) {
    if (!('speechSynthesis' in window)) { alert('Spreken wordt niet ondersteund.'); return; }
    if (!text || !String(text).trim()) return;

    // Stop lopende spraak
    window.speechSynthesis.cancel();

    const processed = normalizeForSpeech(text);
    const u = new SpeechSynthesisUtterance(processed);

    u.lang   = (opts && opts.lang)   || state.defaultLang;
    u.rate   = (opts && typeof opts.rate  === 'number') ? opts.rate  : state.defaultRate;
    u.pitch  = (opts && typeof opts.pitch === 'number') ? opts.pitch : state.defaultPitch;
    u.volume = (opts && typeof opts.volume=== 'number') ? opts.volume: state.defaultVolume;

    if (!chosenVoice || !cachedVoices.length) loadVoices();
    if (opts && opts.voiceName) {
      const byName = cachedVoices.find(v => (v.name||'').toLowerCase() === String(opts.voiceName).toLowerCase());
      if (byName) chosenVoice = byName;
    }
    u.voice = chosenVoice || null;

    window.speechSynthesis.speak(u);
  }

  // ====== Helper voor knoppen ======
  function attachButton(el, getTextFn, opts){
    if (!el) return;
    // voorkom dubbele knop
    if (el.querySelector && el.querySelector('.speak-btn')) return;

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
        speak(txt, opts || { lang: state.defaultLang, rate: state.defaultRate, pitch: state.defaultPitch });
      } catch(_) {}
    });
    el.appendChild(btn);
  }

  function setVoiceByName(name){
    if (!name) return;
    if (!cachedVoices.length) loadVoices();
    const v = cachedVoices.find(v => (v.name||'').toLowerCase() === String(name).toLowerCase());
    if (v) chosenVoice = v;
  }

  // Expose
  global.tts = { speak, attachButton, setVoiceByName, config };
})(window);
