// Variáveis globais
let chartInstance = null;
let history = JSON.parse(localStorage.getItem('bhaskara-history')) || [];

const resultDiv = document.getElementById('result');
const historyList = document.getElementById('historyList');
const btnCalculate = document.getElementById('btnCalculate');
const btnToggleMode = document.getElementById('btnToggleMode');
const btnVoiceInput = document.getElementById('btnVoiceInput');
const body = document.body;

// Funções principais
function renderHistory() {
  historyList.innerHTML = '';
  if (history.length === 0) {
    historyList.innerHTML = '<li>Nenhuma equação resolvida ainda.</li>';
    return;
  }
  history.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `Equação: ${item.a}x² + ${item.b}x + ${item.c} | Raízes: ${item.rootsText}`;
    historyList.appendChild(li);
  });
}

function saveHistory() {
  localStorage.setItem('bhaskara-history', JSON.stringify(history));
}

function apagarGrafico() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}

function gerarGrafico(a, b, c, roots) {
  const ctx = document.getElementById('graphCanvas').getContext('2d');
  apagarGrafico();

  const realRoots = roots.filter(r => typeof r === 'number');
  const minX = Math.min(...realRoots, -10) - 2;
  const maxX = Math.max(...realRoots, 10) + 2;
  const step = 0.5;
  const pontosX = [];
  const pontosY = [];

  for (let x = minX; x <= maxX; x += step) {
    pontosX.push(x.toFixed(1));
    pontosY.push(a * x * x + b * x + c);
  }

  const datasets = [{
    label: 'y = ax² + bx + c',
    data: pontosY,
    borderColor: '#4fa3d1',
    backgroundColor: 'rgba(79, 163, 209, 0.25)',
    fill: true,
    tension: 0.3,
    pointRadius: 0,
  }];

  if (realRoots.length > 0) {
    datasets.push({
      label: 'Raízes',
      data: realRoots.map(r => 0),
      borderColor: '#d14f4f',
      backgroundColor: '#d14f4f',
      pointRadius: 6,
      type: 'scatter',
      showLine: false,
      hoverRadius: 8,
      xAxisID: 'x',
      yAxisID: 'y'
    });
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: pontosX,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: 'x', color: body.classList.contains('dark-mode') ? '#ddd' : '#333', font: { size: 16, weight: 'bold' }},
          ticks: { maxTicksLimit: 11, color: body.classList.contains('dark-mode') ? '#ddd' : '#333' },
          grid: { color: body.classList.contains('dark-mode') ? '#444' : '#ddd' }
        },
        y: {
          title: { display: true, text: 'y', color: body.classList.contains('dark-mode') ? '#ddd' : '#333', font: { size: 16, weight: 'bold' }},
          ticks: { color: body.classList.contains('dark-mode') ? '#ddd' : '#333' },
          grid: { color: body.classList.contains('dark-mode') ? '#444' : '#ddd' }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: body.classList.contains('dark-mode') ? '#ddd' : '#4fa3d1',
            font: { size: 16, weight: 'bold' }
          }
        },
        tooltip: { enabled: true, mode: 'nearest', intersect: false }
      }
    }
  });
}

function calcularBhaskara() {
  const a = parseFloat(document.getElementById('a').value);
  const b = parseFloat(document.getElementById('b').value);
  const c = parseFloat(document.getElementById('c').value);

  resultDiv.textContent = '';
  resultDiv.classList.remove('error');

  if (isNaN(a) || isNaN(b) || isNaN(c)) {
    resultDiv.textContent = 'Por favor, insira valores válidos para todos os coeficientes.';
    resultDiv.classList.add('error');
    apagarGrafico();
    return;
  }
  if (a === 0) {
    resultDiv.textContent = "O coeficiente 'a' não pode ser zero em uma equação quadrática.";
    resultDiv.classList.add('error');
    apagarGrafico();
    return;
  }

  const discriminante = b * b - 4 * a * c;
  let resultado = "";
  let roots = [];

  if (discriminante > 0) {
    const raiz1 = (-b + Math.sqrt(discriminante)) / (2 * a);
    const raiz2 = (-b - Math.sqrt(discriminante)) / (2 * a);
    resultado = `As raízes são: x₁ = ${raiz1.toFixed(2)} e x₂ = ${raiz2.toFixed(2)}`;
    roots = [raiz1, raiz2];
  } else if (discriminante === 0) {
    const raiz = -b / (2 * a);
    resultado = `A raiz única é: x = ${raiz.toFixed(2)}`;
    roots = [raiz];
  } else {
    const parteReal = -b / (2 * a);
    const parteImaginaria = Math.sqrt(-discriminante) / (2 * a);
    resultado = `As raízes são complexas: x₁ = ${parteReal.toFixed(2)} + ${parteImaginaria.toFixed(2)}i e x₂ = ${parteReal.toFixed(2)} - ${parteImaginaria.toFixed(2)}i`;
    resultado += `\n\nRaízes complexas indicam que a parábola não intercepta o eixo X. Elas surgem quando o discriminante (Δ) é negativo, representando números com parte imaginária.`;
    roots = [];
  }

  resultDiv.textContent = resultado;
  // Salvar no histórico
  history.unshift({a, b, c, roots, rootsText: resultado});
  if (history.length > 10) history.pop();
  saveHistory();
  renderHistory();
  gerarGrafico(a, b, c, roots);
}

function toggleMode() {
  body.classList.toggle('dark-mode');
  localStorage.setItem('mode', body.classList.contains('dark-mode') ? 'dark' : 'light');
  // Atualizar gráfico ao modo
  if (chartInstance) {
    chartInstance.options.scales.x.ticks.color = body.classList.contains('dark-mode') ? '#ddd' : '#333';
    chartInstance.options.scales.x.grid.color = body.classList.contains('dark-mode') ? '#444' : '#ddd';
    chartInstance.options.scales.y.ticks.color  = body.classList.contains('dark-mode') ? '#ddd' : '#333';
    chartInstance.options.scales.y.grid.color  = body.classList.contains('dark-mode') ? '#444' : '#ddd';
    chartInstance.options.plugins.legend.labels.color = body.classList.contains('dark-mode') ? '#ddd' : '#4fa3d1';
    chartInstance.update();
  }
}

function initMode() {
  if (localStorage.getItem('mode') === 'dark') {
    body.classList.add('dark-mode');
  }
}

function iniciarReconhecimentoVoz() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Seu navegador não suporta reconhecimento de voz.');
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  btnVoiceInput.textContent = "Fale agora...";
  recognition.start();

  recognition.onresult = event => {
    const fala = event.results[0][0].transcript.toLowerCase();
    const regexA = /a\s*(igual|=)\s*(-?\d+(\.\d+)?)/;
    const regexB = /b\s*(igual|=)\s*(-?\d+(\.\d+)?)/;
    const regexC = /c\s*(igual|=)\s*(-?\d+(\.\d+)?)/;

    let aMatch = fala.match(regexA);
    let bMatch = fala.match(regexB);
    let cMatch = fala.match(regexC);

    if (aMatch) document.getElementById('a').value = parseFloat(aMatch[2]);
    if (bMatch) document.getElementById('b').value = parseFloat(bMatch[2]);
    if (cMatch) document.getElementById('c').value = parseFloat(cMatch[2]);

    btnVoiceInput.textContent = "Entrada por Voz";
    recognition.stop();
  };
  recognition.onerror = () => {
    btnVoiceInput.textContent = "Entrada por Voz";
  };
}

// Geração do QR Code na carga
function gerarQRCode() {
  const qrContainer = document.getElementById('qrCode');
  qrContainer.innerHTML = '';
  new QRCode(qrContainer, {
    text: window.location.href,
    width: 150,
    height: 150
  });
}

document.getElementById('btnCalculate').addEventListener('click', calcularBhaskara);
document.getElementById('btnToggleMode').addEventListener('click', toggleMode);
document.getElementById('btnVoiceInput').addEventListener('click', iniciarReconhecimentoVoz);

window.onload = () => {
  renderHistory();
  initMode();
  gerarQRCode();
};
