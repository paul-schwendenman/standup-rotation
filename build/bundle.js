var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function s(t){return"function"==typeof t}function r(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function c(e,...n){if(null==e)return t;const o=e.subscribe(...n);return o.unsubscribe?()=>o.unsubscribe():o}function i(t,e,n){t.$$.on_destroy.push(c(e,n))}function a(t,e){t.appendChild(e)}function l(t,e,n){t.insertBefore(e,n||null)}function u(t){t.parentNode.removeChild(t)}function d(t){return document.createElement(t)}function f(t){return document.createTextNode(t)}function p(){return f(" ")}function m(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function h(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function g(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function b(t,e){t.value=null==e?"":e}function v(t,e,n){t.classList[n?"add":"remove"](e)}let w;function $(t){w=t}function x(){if(!w)throw new Error("Function called outside component initialization");return w}function y(t){x().$$.on_mount.push(t)}function k(){const t=x();return(e,n)=>{const o=t.$$.callbacks[e];if(o){const s=function(t,e,n=!1){const o=document.createEvent("CustomEvent");return o.initCustomEvent(t,n,!1,e),o}(e,n);o.slice().forEach((e=>{e.call(t,s)}))}}}const A=[],C=[],M=[],T=[],_=Promise.resolve();let j=!1;function E(t){M.push(t)}const O=new Set;let S=0;function q(){const t=w;do{for(;S<A.length;){const t=A[S];S++,$(t),U(t.$$)}for($(null),A.length=0,S=0;C.length;)C.pop()();for(let t=0;t<M.length;t+=1){const e=M[t];O.has(e)||(O.add(e),e())}M.length=0}while(A.length);for(;T.length;)T.pop()();j=!1,O.clear(),$(t)}function U(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(E)}}const F=new Set;let z;function L(t,e){t&&t.i&&(F.delete(t),t.i(e))}function N(t,e,n,o){if(t&&t.o){if(F.has(t))return;F.add(t),z.c.push((()=>{F.delete(t),o&&(n&&t.d(1),o())})),t.o(e)}}function P(t,e){N(t,1,1,(()=>{e.delete(t.key)}))}function R(t){t&&t.c()}function I(t,n,r,c){const{fragment:i,on_mount:a,on_destroy:l,after_update:u}=t.$$;i&&i.m(n,r),c||E((()=>{const n=a.map(e).filter(s);l?l.push(...n):o(n),t.$$.on_mount=[]})),u.forEach(E)}function D(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function B(t,e){-1===t.$$.dirty[0]&&(A.push(t),j||(j=!0,_.then(q)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function H(e,s,r,c,i,a,l,d=[-1]){const f=w;$(e);const p=e.$$={fragment:null,ctx:null,props:a,update:t,not_equal:i,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(s.context||(f?f.$$.context:[])),callbacks:n(),dirty:d,skip_bound:!1,root:s.target||f.$$.root};l&&l(p.root);let m=!1;if(p.ctx=r?r(e,s.props||{},((t,n,...o)=>{const s=o.length?o[0]:n;return p.ctx&&i(p.ctx[t],p.ctx[t]=s)&&(!p.skip_bound&&p.bound[t]&&p.bound[t](s),m&&B(e,t)),n})):[],p.update(),m=!0,o(p.before_update),p.fragment=!!c&&c(p.ctx),s.target){if(s.hydrate){const t=function(t){return Array.from(t.childNodes)}(s.target);p.fragment&&p.fragment.l(t),t.forEach(u)}else p.fragment&&p.fragment.c();s.intro&&L(e.$$.fragment),I(e,s.target,s.anchor,s.customElement),q()}$(f)}class J{$destroy(){D(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}function W(t){let e,n=t.length;for(;0!=n;)e=Math.floor(Math.random()*n),n--,[t[n],t[e]]=[t[e],t[n]];return t}const K=t=>{document.documentElement.setAttribute("data-theme",t),localStorage.setItem("theme",t)};function G(t){let e,n;return{c(){e=d("span"),n=f(t[7]),h(e,"class","text-5xl")},m(t,o){l(t,e,o),a(e,n)},p(t,e){128&e&&g(n,t[7])},d(t){t&&u(e)}}}function Q(t){let e,n;return{c(){e=d("span"),n=f(t[2]),h(e,"class","text-5xl")},m(t,o){l(t,e,o),a(e,n)},p(t,e){4&e&&g(n,t[2])},d(t){t&&u(e)}}}function V(t){let e,n;return{c(){e=d("span"),n=f(t[3]),h(e,"class","text-5xl")},m(t,o){l(t,e,o),a(e,n)},p(t,e){8&e&&g(n,t[3])},d(t){t&&u(e)}}}function X(t){let e,n,o,s,r,c=(t[9]||t[1])+"";return{c(){e=d("section"),n=d("div"),o=f("Time left: "),s=d("span"),r=f(c),h(s,"id","timer"),h(n,"class","text-2xl"),h(e,"class","flex-wrap md:flex-nowrap justify-left md:justify-center svelte-gaydyo")},m(t,c){l(t,e,c),a(e,n),a(n,o),a(n,s),a(s,r)},p(t,e){514&e&&c!==(c=(t[9]||t[1])+"")&&g(r,c)},d(t){t&&u(e)}}}function Y(t){let e,n,s,r,c,i,g;return{c(){e=d("button"),e.textContent="next",n=p(),s=d("button"),r=f("re-enqueue"),h(e,"class","btn btn-primary"),h(s,"class","btn"),s.disabled=c=t[11]+1===t[10].length},m(o,c){l(o,e,c),l(o,n,c),l(o,s,c),a(s,r),i||(g=[m(e,"click",t[13]),m(s,"click",t[15])],i=!0)},p(t,e){3072&e&&c!==(c=t[11]+1===t[10].length)&&(s.disabled=c)},d(t){t&&u(e),t&&u(n),t&&u(s),i=!1,o(g)}}}function Z(t){let e,n,s,r,c,i,g;return{c(){e=d("button"),n=f("start"),r=p(),c=d("button"),c.textContent="shuffle",h(e,"class","btn btn-primary"),e.disabled=s=0===t[4].length,h(c,"class","btn")},m(o,s){l(o,e,s),a(e,n),l(o,r,s),l(o,c,s),i||(g=[m(e,"click",t[14]),m(c,"click",t[12])],i=!0)},p(t,n){16&n&&s!==(s=0===t[4].length)&&(e.disabled=s)},d(t){t&&u(e),t&&u(r),t&&u(c),i=!1,o(g)}}}function tt(e){let n,o,s;return{c(){n=d("button"),n.textContent="reset",h(n,"class","btn btn-primary")},m(t,r){l(t,n,r),o||(s=m(n,"click",e[16]),o=!0)},p:t,d(t){t&&u(n),o=!1,s()}}}function et(e){let n,o,s,r,c,i,m,b;function v(t,e){return t[6]?V:t[5]?G:Q}let w=v(e),$=w(e),x=e[0]&&!e[6]&&X(e);function y(t,e){return t[6]?tt:t[5]?Y:Z}let k=y(e),A=k(e);return{c(){n=d("div"),o=d("section"),$.c(),s=p(),r=d("span"),c=f(e[8]),i=p(),x&&x.c(),m=p(),b=d("section"),A.c(),h(r,"class","text-xl opacity-50"),h(o,"class","flex-wrap md:flex-nowrap justify-left md:justify-center svelte-gaydyo"),h(b,"class","flex-wrap md:flex-nowrap justify-left md:justify-center svelte-gaydyo")},m(t,e){l(t,n,e),a(n,o),$.m(o,null),a(o,s),a(o,r),a(r,c),a(n,i),x&&x.m(n,null),a(n,m),a(n,b),A.m(b,null)},p(t,[e]){w===(w=v(t))&&$?$.p(t,e):($.d(1),$=w(t),$&&($.c(),$.m(o,s))),256&e&&g(c,t[8]),t[0]&&!t[6]?x?x.p(t,e):(x=X(t),x.c(),x.m(n,m)):x&&(x.d(1),x=null),k===(k=y(t))&&A?A.p(t,e):(A.d(1),A=k(t),A&&(A.c(),A.m(b,null)))},i:t,o:t,d(t){t&&u(n),$.d(),x&&x.d(),A.d()}}}function nt(t,e,n){let{showTimer:o=!0}=e,{time:s="1:00"}=e,{welcome:r="Welcome to stand-up"}=e,{doneMessage:c="Done!"}=e,{names:i=["Adam","Adrian","Carson","Dennis","Ed","Hardik","Johan","Kathryn","Kelsey","Patrick","Paul","Ren","Ryan","Sergiu","Tyler"]}=e;const a=k();var l;let u,d,f,p=!1,m=!1,h=[],g=0;function b(){n(10,h=[...W(i)]),n(8,d=h[0]||"")}function v(){"Over time!"===f&&w(),n(9,f=s),g==h.length-1?(n(6,m=!0),n(5,p=!1),a("running",!1),n(8,d=""),clearTimeout(l)):(n(7,u=h[n(11,++g)]),n(8,d=h[g+1]||c),n(9,f=s))}const w=function(){const t=f.split(/[:]+/);let e=t[0],o=((s=t[1]-1)<10&&s>=0&&(s="0"+s),s<0&&(s="59"),s);var s;59==o&&(e-=1),0==o&&0==e?n(9,f="Over time!"):(n(9,f=e+":"+o),l=setTimeout(w,1e3))};return y((()=>{b()})),t.$$set=t=>{"showTimer"in t&&n(0,o=t.showTimer),"time"in t&&n(1,s=t.time),"welcome"in t&&n(2,r=t.welcome),"doneMessage"in t&&n(3,c=t.doneMessage),"names"in t&&n(4,i=t.names)},[o,s,r,c,i,p,m,u,d,f,h,g,b,v,function(){n(5,p=!0),a("running",!0),0===h.length&&n(10,h=[...i]),n(11,g=0),n(7,u=h[g]),n(8,d=h[g+1]),n(9,f=s),w()},function(){h.push(u),v()},function(){n(6,m=!1),n(9,f=null),b()}]}class ot extends J{constructor(t){super(),H(this,t,nt,et,r,{showTimer:0,time:1,welcome:2,doneMessage:3,names:4})}}const st=[];function rt(e,n=t){let o;const s=new Set;function c(t){if(r(e,t)&&(e=t,o)){const t=!st.length;for(const t of s)t[1](),st.push(t,e);if(t){for(let t=0;t<st.length;t+=2)st[t][0](st[t+1]);st.length=0}}}return{set:c,update:function(t){c(t(e))},subscribe:function(r,i=t){const a=[r,i];return s.add(a),1===s.size&&(o=n(c)||t),r(e),()=>{s.delete(a),0===s.size&&(o(),o=null)}}}}function ct(e,n,r){const i=!Array.isArray(e),a=i?[e]:e,l=n.length<2;return u=e=>{let r=!1;const u=[];let d=0,f=t;const p=()=>{if(d)return;f();const o=n(i?u[0]:u,e);l?e(o):f=s(o)?o:t},m=a.map(((t,e)=>c(t,(t=>{u[e]=t,d&=~(1<<e),r&&p()}),(()=>{d|=1<<e}))));return r=!0,p(),function(){o(m),f()}},{subscribe:rt(r,u).subscribe};var u}function it(t,e,n){const o=t.slice();return o[6]=e[n],o[7]=e,o[8]=n,o}function at(t){let e,n,s,r,c,i,b,w,$,x,y=t[6].name+"";function k(){t[4].call(s,t[7],t[8])}return{c(){e=d("div"),n=d("span"),s=d("input"),r=p(),c=d("span"),i=f(y),b=p(),w=d("button"),w.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',h(s,"class","checkbox"),h(s,"type","checkbox"),h(c,"class","p-2 svelte-1qio51d"),v(c,"inactive",!t[6].active),h(n,"class","inline-flex items-center"),h(w,"class","btn btn-circle justify-self-end"),h(e,"class","flex items-center justify-between mb-1")},m(o,u){l(o,e,u),a(e,n),a(n,s),s.checked=t[6].active,a(n,r),a(n,c),a(c,i),a(e,b),a(e,w),$||(x=[m(s,"change",k),m(w,"click",t[3](t[8]))],$=!0)},p(e,n){t=e,1&n&&(s.checked=t[6].active),1&n&&y!==(y=t[6].name+"")&&g(i,y),1&n&&v(c,"inactive",!t[6].active)},d(t){t&&u(e),$=!1,o(x)}}}function lt(e){let n,s,r,c,i,f,g,v,w,$=e[0],x=[];for(let t=0;t<$.length;t+=1)x[t]=at(it(e,$,t));return{c(){n=d("p"),n.textContent="Names:",s=p();for(let t=0;t<x.length;t+=1)x[t].c();r=p(),c=d("div"),i=d("input"),f=p(),g=d("button"),g.textContent="Add",h(i,"type","text"),h(i,"placeholder","name"),h(i,"class","input input-bordered"),h(g,"class","btn"),h(c,"class","input-group mt-1")},m(t,o){l(t,n,o),l(t,s,o);for(let e=0;e<x.length;e+=1)x[e].m(t,o);l(t,r,o),l(t,c,o),a(c,i),b(i,e[1]),a(c,f),a(c,g),v||(w=[m(i,"input",e[5]),m(g,"click",e[2])],v=!0)},p(t,[e]){if(9&e){let n;for($=t[0],n=0;n<$.length;n+=1){const o=it(t,$,n);x[n]?x[n].p(o,e):(x[n]=at(o),x[n].c(),x[n].m(r.parentNode,r))}for(;n<x.length;n+=1)x[n].d(1);x.length=$.length}2&e&&i.value!==t[1]&&b(i,t[1])},i:t,o:t,d(t){t&&u(n),t&&u(s),function(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}(x,t),t&&u(r),t&&u(c),v=!1,o(w)}}}function ut(t,e,n){let{names:o=[]}=e,s="";return t.$$set=t=>{"names"in t&&n(0,o=t.names)},[o,s,function(){n(0,o=[...o,{name:s,active:!0}]),n(1,s="")},function(t){return()=>{o.splice(t,1),n(0,o)}},function(t,e){t[e].active=this.checked,n(0,o)},function(){s=this.value,n(1,s)}]}class dt extends J{constructor(t){super(),H(this,t,ut,lt,r,{names:0})}}function ft(t){let e,n,s,r,c,i,f,g,w,$,x,y,k,A,M,_,j,E,O,S,q,U,F,z,P,B,H;function J(e){t[9](e)}let W={};return void 0!==t[1].names&&(W.names=t[1].names),F=new dt({props:W}),C.push((()=>function(t,e,n){const o=t.$$.props[e];void 0!==o&&(t.$$.bound[o]=n,n(t.$$.ctx[o]))}(F,"names",J))),{c(){e=d("div"),n=d("label"),s=d("span"),s.textContent="Enable timer:",r=p(),c=d("input"),i=p(),f=d("label"),g=d("span"),g.textContent="Duration:",w=p(),$=d("input"),y=p(),k=d("label"),A=d("span"),A.textContent="Welcome message:",M=p(),_=d("input"),j=p(),E=d("label"),O=d("span"),O.textContent="Done message:",S=p(),q=d("input"),U=p(),R(F.$$.fragment),h(c,"type","checkbox"),h(c,"class","toggle"),h(n,"class","svelte-1al7cyz"),h($,"type","text"),h($,"class","input input-bordered"),h($,"pattern","^[0-9]+:[0-5][0-9]$"),$.disabled=x=!t[1].showTimer,v($,"input-error",!t[4]),h(f,"class","svelte-1al7cyz"),h(_,"type","text"),h(_,"class","input input-bordered"),h(_,"placeholder","Message shown at beginning"),v(_,"input-error",!t[3]),h(k,"class","svelte-1al7cyz"),h(q,"type","text"),h(q,"class","input input-bordered"),h(q,"placeholder","Message to show at end of rotation"),v(q,"input-error",!t[2]),h(E,"class","svelte-1al7cyz")},m(o,u){l(o,e,u),a(e,n),a(n,s),a(n,r),a(n,c),c.checked=t[1].showTimer,a(e,i),a(e,f),a(f,g),a(f,w),a(f,$),b($,t[1].duration),a(e,y),a(e,k),a(k,A),a(k,M),a(k,_),b(_,t[1].welcome),a(e,j),a(e,E),a(E,O),a(E,S),a(E,q),b(q,t[1].done),a(e,U),I(F,e,null),P=!0,B||(H=[m(c,"change",t[5]),m($,"input",t[6]),m(_,"input",t[7]),m(q,"input",t[8])],B=!0)},p(t,[e]){2&e&&(c.checked=t[1].showTimer),(!P||2&e&&x!==(x=!t[1].showTimer))&&($.disabled=x),2&e&&$.value!==t[1].duration&&b($,t[1].duration),16&e&&v($,"input-error",!t[4]),2&e&&_.value!==t[1].welcome&&b(_,t[1].welcome),8&e&&v(_,"input-error",!t[3]),2&e&&q.value!==t[1].done&&b(q,t[1].done),4&e&&v(q,"input-error",!t[2]);const n={};var o;!z&&2&e&&(z=!0,n.names=t[1].names,o=()=>z=!1,T.push(o)),F.$set(n)},i(t){P||(L(F.$$.fragment,t),P=!0)},o(t){N(F.$$.fragment,t),P=!1},d(t){t&&u(e),D(F),B=!1,o(H)}}}function pt(e,n,o){let s,r,i,a,l=t,u=()=>(l(),l=c(d,(t=>o(1,a=t))),d);e.$$.on_destroy.push((()=>l()));let{settings:d=rt({welcome:"",done:"",duration:"1:00",showTimer:!0,names:[]})}=n;return u(),e.$$set=t=>{"settings"in t&&u(o(0,d=t.settings))},e.$$.update=()=>{2&e.$$.dirty&&o(4,s=new RegExp("^[0-9]+:[0-5][0-9]$").test(a.duration)),2&e.$$.dirty&&o(3,r=a.welcome.length>0),2&e.$$.dirty&&o(2,i=a.done.length>0)},[d,a,i,r,s,function(){a.showTimer=this.checked,d.set(a)},function(){a.duration=this.value,d.set(a)},function(){a.welcome=this.value,d.set(a)},function(){a.done=this.value,d.set(a)},function(t){e.$$.not_equal(a.names,t)&&(a.names=t,d.set(a))}]}class mt extends J{constructor(t){super(),H(this,t,pt,ft,r,{settings:0})}}var ht,gt,bt=(ht=function(t){var e=function(){var t=String.fromCharCode,e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",o={};function s(t,e){if(!o[t]){o[t]={};for(var n=0;n<t.length;n++)o[t][t.charAt(n)]=n}return o[t][e]}var r={compressToBase64:function(t){if(null==t)return"";var n=r._compress(t,6,(function(t){return e.charAt(t)}));switch(n.length%4){default:case 0:return n;case 1:return n+"===";case 2:return n+"==";case 3:return n+"="}},decompressFromBase64:function(t){return null==t?"":""==t?null:r._decompress(t.length,32,(function(n){return s(e,t.charAt(n))}))},compressToUTF16:function(e){return null==e?"":r._compress(e,15,(function(e){return t(e+32)}))+" "},decompressFromUTF16:function(t){return null==t?"":""==t?null:r._decompress(t.length,16384,(function(e){return t.charCodeAt(e)-32}))},compressToUint8Array:function(t){for(var e=r.compress(t),n=new Uint8Array(2*e.length),o=0,s=e.length;o<s;o++){var c=e.charCodeAt(o);n[2*o]=c>>>8,n[2*o+1]=c%256}return n},decompressFromUint8Array:function(e){if(null==e)return r.decompress(e);for(var n=new Array(e.length/2),o=0,s=n.length;o<s;o++)n[o]=256*e[2*o]+e[2*o+1];var c=[];return n.forEach((function(e){c.push(t(e))})),r.decompress(c.join(""))},compressToEncodedURIComponent:function(t){return null==t?"":r._compress(t,6,(function(t){return n.charAt(t)}))},decompressFromEncodedURIComponent:function(t){return null==t?"":""==t?null:(t=t.replace(/ /g,"+"),r._decompress(t.length,32,(function(e){return s(n,t.charAt(e))})))},compress:function(e){return r._compress(e,16,(function(e){return t(e)}))},_compress:function(t,e,n){if(null==t)return"";var o,s,r,c={},i={},a="",l="",u="",d=2,f=3,p=2,m=[],h=0,g=0;for(r=0;r<t.length;r+=1)if(a=t.charAt(r),Object.prototype.hasOwnProperty.call(c,a)||(c[a]=f++,i[a]=!0),l=u+a,Object.prototype.hasOwnProperty.call(c,l))u=l;else{if(Object.prototype.hasOwnProperty.call(i,u)){if(u.charCodeAt(0)<256){for(o=0;o<p;o++)h<<=1,g==e-1?(g=0,m.push(n(h)),h=0):g++;for(s=u.charCodeAt(0),o=0;o<8;o++)h=h<<1|1&s,g==e-1?(g=0,m.push(n(h)),h=0):g++,s>>=1}else{for(s=1,o=0;o<p;o++)h=h<<1|s,g==e-1?(g=0,m.push(n(h)),h=0):g++,s=0;for(s=u.charCodeAt(0),o=0;o<16;o++)h=h<<1|1&s,g==e-1?(g=0,m.push(n(h)),h=0):g++,s>>=1}0==--d&&(d=Math.pow(2,p),p++),delete i[u]}else for(s=c[u],o=0;o<p;o++)h=h<<1|1&s,g==e-1?(g=0,m.push(n(h)),h=0):g++,s>>=1;0==--d&&(d=Math.pow(2,p),p++),c[l]=f++,u=String(a)}if(""!==u){if(Object.prototype.hasOwnProperty.call(i,u)){if(u.charCodeAt(0)<256){for(o=0;o<p;o++)h<<=1,g==e-1?(g=0,m.push(n(h)),h=0):g++;for(s=u.charCodeAt(0),o=0;o<8;o++)h=h<<1|1&s,g==e-1?(g=0,m.push(n(h)),h=0):g++,s>>=1}else{for(s=1,o=0;o<p;o++)h=h<<1|s,g==e-1?(g=0,m.push(n(h)),h=0):g++,s=0;for(s=u.charCodeAt(0),o=0;o<16;o++)h=h<<1|1&s,g==e-1?(g=0,m.push(n(h)),h=0):g++,s>>=1}0==--d&&(d=Math.pow(2,p),p++),delete i[u]}else for(s=c[u],o=0;o<p;o++)h=h<<1|1&s,g==e-1?(g=0,m.push(n(h)),h=0):g++,s>>=1;0==--d&&(d=Math.pow(2,p),p++)}for(s=2,o=0;o<p;o++)h=h<<1|1&s,g==e-1?(g=0,m.push(n(h)),h=0):g++,s>>=1;for(;;){if(h<<=1,g==e-1){m.push(n(h));break}g++}return m.join("")},decompress:function(t){return null==t?"":""==t?null:r._decompress(t.length,32768,(function(e){return t.charCodeAt(e)}))},_decompress:function(e,n,o){var s,r,c,i,a,l,u,d=[],f=4,p=4,m=3,h="",g=[],b={val:o(0),position:n,index:1};for(s=0;s<3;s+=1)d[s]=s;for(c=0,a=Math.pow(2,2),l=1;l!=a;)i=b.val&b.position,b.position>>=1,0==b.position&&(b.position=n,b.val=o(b.index++)),c|=(i>0?1:0)*l,l<<=1;switch(c){case 0:for(c=0,a=Math.pow(2,8),l=1;l!=a;)i=b.val&b.position,b.position>>=1,0==b.position&&(b.position=n,b.val=o(b.index++)),c|=(i>0?1:0)*l,l<<=1;u=t(c);break;case 1:for(c=0,a=Math.pow(2,16),l=1;l!=a;)i=b.val&b.position,b.position>>=1,0==b.position&&(b.position=n,b.val=o(b.index++)),c|=(i>0?1:0)*l,l<<=1;u=t(c);break;case 2:return""}for(d[3]=u,r=u,g.push(u);;){if(b.index>e)return"";for(c=0,a=Math.pow(2,m),l=1;l!=a;)i=b.val&b.position,b.position>>=1,0==b.position&&(b.position=n,b.val=o(b.index++)),c|=(i>0?1:0)*l,l<<=1;switch(u=c){case 0:for(c=0,a=Math.pow(2,8),l=1;l!=a;)i=b.val&b.position,b.position>>=1,0==b.position&&(b.position=n,b.val=o(b.index++)),c|=(i>0?1:0)*l,l<<=1;d[p++]=t(c),u=p-1,f--;break;case 1:for(c=0,a=Math.pow(2,16),l=1;l!=a;)i=b.val&b.position,b.position>>=1,0==b.position&&(b.position=n,b.val=o(b.index++)),c|=(i>0?1:0)*l,l<<=1;d[p++]=t(c),u=p-1,f--;break;case 2:return g.join("")}if(0==f&&(f=Math.pow(2,m),m++),d[u])h=d[u];else{if(u!==p)return null;h=r+r.charAt(0)}g.push(h),d[p++]=r+h.charAt(0),r=h,0==--f&&(f=Math.pow(2,m),m++)}}};return r}();null!=t&&(t.exports=e)},ht(gt={exports:{}},gt.exports),gt.exports);function vt(e){let n,o,s,r,c,i,m,b,v,w,$;return{c(){n=d("div"),o=d("div"),s=d("div"),r=p(),c=d("div"),i=p(),m=d("div"),b=d("div"),v=f(e[0]),w=p(),$=d("div"),$.innerHTML='<div class="bg-primary flex aspect-square w-5 items-center justify-center rounded lg:w-6"><div class="text-primary-content text-sm font-bold">A</div></div> \n        <div class="bg-secondary flex aspect-square w-5 items-center justify-center rounded lg:w-6"><div class="text-secondary-content text-sm font-bold">A</div></div> \n        <div class="bg-accent flex aspect-square w-5 items-center justify-center rounded lg:w-6"><div class="text-accent-content text-sm font-bold">A</div></div> \n        <div class="bg-neutral flex aspect-square w-5 items-center justify-center rounded lg:w-6"><div class="text-neutral-content text-sm font-bold">A</div></div>',h(s,"class","bg-base-200 col-start-1 row-span-2 row-start-1"),h(c,"class","bg-base-300 col-start-1 row-start-3"),h(b,"class","font-bold"),h($,"class","flex flex-wrap gap-1"),h(m,"class","bg-base-100 col-span-4 col-start-2 row-span-3 row-start-1 flex flex-col gap-1 p-2"),h(o,"class","grid grid-cols-5 grid-rows-3"),h(n,"data-theme",e[0]),h(n,"class","bg-base-100 text-base-content w-full cursor-pointer font-sans")},m(t,e){l(t,n,e),a(n,o),a(o,s),a(o,r),a(o,c),a(o,i),a(o,m),a(m,b),a(b,v),a(m,w),a(m,$)},p(t,[e]){1&e&&g(v,t[0]),1&e&&h(n,"data-theme",t[0])},i:t,o:t,d(t){t&&u(n)}}}function wt(t,e,n){let{theme:o}=e;return t.$$set=t=>{"theme"in t&&n(0,o=t.theme)},[o]}class $t extends J{constructor(t){super(),H(this,t,wt,vt,r,{theme:0})}}function xt(t,e,n){const o=t.slice();return o[4]=e[n],o}function yt(t,e){let n,o,s,r,c,i;function f(){return e[3](e[4])}return o=new $t({props:{theme:e[4]}}),{key:t,first:null,c(){n=d("div"),R(o.$$.fragment),s=p(),h(n,"class","border-base-content/20 hover:border-base-content/40 outline-base-content overflow-hidden rounded-lg border outline-2 outline-offset-2"),h(n,"data-set-theme",e[4]),h(n,"data-act-class","outline"),v(n,"outline",e[0]===e[4]),this.first=n},m(t,e){l(t,n,e),I(o,n,null),a(n,s),r=!0,c||(i=m(n,"click",f),c=!0)},p(t,o){e=t,3&o&&v(n,"outline",e[0]===e[4])},i(t){r||(L(o.$$.fragment,t),r=!0)},o(t){N(o.$$.fragment,t),r=!1},d(t){t&&u(n),D(o),c=!1,i()}}}function kt(t){let e,n,s=[],r=new Map,c=t[1];const i=t=>t[4];for(let e=0;e<c.length;e+=1){let n=xt(t,c,e),o=i(n);r.set(o,s[e]=yt(o,n))}return{c(){e=d("div");for(let t=0;t<s.length;t+=1)s[t].c();h(e,"class","rounded-box grid grid-cols-2 gap-4 md:grid-cols-2")},m(t,o){l(t,e,o);for(let t=0;t<s.length;t+=1)s[t].m(e,null);n=!0},p(t,[n]){7&n&&(c=t[1],z={r:0,c:[],p:z},s=function(t,e,n,o,s,r,c,i,a,l,u,d){let f=t.length,p=r.length,m=f;const h={};for(;m--;)h[t[m].key]=m;const g=[],b=new Map,v=new Map;for(m=p;m--;){const t=d(s,r,m),i=n(t);let a=c.get(i);a?o&&a.p(t,e):(a=l(i,t),a.c()),b.set(i,g[m]=a),i in h&&v.set(i,Math.abs(m-h[i]))}const w=new Set,$=new Set;function x(t){L(t,1),t.m(i,u),c.set(t.key,t),u=t.first,p--}for(;f&&p;){const e=g[p-1],n=t[f-1],o=e.key,s=n.key;e===n?(u=e.first,f--,p--):b.has(s)?!c.has(o)||w.has(o)?x(e):$.has(s)?f--:v.get(o)>v.get(s)?($.add(o),x(e)):(w.add(s),f--):(a(n,c),f--)}for(;f--;){const e=t[f];b.has(e.key)||a(e,c)}for(;p;)x(g[p-1]);return g}(s,n,i,1,t,c,r,e,P,yt,null,xt),z.r||o(z.c),z=z.p)},i(t){if(!n){for(let t=0;t<c.length;t+=1)L(s[t]);n=!0}},o(t){for(let t=0;t<s.length;t+=1)N(s[t]);n=!1},d(t){t&&u(e);for(let t=0;t<s.length;t+=1)s[t].d()}}}function At(t,e,n){let o;const s=t=>{o!==t?(K(t),n(0,o=t)):(K(""),n(0,o=void 0))};y((()=>{n(0,o=(()=>{const t=localStorage.getItem("theme");return t&&document.documentElement.setAttribute("data-theme",t),t})())}));return[o,["light","dark","cupcake","bumblebee","emerald","corporate","synthwave","retro","cyberpunk","valentine","halloween","garden","forest","aqua","lofi","pastel","fantasy","wireframe","black","luxury","dracula","cmyk","autumn","business","acid","lemonade","night","coffee","winter"],s,t=>s(t)]}class Ct extends J{constructor(t){super(),H(this,t,At,kt,r,{})}}function Mt(t){let e,n,o,s,r,c,i,f,m,g,b,w,$,x,y,k,A,C,M,T,_,j,E,O,S;return n=new ot({props:{names:t[0],showTimer:t[2].showTimer,doneMessage:t[2].done,time:t[2].duration,welcome:t[2].welcome}}),n.$on("running",t[5]),f=new mt({props:{settings:t[3]}}),C=new Ct({}),{c(){e=d("main"),R(n.$$.fragment),o=p(),s=d("input"),r=p(),c=d("div"),i=d("div"),R(f.$$.fragment),m=p(),g=d("div"),g.innerHTML='<label for="settings-modal" class="btn btn-secondary">Save</label>',b=p(),w=d("input"),$=p(),x=d("label"),y=d("label"),k=d("h3"),k.textContent="Change the theme",A=p(),R(C.$$.fragment),M=p(),T=d("footer"),_=d("div"),j=d("label"),j.textContent="Settings",E=p(),O=d("label"),O.textContent="Theme",h(s,"type","checkbox"),h(s,"id","settings-modal"),h(s,"class","modal-toggle"),h(g,"class","modal-action"),h(i,"class","modal-box"),h(c,"class","modal"),h(w,"type","checkbox"),h(w,"id","theme-modal"),h(w,"class","modal-toggle"),h(k,"class","text-lg font-bold"),h(y,"class","modal-box relative"),h(y,"for",""),h(x,"for","theme-modal"),h(x,"class","modal cursor-pointer"),h(e,"class","mx-auto my-8 max-w-2xl p-2"),h(j,"for","settings-modal"),h(j,"class","btn modal-button btn-secondary"),v(j,"btn-disabled",!t[1]),h(O,"for","theme-modal"),h(O,"class","btn modal-button btn-accent"),h(_,"class","mx-auto max-w-2xl p-2"),h(T,"class","fixed inset-x-0 bottom-0")},m(t,u){l(t,e,u),I(n,e,null),a(e,o),a(e,s),a(e,r),a(e,c),a(c,i),I(f,i,null),a(i,m),a(i,g),a(e,b),a(e,w),a(e,$),a(e,x),a(x,y),a(y,k),a(y,A),I(C,y,null),l(t,M,u),l(t,T,u),a(T,_),a(_,j),a(_,E),a(_,O),S=!0},p(t,[e]){const o={};1&e&&(o.names=t[0]),4&e&&(o.showTimer=t[2].showTimer),4&e&&(o.doneMessage=t[2].done),4&e&&(o.time=t[2].duration),4&e&&(o.welcome=t[2].welcome),n.$set(o),2&e&&v(j,"btn-disabled",!t[1])},i(t){S||(L(n.$$.fragment,t),L(f.$$.fragment,t),L(C.$$.fragment,t),S=!0)},o(t){N(n.$$.fragment,t),N(f.$$.fragment,t),N(C.$$.fragment,t),S=!1},d(t){t&&u(e),D(n),D(f),D(C),t&&u(M),t&&u(T)}}}function Tt(t,e,n){let o,s;const r=function(t){const{subscribe:e,set:n,update:o}=rt(t);function s(t){return bt.compressToEncodedURIComponent(JSON.stringify(t))}const r=location.hash.substring(1);return r.length>0&&n(function(t){return JSON.parse(bt.decompressFromEncodedURIComponent(t))}(r)),{set:async function(t){location.hash=await s(t),n(t)},update:function(t){o((e=>{const n=t(e);location.hash=s(n)}))},subscribe:e}}({welcome:"Welcome!",done:"Done.",duration:"1:00",showTimer:!0,names:[]});i(t,r,(t=>n(2,s=t)));const c=ct(r,(t=>t.names.filter((t=>t.active)).map((t=>t.name))),[]);i(t,c,(t=>n(0,o=t)));let a=!0;return t.$$.update=()=>{1&t.$$.dirty&&o.length},[o,a,s,r,c,function(t){n(1,a=!a)}]}return new class extends J{constructor(t){super(),H(this,t,Tt,Mt,r,{})}}({target:document.body,props:{}})}();
//# sourceMappingURL=bundle.js.map
