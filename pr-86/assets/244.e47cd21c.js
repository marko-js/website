(globalThis.webpackChunk=globalThis.webpackChunk||[]).push([[244],{"../components/repl/index.marko":(e,t,n)=>{"use strict";n.d(t,{Z:()=>ne});var o=n("../../node_modules/marko/dist/runtime/vdom/index.js"),s=n("../../node_modules/@marko/tags-api-preview/dist/util/replace-assignments/index.mjs"),a=n("../../node_modules/@marko/tags-api-preview/dist/transform/cached-function/index-browser.mjs"),i=n("../../node_modules/@marko/tags-api-preview/dist/transform/native-tag-var/index-browser.mjs"),r=n("../../node_modules/@marko/tags-api-preview/dist/components/lifecycle/index.mjs"),l=n("../../node_modules/@marko/tags-api-preview/dist/components/_instance/index.marko"),d=n("../../node_modules/marko/dist/runtime/helpers/render-tag.js"),c=n.n(d),u=n("../../node_modules/marko/dist/runtime/helpers/class-value.js"),m=n.n(u),p=n("../../node_modules/@marko/tags-api-preview/dist/translate/track-rendering/index.mjs"),h=n("../../node_modules/marko/dist/runtime/components/renderer.js"),f=n.n(h),v=n("../../node_modules/marko/dist/runtime/components/registry/index-browser.js"),g=n("../../node_modules/marko/dist/runtime/components/defineComponent.js"),y=n.n(g);const w="6o3N4O4f",b=(0,o.t)(w),k=b;(0,v.r)(w,(()=>b));const _={onCreate(){this.state={}}};b._=f()((function(e,t,n,o,d){(0,p.begin)();try{var u=o,h=d;const{selectedIndexChange:f,filesChange:v,files:g,selectedIndex:y}=e,w=v||(e=>u.setState("0",e)),b=v?g:"0"in h?h[0]:h[0]=g,k=f||(e=>u.setState("1",e)),_=f?y:"1"in h?h[1]:h[1]=y,x=b[_];t.be("div",{class:"file-tabs"},"0",o,null,1);{const e="2"in h?h[2]:h[2]=1,d=e=>u.setState("2",e);let p=0;for(const e of b){let o=p++;const d=`[${o}]`;c()(l.default,{renderBody:(t,n,u,p)=>{var h=n,f=u;const v="0"in p?p[0]:p[0]=!1,g=e=>u.setState("0",e),y=x===e,C=o>0;t.be("div",{class:m()(["file-tab",{selected:y}])},"2"+d,f,null,1,{onclick:h.d("click",(function(){y?(0,s.default)(g,!0):((0,s.default)(g,!1),(0,s.default)(k,o))}),!1)}),v&&y&&C?c()(l.default,{renderBody:(t,n,l,d)=>{var c=n,u=l;const m="0"in d?d[0]:d[0]=e.name,p=(0,a.cache)((0,a.cached)(l,[m,b])||function(){const t={...e,name:m,path:e.path.replace(e.name,m)};(0,s.default)(w,[...b.slice(0,o),t,...b.slice(o+1)]),(0,s.default)(g,!1)}),h=(0,i.default)(l,"0");var f=e=>l.setState("0",e);t.e("input",{type:"text",size:m.length,value:m},"@0",u,0,0,{pa:[f&&"value"],onblur:c.d("blur",p,!1),onkeydown:c.d("keydown",(function(e){"Enter"===e.code&&p()}),!1),oninput:c.d("input",(e=>{f(e.target.value)}),!1)}),(0,r.default)(u,{onMount:(0,a.cache)((0,a.cached)(l,[m])||function(){h().focus(),h().setSelectionRange(0,m.indexOf("."))})})}},t,h,"3"+d):t.t(e.name,f),C&&(t.be("button",{class:"file-close"},"4"+d,f,null,1,{onclick:h.d("click",(function(t){window.confirm(`Delete ${e.path}?`)&&(_>=o&&(0,s.default)(k,_-1),(0,s.default)(w,[...b.slice(0,o),...b.slice(o+1)])),t.stopPropagation()}),!1)}),t.t("×",f),t.ee()),t.ee()}},t,n,"1"+d)}t.be("button",{class:"new-file"},"5",o,null,1,{onclick:n.d("click",(function(){const t={name:`Component${e}.marko`,path:`/components/Component${e}.marko`,content:""},n=b.length;(0,s.default)(w,b.concat(t)),(0,s.default)(k,n),(0,s.default)(d,e+1)}),!1)}),t.t("+",o),t.ee()}t.ee()}finally{(0,p.end)()}}),{t:w},_),b.Component=y()(_,b._);var x=n("../../node_modules/marko/dist/runtime/helpers/dynamic-tag.js"),C=n.n(x);const j="QAUP5peK",S=(0,o.t)(j),L=S;(0,v.r)(j,(()=>S));const E={};S._=f()((function(e,t,n,o,s){(0,p.begin)();try{const{actions:s,body:a}=e;t.be("div",{class:"pane"},"0",o,null,1),t.be("div",{class:"pane-actions"},"1",o,null,1),C()(t,s.renderBody,null,null,null,null,n,"2"),t.ee(),t.e("div",{class:"pane-divider"},"3",o,0,1),t.be("div",{class:"pane-body"},"4",o,null,1),C()(t,a.renderBody,null,null,null,null,n,"5"),t.ee(),t.ee()}finally{(0,p.end)()}}),{t:j,i:!0},E),S.Component=y()(E,S._);var B=n("../../node_modules/marko/dist/runtime/vdom/helpers/v-element.js"),T=n.n(B),M=n("../../node_modules/@marko/tags-api-preview/dist/components/effect/index.mjs");const O="rRMAwOPg",A=(0,o.t)(O),H=A;(0,v.r)(O,(()=>A));const I={onCreate(){this.state={}}};A._=f()((function(e,t,n,o,s){(0,p.begin)();try{var r=o;const{value:s,valueChange:l,renderBody:d,class:c}=e,u=(0,i.default)(r,"0");t.be("select",{class:m()(c)},"@0",o,null,1,{onchange:n.d("change",(function(e){l(e.target.value)}),!1)}),C()(t,d,null,null,null,null,n,"0"),t.ee(),(0,M.default)(o,(0,a.cache)((0,a.cached)(r,[s,d,l])||function(){u().value=s}))}finally{(0,p.end)()}}),{t:O},I),A.Component=y()(I,A._);var q=n("../../node_modules/lz-string/libs/lz-string.js"),F=n("../../node_modules/@marko/tags-api-preview/dist/translate/native-tag-handlers/index-browser.mjs"),U=n("../../node_modules/marko/dist/runtime/vdom/helpers/attrs.js"),P=n.n(U);const R="ftG9dvL8",z=(0,o.t)(R),N=z,$=T()("span",null,"1",null,1,0).t("Open in playground ");(0,v.r)(R,(()=>z));const D={};z._=f()((function(e,t,n,o,s){(0,p.begin)();try{const{files:s,...i}=e;var a={};t.be("a",P()((0,F.default)({...i,href:`/playground/#${(0,q.compressToEncodedURIComponent)(JSON.stringify(s))}`,target:"_top",class:"playground-link"},n,"a",a)),"0",o,null,4,{...a}),t.n($,o),t.t("↗",o),t.ee()}finally{(0,p.end)()}}),{t:R,i:!0},D),z.Component=y()(D,z._);var V=n("../../node_modules/@marko/tags-api-preview/dist/components/return/index-browser.mjs");const Y="dL815V5K",Z=(0,o.t)(Y),J=Z;(0,v.r)(Y,(()=>Z));const K={onCreate(){this.state={}}};Z._=f()((function(e,t,n,o,i){(0,p.begin)();try{var r=o,l=i;const{default:t,fallback:n}=e,d="0"in l?l[0]:l[0]=window.matchMedia(t).matches,c=e=>r.setState("0",e);(0,M.default)(o,(0,a.cache)((0,a.cached)(r,[t])||function(){const e=window.matchMedia(t),n=()=>(0,s.default)(c,!!e.matches);return e.addEventListener("change",n),(0,s.default)(c,!!e.matches),()=>e.removeEventListener("change",n)})),e._return&&e._return({default:d},1)}finally{(0,p.end)()}}),{t:Y},K),Z.Component=y()(K,Z._);const Q="V970f081",X=(0,o.t)(Q),G=X;(0,v.r)(Q,(()=>X));const W={onCreate(){this.state={}}};X._=f()((function(e,t,n,o,r){(0,p.begin)();try{var d=o,u=r;const{left:g,right:y}=e,w="0"in u?u[0]:u[0]=.5,b=e=>d.setState("0",e),k="1"in u?u[1]:u[1]=!1,_=e=>d.setState("1",e);var h=(0,V.default)(d);c()(J,{default:"(max-aspect-ratio: 1/1)",_return:h},t,n,"0");const{default:x}=h(),j=(0,i.default)(d,"0");t.be("div",{class:m()(["panes",k&&"resizing"])},"@0",o,null,1);var f={};t.be("div",P()((0,F.default)({...g,style:`flex-grow:${w}`},n,"div",f)),"1",o,null,4,{...f}),C()(t,g.renderBody,null,null,null,null,n,"2"),t.ee(),t.be("div",{class:"divider"},"3",o,null,1),t.e("div",{class:"inner"},"4",o,0,1,{onmousedown:n.d("mousedown",(function(e){(0,s.default)(_,!0),e.preventDefault(),e.stopPropagation()}),!1)}),t.ee();var v={};t.be("div",P()((0,F.default)({...y,style:"flex-grow:"+(1-w)},n,"div",v)),"5",o,null,4,{...v}),C()(t,y.renderBody,null,null,null,null,n,"6"),t.ee(),t.ee(),k&&c()(l.default,{renderBody:(e,t,n,o)=>{var i=n;(0,M.default)(i,(0,a.cache)((0,a.cached)(n,[x])||function(){const e=e=>{if(e.buttons||e.which){const t=j().getBoundingClientRect(),n=x?(e.clientY-t.top)/t.height:(e.clientX-t.left)/t.width;n>0&&(0,s.default)(b,Math.min(.8,Math.max(.2,n)))}else(0,s.default)(_,!1)};return window.addEventListener("mousemove",e),()=>window.removeEventListener("mousemove",e)}))}},t,n,"7")}finally{(0,p.end)()}}),{t:Q},W),X.Component=y()(W,X._);const ee="Y/QiYO60",te=(0,o.t)(ee),ne=te,oe=T()("option",{value:"preview"},"7",null,1,0).t("App Preview"),se=T()("option",{value:"compiled-html"},"8",null,1,0).t("Compiled (HTML)"),ae=T()("option",{value:"compiled-vdom"},"9",null,1,0).t("Compiled (DOM)");(0,v.r)(ee,(()=>te));const ie={onCreate(){this.state={}}};te._=f()((function(e,t,o,i,d){(0,p.begin)();try{var u=i,m=d;const{filesChange:h,getTranslator:f,files:v}=e,g="0"in m?m[0]:m[0]=0,y=e=>u.setState("0",e),w="1"in m?m[1]:m[1]="preview",b=e=>u.setState("1",e),_="2"in m?m[2]:m[2]=!1,x=e=>u.setState("2",e),j=v[g];c()(G,{left:{class:"editor-container",renderBody:e=>{c()(L,{actions:{renderBody:e=>{c()(k,{files:v,filesChange:h,selectedIndex:g,selectedIndexChange:y},e,o,"2")}},body:{renderBody:e=>{c()(l.default,{renderBody:(e,t,o,i)=>{var l=t,d=o;const c="0"in i?i[0]:i[0]=null,u=e=>o.setState("0",e);C()(e,c,(()=>({value:j.content,filename:j.path,valueChange:(0,a.cache)((0,a.cached)(o,[j,v,g])||function(e){const t={...j,content:e};(0,s.default)(h,[...v.slice(0,g),t,...v.slice(g+1)]),(0,s.default)(x,!0)})})),null,null,null,l,"4"),(0,r.default)(d,{onMount:async()=>{const e=await Promise.all([n.e(103),n.e(400),n.e(109),n.e(888),n.e(176)]).then(n.bind(n,"../components/repl/components/editor.marko"));await e.loading,(0,s.default)(u,e)}})}},e,o,"3")}}},e,o,"1")}},right:{renderBody:e=>{c()(L,{actions:{renderBody:e=>{c()(H,{value:w,valueChange:function(e){(0,s.default)(b,e),(0,s.default)(x,!1)},class:"preview-select",renderBody:e=>{e.n(oe,i),e.n(se,i),e.n(ae,i)}},e,o,"6"),c()(N,{files:v},e,o,"10")}},body:{renderBody:e=>{c()(l.default,{renderBody:(e,t,o,a)=>{var i=t,l=o;const d="0"in a?a[0]:a[0]=null,c=e=>o.setState("0",e);C()(e,d,(()=>({type:w,files:v,selectedFile:j,getTranslator:f,debounce:_})),null,null,null,i,"12"),(0,r.default)(l,{onMount:async()=>{(0,s.default)(c,await Promise.all([n.e(103),n.e(641),n.e(400),n.e(648),n.e(888),n.e(546),n.e(25)]).then(n.bind(n,"../components/repl/components/preview.marko")))}})}},e,o,"11")}}},e,o,"5")}}},t,o,"0")}finally{(0,p.end)()}}),{t:ee},ie),te.Component=y()(ie,te._)},"./playground/components/hash-value.marko":(e,t,n)=>{"use strict";n.d(t,{Z:()=>v});var o=n("../../node_modules/marko/dist/runtime/vdom/index.js"),s=n("../../node_modules/lz-string/libs/lz-string.js"),a=n("../../node_modules/@marko/tags-api-preview/dist/transform/cached-function/index-browser.mjs"),i=n("../../node_modules/@marko/tags-api-preview/dist/util/replace-assignments/index.mjs"),r=n("../../node_modules/@marko/tags-api-preview/dist/components/lifecycle/index.mjs"),l=n("../../node_modules/@marko/tags-api-preview/dist/translate/track-rendering/index.mjs"),d=n("../../node_modules/marko/dist/runtime/components/renderer.js"),c=n.n(d),u=n("../../node_modules/marko/dist/runtime/components/registry/index-browser.js"),m=n("../../node_modules/marko/dist/runtime/components/defineComponent.js"),p=n.n(m);const h="41NMzc7K",f=(0,o.t)(h),v=f;(0,u.r)(h,(()=>f));const g={onCreate(){this.state={}}};f._=c()((function(e,t,n,o,d){(0,l.begin)();try{var c=o,u=d;const{default:t}=e,n="0"in u?u[0]:u[0]=(()=>{try{return JSON.parse((0,s.decompressFromEncodedURIComponent)(window.location.hash.slice(1)))}catch(e){console.error(e)}})()||t,m=e=>c.setState("0",e);(0,r.default)(o,{onMount:function(){window.addEventListener("hashchange",this.handler=()=>{try{this.isUpdating?this.isUpdating=!1:(0,i.default)(m,JSON.parse((0,s.decompressFromEncodedURIComponent)(window.location.hash.slice(1))))}catch(e){console.error(e)}})},onUpdate:(0,a.cache)((0,a.cached)(c,[n])||function(){this.isUpdating=!0,window.location.hash=(0,s.compressToEncodedURIComponent)(JSON.stringify(n))}),onDestroy:function(){window.removevEventListener("hashchange",this.handler)}}),e._return&&e._return({default:n,defaultChange:m},1)}finally{(0,l.end)()}}),{t:h},g),f.Component=p()(g,f._)},"./playground/index.marko?browser-entry":(e,t,n)=>{"use strict";var o=n("../../node_modules/marko/dist/runtime/components/index.js"),s=(n("../components/app-layout/favicon.png"),n("../logos/marko.svg"),n("../components/app-layout/components/layout-header/component-browser.js")),a=n.n(s),i=n("../components/app-layout/components/layout-sidebar/components/version-switcher/component-browser.js"),r=n.n(i),l=n("../components/app-layout/components/layout-sidebar/component-browser.js"),d=n.n(l),c=(n("../components/app-footer/openjsf.svg"),n("../components/app-footer/osi.svg"),n("../components/app-footer/ebay.svg"),n("../logos/discord.svg"),n("../../node_modules/marko/dist/runtime/vdom/index.js")),u=n("../../node_modules/@marko/tags-api-preview/dist/components/return/index-browser.mjs"),m=n("./playground/components/hash-value.marko"),p=n("../../node_modules/marko/dist/runtime/helpers/render-tag.js"),h=n.n(p),f=n("../components/repl/index.marko"),v=n("../../node_modules/@marko/tags-api-preview/dist/translate/track-rendering/index.mjs"),g=n("../../node_modules/marko/dist/runtime/components/renderer.js"),y=n.n(g),w=n("../../node_modules/marko/dist/runtime/components/registry/index-browser.js"),b=n("../../node_modules/marko/dist/runtime/components/defineComponent.js"),k=n.n(b);const _="/+j3nP/e",x=(0,c.t)(_);(0,w.r)(_,(()=>x));const C={onCreate(){this.state={}}};x._=y()((function(e,t,n,o,s){(0,v.begin)();try{var a=o,i=(0,u.default)(a);h()(m.Z,{default:[{name:"index.marko",path:"/components/index.marko",content:"<let/count=0/>\n<button onClick() { count++ }>\n  ${count}\n</button>"}],_return:i},t,n,"0");const{defaultChange:e,default:s}=i();h()(f.Z,{files:s,filesChange:e},t,n,"1")}finally{(0,v.end)()}}),{t:_},C),x.Component=k()(C,x._),(0,o.register)("OIKmBXjW",a()),(0,o.register)("07hv1F0+",r()),(0,o.register)("mFesaajv",d()),(0,o.init)()},"../components/app-layout/components/layout-header/component-browser.js":(e,t,n)=>{var o=n("../components/app-layout/components/layout-header/events.js"),s="headspace--fixed",a="headspace--hidden";e.exports={onMount(){o.emit("create",this);var e,t=0,n=this.getEl("header").offsetHeight,s=(this.getEl("banner")||{offsetHeight:0}).offsetHeight,a=(e=()=>{var e=window.pageYOffset;e<=s?this.reset():!this.paused&&e>n&&(Math.abs(e-t)>=3||e>t&&t<=n)&&(e>t?this.hide():this.fix()),t=e},()=>window.requestAnimationFrame(e));a(),window.addEventListener("scroll",a,{passive:!0})},reset(){this.removeClass(s),this.removeClass(a),o.emit("reset")},fix(){this.addClass(s),this.removeClass(a),o.emit("fix")},hide(){this.addClass(a),o.emit("hide")},addClass(e){this.getEl("header").classList.add(e)},removeClass(e){this.getEl("header").classList.remove(e)},pause(){this.paused=!0},resume(){setTimeout((()=>window.requestAnimationFrame((()=>{this.paused=!1}))))},toggleMenu(){o.emit("toggle-menu")}}},"../components/app-layout/components/layout-header/events.js":(e,t,n)=>{var o=n("../../node_modules/events/events.js");e.exports=new o},"../components/app-layout/components/layout-sidebar/component-browser.js":(e,t,n)=>{var o,s=n("../components/app-layout/components/layout-header/events.js"),{filter:a}=[];e.exports={onMount(){this.listenForHeaderChanges(),this.initScrollSpy()},initScrollSpy(){var e=[...document.querySelectorAll(".doc-content .heading")],t=!1;e.length&&this.subscribeTo(window).on("scroll",(()=>{t||(t=!0,setTimeout((()=>{var n,o,s=window.innerHeight/3;e.map((e=>{var{top:t}=e.getBoundingClientRect();(null==o||t<s&&Math.abs(t)<Math.abs(o))&&(o=t,n=e)}));var i=n.id,r=this.el.querySelector('a[href="#'+i+'"]')||this.el.querySelector("a.selected"),l=r,d=l.nextSibling;for(d&&d.querySelectorAll("a[href^='#']").forEach((e=>e.classList.remove("selected")));l;){var c=l.closest("ol"),u=c&&a.call(c.querySelectorAll(":scope > li > a[href^='#']"),(e=>e!==l));u&&u.forEach((e=>e.classList.remove("selected"))),l.classList.add("selected"),l=c&&c.previousElementSibling}this.scrollAnchorIntoView(r),t=!1}),50))}))},listenForHeaderChanges(){this.el.querySelectorAll("a[href^='#']").forEach((e=>{this.subscribeTo(e).on("click",(()=>{o.hide(),o.pause(),o.resume(),this.hide()}))}));var e=[...this.el.querySelectorAll("a.selected")].pop();e&&this.subscribeTo(e).on("click",(e=>{window.scrollTo(0,0),o.reset(),e.preventDefault()})),this.subscribeTo(s).on("reset",(()=>{this.el.classList.remove("no-header","fixed"),setTimeout((()=>this.el.classList.remove("transition")),0)})).on("fix",(()=>{this.el.classList.remove("no-header"),this.el.classList.add("fixed"),setTimeout((()=>this.el.classList.add("transition")),0)})).on("hide",(()=>{this.el.classList.add("no-header","fixed"),setTimeout((()=>this.el.classList.add("transition")),0)})).on("toggle-menu",(()=>{this.el.classList.toggle("show")})).on("create",(e=>{window.pageYOffset>e.el.offsetHeight&&this.el.classList.add("no-header","fixed")}))},scrollAnchorIntoView(e){for(var t,n=this.getEl("sidebar"),o=n.scrollTop,s=n.offsetHeight,a=o+s,i=e.closest("li");(t=i.parentNode.closest("ol"))&&t.offsetHeight<s;)i=t;var r=i.offsetTop,l=i.offsetHeight;r>o&&r+l<a||(n.scrollTop=r+l/2-s/2)},hide(){this.el.classList.remove("show")}}},"../components/app-layout/components/layout-sidebar/components/version-switcher/component-browser.js":e=>{e.exports={switchVersion(e){var t=e.target.value;"current"!==t&&(e.target.value="current",window.location.href=t)}}},"../components/app-footer/ebay.svg":(e,t,n)=>{"use strict";n.p},"../components/app-footer/openjsf.svg":(e,t,n)=>{"use strict";n.p},"../components/app-footer/osi.svg":(e,t,n)=>{"use strict";n.p},"../components/app-layout/favicon.png":(e,t,n)=>{"use strict";n.p},"../logos/discord.svg":(e,t,n)=>{"use strict";n.p},"../logos/marko.svg":(e,t,n)=>{"use strict";n.d(t,{Z:()=>o});const o=n.p+"91bc26e5.svg"}},e=>{e.O(0,[323,519],(()=>("./playground/index.marko?browser-entry",e(e.s="./playground/index.marko?browser-entry")))),e.O()}]);
//# sourceMappingURL=244.e47cd21c.js.map