import type { StandardProperties as CSSProperties } from "csstype";
import type { DOMAttributes } from "./dom";

type SVGPreserveAspectRatio =
	| "none"
	| "xMinYMin"
	| "xMidYMin"
	| "xMaxYMin"
	| "xMinYMid"
	| "xMidYMid"
	| "xMaxYMid"
	| "xMinYMax"
	| "xMidYMax"
	| "xMaxYMax"
	| "xMinYMin meet"
	| "xMidYMin meet"
	| "xMaxYMin meet"
	| "xMinYMid meet"
	| "xMidYMid meet"
	| "xMaxYMid meet"
	| "xMinYMax meet"
	| "xMidYMax meet"
	| "xMaxYMax meet"
	| "xMinYMin slice"
	| "xMidYMin slice"
	| "xMaxYMin slice"
	| "xMinYMid slice"
	| "xMidYMid slice"
	| "xMaxYMid slice"
	| "xMinYMax slice"
	| "xMidYMax slice"
	| "xMaxYMax slice";
type ImagePreserveAspectRatio =
	| SVGPreserveAspectRatio
	| "defer none"
	| "defer xMinYMin"
	| "defer xMidYMin"
	| "defer xMaxYMin"
	| "defer xMinYMid"
	| "defer xMidYMid"
	| "defer xMaxYMid"
	| "defer xMinYMax"
	| "defer xMidYMax"
	| "defer xMaxYMax"
	| "defer xMinYMin meet"
	| "defer xMidYMin meet"
	| "defer xMaxYMin meet"
	| "defer xMinYMid meet"
	| "defer xMidYMid meet"
	| "defer xMaxYMid meet"
	| "defer xMinYMax meet"
	| "defer xMidYMax meet"
	| "defer xMaxYMax meet"
	| "defer xMinYMin slice"
	| "defer xMidYMin slice"
	| "defer xMaxYMin slice"
	| "defer xMinYMid slice"
	| "defer xMidYMid slice"
	| "defer xMaxYMid slice"
	| "defer xMinYMax slice"
	| "defer xMidYMax slice"
	| "defer xMaxYMax slice";
type SVGUnits = "userSpaceOnUse" | "objectBoundingBox";
export interface SVGAttributes<T> extends DOMAttributes<T> {
	id?: string;
	lang?: string;
	/**
	 * A space-separated list of the part names of the element. Part names allows CSS to select and style specific elements in a shadow tree via the ::part pseudo-element.
	 */
	part?: string;
	/**
	 * An integer attribute indicating if the element can take input focus (is focusable), if it should participate to sequential keyboard navigation, and if so, at what position. It can take several values: a negative value means that the element should be focusable, but should not be reachable via sequential keyboard navigation; 0 means that the element should be focusable and reachable via sequential keyboard navigation, but its relative order is defined by the platform convention; a positive value means that the element should be focusable and reachable via sequential keyboard navigation; the order in which the elements are focused is the increasing value of the tabindex. If several elements share the same tabindex, their relative order follows their relative positions in the document.
	 */
	tabindex?: number | string;
}
interface StylableSVGAttributes {
	class?: string;
	style?: Partial<CSSStyleDeclaration> | CSSProperties | string | false | null;
}
interface TransformableSVGAttributes {
	transform?: string;
}
interface ConditionalProcessingSVGAttributes {
	requiredExtensions?: string;
	requiredFeatures?: string;
	systemLanguage?: string;
}
interface ExternalResourceSVGAttributes {
	externalResourcesRequired?: "true" | "false";
}
interface AnimationTimingSVGAttributes {
	begin?: number | string;
	dur?: number | string;
	end?: number | string;
	min?: number | string;
	max?: number | string;
	restart?: "always" | "whenNotActive" | "never";
	repeatCount?: number | string | "indefinite";
	repeatDur?: number | string;
	fill?: "freeze" | "remove";
}
interface AnimationValueSVGAttributes {
	calcMode?: "discrete" | "linear" | "paced" | "spline";
	values?: string;
	keyTimes?: string;
	keySplines?: string;
	from?: number | string;
	to?: number | string;
	by?: number | string;
}
interface AnimationAdditionSVGAttributes {
	attributeName?: string;
	additive?: "replace" | "sum";
	accumulate?: "none" | "sum";
}
interface AnimationAttributeTargetSVGAttributes {
	attributeName?: string;
	attributeType?: "CSS" | "XML" | "auto";
}
interface PresentationSVGAttributes {
	"alignment-baseline"?:
		| "auto"
		| "baseline"
		| "before-edge"
		| "text-before-edge"
		| "middle"
		| "central"
		| "after-edge"
		| "text-after-edge"
		| "ideographic"
		| "alphabetic"
		| "hanging"
		| "mathematical"
		| "inherit";
	"baseline-shift"?: number | string;
	clip?: string;
	"clip-path"?: string;
	"clip-rule"?: "nonzero" | "evenodd" | "inherit";
	color?: string;
	"color-interpolation"?: "auto" | "sRGB" | "linearRGB" | "inherit";
	"color-interpolation-filters"?: "auto" | "sRGB" | "linearRGB" | "inherit";
	"color-profile"?: string;
	"color-rendering"?: "auto" | "optimizeSpeed" | "optimizeQuality" | "inherit";
	cursor?: string;
	direction?: "ltr" | "rtl" | "inherit";
	display?: string;
	"dominant-baseline"?:
		| "auto"
		| "text-bottom"
		| "alphabetic"
		| "ideographic"
		| "middle"
		| "central"
		| "mathematical"
		| "hanging"
		| "text-top"
		| "inherit";
	"enable-background"?: string;
	fill?: string;
	"fill-opacity"?: number | string | "inherit";
	"fill-rule"?: "nonzero" | "evenodd" | "inherit";
	filter?: string;
	"flood-color"?: string;
	"flood-opacity"?: number | string | "inherit";
	"font-family"?: string;
	"font-size"?: number | string;
	"font-size-adjust"?: number | string;
	"font-stretch"?: string;
	"font-style"?: "normal" | "italic" | "oblique" | "inherit";
	"font-variant"?: string;
	"font-weight"?: number | string;
	"glyph-orientation-horizontal"?: string;
	"glyph-orientation-vertical"?: string;
	"image-rendering"?: "auto" | "optimizeQuality" | "optimizeSpeed" | "inherit";
	kerning?: string;
	"letter-spacing"?: number | string;
	"lighting-color"?: string;
	"marker-end"?: string;
	"marker-mid"?: string;
	"marker-start"?: string;
	mask?: string;
	opacity?: number | string | "inherit";
	overflow?: "visible" | "hidden" | "scroll" | "auto" | "inherit";
	"pointer-events"?:
		| "bounding-box"
		| "visiblePainted"
		| "visibleFill"
		| "visibleStroke"
		| "visible"
		| "painted"
		| "color"
		| "fill"
		| "stroke"
		| "all"
		| "none"
		| "inherit";
	"shape-rendering"?:
		| "auto"
		| "optimizeSpeed"
		| "crispEdges"
		| "geometricPrecision"
		| "inherit";
	"stop-color"?: string;
	"stop-opacity"?: number | string | "inherit";
	stroke?: string;
	"stroke-dasharray"?: string;
	"stroke-dashoffset"?: number | string;
	"stroke-linecap"?: "butt" | "round" | "square" | "inherit";
	"stroke-linejoin"?:
		| "arcs"
		| "bevel"
		| "miter"
		| "miter-clip"
		| "round"
		| "inherit";
	"stroke-miterlimit"?: number | string | "inherit";
	"stroke-opacity"?: number | string | "inherit";
	"stroke-width"?: number | string;
	"text-anchor"?: "start" | "middle" | "end" | "inherit";
	"text-decoration"?:
		| "none"
		| "underline"
		| "overline"
		| "line-through"
		| "blink"
		| "inherit";
	"text-rendering"?:
		| "auto"
		| "optimizeSpeed"
		| "optimizeLegibility"
		| "geometricPrecision"
		| "inherit";
	"unicode-bidi"?: string;
	visibility?: "visible" | "hidden" | "collapse" | "inherit";
	"word-spacing"?: number | string;
	"writing-mode"?: "lr-tb" | "rl-tb" | "tb-rl" | "lr" | "rl" | "tb" | "inherit";
}
interface AnimationElementSVGAttributes<T>
	extends SVGAttributes<T>,
		ExternalResourceSVGAttributes,
		ConditionalProcessingSVGAttributes {}
interface ContainerElementSVGAttributes<T>
	extends SVGAttributes<T>,
		Pick<
			PresentationSVGAttributes,
			| "clip-path"
			| "mask"
			| "cursor"
			| "opacity"
			| "filter"
			| "enable-background"
			| "color-interpolation"
			| "color-rendering"
		> {}
interface FilterPrimitiveElementSVGAttributes<T>
	extends SVGAttributes<T>,
		Pick<PresentationSVGAttributes, "color-interpolation-filters"> {
	x?: number | string;
	y?: number | string;
	width?: number | string;
	height?: number | string;
	result?: string;
}
interface SingleInputFilterSVGAttributes {
	in?: string;
}
interface DoubleInputFilterSVGAttributes {
	in?: string;
	in2?: string;
}
interface FitToViewBoxSVGAttributes {
	viewBox?: string;
	preserveAspectRatio?: SVGPreserveAspectRatio;
}
interface GradientElementSVGAttributes<T>
	extends SVGAttributes<T>,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes {
	gradientUnits?: SVGUnits;
	gradientTransform?: string;
	spreadMethod?: "pad" | "reflect" | "repeat";
}
interface GraphicsElementSVGAttributes<T>
	extends SVGAttributes<T>,
		Pick<
			PresentationSVGAttributes,
			| "clip-rule"
			| "mask"
			| "pointer-events"
			| "cursor"
			| "opacity"
			| "filter"
			| "display"
			| "visibility"
			| "color-interpolation"
			| "color-rendering"
		> {}
interface LightSourceElementSVGAttributes<T> extends SVGAttributes<T> {}
interface NewViewportSVGAttributes<T>
	extends SVGAttributes<T>,
		Pick<PresentationSVGAttributes, "overflow" | "clip"> {
	viewBox?: string;
}
interface ShapeElementSVGAttributes<T>
	extends SVGAttributes<T>,
		Pick<
			PresentationSVGAttributes,
			| "color"
			| "fill-opacity"
			| "fill-rule"
			| "fill"
			| "shape-rendering"
			| "stroke-dasharray"
			| "stroke-dashoffset"
			| "stroke-linecap"
			| "stroke-linejoin"
			| "stroke-miterlimit"
			| "stroke-opacity"
			| "stroke-width"
			| "stroke"
		> {}
interface TextContentElementSVGAttributes<T>
	extends SVGAttributes<T>,
		Pick<
			PresentationSVGAttributes,
			| "color"
			| "direction"
			| "dominant-baseline"
			| "fill-opacity"
			| "fill-rule"
			| "fill"
			| "font-family"
			| "font-size-adjust"
			| "font-size"
			| "font-stretch"
			| "font-style"
			| "font-variant"
			| "font-weight"
			| "glyph-orientation-horizontal"
			| "glyph-orientation-vertical"
			| "kerning"
			| "letter-spacing"
			| "stroke-dasharray"
			| "stroke-dashoffset"
			| "stroke-linecap"
			| "stroke-linejoin"
			| "stroke-miterlimit"
			| "stroke-opacity"
			| "stroke-width"
			| "stroke"
			| "text-anchor"
			| "text-decoration"
			| "unicode-bidi"
			| "word-spacing"
		> {}
interface ZoomAndPanSVGAttributes {
	zoomAndPan?: "disable" | "magnify";
}
interface AnimateSVGAttributes<T>
	extends AnimationElementSVGAttributes<T>,
		AnimationAttributeTargetSVGAttributes,
		AnimationTimingSVGAttributes,
		AnimationValueSVGAttributes,
		AnimationAdditionSVGAttributes,
		Pick<
			PresentationSVGAttributes,
			"color-interpolation" | "color-rendering"
		> {}
interface AnimateMotionSVGAttributes<T>
	extends AnimationElementSVGAttributes<T>,
		AnimationTimingSVGAttributes,
		AnimationValueSVGAttributes,
		AnimationAdditionSVGAttributes {
	path?: string;
	keyPoints?: string;
	rotate?: number | string | "auto" | "auto-reverse";
	origin?: "default";
}
interface AnimateTransformSVGAttributes<T>
	extends AnimationElementSVGAttributes<T>,
		AnimationAttributeTargetSVGAttributes,
		AnimationTimingSVGAttributes,
		AnimationValueSVGAttributes,
		AnimationAdditionSVGAttributes {
	type?: "translate" | "scale" | "rotate" | "skewX" | "skewY";
}
interface CircleSVGAttributes<T>
	extends GraphicsElementSVGAttributes<T>,
		ShapeElementSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		StylableSVGAttributes,
		TransformableSVGAttributes {
	cx?: number | string;
	cy?: number | string;
	r?: number | string;
}
interface ClipPathSVGAttributes<T>
	extends SVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		TransformableSVGAttributes,
		Pick<PresentationSVGAttributes, "clip-path"> {
	clipPathUnits?: SVGUnits;
}
interface DefsSVGAttributes<T>
	extends ContainerElementSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		TransformableSVGAttributes {}
interface DescSVGAttributes<T>
	extends SVGAttributes<T>,
		StylableSVGAttributes {}
interface EllipseSVGAttributes<T>
	extends GraphicsElementSVGAttributes<T>,
		ShapeElementSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		TransformableSVGAttributes {
	cx?: number | string;
	cy?: number | string;
	rx?: number | string;
	ry?: number | string;
}
interface FeBlendSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		DoubleInputFilterSVGAttributes,
		StylableSVGAttributes {
	mode?: "normal" | "multiply" | "screen" | "darken" | "lighten";
}
interface FeColorMatrixSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		SingleInputFilterSVGAttributes,
		StylableSVGAttributes {
	type?: "matrix" | "saturate" | "hueRotate" | "luminanceToAlpha";
	values?: string;
}
interface FeComponentTransferSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		SingleInputFilterSVGAttributes,
		StylableSVGAttributes {}
interface FeCompositeSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		DoubleInputFilterSVGAttributes,
		StylableSVGAttributes {
	operator?: "over" | "in" | "out" | "atop" | "xor" | "arithmetic";
	k1?: number | string;
	k2?: number | string;
	k3?: number | string;
	k4?: number | string;
}
interface FeConvolveMatrixSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		SingleInputFilterSVGAttributes,
		StylableSVGAttributes {
	order?: number | string;
	kernelMatrix?: string;
	divisor?: number | string;
	bias?: number | string;
	targetX?: number | string;
	targetY?: number | string;
	edgeMode?: "duplicate" | "wrap" | "none";
	kernelUnitLength?: number | string;
	preserveAlpha?: "true" | "false";
}
interface FeDiffuseLightingSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		SingleInputFilterSVGAttributes,
		StylableSVGAttributes,
		Pick<PresentationSVGAttributes, "color" | "lighting-color"> {
	surfaceScale?: number | string;
	diffuseConstant?: number | string;
	kernelUnitLength?: number | string;
}
interface FeDisplacementMapSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		DoubleInputFilterSVGAttributes,
		StylableSVGAttributes {
	scale?: number | string;
	xChannelSelector?: "R" | "G" | "B" | "A";
	yChannelSelector?: "R" | "G" | "B" | "A";
}
interface FeDistantLightSVGAttributes<T>
	extends LightSourceElementSVGAttributes<T> {
	azimuth?: number | string;
	elevation?: number | string;
}
interface FeFloodSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		StylableSVGAttributes,
		Pick<
			PresentationSVGAttributes,
			"color" | "flood-color" | "flood-opacity"
		> {}
interface FeFuncSVGAttributes<T> extends SVGAttributes<T> {
	type?: "identity" | "table" | "discrete" | "linear" | "gamma";
	tableValues?: string;
	slope?: number | string;
	intercept?: number | string;
	amplitude?: number | string;
	exponent?: number | string;
	offset?: number | string;
}
interface FeGaussianBlurSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		SingleInputFilterSVGAttributes,
		StylableSVGAttributes {
	stdDeviation?: number | string;
}
interface FeImageSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes {
	preserveAspectRatio: SVGPreserveAspectRatio;
}
interface FeMergeSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		StylableSVGAttributes {}
interface FeMergeNodeSVGAttributes<T>
	extends SVGAttributes<T>,
		SingleInputFilterSVGAttributes {}
interface FeMorphologySVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		SingleInputFilterSVGAttributes,
		StylableSVGAttributes {
	operator?: "erode" | "dilate";
	radius?: number | string;
}
interface FeOffsetSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		SingleInputFilterSVGAttributes,
		StylableSVGAttributes {
	dx?: number | string;
	dy?: number | string;
}
interface FePointLightSVGAttributes<T>
	extends LightSourceElementSVGAttributes<T> {
	x?: number | string;
	y?: number | string;
	z?: number | string;
}
interface FeSpecularLightingSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		SingleInputFilterSVGAttributes,
		StylableSVGAttributes,
		Pick<PresentationSVGAttributes, "color" | "lighting-color"> {
	surfaceScale?: number | string;
	specularConstant?: number | string;
	specularExponent?: number | string;
	kernelUnitLength?: number | string;
}
interface FeSpotLightSVGAttributes<T>
	extends LightSourceElementSVGAttributes<T> {
	x?: number | string;
	y?: number | string;
	z?: number | string;
	pointsAtX?: number | string;
	pointsAtY?: number | string;
	pointsAtZ?: number | string;
	specularExponent?: number | string;
	limitingConeAngle?: number | string;
}
interface FeTileSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		SingleInputFilterSVGAttributes,
		StylableSVGAttributes {}
interface FeTurbulanceSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		StylableSVGAttributes {
	baseFrequency?: number | string;
	numOctaves?: number | string;
	seed?: number | string;
	stitchTiles?: "stitch" | "noStitch";
	type?: "fractalNoise" | "turbulence";
}
interface FilterSVGAttributes<T>
	extends SVGAttributes<T>,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes {
	filterUnits?: SVGUnits;
	primitiveUnits?: SVGUnits;
	x?: number | string;
	y?: number | string;
	width?: number | string;
	height?: number | string;
	filterRes?: number | string;
}
interface ForeignObjectSVGAttributes<T>
	extends NewViewportSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		TransformableSVGAttributes,
		Pick<PresentationSVGAttributes, "display" | "visibility"> {
	x?: number | string;
	y?: number | string;
	width?: number | string;
	height?: number | string;
}
interface GSVGAttributes<T>
	extends ContainerElementSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		TransformableSVGAttributes,
		Pick<PresentationSVGAttributes, "display" | "visibility"> {}
interface ImageSVGAttributes<T>
	extends NewViewportSVGAttributes<T>,
		GraphicsElementSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		StylableSVGAttributes,
		TransformableSVGAttributes,
		Pick<PresentationSVGAttributes, "color-profile" | "image-rendering"> {
	x?: number | string;
	y?: number | string;
	width?: number | string;
	height?: number | string;
	preserveAspectRatio?: ImagePreserveAspectRatio;
}
interface LineSVGAttributes<T>
	extends GraphicsElementSVGAttributes<T>,
		ShapeElementSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		TransformableSVGAttributes,
		Pick<
			PresentationSVGAttributes,
			"marker-start" | "marker-mid" | "marker-end"
		> {
	x1?: number | string;
	y1?: number | string;
	x2?: number | string;
	y2?: number | string;
}
interface LinearGradientSVGAttributes<T>
	extends GradientElementSVGAttributes<T> {
	x1?: number | string;
	x2?: number | string;
	y1?: number | string;
	y2?: number | string;
}
interface MarkerSVGAttributes<T>
	extends ContainerElementSVGAttributes<T>,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		FitToViewBoxSVGAttributes,
		Pick<PresentationSVGAttributes, "overflow" | "clip"> {
	markerUnits?: "strokeWidth" | "userSpaceOnUse";
	refX?: number | string;
	refY?: number | string;
	markerWidth?: number | string;
	markerHeight?: number | string;
	orient?: string;
}
interface MaskSVGAttributes<T>
	extends Omit<ContainerElementSVGAttributes<T>, "opacity" | "filter">,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes {
	maskUnits?: SVGUnits;
	maskContentUnits?: SVGUnits;
	x?: number | string;
	y?: number | string;
	width?: number | string;
	height?: number | string;
}
interface MetadataSVGAttributes<T> extends SVGAttributes<T> {}
interface PathSVGAttributes<T>
	extends GraphicsElementSVGAttributes<T>,
		ShapeElementSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		TransformableSVGAttributes,
		Pick<
			PresentationSVGAttributes,
			"marker-start" | "marker-mid" | "marker-end"
		> {
	d?: string;
	pathLength?: number | string;
}
interface PatternSVGAttributes<T>
	extends ContainerElementSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		FitToViewBoxSVGAttributes,
		Pick<PresentationSVGAttributes, "overflow" | "clip"> {
	x?: number | string;
	y?: number | string;
	width?: number | string;
	height?: number | string;
	patternUnits?: SVGUnits;
	patternContentUnits?: SVGUnits;
	patternTransform?: string;
}
interface PolygonSVGAttributes<T>
	extends GraphicsElementSVGAttributes<T>,
		ShapeElementSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		TransformableSVGAttributes,
		Pick<
			PresentationSVGAttributes,
			"marker-start" | "marker-mid" | "marker-end"
		> {
	points?: string;
}
interface PolylineSVGAttributes<T>
	extends GraphicsElementSVGAttributes<T>,
		ShapeElementSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		TransformableSVGAttributes,
		Pick<
			PresentationSVGAttributes,
			"marker-start" | "marker-mid" | "marker-end"
		> {
	points?: string;
}
interface RadialGradientSVGAttributes<T>
	extends GradientElementSVGAttributes<T> {
	cx?: number | string;
	cy?: number | string;
	r?: number | string;
	fx?: number | string;
	fy?: number | string;
}
interface RectSVGAttributes<T>
	extends GraphicsElementSVGAttributes<T>,
		ShapeElementSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		TransformableSVGAttributes {
	x?: number | string;
	y?: number | string;
	width?: number | string;
	height?: number | string;
	rx?: number | string;
	ry?: number | string;
}
interface StopSVGAttributes<T>
	extends SVGAttributes<T>,
		StylableSVGAttributes,
		Pick<PresentationSVGAttributes, "color" | "stop-color" | "stop-opacity"> {
	offset?: number | string;
}
interface SvgSVGAttributes<T>
	extends ContainerElementSVGAttributes<T>,
		NewViewportSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		FitToViewBoxSVGAttributes,
		ZoomAndPanSVGAttributes,
		PresentationSVGAttributes {
	version?: string;
	"base-profile"?: string;
	x?: number | string;
	y?: number | string;
	width?: number | string;
	height?: number | string;
	contentScriptType?: string;
	contentStyleType?: string;
	xmlns?: string;
}
interface SwitchSVGAttributes<T>
	extends ContainerElementSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		TransformableSVGAttributes,
		Pick<PresentationSVGAttributes, "display" | "visibility"> {}
interface SymbolSVGAttributes<T>
	extends ContainerElementSVGAttributes<T>,
		NewViewportSVGAttributes<T>,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		FitToViewBoxSVGAttributes {}
interface TextSVGAttributes<T>
	extends TextContentElementSVGAttributes<T>,
		GraphicsElementSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		TransformableSVGAttributes,
		Pick<PresentationSVGAttributes, "writing-mode" | "text-rendering"> {
	x?: number | string;
	y?: number | string;
	dx?: number | string;
	dy?: number | string;
	rotate?: number | string;
	textLength?: number | string;
	lengthAdjust?: "spacing" | "spacingAndGlyphs";
}
interface TextPathSVGAttributes<T>
	extends TextContentElementSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		Pick<
			PresentationSVGAttributes,
			"alignment-baseline" | "baseline-shift" | "display" | "visibility"
		> {
	startOffset?: number | string;
	method?: "align" | "stretch";
	spacing?: "auto" | "exact";
}
interface TSpanSVGAttributes<T>
	extends TextContentElementSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		Pick<
			PresentationSVGAttributes,
			"alignment-baseline" | "baseline-shift" | "display" | "visibility"
		> {
	x?: number | string;
	y?: number | string;
	dx?: number | string;
	dy?: number | string;
	rotate?: number | string;
	textLength?: number | string;
	lengthAdjust?: "spacing" | "spacingAndGlyphs";
}
interface UseSVGAttributes<T>
	extends GraphicsElementSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		TransformableSVGAttributes {
	href?: string;
	x?: number | string;
	y?: number | string;
	width?: number | string;
	height?: number | string;
}
interface ViewSVGAttributes<T>
	extends SVGAttributes<T>,
		ExternalResourceSVGAttributes,
		FitToViewBoxSVGAttributes,
		ZoomAndPanSVGAttributes {
	viewTarget?: string;
}
export interface SVGElements {
	animate: AnimateSVGAttributes<SVGAnimateElement>;
	animateMotion: AnimateMotionSVGAttributes<SVGAnimateMotionElement>;
	animateTransform: AnimateTransformSVGAttributes<SVGAnimateTransformElement>;
	circle: CircleSVGAttributes<SVGCircleElement>;
	clipPath: ClipPathSVGAttributes<SVGClipPathElement>;
	defs: DefsSVGAttributes<SVGDefsElement>;
	desc: DescSVGAttributes<SVGDescElement>;
	ellipse: EllipseSVGAttributes<SVGEllipseElement>;
	feBlend: FeBlendSVGAttributes<SVGFEBlendElement>;
	feColorMatrix: FeColorMatrixSVGAttributes<SVGFEColorMatrixElement>;
	feComponentTransfer: FeComponentTransferSVGAttributes<SVGFEComponentTransferElement>;
	feComposite: FeCompositeSVGAttributes<SVGFECompositeElement>;
	feConvolveMatrix: FeConvolveMatrixSVGAttributes<SVGFEConvolveMatrixElement>;
	feDiffuseLighting: FeDiffuseLightingSVGAttributes<SVGFEDiffuseLightingElement>;
	feDisplacementMap: FeDisplacementMapSVGAttributes<SVGFEDisplacementMapElement>;
	feDistantLight: FeDistantLightSVGAttributes<SVGFEDistantLightElement>;
	feFlood: FeFloodSVGAttributes<SVGFEFloodElement>;
	feFuncA: FeFuncSVGAttributes<SVGFEFuncAElement>;
	feFuncB: FeFuncSVGAttributes<SVGFEFuncBElement>;
	feFuncG: FeFuncSVGAttributes<SVGFEFuncGElement>;
	feFuncR: FeFuncSVGAttributes<SVGFEFuncRElement>;
	feGaussianBlur: FeGaussianBlurSVGAttributes<SVGFEGaussianBlurElement>;
	feImage: FeImageSVGAttributes<SVGFEImageElement>;
	feMerge: FeMergeSVGAttributes<SVGFEMergeElement>;
	feMergeNode: FeMergeNodeSVGAttributes<SVGFEMergeNodeElement>;
	feMorphology: FeMorphologySVGAttributes<SVGFEMorphologyElement>;
	feOffset: FeOffsetSVGAttributes<SVGFEOffsetElement>;
	fePointLight: FePointLightSVGAttributes<SVGFEPointLightElement>;
	feSpecularLighting: FeSpecularLightingSVGAttributes<SVGFESpecularLightingElement>;
	feSpotLight: FeSpotLightSVGAttributes<SVGFESpotLightElement>;
	feTile: FeTileSVGAttributes<SVGFETileElement>;
	feTurbulence: FeTurbulanceSVGAttributes<SVGFETurbulenceElement>;
	filter: FilterSVGAttributes<SVGFilterElement>;
	foreignObject: ForeignObjectSVGAttributes<SVGForeignObjectElement>;
	g: GSVGAttributes<SVGGElement>;
	image: ImageSVGAttributes<SVGImageElement>;
	line: LineSVGAttributes<SVGLineElement>;
	linearGradient: LinearGradientSVGAttributes<SVGLinearGradientElement>;
	marker: MarkerSVGAttributes<SVGMarkerElement>;
	mask: MaskSVGAttributes<SVGMaskElement>;
	metadata: MetadataSVGAttributes<SVGMetadataElement>;
	path: PathSVGAttributes<SVGPathElement>;
	pattern: PatternSVGAttributes<SVGPatternElement>;
	polygon: PolygonSVGAttributes<SVGPolygonElement>;
	polyline: PolylineSVGAttributes<SVGPolylineElement>;
	radialGradient: RadialGradientSVGAttributes<SVGRadialGradientElement>;
	rect: RectSVGAttributes<SVGRectElement>;
	stop: StopSVGAttributes<SVGStopElement>;
	svg: SvgSVGAttributes<SVGSVGElement>;
	switch: SwitchSVGAttributes<SVGSwitchElement>;
	symbol: SymbolSVGAttributes<SVGSymbolElement>;
	text: TextSVGAttributes<SVGTextElement>;
	textPath: TextPathSVGAttributes<SVGTextPathElement>;
	tspan: TSpanSVGAttributes<SVGTSpanElement>;
	use: UseSVGAttributes<SVGUseElement>;
	view: ViewSVGAttributes<SVGViewElement>;
}
