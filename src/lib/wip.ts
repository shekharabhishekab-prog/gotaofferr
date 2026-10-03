/**
 * Temporary "something big is coming" splash on the homepage.
 * - Switch it off: set WIP_ENABLED to false and redeploy.
 * - Countdown date: set WIP_LAUNCH_AT to an ISO time, e.g. "2026-10-11T00:00:00+05:30".
 *   Leave it empty to show "launch date soon" instead of a timer.
 */
export const WIP_ENABLED = true;
export const WIP_LAUNCH_AT = "2026-10-16T00:00:00+05:30";

/**
 * Runs before the page paints (so there is no flash). The splash shows only on "/",
 * only for people who are not signed in, who have not tapped the arrow this visit,
 * and who are not a search-engine crawler (crawlers always get the plain site).
 * "?enter=1" skips it for testing. "?wipdate=<ISO>" previews the timer with another date.
 */
export const WIP_HEAD_SCRIPT = `(function(){try{
var d=document.documentElement,p=location.pathname,s=location.search;
if(p!=="/")return;
if(/[?&]enter=1/.test(s))sessionStorage.setItem("wip_enter","1");
if(/bot|crawl|spider|slurp|lighthouse|facebookexternalhit|embedly|preview/i.test(navigator.userAgent))return;
if(sessionStorage.getItem("wip_enter")==="1")return;
for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(/^sb-.*-auth-token$/.test(k))return;}
var l=sessionStorage.getItem("wip_lang");
if(!l){var L=(navigator.languages&&navigator.languages[0]||navigator.language||"en").toLowerCase();
l=/^hi/.test(L)?"hi":/^zh/.test(L)?"zh":/^ja/.test(L)?"ja":/^ko/.test(L)?"ko":"en";}
d.setAttribute("data-wl",l);d.setAttribute("data-wip","on");
}catch(e){}})();`;
