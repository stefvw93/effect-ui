/**
 * Types adapted from and inspired by
 * https://github.com/stagas/html-jsx/tree/main
 * Many thanks to the authors and contributors of that project.
 */

import type { HTMLElements } from "./html";
import type { SVGElements } from "./svg";

export * from "./dom";
export * from "./html";
export * from "./svg";

export interface IntrinsicElements extends HTMLElements, SVGElements {}
