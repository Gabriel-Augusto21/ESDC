import { alerta_inserir, alerta_update, alerta_ativar, alerta_desativar } from './alertas_classificacao.js';
document.body.addEventListener('click', function (e) {
   const insert_btn = e.target.closest('.insert-btn');
   const update_btn = e.target.closest('.update-btn')
   const ativar_btn = e.target.closest('.ativar-btn');
   const desativar_btn = e.target.closest('.desativar-btn')
   
   if (insert_btn) {
      e.preventDefault();
      alerta_inserir(insert_btn);
   }
   if (update_btn){
      e.preventDefault();
      alerta_update(update_btn);
   }
   if (desativar_btn) {
      e.preventDefault();
      alerta_desativar(desativar_btn);
      console.log(desativar_btn)
   }
   if (ativar_btn) {
      e.preventDefault();
      alerta_ativar(ativar_btn);
   } 
});