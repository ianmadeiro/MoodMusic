function createModal(contentHtml){
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = contentHtml;
  backdrop.appendChild(modal);
  backdrop.addEventListener('click', (e)=>{ if(e.target===backdrop) document.body.removeChild(backdrop); });
  document.body.appendChild(backdrop);
  return {backdrop, modal};
}

async function openAddMusic(){
  const html = `
    <h3>Adicionar música</h3>
    <input id="m_nome" placeholder="Nome da música"><br>
    <input id="m_artista" placeholder="Artista"><br>
    <input id="m_link" placeholder="Link (mp3/http)"><br>
    <select id="m_popularidade"><option value="baixa">Baixa</option><option value="alta">Alta</option></select><br>
    <div style="display:flex;gap:8px;margin-top:8px;">
      <button id="saveMusic">Salvar</button>
      <button id="cancelMusic">Cancelar</button>
    </div>
  `;
  const {backdrop, modal} = createModal(html);
  const API = 'http://localhost:3000'; // Define API dentro da função se não estiver globalmente

  modal.querySelector('#cancelMusic').onclick = ()=>document.body.removeChild(backdrop);
  modal.querySelector('#saveMusic').onclick = async ()=>{
    const nome = modal.querySelector('#m_nome').value;
    const artista = modal.querySelector('#m_artista').value;
    const link = modal.querySelector('#m_link').value;
    const popularidade = modal.querySelector('#m_popularidade').value;
    const token = localStorage.getItem('token');
    const res = await fetch(API + '/musicas',{
      method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
      body:JSON.stringify({nome,artista,link,popularidade})
    });
    const data = await res.json();
    if(res.ok){
      document.body.removeChild(backdrop);
      if(window.loadMusicas) window.loadMusicas();
    } else {
      alert(data.erro || 'Erro ao salvar');
    }
  }
}

async function openCreatePlaylist(){
  const html = `
    <h3>Criar playlist</h3>
    <input id="p_nome" placeholder="Nome da playlist"><br>
    <div style="display:flex;gap:8px;margin-top:8px;">
      <button id="savePlaylist">Criar</button>
      <button id="cancelPlaylist">Cancelar</button>
    </div>
  `;
  const {backdrop, modal} = createModal(html);
  const API = 'http://localhost:3000'; // Define API dentro da função se não estiver globalmente
  
  modal.querySelector('#cancelPlaylist').onclick = ()=>document.body.removeChild(backdrop);
  modal.querySelector('#savePlaylist').onclick = async ()=>{
    const nome = modal.querySelector('#p_nome').value;
    const token = localStorage.getItem('token');
    const res = await fetch(API + '/playlists',{
      method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
      body:JSON.stringify({nome})
    });
    const data = await res.json();
    if(res.ok){
      document.body.removeChild(backdrop);
      if(window.loadPlaylists) window.loadPlaylists();
    } else {
      alert(data.erro || 'Erro ao criar');
    }
  }
}

window.openAddMusic = openAddMusic;
window.openCreatePlaylist = openCreatePlaylist;
// openAddToPlaylist é chamada apenas em app.js, então não precisa ser globalmente exposta.