(globalThis.webpackChunk=globalThis.webpackChunk||[]).push([[683],{"../components/repl/index.marko":(e,t,n)=>{"use strict";n.d(t,{Z:()=>ne});var s=n("../../node_modules/marko/dist/runtime/vdom/index.js"),o=n("../../node_modules/@marko/tags-api-preview/dist/util/replace-assignments/index.mjs"),l=n("../../node_modules/@marko/tags-api-preview/dist/transform/cached-function/index-browser.mjs"),a=n("../../node_modules/@marko/tags-api-preview/dist/transform/native-tag-var/index-browser.mjs"),i=n("../../node_modules/@marko/tags-api-preview/dist/components/lifecycle/index.mjs"),r=n("../../node_modules/@marko/tags-api-preview/dist/components/_instance/index.marko"),d=n("../../node_modules/marko/dist/runtime/helpers/render-tag.js"),c=n.n(d),u=n("../../node_modules/marko/dist/runtime/helpers/class-value.js"),m=n.n(u),p=n("../../node_modules/@marko/tags-api-preview/dist/translate/track-rendering/index.mjs"),f=n("../../node_modules/marko/dist/runtime/components/renderer.js"),h=n.n(f),v=n("../../node_modules/marko/dist/runtime/components/registry/index-browser.js"),g=n("../../node_modules/marko/dist/runtime/components/defineComponent.js"),b=n.n(g);const y="6o3N4O4f",w=(0,s.t)(y),k=w;(0,v.r)(y,(()=>w));const _={onCreate(){this.state={}}};w._=h()((function(e,t,n,s,d){(0,p.begin)();try{var u=s,f=d;const{selectedIndexChange:h,filesChange:v,files:g,selectedIndex:b}=e,y=v||(e=>u.setState("0",e)),w=v?g:"0"in f?f[0]:f[0]=g,k=h||(e=>u.setState("1",e)),_=h?b:"1"in f?f[1]:f[1]=b,x=w[_];t.be("div",{class:"file-tabs"},"0",s,null,1);{const e="2"in f?f[2]:f[2]=1,d=e=>u.setState("2",e);let p=0;for(const e of w){let s=p++;const d=`[${s}]`;c()(r.default,{renderBody:(t,n,u,p)=>{var f=n,h=u;const v="0"in p?p[0]:p[0]=!1,g=e=>u.setState("0",e),b=x===e,C=s>0;t.be("div",{class:m()(["file-tab",{selected:b}])},"2"+d,h,null,1,{onclick:f.d("click",(function(){b?(0,o.default)(g,!0):((0,o.default)(g,!1),(0,o.default)(k,s))}),!1)}),v&&b&&C?c()(r.default,{renderBody:(t,n,r,d)=>{var c=n,u=r;const m="0"in d?d[0]:d[0]=e.name,p=(0,l.cache)((0,l.cached)(r,[m,w])||function(){const t={...e,name:m,path:e.path.replace(e.name,m)};(0,o.default)(y,[...w.slice(0,s),t,...w.slice(s+1)]),(0,o.default)(g,!1)}),f=(0,a.default)(r,"0");var h=e=>r.setState("0",e);t.e("input",{type:"text",size:m.length,value:m},"@0",u,0,0,{pa:[h&&"value"],onblur:c.d("blur",p,!1),onkeydown:c.d("keydown",(function(e){"Enter"===e.code&&p()}),!1),oninput:c.d("input",(e=>{h(e.target.value)}),!1)}),(0,i.default)(u,{onMount:(0,l.cache)((0,l.cached)(r,[m])||function(){f().focus(),f().setSelectionRange(0,m.indexOf("."))})})}},t,f,"3"+d):t.t(e.name,h),C&&(t.be("button",{class:"file-close"},"4"+d,h,null,1,{onclick:f.d("click",(function(t){window.confirm(`Delete ${e.path}?`)&&(_>=s&&(0,o.default)(k,_-1),(0,o.default)(y,[...w.slice(0,s),...w.slice(s+1)])),t.stopPropagation()}),!1)}),t.t("×",h),t.ee()),t.ee()}},t,n,"1"+d)}t.be("button",{class:"new-file"},"5",s,null,1,{onclick:n.d("click",(function(){const t={name:`Component${e}.marko`,path:`/components/Component${e}.marko`,content:""},n=w.length;(0,o.default)(y,w.concat(t)),(0,o.default)(k,n),(0,o.default)(d,e+1)}),!1)}),t.t("+",s),t.ee()}t.ee()}finally{(0,p.end)()}}),{t:y},_),w.Component=b()(_,w._);var x=n("../../node_modules/marko/dist/runtime/helpers/dynamic-tag.js"),C=n.n(x);const j="QAUP5peK",S=(0,s.t)(j),L=S;(0,v.r)(j,(()=>S));const T={};S._=h()((function(e,t,n,s,o){(0,p.begin)();try{const{actions:o,body:l}=e;t.be("div",{class:"pane"},"0",s,null,1),t.be("div",{class:"pane-actions"},"1",s,null,1),C()(t,o.renderBody,null,null,null,null,n,"2"),t.ee(),t.e("div",{class:"pane-divider"},"3",s,0,1),t.be("div",{class:"pane-body"},"4",s,null,1),C()(t,l.renderBody,null,null,null,null,n,"5"),t.ee(),t.ee()}finally{(0,p.end)()}}),{t:j,i:!0},T),S.Component=b()(T,S._);var B=n("../../node_modules/marko/dist/runtime/vdom/helpers/v-element.js"),E=n.n(B),M=n("../../node_modules/@marko/tags-api-preview/dist/components/effect/index.mjs");const O="rRMAwOPg",H=(0,s.t)(O),A=H;(0,v.r)(O,(()=>H));const q={onCreate(){this.state={}}};H._=h()((function(e,t,n,s,o){(0,p.begin)();try{var i=s;const{value:o,valueChange:r,renderBody:d,class:c}=e,u=(0,a.default)(i,"0");t.be("select",{class:m()(c)},"@0",s,null,1,{onchange:n.d("change",(function(e){r(e.target.value)}),!1)}),C()(t,d,null,null,null,null,n,"0"),t.ee(),(0,M.default)(s,(0,l.cache)((0,l.cached)(i,[o,d,r])||function(){u().value=o}))}finally{(0,p.end)()}}),{t:O},q),H.Component=b()(q,H._);var I=n("../../node_modules/lz-string/libs/lz-string.js"),P=n("../../node_modules/@marko/tags-api-preview/dist/translate/native-tag-handlers/index-browser.mjs"),F=n("../../node_modules/marko/dist/runtime/vdom/helpers/attrs.js"),R=n.n(F);const D="ftG9dvL8",Y=(0,s.t)(D),$=Y,V=E()("span",null,"1",null,1,0).t("Open in playground ");(0,v.r)(D,(()=>Y));const z={};Y._=h()((function(e,t,n,s,o){(0,p.begin)();try{const{files:o,...a}=e;var l={};t.be("a",R()((0,P.default)({...a,href:`/playground/#${(0,I.compressToEncodedURIComponent)(JSON.stringify(o))}`,target:"_top",class:"playground-link"},n,"a",l)),"0",s,null,4,{...l}),t.n(V,s),t.t("↗",s),t.ee()}finally{(0,p.end)()}}),{t:D,i:!0},z),Y.Component=b()(z,Y._);var N=n("../../node_modules/@marko/tags-api-preview/dist/components/return/index-browser.mjs");const Z="dL815V5K",K=(0,s.t)(Z),Q=K;(0,v.r)(Z,(()=>K));const U={onCreate(){this.state={}}};K._=h()((function(e,t,n,s,a){(0,p.begin)();try{var i=s,r=a;const{default:t,fallback:n}=e,d="0"in r?r[0]:r[0]=window.matchMedia(t).matches,c=e=>i.setState("0",e);(0,M.default)(s,(0,l.cache)((0,l.cached)(i,[t])||function(){const e=window.matchMedia(t),n=()=>(0,o.default)(c,!!e.matches);return e.addEventListener("change",n),(0,o.default)(c,!!e.matches),()=>e.removeEventListener("change",n)})),e._return&&e._return({default:d},1)}finally{(0,p.end)()}}),{t:Z},U),K.Component=b()(U,K._);const X="V970f081",G=(0,s.t)(X),J=G;(0,v.r)(X,(()=>G));const W={onCreate(){this.state={}}};G._=h()((function(e,t,n,s,i){(0,p.begin)();try{var d=s,u=i;const{left:g,right:b}=e,y="0"in u?u[0]:u[0]=.5,w=e=>d.setState("0",e),k="1"in u?u[1]:u[1]=!1,_=e=>d.setState("1",e);var f=(0,N.default)(d);c()(Q,{default:"(max-aspect-ratio: 1/1)",_return:f},t,n,"0");const{default:x}=f(),j=(0,a.default)(d,"0");t.be("div",{class:m()(["panes",k&&"resizing"])},"@0",s,null,1);var h={};t.be("div",R()((0,P.default)({...g,style:`flex-grow:${y}`},n,"div",h)),"1",s,null,4,{...h}),C()(t,g.renderBody,null,null,null,null,n,"2"),t.ee(),t.be("div",{class:"divider"},"3",s,null,1),t.e("div",{class:"inner"},"4",s,0,1,{onmousedown:n.d("mousedown",(function(e){(0,o.default)(_,!0),e.preventDefault(),e.stopPropagation()}),!1)}),t.ee();var v={};t.be("div",R()((0,P.default)({...b,style:"flex-grow:"+(1-y)},n,"div",v)),"5",s,null,4,{...v}),C()(t,b.renderBody,null,null,null,null,n,"6"),t.ee(),t.ee(),k&&c()(r.default,{renderBody:(e,t,n,s)=>{var a=n;(0,M.default)(a,(0,l.cache)((0,l.cached)(n,[x])||function(){const e=e=>{if(e.buttons||e.which){const t=j().getBoundingClientRect(),n=x?(e.clientY-t.top)/t.height:(e.clientX-t.left)/t.width;n>0&&(0,o.default)(w,Math.min(.8,Math.max(.2,n)))}else(0,o.default)(_,!1)};return window.addEventListener("mousemove",e),()=>window.removeEventListener("mousemove",e)}))}},t,n,"7")}finally{(0,p.end)()}}),{t:X},W),G.Component=b()(W,G._);const ee="Y/QiYO60",te=(0,s.t)(ee),ne=te,se=E()("option",{value:"preview"},"7",null,1,0).t("App Preview"),oe=E()("option",{value:"compiled-html"},"8",null,1,0).t("Compiled (HTML)"),le=E()("option",{value:"compiled-vdom"},"9",null,1,0).t("Compiled (DOM)");(0,v.r)(ee,(()=>te));const ae={onCreate(){this.state={}}};te._=h()((function(e,t,s,a,d){(0,p.begin)();try{var u=a,m=d;const{filesChange:f,getTranslator:h,files:v}=e,g="0"in m?m[0]:m[0]=0,b=e=>u.setState("0",e),y="1"in m?m[1]:m[1]="preview",w=e=>u.setState("1",e),_="2"in m?m[2]:m[2]=!1,x=e=>u.setState("2",e),j=v[g];c()(J,{left:{class:"editor-container",renderBody:e=>{c()(L,{actions:{renderBody:e=>{c()(k,{files:v,filesChange:f,selectedIndex:g,selectedIndexChange:b},e,s,"2")}},body:{renderBody:e=>{c()(r.default,{renderBody:(e,t,s,a)=>{var r=t,d=s;const c="0"in a?a[0]:a[0]=null,u=e=>s.setState("0",e);C()(e,c,(()=>({value:j.content,filename:j.path,valueChange:(0,l.cache)((0,l.cached)(s,[j,v,g])||function(e){const t={...j,content:e};(0,o.default)(f,[...v.slice(0,g),t,...v.slice(g+1)]),(0,o.default)(x,!0)})})),null,null,null,r,"4"),(0,i.default)(d,{onMount:async()=>{const e=await Promise.all([n.e(103),n.e(400),n.e(109),n.e(888),n.e(176)]).then(n.bind(n,"../components/repl/components/editor.marko"));await e.loading,(0,o.default)(u,e)}})}},e,s,"3")}}},e,s,"1")}},right:{renderBody:e=>{c()(L,{actions:{renderBody:e=>{c()(A,{value:y,valueChange:function(e){(0,o.default)(w,e),(0,o.default)(x,!1)},class:"preview-select",renderBody:e=>{e.n(se,a),e.n(oe,a),e.n(le,a)}},e,s,"6"),c()($,{files:v},e,s,"10")}},body:{renderBody:e=>{c()(r.default,{renderBody:(e,t,s,l)=>{var a=t,r=s;const d="0"in l?l[0]:l[0]=null,c=e=>s.setState("0",e);C()(e,d,(()=>({type:y,files:v,selectedFile:j,getTranslator:h,debounce:_})),null,null,null,a,"12"),(0,i.default)(r,{onMount:async()=>{(0,o.default)(c,await Promise.all([n.e(103),n.e(641),n.e(400),n.e(648),n.e(888),n.e(546),n.e(25)]).then(n.bind(n,"../components/repl/components/preview.marko")))}})}},e,s,"11")}}},e,s,"5")}}},t,s,"0")}finally{(0,p.end)()}}),{t:ee},ae),te.Component=b()(ae,te._)},"./tutorials/[name]/index.marko?browser-entry":(e,t,n)=>{"use strict";var s=n("../../node_modules/marko/dist/runtime/components/index.js"),o=(n("../components/app-layout/favicon.png"),n("../logos/marko.svg"),n("../components/app-layout/components/layout-header/component-browser.js")),l=n.n(o),a=n("../components/app-layout/components/layout-sidebar/components/version-switcher/component-browser.js"),i=n.n(a),r=n("../components/app-layout/components/layout-sidebar/component-browser.js"),d=n.n(r),c=(n("../components/app-footer/openjsf.svg"),n("../components/app-footer/osi.svg"),n("../components/app-footer/ebay.svg"),n("../logos/discord.svg"),n("../../node_modules/marko/dist/runtime/vdom/index.js")),u=n("../../node_modules/@marko/tags-api-preview/dist/transform/cached-function/index-browser.mjs"),m=n("../../node_modules/@marko/tags-api-preview/dist/util/replace-assignments/index.mjs"),p=n("../components/repl/index.marko"),f=n("../../node_modules/marko/dist/runtime/helpers/render-tag.js"),h=n.n(f),v=n("../../node_modules/@marko/tags-api-preview/dist/translate/track-rendering/index.mjs"),g=n("../../node_modules/marko/dist/runtime/components/renderer.js"),b=n.n(g),y=n("../../node_modules/marko/dist/runtime/components/registry/index-browser.js"),w=n("../../node_modules/marko/dist/runtime/components/defineComponent.js"),k=n.n(w);const _="Rs+7ZDSn",x=(0,c.t)(_);(0,y.r)(_,(()=>x));const C={onCreate(){this.state={}}};x._=b()((function(e,t,n,s,o){(0,v.begin)();try{var l=s,a=o;const{tutorial:i}=e,r="0"in a?a[0]:a[0]=0,d=e=>l.setState("0",e),c=i.steps.length,f=i.steps[r],g=(0,u.cache)((0,u.cached)(l,[i])||function(e){(0,m.default)(d,e),(0,m.default)(y,i.steps[e].before)}),b="1"in a?a[1]:a[1]=f.before,y=e=>l.setState("1",e);t.be("div",{class:"tutorial-container"},"0",s,null,1),t.be("div",{class:"tutorial-content"},"1",s,null,1),t.be("header",{class:"tutorial-header"},"2",s,null,1),t.be("span",null,"3",s,null,0),t.t(i.title,s),t.ee(),t.be("span",null,"4",s,null,0),t.t("Step ",s),t.t(r+1,s),t.t("/",s),t.t(c,s),t.ee(),t.be("span",null,"5",s,null,0),t.be("button",{disabled:0===r},"6",s,null,0,{onclick:n.d("click",(function(){g(r-1)}),!1)}),t.t("Prev",s),t.ee(),t.be("button",{disabled:r+1===c},"7",s,null,0,{onclick:n.d("click",(function(){g(r+1)}),!1)}),t.t("Next",s),t.ee(),t.ee(),t.ee(),t.be("div",{class:"tutorial-body"},"8",s,null,1),t.be("h1",null,"9",s,null,0),t.t(f.title,s),t.ee(),t.h(f.content,s),t.ee(),t.be("button",{hidden:!f.after},"10",s,null,0,{onclick:n.d("click",(function(){(0,m.default)(y,f.after)}),!1)}),t.t("Solve",s),t.ee(),t.be("button",{disabled:b===f.before},"11",s,null,0,{onclick:n.d("click",(function(){(0,m.default)(y,f.before)}),!1)}),t.t("Reset",s),t.ee(),t.ee(),h()(p.Z,{files:b,filesChange:y},t,n,"12"),t.ee()}finally{(0,v.end)()}}),{t:_},C),x.Component=k()(C,x._),(0,s.register)("OIKmBXjW",l()),(0,s.register)("07hv1F0+",i()),(0,s.register)("mFesaajv",d()),(0,s.init)()},"../components/app-layout/components/layout-header/component-browser.js":(e,t,n)=>{var s=n("../components/app-layout/components/layout-header/events.js"),o="headspace--fixed",l="headspace--hidden";e.exports={onMount(){s.emit("create",this);var e,t=0,n=this.getEl("header").offsetHeight,o=(this.getEl("banner")||{offsetHeight:0}).offsetHeight,l=(e=()=>{var e=window.pageYOffset;e<=o?this.reset():!this.paused&&e>n&&(Math.abs(e-t)>=3||e>t&&t<=n)&&(e>t?this.hide():this.fix()),t=e},()=>window.requestAnimationFrame(e));l(),window.addEventListener("scroll",l)},reset(){this.removeClass(o),this.removeClass(l),s.emit("reset")},fix(){this.addClass(o),this.removeClass(l),s.emit("fix")},hide(){this.addClass(l),s.emit("hide")},addClass(e){this.getEl("header").classList.add(e)},removeClass(e){this.getEl("header").classList.remove(e)},pause(){this.paused=!0},resume(){setTimeout((()=>window.requestAnimationFrame((()=>{this.paused=!1}))))},toggleMenu(){s.emit("toggle-menu")}}},"../components/app-layout/components/layout-header/events.js":(e,t,n)=>{var s=n("../../node_modules/events/events.js");e.exports=new s},"../components/app-layout/components/layout-sidebar/component-browser.js":(e,t,n)=>{var s,o=n("../components/app-layout/components/layout-header/events.js"),l=[].forEach,a=[].filter,i=[].slice;e.exports={onMount(){this.preventOverscroll(),this.listenForHeaderChanges(),this.initScrollSpy()},initScrollSpy(){var e=[1,2,3,4,5,6].map((e=>".doc-content h"+e)).join(","),t=i.call(document.querySelectorAll(e)),n=!1;t.length&&this.subscribeTo(window).on("scroll",(()=>{n||(n=!0,setTimeout((()=>{var e,s,o=window.innerHeight/3;t.map((t=>{var n=t.getBoundingClientRect().top;(null==s||n<o&&Math.abs(n)<Math.abs(s))&&(s=n,e=t)}));var i=e.id,r=this.el.querySelector('a[href="#'+i+'"]')||this.el.querySelector("a.selected"),d=r,c=d.nextSibling;for(c&&l.call(c.querySelectorAll("a[href^=\\#]"),(e=>e.classList.remove("selected")));d;){var u=d.closest("ul"),m=u&&a.call(u.querySelectorAll(":scope > li > a[href^=\\#]"),(e=>e!==d));m&&m.forEach((e=>e.classList.remove("selected"))),d.classList.add("selected"),d=u&&u.previousElementSibling}this.scrollAnchorIntoView(r),n=!1}),50))}))},listenForHeaderChanges(){l.call(this.el.querySelectorAll("a[href^=\\#]"),(e=>{this.subscribeTo(e).on("click",(()=>{s.hide(),s.pause(),s.resume(),this.hide()}))}));var e=i.call(this.el.querySelectorAll("a.selected")).pop();e&&this.subscribeTo(e).on("click",(e=>{window.scrollTo(0,0),s.reset(),e.preventDefault()})),this.subscribeTo(o).on("reset",(()=>{this.el.classList.remove("no-header"),this.el.classList.remove("fixed"),setTimeout((()=>this.el.classList.remove("transition")),0)})).on("fix",(()=>{this.el.classList.remove("no-header"),this.el.classList.add("fixed"),setTimeout((()=>this.el.classList.add("transition")),0)})).on("hide",(()=>{this.el.classList.add("no-header"),this.el.classList.add("fixed"),setTimeout((()=>this.el.classList.add("transition")),0)})).on("toggle-menu",(()=>{this.el.classList.contains("show")?(this.el.classList.remove("show"),document.body.style.overflow=""):this.el.classList.add("show")})).on("create",(e=>{s=e,window.pageYOffset>s.el.offsetHeight&&(this.el.classList.add("no-header"),this.el.classList.add("fixed"))}))},preventOverscroll(){var e=this.getEl("sidebar");this.subscribeTo(document.body).on("wheel",(t=>{var n=t.deltaY,s=e.scrollTop+n,o=e.scrollHeight-e.offsetHeight,l=s<=0,a=s>=o;(n<0&&l||n>0&&a)&&(t.target===e||e.contains(t.target))&&(l&&0!=e.scrollTop?e.scrollTop=0:a&&e.scrollTop!=o&&(e.scrollTop=o),t.preventDefault())}))},scrollAnchorIntoView(e){for(var t,n=this.getEl("sidebar"),s=(e.offsetTop,n.scrollTop),o=n.offsetHeight,l=s+o,a=e.closest("li");(t=a.parentNode.closest("ul"))&&t.offsetHeight<o;)a=t;var i=a.offsetTop,r=a.offsetHeight;i>s&&i+r<l||(n.scrollTop=i+r/2-o/2)},hide(){this.el.classList.remove("show"),document.body.style.overflow=""}}},"../components/app-layout/components/layout-sidebar/components/version-switcher/component-browser.js":e=>{e.exports={switchVersion(e){var t=e.target.value;"current"!==t&&(e.target.value="current",window.location.href=t)}}},"../components/app-footer/ebay.svg":(e,t,n)=>{"use strict";n.p},"../components/app-footer/openjsf.svg":(e,t,n)=>{"use strict";n.p},"../components/app-footer/osi.svg":(e,t,n)=>{"use strict";n.p},"../components/app-layout/favicon.png":(e,t,n)=>{"use strict";n.p},"../logos/discord.svg":(e,t,n)=>{"use strict";n.p},"../logos/marko.svg":(e,t,n)=>{"use strict";n.d(t,{Z:()=>s});const s=n.p+"91bc26e5.svg"}},e=>{e.O(0,[323,519],(()=>("./tutorials/[name]/index.marko?browser-entry",e(e.s="./tutorials/[name]/index.marko?browser-entry")))),e.O()}]);
//# sourceMappingURL=683.843bf507.js.map