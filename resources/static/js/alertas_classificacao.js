// 🔔 Inserir Classificação
export function alerta_inserir(btn) {
    Swal.fire({
        title: 'Inserir Classificação',
        html: `<input id="swal-nome" class="swal2-input" placeholder="Nome da Classificação">`,
        confirmButtonText: 'Inserir',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
        focusConfirm: false,
        preConfirm: () => {
            const nome = document.getElementById('swal-nome').value.trim();
            if (!nome) {
                Swal.showValidationMessage('O nome da classificação é obrigatório!');
                return false;
            }
            return { nome };
        }
    }).then(result => {
        if (result.isConfirmed) {
            const { nome } = result.value;
            const url = `${btn.dataset.url}?nome=${encodeURIComponent(nome)}`;
            htmx.ajax('GET', url, {
                swap: 'none',
                target: 'body'
            });
        }
    });
}

// Inserção bem sucedida
htmx.on("htmx:afterOnLoad", (event) => {
   const resp = JSON.parse(event.detail.xhr.response);
   if (resp.Mensagem?.includes("inserido com sucesso")) {
      Swal.fire({
         title: 'Sucesso!',
         text: resp.Mensagem,
         icon: 'success',
         confirmButtonColor: '#3085d6',
      }).then(() => {
         window.location.reload();
      });
   }
});
// Erro de inserção
htmx.on("htmx:responseError", (event) => {
   const status = event.detail.xhr.status;
   const resp = JSON.parse(event.detail.xhr.response);

   if (status === 400 && resp.Mensagem?.includes("já existe")) {
      Swal.fire({
         title: 'Erro!',
         text: resp.Mensagem,
         icon: 'error',
         confirmButtonColor: '#3085d6',
      });
   } else {
      Swal.fire({
         title: 'Erro inesperado',
         text: 'Algo deu errado. Tente novamente mais tarde.',
         icon: 'error',
         confirmButtonColor: '#3085d6',
      });
   }
});
export function alerta_update(update_btn){
   const tr = update_btn.closest('tr');
   const nomeAnt = tr.querySelector('#txtNome')?.textContent.trim() || 'Item';
   Swal.fire({
      title: 'Renomear classificação',
      icon: 'info',
      input: "text",
      inputLabel: "Informe um novo nome de classificacao",
      inputValue: nomeAnt,
      confirmButtonColor: '#32CD32',
      confirmButtonText: 'Alterar',
      showCancelButton: true,
   }).then((resultado) => {
      if (resultado.isConfirmed){
         const id = update_btn.dataset.id; // se não tiver, adicione no HTML: data-id="{{ classificacao.id }}"
         const nome = resultado.value;
         const url = `/atualizar_classificacao/?id=${id}&nome=${nome}`;
         console.log(url) 

         
         if(nomeAnt!=nome){
            htmx.ajax('GET', url, {
               swap: 'none'
            });
            Swal.fire({
               title: 'Tudo certo!',
               text: `Classificação '${nomeAnt}' renomeada para '${nome}!'`,
               icon: 'success',
               confirmButtonColor: '#3085d6',
            }).then(() => {
               window.location.reload();
            });
         }else{
            Swal.fire({
               title: 'Erro!',
               text: `Não tem por que renomear '${nomeAnt}' como '${nome}'!
               Tente um nome diferente da próxima vez`,
               icon: 'error',
               confirmButtonColor: '#3085d6',
            }).then(() => {
               window.location.reload();
            });
         }
      }
   });
}
export function alerta_ativar(ativar_btn){
   const url = ativar_btn.dataset.url;
   Swal.fire({
      title: 'Tem certeza que deseja ativar essa Classificação?',
      text: "Você poderá desfazer isso mais tarde!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#32CD32',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, ativar',
      cancelButtonText: 'Cancelar'
   }).then((result) => {
      if (result.isConfirmed) {
         // Dispara HTMX manualmente
         htmx.ajax('GET', url, {
            swap: 'none'
         });
         Swal.fire({
            title: 'Tudo certo!',
            text: `Essa classificacao agora está ativa!`,
            icon: 'success',
            confirmButtonColor: '#3085d6',
         }).then(() => {
            // Redireciona após o usuário fechar o alerta
            window.location.reload();
         });
      }
   });
}
export function alerta_desativar(desativar_btn){
   const url = desativar_btn.dataset.url;
   
   Swal.fire({
      title: 'Tem certeza que deseja desativar essa Classificação?',
      text: "Você poderá desfazer isso mais tarde!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF0000',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, desativar',
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
         }).then(() => {
            // Redireciona após o usuário fechar o alerta
            window.location.href = '/classificacao/';
         });
      }
   });
}