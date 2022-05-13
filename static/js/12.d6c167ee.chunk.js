(this["webpackJsonp@scaffold-eth/react-app"]=this["webpackJsonp@scaffold-eth/react-app"]||[]).push([[12,20],{1363:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t){for(var n=[],i=e;i&&i.kind;)n.push(i),i=i.prevState;for(var a=n.length-1;a>=0;a--)t(n[a])}},1366:function(e,t,n){"use strict";var i=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var a=n(67),r=n(72),o=i(n(1363));function u(e,t,n){return n===r.SchemaMetaFieldDef.name&&e.getQueryType()===t?r.SchemaMetaFieldDef:n===r.TypeMetaFieldDef.name&&e.getQueryType()===t?r.TypeMetaFieldDef:n===r.TypeNameMetaFieldDef.name&&a.isCompositeType(t)?r.TypeNameMetaFieldDef:t&&t.getFields?t.getFields()[n]:void 0}t.default=function(e,t){var n={schema:e,type:null,parentType:null,inputType:null,directiveDef:null,fieldDef:null,argDef:null,argDefs:null,objectFieldDefs:null};return o.default(t,(function(t){switch(t.kind){case"Query":case"ShortQuery":n.type=e.getQueryType();break;case"Mutation":n.type=e.getMutationType();break;case"Subscription":n.type=e.getSubscriptionType();break;case"InlineFragment":case"FragmentDefinition":t.type&&(n.type=e.getType(t.type));break;case"Field":case"AliasedField":n.fieldDef=n.type&&t.name?u(e,n.parentType,t.name):null,n.type=n.fieldDef&&n.fieldDef.type;break;case"SelectionSet":n.parentType=n.type?a.getNamedType(n.type):null;break;case"Directive":n.directiveDef=t.name?e.getDirective(t.name):null;break;case"Arguments":var i=t.prevState?"Field"===t.prevState.kind?n.fieldDef:"Directive"===t.prevState.kind?n.directiveDef:"AliasedField"===t.prevState.kind?t.prevState.name&&u(e,n.parentType,t.prevState.name):null:null;n.argDefs=i?i.args:null;break;case"Argument":if(n.argDef=null,n.argDefs)for(var r=0;r<n.argDefs.length;r++)if(n.argDefs[r].name===t.name){n.argDef=n.argDefs[r];break}n.inputType=n.argDef&&n.argDef.type;break;case"EnumValue":var o=n.inputType?a.getNamedType(n.inputType):null;n.enumValue=o instanceof a.GraphQLEnumType?function(e,t){for(var n=0;n<e.length;n++)if(t(e[n]))return e[n]}(o.getValues(),(function(e){return e.value===t.name})):null;break;case"ListValue":var l=n.inputType?a.getNullableType(n.inputType):null;n.inputType=l instanceof a.GraphQLList?l.ofType:null;break;case"ObjectValue":var f=n.inputType?a.getNamedType(n.inputType):null;n.objectFieldDefs=f instanceof a.GraphQLInputObjectType?f.getFields():null;break;case"ObjectField":var d=t.name&&n.objectFieldDefs?n.objectFieldDefs[t.name]:null;n.inputType=d&&d.type;break;case"NamedType":n.type=t.name?e.getType(t.name):null}})),n}},1367:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.getTypeReference=t.getEnumValueReference=t.getArgumentReference=t.getDirectiveReference=t.getFieldReference=void 0;var i=n(67);function a(e){return"__"===e.name.slice(0,2)}t.getFieldReference=function(e){return{kind:"Field",schema:e.schema,field:e.fieldDef,type:a(e.fieldDef)?null:e.parentType}},t.getDirectiveReference=function(e){return{kind:"Directive",schema:e.schema,directive:e.directiveDef}},t.getArgumentReference=function(e){return e.directiveDef?{kind:"Argument",schema:e.schema,argument:e.argDef,directive:e.directiveDef}:{kind:"Argument",schema:e.schema,argument:e.argDef,field:e.fieldDef,type:a(e.fieldDef)?null:e.parentType}},t.getEnumValueReference=function(e){return{kind:"EnumValue",value:e.enumValue||void 0,type:e.inputType?i.getNamedType(e.inputType):void 0}},t.getTypeReference=function(e,t){return{kind:"Type",schema:e.schema,type:t||e.type}}},1369:function(e,t,n){"use strict";var i=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var a=i(n(1362));function r(e,t){var n=e.state.info,i=t.target||t.srcElement;if(i instanceof HTMLElement&&"SPAN"===i.nodeName&&void 0===n.hoverTimeout){var r=i.getBoundingClientRect(),o=function(){clearTimeout(n.hoverTimeout),n.hoverTimeout=setTimeout(l,f)},u=function t(){a.default.off(document,"mousemove",o),a.default.off(e.getWrapperElement(),"mouseout",t),clearTimeout(n.hoverTimeout),n.hoverTimeout=void 0},l=function(){a.default.off(document,"mousemove",o),a.default.off(e.getWrapperElement(),"mouseout",u),n.hoverTimeout=void 0,function(e,t){var n=e.coordsChar({left:(t.left+t.right)/2,top:(t.top+t.bottom)/2}),i=e.state.info.options,r=i.render||e.getHelper(n,"info");if(r){var o=e.getTokenAt(n,!0);if(o){var u=r(o,i,e,n);u&&function(e,t,n){var i=document.createElement("div");i.className="CodeMirror-info",i.appendChild(n),document.body.appendChild(i);var r=i.getBoundingClientRect(),o=window.getComputedStyle(i),u=r.right-r.left+parseFloat(o.marginLeft)+parseFloat(o.marginRight),l=r.bottom-r.top+parseFloat(o.marginTop)+parseFloat(o.marginBottom),f=t.bottom;l>window.innerHeight-t.bottom-15&&t.top>window.innerHeight-t.bottom&&(f=t.top-l);f<0&&(f=t.bottom);var d,c=Math.max(0,window.innerWidth-u-15);c>t.left&&(c=t.left);i.style.opacity="1",i.style.top=f+"px",i.style.left=c+"px";var p=function(){clearTimeout(d)},m=function(){clearTimeout(d),d=setTimeout(s,200)},s=function(){a.default.off(i,"mouseover",p),a.default.off(i,"mouseout",m),a.default.off(e.getWrapperElement(),"mouseout",m),i.style.opacity?(i.style.opacity="0",setTimeout((function(){i.parentNode&&i.parentNode.removeChild(i)}),600)):i.parentNode&&i.parentNode.removeChild(i)};a.default.on(i,"mouseover",p),a.default.on(i,"mouseout",m),a.default.on(e.getWrapperElement(),"mouseout",m)}(e,t,u)}}}(e,r)},f=function(e){var t=e.state.info.options;return t&&t.hoverTime||500}(e);n.hoverTimeout=setTimeout(l,f),a.default.on(document,"mousemove",o),a.default.on(e.getWrapperElement(),"mouseout",u)}}a.default.defineOption("info",!1,(function(e,t,n){if(n&&n!==a.default.Init){var i=e.state.info.onMouseOver;a.default.off(e.getWrapperElement(),"mouseover",i),clearTimeout(e.state.info.hoverTimeout),delete e.state.info}if(t){var o=e.state.info=function(e){return{options:e instanceof Function?{render:e}:!0===e?{}:e}}(t);o.onMouseOver=r.bind(null,e),a.default.on(e.getWrapperElement(),"mouseover",o.onMouseOver)}}))},1388:function(e,t,n){"use strict";var i=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var a=n(67),r=i(n(1362)),o=i(n(1366)),u=n(1367);function l(e,t,n){var i,a=(null===(i=t.fieldDef)||void 0===i?void 0:i.name)||"";"__"!==a.slice(0,2)&&(c(e,t,n,t.parentType),m(e,".")),m(e,a,"field-name",n,u.getFieldReference(t))}function f(e,t,n){var i;m(e,"@"+((null===(i=t.directiveDef)||void 0===i?void 0:i.name)||""),"directive-name",n,u.getDirectiveReference(t))}function d(e,t,n,i){m(e,": "),c(e,t,n,i)}function c(e,t,n,i){i instanceof a.GraphQLNonNull?(c(e,t,n,i.ofType),m(e,"!")):i instanceof a.GraphQLList?(m(e,"["),c(e,t,n,i.ofType),m(e,"]")):m(e,(null===i||void 0===i?void 0:i.name)||"","type-name",n,u.getTypeReference(t,i))}function p(e,t,n){var i=n.description;if(i){var a=document.createElement("div");a.className="info-description",t.renderDescription?a.innerHTML=t.renderDescription(i):a.appendChild(document.createTextNode(i)),e.appendChild(a)}!function(e,t,n){var i=n.deprecationReason;if(i){var a=document.createElement("div");a.className="info-deprecation",t.renderDescription?a.innerHTML=t.renderDescription(i):a.appendChild(document.createTextNode(i));var r=document.createElement("span");r.className="info-deprecation-label",r.appendChild(document.createTextNode("Deprecated: ")),a.insertBefore(r,a.firstChild),e.appendChild(a)}}(e,t,n)}function m(e,t,n,i,a){if(void 0===n&&(n=""),void 0===i&&(i={onClick:null}),void 0===a&&(a=null),n){var r=i.onClick,o=void 0;r?((o=document.createElement("a")).href="javascript:void 0",o.addEventListener("click",(function(e){r(a,e)}))):o=document.createElement("span"),o.className=n,o.appendChild(document.createTextNode(t)),e.appendChild(o)}else e.appendChild(document.createTextNode(t))}n(1369),r.default.registerHelper("info","graphql",(function(e,t){if(t.schema&&e.state){var n,i=e.state,a=i.kind,r=i.step,s=o.default(t.schema,e.state);return"Field"===a&&0===r&&s.fieldDef||"AliasedField"===a&&2===r&&s.fieldDef?(function(e,t,n){l(e,t,n),d(e,t,n,t.type)}(n=document.createElement("div"),s,t),p(n,t,s.fieldDef),n):"Directive"===a&&1===r&&s.directiveDef?(f(n=document.createElement("div"),s,t),p(n,t,s.directiveDef),n):"Argument"===a&&0===r&&s.argDef?(function(e,t,n){var i;t.directiveDef?f(e,t,n):t.fieldDef&&l(e,t,n);var a=(null===(i=t.argDef)||void 0===i?void 0:i.name)||"";m(e,"("),m(e,a,"arg-name",n,u.getArgumentReference(t)),d(e,t,n,t.inputType),m(e,")")}(n=document.createElement("div"),s,t),p(n,t,s.argDef),n):"EnumValue"===a&&s.enumValue&&s.enumValue.description?(function(e,t,n){var i,a=(null===(i=t.enumValue)||void 0===i?void 0:i.name)||"";c(e,t,n,t.inputType),m(e,"."),m(e,a,"enum-value",n,u.getEnumValueReference(t))}(n=document.createElement("div"),s,t),p(n,t,s.enumValue),n):"NamedType"===a&&s.type&&s.type.description?(c(n=document.createElement("div"),s,t,s.type),p(n,t,s.type),n):void 0}}))}}]);
//# sourceMappingURL=12.d6c167ee.chunk.js.map