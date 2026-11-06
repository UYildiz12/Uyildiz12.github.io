/* Runnable Python cells. Each <pre class="py"> becomes an editable cell; Python (Pyodide) loads on the first run.
   An exercise cell can be followed by <pre class="py-check"> (asserts run after the reader's code) and
   <pre class="py-solution"> (shown on request). data-files="a.npz b.csv" copies those files from
   /course/assets/data/ into Python's working directory before the cell runs.
   A lab cell, <pre class="py" data-lab="true">, is an open problem. It's followed by <pre class="py-solution">
   (the reference) and <pre class="py-rubric"> (what a solution must do), and its Check button sends the reader's
   code, the reference and what each printed to the grader, which decides whether it does what was asked. */
(function () {
  var PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v314.0.7/full/';
  var DATA = '/course/assets/data/';
  var GRADER = window.COURSE_GRADER_URL || 'https://course-grader.uyildiz12.workers.dev/';
  var cells = [];
  var ready = null;
  var loadedFiles = {};

  // Helpers defined once in the shared namespace. _run_cell returns the repr of a cell's
  // last expression like a notebook does, _run_check turns a failed assert into a hint, and
  // _grab_figures collects every open matplotlib figure as a PNG so plt.show() isn't needed.
  var HELPERS = [
    'async def _run_cell(src):',
    '    from pyodide.code import eval_code_async',
    '    value = await eval_code_async(src, globals(), filename="<cell>")',
    '    first = value[0] if isinstance(value, (list, tuple)) and value else value',
    '    if value is None or type(first).__module__.startswith("matplotlib"):',
    '        return None',
    '    return repr(value)',
    '',
    'async def _run_check(src):',
    '    from pyodide.code import eval_code_async',
    '    try:',
    '        await eval_code_async(src, globals(), filename="<check>")',
    '    except AssertionError as e:',
    '        return str(e) or "Not quite yet."',
    '    except Exception as e:',
    '        if "ellipsis" in str(e).lower():',
    '            return "Replace the ... with your code."',
    '        return f"{type(e).__name__}: {e}"',
    '    return None',
    '',
    'async def _run_isolated(src):',
    '    import contextlib, io, sys',
    '    from pyodide.code import eval_code_async',
    '    buf = io.StringIO()',
    '    try:',
    '        with contextlib.redirect_stdout(buf), contextlib.redirect_stderr(buf):',
    '            value = await eval_code_async(src, dict(globals()), filename="<reference>")',
    '        if value is not None:',
    '            buf.write(repr(value))',
    '    except Exception as e:',
    '        buf.write(f"{type(e).__name__}: {e}")',
    '    if "matplotlib.pyplot" in sys.modules:',
    '        import matplotlib.pyplot as plt',
    '        plt.close("all")',
    '    return buf.getvalue()',
    '',
    'def _grab_figures():',
    '    import sys',
    '    if "matplotlib.pyplot" not in sys.modules:',
    '        return []',
    '    import base64, io',
    '    import matplotlib.pyplot as plt',
    '    out = []',
    '    for n in plt.get_fignums():',
    '        buf = io.BytesIO()',
    '        plt.figure(n).savefig(buf, format="png", dpi=110, bbox_inches="tight")',
    '        out.append(base64.b64encode(buf.getvalue()).decode())',
    '    plt.close("all")',
    '    return out'
  ].join('\n');

  // For cells with diagrams. _run_traced runs a cell like _run_cell while recording it step by step.
  var VIZ_HELPERS = String.raw`
def _viz_atom(v):
    if type(v).__module__ == "numpy" and getattr(v, "ndim", None) == 0:
        return _viz_num(v.item())
    r = repr(v)
    return r if len(r) <= 40 else r[:37] + "..."

def _viz_num(x):
    if isinstance(x, float):
        return f"{x:.3g}" if x != 0 and (abs(x) < 1e-3 or abs(x) >= 1e4) else str(round(x, 2))
    return repr(x)

def _viz_spec(v, depth=0):
    import types
    if isinstance(v, str):
        if depth == 0 and 0 < len(v) <= 30:
            return {"k": "str", "items": list(v)}
        return {"k": "atom", "r": _viz_atom(v)}
    if type(v).__module__ == "numpy" and getattr(v, "ndim", 0) in (1, 2):
        if v.ndim == 1:
            return {"k": "array", "id": id(v), "nd": 1, "items": [_viz_num(x) for x in v[:16].tolist()], "more": max(0, v.size - 16)}
        rows = [[_viz_num(x) for x in row] for row in v[:10, :12].tolist()]
        return {"k": "array", "id": id(v), "nd": 2, "items": rows, "more": int(v.shape[0] > 10 or v.shape[1] > 12)}
    if isinstance(v, (list, tuple)):
        kind = "tuple" if isinstance(v, tuple) else "list"
        return {"k": kind, "id": id(v), "items": [_viz_atom(x) for x in v[:20]], "more": max(0, len(v) - 20)}
    if isinstance(v, (set, frozenset)):
        return {"k": "set", "id": id(v), "items": sorted(_viz_atom(x) for x in v)[:20]}
    if isinstance(v, dict):
        return {"k": "dict", "id": id(v), "items": [[_viz_atom(a), _viz_atom(b)] for a, b in list(v.items())[:16]]}
    if depth == 0 and type(v).__module__ == "__main__" and hasattr(v, "__dict__") and not isinstance(v, (type, types.FunctionType)):
        return {"k": "obj", "id": id(v), "cls": type(v).__name__, "attrs": [[a, _viz_spec(b, 1)] for a, b in vars(v).items()]}
    return {"k": "atom", "r": _viz_atom(v)}

def _viz_plain(v):
    import types
    if v is None or isinstance(v, (bool, int, float, complex, str, list, tuple, dict, set, frozenset)):
        return True
    if type(v).__module__ == "numpy":
        return getattr(v, "ndim", 0) in (0, 1, 2)
    return type(v).__module__ == "__main__" and hasattr(v, "__dict__") and not isinstance(v, (type, types.FunctionType))

def _viz_names(tree):
    # The names a cell assigns, or changes through x.append(...), x[i] = ... or x.attr = ..., in order.
    import ast
    skip = (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef, ast.Lambda, ast.ListComp, ast.SetComp,
            ast.DictComp, ast.GeneratorExp, ast.Import, ast.ImportFrom)
    found = []
    def add(node):
        if isinstance(node, ast.Name) and not node.id.startswith("_") and node.id not in found:
            found.append(node.id)
    def visit(node):
        for child in ast.iter_child_nodes(node):
            if isinstance(child, skip):
                continue
            if isinstance(child, ast.Name) and isinstance(child.ctx, ast.Store):
                add(child)
            elif isinstance(child, (ast.Subscript, ast.Attribute)) and isinstance(child.ctx, ast.Store):
                add(child.value)
            elif isinstance(child, ast.Call) and isinstance(child.func, ast.Attribute):
                add(child.func.value)
            visit(child)
    visit(tree)
    return found

def _viz_lines(tree):
    # For each statement at the top of the cell (inside loops and ifs too, but not inside functions or
    # classes): which first line every line belongs to, how far each statement reaches, and which lines give
    # which names a value. A statement over several lines is one step and lights up as one block.
    import ast
    starts = {}
    spans = {}
    binds = {}
    def bound(target, line):
        for node in ast.walk(target):
            if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store):
                binds.setdefault(node.id, set()).add(line)
    def visit(stmts):
        for s in stmts:
            inner = [b for b in (getattr(s, "body", None), getattr(s, "orelse", None), getattr(s, "finalbody", None)) if isinstance(b, list) and b and isinstance(b[0], ast.stmt)]
            inner += [h.body for h in getattr(s, "handlers", [])]
            top = min([b[0].lineno for b in inner], default=s.end_lineno + 1) - 1 if inner else s.end_lineno
            # An elif is an if inside the orelse of the one before, so its header starts its own block.
            top = max(top, s.lineno)
            for n in range(s.lineno, top + 1):
                starts[n] = s.lineno
            spans[s.lineno] = top
            if isinstance(s, (ast.Assign, ast.AugAssign, ast.AnnAssign)):
                for t in (s.targets if isinstance(s, ast.Assign) else [s.target]):
                    bound(t, s.lineno)
            elif isinstance(s, (ast.For, ast.AsyncFor)):
                bound(s.target, s.lineno)
            elif isinstance(s, (ast.With, ast.AsyncWith)):
                for item in s.items:
                    if item.optional_vars is not None:
                        bound(item.optional_vars, s.lineno)
            if not isinstance(s, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                for b in inner:
                    visit(b)
    visit(tree.body)
    return starts, spans, binds

class _VizTee:
    # Passes printing through, keeping a copy so each step knows how much had been printed by then.
    def __init__(self, inner):
        self.inner = inner
        self.parts = []
        self.n = 0
    def write(self, s):
        self.parts.append(s)
        self.n += len(s)
        return self.inner.write(s)
    def flush(self):
        return self.inner.flush()
    def __getattr__(self, name):
        return getattr(self.inner, name)

def _run_traced(src, names):
    # Runs a cell the way a debugger steps through it. Every step is a statement as it runs, what the watched
    # names hold once it has, and how much has been printed by then. A call is one step, as in a debugger's
    # step over. The trace lands in _viz_json as {"steps": [[line, state, printed], ...],
    # "spans": {first line: last line}, "out": printed, "value": the last line's value, "error": line or null}.
    import ast, json, sys
    g = globals()
    # The reader's own cell, run in their browser like every other cell. Compiled here rather than with
    # eval_code, whose extra statements report themselves as line 1.
    tree = ast.parse(src, "<cell>")
    starts, spans, binds = _viz_lines(tree)
    end = None
    if tree.body and isinstance(tree.body[-1], ast.Expr):
        end = tree.body.pop()
    body = compile(tree, "<cell>", "exec")
    tail = compile(ast.Expression(end.value), "<cell>", "eval") if end else None
    # "*" watches whatever the cell assigns or changes, and "+" adds those to the names listed, the way a cell
    # the reader has edited still draws the names they brought in. Found names are kept only if their values
    # are worth drawing.
    words = names.split()
    # A listed name the code never mentions, say after the reader renamed it, isn't drawn.
    mentioned = set(n.id for n in ast.walk(tree) if isinstance(n, ast.Name))
    if end:
        mentioned |= set(n.id for n in ast.walk(end) if isinstance(n, ast.Name))
    listed = [n for n in words if n not in ("*", "+") and (n == "_" or n in mentioned)]
    found = []
    if "*" in words or "+" in words:
        found = _viz_names(tree) + (_viz_names(ast.Module([ast.Expr(end.value)], [])) if end else [])
    names = list(dict.fromkeys(listed + found))
    picky = set(found) - set(listed)
    # A name this cell gives a value to appears once that has happened, so an old value left over from an
    # earlier box doesn't show up first. Names it only uses or changes are there from the start.
    live = set(n for n in names if n not in binds)
    def state():
        return [[n, _viz_spec(g[n])] for n in names if n != "_" and n in live and n in g and (n not in picky or _viz_plain(g[n]))]
    tee = _VizTee(sys.stdout)
    steps = []
    last = [None]
    current = [None]
    events = [0]
    def finished(line):
        # The statement at line has just run, so whatever it assigns is now live.
        for n in names:
            if line in binds.get(n, ()):
                live.add(n)
    def snap(line, closing=False):
        if current[0] is not None and current[0] != line:
            finished(current[0])
        # Past the cap only the end is kept, replacing the last step.
        if len(steps) >= 400 and not closing:
            current[0] = line
            return
        s = json.dumps(state())
        if (line, s) != last[0]:
            if len(steps) >= 400:
                steps.pop()
            steps.append((line, s, tee.n))
            last[0] = (line, s)
        current[0] = line
    def local(frame, event, arg):
        if event == "line":
            events[0] += 1
            if events[0] > 50000:
                sys.settrace(None)
                return None
            # Only lines that start a statement of this cell count. An empty cell body reports line 0.
            if frame.f_lineno in starts:
                snap(starts[frame.f_lineno])
        return local
    def tracer(frame, event, arg):
        code = frame.f_code
        return local if code.co_filename == "<cell>" and code.co_name == "<module>" else None
    value = None
    error = None
    sys.stdout = tee
    sys.settrace(tracer)
    try:
        exec(body, g)
        if tail:
            snap(end.lineno)
            value = eval(tail, g)
    except BaseException:
        error = current[0]
        raise
    finally:
        sys.settrace(None)
        sys.stdout = tee.inner
        if error is None and current[0] is not None:
            finished(current[0])
        closing = state()
        # The output keeps exactly what Run shows for any cell, the last line's value included. "_" in the names
        # also draws that value, labelled with its expression, unless it's already drawn under its own name.
        shown = None
        if value is not None:
            first = value[0] if isinstance(value, (list, tuple)) and value else value
            if not type(first).__module__.startswith("matplotlib"):
                shown = repr(value)
            if "_" in names and not any(value is g.get(n) for n, _ in closing):
                label = " ".join((ast.get_source_segment(src, end) or "result").split())
                spec = _viz_spec(value)
                spec["expr"] = True
                closing = closing + [[label if len(label) <= 32 else label[:30] + "...", spec]]
        if len(steps) >= 400:
            steps.pop()
        steps.append((None, json.dumps(closing), tee.n))
        # Each step so far is a line about to run with the picture before it. Shown the other way round,
        # each step is the line running with the picture it leaves behind, so the highlight and the change
        # come together. The first step is the picture before anything has run, and the last keeps the final
        # line lit, or the line that raised an error.
        shown_steps = [(None, steps[0][1], steps[0][2])]
        for k in range(len(steps) - 1):
            step = (steps[k][0], steps[k + 1][1], steps[k + 1][2])
            if step[:2] != shown_steps[-1][:2]:
                shown_steps.append(step)
        packed = ["[" + json.dumps(a) + "," + s + "," + str(n) + "]" for a, s, n in shown_steps]
        g["_viz_json"] = ('{"steps":[' + ",".join(packed) + '],"spans":' + json.dumps(spans) + ',"out":'
                          + json.dumps("".join(tee.parts)) + ',"value":' + json.dumps(shown) + ',"error":' + json.dumps(error) + "}")
    first = value[0] if isinstance(value, (list, tuple)) and value else value
    if value is None or type(first).__module__.startswith("matplotlib"):
        return None
    return repr(value)
`;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Could not load ' + src)); };
      document.head.appendChild(s);
    });
  }

  function python() {
    if (!ready) {
      ready = loadScript(PYODIDE + 'pyodide.js')
        .then(function () { return loadPyodide({ indexURL: PYODIDE }); })
        .then(function (py) {
          py.runPython('import os\nos.environ["MPLBACKEND"] = "AGG"\n' + HELPERS);
          py.runPython(VIZ_HELPERS);
          return py;
        });
      ready.catch(function () { ready = null; });
    }
    return ready;
  }

  async function fetchFiles(py, names) {
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      if (loadedFiles[name]) continue;
      var res = await fetch(DATA + name);
      if (!res.ok) throw new Error('Could not load ' + name);
      py.FS.writeFile(name, new Uint8Array(await res.arrayBuffer()));
      loadedFiles[name] = true;
    }
  }

  // Drop Pyodide's own frames so the traceback starts at the reader's code.
  function cleanTraceback(msg) {
    var lines = msg.trim().split('\n');
    var start = lines.findIndex(function (l) { return l.indexOf('File "<cell>"') !== -1; });
    if (start === -1) return lines[lines.length - 1];
    return 'Traceback (most recent call last):\n' + lines.slice(start).join('\n');
  }

  function fit(area) {
    area.style.height = 'auto';
    // offsetHeight minus clientHeight is the border plus any horizontal scrollbar.
    area.style.height = area.scrollHeight + area.offsetHeight - area.clientHeight + 'px';
  }

  function code(pre) {
    return pre.textContent.replace(/^\n+|\s+$/g, '');
  }

  function button(cls, label, text) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    if (text) b.textContent = text;
    if (label) {
      b.setAttribute('aria-label', label);
      b.title = label;
    }
    return b;
  }

  function build(pre) {
    var source = code(pre);
    var check = null;
    var solution = null;
    var rubric = null;
    var next = pre.nextElementSibling;
    while (next && next.matches('pre.py-check, pre.py-solution, pre.py-rubric')) {
      var after = next.nextElementSibling;
      if (next.matches('.py-check')) check = code(next);
      else if (next.matches('.py-rubric')) rubric = code(next);
      else solution = code(next);
      next.remove();
      next = after;
    }
    var lab = pre.hasAttribute('data-lab');
    // A lab's task is the paragraph right above it.
    var above = pre.previousElementSibling;
    var task = above && above.tagName === 'P' ? [above.textContent.trim()] : [];

    var cell = document.createElement('div');
    cell.className = 'py-cell' + (check ? ' py-exercise' : '') + (lab ? ' py-lab' : '');

    var area = document.createElement('textarea');
    area.className = 'py-code';
    area.value = source;
    area.spellcheck = false;
    area.setAttribute('autocapitalize', 'off');
    area.setAttribute('data-gramm', 'false');
    area.setAttribute('data-gramm_editor', 'false');
    area.setAttribute('data-enable-grammarly', 'false');
    area.setAttribute('aria-label', 'Python code');

    var bar = document.createElement('div');
    bar.className = 'py-bar';
    var run = button('py-run', null, 'Run');
    bar.appendChild(run);
    var controls = document.createElement('span');
    controls.className = 'py-controls';
    bar.appendChild(controls);
    var grade = null;
    if (lab && GRADER && solution && rubric) {
      grade = button('py-grade', null, 'Check');
      bar.appendChild(grade);
    }
    if (solution) {
      var reveal = button('py-solve', 'Show solution');
      reveal.addEventListener('click', function () { area.value = solution; fit(area); });
      bar.appendChild(reveal);
    }
    var reset = button('py-reset', 'Reset code');
    bar.appendChild(reset);

    var out = document.createElement('div');
    out.className = 'py-out';
    out.hidden = true;

    cell.appendChild(area);
    cell.appendChild(bar);
    cell.appendChild(out);
    pre.replaceWith(cell);

    var files = (pre.getAttribute('data-files') || '').split(/\s+/).filter(Boolean);
    var state = {
      cell: cell, area: area, out: out, ran: false, text: '', files: files, original: source,
      skip: pre.hasAttribute('data-skip') || lab, check: check,
      solution: solution, rubric: rubric, task: task.join('\n\n')
    };
    // A demo or exercise with data-show draws the names it lists. A lab, being longer, always watches whatever
    // the reader's code assigns.
    var names = pre.getAttribute('data-show') || (lab ? '*' : null);
    if (names) {
      state.viz = vizBuild(state, names, !lab && !check);
      state.viz.controls.forEach(function (b) { controls.appendChild(b); });
    }
    cells.push(state);

    run.addEventListener('click', function () {
      state.after = 'end';
      runUpTo(state);
    });
    if (grade) grade.addEventListener('click', function () { gradeLab(state); });
    reset.addEventListener('click', function () { area.value = source; fit(area); });
    area.addEventListener('input', function () { fit(area); });
    area.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.shiftKey || e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        state.after = 'end';
        runUpTo(state);
      } else if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        area.setRangeText('    ', area.selectionStart, area.selectionEnd, 'end');
        fit(area);
      }
    });
    requestAnimationFrame(function () { fit(area); });
  }

  function show(state, text, cls) {
    var block = document.createElement('pre');
    if (cls) block.className = cls;
    block.textContent = text;
    state.out.appendChild(block);
    state.out.hidden = false;
  }

  async function execute(py, state, watched) {
    state.out.replaceChildren();
    state.out.hidden = true;
    state.cell.classList.add('py-busy');
    var printed = '';
    py.setStdout({ batched: function (s) { printed += s + '\n'; } });
    py.setStderr({ batched: function (s) { printed += s + '\n'; } });
    var ok = true;
    var value = null;
    var failure = null;
    if (state.viz) py.globals.set('_viz_json', '{}');
    try {
      await fetchFiles(py, state.files);
      await py.loadPackagesFromImports(state.area.value, { messageCallback: function () {} });
      value = state.viz
        // Once the reader has changed the code, anything new it assigns gets drawn too.
        ? py.globals.get('_run_traced')(state.area.value, state.viz.names + (state.area.value !== state.original ? ' +' : ''))
        : await py.globals.get('_run_cell')(state.area.value);
    } catch (err) {
      ok = false;
      failure = cleanTraceback(String(err.message || err));
    }
    var trace = state.viz ? JSON.parse(py.globals.get('_viz_json') || '{}') : null;
    var traced = trace && trace.steps && trace.steps.length;
    // With a diagram, printed lines appear under it, in step with the code.
    if (printed && !traced) show(state, printed.replace(/\n$/, ''));
    if (value !== undefined && value !== null && !traced) show(state, value, 'py-value');
    if (failure) show(state, failure, 'py-error');
    // What the cell printed, as plain text, so a lab can send it to the grader.
    state.text = (printed + (failure || value || '')).trim();
    if (state.viz) {
      vizShow(state.viz, trace, state.area.value, watched ? state.after || 'end' : 'auto');
      if (watched) state.after = null;
    }
    var figures = py.globals.get('_grab_figures')();
    figures.toJs().forEach(function (png) {
      var img = document.createElement('img');
      img.src = 'data:image/png;base64,' + png;
      img.alt = 'Plot produced by this cell';
      state.out.appendChild(img);
      state.out.hidden = false;
    });
    figures.destroy();
    if (ok && state.check) {
      printed = '';
      var hint = await py.globals.get('_run_check')(state.check);
      if (hint === undefined || hint === null) show(state, '✓ Correct', 'py-pass');
      // An unfinished answer or a Python error is said straight away. Anything that says what's off waits
      // behind Hint, the same as in a lab, so the reader gets a go at working it out first.
      else if (/(Replace (the|each) \.\.\.|in place of the \.\.\.)/.test(hint) || /^\w+(Error|Exception): /.test(hint)) show(state, hint, 'py-hint');
      else {
        show(state, 'Not yet', 'py-hint');
        offerHint(state, hint);
      }
    }
    state.ran = ok;
    state.cell.classList.remove('py-busy');
    return ok;
  }

  // Running a cell first runs any earlier cells that haven't run yet, like Run All Above.
  // Returns whether the cell itself ran without an error, or null if it never got to run.
  async function runUpTo(target) {
    var busy = cells.some(function (c) { return c.cell.classList.contains('py-busy'); });
    if (busy) return null;
    var py;
    try {
      if (!ready) {
        target.out.replaceChildren();
        show(target, 'Loading Python…', 'py-status');
      }
      py = await python();
    } catch (err) {
      target.out.replaceChildren();
      show(target, String(err.message || err), 'py-error');
      return null;
    }
    for (var i = 0; i < cells.length; i++) {
      var c = cells[i];
      if (c === target) break;
      if (!c.ran && !c.skip && !(await execute(py, c))) {
        target.out.replaceChildren();
        show(target, 'Stopped at an earlier cell that raised an error.', 'py-error');
        c.cell.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return null;
      }
    }
    return execute(py, target, true);
  }

  // Run the reader's lab code and the reference, then ask the grader whether the code does what the lab asks.
  // A lab that raises an error still gets checked, so the reader hears why.
  async function gradeLab(state) {
    if ((await runUpTo(state)) === null) return;
    var py = await python();
    var shown = Array.prototype.slice.call(state.out.childNodes);
    show(state, 'Checking…', 'py-status');
    state.cell.classList.add('py-busy');
    var result;
    try {
      var reference = await py.globals.get('_run_isolated')(state.solution);
      var res = await fetch(GRADER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: state.task, requirements: state.rubric, code: state.area.value,
          output: state.text, reference: state.solution, reference_output: reference
        })
      });
      result = await res.json();
    } catch (err) {
      result = { error: 'Checking isn\'t available right now.' };
    }
    state.out.replaceChildren.apply(state.out, shown);
    if (result.error) {
      show(state, result.error, 'py-error');
    } else if (result.verdict === 'correct') {
      show(state, '✓ Correct', 'py-pass');
      show(state, result.feedback, 'py-feedback');
    } else {
      // A wrong answer only says so. The grader's explanation waits behind a button, for when the reader wants it.
      show(state, 'Not yet', 'py-hint');
      offerHint(state, result.feedback);
    }
    state.cell.classList.remove('py-busy');
  }

  // A trace exercise, <pre class="py-trace">, lists calls to work out by hand for the code cell above it, one per
  // line. The reader writes a trace under each call. Check runs the calls for the true results and sends them with
  // the trace to the grader, which decides whether the trace reaches them by the right steps. It's followed by
  // <pre class="py-solution"> (a model trace) and <pre class="py-rubric"> (what a good trace shows), and its task is
  // the paragraph right above it.
  function buildTrace(pre) {
    var calls = code(pre).split('\n').filter(function (l) { return l.trim(); });
    var solution = null;
    var rubric = null;
    var next = pre.nextElementSibling;
    while (next && next.matches('pre.py-solution, pre.py-rubric')) {
      var after = next.nextElementSibling;
      if (next.matches('.py-rubric')) rubric = code(next);
      else solution = code(next);
      next.remove();
      next = after;
    }
    var above = pre.previousElementSibling;
    var task = above && above.tagName === 'P' ? above.textContent.trim() : '';
    var target = cells[cells.length - 1];
    var template = calls.join('\n\n\n') + '\n\n';

    var cell = document.createElement('div');
    cell.className = 'py-cell py-exercise py-trace';
    var area = document.createElement('textarea');
    area.className = 'py-code';
    area.value = template;
    area.spellcheck = false;
    area.setAttribute('aria-label', 'Your trace');
    var bar = document.createElement('div');
    bar.className = 'py-bar';
    var grade = button('py-grade', null, 'Check');
    bar.appendChild(grade);
    if (solution) {
      var reveal = button('py-solve', 'Show solution');
      reveal.addEventListener('click', function () { area.value = solution; fit(area); });
      bar.appendChild(reveal);
    }
    var reset = button('py-reset', 'Reset');
    bar.appendChild(reset);
    var out = document.createElement('div');
    out.className = 'py-out';
    out.hidden = true;
    cell.appendChild(area);
    cell.appendChild(bar);
    cell.appendChild(out);
    pre.replaceWith(cell);

    var state = { cell: cell, area: area, out: out, ran: true, text: '', skip: true, trace: true };
    cells.push(state);
    var check = function () { gradeTrace(state, target, calls, task, solution || '', rubric || ''); };
    grade.addEventListener('click', check);
    reset.addEventListener('click', function () { area.value = template; fit(area); });
    area.addEventListener('input', function () { fit(area); });
    area.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.shiftKey || e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        check();
      }
    });
    fit(area);
  }

  // Make sure the traced code has run, work out the true results of the calls, and ask the grader about the trace.
  async function gradeTrace(state, target, calls, task, solution, rubric) {
    if (state.cell.classList.contains('py-busy')) return;
    state.out.replaceChildren();
    if (!target.ran && (await runUpTo(target)) === null) {
      show(state, 'The code above needs to run first, and it stopped with an error.', 'py-error');
      return;
    }
    var py = await python();
    show(state, 'Checking…', 'py-status');
    state.cell.classList.add('py-busy');
    var result;
    try {
      var src = calls.map(function (c) { return 'print(' + JSON.stringify(c) + ', "->", repr(' + c + '))'; }).join('\n');
      var truth = await py.globals.get('_run_isolated')(src);
      var res = await fetch(GRADER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'trace', task: task, requirements: rubric, code: target.area.value,
          calls: calls.join('\n'), truth: truth, reference: solution, answer: state.area.value
        })
      });
      result = await res.json();
    } catch (err) {
      result = { error: 'Checking isn\'t available right now.' };
    }
    state.out.replaceChildren();
    if (result.error) {
      show(state, result.error, 'py-error');
    } else if (result.verdict === 'correct') {
      show(state, '✓ Correct', 'py-pass');
      show(state, result.feedback, 'py-feedback');
    } else {
      show(state, 'Not yet', 'py-hint');
      offerHint(state, result.feedback);
    }
    state.cell.classList.remove('py-busy');
  }

  // A Hint button that swaps itself for the hint when clicked.
  function offerHint(state, text) {
    var ask = button('py-ask', null, 'Hint');
    ask.addEventListener('click', function () {
      ask.remove();
      show(state, text, 'py-feedback');
    });
    state.out.appendChild(ask);
  }

  // Diagrams under cells, played like a debugger. Each step is a line as it runs, lit up in the code, with
  // what the watched names hold once it has run and whatever has been printed by then. Run just runs the
  // cell and shows where it ended. Play steps through it on its own, Pause stops it, the arrows go one line
  // back or forward, and the bar under the code scrubs through every step.
  // Stepping redraws the diagram in place: items that stay glide to their new spot (arcing past each other
  // when a list is reordered), new ones rise in, removed ones drop away while their neighbours close the gap,
  // and a changed value rolls over like a counter and glows.
  // A concept cell (data-show on a demo) plays on a loop whenever it's on screen, from a trace built ahead of
  // time, so it moves before Python has loaded. Pausing it stops the loop for good. Labs and exercises watch
  // whatever the reader's code assigns, and play only when asked.
  var STEP_MS = 1300;
  var HOLD_MS = 2600;
  var EASE = 'cubic-bezier(.22, .8, .25, 1)';
  var SPRING = 'cubic-bezier(.2, 1.3, .4, 1)';
  var pace = 1;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var onScreen = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target.viz;
      v.visible = e.isIntersecting;
      if (!v.visible) {
        if (v.playing) vizPause(v);
      } else if (!v.held && !v.playing && v.steps.length > 1) {
        vizPlayFrom(v, 0);
      }
    });
  }, { threshold: 0.35 }) : null;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // Animation length, shortened when a long trace plays fast.
  function ms(base) {
    return Math.max(120, base * pace);
  }

  function vizBuild(state, names, concept) {
    var box = el('div', 'viz');
    box.hidden = true;
    var scrub = el('input', 'viz-scrub');
    scrub.type = 'range';
    scrub.min = 0;
    scrub.max = 0;
    scrub.value = 0;
    scrub.setAttribute('aria-label', 'Step');
    var stage = el('div', 'viz-stage');
    box.append(scrub, stage);
    // What the code prints goes in the cell's usual output area, looking just as it does after Run, and fills
    // in step by step. The diagram above it shows the values.
    var printed = el('pre');
    var valueLine = el('pre', 'py-value');
    var mark = el('div', 'viz-mark');
    state.cell.insertBefore(mark, state.area);
    state.cell.insertBefore(box, state.out);
    var play = button('py-play', null, 'Play');
    var back = button('py-back', 'Step back');
    var fwd = button('py-fwd', 'Step forward');
    var v = {
      names: names, loop: concept, box: box, stage: stage, printed: printed, valueLine: valueLine,
      outBox: state.out, scrub: scrub, mark: mark,
      area: state.area, play: play, back: back, fwd: fwd, controls: [play, back, fwd],
      steps: [], spans: {}, out: '', value: null, error: null, source: '', shown: '', i: 0, timer: null,
      playing: false, held: false, visible: !onScreen
    };
    play.addEventListener('click', function () {
      if (v.playing) {
        v.held = true;
        vizPause(v);
      } else if (stale(v)) {
        state.after = 'play';
        runUpTo(state);
      } else {
        v.held = false;
        vizPlayFrom(v, v.i >= v.steps.length - 1 ? 0 : v.i);
      }
    });
    function step(d) {
      v.held = true;
      vizPause(v);
      if (stale(v)) {
        state.after = 'first';
        runUpTo(state);
      } else {
        vizGo(v, v.i + d, true);
      }
    }
    back.addEventListener('click', function () { step(-1); });
    fwd.addEventListener('click', function () { step(1); });
    scrub.addEventListener('input', function () {
      v.held = true;
      vizPause(v);
      var to = Number(scrub.value);
      vizGo(v, to, Math.abs(to - v.i) === 1);
    });
    // Once the code changes, the trace no longer matches it, so the line marker goes until it runs again.
    state.area.addEventListener('input', function () {
      vizPause(v);
      vizMark(v, null);
    });
    box.viz = v;
    if (concept && onScreen) onScreen.observe(box);
    vizButtons(v);
    return v;
  }

  function stale(v) {
    return !v.steps.length || v.area.value !== v.source;
  }

  function vizButtons(v) {
    v.play.textContent = v.playing ? 'Pause' : 'Play';
    v.play.classList.toggle('is-playing', v.playing);
    v.back.disabled = !v.steps.length || v.i === 0;
    v.fwd.disabled = !stale(v) && v.i >= v.steps.length - 1;
  }

  // Show a trace. how is 'end' to jump to where it finished, 'play' to play it from the top, 'first' to stop
  // on its first line, and 'auto' to loop a concept cell that's on screen and otherwise show the end.
  // The diagram and the output keep the size of the finished run, so the page doesn't jump about.
  function vizShow(v, trace, source, how) {
    vizPause(v);
    v.steps = trace.steps || [];
    v.out = trace.out || '';
    v.value = trace.value === undefined ? null : trace.value;
    v.spans = trace.spans || {};
    v.error = trace.error || null;
    v.source = source;
    v.box.hidden = !v.steps.length;
    v.scrub.max = Math.max(0, v.steps.length - 1);
    v.scrub.hidden = v.steps.length < 2;
    // With nothing to draw, say only DataFrames, the stepping and the output are still worth having.
    v.stage.hidden = v.steps.every(function (s) { return !s[1].length; });
    v.stage.replaceChildren();
    v.stage.style.minHeight = '';
    v.printed.style.minHeight = '';
    v.shown = null;
    v.printed.remove();
    v.valueLine.remove();
    if (!v.steps.length) {
      vizMark(v, null);
      vizButtons(v);
      return;
    }
    // The printed lines and the value lead the output area, ahead of any error, plot or check result.
    if (v.out) v.outBox.insertBefore(v.printed, v.outBox.firstChild);
    if (v.value !== null) v.outBox.insertBefore(v.valueLine, v.out ? v.printed.nextSibling : v.outBox.firstChild);
    if (v.out || v.value !== null) v.outBox.hidden = false;
    pace = 1;
    vizGo(v, v.steps.length - 1, false);
    v.stage.style.minHeight = v.stage.offsetHeight + 'px';
    v.printed.style.minHeight = v.printed.offsetHeight + 'px';
    if (how === 'first') vizGo(v, 0, false);
    else if (still || how === 'end') vizButtons(v);
    else if (how === 'play' || (v.loop && v.visible && !v.held)) vizPlayFrom(v, 0);
  }

  function vizPause(v) {
    clearTimeout(v.timer);
    v.timer = null;
    v.playing = false;
    vizButtons(v);
  }

  // Play from step i to the end, one step at a time. A long run steps faster, though never in a blur.
  // A concept cell then holds the end, fades, and goes round again.
  function vizPlayFrom(v, i) {
    vizPause(v);
    v.playing = true;
    vizButtons(v);
    var wait = Math.max(420, Math.min(STEP_MS, 30000 / v.steps.length));
    function tick() {
      if (v.i >= v.steps.length - 1) {
        if (v.loop && !v.held) {
          v.timer = setTimeout(restart, HOLD_MS);
        } else {
          v.playing = false;
          vizButtons(v);
        }
        return;
      }
      pace = wait / STEP_MS;
      vizGo(v, v.i + 1, true);
      v.timer = setTimeout(tick, wait);
    }
    function begin() {
      v.stage.replaceChildren();
      vizGo(v, 0, false);
      v.stage.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: 'ease-out' });
      v.timer = setTimeout(tick, wait);
    }
    // Going round again fades the finished picture out first, rather than blanking it.
    function restart() {
      v.stage.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 380, easing: 'ease-in', fill: 'forwards' })
        .onfinish = function (e) {
          e.target.cancel();
          if (v.playing) begin();
        };
    }
    if (i === 0) begin();
    else v.timer = setTimeout(tick, 0);
  }

  function vizGo(v, i, animate) {
    if (!v.steps.length) return;
    v.i = Math.max(0, Math.min(v.steps.length - 1, i));
    var step = v.steps[v.i];
    var end = v.i === v.steps.length - 1;
    vizMark(v, end && v.error ? v.error : step[0], end && v.error);
    vizDraw(v.stage, step[1], animate && !still);
    vizPrinted(v, v.out.slice(0, step[2]), end, animate && !still);
    v.scrub.value = v.i;
    v.scrub.style.setProperty('--done', (v.steps.length > 1 ? v.i / (v.steps.length - 1) * 100 : 100) + '%');
    vizButtons(v);
  }

  // The output so far: whatever has been printed, and once the code has finished, the value of its last
  // line, the same as Run shows. Going forward, new output fades in under the old. Printed text stays plain
  // inline text, so its own line breaks lay it out exactly as Python printed it. Until the end the value line
  // keeps its place but stays invisible, so nothing below it moves when it appears.
  function vizPrinted(v, text, end, animate) {
    if (text !== v.shown) {
      if (animate && v.shown !== null && text.indexOf(v.shown) === 0) {
        var added = el('span', 'viz-new', text.slice(v.shown.length));
        v.printed.appendChild(added);
        added.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms(600), easing: EASE });
      } else {
        v.printed.textContent = text;
      }
      v.shown = text;
    }
    if (v.value === null) return;
    v.valueLine.textContent = v.value;
    var showing = v.valueLine.style.visibility !== 'hidden';
    v.valueLine.style.visibility = end ? '' : 'hidden';
    if (end && !showing && animate) {
      v.valueLine.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms(600), easing: EASE });
    }
  }

  // Light up the line that's running, behind the code, gliding from line to line. A line that raised an error
  // turns red. It stays off once the reader has changed the code, since the line numbers no longer match.
  function vizMark(v, line, failed) {
    var mark = v.mark;
    mark.classList.toggle('viz-failed', !!failed);
    if (!line || v.area.value !== v.source) {
      mark.style.opacity = 0;
      return;
    }
    var css = getComputedStyle(v.area);
    var height = parseFloat(css.lineHeight);
    // Coming back from hidden, it appears on its line rather than gliding there from wherever it was.
    var jump = mark.style.opacity !== '1';
    if (jump) mark.style.transition = 'opacity 0.35s';
    var last = v.spans[line] || line;
    mark.style.top = v.area.offsetTop + parseFloat(css.paddingTop) + (line - 1) * height + 'px';
    mark.style.height = (last - line + 1) * height + 'px';
    if (jump) {
      void mark.offsetWidth;
      mark.style.transition = '';
    }
    mark.style.opacity = 1;
  }

  // Names bound to the same list, dict or object share one row, so b = a shows as two labels on one list.
  function vizDraw(stage, vars, animate) {
    var rows = [];
    var byKey = {};
    vars.forEach(function (pair) {
      var spec = pair[1];
      var key = spec.id !== undefined ? 'id' + spec.id : 'name' + pair[0];
      if (!byKey[key]) rows.push(byKey[key] = { key: key, names: [], spec: spec });
      if (byKey[key].names.indexOf(pair[0]) === -1) byKey[key].names.push(pair[0]);
    });
    reconcile(stage, rows.map(function (r) {
      return {
        key: r.key,
        build: function () {
          var row = el('div', 'viz-row');
          row.append(el('div', 'viz-names'), el('div', 'viz-val'));
          return row;
        },
        update: function (row, fresh, anim) {
          // A result is labelled with its expression, in a dashed chip, so it doesn't read as a name.
          var cls = r.spec.expr ? 'viz-name viz-expr' : 'viz-name';
          reconcile(row.firstChild, r.names.map(function (n) {
            return { key: n, build: function () { return el('span', cls, n); }, update: function () {} };
          }), anim && !fresh);
          drawValue(row.lastChild, r.spec, anim && !fresh);
        }
      };
    }), animate);
    align(stage);
  }

  // Line things up so position i sits under position i. The labels share one width, so every value starts
  // in the same column, and rows of the same length share their box widths.
  function align(stage) {
    var rows = Array.prototype.filter.call(stage.children, function (r) { return r.dataset.key !== undefined; });
    rows.forEach(function (r) { r.firstChild.style.minWidth = ''; });
    var widest = Math.max.apply(null, [0].concat(rows.map(function (r) { return r.firstChild.offsetWidth; })));
    rows.forEach(function (r) { r.firstChild.style.minWidth = widest + 'px'; });
    var byLength = {};
    rows.forEach(function (r) {
      var shape = r.lastChild.firstChild;
      if (!shape || !/^(list|tuple|str|array)$/.test(shape.dataset.kind) || shape.style.gridTemplateColumns) return;
      var boxes = Array.prototype.map.call(shape.querySelectorAll(':scope > .viz-cell[data-key] > .viz-v'), function (b) {
        b.style.minWidth = '';
        return b;
      });
      (byLength[boxes.length] = byLength[boxes.length] || []).push(boxes);
    });
    Object.keys(byLength).forEach(function (n) {
      var group = byLength[n];
      if (group.length < 2) return;
      for (var i = 0; i < n; i++) {
        var w = Math.max.apply(null, group.map(function (boxes) { return boxes[i].offsetWidth; }));
        group.forEach(function (boxes) { boxes[i].style.minWidth = w + 'px'; });
      }
    });
  }

  // Web Animations rather than CSS classes, so nothing is left half drawn if an animation gets cut short.
  function rise(e) {
    e.animate([
      { opacity: 0, transform: 'translateY(12px) scale(0.7)' },
      { opacity: 1, transform: 'none' }
    ], { duration: ms(640), easing: SPRING });
  }

  function glow(box) {
    var warm = getComputedStyle(box).getPropertyValue('--c-warm').trim() || '#e8873a';
    box.animate([
      { borderColor: warm, boxShadow: '0 0 0 0 transparent' },
      { borderColor: warm, boxShadow: '0 0 0 4px ' + warm + '55', offset: 0.3 },
      { borderColor: warm, boxShadow: '0 0 0 4px ' + warm + '33', offset: 0.6 },
      { boxShadow: '0 0 0 0 transparent' }
    ], { duration: ms(1500), easing: 'ease-out' });
  }

  // Put text in a box. When it changes, the old text rolls up and out while the new text rolls in from below,
  // and the box glows if hot is set. Returns whether the text changed.
  function setText(box, text, anim, hot) {
    if (box.dataset.v === text) return false;
    var had = box.dataset.v !== undefined;
    box.dataset.v = text;
    box.classList.toggle('viz-true', text === 'True');
    box.classList.toggle('viz-false', text === 'False');
    var now = el('span', 'viz-t', text);
    var prior = box.querySelector(':scope > .viz-t:not(.viz-gone)');
    if (!had || !anim || !prior) {
      box.replaceChildren(now);
      return had;
    }
    prior.classList.add('viz-gone');
    box.appendChild(now);
    var out = prior.animate([
      { transform: 'none', opacity: 1 },
      { transform: 'translateY(-85%)', opacity: 0 }
    ], { duration: ms(560), easing: EASE, fill: 'forwards' });
    out.onfinish = function () { prior.remove(); };
    now.animate([
      { transform: 'translateY(85%)', opacity: 0 },
      { transform: 'none', opacity: 1 }
    ], { duration: ms(560), easing: EASE });
    if (hot) glow(box);
    return true;
  }

  // One box per item. With an index the box shows its position underneath, the way a list or string counts.
  function cellItems(items, keys, showIndex) {
    return items.map(function (text, i) {
      return {
        key: keys[i],
        build: function () {
          var c = el('span', 'viz-cell');
          c.append(el('span', 'viz-v'), el('span', 'viz-i'));
          return c;
        },
        update: function (c, fresh, anim) {
          setText(c.firstChild, text, anim && !fresh, true);
          // Positions belong to the slots, not the values, so they stay put while boxes move over them.
          setText(c.lastChild, showIndex ? String(i) : '', false, false);
        }
      };
    });
  }

  // List items are keyed by value, counting repeats, so a sort moves the boxes rather than relabelling them.
  function valueKeys(items) {
    var seen = {};
    return items.map(function (r) {
      seen[r] = (seen[r] || 0) + 1;
      return r + '#' + seen[r];
    });
  }

  function positionKeys(items) {
    return items.map(function (_, i) { return String(i); });
  }

  function more(items, count) {
    if (!count) return items;
    return items.concat([{ key: 'more', build: function () { return el('span', 'viz-more', '…'); }, update: function () {} }]);
  }

  function drawValue(holder, spec, anim) {
    var shape = holder.firstChild;
    if (!shape || shape.dataset.kind !== spec.k) {
      holder.replaceChildren();
      shape = el('div', 'viz-' + spec.k);
      shape.dataset.kind = spec.k;
      holder.appendChild(shape);
      if (anim) rise(shape);
      anim = false;
    }
    if (spec.k === 'atom') {
      setText(shape, spec.r, anim, true);
    } else if (spec.k === 'str') {
      reconcile(shape, cellItems(spec.items, positionKeys(spec.items), true), anim);
    } else if (spec.k === 'list' || spec.k === 'tuple') {
      reconcile(shape, more(cellItems(spec.items, valueKeys(spec.items), true), spec.more), anim);
    } else if (spec.k === 'set') {
      reconcile(shape, cellItems(spec.items, valueKeys(spec.items), false), anim);
    } else if (spec.k === 'array' && spec.nd === 1) {
      reconcile(shape, more(cellItems(spec.items, positionKeys(spec.items), true), spec.more), anim);
    } else if (spec.k === 'array') {
      var cols = spec.items.length ? spec.items[0].length : 0;
      shape.style.gridTemplateColumns = 'repeat(' + cols + ', auto)';
      var flat = [].concat.apply([], spec.items);
      var keys = flat.map(function (_, i) { return Math.floor(i / cols) + ',' + (i % cols); });
      reconcile(shape, cellItems(flat, keys, false), anim);
    } else if (spec.k === 'dict') {
      reconcile(shape, spec.items.map(function (kv) {
        return {
          key: kv[0],
          build: function () {
            var row = el('div', 'viz-pair');
            row.append(el('span', 'viz-cell viz-key', kv[0]), el('span', 'viz-cell'));
            return row;
          },
          update: function (row, fresh, a) { setText(row.lastChild, kv[1], a && !fresh, true); }
        };
      }), anim);
    } else if (spec.k === 'obj') {
      if (!shape.firstChild) shape.append(el('div', 'viz-cls'), el('div', 'viz-attrs'));
      shape.firstChild.textContent = spec.cls;
      reconcile(shape.lastChild, spec.attrs.map(function (pair) {
        return {
          key: pair[0],
          build: function () {
            var row = el('div', 'viz-attr');
            row.append(el('span', 'viz-attr-name', pair[0]), el('div', 'viz-val'));
            return row;
          },
          update: function (row, fresh, a) { drawValue(row.lastChild, pair[1], a && !fresh); }
        };
      }), anim);
    }
  }

  // Bring parent's keyed children in line with items, animating the difference when asked.
  function reconcile(parent, items, anim) {
    var old = {};
    Array.prototype.forEach.call(parent.children, function (c) {
      if (c.dataset.key !== undefined) old[c.dataset.key] = c;
    });
    var before = {};
    var box = anim ? parent.getBoundingClientRect() : null;
    if (anim) Object.keys(old).forEach(function (k) { before[k] = old[k].getBoundingClientRect(); });
    var used = {};
    var prev = null;
    var placed = items.map(function (it) {
      var c = old[it.key];
      var fresh = !c;
      if (fresh) {
        c = it.build();
        c.dataset.key = it.key;
      }
      used[it.key] = true;
      // Only move what is out of place, since moving an element restarts its animations.
      var spot = prev ? prev.nextSibling : parent.firstChild;
      if (c !== spot) parent.insertBefore(c, spot);
      prev = c;
      it.update(c, fresh, anim);
      return { c: c, fresh: fresh, key: it.key };
    });
    Object.keys(old).forEach(function (k) {
      if (used[k]) return;
      var c = old[k];
      if (!anim) {
        c.remove();
        return;
      }
      // Leave a copy where the item was, dropping away while its neighbours close the gap.
      delete c.dataset.key;
      c.classList.add('viz-ghost');
      c.style.left = before[k].left - box.left - parent.clientLeft + 'px';
      c.style.top = before[k].top - box.top - parent.clientTop + 'px';
      c.style.width = before[k].width + 'px';
      c.animate([
        { opacity: 1, transform: 'none' },
        { opacity: 0, transform: 'translateY(14px) scale(0.8)' }
      ], { duration: ms(600), easing: EASE, fill: 'forwards' }).onfinish = function () { c.remove(); };
    });
    if (!anim) return;
    // Arcs are only for a pure reorder, like a sort. Closing a gap or making room is a straight slide.
    var reorder = placed.every(function (p) { return !p.fresh; }) && Object.keys(old).every(function (k) { return used[k]; });
    placed.forEach(function (p) {
      if (p.fresh) {
        rise(p.c);
        return;
      }
      var a = before[p.key];
      var b = p.c.getBoundingClientRect();
      var dx = a.left - b.left;
      var dy = a.top - b.top;
      if (Math.abs(dx) + Math.abs(dy) < 0.5) return;
      // Boxes moving right arc over, boxes moving left arc under, so a reordering never runs them into each other.
      var arc = reorder && Math.abs(dy) < 2 ? Math.min(18, Math.abs(dx) / 5) * (dx < 0 ? -1 : 1) : 0;
      p.c.style.zIndex = dx < 0 ? 2 : 1;
      var timing = { duration: ms(820), easing: 'cubic-bezier(.45, 0, .25, 1)' };
      p.c.animate([
        { transform: 'translate(' + dx + 'px, ' + dy + 'px)' },
        { transform: 'translate(' + dx / 2 + 'px, ' + (dy / 2 + arc) + 'px)', offset: 0.5 },
        { transform: 'none' }
      ], timing).onfinish = function () { p.c.style.zIndex = ''; };
      // The position number underneath moves the opposite way, so it holds still under the moving box.
      var index = p.c.querySelector(':scope > .viz-i');
      if (index && index.textContent) {
        index.animate([
          { transform: 'translate(' + -dx + 'px, ' + -dy + 'px)' },
          { transform: 'translate(' + -dx / 2 + 'px, ' + -(dy / 2 + arc) + 'px)', offset: 0.5 },
          { transform: 'none' }
        ], timing);
      }
    });
  }

  // Traces for the concept cells, built ahead of time by build_traces.py and keyed by each cell's code.
  var tracesUrl = document.currentScript && document.currentScript.getAttribute('data-traces');

  document.querySelectorAll('pre.py, pre.py-trace').forEach(function (pre) {
    if (pre.classList.contains('py-trace')) buildTrace(pre);
    else build(pre);
  });

  if (tracesUrl) {
    fetch(tracesUrl).then(function (res) { return res.ok ? res.json() : {}; }).then(function (traces) {
      cells.forEach(function (c) {
        var trace = c.viz && c.viz.loop && !c.viz.steps.length && traces[c.area.value];
        if (trace) vizShow(c.viz, trace, c.area.value, 'auto');
      });
    }).catch(function () {});
  }
})();
