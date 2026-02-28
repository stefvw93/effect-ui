import type { Effect, Stream } from "effect";

/**
 * Event handler function that can return void or an Effect.
 * Effects are automatically run with the runtime from mount context.
 */
export type EventHandlerFn<T, E extends Event> = (
	e: E & { currentTarget: T; target: Element },
) => void | Effect.Effect<void, unknown, unknown>;

/**
 * Event handler type following the AttributeValue pattern.
 * Supports static handlers, Stream<Handler>, or Effect<Handler>.
 */
export type EventHandler<T, E extends Event> =
	| EventHandlerFn<T, E>
	| Stream.Stream<EventHandlerFn<T, E> | null | false>
	| Effect.Effect<EventHandlerFn<T, E> | null | false>;

export interface DOMAttributes<T> {
	onabort?: null | false | EventHandler<T, Event>;
	onanimationend?: null | false | EventHandler<T, AnimationEvent>;
	onanimationiteration?: null | false | EventHandler<T, AnimationEvent>;
	onanimationstart?: null | false | EventHandler<T, AnimationEvent>;
	onblur?: null | false | EventHandler<T, FocusEvent>;
	oncanplay?: null | false | EventHandler<T, Event>;
	oncanplaythrough?: null | false | EventHandler<T, Event>;
	onchange?: null | false | EventHandler<T, Event>;
	onclick?: null | false | EventHandler<T, MouseEvent>;
	oncompositionend?: null | false | EventHandler<T, CompositionEvent>;
	oncompositionstart?: null | false | EventHandler<T, CompositionEvent>;
	oncompositionupdate?: null | false | EventHandler<T, CompositionEvent>;
	oncontextmenu?: null | false | EventHandler<T, MouseEvent>;
	oncopy?: null | false | EventHandler<T, ClipboardEvent>;
	oncut?: null | false | EventHandler<T, ClipboardEvent>;
	ondblclick?: null | false | EventHandler<T, MouseEvent>;
	ondrag?: null | false | EventHandler<T, DragEvent>;
	ondragend?: null | false | EventHandler<T, DragEvent>;
	ondragenter?: null | false | EventHandler<T, DragEvent>;
	ondragexit?: null | false | EventHandler<T, DragEvent>;
	ondragleave?: null | false | EventHandler<T, DragEvent>;
	ondragover?: null | false | EventHandler<T, DragEvent>;
	ondragstart?: null | false | EventHandler<T, DragEvent>;
	ondrop?: null | false | EventHandler<T, DragEvent>;
	ondurationchange?: null | false | EventHandler<T, Event>;
	onemptied?: null | false | EventHandler<T, Event>;
	onencrypted?: null | false | EventHandler<T, Event>;
	onended?: null | false | EventHandler<T, Event>;
	onerror?: null | false | EventHandler<T, Event>;
	onfocus?: null | false | EventHandler<T, FocusEvent>;
	ongotpointercapture?: null | false | EventHandler<T, PointerEvent>;
	oninput?: null | false | EventHandler<T, InputEvent>;
	onkeydown?: null | false | EventHandler<T, KeyboardEvent>;
	onkeypress?: null | false | EventHandler<T, KeyboardEvent>;
	onkeyup?: null | false | EventHandler<T, KeyboardEvent>;
	onload?: null | false | EventHandler<T, Event>;
	onloadeddata?: null | false | EventHandler<T, Event>;
	onloadedmetadata?: null | false | EventHandler<T, Event>;
	onloadstart?: null | false | EventHandler<T, Event>;
	onlostpointercapture?: null | false | EventHandler<T, PointerEvent>;
	onmousedown?: null | false | EventHandler<T, MouseEvent>;
	onmouseenter?: null | false | EventHandler<T, MouseEvent>;
	onmouseleave?: null | false | EventHandler<T, MouseEvent>;
	onmousemove?: null | false | EventHandler<T, MouseEvent>;
	onmouseout?: null | false | EventHandler<T, MouseEvent>;
	onmouseover?: null | false | EventHandler<T, MouseEvent>;
	onmouseup?: null | false | EventHandler<T, MouseEvent>;
	onpaste?: null | false | EventHandler<T, ClipboardEvent>;
	onpause?: null | false | EventHandler<T, Event>;
	onplay?: null | false | EventHandler<T, Event>;
	onplaying?: null | false | EventHandler<T, Event>;
	onpointercancel?: null | false | EventHandler<T, PointerEvent>;
	onpointerdown?: null | false | EventHandler<T, PointerEvent>;
	onpointerenter?: null | false | EventHandler<T, PointerEvent>;
	onpointerleave?: null | false | EventHandler<T, PointerEvent>;
	onpointermove?: null | false | EventHandler<T, PointerEvent>;
	onpointerout?: null | false | EventHandler<T, PointerEvent>;
	onpointerover?: null | false | EventHandler<T, PointerEvent>;
	onpointerup?: null | false | EventHandler<T, PointerEvent>;
	onprogress?: null | false | EventHandler<T, Event>;
	onratechange?: null | false | EventHandler<T, Event>;
	onreset?: null | false | EventHandler<T, Event>;
	onscroll?: null | false | EventHandler<T, UIEvent>;
	onseeked?: null | false | EventHandler<T, Event>;
	onseeking?: null | false | EventHandler<T, Event>;
	onselect?: null | false | EventHandler<T, UIEvent>;
	onstalled?: null | false | EventHandler<T, Event>;
	onsubmit?: null | false | EventHandler<T, Event & { submitter: HTMLElement }>;
	onsuspend?: null | false | EventHandler<T, Event>;
	ontimeupdate?: null | false | EventHandler<T, Event>;
	ontouchcancel?: null | false | EventHandler<T, TouchEvent>;
	ontouchend?: null | false | EventHandler<T, TouchEvent>;
	ontouchmove?: null | false | EventHandler<T, TouchEvent>;
	ontouchstart?: null | false | EventHandler<T, TouchEvent>;
	ontransitionend?: null | false | EventHandler<T, TransitionEvent>;
	onvolumechange?: null | false | EventHandler<T, Event>;
	onwaiting?: null | false | EventHandler<T, Event>;
	onwheel?: null | false | EventHandler<T, WheelEvent>;
}
export type HTMLAutocapitalize =
	| "off"
	| "none"
	| "on"
	| "sentences"
	| "words"
	| "characters";
export type HTMLAutocomplete =
	| "additional-name"
	| "address-level1"
	| "address-level2"
	| "address-level3"
	| "address-level4"
	| "address-line1"
	| "address-line2"
	| "address-line3"
	| "bday"
	| "bday-year"
	| "bday-day"
	| "bday-month"
	| "billing"
	| "cc-additional-name"
	| "cc-csc"
	| "cc-exp"
	| "cc-exp-month"
	| "cc-exp-year"
	| "cc-family-name"
	| "cc-given-name"
	| "cc-name"
	| "cc-number"
	| "cc-type"
	| "country"
	| "country-name"
	| "current-password"
	| "email"
	| "family-name"
	| "fax"
	| "given-name"
	| "home"
	| "honorific-prefix"
	| "honorific-suffix"
	| "impp"
	| "language"
	| "mobile"
	| "name"
	| "new-password"
	| "nickname"
	| "organization"
	| "organization-title"
	| "pager"
	| "photo"
	| "postal-code"
	| "sex"
	| "shipping"
	| "street-address"
	| "tel-area-code"
	| "tel"
	| "tel-country-code"
	| "tel-extension"
	| "tel-local"
	| "tel-local-prefix"
	| "tel-local-suffix"
	| "tel-national"
	| "transaction-amount"
	| "transaction-currency"
	| "url"
	| "username"
	| "work";
export type HTMLCrossorigin = "anonymous" | "use-credentials" | "";
export type HTMLDir = "ltr" | "rtl" | "auto";
export type HTMLFormEncType =
	| "application/x-www-form-urlencoded"
	| "multipart/form-data"
	| "text/plain";
export type HTMLFormMethod = "post" | "get" | "dialog";
export type HTMLIframeSandbox =
	| "allow-downloads-without-user-activation"
	| "allow-forms"
	| "allow-modals"
	| "allow-orientation-lock"
	| "allow-pointer-lock"
	| "allow-popups"
	| "allow-popups-to-escape-sandbox"
	| "allow-presentation"
	| "allow-same-origin"
	| "allow-scripts"
	| "allow-storage-access-by-user-activation"
	| "allow-top-navigation"
	| "allow-top-navigation-by-user-activation";
export type HTMLLinkAs =
	| "audio"
	| "document"
	| "embed"
	| "fetch"
	| "font"
	| "image"
	| "object"
	| "script"
	| "style"
	| "track"
	| "video"
	| "worker";
export type HTMLReferrerPolicy =
	| "no-referrer"
	| "no-referrer-when-downgrade"
	| "origin"
	| "origin-when-cross-origin"
	| "same-origin"
	| "strict-origin"
	| "strict-origin-when-cross-origin"
	| "unsafe-url";
