// Adicionar ao auth.js (ou arquivo dedicado)
const API = 'http://localhost:3000';

async function requestReset(){
  const email = document.getElementById('email').value;
  
  if (!email) {
    alert('Por favor, digite seu email.');
    return;
  }
  
  const res = await fetch(API + '/forgot-password',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({email})
  });
  
  // O servidor deve retornar sucesso mesmo se o email não existir (por segurança)
  // Mas informamos ao usuário que o processo foi iniciado.
  if(res.ok || res.status === 404){ 
    alert('Se o email estiver cadastrado, um link de redefinição foi enviado.');
    // Redireciona para a página de login para esperar o email
    location.href = 'login.html';
  } else {
    const data = await res.json();
    alert(data.erro || 'Erro ao processar sua solicitação.');
  }
}

// Se estiver usando um arquivo separado, adicione ao window
// window.requestReset = requestReset;