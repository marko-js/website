# Components and Reactivity

> [!TLDR]
>
> - Build a temperature converter using `<let>`, `<const>`, and `:=` binding
> - Add conditional status messages and reactive CSS custom properties
> - Extract reusable markup into a custom component in `tags/`

In this tutorial, we will build an interactive app that converts temperatures between Fahrenheit and Celsius.

## Introducing a Tag

First, let's gather a temperature from the user with a native HTML `<input>`:

```marko
<input type="number">
```

## Adding State

To track the temperature, we declare mutable state with a [tag variable](../reference/language.md#tag-variables) using [`<let>`](../reference/core-tag.md#let):

```marko
<let/degF=80>

<input type="number" value=degF>
<div>It's ${degF}°F</div>
```

## Syncing State

The input starts at `80`, but typing into it does not yet update `degF`. Listening to the native [`input` event](https://developer.mozilla.org/en-US/docs/Web/API/Element/input_event) is tempting:

```marko
// Warning: prefer change handlers below
<let/degF=80>

<input
  type="number"
  value=degF
  onInput(e, el) {
    degF = parseFloat(el.value);
  }
>
<div>It's ${degF}°F</div>
```

In HTML, `value=` sets the [_default_ value](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#value), not the live value, so the input can fall out of sync with `degF`. Instead, we use Marko's [controllable](../reference/native-tag.md#change-handlers) `valueChange` handler:

```marko
<let/degF=80>

<input
  type="number"
  value=degF
  valueChange(value) {
    degF = parseFloat(value);
  }
>
<div>It's ${degF}°F</div>
```

Because this pattern is so common, Marko provides the [binding shorthand](../reference/language.md#shorthand-change-handlers-two-way-binding) with a refining function:

```marko
<let/degF=80>

<input type="number" value:parseFloat:=degF>
<div>It's ${degF}°F</div>
```

## Adding Computed Values

Next, we derive Celsius from `degF` with [`<const>`](../reference/core-tag.md#const):

```marko
<let/degF=80>
<const/degC=((degF - 32) * 5) / 9>

<input type="number" value:parseFloat:=degF>
<div>${degF}°F ↔ ${degC.toFixed(1)}°C</div>
```

Because `degC` is a [tag variable](../reference/language.md#tag-variables) derived from `degF`, it recomputes automatically whenever `degF` changes.

## Using Conditionals

Let's add temperature feedback with [`<if>` and `<else>`](../reference/core-tag.md#if--else):

```marko
<let/degF=80>
<const/degC=((degF - 32) * 5) / 9>

<input type="number" value:parseFloat:=degF>
<div>${degF}°F ↔ ${degC.toFixed(1)}°C</div>

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

## Adding Styles

Now let's visualize the reading with a CSS gauge whose needle rotates via a custom property:

```marko
<let/degF=80>
<const/degC=((degF - 32) * 5) / 9>

<input type="number" value:parseFloat:=degF>
<div>${degF}°F ↔ ${degC.toFixed(1)}°C</div>

<div class="gauge">
  <div
    class="needle"
    style={ "--rotation": `${Math.min(180, Math.max(0, (degF * 180) / 100))}deg` }
  />
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

<style>
  .gauge {
    position: relative;
    width: 8rem;
    height: 4rem;
    border-radius: 4rem 4rem 0 0;
    background: conic-gradient(
      from 270deg at 50% 100%,
      lightblue,
      blue,
      green,
      orange,
      red 180deg
    );
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

## Reusable Components

Great! This template is growing, so let's extract the gauge, status message, and styles into a dedicated `<gauge>` component:

```marko
/* index.marko */
<let/degF=80>
<const/degC=((degF - 32) * 5) / 9>

<input type="number" value:parseFloat:=degF>
<div>${degF}°F ↔ ${degC.toFixed(1)}°C</div>

<gauge temperature=degF/>
```

```marko
/* tags/gauge.marko */
export interface Input {
  temperature: number;
}

<div class="gauge">
  <div
    class="needle"
    style={
      "--rotation": `${Math.min(180, Math.max(0, (input.temperature * 180) / 100))}deg`,
    }
  />
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
    background: conic-gradient(
      from 270deg at 50% 100%,
      lightblue,
      blue,
      green,
      orange,
      red 180deg
    );
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

> [!IMPORTANT]
> Place `gauge.marko` inside a `tags/` directory so Marko [discovers it automatically](../reference/custom-tag.md#relative-custom-tags).

## Going Further

Here are a few ways to extend this app:

- Add another unit such as Kelvin or [Delisle](https://en.wikipedia.org/wiki/Delisle_scale).
- Add a unit toggle so the input can start in Celsius or Fahrenheit.
- Calculate [wind chill](https://en.wikipedia.org/wiki/Wind_chill) by adding a wind speed input.
- Generalize the converter to handle weights, volumes, or distances.

## Next Steps

- [Nested Reactivity](../explanation/nested-reactivity.md)
- [Language Reference](../reference/language.md)
