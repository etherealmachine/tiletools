var xe=Object.defineProperty;var $e=(e,n,t)=>n in e?xe(e,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[n]=t;var Me=(e,n,t)=>($e(e,typeof n!="symbol"?n+"":n,t),t);(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))i(l);new MutationObserver(l=>{for(const s of l)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(l){const s={};return l.integrity&&(s.integrity=l.integrity),l.referrerPolicy&&(s.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?s.credentials="include":l.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(l){if(l.ep)return;l.ep=!0;const s=t(l);fetch(l.href,s)}})();function $(){}function De(e){return e()}function Ie(){return Object.create(null)}function se(e){e.forEach(De)}function Ke(e){return typeof e=="function"}function we(e,n){return e!=e?n==n:e!==n||e&&typeof e=="object"||typeof e=="function"}let me;function Pe(e,n){return e===n?!0:(me||(me=document.createElement("a")),me.href=n,e===me.href)}function et(e){return Object.keys(e).length===0}function f(e,n){e.appendChild(n)}function re(e,n,t){e.insertBefore(n,t||null)}function oe(e){e.parentNode&&e.parentNode.removeChild(e)}function tt(e,n){for(let t=0;t<e.length;t+=1)e[t]&&e[t].d(n)}function w(e){return document.createElement(e)}function J(e){return document.createTextNode(e)}function N(){return J(" ")}function D(e,n,t,i){return e.addEventListener(n,t,i),()=>e.removeEventListener(n,t,i)}function y(e,n,t){t==null?e.removeAttribute(n):e.getAttribute(n)!==t&&e.setAttribute(n,t)}function ve(e){return e===""?null:+e}function nt(e){return Array.from(e.childNodes)}function de(e,n){n=""+n,e.data!==n&&(e.data=n)}function x(e,n){e.value=n??""}function T(e,n,t,i){t==null?e.style.removeProperty(n):e.style.setProperty(n,t,i?"important":"")}let Ae;function he(e){Ae=e}const ue=[],O=[];let ce=[];const Ee=[],it=Promise.resolve();let He=!1;function lt(){He||(He=!0,it.then(Ge))}function Se(e){ce.push(e)}function Z(e){Ee.push(e)}const ke=new Set;let fe=0;function Ge(){if(fe!==0)return;const e=Ae;do{try{for(;fe<ue.length;){const n=ue[fe];fe++,he(n),st(n.$$)}}catch(n){throw ue.length=0,fe=0,n}for(he(null),ue.length=0,fe=0;O.length;)O.pop()();for(let n=0;n<ce.length;n+=1){const t=ce[n];ke.has(t)||(ke.add(t),t())}ce.length=0}while(ue.length);for(;Ee.length;)Ee.pop()();He=!1,ke.clear(),he(e)}function st(e){if(e.fragment!==null){e.update(),se(e.before_update);const n=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,n),e.after_update.forEach(Se)}}function ot(e){const n=[],t=[];ce.forEach(i=>e.indexOf(i)===-1?n.push(i):t.push(i)),t.forEach(i=>i()),ce=n}const _e=new Set;let rt;function be(e,n){e&&e.i&&(_e.delete(e),e.i(n))}function We(e,n,t,i){if(e&&e.o){if(_e.has(e))return;_e.add(e),rt.c.push(()=>{_e.delete(e),i&&(t&&e.d(1),i())}),e.o(n)}else i&&i()}function qe(e){return(e==null?void 0:e.length)!==void 0?e:Array.from(e)}function B(e,n,t){const i=e.$$.props[n];i!==void 0&&(e.$$.bound[i]=t,t(e.$$.ctx[i]))}function Ce(e){e&&e.c()}function Te(e,n,t){const{fragment:i,after_update:l}=e.$$;i&&i.m(n,t),Se(()=>{const s=e.$$.on_mount.map(De).filter(Ke);e.$$.on_destroy?e.$$.on_destroy.push(...s):se(s),e.$$.on_mount=[]}),l.forEach(Se)}function ye(e,n){const t=e.$$;t.fragment!==null&&(ot(t.after_update),se(t.on_destroy),t.fragment&&t.fragment.d(n),t.on_destroy=t.fragment=null,t.ctx=[])}function ft(e,n){e.$$.dirty[0]===-1&&(ue.push(e),lt(),e.$$.dirty.fill(0)),e.$$.dirty[n/31|0]|=1<<n%31}function Ye(e,n,t,i,l,s,o,h=[-1]){const c=Ae;he(e);const u=e.$$={fragment:null,ctx:[],props:s,update:$,not_equal:l,bound:Ie(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(n.context||(c?c.$$.context:[])),callbacks:Ie(),dirty:h,skip_bound:!1,root:n.target||c.$$.root};o&&o(u.root);let v=!1;if(u.ctx=t?t(e,n.props||{},(m,W,...g)=>{const Y=g.length?g[0]:W;return u.ctx&&l(u.ctx[m],u.ctx[m]=Y)&&(!u.skip_bound&&u.bound[m]&&u.bound[m](Y),v&&ft(e,m)),W}):[],u.update(),v=!0,se(u.before_update),u.fragment=i?i(u.ctx):!1,n.target){if(n.hydrate){const m=nt(n.target);u.fragment&&u.fragment.l(m),m.forEach(oe)}else u.fragment&&u.fragment.c();n.intro&&be(e.$$.fragment),Te(e,n.target,n.anchor),Ge()}he(c)}class Xe{constructor(){Me(this,"$$");Me(this,"$$set")}$destroy(){ye(this,1),this.$destroy=$}$on(n,t){if(!Ke(t))return $;const i=this.$$.callbacks[n]||(this.$$.callbacks[n]=[]);return i.push(t),()=>{const l=i.indexOf(t);l!==-1&&i.splice(l,1)}}$set(n){this.$$set&&!et(n)&&(this.$$.skip_bound=!0,this.$$set(n),this.$$.skip_bound=!1)}}const ut="4";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(ut);function dt(e){let n,t,i,l,s,o,h,c,u;return{c(){n=w("div"),t=w("canvas"),i=N(),l=w("span"),s=J(e[1]),o=J(", "),h=J(e[2]),y(t,"class","canvas svelte-1qmvqxz"),y(t,"tabindex","1"),y(t,"width","800px"),y(t,"height","600px"),T(n,"display","flex"),T(n,"flex-direction","column")},m(v,m){re(v,n,m),f(n,t),e[14](t),f(n,i),f(n,l),f(l,s),f(l,o),f(l,h),c||(u=[D(t,"wheel",e[5]),D(t,"mousemove",e[4]),D(t,"click",e[3]),D(t,"keydown",e[6])],c=!0)},p(v,[m]){m&2&&de(s,v[1]),m&4&&de(h,v[2])},i:$,o:$,d(v){v&&oe(n),e[14](null),c=!1,se(u)}}}function ct(e,n){const t=Math.round(e),i=Math.round(n);e-=t,n-=i;const l=Math.round(e+.5*n)*(e*e>=n*n?1:0),s=Math.round(n+.5*e)*(e*e<n*n?1:0);return[t+l,i+s]}function at(e,n,t,i){const l=2*Math.PI/6;e.beginPath();for(var s=0;s<6;s++)e.lineTo(n+i*Math.cos(l*s),t+i*Math.sin(l*s));e.closePath(),e.stroke()}function ht(e,n,t){let i,l,s,o,h,{selectedTileset:c}=n,{tileWidth:u,tileHeight:v}=n,{selectedTileX:m,selectedTileY:W}=n,g,Y=[],M,H,b=1;const _=Math.sqrt(3);function G(a,X){return[(a-o)/b,(X-h)/b]}function p(a,X){const[k,P]=G(a,X);return ct(2/3*k/i,(-1/3*k+_/3*P)/i)}function L(a,X){return[i*(3/2)*a,i*(_/2*a+_*X)]}function F(a,X,k,P,A,V){const[te,ne]=L(X,k);a.drawImage(P,A*u,V*v,u,v,te-i,ne-s-6,u*1.01,v*1.01)}function R(a){const X=g.getContext("2d");if(X){X.imageSmoothingEnabled=!1,X.resetTransform(),X.clearRect(0,0,g.width,g.height),X.setTransform(b,0,0,b,o,h),X.strokeStyle="white";for(let k=0;k<g.width/l-1;k++)for(let P=0;P<g.height/s-1;P++){const[A,V]=L(k,P-Math.floor(k/2));at(X,A,V,i)}Y.sort((k,P)=>P.y===k.y?k.x-P.x:k.y-P.y);for(let k of Y)k.tileset&&k.tileset.complete&&F(X,k.x,k.y,k.tileset,k.tileX,k.tileY);if(a){const[k,P]=p(a.offsetX,a.offsetY);c&&c.complete&&F(X,k,P,c,m,W)}}}function S(a){const[X,k]=p(a.offsetX,a.offsetY);Y.push({tileset:c,tileX:m,tileY:W,x:X,y:k}),R()}function I(a){t(1,[M,H]=p(a.offsetX,a.offsetY),M,t(2,H)),a.buttons===1?S(a):a.ctrlKey&&(o+=a.movementX,h+=a.movementY),R(a)}function Q(a){const X=b;a.deltaY<0?b*=1.1:a.deltaY>0&&(b*=.9),b=Math.min(Math.max(.25,b),8),o=-b*(a.offsetX-o)/X+a.offsetX,h=-b*(a.offsetY-h)/X+a.offsetY,R(a)}function U(a){switch(a.key){case"ArrowLeft":o+=b*i;break;case"ArrowRight":o-=b*i;break;case"ArrowUp":h+=b*s;break;case"ArrowDown":h-=b*s;break}R()}function ee(a){O[a?"unshift":"push"](()=>{g=a,t(0,g)})}return e.$$set=a=>{"selectedTileset"in a&&t(7,c=a.selectedTileset),"tileWidth"in a&&t(8,u=a.tileWidth),"tileHeight"in a&&t(9,v=a.tileHeight),"selectedTileX"in a&&t(10,m=a.selectedTileX),"selectedTileY"in a&&t(11,W=a.selectedTileY)},e.$$.update=()=>{e.$$.dirty&256&&t(13,i=u/2),e.$$.dirty&8192&&(l=3/2*i),e.$$.dirty&8192&&t(12,s=Math.ceil(_*i)),e.$$.dirty&8192&&(o=i),e.$$.dirty&4096&&(h=s/2)},[g,M,H,S,I,Q,U,c,u,v,m,W,s,i,ee]}class gt extends Xe{constructor(n){super(),Ye(this,n,ht,dt,we,{selectedTileset:7,tileWidth:8,tileHeight:9,selectedTileX:10,selectedTileY:11})}}function Ne(e,n,t){const i=e.slice();return i[3]=n[t],i}function Oe(e){let n,t=e[3]+"",i,l,s,o;function h(){return e[2](e[3])}return{c(){n=w("button"),i=J(t),l=N(),y(n,"class","tab svelte-x6i6v4")},m(c,u){re(c,n,u),f(n,i),f(n,l),s||(o=D(n,"click",h),s=!0)},p(c,u){e=c,u&2&&t!==(t=e[3]+"")&&de(i,t)},d(c){c&&oe(n),s=!1,o()}}}function mt(e){let n,t=qe(e[1]),i=[];for(let l=0;l<t.length;l+=1)i[l]=Oe(Ne(e,t,l));return{c(){n=w("div");for(let l=0;l<i.length;l+=1)i[l].c();y(n,"class","tabs svelte-x6i6v4")},m(l,s){re(l,n,s);for(let o=0;o<i.length;o+=1)i[o]&&i[o].m(n,null)},p(l,[s]){if(s&3){t=qe(l[1]);let o;for(o=0;o<t.length;o+=1){const h=Ne(l,t,o);i[o]?i[o].p(h,s):(i[o]=Oe(h),i[o].c(),i[o].m(n,null))}for(;o<i.length;o+=1)i[o].d(1);i.length=t.length}},i:$,o:$,d(l){l&&oe(n),tt(i,l)}}}function pt(e,n,t){let{tabs:i}=n,{selected:l=0}=n;const s=o=>{t(0,l=i.indexOf(o))};return e.$$set=o=>{"tabs"in o&&t(1,i=o.tabs),"selected"in o&&t(0,l=o.selected)},[l,i,s]}class _t extends Xe{constructor(n){super(),Ye(this,n,pt,mt,we,{tabs:1,selected:0})}}const bt=String.fromCharCode(137,80,78,71,13,10,26,10),Ue="tEXt";function Tt(e){for(let n of Ze(e))if(Je(n))return JSON.parse(n.data)}function yt(e,n){const t=Ze(e),i=t.findIndex(Je),l={type:Ue,data:JSON.stringify(n)};return i===-1?t.splice(1,0,l):t[i]=l,vt(t)}function Je(e){return e.type===Ue&&e.data.startsWith("{")&&e.data.endsWith("}")}function Ze(e){e=e.substring(8);const n=[];for(;e!=="";){let t=wt(e.substring(0,4));t<0&&(t=0);const i=e.substring(0,t+12);e=e.substring(t+12);const l=i.substring(4,8);let s="";t>0&&(s=i.substring(8,t+8)),n.push({type:l,data:s})}return n}function vt(e){let n=bt;for(let t of e){let i=Le(t.data.length,4);i+=t.type,i+=t.data,i+=Le(Yt(t.type+t.data),4),n+=i}return n}function Le(e,n){for(var t=[],i=n-1;i>=0;){var l=e&255;t[i--]=l,e=e>>8}return t=t.map(function(s){return String.fromCharCode(s)}),t.join("")}function wt(e){for(var n=0,t=0;t<e.length;t++){var i=e.charCodeAt(t);n=n<<8|i&255}return n}function Yt(e){for(var n=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,936918e3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117],t=-1,i=0;i<e.length;i++)t=t>>>8^n[(t^e.charCodeAt(i))&255];return(t^-1)>>>0}async function Fe(e){return new Promise((n,t)=>{const i=new FileReader;i.addEventListener("load",function(){i.result?n(i.result):t(`error loading ${e}`)}),i.readAsBinaryString(e)})}function Re(e){let n,t,i,l,s,o;return{c(){n=w("label"),t=w("button"),t.textContent="Merge Tileset",i=N(),l=w("input"),T(l,"display","none"),y(l,"name","merge"),y(l,"type","file"),y(l,"accept","image/png"),y(n,"for","merge")},m(h,c){re(h,n,c),f(n,t),f(n,i),f(n,l),e[31](l),s||(o=[D(t,"click",e[30]),D(l,"change",e[18])],s=!0)},p:$,d(h){h&&oe(n),e[31](null),s=!1,se(o)}}}function je(e){let n,t,i,l,s,o,h,c,u,v,m,W,g,Y,M,H;return{c(){n=w("div"),t=w("div"),i=J("Selected: Tile "),l=J(e[11]),s=J(" ("),o=J(e[3]),h=J(", "),c=J(e[4]),u=J(")"),v=N(),m=w("div"),W=w("label"),W.textContent="Tags",g=N(),Y=w("input"),y(W,"for","tags"),y(Y,"name","tags"),y(Y,"type","text"),T(m,"display","flex"),T(m,"flex-direction","column"),T(m,"align-items","start"),T(n,"display","flex"),T(n,"flex-direction","column"),T(n,"gap","8px"),T(n,"align-items","start")},m(b,_){re(b,n,_),f(n,t),f(t,i),f(t,l),f(t,s),f(t,o),f(t,h),f(t,c),f(t,u),f(n,v),f(n,m),f(m,W),f(m,g),f(m,Y),x(Y,e[13]),e[37](Y),M||(H=[D(Y,"change",e[19]),D(Y,"input",e[36])],M=!0)},p(b,_){_[0]&2048&&de(l,b[11]),_[0]&8&&de(o,b[3]),_[0]&16&&de(c,b[4]),_[0]&8192&&Y.value!==b[13]&&x(Y,b[13])},d(b){b&&oe(n),e[37](null),M=!1,se(H)}}}function Xt(e){let n,t,i,l,s,o,h,c,u,v,m,W,g,Y,M,H,b,_,G,p,L,F,R,S,I,Q,U,ee,a,X,k,P,A,V,te,ne,j=e[0]&&e[0].src&&Re(e),z=e[3]!==void 0&&e[4]!==void 0&&je(e);return{c(){n=w("div"),t=w("div"),i=w("input"),l=N(),s=w("div"),o=w("label"),o.textContent="Name",h=N(),c=w("input"),u=N(),v=w("div"),m=w("label"),m.textContent="Width",W=N(),g=w("input"),Y=N(),M=w("div"),H=w("label"),H.textContent="Height",b=N(),_=w("input"),G=N(),p=w("div"),j&&j.c(),L=N(),F=w("button"),F.textContent="Save",R=N(),S=w("div"),I=w("input"),Q=N(),U=w("img"),a=N(),X=w("img"),P=N(),A=w("canvas"),V=N(),z&&z.c(),y(i,"type","file"),y(i,"accept","image/png"),y(o,"for","name"),y(c,"name","name"),y(c,"type","text"),T(s,"display","flex"),T(s,"flex-direction","column"),T(s,"align-items","start"),y(m,"for","width"),y(g,"name","width"),y(g,"type","number"),y(g,"min","1"),y(g,"max","64"),T(g,"max-width","4em"),T(v,"display","flex"),T(v,"flex-direction","column"),T(v,"align-items","start"),y(H,"for","height"),y(_,"name","height"),y(_,"type","number"),y(_,"min","1"),y(_,"max","64"),T(_,"max-width","4em"),T(M,"display","flex"),T(M,"flex-direction","column"),T(M,"align-items","start"),T(p,"margin-left","auto"),T(p,"display","flex"),T(p,"gap","8px"),T(t,"display","flex"),T(t,"gap","8px"),T(t,"align-items","end"),y(I,"name","filter"),y(I,"type","text"),y(I,"placeholder","Filter"),T(S,"display","flex"),T(S,"gap","8px"),T(S,"align-items","end"),Pe(U.src,ee="")||y(U,"src",ee),T(U,"display","none"),Pe(X.src,k="")||y(X,"src",k),T(X,"display","none"),y(A,"class","canvas svelte-1qmvqxz"),y(A,"width",800),y(A,"height",600),T(n,"display","flex"),T(n,"flex-direction","column"),T(n,"gap","8px")},m(C,d){re(C,n,d),f(n,t),f(t,i),e[26](i),f(t,l),f(t,s),f(s,o),f(s,h),f(s,c),x(c,e[12]),f(t,u),f(t,v),f(v,m),f(v,W),f(v,g),x(g,e[1]),f(t,Y),f(t,M),f(M,H),f(M,b),f(M,_),x(_,e[2]),f(t,G),f(t,p),j&&j.m(p,null),f(p,L),f(p,F),f(n,R),f(n,S),f(S,I),x(I,e[6]),f(n,Q),f(n,U),e[33](U),f(n,a),f(n,X),e[34](X),f(n,P),f(n,A),e[35](A),f(n,V),z&&z.m(n,null),te||(ne=[D(i,"change",e[17]),D(c,"input",e[27]),D(g,"input",e[28]),D(_,"input",e[29]),D(F,"click",e[20]),D(I,"input",e[32]),D(A,"wheel",e[14]),D(A,"click",e[15]),D(A,"mousemove",e[16])],te=!0)},p(C,d){d[0]&4096&&c.value!==C[12]&&x(c,C[12]),d[0]&2&&ve(g.value)!==C[1]&&x(g,C[1]),d[0]&4&&ve(_.value)!==C[2]&&x(_,C[2]),C[0]&&C[0].src?j?j.p(C,d):(j=Re(C),j.c(),j.m(p,L)):j&&(j.d(1),j=null),d[0]&64&&I.value!==C[6]&&x(I,C[6]),C[3]!==void 0&&C[4]!==void 0?z?z.p(C,d):(z=je(C),z.c(),z.m(n,null)):z&&(z.d(1),z=null)},i:$,o:$,d(C){C&&oe(n),e[26](null),j&&j.d(),e[33](null),e[34](null),e[35](null),z&&z.d(),te=!1,se(ne)}}}const pe="data:image/png;base64,";function ze(e,n,t,i,l){e.beginPath(),e.lineTo(n,t),e.lineTo(n+i,t),e.lineTo(n+i,t+l),e.lineTo(n,t+l),e.closePath(),e.stroke()}function Mt(e,n){const t=document.createElement("canvas");t.width=e.width+n.width,t.height=Math.max(e.height,n.height);const i=t.getContext("2d");if(i)return i.imageSmoothingEnabled=!1,i.resetTransform(),i.drawImage(e,0,0,e.width,e.height),i.drawImage(n,e.width,0,n.width,n.height),t.toDataURL("image/png")}function kt(e,n,t){let{tileset:i}=n,{tileWidth:l,tileHeight:s}=n,{selectedTileX:o,selectedTileY:h}=n,c,u,v,m,W,g=2,Y=0,M=0,H,b,_,G,p,L,F,R={},S;function I(r,E){return[(r-Y)/g,(E-M)/g]}function Q(){var E;if(!W)return;const r=W.getContext("2d");if(r){if(r.imageSmoothingEnabled=!1,r.resetTransform(),r.clearRect(0,0,W.width,W.height),r.setTransform(g,0,0,g,Y,M),l!==void 0&&s!==void 0&&_!==void 0&&G!==void 0)for(let q=0;q<_;q++)for(let ae=0;ae<G;ae++){const Ve=ae*_+q;(S===void 0||S===""||(E=R[Ve])!=null&&E.includes(S))&&r.drawImage(i,q*l,ae*s,l,s,q*l,ae*s,l,s)}else r.drawImage(i,0,0,i.width,i.height);r.strokeStyle="white",r.lineWidth=1,l!==void 0&&s!==void 0&&(H!=null&&b!==void 0&&ze(r,H*l,b*s,l,s),o!==void 0&&h!==void 0&&ze(r,o*l,h*s,l,s))}}function U(r){const E=g;r.deltaY<0?t(21,g*=1.1):r.deltaY>0&&t(21,g*=.9),t(21,g=Math.min(Math.max(.25,g),8)),t(22,Y=-g*(r.offsetX-Y)/E+r.offsetX),t(23,M=-g*(r.offsetY-M)/E+r.offsetY)}function ee(r){const[E,q]=I(r.offsetX,r.offsetY);E<0||E>=i.width||q<0||q>=i.height||l!==void 0&&s!==void 0&&_!==void 0&&(t(3,o=Math.floor(E/l)),t(4,h=Math.floor(q/s)),t(11,p=h*_+o),t(13,F=R[p]||""),v.focus())}function a(r){if(r.buttons===1?ee(r):r.ctrlKey&&(t(22,Y+=r.movementX),t(23,M+=r.movementY)),l!==void 0&&s!==void 0){const[E,q]=I(r.offsetX,r.offsetY);t(24,H=Math.floor(E/l)),t(25,b=Math.floor(q/s))}}function X(){if(!u||!u.files)return;const r=u.files[0];r&&Fe(r).then(E=>{i.setAttribute("src",pe+btoa(E)),t(0,i.onload=()=>{requestAnimationFrame(Q)},i),t(12,L=""),t(1,l=void 0),t(2,s=void 0),t(13,F=""),R={},t(3,o=0),t(4,h=0),t(11,p=0),t(22,Y=0),t(23,M=0),t(21,g=2);const q=Tt(E);q&&(t(12,L=q.name||""),t(1,l=q.tileWidth),t(2,s=q.tileHeight),R=q.tags||{})})}function k(){if(!m||!m.files)return;const r=m.files[0];r&&Fe(r).then(E=>{t(5,c.onload=()=>{const q=Mt(i,c);q&&(i.setAttribute("src",q),t(0,i.onload=()=>{requestAnimationFrame(Q)},i)),c.setAttribute("src","")},c),c.setAttribute("src",pe+btoa(E))})}function P(){p!==void 0&&(R[p]=F)}function A(){const r=yt(atob(i.src.substring(pe.length)),{name:L,tileWidth:l,tileHeight:s,tags:R});i.setAttribute("src",pe+btoa(r));const E=document.createElement("a");E.href=i.src,L?E.download=`${L}.png`:E.download="tileset.png",E.click()}function V(...r){i&&l!==void 0&&s!==void 0&&(_=i.width/l,G=i.height/s),requestAnimationFrame(Q)}function te(r){O[r?"unshift":"push"](()=>{u=r,t(7,u)})}function ne(){L=this.value,t(12,L)}function j(){l=ve(this.value),t(1,l)}function z(){s=ve(this.value),t(2,s)}const C=()=>{m.click()};function d(r){O[r?"unshift":"push"](()=>{m=r,t(9,m)})}function K(){S=this.value,t(6,S)}function ge(r){O[r?"unshift":"push"](()=>{i=r,t(0,i)})}function ie(r){O[r?"unshift":"push"](()=>{c=r,t(5,c)})}function le(r){O[r?"unshift":"push"](()=>{W=r,t(10,W)})}function Be(){F=this.value,t(13,F)}function Qe(r){O[r?"unshift":"push"](()=>{v=r,t(8,v)})}return e.$$set=r=>{"tileset"in r&&t(0,i=r.tileset),"tileWidth"in r&&t(1,l=r.tileWidth),"tileHeight"in r&&t(2,s=r.tileHeight),"selectedTileX"in r&&t(3,o=r.selectedTileX),"selectedTileY"in r&&t(4,h=r.selectedTileY)},e.$$.update=()=>{e.$$.dirty[0]&65011839&&V(i,c,l,s,g,Y,M,S,H,b,o,h)},[i,l,s,o,h,c,S,u,v,m,W,p,L,F,U,ee,a,X,k,P,A,g,Y,M,H,b,te,ne,j,z,C,d,K,ge,ie,le,Be,Qe]}class Wt extends Xe{constructor(n){super(),Ye(this,n,kt,Xt,we,{tileset:0,tileWidth:1,tileHeight:2,selectedTileX:3,selectedTileY:4},null,[-1,-1])}}function Ct(e){let n,t,i,l,s,o,h,c,u,v,m,W,g,Y,M,H,b,_,G,p,L,F,R,S,I;function Q(d){e[6](d)}let U={tabs:["Map Editor","Tileset Editor"]};e[5]!==void 0&&(U.selected=e[5]),l=new _t({props:U}),O.push(()=>B(l,"selected",Q));function ee(d){e[7](d)}function a(d){e[8](d)}function X(d){e[9](d)}function k(d){e[10](d)}function P(d){e[11](d)}let A={};e[0]!==void 0&&(A.selectedTileset=e[0]),e[1]!==void 0&&(A.tileWidth=e[1]),e[2]!==void 0&&(A.tileHeight=e[2]),e[3]!==void 0&&(A.selectedTileX=e[3]),e[4]!==void 0&&(A.selectedTileY=e[4]),u=new gt({props:A}),O.push(()=>B(u,"selectedTileset",ee)),O.push(()=>B(u,"tileWidth",a)),O.push(()=>B(u,"tileHeight",X)),O.push(()=>B(u,"selectedTileX",k)),O.push(()=>B(u,"selectedTileY",P));function V(d){e[12](d)}function te(d){e[13](d)}function ne(d){e[14](d)}function j(d){e[15](d)}function z(d){e[16](d)}let C={};return e[0]!==void 0&&(C.tileset=e[0]),e[1]!==void 0&&(C.tileWidth=e[1]),e[2]!==void 0&&(C.tileHeight=e[2]),e[3]!==void 0&&(C.selectedTileX=e[3]),e[4]!==void 0&&(C.selectedTileY=e[4]),_=new Wt({props:C}),O.push(()=>B(_,"tileset",V)),O.push(()=>B(_,"tileWidth",te)),O.push(()=>B(_,"tileHeight",ne)),O.push(()=>B(_,"selectedTileX",j)),O.push(()=>B(_,"selectedTileY",z)),{c(){n=w("main"),t=w("div"),i=w("div"),Ce(l.$$.fragment),o=N(),h=w("div"),c=w("div"),Ce(u.$$.fragment),H=N(),b=w("div"),Ce(_.$$.fragment),y(c,"style",M=e[5]===0?"display: block":"display: none"),y(b,"style",S=e[5]===1?"display: block":"display: none"),T(i,"display","flex"),T(i,"flex-direction","column"),T(t,"display","flex"),T(t,"flex-direction","row"),T(t,"gap","16px")},m(d,K){re(d,n,K),f(n,t),f(t,i),Te(l,i,null),f(i,o),f(i,h),f(h,c),Te(u,c,null),f(h,H),f(h,b),Te(_,b,null),I=!0},p(d,[K]){const ge={};!s&&K&32&&(s=!0,ge.selected=d[5],Z(()=>s=!1)),l.$set(ge);const ie={};!v&&K&1&&(v=!0,ie.selectedTileset=d[0],Z(()=>v=!1)),!m&&K&2&&(m=!0,ie.tileWidth=d[1],Z(()=>m=!1)),!W&&K&4&&(W=!0,ie.tileHeight=d[2],Z(()=>W=!1)),!g&&K&8&&(g=!0,ie.selectedTileX=d[3],Z(()=>g=!1)),!Y&&K&16&&(Y=!0,ie.selectedTileY=d[4],Z(()=>Y=!1)),u.$set(ie),(!I||K&32&&M!==(M=d[5]===0?"display: block":"display: none"))&&y(c,"style",M);const le={};!G&&K&1&&(G=!0,le.tileset=d[0],Z(()=>G=!1)),!p&&K&2&&(p=!0,le.tileWidth=d[1],Z(()=>p=!1)),!L&&K&4&&(L=!0,le.tileHeight=d[2],Z(()=>L=!1)),!F&&K&8&&(F=!0,le.selectedTileX=d[3],Z(()=>F=!1)),!R&&K&16&&(R=!0,le.selectedTileY=d[4],Z(()=>R=!1)),_.$set(le),(!I||K&32&&S!==(S=d[5]===1?"display: block":"display: none"))&&y(b,"style",S)},i(d){I||(be(l.$$.fragment,d),be(u.$$.fragment,d),be(_.$$.fragment,d),I=!0)},o(d){We(l.$$.fragment,d),We(u.$$.fragment,d),We(_.$$.fragment,d),I=!1},d(d){d&&oe(n),ye(l),ye(u),ye(_)}}}function Et(e,n,t){let i,l,s,o,h,c=1;function u(p){c=p,t(5,c)}function v(p){i=p,t(0,i)}function m(p){l=p,t(1,l)}function W(p){s=p,t(2,s)}function g(p){o=p,t(3,o)}function Y(p){h=p,t(4,h)}function M(p){i=p,t(0,i)}function H(p){l=p,t(1,l)}function b(p){s=p,t(2,s)}function _(p){o=p,t(3,o)}function G(p){h=p,t(4,h)}return[i,l,s,o,h,c,u,v,m,W,g,Y,M,H,b,_,G]}class Ht extends Xe{constructor(n){super(),Ye(this,n,Et,Ct,we,{})}}new Ht({target:document.getElementById("app")});