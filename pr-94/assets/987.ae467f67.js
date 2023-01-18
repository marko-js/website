(globalThis.webpackChunk=globalThis.webpackChunk||[]).push([[987],{"../../node_modules/marko/components-browser.marko":(e,t,o)=>{"use strict";o.r(t),o.d(t,{default:()=>s,getComponentForEl:()=>s.getComponentForEl,init:()=>s.init,register:()=>s.register});var s=o("../../node_modules/marko/dist/runtime/components/index.js")},"./docs/[name]/index.marko?browser-entry":(e,t,o)=>{"use strict";var s=o("../../node_modules/marko/dist/runtime/components/index.js"),n=o("../components/code-block-marko/component-browser.js"),r=o.n(n),i=(o("../components/app-layout/favicon.png"),o("../logos/marko.svg"),o("../components/app-layout/components/layout-header/component-browser.js")),a=o.n(i),l=o("../components/app-layout/components/layout-sidebar/components/version-switcher/component-browser.js"),c=o.n(l),u=o("../components/app-layout/components/layout-sidebar/component-browser.js"),p=o.n(u);o("../components/app-footer/openjsf.svg"),o("../components/app-footer/osi.svg"),o("../components/app-footer/ebay.svg"),o("../logos/discord.svg"),o.p,(0,s.register)("UUumdCIE",r()),(0,s.register)("OIKmBXjW",a()),(0,s.register)("07hv1F0+",c()),(0,s.register)("mFesaajv",p()),(0,s.init)()},"../../node_modules/events/events.js":e=>{"use strict";var t,o="object"==typeof Reflect?Reflect:null,s=o&&"function"==typeof o.apply?o.apply:function(e,t,o){return Function.prototype.apply.call(e,t,o)};t=o&&"function"==typeof o.ownKeys?o.ownKeys:Object.getOwnPropertySymbols?function(e){return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e))}:function(e){return Object.getOwnPropertyNames(e)};var n=Number.isNaN||function(e){return e!=e};function r(){r.init.call(this)}e.exports=r,e.exports.once=function(e,t){return new Promise((function(o,s){function n(o){e.removeListener(t,r),s(o)}function r(){"function"==typeof e.removeListener&&e.removeListener("error",n),o([].slice.call(arguments))}m(e,t,r,{once:!0}),"error"!==t&&function(e,t,o){"function"==typeof e.on&&m(e,"error",t,{once:!0})}(e,n)}))},r.EventEmitter=r,r.prototype._events=void 0,r.prototype._eventsCount=0,r.prototype._maxListeners=void 0;var i=10;function a(e){if("function"!=typeof e)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof e)}function l(e){return void 0===e._maxListeners?r.defaultMaxListeners:e._maxListeners}function c(e,t,o,s){var n,r,i,c;if(a(o),void 0===(r=e._events)?(r=e._events=Object.create(null),e._eventsCount=0):(void 0!==r.newListener&&(e.emit("newListener",t,o.listener?o.listener:o),r=e._events),i=r[t]),void 0===i)i=r[t]=o,++e._eventsCount;else if("function"==typeof i?i=r[t]=s?[o,i]:[i,o]:s?i.unshift(o):i.push(o),(n=l(e))>0&&i.length>n&&!i.warned){i.warned=!0;var u=new Error("Possible EventEmitter memory leak detected. "+i.length+" "+String(t)+" listeners added. Use emitter.setMaxListeners() to increase limit");u.name="MaxListenersExceededWarning",u.emitter=e,u.type=t,u.count=i.length,c=u,console&&console.warn&&console.warn(c)}return e}function u(){if(!this.fired)return this.target.removeListener(this.type,this.wrapFn),this.fired=!0,0===arguments.length?this.listener.call(this.target):this.listener.apply(this.target,arguments)}function p(e,t,o){var s={fired:!1,wrapFn:void 0,target:e,type:t,listener:o},n=u.bind(s);return n.listener=o,s.wrapFn=n,n}function h(e,t,o){var s=e._events;if(void 0===s)return[];var n=s[t];return void 0===n?[]:"function"==typeof n?o?[n.listener||n]:[n]:o?function(e){for(var t=new Array(e.length),o=0;o<t.length;++o)t[o]=e[o].listener||e[o];return t}(n):f(n,n.length)}function d(e){var t=this._events;if(void 0!==t){var o=t[e];if("function"==typeof o)return 1;if(void 0!==o)return o.length}return 0}function f(e,t){for(var o=new Array(t),s=0;s<t;++s)o[s]=e[s];return o}function m(e,t,o,s){if("function"==typeof e.on)s.once?e.once(t,o):e.on(t,o);else{if("function"!=typeof e.addEventListener)throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type '+typeof e);e.addEventListener(t,(function n(r){s.once&&e.removeEventListener(t,n),o(r)}))}}Object.defineProperty(r,"defaultMaxListeners",{enumerable:!0,get:function(){return i},set:function(e){if("number"!=typeof e||e<0||n(e))throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received '+e+".");i=e}}),r.init=function(){void 0!==this._events&&this._events!==Object.getPrototypeOf(this)._events||(this._events=Object.create(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0},r.prototype.setMaxListeners=function(e){if("number"!=typeof e||e<0||n(e))throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received '+e+".");return this._maxListeners=e,this},r.prototype.getMaxListeners=function(){return l(this)},r.prototype.emit=function(e){for(var t=[],o=1;o<arguments.length;o++)t.push(arguments[o]);var n="error"===e,r=this._events;if(void 0!==r)n=n&&void 0===r.error;else if(!n)return!1;if(n){var i;if(t.length>0&&(i=t[0]),i instanceof Error)throw i;var a=new Error("Unhandled error."+(i?" ("+i.message+")":""));throw a.context=i,a}var l=r[e];if(void 0===l)return!1;if("function"==typeof l)s(l,this,t);else{var c=l.length,u=f(l,c);for(o=0;o<c;++o)s(u[o],this,t)}return!0},r.prototype.addListener=function(e,t){return c(this,e,t,!1)},r.prototype.on=r.prototype.addListener,r.prototype.prependListener=function(e,t){return c(this,e,t,!0)},r.prototype.once=function(e,t){return a(t),this.on(e,p(this,e,t)),this},r.prototype.prependOnceListener=function(e,t){return a(t),this.prependListener(e,p(this,e,t)),this},r.prototype.removeListener=function(e,t){var o,s,n,r,i;if(a(t),void 0===(s=this._events))return this;if(void 0===(o=s[e]))return this;if(o===t||o.listener===t)0==--this._eventsCount?this._events=Object.create(null):(delete s[e],s.removeListener&&this.emit("removeListener",e,o.listener||t));else if("function"!=typeof o){for(n=-1,r=o.length-1;r>=0;r--)if(o[r]===t||o[r].listener===t){i=o[r].listener,n=r;break}if(n<0)return this;0===n?o.shift():function(e,t){for(;t+1<e.length;t++)e[t]=e[t+1];e.pop()}(o,n),1===o.length&&(s[e]=o[0]),void 0!==s.removeListener&&this.emit("removeListener",e,i||t)}return this},r.prototype.off=r.prototype.removeListener,r.prototype.removeAllListeners=function(e){var t,o,s;if(void 0===(o=this._events))return this;if(void 0===o.removeListener)return 0===arguments.length?(this._events=Object.create(null),this._eventsCount=0):void 0!==o[e]&&(0==--this._eventsCount?this._events=Object.create(null):delete o[e]),this;if(0===arguments.length){var n,r=Object.keys(o);for(s=0;s<r.length;++s)"removeListener"!==(n=r[s])&&this.removeAllListeners(n);return this.removeAllListeners("removeListener"),this._events=Object.create(null),this._eventsCount=0,this}if("function"==typeof(t=o[e]))this.removeListener(e,t);else if(void 0!==t)for(s=t.length-1;s>=0;s--)this.removeListener(e,t[s]);return this},r.prototype.listeners=function(e){return h(this,e,!0)},r.prototype.rawListeners=function(e){return h(this,e,!1)},r.listenerCount=function(e,t){return"function"==typeof e.listenerCount?e.listenerCount(t):d.call(e,t)},r.prototype.listenerCount=d,r.prototype.eventNames=function(){return this._eventsCount>0?t(this._events):[]}},"../components/app-layout/components/layout-header/component-browser.js":(e,t,o)=>{var s=o("../components/app-layout/components/layout-header/events.js"),n="headspace--fixed",r="headspace--hidden";e.exports={onMount(){s.emit("create",this);var e,t=0,o=this.getEl("header").offsetHeight,n=(this.getEl("banner")||{offsetHeight:0}).offsetHeight,r=(e=()=>{var e=window.pageYOffset;e<=n?this.reset():!this.paused&&e>o&&(Math.abs(e-t)>=3||e>t&&t<=o)&&(e>t?this.hide():this.fix()),t=e},()=>window.requestAnimationFrame(e));r(),window.addEventListener("scroll",r)},reset(){this.removeClass(n),this.removeClass(r),s.emit("reset")},fix(){this.addClass(n),this.removeClass(r),s.emit("fix")},hide(){this.addClass(r),s.emit("hide")},addClass(e){this.getEl("header").classList.add(e)},removeClass(e){this.getEl("header").classList.remove(e)},pause(){this.paused=!0},resume(){setTimeout((()=>window.requestAnimationFrame((()=>{this.paused=!1}))))},toggleMenu(){s.emit("toggle-menu")}}},"../components/app-layout/components/layout-header/events.js":(e,t,o)=>{var s=o("../../node_modules/events/events.js");e.exports=new s},"../components/app-layout/components/layout-sidebar/component-browser.js":(e,t,o)=>{var s,n=o("../components/app-layout/components/layout-header/events.js"),r=[].forEach,i=[].filter,a=[].slice;e.exports={onMount(){this.preventOverscroll(),this.listenForHeaderChanges(),this.initScrollSpy()},initScrollSpy(){var e=[1,2,3,4,5,6].map((e=>".doc-content h"+e)).join(","),t=a.call(document.querySelectorAll(e)),o=!1;t.length&&this.subscribeTo(window).on("scroll",(()=>{o||(o=!0,setTimeout((()=>{var e,s,n=window.innerHeight/3;t.map((t=>{var o=t.getBoundingClientRect().top;(null==s||o<n&&Math.abs(o)<Math.abs(s))&&(s=o,e=t)}));var a=e.id,l=this.el.querySelector('a[href="#'+a+'"]')||this.el.querySelector("a.selected"),c=l,u=c.nextSibling;for(u&&r.call(u.querySelectorAll("a[href^=\\#]"),(e=>e.classList.remove("selected")));c;){var p=c.closest("ul"),h=p&&i.call(p.querySelectorAll(":scope > li > a[href^=\\#]"),(e=>e!==c));h&&h.forEach((e=>e.classList.remove("selected"))),c.classList.add("selected"),c=p&&p.previousElementSibling}this.scrollAnchorIntoView(l),o=!1}),50))}))},listenForHeaderChanges(){r.call(this.el.querySelectorAll("a[href^=\\#]"),(e=>{this.subscribeTo(e).on("click",(()=>{s.hide(),s.pause(),s.resume(),this.hide()}))}));var e=a.call(this.el.querySelectorAll("a.selected")).pop();e&&this.subscribeTo(e).on("click",(e=>{window.scrollTo(0,0),s.reset(),e.preventDefault()})),this.subscribeTo(n).on("reset",(()=>{this.el.classList.remove("no-header"),this.el.classList.remove("fixed"),setTimeout((()=>this.el.classList.remove("transition")),0)})).on("fix",(()=>{this.el.classList.remove("no-header"),this.el.classList.add("fixed"),setTimeout((()=>this.el.classList.add("transition")),0)})).on("hide",(()=>{this.el.classList.add("no-header"),this.el.classList.add("fixed"),setTimeout((()=>this.el.classList.add("transition")),0)})).on("toggle-menu",(()=>{this.el.classList.contains("show")?(this.el.classList.remove("show"),document.body.style.overflow=""):this.el.classList.add("show")})).on("create",(e=>{s=e,window.pageYOffset>s.el.offsetHeight&&(this.el.classList.add("no-header"),this.el.classList.add("fixed"))}))},preventOverscroll(){var e=this.getEl("sidebar");this.subscribeTo(document.body).on("wheel",(t=>{var o=t.deltaY,s=e.scrollTop+o,n=e.scrollHeight-e.offsetHeight,r=s<=0,i=s>=n;(o<0&&r||o>0&&i)&&(t.target===e||e.contains(t.target))&&(r&&0!=e.scrollTop?e.scrollTop=0:i&&e.scrollTop!=n&&(e.scrollTop=n),t.preventDefault())}))},scrollAnchorIntoView(e){for(var t,o=this.getEl("sidebar"),s=(e.offsetTop,o.scrollTop),n=o.offsetHeight,r=s+n,i=e.closest("li");(t=i.parentNode.closest("ul"))&&t.offsetHeight<n;)i=t;var a=i.offsetTop,l=i.offsetHeight;a>s&&a+l<r||(o.scrollTop=a+l/2-n/2)},hide(){this.el.classList.remove("show"),document.body.style.overflow=""}}},"../components/app-layout/components/layout-sidebar/components/version-switcher/component-browser.js":e=>{e.exports={switchVersion(e){var t=e.target.value;"current"!==t&&(e.target.value="current",window.location.href=t)}}},"../components/code-block-marko/component-browser.js":(e,t,o)=>{const{getComponentForEl:s}=o("../../node_modules/marko/components-browser.marko"),n=o("../utils/localstorage.js");e.exports={changeSyntax(){const e=s(document.querySelector(".site-header")),t=document.body.scrollTop||document.documentElement.scrollTop,o=this.el.offsetTop;e.pause(),"concise"===n.get("syntax")?(n.set("syntax","html"),document.body.classList.remove("concise")):(n.set("syntax","concise"),document.body.classList.add("concise"));const r=t-o+this.el.offsetTop;document.documentElement.scrollTop=r,document.body.scrollTop=r,setTimeout((()=>e.resume()))}}},"../utils/localstorage.js":(e,t)=>{function o(e){return`markojs-website:${e}`}t.get=e=>localStorage.getItem(o(e)),t.set=(e,t)=>localStorage.setItem(o(e),t),t.getMarkoWebsiteKey=o},"../components/app-footer/ebay.svg":(e,t,o)=>{"use strict";o.p},"../components/app-footer/openjsf.svg":(e,t,o)=>{"use strict";o.p},"../components/app-footer/osi.svg":(e,t,o)=>{"use strict";o.p},"../components/app-layout/favicon.png":(e,t,o)=>{"use strict";o.p},"../logos/discord.svg":(e,t,o)=>{"use strict";o.p},"../logos/marko.svg":(e,t,o)=>{"use strict";o.d(t,{Z:()=>s});const s=o.p+"91bc26e5.svg"}},e=>{e.O(0,[323],(()=>("./docs/[name]/index.marko?browser-entry",e(e.s="./docs/[name]/index.marko?browser-entry")))),e.O()}]);
//# sourceMappingURL=987.ae467f67.js.map