!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.VueCollision=e():t.VueCollision=e()}(this,function(){return function(t){function e(i){if(n[i])return n[i].exports;var o=n[i]={i:i,l:!1,exports:{}};return t[i].call(o.exports,o,o.exports,e),o.l=!0,o.exports}var n={};return e.m=t,e.c=n,e.i=function(t){return t},e.d=function(t,n,i){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:i})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=3)}([function(t,e){try{var n=new window.CustomEvent("test");if(n.preventDefault(),n.defaultPrevented!==!0)throw new Error("Could not prevent default")}catch(t){var i=function(t,e){var n,i;return e=e||{bubbles:!1,cancelable:!1,detail:void 0},n=document.createEvent("CustomEvent"),n.initCustomEvent(t,e.bubbles,e.cancelable,e.detail),i=n.preventDefault,n.preventDefault=function(){i.call(this);try{Object.defineProperty(this,"defaultPrevented",{get:function(){return!0}})}catch(t){this.defaultPrevented=!0}},n};i.prototype=window.Event.prototype,window.CustomEvent=i}},function(t,e,n){var i,o,r;!function(n,u){o=[],i=u,r="function"==typeof i?i.apply(e,o):i,!(void 0!==r&&(t.exports=r))}(this,function(){"use strict";var t="0.5.2",e=function(t,e){for(var n=1;e--;)n*=t--;return n},n=function(t,n){return n>t?0:e(t,n)/e(n,n)},i=function(t){return e(t,t)},o=function(t,e){var n=1;if(e)n=i(e);else{for(e=1;n<t;n*=++e);n>t&&(n/=e--)}for(var o=[0];e;n/=e--)o[e]=Math.floor(t/n),t%=n;return o},r=function(t,e){Object.keys(e).forEach(function(n){Object.defineProperty(t,n,{value:e[n],configurable:"next"==n})})},u=function(t,e){Object.defineProperty(t,e,{writable:!0})},c=function(t){var e,n=[];for(this.init();e=this.next();)n.push(t?t(e):e);return this.init(),n},l={toArray:c,map:c,forEach:function(t){var e;for(this.init();e=this.next();)t(e);this.init()},filter:function(t){var e,n=[];for(this.init();e=this.next();)t(e)&&n.push(e);return this.init(),n},lazyMap:function(t){return this._lazyMap=t,this},lazyFilter:function(t){if(Object.defineProperty(this,"next",{writable:!0}),"function"!=typeof t)this.next=this._next;else{"function"!=typeof this._next&&(this._next=this.next);var e=this._next.bind(this);this.next=function(){for(var n;n=e();)if(t(n))return n;return n}.bind(this)}return Object.defineProperty(this,"next",{writable:!1}),this}},a=function(t,e){var n=1<<t.length,i=function(){return n},o=Object.create(t.slice(),{length:{get:i}});return u(o,"index"),r(o,{valueOf:i,init:function(){o.index=0},nth:function(t){if(!(t>=n)){for(var e=0,i=[];t;t>>>=1,e++)1&t&&i.push(this[e]);return"function"==typeof o._lazyMap?o._lazyMap(i):i}},next:function(){return this.nth(this.index++)}}),r(o,l),o.init(),"function"==typeof e?o.map(e):o},f=function(t){var e=t&-t,n=t+e,i=n&-n,o=(i/e>>1)-1;return n|o},s=function(t,e,i){if(e||(e=t.length),e<1)throw new RangeError;if(e>t.length)throw new RangeError;var o=(1<<e)-1,c=n(t.length,e),a=1<<t.length,s=function(){return c},d=Object.create(t.slice(),{length:{get:s}});return u(d,"index"),r(d,{valueOf:s,init:function(){this.index=o},next:function(){if(!(this.index>=a)){for(var t=0,e=this.index,n=[];e;e>>>=1,t++)1&e&&(n[n.length]=this[t]);return this.index=f(this.index),"function"==typeof d._lazyMap?d._lazyMap(n):n}}}),r(d,l),d.init(),"function"==typeof i?d.map(i):d},d=function(t,e){var n=t,i=e,o=0;for(o=n.length-1;o>=0&&1==n[o];o--)i--;if(0==i){n[n.length]=1;for(var r=n.length-2;r>=0;r--)n[r]=r<e-1?1:0}else{for(var u=-1,c=-1,o=0;o<n.length;o++)if(0==n[o]&&u!=-1&&(c=o),1==n[o]&&(u=o),c!=-1&&u!=-1){n[c]=1,n[u]=0;break}i=e;for(var o=n.length-1;o>=u;o--)1==n[o]&&i--;for(var o=0;o<u;o++)n[o]=o<i?1:0}return n},h=function(t){for(var e=[],n=0;n<t;n++)e[n]=1;return e[0]=1,e},p=function(t,e,i){if(e||(e=t.length),e<1)throw new RangeError;if(e>t.length)throw new RangeError;var o=h(e),c=n(t.length,e),a=t.length,f=function(){return c},s=Object.create(t.slice(),{length:{get:f}});return u(s,"index"),r(s,{valueOf:f,init:function(){this.index=o.concat()},next:function(){if(!(this.index.length>a)){for(var t=0,n=this.index,i=[],o=0;o<n.length;o++,t++)n[o]&&(i[i.length]=this[t]);return d(this.index,e),"function"==typeof s._lazyMap?s._lazyMap(i):i}}}),r(s,l),s.init(),"function"==typeof i?s.map(i):s},v=function(t){var e=t.slice(),n=i(e.length);return e.index=0,e.next=function(){if(!(this.index>=n)){for(var t=this.slice(),i=o(this.index,this.length),r=[],u=this.length-1;u>=0;--u)r.push(t.splice(i[u],1)[0]);return this.index++,"function"==typeof e._lazyMap?e._lazyMap(r):r}},e},y=function(t,n,i){if(n||(n=t.length),n<1)throw new RangeError;if(n>t.length)throw new RangeError;var o=e(t.length,n),c=function(){return o},a=Object.create(t.slice(),{length:{get:c}});return u(a,"cmb"),u(a,"per"),r(a,{valueOf:function(){return o},init:function(){this.cmb=s(t,n),this.per=v(this.cmb.next())},next:function(){var t=this.per.next();if(!t){var e=this.cmb.next();if(!e)return;return this.per=v(e),this.next()}return"function"==typeof a._lazyMap?a._lazyMap(t):t}}),r(a,l),a.init(),"function"==typeof i?a.map(i):a},w=function(t){for(var n=0,i=1;i<=t;i++){var o=e(t,i);n+=o}return n},m=function(t,e){var n=w(t.length),i=function(){return n},o=Object.create(t.slice(),{length:{get:i}});return u(o,"cmb"),u(o,"per"),u(o,"nelem"),r(o,{valueOf:function(){return n},init:function(){this.nelem=1,this.cmb=s(t,this.nelem),this.per=v(this.cmb.next())},next:function(){var e=this.per.next();if(!e){var n=this.cmb.next();if(!n){if(this.nelem++,this.nelem>t.length)return;if(this.cmb=s(t,this.nelem),n=this.cmb.next(),!n)return}return this.per=v(n),this.next()}return"function"==typeof o._lazyMap?o._lazyMap(e):e}}),r(o,l),o.init(),"function"==typeof e?o.map(e):o},b=Array.prototype.slice,_=function(){if(!arguments.length)throw new RangeError;var t=b.call(arguments),e=t.reduce(function(t,e){return t*e.length},1),n=function(){return e},i=t.length,o=Object.create(t,{length:{get:n}});if(!e)throw new RangeError;return u(o,"index"),r(o,{valueOf:n,dim:i,init:function(){this.index=0},get:function(){if(arguments.length===this.length){for(var t=[],e=0;e<i;e++){var n=arguments[e];if(n>=this[e].length)return;t.push(this[e][n])}return"function"==typeof o._lazyMap?o._lazyMap(t):t}},nth:function(t){for(var e=[],n=0;n<i;n++){var r=this[n].length,u=t%r;e.push(this[n][u]),t-=u,t/=r}return"function"==typeof o._lazyMap?o._lazyMap(e):e},next:function(){if(!(this.index>=e)){var t=this.nth(this.index);return this.index++,t}}}),r(o,l),o.init(),o},g=function(t,e,n){if(e||(e=t.length),e<1)throw new RangeError;var i=t.length,o=Math.pow(i,e),c=function(){return o},a=Object.create(t.slice(),{length:{get:c}});return u(a,"index"),r(a,{valueOf:c,init:function(){a.index=0},nth:function(n){if(!(n>=o)){for(var r=[],u=0;u<e;u++){var c=n%i;r.push(t[c]),n-=c,n/=i}return"function"==typeof a._lazyMap?a._lazyMap(r):r}},next:function(){return this.nth(this.index++)}}),r(a,l),a.init(),"function"==typeof n?a.map(n):a},x=Object.create(null);return r(x,{C:n,P:e,factorial:i,factoradic:o,cartesianProduct:_,combination:s,bigCombination:p,permutation:y,permutationCombination:m,power:a,baseN:g,VERSION:t}),x})},function(t,e,n){!function(e,n){t.exports=n()}(this,function(){return function(t){function e(i){if(n[i])return n[i].exports;var o=n[i]={i:i,l:!1,exports:{}};return t[i].call(o.exports,o,o.exports,e),o.l=!0,o.exports}var n={};return e.m=t,e.c=n,e.i=function(t){return t},e.d=function(t,n,i){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:i})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=1)}([function(t,e){try{var n=new window.CustomEvent("test");if(n.preventDefault(),n.defaultPrevented!==!0)throw new Error("Could not prevent default")}catch(t){var i=function(t,e){var n,i;return e=e||{bubbles:!1,cancelable:!1,detail:void 0},n=document.createEvent("CustomEvent"),n.initCustomEvent(t,e.bubbles,e.cancelable,e.detail),i=n.preventDefault,n.preventDefault=function(){i.call(this);try{Object.defineProperty(this,"defaultPrevented",{get:function(){return!0}})}catch(t){this.defaultPrevented=!0}},n};i.prototype=window.Event.prototype,window.CustomEvent=i}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),n(0);var i={install:function(t){t.prototype.$throttle=i._throttle},_throttle:function(t,e,n){n=n||this.$el;var i=!1,o=function(t){i||(i=!0,window.requestAnimationFrame(function(){n.dispatchEvent(new window.CustomEvent(e,{detail:{origin:t}})),i=!1}))};return n.addEventListener(t,o),o}};e.default=i,"undefined"!=typeof window&&window.Vue&&window.Vue.use(i)}])})},function(t,e,n){"use strict";function i(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(e,"__esModule",{value:!0});var o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};n(0);var r=n(2),u=i(r),c=n(1).combination,l={install:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{globalTriggers:["resize","scroll"]};l._windowGroup=[],l._customGroups={},u.default._throttle("resize","vue-collision-window_rect_update",window),window.addEventListener("vue-collision-window_rect_update",l._updateWindowRect),window.dispatchEvent(new window.CustomEvent("vue-collision-window_rect_update"));var n=!0,i=!1,r=void 0;try{for(var c,a=e.globalTriggers[Symbol.iterator]();!(n=(c=a.next()).done);n=!0){var f=c.value;u.default._throttle(f,"vue-collision-"+f,window),window.addEventListener("vue-collision-"+f,l.checkAllGroups)}}catch(t){i=!0,r=t}finally{try{!n&&a.return&&a.return()}finally{if(i)throw r}}t.directive("collision",{bind:function(t,e,n){if("undefined"==typeof e.modifiers.prevent&&l._windowGroup.push(n.child),"object"===o(e.value)&&e.value.length){var i=!0,r=!1,u=void 0;try{for(var c,a=e.value[Symbol.iterator]();!(i=(c=a.next()).done);i=!0){var f=c.value;l._pushVnodeToGroup(n.child,f)}}catch(t){r=!0,u=t}finally{try{!i&&a.return&&a.return()}finally{if(r)throw u}}}n.child._collisionObject={windowGroup:"undefined"==typeof e.modifiers.prevent,customGroupsList:"object"===o(e.value)?e.value:[],_lastRectangle:{width:void 0,height:void 0,top:void 0,left:void 0},_lastFrame:void 0},n.child._collisionObject._lastFrame=window.requestAnimationFrame(l._vnodeFrameCheck.bind(void 0,n))},updated:function(t,e,n,i){if("undefined"==typeof e.modifiers.prevent){var r=l._windowGroup.findIndex(function(t){return t===i.child});l._windowGroup[r]=n.child}if("object"===o(e.oldValue)&&e.oldValue.length){var u=e.oldValue.filter(function(t){return e.value.indexOf(t)<0}),c=!0,a=!1,f=void 0;try{for(var s,d=u[Symbol.iterator]();!(c=(s=d.next()).done);c=!0){var h=s.value;_removeVnodeFromGroup(i.child,h)}}catch(t){a=!0,f=t}finally{try{!c&&d.return&&d.return()}finally{if(a)throw f}}var p=e.value.filter(function(t){return e.oldValue.indexOf(t)<0}),v=!0,y=!1,w=void 0;try{for(var m,b=p[Symbol.iterator]();!(v=(m=b.next()).done);v=!0){var _=m.value;l._pushVnodeToGroup(n.child,_)}}catch(t){y=!0,w=t}finally{try{!v&&b.return&&b.return()}finally{if(y)throw w}}var g=e.value.filter(function(t){return e.oldValue.indexOf(t)>-1}),x=!0,G=!1,O=void 0;try{for(var j,E=g[Symbol.iterator]();!(x=(j=E.next()).done);x=!0){var C=j.value,M=l._customGroups[C].vnodes.findIndex(function(t){return t===i.child});l._customGroups[customGroup].vnodes[M]=n.child}}catch(t){G=!0,O=t}finally{try{!x&&E.return&&E.return()}finally{if(G)throw O}}(u.lenght>0||p.lenght>0||g.lenght>0)&&(l._customGroups[customGroup]._combinations=l._combine(l._customGroups[customGroup].vnodes))}n.child._collisionObject.customGroups="object"===o(e.value)?e.value:[],window.cancelAnimationFrame(n.child._collisionObject._lastFrame),n.child._collisionObject._lastFrame=window.requestAnimationFrame(l._vnodeFrameCheck.bind(void 0,n))},unbind:function(t,e,n){if("object"===o(e.value)&&e.oldValue.value){if("undefined"==typeof e.modifiers.prevent){var i=l._windowGroup.findIndex(function(t){return t===oldVNode.child});l._windowGroup.splice(i,1)}var r=!0,u=!1,c=void 0;try{for(var a,f=e.value[Symbol.iterator]();!(r=(a=f.next()).done);r=!0){var s=a.value;_removeVnodeFromGroup(n.child,s),l._customGroups[s]._combinations=l._combine(l._customGroups[s].vnodes)}}catch(t){u=!0,c=t}finally{try{!r&&f.return&&f.return()}finally{if(u)throw c}}}window.cancelAnimationFrame(n.child._collisionObject._lastFrame),delete n.child._collisionObject}}),t.mixin({mounted:function(){"undefined"!=typeof this._collisionObject&&l.checkGroups(this._collisionObject.windowGroup?[this]:[],l._filterByGroups(this._collisionObject.customGroupsList))},updated:function(){"undefined"!=typeof this._collisionObject&&l.checkGroups(this._collisionObject.windowGroup?[this]:[],l._filterByGroups(this._collisionObject.customGroupsList))}})},checkAllGroups:function(){l.checkGroups()},checkGroups:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:l._windowGroup,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:l._customGroups,n=!0,i=!1,o=void 0;try{for(var r,u=t[Symbol.iterator]();!(n=(r=u.next()).done);n=!0){var c=r.value;l._checkCollision(l._windowRect,c.$el.getBoundingClientRect())?c.$emit("collide",window):c.$emit("non-collide",window)}}catch(t){i=!0,o=t}finally{try{!n&&u.return&&u.return()}finally{if(i)throw o}}var a=!0,f=!1,s=void 0;try{for(var d,h=Object.keys(e)[Symbol.iterator]();!(a=(d=h.next()).done);a=!0){var p=d.value,v=!0,y=!1,w=void 0;try{for(var m,b=e[p].combinations[Symbol.iterator]();!(v=(m=b.next()).done);v=!0){var _=m.value;l._checkCollision(_[0].$el.getBoundingClientRect(),_[1].$el.getBoundingClientRect())?(_[0].$emit("collide-"+p,_[1]),_[1].$emit("collide-"+p,_[0])):(_[0].$emit("non-collide-"+p,_[1]),_[1].$emit("non-collide-"+p,_[0]))}}catch(t){y=!0,w=t}finally{try{!v&&b.return&&b.return()}finally{if(y)throw w}}}}catch(t){f=!0,s=t}finally{try{!a&&h.return&&h.return()}finally{if(f)throw s}}},_updateWindowRect:function(){l._windowRect=l._getWindowRect()},_getWindowRect:function(){return{left:0,top:0,width:window.innerWidth,height:window.innerHeight}},_pushVnodeToGroup:function(t,e){l._customGroups.hasOwnProperty(e)||(l._customGroups[e]={vnodes:[],combinations:[]}),l._customGroups[e].vnodes.push(t),l._customGroups[e].combinations=l._combine(l._customGroups[e].vnodes)},_removeVnodeFromGroup:function(t,e){var n=l._customGroups[e].vnodes.findIndex(function(e){return e===t});l._customGroups[e].vnodes.splice(n,1),l._customGroups[e].combinations=l._combine(l._customGroups[e].vnodes)},_filterByGroups:function(t){var e=[],n=!0,i=!1,o=void 0;try{for(var r,u=t[Symbol.iterator]();!(n=(r=u.next()).done);n=!0){var c=r.value;e.push(l._customGroups[c])}}catch(t){i=!0,o=t}finally{try{!n&&u.return&&u.return()}finally{if(i)throw o}}return e},_combine:function(t){var e=[];try{for(var n=c(t,2),i=void 0;i=n.next();)e.push(i)}catch(t){}return e},_checkCollision:function(t,e){return t.left<e.left+e.width&&t.left+t.width>e.left&&t.top<e.top+e.height&&t.height+t.top>e.top},_boxHasChanged:function(t,e){return t.top!==e.top||t.left!==e.left||t.width!==e.width||t.height!==e.height},_vnodeFrameCheck:function(t){var e=t.child._collisionObject._lastRectangle,n=t.child.$el.getBoundingClientRect();l._boxHasChanged(e,n)&&(l.checkGroups(t.child._collisionObject.windowGroup?[t.child]:[],l._filterByGroups(t.child._collisionObject.customGroupsList)),t.child._collisionObject._lastRectangle=n),t.child._collisionObject._lastFrame=window.requestAnimationFrame(l._vnodeFrameCheck.bind(void 0,t))}};e.default=l,"undefined"!=typeof window&&window.Vue&&window.Vue.use(l)}])});