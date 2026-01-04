// Väike abiteade, et näed kas skript üldse laeb
console.log('EVKI app: script.js laaditud');

let allQuestions = [];
let quizQuestions = [];

// Initsialiseeri kui DOM on valmis
window.addEventListener('DOMContentLoaded', init);

async function init() {
  console.log('EVKI app: DOM valmis');
  // Lisa nupuvajutused JS-ist (väldime onclick attri)
  const checkBtn = document.getElementById('checkBtn');
  const newBtn   = document.getElementById('newBtn');

  if (checkBtn) checkBtn.addEventListener('click', submitQuiz);
  if (newBtn)   newBtn.addEventListener('click', newTest);

  // Lae küsimused ja alusta
  await loadQuestions();
  startQuiz();
}

async function loadQuestions() {
  const errEl = document.getElementById('error');
  if (errEl) errEl.textContent = '';
  try {
    // Cache-busting, et GitHub Pages ei annaks vana faili
    const res = await fetch('./questions.json?v=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    const data = JSON.parse(text); // annab vea kui JSON on katki
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Tyhi või vale formaadis JSON');
    }
    allQuestions = data;
    console.log('EVKI app: questions.json laaditud, kirjeid:', data.length);
  } catch (e) {
    console.warn('EVKI app: JSON load/parse error:', e);
    if (errEl) errEl.textContent = 'Hoiatus: questions.json ei laadinud. Kasutan näidisküsimusi.';
    // Fallback – et leht kindlasti toimiks (3 näidisküsimust)
    allQuestions = [
      {
        question: 'Mis on ettevõtluskeskkond?',
        options: [
          'Ainult ettevõtte sisekeskkond',
          'Ettevõtet ümbritsev sise- ja välistegurite kogum',
          'Ainult makrokeskkond',
          'Ainult seadusandlus'
        ],
        correct: 1
      },
      {
        question: 'Mis on PESTLE analüüs?',
        options: [
          'Finantsanalüüs',
          'Turundusanalüüs',
          'Makrokeskkonna analüüs',
          'Konkurentsianalüüs'
        ],
        correct: 2
      },
      {
        question: 'Millisteks keskkondadeks jaguneb ettevõtluskeskkond?',
        options: [
          'Sisekeskkond ja väliskeskkond',
          'Avalik ja erasektor',
          'Kohalik ja globaalne',
          'Tööstus ja teenused'
        ],
        correct: 0
      }
    ];
    console.log('EVKI app: fallback-küsimused kasutusel');
  }
}

function startQuiz() {
  quizQuestions = shuffleArray(allQuestions).slice(0, 20);
  renderQuiz();
  const resultEl = document.getElementById('result');
  if (resultEl) resultEl.textContent = '';
}

function renderQuiz() {
  const quizDiv = document.getElementById('quiz');
  quizDiv.innerHTML = '';

  quizQuestions.forEach((q, index) => {
    let html = `<div class="question">
      <p><strong>${index + 1}. ${escapeHtml(q.question)}</strong></p>`;

    q.options.forEach((option, i) => {
      html += `
        <label>
          <input type="radio" name="q${index}" value="${i}">
          ${escapeHtml(option)}
        </label><br>`;
    });

    html += `</div>`;
    quizDiv.innerHTML += html;
  });
}

function submitQuiz() {
  let score = 0;

  quizQuestions.forEach((q, index) => {
    const selected = document.querySelector(`input[name="q${index}"]:checked`);
    const optionInputs = document.querySelectorAll(`input[name="q${index}"]`);

    // Lukusta valikud pärast kontrolli
    optionInputs.forEach(inp => { inp.disabled = true; });

    // Märgi õige vastuse <label> roheliseks
    const correctInput = document.querySelector(
      `input[name="q${index}"][value="${q.correct}"]`
    );
    if (correctInput) {
      const correctLabel = correctInput.closest('label');
      if (correctLabel) correctLabel.classList.add('correct');
    }

    // Kui kasutaja valis vale, märgi tema valik punaseks
    if (selected) {
      const selectedIndex = Number(selected.value);
      if (selectedIndex === q.correct) {
        score++;
      } else {
        const wrongLabel = selected.closest('label');
        if (wrongLabel) wrongLabel.classList.add('incorrect');
      }
    }
  });

  document.getElementById('result').innerText =
    `Tulemus: ${score} / ${quizQuestions.length}`;
}

function newTest() {
  startQuiz();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
