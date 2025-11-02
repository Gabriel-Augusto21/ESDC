function alertaConfirmacao({ titulo, texto, acao, url, dados }) {
    Swal.fire({
        title: titulo,
        text: texto,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#ff0000',
        confirmButtonText: `Sim, ${acao}!`,
        cancelButtonText: 'Cancelar',
        customClass: {
            cancelButton: 'botao-cancela-alerta',
            confirmButton: 'botao-confirma-alerta',
        },
    }).then(result => {
        if (result.isConfirmed) {
            htmx.ajax('GET', url, {
                values: dados,
                swap: 'none'
            });
        }
    });
}

export function desativar(id, nome) {
    alertaConfirmacao({
        titulo: 'Tem certeza que deseja desativar essa dieta?',
        texto: 'Você poderá desfazer isso mais tarde!',
        acao: 'desativar',
        url: '/desativar_dieta/',
        dados: { id, nome }
    });
}

export function ativar(id, nome) {
    alertaConfirmacao({
        titulo: 'Tem certeza que deseja ativar essa dieta?',
        texto: 'Você poderá desfazer isso mais tarde!',
        acao: 'ativar',
        url: '/ativar_dieta/',
        dados: { id, nome }
    });
}

// Feedback após ativar/desativar via HTMX
htmx.on("htmx:afterOnLoad", (event) => {
    const resp = JSON.parse(event.detail.xhr.response);

    if (event.detail.xhr.status === 200) {
        if (resp.Mensagem?.includes('ativado') || resp.Mensagem?.includes('desativado')) {
            Swal.fire({
                title: 'Sucesso!',
                text: resp.Mensagem,
                icon: 'success',
                timer: 3000,
                timerProgressBar: true,
                confirmButtonText: 'Ok',
                confirmButtonColor: '#2f453a',
                customClass: {
                    confirmButton: 'botao-confirma-alerta',
                },
            }).then(() => {
                window.location.reload();
            });
        }
    }
});

export function inserirAlimentoSwal(alimentos, callbackConfirmar) {
    const opcoes = alimentos.map(a => `<option value="${a.id}">${a.nome}</option>`).join('');

    Swal.fire({
        width: '600px',
        title: 'Adicionar Alimento',
        html: `
            <div class="text-start">
                <label class="form-label">Alimento:</label>
                <select id="selAlimentoSwal" class="form-select mb-3">
                    <option value="">Selecione um alimento</option>
                    ${opcoes}
                </select>
                <label class="form-label">Quantidade (kg):</label>
                <input type="number" id="qtdAlimentoSwal" class="form-control" min="0.01" step="0.01" placeholder="Informe a quantidade">
            </div>
        `,
        confirmButtonText: 'Adicionar',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
        confirmButtonColor: '#2f453a',
        cancelButtonColor: '#ff0000',
        customClass: {
            confirmButton: 'botao-confirma-alerta',
            cancelButton: 'botao-cancela-alerta',
        },
        focusConfirm: false,
        preConfirm: () => {
            const alimento = document.getElementById("selAlimentoSwal").value;
            const qtd = parseFloat(document.getElementById("qtdAlimentoSwal").value);

            if (!alimento) {
                Swal.showValidationMessage("Selecione um alimento.");
                return false;
            }
            if (isNaN(qtd) || qtd <= 0) {
                Swal.showValidationMessage("Informe uma quantidade válida (maior que zero).");
                return false;
            }

            const jaExiste = Array.from(document.querySelectorAll('input[name="alimentos[]"]'))
                .some(input => input.value === alimento);
            if (jaExiste) {
                Swal.showValidationMessage("Este alimento já foi adicionado à dieta.");
                return false;
            }

            return { alimento, qtd };
        }
    }).then(res => {
        if (res.isConfirmed && res.value) {
            callbackConfirmar(res.value.alimento, res.value.qtd);
        }
    });
}
