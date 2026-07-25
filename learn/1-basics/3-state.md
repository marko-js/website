# Adding State

So far our templates have been static. The `<let>` tag introduces state: a
value that can change over time, with every expression that uses it updating
automatically.

```marko playground
<let/volume=40>

<label>
  Volume
  <input type="range" min=0 max=100 value:parseFloat:=volume>
</label>
<p>${volume === 0 ? "Muted" : `Playing at ${volume}%`}</p>
<button onClick() {
  volume = 0;
}>
  Mute
</button>
```

Drag the slider in the preview. The `:=` shorthand keeps the input and the
`volume` variable in sync in both directions, and the `Mute` button assigns to
the same variable from an event handler.

There is no render function and no subscription to manage. The compiler sees
which expressions read `volume` and wires up exactly the updates needed.
