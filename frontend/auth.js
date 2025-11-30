const API = 'http://localhost:3000';

// --- Funções de Autenticação Padrão ---

async function registrar(){
  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const res = await fetch(API + '/register',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({nome,email,senha})
  });
  const data = await res.json();
  if(res.ok){
    alert('Conta criada! Faça login.');
    location.href = 'login.html';
  } else {
    alert(data.erro || 'Erro ao criar conta');
  }
}

async function login(){
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const res = await fetch(API + '/login',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({email,senha})
  });
  const data = await res.json();
  if(res.ok){
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.usuario || data.usuario));
    location.href = 'index.html';
  } else {
    alert(data.erro || 'Erro no login');
  }
}

function ensureAuth(){
  const token = localStorage.getItem('token');
  if(!token) location.href = 'login.html';
}

function logout(){
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  location.href = 'login.html';
}

// --- Funções de Recuperação de Senha ---

async function requestReset(){
  const email = document.getElementById('email').value;
  
  if (!email) {
    alert('Por favor, digite seu email.');
    return;
  }
  
  // Envia a solicitação de redefinição para o servidor
  const res = await fetch(API + '/forgot-password',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({email})
  });
  
  // Resposta genérica por segurança, para não revelar se o e-mail existe
  if(res.ok || res.status === 404){ 
    alert('Se o email estiver cadastrado, um link de redefinição foi enviado para sua caixa de entrada.');
    location.href = 'login.html';
  } else {
    const data = await res.json();
    alert(data.erro || 'Erro ao processar sua solicitação.');
  }
}

async function performReset(){
  const senha = document.getElementById('senha').value;
  const confirmarSenha = document.getElementById('confirmarSenha').value;
  
  if (senha !== confirmarSenha) {
    alert('As senhas não coincidem.');
    return;
  }
  if (senha.length < 6) { 
    alert('A senha deve ter pelo menos 6 caracteres.');
    return;
  }

  // Pega o token da URL (ex: ?token=abc123xyz)
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (!token) {
    alert('Token de redefinição não encontrado.');
    return;
  }

  // Envia o token e a nova senha para o servidor
  const res = await fetch(API + '/reset-password',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({token, senha})
  });
  
  const data = await res.json();
  if(res.ok){
    alert('Sua senha foi redefinida com sucesso! Faça login.');
    location.href = 'login.html';
  } else {
    alert(data.erro || 'Erro na redefinição de senha. O link pode ter expirado ou ser inválido.');
  }
}

// --- Exportação das Funções ---

window.registrar = registrar;
window.login = login;
window.ensureAuth = ensureAuth;
window.logout = logout;
window.requestReset = requestReset;
window.performReset = performReset;