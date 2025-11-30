const audio = new Audio();
let currentTrack = null;
let queue = [];

function setTrack(track){
  currentTrack = track;
  audio.src = track.link;
  document.getElementById('playerCover').src = track.capa || ('https://ui-avatars.com/api/?name='+encodeURIComponent(track.artista));
  document.getElementById('playerTitle').innerText = track.nome;
  document.getElementById('playerArtist').innerText = track.artista;
  audio.play().catch(()=>{});
  const playBtn = document.getElementById('playBtn');
  playBtn.classList.add('playing');
  playBtn.innerText = '⏸';
}

function togglePlay() {
  const playBtn = document.getElementById('playBtn');
  if (audio.paused) {
    audio.play().catch(()=>{});
    playBtn.innerText = '⏸';
    playBtn.classList.add('playing');
  } else {
    audio.pause();
    playBtn.innerText = '▶️';
    playBtn.classList.remove('playing');
  }
}

function nextTrack(){
  if(!queue.length) return;
  const idx = queue.findIndex(t=>t.id===currentTrack.id);
  const next = queue[(idx+1) % queue.length];
  setTrack(next);
}
function prevTrack(){
  if(!queue.length) return;
  const idx = queue.findIndex(t=>t.id===currentTrack.id);
  const prev = queue[(idx-1 + queue.length) % queue.length];
  setTrack(prev);
}

audio.addEventListener('timeupdate', ()=>{
  const bar = document.getElementById('progressBar');
  if(!audio.duration || isNaN(audio.duration)) return;
  const percent = (audio.currentTime / audio.duration) * 100;
  bar.value = percent;
  const dur = Math.floor(audio.currentTime);
  document.getElementById('duration').innerText = Math.floor(dur/60)+':'+String(dur%60).padStart(2,'0');
});

// Event listeners (Corrigidos: garantindo que existam antes de adicionar)
document.addEventListener('DOMContentLoaded', ()=>{
  const playBtn = document.getElementById('playBtn');
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');
  const bar = document.getElementById('progressBar');
  
  if (playBtn) playBtn.addEventListener('click', togglePlay);
  if (nextBtn) nextBtn.addEventListener('click', nextTrack);
  if (prevBtn) prevBtn.addEventListener('click', prevTrack);
  
  if (bar) {
    bar.addEventListener('input', (e)=>{
      if(!audio.duration) return;
      audio.currentTime = (e.target.value/100) * audio.duration;
    });
  }
});

window.playerSetQueue = function(list){ queue = list; }
window.playerSetTrack = setTrack;