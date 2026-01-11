/**
 * Types adapted from and inspired by
 * https://github.com/stagas/html-jsx/tree/main
 * Many thanks to the authors and contributors of that project.
 */

import type { HTMLElements } from "../jsx-runtime/types/html";
import type { SVGElements } from "../jsx-runtime/types/svg";

export * from "../jsx-runtime/types/dom";
export * from "../jsx-runtime/types/html";
export * from "../jsx-runtime/types/svg";

export interface IntrinsicElements extends HTMLElements, SVGElements {}
