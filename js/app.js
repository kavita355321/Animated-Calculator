import {
  CalculatorError,
  appendBracket,
  appendDecimal,
  appendDigit,
  appendOperator,
  appendPercent,
  backspace,
  evaluateExpression,
  formatResult,
  normaliseExpression,
} from "./calculator.js";

const HISTORY_KEY = "precision-calculator-history-v2";
const THEME_KEY = "precision-calculator-theme-v2";
const MAX_HISTORY = 12;

const state = {
  expression: "0",
  history: loadHistory(),
  justCalculated: false,
};

const elements = {
  calculator: document.querySelector("#calculator"),
  clearHistory: document.querySelector("#clear-history"),
  expression: document.querySelector("#expression"),
  history: document.querySelector("#history-list"),
  result: document.querySelector("#result"),
  status: document.querySelector("#status"),
  theme: document.querySelector("#theme-toggle"),
};

function loadHistory() {
  try {
    const value = JSON.parse(localStorage.getItem(HISTORY_KEY));
    if (!Array.isArray(value)) return [];
    return value.filter(
      (entry) =>
        entry &&
        typeof entry.expression === "string" &&
        typeof entry.result === "number" &&
        Number.isFinite(entry.result),
    ).slice(0, MAX_HISTORY);
  } catch {
    return [];
  }
}

function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
}

function readableExpression(expression) {
  return expression.replaceAll("*", " × ").replaceAll("/", " ÷ ").replaceAll("-", " − ").replaceAll("+", " + ");
}

function updateDisplay(preview = true) {
  elements.expression.textContent = readableExpression(state.expression);
  elements.status.textContent = "";
  if (!preview || /[+\-*/.]$/.test(state.expression)) {
    elements.result.textContent = state.expression === "0" ? "0" : "—";
    return;
  }
  try {
    elements.result.textContent = formatResult(evaluateExpression(state.expression));
  } catch {
    elements.result.textContent = "—";
  }
}

function renderHistory() {
  elements.history.replaceChildren();
  if (!state.history.length) {
    const empty = document.createElement("li");
    empty.className = "history-empty";
    empty.textContent = "Completed calculations will appear here.";
    elements.history.append(empty);
    elements.clearHistory.disabled = true;
    return;
  }

  elements.clearHistory.disabled = false;
  state.history.forEach((entry) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.historyResult = entry.result;
    button.setAttribute("aria-label", `Use result ${formatResult(entry.result)}`);
    const expression = document.createElement("span");
    expression.textContent = readableExpression(entry.expression);
    const result = document.createElement("strong");
    result.textContent = `= ${formatResult(entry.result)}`;
    button.append(expression, result);
    item.append(button);
    elements.history.append(item);
  });
}

function calculate() {
  try {
    const cleanExpression = normaliseExpression(state.expression);
    const result = evaluateExpression(cleanExpression);
    state.history = [
      { expression: cleanExpression, result },
      ...state.history.filter((entry) => entry.expression !== cleanExpression),
    ].slice(0, MAX_HISTORY);
    state.expression = String(result);
    state.justCalculated = true;
    saveHistory();
    updateDisplay(false);
    elements.result.textContent = formatResult(result);
    elements.status.textContent = "Calculation complete";
    renderHistory();
  } catch (error) {
    elements.result.textContent = "Error";
    elements.status.textContent = error instanceof CalculatorError ? error.message : "Unable to calculate";
    state.justCalculated = false;
  }
}

function handleAction(action, value = "") {
  if (action === "clear") {
    state.expression = "0";
    state.justCalculated = false;
  } else if (action === "backspace") {
    state.expression = backspace(state.expression);
    state.justCalculated = false;
  } else if (action === "digit") {
    if (state.justCalculated) state.expression = "0";
    state.expression = appendDigit(state.expression, value);
    state.justCalculated = false;
  } else if (action === "decimal") {
    if (state.justCalculated) state.expression = "0";
    state.expression = appendDecimal(state.expression);
    state.justCalculated = false;
  } else if (action === "operator") {
    state.expression = appendOperator(state.expression, value);
    state.justCalculated = false;
  } else if (action === "percent") {
    state.expression = appendPercent(state.expression);
    state.justCalculated = false;
  } else if (action === "bracket") {
    if (state.justCalculated) state.expression = "0";
    state.expression = appendBracket(state.expression, value);
    state.justCalculated = false;
  } else if (action === "negate") {
    try {
      state.expression = String(-evaluateExpression(state.expression));
      state.justCalculated = true;
    } catch {
      elements.status.textContent = "Complete the calculation before changing its sign";
      return;
    }
  } else if (action === "equals") {
    calculate();
    return;
  }
  updateDisplay();
}

elements.calculator.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  handleAction(button.dataset.action, button.dataset.value);
});

document.addEventListener("keydown", (event) => {
  if (/^\d$/.test(event.key)) handleAction("digit", event.key);
  else if (["+", "-", "*", "/"].includes(event.key)) handleAction("operator", event.key);
  else if (event.key === ".") handleAction("decimal");
  else if (event.key === "%") handleAction("percent");
  else if (event.key === "(" || event.key === ")") handleAction("bracket", event.key);
  else if (event.key === "Enter" || event.key === "=") handleAction("equals");
  else if (event.key === "Backspace") handleAction("backspace");
  else if (event.key === "Escape" || event.key === "Delete") handleAction("clear");
  else return;
  event.preventDefault();
});

elements.history.addEventListener("click", (event) => {
  const button = event.target.closest("[data-history-result]");
  if (!button) return;
  state.expression = String(Number(button.dataset.historyResult));
  state.justCalculated = true;
  updateDisplay(false);
  elements.result.textContent = formatResult(Number(button.dataset.historyResult));
});

elements.clearHistory.addEventListener("click", () => {
  state.history = [];
  saveHistory();
  renderHistory();
  elements.status.textContent = "History cleared";
});

const savedTheme = localStorage.getItem(THEME_KEY);
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const useDark = savedTheme ? savedTheme === "dark" : prefersDark;
document.documentElement.dataset.theme = useDark ? "dark" : "light";
elements.theme.setAttribute("aria-pressed", String(useDark));

elements.theme.addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme !== "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  elements.theme.setAttribute("aria-pressed", String(dark));
  localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
});

document.querySelector("#year").textContent = new Date().getFullYear();
updateDisplay();
renderHistory();
