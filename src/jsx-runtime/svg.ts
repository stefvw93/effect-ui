import type { StandardProperties as CSSProperties } from "csstype";
import type { DOMAttributes } from "./dom";
import type { AttributeValue, StyleAttributeValue } from "./values";

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
	id?: AttributeValue<string>;
	lang?: AttributeValue<string>;
	/**
	 * A space-separated list of the part names of the element. Part names allows CSS to select and style specific elements in a shadow tree via the ::part pseudo-element.
	 */
	part?: AttributeValue<string>;
	/**
	 * An integer attribute indicating if the element can take input focus (is focusable), if it should participate to sequential keyboard navigation, and if so, at what position. It can take several values: a negative value means that the element should be focusable, but should not be reachable via sequential keyboard navigation; 0 means that the element should be focusable and reachable via sequential keyboard navigation, but its relative order is defined by the platform convention; a positive value means that the element should be focusable and reachable via sequential keyboard navigation; the order in which the elements are focused is the increasing value of the tabindex. If several elements share the same tabindex, their relative order follows their relative positions in the document.
	 */
	tabindex?: AttributeValue<number | string>;
}
interface StylableSVGAttributes {
	class?: AttributeValue<string>;
	style?: AttributeValue<StyleAttributeValue>;
}
interface TransformableSVGAttributes {
	transform?: AttributeValue<string>;
}
interface ConditionalProcessingSVGAttributes {
	requiredExtensions?: AttributeValue<string>;
	requiredFeatures?: AttributeValue<string>;
	systemLanguage?: AttributeValue<string>;
}
interface ExternalResourceSVGAttributes {
	externalResourcesRequired?: AttributeValue<"true" | "false">;
}
interface AnimationTimingSVGAttributes {
	begin?: AttributeValue<number | string>;
	dur?: AttributeValue<number | string>;
	end?: AttributeValue<number | string>;
	min?: AttributeValue<number | string>;
	max?: AttributeValue<number | string>;
	restart?: AttributeValue<"always" | "whenNotActive" | "never">;
	repeatCount?: AttributeValue<number | string | "indefinite">;
	repeatDur?: AttributeValue<number | string>;
	fill?: AttributeValue<"freeze" | "remove">;
}
interface AnimationValueSVGAttributes {
	calcMode?: AttributeValue<"discrete" | "linear" | "paced" | "spline">;
	values?: AttributeValue<string>;
	keyTimes?: AttributeValue<string>;
	keySplines?: AttributeValue<string>;
	from?: AttributeValue<number | string>;
	to?: AttributeValue<number | string>;
	by?: AttributeValue<number | string>;
}
interface AnimationAdditionSVGAttributes {
	attributeName?: AttributeValue<string>;
	additive?: AttributeValue<"replace" | "sum">;
	accumulate?: AttributeValue<"none" | "sum">;
}
interface AnimationAttributeTargetSVGAttributes {
	attributeName?: AttributeValue<string>;
	attributeType?: AttributeValue<"CSS" | "XML" | "auto">;
}
interface PresentationSVGAttributes {
	"alignment-baseline"?: AttributeValue<
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
		| "inherit"
	>;
	"baseline-shift"?: AttributeValue<number | string>;
	clip?: AttributeValue<string>;
	"clip-path"?: AttributeValue<string>;
	"clip-rule"?: AttributeValue<"nonzero" | "evenodd" | "inherit">;
	color?: AttributeValue<string>;
	"color-interpolation"?: AttributeValue<
		"auto" | "sRGB" | "linearRGB" | "inherit"
	>;
	"color-interpolation-filters"?: AttributeValue<
		"auto" | "sRGB" | "linearRGB" | "inherit"
	>;
	"color-profile"?: AttributeValue<string>;
	"color-rendering"?: AttributeValue<
		"auto" | "optimizeSpeed" | "optimizeQuality" | "inherit"
	>;
	cursor?: AttributeValue<string>;
	direction?: AttributeValue<"ltr" | "rtl" | "inherit">;
	display?: AttributeValue<string>;
	"dominant-baseline"?: AttributeValue<
		| "auto"
		| "text-bottom"
		| "alphabetic"
		| "ideographic"
		| "middle"
		| "central"
		| "mathematical"
		| "hanging"
		| "text-top"
		| "inherit"
	>;
	"enable-background"?: AttributeValue<string>;
	fill?: AttributeValue<string>;
	"fill-opacity"?: AttributeValue<number | string | "inherit">;
	"fill-rule"?: AttributeValue<"nonzero" | "evenodd" | "inherit">;
	filter?: AttributeValue<string>;
	"flood-color"?: AttributeValue<string>;
	"flood-opacity"?: AttributeValue<number | string | "inherit">;
	"font-family"?: AttributeValue<string>;
	"font-size"?: AttributeValue<number | string>;
	"font-size-adjust"?: AttributeValue<number | string>;
	"font-stretch"?: AttributeValue<string>;
	"font-style"?: AttributeValue<"normal" | "italic" | "oblique" | "inherit">;
	"font-variant"?: AttributeValue<string>;
	"font-weight"?: AttributeValue<number | string>;
	"glyph-orientation-horizontal"?: AttributeValue<string>;
	"glyph-orientation-vertical"?: AttributeValue<string>;
	"image-rendering"?: AttributeValue<
		"auto" | "optimizeQuality" | "optimizeSpeed" | "inherit"
	>;
	kerning?: AttributeValue<string>;
	"letter-spacing"?: AttributeValue<number | string>;
	"lighting-color"?: AttributeValue<string>;
	"marker-end"?: AttributeValue<string>;
	"marker-mid"?: AttributeValue<string>;
	"marker-start"?: AttributeValue<string>;
	mask?: AttributeValue<string>;
	opacity?: AttributeValue<number | string | "inherit">;
	overflow?: AttributeValue<
		"visible" | "hidden" | "scroll" | "auto" | "inherit"
	>;
	"pointer-events"?: AttributeValue<
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
		| "inherit"
	>;
	"shape-rendering"?: AttributeValue<
		"auto" | "optimizeSpeed" | "crispEdges" | "geometricPrecision" | "inherit"
	>;
	"stop-color"?: AttributeValue<string>;
	"stop-opacity"?: AttributeValue<number | string | "inherit">;
	stroke?: AttributeValue<string>;
	"stroke-dasharray"?: AttributeValue<string>;
	"stroke-dashoffset"?: AttributeValue<number | string>;
	"stroke-linecap"?: AttributeValue<"butt" | "round" | "square" | "inherit">;
	"stroke-linejoin"?: AttributeValue<
		"arcs" | "bevel" | "miter" | "miter-clip" | "round" | "inherit"
	>;
	"stroke-miterlimit"?: AttributeValue<number | string | "inherit">;
	"stroke-opacity"?: AttributeValue<number | string | "inherit">;
	"stroke-width"?: AttributeValue<number | string>;
	"text-anchor"?: AttributeValue<"start" | "middle" | "end" | "inherit">;
	"text-decoration"?: AttributeValue<
		"none" | "underline" | "overline" | "line-through" | "blink" | "inherit"
	>;
	"text-rendering"?: AttributeValue<
		| "auto"
		| "optimizeSpeed"
		| "optimizeLegibility"
		| "geometricPrecision"
		| "inherit"
	>;
	"unicode-bidi"?: AttributeValue<string>;
	visibility?: AttributeValue<"visible" | "hidden" | "collapse" | "inherit">;
	"word-spacing"?: AttributeValue<number | string>;
	"writing-mode"?: AttributeValue<
		"lr-tb" | "rl-tb" | "tb-rl" | "lr" | "rl" | "tb" | "inherit"
	>;
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
	x?: AttributeValue<number | string>;
	y?: AttributeValue<number | string>;
	width?: AttributeValue<number | string>;
	height?: AttributeValue<number | string>;
	result?: AttributeValue<string>;
}
interface SingleInputFilterSVGAttributes {
	in?: AttributeValue<string>;
}
interface DoubleInputFilterSVGAttributes {
	in?: AttributeValue<string>;
	in2?: AttributeValue<string>;
}
interface FitToViewBoxSVGAttributes {
	viewBox?: AttributeValue<string>;
	preserveAspectRatio?: AttributeValue<SVGPreserveAspectRatio>;
}
interface GradientElementSVGAttributes<T>
	extends SVGAttributes<T>,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes {
	gradientUnits?: AttributeValue<SVGUnits>;
	gradientTransform?: AttributeValue<string>;
	spreadMethod?: AttributeValue<"pad" | "reflect" | "repeat">;
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
	viewBox?: AttributeValue<string>;
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
	zoomAndPan?: AttributeValue<"disable" | "magnify">;
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
	path?: AttributeValue<string>;
	keyPoints?: AttributeValue<string>;
	rotate?: AttributeValue<number | string | "auto" | "auto-reverse">;
	origin?: AttributeValue<"default">;
}
interface AnimateTransformSVGAttributes<T>
	extends AnimationElementSVGAttributes<T>,
		AnimationAttributeTargetSVGAttributes,
		AnimationTimingSVGAttributes,
		AnimationValueSVGAttributes,
		AnimationAdditionSVGAttributes {
	type?: AttributeValue<"translate" | "scale" | "rotate" | "skewX" | "skewY">;
}
interface CircleSVGAttributes<T>
	extends GraphicsElementSVGAttributes<T>,
		ShapeElementSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		StylableSVGAttributes,
		TransformableSVGAttributes {
	cx?: AttributeValue<number | string>;
	cy?: AttributeValue<number | string>;
	r?: AttributeValue<number | string>;
}
interface ClipPathSVGAttributes<T>
	extends SVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		TransformableSVGAttributes,
		Pick<PresentationSVGAttributes, "clip-path"> {
	clipPathUnits?: AttributeValue<SVGUnits>;
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
	cx?: AttributeValue<number | string>;
	cy?: AttributeValue<number | string>;
	rx?: AttributeValue<number | string>;
	ry?: AttributeValue<number | string>;
}
interface FeBlendSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		DoubleInputFilterSVGAttributes,
		StylableSVGAttributes {
	mode?: AttributeValue<
		"normal" | "multiply" | "screen" | "darken" | "lighten"
	>;
}
interface FeColorMatrixSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		SingleInputFilterSVGAttributes,
		StylableSVGAttributes {
	type?: AttributeValue<
		"matrix" | "saturate" | "hueRotate" | "luminanceToAlpha"
	>;
	values?: AttributeValue<string>;
}
interface FeComponentTransferSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		SingleInputFilterSVGAttributes,
		StylableSVGAttributes {}
interface FeCompositeSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		DoubleInputFilterSVGAttributes,
		StylableSVGAttributes {
	operator?: AttributeValue<
		"over" | "in" | "out" | "atop" | "xor" | "arithmetic"
	>;
	k1?: AttributeValue<number | string>;
	k2?: AttributeValue<number | string>;
	k3?: AttributeValue<number | string>;
	k4?: AttributeValue<number | string>;
}
interface FeConvolveMatrixSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		SingleInputFilterSVGAttributes,
		StylableSVGAttributes {
	order?: AttributeValue<number | string>;
	kernelMatrix?: AttributeValue<string>;
	divisor?: AttributeValue<number | string>;
	bias?: AttributeValue<number | string>;
	targetX?: AttributeValue<number | string>;
	targetY?: AttributeValue<number | string>;
	edgeMode?: AttributeValue<"duplicate" | "wrap" | "none">;
	kernelUnitLength?: AttributeValue<number | string>;
	preserveAlpha?: AttributeValue<"true" | "false">;
}
interface FeDiffuseLightingSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		SingleInputFilterSVGAttributes,
		StylableSVGAttributes,
		Pick<PresentationSVGAttributes, "color" | "lighting-color"> {
	surfaceScale?: AttributeValue<number | string>;
	diffuseConstant?: AttributeValue<number | string>;
	kernelUnitLength?: AttributeValue<number | string>;
}
interface FeDisplacementMapSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		DoubleInputFilterSVGAttributes,
		StylableSVGAttributes {
	scale?: AttributeValue<number | string>;
	xChannelSelector?: AttributeValue<"R" | "G" | "B" | "A">;
	yChannelSelector?: AttributeValue<"R" | "G" | "B" | "A">;
}
interface FeDistantLightSVGAttributes<T>
	extends LightSourceElementSVGAttributes<T> {
	azimuth?: AttributeValue<number | string>;
	elevation?: AttributeValue<number | string>;
}
interface FeFloodSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		StylableSVGAttributes,
		Pick<
			PresentationSVGAttributes,
			"color" | "flood-color" | "flood-opacity"
		> {}
interface FeFuncSVGAttributes<T> extends SVGAttributes<T> {
	type?: AttributeValue<"identity" | "table" | "discrete" | "linear" | "gamma">;
	tableValues?: AttributeValue<string>;
	slope?: AttributeValue<number | string>;
	intercept?: AttributeValue<number | string>;
	amplitude?: AttributeValue<number | string>;
	exponent?: AttributeValue<number | string>;
	offset?: AttributeValue<number | string>;
}
interface FeGaussianBlurSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		SingleInputFilterSVGAttributes,
		StylableSVGAttributes {
	stdDeviation?: AttributeValue<number | string>;
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
	operator?: AttributeValue<"erode" | "dilate">;
	radius?: AttributeValue<number | string>;
}
interface FeOffsetSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		SingleInputFilterSVGAttributes,
		StylableSVGAttributes {
	dx?: AttributeValue<number | string>;
	dy?: AttributeValue<number | string>;
}
interface FePointLightSVGAttributes<T>
	extends LightSourceElementSVGAttributes<T> {
	x?: AttributeValue<number | string>;
	y?: AttributeValue<number | string>;
	z?: AttributeValue<number | string>;
}
interface FeSpecularLightingSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		SingleInputFilterSVGAttributes,
		StylableSVGAttributes,
		Pick<PresentationSVGAttributes, "color" | "lighting-color"> {
	surfaceScale?: AttributeValue<number | string>;
	specularConstant?: AttributeValue<number | string>;
	specularExponent?: AttributeValue<number | string>;
	kernelUnitLength?: AttributeValue<number | string>;
}
interface FeSpotLightSVGAttributes<T>
	extends LightSourceElementSVGAttributes<T> {
	x?: AttributeValue<number | string>;
	y?: AttributeValue<number | string>;
	z?: AttributeValue<number | string>;
	pointsAtX?: AttributeValue<number | string>;
	pointsAtY?: AttributeValue<number | string>;
	pointsAtZ?: AttributeValue<number | string>;
	specularExponent?: AttributeValue<number | string>;
	limitingConeAngle?: AttributeValue<number | string>;
}
interface FeTileSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		SingleInputFilterSVGAttributes,
		StylableSVGAttributes {}
interface FeTurbulanceSVGAttributes<T>
	extends FilterPrimitiveElementSVGAttributes<T>,
		StylableSVGAttributes {
	baseFrequency?: AttributeValue<number | string>;
	numOctaves?: AttributeValue<number | string>;
	seed?: AttributeValue<number | string>;
	stitchTiles?: AttributeValue<"stitch" | "noStitch">;
	type?: AttributeValue<"fractalNoise" | "turbulence">;
}
interface FilterSVGAttributes<T>
	extends SVGAttributes<T>,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes {
	filterUnits?: AttributeValue<SVGUnits>;
	primitiveUnits?: AttributeValue<SVGUnits>;
	x?: AttributeValue<number | string>;
	y?: AttributeValue<number | string>;
	width?: AttributeValue<number | string>;
	height?: AttributeValue<number | string>;
	filterRes?: AttributeValue<number | string>;
}
interface ForeignObjectSVGAttributes<T>
	extends NewViewportSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		TransformableSVGAttributes,
		Pick<PresentationSVGAttributes, "display" | "visibility"> {
	x?: AttributeValue<number | string>;
	y?: AttributeValue<number | string>;
	width?: AttributeValue<number | string>;
	height?: AttributeValue<number | string>;
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
	x?: AttributeValue<number | string>;
	y?: AttributeValue<number | string>;
	width?: AttributeValue<number | string>;
	height?: AttributeValue<number | string>;
	preserveAspectRatio?: AttributeValue<ImagePreserveAspectRatio>;
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
	x1?: AttributeValue<number | string>;
	y1?: AttributeValue<number | string>;
	x2?: AttributeValue<number | string>;
	y2?: AttributeValue<number | string>;
}
interface LinearGradientSVGAttributes<T>
	extends GradientElementSVGAttributes<T> {
	x1?: AttributeValue<number | string>;
	x2?: AttributeValue<number | string>;
	y1?: AttributeValue<number | string>;
	y2?: AttributeValue<number | string>;
}
interface MarkerSVGAttributes<T>
	extends ContainerElementSVGAttributes<T>,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		FitToViewBoxSVGAttributes,
		Pick<PresentationSVGAttributes, "overflow" | "clip"> {
	markerUnits?: AttributeValue<"strokeWidth" | "userSpaceOnUse">;
	refX?: AttributeValue<number | string>;
	refY?: AttributeValue<number | string>;
	markerWidth?: AttributeValue<number | string>;
	markerHeight?: AttributeValue<number | string>;
	orient?: AttributeValue<string>;
}
interface MaskSVGAttributes<T>
	extends Omit<ContainerElementSVGAttributes<T>, "opacity" | "filter">,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes {
	maskUnits?: AttributeValue<SVGUnits>;
	maskContentUnits?: AttributeValue<SVGUnits>;
	x?: AttributeValue<number | string>;
	y?: AttributeValue<number | string>;
	width?: AttributeValue<number | string>;
	height?: AttributeValue<number | string>;
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
	d?: AttributeValue<string>;
	pathLength?: AttributeValue<number | string>;
}
interface PatternSVGAttributes<T>
	extends ContainerElementSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		FitToViewBoxSVGAttributes,
		Pick<PresentationSVGAttributes, "overflow" | "clip"> {
	x?: AttributeValue<number | string>;
	y?: AttributeValue<number | string>;
	width?: AttributeValue<number | string>;
	height?: AttributeValue<number | string>;
	patternUnits?: AttributeValue<SVGUnits>;
	patternContentUnits?: AttributeValue<SVGUnits>;
	patternTransform?: AttributeValue<string>;
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
	points?: AttributeValue<string>;
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
	points?: AttributeValue<string>;
}
interface RadialGradientSVGAttributes<T>
	extends GradientElementSVGAttributes<T> {
	cx?: AttributeValue<number | string>;
	cy?: AttributeValue<number | string>;
	r?: AttributeValue<number | string>;
	fx?: AttributeValue<number | string>;
	fy?: AttributeValue<number | string>;
}
interface RectSVGAttributes<T>
	extends GraphicsElementSVGAttributes<T>,
		ShapeElementSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		TransformableSVGAttributes {
	x?: AttributeValue<number | string>;
	y?: AttributeValue<number | string>;
	width?: AttributeValue<number | string>;
	height?: AttributeValue<number | string>;
	rx?: AttributeValue<number | string>;
	ry?: AttributeValue<number | string>;
}
interface StopSVGAttributes<T>
	extends SVGAttributes<T>,
		StylableSVGAttributes,
		Pick<PresentationSVGAttributes, "color" | "stop-color" | "stop-opacity"> {
	offset?: AttributeValue<number | string>;
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
	version?: AttributeValue<string>;
	"base-profile"?: AttributeValue<string>;
	x?: AttributeValue<number | string>;
	y?: AttributeValue<number | string>;
	width?: AttributeValue<number | string>;
	height?: AttributeValue<number | string>;
	contentScriptType?: AttributeValue<string>;
	contentStyleType?: AttributeValue<string>;
	xmlns?: AttributeValue<string>;
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
	x?: AttributeValue<number | string>;
	y?: AttributeValue<number | string>;
	dx?: AttributeValue<number | string>;
	dy?: AttributeValue<number | string>;
	rotate?: AttributeValue<number | string>;
	textLength?: AttributeValue<number | string>;
	lengthAdjust?: AttributeValue<"spacing" | "spacingAndGlyphs">;
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
	startOffset?: AttributeValue<number | string>;
	method?: AttributeValue<"align" | "stretch">;
	spacing?: AttributeValue<"auto" | "exact">;
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
	x?: AttributeValue<number | string>;
	y?: AttributeValue<number | string>;
	dx?: AttributeValue<number | string>;
	dy?: AttributeValue<number | string>;
	rotate?: AttributeValue<number | string>;
	textLength?: AttributeValue<number | string>;
	lengthAdjust?: AttributeValue<"spacing" | "spacingAndGlyphs">;
}
interface UseSVGAttributes<T>
	extends GraphicsElementSVGAttributes<T>,
		ConditionalProcessingSVGAttributes,
		ExternalResourceSVGAttributes,
		StylableSVGAttributes,
		TransformableSVGAttributes {
	href?: AttributeValue<string>;
	x?: AttributeValue<number | string>;
	y?: AttributeValue<number | string>;
	width?: AttributeValue<number | string>;
	height?: AttributeValue<number | string>;
}
interface ViewSVGAttributes<T>
	extends SVGAttributes<T>,
		ExternalResourceSVGAttributes,
		FitToViewBoxSVGAttributes,
		ZoomAndPanSVGAttributes {
	viewTarget?: AttributeValue<string>;
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
