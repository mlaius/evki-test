let allQuestions = [];
let quizQuestions = [];

// Lae questions.json samast kaustast (vajadusel muuda tee: 'data/questions.json')
fetch('questions.json')
  .then(async (response) => {
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      allQuestions = data;
      startQuiz();
    } catch (e) {
      console.error('JSON parse error:', e);
      document.getElementById('quiz').innerHTML =
        '<p style="color:red">Viga: questions.json ei saa parsida.</p>';
    }
  })
  .catch(err => {
    console.error('Fetch error:', err);
    document.getElementById('quiz').innerHTML =
      '<p style="color:red">Viga: questions.json faili ei õnnestu laadida.</p>';
  });

function startQuiz() {
  // vali juhuslikud 20 küsimust
  quizQuestions = shuffleArray(allQuestions).slice(0, 20);
  renderQuiz();

  // tühjenda tulemus
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

// Uus test – uus komplekt 20 küsimust
function newTest() {
  startQuiz();
  // Kerime üles, et uus test oleks kohe nähtav
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* Ühtlane segamine (Fisher–Yates) */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Väike HTML-escape ohutuks sisestuseks (kui tekstis on erimärgid) */
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/* Oluline: tee funktsioonid globaalseks, et onclick neid leiaks */
window.submitQuiz = submitQuiz;
window.newTest = newTest;
