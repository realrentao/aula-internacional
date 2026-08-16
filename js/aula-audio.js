// Aula site - Spanish click-to-pronounce
// Primary: browser SpeechSynthesis (es-ES). Optional: pre-generated edge-tts mp3 override.
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
  function keyOf(text){
    return (text||'').toLowerCase().replace(/[^a-z0-9áéíóúñü\s]/g,'').replace(/\s+/g,'_').substring(0,60) || 'x';
  }
  window.speak = function(text){
    if(!text) return;
    const k = keyOf(text);
    // try pre-generated mp3 first (progressive enhancement)
    const mp3 = 'audio/' + k + '.mp3';
    const audio = new Audio(mp3);
    audio.play().then(()=>{}).catch(()=>{
      // fallback to SpeechSynthesis
      if (!window.speechSynthesis) { return; }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = pickSpanishVoice();
      if (v){ u.voice = v; u.lang = v.lang; } else { u.lang = 'es-ES'; }
      u.rate = 0.95; u.pitch = 1;
      window.speechSynthesis.speak(u);
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
