import test from "node:test";
import assert from "node:assert/strict";

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
  tokenise,
} from "../js/calculator.js";

test("normalises visual operators", () => {
  assert.equal(normaliseExpression("8 × 4 ÷ 2 − 3"), "8*4/2-3");
});

test("respects multiplication precedence", () => {
  assert.equal(evaluateExpression("2+3*4"), 14);
});

test("supports decimals and brackets", () => {
  assert.equal(evaluateExpression("(2.5+1.5)*3"), 12);
});

test("supports unary negative values", () => {
  assert.equal(evaluateExpression("-5*3+2"), -13);
});

test("percentage converts a value to one hundredth", () => {
  assert.equal(evaluateExpression("250*10%"), 25);
});

test("division by zero returns a clear calculator error", () => {
  assert.throws(() => evaluateExpression("10/0"), /Cannot divide by zero/);
});

test("rejects executable or unsupported input", () => {
  assert.throws(() => tokenise("alert(1)"), CalculatorError);
  assert.throws(() => evaluateExpression("2**8"), CalculatorError);
});

test("rejects malformed calculations", () => {
  assert.throws(() => evaluateExpression("2..5+1"), /Invalid number/);
  assert.throws(() => evaluateExpression("(2+3"), /Missing closing bracket/);
});

test("input helpers avoid duplicate decimals and operators", () => {
  assert.equal(appendDigit("0", "7"), "7");
  assert.equal(appendDecimal("12.3"), "12.3");
  assert.equal(appendOperator("12+", "*"), "12*");
  assert.equal(appendPercent("12"), "12%");
  assert.equal(appendBracket("0", "("), "(");
  assert.equal(appendBracket("(2+3", ")"), "(2+3)");
  assert.equal(appendDigit("12%", "4"), "12%");
  assert.equal(backspace("7"), "0");
});

test("large and ordinary results are formatted readably", () => {
  assert.equal(formatResult(12345.5), "12,345.5");
  assert.match(formatResult(1e15), /e\+15/);
});
