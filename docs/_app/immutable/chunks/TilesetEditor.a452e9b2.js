import{s as An,i as On,r as Ln,b as Cn}from"./scheduler.9c0c050a.js";import{S as xn,i as Vn,g as a,s as v,r as W,h as o,j as E,c as y,y as Me,f as k,u as K,k as c,l as u,A as S,z as Re,a as Pn,x as r,E as Dn,v as H,B as p,F as ce,d as R,t as Y,w as X,C as Wn,G as Kn}from"./index.0d064376.js";import{I as j}from"./Icon.7d205c32.js";import{T as Sn,P as Ye,a as Nn,d as Hn}from"./Tileset.96cf75fd.js";const Rn=!0;function Mn(n){return(n==null?void 0:n.length)!==void 0?n:Array.from(n)}const Yn=Rn;function Un(n,f,l){const e=n.slice();return e[6]=f[l],e}function Bn(n){let f,l,e;return{c(){f=a("button"),this.h()},l(L){f=o(L,"BUTTON",{class:!0}),E(f).forEach(k),this.h()},h(){c(f,"class","palette"),u(f,"background-color",n[6])},m(L,m){Pn(L,f,m),l||(e=p(f,"click",n[12]),l=!0)},p(L,m){m[0]&1&&u(f,"background-color",L[6])},d(L){L&&k(f),l=!1,e()}}}function Xn(n){let f,l,e,L,m,h,Te="Name",Xe,i,P,x,J,Ue="Width",he,w,z,M,te,nt="Height",ut,F,ft,ne,ke,yt="Margin",lt,q,dt,le,U,Tt="Spacing",je,G,ct,se,we,kt="Type",ht,Q,ue,wt="Square",fe,Et="Hex",mt,me,Ee,st,pt,g,pe,Ie,gt,re,Ce,rt,bt,ie,De,it,_t,ae,t,T,C,N,A,Se,oe,B,Z,Ne,vt,ge,ze,Rt,$,It,Ct,Yt,Be,Fe,Dt,Xt,Pe,qe,St,jt,Ae,Ge,Nt,zt,Oe,Ze,Mt,Ft,Le,Je,Ut,qt,xe,Qe,Bt,Gt,Ve,$e,Pt,Zt,We,be,Jt,at,ee,Qt,V,_e,et,an="Tags",$t,de,en,Ke,At,tn,ve,nn,ye,D,ln,on;Ee=new j({props:{name:"refresh"}}),Ie=new j({props:{name:"openSelectHandGesture"}}),Ce=new j({props:{name:"editPencil"}}),De=new j({props:{name:"erase"}}),t=new j({props:{name:"drag"}}),A=new j({props:{name:"flipHoriz"}}),Z=new j({props:{name:"flipVert"}}),ze=new j({props:{name:"cropRotateTl"}}),Fe=new j({props:{name:"undo"}}),qe=new j({props:{name:"redo"}}),Ge=new j({props:{name:"deleteCircle"}}),Ze=new j({props:{name:"cut"}}),Je=new j({props:{name:"copy"}}),Qe=new j({props:{name:"pasteClipboard"}}),$e=new j({props:{name:"saveFloppyDisk"}});let ot=Mn(n[0].palette()),O=[];for(let s=0;s<ot.length;s+=1)O[s]=Bn(Un(n,ot,s));return{c(){f=a("div"),l=a("div"),e=a("input"),L=v(),m=a("div"),h=a("label"),h.textContent=Te,Xe=v(),i=a("input"),P=v(),x=a("div"),J=a("label"),J.textContent=Ue,he=v(),w=a("input"),z=v(),M=a("div"),te=a("label"),te.textContent=nt,ut=v(),F=a("input"),ft=v(),ne=a("div"),ke=a("label"),ke.textContent=yt,lt=v(),q=a("input"),dt=v(),le=a("div"),U=a("label"),U.textContent=Tt,je=v(),G=a("input"),ct=v(),se=a("div"),we=a("label"),we.textContent=kt,ht=v(),Q=a("select"),ue=a("option"),ue.textContent=wt,fe=a("option"),fe.textContent=Et,mt=v(),me=a("button"),W(Ee.$$.fragment),pt=v(),g=a("div"),pe=a("button"),W(Ie.$$.fragment),gt=v(),re=a("button"),W(Ce.$$.fragment),bt=v(),ie=a("button"),W(De.$$.fragment),_t=v(),ae=a("button"),W(t.$$.fragment),C=v(),N=a("button"),W(A.$$.fragment),oe=v(),B=a("button"),W(Z.$$.fragment),vt=v(),ge=a("button"),W(ze.$$.fragment),Rt=v(),$=a("input"),Yt=v(),Be=a("button"),W(Fe.$$.fragment),Xt=v(),Pe=a("button"),W(qe.$$.fragment),jt=v(),Ae=a("button"),W(Ge.$$.fragment),zt=v(),Oe=a("button"),W(Ze.$$.fragment),Ft=v(),Le=a("button"),W(Je.$$.fragment),qt=v(),xe=a("button"),W(Qe.$$.fragment),Gt=v(),Ve=a("button"),W($e.$$.fragment),Zt=v(),We=a("div"),be=a("input"),Jt=v(),at=a("div"),ee=a("canvas"),Qt=v(),V=a("div"),_e=a("div"),et=a("label"),et.textContent=an,$t=v(),de=a("input"),en=v(),Ke=a("input"),tn=v(),ve=a("input"),nn=v(),ye=a("div");for(let s=0;s<O.length;s+=1)O[s].c();this.h()},l(s){f=o(s,"DIV",{style:!0});var d=E(f);l=o(d,"DIV",{style:!0});var b=E(l);e=o(b,"INPUT",{type:!0,accept:!0}),L=y(b),m=o(b,"DIV",{style:!0});var tt=E(m);h=o(tt,"LABEL",{for:!0,"data-svelte-h":!0}),Me(h)!=="svelte-bs9sy6"&&(h.textContent=Te),Xe=y(tt),i=o(tt,"INPUT",{name:!0,type:!0}),tt.forEach(k),P=y(b),x=o(b,"DIV",{style:!0});var Ot=E(x);J=o(Ot,"LABEL",{for:!0,"data-svelte-h":!0}),Me(J)!=="svelte-17m14b6"&&(J.textContent=Ue),he=y(Ot),w=o(Ot,"INPUT",{name:!0,type:!0,min:!0,max:!0,style:!0}),Ot.forEach(k),z=y(b),M=o(b,"DIV",{style:!0});var Lt=E(M);te=o(Lt,"LABEL",{for:!0,"data-svelte-h":!0}),Me(te)!=="svelte-1bbixbe"&&(te.textContent=nt),ut=y(Lt),F=o(Lt,"INPUT",{name:!0,type:!0,min:!0,max:!0,style:!0}),Lt.forEach(k),ft=y(b),ne=o(b,"DIV",{style:!0});var xt=E(ne);ke=o(xt,"LABEL",{for:!0,"data-svelte-h":!0}),Me(ke)!=="svelte-h0yole"&&(ke.textContent=yt),lt=y(xt),q=o(xt,"INPUT",{name:!0,type:!0,min:!0,max:!0,style:!0}),xt.forEach(k),dt=y(b),le=o(b,"DIV",{style:!0});var Vt=E(le);U=o(Vt,"LABEL",{for:!0,"data-svelte-h":!0}),Me(U)!=="svelte-13gacwk"&&(U.textContent=Tt),je=y(Vt),G=o(Vt,"INPUT",{name:!0,type:!0,min:!0,max:!0,style:!0}),Vt.forEach(k),ct=y(b),se=o(b,"DIV",{style:!0});var Wt=E(se);we=o(Wt,"LABEL",{for:!0,"data-svelte-h":!0}),Me(we)!=="svelte-15475si"&&(we.textContent=kt),ht=y(Wt),Q=o(Wt,"SELECT",{name:!0});var sn=E(Q);ue=o(sn,"OPTION",{"data-svelte-h":!0}),Me(ue)!=="svelte-bkgndu"&&(ue.textContent=wt),fe=o(sn,"OPTION",{"data-svelte-h":!0}),Me(fe)!=="svelte-77owgo"&&(fe.textContent=Et),sn.forEach(k),Wt.forEach(k),mt=y(b),me=o(b,"BUTTON",{});var un=E(me);K(Ee.$$.fragment,un),un.forEach(k),pt=y(b),g=o(b,"DIV",{style:!0});var I=E(g);pe=o(I,"BUTTON",{});var fn=E(pe);K(Ie.$$.fragment,fn),fn.forEach(k),gt=y(I),re=o(I,"BUTTON",{});var dn=E(re);K(Ce.$$.fragment,dn),dn.forEach(k),bt=y(I),ie=o(I,"BUTTON",{});var cn=E(ie);K(De.$$.fragment,cn),cn.forEach(k),_t=y(I),ae=o(I,"BUTTON",{});var hn=E(ae);K(t.$$.fragment,hn),hn.forEach(k),C=y(I),N=o(I,"BUTTON",{});var mn=E(N);K(A.$$.fragment,mn),mn.forEach(k),oe=y(I),B=o(I,"BUTTON",{});var pn=E(B);K(Z.$$.fragment,pn),pn.forEach(k),vt=y(I),ge=o(I,"BUTTON",{});var Kt=E(ge);K(ze.$$.fragment,Kt),Rt=y(Kt),$=o(Kt,"INPUT",{type:!0,min:!0,max:!0}),Kt.forEach(k),Yt=y(I),Be=o(I,"BUTTON",{});var gn=E(Be);K(Fe.$$.fragment,gn),gn.forEach(k),Xt=y(I),Pe=o(I,"BUTTON",{});var bn=E(Pe);K(qe.$$.fragment,bn),bn.forEach(k),jt=y(I),Ae=o(I,"BUTTON",{});var _n=E(Ae);K(Ge.$$.fragment,_n),_n.forEach(k),zt=y(I),Oe=o(I,"BUTTON",{});var vn=E(Oe);K(Ze.$$.fragment,vn),vn.forEach(k),Ft=y(I),Le=o(I,"BUTTON",{});var yn=E(Le);K(Je.$$.fragment,yn),yn.forEach(k),qt=y(I),xe=o(I,"BUTTON",{});var Tn=E(xe);K(Qe.$$.fragment,Tn),Tn.forEach(k),Gt=y(I),Ve=o(I,"BUTTON",{});var kn=E(Ve);K($e.$$.fragment,kn),kn.forEach(k),I.forEach(k),b.forEach(k),Zt=y(d),We=o(d,"DIV",{style:!0});var wn=E(We);be=o(wn,"INPUT",{name:!0,type:!0,placeholder:!0}),wn.forEach(k),Jt=y(d),at=o(d,"DIV",{class:!0});var En=E(at);ee=o(En,"CANVAS",{style:!0}),E(ee).forEach(k),En.forEach(k),Qt=y(d),V=o(d,"DIV",{style:!0});var He=E(V);_e=o(He,"DIV",{style:!0});var Ht=E(_e);et=o(Ht,"LABEL",{for:!0,"data-svelte-h":!0}),Me(et)!=="svelte-e2ajgy"&&(et.textContent=an),$t=y(Ht),de=o(Ht,"INPUT",{name:!0,type:!0}),Ht.forEach(k),en=y(He),Ke=o(He,"INPUT",{type:!0,name:!0}),tn=y(He),ve=o(He,"INPUT",{type:!0,min:!0,max:!0}),nn=y(He),ye=o(He,"DIV",{style:!0});var In=E(ye);for(let rn=0;rn<O.length;rn+=1)O[rn].l(In);In.forEach(k),He.forEach(k),d.forEach(k),this.h()},h(){c(e,"type","file"),c(e,"accept","image/png"),c(h,"for","name"),c(i,"name","name"),c(i,"type","text"),u(m,"display","flex"),u(m,"flex-direction","column"),u(m,"align-items","start"),c(J,"for","width"),c(w,"name","width"),c(w,"type","number"),c(w,"min","1"),c(w,"max","64"),u(w,"max-width","4em"),u(x,"display","flex"),u(x,"flex-direction","column"),u(x,"align-items","start"),c(te,"for","height"),c(F,"name","height"),c(F,"type","number"),c(F,"min","1"),c(F,"max","64"),u(F,"max-width","4em"),u(M,"display","flex"),u(M,"flex-direction","column"),u(M,"align-items","start"),c(ke,"for","margin"),c(q,"name","margin"),c(q,"type","number"),c(q,"min","1"),c(q,"max","64"),u(q,"max-width","4em"),u(ne,"display","flex"),u(ne,"flex-direction","column"),u(ne,"align-items","start"),c(U,"for","spacing"),c(G,"name","spacing"),c(G,"type","number"),c(G,"min","1"),c(G,"max","64"),u(G,"max-width","4em"),u(le,"display","flex"),u(le,"flex-direction","column"),u(le,"align-items","start"),c(we,"for","type"),ue.__value="square",S(ue,ue.__value),fe.__value="hex",S(fe,fe.__value),c(Q,"name","type"),n[0].type===void 0&&On(()=>n[29].call(Q)),u(se,"display","flex"),u(se,"flex-direction","column"),u(se,"align-items","start"),me.disabled=st=!n[0].img,Re(pe,"active",n[4]===_.Select),re.disabled=rt=!n[0].selectedTiles.length,Re(re,"active",n[4]===_.Edit),ie.disabled=it=!n[0].selectedTiles.length,Re(ie,"active",n[4]===_.Erase),ae.disabled=T=!n[0].selectedTiles.length,Re(ae,"active",n[4]===_.Move),N.disabled=Se=!n[0].selectedTiles.length,B.disabled=Ne=!n[0].selectedTiles.length,c($,"type","number"),c($,"min","0"),c($,"max","90"),$.disabled=It=n[0].selectedTiles.length!==1,ge.disabled=Ct=!n[0].selectedTiles.length,Be.disabled=Dt=n[0].undoer.undoStack.length===0,Pe.disabled=St=n[0].undoer.redoStack.length===0,Ae.disabled=Nt=!n[0].selectedTiles.length,Oe.disabled=Mt=!n[0].selectedTiles.length,Le.disabled=Ut=!n[0].selectedTiles.length,xe.disabled=Bt=!n[0].copyBuffer.length||!n[0].selectedTiles.length,Ve.disabled=Pt=!n[0].img,u(g,"margin-left","auto"),u(g,"display","flex"),u(g,"gap","8px"),u(l,"display","flex"),u(l,"gap","8px"),u(l,"align-items","end"),u(l,"flex-wrap","wrap"),c(be,"name","filter"),c(be,"type","text"),c(be,"placeholder","Filter"),u(We,"display","flex"),u(We,"gap","8px"),u(We,"align-items","end"),u(ee,"position","absolute"),c(at,"class","canvas svelte-16cu0gi"),c(et,"for","tags"),c(de,"name","tags"),c(de,"type","text"),u(_e,"display","flex"),u(_e,"flex-direction","column"),u(_e,"align-items","start"),c(Ke,"type","color"),c(Ke,"name","color"),Ke.value=At=n[6].substring(0,Math.min(n[6].length,7)),c(ve,"type","range"),c(ve,"min","0"),c(ve,"max","255"),u(ye,"display","flex"),u(ye,"flex-direction","row"),u(ye,"flex-wrap","wrap"),u(ye,"gap","12px"),u(V,"display","flex"),u(V,"flex-direction","row"),u(V,"gap","8px"),u(V,"align-items","start"),u(f,"display","flex"),u(f,"flex-direction","column"),u(f,"gap","8px"),u(f,"flex-grow","1"),u(f,"max-width",n[1])},m(s,d){Pn(s,f,d),r(f,l),r(l,e),r(l,L),r(l,m),r(m,h),r(m,Xe),r(m,i),S(i,n[0].name),r(l,P),r(l,x),r(x,J),r(x,he),r(x,w),S(w,n[0].tilewidth),r(l,z),r(l,M),r(M,te),r(M,ut),r(M,F),S(F,n[0].tileheight),r(l,ft),r(l,ne),r(ne,ke),r(ne,lt),r(ne,q),S(q,n[0].margin),r(l,dt),r(l,le),r(le,U),r(le,je),r(le,G),S(G,n[0].spacing),r(l,ct),r(l,se),r(se,we),r(se,ht),r(se,Q),r(Q,ue),r(Q,fe),Dn(Q,n[0].type,!0),r(l,mt),r(l,me),H(Ee,me,null),r(l,pt),r(l,g),r(g,pe),H(Ie,pe,null),r(g,gt),r(g,re),H(Ce,re,null),r(g,bt),r(g,ie),H(De,ie,null),r(g,_t),r(g,ae),H(t,ae,null),r(g,C),r(g,N),H(A,N,null),r(g,oe),r(g,B),H(Z,B,null),r(g,vt),r(g,ge),H(ze,ge,null),r(ge,Rt),r(ge,$),S($,n[10]),r(g,Yt),r(g,Be),H(Fe,Be,null),r(g,Xt),r(g,Pe),H(qe,Pe,null),r(g,jt),r(g,Ae),H(Ge,Ae,null),r(g,zt),r(g,Oe),H(Ze,Oe,null),r(g,Ft),r(g,Le),H(Je,Le,null),r(g,qt),r(g,xe),H(Qe,xe,null),r(g,Gt),r(g,Ve),H($e,Ve,null),r(f,Zt),r(f,We),r(We,be),S(be,n[3]),r(f,Jt),r(f,at),r(at,ee),n[47](ee),r(f,Qt),r(f,V),r(V,_e),r(_e,et),r(_e,$t),r(_e,de),S(de,n[8]),n[51](de),r(V,en),r(V,Ke),r(V,tn),r(V,ve),S(ve,n[5]),r(V,nn),r(V,ye);for(let b=0;b<O.length;b+=1)O[b]&&O[b].m(ye,null);D=!0,ln||(on=[p(window,"keydown",n[20]),p(e,"change",n[17]),p(i,"input",n[24]),p(w,"input",n[25]),p(F,"input",n[26]),p(q,"input",n[27]),p(G,"input",n[28]),p(Q,"change",n[29]),p(me,"click",n[30]),p(pe,"click",n[31]),p(re,"click",n[32]),p(ie,"click",n[33]),p(ae,"click",n[34]),p(N,"click",n[35]),p(B,"click",n[36]),p($,"input",n[37]),p($,"click",Fn),p(ge,"click",n[38]),p(Be,"click",n[39]),p(Pe,"click",n[40]),p(Ae,"click",n[41]),p(Oe,"click",n[42]),p(Le,"click",n[43]),p(xe,"click",n[44]),p(Ve,"click",n[45]),p(be,"input",n[46]),p(ee,"wheel",n[11]),p(ee,"pointerup",n[15]),p(ee,"pointerdown",n[13]),p(ee,"pointermove",n[14]),p(ee,"pointercancel",n[16]),p(ee,"pointerenter",n[48]),p(ee,"pointerleave",n[49]),p(de,"change",n[18]),p(de,"input",n[50]),p(Ke,"change",n[12]),p(ve,"change",n[52]),p(ve,"input",n[52])],ln=!0)},p(s,d){if(d[0]&1&&i.value!==s[0].name&&S(i,s[0].name),d[0]&1&&ce(w.value)!==s[0].tilewidth&&S(w,s[0].tilewidth),d[0]&1&&ce(F.value)!==s[0].tileheight&&S(F,s[0].tileheight),d[0]&1&&ce(q.value)!==s[0].margin&&S(q,s[0].margin),d[0]&1&&ce(G.value)!==s[0].spacing&&S(G,s[0].spacing),d[0]&1&&Dn(Q,s[0].type),(!D||d[0]&1&&st!==(st=!s[0].img))&&(me.disabled=st),(!D||d[0]&16)&&Re(pe,"active",s[4]===_.Select),(!D||d[0]&1&&rt!==(rt=!s[0].selectedTiles.length))&&(re.disabled=rt),(!D||d[0]&16)&&Re(re,"active",s[4]===_.Edit),(!D||d[0]&1&&it!==(it=!s[0].selectedTiles.length))&&(ie.disabled=it),(!D||d[0]&16)&&Re(ie,"active",s[4]===_.Erase),(!D||d[0]&1&&T!==(T=!s[0].selectedTiles.length))&&(ae.disabled=T),(!D||d[0]&16)&&Re(ae,"active",s[4]===_.Move),(!D||d[0]&1&&Se!==(Se=!s[0].selectedTiles.length))&&(N.disabled=Se),(!D||d[0]&1&&Ne!==(Ne=!s[0].selectedTiles.length))&&(B.disabled=Ne),(!D||d[0]&1&&It!==(It=s[0].selectedTiles.length!==1))&&($.disabled=It),d[0]&1024&&ce($.value)!==s[10]&&S($,s[10]),(!D||d[0]&1&&Ct!==(Ct=!s[0].selectedTiles.length))&&(ge.disabled=Ct),(!D||d[0]&1&&Dt!==(Dt=s[0].undoer.undoStack.length===0))&&(Be.disabled=Dt),(!D||d[0]&1&&St!==(St=s[0].undoer.redoStack.length===0))&&(Pe.disabled=St),(!D||d[0]&1&&Nt!==(Nt=!s[0].selectedTiles.length))&&(Ae.disabled=Nt),(!D||d[0]&1&&Mt!==(Mt=!s[0].selectedTiles.length))&&(Oe.disabled=Mt),(!D||d[0]&1&&Ut!==(Ut=!s[0].selectedTiles.length))&&(Le.disabled=Ut),(!D||d[0]&1&&Bt!==(Bt=!s[0].copyBuffer.length||!s[0].selectedTiles.length))&&(xe.disabled=Bt),(!D||d[0]&1&&Pt!==(Pt=!s[0].img))&&(Ve.disabled=Pt),d[0]&8&&be.value!==s[3]&&S(be,s[3]),d[0]&256&&de.value!==s[8]&&S(de,s[8]),(!D||d[0]&64&&At!==(At=s[6].substring(0,Math.min(s[6].length,7))))&&(Ke.value=At),d[0]&32&&S(ve,s[5]),d[0]&4097){ot=Mn(s[0].palette());let b;for(b=0;b<ot.length;b+=1){const tt=Un(s,ot,b);O[b]?O[b].p(tt,d):(O[b]=Bn(tt),O[b].c(),O[b].m(ye,null))}for(;b<O.length;b+=1)O[b].d(1);O.length=ot.length}d[0]&2&&u(f,"max-width",s[1])},i(s){D||(R(Ee.$$.fragment,s),R(Ie.$$.fragment,s),R(Ce.$$.fragment,s),R(De.$$.fragment,s),R(t.$$.fragment,s),R(A.$$.fragment,s),R(Z.$$.fragment,s),R(ze.$$.fragment,s),R(Fe.$$.fragment,s),R(qe.$$.fragment,s),R(Ge.$$.fragment,s),R(Ze.$$.fragment,s),R(Je.$$.fragment,s),R(Qe.$$.fragment,s),R($e.$$.fragment,s),D=!0)},o(s){Y(Ee.$$.fragment,s),Y(Ie.$$.fragment,s),Y(Ce.$$.fragment,s),Y(De.$$.fragment,s),Y(t.$$.fragment,s),Y(A.$$.fragment,s),Y(Z.$$.fragment,s),Y(ze.$$.fragment,s),Y(Fe.$$.fragment,s),Y(qe.$$.fragment,s),Y(Ge.$$.fragment,s),Y(Ze.$$.fragment,s),Y(Je.$$.fragment,s),Y(Qe.$$.fragment,s),Y($e.$$.fragment,s),D=!1},d(s){s&&k(f),X(Ee),X(Ie),X(Ce),X(De),X(t),X(A),X(Z),X(ze),X(Fe),X(qe),X(Ge),X(Ze),X(Je),X(Qe),X($e),n[47](null),n[51](null),Wn(O,s),ln=!1,Ln(on)}}}var _=(n=>(n[n.Select=0]="Select",n[n.Edit=1]="Edit",n[n.Erase=2]="Erase",n[n.Move=3]="Move",n))(_||{});function jn(n){if(n.startsWith("#")){const f=n.match(/^#(\w{2})(\w{2})(\w{2})(\w{2})?$/);return f?[parseInt(f[1],16),parseInt(f[2],16),parseInt(f[3],16),parseInt(f[4],16)||255]:void 0}else if(n.startsWith("rgb")){const f=n.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*(0\.\d+)?\)$/);return f?[parseInt(f[1]),parseInt(f[2]),parseInt(f[3]),Math.round(parseFloat(f[4])*255)||255]:void 0}}function zn(n){const[f,l,e,L]=n;function m(h){return isNaN(h)?"":("0"+h.toString(16)).slice(-2)}return"#"+m(f)+m(l)+m(e)+m(L)}const Fn=n=>n.stopPropagation();function qn(n,f,l){let{tileset:e=new Sn}=f,{maxWidth:L=void 0}=f,m,h=2,Te=!1,Xe=!1,i=new Ye(0,0),P=new Ye(-1,-1),x,J="",Ue,he="",w=_.Select,z="#ffffff",M=255,te=90;function nt(t){return new Ye((t.x-i.x)/h,(t.y-i.y)/h)}function ut(t){return new Ye(t.x*h+i.x,t.y*h+i.y)}function F(){var N,A,Se;if(!m)return;const t=m.getContext("2d");if(!t)return;const T=(((N=m.parentElement)==null?void 0:N.scrollWidth)||0)-4,C=(((A=m.parentElement)==null?void 0:A.scrollHeight)||0)-4;if(l(7,m.width=T,m),l(7,m.height=C,m),t.imageSmoothingEnabled=!1,t.resetTransform(),t.clearRect(0,0,T,C),t.setTransform(h,0,0,h,i.x,i.y),e.tiles.length>0)for(let oe=0;oe<e.tiles.length;oe++){const B=e.tiles[oe];if(!B.img)continue;const Z=e.tileToImgCoords(B.loc),Ne=ut(Z);Ne.x<-e.tilewidth*h||Ne.y<-e.tileheight*h||Ne.x>T||Ne.y>C||(he===""||(Se=e.tiledata.get(B.loc,"tags",[]))!=null&&Se.some(vt=>vt.startsWith(he)))&&t.drawImage(B.img,0,0,e.tilewidth,e.tileheight,Z.x,Z.y,e.tilewidth,e.tileheight)}else if(e.img)t.drawImage(e.img,0,0);else{je();return}if(t.lineWidth=1/h,Te)if(w===_.Select){const oe=e.tileToImgCoords(e.imgCoordsToTile(P));t.strokeStyle="#ffffffaa",Nn(t,oe.x,oe.y,e.tilewidth,e.tileheight)}else(w===_.Edit||w===_.Erase)&&(t.fillStyle=z,w===_.Erase&&(t.fillStyle="white"),t.fillRect(Math.floor(P.x),Math.floor(P.y),1,1));t.strokeStyle="white",e.selectedTiles.forEach(oe=>{const B=e.tileToImgCoords(oe);if(Nn(t,B.x,B.y,e.tilewidth,e.tileheight),(w===_.Edit||w===_.Erase||w===_.Move)&&e.type==="hex"){const Z=e.radius();Hn(t,B.x+.5*e.tilewidth,B.y+e.tileheight-Z,Z)}}),e.rendering&&je()}function ft(t){const T=h;t.deltaY<0?l(21,h*=1.1):t.deltaY>0&&l(21,h*=.9),l(21,h=Math.min(Math.max(.05,h),16)),l(22,i.x=-h*(t.offsetX-i.x)/T+t.offsetX,i),l(22,i.y=-h*(t.offsetY-i.y)/T+t.offsetY,i)}function ne(t){let T;if(t.target instanceof HTMLButtonElement)T=t.target.style.backgroundColor;else if(t.target instanceof HTMLInputElement)T=t.target.value;else return;const C=jn(T);C&&(l(6,z=zn(C)),l(5,M=C[3]),U(_.Edit))}function ke(t){if(l(23,P=nt(new Ye(t.offsetX,t.offsetY))),x=P.clone(),Xe=!0,w===_.Edit)e.undoer.begin(),e.setPixel(P.floor(),parseInt(z.slice(1,3),16),parseInt(z.slice(3,5),16),parseInt(z.slice(5,7),16),Math.round(M)),l(0,e);else if(w===_.Erase)e.undoer.begin(),e.setPixel(P.floor(),0,0,0,0),l(0,e);else if(w===_.Select){const T=nt(new Ye(t.offsetX,t.offsetY));if(!e.img||T.x<0||T.x>=e.img.width||T.y<0||T.y>=e.img.height)return;const C=e.imgCoordsToTile(T);t.shiftKey?e.toggleSelectedTile(C):(e.setSelectedTile(C),Ue&&Ue.focus()),l(8,J=Array.from(e.selectionTags().values()).join(",")),l(0,e)}}function yt(t){if(l(23,P=nt(new Ye(t.offsetX,t.offsetY))),Xe){if(w===_.Edit)e.setPixel(P.floor(),parseInt(z.slice(1,3),16),parseInt(z.slice(3,5),16),parseInt(z.slice(5,7),16),Math.round(M)),l(0,e);else if(w===_.Erase)e.setPixel(P.floor(),0,0,0,0),l(0,e);else if(w===_.Select&&x!==void 0){e.clearSelectedTiles();let T=e.imgCoordsToTile(x),C=e.imgCoordsToTile(P);for(let N=Math.min(T.x,C.x);N<=Math.max(T.x,C.x);N++)for(let A=Math.min(T.y,C.y);A<=Math.max(T.y,C.y);A++)e.toggleSelectedTile(new Ye(N,A));l(0,e)}}else t.ctrlKey&&(l(22,i.x+=t.movementX,i),l(22,i.y+=t.movementY,i))}function lt(){Xe=!1,x=void 0,e.undoer.end(),l(0,e)}function q(t){lt()}function dt(t){if(t.target===null)return;const T=t.target.files;if(T===null)return;const C=T[0];C&&Sn.from(C).then(N=>{l(0,e=N),l(22,i.x=0,i),l(22,i.y=0,i),l(21,h=2)})}function le(t){const T=new Set(t.target.value.split(","));e.setSelectionTags(T),l(8,J=Array.from(e.selectionTags().values()).join(","))}function U(t){l(4,w=t)}function Tt(t){if(Te)switch(!0){case t.key==="s":U(_.Select),t.preventDefault();break;case t.key==="e":U(_.Erase),t.preventDefault();break;case t.key==="d":U(_.Edit),t.preventDefault();break;case t.key==="m":U(_.Move),t.preventDefault();break;case(t.key==="z"&&t.ctrlKey):e.undo(),l(0,e),t.preventDefault();break;case(t.key==="y"&&t.ctrlKey):e.redo(),l(0,e),t.preventDefault();break;case(t.key==="s"&&t.ctrlKey):e.download(),l(0,e),t.preventDefault();break;case(t.key==="x"&&t.ctrlKey):e.cut(),l(0,e),t.preventDefault();break;case(t.key==="c"&&t.ctrlKey):e.copy(),l(0,e),t.preventDefault();break;case(t.key==="v"&&t.ctrlKey):e.paste(),l(0,e),t.preventDefault();break;case(t.key==="Backspace"||t.key==="Delete"):e.clear(),l(0,e),t.preventDefault();break;case(t.key==="z"&&e.selectedTiles.length===1):const[T,C]=[(m==null?void 0:m.width)||0,(m==null?void 0:m.height)||0],N=Math.min(T,C)/Math.max(e.tilewidth,e.tileheight),A=e.tileToImgCoords(e.selectedTiles[0]);l(21,h=N);const Se=T/2-e.tilewidth*h/2;l(22,i.x=-A.x*h+Se,i),l(22,i.y=-A.y*h,i),t.preventDefault();break;case(t.key==="i"&&e.selectedTiles.length===1):e.setSelectedTile(e.selectedTiles[0].add(0,-1)),l(0,e),t.preventDefault();break;case(t.key==="k"&&e.selectedTiles.length===1):e.setSelectedTile(e.selectedTiles[0].add(0,1)),l(0,e),t.preventDefault();break;case(t.key==="j"&&e.selectedTiles.length===1):e.setSelectedTile(e.selectedTiles[0].add(-1,0)),l(0,e),t.preventDefault();break;case(t.key==="l"&&e.selectedTiles.length===1):e.setSelectedTile(e.selectedTiles[0].add(1,0)),l(0,e),t.preventDefault();break;case(t.key==="ArrowLeft"&&w===_.Move):e.move(-1,0),l(0,e),t.preventDefault();break;case(t.key==="ArrowRight"&&w===_.Move):e.move(1,0),l(0,e),t.preventDefault();break;case(t.key==="ArrowUp"&&w===_.Move):e.move(0,-1),l(0,e),t.preventDefault();break;case(t.key==="ArrowDown"&&w===_.Move):e.move(0,1),l(0,e),t.preventDefault();break;case t.key==="ArrowLeft":t.shiftKey?l(22,i.x+=h,i):l(22,i.x+=h*e.offsetWidth(),i),t.preventDefault();break;case t.key==="ArrowRight":t.shiftKey?l(22,i.x-=h,i):l(22,i.x-=h*e.offsetWidth(),i),t.preventDefault();break;case t.key==="ArrowUp":t.shiftKey?l(22,i.y+=h,i):l(22,i.y+=h*e.offsetHeight(),i),t.preventDefault();break;case t.key==="ArrowDown":t.shiftKey?l(22,i.y-=h,i):l(22,i.y-=h*e.offsetHeight(),i),t.preventDefault();break;case t.key==="Escape":e.clearSelectedTiles(),l(0,e),t.preventDefault();break}}function je(...t){e&&Yn&&requestAnimationFrame(F)}function G(){e.name=this.value,l(0,e)}function ct(){e.tilewidth=ce(this.value),l(0,e)}function se(){e.tileheight=ce(this.value),l(0,e)}function we(){e.margin=ce(this.value),l(0,e)}function kt(){e.spacing=ce(this.value),l(0,e)}function ht(){e.type=Kn(this),l(0,e)}const Q=()=>e.createTiles(),ue=()=>U(_.Select),wt=()=>U(_.Edit),fe=()=>U(_.Erase),Et=()=>U(_.Move),mt=()=>{e.flip("y"),l(0,e)},me=()=>{e.flip("x"),l(0,e)};function Ee(){te=ce(this.value),l(10,te)}const st=()=>{e.rotate(te),l(0,e)},pt=()=>{e.undo(),l(0,e)},g=()=>{e.redo(),l(0,e)},pe=()=>{e.clear(),l(0,e)},Ie=()=>{e.cut(),l(0,e)},gt=()=>{e.copy(),l(0,e)},re=()=>{e.paste(),l(0,e)},Ce=()=>e.download();function rt(){he=this.value,l(3,he)}function bt(t){Cn[t?"unshift":"push"](()=>{m=t,l(7,m)})}const ie=()=>{m&&m.focus(),l(2,Te=!0)},De=()=>{l(2,Te=!1)};function it(){J=this.value,l(8,J)}function _t(t){Cn[t?"unshift":"push"](()=>{Ue=t,l(9,Ue)})}function ae(){M=ce(this.value),l(5,M)}return n.$$set=t=>{"tileset"in t&&l(0,e=t.tileset),"maxWidth"in t&&l(1,L=t.maxWidth)},n.$$.update=()=>{n.$$.dirty[0]&14680189&&je(e,z,M,w,h,i,he,P,Te)},[e,L,Te,he,w,M,z,m,J,Ue,te,ft,ne,ke,yt,lt,q,dt,le,U,Tt,h,i,P,G,ct,se,we,kt,ht,Q,ue,wt,fe,Et,mt,me,Ee,st,pt,g,pe,Ie,gt,re,Ce,rt,bt,ie,De,it,_t,ae]}class $n extends xn{constructor(f){super(),Vn(this,f,qn,Xn,An,{tileset:0,maxWidth:1},null,[-1,-1])}}export{$n as T,Mn as e};