let currentDisplay = '';

function appendToDisplay(value) {
  currentDisplay += value;
  document.querySelector('#display').value = currentDisplay;
}

function clearDisplay() {
  currentDisplay = '';
  document.querySelector('#display').value = currentDisplay;
}

function backspace() {
  currentDisplay = currentDisplay.slice(0, -1);
  document.querySelector('#display').value = currentDisplay;
}

function calculate() {
  try {
    const result = eval(currentDisplay);
    document.querySelector('#display').value = result;
    addToHistory(currentDisplay + ' = ' + result);
    currentDisplay = result.toString();
  } catch {
    document.querySelector('#display').value = 'Error';
    currentDisplay = '';
  }
}

function addToHistory(entry) {
  const list = document.getElementById('history-list');
  const item = document.createElement('li');
  item.textContent = entry;
  list.prepend(item);
}

// Dark mode toggle
document.getElementById('toggleDark').addEventListener('change', function () {
  document.body.classList.toggle('dark', this.checked);
});
