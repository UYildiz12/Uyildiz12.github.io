---
layout: page
title: "Objects and Classes"
permalink: /course/lecture-0/oop/
---

<link rel="stylesheet" href="/course/assets/course.css">

So far we've kept data in variables and behavior in functions. A class basically lets you bundle the two together. Almost every library you'll use is built out of classes, PyTorch included, so knowing how they work makes everything after this part much less mysterious.

## Everything is an object

Well, you've actually been using objects all along. A list is an object, and `sort` is one of its methods, a function that belongs to the list and works on it.

<pre class="py">
fruits = ["pear", "apple", "fig"]
fruits.sort()
fruits
</pre>

Strings and even numbers have methods too.

<pre class="py">
print("hello".upper())
print((3.5).is_integer())
</pre>

`type` tells you what kind of object something is. Notice the word it uses, `class`. Every object is made from a class, and the class decides which methods it has. So next, let's write some classes of our own.

<pre class="py">
print(type(fruits))
print(type("hello"))
print(type(len))
</pre>

## Your first class

A class is a blueprint, and each object you make from it is called an instance. Let's build a blueprint for a bank account, one piece at a time. Here's the first piece.

<pre class="py">
class Account:
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance
</pre>

`class Account:` starts the blueprint, and everything indented under it belongs to it. `__init__` is a function written inside the class. Python runs it every time a new account is made, and its job is to fill the new account in with its data.

Make an account by calling the class as if it were a function. The values you pass in go to `__init__`.

<pre class="py" data-show="acc">
acc = Account("Ada", 100)
print(acc.owner)
print(acc.balance)
</pre>

Now `__init__` takes three names but we only passed two values, right? Python fills in the first one, `self`, on its own, and `self` is the new account being made.

<figure class="diagram"><svg viewBox="0 0 347 124" style="max-width:347px" role="img" aria-label="Account(&quot;Ada&quot;, 100) runs __init__ with self as the new account, owner as Ada and balance as 100"><text class="mono" x="115.0" y="26" textLength="171" lengthAdjust="spacing">Account(&quot;Ada&quot;, 100)</text><text class="mono" x="16.0" y="112" textLength="315" lengthAdjust="spacing">def __init__(self, owner, balance):</text><line class="link-a" x1="146.5" y1="36.0" x2="150.4" y2="88.0"/><polygon class="tip-a" points="151.0,96.0 146.4,88.3 154.4,87.7"/><line class="link-a" x1="209.5" y1="36.0" x2="209.5" y2="88.0"/><polygon class="tip-a" points="209.5,96.0 205.5,88.0 213.5,88.0"/><line class="link-a" x1="263.5" y1="36.0" x2="279.2" y2="88.3"/><polygon class="tip-a" points="281.5,96.0 275.4,89.5 283.0,87.2"/></svg></figure>

So `self.owner = owner` means store the owner that was passed in on this account, under the name `owner`. That's why `acc.owner` gives back `"Ada"`. A value stored on an object like this is called an attribute, and you can change it the same way you'd change a variable.

<pre class="py">
acc.balance = 250
acc.balance
</pre>

A function written inside a class is called a method. Here's the blueprint again, now with a `deposit` method.

<pre class="py">
class Account:
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance
    def deposit(self, amount):
        self.balance += amount
</pre>

Every method takes `self` first, so it can reach the account's own data. When you write `acc.deposit(50)`, Python passes `acc` in as `self` and `50` as `amount`.

<figure class="diagram"><svg viewBox="0 0 266 124" style="max-width:266px" role="img" aria-label="acc.deposit(50) runs deposit with self as acc and amount as 50"><text class="mono" x="88.0" y="26" textLength="135" lengthAdjust="spacing">acc.deposit(50)</text><text class="mono" x="16.0" y="112" textLength="234" lengthAdjust="spacing">def deposit(self, amount):</text><line class="link-a" x1="101.5" y1="36.0" x2="137.5" y2="89.4"/><polygon class="tip-a" points="142.0,96.0 134.2,91.6 140.8,87.1"/><line class="link-a" x1="205.0" y1="36.0" x2="205.0" y2="88.0"/><polygon class="tip-a" points="205.0,96.0 201.0,88.0 209.0,88.0"/></svg></figure>

<pre class="py" data-show="acc">
acc = Account("Ada", 100)
acc.deposit(50)
acc.balance
</pre>

Each instance keeps its own data, so two accounts made from the same blueprint don't affect each other.

<pre class="py" data-show="a b">
a = Account("Ada", 100)
b = Account("Alan", 20)
a.deposit(5)
print(a.balance)
print(b.balance)
</pre>

<figure class="diagram"><svg viewBox="0 0 536 212" style="max-width:536px" role="img" aria-label="Two accounts made from the Account class, each holding its own owner and balance"><rect class="card" x="16" y="46" width="190" height="86" rx="8"/><text class="mono head" x="111.0" y="69" text-anchor="middle">class Account</text><line class="rule" x1="16" y1="80" x2="206" y2="80"/><text class="mono" x="30" y="102">__init__</text><text class="mono" x="30" y="124">deposit</text><rect class="card" x="330" y="8" width="190" height="86" rx="8"/><text class="mono head" x="425.0" y="31" text-anchor="middle">a</text><line class="rule" x1="330" y1="42" x2="520" y2="42"/><text class="mono" x="344" y="64">owner    &quot;Ada&quot;</text><text class="mono" x="344" y="86">balance  105</text><rect class="card" x="330" y="112" width="190" height="86" rx="8"/><text class="mono head" x="425.0" y="135" text-anchor="middle">b</text><line class="rule" x1="330" y1="146" x2="520" y2="146"/><text class="mono" x="344" y="168">owner    &quot;Alan&quot;</text><text class="mono" x="344" y="190">balance  20</text><line class="link" x1="206.0" y1="79.0" x2="322.2" y2="52.8" stroke-dasharray="5 5"/><polygon class="tip" points="330.0,51.0 323.1,56.7 321.3,48.9"/><line class="link" x1="206.0" y1="99.0" x2="322.7" y2="151.7" stroke-dasharray="5 5"/><polygon class="tip" points="330.0,155.0 321.1,155.4 324.4,148.1"/></svg></figure>

Add a `withdraw` method. If there's enough money it takes the amount out and returns `True`. If there isn't, it leaves the balance alone and returns `False`. So on an account holding 100, `withdraw(30)` returns `True` and leaves 70, and then `withdraw(500)` returns `False` and leaves it at 70.

<pre class="py" data-skip="true">
class Account:
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance
    def deposit(self, amount):
        self.balance += amount
    def withdraw(self, amount):
        ...  # your code here
acc = Account("Ada", 100)
print(acc.withdraw(30))
print(acc.balance)
</pre>
<pre class="py-check">
acc = Account("Ada", 100)
assert acc.withdraw(30) is True, "Withdrawing 30 from 100 should work and return True."
assert acc.balance == 70, f"The balance should be 70 after taking out 30, but it's {acc.balance}."
assert acc.withdraw(500) is False, "Withdrawing 500 from 70 should be refused with False."
assert acc.balance == 70, "A refused withdrawal shouldn't change the balance."
</pre>
<pre class="py-solution">
class Account:
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance
    def deposit(self, amount):
        self.balance += amount
    def withdraw(self, amount):
        if amount > self.balance:
            return False
        self.balance -= amount
        return True
acc = Account("Ada", 100)
print(acc.withdraw(30))
print(acc.balance)
</pre>

An attribute can hold anything, a list included. Start it as an empty list in `__init__`, and every instance gets its own list to add to. This `__init__` needs nothing passed in, so the class is called with empty brackets.

<pre class="py">
class TodoList:
    def __init__(self):
        self.tasks = []
    def add(self, task):
        self.tasks.append(task)
    def count(self):
        return len(self.tasks)
</pre>

<pre class="py" data-show="todo">
todo = TodoList()
todo.add("buy milk")
todo.add("call the bank")
print(todo.tasks)
print(todo.count())
</pre>

<!-- lab:shopping_cart -->

Write a ShoppingCart class. You should be able to add an item with its price and how many you want, which defaults to 1, ask the cart for the total cost, and ask it for the name of the item with the highest price. Then make a cart with a few items and print its total and its most expensive item.

<pre class="py" data-lab="true">
# your code here
</pre>
<pre class="py-solution">
class ShoppingCart:
    def __init__(self):
        self.items = []
    def add(self, name, price, quantity=1):
        self.items.append((name, price, quantity))
    def total(self):
        total = 0
        for name, price, quantity in self.items:
            total += price * quantity
        return total
    def most_expensive(self):
        return max(self.items, key=lambda item: item[1])[0]
cart = ShoppingCart()
cart.add("bread", 2.2)
cart.add("coffee", 4.5, 2)
cart.add("cheese", 6.0)
print(cart.total())
print(cart.most_expensive())
</pre>
<pre class="py-rubric">
- Defines a ShoppingCart class whose instances keep their own items.
- Has a method to add an item with a price and a quantity that defaults to 1.
- Has a method that returns the total cost, counting quantities.
- Has a method that returns the name of the item with the highest single price.
- Uses the class and prints a total and a most expensive item that are right for the items it added. Method names don't matter.
</pre>

<!-- /lab:shopping_cart -->

## Objects that remember

Because an object keeps its data between calls, it can remember things. This one keeps a running average of every number it's been given. It stores the total so far and how many numbers it has seen, and works out the average only when you ask.

<pre class="py">
class RunningAverage:
    def __init__(self):
        self.total = 0
        self.count = 0
    def add(self, value):
        self.total += value
        self.count += 1
    def value(self):
        return self.total / self.count
</pre>

Feed it your steps for three days.

<pre class="py" data-show="avg">
avg = RunningAverage()
for steps in [8000, 12000, 7000]:
    avg.add(steps)
avg.value()
</pre>

One handy value before the next exercise. `float("inf")` is infinity, bigger than any number, so it makes a good starting value for a best time that any real time will beat.

<pre class="py">
print(float("inf") > 10 ** 100)
print(29.5 &lt; float("inf"))
</pre>

A runner logs their time for every 5 km run, and lower is better. Write `PersonalBest`, whose `add(time)` returns `True` once there have been `patience` runs in a row that didn't beat their best time so far, and `False` otherwise. A time equal to the best doesn't beat it, and a new best starts the count again from 0. Here's how the example below should go, with `patience=2`.

| time | best so far | misses in a row | `add` returns |
|---|---|---|---|
| 30.0 | 30.0 | 0 | `False` |
| 29.5 | 29.5 | 0 | `False` |
| 29.8 | 29.5 | 1 | `False` |
| 29.6 | 29.5 | 2 | `True` |

<pre class="py" data-skip="true">
class PersonalBest:
    def __init__(self, patience):
        self.patience = patience
        self.best = float("inf")
        self.misses = 0
    def add(self, time):
        ...  # your code here
pb = PersonalBest(patience=2)
[pb.add(t) for t in [30.0, 29.5, 29.8, 29.6]]
</pre>
<pre class="py-check">
p = PersonalBest(patience=2)
got = [p.add(t) for t in [30.0, 29.5, 29.8, 29.6, 28.9]]
assert got in ([False, False, False, True, False], [False, False, False, True, True]), f"Got {got}. A new best resets misses to 0, anything else adds 1, and you return True once misses reaches patience."
p = PersonalBest(patience=1)
assert [p.add(t) for t in [31.0, 30.0, 30.5]] == [False, False, True], "Check the case patience=1."
</pre>
<pre class="py-solution">
class PersonalBest:
    def __init__(self, patience):
        self.patience = patience
        self.best = float("inf")
        self.misses = 0
    def add(self, time):
        if time &lt; self.best:
            self.best = time
            self.misses = 0
        else:
            self.misses += 1
        return self.misses >= self.patience
pb = PersonalBest(patience=2)
[pb.add(t) for t in [30.0, 29.5, 29.8, 29.6]]
</pre>

Now, where you create the data matters. A value written straight in the class body, outside any method, belongs to the class itself, and every instance can see it.

<pre class="py">
class Dog:
    sound = "woof"
rex = Dog()
fido = Dog()
print(rex.sound)
print(fido.sound)
</pre>

That's fine for a value nobody changes. With a list though, it's a bit of a trap. These two playlists end up sharing one list of songs, because `songs` lives on the class.

<pre class="py">
class Playlist:
    songs = []
    def add(self, song):
        self.songs.append(song)
a = Playlist()
b = Playlist()
a.add("Yesterday")
b.add("Imagine")
print(a.songs)
print(b.songs)
</pre>

Set the list up in `__init__` instead, and each playlist gets its own.

<pre class="py" data-show="a b">
class Playlist:
    def __init__(self):
        self.songs = []
    def add(self, song):
        self.songs.append(song)
a = Playlist()
b = Playlist()
a.add("Yesterday")
b.add("Imagine")
print(a.songs)
print(b.songs)
</pre>

<figure class="diagram"><svg viewBox="0 0 668 176" style="max-width:668px" role="img" aria-label="With songs on the class both playlists point at one list. With self.songs each has its own"><text class="mono head" x="166" y="22" text-anchor="middle">songs = []</text><rect class="card-a" x="16" y="46" width="40" height="32" rx="6"/><text class="mono head" x="36" y="67" text-anchor="middle">a</text><rect class="card-a" x="16" y="116" width="40" height="32" rx="6"/><text class="mono head" x="36" y="137" text-anchor="middle">b</text><rect class="card" x="126" y="80" width="190" height="34" rx="6"/><text class="mono small" x="221" y="102" text-anchor="middle">[&#x27;Yesterday&#x27;, &#x27;Imagine&#x27;]</text><line class="link-a" x1="56.0" y1="62.0" x2="118.6" y2="88.8"/><polygon class="tip-a" points="126.0,92.0 117.1,92.5 120.2,85.2"/><line class="link-a" x1="56.0" y1="132.0" x2="118.6" y2="107.0"/><polygon class="tip-a" points="126.0,104.0 120.1,110.7 117.1,103.3"/><text class="mono head" x="496" y="22" text-anchor="middle">self.songs = []</text><rect class="card-a" x="346" y="46" width="40" height="32" rx="6"/><text class="mono head" x="366" y="67" text-anchor="middle">a</text><rect class="card-a" x="346" y="116" width="40" height="32" rx="6"/><text class="mono head" x="366" y="137" text-anchor="middle">b</text><rect class="card" x="456" y="46" width="150" height="32" rx="6"/><text class="mono small" x="531" y="67" text-anchor="middle">[&#x27;Yesterday&#x27;]</text><line class="link-a" x1="386.0" y1="62.0" x2="448.0" y2="62.0"/><polygon class="tip-a" points="456.0,62.0 448.0,66.0 448.0,58.0"/><rect class="card" x="456" y="116" width="150" height="32" rx="6"/><text class="mono small" x="531" y="137" text-anchor="middle">[&#x27;Imagine&#x27;]</text><line class="link-a" x1="386.0" y1="132.0" x2="448.0" y2="132.0"/><polygon class="tip-a" points="456.0,132.0 448.0,136.0 448.0,128.0"/><line class="rule" x1="326" y1="8" x2="326" y2="170"/></svg></figure>

<!-- lab:temperature_log -->

Write a TemperatureLog class. You add readings to it one at a time, and it can tell you the lowest reading, the highest reading, the average, and how many readings were above a temperature you give it. Make a log, add the readings below, and print all four, using 20 as the temperature.

<pre class="py" data-lab="true">
readings = [18, 22, 19, 25, 21, 17]
# your code here
</pre>
<pre class="py-solution">
class TemperatureLog:
    def __init__(self):
        self.readings = []
    def add(self, value):
        self.readings.append(value)
    def lowest(self):
        return min(self.readings)
    def highest(self):
        return max(self.readings)
    def average(self):
        return sum(self.readings) / len(self.readings)
    def above(self, limit):
        count = 0
        for r in self.readings:
            if r &gt; limit:
                count += 1
        return count
log = TemperatureLog()
for r in [18, 22, 19, 25, 21, 17]:
    log.add(r)
print(log.lowest())
print(log.highest())
print(f"{log.average():.2f}")
print(log.above(20))
</pre>
<pre class="py-rubric">
- Defines a TemperatureLog class whose instances keep their own readings.
- Has a method to add one reading.
- Has methods that return the lowest, the highest, the average, and the number of readings above a given temperature.
- Uses the class with the readings 18, 22, 19, 25, 21, 17 and prints 17, 25, about 20.33, and 3. Method names and wording don't matter.
</pre>

<!-- /lab:temperature_log -->

## Special methods

Methods with two underscores on both sides are called special methods. You rarely call them yourself. Python calls them for you when you use ordinary syntax on your object, like `len(x)` or `x + y`.

Let's start with how an object gets shown. Python doesn't know how to show a `Converter`, so it falls back on the class name and a memory address.

<pre class="py">
class Converter:
    def __init__(self, rate):
        self.rate = rate
Converter(1.08)
</pre>

`__repr__` fixes that. Whatever string it returns is what gets shown.

<pre class="py">
class Converter:
    def __init__(self, rate):
        self.rate = rate
    def __repr__(self):
        return f"Converter(rate={self.rate})"
Converter(1.08)
</pre>

`__call__` lets you call an instance like a function. Here a converter remembers its exchange rate, and calling it converts an amount.

<pre class="py">
class Converter:
    def __init__(self, rate):
        self.rate = rate
    def __call__(self, amount):
        return amount * self.rate
euros_to_dollars = Converter(1.08)
euros_to_dollars(50)
</pre>

`__len__` makes `len()` work. Writing `len(shelf)` calls `shelf.__len__()`.

<pre class="py">
class Shelf:
    def __init__(self, books):
        self.books = books
    def __len__(self):
        return len(self.books)
shelf = Shelf(["Dune", "Emma", "Ulysses"])
len(shelf)
</pre>

`__getitem__` makes square brackets work. Writing `shelf[0]` calls `shelf.__getitem__(0)`, so the object can hand out its items like a list.

<pre class="py">
class Shelf:
    def __init__(self, books):
        self.books = books
    def __len__(self):
        return len(self.books)
    def __getitem__(self, i):
        return self.books[i]
shelf = Shelf(["Dune", "Emma", "Ulysses"])
print(shelf[0])
print(shelf[-1])
</pre>

It even works in a `for` loop (a nice little bonus), because Python keeps asking for `[0]`, `[1]`, `[2]` and so on until it runs out.

<pre class="py">
for book in shelf:
    print(book)
</pre>

`__add__` is the special method behind `+`. Writing `a + b` calls `a.__add__(b)`, so `other` is whatever sits on the right.

<pre class="py">
class Money:
    def __init__(self, amount):
        self.amount = amount
    def __add__(self, other):
        return Money(self.amount + other.amount)
    def __repr__(self):
        return f"Money({self.amount})"
Money(5) + Money(7)
</pre>

So here are all of them side by side.

| you write | Python calls |
|---|---|
| `x` shown in the output | `x.__repr__()` |
| `x(5)` | `x.__call__(5)` |
| `len(x)` | `x.__len__()` |
| `x[i]` | `x.__getitem__(i)` |
| `a + b` | `a.__add__(b)` |

Write a small `Vector` class that wraps a list of numbers. `len(v)` should give its length, `v[i]` its i-th number, `v + w` a new `Vector` that adds them entry by entry, and showing it should look like `Vector([1, 2])`. So `Vector([1, 2]) + Vector([3, 4])` should show as `Vector([4, 6])`.

<pre class="py" data-skip="true">
class Vector:
    def __init__(self, values):
        self.values = list(values)
    # your code here
Vector([1, 2]) + Vector([3, 4])
</pre>
<pre class="py-check">
v, w = Vector([1, 2]), Vector([3, 4])
assert len(v) == 2, "Add a __len__ that returns len(self.values)."
assert v[1] == 2, "Add a __getitem__(self, i) that returns self.values[i]."
s = v + w
assert isinstance(s, Vector), "__add__ should return a new Vector."
assert s.values == [4, 6], f"Got {s.values}. Add the entries pairwise with zip."
assert repr(v) == "Vector([1, 2])", f"It shows as {repr(v)!r}. Have __repr__ return 'Vector(' plus the list plus ')', an f-string makes that short."
</pre>
<pre class="py-solution">
class Vector:
    def __init__(self, values):
        self.values = list(values)
    def __len__(self):
        return len(self.values)
    def __getitem__(self, i):
        return self.values[i]
    def __add__(self, other):
        return Vector([a + b for a, b in zip(self.values, other.values)])
    def __repr__(self):
        return f"Vector({self.values})"
Vector([1, 2]) + Vector([3, 4])
</pre>

## Inheritance

Sometimes one class is a more specific version of another. A dog is a kind of pet, so a `Dog` class can inherit from a `Pet` class. It gets all of `Pet`'s methods for free, and can add more of its own. Let's start with the general one.

<pre class="py">
class Pet:
    def __init__(self, name):
        self.name = name
    def greet(self):
        return f"Hi, I'm {self.name}"
</pre>

Putting `Pet` in brackets after the class name is what makes `Dog` inherit from it. `Dog` only writes the one new method, `fetch`.

<pre class="py">
class Dog(Pet):
    def fetch(self):
        return f"{self.name} brings the ball back"
</pre>

`Dog` has no `__init__` and no `greet` of its own, so it uses `Pet`'s.

<pre class="py">
rex = Dog("Rex")
print(rex.greet())
print(rex.fetch())
</pre>

A child class can also replace one of the parent's methods by writing its own with the same name. Python looks in the child first, and only goes up to the parent when the child doesn't have the method.

<pre class="py">
class Cat(Pet):
    def greet(self):
        return f"{self.name} ignores you"
tom = Cat("Tom")
tom.greet()
</pre>

Sometimes the child needs data the parent doesn't have, so it writes its own `__init__`. It should still let the parent set up its part though. `super()` reaches back to the parent class, so `super().__init__(name)` runs `Pet`'s `__init__` and the name gets stored as usual.

<pre class="py">
class Parrot(Pet):
    def __init__(self, name, word):
        super().__init__(name)
        self.word = word
    def talk(self):
        return f"{self.word}! {self.word}!"
polly = Parrot("Polly", "Cracker")
print(polly.greet())
print(polly.talk())
</pre>

Each class only lists the methods it writes itself. The arrows point to the parent it inherits the rest from.

<figure class="diagram"><svg viewBox="0 0 562 272" style="max-width:562px" role="img" aria-label="Dog, Cat and Parrot all inherit from Pet. Each lists only the methods it writes itself"><rect class="card" x="206" y="8" width="150" height="86" rx="8"/><text class="mono head" x="281.0" y="31" text-anchor="middle">Pet</text><line class="rule" x1="206" y1="42" x2="356" y2="42"/><text class="mono" x="220" y="64">__init__</text><text class="mono" x="220" y="86">greet</text><rect class="card" x="16" y="160" width="150" height="64" rx="8"/><text class="mono head" x="91.0" y="183" text-anchor="middle">Dog</text><line class="rule" x1="16" y1="194" x2="166" y2="194"/><text class="mono" x="30" y="216">fetch</text><line class="link" x1="91.0" y1="160.0" x2="207.4" y2="97.8"/><polygon class="tip" points="214.5,94.0 209.3,101.3 205.6,94.2"/><rect class="card" x="206" y="160" width="150" height="64" rx="8"/><text class="mono head" x="281.0" y="183" text-anchor="middle">Cat</text><line class="rule" x1="206" y1="194" x2="356" y2="194"/><text class="mono" x="220" y="216">greet</text><line class="link" x1="281.0" y1="160.0" x2="281.0" y2="102.0"/><polygon class="tip" points="281.0,94.0 285.0,102.0 277.0,102.0"/><rect class="card" x="396" y="160" width="150" height="86" rx="8"/><text class="mono head" x="471.0" y="183" text-anchor="middle">Parrot</text><line class="rule" x1="396" y1="194" x2="546" y2="194"/><text class="mono" x="410" y="216">__init__</text><text class="mono" x="410" y="238">talk</text><line class="link" x1="471.0" y1="160.0" x2="354.6" y2="97.8"/><polygon class="tip" points="347.5,94.0 356.4,94.2 352.7,101.3"/></svg></figure>

Now a bigger family. Every shape has a name and an area, and every shape describes itself the same way, but each kind of shape works out its area differently. So the general `Shape` writes `describe`, and leaves `area` to the kinds of shape.

<pre class="py">
class Shape:
    def __init__(self, name):
        self.name = name
    def describe(self):
        return f"{self.name} with area {self.area():.1f}"
</pre>

`describe` calls `self.area()`, even though `Shape` has no `area` method. That isn't a mistake, it's on purpose. A method can call another method on the same object through `self`, and each kind of shape will bring its own `area`.

<pre class="py">
class Rectangle(Shape):
    def __init__(self, width, height):
        super().__init__("rectangle")
        self.width = width
        self.height = height
    def area(self):
        return self.width * self.height
Rectangle(3, 4).describe()
</pre>

<pre class="py">
import math
class Circle(Shape):
    def __init__(self, radius):
        super().__init__("circle")
        self.radius = radius
    def area(self):
        return math.pi * self.radius ** 2
Circle(1).describe()
</pre>

A child of a child works too. After all, a square is just a rectangle with equal sides.

<pre class="py">
class Square(Rectangle):
    def __init__(self, side):
        super().__init__(side, side)
        self.name = "square"
Square(5).describe()
</pre>

For `Square(5).describe()`, Python looks for `describe` in `Square`, then in `Rectangle`, and finds it in `Shape`. Inside it, `self.area()` goes through the same search and finds `area` in `Rectangle`.

<figure class="diagram"><svg viewBox="0 0 562 372" style="max-width:562px" role="img" aria-label="Square inherits from Rectangle, which inherits from Shape. describe is found in Shape and area in Rectangle"><rect class="card" x="206" y="8" width="150" height="86" rx="8"/><text class="mono head" x="281.0" y="31" text-anchor="middle">Shape</text><line class="rule" x1="206" y1="42" x2="356" y2="42"/><text class="mono" x="220" y="64">__init__</text><text class="mono hot" x="220" y="86">describe</text><rect class="card" x="56" y="150" width="150" height="86" rx="8"/><text class="mono head" x="131.0" y="173" text-anchor="middle">Rectangle</text><line class="rule" x1="56" y1="184" x2="206" y2="184"/><text class="mono" x="70" y="206">__init__</text><text class="mono hot" x="70" y="228">area</text><rect class="card" x="356" y="150" width="150" height="86" rx="8"/><text class="mono head" x="431.0" y="173" text-anchor="middle">Circle</text><line class="rule" x1="356" y1="184" x2="506" y2="184"/><text class="mono" x="370" y="206">__init__</text><text class="mono" x="370" y="228">area</text><rect class="card" x="56" y="292" width="150" height="64" rx="8"/><text class="mono head" x="131.0" y="315" text-anchor="middle">Square</text><line class="rule" x1="56" y1="326" x2="206" y2="326"/><text class="mono" x="70" y="348">__init__</text><line class="link" x1="131.0" y1="150.0" x2="242.8" y2="97.4"/><polygon class="tip" points="250.0,94.0 244.5,101.0 241.1,93.8"/><line class="link" x1="431.0" y1="150.0" x2="319.2" y2="97.4"/><polygon class="tip" points="312.0,94.0 320.9,93.8 317.5,101.0"/><line class="link" x1="131.0" y1="292.0" x2="131.0" y2="244.0"/><polygon class="tip" points="131.0,236.0 135.0,244.0 127.0,244.0"/></svg></figure>

Write a `Triangle` that takes a base and a height, is called `"triangle"`, and has the right area, half the base times the height. So `Triangle(4, 3).describe()` should give `"triangle with area 6.0"`.

<pre class="py" data-skip="true">
class Triangle(Shape):
    ...  # your code here
Triangle(4, 3).describe()
</pre>
<pre class="py-check">
t = Triangle(4, 3)
assert t.name == "triangle", "Call super().__init__('triangle') inside __init__."
assert math.isclose(t.area(), 6), f"The area of a 4 by 3 triangle should be 6, but area() gave {t.area()}."
assert t.describe() == "triangle with area 6.0", "describe should come for free from Shape."
</pre>
<pre class="py-solution">
class Triangle(Shape):
    def __init__(self, base, height):
        super().__init__("triangle")
        self.base = base
        self.height = height
    def area(self):
        return self.base * self.height / 2
Triangle(4, 3).describe()
</pre>

Because every shape has an `area`, code can work with shapes without caring which kind each one is. A drawing holds a list of shapes and adds up their areas.

<pre class="py">
class Drawing:
    def __init__(self, shapes):
        self.shapes = shapes
    def total_area(self):
        return sum([s.area() for s in self.shapes])
picture = Drawing([Rectangle(3, 4), Circle(1), Square(2)])
picture.total_area()
</pre>

## Handing things out in groups

A gradebook can be a class too. With `__len__` and `__getitem__` it can say how many students it has and hand back one student with their grade.

<pre class="py">
class Gradebook:
    def __init__(self, names, grades):
        self.names = names
        self.grades = grades
    def __len__(self):
        return len(self.names)
    def __getitem__(self, i):
        return self.names[i], self.grades[i]
book = Gradebook(["Ada", "Alan", "Grace", "Linus"], [91, 78, 85, 69])
print(len(book))
print(book[2])
</pre>

Now for something a bit new. A generator is a function that uses `yield` instead of `return`. A `return` hands back one value and the function is finished. A `yield` hands back a value and pauses, and when the next value is asked for, the function carries on from that same spot.

<pre class="py">
def three_steps():
    yield "ready"
    yield "steady"
    yield "go"
for word in three_steps():
    print(word)
</pre>

If you put a `print` between the yields, you can actually watch it pause. The generator's lines and the loop's lines take turns.

<pre class="py">
def three_steps():
    print("  starting")
    yield "ready"
    print("  carrying on")
    yield "steady"
    print("  last one")
    yield "go"
for word in three_steps():
    print(word)
</pre>

A `yield` inside a loop hands out one value on every pass. `list()` collects everything a generator yields into a list.

<pre class="py">
def countdown(n):
    while n > 0:
        yield n
        n -= 1
list(countdown(3))
</pre>

That makes generators perfect for handing things out a few at a time. A ride takes 4 people at once. Write a generator `groups(people, size)` that yields the queue as lists of `size` people, in order, so 10 people come out as groups of 4, 4 and 2.

<figure class="diagram"><svg viewBox="0 0 536 76" style="max-width:536px" role="img" aria-label="Ten people in a queue split into groups of 4, 4 and 2"><rect class="card" x="24" y="10" width="176" height="56" rx="12"/><circle class="person" cx="49" cy="38" r="16"/><text class="mono" x="49" y="43" text-anchor="middle">1</text><circle class="person" cx="91" cy="38" r="16"/><text class="mono" x="91" y="43" text-anchor="middle">2</text><circle class="person" cx="133" cy="38" r="16"/><text class="mono" x="133" y="43" text-anchor="middle">3</text><circle class="person" cx="175" cy="38" r="16"/><text class="mono" x="175" y="43" text-anchor="middle">4</text><rect class="card" x="222" y="10" width="176" height="56" rx="12"/><circle class="person" cx="247" cy="38" r="16"/><text class="mono" x="247" y="43" text-anchor="middle">5</text><circle class="person" cx="289" cy="38" r="16"/><text class="mono" x="289" y="43" text-anchor="middle">6</text><circle class="person" cx="331" cy="38" r="16"/><text class="mono" x="331" y="43" text-anchor="middle">7</text><circle class="person" cx="373" cy="38" r="16"/><text class="mono" x="373" y="43" text-anchor="middle">8</text><rect class="card" x="420" y="10" width="92" height="56" rx="12"/><circle class="person" cx="445" cy="38" r="16"/><text class="mono" x="445" y="43" text-anchor="middle">9</text><circle class="person" cx="487" cy="38" r="16"/><text class="mono" x="487" y="43" text-anchor="middle">10</text></svg></figure>

<pre class="py" data-skip="true">
def groups(people, size):
    ...  # your code here
queue = list(range(1, 11))
list(groups(queue, 4))
</pre>
<pre class="py-check">
got = list(groups(list(range(1, 11)), 4))
assert [len(g) for g in got] == [4, 4, 2], f"Got group sizes {[len(g) for g in got]}. Step through with range(0, len(people), size)."
assert [p for g in got for p in g] == list(range(1, 11)), "Together the groups should cover the whole queue, in order."
</pre>
<pre class="py-solution">
def groups(people, size):
    for start in range(0, len(people), size):
        yield people[start:start + size]
queue = list(range(1, 11))
list(groups(queue, 4))
</pre>

A `for` loop over an object calls its `__iter__` method, and whatever that hands out is what the loop gets. Writing `__iter__` as a generator is the easiest way.

<pre class="py">
class Countdown:
    def __init__(self, start):
        self.start = start
    def __iter__(self):
        n = self.start
        while n > 0:
            yield n
            n -= 1
c = Countdown(3)
for x in c:
    print(x)
</pre>

Loop over it a second time and it starts again from the top, because every new loop calls `__iter__` again.

<pre class="py">
for x in c:
    print(x)
</pre>

One more trick. A dataclass writes the boring `__init__` and `__repr__` for you, which is handy for a bundle of related values. Put `@dataclass` on the line above the class, then list each attribute as `name: type`, using the type names you saw from `type()`, like `str` and `int`. Add `=` to give one a default.

<pre class="py">
from dataclasses import dataclass
@dataclass
class Book:
    title: str
    author: str
    pages: int = 0
</pre>

You get an `__init__` that takes the attributes in that order, and a `__repr__` that shows them all.

<pre class="py">
dune = Book("Dune", "Frank Herbert", 412)
print(dune)
print(dune.title)
print(Book("Emma", "Jane Austen"))
</pre>

<!-- lab:library -->

Write a Library class that keeps track of which books are on the shelf. You can add a book, check a book out, return it, and list the books that are available. Checking out a book that isn't on the shelf shouldn't crash, it should say the book isn't available. Then add the three books below, check out Dune, try to check out Dune again, and print the books that are still available.

<pre class="py" data-lab="true">
books = ["Dune", "Emma", "Ulysses"]
# your code here
</pre>
<pre class="py-solution">
class Library:
    def __init__(self):
        self.available = []
    def add(self, title):
        self.available.append(title)
    def check_out(self, title):
        if title not in self.available:
            print(title, "isn't available")
            return False
        self.available.remove(title)
        return True
    def give_back(self, title):
        self.available.append(title)
    def books(self):
        return list(self.available)
library = Library()
for title in ["Dune", "Emma", "Ulysses"]:
    library.add(title)
library.check_out("Dune")
library.check_out("Dune")
print(library.books())
</pre>
<pre class="py-rubric">
- Defines a Library class whose instances keep track of their own books.
- Has methods to add a book, check one out, return one, and list the available books.
- Checking out a book that isn't available reports that, for example by printing a message or returning False, and doesn't raise an error.
- Runs the steps given and shows that the second checkout of Dune was refused, and that Emma and Ulysses are still available.
</pre>

<!-- /lab:library -->

## Code other people can read

Once you've written a few classes, you'll spend more time reading code than writing it, and so will anyone who uses yours. Docstrings are the cheapest fix. Give `Rectangle` a docstring for the class, saying what it represents, and one for `area`. Then look at what `help` shows.

<pre class="py" data-skip="true">
class Rectangle(Shape):
    def __init__(self, width, height):
        super().__init__("rectangle")
        self.width = width
        self.height = height
    def area(self):
        return self.width * self.height
help(Rectangle.area)
</pre>
<pre class="py-check">
assert Rectangle.__doc__ and len(Rectangle.__doc__.strip()) > 10, "Put a string in triple quotes as the first line inside the class."
assert Rectangle.area.__doc__ and len(Rectangle.area.__doc__.strip()) > 5, "Put a string in triple quotes as the first line inside area."
assert Rectangle(3, 4).area() == 12, "The class itself should still work the same."
</pre>
<pre class="py-solution">
class Rectangle(Shape):
    """A rectangle with a width and a height."""
    def __init__(self, width, height):
        super().__init__("rectangle")
        self.width = width
        self.height = height
    def area(self):
        """Return width times height."""
        return self.width * self.height
help(Rectangle.area)
</pre>

Good names do even more work than docstrings. Here's a function written as badly as possible. Try it on a few lists to work out what it does, then rewrite it as `fit_to_budget(prices, budget)` with names that say what things are and a docstring, and make sure it behaves exactly the same.

<pre class="py" data-skip="true">
def f(l, m):
    s = sum(l)
    if s > m:
        return [x * m / s for x in l]
    return l
print(f([20, 30], 100))
print(f([20, 30], 25))
# your code here
</pre>
<pre class="py-check">
import math
assert "fit_to_budget" in globals(), "Define a function called fit_to_budget."
assert fit_to_budget.__doc__, "Give fit_to_budget a docstring."
for values, limit in [([20, 30], 100), ([20, 30], 25), ([10, 10, 20], 30), ([0, 0], 5)]:
    got, want = fit_to_budget(values, limit), f(values, limit)
    assert len(got) == len(want) and all(math.isclose(a, b) for a, b in zip(got, want)), f"fit_to_budget({values}, {limit}) gave {got}, but the original gives {want}."
</pre>
<pre class="py-solution">
def f(l, m):
    s = sum(l)
    if s > m:
        return [x * m / s for x in l]
    return l
print(f([20, 30], 100))
print(f([20, 30], 25))
def fit_to_budget(prices, budget):
    """Shrink every price by the same factor so the total fits the budget."""
    total = sum(prices)
    if total > budget:
        return [p * budget / total for p in prices]
    return prices
fit_to_budget([20, 30], 25)
</pre>

## Picking teams

One last piece first. `random.Random(seed)` makes your own random generator, and the seed fixes which random numbers it produces, so the same seed gives the same result on every run. Its `shuffle` mixes a list in place, the way `.sort()` sorts one in place.

<pre class="py">
import random
rng = random.Random(0)
cards = ["A", "K", "Q", "J"]
rng.shuffle(cards)
cards
</pre>

Now put the pieces together. Write a `TeamPicker` class that takes a list of people, a team size and a `shuffle` flag. Looping over it with `for team in picker` should hand out the teams, mixed up in a fresh random order every time if `shuffle` is on. Without `shuffle` the teams follow the order of the list. Either way every team has `size` people, except the last, which takes whoever is left, just like the ride queue. Writing `__iter__` as a generator is what makes the `for` loop work.

<pre class="py" data-skip="true">
import random
class TeamPicker:
    def __init__(self, people, size, shuffle=False, seed=0):
        self.people = people
        self.size = size
        self.shuffle = shuffle
        self.rng = random.Random(seed)
    def __iter__(self):
        ...  # your code here
names = ["Ada", "Alan", "Grace", "Linus", "Guido", "Barbara", "Ken", "Margaret", "Dennis", "Edsger"]
for team in TeamPicker(names, 4, shuffle=True):
    print(team)
</pre>
<pre class="py-check">
plain = list(TeamPicker(names, 4))
assert [len(t) for t in plain] == [4, 4, 2], "Without shuffle you should get teams of 4, 4 and 2."
assert [p for t in plain for p in t] == names, "Without shuffle the teams should follow the original order."
picker = TeamPicker(names, 4, shuffle=True)
mixed = [p for t in picker for p in t]
assert sorted(mixed) == sorted(names), "A shuffled round should still put everyone in exactly one team."
assert mixed != names, "With shuffle=True the order should change. Copy the list and use self.rng.shuffle on the copy."
</pre>
<pre class="py-solution">
import random
class TeamPicker:
    def __init__(self, people, size, shuffle=False, seed=0):
        self.people = people
        self.size = size
        self.shuffle = shuffle
        self.rng = random.Random(seed)
    def __iter__(self):
        order = list(self.people)
        if self.shuffle:
            self.rng.shuffle(order)
        for start in range(0, len(order), self.size):
            yield order[start:start + self.size]
names = ["Ada", "Alan", "Grace", "Linus", "Guido", "Barbara", "Ken", "Margaret", "Dennis", "Edsger"]
for team in TeamPicker(names, 4, shuffle=True):
    print(team)
</pre>

Hold on to that pattern, a class that holds a pile of things and hands them out in shuffled groups when you loop over it. You'll for sure meet it again later in the course, just with a different name.

<p class="credit">A few exercises on this page are adapted from Software Carpentry's <a href="https://swcarpentry.github.io/python-novice-gapminder/">Plotting and Programming in Python</a>, &copy; <a href="https://carpentries.org/">The Carpentries</a>, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>, and rewritten for this course.</p>

<nav class="lesson-nav">
  <a class="prev" href="/course/lecture-0/data/">&larr; Working with Data</a>
  <a class="next" href="/course/">Course &rarr;</a>
</nav>

<script src="/course/assets/course.js"></script>
<script src="/course/assets/python-cells.js" data-traces="/course/assets/traces/oop.json"></script>
