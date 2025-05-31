$(document).ready(function() {  
   // Criando o alerta quando clicado no botao de excluir 
   document.body.addEventListener('click', function (e) {
      if (e.target.closest('.update-btn')){
         e.preventDefault();

         const btn = e.target.closest('.update-btn');
         const url = btn.dataset.url;
         const tr = btn.closest('tr');
         const nome = tr.querySelector('#txtNome')?.textContent.trim() || 'Item';

         Swal.fire({
            title: 'Renomear classificação',
            icon: 'info',
            input: "text",
            inputLabel: "Informe um novo nome de classificacao",
            inputValue: nome,
            showCancelButton: true,
         });
      }
      if (e.target.closest('.delete-btn')) {
         e.preventDefault();

         const btn = e.target.closest('.delete-btn');
         const url = btn.dataset.url;
         const tr = btn.closest('tr');
         
         Swal.fire({
            title: 'Tem certeza que deseja excluir?',
            text: "Você poderá desfazer isso mais tarde!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FF0000',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar'
         }).then((result) => {
            if (result.isConfirmed) {
               // Dispara HTMX manualmente
               htmx.ajax('GET', url, {
                  swap: 'none'
               });
               Swal.fire({
                  title: 'Tudo certo!',
                  text: `Essa classificacao agora está inativa!`,
                  icon: 'success',
                  confirmButtonColor: '#3085d6',
               })
            }
         });
      }
      
   });
});