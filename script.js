let correctStatements = [];
let incorrectStatements = [];
let questions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let totalAnswers = 0;
let showingCheckedOnly = false;
let checkedQuestions = new Set();

// 問題を読み込む関数
function loadQuestions() {
  const correctInput = document.getElementById('correctInput').value.trim();
  const incorrectInput = document.getElementById('incorrectInput').value.trim();

  correctStatements = correctInput.split('\n').map(s => s.trim()).filter(s => s);
  incorrectStatements = incorrectInput.split('\n').map(s => s.trim()).filter(s => s);

  if (correctStatements.length < 1 || incorrectStatements.length < 2) {
    alert('正しい文章を1つ以上、誤った文章を2つ以上入力してください。');
    return;
  }

  generateQuestions();
  document.getElementById('inputScreen').classList.add('hidden');
  document.getElementById('quizScreen').classList.remove('hidden');
  displayQuestion();
}

// 問題生成関数（正1つ、誤2つで構成）
function generateQuestions() {
  questions = [];
  const allStatements = [...correctStatements, ...incorrectStatements];

  for (let i = 0; i < 10; i++) {
    let sampled = [];
    while (sampled.length < 3) {
      const candidate = getRandomItem(allStatements);
      if (!sampled.includes(candidate)) {
        sampled.push(candidate);
      }
    }

    const statements = shuffle(sampled);
    const correctPattern = statements.map(s => correctStatements.includes(s) ? '○' : '×').join('');

    questions.push({
      statements,
      correctPattern
    });
  }
}

// ランダム選択
function getRandomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// シャッフル関数
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// 問題を表示
function displayQuestion() {
  if (questions.length === 0) return;
  const q = questions[currentQuestionIndex];

  // 番号付きで、<br>で縦に並べる
  const numberedHTML = q.statements.map((s, i) => `${i + 1}. ${s}`).join('<br><br>');
  document.getElementById('questionText').innerHTML = numberedHTML;

  generateOptions(q.correctPattern);
  document.getElementById('bookmarkCheckbox').checked = checkedQuestions.has(currentQuestionIndex);
  updateScore();
}

// 選択肢生成
function generateOptions(correctPattern) {
  const container = document.getElementById('optionsContainer');
  container.innerHTML = '';
  
  // 8通りの選択肢の配列
  const patterns = ['○○○','○○×','○×○','○××','×○○','×○×','××○','×××'];

  // 表形式で並べる
  const table = document.createElement('table');
  const tbody = document.createElement('tbody');
  
  patterns.forEach((pattern, index) => {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    const button = document.createElement('button');
    
    button.textContent = `${index + 1}. ${pattern}`;
    button.onclick = () => checkAnswer(pattern, correctPattern);
    
    cell.appendChild(button);
    row.appendChild(cell);
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

// 回答チェック
function checkAnswer(selected, correct) {
  totalAnswers++;
  if (selected === correct) {
    correctAnswers++;
    alert('正解！');
  } else {
    alert(`不正解。正解は「${correct}」です。`);
  }
  displayExplanation();
  updateScore();
}

// スコア更新
function updateScore() {
  const percent = totalAnswers === 0 ? 0 : Math.round((correctAnswers / totalAnswers) * 100);
  document.getElementById('scoreDisplay').textContent = `正解率: ${percent}%`;
}

// 解説表示・非表示
function toggleExplanation() {
  const container = document.getElementById('explanationContainer');
  if (container.classList.contains('hidden')) {
    showExplanation();
    container.classList.remove('hidden');
  } else {
    container.classList.add('hidden');
    document.getElementById('explanationText').innerHTML = ''; // 中身もクリア
  }
}

// 解説内容を表示
function showExplanation() {
  const currentQuestion = questions[currentQuestionIndex];
  const explanationLines = currentQuestion.statements.map((s, i) => {
    if (correctStatements.includes(s)) {
      return `${i + 1}. ${s}（正しい文）`;
    } else {
      // 正しくない文→正しい文リストの中から番号を探して表示
      const incorrectIndex = incorrectStatements.indexOf(s);
      const correspondingCorrect = correctStatements[incorrectIndex] || '(対応する正しい文なし)';
      return `${i + 1}. ${correspondingCorrect}（正しい文）`;
    }
  });

  document.getElementById('explanationText').innerHTML = explanationLines.join('<br><br>');
}

// チェックのオンオフ
document.getElementById('bookmarkCheckbox').addEventListener('change', (e) => {
  if (e.target.checked) {
    checkedQuestions.add(currentQuestionIndex);
  } else {
    checkedQuestions.delete(currentQuestionIndex);
  }
});

// チェック済みの問題だけを表示
function toggleCheckedQuestions() {
  showingCheckedOnly = !showingCheckedOnly;
  if (showingCheckedOnly) {
    questions = questions.filter((_, index) => checkedQuestions.has(index));
    currentQuestionIndex = 0;
  } else {
    loadQuestions(); // 入力から再生成
  }
  displayQuestion();
}

// 前へ
function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    displayQuestion();
  }
}

// 次へ
function nextQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    displayQuestion();
  }
}
