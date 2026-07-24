import{C as e,S as t,Z as n}from"./_CsyIVTFD.js";import"./_BKX30mk1.js";import{a as r,c as i,i as a,l as o,n as s,o as c,r as l,s as u,t as d,u as f}from"./_Hd4xckUT.js";import{a as p,i as m,n as h,o as g,r as _,t as v}from"./_Cn__WP6m.js";var y=(e=>`<h1 id=custom-tags>Custom Tags</h1><p>Marko discovers components from the file system: any template in a <code>tags/</code> directory can be used as a tag, no imports required. This lesson&#39;s editor has two files. <code>index.marko</code> renders a <code>&lt;rating-stars></code> tag, and <code>tags/rating-stars.marko</code> defines it.</p>${e}<p>Click the stars in the preview. The parent passes <code>value:=stars</code>, which is shorthand for providing both <code>value</code> and a <code>valueChange</code> handler, so the child can report clicks back without any event wiring.</p><p>Try switching between the two files with the tabs above the editor, then add a <code>half</code> star or change the maximum rating.</p>`)(p),b=(e=>`c/${e}&c`)(g),x=t(`eAO1065`,((e,t)=>`${e}${t}<!>`)(o,o),((e,t)=>`/${e}&/${t}&b`)(f,f),e=>{i(e.a),l(e.a,`marko`),s(e.a,`index.marko`),c(e.a,`<let/stars=3>
<h1>Rate the Show</h1>
<rating-stars value:=stars/>
<p>You rated it \${stars} of 5</p>`),a(e.a,[`let/stars=3
h1 -- Rate the Show
rating-stars value:=stars
p -- You rated it \${stars} of 5`,`<let/stars=3>

<h1>Rate the Show</h1>
<rating-stars value:=stars/>
<p>You rated it \${stars} of 5</p>`,`let/stars=3

h1 -- Rate the Show
rating-stars value:=stars
p -- You rated it \${stars} of 5`]),d(e.a),r(e.a),u(e.a),i(e.b),l(e.b,`marko`),s(e.b,`tags/rating-stars.marko`),c(e.b,`<span>
  <for|i| from=1 to=5>
    <button onClick() {
      input.valueChange?.(i);
    }>
      \${i <= input.value ? "★" : "☆"}
    </button>
  </for>
</span>`),a(e.b,[`span
  for|i| from=1 to=5
    button onClick() {
      input.valueChange?.(i);
    } --
      \${i <= input.value ? "★" : "☆"}`]),d(e.b),r(e.b),u(e.b)});function S(e){m(e.a),h(e.a,x(e)),_(e.a,[{path:`index.marko`,content:`<let/stars=3>

<h1>Rate the Show</h1>
<rating-stars value:=stars/>
<p>You rated it \${stars} of 5</p>
`},{path:`tags/rating-stars.marko`,content:`<span>
  <for|i| from=1 to=5>
    <button onClick() {
      input.valueChange?.(i);
    }>
      \${i <= input.value ? "★" : "☆"}
    </button>
  </for>
</span>
`}]),v(e.a,!0)}e(`ebaXKbZ`,(e=>`<!>${e}<!>`)(y),(e=>`b/${e}&b`)(b),e=>{S(e.a)}),n();
//# sourceMappingURL=learn.basics-rTsaHLNp.js.map