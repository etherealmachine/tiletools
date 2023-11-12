var W=Object.defineProperty;var Y=(i,t,o)=>t in i?W(i,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):i[t]=o;var v=(i,t,o)=>(Y(i,typeof t!="symbol"?t+"":t,o),o);import{s as V,n as P,r as j,o as B,b as G}from"./scheduler.9c0c050a.js";import{S as H,i as N,g as D,h as z,j as S,f as w,l as x,k as F,a as U,x as M,B as y}from"./index.0d064376.js";import{P as X,b as K}from"./Tileset.96cf75fd.js";function L(i){let t,o,n,a,f;return{c(){t=D("div"),o=D("div"),n=D("canvas"),this.h()},l(p){t=z(p,"DIV",{style:!0});var u=S(t);o=z(u,"DIV",{class:!0});var g=S(o);n=z(g,"CANVAS",{style:!0,tabindex:!0}),S(n).forEach(w),g.forEach(w),u.forEach(w),this.h()},h(){x(n,"position","absolute"),F(n,"tabindex","1"),F(o,"class","canvas svelte-16cu0gi"),x(t,"display","flex"),x(t,"flex-direction","column"),x(t,"flex-grow","1")},m(p,u){U(p,t,u),M(t,o),M(o,n),i[4](n),a||(f=[y(n,"wheel",i[1]),y(n,"pointerdown",O),y(n,"pointerup",J),y(n,"pointercancel",Q),y(n,"pointermove",Z),y(n,"keydown",i[2])],a=!0)},p:P,i:P,o:P,d(p){p&&w(t),i[4](null),a=!1,j(f)}}}function O(i){}function J(i){}function Q(i){}function Z(i){}function $(i,t,o){let{engine:n}=t,a;function f(){var E,q;if(!a){requestAnimationFrame(f);return}const e=a.getContext("2d");if(!e){requestAnimationFrame(f);return}const s=(((E=a.parentElement)==null?void 0:E.scrollWidth)||0)-4,m=(((q=a.parentElement)==null?void 0:q.scrollHeight)||0)-4;o(0,a.width=s,a),o(0,a.height=m,a),e.imageSmoothingEnabled=!1,e.resetTransform(),e.clearRect(0,0,s,m);const{camera:c,tilemap:l}=n;if(!l.tileset){requestAnimationFrame(f);return}const[_,b]=[l.tileset.tilewidth,l.tileset.tileheight];for(let r of n.characters)c&&r.name==="Player"&&(c.centerX=r.position.x*_,c.centerY=r.position.y*b);e.setTransform(c.zoom,0,0,c.zoom,s/2-c.centerX*c.zoom,m/2-c.centerY*c.zoom);for(let r of l.layers){if(!r.visible)continue;const h=Object.entries(r.tiles).sort((d,k)=>{const[R,I]=d[0].split(",").map(A=>parseInt(A)),[T,C]=k[0].split(",").map(A=>parseInt(A));return I===C?R-T:I-C});for(let[d,k]of h)l.tileset.drawTile(e,X.from(d),k)}for(let r of n.characters)if(typeof r.token=="string")new K("",{},r.token).bitmap().then(h=>{r.token=h});else if(r.token instanceof ImageBitmap){const[h,d]=[r.position.x*_,r.position.y*b];e.drawImage(r.token,h,d,_,b),e.fillStyle="red",e.fillRect(h,d-1,l.tileset.tilewidth*(r.health.current/r.health.max),1)}requestAnimationFrame(f)}function p(e){const{camera:s}=n;e.deltaY<0?s.zoom*=1.1:e.deltaY>0&&(s.zoom*=.9),s.zoom=Math.min(Math.max(.25,s.zoom),8)}function u(e){const s=n.characters.find(l=>l.name==="Player");if(!s)return;switch(s.position,!0){case e.key==="ArrowLeft":s.position.x--,e.preventDefault();break;case e.key==="ArrowRight":s.position.x++,e.preventDefault();break;case e.key==="ArrowUp":s.position.y--,e.preventDefault();break;case e.key==="ArrowDown":s.position.y++,e.preventDefault();break}const m=n.characters.find(l=>l.controlled_by==="current_player");if(!m)return;const c=n.tilemap.tiledata.filter("door").find(([l,_])=>m.position.x===l.x&&m.position.y===l.y);c&&(m.position=c[1].clone())}B(()=>{requestAnimationFrame(f)});function g(e){G[e?"unshift":"push"](()=>{a=e,o(0,a)})}return i.$$set=e=>{"engine"in e&&o(3,n=e.engine)},[a,p,u,n,g]}class ie extends H{constructor(t){super(),N(this,t,$,L,V,{engine:3})}}class re{constructor(t,o){v(this,"camera");v(this,"tilemap");v(this,"characters",[]);this.camera=t,this.tilemap=o}addCharacter(t){this.characters.push(t)}}export{re as R,ie as S};
