import { Effect } from "effect";
import type { MountHandle } from "@/dom";
import { mount } from "@/dom";
import type { JSXNode } from "@/jsx-runtime";
import type { HydrationOptions, HydrationPriority } from "./index";

/**
 * Progressive hydration system for server-rendered HTML
 */

// Track hydrated components to prevent double hydration
const hydratedComponents = new Set<string>();

/**
 * Progressively hydrates server-rendered HTML with client-side interactivity.
 *
 * @param app - The JSX tree (same as used for SSR)
 * @param root - The root element containing SSR HTML
 * @param options - Optional hydration configuration
 * @returns An Effect that yields a cleanup handle
 */
export function hydrate(
	app: JSXNode,
	root: HTMLElement,
	options: HydrationOptions = {},
): Effect.Effect<MountHandle> {
	const innerEffect = Effect.gen(function* () {
		const {
			validateProps = true,
			priorityOverrides = new Map(),
			onHydrate,
		} = options;

		// Find all hydration markers
		const hydrationPoints = findHydrationPoints(root);

		// Group by priority
		const immediate: HTMLElement[] = [];
		const visible: HTMLElement[] = [];
		const idle: HTMLElement[] = [];

		for (const element of hydrationPoints) {
			const hid = element.getAttribute("data-hid");
			if (!hid || hydratedComponents.has(hid)) {
				continue;
			}

			const priority = (element.getAttribute("data-hydrate-priority") ||
				priorityOverrides.get(hid) ||
				"visible") as HydrationPriority;

			switch (priority) {
				case "immediate":
					immediate.push(element);
					break;
				case "idle":
					idle.push(element);
					break;
				default:
					visible.push(element);
			}
		}

		// Hydrate immediate components synchronously
		for (const element of immediate) {
			yield* hydrateElement(element, app, onHydrate);
		}

		// Set up intersection observer for visible components
		if (visible.length > 0) {
			setupVisibleHydration(visible, app, onHydrate);
		}

		// Set up idle hydration
		if (idle.length > 0) {
			setupIdleHydration(idle, app, onHydrate);
		}

		// For now, use the regular mount function
		// In a real implementation, we would patch the existing DOM
		// rather than re-rendering everything
		const mountResult = yield* mount(app, root).pipe(
			Effect.mapError(() => new Error("Hydration failed")),
		);
		return mountResult;
	}).pipe(
		Effect.catchAll((error) => {
			console.error("Hydration error:", error);
			// Fallback to client-side mount
			return mount(app, root).pipe(
				Effect.mapError(() => new Error("Mount failed")),
			);
		}),
	);

	// Convert any errors to die to match expected signature
	return innerEffect.pipe(
		Effect.catchAll((error) => {
			console.error("Critical hydration error:", error);
			return Effect.die(error);
		}),
	);
}

/**
 * Finds all elements with hydration markers
 */
function findHydrationPoints(root: HTMLElement): HTMLElement[] {
	const points: HTMLElement[] = [];
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
		acceptNode(node) {
			const element = node as HTMLElement;
			if (element.hasAttribute("data-hid")) {
				return NodeFilter.FILTER_ACCEPT;
			}
			return NodeFilter.FILTER_SKIP;
		},
	});

	let node: Node | null;
	// biome-ignore lint/suspicious/noAssignInExpressions: tree walker pattern
	while ((node = walker.nextNode())) {
		points.push(node as HTMLElement);
	}

	return points;
}

/**
 * Hydrates a single element
 */
function hydrateElement(
	element: HTMLElement,
	app: JSXNode,
	onHydrate?: (metadata: any) => void,
): Effect.Effect<void> {
	return Effect.sync(() => {
		const hid = element.getAttribute("data-hid");
		if (!hid) return;

		// Mark as hydrated
		hydratedComponents.add(hid);

		// Get component metadata
		const componentName = element.getAttribute("data-component");
		const priority = element.getAttribute("data-hydrate-priority");

		// Call hydration callback
		if (onHydrate) {
			onHydrate({
				id: hid,
				type: componentName || element.tagName.toLowerCase(),
				priority: priority as HydrationPriority,
			});
		}

		// In a real implementation, we would:
		// 1. Find the corresponding component in the JSX tree
		// 2. Attach event handlers
		// 3. Set up stream subscriptions
		// 4. Validate props if required
		// For now, this is a placeholder
	});
}

/**
 * Sets up intersection observer for visible hydration
 */
function setupVisibleHydration(
	elements: HTMLElement[],
	app: JSXNode,
	onHydrate?: (metadata: any) => void,
): void {
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					const element = entry.target as HTMLElement;
					Effect.runPromise(hydrateElement(element, app, onHydrate)).catch(
						console.error,
					);
					observer.unobserve(element);
				}
			}
		},
		{ threshold: 0.1 },
	);

	for (const element of elements) {
		observer.observe(element);
	}
}

/**
 * Sets up idle callback for low-priority hydration
 */
function setupIdleHydration(
	elements: HTMLElement[],
	app: JSXNode,
	onHydrate?: (metadata: any) => void,
): void {
	if ("requestIdleCallback" in window) {
		const hydrate = () => {
			const element = elements.shift();
			if (!element) return;

			Effect.runPromise(hydrateElement(element, app, onHydrate)).catch(
				console.error,
			);

			if (elements.length > 0) {
				requestIdleCallback(hydrate);
			}
		};

		requestIdleCallback(hydrate);
	} else {
		// Fallback to setTimeout for browsers without requestIdleCallback
		for (const element of elements) {
			setTimeout(() => {
				Effect.runPromise(hydrateElement(element, app, onHydrate)).catch(
					console.error,
				);
			}, 0);
		}
	}
}

/**
 * Client-only wrapper component
 */
export function ClientOnly(props: {
	children: JSXNode;
	fallback?: JSXNode;
}): JSXNode {
	if (typeof window === "undefined") {
		return props.fallback || null;
	}
	return props.children;
}

/**
 * Server-only wrapper component
 */
export function ServerOnly(props: { children: JSXNode }): JSXNode {
	if (typeof window !== "undefined") {
		return null;
	}
	return props.children;
}

/**
 * Checks if code is running on the server
 */
export function isServer(): boolean {
	return typeof window === "undefined";
}

/**
 * Checks if code is running on the client
 */
export function isClient(): boolean {
	return typeof window !== "undefined";
}
