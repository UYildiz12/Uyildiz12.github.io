/* Shared behaviour for course lessons: party on hover, click-to-load YouTube embeds. */
(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Confetti burst from an element. Throttled so hovering back and forth doesn't flood the page.
  var lastBurst = 0;
  function burst(el) {
    if (reduceMotion) return;
    var now = Date.now();
    if (now - lastBurst < 1500) return;
    lastBurst = now;

    var canvas = document.createElement('canvas');
    canvas.className = 'party-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var box = el.getBoundingClientRect();
    var x0 = box.left + box.width / 2;
    var y0 = box.top + box.height / 2;
    var colors = ['#2d72d9', '#e8873a', '#3fb950', '#d2a8ff', '#f778ba', '#f2cc60'];
    var pieces = [];
    for (var i = 0; i < 90; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 3 + Math.random() * 6;
      pieces.push({
        x: x0, y: y0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: 4 + Math.random() * 5,
        spin: Math.random() * Math.PI,
        vspin: (Math.random() - 0.5) * 0.3,
        color: colors[i % colors.length]
      });
    }

    var frames = 0;
    (function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(function (p) {
        p.vy += 0.18;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.spin += p.vspin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);
        ctx.globalAlpha = Math.max(0, 1 - frames / 110);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });
      if (++frames < 110) requestAnimationFrame(tick);
      else canvas.remove();
    })();
  }

  document.querySelectorAll('.party').forEach(function (el) {
    el.addEventListener('mouseenter', function () { burst(el); });
    el.addEventListener('click', function () { burst(el); });
  });

  // Before and after sliders: the range input moves the split.
  document.querySelectorAll('.compare').forEach(function (box) {
    var range = box.querySelector('input[type="range"]');
    range.addEventListener('input', function () {
      box.style.setProperty('--pos', range.value + '%');
    });
  });

  // YouTube cards show a thumbnail and only load the player when clicked.
  document.querySelectorAll('.yt[data-id]').forEach(function (btn) {
    var id = btn.getAttribute('data-id');
    btn.style.backgroundImage = 'url(https://i.ytimg.com/vi/' + id + '/hqdefault.jpg)';
    btn.addEventListener('click', function () {
      var iframe = document.createElement('iframe');
      var start = btn.getAttribute('data-start');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0' + (start ? '&start=' + start : '');
      iframe.title = btn.getAttribute('aria-label') || 'YouTube video';
      iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      btn.parentNode.appendChild(iframe);
      btn.remove();
    }, { once: true });
  });

  // Respect reduced motion for SVG animations too.
  if (reduceMotion) {
    document.querySelectorAll('.rewire svg, .concept svg').forEach(function (svg) {
      if (svg.pauseAnimations) svg.pauseAnimations();
    });
  }
})();
