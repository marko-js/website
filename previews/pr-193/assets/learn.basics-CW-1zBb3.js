import{C as e,S as t,Z as n}from"./_CsyIVTFD.js";import"./_BKX30mk1.js";import{a as r,c as i,i as a,l as o,n as s,o as c,r as l,s as u,t as d,u as f}from"./_Hd4xckUT.js";import{a as p,i as m,n as h,o as g,r as _,t as v}from"./_CqFiW3Ns.js";var y=(e=>`<h1 id=adding-state>Adding State</h1><p>So far our templates have been static. The <code>&lt;let></code> tag introduces state: a value that can change over time, with every expression that uses it updating automatically.</p>${e}<p>Drag the slider in the preview. The <code>:=</code> shorthand keeps the input and the <code>volume</code> variable in sync in both directions, and the <code>Mute</code> button assigns to the same variable from an event handler.</p><p>There is no render function and no subscription to manage. The compiler sees which expressions read <code>volume</code> and wires up exactly the updates needed.</p>`)(p),b=(e=>`c/${e}&c`)(g),x=t(`RubDAeH`,(e=>`${e}<!>`)(o),(e=>`/${e}&b`)(f),e=>{i(e.a),l(e.a,`marko`),c(e.a,`<let/volume=40>
<label>
  Volume\${" "}
  <input type="range" min=0 max=100 value:parseFloat:=volume>
</label>
<p>\${volume === 0 ? "Muted" : \`Playing at \${volume}%\`}</p>
<button onClick() {
  volume = 0;
}>Mute</button>`),a(e.a,[`let/volume=40
label
  -- Volume\${" "}
  input type="range" min=0 max=100 value:parseFloat:=volume
p -- \${volume === 0 ? "Muted" : \`Playing at \${volume}%\`}
button onClick() {
  volume = 0;
} -- Mute`,`<let/volume=40>

<label>
  Volume
  <input type="range" min=0 max=100 value:parseFloat:=volume>
</label>
<p>\${volume === 0 ? "Muted" : \`Playing at \${volume}%\`}</p>
<button onClick() {
  volume = 0;
}>Mute</button>`,`let/volume=40

label
  -- Volume
  input type="range" min=0 max=100 value:parseFloat:=volume
p -- \${volume === 0 ? "Muted" : \`Playing at \${volume}%\`}
button onClick() {
  volume = 0;
} -- Mute`]),d(e.a),r(e.a),u(e.a),s(e.a)});function S(e){m(e.a),h(e.a,x(e)),_(e.a,[{path:`index.marko`,content:`<let/volume=40>

<label>
  Volume
  <input type="range" min=0 max=100 value:parseFloat:=volume>
</label>
<p>\${volume === 0 ? "Muted" : \`Playing at \${volume}%\`}</p>
<button onClick() {
  volume = 0;
}>
  Mute
</button>
`}]),v(e.a,!0)}e(`UQCDTNm`,(e=>`<!>${e}<!>`)(y),(e=>`b/${e}&b`)(b),e=>{S(e.a)}),n();
//# sourceMappingURL=learn.basics-CW-1zBb3.js.map