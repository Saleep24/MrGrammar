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
let typing = false;
box.addEventListener('beforeinput', () => { typing = true; });

const observer = new MutationObserver(() => {
  if (typing) {
    typing = false;
    return;
  }
  result.hidden = false;
  observer.disconnect();
  if (window.umami) window.umami.track('welcome-first-fix');
});
observer.observe(box, { childList: true, characterData: true, subtree: true });
