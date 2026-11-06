---
layout: page
title: "Imitation Learning"
permalink: /course/lecture-1/imitation/
---

<link rel="stylesheet" href="/course/assets/course.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">

Everything so far needed a reward. Sometimes writing one down is the hard part. How would you score good driving, one step at a time? An expert driver can't easily write that number down either, but they can just drive, and you can record what they do. Imitation learning learns a policy by copying an expert like that. It needs no reward at all, only examples.

Here's the grid one more time. The good policy from before is now our expert.

<pre class="py">
import random
FORBIDDEN = [6, 7]
TARGET = 9
states = list(range(1, 10))
actions = ["up", "right", "down", "left", "stay"]
MOVES = {"up": (-1, 0), "right": (0, 1), "down": (1, 0), "left": (0, -1), "stay": (0, 0)}

def try_move(s, a):
    row = (s - 1) // 3 + MOVES[a][0]
    col = (s - 1) % 3 + MOVES[a][1]
    if row &lt; 0 or row > 2 or col &lt; 0 or col > 2:
        return None
    return row * 3 + col + 1

def next_state(s, a):
    s_next = try_move(s, a)
    if s_next is None:
        return s
    return s_next

def reward(s, a):
    s_next = try_move(s, a)
    if s_next is None or s_next in FORBIDDEN:
        return -1
    if s_next == TARGET:
        return 1
    return 0

expert = {1: "right", 2: "down", 3: "left", 4: "right", 5: "down", 6: "down", 7: "right", 8: "right", 9: "stay"}
</pre>

## Demonstrations

A demonstration is just a recording of the expert at work, every state it was in and the action it took there. Self-driving companies record human drivers, the camera images together with the steering. Here we let our expert walk from <span class="m">s\_1</span> for five steps.

<pre class="py" data-show="demos">
def demonstrate(expert, start, steps):
    data = []
    s = start
    for t in range(steps):
        a = expert[s]
        data.append((s, a))
        s = next_state(s, a)
    return data

demos = demonstrate(expert, 1, 5)
</pre>

Notice what's missing. The expert never needed to visit <span class="m">s\_3</span>, <span class="m">s\_4</span>, <span class="m">s\_6</span> or <span class="m">s\_7</span>, so we have no idea what it would do there. Hold on to that, it matters a lot later.

## Copying by counting

The simplest way to copy is to count. For every state, count how often the expert took each action.

<pre class="py" data-show="counts">
counts = {}
for s, a in demos:
    if s not in counts:
        counts[s] = {}
    if a not in counts[s]:
        counts[s][a] = 0
    counts[s][a] += 1
</pre>

Then, in each state, take the action the expert took most often. That's called behavior cloning, and it's the whole of it. A state the copy has never seen gets no entry, so there it just stands still.

<pre class="py">
def clone(data):
    counts = {}
    for s, a in data:
        if s not in counts:
            counts[s] = {}
        if a not in counts[s]:
            counts[s][a] = 0
        counts[s][a] += 1
    copy = {}
    for s in counts:
        copy[s] = max(counts[s], key=lambda a: counts[s][a])
    return copy

def act(copy, s):
    if s in copy:
        return copy[s]
    return "stay"

copy = clone(demos)
copy
</pre>

Let both of them play from <span class="m">s\_1</span>. `play` returns the discounted return over 50 steps, and its `slip` is the chance that a step goes wrong and a random action happens instead, like a hand slipping on the wheel. Leave it at 0 for now.

<pre class="py">
def play(policy, s, slip, steps=50, gamma=0.9):
    G, weight = 0, 1
    for t in range(steps):
        a = act(policy, s)
        if random.random() &lt; slip:
            a = random.choice(actions)
        G += weight * reward(s, a)
        weight *= gamma
        s = next_state(s, a)
    return G

print(round(play(expert, 1, 0), 2))
print(round(play(copy, 1, 0), 2))
</pre>

A perfect copy, from five examples. And in robotics this is no toy. Many of today's robot arms and self-driving systems start out exactly like this, by copying recordings of people.

## When experts disagree

Real demonstrations come from lots of people, and people don't agree. Say half your drivers pass a tree on the left and half on the right. Store their steering angles, negative for left, and copy them by averaging, the most obvious thing to try.

<pre class="py">
steering = [-31, -29, -30, 30, 28, 32]
sum(steering) / len(steering)
</pre>

An average of 0 means straight ahead, right into the tree. Both groups of drivers were fine, and their average is a crash. The fix is to copy the whole spread of what the experts did, not one number. With a handful of actions that's easy, we just keep the counts as probabilities. Here are two experts who disagree only in <span class="m">s\_1</span>, where the second one goes down and around instead.

<pre class="py">
around = dict(expert)
around[1] = "down"
mixed = demonstrate(expert, 1, 5) + demonstrate(around, 1, 5)
mixed[:6]
</pre>

Write `clone_probs(data)`, which returns, for each state, a dictionary from each action to the fraction of times the experts took it there. So from `mixed` you should get `{"right": 0.5, "down": 0.5}` for state 1, which is the policy <span class="m">\pi(a \mid s)</span> written straight from the data.

<pre class="py" data-skip="true">
def clone_probs(data):
    ...  # your code here
clone_probs(mixed)
</pre>
<pre class="py-check">
probs = clone_probs(mixed)
assert set(probs[1]) == {"right", "down"}, f"In state 1 the experts went right and down, but you have {probs[1]}."
assert abs(probs[1]["right"] - 0.5) &lt; 1e-9 and abs(probs[1]["down"] - 0.5) &lt; 1e-9, "Each of right and down was taken half the time in state 1."
assert probs[2] == {"down": 1.0}, f"In state 2 the experts always went down, so it should be {{'down': 1.0}}, not {probs[2]}."
assert all(abs(sum(p.values()) - 1) &lt; 1e-9 for p in probs.values()), "The fractions for each state should add up to 1."
</pre>
<pre class="py-solution">
def clone_probs(data):
    counts = {}
    for s, a in data:
        if s not in counts:
            counts[s] = {}
        if a not in counts[s]:
            counts[s][a] = 0
        counts[s][a] += 1
    probs = {}
    for s in counts:
        total = sum(counts[s].values())
        probs[s] = {}
        for a in counts[s]:
            probs[s][a] = counts[s][a] / total
    return probs
clone_probs(mixed)
</pre>

A copy that samples from these probabilities goes right half the time and down the other half, and never tries some average of the two. Both are fine ways around.

<details class="aside" markdown="1">
<summary>What real systems do</summary>

Steering is a smooth number, not one of five moves, so you can't keep a count for every possible angle. Real systems learn a model that can still produce more than one good answer for the same situation. Some describe the actions as a mix of a few bumps, some chop the angle into small bins and predict which bin, and many recent robots use diffusion, the same idea behind image generators, to draw an action rather than a picture. We'll meet these models once we have neural networks.

</details>

## Small mistakes add up

So far nothing ever went wrong. Now turn the slips on, so that one step in ten goes somewhere random, and compare expert and copy over thousands of runs.

<pre class="py">
random.seed(0)
for slip in [0, 0.1, 0.2]:
    e = sum([play(expert, 1, slip) for i in range(3000)]) / 3000
    c = sum([play(copy, 1, slip) for i in range(3000)]) / 3000
    print(slip, round(e, 2), round(c, 2))
</pre>

The expert copes, and the copy falls apart. When a slip pushes the expert into <span class="m">s\_4</span>, it knows to head right. The copy has never seen <span class="m">s\_4</span>, so it stands there. Worse, a slip into the forbidden <span class="m">s\_7</span> leaves it standing on the penalty, collecting -1 every step.

That's the core problem of imitation learning. In ordinary prediction, a wrong answer doesn't change the next question. Here it does. Every mistake moves the agent somewhere new, often somewhere the expert never went, and there the copy makes more mistakes, which take it further off still. The mistakes compound.

<span class="m d">p\_{\text{expert}}(s) \neq p\_{\text{copy}}(s)</span>

Read it as "the states the expert visits aren't the states the copy visits". The copy learns from the first and gets tested on the second. Stanford calls this covariate shift.

Measure it. Write `time_lost(copy, runs)`, which plays the copy from <span class="m">s\_1</span> with `slip=0.1` for 50 steps, `runs` times, and returns the fraction of all steps it spent in states it has never seen. You'll need your own loop, since `play` doesn't keep track of the states.

<pre class="py" data-skip="true">
def time_lost(copy, runs):
    ...  # your code here
random.seed(0)
time_lost(copy, 1000)
</pre>
<pre class="py-check">
random.seed(1)
lost = time_lost(copy, 1000)
assert 0.15 &lt; lost &lt; 0.35, f"Got {lost}. Count the steps where the state isn't in the copy, and divide by all steps, which is 50 times the number of runs."
assert time_lost(expert, 50) == 0, "The expert knows every state, so it should lose no time at all."
</pre>
<pre class="py-solution">
def time_lost(copy, runs):
    lost, total = 0, 0
    for i in range(runs):
        s = 1
        for t in range(50):
            if s not in copy:
                lost += 1
            total += 1
            a = act(copy, s)
            if random.random() &lt; 0.1:
                a = random.choice(actions)
            s = next_state(s, a)
    return lost / total
random.seed(0)
time_lost(copy, 1000)
</pre>

A quarter of its time, in states it knows nothing about. More demonstrations of the same perfect path won't help, because the expert never goes there. What would help is examples from exactly the places the copy ends up in.

## Asking the expert to correct

That's the idea behind DAgger, short for dataset aggregation. Let the copy drive, and ask the expert what it would have done in every state the copy visits.

1. Clone a policy from the data you have.
2. Let the copy play, and record every state it visits.
3. Ask the expert which action it would take in each of those states.
4. Add those pairs to the data, and go back to step 1.

The copy now gets taught exactly where it actually goes, and its mistakes become the next round's examples.

<!-- lab:dagger -->

Implement DAgger on the grid, starting from `demos`. Run 4 rounds. In each round, clone the data you have and print the copy's average return from <span class="m">s\_1</span> with `slip=0.1` over a few thousand plays. Then let the copy play 10 times with slips, record every state it visits, label each one with the expert's action, and add them to the data. The average should climb toward the expert's.

<pre class="py" data-lab="true">
# your code here
</pre>
<pre class="py-solution">
def visited(copy, s, slip, steps=50):
    seen = []
    for t in range(steps):
        seen.append(s)
        a = act(copy, s)
        if random.random() &lt; slip:
            a = random.choice(actions)
        s = next_state(s, a)
    return seen

random.seed(0)
data = list(demos)
for round_number in range(4):
    copy = clone(data)
    average = sum([play(copy, 1, 0.1) for i in range(3000)]) / 3000
    print(round_number, sorted(copy), round(average, 2))
    for i in range(10):
        for s in visited(copy, 1, 0.1):
            data.append((s, expert[s]))
</pre>
<pre class="py-rubric">
- Starts from the demonstrations and repeats rounds of cloning, playing the copy, and adding new examples.
- The new examples are the states the copy itself visited, labelled with the expert's action in each, not more demonstrations from the expert's own path.
- Uses slips while the copy plays, so it reaches states the expert never visits.
- Prints the copy's average return each round. It should start around 4.2 and rise to around 5.8 after a round or two, close to the expert, at about 5.9. Exact values vary with the random draws.
</pre>

<!-- /lab:dagger -->

Asking the expert about every state can be awkward in practice. Imagine a driving instructor having to say what they'd do at every moment while the learner drives. A more practical version lets the expert simply take over when the copy starts going wrong, and records those corrections. That's called human gated DAgger, and you can try it yourself. Play a few rounds as You, which records every move you make. Then switch to Copycat, which plays the move you made most often in each situation, using the same small view of the board as Learner in the first part. Familiar is how much of its time it spends in situations it has seen you in. When it's about to mess up, grab the arrow keys and steer. Each key you press is a correction it learns from.

<figure class="snake" data-mode="imitate"></figure>

## Where demonstrations come from

Some demonstrations collect themselves. Cars record their drivers, and phones record what people type. For robots it takes more work.

| method | how it works | catch |
|---|---|---|
| remote control | a person steers the robot with a controller | can lag, and some controls are hard to use |
| kinesthetic teaching | a person grabs the robot and moves it by hand | the person shows up in the camera |
| puppeteering | a person moves a second copy of the robot, and the real one follows | needs two of everything |

For some robots, like one with four legs, no person can show it what to do at all. Videos of people and animals are everywhere, but a human hand isn't a robot gripper, and a dog's legs don't move like a robot's. That difference in bodies is called the embodiment gap, and it means such videos can guide a robot but rarely be copied directly.

## Copying versus practicing

Behavior cloning is offline. It only ever uses a fixed set of examples, and never needs the copy to act on its own. DAgger is online. It needs data from the copy itself as it plays.

| | upside | downside |
|---|---|---|
| behavior cloning | simple, safe, needs no reward | may need a huge amount of data, and small mistakes compound |
| DAgger | fixes the states the copy really reaches, with less data | someone has to watch and correct |
| both | | never better than the expert, and can't improve by practicing |

That last row is where reward comes back in. An agent that learns from reward, like Learner in the snake game, can practice on its own and even beat whoever it learned from. Many of today's best systems do both, copying first to get going and then practicing with reward to get better.

<p class="credit">This part follows Lecture 2 of <a href="https://cs224r.stanford.edu/">Stanford CS224R</a> (Spring 2025), using the grid world from Shiyu Zhao's <a href="https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning">Mathematical Foundations of Reinforcement Learning</a>.</p>

<nav class="lesson-nav">
  <a class="prev" href="/course/lecture-1/bellman/">&larr; Values and the Bellman Equation</a>
  <a class="next" href="/course/">Course &rarr;</a>
</nav>

<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script src="/course/assets/math.js"></script>
<script src="/course/assets/snake.js"></script>
<script src="/course/assets/course.js"></script>
<script src="/course/assets/python-cells.js" data-traces="/course/assets/traces/imitation.json"></script>
