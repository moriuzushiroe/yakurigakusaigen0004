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

  if (correctStatements.length === 0 || incorrectStatements.length === 0) {
    alert('正しい文章と誤った文章をそれぞれ入力してください。');
    return;
  }

  generateQuestions();

  // クイズ画面表示
  document.getElementById('inputScreen').classList.add('hidden');
  document.getElementById('quizScreen').classList.remove('hidden');

  // 問題番号リセット
  currentQuestionIndex = 0;
  document.getElementById('progressDisplay').textContent = `問題 0 / ${questions.length}`;

  displayQuestion();
}

// 問題生成関数
function generateQuestions() {
  questions = [];

  const usedCorrect = new Set();
  const usedIncorrect = new Set();

  const allStatements = correctStatements.map((s, i) => ({ text: s, isCorrect: true, index: i }))
    .concat(incorrectStatements.map((s, i) => ({ text: s, isCorrect: false, index: i })));

  // 出題数 = 正しい文の数
  for (let i = 0; i < correctStatements.length; i++) {
    // ランダムに3つ選ぶ
    const selected = [];
    const pool = [...allStatements];

    while (selected.length < 3 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      selected.push(pool.splice(idx, 1)[0]);
    }

    // 使用履歴を記録
    selected.forEach(s => {
      if (s.isCorrect) usedCorrect.add(s.index);
      else usedIncorrect.add(s.index);
    });

    const pattern = selected.map(s => s.isCorrect ? '○' : '×').join('');
    const shuffledTexts = selected.map(s => s.text);

    questions.push({
      statements: shuffledTexts,
      correctPattern: pattern,
      explanationIndexes: selected.map(s => s.isCorrect ? s.index : null) // 解説用
    });
  }

  // 使用されていない文がある場合、それをランダムな問題に追加（重複可）
  const unusedCorrect = [];
  for (let i = 0; i < correctStatements.length; i++) {
    if (!usedCorrect.has(i)) unusedCorrect.push({ text: correctStatements[i], isCorrect: true, index: i });
  }

  const unusedIncorrect = [];
  for (let i = 0; i < incorrectStatements.length; i++) {
    if (!usedIncorrect.has(i)) unusedIncorrect.push({ text: incorrectStatements[i], isCorrect: false, index: i });
  }

  [...unusedCorrect, ...unusedIncorrect].forEach(extra => {
    const q = questions[Math.floor(Math.random() * questions.length)];
    const replaceIndex = Math.floor(Math.random() * 3);
    q.statements[replaceIndex] = extra.text;
    const oldExplanation = q.explanationIndexes[replaceIndex];
    q.explanationIndexes[replaceIndex] = extra.isCorrect ? extra.index : null;
    const patternArray = q.statements.map((text, idx) =>
      correctStatements.includes(text) ? '○' : '×'
    );
    q.correctPattern = patternArray.join('');
  });

  questions = shuffle(questions);
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

function toggleBookmark() {
  if (checkedQuestions.has(currentQuestionIndex)) {
    checkedQuestions.delete(currentQuestionIndex);
  } else {
    checkedQuestions.add(currentQuestionIndex);
  }
}
  // 残りの問題数を表示
  document.getElementById('progressDisplay').textContent = 
    `問題 ${currentQuestionIndex + 1} / ${questions.length}`;
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