/* The 3 by 3 grid world from the RL lessons. <figure class="grid-world" data-mode="..."> becomes the grid.
   labels  names every cell
   policy  draws the arrows in data-policy, one action per cell from s1 to s9
   play    the same arrows, but clicking a cell turns its arrow, with a start cell, a gamma slider, the first
           rewards faded by gamma^t and the discounted return */
(function () {
  var CELL = 64, PAD = 4, SIZE = 3 * CELL + 2 * PAD;
  var FORBIDDEN = [6, 7], TARGET = 9;
  var ORDER = ['up', 'right', 'down', 'left', 'stay'];
  var MOVES = { up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1], stay: [0, 0] };
  var NS = 'http://www.w3.org/2000/svg';
  var SHOWN = 10;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function make(name, attrs, parent) {
    var node = document.createElementNS(NS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  function tryMove(s, a) {
    var row = Math.floor((s - 1) / 3) + MOVES[a][0];
    var col = (s - 1) % 3 + MOVES[a][1];
    if (row < 0 || row > 2 || col < 0 || col > 2) return null;
    return row * 3 + col + 1;
  }

  function step(s, a) {
    var next = tryMove(s, a);
    if (next === null) return [s, -1];
    if (FORBIDDEN.indexOf(next) >= 0) return [next, -1];
    return [next, next === TARGET ? 1 : 0];
  }

  function corner(s) { return [PAD + ((s - 1) % 3) * CELL, PAD + Math.floor((s - 1) / 3) * CELL]; }
  function center(s) { var c = corner(s); return [c[0] + CELL / 2, c[1] + CELL / 2]; }

  function name(s, x, y, size, parent) {
    var t = make('text', { x: x, y: y, 'text-anchor': 'middle', 'font-size': size }, parent);
    t.textContent = 's';
    var sub = make('tspan', { 'baseline-shift': 'sub', 'font-size': Math.round(size * 0.7) }, t);
    sub.textContent = s;
    return t;
  }

  function arrow(s, a, parent) {
    var g = make('g', { 'class': 'gw-arrow' }, parent);
    var c = center(s);
    if (a === 'stay') {
      make('circle', { cx: c[0], cy: c[1], r: 7 }, g);
      return g;
    }
    var dy = MOVES[a][0], dx = MOVES[a][1];
    var x0 = c[0] - dx * 15, y0 = c[1] - dy * 15, x1 = c[0] + dx * 15, y1 = c[1] + dy * 15;
    make('line', { x1: x0, y1: y0, x2: x1 - dx * 6, y2: y1 - dy * 6 }, g);
    var px = -dy, py = dx;
    make('polygon', {
      'class': 'gw-head',
      points: [x1 + dx * 2, y1 + dy * 2, x1 - dx * 8 + px * 6, y1 - dy * 8 + py * 6, x1 - dx * 8 - px * 6, y1 - dy * 8 - py * 6].join(' ')
    }, g);
    return g;
  }

  function build(fig) {
    var mode = fig.getAttribute('data-mode') || 'labels';
    var policy = (fig.getAttribute('data-policy') || 'stay stay stay stay stay stay stay stay stay').split(/\s+/);
    var svg = make('svg', { viewBox: '0 0 ' + SIZE + ' ' + SIZE, role: 'img' });
    svg.style.maxWidth = SIZE + 'px';
    fig.appendChild(svg);

    var cells = {};
    for (var s = 1; s <= 9; s++) {
      var k = corner(s);
      var kind = FORBIDDEN.indexOf(s) >= 0 ? ' gw-forbidden' : s === TARGET ? ' gw-target' : '';
      cells[s] = make('rect', { 'class': 'gw-cell' + kind, x: k[0] + 2, y: k[1] + 2, width: CELL - 4, height: CELL - 4, rx: 6 }, svg);
      if (mode === 'labels') {
        var c = center(s);
        name(s, c[0], c[1] + 6, 18, svg);
      } else {
        name(s, k[0] + 13, k[1] + 17, 11, svg).setAttribute('class', 'gw-small');
      }
    }

    if (mode === 'labels') {
      svg.setAttribute('aria-label', 'A 3 by 3 grid of cells s1 to s9. s6 and s7 are forbidden and s9 is the target.');
      return;
    }

    var arrows = make('g', {}, svg);
    function drawArrows() {
      arrows.replaceChildren();
      for (var s = 1; s <= 9; s++) arrow(s, policy[s - 1], arrows);
      svg.setAttribute('aria-label', 'The grid with a policy: ' + policy.map(function (a, i) { return 's' + (i + 1) + ' ' + a; }).join(', '));
    }
    drawArrows();
    if (mode !== 'play') return;

    fig.classList.add('is-play');
    var agent = make('circle', { 'class': 'gw-agent', r: 9 }, svg);
    for (var h = 1; h <= 9; h++) {
      var hk = corner(h);
      var hit = make('rect', { 'class': 'gw-hit', x: hk[0], y: hk[1], width: CELL, height: CELL }, svg);
      hit.addEventListener('click', (function (s) {
        return function () {
          policy[s - 1] = ORDER[(ORDER.indexOf(policy[s - 1]) + 1) % ORDER.length];
          drawArrows();
          update();
        };
      })(h));
    }

    var controls = document.createElement('div');
    controls.className = 'gw-controls';
    var startLabel = document.createElement('label');
    startLabel.textContent = 'start ';
    var start = document.createElement('select');
    for (var o = 1; o <= 9; o++) {
      var opt = document.createElement('option');
      opt.value = o;
      opt.textContent = 's' + o;
      start.appendChild(opt);
    }
    startLabel.appendChild(start);
    var gammaLabel = document.createElement('label');
    gammaLabel.textContent = 'γ ';
    var gamma = document.createElement('input');
    gamma.type = 'range';
    gamma.min = '0';
    gamma.max = '0.95';
    gamma.step = '0.05';
    gamma.value = '0.9';
    var gammaOut = document.createElement('output');
    gammaLabel.appendChild(gamma);
    gammaLabel.appendChild(gammaOut);
    controls.appendChild(startLabel);
    controls.appendChild(gammaLabel);
    var chips = document.createElement('div');
    chips.className = 'gw-rewards';
    var total = document.createElement('div');
    total.className = 'gw-return';
    fig.appendChild(controls);
    fig.appendChild(chips);
    fig.appendChild(total);

    var path = [];
    var frame = 0;
    function place() {
      var c = center(path[frame % path.length]);
      agent.setAttribute('cx', c[0] + 18);
      agent.setAttribute('cy', c[1] + 18);
    }

    function update() {
      var g = parseFloat(gamma.value);
      gammaOut.textContent = g.toFixed(2);
      var s = parseInt(start.value, 10);
      var G = 0, weight = 1;
      path = [s];
      chips.replaceChildren();
      for (var t = 0; t < 1000; t++) {
        var out = step(s, policy[s - 1]);
        s = out[0];
        G += weight * out[1];
        if (t < SHOWN) {
          path.push(s);
          var chip = document.createElement('span');
          chip.textContent = out[1] > 0 ? '+1' : out[1] < 0 ? '−1' : '0';
          chip.className = out[1] > 0 ? 'pos' : out[1] < 0 ? 'neg' : '';
          chip.style.opacity = Math.max(0.12, weight).toFixed(3);
          chips.appendChild(chip);
        }
        weight *= g;
        if (weight < 1e-12) break;
      }
      total.textContent = 'G = ' + G.toFixed(2).replace('-', '−');
      for (var c = 1; c <= 9; c++) cells[c].classList.toggle('gw-visited', path.indexOf(c) >= 0);
      frame = 0;
      place();
    }

    start.addEventListener('change', update);
    gamma.addEventListener('input', update);
    update();

    if (!reduceMotion) {
      setInterval(function () {
        frame = (frame + 1) % path.length;
        place();
      }, 550);
    }
  }

  document.querySelectorAll('.grid-world').forEach(build);
})();
