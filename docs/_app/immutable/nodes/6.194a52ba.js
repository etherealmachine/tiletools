import{s as b,n as f}from"../chunks/scheduler.9c0c050a.js";import{S as k,i as Q,g as _,h as g,j as U,f as m,l as u,a as y,t as A,b as C,d,p as R,k as h,B as v,r as w,u as Y,v as B,w as G}from"../chunks/index.0d064376.js";import{R as S,S as E}from"../chunks/RPGEngine.076532e1.js";import{T as H}from"../chunks/Tilemap.04daf4f8.js";function T(s){let e,n,t;return{c(){e=_("input"),this.h()},l(o){e=g(o,"INPUT",{type:!0,accept:!0}),this.h()},h(){h(e,"type","file"),h(e,"accept","image/png")},m(o,i){y(o,e,i),n||(t=v(e,"change",s[1]),n=!0)},p:f,i:f,o:f,d(o){o&&m(e),n=!1,t()}}}function $(s){let e,n;return e=new E({props:{engine:s[0]}}),{c(){w(e.$$.fragment)},l(t){Y(e.$$.fragment,t)},m(t,o){B(e,t,o),n=!0},p(t,o){const i={};o&1&&(i.engine=t[0]),e.$set(i)},i(t){n||(d(e.$$.fragment,t),n=!0)},o(t){A(e.$$.fragment,t),n=!1},d(t){G(e,t)}}}function x(s){let e,n,t,o;const i=[$,T],a=[];function c(r,l){return r[0]?0:1}return n=c(s),t=a[n]=i[n](s),{c(){e=_("div"),t.c(),this.h()},l(r){e=g(r,"DIV",{style:!0});var l=U(e);t.l(l),l.forEach(m),this.h()},h(){u(e,"display","flex"),u(e,"gap","16px"),u(e,"justify-content","space-between"),u(e,"width","100%")},m(r,l){y(r,e,l),a[n].m(e,null),o=!0},p(r,[l]){let p=n;n=c(r),n===p?a[n].p(r,l):(R(),A(a[p],1,1,()=>{a[p]=null}),C(),t=a[n],t?t.p(r,l):(t=a[n]=i[n](r),t.c()),d(t,1),t.m(e,null))},i(r){o||(d(t),o=!0)},o(r){A(t),o=!1},d(r){r&&m(e),a[n].d()}}}function D(s,e,n){let t;function o(i){if(i.target===null)return;const a=i.target.files;if(a===null)return;const c=a[0];H.from(c).then(r=>{console.log(r.tileset),n(0,t=new S({centerX:0,centerY:0,zoom:1},r)),t.addCharacter({name:"Player",token:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABqklEQVQY06WRMUhbURSGv0h8kBKetppGBRErWaoQqEWMtIttdBCUgpQM9k51ELfQyUUcyltEdIiLnZ4WOnTQgkNLDbhUiGAQmqE8aHTQ6yNFQYKKBq5LiYnviRHPdC/nP9/9/3OJxyLKMAwVj0UUgGEYijuUNxAeRAiBaYIRHlRCCAClZ+Yc4vGlA48DACClRAiBlBIpJQDtjV4HIDHSoK5DiirTNAGIRqMAhIamyoatlUn3CLntb2RONslZkpkvGx5AiZeP+fl9ldf9AwAkZz8CGjoai8NP1Hp3rdMBQDwWUXpmDuvQSwtgraT+dzTaHlYXdce9fgDSyTxVpYBXLzrxt/YU76GhqbIoudMCudMC+9lDdwcA9cEmdu0uWs5SJbm1G7+xintWmYN/9j5vJz6ztpwgz1UUsvOVOah72sPacsIhWu+uJT0WJPXGR9/Cb3cH4VAjhT+/3J/xXx1/jHbQBQR8NvrRRXmE85pmHjQ0OwF7O7fvYNuSHD/fIaidu8i0ypZYWnbWOdTU+oiAz64MAPDpw5YH4P30M5VO5gHQjy6K/Xdf/3ouAbr/hlXyQ9uGAAAAAElFTkSuQmCC",position:{x:0,y:0},health:{max:20,current:20},items:[{name:"Short Sword",damage:"1d6",skills:["Melee weapons"]}],controlled_by:"current_player"})})}return[t,o]}class N extends k{constructor(e){super(),Q(this,e,D,x,b,{})}}export{N as component};
