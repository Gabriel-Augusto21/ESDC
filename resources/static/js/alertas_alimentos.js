export function ativar(elemento){
    const url = 'url'
    Swal.fire({
        title: 'Tem certeza que deseja ativar essa Alimento?',
      text: "Você poderá desfazer isso mais tarde!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#32CD32',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, ativar',
      cancelButtonText: 'Cancelar'
    }).then(resp => {
        if (resp.isConfirmed) {
            console.log("A ativar: ", elemento.dataset.nome)

        }else{
            console.log("O usuário deseja cancelar")
        }
    });
}
export function desativar(elemento){
    const url = 'url'
    Swal.fire({
        title: 'Tem certeza que deseja desativar ess Alimento?',
        text: "Você poderá desfazer isso mais tarde!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#FF0000',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, desativar',
        cancelButtonText: 'Cancelar'
    }).then(resp => {
        if (resp.isConfirmed) {
            console.log("A desativar: ", elemento.dataset.nome)
        }else{
            console.log("O usuário deseja cancelar")
        }
    });
}
export function atualizar(elemento){
    const url = 'url'
    const id = elemento.dataset.id;
    const nomeAntigo = elemento.closest('tr').querySelector('#txtNome')?.textContent.trim() || '';
    Swal.fire({
        title: 'Atualizar Alimento',
        html: `<input id="swal-nome" class="form-control form-control-sm" placeholder="Nome da Classificação" value="${nomeAntigo}">`,
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
    }).then(resp => {
        if (resp.isConfirmed) {
            console.log("A atualizar: ", resp.value.nome)
        }else{
            console.log("O usuário deseja cancelar")
        }
    });
}