!function(t,n){"object"==typeof exports&&"object"==typeof module?module.exports=n():"function"==typeof define&&define.amd?define([],n):"object"==typeof exports?exports.VueCollision=n():t.VueCollision=n()}(this,function(){return function(t){function n(i){if(e[i])return e[i].exports;var r=e[i]={i:i,l:!1,exports:{}};return t[i].call(r.exports,r,r.exports,n),r.l=!0,r.exports}var e={};return n.m=t,n.c=e,n.i=function(t){return t},n.d=function(t,n,e){Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:e})},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},n.p="",n(n.s=2)}([function(t,n,e){var i,r,o;!function(e,u){r=[],i=u,o="function"==typeof i?i.apply(n,r):i,!(void 0!==o&&(t.exports=o))}(this,function(){"use strict";var t="0.5.2",n=function(t,n){for(var e=1;n--;)e*=t--;return e},e=function(t,e){return e>t?0:n(t,e)/n(e,e)},i=function(t){return n(t,t)},r=function(t,n){var e=1;if(n)e=i(n);else{for(n=1;e<t;e*=++n);e>t&&(e/=n--)}for(var r=[0];n;e/=n--)r[n]=Math.floor(t/e),t%=e;return r},o=function(t,n){Object.keys(n).forEach(function(e){Object.defineProperty(t,e,{value:n[e],configurable:"next"==e})})},u=function(t,n){Object.defineProperty(t,n,{writable:!0})},c=function(t){var n,e=[];for(this.init();n=this.next();)e.push(t?t(n):n);return this.init(),e},l={toArray:c,map:c,forEach:function(t){var n;for(this.init();n=this.next();)t(n);this.init()},filter:function(t){var n,e=[];for(this.init();n=this.next();)t(n)&&e.push(n);return this.init(),e},lazyMap:function(t){return this._lazyMap=t,this},lazyFilter:function(t){if(Object.defineProperty(this,"next",{writable:!0}),"function"!=typeof t)this.next=this._next;else{"function"!=typeof this._next&&(this._next=this.next);var n=this._next.bind(this);this.next=function(){for(var e;e=n();)if(t(e))return e;return e}.bind(this)}return Object.defineProperty(this,"next",{writable:!1}),this}},f=function(t,n){var e=1<<t.length,i=function(){return e},r=Object.create(t.slice(),{length:{get:i}});return u(r,"index"),o(r,{valueOf:i,init:function(){r.index=0},nth:function(t){if(!(t>=e)){for(var n=0,i=[];t;t>>>=1,n++)1&t&&i.push(this[n]);return"function"==typeof r._lazyMap?r._lazyMap(i):i}},next:function(){return this.nth(this.index++)}}),o(r,l),r.init(),"function"==typeof n?r.map(n):r},a=function(t){var n=t&-t,e=t+n,i=e&-e,r=(i/n>>1)-1;return e|r},s=function(t,n,i){if(n||(n=t.length),n<1)throw new RangeError;if(n>t.length)throw new RangeError;var r=(1<<n)-1,c=e(t.length,n),f=1<<t.length,s=function(){return c},h=Object.create(t.slice(),{length:{get:s}});return u(h,"index"),o(h,{valueOf:s,init:function(){this.index=r},next:function(){if(!(this.index>=f)){for(var t=0,n=this.index,e=[];n;n>>>=1,t++)1&n&&(e[e.length]=this[t]);return this.index=a(this.index),"function"==typeof h._lazyMap?h._lazyMap(e):e}}}),o(h,l),h.init(),"function"==typeof i?h.map(i):h},h=function(t,n){var e=t,i=n,r=0;for(r=e.length-1;r>=0&&1==e[r];r--)i--;if(0==i){e[e.length]=1;for(var o=e.length-2;o>=0;o--)e[o]=o<n-1?1:0}else{for(var u=-1,c=-1,r=0;r<e.length;r++)if(0==e[r]&&u!=-1&&(c=r),1==e[r]&&(u=r),c!=-1&&u!=-1){e[c]=1,e[u]=0;break}i=n;for(var r=e.length-1;r>=u;r--)1==e[r]&&i--;for(var r=0;r<u;r++)e[r]=r<i?1:0}return e},d=function(t){for(var n=[],e=0;e<t;e++)n[e]=1;return n[0]=1,n},p=function(t,n,i){if(n||(n=t.length),n<1)throw new RangeError;if(n>t.length)throw new RangeError;var r=d(n),c=e(t.length,n),f=t.length,a=function(){return c},s=Object.create(t.slice(),{length:{get:a}});return u(s,"index"),o(s,{valueOf:a,init:function(){this.index=r.concat()},next:function(){if(!(this.index.length>f)){for(var t=0,e=this.index,i=[],r=0;r<e.length;r++,t++)e[r]&&(i[i.length]=this[t]);return h(this.index,n),"function"==typeof s._lazyMap?s._lazyMap(i):i}}}),o(s,l),s.init(),"function"==typeof i?s.map(i):s},v=function(t){var n=t.slice(),e=i(n.length);return n.index=0,n.next=function(){if(!(this.index>=e)){for(var t=this.slice(),i=r(this.index,this.length),o=[],u=this.length-1;u>=0;--u)o.push(t.splice(i[u],1)[0]);return this.index++,"function"==typeof n._lazyMap?n._lazyMap(o):o}},n},y=function(t,e,i){if(e||(e=t.length),e<1)throw new RangeError;if(e>t.length)throw new RangeError;var r=n(t.length,e),c=function(){return r},f=Object.create(t.slice(),{length:{get:c}});return u(f,"cmb"),u(f,"per"),o(f,{valueOf:function(){return r},init:function(){this.cmb=s(t,e),this.per=v(this.cmb.next())},next:function(){var t=this.per.next();if(!t){var n=this.cmb.next();if(!n)return;return this.per=v(n),this.next()}return"function"==typeof f._lazyMap?f._lazyMap(t):t}}),o(f,l),f.init(),"function"==typeof i?f.map(i):f},m=function(t){for(var e=0,i=1;i<=t;i++){var r=n(t,i);e+=r}return e},w=function(t,n){var e=m(t.length),i=function(){return e},r=Object.create(t.slice(),{length:{get:i}});return u(r,"cmb"),u(r,"per"),u(r,"nelem"),o(r,{valueOf:function(){return e},init:function(){this.nelem=1,this.cmb=s(t,this.nelem),this.per=v(this.cmb.next())},next:function(){var n=this.per.next();if(!n){var e=this.cmb.next();if(!e){if(this.nelem++,this.nelem>t.length)return;if(this.cmb=s(t,this.nelem),e=this.cmb.next(),!e)return}return this.per=v(e),this.next()}return"function"==typeof r._lazyMap?r._lazyMap(n):n}}),o(r,l),r.init(),"function"==typeof n?r.map(n):r},_=Array.prototype.slice,b=function(){if(!arguments.length)throw new RangeError;var t=_.call(arguments),n=t.reduce(function(t,n){return t*n.length},1),e=function(){return n},i=t.length,r=Object.create(t,{length:{get:e}});if(!n)throw new RangeError;return u(r,"index"),o(r,{valueOf:e,dim:i,init:function(){this.index=0},get:function(){if(arguments.length===this.length){for(var t=[],n=0;n<i;n++){var e=arguments[n];if(e>=this[n].length)return;t.push(this[n][e])}return"function"==typeof r._lazyMap?r._lazyMap(t):t}},nth:function(t){for(var n=[],e=0;e<i;e++){var o=this[e].length,u=t%o;n.push(this[e][u]),t-=u,t/=o}return"function"==typeof r._lazyMap?r._lazyMap(n):n},next:function(){if(!(this.index>=n)){var t=this.nth(this.index);return this.index++,t}}}),o(r,l),r.init(),r},g=function(t,n,e){if(n||(n=t.length),n<1)throw new RangeError;var i=t.length,r=Math.pow(i,n),c=function(){return r},f=Object.create(t.slice(),{length:{get:c}});return u(f,"index"),o(f,{valueOf:c,init:function(){f.index=0},nth:function(e){if(!(e>=r)){for(var o=[],u=0;u<n;u++){var c=e%i;o.push(t[c]),e-=c,e/=i}return"function"==typeof f._lazyMap?f._lazyMap(o):o}},next:function(){return this.nth(this.index++)}}),o(f,l),f.init(),"function"==typeof e?f.map(e):f},x=Object.create(null);return o(x,{C:e,P:n,factorial:i,factoradic:r,cartesianProduct:b,combination:s,bigCombination:p,permutation:y,permutationCombination:w,power:f,baseN:g,VERSION:t}),x})},function(t,n,e){!function(n,e){t.exports=e()}(this,function(){return function(t){function n(i){if(e[i])return e[i].exports;var r=e[i]={i:i,l:!1,exports:{}};return t[i].call(r.exports,r,r.exports,n),r.l=!0,r.exports}var e={};return n.m=t,n.c=e,n.i=function(t){return t},n.d=function(t,n,e){Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:e})},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},n.p="",n(n.s=0)}([function(t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var e={install:function(t){t.prototype.$throttle=e._throttle},_throttle:function(t,n,e){e=e||this.$el;var i=!1,r=function(){i||(i=!0,window.requestAnimationFrame(function(){e.dispatchEvent(new window.CustomEvent(n)),i=!1}))};e.addEventListener(t,r)}};n.default=e,"undefined"!=typeof window&&window.Vue&&window.Vue.use(e)}])})},function(t,n,e){"use strict";function i(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(n,"__esModule",{value:!0});var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},o=e(1),u=i(o),c=e(0).combination,l={install:function(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{globalTriggers:["resize","scroll"]};l._windowGroup=[],l._customGroups={},u.default._throttle("resize","vue-collision-window_rect_update",window),window.addEventListener("vue-collision-window_rect_update",l._updateWindowRect),window.dispatchEvent(new Event("vue-collision-window_rect_update"));var e=!0,i=!1,o=void 0;try{for(var c,f=n.globalTriggers[Symbol.iterator]();!(e=(c=f.next()).done);e=!0){var a=c.value;u.default._throttle(a,"vue-collision-"+a,window),window.addEventListener("vue-collision-"+a,l.checkAllGroups)}}catch(t){i=!0,o=t}finally{try{!e&&f.return&&f.return()}finally{if(i)throw o}}t.directive("collision",{bind:function(t,n,e){if("undefined"==typeof n.modifiers.prevent&&l._windowGroup.push(e.child),"object"===r(n.value)&&n.value.length){var i=!0,o=!1,u=void 0;try{for(var c,f=n.value[Symbol.iterator]();!(i=(c=f.next()).done);i=!0){var a=c.value;l._pushVnodeToGroup(e.child,a)}}catch(t){o=!0,u=t}finally{try{!i&&f.return&&f.return()}finally{if(o)throw u}}}e.child._collisionObject={windowGroup:"undefined"==typeof n.modifiers.prevent,customGroupsList:"object"===r(n.value)?n.value:[]}},updated:function(t,n,e,i){if("undefined"==typeof n.modifiers.prevent){var o=l._windowGroup.findIndex(function(t){return t===i.child});l._windowGroup[o]=e.child}if("object"===r(n.oldValue)&&n.oldValue.length){var u=n.oldValue.filter(function(t){return n.value.indexOf(t)<0}),c=!0,f=!1,a=void 0;try{for(var s,h=u[Symbol.iterator]();!(c=(s=h.next()).done);c=!0){var d=s.value;_removeVnodeFromGroup(i.child,d)}}catch(t){f=!0,a=t}finally{try{!c&&h.return&&h.return()}finally{if(f)throw a}}var p=n.value.filter(function(t){return n.oldValue.indexOf(t)<0}),v=!0,y=!1,m=void 0;try{for(var w,_=p[Symbol.iterator]();!(v=(w=_.next()).done);v=!0){var b=w.value;l._pushVnodeToGroup(e.child,b)}}catch(t){y=!0,m=t}finally{try{!v&&_.return&&_.return()}finally{if(y)throw m}}var g=n.value.filter(function(t){return n.oldValue.indexOf(t)>-1}),x=!0,G=!1,O=void 0;try{for(var j,M=g[Symbol.iterator]();!(x=(j=M.next()).done);x=!0){var z=j.value,V=l._customGroups[z].vnodes.findIndex(function(t){return t===i.child});l._customGroups[customGroup].vnodes[V]=e.child}}catch(t){G=!0,O=t}finally{try{!x&&M.return&&M.return()}finally{if(G)throw O}}(u.lenght>0||p.lenght>0||g.lenght>0)&&(l._customGroups[customGroup]._combinations=l._combine(l._customGroups[customGroup].vnodes))}e.child._collisionObject.customGroups="object"===r(n.value)?n.value:[]},unbind:function(t,n,e){if("object"===r(n.value)&&n.oldValue.value){if("undefined"==typeof n.modifiers.prevent){var i=l._windowGroup.findIndex(function(t){return t===oldVNode.child});l._windowGroup.splice(i,1)}var o=!0,u=!1,c=void 0;try{for(var f,a=n.value[Symbol.iterator]();!(o=(f=a.next()).done);o=!0){var s=f.value;_removeVnodeFromGroup(e.child,s),l._customGroups[s]._combinations=l._combine(l._customGroups[s].vnodes)}}catch(t){u=!0,c=t}finally{try{!o&&a.return&&a.return()}finally{if(u)throw c}}}delete e.child._collisionObject}}),t.mixin({mounted:function(){"undefined"!=typeof this._collisionObject&&l.checkGroups([this],l._filterByGroups(this._collisionObject.customGroupsList))},updated:function(){"undefined"!=typeof this._collisionObject&&l.checkGroups([this],l._filterByGroups(this._collisionObject.customGroupsList))}})},checkAllGroups:function(){l.checkGroups()},checkGroups:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:l._windowGroup,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:l._customGroups,e=!0,i=!1,r=void 0;try{for(var o,u=t[Symbol.iterator]();!(e=(o=u.next()).done);e=!0){var c=o.value;l._checkCollision(l._windowRect,c.$el.getBoundingClientRect())?c.$emit("collide",window):c.$emit("non-collide",window)}}catch(t){i=!0,r=t}finally{try{!e&&u.return&&u.return()}finally{if(i)throw r}}var f=!0,a=!1,s=void 0;try{for(var h,d=Object.keys(n)[Symbol.iterator]();!(f=(h=d.next()).done);f=!0){var p=h.value,v=!0,y=!1,m=void 0;try{for(var w,_=n[p].combinations[Symbol.iterator]();!(v=(w=_.next()).done);v=!0){var b=w.value;l._checkCollision(b[0].$el.getBoundingClientRect(),b[1].$el.getBoundingClientRect())?(b[0].$emit("collide-"+p,b[1]),b[1].$emit("collide-"+p,b[0])):(b[0].$emit("non-collide-"+p,b[1]),b[1].$emit("non-collide-"+p,b[0]))}}catch(t){y=!0,m=t}finally{try{!v&&_.return&&_.return()}finally{if(y)throw m}}}}catch(t){a=!0,s=t}finally{try{!f&&d.return&&d.return()}finally{if(a)throw s}}},_updateWindowRect:function(){l._windowRect=l._getWindowRect()},_getWindowRect:function(){return{left:0,top:0,width:window.innerWidth,height:window.innerHeight}},_pushVnodeToGroup:function(t,n){l._customGroups.hasOwnProperty(n)||(l._customGroups[n]={vnodes:[],combinations:[]}),l._customGroups[n].vnodes.push(t),l._customGroups[n].combinations=l._combine(l._customGroups[n].vnodes)},_removeVnodeFromGroup:function(t,n){var e=l._customGroups[n].vnodes.findIndex(function(n){return n===t});l._customGroups[n].vnodes.splice(e,1),l._customGroups[n].combinations=l._combine(l._customGroups[n].vnodes)},_filterByGroups:function(t){var n=[],e=!0,i=!1,r=void 0;try{for(var o,u=t[Symbol.iterator]();!(e=(o=u.next()).done);e=!0){var c=o.value;n.push(l._customGroups[c])}}catch(t){i=!0,r=t}finally{try{!e&&u.return&&u.return()}finally{if(i)throw r}}return n},_combine:function(t){var n=[];try{for(var e=c(t,2),i=void 0;i=e.next();)n.push(i)}catch(t){}return n},_checkCollision:function(t,n){return t.left<n.left+n.width&&t.left+t.width>n.left&&t.top<n.top+n.height&&t.height+t.top>n.top}};n.default=l,"undefined"!=typeof window&&window.Vue&&window.Vue.use(l)}])});