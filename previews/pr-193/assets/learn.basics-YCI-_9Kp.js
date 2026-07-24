import{C as e,S as t,Z as n}from"./_CsyIVTFD.js";import"./_BKX30mk1.js";import{a as r,c as i,i as a,l as o,n as s,o as c,r as l,s as u,t as d,u as f}from"./_Hd4xckUT.js";import{a as p,i as m,n as h,o as g,r as _,t as v}from"./_Cn__WP6m.js";var y=((e,t)=>`<h1 id=dynamic-content>Dynamic Content</h1><p>Tag content works like a JavaScript template literal, so <code>&#36;{expressions}</code> interpolate anywhere text can appear. The <code>&lt;const></code> tag gives a value a name that the rest of the template can use.</p>${e}<p>Try renaming the album or changing the track count. The derived line at the bottom recalculates automatically because it is just an expression over the same value.</p><section id=lists><h2><a href=#lists>Lists</a></h2><p>The <code>&lt;for></code> tag repeats its body for each item:</p>${t}<p>Add a track to the array and it appears in the list.</p></section>`)(p,p),b=((e,t)=>`c/${e}&bDc/${t}&l`)(g,g),x=t(`UOIyINm`,(e=>`${e}<!>`)(o),(e=>`/${e}&b`)(f),e=>{i(e.a),l(e.a,`marko`),c(e.a,`<const/lineup=["Overture", "City Lights", "Last Exit"]>
<h1>Track List</h1>
<ol>
  <for|track| of=lineup>
    <li>\${track}</li>
  </for>
</ol>`),a(e.a,[`const/lineup=["Overture", "City Lights", "Last Exit"]
h1 -- Track List
ol
  for|track| of=lineup
    li -- \${track}`,`<const/lineup=["Overture", "City Lights", "Last Exit"]>

<h1>Track List</h1>
<ol>
  <for|track| of=lineup>
    <li>\${track}</li>
  </for>
</ol>`,`const/lineup=["Overture", "City Lights", "Last Exit"]

h1 -- Track List
ol
  for|track| of=lineup
    li -- \${track}`]),d(e.a),r(e.a),u(e.a),s(e.a)}),S=t(`J_GMLmg`,(e=>`${e}<!>`)(o),(e=>`/${e}&b`)(f),e=>{i(e.a),l(e.a,`marko`),c(e.a,`<const/album={
  title: "Night Drive",
  tracks: 9,
  minutes: 34
}>
<h1>\${album.title}</h1>
<p>\${album.tracks} tracks, \${album.minutes} minutes</p>
<p>About \${Math.round(album.minutes / album.tracks)} minutes per track</p>`),a(e.a,[`const/album={
  title: "Night Drive",
  tracks: 9,
  minutes: 34
}
h1 -- \${album.title}
p -- \${album.tracks} tracks, \${album.minutes} minutes
p -- About \${Math.round(album.minutes / album.tracks)} minutes per track`,`<const/album={ title: "Night Drive", tracks: 9, minutes: 34 }>

<h1>\${album.title}</h1>
<p>\${album.tracks} tracks, \${album.minutes} minutes</p>
<p>About \${Math.round(album.minutes / album.tracks)} minutes per track</p>`,`const/album={ title: "Night Drive", tracks: 9, minutes: 34 }

h1 -- \${album.title}
p -- \${album.tracks} tracks, \${album.minutes} minutes
p -- About \${Math.round(album.minutes / album.tracks)} minutes per track`]),d(e.a),r(e.a),u(e.a),s(e.a)});function C(e){m(e.a),h(e.a,S(e)),_(e.a,[{path:`index.marko`,content:`<const/album={ title: "Night Drive", tracks: 9, minutes: 34 }>

<h1>\${album.title}</h1>
<p>\${album.tracks} tracks, \${album.minutes} minutes</p>
<p>About \${Math.round(album.minutes / album.tracks)} minutes per track</p>
`}]),v(e.a,!0),m(e.b),h(e.b,x(e)),_(e.b,[{path:`index.marko`,content:`<const/lineup=["Overture", "City Lights", "Last Exit"]>

<h1>Track List</h1>
<ol>
  <for|track| of=lineup>
    <li>\${track}</li>
  </for>
</ol>
`}]),v(e.b)}e(`erGStoc`,(e=>`<!>${e}<!>`)(y),(e=>`b/${e}&b`)(b),e=>{C(e.a)}),n();
//# sourceMappingURL=learn.basics-YCI-_9Kp.js.map