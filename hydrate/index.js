'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*!
 Stencil Mock Doc v2.6.0 | MIT Licensed | https://stenciljs.com
 */
const CONTENT_REF_ID = 'r';
const ORG_LOCATION_ID = 'o';
const SLOT_NODE_ID = 's';
const TEXT_NODE_ID = 't';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

const attrHandler = {
  get(obj, prop) {
    if (prop in obj) {
      return obj[prop];
    }
    if (typeof prop !== 'symbol' && !isNaN(prop)) {
      return obj.__items[prop];
    }
    return undefined;
  },
};
const createAttributeProxy = (caseInsensitive) => new Proxy(new MockAttributeMap(caseInsensitive), attrHandler);
class MockAttributeMap {
  constructor(caseInsensitive = false) {
    this.caseInsensitive = caseInsensitive;
    this.__items = [];
  }
  get length() {
    return this.__items.length;
  }
  item(index) {
    return this.__items[index] || null;
  }
  setNamedItem(attr) {
    attr.namespaceURI = null;
    this.setNamedItemNS(attr);
  }
  setNamedItemNS(attr) {
    if (attr != null && attr.value != null) {
      attr.value = String(attr.value);
    }
    const existingAttr = this.__items.find(a => a.name === attr.name && a.namespaceURI === attr.namespaceURI);
    if (existingAttr != null) {
      existingAttr.value = attr.value;
    }
    else {
      this.__items.push(attr);
    }
  }
  getNamedItem(attrName) {
    if (this.caseInsensitive) {
      attrName = attrName.toLowerCase();
    }
    return this.getNamedItemNS(null, attrName);
  }
  getNamedItemNS(namespaceURI, attrName) {
    namespaceURI = getNamespaceURI(namespaceURI);
    return (this.__items.find(attr => attr.name === attrName && getNamespaceURI(attr.namespaceURI) === namespaceURI) || null);
  }
  removeNamedItem(attr) {
    this.removeNamedItemNS(attr);
  }
  removeNamedItemNS(attr) {
    for (let i = 0, ii = this.__items.length; i < ii; i++) {
      if (this.__items[i].name === attr.name && this.__items[i].namespaceURI === attr.namespaceURI) {
        this.__items.splice(i, 1);
        break;
      }
    }
  }
  [Symbol.iterator]() {
    let i = 0;
    return {
      next: () => ({
        done: i === this.length,
        value: this.item(i++),
      }),
    };
  }
  get [Symbol.toStringTag]() {
    return 'MockAttributeMap';
  }
}
function getNamespaceURI(namespaceURI) {
  return namespaceURI === XLINK_NS ? null : namespaceURI;
}
function cloneAttributes(srcAttrs, sortByName = false) {
  const dstAttrs = new MockAttributeMap(srcAttrs.caseInsensitive);
  if (srcAttrs != null) {
    const attrLen = srcAttrs.length;
    if (sortByName && attrLen > 1) {
      const sortedAttrs = [];
      for (let i = 0; i < attrLen; i++) {
        const srcAttr = srcAttrs.item(i);
        const dstAttr = new MockAttr(srcAttr.name, srcAttr.value, srcAttr.namespaceURI);
        sortedAttrs.push(dstAttr);
      }
      sortedAttrs.sort(sortAttributes).forEach(attr => {
        dstAttrs.setNamedItemNS(attr);
      });
    }
    else {
      for (let i = 0; i < attrLen; i++) {
        const srcAttr = srcAttrs.item(i);
        const dstAttr = new MockAttr(srcAttr.name, srcAttr.value, srcAttr.namespaceURI);
        dstAttrs.setNamedItemNS(dstAttr);
      }
    }
  }
  return dstAttrs;
}
function sortAttributes(a, b) {
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return 1;
  return 0;
}
class MockAttr {
  constructor(attrName, attrValue, namespaceURI = null) {
    this._name = attrName;
    this._value = String(attrValue);
    this._namespaceURI = namespaceURI;
  }
  get name() {
    return this._name;
  }
  set name(value) {
    this._name = value;
  }
  get value() {
    return this._value;
  }
  set value(value) {
    this._value = String(value);
  }
  get nodeName() {
    return this._name;
  }
  set nodeName(value) {
    this._name = value;
  }
  get nodeValue() {
    return this._value;
  }
  set nodeValue(value) {
    this._value = String(value);
  }
  get namespaceURI() {
    return this._namespaceURI;
  }
  set namespaceURI(namespaceURI) {
    this._namespaceURI = namespaceURI;
  }
}

class MockCustomElementRegistry {
  constructor(win) {
    this.win = win;
  }
  define(tagName, cstr, options) {
    if (tagName.toLowerCase() !== tagName) {
      throw new Error(`Failed to execute 'define' on 'CustomElementRegistry': "${tagName}" is not a valid custom element name`);
    }
    if (this.__registry == null) {
      this.__registry = new Map();
    }
    this.__registry.set(tagName, { cstr, options });
    if (this.__whenDefined != null) {
      const whenDefinedResolveFns = this.__whenDefined.get(tagName);
      if (whenDefinedResolveFns != null) {
        whenDefinedResolveFns.forEach(whenDefinedResolveFn => {
          whenDefinedResolveFn();
        });
        whenDefinedResolveFns.length = 0;
        this.__whenDefined.delete(tagName);
      }
    }
    const doc = this.win.document;
    if (doc != null) {
      const hosts = doc.querySelectorAll(tagName);
      hosts.forEach(host => {
        if (upgradedElements.has(host) === false) {
          tempDisableCallbacks.add(doc);
          const upgradedCmp = createCustomElement(this, doc, tagName);
          for (let i = 0; i < host.childNodes.length; i++) {
            const childNode = host.childNodes[i];
            childNode.remove();
            upgradedCmp.appendChild(childNode);
          }
          tempDisableCallbacks.delete(doc);
          if (proxyElements.has(host)) {
            proxyElements.set(host, upgradedCmp);
          }
        }
        fireConnectedCallback(host);
      });
    }
  }
  get(tagName) {
    if (this.__registry != null) {
      const def = this.__registry.get(tagName.toLowerCase());
      if (def != null) {
        return def.cstr;
      }
    }
    return undefined;
  }
  upgrade(_rootNode) {
    //
  }
  clear() {
    if (this.__registry != null) {
      this.__registry.clear();
    }
    if (this.__whenDefined != null) {
      this.__whenDefined.clear();
    }
  }
  whenDefined(tagName) {
    tagName = tagName.toLowerCase();
    if (this.__registry != null && this.__registry.has(tagName) === true) {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      if (this.__whenDefined == null) {
        this.__whenDefined = new Map();
      }
      let whenDefinedResolveFns = this.__whenDefined.get(tagName);
      if (whenDefinedResolveFns == null) {
        whenDefinedResolveFns = [];
        this.__whenDefined.set(tagName, whenDefinedResolveFns);
      }
      whenDefinedResolveFns.push(resolve);
    });
  }
}
function createCustomElement(customElements, ownerDocument, tagName) {
  const Cstr = customElements.get(tagName);
  if (Cstr != null) {
    const cmp = new Cstr(ownerDocument);
    cmp.nodeName = tagName.toUpperCase();
    upgradedElements.add(cmp);
    return cmp;
  }
  const host = new Proxy({}, {
    get(obj, prop) {
      const elm = proxyElements.get(host);
      if (elm != null) {
        return elm[prop];
      }
      return obj[prop];
    },
    set(obj, prop, val) {
      const elm = proxyElements.get(host);
      if (elm != null) {
        elm[prop] = val;
      }
      else {
        obj[prop] = val;
      }
      return true;
    },
    has(obj, prop) {
      const elm = proxyElements.get(host);
      if (prop in elm) {
        return true;
      }
      if (prop in obj) {
        return true;
      }
      return false;
    },
  });
  const elm = new MockHTMLElement(ownerDocument, tagName);
  proxyElements.set(host, elm);
  return host;
}
const proxyElements = new WeakMap();
const upgradedElements = new WeakSet();
function connectNode(ownerDocument, node) {
  node.ownerDocument = ownerDocument;
  if (node.nodeType === 1 /* ELEMENT_NODE */) {
    if (ownerDocument != null && node.nodeName.includes('-')) {
      const win = ownerDocument.defaultView;
      if (win != null && typeof node.connectedCallback === 'function' && node.isConnected) {
        fireConnectedCallback(node);
      }
      const shadowRoot = node.shadowRoot;
      if (shadowRoot != null) {
        shadowRoot.childNodes.forEach(childNode => {
          connectNode(ownerDocument, childNode);
        });
      }
    }
    node.childNodes.forEach(childNode => {
      connectNode(ownerDocument, childNode);
    });
  }
  else {
    node.childNodes.forEach(childNode => {
      childNode.ownerDocument = ownerDocument;
    });
  }
}
function fireConnectedCallback(node) {
  if (typeof node.connectedCallback === 'function') {
    if (tempDisableCallbacks.has(node.ownerDocument) === false) {
      try {
        node.connectedCallback();
      }
      catch (e) {
        console.error(e);
      }
    }
  }
}
function disconnectNode(node) {
  if (node.nodeType === 1 /* ELEMENT_NODE */) {
    if (node.nodeName.includes('-') === true && typeof node.disconnectedCallback === 'function') {
      if (tempDisableCallbacks.has(node.ownerDocument) === false) {
        try {
          node.disconnectedCallback();
        }
        catch (e) {
          console.error(e);
        }
      }
    }
    node.childNodes.forEach(disconnectNode);
  }
}
function attributeChanged(node, attrName, oldValue, newValue) {
  attrName = attrName.toLowerCase();
  const observedAttributes = node.constructor.observedAttributes;
  if (Array.isArray(observedAttributes) === true && observedAttributes.some(obs => obs.toLowerCase() === attrName) === true) {
    try {
      node.attributeChangedCallback(attrName, oldValue, newValue);
    }
    catch (e) {
      console.error(e);
    }
  }
}
function checkAttributeChanged(node) {
  return node.nodeName.includes('-') === true && typeof node.attributeChangedCallback === 'function';
}
const tempDisableCallbacks = new Set();

function dataset(elm) {
  const ds = {};
  const attributes = elm.attributes;
  const attrLen = attributes.length;
  for (let i = 0; i < attrLen; i++) {
    const attr = attributes.item(i);
    const nodeName = attr.nodeName;
    if (nodeName.startsWith('data-')) {
      ds[dashToPascalCase(nodeName)] = attr.nodeValue;
    }
  }
  return new Proxy(ds, {
    get(_obj, camelCaseProp) {
      return ds[camelCaseProp];
    },
    set(_obj, camelCaseProp, value) {
      const dataAttr = toDataAttribute(camelCaseProp);
      elm.setAttribute(dataAttr, value);
      return true;
    },
  });
}
function toDataAttribute(str) {
  return ('data-' +
    String(str)
      .replace(/([A-Z0-9])/g, g => ' ' + g[0])
      .trim()
      .replace(/ /g, '-')
      .toLowerCase());
}
function dashToPascalCase(str) {
  str = String(str).substr(5);
  return str
    .split('-')
    .map((segment, index) => {
    if (index === 0) {
      return segment.charAt(0).toLowerCase() + segment.slice(1);
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  })
    .join('');
}

// Sizzle 2.3.6
const Sizzle = (function() {
const window = {
  document: {
  createElement() {
    return {};
  },
  nodeType: 9,
  documentElement: {
    nodeType: 1,
    nodeName: 'HTML'
  }
  }
};
const module = { exports: {} };

/*! Sizzle v2.3.6 | (c) JS Foundation and other contributors | js.foundation */
!function(e){var t,n,r,i,o,u,l,a,c,s,d,f,p,h,g,m,y,v,w,b="sizzle"+1*new Date,N=e.document,C=0,x=0,E=ae(),A=ae(),S=ae(),D=ae(),T=function(e,t){return e===t&&(d=!0),0},L={}.hasOwnProperty,q=[],I=q.pop,B=q.push,R=q.push,$=q.slice,k=function(e,t){for(var n=0,r=e.length;n<r;n++)if(e[n]===t)return n;return -1},H="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",M="[\\x20\\t\\r\\n\\f]",P="(?:\\\\[\\da-fA-F]{1,6}"+M+"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",z="\\["+M+"*("+P+")(?:"+M+"*([*^$|!~]?=)"+M+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+P+"))|)"+M+"*\\]",F=":("+P+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+z+")*)|.*)\\)|)",O=new RegExp(M+"+","g"),j=new RegExp("^"+M+"+|((?:^|[^\\\\])(?:\\\\.)*)"+M+"+$","g"),G=new RegExp("^"+M+"*,"+M+"*"),U=new RegExp("^"+M+"*([>+~]|"+M+")"+M+"*"),V=new RegExp(M+"|>"),X=new RegExp(F),J=new RegExp("^"+P+"$"),K={ID:new RegExp("^#("+P+")"),CLASS:new RegExp("^\\.("+P+")"),TAG:new RegExp("^("+P+"|[*])"),ATTR:new RegExp("^"+z),PSEUDO:new RegExp("^"+F),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+M+"*(even|odd|(([+-]|)(\\d*)n|)"+M+"*(?:([+-]|)"+M+"*(\\d+)|))"+M+"*\\)|)","i"),bool:new RegExp("^(?:"+H+")$","i"),needsContext:new RegExp("^"+M+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+M+"*((?:-\\d)?\\d*)"+M+"*\\)|)(?=[^-]|$)","i")},Q=/HTML$/i,W=/^(?:input|select|textarea|button)$/i,Y=/^h\d$/i,Z=/^[^{]+\{\s*\[native \w/,_=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,ee=/[+~]/,te=new RegExp("\\\\[\\da-fA-F]{1,6}"+M+"?|\\\\([^\\r\\n\\f])","g"),ne=function(e,t){var n="0x"+e.slice(1)-65536;return t||(n<0?String.fromCharCode(n+65536):String.fromCharCode(n>>10|55296,1023&n|56320))},re=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,ie=function(e,t){return t?"\0"===e?"\ufffd":e.slice(0,-1)+"\\"+e.charCodeAt(e.length-1).toString(16)+" ":"\\"+e},oe=function(){f();},ue=ve(function(e){return !0===e.disabled&&"fieldset"===e.nodeName.toLowerCase()},{dir:"parentNode",next:"legend"});try{R.apply(q=$.call(N.childNodes),N.childNodes),q[N.childNodes.length].nodeType;}catch(e){R={apply:q.length?function(e,t){B.apply(e,$.call(t));}:function(e,t){var n=e.length,r=0;while(e[n++]=t[r++]);e.length=n-1;}};}function le(e,t,r,i){var o,l,c,s,d,h,y,v=t&&t.ownerDocument,N=t?t.nodeType:9;if(r=r||[],"string"!=typeof e||!e||1!==N&&9!==N&&11!==N)return r;if(!i&&(f(t),t=t||p,g)){if(11!==N&&(d=_.exec(e)))if(o=d[1]){if(9===N){if(!(c=t.getElementById(o)))return r;if(c.id===o)return r.push(c),r}else if(v&&(c=v.getElementById(o))&&w(t,c)&&c.id===o)return r.push(c),r}else {if(d[2])return R.apply(r,t.getElementsByTagName(e)),r;if((o=d[3])&&n.getElementsByClassName&&t.getElementsByClassName)return R.apply(r,t.getElementsByClassName(o)),r}if(n.qsa&&!D[e+" "]&&(!m||!m.test(e))&&(1!==N||"object"!==t.nodeName.toLowerCase())){if(y=e,v=t,1===N&&(V.test(e)||U.test(e))){(v=ee.test(e)&&ge(t.parentNode)||t)===t&&n.scope||((s=t.getAttribute("id"))?s=s.replace(re,ie):t.setAttribute("id",s=b)),l=(h=u(e)).length;while(l--)h[l]=(s?"#"+s:":scope")+" "+ye(h[l]);y=h.join(",");}try{return R.apply(r,v.querySelectorAll(y)),r}catch(t){D(e,!0);}finally{s===b&&t.removeAttribute("id");}}}return a(e.replace(j,"$1"),t,r,i)}function ae(){var e=[];function t(n,i){return e.push(n+" ")>r.cacheLength&&delete t[e.shift()],t[n+" "]=i}return t}function ce(e){return e[b]=!0,e}function se(e){var t=p.createElement("fieldset");try{return !!e(t)}catch(e){return !1}finally{t.parentNode&&t.parentNode.removeChild(t),t=null;}}function de(e,t){var n=e.split("|"),i=n.length;while(i--)r.attrHandle[n[i]]=t;}function fe(e,t){var n=t&&e,r=n&&1===e.nodeType&&1===t.nodeType&&e.sourceIndex-t.sourceIndex;if(r)return r;if(n)while(n=n.nextSibling)if(n===t)return -1;return e?1:-1}function pe(e){return function(t){return "form"in t?t.parentNode&&!1===t.disabled?"label"in t?"label"in t.parentNode?t.parentNode.disabled===e:t.disabled===e:t.isDisabled===e||t.isDisabled!==!e&&ue(t)===e:t.disabled===e:"label"in t&&t.disabled===e}}function he(e){return ce(function(t){return t=+t,ce(function(n,r){var i,o=e([],n.length,t),u=o.length;while(u--)n[i=o[u]]&&(n[i]=!(r[i]=n[i]));})})}function ge(e){return e&&void 0!==e.getElementsByTagName&&e}n=le.support={},o=le.isXML=function(e){var t=e&&e.namespaceURI,n=e&&(e.ownerDocument||e).documentElement;return !Q.test(t||n&&n.nodeName||"HTML")},f=le.setDocument=function(e){var t,i,u=e?e.ownerDocument||e:N;return u!=p&&9===u.nodeType&&u.documentElement?(p=u,h=p.documentElement,g=!o(p),N!=p&&(i=p.defaultView)&&i.top!==i&&(i.addEventListener?i.addEventListener("unload",oe,!1):i.attachEvent&&i.attachEvent("onunload",oe)),n.scope=se(function(e){return h.appendChild(e).appendChild(p.createElement("div")),void 0!==e.querySelectorAll&&!e.querySelectorAll(":scope fieldset div").length}),n.attributes=se(function(e){return e.className="i",!e.getAttribute("className")}),n.getElementsByTagName=se(function(e){return e.appendChild(p.createComment("")),!e.getElementsByTagName("*").length}),n.getElementsByClassName=Z.test(p.getElementsByClassName),n.getById=se(function(e){return h.appendChild(e).id=b,!p.getElementsByName||!p.getElementsByName(b).length}),n.getById?(r.filter.ID=function(e){var t=e.replace(te,ne);return function(e){return e.getAttribute("id")===t}},r.find.ID=function(e,t){if(void 0!==t.getElementById&&g){var n=t.getElementById(e);return n?[n]:[]}}):(r.filter.ID=function(e){var t=e.replace(te,ne);return function(e){var n=void 0!==e.getAttributeNode&&e.getAttributeNode("id");return n&&n.value===t}},r.find.ID=function(e,t){if(void 0!==t.getElementById&&g){var n,r,i,o=t.getElementById(e);if(o){if((n=o.getAttributeNode("id"))&&n.value===e)return [o];i=t.getElementsByName(e),r=0;while(o=i[r++])if((n=o.getAttributeNode("id"))&&n.value===e)return [o]}return []}}),r.find.TAG=n.getElementsByTagName?function(e,t){return void 0!==t.getElementsByTagName?t.getElementsByTagName(e):n.qsa?t.querySelectorAll(e):void 0}:function(e,t){var n,r=[],i=0,o=t.getElementsByTagName(e);if("*"===e){while(n=o[i++])1===n.nodeType&&r.push(n);return r}return o},r.find.CLASS=n.getElementsByClassName&&function(e,t){if(void 0!==t.getElementsByClassName&&g)return t.getElementsByClassName(e)},y=[],m=[],(n.qsa=Z.test(p.querySelectorAll))&&(se(function(e){var t;h.appendChild(e).innerHTML="<a id='"+b+"'></a><select id='"+b+"-\r\\' msallowcapture=''><option selected=''></option></select>",e.querySelectorAll("[msallowcapture^='']").length&&m.push("[*^$]="+M+"*(?:''|\"\")"),e.querySelectorAll("[selected]").length||m.push("\\["+M+"*(?:value|"+H+")"),e.querySelectorAll("[id~="+b+"-]").length||m.push("~="),(t=p.createElement("input")).setAttribute("name",""),e.appendChild(t),e.querySelectorAll("[name='']").length||m.push("\\["+M+"*name"+M+"*="+M+"*(?:''|\"\")"),e.querySelectorAll(":checked").length||m.push(":checked"),e.querySelectorAll("a#"+b+"+*").length||m.push(".#.+[+~]"),e.querySelectorAll("\\\f"),m.push("[\\r\\n\\f]");}),se(function(e){e.innerHTML="<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";var t=p.createElement("input");t.setAttribute("type","hidden"),e.appendChild(t).setAttribute("name","D"),e.querySelectorAll("[name=d]").length&&m.push("name"+M+"*[*^$|!~]?="),2!==e.querySelectorAll(":enabled").length&&m.push(":enabled",":disabled"),h.appendChild(e).disabled=!0,2!==e.querySelectorAll(":disabled").length&&m.push(":enabled",":disabled"),e.querySelectorAll("*,:x"),m.push(",.*:");})),(n.matchesSelector=Z.test(v=h.matches||h.webkitMatchesSelector||h.mozMatchesSelector||h.oMatchesSelector||h.msMatchesSelector))&&se(function(e){n.disconnectedMatch=v.call(e,"*"),v.call(e,"[s!='']:x"),y.push("!=",F);}),m=m.length&&new RegExp(m.join("|")),y=y.length&&new RegExp(y.join("|")),t=Z.test(h.compareDocumentPosition),w=t||Z.test(h.contains)?function(e,t){var n=9===e.nodeType?e.documentElement:e,r=t&&t.parentNode;return e===r||!(!r||1!==r.nodeType||!(n.contains?n.contains(r):e.compareDocumentPosition&&16&e.compareDocumentPosition(r)))}:function(e,t){if(t)while(t=t.parentNode)if(t===e)return !0;return !1},T=t?function(e,t){if(e===t)return d=!0,0;var r=!e.compareDocumentPosition-!t.compareDocumentPosition;return r||(1&(r=(e.ownerDocument||e)==(t.ownerDocument||t)?e.compareDocumentPosition(t):1)||!n.sortDetached&&t.compareDocumentPosition(e)===r?e==p||e.ownerDocument==N&&w(N,e)?-1:t==p||t.ownerDocument==N&&w(N,t)?1:s?k(s,e)-k(s,t):0:4&r?-1:1)}:function(e,t){if(e===t)return d=!0,0;var n,r=0,i=e.parentNode,o=t.parentNode,u=[e],l=[t];if(!i||!o)return e==p?-1:t==p?1:i?-1:o?1:s?k(s,e)-k(s,t):0;if(i===o)return fe(e,t);n=e;while(n=n.parentNode)u.unshift(n);n=t;while(n=n.parentNode)l.unshift(n);while(u[r]===l[r])r++;return r?fe(u[r],l[r]):u[r]==N?-1:l[r]==N?1:0},p):p},le.matches=function(e,t){return le(e,null,null,t)},le.matchesSelector=function(e,t){if(f(e),n.matchesSelector&&g&&!D[t+" "]&&(!y||!y.test(t))&&(!m||!m.test(t)))try{var r=v.call(e,t);if(r||n.disconnectedMatch||e.document&&11!==e.document.nodeType)return r}catch(e){D(t,!0);}return le(t,p,null,[e]).length>0},le.contains=function(e,t){return (e.ownerDocument||e)!=p&&f(e),w(e,t)},le.attr=function(e,t){(e.ownerDocument||e)!=p&&f(e);var i=r.attrHandle[t.toLowerCase()],o=i&&L.call(r.attrHandle,t.toLowerCase())?i(e,t,!g):void 0;return void 0!==o?o:n.attributes||!g?e.getAttribute(t):(o=e.getAttributeNode(t))&&o.specified?o.value:null},le.escape=function(e){return (e+"").replace(re,ie)},le.error=function(e){throw new Error("Syntax error, unrecognized expression: "+e)},le.uniqueSort=function(e){var t,r=[],i=0,o=0;if(d=!n.detectDuplicates,s=!n.sortStable&&e.slice(0),e.sort(T),d){while(t=e[o++])t===e[o]&&(i=r.push(o));while(i--)e.splice(r[i],1);}return s=null,e},i=le.getText=function(e){var t,n="",r=0,o=e.nodeType;if(o){if(1===o||9===o||11===o){if("string"==typeof e.textContent)return e.textContent;for(e=e.firstChild;e;e=e.nextSibling)n+=i(e);}else if(3===o||4===o)return e.nodeValue}else while(t=e[r++])n+=i(t);return n},(r=le.selectors={cacheLength:50,createPseudo:ce,match:K,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(te,ne),e[3]=(e[3]||e[4]||e[5]||"").replace(te,ne),"~="===e[2]&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),"nth"===e[1].slice(0,3)?(e[3]||le.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*("even"===e[3]||"odd"===e[3])),e[5]=+(e[7]+e[8]||"odd"===e[3])):e[3]&&le.error(e[0]),e},PSEUDO:function(e){var t,n=!e[6]&&e[2];return K.CHILD.test(e[0])?null:(e[3]?e[2]=e[4]||e[5]||"":n&&X.test(n)&&(t=u(n,!0))&&(t=n.indexOf(")",n.length-t)-n.length)&&(e[0]=e[0].slice(0,t),e[2]=n.slice(0,t)),e.slice(0,3))}},filter:{TAG:function(e){var t=e.replace(te,ne).toLowerCase();return "*"===e?function(){return !0}:function(e){return e.nodeName&&e.nodeName.toLowerCase()===t}},CLASS:function(e){var t=E[e+" "];return t||(t=new RegExp("(^|"+M+")"+e+"("+M+"|$)"))&&E(e,function(e){return t.test("string"==typeof e.className&&e.className||void 0!==e.getAttribute&&e.getAttribute("class")||"")})},ATTR:function(e,t,n){return function(r){var i=le.attr(r,e);return null==i?"!="===t:!t||(i+="","="===t?i===n:"!="===t?i!==n:"^="===t?n&&0===i.indexOf(n):"*="===t?n&&i.indexOf(n)>-1:"$="===t?n&&i.slice(-n.length)===n:"~="===t?(" "+i.replace(O," ")+" ").indexOf(n)>-1:"|="===t&&(i===n||i.slice(0,n.length+1)===n+"-"))}},CHILD:function(e,t,n,r,i){var o="nth"!==e.slice(0,3),u="last"!==e.slice(-4),l="of-type"===t;return 1===r&&0===i?function(e){return !!e.parentNode}:function(t,n,a){var c,s,d,f,p,h,g=o!==u?"nextSibling":"previousSibling",m=t.parentNode,y=l&&t.nodeName.toLowerCase(),v=!a&&!l,w=!1;if(m){if(o){while(g){f=t;while(f=f[g])if(l?f.nodeName.toLowerCase()===y:1===f.nodeType)return !1;h=g="only"===e&&!h&&"nextSibling";}return !0}if(h=[u?m.firstChild:m.lastChild],u&&v){w=(p=(c=(s=(d=(f=m)[b]||(f[b]={}))[f.uniqueID]||(d[f.uniqueID]={}))[e]||[])[0]===C&&c[1])&&c[2],f=p&&m.childNodes[p];while(f=++p&&f&&f[g]||(w=p=0)||h.pop())if(1===f.nodeType&&++w&&f===t){s[e]=[C,p,w];break}}else if(v&&(w=p=(c=(s=(d=(f=t)[b]||(f[b]={}))[f.uniqueID]||(d[f.uniqueID]={}))[e]||[])[0]===C&&c[1]),!1===w)while(f=++p&&f&&f[g]||(w=p=0)||h.pop())if((l?f.nodeName.toLowerCase()===y:1===f.nodeType)&&++w&&(v&&((s=(d=f[b]||(f[b]={}))[f.uniqueID]||(d[f.uniqueID]={}))[e]=[C,w]),f===t))break;return (w-=i)===r||w%r==0&&w/r>=0}}},PSEUDO:function(e,t){var n,i=r.pseudos[e]||r.setFilters[e.toLowerCase()]||le.error("unsupported pseudo: "+e);return i[b]?i(t):i.length>1?(n=[e,e,"",t],r.setFilters.hasOwnProperty(e.toLowerCase())?ce(function(e,n){var r,o=i(e,t),u=o.length;while(u--)e[r=k(e,o[u])]=!(n[r]=o[u]);}):function(e){return i(e,0,n)}):i}},pseudos:{not:ce(function(e){var t=[],n=[],r=l(e.replace(j,"$1"));return r[b]?ce(function(e,t,n,i){var o,u=r(e,null,i,[]),l=e.length;while(l--)(o=u[l])&&(e[l]=!(t[l]=o));}):function(e,i,o){return t[0]=e,r(t,null,o,n),t[0]=null,!n.pop()}}),has:ce(function(e){return function(t){return le(e,t).length>0}}),contains:ce(function(e){return e=e.replace(te,ne),function(t){return (t.textContent||i(t)).indexOf(e)>-1}}),lang:ce(function(e){return J.test(e||"")||le.error("unsupported lang: "+e),e=e.replace(te,ne).toLowerCase(),function(t){var n;do{if(n=g?t.lang:t.getAttribute("xml:lang")||t.getAttribute("lang"))return (n=n.toLowerCase())===e||0===n.indexOf(e+"-")}while((t=t.parentNode)&&1===t.nodeType);return !1}}),target:function(t){var n=e.location&&e.location.hash;return n&&n.slice(1)===t.id},root:function(e){return e===h},focus:function(e){return e===p.activeElement&&(!p.hasFocus||p.hasFocus())&&!!(e.type||e.href||~e.tabIndex)},enabled:pe(!1),disabled:pe(!0),checked:function(e){var t=e.nodeName.toLowerCase();return "input"===t&&!!e.checked||"option"===t&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,!0===e.selected},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeType<6)return !1;return !0},parent:function(e){return !r.pseudos.empty(e)},header:function(e){return Y.test(e.nodeName)},input:function(e){return W.test(e.nodeName)},button:function(e){var t=e.nodeName.toLowerCase();return "input"===t&&"button"===e.type||"button"===t},text:function(e){var t;return "input"===e.nodeName.toLowerCase()&&"text"===e.type&&(null==(t=e.getAttribute("type"))||"text"===t.toLowerCase())},first:he(function(){return [0]}),last:he(function(e,t){return [t-1]}),eq:he(function(e,t,n){return [n<0?n+t:n]}),even:he(function(e,t){for(var n=0;n<t;n+=2)e.push(n);return e}),odd:he(function(e,t){for(var n=1;n<t;n+=2)e.push(n);return e}),lt:he(function(e,t,n){for(var r=n<0?n+t:n>t?t:n;--r>=0;)e.push(r);return e}),gt:he(function(e,t,n){for(var r=n<0?n+t:n;++r<t;)e.push(r);return e})}}).pseudos.nth=r.pseudos.eq;for(t in {radio:!0,checkbox:!0,file:!0,password:!0,image:!0})r.pseudos[t]=function(e){return function(t){return "input"===t.nodeName.toLowerCase()&&t.type===e}}(t);for(t in {submit:!0,reset:!0})r.pseudos[t]=function(e){return function(t){var n=t.nodeName.toLowerCase();return ("input"===n||"button"===n)&&t.type===e}}(t);function me(){}me.prototype=r.filters=r.pseudos,r.setFilters=new me,u=le.tokenize=function(e,t){var n,i,o,u,l,a,c,s=A[e+" "];if(s)return t?0:s.slice(0);l=e,a=[],c=r.preFilter;while(l){n&&!(i=G.exec(l))||(i&&(l=l.slice(i[0].length)||l),a.push(o=[])),n=!1,(i=U.exec(l))&&(n=i.shift(),o.push({value:n,type:i[0].replace(j," ")}),l=l.slice(n.length));for(u in r.filter)!(i=K[u].exec(l))||c[u]&&!(i=c[u](i))||(n=i.shift(),o.push({value:n,type:u,matches:i}),l=l.slice(n.length));if(!n)break}return t?l.length:l?le.error(e):A(e,a).slice(0)};function ye(e){for(var t=0,n=e.length,r="";t<n;t++)r+=e[t].value;return r}function ve(e,t,n){var r=t.dir,i=t.next,o=i||r,u=n&&"parentNode"===o,l=x++;return t.first?function(t,n,i){while(t=t[r])if(1===t.nodeType||u)return e(t,n,i);return !1}:function(t,n,a){var c,s,d,f=[C,l];if(a){while(t=t[r])if((1===t.nodeType||u)&&e(t,n,a))return !0}else while(t=t[r])if(1===t.nodeType||u)if(d=t[b]||(t[b]={}),s=d[t.uniqueID]||(d[t.uniqueID]={}),i&&i===t.nodeName.toLowerCase())t=t[r]||t;else {if((c=s[o])&&c[0]===C&&c[1]===l)return f[2]=c[2];if(s[o]=f,f[2]=e(t,n,a))return !0}return !1}}function we(e){return e.length>1?function(t,n,r){var i=e.length;while(i--)if(!e[i](t,n,r))return !1;return !0}:e[0]}function be(e,t,n){for(var r=0,i=t.length;r<i;r++)le(e,t[r],n);return n}function Ne(e,t,n,r,i){for(var o,u=[],l=0,a=e.length,c=null!=t;l<a;l++)(o=e[l])&&(n&&!n(o,r,i)||(u.push(o),c&&t.push(l)));return u}function Ce(e,t,n,r,i,o){return r&&!r[b]&&(r=Ce(r)),i&&!i[b]&&(i=Ce(i,o)),ce(function(o,u,l,a){var c,s,d,f=[],p=[],h=u.length,g=o||be(t||"*",l.nodeType?[l]:l,[]),m=!e||!o&&t?g:Ne(g,f,e,l,a),y=n?i||(o?e:h||r)?[]:u:m;if(n&&n(m,y,l,a),r){c=Ne(y,p),r(c,[],l,a),s=c.length;while(s--)(d=c[s])&&(y[p[s]]=!(m[p[s]]=d));}if(o){if(i||e){if(i){c=[],s=y.length;while(s--)(d=y[s])&&c.push(m[s]=d);i(null,y=[],c,a);}s=y.length;while(s--)(d=y[s])&&(c=i?k(o,d):f[s])>-1&&(o[c]=!(u[c]=d));}}else y=Ne(y===u?y.splice(h,y.length):y),i?i(null,u,y,a):R.apply(u,y);})}function xe(e){for(var t,n,i,o=e.length,u=r.relative[e[0].type],l=u||r.relative[" "],a=u?1:0,s=ve(function(e){return e===t},l,!0),d=ve(function(e){return k(t,e)>-1},l,!0),f=[function(e,n,r){var i=!u&&(r||n!==c)||((t=n).nodeType?s(e,n,r):d(e,n,r));return t=null,i}];a<o;a++)if(n=r.relative[e[a].type])f=[ve(we(f),n)];else {if((n=r.filter[e[a].type].apply(null,e[a].matches))[b]){for(i=++a;i<o;i++)if(r.relative[e[i].type])break;return Ce(a>1&&we(f),a>1&&ye(e.slice(0,a-1).concat({value:" "===e[a-2].type?"*":""})).replace(j,"$1"),n,a<i&&xe(e.slice(a,i)),i<o&&xe(e=e.slice(i)),i<o&&ye(e))}f.push(n);}return we(f)}function Ee(e,t){var n=t.length>0,i=e.length>0,o=function(o,u,l,a,s){var d,h,m,y=0,v="0",w=o&&[],b=[],N=c,x=o||i&&r.find.TAG("*",s),E=C+=null==N?1:Math.random()||.1,A=x.length;for(s&&(c=u==p||u||s);v!==A&&null!=(d=x[v]);v++){if(i&&d){h=0,u||d.ownerDocument==p||(f(d),l=!g);while(m=e[h++])if(m(d,u||p,l)){a.push(d);break}s&&(C=E);}n&&((d=!m&&d)&&y--,o&&w.push(d));}if(y+=v,n&&v!==y){h=0;while(m=t[h++])m(w,b,u,l);if(o){if(y>0)while(v--)w[v]||b[v]||(b[v]=I.call(a));b=Ne(b);}R.apply(a,b),s&&!o&&b.length>0&&y+t.length>1&&le.uniqueSort(a);}return s&&(C=E,c=N),w};return n?ce(o):o}l=le.compile=function(e,t){var n,r=[],i=[],o=S[e+" "];if(!o){t||(t=u(e)),n=t.length;while(n--)(o=xe(t[n]))[b]?r.push(o):i.push(o);(o=S(e,Ee(i,r))).selector=e;}return o},a=le.select=function(e,t,n,i){var o,a,c,s,d,f="function"==typeof e&&e,p=!i&&u(e=f.selector||e);if(n=n||[],1===p.length){if((a=p[0]=p[0].slice(0)).length>2&&"ID"===(c=a[0]).type&&9===t.nodeType&&g&&r.relative[a[1].type]){if(!(t=(r.find.ID(c.matches[0].replace(te,ne),t)||[])[0]))return n;f&&(t=t.parentNode),e=e.slice(a.shift().value.length);}o=K.needsContext.test(e)?0:a.length;while(o--){if(c=a[o],r.relative[s=c.type])break;if((d=r.find[s])&&(i=d(c.matches[0].replace(te,ne),ee.test(a[0].type)&&ge(t.parentNode)||t))){if(a.splice(o,1),!(e=i.length&&ye(a)))return R.apply(n,i),n;break}}}return (f||l(e,p))(i,t,!g,n,!t||ee.test(e)&&ge(t.parentNode)||t),n},n.sortStable=b.split("").sort(T).join("")===b,n.detectDuplicates=!!d,f(),n.sortDetached=se(function(e){return 1&e.compareDocumentPosition(p.createElement("fieldset"))}),se(function(e){return e.innerHTML="<a href='#'></a>","#"===e.firstChild.getAttribute("href")})||de("type|href|height|width",function(e,t,n){if(!n)return e.getAttribute(t,"type"===t.toLowerCase()?1:2)}),n.attributes&&se(function(e){return e.innerHTML="<input/>",e.firstChild.setAttribute("value",""),""===e.firstChild.getAttribute("value")})||de("value",function(e,t,n){if(!n&&"input"===e.nodeName.toLowerCase())return e.defaultValue}),se(function(e){return null==e.getAttribute("disabled")})||de(H,function(e,t,n){var r;if(!n)return !0===e[t]?t.toLowerCase():(r=e.getAttributeNode(t))&&r.specified?r.value:null});var Ae=e.Sizzle;le.noConflict=function(){return e.Sizzle===le&&(e.Sizzle=Ae),le},"function"==typeof define&&define.amd?define(function(){return le}):"undefined"!=typeof module&&module.exports?module.exports=le:e.Sizzle=le;}(window);
//# sourceMappingURL=sizzle.min.map

return module.exports;
})();

function matches(selector, elm) {
  const r = Sizzle.matches(selector, [elm]);
  return r.length > 0;
}
function selectOne(selector, elm) {
  const r = Sizzle(selector, elm);
  return r[0] || null;
}
function selectAll(selector, elm) {
  return Sizzle(selector, elm);
}

class MockClassList {
  constructor(elm) {
    this.elm = elm;
  }
  add(...classNames) {
    const clsNames = getItems(this.elm);
    let updated = false;
    classNames.forEach(className => {
      className = String(className);
      validateClass(className);
      if (clsNames.includes(className) === false) {
        clsNames.push(className);
        updated = true;
      }
    });
    if (updated) {
      this.elm.setAttributeNS(null, 'class', clsNames.join(' '));
    }
  }
  remove(...classNames) {
    const clsNames = getItems(this.elm);
    let updated = false;
    classNames.forEach(className => {
      className = String(className);
      validateClass(className);
      const index = clsNames.indexOf(className);
      if (index > -1) {
        clsNames.splice(index, 1);
        updated = true;
      }
    });
    if (updated) {
      this.elm.setAttributeNS(null, 'class', clsNames.filter(c => c.length > 0).join(' '));
    }
  }
  contains(className) {
    className = String(className);
    return getItems(this.elm).includes(className);
  }
  toggle(className) {
    className = String(className);
    if (this.contains(className) === true) {
      this.remove(className);
    }
    else {
      this.add(className);
    }
  }
  get length() {
    return getItems(this.elm).length;
  }
  item(index) {
    return getItems(this.elm)[index];
  }
  toString() {
    return getItems(this.elm).join(' ');
  }
}
function validateClass(className) {
  if (className === '') {
    throw new Error('The token provided must not be empty.');
  }
  if (/\s/.test(className)) {
    throw new Error(`The token provided ('${className}') contains HTML space characters, which are not valid in tokens.`);
  }
}
function getItems(elm) {
  const className = elm.getAttribute('class');
  if (typeof className === 'string' && className.length > 0) {
    return className
      .trim()
      .split(' ')
      .filter(c => c.length > 0);
  }
  return [];
}

class MockCSSStyleDeclaration {
  constructor() {
    this._styles = new Map();
  }
  setProperty(prop, value) {
    prop = jsCaseToCssCase(prop);
    if (value == null || value === '') {
      this._styles.delete(prop);
    }
    else {
      this._styles.set(prop, String(value));
    }
  }
  getPropertyValue(prop) {
    prop = jsCaseToCssCase(prop);
    return String(this._styles.get(prop) || '');
  }
  removeProperty(prop) {
    prop = jsCaseToCssCase(prop);
    this._styles.delete(prop);
  }
  get length() {
    return this._styles.size;
  }
  get cssText() {
    const cssText = [];
    this._styles.forEach((value, prop) => {
      cssText.push(`${prop}: ${value};`);
    });
    return cssText.join(' ').trim();
  }
  set cssText(cssText) {
    if (cssText == null || cssText === '') {
      this._styles.clear();
      return;
    }
    cssText.split(';').forEach(rule => {
      rule = rule.trim();
      if (rule.length > 0) {
        const splt = rule.split(':');
        if (splt.length > 1) {
          const prop = splt[0].trim();
          const value = splt[1].trim();
          if (prop !== '' && value !== '') {
            this._styles.set(jsCaseToCssCase(prop), value);
          }
        }
      }
    });
  }
}
function createCSSStyleDeclaration() {
  return new Proxy(new MockCSSStyleDeclaration(), cssProxyHandler);
}
const cssProxyHandler = {
  get(cssStyle, prop) {
    if (prop in cssStyle) {
      return cssStyle[prop];
    }
    prop = cssCaseToJsCase(prop);
    return cssStyle.getPropertyValue(prop);
  },
  set(cssStyle, prop, value) {
    if (prop in cssStyle) {
      cssStyle[prop] = value;
    }
    else {
      cssStyle.setProperty(prop, value);
    }
    return true;
  },
};
function cssCaseToJsCase(str) {
  // font-size to fontSize
  if (str.length > 1 && str.includes('-') === true) {
    str = str
      .toLowerCase()
      .split('-')
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join('');
    str = str.substr(0, 1).toLowerCase() + str.substr(1);
  }
  return str;
}
function jsCaseToCssCase(str) {
  // fontSize to font-size
  if (str.length > 1 && str.includes('-') === false && /[A-Z]/.test(str) === true) {
    str = str
      .replace(/([A-Z])/g, g => ' ' + g[0])
      .trim()
      .replace(/ /g, '-')
      .toLowerCase();
  }
  return str;
}

class MockEvent {
  constructor(type, eventInitDict) {
    this.bubbles = false;
    this.cancelBubble = false;
    this.cancelable = false;
    this.composed = false;
    this.currentTarget = null;
    this.defaultPrevented = false;
    this.srcElement = null;
    this.target = null;
    if (typeof type !== 'string') {
      throw new Error(`Event type required`);
    }
    this.type = type;
    this.timeStamp = Date.now();
    if (eventInitDict != null) {
      Object.assign(this, eventInitDict);
    }
  }
  preventDefault() {
    this.defaultPrevented = true;
  }
  stopPropagation() {
    this.cancelBubble = true;
  }
  stopImmediatePropagation() {
    this.cancelBubble = true;
  }
}
class MockCustomEvent extends MockEvent {
  constructor(type, customEventInitDic) {
    super(type);
    this.detail = null;
    if (customEventInitDic != null) {
      Object.assign(this, customEventInitDic);
    }
  }
}
class MockKeyboardEvent extends MockEvent {
  constructor(type, keyboardEventInitDic) {
    super(type);
    this.code = '';
    this.key = '';
    this.altKey = false;
    this.ctrlKey = false;
    this.metaKey = false;
    this.shiftKey = false;
    this.location = 0;
    this.repeat = false;
    if (keyboardEventInitDic != null) {
      Object.assign(this, keyboardEventInitDic);
    }
  }
}
class MockMouseEvent extends MockEvent {
  constructor(type, mouseEventInitDic) {
    super(type);
    this.screenX = 0;
    this.screenY = 0;
    this.clientX = 0;
    this.clientY = 0;
    this.ctrlKey = false;
    this.shiftKey = false;
    this.altKey = false;
    this.metaKey = false;
    this.button = 0;
    this.buttons = 0;
    this.relatedTarget = null;
    if (mouseEventInitDic != null) {
      Object.assign(this, mouseEventInitDic);
    }
  }
}
class MockEventListener {
  constructor(type, handler) {
    this.type = type;
    this.handler = handler;
  }
}
function addEventListener(elm, type, handler) {
  const target = elm;
  if (target.__listeners == null) {
    target.__listeners = [];
  }
  target.__listeners.push(new MockEventListener(type, handler));
}
function removeEventListener(elm, type, handler) {
  const target = elm;
  if (target != null && Array.isArray(target.__listeners) === true) {
    const elmListener = target.__listeners.find(e => e.type === type && e.handler === handler);
    if (elmListener != null) {
      const index = target.__listeners.indexOf(elmListener);
      target.__listeners.splice(index, 1);
    }
  }
}
function resetEventListeners(target) {
  if (target != null && target.__listeners != null) {
    target.__listeners = null;
  }
}
function triggerEventListener(elm, ev) {
  if (elm == null || ev.cancelBubble === true) {
    return;
  }
  const target = elm;
  ev.currentTarget = elm;
  if (Array.isArray(target.__listeners) === true) {
    const listeners = target.__listeners.filter(e => e.type === ev.type);
    listeners.forEach(listener => {
      try {
        listener.handler.call(target, ev);
      }
      catch (err) {
        console.error(err);
      }
    });
  }
  if (ev.bubbles === false) {
    return;
  }
  if (elm.nodeName === "#document" /* DOCUMENT_NODE */) {
    triggerEventListener(elm.defaultView, ev);
  }
  else {
    triggerEventListener(elm.parentElement, ev);
  }
}
function dispatchEvent(currentTarget, ev) {
  ev.target = currentTarget;
  triggerEventListener(currentTarget, ev);
  return true;
}

function serializeNodeToHtml(elm, opts = {}) {
  const output = {
    currentLineWidth: 0,
    indent: 0,
    isWithinBody: false,
    text: [],
  };
  if (opts.prettyHtml) {
    if (typeof opts.indentSpaces !== 'number') {
      opts.indentSpaces = 2;
    }
    if (typeof opts.newLines !== 'boolean') {
      opts.newLines = true;
    }
    opts.approximateLineWidth = -1;
  }
  else {
    opts.prettyHtml = false;
    if (typeof opts.newLines !== 'boolean') {
      opts.newLines = false;
    }
    if (typeof opts.indentSpaces !== 'number') {
      opts.indentSpaces = 0;
    }
  }
  if (typeof opts.approximateLineWidth !== 'number') {
    opts.approximateLineWidth = -1;
  }
  if (typeof opts.removeEmptyAttributes !== 'boolean') {
    opts.removeEmptyAttributes = true;
  }
  if (typeof opts.removeAttributeQuotes !== 'boolean') {
    opts.removeAttributeQuotes = false;
  }
  if (typeof opts.removeBooleanAttributeQuotes !== 'boolean') {
    opts.removeBooleanAttributeQuotes = false;
  }
  if (typeof opts.removeHtmlComments !== 'boolean') {
    opts.removeHtmlComments = false;
  }
  if (typeof opts.serializeShadowRoot !== 'boolean') {
    opts.serializeShadowRoot = false;
  }
  if (opts.outerHtml) {
    serializeToHtml(elm, opts, output, false);
  }
  else {
    for (let i = 0, ii = elm.childNodes.length; i < ii; i++) {
      serializeToHtml(elm.childNodes[i], opts, output, false);
    }
  }
  if (output.text[0] === '\n') {
    output.text.shift();
  }
  if (output.text[output.text.length - 1] === '\n') {
    output.text.pop();
  }
  return output.text.join('');
}
function serializeToHtml(node, opts, output, isShadowRoot) {
  if (node.nodeType === 1 /* ELEMENT_NODE */ || isShadowRoot) {
    const tagName = isShadowRoot ? 'mock:shadow-root' : getTagName(node);
    if (tagName === 'body') {
      output.isWithinBody = true;
    }
    const ignoreTag = opts.excludeTags != null && opts.excludeTags.includes(tagName);
    if (ignoreTag === false) {
      const isWithinWhitespaceSensitiveNode = opts.newLines || opts.indentSpaces > 0 ? isWithinWhitespaceSensitive(node) : false;
      if (opts.newLines && !isWithinWhitespaceSensitiveNode) {
        output.text.push('\n');
        output.currentLineWidth = 0;
      }
      if (opts.indentSpaces > 0 && !isWithinWhitespaceSensitiveNode) {
        for (let i = 0; i < output.indent; i++) {
          output.text.push(' ');
        }
        output.currentLineWidth += output.indent;
      }
      output.text.push('<' + tagName);
      output.currentLineWidth += tagName.length + 1;
      const attrsLength = node.attributes.length;
      const attributes = opts.prettyHtml && attrsLength > 1
        ? cloneAttributes(node.attributes, true)
        : node.attributes;
      for (let i = 0; i < attrsLength; i++) {
        const attr = attributes.item(i);
        const attrName = attr.name;
        if (attrName === 'style') {
          continue;
        }
        let attrValue = attr.value;
        if (opts.removeEmptyAttributes && attrValue === '' && REMOVE_EMPTY_ATTR.has(attrName)) {
          continue;
        }
        const attrNamespaceURI = attr.namespaceURI;
        if (attrNamespaceURI == null) {
          output.currentLineWidth += attrName.length + 1;
          if (opts.approximateLineWidth > 0 && output.currentLineWidth > opts.approximateLineWidth) {
            output.text.push('\n' + attrName);
            output.currentLineWidth = 0;
          }
          else {
            output.text.push(' ' + attrName);
          }
        }
        else if (attrNamespaceURI === 'http://www.w3.org/XML/1998/namespace') {
          output.text.push(' xml:' + attrName);
          output.currentLineWidth += attrName.length + 5;
        }
        else if (attrNamespaceURI === 'http://www.w3.org/2000/xmlns/') {
          if (attrName !== 'xmlns') {
            output.text.push(' xmlns:' + attrName);
            output.currentLineWidth += attrName.length + 7;
          }
          else {
            output.text.push(' ' + attrName);
            output.currentLineWidth += attrName.length + 1;
          }
        }
        else if (attrNamespaceURI === XLINK_NS) {
          output.text.push(' xlink:' + attrName);
          output.currentLineWidth += attrName.length + 7;
        }
        else {
          output.text.push(' ' + attrNamespaceURI + ':' + attrName);
          output.currentLineWidth += attrNamespaceURI.length + attrName.length + 2;
        }
        if (opts.prettyHtml && attrName === 'class') {
          attrValue = attr.value = attrValue
            .split(' ')
            .filter(t => t !== '')
            .sort()
            .join(' ')
            .trim();
        }
        if (attrValue === '') {
          if (opts.removeBooleanAttributeQuotes && BOOLEAN_ATTR.has(attrName)) {
            continue;
          }
          if (opts.removeEmptyAttributes && attrName.startsWith('data-')) {
            continue;
          }
        }
        if (opts.removeAttributeQuotes && CAN_REMOVE_ATTR_QUOTES.test(attrValue)) {
          output.text.push('=' + escapeString(attrValue, true));
          output.currentLineWidth += attrValue.length + 1;
        }
        else {
          output.text.push('="' + escapeString(attrValue, true) + '"');
          output.currentLineWidth += attrValue.length + 3;
        }
      }
      if (node.hasAttribute('style')) {
        const cssText = node.style.cssText;
        if (opts.approximateLineWidth > 0 &&
          output.currentLineWidth + cssText.length + 10 > opts.approximateLineWidth) {
          output.text.push(`\nstyle="${cssText}">`);
          output.currentLineWidth = 0;
        }
        else {
          output.text.push(` style="${cssText}">`);
          output.currentLineWidth += cssText.length + 10;
        }
      }
      else {
        output.text.push('>');
        output.currentLineWidth += 1;
      }
    }
    if (EMPTY_ELEMENTS.has(tagName) === false) {
      if (opts.serializeShadowRoot && node.shadowRoot != null) {
        output.indent = output.indent + opts.indentSpaces;
        serializeToHtml(node.shadowRoot, opts, output, true);
        output.indent = output.indent - opts.indentSpaces;
        if (opts.newLines &&
          (node.childNodes.length === 0 ||
            (node.childNodes.length === 1 &&
              node.childNodes[0].nodeType === 3 /* TEXT_NODE */ &&
              node.childNodes[0].nodeValue.trim() === ''))) {
          output.text.push('\n');
          output.currentLineWidth = 0;
          for (let i = 0; i < output.indent; i++) {
            output.text.push(' ');
          }
          output.currentLineWidth += output.indent;
        }
      }
      if (opts.excludeTagContent == null || opts.excludeTagContent.includes(tagName) === false) {
        const childNodes = tagName === 'template' ? node.content.childNodes : node.childNodes;
        const childNodeLength = childNodes.length;
        if (childNodeLength > 0) {
          if (childNodeLength === 1 &&
            childNodes[0].nodeType === 3 /* TEXT_NODE */ &&
            (typeof childNodes[0].nodeValue !== 'string' || childNodes[0].nodeValue.trim() === '')) ;
          else {
            const isWithinWhitespaceSensitiveNode = opts.newLines || opts.indentSpaces > 0 ? isWithinWhitespaceSensitive(node) : false;
            if (!isWithinWhitespaceSensitiveNode && opts.indentSpaces > 0 && ignoreTag === false) {
              output.indent = output.indent + opts.indentSpaces;
            }
            for (let i = 0; i < childNodeLength; i++) {
              serializeToHtml(childNodes[i], opts, output, false);
            }
            if (ignoreTag === false) {
              if (opts.newLines && !isWithinWhitespaceSensitiveNode) {
                output.text.push('\n');
                output.currentLineWidth = 0;
              }
              if (opts.indentSpaces > 0 && !isWithinWhitespaceSensitiveNode) {
                output.indent = output.indent - opts.indentSpaces;
                for (let i = 0; i < output.indent; i++) {
                  output.text.push(' ');
                }
                output.currentLineWidth += output.indent;
              }
            }
          }
        }
        if (ignoreTag === false) {
          output.text.push('</' + tagName + '>');
          output.currentLineWidth += tagName.length + 3;
        }
      }
    }
    if (opts.approximateLineWidth > 0 && STRUCTURE_ELEMENTS.has(tagName)) {
      output.text.push('\n');
      output.currentLineWidth = 0;
    }
    if (tagName === 'body') {
      output.isWithinBody = false;
    }
  }
  else if (node.nodeType === 3 /* TEXT_NODE */) {
    let textContent = node.nodeValue;
    if (typeof textContent === 'string') {
      const trimmedTextContent = textContent.trim();
      if (trimmedTextContent === '') {
        // this text node is whitespace only
        if (isWithinWhitespaceSensitive(node)) {
          // whitespace matters within this element
          // just add the exact text we were given
          output.text.push(textContent);
          output.currentLineWidth += textContent.length;
        }
        else if (opts.approximateLineWidth > 0 && !output.isWithinBody) ;
        else if (!opts.prettyHtml) {
          // this text node is only whitespace, and it's not
          // within a whitespace sensitive element like <pre> or <code>
          // so replace the entire white space with a single new line
          output.currentLineWidth += 1;
          if (opts.approximateLineWidth > 0 && output.currentLineWidth > opts.approximateLineWidth) {
            // good enough for a new line
            // for perf these are all just estimates
            // we don't care to ensure exact line lengths
            output.text.push('\n');
            output.currentLineWidth = 0;
          }
          else {
            // let's keep it all on the same line yet
            output.text.push(' ');
          }
        }
      }
      else {
        // this text node has text content
        const isWithinWhitespaceSensitiveNode = opts.newLines || opts.indentSpaces > 0 || opts.prettyHtml ? isWithinWhitespaceSensitive(node) : false;
        if (opts.newLines && !isWithinWhitespaceSensitiveNode) {
          output.text.push('\n');
          output.currentLineWidth = 0;
        }
        if (opts.indentSpaces > 0 && !isWithinWhitespaceSensitiveNode) {
          for (let i = 0; i < output.indent; i++) {
            output.text.push(' ');
          }
          output.currentLineWidth += output.indent;
        }
        let textContentLength = textContent.length;
        if (textContentLength > 0) {
          // this text node has text content
          const parentTagName = node.parentNode != null && node.parentNode.nodeType === 1 /* ELEMENT_NODE */
            ? node.parentNode.nodeName
            : null;
          if (NON_ESCAPABLE_CONTENT.has(parentTagName)) {
            // this text node cannot have its content escaped since it's going
            // into an element like <style> or <script>
            if (isWithinWhitespaceSensitive(node)) {
              output.text.push(textContent);
            }
            else {
              output.text.push(trimmedTextContent);
              textContentLength = trimmedTextContent.length;
            }
            output.currentLineWidth += textContentLength;
          }
          else {
            // this text node is going into a normal element and html can be escaped
            if (opts.prettyHtml && !isWithinWhitespaceSensitiveNode) {
              // pretty print the text node
              output.text.push(escapeString(textContent.replace(/\s\s+/g, ' ').trim(), false));
              output.currentLineWidth += textContentLength;
            }
            else {
              // not pretty printing the text node
              if (isWithinWhitespaceSensitive(node)) {
                output.currentLineWidth += textContentLength;
              }
              else {
                // this element is not a whitespace sensitive one, like <pre> or <code> so
                // any whitespace at the start and end can be cleaned up to just be one space
                if (/\s/.test(textContent.charAt(0))) {
                  textContent = ' ' + textContent.trimLeft();
                }
                textContentLength = textContent.length;
                if (textContentLength > 1) {
                  if (/\s/.test(textContent.charAt(textContentLength - 1))) {
                    if (opts.approximateLineWidth > 0 &&
                      output.currentLineWidth + textContentLength > opts.approximateLineWidth) {
                      textContent = textContent.trimRight() + '\n';
                      output.currentLineWidth = 0;
                    }
                    else {
                      textContent = textContent.trimRight() + ' ';
                    }
                  }
                }
                output.currentLineWidth += textContentLength;
              }
              output.text.push(escapeString(textContent, false));
            }
          }
        }
      }
    }
  }
  else if (node.nodeType === 8 /* COMMENT_NODE */) {
    const nodeValue = node.nodeValue;
    if (opts.removeHtmlComments) {
      const isHydrateAnnotation = nodeValue.startsWith(CONTENT_REF_ID + '.') ||
        nodeValue.startsWith(ORG_LOCATION_ID + '.') ||
        nodeValue.startsWith(SLOT_NODE_ID + '.') ||
        nodeValue.startsWith(TEXT_NODE_ID + '.');
      if (!isHydrateAnnotation) {
        return;
      }
    }
    const isWithinWhitespaceSensitiveNode = opts.newLines || opts.indentSpaces > 0 ? isWithinWhitespaceSensitive(node) : false;
    if (opts.newLines && !isWithinWhitespaceSensitiveNode) {
      output.text.push('\n');
      output.currentLineWidth = 0;
    }
    if (opts.indentSpaces > 0 && !isWithinWhitespaceSensitiveNode) {
      for (let i = 0; i < output.indent; i++) {
        output.text.push(' ');
      }
      output.currentLineWidth += output.indent;
    }
    output.text.push('<!--' + nodeValue + '-->');
    output.currentLineWidth += nodeValue.length + 7;
  }
  else if (node.nodeType === 10 /* DOCUMENT_TYPE_NODE */) {
    output.text.push('<!doctype html>');
  }
}
const AMP_REGEX = /&/g;
const NBSP_REGEX = /\u00a0/g;
const DOUBLE_QUOTE_REGEX = /"/g;
const LT_REGEX = /</g;
const GT_REGEX = />/g;
const CAN_REMOVE_ATTR_QUOTES = /^[^ \t\n\f\r"'`=<>\/\\-]+$/;
function getTagName(element) {
  if (element.namespaceURI === 'http://www.w3.org/1999/xhtml') {
    return element.nodeName.toLowerCase();
  }
  else {
    return element.nodeName;
  }
}
function escapeString(str, attrMode) {
  str = str.replace(AMP_REGEX, '&amp;').replace(NBSP_REGEX, '&nbsp;');
  if (attrMode) {
    return str.replace(DOUBLE_QUOTE_REGEX, '&quot;');
  }
  return str.replace(LT_REGEX, '&lt;').replace(GT_REGEX, '&gt;');
}
function isWithinWhitespaceSensitive(node) {
  while (node != null) {
    if (WHITESPACE_SENSITIVE.has(node.nodeName)) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}
/*@__PURE__*/ const NON_ESCAPABLE_CONTENT = new Set([
  'STYLE',
  'SCRIPT',
  'IFRAME',
  'NOSCRIPT',
  'XMP',
  'NOEMBED',
  'NOFRAMES',
  'PLAINTEXT',
]);
/*@__PURE__*/ const WHITESPACE_SENSITIVE = new Set([
  'CODE',
  'OUTPUT',
  'PLAINTEXT',
  'PRE',
  'SCRIPT',
  'TEMPLATE',
  'TEXTAREA',
]);
/*@__PURE__*/ const EMPTY_ELEMENTS = new Set([
  'area',
  'base',
  'basefont',
  'bgsound',
  'br',
  'col',
  'embed',
  'frame',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'trace',
  'wbr',
]);
/*@__PURE__*/ const REMOVE_EMPTY_ATTR = new Set(['class', 'dir', 'id', 'lang', 'name', 'title']);
/*@__PURE__*/ const BOOLEAN_ATTR = new Set([
  'allowfullscreen',
  'async',
  'autofocus',
  'autoplay',
  'checked',
  'compact',
  'controls',
  'declare',
  'default',
  'defaultchecked',
  'defaultmuted',
  'defaultselected',
  'defer',
  'disabled',
  'enabled',
  'formnovalidate',
  'hidden',
  'indeterminate',
  'inert',
  'ismap',
  'itemscope',
  'loop',
  'multiple',
  'muted',
  'nohref',
  'nomodule',
  'noresize',
  'noshade',
  'novalidate',
  'nowrap',
  'open',
  'pauseonexit',
  'readonly',
  'required',
  'reversed',
  'scoped',
  'seamless',
  'selected',
  'sortable',
  'truespeed',
  'typemustmatch',
  'visible',
]);
/*@__PURE__*/ const STRUCTURE_ELEMENTS = new Set([
  'html',
  'body',
  'head',
  'iframe',
  'meta',
  'link',
  'base',
  'title',
  'script',
  'style',
]);

// Parse5 6.0.1
const e=function(e){const t=[65534,65535,131070,131071,196606,196607,262142,262143,327678,327679,393214,393215,458750,458751,524286,524287,589822,589823,655358,655359,720894,720895,786430,786431,851966,851967,917502,917503,983038,983039,1048574,1048575,1114110,1114111];var n="�",s={EOF:-1,NULL:0,TABULATION:9,CARRIAGE_RETURN:13,LINE_FEED:10,FORM_FEED:12,SPACE:32,EXCLAMATION_MARK:33,QUOTATION_MARK:34,NUMBER_SIGN:35,AMPERSAND:38,APOSTROPHE:39,HYPHEN_MINUS:45,SOLIDUS:47,DIGIT_0:48,DIGIT_9:57,SEMICOLON:59,LESS_THAN_SIGN:60,EQUALS_SIGN:61,GREATER_THAN_SIGN:62,QUESTION_MARK:63,LATIN_CAPITAL_A:65,LATIN_CAPITAL_F:70,LATIN_CAPITAL_X:88,LATIN_CAPITAL_Z:90,RIGHT_SQUARE_BRACKET:93,GRAVE_ACCENT:96,LATIN_SMALL_A:97,LATIN_SMALL_F:102,LATIN_SMALL_X:120,LATIN_SMALL_Z:122,REPLACEMENT_CHARACTER:65533},r=function(e){return e>=55296&&e<=57343},i=function(e){return 32!==e&&10!==e&&13!==e&&9!==e&&12!==e&&e>=1&&e<=31||e>=127&&e<=159},o=function(e){return e>=64976&&e<=65007||t.indexOf(e)>-1},a="unexpected-null-character",T="invalid-first-character-of-tag-name",E="missing-semicolon-after-character-reference",h="eof-before-tag-name",c="eof-in-tag",_="missing-whitespace-after-doctype-public-keyword",l="missing-whitespace-between-doctype-public-and-system-identifiers",m="missing-whitespace-after-doctype-system-keyword",p="missing-quote-before-doctype-public-identifier",A="missing-quote-before-doctype-system-identifier",u="missing-doctype-public-identifier",N="missing-doctype-system-identifier",d="abrupt-doctype-public-identifier",C="abrupt-doctype-system-identifier",O="eof-in-script-html-comment-like-text",f="eof-in-doctype",S="abrupt-closing-of-empty-comment",R="eof-in-comment",I="absence-of-digits-in-numeric-character-reference",L="end-tag-without-matching-open-element",k="misplaced-start-tag-for-head-element";const M=s;var g=new Uint16Array([4,52,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,106,303,412,810,1432,1701,1796,1987,2114,2360,2420,2484,3170,3251,4140,4393,4575,4610,5106,5512,5728,6117,6274,6315,6345,6427,6516,7002,7910,8733,9323,9870,10170,10631,10893,11318,11386,11467,12773,13092,14474,14922,15448,15542,16419,17666,18166,18611,19004,19095,19298,19397,4,16,69,77,97,98,99,102,103,108,109,110,111,112,114,115,116,117,140,150,158,169,176,194,199,210,216,222,226,242,256,266,283,294,108,105,103,5,198,1,59,148,1,198,80,5,38,1,59,156,1,38,99,117,116,101,5,193,1,59,167,1,193,114,101,118,101,59,1,258,4,2,105,121,182,191,114,99,5,194,1,59,189,1,194,59,1,1040,114,59,3,55349,56580,114,97,118,101,5,192,1,59,208,1,192,112,104,97,59,1,913,97,99,114,59,1,256,100,59,1,10835,4,2,103,112,232,237,111,110,59,1,260,102,59,3,55349,56632,112,108,121,70,117,110,99,116,105,111,110,59,1,8289,105,110,103,5,197,1,59,264,1,197,4,2,99,115,272,277,114,59,3,55349,56476,105,103,110,59,1,8788,105,108,100,101,5,195,1,59,292,1,195,109,108,5,196,1,59,301,1,196,4,8,97,99,101,102,111,114,115,117,321,350,354,383,388,394,400,405,4,2,99,114,327,336,107,115,108,97,115,104,59,1,8726,4,2,118,119,342,345,59,1,10983,101,100,59,1,8966,121,59,1,1041,4,3,99,114,116,362,369,379,97,117,115,101,59,1,8757,110,111,117,108,108,105,115,59,1,8492,97,59,1,914,114,59,3,55349,56581,112,102,59,3,55349,56633,101,118,101,59,1,728,99,114,59,1,8492,109,112,101,113,59,1,8782,4,14,72,79,97,99,100,101,102,104,105,108,111,114,115,117,442,447,456,504,542,547,569,573,577,616,678,784,790,796,99,121,59,1,1063,80,89,5,169,1,59,454,1,169,4,3,99,112,121,464,470,497,117,116,101,59,1,262,4,2,59,105,476,478,1,8914,116,97,108,68,105,102,102,101,114,101,110,116,105,97,108,68,59,1,8517,108,101,121,115,59,1,8493,4,4,97,101,105,111,514,520,530,535,114,111,110,59,1,268,100,105,108,5,199,1,59,528,1,199,114,99,59,1,264,110,105,110,116,59,1,8752,111,116,59,1,266,4,2,100,110,553,560,105,108,108,97,59,1,184,116,101,114,68,111,116,59,1,183,114,59,1,8493,105,59,1,935,114,99,108,101,4,4,68,77,80,84,591,596,603,609,111,116,59,1,8857,105,110,117,115,59,1,8854,108,117,115,59,1,8853,105,109,101,115,59,1,8855,111,4,2,99,115,623,646,107,119,105,115,101,67,111,110,116,111,117,114,73,110,116,101,103,114,97,108,59,1,8754,101,67,117,114,108,121,4,2,68,81,658,671,111,117,98,108,101,81,117,111,116,101,59,1,8221,117,111,116,101,59,1,8217,4,4,108,110,112,117,688,701,736,753,111,110,4,2,59,101,696,698,1,8759,59,1,10868,4,3,103,105,116,709,717,722,114,117,101,110,116,59,1,8801,110,116,59,1,8751,111,117,114,73,110,116,101,103,114,97,108,59,1,8750,4,2,102,114,742,745,59,1,8450,111,100,117,99,116,59,1,8720,110,116,101,114,67,108,111,99,107,119,105,115,101,67,111,110,116,111,117,114,73,110,116,101,103,114,97,108,59,1,8755,111,115,115,59,1,10799,99,114,59,3,55349,56478,112,4,2,59,67,803,805,1,8915,97,112,59,1,8781,4,11,68,74,83,90,97,99,101,102,105,111,115,834,850,855,860,865,888,903,916,921,1011,1415,4,2,59,111,840,842,1,8517,116,114,97,104,100,59,1,10513,99,121,59,1,1026,99,121,59,1,1029,99,121,59,1,1039,4,3,103,114,115,873,879,883,103,101,114,59,1,8225,114,59,1,8609,104,118,59,1,10980,4,2,97,121,894,900,114,111,110,59,1,270,59,1,1044,108,4,2,59,116,910,912,1,8711,97,59,1,916,114,59,3,55349,56583,4,2,97,102,927,998,4,2,99,109,933,992,114,105,116,105,99,97,108,4,4,65,68,71,84,950,957,978,985,99,117,116,101,59,1,180,111,4,2,116,117,964,967,59,1,729,98,108,101,65,99,117,116,101,59,1,733,114,97,118,101,59,1,96,105,108,100,101,59,1,732,111,110,100,59,1,8900,102,101,114,101,110,116,105,97,108,68,59,1,8518,4,4,112,116,117,119,1021,1026,1048,1249,102,59,3,55349,56635,4,3,59,68,69,1034,1036,1041,1,168,111,116,59,1,8412,113,117,97,108,59,1,8784,98,108,101,4,6,67,68,76,82,85,86,1065,1082,1101,1189,1211,1236,111,110,116,111,117,114,73,110,116,101,103,114,97,108,59,1,8751,111,4,2,116,119,1089,1092,59,1,168,110,65,114,114,111,119,59,1,8659,4,2,101,111,1107,1141,102,116,4,3,65,82,84,1117,1124,1136,114,114,111,119,59,1,8656,105,103,104,116,65,114,114,111,119,59,1,8660,101,101,59,1,10980,110,103,4,2,76,82,1149,1177,101,102,116,4,2,65,82,1158,1165,114,114,111,119,59,1,10232,105,103,104,116,65,114,114,111,119,59,1,10234,105,103,104,116,65,114,114,111,119,59,1,10233,105,103,104,116,4,2,65,84,1199,1206,114,114,111,119,59,1,8658,101,101,59,1,8872,112,4,2,65,68,1218,1225,114,114,111,119,59,1,8657,111,119,110,65,114,114,111,119,59,1,8661,101,114,116,105,99,97,108,66,97,114,59,1,8741,110,4,6,65,66,76,82,84,97,1264,1292,1299,1352,1391,1408,114,114,111,119,4,3,59,66,85,1276,1278,1283,1,8595,97,114,59,1,10515,112,65,114,114,111,119,59,1,8693,114,101,118,101,59,1,785,101,102,116,4,3,82,84,86,1310,1323,1334,105,103,104,116,86,101,99,116,111,114,59,1,10576,101,101,86,101,99,116,111,114,59,1,10590,101,99,116,111,114,4,2,59,66,1345,1347,1,8637,97,114,59,1,10582,105,103,104,116,4,2,84,86,1362,1373,101,101,86,101,99,116,111,114,59,1,10591,101,99,116,111,114,4,2,59,66,1384,1386,1,8641,97,114,59,1,10583,101,101,4,2,59,65,1399,1401,1,8868,114,114,111,119,59,1,8615,114,114,111,119,59,1,8659,4,2,99,116,1421,1426,114,59,3,55349,56479,114,111,107,59,1,272,4,16,78,84,97,99,100,102,103,108,109,111,112,113,115,116,117,120,1466,1470,1478,1489,1515,1520,1525,1536,1544,1593,1609,1617,1650,1664,1668,1677,71,59,1,330,72,5,208,1,59,1476,1,208,99,117,116,101,5,201,1,59,1487,1,201,4,3,97,105,121,1497,1503,1512,114,111,110,59,1,282,114,99,5,202,1,59,1510,1,202,59,1,1069,111,116,59,1,278,114,59,3,55349,56584,114,97,118,101,5,200,1,59,1534,1,200,101,109,101,110,116,59,1,8712,4,2,97,112,1550,1555,99,114,59,1,274,116,121,4,2,83,86,1563,1576,109,97,108,108,83,113,117,97,114,101,59,1,9723,101,114,121,83,109,97,108,108,83,113,117,97,114,101,59,1,9643,4,2,103,112,1599,1604,111,110,59,1,280,102,59,3,55349,56636,115,105,108,111,110,59,1,917,117,4,2,97,105,1624,1640,108,4,2,59,84,1631,1633,1,10869,105,108,100,101,59,1,8770,108,105,98,114,105,117,109,59,1,8652,4,2,99,105,1656,1660,114,59,1,8496,109,59,1,10867,97,59,1,919,109,108,5,203,1,59,1675,1,203,4,2,105,112,1683,1689,115,116,115,59,1,8707,111,110,101,110,116,105,97,108,69,59,1,8519,4,5,99,102,105,111,115,1713,1717,1722,1762,1791,121,59,1,1060,114,59,3,55349,56585,108,108,101,100,4,2,83,86,1732,1745,109,97,108,108,83,113,117,97,114,101,59,1,9724,101,114,121,83,109,97,108,108,83,113,117,97,114,101,59,1,9642,4,3,112,114,117,1770,1775,1781,102,59,3,55349,56637,65,108,108,59,1,8704,114,105,101,114,116,114,102,59,1,8497,99,114,59,1,8497,4,12,74,84,97,98,99,100,102,103,111,114,115,116,1822,1827,1834,1848,1855,1877,1882,1887,1890,1896,1978,1984,99,121,59,1,1027,5,62,1,59,1832,1,62,109,109,97,4,2,59,100,1843,1845,1,915,59,1,988,114,101,118,101,59,1,286,4,3,101,105,121,1863,1869,1874,100,105,108,59,1,290,114,99,59,1,284,59,1,1043,111,116,59,1,288,114,59,3,55349,56586,59,1,8921,112,102,59,3,55349,56638,101,97,116,101,114,4,6,69,70,71,76,83,84,1915,1933,1944,1953,1959,1971,113,117,97,108,4,2,59,76,1925,1927,1,8805,101,115,115,59,1,8923,117,108,108,69,113,117,97,108,59,1,8807,114,101,97,116,101,114,59,1,10914,101,115,115,59,1,8823,108,97,110,116,69,113,117,97,108,59,1,10878,105,108,100,101,59,1,8819,99,114,59,3,55349,56482,59,1,8811,4,8,65,97,99,102,105,111,115,117,2005,2012,2026,2032,2036,2049,2073,2089,82,68,99,121,59,1,1066,4,2,99,116,2018,2023,101,107,59,1,711,59,1,94,105,114,99,59,1,292,114,59,1,8460,108,98,101,114,116,83,112,97,99,101,59,1,8459,4,2,112,114,2055,2059,102,59,1,8461,105,122,111,110,116,97,108,76,105,110,101,59,1,9472,4,2,99,116,2079,2083,114,59,1,8459,114,111,107,59,1,294,109,112,4,2,68,69,2097,2107,111,119,110,72,117,109,112,59,1,8782,113,117,97,108,59,1,8783,4,14,69,74,79,97,99,100,102,103,109,110,111,115,116,117,2144,2149,2155,2160,2171,2189,2194,2198,2209,2245,2307,2329,2334,2341,99,121,59,1,1045,108,105,103,59,1,306,99,121,59,1,1025,99,117,116,101,5,205,1,59,2169,1,205,4,2,105,121,2177,2186,114,99,5,206,1,59,2184,1,206,59,1,1048,111,116,59,1,304,114,59,1,8465,114,97,118,101,5,204,1,59,2207,1,204,4,3,59,97,112,2217,2219,2238,1,8465,4,2,99,103,2225,2229,114,59,1,298,105,110,97,114,121,73,59,1,8520,108,105,101,115,59,1,8658,4,2,116,118,2251,2281,4,2,59,101,2257,2259,1,8748,4,2,103,114,2265,2271,114,97,108,59,1,8747,115,101,99,116,105,111,110,59,1,8898,105,115,105,98,108,101,4,2,67,84,2293,2300,111,109,109,97,59,1,8291,105,109,101,115,59,1,8290,4,3,103,112,116,2315,2320,2325,111,110,59,1,302,102,59,3,55349,56640,97,59,1,921,99,114,59,1,8464,105,108,100,101,59,1,296,4,2,107,109,2347,2352,99,121,59,1,1030,108,5,207,1,59,2358,1,207,4,5,99,102,111,115,117,2372,2386,2391,2397,2414,4,2,105,121,2378,2383,114,99,59,1,308,59,1,1049,114,59,3,55349,56589,112,102,59,3,55349,56641,4,2,99,101,2403,2408,114,59,3,55349,56485,114,99,121,59,1,1032,107,99,121,59,1,1028,4,7,72,74,97,99,102,111,115,2436,2441,2446,2452,2467,2472,2478,99,121,59,1,1061,99,121,59,1,1036,112,112,97,59,1,922,4,2,101,121,2458,2464,100,105,108,59,1,310,59,1,1050,114,59,3,55349,56590,112,102,59,3,55349,56642,99,114,59,3,55349,56486,4,11,74,84,97,99,101,102,108,109,111,115,116,2508,2513,2520,2562,2585,2981,2986,3004,3011,3146,3167,99,121,59,1,1033,5,60,1,59,2518,1,60,4,5,99,109,110,112,114,2532,2538,2544,2548,2558,117,116,101,59,1,313,98,100,97,59,1,923,103,59,1,10218,108,97,99,101,116,114,102,59,1,8466,114,59,1,8606,4,3,97,101,121,2570,2576,2582,114,111,110,59,1,317,100,105,108,59,1,315,59,1,1051,4,2,102,115,2591,2907,116,4,10,65,67,68,70,82,84,85,86,97,114,2614,2663,2672,2728,2735,2760,2820,2870,2888,2895,4,2,110,114,2620,2633,103,108,101,66,114,97,99,107,101,116,59,1,10216,114,111,119,4,3,59,66,82,2644,2646,2651,1,8592,97,114,59,1,8676,105,103,104,116,65,114,114,111,119,59,1,8646,101,105,108,105,110,103,59,1,8968,111,4,2,117,119,2679,2692,98,108,101,66,114,97,99,107,101,116,59,1,10214,110,4,2,84,86,2699,2710,101,101,86,101,99,116,111,114,59,1,10593,101,99,116,111,114,4,2,59,66,2721,2723,1,8643,97,114,59,1,10585,108,111,111,114,59,1,8970,105,103,104,116,4,2,65,86,2745,2752,114,114,111,119,59,1,8596,101,99,116,111,114,59,1,10574,4,2,101,114,2766,2792,101,4,3,59,65,86,2775,2777,2784,1,8867,114,114,111,119,59,1,8612,101,99,116,111,114,59,1,10586,105,97,110,103,108,101,4,3,59,66,69,2806,2808,2813,1,8882,97,114,59,1,10703,113,117,97,108,59,1,8884,112,4,3,68,84,86,2829,2841,2852,111,119,110,86,101,99,116,111,114,59,1,10577,101,101,86,101,99,116,111,114,59,1,10592,101,99,116,111,114,4,2,59,66,2863,2865,1,8639,97,114,59,1,10584,101,99,116,111,114,4,2,59,66,2881,2883,1,8636,97,114,59,1,10578,114,114,111,119,59,1,8656,105,103,104,116,97,114,114,111,119,59,1,8660,115,4,6,69,70,71,76,83,84,2922,2936,2947,2956,2962,2974,113,117,97,108,71,114,101,97,116,101,114,59,1,8922,117,108,108,69,113,117,97,108,59,1,8806,114,101,97,116,101,114,59,1,8822,101,115,115,59,1,10913,108,97,110,116,69,113,117,97,108,59,1,10877,105,108,100,101,59,1,8818,114,59,3,55349,56591,4,2,59,101,2992,2994,1,8920,102,116,97,114,114,111,119,59,1,8666,105,100,111,116,59,1,319,4,3,110,112,119,3019,3110,3115,103,4,4,76,82,108,114,3030,3058,3070,3098,101,102,116,4,2,65,82,3039,3046,114,114,111,119,59,1,10229,105,103,104,116,65,114,114,111,119,59,1,10231,105,103,104,116,65,114,114,111,119,59,1,10230,101,102,116,4,2,97,114,3079,3086,114,114,111,119,59,1,10232,105,103,104,116,97,114,114,111,119,59,1,10234,105,103,104,116,97,114,114,111,119,59,1,10233,102,59,3,55349,56643,101,114,4,2,76,82,3123,3134,101,102,116,65,114,114,111,119,59,1,8601,105,103,104,116,65,114,114,111,119,59,1,8600,4,3,99,104,116,3154,3158,3161,114,59,1,8466,59,1,8624,114,111,107,59,1,321,59,1,8810,4,8,97,99,101,102,105,111,115,117,3188,3192,3196,3222,3227,3237,3243,3248,112,59,1,10501,121,59,1,1052,4,2,100,108,3202,3213,105,117,109,83,112,97,99,101,59,1,8287,108,105,110,116,114,102,59,1,8499,114,59,3,55349,56592,110,117,115,80,108,117,115,59,1,8723,112,102,59,3,55349,56644,99,114,59,1,8499,59,1,924,4,9,74,97,99,101,102,111,115,116,117,3271,3276,3283,3306,3422,3427,4120,4126,4137,99,121,59,1,1034,99,117,116,101,59,1,323,4,3,97,101,121,3291,3297,3303,114,111,110,59,1,327,100,105,108,59,1,325,59,1,1053,4,3,103,115,119,3314,3380,3415,97,116,105,118,101,4,3,77,84,86,3327,3340,3365,101,100,105,117,109,83,112,97,99,101,59,1,8203,104,105,4,2,99,110,3348,3357,107,83,112,97,99,101,59,1,8203,83,112,97,99,101,59,1,8203,101,114,121,84,104,105,110,83,112,97,99,101,59,1,8203,116,101,100,4,2,71,76,3389,3405,114,101,97,116,101,114,71,114,101,97,116,101,114,59,1,8811,101,115,115,76,101,115,115,59,1,8810,76,105,110,101,59,1,10,114,59,3,55349,56593,4,4,66,110,112,116,3437,3444,3460,3464,114,101,97,107,59,1,8288,66,114,101,97,107,105,110,103,83,112,97,99,101,59,1,160,102,59,1,8469,4,13,59,67,68,69,71,72,76,78,80,82,83,84,86,3492,3494,3517,3536,3578,3657,3685,3784,3823,3860,3915,4066,4107,1,10988,4,2,111,117,3500,3510,110,103,114,117,101,110,116,59,1,8802,112,67,97,112,59,1,8813,111,117,98,108,101,86,101,114,116,105,99,97,108,66,97,114,59,1,8742,4,3,108,113,120,3544,3552,3571,101,109,101,110,116,59,1,8713,117,97,108,4,2,59,84,3561,3563,1,8800,105,108,100,101,59,3,8770,824,105,115,116,115,59,1,8708,114,101,97,116,101,114,4,7,59,69,70,71,76,83,84,3600,3602,3609,3621,3631,3637,3650,1,8815,113,117,97,108,59,1,8817,117,108,108,69,113,117,97,108,59,3,8807,824,114,101,97,116,101,114,59,3,8811,824,101,115,115,59,1,8825,108,97,110,116,69,113,117,97,108,59,3,10878,824,105,108,100,101,59,1,8821,117,109,112,4,2,68,69,3666,3677,111,119,110,72,117,109,112,59,3,8782,824,113,117,97,108,59,3,8783,824,101,4,2,102,115,3692,3724,116,84,114,105,97,110,103,108,101,4,3,59,66,69,3709,3711,3717,1,8938,97,114,59,3,10703,824,113,117,97,108,59,1,8940,115,4,6,59,69,71,76,83,84,3739,3741,3748,3757,3764,3777,1,8814,113,117,97,108,59,1,8816,114,101,97,116,101,114,59,1,8824,101,115,115,59,3,8810,824,108,97,110,116,69,113,117,97,108,59,3,10877,824,105,108,100,101,59,1,8820,101,115,116,101,100,4,2,71,76,3795,3812,114,101,97,116,101,114,71,114,101,97,116,101,114,59,3,10914,824,101,115,115,76,101,115,115,59,3,10913,824,114,101,99,101,100,101,115,4,3,59,69,83,3838,3840,3848,1,8832,113,117,97,108,59,3,10927,824,108,97,110,116,69,113,117,97,108,59,1,8928,4,2,101,105,3866,3881,118,101,114,115,101,69,108,101,109,101,110,116,59,1,8716,103,104,116,84,114,105,97,110,103,108,101,4,3,59,66,69,3900,3902,3908,1,8939,97,114,59,3,10704,824,113,117,97,108,59,1,8941,4,2,113,117,3921,3973,117,97,114,101,83,117,4,2,98,112,3933,3952,115,101,116,4,2,59,69,3942,3945,3,8847,824,113,117,97,108,59,1,8930,101,114,115,101,116,4,2,59,69,3963,3966,3,8848,824,113,117,97,108,59,1,8931,4,3,98,99,112,3981,4e3,4045,115,101,116,4,2,59,69,3990,3993,3,8834,8402,113,117,97,108,59,1,8840,99,101,101,100,115,4,4,59,69,83,84,4015,4017,4025,4037,1,8833,113,117,97,108,59,3,10928,824,108,97,110,116,69,113,117,97,108,59,1,8929,105,108,100,101,59,3,8831,824,101,114,115,101,116,4,2,59,69,4056,4059,3,8835,8402,113,117,97,108,59,1,8841,105,108,100,101,4,4,59,69,70,84,4080,4082,4089,4100,1,8769,113,117,97,108,59,1,8772,117,108,108,69,113,117,97,108,59,1,8775,105,108,100,101,59,1,8777,101,114,116,105,99,97,108,66,97,114,59,1,8740,99,114,59,3,55349,56489,105,108,100,101,5,209,1,59,4135,1,209,59,1,925,4,14,69,97,99,100,102,103,109,111,112,114,115,116,117,118,4170,4176,4187,4205,4212,4217,4228,4253,4259,4292,4295,4316,4337,4346,108,105,103,59,1,338,99,117,116,101,5,211,1,59,4185,1,211,4,2,105,121,4193,4202,114,99,5,212,1,59,4200,1,212,59,1,1054,98,108,97,99,59,1,336,114,59,3,55349,56594,114,97,118,101,5,210,1,59,4226,1,210,4,3,97,101,105,4236,4241,4246,99,114,59,1,332,103,97,59,1,937,99,114,111,110,59,1,927,112,102,59,3,55349,56646,101,110,67,117,114,108,121,4,2,68,81,4272,4285,111,117,98,108,101,81,117,111,116,101,59,1,8220,117,111,116,101,59,1,8216,59,1,10836,4,2,99,108,4301,4306,114,59,3,55349,56490,97,115,104,5,216,1,59,4314,1,216,105,4,2,108,109,4323,4332,100,101,5,213,1,59,4330,1,213,101,115,59,1,10807,109,108,5,214,1,59,4344,1,214,101,114,4,2,66,80,4354,4380,4,2,97,114,4360,4364,114,59,1,8254,97,99,4,2,101,107,4372,4375,59,1,9182,101,116,59,1,9140,97,114,101,110,116,104,101,115,105,115,59,1,9180,4,9,97,99,102,104,105,108,111,114,115,4413,4422,4426,4431,4435,4438,4448,4471,4561,114,116,105,97,108,68,59,1,8706,121,59,1,1055,114,59,3,55349,56595,105,59,1,934,59,1,928,117,115,77,105,110,117,115,59,1,177,4,2,105,112,4454,4467,110,99,97,114,101,112,108,97,110,101,59,1,8460,102,59,1,8473,4,4,59,101,105,111,4481,4483,4526,4531,1,10939,99,101,100,101,115,4,4,59,69,83,84,4498,4500,4507,4519,1,8826,113,117,97,108,59,1,10927,108,97,110,116,69,113,117,97,108,59,1,8828,105,108,100,101,59,1,8830,109,101,59,1,8243,4,2,100,112,4537,4543,117,99,116,59,1,8719,111,114,116,105,111,110,4,2,59,97,4555,4557,1,8759,108,59,1,8733,4,2,99,105,4567,4572,114,59,3,55349,56491,59,1,936,4,4,85,102,111,115,4585,4594,4599,4604,79,84,5,34,1,59,4592,1,34,114,59,3,55349,56596,112,102,59,1,8474,99,114,59,3,55349,56492,4,12,66,69,97,99,101,102,104,105,111,114,115,117,4636,4642,4650,4681,4704,4763,4767,4771,5047,5069,5081,5094,97,114,114,59,1,10512,71,5,174,1,59,4648,1,174,4,3,99,110,114,4658,4664,4668,117,116,101,59,1,340,103,59,1,10219,114,4,2,59,116,4675,4677,1,8608,108,59,1,10518,4,3,97,101,121,4689,4695,4701,114,111,110,59,1,344,100,105,108,59,1,342,59,1,1056,4,2,59,118,4710,4712,1,8476,101,114,115,101,4,2,69,85,4722,4748,4,2,108,113,4728,4736,101,109,101,110,116,59,1,8715,117,105,108,105,98,114,105,117,109,59,1,8651,112,69,113,117,105,108,105,98,114,105,117,109,59,1,10607,114,59,1,8476,111,59,1,929,103,104,116,4,8,65,67,68,70,84,85,86,97,4792,4840,4849,4905,4912,4972,5022,5040,4,2,110,114,4798,4811,103,108,101,66,114,97,99,107,101,116,59,1,10217,114,111,119,4,3,59,66,76,4822,4824,4829,1,8594,97,114,59,1,8677,101,102,116,65,114,114,111,119,59,1,8644,101,105,108,105,110,103,59,1,8969,111,4,2,117,119,4856,4869,98,108,101,66,114,97,99,107,101,116,59,1,10215,110,4,2,84,86,4876,4887,101,101,86,101,99,116,111,114,59,1,10589,101,99,116,111,114,4,2,59,66,4898,4900,1,8642,97,114,59,1,10581,108,111,111,114,59,1,8971,4,2,101,114,4918,4944,101,4,3,59,65,86,4927,4929,4936,1,8866,114,114,111,119,59,1,8614,101,99,116,111,114,59,1,10587,105,97,110,103,108,101,4,3,59,66,69,4958,4960,4965,1,8883,97,114,59,1,10704,113,117,97,108,59,1,8885,112,4,3,68,84,86,4981,4993,5004,111,119,110,86,101,99,116,111,114,59,1,10575,101,101,86,101,99,116,111,114,59,1,10588,101,99,116,111,114,4,2,59,66,5015,5017,1,8638,97,114,59,1,10580,101,99,116,111,114,4,2,59,66,5033,5035,1,8640,97,114,59,1,10579,114,114,111,119,59,1,8658,4,2,112,117,5053,5057,102,59,1,8477,110,100,73,109,112,108,105,101,115,59,1,10608,105,103,104,116,97,114,114,111,119,59,1,8667,4,2,99,104,5087,5091,114,59,1,8475,59,1,8625,108,101,68,101,108,97,121,101,100,59,1,10740,4,13,72,79,97,99,102,104,105,109,111,113,115,116,117,5134,5150,5157,5164,5198,5203,5259,5265,5277,5283,5374,5380,5385,4,2,67,99,5140,5146,72,99,121,59,1,1065,121,59,1,1064,70,84,99,121,59,1,1068,99,117,116,101,59,1,346,4,5,59,97,101,105,121,5176,5178,5184,5190,5195,1,10940,114,111,110,59,1,352,100,105,108,59,1,350,114,99,59,1,348,59,1,1057,114,59,3,55349,56598,111,114,116,4,4,68,76,82,85,5216,5227,5238,5250,111,119,110,65,114,114,111,119,59,1,8595,101,102,116,65,114,114,111,119,59,1,8592,105,103,104,116,65,114,114,111,119,59,1,8594,112,65,114,114,111,119,59,1,8593,103,109,97,59,1,931,97,108,108,67,105,114,99,108,101,59,1,8728,112,102,59,3,55349,56650,4,2,114,117,5289,5293,116,59,1,8730,97,114,101,4,4,59,73,83,85,5306,5308,5322,5367,1,9633,110,116,101,114,115,101,99,116,105,111,110,59,1,8851,117,4,2,98,112,5329,5347,115,101,116,4,2,59,69,5338,5340,1,8847,113,117,97,108,59,1,8849,101,114,115,101,116,4,2,59,69,5358,5360,1,8848,113,117,97,108,59,1,8850,110,105,111,110,59,1,8852,99,114,59,3,55349,56494,97,114,59,1,8902,4,4,98,99,109,112,5395,5420,5475,5478,4,2,59,115,5401,5403,1,8912,101,116,4,2,59,69,5411,5413,1,8912,113,117,97,108,59,1,8838,4,2,99,104,5426,5468,101,101,100,115,4,4,59,69,83,84,5440,5442,5449,5461,1,8827,113,117,97,108,59,1,10928,108,97,110,116,69,113,117,97,108,59,1,8829,105,108,100,101,59,1,8831,84,104,97,116,59,1,8715,59,1,8721,4,3,59,101,115,5486,5488,5507,1,8913,114,115,101,116,4,2,59,69,5498,5500,1,8835,113,117,97,108,59,1,8839,101,116,59,1,8913,4,11,72,82,83,97,99,102,104,105,111,114,115,5536,5546,5552,5567,5579,5602,5607,5655,5695,5701,5711,79,82,78,5,222,1,59,5544,1,222,65,68,69,59,1,8482,4,2,72,99,5558,5563,99,121,59,1,1035,121,59,1,1062,4,2,98,117,5573,5576,59,1,9,59,1,932,4,3,97,101,121,5587,5593,5599,114,111,110,59,1,356,100,105,108,59,1,354,59,1,1058,114,59,3,55349,56599,4,2,101,105,5613,5631,4,2,114,116,5619,5627,101,102,111,114,101,59,1,8756,97,59,1,920,4,2,99,110,5637,5647,107,83,112,97,99,101,59,3,8287,8202,83,112,97,99,101,59,1,8201,108,100,101,4,4,59,69,70,84,5668,5670,5677,5688,1,8764,113,117,97,108,59,1,8771,117,108,108,69,113,117,97,108,59,1,8773,105,108,100,101,59,1,8776,112,102,59,3,55349,56651,105,112,108,101,68,111,116,59,1,8411,4,2,99,116,5717,5722,114,59,3,55349,56495,114,111,107,59,1,358,4,14,97,98,99,100,102,103,109,110,111,112,114,115,116,117,5758,5789,5805,5823,5830,5835,5846,5852,5921,5937,6089,6095,6101,6108,4,2,99,114,5764,5774,117,116,101,5,218,1,59,5772,1,218,114,4,2,59,111,5781,5783,1,8607,99,105,114,59,1,10569,114,4,2,99,101,5796,5800,121,59,1,1038,118,101,59,1,364,4,2,105,121,5811,5820,114,99,5,219,1,59,5818,1,219,59,1,1059,98,108,97,99,59,1,368,114,59,3,55349,56600,114,97,118,101,5,217,1,59,5844,1,217,97,99,114,59,1,362,4,2,100,105,5858,5905,101,114,4,2,66,80,5866,5892,4,2,97,114,5872,5876,114,59,1,95,97,99,4,2,101,107,5884,5887,59,1,9183,101,116,59,1,9141,97,114,101,110,116,104,101,115,105,115,59,1,9181,111,110,4,2,59,80,5913,5915,1,8899,108,117,115,59,1,8846,4,2,103,112,5927,5932,111,110,59,1,370,102,59,3,55349,56652,4,8,65,68,69,84,97,100,112,115,5955,5985,5996,6009,6026,6033,6044,6075,114,114,111,119,4,3,59,66,68,5967,5969,5974,1,8593,97,114,59,1,10514,111,119,110,65,114,114,111,119,59,1,8645,111,119,110,65,114,114,111,119,59,1,8597,113,117,105,108,105,98,114,105,117,109,59,1,10606,101,101,4,2,59,65,6017,6019,1,8869,114,114,111,119,59,1,8613,114,114,111,119,59,1,8657,111,119,110,97,114,114,111,119,59,1,8661,101,114,4,2,76,82,6052,6063,101,102,116,65,114,114,111,119,59,1,8598,105,103,104,116,65,114,114,111,119,59,1,8599,105,4,2,59,108,6082,6084,1,978,111,110,59,1,933,105,110,103,59,1,366,99,114,59,3,55349,56496,105,108,100,101,59,1,360,109,108,5,220,1,59,6115,1,220,4,9,68,98,99,100,101,102,111,115,118,6137,6143,6148,6152,6166,6250,6255,6261,6267,97,115,104,59,1,8875,97,114,59,1,10987,121,59,1,1042,97,115,104,4,2,59,108,6161,6163,1,8873,59,1,10982,4,2,101,114,6172,6175,59,1,8897,4,3,98,116,121,6183,6188,6238,97,114,59,1,8214,4,2,59,105,6194,6196,1,8214,99,97,108,4,4,66,76,83,84,6209,6214,6220,6231,97,114,59,1,8739,105,110,101,59,1,124,101,112,97,114,97,116,111,114,59,1,10072,105,108,100,101,59,1,8768,84,104,105,110,83,112,97,99,101,59,1,8202,114,59,3,55349,56601,112,102,59,3,55349,56653,99,114,59,3,55349,56497,100,97,115,104,59,1,8874,4,5,99,101,102,111,115,6286,6292,6298,6303,6309,105,114,99,59,1,372,100,103,101,59,1,8896,114,59,3,55349,56602,112,102,59,3,55349,56654,99,114,59,3,55349,56498,4,4,102,105,111,115,6325,6330,6333,6339,114,59,3,55349,56603,59,1,926,112,102,59,3,55349,56655,99,114,59,3,55349,56499,4,9,65,73,85,97,99,102,111,115,117,6365,6370,6375,6380,6391,6405,6410,6416,6422,99,121,59,1,1071,99,121,59,1,1031,99,121,59,1,1070,99,117,116,101,5,221,1,59,6389,1,221,4,2,105,121,6397,6402,114,99,59,1,374,59,1,1067,114,59,3,55349,56604,112,102,59,3,55349,56656,99,114,59,3,55349,56500,109,108,59,1,376,4,8,72,97,99,100,101,102,111,115,6445,6450,6457,6472,6477,6501,6505,6510,99,121,59,1,1046,99,117,116,101,59,1,377,4,2,97,121,6463,6469,114,111,110,59,1,381,59,1,1047,111,116,59,1,379,4,2,114,116,6483,6497,111,87,105,100,116,104,83,112,97,99,101,59,1,8203,97,59,1,918,114,59,1,8488,112,102,59,1,8484,99,114,59,3,55349,56501,4,16,97,98,99,101,102,103,108,109,110,111,112,114,115,116,117,119,6550,6561,6568,6612,6622,6634,6645,6672,6699,6854,6870,6923,6933,6963,6974,6983,99,117,116,101,5,225,1,59,6559,1,225,114,101,118,101,59,1,259,4,6,59,69,100,105,117,121,6582,6584,6588,6591,6600,6609,1,8766,59,3,8766,819,59,1,8767,114,99,5,226,1,59,6598,1,226,116,101,5,180,1,59,6607,1,180,59,1,1072,108,105,103,5,230,1,59,6620,1,230,4,2,59,114,6628,6630,1,8289,59,3,55349,56606,114,97,118,101,5,224,1,59,6643,1,224,4,2,101,112,6651,6667,4,2,102,112,6657,6663,115,121,109,59,1,8501,104,59,1,8501,104,97,59,1,945,4,2,97,112,6678,6692,4,2,99,108,6684,6688,114,59,1,257,103,59,1,10815,5,38,1,59,6697,1,38,4,2,100,103,6705,6737,4,5,59,97,100,115,118,6717,6719,6724,6727,6734,1,8743,110,100,59,1,10837,59,1,10844,108,111,112,101,59,1,10840,59,1,10842,4,7,59,101,108,109,114,115,122,6753,6755,6758,6762,6814,6835,6848,1,8736,59,1,10660,101,59,1,8736,115,100,4,2,59,97,6770,6772,1,8737,4,8,97,98,99,100,101,102,103,104,6790,6793,6796,6799,6802,6805,6808,6811,59,1,10664,59,1,10665,59,1,10666,59,1,10667,59,1,10668,59,1,10669,59,1,10670,59,1,10671,116,4,2,59,118,6821,6823,1,8735,98,4,2,59,100,6830,6832,1,8894,59,1,10653,4,2,112,116,6841,6845,104,59,1,8738,59,1,197,97,114,114,59,1,9084,4,2,103,112,6860,6865,111,110,59,1,261,102,59,3,55349,56658,4,7,59,69,97,101,105,111,112,6886,6888,6891,6897,6900,6904,6908,1,8776,59,1,10864,99,105,114,59,1,10863,59,1,8778,100,59,1,8779,115,59,1,39,114,111,120,4,2,59,101,6917,6919,1,8776,113,59,1,8778,105,110,103,5,229,1,59,6931,1,229,4,3,99,116,121,6941,6946,6949,114,59,3,55349,56502,59,1,42,109,112,4,2,59,101,6957,6959,1,8776,113,59,1,8781,105,108,100,101,5,227,1,59,6972,1,227,109,108,5,228,1,59,6981,1,228,4,2,99,105,6989,6997,111,110,105,110,116,59,1,8755,110,116,59,1,10769,4,16,78,97,98,99,100,101,102,105,107,108,110,111,112,114,115,117,7036,7041,7119,7135,7149,7155,7219,7224,7347,7354,7463,7489,7786,7793,7814,7866,111,116,59,1,10989,4,2,99,114,7047,7094,107,4,4,99,101,112,115,7058,7064,7073,7080,111,110,103,59,1,8780,112,115,105,108,111,110,59,1,1014,114,105,109,101,59,1,8245,105,109,4,2,59,101,7088,7090,1,8765,113,59,1,8909,4,2,118,119,7100,7105,101,101,59,1,8893,101,100,4,2,59,103,7113,7115,1,8965,101,59,1,8965,114,107,4,2,59,116,7127,7129,1,9141,98,114,107,59,1,9142,4,2,111,121,7141,7146,110,103,59,1,8780,59,1,1073,113,117,111,59,1,8222,4,5,99,109,112,114,116,7167,7181,7188,7193,7199,97,117,115,4,2,59,101,7176,7178,1,8757,59,1,8757,112,116,121,118,59,1,10672,115,105,59,1,1014,110,111,117,59,1,8492,4,3,97,104,119,7207,7210,7213,59,1,946,59,1,8502,101,101,110,59,1,8812,114,59,3,55349,56607,103,4,7,99,111,115,116,117,118,119,7241,7262,7288,7305,7328,7335,7340,4,3,97,105,117,7249,7253,7258,112,59,1,8898,114,99,59,1,9711,112,59,1,8899,4,3,100,112,116,7270,7275,7281,111,116,59,1,10752,108,117,115,59,1,10753,105,109,101,115,59,1,10754,4,2,113,116,7294,7300,99,117,112,59,1,10758,97,114,59,1,9733,114,105,97,110,103,108,101,4,2,100,117,7318,7324,111,119,110,59,1,9661,112,59,1,9651,112,108,117,115,59,1,10756,101,101,59,1,8897,101,100,103,101,59,1,8896,97,114,111,119,59,1,10509,4,3,97,107,111,7362,7436,7458,4,2,99,110,7368,7432,107,4,3,108,115,116,7377,7386,7394,111,122,101,110,103,101,59,1,10731,113,117,97,114,101,59,1,9642,114,105,97,110,103,108,101,4,4,59,100,108,114,7411,7413,7419,7425,1,9652,111,119,110,59,1,9662,101,102,116,59,1,9666,105,103,104,116,59,1,9656,107,59,1,9251,4,2,49,51,7442,7454,4,2,50,52,7448,7451,59,1,9618,59,1,9617,52,59,1,9619,99,107,59,1,9608,4,2,101,111,7469,7485,4,2,59,113,7475,7478,3,61,8421,117,105,118,59,3,8801,8421,116,59,1,8976,4,4,112,116,119,120,7499,7504,7517,7523,102,59,3,55349,56659,4,2,59,116,7510,7512,1,8869,111,109,59,1,8869,116,105,101,59,1,8904,4,12,68,72,85,86,98,100,104,109,112,116,117,118,7549,7571,7597,7619,7655,7660,7682,7708,7715,7721,7728,7750,4,4,76,82,108,114,7559,7562,7565,7568,59,1,9559,59,1,9556,59,1,9558,59,1,9555,4,5,59,68,85,100,117,7583,7585,7588,7591,7594,1,9552,59,1,9574,59,1,9577,59,1,9572,59,1,9575,4,4,76,82,108,114,7607,7610,7613,7616,59,1,9565,59,1,9562,59,1,9564,59,1,9561,4,7,59,72,76,82,104,108,114,7635,7637,7640,7643,7646,7649,7652,1,9553,59,1,9580,59,1,9571,59,1,9568,59,1,9579,59,1,9570,59,1,9567,111,120,59,1,10697,4,4,76,82,108,114,7670,7673,7676,7679,59,1,9557,59,1,9554,59,1,9488,59,1,9484,4,5,59,68,85,100,117,7694,7696,7699,7702,7705,1,9472,59,1,9573,59,1,9576,59,1,9516,59,1,9524,105,110,117,115,59,1,8863,108,117,115,59,1,8862,105,109,101,115,59,1,8864,4,4,76,82,108,114,7738,7741,7744,7747,59,1,9563,59,1,9560,59,1,9496,59,1,9492,4,7,59,72,76,82,104,108,114,7766,7768,7771,7774,7777,7780,7783,1,9474,59,1,9578,59,1,9569,59,1,9566,59,1,9532,59,1,9508,59,1,9500,114,105,109,101,59,1,8245,4,2,101,118,7799,7804,118,101,59,1,728,98,97,114,5,166,1,59,7812,1,166,4,4,99,101,105,111,7824,7829,7834,7846,114,59,3,55349,56503,109,105,59,1,8271,109,4,2,59,101,7841,7843,1,8765,59,1,8909,108,4,3,59,98,104,7855,7857,7860,1,92,59,1,10693,115,117,98,59,1,10184,4,2,108,109,7872,7885,108,4,2,59,101,7879,7881,1,8226,116,59,1,8226,112,4,3,59,69,101,7894,7896,7899,1,8782,59,1,10926,4,2,59,113,7905,7907,1,8783,59,1,8783,4,15,97,99,100,101,102,104,105,108,111,114,115,116,117,119,121,7942,8021,8075,8080,8121,8126,8157,8279,8295,8430,8446,8485,8491,8707,8726,4,3,99,112,114,7950,7956,8007,117,116,101,59,1,263,4,6,59,97,98,99,100,115,7970,7972,7977,7984,7998,8003,1,8745,110,100,59,1,10820,114,99,117,112,59,1,10825,4,2,97,117,7990,7994,112,59,1,10827,112,59,1,10823,111,116,59,1,10816,59,3,8745,65024,4,2,101,111,8013,8017,116,59,1,8257,110,59,1,711,4,4,97,101,105,117,8031,8046,8056,8061,4,2,112,114,8037,8041,115,59,1,10829,111,110,59,1,269,100,105,108,5,231,1,59,8054,1,231,114,99,59,1,265,112,115,4,2,59,115,8069,8071,1,10828,109,59,1,10832,111,116,59,1,267,4,3,100,109,110,8088,8097,8104,105,108,5,184,1,59,8095,1,184,112,116,121,118,59,1,10674,116,5,162,2,59,101,8112,8114,1,162,114,100,111,116,59,1,183,114,59,3,55349,56608,4,3,99,101,105,8134,8138,8154,121,59,1,1095,99,107,4,2,59,109,8146,8148,1,10003,97,114,107,59,1,10003,59,1,967,114,4,7,59,69,99,101,102,109,115,8174,8176,8179,8258,8261,8268,8273,1,9675,59,1,10691,4,3,59,101,108,8187,8189,8193,1,710,113,59,1,8791,101,4,2,97,100,8200,8223,114,114,111,119,4,2,108,114,8210,8216,101,102,116,59,1,8634,105,103,104,116,59,1,8635,4,5,82,83,97,99,100,8235,8238,8241,8246,8252,59,1,174,59,1,9416,115,116,59,1,8859,105,114,99,59,1,8858,97,115,104,59,1,8861,59,1,8791,110,105,110,116,59,1,10768,105,100,59,1,10991,99,105,114,59,1,10690,117,98,115,4,2,59,117,8288,8290,1,9827,105,116,59,1,9827,4,4,108,109,110,112,8305,8326,8376,8400,111,110,4,2,59,101,8313,8315,1,58,4,2,59,113,8321,8323,1,8788,59,1,8788,4,2,109,112,8332,8344,97,4,2,59,116,8339,8341,1,44,59,1,64,4,3,59,102,108,8352,8354,8358,1,8705,110,59,1,8728,101,4,2,109,120,8365,8371,101,110,116,59,1,8705,101,115,59,1,8450,4,2,103,105,8382,8395,4,2,59,100,8388,8390,1,8773,111,116,59,1,10861,110,116,59,1,8750,4,3,102,114,121,8408,8412,8417,59,3,55349,56660,111,100,59,1,8720,5,169,2,59,115,8424,8426,1,169,114,59,1,8471,4,2,97,111,8436,8441,114,114,59,1,8629,115,115,59,1,10007,4,2,99,117,8452,8457,114,59,3,55349,56504,4,2,98,112,8463,8474,4,2,59,101,8469,8471,1,10959,59,1,10961,4,2,59,101,8480,8482,1,10960,59,1,10962,100,111,116,59,1,8943,4,7,100,101,108,112,114,118,119,8507,8522,8536,8550,8600,8697,8702,97,114,114,4,2,108,114,8516,8519,59,1,10552,59,1,10549,4,2,112,115,8528,8532,114,59,1,8926,99,59,1,8927,97,114,114,4,2,59,112,8545,8547,1,8630,59,1,10557,4,6,59,98,99,100,111,115,8564,8566,8573,8587,8592,8596,1,8746,114,99,97,112,59,1,10824,4,2,97,117,8579,8583,112,59,1,10822,112,59,1,10826,111,116,59,1,8845,114,59,1,10821,59,3,8746,65024,4,4,97,108,114,118,8610,8623,8663,8672,114,114,4,2,59,109,8618,8620,1,8631,59,1,10556,121,4,3,101,118,119,8632,8651,8656,113,4,2,112,115,8639,8645,114,101,99,59,1,8926,117,99,99,59,1,8927,101,101,59,1,8910,101,100,103,101,59,1,8911,101,110,5,164,1,59,8670,1,164,101,97,114,114,111,119,4,2,108,114,8684,8690,101,102,116,59,1,8630,105,103,104,116,59,1,8631,101,101,59,1,8910,101,100,59,1,8911,4,2,99,105,8713,8721,111,110,105,110,116,59,1,8754,110,116,59,1,8753,108,99,116,121,59,1,9005,4,19,65,72,97,98,99,100,101,102,104,105,106,108,111,114,115,116,117,119,122,8773,8778,8783,8821,8839,8854,8887,8914,8930,8944,9036,9041,9058,9197,9227,9258,9281,9297,9305,114,114,59,1,8659,97,114,59,1,10597,4,4,103,108,114,115,8793,8799,8805,8809,103,101,114,59,1,8224,101,116,104,59,1,8504,114,59,1,8595,104,4,2,59,118,8816,8818,1,8208,59,1,8867,4,2,107,108,8827,8834,97,114,111,119,59,1,10511,97,99,59,1,733,4,2,97,121,8845,8851,114,111,110,59,1,271,59,1,1076,4,3,59,97,111,8862,8864,8880,1,8518,4,2,103,114,8870,8876,103,101,114,59,1,8225,114,59,1,8650,116,115,101,113,59,1,10871,4,3,103,108,109,8895,8902,8907,5,176,1,59,8900,1,176,116,97,59,1,948,112,116,121,118,59,1,10673,4,2,105,114,8920,8926,115,104,116,59,1,10623,59,3,55349,56609,97,114,4,2,108,114,8938,8941,59,1,8643,59,1,8642,4,5,97,101,103,115,118,8956,8986,8989,8996,9001,109,4,3,59,111,115,8965,8967,8983,1,8900,110,100,4,2,59,115,8975,8977,1,8900,117,105,116,59,1,9830,59,1,9830,59,1,168,97,109,109,97,59,1,989,105,110,59,1,8946,4,3,59,105,111,9009,9011,9031,1,247,100,101,5,247,2,59,111,9020,9022,1,247,110,116,105,109,101,115,59,1,8903,110,120,59,1,8903,99,121,59,1,1106,99,4,2,111,114,9048,9053,114,110,59,1,8990,111,112,59,1,8973,4,5,108,112,116,117,119,9070,9076,9081,9130,9144,108,97,114,59,1,36,102,59,3,55349,56661,4,5,59,101,109,112,115,9093,9095,9109,9116,9122,1,729,113,4,2,59,100,9102,9104,1,8784,111,116,59,1,8785,105,110,117,115,59,1,8760,108,117,115,59,1,8724,113,117,97,114,101,59,1,8865,98,108,101,98,97,114,119,101,100,103,101,59,1,8966,110,4,3,97,100,104,9153,9160,9172,114,114,111,119,59,1,8595,111,119,110,97,114,114,111,119,115,59,1,8650,97,114,112,111,111,110,4,2,108,114,9184,9190,101,102,116,59,1,8643,105,103,104,116,59,1,8642,4,2,98,99,9203,9211,107,97,114,111,119,59,1,10512,4,2,111,114,9217,9222,114,110,59,1,8991,111,112,59,1,8972,4,3,99,111,116,9235,9248,9252,4,2,114,121,9241,9245,59,3,55349,56505,59,1,1109,108,59,1,10742,114,111,107,59,1,273,4,2,100,114,9264,9269,111,116,59,1,8945,105,4,2,59,102,9276,9278,1,9663,59,1,9662,4,2,97,104,9287,9292,114,114,59,1,8693,97,114,59,1,10607,97,110,103,108,101,59,1,10662,4,2,99,105,9311,9315,121,59,1,1119,103,114,97,114,114,59,1,10239,4,18,68,97,99,100,101,102,103,108,109,110,111,112,113,114,115,116,117,120,9361,9376,9398,9439,9444,9447,9462,9495,9531,9585,9598,9614,9659,9755,9771,9792,9808,9826,4,2,68,111,9367,9372,111,116,59,1,10871,116,59,1,8785,4,2,99,115,9382,9392,117,116,101,5,233,1,59,9390,1,233,116,101,114,59,1,10862,4,4,97,105,111,121,9408,9414,9430,9436,114,111,110,59,1,283,114,4,2,59,99,9421,9423,1,8790,5,234,1,59,9428,1,234,108,111,110,59,1,8789,59,1,1101,111,116,59,1,279,59,1,8519,4,2,68,114,9453,9458,111,116,59,1,8786,59,3,55349,56610,4,3,59,114,115,9470,9472,9482,1,10906,97,118,101,5,232,1,59,9480,1,232,4,2,59,100,9488,9490,1,10902,111,116,59,1,10904,4,4,59,105,108,115,9505,9507,9515,9518,1,10905,110,116,101,114,115,59,1,9191,59,1,8467,4,2,59,100,9524,9526,1,10901,111,116,59,1,10903,4,3,97,112,115,9539,9544,9564,99,114,59,1,275,116,121,4,3,59,115,118,9554,9556,9561,1,8709,101,116,59,1,8709,59,1,8709,112,4,2,49,59,9571,9583,4,2,51,52,9577,9580,59,1,8196,59,1,8197,1,8195,4,2,103,115,9591,9594,59,1,331,112,59,1,8194,4,2,103,112,9604,9609,111,110,59,1,281,102,59,3,55349,56662,4,3,97,108,115,9622,9635,9640,114,4,2,59,115,9629,9631,1,8917,108,59,1,10723,117,115,59,1,10865,105,4,3,59,108,118,9649,9651,9656,1,949,111,110,59,1,949,59,1,1013,4,4,99,115,117,118,9669,9686,9716,9747,4,2,105,111,9675,9680,114,99,59,1,8790,108,111,110,59,1,8789,4,2,105,108,9692,9696,109,59,1,8770,97,110,116,4,2,103,108,9705,9710,116,114,59,1,10902,101,115,115,59,1,10901,4,3,97,101,105,9724,9729,9734,108,115,59,1,61,115,116,59,1,8799,118,4,2,59,68,9741,9743,1,8801,68,59,1,10872,112,97,114,115,108,59,1,10725,4,2,68,97,9761,9766,111,116,59,1,8787,114,114,59,1,10609,4,3,99,100,105,9779,9783,9788,114,59,1,8495,111,116,59,1,8784,109,59,1,8770,4,2,97,104,9798,9801,59,1,951,5,240,1,59,9806,1,240,4,2,109,114,9814,9822,108,5,235,1,59,9820,1,235,111,59,1,8364,4,3,99,105,112,9834,9838,9843,108,59,1,33,115,116,59,1,8707,4,2,101,111,9849,9859,99,116,97,116,105,111,110,59,1,8496,110,101,110,116,105,97,108,101,59,1,8519,4,12,97,99,101,102,105,106,108,110,111,112,114,115,9896,9910,9914,9921,9954,9960,9967,9989,9994,10027,10036,10164,108,108,105,110,103,100,111,116,115,101,113,59,1,8786,121,59,1,1092,109,97,108,101,59,1,9792,4,3,105,108,114,9929,9935,9950,108,105,103,59,1,64259,4,2,105,108,9941,9945,103,59,1,64256,105,103,59,1,64260,59,3,55349,56611,108,105,103,59,1,64257,108,105,103,59,3,102,106,4,3,97,108,116,9975,9979,9984,116,59,1,9837,105,103,59,1,64258,110,115,59,1,9649,111,102,59,1,402,4,2,112,114,1e4,10005,102,59,3,55349,56663,4,2,97,107,10011,10016,108,108,59,1,8704,4,2,59,118,10022,10024,1,8916,59,1,10969,97,114,116,105,110,116,59,1,10765,4,2,97,111,10042,10159,4,2,99,115,10048,10155,4,6,49,50,51,52,53,55,10062,10102,10114,10135,10139,10151,4,6,50,51,52,53,54,56,10076,10083,10086,10093,10096,10099,5,189,1,59,10081,1,189,59,1,8531,5,188,1,59,10091,1,188,59,1,8533,59,1,8537,59,1,8539,4,2,51,53,10108,10111,59,1,8532,59,1,8534,4,3,52,53,56,10122,10129,10132,5,190,1,59,10127,1,190,59,1,8535,59,1,8540,53,59,1,8536,4,2,54,56,10145,10148,59,1,8538,59,1,8541,56,59,1,8542,108,59,1,8260,119,110,59,1,8994,99,114,59,3,55349,56507,4,17,69,97,98,99,100,101,102,103,105,106,108,110,111,114,115,116,118,10206,10217,10247,10254,10268,10273,10358,10363,10374,10380,10385,10406,10458,10464,10470,10497,10610,4,2,59,108,10212,10214,1,8807,59,1,10892,4,3,99,109,112,10225,10231,10244,117,116,101,59,1,501,109,97,4,2,59,100,10239,10241,1,947,59,1,989,59,1,10886,114,101,118,101,59,1,287,4,2,105,121,10260,10265,114,99,59,1,285,59,1,1075,111,116,59,1,289,4,4,59,108,113,115,10283,10285,10288,10308,1,8805,59,1,8923,4,3,59,113,115,10296,10298,10301,1,8805,59,1,8807,108,97,110,116,59,1,10878,4,4,59,99,100,108,10318,10320,10324,10345,1,10878,99,59,1,10921,111,116,4,2,59,111,10332,10334,1,10880,4,2,59,108,10340,10342,1,10882,59,1,10884,4,2,59,101,10351,10354,3,8923,65024,115,59,1,10900,114,59,3,55349,56612,4,2,59,103,10369,10371,1,8811,59,1,8921,109,101,108,59,1,8503,99,121,59,1,1107,4,4,59,69,97,106,10395,10397,10400,10403,1,8823,59,1,10898,59,1,10917,59,1,10916,4,4,69,97,101,115,10416,10419,10434,10453,59,1,8809,112,4,2,59,112,10426,10428,1,10890,114,111,120,59,1,10890,4,2,59,113,10440,10442,1,10888,4,2,59,113,10448,10450,1,10888,59,1,8809,105,109,59,1,8935,112,102,59,3,55349,56664,97,118,101,59,1,96,4,2,99,105,10476,10480,114,59,1,8458,109,4,3,59,101,108,10489,10491,10494,1,8819,59,1,10894,59,1,10896,5,62,6,59,99,100,108,113,114,10512,10514,10527,10532,10538,10545,1,62,4,2,99,105,10520,10523,59,1,10919,114,59,1,10874,111,116,59,1,8919,80,97,114,59,1,10645,117,101,115,116,59,1,10876,4,5,97,100,101,108,115,10557,10574,10579,10599,10605,4,2,112,114,10563,10570,112,114,111,120,59,1,10886,114,59,1,10616,111,116,59,1,8919,113,4,2,108,113,10586,10592,101,115,115,59,1,8923,108,101,115,115,59,1,10892,101,115,115,59,1,8823,105,109,59,1,8819,4,2,101,110,10616,10626,114,116,110,101,113,113,59,3,8809,65024,69,59,3,8809,65024,4,10,65,97,98,99,101,102,107,111,115,121,10653,10658,10713,10718,10724,10760,10765,10786,10850,10875,114,114,59,1,8660,4,4,105,108,109,114,10668,10674,10678,10684,114,115,112,59,1,8202,102,59,1,189,105,108,116,59,1,8459,4,2,100,114,10690,10695,99,121,59,1,1098,4,3,59,99,119,10703,10705,10710,1,8596,105,114,59,1,10568,59,1,8621,97,114,59,1,8463,105,114,99,59,1,293,4,3,97,108,114,10732,10748,10754,114,116,115,4,2,59,117,10741,10743,1,9829,105,116,59,1,9829,108,105,112,59,1,8230,99,111,110,59,1,8889,114,59,3,55349,56613,115,4,2,101,119,10772,10779,97,114,111,119,59,1,10533,97,114,111,119,59,1,10534,4,5,97,109,111,112,114,10798,10803,10809,10839,10844,114,114,59,1,8703,116,104,116,59,1,8763,107,4,2,108,114,10816,10827,101,102,116,97,114,114,111,119,59,1,8617,105,103,104,116,97,114,114,111,119,59,1,8618,102,59,3,55349,56665,98,97,114,59,1,8213,4,3,99,108,116,10858,10863,10869,114,59,3,55349,56509,97,115,104,59,1,8463,114,111,107,59,1,295,4,2,98,112,10881,10887,117,108,108,59,1,8259,104,101,110,59,1,8208,4,15,97,99,101,102,103,105,106,109,110,111,112,113,115,116,117,10925,10936,10958,10977,10990,11001,11039,11045,11101,11192,11220,11226,11237,11285,11299,99,117,116,101,5,237,1,59,10934,1,237,4,3,59,105,121,10944,10946,10955,1,8291,114,99,5,238,1,59,10953,1,238,59,1,1080,4,2,99,120,10964,10968,121,59,1,1077,99,108,5,161,1,59,10975,1,161,4,2,102,114,10983,10986,59,1,8660,59,3,55349,56614,114,97,118,101,5,236,1,59,10999,1,236,4,4,59,105,110,111,11011,11013,11028,11034,1,8520,4,2,105,110,11019,11024,110,116,59,1,10764,116,59,1,8749,102,105,110,59,1,10716,116,97,59,1,8489,108,105,103,59,1,307,4,3,97,111,112,11053,11092,11096,4,3,99,103,116,11061,11065,11088,114,59,1,299,4,3,101,108,112,11073,11076,11082,59,1,8465,105,110,101,59,1,8464,97,114,116,59,1,8465,104,59,1,305,102,59,1,8887,101,100,59,1,437,4,5,59,99,102,111,116,11113,11115,11121,11136,11142,1,8712,97,114,101,59,1,8453,105,110,4,2,59,116,11129,11131,1,8734,105,101,59,1,10717,100,111,116,59,1,305,4,5,59,99,101,108,112,11154,11156,11161,11179,11186,1,8747,97,108,59,1,8890,4,2,103,114,11167,11173,101,114,115,59,1,8484,99,97,108,59,1,8890,97,114,104,107,59,1,10775,114,111,100,59,1,10812,4,4,99,103,112,116,11202,11206,11211,11216,121,59,1,1105,111,110,59,1,303,102,59,3,55349,56666,97,59,1,953,114,111,100,59,1,10812,117,101,115,116,5,191,1,59,11235,1,191,4,2,99,105,11243,11248,114,59,3,55349,56510,110,4,5,59,69,100,115,118,11261,11263,11266,11271,11282,1,8712,59,1,8953,111,116,59,1,8949,4,2,59,118,11277,11279,1,8948,59,1,8947,59,1,8712,4,2,59,105,11291,11293,1,8290,108,100,101,59,1,297,4,2,107,109,11305,11310,99,121,59,1,1110,108,5,239,1,59,11316,1,239,4,6,99,102,109,111,115,117,11332,11346,11351,11357,11363,11380,4,2,105,121,11338,11343,114,99,59,1,309,59,1,1081,114,59,3,55349,56615,97,116,104,59,1,567,112,102,59,3,55349,56667,4,2,99,101,11369,11374,114,59,3,55349,56511,114,99,121,59,1,1112,107,99,121,59,1,1108,4,8,97,99,102,103,104,106,111,115,11404,11418,11433,11438,11445,11450,11455,11461,112,112,97,4,2,59,118,11413,11415,1,954,59,1,1008,4,2,101,121,11424,11430,100,105,108,59,1,311,59,1,1082,114,59,3,55349,56616,114,101,101,110,59,1,312,99,121,59,1,1093,99,121,59,1,1116,112,102,59,3,55349,56668,99,114,59,3,55349,56512,4,23,65,66,69,72,97,98,99,100,101,102,103,104,106,108,109,110,111,112,114,115,116,117,118,11515,11538,11544,11555,11560,11721,11780,11818,11868,12136,12160,12171,12203,12208,12246,12275,12327,12509,12523,12569,12641,12732,12752,4,3,97,114,116,11523,11528,11532,114,114,59,1,8666,114,59,1,8656,97,105,108,59,1,10523,97,114,114,59,1,10510,4,2,59,103,11550,11552,1,8806,59,1,10891,97,114,59,1,10594,4,9,99,101,103,109,110,112,113,114,116,11580,11586,11594,11600,11606,11624,11627,11636,11694,117,116,101,59,1,314,109,112,116,121,118,59,1,10676,114,97,110,59,1,8466,98,100,97,59,1,955,103,4,3,59,100,108,11615,11617,11620,1,10216,59,1,10641,101,59,1,10216,59,1,10885,117,111,5,171,1,59,11634,1,171,114,4,8,59,98,102,104,108,112,115,116,11655,11657,11669,11673,11677,11681,11685,11690,1,8592,4,2,59,102,11663,11665,1,8676,115,59,1,10527,115,59,1,10525,107,59,1,8617,112,59,1,8619,108,59,1,10553,105,109,59,1,10611,108,59,1,8610,4,3,59,97,101,11702,11704,11709,1,10923,105,108,59,1,10521,4,2,59,115,11715,11717,1,10925,59,3,10925,65024,4,3,97,98,114,11729,11734,11739,114,114,59,1,10508,114,107,59,1,10098,4,2,97,107,11745,11758,99,4,2,101,107,11752,11755,59,1,123,59,1,91,4,2,101,115,11764,11767,59,1,10635,108,4,2,100,117,11774,11777,59,1,10639,59,1,10637,4,4,97,101,117,121,11790,11796,11811,11815,114,111,110,59,1,318,4,2,100,105,11802,11807,105,108,59,1,316,108,59,1,8968,98,59,1,123,59,1,1083,4,4,99,113,114,115,11828,11832,11845,11864,97,59,1,10550,117,111,4,2,59,114,11840,11842,1,8220,59,1,8222,4,2,100,117,11851,11857,104,97,114,59,1,10599,115,104,97,114,59,1,10571,104,59,1,8626,4,5,59,102,103,113,115,11880,11882,12008,12011,12031,1,8804,116,4,5,97,104,108,114,116,11895,11913,11935,11947,11996,114,114,111,119,4,2,59,116,11905,11907,1,8592,97,105,108,59,1,8610,97,114,112,111,111,110,4,2,100,117,11925,11931,111,119,110,59,1,8637,112,59,1,8636,101,102,116,97,114,114,111,119,115,59,1,8647,105,103,104,116,4,3,97,104,115,11959,11974,11984,114,114,111,119,4,2,59,115,11969,11971,1,8596,59,1,8646,97,114,112,111,111,110,115,59,1,8651,113,117,105,103,97,114,114,111,119,59,1,8621,104,114,101,101,116,105,109,101,115,59,1,8907,59,1,8922,4,3,59,113,115,12019,12021,12024,1,8804,59,1,8806,108,97,110,116,59,1,10877,4,5,59,99,100,103,115,12043,12045,12049,12070,12083,1,10877,99,59,1,10920,111,116,4,2,59,111,12057,12059,1,10879,4,2,59,114,12065,12067,1,10881,59,1,10883,4,2,59,101,12076,12079,3,8922,65024,115,59,1,10899,4,5,97,100,101,103,115,12095,12103,12108,12126,12131,112,112,114,111,120,59,1,10885,111,116,59,1,8918,113,4,2,103,113,12115,12120,116,114,59,1,8922,103,116,114,59,1,10891,116,114,59,1,8822,105,109,59,1,8818,4,3,105,108,114,12144,12150,12156,115,104,116,59,1,10620,111,111,114,59,1,8970,59,3,55349,56617,4,2,59,69,12166,12168,1,8822,59,1,10897,4,2,97,98,12177,12198,114,4,2,100,117,12184,12187,59,1,8637,4,2,59,108,12193,12195,1,8636,59,1,10602,108,107,59,1,9604,99,121,59,1,1113,4,5,59,97,99,104,116,12220,12222,12227,12235,12241,1,8810,114,114,59,1,8647,111,114,110,101,114,59,1,8990,97,114,100,59,1,10603,114,105,59,1,9722,4,2,105,111,12252,12258,100,111,116,59,1,320,117,115,116,4,2,59,97,12267,12269,1,9136,99,104,101,59,1,9136,4,4,69,97,101,115,12285,12288,12303,12322,59,1,8808,112,4,2,59,112,12295,12297,1,10889,114,111,120,59,1,10889,4,2,59,113,12309,12311,1,10887,4,2,59,113,12317,12319,1,10887,59,1,8808,105,109,59,1,8934,4,8,97,98,110,111,112,116,119,122,12345,12359,12364,12421,12446,12467,12474,12490,4,2,110,114,12351,12355,103,59,1,10220,114,59,1,8701,114,107,59,1,10214,103,4,3,108,109,114,12373,12401,12409,101,102,116,4,2,97,114,12382,12389,114,114,111,119,59,1,10229,105,103,104,116,97,114,114,111,119,59,1,10231,97,112,115,116,111,59,1,10236,105,103,104,116,97,114,114,111,119,59,1,10230,112,97,114,114,111,119,4,2,108,114,12433,12439,101,102,116,59,1,8619,105,103,104,116,59,1,8620,4,3,97,102,108,12454,12458,12462,114,59,1,10629,59,3,55349,56669,117,115,59,1,10797,105,109,101,115,59,1,10804,4,2,97,98,12480,12485,115,116,59,1,8727,97,114,59,1,95,4,3,59,101,102,12498,12500,12506,1,9674,110,103,101,59,1,9674,59,1,10731,97,114,4,2,59,108,12517,12519,1,40,116,59,1,10643,4,5,97,99,104,109,116,12535,12540,12548,12561,12564,114,114,59,1,8646,111,114,110,101,114,59,1,8991,97,114,4,2,59,100,12556,12558,1,8651,59,1,10605,59,1,8206,114,105,59,1,8895,4,6,97,99,104,105,113,116,12583,12589,12594,12597,12614,12635,113,117,111,59,1,8249,114,59,3,55349,56513,59,1,8624,109,4,3,59,101,103,12606,12608,12611,1,8818,59,1,10893,59,1,10895,4,2,98,117,12620,12623,59,1,91,111,4,2,59,114,12630,12632,1,8216,59,1,8218,114,111,107,59,1,322,5,60,8,59,99,100,104,105,108,113,114,12660,12662,12675,12680,12686,12692,12698,12705,1,60,4,2,99,105,12668,12671,59,1,10918,114,59,1,10873,111,116,59,1,8918,114,101,101,59,1,8907,109,101,115,59,1,8905,97,114,114,59,1,10614,117,101,115,116,59,1,10875,4,2,80,105,12711,12716,97,114,59,1,10646,4,3,59,101,102,12724,12726,12729,1,9667,59,1,8884,59,1,9666,114,4,2,100,117,12739,12746,115,104,97,114,59,1,10570,104,97,114,59,1,10598,4,2,101,110,12758,12768,114,116,110,101,113,113,59,3,8808,65024,69,59,3,8808,65024,4,14,68,97,99,100,101,102,104,105,108,110,111,112,115,117,12803,12809,12893,12908,12914,12928,12933,12937,13011,13025,13032,13049,13052,13069,68,111,116,59,1,8762,4,4,99,108,112,114,12819,12827,12849,12887,114,5,175,1,59,12825,1,175,4,2,101,116,12833,12836,59,1,9794,4,2,59,101,12842,12844,1,10016,115,101,59,1,10016,4,2,59,115,12855,12857,1,8614,116,111,4,4,59,100,108,117,12869,12871,12877,12883,1,8614,111,119,110,59,1,8615,101,102,116,59,1,8612,112,59,1,8613,107,101,114,59,1,9646,4,2,111,121,12899,12905,109,109,97,59,1,10793,59,1,1084,97,115,104,59,1,8212,97,115,117,114,101,100,97,110,103,108,101,59,1,8737,114,59,3,55349,56618,111,59,1,8487,4,3,99,100,110,12945,12954,12985,114,111,5,181,1,59,12952,1,181,4,4,59,97,99,100,12964,12966,12971,12976,1,8739,115,116,59,1,42,105,114,59,1,10992,111,116,5,183,1,59,12983,1,183,117,115,4,3,59,98,100,12995,12997,13e3,1,8722,59,1,8863,4,2,59,117,13006,13008,1,8760,59,1,10794,4,2,99,100,13017,13021,112,59,1,10971,114,59,1,8230,112,108,117,115,59,1,8723,4,2,100,112,13038,13044,101,108,115,59,1,8871,102,59,3,55349,56670,59,1,8723,4,2,99,116,13058,13063,114,59,3,55349,56514,112,111,115,59,1,8766,4,3,59,108,109,13077,13079,13087,1,956,116,105,109,97,112,59,1,8888,97,112,59,1,8888,4,24,71,76,82,86,97,98,99,100,101,102,103,104,105,106,108,109,111,112,114,115,116,117,118,119,13142,13165,13217,13229,13247,13330,13359,13414,13420,13508,13513,13579,13602,13626,13631,13762,13767,13855,13936,13995,14214,14285,14312,14432,4,2,103,116,13148,13152,59,3,8921,824,4,2,59,118,13158,13161,3,8811,8402,59,3,8811,824,4,3,101,108,116,13173,13200,13204,102,116,4,2,97,114,13181,13188,114,114,111,119,59,1,8653,105,103,104,116,97,114,114,111,119,59,1,8654,59,3,8920,824,4,2,59,118,13210,13213,3,8810,8402,59,3,8810,824,105,103,104,116,97,114,114,111,119,59,1,8655,4,2,68,100,13235,13241,97,115,104,59,1,8879,97,115,104,59,1,8878,4,5,98,99,110,112,116,13259,13264,13270,13275,13308,108,97,59,1,8711,117,116,101,59,1,324,103,59,3,8736,8402,4,5,59,69,105,111,112,13287,13289,13293,13298,13302,1,8777,59,3,10864,824,100,59,3,8779,824,115,59,1,329,114,111,120,59,1,8777,117,114,4,2,59,97,13316,13318,1,9838,108,4,2,59,115,13325,13327,1,9838,59,1,8469,4,2,115,117,13336,13344,112,5,160,1,59,13342,1,160,109,112,4,2,59,101,13352,13355,3,8782,824,59,3,8783,824,4,5,97,101,111,117,121,13371,13385,13391,13407,13411,4,2,112,114,13377,13380,59,1,10819,111,110,59,1,328,100,105,108,59,1,326,110,103,4,2,59,100,13399,13401,1,8775,111,116,59,3,10861,824,112,59,1,10818,59,1,1085,97,115,104,59,1,8211,4,7,59,65,97,100,113,115,120,13436,13438,13443,13466,13472,13478,13494,1,8800,114,114,59,1,8663,114,4,2,104,114,13450,13454,107,59,1,10532,4,2,59,111,13460,13462,1,8599,119,59,1,8599,111,116,59,3,8784,824,117,105,118,59,1,8802,4,2,101,105,13484,13489,97,114,59,1,10536,109,59,3,8770,824,105,115,116,4,2,59,115,13503,13505,1,8708,59,1,8708,114,59,3,55349,56619,4,4,69,101,115,116,13523,13527,13563,13568,59,3,8807,824,4,3,59,113,115,13535,13537,13559,1,8817,4,3,59,113,115,13545,13547,13551,1,8817,59,3,8807,824,108,97,110,116,59,3,10878,824,59,3,10878,824,105,109,59,1,8821,4,2,59,114,13574,13576,1,8815,59,1,8815,4,3,65,97,112,13587,13592,13597,114,114,59,1,8654,114,114,59,1,8622,97,114,59,1,10994,4,3,59,115,118,13610,13612,13623,1,8715,4,2,59,100,13618,13620,1,8956,59,1,8954,59,1,8715,99,121,59,1,1114,4,7,65,69,97,100,101,115,116,13647,13652,13656,13661,13665,13737,13742,114,114,59,1,8653,59,3,8806,824,114,114,59,1,8602,114,59,1,8229,4,4,59,102,113,115,13675,13677,13703,13725,1,8816,116,4,2,97,114,13684,13691,114,114,111,119,59,1,8602,105,103,104,116,97,114,114,111,119,59,1,8622,4,3,59,113,115,13711,13713,13717,1,8816,59,3,8806,824,108,97,110,116,59,3,10877,824,4,2,59,115,13731,13734,3,10877,824,59,1,8814,105,109,59,1,8820,4,2,59,114,13748,13750,1,8814,105,4,2,59,101,13757,13759,1,8938,59,1,8940,105,100,59,1,8740,4,2,112,116,13773,13778,102,59,3,55349,56671,5,172,3,59,105,110,13787,13789,13829,1,172,110,4,4,59,69,100,118,13800,13802,13806,13812,1,8713,59,3,8953,824,111,116,59,3,8949,824,4,3,97,98,99,13820,13823,13826,59,1,8713,59,1,8951,59,1,8950,105,4,2,59,118,13836,13838,1,8716,4,3,97,98,99,13846,13849,13852,59,1,8716,59,1,8958,59,1,8957,4,3,97,111,114,13863,13892,13899,114,4,4,59,97,115,116,13874,13876,13883,13888,1,8742,108,108,101,108,59,1,8742,108,59,3,11005,8421,59,3,8706,824,108,105,110,116,59,1,10772,4,3,59,99,101,13907,13909,13914,1,8832,117,101,59,1,8928,4,2,59,99,13920,13923,3,10927,824,4,2,59,101,13929,13931,1,8832,113,59,3,10927,824,4,4,65,97,105,116,13946,13951,13971,13982,114,114,59,1,8655,114,114,4,3,59,99,119,13961,13963,13967,1,8603,59,3,10547,824,59,3,8605,824,103,104,116,97,114,114,111,119,59,1,8603,114,105,4,2,59,101,13990,13992,1,8939,59,1,8941,4,7,99,104,105,109,112,113,117,14011,14036,14060,14080,14085,14090,14106,4,4,59,99,101,114,14021,14023,14028,14032,1,8833,117,101,59,1,8929,59,3,10928,824,59,3,55349,56515,111,114,116,4,2,109,112,14045,14050,105,100,59,1,8740,97,114,97,108,108,101,108,59,1,8742,109,4,2,59,101,14067,14069,1,8769,4,2,59,113,14075,14077,1,8772,59,1,8772,105,100,59,1,8740,97,114,59,1,8742,115,117,4,2,98,112,14098,14102,101,59,1,8930,101,59,1,8931,4,3,98,99,112,14114,14157,14171,4,4,59,69,101,115,14124,14126,14130,14133,1,8836,59,3,10949,824,59,1,8840,101,116,4,2,59,101,14141,14144,3,8834,8402,113,4,2,59,113,14151,14153,1,8840,59,3,10949,824,99,4,2,59,101,14164,14166,1,8833,113,59,3,10928,824,4,4,59,69,101,115,14181,14183,14187,14190,1,8837,59,3,10950,824,59,1,8841,101,116,4,2,59,101,14198,14201,3,8835,8402,113,4,2,59,113,14208,14210,1,8841,59,3,10950,824,4,4,103,105,108,114,14224,14228,14238,14242,108,59,1,8825,108,100,101,5,241,1,59,14236,1,241,103,59,1,8824,105,97,110,103,108,101,4,2,108,114,14254,14269,101,102,116,4,2,59,101,14263,14265,1,8938,113,59,1,8940,105,103,104,116,4,2,59,101,14279,14281,1,8939,113,59,1,8941,4,2,59,109,14291,14293,1,957,4,3,59,101,115,14301,14303,14308,1,35,114,111,59,1,8470,112,59,1,8199,4,9,68,72,97,100,103,105,108,114,115,14332,14338,14344,14349,14355,14369,14376,14408,14426,97,115,104,59,1,8877,97,114,114,59,1,10500,112,59,3,8781,8402,97,115,104,59,1,8876,4,2,101,116,14361,14365,59,3,8805,8402,59,3,62,8402,110,102,105,110,59,1,10718,4,3,65,101,116,14384,14389,14393,114,114,59,1,10498,59,3,8804,8402,4,2,59,114,14399,14402,3,60,8402,105,101,59,3,8884,8402,4,2,65,116,14414,14419,114,114,59,1,10499,114,105,101,59,3,8885,8402,105,109,59,3,8764,8402,4,3,65,97,110,14440,14445,14468,114,114,59,1,8662,114,4,2,104,114,14452,14456,107,59,1,10531,4,2,59,111,14462,14464,1,8598,119,59,1,8598,101,97,114,59,1,10535,4,18,83,97,99,100,101,102,103,104,105,108,109,111,112,114,115,116,117,118,14512,14515,14535,14560,14597,14603,14618,14643,14657,14662,14701,14741,14747,14769,14851,14877,14907,14916,59,1,9416,4,2,99,115,14521,14531,117,116,101,5,243,1,59,14529,1,243,116,59,1,8859,4,2,105,121,14541,14557,114,4,2,59,99,14548,14550,1,8858,5,244,1,59,14555,1,244,59,1,1086,4,5,97,98,105,111,115,14572,14577,14583,14587,14591,115,104,59,1,8861,108,97,99,59,1,337,118,59,1,10808,116,59,1,8857,111,108,100,59,1,10684,108,105,103,59,1,339,4,2,99,114,14609,14614,105,114,59,1,10687,59,3,55349,56620,4,3,111,114,116,14626,14630,14640,110,59,1,731,97,118,101,5,242,1,59,14638,1,242,59,1,10689,4,2,98,109,14649,14654,97,114,59,1,10677,59,1,937,110,116,59,1,8750,4,4,97,99,105,116,14672,14677,14693,14698,114,114,59,1,8634,4,2,105,114,14683,14687,114,59,1,10686,111,115,115,59,1,10683,110,101,59,1,8254,59,1,10688,4,3,97,101,105,14709,14714,14719,99,114,59,1,333,103,97,59,1,969,4,3,99,100,110,14727,14733,14736,114,111,110,59,1,959,59,1,10678,117,115,59,1,8854,112,102,59,3,55349,56672,4,3,97,101,108,14755,14759,14764,114,59,1,10679,114,112,59,1,10681,117,115,59,1,8853,4,7,59,97,100,105,111,115,118,14785,14787,14792,14831,14837,14841,14848,1,8744,114,114,59,1,8635,4,4,59,101,102,109,14802,14804,14817,14824,1,10845,114,4,2,59,111,14811,14813,1,8500,102,59,1,8500,5,170,1,59,14822,1,170,5,186,1,59,14829,1,186,103,111,102,59,1,8886,114,59,1,10838,108,111,112,101,59,1,10839,59,1,10843,4,3,99,108,111,14859,14863,14873,114,59,1,8500,97,115,104,5,248,1,59,14871,1,248,108,59,1,8856,105,4,2,108,109,14884,14893,100,101,5,245,1,59,14891,1,245,101,115,4,2,59,97,14901,14903,1,8855,115,59,1,10806,109,108,5,246,1,59,14914,1,246,98,97,114,59,1,9021,4,12,97,99,101,102,104,105,108,109,111,114,115,117,14948,14992,14996,15033,15038,15068,15090,15189,15192,15222,15427,15441,114,4,4,59,97,115,116,14959,14961,14976,14989,1,8741,5,182,2,59,108,14968,14970,1,182,108,101,108,59,1,8741,4,2,105,108,14982,14986,109,59,1,10995,59,1,11005,59,1,8706,121,59,1,1087,114,4,5,99,105,109,112,116,15009,15014,15019,15024,15027,110,116,59,1,37,111,100,59,1,46,105,108,59,1,8240,59,1,8869,101,110,107,59,1,8241,114,59,3,55349,56621,4,3,105,109,111,15046,15057,15063,4,2,59,118,15052,15054,1,966,59,1,981,109,97,116,59,1,8499,110,101,59,1,9742,4,3,59,116,118,15076,15078,15087,1,960,99,104,102,111,114,107,59,1,8916,59,1,982,4,2,97,117,15096,15119,110,4,2,99,107,15103,15115,107,4,2,59,104,15110,15112,1,8463,59,1,8462,118,59,1,8463,115,4,9,59,97,98,99,100,101,109,115,116,15140,15142,15148,15151,15156,15168,15171,15179,15184,1,43,99,105,114,59,1,10787,59,1,8862,105,114,59,1,10786,4,2,111,117,15162,15165,59,1,8724,59,1,10789,59,1,10866,110,5,177,1,59,15177,1,177,105,109,59,1,10790,119,111,59,1,10791,59,1,177,4,3,105,112,117,15200,15208,15213,110,116,105,110,116,59,1,10773,102,59,3,55349,56673,110,100,5,163,1,59,15220,1,163,4,10,59,69,97,99,101,105,110,111,115,117,15244,15246,15249,15253,15258,15334,15347,15367,15416,15421,1,8826,59,1,10931,112,59,1,10935,117,101,59,1,8828,4,2,59,99,15264,15266,1,10927,4,6,59,97,99,101,110,115,15280,15282,15290,15299,15303,15329,1,8826,112,112,114,111,120,59,1,10935,117,114,108,121,101,113,59,1,8828,113,59,1,10927,4,3,97,101,115,15311,15319,15324,112,112,114,111,120,59,1,10937,113,113,59,1,10933,105,109,59,1,8936,105,109,59,1,8830,109,101,4,2,59,115,15342,15344,1,8242,59,1,8473,4,3,69,97,115,15355,15358,15362,59,1,10933,112,59,1,10937,105,109,59,1,8936,4,3,100,102,112,15375,15378,15404,59,1,8719,4,3,97,108,115,15386,15392,15398,108,97,114,59,1,9006,105,110,101,59,1,8978,117,114,102,59,1,8979,4,2,59,116,15410,15412,1,8733,111,59,1,8733,105,109,59,1,8830,114,101,108,59,1,8880,4,2,99,105,15433,15438,114,59,3,55349,56517,59,1,968,110,99,115,112,59,1,8200,4,6,102,105,111,112,115,117,15462,15467,15472,15478,15485,15491,114,59,3,55349,56622,110,116,59,1,10764,112,102,59,3,55349,56674,114,105,109,101,59,1,8279,99,114,59,3,55349,56518,4,3,97,101,111,15499,15520,15534,116,4,2,101,105,15506,15515,114,110,105,111,110,115,59,1,8461,110,116,59,1,10774,115,116,4,2,59,101,15528,15530,1,63,113,59,1,8799,116,5,34,1,59,15540,1,34,4,21,65,66,72,97,98,99,100,101,102,104,105,108,109,110,111,112,114,115,116,117,120,15586,15609,15615,15620,15796,15855,15893,15931,15977,16001,16039,16183,16204,16222,16228,16285,16312,16318,16363,16408,16416,4,3,97,114,116,15594,15599,15603,114,114,59,1,8667,114,59,1,8658,97,105,108,59,1,10524,97,114,114,59,1,10511,97,114,59,1,10596,4,7,99,100,101,110,113,114,116,15636,15651,15656,15664,15687,15696,15770,4,2,101,117,15642,15646,59,3,8765,817,116,101,59,1,341,105,99,59,1,8730,109,112,116,121,118,59,1,10675,103,4,4,59,100,101,108,15675,15677,15680,15683,1,10217,59,1,10642,59,1,10661,101,59,1,10217,117,111,5,187,1,59,15694,1,187,114,4,11,59,97,98,99,102,104,108,112,115,116,119,15721,15723,15727,15739,15742,15746,15750,15754,15758,15763,15767,1,8594,112,59,1,10613,4,2,59,102,15733,15735,1,8677,115,59,1,10528,59,1,10547,115,59,1,10526,107,59,1,8618,112,59,1,8620,108,59,1,10565,105,109,59,1,10612,108,59,1,8611,59,1,8605,4,2,97,105,15776,15781,105,108,59,1,10522,111,4,2,59,110,15788,15790,1,8758,97,108,115,59,1,8474,4,3,97,98,114,15804,15809,15814,114,114,59,1,10509,114,107,59,1,10099,4,2,97,107,15820,15833,99,4,2,101,107,15827,15830,59,1,125,59,1,93,4,2,101,115,15839,15842,59,1,10636,108,4,2,100,117,15849,15852,59,1,10638,59,1,10640,4,4,97,101,117,121,15865,15871,15886,15890,114,111,110,59,1,345,4,2,100,105,15877,15882,105,108,59,1,343,108,59,1,8969,98,59,1,125,59,1,1088,4,4,99,108,113,115,15903,15907,15914,15927,97,59,1,10551,100,104,97,114,59,1,10601,117,111,4,2,59,114,15922,15924,1,8221,59,1,8221,104,59,1,8627,4,3,97,99,103,15939,15966,15970,108,4,4,59,105,112,115,15950,15952,15957,15963,1,8476,110,101,59,1,8475,97,114,116,59,1,8476,59,1,8477,116,59,1,9645,5,174,1,59,15975,1,174,4,3,105,108,114,15985,15991,15997,115,104,116,59,1,10621,111,111,114,59,1,8971,59,3,55349,56623,4,2,97,111,16007,16028,114,4,2,100,117,16014,16017,59,1,8641,4,2,59,108,16023,16025,1,8640,59,1,10604,4,2,59,118,16034,16036,1,961,59,1,1009,4,3,103,110,115,16047,16167,16171,104,116,4,6,97,104,108,114,115,116,16063,16081,16103,16130,16143,16155,114,114,111,119,4,2,59,116,16073,16075,1,8594,97,105,108,59,1,8611,97,114,112,111,111,110,4,2,100,117,16093,16099,111,119,110,59,1,8641,112,59,1,8640,101,102,116,4,2,97,104,16112,16120,114,114,111,119,115,59,1,8644,97,114,112,111,111,110,115,59,1,8652,105,103,104,116,97,114,114,111,119,115,59,1,8649,113,117,105,103,97,114,114,111,119,59,1,8605,104,114,101,101,116,105,109,101,115,59,1,8908,103,59,1,730,105,110,103,100,111,116,115,101,113,59,1,8787,4,3,97,104,109,16191,16196,16201,114,114,59,1,8644,97,114,59,1,8652,59,1,8207,111,117,115,116,4,2,59,97,16214,16216,1,9137,99,104,101,59,1,9137,109,105,100,59,1,10990,4,4,97,98,112,116,16238,16252,16257,16278,4,2,110,114,16244,16248,103,59,1,10221,114,59,1,8702,114,107,59,1,10215,4,3,97,102,108,16265,16269,16273,114,59,1,10630,59,3,55349,56675,117,115,59,1,10798,105,109,101,115,59,1,10805,4,2,97,112,16291,16304,114,4,2,59,103,16298,16300,1,41,116,59,1,10644,111,108,105,110,116,59,1,10770,97,114,114,59,1,8649,4,4,97,99,104,113,16328,16334,16339,16342,113,117,111,59,1,8250,114,59,3,55349,56519,59,1,8625,4,2,98,117,16348,16351,59,1,93,111,4,2,59,114,16358,16360,1,8217,59,1,8217,4,3,104,105,114,16371,16377,16383,114,101,101,59,1,8908,109,101,115,59,1,8906,105,4,4,59,101,102,108,16394,16396,16399,16402,1,9657,59,1,8885,59,1,9656,116,114,105,59,1,10702,108,117,104,97,114,59,1,10600,59,1,8478,4,19,97,98,99,100,101,102,104,105,108,109,111,112,113,114,115,116,117,119,122,16459,16466,16472,16572,16590,16672,16687,16746,16844,16850,16924,16963,16988,17115,17121,17154,17206,17614,17656,99,117,116,101,59,1,347,113,117,111,59,1,8218,4,10,59,69,97,99,101,105,110,112,115,121,16494,16496,16499,16513,16518,16531,16536,16556,16564,16569,1,8827,59,1,10932,4,2,112,114,16505,16508,59,1,10936,111,110,59,1,353,117,101,59,1,8829,4,2,59,100,16524,16526,1,10928,105,108,59,1,351,114,99,59,1,349,4,3,69,97,115,16544,16547,16551,59,1,10934,112,59,1,10938,105,109,59,1,8937,111,108,105,110,116,59,1,10771,105,109,59,1,8831,59,1,1089,111,116,4,3,59,98,101,16582,16584,16587,1,8901,59,1,8865,59,1,10854,4,7,65,97,99,109,115,116,120,16606,16611,16634,16642,16646,16652,16668,114,114,59,1,8664,114,4,2,104,114,16618,16622,107,59,1,10533,4,2,59,111,16628,16630,1,8600,119,59,1,8600,116,5,167,1,59,16640,1,167,105,59,1,59,119,97,114,59,1,10537,109,4,2,105,110,16659,16665,110,117,115,59,1,8726,59,1,8726,116,59,1,10038,114,4,2,59,111,16679,16682,3,55349,56624,119,110,59,1,8994,4,4,97,99,111,121,16697,16702,16716,16739,114,112,59,1,9839,4,2,104,121,16708,16713,99,121,59,1,1097,59,1,1096,114,116,4,2,109,112,16724,16729,105,100,59,1,8739,97,114,97,108,108,101,108,59,1,8741,5,173,1,59,16744,1,173,4,2,103,109,16752,16770,109,97,4,3,59,102,118,16762,16764,16767,1,963,59,1,962,59,1,962,4,8,59,100,101,103,108,110,112,114,16788,16790,16795,16806,16817,16828,16832,16838,1,8764,111,116,59,1,10858,4,2,59,113,16801,16803,1,8771,59,1,8771,4,2,59,69,16812,16814,1,10910,59,1,10912,4,2,59,69,16823,16825,1,10909,59,1,10911,101,59,1,8774,108,117,115,59,1,10788,97,114,114,59,1,10610,97,114,114,59,1,8592,4,4,97,101,105,116,16860,16883,16891,16904,4,2,108,115,16866,16878,108,115,101,116,109,105,110,117,115,59,1,8726,104,112,59,1,10803,112,97,114,115,108,59,1,10724,4,2,100,108,16897,16900,59,1,8739,101,59,1,8995,4,2,59,101,16910,16912,1,10922,4,2,59,115,16918,16920,1,10924,59,3,10924,65024,4,3,102,108,112,16932,16938,16958,116,99,121,59,1,1100,4,2,59,98,16944,16946,1,47,4,2,59,97,16952,16954,1,10692,114,59,1,9023,102,59,3,55349,56676,97,4,2,100,114,16970,16985,101,115,4,2,59,117,16978,16980,1,9824,105,116,59,1,9824,59,1,8741,4,3,99,115,117,16996,17028,17089,4,2,97,117,17002,17015,112,4,2,59,115,17009,17011,1,8851,59,3,8851,65024,112,4,2,59,115,17022,17024,1,8852,59,3,8852,65024,117,4,2,98,112,17035,17062,4,3,59,101,115,17043,17045,17048,1,8847,59,1,8849,101,116,4,2,59,101,17056,17058,1,8847,113,59,1,8849,4,3,59,101,115,17070,17072,17075,1,8848,59,1,8850,101,116,4,2,59,101,17083,17085,1,8848,113,59,1,8850,4,3,59,97,102,17097,17099,17112,1,9633,114,4,2,101,102,17106,17109,59,1,9633,59,1,9642,59,1,9642,97,114,114,59,1,8594,4,4,99,101,109,116,17131,17136,17142,17148,114,59,3,55349,56520,116,109,110,59,1,8726,105,108,101,59,1,8995,97,114,102,59,1,8902,4,2,97,114,17160,17172,114,4,2,59,102,17167,17169,1,9734,59,1,9733,4,2,97,110,17178,17202,105,103,104,116,4,2,101,112,17188,17197,112,115,105,108,111,110,59,1,1013,104,105,59,1,981,115,59,1,175,4,5,98,99,109,110,112,17218,17351,17420,17423,17427,4,9,59,69,100,101,109,110,112,114,115,17238,17240,17243,17248,17261,17267,17279,17285,17291,1,8834,59,1,10949,111,116,59,1,10941,4,2,59,100,17254,17256,1,8838,111,116,59,1,10947,117,108,116,59,1,10945,4,2,69,101,17273,17276,59,1,10955,59,1,8842,108,117,115,59,1,10943,97,114,114,59,1,10617,4,3,101,105,117,17299,17335,17339,116,4,3,59,101,110,17308,17310,17322,1,8834,113,4,2,59,113,17317,17319,1,8838,59,1,10949,101,113,4,2,59,113,17330,17332,1,8842,59,1,10955,109,59,1,10951,4,2,98,112,17345,17348,59,1,10965,59,1,10963,99,4,6,59,97,99,101,110,115,17366,17368,17376,17385,17389,17415,1,8827,112,112,114,111,120,59,1,10936,117,114,108,121,101,113,59,1,8829,113,59,1,10928,4,3,97,101,115,17397,17405,17410,112,112,114,111,120,59,1,10938,113,113,59,1,10934,105,109,59,1,8937,105,109,59,1,8831,59,1,8721,103,59,1,9834,4,13,49,50,51,59,69,100,101,104,108,109,110,112,115,17455,17462,17469,17476,17478,17481,17496,17509,17524,17530,17536,17548,17554,5,185,1,59,17460,1,185,5,178,1,59,17467,1,178,5,179,1,59,17474,1,179,1,8835,59,1,10950,4,2,111,115,17487,17491,116,59,1,10942,117,98,59,1,10968,4,2,59,100,17502,17504,1,8839,111,116,59,1,10948,115,4,2,111,117,17516,17520,108,59,1,10185,98,59,1,10967,97,114,114,59,1,10619,117,108,116,59,1,10946,4,2,69,101,17542,17545,59,1,10956,59,1,8843,108,117,115,59,1,10944,4,3,101,105,117,17562,17598,17602,116,4,3,59,101,110,17571,17573,17585,1,8835,113,4,2,59,113,17580,17582,1,8839,59,1,10950,101,113,4,2,59,113,17593,17595,1,8843,59,1,10956,109,59,1,10952,4,2,98,112,17608,17611,59,1,10964,59,1,10966,4,3,65,97,110,17622,17627,17650,114,114,59,1,8665,114,4,2,104,114,17634,17638,107,59,1,10534,4,2,59,111,17644,17646,1,8601,119,59,1,8601,119,97,114,59,1,10538,108,105,103,5,223,1,59,17664,1,223,4,13,97,98,99,100,101,102,104,105,111,112,114,115,119,17694,17709,17714,17737,17742,17749,17754,17860,17905,17957,17964,18090,18122,4,2,114,117,17700,17706,103,101,116,59,1,8982,59,1,964,114,107,59,1,9140,4,3,97,101,121,17722,17728,17734,114,111,110,59,1,357,100,105,108,59,1,355,59,1,1090,111,116,59,1,8411,108,114,101,99,59,1,8981,114,59,3,55349,56625,4,4,101,105,107,111,17764,17805,17836,17851,4,2,114,116,17770,17786,101,4,2,52,102,17777,17780,59,1,8756,111,114,101,59,1,8756,97,4,3,59,115,118,17795,17797,17802,1,952,121,109,59,1,977,59,1,977,4,2,99,110,17811,17831,107,4,2,97,115,17818,17826,112,112,114,111,120,59,1,8776,105,109,59,1,8764,115,112,59,1,8201,4,2,97,115,17842,17846,112,59,1,8776,105,109,59,1,8764,114,110,5,254,1,59,17858,1,254,4,3,108,109,110,17868,17873,17901,100,101,59,1,732,101,115,5,215,3,59,98,100,17884,17886,17898,1,215,4,2,59,97,17892,17894,1,8864,114,59,1,10801,59,1,10800,116,59,1,8749,4,3,101,112,115,17913,17917,17953,97,59,1,10536,4,4,59,98,99,102,17927,17929,17934,17939,1,8868,111,116,59,1,9014,105,114,59,1,10993,4,2,59,111,17945,17948,3,55349,56677,114,107,59,1,10970,97,59,1,10537,114,105,109,101,59,1,8244,4,3,97,105,112,17972,17977,18082,100,101,59,1,8482,4,7,97,100,101,109,112,115,116,17993,18051,18056,18059,18066,18072,18076,110,103,108,101,4,5,59,100,108,113,114,18009,18011,18017,18032,18035,1,9653,111,119,110,59,1,9663,101,102,116,4,2,59,101,18026,18028,1,9667,113,59,1,8884,59,1,8796,105,103,104,116,4,2,59,101,18045,18047,1,9657,113,59,1,8885,111,116,59,1,9708,59,1,8796,105,110,117,115,59,1,10810,108,117,115,59,1,10809,98,59,1,10701,105,109,101,59,1,10811,101,122,105,117,109,59,1,9186,4,3,99,104,116,18098,18111,18116,4,2,114,121,18104,18108,59,3,55349,56521,59,1,1094,99,121,59,1,1115,114,111,107,59,1,359,4,2,105,111,18128,18133,120,116,59,1,8812,104,101,97,100,4,2,108,114,18143,18154,101,102,116,97,114,114,111,119,59,1,8606,105,103,104,116,97,114,114,111,119,59,1,8608,4,18,65,72,97,98,99,100,102,103,104,108,109,111,112,114,115,116,117,119,18204,18209,18214,18234,18250,18268,18292,18308,18319,18343,18379,18397,18413,18504,18547,18553,18584,18603,114,114,59,1,8657,97,114,59,1,10595,4,2,99,114,18220,18230,117,116,101,5,250,1,59,18228,1,250,114,59,1,8593,114,4,2,99,101,18241,18245,121,59,1,1118,118,101,59,1,365,4,2,105,121,18256,18265,114,99,5,251,1,59,18263,1,251,59,1,1091,4,3,97,98,104,18276,18281,18287,114,114,59,1,8645,108,97,99,59,1,369,97,114,59,1,10606,4,2,105,114,18298,18304,115,104,116,59,1,10622,59,3,55349,56626,114,97,118,101,5,249,1,59,18317,1,249,4,2,97,98,18325,18338,114,4,2,108,114,18332,18335,59,1,8639,59,1,8638,108,107,59,1,9600,4,2,99,116,18349,18374,4,2,111,114,18355,18369,114,110,4,2,59,101,18363,18365,1,8988,114,59,1,8988,111,112,59,1,8975,114,105,59,1,9720,4,2,97,108,18385,18390,99,114,59,1,363,5,168,1,59,18395,1,168,4,2,103,112,18403,18408,111,110,59,1,371,102,59,3,55349,56678,4,6,97,100,104,108,115,117,18427,18434,18445,18470,18475,18494,114,114,111,119,59,1,8593,111,119,110,97,114,114,111,119,59,1,8597,97,114,112,111,111,110,4,2,108,114,18457,18463,101,102,116,59,1,8639,105,103,104,116,59,1,8638,117,115,59,1,8846,105,4,3,59,104,108,18484,18486,18489,1,965,59,1,978,111,110,59,1,965,112,97,114,114,111,119,115,59,1,8648,4,3,99,105,116,18512,18537,18542,4,2,111,114,18518,18532,114,110,4,2,59,101,18526,18528,1,8989,114,59,1,8989,111,112,59,1,8974,110,103,59,1,367,114,105,59,1,9721,99,114,59,3,55349,56522,4,3,100,105,114,18561,18566,18572,111,116,59,1,8944,108,100,101,59,1,361,105,4,2,59,102,18579,18581,1,9653,59,1,9652,4,2,97,109,18590,18595,114,114,59,1,8648,108,5,252,1,59,18601,1,252,97,110,103,108,101,59,1,10663,4,15,65,66,68,97,99,100,101,102,108,110,111,112,114,115,122,18643,18648,18661,18667,18847,18851,18857,18904,18909,18915,18931,18937,18943,18949,18996,114,114,59,1,8661,97,114,4,2,59,118,18656,18658,1,10984,59,1,10985,97,115,104,59,1,8872,4,2,110,114,18673,18679,103,114,116,59,1,10652,4,7,101,107,110,112,114,115,116,18695,18704,18711,18720,18742,18754,18810,112,115,105,108,111,110,59,1,1013,97,112,112,97,59,1,1008,111,116,104,105,110,103,59,1,8709,4,3,104,105,114,18728,18732,18735,105,59,1,981,59,1,982,111,112,116,111,59,1,8733,4,2,59,104,18748,18750,1,8597,111,59,1,1009,4,2,105,117,18760,18766,103,109,97,59,1,962,4,2,98,112,18772,18791,115,101,116,110,101,113,4,2,59,113,18784,18787,3,8842,65024,59,3,10955,65024,115,101,116,110,101,113,4,2,59,113,18803,18806,3,8843,65024,59,3,10956,65024,4,2,104,114,18816,18822,101,116,97,59,1,977,105,97,110,103,108,101,4,2,108,114,18834,18840,101,102,116,59,1,8882,105,103,104,116,59,1,8883,121,59,1,1074,97,115,104,59,1,8866,4,3,101,108,114,18865,18884,18890,4,3,59,98,101,18873,18875,18880,1,8744,97,114,59,1,8891,113,59,1,8794,108,105,112,59,1,8942,4,2,98,116,18896,18901,97,114,59,1,124,59,1,124,114,59,3,55349,56627,116,114,105,59,1,8882,115,117,4,2,98,112,18923,18927,59,3,8834,8402,59,3,8835,8402,112,102,59,3,55349,56679,114,111,112,59,1,8733,116,114,105,59,1,8883,4,2,99,117,18955,18960,114,59,3,55349,56523,4,2,98,112,18966,18981,110,4,2,69,101,18973,18977,59,3,10955,65024,59,3,8842,65024,110,4,2,69,101,18988,18992,59,3,10956,65024,59,3,8843,65024,105,103,122,97,103,59,1,10650,4,7,99,101,102,111,112,114,115,19020,19026,19061,19066,19072,19075,19089,105,114,99,59,1,373,4,2,100,105,19032,19055,4,2,98,103,19038,19043,97,114,59,1,10847,101,4,2,59,113,19050,19052,1,8743,59,1,8793,101,114,112,59,1,8472,114,59,3,55349,56628,112,102,59,3,55349,56680,59,1,8472,4,2,59,101,19081,19083,1,8768,97,116,104,59,1,8768,99,114,59,3,55349,56524,4,14,99,100,102,104,105,108,109,110,111,114,115,117,118,119,19125,19146,19152,19157,19173,19176,19192,19197,19202,19236,19252,19269,19286,19291,4,3,97,105,117,19133,19137,19142,112,59,1,8898,114,99,59,1,9711,112,59,1,8899,116,114,105,59,1,9661,114,59,3,55349,56629,4,2,65,97,19163,19168,114,114,59,1,10234,114,114,59,1,10231,59,1,958,4,2,65,97,19182,19187,114,114,59,1,10232,114,114,59,1,10229,97,112,59,1,10236,105,115,59,1,8955,4,3,100,112,116,19210,19215,19230,111,116,59,1,10752,4,2,102,108,19221,19225,59,3,55349,56681,117,115,59,1,10753,105,109,101,59,1,10754,4,2,65,97,19242,19247,114,114,59,1,10233,114,114,59,1,10230,4,2,99,113,19258,19263,114,59,3,55349,56525,99,117,112,59,1,10758,4,2,112,116,19275,19281,108,117,115,59,1,10756,114,105,59,1,9651,101,101,59,1,8897,101,100,103,101,59,1,8896,4,8,97,99,101,102,105,111,115,117,19316,19335,19349,19357,19362,19367,19373,19379,99,4,2,117,121,19323,19332,116,101,5,253,1,59,19330,1,253,59,1,1103,4,2,105,121,19341,19346,114,99,59,1,375,59,1,1099,110,5,165,1,59,19355,1,165,114,59,3,55349,56630,99,121,59,1,1111,112,102,59,3,55349,56682,99,114,59,3,55349,56526,4,2,99,109,19385,19389,121,59,1,1102,108,5,255,1,59,19395,1,255,4,10,97,99,100,101,102,104,105,111,115,119,19419,19426,19441,19446,19462,19467,19472,19480,19486,19492,99,117,116,101,59,1,378,4,2,97,121,19432,19438,114,111,110,59,1,382,59,1,1079,111,116,59,1,380,4,2,101,116,19452,19458,116,114,102,59,1,8488,97,59,1,950,114,59,3,55349,56631,99,121,59,1,1078,103,114,97,114,114,59,1,8669,112,102,59,3,55349,56683,99,114,59,3,55349,56527,4,2,106,110,19498,19501,59,1,8205,106,59,1,8204]);const P=s,H={DASH_DASH_STRING:[45,45],DOCTYPE_STRING:[68,79,67,84,89,80,69],CDATA_START_STRING:[91,67,68,65,84,65,91],SCRIPT_STRING:[115,99,114,105,112,116],PUBLIC_STRING:[80,85,66,76,73,67],SYSTEM_STRING:[83,89,83,84,69,77]},D={128:8364,130:8218,131:402,132:8222,133:8230,134:8224,135:8225,136:710,137:8240,138:352,139:8249,140:338,142:381,145:8216,146:8217,147:8220,148:8221,149:8226,150:8211,151:8212,152:732,153:8482,154:353,155:8250,156:339,158:382,159:376},F="DATA_STATE",U="RCDATA_STATE",G="RAWTEXT_STATE",B="SCRIPT_DATA_STATE",K="PLAINTEXT_STATE",b="TAG_OPEN_STATE",x="END_TAG_OPEN_STATE",y="TAG_NAME_STATE",v="RCDATA_LESS_THAN_SIGN_STATE",Y="RCDATA_END_TAG_OPEN_STATE",w="RCDATA_END_TAG_NAME_STATE",Q="RAWTEXT_LESS_THAN_SIGN_STATE",X="RAWTEXT_END_TAG_OPEN_STATE",W="RAWTEXT_END_TAG_NAME_STATE",V="SCRIPT_DATA_LESS_THAN_SIGN_STATE",j="SCRIPT_DATA_END_TAG_OPEN_STATE",z="SCRIPT_DATA_END_TAG_NAME_STATE",q="SCRIPT_DATA_ESCAPE_START_STATE",J="SCRIPT_DATA_ESCAPE_START_DASH_STATE",Z="SCRIPT_DATA_ESCAPED_STATE",$="SCRIPT_DATA_ESCAPED_DASH_STATE",ee="SCRIPT_DATA_ESCAPED_DASH_DASH_STATE",te="SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN_STATE",ne="SCRIPT_DATA_ESCAPED_END_TAG_OPEN_STATE",se="SCRIPT_DATA_ESCAPED_END_TAG_NAME_STATE",re="SCRIPT_DATA_DOUBLE_ESCAPE_START_STATE",ie="SCRIPT_DATA_DOUBLE_ESCAPED_STATE",oe="SCRIPT_DATA_DOUBLE_ESCAPED_DASH_STATE",ae="SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH_STATE",Te="SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN_STATE",Ee="SCRIPT_DATA_DOUBLE_ESCAPE_END_STATE",he="BEFORE_ATTRIBUTE_NAME_STATE",ce="ATTRIBUTE_NAME_STATE",_e="AFTER_ATTRIBUTE_NAME_STATE",le="BEFORE_ATTRIBUTE_VALUE_STATE",me="ATTRIBUTE_VALUE_DOUBLE_QUOTED_STATE",pe="ATTRIBUTE_VALUE_SINGLE_QUOTED_STATE",Ae="ATTRIBUTE_VALUE_UNQUOTED_STATE",ue="AFTER_ATTRIBUTE_VALUE_QUOTED_STATE",Ne="SELF_CLOSING_START_TAG_STATE",de="BOGUS_COMMENT_STATE",Ce="MARKUP_DECLARATION_OPEN_STATE",Oe="COMMENT_START_STATE",fe="COMMENT_START_DASH_STATE",Se="COMMENT_STATE",Re="COMMENT_LESS_THAN_SIGN_STATE",Ie="COMMENT_LESS_THAN_SIGN_BANG_STATE",Le="COMMENT_LESS_THAN_SIGN_BANG_DASH_STATE",ke="COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH_STATE",Me="COMMENT_END_DASH_STATE",ge="COMMENT_END_STATE",Pe="COMMENT_END_BANG_STATE",He="DOCTYPE_STATE",De="BEFORE_DOCTYPE_NAME_STATE",Fe="DOCTYPE_NAME_STATE",Ue="AFTER_DOCTYPE_NAME_STATE",Ge="AFTER_DOCTYPE_PUBLIC_KEYWORD_STATE",Be="BEFORE_DOCTYPE_PUBLIC_IDENTIFIER_STATE",Ke="DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED_STATE",be="DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED_STATE",xe="AFTER_DOCTYPE_PUBLIC_IDENTIFIER_STATE",ye="BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS_STATE",ve="AFTER_DOCTYPE_SYSTEM_KEYWORD_STATE",Ye="BEFORE_DOCTYPE_SYSTEM_IDENTIFIER_STATE",we="DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED_STATE",Qe="DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED_STATE",Xe="AFTER_DOCTYPE_SYSTEM_IDENTIFIER_STATE",We="BOGUS_DOCTYPE_STATE",Ve="CDATA_SECTION_STATE",je="CDATA_SECTION_BRACKET_STATE",ze="CDATA_SECTION_END_STATE",qe="CHARACTER_REFERENCE_STATE",Je="NAMED_CHARACTER_REFERENCE_STATE",Ze="AMBIGUOS_AMPERSAND_STATE",$e="NUMERIC_CHARACTER_REFERENCE_STATE",et="HEXADEMICAL_CHARACTER_REFERENCE_START_STATE",tt="DECIMAL_CHARACTER_REFERENCE_START_STATE",nt="HEXADEMICAL_CHARACTER_REFERENCE_STATE",st="DECIMAL_CHARACTER_REFERENCE_STATE",rt="NUMERIC_CHARACTER_REFERENCE_END_STATE";function it(e){return e===P.SPACE||e===P.LINE_FEED||e===P.TABULATION||e===P.FORM_FEED}function ot(e){return e>=P.DIGIT_0&&e<=P.DIGIT_9}function at(e){return e>=P.LATIN_CAPITAL_A&&e<=P.LATIN_CAPITAL_Z}function Tt(e){return e>=P.LATIN_SMALL_A&&e<=P.LATIN_SMALL_Z}function Et(e){return Tt(e)||at(e)}function ht(e){return Et(e)||ot(e)}function ct(e){return e>=P.LATIN_CAPITAL_A&&e<=P.LATIN_CAPITAL_F}function _t(e){return e>=P.LATIN_SMALL_A&&e<=P.LATIN_SMALL_F}function lt(e){return e+32}function mt(e){return e<=65535?String.fromCharCode(e):(e-=65536,String.fromCharCode(e>>>10&1023|55296)+String.fromCharCode(56320|1023&e))}function pt(e){return String.fromCharCode(lt(e))}function At(e,t){const n=g[++e];let s=++e,r=s+n-1;for(;s<=r;){const e=s+r>>>1,i=g[e];if(i<t)s=e+1;else {if(!(i>t))return g[e+n];r=e-1;}}return -1}class ut{constructor(){this.preprocessor=new class{constructor(){this.html=null,this.pos=-1,this.lastGapPos=-1,this.lastCharPos=-1,this.gapStack=[],this.skipNextNewLine=!1,this.lastChunkWritten=!1,this.endOfChunkHit=!1,this.bufferWaterline=65536;}_err(){}_addGap(){this.gapStack.push(this.lastGapPos),this.lastGapPos=this.pos;}_processSurrogate(e){if(this.pos!==this.lastCharPos){const t=this.html.charCodeAt(this.pos+1);if(function(e){return e>=56320&&e<=57343}(t))return this.pos++,this._addGap(),1024*(e-55296)+9216+t}else if(!this.lastChunkWritten)return this.endOfChunkHit=!0,M.EOF;return this._err("surrogate-in-input-stream"),e}dropParsedChunk(){this.pos>this.bufferWaterline&&(this.lastCharPos-=this.pos,this.html=this.html.substring(this.pos),this.pos=0,this.lastGapPos=-1,this.gapStack=[]);}write(e,t){this.html?this.html+=e:this.html=e,this.lastCharPos=this.html.length-1,this.endOfChunkHit=!1,this.lastChunkWritten=t;}insertHtmlAtCurrentPos(e){this.html=this.html.substring(0,this.pos+1)+e+this.html.substring(this.pos+1,this.html.length),this.lastCharPos=this.html.length-1,this.endOfChunkHit=!1;}advance(){if(this.pos++,this.pos>this.lastCharPos)return this.endOfChunkHit=!this.lastChunkWritten,M.EOF;let e=this.html.charCodeAt(this.pos);return this.skipNextNewLine&&e===M.LINE_FEED?(this.skipNextNewLine=!1,this._addGap(),this.advance()):e===M.CARRIAGE_RETURN?(this.skipNextNewLine=!0,M.LINE_FEED):(this.skipNextNewLine=!1,r(e)&&(e=this._processSurrogate(e)),e>31&&e<127||e===M.LINE_FEED||e===M.CARRIAGE_RETURN||e>159&&e<64976||this._checkForProblematicCharacters(e),e)}_checkForProblematicCharacters(e){i(e)?this._err("control-character-in-input-stream"):o(e)&&this._err("noncharacter-in-input-stream");}retreat(){this.pos===this.lastGapPos&&(this.lastGapPos=this.gapStack.pop(),this.pos--),this.pos--;}},this.tokenQueue=[],this.allowCDATA=!1,this.state=F,this.returnState="",this.charRefCode=-1,this.tempBuff=[],this.lastStartTagName="",this.consumedAfterSnapshot=-1,this.active=!1,this.currentCharacterToken=null,this.currentToken=null,this.currentAttr=null;}_err(){}_errOnNextCodePoint(e){this._consume(),this._err(e),this._unconsume();}getNextToken(){for(;!this.tokenQueue.length&&this.active;){this.consumedAfterSnapshot=0;const e=this._consume();this._ensureHibernation()||this[this.state](e);}return this.tokenQueue.shift()}write(e,t){this.active=!0,this.preprocessor.write(e,t);}insertHtmlAtCurrentPos(e){this.active=!0,this.preprocessor.insertHtmlAtCurrentPos(e);}_ensureHibernation(){if(this.preprocessor.endOfChunkHit){for(;this.consumedAfterSnapshot>0;this.consumedAfterSnapshot--)this.preprocessor.retreat();return this.active=!1,this.tokenQueue.push({type:ut.HIBERNATION_TOKEN}),!0}return !1}_consume(){return this.consumedAfterSnapshot++,this.preprocessor.advance()}_unconsume(){this.consumedAfterSnapshot--,this.preprocessor.retreat();}_reconsumeInState(e){this.state=e,this._unconsume();}_consumeSequenceIfMatch(e,t,n){let s=0,r=!0;const i=e.length;let o,a=0,T=t;for(;a<i;a++){if(a>0&&(T=this._consume(),s++),T===P.EOF){r=!1;break}if(o=e[a],T!==o&&(n||T!==lt(o))){r=!1;break}}if(!r)for(;s--;)this._unconsume();return r}_isTempBufferEqualToScriptString(){if(this.tempBuff.length!==H.SCRIPT_STRING.length)return !1;for(let e=0;e<this.tempBuff.length;e++)if(this.tempBuff[e]!==H.SCRIPT_STRING[e])return !1;return !0}_createStartTagToken(){this.currentToken={type:ut.START_TAG_TOKEN,tagName:"",selfClosing:!1,ackSelfClosing:!1,attrs:[]};}_createEndTagToken(){this.currentToken={type:ut.END_TAG_TOKEN,tagName:"",selfClosing:!1,attrs:[]};}_createCommentToken(){this.currentToken={type:ut.COMMENT_TOKEN,data:""};}_createDoctypeToken(e){this.currentToken={type:ut.DOCTYPE_TOKEN,name:e,forceQuirks:!1,publicId:null,systemId:null};}_createCharacterToken(e,t){this.currentCharacterToken={type:e,chars:t};}_createEOFToken(){this.currentToken={type:ut.EOF_TOKEN};}_createAttr(e){this.currentAttr={name:e,value:""};}_leaveAttrName(e){null===ut.getTokenAttr(this.currentToken,this.currentAttr.name)?this.currentToken.attrs.push(this.currentAttr):this._err("duplicate-attribute"),this.state=e;}_leaveAttrValue(e){this.state=e;}_emitCurrentToken(){this._emitCurrentCharacterToken();const e=this.currentToken;this.currentToken=null,e.type===ut.START_TAG_TOKEN?this.lastStartTagName=e.tagName:e.type===ut.END_TAG_TOKEN&&(e.attrs.length>0&&this._err("end-tag-with-attributes"),e.selfClosing&&this._err("end-tag-with-trailing-solidus")),this.tokenQueue.push(e);}_emitCurrentCharacterToken(){this.currentCharacterToken&&(this.tokenQueue.push(this.currentCharacterToken),this.currentCharacterToken=null);}_emitEOFToken(){this._createEOFToken(),this._emitCurrentToken();}_appendCharToCurrentCharacterToken(e,t){this.currentCharacterToken&&this.currentCharacterToken.type!==e&&this._emitCurrentCharacterToken(),this.currentCharacterToken?this.currentCharacterToken.chars+=t:this._createCharacterToken(e,t);}_emitCodePoint(e){let t=ut.CHARACTER_TOKEN;it(e)?t=ut.WHITESPACE_CHARACTER_TOKEN:e===P.NULL&&(t=ut.NULL_CHARACTER_TOKEN),this._appendCharToCurrentCharacterToken(t,mt(e));}_emitSeveralCodePoints(e){for(let t=0;t<e.length;t++)this._emitCodePoint(e[t]);}_emitChars(e){this._appendCharToCurrentCharacterToken(ut.CHARACTER_TOKEN,e);}_matchNamedCharacterReference(e){let t=null,n=1,s=At(0,e);for(this.tempBuff.push(e);s>-1;){const e=g[s],r=e<7;r&&1&e&&(t=2&e?[g[++s],g[++s]]:[g[++s]],n=0);const i=this._consume();if(this.tempBuff.push(i),n++,i===P.EOF)break;s=r?4&e?At(s,i):-1:i===e?++s:-1;}for(;n--;)this.tempBuff.pop(),this._unconsume();return t}_isCharacterReferenceInAttribute(){return this.returnState===me||this.returnState===pe||this.returnState===Ae}_isCharacterReferenceAttributeQuirk(e){if(!e&&this._isCharacterReferenceInAttribute()){const e=this._consume();return this._unconsume(),e===P.EQUALS_SIGN||ht(e)}return !1}_flushCodePointsConsumedAsCharacterReference(){if(this._isCharacterReferenceInAttribute())for(let e=0;e<this.tempBuff.length;e++)this.currentAttr.value+=mt(this.tempBuff[e]);else this._emitSeveralCodePoints(this.tempBuff);this.tempBuff=[];}[F](e){this.preprocessor.dropParsedChunk(),e===P.LESS_THAN_SIGN?this.state=b:e===P.AMPERSAND?(this.returnState=F,this.state=qe):e===P.NULL?(this._err(a),this._emitCodePoint(e)):e===P.EOF?this._emitEOFToken():this._emitCodePoint(e);}[U](e){this.preprocessor.dropParsedChunk(),e===P.AMPERSAND?(this.returnState=U,this.state=qe):e===P.LESS_THAN_SIGN?this.state=v:e===P.NULL?(this._err(a),this._emitChars(n)):e===P.EOF?this._emitEOFToken():this._emitCodePoint(e);}[G](e){this.preprocessor.dropParsedChunk(),e===P.LESS_THAN_SIGN?this.state=Q:e===P.NULL?(this._err(a),this._emitChars(n)):e===P.EOF?this._emitEOFToken():this._emitCodePoint(e);}[B](e){this.preprocessor.dropParsedChunk(),e===P.LESS_THAN_SIGN?this.state=V:e===P.NULL?(this._err(a),this._emitChars(n)):e===P.EOF?this._emitEOFToken():this._emitCodePoint(e);}[K](e){this.preprocessor.dropParsedChunk(),e===P.NULL?(this._err(a),this._emitChars(n)):e===P.EOF?this._emitEOFToken():this._emitCodePoint(e);}[b](e){e===P.EXCLAMATION_MARK?this.state=Ce:e===P.SOLIDUS?this.state=x:Et(e)?(this._createStartTagToken(),this._reconsumeInState(y)):e===P.QUESTION_MARK?(this._err("unexpected-question-mark-instead-of-tag-name"),this._createCommentToken(),this._reconsumeInState(de)):e===P.EOF?(this._err(h),this._emitChars("<"),this._emitEOFToken()):(this._err(T),this._emitChars("<"),this._reconsumeInState(F));}[x](e){Et(e)?(this._createEndTagToken(),this._reconsumeInState(y)):e===P.GREATER_THAN_SIGN?(this._err("missing-end-tag-name"),this.state=F):e===P.EOF?(this._err(h),this._emitChars("</"),this._emitEOFToken()):(this._err(T),this._createCommentToken(),this._reconsumeInState(de));}[y](e){it(e)?this.state=he:e===P.SOLIDUS?this.state=Ne:e===P.GREATER_THAN_SIGN?(this.state=F,this._emitCurrentToken()):at(e)?this.currentToken.tagName+=pt(e):e===P.NULL?(this._err(a),this.currentToken.tagName+=n):e===P.EOF?(this._err(c),this._emitEOFToken()):this.currentToken.tagName+=mt(e);}[v](e){e===P.SOLIDUS?(this.tempBuff=[],this.state=Y):(this._emitChars("<"),this._reconsumeInState(U));}[Y](e){Et(e)?(this._createEndTagToken(),this._reconsumeInState(w)):(this._emitChars("</"),this._reconsumeInState(U));}[w](e){if(at(e))this.currentToken.tagName+=pt(e),this.tempBuff.push(e);else if(Tt(e))this.currentToken.tagName+=mt(e),this.tempBuff.push(e);else {if(this.lastStartTagName===this.currentToken.tagName){if(it(e))return void(this.state=he);if(e===P.SOLIDUS)return void(this.state=Ne);if(e===P.GREATER_THAN_SIGN)return this.state=F,void this._emitCurrentToken()}this._emitChars("</"),this._emitSeveralCodePoints(this.tempBuff),this._reconsumeInState(U);}}[Q](e){e===P.SOLIDUS?(this.tempBuff=[],this.state=X):(this._emitChars("<"),this._reconsumeInState(G));}[X](e){Et(e)?(this._createEndTagToken(),this._reconsumeInState(W)):(this._emitChars("</"),this._reconsumeInState(G));}[W](e){if(at(e))this.currentToken.tagName+=pt(e),this.tempBuff.push(e);else if(Tt(e))this.currentToken.tagName+=mt(e),this.tempBuff.push(e);else {if(this.lastStartTagName===this.currentToken.tagName){if(it(e))return void(this.state=he);if(e===P.SOLIDUS)return void(this.state=Ne);if(e===P.GREATER_THAN_SIGN)return this._emitCurrentToken(),void(this.state=F)}this._emitChars("</"),this._emitSeveralCodePoints(this.tempBuff),this._reconsumeInState(G);}}[V](e){e===P.SOLIDUS?(this.tempBuff=[],this.state=j):e===P.EXCLAMATION_MARK?(this.state=q,this._emitChars("<!")):(this._emitChars("<"),this._reconsumeInState(B));}[j](e){Et(e)?(this._createEndTagToken(),this._reconsumeInState(z)):(this._emitChars("</"),this._reconsumeInState(B));}[z](e){if(at(e))this.currentToken.tagName+=pt(e),this.tempBuff.push(e);else if(Tt(e))this.currentToken.tagName+=mt(e),this.tempBuff.push(e);else {if(this.lastStartTagName===this.currentToken.tagName){if(it(e))return void(this.state=he);if(e===P.SOLIDUS)return void(this.state=Ne);if(e===P.GREATER_THAN_SIGN)return this._emitCurrentToken(),void(this.state=F)}this._emitChars("</"),this._emitSeveralCodePoints(this.tempBuff),this._reconsumeInState(B);}}[q](e){e===P.HYPHEN_MINUS?(this.state=J,this._emitChars("-")):this._reconsumeInState(B);}[J](e){e===P.HYPHEN_MINUS?(this.state=ee,this._emitChars("-")):this._reconsumeInState(B);}[Z](e){e===P.HYPHEN_MINUS?(this.state=$,this._emitChars("-")):e===P.LESS_THAN_SIGN?this.state=te:e===P.NULL?(this._err(a),this._emitChars(n)):e===P.EOF?(this._err(O),this._emitEOFToken()):this._emitCodePoint(e);}[$](e){e===P.HYPHEN_MINUS?(this.state=ee,this._emitChars("-")):e===P.LESS_THAN_SIGN?this.state=te:e===P.NULL?(this._err(a),this.state=Z,this._emitChars(n)):e===P.EOF?(this._err(O),this._emitEOFToken()):(this.state=Z,this._emitCodePoint(e));}[ee](e){e===P.HYPHEN_MINUS?this._emitChars("-"):e===P.LESS_THAN_SIGN?this.state=te:e===P.GREATER_THAN_SIGN?(this.state=B,this._emitChars(">")):e===P.NULL?(this._err(a),this.state=Z,this._emitChars(n)):e===P.EOF?(this._err(O),this._emitEOFToken()):(this.state=Z,this._emitCodePoint(e));}[te](e){e===P.SOLIDUS?(this.tempBuff=[],this.state=ne):Et(e)?(this.tempBuff=[],this._emitChars("<"),this._reconsumeInState(re)):(this._emitChars("<"),this._reconsumeInState(Z));}[ne](e){Et(e)?(this._createEndTagToken(),this._reconsumeInState(se)):(this._emitChars("</"),this._reconsumeInState(Z));}[se](e){if(at(e))this.currentToken.tagName+=pt(e),this.tempBuff.push(e);else if(Tt(e))this.currentToken.tagName+=mt(e),this.tempBuff.push(e);else {if(this.lastStartTagName===this.currentToken.tagName){if(it(e))return void(this.state=he);if(e===P.SOLIDUS)return void(this.state=Ne);if(e===P.GREATER_THAN_SIGN)return this._emitCurrentToken(),void(this.state=F)}this._emitChars("</"),this._emitSeveralCodePoints(this.tempBuff),this._reconsumeInState(Z);}}[re](e){it(e)||e===P.SOLIDUS||e===P.GREATER_THAN_SIGN?(this.state=this._isTempBufferEqualToScriptString()?ie:Z,this._emitCodePoint(e)):at(e)?(this.tempBuff.push(lt(e)),this._emitCodePoint(e)):Tt(e)?(this.tempBuff.push(e),this._emitCodePoint(e)):this._reconsumeInState(Z);}[ie](e){e===P.HYPHEN_MINUS?(this.state=oe,this._emitChars("-")):e===P.LESS_THAN_SIGN?(this.state=Te,this._emitChars("<")):e===P.NULL?(this._err(a),this._emitChars(n)):e===P.EOF?(this._err(O),this._emitEOFToken()):this._emitCodePoint(e);}[oe](e){e===P.HYPHEN_MINUS?(this.state=ae,this._emitChars("-")):e===P.LESS_THAN_SIGN?(this.state=Te,this._emitChars("<")):e===P.NULL?(this._err(a),this.state=ie,this._emitChars(n)):e===P.EOF?(this._err(O),this._emitEOFToken()):(this.state=ie,this._emitCodePoint(e));}[ae](e){e===P.HYPHEN_MINUS?this._emitChars("-"):e===P.LESS_THAN_SIGN?(this.state=Te,this._emitChars("<")):e===P.GREATER_THAN_SIGN?(this.state=B,this._emitChars(">")):e===P.NULL?(this._err(a),this.state=ie,this._emitChars(n)):e===P.EOF?(this._err(O),this._emitEOFToken()):(this.state=ie,this._emitCodePoint(e));}[Te](e){e===P.SOLIDUS?(this.tempBuff=[],this.state=Ee,this._emitChars("/")):this._reconsumeInState(ie);}[Ee](e){it(e)||e===P.SOLIDUS||e===P.GREATER_THAN_SIGN?(this.state=this._isTempBufferEqualToScriptString()?Z:ie,this._emitCodePoint(e)):at(e)?(this.tempBuff.push(lt(e)),this._emitCodePoint(e)):Tt(e)?(this.tempBuff.push(e),this._emitCodePoint(e)):this._reconsumeInState(ie);}[he](e){it(e)||(e===P.SOLIDUS||e===P.GREATER_THAN_SIGN||e===P.EOF?this._reconsumeInState(_e):e===P.EQUALS_SIGN?(this._err("unexpected-equals-sign-before-attribute-name"),this._createAttr("="),this.state=ce):(this._createAttr(""),this._reconsumeInState(ce)));}[ce](e){it(e)||e===P.SOLIDUS||e===P.GREATER_THAN_SIGN||e===P.EOF?(this._leaveAttrName(_e),this._unconsume()):e===P.EQUALS_SIGN?this._leaveAttrName(le):at(e)?this.currentAttr.name+=pt(e):e===P.QUOTATION_MARK||e===P.APOSTROPHE||e===P.LESS_THAN_SIGN?(this._err("unexpected-character-in-attribute-name"),this.currentAttr.name+=mt(e)):e===P.NULL?(this._err(a),this.currentAttr.name+=n):this.currentAttr.name+=mt(e);}[_e](e){it(e)||(e===P.SOLIDUS?this.state=Ne:e===P.EQUALS_SIGN?this.state=le:e===P.GREATER_THAN_SIGN?(this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(c),this._emitEOFToken()):(this._createAttr(""),this._reconsumeInState(ce)));}[le](e){it(e)||(e===P.QUOTATION_MARK?this.state=me:e===P.APOSTROPHE?this.state=pe:e===P.GREATER_THAN_SIGN?(this._err("missing-attribute-value"),this.state=F,this._emitCurrentToken()):this._reconsumeInState(Ae));}[me](e){e===P.QUOTATION_MARK?this.state=ue:e===P.AMPERSAND?(this.returnState=me,this.state=qe):e===P.NULL?(this._err(a),this.currentAttr.value+=n):e===P.EOF?(this._err(c),this._emitEOFToken()):this.currentAttr.value+=mt(e);}[pe](e){e===P.APOSTROPHE?this.state=ue:e===P.AMPERSAND?(this.returnState=pe,this.state=qe):e===P.NULL?(this._err(a),this.currentAttr.value+=n):e===P.EOF?(this._err(c),this._emitEOFToken()):this.currentAttr.value+=mt(e);}[Ae](e){it(e)?this._leaveAttrValue(he):e===P.AMPERSAND?(this.returnState=Ae,this.state=qe):e===P.GREATER_THAN_SIGN?(this._leaveAttrValue(F),this._emitCurrentToken()):e===P.NULL?(this._err(a),this.currentAttr.value+=n):e===P.QUOTATION_MARK||e===P.APOSTROPHE||e===P.LESS_THAN_SIGN||e===P.EQUALS_SIGN||e===P.GRAVE_ACCENT?(this._err("unexpected-character-in-unquoted-attribute-value"),this.currentAttr.value+=mt(e)):e===P.EOF?(this._err(c),this._emitEOFToken()):this.currentAttr.value+=mt(e);}[ue](e){it(e)?this._leaveAttrValue(he):e===P.SOLIDUS?this._leaveAttrValue(Ne):e===P.GREATER_THAN_SIGN?(this._leaveAttrValue(F),this._emitCurrentToken()):e===P.EOF?(this._err(c),this._emitEOFToken()):(this._err("missing-whitespace-between-attributes"),this._reconsumeInState(he));}[Ne](e){e===P.GREATER_THAN_SIGN?(this.currentToken.selfClosing=!0,this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(c),this._emitEOFToken()):(this._err("unexpected-solidus-in-tag"),this._reconsumeInState(he));}[de](e){e===P.GREATER_THAN_SIGN?(this.state=F,this._emitCurrentToken()):e===P.EOF?(this._emitCurrentToken(),this._emitEOFToken()):e===P.NULL?(this._err(a),this.currentToken.data+=n):this.currentToken.data+=mt(e);}[Ce](e){this._consumeSequenceIfMatch(H.DASH_DASH_STRING,e,!0)?(this._createCommentToken(),this.state=Oe):this._consumeSequenceIfMatch(H.DOCTYPE_STRING,e,!1)?this.state=He:this._consumeSequenceIfMatch(H.CDATA_START_STRING,e,!0)?this.allowCDATA?this.state=Ve:(this._err("cdata-in-html-content"),this._createCommentToken(),this.currentToken.data="[CDATA[",this.state=de):this._ensureHibernation()||(this._err("incorrectly-opened-comment"),this._createCommentToken(),this._reconsumeInState(de));}[Oe](e){e===P.HYPHEN_MINUS?this.state=fe:e===P.GREATER_THAN_SIGN?(this._err(S),this.state=F,this._emitCurrentToken()):this._reconsumeInState(Se);}[fe](e){e===P.HYPHEN_MINUS?this.state=ge:e===P.GREATER_THAN_SIGN?(this._err(S),this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(R),this._emitCurrentToken(),this._emitEOFToken()):(this.currentToken.data+="-",this._reconsumeInState(Se));}[Se](e){e===P.HYPHEN_MINUS?this.state=Me:e===P.LESS_THAN_SIGN?(this.currentToken.data+="<",this.state=Re):e===P.NULL?(this._err(a),this.currentToken.data+=n):e===P.EOF?(this._err(R),this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.data+=mt(e);}[Re](e){e===P.EXCLAMATION_MARK?(this.currentToken.data+="!",this.state=Ie):e===P.LESS_THAN_SIGN?this.currentToken.data+="!":this._reconsumeInState(Se);}[Ie](e){e===P.HYPHEN_MINUS?this.state=Le:this._reconsumeInState(Se);}[Le](e){e===P.HYPHEN_MINUS?this.state=ke:this._reconsumeInState(Me);}[ke](e){e!==P.GREATER_THAN_SIGN&&e!==P.EOF&&this._err("nested-comment"),this._reconsumeInState(ge);}[Me](e){e===P.HYPHEN_MINUS?this.state=ge:e===P.EOF?(this._err(R),this._emitCurrentToken(),this._emitEOFToken()):(this.currentToken.data+="-",this._reconsumeInState(Se));}[ge](e){e===P.GREATER_THAN_SIGN?(this.state=F,this._emitCurrentToken()):e===P.EXCLAMATION_MARK?this.state=Pe:e===P.HYPHEN_MINUS?this.currentToken.data+="-":e===P.EOF?(this._err(R),this._emitCurrentToken(),this._emitEOFToken()):(this.currentToken.data+="--",this._reconsumeInState(Se));}[Pe](e){e===P.HYPHEN_MINUS?(this.currentToken.data+="--!",this.state=Me):e===P.GREATER_THAN_SIGN?(this._err("incorrectly-closed-comment"),this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(R),this._emitCurrentToken(),this._emitEOFToken()):(this.currentToken.data+="--!",this._reconsumeInState(Se));}[He](e){it(e)?this.state=De:e===P.GREATER_THAN_SIGN?this._reconsumeInState(De):e===P.EOF?(this._err(f),this._createDoctypeToken(null),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err("missing-whitespace-before-doctype-name"),this._reconsumeInState(De));}[De](e){it(e)||(at(e)?(this._createDoctypeToken(pt(e)),this.state=Fe):e===P.NULL?(this._err(a),this._createDoctypeToken(n),this.state=Fe):e===P.GREATER_THAN_SIGN?(this._err("missing-doctype-name"),this._createDoctypeToken(null),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=F):e===P.EOF?(this._err(f),this._createDoctypeToken(null),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._createDoctypeToken(mt(e)),this.state=Fe));}[Fe](e){it(e)?this.state=Ue:e===P.GREATER_THAN_SIGN?(this.state=F,this._emitCurrentToken()):at(e)?this.currentToken.name+=pt(e):e===P.NULL?(this._err(a),this.currentToken.name+=n):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.name+=mt(e);}[Ue](e){it(e)||(e===P.GREATER_THAN_SIGN?(this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this._consumeSequenceIfMatch(H.PUBLIC_STRING,e,!1)?this.state=Ge:this._consumeSequenceIfMatch(H.SYSTEM_STRING,e,!1)?this.state=ve:this._ensureHibernation()||(this._err("invalid-character-sequence-after-doctype-name"),this.currentToken.forceQuirks=!0,this._reconsumeInState(We)));}[Ge](e){it(e)?this.state=Be:e===P.QUOTATION_MARK?(this._err(_),this.currentToken.publicId="",this.state=Ke):e===P.APOSTROPHE?(this._err(_),this.currentToken.publicId="",this.state=be):e===P.GREATER_THAN_SIGN?(this._err(u),this.currentToken.forceQuirks=!0,this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(p),this.currentToken.forceQuirks=!0,this._reconsumeInState(We));}[Be](e){it(e)||(e===P.QUOTATION_MARK?(this.currentToken.publicId="",this.state=Ke):e===P.APOSTROPHE?(this.currentToken.publicId="",this.state=be):e===P.GREATER_THAN_SIGN?(this._err(u),this.currentToken.forceQuirks=!0,this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(p),this.currentToken.forceQuirks=!0,this._reconsumeInState(We)));}[Ke](e){e===P.QUOTATION_MARK?this.state=xe:e===P.NULL?(this._err(a),this.currentToken.publicId+=n):e===P.GREATER_THAN_SIGN?(this._err(d),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=F):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.publicId+=mt(e);}[be](e){e===P.APOSTROPHE?this.state=xe:e===P.NULL?(this._err(a),this.currentToken.publicId+=n):e===P.GREATER_THAN_SIGN?(this._err(d),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=F):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.publicId+=mt(e);}[xe](e){it(e)?this.state=ye:e===P.GREATER_THAN_SIGN?(this.state=F,this._emitCurrentToken()):e===P.QUOTATION_MARK?(this._err(l),this.currentToken.systemId="",this.state=we):e===P.APOSTROPHE?(this._err(l),this.currentToken.systemId="",this.state=Qe):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(A),this.currentToken.forceQuirks=!0,this._reconsumeInState(We));}[ye](e){it(e)||(e===P.GREATER_THAN_SIGN?(this._emitCurrentToken(),this.state=F):e===P.QUOTATION_MARK?(this.currentToken.systemId="",this.state=we):e===P.APOSTROPHE?(this.currentToken.systemId="",this.state=Qe):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(A),this.currentToken.forceQuirks=!0,this._reconsumeInState(We)));}[ve](e){it(e)?this.state=Ye:e===P.QUOTATION_MARK?(this._err(m),this.currentToken.systemId="",this.state=we):e===P.APOSTROPHE?(this._err(m),this.currentToken.systemId="",this.state=Qe):e===P.GREATER_THAN_SIGN?(this._err(N),this.currentToken.forceQuirks=!0,this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(A),this.currentToken.forceQuirks=!0,this._reconsumeInState(We));}[Ye](e){it(e)||(e===P.QUOTATION_MARK?(this.currentToken.systemId="",this.state=we):e===P.APOSTROPHE?(this.currentToken.systemId="",this.state=Qe):e===P.GREATER_THAN_SIGN?(this._err(N),this.currentToken.forceQuirks=!0,this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(A),this.currentToken.forceQuirks=!0,this._reconsumeInState(We)));}[we](e){e===P.QUOTATION_MARK?this.state=Xe:e===P.NULL?(this._err(a),this.currentToken.systemId+=n):e===P.GREATER_THAN_SIGN?(this._err(C),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=F):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.systemId+=mt(e);}[Qe](e){e===P.APOSTROPHE?this.state=Xe:e===P.NULL?(this._err(a),this.currentToken.systemId+=n):e===P.GREATER_THAN_SIGN?(this._err(C),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=F):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.systemId+=mt(e);}[Xe](e){it(e)||(e===P.GREATER_THAN_SIGN?(this._emitCurrentToken(),this.state=F):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err("unexpected-character-after-doctype-system-identifier"),this._reconsumeInState(We)));}[We](e){e===P.GREATER_THAN_SIGN?(this._emitCurrentToken(),this.state=F):e===P.NULL?this._err(a):e===P.EOF&&(this._emitCurrentToken(),this._emitEOFToken());}[Ve](e){e===P.RIGHT_SQUARE_BRACKET?this.state=je:e===P.EOF?(this._err("eof-in-cdata"),this._emitEOFToken()):this._emitCodePoint(e);}[je](e){e===P.RIGHT_SQUARE_BRACKET?this.state=ze:(this._emitChars("]"),this._reconsumeInState(Ve));}[ze](e){e===P.GREATER_THAN_SIGN?this.state=F:e===P.RIGHT_SQUARE_BRACKET?this._emitChars("]"):(this._emitChars("]]"),this._reconsumeInState(Ve));}[qe](e){this.tempBuff=[P.AMPERSAND],e===P.NUMBER_SIGN?(this.tempBuff.push(e),this.state=$e):ht(e)?this._reconsumeInState(Je):(this._flushCodePointsConsumedAsCharacterReference(),this._reconsumeInState(this.returnState));}[Je](e){const t=this._matchNamedCharacterReference(e);if(this._ensureHibernation())this.tempBuff=[P.AMPERSAND];else if(t){const e=this.tempBuff[this.tempBuff.length-1]===P.SEMICOLON;this._isCharacterReferenceAttributeQuirk(e)||(e||this._errOnNextCodePoint(E),this.tempBuff=t),this._flushCodePointsConsumedAsCharacterReference(),this.state=this.returnState;}else this._flushCodePointsConsumedAsCharacterReference(),this.state=Ze;}[Ze](e){ht(e)?this._isCharacterReferenceInAttribute()?this.currentAttr.value+=mt(e):this._emitCodePoint(e):(e===P.SEMICOLON&&this._err("unknown-named-character-reference"),this._reconsumeInState(this.returnState));}[$e](e){this.charRefCode=0,e===P.LATIN_SMALL_X||e===P.LATIN_CAPITAL_X?(this.tempBuff.push(e),this.state=et):this._reconsumeInState(tt);}[et](e){!function(e){return ot(e)||ct(e)||_t(e)}(e)?(this._err(I),this._flushCodePointsConsumedAsCharacterReference(),this._reconsumeInState(this.returnState)):this._reconsumeInState(nt);}[tt](e){ot(e)?this._reconsumeInState(st):(this._err(I),this._flushCodePointsConsumedAsCharacterReference(),this._reconsumeInState(this.returnState));}[nt](e){ct(e)?this.charRefCode=16*this.charRefCode+e-55:_t(e)?this.charRefCode=16*this.charRefCode+e-87:ot(e)?this.charRefCode=16*this.charRefCode+e-48:e===P.SEMICOLON?this.state=rt:(this._err(E),this._reconsumeInState(rt));}[st](e){ot(e)?this.charRefCode=10*this.charRefCode+e-48:e===P.SEMICOLON?this.state=rt:(this._err(E),this._reconsumeInState(rt));}[rt](){if(this.charRefCode===P.NULL)this._err("null-character-reference"),this.charRefCode=P.REPLACEMENT_CHARACTER;else if(this.charRefCode>1114111)this._err("character-reference-outside-unicode-range"),this.charRefCode=P.REPLACEMENT_CHARACTER;else if(r(this.charRefCode))this._err("surrogate-character-reference"),this.charRefCode=P.REPLACEMENT_CHARACTER;else if(o(this.charRefCode))this._err("noncharacter-character-reference");else if(i(this.charRefCode)||this.charRefCode===P.CARRIAGE_RETURN){this._err("control-character-reference");const e=D[this.charRefCode];e&&(this.charRefCode=e);}this.tempBuff=[this.charRefCode],this._flushCodePointsConsumedAsCharacterReference(),this._reconsumeInState(this.returnState);}}ut.CHARACTER_TOKEN="CHARACTER_TOKEN",ut.NULL_CHARACTER_TOKEN="NULL_CHARACTER_TOKEN",ut.WHITESPACE_CHARACTER_TOKEN="WHITESPACE_CHARACTER_TOKEN",ut.START_TAG_TOKEN="START_TAG_TOKEN",ut.END_TAG_TOKEN="END_TAG_TOKEN",ut.COMMENT_TOKEN="COMMENT_TOKEN",ut.DOCTYPE_TOKEN="DOCTYPE_TOKEN",ut.EOF_TOKEN="EOF_TOKEN",ut.HIBERNATION_TOKEN="HIBERNATION_TOKEN",ut.MODE={DATA:F,RCDATA:U,RAWTEXT:G,SCRIPT_DATA:B,PLAINTEXT:K},ut.getTokenAttr=function(e,t){for(let n=e.attrs.length-1;n>=0;n--)if(e.attrs[n].name===t)return e.attrs[n].value;return null};var Nt=ut;function dt(e,t,n){return e(n={path:t,exports:{},require:function(e,t){return function(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}(null==t&&n.path)}},n.exports),n.exports}var Ct=dt((function(e,t){const n=t.NAMESPACES={HTML:"http://www.w3.org/1999/xhtml",MATHML:"http://www.w3.org/1998/Math/MathML",SVG:"http://www.w3.org/2000/svg",XLINK:"http://www.w3.org/1999/xlink",XML:"http://www.w3.org/XML/1998/namespace",XMLNS:"http://www.w3.org/2000/xmlns/"};t.ATTRS={TYPE:"type",ACTION:"action",ENCODING:"encoding",PROMPT:"prompt",NAME:"name",COLOR:"color",FACE:"face",SIZE:"size"},t.DOCUMENT_MODE={NO_QUIRKS:"no-quirks",QUIRKS:"quirks",LIMITED_QUIRKS:"limited-quirks"};const s=t.TAG_NAMES={A:"a",ADDRESS:"address",ANNOTATION_XML:"annotation-xml",APPLET:"applet",AREA:"area",ARTICLE:"article",ASIDE:"aside",B:"b",BASE:"base",BASEFONT:"basefont",BGSOUND:"bgsound",BIG:"big",BLOCKQUOTE:"blockquote",BODY:"body",BR:"br",BUTTON:"button",CAPTION:"caption",CENTER:"center",CODE:"code",COL:"col",COLGROUP:"colgroup",DD:"dd",DESC:"desc",DETAILS:"details",DIALOG:"dialog",DIR:"dir",DIV:"div",DL:"dl",DT:"dt",EM:"em",EMBED:"embed",FIELDSET:"fieldset",FIGCAPTION:"figcaption",FIGURE:"figure",FONT:"font",FOOTER:"footer",FOREIGN_OBJECT:"foreignObject",FORM:"form",FRAME:"frame",FRAMESET:"frameset",H1:"h1",H2:"h2",H3:"h3",H4:"h4",H5:"h5",H6:"h6",HEAD:"head",HEADER:"header",HGROUP:"hgroup",HR:"hr",HTML:"html",I:"i",IMG:"img",IMAGE:"image",INPUT:"input",IFRAME:"iframe",KEYGEN:"keygen",LABEL:"label",LI:"li",LINK:"link",LISTING:"listing",MAIN:"main",MALIGNMARK:"malignmark",MARQUEE:"marquee",MATH:"math",MENU:"menu",META:"meta",MGLYPH:"mglyph",MI:"mi",MO:"mo",MN:"mn",MS:"ms",MTEXT:"mtext",NAV:"nav",NOBR:"nobr",NOFRAMES:"noframes",NOEMBED:"noembed",NOSCRIPT:"noscript",OBJECT:"object",OL:"ol",OPTGROUP:"optgroup",OPTION:"option",P:"p",PARAM:"param",PLAINTEXT:"plaintext",PRE:"pre",RB:"rb",RP:"rp",RT:"rt",RTC:"rtc",RUBY:"ruby",S:"s",SCRIPT:"script",SECTION:"section",SELECT:"select",SOURCE:"source",SMALL:"small",SPAN:"span",STRIKE:"strike",STRONG:"strong",STYLE:"style",SUB:"sub",SUMMARY:"summary",SUP:"sup",TABLE:"table",TBODY:"tbody",TEMPLATE:"template",TEXTAREA:"textarea",TFOOT:"tfoot",TD:"td",TH:"th",THEAD:"thead",TITLE:"title",TR:"tr",TRACK:"track",TT:"tt",U:"u",UL:"ul",SVG:"svg",VAR:"var",WBR:"wbr",XMP:"xmp"};t.SPECIAL_ELEMENTS={[n.HTML]:{[s.ADDRESS]:!0,[s.APPLET]:!0,[s.AREA]:!0,[s.ARTICLE]:!0,[s.ASIDE]:!0,[s.BASE]:!0,[s.BASEFONT]:!0,[s.BGSOUND]:!0,[s.BLOCKQUOTE]:!0,[s.BODY]:!0,[s.BR]:!0,[s.BUTTON]:!0,[s.CAPTION]:!0,[s.CENTER]:!0,[s.COL]:!0,[s.COLGROUP]:!0,[s.DD]:!0,[s.DETAILS]:!0,[s.DIR]:!0,[s.DIV]:!0,[s.DL]:!0,[s.DT]:!0,[s.EMBED]:!0,[s.FIELDSET]:!0,[s.FIGCAPTION]:!0,[s.FIGURE]:!0,[s.FOOTER]:!0,[s.FORM]:!0,[s.FRAME]:!0,[s.FRAMESET]:!0,[s.H1]:!0,[s.H2]:!0,[s.H3]:!0,[s.H4]:!0,[s.H5]:!0,[s.H6]:!0,[s.HEAD]:!0,[s.HEADER]:!0,[s.HGROUP]:!0,[s.HR]:!0,[s.HTML]:!0,[s.IFRAME]:!0,[s.IMG]:!0,[s.INPUT]:!0,[s.LI]:!0,[s.LINK]:!0,[s.LISTING]:!0,[s.MAIN]:!0,[s.MARQUEE]:!0,[s.MENU]:!0,[s.META]:!0,[s.NAV]:!0,[s.NOEMBED]:!0,[s.NOFRAMES]:!0,[s.NOSCRIPT]:!0,[s.OBJECT]:!0,[s.OL]:!0,[s.P]:!0,[s.PARAM]:!0,[s.PLAINTEXT]:!0,[s.PRE]:!0,[s.SCRIPT]:!0,[s.SECTION]:!0,[s.SELECT]:!0,[s.SOURCE]:!0,[s.STYLE]:!0,[s.SUMMARY]:!0,[s.TABLE]:!0,[s.TBODY]:!0,[s.TD]:!0,[s.TEMPLATE]:!0,[s.TEXTAREA]:!0,[s.TFOOT]:!0,[s.TH]:!0,[s.THEAD]:!0,[s.TITLE]:!0,[s.TR]:!0,[s.TRACK]:!0,[s.UL]:!0,[s.WBR]:!0,[s.XMP]:!0},[n.MATHML]:{[s.MI]:!0,[s.MO]:!0,[s.MN]:!0,[s.MS]:!0,[s.MTEXT]:!0,[s.ANNOTATION_XML]:!0},[n.SVG]:{[s.TITLE]:!0,[s.FOREIGN_OBJECT]:!0,[s.DESC]:!0}};}));const Ot=Ct.TAG_NAMES,ft=Ct.NAMESPACES;function St(e){switch(e.length){case 1:return e===Ot.P;case 2:return e===Ot.RB||e===Ot.RP||e===Ot.RT||e===Ot.DD||e===Ot.DT||e===Ot.LI;case 3:return e===Ot.RTC;case 6:return e===Ot.OPTION;case 8:return e===Ot.OPTGROUP}return !1}function Rt(e){switch(e.length){case 1:return e===Ot.P;case 2:return e===Ot.RB||e===Ot.RP||e===Ot.RT||e===Ot.DD||e===Ot.DT||e===Ot.LI||e===Ot.TD||e===Ot.TH||e===Ot.TR;case 3:return e===Ot.RTC;case 5:return e===Ot.TBODY||e===Ot.TFOOT||e===Ot.THEAD;case 6:return e===Ot.OPTION;case 7:return e===Ot.CAPTION;case 8:return e===Ot.OPTGROUP||e===Ot.COLGROUP}return !1}function It(e,t){switch(e.length){case 2:if(e===Ot.TD||e===Ot.TH)return t===ft.HTML;if(e===Ot.MI||e===Ot.MO||e===Ot.MN||e===Ot.MS)return t===ft.MATHML;break;case 4:if(e===Ot.HTML)return t===ft.HTML;if(e===Ot.DESC)return t===ft.SVG;break;case 5:if(e===Ot.TABLE)return t===ft.HTML;if(e===Ot.MTEXT)return t===ft.MATHML;if(e===Ot.TITLE)return t===ft.SVG;break;case 6:return (e===Ot.APPLET||e===Ot.OBJECT)&&t===ft.HTML;case 7:return (e===Ot.CAPTION||e===Ot.MARQUEE)&&t===ft.HTML;case 8:return e===Ot.TEMPLATE&&t===ft.HTML;case 13:return e===Ot.FOREIGN_OBJECT&&t===ft.SVG;case 14:return e===Ot.ANNOTATION_XML&&t===ft.MATHML}return !1}class Lt{constructor(e){this.length=0,this.entries=[],this.treeAdapter=e,this.bookmark=null;}_getNoahArkConditionCandidates(e){const t=[];if(this.length>=3){const n=this.treeAdapter.getAttrList(e).length,s=this.treeAdapter.getTagName(e),r=this.treeAdapter.getNamespaceURI(e);for(let e=this.length-1;e>=0;e--){const i=this.entries[e];if(i.type===Lt.MARKER_ENTRY)break;const o=i.element,a=this.treeAdapter.getAttrList(o);this.treeAdapter.getTagName(o)===s&&this.treeAdapter.getNamespaceURI(o)===r&&a.length===n&&t.push({idx:e,attrs:a});}}return t.length<3?[]:t}_ensureNoahArkCondition(e){const t=this._getNoahArkConditionCandidates(e);let n=t.length;if(n){const s=this.treeAdapter.getAttrList(e),r=s.length,i=Object.create(null);for(let e=0;e<r;e++){const t=s[e];i[t.name]=t.value;}for(let e=0;e<r;e++)for(let s=0;s<n;s++){const r=t[s].attrs[e];if(i[r.name]!==r.value&&(t.splice(s,1),n--),t.length<3)return}for(let e=n-1;e>=2;e--)this.entries.splice(t[e].idx,1),this.length--;}}insertMarker(){this.entries.push({type:Lt.MARKER_ENTRY}),this.length++;}pushElement(e,t){this._ensureNoahArkCondition(e),this.entries.push({type:Lt.ELEMENT_ENTRY,element:e,token:t}),this.length++;}insertElementAfterBookmark(e,t){let n=this.length-1;for(;n>=0&&this.entries[n]!==this.bookmark;n--);this.entries.splice(n+1,0,{type:Lt.ELEMENT_ENTRY,element:e,token:t}),this.length++;}removeEntry(e){for(let t=this.length-1;t>=0;t--)if(this.entries[t]===e){this.entries.splice(t,1),this.length--;break}}clearToLastMarker(){for(;this.length;){const e=this.entries.pop();if(this.length--,e.type===Lt.MARKER_ENTRY)break}}getElementEntryInScopeWithTagName(e){for(let t=this.length-1;t>=0;t--){const n=this.entries[t];if(n.type===Lt.MARKER_ENTRY)return null;if(this.treeAdapter.getTagName(n.element)===e)return n}return null}getElementEntry(e){for(let t=this.length-1;t>=0;t--){const n=this.entries[t];if(n.type===Lt.ELEMENT_ENTRY&&n.element===e)return n}return null}}Lt.MARKER_ENTRY="MARKER_ENTRY",Lt.ELEMENT_ENTRY="ELEMENT_ENTRY";var kt=Lt;class Mt{constructor(e){const t={},n=this._getOverriddenMethods(this,t);for(const s of Object.keys(n))"function"==typeof n[s]&&(t[s]=e[s],e[s]=n[s]);}_getOverriddenMethods(){throw new Error("Not implemented")}}Mt.install=function(e,t,n){e.__mixins||(e.__mixins=[]);for(let n=0;n<e.__mixins.length;n++)if(e.__mixins[n].constructor===t)return e.__mixins[n];const s=new t(e,n);return e.__mixins.push(s),s};var gt=Mt,Pt=class extends gt{constructor(e){super(e),this.preprocessor=e,this.isEol=!1,this.lineStartPos=0,this.droppedBufferSize=0,this.offset=0,this.col=0,this.line=1;}_getOverriddenMethods(e,t){return {advance(){const n=this.pos+1,s=this.html[n];return e.isEol&&(e.isEol=!1,e.line++,e.lineStartPos=n),("\n"===s||"\r"===s&&"\n"!==this.html[n+1])&&(e.isEol=!0),e.col=n-e.lineStartPos+1,e.offset=e.droppedBufferSize+n,t.advance.call(this)},retreat(){t.retreat.call(this),e.isEol=!1,e.col=this.pos-e.lineStartPos+1;},dropParsedChunk(){const n=this.pos;t.dropParsedChunk.call(this);const s=n-this.pos;e.lineStartPos-=s,e.droppedBufferSize+=s,e.offset=e.droppedBufferSize+this.pos;}}}},Ht=class extends gt{constructor(e){super(e),this.tokenizer=e,this.posTracker=gt.install(e.preprocessor,Pt),this.currentAttrLocation=null,this.ctLoc=null;}_getCurrentLocation(){return {startLine:this.posTracker.line,startCol:this.posTracker.col,startOffset:this.posTracker.offset,endLine:-1,endCol:-1,endOffset:-1}}_attachCurrentAttrLocationInfo(){this.currentAttrLocation.endLine=this.posTracker.line,this.currentAttrLocation.endCol=this.posTracker.col,this.currentAttrLocation.endOffset=this.posTracker.offset;const e=this.tokenizer.currentToken,t=this.tokenizer.currentAttr;e.location.attrs||(e.location.attrs=Object.create(null)),e.location.attrs[t.name]=this.currentAttrLocation;}_getOverriddenMethods(e,t){const n={_createStartTagToken(){t._createStartTagToken.call(this),this.currentToken.location=e.ctLoc;},_createEndTagToken(){t._createEndTagToken.call(this),this.currentToken.location=e.ctLoc;},_createCommentToken(){t._createCommentToken.call(this),this.currentToken.location=e.ctLoc;},_createDoctypeToken(n){t._createDoctypeToken.call(this,n),this.currentToken.location=e.ctLoc;},_createCharacterToken(n,s){t._createCharacterToken.call(this,n,s),this.currentCharacterToken.location=e.ctLoc;},_createEOFToken(){t._createEOFToken.call(this),this.currentToken.location=e._getCurrentLocation();},_createAttr(n){t._createAttr.call(this,n),e.currentAttrLocation=e._getCurrentLocation();},_leaveAttrName(n){t._leaveAttrName.call(this,n),e._attachCurrentAttrLocationInfo();},_leaveAttrValue(n){t._leaveAttrValue.call(this,n),e._attachCurrentAttrLocationInfo();},_emitCurrentToken(){const n=this.currentToken.location;this.currentCharacterToken&&(this.currentCharacterToken.location.endLine=n.startLine,this.currentCharacterToken.location.endCol=n.startCol,this.currentCharacterToken.location.endOffset=n.startOffset),this.currentToken.type===Nt.EOF_TOKEN?(n.endLine=n.startLine,n.endCol=n.startCol,n.endOffset=n.startOffset):(n.endLine=e.posTracker.line,n.endCol=e.posTracker.col+1,n.endOffset=e.posTracker.offset+1),t._emitCurrentToken.call(this);},_emitCurrentCharacterToken(){const n=this.currentCharacterToken&&this.currentCharacterToken.location;n&&-1===n.endOffset&&(n.endLine=e.posTracker.line,n.endCol=e.posTracker.col,n.endOffset=e.posTracker.offset),t._emitCurrentCharacterToken.call(this);}};return Object.keys(Nt.MODE).forEach((s=>{const r=Nt.MODE[s];n[r]=function(n){e.ctLoc=e._getCurrentLocation(),t[r].call(this,n);};})),n}},Dt=class extends gt{constructor(e,t){super(e),this.onItemPop=t.onItemPop;}_getOverriddenMethods(e,t){return {pop(){e.onItemPop(this.current),t.pop.call(this);},popAllUpToHtmlElement(){for(let t=this.stackTop;t>0;t--)e.onItemPop(this.items[t]);t.popAllUpToHtmlElement.call(this);},remove(n){e.onItemPop(this.current),t.remove.call(this,n);}}}};const Ft=Ct.TAG_NAMES;var Ut=class extends gt{constructor(e){super(e),this.parser=e,this.treeAdapter=this.parser.treeAdapter,this.posTracker=null,this.lastStartTagToken=null,this.lastFosterParentingLocation=null,this.currentToken=null;}_setStartLocation(e){let t=null;this.lastStartTagToken&&(t=Object.assign({},this.lastStartTagToken.location),t.startTag=this.lastStartTagToken.location),this.treeAdapter.setNodeSourceCodeLocation(e,t);}_setEndLocation(e,t){if(this.treeAdapter.getNodeSourceCodeLocation(e)&&t.location){const n=t.location,s=this.treeAdapter.getTagName(e),r={};t.type===Nt.END_TAG_TOKEN&&s===t.tagName?(r.endTag=Object.assign({},n),r.endLine=n.endLine,r.endCol=n.endCol,r.endOffset=n.endOffset):(r.endLine=n.startLine,r.endCol=n.startCol,r.endOffset=n.startOffset),this.treeAdapter.updateNodeSourceCodeLocation(e,r);}}_getOverriddenMethods(e,t){return {_bootstrap(n,s){t._bootstrap.call(this,n,s),e.lastStartTagToken=null,e.lastFosterParentingLocation=null,e.currentToken=null;const r=gt.install(this.tokenizer,Ht);e.posTracker=r.posTracker,gt.install(this.openElements,Dt,{onItemPop:function(t){e._setEndLocation(t,e.currentToken);}});},_runParsingLoop(n){t._runParsingLoop.call(this,n);for(let t=this.openElements.stackTop;t>=0;t--)e._setEndLocation(this.openElements.items[t],e.currentToken);},_processTokenInForeignContent(n){e.currentToken=n,t._processTokenInForeignContent.call(this,n);},_processToken(n){if(e.currentToken=n,t._processToken.call(this,n),n.type===Nt.END_TAG_TOKEN&&(n.tagName===Ft.HTML||n.tagName===Ft.BODY&&this.openElements.hasInScope(Ft.BODY)))for(let t=this.openElements.stackTop;t>=0;t--){const s=this.openElements.items[t];if(this.treeAdapter.getTagName(s)===n.tagName){e._setEndLocation(s,n);break}}},_setDocumentType(e){t._setDocumentType.call(this,e);const n=this.treeAdapter.getChildNodes(this.document),s=n.length;for(let t=0;t<s;t++){const s=n[t];if(this.treeAdapter.isDocumentTypeNode(s)){this.treeAdapter.setNodeSourceCodeLocation(s,e.location);break}}},_attachElementToTree(n){e._setStartLocation(n),e.lastStartTagToken=null,t._attachElementToTree.call(this,n);},_appendElement(n,s){e.lastStartTagToken=n,t._appendElement.call(this,n,s);},_insertElement(n,s){e.lastStartTagToken=n,t._insertElement.call(this,n,s);},_insertTemplate(n){e.lastStartTagToken=n,t._insertTemplate.call(this,n);const s=this.treeAdapter.getTemplateContent(this.openElements.current);this.treeAdapter.setNodeSourceCodeLocation(s,null);},_insertFakeRootElement(){t._insertFakeRootElement.call(this),this.treeAdapter.setNodeSourceCodeLocation(this.openElements.current,null);},_appendCommentNode(e,n){t._appendCommentNode.call(this,e,n);const s=this.treeAdapter.getChildNodes(n),r=s[s.length-1];this.treeAdapter.setNodeSourceCodeLocation(r,e.location);},_findFosterParentingLocation(){return e.lastFosterParentingLocation=t._findFosterParentingLocation.call(this),e.lastFosterParentingLocation},_insertCharacters(n){t._insertCharacters.call(this,n);const s=this._shouldFosterParentOnInsertion(),r=s&&e.lastFosterParentingLocation.parent||this.openElements.currentTmplContent||this.openElements.current,i=this.treeAdapter.getChildNodes(r),o=s&&e.lastFosterParentingLocation.beforeElement?i.indexOf(e.lastFosterParentingLocation.beforeElement)-1:i.length-1,a=i[o];if(this.treeAdapter.getNodeSourceCodeLocation(a)){const{endLine:e,endCol:t,endOffset:s}=n.location;this.treeAdapter.updateNodeSourceCodeLocation(a,{endLine:e,endCol:t,endOffset:s});}else this.treeAdapter.setNodeSourceCodeLocation(a,n.location);}}}},Gt=class extends gt{constructor(e,t){super(e),this.posTracker=null,this.onParseError=t.onParseError;}_setErrorLocation(e){e.startLine=e.endLine=this.posTracker.line,e.startCol=e.endCol=this.posTracker.col,e.startOffset=e.endOffset=this.posTracker.offset;}_reportError(e){const t={code:e,startLine:-1,startCol:-1,startOffset:-1,endLine:-1,endCol:-1,endOffset:-1};this._setErrorLocation(t),this.onParseError(t);}_getOverriddenMethods(e){return {_err(t){e._reportError(t);}}}},Bt=class extends Gt{constructor(e,t){super(e,t),this.posTracker=gt.install(e,Pt),this.lastErrOffset=-1;}_reportError(e){this.lastErrOffset!==this.posTracker.offset&&(this.lastErrOffset=this.posTracker.offset,super._reportError(e));}},Kt=class extends Gt{constructor(e,t){super(e,t);const n=gt.install(e.preprocessor,Bt,t);this.posTracker=n.posTracker;}},bt=class extends Gt{constructor(e,t){super(e,t),this.opts=t,this.ctLoc=null,this.locBeforeToken=!1;}_setErrorLocation(e){this.ctLoc&&(e.startLine=this.ctLoc.startLine,e.startCol=this.ctLoc.startCol,e.startOffset=this.ctLoc.startOffset,e.endLine=this.locBeforeToken?this.ctLoc.startLine:this.ctLoc.endLine,e.endCol=this.locBeforeToken?this.ctLoc.startCol:this.ctLoc.endCol,e.endOffset=this.locBeforeToken?this.ctLoc.startOffset:this.ctLoc.endOffset);}_getOverriddenMethods(e,t){return {_bootstrap(n,s){t._bootstrap.call(this,n,s),gt.install(this.tokenizer,Kt,e.opts),gt.install(this.tokenizer,Ht);},_processInputToken(n){e.ctLoc=n.location,t._processInputToken.call(this,n);},_err(t,n){e.locBeforeToken=n&&n.beforeToken,e._reportError(t);}}}},xt=dt((function(e,t){const{DOCUMENT_MODE:n}=Ct;t.createDocument=function(){return {nodeName:"#document",mode:n.NO_QUIRKS,childNodes:[]}},t.createDocumentFragment=function(){return {nodeName:"#document-fragment",childNodes:[]}},t.createElement=function(e,t,n){return {nodeName:e,tagName:e,attrs:n,namespaceURI:t,childNodes:[],parentNode:null}},t.createCommentNode=function(e){return {nodeName:"#comment",data:e,parentNode:null}};const s=function(e){return {nodeName:"#text",value:e,parentNode:null}},r=t.appendChild=function(e,t){e.childNodes.push(t),t.parentNode=e;},i=t.insertBefore=function(e,t,n){const s=e.childNodes.indexOf(n);e.childNodes.splice(s,0,t),t.parentNode=e;};t.setTemplateContent=function(e,t){e.content=t;},t.getTemplateContent=function(e){return e.content},t.setDocumentType=function(e,t,n,s){let i=null;for(let t=0;t<e.childNodes.length;t++)if("#documentType"===e.childNodes[t].nodeName){i=e.childNodes[t];break}i?(i.name=t,i.publicId=n,i.systemId=s):r(e,{nodeName:"#documentType",name:t,publicId:n,systemId:s});},t.setDocumentMode=function(e,t){e.mode=t;},t.getDocumentMode=function(e){return e.mode},t.detachNode=function(e){if(e.parentNode){const t=e.parentNode.childNodes.indexOf(e);e.parentNode.childNodes.splice(t,1),e.parentNode=null;}},t.insertText=function(e,t){if(e.childNodes.length){const n=e.childNodes[e.childNodes.length-1];if("#text"===n.nodeName)return void(n.value+=t)}r(e,s(t));},t.insertTextBefore=function(e,t,n){const r=e.childNodes[e.childNodes.indexOf(n)-1];r&&"#text"===r.nodeName?r.value+=t:i(e,s(t),n);},t.adoptAttributes=function(e,t){const n=[];for(let t=0;t<e.attrs.length;t++)n.push(e.attrs[t].name);for(let s=0;s<t.length;s++)-1===n.indexOf(t[s].name)&&e.attrs.push(t[s]);},t.getFirstChild=function(e){return e.childNodes[0]},t.getChildNodes=function(e){return e.childNodes},t.getParentNode=function(e){return e.parentNode},t.getAttrList=function(e){return e.attrs},t.getTagName=function(e){return e.tagName},t.getNamespaceURI=function(e){return e.namespaceURI},t.getTextNodeContent=function(e){return e.value},t.getCommentNodeContent=function(e){return e.data},t.getDocumentTypeNodeName=function(e){return e.name},t.getDocumentTypeNodePublicId=function(e){return e.publicId},t.getDocumentTypeNodeSystemId=function(e){return e.systemId},t.isTextNode=function(e){return "#text"===e.nodeName},t.isCommentNode=function(e){return "#comment"===e.nodeName},t.isDocumentTypeNode=function(e){return "#documentType"===e.nodeName},t.isElementNode=function(e){return !!e.tagName},t.setNodeSourceCodeLocation=function(e,t){e.sourceCodeLocation=t;},t.getNodeSourceCodeLocation=function(e){return e.sourceCodeLocation},t.updateNodeSourceCodeLocation=function(e,t){e.sourceCodeLocation=Object.assign(e.sourceCodeLocation,t);};}));const{DOCUMENT_MODE:yt}=Ct,vt="html",Yt=["+//silmaril//dtd html pro v0r11 19970101//","-//as//dtd html 3.0 aswedit + extensions//","-//advasoft ltd//dtd html 3.0 aswedit + extensions//","-//ietf//dtd html 2.0 level 1//","-//ietf//dtd html 2.0 level 2//","-//ietf//dtd html 2.0 strict level 1//","-//ietf//dtd html 2.0 strict level 2//","-//ietf//dtd html 2.0 strict//","-//ietf//dtd html 2.0//","-//ietf//dtd html 2.1e//","-//ietf//dtd html 3.0//","-//ietf//dtd html 3.2 final//","-//ietf//dtd html 3.2//","-//ietf//dtd html 3//","-//ietf//dtd html level 0//","-//ietf//dtd html level 1//","-//ietf//dtd html level 2//","-//ietf//dtd html level 3//","-//ietf//dtd html strict level 0//","-//ietf//dtd html strict level 1//","-//ietf//dtd html strict level 2//","-//ietf//dtd html strict level 3//","-//ietf//dtd html strict//","-//ietf//dtd html//","-//metrius//dtd metrius presentational//","-//microsoft//dtd internet explorer 2.0 html strict//","-//microsoft//dtd internet explorer 2.0 html//","-//microsoft//dtd internet explorer 2.0 tables//","-//microsoft//dtd internet explorer 3.0 html strict//","-//microsoft//dtd internet explorer 3.0 html//","-//microsoft//dtd internet explorer 3.0 tables//","-//netscape comm. corp.//dtd html//","-//netscape comm. corp.//dtd strict html//","-//o'reilly and associates//dtd html 2.0//","-//o'reilly and associates//dtd html extended 1.0//","-//o'reilly and associates//dtd html extended relaxed 1.0//","-//sq//dtd html 2.0 hotmetal + extensions//","-//softquad software//dtd hotmetal pro 6.0::19990601::extensions to html 4.0//","-//softquad//dtd hotmetal pro 4.0::19971010::extensions to html 4.0//","-//spyglass//dtd html 2.0 extended//","-//sun microsystems corp.//dtd hotjava html//","-//sun microsystems corp.//dtd hotjava strict html//","-//w3c//dtd html 3 1995-03-24//","-//w3c//dtd html 3.2 draft//","-//w3c//dtd html 3.2 final//","-//w3c//dtd html 3.2//","-//w3c//dtd html 3.2s draft//","-//w3c//dtd html 4.0 frameset//","-//w3c//dtd html 4.0 transitional//","-//w3c//dtd html experimental 19960712//","-//w3c//dtd html experimental 970421//","-//w3c//dtd w3 html//","-//w3o//dtd w3 html 3.0//","-//webtechs//dtd mozilla html 2.0//","-//webtechs//dtd mozilla html//"],wt=Yt.concat(["-//w3c//dtd html 4.01 frameset//","-//w3c//dtd html 4.01 transitional//"]),Qt=["-//w3o//dtd w3 html strict 3.0//en//","-/w3c/dtd html 4.0 transitional/en","html"],Xt=["-//w3c//dtd xhtml 1.0 frameset//","-//w3c//dtd xhtml 1.0 transitional//"],Wt=Xt.concat(["-//w3c//dtd html 4.01 frameset//","-//w3c//dtd html 4.01 transitional//"]);function Vt(e,t){for(let n=0;n<t.length;n++)if(0===e.indexOf(t[n]))return !0;return !1}var jt=dt((function(e,t){const n=Ct.TAG_NAMES,s=Ct.NAMESPACES,r=Ct.ATTRS,i={attributename:"attributeName",attributetype:"attributeType",basefrequency:"baseFrequency",baseprofile:"baseProfile",calcmode:"calcMode",clippathunits:"clipPathUnits",diffuseconstant:"diffuseConstant",edgemode:"edgeMode",filterunits:"filterUnits",glyphref:"glyphRef",gradienttransform:"gradientTransform",gradientunits:"gradientUnits",kernelmatrix:"kernelMatrix",kernelunitlength:"kernelUnitLength",keypoints:"keyPoints",keysplines:"keySplines",keytimes:"keyTimes",lengthadjust:"lengthAdjust",limitingconeangle:"limitingConeAngle",markerheight:"markerHeight",markerunits:"markerUnits",markerwidth:"markerWidth",maskcontentunits:"maskContentUnits",maskunits:"maskUnits",numoctaves:"numOctaves",pathlength:"pathLength",patterncontentunits:"patternContentUnits",patterntransform:"patternTransform",patternunits:"patternUnits",pointsatx:"pointsAtX",pointsaty:"pointsAtY",pointsatz:"pointsAtZ",preservealpha:"preserveAlpha",preserveaspectratio:"preserveAspectRatio",primitiveunits:"primitiveUnits",refx:"refX",refy:"refY",repeatcount:"repeatCount",repeatdur:"repeatDur",requiredextensions:"requiredExtensions",requiredfeatures:"requiredFeatures",specularconstant:"specularConstant",specularexponent:"specularExponent",spreadmethod:"spreadMethod",startoffset:"startOffset",stddeviation:"stdDeviation",stitchtiles:"stitchTiles",surfacescale:"surfaceScale",systemlanguage:"systemLanguage",tablevalues:"tableValues",targetx:"targetX",targety:"targetY",textlength:"textLength",viewbox:"viewBox",viewtarget:"viewTarget",xchannelselector:"xChannelSelector",ychannelselector:"yChannelSelector",zoomandpan:"zoomAndPan"},o={"xlink:actuate":{prefix:"xlink",name:"actuate",namespace:s.XLINK},"xlink:arcrole":{prefix:"xlink",name:"arcrole",namespace:s.XLINK},"xlink:href":{prefix:"xlink",name:"href",namespace:s.XLINK},"xlink:role":{prefix:"xlink",name:"role",namespace:s.XLINK},"xlink:show":{prefix:"xlink",name:"show",namespace:s.XLINK},"xlink:title":{prefix:"xlink",name:"title",namespace:s.XLINK},"xlink:type":{prefix:"xlink",name:"type",namespace:s.XLINK},"xml:base":{prefix:"xml",name:"base",namespace:s.XML},"xml:lang":{prefix:"xml",name:"lang",namespace:s.XML},"xml:space":{prefix:"xml",name:"space",namespace:s.XML},xmlns:{prefix:"",name:"xmlns",namespace:s.XMLNS},"xmlns:xlink":{prefix:"xmlns",name:"xlink",namespace:s.XMLNS}},a=t.SVG_TAG_NAMES_ADJUSTMENT_MAP={altglyph:"altGlyph",altglyphdef:"altGlyphDef",altglyphitem:"altGlyphItem",animatecolor:"animateColor",animatemotion:"animateMotion",animatetransform:"animateTransform",clippath:"clipPath",feblend:"feBlend",fecolormatrix:"feColorMatrix",fecomponenttransfer:"feComponentTransfer",fecomposite:"feComposite",feconvolvematrix:"feConvolveMatrix",fediffuselighting:"feDiffuseLighting",fedisplacementmap:"feDisplacementMap",fedistantlight:"feDistantLight",feflood:"feFlood",fefunca:"feFuncA",fefuncb:"feFuncB",fefuncg:"feFuncG",fefuncr:"feFuncR",fegaussianblur:"feGaussianBlur",feimage:"feImage",femerge:"feMerge",femergenode:"feMergeNode",femorphology:"feMorphology",feoffset:"feOffset",fepointlight:"fePointLight",fespecularlighting:"feSpecularLighting",fespotlight:"feSpotLight",fetile:"feTile",feturbulence:"feTurbulence",foreignobject:"foreignObject",glyphref:"glyphRef",lineargradient:"linearGradient",radialgradient:"radialGradient",textpath:"textPath"},T={[n.B]:!0,[n.BIG]:!0,[n.BLOCKQUOTE]:!0,[n.BODY]:!0,[n.BR]:!0,[n.CENTER]:!0,[n.CODE]:!0,[n.DD]:!0,[n.DIV]:!0,[n.DL]:!0,[n.DT]:!0,[n.EM]:!0,[n.EMBED]:!0,[n.H1]:!0,[n.H2]:!0,[n.H3]:!0,[n.H4]:!0,[n.H5]:!0,[n.H6]:!0,[n.HEAD]:!0,[n.HR]:!0,[n.I]:!0,[n.IMG]:!0,[n.LI]:!0,[n.LISTING]:!0,[n.MENU]:!0,[n.META]:!0,[n.NOBR]:!0,[n.OL]:!0,[n.P]:!0,[n.PRE]:!0,[n.RUBY]:!0,[n.S]:!0,[n.SMALL]:!0,[n.SPAN]:!0,[n.STRONG]:!0,[n.STRIKE]:!0,[n.SUB]:!0,[n.SUP]:!0,[n.TABLE]:!0,[n.TT]:!0,[n.U]:!0,[n.UL]:!0,[n.VAR]:!0};t.causesExit=function(e){const t=e.tagName;return !(t!==n.FONT||null===Nt.getTokenAttr(e,r.COLOR)&&null===Nt.getTokenAttr(e,r.SIZE)&&null===Nt.getTokenAttr(e,r.FACE))||T[t]},t.adjustTokenMathMLAttrs=function(e){for(let t=0;t<e.attrs.length;t++)if("definitionurl"===e.attrs[t].name){e.attrs[t].name="definitionURL";break}},t.adjustTokenSVGAttrs=function(e){for(let t=0;t<e.attrs.length;t++){const n=i[e.attrs[t].name];n&&(e.attrs[t].name=n);}},t.adjustTokenXMLAttrs=function(e){for(let t=0;t<e.attrs.length;t++){const n=o[e.attrs[t].name];n&&(e.attrs[t].prefix=n.prefix,e.attrs[t].name=n.name,e.attrs[t].namespace=n.namespace);}},t.adjustTokenSVGTagName=function(e){const t=a[e.tagName];t&&(e.tagName=t);},t.isIntegrationPoint=function(e,t,i,o){return !(o&&o!==s.HTML||!function(e,t,i){if(t===s.MATHML&&e===n.ANNOTATION_XML)for(let e=0;e<i.length;e++)if(i[e].name===r.ENCODING){const t=i[e].value.toLowerCase();return "text/html"===t||"application/xhtml+xml"===t}return t===s.SVG&&(e===n.FOREIGN_OBJECT||e===n.DESC||e===n.TITLE)}(e,t,i))||!(o&&o!==s.MATHML||!function(e,t){return t===s.MATHML&&(e===n.MI||e===n.MO||e===n.MN||e===n.MS||e===n.MTEXT)}(e,t))};}));const zt=Ct.TAG_NAMES,qt=Ct.NAMESPACES,Jt=Ct.ATTRS,Zt={scriptingEnabled:!0,sourceCodeLocationInfo:!1,onParseError:null,treeAdapter:xt},$t="hidden",en="INITIAL_MODE",tn="BEFORE_HTML_MODE",nn="BEFORE_HEAD_MODE",sn="IN_HEAD_MODE",rn="IN_HEAD_NO_SCRIPT_MODE",on="AFTER_HEAD_MODE",an="IN_BODY_MODE",Tn="TEXT_MODE",En="IN_TABLE_MODE",hn="IN_TABLE_TEXT_MODE",cn="IN_CAPTION_MODE",_n="IN_COLUMN_GROUP_MODE",ln="IN_TABLE_BODY_MODE",mn="IN_ROW_MODE",pn="IN_CELL_MODE",An="IN_SELECT_MODE",un="IN_SELECT_IN_TABLE_MODE",Nn="IN_TEMPLATE_MODE",dn="AFTER_BODY_MODE",Cn="IN_FRAMESET_MODE",On="AFTER_FRAMESET_MODE",fn="AFTER_AFTER_BODY_MODE",Sn="AFTER_AFTER_FRAMESET_MODE",Rn={[zt.TR]:mn,[zt.TBODY]:ln,[zt.THEAD]:ln,[zt.TFOOT]:ln,[zt.CAPTION]:cn,[zt.COLGROUP]:_n,[zt.TABLE]:En,[zt.BODY]:an,[zt.FRAMESET]:Cn},In={[zt.CAPTION]:En,[zt.COLGROUP]:En,[zt.TBODY]:En,[zt.TFOOT]:En,[zt.THEAD]:En,[zt.COL]:_n,[zt.TR]:ln,[zt.TD]:mn,[zt.TH]:mn},Ln={[en]:{[Nt.CHARACTER_TOKEN]:vn,[Nt.NULL_CHARACTER_TOKEN]:vn,[Nt.WHITESPACE_CHARACTER_TOKEN]:Gn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:function(e,t){e._setDocumentType(t);const n=t.forceQuirks?Ct.DOCUMENT_MODE.QUIRKS:function(e){if(e.name!==vt)return yt.QUIRKS;const t=e.systemId;if(t&&"http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd"===t.toLowerCase())return yt.QUIRKS;let n=e.publicId;if(null!==n){if(n=n.toLowerCase(),Qt.indexOf(n)>-1)return yt.QUIRKS;let e=null===t?wt:Yt;if(Vt(n,e))return yt.QUIRKS;if(e=null===t?Xt:Wt,Vt(n,e))return yt.LIMITED_QUIRKS}return yt.NO_QUIRKS}(t);(function(e){return e.name===vt&&null===e.publicId&&(null===e.systemId||"about:legacy-compat"===e.systemId)})(t)||e._err("non-conforming-doctype"),e.treeAdapter.setDocumentMode(e.document,n),e.insertionMode=tn;},[Nt.START_TAG_TOKEN]:vn,[Nt.END_TAG_TOKEN]:vn,[Nt.EOF_TOKEN]:vn},[tn]:{[Nt.CHARACTER_TOKEN]:Yn,[Nt.NULL_CHARACTER_TOKEN]:Yn,[Nt.WHITESPACE_CHARACTER_TOKEN]:Gn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){t.tagName===zt.HTML?(e._insertElement(t,qt.HTML),e.insertionMode=nn):Yn(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n!==zt.HTML&&n!==zt.HEAD&&n!==zt.BODY&&n!==zt.BR||Yn(e,t);},[Nt.EOF_TOKEN]:Yn},[nn]:{[Nt.CHARACTER_TOKEN]:wn,[Nt.NULL_CHARACTER_TOKEN]:wn,[Nt.WHITESPACE_CHARACTER_TOKEN]:Gn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Bn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.HEAD?(e._insertElement(t,qt.HTML),e.headElement=e.openElements.current,e.insertionMode=sn):wn(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HEAD||n===zt.BODY||n===zt.HTML||n===zt.BR?wn(e,t):e._err(L);},[Nt.EOF_TOKEN]:wn},[sn]:{[Nt.CHARACTER_TOKEN]:Wn,[Nt.NULL_CHARACTER_TOKEN]:Wn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Bn,[Nt.START_TAG_TOKEN]:Qn,[Nt.END_TAG_TOKEN]:Xn,[Nt.EOF_TOKEN]:Wn},[rn]:{[Nt.CHARACTER_TOKEN]:Vn,[Nt.NULL_CHARACTER_TOKEN]:Vn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Bn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.BASEFONT||n===zt.BGSOUND||n===zt.HEAD||n===zt.LINK||n===zt.META||n===zt.NOFRAMES||n===zt.STYLE?Qn(e,t):n===zt.NOSCRIPT?e._err("nested-noscript-in-head"):Vn(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.NOSCRIPT?(e.openElements.pop(),e.insertionMode=sn):n===zt.BR?Vn(e,t):e._err(L);},[Nt.EOF_TOKEN]:Vn},[on]:{[Nt.CHARACTER_TOKEN]:jn,[Nt.NULL_CHARACTER_TOKEN]:jn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Bn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.BODY?(e._insertElement(t,qt.HTML),e.framesetOk=!1,e.insertionMode=an):n===zt.FRAMESET?(e._insertElement(t,qt.HTML),e.insertionMode=Cn):n===zt.BASE||n===zt.BASEFONT||n===zt.BGSOUND||n===zt.LINK||n===zt.META||n===zt.NOFRAMES||n===zt.SCRIPT||n===zt.STYLE||n===zt.TEMPLATE||n===zt.TITLE?(e._err("abandoned-head-element-child"),e.openElements.push(e.headElement),Qn(e,t),e.openElements.remove(e.headElement)):n===zt.HEAD?e._err(k):jn(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.BODY||n===zt.HTML||n===zt.BR?jn(e,t):n===zt.TEMPLATE?Xn(e,t):e._err(L);},[Nt.EOF_TOKEN]:jn},[an]:{[Nt.CHARACTER_TOKEN]:qn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:zn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:as,[Nt.END_TAG_TOKEN]:cs,[Nt.EOF_TOKEN]:_s},[Tn]:{[Nt.CHARACTER_TOKEN]:xn,[Nt.NULL_CHARACTER_TOKEN]:xn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Gn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:Gn,[Nt.END_TAG_TOKEN]:function(e,t){t.tagName===zt.SCRIPT&&(e.pendingScript=e.openElements.current),e.openElements.pop(),e.insertionMode=e.originalInsertionMode;},[Nt.EOF_TOKEN]:function(e,t){e._err("eof-in-element-that-can-contain-only-text"),e.openElements.pop(),e.insertionMode=e.originalInsertionMode,e._processToken(t);}},[En]:{[Nt.CHARACTER_TOKEN]:ls,[Nt.NULL_CHARACTER_TOKEN]:ls,[Nt.WHITESPACE_CHARACTER_TOKEN]:ls,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:ms,[Nt.END_TAG_TOKEN]:ps,[Nt.EOF_TOKEN]:_s},[hn]:{[Nt.CHARACTER_TOKEN]:function(e,t){e.pendingCharacterTokens.push(t),e.hasNonWhitespacePendingCharacterToken=!0;},[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:function(e,t){e.pendingCharacterTokens.push(t);},[Nt.COMMENT_TOKEN]:us,[Nt.DOCTYPE_TOKEN]:us,[Nt.START_TAG_TOKEN]:us,[Nt.END_TAG_TOKEN]:us,[Nt.EOF_TOKEN]:us},[cn]:{[Nt.CHARACTER_TOKEN]:qn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:zn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.CAPTION||n===zt.COL||n===zt.COLGROUP||n===zt.TBODY||n===zt.TD||n===zt.TFOOT||n===zt.TH||n===zt.THEAD||n===zt.TR?e.openElements.hasInTableScope(zt.CAPTION)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(zt.CAPTION),e.activeFormattingElements.clearToLastMarker(),e.insertionMode=En,e._processToken(t)):as(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.CAPTION||n===zt.TABLE?e.openElements.hasInTableScope(zt.CAPTION)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(zt.CAPTION),e.activeFormattingElements.clearToLastMarker(),e.insertionMode=En,n===zt.TABLE&&e._processToken(t)):n!==zt.BODY&&n!==zt.COL&&n!==zt.COLGROUP&&n!==zt.HTML&&n!==zt.TBODY&&n!==zt.TD&&n!==zt.TFOOT&&n!==zt.TH&&n!==zt.THEAD&&n!==zt.TR&&cs(e,t);},[Nt.EOF_TOKEN]:_s},[_n]:{[Nt.CHARACTER_TOKEN]:Ns,[Nt.NULL_CHARACTER_TOKEN]:Ns,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.COL?(e._appendElement(t,qt.HTML),t.ackSelfClosing=!0):n===zt.TEMPLATE?Qn(e,t):Ns(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.COLGROUP?e.openElements.currentTagName===zt.COLGROUP&&(e.openElements.pop(),e.insertionMode=En):n===zt.TEMPLATE?Xn(e,t):n!==zt.COL&&Ns(e,t);},[Nt.EOF_TOKEN]:_s},[ln]:{[Nt.CHARACTER_TOKEN]:ls,[Nt.NULL_CHARACTER_TOKEN]:ls,[Nt.WHITESPACE_CHARACTER_TOKEN]:ls,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.TR?(e.openElements.clearBackToTableBodyContext(),e._insertElement(t,qt.HTML),e.insertionMode=mn):n===zt.TH||n===zt.TD?(e.openElements.clearBackToTableBodyContext(),e._insertFakeElement(zt.TR),e.insertionMode=mn,e._processToken(t)):n===zt.CAPTION||n===zt.COL||n===zt.COLGROUP||n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD?e.openElements.hasTableBodyContextInTableScope()&&(e.openElements.clearBackToTableBodyContext(),e.openElements.pop(),e.insertionMode=En,e._processToken(t)):ms(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD?e.openElements.hasInTableScope(n)&&(e.openElements.clearBackToTableBodyContext(),e.openElements.pop(),e.insertionMode=En):n===zt.TABLE?e.openElements.hasTableBodyContextInTableScope()&&(e.openElements.clearBackToTableBodyContext(),e.openElements.pop(),e.insertionMode=En,e._processToken(t)):(n!==zt.BODY&&n!==zt.CAPTION&&n!==zt.COL&&n!==zt.COLGROUP||n!==zt.HTML&&n!==zt.TD&&n!==zt.TH&&n!==zt.TR)&&ps(e,t);},[Nt.EOF_TOKEN]:_s},[mn]:{[Nt.CHARACTER_TOKEN]:ls,[Nt.NULL_CHARACTER_TOKEN]:ls,[Nt.WHITESPACE_CHARACTER_TOKEN]:ls,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.TH||n===zt.TD?(e.openElements.clearBackToTableRowContext(),e._insertElement(t,qt.HTML),e.insertionMode=pn,e.activeFormattingElements.insertMarker()):n===zt.CAPTION||n===zt.COL||n===zt.COLGROUP||n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD||n===zt.TR?e.openElements.hasInTableScope(zt.TR)&&(e.openElements.clearBackToTableRowContext(),e.openElements.pop(),e.insertionMode=ln,e._processToken(t)):ms(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.TR?e.openElements.hasInTableScope(zt.TR)&&(e.openElements.clearBackToTableRowContext(),e.openElements.pop(),e.insertionMode=ln):n===zt.TABLE?e.openElements.hasInTableScope(zt.TR)&&(e.openElements.clearBackToTableRowContext(),e.openElements.pop(),e.insertionMode=ln,e._processToken(t)):n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD?(e.openElements.hasInTableScope(n)||e.openElements.hasInTableScope(zt.TR))&&(e.openElements.clearBackToTableRowContext(),e.openElements.pop(),e.insertionMode=ln,e._processToken(t)):(n!==zt.BODY&&n!==zt.CAPTION&&n!==zt.COL&&n!==zt.COLGROUP||n!==zt.HTML&&n!==zt.TD&&n!==zt.TH)&&ps(e,t);},[Nt.EOF_TOKEN]:_s},[pn]:{[Nt.CHARACTER_TOKEN]:qn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:zn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.CAPTION||n===zt.COL||n===zt.COLGROUP||n===zt.TBODY||n===zt.TD||n===zt.TFOOT||n===zt.TH||n===zt.THEAD||n===zt.TR?(e.openElements.hasInTableScope(zt.TD)||e.openElements.hasInTableScope(zt.TH))&&(e._closeTableCell(),e._processToken(t)):as(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.TD||n===zt.TH?e.openElements.hasInTableScope(n)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(n),e.activeFormattingElements.clearToLastMarker(),e.insertionMode=mn):n===zt.TABLE||n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD||n===zt.TR?e.openElements.hasInTableScope(n)&&(e._closeTableCell(),e._processToken(t)):n!==zt.BODY&&n!==zt.CAPTION&&n!==zt.COL&&n!==zt.COLGROUP&&n!==zt.HTML&&cs(e,t);},[Nt.EOF_TOKEN]:_s},[An]:{[Nt.CHARACTER_TOKEN]:xn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:ds,[Nt.END_TAG_TOKEN]:Cs,[Nt.EOF_TOKEN]:_s},[un]:{[Nt.CHARACTER_TOKEN]:xn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.CAPTION||n===zt.TABLE||n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD||n===zt.TR||n===zt.TD||n===zt.TH?(e.openElements.popUntilTagNamePopped(zt.SELECT),e._resetInsertionMode(),e._processToken(t)):ds(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.CAPTION||n===zt.TABLE||n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD||n===zt.TR||n===zt.TD||n===zt.TH?e.openElements.hasInTableScope(n)&&(e.openElements.popUntilTagNamePopped(zt.SELECT),e._resetInsertionMode(),e._processToken(t)):Cs(e,t);},[Nt.EOF_TOKEN]:_s},[Nn]:{[Nt.CHARACTER_TOKEN]:qn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:zn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;if(n===zt.BASE||n===zt.BASEFONT||n===zt.BGSOUND||n===zt.LINK||n===zt.META||n===zt.NOFRAMES||n===zt.SCRIPT||n===zt.STYLE||n===zt.TEMPLATE||n===zt.TITLE)Qn(e,t);else {const s=In[n]||an;e._popTmplInsertionMode(),e._pushTmplInsertionMode(s),e.insertionMode=s,e._processToken(t);}},[Nt.END_TAG_TOKEN]:function(e,t){t.tagName===zt.TEMPLATE&&Xn(e,t);},[Nt.EOF_TOKEN]:Os},[dn]:{[Nt.CHARACTER_TOKEN]:fs,[Nt.NULL_CHARACTER_TOKEN]:fs,[Nt.WHITESPACE_CHARACTER_TOKEN]:zn,[Nt.COMMENT_TOKEN]:function(e,t){e._appendCommentNode(t,e.openElements.items[0]);},[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){t.tagName===zt.HTML?as(e,t):fs(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){t.tagName===zt.HTML?e.fragmentContext||(e.insertionMode=fn):fs(e,t);},[Nt.EOF_TOKEN]:yn},[Cn]:{[Nt.CHARACTER_TOKEN]:Gn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.FRAMESET?e._insertElement(t,qt.HTML):n===zt.FRAME?(e._appendElement(t,qt.HTML),t.ackSelfClosing=!0):n===zt.NOFRAMES&&Qn(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){t.tagName!==zt.FRAMESET||e.openElements.isRootHtmlElementCurrent()||(e.openElements.pop(),e.fragmentContext||e.openElements.currentTagName===zt.FRAMESET||(e.insertionMode=On));},[Nt.EOF_TOKEN]:yn},[On]:{[Nt.CHARACTER_TOKEN]:Gn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.NOFRAMES&&Qn(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){t.tagName===zt.HTML&&(e.insertionMode=Sn);},[Nt.EOF_TOKEN]:yn},[fn]:{[Nt.CHARACTER_TOKEN]:Ss,[Nt.NULL_CHARACTER_TOKEN]:Ss,[Nt.WHITESPACE_CHARACTER_TOKEN]:zn,[Nt.COMMENT_TOKEN]:bn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){t.tagName===zt.HTML?as(e,t):Ss(e,t);},[Nt.END_TAG_TOKEN]:Ss,[Nt.EOF_TOKEN]:yn},[Sn]:{[Nt.CHARACTER_TOKEN]:Gn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:zn,[Nt.COMMENT_TOKEN]:bn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.NOFRAMES&&Qn(e,t);},[Nt.END_TAG_TOKEN]:Gn,[Nt.EOF_TOKEN]:yn}};var kn=class{constructor(e){this.options=function(e,t){return [e,t=t||Object.create(null)].reduce(((e,t)=>(Object.keys(t).forEach((n=>{e[n]=t[n];})),e)),Object.create(null))}(Zt,e),this.treeAdapter=this.options.treeAdapter,this.pendingScript=null,this.options.sourceCodeLocationInfo&&gt.install(this,Ut),this.options.onParseError&&gt.install(this,bt,{onParseError:this.options.onParseError});}parse(e){const t=this.treeAdapter.createDocument();return this._bootstrap(t,null),this.tokenizer.write(e,!0),this._runParsingLoop(null),t}parseFragment(e,t){t||(t=this.treeAdapter.createElement(zt.TEMPLATE,qt.HTML,[]));const n=this.treeAdapter.createElement("documentmock",qt.HTML,[]);this._bootstrap(n,t),this.treeAdapter.getTagName(t)===zt.TEMPLATE&&this._pushTmplInsertionMode(Nn),this._initTokenizerForFragmentParsing(),this._insertFakeRootElement(),this._resetInsertionMode(),this._findFormInFragmentContext(),this.tokenizer.write(e,!0),this._runParsingLoop(null);const s=this.treeAdapter.getFirstChild(n),r=this.treeAdapter.createDocumentFragment();return this._adoptNodes(s,r),r}_bootstrap(e,t){this.tokenizer=new Nt(this.options),this.stopped=!1,this.insertionMode=en,this.originalInsertionMode="",this.document=e,this.fragmentContext=t,this.headElement=null,this.formElement=null,this.openElements=new class{constructor(e,t){this.stackTop=-1,this.items=[],this.current=e,this.currentTagName=null,this.currentTmplContent=null,this.tmplCount=0,this.treeAdapter=t;}_indexOf(e){let t=-1;for(let n=this.stackTop;n>=0;n--)if(this.items[n]===e){t=n;break}return t}_isInTemplate(){return this.currentTagName===Ot.TEMPLATE&&this.treeAdapter.getNamespaceURI(this.current)===ft.HTML}_updateCurrentElement(){this.current=this.items[this.stackTop],this.currentTagName=this.current&&this.treeAdapter.getTagName(this.current),this.currentTmplContent=this._isInTemplate()?this.treeAdapter.getTemplateContent(this.current):null;}push(e){this.items[++this.stackTop]=e,this._updateCurrentElement(),this._isInTemplate()&&this.tmplCount++;}pop(){this.stackTop--,this.tmplCount>0&&this._isInTemplate()&&this.tmplCount--,this._updateCurrentElement();}replace(e,t){const n=this._indexOf(e);this.items[n]=t,n===this.stackTop&&this._updateCurrentElement();}insertAfter(e,t){const n=this._indexOf(e)+1;this.items.splice(n,0,t),n===++this.stackTop&&this._updateCurrentElement();}popUntilTagNamePopped(e){for(;this.stackTop>-1;){const t=this.currentTagName,n=this.treeAdapter.getNamespaceURI(this.current);if(this.pop(),t===e&&n===ft.HTML)break}}popUntilElementPopped(e){for(;this.stackTop>-1;){const t=this.current;if(this.pop(),t===e)break}}popUntilNumberedHeaderPopped(){for(;this.stackTop>-1;){const e=this.currentTagName,t=this.treeAdapter.getNamespaceURI(this.current);if(this.pop(),e===Ot.H1||e===Ot.H2||e===Ot.H3||e===Ot.H4||e===Ot.H5||e===Ot.H6&&t===ft.HTML)break}}popUntilTableCellPopped(){for(;this.stackTop>-1;){const e=this.currentTagName,t=this.treeAdapter.getNamespaceURI(this.current);if(this.pop(),e===Ot.TD||e===Ot.TH&&t===ft.HTML)break}}popAllUpToHtmlElement(){this.stackTop=0,this._updateCurrentElement();}clearBackToTableContext(){for(;this.currentTagName!==Ot.TABLE&&this.currentTagName!==Ot.TEMPLATE&&this.currentTagName!==Ot.HTML||this.treeAdapter.getNamespaceURI(this.current)!==ft.HTML;)this.pop();}clearBackToTableBodyContext(){for(;this.currentTagName!==Ot.TBODY&&this.currentTagName!==Ot.TFOOT&&this.currentTagName!==Ot.THEAD&&this.currentTagName!==Ot.TEMPLATE&&this.currentTagName!==Ot.HTML||this.treeAdapter.getNamespaceURI(this.current)!==ft.HTML;)this.pop();}clearBackToTableRowContext(){for(;this.currentTagName!==Ot.TR&&this.currentTagName!==Ot.TEMPLATE&&this.currentTagName!==Ot.HTML||this.treeAdapter.getNamespaceURI(this.current)!==ft.HTML;)this.pop();}remove(e){for(let t=this.stackTop;t>=0;t--)if(this.items[t]===e){this.items.splice(t,1),this.stackTop--,this._updateCurrentElement();break}}tryPeekProperlyNestedBodyElement(){const e=this.items[1];return e&&this.treeAdapter.getTagName(e)===Ot.BODY?e:null}contains(e){return this._indexOf(e)>-1}getCommonAncestor(e){let t=this._indexOf(e);return --t>=0?this.items[t]:null}isRootHtmlElementCurrent(){return 0===this.stackTop&&this.currentTagName===Ot.HTML}hasInScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]),s=this.treeAdapter.getNamespaceURI(this.items[t]);if(n===e&&s===ft.HTML)return !0;if(It(n,s))return !1}return !0}hasNumberedHeaderInScope(){for(let e=this.stackTop;e>=0;e--){const t=this.treeAdapter.getTagName(this.items[e]),n=this.treeAdapter.getNamespaceURI(this.items[e]);if((t===Ot.H1||t===Ot.H2||t===Ot.H3||t===Ot.H4||t===Ot.H5||t===Ot.H6)&&n===ft.HTML)return !0;if(It(t,n))return !1}return !0}hasInListItemScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]),s=this.treeAdapter.getNamespaceURI(this.items[t]);if(n===e&&s===ft.HTML)return !0;if((n===Ot.UL||n===Ot.OL)&&s===ft.HTML||It(n,s))return !1}return !0}hasInButtonScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]),s=this.treeAdapter.getNamespaceURI(this.items[t]);if(n===e&&s===ft.HTML)return !0;if(n===Ot.BUTTON&&s===ft.HTML||It(n,s))return !1}return !0}hasInTableScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]);if(this.treeAdapter.getNamespaceURI(this.items[t])===ft.HTML){if(n===e)return !0;if(n===Ot.TABLE||n===Ot.TEMPLATE||n===Ot.HTML)return !1}}return !0}hasTableBodyContextInTableScope(){for(let e=this.stackTop;e>=0;e--){const t=this.treeAdapter.getTagName(this.items[e]);if(this.treeAdapter.getNamespaceURI(this.items[e])===ft.HTML){if(t===Ot.TBODY||t===Ot.THEAD||t===Ot.TFOOT)return !0;if(t===Ot.TABLE||t===Ot.HTML)return !1}}return !0}hasInSelectScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]);if(this.treeAdapter.getNamespaceURI(this.items[t])===ft.HTML){if(n===e)return !0;if(n!==Ot.OPTION&&n!==Ot.OPTGROUP)return !1}}return !0}generateImpliedEndTags(){for(;St(this.currentTagName);)this.pop();}generateImpliedEndTagsThoroughly(){for(;Rt(this.currentTagName);)this.pop();}generateImpliedEndTagsWithExclusion(e){for(;St(this.currentTagName)&&this.currentTagName!==e;)this.pop();}}(this.document,this.treeAdapter),this.activeFormattingElements=new kt(this.treeAdapter),this.tmplInsertionModeStack=[],this.tmplInsertionModeStackTop=-1,this.currentTmplInsertionMode=null,this.pendingCharacterTokens=[],this.hasNonWhitespacePendingCharacterToken=!1,this.framesetOk=!0,this.skipNextNewLine=!1,this.fosterParentingEnabled=!1;}_err(){}_runParsingLoop(e){for(;!this.stopped;){this._setupTokenizerCDATAMode();const t=this.tokenizer.getNextToken();if(t.type===Nt.HIBERNATION_TOKEN)break;if(this.skipNextNewLine&&(this.skipNextNewLine=!1,t.type===Nt.WHITESPACE_CHARACTER_TOKEN&&"\n"===t.chars[0])){if(1===t.chars.length)continue;t.chars=t.chars.substr(1);}if(this._processInputToken(t),e&&this.pendingScript)break}}runParsingLoopForCurrentChunk(e,t){if(this._runParsingLoop(t),t&&this.pendingScript){const e=this.pendingScript;return this.pendingScript=null,void t(e)}e&&e();}_setupTokenizerCDATAMode(){const e=this._getAdjustedCurrentElement();this.tokenizer.allowCDATA=e&&e!==this.document&&this.treeAdapter.getNamespaceURI(e)!==qt.HTML&&!this._isIntegrationPoint(e);}_switchToTextParsing(e,t){this._insertElement(e,qt.HTML),this.tokenizer.state=t,this.originalInsertionMode=this.insertionMode,this.insertionMode=Tn;}switchToPlaintextParsing(){this.insertionMode=Tn,this.originalInsertionMode=an,this.tokenizer.state=Nt.MODE.PLAINTEXT;}_getAdjustedCurrentElement(){return 0===this.openElements.stackTop&&this.fragmentContext?this.fragmentContext:this.openElements.current}_findFormInFragmentContext(){let e=this.fragmentContext;do{if(this.treeAdapter.getTagName(e)===zt.FORM){this.formElement=e;break}e=this.treeAdapter.getParentNode(e);}while(e)}_initTokenizerForFragmentParsing(){if(this.treeAdapter.getNamespaceURI(this.fragmentContext)===qt.HTML){const e=this.treeAdapter.getTagName(this.fragmentContext);e===zt.TITLE||e===zt.TEXTAREA?this.tokenizer.state=Nt.MODE.RCDATA:e===zt.STYLE||e===zt.XMP||e===zt.IFRAME||e===zt.NOEMBED||e===zt.NOFRAMES||e===zt.NOSCRIPT?this.tokenizer.state=Nt.MODE.RAWTEXT:e===zt.SCRIPT?this.tokenizer.state=Nt.MODE.SCRIPT_DATA:e===zt.PLAINTEXT&&(this.tokenizer.state=Nt.MODE.PLAINTEXT);}}_setDocumentType(e){const t=e.name||"",n=e.publicId||"",s=e.systemId||"";this.treeAdapter.setDocumentType(this.document,t,n,s);}_attachElementToTree(e){if(this._shouldFosterParentOnInsertion())this._fosterParentElement(e);else {const t=this.openElements.currentTmplContent||this.openElements.current;this.treeAdapter.appendChild(t,e);}}_appendElement(e,t){const n=this.treeAdapter.createElement(e.tagName,t,e.attrs);this._attachElementToTree(n);}_insertElement(e,t){const n=this.treeAdapter.createElement(e.tagName,t,e.attrs);this._attachElementToTree(n),this.openElements.push(n);}_insertFakeElement(e){const t=this.treeAdapter.createElement(e,qt.HTML,[]);this._attachElementToTree(t),this.openElements.push(t);}_insertTemplate(e){const t=this.treeAdapter.createElement(e.tagName,qt.HTML,e.attrs),n=this.treeAdapter.createDocumentFragment();this.treeAdapter.setTemplateContent(t,n),this._attachElementToTree(t),this.openElements.push(t);}_insertFakeRootElement(){const e=this.treeAdapter.createElement(zt.HTML,qt.HTML,[]);this.treeAdapter.appendChild(this.openElements.current,e),this.openElements.push(e);}_appendCommentNode(e,t){const n=this.treeAdapter.createCommentNode(e.data);this.treeAdapter.appendChild(t,n);}_insertCharacters(e){if(this._shouldFosterParentOnInsertion())this._fosterParentText(e.chars);else {const t=this.openElements.currentTmplContent||this.openElements.current;this.treeAdapter.insertText(t,e.chars);}}_adoptNodes(e,t){for(let n=this.treeAdapter.getFirstChild(e);n;n=this.treeAdapter.getFirstChild(e))this.treeAdapter.detachNode(n),this.treeAdapter.appendChild(t,n);}_shouldProcessTokenInForeignContent(e){const t=this._getAdjustedCurrentElement();if(!t||t===this.document)return !1;const n=this.treeAdapter.getNamespaceURI(t);if(n===qt.HTML)return !1;if(this.treeAdapter.getTagName(t)===zt.ANNOTATION_XML&&n===qt.MATHML&&e.type===Nt.START_TAG_TOKEN&&e.tagName===zt.SVG)return !1;const s=e.type===Nt.CHARACTER_TOKEN||e.type===Nt.NULL_CHARACTER_TOKEN||e.type===Nt.WHITESPACE_CHARACTER_TOKEN;return !((e.type===Nt.START_TAG_TOKEN&&e.tagName!==zt.MGLYPH&&e.tagName!==zt.MALIGNMARK||s)&&this._isIntegrationPoint(t,qt.MATHML)||(e.type===Nt.START_TAG_TOKEN||s)&&this._isIntegrationPoint(t,qt.HTML)||e.type===Nt.EOF_TOKEN)}_processToken(e){Ln[this.insertionMode][e.type](this,e);}_processTokenInBodyMode(e){Ln.IN_BODY_MODE[e.type](this,e);}_processTokenInForeignContent(e){e.type===Nt.CHARACTER_TOKEN?function(e,t){e._insertCharacters(t),e.framesetOk=!1;}(this,e):e.type===Nt.NULL_CHARACTER_TOKEN?function(e,t){t.chars=n,e._insertCharacters(t);}(this,e):e.type===Nt.WHITESPACE_CHARACTER_TOKEN?xn(this,e):e.type===Nt.COMMENT_TOKEN?Kn(this,e):e.type===Nt.START_TAG_TOKEN?function(e,t){if(jt.causesExit(t)&&!e.fragmentContext){for(;e.treeAdapter.getNamespaceURI(e.openElements.current)!==qt.HTML&&!e._isIntegrationPoint(e.openElements.current);)e.openElements.pop();e._processToken(t);}else {const n=e._getAdjustedCurrentElement(),s=e.treeAdapter.getNamespaceURI(n);s===qt.MATHML?jt.adjustTokenMathMLAttrs(t):s===qt.SVG&&(jt.adjustTokenSVGTagName(t),jt.adjustTokenSVGAttrs(t)),jt.adjustTokenXMLAttrs(t),t.selfClosing?e._appendElement(t,s):e._insertElement(t,s),t.ackSelfClosing=!0;}}(this,e):e.type===Nt.END_TAG_TOKEN&&function(e,t){for(let n=e.openElements.stackTop;n>0;n--){const s=e.openElements.items[n];if(e.treeAdapter.getNamespaceURI(s)===qt.HTML){e._processToken(t);break}if(e.treeAdapter.getTagName(s).toLowerCase()===t.tagName){e.openElements.popUntilElementPopped(s);break}}}(this,e);}_processInputToken(e){this._shouldProcessTokenInForeignContent(e)?this._processTokenInForeignContent(e):this._processToken(e),e.type===Nt.START_TAG_TOKEN&&e.selfClosing&&!e.ackSelfClosing&&this._err("non-void-html-element-start-tag-with-trailing-solidus");}_isIntegrationPoint(e,t){const n=this.treeAdapter.getTagName(e),s=this.treeAdapter.getNamespaceURI(e),r=this.treeAdapter.getAttrList(e);return jt.isIntegrationPoint(n,s,r,t)}_reconstructActiveFormattingElements(){const e=this.activeFormattingElements.length;if(e){let t=e,n=null;do{if(t--,n=this.activeFormattingElements.entries[t],n.type===kt.MARKER_ENTRY||this.openElements.contains(n.element)){t++;break}}while(t>0);for(let s=t;s<e;s++)n=this.activeFormattingElements.entries[s],this._insertElement(n.token,this.treeAdapter.getNamespaceURI(n.element)),n.element=this.openElements.current;}}_closeTableCell(){this.openElements.generateImpliedEndTags(),this.openElements.popUntilTableCellPopped(),this.activeFormattingElements.clearToLastMarker(),this.insertionMode=mn;}_closePElement(){this.openElements.generateImpliedEndTagsWithExclusion(zt.P),this.openElements.popUntilTagNamePopped(zt.P);}_resetInsertionMode(){for(let e=this.openElements.stackTop,t=!1;e>=0;e--){let n=this.openElements.items[e];0===e&&(t=!0,this.fragmentContext&&(n=this.fragmentContext));const s=this.treeAdapter.getTagName(n),r=Rn[s];if(r){this.insertionMode=r;break}if(!(t||s!==zt.TD&&s!==zt.TH)){this.insertionMode=pn;break}if(!t&&s===zt.HEAD){this.insertionMode=sn;break}if(s===zt.SELECT){this._resetInsertionModeForSelect(e);break}if(s===zt.TEMPLATE){this.insertionMode=this.currentTmplInsertionMode;break}if(s===zt.HTML){this.insertionMode=this.headElement?on:nn;break}if(t){this.insertionMode=an;break}}}_resetInsertionModeForSelect(e){if(e>0)for(let t=e-1;t>0;t--){const e=this.openElements.items[t],n=this.treeAdapter.getTagName(e);if(n===zt.TEMPLATE)break;if(n===zt.TABLE)return void(this.insertionMode=un)}this.insertionMode=An;}_pushTmplInsertionMode(e){this.tmplInsertionModeStack.push(e),this.tmplInsertionModeStackTop++,this.currentTmplInsertionMode=e;}_popTmplInsertionMode(){this.tmplInsertionModeStack.pop(),this.tmplInsertionModeStackTop--,this.currentTmplInsertionMode=this.tmplInsertionModeStack[this.tmplInsertionModeStackTop];}_isElementCausesFosterParenting(e){const t=this.treeAdapter.getTagName(e);return t===zt.TABLE||t===zt.TBODY||t===zt.TFOOT||t===zt.THEAD||t===zt.TR}_shouldFosterParentOnInsertion(){return this.fosterParentingEnabled&&this._isElementCausesFosterParenting(this.openElements.current)}_findFosterParentingLocation(){const e={parent:null,beforeElement:null};for(let t=this.openElements.stackTop;t>=0;t--){const n=this.openElements.items[t],s=this.treeAdapter.getTagName(n),r=this.treeAdapter.getNamespaceURI(n);if(s===zt.TEMPLATE&&r===qt.HTML){e.parent=this.treeAdapter.getTemplateContent(n);break}if(s===zt.TABLE){e.parent=this.treeAdapter.getParentNode(n),e.parent?e.beforeElement=n:e.parent=this.openElements.items[t-1];break}}return e.parent||(e.parent=this.openElements.items[0]),e}_fosterParentElement(e){const t=this._findFosterParentingLocation();t.beforeElement?this.treeAdapter.insertBefore(t.parent,e,t.beforeElement):this.treeAdapter.appendChild(t.parent,e);}_fosterParentText(e){const t=this._findFosterParentingLocation();t.beforeElement?this.treeAdapter.insertTextBefore(t.parent,e,t.beforeElement):this.treeAdapter.insertText(t.parent,e);}_isSpecialElement(e){const t=this.treeAdapter.getTagName(e),n=this.treeAdapter.getNamespaceURI(e);return Ct.SPECIAL_ELEMENTS[n][t]}};function Mn(e,t){let n=e.activeFormattingElements.getElementEntryInScopeWithTagName(t.tagName);return n?e.openElements.contains(n.element)?e.openElements.hasInScope(t.tagName)||(n=null):(e.activeFormattingElements.removeEntry(n),n=null):hs(e,t),n}function gn(e,t){let n=null;for(let s=e.openElements.stackTop;s>=0;s--){const r=e.openElements.items[s];if(r===t.element)break;e._isSpecialElement(r)&&(n=r);}return n||(e.openElements.popUntilElementPopped(t.element),e.activeFormattingElements.removeEntry(t)),n}function Pn(e,t,n){let s=t,r=e.openElements.getCommonAncestor(t);for(let i=0,o=r;o!==n;i++,o=r){r=e.openElements.getCommonAncestor(o);const n=e.activeFormattingElements.getElementEntry(o),a=n&&i>=3;!n||a?(a&&e.activeFormattingElements.removeEntry(n),e.openElements.remove(o)):(o=Hn(e,n),s===t&&(e.activeFormattingElements.bookmark=n),e.treeAdapter.detachNode(s),e.treeAdapter.appendChild(o,s),s=o);}return s}function Hn(e,t){const n=e.treeAdapter.getNamespaceURI(t.element),s=e.treeAdapter.createElement(t.token.tagName,n,t.token.attrs);return e.openElements.replace(t.element,s),t.element=s,s}function Dn(e,t,n){if(e._isElementCausesFosterParenting(t))e._fosterParentElement(n);else {const s=e.treeAdapter.getTagName(t),r=e.treeAdapter.getNamespaceURI(t);s===zt.TEMPLATE&&r===qt.HTML&&(t=e.treeAdapter.getTemplateContent(t)),e.treeAdapter.appendChild(t,n);}}function Fn(e,t,n){const s=e.treeAdapter.getNamespaceURI(n.element),r=n.token,i=e.treeAdapter.createElement(r.tagName,s,r.attrs);e._adoptNodes(t,i),e.treeAdapter.appendChild(t,i),e.activeFormattingElements.insertElementAfterBookmark(i,n.token),e.activeFormattingElements.removeEntry(n),e.openElements.remove(n.element),e.openElements.insertAfter(t,i);}function Un(e,t){let n;for(let s=0;s<8&&(n=Mn(e,t),n);s++){const t=gn(e,n);if(!t)break;e.activeFormattingElements.bookmark=n;const s=Pn(e,t,n.element),r=e.openElements.getCommonAncestor(n.element);e.treeAdapter.detachNode(s),Dn(e,r,s),Fn(e,t,n);}}function Gn(){}function Bn(e){e._err("misplaced-doctype");}function Kn(e,t){e._appendCommentNode(t,e.openElements.currentTmplContent||e.openElements.current);}function bn(e,t){e._appendCommentNode(t,e.document);}function xn(e,t){e._insertCharacters(t);}function yn(e){e.stopped=!0;}function vn(e,t){e._err("missing-doctype",{beforeToken:!0}),e.treeAdapter.setDocumentMode(e.document,Ct.DOCUMENT_MODE.QUIRKS),e.insertionMode=tn,e._processToken(t);}function Yn(e,t){e._insertFakeRootElement(),e.insertionMode=nn,e._processToken(t);}function wn(e,t){e._insertFakeElement(zt.HEAD),e.headElement=e.openElements.current,e.insertionMode=sn,e._processToken(t);}function Qn(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.BASE||n===zt.BASEFONT||n===zt.BGSOUND||n===zt.LINK||n===zt.META?(e._appendElement(t,qt.HTML),t.ackSelfClosing=!0):n===zt.TITLE?e._switchToTextParsing(t,Nt.MODE.RCDATA):n===zt.NOSCRIPT?e.options.scriptingEnabled?e._switchToTextParsing(t,Nt.MODE.RAWTEXT):(e._insertElement(t,qt.HTML),e.insertionMode=rn):n===zt.NOFRAMES||n===zt.STYLE?e._switchToTextParsing(t,Nt.MODE.RAWTEXT):n===zt.SCRIPT?e._switchToTextParsing(t,Nt.MODE.SCRIPT_DATA):n===zt.TEMPLATE?(e._insertTemplate(t,qt.HTML),e.activeFormattingElements.insertMarker(),e.framesetOk=!1,e.insertionMode=Nn,e._pushTmplInsertionMode(Nn)):n===zt.HEAD?e._err(k):Wn(e,t);}function Xn(e,t){const n=t.tagName;n===zt.HEAD?(e.openElements.pop(),e.insertionMode=on):n===zt.BODY||n===zt.BR||n===zt.HTML?Wn(e,t):n===zt.TEMPLATE&&e.openElements.tmplCount>0?(e.openElements.generateImpliedEndTagsThoroughly(),e.openElements.currentTagName!==zt.TEMPLATE&&e._err("closing-of-element-with-open-child-elements"),e.openElements.popUntilTagNamePopped(zt.TEMPLATE),e.activeFormattingElements.clearToLastMarker(),e._popTmplInsertionMode(),e._resetInsertionMode()):e._err(L);}function Wn(e,t){e.openElements.pop(),e.insertionMode=on,e._processToken(t);}function Vn(e,t){const n=t.type===Nt.EOF_TOKEN?"open-elements-left-after-eof":"disallowed-content-in-noscript-in-head";e._err(n),e.openElements.pop(),e.insertionMode=sn,e._processToken(t);}function jn(e,t){e._insertFakeElement(zt.BODY),e.insertionMode=an,e._processToken(t);}function zn(e,t){e._reconstructActiveFormattingElements(),e._insertCharacters(t);}function qn(e,t){e._reconstructActiveFormattingElements(),e._insertCharacters(t),e.framesetOk=!1;}function Jn(e,t){e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._insertElement(t,qt.HTML);}function Zn(e,t){e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._insertElement(t,qt.HTML),e.skipNextNewLine=!0,e.framesetOk=!1;}function $n(e,t){e._reconstructActiveFormattingElements(),e._insertElement(t,qt.HTML),e.activeFormattingElements.pushElement(e.openElements.current,t);}function es(e,t){e._reconstructActiveFormattingElements(),e._insertElement(t,qt.HTML),e.activeFormattingElements.insertMarker(),e.framesetOk=!1;}function ts(e,t){e._reconstructActiveFormattingElements(),e._appendElement(t,qt.HTML),e.framesetOk=!1,t.ackSelfClosing=!0;}function ns(e,t){e._appendElement(t,qt.HTML),t.ackSelfClosing=!0;}function ss(e,t){e._switchToTextParsing(t,Nt.MODE.RAWTEXT);}function rs(e,t){e.openElements.currentTagName===zt.OPTION&&e.openElements.pop(),e._reconstructActiveFormattingElements(),e._insertElement(t,qt.HTML);}function is(e,t){e.openElements.hasInScope(zt.RUBY)&&e.openElements.generateImpliedEndTags(),e._insertElement(t,qt.HTML);}function os(e,t){e._reconstructActiveFormattingElements(),e._insertElement(t,qt.HTML);}function as(e,t){const n=t.tagName;switch(n.length){case 1:n===zt.I||n===zt.S||n===zt.B||n===zt.U?$n(e,t):n===zt.P?Jn(e,t):n===zt.A?function(e,t){const n=e.activeFormattingElements.getElementEntryInScopeWithTagName(zt.A);n&&(Un(e,t),e.openElements.remove(n.element),e.activeFormattingElements.removeEntry(n)),e._reconstructActiveFormattingElements(),e._insertElement(t,qt.HTML),e.activeFormattingElements.pushElement(e.openElements.current,t);}(e,t):os(e,t);break;case 2:n===zt.DL||n===zt.OL||n===zt.UL?Jn(e,t):n===zt.H1||n===zt.H2||n===zt.H3||n===zt.H4||n===zt.H5||n===zt.H6?function(e,t){e.openElements.hasInButtonScope(zt.P)&&e._closePElement();const n=e.openElements.currentTagName;n!==zt.H1&&n!==zt.H2&&n!==zt.H3&&n!==zt.H4&&n!==zt.H5&&n!==zt.H6||e.openElements.pop(),e._insertElement(t,qt.HTML);}(e,t):n===zt.LI||n===zt.DD||n===zt.DT?function(e,t){e.framesetOk=!1;const n=t.tagName;for(let t=e.openElements.stackTop;t>=0;t--){const s=e.openElements.items[t],r=e.treeAdapter.getTagName(s);let i=null;if(n===zt.LI&&r===zt.LI?i=zt.LI:n!==zt.DD&&n!==zt.DT||r!==zt.DD&&r!==zt.DT||(i=r),i){e.openElements.generateImpliedEndTagsWithExclusion(i),e.openElements.popUntilTagNamePopped(i);break}if(r!==zt.ADDRESS&&r!==zt.DIV&&r!==zt.P&&e._isSpecialElement(s))break}e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._insertElement(t,qt.HTML);}(e,t):n===zt.EM||n===zt.TT?$n(e,t):n===zt.BR?ts(e,t):n===zt.HR?function(e,t){e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._appendElement(t,qt.HTML),e.framesetOk=!1,t.ackSelfClosing=!0;}(e,t):n===zt.RB?is(e,t):n===zt.RT||n===zt.RP?function(e,t){e.openElements.hasInScope(zt.RUBY)&&e.openElements.generateImpliedEndTagsWithExclusion(zt.RTC),e._insertElement(t,qt.HTML);}(e,t):n!==zt.TH&&n!==zt.TD&&n!==zt.TR&&os(e,t);break;case 3:n===zt.DIV||n===zt.DIR||n===zt.NAV?Jn(e,t):n===zt.PRE?Zn(e,t):n===zt.BIG?$n(e,t):n===zt.IMG||n===zt.WBR?ts(e,t):n===zt.XMP?function(e,t){e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._reconstructActiveFormattingElements(),e.framesetOk=!1,e._switchToTextParsing(t,Nt.MODE.RAWTEXT);}(e,t):n===zt.SVG?function(e,t){e._reconstructActiveFormattingElements(),jt.adjustTokenSVGAttrs(t),jt.adjustTokenXMLAttrs(t),t.selfClosing?e._appendElement(t,qt.SVG):e._insertElement(t,qt.SVG),t.ackSelfClosing=!0;}(e,t):n===zt.RTC?is(e,t):n!==zt.COL&&os(e,t);break;case 4:n===zt.HTML?function(e,t){0===e.openElements.tmplCount&&e.treeAdapter.adoptAttributes(e.openElements.items[0],t.attrs);}(e,t):n===zt.BASE||n===zt.LINK||n===zt.META?Qn(e,t):n===zt.BODY?function(e,t){const n=e.openElements.tryPeekProperlyNestedBodyElement();n&&0===e.openElements.tmplCount&&(e.framesetOk=!1,e.treeAdapter.adoptAttributes(n,t.attrs));}(e,t):n===zt.MAIN||n===zt.MENU?Jn(e,t):n===zt.FORM?function(e,t){const n=e.openElements.tmplCount>0;e.formElement&&!n||(e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._insertElement(t,qt.HTML),n||(e.formElement=e.openElements.current));}(e,t):n===zt.CODE||n===zt.FONT?$n(e,t):n===zt.NOBR?function(e,t){e._reconstructActiveFormattingElements(),e.openElements.hasInScope(zt.NOBR)&&(Un(e,t),e._reconstructActiveFormattingElements()),e._insertElement(t,qt.HTML),e.activeFormattingElements.pushElement(e.openElements.current,t);}(e,t):n===zt.AREA?ts(e,t):n===zt.MATH?function(e,t){e._reconstructActiveFormattingElements(),jt.adjustTokenMathMLAttrs(t),jt.adjustTokenXMLAttrs(t),t.selfClosing?e._appendElement(t,qt.MATHML):e._insertElement(t,qt.MATHML),t.ackSelfClosing=!0;}(e,t):n===zt.MENU?function(e,t){e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._insertElement(t,qt.HTML);}(e,t):n!==zt.HEAD&&os(e,t);break;case 5:n===zt.STYLE||n===zt.TITLE?Qn(e,t):n===zt.ASIDE?Jn(e,t):n===zt.SMALL?$n(e,t):n===zt.TABLE?function(e,t){e.treeAdapter.getDocumentMode(e.document)!==Ct.DOCUMENT_MODE.QUIRKS&&e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._insertElement(t,qt.HTML),e.framesetOk=!1,e.insertionMode=En;}(e,t):n===zt.EMBED?ts(e,t):n===zt.INPUT?function(e,t){e._reconstructActiveFormattingElements(),e._appendElement(t,qt.HTML);const n=Nt.getTokenAttr(t,Jt.TYPE);n&&n.toLowerCase()===$t||(e.framesetOk=!1),t.ackSelfClosing=!0;}(e,t):n===zt.PARAM||n===zt.TRACK?ns(e,t):n===zt.IMAGE?function(e,t){t.tagName=zt.IMG,ts(e,t);}(e,t):n!==zt.FRAME&&n!==zt.TBODY&&n!==zt.TFOOT&&n!==zt.THEAD&&os(e,t);break;case 6:n===zt.SCRIPT?Qn(e,t):n===zt.CENTER||n===zt.FIGURE||n===zt.FOOTER||n===zt.HEADER||n===zt.HGROUP||n===zt.DIALOG?Jn(e,t):n===zt.BUTTON?function(e,t){e.openElements.hasInScope(zt.BUTTON)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(zt.BUTTON)),e._reconstructActiveFormattingElements(),e._insertElement(t,qt.HTML),e.framesetOk=!1;}(e,t):n===zt.STRIKE||n===zt.STRONG?$n(e,t):n===zt.APPLET||n===zt.OBJECT?es(e,t):n===zt.KEYGEN?ts(e,t):n===zt.SOURCE?ns(e,t):n===zt.IFRAME?function(e,t){e.framesetOk=!1,e._switchToTextParsing(t,Nt.MODE.RAWTEXT);}(e,t):n===zt.SELECT?function(e,t){e._reconstructActiveFormattingElements(),e._insertElement(t,qt.HTML),e.framesetOk=!1,e.insertionMode===En||e.insertionMode===cn||e.insertionMode===ln||e.insertionMode===mn||e.insertionMode===pn?e.insertionMode=un:e.insertionMode=An;}(e,t):n===zt.OPTION?rs(e,t):os(e,t);break;case 7:n===zt.BGSOUND?Qn(e,t):n===zt.DETAILS||n===zt.ADDRESS||n===zt.ARTICLE||n===zt.SECTION||n===zt.SUMMARY?Jn(e,t):n===zt.LISTING?Zn(e,t):n===zt.MARQUEE?es(e,t):n===zt.NOEMBED?ss(e,t):n!==zt.CAPTION&&os(e,t);break;case 8:n===zt.BASEFONT?Qn(e,t):n===zt.FRAMESET?function(e,t){const n=e.openElements.tryPeekProperlyNestedBodyElement();e.framesetOk&&n&&(e.treeAdapter.detachNode(n),e.openElements.popAllUpToHtmlElement(),e._insertElement(t,qt.HTML),e.insertionMode=Cn);}(e,t):n===zt.FIELDSET?Jn(e,t):n===zt.TEXTAREA?function(e,t){e._insertElement(t,qt.HTML),e.skipNextNewLine=!0,e.tokenizer.state=Nt.MODE.RCDATA,e.originalInsertionMode=e.insertionMode,e.framesetOk=!1,e.insertionMode=Tn;}(e,t):n===zt.TEMPLATE?Qn(e,t):n===zt.NOSCRIPT?e.options.scriptingEnabled?ss(e,t):os(e,t):n===zt.OPTGROUP?rs(e,t):n!==zt.COLGROUP&&os(e,t);break;case 9:n===zt.PLAINTEXT?function(e,t){e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._insertElement(t,qt.HTML),e.tokenizer.state=Nt.MODE.PLAINTEXT;}(e,t):os(e,t);break;case 10:n===zt.BLOCKQUOTE||n===zt.FIGCAPTION?Jn(e,t):os(e,t);break;default:os(e,t);}}function Ts(e,t){const n=t.tagName;e.openElements.hasInScope(n)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(n));}function Es(e,t){const n=t.tagName;e.openElements.hasInScope(n)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(n),e.activeFormattingElements.clearToLastMarker());}function hs(e,t){const n=t.tagName;for(let t=e.openElements.stackTop;t>0;t--){const s=e.openElements.items[t];if(e.treeAdapter.getTagName(s)===n){e.openElements.generateImpliedEndTagsWithExclusion(n),e.openElements.popUntilElementPopped(s);break}if(e._isSpecialElement(s))break}}function cs(e,t){const n=t.tagName;switch(n.length){case 1:n===zt.A||n===zt.B||n===zt.I||n===zt.S||n===zt.U?Un(e,t):n===zt.P?function(e){e.openElements.hasInButtonScope(zt.P)||e._insertFakeElement(zt.P),e._closePElement();}(e):hs(e,t);break;case 2:n===zt.DL||n===zt.UL||n===zt.OL?Ts(e,t):n===zt.LI?function(e){e.openElements.hasInListItemScope(zt.LI)&&(e.openElements.generateImpliedEndTagsWithExclusion(zt.LI),e.openElements.popUntilTagNamePopped(zt.LI));}(e):n===zt.DD||n===zt.DT?function(e,t){const n=t.tagName;e.openElements.hasInScope(n)&&(e.openElements.generateImpliedEndTagsWithExclusion(n),e.openElements.popUntilTagNamePopped(n));}(e,t):n===zt.H1||n===zt.H2||n===zt.H3||n===zt.H4||n===zt.H5||n===zt.H6?function(e){e.openElements.hasNumberedHeaderInScope()&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilNumberedHeaderPopped());}(e):n===zt.BR?function(e){e._reconstructActiveFormattingElements(),e._insertFakeElement(zt.BR),e.openElements.pop(),e.framesetOk=!1;}(e):n===zt.EM||n===zt.TT?Un(e,t):hs(e,t);break;case 3:n===zt.BIG?Un(e,t):n===zt.DIR||n===zt.DIV||n===zt.NAV||n===zt.PRE?Ts(e,t):hs(e,t);break;case 4:n===zt.BODY?function(e){e.openElements.hasInScope(zt.BODY)&&(e.insertionMode=dn);}(e):n===zt.HTML?function(e,t){e.openElements.hasInScope(zt.BODY)&&(e.insertionMode=dn,e._processToken(t));}(e,t):n===zt.FORM?function(e){const t=e.openElements.tmplCount>0,n=e.formElement;t||(e.formElement=null),(n||t)&&e.openElements.hasInScope(zt.FORM)&&(e.openElements.generateImpliedEndTags(),t?e.openElements.popUntilTagNamePopped(zt.FORM):e.openElements.remove(n));}(e):n===zt.CODE||n===zt.FONT||n===zt.NOBR?Un(e,t):n===zt.MAIN||n===zt.MENU?Ts(e,t):hs(e,t);break;case 5:n===zt.ASIDE?Ts(e,t):n===zt.SMALL?Un(e,t):hs(e,t);break;case 6:n===zt.CENTER||n===zt.FIGURE||n===zt.FOOTER||n===zt.HEADER||n===zt.HGROUP||n===zt.DIALOG?Ts(e,t):n===zt.APPLET||n===zt.OBJECT?Es(e,t):n===zt.STRIKE||n===zt.STRONG?Un(e,t):hs(e,t);break;case 7:n===zt.ADDRESS||n===zt.ARTICLE||n===zt.DETAILS||n===zt.SECTION||n===zt.SUMMARY||n===zt.LISTING?Ts(e,t):n===zt.MARQUEE?Es(e,t):hs(e,t);break;case 8:n===zt.FIELDSET?Ts(e,t):n===zt.TEMPLATE?Xn(e,t):hs(e,t);break;case 10:n===zt.BLOCKQUOTE||n===zt.FIGCAPTION?Ts(e,t):hs(e,t);break;default:hs(e,t);}}function _s(e,t){e.tmplInsertionModeStackTop>-1?Os(e,t):e.stopped=!0;}function ls(e,t){const n=e.openElements.currentTagName;n===zt.TABLE||n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD||n===zt.TR?(e.pendingCharacterTokens=[],e.hasNonWhitespacePendingCharacterToken=!1,e.originalInsertionMode=e.insertionMode,e.insertionMode=hn,e._processToken(t)):As(e,t);}function ms(e,t){const n=t.tagName;switch(n.length){case 2:n===zt.TD||n===zt.TH||n===zt.TR?function(e,t){e.openElements.clearBackToTableContext(),e._insertFakeElement(zt.TBODY),e.insertionMode=ln,e._processToken(t);}(e,t):As(e,t);break;case 3:n===zt.COL?function(e,t){e.openElements.clearBackToTableContext(),e._insertFakeElement(zt.COLGROUP),e.insertionMode=_n,e._processToken(t);}(e,t):As(e,t);break;case 4:n===zt.FORM?function(e,t){e.formElement||0!==e.openElements.tmplCount||(e._insertElement(t,qt.HTML),e.formElement=e.openElements.current,e.openElements.pop());}(e,t):As(e,t);break;case 5:n===zt.TABLE?function(e,t){e.openElements.hasInTableScope(zt.TABLE)&&(e.openElements.popUntilTagNamePopped(zt.TABLE),e._resetInsertionMode(),e._processToken(t));}(e,t):n===zt.STYLE?Qn(e,t):n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD?function(e,t){e.openElements.clearBackToTableContext(),e._insertElement(t,qt.HTML),e.insertionMode=ln;}(e,t):n===zt.INPUT?function(e,t){const n=Nt.getTokenAttr(t,Jt.TYPE);n&&n.toLowerCase()===$t?e._appendElement(t,qt.HTML):As(e,t),t.ackSelfClosing=!0;}(e,t):As(e,t);break;case 6:n===zt.SCRIPT?Qn(e,t):As(e,t);break;case 7:n===zt.CAPTION?function(e,t){e.openElements.clearBackToTableContext(),e.activeFormattingElements.insertMarker(),e._insertElement(t,qt.HTML),e.insertionMode=cn;}(e,t):As(e,t);break;case 8:n===zt.COLGROUP?function(e,t){e.openElements.clearBackToTableContext(),e._insertElement(t,qt.HTML),e.insertionMode=_n;}(e,t):n===zt.TEMPLATE?Qn(e,t):As(e,t);break;default:As(e,t);}}function ps(e,t){const n=t.tagName;n===zt.TABLE?e.openElements.hasInTableScope(zt.TABLE)&&(e.openElements.popUntilTagNamePopped(zt.TABLE),e._resetInsertionMode()):n===zt.TEMPLATE?Xn(e,t):n!==zt.BODY&&n!==zt.CAPTION&&n!==zt.COL&&n!==zt.COLGROUP&&n!==zt.HTML&&n!==zt.TBODY&&n!==zt.TD&&n!==zt.TFOOT&&n!==zt.TH&&n!==zt.THEAD&&n!==zt.TR&&As(e,t);}function As(e,t){const n=e.fosterParentingEnabled;e.fosterParentingEnabled=!0,e._processTokenInBodyMode(t),e.fosterParentingEnabled=n;}function us(e,t){let n=0;if(e.hasNonWhitespacePendingCharacterToken)for(;n<e.pendingCharacterTokens.length;n++)As(e,e.pendingCharacterTokens[n]);else for(;n<e.pendingCharacterTokens.length;n++)e._insertCharacters(e.pendingCharacterTokens[n]);e.insertionMode=e.originalInsertionMode,e._processToken(t);}function Ns(e,t){e.openElements.currentTagName===zt.COLGROUP&&(e.openElements.pop(),e.insertionMode=En,e._processToken(t));}function ds(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.OPTION?(e.openElements.currentTagName===zt.OPTION&&e.openElements.pop(),e._insertElement(t,qt.HTML)):n===zt.OPTGROUP?(e.openElements.currentTagName===zt.OPTION&&e.openElements.pop(),e.openElements.currentTagName===zt.OPTGROUP&&e.openElements.pop(),e._insertElement(t,qt.HTML)):n===zt.INPUT||n===zt.KEYGEN||n===zt.TEXTAREA||n===zt.SELECT?e.openElements.hasInSelectScope(zt.SELECT)&&(e.openElements.popUntilTagNamePopped(zt.SELECT),e._resetInsertionMode(),n!==zt.SELECT&&e._processToken(t)):n!==zt.SCRIPT&&n!==zt.TEMPLATE||Qn(e,t);}function Cs(e,t){const n=t.tagName;if(n===zt.OPTGROUP){const t=e.openElements.items[e.openElements.stackTop-1],n=t&&e.treeAdapter.getTagName(t);e.openElements.currentTagName===zt.OPTION&&n===zt.OPTGROUP&&e.openElements.pop(),e.openElements.currentTagName===zt.OPTGROUP&&e.openElements.pop();}else n===zt.OPTION?e.openElements.currentTagName===zt.OPTION&&e.openElements.pop():n===zt.SELECT&&e.openElements.hasInSelectScope(zt.SELECT)?(e.openElements.popUntilTagNamePopped(zt.SELECT),e._resetInsertionMode()):n===zt.TEMPLATE&&Xn(e,t);}function Os(e,t){e.openElements.tmplCount>0?(e.openElements.popUntilTagNamePopped(zt.TEMPLATE),e.activeFormattingElements.clearToLastMarker(),e._popTmplInsertionMode(),e._resetInsertionMode(),e._processToken(t)):e.stopped=!0;}function fs(e,t){e.insertionMode=an,e._processToken(t);}function Ss(e,t){e.insertionMode=an,e._processToken(t);}return Ct.TAG_NAMES,Ct.NAMESPACES,e.parse=function(e,t){return new kn(t).parse(e)},e.parseFragment=function(e,t,n){return "string"==typeof e&&(n=t,t=e,e=null),new kn(n).parseFragment(t,e)},Object.defineProperty(e,"__esModule",{value:!0}),e}({});const parse=e.parse;const parseFragment=e.parseFragment;

const docParser = new WeakMap();
function parseDocumentUtil(ownerDocument, html) {
  const doc = parse(html.trim(), getParser(ownerDocument));
  doc.documentElement = doc.firstElementChild;
  doc.head = doc.documentElement.firstElementChild;
  doc.body = doc.head.nextElementSibling;
  return doc;
}
function parseFragmentUtil(ownerDocument, html) {
  if (typeof html === 'string') {
    html = html.trim();
  }
  else {
    html = '';
  }
  const frag = parseFragment(html, getParser(ownerDocument));
  return frag;
}
function getParser(ownerDocument) {
  let parseOptions = docParser.get(ownerDocument);
  if (parseOptions != null) {
    return parseOptions;
  }
  const treeAdapter = {
    createDocument() {
      const doc = ownerDocument.createElement("#document" /* DOCUMENT_NODE */);
      doc['x-mode'] = 'no-quirks';
      return doc;
    },
    setNodeSourceCodeLocation(node, location) {
      node.sourceCodeLocation = location;
    },
    getNodeSourceCodeLocation(node) {
      return node.sourceCodeLocation;
    },
    createDocumentFragment() {
      return ownerDocument.createDocumentFragment();
    },
    createElement(tagName, namespaceURI, attrs) {
      const elm = ownerDocument.createElementNS(namespaceURI, tagName);
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if (attr.namespace == null || attr.namespace === 'http://www.w3.org/1999/xhtml') {
          elm.setAttribute(attr.name, attr.value);
        }
        else {
          elm.setAttributeNS(attr.namespace, attr.name, attr.value);
        }
      }
      return elm;
    },
    createCommentNode(data) {
      return ownerDocument.createComment(data);
    },
    appendChild(parentNode, newNode) {
      parentNode.appendChild(newNode);
    },
    insertBefore(parentNode, newNode, referenceNode) {
      parentNode.insertBefore(newNode, referenceNode);
    },
    setTemplateContent(templateElement, contentElement) {
      templateElement.content = contentElement;
    },
    getTemplateContent(templateElement) {
      return templateElement.content;
    },
    setDocumentType(doc, name, publicId, systemId) {
      let doctypeNode = doc.childNodes.find(n => n.nodeType === 10 /* DOCUMENT_TYPE_NODE */);
      if (doctypeNode == null) {
        doctypeNode = ownerDocument.createDocumentTypeNode();
        doc.insertBefore(doctypeNode, doc.firstChild);
      }
      doctypeNode.nodeValue = '!DOCTYPE';
      doctypeNode['x-name'] = name;
      doctypeNode['x-publicId'] = publicId;
      doctypeNode['x-systemId'] = systemId;
    },
    setDocumentMode(doc, mode) {
      doc['x-mode'] = mode;
    },
    getDocumentMode(doc) {
      return doc['x-mode'];
    },
    detachNode(node) {
      node.remove();
    },
    insertText(parentNode, text) {
      const lastChild = parentNode.lastChild;
      if (lastChild != null && lastChild.nodeType === 3 /* TEXT_NODE */) {
        lastChild.nodeValue += text;
      }
      else {
        parentNode.appendChild(ownerDocument.createTextNode(text));
      }
    },
    insertTextBefore(parentNode, text, referenceNode) {
      const prevNode = parentNode.childNodes[parentNode.childNodes.indexOf(referenceNode) - 1];
      if (prevNode != null && prevNode.nodeType === 3 /* TEXT_NODE */) {
        prevNode.nodeValue += text;
      }
      else {
        parentNode.insertBefore(ownerDocument.createTextNode(text), referenceNode);
      }
    },
    adoptAttributes(recipient, attrs) {
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if (recipient.hasAttributeNS(attr.namespace, attr.name) === false) {
          recipient.setAttributeNS(attr.namespace, attr.name, attr.value);
        }
      }
    },
    getFirstChild(node) {
      return node.childNodes[0];
    },
    getChildNodes(node) {
      return node.childNodes;
    },
    getParentNode(node) {
      return node.parentNode;
    },
    getAttrList(element) {
      const attrs = element.attributes.__items.map(attr => {
        return {
          name: attr.name,
          value: attr.value,
          namespace: attr.namespaceURI,
          prefix: null,
        };
      });
      return attrs;
    },
    getTagName(element) {
      if (element.namespaceURI === 'http://www.w3.org/1999/xhtml') {
        return element.nodeName.toLowerCase();
      }
      else {
        return element.nodeName;
      }
    },
    getNamespaceURI(element) {
      return element.namespaceURI;
    },
    getTextNodeContent(textNode) {
      return textNode.nodeValue;
    },
    getCommentNodeContent(commentNode) {
      return commentNode.nodeValue;
    },
    getDocumentTypeNodeName(doctypeNode) {
      return doctypeNode['x-name'];
    },
    getDocumentTypeNodePublicId(doctypeNode) {
      return doctypeNode['x-publicId'];
    },
    getDocumentTypeNodeSystemId(doctypeNode) {
      return doctypeNode['x-systemId'];
    },
    isTextNode(node) {
      return node.nodeType === 3 /* TEXT_NODE */;
    },
    isCommentNode(node) {
      return node.nodeType === 8 /* COMMENT_NODE */;
    },
    isDocumentTypeNode(node) {
      return node.nodeType === 10 /* DOCUMENT_TYPE_NODE */;
    },
    isElementNode(node) {
      return node.nodeType === 1 /* ELEMENT_NODE */;
    },
  };
  parseOptions = {
    treeAdapter: treeAdapter,
  };
  docParser.set(ownerDocument, parseOptions);
  return parseOptions;
}

class MockNode {
  constructor(ownerDocument, nodeType, nodeName, nodeValue) {
    this.ownerDocument = ownerDocument;
    this.nodeType = nodeType;
    this.nodeName = nodeName;
    this._nodeValue = nodeValue;
    this.parentNode = null;
    this.childNodes = [];
  }
  appendChild(newNode) {
    if (newNode.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */) {
      const nodes = newNode.childNodes.slice();
      for (const child of nodes) {
        this.appendChild(child);
      }
    }
    else {
      newNode.remove();
      newNode.parentNode = this;
      this.childNodes.push(newNode);
      connectNode(this.ownerDocument, newNode);
    }
    return newNode;
  }
  append(...items) {
    items.forEach(item => {
      const isNode = typeof item === 'object' && item !== null && 'nodeType' in item;
      this.appendChild(isNode ? item : this.ownerDocument.createTextNode(String(item)));
    });
  }
  prepend(...items) {
    const firstChild = this.firstChild;
    items.forEach(item => {
      const isNode = typeof item === 'object' && item !== null && 'nodeType' in item;
      this.insertBefore(isNode ? item : this.ownerDocument.createTextNode(String(item)), firstChild);
    });
  }
  cloneNode(deep) {
    throw new Error(`invalid node type to clone: ${this.nodeType}, deep: ${deep}`);
  }
  compareDocumentPosition(_other) {
    // unimplemented
    // https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
    return -1;
  }
  get firstChild() {
    return this.childNodes[0] || null;
  }
  insertBefore(newNode, referenceNode) {
    if (newNode.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */) {
      for (let i = 0, ii = newNode.childNodes.length; i < ii; i++) {
        insertBefore(this, newNode.childNodes[i], referenceNode);
      }
    }
    else {
      insertBefore(this, newNode, referenceNode);
    }
    return newNode;
  }
  get isConnected() {
    let node = this;
    while (node != null) {
      if (node.nodeType === 9 /* DOCUMENT_NODE */) {
        return true;
      }
      node = node.parentNode;
      if (node != null && node.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */) {
        node = node.host;
      }
    }
    return false;
  }
  isSameNode(node) {
    return this === node;
  }
  get lastChild() {
    return this.childNodes[this.childNodes.length - 1] || null;
  }
  get nextSibling() {
    if (this.parentNode != null) {
      const index = this.parentNode.childNodes.indexOf(this) + 1;
      return this.parentNode.childNodes[index] || null;
    }
    return null;
  }
  get nodeValue() {
    return this._nodeValue;
  }
  set nodeValue(value) {
    this._nodeValue = value;
  }
  get parentElement() {
    return this.parentNode || null;
  }
  set parentElement(value) {
    this.parentNode = value;
  }
  get previousSibling() {
    if (this.parentNode != null) {
      const index = this.parentNode.childNodes.indexOf(this) - 1;
      return this.parentNode.childNodes[index] || null;
    }
    return null;
  }
  contains(otherNode) {
    return this.childNodes.includes(otherNode);
  }
  removeChild(childNode) {
    const index = this.childNodes.indexOf(childNode);
    if (index > -1) {
      this.childNodes.splice(index, 1);
      if (this.nodeType === 1 /* ELEMENT_NODE */) {
        const wasConnected = this.isConnected;
        childNode.parentNode = null;
        if (wasConnected === true) {
          disconnectNode(childNode);
        }
      }
      else {
        childNode.parentNode = null;
      }
    }
    else {
      throw new Error(`node not found within childNodes during removeChild`);
    }
    return childNode;
  }
  remove() {
    if (this.parentNode != null) {
      this.parentNode.removeChild(this);
    }
  }
  replaceChild(newChild, oldChild) {
    if (oldChild.parentNode === this) {
      this.insertBefore(newChild, oldChild);
      oldChild.remove();
      return newChild;
    }
    return null;
  }
  get textContent() {
    return this._nodeValue;
  }
  set textContent(value) {
    this._nodeValue = String(value);
  }
}
MockNode.ELEMENT_NODE = 1;
MockNode.TEXT_NODE = 3;
MockNode.PROCESSING_INSTRUCTION_NODE = 7;
MockNode.COMMENT_NODE = 8;
MockNode.DOCUMENT_NODE = 9;
MockNode.DOCUMENT_TYPE_NODE = 10;
MockNode.DOCUMENT_FRAGMENT_NODE = 11;
class MockNodeList {
  constructor(ownerDocument, childNodes, length) {
    this.ownerDocument = ownerDocument;
    this.childNodes = childNodes;
    this.length = length;
  }
}
class MockElement extends MockNode {
  constructor(ownerDocument, nodeName) {
    super(ownerDocument, 1 /* ELEMENT_NODE */, typeof nodeName === 'string' ? nodeName : null, null);
    this.namespaceURI = null;
  }
  addEventListener(type, handler) {
    addEventListener(this, type, handler);
  }
  attachShadow(_opts) {
    const shadowRoot = this.ownerDocument.createDocumentFragment();
    this.shadowRoot = shadowRoot;
    return shadowRoot;
  }
  get shadowRoot() {
    return this.__shadowRoot || null;
  }
  set shadowRoot(shadowRoot) {
    if (shadowRoot != null) {
      shadowRoot.host = this;
      this.__shadowRoot = shadowRoot;
    }
    else {
      delete this.__shadowRoot;
    }
  }
  get attributes() {
    if (this.__attributeMap == null) {
      this.__attributeMap = createAttributeProxy(false);
    }
    return this.__attributeMap;
  }
  set attributes(attrs) {
    this.__attributeMap = attrs;
  }
  get children() {
    return this.childNodes.filter(n => n.nodeType === 1 /* ELEMENT_NODE */);
  }
  get childElementCount() {
    return this.childNodes.filter(n => n.nodeType === 1 /* ELEMENT_NODE */).length;
  }
  get className() {
    return this.getAttributeNS(null, 'class') || '';
  }
  set className(value) {
    this.setAttributeNS(null, 'class', value);
  }
  get classList() {
    return new MockClassList(this);
  }
  click() {
    dispatchEvent(this, new MockEvent('click', { bubbles: true, cancelable: true, composed: true }));
  }
  cloneNode(_deep) {
    // implemented on MockElement.prototype from within element.ts
    return null;
  }
  closest(selector) {
    let elm = this;
    while (elm != null) {
      if (elm.matches(selector)) {
        return elm;
      }
      elm = elm.parentNode;
    }
    return null;
  }
  get dataset() {
    return dataset(this);
  }
  get dir() {
    return this.getAttributeNS(null, 'dir') || '';
  }
  set dir(value) {
    this.setAttributeNS(null, 'dir', value);
  }
  dispatchEvent(ev) {
    return dispatchEvent(this, ev);
  }
  get firstElementChild() {
    return this.children[0] || null;
  }
  getAttribute(attrName) {
    if (attrName === 'style') {
      if (this.__style != null && this.__style.length > 0) {
        return this.style.cssText;
      }
      return null;
    }
    const attr = this.attributes.getNamedItem(attrName);
    if (attr != null) {
      return attr.value;
    }
    return null;
  }
  getAttributeNS(namespaceURI, attrName) {
    const attr = this.attributes.getNamedItemNS(namespaceURI, attrName);
    if (attr != null) {
      return attr.value;
    }
    return null;
  }
  getBoundingClientRect() {
    return { bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0, x: 0, y: 0 };
  }
  getRootNode(opts) {
    const isComposed = opts != null && opts.composed === true;
    let node = this;
    while (node.parentNode != null) {
      node = node.parentNode;
      if (isComposed === true && node.parentNode == null && node.host != null) {
        node = node.host;
      }
    }
    return node;
  }
  get draggable() {
    return this.getAttributeNS(null, 'draggable') === 'true';
  }
  set draggable(value) {
    this.setAttributeNS(null, 'draggable', value);
  }
  hasChildNodes() {
    return this.childNodes.length > 0;
  }
  get id() {
    return this.getAttributeNS(null, 'id') || '';
  }
  set id(value) {
    this.setAttributeNS(null, 'id', value);
  }
  get innerHTML() {
    if (this.childNodes.length === 0) {
      return '';
    }
    return serializeNodeToHtml(this, {
      newLines: false,
      indentSpaces: 0,
    });
  }
  set innerHTML(html) {
    if (NON_ESCAPABLE_CONTENT.has(this.nodeName) === true) {
      setTextContent(this, html);
    }
    else {
      for (let i = this.childNodes.length - 1; i >= 0; i--) {
        this.removeChild(this.childNodes[i]);
      }
      if (typeof html === 'string') {
        const frag = parseFragmentUtil(this.ownerDocument, html);
        while (frag.childNodes.length > 0) {
          this.appendChild(frag.childNodes[0]);
        }
      }
    }
  }
  get innerText() {
    const text = [];
    getTextContent(this.childNodes, text);
    return text.join('');
  }
  set innerText(value) {
    setTextContent(this, value);
  }
  insertAdjacentElement(position, elm) {
    if (position === 'beforebegin') {
      insertBefore(this.parentNode, elm, this);
    }
    else if (position === 'afterbegin') {
      this.prepend(elm);
    }
    else if (position === 'beforeend') {
      this.appendChild(elm);
    }
    else if (position === 'afterend') {
      insertBefore(this.parentNode, elm, this.nextSibling);
    }
    return elm;
  }
  insertAdjacentHTML(position, html) {
    const frag = parseFragmentUtil(this.ownerDocument, html);
    if (position === 'beforebegin') {
      while (frag.childNodes.length > 0) {
        insertBefore(this.parentNode, frag.childNodes[0], this);
      }
    }
    else if (position === 'afterbegin') {
      while (frag.childNodes.length > 0) {
        this.prepend(frag.childNodes[frag.childNodes.length - 1]);
      }
    }
    else if (position === 'beforeend') {
      while (frag.childNodes.length > 0) {
        this.appendChild(frag.childNodes[0]);
      }
    }
    else if (position === 'afterend') {
      while (frag.childNodes.length > 0) {
        insertBefore(this.parentNode, frag.childNodes[frag.childNodes.length - 1], this.nextSibling);
      }
    }
  }
  insertAdjacentText(position, text) {
    const elm = this.ownerDocument.createTextNode(text);
    if (position === 'beforebegin') {
      insertBefore(this.parentNode, elm, this);
    }
    else if (position === 'afterbegin') {
      this.prepend(elm);
    }
    else if (position === 'beforeend') {
      this.appendChild(elm);
    }
    else if (position === 'afterend') {
      insertBefore(this.parentNode, elm, this.nextSibling);
    }
  }
  hasAttribute(attrName) {
    if (attrName === 'style') {
      return this.__style != null && this.__style.length > 0;
    }
    return this.getAttribute(attrName) !== null;
  }
  hasAttributeNS(namespaceURI, name) {
    return this.getAttributeNS(namespaceURI, name) !== null;
  }
  get hidden() {
    return this.hasAttributeNS(null, 'hidden');
  }
  set hidden(isHidden) {
    if (isHidden === true) {
      this.setAttributeNS(null, 'hidden', '');
    }
    else {
      this.removeAttributeNS(null, 'hidden');
    }
  }
  get lang() {
    return this.getAttributeNS(null, 'lang') || '';
  }
  set lang(value) {
    this.setAttributeNS(null, 'lang', value);
  }
  get lastElementChild() {
    const children = this.children;
    return children[children.length - 1] || null;
  }
  matches(selector) {
    return matches(selector, this);
  }
  get nextElementSibling() {
    const parentElement = this.parentElement;
    if (parentElement != null &&
      (parentElement.nodeType === 1 /* ELEMENT_NODE */ || parentElement.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */ || parentElement.nodeType === 9 /* DOCUMENT_NODE */)) {
      const children = parentElement.children;
      const index = children.indexOf(this) + 1;
      return parentElement.children[index] || null;
    }
    return null;
  }
  get outerHTML() {
    return serializeNodeToHtml(this, {
      newLines: false,
      outerHtml: true,
      indentSpaces: 0,
    });
  }
  get previousElementSibling() {
    const parentElement = this.parentElement;
    if (parentElement != null &&
      (parentElement.nodeType === 1 /* ELEMENT_NODE */ || parentElement.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */ || parentElement.nodeType === 9 /* DOCUMENT_NODE */)) {
      const children = parentElement.children;
      const index = children.indexOf(this) - 1;
      return parentElement.children[index] || null;
    }
    return null;
  }
  getElementsByClassName(classNames) {
    const classes = classNames
      .trim()
      .split(' ')
      .filter(c => c.length > 0);
    const results = [];
    getElementsByClassName(this, classes, results);
    return results;
  }
  getElementsByTagName(tagName) {
    const results = [];
    getElementsByTagName(this, tagName.toLowerCase(), results);
    return results;
  }
  querySelector(selector) {
    return selectOne(selector, this);
  }
  querySelectorAll(selector) {
    return selectAll(selector, this);
  }
  removeAttribute(attrName) {
    if (attrName === 'style') {
      delete this.__style;
    }
    else {
      const attr = this.attributes.getNamedItem(attrName);
      if (attr != null) {
        this.attributes.removeNamedItemNS(attr);
        if (checkAttributeChanged(this) === true) {
          attributeChanged(this, attrName, attr.value, null);
        }
      }
    }
  }
  removeAttributeNS(namespaceURI, attrName) {
    const attr = this.attributes.getNamedItemNS(namespaceURI, attrName);
    if (attr != null) {
      this.attributes.removeNamedItemNS(attr);
      if (checkAttributeChanged(this) === true) {
        attributeChanged(this, attrName, attr.value, null);
      }
    }
  }
  removeEventListener(type, handler) {
    removeEventListener(this, type, handler);
  }
  setAttribute(attrName, value) {
    if (attrName === 'style') {
      this.style = value;
    }
    else {
      const attributes = this.attributes;
      let attr = attributes.getNamedItem(attrName);
      const checkAttrChanged = checkAttributeChanged(this);
      if (attr != null) {
        if (checkAttrChanged === true) {
          const oldValue = attr.value;
          attr.value = value;
          if (oldValue !== attr.value) {
            attributeChanged(this, attr.name, oldValue, attr.value);
          }
        }
        else {
          attr.value = value;
        }
      }
      else {
        if (attributes.caseInsensitive) {
          attrName = attrName.toLowerCase();
        }
        attr = new MockAttr(attrName, value);
        attributes.__items.push(attr);
        if (checkAttrChanged === true) {
          attributeChanged(this, attrName, null, attr.value);
        }
      }
    }
  }
  setAttributeNS(namespaceURI, attrName, value) {
    const attributes = this.attributes;
    let attr = attributes.getNamedItemNS(namespaceURI, attrName);
    const checkAttrChanged = checkAttributeChanged(this);
    if (attr != null) {
      if (checkAttrChanged === true) {
        const oldValue = attr.value;
        attr.value = value;
        if (oldValue !== attr.value) {
          attributeChanged(this, attr.name, oldValue, attr.value);
        }
      }
      else {
        attr.value = value;
      }
    }
    else {
      attr = new MockAttr(attrName, value, namespaceURI);
      attributes.__items.push(attr);
      if (checkAttrChanged === true) {
        attributeChanged(this, attrName, null, attr.value);
      }
    }
  }
  get style() {
    if (this.__style == null) {
      this.__style = createCSSStyleDeclaration();
    }
    return this.__style;
  }
  set style(val) {
    if (typeof val === 'string') {
      if (this.__style == null) {
        this.__style = createCSSStyleDeclaration();
      }
      this.__style.cssText = val;
    }
    else {
      this.__style = val;
    }
  }
  get tabIndex() {
    return parseInt(this.getAttributeNS(null, 'tabindex') || '-1', 10);
  }
  set tabIndex(value) {
    this.setAttributeNS(null, 'tabindex', value);
  }
  get tagName() {
    return this.nodeName;
  }
  set tagName(value) {
    this.nodeName = value;
  }
  get textContent() {
    const text = [];
    getTextContent(this.childNodes, text);
    return text.join('');
  }
  set textContent(value) {
    setTextContent(this, value);
  }
  get title() {
    return this.getAttributeNS(null, 'title') || '';
  }
  set title(value) {
    this.setAttributeNS(null, 'title', value);
  }
  onanimationstart() {
    /**/
  }
  onanimationend() {
    /**/
  }
  onanimationiteration() {
    /**/
  }
  onabort() {
    /**/
  }
  onauxclick() {
    /**/
  }
  onbeforecopy() {
    /**/
  }
  onbeforecut() {
    /**/
  }
  onbeforepaste() {
    /**/
  }
  onblur() {
    /**/
  }
  oncancel() {
    /**/
  }
  oncanplay() {
    /**/
  }
  oncanplaythrough() {
    /**/
  }
  onchange() {
    /**/
  }
  onclick() {
    /**/
  }
  onclose() {
    /**/
  }
  oncontextmenu() {
    /**/
  }
  oncopy() {
    /**/
  }
  oncuechange() {
    /**/
  }
  oncut() {
    /**/
  }
  ondblclick() {
    /**/
  }
  ondrag() {
    /**/
  }
  ondragend() {
    /**/
  }
  ondragenter() {
    /**/
  }
  ondragleave() {
    /**/
  }
  ondragover() {
    /**/
  }
  ondragstart() {
    /**/
  }
  ondrop() {
    /**/
  }
  ondurationchange() {
    /**/
  }
  onemptied() {
    /**/
  }
  onended() {
    /**/
  }
  onerror() {
    /**/
  }
  onfocus() {
    /**/
  }
  onfocusin() {
    /**/
  }
  onfocusout() {
    /**/
  }
  onformdata() {
    /**/
  }
  onfullscreenchange() {
    /**/
  }
  onfullscreenerror() {
    /**/
  }
  ongotpointercapture() {
    /**/
  }
  oninput() {
    /**/
  }
  oninvalid() {
    /**/
  }
  onkeydown() {
    /**/
  }
  onkeypress() {
    /**/
  }
  onkeyup() {
    /**/
  }
  onload() {
    /**/
  }
  onloadeddata() {
    /**/
  }
  onloadedmetadata() {
    /**/
  }
  onloadstart() {
    /**/
  }
  onlostpointercapture() {
    /**/
  }
  onmousedown() {
    /**/
  }
  onmouseenter() {
    /**/
  }
  onmouseleave() {
    /**/
  }
  onmousemove() {
    /**/
  }
  onmouseout() {
    /**/
  }
  onmouseover() {
    /**/
  }
  onmouseup() {
    /**/
  }
  onmousewheel() {
    /**/
  }
  onpaste() {
    /**/
  }
  onpause() {
    /**/
  }
  onplay() {
    /**/
  }
  onplaying() {
    /**/
  }
  onpointercancel() {
    /**/
  }
  onpointerdown() {
    /**/
  }
  onpointerenter() {
    /**/
  }
  onpointerleave() {
    /**/
  }
  onpointermove() {
    /**/
  }
  onpointerout() {
    /**/
  }
  onpointerover() {
    /**/
  }
  onpointerup() {
    /**/
  }
  onprogress() {
    /**/
  }
  onratechange() {
    /**/
  }
  onreset() {
    /**/
  }
  onresize() {
    /**/
  }
  onscroll() {
    /**/
  }
  onsearch() {
    /**/
  }
  onseeked() {
    /**/
  }
  onseeking() {
    /**/
  }
  onselect() {
    /**/
  }
  onselectstart() {
    /**/
  }
  onstalled() {
    /**/
  }
  onsubmit() {
    /**/
  }
  onsuspend() {
    /**/
  }
  ontimeupdate() {
    /**/
  }
  ontoggle() {
    /**/
  }
  onvolumechange() {
    /**/
  }
  onwaiting() {
    /**/
  }
  onwebkitfullscreenchange() {
    /**/
  }
  onwebkitfullscreenerror() {
    /**/
  }
  onwheel() {
    /**/
  }
  toString(opts) {
    return serializeNodeToHtml(this, opts);
  }
}
function getElementsByClassName(elm, classNames, foundElms) {
  const children = elm.children;
  for (let i = 0, ii = children.length; i < ii; i++) {
    const childElm = children[i];
    for (let j = 0, jj = classNames.length; j < jj; j++) {
      if (childElm.classList.contains(classNames[j])) {
        foundElms.push(childElm);
      }
    }
    getElementsByClassName(childElm, classNames, foundElms);
  }
}
function getElementsByTagName(elm, tagName, foundElms) {
  const children = elm.children;
  for (let i = 0, ii = children.length; i < ii; i++) {
    const childElm = children[i];
    if (tagName === '*' || childElm.nodeName.toLowerCase() === tagName) {
      foundElms.push(childElm);
    }
    getElementsByTagName(childElm, tagName, foundElms);
  }
}
function resetElement(elm) {
  resetEventListeners(elm);
  delete elm.__attributeMap;
  delete elm.__shadowRoot;
  delete elm.__style;
}
function insertBefore(parentNode, newNode, referenceNode) {
  if (newNode !== referenceNode) {
    newNode.remove();
    newNode.parentNode = parentNode;
    newNode.ownerDocument = parentNode.ownerDocument;
    if (referenceNode != null) {
      const index = parentNode.childNodes.indexOf(referenceNode);
      if (index > -1) {
        parentNode.childNodes.splice(index, 0, newNode);
      }
      else {
        throw new Error(`referenceNode not found in parentNode.childNodes`);
      }
    }
    else {
      parentNode.childNodes.push(newNode);
    }
    connectNode(parentNode.ownerDocument, newNode);
  }
  return newNode;
}
class MockHTMLElement extends MockElement {
  constructor(ownerDocument, nodeName) {
    super(ownerDocument, typeof nodeName === 'string' ? nodeName.toUpperCase() : null);
    this.namespaceURI = 'http://www.w3.org/1999/xhtml';
  }
  get tagName() {
    return this.nodeName;
  }
  set tagName(value) {
    this.nodeName = value;
  }
  get attributes() {
    if (this.__attributeMap == null) {
      this.__attributeMap = createAttributeProxy(true);
    }
    return this.__attributeMap;
  }
  set attributes(attrs) {
    this.__attributeMap = attrs;
  }
}
class MockTextNode extends MockNode {
  constructor(ownerDocument, text) {
    super(ownerDocument, 3 /* TEXT_NODE */, "#text" /* TEXT_NODE */, text);
  }
  cloneNode(_deep) {
    return new MockTextNode(null, this.nodeValue);
  }
  get textContent() {
    return this.nodeValue;
  }
  set textContent(text) {
    this.nodeValue = text;
  }
  get data() {
    return this.nodeValue;
  }
  set data(text) {
    this.nodeValue = text;
  }
  get wholeText() {
    if (this.parentNode != null) {
      const text = [];
      for (let i = 0, ii = this.parentNode.childNodes.length; i < ii; i++) {
        const childNode = this.parentNode.childNodes[i];
        if (childNode.nodeType === 3 /* TEXT_NODE */) {
          text.push(childNode.nodeValue);
        }
      }
      return text.join('');
    }
    return this.nodeValue;
  }
}
function getTextContent(childNodes, text) {
  for (let i = 0, ii = childNodes.length; i < ii; i++) {
    const childNode = childNodes[i];
    if (childNode.nodeType === 3 /* TEXT_NODE */) {
      text.push(childNode.nodeValue);
    }
    else if (childNode.nodeType === 1 /* ELEMENT_NODE */) {
      getTextContent(childNode.childNodes, text);
    }
  }
}
function setTextContent(elm, text) {
  for (let i = elm.childNodes.length - 1; i >= 0; i--) {
    elm.removeChild(elm.childNodes[i]);
  }
  const textNode = new MockTextNode(elm.ownerDocument, text);
  elm.appendChild(textNode);
}

class MockComment extends MockNode {
  constructor(ownerDocument, data) {
    super(ownerDocument, 8 /* COMMENT_NODE */, "#comment" /* COMMENT_NODE */, data);
  }
  cloneNode(_deep) {
    return new MockComment(null, this.nodeValue);
  }
  get textContent() {
    return this.nodeValue;
  }
  set textContent(text) {
    this.nodeValue = text;
  }
}

class MockDocumentFragment extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, null);
    this.nodeName = "#document-fragment" /* DOCUMENT_FRAGMENT_NODE */;
    this.nodeType = 11 /* DOCUMENT_FRAGMENT_NODE */;
  }
  getElementById(id) {
    return getElementById(this, id);
  }
  cloneNode(deep) {
    const cloned = new MockDocumentFragment(null);
    if (deep) {
      for (let i = 0, ii = this.childNodes.length; i < ii; i++) {
        const childNode = this.childNodes[i];
        if (childNode.nodeType === 1 /* ELEMENT_NODE */ || childNode.nodeType === 3 /* TEXT_NODE */ || childNode.nodeType === 8 /* COMMENT_NODE */) {
          const clonedChildNode = this.childNodes[i].cloneNode(true);
          cloned.appendChild(clonedChildNode);
        }
      }
    }
    return cloned;
  }
}

class MockDocumentTypeNode extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, '!DOCTYPE');
    this.nodeType = 10 /* DOCUMENT_TYPE_NODE */;
    this.setAttribute('html', '');
  }
}

class MockCSSRule {
  constructor(parentStyleSheet) {
    this.parentStyleSheet = parentStyleSheet;
    this.cssText = '';
    this.type = 0;
  }
}
class MockCSSStyleSheet {
  constructor(ownerNode) {
    this.type = 'text/css';
    this.parentStyleSheet = null;
    this.cssRules = [];
    this.ownerNode = ownerNode;
  }
  get rules() {
    return this.cssRules;
  }
  set rules(rules) {
    this.cssRules = rules;
  }
  deleteRule(index) {
    if (index >= 0 && index < this.cssRules.length) {
      this.cssRules.splice(index, 1);
      updateStyleTextNode(this.ownerNode);
    }
  }
  insertRule(rule, index = 0) {
    if (typeof index !== 'number') {
      index = 0;
    }
    if (index < 0) {
      index = 0;
    }
    if (index > this.cssRules.length) {
      index = this.cssRules.length;
    }
    const cssRule = new MockCSSRule(this);
    cssRule.cssText = rule;
    this.cssRules.splice(index, 0, cssRule);
    updateStyleTextNode(this.ownerNode);
    return index;
  }
}
function getStyleElementText(styleElm) {
  const output = [];
  for (let i = 0; i < styleElm.childNodes.length; i++) {
    output.push(styleElm.childNodes[i].nodeValue);
  }
  return output.join('');
}
function setStyleElementText(styleElm, text) {
  // keeping the innerHTML and the sheet.cssRules connected
  // is not technically correct, but since we're doing
  // SSR we'll need to turn any assigned cssRules into
  // real text, not just properties that aren't rendered
  const sheet = styleElm.sheet;
  sheet.cssRules.length = 0;
  sheet.insertRule(text);
  updateStyleTextNode(styleElm);
}
function updateStyleTextNode(styleElm) {
  const childNodeLen = styleElm.childNodes.length;
  if (childNodeLen > 1) {
    for (let i = childNodeLen - 1; i >= 1; i--) {
      styleElm.removeChild(styleElm.childNodes[i]);
    }
  }
  else if (childNodeLen < 1) {
    styleElm.appendChild(styleElm.ownerDocument.createTextNode(''));
  }
  const textNode = styleElm.childNodes[0];
  textNode.nodeValue = styleElm.sheet.cssRules.map(r => r.cssText).join('\n');
}

function createElement(ownerDocument, tagName) {
  if (typeof tagName !== 'string' || tagName === '' || !/^[a-z0-9-_:]+$/i.test(tagName)) {
    throw new Error(`The tag name provided (${tagName}) is not a valid name.`);
  }
  tagName = tagName.toLowerCase();
  switch (tagName) {
    case 'a':
      return new MockAnchorElement(ownerDocument);
    case 'base':
      return new MockBaseElement(ownerDocument);
    case 'button':
      return new MockButtonElement(ownerDocument);
    case 'canvas':
      return new MockCanvasElement(ownerDocument);
    case 'form':
      return new MockFormElement(ownerDocument);
    case 'img':
      return new MockImageElement(ownerDocument);
    case 'input':
      return new MockInputElement(ownerDocument);
    case 'link':
      return new MockLinkElement(ownerDocument);
    case 'meta':
      return new MockMetaElement(ownerDocument);
    case 'script':
      return new MockScriptElement(ownerDocument);
    case 'style':
      return new MockStyleElement(ownerDocument);
    case 'template':
      return new MockTemplateElement(ownerDocument);
    case 'title':
      return new MockTitleElement(ownerDocument);
  }
  if (ownerDocument != null && tagName.includes('-')) {
    const win = ownerDocument.defaultView;
    if (win != null && win.customElements != null) {
      return createCustomElement(win.customElements, ownerDocument, tagName);
    }
  }
  return new MockHTMLElement(ownerDocument, tagName);
}
function createElementNS(ownerDocument, namespaceURI, tagName) {
  if (namespaceURI === 'http://www.w3.org/1999/xhtml') {
    return createElement(ownerDocument, tagName);
  }
  else if (namespaceURI === 'http://www.w3.org/2000/svg') {
    return new MockSVGElement(ownerDocument, tagName);
  }
  else {
    return new MockElement(ownerDocument, tagName);
  }
}
class MockAnchorElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'a');
  }
  get href() {
    return fullUrl(this, 'href');
  }
  set href(value) {
    this.setAttribute('href', value);
  }
}
class MockButtonElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'button');
  }
}
patchPropAttributes(MockButtonElement.prototype, {
  type: String,
}, {
  type: 'submit',
});
class MockImageElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'img');
  }
  get draggable() {
    return this.getAttributeNS(null, 'draggable') !== 'false';
  }
  set draggable(value) {
    this.setAttributeNS(null, 'draggable', value);
  }
  get src() {
    return fullUrl(this, 'src');
  }
  set src(value) {
    this.setAttribute('src', value);
  }
}
patchPropAttributes(MockImageElement.prototype, {
  height: Number,
  width: Number,
});
class MockInputElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'input');
  }
  get list() {
    const listId = this.getAttribute('list');
    if (listId) {
      return this.ownerDocument.getElementById(listId);
    }
    return null;
  }
}
patchPropAttributes(MockInputElement.prototype, {
  accept: String,
  autocomplete: String,
  autofocus: Boolean,
  capture: String,
  checked: Boolean,
  disabled: Boolean,
  form: String,
  formaction: String,
  formenctype: String,
  formmethod: String,
  formnovalidate: String,
  formtarget: String,
  height: Number,
  inputmode: String,
  max: String,
  maxLength: Number,
  min: String,
  minLength: Number,
  multiple: Boolean,
  name: String,
  pattern: String,
  placeholder: String,
  required: Boolean,
  readOnly: Boolean,
  size: Number,
  spellCheck: Boolean,
  src: String,
  step: String,
  type: String,
  value: String,
  width: Number,
}, {
  type: 'text',
});
class MockFormElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'form');
  }
}
patchPropAttributes(MockFormElement.prototype, {
  name: String,
});
class MockLinkElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'link');
  }
  get href() {
    return fullUrl(this, 'href');
  }
  set href(value) {
    this.setAttribute('href', value);
  }
}
patchPropAttributes(MockLinkElement.prototype, {
  crossorigin: String,
  media: String,
  rel: String,
  type: String,
});
class MockMetaElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'meta');
  }
}
patchPropAttributes(MockMetaElement.prototype, {
  charset: String,
  content: String,
  name: String,
});
class MockScriptElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'script');
  }
  get src() {
    return fullUrl(this, 'src');
  }
  set src(value) {
    this.setAttribute('src', value);
  }
}
patchPropAttributes(MockScriptElement.prototype, {
  type: String,
});
class MockStyleElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'style');
    this.sheet = new MockCSSStyleSheet(this);
  }
  get innerHTML() {
    return getStyleElementText(this);
  }
  set innerHTML(value) {
    setStyleElementText(this, value);
  }
  get innerText() {
    return getStyleElementText(this);
  }
  set innerText(value) {
    setStyleElementText(this, value);
  }
  get textContent() {
    return getStyleElementText(this);
  }
  set textContent(value) {
    setStyleElementText(this, value);
  }
}
class MockSVGElement extends MockElement {
  // SVGElement properties and methods
  get ownerSVGElement() {
    return null;
  }
  get viewportElement() {
    return null;
  }
  focus() {
    /**/
  }
  onunload() {
    /**/
  }
  // SVGGeometryElement properties and methods
  get pathLength() {
    return 0;
  }
  isPointInFill(_pt) {
    return false;
  }
  isPointInStroke(_pt) {
    return false;
  }
  getTotalLength() {
    return 0;
  }
}
class MockBaseElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'base');
  }
  get href() {
    return fullUrl(this, 'href');
  }
  set href(value) {
    this.setAttribute('href', value);
  }
}
class MockTemplateElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'template');
    this.content = new MockDocumentFragment(ownerDocument);
  }
  get innerHTML() {
    return this.content.innerHTML;
  }
  set innerHTML(html) {
    this.content.innerHTML = html;
  }
  cloneNode(deep) {
    const cloned = new MockTemplateElement(null);
    cloned.attributes = cloneAttributes(this.attributes);
    const styleCssText = this.getAttribute('style');
    if (styleCssText != null && styleCssText.length > 0) {
      cloned.setAttribute('style', styleCssText);
    }
    cloned.content = this.content.cloneNode(deep);
    if (deep) {
      for (let i = 0, ii = this.childNodes.length; i < ii; i++) {
        const clonedChildNode = this.childNodes[i].cloneNode(true);
        cloned.appendChild(clonedChildNode);
      }
    }
    return cloned;
  }
}
class MockTitleElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'title');
  }
  get text() {
    return this.textContent;
  }
  set text(value) {
    this.textContent = value;
  }
}
class MockCanvasElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'canvas');
  }
  getContext() {
    return {
      fillRect() {
        return;
      },
      clearRect() { },
      getImageData: function (_, __, w, h) {
        return {
          data: new Array(w * h * 4),
        };
      },
      putImageData() { },
      createImageData: function () {
        return [];
      },
      setTransform() { },
      drawImage() { },
      save() { },
      fillText() { },
      restore() { },
      beginPath() { },
      moveTo() { },
      lineTo() { },
      closePath() { },
      stroke() { },
      translate() { },
      scale() { },
      rotate() { },
      arc() { },
      fill() { },
      measureText() {
        return { width: 0 };
      },
      transform() { },
      rect() { },
      clip() { },
    };
  }
}
function fullUrl(elm, attrName) {
  const val = elm.getAttribute(attrName) || '';
  if (elm.ownerDocument != null) {
    const win = elm.ownerDocument.defaultView;
    if (win != null) {
      const loc = win.location;
      if (loc != null) {
        try {
          const url = new URL(val, loc.href);
          return url.href;
        }
        catch (e) { }
      }
    }
  }
  return val.replace(/\'|\"/g, '').trim();
}
function patchPropAttributes(prototype, attrs, defaults = {}) {
  Object.keys(attrs).forEach(propName => {
    const attr = attrs[propName];
    const defaultValue = defaults[propName];
    if (attr === Boolean) {
      Object.defineProperty(prototype, propName, {
        get() {
          return this.hasAttribute(propName);
        },
        set(value) {
          if (value) {
            this.setAttribute(propName, '');
          }
          else {
            this.removeAttribute(propName);
          }
        },
      });
    }
    else if (attr === Number) {
      Object.defineProperty(prototype, propName, {
        get() {
          const value = this.getAttribute(propName);
          return value ? parseInt(value, 10) : defaultValue === undefined ? 0 : defaultValue;
        },
        set(value) {
          this.setAttribute(propName, value);
        },
      });
    }
    else {
      Object.defineProperty(prototype, propName, {
        get() {
          return this.hasAttribute(propName) ? this.getAttribute(propName) : defaultValue || '';
        },
        set(value) {
          this.setAttribute(propName, value);
        },
      });
    }
  });
}
MockElement.prototype.cloneNode = function (deep) {
  // because we're creating elements, which extending specific HTML base classes there
  // is a MockElement circular reference that bundling has trouble dealing with so
  // the fix is to add cloneNode() to MockElement's prototype after the HTML classes
  const cloned = createElement(this.ownerDocument, this.nodeName);
  cloned.attributes = cloneAttributes(this.attributes);
  const styleCssText = this.getAttribute('style');
  if (styleCssText != null && styleCssText.length > 0) {
    cloned.setAttribute('style', styleCssText);
  }
  if (deep) {
    for (let i = 0, ii = this.childNodes.length; i < ii; i++) {
      const clonedChildNode = this.childNodes[i].cloneNode(true);
      cloned.appendChild(clonedChildNode);
    }
  }
  return cloned;
};

let sharedDocument;
function parseHtmlToDocument(html, ownerDocument = null) {
  if (ownerDocument == null) {
    if (sharedDocument == null) {
      sharedDocument = new MockDocument();
    }
    ownerDocument = sharedDocument;
  }
  return parseDocumentUtil(ownerDocument, html);
}
function parseHtmlToFragment(html, ownerDocument = null) {
  if (ownerDocument == null) {
    if (sharedDocument == null) {
      sharedDocument = new MockDocument();
    }
    ownerDocument = sharedDocument;
  }
  return parseFragmentUtil(ownerDocument, html);
}

class MockHeaders {
  constructor(init) {
    this._values = [];
    if (typeof init === 'object') {
      if (typeof init[Symbol.iterator] === 'function') {
        const kvs = [];
        for (const kv of init) {
          if (typeof kv[Symbol.iterator] === 'function') {
            kvs.push([...kv]);
          }
        }
        for (const kv of kvs) {
          this.append(kv[0], kv[1]);
        }
      }
      else {
        for (const key in init) {
          this.append(key, init[key]);
        }
      }
    }
  }
  append(key, value) {
    this._values.push([key, value + '']);
  }
  delete(key) {
    key = key.toLowerCase();
    for (let i = this._values.length - 1; i >= 0; i--) {
      if (this._values[i][0].toLowerCase() === key) {
        this._values.splice(i, 1);
      }
    }
  }
  entries() {
    const entries = [];
    for (const kv of this.keys()) {
      entries.push([kv, this.get(kv)]);
    }
    let index = -1;
    return {
      next() {
        index++;
        return {
          value: entries[index],
          done: !entries[index],
        };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
  forEach(cb) {
    for (const kv of this.entries()) {
      cb(kv[1], kv[0]);
    }
  }
  get(key) {
    const rtn = [];
    key = key.toLowerCase();
    for (const kv of this._values) {
      if (kv[0].toLowerCase() === key) {
        rtn.push(kv[1]);
      }
    }
    return rtn.length > 0 ? rtn.join(', ') : null;
  }
  has(key) {
    key = key.toLowerCase();
    for (const kv of this._values) {
      if (kv[0].toLowerCase() === key) {
        return true;
      }
    }
    return false;
  }
  keys() {
    const keys = [];
    for (const kv of this._values) {
      const key = kv[0].toLowerCase();
      if (!keys.includes(key)) {
        keys.push(key);
      }
    }
    let index = -1;
    return {
      next() {
        index++;
        return {
          value: keys[index],
          done: !keys[index],
        };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
  set(key, value) {
    for (const kv of this._values) {
      if (kv[0].toLowerCase() === key.toLowerCase()) {
        kv[1] = value + '';
        return;
      }
    }
    this.append(key, value);
  }
  values() {
    const values = this._values;
    let index = -1;
    return {
      next() {
        index++;
        const done = !values[index];
        return {
          value: done ? undefined : values[index][1],
          done,
        };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
  [Symbol.iterator]() {
    return this.entries();
  }
}

class MockRequest {
  constructor(input, init = {}) {
    this._method = 'GET';
    this._url = '/';
    this.bodyUsed = false;
    this.cache = 'default';
    this.credentials = 'same-origin';
    this.integrity = '';
    this.keepalive = false;
    this.mode = 'cors';
    this.redirect = 'follow';
    this.referrer = 'about:client';
    this.referrerPolicy = '';
    if (typeof input === 'string') {
      this.url = input;
    }
    else if (input) {
      Object.assign(this, input);
      this.headers = new MockHeaders(input.headers);
    }
    Object.assign(this, init);
    if (init.headers) {
      this.headers = new MockHeaders(init.headers);
    }
    if (!this.headers) {
      this.headers = new MockHeaders();
    }
  }
  get url() {
    if (typeof this._url === 'string') {
      return new URL(this._url, location.href).href;
    }
    return new URL('/', location.href).href;
  }
  set url(value) {
    this._url = value;
  }
  get method() {
    if (typeof this._method === 'string') {
      return this._method.toUpperCase();
    }
    return 'GET';
  }
  set method(value) {
    this._method = value;
  }
  clone() {
    const clone = { ...this };
    clone.headers = new MockHeaders(this.headers);
    return new MockRequest(clone);
  }
}
class MockResponse {
  constructor(body, init = {}) {
    this.ok = true;
    this.status = 200;
    this.statusText = '';
    this.type = 'default';
    this.url = '';
    this._body = body;
    if (init) {
      Object.assign(this, init);
    }
    this.headers = new MockHeaders(init.headers);
  }
  async json() {
    return JSON.parse(this._body);
  }
  async text() {
    return this._body;
  }
  clone() {
    const initClone = { ...this };
    initClone.headers = new MockHeaders(this.headers);
    return new MockResponse(this._body, initClone);
  }
}

function setupGlobal(gbl) {
  if (gbl.window == null) {
    const win = (gbl.window = new MockWindow());
    WINDOW_FUNCTIONS.forEach(fnName => {
      if (!(fnName in gbl)) {
        gbl[fnName] = win[fnName].bind(win);
      }
    });
    WINDOW_PROPS.forEach(propName => {
      if (!(propName in gbl)) {
        Object.defineProperty(gbl, propName, {
          get() {
            return win[propName];
          },
          set(val) {
            win[propName] = val;
          },
          configurable: true,
          enumerable: true,
        });
      }
    });
    GLOBAL_CONSTRUCTORS.forEach(([cstrName]) => {
      gbl[cstrName] = win[cstrName];
    });
  }
  return gbl.window;
}
function teardownGlobal(gbl) {
  const win = gbl.window;
  if (win && typeof win.close === 'function') {
    win.close();
  }
}
function patchWindow(winToBePatched) {
  const mockWin = new MockWindow(false);
  WINDOW_FUNCTIONS.forEach(fnName => {
    if (typeof winToBePatched[fnName] !== 'function') {
      winToBePatched[fnName] = mockWin[fnName].bind(mockWin);
    }
  });
  WINDOW_PROPS.forEach(propName => {
    if (winToBePatched === undefined) {
      Object.defineProperty(winToBePatched, propName, {
        get() {
          return mockWin[propName];
        },
        set(val) {
          mockWin[propName] = val;
        },
        configurable: true,
        enumerable: true,
      });
    }
  });
}
function addGlobalsToWindowPrototype(mockWinPrototype) {
  GLOBAL_CONSTRUCTORS.forEach(([cstrName, Cstr]) => {
    Object.defineProperty(mockWinPrototype, cstrName, {
      get() {
        return this['__' + cstrName] || Cstr;
      },
      set(cstr) {
        this['__' + cstrName] = cstr;
      },
      configurable: true,
      enumerable: true,
    });
  });
}
const WINDOW_FUNCTIONS = [
  'addEventListener',
  'alert',
  'blur',
  'cancelAnimationFrame',
  'cancelIdleCallback',
  'clearInterval',
  'clearTimeout',
  'close',
  'confirm',
  'dispatchEvent',
  'focus',
  'getComputedStyle',
  'matchMedia',
  'open',
  'prompt',
  'removeEventListener',
  'requestAnimationFrame',
  'requestIdleCallback',
  'URL',
];
const WINDOW_PROPS = [
  'customElements',
  'devicePixelRatio',
  'document',
  'history',
  'innerHeight',
  'innerWidth',
  'localStorage',
  'location',
  'navigator',
  'pageXOffset',
  'pageYOffset',
  'performance',
  'screenLeft',
  'screenTop',
  'screenX',
  'screenY',
  'scrollX',
  'scrollY',
  'sessionStorage',
  'CSS',
  'CustomEvent',
  'Event',
  'Element',
  'HTMLElement',
  'Node',
  'NodeList',
  'KeyboardEvent',
  'MouseEvent',
];
const GLOBAL_CONSTRUCTORS = [
  ['CustomEvent', MockCustomEvent],
  ['Event', MockEvent],
  ['Headers', MockHeaders],
  ['KeyboardEvent', MockKeyboardEvent],
  ['MouseEvent', MockMouseEvent],
  ['Request', MockRequest],
  ['Response', MockResponse],
  ['HTMLAnchorElement', MockAnchorElement],
  ['HTMLBaseElement', MockBaseElement],
  ['HTMLButtonElement', MockButtonElement],
  ['HTMLCanvasElement', MockCanvasElement],
  ['HTMLFormElement', MockFormElement],
  ['HTMLImageElement', MockImageElement],
  ['HTMLInputElement', MockInputElement],
  ['HTMLLinkElement', MockLinkElement],
  ['HTMLMetaElement', MockMetaElement],
  ['HTMLScriptElement', MockScriptElement],
  ['HTMLStyleElement', MockStyleElement],
  ['HTMLTemplateElement', MockTemplateElement],
  ['HTMLTitleElement', MockTitleElement],
];

const consoleNoop = () => {
  /**/
};
function createConsole() {
  return {
    debug: consoleNoop,
    error: consoleNoop,
    info: consoleNoop,
    log: consoleNoop,
    warn: consoleNoop,
    dir: consoleNoop,
    dirxml: consoleNoop,
    table: consoleNoop,
    trace: consoleNoop,
    group: consoleNoop,
    groupCollapsed: consoleNoop,
    groupEnd: consoleNoop,
    clear: consoleNoop,
    count: consoleNoop,
    countReset: consoleNoop,
    assert: consoleNoop,
    profile: consoleNoop,
    profileEnd: consoleNoop,
    time: consoleNoop,
    timeLog: consoleNoop,
    timeEnd: consoleNoop,
    timeStamp: consoleNoop,
    context: consoleNoop,
    memory: consoleNoop,
  };
}

class MockHistory {
  constructor() {
    this.items = [];
  }
  get length() {
    return this.items.length;
  }
  back() {
    this.go(-1);
  }
  forward() {
    this.go(1);
  }
  go(_value) {
    //
  }
  pushState(_state, _title, _url) {
    //
  }
  replaceState(_state, _title, _url) {
    //
  }
}

class MockIntersectionObserver {
  constructor() {
    /**/
  }
  disconnect() {
    /**/
  }
  observe() {
    /**/
  }
  takeRecords() {
    return [];
  }
  unobserve() {
    /**/
  }
}

class MockLocation {
  constructor() {
    this.ancestorOrigins = null;
    this.protocol = '';
    this.host = '';
    this.hostname = '';
    this.port = '';
    this.pathname = '';
    this.search = '';
    this.hash = '';
    this.username = '';
    this.password = '';
    this.origin = '';
    this._href = '';
  }
  get href() {
    return this._href;
  }
  set href(value) {
    const url = new URL(value, 'http://mockdoc.stenciljs.com');
    this._href = url.href;
    this.protocol = url.protocol;
    this.host = url.host;
    this.hostname = url.hostname;
    this.port = url.port;
    this.pathname = url.pathname;
    this.search = url.search;
    this.hash = url.hash;
    this.username = url.username;
    this.password = url.password;
    this.origin = url.origin;
  }
  assign(_url) {
    //
  }
  reload(_forcedReload) {
    //
  }
  replace(_url) {
    //
  }
  toString() {
    return this.href;
  }
}

class MockNavigator {
  constructor() {
    this.appCodeName = 'MockNavigator';
    this.appName = 'MockNavigator';
    this.appVersion = 'MockNavigator';
    this.platform = 'MockNavigator';
    this.userAgent = 'MockNavigator';
  }
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Performance
 */
class MockPerformance {
  constructor() {
    this.timeOrigin = Date.now();
  }
  addEventListener() {
    //
  }
  clearMarks() {
    //
  }
  clearMeasures() {
    //
  }
  clearResourceTimings() {
    //
  }
  dispatchEvent() {
    return true;
  }
  getEntries() {
    return [];
  }
  getEntriesByName() {
    return [];
  }
  getEntriesByType() {
    return [];
  }
  mark() {
    //
  }
  measure() {
    //
  }
  get navigation() {
    return {};
  }
  now() {
    return Date.now() - this.timeOrigin;
  }
  get onresourcetimingbufferfull() {
    return null;
  }
  removeEventListener() {
    //
  }
  setResourceTimingBufferSize() {
    //
  }
  get timing() {
    return {};
  }
  toJSON() {
    //
  }
}
function resetPerformance(perf) {
  if (perf != null) {
    try {
      perf.timeOrigin = Date.now();
    }
    catch (e) { }
  }
}

class MockStorage {
  constructor() {
    this.items = new Map();
  }
  key(_value) {
    //
  }
  getItem(key) {
    key = String(key);
    if (this.items.has(key)) {
      return this.items.get(key);
    }
    return null;
  }
  setItem(key, value) {
    if (value == null) {
      value = 'null';
    }
    this.items.set(String(key), String(value));
  }
  removeItem(key) {
    this.items.delete(String(key));
  }
  clear() {
    this.items.clear();
  }
}

const nativeClearInterval = clearInterval;
const nativeClearTimeout = clearTimeout;
const nativeSetInterval = setInterval;
const nativeSetTimeout = setTimeout;
const nativeURL = URL;
class MockWindow {
  constructor(html = null) {
    if (html !== false) {
      this.document = new MockDocument(html, this);
    }
    else {
      this.document = null;
    }
    this.performance = new MockPerformance();
    this.customElements = new MockCustomElementRegistry(this);
    this.console = createConsole();
    resetWindowDefaults(this);
    resetWindowDimensions(this);
  }
  addEventListener(type, handler) {
    addEventListener(this, type, handler);
  }
  alert(msg) {
    if (this.console) {
      this.console.debug(msg);
    }
    else {
      console.debug(msg);
    }
  }
  blur() {
    /**/
  }
  cancelAnimationFrame(id) {
    this.__clearTimeout(id);
  }
  cancelIdleCallback(id) {
    this.__clearTimeout(id);
  }
  get CharacterData() {
    if (this.__charDataCstr == null) {
      const ownerDocument = this.document;
      this.__charDataCstr = class extends MockNode {
        constructor() {
          super(ownerDocument, 0, 'test', '');
          throw new Error('Illegal constructor: cannot construct CharacterData');
        }
      };
    }
    return this.__charDataCstr;
  }
  set CharacterData(charDataCstr) {
    this.__charDataCstr = charDataCstr;
  }
  clearInterval(id) {
    this.__clearInterval(id);
  }
  clearTimeout(id) {
    this.__clearTimeout(id);
  }
  close() {
    resetWindow(this);
  }
  confirm() {
    return false;
  }
  get CSS() {
    return {
      supports: () => true,
    };
  }
  get Document() {
    if (this.__docCstr == null) {
      const win = this;
      this.__docCstr = class extends MockDocument {
        constructor() {
          super(false, win);
          throw new Error('Illegal constructor: cannot construct Document');
        }
      };
    }
    return this.__docCstr;
  }
  set Document(docCstr) {
    this.__docCstr = docCstr;
  }
  get DocumentFragment() {
    if (this.__docFragCstr == null) {
      const ownerDocument = this.document;
      this.__docFragCstr = class extends MockDocumentFragment {
        constructor() {
          super(ownerDocument);
          throw new Error('Illegal constructor: cannot construct DocumentFragment');
        }
      };
    }
    return this.__docFragCstr;
  }
  set DocumentFragment(docFragCstr) {
    this.__docFragCstr = docFragCstr;
  }
  get DocumentType() {
    if (this.__docTypeCstr == null) {
      const ownerDocument = this.document;
      this.__docTypeCstr = class extends MockNode {
        constructor() {
          super(ownerDocument, 0, 'test', '');
          throw new Error('Illegal constructor: cannot construct DocumentType');
        }
      };
    }
    return this.__docTypeCstr;
  }
  set DocumentType(docTypeCstr) {
    this.__docTypeCstr = docTypeCstr;
  }
  get DOMTokenList() {
    if (this.__domTokenListCstr == null) {
      this.__domTokenListCstr = class MockDOMTokenList {
      };
    }
    return this.__domTokenListCstr;
  }
  set DOMTokenList(domTokenListCstr) {
    this.__domTokenListCstr = domTokenListCstr;
  }
  dispatchEvent(ev) {
    return dispatchEvent(this, ev);
  }
  get Element() {
    if (this.__elementCstr == null) {
      const ownerDocument = this.document;
      this.__elementCstr = class extends MockElement {
        constructor() {
          super(ownerDocument, '');
          throw new Error('Illegal constructor: cannot construct Element');
        }
      };
    }
    return this.__elementCstr;
  }
  fetch(input, init) {
    if (typeof fetch === 'function') {
      return fetch(input, init);
    }
    throw new Error(`fetch() not implemented`);
  }
  focus() {
    /**/
  }
  getComputedStyle(_) {
    return {
      cssText: '',
      length: 0,
      parentRule: null,
      getPropertyPriority() {
        return null;
      },
      getPropertyValue() {
        return '';
      },
      item() {
        return null;
      },
      removeProperty() {
        return null;
      },
      setProperty() {
        return null;
      },
    };
  }
  get globalThis() {
    return this;
  }
  get history() {
    if (this.__history == null) {
      this.__history = new MockHistory();
    }
    return this.__history;
  }
  set history(hsty) {
    this.__history = hsty;
  }
  get JSON() {
    return JSON;
  }
  get HTMLElement() {
    if (this.__htmlElementCstr == null) {
      const ownerDocument = this.document;
      this.__htmlElementCstr = class extends MockHTMLElement {
        constructor() {
          super(ownerDocument, '');
          const observedAttributes = this.constructor.observedAttributes;
          if (Array.isArray(observedAttributes) && typeof this.attributeChangedCallback === 'function') {
            observedAttributes.forEach(attrName => {
              const attrValue = this.getAttribute(attrName);
              if (attrValue != null) {
                this.attributeChangedCallback(attrName, null, attrValue);
              }
            });
          }
        }
      };
    }
    return this.__htmlElementCstr;
  }
  set HTMLElement(htmlElementCstr) {
    this.__htmlElementCstr = htmlElementCstr;
  }
  get IntersectionObserver() {
    return MockIntersectionObserver;
  }
  get localStorage() {
    if (this.__localStorage == null) {
      this.__localStorage = new MockStorage();
    }
    return this.__localStorage;
  }
  set localStorage(locStorage) {
    this.__localStorage = locStorage;
  }
  get location() {
    if (this.__location == null) {
      this.__location = new MockLocation();
    }
    return this.__location;
  }
  set location(val) {
    if (typeof val === 'string') {
      if (this.__location == null) {
        this.__location = new MockLocation();
      }
      this.__location.href = val;
    }
    else {
      this.__location = val;
    }
  }
  matchMedia() {
    return {
      matches: false,
    };
  }
  get Node() {
    if (this.__nodeCstr == null) {
      const ownerDocument = this.document;
      this.__nodeCstr = class extends MockNode {
        constructor() {
          super(ownerDocument, 0, 'test', '');
          throw new Error('Illegal constructor: cannot construct Node');
        }
      };
    }
    return this.__nodeCstr;
  }
  get NodeList() {
    if (this.__nodeListCstr == null) {
      const ownerDocument = this.document;
      this.__nodeListCstr = class extends MockNodeList {
        constructor() {
          super(ownerDocument, [], 0);
          throw new Error('Illegal constructor: cannot construct NodeList');
        }
      };
    }
    return this.__nodeListCstr;
  }
  get navigator() {
    if (this.__navigator == null) {
      this.__navigator = new MockNavigator();
    }
    return this.__navigator;
  }
  set navigator(nav) {
    this.__navigator = nav;
  }
  get parent() {
    return null;
  }
  prompt() {
    return '';
  }
  open() {
    return null;
  }
  get origin() {
    return this.location.origin;
  }
  removeEventListener(type, handler) {
    removeEventListener(this, type, handler);
  }
  requestAnimationFrame(callback) {
    return this.setTimeout(() => {
      callback(Date.now());
    }, 0);
  }
  requestIdleCallback(callback) {
    return this.setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => 0,
      });
    }, 0);
  }
  scroll(_x, _y) {
    /**/
  }
  scrollBy(_x, _y) {
    /**/
  }
  scrollTo(_x, _y) {
    /**/
  }
  get self() {
    return this;
  }
  get sessionStorage() {
    if (this.__sessionStorage == null) {
      this.__sessionStorage = new MockStorage();
    }
    return this.__sessionStorage;
  }
  set sessionStorage(locStorage) {
    this.__sessionStorage = locStorage;
  }
  setInterval(callback, ms, ...args) {
    if (this.__timeouts == null) {
      this.__timeouts = new Set();
    }
    ms = Math.min(ms, this.__maxTimeout);
    if (this.__allowInterval) {
      const intervalId = this.__setInterval(() => {
        if (this.__timeouts) {
          this.__timeouts.delete(intervalId);
          try {
            callback(...args);
          }
          catch (e) {
            if (this.console) {
              this.console.error(e);
            }
            else {
              console.error(e);
            }
          }
        }
      }, ms);
      if (this.__timeouts) {
        this.__timeouts.add(intervalId);
      }
      return intervalId;
    }
    const timeoutId = this.__setTimeout(() => {
      if (this.__timeouts) {
        this.__timeouts.delete(timeoutId);
        try {
          callback(...args);
        }
        catch (e) {
          if (this.console) {
            this.console.error(e);
          }
          else {
            console.error(e);
          }
        }
      }
    }, ms);
    if (this.__timeouts) {
      this.__timeouts.add(timeoutId);
    }
    return timeoutId;
  }
  setTimeout(callback, ms, ...args) {
    if (this.__timeouts == null) {
      this.__timeouts = new Set();
    }
    ms = Math.min(ms, this.__maxTimeout);
    const timeoutId = this.__setTimeout(() => {
      if (this.__timeouts) {
        this.__timeouts.delete(timeoutId);
        try {
          callback(...args);
        }
        catch (e) {
          if (this.console) {
            this.console.error(e);
          }
          else {
            console.error(e);
          }
        }
      }
    }, ms);
    if (this.__timeouts) {
      this.__timeouts.add(timeoutId);
    }
    return timeoutId;
  }
  get top() {
    return this;
  }
  get window() {
    return this;
  }
  onanimationstart() {
    /**/
  }
  onanimationend() {
    /**/
  }
  onanimationiteration() {
    /**/
  }
  onabort() {
    /**/
  }
  onauxclick() {
    /**/
  }
  onbeforecopy() {
    /**/
  }
  onbeforecut() {
    /**/
  }
  onbeforepaste() {
    /**/
  }
  onblur() {
    /**/
  }
  oncancel() {
    /**/
  }
  oncanplay() {
    /**/
  }
  oncanplaythrough() {
    /**/
  }
  onchange() {
    /**/
  }
  onclick() {
    /**/
  }
  onclose() {
    /**/
  }
  oncontextmenu() {
    /**/
  }
  oncopy() {
    /**/
  }
  oncuechange() {
    /**/
  }
  oncut() {
    /**/
  }
  ondblclick() {
    /**/
  }
  ondrag() {
    /**/
  }
  ondragend() {
    /**/
  }
  ondragenter() {
    /**/
  }
  ondragleave() {
    /**/
  }
  ondragover() {
    /**/
  }
  ondragstart() {
    /**/
  }
  ondrop() {
    /**/
  }
  ondurationchange() {
    /**/
  }
  onemptied() {
    /**/
  }
  onended() {
    /**/
  }
  onerror() {
    /**/
  }
  onfocus() {
    /**/
  }
  onfocusin() {
    /**/
  }
  onfocusout() {
    /**/
  }
  onformdata() {
    /**/
  }
  onfullscreenchange() {
    /**/
  }
  onfullscreenerror() {
    /**/
  }
  ongotpointercapture() {
    /**/
  }
  oninput() {
    /**/
  }
  oninvalid() {
    /**/
  }
  onkeydown() {
    /**/
  }
  onkeypress() {
    /**/
  }
  onkeyup() {
    /**/
  }
  onload() {
    /**/
  }
  onloadeddata() {
    /**/
  }
  onloadedmetadata() {
    /**/
  }
  onloadstart() {
    /**/
  }
  onlostpointercapture() {
    /**/
  }
  onmousedown() {
    /**/
  }
  onmouseenter() {
    /**/
  }
  onmouseleave() {
    /**/
  }
  onmousemove() {
    /**/
  }
  onmouseout() {
    /**/
  }
  onmouseover() {
    /**/
  }
  onmouseup() {
    /**/
  }
  onmousewheel() {
    /**/
  }
  onpaste() {
    /**/
  }
  onpause() {
    /**/
  }
  onplay() {
    /**/
  }
  onplaying() {
    /**/
  }
  onpointercancel() {
    /**/
  }
  onpointerdown() {
    /**/
  }
  onpointerenter() {
    /**/
  }
  onpointerleave() {
    /**/
  }
  onpointermove() {
    /**/
  }
  onpointerout() {
    /**/
  }
  onpointerover() {
    /**/
  }
  onpointerup() {
    /**/
  }
  onprogress() {
    /**/
  }
  onratechange() {
    /**/
  }
  onreset() {
    /**/
  }
  onresize() {
    /**/
  }
  onscroll() {
    /**/
  }
  onsearch() {
    /**/
  }
  onseeked() {
    /**/
  }
  onseeking() {
    /**/
  }
  onselect() {
    /**/
  }
  onselectstart() {
    /**/
  }
  onstalled() {
    /**/
  }
  onsubmit() {
    /**/
  }
  onsuspend() {
    /**/
  }
  ontimeupdate() {
    /**/
  }
  ontoggle() {
    /**/
  }
  onvolumechange() {
    /**/
  }
  onwaiting() {
    /**/
  }
  onwebkitfullscreenchange() {
    /**/
  }
  onwebkitfullscreenerror() {
    /**/
  }
  onwheel() {
    /**/
  }
}
addGlobalsToWindowPrototype(MockWindow.prototype);
function resetWindowDefaults(win) {
  win.__clearInterval = nativeClearInterval;
  win.__clearTimeout = nativeClearTimeout;
  win.__setInterval = nativeSetInterval;
  win.__setTimeout = nativeSetTimeout;
  win.__maxTimeout = 30000;
  win.__allowInterval = true;
  win.URL = nativeURL;
}
function cloneWindow(srcWin, opts = {}) {
  if (srcWin == null) {
    return null;
  }
  const clonedWin = new MockWindow(false);
  if (!opts.customElementProxy) {
    srcWin.customElements = null;
  }
  if (srcWin.document != null) {
    const clonedDoc = new MockDocument(false, clonedWin);
    clonedWin.document = clonedDoc;
    clonedDoc.documentElement = srcWin.document.documentElement.cloneNode(true);
  }
  else {
    clonedWin.document = new MockDocument(null, clonedWin);
  }
  return clonedWin;
}
function cloneDocument(srcDoc) {
  if (srcDoc == null) {
    return null;
  }
  const dstWin = cloneWindow(srcDoc.defaultView);
  return dstWin.document;
}
/**
 * Constrain setTimeout() to 1ms, but still async. Also
 * only allow setInterval() to fire once, also constrained to 1ms.
 */
function constrainTimeouts(win) {
  win.__allowInterval = false;
  win.__maxTimeout = 0;
}
function resetWindow(win) {
  if (win != null) {
    if (win.__timeouts) {
      win.__timeouts.forEach(timeoutId => {
        nativeClearInterval(timeoutId);
        nativeClearTimeout(timeoutId);
      });
      win.__timeouts.clear();
    }
    if (win.customElements && win.customElements.clear) {
      win.customElements.clear();
    }
    resetDocument(win.document);
    resetPerformance(win.performance);
    for (const key in win) {
      if (win.hasOwnProperty(key) && key !== 'document' && key !== 'performance' && key !== 'customElements') {
        delete win[key];
      }
    }
    resetWindowDefaults(win);
    resetWindowDimensions(win);
    resetEventListeners(win);
    if (win.document != null) {
      try {
        win.document.defaultView = win;
      }
      catch (e) { }
    }
    // ensure we don't hold onto nodeFetch values
    win.fetch = null;
    win.Headers = null;
    win.Request = null;
    win.Response = null;
    win.FetchError = null;
  }
}
function resetWindowDimensions(win) {
  try {
    win.devicePixelRatio = 1;
    win.innerHeight = 768;
    win.innerWidth = 1366;
    win.pageXOffset = 0;
    win.pageYOffset = 0;
    win.screenLeft = 0;
    win.screenTop = 0;
    win.screenX = 0;
    win.screenY = 0;
    win.scrollX = 0;
    win.scrollY = 0;
    win.screen = {
      availHeight: win.innerHeight,
      availLeft: 0,
      availTop: 0,
      availWidth: win.innerWidth,
      colorDepth: 24,
      height: win.innerHeight,
      keepAwake: false,
      orientation: {
        angle: 0,
        type: 'portrait-primary',
      },
      pixelDepth: 24,
      width: win.innerWidth,
    };
  }
  catch (e) { }
}

class MockDocument extends MockHTMLElement {
  constructor(html = null, win = null) {
    super(null, null);
    this.nodeName = "#document" /* DOCUMENT_NODE */;
    this.nodeType = 9 /* DOCUMENT_NODE */;
    this.defaultView = win;
    this.cookie = '';
    this.referrer = '';
    this.appendChild(this.createDocumentTypeNode());
    if (typeof html === 'string') {
      const parsedDoc = parseDocumentUtil(this, html);
      const documentElement = parsedDoc.children.find(elm => elm.nodeName === 'HTML');
      if (documentElement != null) {
        this.appendChild(documentElement);
        setOwnerDocument(documentElement, this);
      }
    }
    else if (html !== false) {
      const documentElement = new MockHTMLElement(this, 'html');
      this.appendChild(documentElement);
      documentElement.appendChild(new MockHTMLElement(this, 'head'));
      documentElement.appendChild(new MockHTMLElement(this, 'body'));
    }
  }
  get dir() {
    return this.documentElement.dir;
  }
  set dir(value) {
    this.documentElement.dir = value;
  }
  get location() {
    if (this.defaultView != null) {
      return this.defaultView.location;
    }
    return null;
  }
  set location(val) {
    if (this.defaultView != null) {
      this.defaultView.location = val;
    }
  }
  get baseURI() {
    const baseNode = this.head.childNodes.find(node => node.nodeName === 'BASE');
    if (baseNode) {
      return baseNode.href;
    }
    return this.URL;
  }
  get URL() {
    return this.location.href;
  }
  get styleSheets() {
    return this.querySelectorAll('style');
  }
  get scripts() {
    return this.querySelectorAll('script');
  }
  get forms() {
    return this.querySelectorAll('form');
  }
  get images() {
    return this.querySelectorAll('img');
  }
  get scrollingElement() {
    return this.documentElement;
  }
  get documentElement() {
    for (let i = this.childNodes.length - 1; i >= 0; i--) {
      if (this.childNodes[i].nodeName === 'HTML') {
        return this.childNodes[i];
      }
    }
    const documentElement = new MockHTMLElement(this, 'html');
    this.appendChild(documentElement);
    return documentElement;
  }
  set documentElement(documentElement) {
    for (let i = this.childNodes.length - 1; i >= 0; i--) {
      if (this.childNodes[i].nodeType !== 10 /* DOCUMENT_TYPE_NODE */) {
        this.childNodes[i].remove();
      }
    }
    if (documentElement != null) {
      this.appendChild(documentElement);
      setOwnerDocument(documentElement, this);
    }
  }
  get head() {
    const documentElement = this.documentElement;
    for (let i = 0; i < documentElement.childNodes.length; i++) {
      if (documentElement.childNodes[i].nodeName === 'HEAD') {
        return documentElement.childNodes[i];
      }
    }
    const head = new MockHTMLElement(this, 'head');
    documentElement.insertBefore(head, documentElement.firstChild);
    return head;
  }
  set head(head) {
    const documentElement = this.documentElement;
    for (let i = documentElement.childNodes.length - 1; i >= 0; i--) {
      if (documentElement.childNodes[i].nodeName === 'HEAD') {
        documentElement.childNodes[i].remove();
      }
    }
    if (head != null) {
      documentElement.insertBefore(head, documentElement.firstChild);
      setOwnerDocument(head, this);
    }
  }
  get body() {
    const documentElement = this.documentElement;
    for (let i = documentElement.childNodes.length - 1; i >= 0; i--) {
      if (documentElement.childNodes[i].nodeName === 'BODY') {
        return documentElement.childNodes[i];
      }
    }
    const body = new MockHTMLElement(this, 'body');
    documentElement.appendChild(body);
    return body;
  }
  set body(body) {
    const documentElement = this.documentElement;
    for (let i = documentElement.childNodes.length - 1; i >= 0; i--) {
      if (documentElement.childNodes[i].nodeName === 'BODY') {
        documentElement.childNodes[i].remove();
      }
    }
    if (body != null) {
      documentElement.appendChild(body);
      setOwnerDocument(body, this);
    }
  }
  appendChild(newNode) {
    newNode.remove();
    newNode.parentNode = this;
    this.childNodes.push(newNode);
    return newNode;
  }
  createComment(data) {
    return new MockComment(this, data);
  }
  createAttribute(attrName) {
    return new MockAttr(attrName.toLowerCase(), '');
  }
  createAttributeNS(namespaceURI, attrName) {
    return new MockAttr(attrName, '', namespaceURI);
  }
  createElement(tagName) {
    if (tagName === "#document" /* DOCUMENT_NODE */) {
      const doc = new MockDocument(false);
      doc.nodeName = tagName;
      doc.parentNode = null;
      return doc;
    }
    return createElement(this, tagName);
  }
  createElementNS(namespaceURI, tagName) {
    const elmNs = createElementNS(this, namespaceURI, tagName);
    elmNs.namespaceURI = namespaceURI;
    return elmNs;
  }
  createTextNode(text) {
    return new MockTextNode(this, text);
  }
  createDocumentFragment() {
    return new MockDocumentFragment(this);
  }
  createDocumentTypeNode() {
    return new MockDocumentTypeNode(this);
  }
  getElementById(id) {
    return getElementById(this, id);
  }
  getElementsByName(elmName) {
    return getElementsByName(this, elmName.toLowerCase());
  }
  get title() {
    const title = this.head.childNodes.find(elm => elm.nodeName === 'TITLE');
    if (title != null && typeof title.textContent === 'string') {
      return title.textContent.trim();
    }
    return '';
  }
  set title(value) {
    const head = this.head;
    let title = head.childNodes.find(elm => elm.nodeName === 'TITLE');
    if (title == null) {
      title = this.createElement('title');
      head.appendChild(title);
    }
    title.textContent = value;
  }
}
function createDocument(html = null) {
  return new MockWindow(html).document;
}
function createFragment(html) {
  return parseHtmlToFragment(html, null);
}
function resetDocument(doc) {
  if (doc != null) {
    resetEventListeners(doc);
    const documentElement = doc.documentElement;
    if (documentElement != null) {
      resetElement(documentElement);
      for (let i = 0, ii = documentElement.childNodes.length; i < ii; i++) {
        const childNode = documentElement.childNodes[i];
        resetElement(childNode);
        childNode.childNodes.length = 0;
      }
    }
    for (const key in doc) {
      if (doc.hasOwnProperty(key) && !DOC_KEY_KEEPERS.has(key)) {
        delete doc[key];
      }
    }
    try {
      doc.nodeName = "#document" /* DOCUMENT_NODE */;
    }
    catch (e) { }
    try {
      doc.nodeType = 9 /* DOCUMENT_NODE */;
    }
    catch (e) { }
    try {
      doc.cookie = '';
    }
    catch (e) { }
    try {
      doc.referrer = '';
    }
    catch (e) { }
  }
}
const DOC_KEY_KEEPERS = new Set([
  'nodeName',
  'nodeType',
  'nodeValue',
  'ownerDocument',
  'parentNode',
  'childNodes',
  '_shadowRoot',
]);
function getElementById(elm, id) {
  const children = elm.children;
  for (let i = 0, ii = children.length; i < ii; i++) {
    const childElm = children[i];
    if (childElm.id === id) {
      return childElm;
    }
    const childElmFound = getElementById(childElm, id);
    if (childElmFound != null) {
      return childElmFound;
    }
  }
  return null;
}
function getElementsByName(elm, elmName, foundElms = []) {
  const children = elm.children;
  for (let i = 0, ii = children.length; i < ii; i++) {
    const childElm = children[i];
    if (childElm.name && childElm.name.toLowerCase() === elmName) {
      foundElms.push(childElm);
    }
    getElementsByName(childElm, elmName, foundElms);
  }
  return foundElms;
}
function setOwnerDocument(elm, ownerDocument) {
  for (let i = 0, ii = elm.childNodes.length; i < ii; i++) {
    elm.childNodes[i].ownerDocument = ownerDocument;
    if (elm.childNodes[i].nodeType === 1 /* ELEMENT_NODE */) {
      setOwnerDocument(elm.childNodes[i], ownerDocument);
    }
  }
}

function hydrateFactory($stencilWindow, $stencilHydrateOpts, $stencilHydrateResults, $stencilAfterHydrate, $stencilHydrateResolve) {
  var globalThis = $stencilWindow;
  var self = $stencilWindow;
  var top = $stencilWindow;
  var parent = $stencilWindow;

  var addEventListener = $stencilWindow.addEventListener.bind($stencilWindow);
  var alert = $stencilWindow.alert.bind($stencilWindow);
  var blur = $stencilWindow.blur.bind($stencilWindow);
  var cancelAnimationFrame = $stencilWindow.cancelAnimationFrame.bind($stencilWindow);
  var cancelIdleCallback = $stencilWindow.cancelIdleCallback.bind($stencilWindow);
  var clearInterval = $stencilWindow.clearInterval.bind($stencilWindow);
  var clearTimeout = $stencilWindow.clearTimeout.bind($stencilWindow);
  var close = () => {};
  var confirm = $stencilWindow.confirm.bind($stencilWindow);
  var dispatchEvent = $stencilWindow.dispatchEvent.bind($stencilWindow);
  var focus = $stencilWindow.focus.bind($stencilWindow);
  var getComputedStyle = $stencilWindow.getComputedStyle.bind($stencilWindow);
  var matchMedia = $stencilWindow.matchMedia.bind($stencilWindow);
  var open = $stencilWindow.open.bind($stencilWindow);
  var prompt = $stencilWindow.prompt.bind($stencilWindow);
  var removeEventListener = $stencilWindow.removeEventListener.bind($stencilWindow);
  var requestAnimationFrame = $stencilWindow.requestAnimationFrame.bind($stencilWindow);
  var requestIdleCallback = $stencilWindow.requestIdleCallback.bind($stencilWindow);
  var setInterval = $stencilWindow.setInterval.bind($stencilWindow);
  var setTimeout = $stencilWindow.setTimeout.bind($stencilWindow);

  var CharacterData = $stencilWindow.CharacterData;
  var CSS = $stencilWindow.CSS;
  var CustomEvent = $stencilWindow.CustomEvent;
  var Document = $stencilWindow.Document;
  var DocumentFragment = $stencilWindow.DocumentFragment;
  var DocumentType = $stencilWindow.DocumentType;
  var DOMTokenList = $stencilWindow.DOMTokenList;
  var Element = $stencilWindow.Element;
  var Event = $stencilWindow.Event;
  var HTMLAnchorElement = $stencilWindow.HTMLAnchorElement;
  var HTMLBaseElement = $stencilWindow.HTMLBaseElement;
  var HTMLButtonElement = $stencilWindow.HTMLButtonElement;
  var HTMLCanvasElement = $stencilWindow.HTMLCanvasElement;
  var HTMLElement = $stencilWindow.HTMLElement;
  var HTMLFormElement = $stencilWindow.HTMLFormElement;
  var HTMLImageElement = $stencilWindow.HTMLImageElement;
  var HTMLInputElement = $stencilWindow.HTMLInputElement;
  var HTMLLinkElement = $stencilWindow.HTMLLinkElement;
  var HTMLMetaElement = $stencilWindow.HTMLMetaElement;
  var HTMLScriptElement = $stencilWindow.HTMLScriptElement;
  var HTMLStyleElement = $stencilWindow.HTMLStyleElement;
  var HTMLTemplateElement = $stencilWindow.HTMLTemplateElement;
  var HTMLTitleElement = $stencilWindow.HTMLTitleElement;
  var IntersectionObserver = $stencilWindow.IntersectionObserver;
  var KeyboardEvent = $stencilWindow.KeyboardEvent;
  var MouseEvent = $stencilWindow.MouseEvent;
  var Node = $stencilWindow.Node;
  var NodeList = $stencilWindow.NodeList;
  var URL = $stencilWindow.URL;

  var console = $stencilWindow.console;
  var customElements = $stencilWindow.customElements;
  var history = $stencilWindow.history;
  var localStorage = $stencilWindow.localStorage;
  var location = $stencilWindow.location;
  var navigator = $stencilWindow.navigator;
  var performance = $stencilWindow.performance;
  var sessionStorage = $stencilWindow.sessionStorage;

  var devicePixelRatio = $stencilWindow.devicePixelRatio;
  var innerHeight = $stencilWindow.innerHeight;
  var innerWidth = $stencilWindow.innerWidth;
  var origin = $stencilWindow.origin;
  var pageXOffset = $stencilWindow.pageXOffset;
  var pageYOffset = $stencilWindow.pageYOffset;
  var screen = $stencilWindow.screen;
  var screenLeft = $stencilWindow.screenLeft;
  var screenTop = $stencilWindow.screenTop;
  var screenX = $stencilWindow.screenX;
  var screenY = $stencilWindow.screenY;
  var scrollX = $stencilWindow.scrollX;
  var scrollY = $stencilWindow.scrollY;
  var exports = {};

  var fetch, FetchError, Headers, Request, Response;

  if (typeof $stencilWindow.fetch === 'function') {
  fetch = $stencilWindow.fetch;
  } else {
  fetch = $stencilWindow.fetch = function() { throw new Error('fetch() is not implemented'); };
  }

  if (typeof $stencilWindow.FetchError === 'function') {
  FetchError = $stencilWindow.FetchError;
  } else {
  FetchError = $stencilWindow.FetchError = class FetchError { constructor() { throw new Error('FetchError is not implemented'); } };
  }

  if (typeof $stencilWindow.Headers === 'function') {
  Headers = $stencilWindow.Headers;
  } else {
  Headers = $stencilWindow.Headers = class Headers { constructor() { throw new Error('Headers is not implemented'); } };
  }

  if (typeof $stencilWindow.Request === 'function') {
  Request = $stencilWindow.Request;
  } else {
  Request = $stencilWindow.Request = class Request { constructor() { throw new Error('Request is not implemented'); } };
  }

  if (typeof $stencilWindow.Response === 'function') {
  Response = $stencilWindow.Response;
  } else {
  Response = $stencilWindow.Response = class Response { constructor() { throw new Error('Response is not implemented'); } };
  }

  function hydrateAppClosure($stencilWindow) {
  const window = $stencilWindow;
  const document = $stencilWindow.document;
  /*hydrateAppClosure start*/


const NAMESPACE = 'umich-lib';
const BUILD = /* umich-lib */ { allRenderFn: true, appendChildSlotFix: false, asyncLoading: true, attachStyles: true, cloneNodeFix: false, cmpDidLoad: true, cmpDidRender: false, cmpDidUnload: false, cmpDidUpdate: false, cmpShouldUpdate: false, cmpWillLoad: true, cmpWillRender: false, cmpWillUpdate: false, connectedCallback: false, constructableCSS: false, cssAnnotations: true, cssVarShim: false, devTools: false, disconnectedCallback: false, dynamicImportShim: false, element: false, event: false, hasRenderFn: true, hostListener: true, hostListenerTarget: true, hostListenerTargetBody: false, hostListenerTargetDocument: true, hostListenerTargetParent: false, hostListenerTargetWindow: true, hotModuleReplacement: false, hydrateClientSide: true, hydrateServerSide: true, hydratedAttribute: false, hydratedClass: true, isDebug: false, isDev: false, isTesting: false, lazyLoad: true, lifecycle: true, lifecycleDOMEvents: false, member: true, method: false, mode: false, observeAttribute: true, profile: false, prop: true, propBoolean: true, propMutable: false, propNumber: false, propString: true, reflect: true, safari10: false, scoped: false, scriptDataOpts: false, shadowDelegatesFocus: false, shadowDom: true, shadowDomShim: true, slot: true, slotChildNodesFix: false, slotRelocation: true, state: true, style: true, svg: true, taskQueue: true, updatable: true, vdomAttribute: true, vdomClass: true, vdomFunctional: true, vdomKey: false, vdomListener: true, vdomPropOrAttr: true, vdomRef: true, vdomRender: true, vdomStyle: false, vdomText: true, vdomXlink: false, watchCallback: false };

function componentOnReady() {
 return getHostRef(this).$onReadyPromise$;
}

function forceUpdate() {}

function hydrateApp(e, t, o, n, s) {
 function l() {
  if (global.clearTimeout(p), i.clear(), r.clear(), !h) {
   h = !0;
   try {
    t.clientHydrateAnnotations && insertVdomAnnotations(e.document, t.staticComponents), 
    e.dispatchEvent(new e.Event("DOMContentLoaded")), e.document.createElement = c, 
    e.document.createElementNS = $;
   } catch (e) {
    renderCatchError(t, o, e);
   }
  }
  n(e, t, o, s);
 }
 function a(e) {
  renderCatchError(t, o, e), l();
 }
 const r = new Set, i = new Set, d = new Set, c = e.document.createElement, $ = e.document.createElementNS, m = Promise.resolve();
 let p, h = !1;
 try {
  function u() {
   return g(this);
  }
  function f(e) {
   if (isValidComponent(e, t) && !getHostRef(e)) {
    const t = loadModule({
     $tagName$: e.nodeName.toLowerCase(),
     $flags$: null
    });
    null != t && null != t.cmpMeta && (i.add(e), e.connectedCallback = u, registerHost(e, t.cmpMeta), 
    function o(e, t) {
     if ("function" != typeof e.componentOnReady && (e.componentOnReady = componentOnReady), 
     "function" != typeof e.forceUpdate && (e.forceUpdate = forceUpdate), 1 & t.$flags$ && (e.shadowRoot = e), 
     null != t.$members$) {
      const o = getHostRef(e);
      Object.entries(t.$members$).forEach((([n, s]) => {
       const l = s[0];
       if (31 & l) {
        const a = s[1] || n, r = e.getAttribute(a);
        if (null != r) {
         const e = parsePropertyValue(r, l);
         o.$instanceValues$.set(n, e);
        }
        const i = e[n];
        void 0 !== i && (o.$instanceValues$.set(n, i), delete e[n]), Object.defineProperty(e, n, {
         get() {
          return getValue(this, n);
         },
         set(e) {
          setValue(this, n, e, t);
         },
         configurable: !0,
         enumerable: !0
        });
       } else 64 & l && Object.defineProperty(e, n, {
        value() {
         const e = getHostRef(this), t = arguments;
         return e.$onInstancePromise$.then((() => e.$lazyInstance$[n].apply(e.$lazyInstance$, t))).catch(consoleError);
        }
       });
      }));
     }
    }(e, t.cmpMeta));
   }
  }
  function g(n) {
   return i.delete(n), isValidComponent(n, t) && o.hydratedCount < t.maxHydrateCount && !r.has(n) && shouldHydrate(n) ? (r.add(n), 
   async function s(e, t, o, n, l) {
    o = o.toLowerCase();
    const a = loadModule({
     $tagName$: o,
     $flags$: null
    });
    if (null != a && null != a.cmpMeta) {
     l.add(n);
     try {
      connectedCallback(n), await n.componentOnReady(), t.hydratedCount++;
      const e = getHostRef(n), s = e.$modeName$ ? e.$modeName$ : "$";
      t.components.some((e => e.tag === o && e.mode === s)) || t.components.push({
       tag: o,
       mode: s,
       count: 0,
       depth: -1
      });
     } catch (t) {
      e.console.error(t);
     }
     l.delete(n);
    }
   }(e, o, n.nodeName, n, d)) : m;
  }
  e.document.createElement = function t(o) {
   const n = c.call(e.document, o);
   return f(n), n;
  }, e.document.createElementNS = function t(o, n) {
   const s = $.call(e.document, o, n);
   return f(s), s;
  }, p = global.setTimeout((function L() {
   a(`Hydrate exceeded timeout${function e(t) {
    return Array.from(t).map(waitingOnElementMsg);
   }(d)}`);
  }), t.timeout), plt.$resourcesUrl$ = new URL(t.resourcesUrl || "./", doc.baseURI).href, 
  function e(t) {
   if (null != t && 1 === t.nodeType) {
    f(t);
    const o = t.children;
    for (let t = 0, n = o.length; t < n; t++) e(o[t]);
   }
  }(e.document.body), function e() {
   const t = Array.from(i).filter((e => e.parentElement));
   return t.length > 0 ? Promise.all(t.map(g)).then(e) : m;
  }().then(l).catch(a);
 } catch (e) {
  a(e);
 }
}

function isValidComponent(e, t) {
 if (null != e && 1 === e.nodeType) {
  const o = e.nodeName;
  if ("string" == typeof o && o.includes("-")) return !t.excludeComponents.includes(o.toLowerCase());
 }
 return !1;
}

function shouldHydrate(e) {
 if (9 === e.nodeType) return !0;
 if (NO_HYDRATE_TAGS.has(e.nodeName)) return !1;
 if (e.hasAttribute("no-prerender")) return !1;
 const t = e.parentNode;
 return null == t || shouldHydrate(t);
}

function renderCatchError(e, t, o) {
 const n = {
  level: "error",
  type: "build",
  header: "Hydrate Error",
  messageText: "",
  relFilePath: null,
  absFilePath: null,
  lines: []
 };
 if (e.url) try {
  const t = new URL(e.url);
  "/" !== t.pathname && (n.header += ": " + t.pathname);
 } catch (e) {}
 null != o && (null != o.stack ? n.messageText = o.stack.toString() : null != o.message ? n.messageText = o.message.toString() : n.messageText = o.toString()), 
 t.diagnostics.push(n);
}

function printTag(e) {
 let t = `<${e.nodeName.toLowerCase()}`;
 if (Array.isArray(e.attributes)) for (let o = 0; o < e.attributes.length; o++) {
  const n = e.attributes[o];
  t += ` ${n.name}`, "" !== n.value && (t += `="${n.value}"`);
 }
 return t += ">", t;
}

function waitingOnElementMsg(e) {
 let t = "";
 if (e) {
  const o = [];
  t = " - waiting on:";
  let n = e;
  for (;n && 9 !== n.nodeType && "BODY" !== n.nodeName; ) o.unshift(printTag(n)), 
  n = n.parentElement;
  let s = "";
  for (const e of o) s += "  ", t += `\n${s}${e}`;
 }
 return t;
}

const addHostEventListeners = (e, t, o, n) => {
 o && (o.map((([o, n, s]) => {
  const l = getHostListenerTarget(e, o) , a = hostListenerProxy(t, s), r = hostListenerOpts(o);
  plt.ael(l, n, a, r), (t.$rmListeners$ = t.$rmListeners$ || []).push((() => plt.rel(l, n, a, r)));
 })));
}, hostListenerProxy = (e, t) => o => {
 try {
  256 & e.$flags$ ? e.$lazyInstance$[t](o) : (e.$queuedListeners$ = e.$queuedListeners$ || []).push([ t, o ]) ;
 } catch (e) {
  consoleError(e);
 }
}, getHostListenerTarget = (e, t) => 4 & t ? doc : 8 & t ? win : e, hostListenerOpts = e => 0 != (2 & e);

const createTime = (e, t = "") => {
 return () => {};
}, rootAppliedStyles = new WeakMap, registerStyle = (e, t, o) => {
 let n = styles.get(e);
 n = t, styles.set(e, n);
}, addStyle = (e, t, o, n) => {
 let s = getScopeId(t), l = styles.get(s);
 if (e = 11 === e.nodeType ? e : doc, l) if ("string" == typeof l) {
  e = e.head || e;
  let o, a = rootAppliedStyles.get(e);
  if (a || rootAppliedStyles.set(e, a = new Set), !a.has(s)) {
   if (e.host && (o = e.querySelector(`[sty-id="${s}"]`))) o.innerHTML = l; else {
    o = doc.createElement("style"), o.innerHTML = l;
    o.setAttribute("sty-id", s), 
    e.insertBefore(o, e.querySelector("link"));
   }
   a && a.add(s);
  }
 }
 return s;
}, attachStyles = e => {
 const t = e.$cmpMeta$, o = e.$hostElement$, n = t.$flags$, s = createTime("attachStyles", t.$tagName$), l = addStyle(o.getRootNode(), t);
 10 & n && (o["s-sc"] = l, 
 o.classList.add(l + "-h"), BUILD.scoped  ), 
 s();
}, getScopeId = (e, t) => "sc-" + (e.$tagName$), EMPTY_OBJ = {}, isComplexType = e => "object" == (e = typeof e) || "function" === e, isPromise = e => !!e && ("object" == typeof e || "function" == typeof e) && "function" == typeof e.then, h = (e, t, ...o) => {
 let n = null, l = null, a = !1, r = !1, i = [];
 const d = t => {
  for (let o = 0; o < t.length; o++) n = t[o], Array.isArray(n) ? d(n) : null != n && "boolean" != typeof n && ((a = "function" != typeof e && !isComplexType(n)) ? n = String(n) : BUILD.isDev  , 
  a && r ? i[i.length - 1].$text$ += n : i.push(a ? newVNode(null, n) : n), r = a);
 };
 if (d(o), t && (t.name && (l = t.name), BUILD.vdomClass)) {
  const e = t.className || t.class;
  e && (t.class = "object" != typeof e ? e : Object.keys(e).filter((t => e[t])).join(" "));
 }
 if ("function" == typeof e) return e(null === t ? {} : t, i, vdomFnUtils);
 const c = newVNode(e, null);
 return c.$attrs$ = t, i.length > 0 && (c.$children$ = i), (c.$name$ = l), c;
}, newVNode = (e, t) => {
 const o = {
  $flags$: 0,
  $tag$: e,
  $text$: t,
  $elm$: null,
  $children$: null
 };
 return (o.$attrs$ = null), (o.$name$ = null), o;
}, Host = {}, isHost = e => e && e.$tag$ === Host, vdomFnUtils = {
 forEach: (e, t) => e.map(convertToPublic).forEach(t),
 map: (e, t) => e.map(convertToPublic).map(t).map(convertToPrivate)
}, convertToPublic = e => ({
 vattrs: e.$attrs$,
 vchildren: e.$children$,
 vkey: e.$key$,
 vname: e.$name$,
 vtag: e.$tag$,
 vtext: e.$text$
}), convertToPrivate = e => {
 if ("function" == typeof e.vtag) {
  const t = {
   ...e.vattrs
  };
  return e.vkey && (t.key = e.vkey), e.vname && (t.name = e.vname), h(e.vtag, t, ...e.vchildren || []);
 }
 const t = newVNode(e.vtag, e.vtext);
 return t.$attrs$ = e.vattrs, t.$children$ = e.vchildren, t.$key$ = e.vkey, t.$name$ = e.vname, 
 t;
}, setAccessor = (e, t, o, n, s, l) => {
 if (o !== n) {
  let a = isMemberInElement(e, t), r = t.toLowerCase();
  if ("class" === t) {
   const t = e.classList, s = parseClassList(o), l = parseClassList(n);
   t.remove(...s.filter((e => e && !l.includes(e)))), t.add(...l.filter((e => e && !s.includes(e))));
  } else if ("ref" === t) n && n(e); else if ((a ) || "o" !== t[0] || "n" !== t[1]) {
   {
    const i = isComplexType(n);
    if ((a || i && null !== n) && !s) try {
     if (e.tagName.includes("-")) e[t] = n; else {
      let s = null == n ? "" : n;
      "list" === t ? a = !1 : null != o && e[t] == s || (e[t] = s);
     }
    } catch (e) {}
    null == n || !1 === n ? !1 === n && "" !== e.getAttribute(t) || (e.removeAttribute(t)) : (!a || 4 & l || s) && !i && (n = !0 === n ? "" : n, 
    e.setAttribute(t, n));
   }
  } else t = "-" === t[2] ? t.slice(3) : isMemberInElement(win, r) ? r.slice(2) : r[2] + t.slice(3), 
  o && plt.rel(e, t, o, !1), n && plt.ael(e, t, n, !1);
 }
}, parseClassListRegex = /\s/, parseClassList = e => e ? e.split(parseClassListRegex) : [], updateElement = (e, t, o, n) => {
 const s = 11 === t.$elm$.nodeType && t.$elm$.host ? t.$elm$.host : t.$elm$, l = e && e.$attrs$ || EMPTY_OBJ, a = t.$attrs$ || EMPTY_OBJ;
 for (n in l) n in a || setAccessor(s, n, l[n], void 0, o, t.$flags$);
 for (n in a) setAccessor(s, n, l[n], a[n], o, t.$flags$);
};

let scopeId, contentRef, hostTagName, useNativeShadowDom = !1, checkSlotFallbackVisibility = !1, checkSlotRelocate = !1, isSvgMode = !1;

const createElm = (e, t, o, n) => {
 let s, l, a, r = t.$children$[o], i = 0;
 if (!useNativeShadowDom && (checkSlotRelocate = !0, "slot" === r.$tag$ && (scopeId && n.classList.add(scopeId + "-s"), 
 r.$flags$ |= r.$children$ ? 2 : 1)), null !== r.$text$) s = r.$elm$ = doc.createTextNode(r.$text$); else if (1 & r.$flags$) s = r.$elm$ = slotReferenceDebugNode(r) ; else {
  if (!isSvgMode && (isSvgMode = "svg" === r.$tag$), s = r.$elm$ = doc.createElementNS(isSvgMode ? "http://www.w3.org/2000/svg" : "http://www.w3.org/1999/xhtml", 2 & r.$flags$ ? "slot-fb" : r.$tag$) , 
  isSvgMode && "foreignObject" === r.$tag$ && (isSvgMode = !1), updateElement(null, r, isSvgMode), 
  null != scopeId && s["s-si"] !== scopeId && s.classList.add(s["s-si"] = scopeId), 
  r.$children$) for (i = 0; i < r.$children$.length; ++i) l = createElm(e, r, i, s), 
  l && s.appendChild(l);
  ("svg" === r.$tag$ ? isSvgMode = !1 : "foreignObject" === s.tagName && (isSvgMode = !0));
 }
 return (s["s-hn"] = hostTagName, 3 & r.$flags$ && (s["s-sr"] = !0, 
 s["s-cr"] = contentRef, s["s-sn"] = r.$name$ || "", a = e && e.$children$ && e.$children$[o], 
 a && a.$tag$ === r.$tag$ && e.$elm$ && putBackInOriginalLocation(e.$elm$, !1))), 
 s;
}, putBackInOriginalLocation = (e, t) => {
 plt.$flags$ |= 1;
 const o = e.childNodes;
 for (let e = o.length - 1; e >= 0; e--) {
  const n = o[e];
  n["s-hn"] !== hostTagName && n["s-ol"] && (parentReferenceNode(n).insertBefore(n, referenceNode(n)), 
  n["s-ol"].remove(), n["s-ol"] = void 0, checkSlotRelocate = !0), t && putBackInOriginalLocation(n, t);
 }
 plt.$flags$ &= -2;
}, addVnodes = (e, t, o, n, s, l) => {
 let a, r = e["s-cr"] && e["s-cr"].parentNode || e;
 for (r.shadowRoot && r.tagName === hostTagName && (r = r.shadowRoot); s <= l; ++s) n[s] && (a = createElm(null, o, s, e), 
 a && (n[s].$elm$ = a, r.insertBefore(a, referenceNode(t) )));
}, removeVnodes = (e, t, o, n, s) => {
 for (;t <= o; ++t) (n = e[t]) && (s = n.$elm$, callNodeRefs(n), (checkSlotFallbackVisibility = !0, 
 s["s-ol"] ? s["s-ol"].remove() : putBackInOriginalLocation(s, !0)), s.remove());
}, isSameVnode = (e, t) => e.$tag$ === t.$tag$ && ("slot" === e.$tag$ ? e.$name$ === t.$name$ : !BUILD.vdomKey ), referenceNode = e => e && e["s-ol"] || e, parentReferenceNode = e => (e["s-ol"] ? e["s-ol"] : e).parentNode, patch = (e, t) => {
 const o = t.$elm$ = e.$elm$, n = e.$children$, s = t.$children$, l = t.$tag$, a = t.$text$;
 let r;
 null !== a ? (r = o["s-cr"]) ? r.parentNode.textContent = a : e.$text$ !== a && (o.data = a) : ((isSvgMode = "svg" === l || "foreignObject" !== l && isSvgMode), 
 ("slot" === l || updateElement(e, t, isSvgMode)), 
 null !== n && null !== s ? ((e, t, o, n) => {
  let s, a = 0, r = 0, c = t.length - 1, $ = t[0], m = t[c], p = n.length - 1, h = n[0], u = n[p];
  for (;a <= c && r <= p; ) if (null == $) $ = t[++a]; else if (null == m) m = t[--c]; else if (null == h) h = n[++r]; else if (null == u) u = n[--p]; else if (isSameVnode($, h)) patch($, h), 
  $ = t[++a], h = n[++r]; else if (isSameVnode(m, u)) patch(m, u), m = t[--c], u = n[--p]; else if (isSameVnode($, u)) "slot" !== $.$tag$ && "slot" !== u.$tag$ || putBackInOriginalLocation($.$elm$.parentNode, !1), 
  patch($, u), e.insertBefore($.$elm$, m.$elm$.nextSibling), $ = t[++a], u = n[--p]; else if (isSameVnode(m, h)) "slot" !== $.$tag$ && "slot" !== u.$tag$ || putBackInOriginalLocation(m.$elm$.parentNode, !1), 
  patch(m, h), e.insertBefore(m.$elm$, $.$elm$), m = t[--c], h = n[++r]; else {
   (s = createElm(t && t[r], o, r, e), h = n[++r]), 
   s && (parentReferenceNode($.$elm$).insertBefore(s, referenceNode($.$elm$)) );
  }
  a > c ? addVnodes(e, null == n[p + 1] ? null : n[p + 1].$elm$, o, n, r, p) : r > p && removeVnodes(t, a, c);
 })(o, n, t, s) : null !== s ? (null !== e.$text$ && (o.textContent = ""), 
 addVnodes(o, null, t, s, 0, s.length - 1)) : null !== n && removeVnodes(n, 0, n.length - 1), 
 isSvgMode && "svg" === l && (isSvgMode = !1));
}, updateFallbackSlotVisibility = e => {
 let t, o, n, s, l, a, r = e.childNodes;
 for (o = 0, n = r.length; o < n; o++) if (t = r[o], 1 === t.nodeType) {
  if (t["s-sr"]) for (l = t["s-sn"], t.hidden = !1, s = 0; s < n; s++) if (a = r[s].nodeType, 
  r[s]["s-hn"] !== t["s-hn"] || "" !== l) {
   if (1 === a && l === r[s].getAttribute("slot")) {
    t.hidden = !0;
    break;
   }
  } else if (1 === a || 3 === a && "" !== r[s].textContent.trim()) {
   t.hidden = !0;
   break;
  }
  updateFallbackSlotVisibility(t);
 }
}, relocateNodes = [], relocateSlotContent = e => {
 let t, o, n, s, l, a, r = 0, i = e.childNodes, d = i.length;
 for (;r < d; r++) {
  if (t = i[r], t["s-sr"] && (o = t["s-cr"]) && o.parentNode) for (n = o.parentNode.childNodes, 
  s = t["s-sn"], a = n.length - 1; a >= 0; a--) o = n[a], o["s-cn"] || o["s-nr"] || o["s-hn"] === t["s-hn"] || (isNodeLocatedInSlot(o, s) ? (l = relocateNodes.find((e => e.$nodeToRelocate$ === o)), 
  checkSlotFallbackVisibility = !0, o["s-sn"] = o["s-sn"] || s, l ? l.$slotRefNode$ = t : relocateNodes.push({
   $slotRefNode$: t,
   $nodeToRelocate$: o
  }), o["s-sr"] && relocateNodes.map((e => {
   isNodeLocatedInSlot(e.$nodeToRelocate$, o["s-sn"]) && (l = relocateNodes.find((e => e.$nodeToRelocate$ === o)), 
   l && !e.$slotRefNode$ && (e.$slotRefNode$ = l.$slotRefNode$));
  }))) : relocateNodes.some((e => e.$nodeToRelocate$ === o)) || relocateNodes.push({
   $nodeToRelocate$: o
  }));
  1 === t.nodeType && relocateSlotContent(t);
 }
}, isNodeLocatedInSlot = (e, t) => 1 === e.nodeType ? null === e.getAttribute("slot") && "" === t || e.getAttribute("slot") === t : e["s-sn"] === t || "" === t, callNodeRefs = e => {
 (e.$attrs$ && e.$attrs$.ref && e.$attrs$.ref(null), e.$children$ && e.$children$.map(callNodeRefs));
}, renderVdom = (e, t) => {
 const o = e.$hostElement$, n = e.$cmpMeta$, s = e.$vnode$ || newVNode(null, null), l = isHost(t) ? t : h(null, null, t);
 if (hostTagName = o.tagName, BUILD.isDev  ) ;
 if (n.$attrsToReflect$ && (l.$attrs$ = l.$attrs$ || {}, n.$attrsToReflect$.map((([e, t]) => l.$attrs$[t] = o[e]))), 
 l.$tag$ = null, l.$flags$ |= 4, e.$vnode$ = l, l.$elm$ = s.$elm$ = o.shadowRoot || o, 
 (scopeId = o["s-sc"]), (contentRef = o["s-cr"], 
 useNativeShadowDom = supportsShadow, checkSlotFallbackVisibility = !1), patch(s, l), 
 BUILD.slotRelocation) {
  if (plt.$flags$ |= 1, checkSlotRelocate) {
   let e, t, o, n, s, a;
   relocateSlotContent(l.$elm$);
   let r = 0;
   for (;r < relocateNodes.length; r++) e = relocateNodes[r], t = e.$nodeToRelocate$, 
   t["s-ol"] || (o = originalLocationDebugNode(t) , 
   o["s-nr"] = t, t.parentNode.insertBefore(t["s-ol"] = o, t));
   for (r = 0; r < relocateNodes.length; r++) if (e = relocateNodes[r], t = e.$nodeToRelocate$, 
   e.$slotRefNode$) {
    for (n = e.$slotRefNode$.parentNode, s = e.$slotRefNode$.nextSibling, o = t["s-ol"]; o = o.previousSibling; ) if (a = o["s-nr"], 
    a && a["s-sn"] === t["s-sn"] && n === a.parentNode && (a = a.nextSibling, !a || !a["s-nr"])) {
     s = a;
     break;
    }
    (!s && n !== t.parentNode || t.nextSibling !== s) && t !== s && (!t["s-hn"] && t["s-ol"] && (t["s-hn"] = t["s-ol"].parentNode.nodeName), 
    n.insertBefore(t, s));
   } else 1 === t.nodeType && (t.hidden = !0);
  }
  checkSlotFallbackVisibility && updateFallbackSlotVisibility(l.$elm$), plt.$flags$ &= -2, 
  relocateNodes.length = 0;
 }
}, slotReferenceDebugNode = e => doc.createComment(`<slot${e.$name$ ? ' name="' + e.$name$ + '"' : ""}> (host=${hostTagName.toLowerCase()})`), originalLocationDebugNode = e => doc.createComment("org-location for " + (e.localName ? `<${e.localName}> (host=${e["s-hn"]})` : `[${e.textContent}]`)), emitEvent = (e, t, o) => {
 const n = plt.ce(t, o);
 return e.dispatchEvent(n), n;
}, attachToAncestor = (e, t) => {
 t && !e.$onRenderResolve$ && t["s-p"] && t["s-p"].push(new Promise((t => e.$onRenderResolve$ = t)));
}, scheduleUpdate = (e, t) => {
 if ((e.$flags$ |= 16), 4 & e.$flags$) return void (e.$flags$ |= 512);
 attachToAncestor(e, e.$ancestorComponent$);
 const o = () => dispatchHooks(e, t);
 return writeTask(o) ;
}, dispatchHooks = (e, t) => {
 const n = createTime("scheduleUpdate", e.$cmpMeta$.$tagName$), s = e.$lazyInstance$ ;
 let l;
 return t ? ((e.$flags$ |= 256, e.$queuedListeners$ && (e.$queuedListeners$.map((([e, t]) => safeCall(s, e, t))), 
 e.$queuedListeners$ = null)), (l = safeCall(s, "componentWillLoad"))) : (BUILD.cmpWillUpdate ), n(), then(l, (() => updateComponent(e, s, t)));
}, updateComponent = async (e, t, o) => {
 const n = e.$hostElement$, s = createTime("update", e.$cmpMeta$.$tagName$), l = n["s-rc"];
 o && attachStyles(e);
 const a = createTime("render", e.$cmpMeta$.$tagName$);
 if (await callRender(e, t) , 
 BUILD.hydrateServerSide) try {
  serverSideConnected(n), o && (1 & e.$cmpMeta$.$flags$ ? n["s-en"] = "" : 2 & e.$cmpMeta$.$flags$ && (n["s-en"] = "c"));
 } catch (e) {
  consoleError(e, n);
 }
 if (l && (l.map((e => e())), n["s-rc"] = void 0), a(), s(), 
 BUILD.asyncLoading) {
  const t = n["s-p"], o = () => postUpdateComponent(e);
  0 === t.length ? o() : (Promise.all(t).then(o), e.$flags$ |= 4, t.length = 0);
 }
};

const callRender = (e, t, o) => {
 try {
  if (t = t.render(), (e.$flags$ &= -17), 
  (e.$flags$ |= 2), BUILD.hasRenderFn ) {
   return Promise.resolve(t).then((t => renderVdom(e, t)));
  }
 } catch (t) {
  consoleError(t, e.$hostElement$);
 }
 return null;
}, postUpdateComponent = e => {
 const t = e.$cmpMeta$.$tagName$, o = e.$hostElement$, n = createTime("postUpdate", t), s = e.$lazyInstance$ , l = e.$ancestorComponent$;
 64 & e.$flags$ ? (n()) : (e.$flags$ |= 64, addHydratedFlag(o), 
 (safeCall(s, "componentDidLoad"), 
 BUILD.isDev ), n(), (e.$onReadyResolve$(o), l || appDidLoad())), (e.$onRenderResolve$ && (e.$onRenderResolve$(), 
 e.$onRenderResolve$ = void 0), 512 & e.$flags$ && nextTick((() => scheduleUpdate(e, !1))), 
 e.$flags$ &= -517);
}, appDidLoad = e => {
 addHydratedFlag(doc.documentElement), nextTick((() => emitEvent(win, "appload", {
  detail: {
   namespace: NAMESPACE
  }
 }))), BUILD.profile  ;
}, safeCall = (e, t, o) => {
 if (e && e[t]) try {
  return e[t](o);
 } catch (e) {
  consoleError(e);
 }
}, then = (e, t) => e && e.then ? e.then(t) : t(), addHydratedFlag = e => e.classList.add("hydrated") , serverSideConnected = e => {
 const t = e.children;
 if (null != t) for (let e = 0, o = t.length; e < o; e++) {
  const o = t[e];
  "function" == typeof o.connectedCallback && o.connectedCallback(), serverSideConnected(o);
 }
}, clientHydrate = (e, t, o, n, s, l, a) => {
 let r, i, d, c;
 if (1 === l.nodeType) {
  for (r = l.getAttribute("c-id"), r && (i = r.split("."), i[0] !== a && "0" !== i[0] || (d = {
   $flags$: 0,
   $hostId$: i[0],
   $nodeId$: i[1],
   $depth$: i[2],
   $index$: i[3],
   $tag$: l.tagName.toLowerCase(),
   $elm$: l,
   $attrs$: null,
   $children$: null,
   $key$: null,
   $name$: null,
   $text$: null
  }, t.push(d), l.removeAttribute("c-id"), e.$children$ || (e.$children$ = []), e.$children$[d.$index$] = d, 
  e = d, n && "0" === d.$depth$ && (n[d.$index$] = d.$elm$))), c = l.childNodes.length - 1; c >= 0; c--) clientHydrate(e, t, o, n, s, l.childNodes[c], a);
  if (l.shadowRoot) for (c = l.shadowRoot.childNodes.length - 1; c >= 0; c--) clientHydrate(e, t, o, n, s, l.shadowRoot.childNodes[c], a);
 } else if (8 === l.nodeType) i = l.nodeValue.split("."), i[1] !== a && "0" !== i[1] || (r = i[0], 
 d = {
  $flags$: 0,
  $hostId$: i[1],
  $nodeId$: i[2],
  $depth$: i[3],
  $index$: i[4],
  $elm$: l,
  $attrs$: null,
  $children$: null,
  $key$: null,
  $name$: null,
  $tag$: null,
  $text$: null
 }, "t" === r ? (d.$elm$ = l.nextSibling, d.$elm$ && 3 === d.$elm$.nodeType && (d.$text$ = d.$elm$.textContent, 
 t.push(d), l.remove(), e.$children$ || (e.$children$ = []), e.$children$[d.$index$] = d, 
 n && "0" === d.$depth$ && (n[d.$index$] = d.$elm$))) : d.$hostId$ === a && ("s" === r ? (d.$tag$ = "slot", 
 i[5] ? l["s-sn"] = d.$name$ = i[5] : l["s-sn"] = "", l["s-sr"] = !0, n && (d.$elm$ = doc.createElement(d.$tag$), 
 d.$name$ && d.$elm$.setAttribute("name", d.$name$), l.parentNode.insertBefore(d.$elm$, l), 
 l.remove(), "0" === d.$depth$ && (n[d.$index$] = d.$elm$)), o.push(d), e.$children$ || (e.$children$ = []), 
 e.$children$[d.$index$] = d) : "r" === r && (n ? l.remove() : (s["s-cr"] = l, 
 l["s-cn"] = !0)))); else if (e && "style" === e.$tag$) {
  const t = newVNode(null, l.textContent);
  t.$elm$ = l, t.$index$ = "0", e.$children$ = [ t ];
 }
}, initializeDocumentHydrate = (e, t) => {
 if (1 === e.nodeType) {
  let o = 0;
  for (;o < e.childNodes.length; o++) initializeDocumentHydrate(e.childNodes[o], t);
  if (e.shadowRoot) for (o = 0; o < e.shadowRoot.childNodes.length; o++) initializeDocumentHydrate(e.shadowRoot.childNodes[o], t);
 } else if (8 === e.nodeType) {
  const o = e.nodeValue.split(".");
  "o" === o[0] && (t.set(o[1] + "." + o[2], e), e.nodeValue = "", e["s-en"] = o[3]);
 }
}, parsePropertyValue = (e, t) => null == e || isComplexType(e) ? e : 4 & t ? "false" !== e && ("" === e || !!e) : 1 & t ? String(e) : e, getValue = (e, t) => getHostRef(e).$instanceValues$.get(t), setValue = (e, t, o, n) => {
 const s = getHostRef(e), a = s.$instanceValues$.get(t), r = s.$flags$, i = s.$lazyInstance$ ;
 if (o = parsePropertyValue(o, n.$members$[t][0]), !(8 & r && void 0 !== a || o === a) && (s.$instanceValues$.set(t, o), 
 i)) {
  if (2 == (18 & r)) {
   scheduleUpdate(s, !1);
  }
 }
}, proxyComponent = (e, t, o) => {
 if (t.$members$) {
  const n = Object.entries(t.$members$), s = e.prototype;
  if (n.map((([e, [n]]) => {
   (31 & n || (2 & o) && 32 & n) ? Object.defineProperty(s, e, {
    get() {
     return getValue(this, e);
    },
    set(s) {
     setValue(this, e, s, t);
    },
    configurable: !0,
    enumerable: !0
   }) : BUILD.method   ;
  })), (1 & o)) {
   const o = new Map;
   s.attributeChangedCallback = function(e, t, n) {
    plt.jmp((() => {
     const t = o.get(e);
     this[t] = (null !== n || "boolean" != typeof this[t]) && n;
    }));
   }, e.observedAttributes = n.filter((([e, t]) => 15 & t[0])).map((([e, n]) => {
    const s = n[1] || e;
    return o.set(s, e), 512 & n[0] && t.$attrsToReflect$.push([ e, s ]), 
    s;
   }));
  }
 }
 return e;
}, initializeComponent = async (e, t, o, n, s) => {
 if (0 == (32 & t.$flags$)) {
  {
   if (t.$flags$ |= 32, (s = loadModule(o)).then) {
    const e = (() => {});
    s = await s, e();
   }
   !s.isProxied && (proxyComponent(s, o, 2), s.isProxied = !0);
   const e = createTime("createInstance", o.$tagName$);
   (t.$flags$ |= 8);
   try {
    new s(t);
   } catch (e) {
    consoleError(e);
   }
   (t.$flags$ &= -9), e(), 
   fireConnectedCallback();
  }
  if (s.style) {
   let n = s.style;
   const l = getScopeId(o);
   if (!styles.has(l)) {
    const e = createTime("registerStyles", o.$tagName$);
    registerStyle(l, n), e();
   }
  }
 }
 const r = t.$ancestorComponent$, i = () => scheduleUpdate(t, !0);
 r && r["s-rc"] ? r["s-rc"].push(i) : i();
}, fireConnectedCallback = e => {
}, connectedCallback = e => {
 if (0 == (1 & plt.$flags$)) {
  const t = getHostRef(e), o = t.$cmpMeta$, n = createTime("connectedCallback", o.$tagName$);
  if (1 & t.$flags$) addHostEventListeners(e, t, o.$listeners$), fireConnectedCallback(); else {
   let n;
   if (t.$flags$ |= 1, (n = e.getAttribute("s-id"), n)) {
    ((e, t, o, n) => {
     const s = createTime("hydrateClient", t), l = e.shadowRoot, a = [], r = l ? [] : null, i = n.$vnode$ = newVNode(t, null);
     plt.$orgLocNodes$ || initializeDocumentHydrate(doc.body, plt.$orgLocNodes$ = new Map), 
     e["s-id"] = o, e.removeAttribute("s-id"), clientHydrate(i, a, [], r, e, e, o), a.map((e => {
      const o = e.$hostId$ + "." + e.$nodeId$, n = plt.$orgLocNodes$.get(o), s = e.$elm$;
      n && supportsShadow && "" === n["s-en"] && n.parentNode.insertBefore(s, n.nextSibling), 
      l || (s["s-hn"] = t, n && (s["s-ol"] = n, s["s-ol"]["s-nr"] = s)), plt.$orgLocNodes$.delete(o);
     })), l && r.map((e => {
      e && l.appendChild(e);
     })), s();
    })(e, o.$tagName$, n, t);
   }
   if (!n && (BUILD.hydrateServerSide ) && setContentReference(e), 
   BUILD.asyncLoading) {
    let o = e;
    for (;o = o.parentNode || o.host; ) if (1 === o.nodeType && o.hasAttribute("s-id") && o["s-p"] || o["s-p"]) {
     attachToAncestor(t, t.$ancestorComponent$ = o);
     break;
    }
   }
   initializeComponent(e, t, o);
  }
  n();
 }
}, setContentReference = e => {
 const t = e["s-cr"] = doc.createComment("");
 t["s-cn"] = !0, e.insertBefore(t, e.firstChild);
}, insertVdomAnnotations = (e, t) => {
 if (null != e) {
  const o = {
   hostIds: 0,
   rootLevelIds: 0,
   staticComponents: new Set(t)
  }, n = [];
  parseVNodeAnnotations(e, e.body, o, n), n.forEach((t => {
   if (null != t) {
    const n = t["s-nr"];
    let s = n["s-host-id"], l = n["s-node-id"], a = `${s}.${l}`;
    if (null == s) if (s = 0, o.rootLevelIds++, l = o.rootLevelIds, a = `${s}.${l}`, 
    1 === n.nodeType) n.setAttribute("c-id", a); else if (3 === n.nodeType) {
     if (0 === s && "" === n.nodeValue.trim()) return void t.remove();
     const o = e.createComment(a);
     o.nodeValue = `t.${a}`, n.parentNode.insertBefore(o, n);
    }
    let r = `o.${a}`;
    const i = t.parentElement;
    i && ("" === i["s-en"] ? r += "." : "c" === i["s-en"] && (r += ".c")), t.nodeValue = r;
   }
  }));
 }
}, parseVNodeAnnotations = (e, t, o, n) => {
 null != t && (null != t["s-nr"] && n.push(t), 1 === t.nodeType && t.childNodes.forEach((t => {
  const s = getHostRef(t);
  if (null != s && !o.staticComponents.has(t.nodeName.toLowerCase())) {
   const n = {
    nodeIds: 0
   };
   insertVNodeAnnotations(e, t, s.$vnode$, o, n);
  }
  parseVNodeAnnotations(e, t, o, n);
 })));
}, insertVNodeAnnotations = (e, t, o, n, s) => {
 if (null != o) {
  const l = ++n.hostIds;
  if (t.setAttribute("s-id", l), null != t["s-cr"] && (t["s-cr"].nodeValue = `r.${l}`), 
  null != o.$children$) {
   const t = 0;
   o.$children$.forEach(((o, n) => {
    insertChildVNodeAnnotations(e, o, s, l, t, n);
   }));
  }
  if (t && o && o.$elm$ && !t.hasAttribute("c-id")) {
   const e = t.parentElement;
   if (e && e.childNodes) {
    const n = Array.from(e.childNodes), s = n.find((e => 8 === e.nodeType && e["s-sr"]));
    if (s) {
     const e = n.indexOf(t) - 1;
     o.$elm$.setAttribute("c-id", `${s["s-host-id"]}.${s["s-node-id"]}.0.${e}`);
    }
   }
  }
 }
}, insertChildVNodeAnnotations = (e, t, o, n, s, l) => {
 const a = t.$elm$;
 if (null == a) return;
 const r = o.nodeIds++, i = `${n}.${r}.${s}.${l}`;
 if (a["s-host-id"] = n, a["s-node-id"] = r, 1 === a.nodeType) a.setAttribute("c-id", i); else if (3 === a.nodeType) {
  const t = a.parentNode, o = t.nodeName;
  if ("STYLE" !== o && "SCRIPT" !== o) {
   const o = `t.${i}`, n = e.createComment(o);
   t.insertBefore(n, a);
  }
 } else if (8 === a.nodeType && a["s-sr"]) {
  const e = `s.${i}.${a["s-sn"] || ""}`;
  a.nodeValue = e;
 }
 if (null != t.$children$) {
  const l = s + 1;
  t.$children$.forEach(((t, s) => {
   insertChildVNodeAnnotations(e, t, o, n, l, s);
  }));
 }
}, NO_HYDRATE_TAGS = new Set([ "CODE", "HEAD", "IFRAME", "INPUT", "OBJECT", "OUTPUT", "NOSCRIPT", "PRE", "SCRIPT", "SELECT", "STYLE", "TEMPLATE", "TEXTAREA" ]), hAsync = (e, t, ...o) => {
 if (Array.isArray(o) && o.length > 0) {
  const n = o.flat(1 / 0);
  return n.some(isPromise) ? Promise.all(n).then((o => h(e, t, ...o))).catch((o => h(e, t))) : h(e, t, ...o);
 }
 return h(e, t);
};

const cmpModules = new Map, getModule = e => {
 if ("string" == typeof e) {
  e = e.toLowerCase();
  const t = cmpModules.get(e);
  if (null != t) return t[e];
 }
 return null;
}, loadModule = (e, t, o) => getModule(e.$tagName$), isMemberInElement = (e, t) => {
 if (null != e) {
  if (t in e) return !0;
  const o = getModule(e.nodeName);
  if (null != o) {
   const e = o;
   if (null != e && null != e.cmpMeta && null != e.cmpMeta.$members$) return t in e.cmpMeta.$members$;
  }
 }
 return !1;
}, registerComponents = e => {
 for (const t of e) {
  const e = t.cmpMeta.$tagName$;
  cmpModules.set(e, {
   [e]: t
  });
 }
}, win = window, doc = win.document, writeTask = e => {
 process.nextTick((() => {
  try {
   e();
  } catch (e) {
   consoleError(e);
  }
 }));
}, resolved = Promise.resolve(), nextTick = e => resolved.then(e), defaultConsoleError = e => {
 null != e && console.error(e.stack || e.message || e);
}, consoleError = (e, t) => (defaultConsoleError)(e, t), plt = {
 $flags$: 0,
 $resourcesUrl$: "",
 jmp: e => e(),
 raf: e => requestAnimationFrame(e),
 ael: (e, t, o, n) => e.addEventListener(t, o, n),
 rel: (e, t, o, n) => e.removeEventListener(t, o, n),
 ce: (e, t) => new win.CustomEvent(e, t)
}, supportsShadow = !1, hostRefs = new WeakMap, getHostRef = e => hostRefs.get(e), registerInstance = (e, t) => hostRefs.set(t.$lazyInstance$ = e, t), registerHost = (e, t) => {
 const o = {
  $flags$: 0,
  $cmpMeta$: t,
  $hostElement$: e,
  $instanceValues$: new Map,
  $renderCount$: 0
 };
 return o.$onInstancePromise$ = new Promise((e => o.$onInstanceResolve$ = e)), o.$onReadyPromise$ = new Promise((e => o.$onReadyResolve$ = e)), 
 e["s-p"] = [], e["s-rc"] = [], addHostEventListeners(e, o, t.$listeners$), hostRefs.set(e, o);
}, styles = new Map;

const calloutCss = ":root{--color-blue-100:rgb(247, 248, 249);--color-blue-200:rgb(178, 190, 201);--color-blue-300:rgb(76, 103, 129);--color-blue-400:rgb(0, 39, 76);--color-blue-500:rgb(0, 19, 36);--color-maize-100:rgb(255, 249, 230);--color-maize-200:rgb(255, 234, 155);--color-maize-300:rgb(255, 218, 80);--color-maize-400:rgb(255, 203, 5);--color-maize-500:rgb(234, 186, 2);--color-neutral-100:rgb(229, 233, 237);--color-neutral-200:rgb(138, 150, 161);--color-neutral-300:rgb(99, 115, 129);--color-neutral-400:rgb(33, 43, 54);--color-neutral-500:rgb(6, 8, 10);--color-teal-100:rgb(233, 242, 245);--color-teal-200:rgb(167, 205, 219);--color-teal-300:rgb(101, 168, 191);--color-teal-400:rgb(29, 116, 145);--color-teal-500:rgb(16, 102, 132);--color-orange-100:rgb(255, 241, 235);--color-orange-200:rgb(255, 184, 153);--color-orange-300:rgb(255, 138, 88);--color-orange-400:rgb(242, 95, 31);--color-orange-500:rgb(199, 78, 26);--color-pink-100:rgb(252, 235, 235);--color-pink-200:rgb(242, 157, 157);--color-pink-300:rgb(236, 105, 105);--color-pink-400:rgb(217, 56, 56);--color-pink-500:rgb(191, 50, 50);--color-indigo-100:rgb(238, 241, 249);--color-indigo-200:rgb(170, 185, 227);--color-indigo-300:rgb(124, 147, 212);--color-indigo-400:rgb(80, 111, 197);--color-indigo-500:rgb(39, 67, 145);--color-green-100:rgb(234, 248, 238);--color-green-200:rgb(150, 219, 170);--color-green-300:rgb(87, 188, 117);--color-green-400:rgb(32, 168, 72);--color-green-500:rgb(25, 133, 57);--font-base-family:'Muli', sans-serif;--font-second-family:'Crimson Text', serif;--bold:700;--regular:400;--semibold:600;--extrabold:800;--line-height-default:1.5;--line-height-heading:1.25;--line-height-page-heading:1.125;--text-base-size:16px;--text-xxx-large:3.5rem;--text-xx-large:2.25rem;--text-x-large:2rem;--text-large:1.75rem;--text-medium:1.5rem;--text-small:1.125rem;--text-x-small:1.125rem;--text-xx-small:1rem;--text-xxx-small:0.875rem;--space-xxx-small:2px;--space-xx-small:4px;--space-x-small:8px;--space-small:12px;--space-medium:16px;--space-large:24px;--space-x-large:32px;--space-xx-large:40px;--space-xxx-large:48px;--space-xxxx-large:64px;--space-xxxxx-large:96px;--z-space-small:rgba(0, 0, 0, 0.2) 0px 2px 8px 0px;--z-space-medium:rgba(0, 0, 0, 0.2) 0px 2px 16px 0px;--opacity-75:0.75;--opacity-50:0.50;--opacity-30:0.30;--radius-default:4px;--line-length:60ch}m-callout{display:block;margin-bottom:var(--space-large)}.m-callout__inner-container>*:first-child{margin-top:0}.m-callout__inner-container>*:last-child{margin-bottom:0}.m-callout{background:var(--color-teal-100);border-left:solid 1px var(--color-teal-400);padding:var(--space-medium) var(--space-large);border-radius:4px;border-left-width:4px;display:grid;grid-gap:var(--space-medium);grid-template-columns:1fr auto}.m-callout>m-icon{line-height:1;align-self:center}.m-callout svg{color:var(--color-teal-400);line-height:0}.m-callout--with-icon{display:grid;grid-gap:var(--space-medium);grid-template-columns:auto 1fr auto}.m-callout--success{background:var(--color-green-100);border-color:var(--color-green-400)}.m-callout--success svg{color:var(--color-green-500)}.m-callout--warning{background:var(--color-maize-100);border-color:var(--color-maize-400)}.m-callout--warning svg{color:var(--color-maize-400)}.m-callout--error{background:var(--color-pink-100);border-color:var(--color-pink-400)}.m-callout--error svg{color:var(--color-pink-500)}.m-callout__dismiss{all:unset;text-decoration:underline;text-decoration-thickness:1px;padding:var(--space-medium) var(--space-large);margin:calc(-1 * var(--space-medium)) calc(-1 * var(--space-large));margin-left:0}.m-callout__dismiss:hover{text-decoration-thickness:2px;cursor:pointer}.m-callout--subtle{background:none !important;border-top:solid 1px var(--color-neutral-100);border-right:solid 1px var(--color-neutral-100);border-bottom:solid 1px var(--color-neutral-100)}.m-callout__title+*{margin-top:var(--space-x-small)}@media (max-width: 720px){.m-callout,.m-callout--with-icon{grid-template-columns:1fr !important}.m-callout__dismiss{padding:var(--space-medium) 0}}";

/**
 * @name Callout
 * @description For communicating important messages in a user's workflow.
 */
class Callout {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    /**
     * Sets the overall callout visual style, such as colors.
     * */
    this.variant = 'info';
    /**
     * Makes this dismissable by the user with a button.
     */
    this.dismissable = false;
    /**
     * Makes the element visually less strong by removing the background color.
     */
    this.subtle = false;
    this.dismissed = false;
  }
  dismiss(e) {
    e.preventDefault();
    this.dismissed = true;
  }
  getIcon() {
    if (this.icon && this.icon.length > 0 && this.icon !== 'default') {
      return this.icon;
    }
    if (typeof this.icon === 'string' &&
      (this.icon.length === 0 || this.icon === 'default')) {
      switch (this.variant) {
        case 'success':
          return 'check';
        case 'critical':
          return 'error';
        case 'warning':
          return 'warning';
        default:
          return 'info';
      }
    }
    return false;
  }
  render() {
    const stateClassName = this.variant === 'info' ?
      '' : `m-callout--${this.variant}`;
    if (this.dismissed) {
      return null;
    }
    const icon = this.getIcon();
    return (hAsync("div", { class: `m-callout ${stateClassName}
          ${icon && 'm-callout--with-icon'}
          ${this.subtle && 'm-callout--subtle'}
          `, role: "presentation" }, icon && (hAsync("m-icon", { name: icon, size: "24" })), hAsync("div", { role: "presentation", class: "m-callout__inner-container" }, this.label && (hAsync("strong", { class: "m-callout__label" }, "Important")), hAsync("slot", null)), this.dismissable &&
      hAsync("button", { onClick: (e) => this.dismiss(e), class: "m-callout__dismiss" }, "Dismiss")));
  }
  static get style() { return calloutCss; }
  static get cmpMeta() { return {
    "$flags$": 4,
    "$tagName$": "m-callout",
    "$members$": {
      "variant": [1],
      "dismissable": [4],
      "icon": [8],
      "label": [1],
      "subtle": [4],
      "dismissed": [32]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

function createCommonjsModule(fn, basedir, module) {
	return module = {
		path: basedir,
		exports: {},
		require: function (path, base) {
			return commonjsRequire();
		}
	}, fn(module, module.exports), module.exports;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var classnames = createCommonjsModule(function (module) {
/*!
  Copyright (c) 2018 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {

	var hasOwn = {}.hasOwnProperty;

	function classNames() {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg)) {
				if (arg.length) {
					var inner = classNames.apply(null, arg);
					if (inner) {
						classes.push(inner);
					}
				}
			} else if (argType === 'object') {
				if (arg.toString === Object.prototype.toString) {
					for (var key in arg) {
						if (hasOwn.call(arg, key) && arg[key]) {
							classes.push(key);
						}
					}
				} else {
					classes.push(arg.toString());
				}
			}
		}

		return classes.join(' ');
	}

	if (module.exports) {
		classNames.default = classNames;
		module.exports = classNames;
	} else {
		window.classNames = classNames;
	}
}());
});

const chatCss = "/*!@:root*/.sc-m-chat:root{--color-blue-100:rgb(247, 248, 249);--color-blue-200:rgb(178, 190, 201);--color-blue-300:rgb(76, 103, 129);--color-blue-400:rgb(0, 39, 76);--color-blue-500:rgb(0, 19, 36);--color-maize-100:rgb(255, 249, 230);--color-maize-200:rgb(255, 234, 155);--color-maize-300:rgb(255, 218, 80);--color-maize-400:rgb(255, 203, 5);--color-maize-500:rgb(234, 186, 2);--color-neutral-100:rgb(229, 233, 237);--color-neutral-200:rgb(138, 150, 161);--color-neutral-300:rgb(99, 115, 129);--color-neutral-400:rgb(33, 43, 54);--color-neutral-500:rgb(6, 8, 10);--color-teal-100:rgb(233, 242, 245);--color-teal-200:rgb(167, 205, 219);--color-teal-300:rgb(101, 168, 191);--color-teal-400:rgb(29, 116, 145);--color-teal-500:rgb(16, 102, 132);--color-orange-100:rgb(255, 241, 235);--color-orange-200:rgb(255, 184, 153);--color-orange-300:rgb(255, 138, 88);--color-orange-400:rgb(242, 95, 31);--color-orange-500:rgb(199, 78, 26);--color-pink-100:rgb(252, 235, 235);--color-pink-200:rgb(242, 157, 157);--color-pink-300:rgb(236, 105, 105);--color-pink-400:rgb(217, 56, 56);--color-pink-500:rgb(191, 50, 50);--color-indigo-100:rgb(238, 241, 249);--color-indigo-200:rgb(170, 185, 227);--color-indigo-300:rgb(124, 147, 212);--color-indigo-400:rgb(80, 111, 197);--color-indigo-500:rgb(39, 67, 145);--color-green-100:rgb(234, 248, 238);--color-green-200:rgb(150, 219, 170);--color-green-300:rgb(87, 188, 117);--color-green-400:rgb(32, 168, 72);--color-green-500:rgb(25, 133, 57);--font-base-family:'Muli', sans-serif;--font-second-family:'Crimson Text', serif;--bold:700;--regular:400;--semibold:600;--extrabold:800;--line-height-default:1.5;--line-height-heading:1.25;--line-height-page-heading:1.125;--text-base-size:16px;--text-xxx-large:3.5rem;--text-xx-large:2.25rem;--text-x-large:2rem;--text-large:1.75rem;--text-medium:1.5rem;--text-small:1.125rem;--text-x-small:1.125rem;--text-xx-small:1rem;--text-xxx-small:0.875rem;--space-xxx-small:2px;--space-xx-small:4px;--space-x-small:8px;--space-small:12px;--space-medium:16px;--space-large:24px;--space-x-large:32px;--space-xx-large:40px;--space-xxx-large:48px;--space-xxxx-large:64px;--space-xxxxx-large:96px;--z-space-small:rgba(0, 0, 0, 0.2) 0px 2px 8px 0px;--z-space-medium:rgba(0, 0, 0, 0.2) 0px 2px 16px 0px;--opacity-75:0.75;--opacity-50:0.50;--opacity-30:0.30;--radius-default:4px;--line-length:60ch}/*!@:host*/.sc-m-chat-h{--chat-width:calc(var(--space-medium) * 20);font-size:16px}/*!@.m-chat*/.m-chat.sc-m-chat{position:fixed;right:4vw;bottom:0;border-radius:2px 2px 0 0;border-top:solid 2px var(--color-maize-400);box-shadow:var(--z-space-medium);width:calc(var(--space-medium) * 14);transition:width 0.25s;max-width:calc(100% - 8vw);background:white;z-index:10000}/*!@.m-chat.m-chat--open*/.m-chat.m-chat--open.sc-m-chat{width:var(--chat-width)}/*!@.m-chat__button*/.m-chat__button.sc-m-chat{border:none;background:none;outline:0;font-size:var(--font-base-size);color:var(--color-neutral-400);text-align:left;height:39px;width:100%;padding:0 var(--space-medium);display:flex;align-items:center;cursor:pointer;border-radius:2px 2px 0 0;margin-bottom:3px}/*!@.m-chat__svg*/.m-chat__svg.sc-m-chat{width:32px;height:32px;flex-shrink:0}/*!@.m-chat__icons*/.m-chat__icons.sc-m-chat{line-height:0}/*!@.m-chat__button:focus*/.m-chat__button.sc-m-chat:focus{outline:none;box-shadow:0 0 0 2px var(--color-maize-400), 0 0 0 3px var(--color-neutral-400)}/*!@.m-chat__iframe*/.m-chat__iframe.sc-m-chat{width:100%;height:100%;border:none}@media only screen and (min-width: 600px){/*!@.m-chat__iframe*/.m-chat__iframe.sc-m-chat{width:var(--chat-width)}}/*!@.m-chat__label*/.m-chat__label.sc-m-chat{font-family:var(--font-base-family);display:inline-block;width:100%;padding:0 var(--space-small)}/*!@.m-chat__button:hover .m-chat__label*/.m-chat__button.sc-m-chat:hover .m-chat__label.sc-m-chat{text-decoration:underline}/*!@.m-chat__window*/.m-chat__window.sc-m-chat{background:white;max-height:90vh;height:0;opacity:0;overflow:hidden;transition:height 0.25s, opacity 0.25s}/*!@.m-chat--open .m-chat__window*/.m-chat--open.sc-m-chat .m-chat__window.sc-m-chat{opacity:1;height:calc(var(--space-medium) * 24)}/*!@.m-chat__offline*/.m-chat__offline.sc-m-chat{line-height:1.5;font-family:var(--font-base-family);padding:0 var(--space-medium)}/*!@.m-chat__offline strong*/.m-chat__offline.sc-m-chat strong.sc-m-chat{font-weight:700}/*!@.m-chat__offline a,\n.m-chat__offline a:hover*/.m-chat__offline.sc-m-chat a.sc-m-chat,.m-chat__offline.sc-m-chat a.sc-m-chat:hover{color:var(--color-teal-400)}/*!@.m-chat__offline-msg*/.m-chat__offline-msg.sc-m-chat{border-radius:4px;background:var(--color-blue-100);padding:var(--space-medium)}";

/**
 * @name Chat
 * @description The Chat component provides access to the Ask a Librarian live chat service.
 * @status production
 * @whenToUse Contact the Design System team and we will coordinate with Ask a Librarian staff about your use case.
 * @whenNotToUse If your website is not being hosted on lib.umich.edu.
 * @usedBy
 * - [Library Website](https://www.lib.umich.edu/)
 * - [Library Search](https://search.lib.umich.edu/)
 */
class Chat {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.open = false;
    /**
     * Default to online since the Ask a Librarian
     * iframe will have a fallback offline message.
     *
     * This state will be an enhancement to the
     * out-of-box offline message.
     */
    this.online = true;
  }
  toggle() {
    this.open = !this.open;
  }
  isOnline() {
    fetch("https://libraryh3lp-com.proxy.lib.umich.edu/presence/jid/umlibraryaskalibrarian/chat.libraryh3lp.com/text")
      .then(response => response.text())
      .then(result => {
      this.online = result === "available";
    })
      .catch(e => {
      console.warn("Unable to check Chat online status.", e);
    });
  }
  componentWillLoad() {
    this.isOnline();
    setInterval(this.isOnline, 60000);
  }
  render() {
    return (hAsync("div", { class: classnames("m-chat", {
        "m-chat--open": this.open
      }), role: "log" }, hAsync("button", { class: "m-chat__button", "aria-expanded": String(this.open), onClick: () => this.toggle() }, hAsync(ChatIcon, null), hAsync("span", { class: "m-chat__label" }, "Ask a Librarian"), hAsync("div", { "aria-hidden": "true", class: "m-chat__icons" }, !this.open ? (hAsync("svg", { width: "24px", height: "24px", viewBox: "0 0 24 24", class: "m-chat__open-icon", "aria-hidden": "true", focusable: "false" }, hAsync("path", { d: "M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" }))) : (hAsync("svg", { width: "24px", height: "24px", viewBox: "0 0 24 24", class: "m-chat__close-icon", "aria-hidden": "true", focusable: "false" }, hAsync("path", { d: "M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" }))))), hAsync("div", { class: "m-chat__window" }, this.online ? (hAsync("iframe", { class: "m-chat__iframe", title: "Ask a Librarian", src: "https://libraryh3lp.com/chat/umlibraryaskalibrarian@chat.libraryh3lp.com?skin=27279" })) : (hAsync("div", { class: "m-chat__offline" }, hAsync("p", { class: "m-chat__offline-msg" }, "We're ", hAsync("strong", null, "offline"), " right now, but you can", " ", hAsync("a", { href: "https://www.lib.umich.edu/ask-librarian" }, "view our hours and more ways to get in touch"), "."))))));
  }
  static get style() { return chatCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "m-chat",
    "$members$": {
      "open": [32],
      "online": [32]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}
function ChatIcon() {
  return (hAsync("svg", { height: "24", viewBox: "0 0 24 24", width: "24", class: "m-chat__svg", "aria-hidden": "false", focusable: "false" }, hAsync("path", { d: "m15.65 15.92v1.88a1.44 1.44 0 0 1 -.43 1 1.37 1.37 0 0 1 -1 .44h-10.3l-2.92 2.96v-13.2a1.39 1.39 0 0 1 .42-1 1.36 1.36 0 0 1 1-.43h5.93v6.9a1.4 1.4 0 0 0 .43 1 1.33 1.33 0 0 0 1 .44z", fill: "#ffcc06" }), hAsync("path", { d: "m21.53 4.24a1.45 1.45 0 0 1 1.47 1.45v13.2l-2.95-2.89h-10.28a1.37 1.37 0 0 1 -1-.44 1.47 1.47 0 0 1 -.42-1v-8.87a1.43 1.43 0 0 1 .42-1 1.39 1.39 0 0 1 1-.42z", fill: "#10284b" })));
}

const icons={"3d-rotation":{"name":"3d-rotation","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7.52 21.48C4.25 19.94 1.91 16.76 1.55 13H.05C.56 19.16 5.71 24 12 24l.66-.03-3.81-3.81-1.33 1.32zm.89-6.52c-.19 0-.37-.03-.52-.08-.16-.06-.29-.13-.4-.24-.11-.1-.2-.22-.26-.37-.06-.14-.09-.3-.09-.47h-1.3c0 .36.07.68.21.95.14.27.33.5.56.69.24.18.51.32.82.41.3.1.62.15.96.15.37 0 .72-.05 1.03-.15.32-.1.6-.25.83-.44s.42-.43.55-.72c.13-.29.2-.61.2-.97 0-.19-.02-.38-.07-.56-.05-.18-.12-.35-.23-.51-.1-.16-.24-.3-.4-.43-.17-.13-.37-.23-.61-.31.2-.09.37-.2.52-.33.15-.13.27-.27.37-.42.1-.15.17-.3.22-.46.05-.16.07-.32.07-.48 0-.36-.06-.68-.18-.96-.12-.28-.29-.51-.51-.69-.2-.19-.47-.33-.77-.43C9.1 8.05 8.76 8 8.39 8c-.36 0-.69.05-1 .16-.3.11-.57.26-.79.45-.21.19-.38.41-.51.67-.12.26-.18.54-.18.85h1.3c0-.17.03-.32.09-.45s.14-.25.25-.34c.11-.09.23-.17.38-.22.15-.05.3-.08.48-.08.4 0 .7.1.89.31.19.2.29.49.29.86 0 .18-.03.34-.08.49-.05.15-.14.27-.25.37-.11.1-.25.18-.41.24-.16.06-.36.09-.58.09H7.5v1.03h.77c.22 0 .42.02.6.07s.33.13.45.23c.12.11.22.24.29.4.07.16.1.35.1.57 0 .41-.12.72-.35.93-.23.23-.55.33-.95.33zm8.55-5.92c-.32-.33-.7-.59-1.14-.77-.43-.18-.92-.27-1.46-.27H12v8h2.3c.55 0 1.06-.09 1.51-.27.45-.18.84-.43 1.16-.76.32-.33.57-.73.74-1.19.17-.47.26-.99.26-1.57v-.4c0-.58-.09-1.1-.26-1.57-.18-.47-.43-.87-.75-1.2zm-.39 3.16c0 .42-.05.79-.14 1.13-.1.33-.24.62-.43.85-.19.23-.43.41-.71.53-.29.12-.62.18-.99.18h-.91V9.12h.97c.72 0 1.27.23 1.64.69.38.46.57 1.12.57 1.99v.4zM12 0l-.66.03 3.81 3.81 1.33-1.33c3.27 1.55 5.61 4.72 5.96 8.48h1.5C23.44 4.84 18.29 0 12 0z\"/></svg>"},"ac-unit":{"name":"ac-unit","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L17.83 13H22z\"/></svg>"},"access-alarm":{"name":"access-alarm","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12.5 8H11v6l4.75 2.85.75-1.23-4-2.37V8zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z\"/></svg>"},"access-alarms":{"name":"access-alarms","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 5.7l-4.6-3.9-1.3 1.5 4.6 3.9L22 5.7zM7.9 3.4L6.6 1.9 2 5.7l1.3 1.5 4.6-3.8zM12.5 8H11v6l4.7 2.9.8-1.2-4-2.4V8zM12 4c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 16c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7z\"/></svg>"},"access-time":{"name":"access-time","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z\"/></svg>"},"accessibility":{"name":"accessibility","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z\"/></svg>"},"accessible":{"name":"accessible","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"4\" r=\"2\"/><path d=\"M19 13v-2c-1.54.02-3.09-.75-4.07-1.83l-1.29-1.43c-.17-.19-.38-.34-.61-.45-.01 0-.01-.01-.02-.01H13c-.35-.2-.75-.3-1.19-.26C10.76 7.11 10 8.04 10 9.09V15c0 1.1.9 2 2 2h5v5h2v-5.5c0-1.1-.9-2-2-2h-3v-3.45c1.29 1.07 3.25 1.94 5 1.95zm-6.17 5c-.41 1.16-1.52 2-2.83 2-1.66 0-3-1.34-3-3 0-1.31.84-2.41 2-2.83V12.1c-2.28.46-4 2.48-4 4.9 0 2.76 2.24 5 5 5 2.42 0 4.44-1.72 4.9-4h-2.07z\"/></svg>"},"account-balance-wallet":{"name":"account-balance-wallet","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z\"/></svg>"},"account-balance":{"name":"account-balance","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z\"/></svg>"},"account-box":{"name":"account-box","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2zm12 4c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-9 8c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6v-1z\"/></svg>"},"account-circle":{"name":"account-circle","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z\"/></svg>"},"adb":{"name":"adb","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M5 16c0 3.87 3.13 7 7 7s7-3.13 7-7v-4H5v4zM16.12 4.37l2.1-2.1-.82-.83-2.3 2.31C14.16 3.28 13.12 3 12 3s-2.16.28-3.09.75L6.6 1.44l-.82.83 2.1 2.1C6.14 5.64 5 7.68 5 10v1h14v-1c0-2.32-1.14-4.36-2.88-5.63zM9 9c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z\"/></svg>"},"add-a-photo":{"name":"add-a-photo","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 4V1h2v3h3v2H5v3H3V6H0V4h3zm3 6V7h3V4h7l1.83 2H21c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10h3zm7 9c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-3.2-5c0 1.77 1.43 3.2 3.2 3.2s3.2-1.43 3.2-3.2-1.43-3.2-3.2-3.2-3.2 1.43-3.2 3.2z\"/></svg>"},"add-alarm":{"name":"add-alarm","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm1-11h-2v3H8v2h3v3h2v-3h3v-2h-3V9z\"/></svg>"},"add-alert":{"name":"add-alert","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10.01 21.01c0 1.1.89 1.99 1.99 1.99s1.99-.89 1.99-1.99h-3.98zm8.87-4.19V11c0-3.25-2.25-5.97-5.29-6.69v-.72C13.59 2.71 12.88 2 12 2s-1.59.71-1.59 1.59v.72C7.37 5.03 5.12 7.75 5.12 11v5.82L3 18.94V20h18v-1.06l-2.12-2.12zM16 13.01h-3v3h-2v-3H8V11h3V8h2v3h3v2.01z\"/></svg>"},"add-box":{"name":"add-box","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z\"/></svg>"},"add-circle-outline":{"name":"add-circle-outline","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z\"/></svg>"},"add-circle":{"name":"add-circle","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z\"/></svg>"},"add-location":{"name":"add-location","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm4 8h-3v3h-2v-3H8V8h3V5h2v3h3v2z\"/></svg>"},"add-shopping-cart":{"name":"add-shopping-cart","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z\"/></svg>"},"add-to-photos":{"name":"add-to-photos","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z\"/></svg>"},"add-to-queue":{"name":"add-to-queue","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.11-.9-2-2-2zm0 14H3V5h18v12zm-5-7v2h-3v3h-2v-3H8v-2h3V7h2v3h3z\"/></svg>"},"add":{"name":"add","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z\"/></svg>"},"adjust":{"name":"adjust","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-8c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z\"/></svg>"},"airline-seat-flat-angled":{"name":"airline-seat-flat-angled","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22.25 14.29l-.69 1.89L9.2 11.71l2.08-5.66 8.56 3.09c2.1.76 3.18 3.06 2.41 5.15zM1.5 12.14L8 14.48V19h8v-1.63L20.52 19l.69-1.89-19.02-6.86-.69 1.89zm5.8-1.94c1.49-.72 2.12-2.51 1.41-4C7.99 4.71 6.2 4.08 4.7 4.8c-1.49.71-2.12 2.5-1.4 4 .71 1.49 2.5 2.12 4 1.4z\"/></svg>"},"airline-seat-flat":{"name":"airline-seat-flat","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 11v2H9V7h9c2.21 0 4 1.79 4 4zM2 14v2h6v2h8v-2h6v-2H2zm5.14-1.9c1.16-1.19 1.14-3.08-.04-4.24-1.19-1.16-3.08-1.14-4.24.04-1.16 1.19-1.14 3.08.04 4.24 1.19 1.16 3.08 1.14 4.24-.04z\"/></svg>"},"airline-seat-individual-suite":{"name":"airline-seat-individual-suite","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 13c1.65 0 3-1.35 3-3S8.65 7 7 7s-3 1.35-3 3 1.35 3 3 3zm12-6h-8v7H3V7H1v10h22v-6c0-2.21-1.79-4-4-4z\"/></svg>"},"airline-seat-legroom-extra":{"name":"airline-seat-legroom-extra","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 12V3H2v9c0 2.76 2.24 5 5 5h6v-2H7c-1.66 0-3-1.34-3-3zm18.83 5.24c-.38-.72-1.29-.97-2.03-.63l-1.09.5-3.41-6.98c-.34-.68-1.03-1.12-1.79-1.12L11 9V3H5v8c0 1.66 1.34 3 3 3h7l3.41 7 3.72-1.7c.77-.36 1.1-1.3.7-2.06z\"/></svg>"},"airline-seat-legroom-normal":{"name":"airline-seat-legroom-normal","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M5 12V3H3v9c0 2.76 2.24 5 5 5h6v-2H8c-1.66 0-3-1.34-3-3zm15.5 6H19v-7c0-1.1-.9-2-2-2h-5V3H6v8c0 1.65 1.35 3 3 3h7v7h4.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z\"/></svg>"},"airline-seat-legroom-reduced":{"name":"airline-seat-legroom-reduced","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.97 19.2c.18.96-.55 1.8-1.47 1.8H14v-3l1-4H9c-1.65 0-3-1.35-3-3V3h6v6h5c1.1 0 2 .9 2 2l-2 7h1.44c.73 0 1.39.49 1.53 1.2zM5 12V3H3v9c0 2.76 2.24 5 5 5h4v-2H8c-1.66 0-3-1.34-3-3z\"/></svg>"},"airline-seat-recline-extra":{"name":"airline-seat-recline-extra","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M5.35 5.64c-.9-.64-1.12-1.88-.49-2.79.63-.9 1.88-1.12 2.79-.49.9.64 1.12 1.88.49 2.79-.64.9-1.88 1.12-2.79.49zM16 19H8.93c-1.48 0-2.74-1.08-2.96-2.54L4 7H2l1.99 9.76C4.37 19.2 6.47 21 8.94 21H16v-2zm.23-4h-4.88l-1.03-4.1c1.58.89 3.28 1.54 5.15 1.22V9.99c-1.63.31-3.44-.27-4.69-1.25L9.14 7.47c-.23-.18-.49-.3-.76-.38-.32-.09-.66-.12-.99-.06h-.02c-1.23.22-2.05 1.39-1.84 2.61l1.35 5.92C7.16 16.98 8.39 18 9.83 18h6.85l3.82 3 1.5-1.5-5.77-4.5z\"/></svg>"},"airline-seat-recline-normal":{"name":"airline-seat-recline-normal","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7.59 5.41c-.78-.78-.78-2.05 0-2.83.78-.78 2.05-.78 2.83 0 .78.78.78 2.05 0 2.83-.79.79-2.05.79-2.83 0zM6 16V7H4v9c0 2.76 2.24 5 5 5h6v-2H9c-1.66 0-3-1.34-3-3zm14 4.07L14.93 15H11.5v-3.68c1.4 1.15 3.6 2.16 5.5 2.16v-2.16c-1.66.02-3.61-.87-4.67-2.04l-1.4-1.55c-.19-.21-.43-.38-.69-.5-.29-.14-.62-.23-.96-.23h-.03C8.01 7 7 8.01 7 9.25V15c0 1.66 1.34 3 3 3h5.07l3.5 3.5L20 20.07z\"/></svg>"},"airplanemode-active":{"name":"airplanemode-active","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10.18 9\"/><path d=\"M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z\"/></svg>"},"airplanemode-inactive":{"name":"airplanemode-inactive","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13 9V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5v3.68l7.83 7.83L21 16v-2l-8-5zM3 5.27l4.99 4.99L2 14v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-3.73L18.73 21 20 19.73 4.27 4 3 5.27z\"/></svg>"},"airplay":{"name":"airplay","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6 22h12l-6-6zM21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v-2H3V5h18v12h-4v2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z\"/></svg>"},"airport-shuttle":{"name":"airport-shuttle","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 5H3c-1.1 0-2 .89-2 2v9h2c0 1.65 1.34 3 3 3s3-1.35 3-3h5.5c0 1.65 1.34 3 3 3s3-1.35 3-3H23v-5l-6-6zM3 11V7h4v4H3zm3 6.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm7-6.5H9V7h4v4zm4.5 6.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM15 11V7h1l4 4h-5z\"/></svg>"},"alarm-add":{"name":"alarm-add","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm1-11h-2v3H8v2h3v3h2v-3h3v-2h-3V9z\"/></svg>"},"alarm-off":{"name":"alarm-off","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 6c3.87 0 7 3.13 7 7 0 .84-.16 1.65-.43 2.4l1.52 1.52c.58-1.19.91-2.51.91-3.92 0-4.97-4.03-9-9-9-1.41 0-2.73.33-3.92.91L9.6 6.43C10.35 6.16 11.16 6 12 6zm10-.28l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM2.92 2.29L1.65 3.57 2.98 4.9l-1.11.93 1.42 1.42 1.11-.94.8.8C3.83 8.69 3 10.75 3 13c0 4.97 4.02 9 9 9 2.25 0 4.31-.83 5.89-2.2l2.2 2.2 1.27-1.27L3.89 3.27l-.97-.98zm13.55 16.1C15.26 19.39 13.7 20 12 20c-3.87 0-7-3.13-7-7 0-1.7.61-3.26 1.61-4.47l9.86 9.86zM8.02 3.28L6.6 1.86l-.86.71 1.42 1.42.86-.71z\"/></svg>"},"alarm-on":{"name":"alarm-on","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm-1.46-5.47L8.41 12.4l-1.06 1.06 3.18 3.18 6-6-1.06-1.06-4.93 4.95z\"/></svg>"},"alarm":{"name":"alarm","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12.5 8H11v6l4.75 2.85.75-1.23-4-2.37V8zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z\"/></svg>"},"album":{"name":"album","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z\"/></svg>"},"all-inclusive":{"name":"all-inclusive","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L12 10.66 10.48 12h.01L7.8 14.39c-.64.64-1.49.99-2.4.99-1.87 0-3.39-1.51-3.39-3.38S3.53 8.62 5.4 8.62c.91 0 1.76.35 2.44 1.03l1.13 1 1.51-1.34L9.22 8.2C8.2 7.18 6.84 6.62 5.4 6.62 2.42 6.62 0 9.04 0 12s2.42 5.38 5.4 5.38c1.44 0 2.8-.56 3.77-1.53l2.83-2.5.01.01L13.52 12h-.01l2.69-2.39c.64-.64 1.49-.99 2.4-.99 1.87 0 3.39 1.51 3.39 3.38s-1.52 3.38-3.39 3.38c-.9 0-1.76-.35-2.44-1.03l-1.14-1.01-1.51 1.34 1.27 1.12c1.02 1.01 2.37 1.57 3.82 1.57 2.98 0 5.4-2.41 5.4-5.38s-2.42-5.37-5.4-5.37z\"/></svg>"},"all-out":{"name":"all-out","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16.21 4.16l4 4v-4zm4 12l-4 4h4zm-12 4l-4-4v4zm-4-12l4-4h-4zm12.95-.95c-2.73-2.73-7.17-2.73-9.9 0s-2.73 7.17 0 9.9 7.17 2.73 9.9 0 2.73-7.16 0-9.9zm-1.1 8.8c-2.13 2.13-5.57 2.13-7.7 0s-2.13-5.57 0-7.7 5.57-2.13 7.7 0 2.13 5.57 0 7.7z\" fill=\"#010101\"/></svg>"},"android":{"name":"android","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z\"/></svg>"},"announcement":{"name":"announcement","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z\"/></svg>"},"apps":{"name":"apps","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z\"/></svg>"},"archive":{"name":"archive","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z\"/></svg>"},"arrow-back":{"name":"arrow-back","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z\"/></svg>"},"arrow-downward":{"name":"arrow-downward","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill=\"#010101\" d=\"M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z\"/></svg>"},"arrow-drop-down-circle":{"name":"arrow-drop-down-circle","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 12l-4-4h8l-4 4z\"/></svg>"},"arrow-drop-down":{"name":"arrow-drop-down","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 10l5 5 5-5z\"/></svg>"},"arrow-drop-up":{"name":"arrow-drop-up","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 14l5-5 5 5z\"/></svg>"},"arrow-forward":{"name":"arrow-forward","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z\"/></svg>"},"arrow-upward":{"name":"arrow-upward","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z\"/></svg>"},"art-track":{"name":"art-track","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill=\"#010101\" d=\"M22 13h-8v-2h8v2zm0-6h-8v2h8V7zm-8 10h8v-2h-8v2zm-2-8v6c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2zm-1.5 6l-2.25-3-1.75 2.26-1.25-1.51L3.5 15h7z\"/></svg>"},"aspect-ratio":{"name":"aspect-ratio","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z\"/></svg>"},"assessment":{"name":"assessment","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z\"/></svg>"},"assignment-ind":{"name":"assignment-ind","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z\"/></svg>"},"assignment-late":{"name":"assignment-late","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 15h-2v-2h2v2zm0-4h-2V8h2v6zm-1-9c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z\"/></svg>"},"assignment-return":{"name":"assignment-return","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm4 12h-4v3l-5-5 5-5v3h4v4z\"/></svg>"},"assignment-returned":{"name":"assignment-returned","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 15l-5-5h3V9h4v4h3l-5 5z\"/></svg>"},"assignment-turned-in":{"name":"assignment-turned-in","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z\"/></svg>"},"assignment":{"name":"assignment","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z\"/></svg>"},"assistant-photo":{"name":"assistant-photo","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z\"/></svg>"},"assistant":{"name":"assistant","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5.12 10.88L12 17l-1.88-4.12L6 11l4.12-1.88L12 5l1.88 4.12L18 11l-4.12 1.88z\"/></svg>"},"attach-file":{"name":"attach-file","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z\"/></svg>"},"attach-money":{"name":"attach-money","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z\"/></svg>"},"attachment":{"name":"attachment","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M2 12.5C2 9.46 4.46 7 7.5 7H18c2.21 0 4 1.79 4 4s-1.79 4-4 4H9.5C8.12 15 7 13.88 7 12.5S8.12 10 9.5 10H17v2H9.41c-.55 0-.55 1 0 1H18c1.1 0 2-.9 2-2s-.9-2-2-2H7.5C5.57 9 4 10.57 4 12.5S5.57 16 7.5 16H17v2H7.5C4.46 18 2 15.54 2 12.5z\"/></svg>"},"audiotrack":{"name":"audiotrack","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z\"/></svg>"},"autorenew":{"name":"autorenew","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z\"/></svg>"},"av-timer":{"name":"av-timer","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11 17c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1zm0-14v4h2V5.08c3.39.49 6 3.39 6 6.92 0 3.87-3.13 7-7 7s-7-3.13-7-7c0-1.68.59-3.22 1.58-4.42L12 13l1.41-1.41-6.8-6.8v.02C4.42 6.45 3 9.05 3 12c0 4.97 4.02 9 9 9 4.97 0 9-4.03 9-9s-4.03-9-9-9h-1zm7 9c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1zM6 12c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1z\"/></svg>"},"backspace":{"name":"backspace","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z\"/></svg>"},"backup":{"name":"backup","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z\"/></svg>"},"battery-20":{"name":"battery-20","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 17v3.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V17H7z\"/><path fill-opacity=\".3\" d=\"M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V17h10V5.33z\"/></svg>"},"battery-30":{"name":"battery-30","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V15h10V5.33z\"/><path d=\"M7 15v5.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V15H7z\"/></svg>"},"battery-50":{"name":"battery-50","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V13h10V5.33z\"/><path d=\"M7 13v7.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V13H7z\"/></svg>"},"battery-60":{"name":"battery-60","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V11h10V5.33z\"/><path d=\"M7 11v9.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V11H7z\"/></svg>"},"battery-80":{"name":"battery-80","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V9h10V5.33z\"/><path d=\"M7 9v11.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V9H7z\"/></svg>"},"battery-90":{"name":"battery-90","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V8h10V5.33z\"/><path d=\"M7 8v12.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V8H7z\"/></svg>"},"battery-alert":{"name":"battery-alert","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM13 18h-2v-2h2v2zm0-4h-2V9h2v5z\"/></svg>"},"battery-charging-20":{"name":"battery-charging-20","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11 20v-3H7v3.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V17h-4.4L11 20z\"/><path fill-opacity=\".3\" d=\"M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V17h4v-2.5H9L13 7v5.5h2L12.6 17H17V5.33C17 4.6 16.4 4 15.67 4z\"/></svg>"},"battery-charging-30":{"name":"battery-charging-30","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v9.17h2L13 7v5.5h2l-1.07 2H17V5.33C17 4.6 16.4 4 15.67 4z\"/><path d=\"M11 20v-5.5H7v6.17C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V14.5h-3.07L11 20z\"/></svg>"},"battery-charging-50":{"name":"battery-charging-50","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14.47 13.5L11 20v-5.5H9l.53-1H7v7.17C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V13.5h-2.53z\"/><path fill-opacity=\".3\" d=\"M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v8.17h2.53L13 7v5.5h2l-.53 1H17V5.33C17 4.6 16.4 4 15.67 4z\"/></svg>"},"battery-charging-60":{"name":"battery-charging-60","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V11h3.87L13 7v4h4V5.33C17 4.6 16.4 4 15.67 4z\"/><path d=\"M13 12.5h2L11 20v-5.5H9l1.87-3.5H7v9.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V11h-4v1.5z\"/></svg>"},"battery-charging-80":{"name":"battery-charging-80","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V9h4.93L13 7v2h4V5.33C17 4.6 16.4 4 15.67 4z\"/><path d=\"M13 12.5h2L11 20v-5.5H9L11.93 9H7v11.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V9h-4v3.5z\"/></svg>"},"battery-charging-90":{"name":"battery-charging-90","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V8h5.47L13 7v1h4V5.33C17 4.6 16.4 4 15.67 4z\"/><path d=\"M13 12.5h2L11 20v-5.5H9L12.47 8H7v12.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V8h-4v4.5z\"/></svg>"},"battery-charging-full":{"name":"battery-charging-full","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM11 20v-5.5H9L13 7v5.5h2L11 20z\"/></svg>"},"battery-full":{"name":"battery-full","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z\"/></svg>"},"battery-std":{"name":"battery-std","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z\"/></svg>"},"battery-unknown":{"name":"battery-unknown","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zm-2.72 13.95h-1.9v-1.9h1.9v1.9zm1.35-5.26s-.38.42-.67.71c-.48.48-.83 1.15-.83 1.6h-1.6c0-.83.46-1.52.93-2l.93-.94c.27-.27.44-.65.44-1.06 0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5H9c0-1.66 1.34-3 3-3s3 1.34 3 3c0 .66-.27 1.26-.7 1.69z\"/></svg>"},"beach-access":{"name":"beach-access","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13.127 14.56l1.43-1.43 6.44 6.443L19.57 21zm4.293-5.73l2.86-2.86c-3.95-3.95-10.35-3.96-14.3-.02 3.93-1.3 8.31-.25 11.44 2.88zM5.95 5.98c-3.94 3.95-3.93 10.35.02 14.3l2.86-2.86C5.7 14.29 4.65 9.91 5.95 5.98zm.02-.02l-.01.01c-.38 3.01 1.17 6.88 4.3 10.02l5.73-5.73c-3.13-3.13-7.01-4.68-10.02-4.3z\"/></svg>"},"beenhere":{"name":"beenhere","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 1H5c-1.1 0-1.99.9-1.99 2L3 15.93c0 .69.35 1.3.88 1.66L12 23l8.11-5.41c.53-.36.88-.97.88-1.66L21 3c0-1.1-.9-2-2-2zm-9 15l-5-5 1.41-1.41L10 13.17l7.59-7.59L19 7l-9 9z\"/></svg>"},"block":{"name":"block","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z\"/></svg>"},"bluetooth-audio":{"name":"bluetooth-audio","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14.24 12.01l2.32 2.32c.28-.72.44-1.51.44-2.33 0-.82-.16-1.59-.43-2.31l-2.33 2.32zm5.29-5.3l-1.26 1.26c.63 1.21.98 2.57.98 4.02s-.36 2.82-.98 4.02l1.2 1.2c.97-1.54 1.54-3.36 1.54-5.31-.01-1.89-.55-3.67-1.48-5.19zm-3.82 1L10 2H9v7.59L4.41 5 3 6.41 8.59 12 3 17.59 4.41 19 9 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM11 5.83l1.88 1.88L11 9.59V5.83zm1.88 10.46L11 18.17v-3.76l1.88 1.88z\"/></svg>"},"bluetooth-connected":{"name":"bluetooth-connected","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 12l-2-2-2 2 2 2 2-2zm10.71-4.29L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88zM19 10l-2 2 2 2 2-2-2-2z\"/></svg>"},"bluetooth-disabled":{"name":"bluetooth-disabled","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13 5.83l1.88 1.88-1.6 1.6 1.41 1.41 3.02-3.02L12 2h-1v5.03l2 2v-3.2zM5.41 4L4 5.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l4.29-4.29 2.3 2.29L20 18.59 5.41 4zM13 18.17v-3.76l1.88 1.88L13 18.17z\"/></svg>"},"bluetooth-searching":{"name":"bluetooth-searching","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14.24 12.01l2.32 2.32c.28-.72.44-1.51.44-2.33 0-.82-.16-1.59-.43-2.31l-2.33 2.32zm5.29-5.3l-1.26 1.26c.63 1.21.98 2.57.98 4.02s-.36 2.82-.98 4.02l1.2 1.2c.97-1.54 1.54-3.36 1.54-5.31-.01-1.89-.55-3.67-1.48-5.19zm-3.82 1L10 2H9v7.59L4.41 5 3 6.41 8.59 12 3 17.59 4.41 19 9 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM11 5.83l1.88 1.88L11 9.59V5.83zm1.88 10.46L11 18.17v-3.76l1.88 1.88z\"/></svg>"},"bluetooth":{"name":"bluetooth","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z\"/></svg>"},"blur-circular":{"name":"blur-circular","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zM7 9.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm3 7c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm-3-3c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm3-6c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zM14 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0-1.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zm3 6c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm0-4c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm2-3.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm0-3.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z\"/></svg>"},"blur-linear":{"name":"blur-linear","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M5 17.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM9 13c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zM3 21h18v-2H3v2zM5 9.5c.83 0 1.5-.67 1.5-1.5S5.83 6.5 5 6.5 3.5 7.17 3.5 8 4.17 9.5 5 9.5zm0 4c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM9 17c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm8-.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zM3 3v2h18V3H3zm14 5.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zm0 4c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zM13 9c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0 4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0 4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z\"/></svg>"},"blur-off":{"name":"blur-off","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-.2 4.48l.2.02c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5l.02.2c.09.67.61 1.19 1.28 1.28zM14 3.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zm-4 0c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zm11 7c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zM10 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm8 8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-4 13.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zM2.5 5.27l3.78 3.78L6 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1c0-.1-.03-.19-.06-.28l2.81 2.81c-.71.11-1.25.73-1.25 1.47 0 .83.67 1.5 1.5 1.5.74 0 1.36-.54 1.47-1.25l2.81 2.81c-.09-.03-.18-.06-.28-.06-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1c0-.1-.03-.19-.06-.28l3.78 3.78L20 20.23 3.77 4 2.5 5.27zM10 17c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm11-3.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zM6 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zM3 9.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm7 11c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zM6 17c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-3-3.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z\"/></svg>"},"blur-on":{"name":"blur-on","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0-8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-3 .5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zM6 5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm15 5.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zM14 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-3.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zm-11 10c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm7 7c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm0-17c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zM10 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0 5.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm8 .5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0-8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm3 8.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zM14 17c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 3.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm-4-12c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0 8.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm4-4.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-4c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z\"/></svg>"},"book":{"name":"book","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z\"/></svg>"},"bookmark-border":{"name":"bookmark-border","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z\"/></svg>"},"bookmark":{"name":"bookmark","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z\"/></svg>"},"border-all":{"name":"border-all","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 3v18h18V3H3zm8 16H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z\"/></svg>"},"border-bottom":{"name":"border-bottom","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9 11H7v2h2v-2zm4 4h-2v2h2v-2zM9 3H7v2h2V3zm4 8h-2v2h2v-2zM5 3H3v2h2V3zm8 4h-2v2h2V7zm4 4h-2v2h2v-2zm-4-8h-2v2h2V3zm4 0h-2v2h2V3zm2 10h2v-2h-2v2zm0 4h2v-2h-2v2zM5 7H3v2h2V7zm14-4v2h2V3h-2zm0 6h2V7h-2v2zM5 11H3v2h2v-2zM3 21h18v-2H3v2zm2-6H3v2h2v-2z\"/></svg>"},"border-clear":{"name":"border-clear","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 5h2V3H7v2zm0 8h2v-2H7v2zm0 8h2v-2H7v2zm4-4h2v-2h-2v2zm0 4h2v-2h-2v2zm-8 0h2v-2H3v2zm0-4h2v-2H3v2zm0-4h2v-2H3v2zm0-4h2V7H3v2zm0-4h2V3H3v2zm8 8h2v-2h-2v2zm8 4h2v-2h-2v2zm0-4h2v-2h-2v2zm0 8h2v-2h-2v2zm0-12h2V7h-2v2zm-8 0h2V7h-2v2zm8-6v2h2V3h-2zm-8 2h2V3h-2v2zm4 16h2v-2h-2v2zm0-8h2v-2h-2v2zm0-8h2V3h-2v2z\"/></svg>"},"border-color":{"name":"border-color","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17.75 7L14 3.25l-10 10V17h3.75l10-10zm2.96-2.96c.39-.39.39-1.02 0-1.41L18.37.29c-.39-.39-1.02-.39-1.41 0L15 2.25 18.75 6l1.96-1.96z\"/><path fill-opacity=\".36\" d=\"M0 20h24v4H0z\"/></svg>"},"border-horizontal":{"name":"border-horizontal","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 21h2v-2H3v2zM5 7H3v2h2V7zM3 17h2v-2H3v2zm4 4h2v-2H7v2zM5 3H3v2h2V3zm4 0H7v2h2V3zm8 0h-2v2h2V3zm-4 4h-2v2h2V7zm0-4h-2v2h2V3zm6 14h2v-2h-2v2zm-8 4h2v-2h-2v2zm-8-8h18v-2H3v2zM19 3v2h2V3h-2zm0 6h2V7h-2v2zm-8 8h2v-2h-2v2zm4 4h2v-2h-2v2zm4 0h2v-2h-2v2z\"/></svg>"},"border-inner":{"name":"border-inner","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 21h2v-2H3v2zm4 0h2v-2H7v2zM5 7H3v2h2V7zM3 17h2v-2H3v2zM9 3H7v2h2V3zM5 3H3v2h2V3zm12 0h-2v2h2V3zm2 6h2V7h-2v2zm0-6v2h2V3h-2zm-4 18h2v-2h-2v2zM13 3h-2v8H3v2h8v8h2v-8h8v-2h-8V3zm6 18h2v-2h-2v2zm0-4h2v-2h-2v2z\"/></svg>"},"border-left":{"name":"border-left","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11 21h2v-2h-2v2zm0-4h2v-2h-2v2zm0-12h2V3h-2v2zm0 4h2V7h-2v2zm0 4h2v-2h-2v2zm-4 8h2v-2H7v2zM7 5h2V3H7v2zm0 8h2v-2H7v2zm-4 8h2V3H3v18zM19 9h2V7h-2v2zm-4 12h2v-2h-2v2zm4-4h2v-2h-2v2zm0-14v2h2V3h-2zm0 10h2v-2h-2v2zm0 8h2v-2h-2v2zm-4-8h2v-2h-2v2zm0-8h2V3h-2v2z\"/></svg>"},"border-outer":{"name":"border-outer","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13 7h-2v2h2V7zm0 4h-2v2h2v-2zm4 0h-2v2h2v-2zM3 3v18h18V3H3zm16 16H5V5h14v14zm-6-4h-2v2h2v-2zm-4-4H7v2h2v-2z\"/></svg>"},"border-right":{"name":"border-right","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 21h2v-2H7v2zM3 5h2V3H3v2zm4 0h2V3H7v2zm0 8h2v-2H7v2zm-4 8h2v-2H3v2zm8 0h2v-2h-2v2zm-8-8h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm8 8h2v-2h-2v2zm4-4h2v-2h-2v2zm4-10v18h2V3h-2zm-4 18h2v-2h-2v2zm0-16h2V3h-2v2zm-4 8h2v-2h-2v2zm0-8h2V3h-2v2zm0 4h2V7h-2v2z\"/></svg>"},"border-style":{"name":"border-style","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15 21h2v-2h-2v2zm4 0h2v-2h-2v2zM7 21h2v-2H7v2zm4 0h2v-2h-2v2zm8-4h2v-2h-2v2zm0-4h2v-2h-2v2zM3 3v18h2V5h16V3H3zm16 6h2V7h-2v2z\"/></svg>"},"border-top":{"name":"border-top","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 21h2v-2H7v2zm0-8h2v-2H7v2zm4 0h2v-2h-2v2zm0 8h2v-2h-2v2zm-8-4h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2v-2H3v2zm0-4h2V7H3v2zm8 8h2v-2h-2v2zm8-8h2V7h-2v2zm0 4h2v-2h-2v2zM3 3v2h18V3H3zm16 14h2v-2h-2v2zm-4 4h2v-2h-2v2zM11 9h2V7h-2v2zm8 12h2v-2h-2v2zm-4-8h2v-2h-2v2z\"/></svg>"},"border-vertical":{"name":"border-vertical","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 9h2V7H3v2zm0-4h2V3H3v2zm4 16h2v-2H7v2zm0-8h2v-2H7v2zm-4 0h2v-2H3v2zm0 8h2v-2H3v2zm0-4h2v-2H3v2zM7 5h2V3H7v2zm12 12h2v-2h-2v2zm-8 4h2V3h-2v18zm8 0h2v-2h-2v2zm0-8h2v-2h-2v2zm0-10v2h2V3h-2zm0 6h2V7h-2v2zm-4-4h2V3h-2v2zm0 16h2v-2h-2v2zm0-8h2v-2h-2v2z\"/></svg>"},"branding-watermark":{"name":"branding-watermark","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16h-9v-6h9v6z\"/></svg>"},"brightness-1":{"name":"brightness-1","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"10\"/></svg>"},"brightness-2":{"name":"brightness-2","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z\"/></svg>"},"brightness-3":{"name":"brightness-3","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9 2c-1.05 0-2.05.16-3 .46 4.06 1.27 7 5.06 7 9.54 0 4.48-2.94 8.27-7 9.54.95.3 1.95.46 3 .46 5.52 0 10-4.48 10-10S14.52 2 9 2z\"/></svg>"},"brightness-4":{"name":"brightness-4","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-.89 0-1.74-.2-2.5-.55C11.56 16.5 13 14.42 13 12s-1.44-4.5-3.5-5.45C10.26 6.2 11.11 6 12 6c3.31 0 6 2.69 6 6s-2.69 6-6 6z\"/></svg>"},"brightness-5":{"name":"brightness-5","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z\"/></svg>"},"brightness-6":{"name":"brightness-6","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18V6c3.31 0 6 2.69 6 6s-2.69 6-6 6z\"/></svg>"},"brightness-7":{"name":"brightness-7","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z\"/></svg>"},"brightness-auto":{"name":"brightness-auto","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10.85 12.65h2.3L12 9l-1.15 3.65zM20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM14.3 16l-.7-2h-3.2l-.7 2H7.8L11 7h2l3.2 9h-1.9z\"/></svg>"},"brightness-high":{"name":"brightness-high","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z\"/></svg>"},"brightness-low":{"name":"brightness-low","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z\"/></svg>"},"brightness-medium":{"name":"brightness-medium","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18V6c3.31 0 6 2.69 6 6s-2.69 6-6 6z\"/></svg>"},"broken-image":{"name":"broken-image","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 5v6.59l-3-3.01-4 4.01-4-4-4 4-3-3.01V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2zm-3 6.42l3 3.01V19c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-6.58l3 2.99 4-4 4 4 4-3.99z\"/></svg>"},"brush":{"name":"brush","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z\"/></svg>"},"bubble-chart":{"name":"bubble-chart","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><circle cx=\"7.2\" cy=\"14.4\" r=\"3.2\"/><circle cx=\"14.8\" cy=\"18\" r=\"2\"/><circle cx=\"15.2\" cy=\"8.8\" r=\"4.8\"/></svg>"},"bug-report":{"name":"bug-report","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5c-.49 0-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z\"/></svg>"},"build":{"name":"build","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z\"/></svg>"},"burst-mode":{"name":"burst-mode","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M1 5h2v14H1zm4 0h2v14H5zm17 0H10c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zM11 17l2.5-3.15L15.29 16l2.5-3.22L21 17H11z\"/></svg>"},"business-center":{"name":"business-center","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 16v-1H3.01L3 19c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2v-4h-7v1h-4zm10-9h-4.01V5l-2-2h-4l-2 2v2H4c-1.1 0-2 .9-2 2v3c0 1.11.89 2 2 2h6v-2h4v2h6c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-6 0h-4V5h4v2z\"/></svg>"},"business":{"name":"business","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z\"/></svg>"},"cached":{"name":"cached","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z\"/></svg>"},"cake":{"name":"cake","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zm4.6 9.99l-1.07-1.07-1.08 1.07c-1.3 1.3-3.58 1.31-4.89 0l-1.07-1.07-1.09 1.07C6.75 16.64 5.88 17 4.96 17c-.73 0-1.4-.23-1.96-.61V21c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-4.61c-.56.38-1.23.61-1.96.61-.92 0-1.79-.36-2.44-1.01zM18 9h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v1.54c0 1.08.88 1.96 1.96 1.96.52 0 1.02-.2 1.38-.57l2.14-2.13 2.13 2.13c.74.74 2.03.74 2.77 0l2.14-2.13 2.13 2.13c.37.37.86.57 1.38.57 1.08 0 1.96-.88 1.96-1.96V12C21 10.34 19.66 9 18 9z\"/></svg>"},"call-end":{"name":"call-end","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z\"/></svg>"},"call-made":{"name":"call-made","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5z\"/></svg>"},"call-merge":{"name":"call-merge","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 20.41L18.41 19 15 15.59 13.59 17 17 20.41zM7.5 8H11v5.59L5.59 19 7 20.41l6-6V8h3.5L12 3.5 7.5 8z\"/></svg>"},"call-missed-outgoing":{"name":"call-missed-outgoing","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 8.41l9 9 7-7V15h2V7h-8v2h4.59L12 14.59 4.41 7 3 8.41z\"/></svg>"},"call-missed":{"name":"call-missed","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.59 7L12 14.59 6.41 9H11V7H3v8h2v-4.59l7 7 9-9z\"/></svg>"},"call-received":{"name":"call-received","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 5.41L18.59 4 7 15.59V9H5v10h10v-2H8.41z\"/></svg>"},"call-split":{"name":"call-split","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14 4l2.29 2.29-2.88 2.88 1.42 1.42 2.88-2.88L20 10V4zm-4 0H4v6l2.29-2.29 4.71 4.7V20h2v-8.41l-5.29-5.3z\"/></svg>"},"call-to-action":{"name":"call-to-action","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3v-3h18v3z\"/></svg>"},"call":{"name":"call","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z\"/></svg>"},"camera-alt":{"name":"camera-alt","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"3.2\"/><path d=\"M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z\"/></svg>"},"camera-enhance":{"name":"camera-enhance","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-1l1.25-2.75L16 13l-2.75-1.25L12 9l-1.25 2.75L8 13l2.75 1.25z\"/></svg>"},"camera-front":{"name":"camera-front","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 20H5v2h5v2l3-3-3-3v2zm4 0v2h5v-2h-5zM12 8c1.1 0 2-.9 2-2s-.9-2-2-2-1.99.9-1.99 2S10.9 8 12 8zm5-8H7C5.9 0 5 .9 5 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zM7 2h10v10.5c0-1.67-3.33-2.5-5-2.5s-5 .83-5 2.5V2z\"/></svg>"},"camera-rear":{"name":"camera-rear","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 20H5v2h5v2l3-3-3-3v2zm4 0v2h5v-2h-5zm3-20H7C5.9 0 5 .9 5 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zm-5 6c-1.11 0-2-.9-2-2s.89-2 1.99-2 2 .9 2 2C14 5.1 13.1 6 12 6z\"/></svg>"},"camera-roll":{"name":"camera-roll","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14 5c0-1.1-.9-2-2-2h-1V2c0-.55-.45-1-1-1H6c-.55 0-1 .45-1 1v1H4c-1.1 0-2 .9-2 2v15c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2h8V5h-8zm-2 13h-2v-2h2v2zm0-9h-2V7h2v2zm4 9h-2v-2h2v2zm0-9h-2V7h2v2zm4 9h-2v-2h2v2zm0-9h-2V7h2v2z\"/></svg>"},"camera":{"name":"camera","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9.4 10.5l4.77-8.26C13.47 2.09 12.75 2 12 2c-2.4 0-4.6.85-6.32 2.25l3.66 6.35.06-.1zM21.54 9c-.92-2.92-3.15-5.26-6-6.34L11.88 9h9.66zm.26 1h-7.49l.29.5 4.76 8.25C21 16.97 22 14.61 22 12c0-.69-.07-1.35-.2-2zM8.54 12l-3.9-6.75C3.01 7.03 2 9.39 2 12c0 .69.07 1.35.2 2h7.49l-1.15-2zm-6.08 3c.92 2.92 3.15 5.26 6 6.34L12.12 15H2.46zm11.27 0l-3.9 6.76c.7.15 1.42.24 2.17.24 2.4 0 4.6-.85 6.32-2.25l-3.66-6.35-.93 1.6z\"/></svg>"},"cancel":{"name":"cancel","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z\"/></svg>"},"card-giftcard":{"name":"card-giftcard","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z\"/></svg>"},"card-membership":{"name":"card-membership","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h4v5l4-2 4 2v-5h4c1.11 0 2-.89 2-2V4c0-1.11-.89-2-2-2zm0 13H4v-2h16v2zm0-5H4V4h16v6z\"/></svg>"},"card-travel":{"name":"card-travel","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 6h-3V4c0-1.11-.89-2-2-2H9c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM9 4h6v2H9V4zm11 15H4v-2h16v2zm0-5H4V8h3v2h2V8h6v2h2V8h3v6z\"/></svg>"},"casino":{"name":"casino","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm0-9C6.67 9 6 8.33 6 7.5S6.67 6 7.5 6 9 6.67 9 7.5 8.33 9 7.5 9zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-9c-.83 0-1.5-.67-1.5-1.5S15.67 6 16.5 6s1.5.67 1.5 1.5S17.33 9 16.5 9z\"/></svg>"},"cast-connected":{"name":"cast-connected","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm18-7H5v1.63c3.96 1.28 7.09 4.41 8.37 8.37H19V7zM1 10v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11zm20-7H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z\"/></svg>"},"cast":{"name":"cast","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 3H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0-4v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11z\"/></svg>"},"center-focus-strong":{"name":"center-focus-strong","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-7 7H3v4c0 1.1.9 2 2 2h4v-2H5v-4zM5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5zm14-2h-4v2h4v4h2V5c0-1.1-.9-2-2-2zm0 16h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4z\"/></svg>"},"center-focus-weak":{"name":"center-focus-weak","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4zM5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5zm14-2h-4v2h4v4h2V5c0-1.1-.9-2-2-2zm0 16h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z\"/></svg>"},"change-history":{"name":"change-history","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 7.77L18.39 18H5.61L12 7.77M12 4L2 20h20L12 4z\"/></svg>"},"chat-bubble-outline":{"name":"chat-bubble-outline","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z\"/></svg>"},"chat-bubble":{"name":"chat-bubble","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z\"/></svg>"},"chat":{"name":"chat","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z\"/></svg>"},"check-box-outline-blank":{"name":"check-box-outline-blank","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z\"/></svg>"},"check-box":{"name":"check-box","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z\"/></svg>"},"check-circle":{"name":"check-circle","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z\"/></svg>"},"check":{"name":"check","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z\"/></svg>"},"chevron-left":{"name":"chevron-left","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z\"/></svg>"},"chevron-right":{"name":"chevron-right","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z\"/></svg>"},"child-care":{"name":"child-care","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><circle cx=\"14.5\" cy=\"10.5\" r=\"1.25\"/><circle cx=\"9.5\" cy=\"10.5\" r=\"1.25\"/><path d=\"M22.94 12.66c.04-.21.06-.43.06-.66s-.02-.45-.06-.66c-.25-1.51-1.36-2.74-2.81-3.17-.53-1.12-1.28-2.1-2.19-2.91C16.36 3.85 14.28 3 12 3s-4.36.85-5.94 2.26c-.92.81-1.67 1.8-2.19 2.91-1.45.43-2.56 1.65-2.81 3.17-.04.21-.06.43-.06.66s.02.45.06.66c.25 1.51 1.36 2.74 2.81 3.17.52 1.11 1.27 2.09 2.17 2.89C7.62 20.14 9.71 21 12 21s4.38-.86 5.97-2.28c.9-.8 1.65-1.79 2.17-2.89 1.44-.43 2.55-1.65 2.8-3.17zM19 14c-.1 0-.19-.02-.29-.03-.2.67-.49 1.29-.86 1.86C16.6 17.74 14.45 19 12 19s-4.6-1.26-5.85-3.17c-.37-.57-.66-1.19-.86-1.86-.1.01-.19.03-.29.03-1.1 0-2-.9-2-2s.9-2 2-2c.1 0 .19.02.29.03.2-.67.49-1.29.86-1.86C7.4 6.26 9.55 5 12 5s4.6 1.26 5.85 3.17c.37.57.66 1.19.86 1.86.1-.01.19-.03.29-.03 1.1 0 2 .9 2 2s-.9 2-2 2zM7.5 14c.76 1.77 2.49 3 4.5 3s3.74-1.23 4.5-3h-9z\"/></svg>"},"child-friendly":{"name":"child-friendly","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13 2v8h8c0-4.42-3.58-8-8-8zm6.32 13.89C20.37 14.54 21 12.84 21 11H6.44l-.95-2H2v2h2.22s1.89 4.07 2.12 4.42c-1.1.59-1.84 1.75-1.84 3.08C4.5 20.43 6.07 22 8 22c1.76 0 3.22-1.3 3.46-3h2.08c.24 1.7 1.7 3 3.46 3 1.93 0 3.5-1.57 3.5-3.5 0-1.04-.46-1.97-1.18-2.61zM8 20c-.83 0-1.5-.67-1.5-1.5S7.17 17 8 17s1.5.67 1.5 1.5S8.83 20 8 20zm9 0c-.83 0-1.5-.67-1.5-1.5S16.17 17 17 17s1.5.67 1.5 1.5S17.83 20 17 20z\"/></svg>"},"chrome-reader-mode":{"name":"chrome-reader-mode","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13 12h7v1.5h-7zm0-2.5h7V11h-7zm0 5h7V16h-7zM21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 15h-9V6h9v13z\"/></svg>"},"class":{"name":"class","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z\"/></svg>"},"clear-all":{"name":"clear-all","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M5 13h14v-2H5v2zm-2 4h14v-2H3v2zM7 7v2h14V7H7z\"/></svg>"},"clear":{"name":"clear","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z\"/></svg>"},"close":{"name":"close","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z\"/></svg>"},"closed-caption":{"name":"closed-caption","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z\"/></svg>"},"cloud-circle":{"name":"cloud-circle","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14H8c-1.66 0-3-1.34-3-3s1.34-3 3-3l.14.01C8.58 8.28 10.13 7 12 7c2.21 0 4 1.79 4 4h.5c1.38 0 2.5 1.12 2.5 2.5S17.88 16 16.5 16z\"/></svg>"},"cloud-done":{"name":"cloud-done","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 17l-3.5-3.5 1.41-1.41L10 14.17 15.18 9l1.41 1.41L10 17z\"/></svg>"},"cloud-download":{"name":"cloud-download","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z\"/></svg>"},"cloud-off":{"name":"cloud-off","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z\"/></svg>"},"cloud-queue":{"name":"cloud-queue","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h.71C7.37 7.69 9.48 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3s-1.34 3-3 3z\"/></svg>"},"cloud-upload":{"name":"cloud-upload","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z\"/></svg>"},"cloud":{"name":"cloud","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z\"/></svg>"},"code":{"name":"code","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z\"/></svg>"},"collections-bookmark":{"name":"collections-bookmark","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 10l-2.5-1.5L15 12V4h5v8z\"/></svg>"},"collections":{"name":"collections","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z\"/></svg>"},"color-lens":{"name":"color-lens","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z\"/></svg>"},"colorize":{"name":"colorize","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20.71 5.63l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-3.12 3.12-1.93-1.91-1.41 1.41 1.42 1.42L3 16.25V21h4.75l8.92-8.92 1.42 1.42 1.41-1.41-1.92-1.92 3.12-3.12c.4-.4.4-1.03.01-1.42zM6.92 19L5 17.08l8.06-8.06 1.92 1.92L6.92 19z\"/></svg>"},"comment":{"name":"comment","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z\"/></svg>"},"compare-arrows":{"name":"compare-arrows","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9.01 14H2v2h7.01v3L13 15l-3.99-4v3zm5.98-1v-3H22V8h-7.01V5L11 9l3.99 4z\"/></svg>"},"compare":{"name":"compare","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h5v2h2V1h-2v2zm0 15H5l5-6v6zm9-15h-5v2h5v13l-5-6v9h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z\"/></svg>"},"computer":{"name":"computer","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z\"/></svg>"},"confirmation-number":{"name":"confirmation-number","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-9 7.5h-2v-2h2v2zm0-4.5h-2v-2h2v2zm0-4.5h-2v-2h2v2z\"/></svg>"},"contact-mail":{"name":"contact-mail","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 8V7l-3 2-3-2v1l3 2 3-2zm1-5H2C.9 3 0 3.9 0 5v14c0 1.1.9 2 2 2h20c1.1 0 1.99-.9 1.99-2L24 5c0-1.1-.9-2-2-2zM8 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H2v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1zm8-6h-8V6h8v6z\"/></svg>"},"contact-phone":{"name":"contact-phone","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 3H2C.9 3 0 3.9 0 5v14c0 1.1.9 2 2 2h20c1.1 0 1.99-.9 1.99-2L24 5c0-1.1-.9-2-2-2zM8 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H2v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1zm3.85-4h1.64L21 16l-1.99 1.99c-1.31-.98-2.28-2.38-2.73-3.99-.18-.64-.28-1.31-.28-2s.1-1.36.28-2c.45-1.62 1.42-3.01 2.73-3.99L21 8l-1.51 2h-1.64c-.22.63-.35 1.3-.35 2s.13 1.37.35 2z\"/></svg>"},"contacts":{"name":"contacts","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 0H4v2h16V0zM4 24h16v-2H4v2zM20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 2.75c1.24 0 2.25 1.01 2.25 2.25s-1.01 2.25-2.25 2.25S9.75 10.24 9.75 9 10.76 6.75 12 6.75zM17 17H7v-1.5c0-1.67 3.33-2.5 5-2.5s5 .83 5 2.5V17z\"/></svg>"},"content-copy":{"name":"content-copy","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z\"/></svg>"},"content-cut":{"name":"content-cut","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm0 12c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3z\"/></svg>"},"content-paste":{"name":"content-paste","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z\"/></svg>"},"control-point-duplicate":{"name":"control-point-duplicate","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16 8h-2v3h-3v2h3v3h2v-3h3v-2h-3zM2 12c0-2.79 1.64-5.2 4.01-6.32V3.52C2.52 4.76 0 8.09 0 12s2.52 7.24 6.01 8.48v-2.16C3.64 17.2 2 14.79 2 12zm13-9c-4.96 0-9 4.04-9 9s4.04 9 9 9 9-4.04 9-9-4.04-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z\"/></svg>"},"control-point":{"name":"control-point","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z\"/></svg>"},"copyright":{"name":"copyright","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10.08 10.86c.05-.33.16-.62.3-.87s.34-.46.59-.62c.24-.15.54-.22.91-.23.23.01.44.05.63.13.2.09.38.21.52.36s.25.33.34.53.13.42.14.64h1.79c-.02-.47-.11-.9-.28-1.29s-.4-.73-.7-1.01-.66-.5-1.08-.66-.88-.23-1.39-.23c-.65 0-1.22.11-1.7.34s-.88.53-1.2.92-.56.84-.71 1.36S8 11.29 8 11.87v.27c0 .58.08 1.12.23 1.64s.39.97.71 1.35.72.69 1.2.91 1.05.34 1.7.34c.47 0 .91-.08 1.32-.23s.77-.36 1.08-.63.56-.58.74-.94.29-.74.3-1.15h-1.79c-.01.21-.06.4-.15.58s-.21.33-.36.46-.32.23-.52.3c-.19.07-.39.09-.6.1-.36-.01-.66-.08-.89-.23-.25-.16-.45-.37-.59-.62s-.25-.55-.3-.88-.08-.67-.08-1v-.27c0-.35.03-.68.08-1.01zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z\"/></svg>"},"create-new-folder":{"name":"create-new-folder","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 6h-8l-2-2H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-1 8h-3v3h-2v-3h-3v-2h3V9h2v3h3v2z\"/></svg>"},"create":{"name":"create","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z\"/></svg>"},"credit-card":{"name":"credit-card","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z\"/></svg>"},"crop-16-9":{"name":"crop-16-9","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z\"/></svg>"},"crop-3-2":{"name":"crop-3-2","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V6h14v12z\"/></svg>"},"crop-5-4":{"name":"crop-5-4","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 5H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 12H5V7h14v10z\"/></svg>"},"crop-7-5":{"name":"crop-7-5","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z\"/></svg>"},"crop-din":{"name":"crop-din","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z\"/></svg>"},"crop-free":{"name":"crop-free","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 5v4h2V5h4V3H5c-1.1 0-2 .9-2 2zm2 10H3v4c0 1.1.9 2 2 2h4v-2H5v-4zm14 4h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zm0-16h-4v2h4v4h2V5c0-1.1-.9-2-2-2z\"/></svg>"},"crop-landscape":{"name":"crop-landscape","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 5H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 12H5V7h14v10z\"/></svg>"},"crop-original":{"name":"crop-original","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z\"/></svg>"},"crop-portrait":{"name":"crop-portrait","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7V5h10v14z\"/></svg>"},"crop-rotate":{"name":"crop-rotate","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7.47 21.49C4.2 19.93 1.86 16.76 1.5 13H0c.51 6.16 5.66 11 11.95 11 .23 0 .44-.02.66-.03L8.8 20.15l-1.33 1.34zM12.05 0c-.23 0-.44.02-.66.04l3.81 3.81 1.33-1.33C19.8 4.07 22.14 7.24 22.5 11H24c-.51-6.16-5.66-11-11.95-11zM16 14h2V8c0-1.11-.9-2-2-2h-6v2h6v6zm-8 2V4H6v2H4v2h2v8c0 1.1.89 2 2 2h8v2h2v-2h2v-2H8z\"/></svg>"},"crop-square":{"name":"crop-square","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H6V6h12v12z\"/></svg>"},"crop":{"name":"crop","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 15h2V7c0-1.1-.9-2-2-2H9v2h8v8zM7 17V1H5v4H1v2h4v10c0 1.1.9 2 2 2h10v4h2v-4h4v-2H7z\"/></svg>"},"dashboard":{"name":"dashboard","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z\"/></svg>"},"data-usage":{"name":"data-usage","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z\"/></svg>"},"date-range":{"name":"date-range","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z\"/></svg>"},"dehaze":{"name":"dehaze","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M2 15.5v2h20v-2H2zm0-5v2h20v-2H2zm0-5v2h20v-2H2z\"/></svg>"},"delete-forever":{"name":"delete-forever","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z\"/></svg>"},"delete-sweep":{"name":"delete-sweep","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15 16h4v2h-4zm0-8h7v2h-7zm0 4h6v2h-6zM3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10zM14 5h-3l-1-1H6L5 5H2v2h12z\"/></svg>"},"delete":{"name":"delete","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z\"/></svg>"},"description":{"name":"description","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z\"/></svg>"},"desktop-mac":{"name":"desktop-mac","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H3V4h18v10z\"/></svg>"},"desktop-windows":{"name":"desktop-windows","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z\"/></svg>"},"details":{"name":"details","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 4l9 16 9-16H3zm3.38 2h11.25L12 16 6.38 6z\"/></svg>"},"developer-board":{"name":"developer-board","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 9V7h-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2v-2h-2V9h2zm-4 10H4V5h14v14zM6 13h5v4H6zm6-6h4v3h-4zM6 7h5v5H6zm6 4h4v6h-4z\"/></svg>"},"developer-mode":{"name":"developer-mode","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 5h10v2h2V3c0-1.1-.9-1.99-2-1.99L7 1c-1.1 0-2 .9-2 2v4h2V5zm8.41 11.59L20 12l-4.59-4.59L14 8.83 17.17 12 14 15.17l1.41 1.42zM10 15.17L6.83 12 10 8.83 8.59 7.41 4 12l4.59 4.59L10 15.17zM17 19H7v-2H5v4c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-4h-2v2z\"/></svg>"},"device-hub":{"name":"device-hub","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 16l-4-4V8.82C14.16 8.4 15 7.3 15 6c0-1.66-1.34-3-3-3S9 4.34 9 6c0 1.3.84 2.4 2 2.82V12l-4 4H3v5h5v-3.05l4-4.2 4 4.2V21h5v-5h-4z\"/></svg>"},"devices-other":{"name":"devices-other","svg":"<svg focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M3 6h18V4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v-2H3V6zm10 6H9v1.78c-.61.55-1 1.33-1 2.22s.39 1.67 1 2.22V20h4v-1.78c.61-.55 1-1.34 1-2.22s-.39-1.67-1-2.22V12zm-2 5.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM22 8h-6c-.5 0-1 .5-1 1v10c0 .5.5 1 1 1h6c.5 0 1-.5 1-1V9c0-.5-.5-1-1-1zm-1 10h-4v-8h4v8z\"/></svg>"},"devices":{"name":"devices","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z\"/></svg>"},"dialer-sip":{"name":"dialer-sip","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 3h-1v5h1V3zm-2 2h-2V4h2V3h-3v3h2v1h-2v1h3V5zm3-2v5h1V6h2V3h-3zm2 2h-1V4h1v1zm0 10.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.01.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.27-.26.35-.65.24-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z\"/></svg>"},"dialpad":{"name":"dialpad","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 19c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 1c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12-8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-6 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z\"/></svg>"},"directions-bike":{"name":"directions-bike","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z\"/></svg>"},"directions-boat":{"name":"directions-boat","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z\"/></svg>"},"directions-bus":{"name":"directions-bus","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z\"/></svg>"},"directions-car":{"name":"directions-car","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z\"/></svg>"},"directions-railway":{"name":"directions-railway","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 15.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V5c0-3.5-3.58-4-8-4s-8 .5-8 4v10.5zm8 1.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-7H6V5h12v5z\"/></svg>"},"directions-run":{"name":"directions-run","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z\"/></svg>"},"directions-subway":{"name":"directions-subway","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2c-4.42 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm5.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6h-5V6h5v5z\"/></svg>"},"directions-transit":{"name":"directions-transit","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2c-4.42 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm5.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6h-5V6h5v5z\"/></svg>"},"directions-walk":{"name":"directions-walk","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7\"/></svg>"},"directions":{"name":"directions","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21.71 11.29l-9-9c-.39-.39-1.02-.39-1.41 0l-9 9c-.39.39-.39 1.02 0 1.41l9 9c.39.39 1.02.39 1.41 0l9-9c.39-.38.39-1.01 0-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z\"/></svg>"},"disc-full":{"name":"disc-full","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 16h2v-2h-2v2zm0-9v5h2V7h-2zM10 4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z\"/></svg>"},"dns":{"name":"dns","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z\"/></svg>"},"do-not-disturb-alt":{"name":"do-not-disturb-alt","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zM4 12c0-4.4 3.6-8 8-8 1.8 0 3.5.6 4.9 1.7L5.7 16.9C4.6 15.5 4 13.8 4 12zm8 8c-1.8 0-3.5-.6-4.9-1.7L18.3 7.1C19.4 8.5 20 10.2 20 12c0 4.4-3.6 8-8 8z\"/></svg>"},"do-not-disturb-off":{"name":"do-not-disturb-off","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 11v2h-1.46l4.68 4.68C21.34 16.07 22 14.11 22 12c0-5.52-4.48-10-10-10-2.11 0-4.07.66-5.68 1.78L13.54 11H17zM2.27 2.27L1 3.54l2.78 2.78C2.66 7.93 2 9.89 2 12c0 5.52 4.48 10 10 10 2.11 0 4.07-.66 5.68-1.78L20.46 23l1.27-1.27L11 11 2.27 2.27zM7 13v-2h1.46l2 2H7z\"/></svg>"},"do-not-disturb-on":{"name":"do-not-disturb-on","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z\"/></svg>"},"do-not-disturb":{"name":"do-not-disturb","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z\"/></svg>"},"dock":{"name":"dock","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M8 23h8v-2H8v2zm8-21.99L8 1c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM16 15H8V5h8v10z\"/></svg>"},"domain":{"name":"domain","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z\"/></svg>"},"done-all":{"name":"done-all","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z\"/></svg>"},"done":{"name":"done","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z\"/></svg>"},"donut-large":{"name":"donut-large","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11 5.08V2c-5 .5-9 4.81-9 10s4 9.5 9 10v-3.08c-3-.48-6-3.4-6-6.92s3-6.44 6-6.92zM18.97 11H22c-.47-5-4-8.53-9-9v3.08C16 5.51 18.54 8 18.97 11zM13 18.92V22c5-.47 8.53-4 9-9h-3.03c-.43 3-2.97 5.49-5.97 5.92z\"/></svg>"},"donut-small":{"name":"donut-small","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11 9.16V2c-5 .5-9 4.79-9 10s4 9.5 9 10v-7.16c-1-.41-2-1.52-2-2.84s1-2.43 2-2.84zM14.86 11H22c-.48-4.75-4-8.53-9-9v7.16c1 .3 1.52.98 1.86 1.84zM13 14.84V22c5-.47 8.52-4.25 9-9h-7.14c-.34.86-.86 1.54-1.86 1.84z\"/></svg>"},"drafts":{"name":"drafts","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21.99 8c0-.72-.37-1.35-.94-1.7L12 1 2.95 6.3C2.38 6.65 2 7.28 2 8v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2l-.01-10zM12 13L3.74 7.84 12 3l8.26 4.84L12 13z\"/></svg>"},"drag-handle":{"name":"drag-handle","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 9H4v2h16V9zM4 15h16v-2H4v2z\"/></svg>"},"drive-eta":{"name":"drive-eta","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.21.42-1.42 1.01L3 11v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 15c-.83 0-1.5-.67-1.5-1.5S5.67 12 6.5 12s1.5.67 1.5 1.5S7.33 15 6.5 15zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 10l1.5-4.5h11L19 10H5z\"/></svg>"},"dvr":{"name":"dvr","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12zm-2-9H8v2h11V8zm0 4H8v2h11v-2zM7 8H5v2h2V8zm0 4H5v2h2v-2z\"/></svg>"},"edit-location":{"name":"edit-location","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm-1.56 10H9v-1.44l3.35-3.34 1.43 1.43L10.44 12zm4.45-4.45l-.7.7-1.44-1.44.7-.7c.15-.15.39-.15.54 0l.9.9c.15.15.15.39 0 .54z\"/></svg>"},"edit":{"name":"edit","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z\"/></svg>"},"eject":{"name":"eject","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M5 17h14v2H5zm7-12L5.33 15h13.34z\"/></svg>"},"email":{"name":"email","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z\"/></svg>"},"enhanced-encryption":{"name":"enhanced-encryption","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H8.9V6zM16 16h-3v3h-2v-3H8v-2h3v-3h2v3h3v2z\"/></svg>"},"equalizer":{"name":"equalizer","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z\"/></svg>"},"error-outline":{"name":"error-outline","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z\"/></svg>"},"error":{"name":"error","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z\"/></svg>"},"euro-symbol":{"name":"euro-symbol","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15 18.5c-2.51 0-4.68-1.42-5.76-3.5H15v-2H8.58c-.05-.33-.08-.66-.08-1s.03-.67.08-1H15V9H9.24C10.32 6.92 12.5 5.5 15 5.5c1.61 0 3.09.59 4.23 1.57L21 5.3C19.41 3.87 17.3 3 15 3c-3.92 0-7.24 2.51-8.48 6H3v2h3.06c-.04.33-.06.66-.06 1 0 .34.02.67.06 1H3v2h3.52c1.24 3.49 4.56 6 8.48 6 2.31 0 4.41-.87 6-2.3l-1.78-1.77c-1.13.98-2.6 1.57-4.22 1.57z\"/></svg>"},"ev-station":{"name":"ev-station","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM18 10c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM8 18v-4.5H6L10 6v5h2l-4 7z\"/></svg>"},"event-available":{"name":"event-available","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16.53 11.06L15.47 10l-4.88 4.88-2.12-2.12-1.06 1.06L10.59 17l5.94-5.94zM19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z\"/></svg>"},"event-busy":{"name":"event-busy","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9.31 17l2.44-2.44L14.19 17l1.06-1.06-2.44-2.44 2.44-2.44L14.19 10l-2.44 2.44L9.31 10l-1.06 1.06 2.44 2.44-2.44 2.44L9.31 17zM19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z\"/></svg>"},"event-note":{"name":"event-note","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 10H7v2h10v-2zm2-7h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zm-5-5H7v2h7v-2z\"/></svg>"},"event-seat":{"name":"event-seat","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 18v3h3v-3h10v3h3v-6H4zm15-8h3v3h-3zM2 10h3v3H2zm15 3H7V5c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v8z\"/></svg>"},"event":{"name":"event","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z\"/></svg>"},"exit-to-app":{"name":"exit-to-app","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z\"/></svg>"},"expand-less":{"name":"expand-less","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z\"/></svg>"},"expand-more":{"name":"expand-more","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z\"/></svg>"},"explicit":{"name":"explicit","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 6h-4v2h4v2h-4v2h4v2H9V7h6v2z\"/></svg>"},"explore":{"name":"explore","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z\"/></svg>"},"exposure-neg-1":{"name":"exposure-neg-1","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 11v2h8v-2H4zm15 7h-2V7.38L14 8.4V6.7L18.7 5h.3v13z\"/></svg>"},"exposure-neg-2":{"name":"exposure-neg-2","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15.05 16.29l2.86-3.07c.38-.39.72-.79 1.04-1.18.32-.39.59-.78.82-1.17.23-.39.41-.78.54-1.17s.19-.79.19-1.18c0-.53-.09-1.02-.27-1.46-.18-.44-.44-.81-.78-1.11-.34-.31-.77-.54-1.26-.71-.51-.16-1.08-.24-1.72-.24-.69 0-1.31.11-1.85.32-.54.21-1 .51-1.36.88-.37.37-.65.8-.84 1.3-.18.47-.27.97-.28 1.5h2.14c.01-.31.05-.6.13-.87.09-.29.23-.54.4-.75.18-.21.41-.37.68-.49.27-.12.6-.18.96-.18.31 0 .58.05.81.15.23.1.43.25.59.43.16.18.28.4.37.65.08.25.13.52.13.81 0 .22-.03.43-.08.65-.06.22-.15.45-.29.7-.14.25-.32.53-.56.83-.23.3-.52.65-.88 1.03l-4.17 4.55V18H21v-1.71h-5.95zM2 11v2h8v-2H2z\"/></svg>"},"exposure-plus-1":{"name":"exposure-plus-1","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 7H8v4H4v2h4v4h2v-4h4v-2h-4V7zm10 11h-2V7.38L15 8.4V6.7L19.7 5h.3v13z\"/></svg>"},"exposure-plus-2":{"name":"exposure-plus-2","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16.05 16.29l2.86-3.07c.38-.39.72-.79 1.04-1.18.32-.39.59-.78.82-1.17.23-.39.41-.78.54-1.17.13-.39.19-.79.19-1.18 0-.53-.09-1.02-.27-1.46-.18-.44-.44-.81-.78-1.11-.34-.31-.77-.54-1.26-.71-.51-.16-1.08-.24-1.72-.24-.69 0-1.31.11-1.85.32-.54.21-1 .51-1.36.88-.37.37-.65.8-.84 1.3-.18.47-.27.97-.28 1.5h2.14c.01-.31.05-.6.13-.87.09-.29.23-.54.4-.75.18-.21.41-.37.68-.49.27-.12.6-.18.96-.18.31 0 .58.05.81.15.23.1.43.25.59.43.16.18.28.4.37.65.08.25.13.52.13.81 0 .22-.03.43-.08.65-.06.22-.15.45-.29.7-.14.25-.32.53-.56.83-.23.3-.52.65-.88 1.03l-4.17 4.55V18H22v-1.71h-5.95zM8 7H6v4H2v2h4v4h2v-4h4v-2H8V7z\"/></svg>"},"exposure-zero":{"name":"exposure-zero","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16.14 12.5c0 1-.1 1.85-.3 2.55-.2.7-.48 1.27-.83 1.7-.36.44-.79.75-1.3.95-.51.2-1.07.3-1.7.3-.62 0-1.18-.1-1.69-.3-.51-.2-.95-.51-1.31-.95-.36-.44-.65-1.01-.85-1.7-.2-.7-.3-1.55-.3-2.55v-2.04c0-1 .1-1.85.3-2.55.2-.7.48-1.26.84-1.69.36-.43.8-.74 1.31-.93C10.81 5.1 11.38 5 12 5c.63 0 1.19.1 1.7.29.51.19.95.5 1.31.93.36.43.64.99.84 1.69.2.7.3 1.54.3 2.55v2.04zm-2.11-2.36c0-.64-.05-1.18-.13-1.62-.09-.44-.22-.79-.4-1.06-.17-.27-.39-.46-.64-.58-.25-.13-.54-.19-.86-.19-.32 0-.61.06-.86.18s-.47.31-.64.58c-.17.27-.31.62-.4 1.06s-.13.98-.13 1.62v2.67c0 .64.05 1.18.14 1.62.09.45.23.81.4 1.09s.39.48.64.61.54.19.87.19c.33 0 .62-.06.87-.19s.46-.33.63-.61c.17-.28.3-.64.39-1.09.09-.45.13-.99.13-1.62v-2.66z\"/></svg>"},"exposure":{"name":"exposure","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15 17v2h2v-2h2v-2h-2v-2h-2v2h-2v2h2zm5-15H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM5 5h6v2H5V5zm15 15H4L20 4v16z\"/></svg>"},"extension":{"name":"extension","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z\"/></svg>"},"face":{"name":"face","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z\"/></svg>"},"fast-forward":{"name":"fast-forward","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z\"/></svg>"},"fast-rewind":{"name":"fast-rewind","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z\"/></svg>"},"favorite-border":{"name":"favorite-border","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z\"/></svg>"},"favorite":{"name":"favorite","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z\"/></svg>"},"featured-play-list":{"name":"featured-play-list","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 8H3V9h9v2zm0-4H3V5h9v2z\"/></svg>"},"featured-video":{"name":"featured-video","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 9H3V5h9v7z\"/></svg>"},"feedback":{"name":"feedback","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z\"/></svg>"},"fiber-dvr":{"name":"fiber-dvr","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17.5 10.5h2v1h-2zm-13 0h2v3h-2zM21 3H3c-1.11 0-2 .89-2 2v14c0 1.1.89 2 2 2h18c1.11 0 2-.9 2-2V5c0-1.11-.89-2-2-2zM8 13.5c0 .85-.65 1.5-1.5 1.5H3V9h3.5c.85 0 1.5.65 1.5 1.5v3zm4.62 1.5h-1.5L9.37 9h1.5l1 3.43 1-3.43h1.5l-1.75 6zM21 11.5c0 .6-.4 1.15-.9 1.4L21 15h-1.5l-.85-2H17.5v2H16V9h3.5c.85 0 1.5.65 1.5 1.5v1z\"/></svg>"},"fiber-manual-record":{"name":"fiber-manual-record","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><circle fill=\"#010101\" cx=\"12\" cy=\"12\" r=\"8\"/></svg>"},"fiber-new":{"name":"fiber-new","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM8.5 15H7.3l-2.55-3.5V15H3.5V9h1.25l2.5 3.5V9H8.5v6zm5-4.74H11v1.12h2.5v1.26H11v1.11h2.5V15h-4V9h4v1.26zm7 3.74c0 .55-.45 1-1 1h-4c-.55 0-1-.45-1-1V9h1.25v4.51h1.13V9.99h1.25v3.51h1.12V9h1.25v5z\"/></svg>"},"fiber-pin":{"name":"fiber-pin","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M5.5 10.5h2v1h-2zM20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM9 11.5c0 .85-.65 1.5-1.5 1.5h-2v2H4V9h3.5c.85 0 1.5.65 1.5 1.5v1zm3.5 3.5H11V9h1.5v6zm7.5 0h-1.2l-2.55-3.5V15H15V9h1.25l2.5 3.5V9H20v6z\"/></svg>"},"fiber-smart-record":{"name":"fiber-smart-record","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><g fill=\"#010101\"><circle cx=\"9\" cy=\"12\" r=\"8\"/><path d=\"M17 4.26v2.09c2.33.82 4 3.04 4 5.65s-1.67 4.83-4 5.65v2.09c3.45-.89 6-4.01 6-7.74s-2.55-6.85-6-7.74z\"/></g></svg>"},"file-download":{"name":"file-download","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z\"/></svg>"},"file-upload":{"name":"file-upload","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z\"/></svg>"},"filter-1":{"name":"filter-1","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm11 10h2V5h-4v2h2v8zm7-14H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14z\"/></svg>"},"filter-2":{"name":"filter-2","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm18-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14zm-4-4h-4v-2h2c1.1 0 2-.89 2-2V7c0-1.11-.9-2-2-2h-4v2h4v2h-2c-1.1 0-2 .89-2 2v4h6v-2z\"/></svg>"},"filter-3":{"name":"filter-3","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 1H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14zM3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm14 8v-1.5c0-.83-.67-1.5-1.5-1.5.83 0 1.5-.67 1.5-1.5V7c0-1.11-.9-2-2-2h-4v2h4v2h-2v2h2v2h-4v2h4c1.1 0 2-.89 2-2z\"/></svg>"},"filter-4":{"name":"filter-4","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm12 10h2V5h-2v4h-2V5h-2v6h4v4zm6-14H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14z\"/></svg>"},"filter-5":{"name":"filter-5","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 1H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14zM3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm14 8v-2c0-1.11-.9-2-2-2h-2V7h4V5h-6v6h4v2h-4v2h4c1.1 0 2-.89 2-2z\"/></svg>"},"filter-6":{"name":"filter-6","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm18-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14zm-8-2h2c1.1 0 2-.89 2-2v-2c0-1.11-.9-2-2-2h-2V7h4V5h-4c-1.1 0-2 .89-2 2v6c0 1.11.9 2 2 2zm0-4h2v2h-2v-2z\"/></svg>"},"filter-7":{"name":"filter-7","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm18-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14zm-8-2l4-8V5h-6v2h4l-4 8h2z\"/></svg>"},"filter-8":{"name":"filter-8","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm18-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14zm-8-2h2c1.1 0 2-.89 2-2v-1.5c0-.83-.67-1.5-1.5-1.5.83 0 1.5-.67 1.5-1.5V7c0-1.11-.9-2-2-2h-2c-1.1 0-2 .89-2 2v1.5c0 .83.67 1.5 1.5 1.5-.83 0-1.5.67-1.5 1.5V13c0 1.11.9 2 2 2zm0-8h2v2h-2V7zm0 4h2v2h-2v-2z\"/></svg>"},"filter-9-plus":{"name":"filter-9-plus","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm11 7V8c0-1.11-.9-2-2-2h-1c-1.1 0-2 .89-2 2v1c0 1.11.9 2 2 2h1v1H9v2h3c1.1 0 2-.89 2-2zm-3-3V8h1v1h-1zm10-8H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 8h-2V7h-2v2h-2v2h2v2h2v-2h2v6H7V3h14v6z\"/></svg>"},"filter-9":{"name":"filter-9","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm18-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14zM15 5h-2c-1.1 0-2 .89-2 2v2c0 1.11.9 2 2 2h2v2h-4v2h4c1.1 0 2-.89 2-2V7c0-1.11-.9-2-2-2zm0 4h-2V7h2v2z\"/></svg>"},"filter-b-and-w":{"name":"filter-b-and-w","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16l-7-8v8H5l7-8V5h7v14z\"/></svg>"},"filter-center-focus":{"name":"filter-center-focus","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4zM5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5zm14-2h-4v2h4v4h2V5c0-1.1-.9-2-2-2zm0 16h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zM12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z\"/></svg>"},"filter-drama":{"name":"filter-drama","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.61 5.64 5.36 8.04 2.35 8.36 0 10.9 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4h2c0-2.76-1.86-5.08-4.4-5.78C8.61 6.88 10.2 6 12 6c3.03 0 5.5 2.47 5.5 5.5v.5H19c1.65 0 3 1.35 3 3s-1.35 3-3 3z\"/></svg>"},"filter-frames":{"name":"filter-frames","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 4h-4l-4-4-4 4H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H4V6h4.52l3.52-3.5L15.52 6H20v14zM18 8H6v10h12\"/></svg>"},"filter-hdr":{"name":"filter-hdr","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z\"/></svg>"},"filter-list":{"name":"filter-list","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z\"/></svg>"},"filter-none":{"name":"filter-none","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm18-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14z\"/></svg>"},"filter-tilt-shift":{"name":"filter-tilt-shift","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11 4.07V2.05c-2.01.2-3.84 1-5.32 2.21L7.1 5.69c1.11-.86 2.44-1.44 3.9-1.62zm7.32.19C16.84 3.05 15.01 2.25 13 2.05v2.02c1.46.18 2.79.76 3.9 1.62l1.42-1.43zM19.93 11h2.02c-.2-2.01-1-3.84-2.21-5.32L18.31 7.1c.86 1.11 1.44 2.44 1.62 3.9zM5.69 7.1L4.26 5.68C3.05 7.16 2.25 8.99 2.05 11h2.02c.18-1.46.76-2.79 1.62-3.9zM4.07 13H2.05c.2 2.01 1 3.84 2.21 5.32l1.43-1.43c-.86-1.1-1.44-2.43-1.62-3.89zM15 12c0-1.66-1.34-3-3-3s-3 1.34-3 3 1.34 3 3 3 3-1.34 3-3zm3.31 4.9l1.43 1.43c1.21-1.48 2.01-3.32 2.21-5.32h-2.02c-.18 1.45-.76 2.78-1.62 3.89zM13 19.93v2.02c2.01-.2 3.84-1 5.32-2.21l-1.43-1.43c-1.1.86-2.43 1.44-3.89 1.62zm-7.32-.19C7.16 20.95 9 21.75 11 21.95v-2.02c-1.46-.18-2.79-.76-3.9-1.62l-1.42 1.43z\"/></svg>"},"filter-vintage":{"name":"filter-vintage","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18.7 12.4c-.28-.16-.57-.29-.86-.4.29-.11.58-.24.86-.4 1.92-1.11 2.99-3.12 3-5.19-1.79-1.03-4.07-1.11-6 0-.28.16-.54.35-.78.54.05-.31.08-.63.08-.95 0-2.22-1.21-4.15-3-5.19C10.21 1.85 9 3.78 9 6c0 .32.03.64.08.95-.24-.2-.5-.39-.78-.55-1.92-1.11-4.2-1.03-6 0 0 2.07 1.07 4.08 3 5.19.28.16.57.29.86.4-.29.11-.58.24-.86.4-1.92 1.11-2.99 3.12-3 5.19 1.79 1.03 4.07 1.11 6 0 .28-.16.54-.35.78-.54-.05.32-.08.64-.08.96 0 2.22 1.21 4.15 3 5.19 1.79-1.04 3-2.97 3-5.19 0-.32-.03-.64-.08-.95.24.2.5.38.78.54 1.92 1.11 4.2 1.03 6 0-.01-2.07-1.08-4.08-3-5.19zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z\"/></svg>"},"filter":{"name":"filter","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15.96 10.29l-2.75 3.54-1.96-2.36L8.5 15h11l-3.54-4.71zM3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm18-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14z\"/></svg>"},"find-in-page":{"name":"find-in-page","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 19.59V8l-6-6H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c.45 0 .85-.15 1.19-.4l-4.43-4.43c-.8.52-1.74.83-2.76.83-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5c0 1.02-.31 1.96-.83 2.75L20 19.59zM9 13c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3-3 1.34-3 3z\"/></svg>"},"find-replace":{"name":"find-replace","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11 6c1.38 0 2.63.56 3.54 1.46L12 10h6V4l-2.05 2.05C14.68 4.78 12.93 4 11 4c-3.53 0-6.43 2.61-6.92 6H6.1c.46-2.28 2.48-4 4.9-4zm5.64 9.14c.66-.9 1.12-1.97 1.28-3.14H15.9c-.46 2.28-2.48 4-4.9 4-1.38 0-2.63-.56-3.54-1.46L10 12H4v6l2.05-2.05C7.32 17.22 9.07 18 11 18c1.55 0 2.98-.51 4.14-1.36L20 21.49 21.49 20l-4.85-4.86z\"/></svg>"},"fingerprint":{"name":"fingerprint","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39-2.57 0-4.66 1.97-4.66 4.39 0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15zm7.17-1.85c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.71 2.54.71.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.12-1.21.12zM14.91 22c-.04 0-.09-.01-.13-.02-1.59-.44-2.63-1.03-3.72-2.1-1.4-1.39-2.17-3.24-2.17-5.22 0-1.62 1.38-2.94 3.08-2.94 1.7 0 3.08 1.32 3.08 2.94 0 1.07.93 1.94 2.08 1.94s2.08-.87 2.08-1.94c0-3.77-3.25-6.83-7.25-6.83-2.84 0-5.44 1.58-6.61 4.03-.39.81-.59 1.76-.59 2.8 0 .78.07 2.01.67 3.61.1.26-.03.55-.29.64-.26.1-.55-.04-.64-.29-.49-1.31-.73-2.61-.73-3.96 0-1.2.23-2.29.68-3.24 1.33-2.79 4.28-4.6 7.51-4.6 4.55 0 8.25 3.51 8.25 7.83 0 1.62-1.38 2.94-3.08 2.94s-3.08-1.32-3.08-2.94c0-1.07-.93-1.94-2.08-1.94s-2.08.87-2.08 1.94c0 1.71.66 3.31 1.87 4.51.95.94 1.86 1.46 3.27 1.85.27.07.42.35.35.61-.05.23-.26.38-.47.38z\"/></svg>"},"first-page":{"name":"first-page","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z\"/></svg>"},"fitness-center":{"name":"fitness-center","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z\"/></svg>"},"flag":{"name":"flag","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z\"/></svg>"},"flare":{"name":"flare","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 11H1v2h6v-2zm2.17-3.24L7.05 5.64 5.64 7.05l2.12 2.12 1.41-1.41zM13 1h-2v6h2V1zm5.36 6.05l-1.41-1.41-2.12 2.12 1.41 1.41 2.12-2.12zM17 11v2h6v-2h-6zm-5-2c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm2.83 7.24l2.12 2.12 1.41-1.41-2.12-2.12-1.41 1.41zm-9.19.71l1.41 1.41 2.12-2.12-1.41-1.41-2.12 2.12zM11 23h2v-6h-2v6z\"/></svg>"},"flash-auto":{"name":"flash-auto","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 2v12h3v9l7-12H9l4-9H3zm16 0h-2l-3.2 9h1.9l.7-2h3.2l.7 2h1.9L19 2zm-2.15 5.65L18 4l1.15 3.65h-2.3z\"/></svg>"},"flash-off":{"name":"flash-off","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3.27 3L2 4.27l5 5V13h3v9l3.58-6.14L17.73 20 19 18.73 3.27 3zM17 10h-4l4-8H7v2.18l8.46 8.46L17 10z\"/></svg>"},"flash-on":{"name":"flash-on","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 2v11h3v9l7-12h-4l4-8z\"/></svg>"},"flight-land":{"name":"flight-land","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M2.5 19h19v2h-19zm7.18-5.73l4.35 1.16 5.31 1.42c.8.21 1.62-.26 1.84-1.06.21-.8-.26-1.62-1.06-1.84l-5.31-1.42-2.76-9.02L10.12 2v8.28L5.15 8.95l-.93-2.32-1.45-.39v5.17l1.6.43 5.31 1.43z\"/></svg>"},"flight-takeoff":{"name":"flight-takeoff","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M2.5 19h19v2h-19zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 1.82 3.16.77 1.33 1.6-.43 5.31-1.42 4.35-1.16L21 11.49c.81-.23 1.28-1.05 1.07-1.85z\"/></svg>"},"flight":{"name":"flight","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10.18 9\"/><path d=\"M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z\"/></svg>"},"flip-to-back":{"name":"flip-to-back","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9 7H7v2h2V7zm0 4H7v2h2v-2zm0-8c-1.11 0-2 .9-2 2h2V3zm4 12h-2v2h2v-2zm6-12v2h2c0-1.1-.9-2-2-2zm-6 0h-2v2h2V3zM9 17v-2H7c0 1.1.89 2 2 2zm10-4h2v-2h-2v2zm0-4h2V7h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zM5 7H3v12c0 1.1.89 2 2 2h12v-2H5V7zm10-2h2V3h-2v2zm0 12h2v-2h-2v2z\"/></svg>"},"flip-to-front":{"name":"flip-to-front","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 13h2v-2H3v2zm0 4h2v-2H3v2zm2 4v-2H3c0 1.1.89 2 2 2zM3 9h2V7H3v2zm12 12h2v-2h-2v2zm4-18H9c-1.11 0-2 .9-2 2v10c0 1.1.89 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H9V5h10v10zm-8 6h2v-2h-2v2zm-4 0h2v-2H7v2z\"/></svg>"},"flip":{"name":"flip","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15 21h2v-2h-2v2zm4-12h2V7h-2v2zM3 5v14c0 1.1.9 2 2 2h4v-2H5V5h4V3H5c-1.1 0-2 .9-2 2zm16-2v2h2c0-1.1-.9-2-2-2zm-8 20h2V1h-2v22zm8-6h2v-2h-2v2zM15 5h2V3h-2v2zm4 8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2z\"/></svg>"},"folder-open":{"name":"folder-open","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z\"/></svg>"},"folder-shared":{"name":"folder-shared","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 8h-8v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1z\"/></svg>"},"folder-special":{"name":"folder-special","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2.06 11L15 15.28 12.06 17l.78-3.33-2.59-2.24 3.41-.29L15 8l1.34 3.14 3.41.29-2.59 2.24.78 3.33z\"/></svg>"},"folder":{"name":"folder","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z\"/></svg>"},"font-download":{"name":"font-download","svg":"<svg baseProfile=\"tiny\" xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9.93 13.5h4.14L12 7.98zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4.05 16.5l-1.14-3H9.17l-1.12 3H5.96l5.11-13h1.86l5.11 13h-2.09z\"/></svg>"},"format-align-center":{"name":"format-align-center","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z\"/></svg>"},"format-align-justify":{"name":"format-align-justify","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z\"/></svg>"},"format-align-left":{"name":"format-align-left","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z\"/></svg>"},"format-align-right":{"name":"format-align-right","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z\"/></svg>"},"format-bold":{"name":"format-bold","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z\"/></svg>"},"format-clear":{"name":"format-clear","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z\"/></svg>"},"format-color-fill":{"name":"format-color-fill","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z\"/><path fill-opacity=\".36\" d=\"M0 20h24v4H0z\"/></svg>"},"format-color-reset":{"name":"format-color-reset","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 14c0-4-6-10.8-6-10.8s-1.33 1.51-2.73 3.52l8.59 8.59c.09-.42.14-.86.14-1.31zm-.88 3.12L12.5 12.5 5.27 5.27 4 6.55l3.32 3.32C6.55 11.32 6 12.79 6 14c0 3.31 2.69 6 6 6 1.52 0 2.9-.57 3.96-1.5l2.63 2.63 1.27-1.27-2.74-2.74z\"/></svg>"},"format-color-text":{"name":"format-color-text","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".36\" d=\"M0 20h24v4H0z\"/><path d=\"M11 3L5.5 17h2.25l1.12-3h6.25l1.12 3h2.25L13 3h-2zm-1.38 9L12 5.67 14.38 12H9.62z\"/></svg>"},"format-indent-decrease":{"name":"format-indent-decrease","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11 17h10v-2H11v2zm-8-5l4 4V8l-4 4zm0 9h18v-2H3v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z\"/></svg>"},"format-indent-increase":{"name":"format-indent-increase","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z\"/></svg>"},"format-italic":{"name":"format-italic","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z\"/></svg>"},"format-line-spacing":{"name":"format-line-spacing","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6 7h2.5L5 3.5 1.5 7H4v10H1.5L5 20.5 8.5 17H6V7zm4-2v2h12V5H10zm0 14h12v-2H10v2zm0-6h12v-2H10v2z\"/></svg>"},"format-list-bulleted":{"name":"format-list-bulleted","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z\"/></svg>"},"format-list-numbered":{"name":"format-list-numbered","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z\"/></svg>"},"format-paint":{"name":"format-paint","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 4V3c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V6h1v4H9v11c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9h8V4h-3z\"/></svg>"},"format-quote":{"name":"format-quote","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z\"/></svg>"},"format-shapes":{"name":"format-shapes","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M23 7V1h-6v2H7V1H1v6h2v10H1v6h6v-2h10v2h6v-6h-2V7h2zM3 3h2v2H3V3zm2 18H3v-2h2v2zm12-2H7v-2H5V7h2V5h10v2h2v10h-2v2zm4 2h-2v-2h2v2zM19 5V3h2v2h-2zm-5.27 9h-3.49l-.73 2H7.89l3.4-9h1.4l3.41 9h-1.63l-.74-2zm-3.04-1.26h2.61L12 8.91l-1.31 3.83z\"/></svg>"},"format-size":{"name":"format-size","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z\"/></svg>"},"format-strikethrough":{"name":"format-strikethrough","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z\"/></svg>"},"format-textdirection-l-to-r":{"name":"format-textdirection-l-to-r","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9 10v5h2V4h2v11h2V4h2V2H9C6.79 2 5 3.79 5 6s1.79 4 4 4zm12 8l-4-4v3H5v2h12v3l4-4z\"/></svg>"},"format-textdirection-r-to-l":{"name":"format-textdirection-r-to-l","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 10v5h2V4h2v11h2V4h2V2h-8C7.79 2 6 3.79 6 6s1.79 4 4 4zm-2 7v-3l-4 4 4 4v-3h12v-2H8z\"/></svg>"},"format-underlined":{"name":"format-underlined","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z\"/></svg>"},"forum":{"name":"forum","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z\"/></svg>"},"forward-10":{"name":"forward-10","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 13c0 4.4 3.6 8 8 8s8-3.6 8-8h-2c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6v4l5-5-5-5v4c-4.4 0-8 3.6-8 8zm6.8 3H10v-3.3L9 13v-.7l1.8-.6h.1V16zm4.3-1.8c0 .3 0 .6-.1.8l-.3.6s-.3.3-.5.3-.4.1-.6.1-.4 0-.6-.1-.3-.2-.5-.3-.2-.3-.3-.6-.1-.5-.1-.8v-.7c0-.3 0-.6.1-.8l.3-.6s.3-.3.5-.3.4-.1.6-.1.4 0 .6.1.3.2.5.3.2.3.3.6.1.5.1.8v.7zm-.8-.8v-.5s-.1-.2-.1-.3-.1-.1-.2-.2-.2-.1-.3-.1-.2 0-.3.1l-.2.2s-.1.2-.1.3v2s.1.2.1.3.1.1.2.2.2.1.3.1.2 0 .3-.1l.2-.2s.1-.2.1-.3v-1.5z\"/></svg>"},"forward-30":{"name":"forward-30","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9.6 13.5h.4c.2 0 .4-.1.5-.2s.2-.2.2-.4v-.2s-.1-.1-.1-.2-.1-.1-.2-.1h-.5s-.1.1-.2.1-.1.1-.1.2v.2h-1c0-.2 0-.3.1-.5s.2-.3.3-.4.3-.2.4-.2.4-.1.5-.1c.2 0 .4 0 .6.1s.3.1.5.2.2.2.3.4.1.3.1.5v.3s-.1.2-.1.3-.1.2-.2.2-.2.1-.3.2c.2.1.4.2.5.4s.2.4.2.6c0 .2 0 .4-.1.5s-.2.3-.3.4-.3.2-.5.2-.4.1-.6.1c-.2 0-.4 0-.5-.1s-.3-.1-.5-.2-.2-.2-.3-.4-.1-.4-.1-.6h.8v.2s.1.1.1.2.1.1.2.1h.5s.1-.1.2-.1.1-.1.1-.2v-.5s-.1-.1-.1-.2-.1-.1-.2-.1h-.6v-.7zm5.7.7c0 .3 0 .6-.1.8l-.3.6s-.3.3-.5.3-.4.1-.6.1-.4 0-.6-.1-.3-.2-.5-.3-.2-.3-.3-.6-.1-.5-.1-.8v-.7c0-.3 0-.6.1-.8l.3-.6s.3-.3.5-.3.4-.1.6-.1.4 0 .6.1.3.2.5.3.2.3.3.6.1.5.1.8v.7zm-.9-.8v-.5s-.1-.2-.1-.3-.1-.1-.2-.2-.2-.1-.3-.1-.2 0-.3.1l-.2.2s-.1.2-.1.3v2s.1.2.1.3.1.1.2.2.2.1.3.1.2 0 .3-.1l.2-.2s.1-.2.1-.3v-1.5zM4 13c0 4.4 3.6 8 8 8s8-3.6 8-8h-2c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6v4l5-5-5-5v4c-4.4 0-8 3.6-8 8z\"/></svg>"},"forward-5":{"name":"forward-5","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 13c0 4.4 3.6 8 8 8s8-3.6 8-8h-2c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6v4l5-5-5-5v4c-4.4 0-8 3.6-8 8zm6.7.9l.2-2.2h2.4v.7h-1.7l-.1.9s.1 0 .1-.1.1 0 .1-.1.1 0 .2 0h.2c.2 0 .4 0 .5.1s.3.2.4.3.2.3.3.5.1.4.1.6c0 .2 0 .4-.1.5s-.1.3-.3.5-.3.2-.5.3-.4.1-.6.1c-.2 0-.4 0-.5-.1s-.3-.1-.5-.2-.2-.2-.3-.4-.1-.3-.1-.5h.8c0 .2.1.3.2.4s.2.1.4.1c.1 0 .2 0 .3-.1l.2-.2s.1-.2.1-.3v-.6l-.1-.2-.2-.2s-.2-.1-.3-.1h-.2s-.1 0-.2.1-.1 0-.1.1-.1.1-.1.1h-.6z\"/></svg>"},"forward":{"name":"forward","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 8V4l8 8-8 8v-4H4V8z\"/></svg>"},"free-breakfast":{"name":"free-breakfast","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.9 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z\"/></svg>"},"fullscreen-exit":{"name":"fullscreen-exit","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z\"/></svg>"},"fullscreen":{"name":"fullscreen","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z\"/></svg>"},"functions":{"name":"functions","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 4H6v2l6.5 6L6 18v2h12v-3h-7l5-5-5-5h7z\"/></svg>"},"g-translate":{"name":"g-translate","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 5h-9.12L10 2H4c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h7l1 3h8c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM7.17 14.59c-2.25 0-4.09-1.83-4.09-4.09s1.83-4.09 4.09-4.09c1.04 0 1.99.37 2.74 1.07l.07.06-1.23 1.18-.06-.05c-.29-.27-.78-.59-1.52-.59-1.31 0-2.38 1.09-2.38 2.42s1.07 2.42 2.38 2.42c1.37 0 1.96-.87 2.12-1.46H7.08V9.91h3.95l.01.07c.04.21.05.4.05.61 0 2.35-1.61 4-3.92 4zm6.03-1.71c.33.6.74 1.18 1.19 1.7l-.54.53-.65-2.23zm.77-.76h-.99l-.31-1.04h3.99s-.34 1.31-1.56 2.74c-.52-.62-.89-1.23-1.13-1.7zM21 20c0 .55-.45 1-1 1h-7l2-2-.81-2.77.92-.92L17.79 18l.73-.73-2.71-2.68c.9-1.03 1.6-2.25 1.92-3.51H19v-1.04h-3.64V9h-1.04v1.04h-1.96L11.18 6H20c.55 0 1 .45 1 1v13z\"/></svg>"},"gamepad":{"name":"gamepad","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15 7.5V2H9v5.5l3 3 3-3zM7.5 9H2v6h5.5l3-3-3-3zM9 16.5V22h6v-5.5l-3-3-3 3zM16.5 9l-3 3 3 3H22V9h-5.5z\"/></svg>"},"games":{"name":"games","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15 7.5V2H9v5.5l3 3 3-3zM7.5 9H2v6h5.5l3-3-3-3zM9 16.5V22h6v-5.5l-3-3-3 3zM16.5 9l-3 3 3 3H22V9h-5.5z\"/></svg>"},"gavel":{"name":"gavel","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M1 21h12v2H1zM5.245 8.07l2.83-2.827 14.14 14.142-2.828 2.828zM12.317 1l5.657 5.656-2.83 2.83-5.654-5.66zM3.825 9.485l5.657 5.657-2.828 2.828-5.657-5.657z\"/></svg>"},"gesture":{"name":"gesture","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4.59 6.89c.7-.71 1.4-1.35 1.71-1.22.5.2 0 1.03-.3 1.52-.25.42-2.86 3.89-2.86 6.31 0 1.28.48 2.34 1.34 2.98.75.56 1.74.73 2.64.46 1.07-.31 1.95-1.4 3.06-2.77 1.21-1.49 2.83-3.44 4.08-3.44 1.63 0 1.65 1.01 1.76 1.79-3.78.64-5.38 3.67-5.38 5.37 0 1.7 1.44 3.09 3.21 3.09 1.63 0 4.29-1.33 4.69-6.1H21v-2.5h-2.47c-.15-1.65-1.09-4.2-4.03-4.2-2.25 0-4.18 1.91-4.94 2.84-.58.73-2.06 2.48-2.29 2.72-.25.3-.68.84-1.11.84-.45 0-.72-.83-.36-1.92.35-1.09 1.4-2.86 1.85-3.52.78-1.14 1.3-1.92 1.3-3.28C8.95 3.69 7.31 3 6.44 3 5.12 3 3.97 4 3.72 4.25c-.36.36-.66.66-.88.93l1.75 1.71zm9.29 11.66c-.31 0-.74-.26-.74-.72 0-.6.73-2.2 2.87-2.76-.3 2.69-1.43 3.48-2.13 3.48z\"/></svg>"},"get-app":{"name":"get-app","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z\"/></svg>"},"gif":{"name":"gif","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11.5 9H13v6h-1.5zM9 9H6c-.6 0-1 .5-1 1v4c0 .5.4 1 1 1h3c.6 0 1-.5 1-1v-2H8.5v1.5h-2v-3H10V10c0-.5-.4-1-1-1zm10 1.5V9h-4.5v6H16v-2h2v-1.5h-2v-1z\"/></svg>"},"golf-course":{"name":"golf-course","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><circle cx=\"19.5\" cy=\"19.5\" r=\"1.5\"/><path d=\"M17 5.92L9 2v18H7v-1.73c-1.79.35-3 .99-3 1.73 0 1.1 2.69 2 6 2s6-.9 6-2c0-.99-2.16-1.81-5-1.97V8.98l6-3.06z\"/></svg>"},"gps-fixed":{"name":"gps-fixed","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z\"/></svg>"},"gps-not-fixed":{"name":"gps-not-fixed","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20.94 11c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z\"/></svg>"},"gps-off":{"name":"gps-off","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20.94 11c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06c-1.13.12-2.19.46-3.16.97l1.5 1.5C10.16 5.19 11.06 5 12 5c3.87 0 7 3.13 7 7 0 .94-.19 1.84-.52 2.65l1.5 1.5c.5-.96.84-2.02.97-3.15H23v-2h-2.06zM3 4.27l2.04 2.04C3.97 7.62 3.25 9.23 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c1.77-.2 3.38-.91 4.69-1.98L19.73 21 21 19.73 4.27 3 3 4.27zm13.27 13.27C15.09 18.45 13.61 19 12 19c-3.87 0-7-3.13-7-7 0-1.61.55-3.09 1.46-4.27l9.81 9.81z\"/></svg>"},"grade":{"name":"grade","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z\"/></svg>"},"gradient":{"name":"gradient","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11 9h2v2h-2zm-2 2h2v2H9zm4 0h2v2h-2zm2-2h2v2h-2zM7 9h2v2H7zm12-6H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm2-7h-2v2h2v2h-2v-2h-2v2h-2v-2h-2v2H9v-2H7v2H5v-2h2v-2H5V5h14v6z\"/></svg>"},"grain":{"name":"grain","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12-8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-4 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm4-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z\"/></svg>"},"graphic-eq":{"name":"graphic-eq","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 18h2V6H7v12zm4 4h2V2h-2v20zm-8-8h2v-4H3v4zm12 4h2V6h-2v12zm4-8v4h2v-4h-2z\"/></svg>"},"grid-off":{"name":"grid-off","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M8 4v1.45l2 2V4h4v4h-3.45l2 2H14v1.45l2 2V10h4v4h-3.45l2 2H20v1.45l2 2V4c0-1.1-.9-2-2-2H4.55l2 2H8zm8 0h4v4h-4V4zM1.27 1.27L0 2.55l2 2V20c0 1.1.9 2 2 2h15.46l2 2 1.27-1.27L1.27 1.27zM10 12.55L11.45 14H10v-1.45zm-6-6L5.45 8H4V6.55zM8 20H4v-4h4v4zm0-6H4v-4h3.45l.55.55V14zm6 6h-4v-4h3.45l.55.54V20zm2 0v-1.46L17.46 20H16z\"/></svg>"},"grid-on":{"name":"grid-on","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z\"/></svg>"},"group-add":{"name":"group-add","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M8 10H5V7H3v3H0v2h3v3h2v-3h3v-2zm10 1c1.66 0 2.99-1.34 2.99-3S19.66 5 18 5c-.32 0-.63.05-.91.14.57.81.9 1.79.9 2.86s-.34 2.04-.9 2.86c.28.09.59.14.91.14zm-5 0c1.66 0 2.99-1.34 2.99-3S14.66 5 13 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm6.62 2.16c.83.73 1.38 1.66 1.38 2.84v2h3v-2c0-1.54-2.37-2.49-4.38-2.84zM13 13c-2 0-6 1-6 3v2h12v-2c0-2-4-3-6-3z\"/></svg>"},"group-work":{"name":"group-work","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 17.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM9.5 8c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8zm6.5 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z\"/></svg>"},"group":{"name":"group","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z\"/></svg>"},"hd":{"name":"hd","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 12H9.5v-2h-2v2H6V9h1.5v2.5h2V9H11v6zm2-6h4c.55 0 1 .45 1 1v4c0 .55-.45 1-1 1h-4V9zm1.5 4.5h2v-3h-2v3z\"/></svg>"},"hdr-off":{"name":"hdr-off","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17.5 15v-2h1.1l.9 2H21l-.9-2.1c.5-.2.9-.8.9-1.4v-1c0-.8-.7-1.5-1.5-1.5H16v4.9l1.1 1.1h.4zm0-4.5h2v1h-2v-1zm-4.5 0v.4l1.5 1.5v-1.9c0-.8-.7-1.5-1.5-1.5h-1.9l1.5 1.5h.4zm-3.5-1l-7-7-1.1 1L6.9 9h-.4v2h-2V9H3v6h1.5v-2.5h2V15H8v-4.9l1.5 1.5V15h3.4l7.6 7.6 1.1-1.1-12.1-12z\"/></svg>"},"hdr-on":{"name":"hdr-on","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 11.5v-1c0-.8-.7-1.5-1.5-1.5H16v6h1.5v-2h1.1l.9 2H21l-.9-2.1c.5-.3.9-.8.9-1.4zm-1.5 0h-2v-1h2v1zm-13-.5h-2V9H3v6h1.5v-2.5h2V15H8V9H6.5v2zM13 9H9.5v6H13c.8 0 1.5-.7 1.5-1.5v-3c0-.8-.7-1.5-1.5-1.5zm0 4.5h-2v-3h2v3z\"/></svg>"},"hdr-strong":{"name":"hdr-strong","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zM5 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z\"/></svg>"},"hdr-weak":{"name":"hdr-weak","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M5 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm12-2c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z\"/></svg>"},"headset-mic":{"name":"headset-mic","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h4v1h-7v2h6c1.66 0 3-1.34 3-3V10c0-4.97-4.03-9-9-9z\"/></svg>"},"headset":{"name":"headset","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z\"/></svg>"},"healing":{"name":"healing","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17.73 12.02l3.98-3.98c.39-.39.39-1.02 0-1.41l-4.34-4.34c-.39-.39-1.02-.39-1.41 0l-3.98 3.98L8 2.29C7.8 2.1 7.55 2 7.29 2c-.25 0-.51.1-.7.29L2.25 6.63c-.39.39-.39 1.02 0 1.41l3.98 3.98L2.25 16c-.39.39-.39 1.02 0 1.41l4.34 4.34c.39.39 1.02.39 1.41 0l3.98-3.98 3.98 3.98c.2.2.45.29.71.29.26 0 .51-.1.71-.29l4.34-4.34c.39-.39.39-1.02 0-1.41l-3.99-3.98zM12 9c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-4.71 1.96L3.66 7.34l3.63-3.63 3.62 3.62-3.62 3.63zM10 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2 2c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2.66 9.34l-3.63-3.62 3.63-3.63 3.62 3.62-3.62 3.63z\"/></svg>"},"hearing":{"name":"hearing","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 20c-.29 0-.56-.06-.76-.15-.71-.37-1.21-.88-1.71-2.38-.51-1.56-1.47-2.29-2.39-3-.79-.61-1.61-1.24-2.32-2.53C9.29 10.98 9 9.93 9 9c0-2.8 2.2-5 5-5s5 2.2 5 5h2c0-3.93-3.07-7-7-7S7 5.07 7 9c0 1.26.38 2.65 1.07 3.9.91 1.65 1.98 2.48 2.85 3.15.81.62 1.39 1.07 1.71 2.05.6 1.82 1.37 2.84 2.73 3.55.51.23 1.07.35 1.64.35 2.21 0 4-1.79 4-4h-2c0 1.1-.9 2-2 2zM7.64 2.64L6.22 1.22C4.23 3.21 3 5.96 3 9s1.23 5.79 3.22 7.78l1.41-1.41C6.01 13.74 5 11.49 5 9s1.01-4.74 2.64-6.36zM11.5 9c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5z\"/></svg>"},"help-outline":{"name":"help-outline","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z\"/></svg>"},"help":{"name":"help","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z\"/></svg>"},"high-quality":{"name":"high-quality","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 11H9.5v-2h-2v2H6V9h1.5v2.5h2V9H11v6zm7-1c0 .55-.45 1-1 1h-.75v1.5h-1.5V15H14c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v4zm-3.5-.5h2v-3h-2v3z\"/></svg>"},"highlight-off":{"name":"highlight-off","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14.59 8L12 10.59 9.41 8 8 9.41 10.59 12 8 14.59 9.41 16 12 13.41 14.59 16 16 14.59 13.41 12 16 9.41 14.59 8zM12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z\"/></svg>"},"highlight":{"name":"highlight","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6 14l3 3v5h6v-5l3-3V9H6zm5-12h2v3h-2zM3.5 5.875L4.914 4.46l2.12 2.122L5.62 7.997zm13.46.71l2.123-2.12 1.414 1.414L18.375 8z\"/></svg>"},"history":{"name":"history","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z\"/></svg>"},"home":{"name":"home","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z\"/></svg>"},"hot-tub":{"name":"hot-tub","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><circle cx=\"7\" cy=\"6\" r=\"2\"/><path d=\"M11.15 12c-.31-.22-.59-.46-.82-.72l-1.4-1.55c-.19-.21-.43-.38-.69-.5-.29-.14-.62-.23-.96-.23h-.03C6.01 9 5 10.01 5 11.25V12H2v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-8H11.15zM7 20H5v-6h2v6zm4 0H9v-6h2v6zm4 0h-2v-6h2v6zm4 0h-2v-6h2v6zm-.35-14.14l-.07-.07c-.57-.62-.82-1.41-.67-2.2L18 3h-1.89l-.06.43c-.2 1.36.27 2.71 1.3 3.72l.07.06c.57.62.82 1.41.67 2.2l-.11.59h1.91l.06-.43c.21-1.36-.27-2.71-1.3-3.71zm-4 0l-.07-.07c-.57-.62-.82-1.41-.67-2.2L14 3h-1.89l-.06.43c-.2 1.36.27 2.71 1.3 3.72l.07.06c.57.62.82 1.41.67 2.2l-.11.59h1.91l.06-.43c.21-1.36-.27-2.71-1.3-3.71z\"/></svg>"},"hotel":{"name":"hotel","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z\"/></svg>"},"hourglass-empty":{"name":"hourglass-empty","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z\"/></svg>"},"hourglass-full":{"name":"hourglass-full","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6z\"/></svg>"},"http":{"name":"http","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4.5 11h-2V9H1v6h1.5v-2.5h2V15H6V9H4.5v2zm2.5-.5h1.5V15H10v-4.5h1.5V9H7v1.5zm5.5 0H14V15h1.5v-4.5H17V9h-4.5v1.5zm9-1.5H18v6h1.5v-2h2c.8 0 1.5-.7 1.5-1.5v-1c0-.8-.7-1.5-1.5-1.5zm0 2.5h-2v-1h2v1z\"/></svg>"},"https":{"name":"https","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z\"/></svg>"},"image-aspect-ratio":{"name":"image-aspect-ratio","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16 10h-2v2h2v-2zm0 4h-2v2h2v-2zm-8-4H6v2h2v-2zm4 0h-2v2h2v-2zm8-6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z\"/></svg>"},"image":{"name":"image","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z\"/></svg>"},"import-contacts":{"name":"import-contacts","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z\"/></svg>"},"import-export":{"name":"import-export","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z\"/></svg>"},"important-devices":{"name":"important-devices","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M23 11.01L18 11c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-9c0-.55-.45-.99-1-.99zM23 20h-5v-7h5v7zM20 2H2C.89 2 0 2.89 0 4v12c0 1.1.89 2 2 2h7v2H7v2h8v-2h-2v-2h2v-2H2V4h18v5h2V4c0-1.11-.9-2-2-2zm-8.03 7L11 6l-.97 3H7l2.47 1.76-.94 2.91 2.47-1.8 2.47 1.8-.94-2.91L15 9h-3.03z\"/></svg>"},"inbox":{"name":"inbox","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10z\"/></svg>"},"indeterminate-check-box":{"name":"indeterminate-check-box","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\"><path d=\"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z\"/></svg>"},"info-outline":{"name":"info-outline","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z\"/></svg>"},"info":{"name":"info","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z\"/></svg>"},"input":{"name":"input","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 3.01H3c-1.1 0-2 .9-2 2V9h2V4.99h18v14.03H3V15H1v4.01c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98v-14c0-1.11-.9-2-2-2zM11 16l4-4-4-4v3H1v2h10v3z\"/></svg>"},"insert-chart":{"name":"insert-chart","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z\"/></svg>"},"insert-comment":{"name":"insert-comment","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z\"/></svg>"},"insert-drive-file":{"name":"insert-drive-file","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z\"/></svg>"},"insert-emoticon":{"name":"insert-emoticon","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z\"/></svg>"},"insert-invitation":{"name":"insert-invitation","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z\"/></svg>"},"insert-link":{"name":"insert-link","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z\"/></svg>"},"insert-photo":{"name":"insert-photo","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z\"/></svg>"},"invert-colors-off":{"name":"invert-colors-off","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20.65 20.87l-2.35-2.35-6.3-6.29-3.56-3.57-1.42-1.41L4.27 4.5 3 5.77l2.78 2.78c-2.55 3.14-2.36 7.76.56 10.69C7.9 20.8 9.95 21.58 12 21.58c1.79 0 3.57-.59 5.03-1.78l2.7 2.7L21 21.23l-.35-.36zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59c0-1.32.43-2.57 1.21-3.6L12 14.77v4.82zM12 5.1v4.58l7.25 7.26c1.37-2.96.84-6.57-1.6-9.01L12 2.27l-3.7 3.7 1.41 1.41L12 5.1z\"/></svg>"},"invert-colors":{"name":"invert-colors","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58c2.05 0 4.1-.78 5.66-2.34 3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z\"/></svg>"},"iso":{"name":"iso","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5.5 7.5h2v-2H9v2h2V9H9v2H7.5V9h-2V7.5zM19 19H5L19 5v14zm-2-2v-1.5h-5V17h5z\"/></svg>"},"keyboard-arrow-down":{"name":"keyboard-arrow-down","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z\"/></svg>"},"keyboard-arrow-left":{"name":"keyboard-arrow-left","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z\"/></svg>"},"keyboard-arrow-right":{"name":"keyboard-arrow-right","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z\"/></svg>"},"keyboard-arrow-up":{"name":"keyboard-arrow-up","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z\"/></svg>"},"keyboard-backspace":{"name":"keyboard-backspace","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 11H6.83l3.58-3.59L9 6l-6 6 6 6 1.41-1.41L6.83 13H21z\"/></svg>"},"keyboard-capslock":{"name":"keyboard-capslock","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 8.41L16.59 13 18 11.59l-6-6-6 6L7.41 13 12 8.41zM6 18h12v-2H6v2z\"/></svg>"},"keyboard-hide":{"name":"keyboard-hide","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 3H4c-1.1 0-1.99.9-1.99 2L2 15c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 3h2v2h-2V6zm0 3h2v2h-2V9zM8 6h2v2H8V6zm0 3h2v2H8V9zm-1 2H5V9h2v2zm0-3H5V6h2v2zm9 7H8v-2h8v2zm0-4h-2V9h2v2zm0-3h-2V6h2v2zm3 3h-2V9h2v2zm0-3h-2V6h2v2zm-7 15l4-4H8l4 4z\"/></svg>"},"keyboard-return":{"name":"keyboard-return","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z\"/></svg>"},"keyboard-tab":{"name":"keyboard-tab","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11.59 7.41L15.17 11H1v2h14.17l-3.59 3.59L13 18l6-6-6-6-1.41 1.41zM20 6v12h2V6h-2z\"/></svg>"},"keyboard-voice":{"name":"keyboard-voice","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z\"/></svg>"},"keyboard":{"name":"keyboard","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z\"/></svg>"},"kitchen":{"name":"kitchen","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 2.01L6 2c-1.1 0-2 .89-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.11-.9-1.99-2-1.99zM18 20H6v-9.02h12V20zm0-11H6V4h12v5zM8 5h2v3H8zm0 7h2v5H8z\"/></svg>"},"label-outline":{"name":"label-outline","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16zM16 17H5V7h11l3.55 5L16 17z\"/></svg>"},"label":{"name":"label","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z\"/></svg>"},"landscape":{"name":"landscape","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z\"/></svg>"},"language":{"name":"language","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z\"/></svg>"},"laptop-chromebook":{"name":"laptop-chromebook","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 18V3H2v15H0v2h24v-2h-2zm-8 0h-4v-1h4v1zm6-3H4V5h16v10z\"/></svg>"},"laptop-mac":{"name":"laptop-mac","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 18c1.1 0 1.99-.9 1.99-2L22 5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2H0c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2h-4zM4 5h16v11H4V5zm8 14c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z\"/></svg>"},"laptop-windows":{"name":"laptop-windows","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 18v-1c1.1 0 1.99-.9 1.99-2L22 5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2v1H0v2h24v-2h-4zM4 5h16v10H4V5z\"/></svg>"},"laptop":{"name":"laptop","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z\"/></svg>"},"last-page":{"name":"last-page","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z\"/></svg>"},"launch":{"name":"launch","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z\"/></svg>"},"layers-clear":{"name":"layers-clear","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.81 14.99l1.19-.92-1.43-1.43-1.19.92 1.43 1.43zm-.45-4.72L21 9l-9-7-2.91 2.27 7.87 7.88 2.4-1.88zM3.27 1L2 2.27l4.22 4.22L3 9l1.63 1.27L12 16l2.1-1.63 1.43 1.43L12 18.54l-7.37-5.73L3 14.07l9 7 4.95-3.85L20.73 21 22 19.73 3.27 1z\"/></svg>"},"layers":{"name":"layers","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z\"/></svg>"},"leak-add":{"name":"leak-add","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6 3H3v3c1.66 0 3-1.34 3-3zm8 0h-2c0 4.97-4.03 9-9 9v2c6.08 0 11-4.93 11-11zm-4 0H8c0 2.76-2.24 5-5 5v2c3.87 0 7-3.13 7-7zm0 18h2c0-4.97 4.03-9 9-9v-2c-6.07 0-11 4.93-11 11zm8 0h3v-3c-1.66 0-3 1.34-3 3zm-4 0h2c0-2.76 2.24-5 5-5v-2c-3.87 0-7 3.13-7 7z\"/></svg>"},"leak-remove":{"name":"leak-remove","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 3H8c0 .37-.04.72-.12 1.06l1.59 1.59C9.81 4.84 10 3.94 10 3zM3 4.27l2.84 2.84C5.03 7.67 4.06 8 3 8v2c1.61 0 3.09-.55 4.27-1.46L8.7 9.97C7.14 11.24 5.16 12 3 12v2c2.71 0 5.19-.99 7.11-2.62l2.5 2.5C10.99 15.81 10 18.29 10 21h2c0-2.16.76-4.14 2.03-5.69l1.43 1.43C14.55 17.91 14 19.39 14 21h2c0-1.06.33-2.03.89-2.84L19.73 21 21 19.73 4.27 3 3 4.27zM14 3h-2c0 1.5-.37 2.91-1.02 4.16l1.46 1.46C13.42 6.98 14 5.06 14 3zm5.94 13.12c.34-.08.69-.12 1.06-.12v-2c-.94 0-1.84.19-2.66.52l1.6 1.6zm-4.56-4.56l1.46 1.46C18.09 12.37 19.5 12 21 12v-2c-2.06 0-3.98.58-5.62 1.56z\"/></svg>"},"lens":{"name":"lens","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z\"/></svg>"},"library-add":{"name":"library-add","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z\"/></svg>"},"library-books":{"name":"library-books","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z\"/></svg>"},"library-music":{"name":"library-music","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5h-3v5.5c0 1.38-1.12 2.5-2.5 2.5S10 13.88 10 12.5s1.12-2.5 2.5-2.5c.57 0 1.08.19 1.5.51V5h4v2zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z\"/></svg>"},"lightbulb-outline":{"name":"lightbulb-outline","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z\"/></svg>"},"line-style":{"name":"line-style","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 16h5v-2H3v2zm6.5 0h5v-2h-5v2zm6.5 0h5v-2h-5v2zM3 20h2v-2H3v2zm4 0h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zM3 12h8v-2H3v2zm10 0h8v-2h-8v2zM3 4v4h18V4H3z\"/></svg>"},"line-weight":{"name":"line-weight","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 17h18v-2H3v2zm0 3h18v-1H3v1zm0-7h18v-3H3v3zm0-9v4h18V4H3z\"/></svg>"},"linear-scale":{"name":"linear-scale","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.5 9.5c-1.03 0-1.9.62-2.29 1.5h-2.92c-.39-.88-1.26-1.5-2.29-1.5s-1.9.62-2.29 1.5H6.79c-.39-.88-1.26-1.5-2.29-1.5C3.12 9.5 2 10.62 2 12s1.12 2.5 2.5 2.5c1.03 0 1.9-.62 2.29-1.5h2.92c.39.88 1.26 1.5 2.29 1.5s1.9-.62 2.29-1.5h2.92c.39.88 1.26 1.5 2.29 1.5 1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5z\"/></svg>"},"link":{"name":"link","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z\"/></svg>"},"linked-camera":{"name":"linked-camera","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"14\" r=\"3.2\"/><path d=\"M16 3.33c2.58 0 4.67 2.09 4.67 4.67H22c0-3.31-2.69-6-6-6v1.33M16 6c1.11 0 2 .89 2 2h1.33c0-1.84-1.49-3.33-3.33-3.33V6\"/><path d=\"M17 9c0-1.11-.89-2-2-2V4H9L7.17 6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9h-5zm-5 10c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z\"/></svg>"},"list":{"name":"list","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z\"/></svg>"},"live-help":{"name":"live-help","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 16h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 11.9 13 12.5 13 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z\"/></svg>"},"live-tv":{"name":"live-tv","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.11-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z\"/></svg>"},"local-activity":{"name":"local-activity","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 12c0-1.1.9-2 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-1.99.9-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2zm-4.42 4.8L12 14.5l-3.58 2.3 1.08-4.12-3.29-2.69 4.24-.25L12 5.8l1.54 3.95 4.24.25-3.29 2.69 1.09 4.11z\"/></svg>"},"local-airport":{"name":"local-airport","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z\"/></svg>"},"local-atm":{"name":"local-atm","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11 17h2v-1h1c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1h-3v-1h4V8h-2V7h-2v1h-1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h3v1H9v2h2v1zm9-13H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4V6h16v12z\"/></svg>"},"local-bar":{"name":"local-bar","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 5V3H3v2l8 9v5H6v2h12v-2h-5v-5l8-9zM7.43 7L5.66 5h12.69l-1.78 2H7.43z\"/></svg>"},"local-cafe":{"name":"local-cafe","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM2 21h18v-2H2v2z\"/></svg>"},"local-car-wash":{"name":"local-car-wash","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 5c.83 0 1.5-.67 1.5-1.5 0-1-1.5-2.7-1.5-2.7s-1.5 1.7-1.5 2.7c0 .83.67 1.5 1.5 1.5zm-5 0c.83 0 1.5-.67 1.5-1.5 0-1-1.5-2.7-1.5-2.7s-1.5 1.7-1.5 2.7c0 .83.67 1.5 1.5 1.5zM7 5c.83 0 1.5-.67 1.5-1.5C8.5 2.5 7 .8 7 .8S5.5 2.5 5.5 3.5C5.5 4.33 6.17 5 7 5zm11.92 3.01C18.72 7.42 18.16 7 17.5 7h-11c-.66 0-1.21.42-1.42 1.01L3 14v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 18c-.83 0-1.5-.67-1.5-1.5S5.67 15 6.5 15s1.5.67 1.5 1.5S7.33 18 6.5 18zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 13l1.5-4.5h11L19 13H5z\"/></svg>"},"local-convenience-store":{"name":"local-convenience-store","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 7V4H5v3H2v13h8v-4h4v4h8V7h-3zm-8 3H9v1h2v1H8V9h2V8H8V7h3v3zm5 2h-1v-2h-2V7h1v2h1V7h1v5z\"/></svg>"},"local-dining":{"name":"local-dining","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z\"/></svg>"},"local-drink":{"name":"local-drink","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 2l2.01 18.23C5.13 21.23 5.97 22 7 22h10c1.03 0 1.87-.77 1.99-1.77L21 2H3zm9 17c-1.66 0-3-1.34-3-3 0-2 3-5.4 3-5.4s3 3.4 3 5.4c0 1.66-1.34 3-3 3zm6.33-11H5.67l-.44-4h13.53l-.43 4z\"/></svg>"},"local-florist":{"name":"local-florist","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zM5.6 10.25c0 1.38 1.12 2.5 2.5 2.5.53 0 1.01-.16 1.42-.44l-.02.19c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5l-.02-.19c.4.28.89.44 1.42.44 1.38 0 2.5-1.12 2.5-2.5 0-1-.59-1.85-1.43-2.25.84-.4 1.43-1.25 1.43-2.25 0-1.38-1.12-2.5-2.5-2.5-.53 0-1.01.16-1.42.44l.02-.19C14.5 2.12 13.38 1 12 1S9.5 2.12 9.5 3.5l.02.19c-.4-.28-.89-.44-1.42-.44-1.38 0-2.5 1.12-2.5 2.5 0 1 .59 1.85 1.43 2.25-.84.4-1.43 1.25-1.43 2.25zM12 5.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8s1.12-2.5 2.5-2.5zM3 13c0 4.97 4.03 9 9 9 0-4.97-4.03-9-9-9z\"/></svg>"},"local-gas-station":{"name":"local-gas-station","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z\"/></svg>"},"local-grocery-store":{"name":"local-grocery-store","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z\"/></svg>"},"local-hospital":{"name":"local-hospital","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z\"/></svg>"},"local-hotel":{"name":"local-hotel","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z\"/></svg>"},"local-laundry-service":{"name":"local-laundry-service","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9.17 16.83c1.56 1.56 4.1 1.56 5.66 0 1.56-1.56 1.56-4.1 0-5.66l-5.66 5.66zM18 2.01L6 2c-1.11 0-2 .89-2 2v16c0 1.11.89 2 2 2h12c1.11 0 2-.89 2-2V4c0-1.11-.89-1.99-2-1.99zM10 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM7 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm5 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z\"/></svg>"},"local-library":{"name":"local-library","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 11.55C9.64 9.35 6.48 8 3 8v11c3.48 0 6.64 1.35 9 3.55 2.36-2.19 5.52-3.55 9-3.55V8c-3.48 0-6.64 1.35-9 3.55zM12 8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z\"/></svg>"},"local-mall":{"name":"local-mall","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm0 10c-2.76 0-5-2.24-5-5h2c0 1.66 1.34 3 3 3s3-1.34 3-3h2c0 2.76-2.24 5-5 5z\"/></svg>"},"local-movies":{"name":"local-movies","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z\"/></svg>"},"local-offer":{"name":"local-offer","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z\"/></svg>"},"local-parking":{"name":"local-parking","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13 3H6v18h4v-6h3c3.31 0 6-2.69 6-6s-2.69-6-6-6zm.2 8H10V7h3.2c1.1 0 2 .9 2 2s-.9 2-2 2z\"/></svg>"},"local-pharmacy":{"name":"local-pharmacy","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 5h-2.64l1.14-3.14L17.15 1l-1.46 4H3v2l2 6-2 6v2h18v-2l-2-6 2-6V5zm-5 9h-3v3h-2v-3H8v-2h3V9h2v3h3v2z\"/></svg>"},"local-phone":{"name":"local-phone","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z\"/></svg>"},"local-pizza":{"name":"local-pizza","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C8.43 2 5.23 3.54 3.01 6L12 22l8.99-16C18.78 3.55 15.57 2 12 2zM7 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm5 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z\"/></svg>"},"local-play":{"name":"local-play","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 12c0-1.1.9-2 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-1.99.9-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2zm-4.42 4.8L12 14.5l-3.58 2.3 1.08-4.12-3.29-2.69 4.24-.25L12 5.8l1.54 3.95 4.24.25-3.29 2.69 1.09 4.11z\"/></svg>"},"local-post-office":{"name":"local-post-office","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z\"/></svg>"},"local-printshop":{"name":"local-printshop","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z\"/></svg>"},"local-see":{"name":"local-see","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"3.2\"/><path d=\"M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z\"/></svg>"},"local-shipping":{"name":"local-shipping","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z\"/></svg>"},"local-taxi":{"name":"local-taxi","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3H9v2H6.5c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z\"/></svg>"},"location-city":{"name":"location-city","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z\"/></svg>"},"location-disabled":{"name":"location-disabled","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20.94 11c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06c-1.13.12-2.19.46-3.16.97l1.5 1.5C10.16 5.19 11.06 5 12 5c3.87 0 7 3.13 7 7 0 .94-.19 1.84-.52 2.65l1.5 1.5c.5-.96.84-2.02.97-3.15H23v-2h-2.06zM3 4.27l2.04 2.04C3.97 7.62 3.25 9.23 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c1.77-.2 3.38-.91 4.69-1.98L19.73 21 21 19.73 4.27 3 3 4.27zm13.27 13.27C15.09 18.45 13.61 19 12 19c-3.87 0-7-3.13-7-7 0-1.61.55-3.09 1.46-4.27l9.81 9.81z\"/></svg>"},"location-off":{"name":"location-off","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 6.5c1.38 0 2.5 1.12 2.5 2.5 0 .74-.33 1.39-.83 1.85l3.63 3.63c.98-1.86 1.7-3.8 1.7-5.48 0-3.87-3.13-7-7-7-1.98 0-3.76.83-5.04 2.15l3.19 3.19c.46-.52 1.11-.84 1.85-.84zm4.37 9.6l-4.63-4.63-.11-.11L3.27 3 2 4.27l3.18 3.18C5.07 7.95 5 8.47 5 9c0 5.25 7 13 7 13s1.67-1.85 3.38-4.35L18.73 21 20 19.73l-3.63-3.63z\"/></svg>"},"location-on":{"name":"location-on","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z\"/></svg>"},"location-searching":{"name":"location-searching","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20.94 11c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z\"/></svg>"},"lock-open":{"name":"lock-open","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z\"/></svg>"},"lock-outline":{"name":"lock-outline","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H8.9V6zM18 20H6V10h12v10z\"/></svg>"},"lock":{"name":"lock","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z\"/></svg>"},"looks-3":{"name":"looks-3","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.01 3h-14c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 7.5c0 .83-.67 1.5-1.5 1.5.83 0 1.5.67 1.5 1.5V15c0 1.11-.9 2-2 2h-4v-2h4v-2h-2v-2h2V9h-4V7h4c1.1 0 2 .89 2 2v1.5z\"/></svg>"},"looks-4":{"name":"looks-4","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 14h-2v-4H9V7h2v4h2V7h2v10z\"/></svg>"},"looks-5":{"name":"looks-5","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 6h-4v2h2c1.1 0 2 .89 2 2v2c0 1.11-.9 2-2 2H9v-2h4v-2H9V7h6v2z\"/></svg>"},"looks-6":{"name":"looks-6","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11 15h2v-2h-2v2zm8-12H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 6h-4v2h2c1.1 0 2 .89 2 2v2c0 1.11-.9 2-2 2h-2c-1.1 0-2-.89-2-2V9c0-1.11.9-2 2-2h4v2z\"/></svg>"},"looks-one":{"name":"looks-one","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2V9h-2V7h4v10z\"/></svg>"},"looks-two":{"name":"looks-two","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 8c0 1.11-.9 2-2 2h-2v2h4v2H9v-4c0-1.11.9-2 2-2h2V9H9V7h4c1.1 0 2 .89 2 2v2z\"/></svg>"},"looks":{"name":"looks","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 10c-3.86 0-7 3.14-7 7h2c0-2.76 2.24-5 5-5s5 2.24 5 5h2c0-3.86-3.14-7-7-7zm0-4C5.93 6 1 10.93 1 17h2c0-4.96 4.04-9 9-9s9 4.04 9 9h2c0-6.07-4.93-11-11-11z\"/></svg>"},"loop":{"name":"loop","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z\"/></svg>"},"loupe":{"name":"loupe","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.49 2 2 6.49 2 12s4.49 10 10 10h8c1.1 0 2-.9 2-2v-8c0-5.51-4.49-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z\"/></svg>"},"low-priority":{"name":"low-priority","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14 5h8v2h-8zm0 5.5h8v2h-8zm0 5.5h8v2h-8zM2 11.5C2 15.08 4.92 18 8.5 18H9v2l3-3-3-3v2h-.5C6.02 16 4 13.98 4 11.5S6.02 7 8.5 7H12V5H8.5C4.92 5 2 7.92 2 11.5z\"/></svg>"},"loyalty":{"name":"loyalty","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7zm11.77 8.27L13 19.54l-4.27-4.27C8.28 14.81 8 14.19 8 13.5c0-1.38 1.12-2.5 2.5-2.5.69 0 1.32.28 1.77.74l.73.72.73-.73c.45-.45 1.08-.73 1.77-.73 1.38 0 2.5 1.12 2.5 2.5 0 .69-.28 1.32-.73 1.77z\"/></svg>"},"mail-outline":{"name":"mail-outline","svg":"<svg focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z\"/></svg>"},"mail":{"name":"mail","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z\"/></svg>"},"map":{"name":"map","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z\"/></svg>"},"markunread-mailbox":{"name":"markunread-mailbox","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 6H10v6H8V4h6V0H6v6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z\"/></svg>"},"markunread":{"name":"markunread","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z\"/></svg>"},"memory":{"name":"memory","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15 9H9v6h6V9zm-2 4h-2v-2h2v2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2zm-4 6H7V7h10v10z\"/></svg>"},"menu":{"name":"menu","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z\"/></svg>"},"merge-type":{"name":"merge-type","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 20.41L18.41 19 15 15.59 13.59 17 17 20.41zM7.5 8H11v5.59L5.59 19 7 20.41l6-6V8h3.5L12 3.5 7.5 8z\"/></svg>"},"message":{"name":"message","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z\"/></svg>"},"mic-none":{"name":"mic-none","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.2-9.1c0-.66.54-1.2 1.2-1.2.66 0 1.2.54 1.2 1.2l-.01 6.2c0 .66-.53 1.2-1.19 1.2-.66 0-1.2-.54-1.2-1.2V4.9zm6.5 6.1c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z\"/></svg>"},"mic-off":{"name":"mic-off","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z\"/></svg>"},"mic":{"name":"mic","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z\"/></svg>"},"mms":{"name":"mms","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM5 14l3.5-4.5 2.5 3.01L14.5 8l4.5 6H5z\"/></svg>"},"mode-comment":{"name":"mode-comment","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z\"/></svg>"},"mode-edit":{"name":"mode-edit","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z\"/></svg>"},"monetization-on":{"name":"monetization-on","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z\"/></svg>"},"money-off":{"name":"money-off","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12.5 6.9c1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-.53.12-1.03.3-1.48.54l1.47 1.47c.41-.17.91-.27 1.51-.27zM5.33 4.06L4.06 5.33 7.5 8.77c0 2.08 1.56 3.21 3.91 3.91l3.51 3.51c-.34.48-1.05.91-2.42.91-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c.96-.18 1.82-.55 2.45-1.12l2.22 2.22 1.27-1.27L5.33 4.06z\"/></svg>"},"monochrome-photos":{"name":"monochrome-photos","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 5h-3.2L15 3H9L7.2 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 14h-8v-1c-2.8 0-5-2.2-5-5s2.2-5 5-5V7h8v12zm-3-6c0-2.8-2.2-5-5-5v1.8c1.8 0 3.2 1.4 3.2 3.2s-1.4 3.2-3.2 3.2V18c2.8 0 5-2.2 5-5zm-8.2 0c0 1.8 1.4 3.2 3.2 3.2V9.8c-1.8 0-3.2 1.4-3.2 3.2z\"/></svg>"},"mood-bad":{"name":"mood-bad","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 3c-2.33 0-4.31 1.46-5.11 3.5h10.22c-.8-2.04-2.78-3.5-5.11-3.5z\"/></svg>"},"mood":{"name":"mood","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z\"/></svg>"},"more-horiz":{"name":"more-horiz","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z\"/></svg>"},"more-vert":{"name":"more-vert","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z\"/></svg>"},"more":{"name":"more","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.97.89 1.66.89H22c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 13.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z\"/></svg>"},"motorcycle":{"name":"motorcycle","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.44 9.03L15.41 5H11v2h3.59l2 2H5c-2.8 0-5 2.2-5 5s2.2 5 5 5c2.46 0 4.45-1.69 4.9-4h1.65l2.77-2.77c-.21.54-.32 1.14-.32 1.77 0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.65-1.97-4.77-4.56-4.97zM7.82 15C7.4 16.15 6.28 17 5 17c-1.63 0-3-1.37-3-3s1.37-3 3-3c1.28 0 2.4.85 2.82 2H5v2h2.82zM19 17c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z\"/></svg>"},"mouse":{"name":"mouse","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13 1.07V9h7c0-4.08-3.05-7.44-7-7.93zM4 15c0 4.42 3.58 8 8 8s8-3.58 8-8v-4H4v4zm7-13.93C7.05 1.56 4 4.92 4 9h7V1.07z\"/></svg>"},"move-to-inbox":{"name":"move-to-inbox","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3H4.99c-1.11 0-1.98.9-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10zm-3-5h-2V7h-4v3H8l4 4 4-4z\"/></svg>"},"movie-creation":{"name":"movie-creation","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z\"/></svg>"},"movie-filter":{"name":"movie-filter","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 4l2 3h-3l-2-3h-2l2 3h-3l-2-3H8l2 3H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4zm-6.75 11.25L10 18l-1.25-2.75L6 14l2.75-1.25L10 10l1.25 2.75L14 14l-2.75 1.25zm5.69-3.31L16 14l-.94-2.06L13 11l2.06-.94L16 8l.94 2.06L19 11l-2.06.94z\"/></svg>"},"movie":{"name":"movie","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z\"/></svg>"},"multiline-chart":{"name":"multiline-chart","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 6.92l-1.41-1.41-2.85 3.21C15.68 6.4 12.83 5 9.61 5 6.72 5 4.07 6.16 2 8l1.42 1.42C5.12 7.93 7.27 7 9.61 7c2.74 0 5.09 1.26 6.77 3.24l-2.88 3.24-4-4L2 16.99l1.5 1.5 6-6.01 4 4 4.05-4.55c.75 1.35 1.25 2.9 1.44 4.55H21c-.22-2.3-.95-4.39-2.04-6.14L22 6.92z\"/></svg>"},"music-note":{"name":"music-note","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z\"/></svg>"},"music-video":{"name":"music-video","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM8 15c0-1.66 1.34-3 3-3 .35 0 .69.07 1 .18V6h5v2h-3v7.03c-.02 1.64-1.35 2.97-3 2.97-1.66 0-3-1.34-3-3z\"/></svg>"},"my-location":{"name":"my-location","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z\"/></svg>"},"nature-people":{"name":"nature-people","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22.17 9.17c0-3.87-3.13-7-7-7s-7 3.13-7 7c0 3.47 2.52 6.34 5.83 6.89V20H6v-3h1v-4c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v4h1v5h16v-2h-3v-3.88c3.47-.41 6.17-3.36 6.17-6.95zM4.5 11c.83 0 1.5-.67 1.5-1.5S5.33 8 4.5 8 3 8.67 3 9.5 3.67 11 4.5 11z\"/></svg>"},"nature":{"name":"nature","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13 16.12c3.47-.41 6.17-3.36 6.17-6.95 0-3.87-3.13-7-7-7s-7 3.13-7 7c0 3.47 2.52 6.34 5.83 6.89V20H5v2h14v-2h-6v-3.88z\"/></svg>"},"navigate-before":{"name":"navigate-before","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z\"/></svg>"},"navigate-next":{"name":"navigate-next","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z\"/></svg>"},"navigation":{"name":"navigation","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z\"/></svg>"},"near-me":{"name":"near-me","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z\"/></svg>"},"network-cell":{"name":"network-cell","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M2 22h20V2z\"/><path d=\"M17 7L2 22h15z\"/></svg>"},"network-check":{"name":"network-check","svg":"<svg focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M15.9 5c-.17 0-.32.09-.41.23l-.07.15-5.18 11.65c-.16.29-.26.61-.26.96 0 1.11.9 2.01 2.01 2.01.96 0 1.77-.68 1.96-1.59l.01-.03L16.4 5.5c0-.28-.22-.5-.5-.5zM1 9l2 2c2.88-2.88 6.79-4.08 10.53-3.62l1.19-2.68C9.89 3.84 4.74 5.27 1 9zm20 2l2-2c-1.64-1.64-3.55-2.82-5.59-3.57l-.53 2.82c1.5.62 2.9 1.53 4.12 2.75zm-4 4l2-2c-.8-.8-1.7-1.42-2.66-1.89l-.55 2.92c.42.27.83.59 1.21.97zM5 13l2 2c1.13-1.13 2.56-1.79 4.03-2l1.28-2.88c-2.63-.08-5.3.87-7.31 2.88z\"/></svg>"},"network-locked":{"name":"network-locked","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.5 10c.17 0 .33.03.5.05V1L1 20h13v-3c0-.89.39-1.68 1-2.23v-.27c0-2.48 2.02-4.5 4.5-4.5zm2.5 6v-1.5c0-1.38-1.12-2.5-2.5-2.5S17 13.12 17 14.5V16c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1zm-1 0h-3v-1.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V16z\"/></svg>"},"network-wifi":{"name":"network-wifi","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z\"/><path d=\"M3.53 10.95l8.46 10.54.01.01.01-.01 8.46-10.54C20.04 10.62 16.81 8 12 8c-4.81 0-8.04 2.62-8.47 2.95z\"/></svg>"},"new-releases":{"name":"new-releases","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-10 5h-2v-2h2v2zm0-4h-2V7h2v6z\"/></svg>"},"next-week":{"name":"next-week","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill=\"#010101\" d=\"M20 7h-4V5c0-.55-.22-1.05-.59-1.41C15.05 3.22 14.55 3 14 3h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5zm1 13.5l-1-1 3-3-3-3 1-1 4 4-4 4z\"/></svg>"},"nfc":{"name":"nfc","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V4h16v16zM18 6h-5c-1.1 0-2 .9-2 2v2.28c-.6.35-1 .98-1 1.72 0 1.1.9 2 2 2s2-.9 2-2c0-.74-.4-1.38-1-1.72V8h3v8H8V8h2V6H6v12h12V6z\"/></svg>"},"no-encryption":{"name":"no-encryption","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 21.78L4.22 5 3 6.22l2.04 2.04C4.42 8.6 4 9.25 4 10v10c0 1.1.9 2 2 2h12c.23 0 .45-.05.66-.12L19.78 23 21 21.78zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H9.66L20 18.34V10c0-1.1-.9-2-2-2h-1V6c0-2.76-2.24-5-5-5-2.56 0-4.64 1.93-4.94 4.4L8.9 7.24V6z\"/></svg>"},"no-sim":{"name":"no-sim","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18.99 5c0-1.1-.89-2-1.99-2h-7L7.66 5.34 19 16.68 18.99 5zM3.65 3.88L2.38 5.15 5 7.77V19c0 1.1.9 2 2 2h10.01c.35 0 .67-.1.96-.26l1.88 1.88 1.27-1.27L3.65 3.88z\"/></svg>"},"not-interested":{"name":"not-interested","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z\"/></svg>"},"note-add":{"name":"note-add","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z\"/></svg>"},"note":{"name":"note","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 10l-6-6H4c-1.1 0-2 .9-2 2v12.01c0 1.1.9 1.99 2 1.99l16-.01c1.1 0 2-.89 2-1.99v-8zm-7-4.5l5.5 5.5H15V5.5z\"/></svg>"},"notifications-active":{"name":"notifications-active","svg":"<svg focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7.58 4.08L6.15 2.65C3.75 4.48 2.17 7.3 2.03 10.5h2c.15-2.65 1.51-4.97 3.55-6.42zm12.39 6.42h2c-.15-3.2-1.73-6.02-4.12-7.85l-1.42 1.43c2.02 1.45 3.39 3.77 3.54 6.42zM18 11c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2v-5zm-6 11c.14 0 .27-.01.4-.04.65-.14 1.18-.58 1.44-1.18.1-.24.15-.5.15-.78h-4c.01 1.1.9 2 2.01 2z\"/></svg>"},"notifications-none":{"name":"notifications-none","svg":"<svg focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z\"/></svg>"},"notifications-off":{"name":"notifications-off","svg":"<svg focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M20 18.69L7.84 6.14 5.27 3.49 4 4.76l2.8 2.8v.01c-.52.99-.8 2.16-.8 3.42v5l-2 2v1h13.73l2 2L21 19.72l-1-1.03zM12 22c1.11 0 2-.89 2-2h-4c0 1.11.89 2 2 2zm6-7.32V11c0-3.08-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c-.15.03-.29.08-.42.12-.1.03-.2.07-.3.11h-.01c-.01 0-.01 0-.02.01-.23.09-.46.2-.68.31 0 0-.01 0-.01.01L18 14.68z\"/></svg>"},"notifications-paused":{"name":"notifications-paused","svg":"<svg focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.93 6 11v5l-2 2v1h16v-1l-2-2zm-3.5-6.2l-2.8 3.4h2.8V15h-5v-1.8l2.8-3.4H9.5V8h5v1.8z\"/></svg>"},"notifications":{"name":"notifications","svg":"<svg focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z\"/></svg>"},"offline-pin":{"name":"offline-pin","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\"><path d=\"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm5 16H7v-2h10v2zm-6.7-4L7 10.7l1.4-1.4 1.9 1.9 5.3-5.3L17 7.3 10.3 14z\"/></svg>"},"ondemand-video":{"name":"ondemand-video","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.11-.9-2-2-2zm0 14H3V5h18v12zm-5-6l-7 4V7z\"/></svg>"},"opacity":{"name":"opacity","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17.66 8L12 2.35 6.34 8C4.78 9.56 4 11.64 4 13.64s.78 4.11 2.34 5.67 3.61 2.35 5.66 2.35 4.1-.79 5.66-2.35S20 15.64 20 13.64 19.22 9.56 17.66 8zM6 14c.01-2 .62-3.27 1.76-4.4L12 5.27l4.24 4.38C17.38 10.77 17.99 12 18 14H6z\"/></svg>"},"open-in-browser":{"name":"open-in-browser","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h4v-2H5V8h14v10h-4v2h4c1.1 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm-7 6l-4 4h3v6h2v-6h3l-4-4z\"/></svg>"},"open-in-new":{"name":"open-in-new","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z\"/></svg>"},"open-with":{"name":"open-with","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z\"/></svg>"},"pages":{"name":"pages","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 5v6h5L7 7l4 1V3H5c-1.1 0-2 .9-2 2zm5 8H3v6c0 1.1.9 2 2 2h6v-5l-4 1 1-4zm9 4l-4-1v5h6c1.1 0 2-.9 2-2v-6h-5l1 4zm2-14h-6v5l4-1-1 4h5V5c0-1.1-.9-2-2-2z\"/></svg>"},"pageview":{"name":"pageview","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11.5 9C10.12 9 9 10.12 9 11.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5S12.88 9 11.5 9zM20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-3.21 14.21l-2.91-2.91c-.69.44-1.51.7-2.39.7C9.01 16 7 13.99 7 11.5S9.01 7 11.5 7 16 9.01 16 11.5c0 .88-.26 1.69-.7 2.39l2.91 2.9-1.42 1.42z\"/></svg>"},"palette":{"name":"palette","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z\"/></svg>"},"pan-tool":{"name":"pan-tool","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M23 5.5V20c0 2.2-1.8 4-4 4h-7.3c-1.08 0-2.1-.43-2.85-1.19L1 14.83s1.26-1.23 1.3-1.25c.22-.19.49-.29.79-.29.22 0 .42.06.6.16.04.01 4.31 2.46 4.31 2.46V4c0-.83.67-1.5 1.5-1.5S11 3.17 11 4v7h1V1.5c0-.83.67-1.5 1.5-1.5S15 .67 15 1.5V11h1V2.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V11h1V5.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5z\"/></svg>"},"panorama-fish-eye":{"name":"panorama-fish-eye","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z\"/></svg>"},"panorama-horizontal":{"name":"panorama-horizontal","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 6.54v10.91c-2.6-.77-5.28-1.16-8-1.16-2.72 0-5.4.39-8 1.16V6.54c2.6.77 5.28 1.16 8 1.16 2.72.01 5.4-.38 8-1.16M21.43 4c-.1 0-.2.02-.31.06C18.18 5.16 15.09 5.7 12 5.7c-3.09 0-6.18-.55-9.12-1.64-.11-.04-.22-.06-.31-.06-.34 0-.57.23-.57.63v14.75c0 .39.23.62.57.62.1 0 .2-.02.31-.06 2.94-1.1 6.03-1.64 9.12-1.64 3.09 0 6.18.55 9.12 1.64.11.04.21.06.31.06.33 0 .57-.23.57-.63V4.63c0-.4-.24-.63-.57-.63z\"/></svg>"},"panorama-vertical":{"name":"panorama-vertical","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.94 21.12c-1.1-2.94-1.64-6.03-1.64-9.12 0-3.09.55-6.18 1.64-9.12.04-.11.06-.22.06-.31 0-.34-.23-.57-.63-.57H4.63c-.4 0-.63.23-.63.57 0 .1.02.2.06.31C5.16 5.82 5.71 8.91 5.71 12c0 3.09-.55 6.18-1.64 9.12-.05.11-.07.22-.07.31 0 .33.23.57.63.57h14.75c.39 0 .63-.24.63-.57-.01-.1-.03-.2-.07-.31zM6.54 20c.77-2.6 1.16-5.28 1.16-8 0-2.72-.39-5.4-1.16-8h10.91c-.77 2.6-1.16 5.28-1.16 8 0 2.72.39 5.4 1.16 8H6.54z\"/></svg>"},"panorama-wide-angle":{"name":"panorama-wide-angle","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 6c2.45 0 4.71.2 7.29.64.47 1.78.71 3.58.71 5.36 0 1.78-.24 3.58-.71 5.36-2.58.44-4.84.64-7.29.64s-4.71-.2-7.29-.64C4.24 15.58 4 13.78 4 12c0-1.78.24-3.58.71-5.36C7.29 6.2 9.55 6 12 6m0-2c-2.73 0-5.22.24-7.95.72l-.93.16-.25.9C2.29 7.85 2 9.93 2 12s.29 4.15.87 6.22l.25.89.93.16c2.73.49 5.22.73 7.95.73s5.22-.24 7.95-.72l.93-.16.25-.89c.58-2.08.87-4.16.87-6.23s-.29-4.15-.87-6.22l-.25-.89-.93-.16C17.22 4.24 14.73 4 12 4z\"/></svg>"},"panorama":{"name":"panorama","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M23 18V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zM8.5 12.5l2.5 3.01L14.5 11l4.5 6H5l3.5-4.5z\"/></svg>"},"party-mode":{"name":"party-mode","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 3c1.63 0 3.06.79 3.98 2H12c-1.66 0-3 1.34-3 3 0 .35.07.69.18 1H7.1c-.06-.32-.1-.66-.1-1 0-2.76 2.24-5 5-5zm0 10c-1.63 0-3.06-.79-3.98-2H12c1.66 0 3-1.34 3-3 0-.35-.07-.69-.18-1h2.08c.07.32.1.66.1 1 0 2.76-2.24 5-5 5z\"/></svg>"},"pause-circle-filled":{"name":"pause-circle-filled","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z\"/></svg>"},"pause-circle-outline":{"name":"pause-circle-outline","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9 16h2V8H9v8zm3-14C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-4h2V8h-2v8z\"/></svg>"},"pause":{"name":"pause","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6 19h4V5H6v14zm8-14v14h4V5h-4z\"/></svg>"},"payment":{"name":"payment","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z\"/></svg>"},"people-outline":{"name":"people-outline","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16.5 13c-1.2 0-3.07.34-4.5 1-1.43-.67-3.3-1-4.5-1C5.33 13 1 14.08 1 16.25V19h22v-2.75c0-2.17-4.33-3.25-6.5-3.25zm-4 4.5h-10v-1.25c0-.54 2.56-1.75 5-1.75s5 1.21 5 1.75v1.25zm9 0H14v-1.25c0-.46-.2-.86-.52-1.22.88-.3 1.96-.53 3.02-.53 2.44 0 5 1.21 5 1.75v1.25zM7.5 12c1.93 0 3.5-1.57 3.5-3.5S9.43 5 7.5 5 4 6.57 4 8.5 5.57 12 7.5 12zm0-5.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 5.5c1.93 0 3.5-1.57 3.5-3.5S18.43 5 16.5 5 13 6.57 13 8.5s1.57 3.5 3.5 3.5zm0-5.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z\"/></svg>"},"people":{"name":"people","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z\"/></svg>"},"perm-camera-mic":{"name":"perm-camera-mic","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v-2.09c-2.83-.48-5-2.94-5-5.91h2c0 2.21 1.79 4 4 4s4-1.79 4-4h2c0 2.97-2.17 5.43-5 5.91V21h7c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-6 8c0 1.1-.9 2-2 2s-2-.9-2-2V9c0-1.1.9-2 2-2s2 .9 2 2v4z\"/></svg>"},"perm-contact-calendar":{"name":"perm-contact-calendar","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1z\"/></svg>"},"perm-data-setting":{"name":"perm-data-setting","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18.99 11.5c.34 0 .67.03 1 .07L20 0 0 20h11.56c-.04-.33-.07-.66-.07-1 0-4.14 3.36-7.5 7.5-7.5zm3.71 7.99c.02-.16.04-.32.04-.49 0-.17-.01-.33-.04-.49l1.06-.83c.09-.08.12-.21.06-.32l-1-1.73c-.06-.11-.19-.15-.31-.11l-1.24.5c-.26-.2-.54-.37-.85-.49l-.19-1.32c-.01-.12-.12-.21-.24-.21h-2c-.12 0-.23.09-.25.21l-.19 1.32c-.3.13-.59.29-.85.49l-1.24-.5c-.11-.04-.24 0-.31.11l-1 1.73c-.06.11-.04.24.06.32l1.06.83c-.02.16-.03.32-.03.49 0 .17.01.33.03.49l-1.06.83c-.09.08-.12.21-.06.32l1 1.73c.06.11.19.15.31.11l1.24-.5c.26.2.54.37.85.49l.19 1.32c.02.12.12.21.25.21h2c.12 0 .23-.09.25-.21l.19-1.32c.3-.13.59-.29.84-.49l1.25.5c.11.04.24 0 .31-.11l1-1.73c.06-.11.03-.24-.06-.32l-1.07-.83zm-3.71 1.01c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z\"/></svg>"},"perm-device-information":{"name":"perm-device-information","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13 7h-2v2h2V7zm0 4h-2v6h2v-6zm4-9.99L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z\"/></svg>"},"perm-identity":{"name":"perm-identity","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z\"/></svg>"},"perm-media":{"name":"perm-media","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M2 6H0v5h.01L0 20c0 1.1.9 2 2 2h18v-2H2V6zm20-2h-8l-2-2H6c-1.1 0-1.99.9-1.99 2L4 16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM7 15l4.5-6 3.5 4.51 2.5-3.01L21 15H7z\"/></svg>"},"perm-phone-msg":{"name":"perm-phone-msg","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.58l2.2-2.21c.28-.27.36-.66.25-1.01C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM12 3v10l3-3h6V3h-9z\"/></svg>"},"perm-scan-wifi":{"name":"perm-scan-wifi","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 3C6.95 3 3.15 4.85 0 7.23L12 22 24 7.25C20.85 4.87 17.05 3 12 3zm1 13h-2v-6h2v6zm-2-8V6h2v2h-2z\"/></svg>"},"person-add":{"name":"person-add","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z\"/></svg>"},"person-outline":{"name":"person-outline","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z\"/></svg>"},"person-pin-circle":{"name":"person-pin-circle","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 2c1.1 0 2 .9 2 2 0 1.11-.9 2-2 2s-2-.89-2-2c0-1.1.9-2 2-2zm0 10c-1.67 0-3.14-.85-4-2.15.02-1.32 2.67-2.05 4-2.05s3.98.73 4 2.05c-.86 1.3-2.33 2.15-4 2.15z\"/></svg>"},"person-pin":{"name":"person-pin","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 3.3c1.49 0 2.7 1.21 2.7 2.7 0 1.49-1.21 2.7-2.7 2.7-1.49 0-2.7-1.21-2.7-2.7 0-1.49 1.21-2.7 2.7-2.7zM18 16H6v-.9c0-2 4-3.1 6-3.1s6 1.1 6 3.1v.9z\"/></svg>"},"person":{"name":"person","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z\"/></svg>"},"personal-video":{"name":"personal-video","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.11-.9-2-2-2zm0 14H3V5h18v12z\"/></svg>"},"pets":{"name":"pets","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><circle cx=\"4.5\" cy=\"9.5\" r=\"2.5\"/><circle cx=\"9\" cy=\"5.5\" r=\"2.5\"/><circle cx=\"15\" cy=\"5.5\" r=\"2.5\"/><circle cx=\"19.5\" cy=\"9.5\" r=\"2.5\"/><path d=\"M17.34 14.86c-.87-1.02-1.6-1.89-2.48-2.91-.46-.54-1.05-1.08-1.75-1.32-.11-.04-.22-.07-.33-.09-.25-.04-.52-.04-.78-.04s-.53 0-.79.05c-.11.02-.22.05-.33.09-.7.24-1.28.78-1.75 1.32-.87 1.02-1.6 1.89-2.48 2.91-1.31 1.31-2.92 2.76-2.62 4.79.29 1.02 1.02 2.03 2.33 2.32.73.15 3.06-.44 5.54-.44h.18c2.48 0 4.81.58 5.54.44 1.31-.29 2.04-1.31 2.33-2.32.31-2.04-1.3-3.49-2.61-4.8z\"/></svg>"},"phone-android":{"name":"phone-android","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16 1H8C6.34 1 5 2.34 5 4v16c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V4c0-1.66-1.34-3-3-3zm-2 20h-4v-1h4v1zm3.25-3H6.75V4h10.5v14z\"/></svg>"},"phone-bluetooth-speaker":{"name":"phone-bluetooth-speaker","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14.71 9.5L17 7.21V11h.5l2.85-2.85L18.21 6l2.15-2.15L17.5 1H17v3.79L14.71 2.5l-.71.71L16.79 6 14 8.79l.71.71zM18 2.91l.94.94-.94.94V2.91zm0 4.3l.94.94-.94.94V7.21zm2 8.29c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z\"/></svg>"},"phone-forwarded":{"name":"phone-forwarded","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 11l5-5-5-5v3h-4v4h4v3zm2 4.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z\"/></svg>"},"phone-in-talk":{"name":"phone-in-talk","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM19 12h2c0-4.97-4.03-9-9-9v2c3.87 0 7 3.13 7 7zm-4 0h2c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3z\"/></svg>"},"phone-iphone":{"name":"phone-iphone","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z\"/></svg>"},"phone-locked":{"name":"phone-locked","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM20 4v-.5C20 2.12 18.88 1 17.5 1S15 2.12 15 3.5V4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h5c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zm-.8 0h-3.4v-.5c0-.94.76-1.7 1.7-1.7s1.7.76 1.7 1.7V4z\"/></svg>"},"phone-missed":{"name":"phone-missed","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6.5 5.5L12 11l7-7-1-1-6 6-4.5-4.5H11V3H5v6h1.5V5.5zm17.21 11.17C20.66 13.78 16.54 12 12 12 7.46 12 3.34 13.78.29 16.67c-.18.18-.29.43-.29.71s.11.53.29.71l2.48 2.48c.18.18.43.29.71.29.27 0 .52-.11.7-.28.79-.74 1.69-1.36 2.66-1.85.33-.16.56-.5.56-.9v-3.1c1.45-.48 3-.73 4.6-.73 1.6 0 3.15.25 4.6.72v3.1c0 .39.23.74.56.9.98.49 1.87 1.12 2.67 1.85.18.18.43.28.7.28.28 0 .53-.11.71-.29l2.48-2.48c.18-.18.29-.43.29-.71s-.12-.52-.3-.7z\"/></svg>"},"phone-paused":{"name":"phone-paused","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 3h-2v7h2V3zm3 12.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM19 3v7h2V3h-2z\"/></svg>"},"phone":{"name":"phone","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z\"/></svg>"},"phonelink-erase":{"name":"phonelink-erase","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13 8.2l-1-1-4 4-4-4-1 1 4 4-4 4 1 1 4-4 4 4 1-1-4-4 4-4zM19 1H9c-1.1 0-2 .9-2 2v3h2V4h10v16H9v-2H7v3c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z\"/></svg>"},"phonelink-lock":{"name":"phonelink-lock","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 1H9c-1.1 0-2 .9-2 2v3h2V4h10v16H9v-2H7v3c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm-8.2 10V9.5C10.8 8.1 9.4 7 8 7S5.2 8.1 5.2 9.5V11c-.6 0-1.2.6-1.2 1.2v3.5c0 .7.6 1.3 1.2 1.3h5.5c.7 0 1.3-.6 1.3-1.2v-3.5c0-.7-.6-1.3-1.2-1.3zm-1.3 0h-3V9.5c0-.8.7-1.3 1.5-1.3s1.5.5 1.5 1.3V11z\"/></svg>"},"phonelink-off":{"name":"phonelink-off","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 6V4H6.82l2 2H22zM1.92 1.65L.65 2.92l1.82 1.82C2.18 5.08 2 5.52 2 6v11H0v3h17.73l2.35 2.35 1.27-1.27L3.89 3.62 1.92 1.65zM4 6.27L14.73 17H4V6.27zM23 8h-6c-.55 0-1 .45-1 1v4.18l2 2V10h4v7h-2.18l3 3H23c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1z\"/></svg>"},"phonelink-ring":{"name":"phonelink-ring","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20.1 7.7l-1 1c1.8 1.8 1.8 4.6 0 6.5l1 1c2.5-2.3 2.5-6.1 0-8.5zM18 9.8l-1 1c.5.7.5 1.6 0 2.3l1 1c1.2-1.2 1.2-3 0-4.3zM14 1H4c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 19H4V4h10v16z\"/></svg>"},"phonelink-setup":{"name":"phonelink-setup","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11.8 12.5v-1l1.1-.8c.1-.1.1-.2.1-.3l-1-1.7c-.1-.1-.2-.2-.3-.1l-1.3.4c-.3-.2-.6-.4-.9-.5l-.2-1.3c0-.1-.1-.2-.3-.2H7c-.1 0-.2.1-.3.2l-.2 1.3c-.3.1-.6.3-.9.5l-1.3-.5c-.1 0-.2 0-.3.1l-1 1.7c-.1.1 0 .2.1.3l1.1.8v1l-1.1.8c-.1.2-.1.3-.1.4l1 1.7c.1.1.2.2.3.1l1.4-.4c.3.2.6.4.9.5l.2 1.3c-.1.1.1.2.2.2h2c.1 0 .2-.1.3-.2l.2-1.3c.3-.1.6-.3.9-.5l1.3.5c.1 0 .2 0 .3-.1l1-1.7c.1-.1 0-.2-.1-.3l-1.1-.9zM8 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM19 1H9c-1.1 0-2 .9-2 2v3h2V4h10v16H9v-2H7v3c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z\"/></svg>"},"phonelink":{"name":"phonelink","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z\"/></svg>"},"photo-album":{"name":"photo-album","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4zm0 15l3-3.86 2.14 2.58 3-3.86L18 19H6z\"/></svg>"},"photo-camera":{"name":"photo-camera","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"3.2\"/><path d=\"M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z\"/></svg>"},"photo-filter":{"name":"photo-filter","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.02 10v9H5V5h9V3H5.02c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-9h-2zM17 10l.94-2.06L20 7l-2.06-.94L17 4l-.94 2.06L14 7l2.06.94zm-3.75.75L12 8l-1.25 2.75L8 12l2.75 1.25L12 16l1.25-2.75L16 12z\"/></svg>"},"photo-library":{"name":"photo-library","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z\"/></svg>"},"photo-size-select-actual":{"name":"photo-size-select-actual","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 3H3C2 3 1 4 1 5v14c0 1.1.9 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zM5 17l3.5-4.5 2.5 3.01L14.5 11l4.5 6H5z\"/></svg>"},"photo-size-select-large":{"name":"photo-size-select-large","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 15h2v2h-2v-2zm0-4h2v2h-2v-2zm2 8h-2v2c1 0 2-1 2-2zM13 3h2v2h-2V3zm8 4h2v2h-2V7zm0-4v2h2c0-1-1-2-2-2zM1 7h2v2H1V7zm16-4h2v2h-2V3zm0 16h2v2h-2v-2zM3 3C2 3 1 4 1 5h2V3zm6 0h2v2H9V3zM5 3h2v2H5V3zm-4 8v8c0 1.1.9 2 2 2h12V11H1zm2 8l2.5-3.21 1.79 2.15 2.5-3.22L13 19H3z\"/></svg>"},"photo-size-select-small":{"name":"photo-size-select-small","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M23 15h-2v2h2v-2zm0-4h-2v2h2v-2zm0 8h-2v2c1 0 2-1 2-2zM15 3h-2v2h2V3zm8 4h-2v2h2V7zm-2-4v2h2c0-1-1-2-2-2zM3 21h8v-6H1v4c0 1.1.9 2 2 2zM3 7H1v2h2V7zm12 12h-2v2h2v-2zm4-16h-2v2h2V3zm0 16h-2v2h2v-2zM3 3C2 3 1 4 1 5h2V3zm0 8H1v2h2v-2zm8-8H9v2h2V3zM7 3H5v2h2V3z\"/></svg>"},"photo":{"name":"photo","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z\"/></svg>"},"picture-as-pdf":{"name":"picture-as-pdf","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z\"/></svg>"},"picture-in-picture-alt":{"name":"picture-in-picture-alt","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z\"/></svg>"},"picture-in-picture":{"name":"picture-in-picture","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z\"/></svg>"},"pie-chart-outlined":{"name":"pie-chart-outlined","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 2.07c3.61.45 6.48 3.33 6.93 6.93H13V4.07zM4 12c0-4.06 3.07-7.44 7-7.93v15.87c-3.93-.5-7-3.88-7-7.94zm9 7.93V13h6.93c-.45 3.61-3.32 6.48-6.93 6.93z\"/></svg>"},"pie-chart":{"name":"pie-chart","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47-4.74-4.24-8.52-8.97-8.99zm0 11.01V22c4.74-.47 8.5-4.25 8.97-8.99h-8.97z\"/></svg>"},"pin-drop":{"name":"pin-drop","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 8c0-3.31-2.69-6-6-6S6 4.69 6 8c0 4.5 6 11 6 11s6-6.5 6-11zm-8 0c0-1.1.9-2 2-2s2 .9 2 2-.89 2-2 2c-1.1 0-2-.9-2-2zM5 20v2h14v-2H5z\"/></svg>"},"place":{"name":"place","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z\"/></svg>"},"play-arrow":{"name":"play-arrow","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M8 5v14l11-7z\"/></svg>"},"play-circle-filled":{"name":"play-circle-filled","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z\"/></svg>"},"play-circle-outline":{"name":"play-circle-outline","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z\"/></svg>"},"play-for-work":{"name":"play-for-work","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11 5v5.59H7.5l4.5 4.5 4.5-4.5H13V5h-2zm-5 9c0 3.31 2.69 6 6 6s6-2.69 6-6h-2c0 2.21-1.79 4-4 4s-4-1.79-4-4H6z\"/></svg>"},"playlist-add-check":{"name":"playlist-add-check","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14 10H2v2h12v-2zm0-4H2v2h12V6zM2 16h8v-2H2v2zm19.5-4.5L23 13l-6.99 7-4.51-4.5L13 14l3.01 3 5.49-5.5z\"/></svg>"},"playlist-add":{"name":"playlist-add","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z\"/></svg>"},"playlist-play":{"name":"playlist-play","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 9H2v2h17V9zm0-4H2v2h17V5zM2 15h13v-2H2v2zm15-2v6l5-3-5-3z\"/></svg>"},"plus-one":{"name":"plus-one","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 8H8v4H4v2h4v4h2v-4h4v-2h-4zm4.5-1.92V7.9l2.5-.5V18h2V5z\"/></svg>"},"poll":{"name":"poll","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z\"/></svg>"},"polymer":{"name":"polymer","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 4h-4L7.11 16.63 4.5 12 9 4H5L.5 12 5 20h4l7.89-12.63L19.5 12 15 20h4l4.5-8z\"/></svg>"},"pool":{"name":"pool","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 21c-1.11 0-1.73-.37-2.18-.64-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.46.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.46.27-1.08.64-2.19.64-1.11 0-1.73-.37-2.18-.64-.37-.23-.6-.36-1.15-.36s-.78.13-1.15.36c-.46.27-1.08.64-2.19.64v-2c.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64s1.73.37 2.18.64c.37.23.59.36 1.15.36.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64 1.11 0 1.73.37 2.18.64.37.22.6.36 1.15.36s.78-.13 1.15-.36c.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.23.59.36 1.15.36v2zm0-4.5c-1.11 0-1.73-.37-2.18-.64-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36s-.78.13-1.15.36c-.47.27-1.09.64-2.2.64v-2c.56 0 .78-.13 1.15-.36.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36.56 0 .78-.13 1.15-.36.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36s.78-.13 1.15-.36c.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36v2zM8.67 12c.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64 1.11 0 1.73.37 2.18.64.37.22.6.36 1.15.36s.78-.13 1.15-.36c.12-.07.26-.15.41-.23L10.48 5C8.93 3.45 7.5 2.99 5 3v2.5c1.82-.01 2.89.39 4 1.5l1 1-3.25 3.25c.31.12.56.27.77.39.37.23.59.36 1.15.36z\"/><circle cx=\"16.5\" cy=\"5.5\" r=\"2.5\"/></svg>"},"portable-wifi-off":{"name":"portable-wifi-off","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17.56 14.24c.28-.69.44-1.45.44-2.24 0-3.31-2.69-6-6-6-.79 0-1.55.16-2.24.44l1.62 1.62c.2-.03.41-.06.62-.06 2.21 0 4 1.79 4 4 0 .21-.02.42-.05.63l1.61 1.61zM12 4c4.42 0 8 3.58 8 8 0 1.35-.35 2.62-.95 3.74l1.47 1.47C21.46 15.69 22 13.91 22 12c0-5.52-4.48-10-10-10-1.91 0-3.69.55-5.21 1.47l1.46 1.46C9.37 4.34 10.65 4 12 4zM3.27 2.5L2 3.77l2.1 2.1C2.79 7.57 2 9.69 2 12c0 3.7 2.01 6.92 4.99 8.65l1-1.73C5.61 17.53 4 14.96 4 12c0-1.76.57-3.38 1.53-4.69l1.43 1.44C6.36 9.68 6 10.8 6 12c0 2.22 1.21 4.15 3 5.19l1-1.74c-1.19-.7-2-1.97-2-3.45 0-.65.17-1.25.44-1.79l1.58 1.58L10 12c0 1.1.9 2 2 2l.21-.02.01.01 7.51 7.51L21 20.23 4.27 3.5l-1-1z\"/></svg>"},"portrait":{"name":"portrait","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 12.25c1.24 0 2.25-1.01 2.25-2.25S13.24 7.75 12 7.75 9.75 8.76 9.75 10s1.01 2.25 2.25 2.25zm4.5 4c0-1.5-3-2.25-4.5-2.25s-4.5.75-4.5 2.25V17h9v-.75zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z\"/></svg>"},"power-input":{"name":"power-input","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M2 9v2h19V9H2zm0 6h5v-2H2v2zm7 0h5v-2H9v2zm7 0h5v-2h-5v2z\"/></svg>"},"power-settings-new":{"name":"power-settings-new","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z\"/></svg>"},"power":{"name":"power","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16.01 7L16 3h-2v4h-4V3H8v4h-.01C7 6.99 6 7.99 6 8.99v5.49L9.5 18v3h5v-3l3.5-3.51v-5.5c0-1-1-2-1.99-1.99z\"/></svg>"},"pregnant-woman":{"name":"pregnant-woman","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm7 9c-.01-1.34-.83-2.51-2-3 0-1.66-1.34-3-3-3s-3 1.34-3 3v7h2v5h3v-5h3v-4z\"/></svg>"},"present-to-all":{"name":"present-to-all","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 3H3c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h18c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 16.02H3V4.98h18v14.04zM10 12H8l4-4 4 4h-2v4h-4v-4z\"/></svg>"},"print":{"name":"print","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z\"/></svg>"},"priority-high":{"name":"priority-high","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"19\" r=\"2\"/><path d=\"M10 3h4v12h-4z\"/></svg>"},"public":{"name":"public","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z\"/></svg>"},"publish":{"name":"publish","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M5 4v2h14V4H5zm0 10h4v6h6v-6h4l-7-7-7 7z\"/></svg>"},"query-builder":{"name":"query-builder","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z\"/></svg>"},"question-answer":{"name":"question-answer","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z\"/></svg>"},"queue-music":{"name":"queue-music","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z\"/></svg>"},"queue-play-next":{"name":"queue-play-next","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h5v2h8v-2h2v-2H3V5h18v8h2V5c0-1.11-.9-2-2-2zm-8 7V7h-2v3H8v2h3v3h2v-3h3v-2h-3zm11 8l-4.5 4.5L18 21l3-3-3-3 1.5-1.5L24 18z\"/></svg>"},"queue":{"name":"queue","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z\"/></svg>"},"radio-button-checked":{"name":"radio-button-checked","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z\"/></svg>"},"radio-button-unchecked":{"name":"radio-button-unchecked","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z\"/></svg>"},"radio":{"name":"radio","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3.24 6.15C2.51 6.43 2 7.17 2 8v12c0 1.1.89 2 2 2h16c1.11 0 2-.9 2-2V8c0-1.11-.89-2-2-2H8.3l8.26-3.34L15.88 1 3.24 6.15zM7 20c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-8h-2v-2h-2v2H4V8h16v4z\"/></svg>"},"rate-review":{"name":"rate-review","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 14v-2.47l6.88-6.88c.2-.2.51-.2.71 0l1.77 1.77c.2.2.2.51 0 .71L8.47 14H6zm12 0h-7.5l2-2H18v2z\"/></svg>"},"receipt":{"name":"receipt","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z\"/></svg>"},"recent-actors":{"name":"recent-actors","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 5v14h2V5h-2zm-4 14h2V5h-2v14zM14 5H2c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zM8 7.75c1.24 0 2.25 1.01 2.25 2.25S9.24 12.25 8 12.25 5.75 11.24 5.75 10 6.76 7.75 8 7.75zM12.5 17h-9v-.75c0-1.5 3-2.25 4.5-2.25s4.5.75 4.5 2.25V17z\"/></svg>"},"record-voice-over":{"name":"record-voice-over","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><circle cx=\"9\" cy=\"9\" r=\"4\"/><path d=\"M9 15c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm7.76-9.64l-1.68 1.69c.84 1.18.84 2.71 0 3.89l1.68 1.69c2.02-2.02 2.02-5.07 0-7.27zM20.07 2l-1.63 1.63c2.77 3.02 2.77 7.56 0 10.74L20.07 16c3.9-3.89 3.91-9.95 0-14z\"/></svg>"},"redeem":{"name":"redeem","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z\"/></svg>"},"redo":{"name":"redo","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z\"/></svg>"},"refresh":{"name":"refresh","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z\"/></svg>"},"remove-circle-outline":{"name":"remove-circle-outline","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 11v2h10v-2H7zm5-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z\"/></svg>"},"remove-circle":{"name":"remove-circle","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z\"/></svg>"},"remove-from-queue":{"name":"remove-from-queue","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.11-.9-2-2-2zm0 14H3V5h18v12zm-5-7v2H8v-2h8z\"/></svg>"},"remove-red-eye":{"name":"remove-red-eye","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z\"/></svg>"},"remove-shopping-cart":{"name":"remove-shopping-cart","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22.73 22.73L2.77 2.77 2 2l-.73-.73L0 2.54l4.39 4.39 2.21 4.66-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h7.46l1.38 1.38c-.5.36-.83.95-.83 1.62 0 1.1.89 2 1.99 2 .67 0 1.26-.33 1.62-.84L21.46 24l1.27-1.27zM7.42 15c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h2.36l2 2H7.42zm8.13-2c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H6.54l9.01 9zM7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2z\"/></svg>"},"remove":{"name":"remove","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 13H5v-2h14v2z\"/></svg>"},"reorder":{"name":"reorder","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2zm0-6v2h18V5H3z\"/></svg>"},"repeat-one":{"name":"repeat-one","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z\"/></svg>"},"repeat":{"name":"repeat","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z\"/></svg>"},"replay-10":{"name":"replay-10","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 5V1L7 6l5 5V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8zm-1.1 11H10v-3.3L9 13v-.7l1.8-.6h.1V16zm4.3-1.8c0 .3 0 .6-.1.8l-.3.6s-.3.3-.5.3-.4.1-.6.1-.4 0-.6-.1-.3-.2-.5-.3-.2-.3-.3-.6-.1-.5-.1-.8v-.7c0-.3 0-.6.1-.8l.3-.6s.3-.3.5-.3.4-.1.6-.1.4 0 .6.1c.2.1.3.2.5.3s.2.3.3.6.1.5.1.8v.7zm-.9-.8v-.5s-.1-.2-.1-.3-.1-.1-.2-.2-.2-.1-.3-.1-.2 0-.3.1l-.2.2s-.1.2-.1.3v2s.1.2.1.3.1.1.2.2.2.1.3.1.2 0 .3-.1l.2-.2s.1-.2.1-.3v-1.5z\"/></svg>"},"replay-30":{"name":"replay-30","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 5V1L7 6l5 5V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8zm-2.4 8.5h.4c.2 0 .4-.1.5-.2s.2-.2.2-.4v-.2s-.1-.1-.1-.2-.1-.1-.2-.1h-.5s-.1.1-.2.1-.1.1-.1.2v.2h-1c0-.2 0-.3.1-.5s.2-.3.3-.4.3-.2.4-.2.4-.1.5-.1c.2 0 .4 0 .6.1s.3.1.5.2.2.2.3.4.1.3.1.5v.3s-.1.2-.1.3-.1.2-.2.2-.2.1-.3.2c.2.1.4.2.5.4s.2.4.2.6c0 .2 0 .4-.1.5s-.2.3-.3.4-.3.2-.5.2-.4.1-.6.1c-.2 0-.4 0-.5-.1s-.3-.1-.5-.2-.2-.2-.3-.4-.1-.4-.1-.6h.8v.2s.1.1.1.2.1.1.2.1h.5s.1-.1.2-.1.1-.1.1-.2v-.5s-.1-.1-.1-.2-.1-.1-.2-.1h-.6v-.7zm5.7.7c0 .3 0 .6-.1.8l-.3.6s-.3.3-.5.3-.4.1-.6.1-.4 0-.6-.1-.3-.2-.5-.3-.2-.3-.3-.6-.1-.5-.1-.8v-.7c0-.3 0-.6.1-.8l.3-.6s.3-.3.5-.3.4-.1.6-.1.4 0 .6.1.3.2.5.3.2.3.3.6.1.5.1.8v.7zm-.8-.8v-.5c0-.1-.1-.2-.1-.3s-.1-.1-.2-.2-.2-.1-.3-.1-.2 0-.3.1l-.2.2s-.1.2-.1.3v2s.1.2.1.3.1.1.2.2.2.1.3.1.2 0 .3-.1l.2-.2s.1-.2.1-.3v-1.5z\"/></svg>"},"replay-5":{"name":"replay-5","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 5V1L7 6l5 5V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8zm-1.3 8.9l.2-2.2h2.4v.7h-1.7l-.1.9s.1 0 .1-.1.1 0 .1-.1.1 0 .2 0h.2c.2 0 .4 0 .5.1s.3.2.4.3.2.3.3.5.1.4.1.6c0 .2 0 .4-.1.5s-.1.3-.3.5-.3.2-.4.3-.4.1-.6.1c-.2 0-.4 0-.5-.1s-.3-.1-.5-.2-.2-.2-.3-.4-.1-.3-.1-.5h.8c0 .2.1.3.2.4s.2.1.4.1c.1 0 .2 0 .3-.1l.2-.2s.1-.2.1-.3v-.6l-.1-.2-.2-.2s-.2-.1-.3-.1h-.2s-.1 0-.2.1-.1 0-.1.1-.1.1-.1.1h-.7z\"/></svg>"},"replay":{"name":"replay","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z\"/></svg>"},"reply-all":{"name":"reply-all","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 8V5l-7 7 7 7v-3l-4-4 4-4zm6 1V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z\"/></svg>"},"reply":{"name":"reply","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z\"/></svg>"},"report-problem":{"name":"report-problem","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z\"/></svg>"},"report":{"name":"report","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z\"/></svg>"},"restaurant-menu":{"name":"restaurant-menu","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z\"/></svg>"},"restaurant":{"name":"restaurant","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z\"/></svg>"},"restore-page":{"name":"restore-page","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-2 16c-2.05 0-3.81-1.24-4.58-3h1.71c.63.9 1.68 1.5 2.87 1.5 1.93 0 3.5-1.57 3.5-3.5S13.93 9.5 12 9.5c-1.35 0-2.52.78-3.1 1.9l1.6 1.6h-4V9l1.3 1.3C8.69 8.92 10.23 8 12 8c2.76 0 5 2.24 5 5s-2.24 5-5 5z\"/></svg>"},"restore":{"name":"restore","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z\"/></svg>"},"ring-volume":{"name":"ring-volume","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M23.71 16.67C20.66 13.78 16.54 12 12 12 7.46 12 3.34 13.78.29 16.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l2.48 2.48c.18.18.43.29.71.29.27 0 .52-.11.7-.28.79-.74 1.69-1.36 2.66-1.85.33-.16.56-.5.56-.9v-3.1c1.45-.48 3-.73 4.6-.73s3.15.25 4.6.72v3.1c0 .39.23.74.56.9.98.49 1.87 1.12 2.66 1.85.18.18.43.28.7.28.28 0 .53-.11.71-.29l2.48-2.48c.18-.18.29-.43.29-.71 0-.27-.11-.52-.29-.7zM21.16 6.26l-1.41-1.41-3.56 3.55 1.41 1.41s3.45-3.52 3.56-3.55zM13 2h-2v5h2V2zM6.4 9.81L7.81 8.4 4.26 4.84 2.84 6.26c.11.03 3.56 3.55 3.56 3.55z\"/></svg>"},"room-service":{"name":"room-service","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M2 17h20v2H2zm11.84-9.21c.1-.24.16-.51.16-.79 0-1.1-.9-2-2-2s-2 .9-2 2c0 .28.06.55.16.79C6.25 8.6 3.27 11.93 3 16h18c-.27-4.07-3.25-7.4-7.16-8.21z\"/></svg>"},"room":{"name":"room","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z\"/></svg>"},"rotate-90-degrees-ccw":{"name":"rotate-90-degrees-ccw","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7.34 6.41L.86 12.9l6.49 6.48 6.49-6.48-6.5-6.49zM3.69 12.9l3.66-3.66L11 12.9l-3.66 3.66-3.65-3.66zm15.67-6.26C17.61 4.88 15.3 4 13 4V.76L8.76 5 13 9.24V6c1.79 0 3.58.68 4.95 2.05 2.73 2.73 2.73 7.17 0 9.9C16.58 19.32 14.79 20 13 20c-.97 0-1.94-.21-2.84-.61l-1.49 1.49C10.02 21.62 11.51 22 13 22c2.3 0 4.61-.88 6.36-2.64 3.52-3.51 3.52-9.21 0-12.72z\"/></svg>"},"rotate-left":{"name":"rotate-left","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47zM6.09 13H4.07c.17 1.39.72 2.73 1.62 3.89l1.41-1.42c-.52-.75-.87-1.59-1.01-2.47zm1.01 5.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32zM13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z\"/></svg>"},"rotate-right":{"name":"rotate-right","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15.55 5.55L11 1v3.07C7.06 4.56 4 7.92 4 12s3.05 7.44 7 7.93v-2.02c-2.84-.48-5-2.94-5-5.91s2.16-5.43 5-5.91V10l4.55-4.45zM19.93 11c-.17-1.39-.72-2.73-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02c1.39-.17 2.74-.71 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41c.9-1.16 1.45-2.5 1.62-3.89h-2.02c-.14.87-.48 1.72-1.02 2.48z\"/></svg>"},"rounded-corner":{"name":"rounded-corner","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 19h2v2h-2v-2zm0-2h2v-2h-2v2zM3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm0-4h2V3H3v2zm4 0h2V3H7v2zm8 16h2v-2h-2v2zm-4 0h2v-2h-2v2zm4 0h2v-2h-2v2zm-8 0h2v-2H7v2zm-4 0h2v-2H3v2zM21 8c0-2.76-2.24-5-5-5h-5v2h5c1.65 0 3 1.35 3 3v5h2V8z\"/></svg>"},"router":{"name":"router","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20.2 5.9l.8-.8C19.6 3.7 17.8 3 16 3s-3.6.7-5 2.1l.8.8C13 4.8 14.5 4.2 16 4.2s3 .6 4.2 1.7zm-.9.8c-.9-.9-2.1-1.4-3.3-1.4s-2.4.5-3.3 1.4l.8.8c.7-.7 1.6-1 2.5-1 .9 0 1.8.3 2.5 1l.8-.8zM19 13h-2V9h-2v4H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zM8 18H6v-2h2v2zm3.5 0h-2v-2h2v2zm3.5 0h-2v-2h2v2z\"/></svg>"},"rowing":{"name":"rowing","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M8.5 14.5L4 19l1.5 1.5L9 17h2l-2.5-2.5zM15 1c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 20.01L18 24l-2.99-3.01V19.5l-7.1-7.09c-.31.05-.61.07-.91.07v-2.16c1.66.03 3.61-.87 4.67-2.04l1.4-1.55c.19-.21.43-.38.69-.5.29-.14.62-.23.96-.23h.03C15.99 6.01 17 7.02 17 8.26v5.75c0 .84-.35 1.61-.92 2.16l-3.58-3.58v-2.27c-.63.52-1.43 1.02-2.29 1.39L16.5 18H18l3 3.01z\"/></svg>"},"rss-feed":{"name":"rss-feed","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><circle cx=\"6.18\" cy=\"17.82\" r=\"2.18\"/><path d=\"M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z\"/></svg>"},"rv-hookup":{"name":"rv-hookup","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 17v-6c0-1.1-.9-2-2-2H7V7l-3 3 3 3v-2h4v3H4v3c0 1.1.9 2 2 2h2c0 1.66 1.34 3 3 3s3-1.34 3-3h8v-2h-2zm-9 3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm7-6h-4v-3h4v3zM17 2v2H9v2h8v2l3-3z\"/></svg>"},"satellite":{"name":"satellite","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 4.99h3C8 6.65 6.66 8 5 8V4.99zM5 12v-2c2.76 0 5-2.25 5-5.01h2C12 8.86 8.87 12 5 12zm0 6l3.5-4.5 2.5 3.01L14.5 12l4.5 6H5z\"/></svg>"},"save":{"name":"save","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z\"/></svg>"},"scanner":{"name":"scanner","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.8 10.7L4.2 5l-.7 1.9L17.6 12H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-5.5c0-.8-.5-1.6-1.2-1.8zM7 17H5v-2h2v2zm12 0H9v-2h10v2z\"/></svg>"},"schedule":{"name":"schedule","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z\"/></svg>"},"school":{"name":"school","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z\"/></svg>"},"screen-lock-landscape":{"name":"screen-lock-landscape","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 5H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-2 12H5V7h14v10zm-9-1h4c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1v-1c0-1.11-.9-2-2-2-1.11 0-2 .9-2 2v1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1zm.8-6c0-.66.54-1.2 1.2-1.2.66 0 1.2.54 1.2 1.2v1h-2.4v-1z\"/></svg>"},"screen-lock-portrait":{"name":"screen-lock-portrait","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 16h4c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1v-1c0-1.11-.9-2-2-2-1.11 0-2 .9-2 2v1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1zm.8-6c0-.66.54-1.2 1.2-1.2.66 0 1.2.54 1.2 1.2v1h-2.4v-1zM17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z\"/></svg>"},"screen-lock-rotation":{"name":"screen-lock-rotation","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M23.25 12.77l-2.57-2.57-1.41 1.41 2.22 2.22-5.66 5.66L4.51 8.17l5.66-5.66 2.1 2.1 1.41-1.41L11.23.75c-.59-.59-1.54-.59-2.12 0L2.75 7.11c-.59.59-.59 1.54 0 2.12l12.02 12.02c.59.59 1.54.59 2.12 0l6.36-6.36c.59-.59.59-1.54 0-2.12zM8.47 20.48C5.2 18.94 2.86 15.76 2.5 12H1c.51 6.16 5.66 11 11.95 11l.66-.03-3.81-3.82-1.33 1.33zM16 9h5c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1v-.5C21 1.12 19.88 0 18.5 0S16 1.12 16 2.5V3c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1zm.8-6.5c0-.94.76-1.7 1.7-1.7s1.7.76 1.7 1.7V3h-3.4v-.5z\"/></svg>"},"screen-rotation":{"name":"screen-rotation","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16.48 2.52c3.27 1.55 5.61 4.72 5.97 8.48h1.5C23.44 4.84 18.29 0 12 0l-.66.03 3.81 3.81 1.33-1.32zm-6.25-.77c-.59-.59-1.54-.59-2.12 0L1.75 8.11c-.59.59-.59 1.54 0 2.12l12.02 12.02c.59.59 1.54.59 2.12 0l6.36-6.36c.59-.59.59-1.54 0-2.12L10.23 1.75zm4.6 19.44L2.81 9.17l6.36-6.36 12.02 12.02-6.36 6.36zm-7.31.29C4.25 19.94 1.91 16.76 1.55 13H.05C.56 19.16 5.71 24 12 24l.66-.03-3.81-3.81-1.33 1.32z\"/></svg>"},"screen-share":{"name":"screen-share","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.11-.9-2-2-2H4c-1.11 0-2 .89-2 2v10c0 1.1.89 2 2 2H0v2h24v-2h-4zm-7-3.53v-2.19c-2.78 0-4.61.85-6 2.72.56-2.67 2.11-5.33 6-5.87V7l4 3.73-4 3.74z\"/></svg>"},"sd-card":{"name":"sd-card","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 2h-8L4.02 8 4 20c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 6h-2V4h2v4zm3 0h-2V4h2v4zm3 0h-2V4h2v4z\"/></svg>"},"sd-storage":{"name":"sd-storage","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 2h-8L4.02 8 4 20c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 6h-2V4h2v4zm3 0h-2V4h2v4zm3 0h-2V4h2v4z\"/></svg>"},"search":{"name":"search","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z\"/></svg>"},"security":{"name":"security","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z\"/></svg>"},"select-all":{"name":"select-all","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zM3 9h2V7H3v2zm10-6h-2v2h2V3zm6 0v2h2c0-1.1-.9-2-2-2zM5 21v-2H3c0 1.1.9 2 2 2zm-2-4h2v-2H3v2zM9 3H7v2h2V3zm2 18h2v-2h-2v2zm8-8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zm0-12h2V7h-2v2zm0 8h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-16h2V3h-2v2zM7 17h10V7H7v10zm2-8h6v6H9V9z\"/></svg>"},"send":{"name":"send","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M2.01 21L23 12 2.01 3 2 10l15 2-15 2z\"/></svg>"},"sentiment-dissatisfied":{"name":"sentiment-dissatisfied","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><circle cx=\"15.5\" cy=\"9.5\" r=\"1.5\"/><circle cx=\"8.5\" cy=\"9.5\" r=\"1.5\"/><path d=\"M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-6c-2.33 0-4.32 1.45-5.12 3.5h1.67c.69-1.19 1.97-2 3.45-2s2.75.81 3.45 2h1.67c-.8-2.05-2.79-3.5-5.12-3.5z\"/></svg>"},"sentiment-neutral":{"name":"sentiment-neutral","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9 14h6v1.5H9z\"/><circle cx=\"15.5\" cy=\"9.5\" r=\"1.5\"/><circle cx=\"8.5\" cy=\"9.5\" r=\"1.5\"/><path d=\"M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z\"/></svg>"},"sentiment-satisfied":{"name":"sentiment-satisfied","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><circle cx=\"15.5\" cy=\"9.5\" r=\"1.5\"/><circle cx=\"8.5\" cy=\"9.5\" r=\"1.5\"/><path d=\"M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-4c-1.48 0-2.75-.81-3.45-2H6.88c.8 2.05 2.79 3.5 5.12 3.5s4.32-1.45 5.12-3.5h-1.67c-.7 1.19-1.97 2-3.45 2z\"/></svg>"},"sentiment-very-dissatisfied":{"name":"sentiment-very-dissatisfied","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11.99 2C6.47 2 2 6.47 2 12s4.47 10 9.99 10S22 17.53 22 12 17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm4.18-12.24l-1.06 1.06-1.06-1.06L13 8.82l1.06 1.06L13 10.94 14.06 12l1.06-1.06L16.18 12l1.06-1.06-1.06-1.06 1.06-1.06zM7.82 12l1.06-1.06L9.94 12 11 10.94 9.94 9.88 11 8.82 9.94 7.76 8.88 8.82 7.82 7.76 6.76 8.82l1.06 1.06-1.06 1.06zM12 14c-2.33 0-4.31 1.46-5.11 3.5h10.22c-.8-2.04-2.78-3.5-5.11-3.5z\"/></svg>"},"sentiment-very-satisfied":{"name":"sentiment-very-satisfied","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11.99 2C6.47 2 2 6.47 2 12s4.47 10 9.99 10S22 17.53 22 12 17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm1-10.06L14.06 11l1.06-1.06L16.18 11l1.06-1.06-2.12-2.12zm-4.12 0L9.94 11 11 9.94 8.88 7.82 6.76 9.94 7.82 11zM12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z\"/></svg>"},"settings-applications":{"name":"settings-applications","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm7-7H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-1.75 9c0 .23-.02.46-.05.68l1.48 1.16c.13.11.17.3.08.45l-1.4 2.42c-.09.15-.27.21-.43.15l-1.74-.7c-.36.28-.76.51-1.18.69l-.26 1.85c-.03.17-.18.3-.35.3h-2.8c-.17 0-.32-.13-.35-.29l-.26-1.85c-.43-.18-.82-.41-1.18-.69l-1.74.7c-.16.06-.34 0-.43-.15l-1.4-2.42c-.09-.15-.05-.34.08-.45l1.48-1.16c-.03-.23-.05-.46-.05-.69 0-.23.02-.46.05-.68l-1.48-1.16c-.13-.11-.17-.3-.08-.45l1.4-2.42c.09-.15.27-.21.43-.15l1.74.7c.36-.28.76-.51 1.18-.69l.26-1.85c.03-.17.18-.3.35-.3h2.8c.17 0 .32.13.35.29l.26 1.85c.43.18.82.41 1.18.69l1.74-.7c.16-.06.34 0 .43.15l1.4 2.42c.09.15.05.34-.08.45l-1.48 1.16c.03.23.05.46.05.69z\"/></svg>"},"settings-backup-restore":{"name":"settings-backup-restore","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14 12c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-2-9c-4.97 0-9 4.03-9 9H0l4 4 4-4H5c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.51 0-2.91-.49-4.06-1.3l-1.42 1.44C8.04 20.3 9.94 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z\"/></svg>"},"settings-bluetooth":{"name":"settings-bluetooth","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11 24h2v-2h-2v2zm-4 0h2v-2H7v2zm8 0h2v-2h-2v2zm2.71-18.29L12 0h-1v7.59L6.41 3 5 4.41 10.59 10 5 15.59 6.41 17 11 12.41V20h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 3.83l1.88 1.88L13 7.59V3.83zm1.88 10.46L13 16.17v-3.76l1.88 1.88z\"/></svg>"},"settings-brightness":{"name":"settings-brightness","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02zM8 16h2.5l1.5 1.5 1.5-1.5H16v-2.5l1.5-1.5-1.5-1.5V8h-2.5L12 6.5 10.5 8H8v2.5L6.5 12 8 13.5V16zm4-7c1.66 0 3 1.34 3 3s-1.34 3-3 3V9z\"/></svg>"},"settings-cell":{"name":"settings-cell","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 24h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zM16 .01L8 0C6.9 0 6 .9 6 2v16c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V2c0-1.1-.9-1.99-2-1.99zM16 16H8V4h8v12z\"/></svg>"},"settings-ethernet":{"name":"settings-ethernet","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7.77 6.76L6.23 5.48.82 12l5.41 6.52 1.54-1.28L3.42 12l4.35-5.24zM7 13h2v-2H7v2zm10-2h-2v2h2v-2zm-6 2h2v-2h-2v2zm6.77-7.52l-1.54 1.28L20.58 12l-4.35 5.24 1.54 1.28L23.18 12l-5.41-6.52z\"/></svg>"},"settings-input-antenna":{"name":"settings-input-antenna","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 5c-3.87 0-7 3.13-7 7h2c0-2.76 2.24-5 5-5s5 2.24 5 5h2c0-3.87-3.13-7-7-7zm1 9.29c.88-.39 1.5-1.26 1.5-2.29 0-1.38-1.12-2.5-2.5-2.5S9.5 10.62 9.5 12c0 1.02.62 1.9 1.5 2.29v3.3L7.59 21 9 22.41l3-3 3 3L16.41 21 13 17.59v-3.3zM12 1C5.93 1 1 5.93 1 12h2c0-4.97 4.03-9 9-9s9 4.03 9 9h2c0-6.07-4.93-11-11-11z\"/></svg>"},"settings-input-component":{"name":"settings-input-component","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M5 2c0-.55-.45-1-1-1s-1 .45-1 1v4H1v6h6V6H5V2zm4 14c0 1.3.84 2.4 2 2.82V23h2v-4.18c1.16-.41 2-1.51 2-2.82v-2H9v2zm-8 0c0 1.3.84 2.4 2 2.82V23h2v-4.18C6.16 18.4 7 17.3 7 16v-2H1v2zM21 6V2c0-.55-.45-1-1-1s-1 .45-1 1v4h-2v6h6V6h-2zm-8-4c0-.55-.45-1-1-1s-1 .45-1 1v4H9v6h6V6h-2V2zm4 14c0 1.3.84 2.4 2 2.82V23h2v-4.18c1.16-.41 2-1.51 2-2.82v-2h-6v2z\"/></svg>"},"settings-input-composite":{"name":"settings-input-composite","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M5 2c0-.55-.45-1-1-1s-1 .45-1 1v4H1v6h6V6H5V2zm4 14c0 1.3.84 2.4 2 2.82V23h2v-4.18c1.16-.41 2-1.51 2-2.82v-2H9v2zm-8 0c0 1.3.84 2.4 2 2.82V23h2v-4.18C6.16 18.4 7 17.3 7 16v-2H1v2zM21 6V2c0-.55-.45-1-1-1s-1 .45-1 1v4h-2v6h6V6h-2zm-8-4c0-.55-.45-1-1-1s-1 .45-1 1v4H9v6h6V6h-2V2zm4 14c0 1.3.84 2.4 2 2.82V23h2v-4.18c1.16-.41 2-1.51 2-2.82v-2h-6v2z\"/></svg>"},"settings-input-hdmi":{"name":"settings-input-hdmi","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 7V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v3H5v6l3 6v3h8v-3l3-6V7h-1zM8 4h8v3h-2V5h-1v2h-2V5h-1v2H8V4z\"/></svg>"},"settings-input-svideo":{"name":"settings-input-svideo","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M8 11.5c0-.83-.67-1.5-1.5-1.5S5 10.67 5 11.5 5.67 13 6.5 13 8 12.33 8 11.5zm7-5c0-.83-.67-1.5-1.5-1.5h-3C9.67 5 9 5.67 9 6.5S9.67 8 10.5 8h3c.83 0 1.5-.67 1.5-1.5zM8.5 15c-.83 0-1.5.67-1.5 1.5S7.67 18 8.5 18s1.5-.67 1.5-1.5S9.33 15 8.5 15zM12 1C5.93 1 1 5.93 1 12s4.93 11 11 11 11-4.93 11-11S18.07 1 12 1zm0 20c-4.96 0-9-4.04-9-9s4.04-9 9-9 9 4.04 9 9-4.04 9-9 9zm5.5-11c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-2 5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z\"/></svg>"},"settings-overscan":{"name":"settings-overscan","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12.01 5.5L10 8h4l-1.99-2.5zM18 10v4l2.5-1.99L18 10zM6 10l-2.5 2.01L6 14v-4zm8 6h-4l2.01 2.5L14 16zm7-13H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z\"/></svg>"},"settings-phone":{"name":"settings-phone","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13 9h-2v2h2V9zm4 0h-2v2h2V9zm3 6.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.58l2.2-2.21c.28-.27.36-.66.25-1.01C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM19 9v2h2V9h-2z\"/></svg>"},"settings-power":{"name":"settings-power","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 24h2v-2H7v2zm4 0h2v-2h-2v2zm2-22h-2v10h2V2zm3.56 2.44l-1.45 1.45C16.84 6.94 18 8.83 18 11c0 3.31-2.69 6-6 6s-6-2.69-6-6c0-2.17 1.16-4.06 2.88-5.12L7.44 4.44C5.36 5.88 4 8.28 4 11c0 4.42 3.58 8 8 8s8-3.58 8-8c0-2.72-1.36-5.12-3.44-6.56zM15 24h2v-2h-2v2z\"/></svg>"},"settings-remote":{"name":"settings-remote","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15 9H9c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V10c0-.55-.45-1-1-1zm-3 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM7.05 6.05l1.41 1.41C9.37 6.56 10.62 6 12 6s2.63.56 3.54 1.46l1.41-1.41C15.68 4.78 13.93 4 12 4s-3.68.78-4.95 2.05zM12 0C8.96 0 6.21 1.23 4.22 3.22l1.41 1.41C7.26 3.01 9.51 2 12 2s4.74 1.01 6.36 2.64l1.41-1.41C17.79 1.23 15.04 0 12 0z\"/></svg>"},"settings-system-daydream":{"name":"settings-system-daydream","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9 16h6.5c1.38 0 2.5-1.12 2.5-2.5S16.88 11 15.5 11h-.05c-.24-1.69-1.69-3-3.45-3-1.4 0-2.6.83-3.16 2.02h-.16C7.17 10.18 6 11.45 6 13c0 1.66 1.34 3 3 3zM21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z\"/></svg>"},"settings-voice":{"name":"settings-voice","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 24h2v-2H7v2zm5-11c1.66 0 2.99-1.34 2.99-3L15 4c0-1.66-1.34-3-3-3S9 2.34 9 4v6c0 1.66 1.34 3 3 3zm-1 11h2v-2h-2v2zm4 0h2v-2h-2v2zm4-14h-1.7c0 3-2.54 5.1-5.3 5.1S6.7 13 6.7 10H5c0 3.41 2.72 6.23 6 6.72V20h2v-3.28c3.28-.49 6-3.31 6-6.72z\"/></svg>"},"settings":{"name":"settings","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z\"/></svg>"},"share":{"name":"share","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z\"/></svg>"},"shop-two":{"name":"shop-two","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 9H1v11c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2H3V9zm15-4V3c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H5v11c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V5h-5zm-6-2h4v2h-4V3zm0 12V8l5.5 3-5.5 4z\"/></svg>"},"shop":{"name":"shop","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16 6V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H2v13c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6h-6zm-6-2h4v2h-4V4zM9 18V9l7.5 4L9 18z\"/></svg>"},"shopping-basket":{"name":"shopping-basket","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17.21 9l-4.38-6.56c-.19-.28-.51-.42-.83-.42-.32 0-.64.14-.83.43L6.79 9H2c-.55 0-1 .45-1 1 0 .09.01.18.04.27l2.54 9.27c.23.84 1 1.46 1.92 1.46h13c.92 0 1.69-.62 1.93-1.46l2.54-9.27L23 10c0-.55-.45-1-1-1h-4.79zM9 9l3-4.4L15 9H9zm3 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z\"/></svg>"},"shopping-cart":{"name":"shopping-cart","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z\"/></svg>"},"short-text":{"name":"short-text","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 9h16v2H4zm0 4h10v2H4z\"/></svg>"},"show-chart":{"name":"show-chart","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z\"/></svg>"},"shuffle":{"name":"shuffle","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z\"/></svg>"},"signal-cellular-0-bar":{"name":"signal-cellular-0-bar","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M2 22h20V2z\"/></svg>"},"signal-cellular-1-bar":{"name":"signal-cellular-1-bar","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M2 22h20V2z\"/><path d=\"M12 12L2 22h10z\"/></svg>"},"signal-cellular-2-bar":{"name":"signal-cellular-2-bar","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M2 22h20V2z\"/><path d=\"M14 10L2 22h12z\"/></svg>"},"signal-cellular-3-bar":{"name":"signal-cellular-3-bar","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M2 22h20V2z\"/><path d=\"M17 7L2 22h15z\"/></svg>"},"signal-cellular-4-bar":{"name":"signal-cellular-4-bar","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M2 22h20V2z\"/></svg>"},"signal-cellular-connected-no-internet-0-bar":{"name":"signal-cellular-connected-no-internet-0-bar","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M22 8V2L2 22h16V8z\"/><path d=\"M20 22h2v-2h-2v2zm0-12v8h2v-8h-2z\"/></svg>"},"signal-cellular-connected-no-internet-1-bar":{"name":"signal-cellular-connected-no-internet-1-bar","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M22 8V2L2 22h16V8z\"/><path d=\"M20 10v8h2v-8h-2zm-8 12V12L2 22h10zm8 0h2v-2h-2v2z\"/></svg>"},"signal-cellular-connected-no-internet-2-bar":{"name":"signal-cellular-connected-no-internet-2-bar","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M22 8V2L2 22h16V8z\"/><path d=\"M14 22V10L2 22h12zm6-12v8h2v-8h-2zm0 12h2v-2h-2v2z\"/></svg>"},"signal-cellular-connected-no-internet-3-bar":{"name":"signal-cellular-connected-no-internet-3-bar","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M22 8V2L2 22h16V8z\"/><path d=\"M17 22V7L2 22h15zm3-12v8h2v-8h-2zm0 12h2v-2h-2v2z\"/></svg>"},"signal-cellular-connected-no-internet-4-bar":{"name":"signal-cellular-connected-no-internet-4-bar","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 18h2v-8h-2v8zm0 4h2v-2h-2v2zM2 22h16V8h4V2L2 22z\"/></svg>"},"signal-cellular-no-sim":{"name":"signal-cellular-no-sim","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18.99 5c0-1.1-.89-2-1.99-2h-7L7.66 5.34 19 16.68 18.99 5zM3.65 3.88L2.38 5.15 5 7.77V19c0 1.1.9 2 2 2h10.01c.35 0 .67-.1.96-.26l1.88 1.88 1.27-1.27L3.65 3.88z\"/></svg>"},"signal-cellular-null":{"name":"signal-cellular-null","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 6.83V20H6.83L20 6.83M22 2L2 22h20V2z\"/></svg>"},"signal-cellular-off":{"name":"signal-cellular-off","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 1l-8.59 8.59L21 18.18V1zM4.77 4.5L3.5 5.77l6.36 6.36L1 21h17.73l2 2L22 21.73 4.77 4.5z\"/></svg>"},"signal-wifi-0-bar":{"name":"signal-wifi-0-bar","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z\"/></svg>"},"signal-wifi-1-bar-lock":{"name":"signal-wifi-1-bar-lock","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M23 16v-1.5c0-1.4-1.1-2.5-2.5-2.5S18 13.1 18 14.5V16c-.5 0-1 .5-1 1v4c0 .5.5 1 1 1h5c.5 0 1-.5 1-1v-4c0-.5-.5-1-1-1zm-1 0h-3v-1.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V16z\"/><path d=\"M15.5 14.5c0-2.8 2.2-5 5-5 .4 0 .7 0 1 .1L23.6 7c-.4-.3-4.9-4-11.6-4C5.3 3 .8 6.7.4 7L12 21.5l3.5-4.3v-2.7z\" opacity=\".3\"/><path d=\"M6.7 14.9l5.3 6.6 3.5-4.3v-2.6c0-.2 0-.5.1-.7-.9-.5-2.2-.9-3.6-.9-3 0-5.1 1.7-5.3 1.9z\"/></svg>"},"signal-wifi-1-bar":{"name":"signal-wifi-1-bar","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z\"/><path d=\"M6.67 14.86L12 21.49v.01l.01-.01 5.33-6.63C17.06 14.65 15.03 13 12 13s-5.06 1.65-5.33 1.86z\"/></svg>"},"signal-wifi-2-bar-lock":{"name":"signal-wifi-2-bar-lock","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M23 16v-1.5c0-1.4-1.1-2.5-2.5-2.5S18 13.1 18 14.5V16c-.5 0-1 .5-1 1v4c0 .5.5 1 1 1h5c.5 0 1-.5 1-1v-4c0-.5-.5-1-1-1zm-1 0h-3v-1.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V16z\"/><path d=\"M15.5 14.5c0-2.8 2.2-5 5-5 .4 0 .7 0 1 .1L23.6 7c-.4-.3-4.9-4-11.6-4C5.3 3 .8 6.7.4 7L12 21.5l3.5-4.3v-2.7z\" opacity=\".3\"/><path d=\"M4.8 12.5l7.2 9 3.5-4.4v-2.6c0-1.3.5-2.5 1.4-3.4C15.6 10.5 14 10 12 10c-4.1 0-6.8 2.2-7.2 2.5z\"/></svg>"},"signal-wifi-2-bar":{"name":"signal-wifi-2-bar","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z\"/><path d=\"M4.79 12.52l7.2 8.98H12l.01-.01 7.2-8.98C18.85 12.24 16.1 10 12 10s-6.85 2.24-7.21 2.52z\"/></svg>"},"signal-wifi-3-bar-lock":{"name":"signal-wifi-3-bar-lock","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path opacity=\".3\" d=\"M12 3C5.3 3 .8 6.7.4 7l3.2 3.9L12 21.5l3.5-4.3v-2.6c0-2.2 1.4-4 3.3-4.7.3-.1.5-.2.8-.2.3-.1.6-.1.9-.1.4 0 .7 0 1 .1L23.6 7c-.4-.3-4.9-4-11.6-4z\"/><path d=\"M23 16v-1.5c0-1.4-1.1-2.5-2.5-2.5S18 13.1 18 14.5V16c-.5 0-1 .5-1 1v4c0 .5.5 1 1 1h5c.5 0 1-.5 1-1v-4c0-.5-.5-1-1-1zm-1 0h-3v-1.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V16zm-10 5.5l3.5-4.3v-2.6c0-2.2 1.4-4 3.3-4.7C17.3 9 14.9 8 12 8c-4.8 0-8 2.6-8.5 2.9\"/></svg>"},"signal-wifi-3-bar":{"name":"signal-wifi-3-bar","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill-opacity=\".3\" d=\"M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z\"/><path d=\"M3.53 10.95l8.46 10.54.01.01.01-.01 8.46-10.54C20.04 10.62 16.81 8 12 8c-4.81 0-8.04 2.62-8.47 2.95z\"/></svg>"},"signal-wifi-4-bar-lock":{"name":"signal-wifi-4-bar-lock","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M23 16v-1.5c0-1.4-1.1-2.5-2.5-2.5S18 13.1 18 14.5V16c-.5 0-1 .5-1 1v4c0 .5.5 1 1 1h5c.5 0 1-.5 1-1v-4c0-.5-.5-1-1-1zm-1 0h-3v-1.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V16zm-6.5-1.5c0-2.8 2.2-5 5-5 .4 0 .7 0 1 .1L23.6 7c-.4-.3-4.9-4-11.6-4C5.3 3 .8 6.7.4 7L12 21.5l3.5-4.4v-2.6z\"/></svg>"},"signal-wifi-4-bar":{"name":"signal-wifi-4-bar","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z\"/></svg>"},"signal-wifi-off":{"name":"signal-wifi-off","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.48L18.18 13.8 23.64 7zm-6.6 8.22L3.27 1.44 2 2.72l2.05 2.06C1.91 5.76.59 6.82.36 7l11.63 14.49.01.01.01-.01 3.9-4.86 3.32 3.32 1.27-1.27-3.46-3.46z\"/></svg>"},"sim-card-alert":{"name":"sim-card-alert","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 2h-8L4.02 8 4 20c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 15h-2v-2h2v2zm0-4h-2V8h2v5z\"/></svg>"},"sim-card":{"name":"sim-card","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.99 4c0-1.1-.89-2-1.99-2h-8L4 8v12c0 1.1.9 2 2 2h12.01c1.1 0 1.99-.9 1.99-2l-.01-16zM9 19H7v-2h2v2zm8 0h-2v-2h2v2zm-8-4H7v-4h2v4zm4 4h-2v-4h2v4zm0-6h-2v-2h2v2zm4 2h-2v-4h2v4z\"/></svg>"},"skip-next":{"name":"skip-next","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z\"/></svg>"},"skip-previous":{"name":"skip-previous","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6 6h2v12H6zm3.5 6l8.5 6V6z\"/></svg>"},"slideshow":{"name":"slideshow","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 8v8l5-4-5-4zm9-5H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z\"/></svg>"},"slow-motion-video":{"name":"slow-motion-video","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13.05 9.79L10 7.5v9l3.05-2.29L16 12zm0 0L10 7.5v9l3.05-2.29L16 12zm0 0L10 7.5v9l3.05-2.29L16 12zM11 4.07V2.05c-2.01.2-3.84 1-5.32 2.21L7.1 5.69c1.11-.86 2.44-1.44 3.9-1.62zM5.69 7.1L4.26 5.68C3.05 7.16 2.25 8.99 2.05 11h2.02c.18-1.46.76-2.79 1.62-3.9zM4.07 13H2.05c.2 2.01 1 3.84 2.21 5.32l1.43-1.43c-.86-1.1-1.44-2.43-1.62-3.89zm1.61 6.74C7.16 20.95 9 21.75 11 21.95v-2.02c-1.46-.18-2.79-.76-3.9-1.62l-1.42 1.43zM22 12c0 5.16-3.92 9.42-8.95 9.95v-2.02C16.97 19.41 20 16.05 20 12s-3.03-7.41-6.95-7.93V2.05C18.08 2.58 22 6.84 22 12z\"/></svg>"},"smartphone":{"name":"smartphone","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z\"/></svg>"},"smoke-free":{"name":"smoke-free","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M2 6l6.99 7H2v3h9.99l7 7 1.26-1.25-17-17zm18.5 7H22v3h-1.5zM18 13h1.5v3H18zm.85-8.12c.62-.61 1-1.45 1-2.38h-1.5c0 1.02-.83 1.85-1.85 1.85v1.5c2.24 0 4 1.83 4 4.07V12H22V9.92c0-2.23-1.28-4.15-3.15-5.04zM14.5 8.7h1.53c1.05 0 1.97.74 1.97 2.05V12h1.5v-1.59c0-1.8-1.6-3.16-3.47-3.16H14.5c-1.02 0-1.85-.98-1.85-2s.83-1.75 1.85-1.75V2c-1.85 0-3.35 1.5-3.35 3.35s1.5 3.35 3.35 3.35zm2.5 7.23V13h-2.93z\"/></svg>"},"smoking-rooms":{"name":"smoking-rooms","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M2 16h15v3H2zm18.5 0H22v3h-1.5zM18 16h1.5v3H18zm.85-8.27c.62-.61 1-1.45 1-2.38C19.85 3.5 18.35 2 16.5 2v1.5c1.02 0 1.85.83 1.85 1.85S17.52 7.2 16.5 7.2v1.5c2.24 0 4 1.83 4 4.07V15H22v-2.24c0-2.22-1.28-4.14-3.15-5.03zm-2.82 2.47H14.5c-1.02 0-1.85-.98-1.85-2s.83-1.75 1.85-1.75v-1.5c-1.85 0-3.35 1.5-3.35 3.35s1.5 3.35 3.35 3.35h1.53c1.05 0 1.97.74 1.97 2.05V15h1.5v-1.64c0-1.81-1.6-3.16-3.47-3.16z\"/></svg>"},"sms-failed":{"name":"sms-failed","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z\"/></svg>"},"sms":{"name":"sms","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z\"/></svg>"},"snooze":{"name":"snooze","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm-3-9h3.63L9 15.2V17h6v-2h-3.63L15 10.8V9H9v2z\"/></svg>"},"sort-by-alpha":{"name":"sort-by-alpha","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14.94 4.66h-4.72l2.36-2.36zm-4.69 14.71h4.66l-2.33 2.33zM6.1 6.27L1.6 17.73h1.84l.92-2.45h5.11l.92 2.45h1.84L7.74 6.27H6.1zm-1.13 7.37l1.94-5.18 1.94 5.18H4.97zm10.76 2.5h6.12v1.59h-8.53v-1.29l5.92-8.56h-5.88v-1.6h8.3v1.26l-5.93 8.6z\"/></svg>"},"sort":{"name":"sort","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z\"/></svg>"},"spa":{"name":"spa","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill=\"#607D8B\" d=\"M8.55 12c-1.07-.71-2.25-1.27-3.53-1.61 1.28.34 2.46.9 3.53 1.61zm10.43-1.61c-1.29.34-2.49.91-3.57 1.64 1.08-.73 2.28-1.3 3.57-1.64z\"/><path d=\"M15.49 9.63c-.18-2.79-1.31-5.51-3.43-7.63-2.14 2.14-3.32 4.86-3.55 7.63 1.28.68 2.46 1.56 3.49 2.63 1.03-1.06 2.21-1.94 3.49-2.63zm-6.5 2.65c-.14-.1-.3-.19-.45-.29.15.11.31.19.45.29zm6.42-.25c-.13.09-.27.16-.4.26.13-.1.27-.17.4-.26zM12 15.45C9.85 12.17 6.18 10 2 10c0 5.32 3.36 9.82 8.03 11.49.63.23 1.29.4 1.97.51.68-.12 1.33-.29 1.97-.51C18.64 19.82 22 15.32 22 10c-4.18 0-7.85 2.17-10 5.45z\"/></svg>"},"space-bar":{"name":"space-bar","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 9v4H6V9H4v6h16V9z\"/></svg>"},"speaker-group":{"name":"speaker-group","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18.2 1H9.8C8.81 1 8 1.81 8 2.8v14.4c0 .99.81 1.79 1.8 1.79l8.4.01c.99 0 1.8-.81 1.8-1.8V2.8c0-.99-.81-1.8-1.8-1.8zM14 3c1.1 0 2 .89 2 2s-.9 2-2 2-2-.89-2-2 .9-2 2-2zm0 13.5c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z\"/><circle cx=\"14\" cy=\"12.5\" r=\"2.5\"/><path d=\"M6 5H4v16c0 1.1.89 2 2 2h10v-2H6V5z\"/></svg>"},"speaker-notes-off":{"name":"speaker-notes-off","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10.54 11l-.54-.54L7.54 8 6 6.46 2.38 2.84 1.27 1.73 0 3l2.01 2.01L2 22l4-4h9l5.73 5.73L22 22.46 17.54 18l-7-7zM8 14H6v-2h2v2zm-2-3V9l2 2H6zm14-9H4.08L10 7.92V6h8v2h-7.92l1 1H18v2h-4.92l6.99 6.99C21.14 17.95 22 17.08 22 16V4c0-1.1-.9-2-2-2z\"/></svg>"},"speaker-notes":{"name":"speaker-notes","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 14H6v-2h2v2zm0-3H6V9h2v2zm0-3H6V6h2v2zm7 6h-5v-2h5v2zm3-3h-8V9h8v2zm0-3h-8V6h8v2z\"/></svg>"},"speaker-phone":{"name":"speaker-phone","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 7.07L8.43 8.5c.91-.91 2.18-1.48 3.57-1.48s2.66.57 3.57 1.48L17 7.07C15.72 5.79 13.95 5 12 5s-3.72.79-5 2.07zM12 1C8.98 1 6.24 2.23 4.25 4.21l1.41 1.41C7.28 4 9.53 3 12 3s4.72 1 6.34 2.62l1.41-1.41C17.76 2.23 15.02 1 12 1zm2.86 9.01L9.14 10C8.51 10 8 10.51 8 11.14v9.71c0 .63.51 1.14 1.14 1.14h5.71c.63 0 1.14-.51 1.14-1.14v-9.71c.01-.63-.5-1.13-1.13-1.13zM15 20H9v-8h6v8z\"/></svg>"},"speaker":{"name":"speaker","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 1.99 2 1.99L17 22c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 2c1.1 0 2 .9 2 2s-.9 2-2 2c-1.11 0-2-.9-2-2s.89-2 2-2zm0 16c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z\"/></svg>"},"spellcheck":{"name":"spellcheck","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12.45 16h2.09L9.43 3H7.57L2.46 16h2.09l1.12-3h5.64l1.14 3zm-6.02-5L8.5 5.48 10.57 11H6.43zm15.16.59l-8.09 8.09L9.83 16l-1.41 1.41 5.09 5.09L23 13l-1.41-1.41z\"/></svg>"},"star-border":{"name":"star-border","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z\"/></svg>"},"star-half":{"name":"star-half","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4V6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z\"/></svg>"},"star":{"name":"star","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z\"/></svg>"},"stars":{"name":"stars","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z\"/></svg>"},"stay-current-landscape":{"name":"stay-current-landscape","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M1.01 7L1 17c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H3c-1.1 0-1.99.9-1.99 2zM19 7v10H5V7h14z\"/></svg>"},"stay-current-portrait":{"name":"stay-current-portrait","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 1.01L7 1c-1.1 0-1.99.9-1.99 2v18c0 1.1.89 2 1.99 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z\"/></svg>"},"stay-primary-landscape":{"name":"stay-primary-landscape","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M1.01 7L1 17c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H3c-1.1 0-1.99.9-1.99 2zM19 7v10H5V7h14z\"/></svg>"},"stay-primary-portrait":{"name":"stay-primary-portrait","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 1.01L7 1c-1.1 0-1.99.9-1.99 2v18c0 1.1.89 2 1.99 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z\"/></svg>"},"stop-screen-share":{"name":"stop-screen-share","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21.22 18.02l2 2H24v-2h-2.78zm.77-2l.01-10c0-1.11-.9-2-2-2H7.22l5.23 5.23c.18-.04.36-.07.55-.1V7.02l4 3.73-1.58 1.47 5.54 5.54c.61-.33 1.03-.99 1.03-1.74zM2.39 1.73L1.11 3l1.54 1.54c-.4.36-.65.89-.65 1.48v10c0 1.1.89 2 2 2H0v2h18.13l2.71 2.71 1.27-1.27L2.39 1.73zM7 15.02c.31-1.48.92-2.95 2.07-4.06l1.59 1.59c-1.54.38-2.7 1.18-3.66 2.47z\"/></svg>"},"stop":{"name":"stop","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6 6h12v12H6z\"/></svg>"},"storage":{"name":"storage","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z\"/></svg>"},"store-mall-directory":{"name":"store-mall-directory","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z\"/></svg>"},"store":{"name":"store","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z\"/></svg>"},"straighten":{"name":"straighten","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H3V8h2v4h2V8h2v4h2V8h2v4h2V8h2v4h2V8h2v8z\"/></svg>"},"streetview":{"name":"streetview","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12.56 14.33c-.34.27-.56.7-.56 1.17V21h7c1.1 0 2-.9 2-2v-5.98c-.94-.33-1.95-.52-3-.52-2.03 0-3.93.7-5.44 1.83z\"/><circle cx=\"18\" cy=\"6\" r=\"5\"/><path d=\"M11.5 6c0-1.08.27-2.1.74-3H5c-1.1 0-2 .9-2 2v14c0 .55.23 1.05.59 1.41l9.82-9.82C12.23 9.42 11.5 7.8 11.5 6z\"/></svg>"},"strikethrough-s":{"name":"strikethrough-s","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill=\"#010101\" d=\"M7.24 8.75c-.26-.48-.39-1.03-.39-1.67 0-.61.13-1.16.4-1.67.26-.5.63-.93 1.11-1.29.48-.35 1.05-.63 1.7-.83.66-.19 1.39-.29 2.18-.29.81 0 1.54.11 2.21.34.66.22 1.23.54 1.69.94.47.4.83.88 1.08 1.43.25.55.38 1.15.38 1.81h-3.01c0-.31-.05-.59-.15-.85-.09-.27-.24-.49-.44-.68-.2-.19-.45-.33-.75-.44-.3-.1-.66-.16-1.06-.16-.39 0-.74.04-1.03.13-.29.09-.53.21-.72.36-.19.16-.34.34-.44.55-.1.21-.15.43-.15.66 0 .48.25.88.74 1.21.38.25.77.48 1.41.7H7.39c-.05-.08-.11-.17-.15-.25zM21 12v-2H3v2h9.62c.18.07.4.14.55.2.37.17.66.34.87.51.21.17.35.36.43.57.07.2.11.43.11.69 0 .23-.05.45-.14.66-.09.2-.23.38-.42.53-.19.15-.42.26-.71.35-.29.08-.63.13-1.01.13-.43 0-.83-.04-1.18-.13s-.66-.23-.91-.42c-.25-.19-.45-.44-.59-.75-.14-.31-.25-.76-.25-1.21H6.4c0 .55.08 1.13.24 1.58.16.45.37.85.65 1.21.28.35.6.66.98.92.37.26.78.48 1.22.65.44.17.9.3 1.38.39.48.08.96.13 1.44.13.8 0 1.53-.09 2.18-.28s1.21-.45 1.67-.79c.46-.34.82-.77 1.07-1.27s.38-1.07.38-1.71c0-.6-.1-1.14-.31-1.61-.05-.11-.11-.23-.17-.33H21z\"/></svg>"},"style":{"name":"style","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M2.53 19.65l1.34.56v-9.03l-2.43 5.86c-.41 1.02.08 2.19 1.09 2.61zm19.5-3.7L17.07 3.98c-.31-.75-1.04-1.21-1.81-1.23-.26 0-.53.04-.79.15L7.1 5.95c-.75.31-1.21 1.03-1.23 1.8-.01.27.04.54.15.8l4.96 11.97c.31.76 1.05 1.22 1.83 1.23.26 0 .52-.05.77-.15l7.36-3.05c1.02-.42 1.51-1.59 1.09-2.6zM7.88 8.75c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-2 11c0 1.1.9 2 2 2h1.45l-3.45-8.34v6.34z\"/></svg>"},"subdirectory-arrow-left":{"name":"subdirectory-arrow-left","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11 9l1.42 1.42L8.83 14H18V4h2v12H8.83l3.59 3.58L11 21l-6-6 6-6z\"/></svg>"},"subdirectory-arrow-right":{"name":"subdirectory-arrow-right","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 15l-6 6-1.42-1.42L15.17 16H4V4h2v10h9.17l-3.59-3.58L13 9l6 6z\"/></svg>"},"subject":{"name":"subject","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z\"/></svg>"},"subscriptions":{"name":"subscriptions","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 8H4V6h16v2zm-2-6H6v2h12V2zm4 10v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2zm-6 4l-6-3.27v6.53L16 16z\"/></svg>"},"subtitles":{"name":"subtitles","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z\"/></svg>"},"subway":{"name":"subway","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><circle cx=\"15.5\" cy=\"16\" r=\"1\"/><circle cx=\"8.5\" cy=\"16\" r=\"1\"/><path d=\"M7.01 9h10v5h-10zM17.8 2.8C16 2.09 13.86 2 12 2c-1.86 0-4 .09-5.8.8C3.53 3.84 2 6.05 2 8.86V22h20V8.86c0-2.81-1.53-5.02-4.2-6.06zm.2 13.08c0 1.45-1.18 2.62-2.63 2.62l1.13 1.12V20H15l-1.5-1.5h-2.83L9.17 20H7.5v-.38l1.12-1.12C7.18 18.5 6 17.32 6 15.88V9c0-2.63 3-3 6-3 3.32 0 6 .38 6 3v6.88z\"/></svg>"},"supervisor-account":{"name":"supervisor-account","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16.5 12c1.38 0 2.49-1.12 2.49-2.5S17.88 7 16.5 7C15.12 7 14 8.12 14 9.5s1.12 2.5 2.5 2.5zM9 11c1.66 0 2.99-1.34 2.99-3S10.66 5 9 5C7.34 5 6 6.34 6 8s1.34 3 3 3zm7.5 3c-1.83 0-5.5.92-5.5 2.75V19h11v-2.25c0-1.83-3.67-2.75-5.5-2.75zM9 13c-2.33 0-7 1.17-7 3.5V19h7v-2.25c0-.85.33-2.34 2.37-3.47C10.5 13.1 9.66 13 9 13z\"/></svg>"},"surround-sound":{"name":"surround-sound","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM7.76 16.24l-1.41 1.41C4.78 16.1 4 14.05 4 12c0-2.05.78-4.1 2.34-5.66l1.41 1.41C6.59 8.93 6 10.46 6 12s.59 3.07 1.76 4.24zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm5.66 1.66l-1.41-1.41C17.41 15.07 18 13.54 18 12s-.59-3.07-1.76-4.24l1.41-1.41C19.22 7.9 20 9.95 20 12c0 2.05-.78 4.1-2.34 5.66zM12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z\"/></svg>"},"swap-calls":{"name":"swap-calls","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 4l-4 4h3v7c0 1.1-.9 2-2 2s-2-.9-2-2V8c0-2.21-1.79-4-4-4S5 5.79 5 8v7H2l4 4 4-4H7V8c0-1.1.9-2 2-2s2 .9 2 2v7c0 2.21 1.79 4 4 4s4-1.79 4-4V8h3l-4-4z\"/></svg>"},"swap-horiz":{"name":"swap-horiz","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z\"/></svg>"},"swap-vert":{"name":"swap-vert","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z\"/></svg>"},"swap-vertical-circle":{"name":"swap-vertical-circle","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM6.5 9L10 5.5 13.5 9H11v4H9V9H6.5zm11 6L14 18.5 10.5 15H13v-4h2v4h2.5z\"/></svg>"},"switch-camera":{"name":"switch-camera","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 11.5V13H9v2.5L5.5 12 9 8.5V11h6V8.5l3.5 3.5-3.5 3.5z\"/></svg>"},"switch-video":{"name":"switch-video","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 9.5V6c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-3.5l4 4v-13l-4 4zm-5 6V13H7v2.5L3.5 12 7 8.5V11h6V8.5l3.5 3.5-3.5 3.5z\"/></svg>"},"sync-disabled":{"name":"sync-disabled","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 6.35V4.26c-.8.21-1.55.54-2.23.96l1.46 1.46c.25-.12.5-.24.77-.33zm-7.14-.94l2.36 2.36C4.45 8.99 4 10.44 4 12c0 2.21.91 4.2 2.36 5.64L4 20h6v-6l-2.24 2.24C6.68 15.15 6 13.66 6 12c0-1 .25-1.94.68-2.77l8.08 8.08c-.25.13-.5.25-.77.34v2.09c.8-.21 1.55-.54 2.23-.96l2.36 2.36 1.27-1.27L4.14 4.14 2.86 5.41zM20 4h-6v6l2.24-2.24C17.32 8.85 18 10.34 18 12c0 1-.25 1.94-.68 2.77l1.46 1.46C19.55 15.01 20 13.56 20 12c0-2.21-.91-4.2-2.36-5.64L20 4z\"/></svg>"},"sync-problem":{"name":"sync-problem","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 12c0 2.21.91 4.2 2.36 5.64L3 20h6v-6l-2.24 2.24C5.68 15.15 5 13.66 5 12c0-2.61 1.67-4.83 4-5.65V4.26C5.55 5.15 3 8.27 3 12zm8 5h2v-2h-2v2zM21 4h-6v6l2.24-2.24C18.32 8.85 19 10.34 19 12c0 2.61-1.67 4.83-4 5.65v2.09c3.45-.89 6-4.01 6-7.74 0-2.21-.91-4.2-2.36-5.64L21 4zm-10 9h2V7h-2v6z\"/></svg>"},"sync":{"name":"sync","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z\"/></svg>"},"system-update-alt":{"name":"system-update-alt","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 16.5l4-4h-3v-9h-2v9H8l4 4zm9-13h-6v1.99h6v14.03H3V5.49h6V3.5H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2v-14c0-1.1-.9-2-2-2z\"/></svg>"},"system-update":{"name":"system-update","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14zm-1-6h-3V8h-2v5H8l4 4 4-4z\"/></svg>"},"tab-unselected":{"name":"tab-unselected","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M1 9h2V7H1v2zm0 4h2v-2H1v2zm0-8h2V3c-1.1 0-2 .9-2 2zm8 16h2v-2H9v2zm-8-4h2v-2H1v2zm2 4v-2H1c0 1.1.9 2 2 2zM21 3h-8v6h10V5c0-1.1-.9-2-2-2zm0 14h2v-2h-2v2zM9 5h2V3H9v2zM5 21h2v-2H5v2zM5 5h2V3H5v2zm16 16c1.1 0 2-.9 2-2h-2v2zm0-8h2v-2h-2v2zm-8 8h2v-2h-2v2zm4 0h2v-2h-2v2z\"/></svg>"},"tab":{"name":"tab","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h10v4h8v10z\"/></svg>"},"tablet-android":{"name":"tablet-android","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 0H6C4.34 0 3 1.34 3 3v18c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V3c0-1.66-1.34-3-3-3zm-4 22h-4v-1h4v1zm5.25-3H4.75V3h14.5v16z\"/></svg>"},"tablet-mac":{"name":"tablet-mac","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18.5 0h-14C3.12 0 2 1.12 2 2.5v19C2 22.88 3.12 24 4.5 24h14c1.38 0 2.5-1.12 2.5-2.5v-19C21 1.12 19.88 0 18.5 0zm-7 23c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm7.5-4H4V3h15v16z\"/></svg>"},"tablet":{"name":"tablet","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 1.99-.9 1.99-2L23 6c0-1.1-.9-2-2-2zm-2 14H5V6h14v12z\"/></svg>"},"tag-faces":{"name":"tag-faces","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z\"/></svg>"},"tap-and-play":{"name":"tap-and-play","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M2 16v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0 4v3h3c0-1.66-1.34-3-3-3zm0-8v2c4.97 0 9 4.03 9 9h2c0-6.08-4.92-11-11-11zM17 1.01L7 1c-1.1 0-2 .9-2 2v7.37c.69.16 1.36.37 2 .64V5h10v13h-3.03c.52 1.25.84 2.59.95 4H17c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99z\"/></svg>"},"terrain":{"name":"terrain","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z\"/></svg>"},"text-fields":{"name":"text-fields","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M2.5 4v3h5v12h3V7h5V4h-13zm19 5h-9v3h3v7h3v-7h3V9z\"/></svg>"},"text-format":{"name":"text-format","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M5 17v2h14v-2H5zm4.5-4.2h5l.9 2.2h2.1L12.75 4h-1.5L6.5 15h2.1l.9-2.2zM12 5.98L13.87 11h-3.74L12 5.98z\"/></svg>"},"textsms":{"name":"textsms","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z\"/></svg>"},"texture":{"name":"texture","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.51 3.08L3.08 19.51c.09.34.27.65.51.9.25.24.56.42.9.51L20.93 4.49c-.19-.69-.73-1.23-1.42-1.41zM11.88 3L3 11.88v2.83L14.71 3h-2.83zM5 3c-1.1 0-2 .9-2 2v2l4-4H5zm14 18c.55 0 1.05-.22 1.41-.59.37-.36.59-.86.59-1.41v-2l-4 4h2zm-9.71 0h2.83L21 12.12V9.29L9.29 21z\"/></svg>"},"theaters":{"name":"theaters","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z\"/></svg>"},"thumb-down":{"name":"thumb-down","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z\"/></svg>"},"thumb-up":{"name":"thumb-up","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z\"/></svg>"},"thumbs-up-down":{"name":"thumbs-up-down","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 6c0-.55-.45-1-1-1H5.82l.66-3.18.02-.23c0-.31-.13-.59-.33-.8L5.38 0 .44 4.94C.17 5.21 0 5.59 0 6v6.5c0 .83.67 1.5 1.5 1.5h6.75c.62 0 1.15-.38 1.38-.91l2.26-5.29c.07-.17.11-.36.11-.55V6zm10.5 4h-6.75c-.62 0-1.15.38-1.38.91l-2.26 5.29c-.07.17-.11.36-.11.55V18c0 .55.45 1 1 1h5.18l-.66 3.18-.02.24c0 .31.13.59.33.8l.79.78 4.94-4.94c.27-.27.44-.65.44-1.06v-6.5c0-.83-.67-1.5-1.5-1.5z\"/></svg>"},"time-to-leave":{"name":"time-to-leave","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.21.42-1.42 1.01L3 11v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 15c-.83 0-1.5-.67-1.5-1.5S5.67 12 6.5 12s1.5.67 1.5 1.5S7.33 15 6.5 15zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 10l1.5-4.5h11L19 10H5z\"/></svg>"},"timelapse":{"name":"timelapse","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16.24 7.76C15.07 6.59 13.54 6 12 6v6l-4.24 4.24c2.34 2.34 6.14 2.34 8.49 0 2.34-2.34 2.34-6.14-.01-8.48zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z\"/></svg>"},"timeline":{"name":"timeline","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M23 8c0 1.1-.9 2-2 2-.18 0-.35-.02-.51-.07l-3.56 3.55c.05.16.07.34.07.52 0 1.1-.9 2-2 2s-2-.9-2-2c0-.18.02-.36.07-.52l-2.55-2.55c-.16.05-.34.07-.52.07s-.36-.02-.52-.07l-4.55 4.56c.05.16.07.33.07.51 0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2c.18 0 .35.02.51.07l4.56-4.55C8.02 9.36 8 9.18 8 9c0-1.1.9-2 2-2s2 .9 2 2c0 .18-.02.36-.07.52l2.55 2.55c.16-.05.34-.07.52-.07s.36.02.52.07l3.55-3.56C19.02 8.35 19 8.18 19 8c0-1.1.9-2 2-2s2 .9 2 2z\"/></svg>"},"timer-10":{"name":"timer-10","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M0 7.72V9.4l3-1V18h2V6h-.25L0 7.72zm23.78 6.65c-.14-.28-.35-.53-.63-.74-.28-.21-.61-.39-1.01-.53s-.85-.27-1.35-.38c-.35-.07-.64-.15-.87-.23-.23-.08-.41-.16-.55-.25-.14-.09-.23-.19-.28-.3-.05-.11-.08-.24-.08-.39 0-.14.03-.28.09-.41.06-.13.15-.25.27-.34.12-.1.27-.18.45-.24s.4-.09.64-.09c.25 0 .47.04.66.11.19.07.35.17.48.29.13.12.22.26.29.42.06.16.1.32.1.49h1.95c0-.39-.08-.75-.24-1.09-.16-.34-.39-.63-.69-.88-.3-.25-.66-.44-1.09-.59C21.49 9.07 21 9 20.46 9c-.51 0-.98.07-1.39.21-.41.14-.77.33-1.06.57-.29.24-.51.52-.67.84-.16.32-.23.65-.23 1.01s.08.69.23.96c.15.28.36.52.64.73.27.21.6.38.98.53.38.14.81.26 1.27.36.39.08.71.17.95.26s.43.19.57.29c.13.1.22.22.27.34.05.12.07.25.07.39 0 .32-.13.57-.4.77-.27.2-.66.29-1.17.29-.22 0-.43-.02-.64-.08-.21-.05-.4-.13-.56-.24-.17-.11-.3-.26-.41-.44-.11-.18-.17-.41-.18-.67h-1.89c0 .36.08.71.24 1.05.16.34.39.65.7.93.31.27.69.49 1.15.66.46.17.98.25 1.58.25.53 0 1.01-.06 1.44-.19.43-.13.8-.31 1.11-.54.31-.23.54-.51.71-.83.17-.32.25-.67.25-1.06-.02-.4-.09-.74-.24-1.02zm-9.96-7.32c-.34-.4-.75-.7-1.23-.88-.47-.18-1.01-.27-1.59-.27-.58 0-1.11.09-1.59.27-.48.18-.89.47-1.23.88-.34.41-.6.93-.79 1.59-.18.65-.28 1.45-.28 2.39v1.92c0 .94.09 1.74.28 2.39.19.66.45 1.19.8 1.6.34.41.75.71 1.23.89.48.18 1.01.28 1.59.28.59 0 1.12-.09 1.59-.28.48-.18.88-.48 1.22-.89.34-.41.6-.94.78-1.6.18-.65.28-1.45.28-2.39v-1.92c0-.94-.09-1.74-.28-2.39-.18-.66-.44-1.19-.78-1.59zm-.92 6.17c0 .6-.04 1.11-.12 1.53-.08.42-.2.76-.36 1.02-.16.26-.36.45-.59.57-.23.12-.51.18-.82.18-.3 0-.58-.06-.82-.18s-.44-.31-.6-.57c-.16-.26-.29-.6-.38-1.02-.09-.42-.13-.93-.13-1.53v-2.5c0-.6.04-1.11.13-1.52.09-.41.21-.74.38-1 .16-.25.36-.43.6-.55.24-.11.51-.17.81-.17.31 0 .58.06.81.17.24.11.44.29.6.55.16.25.29.58.37.99.08.41.13.92.13 1.52v2.51z\"/></svg>"},"timer-3":{"name":"timer-3","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11.61 12.97c-.16-.24-.36-.46-.62-.65-.25-.19-.56-.35-.93-.48.3-.14.57-.3.8-.5.23-.2.42-.41.57-.64.15-.23.27-.46.34-.71.08-.24.11-.49.11-.73 0-.55-.09-1.04-.28-1.46-.18-.42-.44-.77-.78-1.06-.33-.28-.73-.5-1.2-.64-.45-.13-.97-.2-1.53-.2-.55 0-1.06.08-1.52.24-.47.17-.87.4-1.2.69-.33.29-.6.63-.78 1.03-.2.39-.29.83-.29 1.29h1.98c0-.26.05-.49.14-.69.09-.2.22-.38.38-.52.17-.14.36-.25.58-.33.22-.08.46-.12.73-.12.61 0 1.06.16 1.36.47.3.31.44.75.44 1.32 0 .27-.04.52-.12.74-.08.22-.21.41-.38.57-.17.16-.38.28-.63.37-.25.09-.55.13-.89.13H6.72v1.57H7.9c.34 0 .64.04.91.11.27.08.5.19.69.35.19.16.34.36.44.61.1.24.16.54.16.87 0 .62-.18 1.09-.53 1.42-.35.33-.84.49-1.45.49-.29 0-.56-.04-.8-.13-.24-.08-.44-.2-.61-.36-.17-.16-.3-.34-.39-.56-.09-.22-.14-.46-.14-.72H4.19c0 .55.11 1.03.32 1.45.21.42.5.77.86 1.05s.77.49 1.24.63.96.21 1.48.21c.57 0 1.09-.08 1.58-.23.49-.15.91-.38 1.26-.68.36-.3.64-.66.84-1.1.2-.43.3-.93.3-1.48 0-.29-.04-.58-.11-.86-.08-.25-.19-.51-.35-.76zm9.26 1.4c-.14-.28-.35-.53-.63-.74-.28-.21-.61-.39-1.01-.53s-.85-.27-1.35-.38c-.35-.07-.64-.15-.87-.23-.23-.08-.41-.16-.55-.25-.14-.09-.23-.19-.28-.3-.05-.11-.08-.24-.08-.39s.03-.28.09-.41c.06-.13.15-.25.27-.34.12-.1.27-.18.45-.24s.4-.09.64-.09c.25 0 .47.04.66.11.19.07.35.17.48.29.13.12.22.26.29.42.06.16.1.32.1.49h1.95c0-.39-.08-.75-.24-1.09-.16-.34-.39-.63-.69-.88-.3-.25-.66-.44-1.09-.59-.43-.15-.92-.22-1.46-.22-.51 0-.98.07-1.39.21-.41.14-.77.33-1.06.57-.29.24-.51.52-.67.84-.16.32-.23.65-.23 1.01s.08.68.23.96c.15.28.37.52.64.73.27.21.6.38.98.53.38.14.81.26 1.27.36.39.08.71.17.95.26s.43.19.57.29c.13.1.22.22.27.34.05.12.07.25.07.39 0 .32-.13.57-.4.77-.27.2-.66.29-1.17.29-.22 0-.43-.02-.64-.08-.21-.05-.4-.13-.56-.24-.17-.11-.3-.26-.41-.44-.11-.18-.17-.41-.18-.67h-1.89c0 .36.08.71.24 1.05.16.34.39.65.7.93.31.27.69.49 1.15.66.46.17.98.25 1.58.25.53 0 1.01-.06 1.44-.19.43-.13.8-.31 1.11-.54.31-.23.54-.51.71-.83.17-.32.25-.67.25-1.06-.02-.4-.09-.74-.24-1.02z\"/></svg>"},"timer-off":{"name":"timer-off","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.04 4.55l-1.42 1.42C16.07 4.74 14.12 4 12 4c-1.83 0-3.53.55-4.95 1.48l1.46 1.46C9.53 6.35 10.73 6 12 6c3.87 0 7 3.13 7 7 0 1.27-.35 2.47-.94 3.49l1.45 1.45C20.45 16.53 21 14.83 21 13c0-2.12-.74-4.07-1.97-5.61l1.42-1.42-1.41-1.42zM15 1H9v2h6V1zm-4 8.44l2 2V8h-2v1.44zM3.02 4L1.75 5.27 4.5 8.03C3.55 9.45 3 11.16 3 13c0 4.97 4.02 9 9 9 1.84 0 3.55-.55 4.98-1.5l2.5 2.5 1.27-1.27-7.71-7.71L3.02 4zM12 20c-3.87 0-7-3.13-7-7 0-1.28.35-2.48.95-3.52l9.56 9.56c-1.03.61-2.23.96-3.51.96z\"/></svg>"},"timer":{"name":"timer","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z\"/></svg>"},"title":{"name":"title","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M5 4v3h5.5v12h3V7H19V4z\"/></svg>"},"toc":{"name":"toc","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 9h14V7H3v2zm0 4h14v-2H3v2zm0 4h14v-2H3v2zm16 0h2v-2h-2v2zm0-10v2h2V7h-2zm0 6h2v-2h-2v2z\"/></svg>"},"today":{"name":"today","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z\"/></svg>"},"toll":{"name":"toll","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15 4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zM3 12c0-2.61 1.67-4.83 4-5.65V4.26C3.55 5.15 1 8.27 1 12s2.55 6.85 6 7.74v-2.09c-2.33-.82-4-3.04-4-5.65z\"/></svg>"},"tonality":{"name":"tonality","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H13v-.93zM13 7h5.24c.25.31.48.65.68 1H13V7zm0 3h6.74c.08.33.15.66.19 1H13v-1zm0 9.93V19h2.87c-.87.48-1.84.8-2.87.93zM18.24 17H13v-1h5.92c-.2.35-.43.69-.68 1zm1.5-3H13v-1h6.93c-.04.34-.11.67-.19 1z\"/></svg>"},"touch-app":{"name":"touch-app","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z\"/></svg>"},"toys":{"name":"toys","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 12c0-3 2.5-5.5 5.5-5.5S23 9 23 12H12zm0 0c0 3-2.5 5.5-5.5 5.5S1 15 1 12h11zm0 0c-3 0-5.5-2.5-5.5-5.5S9 1 12 1v11zm0 0c3 0 5.5 2.5 5.5 5.5S15 23 12 23V12z\"/></svg>"},"track-changes":{"name":"track-changes","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.07 4.93l-1.41 1.41C19.1 7.79 20 9.79 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.08 3.05-7.44 7-7.93v2.02C8.16 6.57 6 9.03 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6c0-1.66-.67-3.16-1.76-4.24l-1.41 1.41C15.55 9.9 16 10.9 16 12c0 2.21-1.79 4-4 4s-4-1.79-4-4c0-1.86 1.28-3.41 3-3.86v2.14c-.6.35-1 .98-1 1.72 0 1.1.9 2 2 2s2-.9 2-2c0-.74-.4-1.38-1-1.72V2h-1C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07z\"/></svg>"},"traffic":{"name":"traffic","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 10h-3V8.86c1.72-.45 3-2 3-3.86h-3V4c0-.55-.45-1-1-1H8c-.55 0-1 .45-1 1v1H4c0 1.86 1.28 3.41 3 3.86V10H4c0 1.86 1.28 3.41 3 3.86V15H4c0 1.86 1.28 3.41 3 3.86V20c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1.14c1.72-.45 3-2 3-3.86h-3v-1.14c1.72-.45 3-2 3-3.86zm-8 9c-1.11 0-2-.9-2-2s.89-2 2-2c1.1 0 2 .9 2 2s-.89 2-2 2zm0-5c-1.11 0-2-.9-2-2s.89-2 2-2c1.1 0 2 .9 2 2s-.89 2-2 2zm0-5c-1.11 0-2-.9-2-2 0-1.11.89-2 2-2 1.1 0 2 .89 2 2 0 1.1-.89 2-2 2z\"/></svg>"},"train":{"name":"train","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z\"/></svg>"},"tram":{"name":"tram","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 16.94V8.5c0-2.79-2.61-3.4-6.01-3.49l.76-1.51H17V2H7v1.5h4.75l-.76 1.52C7.86 5.11 5 5.73 5 8.5v8.44c0 1.45 1.19 2.66 2.59 2.97L6 21.5v.5h2.23l2-2H14l2 2h2v-.5L16.5 20h-.08c1.69 0 2.58-1.37 2.58-3.06zm-7 1.56c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5-4.5H7V9h10v5z\"/></svg>"},"transfer-within-a-station":{"name":"transfer-within-a-station","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16.49 15.5v-1.75L14 16.25l2.49 2.5V17H22v-1.5zm3.02 4.25H14v1.5h5.51V23L22 20.5 19.51 18zM9.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5.75 8.9L3 23h2.1l1.75-8L9 17v6h2v-7.55L8.95 13.4l.6-3C10.85 12 12.8 13 15 13v-2c-1.85 0-3.45-1-4.35-2.45l-.95-1.6C9.35 6.35 8.7 6 8 6c-.25 0-.5.05-.75.15L2 8.3V13h2V9.65l1.75-.75\"/></svg>"},"transform":{"name":"transform","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 18v-2H8V4h2L7 1 4 4h2v2H2v2h4v8c0 1.1.9 2 2 2h8v2h-2l3 3 3-3h-2v-2h4zM10 8h6v6h2V8c0-1.1-.9-2-2-2h-6v2z\"/></svg>"},"translate":{"name":"translate","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z\"/></svg>"},"trending-down":{"name":"trending-down","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z\"/></svg>"},"trending-flat":{"name":"trending-flat","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 12l-4-4v3H3v2h15v3z\"/></svg>"},"trending-up":{"name":"trending-up","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z\"/></svg>"},"tune":{"name":"tune","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z\"/></svg>"},"turned-in-not":{"name":"turned-in-not","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z\"/></svg>"},"turned-in":{"name":"turned-in","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z\"/></svg>"},"tv":{"name":"tv","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z\"/></svg>"},"unarchive":{"name":"unarchive","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20.55 5.22l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.15.55L3.46 5.22C3.17 5.57 3 6.01 3 6.5V19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.49-.17-.93-.45-1.28zM12 9.5l5.5 5.5H14v2h-4v-2H6.5L12 9.5zM5.12 5l.82-1h12l.93 1H5.12z\"/></svg>"},"undo":{"name":"undo","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z\"/></svg>"},"unfold-less":{"name":"unfold-less","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7.41 18.59L8.83 20 12 16.83 15.17 20l1.41-1.41L12 14l-4.59 4.59zm9.18-13.18L15.17 4 12 7.17 8.83 4 7.41 5.41 12 10l4.59-4.59z\"/></svg>"},"unfold-more":{"name":"unfold-more","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 5.83L15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9 12 5.83zm0 12.34L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15 12 18.17z\"/></svg>"},"update":{"name":"update","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79 2.73 2.71 7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58 3.51-3.47 9.14-3.47 12.65 0L21 3v7.12zM12.5 8v4.25l3.5 2.08-.72 1.21L11 13V8h1.5z\"/></svg>"},"usb":{"name":"usb","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15 7v4h1v2h-3V5h2l-3-4-3 4h2v8H8v-2.07c.7-.37 1.2-1.08 1.2-1.93 0-1.21-.99-2.2-2.2-2.2-1.21 0-2.2.99-2.2 2.2 0 .85.5 1.56 1.2 1.93V13c0 1.11.89 2 2 2h3v3.05c-.71.37-1.2 1.1-1.2 1.95 0 1.22.99 2.2 2.2 2.2 1.21 0 2.2-.98 2.2-2.2 0-.85-.49-1.58-1.2-1.95V15h3c1.11 0 2-.89 2-2v-2h1V7h-4z\"/></svg>"},"verified-user":{"name":"verified-user","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z\"/></svg>"},"vertical-align-bottom":{"name":"vertical-align-bottom","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16 13h-3V3h-2v10H8l4 4 4-4zM4 19v2h16v-2H4z\"/></svg>"},"vertical-align-center":{"name":"vertical-align-center","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M8 19h3v4h2v-4h3l-4-4-4 4zm8-14h-3V1h-2v4H8l4 4 4-4zM4 11v2h16v-2H4z\"/></svg>"},"vertical-align-top":{"name":"vertical-align-top","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M8 11h3v10h2V11h3l-4-4-4 4zM4 3v2h16V3H4z\"/></svg>"},"vibration":{"name":"vibration","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M0 15h2V9H0v6zm3 2h2V7H3v10zm19-8v6h2V9h-2zm-3 8h2V7h-2v10zM16.5 3h-9C6.67 3 6 3.67 6 4.5v15c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zM16 19H8V5h8v14z\"/></svg>"},"video-call":{"name":"video-call","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z\"/></svg>"},"video-label":{"name":"video-label","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H3V5h18v11z\"/></svg>"},"video-library":{"name":"video-library","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z\"/></svg>"},"videocam-off":{"name":"videocam-off","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z\"/></svg>"},"videocam":{"name":"videocam","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z\"/></svg>"},"videogame-asset":{"name":"videogame-asset","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z\"/></svg>"},"view-agenda":{"name":"view-agenda","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 13H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zm0-10H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z\"/></svg>"},"view-array":{"name":"view-array","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 18h3V5H4v13zM18 5v13h3V5h-3zM8 18h9V5H8v13z\"/></svg>"},"view-carousel":{"name":"view-carousel","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 19h10V4H7v15zm-5-2h4V6H2v11zM18 6v11h4V6h-4z\"/></svg>"},"view-column":{"name":"view-column","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 18h5V5h-5v13zm-6 0h5V5H4v13zM16 5v13h5V5h-5z\"/></svg>"},"view-comfy":{"name":"view-comfy","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 9h4V5H3v4zm0 5h4v-4H3v4zm5 0h4v-4H8v4zm5 0h4v-4h-4v4zM8 9h4V5H8v4zm5-4v4h4V5h-4zm5 9h4v-4h-4v4zM3 19h4v-4H3v4zm5 0h4v-4H8v4zm5 0h4v-4h-4v4zm5 0h4v-4h-4v4zm0-14v4h4V5h-4z\"/></svg>"},"view-compact":{"name":"view-compact","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 19h6v-7H3v7zm7 0h12v-7H10v7zM3 5v6h19V5H3z\"/></svg>"},"view-day":{"name":"view-day","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M2 21h19v-3H2v3zM20 8H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zM2 3v3h19V3H2z\"/></svg>"},"view-headline":{"name":"view-headline","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 15h16v-2H4v2zm0 4h16v-2H4v2zm0-8h16V9H4v2zm0-6v2h16V5H4z\"/></svg>"},"view-list":{"name":"view-list","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 14h4v-4H4v4zm0 5h4v-4H4v4zM4 9h4V5H4v4zm5 5h12v-4H9v4zm0 5h12v-4H9v4zM9 5v4h12V5H9z\"/></svg>"},"view-module":{"name":"view-module","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z\"/></svg>"},"view-quilt":{"name":"view-quilt","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10 18h5v-6h-5v6zm-6 0h5V5H4v13zm12 0h5v-6h-5v6zM10 5v6h11V5H10z\"/></svg>"},"view-stream":{"name":"view-stream","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 18h17v-6H4v6zM4 5v6h17V5H4z\"/></svg>"},"view-week":{"name":"view-week","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6 5H3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zm14 0h-3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zm-7 0h-3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1z\"/></svg>"},"vignette":{"name":"vignette","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 15c-4.42 0-8-2.69-8-6s3.58-6 8-6 8 2.69 8 6-3.58 6-8 6z\"/></svg>"},"visibility-off":{"name":"visibility-off","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z\"/></svg>"},"visibility":{"name":"visibility","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z\"/></svg>"},"voice-chat":{"name":"voice-chat","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12l-4-3.2V14H6V6h8v3.2L18 6v8z\"/></svg>"},"voicemail":{"name":"voicemail","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18.5 6C15.46 6 13 8.46 13 11.5c0 1.33.47 2.55 1.26 3.5H9.74c.79-.95 1.26-2.17 1.26-3.5C11 8.46 8.54 6 5.5 6S0 8.46 0 11.5 2.46 17 5.5 17h13c3.04 0 5.5-2.46 5.5-5.5S21.54 6 18.5 6zm-13 9C3.57 15 2 13.43 2 11.5S3.57 8 5.5 8 9 9.57 9 11.5 7.43 15 5.5 15zm13 0c-1.93 0-3.5-1.57-3.5-3.5S16.57 8 18.5 8 22 9.57 22 11.5 20.43 15 18.5 15z\"/></svg>"},"volume-down":{"name":"volume-down","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z\"/></svg>"},"volume-mute":{"name":"volume-mute","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 9v6h4l5 5V4l-5 5H7z\"/></svg>"},"volume-off":{"name":"volume-off","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z\"/></svg>"},"volume-up":{"name":"volume-up","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z\"/></svg>"},"vpn-key":{"name":"vpn-key","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z\"/></svg>"},"vpn-lock":{"name":"vpn-lock","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 4v-.5C22 2.12 20.88 1 19.5 1S17 2.12 17 3.5V4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h5c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zm-.8 0h-3.4v-.5c0-.94.76-1.7 1.7-1.7s1.7.76 1.7 1.7V4zm-2.28 8c.04.33.08.66.08 1 0 2.08-.8 3.97-2.1 5.39-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H7v-2h2c.55 0 1-.45 1-1V8h2c1.1 0 2-.9 2-2V3.46c-.95-.3-1.95-.46-3-.46C5.48 3 1 7.48 1 13s4.48 10 10 10 10-4.48 10-10c0-.34-.02-.67-.05-1h-2.03zM10 20.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L8 16v1c0 1.1.9 2 2 2v1.93z\"/></svg>"},"wallpaper":{"name":"wallpaper","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 4h7V2H4c-1.1 0-2 .9-2 2v7h2V4zm6 9l-4 5h12l-3-4-2.03 2.71L10 13zm7-4.5c0-.83-.67-1.5-1.5-1.5S14 7.67 14 8.5s.67 1.5 1.5 1.5S17 9.33 17 8.5zM20 2h-7v2h7v7h2V4c0-1.1-.9-2-2-2zm0 18h-7v2h7c1.1 0 2-.9 2-2v-7h-2v7zM4 13H2v7c0 1.1.9 2 2 2h7v-2H4v-7z\"/></svg>"},"warning":{"name":"warning","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z\"/></svg>"},"watch-later":{"name":"watch-later","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z\"/></svg>"},"watch":{"name":"watch","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 12c0-2.54-1.19-4.81-3.04-6.27L16 0H8l-.95 5.73C5.19 7.19 4 9.45 4 12s1.19 4.81 3.05 6.27L8 24h8l.96-5.73C18.81 16.81 20 14.54 20 12zM6 12c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6-6-2.69-6-6z\"/></svg>"},"wb-auto":{"name":"wb-auto","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6.85 12.65h2.3L8 9l-1.15 3.65zM22 7l-1.2 6.29L19.3 7h-1.6l-1.49 6.29L15 7h-.76C12.77 5.17 10.53 4 8 4c-4.42 0-8 3.58-8 8s3.58 8 8 8c3.13 0 5.84-1.81 7.15-4.43l.1.43H17l1.5-6.1L20 16h1.75l2.05-9H22zm-11.7 9l-.7-2H6.4l-.7 2H3.8L7 7h2l3.2 9h-1.9z\"/></svg>"},"wb-cloudy":{"name":"wb-cloudy","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96z\"/></svg>"},"wb-incandescent":{"name":"wb-incandescent","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M3.55 18.54l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8zM11 22.45h2V19.5h-2v2.95zM4 10.5H1v2h3v-2zm11-4.19V1.5H9v4.81C7.21 7.35 6 9.28 6 11.5c0 3.31 2.69 6 6 6s6-2.69 6-6c0-2.22-1.21-4.15-3-5.19zm5 4.19v2h3v-2h-3zm-2.76 7.66l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4z\"/></svg>"},"wb-iridescent":{"name":"wb-iridescent","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M5 14.5h14v-6H5v6zM11 .55V3.5h2V.55h-2zm8.04 2.5l-1.79 1.79 1.41 1.41 1.8-1.79-1.42-1.41zM13 22.45V19.5h-2v2.95h2zm7.45-3.91l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zM3.55 4.46l1.79 1.79 1.41-1.41-1.79-1.79-1.41 1.41zm1.41 15.49l1.79-1.8-1.41-1.41-1.79 1.79 1.41 1.42z\"/></svg>"},"wb-sunny":{"name":"wb-sunny","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z\"/></svg>"},"wc":{"name":"wc","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M5.5 22v-7.5H4V9c0-1.1.9-2 2-2h3c1.1 0 2 .9 2 2v5.5H9.5V22h-4zM18 22v-6h3l-2.54-7.63C18.18 7.55 17.42 7 16.56 7h-.12c-.86 0-1.63.55-1.9 1.37L12 16h3v6h3zM7.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm9 0c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2z\"/></svg>"},"web-asset":{"name":"web-asset","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path fill=\"#010101\" d=\"M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm0 14H5V8h14v10z\"/></svg>"},"web":{"name":"web","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z\"/></svg>"},"weekend":{"name":"weekend","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 10c-1.1 0-2 .9-2 2v3H5v-3c0-1.1-.9-2-2-2s-2 .9-2 2v5c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2zm-3-5H6c-1.1 0-2 .9-2 2v2.15c1.16.41 2 1.51 2 2.82V14h12v-2.03c0-1.3.84-2.4 2-2.82V7c0-1.1-.9-2-2-2z\" fill=\"#010101\"/></svg>"},"whatshot":{"name":"whatshot","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z\"/></svg>"},"widgets":{"name":"widgets","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M13 13v8h8v-8h-8zM3 21h8v-8H3v8zM3 3v8h8V3H3zm13.66-1.31L11 7.34 16.66 13l5.66-5.66-5.66-5.65z\"/></svg>"},"wifi-lock":{"name":"wifi-lock","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20.5 9.5c.28 0 .55.04.81.08L24 6c-3.34-2.51-7.5-4-12-4S3.34 3.49 0 6l12 16 3.5-4.67V14.5c0-2.76 2.24-5 5-5zM23 16v-1.5c0-1.38-1.12-2.5-2.5-2.5S18 13.12 18 14.5V16c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1zm-1 0h-3v-1.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V16z\"/></svg>"},"wifi-tethering":{"name":"wifi-tethering","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 2c0-3.31-2.69-6-6-6s-6 2.69-6 6c0 2.22 1.21 4.15 3 5.19l1-1.74c-1.19-.7-2-1.97-2-3.45 0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.48-.81 2.75-2 3.45l1 1.74c1.79-1.04 3-2.97 3-5.19zM12 3C6.48 3 2 7.48 2 13c0 3.7 2.01 6.92 4.99 8.65l1-1.73C5.61 18.53 4 15.96 4 13c0-4.42 3.58-8 8-8s8 3.58 8 8c0 2.96-1.61 5.53-4 6.92l1 1.73c2.99-1.73 5-4.95 5-8.65 0-5.52-4.48-10-10-10z\"/></svg>"},"wifi":{"name":"wifi","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z\"/></svg>"},"work":{"name":"work","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z\"/></svg>"},"wrap-text":{"name":"wrap-text","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M4 19h6v-2H4v2zM20 5H4v2h16V5zm-3 6H4v2h13.25c1.1 0 2 .9 2 2s-.9 2-2 2H15v-2l-3 3 3 3v-2h2c2.21 0 4-1.79 4-4s-1.79-4-4-4z\"/></svg>"},"youtube-searched-for":{"name":"youtube-searched-for","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M17.01 14h-.8l-.27-.27c.98-1.14 1.57-2.61 1.57-4.23 0-3.59-2.91-6.5-6.5-6.5s-6.5 3-6.5 6.5H2l3.84 4 4.16-4H6.51C6.51 7 8.53 5 11.01 5s4.5 2.01 4.5 4.5c0 2.48-2.02 4.5-4.5 4.5-.65 0-1.26-.14-1.82-.38L7.71 15.1c.97.57 2.09.9 3.3.9 1.61 0 3.08-.59 4.22-1.57l.27.27v.79l5.01 4.99L22 19l-4.99-5z\"/></svg>"},"zoom-in":{"name":"zoom-in","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm2.5-4h-2v2H9v-2H7V9h2V7h1v2h2v1z\"/></svg>"},"zoom-out-map":{"name":"zoom-out-map","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3zm6 12l-2.3-2.3 2.89-2.87-1.42-1.42L5.3 17.3 3 15v6zm12-6l-2.3 2.3-2.87-2.89-1.42 1.42 2.89 2.87L15 21h6z\"/></svg>"},"zoom-out":{"name":"zoom-out","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" aria-hidden=\"true\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z\"/></svg>"}};

/**
 * @name Icon
 * @description For SVG icons.
 * @status internal
 * @private
 */
class Icon {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    let icon = icons[this.name];
    if (!icon) {
      console.log("Unable to find Icon with name: " + this.name);
      return null;
    }
    let svg = icon.svg;
    const sizedSvg = this.size ? svg
      .replace('width=\"16\"', `width=\"${this.size}\"`)
      .replace('height=\"16\"', `height=\"${this.size}\"`)
      : null;
    return hAsync(Host, { innerHTML: sizedSvg || svg });
  }
  static get cmpMeta() { return {
    "$flags$": 0,
    "$tagName$": "m-icon",
    "$members$": {
      "name": [1],
      "size": [1]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

/**
 * @name Logo
 * @description The University of Michigan Library logo.
 * @status internal
 * @private
 */
class Logo {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    const textColor = this.variant === 'dark' ? '#FFFFFF' : '#00274C';
    return (hAsync("svg", { viewBox: "0 0 199 30", xmlns: "http://www.w3.org/2000/svg", height: "34px", width: "224px", focusable: "false", "aria-hidden": "true" }, hAsync("g", { fill: "none", "fill-rule": "evenodd" }, hAsync("g", { "fill-rule": "nonzero" }, hAsync("polyline", { fill: "#FFCB05", points: "20.9572917 24.7441667 12.3733333 13.0122917 12.3733333 21.5458333 15.7866667 21.5458333 15.7866667 29.973125 0 29.973125 0 21.5458333 3.19875 21.5458333 3.19875 8.425625 0 8.425625 0 0 12.4010417 0 20.9572917 11.8164583 29.5135417 0 41.9116667 0 41.9116667 8.425625 38.7110417 8.425625 38.7110417 21.5458333 41.9116667 21.5458333 41.9116667 29.973125 26.1270833 29.973125 26.1270833 21.5458333 29.5377083 21.5458333 29.5377083 13.0122917 20.9572917 24.7441667" }), hAsync("polyline", { fill: textColor, points: "58.6452083 30 58.6452083 0.0420833333 62.461875 0.0420833333 62.461875 26.680625 73.4579167 26.680625 73.4579167 30 58.6452083 30" }), hAsync("polygon", { fill: textColor, points: "77.9570833 29.9875 81.773125 29.9875 81.773125 0.0420833333 77.9570833 0.0420833333" }), hAsync("path", { d: "M91.0308333,26.680625 L96.425,26.680625 C100.491042,26.680625 101.944583,23.775625 101.944583,21.5777083 C101.944583,16.8052083 98.9972917,15.9754167 95.0983333,15.9754167 L91.0308333,15.9754167 L91.0308333,26.680625 Z M91.0308333,12.655625 L96.5916667,12.655625 C99.5779167,12.6139583 101.032083,10.7891667 101.032083,7.884375 C101.032083,5.395 99.6195833,3.36145833 96.425,3.36145833 L91.0308333,3.36145833 L91.0308333,12.655625 Z M87.2135417,30 L87.2135417,0.0420833333 L96.9652083,0.0420833333 C101.114375,0.0420833333 102.524792,1.4525 103.644792,3.11291667 C104.683542,4.73125 104.848958,6.51583333 104.848958,7.095625 C104.848958,10.83 103.562917,13.320625 99.7033333,14.1910417 L99.7033333,14.399375 C103.978333,14.8972917 105.844583,17.4695833 105.844583,21.5777083 C105.844583,29.2535417 100.242708,30 96.8402083,30 L87.2135417,30 Z", fill: textColor }), hAsync("path", { d: "M113.772708,12.9047917 L119.500625,12.9047917 C122.239792,12.9047917 123.5675,10.5397917 123.5675,7.925 C123.5675,5.76791667 122.485833,3.36145833 119.540625,3.36145833 L113.772708,3.36145833 L113.772708,12.9047917 Z M113.772708,16.2245833 L113.772708,30 L109.956458,30 L109.956458,0.0420833333 L120.28875,0.0420833333 C125.6,0.0420833333 127.465625,3.77729167 127.465625,7.51104167 C127.465625,11.0377083 125.515833,13.7347917 121.988125,14.3575 L121.988125,14.44 C125.431042,14.9795833 126.675417,16.14125 126.885,22.1570833 C126.927083,23.4435417 127.341042,28.1325 127.924167,30 L123.940833,30 C122.860417,27.9254167 123.108542,24.025625 122.777083,20.041875 C122.485833,16.3908333 119.540625,16.2245833 118.25625,16.2245833 L113.772708,16.2245833 Z", fill: textColor }), hAsync("path", { d: "M143.173333,3.56770833 L143.09,3.56770833 L138.401042,19.5439583 L147.989375,19.5439583 L143.173333,3.56770833 Z M140.848333,0.0420833333 L145.703958,0.0420833333 L155.45625,30 L151.181875,30 L149.025417,22.8620833 L137.448958,22.8620833 L135.207292,30 L131.349167,30 L140.848333,0.0420833333 Z", fill: textColor }), hAsync("path", { d: "M162.97875,12.9047917 L168.704583,12.9047917 C171.442292,12.9047917 172.769167,10.5397917 172.769167,7.925 C172.769167,5.76791667 171.69125,3.36145833 168.745625,3.36145833 L162.97875,3.36145833 L162.97875,12.9047917 Z M162.97875,16.2245833 L162.97875,30 L159.159375,30 L159.159375,0.0420833333 L169.491667,0.0420833333 C174.801667,0.0420833333 176.670625,3.77729167 176.670625,7.51104167 C176.670625,11.0377083 174.720208,13.7347917 171.192708,14.3575 L171.192708,14.44 C174.636458,14.9795833 175.881042,16.14125 176.087917,22.1570833 C176.1325,23.4435417 176.546458,28.1325 177.125833,30 L173.142083,30 C172.064583,27.9254167 172.314583,24.025625 171.981875,20.041875 C171.69125,16.3908333 168.745625,16.2245833 167.459583,16.2245833 L162.97875,16.2245833 Z", fill: textColor }), hAsync("polyline", { fill: textColor, points: "194.878958 0.0420833333 198.737917 0.0420833333 190.562708 18.5897917 190.562708 30 186.744583 30 186.744583 18.5897917 178.695208 0.0420833333 182.968542 0.0420833333 188.82 14.5227083 194.878958 0.0420833333" }), hAsync("polygon", { fill: textColor, points: "50.1395834 29.9875 51.19625 29.9875 51.19625 0 50.1395834 0" })))));
  }
  static get cmpMeta() { return {
    "$flags$": 0,
    "$tagName$": "m-logo",
    "$members$": {
      "variant": [1]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const universalHeaderCss = "/*!@:root*/.sc-m-universal-header:root{--color-blue-100:rgb(247, 248, 249);--color-blue-200:rgb(178, 190, 201);--color-blue-300:rgb(76, 103, 129);--color-blue-400:rgb(0, 39, 76);--color-blue-500:rgb(0, 19, 36);--color-maize-100:rgb(255, 249, 230);--color-maize-200:rgb(255, 234, 155);--color-maize-300:rgb(255, 218, 80);--color-maize-400:rgb(255, 203, 5);--color-maize-500:rgb(234, 186, 2);--color-neutral-100:rgb(229, 233, 237);--color-neutral-200:rgb(138, 150, 161);--color-neutral-300:rgb(99, 115, 129);--color-neutral-400:rgb(33, 43, 54);--color-neutral-500:rgb(6, 8, 10);--color-teal-100:rgb(233, 242, 245);--color-teal-200:rgb(167, 205, 219);--color-teal-300:rgb(101, 168, 191);--color-teal-400:rgb(29, 116, 145);--color-teal-500:rgb(16, 102, 132);--color-orange-100:rgb(255, 241, 235);--color-orange-200:rgb(255, 184, 153);--color-orange-300:rgb(255, 138, 88);--color-orange-400:rgb(242, 95, 31);--color-orange-500:rgb(199, 78, 26);--color-pink-100:rgb(252, 235, 235);--color-pink-200:rgb(242, 157, 157);--color-pink-300:rgb(236, 105, 105);--color-pink-400:rgb(217, 56, 56);--color-pink-500:rgb(191, 50, 50);--color-indigo-100:rgb(238, 241, 249);--color-indigo-200:rgb(170, 185, 227);--color-indigo-300:rgb(124, 147, 212);--color-indigo-400:rgb(80, 111, 197);--color-indigo-500:rgb(39, 67, 145);--color-green-100:rgb(234, 248, 238);--color-green-200:rgb(150, 219, 170);--color-green-300:rgb(87, 188, 117);--color-green-400:rgb(32, 168, 72);--color-green-500:rgb(25, 133, 57);--font-base-family:'Muli', sans-serif;--font-second-family:'Crimson Text', serif;--bold:700;--regular:400;--semibold:600;--extrabold:800;--line-height-default:1.5;--line-height-heading:1.25;--line-height-page-heading:1.125;--text-base-size:16px;--text-xxx-large:3.5rem;--text-xx-large:2.25rem;--text-x-large:2rem;--text-large:1.75rem;--text-medium:1.5rem;--text-small:1.125rem;--text-x-small:1.125rem;--text-xx-small:1rem;--text-xxx-small:0.875rem;--space-xxx-small:2px;--space-xx-small:4px;--space-x-small:8px;--space-small:12px;--space-medium:16px;--space-large:24px;--space-x-large:32px;--space-xx-large:40px;--space-xxx-large:48px;--space-xxxx-large:64px;--space-xxxxx-large:96px;--z-space-small:rgba(0, 0, 0, 0.2) 0px 2px 8px 0px;--z-space-medium:rgba(0, 0, 0, 0.2) 0px 2px 16px 0px;--opacity-75:0.75;--opacity-50:0.50;--opacity-30:0.30;--radius-default:4px;--line-length:60ch}/*!@.m-uh*/.m-uh.sc-m-universal-header{background:var(--color-blue-100);font-family:var(--font-base-family);line-height:var(--line-height-default);font-size:16px}/*!@.m-uh **/.m-uh.sc-m-universal-header *.sc-m-universal-header{box-sizing:border-box;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}/*!@.m-uh *:focus*/.m-uh.sc-m-universal-header *.sc-m-universal-header:focus{outline:0;box-shadow:0 0 0 2px var(--color-maize-400), 0 0 0 3px var(--color-neutral-400);border-radius:2px !important}/*!@.m-uh__content*/.m-uh__content.sc-m-universal-header{display:flex;justify-content:space-between;max-width:1280px;margin:0 auto;padding:0 var(--space-medium)}@media screen and (min-width: 721px){/*!@.m-uh__content*/.m-uh__content.sc-m-universal-header{padding:0 var(--space-xx-large)}}/*!@.m-uh__button-container*/.m-uh__button-container.sc-m-universal-header{display:inline-block;position:relative}/*!@.m-uh__button*/.m-uh__button.sc-m-universal-header{border:none;background:none;font-size:var(--font-base-size);color:var(--color-neutral-400);text-align:left;line-height:var(--line-height-default);display:flex;align-items:center;cursor:pointer}/*!@.m-uh__button,\n.m-uh__link*/.m-uh__button.sc-m-universal-header,.m-uh__link.sc-m-universal-header{margin:0;text-transform:uppercase;padding:var(--space-x-small);margin:0 calc(var(--space-x-small) * -1);color:var(--color-neutral-300);letter-spacing:1.25px;text-transform:uppercase;font-size:14px;font-weight:var(--bold);font-family:var(--font-base-family)}/*!@.m-uh__button:hover .m-uh__button-label,\n.m-uh__link:hover .m-uh__button-label*/.m-uh__button.sc-m-universal-header:hover .m-uh__button-label.sc-m-universal-header,.m-uh__link.sc-m-universal-header:hover .m-uh__button-label.sc-m-universal-header{text-decoration:underline;text-decoration-thickness:1px}/*!@.m-uh__button-label*/.m-uh__button-label.sc-m-universal-header{padding-right:var(--space-xx-small)}/*!@.m-uh__link*/.m-uh__link.sc-m-universal-header{text-decoration:none;margin-right:var(--space-x-large)}/*!@.m-uh__link:hover*/.m-uh__link.sc-m-universal-header:hover{text-decoration:underline;text-decoration-thickness:1px}@media screen and (min-width: 721px){/*!@.m-uh__link*/.m-uh__link.sc-m-universal-header{display:block}}/*!@.m-uh__link-text*/.m-uh__link-text.sc-m-universal-header{display:block}@media screen and (max-width: 620px){/*!@.m-uh__link-text*/.m-uh__link-text.sc-m-universal-header{display:none}}/*!@.m-uh__link-text--small*/.m-uh__link-text--small.sc-m-universal-header{display:none}@media screen and (max-width: 620px){/*!@.m-uh__link-text--small*/.m-uh__link-text--small.sc-m-universal-header{display:block}}/*!@.m-uh__icons*/.m-uh__icons.sc-m-universal-header{line-height:0}/*!@.m-uh__dropdown*/.m-uh__dropdown.sc-m-universal-header{position:absolute;right:calc(-1 * var(--space-medium));width:280px;box-shadow:var(--z-space-medium);max-width:calc(100vw - (var(--space-xx-large) * 2));background:white;border-radius:2px;z-index:1000000}@media screen and (min-width: 721px){/*!@.m-uh__dropdown*/.m-uh__dropdown.sc-m-universal-header{display:grid;grid-template:\"heading heading\" \"primary secondary\"/1fr 280px;padding:var(--space-medium);width:862px;right:0}}/*!@.m-uh__heading*/.m-uh__heading.sc-m-universal-header{grid-area:heading;margin-top:0;font-size:28px;font-weight:700;margin-bottom:0;padding:var(--space-small) var(--space-medium)}@media screen and (max-width: 720px){/*!@.m-uh__heading*/.m-uh__heading.sc-m-universal-header{display:none}}/*!@.m-uh__list-primary,\n.m-uh__list-secondary*/.m-uh__list-primary.sc-m-universal-header,.m-uh__list-secondary.sc-m-universal-header{margin:0;padding:0;list-style:none;margin-bottom:var(--space-medium)}@media screen and (max-width: 720px){/*!@.m-uh__list-primary,\n.m-uh__list-secondary*/.m-uh__list-primary.sc-m-universal-header,.m-uh__list-secondary.sc-m-universal-header{margin:0}/*!@.m-uh__list-primary li:not(:last-of-type),\n.m-uh__list-secondary li:not(:last-of-type)*/.m-uh__list-primary.sc-m-universal-header li.sc-m-universal-header:not(:last-of-type),.m-uh__list-secondary.sc-m-universal-header li.sc-m-universal-header:not(:last-of-type){border-bottom:solid 1px var(--color-neutral-100)}}/*!@.m-uh__list-primary*/.m-uh__list-primary.sc-m-universal-header{grid-area:primary}@media screen and (min-width: 721px){/*!@.m-uh__list-primary*/.m-uh__list-primary.sc-m-universal-header{border-right:solid 1px var(--color-neutral-100);margin-right:var(--space-medium);padding-right:var(--space-medium)}}/*!@.m-uh__list-secondary*/.m-uh__list-secondary.sc-m-universal-header{grid-area:secondary}@media screen and (max-width: 720px){/*!@.m-uh__list-primary*/.m-uh__list-primary.sc-m-universal-header{border-bottom:solid 1px var(--color-neutral-100)}}/*!@.m-uh__item-link*/.m-uh__item-link.sc-m-universal-header{display:block;color:var(--color-neutral-400);font-weight:var(--semibold);text-decoration:none;padding:var(--space-x-small) var(--space-medium);border-radius:2px}@media screen and (max-width: 720px){/*!@.m-uh__item-link*/.m-uh__item-link.sc-m-universal-header{padding:var(--space-small) var(--space-medium)}}@media screen and (max-width: 720px){/*!@.m-uh__item-link:hover*/.m-uh__item-link.sc-m-universal-header:hover{border-radius:0;background:var(--color-blue-100)}}/*!@.m-uh__item-link:hover .m-uh__item-title, .m-uh__item-link:focus .m-uh__item-title*/.m-uh__item-link.sc-m-universal-header:hover .m-uh__item-title.sc-m-universal-header,.m-uh__item-link.sc-m-universal-header:focus .m-uh__item-title.sc-m-universal-header{text-decoration:underline;text-decoration-color:var(--color-teal-400);text-decoration-thickness:2px}/*!@.m-uh__item-title*/.m-uh__item-title.sc-m-universal-header{display:block}/*!@.m-uh__item-desc*/.m-uh__item-desc.sc-m-universal-header{display:none}@media screen and (min-width: 721px){/*!@.m-uh__item-desc*/.m-uh__item-desc.sc-m-universal-header{display:block;font-weight:400;color:var(--color-neutral-300)}}/*!@.m-uh__dropdown-error*/.m-uh__dropdown-error.sc-m-universal-header{padding:0 var(--space-medium)}/*!@.m-uh__dropdown-error strong*/.m-uh__dropdown-error.sc-m-universal-header strong.sc-m-universal-header{font-weight:var(--bold)}/*!@.m-uh__dropdown-error a*/.m-uh__dropdown-error.sc-m-universal-header a.sc-m-universal-header{color:var(--color-teal-400)}";

/**
 * @name Universal Header
 * @description The Universal Header shows users that they are on a U-M Library website and provides a quick and organized way for users to access other library websites.
 * @status production
 * @whenToUse You must use the Universal Header at the top of every page of your website if it hosted with the lib.umich.edu domain.
 * @whenNotToUse If your website is not being hosted on lib.umich.edu.
 * @usedBy
 * - [Library Website](https://www.lib.umich.edu/)
 * - [Library Search](https://search.lib.umich.edu/)
 * - [Design System](https://design-system.lib.umich.edu/)
 * - [Michigan Publishing](https://www.publishing.umich.edu/)
 * @research
 * During Fall 2020 usability testing:
 * - 89% of participants noticed the Universal Header without being prompted.
 * - The label "Explore" matched most expectations and all participants had a positive reaction to the content in the dropdown menu.
 * - The header also helped participants recognize they were on a U-M Library website.
 *
 * [View the research plan (Google Doc)](https://docs.google.com/document/d/1a5NkZEPaNUck3oHngV3cNFNgZ5BVGicCjRVKuDn2YJk/edit?usp=sharing)
 *
 * [View the research findings (Google Slides)](https://docs.google.com/presentation/d/1G4iga9axTpl9xboJ-ydcbN8ZrDh6A3fo18T-HM7ItvM/edit?usp=sharing)
 */
class UniversalHeader {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.open = false;
    this.error = false;
  }
  componentDidLoad() {
    fetch("https://cms.lib.umich.edu/api/universalheader")
      .then(response => response.json())
      .then(data => {
      this.content = {
        primary: data.filter(item => item.level === "1"),
        secondary: data.filter(item => item.level === "2")
      };
    })
      .catch(() => {
      this.error = true;
    });
  }
  close() {
    // Close when focus leaves universal header.
    this.open = false;
  }
  handleKeydown(e) {
    if (e.key === "Escape") {
      this.open = false;
    }
  }
  handleClick(e) {
    // Close on click outside of dropdown.
    if (this.dropdown && !this.dropdown.contains(e.composedPath()[0])) {
      this.open = false;
    }
  }
  toggle() {
    this.open = !this.open;
  }
  renderDropdown() {
    if (this.error) {
      return (hAsync("p", { class: "m-uh__dropdown-error" }, hAsync("strong", null, "Error"), ": We are temporarily having trouble loading our list of library sites. Please try refreshing your page. You can also contact ", hAsync("a", { href: "https://www.lib.umich.edu/ask" }, "Ask a Librarian"), " ", "for help."));
    }
    if (this.content) {
      return [
        hAsync("p", { class: "m-uh__heading" }, "Explore what the library has to offer."),
        hAsync("ul", { class: "m-uh__list-primary" }, this.content.primary.map(item => (hAsync("li", null, hAsync("a", { href: item.link, class: "m-uh__item-link" }, hAsync("span", { class: "m-uh__item-title" }, item.title), hAsync("span", { class: "m-uh__item-desc" }, item.description)))))),
        hAsync("ul", { class: "m-uh__list-secondary" }, this.content.secondary.map(item => (hAsync("li", null, hAsync("a", { href: item.link, class: "m-uh__item-link" }, hAsync("span", { class: "m-uh__item-title" }, item.title))))))
      ];
    }
    return hAsync("p", null, "Loading...");
  }
  render() {
    return [
      hAsync("header", { class: "m-uh", "aria-label": "Library" }, hAsync("div", { class: "m-uh__content" }, hAsync("a", { class: "m-uh__link", href: "https://www.lib.umich.edu/" }, hAsync("span", { class: "m-uh__link-text" }, "University of Michigan Library"), hAsync("span", { class: "m-uh__link-text--small" }, hAsync("abbr", { title: "University of Michigan" }, "U-M"), " Library")), hAsync("div", { class: "m-uh__button-container" }, hAsync("button", { class: "m-uh__button", "aria-expanded": String(this.open), onClick: () => this.toggle() }, hAsync("span", { class: "m-uh__button-label" }, "Explore"), hAsync("div", { "aria-hidden": "true", class: "m-uh__icons" }, this.open ? (hAsync("m-icon", { name: "expand-less" })) : (hAsync("m-icon", { name: "expand-more" })))), this.open && (hAsync("div", { class: "m-uh__dropdown", ref: el => (this.dropdown = el) }, this.renderDropdown()))))),
      hAsync("m-website-alerts", null)
    ];
  }
  static get style() { return universalHeaderCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "m-universal-header",
    "$members$": {
      "open": [32],
      "error": [32],
      "content": [32]
    },
    "$listeners$": [[0, "focusout", "close"], [8, "keydown", "handleKeydown"], [4, "click", "handleClick"]],
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const websiteAlertsCss = "/*!@.m-alerts*/.m-alerts.sc-m-website-alerts {\n  font-family: var(--font-base-family);\n  line-height: var(--line-height-default);\n  color: var(--color-neutral-400);\n  font-size: 16px;\n\n  & * {\n    box-sizing: border-box;\n  }\n\n  \n  & p {\n    margin: 0;\n    padding: 0;\n  }\n\n  & a {\n    color: var(--color-neutral-400);\n  }\n\n  & strong {\n    font-weight: 800;\n  }\n\n  & *:focus {\n    outline: 0;\n    box-shadow: 0 0 0 2px var(--color-maize-400),\n      0 0 0 3px var(--color-neutral-400);\n    border-radius: 2px !important;\n  }\n}\n\n/*!@.m-alerts__heading*/.m-alerts__heading.sc-m-website-alerts {\n  \n  position: absolute !important;\n  height: 1px;\n  width: 1px;\n  overflow: hidden;\n  clip: rect(1px 1px 1px 1px); \n  clip: rect(1px, 1px, 1px, 1px);\n}\n\n/*!@.m-alert*/.m-alert.sc-m-website-alerts {\n  background: var(--color-orange-300);\n\n  & + .m-alert {\n    border-top: solid 1px var(--color-orange-400);\n  }\n}\n\n/*!@.m-alert__content*/.m-alert__content.sc-m-website-alerts {\n  max-width: 1280px;\n  margin: 0 auto;\n  padding: 0 var(--space-medium);\n\n  @media screen and (min-width: 721px) {\n    padding: 0 var(--space-xx-large);\n  }\n\n  display: flex;\n\n  & m-icon {\n    padding-top: var(--space-small);\n    margin-right: var(--space-small);\n  }\n}\n\n/*!@.m-alert__html*/.m-alert__html.sc-m-website-alerts {\n  padding: var(--space-x-small) 0;\n\n  p + p {\n    margin-top: var(--space-x-small);\n  }\n}";

/**
 * @name Website Alerts
 * @description The Website Alerts provide public messages for end-users to be notified about.
 * @status internal
 * @private
 */
class WebsiteAlerts {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.status = "idle";
  }
  componentWillLoad() {
    const domain = document.domain;
    if (domain.includes("umich.edu")) {
      this.status = "loading";
      fetch("https://staff.lib.umich.edu/api/alerts?now=" + Date.now(), {
        cache: "reload"
      })
        .then(response => response.json())
        .then(result => {
        const alertsThatTargetHost = result.reduce((memo, alert) => {
          const domains = alert.domains.split(", ");
          if (domains.includes(domain)) {
            memo = memo.concat(alert);
          }
          return memo;
        }, []);
        if (alertsThatTargetHost.length > 0) {
          this.alerts = alertsThatTargetHost;
          this.status = "success";
        }
        else {
          this.status = "no-alerts";
        }
      })
        .catch(e => {
        this.status = "error";
        console.warn("Unable to fetch U-M Library Website Alerts.", e);
      });
    }
    else {
      this.status = "invalid-domain";
    }
  }
  render() {
    if (this.status === "success") {
      return (hAsync("div", { class: "m-alerts", role: "alert" }, hAsync("h2", { class: "m-alerts__heading" }, "Important message", this.alerts.length > 1 ? "s" : ""), this.alerts.map(alert => (hAsync("div", { class: "m-alert" }, hAsync("div", { class: "m-alert__content" }, hAsync("m-icon", { name: "warning" }), hAsync("div", { class: "m-alert__html", innerHTML: alert.html })))))));
    }
    return null;
  }
  static get style() { return websiteAlertsCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "m-website-alerts",
    "$members$": {
      "status": [32],
      "alerts": [32]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const websiteHeaderCss = "/*!@.visually-hidden*/.visually-hidden.sc-m-website-header{border:0;clip:rect(0 0 0 0);height:auto;margin:0;overflow:hidden;padding:0;position:absolute;width:1px;white-space:nowrap}/*!@:host*/.sc-m-website-header-h{font-family:var(--font-base-family);line-height:var(--line-height-default);font-size:16px;background:white}/*!@:host **/.sc-m-website-header-h *.sc-m-website-header{box-sizing:border-box;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}/*!@.website-header*/.website-header.sc-m-website-header{background:white}/*!@.website-header--dark*/.website-header--dark.sc-m-website-header{background:var(--color-blue-400)}/*!@.website-header--dark .website-header__website-name*/.website-header--dark.sc-m-website-header .website-header__website-name.sc-m-website-header{color:var(--color-blue-100)}/*!@.website-header__container*/.website-header__container.sc-m-website-header{max-width:1280px;margin:0 auto;padding:var(--space-medium)}@media screen and (min-width: 721px){/*!@.website-header__container*/.website-header__container.sc-m-website-header{padding:var(--space-medium) var(--space-xx-large)}}/*!@.website-header__inner-container*/.website-header__inner-container.sc-m-website-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap}/*!@.website-header__logo-container*/.website-header__logo-container.sc-m-website-header{display:flex;flex-direction:column}@media screen and (min-width: 721px){/*!@.website-header__logo-container*/.website-header__logo-container.sc-m-website-header{flex-direction:row;align-items:center;justify-content:space-between}/*!@.website-header__logo-container .website-header__lib-link*/.website-header__logo-container.sc-m-website-header .website-header__lib-link.sc-m-website-header{margin-bottom:0}}/*!@.website-header__lib-link*/.website-header__lib-link.sc-m-website-header{margin-right:var(--space-medium);display:inline-block;line-height:0;margin-bottom:var(--space-x-small)}/*!@.website-header__website-home-link*/.website-header__website-home-link.sc-m-website-header{display:inline-flex;align-items:center;color:var(--color-neutral-300);text-decoration:none;line-height:0}/*!@.website-header__website-home-link:hover .website-header__website-name*/.website-header__website-home-link.sc-m-website-header:hover .website-header__website-name.sc-m-website-header{text-decoration:underline}/*!@.website-header__website-name*/.website-header__website-name.sc-m-website-header{display:block;font-size:var(--text-medium);text-transform:uppercase;line-height:1.1;letter-spacing:0.5px}";

/**
 * @name Website Header
 * @description The Website Header displays our logo and shows users what U-M Library website that they are using.
 * @status production
 * @whenToUse If your website is hosted on lib.umich.edu.
 * @whenNotToUse If your website requires a more complicated U-M website header then you may need to work with the Design System team or build your own.
 * @slot Children
 * @example
 * <div>
 *   <m-website-header name="Account">
 *     <a href="/">Log in</a>
 *   </m-website-header>
 *
 *   <m-website-header name="Deep Blue Documents" variant="dark">
 *   </m-website-header>
 * </div>
 * @usedBy
 * - [Design System](https://design-system.lib.umich.edu/)
 */
class WebsiteHeader {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    /**
     * The URL linked to when you click the website name.
     */
    this.to = "/";
  }
  render() {
    const variant = this.variant === 'dark' ? ' website-header--dark' : '';
    const logoVariant = this.variant === 'dark' ? 'dark' : '';
    return (hAsync("header", { class: "website-header" + variant, "aria-label": this.name || "website" }, hAsync("div", { class: "website-header__container" }, hAsync("div", { class: "website-header__inner-container" }, hAsync("div", { class: "website-header__logo-container" }, hAsync("a", { href: "https://www.lib.umich.edu/", class: "website-header__lib-link" }, hAsync("span", { class: "visually-hidden" }, "University of Michigan Library"), hAsync("m-logo", { variant: logoVariant })), hAsync("a", { href: this.to, class: "website-header__website-home-link" }, this.name && (hAsync("span", { class: "website-header__website-name" }, this.name)))), hAsync("slot", null)))));
  }
  static get style() { return websiteHeaderCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "m-website-header",
    "$members$": {
      "name": [513],
      "to": [513],
      "variant": [1]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": [["name", "name"], ["to", "to"]]
  }; }
}

registerComponents([
  Callout,
  Chat,
  Icon,
  Logo,
  UniversalHeader,
  WebsiteAlerts,
  WebsiteHeader,
]);

exports.hydrateApp = hydrateApp;


  /*hydrateAppClosure end*/
  hydrateApp(window, $stencilHydrateOpts, $stencilHydrateResults, $stencilAfterHydrate, $stencilHydrateResolve);
  }

  hydrateAppClosure($stencilWindow);
}

function createWindowFromHtml(e, t) {
 let r = templateWindows.get(t);
 return null == r && (r = new MockWindow(e), templateWindows.set(t, r)), cloneWindow(r);
}

function normalizeHydrateOptions(e) {
 const t = Object.assign({
  serializeToHtml: !1,
  destroyWindow: !1,
  destroyDocument: !1
 }, e || {});
 return "boolean" != typeof t.clientHydrateAnnotations && (t.clientHydrateAnnotations = !0), 
 "boolean" != typeof t.constrainTimeouts && (t.constrainTimeouts = !0), "number" != typeof t.maxHydrateCount && (t.maxHydrateCount = 300), 
 "boolean" != typeof t.runtimeLogging && (t.runtimeLogging = !1), "number" != typeof t.timeout && (t.timeout = 15e3), 
 Array.isArray(t.excludeComponents) ? t.excludeComponents = t.excludeComponents.filter(filterValidTags).map(mapValidTags) : t.excludeComponents = [], 
 Array.isArray(t.staticComponents) ? t.staticComponents = t.staticComponents.filter(filterValidTags).map(mapValidTags) : t.staticComponents = [], 
 t;
}

function filterValidTags(e) {
 return "string" == typeof e && e.includes("-");
}

function mapValidTags(e) {
 return e.trim().toLowerCase();
}

function generateHydrateResults(e) {
 "string" != typeof e.url && (e.url = "https://hydrate.stenciljs.com/"), "string" != typeof e.buildId && (e.buildId = createHydrateBuildId());
 const t = {
  buildId: e.buildId,
  diagnostics: [],
  url: e.url,
  host: null,
  hostname: null,
  href: null,
  pathname: null,
  port: null,
  search: null,
  hash: null,
  html: null,
  httpStatus: null,
  hydratedCount: 0,
  anchors: [],
  components: [],
  imgs: [],
  scripts: [],
  staticData: [],
  styles: [],
  title: null
 };
 try {
  const r = new URL(e.url, "https://hydrate.stenciljs.com/");
  t.url = r.href, t.host = r.host, t.hostname = r.hostname, t.href = r.href, t.port = r.port, 
  t.pathname = r.pathname, t.search = r.search, t.hash = r.hash;
 } catch (e) {
  renderCatchError(t, e);
 }
 return t;
}

function renderBuildDiagnostic(e, t, r, s) {
 const n = {
  level: t,
  type: "build",
  header: r,
  messageText: s,
  relFilePath: null,
  absFilePath: null,
  lines: []
 };
 return e.pathname ? "/" !== e.pathname && (n.header += ": " + e.pathname) : e.url && (n.header += ": " + e.url), 
 e.diagnostics.push(n), n;
}

function renderBuildError(e, t) {
 return renderBuildDiagnostic(e, "error", "Hydrate Error", t);
}

function renderCatchError(e, t) {
 const r = renderBuildError(e, null);
 return null != t && (null != t.stack ? r.messageText = t.stack.toString() : null != t.message ? r.messageText = t.message.toString() : r.messageText = t.toString()), 
 r;
}

function runtimeLog(e, t, r) {
 global.console[t].apply(global.console, [ `[ ${e}  ${t} ] `, ...r ]);
}

function inspectElement(e, t, r) {
 const s = t.children;
 for (let t = 0, n = s.length; t < n; t++) {
  const n = s[t], o = n.nodeName.toLowerCase();
  if (o.includes("-")) {
   const t = e.components.find((e => e.tag === o));
   null != t && (t.count++, r > t.depth && (t.depth = r));
  } else switch (o) {
  case "a":
   const t = collectAttributes(n);
   t.href = n.href, "string" == typeof t.href && (e.anchors.some((e => e.href === t.href)) || e.anchors.push(t));
   break;

  case "img":
   const r = collectAttributes(n);
   r.src = n.src, "string" == typeof r.src && (e.imgs.some((e => e.src === r.src)) || e.imgs.push(r));
   break;

  case "link":
   const s = collectAttributes(n);
   s.href = n.href, "string" == typeof s.rel && "stylesheet" === s.rel.toLowerCase() && "string" == typeof s.href && (e.styles.some((e => e.link === s.href)) || (delete s.rel, 
   delete s.type, e.styles.push(s)));
   break;

  case "script":
   const o = collectAttributes(n);
   if (n.hasAttribute("src")) o.src = n.src, "string" == typeof o.src && (e.scripts.some((e => e.src === o.src)) || e.scripts.push(o)); else {
    const t = n.getAttribute("data-stencil-static");
    t && e.staticData.push({
     id: t,
     type: n.getAttribute("type"),
     content: n.textContent
    });
   }
  }
  inspectElement(e, n, ++r);
 }
}

function collectAttributes(e) {
 const t = {}, r = e.attributes;
 for (let e = 0, s = r.length; e < s; e++) {
  const s = r.item(e), n = s.nodeName.toLowerCase();
  if (SKIP_ATTRS.has(n)) continue;
  const o = s.nodeValue;
  "class" === n && "" === o || (t[n] = o);
 }
 return t;
}

function patchDomImplementation(e, t) {
 let r;
 if (null != e.defaultView ? (t.destroyWindow = !0, patchWindow(e.defaultView), r = e.defaultView) : (t.destroyWindow = !0, 
 t.destroyDocument = !1, r = new MockWindow(!1)), r.document !== e && (r.document = e), 
 e.defaultView !== r && (e.defaultView = r), "function" != typeof e.documentElement.constructor.prototype.getRootNode && (e.createElement("unknown-element").constructor.prototype.getRootNode = getRootNode), 
 "function" == typeof e.createEvent) {
  const t = e.createEvent("CustomEvent").constructor;
  r.CustomEvent !== t && (r.CustomEvent = t);
 }
 try {
  e.baseURI;
 } catch (t) {
  Object.defineProperty(e, "baseURI", {
   get() {
    const t = e.querySelector("base[href]");
    return t ? new URL(t.getAttribute("href"), r.location.href).href : r.location.href;
   }
  });
 }
 return r;
}

function getRootNode(e) {
 const t = null != e && !0 === e.composed;
 let r = this;
 for (;null != r.parentNode; ) r = r.parentNode, !0 === t && null == r.parentNode && null != r.host && (r = r.host);
 return r;
}

function renderToString(e, t) {
 const r = normalizeHydrateOptions(t);
 return r.serializeToHtml = !0, new Promise((t => {
  let s;
  const n = generateHydrateResults(r);
  if (hasError(n.diagnostics)) t(n); else if ("string" == typeof e) try {
   r.destroyWindow = !0, r.destroyDocument = !0, s = new MockWindow(e), render(s, r, n, t);
  } catch (e) {
   s && s.close && s.close(), s = null, renderCatchError(n, e), t(n);
  } else if (isValidDocument(e)) try {
   r.destroyDocument = !1, s = patchDomImplementation(e, r), render(s, r, n, t);
  } catch (e) {
   s && s.close && s.close(), s = null, renderCatchError(n, e), t(n);
  } else renderBuildError(n, 'Invalid html or document. Must be either a valid "html" string, or DOM "document".'), 
  t(n);
 }));
}

function hydrateDocument(e, t) {
 const r = normalizeHydrateOptions(t);
 return r.serializeToHtml = !1, new Promise((t => {
  let s;
  const n = generateHydrateResults(r);
  if (hasError(n.diagnostics)) t(n); else if ("string" == typeof e) try {
   r.destroyWindow = !0, r.destroyDocument = !0, s = new MockWindow(e), render(s, r, n, t);
  } catch (e) {
   s && s.close && s.close(), s = null, renderCatchError(n, e), t(n);
  } else if (isValidDocument(e)) try {
   r.destroyDocument = !1, s = patchDomImplementation(e, r), render(s, r, n, t);
  } catch (e) {
   s && s.close && s.close(), s = null, renderCatchError(n, e), t(n);
  } else renderBuildError(n, 'Invalid html or document. Must be either a valid "html" string, or DOM "document".'), 
  t(n);
 }));
}

function render(e, t, r, s) {
 if (process.__stencilErrors || (process.__stencilErrors = !0, process.on("unhandledRejection", (e => {
  console.log("unhandledRejection", e);
 }))), function n(e, t, r, s) {
  try {
   e.location.href = r.url;
  } catch (e) {
   renderCatchError(s, e);
  }
  if ("string" == typeof r.userAgent) try {
   e.navigator.userAgent = r.userAgent;
  } catch (e) {}
  if ("string" == typeof r.cookie) try {
   t.cookie = r.cookie;
  } catch (e) {}
  if ("string" == typeof r.referrer) try {
   t.referrer = r.referrer;
  } catch (e) {}
  if ("string" == typeof r.direction) try {
   t.documentElement.setAttribute("dir", r.direction);
  } catch (e) {}
  if ("string" == typeof r.language) try {
   t.documentElement.setAttribute("lang", r.language);
  } catch (e) {}
  if ("string" == typeof r.buildId) try {
   t.documentElement.setAttribute("data-stencil-build", r.buildId);
  } catch (e) {}
  try {
   e.customElements = null;
  } catch (e) {}
  return r.constrainTimeouts && constrainTimeouts(e), function n(e, t, r) {
   try {
    const s = e.location.pathname;
    e.console.error = (...e) => {
     const n = e.reduce(((e, t) => {
      if (t) {
       if (null != t.stack) return e + " " + String(t.stack);
       if (null != t.message) return e + " " + String(t.message);
      }
      return String(t);
     }), "").trim();
     "" !== n && (renderCatchError(r, n), t.runtimeLogging && runtimeLog(s, "error", [ n ]));
    }, e.console.debug = (...e) => {
     renderBuildDiagnostic(r, "debug", "Hydrate Debug", [ ...e ].join(", ")), t.runtimeLogging && runtimeLog(s, "debug", e);
    }, t.runtimeLogging && [ "log", "warn", "assert", "info", "trace" ].forEach((t => {
     e.console[t] = (...e) => {
      runtimeLog(s, t, e);
     };
    }));
   } catch (e) {
    renderCatchError(r, e);
   }
  }(e, r, s), e;
 }(e, e.document, t, r), "function" == typeof t.beforeHydrate) try {
  const n = t.beforeHydrate(e.document);
  isPromise(n) ? n.then((() => {
   hydrateFactory(e, t, r, afterHydrate, s);
  })) : hydrateFactory(e, t, r, afterHydrate, s);
 } catch (n) {
  renderCatchError(r, n), finalizeHydrate(e, e.document, t, r, s);
 } else hydrateFactory(e, t, r, afterHydrate, s);
}

function afterHydrate(e, t, r, s) {
 if ("function" == typeof t.afterHydrate) try {
  const n = t.afterHydrate(e.document);
  isPromise(n) ? n.then((() => {
   finalizeHydrate(e, e.document, t, r, s);
  })) : finalizeHydrate(e, e.document, t, r, s);
 } catch (n) {
  renderCatchError(r, n), finalizeHydrate(e, e.document, t, r, s);
 } else finalizeHydrate(e, e.document, t, r, s);
}

function finalizeHydrate(e, t, r, s, n) {
 try {
  if (inspectElement(s, t.documentElement, 0), !1 !== r.removeUnusedStyles) try {
   ((e, t) => {
    try {
     const r = e.head.querySelectorAll("style[data-styles]"), s = r.length;
     if (s > 0) {
      const n = (e => {
       const t = {
        attrs: new Set,
        classNames: new Set,
        ids: new Set,
        tags: new Set
       };
       return collectUsedSelectors(t, e), t;
      })(e.documentElement);
      for (let e = 0; e < s; e++) removeUnusedStyleText(n, t, r[e]);
     }
    } catch (e) {
     ((e, t, r) => {
      const s = {
       level: "error",
       type: "build",
       header: "Build Error",
       messageText: "build error",
       relFilePath: null,
       absFilePath: null,
       lines: []
      };
      null != t && (null != t.stack ? s.messageText = t.stack.toString() : null != t.message ? s.messageText = t.message.toString() : s.messageText = t.toString()), 
      null == e || shouldIgnoreError(s.messageText) || e.push(s);
     })(t, e);
    }
   })(t, s.diagnostics);
  } catch (e) {
   renderCatchError(s, e);
  }
  if ("string" == typeof r.title) try {
   t.title = r.title;
  } catch (e) {
   renderCatchError(s, e);
  }
  s.title = t.title, r.removeScripts && removeScripts(t.documentElement);
  try {
   ((e, t) => {
    let r = e.head.querySelector('link[rel="canonical"]');
    "string" == typeof t ? (null == r && (r = e.createElement("link"), r.setAttribute("rel", "canonical"), 
    e.head.appendChild(r)), r.setAttribute("href", t)) : null != r && (r.getAttribute("href") || r.parentNode.removeChild(r));
   })(t, r.canonicalUrl);
  } catch (e) {
   renderCatchError(s, e);
  }
  try {
   (e => {
    const t = e.head;
    let r = t.querySelector("meta[charset]");
    null == r ? (r = e.createElement("meta"), r.setAttribute("charset", "utf-8")) : r.remove(), 
    t.insertBefore(r, t.firstChild);
   })(t);
  } catch (e) {}
  hasError(s.diagnostics) || (s.httpStatus = 200);
  try {
   const e = t.head.querySelector('meta[http-equiv="status"]');
   if (null != e) {
    const t = e.getAttribute("content");
    t && t.length > 0 && (s.httpStatus = parseInt(t, 10));
   }
  } catch (e) {}
  r.clientHydrateAnnotations && t.documentElement.classList.add("hydrated"), r.serializeToHtml && (s.html = serializeDocumentToString(t, r));
 } catch (e) {
  renderCatchError(s, e);
 }
 if (r.destroyWindow) try {
  r.destroyDocument || (e.document = null, t.defaultView = null), e.close && e.close();
 } catch (e) {
  renderCatchError(s, e);
 }
 n(s);
}

function serializeDocumentToString(e, t) {
 return serializeNodeToHtml(e, {
  approximateLineWidth: t.approximateLineWidth,
  outerHtml: !1,
  prettyHtml: t.prettyHtml,
  removeAttributeQuotes: t.removeAttributeQuotes,
  removeBooleanAttributeQuotes: t.removeBooleanAttributeQuotes,
  removeEmptyAttributes: t.removeEmptyAttributes,
  removeHtmlComments: t.removeHtmlComments,
  serializeShadowRoot: !1
 });
}

function isValidDocument(e) {
 return null != e && 9 === e.nodeType && null != e.documentElement && 1 === e.documentElement.nodeType && null != e.body && 1 === e.body.nodeType;
}

function removeScripts(e) {
 const t = e.children;
 for (let e = t.length - 1; e >= 0; e--) {
  const r = t[e];
  removeScripts(r), ("SCRIPT" === r.nodeName || "LINK" === r.nodeName && "modulepreload" === r.getAttribute("rel")) && r.remove();
 }
}

const templateWindows = new Map, createHydrateBuildId = () => {
 let e = "abcdefghijklmnopqrstuvwxyz", t = "";
 for (;t.length < 8; ) t += e[Math.floor(Math.random() * e.length)], 1 === t.length && (e += "0123456789");
 return t;
}, isPromise = e => !!e && ("object" == typeof e || "function" == typeof e) && "function" == typeof e.then, hasError = e => null != e && 0 !== e.length && e.some((e => "error" === e.level && "runtime" !== e.type)), shouldIgnoreError = e => e === TASK_CANCELED_MSG, TASK_CANCELED_MSG = "task canceled", SKIP_ATTRS = new Set([ "s-id", "c-id" ]), collectUsedSelectors = (e, t) => {
 if (null != t && 1 === t.nodeType) {
  const r = t.children, s = t.nodeName.toLowerCase();
  e.tags.add(s);
  const n = t.attributes;
  for (let r = 0, s = n.length; r < s; r++) {
   const s = n.item(r), o = s.name.toLowerCase();
   if (e.attrs.add(o), "class" === o) {
    const r = t.classList;
    for (let t = 0, s = r.length; t < s; t++) e.classNames.add(r.item(t));
   } else "id" === o && e.ids.add(s.value);
  }
  if (r) for (let t = 0, s = r.length; t < s; t++) collectUsedSelectors(e, r[t]);
 }
}, parseCss = (e, t) => {
 let r = 1, s = 1;
 const n = [], o = e => {
  const t = e.match(/\n/g);
  t && (r += t.length);
  const n = e.lastIndexOf("\n");
  s = ~n ? e.length - n : s + e.length;
 }, i = () => {
  const e = {
   line: r,
   column: s
  };
  return t => (t.position = new z(e), m(), t);
 }, a = o => {
  const i = e.split("\n"), a = {
   level: "error",
   type: "css",
   language: "css",
   header: "CSS Parse",
   messageText: o,
   absFilePath: t,
   lines: [ {
    lineIndex: r - 1,
    lineNumber: r,
    errorCharStart: s,
    text: e[r - 1]
   } ]
  };
  if (r > 1) {
   const t = {
    lineIndex: r - 1,
    lineNumber: r - 1,
    text: e[r - 2],
    errorCharStart: -1,
    errorLength: -1
   };
   a.lines.unshift(t);
  }
  if (r + 2 < i.length) {
   const e = {
    lineIndex: r,
    lineNumber: r + 1,
    text: i[r],
    errorCharStart: -1,
    errorLength: -1
   };
   a.lines.push(e);
  }
  return n.push(a), null;
 }, l = () => u(/^{\s*/), c = () => u(/^}/), u = t => {
  const r = t.exec(e);
  if (!r) return;
  const s = r[0];
  return o(s), e = e.slice(s.length), r;
 }, d = () => {
  let t;
  const r = [];
  for (m(), h(r); e.length && "}" !== e.charAt(0) && (t = w() || A()); ) !1 !== t && (r.push(t), 
  h(r));
  return r;
 }, m = () => u(/^\s*/), h = e => {
  let t;
  for (e = e || []; t = p(); ) !1 !== t && e.push(t);
  return e;
 }, p = () => {
  const t = i();
  if ("/" !== e.charAt(0) || "*" !== e.charAt(1)) return null;
  let r = 2;
  for (;"" !== e.charAt(r) && ("*" !== e.charAt(r) || "/" !== e.charAt(r + 1)); ) ++r;
  if (r += 2, "" === e.charAt(r - 1)) return a("End of comment missing");
  const n = e.slice(2, r - 2);
  return s += 2, o(n), e = e.slice(r), s += 2, t({
   type: 1,
   comment: n
  });
 }, f = () => {
  const e = u(/^([^{]+)/);
  return e ? trim(e[0]).replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, "").replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, (function(e) {
   return e.replace(/,/g, "‌");
  })).split(/\s*(?![^(]*\)),\s*/).map((function(e) {
   return e.replace(/\u200C/g, ",");
  })) : null;
 }, g = () => {
  const e = i();
  let t = u(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
  if (!t) return null;
  if (t = trim(t[0]), !u(/^:\s*/)) return a("property missing ':'");
  const r = u(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/), s = e({
   type: 4,
   property: t.replace(commentre, ""),
   value: r ? trim(r[0]).replace(commentre, "") : ""
  });
  return u(/^[;\s]*/), s;
 }, y = () => {
  const e = [];
  if (!l()) return a("missing '{'");
  let t;
  for (h(e); t = g(); ) !1 !== t && (e.push(t), h(e));
  return c() ? e : a("missing '}'");
 }, C = () => {
  let e;
  const t = [], r = i();
  for (;e = u(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/); ) t.push(e[1]), u(/^,\s*/);
  return t.length ? r({
   type: 9,
   values: t,
   declarations: y()
  }) : null;
 }, S = (e, t) => {
  const r = new RegExp("^@" + e + "\\s*([^;]+);");
  return () => {
   const s = i(), n = u(r);
   if (!n) return null;
   const o = {
    type: t
   };
   return o[e] = n[1].trim(), s(o);
  };
 }, E = S("import", 7), b = S("charset", 0), T = S("namespace", 11), w = () => "@" !== e[0] ? null : (() => {
  const e = i();
  let t = u(/^@([-\w]+)?keyframes\s*/);
  if (!t) return null;
  const r = t[1];
  if (t = u(/^([-\w]+)\s*/), !t) return a("@keyframes missing name");
  const s = t[1];
  if (!l()) return a("@keyframes missing '{'");
  let n, o = h();
  for (;n = C(); ) o.push(n), o = o.concat(h());
  return c() ? e({
   type: 8,
   name: s,
   vendor: r,
   keyframes: o
  }) : a("@keyframes missing '}'");
 })() || (() => {
  const e = i(), t = u(/^@media *([^{]+)/);
  if (!t) return null;
  const r = trim(t[1]);
  if (!l()) return a("@media missing '{'");
  const s = h().concat(d());
  return c() ? e({
   type: 10,
   media: r,
   rules: s
  }) : a("@media missing '}'");
 })() || (() => {
  const e = i(), t = u(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
  return t ? e({
   type: 2,
   name: trim(t[1]),
   media: trim(t[2])
  }) : null;
 })() || (() => {
  const e = i(), t = u(/^@supports *([^{]+)/);
  if (!t) return null;
  const r = trim(t[1]);
  if (!l()) return a("@supports missing '{'");
  const s = h().concat(d());
  return c() ? e({
   type: 15,
   supports: r,
   rules: s
  }) : a("@supports missing '}'");
 })() || E() || b() || T() || (() => {
  const e = i(), t = u(/^@([-\w]+)?document *([^{]+)/);
  if (!t) return null;
  const r = trim(t[1]), s = trim(t[2]);
  if (!l()) return a("@document missing '{'");
  const n = h().concat(d());
  return c() ? e({
   type: 3,
   document: s,
   vendor: r,
   rules: n
  }) : a("@document missing '}'");
 })() || (() => {
  const e = i();
  if (!u(/^@page */)) return null;
  const t = f() || [];
  if (!l()) return a("@page missing '{'");
  let r, s = h();
  for (;r = g(); ) s.push(r), s = s.concat(h());
  return c() ? e({
   type: 12,
   selectors: t,
   declarations: s
  }) : a("@page missing '}'");
 })() || (() => {
  const e = i();
  if (!u(/^@host\s*/)) return null;
  if (!l()) return a("@host missing '{'");
  const t = h().concat(d());
  return c() ? e({
   type: 6,
   rules: t
  }) : a("@host missing '}'");
 })() || (() => {
  const e = i();
  if (!u(/^@font-face\s*/)) return null;
  if (!l()) return a("@font-face missing '{'");
  let t, r = h();
  for (;t = g(); ) r.push(t), r = r.concat(h());
  return c() ? e({
   type: 5,
   declarations: r
  }) : a("@font-face missing '}'");
 })(), A = () => {
  const e = i(), t = f();
  return t ? (h(), e({
   type: 13,
   selectors: t,
   declarations: y()
  })) : a("selector missing");
 };
 class z {
  constructor(e) {
   this.start = e, this.end = {
    line: r,
    column: s
   }, this.source = t;
  }
 }
 return z.prototype.content = e, {
  diagnostics: n,
  ...addParent((() => {
   const e = d();
   return {
    type: 14,
    stylesheet: {
     source: t,
     rules: e
    }
   };
  })())
 };
}, trim = e => e ? e.trim() : "", addParent = (e, t) => {
 const r = e && "string" == typeof e.type, s = r ? e : t;
 for (const t in e) {
  const r = e[t];
  Array.isArray(r) ? r.forEach((function(e) {
   addParent(e, s);
  })) : r && "object" == typeof r && addParent(r, s);
 }
 return r && Object.defineProperty(e, "parent", {
  configurable: !0,
  writable: !0,
  enumerable: !1,
  value: t || null
 }), e;
}, commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, getCssSelectors = e => {
 SELECTORS.all.length = SELECTORS.tags.length = SELECTORS.classNames.length = SELECTORS.ids.length = SELECTORS.attrs.length = 0;
 const t = (e = e.replace(/\./g, " .").replace(/\#/g, " #").replace(/\[/g, " [").replace(/\>/g, " > ").replace(/\+/g, " + ").replace(/\~/g, " ~ ").replace(/\*/g, " * ").replace(/\:not\((.*?)\)/g, " ")).split(" ");
 for (let e = 0, r = t.length; e < r; e++) t[e] = t[e].split(":")[0], 0 !== t[e].length && ("." === t[e].charAt(0) ? SELECTORS.classNames.push(t[e].substr(1)) : "#" === t[e].charAt(0) ? SELECTORS.ids.push(t[e].substr(1)) : "[" === t[e].charAt(0) ? (t[e] = t[e].substr(1).split("=")[0].split("]")[0].trim(), 
 SELECTORS.attrs.push(t[e].toLowerCase())) : /[a-z]/g.test(t[e].charAt(0)) && SELECTORS.tags.push(t[e].toLowerCase()));
 return SELECTORS.classNames = SELECTORS.classNames.sort(((e, t) => e.length < t.length ? -1 : e.length > t.length ? 1 : 0)), 
 SELECTORS;
}, SELECTORS = {
 all: [],
 tags: [],
 classNames: [],
 ids: [],
 attrs: []
}, serializeCssVisitNode = (e, t, r, s) => {
 const n = t.type;
 return 4 === n ? serializeCssDeclaration(t, r, s) : 13 === n ? serializeCssRule(e, t) : 1 === n ? "!" === t.comment[0] ? `/*${t.comment}*/` : "" : 10 === n ? serializeCssMedia(e, t) : 8 === n ? serializeCssKeyframes(e, t) : 9 === n ? serializeCssKeyframe(e, t) : 5 === n ? serializeCssFontFace(e, t) : 15 === n ? serializeCssSupports(e, t) : 7 === n ? "@import " + t.import + ";" : 0 === n ? "@charset " + t.charset + ";" : 12 === n ? serializeCssPage(e, t) : 6 === n ? "@host{" + serializeCssMapVisit(e, t.rules) + "}" : 2 === n ? "@custom-media " + t.name + " " + t.media + ";" : 3 === n ? serializeCssDocument(e, t) : 11 === n ? "@namespace " + t.namespace + ";" : "";
}, serializeCssRule = (e, t) => {
 const r = t.declarations, s = e.usedSelectors, n = t.selectors.slice();
 if (null == r || 0 === r.length) return "";
 if (s) {
  let t, r, o = !0;
  for (t = n.length - 1; t >= 0; t--) {
   const i = getCssSelectors(n[t]);
   o = !0;
   let a = i.classNames.length;
   if (a > 0 && e.hasUsedClassNames) for (r = 0; r < a; r++) if (!s.classNames.has(i.classNames[r])) {
    o = !1;
    break;
   }
   if (o && e.hasUsedTags && (a = i.tags.length, a > 0)) for (r = 0; r < a; r++) if (!s.tags.has(i.tags[r])) {
    o = !1;
    break;
   }
   if (o && e.hasUsedAttrs && (a = i.attrs.length, a > 0)) for (r = 0; r < a; r++) if (!s.attrs.has(i.attrs[r])) {
    o = !1;
    break;
   }
   if (o && e.hasUsedIds && (a = i.ids.length, a > 0)) for (r = 0; r < a; r++) if (!s.ids.has(i.ids[r])) {
    o = !1;
    break;
   }
   o || n.splice(t, 1);
  }
 }
 if (0 === n.length) return "";
 const o = [];
 let i = "";
 for (const e of t.selectors) i = removeSelectorWhitespace(e), o.includes(i) || o.push(i);
 return `${o}{${serializeCssMapVisit(e, r)}}`;
}, serializeCssDeclaration = (e, t, r) => "" === e.value ? "" : r - 1 === t ? e.property + ":" + e.value : e.property + ":" + e.value + ";", serializeCssMedia = (e, t) => {
 const r = serializeCssMapVisit(e, t.rules);
 return "" === r ? "" : "@media " + removeMediaWhitespace(t.media) + "{" + r + "}";
}, serializeCssKeyframes = (e, t) => {
 const r = serializeCssMapVisit(e, t.keyframes);
 return "" === r ? "" : "@" + (t.vendor || "") + "keyframes " + t.name + "{" + r + "}";
}, serializeCssKeyframe = (e, t) => t.values.join(",") + "{" + serializeCssMapVisit(e, t.declarations) + "}", serializeCssFontFace = (e, t) => {
 const r = serializeCssMapVisit(e, t.declarations);
 return "" === r ? "" : "@font-face{" + r + "}";
}, serializeCssSupports = (e, t) => {
 const r = serializeCssMapVisit(e, t.rules);
 return "" === r ? "" : "@supports " + t.supports + "{" + r + "}";
}, serializeCssPage = (e, t) => "@page " + t.selectors.join(", ") + "{" + serializeCssMapVisit(e, t.declarations) + "}", serializeCssDocument = (e, t) => {
 const r = serializeCssMapVisit(e, t.rules), s = "@" + (t.vendor || "") + "document " + t.document;
 return "" === r ? "" : s + "{" + r + "}";
}, serializeCssMapVisit = (e, t) => {
 let r = "";
 if (t) for (let s = 0, n = t.length; s < n; s++) r += serializeCssVisitNode(e, t[s], s, n);
 return r;
}, removeSelectorWhitespace = e => {
 let t = "", r = "", s = !1;
 for (let n = 0, o = (e = e.trim()).length; n < o; n++) if (r = e[n], "[" === r && "\\" !== t[t.length - 1] ? s = !0 : "]" === r && "\\" !== t[t.length - 1] && (s = !1), 
 !s && CSS_WS_REG.test(r)) {
  if (CSS_NEXT_CHAR_REG.test(e[n + 1])) continue;
  if (CSS_PREV_CHAR_REG.test(t[t.length - 1])) continue;
  t += " ";
 } else t += r;
 return t;
}, removeMediaWhitespace = e => {
 let t = "", r = "";
 for (let s = 0, n = (e = e.trim()).length; s < n; s++) if (r = e[s], CSS_WS_REG.test(r)) {
  if (CSS_WS_REG.test(t[t.length - 1])) continue;
  t += " ";
 } else t += r;
 return t;
}, CSS_WS_REG = /\s/, CSS_NEXT_CHAR_REG = /[>\(\)\~\,\+\s]/, CSS_PREV_CHAR_REG = /[>\(\~\,\+]/, removeUnusedStyleText = (e, t, r) => {
 try {
  const s = parseCss(r.innerHTML);
  if (t.push(...s.diagnostics), hasError(t)) return;
  try {
   r.innerHTML = ((e, t) => {
    const r = t.usedSelectors || null, s = {
     usedSelectors: r || null,
     hasUsedAttrs: !!r && r.attrs.size > 0,
     hasUsedClassNames: !!r && r.classNames.size > 0,
     hasUsedIds: !!r && r.ids.size > 0,
     hasUsedTags: !!r && r.tags.size > 0
    }, n = e.rules;
    if (!n) return "";
    const o = n.length, i = [];
    for (let e = 0; e < o; e++) i.push(serializeCssVisitNode(s, n[e], e, o));
    return i.join("");
   })(s.stylesheet, {
    usedSelectors: e
   });
  } catch (e) {
   t.push({
    level: "warn",
    type: "css",
    header: "CSS Stringify",
    messageText: e
   });
  }
 } catch (e) {
  t.push({
   level: "warn",
   type: "css",
   header: "CSS Parse",
   messageText: e
  });
 }
};

exports.createWindowFromHtml = createWindowFromHtml;
exports.hydrateDocument = hydrateDocument;
exports.renderToString = renderToString;
exports.serializeDocumentToString = serializeDocumentToString;
