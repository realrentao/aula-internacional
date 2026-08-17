// Aula site - Spanish click-to-pronounce
// Primary: pre-generated edge-tts mp3 (es-ES-ElviraNeural) via manifest.json lookup.
// Fallback: browser SpeechSynthesis (es-ES) when mp3 missing or playback fails.
(function(){
  let voices = [];
  function loadVoices(){ voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : []; }
  if (window.speechSynthesis) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
  function pickSpanishVoice(){
    if (!voices.length) return null;
    return voices.find(v=>/^es[-_]ES/i.test(v.lang)) ||
           voices.find(v=>/^es/i.test(v.lang)) || null;
  }

  // manifest: text -> mp3 filename. Unit pages live in html/, audio at site root.
  let manifestMap = null;
  let manifestLoading = null;
  function getManifest(){
    if (manifestMap) return Promise.resolve(manifestMap);
    if (manifestLoading) return manifestLoading;
    manifestLoading = fetch('../audio/manifest.json')
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        const m = new Map();
        if (Array.isArray(j)) { for (const it of j) { if (it && it.t) m.set(it.t, it.f); } }
        manifestMap = m;
        return m;
      })
      .catch(() => { manifestMap = new Map(); return manifestMap; });
    return manifestLoading;
  }

  function browserSpeak(text){
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickSpanishVoice();
    if (v){ u.voice = v; u.lang = v.lang; } else { u.lang = 'es-ES'; }
    u.rate = 0.95; u.pitch = 1;
    window.speechSynthesis.speak(u);
  }

  // currently playing pre-baked mp3 (so a new click can interrupt it)
  let currentAudio = null;

  window.speak = function(text){
    if (!text) return;
    // interruption: stop any audio currently playing before starting the new one
    if (currentAudio){
      try { currentAudio.pause(); currentAudio.currentTime = 0; } catch(e){}
      currentAudio = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    getManifest().then(m => {
      const f = m.get(text);
      if (f){
        const audio = new Audio('../audio/' + f);
        audio.onended = function(){ if (currentAudio === audio) currentAudio = null; };
        audio.onerror = function(){ currentAudio = null; browserSpeak(text); };
        currentAudio = audio;
        audio.play().catch(() => { currentAudio = null; browserSpeak(text); });
      } else {
        browserSpeak(text);
      }
    });
  };

  // Split a clickable cell like "italiano / italiana" into two individually
  // clickable + individually voiced parts. Only short 2-part word pairs are
  // split; full sentences (containing . ! ? ¡ ¿) and long lists are kept whole.
  function splitSlashClicks(){
    const spans = document.querySelectorAll('span.click');
    spans.forEach(function(span){
      const attr = span.getAttribute('onclick') || '';
      const mm = attr.match(/^\s*speak\('((?:[^'\\]|\\.)*?)'\)\s*$/);
      if (!mm) return;
      const text = mm[1];
      if (text.indexOf(' / ') === -1) return;
      if (/[.!?¡¿]/.test(text)) return;          // sentence → keep whole
      const parts = text.split(' / ');
      if (parts.length !== 2 || text.length > 65) return; // only 2-part pairs
      const frag = document.createDocumentFragment();
      parts.forEach(function(p, i){
        if (i > 0) frag.appendChild(document.createTextNode(' / '));
        const s = document.createElement('span');
        s.className = 'click';
        s.setAttribute('onclick', "speak('" + p.replace(/\\/g,'\\\\').replace(/'/g,"\\'") + "')");
        s.textContent = p;
        frag.appendChild(s);
      });
      span.replaceWith(frag);
    });
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', splitSlashClicks);
  } else {
    splitSlashClicks();
  }

  // scroll progress + nav color
  window.addEventListener('scroll', function(){
    const h = document.documentElement;
    const sc = (h.scrollTop || document.body.scrollTop);
    const max = h.scrollHeight - h.clientHeight;
    const pct = max>0 ? (sc/max*100) : 0;
    const bar = document.querySelector('.scroll-progress');
    if (bar) bar.style.width = pct + '%';
    const nav = document.querySelector('.top-nav');
    if (nav) nav.classList.toggle('scrolled', sc>20);
  });
  // dark mode toggle
  window.toggleDark = function(){
    document.body.classList.toggle('dark');
  };
})();
