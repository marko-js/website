/*! For license information please see 970.3aa2a4ce.js.LICENSE.txt */
(globalThis.webpackChunk=globalThis.webpackChunk||[]).push([[970],{"../../node_modules/@marko/tags-api-preview/dist/components/get/index.marko":(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>h});var n=r("../../node_modules/marko/dist/runtime/vdom/index.js"),s=r("../../node_modules/marko/dist/runtime/helpers/dynamic-tag.js"),i=r.n(s),o=r("../../node_modules/marko/dist/runtime/components/renderer.js"),a=r.n(o),u=r("../../node_modules/marko/dist/runtime/components/registry/index-browser.js"),l=r("../../node_modules/marko/dist/runtime/components/defineComponent.js"),c=r.n(l);const p="sOL2wfEw",d=(0,n.t)(p),h=d;var f="__subtree_context__";(0,u.r)(p,(()=>d));const m={onCreate(){this.sync=this.sync.bind(this)},onInput(e,t){var r=e.default;if(!r||!r.render)throw new Error("Invalid component constructor provided as <get> 'default' attribute. Got: "+r);var n=this.provider;this.provider=function(e,t){return e[f]&&e[f][t.___providerId]}(t,r),n&&n!==this.provider&&this.sub.removeAllListeners(),this.provider?(this.sub=this.subscribeTo(this.provider).on("___changed",this.sync),this.data=this.provider.input):this.data=this.sub=void 0},sync(){var e=this.data;this.data=this.provider.input,this.data.default===e.default&&this.data.defaultChange===e.defaultChange||(this.forceUpdate(),this.update())}};d._=a()((function(e,t,r,n,s){var o=n.data||{};i()(t,e.renderBody,null,null,[o.default,o.defaultChange],null,r,"0")}),{t:p},m),d.Component=c()(m,d._)},"../../node_modules/@marko/tags-api-preview/dist/components/set/index.marko":(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>h});var n=r("../../node_modules/marko/dist/runtime/vdom/index.js"),s=r("../../node_modules/marko/dist/runtime/helpers/dynamic-tag.js"),i=r.n(s),o=r("../../node_modules/marko/dist/runtime/components/renderer.js"),a=r.n(o),u=r("../../node_modules/marko/dist/runtime/components/registry/index-browser.js"),l=r("../../node_modules/marko/dist/runtime/components/defineComponent.js"),c=r.n(l);const p="0OROPSXy",d=(0,n.t)(p),h=d;var f=0,m="__subtree_context__",g="__bound_async_subtree_context__";function y(e){var t=e.out;t[g]=!0,t[m]=e.parentOut[m]}(0,u.r)(p,(()=>d));const D={};d._=a()((function(e,t,r,n,s){t[g]||(t[g]=!0,t.on("beginAsync",y));var o=e.___from,a=o.___providerId,u=t[m],l=t[m]=Object.create(u||{});a||(a=o.___providerId=++f),l[a]=n,i()(t,e.renderBody,null,null,null,null,r,"0"),"function"==typeof n.emit&&n.emit("___changed"),t[m]=u}),{t:p,i:!0},D),d.Component=c()(D,d._)},"../../node_modules/@babel/compat-data/native-modules.js":(e,t,r)=>{e.exports=r("../../node_modules/@babel/compat-data/data/native-modules.json")},"../../node_modules/@babel/compat-data/plugins.js":(e,t,r)=>{e.exports=r("../../node_modules/@babel/compat-data/data/plugins.json")},"../../node_modules/@babel/core/lib/config/cache-contexts.js":()=>{},"../../node_modules/@babel/core/lib/config/caching.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/gensync/index.js");return n=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.assertSimpleType=f,t.makeStrongCache=l,t.makeStrongCacheSync=function(e){return o(l(e))},t.makeWeakCache=u,t.makeWeakCacheSync=function(e){return o(u(e))};var s=r("../../node_modules/@babel/core/lib/gensync-utils/async.js"),i=r("../../node_modules/@babel/core/lib/config/util.js");const o=e=>n()(e).sync;function*a(){return!0}function u(e){return c(WeakMap,e)}function l(e){return c(Map,e)}function c(e,t){const r=new e,n=new e,o=new e;return function*(e,a){const u=yield*(0,s.isAsync)(),l=u?n:r,c=yield*function*(e,t,r,n,i){const o=yield*p(t,n,i);if(o.valid)return o;if(e){const e=yield*p(r,n,i);if(e.valid)return{valid:!0,value:yield*(0,s.waitFor)(e.value.promise)}}return{valid:!1,value:null}}(u,l,o,e,a);if(c.valid)return c.value;const f=new h(a),g=t(e,f);let y,D;if((0,i.isIterableIterator)(g)){const t=g;D=yield*(0,s.onFirstPause)(t,(()=>{y=function(e,t,r){const n=new m;return d(t,e,r,n),n}(f,o,e)}))}else D=g;return d(l,f,e,D),y&&(o.delete(e),y.release(D)),D}}function*p(e,t,r){const n=e.get(t);if(n)for(const{value:e,valid:t}of n)if(yield*t(r))return{valid:!0,value:e};return{valid:!1,value:null}}function d(e,t,r,n){t.configured()||t.forever();let s=e.get(r);switch(t.deactivate(),t.mode()){case"forever":s=[{value:n,valid:a}],e.set(r,s);break;case"invalidate":s=[{value:n,valid:t.validator()}],e.set(r,s);break;case"valid":s?s.push({value:n,valid:t.validator()}):(s=[{value:n,valid:t.validator()}],e.set(r,s))}}class h{constructor(e){this._active=!0,this._never=!1,this._forever=!1,this._invalidate=!1,this._configured=!1,this._pairs=[],this._data=void 0,this._data=e}simple(){return function(e){function t(t){if("boolean"!=typeof t)return e.using((()=>f(t())));t?e.forever():e.never()}return t.forever=()=>e.forever(),t.never=()=>e.never(),t.using=t=>e.using((()=>f(t()))),t.invalidate=t=>e.invalidate((()=>f(t()))),t}(this)}mode(){return this._never?"never":this._forever?"forever":this._invalidate?"invalidate":"valid"}forever(){if(!this._active)throw new Error("Cannot change caching after evaluation has completed.");if(this._never)throw new Error("Caching has already been configured with .never()");this._forever=!0,this._configured=!0}never(){if(!this._active)throw new Error("Cannot change caching after evaluation has completed.");if(this._forever)throw new Error("Caching has already been configured with .forever()");this._never=!0,this._configured=!0}using(e){if(!this._active)throw new Error("Cannot change caching after evaluation has completed.");if(this._never||this._forever)throw new Error("Caching has already been configured with .never or .forever()");this._configured=!0;const t=e(this._data),r=(0,s.maybeAsync)(e,"You appear to be using an async cache handler, but Babel has been called synchronously");return(0,s.isThenable)(t)?t.then((e=>(this._pairs.push([e,r]),e))):(this._pairs.push([t,r]),t)}invalidate(e){return this._invalidate=!0,this.using(e)}validator(){const e=this._pairs;return function*(t){for(const[r,n]of e)if(r!==(yield*n(t)))return!1;return!0}}deactivate(){this._active=!1}configured(){return this._configured}}function f(e){if((0,s.isThenable)(e))throw new Error("You appear to be using an async cache handler, which your current version of Babel does not support. We may add support for this in the future, but if you're on the most recent version of @babel/core and still seeing this error, then you'll need to synchronously handle your caching logic.");if(null!=e&&"string"!=typeof e&&"boolean"!=typeof e&&"number"!=typeof e)throw new Error("Cache keys must be either string, boolean, number, null, or undefined.");return e}class m{constructor(){this.released=!1,this.promise=void 0,this._resolve=void 0,this.promise=new Promise((e=>{this._resolve=e}))}release(e){this.released=!0,this._resolve(e)}}},"../../node_modules/@babel/core/lib/config/config-chain.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/path-browserify/index.js");return n=function(){return e},e}function s(){const e=r("../../node_modules/debug/src/browser.js");return s=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.buildPresetChain=function*(e,t){const r=yield*d(e,t);return r?{plugins:L(r.plugins),presets:L(r.presets),options:r.options.map((e=>j(e))),files:new Set}:null},t.buildPresetChainWalker=void 0,t.buildRootChain=function*(e,t){let r,s;const i=new a.ConfigPrinter,l=yield*v({options:e,dirname:t.cwd},t,void 0,i);if(!l)return null;const c=yield*i.output();let p;"string"==typeof e.configFile?p=yield*(0,u.loadConfig)(e.configFile,t.cwd,t.envName,t.caller):!1!==e.configFile&&(p=yield*(0,u.findRootConfig)(t.root,t.envName,t.caller));let{babelrc:d,babelrcRoots:h}=e,f=t.cwd;const m=I(),g=new a.ConfigPrinter;if(p){const e=y(p),n=yield*x(e,t,void 0,g);if(!n)return null;r=yield*g.output(),void 0===d&&(d=e.options.babelrc),void 0===h&&(f=e.dirname,h=e.options.babelrcRoots),O(m,n)}let b,E,C=!1;const A=I();if((!0===d||void 0===d)&&"string"==typeof t.filename){const e=yield*(0,u.findPackageData)(t.filename);if(e&&function(e,t,r,s){if("boolean"==typeof r)return r;const i=e.root;if(void 0===r)return-1!==t.directories.indexOf(i);let a=r;return Array.isArray(a)||(a=[a]),a=a.map((e=>"string"==typeof e?n().resolve(s,e):e)),1===a.length&&a[0]===i?-1!==t.directories.indexOf(i):a.some((r=>("string"==typeof r&&(r=(0,o.default)(r,s)),t.directories.some((t=>q(r,s,t,e))))))}(t,e,h,f)){if(({ignore:b,config:E}=yield*(0,u.findRelativeConfig)(e,t.envName,t.caller)),b&&A.files.add(b.filepath),b&&V(t,b.ignore,null,b.dirname)&&(C=!0),E&&!C){const e=D(E),r=new a.ConfigPrinter,n=yield*x(e,t,void 0,r);n?(s=yield*r.output(),O(A,n)):C=!0}E&&C&&A.files.add(E.filepath)}}t.showConfig&&console.log(`Babel configs on "${t.filename}" (ascending priority):\n`+[r,s,c].filter((e=>!!e)).join("\n\n")+"\n-----End Babel configs-----");const w=O(O(O(I(),m),A),l);return{plugins:C?[]:L(w.plugins),presets:C?[]:L(w.presets),options:C?[]:w.options.map((e=>j(e))),fileHandling:C?"ignored":"transpile",ignore:b||void 0,babelrc:E||void 0,config:p||void 0,files:w.files}};var i=r("../../node_modules/@babel/core/lib/config/validation/options.js"),o=r("../../node_modules/@babel/core/lib/config/pattern-to-regex.js"),a=r("../../node_modules/@babel/core/lib/config/printer.js"),u=r("../../node_modules/@babel/core/lib/config/files/index-browser.js"),l=r("../../node_modules/@babel/core/lib/config/caching.js"),c=r("../../node_modules/@babel/core/lib/config/config-descriptors.js");const p=s()("babel:config:config-chain"),d=P({root:e=>h(e),env:(e,t)=>f(e)(t),overrides:(e,t)=>m(e)(t),overridesEnv:(e,t,r)=>g(e)(t)(r),createLogger:()=>()=>{}});t.buildPresetChainWalker=d;const h=(0,l.makeWeakCacheSync)((e=>_(e,e.alias,c.createUncachedDescriptors))),f=(0,l.makeWeakCacheSync)((e=>(0,l.makeStrongCacheSync)((t=>k(e,e.alias,c.createUncachedDescriptors,t))))),m=(0,l.makeWeakCacheSync)((e=>(0,l.makeStrongCacheSync)((t=>F(e,e.alias,c.createUncachedDescriptors,t))))),g=(0,l.makeWeakCacheSync)((e=>(0,l.makeStrongCacheSync)((t=>(0,l.makeStrongCacheSync)((r=>T(e,e.alias,c.createUncachedDescriptors,t,r))))))),y=(0,l.makeWeakCacheSync)((e=>({filepath:e.filepath,dirname:e.dirname,options:(0,i.validate)("configfile",e.options)}))),D=(0,l.makeWeakCacheSync)((e=>({filepath:e.filepath,dirname:e.dirname,options:(0,i.validate)("babelrcfile",e.options)}))),b=(0,l.makeWeakCacheSync)((e=>({filepath:e.filepath,dirname:e.dirname,options:(0,i.validate)("extendsfile",e.options)}))),v=P({root:e=>_(e,"base",c.createCachedDescriptors),env:(e,t)=>k(e,"base",c.createCachedDescriptors,t),overrides:(e,t)=>F(e,"base",c.createCachedDescriptors,t),overridesEnv:(e,t,r)=>T(e,"base",c.createCachedDescriptors,t,r),createLogger:(e,t,r)=>function(e,t,r){var n;return r?r.configure(t.showConfig,a.ChainFormatter.Programmatic,{callerName:null==(n=t.caller)?void 0:n.name}):()=>{}}(0,t,r)}),E=P({root:e=>C(e),env:(e,t)=>A(e)(t),overrides:(e,t)=>w(e)(t),overridesEnv:(e,t,r)=>S(e)(t)(r),createLogger:(e,t,r)=>function(e,t,r){return r?r.configure(t.showConfig,a.ChainFormatter.Config,{filepath:e}):()=>{}}(e.filepath,t,r)});function*x(e,t,r,n){const s=yield*E(e,t,r,n);return s&&s.files.add(e.filepath),s}const C=(0,l.makeWeakCacheSync)((e=>_(e,e.filepath,c.createUncachedDescriptors))),A=(0,l.makeWeakCacheSync)((e=>(0,l.makeStrongCacheSync)((t=>k(e,e.filepath,c.createUncachedDescriptors,t))))),w=(0,l.makeWeakCacheSync)((e=>(0,l.makeStrongCacheSync)((t=>F(e,e.filepath,c.createUncachedDescriptors,t))))),S=(0,l.makeWeakCacheSync)((e=>(0,l.makeStrongCacheSync)((t=>(0,l.makeStrongCacheSync)((r=>T(e,e.filepath,c.createUncachedDescriptors,t,r)))))));function _(e,t,r){let{dirname:n,options:s}=e;return r(n,s,t)}function k(e,t,r,n){let{dirname:s,options:i}=e;const o=i.env&&i.env[n];return o?r(s,o,`${t}.env["${n}"]`):null}function F(e,t,r,n){let{dirname:s,options:i}=e;const o=i.overrides&&i.overrides[n];if(!o)throw new Error("Assertion failure - missing override");return r(s,o,`${t}.overrides[${n}]`)}function T(e,t,r,n,s){let{dirname:i,options:o}=e;const a=o.overrides&&o.overrides[n];if(!a)throw new Error("Assertion failure - missing override");const u=a.env&&a.env[s];return u?r(i,u,`${t}.overrides[${n}].env["${s}"]`):null}function P(e){let{root:t,env:r,overrides:n,overridesEnv:s,createLogger:i}=e;return function*(e,o){let a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:new Set,u=arguments.length>3?arguments[3]:void 0;const{dirname:l}=e,c=[],p=t(e);if(M(p,l,o)){c.push({config:p,envName:void 0,index:void 0});const t=r(e,o.envName);t&&M(t,l,o)&&c.push({config:t,envName:o.envName,index:void 0}),(p.options.overrides||[]).forEach(((t,r)=>{const i=n(e,r);if(M(i,l,o)){c.push({config:i,index:r,envName:void 0});const t=s(e,r,o.envName);t&&M(t,l,o)&&c.push({config:t,index:r,envName:o.envName})}}))}if(c.some((e=>{let{config:{options:{ignore:t,only:r}}}=e;return V(o,t,r,l)})))return null;const d=I(),h=i(e,o,u);for(const{config:e,index:t,envName:r}of c){if(!(yield*N(d,e.options,l,o,a,u)))return null;h(e,t,r),yield*B(d,e)}return d}}function*N(e,t,r,n,s,i){if(void 0===t.extends)return!0;const o=yield*(0,u.loadConfig)(t.extends,r,n.envName,n.caller);if(s.has(o))throw new Error(`Configuration cycle detected loading ${o.filepath}.\nFile already loaded following the config chain:\n`+Array.from(s,(e=>` - ${e.filepath}`)).join("\n"));s.add(o);const a=yield*x(b(o),n,s,i);return s.delete(o),!!a&&(O(e,a),!0)}function O(e,t){e.options.push(...t.options),e.plugins.push(...t.plugins),e.presets.push(...t.presets);for(const r of t.files)e.files.add(r);return e}function*B(e,t){let{options:r,plugins:n,presets:s}=t;return e.options.push(r),e.plugins.push(...yield*n()),e.presets.push(...yield*s()),e}function I(){return{options:[],presets:[],plugins:[],files:new Set}}function j(e){const t=Object.assign({},e);return delete t.extends,delete t.env,delete t.overrides,delete t.plugins,delete t.presets,delete t.passPerPreset,delete t.ignore,delete t.only,delete t.test,delete t.include,delete t.exclude,Object.prototype.hasOwnProperty.call(t,"sourceMap")&&(t.sourceMaps=t.sourceMap,delete t.sourceMap),t}function L(e){const t=new Map,r=[];for(const n of e)if("function"==typeof n.value){const e=n.value;let s=t.get(e);s||(s=new Map,t.set(e,s));let i=s.get(n.name);i?i.value=n:(i={value:n},r.push(i),n.ownPass||s.set(n.name,i))}else r.push({value:n});return r.reduce(((e,t)=>(e.push(t.value),e)),[])}function M(e,t,r){let{options:n}=e;return(void 0===n.test||R(r,n.test,t))&&(void 0===n.include||R(r,n.include,t))&&(void 0===n.exclude||!R(r,n.exclude,t))}function R(e,t,r){return U(e,Array.isArray(t)?t:[t],r)}function $(e,t){return t instanceof RegExp?String(t):t}function V(e,t,r,n){if(t&&U(e,t,n)){var s;const r=`No config is applied to "${null!=(s=e.filename)?s:"(unknown)"}" because it matches one of \`ignore: ${JSON.stringify(t,$)}\` from "${n}"`;return p(r),e.showConfig&&console.log(r),!0}if(r&&!U(e,r,n)){var i;const t=`No config is applied to "${null!=(i=e.filename)?i:"(unknown)"}" because it fails to match one of \`only: ${JSON.stringify(r,$)}\` from "${n}"`;return p(t),e.showConfig&&console.log(t),!0}return!1}function U(e,t,r){return t.some((t=>q(t,r,e.filename,e)))}function q(e,t,r,n){if("function"==typeof e)return!!e(r,{dirname:t,envName:n.envName,caller:n.caller});if("string"!=typeof r)throw new Error("Configuration contains string/RegExp pattern, but no filename was passed to Babel");return"string"==typeof e&&(e=(0,o.default)(e,t)),e.test(r)}},"../../node_modules/@babel/core/lib/config/config-descriptors.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/gensync/index.js");return n=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.createCachedDescriptors=function(e,t,r){const{plugins:n,presets:s,passPerPreset:i}=t;return{options:l(t,e),plugins:n?()=>h(n,e)(r):()=>u([]),presets:s?()=>p(s,e)(r)(!!i):()=>u([])}},t.createDescriptor=b,t.createUncachedDescriptors=function(e,t,r){let n,s;return{options:l(t,e),*plugins(){return n||(n=yield*y(t.plugins||[],e,r)),n},*presets(){return s||(s=yield*g(t.presets||[],e,r,!!t.passPerPreset)),s}}};var s=r("../../node_modules/@babel/core/lib/config/files/index-browser.js"),i=r("../../node_modules/@babel/core/lib/config/item.js"),o=r("../../node_modules/@babel/core/lib/config/caching.js"),a=r("../../node_modules/@babel/core/lib/config/resolve-targets-browser.js");function*u(e){return e}function l(e,t){return"string"==typeof e.browserslistConfigFile&&(e.browserslistConfigFile=(0,a.resolveBrowserslistConfigFile)(e.browserslistConfigFile,t)),e}const c=new WeakMap,p=(0,o.makeWeakCacheSync)(((e,t)=>{const r=t.using((e=>e));return(0,o.makeStrongCacheSync)((t=>(0,o.makeStrongCache)((function*(n){return(yield*g(e,r,t,n)).map((e=>m(c,e)))}))))})),d=new WeakMap,h=(0,o.makeWeakCacheSync)(((e,t)=>{const r=t.using((e=>e));return(0,o.makeStrongCache)((function*(t){return(yield*y(e,r,t)).map((e=>m(d,e)))}))})),f={};function m(e,t){const{value:r,options:n=f}=t;if(!1===n)return t;let s=e.get(r);s||(s=new WeakMap,e.set(r,s));let i=s.get(n);if(i||(i=[],s.set(n,i)),-1===i.indexOf(t)){const e=i.filter((e=>{return n=t,(r=e).name===n.name&&r.value===n.value&&r.options===n.options&&r.dirname===n.dirname&&r.alias===n.alias&&r.ownPass===n.ownPass&&(r.file&&r.file.request)===(n.file&&n.file.request)&&(r.file&&r.file.resolved)===(n.file&&n.file.resolved);var r,n}));if(e.length>0)return e[0];i.push(t)}return t}function*g(e,t,r,n){return yield*D("preset",e,t,r,n)}function*y(e,t,r){return yield*D("plugin",e,t,r)}function*D(e,t,r,s,i){const o=yield*n().all(t.map(((t,n)=>b(t,r,{type:e,alias:`${s}$${n}`,ownPass:!!i}))));return function(e){const t=new Map;for(const r of e){if("function"!=typeof r.value)continue;let n=t.get(r.value);if(n||(n=new Set,t.set(r.value,n)),n.has(r.name)){const t=e.filter((e=>e.value===r.value));throw new Error(["Duplicate plugin/preset detected.","If you'd like to use two separate instances of a plugin,","they need separate names, e.g.","","  plugins: [","    ['some-plugin', {}],","    ['some-plugin', {}, 'some unique name'],","  ]","","Duplicates detected are:",`${JSON.stringify(t,null,2)}`].join("\n"))}n.add(r.name)}}(o),o}function*b(e,t,r){let{type:n,alias:o,ownPass:a}=r;const u=(0,i.getItemDescriptor)(e);if(u)return u;let l,c,p,d=e;Array.isArray(d)&&(3===d.length?[d,c,l]=d:[d,c]=d);let h=null;if("string"==typeof d){if("string"!=typeof n)throw new Error("To resolve a string-based item, the type of item must be given");const e="plugin"===n?s.loadPlugin:s.loadPreset,r=d;({filepath:h,value:d}=yield*e(d,t)),p={request:r,resolved:h}}if(!d)throw new Error(`Unexpected falsy value: ${String(d)}`);if("object"==typeof d&&d.__esModule){if(!d.default)throw new Error("Must export a default export when using ES6 modules.");d=d.default}if("object"!=typeof d&&"function"!=typeof d)throw new Error(`Unsupported format: ${typeof d}. Expected an object or a function.`);if(null!==h&&"object"==typeof d&&d)throw new Error(`Plugin/Preset files are not allowed to export objects, only functions. In ${h}`);return{name:l,alias:h||o,value:d,options:c,dirname:t,ownPass:a,file:p}}},"../../node_modules/@babel/core/lib/config/files/index-browser.js":(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.ROOT_CONFIG_FILENAMES=void 0,t.findConfigUpwards=function(e){return null},t.findPackageData=function*(e){return{filepath:e,directories:[],pkg:null,isPackage:!1}},t.findRelativeConfig=function*(e,t,r){return{config:null,ignore:null}},t.findRootConfig=function*(e,t,r){return null},t.loadConfig=function*(e,t,r,n){throw new Error(`Cannot load ${e} relative to ${t} in a browser`)},t.loadPlugin=function(e,t){throw new Error(`Cannot load plugin ${e} relative to ${t} in a browser`)},t.loadPreset=function(e,t){throw new Error(`Cannot load preset ${e} relative to ${t} in a browser`)},t.resolvePlugin=function(e,t){return null},t.resolvePreset=function(e,t){return null},t.resolveShowConfigPath=function*(e){return null},t.ROOT_CONFIG_FILENAMES=[]},"../../node_modules/@babel/core/lib/config/full.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/gensync/index.js");return n=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var s=r("../../node_modules/@babel/core/lib/gensync-utils/async.js"),i=r("../../node_modules/@babel/core/lib/config/util.js"),o=r("../../node_modules/@babel/core/lib/index.js"),a=r("../../node_modules/@babel/core/lib/config/plugin.js"),u=r("../../node_modules/@babel/core/lib/config/item.js"),l=r("../../node_modules/@babel/core/lib/config/config-chain.js");function c(){const e=r("../../node_modules/@babel/traverse/lib/index.js");return c=function(){return e},e}var p=r("../../node_modules/@babel/core/lib/config/caching.js"),d=r("../../node_modules/@babel/core/lib/config/validation/options.js"),h=r("../../node_modules/@babel/core/lib/config/validation/plugins.js"),f=r("../../node_modules/@babel/core/lib/config/helpers/config-api.js"),m=r("../../node_modules/@babel/core/lib/config/partial.js"),g=(r("../../node_modules/@babel/core/lib/config/cache-contexts.js"),n()((function*(e){var t;const r=yield*(0,m.default)(e);if(!r)return null;const{options:n,context:s,fileHandling:o}=r;if("ignored"===o)return null;const a={},{plugins:l,presets:c}=n;if(!l||!c)throw new Error("Assertion failure - plugins and presets exist");const p=Object.assign({},s,{targets:n.targets}),h=e=>{const t=(0,u.getItemDescriptor)(e);if(!t)throw new Error("Assertion failure - must be config item");return t},f=c.map(h),g=l.map(h),D=[[]],b=[],v=yield*y(s,(function*e(t,r){const n=[];for(let e=0;e<t.length;e++){const s=t[e];if(!1!==s.options)try{s.ownPass?n.push({preset:yield*A(s,p),pass:[]}):n.unshift({preset:yield*A(s,p),pass:r})}catch(r){throw"BABEL_UNKNOWN_OPTION"===r.code&&(0,d.checkNoUnwrappedItemOptionPairs)(t,e,"preset",r),r}}if(n.length>0){D.splice(1,0,...n.map((e=>e.pass)).filter((e=>e!==r)));for(const{preset:t,pass:r}of n){if(!t)return!0;if(r.push(...t.plugins),yield*e(t.presets,r))return!0;t.options.forEach((e=>{(0,i.mergeOptions)(a,e)}))}}}))(f,D[0]);if(v)return null;const x=a;(0,i.mergeOptions)(x,n);const C=Object.assign({},p,{assumptions:null!=(t=x.assumptions)?t:{}});return yield*y(s,(function*(){D[0].unshift(...g);for(const e of D){const t=[];b.push(t);for(let r=0;r<e.length;r++){const n=e[r];if(!1!==n.options)try{t.push(yield*E(n,C))}catch(t){throw"BABEL_UNKNOWN_PLUGIN_PROPERTY"===t.code&&(0,d.checkNoUnwrappedItemOptionPairs)(e,r,"plugin",t),t}}}}))(),x.plugins=b[0],x.presets=b.slice(1).filter((e=>e.length>0)).map((e=>({plugins:e}))),x.passPerPreset=x.presets.length>0,{options:x,passes:b}})));function y(e,t){return function*(r,n){try{return yield*t(r,n)}catch(t){throw/^\[BABEL\]/.test(t.message)||(t.message=`[BABEL] ${e.filename||"unknown"}: ${t.message}`),t}}}t.default=g;const D=e=>(0,p.makeWeakCache)((function*(t,r){let{value:n,options:i,dirname:a,alias:u}=t;if(!1===i)throw new Error("Assertion failure");i=i||{};let l=n;if("function"==typeof n){const t=(0,s.maybeAsync)(n,"You appear to be using an async plugin/preset, but Babel has been called synchronously"),c=Object.assign({},o,e(r));try{l=yield*t(c,i,a)}catch(e){throw u&&(e.message+=` (While processing: ${JSON.stringify(u)})`),e}}if(!l||"object"!=typeof l)throw new Error("Plugin/Preset did not return an object.");if((0,s.isThenable)(l))throw yield*[],new Error(`You appear to be using a promise as a plugin, which your current version of Babel does not support. If you're using a published plugin, you may need to upgrade your @babel/core version. As an alternative, you can prefix the promise with "await". (While processing: ${JSON.stringify(u)})`);return{value:l,options:i,dirname:a,alias:u}})),b=D(f.makePluginAPI),v=D(f.makePresetAPI);function*E(e,t){if(e.value instanceof a.default){if(e.options)throw new Error("Passed options to an existing Plugin instance will not work.");return e.value}return yield*x(yield*b(e,t),t)}const x=(0,p.makeWeakCache)((function*(e,t){let{value:r,options:n,dirname:i,alias:o}=e;const u=(0,h.validatePluginObject)(r),l=Object.assign({},u);if(l.visitor&&(l.visitor=c().default.explode(Object.assign({},l.visitor))),l.inherits){const e={name:void 0,alias:`${o}$inherits`,value:l.inherits,options:n,dirname:i},r=yield*(0,s.forwardAsync)(E,(r=>t.invalidate((t=>r(e,t)))));l.pre=S(r.pre,l.pre),l.post=S(r.post,l.post),l.manipulateOptions=S(r.manipulateOptions,l.manipulateOptions),l.visitor=c().default.visitors.merge([r.visitor||{},l.visitor||{}])}return new a.default(l,n,o)})),C=(e,t)=>{if(e.test||e.include||e.exclude){const e=t.name?`"${t.name}"`:"/* your preset */";throw new Error([`Preset ${e} requires a filename to be set when babel is called directly,`,"```",`babel.transform(code, { filename: 'file.ts', presets: [${e}] });`,"```","See https://babeljs.io/docs/en/options#filename for more information."].join("\n"))}};function*A(e,t){const r=w(yield*v(e,t));return((e,t,r)=>{if(!t.filename){const{options:t}=e;C(t,r),t.overrides&&t.overrides.forEach((e=>C(e,r)))}})(r,t,e),yield*(0,l.buildPresetChain)(r,t)}const w=(0,p.makeWeakCacheSync)((e=>{let{value:t,dirname:r,alias:n}=e;return{options:(0,d.validate)("preset",t),alias:n,dirname:r}}));function S(e,t){const r=[e,t].filter(Boolean);return r.length<=1?r[0]:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];for(const e of r)e.apply(this,t)}}},"../../node_modules/@babel/core/lib/config/helpers/config-api.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/semver/semver.js");return n=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.makeConfigAPI=o,t.makePluginAPI=function(e){return Object.assign({},a(e),{assumption:t=>e.using((e=>e.assumptions[t]))})},t.makePresetAPI=a;var s=r("../../node_modules/@babel/core/lib/index.js"),i=r("../../node_modules/@babel/core/lib/config/caching.js");function o(e){return{version:s.version,cache:e.simple(),env:t=>e.using((e=>void 0===t?e.envName:"function"==typeof t?(0,i.assertSimpleType)(t(e.envName)):(Array.isArray(t)||(t=[t]),t.some((t=>{if("string"!=typeof t)throw new Error("Unexpected non-string value");return t===e.envName}))))),async:()=>!1,caller:t=>e.using((e=>(0,i.assertSimpleType)(t(e.caller)))),assertVersion:u}}function a(e){return Object.assign({},o(e),{targets:()=>JSON.parse(e.using((e=>JSON.stringify(e.targets))))})}function u(e){if("number"==typeof e){if(!Number.isInteger(e))throw new Error("Expected string or integer value.");e=`^${e}.0.0-0`}if("string"!=typeof e)throw new Error("Expected string or integer value.");if(n().satisfies(s.version,e))return;const t=Error.stackTraceLimit;"number"==typeof t&&t<25&&(Error.stackTraceLimit=25);const r=new Error(`Requires Babel "${e}", but was loaded with "${s.version}". If you are sure you have a compatible version of @babel/core, it is likely that something in your build process is loading the wrong version. Inspect the stack trace of this error to look for the first entry that doesn't mention "@babel/core" or "babel-core" to see what is calling Babel.`);throw"number"==typeof t&&(Error.stackTraceLimit=t),Object.assign(r,{code:"BABEL_VERSION_UNSUPPORTED",version:s.version,range:e})}r("../../node_modules/@babel/core/lib/config/cache-contexts.js")},"../../node_modules/@babel/core/lib/config/helpers/environment.js":(e,t,r)=>{"use strict";var n=r("../../browser-shims/process.js");Object.defineProperty(t,"__esModule",{value:!0}),t.getEnv=function(){return n.env.BABEL_ENV||"production"}},"../../node_modules/@babel/core/lib/config/index.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/gensync/index.js");return n=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.createConfigItem=function(e,t,r){return void 0!==r?u.errback(e,t,r):"function"==typeof t?u.errback(e,void 0,r):u.sync(e,t)},t.createConfigItemSync=t.createConfigItemAsync=void 0,Object.defineProperty(t,"default",{enumerable:!0,get:function(){return s.default}}),t.loadPartialConfigSync=t.loadPartialConfigAsync=t.loadPartialConfig=t.loadOptionsSync=t.loadOptionsAsync=t.loadOptions=void 0;var s=r("../../node_modules/@babel/core/lib/config/full.js"),i=r("../../node_modules/@babel/core/lib/config/partial.js"),o=r("../../node_modules/@babel/core/lib/config/item.js");const a=n()((function*(e){var t;const r=yield*(0,s.default)(e);return null!=(t=null==r?void 0:r.options)?t:null})),u=n()(o.createConfigItem),l=e=>(t,r)=>(void 0===r&&"function"==typeof t&&(r=t,t=void 0),r?e.errback(t,r):e.sync(t)),c=l(i.loadPartialConfig);t.loadPartialConfig=c;const p=i.loadPartialConfig.sync;t.loadPartialConfigSync=p;const d=i.loadPartialConfig.async;t.loadPartialConfigAsync=d;const h=l(a);t.loadOptions=h;const f=a.sync;t.loadOptionsSync=f;const m=a.async;t.loadOptionsAsync=m;const g=u.sync;t.createConfigItemSync=g;const y=u.async;t.createConfigItemAsync=y},"../../node_modules/@babel/core/lib/config/item.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/path-browserify/index.js");return n=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.createConfigItem=function*(e){let{dirname:t=".",type:r}=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};const o=yield*(0,s.createDescriptor)(e,n().resolve(t),{type:r,alias:"programmatic item"});return i(o)},t.createItemFromDescriptor=i,t.getItemDescriptor=function(e){if(null!=e&&e[o])return e._descriptor};var s=r("../../node_modules/@babel/core/lib/config/config-descriptors.js");function i(e){return new a(e)}const o=Symbol.for("@babel/core@7 - ConfigItem");class a{constructor(e){this._descriptor=void 0,this[o]=!0,this.value=void 0,this.options=void 0,this.dirname=void 0,this.name=void 0,this.file=void 0,this._descriptor=e,Object.defineProperty(this,"_descriptor",{enumerable:!1}),Object.defineProperty(this,o,{enumerable:!1}),this.value=this._descriptor.value,this.options=this._descriptor.options,this.dirname=this._descriptor.dirname,this.name=this._descriptor.name,this.file=this._descriptor.file?{request:this._descriptor.file.request,resolved:this._descriptor.file.resolved}:void 0,Object.freeze(this)}}Object.freeze(a.prototype)},"../../node_modules/@babel/core/lib/config/partial.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/path-browserify/index.js");return n=function(){return e},e}function s(){const e=r("../../node_modules/gensync/index.js");return s=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.default=f,t.loadPartialConfig=void 0;var i=r("../../node_modules/@babel/core/lib/config/plugin.js"),o=r("../../node_modules/@babel/core/lib/config/util.js"),a=r("../../node_modules/@babel/core/lib/config/item.js"),u=r("../../node_modules/@babel/core/lib/config/config-chain.js"),l=r("../../node_modules/@babel/core/lib/config/helpers/environment.js"),c=r("../../node_modules/@babel/core/lib/config/validation/options.js"),p=r("../../node_modules/@babel/core/lib/config/files/index-browser.js"),d=r("../../node_modules/@babel/core/lib/config/resolve-targets-browser.js");const h=["showIgnoredFiles"];function*f(e){if(null!=e&&("object"!=typeof e||Array.isArray(e)))throw new Error("Babel options must be an object, null, or undefined");const t=e?(0,c.validate)("arguments",e):{},{envName:r=(0,l.getEnv)(),cwd:s=".",root:i=".",rootMode:h="root",caller:f,cloneInputAst:m=!0}=t,g=n().resolve(s),y=function(e,t){switch(t){case"root":return e;case"upward-optional":{const t=(0,p.findConfigUpwards)(e);return null===t?e:t}case"upward":{const t=(0,p.findConfigUpwards)(e);if(null!==t)return t;throw Object.assign(new Error(`Babel was run with rootMode:"upward" but a root could not be found when searching upward from "${e}".\nOne of the following config files must be in the directory tree: "${p.ROOT_CONFIG_FILENAMES.join(", ")}".`),{code:"BABEL_ROOT_NOT_FOUND",dirname:e})}default:throw new Error("Assertion failure - unknown rootMode value.")}}(n().resolve(g,i),h),D="string"==typeof t.filename?n().resolve(s,t.filename):void 0,b={filename:D,cwd:g,root:y,envName:r,caller:f,showConfig:(yield*(0,p.resolveShowConfigPath)(g))===D},v=yield*(0,u.buildRootChain)(t,b);if(!v)return null;const E={assumptions:{}};return v.options.forEach((e=>{(0,o.mergeOptions)(E,e)})),{options:Object.assign({},E,{targets:(0,d.resolveTargets)(E,y),cloneInputAst:m,babelrc:!1,configFile:!1,browserslistConfigFile:!1,passPerPreset:!1,envName:b.envName,cwd:b.cwd,root:b.root,rootMode:"root",filename:"string"==typeof b.filename?b.filename:void 0,plugins:v.plugins.map((e=>(0,a.createItemFromDescriptor)(e))),presets:v.presets.map((e=>(0,a.createItemFromDescriptor)(e)))}),context:b,fileHandling:v.fileHandling,ignore:v.ignore,babelrc:v.babelrc,config:v.config,files:v.files}}const m=s()((function*(e){let t=!1;if("object"==typeof e&&null!==e&&!Array.isArray(e)){var r=e;({showIgnoredFiles:t}=r),e=function(e,t){if(null==e)return{};var r,n,s={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(s[r]=e[r]);return s}(r,h)}const n=yield*f(e);if(!n)return null;const{options:s,babelrc:o,ignore:a,config:u,fileHandling:l,files:c}=n;return"ignored"!==l||t?((s.plugins||[]).forEach((e=>{if(e.value instanceof i.default)throw new Error("Passing cached plugin instances is not supported in babel.loadPartialConfig()")})),new g(s,o?o.filepath:void 0,a?a.filepath:void 0,u?u.filepath:void 0,l,c)):null}));t.loadPartialConfig=m;class g{constructor(e,t,r,n,s,i){this.options=void 0,this.babelrc=void 0,this.babelignore=void 0,this.config=void 0,this.fileHandling=void 0,this.files=void 0,this.options=e,this.babelignore=r,this.babelrc=t,this.config=n,this.fileHandling=s,this.files=i,Object.freeze(this)}hasFilesystemConfig(){return void 0!==this.babelrc||void 0!==this.config}}Object.freeze(g.prototype)},"../../node_modules/@babel/core/lib/config/pattern-to-regex.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/path-browserify/index.js");return n=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t){const r=n().resolve(t,e).split(n().sep);return new RegExp(["^",...r.map(((e,t)=>{const n=t===r.length-1;return"**"===e?n?c:l:"*"===e?n?u:a:0===e.indexOf("*.")?o+p(e.slice(1))+(n?i:s):p(e)+(n?i:s)}))].join(""))};const s=`\\${n().sep}`,i=`(?:${s}|$)`,o=`[^${s}]+`,a=`(?:${o}${s})`,u=`(?:${o}${i})`,l=`${a}*?`,c=`${a}*?${u}?`;function p(e){return e.replace(/[|\\{}()[\]^$+*?.]/g,"\\$&")}},"../../node_modules/@babel/core/lib/config/plugin.js":(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0,t.default=class{constructor(e,t,r){this.key=void 0,this.manipulateOptions=void 0,this.post=void 0,this.pre=void 0,this.visitor=void 0,this.parserOverride=void 0,this.generatorOverride=void 0,this.options=void 0,this.key=e.name||r,this.manipulateOptions=e.manipulateOptions,this.post=e.post,this.pre=e.pre,this.visitor=e.visitor||{},this.parserOverride=e.parserOverride,this.generatorOverride=e.generatorOverride,this.options=t}}},"../../node_modules/@babel/core/lib/config/printer.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/gensync/index.js");return n=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.ConfigPrinter=t.ChainFormatter=void 0;const s={Programmatic:0,Config:1};t.ChainFormatter=s;const i={title(e,t,r){let n="";return e===s.Programmatic?(n="programmatic options",t&&(n+=" from "+t)):n="config "+r,n},loc(e,t){let r="";return null!=e&&(r+=`.overrides[${e}]`),null!=t&&(r+=`.env["${t}"]`),r},*optionsAndDescriptors(e){const t=Object.assign({},e.options);delete t.overrides,delete t.env;const r=[...yield*e.plugins()];r.length&&(t.plugins=r.map((e=>o(e))));const n=[...yield*e.presets()];return n.length&&(t.presets=[...n].map((e=>o(e)))),JSON.stringify(t,void 0,2)}};function o(e){var t;let r=null==(t=e.file)?void 0:t.request;return null==r&&("object"==typeof e.value?r=e.value:"function"==typeof e.value&&(r=`[Function: ${e.value.toString().substr(0,50)} ... ]`)),null==r&&(r="[Unknown]"),void 0===e.options?r:null==e.name?[r,e.options]:[r,e.options,e.name]}class a{constructor(){this._stack=[]}configure(e,t,r){let{callerName:n,filepath:s}=r;return e?(e,r,i)=>{this._stack.push({type:t,callerName:n,filepath:s,content:e,index:r,envName:i})}:()=>{}}static*format(e){let t=i.title(e.type,e.callerName,e.filepath);const r=i.loc(e.index,e.envName);return r&&(t+=` ${r}`),`${t}\n${yield*i.optionsAndDescriptors(e.content)}`}*output(){return 0===this._stack.length?"":(yield*n().all(this._stack.map((e=>a.format(e))))).join("\n\n")}}t.ConfigPrinter=a},"../../node_modules/@babel/core/lib/config/resolve-targets-browser.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/@babel/helper-compilation-targets/lib/index.js");return n=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.resolveBrowserslistConfigFile=function(e,t){},t.resolveTargets=function(e,t){let r=e.targets;return("string"==typeof r||Array.isArray(r))&&(r={browsers:r}),r&&r.esmodules&&(r=Object.assign({},r,{esmodules:"intersect"})),(0,n().default)(r,{ignoreBrowserslistConfig:!0,browserslistEnv:e.browserslistEnv})}},"../../node_modules/@babel/core/lib/config/util.js":(e,t)=>{"use strict";function r(e,t){for(const r of Object.keys(t)){const n=t[r];void 0!==n&&(e[r]=n)}}Object.defineProperty(t,"__esModule",{value:!0}),t.isIterableIterator=function(e){return!!e&&"function"==typeof e.next&&"function"==typeof e[Symbol.iterator]},t.mergeOptions=function(e,t){for(const n of Object.keys(t))if("parserOpts"!==n&&"generatorOpts"!==n&&"assumptions"!==n||!t[n]){const r=t[n];void 0!==r&&(e[n]=r)}else{const s=t[n];r(e[n]||(e[n]={}),s)}}},"../../node_modules/@babel/core/lib/config/validation/option-assertions.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/@babel/helper-compilation-targets/lib/index.js");return n=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.access=o,t.assertArray=l,t.assertAssumptions=function(e,t){if(void 0===t)return;if("object"!=typeof t||null===t)throw new Error(`${i(e)} must be an object or undefined.`);let r=e;do{r=r.parent}while("root"!==r.type);const n="preset"===r.source;for(const r of Object.keys(t)){const a=o(e,r);if(!s.assumptionsNames.has(r))throw new Error(`${i(a)} is not a supported assumption.`);if("boolean"!=typeof t[r])throw new Error(`${i(a)} must be a boolean.`);if(n&&!1===t[r])throw new Error(`${i(a)} cannot be set to 'false' inside presets.`)}return t},t.assertBabelrcSearch=function(e,t){if(void 0===t||"boolean"==typeof t)return t;if(Array.isArray(t))t.forEach(((t,r)=>{if(!c(t))throw new Error(`${i(o(e,r))} must be a string/Function/RegExp.`)}));else if(!c(t))throw new Error(`${i(e)} must be a undefined, a boolean, a string/Function/RegExp or an array of those, got ${JSON.stringify(t)}`);return t},t.assertBoolean=a,t.assertCallerMetadata=function(e,t){const r=u(e,t);if(r){if("string"!=typeof r.name)throw new Error(`${i(e)} set but does not contain "name" property string`);for(const t of Object.keys(r)){const n=o(e,t),s=r[t];if(null!=s&&"boolean"!=typeof s&&"string"!=typeof s&&"number"!=typeof s)throw new Error(`${i(n)} must be null, undefined, a boolean, a string, or a number.`)}}return t},t.assertCompact=function(e,t){if(void 0!==t&&"boolean"!=typeof t&&"auto"!==t)throw new Error(`${i(e)} must be a boolean, "auto", or undefined`);return t},t.assertConfigApplicableTest=function(e,t){if(void 0===t)return t;if(Array.isArray(t))t.forEach(((t,r)=>{if(!c(t))throw new Error(`${i(o(e,r))} must be a string/Function/RegExp.`)}));else if(!c(t))throw new Error(`${i(e)} must be a string/Function/RegExp, or an array of those`);return t},t.assertConfigFileSearch=function(e,t){if(void 0!==t&&"boolean"!=typeof t&&"string"!=typeof t)throw new Error(`${i(e)} must be a undefined, a boolean, a string, got ${JSON.stringify(t)}`);return t},t.assertFunction=function(e,t){if(void 0!==t&&"function"!=typeof t)throw new Error(`${i(e)} must be a function, or undefined`);return t},t.assertIgnoreList=function(e,t){const r=l(e,t);return r&&r.forEach(((t,r)=>function(e,t){if("string"!=typeof t&&"function"!=typeof t&&!(t instanceof RegExp))throw new Error(`${i(e)} must be an array of string/Function/RegExp values, or undefined`);return t}(o(e,r),t))),r},t.assertInputSourceMap=function(e,t){if(void 0!==t&&"boolean"!=typeof t&&("object"!=typeof t||!t))throw new Error(`${i(e)} must be a boolean, object, or undefined`);return t},t.assertObject=u,t.assertPluginList=function(e,t){const r=l(e,t);return r&&r.forEach(((t,r)=>function(e,t){if(Array.isArray(t)){if(0===t.length)throw new Error(`${i(e)} must include an object`);if(t.length>3)throw new Error(`${i(e)} may only be a two-tuple or three-tuple`);if(p(o(e,0),t[0]),t.length>1){const r=t[1];if(void 0!==r&&!1!==r&&("object"!=typeof r||Array.isArray(r)||null===r))throw new Error(`${i(o(e,1))} must be an object, false, or undefined`)}if(3===t.length){const r=t[2];if(void 0!==r&&"string"!=typeof r)throw new Error(`${i(o(e,2))} must be a string, or undefined`)}}else p(e,t);return t}(o(e,r),t))),r},t.assertRootMode=function(e,t){if(void 0!==t&&"root"!==t&&"upward"!==t&&"upward-optional"!==t)throw new Error(`${i(e)} must be a "root", "upward", "upward-optional" or undefined`);return t},t.assertSourceMaps=function(e,t){if(void 0!==t&&"boolean"!=typeof t&&"inline"!==t&&"both"!==t)throw new Error(`${i(e)} must be a boolean, "inline", "both", or undefined`);return t},t.assertSourceType=function(e,t){if(void 0!==t&&"module"!==t&&"script"!==t&&"unambiguous"!==t)throw new Error(`${i(e)} must be "module", "script", "unambiguous", or undefined`);return t},t.assertString=function(e,t){if(void 0!==t&&"string"!=typeof t)throw new Error(`${i(e)} must be a string, or undefined`);return t},t.assertTargets=function(e,t){if((0,n().isBrowsersQueryValid)(t))return t;if("object"!=typeof t||!t||Array.isArray(t))throw new Error(`${i(e)} must be a string, an array of strings or an object`);const r=o(e,"browsers"),s=o(e,"esmodules");d(r,t.browsers),a(s,t.esmodules);for(const r of Object.keys(t)){const s=t[r],u=o(e,r);if("esmodules"===r)a(u,s);else if("browsers"===r)d(u,s);else{if(!Object.hasOwnProperty.call(n().TargetNames,r)){const e=Object.keys(n().TargetNames).join(", ");throw new Error(`${i(u)} is not a valid target. Supported targets are ${e}`)}h(u,s)}}return t},t.msg=i;var s=r("../../node_modules/@babel/core/lib/config/validation/options.js");function i(e){switch(e.type){case"root":return"";case"env":return`${i(e.parent)}.env["${e.name}"]`;case"overrides":return`${i(e.parent)}.overrides[${e.index}]`;case"option":return`${i(e.parent)}.${e.name}`;case"access":return`${i(e.parent)}[${JSON.stringify(e.name)}]`;default:throw new Error(`Assertion failure: Unknown type ${e.type}`)}}function o(e,t){return{type:"access",name:t,parent:e}}function a(e,t){if(void 0!==t&&"boolean"!=typeof t)throw new Error(`${i(e)} must be a boolean, or undefined`);return t}function u(e,t){if(void 0!==t&&("object"!=typeof t||Array.isArray(t)||!t))throw new Error(`${i(e)} must be an object, or undefined`);return t}function l(e,t){if(null!=t&&!Array.isArray(t))throw new Error(`${i(e)} must be an array, or undefined`);return t}function c(e){return"string"==typeof e||"function"==typeof e||e instanceof RegExp}function p(e,t){if(("object"!=typeof t||!t)&&"string"!=typeof t&&"function"!=typeof t)throw new Error(`${i(e)} must be a string, object, function`);return t}function d(e,t){if(void 0!==t&&!(0,n().isBrowsersQueryValid)(t))throw new Error(`${i(e)} must be undefined, a string or an array of strings`)}function h(e,t){if(("number"!=typeof t||Math.round(t)!==t)&&"string"!=typeof t)throw new Error(`${i(e)} must be a string or an integer number`)}},"../../node_modules/@babel/core/lib/config/validation/options.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.assumptionsNames=void 0,t.checkNoUnwrappedItemOptionPairs=function(e,t,r,n){if(0===t)return;const s=e[t-1],i=e[t];s.file&&void 0===s.options&&"object"==typeof i.value&&(n.message+=`\n- Maybe you meant to use\n"${r}s": [\n  ["${s.file.request}", ${JSON.stringify(i.value,void 0,2)}]\n]\nTo be a valid ${r}, its name and options should be wrapped in a pair of brackets`)},t.validate=function(e,t){return p({type:"root",source:e},t)},r("../../node_modules/@babel/core/lib/config/plugin.js");var n=r("../../node_modules/@babel/core/lib/config/validation/removed.js"),s=r("../../node_modules/@babel/core/lib/config/validation/option-assertions.js");const i={cwd:s.assertString,root:s.assertString,rootMode:s.assertRootMode,configFile:s.assertConfigFileSearch,caller:s.assertCallerMetadata,filename:s.assertString,filenameRelative:s.assertString,code:s.assertBoolean,ast:s.assertBoolean,cloneInputAst:s.assertBoolean,envName:s.assertString},o={babelrc:s.assertBoolean,babelrcRoots:s.assertBabelrcSearch},a={extends:s.assertString,ignore:s.assertIgnoreList,only:s.assertIgnoreList,targets:s.assertTargets,browserslistConfigFile:s.assertConfigFileSearch,browserslistEnv:s.assertString},u={inputSourceMap:s.assertInputSourceMap,presets:s.assertPluginList,plugins:s.assertPluginList,passPerPreset:s.assertBoolean,assumptions:s.assertAssumptions,env:function(e,t){if("env"===e.parent.type)throw new Error(`${(0,s.msg)(e)} is not allowed inside of another .env block`);const r=e.parent,n=(0,s.assertObject)(e,t);if(n)for(const t of Object.keys(n)){const i=(0,s.assertObject)((0,s.access)(e,t),n[t]);i&&p({type:"env",name:t,parent:r},i)}return n},overrides:function(e,t){if("env"===e.parent.type)throw new Error(`${(0,s.msg)(e)} is not allowed inside an .env block`);if("overrides"===e.parent.type)throw new Error(`${(0,s.msg)(e)} is not allowed inside an .overrides block`);const r=e.parent,n=(0,s.assertArray)(e,t);if(n)for(const[t,i]of n.entries()){const n=(0,s.access)(e,t),o=(0,s.assertObject)(n,i);if(!o)throw new Error(`${(0,s.msg)(n)} must be an object`);p({type:"overrides",index:t,parent:r},o)}return n},test:s.assertConfigApplicableTest,include:s.assertConfigApplicableTest,exclude:s.assertConfigApplicableTest,retainLines:s.assertBoolean,comments:s.assertBoolean,shouldPrintComment:s.assertFunction,compact:s.assertCompact,minified:s.assertBoolean,auxiliaryCommentBefore:s.assertString,auxiliaryCommentAfter:s.assertString,sourceType:s.assertSourceType,wrapPluginVisitorMethod:s.assertFunction,highlightCode:s.assertBoolean,sourceMaps:s.assertSourceMaps,sourceMap:s.assertSourceMaps,sourceFileName:s.assertString,sourceRoot:s.assertString,parserOpts:s.assertObject,generatorOpts:s.assertObject};Object.assign(u,{getModuleId:s.assertFunction,moduleRoot:s.assertString,moduleIds:s.assertBoolean,moduleId:s.assertString});const l=new Set(["arrayLikeIsIterable","constantReexports","constantSuper","enumerableModuleMeta","ignoreFunctionLength","ignoreToPrimitiveHint","iterableIsArray","mutableTemplateObject","noClassCalls","noDocumentAll","noIncompleteNsImportDetection","noNewArrows","objectRestNoSymbols","privateFieldsAsProperties","pureGetters","setClassMethods","setComputedProperties","setPublicClassFields","setSpreadProperties","skipForOfIteratorClosing","superIsCallableConstructor"]);function c(e){return"root"===e.type?e.source:c(e.parent)}function p(e,t){const r=c(e);return function(e){if(h(e,"sourceMap")&&h(e,"sourceMaps"))throw new Error(".sourceMap is an alias for .sourceMaps, cannot use both")}(t),Object.keys(t).forEach((n=>{const l={type:"option",name:n,parent:e};if("preset"===r&&a[n])throw new Error(`${(0,s.msg)(l)} is not allowed in preset options`);if("arguments"!==r&&i[n])throw new Error(`${(0,s.msg)(l)} is only allowed in root programmatic options`);if("arguments"!==r&&"configfile"!==r&&o[n]){if("babelrcfile"===r||"extendsfile"===r)throw new Error(`${(0,s.msg)(l)} is not allowed in .babelrc or "extends"ed files, only in root programmatic options, or babel.config.js/config file options`);throw new Error(`${(0,s.msg)(l)} is only allowed in root programmatic options, or babel.config.js/config file options`)}(u[n]||a[n]||o[n]||i[n]||d)(l,t[n])})),t}function d(e){const t=e.name;if(n.default[t]){const{message:r,version:i=5}=n.default[t];throw new Error(`Using removed Babel ${i} option: ${(0,s.msg)(e)} - ${r}`)}{const t=new Error(`Unknown option: ${(0,s.msg)(e)}. Check out https://babeljs.io/docs/en/babel-core/#options for more information about options.`);throw t.code="BABEL_UNKNOWN_OPTION",t}}function h(e,t){return Object.prototype.hasOwnProperty.call(e,t)}t.assumptionsNames=l},"../../node_modules/@babel/core/lib/config/validation/plugins.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.validatePluginObject=function(e){const t={type:"root",source:"plugin"};return Object.keys(e).forEach((r=>{const n=s[r];if(!n){const e=new Error(`.${r} is not a valid Plugin property`);throw e.code="BABEL_UNKNOWN_PLUGIN_PROPERTY",e}n({type:"option",name:r,parent:t},e[r])})),e};var n=r("../../node_modules/@babel/core/lib/config/validation/option-assertions.js");const s={name:n.assertString,manipulateOptions:n.assertFunction,pre:n.assertFunction,post:n.assertFunction,inherits:n.assertFunction,visitor:function(e,t){const r=(0,n.assertObject)(e,t);if(r&&(Object.keys(r).forEach((e=>function(e,t){if(t&&"object"==typeof t)Object.keys(t).forEach((t=>{if("enter"!==t&&"exit"!==t)throw new Error(`.visitor["${e}"] may only have .enter and/or .exit handlers.`)}));else if("function"!=typeof t)throw new Error(`.visitor["${e}"] must be a function`);return t}(e,r[e]))),r.enter||r.exit))throw new Error(`${(0,n.msg)(e)} cannot contain catch-all "enter" or "exit" handlers. Please target individual nodes.`);return r},parserOverride:n.assertFunction,generatorOverride:n.assertFunction}},"../../node_modules/@babel/core/lib/config/validation/removed.js":(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0,t.default={auxiliaryComment:{message:"Use `auxiliaryCommentBefore` or `auxiliaryCommentAfter`"},blacklist:{message:"Put the specific transforms you want in the `plugins` option"},breakConfig:{message:"This is not a necessary option in Babel 6"},experimental:{message:"Put the specific transforms you want in the `plugins` option"},externalHelpers:{message:"Use the `external-helpers` plugin instead. Check out http://babeljs.io/docs/plugins/external-helpers/"},extra:{message:""},jsxPragma:{message:"use the `pragma` option in the `react-jsx` plugin. Check out http://babeljs.io/docs/plugins/transform-react-jsx/"},loose:{message:"Specify the `loose` option for the relevant plugin you are using or use a preset that sets the option."},metadataUsedHelpers:{message:"Not required anymore as this is enabled by default"},modules:{message:"Use the corresponding module transform plugin in the `plugins` option. Check out http://babeljs.io/docs/plugins/#modules"},nonStandard:{message:"Use the `react-jsx` and `flow-strip-types` plugins to support JSX and Flow. Also check out the react preset http://babeljs.io/docs/plugins/preset-react/"},optional:{message:"Put the specific transforms you want in the `plugins` option"},sourceMapName:{message:"The `sourceMapName` option has been removed because it makes more sense for the tooling that calls Babel to assign `map.file` themselves."},stage:{message:"Check out the corresponding stage-x presets http://babeljs.io/docs/plugins/#presets"},whitelist:{message:"Put the specific transforms you want in the `plugins` option"},resolveModuleSource:{version:6,message:"Use `babel-plugin-module-resolver@3`'s 'resolvePath' options"},metadata:{version:6,message:"Generated plugin metadata is always included in the output result"},sourceMapTarget:{version:6,message:"The `sourceMapTarget` option has been removed because it makes more sense for the tooling that calls Babel to assign `map.file` themselves."}}},"../../node_modules/@babel/core/lib/gensync-utils/async.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/gensync/index.js");return n=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.forwardAsync=function(e,t){const r=n()(e);return a((e=>{const n=r[e];return t(n)}))},t.isAsync=void 0,t.isThenable=c,t.maybeAsync=function(e,t){return n()({sync(){for(var r=arguments.length,n=new Array(r),s=0;s<r;s++)n[s]=arguments[s];const i=e.apply(this,n);if(c(i))throw new Error(t);return i},async(){for(var t=arguments.length,r=new Array(t),n=0;n<t;n++)r[n]=arguments[n];return Promise.resolve(e.apply(this,r))}})},t.waitFor=t.onFirstPause=void 0;const s=e=>e,i=n()((function*(e){return yield*e})),o=n()({sync:()=>!1,errback:e=>e(null,!0)});t.isAsync=o;const a=n()({sync:e=>e("sync"),async:e=>e("async")}),u=n()({name:"onFirstPause",arity:2,sync:function(e){return i.sync(e)},errback:function(e,t,r){let n=!1;i.errback(e,((e,t)=>{n=!0,r(e,t)})),n||t()}});t.onFirstPause=u;const l=n()({sync:s,async:s});function c(e){return!(!e||"object"!=typeof e&&"function"!=typeof e||!e.then||"function"!=typeof e.then)}t.waitFor=l},"../../node_modules/@babel/core/lib/index.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.DEFAULT_EXTENSIONS=void 0,Object.defineProperty(t,"File",{enumerable:!0,get:function(){return n.default}}),t.OptionManager=void 0,t.Plugin=function(e){throw new Error(`The (${e}) Babel 5 plugin is being run with an unsupported Babel version.`)},Object.defineProperty(t,"buildExternalHelpers",{enumerable:!0,get:function(){return s.default}}),Object.defineProperty(t,"createConfigItem",{enumerable:!0,get:function(){return p.createConfigItem}}),Object.defineProperty(t,"createConfigItemAsync",{enumerable:!0,get:function(){return p.createConfigItemAsync}}),Object.defineProperty(t,"createConfigItemSync",{enumerable:!0,get:function(){return p.createConfigItemSync}}),Object.defineProperty(t,"getEnv",{enumerable:!0,get:function(){return o.getEnv}}),Object.defineProperty(t,"loadOptions",{enumerable:!0,get:function(){return p.loadOptions}}),Object.defineProperty(t,"loadOptionsAsync",{enumerable:!0,get:function(){return p.loadOptionsAsync}}),Object.defineProperty(t,"loadOptionsSync",{enumerable:!0,get:function(){return p.loadOptionsSync}}),Object.defineProperty(t,"loadPartialConfig",{enumerable:!0,get:function(){return p.loadPartialConfig}}),Object.defineProperty(t,"loadPartialConfigAsync",{enumerable:!0,get:function(){return p.loadPartialConfigAsync}}),Object.defineProperty(t,"loadPartialConfigSync",{enumerable:!0,get:function(){return p.loadPartialConfigSync}}),Object.defineProperty(t,"parse",{enumerable:!0,get:function(){return m.parse}}),Object.defineProperty(t,"parseAsync",{enumerable:!0,get:function(){return m.parseAsync}}),Object.defineProperty(t,"parseSync",{enumerable:!0,get:function(){return m.parseSync}}),Object.defineProperty(t,"resolvePlugin",{enumerable:!0,get:function(){return i.resolvePlugin}}),Object.defineProperty(t,"resolvePreset",{enumerable:!0,get:function(){return i.resolvePreset}}),Object.defineProperty(t,"template",{enumerable:!0,get:function(){return c().default}}),Object.defineProperty(t,"tokTypes",{enumerable:!0,get:function(){return u().tokTypes}}),Object.defineProperty(t,"transform",{enumerable:!0,get:function(){return d.transform}}),Object.defineProperty(t,"transformAsync",{enumerable:!0,get:function(){return d.transformAsync}}),Object.defineProperty(t,"transformFile",{enumerable:!0,get:function(){return h.transformFile}}),Object.defineProperty(t,"transformFileAsync",{enumerable:!0,get:function(){return h.transformFileAsync}}),Object.defineProperty(t,"transformFileSync",{enumerable:!0,get:function(){return h.transformFileSync}}),Object.defineProperty(t,"transformFromAst",{enumerable:!0,get:function(){return f.transformFromAst}}),Object.defineProperty(t,"transformFromAstAsync",{enumerable:!0,get:function(){return f.transformFromAstAsync}}),Object.defineProperty(t,"transformFromAstSync",{enumerable:!0,get:function(){return f.transformFromAstSync}}),Object.defineProperty(t,"transformSync",{enumerable:!0,get:function(){return d.transformSync}}),Object.defineProperty(t,"traverse",{enumerable:!0,get:function(){return l().default}}),t.version=t.types=void 0;var n=r("../../node_modules/@babel/core/lib/transformation/file/file.js"),s=r("../../node_modules/@babel/core/lib/tools/build-external-helpers.js"),i=r("../../node_modules/@babel/core/lib/config/files/index-browser.js"),o=r("../../node_modules/@babel/core/lib/config/helpers/environment.js");function a(){const e=r("../../node_modules/@babel/types/lib/index.js");return a=function(){return e},e}function u(){const e=r("../../node_modules/@babel/parser/lib/index.js");return u=function(){return e},e}function l(){const e=r("../../node_modules/@babel/traverse/lib/index.js");return l=function(){return e},e}function c(){const e=r("../../node_modules/@babel/template/lib/index.js");return c=function(){return e},e}Object.defineProperty(t,"types",{enumerable:!0,get:function(){return a()}});var p=r("../../node_modules/@babel/core/lib/config/index.js"),d=r("../../node_modules/@babel/core/lib/transform.js"),h=r("../../node_modules/@babel/core/lib/transform-file-browser.js"),f=r("../../node_modules/@babel/core/lib/transform-ast.js"),m=r("../../node_modules/@babel/core/lib/parse.js");t.version="7.16.12";const g=Object.freeze([".js",".jsx",".es6",".es",".mjs",".cjs"]);t.DEFAULT_EXTENSIONS=g,t.OptionManager=class{init(e){return(0,p.loadOptions)(e)}}},"../../node_modules/@babel/core/lib/parse.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/gensync/index.js");return n=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.parseSync=t.parseAsync=t.parse=void 0;var s=r("../../node_modules/@babel/core/lib/config/index.js"),i=r("../../node_modules/@babel/core/lib/parser/index.js"),o=r("../../node_modules/@babel/core/lib/transformation/normalize-opts.js");const a=n()((function*(e,t){const r=yield*(0,s.default)(t);return null===r?null:yield*(0,i.default)(r.passes,(0,o.default)(r),e)}));t.parse=function(e,t,r){if("function"==typeof t&&(r=t,t=void 0),void 0===r)return a.sync(e,t);a.errback(e,t,r)};const u=a.sync;t.parseSync=u;const l=a.async;t.parseAsync=l},"../../node_modules/@babel/core/lib/parser/index.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/@babel/parser/lib/index.js");return n=function(){return e},e}function s(){const e=r("../../node_modules/@babel/code-frame/lib/index.js");return s=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.default=function*(e,t,r){let{parserOpts:o,highlightCode:a=!0,filename:u="unknown"}=t;try{const t=[];for(const s of e)for(const e of s){const{parserOverride:s}=e;if(s){const e=s(r,o,n().parse);void 0!==e&&t.push(e)}}if(0===t.length)return(0,n().parse)(r,o);if(1===t.length){if(yield*[],"function"==typeof t[0].then)throw new Error("You appear to be using an async parser plugin, which your current version of Babel does not support. If you're using a published plugin, you may need to upgrade your @babel/core version.");return t[0]}throw new Error("More than one plugin attempted to override parsing.")}catch(e){"BABEL_PARSER_SOURCETYPE_MODULE_REQUIRED"===e.code&&(e.message+="\nConsider renaming the file to '.mjs', or setting sourceType:module or sourceType:unambiguous in your Babel config for this file.");const{loc:t,missingPlugin:n}=e;if(t){const o=(0,s().codeFrameColumns)(r,{start:{line:t.line,column:t.column+1}},{highlightCode:a});e.message=n?`${u}: `+(0,i.default)(n[0],t,o):`${u}: ${e.message}\n\n`+o,e.code="BABEL_PARSE_ERROR"}throw e}};var i=r("../../node_modules/@babel/core/lib/parser/util/missing-plugin-helper.js")},"../../node_modules/@babel/core/lib/parser/util/missing-plugin-helper.js":(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t,s){let i=`Support for the experimental syntax '${e}' isn't currently enabled (${t.line}:${t.column+1}):\n\n`+s;const o=r[e];if(o){const{syntax:e,transform:t}=o;if(e){const r=n(e);if(t){i+=`\n\nAdd ${n(t)} to the '${t.name.startsWith("@babel/plugin")?"plugins":"presets"}' section of your Babel config to enable transformation.\nIf you want to leave it as-is, add ${r} to the 'plugins' section to enable parsing.`}else i+=`\n\nAdd ${r} to the 'plugins' section of your Babel config to enable parsing.`}}return i};const r={asyncDoExpressions:{syntax:{name:"@babel/plugin-syntax-async-do-expressions",url:"https://git.io/JYer8"}},classProperties:{syntax:{name:"@babel/plugin-syntax-class-properties",url:"https://git.io/vb4yQ"},transform:{name:"@babel/plugin-proposal-class-properties",url:"https://git.io/vb4SL"}},classPrivateProperties:{syntax:{name:"@babel/plugin-syntax-class-properties",url:"https://git.io/vb4yQ"},transform:{name:"@babel/plugin-proposal-class-properties",url:"https://git.io/vb4SL"}},classPrivateMethods:{syntax:{name:"@babel/plugin-syntax-class-properties",url:"https://git.io/vb4yQ"},transform:{name:"@babel/plugin-proposal-private-methods",url:"https://git.io/JvpRG"}},classStaticBlock:{syntax:{name:"@babel/plugin-syntax-class-static-block",url:"https://git.io/JTLB6"},transform:{name:"@babel/plugin-proposal-class-static-block",url:"https://git.io/JTLBP"}},decimal:{syntax:{name:"@babel/plugin-syntax-decimal",url:"https://git.io/JfKOH"}},decorators:{syntax:{name:"@babel/plugin-syntax-decorators",url:"https://git.io/vb4y9"},transform:{name:"@babel/plugin-proposal-decorators",url:"https://git.io/vb4ST"}},doExpressions:{syntax:{name:"@babel/plugin-syntax-do-expressions",url:"https://git.io/vb4yh"},transform:{name:"@babel/plugin-proposal-do-expressions",url:"https://git.io/vb4S3"}},dynamicImport:{syntax:{name:"@babel/plugin-syntax-dynamic-import",url:"https://git.io/vb4Sv"}},exportDefaultFrom:{syntax:{name:"@babel/plugin-syntax-export-default-from",url:"https://git.io/vb4SO"},transform:{name:"@babel/plugin-proposal-export-default-from",url:"https://git.io/vb4yH"}},exportNamespaceFrom:{syntax:{name:"@babel/plugin-syntax-export-namespace-from",url:"https://git.io/vb4Sf"},transform:{name:"@babel/plugin-proposal-export-namespace-from",url:"https://git.io/vb4SG"}},flow:{syntax:{name:"@babel/plugin-syntax-flow",url:"https://git.io/vb4yb"},transform:{name:"@babel/preset-flow",url:"https://git.io/JfeDn"}},functionBind:{syntax:{name:"@babel/plugin-syntax-function-bind",url:"https://git.io/vb4y7"},transform:{name:"@babel/plugin-proposal-function-bind",url:"https://git.io/vb4St"}},functionSent:{syntax:{name:"@babel/plugin-syntax-function-sent",url:"https://git.io/vb4yN"},transform:{name:"@babel/plugin-proposal-function-sent",url:"https://git.io/vb4SZ"}},importMeta:{syntax:{name:"@babel/plugin-syntax-import-meta",url:"https://git.io/vbKK6"}},jsx:{syntax:{name:"@babel/plugin-syntax-jsx",url:"https://git.io/vb4yA"},transform:{name:"@babel/preset-react",url:"https://git.io/JfeDR"}},importAssertions:{syntax:{name:"@babel/plugin-syntax-import-assertions",url:"https://git.io/JUbkv"}},moduleStringNames:{syntax:{name:"@babel/plugin-syntax-module-string-names",url:"https://git.io/JTL8G"}},numericSeparator:{syntax:{name:"@babel/plugin-syntax-numeric-separator",url:"https://git.io/vb4Sq"},transform:{name:"@babel/plugin-proposal-numeric-separator",url:"https://git.io/vb4yS"}},optionalChaining:{syntax:{name:"@babel/plugin-syntax-optional-chaining",url:"https://git.io/vb4Sc"},transform:{name:"@babel/plugin-proposal-optional-chaining",url:"https://git.io/vb4Sk"}},pipelineOperator:{syntax:{name:"@babel/plugin-syntax-pipeline-operator",url:"https://git.io/vb4yj"},transform:{name:"@babel/plugin-proposal-pipeline-operator",url:"https://git.io/vb4SU"}},privateIn:{syntax:{name:"@babel/plugin-syntax-private-property-in-object",url:"https://git.io/JfK3q"},transform:{name:"@babel/plugin-proposal-private-property-in-object",url:"https://git.io/JfK3O"}},recordAndTuple:{syntax:{name:"@babel/plugin-syntax-record-and-tuple",url:"https://git.io/JvKp3"}},throwExpressions:{syntax:{name:"@babel/plugin-syntax-throw-expressions",url:"https://git.io/vb4SJ"},transform:{name:"@babel/plugin-proposal-throw-expressions",url:"https://git.io/vb4yF"}},typescript:{syntax:{name:"@babel/plugin-syntax-typescript",url:"https://git.io/vb4SC"},transform:{name:"@babel/preset-typescript",url:"https://git.io/JfeDz"}},asyncGenerators:{syntax:{name:"@babel/plugin-syntax-async-generators",url:"https://git.io/vb4SY"},transform:{name:"@babel/plugin-proposal-async-generator-functions",url:"https://git.io/vb4yp"}},logicalAssignment:{syntax:{name:"@babel/plugin-syntax-logical-assignment-operators",url:"https://git.io/vAlBp"},transform:{name:"@babel/plugin-proposal-logical-assignment-operators",url:"https://git.io/vAlRe"}},nullishCoalescingOperator:{syntax:{name:"@babel/plugin-syntax-nullish-coalescing-operator",url:"https://git.io/vb4yx"},transform:{name:"@babel/plugin-proposal-nullish-coalescing-operator",url:"https://git.io/vb4Se"}},objectRestSpread:{syntax:{name:"@babel/plugin-syntax-object-rest-spread",url:"https://git.io/vb4y5"},transform:{name:"@babel/plugin-proposal-object-rest-spread",url:"https://git.io/vb4Ss"}},optionalCatchBinding:{syntax:{name:"@babel/plugin-syntax-optional-catch-binding",url:"https://git.io/vb4Sn"},transform:{name:"@babel/plugin-proposal-optional-catch-binding",url:"https://git.io/vb4SI"}}};r.privateIn.syntax=r.privateIn.transform;const n=e=>{let{name:t,url:r}=e;return`${t} (${r})`}},"../../node_modules/@babel/core/lib/tools/build-external-helpers.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/@babel/helpers/lib/index.js");return n=function(){return e},e}function s(){const e=r("../../node_modules/@babel/generator/lib/index.js");return s=function(){return e},e}function i(){const e=r("../../node_modules/@babel/template/lib/index.js");return i=function(){return e},e}function o(){const e=r("../../node_modules/@babel/types/lib/index.js");return o=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){let t,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"global";const n={global:_,module:k,umd:F,var:T}[r];if(!n)throw new Error(`Unsupported output type ${r}`);return t=n(e),(0,s().default)(t).code};var a=r("../../node_modules/@babel/core/lib/transformation/file/file.js");const{arrayExpression:u,assignmentExpression:l,binaryExpression:c,blockStatement:p,callExpression:d,cloneNode:h,conditionalExpression:f,exportNamedDeclaration:m,exportSpecifier:g,expressionStatement:y,functionExpression:D,identifier:b,memberExpression:v,objectExpression:E,program:x,stringLiteral:C,unaryExpression:A,variableDeclaration:w,variableDeclarator:S}=o();function _(e){const t=b("babelHelpers"),r=[],n=D(null,[b("global")],p(r)),s=x([y(d(n,[f(c("===",A("typeof",b("global")),C("undefined")),b("self"),b("global"))]))]);return r.push(w("var",[S(t,l("=",v(b("global"),t),E([])))])),P(r,t,e),s}function k(e){const t=[],r=P(t,null,e);return t.unshift(m(null,Object.keys(r).map((e=>g(h(r[e]),b(e)))))),x(t,[],"module")}function F(e){const t=b("babelHelpers"),r=[];return r.push(w("var",[S(t,b("global"))])),P(r,t,e),x([(n={FACTORY_PARAMETERS:b("global"),BROWSER_ARGUMENTS:l("=",v(b("root"),t),E([])),COMMON_ARGUMENTS:b("exports"),AMD_ARGUMENTS:u([C("exports")]),FACTORY_BODY:r,UMD_ROOT:b("this")},i().default.statement`
    (function (root, factory) {
      if (typeof define === "function" && define.amd) {
        define(AMD_ARGUMENTS, factory);
      } else if (typeof exports === "object") {
        factory(COMMON_ARGUMENTS);
      } else {
        factory(BROWSER_ARGUMENTS);
      }
    })(UMD_ROOT, function (FACTORY_PARAMETERS) {
      FACTORY_BODY
    });
  `(n))]);var n}function T(e){const t=b("babelHelpers"),r=[];r.push(w("var",[S(t,E([]))]));const n=x(r);return P(r,t,e),r.push(y(t)),n}function P(e,t,r){const s=e=>t?v(t,b(e)):b(`_${e}`),i={};return n().list.forEach((function(t){if(r&&r.indexOf(t)<0)return;const o=i[t]=s(t);n().ensure(t,a.default);const{nodes:u}=n().get(t,s,o);e.push(...u)})),i}},"../../node_modules/@babel/core/lib/transform-ast.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/gensync/index.js");return n=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.transformFromAstSync=t.transformFromAstAsync=t.transformFromAst=void 0;var s=r("../../node_modules/@babel/core/lib/config/index.js"),i=r("../../node_modules/@babel/core/lib/transformation/index.js");const o=n()((function*(e,t,r){const n=yield*(0,s.default)(r);if(null===n)return null;if(!e)throw new Error("No AST given");return yield*(0,i.run)(n,t,e)}));t.transformFromAst=function(e,t,r,n){if("function"==typeof r&&(n=r,r=void 0),void 0===n)return o.sync(e,t,r);o.errback(e,t,r,n)};const a=o.sync;t.transformFromAstSync=a;const u=o.async;t.transformFromAstAsync=u},"../../node_modules/@babel/core/lib/transform-file-browser.js":(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.transformFile=void 0,t.transformFileAsync=function(){return Promise.reject(new Error("Transforming files is not supported in browsers"))},t.transformFileSync=function(){throw new Error("Transforming files is not supported in browsers")},t.transformFile=function(e,t,r){"function"==typeof t&&(r=t),r(new Error("Transforming files is not supported in browsers"),null)}},"../../node_modules/@babel/core/lib/transform.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/gensync/index.js");return n=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.transformSync=t.transformAsync=t.transform=void 0;var s=r("../../node_modules/@babel/core/lib/config/index.js"),i=r("../../node_modules/@babel/core/lib/transformation/index.js");const o=n()((function*(e,t){const r=yield*(0,s.default)(t);return null===r?null:yield*(0,i.run)(r,e)}));t.transform=function(e,t,r){if("function"==typeof t&&(r=t,t=void 0),void 0===r)return o.sync(e,t);o.errback(e,t,r)};const a=o.sync;t.transformSync=a;const u=o.async;t.transformAsync=u},"../../node_modules/@babel/core/lib/transformation/block-hoist-plugin.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/@babel/traverse/lib/index.js");return n=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(){return i||(i=new s.default(Object.assign({},a,{visitor:n().default.explode(a.visitor)}),{})),i};var s=r("../../node_modules/@babel/core/lib/config/plugin.js");let i;function o(e){const t=null==e?void 0:e._blockHoist;return null==t?1:!0===t?2:t}const a={name:"internal.blockHoist",visitor:{Block:{exit(e){let{node:t}=e;const{body:r}=t;let n=Math.pow(2,30)-1,s=!1;for(let e=0;e<r.length;e++){const t=o(r[e]);if(t>n){s=!0;break}n=t}s&&(t.body=function(e){const t=Object.create(null);for(let r=0;r<e.length;r++){const n=e[r],s=o(n);(t[s]||(t[s]=[])).push(n)}const r=Object.keys(t).map((e=>+e)).sort(((e,t)=>t-e));let n=0;for(const s of r){const r=t[s];for(const t of r)e[n++]=t}return e}(r.slice()))}}}}},"../../node_modules/@babel/core/lib/transformation/file/file.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/@babel/helpers/lib/index.js");return n=function(){return e},e}function s(){const e=r("../../node_modules/@babel/traverse/lib/index.js");return s=function(){return e},e}function i(){const e=r("../../node_modules/@babel/code-frame/lib/index.js");return i=function(){return e},e}function o(){const e=r("../../node_modules/@babel/types/lib/index.js");return o=function(){return e},e}function a(){const e=r("../../node_modules/@babel/helper-module-transforms/lib/index.js");return a=function(){return e},e}function u(){const e=r("../../node_modules/semver/semver.js");return u=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;const{cloneNode:l,interpreterDirective:c}=o(),p={enter(e,t){const r=e.node.loc;r&&(t.loc=r,e.stop())}};class d{constructor(e,t){let{code:r,ast:n,inputMap:i}=t;this._map=new Map,this.opts=void 0,this.declarations={},this.path=null,this.ast={},this.scope=void 0,this.metadata={},this.code="",this.inputMap=null,this.hub={file:this,getCode:()=>this.code,getScope:()=>this.scope,addHelper:this.addHelper.bind(this),buildError:this.buildCodeFrameError.bind(this)},this.opts=e,this.code=r,this.ast=n,this.inputMap=i,this.path=s().NodePath.get({hub:this.hub,parentPath:null,parent:this.ast,container:this.ast,key:"program"}).setContext(),this.scope=this.path.scope}get shebang(){const{interpreter:e}=this.path.node;return e?e.value:""}set shebang(e){e?this.path.get("interpreter").replaceWith(c(e)):this.path.get("interpreter").remove()}set(e,t){if("helpersNamespace"===e)throw new Error("Babel 7.0.0-beta.56 has dropped support for the 'helpersNamespace' utility.If you are using @babel/plugin-external-helpers you will need to use a newer version than the one you currently have installed. If you have your own implementation, you'll want to explore using 'helperGenerator' alongside 'file.availableHelper()'.");this._map.set(e,t)}get(e){return this._map.get(e)}has(e){return this._map.has(e)}getModuleName(){return(0,a().getModuleName)(this.opts,this.opts)}addImport(){throw new Error("This API has been removed. If you're looking for this functionality in Babel 7, you should import the '@babel/helper-module-imports' module and use the functions exposed  from that module, such as 'addNamed' or 'addDefault'.")}availableHelper(e,t){let r;try{r=n().minVersion(e)}catch(e){if("BABEL_HELPER_UNKNOWN"!==e.code)throw e;return!1}return"string"!=typeof t||(u().valid(t)&&(t=`^${t}`),!u().intersects(`<${r}`,t)&&!u().intersects(">=8.0.0",t))}addHelper(e){const t=this.declarations[e];if(t)return l(t);const r=this.get("helperGenerator");if(r){const t=r(e);if(t)return t}n().ensure(e,d);const s=this.declarations[e]=this.scope.generateUidIdentifier(e),i={};for(const t of n().getDependencies(e))i[t]=this.addHelper(t);const{nodes:o,globals:a}=n().get(e,(e=>i[e]),s,Object.keys(this.scope.getAllBindings()));return a.forEach((e=>{this.path.scope.hasBinding(e,!0)&&this.path.scope.rename(e)})),o.forEach((e=>{e._compact=!0})),this.path.unshiftContainer("body",o),this.path.get("body").forEach((e=>{-1!==o.indexOf(e.node)&&e.isVariableDeclaration()&&this.scope.registerDeclaration(e)})),s}addTemplateObject(){throw new Error("This function has been moved into the template literal transform itself.")}buildCodeFrameError(e,t){let r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:SyntaxError,n=e&&(e.loc||e._loc);if(!n&&e){const r={loc:null};(0,s().default)(e,p,this.scope,r),n=r.loc;let i="This is an error on an internal node. Probably an internal error.";n&&(i+=" Location has been estimated."),t+=` (${i})`}if(n){const{highlightCode:e=!0}=this.opts;t+="\n"+(0,i().codeFrameColumns)(this.code,{start:{line:n.start.line,column:n.start.column+1},end:n.end&&n.start.line===n.end.line?{line:n.end.line,column:n.end.column+1}:void 0},{highlightCode:e})}return new r(t)}}t.default=d},"../../node_modules/@babel/core/lib/transformation/file/generate.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/convert-source-map/index.js");return n=function(){return e},e}function s(){const e=r("../../node_modules/@babel/generator/lib/index.js");return s=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t){const{opts:r,ast:o,code:a,inputMap:u}=t,l=[];for(const t of e)for(const e of t){const{generatorOverride:t}=e;if(t){const e=t(o,r.generatorOpts,a,s().default);void 0!==e&&l.push(e)}}let c;if(0===l.length)c=(0,s().default)(o,r.generatorOpts,a);else{if(1!==l.length)throw new Error("More than one plugin attempted to override codegen.");if(c=l[0],"function"==typeof c.then)throw new Error("You appear to be using an async codegen plugin, which your current version of Babel does not support. If you're using a published plugin, you may need to upgrade your @babel/core version.")}let{code:p,map:d}=c;return d&&u&&(d=(0,i.default)(u.toObject(),d)),"inline"!==r.sourceMaps&&"both"!==r.sourceMaps||(p+="\n"+n().fromObject(d).toComment()),"inline"===r.sourceMaps&&(d=null),{outputCode:p,outputMap:d}};var i=r("../../node_modules/@babel/core/lib/transformation/file/merge-map.js")},"../../node_modules/@babel/core/lib/transformation/file/merge-map.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/source-map/source-map.js");return n=function(){return e},e}function s(e){return`${e.line}/${e.columnStart}`}function i(e){const t=new(n().SourceMapConsumer)(Object.assign({},e,{sourceRoot:null})),r=new Map,s=new Map;let i=null;return t.computeColumnSpans(),t.eachMapping((e=>{if(null===e.originalLine)return;let n=r.get(e.source);n||(n={path:e.source,content:t.sourceContentFor(e.source,!0)},r.set(e.source,n));let o=s.get(n);o||(o={source:n,mappings:[]},s.set(n,o));const a={line:e.originalLine,columnStart:e.originalColumn,columnEnd:1/0,name:e.name};i&&i.source===n&&i.mapping.line===e.originalLine&&(i.mapping.columnEnd=e.originalColumn),i={source:n,mapping:a},o.mappings.push({original:a,generated:t.allGeneratedPositionsFor({source:e.source,line:e.originalLine,column:e.originalColumn}).map((e=>({line:e.line,columnStart:e.column,columnEnd:e.lastColumn+1})))})}),null,n().SourceMapConsumer.ORIGINAL_ORDER),{file:e.file,sourceRoot:e.sourceRoot,sources:Array.from(s.values())}}Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t){const r=i(e),o=i(t),a=new(n().SourceMapGenerator);for(const{source:e}of r.sources)"string"==typeof e.content&&a.setSourceContent(e.path,e.content);if(1===o.sources.length){const e=o.sources[0],t=new Map;!function(e,t){for(const{source:r,mappings:n}of e.sources)for(const{original:e,generated:s}of n)for(const n of s)t(n,e,r)}(r,((r,n,i)=>{!function(e,t,r){const n=function(e,t){let{mappings:r}=e,{line:n,columnStart:s,columnEnd:i}=t;return function(e,t){const r=function(e,t){let r=0,n=e.length;for(;r<n;){const s=Math.floor((r+n)/2),i=t(e[s]);if(0===i){r=s;break}i>=0?n=s:r=s+1}let s=r;if(s<e.length){for(;s>=0&&t(e[s])>=0;)s--;return s+1}return s}(e,t),n=[];for(let s=r;s<e.length&&0===t(e[s]);s++)n.push(e[s]);return n}(r,(e=>{let{original:t}=e;return n>t.line?-1:n<t.line?1:s>=t.columnEnd?-1:i<=t.columnStart?1:0}))}(e,t);for(const{generated:e}of n)for(const t of e)r(t)}(e,r,(e=>{const r=s(e);t.has(r)||(t.set(r,e),a.addMapping({source:i.path,original:{line:n.line,column:n.columnStart},generated:{line:e.line,column:e.columnStart},name:n.name}))}))}));for(const e of t.values()){if(e.columnEnd===1/0)continue;const r={line:e.line,columnStart:e.columnEnd},n=s(r);t.has(n)||a.addMapping({generated:{line:r.line,column:r.columnStart}})}}const u=a.toJSON();return"string"==typeof r.sourceRoot&&(u.sourceRoot=r.sourceRoot),u}},"../../node_modules/@babel/core/lib/transformation/index.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/@babel/traverse/lib/index.js");return n=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.run=function*(e,t,r){const c=yield*(0,a.default)(e.passes,(0,o.default)(e),t,r),p=c.opts;try{yield*function*(e,t){for(const r of t){const t=[],o=[],a=[];for(const n of r.concat([(0,i.default)()])){const r=new s.default(e,n.key,n.options);t.push([n,r]),o.push(r),a.push(n.visitor)}for(const[r,n]of t){const t=r.pre;if(t){const r=t.call(n,e);if(yield*[],l(r))throw new Error("You appear to be using an plugin with an async .pre, which your current version of Babel does not support. If you're using a published plugin, you may need to upgrade your @babel/core version.")}}const u=n().default.visitors.merge(a,o,e.opts.wrapPluginVisitorMethod);(0,n().default)(e.ast,u,e.scope);for(const[r,n]of t){const t=r.post;if(t){const r=t.call(n,e);if(yield*[],l(r))throw new Error("You appear to be using an plugin with an async .post, which your current version of Babel does not support. If you're using a published plugin, you may need to upgrade your @babel/core version.")}}}}(c,e.passes)}catch(e){var d;throw e.message=`${null!=(d=p.filename)?d:"unknown"}: ${e.message}`,e.code||(e.code="BABEL_TRANSFORM_ERROR"),e}let h,f;try{!1!==p.code&&({outputCode:h,outputMap:f}=(0,u.default)(e.passes,c))}catch(e){var m;throw e.message=`${null!=(m=p.filename)?m:"unknown"}: ${e.message}`,e.code||(e.code="BABEL_GENERATE_ERROR"),e}return{metadata:c.metadata,options:p,ast:!0===p.ast?c.ast:null,code:void 0===h?null:h,map:void 0===f?null:f,sourceType:c.ast.program.sourceType}};var s=r("../../node_modules/@babel/core/lib/transformation/plugin-pass.js"),i=r("../../node_modules/@babel/core/lib/transformation/block-hoist-plugin.js"),o=r("../../node_modules/@babel/core/lib/transformation/normalize-opts.js"),a=r("../../node_modules/@babel/core/lib/transformation/normalize-file.js"),u=r("../../node_modules/@babel/core/lib/transformation/file/generate.js");function l(e){return!(!e||"object"!=typeof e&&"function"!=typeof e||!e.then||"function"!=typeof e.then)}},"../../node_modules/@babel/core/lib/transformation/normalize-file.js":(e,t,r)=>{"use strict";function n(){const e=r("../../browser-shims/fs.js");return n=function(){return e},e}function s(){const e=r("../../node_modules/path-browserify/index.js");return s=function(){return e},e}function i(){const e=r("../../node_modules/debug/src/browser.js");return i=function(){return e},e}function o(){const e=r("../../node_modules/@babel/types/lib/index.js");return o=function(){return e},e}function a(){const e=r("../../node_modules/convert-source-map/index.js");return a=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.default=function*(e,t,r,i){if(r=`${r||""}`,i){if("Program"===i.type)i=p(i,[],[]);else if("File"!==i.type)throw new Error("AST root must be a Program or File node");t.cloneInputAst&&(i=(0,c.default)(i))}else i=yield*(0,l.default)(e,t,r);let o=null;if(!1!==t.inputSourceMap){if("object"==typeof t.inputSourceMap&&(o=a().fromObject(t.inputSourceMap)),!o){const e=y(f,i);if(e)try{o=a().fromComment(e)}catch(e){h("discarding unknown inline input sourcemap",e)}}if(!o){const e=y(m,i);if("string"==typeof t.filename&&e)try{const r=m.exec(e),i=n().readFileSync(s().resolve(s().dirname(t.filename),r[1]));i.length>1e6?h("skip merging input map > 1 MB"):o=a().fromJSON(i)}catch(e){h("discarding unknown file input sourcemap",e)}else e&&h("discarding un-loadable file input sourcemap")}}return new u.default(t,{code:r,ast:i,inputMap:o})};var u=r("../../node_modules/@babel/core/lib/transformation/file/file.js"),l=r("../../node_modules/@babel/core/lib/parser/index.js"),c=r("../../node_modules/@babel/core/lib/transformation/util/clone-deep-browser.js");const{file:p,traverseFast:d}=o(),h=i()("babel:transform:file"),f=/^[@#]\s+sourceMappingURL=data:(?:application|text)\/json;(?:charset[:=]\S+?;)?base64,(?:.*)$/,m=/^[@#][ \t]+sourceMappingURL=([^\s'"`]+)[ \t]*$/;function g(e,t,r){return t&&(t=t.filter((t=>{let{value:n}=t;return!e.test(n)||(r=n,!1)}))),[t,r]}function y(e,t){let r=null;return d(t,(t=>{[t.leadingComments,r]=g(e,t.leadingComments,r),[t.innerComments,r]=g(e,t.innerComments,r),[t.trailingComments,r]=g(e,t.trailingComments,r)})),r}},"../../node_modules/@babel/core/lib/transformation/normalize-opts.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/path-browserify/index.js");return n=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){const{filename:t,cwd:r,filenameRelative:s=("string"==typeof t?n().relative(r,t):"unknown"),sourceType:i="module",inputSourceMap:o,sourceMaps:a=!!o,sourceRoot:u=e.options.moduleRoot,sourceFileName:l=n().basename(s),comments:c=!0,compact:p="auto"}=e.options,d=e.options,h=Object.assign({},d,{parserOpts:Object.assign({sourceType:".mjs"===n().extname(s)?"module":i,sourceFileName:t,plugins:[]},d.parserOpts),generatorOpts:Object.assign({filename:t,auxiliaryCommentBefore:d.auxiliaryCommentBefore,auxiliaryCommentAfter:d.auxiliaryCommentAfter,retainLines:d.retainLines,comments:c,shouldPrintComment:d.shouldPrintComment,compact:p,minified:d.minified,sourceMaps:a,sourceRoot:u,sourceFileName:l},d.generatorOpts)});for(const t of e.passes)for(const e of t)e.manipulateOptions&&e.manipulateOptions(h,h.parserOpts);return h}},"../../node_modules/@babel/core/lib/transformation/plugin-pass.js":(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;class r{constructor(e,t,r){this._map=new Map,this.key=void 0,this.file=void 0,this.opts=void 0,this.cwd=void 0,this.filename=void 0,this.key=t,this.file=e,this.opts=r||{},this.cwd=e.opts.cwd,this.filename=e.opts.filename}set(e,t){this._map.set(e,t)}get(e){return this._map.get(e)}availableHelper(e,t){return this.file.availableHelper(e,t)}addHelper(e){return this.file.addHelper(e)}addImport(){return this.file.addImport()}buildCodeFrameError(e,t,r){return this.file.buildCodeFrameError(e,t,r)}}t.default=r,r.prototype.getModuleName=function(){return this.file.getModuleName()}},"../../node_modules/@babel/core/lib/transformation/util/clone-deep-browser.js":(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){return JSON.parse(JSON.stringify(e,n),s)};const r="$$ babel internal serialized type"+Math.random();function n(e,t){return"bigint"!=typeof t?t:{[r]:"BigInt",value:t.toString()}}function s(e,t){return t&&"object"==typeof t?"BigInt"!==t[r]?t:BigInt(t.value):t}},"../../node_modules/@babel/helper-compilation-targets/lib/debug.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.getInclusionReasons=function(e,t,r){const o=r[e]||{};return Object.keys(t).reduce(((e,r)=>{const a=(0,i.getLowestImplementedVersion)(o,r),u=t[r];if(a){const t=(0,i.isUnreleasedVersion)(a,r);(0,i.isUnreleasedVersion)(u,r)||!t&&!n.lt(u.toString(),(0,i.semverify)(a))||(e[r]=(0,s.prettifyVersion)(u))}else e[r]=(0,s.prettifyVersion)(u);return e}),{})};var n=r("../../node_modules/semver/semver.js"),s=r("../../node_modules/@babel/helper-compilation-targets/lib/pretty.js"),i=r("../../node_modules/@babel/helper-compilation-targets/lib/utils.js")},"../../node_modules/@babel/helper-compilation-targets/lib/filter-items.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t,r,n,s,i,o){const u=new Set,l={compatData:e,includes:t,excludes:r};for(const t in e)if(a(t,n,l))u.add(t);else if(o){const e=o.get(t);e&&u.add(e)}return s&&s.forEach((e=>!r.has(e)&&u.add(e))),i&&i.forEach((e=>!t.has(e)&&u.delete(e))),u},t.isRequired=a,t.targetsSupported=o;var n=r("../../node_modules/semver/semver.js"),s=r("../../node_modules/@babel/compat-data/plugins.js"),i=r("../../node_modules/@babel/helper-compilation-targets/lib/utils.js");function o(e,t){const r=Object.keys(e);return 0!==r.length&&0===r.filter((r=>{const s=(0,i.getLowestImplementedVersion)(t,r);if(!s)return!0;const o=e[r];if((0,i.isUnreleasedVersion)(o,r))return!1;if((0,i.isUnreleasedVersion)(s,r))return!0;if(!n.valid(o.toString()))throw new Error(`Invalid version passed for target "${r}": "${o}". Versions must be in semver format (major.minor.patch)`);return n.gt((0,i.semverify)(s),o.toString())})).length}function a(e,t){let{compatData:r=s,includes:n,excludes:i}=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return!(null!=i&&i.has(e)||(null==n||!n.has(e))&&o(t,r[e]))}},"../../node_modules/@babel/helper-compilation-targets/lib/index.js":(e,t,r)=>{"use strict";var n=r("../../browser-shims/process.js");Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"TargetNames",{enumerable:!0,get:function(){return l.TargetNames}}),t.default=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};var r;let{browsers:n,esmodules:i}=e;const{configPath:o="."}=t;y(n);const u=E(e);let l=m(u);const c=!!n,p=c||Object.keys(l).length>0,d=!t.ignoreBrowserslistConfig&&!p;if(!n&&d&&(n=s.loadConfig({config:t.configFile,path:o,env:t.browserslistEnv}),null==n&&(n=[])),!i||"intersect"===i&&null!=(r=n)&&r.length||(n=Object.keys(h).map((e=>`${e} >= ${h[e]}`)).join(", "),i=!1),n){const e=x(n,t.browserslistEnv);if("intersect"===i)for(const t of Object.keys(e)){const r=e[t];h[t]?e[t]=(0,a.getHighestUnreleased)(r,(0,a.semverify)(h[t]),t):delete e[t]}l=Object.assign(e,l)}const f={},g=[];for(const e of Object.keys(l).sort()){var b;const t=l[e];"number"==typeof t&&t%1!=0&&g.push({target:e,value:t});const r=null!=(b=v[e])?b:v.__default,[n,s]=r(e,t);s&&(f[n]=s)}return D(g),f},Object.defineProperty(t,"filterItems",{enumerable:!0,get:function(){return d.default}}),Object.defineProperty(t,"getInclusionReasons",{enumerable:!0,get:function(){return p.getInclusionReasons}}),t.isBrowsersQueryValid=g,Object.defineProperty(t,"isRequired",{enumerable:!0,get:function(){return d.isRequired}}),Object.defineProperty(t,"prettifyTargets",{enumerable:!0,get:function(){return c.prettifyTargets}}),Object.defineProperty(t,"unreleasedLabels",{enumerable:!0,get:function(){return u.unreleasedLabels}});var s=r("../../node_modules/browserslist/index.js"),i=r("../../node_modules/@babel/helper-validator-option/lib/index.js"),o=r("../../node_modules/@babel/compat-data/native-modules.js"),a=r("../../node_modules/@babel/helper-compilation-targets/lib/utils.js"),u=r("../../node_modules/@babel/helper-compilation-targets/lib/targets.js"),l=r("../../node_modules/@babel/helper-compilation-targets/lib/options.js"),c=r("../../node_modules/@babel/helper-compilation-targets/lib/pretty.js"),p=r("../../node_modules/@babel/helper-compilation-targets/lib/debug.js"),d=r("../../node_modules/@babel/helper-compilation-targets/lib/filter-items.js");const h=o["es6.module"],f=new i.OptionValidator("@babel/helper-compilation-targets");function m(e){const t=Object.keys(l.TargetNames);for(const r of Object.keys(e))if(!(r in l.TargetNames))throw new Error(f.formatMessage(`'${r}' is not a valid target\n- Did you mean '${(0,i.findSuggestion)(r,t)}'?`));return e}function g(e){return"string"==typeof e||Array.isArray(e)&&e.every((e=>"string"==typeof e))}function y(e){return f.invariant(void 0===e||g(e),`'${String(e)}' is not a valid browserslist query`),e}function D(e){e.length&&(console.warn("Warning, the following targets are using a decimal version:\n"),e.forEach((e=>{let{target:t,value:r}=e;return console.warn(`  ${t}: ${r}`)})),console.warn("\nWe recommend using a string for minor/patch versions to avoid numbers like 6.10\ngetting parsed as 6.1, which can lead to unexpected behavior.\n"))}function b(e,t){try{return(0,a.semverify)(t)}catch(r){throw new Error(f.formatMessage(`'${t}' is not a valid value for 'targets.${e}'.`))}}const v={__default:(e,t)=>[e,(0,a.isUnreleasedVersion)(t,e)?t.toLowerCase():b(e,t)],node:(e,t)=>[e,!0===t||"current"===t?n.versions.node:b(e,t)]};function E(e){const t=Object.assign({},e);return delete t.esmodules,delete t.browsers,t}function x(e,t){return s(e,{mobileToDesktop:!0,env:t}).reduce(((e,t)=>{const[r,n]=t.split(" "),s=u.browserNameMap[r];if(!s)return e;try{const t=n.split("-")[0].toLowerCase(),i=(0,a.isUnreleasedVersion)(t,r);if(!e[s])return e[s]=i?t:(0,a.semverify)(t),e;const o=e[s],u=(0,a.isUnreleasedVersion)(o,r);if(u&&i)e[s]=(0,a.getLowestUnreleased)(o,t,r);else if(u)e[s]=(0,a.semverify)(t);else if(!u&&!i){const r=(0,a.semverify)(t);e[s]=(0,a.semverMin)(o,r)}}catch(e){}return e}),{})}},"../../node_modules/@babel/helper-compilation-targets/lib/options.js":(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.TargetNames=void 0,t.TargetNames={node:"node",chrome:"chrome",opera:"opera",edge:"edge",firefox:"firefox",safari:"safari",ie:"ie",ios:"ios",android:"android",electron:"electron",samsung:"samsung",rhino:"rhino"}},"../../node_modules/@babel/helper-compilation-targets/lib/pretty.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.prettifyTargets=function(e){return Object.keys(e).reduce(((t,r)=>{let n=e[r];const o=s.unreleasedLabels[r];return"string"==typeof n&&o!==n&&(n=i(n)),t[r]=n,t}),{})},t.prettifyVersion=i;var n=r("../../node_modules/semver/semver.js"),s=r("../../node_modules/@babel/helper-compilation-targets/lib/targets.js");function i(e){if("string"!=typeof e)return e;const t=[n.major(e)],r=n.minor(e),s=n.patch(e);return(r||s)&&t.push(r),s&&t.push(s),t.join(".")}},"../../node_modules/@babel/helper-compilation-targets/lib/targets.js":(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.unreleasedLabels=t.browserNameMap=void 0,t.unreleasedLabels={safari:"tp"},t.browserNameMap={and_chr:"chrome",and_ff:"firefox",android:"android",chrome:"chrome",edge:"edge",firefox:"firefox",ie:"ie",ie_mob:"ie",ios_saf:"ios",node:"node",op_mob:"opera",opera:"opera",safari:"safari",samsung:"samsung"}},"../../node_modules/@babel/helper-compilation-targets/lib/utils.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.getHighestUnreleased=function(e,t,r){return l(e,t,r)===e?t:e},t.getLowestImplementedVersion=function(e,t){const r=e[t];return r||"android"!==t?r:e.chrome},t.getLowestUnreleased=l,t.isUnreleasedVersion=function(e,t){const r=i.unreleasedLabels[t];return!!r&&r===e.toString().toLowerCase()},t.semverMin=u,t.semverify=function(e){if("string"==typeof e&&n.valid(e))return e;a.invariant("number"==typeof e||"string"==typeof e&&o.test(e),`'${e}' is not a valid version`);const t=e.toString().split(".");for(;t.length<3;)t.push("0");return t.join(".")};var n=r("../../node_modules/semver/semver.js"),s=r("../../node_modules/@babel/helper-validator-option/lib/index.js"),i=r("../../node_modules/@babel/helper-compilation-targets/lib/targets.js");const o=/^(\d+|\d+.\d+)$/,a=new s.OptionValidator("@babel/helper-compilation-targets");function u(e,t){return e&&n.lt(e,t)?e:t}function l(e,t,r){const n=i.unreleasedLabels[r],s=[e,t].some((e=>e===n));return s?e===s?t:e||t:u(e,t)}},"../../node_modules/@babel/helper-module-imports/lib/import-builder.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n=r("../../node_modules/assert/build/assert.js"),s=r("../../node_modules/@babel/types/lib/index.js");const{callExpression:i,cloneNode:o,expressionStatement:a,identifier:u,importDeclaration:l,importDefaultSpecifier:c,importNamespaceSpecifier:p,importSpecifier:d,memberExpression:h,stringLiteral:f,variableDeclaration:m,variableDeclarator:g}=s;t.default=class{constructor(e,t,r){this._statements=[],this._resultName=null,this._scope=null,this._hub=null,this._importedSource=void 0,this._scope=t,this._hub=r,this._importedSource=e}done(){return{statements:this._statements,resultName:this._resultName}}import(){return this._statements.push(l([],f(this._importedSource))),this}require(){return this._statements.push(a(i(u("require"),[f(this._importedSource)]))),this}namespace(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"namespace";const t=this._scope.generateUidIdentifier(e),r=this._statements[this._statements.length-1];return n("ImportDeclaration"===r.type),n(0===r.specifiers.length),r.specifiers=[p(t)],this._resultName=o(t),this}default(e){e=this._scope.generateUidIdentifier(e);const t=this._statements[this._statements.length-1];return n("ImportDeclaration"===t.type),n(0===t.specifiers.length),t.specifiers=[c(e)],this._resultName=o(e),this}named(e,t){if("default"===t)return this.default(e);e=this._scope.generateUidIdentifier(e);const r=this._statements[this._statements.length-1];return n("ImportDeclaration"===r.type),n(0===r.specifiers.length),r.specifiers=[d(e,u(t))],this._resultName=o(e),this}var(e){e=this._scope.generateUidIdentifier(e);let t=this._statements[this._statements.length-1];return"ExpressionStatement"!==t.type&&(n(this._resultName),t=a(this._resultName),this._statements.push(t)),this._statements[this._statements.length-1]=m("var",[g(e,t.expression)]),this._resultName=o(e),this}defaultInterop(){return this._interop(this._hub.addHelper("interopRequireDefault"))}wildcardInterop(){return this._interop(this._hub.addHelper("interopRequireWildcard"))}_interop(e){const t=this._statements[this._statements.length-1];return"ExpressionStatement"===t.type?t.expression=i(e,[t.expression]):"VariableDeclaration"===t.type?(n(1===t.declarations.length),t.declarations[0].init=i(e,[t.declarations[0].init])):n.fail("Unexpected type."),this}prop(e){const t=this._statements[this._statements.length-1];return"ExpressionStatement"===t.type?t.expression=h(t.expression,u(e)):"VariableDeclaration"===t.type?(n(1===t.declarations.length),t.declarations[0].init=h(t.declarations[0].init,u(e))):n.fail("Unexpected type:"+t.type),this}read(e){this._resultName=h(this._resultName,u(e))}}},"../../node_modules/@babel/helper-module-imports/lib/import-injector.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n=r("../../node_modules/assert/build/assert.js"),s=r("../../node_modules/@babel/types/lib/index.js"),i=r("../../node_modules/@babel/helper-module-imports/lib/import-builder.js"),o=r("../../node_modules/@babel/helper-module-imports/lib/is-module.js");const{numericLiteral:a,sequenceExpression:u}=s;t.default=class{constructor(e,t,r){this._defaultOpts={importedSource:null,importedType:"commonjs",importedInterop:"babel",importingInterop:"babel",ensureLiveReference:!1,ensureNoContext:!1,importPosition:"before"};const n=e.find((e=>e.isProgram()));this._programPath=n,this._programScope=n.scope,this._hub=n.hub,this._defaultOpts=this._applyDefaults(t,r,!0)}addDefault(e,t){return this.addNamed("default",e,t)}addNamed(e,t,r){return n("string"==typeof e),this._generateImport(this._applyDefaults(t,r),e)}addNamespace(e,t){return this._generateImport(this._applyDefaults(e,t),null)}addSideEffect(e,t){return this._generateImport(this._applyDefaults(e,t),!1)}_applyDefaults(e,t){let r=arguments.length>2&&void 0!==arguments[2]&&arguments[2];const s=[];"string"==typeof e?(s.push({importedSource:e}),s.push(t)):(n(!t,"Unexpected secondary arguments."),s.push(e));const i=Object.assign({},this._defaultOpts);for(const e of s)e&&(Object.keys(i).forEach((t=>{void 0!==e[t]&&(i[t]=e[t])})),r||(void 0!==e.nameHint&&(i.nameHint=e.nameHint),void 0!==e.blockHoist&&(i.blockHoist=e.blockHoist)));return i}_generateImport(e,t){const r="default"===t,n=!!t&&!r,s=null===t,{importedSource:l,importedType:c,importedInterop:p,importingInterop:d,ensureLiveReference:h,ensureNoContext:f,nameHint:m,importPosition:g,blockHoist:y}=e;let D=m||t;const b=(0,o.default)(this._programPath),v=b&&"node"===d,E=b&&"babel"===d;if("after"===g&&!b)throw new Error('"importPosition": "after" is only supported in modules');const x=new i.default(l,this._programScope,this._hub);if("es6"===c){if(!v&&!E)throw new Error("Cannot import an ES6 module from CommonJS");x.import(),s?x.namespace(m||l):(r||n)&&x.named(D,t)}else{if("commonjs"!==c)throw new Error(`Unexpected interopType "${c}"`);if("babel"===p)if(v){D="default"!==D?D:l;const e=`${l}$es6Default`;x.import(),s?x.default(e).var(D||l).wildcardInterop():r?h?x.default(e).var(D||l).defaultInterop().read("default"):x.default(e).var(D).defaultInterop().prop(t):n&&x.default(e).read(t)}else E?(x.import(),s?x.namespace(D||l):(r||n)&&x.named(D,t)):(x.require(),s?x.var(D||l).wildcardInterop():(r||n)&&h?r?(D="default"!==D?D:l,x.var(D).read(t),x.defaultInterop()):x.var(l).read(t):r?x.var(D).defaultInterop().prop(t):n&&x.var(D).prop(t));else if("compiled"===p)v?(x.import(),s?x.default(D||l):(r||n)&&x.default(l).read(D)):E?(x.import(),s?x.namespace(D||l):(r||n)&&x.named(D,t)):(x.require(),s?x.var(D||l):(r||n)&&(h?x.var(l).read(D):x.prop(t).var(D)));else{if("uncompiled"!==p)throw new Error(`Unknown importedInterop "${p}".`);if(r&&h)throw new Error("No live reference for commonjs default");v?(x.import(),s?x.default(D||l):r?x.default(D):n&&x.default(l).read(D)):E?(x.import(),s?x.default(D||l):r?x.default(D):n&&x.named(D,t)):(x.require(),s?x.var(D||l):r?x.var(D):n&&(h?x.var(l).read(D):x.var(D).prop(t)))}}const{statements:C,resultName:A}=x.done();return this._insertStatements(C,g,y),(r||n)&&f&&"Identifier"!==A.type?u([a(0),A]):A}_insertStatements(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"before",r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:3;const n=this._programPath.get("body");if("after"===t){for(let t=n.length-1;t>=0;t--)if(n[t].isImportDeclaration())return void n[t].insertAfter(e)}else{e.forEach((e=>{e._blockHoist=r}));const t=n.find((e=>{const t=e.node._blockHoist;return Number.isFinite(t)&&t<4}));if(t)return void t.insertBefore(e)}this._programPath.unshiftContainer("body",e)}}},"../../node_modules/@babel/helper-module-imports/lib/index.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"ImportInjector",{enumerable:!0,get:function(){return n.default}}),t.addDefault=function(e,t,r){return new n.default(e).addDefault(t,r)},t.addNamed=function(e,t,r,s){return new n.default(e).addNamed(t,r,s)},t.addNamespace=function(e,t,r){return new n.default(e).addNamespace(t,r)},t.addSideEffect=function(e,t,r){return new n.default(e).addSideEffect(t,r)},Object.defineProperty(t,"isModule",{enumerable:!0,get:function(){return s.default}});var n=r("../../node_modules/@babel/helper-module-imports/lib/import-injector.js"),s=r("../../node_modules/@babel/helper-module-imports/lib/is-module.js")},"../../node_modules/@babel/helper-module-imports/lib/is-module.js":(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){const{sourceType:t}=e.node;if("module"!==t&&"script"!==t)throw e.buildCodeFrameError(`Unknown sourceType "${t}", cannot transform.`);return"module"===e.node.sourceType}},"../../node_modules/@babel/helper-module-transforms/lib/get-module-name.js":(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=r;{const e=r;t.default=r=function(t,r){var n,s,i,o;return e(t,{moduleId:null!=(n=r.moduleId)?n:t.moduleId,moduleIds:null!=(s=r.moduleIds)?s:t.moduleIds,getModuleId:null!=(i=r.getModuleId)?i:t.getModuleId,moduleRoot:null!=(o=r.moduleRoot)?o:t.moduleRoot})}}function r(e,t){const{filename:r,filenameRelative:n=r,sourceRoot:s=t.moduleRoot}=e,{moduleId:i,moduleIds:o=!!i,getModuleId:a,moduleRoot:u=s}=t;if(!o)return null;if(null!=i&&!a)return i;let l=null!=u?u+"/":"";if(n){const e=null!=s?new RegExp("^"+s+"/?"):"";l+=n.replace(e,"").replace(/\.(\w*?)$/,"")}return l=l.replace(/\\/g,"/"),a&&a(l)||l}},"../../node_modules/@babel/helper-module-transforms/lib/index.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.buildNamespaceInitStatements=function(e,t){let r=arguments.length>2&&void 0!==arguments[2]&&arguments[2];const n=[];let s=y(t.name);t.lazy&&(s=d(s,[]));for(const e of t.importsNamespace)e!==t.name&&n.push(i.default.statement`var NAME = SOURCE;`({NAME:e,SOURCE:h(s)}));r&&n.push(...w(e,t,!0));for(const r of t.reexportNamespace)n.push((t.lazy?i.default.statement`
            Object.defineProperty(EXPORTS, "NAME", {
              enumerable: true,
              get: function() {
                return NAMESPACE;
              }
            });
          `:i.default.statement`EXPORTS.NAME = NAMESPACE;`)({EXPORTS:e.exportName,NAME:r,NAMESPACE:h(s)}));if(t.reexportAll){const i=S(e,h(s),r);i.loc=t.reexportAll.loc,n.push(i)}return n},t.ensureStatementsHoisted=function(e){e.forEach((e=>{e._blockHoist=3}))},Object.defineProperty(t,"getModuleName",{enumerable:!0,get:function(){return c.default}}),Object.defineProperty(t,"hasExports",{enumerable:!0,get:function(){return l.hasExports}}),Object.defineProperty(t,"isModule",{enumerable:!0,get:function(){return o.isModule}}),Object.defineProperty(t,"isSideEffectImport",{enumerable:!0,get:function(){return l.isSideEffectImport}}),t.rewriteModuleStatementsAndPrepareHeader=function(e,t){let{loose:r,exportName:s,strict:c,allowTopLevelThis:p,strictMode:d,noInterop:h,importInterop:g=(h?"none":"babel"),lazy:D,esNamespaceOnly:b,constantReexports:v=r,enumerableModuleMeta:A=r,noIncompleteNsImportDetection:S}=t;(0,l.validateImportInteropOption)(g),n((0,o.isModule)(e),"Cannot process module statements in a script"),e.node.sourceType="script";const _=(0,l.default)(e,s,{importInterop:g,initializeReexports:v,lazy:D,esNamespaceOnly:b});if(p||(0,a.default)(e),(0,u.default)(e,_),!1!==d){const t=e.node.directives.some((e=>"use strict"===e.value.value));t||e.unshiftContainer("directives",f(m("use strict")))}const F=[];(0,l.hasExports)(_)&&!c&&F.push(function(e){return(arguments.length>1&&void 0!==arguments[1]&&arguments[1]?i.default.statement`
        EXPORTS.__esModule = true;
      `:i.default.statement`
        Object.defineProperty(EXPORTS, "__esModule", {
          value: true,
        });
      `)({EXPORTS:e.exportName})}(_,A));const T=function(e,t){const r=Object.create(null);for(const e of t.local.values())for(const t of e.names)r[t]=!0;let n=!1;for(const e of t.source.values()){for(const t of e.reexports.keys())r[t]=!0;for(const t of e.reexportNamespace)r[t]=!0;n=n||!!e.reexportAll}if(!n||0===Object.keys(r).length)return null;const s=e.scope.generateUidIdentifier("exportNames");return delete r.default,{name:s.name,statement:x("var",[C(s,E(r))])}}(e,_);return T&&(_.exportNameListName=T.name,F.push(T.statement)),F.push(...function(e,t){let r=arguments.length>2&&void 0!==arguments[2]&&arguments[2],n=arguments.length>3&&void 0!==arguments[3]&&arguments[3];const s=[];for(const[e,r]of t.local)if("import"===r.kind);else if("hoisted"===r.kind)s.push([r.names[0],k(t,r.names,y(e))]);else if(!n)for(const e of r.names)s.push([e,null]);for(const e of t.source.values()){if(!r){const r=w(t,e,!1),n=[...e.reexports.keys()];for(let e=0;e<r.length;e++)s.push([n[e],r[e]])}if(!n)for(const t of e.reexportNamespace)s.push([t,null])}s.sort(((e,t)=>e[0]>t[0]?1:-1));const i=[];if(n)for(const[,e]of s)i.push(e);else{const r=100;for(let n=0,o=[];n<s.length;n+=r){for(let a=0;a<r&&n+a<s.length;a++){const[r,u]=s[n+a];null!==u?(o.length>0&&(i.push(k(t,o,e.scope.buildUndefinedNode())),o=[]),i.push(u)):o.push(r)}o.length>0&&i.push(k(t,o,e.scope.buildUndefinedNode()))}}return i}(e,_,v,S)),{meta:_,headers:F}},Object.defineProperty(t,"rewriteThis",{enumerable:!0,get:function(){return a.default}}),t.wrapInterop=function(e,t,r){if("none"===r)return null;if("node-namespace"===r)return d(e.hub.addHelper("interopRequireWildcard"),[t,p(!0)]);if("node-default"===r)return null;let n;if("default"===r)n="interopRequireDefault";else{if("namespace"!==r)throw new Error(`Unknown interop: ${r}`);n="interopRequireWildcard"}return d(e.hub.addHelper(n),[t])};var n=r("../../node_modules/assert/build/assert.js"),s=r("../../node_modules/@babel/types/lib/index.js"),i=r("../../node_modules/@babel/template/lib/index.js"),o=r("../../node_modules/@babel/helper-module-imports/lib/index.js"),a=r("../../node_modules/@babel/helper-module-transforms/lib/rewrite-this.js"),u=r("../../node_modules/@babel/helper-module-transforms/lib/rewrite-live-references.js"),l=r("../../node_modules/@babel/helper-module-transforms/lib/normalize-and-load-metadata.js"),c=r("../../node_modules/@babel/helper-module-transforms/lib/get-module-name.js");const{booleanLiteral:p,callExpression:d,cloneNode:h,directive:f,directiveLiteral:m,expressionStatement:g,identifier:y,isIdentifier:D,memberExpression:b,stringLiteral:v,valueToNode:E,variableDeclaration:x,variableDeclarator:C}=s,A={constant:i.default.statement`EXPORTS.EXPORT_NAME = NAMESPACE_IMPORT;`,constantComputed:i.default.statement`EXPORTS["EXPORT_NAME"] = NAMESPACE_IMPORT;`,spec:i.default.statement`
    Object.defineProperty(EXPORTS, "EXPORT_NAME", {
      enumerable: true,
      get: function() {
        return NAMESPACE_IMPORT;
      },
    });
    `},w=(e,t,r)=>{const n=t.lazy?d(y(t.name),[]):y(t.name),{stringSpecifiers:s}=e;return Array.from(t.reexports,(i=>{let[o,a]=i,u=h(n);"default"===a&&"node-default"===t.interop||(u=s.has(a)?b(u,v(a),!0):b(u,y(a)));const l={EXPORTS:e.exportName,EXPORT_NAME:o,NAMESPACE_IMPORT:u};return r||D(u)?s.has(o)?A.constantComputed(l):A.constant(l):A.spec(l)}))};function S(e,t,r){return(r?i.default.statement`
        Object.keys(NAMESPACE).forEach(function(key) {
          if (key === "default" || key === "__esModule") return;
          VERIFY_NAME_LIST;
          if (key in EXPORTS && EXPORTS[key] === NAMESPACE[key]) return;

          EXPORTS[key] = NAMESPACE[key];
        });
      `:i.default.statement`
        Object.keys(NAMESPACE).forEach(function(key) {
          if (key === "default" || key === "__esModule") return;
          VERIFY_NAME_LIST;
          if (key in EXPORTS && EXPORTS[key] === NAMESPACE[key]) return;

          Object.defineProperty(EXPORTS, key, {
            enumerable: true,
            get: function() {
              return NAMESPACE[key];
            },
          });
        });
    `)({NAMESPACE:t,EXPORTS:e.exportName,VERIFY_NAME_LIST:e.exportNameListName?i.default`
            if (Object.prototype.hasOwnProperty.call(EXPORTS_LIST, key)) return;
          `({EXPORTS_LIST:e.exportNameListName}):null})}const _={computed:i.default.expression`EXPORTS["NAME"] = VALUE`,default:i.default.expression`EXPORTS.NAME = VALUE`};function k(e,t,r){const{stringSpecifiers:n,exportName:s}=e;return g(t.reduce(((e,t)=>{const r={EXPORTS:s,NAME:t,VALUE:e};return n.has(t)?_.computed(r):_.default(r)}),r))}},"../../node_modules/@babel/helper-module-transforms/lib/normalize-and-load-metadata.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t,r){let{importInterop:s,initializeReexports:a=!1,lazy:p=!1,esNamespaceOnly:d=!1}=r;t||(t=e.scope.generateUidIdentifier("exports").name);const h=new Set;!function(e){e.get("body").forEach((e=>{e.isExportDefaultDeclaration()&&(0,i.default)(e)}))}(e);const{local:f,source:m,hasExports:g}=function(e,t,r){let{lazy:s,initializeReexports:i}=t;const a=function(e,t,r){const n=new Map;e.get("body").forEach((e=>{let r;if(e.isImportDeclaration())r="import";else{if(e.isExportDefaultDeclaration()&&(e=e.get("declaration")),e.isExportNamedDeclaration())if(e.node.declaration)e=e.get("declaration");else if(t&&e.node.source&&e.get("source").isStringLiteral())return void e.get("specifiers").forEach((e=>{c(e),n.set(e.get("local").node.name,"block")}));if(e.isFunctionDeclaration())r="hoisted";else if(e.isClassDeclaration())r="block";else if(e.isVariableDeclaration({kind:"var"}))r="var";else{if(!e.isVariableDeclaration())return;r="block"}}Object.keys(e.getOuterBindingIdentifiers()).forEach((e=>{n.set(e,r)}))}));const s=new Map,i=e=>{const t=e.node.name;let r=s.get(t);if(!r){const i=n.get(t);if(void 0===i)throw e.buildCodeFrameError(`Exporting local "${t}", which is not declared.`);r={names:[],kind:i},s.set(t,r)}return r};return e.get("body").forEach((e=>{if(!e.isExportNamedDeclaration()||!t&&e.node.source){if(e.isExportDefaultDeclaration()){const t=e.get("declaration");if(!t.isFunctionDeclaration()&&!t.isClassDeclaration())throw t.buildCodeFrameError("Unexpected default expression export.");i(t.get("id")).names.push("default")}}else if(e.node.declaration){const t=e.get("declaration"),r=t.getOuterBindingIdentifierPaths();Object.keys(r).forEach((e=>{if("__esModule"===e)throw t.buildCodeFrameError('Illegal export "__esModule".');i(r[e]).names.push(e)}))}else e.get("specifiers").forEach((e=>{const t=e.get("local"),n=e.get("exported"),s=i(t),o=l(n,r);if("__esModule"===o)throw n.buildCodeFrameError('Illegal export "__esModule".');s.names.push(o)}))})),s}(e,i,r),u=new Map,p=t=>{const r=t.value;let s=u.get(r);return s||(s={name:e.scope.generateUidIdentifier((0,n.basename)(r,(0,n.extname)(r))).name,interop:"none",loc:null,imports:new Map,importsNamespace:new Set,reexports:new Map,reexportNamespace:new Set,reexportAll:null,lazy:!1,source:r},u.set(r,s)),s};let d=!1;e.get("body").forEach((e=>{if(e.isImportDeclaration()){const t=p(e.node.source);t.loc||(t.loc=e.node.loc),e.get("specifiers").forEach((e=>{if(e.isImportDefaultSpecifier()){const r=e.get("local").node.name;t.imports.set(r,"default");const n=a.get(r);n&&(a.delete(r),n.names.forEach((e=>{t.reexports.set(e,"default")})))}else if(e.isImportNamespaceSpecifier()){const r=e.get("local").node.name;t.importsNamespace.add(r);const n=a.get(r);n&&(a.delete(r),n.names.forEach((e=>{t.reexportNamespace.add(e)})))}else if(e.isImportSpecifier()){const n=l(e.get("imported"),r),s=e.get("local").node.name;t.imports.set(s,n);const i=a.get(s);i&&(a.delete(s),i.names.forEach((e=>{t.reexports.set(e,n)})))}}))}else if(e.isExportAllDeclaration()){d=!0;const t=p(e.node.source);t.loc||(t.loc=e.node.loc),t.reexportAll={loc:e.node.loc}}else if(e.isExportNamedDeclaration()&&e.node.source){d=!0;const t=p(e.node.source);t.loc||(t.loc=e.node.loc),e.get("specifiers").forEach((e=>{c(e);const n=l(e.get("local"),r),s=l(e.get("exported"),r);if(t.reexports.set(s,n),"__esModule"===s)throw e.get("exported").buildCodeFrameError('Illegal export "__esModule".')}))}else(e.isExportNamedDeclaration()||e.isExportDefaultDeclaration())&&(d=!0)}));for(const e of u.values()){let t=!1,r=!1;e.importsNamespace.size>0&&(t=!0,r=!0),e.reexportAll&&(r=!0);for(const n of e.imports.values())"default"===n?t=!0:r=!0;for(const n of e.reexports.values())"default"===n?t=!0:r=!0;t&&r?e.interop="namespace":t&&(e.interop="default")}for(const[e,t]of u)if(!1!==s&&!o(t)&&!t.reexportAll)if(!0===s)t.lazy=!/\./.test(e);else if(Array.isArray(s))t.lazy=-1!==s.indexOf(e);else{if("function"!=typeof s)throw new Error(".lazy must be a boolean, string array, or function");t.lazy=s(e)}return{hasExports:d,local:a,source:u}}(e,{initializeReexports:a,lazy:p},h);!function(e){e.get("body").forEach((e=>{if(e.isImportDeclaration())e.remove();else if(e.isExportNamedDeclaration())e.node.declaration?(e.node.declaration._blockHoist=e.node._blockHoist,e.replaceWith(e.node.declaration)):e.remove();else if(e.isExportDefaultDeclaration()){const t=e.get("declaration");if(!t.isFunctionDeclaration()&&!t.isClassDeclaration())throw t.buildCodeFrameError("Unexpected default expression export.");t._blockHoist=e.node._blockHoist,e.replaceWith(t)}else e.isExportAllDeclaration()&&e.remove()}))}(e);for(const[,e]of m){e.importsNamespace.size>0&&(e.name=e.importsNamespace.values().next().value);const t=u(s,e.source);"none"===t?e.interop="none":"node"===t&&"namespace"===e.interop?e.interop="node-namespace":"node"===t&&"default"===e.interop?e.interop="node-default":d&&"namespace"===e.interop&&(e.interop="default")}return{exportName:t,exportNameListName:null,hasExports:g,local:f,source:m,stringSpecifiers:h}},t.hasExports=function(e){return e.hasExports},t.isSideEffectImport=o,t.validateImportInteropOption=a;var n=r("../../node_modules/path-browserify/index.js"),s=r("../../node_modules/@babel/helper-validator-identifier/lib/index.js"),i=r("../../node_modules/@babel/helper-split-export-declaration/lib/index.js");function o(e){return 0===e.imports.size&&0===e.importsNamespace.size&&0===e.reexports.size&&0===e.reexportNamespace.size&&!e.reexportAll}function a(e){if("function"!=typeof e&&"none"!==e&&"babel"!==e&&"node"!==e)throw new Error(`.importInterop must be one of "none", "babel", "node", or a function returning one of those values (received ${e}).`);return e}function u(e,t){return"function"==typeof e?a(e(t)):e}function l(e,t){if(e.isIdentifier())return e.node.name;if(e.isStringLiteral()){const r=e.node.value;return(0,s.isIdentifierName)(r)||t.add(r),r}throw new Error(`Expected export specifier to be either Identifier or StringLiteral, got ${e.node.type}`)}function c(e){if(!e.isExportSpecifier())throw e.isExportNamespaceSpecifier()?e.buildCodeFrameError("Export namespace should be first transformed by `@babel/plugin-proposal-export-namespace-from`."):e.buildCodeFrameError("Unexpected export specifier type")}},"../../node_modules/@babel/helper-module-transforms/lib/rewrite-live-references.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t){const r=new Map,n=new Map,s=t=>{e.requeue(t)};for(const[e,n]of t.source){for(const[t,s]of n.imports)r.set(t,[e,s,null]);for(const t of n.importsNamespace)r.set(t,[e,null,t])}for(const[e,r]of t.local){let t=n.get(e);t||(t=[],n.set(e,t)),t.push(...r.names)}const i={metadata:t,requeueInParent:s,scope:e.scope,exported:n};e.traverse(C,i),(0,o.default)(e,new Set([...Array.from(r.keys()),...Array.from(n.keys())]));const a={seen:new WeakSet,metadata:t,requeueInParent:s,scope:e.scope,imported:r,exported:n,buildImportReference:(e,r)=>{let[n,s,i]=e;const o=t.source.get(n);if(i)return o.lazy&&(r=u(r,[])),r;let a=d(o.name);if(o.lazy&&(a=u(a,[])),"default"===s&&"node-default"===o.interop)return a;const l=t.stringSpecifiers.has(s);return y(a,l?v(s):d(s),l)}};e.traverse(S,a)};var n=r("../../node_modules/assert/build/assert.js"),s=r("../../node_modules/@babel/types/lib/index.js"),i=r("../../node_modules/@babel/template/lib/index.js"),o=r("../../node_modules/@babel/helper-simple-access/lib/index.js");const{assignmentExpression:a,callExpression:u,cloneNode:l,expressionStatement:c,getOuterBindingIdentifiers:p,identifier:d,isMemberExpression:h,isVariableDeclaration:f,jsxIdentifier:m,jsxMemberExpression:g,memberExpression:y,numericLiteral:D,sequenceExpression:b,stringLiteral:v,variableDeclaration:E,variableDeclarator:x}=s,C={Scope(e){e.skip()},ClassDeclaration(e){const{requeueInParent:t,exported:r,metadata:n}=this,{id:s}=e.node;if(!s)throw new Error("Expected class to have a name");const i=s.name,o=r.get(i)||[];if(o.length>0){const r=c(A(n,o,d(i)));r._blockHoist=e.node._blockHoist,t(e.insertAfter(r)[0])}},VariableDeclaration(e){const{requeueInParent:t,exported:r,metadata:n}=this;Object.keys(e.getOuterBindingIdentifiers()).forEach((s=>{const i=r.get(s)||[];if(i.length>0){const r=c(A(n,i,d(s)));r._blockHoist=e.node._blockHoist,t(e.insertAfter(r)[0])}}))}},A=(e,t,r)=>(t||[]).reduce(((t,r)=>{const{stringSpecifiers:n}=e,s=n.has(r);return a("=",y(d(e.exportName),s?v(r):d(r),s),t)}),r),w=e=>i.default.expression.ast`
    (function() {
      throw new Error('"' + '${e}' + '" is read-only.');
    })()
  `,S={ReferencedIdentifier(e){const{seen:t,buildImportReference:r,scope:n,imported:s,requeueInParent:i}=this;if(t.has(e.node))return;t.add(e.node);const o=e.node.name,a=s.get(o);if(a){if(function(e){do{switch(e.parent.type){case"TSTypeAnnotation":case"TSTypeAliasDeclaration":case"TSTypeReference":case"TypeAnnotation":case"TypeAlias":return!0;case"ExportSpecifier":return"type"===e.parentPath.parent.exportKind;default:if(e.parentPath.isStatement()||e.parentPath.isExpression())return!1}}while(e=e.parentPath)}(e))throw e.buildCodeFrameError(`Cannot transform the imported binding "${o}" since it's also used in a type annotation. Please strip type annotations using @babel/preset-typescript or @babel/preset-flow.`);const t=e.scope.getBinding(o);if(n.getBinding(o)!==t)return;const s=r(a,e.node);if(s.loc=e.node.loc,(e.parentPath.isCallExpression({callee:e.node})||e.parentPath.isOptionalCallExpression({callee:e.node})||e.parentPath.isTaggedTemplateExpression({tag:e.node}))&&h(s))e.replaceWith(b([D(0),s]));else if(e.isJSXIdentifier()&&h(s)){const{object:t,property:r}=s;e.replaceWith(g(m(t.name),m(r.name)))}else e.replaceWith(s);i(e),e.skip()}},AssignmentExpression:{exit(e){const{scope:t,seen:r,imported:s,exported:i,requeueInParent:o,buildImportReference:a}=this;if(r.has(e.node))return;r.add(e.node);const u=e.get("left");if(!u.isMemberExpression())if(u.isIdentifier()){const r=u.node.name;if(t.getBinding(r)!==e.scope.getBinding(r))return;const l=i.get(r),c=s.get(r);if((null==l?void 0:l.length)>0||c){n("="===e.node.operator,"Path was not simplified");const t=e.node;c&&(t.left=a(c,t.left),t.right=b([t.right,w(r)])),e.replaceWith(A(this.metadata,l,t)),o(e)}}else{const r=u.getOuterBindingIdentifiers(),n=Object.keys(r).filter((r=>t.getBinding(r)===e.scope.getBinding(r))),a=n.find((e=>s.has(e)));a&&(e.node.right=b([e.node.right,w(a)]));const l=[];if(n.forEach((e=>{const t=i.get(e)||[];t.length>0&&l.push(A(this.metadata,t,d(e)))})),l.length>0){let t=b(l);e.parentPath.isExpressionStatement()&&(t=c(t),t._blockHoist=e.parentPath.node._blockHoist),o(e.insertAfter(t)[0])}}}},"ForOfStatement|ForInStatement"(e){const{scope:t,node:r}=e,{left:n}=r,{exported:s,imported:i,scope:o}=this;if(!f(n)){let r,u=!1;const d=e.get("body").scope;for(const e of Object.keys(p(n)))o.getBinding(e)===t.getBinding(e)&&(s.has(e)&&(u=!0,d.hasOwnBinding(e)&&d.rename(e)),i.has(e)&&!r&&(r=e));if(!u&&!r)return;e.ensureBlock();const h=e.get("body"),f=t.generateUidIdentifierBasedOnNode(n);e.get("left").replaceWith(E("let",[x(l(f))])),t.registerDeclaration(e.get("left")),u&&h.unshiftContainer("body",c(a("=",n,f))),r&&h.unshiftContainer("body",c(w(r)))}}}},"../../node_modules/@babel/helper-module-transforms/lib/rewrite-this.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){(0,s.default)(e.node,Object.assign({},u,{noScope:!0}))};var n=r("../../node_modules/@babel/helper-environment-visitor/lib/index.js"),s=r("../../node_modules/@babel/traverse/lib/index.js"),i=r("../../node_modules/@babel/types/lib/index.js");const{numericLiteral:o,unaryExpression:a}=i,u=s.default.visitors.merge([n.default,{ThisExpression(e){e.replaceWith(a("void",o(0),!0))}}])},"../../node_modules/@babel/helper-plugin-utils/lib/index.js":(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.declare=function(e){return(t,s,i)=>{var o;let a;for(const e of Object.keys(r)){var u;t[e]||(a=null!=(u=a)?u:n(t),a[e]=r[e](a))}return e(null!=(o=a)?o:t,s||{},i)}};const r={assertVersion:e=>t=>{!function(e,t){if("number"==typeof e){if(!Number.isInteger(e))throw new Error("Expected string or integer value.");e=`^${e}.0.0-0`}if("string"!=typeof e)throw new Error("Expected string or integer value.");const r=Error.stackTraceLimit;let n;throw"number"==typeof r&&r<25&&(Error.stackTraceLimit=25),n="7."===t.slice(0,2)?new Error(`Requires Babel "^7.0.0-beta.41", but was loaded with "${t}". You'll need to update your @babel/core version.`):new Error(`Requires Babel "${e}", but was loaded with "${t}". If you are sure you have a compatible version of @babel/core, it is likely that something in your build process is loading the wrong version. Inspect the stack trace of this error to look for the first entry that doesn't mention "@babel/core" or "babel-core" to see what is calling Babel.`),"number"==typeof r&&(Error.stackTraceLimit=r),Object.assign(n,{code:"BABEL_VERSION_UNSUPPORTED",version:t,range:e})}(t,e.version)},targets:()=>()=>({}),assumption:()=>()=>{}};function n(e){let t=null;return"string"==typeof e.version&&/^7\./.test(e.version)&&(t=Object.getPrototypeOf(e),!t||s(t,"version")&&s(t,"transform")&&s(t,"template")&&s(t,"types")||(t=null)),Object.assign({},t,e)}function s(e,t){return Object.prototype.hasOwnProperty.call(e,t)}},"../../node_modules/@babel/helper-simple-access/lib/index.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t){e.traverse(h,{scope:e.scope,bindingNames:t,seen:new WeakSet})};var n=r("../../node_modules/@babel/types/lib/index.js");const{LOGICAL_OPERATORS:s,assignmentExpression:i,binaryExpression:o,cloneNode:a,identifier:u,logicalExpression:l,numericLiteral:c,sequenceExpression:p,unaryExpression:d}=n,h={UpdateExpression:{exit(e){const{scope:t,bindingNames:r}=this,n=e.get("argument");if(!n.isIdentifier())return;const s=n.node.name;if(r.has(s)&&t.getBinding(s)===e.scope.getBinding(s))if(e.parentPath.isExpressionStatement()&&!e.isCompletionRecord()){const t="++"==e.node.operator?"+=":"-=";e.replaceWith(i(t,n.node,c(1)))}else if(e.node.prefix)e.replaceWith(i("=",u(s),o(e.node.operator[0],d("+",n.node),c(1))));else{const t=e.scope.generateUidIdentifierBasedOnNode(n.node,"old"),r=t.name;e.scope.push({id:t});const s=o(e.node.operator[0],u(r),c(1));e.replaceWith(p([i("=",u(r),d("+",n.node)),i("=",a(n.node),s),u(r)]))}}},AssignmentExpression:{exit(e){const{scope:t,seen:r,bindingNames:n}=this;if("="===e.node.operator)return;if(r.has(e.node))return;r.add(e.node);const u=e.get("left");if(!u.isIdentifier())return;const c=u.node.name;if(!n.has(c))return;if(t.getBinding(c)!==e.scope.getBinding(c))return;const p=e.node.operator.slice(0,-1);s.includes(p)?e.replaceWith(l(p,e.node.left,i("=",a(e.node.left),e.node.right))):(e.node.right=o(p,a(e.node.left),e.node.right),e.node.operator="=")}}}},"../../node_modules/@babel/helper-validator-option/lib/find-suggestion.js":(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.findSuggestion=function(e,t){const n=t.map((t=>function(e,t){let n,s,i=[],o=[];const a=e.length,u=t.length;if(!a)return u;if(!u)return a;for(s=0;s<=u;s++)i[s]=s;for(n=1;n<=a;n++){for(o=[n],s=1;s<=u;s++)o[s]=e[n-1]===t[s-1]?i[s-1]:r(i[s-1],i[s],o[s-1])+1;i=o}return o[u]}(t,e)));return t[n.indexOf(r(...n))]};const{min:r}=Math},"../../node_modules/@babel/helper-validator-option/lib/index.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"OptionValidator",{enumerable:!0,get:function(){return n.OptionValidator}}),Object.defineProperty(t,"findSuggestion",{enumerable:!0,get:function(){return s.findSuggestion}});var n=r("../../node_modules/@babel/helper-validator-option/lib/validator.js"),s=r("../../node_modules/@babel/helper-validator-option/lib/find-suggestion.js")},"../../node_modules/@babel/helper-validator-option/lib/validator.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.OptionValidator=void 0;var n=r("../../node_modules/@babel/helper-validator-option/lib/find-suggestion.js");t.OptionValidator=class{constructor(e){this.descriptor=e}validateTopLevelOptions(e,t){const r=Object.keys(t);for(const t of Object.keys(e))if(!r.includes(t))throw new Error(this.formatMessage(`'${t}' is not a valid top-level option.\n- Did you mean '${(0,n.findSuggestion)(t,r)}'?`))}validateBooleanOption(e,t,r){return void 0===t?r:(this.invariant("boolean"==typeof t,`'${e}' option must be a boolean.`),t)}validateStringOption(e,t,r){return void 0===t?r:(this.invariant("string"==typeof t,`'${e}' option must be a string.`),t)}invariant(e,t){if(!e)throw new Error(this.formatMessage(t))}formatMessage(e){return`${this.descriptor}: ${e}`}}},"../../node_modules/@babel/helpers/lib/helpers-generated.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n=r("../../node_modules/@babel/template/lib/index.js");function s(e,t){return Object.freeze({minVersion:e,ast:()=>n.default.program.ast(t)})}var i=Object.freeze({asyncIterator:s("7.15.9",'export default function _asyncIterator(iterable){var method,async,sync,retry=2;for("undefined"!=typeof Symbol&&(async=Symbol.asyncIterator,sync=Symbol.iterator);retry--;){if(async&&null!=(method=iterable[async]))return method.call(iterable);if(sync&&null!=(method=iterable[sync]))return new AsyncFromSyncIterator(method.call(iterable));async="@@asyncIterator",sync="@@iterator"}throw new TypeError("Object is not async iterable")}function AsyncFromSyncIterator(s){function AsyncFromSyncIteratorContinuation(r){if(Object(r)!==r)return Promise.reject(new TypeError(r+" is not an object."));var done=r.done;return Promise.resolve(r.value).then((function(value){return{value:value,done:done}}))}return AsyncFromSyncIterator=function(s){this.s=s,this.n=s.next},AsyncFromSyncIterator.prototype={s:null,n:null,next:function(){return AsyncFromSyncIteratorContinuation(this.n.apply(this.s,arguments))},return:function(value){var ret=this.s.return;return void 0===ret?Promise.resolve({value:value,done:!0}):AsyncFromSyncIteratorContinuation(ret.apply(this.s,arguments))},throw:function(value){var thr=this.s.return;return void 0===thr?Promise.reject(value):AsyncFromSyncIteratorContinuation(thr.apply(this.s,arguments))}},new AsyncFromSyncIterator(s)}'),jsx:s("7.0.0-beta.0",'var REACT_ELEMENT_TYPE;export default function _createRawReactElement(type,props,key,children){REACT_ELEMENT_TYPE||(REACT_ELEMENT_TYPE="function"==typeof Symbol&&Symbol.for&&Symbol.for("react.element")||60103);var defaultProps=type&&type.defaultProps,childrenLength=arguments.length-3;if(props||0===childrenLength||(props={children:void 0}),1===childrenLength)props.children=children;else if(childrenLength>1){for(var childArray=new Array(childrenLength),i=0;i<childrenLength;i++)childArray[i]=arguments[i+3];props.children=childArray}if(props&&defaultProps)for(var propName in defaultProps)void 0===props[propName]&&(props[propName]=defaultProps[propName]);else props||(props=defaultProps||{});return{$$typeof:REACT_ELEMENT_TYPE,type:type,key:void 0===key?null:""+key,ref:null,props:props,_owner:null}}'),objectSpread2:s("7.5.0",'import defineProperty from"defineProperty";function ownKeys(object,enumerableOnly){var keys=Object.keys(object);if(Object.getOwnPropertySymbols){var symbols=Object.getOwnPropertySymbols(object);enumerableOnly&&(symbols=symbols.filter((function(sym){return Object.getOwnPropertyDescriptor(object,sym).enumerable}))),keys.push.apply(keys,symbols)}return keys}export default function _objectSpread2(target){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?ownKeys(Object(source),!0).forEach((function(key){defineProperty(target,key,source[key])})):Object.getOwnPropertyDescriptors?Object.defineProperties(target,Object.getOwnPropertyDescriptors(source)):ownKeys(Object(source)).forEach((function(key){Object.defineProperty(target,key,Object.getOwnPropertyDescriptor(source,key))}))}return target}'),typeof:s("7.0.0-beta.0",'export default function _typeof(obj){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(obj){return typeof obj}:function(obj){return obj&&"function"==typeof Symbol&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj},_typeof(obj)}'),wrapRegExp:s("7.2.6",'import setPrototypeOf from"setPrototypeOf";import inherits from"inherits";export default function _wrapRegExp(){_wrapRegExp=function(re,groups){return new BabelRegExp(re,void 0,groups)};var _super=RegExp.prototype,_groups=new WeakMap;function BabelRegExp(re,flags,groups){var _this=new RegExp(re,flags);return _groups.set(_this,groups||_groups.get(re)),setPrototypeOf(_this,BabelRegExp.prototype)}function buildGroups(result,re){var g=_groups.get(re);return Object.keys(g).reduce((function(groups,name){return groups[name]=result[g[name]],groups}),Object.create(null))}return inherits(BabelRegExp,RegExp),BabelRegExp.prototype.exec=function(str){var result=_super.exec.call(this,str);return result&&(result.groups=buildGroups(result,this)),result},BabelRegExp.prototype[Symbol.replace]=function(str,substitution){if("string"==typeof substitution){var groups=_groups.get(this);return _super[Symbol.replace].call(this,str,substitution.replace(/\\$<([^>]+)>/g,(function(_,name){return"$"+groups[name]})))}if("function"==typeof substitution){var _this=this;return _super[Symbol.replace].call(this,str,(function(){var args=arguments;return"object"!=typeof args[args.length-1]&&(args=[].slice.call(args)).push(buildGroups(args,_this)),substitution.apply(this,args)}))}return _super[Symbol.replace].call(this,str,substitution)},_wrapRegExp.apply(this,arguments)}')});t.default=i},"../../node_modules/@babel/helpers/lib/helpers.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n=r("../../node_modules/@babel/template/lib/index.js"),s=r("../../node_modules/@babel/helpers/lib/helpers-generated.js");const i=Object.assign({__proto__:null},s.default);var o=i;t.default=o;const a=e=>t=>({minVersion:e,ast:()=>n.default.program.ast(t)});i.AwaitValue=a("7.0.0-beta.0")`
  export default function _AwaitValue(value) {
    this.wrapped = value;
  }
`,i.AsyncGenerator=a("7.0.0-beta.0")`
  import AwaitValue from "AwaitValue";

  export default function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null,
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg)
        var value = result.value;
        var wrappedAwait = value instanceof AwaitValue;

        Promise.resolve(wrappedAwait ? value.wrapped : value).then(
          function (arg) {
            if (wrappedAwait) {
              resume(key === "return" ? "return" : "next", arg);
              return
            }

            settle(result.done ? "return" : "normal", arg);
          },
          function (err) { resume("throw", err); });
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({ value: value, done: true });
          break;
        case "throw":
          front.reject(value);
          break;
        default:
          front.resolve({ value: value, done: false });
          break;
      }

      front = front.next;
      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    // Hide "return" method if generator return is not supported
    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  AsyncGenerator.prototype[typeof Symbol === "function" && Symbol.asyncIterator || "@@asyncIterator"] = function () { return this; };

  AsyncGenerator.prototype.next = function (arg) { return this._invoke("next", arg); };
  AsyncGenerator.prototype.throw = function (arg) { return this._invoke("throw", arg); };
  AsyncGenerator.prototype.return = function (arg) { return this._invoke("return", arg); };
`,i.wrapAsyncGenerator=a("7.0.0-beta.0")`
  import AsyncGenerator from "AsyncGenerator";

  export default function _wrapAsyncGenerator(fn) {
    return function () {
      return new AsyncGenerator(fn.apply(this, arguments));
    };
  }
`,i.awaitAsyncGenerator=a("7.0.0-beta.0")`
  import AwaitValue from "AwaitValue";

  export default function _awaitAsyncGenerator(value) {
    return new AwaitValue(value);
  }
`,i.asyncGeneratorDelegate=a("7.0.0-beta.0")`
  export default function _asyncGeneratorDelegate(inner, awaitWrap) {
    var iter = {}, waiting = false;

    function pump(key, value) {
      waiting = true;
      value = new Promise(function (resolve) { resolve(inner[key](value)); });
      return { done: false, value: awaitWrap(value) };
    };

    iter[typeof Symbol !== "undefined" && Symbol.iterator || "@@iterator"] = function () { return this; };

    iter.next = function (value) {
      if (waiting) {
        waiting = false;
        return value;
      }
      return pump("next", value);
    };

    if (typeof inner.throw === "function") {
      iter.throw = function (value) {
        if (waiting) {
          waiting = false;
          throw value;
        }
        return pump("throw", value);
      };
    }

    if (typeof inner.return === "function") {
      iter.return = function (value) {
        if (waiting) {
          waiting = false;
          return value;
        }
        return pump("return", value);
      };
    }

    return iter;
  }
`,i.asyncToGenerator=a("7.0.0-beta.0")`
  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  export default function _asyncToGenerator(fn) {
    return function () {
      var self = this, args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);
        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }
        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }
`,i.classCallCheck=a("7.0.0-beta.0")`
  export default function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
`,i.createClass=a("7.0.0-beta.0")`
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i ++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  export default function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", { writable: false });
    return Constructor;
  }
`,i.defineEnumerableProperties=a("7.0.0-beta.0")`
  export default function _defineEnumerableProperties(obj, descs) {
    for (var key in descs) {
      var desc = descs[key];
      desc.configurable = desc.enumerable = true;
      if ("value" in desc) desc.writable = true;
      Object.defineProperty(obj, key, desc);
    }

    // Symbols are not enumerated over by for-in loops. If native
    // Symbols are available, fetch all of the descs object's own
    // symbol properties and define them on our target object too.
    if (Object.getOwnPropertySymbols) {
      var objectSymbols = Object.getOwnPropertySymbols(descs);
      for (var i = 0; i < objectSymbols.length; i++) {
        var sym = objectSymbols[i];
        var desc = descs[sym];
        desc.configurable = desc.enumerable = true;
        if ("value" in desc) desc.writable = true;
        Object.defineProperty(obj, sym, desc);
      }
    }
    return obj;
  }
`,i.defaults=a("7.0.0-beta.0")`
  export default function _defaults(obj, defaults) {
    var keys = Object.getOwnPropertyNames(defaults);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var value = Object.getOwnPropertyDescriptor(defaults, key);
      if (value && value.configurable && obj[key] === undefined) {
        Object.defineProperty(obj, key, value);
      }
    }
    return obj;
  }
`,i.defineProperty=a("7.0.0-beta.0")`
  export default function _defineProperty(obj, key, value) {
    // Shortcircuit the slow defineProperty path when possible.
    // We are trying to avoid issues where setters defined on the
    // prototype cause side effects under the fast path of simple
    // assignment. By checking for existence of the property with
    // the in operator, we can optimize most of this overhead away.
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
`,i.extends=a("7.0.0-beta.0")`
  export default function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };

    return _extends.apply(this, arguments);
  }
`,i.objectSpread=a("7.0.0-beta.0")`
  import defineProperty from "defineProperty";

  export default function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = (arguments[i] != null) ? Object(arguments[i]) : {};
      var ownKeys = Object.keys(source);
      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys.push.apply(ownKeys, Object.getOwnPropertySymbols(source).filter(function(sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }
      ownKeys.forEach(function(key) {
        defineProperty(target, key, source[key]);
      });
    }
    return target;
  }
`,i.inherits=a("7.0.0-beta.0")`
  import setPrototypeOf from "setPrototypeOf";

  export default function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }
    // We can't use defineProperty to set the prototype in a single step because it
    // doesn't work in Chrome <= 36. https://github.com/babel/babel/issues/14056
    // V8 bug: https://bugs.chromium.org/p/v8/issues/detail?id=3334
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    Object.defineProperty(subClass, "prototype", { writable: false });
    if (superClass) setPrototypeOf(subClass, superClass);
  }
`,i.inheritsLoose=a("7.0.0-beta.0")`
  import setPrototypeOf from "setPrototypeOf";

  export default function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    setPrototypeOf(subClass, superClass);
  }
`,i.getPrototypeOf=a("7.0.0-beta.0")`
  export default function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf
      ? Object.getPrototypeOf
      : function _getPrototypeOf(o) {
          return o.__proto__ || Object.getPrototypeOf(o);
        };
    return _getPrototypeOf(o);
  }
`,i.setPrototypeOf=a("7.0.0-beta.0")`
  export default function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };
    return _setPrototypeOf(o, p);
  }
`,i.isNativeReflectConstruct=a("7.9.0")`
  export default function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;

    // core-js@3
    if (Reflect.construct.sham) return false;

    // Proxy can't be polyfilled. Every browser implemented
    // proxies before or at the same time as Reflect.construct,
    // so if they support Proxy they also support Reflect.construct.
    if (typeof Proxy === "function") return true;

    // Since Reflect.construct can't be properly polyfilled, some
    // implementations (e.g. core-js@2) don't set the correct internal slots.
    // Those polyfills don't allow us to subclass built-ins, so we need to
    // use our fallback implementation.
    try {
      // If the internal slots aren't set, this throws an error similar to
      //   TypeError: this is not a Boolean object.

      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
      return true;
    } catch (e) {
      return false;
    }
  }
`,i.construct=a("7.0.0-beta.0")`
  import setPrototypeOf from "setPrototypeOf";
  import isNativeReflectConstruct from "isNativeReflectConstruct";

  export default function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      // NOTE: If Parent !== Class, the correct __proto__ is set *after*
      //       calling the constructor.
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }
    // Avoid issues with Class being present but undefined when it wasn't
    // present in the original call.
    return _construct.apply(null, arguments);
  }
`,i.isNativeFunction=a("7.0.0-beta.0")`
  export default function _isNativeFunction(fn) {
    // Note: This function returns "true" for core-js functions.
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }
`,i.wrapNativeSuper=a("7.0.0-beta.0")`
  import getPrototypeOf from "getPrototypeOf";
  import setPrototypeOf from "setPrototypeOf";
  import isNativeFunction from "isNativeFunction";
  import construct from "construct";

  export default function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !isNativeFunction(Class)) return Class;
      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }
      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);
        _cache.set(Class, Wrapper);
      }
      function Wrapper() {
        return construct(Class, arguments, getPrototypeOf(this).constructor)
      }
      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true,
        }
      });

      return setPrototypeOf(Wrapper, Class);
    }

    return _wrapNativeSuper(Class)
  }
`,i.instanceof=a("7.0.0-beta.0")`
  export default function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
      return !!right[Symbol.hasInstance](left);
    } else {
      return left instanceof right;
    }
  }
`,i.interopRequireDefault=a("7.0.0-beta.0")`
  export default function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
`,i.interopRequireWildcard=a("7.14.0")`
  function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;

    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function (nodeInterop) {
      return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
  }

  export default function _interopRequireWildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
      return obj;
    }

    if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
      return { default: obj }
    }

    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
      return cache.get(obj);
    }

    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for (var key in obj) {
      if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
        var desc = hasPropertyDescriptor
          ? Object.getOwnPropertyDescriptor(obj, key)
          : null;
        if (desc && (desc.get || desc.set)) {
          Object.defineProperty(newObj, key, desc);
        } else {
          newObj[key] = obj[key];
        }
      }
    }
    newObj.default = obj;
    if (cache) {
      cache.set(obj, newObj);
    }
    return newObj;
  }
`,i.newArrowCheck=a("7.0.0-beta.0")`
  export default function _newArrowCheck(innerThis, boundThis) {
    if (innerThis !== boundThis) {
      throw new TypeError("Cannot instantiate an arrow function");
    }
  }
`,i.objectDestructuringEmpty=a("7.0.0-beta.0")`
  export default function _objectDestructuringEmpty(obj) {
    if (obj == null) throw new TypeError("Cannot destructure undefined");
  }
`,i.objectWithoutPropertiesLoose=a("7.0.0-beta.0")`
  export default function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};

    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    return target;
  }
`,i.objectWithoutProperties=a("7.0.0-beta.0")`
  import objectWithoutPropertiesLoose from "objectWithoutPropertiesLoose";

  export default function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};

    var target = objectWithoutPropertiesLoose(source, excluded);
    var key, i;

    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i = 0; i < sourceSymbolKeys.length; i++) {
        key = sourceSymbolKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
        target[key] = source[key];
      }
    }

    return target;
  }
`,i.assertThisInitialized=a("7.0.0-beta.0")`
  export default function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
  }
`,i.possibleConstructorReturn=a("7.0.0-beta.0")`
  import assertThisInitialized from "assertThisInitialized";

  export default function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }

    return assertThisInitialized(self);
  }
`,i.createSuper=a("7.9.0")`
  import getPrototypeOf from "getPrototypeOf";
  import isNativeReflectConstruct from "isNativeReflectConstruct";
  import possibleConstructorReturn from "possibleConstructorReturn";

  export default function _createSuper(Derived) {
    var hasNativeReflectConstruct = isNativeReflectConstruct();

    return function _createSuperInternal() {
      var Super = getPrototypeOf(Derived), result;
      if (hasNativeReflectConstruct) {
        // NOTE: This doesn't work if this.__proto__.constructor has been modified.
        var NewTarget = getPrototypeOf(this).constructor;
        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }
      return possibleConstructorReturn(this, result);
    }
  }
 `,i.superPropBase=a("7.0.0-beta.0")`
  import getPrototypeOf from "getPrototypeOf";

  export default function _superPropBase(object, property) {
    // Yes, this throws if object is null to being with, that's on purpose.
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = getPrototypeOf(object);
      if (object === null) break;
    }
    return object;
  }
`,i.get=a("7.0.0-beta.0")`
  import superPropBase from "superPropBase";

  export default function _get() {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = superPropBase(target, property);

        if (!base) return;

        var desc = Object.getOwnPropertyDescriptor(base, property);
        if (desc.get) {
          // STEP 3. If receiver is not present, then set receiver to target.
          return desc.get.call(arguments.length < 3 ? target : receiver);
        }

        return desc.value;
      };
    }
    return _get.apply(this, arguments);
  }
`,i.set=a("7.0.0-beta.0")`
  import superPropBase from "superPropBase";
  import defineProperty from "defineProperty";

  function set(target, property, value, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.set) {
      set = Reflect.set;
    } else {
      set = function set(target, property, value, receiver) {
        var base = superPropBase(target, property);
        var desc;

        if (base) {
          desc = Object.getOwnPropertyDescriptor(base, property);
          if (desc.set) {
            desc.set.call(receiver, value);
            return true;
          } else if (!desc.writable) {
            // Both getter and non-writable fall into this.
            return false;
          }
        }

        // Without a super that defines the property, spec boils down to
        // "define on receiver" for some reason.
        desc = Object.getOwnPropertyDescriptor(receiver, property);
        if (desc) {
          if (!desc.writable) {
            // Setter, getter, and non-writable fall into this.
            return false;
          }

          desc.value = value;
          Object.defineProperty(receiver, property, desc);
        } else {
          // Avoid setters that may be defined on Sub's prototype, but not on
          // the instance.
          defineProperty(receiver, property, value);
        }

        return true;
      };
    }

    return set(target, property, value, receiver);
  }

  export default function _set(target, property, value, receiver, isStrict) {
    var s = set(target, property, value, receiver || target);
    if (!s && isStrict) {
      throw new Error('failed to set property');
    }

    return value;
  }
`,i.taggedTemplateLiteral=a("7.0.0-beta.0")`
  export default function _taggedTemplateLiteral(strings, raw) {
    if (!raw) { raw = strings.slice(0); }
    return Object.freeze(Object.defineProperties(strings, {
        raw: { value: Object.freeze(raw) }
    }));
  }
`,i.taggedTemplateLiteralLoose=a("7.0.0-beta.0")`
  export default function _taggedTemplateLiteralLoose(strings, raw) {
    if (!raw) { raw = strings.slice(0); }
    strings.raw = raw;
    return strings;
  }
`,i.readOnlyError=a("7.0.0-beta.0")`
  export default function _readOnlyError(name) {
    throw new TypeError("\\"" + name + "\\" is read-only");
  }
`,i.writeOnlyError=a("7.12.13")`
  export default function _writeOnlyError(name) {
    throw new TypeError("\\"" + name + "\\" is write-only");
  }
`,i.classNameTDZError=a("7.0.0-beta.0")`
  export default function _classNameTDZError(name) {
    throw new Error("Class \\"" + name + "\\" cannot be referenced in computed property keys.");
  }
`,i.temporalUndefined=a("7.0.0-beta.0")`
  // This function isn't mean to be called, but to be used as a reference.
  // We can't use a normal object because it isn't hoisted.
  export default function _temporalUndefined() {}
`,i.tdz=a("7.5.5")`
  export default function _tdzError(name) {
    throw new ReferenceError(name + " is not defined - temporal dead zone");
  }
`,i.temporalRef=a("7.0.0-beta.0")`
  import undef from "temporalUndefined";
  import err from "tdz";

  export default function _temporalRef(val, name) {
    return val === undef ? err(name) : val;
  }
`,i.slicedToArray=a("7.0.0-beta.0")`
  import arrayWithHoles from "arrayWithHoles";
  import iterableToArrayLimit from "iterableToArrayLimit";
  import unsupportedIterableToArray from "unsupportedIterableToArray";
  import nonIterableRest from "nonIterableRest";

  export default function _slicedToArray(arr, i) {
    return (
      arrayWithHoles(arr) ||
      iterableToArrayLimit(arr, i) ||
      unsupportedIterableToArray(arr, i) ||
      nonIterableRest()
    );
  }
`,i.slicedToArrayLoose=a("7.0.0-beta.0")`
  import arrayWithHoles from "arrayWithHoles";
  import iterableToArrayLimitLoose from "iterableToArrayLimitLoose";
  import unsupportedIterableToArray from "unsupportedIterableToArray";
  import nonIterableRest from "nonIterableRest";

  export default function _slicedToArrayLoose(arr, i) {
    return (
      arrayWithHoles(arr) ||
      iterableToArrayLimitLoose(arr, i) ||
      unsupportedIterableToArray(arr, i) ||
      nonIterableRest()
    );
  }
`,i.toArray=a("7.0.0-beta.0")`
  import arrayWithHoles from "arrayWithHoles";
  import iterableToArray from "iterableToArray";
  import unsupportedIterableToArray from "unsupportedIterableToArray";
  import nonIterableRest from "nonIterableRest";

  export default function _toArray(arr) {
    return (
      arrayWithHoles(arr) ||
      iterableToArray(arr) ||
      unsupportedIterableToArray(arr) ||
      nonIterableRest()
    );
  }
`,i.toConsumableArray=a("7.0.0-beta.0")`
  import arrayWithoutHoles from "arrayWithoutHoles";
  import iterableToArray from "iterableToArray";
  import unsupportedIterableToArray from "unsupportedIterableToArray";
  import nonIterableSpread from "nonIterableSpread";

  export default function _toConsumableArray(arr) {
    return (
      arrayWithoutHoles(arr) ||
      iterableToArray(arr) ||
      unsupportedIterableToArray(arr) ||
      nonIterableSpread()
    );
  }
`,i.arrayWithoutHoles=a("7.0.0-beta.0")`
  import arrayLikeToArray from "arrayLikeToArray";

  export default function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return arrayLikeToArray(arr);
  }
`,i.arrayWithHoles=a("7.0.0-beta.0")`
  export default function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
`,i.maybeArrayLike=a("7.9.0")`
  import arrayLikeToArray from "arrayLikeToArray";

  export default function _maybeArrayLike(next, arr, i) {
    if (arr && !Array.isArray(arr) && typeof arr.length === "number") {
      var len = arr.length;
      return arrayLikeToArray(arr, i !== void 0 && i < len ? i : len);
    }
    return next(arr, i);
  }
`,i.iterableToArray=a("7.0.0-beta.0")`
  export default function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
`,i.iterableToArrayLimit=a("7.0.0-beta.0")`
  export default function _iterableToArrayLimit(arr, i) {
    // this is an expanded form of \`for...of\` that properly supports abrupt completions of
    // iterators etc. variable names have been minimised to reduce the size of this massive
    // helper. sometimes spec compliance is annoying :(
    //
    // _n = _iteratorNormalCompletion
    // _d = _didIteratorError
    // _e = _iteratorError
    // _i = _iterator
    // _s = _step

    var _i = arr == null ? null : (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);
    if (_i == null) return;

    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
`,i.iterableToArrayLimitLoose=a("7.0.0-beta.0")`
  export default function _iterableToArrayLimitLoose(arr, i) {
    var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);
    if (_i == null) return;

    var _arr = [];
    for (_i = _i.call(arr), _step; !(_step = _i.next()).done;) {
      _arr.push(_step.value);
      if (i && _arr.length === i) break;
    }
    return _arr;
  }
`,i.unsupportedIterableToArray=a("7.9.0")`
  import arrayLikeToArray from "arrayLikeToArray";

  export default function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
      return arrayLikeToArray(o, minLen);
  }
`,i.arrayLikeToArray=a("7.9.0")`
  export default function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
`,i.nonIterableSpread=a("7.0.0-beta.0")`
  export default function _nonIterableSpread() {
    throw new TypeError(
      "Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
    );
  }
`,i.nonIterableRest=a("7.0.0-beta.0")`
  export default function _nonIterableRest() {
    throw new TypeError(
      "Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
    );
  }
`,i.createForOfIteratorHelper=a("7.9.0")`
  import unsupportedIterableToArray from "unsupportedIterableToArray";

  // s: start (create the iterator)
  // n: next
  // e: error (called whenever something throws)
  // f: finish (always called at the end)

  export default function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];

    if (!it) {
      // Fallback for engines without symbol support
      if (
        Array.isArray(o) ||
        (it = unsupportedIterableToArray(o)) ||
        (allowArrayLike && o && typeof o.length === "number")
      ) {
        if (it) o = it;
        var i = 0;
        var F = function(){};
        return {
          s: F,
          n: function() {
            if (i >= o.length) return { done: true };
            return { done: false, value: o[i++] };
          },
          e: function(e) { throw e; },
          f: F,
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var normalCompletion = true, didErr = false, err;

    return {
      s: function() {
        it = it.call(o);
      },
      n: function() {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function(e) {
        didErr = true;
        err = e;
      },
      f: function() {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }
`,i.createForOfIteratorHelperLoose=a("7.9.0")`
  import unsupportedIterableToArray from "unsupportedIterableToArray";

  export default function _createForOfIteratorHelperLoose(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];

    if (it) return (it = it.call(o)).next.bind(it);

    // Fallback for engines without symbol support
    if (
      Array.isArray(o) ||
      (it = unsupportedIterableToArray(o)) ||
      (allowArrayLike && o && typeof o.length === "number")
    ) {
      if (it) o = it;
      var i = 0;
      return function() {
        if (i >= o.length) return { done: true };
        return { done: false, value: o[i++] };
      }
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
`,i.skipFirstGeneratorNext=a("7.0.0-beta.0")`
  export default function _skipFirstGeneratorNext(fn) {
    return function () {
      var it = fn.apply(this, arguments);
      it.next();
      return it;
    }
  }
`,i.toPrimitive=a("7.1.5")`
  export default function _toPrimitive(
    input,
    hint /*: "default" | "string" | "number" | void */
  ) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
`,i.toPropertyKey=a("7.1.5")`
  import toPrimitive from "toPrimitive";

  export default function _toPropertyKey(arg) {
    var key = toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }
`,i.initializerWarningHelper=a("7.0.0-beta.0")`
    export default function _initializerWarningHelper(descriptor, context){
        throw new Error(
          'Decorating class property failed. Please ensure that ' +
          'proposal-class-properties is enabled and runs after the decorators transform.'
        );
    }
`,i.initializerDefineProperty=a("7.0.0-beta.0")`
    export default function _initializerDefineProperty(target, property, descriptor, context){
        if (!descriptor) return;

        Object.defineProperty(target, property, {
            enumerable: descriptor.enumerable,
            configurable: descriptor.configurable,
            writable: descriptor.writable,
            value: descriptor.initializer ? descriptor.initializer.call(context) : void 0,
        });
    }
`,i.applyDecoratedDescriptor=a("7.0.0-beta.0")`
    export default function _applyDecoratedDescriptor(target, property, decorators, descriptor, context){
        var desc = {};
        Object.keys(descriptor).forEach(function(key){
            desc[key] = descriptor[key];
        });
        desc.enumerable = !!desc.enumerable;
        desc.configurable = !!desc.configurable;
        if ('value' in desc || desc.initializer){
            desc.writable = true;
        }

        desc = decorators.slice().reverse().reduce(function(desc, decorator){
            return decorator(target, property, desc) || desc;
        }, desc);

        if (context && desc.initializer !== void 0){
            desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
            desc.initializer = undefined;
        }

        if (desc.initializer === void 0){
            Object.defineProperty(target, property, desc);
            desc = null;
        }

        return desc;
    }
`,i.classPrivateFieldLooseKey=a("7.0.0-beta.0")`
  var id = 0;
  export default function _classPrivateFieldKey(name) {
    return "__private_" + (id++) + "_" + name;
  }
`,i.classPrivateFieldLooseBase=a("7.0.0-beta.0")`
  export default function _classPrivateFieldBase(receiver, privateKey) {
    if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) {
      throw new TypeError("attempted to use private field on non-instance");
    }
    return receiver;
  }
`,i.classPrivateFieldGet=a("7.0.0-beta.0")`
  import classApplyDescriptorGet from "classApplyDescriptorGet";
  import classExtractFieldDescriptor from "classExtractFieldDescriptor";
  export default function _classPrivateFieldGet(receiver, privateMap) {
    var descriptor = classExtractFieldDescriptor(receiver, privateMap, "get");
    return classApplyDescriptorGet(receiver, descriptor);
  }
`,i.classPrivateFieldSet=a("7.0.0-beta.0")`
  import classApplyDescriptorSet from "classApplyDescriptorSet";
  import classExtractFieldDescriptor from "classExtractFieldDescriptor";
  export default function _classPrivateFieldSet(receiver, privateMap, value) {
    var descriptor = classExtractFieldDescriptor(receiver, privateMap, "set");
    classApplyDescriptorSet(receiver, descriptor, value);
    return value;
  }
`,i.classPrivateFieldDestructureSet=a("7.4.4")`
  import classApplyDescriptorDestructureSet from "classApplyDescriptorDestructureSet";
  import classExtractFieldDescriptor from "classExtractFieldDescriptor";
  export default function _classPrivateFieldDestructureSet(receiver, privateMap) {
    var descriptor = classExtractFieldDescriptor(receiver, privateMap, "set");
    return classApplyDescriptorDestructureSet(receiver, descriptor);
  }
`,i.classExtractFieldDescriptor=a("7.13.10")`
  export default function _classExtractFieldDescriptor(receiver, privateMap, action) {
    if (!privateMap.has(receiver)) {
      throw new TypeError("attempted to " + action + " private field on non-instance");
    }
    return privateMap.get(receiver);
  }
`,i.classStaticPrivateFieldSpecGet=a("7.0.2")`
  import classApplyDescriptorGet from "classApplyDescriptorGet";
  import classCheckPrivateStaticAccess from "classCheckPrivateStaticAccess";
  import classCheckPrivateStaticFieldDescriptor from "classCheckPrivateStaticFieldDescriptor";
  export default function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) {
    classCheckPrivateStaticAccess(receiver, classConstructor);
    classCheckPrivateStaticFieldDescriptor(descriptor, "get");
    return classApplyDescriptorGet(receiver, descriptor);
  }
`,i.classStaticPrivateFieldSpecSet=a("7.0.2")`
  import classApplyDescriptorSet from "classApplyDescriptorSet";
  import classCheckPrivateStaticAccess from "classCheckPrivateStaticAccess";
  import classCheckPrivateStaticFieldDescriptor from "classCheckPrivateStaticFieldDescriptor";
  export default function _classStaticPrivateFieldSpecSet(receiver, classConstructor, descriptor, value) {
    classCheckPrivateStaticAccess(receiver, classConstructor);
    classCheckPrivateStaticFieldDescriptor(descriptor, "set");
    classApplyDescriptorSet(receiver, descriptor, value);
    return value;
  }
`,i.classStaticPrivateMethodGet=a("7.3.2")`
  import classCheckPrivateStaticAccess from "classCheckPrivateStaticAccess";
  export default function _classStaticPrivateMethodGet(receiver, classConstructor, method) {
    classCheckPrivateStaticAccess(receiver, classConstructor);
    return method;
  }
`,i.classStaticPrivateMethodSet=a("7.3.2")`
  export default function _classStaticPrivateMethodSet() {
    throw new TypeError("attempted to set read only static private field");
  }
`,i.classApplyDescriptorGet=a("7.13.10")`
  export default function _classApplyDescriptorGet(receiver, descriptor) {
    if (descriptor.get) {
      return descriptor.get.call(receiver);
    }
    return descriptor.value;
  }
`,i.classApplyDescriptorSet=a("7.13.10")`
  export default function _classApplyDescriptorSet(receiver, descriptor, value) {
    if (descriptor.set) {
      descriptor.set.call(receiver, value);
    } else {
      if (!descriptor.writable) {
        // This should only throw in strict mode, but class bodies are
        // always strict and private fields can only be used inside
        // class bodies.
        throw new TypeError("attempted to set read only private field");
      }
      descriptor.value = value;
    }
  }
`,i.classApplyDescriptorDestructureSet=a("7.13.10")`
  export default function _classApplyDescriptorDestructureSet(receiver, descriptor) {
    if (descriptor.set) {
      if (!("__destrObj" in descriptor)) {
        descriptor.__destrObj = {
          set value(v) {
            descriptor.set.call(receiver, v)
          },
        };
      }
      return descriptor.__destrObj;
    } else {
      if (!descriptor.writable) {
        // This should only throw in strict mode, but class bodies are
        // always strict and private fields can only be used inside
        // class bodies.
        throw new TypeError("attempted to set read only private field");
      }

      return descriptor;
    }
  }
`,i.classStaticPrivateFieldDestructureSet=a("7.13.10")`
  import classApplyDescriptorDestructureSet from "classApplyDescriptorDestructureSet";
  import classCheckPrivateStaticAccess from "classCheckPrivateStaticAccess";
  import classCheckPrivateStaticFieldDescriptor from "classCheckPrivateStaticFieldDescriptor";
  export default function _classStaticPrivateFieldDestructureSet(receiver, classConstructor, descriptor) {
    classCheckPrivateStaticAccess(receiver, classConstructor);
    classCheckPrivateStaticFieldDescriptor(descriptor, "set");
    return classApplyDescriptorDestructureSet(receiver, descriptor);
  }
`,i.classCheckPrivateStaticAccess=a("7.13.10")`
  export default function _classCheckPrivateStaticAccess(receiver, classConstructor) {
    if (receiver !== classConstructor) {
      throw new TypeError("Private static access of wrong provenance");
    }
  }
`,i.classCheckPrivateStaticFieldDescriptor=a("7.13.10")`
  export default function _classCheckPrivateStaticFieldDescriptor(descriptor, action) {
    if (descriptor === undefined) {
      throw new TypeError("attempted to " + action + " private static field before its declaration");
    }
  }
`,i.decorate=a("7.1.5")`
  import toArray from "toArray";
  import toPropertyKey from "toPropertyKey";

  // These comments are stripped by @babel/template
  /*::
  type PropertyDescriptor =
    | {
        value: any,
        writable: boolean,
        configurable: boolean,
        enumerable: boolean,
      }
    | {
        get?: () => any,
        set?: (v: any) => void,
        configurable: boolean,
        enumerable: boolean,
      };

  type FieldDescriptor ={
    writable: boolean,
    configurable: boolean,
    enumerable: boolean,
  };

  type Placement = "static" | "prototype" | "own";
  type Key = string | symbol; // PrivateName is not supported yet.

  type ElementDescriptor =
    | {
        kind: "method",
        key: Key,
        placement: Placement,
        descriptor: PropertyDescriptor
      }
    | {
        kind: "field",
        key: Key,
        placement: Placement,
        descriptor: FieldDescriptor,
        initializer?: () => any,
      };

  // This is exposed to the user code
  type ElementObjectInput = ElementDescriptor & {
    [@@toStringTag]?: "Descriptor"
  };

  // This is exposed to the user code
  type ElementObjectOutput = ElementDescriptor & {
    [@@toStringTag]?: "Descriptor"
    extras?: ElementDescriptor[],
    finisher?: ClassFinisher,
  };

  // This is exposed to the user code
  type ClassObject = {
    [@@toStringTag]?: "Descriptor",
    kind: "class",
    elements: ElementDescriptor[],
  };

  type ElementDecorator = (descriptor: ElementObjectInput) => ?ElementObjectOutput;
  type ClassDecorator = (descriptor: ClassObject) => ?ClassObject;
  type ClassFinisher = <A, B>(cl: Class<A>) => Class<B>;

  // Only used by Babel in the transform output, not part of the spec.
  type ElementDefinition =
    | {
        kind: "method",
        value: any,
        key: Key,
        static?: boolean,
        decorators?: ElementDecorator[],
      }
    | {
        kind: "field",
        value: () => any,
        key: Key,
        static?: boolean,
        decorators?: ElementDecorator[],
    };

  declare function ClassFactory<C>(initialize: (instance: C) => void): {
    F: Class<C>,
    d: ElementDefinition[]
  }

  */

  /*::
  // Various combinations with/without extras and with one or many finishers

  type ElementFinisherExtras = {
    element: ElementDescriptor,
    finisher?: ClassFinisher,
    extras?: ElementDescriptor[],
  };

  type ElementFinishersExtras = {
    element: ElementDescriptor,
    finishers: ClassFinisher[],
    extras: ElementDescriptor[],
  };

  type ElementsFinisher = {
    elements: ElementDescriptor[],
    finisher?: ClassFinisher,
  };

  type ElementsFinishers = {
    elements: ElementDescriptor[],
    finishers: ClassFinisher[],
  };

  */

  /*::

  type Placements = {
    static: Key[],
    prototype: Key[],
    own: Key[],
  };

  */

  // ClassDefinitionEvaluation (Steps 26-*)
  export default function _decorate(
    decorators /*: ClassDecorator[] */,
    factory /*: ClassFactory */,
    superClass /*: ?Class<*> */,
    mixins /*: ?Array<Function> */,
  ) /*: Class<*> */ {
    var api = _getDecoratorsApi();
    if (mixins) {
      for (var i = 0; i < mixins.length; i++) {
        api = mixins[i](api);
      }
    }

    var r = factory(function initialize(O) {
      api.initializeInstanceElements(O, decorated.elements);
    }, superClass);
    var decorated = api.decorateClass(
      _coalesceClassElements(r.d.map(_createElementDescriptor)),
      decorators,
    );

    api.initializeClassElements(r.F, decorated.elements);

    return api.runClassFinishers(r.F, decorated.finishers);
  }

  function _getDecoratorsApi() {
    _getDecoratorsApi = function() {
      return api;
    };

    var api = {
      elementsDefinitionOrder: [["method"], ["field"]],

      // InitializeInstanceElements
      initializeInstanceElements: function(
        /*::<C>*/ O /*: C */,
        elements /*: ElementDescriptor[] */,
      ) {
        ["method", "field"].forEach(function(kind) {
          elements.forEach(function(element /*: ElementDescriptor */) {
            if (element.kind === kind && element.placement === "own") {
              this.defineClassElement(O, element);
            }
          }, this);
        }, this);
      },

      // InitializeClassElements
      initializeClassElements: function(
        /*::<C>*/ F /*: Class<C> */,
        elements /*: ElementDescriptor[] */,
      ) {
        var proto = F.prototype;

        ["method", "field"].forEach(function(kind) {
          elements.forEach(function(element /*: ElementDescriptor */) {
            var placement = element.placement;
            if (
              element.kind === kind &&
              (placement === "static" || placement === "prototype")
            ) {
              var receiver = placement === "static" ? F : proto;
              this.defineClassElement(receiver, element);
            }
          }, this);
        }, this);
      },

      // DefineClassElement
      defineClassElement: function(
        /*::<C>*/ receiver /*: C | Class<C> */,
        element /*: ElementDescriptor */,
      ) {
        var descriptor /*: PropertyDescriptor */ = element.descriptor;
        if (element.kind === "field") {
          var initializer = element.initializer;
          descriptor = {
            enumerable: descriptor.enumerable,
            writable: descriptor.writable,
            configurable: descriptor.configurable,
            value: initializer === void 0 ? void 0 : initializer.call(receiver),
          };
        }
        Object.defineProperty(receiver, element.key, descriptor);
      },

      // DecorateClass
      decorateClass: function(
        elements /*: ElementDescriptor[] */,
        decorators /*: ClassDecorator[] */,
      ) /*: ElementsFinishers */ {
        var newElements /*: ElementDescriptor[] */ = [];
        var finishers /*: ClassFinisher[] */ = [];
        var placements /*: Placements */ = {
          static: [],
          prototype: [],
          own: [],
        };

        elements.forEach(function(element /*: ElementDescriptor */) {
          this.addElementPlacement(element, placements);
        }, this);

        elements.forEach(function(element /*: ElementDescriptor */) {
          if (!_hasDecorators(element)) return newElements.push(element);

          var elementFinishersExtras /*: ElementFinishersExtras */ = this.decorateElement(
            element,
            placements,
          );
          newElements.push(elementFinishersExtras.element);
          newElements.push.apply(newElements, elementFinishersExtras.extras);
          finishers.push.apply(finishers, elementFinishersExtras.finishers);
        }, this);

        if (!decorators) {
          return { elements: newElements, finishers: finishers };
        }

        var result /*: ElementsFinishers */ = this.decorateConstructor(
          newElements,
          decorators,
        );
        finishers.push.apply(finishers, result.finishers);
        result.finishers = finishers;

        return result;
      },

      // AddElementPlacement
      addElementPlacement: function(
        element /*: ElementDescriptor */,
        placements /*: Placements */,
        silent /*: boolean */,
      ) {
        var keys = placements[element.placement];
        if (!silent && keys.indexOf(element.key) !== -1) {
          throw new TypeError("Duplicated element (" + element.key + ")");
        }
        keys.push(element.key);
      },

      // DecorateElement
      decorateElement: function(
        element /*: ElementDescriptor */,
        placements /*: Placements */,
      ) /*: ElementFinishersExtras */ {
        var extras /*: ElementDescriptor[] */ = [];
        var finishers /*: ClassFinisher[] */ = [];

        for (
          var decorators = element.decorators, i = decorators.length - 1;
          i >= 0;
          i--
        ) {
          // (inlined) RemoveElementPlacement
          var keys = placements[element.placement];
          keys.splice(keys.indexOf(element.key), 1);

          var elementObject /*: ElementObjectInput */ = this.fromElementDescriptor(
            element,
          );
          var elementFinisherExtras /*: ElementFinisherExtras */ = this.toElementFinisherExtras(
            (0, decorators[i])(elementObject) /*: ElementObjectOutput */ ||
              elementObject,
          );

          element = elementFinisherExtras.element;
          this.addElementPlacement(element, placements);

          if (elementFinisherExtras.finisher) {
            finishers.push(elementFinisherExtras.finisher);
          }

          var newExtras /*: ElementDescriptor[] | void */ =
            elementFinisherExtras.extras;
          if (newExtras) {
            for (var j = 0; j < newExtras.length; j++) {
              this.addElementPlacement(newExtras[j], placements);
            }
            extras.push.apply(extras, newExtras);
          }
        }

        return { element: element, finishers: finishers, extras: extras };
      },

      // DecorateConstructor
      decorateConstructor: function(
        elements /*: ElementDescriptor[] */,
        decorators /*: ClassDecorator[] */,
      ) /*: ElementsFinishers */ {
        var finishers /*: ClassFinisher[] */ = [];

        for (var i = decorators.length - 1; i >= 0; i--) {
          var obj /*: ClassObject */ = this.fromClassDescriptor(elements);
          var elementsAndFinisher /*: ElementsFinisher */ = this.toClassDescriptor(
            (0, decorators[i])(obj) /*: ClassObject */ || obj,
          );

          if (elementsAndFinisher.finisher !== undefined) {
            finishers.push(elementsAndFinisher.finisher);
          }

          if (elementsAndFinisher.elements !== undefined) {
            elements = elementsAndFinisher.elements;

            for (var j = 0; j < elements.length - 1; j++) {
              for (var k = j + 1; k < elements.length; k++) {
                if (
                  elements[j].key === elements[k].key &&
                  elements[j].placement === elements[k].placement
                ) {
                  throw new TypeError(
                    "Duplicated element (" + elements[j].key + ")",
                  );
                }
              }
            }
          }
        }

        return { elements: elements, finishers: finishers };
      },

      // FromElementDescriptor
      fromElementDescriptor: function(
        element /*: ElementDescriptor */,
      ) /*: ElementObject */ {
        var obj /*: ElementObject */ = {
          kind: element.kind,
          key: element.key,
          placement: element.placement,
          descriptor: element.descriptor,
        };

        var desc = {
          value: "Descriptor",
          configurable: true,
        };
        Object.defineProperty(obj, Symbol.toStringTag, desc);

        if (element.kind === "field") obj.initializer = element.initializer;

        return obj;
      },

      // ToElementDescriptors
      toElementDescriptors: function(
        elementObjects /*: ElementObject[] */,
      ) /*: ElementDescriptor[] */ {
        if (elementObjects === undefined) return;
        return toArray(elementObjects).map(function(elementObject) {
          var element = this.toElementDescriptor(elementObject);
          this.disallowProperty(elementObject, "finisher", "An element descriptor");
          this.disallowProperty(elementObject, "extras", "An element descriptor");
          return element;
        }, this);
      },

      // ToElementDescriptor
      toElementDescriptor: function(
        elementObject /*: ElementObject */,
      ) /*: ElementDescriptor */ {
        var kind = String(elementObject.kind);
        if (kind !== "method" && kind !== "field") {
          throw new TypeError(
            'An element descriptor\\'s .kind property must be either "method" or' +
              ' "field", but a decorator created an element descriptor with' +
              ' .kind "' +
              kind +
              '"',
          );
        }

        var key = toPropertyKey(elementObject.key);

        var placement = String(elementObject.placement);
        if (
          placement !== "static" &&
          placement !== "prototype" &&
          placement !== "own"
        ) {
          throw new TypeError(
            'An element descriptor\\'s .placement property must be one of "static",' +
              ' "prototype" or "own", but a decorator created an element descriptor' +
              ' with .placement "' +
              placement +
              '"',
          );
        }

        var descriptor /*: PropertyDescriptor */ = elementObject.descriptor;

        this.disallowProperty(elementObject, "elements", "An element descriptor");

        var element /*: ElementDescriptor */ = {
          kind: kind,
          key: key,
          placement: placement,
          descriptor: Object.assign({}, descriptor),
        };

        if (kind !== "field") {
          this.disallowProperty(elementObject, "initializer", "A method descriptor");
        } else {
          this.disallowProperty(
            descriptor,
            "get",
            "The property descriptor of a field descriptor",
          );
          this.disallowProperty(
            descriptor,
            "set",
            "The property descriptor of a field descriptor",
          );
          this.disallowProperty(
            descriptor,
            "value",
            "The property descriptor of a field descriptor",
          );

          element.initializer = elementObject.initializer;
        }

        return element;
      },

      toElementFinisherExtras: function(
        elementObject /*: ElementObject */,
      ) /*: ElementFinisherExtras */ {
        var element /*: ElementDescriptor */ = this.toElementDescriptor(
          elementObject,
        );
        var finisher /*: ClassFinisher */ = _optionalCallableProperty(
          elementObject,
          "finisher",
        );
        var extras /*: ElementDescriptors[] */ = this.toElementDescriptors(
          elementObject.extras,
        );

        return { element: element, finisher: finisher, extras: extras };
      },

      // FromClassDescriptor
      fromClassDescriptor: function(
        elements /*: ElementDescriptor[] */,
      ) /*: ClassObject */ {
        var obj = {
          kind: "class",
          elements: elements.map(this.fromElementDescriptor, this),
        };

        var desc = { value: "Descriptor", configurable: true };
        Object.defineProperty(obj, Symbol.toStringTag, desc);

        return obj;
      },

      // ToClassDescriptor
      toClassDescriptor: function(
        obj /*: ClassObject */,
      ) /*: ElementsFinisher */ {
        var kind = String(obj.kind);
        if (kind !== "class") {
          throw new TypeError(
            'A class descriptor\\'s .kind property must be "class", but a decorator' +
              ' created a class descriptor with .kind "' +
              kind +
              '"',
          );
        }

        this.disallowProperty(obj, "key", "A class descriptor");
        this.disallowProperty(obj, "placement", "A class descriptor");
        this.disallowProperty(obj, "descriptor", "A class descriptor");
        this.disallowProperty(obj, "initializer", "A class descriptor");
        this.disallowProperty(obj, "extras", "A class descriptor");

        var finisher = _optionalCallableProperty(obj, "finisher");
        var elements = this.toElementDescriptors(obj.elements);

        return { elements: elements, finisher: finisher };
      },

      // RunClassFinishers
      runClassFinishers: function(
        constructor /*: Class<*> */,
        finishers /*: ClassFinisher[] */,
      ) /*: Class<*> */ {
        for (var i = 0; i < finishers.length; i++) {
          var newConstructor /*: ?Class<*> */ = (0, finishers[i])(constructor);
          if (newConstructor !== undefined) {
            // NOTE: This should check if IsConstructor(newConstructor) is false.
            if (typeof newConstructor !== "function") {
              throw new TypeError("Finishers must return a constructor.");
            }
            constructor = newConstructor;
          }
        }
        return constructor;
      },

      disallowProperty: function(obj, name, objectType) {
        if (obj[name] !== undefined) {
          throw new TypeError(objectType + " can't have a ." + name + " property.");
        }
      }
    };

    return api;
  }

  // ClassElementEvaluation
  function _createElementDescriptor(
    def /*: ElementDefinition */,
  ) /*: ElementDescriptor */ {
    var key = toPropertyKey(def.key);

    var descriptor /*: PropertyDescriptor */;
    if (def.kind === "method") {
      descriptor = {
        value: def.value,
        writable: true,
        configurable: true,
        enumerable: false,
      };
    } else if (def.kind === "get") {
      descriptor = { get: def.value, configurable: true, enumerable: false };
    } else if (def.kind === "set") {
      descriptor = { set: def.value, configurable: true, enumerable: false };
    } else if (def.kind === "field") {
      descriptor = { configurable: true, writable: true, enumerable: true };
    }

    var element /*: ElementDescriptor */ = {
      kind: def.kind === "field" ? "field" : "method",
      key: key,
      placement: def.static
        ? "static"
        : def.kind === "field"
        ? "own"
        : "prototype",
      descriptor: descriptor,
    };
    if (def.decorators) element.decorators = def.decorators;
    if (def.kind === "field") element.initializer = def.value;

    return element;
  }

  // CoalesceGetterSetter
  function _coalesceGetterSetter(
    element /*: ElementDescriptor */,
    other /*: ElementDescriptor */,
  ) {
    if (element.descriptor.get !== undefined) {
      other.descriptor.get = element.descriptor.get;
    } else {
      other.descriptor.set = element.descriptor.set;
    }
  }

  // CoalesceClassElements
  function _coalesceClassElements(
    elements /*: ElementDescriptor[] */,
  ) /*: ElementDescriptor[] */ {
    var newElements /*: ElementDescriptor[] */ = [];

    var isSameElement = function(
      other /*: ElementDescriptor */,
    ) /*: boolean */ {
      return (
        other.kind === "method" &&
        other.key === element.key &&
        other.placement === element.placement
      );
    };

    for (var i = 0; i < elements.length; i++) {
      var element /*: ElementDescriptor */ = elements[i];
      var other /*: ElementDescriptor */;

      if (
        element.kind === "method" &&
        (other = newElements.find(isSameElement))
      ) {
        if (
          _isDataDescriptor(element.descriptor) ||
          _isDataDescriptor(other.descriptor)
        ) {
          if (_hasDecorators(element) || _hasDecorators(other)) {
            throw new ReferenceError(
              "Duplicated methods (" + element.key + ") can't be decorated.",
            );
          }
          other.descriptor = element.descriptor;
        } else {
          if (_hasDecorators(element)) {
            if (_hasDecorators(other)) {
              throw new ReferenceError(
                "Decorators can't be placed on different accessors with for " +
                  "the same property (" +
                  element.key +
                  ").",
              );
            }
            other.decorators = element.decorators;
          }
          _coalesceGetterSetter(element, other);
        }
      } else {
        newElements.push(element);
      }
    }

    return newElements;
  }

  function _hasDecorators(element /*: ElementDescriptor */) /*: boolean */ {
    return element.decorators && element.decorators.length;
  }

  function _isDataDescriptor(desc /*: PropertyDescriptor */) /*: boolean */ {
    return (
      desc !== undefined &&
      !(desc.value === undefined && desc.writable === undefined)
    );
  }

  function _optionalCallableProperty /*::<T>*/(
    obj /*: T */,
    name /*: $Keys<T> */,
  ) /*: ?Function */ {
    var value = obj[name];
    if (value !== undefined && typeof value !== "function") {
      throw new TypeError("Expected '" + name + "' to be a function");
    }
    return value;
  }

`,i.classPrivateMethodGet=a("7.1.6")`
  export default function _classPrivateMethodGet(receiver, privateSet, fn) {
    if (!privateSet.has(receiver)) {
      throw new TypeError("attempted to get private field on non-instance");
    }
    return fn;
  }
`,i.checkPrivateRedeclaration=a("7.14.1")`
  export default function _checkPrivateRedeclaration(obj, privateCollection) {
    if (privateCollection.has(obj)) {
      throw new TypeError("Cannot initialize the same private elements twice on an object");
    }
  }
`,i.classPrivateFieldInitSpec=a("7.14.1")`
  import checkPrivateRedeclaration from "checkPrivateRedeclaration";

  export default function _classPrivateFieldInitSpec(obj, privateMap, value) {
    checkPrivateRedeclaration(obj, privateMap);
    privateMap.set(obj, value);
  }
`,i.classPrivateMethodInitSpec=a("7.14.1")`
  import checkPrivateRedeclaration from "checkPrivateRedeclaration";

  export default function _classPrivateMethodInitSpec(obj, privateSet) {
    checkPrivateRedeclaration(obj, privateSet);
    privateSet.add(obj);
  }
`,i.classPrivateMethodSet=a("7.1.6")`
    export default function _classPrivateMethodSet() {
      throw new TypeError("attempted to reassign private method");
    }
//# sourceMappingURL=970.3aa2a4ce.js.map