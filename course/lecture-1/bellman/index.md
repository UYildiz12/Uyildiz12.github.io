---
layout: page
title: "Values and the Bellman Equation"
permalink: /course/lecture-1/bellman/
---

<link rel="stylesheet" href="/course/assets/course.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">

So far we've judged a policy by what it gets from one starting cell. But the agent could end up anywhere, so a good policy should do well from every cell. In this part every state gets a number that says how good it is to be there, and we'll find a neat trick for working all of those numbers out at once.

Here's the grid again, with both policies from before.

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

def rollout_rewards(policy, s, steps):
    rewards = []
    for t in range(steps):
        a = policy[s]
        rewards.append(reward(s, a))
        s = next_state(s, a)
    return rewards

def discounted_return(rewards, gamma):
    total = 0
    for t, r in enumerate(rewards):
        total += gamma ** t * r
    return total

policy = {1: "right", 2: "down", 3: "left", 4: "right", 5: "down", 6: "down", 7: "right", 8: "right", 9: "stay"}
detour = dict(policy)
detour[1] = "down"
detour[4] = "down"
</pre>

## How good is each cell?

Let's start the first policy from every cell in turn, and work out its discounted return each time.

<pre class="py" data-show="values">
values = {}
for s in states:
    G = discounted_return(rollout_rewards(policy, s, 1000), 0.9)
    values[s] = round(G, 2)
</pre>

Here are the same numbers on the grid. Cells next to the target are worth 10, and the further away a cell is, the less it's worth, because the +1s start later and get discounted more. Click a cell to turn its arrow and the numbers follow, and try the slider too.

<figure class="grid-world" data-mode="values" data-policy="right down left right down down right right stay"></figure>

The number for each cell is called its state value. It's the return the agent can expect if it starts in that state and follows the policy from then on.

<span class="m d">v\_{\pi}(s) = \mathbb{E}[\, G \mid \text{start in } s \,]</span>

Read it as "the value of <span class="m">s</span> under <span class="m">\pi</span> is the expected return, given that the agent starts in <span class="m">s</span>". The little <span class="m">\pi</span> is a reminder that values belong to a policy. Change the policy and the values change, just like they did when you clicked the arrows. Our policies and world don't roll dice yet, so the expected return is simply the one return we computed. Stanford's slides write the same thing as <span class="m">V^{\pi}(s)</span>.

Now do the same for `detour` and store the values in `detour_values`, rounded to 2 decimals like above. Which cells got worse?

<pre class="py" data-skip="true">
detour_values = {}
# your code here
detour_values
</pre>
<pre class="py-check">
assert len(detour_values) == 9, "Give every one of the 9 states a value."
assert abs(detour_values[1] - 6.39) &lt; 0.01, f"From s1 the detour should be worth 6.39, but you have {detour_values[1]}."
assert abs(detour_values[4] - 7.1) &lt; 0.01, f"From s4 the detour should be worth 7.1, but you have {detour_values[4]}."
assert abs(detour_values[9] - 10) &lt; 0.01, "The target is worth 10 under both policies."
</pre>
<pre class="py-solution">
detour_values = {}
for s in states:
    G = discounted_return(rollout_rewards(detour, s, 1000), 0.9)
    detour_values[s] = round(G, 2)
detour_values
</pre>

Only <span class="m">s\_1</span> and <span class="m">s\_4</span> change, the two cells where the policies differ. From everywhere else the two policies walk the same path.

## Values lean on each other

Look at <span class="m">s\_1</span> and <span class="m">s\_2</span>. The policy goes right from <span class="m">s\_1</span> into <span class="m">s\_2</span>, which pays 0. After that, it's exactly as if the agent had started in <span class="m">s\_2</span>, just one step later. So the value of <span class="m">s\_1</span> should be that 0, plus 0.9 times the value of <span class="m">s\_2</span>.

<span class="m d">7.29 = 0 + 0.9 \times 8.1</span>

Let's check that for every cell.

<pre class="py">
for s in states:
    a = policy[s]
    s_next = next_state(s, a)
    print(s, values[s], round(reward(s, a) + 0.9 * values[s_next], 2))
</pre>

The two columns match everywhere. Every value is the reward of one step, plus <span class="m">\gamma</span> times the value of where that step lands. Values are built out of other values, which has a name, bootstrapping.

Why does this work? Write out the discounted return and pull out every <span class="m">\gamma</span> but the first one.

<span class="m d">G = r\_1 + \gamma r\_2 + \gamma^2 r\_3 + \dots = r\_1 + \gamma \, (r\_2 + \gamma r\_3 + \dots)</span>

The part in brackets is just the discounted return from the next state on. So the return is the first reward plus <span class="m">\gamma</span> times the next return, and the same goes for their averages, the values.

## The Bellman equation

That gives one equation for every state.

<span class="m d">v\_{\pi}(s) = r(s, a) + \gamma \, v\_{\pi}(s^{\prime})</span>

Here <span class="m">a</span> is the action the policy picks in <span class="m">s</span>, and <span class="m">s^{\prime}</span> is where it lands. Read it as "the value of a state is the reward you get now, plus <span class="m">\gamma</span> times the value of where you end up". That's the Bellman equation, and it's probably the most important equation in RL.

When the policy rolls dice, nothing really changes. Each action gets its own reward plus discounted value, and we average them by how likely each action is. Take a policy that flips a coin in <span class="m">s\_1</span>, like `coin_policy` from last time. Half the time it goes right into <span class="m">s\_2</span>, worth 8.1, and half the time down into <span class="m">s\_4</span>, worth 7.1 under the coin policy.

<span class="m d">v(s\_1) = 0.5 \times (0 + 0.9 \times 8.1) + 0.5 \times (0 + 0.9 \times 7.1) = 6.84</span>

That's the 6.84 we got last time by averaging thousands of runs, now from one line of arithmetic. If the world rolls dice too, like with wind, we also average over where the agent might land. In general it looks like this.

<span class="m d">v\_{\pi}(s) = \sum\_{a} \pi(a \mid s) \Big[ r(s, a) + \gamma \sum\_{s^{\prime}} p(s^{\prime} \mid s, a) \, v\_{\pi}(s^{\prime}) \Big]</span>

Read it from the inside out. For one action, take its reward plus <span class="m">\gamma</span> times the average value of where it might land. Then average that over the actions the policy might pick.

<details class="aside" markdown="1">
<summary>When the reward itself is random</summary>

Zhao's book allows the reward to be random too, with chances <span class="m">p(r \mid s, a)</span>. Then <span class="m">r(s, a)</span> becomes the average reward, <span class="m">\sum\_r p(r \mid s, a) \, r</span>, and nothing else changes. Written that way, the Bellman equation is

<span class="m d">v\_{\pi}(s) = \sum\_{a} \pi(a \mid s) \Big[ \sum\_{r} p(r \mid s, a) \, r + \gamma \sum\_{s^{\prime}} p(s^{\prime} \mid s, a) \, v\_{\pi}(s^{\prime}) \Big]</span>

The first part inside the brackets is the average reward right now, and the second is the discounted average of the future.

</details>

## Solving it by hand

Since the equations lean on each other, where do we start? At the target. The policy stays there and collects +1, so its equation has <span class="m">v(s\_9)</span> on both sides.

<span class="m d">v(s\_9) = 1 + 0.9 \, v(s\_9)</span>

Take <span class="m">0.9 \, v(s\_9)</span> away from both sides and you get <span class="m">0.1 \, v(s\_9) = 1</span>, so <span class="m">v(s\_9) = 10</span>. Now <span class="m">s\_8</span> only needs <span class="m">s\_9</span>, so <span class="m">v(s\_8) = 1 + 0.9 \times 10 = 10</span>, and from there you can walk backwards along the path, one cell at a time.

Do that for `detour`, which walks <span class="m">s\_1</span>, <span class="m">s\_4</span>, <span class="m">s\_7</span>, <span class="m">s\_8</span>, <span class="m">s\_9</span>. Fill in each line with the reward of that cell's move plus 0.9 times the value of the next cell, using the names above it.

<pre class="py" data-skip="true">
v9 = 10
v8 = 1 + 0.9 * v9
v7 = ...  # your code here
v4 = ...
v1 = ...
print(v7, v4, v1)
</pre>
<pre class="py-check">
assert abs(v7 - 9) &lt; 1e-9, f"From s7 the detour goes right into s8 for 0, so v7 = 0 + 0.9 * v8. You have {v7}."
assert abs(v4 - 7.1) &lt; 1e-9, f"From s4 the detour goes down into the forbidden s7, which pays -1. You have {v4}."
assert abs(v1 - 6.39) &lt; 1e-9, f"From s1 the detour goes down into s4 for 0. You have {v1}."
</pre>
<pre class="py-solution">
v9 = 10
v8 = 1 + 0.9 * v9
v7 = 0 + 0.9 * v8
v4 = -1 + 0.9 * v7
v1 = 0 + 0.9 * v4
print(v7, v4, v1)
</pre>

## Solving it by repeating

Walking backwards works here, but it gets awkward when states loop into each other in a big world. Here's a lazier way that always works. Start with a guess of 0 for every state. Then apply the Bellman equation to every state at once, using the old guesses on the right hand side. That's called a sweep.

<pre class="py">
def sweep(policy, v, gamma):
    new = {}
    for s in states:
        a = policy[s]
        new[s] = reward(s, a) + gamma * v[next_state(s, a)]
    return new
</pre>

Here are the first three sweeps.

<pre class="py" data-show="v">
v = {}
for s in states:
    v[s] = 0
for k in range(3):
    v = sweep(policy, v, 0.9)
</pre>

After one sweep only the cells that reach the target right away know about the +1. After two, their neighbours do, and so on. The good news spreads backwards from the target, one cell per sweep. Step through it here.

<figure class="grid-world" data-mode="sweep" data-policy="right down left right down down right right stay"></figure>

Keep going and the guesses settle on the true values. Watch <span class="m">v(s\_1)</span> creep up to 7.29.

<pre class="py">
v = {}
for s in states:
    v[s] = 0
for k in range(1, 101):
    v = sweep(policy, v, 0.9)
    if k in [1, 2, 5, 10, 20, 50, 100]:
        print(k, round(v[1], 4))
</pre>

<details class="aside" markdown="1">
<summary>Why it always settles</summary>

Compare a guess with the true values. A sweep replaces every guess with a reward plus <span class="m">\gamma</span> times a guess, while the true values are the same reward plus <span class="m">\gamma</span> times a true value. So the rewards cancel, and the new gap is <span class="m">\gamma</span> times an old gap. Every sweep shrinks the biggest gap by at least a factor of <span class="m">\gamma</span>, and after <span class="m">k</span> sweeps it's at most <span class="m">\gamma^k</span> times what it started at, which heads to 0.

</details>

Working out the values of a given policy is called policy evaluation. Write `evaluate(policy, gamma, sweeps)`, which starts from 0 everywhere, runs that many sweeps and returns the values.

<pre class="py" data-skip="true">
def evaluate(policy, gamma, sweeps):
    ...  # your code here
evaluate(detour, 0.9, 200)
</pre>
<pre class="py-check">
got = evaluate(policy, 0.9, 200)
assert isinstance(got, dict) and len(got) == 9, "Return a dictionary with a value for each of the 9 states."
assert abs(got[1] - 7.29) &lt; 1e-6, f"After 200 sweeps, s1 should be worth 7.29 under policy, but you have {got[1]}."
assert abs(evaluate(detour, 0.9, 200)[1] - 6.39) &lt; 1e-6, "Under detour, s1 should be worth 6.39."
assert abs(evaluate(policy, 0.5, 200)[9] - 2) &lt; 1e-6, "With gamma 0.5 the target is worth 1 / (1 - 0.5) = 2. Use the gamma you're given."
assert evaluate(policy, 0.9, 0)[1] == 0, "With 0 sweeps every value should still be 0."
</pre>
<pre class="py-solution">
def evaluate(policy, gamma, sweeps):
    v = {}
    for s in states:
        v[s] = 0
    for k in range(sweeps):
        v = sweep(policy, v, gamma)
    return v
evaluate(detour, 0.9, 200)
</pre>

A sweep for a policy that rolls dice is the same, except that each state averages over its actions. Here it is for the coin policy.

<pre class="py">
coin_policy = {1: {"right": 0.5, "down": 0.5}, 2: {"down": 1.0}, 3: {"left": 1.0},
               4: {"down": 1.0}, 5: {"down": 1.0}, 6: {"down": 1.0},
               7: {"right": 1.0}, 8: {"right": 1.0}, 9: {"stay": 1.0}}

def sweep_random(policy, v, gamma):
    new = {}
    for s in states:
        total = 0
        for a, p in policy[s].items():
            total += p * (reward(s, a) + gamma * v[next_state(s, a)])
        new[s] = total
    return new

v = {}
for s in states:
    v[s] = 0
for k in range(200):
    v = sweep_random(coin_policy, v, 0.9)
round(v[1], 2)
</pre>

## All nine at once

Every cell's equation has the same shape, so we can stack all nine into arrays, the way NumPy likes it. Put the reward of each cell's move into a vector `r`, and put the chances of moving between cells into a 9 by 9 table `P`, where row `i` says where the agent goes from cell `i + 1`. Our policy never rolls dice, so each row has a single 1 in it.

<pre class="py" data-show="r P">
import numpy as np
r = np.zeros(9)
P = np.zeros((9, 9))
for s in states:
    a = policy[s]
    r[s - 1] = reward(s, a)
    P[s - 1, next_state(s, a) - 1] = 1
</pre>

Now all nine Bellman equations become one line. `P @ v` picks out, for every cell, the value of where it lands, which is exactly what the right hand side needs.

<span class="m d">v = r + \gamma P v</span>

<pre class="py">
v = np.zeros(9)
for k in range(200):
    v = r + 0.9 * P @ v
v.round(2)
</pre>

There's also a shortcut that skips the sweeps. Move <span class="m">\gamma P v</span> to the left to get <span class="m">(I - \gamma P) \, v = r</span>, where <span class="m">I</span> is the identity, the table with 1s down the diagonal that leaves a vector as it is. That's a set of nine linear equations, and `np.linalg.solve` solves those directly. `np.eye(9)` makes the identity.

<pre class="py">
v_exact = np.linalg.solve(np.eye(9) - 0.9 * P, r)
v_exact.round(2)
</pre>

Same values, no sweeps. For small worlds this is the quickest way. For big ones the table gets far too large, and repeated sweeps win.

Now build `r` and `P` for `coin_policy`. A row can now hold more than one number, because from <span class="m">s\_1</span> the agent goes right with chance 0.5 and down with chance 0.5. Each reward is likewise the average over the actions. Then solve for `v_coin`.

<pre class="py" data-skip="true">
r = np.zeros(9)
P = np.zeros((9, 9))
# your code here
v_coin = np.linalg.solve(np.eye(9) - 0.9 * P, r)
v_coin.round(2)
</pre>
<pre class="py-check">
assert np.allclose(P.sum(axis=1), 1), f"Every row of P should add up to 1, but the rows add up to {P.sum(axis=1)}."
assert abs(P[0, 1] - 0.5) &lt; 1e-9 and abs(P[0, 3] - 0.5) &lt; 1e-9, "From s1 the coin policy reaches s2 and s4 with chance 0.5 each, so P[0, 1] and P[0, 3] should both be 0.5."
assert abs(v_coin[0] - 6.84) &lt; 0.01, f"s1 should be worth 6.84 under the coin policy, but v_coin[0] is {v_coin[0]:.2f}."
</pre>
<pre class="py-solution">
r = np.zeros(9)
P = np.zeros((9, 9))
for s in states:
    for a, p in coin_policy[s].items():
        r[s - 1] += p * reward(s, a)
        P[s - 1, next_state(s, a) - 1] += p
v_coin = np.linalg.solve(np.eye(9) - 0.9 * P, r)
v_coin.round(2)
</pre>

## How good is each move?

State values say how good a cell is. To make a policy better, though, we'd like to know how good each move is. The action value answers that. It's the return the agent can expect if it starts in <span class="m">s</span>, takes action <span class="m">a</span> first, and only then follows the policy.

<span class="m d">q\_{\pi}(s, a) = r(s, a) + \gamma \, v\_{\pi}(s^{\prime})</span>

It's the Bellman equation again, just with the first action picked by us instead of the policy. Stanford writes it <span class="m">Q^{\pi}(s, a)</span>. Here are all five moves from <span class="m">s\_4</span> under `detour`.

<pre class="py">
v = {}
for s in states:
    v[s] = 0
for k in range(200):
    v = sweep(detour, v, 0.9)

for a in actions:
    q = reward(4, a) + 0.9 * v[next_state(4, a)]
    print(a, round(q, 2))
</pre>

The detour goes down from <span class="m">s\_4</span>, which is worth 7.1, but going right is worth 8.1. So the action values point straight at a better move. That's how the two kinds of value fit together. A state's value is the action value of whatever the policy does there, or, when it rolls dice, the average of its action values.

<span class="m d">v\_{\pi}(s) = \sum\_{a} \pi(a \mid s) \, q\_{\pi}(s, a)</span>

Write `best_action(s, v, gamma)`, which returns the action with the highest action value in state `s`, given state values `v`.

<pre class="py" data-skip="true">
def best_action(s, v, gamma):
    ...  # your code here
best_action(4, v, 0.9)
</pre>
<pre class="py-check">
assert best_action(4, v, 0.9) == "right", f"Under detour's values, right is the best move from s4, but you returned {best_action(4, v, 0.9)!r}."
assert best_action(1, v, 0.9) == "right", "From s1, right (worth 7.29) beats down (worth 6.39)."
assert best_action(8, v, 0.9) == "right", "From s8, right reaches the target."
</pre>
<pre class="py-solution">
def best_action(s, v, gamma):
    best, best_q = None, None
    for a in actions:
        q = reward(s, a) + gamma * v[next_state(s, a)]
        if best_q is None or q > best_q:
            best, best_q = a, q
    return best
best_action(4, v, 0.9)
</pre>

Now take the best action in every cell and look at what comes out. `max` with a `key` picks the action whose action value is highest, the same trick as finding the longest word in Lecture 0.

<pre class="py">
better = {}
for s in states:
    better[s] = max(actions, key=lambda a: reward(s, a) + 0.9 * v[next_state(s, a)])
print(better)
print([s for s in states if better[s] != detour[s]])
</pre>

Picking the best move everywhere fixes both of the detour's bad moves, in <span class="m">s\_1</span> and <span class="m">s\_4</span>. It also finds something we never thought of. In <span class="m">s\_3</span> it goes down, straight through the forbidden <span class="m">s\_6</span>. Paying -1 once to reach the target a step sooner beats walking the long way round, at least with <span class="m">\gamma = 0.9</span>. Our good policy wasn't the best one after all.

Evaluate a policy, improve it with action values, and repeat until nothing changes. That loop finds the best policy there is, and it's where the next lecture picks up.

<p class="credit">This part follows Chapter 2 of Shiyu Zhao's <a href="https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning">Mathematical Foundations of Reinforcement Learning</a>, with the value functions from Lecture 1 of <a href="https://cs224r.stanford.edu/">Stanford CS224R</a> (Spring 2025).</p>

<nav class="lesson-nav">
  <a class="prev" href="/course/lecture-1/mdp/">&larr; Expected Return and MDPs</a>
  <a class="next" href="/course/lecture-1/imitation/">Imitation Learning &rarr;</a>
</nav>

<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script src="/course/assets/math.js"></script>
<script src="/course/assets/gridworld.js"></script>
<script src="/course/assets/course.js"></script>
<script src="/course/assets/python-cells.js" data-traces="/course/assets/traces/bellman.json"></script>
