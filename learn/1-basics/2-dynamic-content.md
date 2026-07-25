# Dynamic Content

Tag content works like a JavaScript template literal, so `${expressions}`
interpolate anywhere text can appear. The `<const>` tag gives a value a name
that the rest of the template can use.

```marko playground
<const/album={ title: "Night Drive", tracks: 9, minutes: 34 }>

<h1>${album.title}</h1>
<p>${album.tracks} tracks, ${album.minutes} minutes</p>
<p>About ${Math.round(album.minutes / album.tracks)} minutes per track</p>
```

Try renaming the album or changing the track count. The derived line at the
bottom recalculates automatically because it is just an expression over the
same value.

## Lists

The `<for>` tag repeats its body for each item:

```marko playground
<const/lineup=["Overture", "City Lights", "Last Exit"]>

<h1>Track List</h1>
<ol>
  <for|track| of=lineup>
    <li>${track}</li>
  </for>
</ol>
```

Add a track to the array and it appears in the list.
