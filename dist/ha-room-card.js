function t(t,e,i,n){var o,s=arguments.length,r=s<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,i,n);else for(var a=t.length-1;a>=0;a--)(o=t[a])&&(r=(s<3?o(r):s>3?o(e,i,r):o(e,i))||r);return s>3&&r&&Object.defineProperty(e,i,r),r}function e(t,e){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(t,e)}"function"==typeof SuppressedError&&SuppressedError;const i=window,n=i.ShadowRoot&&(void 0===i.ShadyCSS||i.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),s=new WeakMap;let r=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(n&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=s.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&s.set(e,t))}return t}toString(){return this.cssText}};const a=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,n)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[n+1],t[0]);return new r(i,t,o)},l=n?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new r("string"==typeof t?t:t+"",void 0,o))(e)})(t):t;var c;const h=window,d=h.trustedTypes,u=d?d.emptyScript:"",p=h.reactiveElementPolyfillSupport,_={toAttribute(t,e){switch(e){case Boolean:t=t?u:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},m=(t,e)=>e!==t&&(e==e||t==t),g={attribute:!0,type:String,converter:_,reflect:!1,hasChanged:m},v="finalized";let f=class extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(t){var e;this.finalize(),(null!==(e=this.h)&&void 0!==e?e:this.h=[]).push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach((e,i)=>{const n=this._$Ep(i,e);void 0!==n&&(this._$Ev.set(n,i),t.push(n))}),t}static createProperty(t,e=g){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i="symbol"==typeof t?Symbol():"__"+t,n=this.getPropertyDescriptor(t,i,e);void 0!==n&&Object.defineProperty(this.prototype,t,n)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(n){const o=this[t];this[e]=n,this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||g}static finalize(){if(this.hasOwnProperty(v))return!1;this[v]=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,e=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const i of e)this.createProperty(i,t[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(l(t))}else void 0!==t&&e.push(l(t));return e}static _$Ep(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}_$Eu(){var t;this._$E_=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach(t=>t(this))}addController(t){var e,i;(null!==(e=this._$ES)&&void 0!==e?e:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(i=t.hostConnected)||void 0===i||i.call(t))}removeController(t){var e;null===(e=this._$ES)||void 0===e||e.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((t,e)=>{this.hasOwnProperty(e)&&(this._$Ei.set(e,this[e]),delete this[e])})}createRenderRoot(){var t;const e=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return((t,e)=>{n?t.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet):e.forEach(e=>{const n=document.createElement("style"),o=i.litNonce;void 0!==o&&n.setAttribute("nonce",o),n.textContent=e.cssText,t.appendChild(n)})})(e,this.constructor.elementStyles),e}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach(t=>{var e;return null===(e=t.hostConnected)||void 0===e?void 0:e.call(t)})}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach(t=>{var e;return null===(e=t.hostDisconnected)||void 0===e?void 0:e.call(t)})}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$EO(t,e,i=g){var n;const o=this.constructor._$Ep(t,i);if(void 0!==o&&!0===i.reflect){const s=(void 0!==(null===(n=i.converter)||void 0===n?void 0:n.toAttribute)?i.converter:_).toAttribute(e,i.type);this._$El=t,null==s?this.removeAttribute(o):this.setAttribute(o,s),this._$El=null}}_$AK(t,e){var i;const n=this.constructor,o=n._$Ev.get(t);if(void 0!==o&&this._$El!==o){const t=n.getPropertyOptions(o),s="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(i=t.converter)||void 0===i?void 0:i.fromAttribute)?t.converter:_;this._$El=o,this[o]=s.fromAttribute(e,t.type),this._$El=null}}requestUpdate(t,e,i){let n=!0;void 0!==t&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||m)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),!0===i.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,i))):n=!1),!this.isUpdatePending&&n&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((t,e)=>this[e]=t),this._$Ei=void 0);let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),null===(t=this._$ES)||void 0===t||t.forEach(t=>{var e;return null===(e=t.hostUpdate)||void 0===e?void 0:e.call(t)}),this.update(i)):this._$Ek()}catch(t){throw e=!1,this._$Ek(),t}e&&this._$AE(i)}willUpdate(t){}_$AE(t){var e;null===(e=this._$ES)||void 0===e||e.forEach(t=>{var e;return null===(e=t.hostUpdated)||void 0===e?void 0:e.call(t)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){void 0!==this._$EC&&(this._$EC.forEach((t,e)=>this._$EO(e,this[e],t)),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}};var $;f[v]=!0,f.elementProperties=new Map,f.elementStyles=[],f.shadowRootOptions={mode:"open"},null==p||p({ReactiveElement:f}),(null!==(c=h.reactiveElementVersions)&&void 0!==c?c:h.reactiveElementVersions=[]).push("1.6.3");const y=window,b=y.trustedTypes,A=b?b.createPolicy("lit-html",{createHTML:t=>t}):void 0,w="$lit$",x=`lit$${(Math.random()+"").slice(9)}$`,C="?"+x,E=`<${C}>`,S=document,k=()=>S.createComment(""),P=t=>null===t||"object"!=typeof t&&"function"!=typeof t,R=Array.isArray,U="[ \t\n\f\r]",H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,B=/>/g,N=RegExp(`>|${U}(?:([^\\s"'>=/]+)(${U}*=${U}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),T=/'/g,M=/"/g,z=/^(?:script|style|textarea|title)$/i,D=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),L=Symbol.for("lit-noChange"),j=Symbol.for("lit-nothing"),I=new WeakMap,V=S.createTreeWalker(S,129,null,!1);function W(t,e){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(e):e}const F=(t,e)=>{const i=t.length-1,n=[];let o,s=2===e?"<svg>":"",r=H;for(let e=0;e<i;e++){const i=t[e];let a,l,c=-1,h=0;for(;h<i.length&&(r.lastIndex=h,l=r.exec(i),null!==l);)h=r.lastIndex,r===H?"!--"===l[1]?r=O:void 0!==l[1]?r=B:void 0!==l[2]?(z.test(l[2])&&(o=RegExp("</"+l[2],"g")),r=N):void 0!==l[3]&&(r=N):r===N?">"===l[0]?(r=null!=o?o:H,c=-1):void 0===l[1]?c=-2:(c=r.lastIndex-l[2].length,a=l[1],r=void 0===l[3]?N:'"'===l[3]?M:T):r===M||r===T?r=N:r===O||r===B?r=H:(r=N,o=void 0);const d=r===N&&t[e+1].startsWith("/>")?" ":"";s+=r===H?i+E:c>=0?(n.push(a),i.slice(0,c)+w+i.slice(c)+x+d):i+x+(-2===c?(n.push(void 0),e):d)}return[W(t,s+(t[i]||"<?>")+(2===e?"</svg>":"")),n]};class q{constructor({strings:t,_$litType$:e},i){let n;this.parts=[];let o=0,s=0;const r=t.length-1,a=this.parts,[l,c]=F(t,e);if(this.el=q.createElement(l,i),V.currentNode=this.el.content,2===e){const t=this.el.content,e=t.firstChild;e.remove(),t.append(...e.childNodes)}for(;null!==(n=V.nextNode())&&a.length<r;){if(1===n.nodeType){if(n.hasAttributes()){const t=[];for(const e of n.getAttributeNames())if(e.endsWith(w)||e.startsWith(x)){const i=c[s++];if(t.push(e),void 0!==i){const t=n.getAttribute(i.toLowerCase()+w).split(x),e=/([.?@])?(.*)/.exec(i);a.push({type:1,index:o,name:e[2],strings:t,ctor:"."===e[1]?G:"?"===e[1]?X:"@"===e[1]?tt:Z})}else a.push({type:6,index:o})}for(const e of t)n.removeAttribute(e)}if(z.test(n.tagName)){const t=n.textContent.split(x),e=t.length-1;if(e>0){n.textContent=b?b.emptyScript:"";for(let i=0;i<e;i++)n.append(t[i],k()),V.nextNode(),a.push({type:2,index:++o});n.append(t[e],k())}}}else if(8===n.nodeType)if(n.data===C)a.push({type:2,index:o});else{let t=-1;for(;-1!==(t=n.data.indexOf(x,t+1));)a.push({type:7,index:o}),t+=x.length-1}o++}}static createElement(t,e){const i=S.createElement("template");return i.innerHTML=t,i}}function K(t,e,i=t,n){var o,s,r,a;if(e===L)return e;let l=void 0!==n?null===(o=i._$Co)||void 0===o?void 0:o[n]:i._$Cl;const c=P(e)?void 0:e._$litDirective$;return(null==l?void 0:l.constructor)!==c&&(null===(s=null==l?void 0:l._$AO)||void 0===s||s.call(l,!1),void 0===c?l=void 0:(l=new c(t),l._$AT(t,i,n)),void 0!==n?(null!==(r=(a=i)._$Co)&&void 0!==r?r:a._$Co=[])[n]=l:i._$Cl=l),void 0!==l&&(e=K(t,l._$AS(t,e.values),l,n)),e}class J{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var e;const{el:{content:i},parts:n}=this._$AD,o=(null!==(e=null==t?void 0:t.creationScope)&&void 0!==e?e:S).importNode(i,!0);V.currentNode=o;let s=V.nextNode(),r=0,a=0,l=n[0];for(;void 0!==l;){if(r===l.index){let e;2===l.type?e=new Y(s,s.nextSibling,this,t):1===l.type?e=new l.ctor(s,l.name,l.strings,this,t):6===l.type&&(e=new et(s,this,t)),this._$AV.push(e),l=n[++a]}r!==(null==l?void 0:l.index)&&(s=V.nextNode(),r++)}return V.currentNode=S,o}v(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class Y{constructor(t,e,i,n){var o;this.type=2,this._$AH=j,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=n,this._$Cp=null===(o=null==n?void 0:n.isConnected)||void 0===o||o}get _$AU(){var t,e;return null!==(e=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==e?e:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===(null==t?void 0:t.nodeType)&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=K(this,t,e),P(t)?t===j||null==t||""===t?(this._$AH!==j&&this._$AR(),this._$AH=j):t!==this._$AH&&t!==L&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):(t=>R(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]))(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==j&&P(this._$AH)?this._$AA.nextSibling.data=t:this.$(S.createTextNode(t)),this._$AH=t}g(t){var e;const{values:i,_$litType$:n}=t,o="number"==typeof n?this._$AC(t):(void 0===n.el&&(n.el=q.createElement(W(n.h,n.h[0]),this.options)),n);if((null===(e=this._$AH)||void 0===e?void 0:e._$AD)===o)this._$AH.v(i);else{const t=new J(o,this),e=t.u(this.options);t.v(i),this.$(e),this._$AH=t}}_$AC(t){let e=I.get(t.strings);return void 0===e&&I.set(t.strings,e=new q(t)),e}T(t){R(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,n=0;for(const o of t)n===e.length?e.push(i=new Y(this.k(k()),this.k(k()),this,this.options)):i=e[n],i._$AI(o),n++;n<e.length&&(this._$AR(i&&i._$AB.nextSibling,n),e.length=n)}_$AR(t=this._$AA.nextSibling,e){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var e;void 0===this._$AM&&(this._$Cp=t,null===(e=this._$AP)||void 0===e||e.call(this,t))}}class Z{constructor(t,e,i,n,o){this.type=1,this._$AH=j,this._$AN=void 0,this.element=t,this.name=e,this._$AM=n,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=j}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,i,n){const o=this.strings;let s=!1;if(void 0===o)t=K(this,t,e,0),s=!P(t)||t!==this._$AH&&t!==L,s&&(this._$AH=t);else{const n=t;let r,a;for(t=o[0],r=0;r<o.length-1;r++)a=K(this,n[i+r],e,r),a===L&&(a=this._$AH[r]),s||(s=!P(a)||a!==this._$AH[r]),a===j?t=j:t!==j&&(t+=(null!=a?a:"")+o[r+1]),this._$AH[r]=a}s&&!n&&this.j(t)}j(t){t===j?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class G extends Z{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===j?void 0:t}}const Q=b?b.emptyScript:"";class X extends Z{constructor(){super(...arguments),this.type=4}j(t){t&&t!==j?this.element.setAttribute(this.name,Q):this.element.removeAttribute(this.name)}}class tt extends Z{constructor(t,e,i,n,o){super(t,e,i,n,o),this.type=5}_$AI(t,e=this){var i;if((t=null!==(i=K(this,t,e,0))&&void 0!==i?i:j)===L)return;const n=this._$AH,o=t===j&&n!==j||t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive,s=t!==j&&(n===j||o);o&&this.element.removeEventListener(this.name,this,n),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(e=this.options)||void 0===e?void 0:e.host)&&void 0!==i?i:this.element,t):this._$AH.handleEvent(t)}}class et{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){K(this,t)}}const it=y.litHtmlPolyfillSupport;null==it||it(q,Y),(null!==($=y.litHtmlVersions)&&void 0!==$?$:y.litHtmlVersions=[]).push("2.8.0");var nt,ot;class st extends f{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{var n,o;const s=null!==(n=null==i?void 0:i.renderBefore)&&void 0!==n?n:e;let r=s._$litPart$;if(void 0===r){const t=null!==(o=null==i?void 0:i.renderBefore)&&void 0!==o?o:null;s._$litPart$=r=new Y(e.insertBefore(k(),t),t,void 0,null!=i?i:{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1)}render(){return L}}st.finalized=!0,st._$litElement$=!0,null===(nt=globalThis.litElementHydrateSupport)||void 0===nt||nt.call(globalThis,{LitElement:st});const rt=globalThis.litElementPolyfillSupport;null==rt||rt({LitElement:st}),(null!==(ot=globalThis.litElementVersions)&&void 0!==ot?ot:globalThis.litElementVersions=[]).push("3.3.3");const at=(t,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(i){i.createProperty(e.key,t)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this))},finisher(i){i.createProperty(e.key,t)}};function lt(t){return(e,i)=>void 0!==i?((t,e,i)=>{e.constructor.createProperty(i,t)})(t,e,i):at(t,e)}var ct;null===(ct=window.HTMLSlotElement)||void 0===ct||ct.prototype.assignedElements;const ht="ha-room-card",dt={name:"",icon:"mdi:home",icon_color:"blue",bg_start:"#1e3a5f",bg_end:"#2d5a87",temp_entity:"",hum_entity:"",extra_chips:[],power_list:[],light_list:[],presence_list:[],open_list:[],lights_hash:"#lights",plugs_hash:"#plugs",covers_hash:"#covers",presence_hash:"#presence",open_hash:"#open",audio_hash:"#audio",video_hash:"#video",cameras_hash:"#cameras",audio_cover_entity:"",video_cover_entity:"",covers_label:"Volets"};function ut(t,e){const i=t.states[e];return i?{entity_id:e,state:i.state,attributes:i.attributes||{},last_changed:i.last_changed,last_updated:i.last_updated}:null}function pt(t,e){const i=ut(t,e);if(!i)return 0;const n=parseFloat(i.state);return isNaN(n)?0:n}function _t(t,e,i="on"){return e.filter(e=>{const n=ut(t,e);return n?.state===i}).length}function mt(t){return`${Math.round(t)} W`}console.info(`%c ${ht} %c 1.0.0`,"color: orange; font-weight: bold; background: black","color: white; font-weight: bold; background: dimgray"),window.customCards=window.customCards||[],window.customCards.push({type:ht,name:"HA Room Card",description:"Custom room card with modern design and interactive features",preview:!0,documentationURL:"https://github.com/yourusername/ha-room-card#readme",schemaURL:"/local/community/ha-room-card/ha-room-card-schema.json"});let gt=class extends st{constructor(){super(...arguments),this.roomData={}}static get styles(){return a`
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
    `}setConfig(t){if(!t)throw new Error("Invalid configuration");this.config={...dt,...t}}shouldUpdate(){return!0}willUpdate(){this._updateRoomData()}_updateRoomData(){if(!this.hass||!this.config)return;const t={};var e;this.config.temp_entity&&(t.temperature=pt(this.hass,this.config.temp_entity)),this.config.hum_entity&&(t.humidity=pt(this.hass,this.config.hum_entity)),this.config.power_list?.length&&(t.power_total=(e=this.hass,this.config.power_list.reduce((t,i)=>t+pt(e,i),0))),this.config.presence_list?.length&&(t.presence_count=_t(this.hass,this.config.presence_list,"on")),this.config.open_list?.length&&(t.open_count=_t(this.hass,this.config.open_list,"on")),this.config.light_list?.length&&(t.light_count=this.config.light_list.length,t.light_on_count=_t(this.hass,this.config.light_list,"on")),this.roomData=t}_handleCardAction(){if(!this.config.tap_action||!this.hass)return;const t=this.config.tap_action;if("navigate"===t.action&&t.navigation_path)window.location.href=t.navigation_path;else{if("more-info"===t.action&&t.entity){const e=new CustomEvent("hass-more-info",{bubbles:!0,composed:!0,detail:{entityId:t.entity}});return void this.dispatchEvent(e)}if("call-service"===t.action&&t.service){const[e,i]=t.service.split(".");this.hass.callService(e,i,t.service_data||{})}}}_renderChip(t,e,i,n,o){return D`
      <div 
        class="chip" 
        style="--chip-color: ${e}"
        @click=${()=>this._handleChipAction(n,o)}
      >
        <ha-icon class="chip-icon" icon=${t}></ha-icon>
        ${i}
      </div>
    `}_handleChipAction(t,e){if(t&&this.hass)if("navigate"===t.action&&t.navigation_path)window.location.href=t.navigation_path;else{if("more-info"===t.action&&e){const t=new CustomEvent("hass-more-info",{bubbles:!0,composed:!0,detail:{entityId:e}});return void this.dispatchEvent(t)}if("call-service"===t.action&&t.service){const[e,i]=t.service.split(".");this.hass.callService(e,i,t.service_data||{})}}}_renderTemperatureChip(){if(!this.config.temp_entity)return j;const t=this.roomData.temperature,e=void 0!==t?(i=t,`${Math.round(i)}°C`):"—";var i;return this._renderChip("mdi:thermometer","orange",e,{action:"more-info"},this.config.temp_entity)}_renderHumidityChip(){if(!this.config.hum_entity)return j;const t=this.roomData.humidity,e=void 0!==t?(i=t,`${Math.round(i)}%`):"—";var i;return this._renderChip("mdi:water-percent","blue",e,{action:"more-info"},this.config.hum_entity)}_renderPowerChip(){if(!this.config.power_list?.length)return j;const t=mt(this.roomData.power_total||0);return this._renderChip("mdi:flash","yellow",t,{action:"navigate",navigation_path:this.config.plugs_hash})}_renderPresenceChip(){if(!this.config.presence_list?.length)return j;const t=this.roomData.presence_count||0,e=`${t} présence${t>1?"s":""}`;return this._renderChip("mdi:motion-sensor","teal",e,{action:"navigate",navigation_path:this.config.presence_hash})}_renderOpenChip(){if(!this.config.open_list?.length)return j;const t=this.roomData.open_count||0,e=`${t} ouvert${t>1?"s":""}`;return this._renderChip("mdi:door-open","red",e,{action:"navigate",navigation_path:this.config.open_hash})}_renderControlButton(t,e,i,n,o="primary",s){return D`
      <div 
        class="control-button ${o}"
        @click=${()=>this._handleButtonAction(n)}
      >
        ${s?D`<img class="media-cover" src="${s}" alt="${t}">`:D`<ha-icon class="button-icon" icon=${i}></ha-icon>`}
        <div class="button-title">${t}</div>
        <div class="button-subtitle">${e}</div>
      </div>
    `}_handleButtonAction(t){if(t&&this.hass)if("navigate"===t.action&&t.navigation_path)window.location.href=t.navigation_path;else{if("more-info"===t.action&&t.entity){const e=new CustomEvent("hass-more-info",{bubbles:!0,composed:!0,detail:{entityId:t.entity}});return void this.dispatchEvent(e)}if("call-service"===t.action&&t.service){const[e,i]=t.service.split(".");this.hass.callService(e,i,t.service_data||{})}}}_renderLightsButton(){const t=`${this.roomData.light_on_count||0} / ${this.roomData.light_count||0}`;return this._renderControlButton("Lumières",t,"mdi:lightbulb-group",{action:"navigate",navigation_path:this.config.lights_hash},"primary")}_renderPlugsButton(){const t=mt(this.roomData.power_total||0);return this._renderControlButton("Prises",t,"mdi:power-socket-fr",{action:"navigate",navigation_path:this.config.plugs_hash},"secondary")}_renderCoversButton(){return this._renderControlButton(this.config.covers_label||"Volets","Ouvrir / Fermer","mdi:blinds",{action:"navigate",navigation_path:this.config.covers_hash},"tertiary")}_renderAudioButton(){let t,e="—";if(this.config.audio_cover_entity){const i=ut(this.hass,this.config.audio_cover_entity);if(i){const n=i.attributes?.media_title,o=["playing","paused"].includes(i.state);e=o&&n?n:o?"En cours":"Arrêt",t=i.attributes?.entity_picture}}return this._renderControlButton("Audio",e,"mdi:speaker",{action:"navigate",navigation_path:this.config.audio_hash},"primary",t)}_renderVideoButton(){let t,e="—";if(this.config.video_cover_entity){const i=ut(this.hass,this.config.video_cover_entity);if(i){const n=i.attributes?.media_title,o=["playing","paused","on","idle"].includes(i.state);e=o&&n?n:o?"Actif":"Off",t=i.attributes?.entity_picture}}return this._renderControlButton("Vidéo",e,"mdi:television",{action:"navigate",navigation_path:this.config.video_hash},"secondary",t)}_renderCamerasButton(){return this._renderControlButton("Caméras","Live","mdi:cctv",{action:"navigate",navigation_path:this.config.cameras_hash},"tertiary")}render(){if(!this.config||!this.hass)return D`<ha-card>Chargement...</ha-card>`;const t=this.hass.themes,e=t?.primaryColor||"#03a9f4",i=t?.textColor||"#ffffff";return D`
      <ha-card
        style="--bg-start: ${this.config.bg_start}; --bg-end: ${this.config.bg_end}; --primary-color: ${e}; --text-color: ${i}"
        @click=${this._handleCardAction}
        tabindex="0"
        .label=${`HA Room Card: ${this.config.name||"Room"}`}
        role="button"
        aria-label=${`Room card for ${this.config.name||"Room"}`}
      >
        <!-- Full card overlay for actions -->
        ${this.config.features?.includes("full_card_actions")?D`<div class="full-card-overlay" @click=${()=>this._handleCardAction()}></div>`:typeof j}

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
    `}static getConfigForm(){return{schema:[{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{}}},{name:"icon_color",selector:{text:{}}},{type:"expandable",label:"Apparence",icon:"mdi:palette",schema:[{name:"bg_start",selector:{color:{}}},{name:"bg_end",selector:{color:{}}}]},{type:"expandable",label:"Capteurs",icon:"mdi:gauge",schema:[{name:"temp_entity",selector:{entity:{domain:["sensor","climate"]}}},{name:"hum_entity",selector:{entity:{domain:["sensor"]}}}]},{type:"expandable",label:"Listes d'entités",icon:"mdi:list",schema:[{name:"power_list",selector:{entity:{domain:["sensor"],multiple:!0}}},{name:"light_list",selector:{entity:{domain:["light"],multiple:!0}}},{name:"presence_list",selector:{entity:{domain:["binary_sensor","device_tracker"],multiple:!0}}},{name:"open_list",selector:{entity:{domain:["binary_sensor"],multiple:!0}}}]},{type:"expandable",label:"Navigation",icon:"mdi:navigation",schema:[{name:"lights_hash",selector:{text:{}}},{name:"plugs_hash",selector:{text:{}}},{name:"covers_hash",selector:{text:{}}},{name:"presence_hash",selector:{text:{}}},{name:"open_hash",selector:{text:{}}},{name:"audio_hash",selector:{text:{}}},{name:"video_hash",selector:{text:{}}},{name:"cameras_hash",selector:{text:{}}}]},{type:"expandable",label:"Média",icon:"mdi:play-circle",schema:[{name:"audio_cover_entity",selector:{entity:{domain:["media_player"]}}},{name:"video_cover_entity",selector:{entity:{domain:["media_player"]}}}]},{type:"expandable",label:"Personnalisation",icon:"mdi:cog",schema:[{name:"covers_label",selector:{text:{}}},{name:"features",selector:{select:{options:[{value:"full_card_actions",label:"Actions sur toute la carte"},{value:"enhanced_animations",label:"Animations améliorées"},{value:"adaptive_themes",label:"Thèmes adaptatifs"}],multiple:!0}}}]},{type:"expandable",label:"Actions",icon:"mdi:gesture-tap",schema:[{name:"tap_action",selector:{action:{}}},{name:"hold_action",selector:{action:{}}},{name:"double_tap_action",selector:{action:{}}}]}]}}static getStubConfig(){return{name:"Salon",icon:"mdi:home",temp_entity:"sensor.temperature",hum_entity:"sensor.humidity",power_list:["sensor.tv_power","sensor.lamp_power"],light_list:["light.living_room_main","light.living_roomAccent"],presence_list:["binary_sensor.motion"],open_list:["binary_sensor.door","binary_sensor.window"]}}getGridOptions(){return{rows:4,columns:6,min_rows:3,max_rows:5}}getCardSize(){return 4}};t([lt({attribute:!1}),e("design:type",Object)],gt.prototype,"hass",void 0),t([lt({attribute:!1}),e("design:type",Object)],gt.prototype,"config",void 0),t([function(t){return lt({...t,state:!0})}(),e("design:type",Object)],gt.prototype,"roomData",void 0),gt=t([(t=>e=>"function"==typeof e?((t,e)=>(customElements.define(t,e),e))(t,e):((t,e)=>{const{kind:i,elements:n}=e;return{kind:i,elements:n,finisher(e){customElements.define(t,e)}}})(t,e))(ht)],gt);export{gt as HaRoomCard};
//# sourceMappingURL=ha-room-card.js.map
