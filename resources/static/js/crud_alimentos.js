// criei um escutador que espera um evento de click no body
document.body.addEventListener('click', function (evento){ 
   const desativar_btn = evento.target.closest('.desativar-btn');
   const ativar_btn = evento.target.closest('.ativar-btn');
   const atualizar_btn = evento.target.closest('.update-btn');
   if (desativar_btn) {
      evento.preventDefault()
      console.log('Id desativar capturada:', desativar_btn.dataset.id);
   }
   if (ativar_btn) {
      evento.preventDefault()
      console.log('Id desativar capturada:', ativar_btn.dataset.id);
   }
   if (atualizar_btn) {
      evento.preventDefault()
      console.log('Id atualização capturada:', atualizar_btn.dataset.id);
   }
});