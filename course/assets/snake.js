/* Snake as an RL episode. <figure class="snake"> becomes a 10 by 10 board played by the reader or by one of three
   policies. Random picks any direction but straight back. Greedy heads for the food unless that crashes right away.
   Learner starts knowing nothing and improves with Q-learning on a small view of the board (which way it's heading,
   which directions crash, and which way the food is). Every step pays a reward (+1 food, -1 crash, 0 otherwise),
   shown as chips, each finished episode's return is plotted, and the policies can be sped up to watch Learner train.
   With data-mode="imitate" the policies are You and Copycat instead. Every move the reader makes is recorded with
   Learner's small view of the board, and Copycat plays the move the reader made most often in the situation it's in,
   or a random one in a situation it has never seen. Pressing a key while Copycat plays takes over for that step and
   records the correction, which is human gated DAgger.
   Arrow keys or WASD steer once the board has focus, swipes on touch. */
(function () {
  var N = 10;
  var DIRS = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };
  var NAMES = ['up', 'right', 'down', 'left'];
  var KEYS = { ArrowUp: 'up', ArrowRight: 'right', ArrowDown: 'down', ArrowLeft: 'left', w: 'up', d: 'right', s: 'down', a: 'left' };
  var POLICIES = ['you', 'random', 'greedy', 'learner'];
  var SPEEDS = [1, 10, 100];
  var SHOWN = 10;
  var PATIENCE = 200;  // steps without food before an episode is cut off, so a looping policy can't run forever
  var ALPHA = 0.5, GAMMA = 0.9, DECAY = 0.95, MIN_EXPLORE = 0.02;  // tuned so Learner gets good in a few hundred episodes
  var AVERAGE_OVER = 20;

  function opposite(a, b) { return DIRS[a][0] === -DIRS[b][0] && DIRS[a][1] === -DIRS[b][1]; }
  function same(p, q) { return p[0] === q[0] && p[1] === q[1]; }
  function minus(x) { return String(x).replace('-', '−'); }

  function el(tag, cls, parent) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (parent) parent.appendChild(node);
    return node;
  }

  function build(fig) {
    var imitate = fig.getAttribute('data-mode') === 'imitate';
    var bar = el('div', 'snake-policies', fig);
    var buttons = {};
    (imitate ? ['you', 'copycat'] : POLICIES).forEach(function (name) {
      var b = el('button', null, bar);
      b.type = 'button';
      b.textContent = name[0].toUpperCase() + name.slice(1);
      b.addEventListener('click', function () { choose(name); });
      buttons[name] = b;
    });
    var canvas = el('canvas', null, fig);
    canvas.tabIndex = 0;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'A 10 by 10 snake game. Arrow keys or WASD steer.');
    var chips = el('div', 'gw-rewards', fig);
    var stats = el('div', 'snake-stats', fig);
    var chart = el('canvas', 'snake-chart', fig);
    chart.setAttribute('role', 'img');
    var tools = el('div', 'snake-tools', fig);
    var speedButtons = SPEEDS.map(function (s) {
      var b = el('button', null, tools);
      b.type = 'button';
      b.textContent = s + '×';
      b.addEventListener('click', function () { speed = s; restartTimer(); paint(); });
      return b;
    });
    var forget = el('button', 'snake-forget', tools);
    forget.type = 'button';
    forget.textContent = 'Forget';
    forget.addEventListener('click', function () {
      Q = {};
      history.learner = [];
      examples = {};
      exampleCount = 0;
      corrections = 0;
      history.copycat = [];
      stop();
      reset();
      start();
    });

    var ctx = canvas.getContext('2d');
    var cctx = chart.getContext('2d');
    var who = 'you', speed = 1, onScreen = false, running = false, timer = null;
    var snake, dir, food, alive, crashed, hunger, epReturn, rewards, queued;
    var history = { you: [], random: [], greedy: [], learner: [], copycat: [] };
    var Q = {};
    var examples = {}, exampleCount = 0, corrections = 0, familiar = 0, steps = 0;

    function placeFood() {
      var free = [];
      for (var x = 0; x < N; x++) for (var y = 0; y < N; y++) {
        if (!snake.some(function (p) { return p[0] === x && p[1] === y; })) free.push([x, y]);
      }
      food = free[Math.floor(Math.random() * free.length)];
    }

    function reset() {
      snake = [[4, 5], [3, 5], [2, 5]];
      dir = 'right';
      queued = [];
      alive = true;
      crashed = false;
      hunger = 0;
      epReturn = 0;
      rewards = [];
      familiar = 0;
      steps = 0;
      placeFood();
    }

    // Would moving in direction a crash right away?
    function crashes(a) {
      var head = [snake[0][0] + DIRS[a][0], snake[0][1] + DIRS[a][1]];
      if (head[0] < 0 || head[0] >= N || head[1] < 0 || head[1] >= N) return true;
      var body = same(head, food) ? snake : snake.slice(0, -1);
      return body.some(function (p) { return same(p, head); });
    }

    function options() { return NAMES.filter(function (a) { return !opposite(a, dir); }); }
    function pickAny(list) { return list[Math.floor(Math.random() * list.length)]; }

    // What Learner sees: its heading, which of the four directions would crash, and which way the food is.
    function view() {
      return dir + NAMES.map(function (a) { return crashes(a) ? 1 : 0; }).join('') +
        Math.sign(food[0] - snake[0][0]) + ',' + Math.sign(food[1] - snake[0][1]);
    }
    function q(s, a) { return (Q[s] && Q[s][a]) || 0; }
    function explore() { return Math.max(MIN_EXPLORE, Math.pow(DECAY, history.learner.length)); }

    // Copycat: the move recorded most often in this situation, or any move if it has never been seen.
    function copyAction(s) {
      var seen = examples[s];
      if (!seen) return pickAny(options());
      familiar += 1;
      var best = Math.max.apply(null, Object.keys(seen).map(function (a) { return seen[a]; }));
      return pickAny(Object.keys(seen).filter(function (a) { return seen[a] === best; }));
    }

    function record(s, a) {
      examples[s] = examples[s] || {};
      examples[s][a] = (examples[s][a] || 0) + 1;
      exampleCount += 1;
    }

    function policyAction(s) {
      var opts = options();
      if (who === 'copycat') return copyAction(s);
      if (who === 'random') return pickAny(opts);
      if (who === 'learner') {
        if (Math.random() < explore()) return pickAny(opts);
        return opts.reduce(function (best, a) { return q(s, a) > q(s, best) ? a : best; }, pickAny(opts));
      }
      // Greedy: of the moves that don't crash right away, take one that gets closest to the food.
      var safe = opts.filter(function (a) { return !crashes(a); });
      if (!safe.length) return dir;
      var dist = function (a) {
        return Math.abs(snake[0][0] + DIRS[a][0] - food[0]) + Math.abs(snake[0][1] + DIRS[a][1] - food[1]);
      };
      var best = Math.min.apply(null, safe.map(dist));
      var ties = safe.filter(function (a) { return dist(a) === best; });
      return ties.indexOf(dir) >= 0 ? dir : ties[0];
    }

    // One step of the game. Returns whether the episode is over.
    function advance() {
      var s = who === 'learner' || imitate ? view() : null;
      var human = queued.shift();
      var a = who === 'you' ? (human || dir) : who === 'copycat' && human ? human : policyAction(s);
      if (opposite(a, dir)) a = dir;
      steps += 1;
      if (imitate && (who === 'you' || human)) {
        record(s, a);
        if (who === 'copycat') corrections += 1;
      }
      var r = 0;
      if (crashes(a)) {
        r = -1;
        alive = false;
        crashed = true;
      } else {
        dir = a;
        var head = [snake[0][0] + DIRS[a][0], snake[0][1] + DIRS[a][1]];
        snake.unshift(head);
        if (same(head, food)) {
          r = 1;
          hunger = 0;
          if (snake.length === N * N) alive = false;
          else placeFood();
        } else {
          snake.pop();
          if (++hunger >= PATIENCE) alive = false;
        }
      }
      if (who === 'learner') {
        var s2 = alive ? view() : null;
        var target = r + (alive ? GAMMA * Math.max.apply(null, options().map(function (b) { return q(s2, b); })) : 0);
        Q[s] = Q[s] || {};
        Q[s][a] = q(s, a) + ALPHA * (target - q(s, a));
      }
      epReturn += r;
      rewards.push(r);
      if (rewards.length > SHOWN) rewards.shift();
      if (!alive) history[who].push(epReturn);
      return !alive;
    }

    function tick() {
      var count = who === 'you' ? 1 : speed;
      for (var i = 0; i < count; i++) {
        if (!advance()) continue;
        if (who === 'you' || speed === 1) {
          stop();
          if (who !== 'you') timer = setTimeout(function () { if (!running) { reset(); start(); } }, 450);
          break;
        }
        reset();
      }
      paint();
    }

    function start() {
      if (running || !onScreen) return;
      if (!alive) reset();
      running = true;
      restartTimer();
      paint();
    }

    function restartTimer() {
      if (!running) return;
      clearInterval(timer);
      timer = setInterval(tick, who === 'you' ? 170 : who === 'copycat' && speed === 1 ? 140 : 45);
    }

    function stop() {
      running = false;
      clearInterval(timer);
      clearTimeout(timer);
    }

    function choose(name) {
      stop();
      who = name;
      if (who === 'you') speed = 1;
      reset();
      if (who !== 'you') start();
      if (imitate && who === 'copycat') canvas.focus({ preventScroll: true });
      paint();
    }

    function color(name) { return getComputedStyle(fig).getPropertyValue(name).trim(); }

    function fitCanvas(c, w, h) {
      var dpr = window.devicePixelRatio || 1;
      if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
        c.style.width = w + 'px';
        c.style.height = h + 'px';
      }
      c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function paint() {
      var size = Math.min(fig.clientWidth || 300, 300);
      fitCanvas(canvas, size, size);
      var c = size / N;
      ctx.fillStyle = color('--c-card');
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = color('--c-accent');
      ctx.beginPath();
      ctx.arc((food[0] + 0.5) * c, (food[1] + 0.5) * c, c * 0.32, 0, Math.PI * 2);
      ctx.fill();
      snake.forEach(function (p, i) {
        ctx.fillStyle = i === 0 ? color('--c-warm') : color('--c-ink');
        ctx.globalAlpha = i === 0 ? 1 : crashed ? 0.4 : 0.75;
        ctx.fillRect(p[0] * c + 1.5, p[1] * c + 1.5, c - 3, c - 3);
      });
      ctx.globalAlpha = 1;
      if (crashed) {
        var h = snake[0], m = c * 0.28;
        ctx.strokeStyle = color('--c-card');
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(h[0] * c + m, h[1] * c + m);
        ctx.lineTo((h[0] + 1) * c - m, (h[1] + 1) * c - m);
        ctx.moveTo((h[0] + 1) * c - m, h[1] * c + m);
        ctx.lineTo(h[0] * c + m, (h[1] + 1) * c - m);
        ctx.stroke();
      }
      if (!running && who === 'you') {
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = color('--c-card');
        ctx.fillRect(0, 0, size, size);
        ctx.globalAlpha = 1;
        ctx.fillStyle = color('--c-accent');
        ctx.beginPath();
        ctx.moveTo(size / 2 - 14, size / 2 - 18);
        ctx.lineTo(size / 2 + 20, size / 2);
        ctx.lineTo(size / 2 - 14, size / 2 + 18);
        ctx.closePath();
        ctx.fill();
      }

      chips.replaceChildren();
      rewards.forEach(function (r) {
        var chip = el('span', r > 0 ? 'pos' : r < 0 ? 'neg' : '', chips);
        chip.textContent = r > 0 ? '+1' : r < 0 ? '−1' : '0';
      });

      var returns = history[who];
      var avg = returns.length ? returns.reduce(function (t, x) { return t + x; }, 0) / returns.length : 0;
      var items = [['return', minus(epReturn)], ['episodes', String(returns.length)],
                   ['average return', returns.length ? minus(avg.toFixed(2)) : '·']];
      if (who === 'learner') items.push(['exploring', Math.round(explore() * 100) + '%']);
      if (imitate && who === 'you') items.push(['examples', String(exampleCount)]);
      if (who === 'copycat') {
        items.push(['familiar', steps ? Math.round(100 * familiar / steps) + '%' : '·']);
        items.push(['corrections', String(corrections)]);
      }
      stats.replaceChildren();
      items.forEach(function (pair) {
        var item = el('span', null, stats);
        el('small', null, item).textContent = pair[0];
        el('b', null, item).textContent = pair[1];
      });

      tools.hidden = who === 'you' && !(imitate && exampleCount);
      forget.hidden = who !== 'learner' && !imitate;
      speedButtons.forEach(function (b) { b.hidden = who === 'you'; });
      if (imitate) speedButtons[2].hidden = true;
      speedButtons.forEach(function (b, i) { b.classList.toggle('is-on', SPEEDS[i] === speed); });
      Object.keys(buttons).forEach(function (k) { buttons[k].classList.toggle('is-on', k === who); });
      plot(size, returns);
    }

    // Every episode's return as a dot, with a line for the average of the last few.
    function plot(width, returns) {
      var height = 90, pad = 6;
      chart.hidden = !returns.length;
      if (!returns.length) return;
      fitCanvas(chart, width, height);
      chart.setAttribute('aria-label', 'Return of each of ' + returns.length + ' episodes');
      cctx.clearRect(0, 0, width, height);
      var top = Math.max(5, Math.max.apply(null, returns)), bottom = -1;
      var n = Math.max(returns.length, 20);
      var x = function (i) { return pad + (width - 2 * pad) * (n === 1 ? 0.5 : i / (n - 1)); };
      var y = function (v) { return height - pad - (height - 2 * pad) * (v - bottom) / (top - bottom); };
      cctx.strokeStyle = color('--c-line');
      cctx.lineWidth = 1;
      cctx.beginPath();
      cctx.moveTo(pad, y(0));
      cctx.lineTo(width - pad, y(0));
      cctx.stroke();
      cctx.fillStyle = color('--c-muted');
      cctx.globalAlpha = 0.45;
      var r = returns.length > 150 ? 1.2 : 2;
      returns.forEach(function (v, i) {
        cctx.beginPath();
        cctx.arc(x(i), y(v), r, 0, Math.PI * 2);
        cctx.fill();
      });
      cctx.globalAlpha = 1;
      cctx.strokeStyle = color('--c-accent');
      cctx.lineWidth = 2;
      cctx.beginPath();
      var sum = 0;
      returns.forEach(function (v, i) {
        sum += v;
        if (i >= AVERAGE_OVER) sum -= returns[i - AVERAGE_OVER];
        var mean = sum / Math.min(i + 1, AVERAGE_OVER);
        if (i === 0) cctx.moveTo(x(i), y(mean));
        else cctx.lineTo(x(i), y(mean));
      });
      cctx.stroke();
      cctx.fillStyle = color('--c-muted');
      cctx.font = '10px ui-monospace, monospace';
      cctx.textAlign = 'right';
      cctx.fillText(String(top), width - pad, pad + 8);
    }

    function steer(a) {
      if (who !== 'you' && who !== 'copycat') return;
      onScreen = true;
      if (!running) { start(); queued = [a]; return; }
      var last = queued.length ? queued[queued.length - 1] : dir;
      if (a !== last && !opposite(a, last) && queued.length < 2) queued.push(a);
    }

    canvas.addEventListener('click', function () { onScreen = true; canvas.focus(); if (who === 'you' && !running) start(); });
    canvas.addEventListener('keydown', function (e) {
      var a = KEYS[e.key] || KEYS[e.key.toLowerCase && e.key.toLowerCase()];
      if (!a) return;
      e.preventDefault();
      steer(a);
    });
    var touch = null;
    canvas.addEventListener('touchstart', function (e) { touch = [e.touches[0].clientX, e.touches[0].clientY]; }, { passive: true });
    canvas.addEventListener('touchmove', function (e) { if (touch && who === 'you') e.preventDefault(); }, { passive: false });
    canvas.addEventListener('touchend', function (e) {
      if (!touch) return;
      var dx = e.changedTouches[0].clientX - touch[0], dy = e.changedTouches[0].clientY - touch[1];
      touch = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) { onScreen = true; if (who === 'you' && !running) start(); return; }
      steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    });

    // Only run while the board is on screen.
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (!onScreen) stop();
      else if (who !== 'you') start();
      paint();
    }).observe(canvas);

    new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.addEventListener('resize', paint);
    choose('you');
  }

  document.querySelectorAll('figure.snake').forEach(build);
})();
