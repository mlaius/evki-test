let allQuestions = [];
let quizQuestions = [];

fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        allQuestions = data;
        startQuiz();
    });

function startQuiz() {
    quizQuestions = shuffleArray(allQuestions).slice(0, 20);
    renderQuiz();
}

function renderQuiz() {
    const quizDiv = document.getElementById('quiz');
    quizDiv.innerHTML = '';

    quizQuestions.forEach((q, index) => {
        let html = `<div class="question">
            <p><strong>${index + 1}. ${q.question}</strong></p>`;

        q.options.forEach((option, i) => {
            html += `
                <label>
                    <input type="radio" name="q${index}" value="${i}">
                    ${option}
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
        if (selected && Number(selected.value) === q.correct) {
            score++;
        }
    });

    document.getElementById('result').innerText =
        `Tulemus: ${score} / ${quizQuestions.length}`;
}

function shuffleArray(array) {
    return [...array].sort(() => Math.random() - 0.5);
}
