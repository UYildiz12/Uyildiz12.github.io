---
layout: page
title: "Working with Data"
permalink: /course/lecture-0/data/
---

<link rel="stylesheet" href="/course/assets/course.css">

Most of this course is about numbers in big tables, so this is the part of Python you'll for sure be using. We'll go through NumPy for arrays of numbers, matplotlib for pictures and pandas for tables with named columns. Along the way we'll look at temperatures, shopping and five years of weather, and we'll end by getting a computer to read handwritten digits.

## Arrays

Now lists are great for holding things, but they're pretty bad at math. Multiply a list by 2 and you get the list twice, which is probably not what you had in mind.

<pre class="py">
[12, 15, 14] * 2
</pre>

NumPy gives us arrays, which do math on every element at once.

<pre class="py" data-show="temps _">
import numpy as np
temps = np.array([12, 15, 14, 18, 21, 19, 16])
temps * 2
</pre>

So converting a whole week to Fahrenheit is one line, with no loop.

<pre class="py">
temps * 9 / 5 + 32
</pre>

Every array has a `shape`, which says how many entries it has along each direction, and a `dtype`, which says what kind of numbers it holds.

<pre class="py">
print(temps.shape)
print(temps.dtype)
</pre>

You don't always have to type the numbers in yourself. `np.zeros` and `np.ones` make arrays full of zeros or ones.

<pre class="py">
print(np.zeros(3))
print(np.ones(3))
</pre>

Give them a shape in round brackets instead of one number, and you get rows and columns.

<pre class="py">
np.zeros((2, 3))
</pre>

`np.arange(start, stop, step)` works like `range` and leaves out the stop.

<pre class="py">
np.arange(0, 10, 2)
</pre>

`np.linspace(a, b, n)` gives n evenly spaced numbers from a to b, with both ends included.

<pre class="py">
np.linspace(0, 1, 5)
</pre>

`reshape` arranges the same numbers into rows and columns.

<pre class="py" data-show="grid">
grid = np.arange(12).reshape(3, 4)
grid
</pre>

Arrays also come with methods for the usual questions, like `.sum()` and `.mean()`. There's more on those further down.

<pre class="py">
print(temps.sum())
print(temps.mean())
</pre>

Make an array `a` holding the numbers 1 to 100, and get the sum of their squares without writing a loop.

<pre class="py" data-skip="true">
a = ...  # the numbers 1 to 100
total = ...  # the sum of their squares
total
</pre>
<pre class="py-check">
assert a is not ... and total is not ..., "Replace the ... with your code."
assert np.shape(a) == (100,), "np.arange(1, 101) gives you 1 to 100, since the end is left out."
assert int(total) == 338350, "Square the array with ** 2 and then call .sum() on it."
</pre>
<pre class="py-solution">
a = np.arange(1, 101)
total = (a ** 2).sum()
total
</pre>

## Picking things out

Indexing works pretty much like lists, except you give one position per direction. `grid[1, 2]` is row 1, column 2.

<pre class="py">
grid[1, 2]
</pre>

A `:` means "all of them", so you can take a whole row or a whole column.

<pre class="py">
print(grid[0])
print(grid[:, 1])
</pre>

Slices work in both directions at once.

<pre class="py">
grid[1:, 2:]
</pre>

From this 4 by 5 grid, take the last column, and the block made of rows 1 and 2 and columns 1 to 3, counting positions from 0 as usual. The printed grid shows which numbers those are.

<pre class="py" data-skip="true">
g = np.arange(20).reshape(4, 5)
last_col = ...  # your code here
block = ...  # your code here
print(g)
last_col, block
</pre>
<pre class="py-check">
assert last_col is not ... and block is not ..., "Replace the ... with your code."
assert np.array_equal(last_col, [4, 9, 14, 19]), "The last column is g[:, -1]."
assert np.array_equal(block, [[6, 7, 8], [11, 12, 13]]), "Slices leave out their end, so rows 1 and 2 are 1:3."
</pre>
<pre class="py-solution">
g = np.arange(20).reshape(4, 5)
last_col = g[:, -1]
block = g[1:3, 1:4]
print(g)
last_col, block
</pre>

Arrays can be glued together. `np.stack` takes a list of arrays, and each one becomes a row, or with `axis=1` a column.

<pre class="py">
x = np.array([1, 2, 3])
y = np.array([4, 5, 6])
print(np.stack([x, y]))
print(np.stack([x, y], axis=1))
</pre>

Take the first and the last column of `grid` and put them next to each other, as a 3 by 2 array.

<pre class="py" data-skip="true">
ends = ...  # your code here
ends
</pre>
<pre class="py-check">
assert ends is not ..., "Replace the ... with your code."
assert np.shape(ends) == (3, 2), f"Got shape {np.shape(ends)}. Stacking two columns of length 3 with axis=1 gives 3 by 2."
assert np.array_equal(ends, [[0, 3], [4, 7], [8, 11]]), "The left column should be grid[:, 0] and the right one grid[:, -1]."
</pre>
<pre class="py-solution">
ends = np.stack([grid[:, 0], grid[:, -1]], axis=1)
ends
</pre>

## Masks

Comparing an array gives you an array of `True` and `False`, one per element.

<pre class="py" data-show="temps _">
temps > 15
</pre>

That's called a mask, and you can use it to pick out exactly the elements you want.

<pre class="py">
temps[temps > 15]
</pre>

A mask made from one array can pick from another array of the same length. Here it picks the warm days.

<pre class="py">
days = np.arange(1, 8)
days[temps > 15]
</pre>

In a sum, `True` counts as 1 and `False` as 0. So the sum of a mask counts the elements that pass, and its mean is the fraction that pass.

<pre class="py">
print((temps > 15).sum())
print((temps > 15).mean())
</pre>

Or to change them.

<pre class="py" data-show="warm">
warm = temps.copy()
warm[warm &lt; 15] = 15
warm
</pre>

These are bank balances at the end of each month, and a negative one means the account was overdrawn. Make a copy called `shown` where every negative balance is replaced with 0, and leave `balances` itself alone.

<pre class="py" data-skip="true">
balances = np.array([120.0, -35.5, 80.0, -10.0, 240.0])
shown = balances.copy()
# your code here
shown
</pre>
<pre class="py-check">
assert np.array_equal(balances, [120.0, -35.5, 80.0, -10.0, 240.0]), "balances changed. Work on shown only."
assert np.array_equal(shown, [120.0, 0.0, 80.0, 0.0, 240.0]), "Make a mask of the negative entries and assign 0 through it."
</pre>
<pre class="py-solution">
balances = np.array([120.0, -35.5, 80.0, -10.0, 240.0])
shown = balances.copy()
shown[shown &lt; 0] = 0
shown
</pre>

## Adding things up

`sum`, `mean`, `max` and friends squash an array down. Here are the steps three friends walked over four days, one row per person.

<pre class="py">
steps = np.array([[8000, 12000, 6000, 10000],
                  [3000, 4000, 15000, 9000],
                  [11000, 9500, 10200, 13000]])
steps.sum()
</pre>

With `axis` they only squash one direction. `axis=0` goes down the columns, so you get one total per day.

<pre class="py" data-show="steps _">
steps.sum(axis=0)
</pre>

`axis=1` goes across the rows, so you get one total per person.

<pre class="py" data-show="steps _">
steps.sum(axis=1)
</pre>

`argmax` tells you where the biggest value is. Here, each person's best day.

<pre class="py">
steps.argmax(axis=1)
</pre>

`argmin` tells you where the smallest is, here each person's worst day. `np.argmin(x)` does the same as `x.argmin()`.

<pre class="py">
print(steps.argmin(axis=1))
print(np.argmin(temps))
</pre>

`np.diff` gives you the change from each element to the next.

<pre class="py">
np.diff(temps)
</pre>

Here's a week of temperatures. Find the day-to-day changes, then the day that came after the biggest drop. Count the days from 1, so the first day in the list is day 1.

<pre class="py" data-skip="true">
week = np.array([20, 14, 15, 13, 9, 10, 11])
changes = ...  # your code here
after_drop = ...  # your code here
changes, after_drop
</pre>
<pre class="py-check">
assert changes is not ... and after_drop is not ..., "Replace each ... with your code."
assert np.array_equal(changes, np.diff(week)), "np.diff(week) gives you the changes."
assert int(after_drop) == 2, f"You said day {after_drop}. The biggest drop is the most negative change, so use argmin. Change i leads from day i + 1 into day i + 2."
</pre>
<pre class="py-solution">
week = np.array([20, 14, 15, 13, 9, 10, 11])
changes = np.diff(week)
after_drop = changes.argmin() + 2
changes, after_drop
</pre>

<!-- lab:hardest_test -->

Each row of `scores` is a student and each column is a test. Using NumPy and no loops, print every student's average score, and then which test was the hardest, meaning the one with the lowest average across students. Count the tests from 1.

<pre class="py" data-lab="true">
scores = np.array([[72, 85, 60, 90],
                   [65, 78, 55, 88],
                   [80, 92, 70, 95]])
# your code here
</pre>
<pre class="py-solution">
import numpy as np
scores = np.array([[72, 85, 60, 90],
                   [65, 78, 55, 88],
                   [80, 92, 70, 95]])
print(scores.mean(axis=1))
print(scores.mean(axis=0).argmin() + 1)
</pre>
<pre class="py-rubric">
- Computes each student's average with NumPy along the right axis, with no Python loops.
- Finds the test with the lowest average across students with NumPy.
- Prints the student averages and the hardest test, counted from 1. Rounding and wording don't matter.
</pre>

<!-- /lab:hardest_test -->

<!-- lab:steps_report -->

Each row of `steps` is one friend and each column is one day. Using NumPy and no loops, print how many days each friend reached 10,000 steps or more, and then the name of the friend who did it most often.

<pre class="py" data-lab="true">
names = np.array(["Ada", "Alan", "Grace"])
steps = np.array([[8000, 12000, 6000, 10000],
                  [3000, 4000, 15000, 9000],
                  [11000, 9500, 10200, 13000]])
# your code here
</pre>
<pre class="py-solution">
import numpy as np
names = np.array(["Ada", "Alan", "Grace"])
steps = np.array([[8000, 12000, 6000, 10000],
                  [3000, 4000, 15000, 9000],
                  [11000, 9500, 10200, 13000]])
goal_days = (steps &gt;= 10000).sum(axis=1)
print(goal_days)
print(names[goal_days.argmax()])
</pre>
<pre class="py-rubric">
- Counts, for each friend, the days with 10,000 steps or more, using a comparison and a sum along the right axis, with no Python loops.
- Finds the friend with the highest count with NumPy and prints their name from names.
- The counts are 2, 1 and 3, and the friend is Grace. Wording doesn't matter.
</pre>

<!-- /lab:steps_report -->

## Why not just loop?

Well, you could do all of this with `for` loops, right? The thing is, loops in Python are slow, and NumPy hands the whole job to fast compiled code. So here's a little race, multiplying two arrays of 300,000 numbers element by element and adding everything up. `np.random.rand(n)` makes n random numbers between 0 and 1, and `time.time()` reads the clock in seconds, so the difference between two readings times the code in between.

<pre class="py">
import time
u = np.random.rand(300000)
v = np.random.rand(300000)
start = time.time()
total = 0.0
for i in range(len(u)):
    total = total + u[i] * v[i]
print(f"loop {(time.time() - start) * 1000:.0f} ms")
</pre>

<pre class="py">
start = time.time()
total_np = (u * v).sum()
print(f"numpy {(time.time() - start) * 1000:.2f} ms")
</pre>

## Broadcasting

So what happens when you combine arrays of different shapes? Well, NumPy stretches the smaller one to fit, which is called broadcasting. The simplest case is a single number.

<pre class="py">
grid + 100
</pre>

Here each row is a house and each column is a feature (size, rooms, age). `dtype=float` stores the numbers as decimals.

<pre class="py">
houses = np.array([[50, 1, 30],
                   [80, 2, 12],
                   [120, 3, 5],
                   [200, 4, 1]], dtype=float)
column_means = houses.mean(axis=0)
column_means
</pre>

`column_means` has one number per column. Subtracting it from the 4 by 3 table copies it onto every row, so every house gets compared with the average house.

<pre class="py" data-show="houses column_means _">
houses - column_means
</pre>

To work per row instead, keep the squashed direction with `keepdims=True`. Then you get a 4 by 1 column, which gets copied across.

<pre class="py">
row_totals = houses.sum(axis=1, keepdims=True)
row_totals.shape
</pre>

Here's what three people spent in a month on rent, food, transport and fun. Turn every row into percentages of that person's total, so each row adds up to 100. `.round(1)` on the last line rounds every entry to one decimal, just for showing.

<pre class="py" data-skip="true">
spending = np.array([[800, 300, 100, 200],
                     [600, 250, 50, 100],
                     [1000, 500, 200, 300]], dtype=float)
shares = ...  # your code here
shares.round(1)
</pre>
<pre class="py-check">
assert shares is not ..., "Replace the ... with your code."
assert np.shape(shares) == (3, 4), "shares should have the same shape as spending."
assert np.allclose(shares.sum(axis=1), 100), "Each row should add up to 100. Divide by the row totals with keepdims=True, then multiply by 100."
assert np.isclose(shares[0, 0], 57.142857), "The first person's rent share looks off."
</pre>
<pre class="py-solution">
spending = np.array([[800, 300, 100, 200],
                     [600, 250, 50, 100],
                     [1000, 500, 200, 300]], dtype=float)
shares = spending / spending.sum(axis=1, keepdims=True) * 100
shares.round(1)
</pre>

## The rank 1 trap

Now the flip side is that broadcasting is also where the strangest bugs come from. An array with shape `(3,)` is neither a row nor a column, and transposing it with `.T` does nothing.

<pre class="py">
r = np.array([1, 2, 3])
print(r.shape)
print(r.T.shape)
</pre>

A real column has shape `(3, 1)`.

<pre class="py">
col = r.reshape(3, 1)
print(col.shape)
print(col.T.shape)
</pre>

Now watch what happens when we add them.

<pre class="py" data-show="col r _">
col + r
</pre>

So we added two things that both look like three numbers and got a 3 by 3 table, and not even an error. The fix is a bit boring but it works. Keep your shapes explicit with `reshape`, and check them with `assert` when you're not sure.

<pre class="py">
assert (col + r.reshape(3, 1)).shape == (3, 1)
"shapes ok"
</pre>

Used on purpose, though, a column against a row is handy, because it gives you every combination at once. Build the 10 by 10 multiplication table this way, with no loop. The top left entry is 1 times 1 and the bottom right is 10 times 10, so `table[2, 4]` is 3 times 5.

<pre class="py" data-skip="true">
table = ...  # your code here
table
</pre>
<pre class="py-check">
assert table is not ..., "Replace the ... with your code."
assert np.shape(table) == (10, 10), f"Got shape {np.shape(table)}. A column of 1 to 10 times a row of 1 to 10 gives 10 by 10."
assert table[6, 7] == 56 and table[0, 0] == 1 and table[9, 9] == 100, "table[i, j] should be (i + 1) * (j + 1)."
</pre>
<pre class="py-solution">
numbers = np.arange(1, 11)
table = numbers.reshape(10, 1) * numbers
table
</pre>

## Multiplying tables

`@` multiplies two arrays number by number and adds up the results. Say a shop sells bread, milk and eggs, and you bought 2, 1 and 12 of them.

<pre class="py" data-show="prices bought _">
prices = np.array([2.2, 1.1, 0.25])
bought = np.array([2, 1, 12])
bought @ prices
</pre>

That's each amount times its price, all added up. With one row per shopping trip, `@` gives you the cost of every trip at once.

<pre class="py">
trips = np.array([[2, 1, 12],
                  [0, 2, 6],
                  [1, 0, 0]])
trips @ prices
</pre>

Now there are two shops, with one row of prices per shop. Work out what each of these five trips would cost at each shop, as a 5 by 2 table with one row per trip and one column per shop. `.T` flips a table so its rows become columns.

<pre class="py" data-skip="true">
shop_prices = np.array([[2.2, 1.1, 0.25],
                        [1.9, 1.3, 0.30]])
week = np.array([[2, 1, 12], [0, 2, 6], [1, 0, 0], [3, 3, 0], [0, 0, 24]])
costs = ...  # your code here
costs
</pre>
<pre class="py-check">
assert costs is not ..., "Replace the ... with your code."
assert np.shape(costs) == (5, 2), f"Got shape {np.shape(costs)}. week is 5 by 3 and shop_prices is 2 by 3, so you want week @ shop_prices.T."
assert np.allclose(costs, week @ shop_prices.T), "Each row should be one trip, priced at the first shop and then the second."
</pre>
<pre class="py-solution">
shop_prices = np.array([[2.2, 1.1, 0.25],
                        [1.9, 1.3, 0.30]])
week = np.array([[2, 1, 12], [0, 2, 6], [1, 0, 0], [3, 3, 0], [0, 0, 24]])
costs = week @ shop_prices.T
costs
</pre>

## Randomness

NumPy's random generator takes a seed, and the same seed gives the same numbers every time. `integers(low, high, size=n)` gives n whole numbers from low up to, but not including, high.

<pre class="py">
rng = np.random.default_rng(0)
rng.integers(1, 7, size=10)
</pre>

`permutation` shuffles, and `normal` draws from the bell curve.

<pre class="py">
print(rng.permutation(6))
print(rng.normal(size=3))
</pre>

Fifty raffle tickets are in a drum, numbered 1 to 50. Shuffle them with `rng.permutation`, then the first 10 are winners and the other 40 are not.

<pre class="py" data-skip="true">
tickets = np.arange(1, 51)
rng = np.random.default_rng(0)
# your code here
winners = ...
others = ...
winners.shape, others.shape
</pre>
<pre class="py-check">
assert winners is not ..., "Replace the ... with your code."
assert winners.shape == (10,) and others.shape == (40,), "10 winners and 40 others."
assert sorted(set(winners) | set(others)) == list(range(1, 51)), "Every ticket should end up in exactly one of the two groups."
assert not np.array_equal(winners, np.arange(1, 11)), "Shuffle before you split."
</pre>
<pre class="py-solution">
tickets = np.arange(1, 51)
rng = np.random.default_rng(0)
shuffled = rng.permutation(tickets)
winners = shuffled[:10]
others = shuffled[10:]
winners.shape, others.shape
</pre>

## Plotting

Most things are a lot easier to understand as a picture, and matplotlib is how we'll draw them. Any figure you make shows up under the box.

<pre class="py">
import matplotlib.pyplot as plt
plt.plot(temps)
</pre>

Give it x values as well, and labels, so the picture explains itself. `figsize` sets the width and height in inches, and `marker="o"` draws a dot at each point.

<pre class="py">
days = np.arange(1, 8)
plt.figure(figsize=(5, 3))
plt.plot(days, temps, marker="o")
plt.xlabel("day")
plt.ylabel("highest temperature")
</pre>

`plt.subplots` gives you a grid of plots to fill in one by one, and its first two numbers are rows and columns. Each plot has its own methods, so `plt.xlabel` becomes `ax.set_xlabel` and a title is `ax.set_title`. Here's a histogram of 2,000 throws of two dice next to a scatter plot.

<pre class="py">
rng = np.random.default_rng(0)
throws = rng.integers(1, 7, size=2000) + rng.integers(1, 7, size=2000)
fig, axes = plt.subplots(1, 2, figsize=(8, 3))
axes[0].hist(throws, bins=np.arange(1.5, 13.5))
axes[0].set_title("sum of two dice")
xs = rng.uniform(0, 10, 100)
axes[1].scatter(xs, 2 * xs + rng.normal(0, 2, 100), s=8)
axes[1].set_title("a noisy line")
</pre>

`bins` sets the edges of the bars and `s` sets the size of the dots. `rng.uniform(a, b, n)` draws n numbers spread evenly between a and b, and `rng.normal(mean, spread, n)` draws n from a bell curve.

Temperature and rain over the same week are easier to compare when they're stacked one above the other, sharing the days along the bottom. Change this figure so the two plots are stacked vertically instead of side by side, with the same x axis. `ax.bar` draws bars, and `sharex=True` in `plt.subplots` makes the plots share one x axis.

<pre class="py" data-skip="true">
rain = np.array([0, 2.5, 8.0, 0, 0, 1.2, 4.4])
fig, axes = plt.subplots(1, 2, figsize=(8, 3))
axes[0].plot(days, temps)
axes[0].set_ylabel("temperature")
axes[1].bar(days, rain)
axes[1].set_ylabel("rain")
axes[1].set_xlabel("day")
</pre>
<pre class="py-check">
assert len(fig.axes) == 2, "Keep exactly two plots."
top, bottom = fig.axes[0].get_position(), fig.axes[1].get_position()
assert top.y0 > bottom.y0 and abs(top.x0 - bottom.x0) &lt; 1e-6, "The first plot should sit directly above the second. Try plt.subplots(2, 1)."
assert fig.axes[0].get_shared_x_axes().joined(fig.axes[0], fig.axes[1]), "Pass sharex=True so both plots use the same days."
</pre>
<pre class="py-solution">
rain = np.array([0, 2.5, 8.0, 0, 0, 1.2, 4.4])
fig, axes = plt.subplots(2, 1, figsize=(6, 4), sharex=True)
axes[0].plot(days, temps)
axes[0].set_ylabel("temperature")
axes[1].bar(days, rain)
axes[1].set_ylabel("rain")
axes[1].set_xlabel("day")
</pre>

matplotlib picks the axis range for you, and it doesn't always pick well. This plot of a savings account makes the growth look bigger than it is, because the y axis doesn't start at 0. Set it to run from 0 to 10% above the highest value. `plt.subplots()` without the two numbers gives you a single plot, and `ax.set_ylim(bottom, top)` sets the range of the y axis.

<pre class="py" data-skip="true">
years = np.arange(0, 11)
money = 1000 * 1.05 ** years
fig, ax = plt.subplots(figsize=(5, 3))
ax.plot(years, money)
# your code here
</pre>
<pre class="py-check">
low, high = ax.get_ylim()
assert np.isclose(low, 0), f"The y axis starts at {low:.0f}. ax.set_ylim(bottom, top) sets both ends."
assert np.isclose(high, money.max() * 1.1), f"The top is {high:.0f}. Use money.max() * 1.1."
</pre>
<pre class="py-solution">
years = np.arange(0, 11)
money = 1000 * 1.05 ** years
fig, ax = plt.subplots(figsize=(5, 3))
ax.plot(years, money)
ax.set_ylim(0, money.max() * 1.1)
</pre>

## Pictures are arrays too

This file holds 1,797 tiny handwritten digits from the [UCI digits dataset](https://archive.ics.uci.edu/dataset/80/optical+recognition+of+handwritten+digits). Each one is an 8 by 8 grid of numbers, one per pixel, from 0 for white to 16 for black. `np.load` opens it, and you pick each array out by name, like in a dictionary.

<pre class="py" data-files="digits.npz">
data = np.load("digits.npz")
images = data["images"]
labels = data["labels"]
print(images.shape)
print(labels.shape)
images[0]
</pre>

If you squint at those numbers a bit, you can see a 0. `imshow` draws an array as a picture, and `cmap="gray_r"` draws small numbers light and big ones dark.

<pre class="py">
plt.figure(figsize=(2, 2))
plt.imshow(images[0], cmap="gray_r")
</pre>

Here are the first eight, with what each one is meant to be. `zip` works with three lists as well, and `ax.axis("off")` hides the axes.

<pre class="py">
fig, axes = plt.subplots(1, 8, figsize=(8, 1.4))
for ax, img, label in zip(axes, images, labels):
    ax.imshow(img, cmap="gray_r")
    ax.set_title(label)
    ax.axis("off")
</pre>

What does the average 3 look like? Compute `means`, which holds the average picture of each digit from 0 to 9, and draw all ten in a row.

<pre class="py" data-skip="true">
means = np.zeros((10, 8, 8))
# your code here
fig, axes = plt.subplots(1, 10, figsize=(10, 1.4))
for d, ax in enumerate(axes):
    ax.imshow(means[d], cmap="gray_r")
    ax.axis("off")
</pre>
<pre class="py-check">
expected = np.stack([images[labels == d].mean(axis=0) for d in range(10)])
assert means.shape == (10, 8, 8), "means should be 10 pictures of 8 by 8."
assert np.allclose(means, expected), "means[d] is images[labels == d].mean(axis=0)."
</pre>
<pre class="py-solution">
means = np.zeros((10, 8, 8))
for d in range(10):
    means[d] = images[labels == d].mean(axis=0)
fig, axes = plt.subplots(1, 10, figsize=(10, 1.4))
for d, ax in enumerate(axes):
    ax.imshow(means[d], cmap="gray_r")
    ax.axis("off")
</pre>

## Tables with pandas

When your data is a table with named columns, pandas is pretty much the tool. Here's the classic [iris dataset](https://archive.ics.uci.edu/dataset/53/iris), 150 flowers from three species with four measurements each.

<pre class="py" data-files="iris.csv">
import pandas as pd
df = pd.read_csv("iris.csv")
df.head()
</pre>

`shape` and `describe` give you a quick overview.

<pre class="py">
print(df.shape)
df.describe().round(2)
</pre>

You pick a column by its name, and `value_counts` counts how often each value shows up.

<pre class="py">
df["species"].value_counts()
</pre>

Filtering rows works with a mask, just like NumPy.

<pre class="py">
df[df["petal_length"] > 6]
</pre>

There are two ways to pick rows by number. `iloc` counts positions like a list, starting at 0, and leaves out the end. `loc` uses the row labels, which here happen to be the same numbers, and it includes the end. That difference catches out pretty much everyone at some point.

<pre class="py">
print(len(df.iloc[0:3]))
print(len(df.loc[0:3]))
</pre>

A new column is one line.

<pre class="py">
df["petal_area"] = df["petal_length"] * df["petal_width"]
df.head(3)
</pre>

`groupby` splits the table into groups, does something to each one, and puts the results back together.

<pre class="py">
df.groupby("species")["petal_area"].mean()
</pre>

Plotting one group at a time gives each species its own color. Looping over `df.groupby("species")` hands you each species name together with its rows, as a smaller table. `label=` names a set of dots, and `ax.legend()` shows the names.

<pre class="py">
fig, ax = plt.subplots(figsize=(5, 3.5))
for name, group in df.groupby("species"):
    ax.scatter(group["petal_length"], group["petal_width"], label=name, s=12)
ax.set_xlabel("petal length")
ax.set_ylabel("petal width")
ax.legend()
</pre>

Saving goes the other way, with `to_csv`. Save only the setosa flowers to a file called `setosa.csv`, without the row labels. Passing `index=False` to `to_csv` leaves them out.

<pre class="py" data-skip="true">
# your code here
pd.read_csv("setosa.csv").shape
</pre>
<pre class="py-check">
saved = pd.read_csv("setosa.csv")
assert len(saved) == 50, f"The file has {len(saved)} rows. Filter for species == 'setosa' before saving."
assert set(saved["species"]) == {"setosa"}, "Only setosa rows should be in the file."
assert "Unnamed: 0" not in saved.columns, "Pass index=False so the row labels don't end up as an extra column."
</pre>
<pre class="py-solution">
df[df["species"] == "setosa"].to_csv("setosa.csv", index=False)
pd.read_csv("setosa.csv").shape
</pre>

<!-- lab:iris_report -->

Using pandas, print the average petal length of each iris species, and then, for each species, how many of its flowers have a petal longer than 5.

<pre class="py" data-lab="true" data-files="iris.csv">
# your code here
</pre>
<pre class="py-solution">
import pandas as pd
df = pd.read_csv("iris.csv")
print(df.groupby("species")["petal_length"].mean())
df["long_petal"] = df["petal_length"] &gt; 5
print(df.groupby("species")["long_petal"].sum())
</pre>
<pre class="py-rubric">
- Uses pandas to group the flowers by species.
- Prints each species' average petal length, about 1.46, 4.26 and 5.55.
- Prints, for each species, how many flowers have petal_length strictly above 5, which is 0, 1 and 41. Every species should appear, including ones with 0.
</pre>

<!-- /lab:iris_report -->

## Five years of weather

Real data rarely comes in one nice file, though. These five files are five made-up years of weather from one city, with each day's high and low temperature and how much it rained.

<pre class="py" data-files="weather_2020.csv weather_2021.csv weather_2022.csv weather_2023.csv weather_2024.csv">
w = pd.read_csv("weather_2020.csv")
w.head()
</pre>

<pre class="py">
fig, ax = plt.subplots(figsize=(6, 3))
ax.plot(w["day"], w["high"], label="high")
ax.plot(w["day"], w["low"], label="low")
ax.set_xlabel("day of the year")
ax.legend()
</pre>

`glob` finds every file whose name matches a pattern, where `*` stands for "anything".

<pre class="py">
import glob
files = sorted(glob.glob("weather_*.csv"))
files
</pre>

Combine that with a loop and that's basically how you go through a whole folder.

<pre class="py">
for f in files:
    year = pd.read_csv(f)
    print(f)
    print("total rain")
    print(year["rain_mm"].sum().round())
</pre>

Plot the daily high of all five years on one set of axes, with each file's name as its label.

<pre class="py" data-skip="true">
fig, ax = plt.subplots(figsize=(6, 3.5))
for f in files:
    ...  # your code here
ax.set_xlabel("day of the year")
ax.legend()
</pre>
<pre class="py-check">
assert len(ax.get_lines()) == 5, f"There are {len(ax.get_lines())} lines on the plot. Read each file and call ax.plot once per year."
assert sorted(l.get_label() for l in ax.get_lines()) == files, "Pass label=f to ax.plot so the legend shows the file names."
</pre>
<pre class="py-solution">
fig, ax = plt.subplots(figsize=(6, 3.5))
for f in files:
    year = pd.read_csv(f)
    ax.plot(year["day"], year["high"], label=f)
ax.set_xlabel("day of the year")
ax.legend()
</pre>

Now the useful picture. Stack the five years of daily highs into one 5 by 365 array, one row per year, then plot the average year with a shaded band one standard deviation either side. `fill_between` shades the area between two curves, and `alpha` sets how see-through it is. `.std(axis=0)` gives the standard deviation, the typical distance from the mean.

<pre class="py" data-skip="true">
highs = ...  # shape (5, 365)
mean = ...  # one number per day
std = ...  # one number per day
day = np.arange(1, 366)
fig, ax = plt.subplots(figsize=(6, 3))
ax.plot(day, mean, label="average of 5 years")
ax.fill_between(day, mean - std, mean + std, alpha=0.3)
ax.set_xlabel("day of the year")
ax.legend()
</pre>
<pre class="py-check">
expected = np.stack([pd.read_csv(f)["high"].to_numpy() for f in files])
assert highs is not ..., "Replace the ... with your code."
assert np.shape(highs) == (5, 365), f"highs has shape {np.shape(highs)}. np.stack a list of the five high columns."
assert np.allclose(np.sort(highs, axis=0), np.sort(expected, axis=0)), "highs should hold the high column of every year."
assert np.allclose(mean, expected.mean(axis=0)), "Take the mean across years, so axis=0, leaving one number per day."
assert np.allclose(std, expected.std(axis=0)), "Same for the standard deviation, axis=0."
</pre>
<pre class="py-solution">
highs = np.stack([pd.read_csv(f)["high"] for f in files])
mean = highs.mean(axis=0)
std = highs.std(axis=0)
day = np.arange(1, 366)
fig, ax = plt.subplots(figsize=(6, 3))
ax.plot(day, mean, label="average of 5 years")
ax.fill_between(day, mean - std, mean + std, alpha=0.3)
ax.set_xlabel("day of the year")
ax.legend()
</pre>

So the line is what a typical year looks like, and the band shows how much one year tends to differ from another. You'll see plots drawn exactly like this all through the course, so it's worth getting used to them.

<!-- lab:rainiest_year -->

Using the five weather files from above, find which year had the most rainy days, meaning days with more than 0 mm of rain, and print the year and how many rainy days it had.

<pre class="py" data-lab="true" data-files="weather_2020.csv weather_2021.csv weather_2022.csv weather_2023.csv weather_2024.csv">
# your code here
</pre>
<pre class="py-solution">
import glob
import pandas as pd
best_file = None
best_count = -1
for f in sorted(glob.glob("weather_*.csv")):
    rainy = (pd.read_csv(f)["rain_mm"] &gt; 0).sum()
    if rainy &gt; best_count:
        best_file = f
        best_count = rainy
print(best_file, best_count)
</pre>
<pre class="py-rubric">
- Reads all five weather files, by loop or glob.
- Counts the days with rain_mm above 0 in each file.
- Prints the year (or file name) with the most rainy days and its count, found by comparing the counts rather than typed in.
</pre>

<!-- /lab:rainiest_year -->

<!-- lab:biggest_range_day -->

In the 2020 weather file, find the day with the biggest difference between its high and its low temperature, and print that day and the difference. If several days tie, any one of them is fine.

<pre class="py" data-lab="true" data-files="weather_2020.csv">
# your code here
</pre>
<pre class="py-solution">
import pandas as pd
w = pd.read_csv("weather_2020.csv")
w["range"] = w["high"] - w["low"]
biggest = w["range"].max()
widest = w[w["range"] == biggest]
print(widest["day"].min(), biggest)
</pre>
<pre class="py-rubric">
- Reads weather_2020.csv and computes high minus low for every day.
- Finds the day with the largest difference from the data rather than typing it in.
- Prints a day with the largest difference and that difference, 11.0. Days 102, 186 and 220 tie, so any of them is right. Wording and rounding don't matter.
</pre>

<!-- /lab:biggest_range_day -->

## Reading handwriting

Let's put it all together. Can a computer read a handwritten digit just by comparing it with digits it already has names for? To read a new picture, find the stored picture that looks most like it and copy its name. "Looks like" here means the smallest sum of squared differences between the pixels.

First, flatten every 8 by 8 picture into one row of 64 numbers. A `-1` in `reshape` means whatever size makes it fit, and `.astype(float)` turns the numbers into decimals. Then split them into the 1,500 we keep with their names and the 297 we'll try to read.

<pre class="py">
X = images.reshape(len(images), -1).astype(float)
known = X[:1500]
known_names = labels[:1500]
unread = X[1500:]
true_names = labels[1500:]
known.shape, unread.shape
</pre>

Fill in `distances`, the distance from `x` to every known picture at once. Broadcasting does most of the work.

<pre class="py" data-skip="true">
def read_digit(x):
    distances = ...  # your code here
    return known_names[np.argmin(distances)]
guesses = np.array([read_digit(x) for x in unread])
fraction_right = (guesses == true_names).mean()
fraction_right
</pre>
<pre class="py-check">
assert fraction_right > 0.9, f"Only {fraction_right:.2f} right. known - x gives one row of differences per known picture. Square them and sum along axis=1."
</pre>
<pre class="py-solution">
def read_digit(x):
    distances = ((known - x) ** 2).sum(axis=1)
    return known_names[np.argmin(distances)]
guesses = np.array([read_digit(x) for x in unread])
fraction_right = (guesses == true_names).mean()
fraction_right
</pre>

So about 95 out of every 100, with nothing but comparing pictures, which is not bad at all. Keep that number in mind, because later in the course we'll build much cleverer methods, and they'll have to beat this one to be worth it.

<p class="credit">Several exercises on this page are adapted from Software Carpentry's <a href="https://swcarpentry.github.io/python-novice-inflammation/">Programming with Python</a> and <a href="https://swcarpentry.github.io/python-novice-gapminder/">Plotting and Programming in Python</a>, &copy; <a href="https://carpentries.org/">The Carpentries</a>, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>, and rewritten for this course. The digits and iris data come from the UCI Machine Learning Repository under CC BY 4.0, and the weather is made up.</p>

<nav class="lesson-nav">
  <a class="prev" href="/course/lecture-0/basics/">&larr; Python Basics</a>
  <a class="next" href="/course/lecture-0/oop/">Objects and Classes &rarr;</a>
</nav>

<script src="/course/assets/course.js"></script>
<script src="/course/assets/python-cells.js" data-traces="/course/assets/traces/data.json"></script>
