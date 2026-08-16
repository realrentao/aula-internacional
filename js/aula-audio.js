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

  window.speak = function(text){
    if (!text) return;
    getManifest().then(m => {
      const f = m.get(text);
      if (f){
        const audio = new Audio('../audio/' + f);
        audio.play().catch(() => browserSpeak(text));
      } else {
        browserSpeak(text);
      }
    });
  };

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
