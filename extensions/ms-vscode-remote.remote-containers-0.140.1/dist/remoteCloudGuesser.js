!function(e,t){for(var r in t)e[r]=t[r]}(exports,function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=443)}({443:function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const n=r(9);var o;!function(e){e.Azure="azure",e.AWS="aws",e.DigitalOcean="digitalocean",e.GCP="gcp"}(o||(o={}));const a=[{id:o.Azure,url:"http://169.254.169.254/metadata/instance?api-version=2019-03-11",headers:{Metadata:"true"},match:/azEnvironment/},{id:o.DigitalOcean,url:"http://169.254.169.254/metadata/v1/id",match:/^\d{9}/},{id:o.AWS,url:"http://169.254.169.254/latest/meta-data/instance-id",match:/^i-[0-9a-f]{8}/},{id:o.GCP,url:"http://metadata.google.internal/computeMetadata/v1/instance/id",headers:{"Metadata-Flavor":"Google"},match:/^\d{10}/}];(async function(){let e;const t=new Promise(t=>e=t);return Promise.race([Promise.all(a.map(({id:r,url:o,headers:a,match:u})=>async function(e,t,r){return new Promise((o,a)=>{const u=n.get(e,{headers:t},e=>{if(e.statusCode<200||e.statusCode>299)return e.destroy(),a(new Error("Status "+e.statusCode));const t=[];e.on("data",e=>t.push(e)),e.on("end",()=>o(Buffer.concat(t).toString("utf8"))),e.on("error",a)});u.on("error",a),r.then(()=>u.abort())})}(o,a,t).then(t=>{u.test(t)&&e(r)},e=>{}))),new Promise(e=>setTimeout(e,7e3).unref())]).then(()=>e()),t})().then(e=>console.log(e||""))},9:function(e,t){e.exports=require("http")}}));
//# sourceMappingURL=remoteCloudGuesser.js.map