---
layout: page
title: "Python Basics"
permalink: /course/lecture-0/basics/
---

<link rel="stylesheet" href="/course/assets/course.css">

As they say, mathematics is not a spectator sport. And neither is programming. So we will start with a relatively thorough, exercise-heavy Python course, in three parts. This first one is the language itself, the second one is about data (NumPy, pandas and plotting), and the third is objects and classes. If you already write Python, skim this part and maybe do the exercises.

Every box on this page is real Python running in your browser. Change the code, hit Run (or Shift+Enter), break things, and use the arrow to get the original back. The first run takes a few seconds while Python downloads, and after that it's instant. Boxes with an orange edge are exercises. Replace each `...` with your own code. Running one checks your answer. If it isn't right yet, Hint tells you what's off, and the light bulb shows a solution if you're stuck. Boxes with a blue edge are labs, small problems you solve however you like. Work with the names the box gives you rather than typing their numbers in, so your code would still be right if the numbers changed. Check asks a grader whether your code does what the lab asks, and if it doesn't, Hint tells you what's off. Some boxes also draw what the code is doing as it runs, the way a debugger would. You can play around with them to check what each line does and the first one is just below.

## Numbers, names and types

So let's start with arithmetic, which Python does pretty much the way you'd expect. `//` divides and throws away the remainder, `%` gives you only the remainder, and `**` is a power.

<pre class="py">
print(7 / 2)
print(7 // 2)
print(7 % 2)
print(2 ** 10)
</pre>

`=` gives a value a name. The right side gets worked out first, so a name can even update itself. The last line of a box gets shown automatically.

<pre class="py" data-show="price cups _">
price = 4.50
cups = 3
cups = cups + 1
price * cups
</pre>

This box plays itself. The highlighted line is the one that's running, and underneath you can see what each name holds right after it, so you can actually watch `cups` go from 3 to 4. Now if you want to go through it yourself, hit Pause, then step one line back or forward with the arrows, or just drag the bar to wherever you want. Play carries on from where you left off, and Run is the quick way, it runs everything and shows you where the code ends up. 

And if you want to see them all at once, put several names on the last line, separated by commas.

<pre class="py">
price, cups
</pre>

Now every value has a type, mainly `int`, `float` and `str`, and you convert between them by calling the type like a function. `+` between two strings glues them into one. Mixing an `int` with a `float` gives a `float`, and `int` chops off decimals rather than rounding.

<pre class="py">
print(type(3))
print(type(3.0))
print(type("3"))
print(int("42") + 1)
print(str(7) + " cups")
print(3 + 4.0)
print(int(3.9))
print(round(3.9))
</pre>

Which of these five come out as the float `2.0`, and which as the int `2`? List the names of the floats. Write them as a list, each name in quotes, inside square brackets and separated by commas, like `["a", "c"]`.

<pre class="py" data-skip="true">
a = 4 / 2
b = 4 // 2
c = int(2.7)
d = float("2")
e = 1.0 * 2
floats = ...  # for example ["a", "c"]
</pre>
<pre class="py-check">
assert floats is not ..., "Write your answer in place of the ... first."
assert sorted(floats) == ["a", "d", "e"], f"You said {sorted(floats)}. Plain / always gives a float, // between ints gives an int, and int() chops off the decimals."
</pre>
<pre class="py-solution">
a = 4 / 2
b = 4 // 2
c = int(2.7)
d = float("2")
e = 1.0 * 2
floats = ["a", "d", "e"]
</pre>

## Text

Text in Python is called a string, and you write it between quotes. `len` tells you how many characters it has.

<pre class="py">
fruit = "watermelon"
len(fruit)
</pre>

Every character has a position, called its index. Python counts positions from 0 (yes, 0, you'll get used to it), so the first character is `fruit[0]` and the second is `fruit[1]`.

<pre class="py" data-show="fruit">
print(fruit[0])
print(fruit[1])
print(fruit[9])
</pre>

Negative positions count from the end. `fruit[-1]` is the last character, `fruit[-2]` is the one before it, and so on.

<pre class="py">
print(fruit[-1])
print(fruit[-2])
</pre>

Asking for a position that doesn't exist is an error. "watermelon" has 10 characters, so the last position is 9.

<pre class="py" data-skip="true">
fruit[10]
</pre>

Strings also come with methods, which are basically functions that belong to the string and are written after a dot. They hand you back a new string and leave the original alone.

<pre class="py">
print(fruit.upper())
print("SHOUTING".lower())
print(fruit.replace("water", "musk"))
print(fruit)
</pre>

`split` breaks a string into a list of words. A list is a row of values in square brackets, and we'll get to them properly in their own section further down.

<pre class="py">
words = "the quick brown fox".split()
words
</pre>

`join` goes the other way. It glues a list of words back into one string, with whatever you call it on placed in between.

<pre class="py">
print(" ".join(words))
print("-".join(words))
</pre>

Slicing takes out a piece instead of a single character. `fruit[0:5]` starts at position 0 and stops just before position 5, so you get positions 0 to 4.

<pre class="py">
fruit[0:5]
</pre>

Leave out the start and the slice begins at the beginning. Leave out the stop and it runs to the end.

<pre class="py">
print(fruit[:5])
print(fruit[5:])
</pre>

Negative positions work in slices too, so `fruit[-3:]` is the last three characters.

<pre class="py">
fruit[-3:]
</pre>

A third number is the step. A step of 2 takes every other character, and a step of -1 walks backwards, which reverses the whole string.

<pre class="py">
print(fruit[::2])
print(fruit[::-1])
</pre>

Pull the year and the file extension out of this photo's name. Use negative positions, so it would still work if the part at the front were longer.

<pre class="py" data-skip="true">
name = "summer_holiday_beach_2024.jpg"
year = ...  # "2024"
extension = ...  # ".jpg"
year, extension
</pre>
<pre class="py-check">
assert year is not ... and extension is not ..., "Replace each ... with your code."
assert extension == ".jpg", "The extension is the last four characters, name[-4:]."
assert year == "2024", f"Got {year!r}. The year sits just before the extension, so it starts eight from the end and stops four from the end."
</pre>
<pre class="py-solution">
name = "summer_holiday_beach_2024.jpg"
year = name[-8:-4]
extension = name[-4:]
year, extension
</pre>

An f-string drops values straight into text. Put an `f` in front of the quotes and the names inside curly brackets.

<pre class="py">
item = "coffee"
cost = 4.5
f"one {item} costs {cost}"
</pre>

The curly brackets can hold any expression, not just a name, and you can format numbers on the way in. `:.2f` means two digits after the point.

<pre class="py">
f"three {item}s cost {cost * 3:.2f}"
</pre>

Build a receipt line that comes out exactly as `3 x coffee | 13.50`.

<pre class="py" data-skip="true">
qty = 3
item = "coffee"
cost = 4.5
line = ...  # your code here
line
</pre>
<pre class="py-check">
assert line is not ..., "Replace the ... with your code."
assert "13.50" in str(line), f"Got {line!r}. The price needs two decimals, 13.50, so put :.2f after qty * cost inside its curly brackets."
assert line == "3 x coffee | 13.50", f"Got {line!r}, but it should be '3 x coffee | 13.50'. Text you write around the curly brackets stays in the string, so put qty, item and the price each in their own brackets, with the x and the | typed in between."
</pre>
<pre class="py-solution">
qty = 3
item = "coffee"
cost = 4.5
line = f"{qty} x {item} | {qty * cost:.2f}"
line
</pre>

## True or false

Comparisons give you `True` or `False`. `==` asks whether two things are equal, since a single `=` already means "give this a name", and `!=` asks whether they're different.

<pre class="py">
temperature = 23
print(temperature > 20)
print(temperature == 30)
print(temperature != 30)
</pre>

You can combine comparisons with `and`, `or` and `not`. Python also lets you chain them, which is handy, so `15 <= temperature <= 25` means "between 15 and 25".

<pre class="py">
print(temperature > 20 and temperature &lt; 25)
print(temperature > 30 or temperature &lt; 0)
print(not temperature > 20)
print(15 &lt;= temperature &lt;= 25)
</pre>

`if` runs some lines only when a condition is true. The lines that belong to it are indented underneath. Indentation is not decoration in Python, it's how Python knows which lines belong to the `if`.

<pre class="py">
if temperature > 20:
    print("t-shirt weather")
print("this line always runs")
</pre>

`else` gives the other path, and `elif`, short for "else if", adds more paths in between. Python checks them from the top and runs only the first one that's true.

<pre class="py">
if temperature > 25:
    print("hot")
elif temperature > 15:
    print("nice")
else:
    print("bring a jacket")
</pre>

`if` doesn't strictly need `True` or `False`, it works with any value. `bool` shows you how Python treats one. Zero, empty text, an empty list and `None`, which is Python's word for nothing, all count as false. Pretty much everything else counts as true.

<pre class="py">
print(bool(0))
print(bool(""))
print(bool([]))
print(bool(None))
print(bool(3))
print(bool("hi"))
</pre>

So that's why you'll see `if basket:` used to mean "if the basket isn't empty".

<pre class="py">
basket = []
if not basket:
    print("nothing to pay for")
</pre>

<!-- lab:picnic_cars -->

27 people are driving to a picnic, and each car takes 4. Work out how many cars are completely full, how many people are left over after filling them, and how many cars you need in total, then print all three. Use people and seats rather than 27 and 4, so it works for any group.

<pre class="py" data-lab="true">
people = 27
seats = 4
# your code here
</pre>
<pre class="py-solution">
people = 27
seats = 4
full = people // seats
left_over = people % seats
cars = full
if left_over &gt; 0:
    cars = cars + 1
print(full)
print(left_over)
print(cars)
</pre>
<pre class="py-rubric">
- Works the three numbers out from people and seats rather than typing them in.
- Full cars is the whole number of times 4 fits into 27, which is 6.
- People left over is the remainder, which is 3.
- Cars needed in total rounds up, so one more car whenever someone is left over, which is 7.
- Prints all three. Wording doesn't matter.
</pre>

<!-- /lab:picnic_cars -->

## Lists

A list holds several values in order, between square brackets and separated by commas. Here are the highest temperatures of one week, Monday to Sunday, which we'll keep using for a while.

<pre class="py">
temps = [12, 15, 14, 18, 21, 19, 16]
len(temps)
</pre>

Indexing and slicing work exactly the way they do on strings, so nothing new there. Position 0 is Monday.

<pre class="py">
print(temps[0])
print(temps[-1])
print(temps[1:4])
</pre>

Python has built-in functions for the usual questions about a list of numbers.

<pre class="py">
print(min(temps))
print(max(temps))
print(sum(temps))
print(sum(temps) / len(temps))
</pre>

`min` and `max` also work on separate numbers.

<pre class="py">
max(3, 7)
</pre>

Unlike strings, though, lists can be changed. `append` adds a value to the end, and you can replace a value by giving its position a new one.

<pre class="py" data-show="shopping">
shopping = ["milk", "eggs"]
shopping.append("bread")
shopping[0] = "oat milk"
shopping
</pre>

`in` asks whether a value is in a list, and `remove` takes the first copy of a value out.

<pre class="py">
print("eggs" in shopping)
shopping.remove("eggs")
print("eggs" in shopping)
print(shopping)
</pre>

`sorted` gives you a new, sorted list and leaves the old one alone.

<pre class="py">
nums = [3, 1, 2]
print(sorted(nums))
print(nums)
</pre>

The method `.sort()` sorts the list itself instead, and gives back `None`. So writing `result = nums.sort()` is a classic bug, because `result` ends up as `None`.

<pre class="py" data-show="nums result">
result = nums.sort()
print(result)
print(nums)
</pre>

One thing that trips up everyone at least once. A name is just a label stuck on a value, so `b = a` doesn't copy a list. It sticks a second label on the same list, and changing one changes the other.

<pre class="py" data-show="a b">
a = [1, 2, 3]
b = a
b.append(4)
a
</pre>

So if you want a separate list, you have to ask for a copy.

<pre class="py" data-show="a c">
c = a.copy()
c.append(5)
print(a)
print(c)
</pre>

<!-- lab:judges_score -->

In a diving contest five judges each give a score. So that one generous or harsh judge can't decide things alone, the highest and the lowest score are dropped and the other three are averaged. Print the two dropped scores, then the final score.

<pre class="py" data-lab="true">
scores = [8.5, 9.0, 6.0, 9.5, 8.0]
# your code here
</pre>
<pre class="py-solution">
scores = [8.5, 9.0, 6.0, 9.5, 8.0]
ranked = sorted(scores)
lowest = ranked[0]
highest = ranked[-1]
kept = ranked[1:-1]
final = sum(kept) / len(kept)
print(lowest)
print(highest)
print(final)
</pre>
<pre class="py-rubric">
- Finds the highest and lowest score from the list rather than typing them in.
- Drops exactly one highest and one lowest score and averages the remaining three, giving 8.5.
- Prints the two dropped scores, 6.0 and 9.5, and the final score. Wording, order and rounding don't matter.
</pre>

<!-- /lab:judges_score -->

## Loops

A `for` loop runs the same lines once for every value in a list, which saves you a lot of copy and paste. The indented lines underneath are the body of the loop, and `t` takes each value in turn.

<pre class="py" data-show="temps t">
for t in temps:
    print(t)
</pre>

`range(n)` gives you the numbers from 0 up to, but not including, n. It's handy when you just want to repeat something a few times.

<pre class="py">
for i in range(3):
    print("hello", i)
</pre>

Give `range` two numbers and it starts at the first one instead of 0.

<pre class="py">
for i in range(2, 5):
    print(i)
</pre>

A third number is the step, like in a slice.

<pre class="py">
for i in range(0, 10, 3):
    print(i)
</pre>

`list(...)` builds a list out of anything you can loop over. Called on a list, it makes a copy.

<pre class="py">
print(list(range(5)))
print(list("abc"))
</pre>

`enumerate` hands you each position along with its value.

<pre class="py">
days = ["Mon", "Tue", "Wed"]
for i, day in enumerate(days):
    print(i, day)
</pre>

`zip` walks through two lists side by side.

<pre class="py">
for day, t in zip(days, temps):
    print(day, t)
</pre>

Now most loops follow the same pattern. Start with something empty before the loop, then add to it on every pass. `total += t` is short for `total = total + t`, and `-=`, `*=` and `/=` work the same way.

<pre class="py" data-show="temps t total">
total = 0
for t in temps:
    total += t
total
</pre>

`break` jumps out of a loop straight away. This one stops at the first day warmer than 20.

<pre class="py" data-show="temps t">
for t in temps:
    if t > 20:
        print("first warm day", t)
        break
</pre>

Fill in the loop so it builds all four of these, one color at a time. `total_length` adds up the lengths of the colors, `lengths` lists each color's length, `joined` is all the colors stuck together with nothing in between, and `initials` is their first letters in capitals. For these colors that's `12`, `[3, 5, 4]`, `"redgreenblue"` and `"RGB"`.

<pre class="py" data-skip="true" data-show="c total_length lengths joined initials">
colors = ["red", "green", "blue"]
total_length = 0
lengths = []
joined = ""
initials = ""
for c in colors:
    ...  # your code here
total_length, lengths, joined, initials
</pre>
<pre class="py-check">
assert total_length == 12, f"total_length is {total_length}. Add len(c) on every pass."
assert lengths == [3, 5, 4], f"lengths is {lengths}. Append len(c) on every pass."
assert joined == "redgreenblue", f"joined is {joined!r}. Strings add together with +."
assert initials == "RGB", f"initials is {initials!r}. Add c[0].upper() on every pass."
</pre>
<pre class="py-solution">
colors = ["red", "green", "blue"]
total_length = 0
lengths = []
joined = ""
initials = ""
for c in colors:
    total_length += len(c)
    lengths.append(len(c))
    joined += c
    initials += c[0].upper()
total_length, lengths, joined, initials
</pre>

Then there's the `while` loop, which keeps going as long as its condition is true. How many times can you fold a 100 cm strip of paper in half before it's 1 cm or shorter?

<pre class="py" data-show="length folds">
length = 100.0
folds = 0
while length > 1:
    length = length / 2
    folds += 1
folds
</pre>

These lines should turn the steps walked each day, `[1, 3, 5, 7]` thousand, into running totals, `[1, 4, 9, 16]`. They're in the wrong order and lost their indentation, so running them as they are gives an error. Put them back together by moving the lines into the right order and indenting the ones that belong inside the loop.

<pre class="py" data-skip="true" data-show="steps v total running">
running.append(total)
for v in steps:
total = 0
total += v
running = []
steps = [1, 3, 5, 7]
running
</pre>
<pre class="py-check">
assert running == [1, 4, 9, 16], f"Got {running}. steps, running and total have to exist before the loop, and both total += v and running.append(total) belong inside it."
</pre>
<pre class="py-solution">
steps = [1, 3, 5, 7]
running = []
total = 0
for v in steps:
    total += v
    running.append(total)
running
</pre>

A list comprehension builds a new list out of an old one in a single line (basically a loop, just shorter), optionally keeping only some elements.

<pre class="py">
print([t + 1 for t in temps])
[t for t in temps if t > 15]
</pre>

Now with a comprehension. Keep only the words longer than three letters, and turn each one into capitals with `.upper()`, so the list starts with `"QUICK"`.

<pre class="py" data-skip="true">
words = "the quick brown fox jumps over the lazy dog".split()
long_words = ...  # your code here
long_words
</pre>
<pre class="py-check">
assert long_words is not ..., "Replace the ... with your code."
assert [w.upper() for w in long_words] == ["QUICK", "BROWN", "JUMPS", "OVER", "LAZY"], f"Got {long_words}. Keep a word only when len(w) > 3."
assert long_words == ["QUICK", "BROWN", "JUMPS", "OVER", "LAZY"], f"Got {long_words}. The right words, but they should be in capitals. Put w.upper() at the front of the comprehension instead of w."
</pre>
<pre class="py-solution">
words = "the quick brown fox jumps over the lazy dog".split()
long_words = [w.upper() for w in words if len(w) > 3]
long_words
</pre>

<!-- lab:above_average -->

Here are the highest temperatures of one week. Print how many days were warmer than the week's average.

<pre class="py" data-lab="true">
temps = [12, 15, 14, 18, 21, 19, 16]
# your code here
</pre>
<pre class="py-solution">
temps = [12, 15, 14, 18, 21, 19, 16]
average = sum(temps) / len(temps)
warm_days = 0
for t in temps:
    if t &gt; average:
        warm_days += 1
print(warm_days)
</pre>
<pre class="py-rubric">
- Works out the average from the list rather than typing it in.
- Counts only the days strictly above the average.
- Prints the count.
</pre>

<!-- /lab:above_average -->

<!-- lab:word_lengths -->

For the sentence below, print every word together with its length, one word per line. Then print the longest word. If several words tie for longest, any one of them is fine.

<pre class="py" data-lab="true">
sentence = "the quick brown fox jumps over the lazy dog"
# your code here
</pre>
<pre class="py-solution">
sentence = "the quick brown fox jumps over the lazy dog"
longest = ""
for word in sentence.split():
    print(word, len(word))
    if len(word) &gt; len(longest):
        longest = word
print("longest:", longest)
</pre>
<pre class="py-rubric">
- Prints each word of the sentence with its number of letters, one per line, in order.
- Prints a longest word, found from the lengths rather than typed in. Any word of the maximum length counts.
- The exact wording of the printed lines doesn't matter.
</pre>

<!-- /lab:word_lengths -->

<!-- lab:years_to_double -->

You put 1,000 in a savings account that pays 5% interest a year, added on to the balance at the end of each year. Using a loop, work out how many whole years it takes until the money has at least doubled, and print that number.

<pre class="py" data-lab="true">
money = 1000.0
# your code here
</pre>
<pre class="py-solution">
money = 1000.0
years = 0
while money &lt; 2000:
    money = money * 1.05
    years += 1
print(years)
</pre>
<pre class="py-rubric">
- Uses a loop that grows the balance by 5% a year.
- Stops at the first year the balance is 2,000 or more and counts the years up to then.
- Prints the number of years, which is 15. Wording doesn't matter.
</pre>

<!-- /lab:years_to_double -->

## Dictionaries

Now a dictionary maps keys to values, a bit like a price list. It's written in curly brackets, and you look a value up by putting its key in square brackets.

<pre class="py">
prices = {"apple": 0.5, "bread": 2.2, "milk": 1.1}
prices["bread"]
</pre>

Giving a new key a value adds it. `len` of a dictionary counts its keys.

<pre class="py" data-show="prices">
prices["eggs"] = 3.0
print(prices)
print(len(prices))
</pre>

`in` asks whether a key is there, and `not in` asks the opposite.

<pre class="py">
print("milk" in prices)
print("cheese" not in prices)
</pre>

Looking up a missing key with square brackets is an error, which gets annoying pretty quickly. `.get(key, default)` gives you the default instead.

<pre class="py">
prices.get("cheese", 0.0)
</pre>

Looping over `.items()` gives you each key together with its value.

<pre class="py">
for item, cost in prices.items():
    print(item, cost)
</pre>

Two more containers you'll bump into. A tuple is like a list you can't change, written with round brackets. `x, y = point` unpacks one into separate names.

<pre class="py">
point = (3, 4)
x, y = point
print(x)
print(y)
</pre>

A set keeps only one copy of each value.

<pre class="py">
set(["cat", "dog", "cat", "bird"])
</pre>

Computers usually turn words into numbers before doing anything with them. Build `numbers`, which gives each new word the next free number in the order it first shows up, so `"the"` is 0 and `"cat"` is 1.

<pre class="py" data-skip="true" data-show="word numbers">
sentence = "the cat saw the dog and the dog saw the cat"
numbers = {}
# your code here
numbers
</pre>
<pre class="py-check">
assert numbers == {"the": 0, "cat": 1, "saw": 2, "dog": 3, "and": 4}, f"Got {numbers}. A word only gets a number the first time you see it, and len(numbers) is the next free one."
</pre>
<pre class="py-solution">
sentence = "the cat saw the dog and the dog saw the cat"
numbers = {}
for word in sentence.split():
    if word not in numbers:
        numbers[word] = len(numbers)
numbers
</pre>

<!-- lab:shopping_totals -->

Each purchase below is an item and what you paid for it. Use a dictionary to add up how much you spent on each item, print those totals, and then print the item you spent the most on.

<pre class="py" data-lab="true">
purchases = [("coffee", 4.5), ("bread", 2.2), ("coffee", 4.5), ("apples", 3.0), ("coffee", 5.0), ("bread", 2.4)]
# your code here
</pre>
<pre class="py-solution">
purchases = [("coffee", 4.5), ("bread", 2.2), ("coffee", 4.5), ("apples", 3.0), ("coffee", 5.0), ("bread", 2.4)]
totals = {}
for item, price in purchases:
    totals[item] = totals.get(item, 0) + price
best_item = ""
best_total = 0
for item, total in totals.items():
    print(f"{item} {total:.2f}")
    if total &gt; best_total:
        best_item = item
        best_total = total
print("most spent on:", best_item)
</pre>
<pre class="py-rubric">
- Builds the total per item with a dictionary, adding up repeated items.
- Prints the total for every item. The order and wording don't matter.
- Prints the item with the largest total, found from the totals rather than typed in.
</pre>

<!-- /lab:shopping_totals -->

<!-- lab:most_common_word -->

Use a dictionary to count how often each word appears in the sentence below, then print the most common word and how many times it appears.

<pre class="py" data-lab="true">
sentence = "the cat and the dog and the bird saw the cat"
# your code here
</pre>
<pre class="py-solution">
sentence = "the cat and the dog and the bird saw the cat"
counts = {}
for word in sentence.split():
    counts[word] = counts.get(word, 0) + 1
best = ""
best_count = 0
for word, count in counts.items():
    if count &gt; best_count:
        best = word
        best_count = count
print(best, best_count)
</pre>
<pre class="py-rubric">
- Counts every word with a dictionary. collections.Counter counts as a dictionary.
- Finds the most common word from those counts rather than typing it in.
- Prints the word and its count, here 'the' and 4.
</pre>

<!-- /lab:most_common_word -->

## Functions

`def` packages code under a name, and `return` hands back the result.

<pre class="py">
def to_fahrenheit(celsius):
    return celsius * 9 / 5 + 32
to_fahrenheit(20)
</pre>

Once it's defined you can use it anywhere you like, including inside a comprehension.

<pre class="py">
[to_fahrenheit(t) for t in temps]
</pre>

Arguments can have defaults, and you can pass them by position or by name.

<pre class="py">
def tip(bill, percent=15):
    return bill * percent / 100
print(tip(40))
print(tip(40, 20))
print(tip(bill=40, percent=10))
</pre>

A string in triple quotes right under the `def` line is a docstring, and `help` shows it.

<pre class="py">
def tip(bill, percent=15):
    """Return the tip for a bill, as a percent of it."""
    return bill * percent / 100
help(tip)
</pre>

`return` hands a value back, while `print` only shows something on the screen. They look alike when you try them out, which makes this for sure one of the most common beginner bugs. Here `add_tax` shows the right number, but `result` ends up as `None`, because a function without a `return` gives back `None`.

<pre class="py">
def add_tax(price):
    print(price * 1.2)
result = add_tax(10)
print(result)
</pre>

Names created inside a function live only inside it, even if they share a name with something outside. The `k` inside `scale` is 10, but the `k` outside is still 2 afterwards.

<pre class="py">
k = 2
def scale(x):
    k = 10
    return x * k
print(scale(3))
print(k)
</pre>

A function can hand back several values at once, as a tuple, and you unpack them into names.

<pre class="py">
def coldest_and_warmest(values):
    return min(values), max(values)
low, high = coldest_and_warmest(temps)
print(low)
print(high)
</pre>

Functions are values too, so you can pass one into another. `sorted` takes one as `key` and sorts by whatever it gives back, here each word's length.

<pre class="py">
def length(word):
    return len(word)
sorted(["pear", "fig", "banana"], key=length)
</pre>

`lambda` writes a tiny function like that without bothering to name it. `max` and `min` take a `key` the same way.

<pre class="py">
fruits = ["pear", "fig", "banana"]
print(sorted(fruits, key=lambda w: len(w)))
print(max(fruits, key=lambda w: len(w)))
</pre>

<!-- lab:palindromes -->

A palindrome reads the same backwards, like 'level' or 'Never odd or even'. Write a function that says whether a piece of text is a palindrome, ignoring capital letters and spaces, then use it to print which of the phrases below are palindromes.

<pre class="py" data-lab="true">
phrases = ["level", "python", "Never odd or even", "Racecar", "open"]
# your code here
</pre>
<pre class="py-solution">
def is_palindrome(text):
    cleaned = text.replace(" ", "").lower()
    return cleaned == cleaned[::-1]
phrases = ["level", "python", "Never odd or even", "Racecar", "open"]
for p in phrases:
    if is_palindrome(p):
        print(p)
</pre>
<pre class="py-rubric">
- Defines a function that takes text and returns True or False.
- Ignores upper and lower case and ignores spaces.
- Uses the function to find and print the palindromes in the list, here 'level', 'Never odd or even' and 'Racecar'.
</pre>

<!-- /lab:palindromes -->

<!-- lab:rescale_scores -->

Write a function that rescales a list of exam scores so the lowest score becomes 0, the highest becomes 100, and everything in between keeps its place in proportion. Use it on the scores below and print the result.

<pre class="py" data-lab="true">
scores = [45, 60, 72, 90, 55]
# your code here
</pre>
<pre class="py-solution">
def rescale(scores):
    low = min(scores)
    high = max(scores)
    return [(s - low) / (high - low) * 100 for s in scores]
scores = [45, 60, 72, 90, 55]
print(rescale(scores))
</pre>
<pre class="py-rubric">
- Defines a function that takes a list of scores and returns a new list.
- Finds the lowest and highest score from the list itself rather than typing them in.
- Maps the lowest to 0, the highest to 100 and the rest linearly in between, so the scores here become about 0, 33.3, 60, 100 and 22.2.
- Uses the function and prints the result. Rounding doesn't matter.
</pre>

<!-- /lab:rescale_scores -->

<!-- lab:warming_streak -->

Write a function that finds the longest run of days in a row where each day was warmer than the day before it, and returns how many days that run has. Only count the days that were warmer than the one before, so the first day of the list never counts. Use it on the temperatures below and print the answer.

<pre class="py" data-lab="true">
temps = [10, 12, 15, 14, 16, 18, 19, 17, 18]
# your code here
</pre>
<pre class="py-solution">
def longest_warming(temps):
    best = 0
    current = 0
    for i in range(1, len(temps)):
        if temps[i] &gt; temps[i - 1]:
            current += 1
            best = max(best, current)
        else:
            current = 0
    return best
print(longest_warming([10, 12, 15, 14, 16, 18, 19, 17, 18]))
</pre>
<pre class="py-rubric">
- Defines a function that takes a list of temperatures and returns a number.
- Finds the longest stretch of consecutive days that were each warmer than the day before, counting only those warmer days.
- Uses the function and prints the answer, which is 3 here (16, 18, 19).
</pre>

<!-- /lab:warming_streak -->

## Modules and randomness

`import` pulls in code from Python's big standard library and from other packages. You can give a module a shorter name or import only what you need, and you'll see `import numpy as np` at the top of almost every file in this course.

<pre class="py">
import math
math.sqrt(16)
</pre>

`as` gives a module a shorter name, and `from` pulls out just the part you need.

<pre class="py">
import math as m
from math import pi
print(m.sqrt(16))
print(pi)
</pre>

`random` makes random numbers. Setting the seed makes them come out the same every time, which sounds a bit odd for random numbers, but it matters whenever you want someone else to get your results.

<pre class="py">
import random
random.seed(0)
print(random.randint(1, 6))
print(random.choice(["heads", "tails"]))
</pre>

`random.random()` gives a decimal between 0 and 1.

<pre class="py">
print(random.random())
print(random.random())
</pre>

Here's a fun one. Throw random points into a 1 by 1 square. The fraction that lands within distance 1 of the corner is a quarter of a circle's area, so four times that fraction should come out close to &pi;. Estimate it with 100,000 points. For each point, make `x` and `y` with `random.random()`, and count it in `inside` when `x ** 2 + y ** 2` is at most 1.

<pre class="py" data-skip="true">
random.seed(1)
n = 100000
inside = 0
# your code here
estimate = 4 * inside / n
estimate
</pre>
<pre class="py-check">
import math
assert inside > 0, "Count the points with x ** 2 + y ** 2 at most 1."
assert math.isclose(estimate, math.pi, abs_tol=0.02), f"{estimate} is too far from pi."
</pre>
<pre class="py-solution">
random.seed(1)
n = 100000
inside = 0
for i in range(n):
    x = random.random()
    y = random.random()
    if x ** 2 + y ** 2 &lt;= 1:
        inside += 1
estimate = 4 * inside / n
estimate
</pre>

## When things break

Now errors are completely normal, and reading them is a skill of its own. Python shows you a traceback, which lists the calls that led to the error with the most recent one last, so the line that actually broke is at the bottom. Run this one and read it.

<pre class="py" data-skip="true">
def last_item(basket):
    return basket[len(basket)]
def show_last(basket):
    print("last thing in the basket", last_item(basket))
show_last(["apple", "bread", "milk"])
</pre>

What kind of error was it, and in which function did it happen? Then fix `last_item`.

<pre class="py" data-skip="true">
error_type = ...  # the name of the error, as a string
failing_function = ...  # the function where it broke, as a string
def last_item(basket):
    return basket[len(basket)]
last_item(["apple", "bread", "milk"])
</pre>
<pre class="py-check">
assert error_type is not ... and failing_function is not ..., "Answer the two questions in place of the ... first."
assert error_type == "IndexError", f"You said {error_type!r}. The last line of the traceback starts with the error's name."
assert failing_function == "last_item", f"You said {failing_function!r}. The bottom frame of the traceback says 'in last_item'."
assert last_item(["apple", "bread", "milk"]) == "milk", "A list of 3 has positions 0, 1 and 2, so len(basket) is one past the end. basket[-1] is the last element."
</pre>
<pre class="py-solution">
error_type = "IndexError"
failing_function = "last_item"
def last_item(basket):
    return basket[-1]
last_item(["apple", "bread", "milk"])
</pre>

This function has three bugs, a missing piece of punctuation and two misspelled names. Run it, fix whatever the error points at, and repeat until it works.

<pre class="py" data-skip="true">
def cheapest(prices)
    best = min(prices)
    print("cheapest is", bets)
    return Best
cheapest([3.5, 2.0, 4.25])
</pre>
<pre class="py-check">
assert cheapest([3.5, 2.0, 4.25]) == 2.0, "cheapest should return the smallest price."
</pre>
<pre class="py-solution">
def cheapest(prices):
    best = min(prices)
    print("cheapest is", best)
    return best
cheapest([3.5, 2.0, 4.25])
</pre>

So if you know an error might happen, `try` and `except` let you decide what to do instead.

<pre class="py">
def split_bill(total, people):
    try:
        return total / people
    except ZeroDivisionError:
        return total
split_bill(60, 0)
</pre>

The opposite trick is just as useful. An `assert` stops your program the moment something you believed turns out to be false. If the condition is true nothing happens. If it's false, Python stops with an AssertionError and shows the message after the comma.

<pre class="py" data-skip="true">
balance = 50
assert balance >= 0, "balance went negative"
assert balance > 100, "balance should be over 100"
</pre>

Now write `average`, which returns the average of a list, with two asserts. One checks that the list isn't empty before you divide, and one checks that the answer lands between the smallest and the largest value.

<pre class="py" data-skip="true">
def average(values):
    ...  # your code here
average([1, 2, 3])
</pre>
<pre class="py-check">
assert average([1, 2, 3]) == 2, "average([1, 2, 3]) should be 2."
try:
    average([])
    raised = False
except AssertionError:
    raised = True
except ZeroDivisionError:
    raised = "zero"
assert raised is not False, "average([]) should fail an assert."
assert raised is True, "average([]) crashed with a ZeroDivisionError. Put the assert before the division so it catches the empty list first."
</pre>
<pre class="py-solution">
def average(values):
    assert len(values) > 0, "average needs at least one value"
    result = sum(values) / len(values)
    assert min(values) &lt;= result &lt;= max(values)
    return result
average([1, 2, 3])
</pre>

This function is supposed to return the average of a list, but it has a bug. Find it and fix it.

<pre class="py" data-skip="true">
def mean(values):
    total = 0
    for v in values:
        total = total + v
        return total / len(values)
mean([2, 4, 6])
</pre>
<pre class="py-check">
assert mean([2, 4, 6]) == 4, "Look at how far the return line is indented."
assert mean([5]) == 5
</pre>
<pre class="py-solution">
def mean(values):
    total = 0
    for v in values:
        total = total + v
    return total / len(values)
mean([2, 4, 6])
</pre>

No error this time, just wrong numbers. Each student's quiz result is stored as how many answers they got right out of how many questions, and the percentages come out above 100, which is impossible. Find the bug.

<pre class="py" data-skip="true">
def percent(right, questions):
    return right / questions * 100
results = {"ada": (18, 20), "alan": (12, 16)}
scores = {}
for name, result in results.items():
    right = result[0]
    questions = result[1]
    scores[name] = percent(questions, right)
scores
</pre>
<pre class="py-check">
import math
assert math.isclose(scores["ada"], 90) and math.isclose(scores["alan"], 75), f"Got {scores}. Look at the order the arguments are passed in, compared with the order percent expects them."
</pre>
<pre class="py-solution">
def percent(right, questions):
    return right / questions * 100
results = {"ada": (18, 20), "alan": (12, 16)}
scores = {}
for name, result in results.items():
    right = result[0]
    questions = result[1]
    scores[name] = percent(right, questions)
scores
</pre>

## Guess the number

<!-- lab:guess_number -->

Let's end with a little game. I'm thinking of a whole number from 1 to 100, and after each guess I'll only tell you whether it's too high, too low or right. Now you could just go 1, 2, 3 and so on, but that might take you a hundred guesses. So is there a way of guessing that always gets it in 7 guesses or fewer, no matter what the number is? Write code that plays the guesser against `secret`, printing each guess with whether it was too high, too low or right, and then how many guesses it took. And no peeking, you can only compare your guesses with `secret`, not just read it. Every Run picks a new secret, so think about what could work and give it a few tries.

<pre class="py" data-lab="true">
import random
secret = random.randint(1, 100)
# your code here
</pre>
<pre class="py-solution">
import random
secret = random.randint(1, 100)
low = 1
high = 100
guesses = 0
while True:
    middle = (low + high) // 2
    guesses += 1
    if middle == secret:
        print(middle, "is right")
        break
    elif middle &gt; secret:
        print(middle, "is too high")
        high = middle - 1
    else:
        print(middle, "is too low")
        low = middle + 1
print("found it in", guesses, "guesses")
</pre>
<pre class="py-rubric">
- Finds the secret by guessing and comparing each guess with secret. The only thing it learns from a guess is whether it was too high, too low or right, and it never prints or copies secret directly.
- After every answer it narrows down what's left by guessing in the middle of it, or some other way that halves it, so it finds any secret from 1 to 100 in 7 guesses or fewer.
- Prints each guess with whether it was too high, too low or right, and then how many guesses it took. Wording doesn't matter.
- The secret is random, so this code and the reference print different numbers. Judge the method, not the numbers.
</pre>

<!-- /lab:guess_number -->

This idea is called Binary Search where you basically throw away the half that isn't usefull to you anymore and carry on looking for your target.

<p class="credit">Several exercises on this page are adapted from Software Carpentry's <a href="https://swcarpentry.github.io/python-novice-inflammation/">Programming with Python</a> and <a href="https://swcarpentry.github.io/python-novice-gapminder/">Plotting and Programming in Python</a>, &copy; <a href="https://carpentries.org/">The Carpentries</a>, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>, and rewritten for this course.</p>

<nav class="lesson-nav">
  <a class="prev" href="/course/00-introduction/">&larr; An Introduction</a>
  <a class="next" href="/course/lecture-0/data/">Working with Data &rarr;</a>
</nav>

<script src="/course/assets/course.js"></script>
<script src="/course/assets/python-cells.js" data-traces="/course/assets/traces/basics.json"></script>
