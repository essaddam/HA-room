function t(t,e,o,i){var n,r=arguments.length,s=r<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,i);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(s=(r<3?n(s):r>3?n(e,o,s):n(e,o))||s);return r>3&&s&&Object.defineProperty(e,o,s),s}function e(t,e){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(t,e)}"function"==typeof SuppressedError&&SuppressedError;const o=window,i=o.ShadowRoot&&(void 0===o.ShadyCSS||o.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap;let s=class{constructor(t,e,o){if(this._$cssResult$=!0,o!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const o=void 0!==e&&1===e.length;o&&(t=r.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),o&&r.set(e,t))}return t}toString(){return this.cssText}};const a=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,o,i)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+t[i+1],t[0]);return new s(o,t,n)},l=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const o of t.cssRules)e+=o.cssText;return(t=>new s("string"==typeof t?t:t+"",void 0,n))(e)})(t):t;var c;const h=window,d=h.trustedTypes,u=d?d.emptyScript:"",p=h.reactiveElementPolyfillSupport,g={toAttribute(t,e){switch(e){case Boolean:t=t?u:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let o=t;switch(e){case Boolean:o=null!==t;break;case Number:o=null===t?null:Number(t);break;case Object:case Array:try{o=JSON.parse(t)}catch(t){o=null}}return o}},m=(t,e)=>e!==t&&(e==e||t==t),_={attribute:!0,type:String,converter:g,reflect:!1,hasChanged:m},f="finalized";let v=class extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(t){var e;this.finalize(),(null!==(e=this.h)&&void 0!==e?e:this.h=[]).push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach((e,o)=>{const i=this._$Ep(o,e);void 0!==i&&(this._$Ev.set(i,o),t.push(i))}),t}static createProperty(t,e=_){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const o="symbol"==typeof t?Symbol():"__"+t,i=this.getPropertyDescriptor(t,o,e);void 0!==i&&Object.defineProperty(this.prototype,t,i)}}static getPropertyDescriptor(t,e,o){return{get(){return this[e]},set(i){const n=this[t];this[e]=i,this.requestUpdate(t,n,o)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||_}static finalize(){if(this.hasOwnProperty(f))return!1;this[f]=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,e=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const o of e)this.createProperty(o,t[o])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const o=new Set(t.flat(1/0).reverse());for(const t of o)e.unshift(l(t))}else void 0!==t&&e.push(l(t));return e}static _$Ep(t,e){const o=e.attribute;return!1===o?void 0:"string"==typeof o?o:"string"==typeof t?t.toLowerCase():void 0}_$Eu(){var t;this._$E_=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach(t=>t(this))}addController(t){var e,o;(null!==(e=this._$ES)&&void 0!==e?e:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(o=t.hostConnected)||void 0===o||o.call(t))}removeController(t){var e;null===(e=this._$ES)||void 0===e||e.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((t,e)=>{this.hasOwnProperty(e)&&(this._$Ei.set(e,this[e]),delete this[e])})}createRenderRoot(){var t;const e=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return((t,e)=>{i?t.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet):e.forEach(e=>{const i=document.createElement("style"),n=o.litNonce;void 0!==n&&i.setAttribute("nonce",n),i.textContent=e.cssText,t.appendChild(i)})})(e,this.constructor.elementStyles),e}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach(t=>{var e;return null===(e=t.hostConnected)||void 0===e?void 0:e.call(t)})}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach(t=>{var e;return null===(e=t.hostDisconnected)||void 0===e?void 0:e.call(t)})}attributeChangedCallback(t,e,o){this._$AK(t,o)}_$EO(t,e,o=_){var i;const n=this.constructor._$Ep(t,o);if(void 0!==n&&!0===o.reflect){const r=(void 0!==(null===(i=o.converter)||void 0===i?void 0:i.toAttribute)?o.converter:g).toAttribute(e,o.type);this._$El=t,null==r?this.removeAttribute(n):this.setAttribute(n,r),this._$El=null}}_$AK(t,e){var o;const i=this.constructor,n=i._$Ev.get(t);if(void 0!==n&&this._$El!==n){const t=i.getPropertyOptions(n),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(o=t.converter)||void 0===o?void 0:o.fromAttribute)?t.converter:g;this._$El=n,this[n]=r.fromAttribute(e,t.type),this._$El=null}}requestUpdate(t,e,o){let i=!0;void 0!==t&&(((o=o||this.constructor.getPropertyOptions(t)).hasChanged||m)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),!0===o.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,o))):i=!1),!this.isUpdatePending&&i&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((t,e)=>this[e]=t),this._$Ei=void 0);let e=!1;const o=this._$AL;try{e=this.shouldUpdate(o),e?(this.willUpdate(o),null===(t=this._$ES)||void 0===t||t.forEach(t=>{var e;return null===(e=t.hostUpdate)||void 0===e?void 0:e.call(t)}),this.update(o)):this._$Ek()}catch(t){throw e=!1,this._$Ek(),t}e&&this._$AE(o)}willUpdate(t){}_$AE(t){var e;null===(e=this._$ES)||void 0===e||e.forEach(t=>{var e;return null===(e=t.hostUpdated)||void 0===e?void 0:e.call(t)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){void 0!==this._$EC&&(this._$EC.forEach((t,e)=>this._$EO(e,this[e],t)),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}};var y;v[f]=!0,v.elementProperties=new Map,v.elementStyles=[],v.shadowRootOptions={mode:"open"},null==p||p({ReactiveElement:v}),(null!==(c=h.reactiveElementVersions)&&void 0!==c?c:h.reactiveElementVersions=[]).push("1.6.3");const b=window,$=b.trustedTypes,A=$?$.createPolicy("lit-html",{createHTML:t=>t}):void 0,C="$lit$",w=`lit$${(Math.random()+"").slice(9)}$`,E="?"+w,H=`<${E}>`,x=document,R=()=>x.createComment(""),S=t=>null===t||"object"!=typeof t&&"function"!=typeof t,k=Array.isArray,P="[ \t\n\f\r]",U=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,B=/-->/g,O=/>/g,N=RegExp(`>|${P}(?:([^\\s"'>=/]+)(${P}*=${P}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),L=/'/g,T=/"/g,M=/^(?:script|style|textarea|title)$/i,z=(t=>(e,...o)=>({_$litType$:t,strings:e,values:o}))(1),D=Symbol.for("lit-noChange"),j=Symbol.for("lit-nothing"),I=new WeakMap,V=x.createTreeWalker(x,129,null,!1);function F(t,e){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(e):e}const G=(t,e)=>{const o=t.length-1,i=[];let n,r=2===e?"<svg>":"",s=U;for(let e=0;e<o;e++){const o=t[e];let a,l,c=-1,h=0;for(;h<o.length&&(s.lastIndex=h,l=s.exec(o),null!==l);)h=s.lastIndex,s===U?"!--"===l[1]?s=B:void 0!==l[1]?s=O:void 0!==l[2]?(M.test(l[2])&&(n=RegExp("</"+l[2],"g")),s=N):void 0!==l[3]&&(s=N):s===N?">"===l[0]?(s=null!=n?n:U,c=-1):void 0===l[1]?c=-2:(c=s.lastIndex-l[2].length,a=l[1],s=void 0===l[3]?N:'"'===l[3]?T:L):s===T||s===L?s=N:s===B||s===O?s=U:(s=N,n=void 0);const d=s===N&&t[e+1].startsWith("/>")?" ":"";r+=s===U?o+H:c>=0?(i.push(a),o.slice(0,c)+C+o.slice(c)+w+d):o+w+(-2===c?(i.push(void 0),e):d)}return[F(t,r+(t[o]||"<?>")+(2===e?"</svg>":"")),i]};class W{constructor({strings:t,_$litType$:e},o){let i;this.parts=[];let n=0,r=0;const s=t.length-1,a=this.parts,[l,c]=G(t,e);if(this.el=W.createElement(l,o),V.currentNode=this.el.content,2===e){const t=this.el.content,e=t.firstChild;e.remove(),t.append(...e.childNodes)}for(;null!==(i=V.nextNode())&&a.length<s;){if(1===i.nodeType){if(i.hasAttributes()){const t=[];for(const e of i.getAttributeNames())if(e.endsWith(C)||e.startsWith(w)){const o=c[r++];if(t.push(e),void 0!==o){const t=i.getAttribute(o.toLowerCase()+C).split(w),e=/([.?@])?(.*)/.exec(o);a.push({type:1,index:n,name:e[2],strings:t,ctor:"."===e[1]?Z:"?"===e[1]?X:"@"===e[1]?tt:Y})}else a.push({type:6,index:n})}for(const e of t)i.removeAttribute(e)}if(M.test(i.tagName)){const t=i.textContent.split(w),e=t.length-1;if(e>0){i.textContent=$?$.emptyScript:"";for(let o=0;o<e;o++)i.append(t[o],R()),V.nextNode(),a.push({type:2,index:++n});i.append(t[e],R())}}}else if(8===i.nodeType)if(i.data===E)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=i.data.indexOf(w,t+1));)a.push({type:7,index:n}),t+=w.length-1}n++}}static createElement(t,e){const o=x.createElement("template");return o.innerHTML=t,o}}function q(t,e,o=t,i){var n,r,s,a;if(e===D)return e;let l=void 0!==i?null===(n=o._$Co)||void 0===n?void 0:n[i]:o._$Cl;const c=S(e)?void 0:e._$litDirective$;return(null==l?void 0:l.constructor)!==c&&(null===(r=null==l?void 0:l._$AO)||void 0===r||r.call(l,!1),void 0===c?l=void 0:(l=new c(t),l._$AT(t,o,i)),void 0!==i?(null!==(s=(a=o)._$Co)&&void 0!==s?s:a._$Co=[])[i]=l:o._$Cl=l),void 0!==l&&(e=q(t,l._$AS(t,e.values),l,i)),e}class K{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var e;const{el:{content:o},parts:i}=this._$AD,n=(null!==(e=null==t?void 0:t.creationScope)&&void 0!==e?e:x).importNode(o,!0);V.currentNode=n;let r=V.nextNode(),s=0,a=0,l=i[0];for(;void 0!==l;){if(s===l.index){let e;2===l.type?e=new J(r,r.nextSibling,this,t):1===l.type?e=new l.ctor(r,l.name,l.strings,this,t):6===l.type&&(e=new et(r,this,t)),this._$AV.push(e),l=i[++a]}s!==(null==l?void 0:l.index)&&(r=V.nextNode(),s++)}return V.currentNode=x,n}v(t){let e=0;for(const o of this._$AV)void 0!==o&&(void 0!==o.strings?(o._$AI(t,o,e),e+=o.strings.length-2):o._$AI(t[e])),e++}}class J{constructor(t,e,o,i){var n;this.type=2,this._$AH=j,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=o,this.options=i,this._$Cp=null===(n=null==i?void 0:i.isConnected)||void 0===n||n}get _$AU(){var t,e;return null!==(e=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==e?e:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===(null==t?void 0:t.nodeType)&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=q(this,t,e),S(t)?t===j||null==t||""===t?(this._$AH!==j&&this._$AR(),this._$AH=j):t!==this._$AH&&t!==D&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):(t=>k(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]))(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==j&&S(this._$AH)?this._$AA.nextSibling.data=t:this.$(x.createTextNode(t)),this._$AH=t}g(t){var e;const{values:o,_$litType$:i}=t,n="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=W.createElement(F(i.h,i.h[0]),this.options)),i);if((null===(e=this._$AH)||void 0===e?void 0:e._$AD)===n)this._$AH.v(o);else{const t=new K(n,this),e=t.u(this.options);t.v(o),this.$(e),this._$AH=t}}_$AC(t){let e=I.get(t.strings);return void 0===e&&I.set(t.strings,e=new W(t)),e}T(t){k(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let o,i=0;for(const n of t)i===e.length?e.push(o=new J(this.k(R()),this.k(R()),this,this.options)):o=e[i],o._$AI(n),i++;i<e.length&&(this._$AR(o&&o._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){var o;for(null===(o=this._$AP)||void 0===o||o.call(this,!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var e;void 0===this._$AM&&(this._$Cp=t,null===(e=this._$AP)||void 0===e||e.call(this,t))}}class Y{constructor(t,e,o,i,n){this.type=1,this._$AH=j,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=n,o.length>2||""!==o[0]||""!==o[1]?(this._$AH=Array(o.length-1).fill(new String),this.strings=o):this._$AH=j}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,o,i){const n=this.strings;let r=!1;if(void 0===n)t=q(this,t,e,0),r=!S(t)||t!==this._$AH&&t!==D,r&&(this._$AH=t);else{const i=t;let s,a;for(t=n[0],s=0;s<n.length-1;s++)a=q(this,i[o+s],e,s),a===D&&(a=this._$AH[s]),r||(r=!S(a)||a!==this._$AH[s]),a===j?t=j:t!==j&&(t+=(null!=a?a:"")+n[s+1]),this._$AH[s]=a}r&&!i&&this.j(t)}j(t){t===j?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class Z extends Y{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===j?void 0:t}}const Q=$?$.emptyScript:"";class X extends Y{constructor(){super(...arguments),this.type=4}j(t){t&&t!==j?this.element.setAttribute(this.name,Q):this.element.removeAttribute(this.name)}}class tt extends Y{constructor(t,e,o,i,n){super(t,e,o,i,n),this.type=5}_$AI(t,e=this){var o;if((t=null!==(o=q(this,t,e,0))&&void 0!==o?o:j)===D)return;const i=this._$AH,n=t===j&&i!==j||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==j&&(i===j||n);n&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,o;"function"==typeof this._$AH?this._$AH.call(null!==(o=null===(e=this.options)||void 0===e?void 0:e.host)&&void 0!==o?o:this.element,t):this._$AH.handleEvent(t)}}class et{constructor(t,e,o){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=o}get _$AU(){return this._$AM._$AU}_$AI(t){q(this,t)}}const ot=b.litHtmlPolyfillSupport;null==ot||ot(W,J),(null!==(y=b.litHtmlVersions)&&void 0!==y?y:b.litHtmlVersions=[]).push("2.8.0");var it,nt;class rt extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t,e;const o=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=o.firstChild),o}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,o)=>{var i,n;const r=null!==(i=null==o?void 0:o.renderBefore)&&void 0!==i?i:e;let s=r._$litPart$;if(void 0===s){const t=null!==(n=null==o?void 0:o.renderBefore)&&void 0!==n?n:null;r._$litPart$=s=new J(e.insertBefore(R(),t),t,void 0,null!=o?o:{})}return s._$AI(t),s})(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1)}render(){return D}}rt.finalized=!0,rt._$litElement$=!0,null===(it=globalThis.litElementHydrateSupport)||void 0===it||it.call(globalThis,{LitElement:rt});const st=globalThis.litElementPolyfillSupport;null==st||st({LitElement:rt}),(null!==(nt=globalThis.litElementVersions)&&void 0!==nt?nt:globalThis.litElementVersions=[]).push("3.3.3");const at=(t,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(o){o.createProperty(e.key,t)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this))},finisher(o){o.createProperty(e.key,t)}};function lt(t){return(e,o)=>void 0!==o?((t,e,o)=>{e.constructor.createProperty(o,t)})(t,e,o):at(t,e)}var ct;null===(ct=window.HTMLSlotElement)||void 0===ct||ct.prototype.assignedElements;const ht="ha-room-card",dt={name:"",icon:"mdi:home",icon_color:"blue",bg_start:"#1e3a5f",bg_end:"#2d5a87",temp_entity:"",hum_entity:"",extra_chips:[],power_list:[],light_list:[],presence_list:[],open_list:[],lights_hash:"#lights",plugs_hash:"#plugs",covers_hash:"#covers",presence_hash:"#presence",open_hash:"#open",audio_hash:"#audio",video_hash:"#video",cameras_hash:"#cameras",audio_cover_entity:"",video_cover_entity:"",covers_label:"Volets"};function ut(t,e){if(!t||!t.states)return console.warn("[Utils] Home Assistant instance or states not available"),null;const o=t.states[e];return o?{entity_id:e,state:o.state,attributes:o.attributes||{},last_changed:o.last_changed,last_updated:o.last_updated}:(console.warn("[Utils] Entity not found:",e),null)}function pt(t,e){const o=ut(t,e);if(!o)return console.warn("[Utils] No state for entity, returning 0:",e),0;const i=parseFloat(o.state);return isNaN(i)?(console.warn("[Utils] State not numeric for entity, returning 0:",e,"value:",o.state),0):i}function gt(t,e,o="on"){if(!Array.isArray(e))return console.error("[Utils] entityIds is not an array:",e),0;const i=e.filter(e=>{const i=ut(t,e);return i?.state===o}).length;return console.log("[Utils] Counted entities with state",o,":",i,"from",e.length,"entities"),i}function mt(t){return`${Math.round(t)} W`}class _t{static getConfigForm(){console.log("[HA Room Card Editor] Getting config form...");const t={schema:[{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{}}},{name:"icon_color",selector:{text:{}}},{type:"expandable",label:"Apparence",icon:"mdi:palette",schema:[{name:"bg_start",selector:{color:{}}},{name:"bg_end",selector:{color:{}}}]},{type:"expandable",label:"Capteurs",icon:"mdi:gauge",schema:[{name:"temp_entity",selector:{entity:{domain:["sensor","climate"]}}},{name:"hum_entity",selector:{entity:{domain:["sensor"]}}}]},{type:"expandable",label:"Listes d'entités",icon:"mdi:list",schema:[{name:"power_list",selector:{entity:{domain:["sensor"],multiple:!0}}},{name:"light_list",selector:{entity:{domain:["light"],multiple:!0}}},{name:"presence_list",selector:{entity:{domain:["binary_sensor","device_tracker"],multiple:!0}}},{name:"open_list",selector:{entity:{domain:["binary_sensor"],multiple:!0}}}]},{type:"expandable",label:"Navigation",icon:"mdi:navigation",schema:[{name:"lights_hash",selector:{text:{}}},{name:"plugs_hash",selector:{text:{}}},{name:"covers_hash",selector:{text:{}}},{name:"presence_hash",selector:{text:{}}},{name:"open_hash",selector:{text:{}}},{name:"audio_hash",selector:{text:{}}},{name:"video_hash",selector:{text:{}}},{name:"cameras_hash",selector:{text:{}}}]},{type:"expandable",label:"Média",icon:"mdi:play-circle",schema:[{name:"audio_cover_entity",selector:{entity:{domain:["media_player"]}}},{name:"video_cover_entity",selector:{entity:{domain:["media_player"]}}}]},{type:"expandable",label:"Personnalisation",icon:"mdi:cog",schema:[{name:"covers_label",selector:{text:{}}},{name:"features",selector:{select:{options:[{value:"full_card_actions",label:"Actions sur toute la carte"},{value:"enhanced_animations",label:"Animations améliorées"},{value:"adaptive_themes",label:"Thèmes adaptatifs"}],multiple:!0}}}]},{type:"expandable",label:"Actions",icon:"mdi:gesture-tap",schema:[{name:"tap_action",selector:{action:{}}},{name:"hold_action",selector:{action:{}}},{name:"double_tap_action",selector:{action:{}}}]}],assertConfig:t=>{if(console.log("[HA Room Card Editor] Validating config:",t),!t.name||"string"!=typeof t.name)throw console.error("[HA Room Card Editor] Name validation failed:",t.name),new Error("Le nom de la pièce est requis et doit être une chaîne de caractères");if(t.icon&&"string"!=typeof t.icon)throw console.error("[HA Room Card Editor] Icon validation failed:",t.icon),new Error("L'icône doit être une chaîne de caractères valide");if(t.icon_color&&!/^#[0-9a-fA-F]{6}$/.test(t.icon_color))throw console.error("[HA Room Card Editor] Icon color validation failed:",t.icon_color),new Error("La couleur de l'icône doit être au format hexadécimal (#RRGGBB)");if(t.bg_start&&!/^#[0-9a-fA-F]{6}$/.test(t.bg_start))throw console.error("[HA Room Card Editor] BG start color validation failed:",t.bg_start),new Error("La couleur de fond de départ doit être au format hexadécimal (#RRGGBB)");if(t.bg_end&&!/^#[0-9a-fA-F]{6}$/.test(t.bg_end))throw console.error("[HA Room Card Editor] BG end color validation failed:",t.bg_end),new Error("La couleur de fin de fond doit être au format hexadécimal (#RRGGBB)");console.log("[HA Room Card Editor] Config validation successful")},computeLabel:t=>({name:"Nom de la pièce",icon:"Icône",icon_color:"Couleur de l'icône",bg_start:"Couleur de fond (début)",bg_end:"Couleur de fond (fin)",temp_entity:"Capteur de température",hum_entity:"Capteur d'humidité",power_list:"Liste des capteurs de puissance",light_list:"Liste des lumières",presence_list:"Liste des capteurs de présence",open_list:"Liste des ouvrants",lights_hash:"Hash navigation lumières",plugs_hash:"Hash navigation prises",covers_hash:"Hash navigation volets",presence_hash:"Hash navigation présence",open_hash:"Hash navigation ouvrants",audio_hash:"Hash navigation audio",video_hash:"Hash navigation vidéo",cameras_hash:"Hash navigation caméras",audio_cover_entity:"Entité audio pour pochette",video_cover_entity:"Entité vidéo pour pochette",covers_label:"Label pour les volets",features:"Fonctionnalités avancées",tap_action:"Action au clic",hold_action:"Action au maintien",double_tap_action:"Action au double-clic"}[t.name]||t.name)};return console.log("[HA Room Card Editor] Form schema created:",t),t}static getStubConfig(){console.log("[HA Room Card Editor] Getting stub config...");const t={type:"custom:ha-room-card",name:"Salon",icon:"mdi:home",icon_color:"#ffffff",bg_start:"#667eea",bg_end:"#764ba2",power_list:[],light_list:[],presence_list:[],open_list:[]};return console.log("[HA Room Card Editor] Stub config created:",t),t}}console.info(`%c ${ht} %c 1.46.23`,"color: orange; font-weight: bold; background: black","color: white; font-weight: bold; background: dimgray"),console.log("🚀 GitHub Actions workflow test - modification effectuée"),console.log("[HA Room Card] Registering custom card..."),window.customCards=window.customCards||[];const ft={type:`custom:${ht}`,name:"HA Room Card",description:"Custom room card with modern design and interactive features",preview:!0,documentationURL:"https://github.com/essaddam/HA-room#readme",schemaURL:"/hacsfiles/ha-room-card/dist/ha-room-card-schema.json"};console.log("[HA Room Card] Card config:",ft),window.customCards.push(ft),console.log("[HA Room Card] Custom card registered successfully!");let vt=class extends rt{constructor(){super(...arguments),this.roomData={}}static get styles(){return a`
      :host {
        display: block;
      }

      ha-card {
        background: linear-gradient(135deg, var(--bg-start) 0%, var(--bg-end) 100%);
        border-radius: 20px;
        padding: 16px;
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
      }

      .card-header {
        background: transparent;
        --card-primary-font-size: 20px;
        --card-primary-font-weight: 650;
        margin-bottom: 12px;
      }

      .chips-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 16px;
      }

      .chip {
        display: inline-flex;
        align-items: center;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .chip:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-1px);
      }

      /* Home Assistant 2025.12 enhanced animations */
      .chip {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .control-button {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Enhanced focus styles for accessibility */
      .chip:focus,
      .control-button:focus {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }

      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .chip,
        .control-button {
          transition: none;
        }
      }

      .chip-icon {
        margin-right: 6px;
        font-size: 14px;
      }

      .button-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 16px;
      }

      .button-grid:last-child {
        margin-bottom: 0;
      }

      .control-button {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 12px;
        padding: 16px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid rgba(255, 255, 255, 0.1);
        position: relative;
        overflow: hidden;
      }

      .control-button:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .control-button.primary {
        background: rgba(255, 193, 7, 0.15);
        border-color: rgba(255, 193, 7, 0.3);
      }

      .control-button.primary:hover {
        background: rgba(255, 193, 7, 0.25);
      }

      .control-button.secondary {
        background: rgba(156, 39, 176, 0.15);
        border-color: rgba(156, 39, 176, 0.3);
      }

      .control-button.secondary:hover {
        background: rgba(156, 39, 176, 0.25);
      }

      .control-button.tertiary {
        background: rgba(0, 188, 212, 0.15);
        border-color: rgba(0, 188, 212, 0.3);
      }

      .control-button.tertiary:hover {
        background: rgba(0, 188, 212, 0.25);
      }

      .button-icon {
        font-size: 24px;
        margin-bottom: 8px;
        display: block;
      }

      .button-title {
        font-size: 14px;
        font-weight: 600;
        color: white;
        margin-bottom: 4px;
      }

      .button-subtitle {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
      }

      .media-cover {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        object-fit: cover;
        margin-bottom: 8px;
      }

      .full-card-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        cursor: pointer;
        z-index: 10;
      }

      @media (max-width: 768px) {
        .button-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        
        ha-card {
          padding: 12px;
        }
      }

      @media (max-width: 480px) {
        .button-grid {
          grid-template-columns: 1fr;
        }
        
        .chips-container {
          gap: 6px;
        }
        
        .chip {
          font-size: 11px;
          padding: 4px 8px;
        }
      }
    `}setConfig(t){if(console.log("[HA Room Card] Setting config:",t),!t)throw console.error("[HA Room Card] Invalid configuration provided"),new Error("Invalid configuration");this.config={...dt,...t},console.log("[HA Room Card] Final config:",this.config)}willUpdate(t){(t.has("hass")||t.has("config"))&&this._updateRoomData()}_updateRoomData(){if(console.log("[HA Room Card] Updating room data for:",this.config?.name||"Unknown room"),!this.hass||!this.config)return void console.error("[HA Room Card] Missing hass or config");const t={};if(this.config.temp_entity){console.log("[HA Room Card] Getting temperature for:",this.config.temp_entity);try{t.temperature=pt(this.hass,this.config.temp_entity),console.log("[HA Room Card] Temperature:",t.temperature)}catch(t){console.error("[HA Room Card] Error getting temperature:",t)}}if(this.config.hum_entity){console.log("[HA Room Card] Getting humidity for:",this.config.hum_entity);try{t.humidity=pt(this.hass,this.config.hum_entity),console.log("[HA Room Card] Humidity:",t.humidity)}catch(t){console.error("[HA Room Card] Error getting humidity:",t)}}if(this.config.power_list?.length){console.log("[HA Room Card] Calculating power for:",this.config.power_list);try{t.power_total=function(t,e){if(!Array.isArray(e))return console.error("[Utils] entityIds is not an array:",e),0;const o=e.reduce((e,o)=>e+pt(t,o),0);return console.log("[Utils] Total calculated for entities:",e,"total:",o),o}(this.hass,this.config.power_list),console.log("[HA Room Card] Power total:",t.power_total)}catch(t){console.error("[HA Room Card] Error calculating power:",t)}}if(this.config.presence_list?.length){console.log("[HA Room Card] Counting presence for:",this.config.presence_list);try{t.presence_count=gt(this.hass,this.config.presence_list,"on"),console.log("[HA Room Card] Presence count:",t.presence_count)}catch(t){console.error("[HA Room Card] Error counting presence:",t)}}if(this.config.open_list?.length){console.log("[HA Room Card] Counting open entities for:",this.config.open_list);try{t.open_count=gt(this.hass,this.config.open_list,"on"),console.log("[HA Room Card] Open count:",t.open_count)}catch(t){console.error("[HA Room Card] Error counting open entities:",t)}}if(this.config.light_list?.length){console.log("[HA Room Card] Counting lights for:",this.config.light_list);try{t.light_count=this.config.light_list.length,t.light_on_count=gt(this.hass,this.config.light_list,"on"),console.log("[HA Room Card] Light counts:",{total:t.light_count,on:t.light_on_count})}catch(t){console.error("[HA Room Card] Error counting lights:",t)}}console.log("[HA Room Card] Final room data:",t),this.roomData=t}_handleCardAction(){if(console.log("[HA Room Card] Handling card action..."),!this.config.tap_action||!this.hass)return void console.error("[HA Room Card] Missing tap_action or hass:",{tap_action:!!this.config.tap_action,hass:!!this.hass});const t=this.config.tap_action;if(console.log("[HA Room Card] Action to handle:",t),"navigate"===t.action&&t.navigation_path){console.log("[HA Room Card] Navigating to:",t.navigation_path);try{window.location.href=t.navigation_path}catch(t){console.error("[HA Room Card] Navigation error:",t)}}else if("more-info"===t.action&&t.entity){console.log("[HA Room Card] Showing more info for entity:",t.entity);try{const e=new CustomEvent("hass-more-info",{bubbles:!0,composed:!0,detail:{entityId:t.entity}});this.dispatchEvent(e)}catch(t){console.error("[HA Room Card] More info event error:",t)}}else if("call-service"===t.action&&t.service){console.log("[HA Room Card] Calling service:",t.service,"with data:",t.service_data);try{const[e,o]=t.service.split(".");if(console.log("[HA Room Card] Parsed service call:",{domain:e,service:o}),!e||!o)return void console.error("[HA Room Card] Invalid service format:",t.service);this.hass.callService(e,o,t.service_data||{}),console.log("[HA Room Card] Service call initiated successfully")}catch(t){console.error("[HA Room Card] Service call error:",t)}}else console.warn("[HA Room Card] Unknown action type or missing service:",t)}_renderChip(t,e,o,i,n){return z`
      <div 
        class="chip" 
        style="--chip-color: ${e}"
        @click=${()=>this._handleChipAction(i,n)}
      >
        <ha-icon class="chip-icon" icon=${t}></ha-icon>
        ${o}
      </div>
    `}_handleChipAction(t,e){if(console.log("[HA Room Card] Handling chip action:",{action:t,entity:e}),t&&this.hass)if("navigate"===t.action&&t.navigation_path){console.log("[HA Room Card] Chip navigating to:",t.navigation_path);try{window.location.href=t.navigation_path}catch(t){console.error("[HA Room Card] Chip navigation error:",t)}}else if("more-info"===t.action&&e){console.log("[HA Room Card] Chip showing more info for entity:",e);try{const t=new CustomEvent("hass-more-info",{bubbles:!0,composed:!0,detail:{entityId:e}});this.dispatchEvent(t)}catch(t){console.error("[HA Room Card] Chip more info event error:",t)}}else if("call-service"===t.action&&t.service){console.log("[HA Room Card] Chip calling service:",t.service,"with data:",t.service_data);try{const[e,o]=t.service.split(".");if(console.log("[HA Room Card] Chip parsed service call:",{domain:e,service:o}),!e||!o)return void console.error("[HA Room Card] Chip invalid service format:",t.service);this.hass.callService(e,o,t.service_data||{}),console.log("[HA Room Card] Chip service call initiated successfully")}catch(t){console.error("[HA Room Card] Chip service call error:",t)}}else console.warn("[HA Room Card] Chip unknown action type or missing service:",t);else console.error("[HA Room Card] Missing action or hass for chip:",{action:!!t,hass:!!this.hass})}_renderTemperatureChip(){if(!this.config.temp_entity)return j;const t=this.roomData.temperature,e=void 0!==t?(o=t,`${Math.round(o)}°C`):"—";var o;return this._renderChip("mdi:thermometer","orange",e,{action:"more-info"},this.config.temp_entity)}_renderHumidityChip(){if(!this.config.hum_entity)return j;const t=this.roomData.humidity,e=void 0!==t?(o=t,`${Math.round(o)}%`):"—";var o;return this._renderChip("mdi:water-percent","blue",e,{action:"more-info"},this.config.hum_entity)}_renderPowerChip(){if(!this.config.power_list?.length)return j;const t=mt(this.roomData.power_total||0);return this._renderChip("mdi:flash","yellow",t,{action:"navigate",navigation_path:this.config.plugs_hash})}_renderPresenceChip(){if(!this.config.presence_list?.length)return j;const t=this.roomData.presence_count||0,e=`${t} présence${t>1?"s":""}`;return this._renderChip("mdi:motion-sensor","teal",e,{action:"navigate",navigation_path:this.config.presence_hash})}_renderOpenChip(){if(!this.config.open_list?.length)return j;const t=this.roomData.open_count||0,e=`${t} ouvert${t>1?"s":""}`;return this._renderChip("mdi:door-open","red",e,{action:"navigate",navigation_path:this.config.open_hash})}_renderControlButton(t,e,o,i,n="primary",r){return z`
      <div 
        class="control-button ${n}"
        @click=${()=>this._handleButtonAction(i)}
      >
        ${r?z`<img class="media-cover" src="${r}" alt="${t}">`:z`<ha-icon class="button-icon" icon=${o}></ha-icon>`}
        <div class="button-title">${t}</div>
        <div class="button-subtitle">${e}</div>
      </div>
    `}_handleButtonAction(t){if(t&&this.hass)if("navigate"===t.action&&t.navigation_path)window.location.href=t.navigation_path;else{if("more-info"===t.action&&t.entity){const e=new CustomEvent("hass-more-info",{bubbles:!0,composed:!0,detail:{entityId:t.entity}});return void this.dispatchEvent(e)}if("call-service"===t.action&&t.service){const[e,o]=t.service.split(".");this.hass.callService(e,o,t.service_data||{})}}}_renderLightsButton(){const t=`${this.roomData.light_on_count||0} / ${this.roomData.light_count||0}`;return this._renderControlButton("Lumières",t,"mdi:lightbulb-group",{action:"navigate",navigation_path:this.config.lights_hash},"primary")}_renderPlugsButton(){const t=mt(this.roomData.power_total||0);return this._renderControlButton("Prises",t,"mdi:power-socket-fr",{action:"navigate",navigation_path:this.config.plugs_hash},"secondary")}_renderCoversButton(){return this._renderControlButton(this.config.covers_label||"Volets","Ouvrir / Fermer","mdi:blinds",{action:"navigate",navigation_path:this.config.covers_hash},"tertiary")}_renderAudioButton(){let t,e="—";if(this.config.audio_cover_entity){const o=ut(this.hass,this.config.audio_cover_entity);if(o){const i=o.attributes?.media_title,n=["playing","paused"].includes(o.state);e=n&&i?i:n?"En cours":"Arrêt",t=o.attributes?.entity_picture}}return this._renderControlButton("Audio",e,"mdi:speaker",{action:"navigate",navigation_path:this.config.audio_hash},"primary",t)}_renderVideoButton(){let t,e="—";if(this.config.video_cover_entity){const o=ut(this.hass,this.config.video_cover_entity);if(o){const i=o.attributes?.media_title,n=["playing","paused","on","idle"].includes(o.state);e=n&&i?i:n?"Actif":"Off",t=o.attributes?.entity_picture}}return this._renderControlButton("Vidéo",e,"mdi:television",{action:"navigate",navigation_path:this.config.video_hash},"secondary",t)}_renderCamerasButton(){return this._renderControlButton("Caméras","Live","mdi:cctv",{action:"navigate",navigation_path:this.config.cameras_hash},"tertiary")}render(){if(!this.config||!this.hass)return z`<ha-card>Chargement...</ha-card>`;const t=this.hass.themes,e=t?.primaryColor||"#03a9f4",o=t?.textColor||"#ffffff";return z`
      <ha-card
        style="--bg-start: ${this.config.bg_start}; --bg-end: ${this.config.bg_end}; --primary-color: ${e}; --text-color: ${o}"
        @click=${this._handleCardAction}
        tabindex="0"
        .label=${`HA Room Card: ${this.config.name||"Room"}`}
        role="button"
        aria-label=${`Room card for ${this.config.name||"Room"}`}
      >
        <!-- Full card overlay for actions -->
        ${this.config.features?.includes("full_card_actions")?z`<div class="full-card-overlay" @click=${()=>this._handleCardAction()}></div>`:j}

        <!-- Header -->
        <div class="card-header">
          <ha-card 
            header=${this.config.name||"Pièce"}
            icon=${this.config.icon}
            icon_color=${this.config.icon_color}
          ></ha-card>
        </div>

        <!-- Chips Row -->
        <div class="chips-container">
          ${this._renderTemperatureChip()}
          ${this._renderHumidityChip()}
          ${this.config.extra_chips?.map(t=>this._renderChip(t.icon,t.icon_color,t.content,t.tap_action))}
          ${this._renderPowerChip()}
          ${this._renderPresenceChip()}
          ${this._renderOpenChip()}
        </div>

        <!-- First Button Row: Lights / Plugs / Covers -->
        <div class="button-grid">
          ${this._renderLightsButton()}
          ${this._renderPlugsButton()}
          ${this._renderCoversButton()}
        </div>

        <!-- Second Button Row: Audio / Video / Cameras -->
        <div class="button-grid">
          ${this._renderAudioButton()}
          ${this._renderVideoButton()}
          ${this._renderCamerasButton()}
        </div>
      </ha-card>
    `}static getConfigForm(){return _t.getConfigForm()}static getStubConfig(){return _t.getStubConfig()}getGridOptions(){return{rows:4,columns:6,min_rows:3,max_rows:5}}getCardSize(){return 4}};t([lt({attribute:!1}),e("design:type",Object)],vt.prototype,"hass",void 0),t([lt({attribute:!1}),e("design:type",Object)],vt.prototype,"config",void 0),t([function(t){return lt({...t,state:!0})}(),e("design:type",Object)],vt.prototype,"roomData",void 0),vt=t([(t=>e=>"function"==typeof e?((t,e)=>(customElements.define(t,e),e))(t,e):((t,e)=>{const{kind:o,elements:i}=e;return{kind:o,elements:i,finisher(e){customElements.define(t,e)}}})(t,e))(ht)],vt);export{vt as HaRoomCard};
//# sourceMappingURL=ha-room-card.js.map
