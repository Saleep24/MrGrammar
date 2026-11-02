const box = document.getElementById('try-box');
const result = document.getElementById('result');

if (/Mac/.test(navigator.platform)) {
  document.getElementById('shortcut').textContent = '⌘ Shift E';
}

const range = document.createRange();
range.selectNodeContents(box);
const selection = window.getSelection();
selection.removeAllRanges();
selection.addRange(range);

// The extension changes the text without firing beforeinput, which is how a fix differs from typing
const original = box.textContent;
let typing = false;
box.addEventListener('beforeinput', () => {
  typing = true;
  setTimeout(() => { typing = false; });
});

const observer = new MutationObserver(() => {
  if (typing || box.textContent === original) return;
  result.hidden = false;
  observer.disconnect();
});
observer.observe(box, { childList: true, characterData: true, subtree: true });
