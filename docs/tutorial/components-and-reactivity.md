# Components and Reactivity

In this tutorial, we're going to build an app for converting temperature between fahrenheit and celsius.

## Introducing a Tag

As with many user interfaces, our first step is to gather input from the user. We can do so with HTML's `<input>` tag:

```marko
<input type="number">
```

## Adding State

Of course, right now we aren't keeping track of the value that this input contains. To do this, we need to introduce state. In Marko, the most common way to do this is with [tag variables](../reference/language.md#tag-variables). Here, we will use [Marko's `<let>` tag](../reference/core-tag.md#let):

```marko
<let/degF=80>

<input type="number" value=degF>
<div>It's ${degF}°F</div>
```

## Syncing State

Now the `<input>` has an initial value, but we still aren't keeping track of it when it changes. One way to do this is by listening for [the `input` event](https://developer.mozilla.org/en-US/docs/Web/API/Element/input_event) with an [event handler](../reference/native-tag.md#event-handlers):

```marko
<let/degF=80>

<input type="number" value=degF onInput(e) {
  degF = +e.target.value;
}>
<div>It's ${degF}°F</div>
```

Aha! Now we have a [reactive variable](../reference/reactivity.md) that keeps track of our value for degrees (in fahrenheit). Let's convert it to celsius!

> [!NOTE]
> For more control over the `<input>` value, we could have used Marko's [controllable](../reference/native-tag.md#change-handlers) pattern.

## Adding Computed Values

To do this, we can use a `<const>` tag:

```marko
<let/degF=80>
<const/degC=(degF - 32) * 5 / 9>

<input type="number" value=degF onInput(e) {
  degF = +e.target.value;
}>
<div>
  ${degF}°F ↔ ${degC.toFixed(1)}°C
</div>
```

## Using Conditionals

Now that we have a reactive variable, let's see what else we can do! Maybe some notes about the temperature, using [conditional tags](../reference/core-tag.md#if--else)?

```marko
<let/degF=80>
<const/degC=(degF - 32) * 5 / 9>

<input type="number" value=degF onInput(e) {
  degF = +e.target.value;
}>
<div>
  ${degF}°F ↔ ${degC.toFixed(1)}°C
</div>

<if=(degF > 90)>
  It's <strong>hot</strong> 🥵
</if>
<else if=(degF > 60)>
  Lovely day! 😎
</else>
<else if=(degF < 32)>
  Brrrrr 🥶
</else>
```

## Adding Styles and Visualization

Or what about a temperature gauge, with some fancy CSS?

```marko
<let/degF=80>
<const/degC=(degF - 32) * 5 / 9>

<input type="number" value=degF onInput(e) {
  degF = +e.target.value;
}>
<div>
  ${degF}°F ↔ ${degC.toFixed(1)}°C
</div>

<div class="gauge">
  <div class="needle" style={"--rotation": `${degF * 180 / 100}deg`}/>
</div>

<style>
  .gauge {
    position: relative;
    width: 8rem;
    height: 4rem;
    border-radius: 4rem 4rem 0 0;
    background: conic-gradient(from 270deg at 50% 100%, lightblue, blue, green, orange, red 180deg);
  }

  .needle {
    position: absolute;
    box-sizing: border-box;
    width: 4rem;
    height: 4px;
    bottom: -2px;
    background: black;
    border: 1px solid white;
    transform-origin: right;
    transform: rotate(var(--rotation));
  }
</style>
```

## Creating Reusable Components

Actually, this is getting a little bit too complex to all put in one place. Maybe we should pull that temperature gauge out into a component:

```marko
/* index.marko */
<let/degF=80>
<const/degC=(degF - 32) * 5 / 9>

<input type="number" value=degF onInput(e) {
  degF = +e.target.value;
}>
<div>
  ${degF}°F ↔ ${degC.toFixed(1)}°C
</div>

<gauge temperature=degF/>
```

```marko
/* gauge.marko */
<div class="gauge">
  <div class="needle" style={"--rotation": `${input.temperature * 180 / 100}deg`}/>
</div>

<if=(input.temperature > 90)>
  It's <strong>hot</strong> 🥵
</if>
<else if=(input.temperature > 60)>
  Lovely day! 😎
</else>
<else if=(input.temperature < 32)>
  Brrrrr 🥶
</else>

<style>
  .gauge {
    position: relative;
    width: 8rem;
    height: 4rem;
    border-radius: 4rem 4rem 0 0;
    background: conic-gradient(from 270deg at 50% 100%, lightblue, blue, green, orange, red 180deg);
  }

  .needle {
    position: absolute;
    box-sizing: border-box;
    width: 4rem;
    height: 4px;
    bottom: -2px;
    background: black;
    border: 1px solid white;
    transform-origin: right;
    transform: rotate(var(--rotation));
  }
</style>
```

## What's next?

That's all we're going to build for now, but feel free to add more! Here are some ideas:

- How about a new temperature unit? Maybe Kelvin or [Delisle](https://en.wikipedia.org/wiki/Delisle_scale)?
- Most of the world actually uses celsius 😅, maybe users should be able pick which unit to start with
- What about wind chill? Apparently there are [standard formulas](https://en.wikipedia.org/wiki/Wind_chill) if "wind velocity" is known
- Converting between temperatures is cool, but this system _could_ be generalized. What if it converted between weights, volumes, or distances?
- Anything else! The opportunities are limitless!
