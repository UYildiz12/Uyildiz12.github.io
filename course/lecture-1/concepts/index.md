---
layout: page
title: "States, Actions and Rewards"
permalink: /course/lecture-1/concepts/
---

<link rel="stylesheet" href="/course/assets/course.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">

Every program in Lecture 0 was told exactly what to do. Reinforcement learning flips that around. Nobody tells the program, which from now on we'll call the agent, what the right move is. It tries something, gets a score back, and over many tries works out which choices lead to good scores. What makes this tricky is that every choice changes what the agent sees next, so a move that looks bad right now can set up something great later, and the other way around.

That one idea covers a surprising amount of ground. It's how [AlphaGo](https://doi.org/10.1038/nature16961) got good enough at Go to beat the best human players, how [legged robots learn to run and get back up](https://doi.org/10.1126/scirobotics.aau5872), and how chatbots get [tuned on the answers people prefer](https://arxiv.org/abs/2203.02155). Before any of that though, we need words for the pieces. This part sets them all up on one tiny example, and every part after it builds on that example.

## A tiny world

Our agent lives in a 3 by 3 grid. It starts in some cell and wants to reach the target in the bottom right corner. Two cells are forbidden. The agent can step into them, but it's going to cost it.

<figure class="grid-world" data-mode="labels"></figure>

So what would a good way to the target look like? It should stay out of the forbidden cells, not bump into the walls, and not wander around for no reason. Keep that in mind, because this whole part is about turning that vague idea of good into a number.

<pre class="py">
FORBIDDEN = [6, 7]
TARGET = 9
</pre>

## States and actions

Where the agent is right now is called its state. Here that's just which cell it's in, so there are nine states, <span class="m">s\_1</span> to <span class="m">s\_9</span>. All of them together are called the state space.

In every state the agent picks one of five actions. It can go up, right, down or left, or stay where it is.

<pre class="py">
states = list(range(1, 10))
actions = ["up", "right", "down", "left", "stay"]
</pre>

## Where an action leads

When the agent takes an action, it lands in a new state. Which one is decided by the world, not by the agent, and this rule is called the state transition. In our grid, going right from <span class="m">s\_1</span> lands in <span class="m">s\_2</span>. Walking into the outer wall leaves the agent where it was. Going into a forbidden cell actually works, it just costs something, which we'll get to with rewards.

In code, each cell has a row and a column, both counted from 0. `//` and `%` turn a cell number into its row and column, just like the full cars and the leftover people in the picnic exercise. `try_move` returns `None` when a move would leave the grid, and `next_state` turns that into staying put. `x is None` is the usual way to check whether something is `None`.

<pre class="py">
MOVES = {"up": (-1, 0), "right": (0, 1), "down": (1, 0), "left": (0, -1), "stay": (0, 0)}

def try_move(s, a):
    row = (s - 1) // 3
    col = (s - 1) % 3
    dr, dc = MOVES[a]
    row, col = row + dr, col + dc
    if row &lt; 0 or row > 2 or col &lt; 0 or col > 2:
        return None
    return row * 3 + col + 1

def next_state(s, a):
    s_next = try_move(s, a)
    if s_next is None:
        return s
    return s_next
</pre>

Before running anything, trace these three calls by hand. For each one, write down the row and column `try_move` starts from, the row and column after the move, whether that's still on the grid, and what `next_state` returns in the end.

<pre class="py-trace">
next_state(8, "left")
next_state(6, "right")
next_state(2, "down")
</pre>
<pre class="py-solution">
next_state(8, "left")
row = 7 // 3 = 2, col = 7 % 3 = 1
left is (0, -1), so the move goes to row 2, col 0, which is on the grid
try_move gives 2 * 3 + 0 + 1 = 7, so next_state returns 7

next_state(6, "right")
row = 5 // 3 = 1, col = 5 % 3 = 2
right is (0, 1), so the move goes to row 1, col 3, which is off the grid
try_move gives None, so next_state keeps the agent where it was and returns 6

next_state(2, "down")
row = 1 // 3 = 0, col = 1 % 3 = 1
down is (1, 0), so the move goes to row 1, col 1, which is on the grid
try_move gives 1 * 3 + 1 + 1 = 5, so next_state returns 5
</pre>
<pre class="py-rubric">
- Gives the final result of each call, which is 7, 6 and 5.
- For each call, shows the starting row and column, the row and column after the move, and whether that is on the grid. How the arithmetic is laid out doesn't matter.
- For the move off the grid, says that try_move gives None, so next_state keeps the agent where it was.
</pre>

Now run them and compare with your trace.

<pre class="py">
print(next_state(8, "left"))
print(next_state(6, "right"))
print(next_state(2, "down"))
</pre>

In our grid, an action always leads to the same place. The real world is messier. A gust of wind might push the agent somewhere else now and then. So instead of saying where an action leads, we say how likely each landing spot is. That's a probability, a number from 0 to 1 that says how often something happens if you try many times. 1 means always, 0 means never, and 0.1 means about one time in ten.

Say the wind pushes the agent down one time in ten. Then going right from <span class="m">s\_1</span> lands in <span class="m">s\_2</span> nine times out of ten, and in <span class="m">s\_4</span> the other time. Math writes that like this.

<span class="m d">p(s\_2 \mid s\_1, \text{right}) = 0.9 \qquad p(s\_4 \mid s\_1, \text{right}) = 0.1</span>

Read the first one as "the probability of landing in <span class="m">s\_2</span>, given that the agent is in <span class="m">s\_1</span> and goes right". The bar just means given. Without wind it would be <span class="m">p(s\_2 \mid s\_1, \text{right}) = 1</span>, and every other cell would get 0. Either way the chances add up to 1, since the agent has to land somewhere.

When we mean any state and any action rather than particular ones, we just write letters, <span class="m">p(s^{\prime} \mid s, a)</span>. Here <span class="m">s</span> is where the agent is, <span class="m">a</span> is its action, and <span class="m">s^{\prime}</span> (say "s prime") is where it lands.

To roll dice like this in code, there's `random.choices`. You give it the options and a weight for each, and it picks one, choosing each option as often as its weight says. It returns a list, because it can pick several at once, so we take the first item. `.keys()` and `.values()` give a dictionary's keys and values.

<pre class="py" data-show="landed">
import random
random.seed(0)
windy = {2: 0.9, 4: 0.1}
landed = {2: 0, 4: 0}
for i in range(1000):
    s_next = random.choices(list(windy.keys()), weights=list(windy.values()))[0]
    landed[s_next] += 1
landed
</pre>

## Policies

The agent's way of choosing actions is called its policy. You can draw one as an arrow in every cell.

<figure class="grid-world" data-mode="policy" data-policy="right down left right down down right right stay"></figure>

In code, it's just a dictionary from state to action. Following this one from <span class="m">s\_1</span> goes right to <span class="m">s\_2</span>, down to <span class="m">s\_5</span>, down to <span class="m">s\_8</span>, right to the target, and then it stays there.

<pre class="py">
policy = {1: "right", 2: "down", 3: "left",
          4: "right", 5: "down", 6: "down",
          7: "right", 8: "right", 9: "stay"}
</pre>

A policy can roll dice too. Say that in <span class="m">s\_1</span> the agent flips a coin between right and down. So just like the transition, a policy is written with probabilities.

<span class="m d">\pi(\text{right} \mid s\_1) = 0.5 \qquad \pi(\text{down} \mid s\_1) = 0.5</span>

Read it as "in <span class="m">s\_1</span>, the policy goes right with probability 0.5". <span class="m">\pi</span> is the Greek letter pi, and here it has nothing to do with circles, it's just the usual name for a policy. For any state and action, it's <span class="m">\pi(a \mid s)</span>. A policy that always picks the same action is called deterministic, and one that rolls dice is called stochastic. In code, a stochastic policy gives each state a dictionary of actions and their probabilities.

<pre class="py">
coin_policy = {1: {"right": 0.5, "down": 0.5}, 2: {"down": 1.0}, 3: {"left": 1.0},
               4: {"down": 1.0}, 5: {"down": 1.0}, 6: {"down": 1.0},
               7: {"right": 1.0}, 8: {"right": 1.0}, 9: {"stay": 1.0}}
</pre>

Picking an action from it is one more job for `random.choices`, with the action probabilities as the weights.

<pre class="py">
def pick_action(policy, s):
    probs = policy[s]
    return random.choices(list(probs.keys()), weights=list(probs.values()))[0]

[pick_action(coin_policy, 1) for i in range(8)]
</pre>

Why would you ever want a random policy? The biggest reason is that an agent learning from its own experience has to try things it hasn't tried before. Otherwise it can never find out that something else works better. This is called exploration, and it's going to come back a lot.

## Rewards

After every action the agent gets a number back, called the reward. A positive reward encourages the action that led to it, and a negative one punishes it. Here's how our grid hands them out.

- `-1` for trying to walk off the grid
- `-1` for stepping into a forbidden cell, or staying in one
- `+1` for stepping into the target, or staying in it
- `0` for everything else

The reward is basically how we tell the agent what we want. We never show it the path. We only say what's good and what's bad, and it has to work the path out on its own. That's also why rewards need care. The agent goes after exactly what the reward says, which isn't always what you meant.

In code, `try_move` already tells us where a move would go, so the list turns straight into a function.

<pre class="py">
def reward(s, a):
    s_next = try_move(s, a)
    if s_next is None:
        return -1
    if s_next in FORBIDDEN:
        return -1
    if s_next == TARGET:
        return 1
    return 0

print(reward(1, "up"))
print(reward(3, "down"))
print(reward(8, "right"))
</pre>

With only 9 states and 5 actions, you could write every reward down in a table. Build a dictionary `table` that maps every `(state, action)` pair to its reward, then print how many of the 45 pairs are punished with -1.

<pre class="py" data-skip="true">
table = {}
# your code here
</pre>
<pre class="py-check">
assert len(table) == 45, f"table has {len(table)} entries. It should have one for each of the 9 states times 5 actions."
assert table[(3, "down")] == -1 and table[(8, "right")] == 1 and table[(1, "right")] == 0, "Each entry should be reward(s, a) for its pair."
assert list(table.values()).count(-1) == 19, "Count the entries equal to -1."
</pre>
<pre class="py-solution">
table = {}
for s in states:
    for a in actions:
        table[(s, a)] = reward(s, a)
print(list(table.values()).count(-1))
</pre>

The reward depends on the state and the action. In general it can be random too, just like the transitions, so it's written <span class="m">p(r \mid s, a)</span>. In our grid it never is.

## Trajectories and returns

Let the agent follow a policy, and you get a chain of states, actions and rewards, called a trajectory.

<span class="m d">s\_1 \xrightarrow[r=0]{\text{right}} s\_2 \xrightarrow[r=0]{\text{down}} s\_5 \xrightarrow[r=0]{\text{down}} s\_8 \xrightarrow[r=1]{\text{right}} s\_9</span>

In code, a trajectory is a list of `(state, action, reward)` steps.

<pre class="py" data-show="trajectory">
def rollout(policy, s, steps):
    trajectory = []
    for t in range(steps):
        a = policy[s]
        r = reward(s, a)
        trajectory.append((s, a, r))
        s = next_state(s, a)
    return trajectory

trajectory = rollout(policy, 1, 4)
</pre>

The return of a trajectory is the sum of all the rewards along the way. This one has a return of 1.

<pre class="py">
sum([r for s, a, r in trajectory])
</pre>

Now here's a second policy. `dict(policy)` makes a copy, so we can change the copy and leave the first policy alone. It's the same as the first, except that it goes down from <span class="m">s\_1</span> and from <span class="m">s\_4</span>, which walks it straight through the forbidden <span class="m">s\_7</span>.

<figure class="grid-world" data-mode="policy" data-policy="down down left down down down right right stay"></figure>

<pre class="py">
detour = dict(policy)
detour[1] = "down"
detour[4] = "down"
print(rollout(detour, 1, 4))
print(sum([r for s, a, r in rollout(detour, 1, 4)]))
</pre>

Your gut says the first policy is better, since it stays out of the forbidden cell, and the return agrees, 1 against 0. That's the whole trick. A return turns better into a number we can compare.

## When it never ends

We stopped after 4 steps, but nothing actually ends there. Once in the target, the agent stays and collects +1 on every step, forever. Add up infinitely many +1s and the return is infinite, for both policies, and then we can't tell them apart anymore.

The fix is to make rewards count for less the further away they are. Pick a number like 0.9. The first reward counts fully, the second is multiplied by 0.9, the third by 0.9 again, so 0.81, and so on. Here's the first policy.

| step | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| reward | 0 | 0 | 0 | 1 | 1 | 1 | 1 |
| multiplied by | 1 | 0.9 | 0.81 | 0.729 | 0.656 | 0.590 | 0.531 |
| counts as | 0 | 0 | 0 | 0.729 | 0.656 | 0.590 | 0.531 |

The +1s keep shrinking, so the total stops growing. Let's add a thousand steps and see where it settles. After that many, the multiplier is so tiny that the rest doesn't matter.

<pre class="py">
gamma = 0.9
total = 0
weight = 1
for s, a, r in rollout(policy, 1, 1000):
    total += weight * r
    weight *= gamma
round(total, 2)
</pre>

It settles at 7.29. That total is called the discounted return, and the number we multiply by is the discount rate, written <span class="m">\gamma</span> (gamma). It can be anything from 0 up to, but not including, 1. Calling the rewards <span class="m">r\_1, r\_2, r\_3</span> and so on, in the order they come, the discounted return is

<span class="m d">G = r\_1 + \gamma r\_2 + \gamma^2 r\_3 + \gamma^3 r\_4 + \dots</span>

You'll often see the same thing written with a big <span class="m">\Sigma</span> (sigma), which is just math's way of saying add these up. It's basically the `for` loop above written in math.

<span class="m d">G = \sum\_{t=0}^{\infty} \gamma^t r\_{t+1}</span>

Read it as "for <span class="m">t = 0, 1, 2</span> and so on forever, take <span class="m">\gamma^t r\_{t+1}</span>, and add them all up".

<details class="aside" markdown="1">
<summary>Why exactly 7.29?</summary>

The rewards are 0, 0, 0, then 1 forever, so <span class="m">G = \gamma^3 + \gamma^4 + \gamma^5 + \dots = \gamma^3 (1 + \gamma + \gamma^2 + \dots)</span>.

Call the part in brackets <span class="m">S</span>. Multiply it by <span class="m">\gamma</span> and every term moves one place along, so <span class="m">S</span> and <span class="m">\gamma S</span> match everywhere except for the 1 at the front. That means <span class="m">S - \gamma S = 1</span>, so <span class="m">S = 1 / (1 - \gamma)</span> and <span class="m">G = \gamma^3 / (1 - \gamma)</span>. With <span class="m">\gamma = 0.9</span> that's <span class="m">0.729 / 0.1 = 7.29</span>.

</details>

We'll need that loop again, so here it is as a function that takes any list of rewards.

<pre class="py">
def discounted_return(rewards, gamma):
    total = 0
    for t, r in enumerate(rewards):
        total += gamma ** t * r
    return total

round(discounted_return([0, 0, 0, 1], 0.9), 3)
</pre>

<span class="m">\gamma</span> also sets how far ahead the agent cares. Near 0, only the next few rewards count and the agent is short sighted. Near 1, rewards far in the future count almost as much as the next one.

Say an agent can take 1 right now, or wait and get 10 on its sixth step, so it's choosing between the rewards `[1]` and `[0, 0, 0, 0, 0, 10]`. Going up from 0.01 in steps of 0.01, find the smallest <span class="m">\gamma</span> for which waiting is worth more, and store it in `smallest`.

<pre class="py" data-skip="true">
smallest = None
# your code here
smallest
</pre>
<pre class="py-check">
import math
assert smallest is not None, "Set smallest to the first gamma where waiting wins."
assert math.isclose(smallest, 0.64), f"Got {smallest}. Compare discounted_return([0, 0, 0, 0, 0, 10], g) with discounted_return([1], g) for g = 0.01, 0.02 and so on, and stop at the first g where waiting is bigger."
</pre>
<pre class="py-solution">
smallest = None
for i in range(1, 100):
    g = i / 100
    if discounted_return([0, 0, 0, 0, 0, 10], g) > discounted_return([1], g):
        smallest = g
        break
smallest
</pre>

Here's the grid to play with. Clicking a cell turns its arrow, and the rewards underneath fade by <span class="m">\gamma^t</span>.

<figure class="grid-world" data-mode="play" data-policy="right down left right down down right right stay"></figure>

## Episodes

Some tasks have a natural end, like a game of chess. One run from start to finish is called an episode, and these are episodic tasks. Others just keep going, like a thermostat, and are called continuing tasks.

Our grid could go either way. We could say a run ends when the agent reaches the target. Instead, we let the target be a normal cell the agent could leave, and simply keep paying +1 for staying. With discounting, that makes everything a continuing task, so one set of math covers both.

Snake, on the other hand, is a classic episodic task, and here you're the policy. Every step pays a reward, `+1` for eating, `-1` for crashing and `0` otherwise, and a crash ends the episode. Click the board and play a few rounds with the arrow keys, or swipe on a phone. Then hand the game to the other policies. Random picks any direction that isn't straight back. Greedy heads for the food, unless that move would crash right away.

<figure class="snake"></figure>

The state here is the whole board, where every piece of the snake is and where the food is. That's far more states than anyone could draw an arrow in, so for games like this we'll later need something smarter than a table.

Greedy beats random by a mile, but it still traps itself sooner or later, because it only looks one step ahead.

Learner is different. Nobody gives it a rule. It starts out knowing nothing, mostly tries random moves, and keeps track of which moves paid off in which situations. Speed it up and watch the chart. Each dot is one episode's return, and the line is the average of the last 20. As it learns, it explores less and less. How it does that is a few parts away, but everything it uses, states, actions, rewards and returns, is on this page.

Also notice that even for one policy, the return changes from episode to episode, so it's the average that tells policies apart. That's where we're going next.

<p class="credit">This part follows Lecture 1 of Shiyu Zhao's <a href="https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning">Mathematical Foundations of Reinforcement Learning</a>, whose grid world it borrows, with examples from Lecture 1 of <a href="https://cs224r.stanford.edu/">Stanford CS224R</a> (Spring 2025).</p>


<nav class="lesson-nav">
  <a class="prev" href="/course/lecture-0/oop/">&larr; Objects and Classes</a>
  <a class="next" href="/course/lecture-1/mdp/">Expected Return and MDPs &rarr;</a>
</nav>

<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script src="/course/assets/math.js"></script>
<script src="/course/assets/gridworld.js"></script>
<script src="/course/assets/snake.js"></script>
<script src="/course/assets/course.js"></script>
<script src="/course/assets/python-cells.js" data-traces="/course/assets/traces/concepts.json"></script>
