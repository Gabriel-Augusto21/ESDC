$(document).ready(function() {
   $('.delete-btn').on('click', function() {
      let tr = $(this).closest('tr');
      let classificacaoId = tr.data('id');  
      
      fetch(`/apagar_classificacao/?id=${classificacaoId}`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf_token
         }
      })
      .then(response => {
         if (!response.ok) {
            throw new Error("Erro ao deletar");
         }
         return response.json();
      })
      .then(data => {
         console.log("Sucesso!", data);
         tr.remove(); // remove a linha da tabela (opcional)
      })
      .catch(error => {
         console.error("Erro:", error);
      });
   });
});
