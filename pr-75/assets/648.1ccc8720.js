/*! For license information please see 648.1ccc8720.js.LICENSE.txt */
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
  `(n))]);var n}function P(e){const t=v("babelHelpers"),r=[];r.push(w("var",[_(t,E([]))]));const n=x(r);return F(r,t,e),r.push(y(t)),n}function F(e,t,r){const s=e=>t?D(t,v(e)):v(`_${e}`),i={};return n().list.forEach((function(t){if(r&&r.indexOf(t)<0)return;const a=i[t]=s(t);n().ensure(t,o.default);const{nodes:u}=n().get(t,s,a);e.push(...u)})),i}},"../../node_modules/@babel/core/lib/transform-ast.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/gensync/index.js");return n=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.transformFromAstSync=t.transformFromAstAsync=t.transformFromAst=void 0;var s=r("../../node_modules/@babel/core/lib/config/index.js"),i=r("../../node_modules/@babel/core/lib/transformation/index.js");const a=n()((function*(e,t,r){const n=yield*(0,s.default)(r);if(null===n)return null;if(!e)throw new Error("No AST given");return yield*(0,i.run)(n,t,e)}));t.transformFromAst=function(e,t,r,n){let s,i;if("function"==typeof r?(i=r,s=void 0):(s=r,i=n),void 0===i)return a.sync(e,t,s);a.errback(e,t,s,i)};const o=a.sync;t.transformFromAstSync=o;const u=a.async;t.transformFromAstAsync=u},"../../node_modules/@babel/core/lib/transform-file-browser.js":(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.transformFile=void 0,t.transformFileAsync=function(){return Promise.reject(new Error("Transforming files is not supported in browsers"))},t.transformFileSync=function(){throw new Error("Transforming files is not supported in browsers")},t.transformFile=function(e,t,r){"function"==typeof t&&(r=t),r(new Error("Transforming files is not supported in browsers"),null)}},"../../node_modules/@babel/core/lib/transform.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/gensync/index.js");return n=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.transformSync=t.transformAsync=t.transform=void 0;var s=r("../../node_modules/@babel/core/lib/config/index.js"),i=r("../../node_modules/@babel/core/lib/transformation/index.js");const a=n()((function*(e,t){const r=yield*(0,s.default)(t);return null===r?null:yield*(0,i.run)(r,e)}));t.transform=function(e,t,r){let n,s;if("function"==typeof t?(s=t,n=void 0):(n=t,s=r),void 0===s)return a.sync(e,n);a.errback(e,n,s)};const o=a.sync;t.transformSync=o;const u=a.async;t.transformAsync=u},"../../node_modules/@babel/core/lib/transformation/block-hoist-plugin.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/@babel/traverse/lib/index.js");return n=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(){return i||(i=new s.default(Object.assign({},o,{visitor:n().default.explode(o.visitor)}),{})),i};var s=r("../../node_modules/@babel/core/lib/config/plugin.js");let i;function a(e){const t=null==e?void 0:e._blockHoist;return null==t?1:!0===t?2:t}const o={name:"internal.blockHoist",visitor:{Block:{exit(e){let{node:t}=e;const{body:r}=t;let n=Math.pow(2,30)-1,s=!1;for(let e=0;e<r.length;e++){const t=a(r[e]);if(t>n){s=!0;break}n=t}s&&(t.body=function(e){const t=Object.create(null);for(let r=0;r<e.length;r++){const n=e[r],s=a(n);(t[s]||(t[s]=[])).push(n)}const r=Object.keys(t).map((e=>+e)).sort(((e,t)=>t-e));let n=0;for(const s of r){const r=t[s];for(const t of r)e[n++]=t}return e}(r.slice()))}}}}},"../../node_modules/@babel/core/lib/transformation/file/file.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/@babel/helpers/lib/index.js");return n=function(){return e},e}function s(){const e=r("../../node_modules/@babel/traverse/lib/index.js");return s=function(){return e},e}function i(){const e=r("../../node_modules/@babel/code-frame/lib/index.js");return i=function(){return e},e}function a(){const e=r("../../node_modules/@babel/types/lib/index.js");return a=function(){return e},e}function o(){const e=r("../../node_modules/@babel/helper-module-transforms/lib/index.js");return o=function(){return e},e}function u(){const e=r("../../node_modules/semver/semver.js");return u=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;const{cloneNode:l,interpreterDirective:c}=a(),p={enter(e,t){const r=e.node.loc;r&&(t.loc=r,e.stop())}};class d{constructor(e,t){let{code:r,ast:n,inputMap:i}=t;this._map=new Map,this.opts=void 0,this.declarations={},this.path=void 0,this.ast=void 0,this.scope=void 0,this.metadata={},this.code="",this.inputMap=void 0,this.hub={file:this,getCode:()=>this.code,getScope:()=>this.scope,addHelper:this.addHelper.bind(this),buildError:this.buildCodeFrameError.bind(this)},this.opts=e,this.code=r,this.ast=n,this.inputMap=i,this.path=s().NodePath.get({hub:this.hub,parentPath:null,parent:this.ast,container:this.ast,key:"program"}).setContext(),this.scope=this.path.scope}get shebang(){const{interpreter:e}=this.path.node;return e?e.value:""}set shebang(e){e?this.path.get("interpreter").replaceWith(c(e)):this.path.get("interpreter").remove()}set(e,t){if("helpersNamespace"===e)throw new Error("Babel 7.0.0-beta.56 has dropped support for the 'helpersNamespace' utility.If you are using @babel/plugin-external-helpers you will need to use a newer version than the one you currently have installed. If you have your own implementation, you'll want to explore using 'helperGenerator' alongside 'file.availableHelper()'.");this._map.set(e,t)}get(e){return this._map.get(e)}has(e){return this._map.has(e)}getModuleName(){return(0,o().getModuleName)(this.opts,this.opts)}addImport(){throw new Error("This API has been removed. If you're looking for this functionality in Babel 7, you should import the '@babel/helper-module-imports' module and use the functions exposed  from that module, such as 'addNamed' or 'addDefault'.")}availableHelper(e,t){let r;try{r=n().minVersion(e)}catch(e){if("BABEL_HELPER_UNKNOWN"!==e.code)throw e;return!1}return"string"!=typeof t||(u().valid(t)&&(t=`^${t}`),!u().intersects(`<${r}`,t)&&!u().intersects(">=8.0.0",t))}addHelper(e){const t=this.declarations[e];if(t)return l(t);const r=this.get("helperGenerator");if(r){const t=r(e);if(t)return t}n().ensure(e,d);const s=this.declarations[e]=this.scope.generateUidIdentifier(e),i={};for(const t of n().getDependencies(e))i[t]=this.addHelper(t);const{nodes:a,globals:o}=n().get(e,(e=>i[e]),s,Object.keys(this.scope.getAllBindings()));return o.forEach((e=>{this.path.scope.hasBinding(e,!0)&&this.path.scope.rename(e)})),a.forEach((e=>{e._compact=!0})),this.path.unshiftContainer("body",a),this.path.get("body").forEach((e=>{-1!==a.indexOf(e.node)&&e.isVariableDeclaration()&&this.scope.registerDeclaration(e)})),s}addTemplateObject(){throw new Error("This function has been moved into the template literal transform itself.")}buildCodeFrameError(e,t){let r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:SyntaxError,n=e&&(e.loc||e._loc);if(!n&&e){const r={loc:null};(0,s().default)(e,p,this.scope,r),n=r.loc;let i="This is an error on an internal node. Probably an internal error.";n&&(i+=" Location has been estimated."),t+=` (${i})`}if(n){const{highlightCode:e=!0}=this.opts;t+="\n"+(0,i().codeFrameColumns)(this.code,{start:{line:n.start.line,column:n.start.column+1},end:n.end&&n.start.line===n.end.line?{line:n.end.line,column:n.end.column+1}:void 0},{highlightCode:e})}return new r(t)}}t.default=d},"../../node_modules/@babel/core/lib/transformation/file/generate.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/convert-source-map/index.js");return n=function(){return e},e}function s(){const e=r("../../node_modules/@babel/generator/lib/index.js");return s=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t){const{opts:r,ast:a,code:o,inputMap:u}=t,{generatorOpts:l}=r,c=[];for(const t of e)for(const e of t){const{generatorOverride:t}=e;if(t){const e=t(a,l,o,s().default);void 0!==e&&c.push(e)}}let p;if(0===c.length)p=(0,s().default)(a,l,o);else{if(1!==c.length)throw new Error("More than one plugin attempted to override codegen.");if(p=c[0],"function"==typeof p.then)throw new Error("You appear to be using an async codegen plugin, which your current version of Babel does not support. If you're using a published plugin, you may need to upgrade your @babel/core version.")}let{code:d,decodedMap:h=p.map}=p;return h&&(h=u?(0,i.default)(u.toObject(),h,l.sourceFileName):p.map),"inline"!==r.sourceMaps&&"both"!==r.sourceMaps||(d+="\n"+n().fromObject(h).toComment()),"inline"===r.sourceMaps&&(h=null),{outputCode:d,outputMap:h}};var i=r("../../node_modules/@babel/core/lib/transformation/file/merge-map.js")},"../../node_modules/@babel/core/lib/transformation/file/merge-map.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/@ampproject/remapping/dist/remapping.mjs");return n=function(){return e},e}function s(e){return Object.assign({},e,{sourceRoot:null})}Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t,r){const i=r.replace(/\\/g,"/");let a=!1;const o=n()(s(t),((t,r)=>t!==i||a?null:(a=!0,r.source="",s(e))));return"string"==typeof e.sourceRoot&&(o.sourceRoot=e.sourceRoot),Object.assign({},o)}},"../../node_modules/@babel/core/lib/transformation/index.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/@babel/traverse/lib/index.js");return n=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.run=function*(e,t,r){const p=yield*(0,o.default)(e.passes,(0,a.default)(e),t,r),d=p.opts;try{yield*function*(e,t){for(const r of t){const t=[],a=[],o=[];for(const n of r.concat([(0,i.default)()])){const r=new s.default(e,n.key,n.options);t.push([n,r]),a.push(r),o.push(n.visitor)}for(const[r,n]of t){const t=r.pre;if(t){const r=t.call(n,e);if(yield*[],c(r))throw new Error("You appear to be using an plugin with an async .pre, which your current version of Babel does not support. If you're using a published plugin, you may need to upgrade your @babel/core version.")}}const u=n().default.visitors.merge(o,a,e.opts.wrapPluginVisitorMethod);(0,n().default)(e.ast,u,e.scope);for(const[r,n]of t){const t=r.post;if(t){const r=t.call(n,e);if(yield*[],c(r))throw new Error("You appear to be using an plugin with an async .post, which your current version of Babel does not support. If you're using a published plugin, you may need to upgrade your @babel/core version.")}}}}(p,e.passes)}catch(e){var h;throw e.message=`${null!=(h=d.filename)?h:"unknown"}: ${e.message}`,e.code||(e.code="BABEL_TRANSFORM_ERROR"),e}let m,f;try{!1!==d.code&&({outputCode:m,outputMap:f}=(0,u.default)(e.passes,p))}catch(e){var g;throw e.message=`${null!=(g=d.filename)?g:"unknown"}: ${e.message}`,e.code||(e.code="BABEL_GENERATE_ERROR"),e}return{metadata:p.metadata,options:d,ast:!0===d.ast?p.ast:null,code:void 0===m?null:m,map:void 0===f?null:f,sourceType:p.ast.program.sourceType,externalDependencies:(0,l.flattenToSet)(e.externalDependencies)}};var s=r("../../node_modules/@babel/core/lib/transformation/plugin-pass.js"),i=r("../../node_modules/@babel/core/lib/transformation/block-hoist-plugin.js"),a=r("../../node_modules/@babel/core/lib/transformation/normalize-opts.js"),o=r("../../node_modules/@babel/core/lib/transformation/normalize-file.js"),u=r("../../node_modules/@babel/core/lib/transformation/file/generate.js"),l=r("../../node_modules/@babel/core/lib/config/helpers/deep-array.js");function c(e){return!(!e||"object"!=typeof e&&"function"!=typeof e||!e.then||"function"!=typeof e.then)}},"../../node_modules/@babel/core/lib/transformation/normalize-file.js":(e,t,r)=>{"use strict";function n(){const e=r("../../browser-shims/fs.js");return n=function(){return e},e}function s(){const e=r("../../node_modules/path-browserify/index.js");return s=function(){return e},e}function i(){const e=r("../../node_modules/debug/src/browser.js");return i=function(){return e},e}function a(){const e=r("../../node_modules/@babel/types/lib/index.js");return a=function(){return e},e}function o(){const e=r("../../node_modules/convert-source-map/index.js");return o=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.default=function*(e,t,r,i){if(r=`${r||""}`,i){if("Program"===i.type)i=p(i,[],[]);else if("File"!==i.type)throw new Error("AST root must be a Program or File node");t.cloneInputAst&&(i=(0,c.default)(i))}else i=yield*(0,l.default)(e,t,r);let a=null;if(!1!==t.inputSourceMap){if("object"==typeof t.inputSourceMap&&(a=o().fromObject(t.inputSourceMap)),!a){const e=y(m,i);if(e)try{a=o().fromComment(e)}catch(e){h("discarding unknown inline input sourcemap",e)}}if(!a){const e=y(f,i);if("string"==typeof t.filename&&e)try{const r=f.exec(e),i=n().readFileSync(s().resolve(s().dirname(t.filename),r[1]));i.length>3e6?h("skip merging input map > 1 MB"):a=o().fromJSON(i)}catch(e){h("discarding unknown file input sourcemap",e)}else e&&h("discarding un-loadable file input sourcemap")}}return new u.default(t,{code:r,ast:i,inputMap:a})};var u=r("../../node_modules/@babel/core/lib/transformation/file/file.js"),l=r("../../node_modules/@babel/core/lib/parser/index.js"),c=r("../../node_modules/@babel/core/lib/transformation/util/clone-deep.js");const{file:p,traverseFast:d}=a(),h=i()("babel:transform:file"),m=/^[@#]\s+sourceMappingURL=data:(?:application|text)\/json;(?:charset[:=]\S+?;)?base64,(?:.*)$/,f=/^[@#][ \t]+sourceMappingURL=([^\s'"`]+)[ \t]*$/;function g(e,t,r){return t&&(t=t.filter((t=>{let{value:n}=t;return!e.test(n)||(r=n,!1)}))),[t,r]}function y(e,t){let r=null;return d(t,(t=>{[t.leadingComments,r]=g(e,t.leadingComments,r),[t.innerComments,r]=g(e,t.innerComments,r),[t.trailingComments,r]=g(e,t.trailingComments,r)})),r}},"../../node_modules/@babel/core/lib/transformation/normalize-opts.js":(e,t,r)=>{"use strict";function n(){const e=r("../../node_modules/path-browserify/index.js");return n=function(){return e},e}Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){const{filename:t,cwd:r,filenameRelative:s=("string"==typeof t?n().relative(r,t):"unknown"),sourceType:i="module",inputSourceMap:a,sourceMaps:o=!!a,sourceRoot:u=e.options.moduleRoot,sourceFileName:l=n().basename(s),comments:c=!0,compact:p="auto"}=e.options,d=e.options,h=Object.assign({},d,{parserOpts:Object.assign({sourceType:".mjs"===n().extname(s)?"module":i,sourceFileName:t,plugins:[]},d.parserOpts),generatorOpts:Object.assign({filename:t,auxiliaryCommentBefore:d.auxiliaryCommentBefore,auxiliaryCommentAfter:d.auxiliaryCommentAfter,retainLines:d.retainLines,comments:c,shouldPrintComment:d.shouldPrintComment,compact:p,minified:d.minified,sourceMaps:o,sourceRoot:u,sourceFileName:l},d.generatorOpts)});for(const t of e.passes)for(const e of t)e.manipulateOptions&&e.manipulateOptions(h,h.parserOpts);return h}},"../../node_modules/@babel/core/lib/transformation/plugin-pass.js":(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;class r{constructor(e,t,r){this._map=new Map,this.key=void 0,this.file=void 0,this.opts=void 0,this.cwd=void 0,this.filename=void 0,this.key=t,this.file=e,this.opts=r||{},this.cwd=e.opts.cwd,this.filename=e.opts.filename}set(e,t){this._map.set(e,t)}get(e){return this._map.get(e)}availableHelper(e,t){return this.file.availableHelper(e,t)}addHelper(e){return this.file.addHelper(e)}addImport(){return this.file.addImport()}buildCodeFrameError(e,t,r){return this.file.buildCodeFrameError(e,t,r)}}t.default=r,r.prototype.getModuleName=function(){return this.file.getModuleName()}},"../../node_modules/@babel/core/lib/transformation/util/clone-deep.js":(e,t)=>{"use strict";function r(e,t){if(null!==e){if(t.has(e))return t.get(e);let n;if(Array.isArray(e)){n=new Array(e.length);for(let s=0;s<e.length;s++)n[s]="object"!=typeof e[s]?e[s]:r(e[s],t)}else{n={};const s=Object.keys(e);for(let i=0;i<s.length;i++){const a=s[i];n[a]="object"!=typeof e[a]?e[a]:r(e[a],t)}}return t.set(e,n),n}return e}Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){return"object"!=typeof e?e:r(e,new Map)}},"../../node_modules/@babel/helper-compilation-targets/lib/debug.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.getInclusionReasons=function(e,t,r){const a=r[e]||{};return Object.keys(t).reduce(((e,r)=>{const o=(0,i.getLowestImplementedVersion)(a,r),u=t[r];if(o){const t=(0,i.isUnreleasedVersion)(o,r);(0,i.isUnreleasedVersion)(u,r)||!t&&!n.lt(u.toString(),(0,i.semverify)(o))||(e[r]=(0,s.prettifyVersion)(u))}else e[r]=(0,s.prettifyVersion)(u);return e}),{})};var n=r("../../node_modules/semver/semver.js"),s=r("../../node_modules/@babel/helper-compilation-targets/lib/pretty.js"),i=r("../../node_modules/@babel/helper-compilation-targets/lib/utils.js")},"../../node_modules/@babel/helper-compilation-targets/lib/filter-items.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t,r,n,s,i,a){const u=new Set,l={compatData:e,includes:t,excludes:r};for(const t in e)if(o(t,n,l))u.add(t);else if(a){const e=a.get(t);e&&u.add(e)}return s&&s.forEach((e=>!r.has(e)&&u.add(e))),i&&i.forEach((e=>!t.has(e)&&u.delete(e))),u},t.isRequired=o,t.targetsSupported=a;var n=r("../../node_modules/semver/semver.js"),s=r("../../node_modules/@babel/compat-data/plugins.js"),i=r("../../node_modules/@babel/helper-compilation-targets/lib/utils.js");function a(e,t){const r=Object.keys(e);return 0!==r.length&&0===r.filter((r=>{const s=(0,i.getLowestImplementedVersion)(t,r);if(!s)return!0;const a=e[r];if((0,i.isUnreleasedVersion)(a,r))return!1;if((0,i.isUnreleasedVersion)(s,r))return!0;if(!n.valid(a.toString()))throw new Error(`Invalid version passed for target "${r}": "${a}". Versions must be in semver format (major.minor.patch)`);return n.gt((0,i.semverify)(s),a.toString())})).length}function o(e,t){let{compatData:r=s,includes:n,excludes:i}=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return!(null!=i&&i.has(e)||(null==n||!n.has(e))&&a(t,r[e]))}},"../../node_modules/@babel/helper-compilation-targets/lib/index.js":(e,t,r)=>{"use strict";var n=r("../../browser-shims/process.js");Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"TargetNames",{enumerable:!0,get:function(){return l.TargetNames}}),t.default=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};var r,n;let{browsers:i,esmodules:a}=e;const{configPath:u="."}=t;y(i);const l=x(e);let c=f(l);const p=!!i,d=p||Object.keys(c).length>0,m=!t.ignoreBrowserslistConfig&&!d;if(!i&&m&&(i=s.loadConfig({config:t.configFile,path:u,env:t.browserslistEnv}),null==i&&(i=[])),!a||"intersect"===a&&null!=(r=i)&&r.length||(i=Object.keys(h).map((e=>`${e} >= ${h[e]}`)).join(", "),a=!1),null!=(n=i)&&n.length){const e=C(i,t.browserslistEnv);if("intersect"===a)for(const t of Object.keys(e)){const r=e[t],n=h[t];n?e[t]=(0,o.getHighestUnreleased)(r,(0,o.semverify)(n),t):delete e[t]}c=Object.assign(e,c)}const g={},v=[];for(const e of Object.keys(c).sort()){const t=c[e];"number"==typeof t&&t%1!=0&&v.push({target:e,value:t});const[r,n]="node"===e?D(t):E(e,t);n&&(g[r]=n)}return b(v),g},Object.defineProperty(t,"filterItems",{enumerable:!0,get:function(){return d.default}}),Object.defineProperty(t,"getInclusionReasons",{enumerable:!0,get:function(){return p.getInclusionReasons}}),t.isBrowsersQueryValid=g,Object.defineProperty(t,"isRequired",{enumerable:!0,get:function(){return d.isRequired}}),Object.defineProperty(t,"prettifyTargets",{enumerable:!0,get:function(){return c.prettifyTargets}}),Object.defineProperty(t,"unreleasedLabels",{enumerable:!0,get:function(){return u.unreleasedLabels}});var s=r("../../node_modules/browserslist/index.js"),i=r("../../node_modules/@babel/helper-validator-option/lib/index.js"),a=r("../../node_modules/@babel/compat-data/native-modules.js"),o=r("../../node_modules/@babel/helper-compilation-targets/lib/utils.js"),u=r("../../node_modules/@babel/helper-compilation-targets/lib/targets.js"),l=r("../../node_modules/@babel/helper-compilation-targets/lib/options.js"),c=r("../../node_modules/@babel/helper-compilation-targets/lib/pretty.js"),p=r("../../node_modules/@babel/helper-compilation-targets/lib/debug.js"),d=r("../../node_modules/@babel/helper-compilation-targets/lib/filter-items.js");const h=a["es6.module"],m=new i.OptionValidator("@babel/helper-compilation-targets");function f(e){const t=Object.keys(l.TargetNames);for(const r of Object.keys(e))if(!(r in l.TargetNames))throw new Error(m.formatMessage(`'${r}' is not a valid target\n- Did you mean '${(0,i.findSuggestion)(r,t)}'?`));return e}function g(e){return"string"==typeof e||Array.isArray(e)&&e.every((e=>"string"==typeof e))}function y(e){return m.invariant(void 0===e||g(e),`'${String(e)}' is not a valid browserslist query`),e}function b(e){e.length&&(console.warn("Warning, the following targets are using a decimal version:\n"),e.forEach((e=>{let{target:t,value:r}=e;return console.warn(`  ${t}: ${r}`)})),console.warn("\nWe recommend using a string for minor/patch versions to avoid numbers like 6.10\ngetting parsed as 6.1, which can lead to unexpected behavior.\n"))}function v(e,t){try{return(0,o.semverify)(t)}catch(r){throw new Error(m.formatMessage(`'${t}' is not a valid value for 'targets.${e}'.`))}}function D(e){return["node",!0===e||"current"===e?n.versions.node:v("node",e)]}function E(e,t){return[e,(0,o.isUnreleasedVersion)(t,e)?t.toLowerCase():v(e,t)]}function x(e){const t=Object.assign({},e);return delete t.esmodules,delete t.browsers,t}function C(e,t){return s(e,{mobileToDesktop:!0,env:t}).reduce(((e,t)=>{const[r,n]=t.split(" "),s=u.browserNameMap[r];if(!s)return e;try{const t=n.split("-")[0].toLowerCase(),r=(0,o.isUnreleasedVersion)(t,s);if(!e[s])return e[s]=r?t:(0,o.semverify)(t),e;const i=e[s],a=(0,o.isUnreleasedVersion)(i,s);if(a&&r)e[s]=(0,o.getLowestUnreleased)(i,t,s);else if(a)e[s]=(0,o.semverify)(t);else if(!a&&!r){const r=(0,o.semverify)(t);e[s]=(0,o.semverMin)(i,r)}}catch(e){}return e}),{})}},"../../node_modules/@babel/helper-compilation-targets/lib/options.js":(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.TargetNames=void 0,t.TargetNames={node:"node",chrome:"chrome",opera:"opera",edge:"edge",firefox:"firefox",safari:"safari",ie:"ie",ios:"ios",android:"android",electron:"electron",samsung:"samsung",rhino:"rhino"}},"../../node_modules/@babel/helper-compilation-targets/lib/pretty.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.prettifyTargets=function(e){return Object.keys(e).reduce(((t,r)=>{let n=e[r];const a=s.unreleasedLabels[r];return"string"==typeof n&&a!==n&&(n=i(n)),t[r]=n,t}),{})},t.prettifyVersion=i;var n=r("../../node_modules/semver/semver.js"),s=r("../../node_modules/@babel/helper-compilation-targets/lib/targets.js");function i(e){if("string"!=typeof e)return e;const t=[n.major(e)],r=n.minor(e),s=n.patch(e);return(r||s)&&t.push(r),s&&t.push(s),t.join(".")}},"../../node_modules/@babel/helper-compilation-targets/lib/targets.js":(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.unreleasedLabels=t.browserNameMap=void 0,t.unreleasedLabels={safari:"tp"},t.browserNameMap={and_chr:"chrome",and_ff:"firefox",android:"android",chrome:"chrome",edge:"edge",firefox:"firefox",ie:"ie",ie_mob:"ie",ios_saf:"ios",node:"node",op_mob:"opera",opera:"opera",safari:"safari",samsung:"samsung"}},"../../node_modules/@babel/helper-compilation-targets/lib/utils.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.getHighestUnreleased=function(e,t,r){return l(e,t,r)===e?t:e},t.getLowestImplementedVersion=function(e,t){const r=e[t];return r||"android"!==t?r:e.chrome},t.getLowestUnreleased=l,t.isUnreleasedVersion=function(e,t){const r=i.unreleasedLabels[t];return!!r&&r===e.toString().toLowerCase()},t.semverMin=u,t.semverify=function(e){if("string"==typeof e&&n.valid(e))return e;o.invariant("number"==typeof e||"string"==typeof e&&a.test(e),`'${e}' is not a valid version`);const t=e.toString().split(".");for(;t.length<3;)t.push("0");return t.join(".")};var n=r("../../node_modules/semver/semver.js"),s=r("../../node_modules/@babel/helper-validator-option/lib/index.js"),i=r("../../node_modules/@babel/helper-compilation-targets/lib/targets.js");const a=/^(\d+|\d+.\d+)$/,o=new s.OptionValidator("@babel/helper-compilation-targets");function u(e,t){return e&&n.lt(e,t)?e:t}function l(e,t,r){const n=i.unreleasedLabels[r];return e===n?t:t===n?e:u(e,t)}},"../../node_modules/@babel/helper-module-imports/lib/import-builder.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n=r("../../node_modules/assert/build/assert.js"),s=r("../../node_modules/@babel/types/lib/index.js");const{callExpression:i,cloneNode:a,expressionStatement:o,identifier:u,importDeclaration:l,importDefaultSpecifier:c,importNamespaceSpecifier:p,importSpecifier:d,memberExpression:h,stringLiteral:m,variableDeclaration:f,variableDeclarator:g}=s;t.default=class{constructor(e,t,r){this._statements=[],this._resultName=null,this._importedSource=void 0,this._scope=t,this._hub=r,this._importedSource=e}done(){return{statements:this._statements,resultName:this._resultName}}import(){return this._statements.push(l([],m(this._importedSource))),this}require(){return this._statements.push(o(i(u("require"),[m(this._importedSource)]))),this}namespace(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"namespace";const t=this._scope.generateUidIdentifier(e),r=this._statements[this._statements.length-1];return n("ImportDeclaration"===r.type),n(0===r.specifiers.length),r.specifiers=[p(t)],this._resultName=a(t),this}default(e){const t=this._scope.generateUidIdentifier(e),r=this._statements[this._statements.length-1];return n("ImportDeclaration"===r.type),n(0===r.specifiers.length),r.specifiers=[c(t)],this._resultName=a(t),this}named(e,t){if("default"===t)return this.default(e);const r=this._scope.generateUidIdentifier(e),s=this._statements[this._statements.length-1];return n("ImportDeclaration"===s.type),n(0===s.specifiers.length),s.specifiers=[d(r,u(t))],this._resultName=a(r),this}var(e){const t=this._scope.generateUidIdentifier(e);let r=this._statements[this._statements.length-1];return"ExpressionStatement"!==r.type&&(n(this._resultName),r=o(this._resultName),this._statements.push(r)),this._statements[this._statements.length-1]=f("var",[g(t,r.expression)]),this._resultName=a(t),this}defaultInterop(){return this._interop(this._hub.addHelper("interopRequireDefault"))}wildcardInterop(){return this._interop(this._hub.addHelper("interopRequireWildcard"))}_interop(e){const t=this._statements[this._statements.length-1];return"ExpressionStatement"===t.type?t.expression=i(e,[t.expression]):"VariableDeclaration"===t.type?(n(1===t.declarations.length),t.declarations[0].init=i(e,[t.declarations[0].init])):n.fail("Unexpected type."),this}prop(e){const t=this._statements[this._statements.length-1];return"ExpressionStatement"===t.type?t.expression=h(t.expression,u(e)):"VariableDeclaration"===t.type?(n(1===t.declarations.length),t.declarations[0].init=h(t.declarations[0].init,u(e))):n.fail("Unexpected type:"+t.type),this}read(e){this._resultName=h(this._resultName,u(e))}}},"../../node_modules/@babel/helper-module-imports/lib/import-injector.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n=r("../../node_modules/assert/build/assert.js"),s=r("../../node_modules/@babel/types/lib/index.js"),i=r("../../node_modules/@babel/helper-module-imports/lib/import-builder.js"),a=r("../../node_modules/@babel/helper-module-imports/lib/is-module.js");const{numericLiteral:o,sequenceExpression:u}=s;t.default=class{constructor(e,t,r){this._defaultOpts={importedSource:null,importedType:"commonjs",importedInterop:"babel",importingInterop:"babel",ensureLiveReference:!1,ensureNoContext:!1,importPosition:"before"};const n=e.find((e=>e.isProgram()));this._programPath=n,this._programScope=n.scope,this._hub=n.hub,this._defaultOpts=this._applyDefaults(t,r,!0)}addDefault(e,t){return this.addNamed("default",e,t)}addNamed(e,t,r){return n("string"==typeof e),this._generateImport(this._applyDefaults(t,r),e)}addNamespace(e,t){return this._generateImport(this._applyDefaults(e,t),null)}addSideEffect(e,t){return this._generateImport(this._applyDefaults(e,t),void 0)}_applyDefaults(e,t){let r,s=arguments.length>2&&void 0!==arguments[2]&&arguments[2];return"string"==typeof e?r=Object.assign({},this._defaultOpts,{importedSource:e},t):(n(!t,"Unexpected secondary arguments."),r=Object.assign({},this._defaultOpts,e)),!s&&t&&(void 0!==t.nameHint&&(r.nameHint=t.nameHint),void 0!==t.blockHoist&&(r.blockHoist=t.blockHoist)),r}_generateImport(e,t){const r="default"===t,n=!!t&&!r,s=null===t,{importedSource:l,importedType:c,importedInterop:p,importingInterop:d,ensureLiveReference:h,ensureNoContext:m,nameHint:f,importPosition:g,blockHoist:y}=e;let b=f||t;const v=(0,a.default)(this._programPath),D=v&&"node"===d,E=v&&"babel"===d;if("after"===g&&!v)throw new Error('"importPosition": "after" is only supported in modules');const x=new i.default(l,this._programScope,this._hub);if("es6"===c){if(!D&&!E)throw new Error("Cannot import an ES6 module from CommonJS");x.import(),s?x.namespace(f||l):(r||n)&&x.named(b,t)}else{if("commonjs"!==c)throw new Error(`Unexpected interopType "${c}"`);if("babel"===p)if(D){b="default"!==b?b:l;const e=`${l}$es6Default`;x.import(),s?x.default(e).var(b||l).wildcardInterop():r?h?x.default(e).var(b||l).defaultInterop().read("default"):x.default(e).var(b).defaultInterop().prop(t):n&&x.default(e).read(t)}else E?(x.import(),s?x.namespace(b||l):(r||n)&&x.named(b,t)):(x.require(),s?x.var(b||l).wildcardInterop():(r||n)&&h?r?(b="default"!==b?b:l,x.var(b).read(t),x.defaultInterop()):x.var(l).read(t):r?x.var(b).defaultInterop().prop(t):n&&x.var(b).prop(t));else if("compiled"===p)D?(x.import(),s?x.default(b||l):(r||n)&&x.default(l).read(b)):E?(x.import(),s?x.namespace(b||l):(r||n)&&x.named(b,t)):(x.require(),s?x.var(b||l):(r||n)&&(h?x.var(l).read(b):x.prop(t).var(b)));else{if("uncompiled"!==p)throw new Error(`Unknown importedInterop "${p}".`);if(r&&h)throw new Error("No live reference for commonjs default");D?(x.import(),s?x.default(b||l):r?x.default(b):n&&x.default(l).read(b)):E?(x.import(),s?x.default(b||l):r?x.default(b):n&&x.named(b,t)):(x.require(),s?x.var(b||l):r?x.var(b):n&&(h?x.var(l).read(b):x.var(b).prop(t)))}}const{statements:C,resultName:A}=x.done();return this._insertStatements(C,g,y),(r||n)&&m&&"Identifier"!==A.type?u([o(0),A]):A}_insertStatements(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"before",r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:3;const n=this._programPath.get("body");if("after"===t){for(let t=n.length-1;t>=0;t--)if(n[t].isImportDeclaration())return void n[t].insertAfter(e)}else{e.forEach((e=>{e._blockHoist=r}));const t=n.find((e=>{const t=e.node._blockHoist;return Number.isFinite(t)&&t<4}));if(t)return void t.insertBefore(e)}this._programPath.unshiftContainer("body",e)}}},"../../node_modules/@babel/helper-module-imports/lib/index.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"ImportInjector",{enumerable:!0,get:function(){return n.default}}),t.addDefault=function(e,t,r){return new n.default(e).addDefault(t,r)},t.addNamed=function(e,t,r,s){return new n.default(e).addNamed(t,r,s)},t.addNamespace=function(e,t,r){return new n.default(e).addNamespace(t,r)},t.addSideEffect=function(e,t,r){return new n.default(e).addSideEffect(t,r)},Object.defineProperty(t,"isModule",{enumerable:!0,get:function(){return s.default}});var n=r("../../node_modules/@babel/helper-module-imports/lib/import-injector.js"),s=r("../../node_modules/@babel/helper-module-imports/lib/is-module.js")},"../../node_modules/@babel/helper-module-imports/lib/is-module.js":(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){const{sourceType:t}=e.node;if("module"!==t&&"script"!==t)throw e.buildCodeFrameError(`Unknown sourceType "${t}", cannot transform.`);return"module"===e.node.sourceType}},"../../node_modules/@babel/helper-module-transforms/lib/get-module-name.js":(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=r;{const e=r;t.default=r=function(t,r){var n,s,i,a;return e(t,{moduleId:null!=(n=r.moduleId)?n:t.moduleId,moduleIds:null!=(s=r.moduleIds)?s:t.moduleIds,getModuleId:null!=(i=r.getModuleId)?i:t.getModuleId,moduleRoot:null!=(a=r.moduleRoot)?a:t.moduleRoot})}}function r(e,t){const{filename:r,filenameRelative:n=r,sourceRoot:s=t.moduleRoot}=e,{moduleId:i,moduleIds:a=!!i,getModuleId:o,moduleRoot:u=s}=t;if(!a)return null;if(null!=i&&!o)return i;let l=null!=u?u+"/":"";if(n){const e=null!=s?new RegExp("^"+s+"/?"):"";l+=n.replace(e,"").replace(/\.(\w*?)$/,"")}return l=l.replace(/\\/g,"/"),o&&o(l)||l}},"../../node_modules/@babel/helper-module-transforms/lib/index.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.buildNamespaceInitStatements=function(e,t){let r=arguments.length>2&&void 0!==arguments[2]&&arguments[2];const n=[];let s=y(t.name);t.lazy&&(s=d(s,[]));for(const e of t.importsNamespace)e!==t.name&&n.push(i.default.statement`var NAME = SOURCE;`({NAME:e,SOURCE:h(s)}));r&&n.push(...w(e,t,!0));for(const r of t.reexportNamespace)n.push((t.lazy?i.default.statement`
            Object.defineProperty(EXPORTS, "NAME", {
              enumerable: true,
              get: function() {
                return NAMESPACE;
              }
            });
          `:i.default.statement`EXPORTS.NAME = NAMESPACE;`)({EXPORTS:e.exportName,NAME:r,NAMESPACE:h(s)}));if(t.reexportAll){const i=_(e,h(s),r);i.loc=t.reexportAll.loc,n.push(i)}return n},t.ensureStatementsHoisted=function(e){e.forEach((e=>{e._blockHoist=3}))},Object.defineProperty(t,"getModuleName",{enumerable:!0,get:function(){return c.default}}),Object.defineProperty(t,"hasExports",{enumerable:!0,get:function(){return l.hasExports}}),Object.defineProperty(t,"isModule",{enumerable:!0,get:function(){return a.isModule}}),Object.defineProperty(t,"isSideEffectImport",{enumerable:!0,get:function(){return l.isSideEffectImport}}),t.rewriteModuleStatementsAndPrepareHeader=function(e,t){let{loose:r,exportName:s,strict:c,allowTopLevelThis:p,strictMode:d,noInterop:h,importInterop:g=(h?"none":"babel"),lazy:b,esNamespaceOnly:v,filename:D,constantReexports:A=r,enumerableModuleMeta:_=r,noIncompleteNsImportDetection:S}=t;(0,l.validateImportInteropOption)(g),n((0,a.isModule)(e),"Cannot process module statements in a script"),e.node.sourceType="script";const T=(0,l.default)(e,s,{importInterop:g,initializeReexports:A,lazy:b,esNamespaceOnly:v,filename:D});if(p||(0,o.default)(e),(0,u.default)(e,T),!1!==d){const t=e.node.directives.some((e=>"use strict"===e.value.value));t||e.unshiftContainer("directives",m(f("use strict")))}const P=[];(0,l.hasExports)(T)&&!c&&P.push(function(e){return(arguments.length>1&&void 0!==arguments[1]&&arguments[1]?i.default.statement`
        EXPORTS.__esModule = true;
      `:i.default.statement`
        Object.defineProperty(EXPORTS, "__esModule", {
          value: true,
        });
      `)({EXPORTS:e.exportName})}(T,_));const F=function(e,t){const r=Object.create(null);for(const e of t.local.values())for(const t of e.names)r[t]=!0;let n=!1;for(const e of t.source.values()){for(const t of e.reexports.keys())r[t]=!0;for(const t of e.reexportNamespace)r[t]=!0;n=n||!!e.reexportAll}if(!n||0===Object.keys(r).length)return null;const s=e.scope.generateUidIdentifier("exportNames");return delete r.default,{name:s.name,statement:x("var",[C(s,E(r))])}}(e,T);return F&&(T.exportNameListName=F.name,P.push(F.statement)),P.push(...function(e,t){let r=arguments.length>2&&void 0!==arguments[2]&&arguments[2],n=arguments.length>3&&void 0!==arguments[3]&&arguments[3];const s=[];for(const[e,r]of t.local)if("import"===r.kind);else if("hoisted"===r.kind)s.push([r.names[0],k(t,r.names,y(e))]);else if(!n)for(const e of r.names)s.push([e,null]);for(const e of t.source.values()){if(!r){const r=w(t,e,!1),n=[...e.reexports.keys()];for(let e=0;e<r.length;e++)s.push([n[e],r[e]])}if(!n)for(const t of e.reexportNamespace)s.push([t,null])}s.sort(((e,t)=>{let[r]=e,[n]=t;return r<n?-1:n<r?1:0}));const i=[];if(n)for(const[,e]of s)i.push(e);else{const r=100;for(let n=0;n<s.length;n+=r){let a=[];for(let o=0;o<r&&n+o<s.length;o++){const[r,u]=s[n+o];null!==u?(a.length>0&&(i.push(k(t,a,e.scope.buildUndefinedNode())),a=[]),i.push(u)):a.push(r)}a.length>0&&i.push(k(t,a,e.scope.buildUndefinedNode()))}}return i}(e,T,A,S)),{meta:T,headers:P}},Object.defineProperty(t,"rewriteThis",{enumerable:!0,get:function(){return o.default}}),t.wrapInterop=function(e,t,r){if("none"===r)return null;if("node-namespace"===r)return d(e.hub.addHelper("interopRequireWildcard"),[t,p(!0)]);if("node-default"===r)return null;let n;if("default"===r)n="interopRequireDefault";else{if("namespace"!==r)throw new Error(`Unknown interop: ${r}`);n="interopRequireWildcard"}return d(e.hub.addHelper(n),[t])};var n=r("../../node_modules/assert/build/assert.js"),s=r("../../node_modules/@babel/types/lib/index.js"),i=r("../../node_modules/@babel/template/lib/index.js"),a=r("../../node_modules/@babel/helper-module-imports/lib/index.js"),o=r("../../node_modules/@babel/helper-module-transforms/lib/rewrite-this.js"),u=r("../../node_modules/@babel/helper-module-transforms/lib/rewrite-live-references.js"),l=r("../../node_modules/@babel/helper-module-transforms/lib/normalize-and-load-metadata.js"),c=r("../../node_modules/@babel/helper-module-transforms/lib/get-module-name.js");const{booleanLiteral:p,callExpression:d,cloneNode:h,directive:m,directiveLiteral:f,expressionStatement:g,identifier:y,isIdentifier:b,memberExpression:v,stringLiteral:D,valueToNode:E,variableDeclaration:x,variableDeclarator:C}=s,A={constant:i.default.statement`EXPORTS.EXPORT_NAME = NAMESPACE_IMPORT;`,constantComputed:i.default.statement`EXPORTS["EXPORT_NAME"] = NAMESPACE_IMPORT;`,spec:i.default.statement`
    Object.defineProperty(EXPORTS, "EXPORT_NAME", {
      enumerable: true,
      get: function() {
        return NAMESPACE_IMPORT;
      },
    });
    `},w=(e,t,r)=>{const n=t.lazy?d(y(t.name),[]):y(t.name),{stringSpecifiers:s}=e;return Array.from(t.reexports,(i=>{let[a,o]=i,u=h(n);"default"===o&&"node-default"===t.interop||(u=s.has(o)?v(u,D(o),!0):v(u,y(o)));const l={EXPORTS:e.exportName,EXPORT_NAME:a,NAMESPACE_IMPORT:u};return r||b(u)?s.has(a)?A.constantComputed(l):A.constant(l):A.spec(l)}))};function _(e,t,r){return(r?i.default.statement`
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
          `({EXPORTS_LIST:e.exportNameListName}):null})}const S={computed:i.default.expression`EXPORTS["NAME"] = VALUE`,default:i.default.expression`EXPORTS.NAME = VALUE`};function k(e,t,r){const{stringSpecifiers:n,exportName:s}=e;return g(t.reduce(((e,t)=>{const r={EXPORTS:s,NAME:t,VALUE:e};return n.has(t)?S.computed(r):S.default(r)}),r))}},"../../node_modules/@babel/helper-module-transforms/lib/normalize-and-load-metadata.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t,r){let{importInterop:s,initializeReexports:o=!1,lazy:p=!1,esNamespaceOnly:d=!1,filename:h}=r;t||(t=e.scope.generateUidIdentifier("exports").name);const m=new Set;!function(e){e.get("body").forEach((e=>{e.isExportDefaultDeclaration()&&(0,i.default)(e)}))}(e);const{local:f,source:g,hasExports:y}=function(e,t,r){let{lazy:s,initializeReexports:i}=t;const o=function(e,t,r){const n=new Map;e.get("body").forEach((e=>{let r;if(e.isImportDeclaration())r="import";else{if(e.isExportDefaultDeclaration()&&(e=e.get("declaration")),e.isExportNamedDeclaration())if(e.node.declaration)e=e.get("declaration");else if(t&&e.node.source&&e.get("source").isStringLiteral())return void e.get("specifiers").forEach((e=>{c(e),n.set(e.get("local").node.name,"block")}));if(e.isFunctionDeclaration())r="hoisted";else if(e.isClassDeclaration())r="block";else if(e.isVariableDeclaration({kind:"var"}))r="var";else{if(!e.isVariableDeclaration())return;r="block"}}Object.keys(e.getOuterBindingIdentifiers()).forEach((e=>{n.set(e,r)}))}));const s=new Map,i=e=>{const t=e.node.name;let r=s.get(t);if(!r){const i=n.get(t);if(void 0===i)throw e.buildCodeFrameError(`Exporting local "${t}", which is not declared.`);r={names:[],kind:i},s.set(t,r)}return r};return e.get("body").forEach((e=>{if(!e.isExportNamedDeclaration()||!t&&e.node.source){if(e.isExportDefaultDeclaration()){const t=e.get("declaration");if(!t.isFunctionDeclaration()&&!t.isClassDeclaration())throw t.buildCodeFrameError("Unexpected default expression export.");i(t.get("id")).names.push("default")}}else if(e.node.declaration){const t=e.get("declaration"),r=t.getOuterBindingIdentifierPaths();Object.keys(r).forEach((e=>{if("__esModule"===e)throw t.buildCodeFrameError('Illegal export "__esModule".');i(r[e]).names.push(e)}))}else e.get("specifiers").forEach((e=>{const t=e.get("local"),n=e.get("exported"),s=i(t),a=l(n,r);if("__esModule"===a)throw n.buildCodeFrameError('Illegal export "__esModule".');s.names.push(a)}))})),s}(e,i,r),u=new Map,p=t=>{const r=t.value;let s=u.get(r);return s||(s={name:e.scope.generateUidIdentifier((0,n.basename)(r,(0,n.extname)(r))).name,interop:"none",loc:null,imports:new Map,importsNamespace:new Set,reexports:new Map,reexportNamespace:new Set,reexportAll:null,lazy:!1,source:r},u.set(r,s)),s};let d=!1;e.get("body").forEach((e=>{if(e.isImportDeclaration()){const t=p(e.node.source);t.loc||(t.loc=e.node.loc),e.get("specifiers").forEach((e=>{if(e.isImportDefaultSpecifier()){const r=e.get("local").node.name;t.imports.set(r,"default");const n=o.get(r);n&&(o.delete(r),n.names.forEach((e=>{t.reexports.set(e,"default")})))}else if(e.isImportNamespaceSpecifier()){const r=e.get("local").node.name;t.importsNamespace.add(r);const n=o.get(r);n&&(o.delete(r),n.names.forEach((e=>{t.reexportNamespace.add(e)})))}else if(e.isImportSpecifier()){const n=l(e.get("imported"),r),s=e.get("local").node.name;t.imports.set(s,n);const i=o.get(s);i&&(o.delete(s),i.names.forEach((e=>{t.reexports.set(e,n)})))}}))}else if(e.isExportAllDeclaration()){d=!0;const t=p(e.node.source);t.loc||(t.loc=e.node.loc),t.reexportAll={loc:e.node.loc}}else if(e.isExportNamedDeclaration()&&e.node.source){d=!0;const t=p(e.node.source);t.loc||(t.loc=e.node.loc),e.get("specifiers").forEach((e=>{c(e);const n=l(e.get("local"),r),s=l(e.get("exported"),r);if(t.reexports.set(s,n),"__esModule"===s)throw e.get("exported").buildCodeFrameError('Illegal export "__esModule".')}))}else(e.isExportNamedDeclaration()||e.isExportDefaultDeclaration())&&(d=!0)}));for(const e of u.values()){let t=!1,r=!1;e.importsNamespace.size>0&&(t=!0,r=!0),e.reexportAll&&(r=!0);for(const n of e.imports.values())"default"===n?t=!0:r=!0;for(const n of e.reexports.values())"default"===n?t=!0:r=!0;t&&r?e.interop="namespace":t&&(e.interop="default")}for(const[e,t]of u)if(!1!==s&&!a(t)&&!t.reexportAll)if(!0===s)t.lazy=!/\./.test(e);else if(Array.isArray(s))t.lazy=-1!==s.indexOf(e);else{if("function"!=typeof s)throw new Error(".lazy must be a boolean, string array, or function");t.lazy=s(e)}return{hasExports:d,local:o,source:u}}(e,{initializeReexports:o,lazy:p},m);!function(e){e.get("body").forEach((e=>{if(e.isImportDeclaration())e.remove();else if(e.isExportNamedDeclaration())e.node.declaration?(e.node.declaration._blockHoist=e.node._blockHoist,e.replaceWith(e.node.declaration)):e.remove();else if(e.isExportDefaultDeclaration()){const t=e.get("declaration");if(!t.isFunctionDeclaration()&&!t.isClassDeclaration())throw t.buildCodeFrameError("Unexpected default expression export.");t._blockHoist=e.node._blockHoist,e.replaceWith(t)}else e.isExportAllDeclaration()&&e.remove()}))}(e);for(const[,e]of g){e.importsNamespace.size>0&&(e.name=e.importsNamespace.values().next().value);const t=u(s,e.source,h);"none"===t?e.interop="none":"node"===t&&"namespace"===e.interop?e.interop="node-namespace":"node"===t&&"default"===e.interop?e.interop="node-default":d&&"namespace"===e.interop&&(e.interop="default")}return{exportName:t,exportNameListName:null,hasExports:y,local:f,source:g,stringSpecifiers:m}},t.hasExports=function(e){return e.hasExports},t.isSideEffectImport=a,t.validateImportInteropOption=o;var n=r("../../node_modules/path-browserify/index.js"),s=r("../../node_modules/@babel/helper-validator-identifier/lib/index.js"),i=r("../../node_modules/@babel/helper-split-export-declaration/lib/index.js");function a(e){return 0===e.imports.size&&0===e.importsNamespace.size&&0===e.reexports.size&&0===e.reexportNamespace.size&&!e.reexportAll}function o(e){if("function"!=typeof e&&"none"!==e&&"babel"!==e&&"node"!==e)throw new Error(`.importInterop must be one of "none", "babel", "node", or a function returning one of those values (received ${e}).`);return e}function u(e,t,r){return"function"==typeof e?o(e(t,r)):e}function l(e,t){if(e.isIdentifier())return e.node.name;if(e.isStringLiteral()){const r=e.node.value;return(0,s.isIdentifierName)(r)||t.add(r),r}throw new Error(`Expected export specifier to be either Identifier or StringLiteral, got ${e.node.type}`)}function c(e){if(!e.isExportSpecifier())throw e.isExportNamespaceSpecifier()?e.buildCodeFrameError("Export namespace should be first transformed by `@babel/plugin-proposal-export-namespace-from`."):e.buildCodeFrameError("Unexpected export specifier type")}},"../../node_modules/@babel/helper-module-transforms/lib/rewrite-live-references.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t){const r=new Map,n=new Map,s=t=>{e.requeue(t)};for(const[e,n]of t.source){for(const[t,s]of n.imports)r.set(t,[e,s,null]);for(const t of n.importsNamespace)r.set(t,[e,null,t])}for(const[e,r]of t.local){let t=n.get(e);t||(t=[],n.set(e,t)),t.push(...r.names)}const i={metadata:t,requeueInParent:s,scope:e.scope,exported:n};e.traverse(C,i),(0,a.default)(e,new Set([...Array.from(r.keys()),...Array.from(n.keys())]),!1);const o={seen:new WeakSet,metadata:t,requeueInParent:s,scope:e.scope,imported:r,exported:n,buildImportReference:(e,r)=>{let[n,s,i]=e;const a=t.source.get(n);if(i)return a.lazy&&(r=u(r,[])),r;let o=d(a.name);if(a.lazy&&(o=u(o,[])),"default"===s&&"node-default"===a.interop)return o;const l=t.stringSpecifiers.has(s);return y(o,l?D(s):d(s),l)}};e.traverse(_,o)};var n=r("../../node_modules/assert/build/assert.js"),s=r("../../node_modules/@babel/types/lib/index.js"),i=r("../../node_modules/@babel/template/lib/index.js"),a=r("../../node_modules/@babel/helper-simple-access/lib/index.js");const{assignmentExpression:o,callExpression:u,cloneNode:l,expressionStatement:c,getOuterBindingIdentifiers:p,identifier:d,isMemberExpression:h,isVariableDeclaration:m,jsxIdentifier:f,jsxMemberExpression:g,memberExpression:y,numericLiteral:b,sequenceExpression:v,stringLiteral:D,variableDeclaration:E,variableDeclarator:x}=s,C={Scope(e){e.skip()},ClassDeclaration(e){const{requeueInParent:t,exported:r,metadata:n}=this,{id:s}=e.node;if(!s)throw new Error("Expected class to have a name");const i=s.name,a=r.get(i)||[];if(a.length>0){const r=c(A(n,a,d(i),e.scope));r._blockHoist=e.node._blockHoist,t(e.insertAfter(r)[0])}},VariableDeclaration(e){const{requeueInParent:t,exported:r,metadata:n}=this;Object.keys(e.getOuterBindingIdentifiers()).forEach((s=>{const i=r.get(s)||[];if(i.length>0){const r=c(A(n,i,d(s),e.scope));r._blockHoist=e.node._blockHoist,t(e.insertAfter(r)[0])}}))}},A=(e,t,r,n)=>{const s=e.exportName;for(let e=n;null!=e;e=e.parent)e.hasOwnBinding(s)&&e.rename(s);return(t||[]).reduce(((t,r)=>{const{stringSpecifiers:n}=e,i=n.has(r);return o("=",y(d(s),i?D(r):d(r),i),t)}),r)},w=e=>i.default.expression.ast`
    (function() {
      throw new Error('"' + '${e}' + '" is read-only.');
    })()
  `,_={ReferencedIdentifier(e){const{seen:t,buildImportReference:r,scope:n,imported:s,requeueInParent:i}=this;if(t.has(e.node))return;t.add(e.node);const a=e.node.name,o=s.get(a);if(o){if(function(e){do{switch(e.parent.type){case"TSTypeAnnotation":case"TSTypeAliasDeclaration":case"TSTypeReference":case"TypeAnnotation":case"TypeAlias":return!0;case"ExportSpecifier":return"type"===e.parentPath.parent.exportKind;default:if(e.parentPath.isStatement()||e.parentPath.isExpression())return!1}}while(e=e.parentPath)}(e))throw e.buildCodeFrameError(`Cannot transform the imported binding "${a}" since it's also used in a type annotation. Please strip type annotations using @babel/preset-typescript or @babel/preset-flow.`);const t=e.scope.getBinding(a);if(n.getBinding(a)!==t)return;const s=r(o,e.node);if(s.loc=e.node.loc,(e.parentPath.isCallExpression({callee:e.node})||e.parentPath.isOptionalCallExpression({callee:e.node})||e.parentPath.isTaggedTemplateExpression({tag:e.node}))&&h(s))e.replaceWith(v([b(0),s]));else if(e.isJSXIdentifier()&&h(s)){const{object:t,property:r}=s;e.replaceWith(g(f(t.name),f(r.name)))}else e.replaceWith(s);i(e),e.skip()}},UpdateExpression(e){const{scope:t,seen:r,imported:n,exported:s,requeueInParent:i,buildImportReference:a}=this;if(r.has(e.node))return;r.add(e.node);const u=e.get("argument");if(u.isMemberExpression())return;const c=e.node;if(u.isIdentifier()){const r=u.node.name;if(t.getBinding(r)!==e.scope.getBinding(r))return;const i=s.get(r),p=n.get(r);if((null==i?void 0:i.length)>0||p)if(p)e.replaceWith(o(c.operator[0]+"=",a(p,u.node),w(r)));else if(c.prefix)e.replaceWith(A(this.metadata,i,l(c),e.scope));else{const n=t.generateDeclaredUidIdentifier(r);e.replaceWith(v([o("=",l(n),l(c)),A(this.metadata,i,d(r),e.scope),l(n)]))}}i(e),e.skip()},AssignmentExpression:{exit(e){const{scope:t,seen:r,imported:s,exported:i,requeueInParent:a,buildImportReference:o}=this;if(r.has(e.node))return;r.add(e.node);const u=e.get("left");if(!u.isMemberExpression())if(u.isIdentifier()){const r=u.node.name;if(t.getBinding(r)!==e.scope.getBinding(r))return;const l=i.get(r),c=s.get(r);if((null==l?void 0:l.length)>0||c){n("="===e.node.operator,"Path was not simplified");const t=e.node;c&&(t.left=o(c,u.node),t.right=v([t.right,w(r)])),e.replaceWith(A(this.metadata,l,t,e.scope)),a(e)}}else{const r=u.getOuterBindingIdentifiers(),n=Object.keys(r).filter((r=>t.getBinding(r)===e.scope.getBinding(r))),o=n.find((e=>s.has(e)));o&&(e.node.right=v([e.node.right,w(o)]));const l=[];if(n.forEach((t=>{const r=i.get(t)||[];r.length>0&&l.push(A(this.metadata,r,d(t),e.scope))})),l.length>0){let t=v(l);e.parentPath.isExpressionStatement()&&(t=c(t),t._blockHoist=e.parentPath.node._blockHoist),a(e.insertAfter(t)[0])}}}},"ForOfStatement|ForInStatement"(e){const{scope:t,node:r}=e,{left:n}=r,{exported:s,imported:i,scope:a}=this;if(!m(n)){let r,u=!1;const d=e.get("body").scope;for(const e of Object.keys(p(n)))a.getBinding(e)===t.getBinding(e)&&(s.has(e)&&(u=!0,d.hasOwnBinding(e)&&d.rename(e)),i.has(e)&&!r&&(r=e));if(!u&&!r)return;e.ensureBlock();const h=e.get("body"),m=t.generateUidIdentifierBasedOnNode(n);e.get("left").replaceWith(E("let",[x(l(m))])),t.registerDeclaration(e.get("left")),u&&h.unshiftContainer("body",c(o("=",n,m))),r&&h.unshiftContainer("body",c(w(r)))}}}},"../../node_modules/@babel/helper-module-transforms/lib/rewrite-this.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){(0,s.default)(e.node,Object.assign({},u,{noScope:!0}))};var n=r("../../node_modules/@babel/helper-environment-visitor/lib/index.js"),s=r("../../node_modules/@babel/traverse/lib/index.js"),i=r("../../node_modules/@babel/types/lib/index.js");const{numericLiteral:a,unaryExpression:o}=i,u=s.default.visitors.merge([n.default,{ThisExpression(e){e.replaceWith(o("void",a(0),!0))}}])},"../../node_modules/@babel/helper-plugin-utils/lib/index.js":(e,t)=>{"use strict";function r(e){return(t,r,n)=>{var a;let o;for(const e of Object.keys(s)){var u;t[e]||(o=null!=(u=o)?u:i(t),o[e]=s[e](o))}return e(null!=(a=o)?a:t,r||{},n)}}Object.defineProperty(t,"__esModule",{value:!0}),t.declare=r,t.declarePreset=void 0;const n=r;t.declarePreset=n;const s={assertVersion:e=>t=>{!function(e,t){if("number"==typeof e){if(!Number.isInteger(e))throw new Error("Expected string or integer value.");e=`^${e}.0.0-0`}if("string"!=typeof e)throw new Error("Expected string or integer value.");const r=Error.stackTraceLimit;let n;throw"number"==typeof r&&r<25&&(Error.stackTraceLimit=25),n="7."===t.slice(0,2)?new Error(`Requires Babel "^7.0.0-beta.41", but was loaded with "${t}". You'll need to update your @babel/core version.`):new Error(`Requires Babel "${e}", but was loaded with "${t}". If you are sure you have a compatible version of @babel/core, it is likely that something in your build process is loading the wrong version. Inspect the stack trace of this error to look for the first entry that doesn't mention "@babel/core" or "babel-core" to see what is calling Babel.`),"number"==typeof r&&(Error.stackTraceLimit=r),Object.assign(n,{code:"BABEL_VERSION_UNSUPPORTED",version:t,range:e})}(t,e.version)},targets:()=>()=>({}),assumption:()=>()=>{}};function i(e){let t=null;return"string"==typeof e.version&&/^7\./.test(e.version)&&(t=Object.getPrototypeOf(e),!t||a(t,"version")&&a(t,"transform")&&a(t,"template")&&a(t,"types")||(t=null)),Object.assign({},t,e)}function a(e,t){return Object.prototype.hasOwnProperty.call(e,t)}},"../../node_modules/@babel/helper-simple-access/lib/index.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t){let r=!(arguments.length>2&&void 0!==arguments[2])||arguments[2];e.traverse(h,{scope:e.scope,bindingNames:t,seen:new WeakSet,includeUpdateExpression:r})};var n=r("../../node_modules/@babel/types/lib/index.js");const{LOGICAL_OPERATORS:s,assignmentExpression:i,binaryExpression:a,cloneNode:o,identifier:u,logicalExpression:l,numericLiteral:c,sequenceExpression:p,unaryExpression:d}=n,h={UpdateExpression:{exit(e){const{scope:t,bindingNames:r,includeUpdateExpression:n}=this;if(!n)return;const s=e.get("argument");if(!s.isIdentifier())return;const l=s.node.name;if(r.has(l)&&t.getBinding(l)===e.scope.getBinding(l))if(e.parentPath.isExpressionStatement()&&!e.isCompletionRecord()){const t="++"==e.node.operator?"+=":"-=";e.replaceWith(i(t,s.node,c(1)))}else if(e.node.prefix)e.replaceWith(i("=",u(l),a(e.node.operator[0],d("+",s.node),c(1))));else{const t=e.scope.generateUidIdentifierBasedOnNode(s.node,"old"),r=t.name;e.scope.push({id:t});const n=a(e.node.operator[0],u(r),c(1));e.replaceWith(p([i("=",u(r),d("+",s.node)),i("=",o(s.node),n),u(r)]))}}},AssignmentExpression:{exit(e){const{scope:t,seen:r,bindingNames:n}=this;if("="===e.node.operator)return;if(r.has(e.node))return;r.add(e.node);const u=e.get("left");if(!u.isIdentifier())return;const c=u.node.name;if(!n.has(c))return;if(t.getBinding(c)!==e.scope.getBinding(c))return;const p=e.node.operator.slice(0,-1);s.includes(p)?e.replaceWith(l(p,e.node.left,i("=",o(e.node.left),e.node.right))):(e.node.right=a(p,o(e.node.left),e.node.right),e.node.operator="=")}}}},"../../node_modules/@babel/helper-validator-option/lib/find-suggestion.js":(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.findSuggestion=function(e,t){const n=t.map((t=>function(e,t){let n,s,i=[],a=[];const o=e.length,u=t.length;if(!o)return u;if(!u)return o;for(s=0;s<=u;s++)i[s]=s;for(n=1;n<=o;n++){for(a=[n],s=1;s<=u;s++)a[s]=e[n-1]===t[s-1]?i[s-1]:r(i[s-1],i[s],a[s-1])+1;i=a}return a[u]}(t,e)));return t[n.indexOf(r(...n))]};const{min:r}=Math},"../../node_modules/@babel/helper-validator-option/lib/index.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"OptionValidator",{enumerable:!0,get:function(){return n.OptionValidator}}),Object.defineProperty(t,"findSuggestion",{enumerable:!0,get:function(){return s.findSuggestion}});var n=r("../../node_modules/@babel/helper-validator-option/lib/validator.js"),s=r("../../node_modules/@babel/helper-validator-option/lib/find-suggestion.js")},"../../node_modules/@babel/helper-validator-option/lib/validator.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.OptionValidator=void 0;var n=r("../../node_modules/@babel/helper-validator-option/lib/find-suggestion.js");t.OptionValidator=class{constructor(e){this.descriptor=e}validateTopLevelOptions(e,t){const r=Object.keys(t);for(const t of Object.keys(e))if(!r.includes(t))throw new Error(this.formatMessage(`'${t}' is not a valid top-level option.\n- Did you mean '${(0,n.findSuggestion)(t,r)}'?`))}validateBooleanOption(e,t,r){return void 0===t?r:(this.invariant("boolean"==typeof t,`'${e}' option must be a boolean.`),t)}validateStringOption(e,t,r){return void 0===t?r:(this.invariant("string"==typeof t,`'${e}' option must be a string.`),t)}invariant(e,t){if(!e)throw new Error(this.formatMessage(t))}formatMessage(e){return`${this.descriptor}: ${e}`}}},"../../node_modules/@babel/helpers/lib/helpers-generated.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n=r("../../node_modules/@babel/template/lib/index.js");function s(e,t){return Object.freeze({minVersion:e,ast:()=>n.default.program.ast(t,{preserveComments:!0})})}var i=Object.freeze({applyDecs:s("7.17.8",'function createMetadataMethodsForProperty(metadataMap,kind,property,decoratorFinishedRef){return{getMetadata:function(key){assertNotFinished(decoratorFinishedRef,"getMetadata"),assertMetadataKey(key);var metadataForKey=metadataMap[key];if(void 0!==metadataForKey)if(1===kind){var pub=metadataForKey.public;if(void 0!==pub)return pub[property]}else if(2===kind){var priv=metadataForKey.private;if(void 0!==priv)return priv.get(property)}else if(Object.hasOwnProperty.call(metadataForKey,"constructor"))return metadataForKey.constructor},setMetadata:function(key,value){assertNotFinished(decoratorFinishedRef,"setMetadata"),assertMetadataKey(key);var metadataForKey=metadataMap[key];if(void 0===metadataForKey&&(metadataForKey=metadataMap[key]={}),1===kind){var pub=metadataForKey.public;void 0===pub&&(pub=metadataForKey.public={}),pub[property]=value}else if(2===kind){var priv=metadataForKey.priv;void 0===priv&&(priv=metadataForKey.private=new Map),priv.set(property,value)}else metadataForKey.constructor=value}}}function convertMetadataMapToFinal(obj,metadataMap){var parentMetadataMap=obj[Symbol.metadata||Symbol.for("Symbol.metadata")],metadataKeys=Object.getOwnPropertySymbols(metadataMap);if(0!==metadataKeys.length){for(var i=0;i<metadataKeys.length;i++){var key=metadataKeys[i],metaForKey=metadataMap[key],parentMetaForKey=parentMetadataMap?parentMetadataMap[key]:null,pub=metaForKey.public,parentPub=parentMetaForKey?parentMetaForKey.public:null;pub&&parentPub&&Object.setPrototypeOf(pub,parentPub);var priv=metaForKey.private;if(priv){var privArr=Array.from(priv.values()),parentPriv=parentMetaForKey?parentMetaForKey.private:null;parentPriv&&(privArr=privArr.concat(parentPriv)),metaForKey.private=privArr}parentMetaForKey&&Object.setPrototypeOf(metaForKey,parentMetaForKey)}parentMetadataMap&&Object.setPrototypeOf(metadataMap,parentMetadataMap),obj[Symbol.metadata||Symbol.for("Symbol.metadata")]=metadataMap}}function createAddInitializerMethod(initializers,decoratorFinishedRef){return function(initializer){assertNotFinished(decoratorFinishedRef,"addInitializer"),assertCallable(initializer,"An initializer"),initializers.push(initializer)}}function memberDec(dec,name,desc,metadataMap,initializers,kind,isStatic,isPrivate,value){var kindStr;switch(kind){case 1:kindStr="accessor";break;case 2:kindStr="method";break;case 3:kindStr="getter";break;case 4:kindStr="setter";break;default:kindStr="field"}var metadataKind,metadataName,ctx={kind:kindStr,name:isPrivate?"#"+name:name,isStatic:isStatic,isPrivate:isPrivate},decoratorFinishedRef={v:!1};if(0!==kind&&(ctx.addInitializer=createAddInitializerMethod(initializers,decoratorFinishedRef)),isPrivate){metadataKind=2,metadataName=Symbol(name);var access={};0===kind?(access.get=desc.get,access.set=desc.set):2===kind?access.get=function(){return desc.value}:(1!==kind&&3!==kind||(access.get=function(){return desc.get.call(this)}),1!==kind&&4!==kind||(access.set=function(v){desc.set.call(this,v)})),ctx.access=access}else metadataKind=1,metadataName=name;try{return dec(value,Object.assign(ctx,createMetadataMethodsForProperty(metadataMap,metadataKind,metadataName,decoratorFinishedRef)))}finally{decoratorFinishedRef.v=!0}}function assertNotFinished(decoratorFinishedRef,fnName){if(decoratorFinishedRef.v)throw new Error("attempted to call "+fnName+" after decoration was finished")}function assertMetadataKey(key){if("symbol"!=typeof key)throw new TypeError("Metadata keys must be symbols, received: "+key)}function assertCallable(fn,hint){if("function"!=typeof fn)throw new TypeError(hint+" must be a function")}function assertValidReturnValue(kind,value){var type=typeof value;if(1===kind){if("object"!==type||null===value)throw new TypeError("accessor decorators must return an object with get, set, or init properties or void 0");void 0!==value.get&&assertCallable(value.get,"accessor.get"),void 0!==value.set&&assertCallable(value.set,"accessor.set"),void 0!==value.init&&assertCallable(value.init,"accessor.init"),void 0!==value.initializer&&assertCallable(value.initializer,"accessor.initializer")}else if("function"!==type){var hint;throw hint=0===kind?"field":10===kind?"class":"method",new TypeError(hint+" decorators must return a function or void 0")}}function getInit(desc){var initializer;return null==(initializer=desc.init)&&(initializer=desc.initializer)&&"undefined"!=typeof console&&console.warn(".initializer has been renamed to .init as of March 2022"),initializer}function applyMemberDec(ret,base,decInfo,name,kind,isStatic,isPrivate,metadataMap,initializers){var desc,initializer,value,newValue,get,set,decs=decInfo[0];if(isPrivate?desc=0===kind||1===kind?{get:decInfo[3],set:decInfo[4]}:3===kind?{get:decInfo[3]}:4===kind?{set:decInfo[3]}:{value:decInfo[3]}:0!==kind&&(desc=Object.getOwnPropertyDescriptor(base,name)),1===kind?value={get:desc.get,set:desc.set}:2===kind?value=desc.value:3===kind?value=desc.get:4===kind&&(value=desc.set),"function"==typeof decs)void 0!==(newValue=memberDec(decs,name,desc,metadataMap,initializers,kind,isStatic,isPrivate,value))&&(assertValidReturnValue(kind,newValue),0===kind?initializer=newValue:1===kind?(initializer=getInit(newValue),get=newValue.get||value.get,set=newValue.set||value.set,value={get:get,set:set}):value=newValue);else for(var i=decs.length-1;i>=0;i--){var newInit;if(void 0!==(newValue=memberDec(decs[i],name,desc,metadataMap,initializers,kind,isStatic,isPrivate,value)))assertValidReturnValue(kind,newValue),0===kind?newInit=newValue:1===kind?(newInit=getInit(newValue),get=newValue.get||value.get,set=newValue.set||value.set,value={get:get,set:set}):value=newValue,void 0!==newInit&&(void 0===initializer?initializer=newInit:"function"==typeof initializer?initializer=[initializer,newInit]:initializer.push(newInit))}if(0===kind||1===kind){if(void 0===initializer)initializer=function(instance,init){return init};else if("function"!=typeof initializer){var ownInitializers=initializer;initializer=function(instance,init){for(var value=init,i=0;i<ownInitializers.length;i++)value=ownInitializers[i].call(instance,value);return value}}else{var originalInitializer=initializer;initializer=function(instance,init){return originalInitializer.call(instance,init)}}ret.push(initializer)}0!==kind&&(1===kind?(desc.get=value.get,desc.set=value.set):2===kind?desc.value=value:3===kind?desc.get=value:4===kind&&(desc.set=value),isPrivate?1===kind?(ret.push((function(instance,args){return value.get.call(instance,args)})),ret.push((function(instance,args){return value.set.call(instance,args)}))):2===kind?ret.push(value):ret.push((function(instance,args){return value.call(instance,args)})):Object.defineProperty(base,name,desc))}function applyMemberDecs(ret,Class,protoMetadataMap,staticMetadataMap,decInfos){for(var protoInitializers,staticInitializers,existingProtoNonFields=new Map,existingStaticNonFields=new Map,i=0;i<decInfos.length;i++){var decInfo=decInfos[i];if(Array.isArray(decInfo)){var base,metadataMap,initializers,kind=decInfo[1],name=decInfo[2],isPrivate=decInfo.length>3,isStatic=kind>=5;if(isStatic?(base=Class,metadataMap=staticMetadataMap,0!==(kind-=5)&&(initializers=staticInitializers=staticInitializers||[])):(base=Class.prototype,metadataMap=protoMetadataMap,0!==kind&&(initializers=protoInitializers=protoInitializers||[])),0!==kind&&!isPrivate){var existingNonFields=isStatic?existingStaticNonFields:existingProtoNonFields,existingKind=existingNonFields.get(name)||0;if(!0===existingKind||3===existingKind&&4!==kind||4===existingKind&&3!==kind)throw new Error("Attempted to decorate a public method/accessor that has the same name as a previously decorated public method/accessor. This is not currently supported by the decorators plugin. Property name was: "+name);!existingKind&&kind>2?existingNonFields.set(name,kind):existingNonFields.set(name,!0)}applyMemberDec(ret,base,decInfo,name,kind,isStatic,isPrivate,metadataMap,initializers)}}pushInitializers(ret,protoInitializers),pushInitializers(ret,staticInitializers)}function pushInitializers(ret,initializers){initializers&&ret.push((function(instance){for(var i=0;i<initializers.length;i++)initializers[i].call(instance);return instance}))}function applyClassDecs(ret,targetClass,metadataMap,classDecs){if(classDecs.length>0){for(var initializers=[],newClass=targetClass,name=targetClass.name,i=classDecs.length-1;i>=0;i--){var decoratorFinishedRef={v:!1};try{var ctx=Object.assign({kind:"class",name:name,addInitializer:createAddInitializerMethod(initializers,decoratorFinishedRef)},createMetadataMethodsForProperty(metadataMap,0,name,decoratorFinishedRef)),nextNewClass=classDecs[i](newClass,ctx)}finally{decoratorFinishedRef.v=!0}void 0!==nextNewClass&&(assertValidReturnValue(10,nextNewClass),newClass=nextNewClass)}ret.push(newClass,(function(){for(var i=0;i<initializers.length;i++)initializers[i].call(newClass)}))}}export default function applyDecs(targetClass,memberDecs,classDecs){var ret=[],staticMetadataMap={},protoMetadataMap={};return applyMemberDecs(ret,targetClass,protoMetadataMap,staticMetadataMap,memberDecs),convertMetadataMapToFinal(targetClass.prototype,protoMetadataMap),applyClassDecs(ret,targetClass,staticMetadataMap,classDecs),convertMetadataMapToFinal(targetClass,staticMetadataMap),ret}'),asyncIterator:s("7.15.9",'export default function _asyncIterator(iterable){var method,async,sync,retry=2;for("undefined"!=typeof Symbol&&(async=Symbol.asyncIterator,sync=Symbol.iterator);retry--;){if(async&&null!=(method=iterable[async]))return method.call(iterable);if(sync&&null!=(method=iterable[sync]))return new AsyncFromSyncIterator(method.call(iterable));async="@@asyncIterator",sync="@@iterator"}throw new TypeError("Object is not async iterable")}function AsyncFromSyncIterator(s){function AsyncFromSyncIteratorContinuation(r){if(Object(r)!==r)return Promise.reject(new TypeError(r+" is not an object."));var done=r.done;return Promise.resolve(r.value).then((function(value){return{value:value,done:done}}))}return AsyncFromSyncIterator=function(s){this.s=s,this.n=s.next},AsyncFromSyncIterator.prototype={s:null,n:null,next:function(){return AsyncFromSyncIteratorContinuation(this.n.apply(this.s,arguments))},return:function(value){var ret=this.s.return;return void 0===ret?Promise.resolve({value:value,done:!0}):AsyncFromSyncIteratorContinuation(ret.apply(this.s,arguments))},throw:function(value){var thr=this.s.return;return void 0===thr?Promise.reject(value):AsyncFromSyncIteratorContinuation(thr.apply(this.s,arguments))}},new AsyncFromSyncIterator(s)}'),jsx:s("7.0.0-beta.0",'var REACT_ELEMENT_TYPE;export default function _createRawReactElement(type,props,key,children){REACT_ELEMENT_TYPE||(REACT_ELEMENT_TYPE="function"==typeof Symbol&&Symbol.for&&Symbol.for("react.element")||60103);var defaultProps=type&&type.defaultProps,childrenLength=arguments.length-3;if(props||0===childrenLength||(props={children:void 0}),1===childrenLength)props.children=children;else if(childrenLength>1){for(var childArray=new Array(childrenLength),i=0;i<childrenLength;i++)childArray[i]=arguments[i+3];props.children=childArray}if(props&&defaultProps)for(var propName in defaultProps)void 0===props[propName]&&(props[propName]=defaultProps[propName]);else props||(props=defaultProps||{});return{$$typeof:REACT_ELEMENT_TYPE,type:type,key:void 0===key?null:""+key,ref:null,props:props,_owner:null}}'),objectSpread2:s("7.5.0",'import defineProperty from"defineProperty";function ownKeys(object,enumerableOnly){var keys=Object.keys(object);if(Object.getOwnPropertySymbols){var symbols=Object.getOwnPropertySymbols(object);enumerableOnly&&(symbols=symbols.filter((function(sym){return Object.getOwnPropertyDescriptor(object,sym).enumerable}))),keys.push.apply(keys,symbols)}return keys}export default function _objectSpread2(target){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?ownKeys(Object(source),!0).forEach((function(key){defineProperty(target,key,source[key])})):Object.getOwnPropertyDescriptors?Object.defineProperties(target,Object.getOwnPropertyDescriptors(source)):ownKeys(Object(source)).forEach((function(key){Object.defineProperty(target,key,Object.getOwnPropertyDescriptor(source,key))}))}return target}'),regeneratorRuntime:s("7.18.0",'export default function _regeneratorRuntime(){"use strict";\n/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */_regeneratorRuntime=function(){return exports};var exports={},Op=Object.prototype,hasOwn=Op.hasOwnProperty,$Symbol="function"==typeof Symbol?Symbol:{},iteratorSymbol=$Symbol.iterator||"@@iterator",asyncIteratorSymbol=$Symbol.asyncIterator||"@@asyncIterator",toStringTagSymbol=$Symbol.toStringTag||"@@toStringTag";function define(obj,key,value){return Object.defineProperty(obj,key,{value:value,enumerable:!0,configurable:!0,writable:!0}),obj[key]}try{define({},"")}catch(err){define=function(obj,key,value){return obj[key]=value}}function wrap(innerFn,outerFn,self,tryLocsList){var protoGenerator=outerFn&&outerFn.prototype instanceof Generator?outerFn:Generator,generator=Object.create(protoGenerator.prototype),context=new Context(tryLocsList||[]);return generator._invoke=function(innerFn,self,context){var state="suspendedStart";return function(method,arg){if("executing"===state)throw new Error("Generator is already running");if("completed"===state){if("throw"===method)throw arg;return doneResult()}for(context.method=method,context.arg=arg;;){var delegate=context.delegate;if(delegate){var delegateResult=maybeInvokeDelegate(delegate,context);if(delegateResult){if(delegateResult===ContinueSentinel)continue;return delegateResult}}if("next"===context.method)context.sent=context._sent=context.arg;else if("throw"===context.method){if("suspendedStart"===state)throw state="completed",context.arg;context.dispatchException(context.arg)}else"return"===context.method&&context.abrupt("return",context.arg);state="executing";var record=tryCatch(innerFn,self,context);if("normal"===record.type){if(state=context.done?"completed":"suspendedYield",record.arg===ContinueSentinel)continue;return{value:record.arg,done:context.done}}"throw"===record.type&&(state="completed",context.method="throw",context.arg=record.arg)}}}(innerFn,self,context),generator}function tryCatch(fn,obj,arg){try{return{type:"normal",arg:fn.call(obj,arg)}}catch(err){return{type:"throw",arg:err}}}exports.wrap=wrap;var ContinueSentinel={};function Generator(){}function GeneratorFunction(){}function GeneratorFunctionPrototype(){}var IteratorPrototype={};define(IteratorPrototype,iteratorSymbol,(function(){return this}));var getProto=Object.getPrototypeOf,NativeIteratorPrototype=getProto&&getProto(getProto(values([])));NativeIteratorPrototype&&NativeIteratorPrototype!==Op&&hasOwn.call(NativeIteratorPrototype,iteratorSymbol)&&(IteratorPrototype=NativeIteratorPrototype);var Gp=GeneratorFunctionPrototype.prototype=Generator.prototype=Object.create(IteratorPrototype);function defineIteratorMethods(prototype){["next","throw","return"].forEach((function(method){define(prototype,method,(function(arg){return this._invoke(method,arg)}))}))}function AsyncIterator(generator,PromiseImpl){function invoke(method,arg,resolve,reject){var record=tryCatch(generator[method],generator,arg);if("throw"!==record.type){var result=record.arg,value=result.value;return value&&"object"==typeof value&&hasOwn.call(value,"__await")?PromiseImpl.resolve(value.__await).then((function(value){invoke("next",value,resolve,reject)}),(function(err){invoke("throw",err,resolve,reject)})):PromiseImpl.resolve(value).then((function(unwrapped){result.value=unwrapped,resolve(result)}),(function(error){return invoke("throw",error,resolve,reject)}))}reject(record.arg)}var previousPromise;this._invoke=function(method,arg){function callInvokeWithMethodAndArg(){return new PromiseImpl((function(resolve,reject){invoke(method,arg,resolve,reject)}))}return previousPromise=previousPromise?previousPromise.then(callInvokeWithMethodAndArg,callInvokeWithMethodAndArg):callInvokeWithMethodAndArg()}}function maybeInvokeDelegate(delegate,context){var method=delegate.iterator[context.method];if(undefined===method){if(context.delegate=null,"throw"===context.method){if(delegate.iterator.return&&(context.method="return",context.arg=undefined,maybeInvokeDelegate(delegate,context),"throw"===context.method))return ContinueSentinel;context.method="throw",context.arg=new TypeError("The iterator does not provide a \'throw\' method")}return ContinueSentinel}var record=tryCatch(method,delegate.iterator,context.arg);if("throw"===record.type)return context.method="throw",context.arg=record.arg,context.delegate=null,ContinueSentinel;var info=record.arg;return info?info.done?(context[delegate.resultName]=info.value,context.next=delegate.nextLoc,"return"!==context.method&&(context.method="next",context.arg=undefined),context.delegate=null,ContinueSentinel):info:(context.method="throw",context.arg=new TypeError("iterator result is not an object"),context.delegate=null,ContinueSentinel)}function pushTryEntry(locs){var entry={tryLoc:locs[0]};1 in locs&&(entry.catchLoc=locs[1]),2 in locs&&(entry.finallyLoc=locs[2],entry.afterLoc=locs[3]),this.tryEntries.push(entry)}function resetTryEntry(entry){var record=entry.completion||{};record.type="normal",delete record.arg,entry.completion=record}function Context(tryLocsList){this.tryEntries=[{tryLoc:"root"}],tryLocsList.forEach(pushTryEntry,this),this.reset(!0)}function values(iterable){if(iterable){var iteratorMethod=iterable[iteratorSymbol];if(iteratorMethod)return iteratorMethod.call(iterable);if("function"==typeof iterable.next)return iterable;if(!isNaN(iterable.length)){var i=-1,next=function next(){for(;++i<iterable.length;)if(hasOwn.call(iterable,i))return next.value=iterable[i],next.done=!1,next;return next.value=undefined,next.done=!0,next};return next.next=next}}return{next:doneResult}}function doneResult(){return{value:undefined,done:!0}}return GeneratorFunction.prototype=GeneratorFunctionPrototype,define(Gp,"constructor",GeneratorFunctionPrototype),define(GeneratorFunctionPrototype,"constructor",GeneratorFunction),GeneratorFunction.displayName=define(GeneratorFunctionPrototype,toStringTagSymbol,"GeneratorFunction"),exports.isGeneratorFunction=function(genFun){var ctor="function"==typeof genFun&&genFun.constructor;return!!ctor&&(ctor===GeneratorFunction||"GeneratorFunction"===(ctor.displayName||ctor.name))},exports.mark=function(genFun){return Object.setPrototypeOf?Object.setPrototypeOf(genFun,GeneratorFunctionPrototype):(genFun.__proto__=GeneratorFunctionPrototype,define(genFun,toStringTagSymbol,"GeneratorFunction")),genFun.prototype=Object.create(Gp),genFun},exports.awrap=function(arg){return{__await:arg}},defineIteratorMethods(AsyncIterator.prototype),define(AsyncIterator.prototype,asyncIteratorSymbol,(function(){return this})),exports.AsyncIterator=AsyncIterator,exports.async=function(innerFn,outerFn,self,tryLocsList,PromiseImpl){void 0===PromiseImpl&&(PromiseImpl=Promise);var iter=new AsyncIterator(wrap(innerFn,outerFn,self,tryLocsList),PromiseImpl);return exports.isGeneratorFunction(outerFn)?iter:iter.next().then((function(result){return result.done?result.value:iter.next()}))},defineIteratorMethods(Gp),define(Gp,toStringTagSymbol,"Generator"),define(Gp,iteratorSymbol,(function(){return this})),define(Gp,"toString",(function(){return"[object Generator]"})),exports.keys=function(object){var keys=[];for(var key in object)keys.push(key);return keys.reverse(),function next(){for(;keys.length;){var key=keys.pop();if(key in object)return next.value=key,next.done=!1,next}return next.done=!0,next}},exports.values=values,Context.prototype={constructor:Context,reset:function(skipTempReset){if(this.prev=0,this.next=0,this.sent=this._sent=undefined,this.done=!1,this.delegate=null,this.method="next",this.arg=undefined,this.tryEntries.forEach(resetTryEntry),!skipTempReset)for(var name in this)"t"===name.charAt(0)&&hasOwn.call(this,name)&&!isNaN(+name.slice(1))&&(this[name]=undefined)},stop:function(){this.done=!0;var rootRecord=this.tryEntries[0].completion;if("throw"===rootRecord.type)throw rootRecord.arg;return this.rval},dispatchException:function(exception){if(this.done)throw exception;var context=this;function handle(loc,caught){return record.type="throw",record.arg=exception,context.next=loc,caught&&(context.method="next",context.arg=undefined),!!caught}for(var i=this.tryEntries.length-1;i>=0;--i){var entry=this.tryEntries[i],record=entry.completion;if("root"===entry.tryLoc)return handle("end");if(entry.tryLoc<=this.prev){var hasCatch=hasOwn.call(entry,"catchLoc"),hasFinally=hasOwn.call(entry,"finallyLoc");if(hasCatch&&hasFinally){if(this.prev<entry.catchLoc)return handle(entry.catchLoc,!0);if(this.prev<entry.finallyLoc)return handle(entry.finallyLoc)}else if(hasCatch){if(this.prev<entry.catchLoc)return handle(entry.catchLoc,!0)}else{if(!hasFinally)throw new Error("try statement without catch or finally");if(this.prev<entry.finallyLoc)return handle(entry.finallyLoc)}}}},abrupt:function(type,arg){for(var i=this.tryEntries.length-1;i>=0;--i){var entry=this.tryEntries[i];if(entry.tryLoc<=this.prev&&hasOwn.call(entry,"finallyLoc")&&this.prev<entry.finallyLoc){var finallyEntry=entry;break}}finallyEntry&&("break"===type||"continue"===type)&&finallyEntry.tryLoc<=arg&&arg<=finallyEntry.finallyLoc&&(finallyEntry=null);var record=finallyEntry?finallyEntry.completion:{};return record.type=type,record.arg=arg,finallyEntry?(this.method="next",this.next=finallyEntry.finallyLoc,ContinueSentinel):this.complete(record)},complete:function(record,afterLoc){if("throw"===record.type)throw record.arg;return"break"===record.type||"continue"===record.type?this.next=record.arg:"return"===record.type?(this.rval=this.arg=record.arg,this.method="return",this.next="end"):"normal"===record.type&&afterLoc&&(this.next=afterLoc),ContinueSentinel},finish:function(finallyLoc){for(var i=this.tryEntries.length-1;i>=0;--i){var entry=this.tryEntries[i];if(entry.finallyLoc===finallyLoc)return this.complete(entry.completion,entry.afterLoc),resetTryEntry(entry),ContinueSentinel}},catch:function(tryLoc){for(var i=this.tryEntries.length-1;i>=0;--i){var entry=this.tryEntries[i];if(entry.tryLoc===tryLoc){var record=entry.completion;if("throw"===record.type){var thrown=record.arg;resetTryEntry(entry)}return thrown}}throw new Error("illegal catch attempt")},delegateYield:function(iterable,resultName,nextLoc){return this.delegate={iterator:values(iterable),resultName:resultName,nextLoc:nextLoc},"next"===this.method&&(this.arg=undefined),ContinueSentinel}},exports}'),typeof:s("7.0.0-beta.0",'export default function _typeof(obj){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(obj){return typeof obj}:function(obj){return obj&&"function"==typeof Symbol&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj},_typeof(obj)}'),wrapRegExp:s("7.2.6",'import setPrototypeOf from"setPrototypeOf";import inherits from"inherits";export default function _wrapRegExp(){_wrapRegExp=function(re,groups){return new BabelRegExp(re,void 0,groups)};var _super=RegExp.prototype,_groups=new WeakMap;function BabelRegExp(re,flags,groups){var _this=new RegExp(re,flags);return _groups.set(_this,groups||_groups.get(re)),setPrototypeOf(_this,BabelRegExp.prototype)}function buildGroups(result,re){var g=_groups.get(re);return Object.keys(g).reduce((function(groups,name){return groups[name]=result[g[name]],groups}),Object.create(null))}return inherits(BabelRegExp,RegExp),BabelRegExp.prototype.exec=function(str){var result=_super.exec.call(this,str);return result&&(result.groups=buildGroups(result,this)),result},BabelRegExp.prototype[Symbol.replace]=function(str,substitution){if("string"==typeof substitution){var groups=_groups.get(this);return _super[Symbol.replace].call(this,str,substitution.replace(/\\$<([^>]+)>/g,(function(_,name){return"$"+groups[name]})))}if("function"==typeof substitution){var _this=this;return _super[Symbol.replace].call(this,str,(function(){var args=arguments;return"object"!=typeof args[args.length-1]&&(args=[].slice.call(args)).push(buildGroups(args,_this)),substitution.apply(this,args)}))}return _super[Symbol.replace].call(this,str,substitution)},_wrapRegExp.apply(this,arguments)}')});t.default=i},"../../node_modules/@babel/helpers/lib/helpers.js":(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n=r("../../node_modules/@babel/template/lib/index.js"),s=r("../../node_modules/@babel/helpers/lib/helpers-generated.js");const i=Object.assign({__proto__:null},s.default);var a=i;t.default=a;const o=e=>t=>({minVersion:e,ast:()=>n.default.program.ast(t)});i.AwaitValue=o("7.0.0-beta.0")`
  export default function _AwaitValue(value) {
    this.wrapped = value;
  }
`,i.AsyncGenerator=o("7.0.0-beta.0")`
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
`,i.wrapAsyncGenerator=o("7.0.0-beta.0")`
  import AsyncGenerator from "AsyncGenerator";

  export default function _wrapAsyncGenerator(fn) {
    return function () {
      return new AsyncGenerator(fn.apply(this, arguments));
    };
  }
`,i.awaitAsyncGenerator=o("7.0.0-beta.0")`
  import AwaitValue from "AwaitValue";

  export default function _awaitAsyncGenerator(value) {
    return new AwaitValue(value);
  }
`,i.asyncGeneratorDelegate=o("7.0.0-beta.0")`
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
`,i.asyncToGenerator=o("7.0.0-beta.0")`
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
`,i.classCallCheck=o("7.0.0-beta.0")`
  export default function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
`,i.createClass=o("7.0.0-beta.0")`
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
`,i.defineEnumerableProperties=o("7.0.0-beta.0")`
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
`,i.defaults=o("7.0.0-beta.0")`
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
`,i.defineProperty=o("7.0.0-beta.0")`
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
`,i.extends=o("7.0.0-beta.0")`
  export default function _extends() {
    _extends = Object.assign ? Object.assign.bind() : function (target) {
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
`,i.objectSpread=o("7.0.0-beta.0")`
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
`,i.inherits=o("7.0.0-beta.0")`
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
`,i.inheritsLoose=o("7.0.0-beta.0")`
  import setPrototypeOf from "setPrototypeOf";

  export default function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    setPrototypeOf(subClass, superClass);
  }
`,i.getPrototypeOf=o("7.0.0-beta.0")`
  export default function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function _getPrototypeOf(o) {
          return o.__proto__ || Object.getPrototypeOf(o);
        };
    return _getPrototypeOf(o);
  }
`,i.setPrototypeOf=o("7.0.0-beta.0")`
  export default function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function _setPrototypeOf(o, p) {
          o.__proto__ = p;
          return o;
        };
    return _setPrototypeOf(o, p);
  }
`,i.isNativeReflectConstruct=o("7.9.0")`
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
`,i.construct=o("7.0.0-beta.0")`
  import setPrototypeOf from "setPrototypeOf";
  import isNativeReflectConstruct from "isNativeReflectConstruct";

  export default function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      _construct = Reflect.construct.bind();
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
`,i.isNativeFunction=o("7.0.0-beta.0")`
  export default function _isNativeFunction(fn) {
    // Note: This function returns "true" for core-js functions.
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }
`,i.wrapNativeSuper=o("7.0.0-beta.0")`
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
`,i.instanceof=o("7.0.0-beta.0")`
  export default function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
      return !!right[Symbol.hasInstance](left);
    } else {
      return left instanceof right;
    }
  }
`,i.interopRequireDefault=o("7.0.0-beta.0")`
  export default function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
`,i.interopRequireWildcard=o("7.14.0")`
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
`,i.newArrowCheck=o("7.0.0-beta.0")`
  export default function _newArrowCheck(innerThis, boundThis) {
    if (innerThis !== boundThis) {
      throw new TypeError("Cannot instantiate an arrow function");
    }
  }
`,i.objectDestructuringEmpty=o("7.0.0-beta.0")`
  export default function _objectDestructuringEmpty(obj) {
    if (obj == null) throw new TypeError("Cannot destructure undefined");
  }
`,i.objectWithoutPropertiesLoose=o("7.0.0-beta.0")`
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
`,i.objectWithoutProperties=o("7.0.0-beta.0")`
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
`,i.assertThisInitialized=o("7.0.0-beta.0")`
  export default function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
  }
`,i.possibleConstructorReturn=o("7.0.0-beta.0")`
  import assertThisInitialized from "assertThisInitialized";

  export default function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }

    return assertThisInitialized(self);
  }
`,i.createSuper=o("7.9.0")`
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
 `,i.superPropBase=o("7.0.0-beta.0")`
  import getPrototypeOf from "getPrototypeOf";

  export default function _superPropBase(object, property) {
    // Yes, this throws if object is null to being with, that's on purpose.
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = getPrototypeOf(object);
      if (object === null) break;
    }
    return object;
  }
`,i.get=o("7.0.0-beta.0")`
  import superPropBase from "superPropBase";

  export default function _get() {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get.bind();
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
`,i.set=o("7.0.0-beta.0")`
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
`,i.taggedTemplateLiteral=o("7.0.0-beta.0")`
  export default function _taggedTemplateLiteral(strings, raw) {
    if (!raw) { raw = strings.slice(0); }
    return Object.freeze(Object.defineProperties(strings, {
        raw: { value: Object.freeze(raw) }
    }));
  }
`,i.taggedTemplateLiteralLoose=o("7.0.0-beta.0")`
  export default function _taggedTemplateLiteralLoose(strings, raw) {
    if (!raw) { raw = strings.slice(0); }
    strings.raw = raw;
    return strings;
  }
`,i.readOnlyError=o("7.0.0-beta.0")`
  export default function _readOnlyError(name) {
    throw new TypeError("\\"" + name + "\\" is read-only");
  }
`,i.writeOnlyError=o("7.12.13")`
  export default function _writeOnlyError(name) {
    throw new TypeError("\\"" + name + "\\" is write-only");
  }
`,i.classNameTDZError=o("7.0.0-beta.0")`
  export default function _classNameTDZError(name) {
    throw new Error("Class \\"" + name + "\\" cannot be referenced in computed property keys.");
  }
`,i.temporalUndefined=o("7.0.0-beta.0")`
  // This function isn't mean to be called, but to be used as a reference.
  // We can't use a normal object because it isn't hoisted.
  export default function _temporalUndefined() {}
`,i.tdz=o("7.5.5")`
  export default function _tdzError(name) {
    throw new ReferenceError(name + " is not defined - temporal dead zone");
  }
`,i.temporalRef=o("7.0.0-beta.0")`
  import undef from "temporalUndefined";
  import err from "tdz";

  export default function _temporalRef(val, name) {
    return val === undef ? err(name) : val;
  }
`,i.slicedToArray=o("7.0.0-beta.0")`
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
`,i.slicedToArrayLoose=o("7.0.0-beta.0")`
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
`,i.toArray=o("7.0.0-beta.0")`
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
`,i.toConsumableArray=o("7.0.0-beta.0")`
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
`,i.arrayWithoutHoles=o("7.0.0-beta.0")`
  import arrayLikeToArray from "arrayLikeToArray";

  export default function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return arrayLikeToArray(arr);
  }
`,i.arrayWithHoles=o("7.0.0-beta.0")`
  export default function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
`,i.maybeArrayLike=o("7.9.0")`
  import arrayLikeToArray from "arrayLikeToArray";

  export default function _maybeArrayLike(next, arr, i) {
    if (arr && !Array.isArray(arr) && typeof arr.length === "number") {
      var len = arr.length;
      return arrayLikeToArray(arr, i !== void 0 && i < len ? i : len);
    }
    return next(arr, i);
  }
`,i.iterableToArray=o("7.0.0-beta.0")`
  export default function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
`,i.iterableToArrayLimit=o("7.0.0-beta.0")`
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
`,i.iterableToArrayLimitLoose=o("7.0.0-beta.0")`
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
`,i.unsupportedIterableToArray=o("7.9.0")`
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
`,i.arrayLikeToArray=o("7.9.0")`
  export default function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
`,i.nonIterableSpread=o("7.0.0-beta.0")`
  export default function _nonIterableSpread() {
    throw new TypeError(
      "Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
    );
  }
`,i.nonIterableRest=o("7.0.0-beta.0")`
  export default function _nonIterableRest() {
    throw new TypeError(
      "Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
    );
  }
`,i.createForOfIteratorHelper=o("7.9.0")`
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
`,i.createForOfIteratorHelperLoose=o("7.9.0")`
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
`,i.skipFirstGeneratorNext=o("7.0.0-beta.0")`
  export default function _skipFirstGeneratorNext(fn) {
    return function () {
      var it = fn.apply(this, arguments);
      it.next();
      return it;
    }
  }
`,i.toPrimitive=o("7.1.5")`
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
`,i.toPropertyKey=o("7.1.5")`
  import toPrimitive from "toPrimitive";

  export default function _toPropertyKey(arg) {
    var key = toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }
`,i.initializerWarningHelper=o("7.0.0-beta.0")`
    export default function _initializerWarningHelper(descriptor, context){
        throw new Error(
          'Decorating class property failed. Please ensure that ' +
          'proposal-class-properties is enabled and runs after the decorators transform.'
        );
    }
`,i.initializerDefineProperty=o("7.0.0-beta.0")`
    export default function _initializerDefineProperty(target, property, descriptor, context){
        if (!descriptor) return;

        Object.defineProperty(target, property, {
            enumerable: descriptor.enumerable,
            configurable: descriptor.configurable,
            writable: descriptor.writable,
            value: descriptor.initializer ? descriptor.initializer.call(context) : void 0,
        });
    }
`,i.applyDecoratedDescriptor=o("7.0.0-beta.0")`
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
`,i.classPrivateFieldLooseKey=o("7.0.0-beta.0")`
  var id = 0;
  export default function _classPrivateFieldKey(name) {
    return "__private_" + (id++) + "_" + name;
  }
`,i.classPrivateFieldLooseBase=o("7.0.0-beta.0")`
  export default function _classPrivateFieldBase(receiver, privateKey) {
    if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) {
      throw new TypeError("attempted to use private field on non-instance");
    }
    return receiver;
  }
`,i.classPrivateFieldGet=o("7.0.0-beta.0")`
  import classApplyDescriptorGet from "classApplyDescriptorGet";
  import classExtractFieldDescriptor from "classExtractFieldDescriptor";
  export default function _classPrivateFieldGet(receiver, privateMap) {
    var descriptor = classExtractFieldDescriptor(receiver, privateMap, "get");
    return classApplyDescriptorGet(receiver, descriptor);
  }
`,i.classPrivateFieldSet=o("7.0.0-beta.0")`
  import classApplyDescriptorSet from "classApplyDescriptorSet";
  import classExtractFieldDescriptor from "classExtractFieldDescriptor";
  export default function _classPrivateFieldSet(receiver, privateMap, value) {
    var descriptor = classExtractFieldDescriptor(receiver, privateMap, "set");
    classApplyDescriptorSet(receiver, descriptor, value);
    return value;
  }
`,i.classPrivateFieldDestructureSet=o("7.4.4")`
  import classApplyDescriptorDestructureSet from "classApplyDescriptorDestructureSet";
  import classExtractFieldDescriptor from "classExtractFieldDescriptor";
  export default function _classPrivateFieldDestructureSet(receiver, privateMap) {
    var descriptor = classExtractFieldDescriptor(receiver, privateMap, "set");
    return classApplyDescriptorDestructureSet(receiver, descriptor);
  }
`,i.classExtractFieldDescriptor=o("7.13.10")`
  export default function _classExtractFieldDescriptor(receiver, privateMap, action) {
    if (!privateMap.has(receiver)) {
      throw new TypeError("attempted to " + action + " private field on non-instance");
    }
    return privateMap.get(receiver);
  }
`,i.classStaticPrivateFieldSpecGet=o("7.0.2")`
  import classApplyDescriptorGet from "classApplyDescriptorGet";
  import classCheckPrivateStaticAccess from "classCheckPrivateStaticAccess";
  import classCheckPrivateStaticFieldDescriptor from "classCheckPrivateStaticFieldDescriptor";
  export default function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) {
    classCheckPrivateStaticAccess(receiver, classConstructor);
    classCheckPrivateStaticFieldDescriptor(descriptor, "get");
    return classApplyDescriptorGet(receiver, descriptor);
  }
`,i.classStaticPrivateFieldSpecSet=o("7.0.2")`
  import classApplyDescriptorSet from "classApplyDescriptorSet";
  import classCheckPrivateStaticAccess from "classCheckPrivateStaticAccess";
  import classCheckPrivateStaticFieldDescriptor from "classCheckPrivateStaticFieldDescriptor";
  export default function _classStaticPrivateFieldSpecSet(receiver, classConstructor, descriptor, value) {
    classCheckPrivateStaticAccess(receiver, classConstructor);
    classCheckPrivateStaticFieldDescriptor(descriptor, "set");
    classApplyDescriptorSet(receiver, descriptor, value);
    return value;
  }
`,i.classStaticPrivateMethodGet=o("7.3.2")`
  import classCheckPrivateStaticAccess from "classCheckPrivateStaticAccess";
  export default function _classStaticPrivateMethodGet(receiver, classConstructor, method) {
    classCheckPrivateStaticAccess(receiver, classConstructor);
    return method;
  }
`,i.classStaticPrivateMethodSet=o("7.3.2")`
  export default function _classStaticPrivateMethodSet() {
    throw new TypeError("attempted to set read only static private field");
  }
`,i.classApplyDescriptorGet=o("7.13.10")`
  export default function _classApplyDescriptorGet(receiver, descriptor) {
    if (descriptor.get) {
      return descriptor.get.call(receiver);
    }
    return descriptor.value;
  }
`,i.classApplyDescriptorSet=o("7.13.10")`
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
`,i.classApplyDescriptorDestructureSet=o("7.13.10")`
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
`,i.classStaticPrivateFieldDestructureSet=o("7.13.10")`
  import classApplyDescriptorDestructureSet from "classApplyDescriptorDestructureSet";
  import classCheckPrivateStaticAccess from "classCheckPrivateStaticAccess";
  import classCheckPrivateStaticFieldDescriptor from "classCheckPrivateStaticFieldDescriptor";
  export default function _classStaticPrivateFieldDestructureSet(receiver, classConstructor, descriptor) {
    classCheckPrivateStaticAccess(receiver, classConstructor);
    classCheckPrivateStaticFieldDescriptor(descriptor, "set");
    return classApplyDescriptorDestructureSet(receiver, descriptor);
  }
`,i.classCheckPrivateStaticAccess=o("7.13.10")`
  export default function _classCheckPrivateStaticAccess(receiver, classConstructor) {
    if (receiver !== classConstructor) {
      throw new TypeError("Private static access of wrong provenance");
    }
  }
`,i.classCheckPrivateStaticFieldDescriptor=o("7.13.10")`
  export default function _classCheckPrivateStaticFieldDescriptor(descriptor, action) {
    if (descriptor === undefined) {
      throw new TypeError("attempted to " + action + " private static field before its declaration");
    }
  }
`,i.decorate=o("7.1.5")`
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

`,i.classPrivateMethodGet=o("7.1.6")`
  export default function _classPrivateMethodGet(receiver, privateSet, fn) {
    if (!privateSet.has(receiver)) {
      throw new TypeError("attempted to get private field on non-instance");
    }
    return fn;
  }
`,i.checkPrivateRedeclaration=o("7.14.1")`
  export default function _checkPrivateRedeclaration(obj, privateCollection) {
    if (privateCollection.has(obj)) {
      throw new TypeError("Cannot initialize the same private elements twice on an object");
    }
  }
`,i.classPrivateFieldInitSpec=o("7.14.1")`
  import checkPrivateRedeclaration from "checkPrivateRedeclaration";

  export default function _classPrivateFieldInitSpec(obj, privateMap, value) {
    checkPrivateRedeclaration(obj, privateMap);
    privateMap.set(obj, value);
  }
`,i.classPrivateMethodInitSpec=o("7.14.1")`
  import checkPrivateRedeclaration from "checkPrivateRedeclaration";

  export default function _classPrivateMethodInitSpec(obj, privateSet) {
    checkPrivateRedeclaration(obj, privateSet);
    privateSet.add(obj);
  }
`,i.classPrivateMethodSet=o("7.1.6")`
    export default function _classPrivateMethodSet() {
      throw new TypeError("attempted to reassign private method");
    }
  `,i.identity=o("7.17.0")`
  export default function _identity(x) {
    return x;
  }
//# sourceMappingURL=648.1ccc8720.js.map