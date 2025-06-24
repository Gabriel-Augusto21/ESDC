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


// 🔁 Atualizar Classificação
export function alerta_update(btn) {
    const id = btn.dataset.id;
    const tr = btn.closest('tr');
    // const nomeAntigo = tr.querySelector('#txtNome')?.textContent.trim() || '';
    const nomeAntigo = btn.dataset.nome;

    Swal.fire({
        title: 'Atualizar Classificação',
        html: `
            <input id="swal-nome" class="swal2-input" value="${nomeAntigo}">
        `,
        confirmButtonText: 'Atualizar',
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

            if (nome === nomeAntigo) {
                Swal.fire({
                    title: 'Erro!',
                    text: `O novo nome é igual ao atual. Tente um nome diferente.`,
                    icon: 'error',
                    confirmButtonColor: '#3085d6',
                });
                return;
            }

            const url = `/atualizar_classificacao/?id=${id}&nome=${encodeURIComponent(nome)}`;

            htmx.ajax('GET', url, { swap: 'none' })
                .then(response => {
                    const resp = JSON.parse(response.xhr.response);
                    if (resp.Mensagem && resp.Mensagem.includes('atualizado com sucesso')) {
                        Swal.fire({
                            title: 'Tudo certo!',
                            text: resp.Mensagem,
                            icon: 'success',
                            confirmButtonColor: '#3085d6',
                        }).then(() => {
                            window.location.reload();
                        });
                    } else {
                        Swal.fire({
                            title: 'Erro!',
                            text: resp.Mensagem || 'Ocorreu um erro na atualização.',
                            icon: 'error',
                            confirmButtonColor: '#d33',
                        });
                    }
                });
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
    }else if(resp.Mensagem.includes('atualizada com sucesso!')) {
        Swal.fire({
            title: 'Tudo certo!',
            text: resp.Mensagem,
            icon: 'success',
            confirmButtonColor: '#3085d6',
        }).then(() =>{
            window.location.reload()
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
