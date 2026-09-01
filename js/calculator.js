const MAX_EXPRESSION_LENGTH = 120;
const OPERATORS = new Set(["+", "-", "*", "/"]);

export class CalculatorError extends Error {
  constructor(message) {
    super(message);
    this.name = "CalculatorError";
  }
}

export function normaliseExpression(expression) {
  return String(expression)
    .replaceAll("×", "*")
    .replaceAll("÷", "/")
    .replaceAll("−", "-")
    .replaceAll(/\s+/g, "");
}

export function tokenise(expression) {
  const source = normaliseExpression(expression);
  if (!source) throw new CalculatorError("Enter a calculation");
  if (source.length > MAX_EXPRESSION_LENGTH) {
    throw new CalculatorError("Calculation is too long");
  }

  const tokens = [];
  let index = 0;
  while (index < source.length) {
    const character = source[index];
    if (/\d|\./.test(character)) {
      let value = "";
      let decimalPoints = 0;
      while (index < source.length && /\d|\./.test(source[index])) {
        if (source[index] === ".") decimalPoints += 1;
        value += source[index];
        index += 1;
      }
      if (decimalPoints > 1 || value === ".") {
        throw new CalculatorError("Invalid number");
      }
      const number = Number(value);
      if (!Number.isFinite(number)) throw new CalculatorError("Number is too large");
      tokens.push({ type: "number", value: number });
      continue;
    }

    if (OPERATORS.has(character) || character === "%" || character === "(" || character === ")") {
      tokens.push({ type: "symbol", value: character });
      index += 1;
      continue;
    }

    throw new CalculatorError(`Unsupported character: ${character}`);
  }
  return tokens;
}

export function evaluateExpression(expression) {
  const tokens = tokenise(expression);
  let position = 0;

  const peek = () => tokens[position];
  const consume = () => tokens[position++];

  function parsePrimary() {
    const token = peek();
    if (!token) throw new CalculatorError("Incomplete calculation");

    if (token.type === "symbol" && (token.value === "+" || token.value === "-")) {
      consume();
      const value = parsePrimary();
      return token.value === "-" ? -value : value;
    }

    let value;
    if (token.type === "number") {
      value = consume().value;
    } else if (token.value === "(") {
      consume();
      value = parseAddition();
      if (peek()?.value !== ")") throw new CalculatorError("Missing closing bracket");
      consume();
    } else {
      throw new CalculatorError("Expected a number");
    }

    while (peek()?.value === "%") {
      consume();
      value /= 100;
    }
    return value;
  }

  function parseMultiplication() {
    let value = parsePrimary();
    while (peek()?.value === "*" || peek()?.value === "/") {
      const operator = consume().value;
      const right = parsePrimary();
      if (operator === "/" && right === 0) throw new CalculatorError("Cannot divide by zero");
      value = operator === "*" ? value * right : value / right;
    }
    return value;
  }

  function parseAddition() {
    let value = parseMultiplication();
    while (peek()?.value === "+" || peek()?.value === "-") {
      const operator = consume().value;
      const right = parseMultiplication();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  }

  const result = parseAddition();
  if (position !== tokens.length) throw new CalculatorError("Check the calculation");
  if (!Number.isFinite(result)) throw new CalculatorError("Result is outside the supported range");
  return normaliseNumber(result);
}

export function normaliseNumber(value) {
  if (Object.is(value, -0)) return 0;
  return Number.parseFloat(Number(value).toPrecision(12));
}

export function formatResult(value) {
  const number = normaliseNumber(value);
  const absolute = Math.abs(number);
  if ((absolute !== 0 && absolute < 1e-9) || absolute >= 1e12) {
    return number.toExponential(8).replace(/\.0+(?=e)/, "");
  }
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 10,
    useGrouping: true,
  }).format(number);
}

export function appendDigit(expression, digit) {
  if (!/^\d$/.test(digit)) return expression;
  if (expression.endsWith("%") || expression.endsWith(")")) return expression;
  if (expression === "0") return digit;
  return `${expression}${digit}`.slice(0, MAX_EXPRESSION_LENGTH);
}

export function appendDecimal(expression) {
  if (expression.endsWith("%") || expression.endsWith(")")) return expression;
  const currentNumber = expression.split(/[+\-*/()]/).at(-1) ?? "";
  if (currentNumber.includes(".")) return expression;
  if (!currentNumber) return `${expression}0.`;
  return `${expression}.`;
}

export function appendOperator(expression, operator) {
  const normalisedOperator = normaliseExpression(operator);
  if (!OPERATORS.has(normalisedOperator)) return expression;
  if (!expression) return normalisedOperator === "-" ? "-" : "0";
  if (/[+\-*/.]$/.test(expression)) {
    return `${expression.slice(0, -1)}${normalisedOperator}`;
  }
  return `${expression}${normalisedOperator}`.slice(0, MAX_EXPRESSION_LENGTH);
}

export function appendPercent(expression) {
  if (/\d|\)$/.test(expression)) return `${expression}%`;
  return expression;
}

export function appendBracket(expression, bracket) {
  if (bracket === "(") {
    if (expression === "0") return "(";
    if (/[+\-*/(]$/.test(expression)) return `${expression}(`;
    return expression;
  }
  if (bracket === ")") {
    const opens = [...expression].filter((character) => character === "(").length;
    const closes = [...expression].filter((character) => character === ")").length;
    if (opens > closes && /[\d%)]$/.test(expression)) return `${expression})`;
  }
  return expression;
}

export function backspace(expression) {
  const updated = expression.slice(0, -1);
  return updated || "0";
}
