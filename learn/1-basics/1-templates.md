# Templates Are HTML

Welcome! This is a hands-on tour of Marko. Each lesson loads files into the
editor on the right, and everything we type compiles and runs immediately in
the preview below it.

Marko is a superset of HTML, so nearly any valid HTML is already a valid
template. The editor starts with an event flyer written in plain HTML:

```marko playground
<h1>Open Mic Night</h1>
<p>Every Thursday at the corner cafe.</p>
<ul>
  <li>Doors at 7pm</li>
  <li>Sign-ups at the bar</li>
  <li>Five minutes per act</li>
</ul>
```

Try changing some of the markup and watch the preview update.

## Attributes

Attribute values are JavaScript expressions, not strings. That means template
literals, math, objects, and function calls all work directly in markup:

```marko playground
<const/host="events@example.com">

<h1 style={ color: "rebeccapurple" }>Open Mic Night</h1>
<p>Every Thursday at the corner cafe.</p>
<a href=`mailto:${host}`>Email the host</a>
```

Load this version and try giving the heading a different color, or computing
one from an expression.
