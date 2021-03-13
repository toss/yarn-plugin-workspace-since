/* eslint-disable */
module.exports = {
name: "@yarnpkg/plugin-workspace-since",
factory: function (require) {
var plugin;(()=>{"use strict";var e={d:(t,o)=>{for(var r in o)e.o(o,r)&&!e.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:o[r]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},t={};e.r(t),e.d(t,{default:()=>l});const o=require("clipanion");var r=function(e,t,o,r){var n,l=arguments.length,a=l<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var c=e.length-1;c>=0;c--)(n=e[c])&&(a=(l<3?n(a):l>3?n(t,o,a):n(t,o))||a);return l>3&&a&&Object.defineProperty(t,o,a),a};class n extends o.Command{constructor(){super(...arguments),this.name="John Doe"}async execute(){console.log(`Hello ${this.name}!`)}}r([o.Command.String("--name")],n.prototype,"name",void 0),r([o.Command.Path("hello","world")],n.prototype,"execute",null);const l={hooks:{afterAllInstalled:()=>{console.log("What a great install, am I right?")}},commands:[n]};plugin=t})();
return plugin;
}
};