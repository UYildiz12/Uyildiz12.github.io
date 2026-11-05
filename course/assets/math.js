/* Typesets <span class="m">...</span> with KaTeX, and <span class="m d">...</span> as a displayed equation.
   Underscores are written \_ in the Markdown so it doesn't read them as emphasis. */
(function () {
  if (!window.katex) return;
  document.querySelectorAll('.m').forEach(function (el) {
    var display = el.classList.contains('d');
    katex.render(el.textContent, el, { displayMode: display, throwOnError: false });
    if (display && el.parentNode.tagName === 'P') el.parentNode.classList.add('math-block');
  });
})();
