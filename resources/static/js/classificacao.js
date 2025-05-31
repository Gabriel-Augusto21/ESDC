$(document).ready(function() {  
   function reseta_input(){
      $('.form-control').on('click', function () {
         let input = $(this);
         let valorOriginal = input.prop('defaultValue'); // pega o valor original do atributo value
         let valorAtual = input.val();
      
         if (valorAtual !== valorOriginal) {
            input.val(valorOriginal); // reseta pro valor original
         }
      });
   }
   $('.update-btn').on('click', function() {
      let tr = $(this).closest('tr');
      let nome = tr.find('#txtNome').val();
      if (nome) {
         console.log('Me informaram: '+nome);
      }
      else{
         reseta_input();
         console.log('Me informaram nada');
      }
      
   });
   // Criando o alerta quando clicado no botao de excluir 
   document.body.addEventListener('click', function (e) {
      if (e.target.closest('.delete-btn')) {
         e.preventDefault();

         const btn = e.target.closest('.delete-btn');
         const url = btn.dataset.url;
         const tr = btn.closest('tr');
         const nome = tr.querySelector('#txtNome')?.value || 'Item';
         
         Swal.fire({
            title: 'Tem certeza?',
            text: "Você não poderá desfazer isso!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
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
                  title: 'Tudo ok',
                  text: `"${nome}" agora está inativo!`,
                  icon: 'warning',
                  confirmButtonColor: '#3085d6',
               })
            }
         });
      }
   });
});

