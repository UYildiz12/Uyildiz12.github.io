---
layout: page
title: "Expected Return and MDPs"
permalink: /course/lecture-1/mdp/
---

<link rel="stylesheet" href="/course/assets/course.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">

In the last part we turned good into a number, the return. That works fine as long as nothing is left to chance. Once the policy or the world rolls dice, the same policy can give a different return every time, so we need a way to say how good it is on average. After that, we'll put everything from both parts into one frame, the MDP.

Here's the grid from last time in one cell, so the code on this page has everything it needs.

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

def pick_action(policy, s):
    probs = policy[s]
    return random.choices(list(probs.keys()), weights=list(probs.values()))[0]

def discounted_return(rewards, gamma):
    total = 0
    for t, r in enumerate(rewards):
        total += gamma ** t * r
    return total

policy = {1: "right", 2: "down", 3: "left", 4: "right", 5: "down", 6: "down", 7: "right", 8: "right", 9: "stay"}
coin_policy = {1: {"right": 0.5, "down": 0.5}, 2: {"down": 1.0}, 3: {"left": 1.0},
               4: {"down": 1.0}, 5: {"down": 1.0}, 6: {"down": 1.0},
               7: {"right": 1.0}, 8: {"right": 1.0}, 9: {"stay": 1.0}}
</pre>

## When things are random

With a deterministic policy and no wind, the same start always gives the same return. Now use `coin_policy`. It flips a coin in <span class="m">s\_1</span> between the two policies we compared last time, and the two paths give different returns.

<pre class="py">
def rollout_random(policy, s, steps):
    rewards = []
    for t in range(steps):
        a = pick_action(policy, s)
        rewards.append(reward(s, a))
        s = next_state(s, a)
    return rewards

random.seed(0)
for i in range(5):
    print(round(discounted_return(rollout_random(coin_policy, 1, 200), 0.9), 2))
</pre>

So what's the return of this policy? Neither number on its own. What we can say is what it gets on average if we run it many, many times. That long run average is called the expected value. A die is the classic example. Each face comes up a sixth of the time, so take each face, multiply it by a sixth, and add them up.

<span class="m d">1 \cdot \tfrac16 + 2 \cdot \tfrac16 + 3 \cdot \tfrac16 + 4 \cdot \tfrac16 + 5 \cdot \tfrac16 + 6 \cdot \tfrac16 = 3.5</span>

So the expected value is each value times how often it happens, all added up. Rolling it a lot gets you close.

<pre class="py">
random.seed(0)
rolls = [random.randint(1, 6) for i in range(100000)]
sum(rolls) / len(rolls)
</pre>

The expected value of something is written <span class="m">\mathbb{E}[\,\cdot\,]</span>, so for a die roll <span class="m">X</span> it's <span class="m">\mathbb{E}[X] = 3.5</span>. With the sum sign, the rule above becomes

<span class="m d">\mathbb{E}[X] = \sum\_x x \, p(x)</span>

which reads "for every value <span class="m">x</span>, multiply it by its probability, and add them all up".

The coin policy works the same way. Half the time it goes right and gets <span class="m">7.29</span>. The other half it goes down, pays <span class="m">-1</span> on its second step, and gets <span class="m">-0.9 + 7.29 = 6.39</span>. So its expected return is

<span class="m d">\mathbb{E}[G] = 0.5 \cdot 7.29 + 0.5 \cdot 6.39 = 6.84</span>

<pre class="py">
random.seed(0)
returns = [discounted_return(rollout_random(coin_policy, 1, 200), 0.9) for i in range(5000)]
sum(returns) / len(returns)
</pre>

The randomness comes from two places, the policy rolling dice and the world rolling dice. The chance of one whole trajectory is the chance of each step multiplied together. Starting in <span class="m">s\_1</span>, the coin policy goes down with chance 0.5, and every move after that is certain, so the path through the forbidden cell has a chance of <span class="m">0.5 \times 1 \times 1 \times \dots = 0.5</span>. With wind, every step would bring its own chance into the product, like <span class="m">0.5 \times 0.9 \times 0.9 \times \dots</span>.

<details class="aside" markdown="1">
<summary>The same thing in general</summary>

Here the small numbers count steps, so <span class="m">s\_t</span> is the state at step <span class="m">t</span>, not cell <span class="m">t</span>. <span class="m">\prod</span> (capital pi) is the multiplying version of <span class="m">\Sigma</span>.

<span class="m d">p(\text{trajectory}) = p(s\_1) \prod\_{t} \pi(a\_t \mid s\_t) \, p(s\_{t+1} \mid s\_t, a\_t)</span>

That's the chance of the starting state, times, for every step, the chance the policy picks that action, times the chance the world then lands where it did.

</details>

So now we can write down the goal of reinforcement learning. Find the policy whose expected discounted return is as big as possible.

<span class="m d">\max\_{\pi} \; \mathbb{E}[G]</span>

Read it as "out of all policies <span class="m">\pi</span>, find the one with the largest expected return".

<!-- lab:windy_grid -->

Add wind to the grid. Whenever the agent moves, there's a 20% chance a gust pushes it one extra cell down, if there's room below the cell it moved into. The reward stays the reward of the move the agent chose. Then estimate the expected discounted return of `policy` from <span class="m">s\_1</span>, with `gamma=0.9`, with and without wind, and print both.

<pre class="py" data-lab="true">
# your code here
</pre>
<pre class="py-solution">
def windy_next_state(s, a):
    s = next_state(s, a)
    if random.random() &lt; 0.2 and s &lt;= 6:
        s += 3
    return s

def rollout_windy(policy, s, steps, wind):
    rewards = []
    for t in range(steps):
        a = policy[s]
        rewards.append(reward(s, a))
        s = windy_next_state(s, a) if wind else next_state(s, a)
    return rewards

random.seed(0)
calm = [discounted_return(rollout_windy(policy, 1, 200, False), 0.9) for i in range(3000)]
windy = [discounted_return(rollout_windy(policy, 1, 200, True), 0.9) for i in range(3000)]
print(round(sum(calm) / len(calm), 2))
print(round(sum(windy) / len(windy), 2))
</pre>
<pre class="py-rubric">
- Adds a 20% chance that, after the chosen move, the agent is pushed one more cell down, and only when there is a cell below.
- Keeps the reward as the reward of the chosen move.
- Follows the deterministic policy from s1 with gamma 0.9, averaging the discounted return over many runs, at least a few hundred, with and without wind.
- Prints both averages. Without wind it is 7.29. With wind it comes out higher, around 7.6, because the gusts push the agent down, the way it was heading anyway. Exact values vary with the random draws.
</pre>

<!-- /lab:windy_grid -->

## Markov decision processes

Everything from these two parts fits one frame, called a Markov decision process, or MDP for short.

| piece | in our grid |
|---|---|
| states | the nine cells |
| actions | up, right, down, left, stay |
| transitions <span class="m">p(s^{\prime} \mid s, a)</span> | the moves, plus wind if there is any |
| rewards <span class="m">p(r \mid s, a)</span> | the -1, 0 and +1 |
| discount rate <span class="m">\gamma</span> | 0.9 |

Hand an MDP a policy <span class="m">\pi</span> and it runs on its own. The Markov part is one assumption. What happens next depends only on the current state and action, not on how the agent got there.

<span class="m d">p(s\_{\text{next}} \mid s\_{\text{now}}, a\_{\text{now}}, \text{everything before}) = p(s\_{\text{next}} \mid s\_{\text{now}}, a\_{\text{now}})</span>

Knowing the whole history doesn't change the chances, once you know where the agent is now and what it does.

That's why the word state matters so much. A state has to carry everything that matters for what comes next. Sometimes the agent can't see all of that. In poker you don't see the other players' cards, so what you see isn't the full state. It's called an observation, and the problem becomes a partially observed MDP. A common fix is to let the policy remember the last few observations.

Now wrap the grid up as a class. `reset()` puts the agent back on its start cell and returns it. `step(a)` moves the agent, remembers where it is now, and returns the new state and the reward. Most RL code talks to its world through almost exactly these two methods, so you'll see this shape a lot.

<pre class="py" data-skip="true">
class GridWorld:
    def __init__(self, start=1):
        self.start = start
        self.state = start
    def reset(self):
        ...  # your code here
    def step(self, a):
        ...  # your code here
env = GridWorld()
print(env.reset())
print(env.step("right"))
print(env.step("down"))
</pre>
<pre class="py-check">
env = GridWorld(start=4)
assert env.reset() == 4, "reset() should return the start cell."
assert env.step("down") == (7, -1), "From s4, down should give (7, -1), the forbidden cell and its penalty."
assert env.state == 7, "step should remember the new state in self.state."
assert env.step("left") == (7, -1), "From s7, left leaves the grid, so the agent stays and gets -1."
env.step("right")
assert env.reset() == 4 and env.state == 4, "reset() should put the agent back on its start cell."
</pre>
<pre class="py-solution">
class GridWorld:
    def __init__(self, start=1):
        self.start = start
        self.state = start
    def reset(self):
        self.state = self.start
        return self.state
    def step(self, a):
        r = reward(self.state, a)
        self.state = next_state(self.state, a)
        return self.state, r
env = GridWorld()
print(env.reset())
print(env.step("right"))
print(env.step("down"))
</pre>

## Beyond the grid

The same pieces describe much bigger problems.

| | towel robot | chatbot |
|---|---|---|
| state | camera images and joint angles | the conversation so far |
| action | where to move its joints next | its next message |
| reward | 1 once the towel is on the hook, else 0 | +1 for an upvote, -10 for a downvote, else 0 |
| episode | about 10 seconds | one conversation |

<!-- lab:design_a_problem -->

Now describe a problem of your own as an RL problem. A self-driving car, a poker player or an agent that books flights on a website would all work, or anything else you like. Fill in a dictionary with the state, the actions, the reward and how an episode ends, and print it.

<pre class="py" data-lab="true">
problem = {
    "name": "",
    "state": "",
    "actions": "",
    "reward": "",
    "episode ends": "",
}
# your code here
</pre>
<pre class="py-solution">
problem = {
    "name": "poker player",
    "state": "my two cards, the cards on the table, the pot, every player's chips and the bets so far this hand",
    "actions": "fold, call, or raise by some amount",
    "reward": "the chips won or lost, given when the hand ends, and 0 on every other step",
    "episode ends": "when the hand is over",
}
for key, value in problem.items():
    print(f"{key}: {value}")
</pre>
<pre class="py-rubric">
- Fills in all five entries for a real decision problem and prints them.
- The state holds what the agent needs to decide, and says if it's only a partial view of the world, like hidden cards.
- The actions are choices the agent itself makes.
- The reward is a number that says how well the agent is doing and fits the goal of the problem, not a description of the right move.
- Says when an episode ends, or that the task keeps going.
</pre>

<!-- /lab:design_a_problem -->

## Ways to find a good policy

So the goal is clear, find the policy with the largest expected return. There are a handful of big ideas for how to actually find it, and the rest of the course works through them.

| idea | in plain words |
|---|---|
| imitation learning | copy an expert who already does well |
| policy gradients | nudge the policy straight toward the actions that led to higher returns |
| actor critic | keep a running score of how good the current policy is, and use it to improve the policy |
| value based | work out how good each action can be at best, then pick the best one |
| model based | learn how the world works, then plan with it |

Why so many? Each one bets on different things being cheap. Some need a fast way to try things, like a simulator. Some need an expert to copy, and others need a carefully designed reward. Some are much steadier and easier to get working, and some only fit a handful of actions while others handle smooth ones like a steering angle.

Next we'll ask how good a policy is from every state, not just from one start, which leads to the Bellman equation.

<p class="credit">This part follows Lecture 1 of Shiyu Zhao's <a href="https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning">Mathematical Foundations of Reinforcement Learning</a>, whose grid world it borrows, with examples from Lecture 1 of <a href="https://cs224r.stanford.edu/">Stanford CS224R</a> (Spring 2025).</p>


<nav class="lesson-nav">
  <a class="prev" href="/course/lecture-1/concepts/">&larr; States, Actions and Rewards</a>
  <a class="next" href="/course/lecture-1/bellman/">Values and the Bellman Equation &rarr;</a>
</nav>

<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script src="/course/assets/math.js"></script>
<script src="/course/assets/course.js"></script>
<script src="/course/assets/python-cells.js"></script>
