// Stub for `path2d-polyfill`, an optional browser-only dependency of pdfjs-dist's
// legacy build. Its package.json only exports a "browser" condition, which breaks
// the Cloudflare/workerd SSR build. All target browsers support Path2D natively.
export function applyPath2DToCanvasRenderingContext() {}
export function polyfillPath2D() {}
export default {};
