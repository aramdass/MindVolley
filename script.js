const tests = [
  {
    id: "attention",
    domain: "Attention",
    title: "Arrow Focus",
    icon: "A",
    basis: "Flanker-style inhibitory control and attention",
    instructions: "Press the direction of the center arrow, ignoring the surrounding arrows.",
    type: "flanker"
  },
  {
    id: "episodic",
    domain: "Episodic Memory",
    title: "Scene Replay",
    icon: "E",
    basis: "Picture-sequence recall",
    instructions: "Study the picture sequence, then rebuild it in the original order.",
    type: "sequence"
  },
  {
    id: "working",
    domain: "Working Memory",
    title: "Reverse Span",
    icon: "W",
    basis: "Digit/list span with mental manipulation",
    instructions: "Memorize the digits, then enter them in reverse order.",
    type: "span"
  },
  {
    id: "language",
    domain: "Language",
    title: "Word Precision",
    icon: "L",
    basis: "Vocabulary and reading recognition",
    instructions: "Pick the word closest in meaning to the prompt.",
    type: "language"
  },
  {
    id: "executive",
    domain: "Executive Function",
    title: "Switch Trail",
    icon: "X",
    basis: "Trail Making and card-sort switching",
    instructions: "Tap the trail in alternating order: 1, A, 2, B, 3, C...",
    type: "trail"
  },
  {
    id: "speed",
    domain: "Processing Speed",
    title: "Pattern Snap",
    icon: "S",
    basis: "Pattern-comparison processing speed",
    instructions: "Decide as quickly as possible whether the two symbol strings match.",
    type: "pattern"
  }
];

const state = {
  selected: tests[0].id,
  scores: {},
  timerId: null,
  timeLeft: 0,
  running: false
};

const $ = (selector) => document.querySelector(selector);
const testList = $("#testList");
const domainScores = $("#domainScores");
const gameStage = $("#gameStage");
const activeDomain = $("#activeDomain");
const activeTitle = $("#activeTitle");
const gameInstructions = $("#gameInstructions");
const timer = $("#timer");
const overallScore = $("#overallScore");

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function selectedTest() {
  return tests.find((test) => test.id === state.selected);
}

function render() {
  renderTests();
  renderBars();
  renderHeader();
  renderLeaderboard();
  renderCalendar();
  renderIdleStage();
}

function renderTests() {
  testList.innerHTML = tests.map((test) => {
    const score = state.scores[test.id];
    return `
      <button class="test-card ${state.selected === test.id ? "active" : ""}" data-test="${test.id}" type="button">
        <span class="mark">${test.icon}</span>
        <span>
          <strong>${test.title}</strong>
          <small>${test.domain}</small>
        </span>
        <span class="mini-score">${score ?? "--"}</span>
      </button>
    `;
  }).join("");

  document.querySelectorAll("[data-test]").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.running) return;
      state.selected = button.dataset.test;
      renderHeader();
      renderTests();
      renderIdleStage();
    });
  });
}

function renderBars() {
  domainScores.innerHTML = tests.map((test) => {
    const score = state.scores[test.id] ?? 0;
    return `
      <div class="bar-row">
        <div class="bar-label">
          <span>${test.domain}</span>
          <span>${state.scores[test.id] ?? "--"}</span>
        </div>
        <div class="bar-track"><div class="bar-fill" style="width:${score}%"></div></div>
      </div>
    `;
  }).join("");
}

function renderHeader() {
  const test = selectedTest();
  activeDomain.textContent = test.domain;
  activeTitle.textContent = test.title;
  gameInstructions.textContent = test.instructions;
  const completed = Object.values(state.scores);
  if (!completed.length) {
    overallScore.textContent = "--";
    return;
  }
  const average = completed.reduce((sum, score) => sum + score, 0) / completed.length;
  const completionPenalty = 1 - ((tests.length - completed.length) * 0.035);
  overallScore.textContent = Math.round(average * completionPenalty);
}

function renderIdleStage() {
  if (state.running) return;
  const test = selectedTest();
  gameStage.innerHTML = `
    <div class="stimulus">
      <div class="stimulus-title">${test.title}</div>
      <p class="instructions">${test.basis}</p>
      <div class="pattern-row">
        <span class="picture-card">${test.icon}</span>
        <span class="picture-card">+</span>
        <span class="picture-card">100</span>
      </div>
    </div>
  `;
}

function renderLeaderboard() {
  const userScore = Number(overallScore.textContent) || 0;
  const rows = [
    ["MR", "Mira Rao", 91, "12 day streak"],
    ["JL", "Jon Lee", 86, "Fastest Pattern Snap"],
    ["YOU", "You", userScore || 72, `${Object.keys(state.scores).length}/6 complete`],
    ["AK", "Ari Kim", 74, "Memory specialist"],
    ["TN", "Tess Ng", 68, "New baseline"]
  ].sort((a, b) => b[2] - a[2]);

  $("#leaderboard").innerHTML = rows.map((row, index) => `
    <div class="leader-row">
      <span class="avatar">${index + 1}</span>
      <span>
        <strong>${row[1]}</strong>
        <small>${row[3]}</small>
      </span>
      <span class="leader-score">${row[2]}</span>
    </div>
  `).join("");
}

function renderCalendar() {
  const scores = [null, null, null, null, 73, 76, 72, 81, 78, 84, 86, 82, 79, Number(overallScore.textContent) || 0];
  const cells = [];
  for (let i = 0; i < 3; i += 1) cells.push({ muted: true, label: "", score: "" });
  for (let day = 1; day <= 31; day += 1) {
    const score = scores[day - 1];
    cells.push({ muted: false, label: day, score: score ? `${score}` : "" });
  }
  $("#calendar").innerHTML = cells.map((cell) => `
    <div class="day ${cell.muted ? "muted" : ""}">
      <strong>${cell.label}</strong>
      <span>${cell.score}</span>
    </div>
  `).join("");
}

function setScore(id, score, detail) {
  state.scores[id] = clamp(Math.round(score), 0, 100);
  state.running = false;
  stopTimer();
  gameStage.innerHTML = `
    <div class="result-card">
      <strong>${state.scores[id]}</strong>
      <span>${detail}</span>
    </div>
  `;
  renderTests();
  renderBars();
  renderHeader();
  renderLeaderboard();
  renderCalendar();
  $("#startBtn").disabled = false;
  $("#skipBtn").disabled = false;
}

function startTimer(seconds) {
  stopTimer();
  state.timeLeft = seconds;
  timer.textContent = String(seconds).padStart(2, "0");
  state.timerId = setInterval(() => {
    state.timeLeft -= 1;
    timer.textContent = String(Math.max(state.timeLeft, 0)).padStart(2, "0");
    if (state.timeLeft <= 0) stopTimer();
  }, 1000);
}

function stopTimer() {
  clearInterval(state.timerId);
  state.timerId = null;
  timer.textContent = "00";
}

function startSelected() {
  const test = selectedTest();
  state.running = true;
  $("#startBtn").disabled = true;
  $("#skipBtn").disabled = true;
  if (test.type === "flanker") runFlanker(test);
  if (test.type === "sequence") runSequence(test);
  if (test.type === "span") runSpan(test);
  if (test.type === "language") runLanguage(test);
  if (test.type === "trail") runTrail(test);
  if (test.type === "pattern") runPattern(test);
}

function runFlanker(test) {
  const trials = [
    ["<<<<<", "left"], [">>>>>", "right"], ["<<><<", "right"],
    [">><>>", "left"], ["<><<<", "left"], ["><>>>", "right"]
  ];
  let index = 0;
  let correct = 0;
  const started = performance.now();
  startTimer(18);

  const next = () => {
    if (index >= trials.length) {
      const seconds = (performance.now() - started) / 1000;
      setScore(test.id, (correct / trials.length) * 80 + clamp(18 - seconds, 0, 12) * 1.7, `${correct}/${trials.length} center arrows correct.`);
      return;
    }
    const [arrows] = trials[index];
    gameStage.innerHTML = `
      <div class="stimulus">
        <div class="flanker-row">${arrows.replaceAll("<", "←").replaceAll(">", "→")}</div>
        <div class="choice-grid">
          <button type="button" data-answer="left">← Left</button>
          <button type="button" data-answer="right">Right →</button>
        </div>
      </div>
    `;
    gameStage.querySelectorAll("[data-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.answer === trials[index][1]) correct += 1;
        index += 1;
        next();
      });
    });
  };
  next();
}

function runSequence(test) {
  const icons = ["☀", "◆", "●", "▲", "■"];
  const sequence = shuffle(icons).slice(0, 4);
  const answer = [];
  startTimer(20);
  gameStage.innerHTML = `
    <div class="stimulus">
      <div class="stimulus-title">Study this order</div>
      <div class="sequence-row">${sequence.map((item) => `<span class="picture-card">${item}</span>`).join("")}</div>
    </div>
  `;
  setTimeout(() => {
    gameStage.innerHTML = `
      <div class="stimulus">
        <div class="stimulus-title">Rebuild the sequence</div>
        <div class="sequence-row" id="chosen"></div>
        <div class="choice-grid">${shuffle(sequence).map((item) => `<button type="button" data-icon="${item}">${item}</button>`).join("")}</div>
      </div>
    `;
    gameStage.querySelectorAll("[data-icon]").forEach((button) => {
      button.addEventListener("click", () => {
        answer.push(button.dataset.icon);
        button.disabled = true;
        $("#chosen").innerHTML = answer.map((item) => `<span class="picture-card">${item}</span>`).join("");
        if (answer.length === sequence.length) {
          const correct = answer.filter((item, i) => item === sequence[i]).length;
          setScore(test.id, (correct / sequence.length) * 100, `${correct}/${sequence.length} positions recalled in order.`);
        }
      });
    });
  }, 2800);
}

function runSpan(test) {
  const digits = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10));
  startTimer(20);
  gameStage.innerHTML = `
    <div class="stimulus">
      <div class="stimulus-title">Hold these digits</div>
      <div class="digit-stream">${digits.join(" ")}</div>
    </div>
  `;
  setTimeout(() => {
    gameStage.innerHTML = `
      <div class="stimulus">
        <div class="stimulus-title">Type them backward</div>
        <input id="spanInput" inputmode="numeric" autocomplete="off" class="digit-stream" aria-label="Reverse digit answer">
        <button id="spanSubmit" type="button">Submit</button>
      </div>
    `;
    $("#spanInput").focus();
    $("#spanSubmit").addEventListener("click", () => {
      const expected = [...digits].reverse().join("");
      const given = $("#spanInput").value.replace(/\D/g, "");
      const correct = expected.split("").filter((digit, i) => digit === given[i]).length;
      setScore(test.id, (correct / expected.length) * 100, `${correct}/${expected.length} reversed digits matched.`);
    });
  }, 3000);
}

function runLanguage(test) {
  const items = [
    { prompt: "Concise", options: ["brief", "fragile", "loud", "late"], answer: "brief" },
    { prompt: "Reluctant", options: ["hesitant", "cheerful", "ancient", "simple"], answer: "hesitant" },
    { prompt: "Verify", options: ["confirm", "divide", "paint", "borrow"], answer: "confirm" },
    { prompt: "Scarce", options: ["rare", "polite", "wide", "smooth"], answer: "rare" }
  ];
  let index = 0;
  let correct = 0;
  startTimer(22);
  const next = () => {
    if (index >= items.length) {
      setScore(test.id, (correct / items.length) * 100, `${correct}/${items.length} vocabulary choices correct.`);
      return;
    }
    const item = items[index];
    gameStage.innerHTML = `
      <div class="stimulus">
        <div class="stimulus-title">${item.prompt}</div>
        <div class="choice-grid">${shuffle(item.options).map((option) => `<button type="button" data-word="${option}">${option}</button>`).join("")}</div>
      </div>
    `;
    gameStage.querySelectorAll("[data-word]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.word === item.answer) correct += 1;
        index += 1;
        next();
      });
    });
  };
  next();
}

function runTrail(test) {
  const order = ["1", "A", "2", "B", "3", "C", "4", "D"];
  const positions = [
    [12, 22], [36, 70], [54, 20], [78, 62],
    [28, 43], [64, 82], [86, 28], [44, 52]
  ];
  let nextIndex = 0;
  let errors = 0;
  const started = performance.now();
  startTimer(25);
  gameStage.innerHTML = `
    <div class="trail-board">
      ${order.map((label, i) => `<button class="trail-dot" style="left:${positions[i][0]}%;top:${positions[i][1]}%" data-label="${label}" type="button">${label}</button>`).join("")}
    </div>
  `;
  gameStage.querySelectorAll("[data-label]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.label === order[nextIndex]) {
        button.classList.add("done");
        nextIndex += 1;
      } else {
        errors += 1;
      }
      if (nextIndex === order.length) {
        const seconds = (performance.now() - started) / 1000;
        setScore(test.id, 100 - errors * 8 - clamp(seconds - 8, 0, 20) * 2, `${errors} switching errors across ${order.length} trail nodes.`);
      }
    });
  });
}

function runPattern(test) {
  const symbols = ["●", "▲", "■", "◆", "✚", "✦"];
  let index = 0;
  let correct = 0;
  const started = performance.now();
  startTimer(18);
  const next = () => {
    if (index >= 6) {
      const seconds = (performance.now() - started) / 1000;
      setScore(test.id, (correct / 6) * 76 + clamp(18 - seconds, 0, 10) * 2.4, `${correct}/6 rapid pattern judgments correct.`);
      return;
    }
    const first = shuffle(symbols).slice(0, 4);
    const same = Math.random() > 0.45;
    const second = same ? [...first] : shuffle(symbols).slice(0, 4);
    gameStage.innerHTML = `
      <div class="stimulus">
        <div class="pattern-row">
          ${first.map((item) => `<span class="pattern-card">${item}</span>`).join("")}
        </div>
        <div class="pattern-row">
          ${second.map((item) => `<span class="pattern-card">${item}</span>`).join("")}
        </div>
        <div class="choice-grid">
          <button type="button" data-same="true">Same</button>
          <button type="button" data-same="false">Different</button>
        </div>
      </div>
    `;
    gameStage.querySelectorAll("[data-same]").forEach((button) => {
      button.addEventListener("click", () => {
        if ((button.dataset.same === "true") === same) correct += 1;
        index += 1;
        next();
      });
    });
  };
  next();
}

$("#startBtn").addEventListener("click", startSelected);
$("#skipBtn").addEventListener("click", () => {
  const test = selectedTest();
  setScore(test.id, 64 + Math.random() * 31, `Mock ${test.domain.toLowerCase()} score added for layout review.`);
});
$("#resetBtn").addEventListener("click", () => {
  state.scores = {};
  state.running = false;
  stopTimer();
  render();
});

render();
