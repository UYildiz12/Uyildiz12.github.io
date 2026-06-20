(function () {
  var canvas = document.getElementById('neuro');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var INK = '#1c1c1c', BG = '#ffffff', NODE = '#262626';
  var T = 5600, LINK = 162, NR = 2.8;
  var field = [], arms = [], fronts = [], litEdges = [], waveCool = 0, target, sc = 1, ihw = 6, slotH = 9;
  var LT = {}, RT = {};

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function cl(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ss(x) { x = cl(x, 0, 1); return x * x * (3 - 2 * x); }
  function lp(a, b, t) { return a + (b - a) * t; }
  function trap(t) { t = cl(t, 0, 1); var ta = 0.3, vp = 1 / (1 - ta); if (t < ta) return 0.5 * vp / ta * t * t; if (t < 1 - ta) return 0.5 * vp * ta + vp * (t - ta); var d = 1 - t; return 1 - 0.5 * vp / ta * d * d; }

  var SEGS = [{ f: 0, t: 1, d: 0.36, g: [1, 1], m: 1 }, { a: 1, d: 0.12, g: [1, 0] }, { f: 1, t: 2, d: 0.36, g: [0, 0], m: 1 }, { a: 2, d: 0.16, g: [0, 1] }];

  function ik(a, t) {
    var dx = t.x - a.bx, dy = t.y - a.by, d = Math.hypot(dx, dy);
    d = cl(d, Math.abs(a.L1 - a.L2) + 2, a.L1 + a.L2 - 2);
    var c2 = cl((d * d - a.L1 * a.L1 - a.L2 * a.L2) / (2 * a.L1 * a.L2), -1, 1);
    var a2 = a.elbow * Math.acos(c2);
    var a1 = Math.atan2(dy, dx) - Math.atan2(a.L2 * Math.sin(a2), a.L1 + a.L2 * Math.cos(a2));
    return { a1: a1, a2: a2 };
  }
  function fk(a, p) { var ex = a.bx + a.L1 * Math.cos(p.a1), ey = a.by + a.L1 * Math.sin(p.a1); return { ex: ex, ey: ey, wx: ex + a.L2 * Math.cos(p.a1 + p.a2), wy: ey + a.L2 * Math.sin(p.a1 + p.a2), wa: p.a1 + p.a2 }; }
  function ikTip(a, t) { var p = ik(a, t), wa = p.a1 + p.a2; for (var i = 0; i < 5; i++) { p = ik(a, { x: t.x - Math.cos(wa) * a.flen, y: t.y - Math.sin(wa) * a.flen }); wa = p.a1 + p.a2; } return p; }
  function tip(a, k) { return { x: k.wx + Math.cos(k.wa) * a.flen, y: k.wy + Math.sin(k.wa) * a.flen }; }
  function state(a, ph) {
    var acc = 0;
    for (var i = 0; i < SEGS.length; i++) {
      var s = SEGS[i];
      if (ph < acc + s.d || i === SEGS.length - 1) {
        var lt = cl((ph - acc) / s.d, 0, 1);
        if (s.m) { var pa = a.poses[s.f], pb = a.poses[s.t], u = trap(lt); return { a1: lp(pa.a1, pb.a1, u), a2: lp(pa.a2, pb.a2, u), grip: lp(s.g[0], s.g[1], u), seg: i }; }
        var p = a.poses[s.a]; return { a1: p.a1, a2: p.a2, grip: lp(s.g[0], s.g[1], ss(lt)), seg: i };
      }
      acc += s.d;
    }
  }
  function regen(a) {
    var sp = a.poses[2];
    if (a.kind === 'place') {
      a.active = (LT.q.length > 1 && !a.held && field.length < target * 1.85);
      if (a.active) a.poses = [sp, ikTip(a, a.Apt), ikTip(a, { x: W * rnd(0.22, 0.36), y: H * rnd(0.30, 0.80) })];
      else a.poses = [sp, sp, sp];
      return;
    }
    if (a.target) { a.target.claimed = false; a.target = null; }
    var cand = [];
    for (var j = 0; j < field.length; j++) {
      var p = field[j]; if (p.claimed || p.held) continue;
      var dd = Math.hypot(p.x - a.bx, p.y - a.by);
      if (dd > a.reach * 0.35 && dd < a.reach - 6) cand.push(p);
    }
    var inr = cand.length ? cand[(Math.random() * cand.length) | 0] : null;
    if (inr) { inr.claimed = true; a.target = inr; a.active = true; a.poses = [sp, ikTip(a, { x: inr.x, y: inr.y }), ikTip(a, a.Bpt)]; }
    else { a.active = false; a.poses = [sp, sp, sp]; }
  }

  function resize() {
    var r = canvas.getBoundingClientRect(); W = r.width; H = r.height;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    sc = cl(H / 720, 0.7, 1.3);
    var mob = W < 760, as = mob ? 0.85 : 1;
    var L1 = 112 * sc * as, L2 = 90 * sc * as, jr = 14 * sc * as; ihw = 6 * sc; slotH = 9 * sc;
    target = mob ? 20 : 46;
    LT = { x: W * 0.13, mouthY: H * 0.40, q: [] }; LT.dispY = LT.mouthY - 3 * sc;
    RT = { x: W * 0.87, mouthY: H * 0.40, q: [] }; RT.depY = RT.mouthY + 5 * sc;
    var cap = Math.max(6, Math.floor((LT.mouthY - H * 0.04) / slotH));
    for (var i = 0; i < cap; i++) LT.q.push({ y: ltSlot(i), ty: ltSlot(i) });
    arms = [
      mkArm({ bx: W * 0.21, by: H * 0.58, L1: L1, L2: L2, jr: jr, elbow: 1, kind: 'place', period: T, phase: 0,
        rest: { x: W * 0.25, y: H * 0.30 }, A: { x: LT.x, y: LT.dispY }, B: { x: W * 0.30, y: H * 0.56 } }),
      mkArm({ bx: W * 0.79, by: H * 0.58, L1: L1, L2: L2, jr: jr, elbow: -1, kind: 'remove', period: T, phase: 0.5,
        rest: { x: W * 0.75, y: H * 0.30 }, A: { x: W * 0.70, y: H * 0.56 }, B: { x: RT.x, y: RT.depY } })
    ];
  }
  function ltSlot(i) { return LT.dispY - i * slotH; }
  function rtSlot(k) { return RT.mouthY - 6 * sc - k * slotH; }
  function mkArm(c) { c.reach = c.L1 + c.L2; c.flen = c.jr * 1.4; c.target = null; c.active = true; c.live = false; c.Apt = c.A; c.Bpt = c.B; c.poses = [ikTip(c, c.Bpt), ikTip(c, c.Apt), ikTip(c, c.Bpt)]; c.gC = -1; c.rC = -1; c._cyc = -2; return c; }

  function neuron(x, y, mover) { return { x: x, y: y, vx: rnd(-0.16, 0.16), vy: rnd(-0.16, 0.16), r: NR, claimed: false, held: false, mover: !!mover, lit: 0 }; }
  function seed() { field = []; var n = Math.round(target * 1.55); for (var i = 0; i < n; i++) field.push(neuron(rnd(W * 0.22, W * 0.70), rnd(H * 0.18, H * 0.82))); for (var m = 0; m < 3; m++) field.push(neuron(W * (0.40 + m * 0.13), H * rnd(0.52, 0.63), true)); }
  function nbrs(p) { var r = []; for (var j = 0; j < field.length; j++) { var q = field[j]; if (q === p || q.held || q.claimed) continue; var dx = p.x - q.x, dy = p.y - q.y; if (dx * dx + dy * dy < LINK * LINK) r.push(q); } return r; }
  function stepSignals() {
    var maxLit = 0;
    for (var i = 0; i < field.length; i++) { field[i].lit *= 0.985; if (field[i].lit > maxLit) maxLit = field[i].lit; }
    for (var e = litEdges.length - 1; e >= 0; e--) { litEdges[e].lit *= 0.9; if (litEdges[e].lit < 0.04) litEdges.splice(e, 1); }
    if (fronts.length === 0 && maxLit < 0.06) {
      if (waveCool > 0) waveCool--;
      else if (Math.random() < 0.06 && field.length > 4) { var sp = field[(Math.random() * field.length) | 0]; if (sp && !sp.held && !sp.claimed && nbrs(sp).length) { sp.lit = 1; fronts.push({ n: sp, from: null, lit: 1, timer: 33 }); waveCool = 90; } }
    }
    for (var f = fronts.length - 1; f >= 0; f--) {
      var fr = fronts[f]; fr.timer--;
      if (fr.timer <= 0) {
        var nl = fr.lit * 0.86;
        if (nl > 0.13 && fronts.length < 40) {
          var ns = nbrs(fr.n), dx = 0, dy = 0;
          if (fr.from) { dx = fr.n.x - fr.from.x; dy = fr.n.y - fr.from.y; var dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl; }
          var cands = [];
          for (var k = 0; k < ns.length; k++) { var q = ns[k]; if (q === fr.from || q.lit > nl * 0.5) continue; var vx = q.x - fr.n.x, vy = q.y - fr.n.y, vl = Math.hypot(vx, vy) || 1, s2 = fr.from ? (vx / vl * dx + vy / vl * dy) : 0; if (!fr.from || s2 > -0.15) cands.push({ q: q, s: s2 }); }
          cands.sort(function (a, b) { return b.s - a.s; });
          var lim = fr.from ? 2 : 3;
          for (var c = 0; c < cands.length && c < lim; c++) { var q2 = cands[c].q; q2.lit = nl; fronts.push({ n: q2, from: fr.n, lit: nl, timer: 33 }); litEdges.push({ a: fr.n, b: q2, lit: nl }); }
        }
        fronts.splice(f, 1);
      }
    }
  }
  function drawGlow() {
    for (var e = 0; e < litEdges.length; e++) { var le = litEdges[e]; ctx.strokeStyle = 'rgba(18,18,18,' + (0.45 * le.lit).toFixed(3) + ')'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(le.a.x, le.a.y); ctx.lineTo(le.b.x, le.b.y); ctx.stroke(); }
    for (var i = 0; i < field.length; i++) { var p = field[i]; if (p.lit > 0.05) { ctx.fillStyle = 'rgba(22,22,22,' + (0.26 * p.lit).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, NR + NR * 3.4 * p.lit, 0, 6.2832); ctx.fill(); } }
  }

  function stepField() {
    var top = H * 0.12, bot = H * 0.88, vDriftT = W * 0.00018;
    var rightWall = W * 0.72, leftWall = W * 0.20;
    for (var s1 = 0; s1 < field.length; s1++) {
      var pa = field[s1]; if (pa.held || pa.claimed) continue;
      for (var s2 = s1 + 1; s2 < field.length; s2++) {
        var pb = field[s2]; if (pb.held || pb.claimed) continue;
        var sdx = pa.x - pb.x, sdy = pa.y - pb.y, sd2 = sdx * sdx + sdy * sdy;
        if (sd2 > 0.01 && sd2 < 2500) { var sd = Math.sqrt(sd2), sf = (50 - sd) / 50 * 0.05 / sd; pa.vx += sdx * sf; pa.vy += sdy * sf; pb.vx -= sdx * sf; pb.vy -= sdy * sf; }
      }
    }
    for (var i = 0; i < field.length; i++) {
      var p = field[i]; if (p.claimed || p.held) continue;
      if (p.mover) {
        p.vx += rnd(-0.008, 0.008); p.vy += rnd(-0.004, 0.004);
        p.vx += (vDriftT - p.vx) * 0.04; p.vx *= 0.999; p.vy *= 0.86;
      } else {
        p.vx += rnd(-0.01, 0.01); p.vy += rnd(-0.01, 0.01);
        if (p.x < W * 0.63) p.vx += (0.026 - p.vx) * 0.005;
        p.vx *= 0.996; p.vy *= 0.996;
        var spd = Math.hypot(p.vx, p.vy);
        if (spd < 0.05) { p.vx += rnd(-0.04, 0.04); p.vy += rnd(-0.04, 0.04); }
        else if (spd > 0.4) { p.vx = p.vx / spd * 0.4; p.vy = p.vy / spd * 0.4; }
      }
      p.x += p.vx; p.y += p.vy;
      if (p.x > rightWall) { if (p.mover && !p.claimed) { p.mover = false; p.vx = -0.22; p.vy += rnd(-0.08, 0.08); } else { p.x = rightWall; p.vx = -Math.abs(p.vx) * 0.8 - 0.05; } } else if (p.x < leftWall) { p.x = leftWall; p.vx = Math.abs(p.vx) * 0.8; }
      if (p.y < top) { p.y = top; p.vy = Math.abs(p.vy) * 0.8; } else if (p.y > bot) { p.y = bot; p.vy = -Math.abs(p.vy) * 0.8; }
    }
    var mc2 = 0; for (var mi = 0; mi < field.length; mi++) if (field[mi].mover) mc2++;
    if (mc2 < 3 && Math.random() < 0.04) { var pool = []; for (var pj = 0; pj < field.length; pj++) { var pp = field[pj]; if (!pp.mover && !pp.held && !pp.claimed && pp.x < W * 0.6) pool.push(pp); } if (pool.length) pool[(Math.random() * pool.length) | 0].mover = true; }
    var qi;
    for (qi = 0; qi < LT.q.length; qi++) LT.q[qi].y += (LT.q[qi].ty - LT.q[qi].y) * 0.2;
    for (qi = RT.q.length - 1; qi >= 0; qi--) { RT.q[qi].y += (RT.q[qi].ty - RT.q[qi].y) * 0.2; if (RT.q[qi].ty < H * 0.02) RT.q.splice(qi, 1); }
  }

  function takeLeft() { LT.q.shift(); }
  function dropdownLeft() {
    for (var i = 0; i < LT.q.length; i++) LT.q[i].ty = ltSlot(i);
    LT.q.push({ y: ltSlot(LT.q.length) - 40 * sc, ty: ltSlot(LT.q.length) });
  }
  function depositRight() {
    for (var i = 0; i < RT.q.length; i++) RT.q[i].ty -= slotH;
    RT.q.push({ y: RT.depY, ty: rtSlot(0) });
  }

  function fire(a, st, k, now) {
    var cyc = a._cyc;
    if (st.seg === 1 && a.gC !== cyc) {
      a.gC = cyc;
      if (a.kind === 'place') { if (LT.q.length > 1 && !a.held && field.length < target * 1.85) { takeLeft(); a.dropAt = now + 1000; var tp = tip(a, k); var nu = neuron(tp.x, tp.y); nu.held = true; field.push(nu); a.held = nu; } }
      else { a.carrying = false; if (a.target && field.length > 3) { a.target.held = true; a.carry = a.target; a.carrying = true; } a.target = null; }
    }
    if (st.seg === 3 && a.rC !== cyc) {
      a.rC = cyc;
      if (a.kind === 'remove' && a.carrying) { if (a.carry) { var ix = field.indexOf(a.carry); if (ix >= 0) field.splice(ix, 1); a.carry = null; } depositRight(); a.carrying = false; }
    }
  }

  function drawSeg(x0, y0, x1, y1, w) {
    ctx.lineCap = 'round';
    ctx.strokeStyle = INK; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.strokeStyle = BG; ctx.lineWidth = Math.max(2, w - 6); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  }
  function joint(cx, cy, r) {
    ctx.fillStyle = BG; ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.fill(); ctx.stroke();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(cx, cy, r * 0.34, 0, 6.2832); ctx.fill();
  }
  function gripper(k, grip, jr) {
    var fx = Math.cos(k.wa), fy = Math.sin(k.wa), px = -Math.sin(k.wa), py = Math.cos(k.wa);
    var gap = lp(jr * 0.3, jr * 1.05, grip), flen = jr * 1.4, phw = jr * 0.95;
    ctx.strokeStyle = INK; ctx.lineCap = 'round';
    ctx.lineWidth = jr * 0.5; ctx.beginPath(); ctx.moveTo(k.wx - px * phw, k.wy - py * phw); ctx.lineTo(k.wx + px * phw, k.wy + py * phw); ctx.stroke();
    ctx.lineWidth = jr * 0.42;
    ctx.beginPath(); ctx.moveTo(k.wx + px * gap, k.wy + py * gap); ctx.lineTo(k.wx + px * gap + fx * flen, k.wy + py * gap + fy * flen); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(k.wx - px * gap, k.wy - py * gap); ctx.lineTo(k.wx - px * gap + fx * flen, k.wy - py * gap + fy * flen); ctx.stroke();
  }
  function pedestal(a) {
    ctx.fillStyle = BG; ctx.strokeStyle = INK; ctx.lineWidth = 2.2;
    var w = a.jr * 2.6, h = a.jr * 2.8;
    ctx.beginPath(); ctx.moveTo(a.bx - w * 0.4, a.by); ctx.lineTo(a.bx + w * 0.4, a.by); ctx.lineTo(a.bx + w * 0.55, a.by + h); ctx.lineTo(a.bx - w * 0.55, a.by + h); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  function drawArm(a, st) {
    var k = fk(a, st);
    pedestal(a);
    drawSeg(a.bx, a.by, k.ex, k.ey, a.jr * 1.7);
    drawSeg(k.ex, k.ey, k.wx, k.wy, a.jr * 1.4);
    joint(a.bx, a.by, a.jr); joint(k.ex, k.ey, a.jr * 0.82);
    gripper(k, st.grip, a.jr);
    return k;
  }
  function drawTube(t, dir) {
    ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.lineWidth = 3.5 * sc;
    ctx.beginPath(); ctx.moveTo(t.x - ihw, 0); ctx.lineTo(t.x - ihw, t.mouthY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(t.x + ihw, 0); ctx.lineTo(t.x + ihw, t.mouthY); ctx.stroke();
    ctx.lineWidth = 2.6 * sc; ctx.fillStyle = BG;
    ctx.beginPath(); ctx.ellipse(t.x, t.mouthY, ihw + 2, 4 * sc, 0, 0, 6.2832); ctx.fill(); ctx.stroke();
  }
  function drawQueue(t) {
    ctx.fillStyle = NODE;
    for (var i = 0; i < t.q.length; i++) { if (t.q[i].y > H * 0.02) { ctx.beginPath(); ctx.arc(t.x, t.q[i].y, NR, 0, 6.2832); ctx.fill(); } }
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    drawTube(LT, -1); drawTube(RT, 1);
    drawQueue(LT); drawQueue(RT);
    ctx.lineWidth = 1;
    for (var i = 0; i < field.length; i++) {
      var a = field[i];
      for (var j = i + 1; j < field.length; j++) {
        var b = field[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) { ctx.strokeStyle = 'rgba(40,40,40,' + (0.42 * (1 - d / LINK)).toFixed(3) + ')'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
    }
    drawGlow();
    ctx.fillStyle = NODE;
    for (var n = 0; n < field.length; n++) { var p = field[n]; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill(); }
    for (var m = 0; m < arms.length; m++) {
      var ar = arms[m], ph = (((now / ar.period) + ar.phase) % 1 + 1) % 1, cyc = Math.floor((now / ar.period) + ar.phase);
      if (cyc !== ar._cyc) { ar._cyc = cyc; regen(ar); if (ph < 0.3) ar.live = true; }
      if (ar.dropAt && now >= ar.dropAt) { dropdownLeft(); ar.dropAt = 0; }
      if (!ar.active || !ar.live) { drawArm(ar, { a1: ar.poses[0].a1, a2: ar.poses[0].a2, grip: 1, seg: 0 }); continue; }
      var st = state(ar, ph), k = drawArm(ar, st);
      fire(ar, st, k, now);
      if (ar.kind === 'place' && ar.held) { var htp = tip(ar, k); ar.held.x = htp.x; ar.held.y = htp.y; if (st.seg === 3 && st.grip > 0.5) { ar.held.held = false; ar.held = null; } }
      if (ar.kind === 'remove' && ar.carry) { var ctp = tip(ar, k); ar.carry.x = ctp.x; ar.carry.y = ctp.y; }
    }
  }

  var started = false;
  function loop(now) { stepField(); stepSignals(); draw(now); requestAnimationFrame(loop); }
  function start() { resize(); if (H < 80) { setTimeout(start, 120); return; } if (started) return; started = true; seed(); if (reduce) draw(0); else requestAnimationFrame(loop); }
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { resize(); if (!started) start(); }, 150); });
  canvas.addEventListener('click', function (e) {
    var r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (field.length < target * 1.8) field.push(neuron(x, y));
  });
  start();
})();
