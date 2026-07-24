# Custom Tags

Marko discovers components from the file system: any template in a `tags/`
directory can be used as a tag, no imports required. This lesson's editor has
two files. `index.marko` renders a `<rating-stars>` tag, and
`tags/rating-stars.marko` defines it.

```marko playground
/* index.marko */
<let/stars=3>

<h1>Rate the Show</h1>
<rating-stars value:=stars/>
<p>You rated it ${stars} of 5</p>
```

```marko playground
/* tags/rating-stars.marko */
<span>
  <for|i| from=1 to=5>
    <button onClick() {
      input.valueChange?.(i);
    }>
      ${i <= input.value ? "★" : "☆"}
    </button>
  </for>
</span>
```

Click the stars in the preview. The parent passes `value:=stars`, which is
shorthand for providing both `value` and a `valueChange` handler, so the child
can report clicks back without any event wiring.

Try switching between the two files with the tabs above the editor, then add a
`half` star or change the maximum rating.
