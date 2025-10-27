// tts-auto.js — voegt automatisch 🔊 toe aan Doelzinnen (#targets li)
// en Micro-lexicon (#lex li). Werkt samen met jouw tts.js (met leestekens).
(function(){
  function enhance(){
    if (!window.tts) return;

    // Doelzinnen: volledige zin uitspreken
    var targets = document.querySelectorAll('#targets li');
    targets.forEach(function(li){
      if (li.dataset.ttsAttached) return;
      li.dataset.ttsAttached = '1';
      window.tts.attachButton(li, function(){ return (li.textContent || '').trim(); });
    });

    // Micro-lexicon: alleen het FR-deel (<strong>FR</strong> – NL)
    var lex = document.querySelectorAll('#lex li');
    lex.forEach(function(li){
      if (li.dataset.ttsAttached) return;
      li.dataset.ttsAttached = '1';
      var strong = li.querySelector('strong');
      var fr = strong ? strong.textContent : (li.textContent.split('–')[0] || li.textContent);
      window.tts.attachButton(li, function(){ return (fr || '').trim(); });
    });
  }

  // Eerste run
  document.addEventListener('DOMContentLoaded', enhance);

  // Voor als content dynamisch wijzigt: observer
  var obs = new MutationObserver(function(){ enhance(); });
  obs.observe(document.documentElement, { childList:true, subtree:true });
})();
