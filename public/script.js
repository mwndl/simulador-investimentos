document.addEventListener('DOMContentLoaded', async function () {
    getSelic();
    obterIPCA12();
    setLanguageBasedOnBrowser();
    applyColorScheme(); // service worker
    hasRequiredParameters()
});

function getQueryParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function setQueryParameter(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.replaceState({}, '', url);
}

function setLanguageBasedOnBrowser() {
    const userLanguage = navigator.language || navigator.userLanguage;
    if (userLanguage === 'pt-BR' || userLanguage === 'pt-PT') {
        changeLanguage('pt');
    } else {
        changeLanguage('en');
    }
}

function toggleLanguage() {
    if (selectedLanguage === 'pt') {
        changeLanguage('en')
    } else if (selectedLanguage === 'en') {
        changeLanguage('pt')
    }
}

function changeLanguage(language) {

    if (language === 'pt') {
        brFlag.style.display = 'block'
        usFlag.style.display = 'none'
    } else if (language === 'en') {
        brFlag.style.display = 'none'
        usFlag.style.display = 'block'
    }

    // Atualiza o valor do idioma selecionado na variável global
    selectedLanguage = language;

    const elementsToTranslate = document.querySelectorAll('[id]');
    // Feche o simulador para evitar elementos dinâmicos não traduzidos
    simularNovamenteButton();
    setElementTitles(language);
    showRentInputs();

    elementsToTranslate.forEach(element => {
        const key = element.id;
        if (translations[selectedLanguage][key]) {
            if (element.querySelector('span')) {
                // Tratamento especial para elementos com span
                element.firstChild.textContent = translations[selectedLanguage][key];
            } else {
                // Para outros elementos
                element.textContent = translations[selectedLanguage][key];
            }
        }
    });
}

function setElementTitles(selectedLanguage) {
    document.getElementById('flagDiv').title = translations[selectedLanguage]['flagDivTitle'];
    document.getElementById('simularButton').title = translations[selectedLanguage]['simularButtonTitle'];
    document.getElementById('developerNameLabel').title = translations[selectedLanguage]['developerNameTitle'];
    document.getElementById('bmac2Label').title = translations[selectedLanguage]['bmac2LabelTitle'];
    document.getElementById('github_icon').title = translations[selectedLanguage]['githubIconTitle'];

}

function copyUrl() {
    // Obtém a URL atual do navegador
    var url = window.location.href;

    // Cria um elemento de input para inserir a URL
    var inputElement = document.createElement('input');
    inputElement.style.position = 'fixed';
    inputElement.style.opacity = 0;
    inputElement.value = url;
    document.body.appendChild(inputElement);

    // Seleciona o texto dentro do input
    inputElement.select();

    // Executa o comando de cópia
    document.execCommand('copy');

    // Remove o elemento de input
    document.body.removeChild(inputElement);

    // Alerta ou mensagem de confirmação opcional
    notification(translations[selectedLanguage]['copySuccessful']);
}


/* SISTEMA DE OCULTAR SIMULADORES */
var divSimulator = document.querySelector('.simulator');
var divSimularNovamente = document.querySelector('#simular_novamente');
var divResultados = document.querySelector('#simulador_resultados')

divSimularNovamente.addEventListener('click', simularNovamenteButton());

function simularNovamenteButton() {
    divSimularNovamente.style.display = 'none'
    divResultados.style.display = 'none'

    if (divSimulator.style.display === 'none') {
        divSimulator.style.display = 'block';
    }
    hideCharts()
}

/*  ************************ */

function notification(customMessage) {
    const notification_div = document.getElementById("notification");
    const message = document.getElementById("notification-message");
    message.textContent = customMessage;
    notification_div.style.opacity = 1;
    notification_div.classList.remove("hidden");

    setTimeout(() => {
        notification_div.style.opacity = 0;
        setTimeout(() => {
            notification_div.classList.add("hidden");
            message.textContent = ''
            message.style = ''
        }, 500);
    }, 4000); // Tempo de exibição
};

// Formatar valores monetários (inputs valor inicial e mensal)
var valorInicialInput = document.getElementById('valor_inicial');
var valorMensalInput = document.getElementById('valor_mensal');
var rentPreInput = document.getElementById('rent_input_pre');

formatarValorInicial();
formatarValorMensal();

valorInicialInput.addEventListener('input', formatarValorInicial);
valorMensalInput.addEventListener('input', formatarValorMensal);
rentPreInput.addEventListener('input', formatarRentPre);

function formatarValorInicial() {
    valorInicialInput.value = formatarValor(valorInicialInput.value);
}

function formatarValorMensal() {
    valorMensalInput.value = formatarValor(valorMensalInput.value);
}

function formatarRentPre() {
    rentPreInput.value = replaceCommas(rentPreInput.value)
}

function formatarValor(valor) {
    valor = valor.replace(/\D/g, ''); // Remove todos os caracteres que não são dígitos
    if (valor.indexOf('.') !== -1) { // Verifica se o valor é decimal
        var partes = valor.split('.'); // Divide o valor em partes inteira e decimal
        valor = partes[0].replace(/^0+/, '') + '.' + partes[1]; // Remove zeros à esquerda apenas da parte inteira
    } else if (valor.length > 2) {
        valor = valor.replace(/^0+/, ''); // Remove zeros à esquerda
        valor = valor.replace(/(\d{2})$/, ',$1'); // Insere vírgula antes dos últimos dois dígitos
        if (valor.startsWith(',')) {
            valor = '0' + valor; // Adiciona zero à esquerda se começar com vírgula
        }
    } else if (valor.length === 2) {
        valor = '0,' + valor;
    } else if (valor.length === 1) {
        valor = '0,0' + valor;
    }

    // Formatação para números acima de 1000,00
    if (parseFloat(valor) >= 1000) {
        var partes = valor.split(',');
        var parteInteira = partes[0];
        var parteDecimal = partes.length > 1 ? ',' + partes[1] : '';
        parteInteira = parteInteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Adiciona ponto a cada três dígitos da parte inteira
        valor = parteInteira + parteDecimal;
    }

    return valor;
}

// Função para formatar a data no formato dd/mm/yyyy
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Exibir e ocultar inputs de rentabilidade com base no tipo
var radios = document.getElementsByName('rentabilidade_tipo');
radios.forEach(function (radio) {
    radio.addEventListener('change', showRentInputs);
});

function showRentInputs() {
    var radios = document.getElementsByName('rentabilidade_tipo');

    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            var valorSelecionado = radios[i].value;

            // Executar ação com base no valor selecionado
            switch (valorSelecionado) {
                case 'pos_radio':
                    document.getElementById('rent_pos').style.display = 'flex';
                    document.getElementById('rent_pre').style.display = 'none';
                    document.getElementById('rent_ipca').style.display = 'none';
                    document.getElementById('rent_poupanca').style.display = 'none';
                    document.getElementById('rentDescription'). textContent = `${translations[selectedLanguage]['rentDescriptionPOS'] + (selicValue - 0.1)}%`;

                    break;
                case 'pre_radio':
                    document.getElementById('rent_pre').style.display = 'flex';
                    document.getElementById('rent_pos').style.display = 'none';
                    document.getElementById('rent_ipca').style.display = 'none';
                    document.getElementById('rent_poupanca').style.display = 'none';
                    document.getElementById('rentDescription'). textContent = ''

                    break;
                case 'ipca_radio':
                    document.getElementById('rent_ipca').style.display = 'flex';
                    document.getElementById('rent_pos').style.display = 'none';
                    document.getElementById('rent_pre').style.display = 'none';
                    document.getElementById('rent_poupanca').style.display = 'none';
                    document.getElementById('rentDescription'). textContent = `${translations[selectedLanguage]['rentDescriptionIPCA']+ ipca12Value.toFixed(2)}%`;

                    break;
                default:
                    document.getElementById('rent_pos').style.display = 'block';
                    document.getElementById('rent_pre').style.display = 'none';
                    document.getElementById('rent_ipca').style.display = 'none';
                    document.getElementById('rent_poupanca').style.display = 'none';
            }
        }
    }
}

function converterReais(valor) {
    // Utiliza toLocaleString para formatar o número
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function converterParaDuasCasas(valor) {
    return valor.toFixed(2).replace('.', ',');
}

let selicValue; // Definindo a variável global
let ipca12Value; // Definindo a variável global
let trValue;
let rentPoupanca;

async function getSelic() {
    try {
        // Faz a solicitação usando a API Fetch
        const response = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json');

        // Verifica se a resposta da API foi bem-sucedida
        if (!response.ok) {
            throw new Error('Erro ao obter os dados. Status: ' + response.status);
        }

        // Obtém o valor SELIC da resposta
        const data = await response.json();
        selicValue = data[0].valor; // Definindo o valor da variável global

        // Retorna o valor SELIC
        return selicValue;
    } catch (error) {
        // Lança o erro para ser tratado pelo chamador da função
        document.getElementById('pos_radio_display').style.display = 'none'
        throw error;
    }
}

async function obterIPCA12() {
    const hoje = new Date();
    const umAnoAtras = new Date();
    umAnoAtras.setFullYear(hoje.getFullYear() - 1);

    // Formatando as datas
    const mesAnoFinal = `${hoje.getMonth() + 1}`.padStart(2, '0') + '/' + hoje.getFullYear();
    const mesAnoInicial = `${umAnoAtras.getMonth() + 1}`.padStart(2, '0') + '/' + umAnoAtras.getFullYear();
    const dataInicial = `01/${mesAnoInicial}`;
    const dataFinal = `01/${mesAnoFinal}`;

    try {
        const response = await fetch(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json&dataInicial=${dataInicial}&dataFinal=${dataFinal}`);
        const data = await response.json();

        // Calcular o IPCA acumulado nos últimos 12 meses de forma multiplicativa
        let ipcaAcumulado = 1; // Começa com 1 para multiplicação
        data.forEach(item => {
            ipcaAcumulado *= (1 + parseFloat(item.valor) / 100); // Convertendo para decimal
        });

        // Calcular o IPCA acumulado nos últimos 12 meses em porcentagem
        const ipca12Meses = (ipcaAcumulado - 1) * 100;

        ipca12Value = ipca12Meses
        return ipca12Meses
    } catch (error) {
        document.getElementById('ipca_radio_display').style.display = 'none'
        console.error('Erro ao obter os dados do IPCA:', error);
    }
}


async function getTRMediaMensal() {
    try {
        // Data de hoje
        const dataFinal = new Date();

        // Data inicial (30 dias atrás)
        const dataInicial = new Date();
        dataInicial.setDate(dataInicial.getDate() - 30);

        // Formata as datas
        const dataInicialFormatada = formatDate(dataInicial);
        const dataFinalFormatada = formatDate(dataFinal);

        // URL da API com as datas formatadas
        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.226/dados?formato=json&dataInicial=${dataInicialFormatada}&dataFinal=${dataFinalFormatada}`;

        // Faz a solicitação usando a API Fetch
        const response = await fetch(url);

        // Verifica se a resposta da API foi bem-sucedida
        if (!response.ok) {
            throw new Error('Erro ao obter os dados. Status: ' + response.status);
        }

        // Obtém os dados da resposta
        const data = await response.json();

        // Calcula a média dos valores de TR
        const valores = data.map(item => parseFloat(item.valor));
        const soma = valores.reduce((acc, valor) => acc + valor, 0);
        const mediaTR = soma / valores.length;

        // Atualiza a variável trValue
        trValue = mediaTR;

        // Retorna a média
        return mediaTR;
    } catch (error) {
        // Lança o erro para ser tratado pelo chamador da função
        throw error;
    }
}

function getPoupancaRent() {

    if (selicValue < 8.5) {
        // Selic abaixo de 8.5%
        rentPoupanca = selicValue * 0.7;
    } else {
        // Selic acima de 8.5%
        let monthlyRate = 0.005; // 0.5% em decimal
        rentPoupanca = (Math.pow(1 + monthlyRate, 12) - 1) * 100; // Calcula a rentabilidade anual
    }
    return rentPoupanca;
}

// Função que será acionada quando o estado de um radio button mudar
function handleRadioChange(event) {
    const selectedValue = event.target.value;

    // Realiza ações específicas com base no valor selecionado
    switch (selectedValue) {
        case 'cdb_radio':
            showRendType()
            break;
        case 'lci_radio':
            showRendType()
            break;
        case 'tesouro_radio':
            showRendType()
            break;
        case 'poupanca_radio':
            hideRentType()
            let rentPoupanca = getPoupancaRent();

            document.getElementById('rent_pos').style.display = 'none';
            document.getElementById('rent_pre').style.display = 'none';
            document.getElementById('rent_ipca').style.display = 'none';
            document.getElementById('rent_poupanca').style.display = 'flex';
            document.getElementById('rent_input_poupanca').value = rentPoupanca.toFixed(2)

            break;
        default:
            console.log("Nenhuma opção válida selecionada");
            break;
    }
}

function hideRentType() {
    document.getElementById('rentDescription'). textContent = ''
    document.getElementById('unavailable_overlay').style.display = 'block';
    const rentabilidadeRadios = document.querySelectorAll('input[name="rentabilidade_tipo"]');
    rentabilidadeRadios.forEach(radio => {
        radio.checked = false;
    });
}

function showRendType() {
    document.getElementById('unavailable_overlay').style.display = 'none';
    document.getElementById('rentDescription'). textContent = ''

    document.getElementById('rent_pos').style.display = 'none';
    document.getElementById('rent_pre').style.display = 'none';
    document.getElementById('rent_ipca').style.display = 'none';
    document.getElementById('rent_poupanca').style.display = 'none';

    const rentabilidadeRadios = document.querySelectorAll('input[name="rentabilidade_tipo"]');
    rentabilidadeRadios.forEach(radio => {
        radio.checked = false;
    });
}

// Seleciona todos os inputs de radio
const radioButtons = document.querySelectorAll('input[name="investimento_tipo"]');

// Adiciona um event listener para cada radio button
radioButtons.forEach(radio => {
    radio.addEventListener('change', handleRadioChange);
});

function hasRequiredParameters() {
    const requiredParams = [
        'initial_value', 
        'monthly_value', 
        'term', 
        'yield', 
        'description', 
        'yd',
        'taxes'
    ];

    const urlParams = new URLSearchParams(window.location.search);
    for (let param of requiredParams) {
        if (!urlParams.has(param)) {
            return false;
        }
    }

    // Extraindo os valores dos parâmetros
    const initialValue = parseFloat(urlParams.get('initial_value'));
    const monthlyValue = parseFloat(urlParams.get('monthly_value'));
    const term = parseInt(urlParams.get('term'), 10);
    const yieldRate = parseFloat(urlParams.get('yield'));
    const description = String(urlParams.get('description'));
    const rent_description = String(urlParams.get('yd'))
    const taxes = String(urlParams.get('taxes'));

    // Chama a função calcularInvestimento com os parâmetros extraídos
    calcularInvestimento(initialValue, monthlyValue, term, yieldRate, description, rent_description, taxes);
    return true;
}


function calcularInvestimento(valorInicial, valorMensal, prazoMeses, rentabilidadeInicial, descricao, rentabilidadeDescriptionValue, calcularImposto) {

    valorInicial = valorInicial || 0;
    valorMensal = valorMensal || 0;

    gerarTabelaInvestimento(valorInicial, valorMensal, prazoMeses, rentabilidadeInicial);
    setQueryParameter("initial_value", valorInicial)
    setQueryParameter("monthly_value", valorMensal)
    setQueryParameter("term", prazoMeses)
    setQueryParameter("yield", rentabilidadeInicial)
    setQueryParameter("description", descricao)
    setQueryParameter("yd", rentabilidadeDescriptionValue)
    setQueryParameter("taxes", calcularImposto)

    // Calcula a rentabilidade mensal com base na anual
    var rentabFinal = rentabilidadeInicial / 100;
    var rentabilidadeMensal = Math.pow(1 + rentabFinal, 1 / 12) - 1;

    // Calcula o valor futuro dos depósitos mensais
    var montanteFinal = 0;
    for (var i = 1; i <= prazoMeses; i++) {
        montanteFinal += valorMensal * Math.pow(1 + rentabilidadeMensal, prazoMeses - i);
    }

    // Adiciona o valor futuro do investimento inicial
    montanteFinal += valorInicial * Math.pow(1 + rentabilidadeMensal, prazoMeses);

    // Arredonda para duas casas decimais
    montanteFinal = Math.round(montanteFinal * 100) / 100;

    // Calcula o total bruto, o total investido e a rentabilidade
    var totalBruto = montanteFinal;
    var totalInvestido = valorInicial + (valorMensal * prazoMeses);
    var rentabilidade = totalBruto - totalInvestido;

    // Calcula o imposto
    var aliquotaImposto = 0;
    var imposto = 0;
    var prazoDias = prazoMeses * 30;

    if (calcularImposto === '1') {
        if (prazoDias < 180) {
            aliquotaImposto = 22.5;
            imposto = rentabilidade * 0.225;
        } else if (prazoDias < 360) {
            aliquotaImposto = 20;
            imposto = rentabilidade * 0.20;
        } else if (prazoDias < 720) {
            aliquotaImposto = 17.5;
            imposto = rentabilidade * 0.175;
        } else {
            aliquotaImposto = 15;
            imposto = rentabilidade * 0.15;
        }

        // Arredonda o imposto para duas casas decimais
        imposto = Math.round(imposto * 100) / 100;
    }

    if (descricao === '1') {
        descricao = `${translations[selectedLanguage]['description1'] + rentabilidadeDescriptionValue}%`
    } else if (descricao === '2') {
        descricao = `${translations[selectedLanguage]['description2'] + rentabilidadeDescriptionValue}%`
    } else if (descricao === '3') {
        descricao = `${translations[selectedLanguage]['description3'] + rentabilidadeDescriptionValue}%`
    } else if (descricao === '4') {
        descricao = `${translations[selectedLanguage]['description4'] + rentabilidadeDescriptionValue}%`
    } else if (descricao === '5') {
        descricao = `${translations[selectedLanguage]['description5'] + rentabilidadeDescriptionValue}%`
    } else if (descricao === '6') {
        descricao = `${translations[selectedLanguage]['description6'] + rentabilidadeDescriptionValue}%`
    } else if (descricao === '7') {
        descricao = `${translations[selectedLanguage]['description7'] + rentabilidadeDescriptionValue}%`
    } else if (descricao === '8') {
        descricao = `${translations[selectedLanguage]['description8'] + rentabilidadeDescriptionValue}%`
    } else if (descricao === '9') {
        descricao = `${translations[selectedLanguage]['description9'] + rentabilidadeDescriptionValue}%`
    } else if (descricao === '10') {
        descricao = `${translations[selectedLanguage]['description10']}`
    } else {
        descricao = '-'
    }

    // Calcula as porcentagens
    var percentInvestido = totalInvestido / totalBruto;
    var percentJuros = rentabilidade / totalBruto;
    var percentImpostos = imposto / totalBruto;

    // Certifica que as porcentagens são arredondadas corretamente para somarem 1
    var totalPercent = percentInvestido + percentJuros + percentImpostos;
    percentInvestido /= totalPercent;
    percentJuros /= totalPercent;
    percentImpostos /= totalPercent;

    /* EXIBINDO OS TOTAIS */
    var valorBrutoDiv = document.getElementById('valor_bruto');
    var totalInvestidoDiv = document.getElementById('total_investido');
    var rendimentoJurosDiv = document.getElementById('rendimento_juros');
    var aliquotaDiv = document.getElementById('aliquota_ir');
    var impostoRendaDiv = document.getElementById('imposto_renda');
    var totalLiquidoDiv = document.getElementById('total_liquido');

    var investimentoInicialP = document.getElementById('investimento_inicial_p');
    var investimentoMensalP = document.getElementById('investimento_mensal_p');
    var prazoP = document.getElementById('prazo_p');
    var rentabilidadeP = document.getElementById('rentabilidade_p');
    var tipoInvestimentoP = document.getElementById('tipo_de_investimento_p');

    valorBrutoDiv.textContent = converterReais(montanteFinal);
    totalInvestidoDiv.textContent = converterReais(totalInvestido);
    rendimentoJurosDiv.textContent = converterReais(rentabilidade);
    aliquotaDiv.textContent = `${aliquotaImposto} %`;
    impostoRendaDiv.textContent = converterReais(imposto);
    totalLiquidoDiv.textContent = converterReais(montanteFinal - imposto);

    divSimulator.style.display = 'none';
    divSimularNovamente.style.display = 'flex';
    divResultados.style.display = 'block';

    investimentoInicialP.textContent = converterReais(valorInicial);
    investimentoMensalP.textContent = converterReais(valorMensal);
    prazoP.textContent = `${prazoDias} ${translations[selectedLanguage]['days']}`;
    rentabilidadeP.textContent = `${converterParaDuasCasas(rentabilidadeInicial)}% ${translations[selectedLanguage]['perYear']}`;
    tipoInvestimentoP.textContent = descricao;

    // Calcula os valores de start e end para cada segmento
    var startInvestido = 0;
    var endInvestido = percentInvestido;
    var startJuros = endInvestido;
    var endJuros = startJuros + percentJuros;
    var startImpostos = endJuros;
    var endImpostos = 1;  // Finaliza em 1 (100%)

    // Atualiza o gráfico de pizza
    var myChartDiv = document.getElementById('my-chart');
    myChartDiv.innerHTML = `
    <table class="charts-css pie">
        <tr>
          <td style="--start: ${startInvestido}; --end: ${endInvestido};"> <span class="data"></span> </td>
        </tr>
        <tr>
          <td style="--start: ${startJuros}; --end: ${endJuros};"> <span class="data"></span> </td>
        </tr>
        <tr>
          <td style="--start: ${startImpostos}; --end: ${endImpostos};"> <span class="data"></span> </td>
        </tr>
    </table>
`;
}

/* BOTÕES SELETORES */

function showTable() {
    const tableButton = document.getElementById('table_selector');
    const chart1Button = document.getElementById('pie_chart_selector');
    const chart2Button = document.getElementById('lines_chart_selector');

    const tableContainer = document.getElementById('evolution_table');
    const chart1Container = document.getElementById('pie_chart');
    const chart2Container = document.getElementById('lines_chart');

    tableButton.className = 'impr_menu_true'
    chart1Button.className = 'impr_menu_false'
    chart2Button.className = 'impr_menu_false'

    tableContainer.style = 'display:block'
    chart1Container.style = 'display:none'
    chart2Container.style = 'display:none'
}

function showChart1() {
    const tableButton = document.getElementById('table_selector');
    const chart1Button = document.getElementById('pie_chart_selector');
    const chart2Button = document.getElementById('lines_chart_selector');

    const tableContainer = document.getElementById('evolution_table');
    const chart1Container = document.getElementById('pie_chart');
    const chart2Container = document.getElementById('lines_chart');

    tableButton.className = 'impr_menu_false'
    chart1Button.className = 'impr_menu_true'
    chart2Button.className = 'impr_menu_false'

    tableContainer.style = 'display:none'
    chart1Container.style = 'display:flex'
    chart2Container.style = 'display:none'
}

function showChart2() {
    const tableButton = document.getElementById('table_selector');
    const chart1Button = document.getElementById('pie_chart_selector');
    const chart2Button = document.getElementById('lines_chart_selector');

    const tableContainer = document.getElementById('evolution_table');
    const chart1Container = document.getElementById('pie_chart');
    const chart2Container = document.getElementById('lines_chart');

    tableButton.className = 'impr_menu_false'
    chart1Button.className = 'impr_menu_false'
    chart2Button.className = 'impr_menu_true'

    tableContainer.style = 'display:none'
    chart1Container.style = 'display:none'
    chart2Container.style = 'display:block'
}

function hideCharts() {
    const tableButton = document.getElementById('table_selector');
    const chart1Button = document.getElementById('pie_chart_selector');
    const chart2Button = document.getElementById('lines_chart_selector');

    const tableContainer = document.getElementById('evolution_table');
    const chart1Container = document.getElementById('pie_chart');
    const chart2Container = document.getElementById('lines_chart');

    tableButton.className = 'impr_menu_false'
    chart1Button.className = 'impr_menu_false'
    chart2Button.className = 'impr_menu_false'

    tableContainer.style = 'display:none'
    chart1Container.style = 'display:none'
    chart2Container.style = 'display:none'
}

/* ***************** */
function gerarTabelaInvestimento(valorInicial, valorMensal, prazoMeses, rentabilidadeInicial) {
    var tabelaHTML = '<table id="tabela-investimento">';
    tabelaHTML += `<tr>
        <th>${translations[selectedLanguage]['monthLabel']}</th>
        <th>${translations[selectedLanguage]['monthlyInterestLabel']}</th>
        <th>${translations[selectedLanguage]['appliedValueLabel']}</th>
        <th>${translations[selectedLanguage]['totalInterestLabel']}</th>
        <th>${translations[selectedLanguage]['accumulatedTotalLabel']}</th>
    </tr>`;

    var rentabFinal = rentabilidadeInicial / 100;
    var rentabilidadeMensal = Math.pow(1 + rentabFinal, 1 / 12) - 1;

    var totalInvestido = valorInicial;
    var totalJurosAcumulado = 0;
    var totalAcumulado = valorInicial;

    var valoresInvestidos = [totalInvestido];
    var valoresTotais = [totalAcumulado];

    tabelaHTML += '<tr>';
    tabelaHTML += `<td>0</td>`;
    tabelaHTML += `<td>R$ 0,00</td>`;
    tabelaHTML += `<td>${converterReais(totalInvestido)}</td>`;
    tabelaHTML += `<td>R$ 0,00</td>`;
    tabelaHTML += `<td>${converterReais(totalAcumulado)}</td>`;
    tabelaHTML += '</tr>';

    for (var i = 1; i <= prazoMeses; i++) {
        var jurosMensais = totalAcumulado * rentabilidadeMensal;
        totalInvestido += valorMensal;
        totalJurosAcumulado += jurosMensais;
        totalAcumulado += valorMensal + jurosMensais;

        valoresInvestidos.push(totalInvestido);
        valoresTotais.push(totalAcumulado);

        tabelaHTML += '<tr>';
        tabelaHTML += `<td>${i}</td>`;
        tabelaHTML += `<td>${converterReais(jurosMensais)}</td>`;
        tabelaHTML += `<td>${converterReais(totalInvestido)}</td>`;
        tabelaHTML += `<td>${converterReais(totalJurosAcumulado)}</td>`;
        tabelaHTML += `<td>${converterReais(totalAcumulado)}</td>`;
        tabelaHTML += '</tr>';
    }

    tabelaHTML += '</table>';
    document.getElementById('table').innerHTML = tabelaHTML;

}



function replaceCommas(input) {
    return input.replace(/\./g, ',');
}

function converterParaFloat(valor) {
    // Remove o '.' que separa a casa milhar
    valor = valor.replace(/\./g, '');
    // Substitui a vírgula por um ponto
    valor = valor.replace(',', '.');
    return parseFloat(valor);
}

function handleSimulation() {

    // Obtém os valores dos campos de entrada e converte para float usando a função converterParaFloat
    var valorInicial = converterParaFloat(document.getElementById('valor_inicial').value);
    var valorMensal = converterParaFloat(document.getElementById('valor_mensal').value);
    var rentabilidadePos = converterParaFloat(document.getElementById('rent_input_pos').value);
    var rentabilidadePre = converterParaFloat(document.getElementById('rent_input_pre').value);
    var rentabilidadeIpca = converterParaFloat(document.getElementById('rent_input_ipca').value);

    var prazo = parseFloat(document.getElementById('prazo').value);
    var prazoTipo = document.getElementById('time_period').value;
    var tipoInvestimentoElement = document.querySelector('input[name="investimento_tipo"]:checked');
    var tipoRentabilidadeElement = document.querySelector('input[name="rentabilidade_tipo"]:checked');


    if (tipoInvestimentoElement) {
        var tipoInvestimento = tipoInvestimentoElement.value;
    }

    if (tipoRentabilidadeElement) {
        var tipoRentabilidade = tipoRentabilidadeElement.value;
    }


    // tratamento de erros
    if (!valorInicial && !valorMensal) {
        notification(translations[selectedLanguage]['missingValueError'])
        return
    }

    if (tipoInvestimento !== "poupanca_radio") {

        if (!(tipoInvestimentoElement && tipoRentabilidadeElement)) {
            notification(translations[selectedLanguage]['selectTypeAndProfitError'])
            return
        }

    }

    if (!prazo) {
        notification(translations[selectedLanguage]['missingTermError'])
        return
    }


    // converter prazo para meses (caso em anos)
    if (prazoTipo === "2") {
        prazoFinal = prazo * 12;
    } else if (prazoTipo === "1") {
        prazoFinal = prazo;
    } else if (prazoTipo === "0") {
        prazoFinal = prazo / 30;
    }

    valorInicial = valorInicial || 0;
    valorMensal = valorMensal || 0;

    /* CDBs */
    if (tipoInvestimento === "cdb_radio") {

        /* CDB PÓS-FIXADO */
        if (tipoRentabilidade === "pos_radio") {
            var descricao = '1' // CBD Pós-Fixado


            if (!rentabilidadePos) {
                notification(translations[selectedLanguage]['missingProfitError'])
                return
            }

            // calcula a rentabilidade mensal com base na anual
            var cdiValue = selicValue - 0.1;
            var rentabilidade = rentabilidadePos * cdiValue / 100;

            calcularInvestimento(valorInicial, valorMensal, prazoFinal, rentabilidade, descricao, rentabilidadePos, '1')



            /* CDB PRÉ-FIXADO */
        } else if (tipoRentabilidade === "pre_radio") {
            var descricao = '2' // CBD Pré-Fixado


            if (!rentabilidadePre) {
                notification(translations[selectedLanguage]['missingProfitError'])
                return
            }

            calcularInvestimento(valorInicial, valorMensal, prazoFinal, rentabilidadePre, descricao, rentabilidadePre, '1')

            /* CDB IPCA */
        } else if (tipoRentabilidade === "ipca_radio") {
            var descricao = '3' // CBD IPCA+

            if (!rentabilidadeIpca) {
                notification(translations[selectedLanguage]['missingProfitError'])
                return
            }

            rentabilidade = ipca12Value + rentabilidadeIpca

            calcularInvestimento(valorInicial, valorMensal, prazoFinal, rentabilidade, descricao, rentabilidadeIpca, '1')
        }

        /* LCIs */
    } else if (tipoInvestimento === "lci_radio") {

        /* LCI PÓS-FIXADO */
        if (tipoRentabilidade === "pos_radio") {
            var descricao = '4' // LCI/LCA Pós-Fixado

            if (!rentabilidadePos) {
                notification(translations[selectedLanguage]['missingProfitError'])
                return
            }

            // calcula a rentabilidade mensal com base na anual
            var cdiValue = selicValue - 0.1;
            var rentabilidade = rentabilidadePos * cdiValue / 100;

            calcularInvestimento(valorInicial, valorMensal, prazoFinal, rentabilidade, descricao, rentabilidadePos, '0')


            // rentabilidade pós-fixada
        } else if (tipoRentabilidade === "pre_radio") {
            var descricao = '5' // LCI/LCA Pré-Fixado

            if (!rentabilidadePre) {
                notification(translations[selectedLanguage]['missingProfitError'])
                return
            }

            calcularInvestimento(valorInicial, valorMensal, prazoFinal, rentabilidadePre, descricao, rentabilidadePre, '0')

        } else if (tipoRentabilidade === "ipca_radio") {
            var descricao = '6' // LCI/LCA IPCA+

            if (!rentabilidadeIpca) {
                notification(translations[selectedLanguage]['missingProfitError'])
                return
            }

            rentabilidade = ipca12Value + rentabilidadeIpca

            calcularInvestimento(valorInicial, valorMensal, prazoFinal, rentabilidade, descricao, rentabilidadeIpca, '0')

        }

    } else if (tipoInvestimento === "tesouro_radio") {

        // rentabilidade pós-fixada
        if (tipoRentabilidade === "pos_radio") {
            var descricao = '7' // Tesouro Direto Pós-Fixado

            if (!rentabilidadePos) {
                notification(translations[selectedLanguage]['missingProfitError'])
                return
            }

            // calcula a rentabilidade mensal com base na anual
            var cdiValue = selicValue - 0.1;
            var rentabilidade = rentabilidadePos * cdiValue / 100;

            calcularInvestimento(valorInicial, valorMensal, prazoFinal, rentabilidade, descricao, rentabilidadePos, '1')

            // rentabilidade pós-fixada
        } else if (tipoRentabilidade === "pre_radio") {
            var descricao = '8' // Tesouro Direto Pré-Fixado

            if (!rentabilidadePre) {
                notification(translations[selectedLanguage]['missingProfitError'])
                return
            }

            calcularInvestimento(valorInicial, valorMensal, prazoFinal, rentabilidadePre, descricao, rentabilidadePre, '1')

        } else if (tipoRentabilidade === "ipca_radio") {
            var descricao = '9' // Tesouro Direto IPCA+

            if (!rentabilidadeIpca) {
                notification(translations[selectedLanguage]['missingProfitError'])
                return
            }

            rentabilidade = ipca12Value + rentabilidadeIpca

            calcularInvestimento(valorInicial, valorMensal, prazoFinal, rentabilidade, descricao, rentabilidadeIpca, '1')

        }

    } else if (tipoInvestimento === "poupanca_radio") {
        var descricao = '10' // Poupança

        rentabilidade = getPoupancaRent()
        calcularInvestimento(valorInicial, valorMensal, prazoFinal, rentabilidade, descricao, null, '0')
    }
}

// Calcular investimento ao clicar no botão "Simular"
document.getElementById('simularButton').addEventListener('click', handleSimulation);

/* DISABLE PINCH AND ZOOM */

document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});

document.addEventListener('gesturechange', function (e) {
    e.preventDefault();
});

document.addEventListener('gestureend', function (e) {
    e.preventDefault();
});

/* SERVICE WORKER */

// Detectar o esquema de cores do usuário e aplicar a cor de fundo correspondente
function applyColorScheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // O usuário prefere tema escuro
        document.documentElement.style.setProperty('--background-color', '#181818');
        document.documentElement.style.setProperty('--theme_color', '#181818');
    } else {
        // O usuário prefere tema claro
        document.documentElement.style.setProperty('--background-color', '#fafafa');
        document.documentElement.style.setProperty('--theme_color', '#181818');
    }
}

// Ouvir por mudanças na preferência de esquema de cores
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyColorScheme);

function registerServiceWorker() {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
            console.log('Service Worker registrado com sucesso:', registration);

            // Verificar se existe um Service Worker esperando para ser ativado
            if (registration.waiting) {
                updateServiceWorker(registration);
                return;
            }

            // Verificar se existe um Service Worker instalando
            if (registration.installing) {
                trackInstalling(registration.installing);
                return;
            }

            // Ouvir mudanças no estado do Service Worker
            registration.addEventListener('updatefound', () => {
                trackInstalling(registration.installing);
            });
        }).catch(error => {
            console.log('Falha ao registrar o Service Worker:', error);
        });
}

function trackInstalling(worker) {
    worker.addEventListener('statechange', () => {
        if (worker.state === 'installed') {
            updateServiceWorker(worker);
        }
    });
}

function updateServiceWorker(worker) {
    worker.postMessage({ type: 'SKIP_WAITING' });
}

navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        registerServiceWorker();
    });
}
