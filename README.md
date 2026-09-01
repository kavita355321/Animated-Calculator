# Precision — safe JavaScript calculator

[![Quality checks](https://github.com/kavita355321/Animated-Calculator/actions/workflows/quality.yml/badge.svg)](https://github.com/kavita355321/Animated-Calculator/actions/workflows/quality.yml)

Precision is a responsive calculator application built with semantic HTML, modern CSS and vanilla JavaScript. It replaces the original `eval()`-based implementation with a custom recursive-descent expression parser, making arithmetic input predictable, testable and unable to execute JavaScript code.

## Why I rebuilt it

The first version demonstrated styling, animation, theme switching and basic calculation history. However, it passed the display text directly to `eval()`, had no keyboard controls or automated tests, and did not persist preferences. The rebuild focuses on correctness, accessibility and maintainability.

## Features

- Addition, subtraction, multiplication and division
- Decimal, negative and percentage calculations
- Correct operator precedence and bracket support through keyboard input
- Clear errors for malformed expressions and division by zero
- Full keyboard controls
- Calculation preview and reusable local history
- Persistent light/dark theme following the initial system preference
- Responsive layout and reduced-motion support
- DOM-safe history rendering with `textContent`
- Automated unit tests and GitHub Actions checks

## Security improvement

The project does **not** use `eval()`, `Function()` or another dynamic code-execution API. The parser accepts only numbers, arithmetic operators, percentage signs and brackets. Unsupported characters are rejected before evaluation.

## Keyboard controls

| Key | Action |
|---|---|
| `0`–`9` | Enter a digit |
| `+ - * /` | Add an operator |
| `.` | Add a decimal point |
| `%` | Convert the preceding value to a percentage |
| `Enter` or `=` | Calculate |
| `Backspace` | Remove the last character |
| `Escape` or `Delete` | Clear the calculation |

## Project structure

```text
.
├── .github/workflows/quality.yml
├── css/styles.css
├── js/
│   ├── app.js
│   └── calculator.js
├── tests/calculator.test.js
├── .gitignore
├── index.html
├── LICENSE
├── package-lock.json
├── package.json
└── README.md
```

## Run locally

Use a local server because the project uses JavaScript modules:

```bash
git clone https://github.com/kavita355321/Animated-Calculator.git
cd Animated-Calculator
npx serve .
```

## Run tests

Node.js 20 or newer is required.

```bash
npm ci
npm test
```

## Future improvements

- Add memory buttons and scientific functions
- Add browser-level accessibility testing
- Add optional export of calculation history as a text file

## Author

Built by [Kavita](https://github.com/kavita355321) as a JavaScript portfolio project.

