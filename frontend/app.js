// ensureAuth é uma função global exposta por auth.js
ensureAuth && ensureAuth();

const API = 'http://localhost:3000';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user')||'null');
if(!user){ location.href='login.html' }

// Garante que os elementos existam antes de tentar acessá-los
document.getElementById('userName').innerText = user.nome || user.email;
document.getElementById('logoutBtn').onclick = logout;
document.getElementById('openAddMusic').onclick = openAddMusic;
document.getElementById('createPlaylistBtn').onclick = openCreatePlaylist;
document.getElementById('toggleTheme').onclick = ()=>{
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
};

const theme = localStorage.getItem('theme') || 'light';
document.body.classList.remove('light','dark');
document.body.classList.add(theme);

async function loadMusicas(){
  const res = await fetch(API + '/musicas');
  const musics = await res.json();
  const list = document.getElementById('tracksList');
  list.innerHTML='';
  musics.forEach(m=>{
    const li = document.createElement('li');
    li.innerHTML = `
      <img src="${m.capa||('https://ui-avatars.com/api/?name='+encodeURIComponent(m.artista))}" alt="capa"/>
      <div class="track-meta">
        <h4>${m.nome}</h4>
        <p>${m.artista}</p>
      </div>
      <div class="track-actions">
        <button class="playNow">▶</button>
        <button class="addTo">＋</button>
      </div>
    `;
    li.querySelector('.playNow').onclick = ()=>{ window.playerSetTrack(m); };
    li.querySelector('.addTo').onclick = ()=>openAddToPlaylist(m.id);
    list.appendChild(li);
  });
  window.playerSetQueue(musics);
}

async function loadPlaylists(){
  const ul = document.getElementById('playlistsList');
  ul.innerHTML='';
  try{
    const res = await fetch(API + '/playlists', {headers:{'Authorization':'Bearer '+token}});
    if(res.ok){
      const pls = await res.json();
      pls.forEach(p=>{
        const li = document.createElement('li');
        li.innerText = p.nome;
        li.onclick = ()=>loadPlaylistMusicas(p.id);
        ul.appendChild(li);
      });
      return;
    }
  }catch(e){console.warn(e)}
  const li = document.createElement('li'); li.innerText='Minhas músicas'; li.onclick=()=>loadMusicas(); ul.appendChild(li);
}

async function loadPlaylistMusicas(id){
  const res = await fetch(`${API}/playlists/${id}/musicas`, {headers:{'Authorization':'Bearer '+token}});
  // Correção: A lista de músicas pode vir em um campo específico, adaptando a resposta:
  let mus = [];
  if(res.ok){
      const data = await res.json();
      // Assume que a resposta JSON contém a lista diretamente ou em 'musicas'
      mus = data.musicas || data; 
  }

  const list = document.getElementById('tracksList'); list.innerHTML='';
  mus.forEach(m=>{
    const li = document.createElement('li');
    li.innerHTML = `
      <img src="${m.capa||('https://ui-avatars.com/api/?name='+encodeURIComponent(m.artista))}" alt="capa"/>
      <div class="track-meta">
        <h4>${m.nome}</h4>
        <p>${m.artista}</p>
      </div>
      <div class="track-actions">
        <button class="playNow">▶</button>
        <button class="addTo">＋</button>
      </div>
    `;
    li.querySelector('.playNow').onclick = ()=>{ window.playerSetTrack(m); };
    li.querySelector('.addTo').onclick = ()=>openAddToPlaylist(m.id);
    list.appendChild(li);
  });
  window.playerSetQueue(mus);
}

async function openAddToPlaylist(musica_id){
  const res = await fetch(API + '/playlists', {headers:{'Authorization':'Bearer '+token}});
  const pls = res.ok ? await res.json() : [];
  let options = '';
  pls.forEach(p=>options += `<option value="${p.id}">${p.nome}</option>`);
  const html = `
    <h3>Adicionar a playlist</h3>
    <select id="selPlaylist">${options}</select><br>
    <div style="display:flex;gap:8px;margin-top:8px;">
      <button id="addBtn">Adicionar</button>
      <button id="cancelBtn">Cancelar</button>
    </div>
  `;
  const {backdrop, modal} = createModal(html);
  modal.querySelector('#cancelBtn').onclick = ()=>document.body.removeChild(backdrop);
  modal.querySelector('#addBtn').onclick = async ()=>{
    const playlist_id = modal.querySelector('#selPlaylist').value;
    const res = await fetch(API + '/playlists/add',{
      method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
      body:JSON.stringify({playlist_id,musica_id})
    });
    if(res.ok){
      document.body.removeChild(backdrop);
      alert('Adicionado!');
    } else {
      const d = await res.json(); alert(d.erro || 'Erro');
    }
  }
}

window.loadMusicas = loadMusicas; window.loadPlaylists = loadPlaylists; window.openAddToPlaylist = openAddToPlaylist;

loadMusicas(); loadPlaylists();