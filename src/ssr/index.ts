import type { Effect, Stream } from "effect";
import type { MountHandle } from "@/dom";
import type { JSXNode } from "@/jsx-runtime";

// ============================================================================
// SSR Options
// ============================================================================

/**
 * Priority levels for progressive hydration
 */
export type HydrationPriority = "immediate" | "visible" | "idle";

/**
 * Options for configuring server-side rendering
 */
export interface SSROptions {
	/**
	 * Whether to include DOCTYPE declaration
	 * @default false
	 */
	includeDoctype?: boolean;

	/**
	 * Whether to include hydration markers for client-side hydration
	 * @default true
	 */
	enableHydration?: boolean;

	/**
	 * Whether to enable progressive hydration
	 * @default true
	 */
	enableProgressiveHydration?: boolean;

	/**
	 * Default hydration priority for components
	 * @default "visible"
	 */
	defaultHydrationPriority?: HydrationPriority;

	/**
	 * Timeout for awaiting stream first values (in milliseconds)
	 * @default 5000
	 */
	streamTimeout?: number;

	/**
	 * Custom runtime to use for Effect execution
	 */
	runtime?: unknown; // Will be ManagedRuntime type
}

// ============================================================================
// Hydration Metadata
// ============================================================================

/**
 * Metadata for a hydration point
 */
export interface HydrationMetadata {
	/** Unique hydration ID */
	id: string;
	/** Component name or element type */
	type: string;
	/** Hydration priority */
	priority: HydrationPriority;
	/** Serialized props for validation */
	propsHash?: string;
	/** Stream IDs for reactive subscriptions */
	streamIds?: string[];
	/** Whether element has event handlers */
	hasHandlers?: boolean;
}

/**
 * Manifest of all hydration points in the rendered tree
 */
export interface HydrationManifest {
	/** Map of hydration ID to metadata */
	hydrationPoints: Map<string, HydrationMetadata>;
	/** Global counter for generating unique IDs */
	idCounter: number;
}

// ============================================================================
// SSR Context
// ============================================================================

/**
 * Context for server-side rendering
 */
declare class SSRContext {
	readonly options: SSROptions;
	readonly manifest: HydrationManifest;
	readonly streamIdCounter: { current: number };
	readonly hydrationIdCounter: { current: number };

	constructor(options?: SSROptions);

	/** Generate next unique hydration ID */
	nextHydrationId(): string;

	/** Generate next unique stream ID */
	nextStreamId(): string;

	/** Register a hydration point */
	registerHydrationPoint(metadata: HydrationMetadata): void;
}

// ============================================================================
// HTML Generation
// ============================================================================

/**
 * Escapes text content for safe HTML rendering
 */
declare function escapeHtml(text: string): string;

/**
 * Escapes attribute values for safe HTML rendering
 */
declare function escapeAttribute(value: string): string;

/**
 * Converts a style object to CSS string
 */
declare function styleToString(style: Record<string, unknown>): string;

/**
 * Serializes HTML attributes from props
 */
declare function serializeAttributes(
	props: Record<string, unknown>,
	context: SSRContext,
): string;

// ============================================================================
// Core Rendering Functions
// ============================================================================

/**
 * Renders a JSXNode to an HTML string
 */
declare function renderNodeToString(
	node: JSXNode,
	context: SSRContext,
): Effect.Effect<string, unknown>;

/**
 * Renders an HTML element to string
 */
declare function renderElementToString(
	type: string,
	props: object,
	context: SSRContext,
): Effect.Effect<string, unknown>;

/**
 * Renders a function component to string
 */
declare function renderComponentToString(
	component: (props: object) => JSXNode,
	props: object,
	context: SSRContext,
): Effect.Effect<string, unknown>;

/**
 * Handles Stream values during SSR (awaits first value)
 */
declare function awaitStreamFirstValue<T>(
	stream: Stream.Stream<T>,
	context: SSRContext,
): Effect.Effect<T | undefined, unknown>;

// ============================================================================
// Public API
// ============================================================================

export {
	ClientOnly,
	hydrate,
	isClient,
	isServer,
	ServerOnly,
} from "./hydration";
// Export the actual implementations
export { renderToStream, renderToString } from "./render-to-stream";

// ============================================================================
// Hydration API
// ============================================================================

/**
 * Options for client-side hydration
 */
export interface HydrationOptions {
	/**
	 * Whether to validate props hash during hydration
	 * @default true
	 */
	validateProps?: boolean;

	/**
	 * Custom priority override for specific components
	 */
	priorityOverrides?: Map<string, HydrationPriority>;

	/**
	 * Callback when a component is hydrated
	 */
	onHydrate?: (metadata: HydrationMetadata) => void;
}

// The actual implementations are exported above from "./hydration"
// No need for duplicate declarations here
