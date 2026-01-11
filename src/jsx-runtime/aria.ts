import type { AttributeValue } from "./values";

// All the WAI-ARIA 1.1 attributes from https://www.w3.org/TR/wai-aria-1.1/
export interface AriaAttributes {
	/** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
	"aria-activedescendant"?: AttributeValue<string>;
	/** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
	"aria-atomic"?: AttributeValue<boolean | "false" | "true">;
	/**
	 * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
	 * presented if they are made.
	 */
	"aria-autocomplete"?: AttributeValue<"none" | "inline" | "list" | "both">;
	/** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
	"aria-busy"?: AttributeValue<boolean | "false" | "true">;
	/**
	 * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
	 * @see aria-pressed @see aria-selected.
	 */
	"aria-checked"?: AttributeValue<boolean | "false" | "mixed" | "true">;
	/**
	 * Defines the total number of columns in a table, grid, or treegrid.
	 * @see aria-colindex.
	 */
	"aria-colcount"?: AttributeValue<number>;
	/**
	 * Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.
	 * @see aria-colcount @see aria-colspan.
	 */
	"aria-colindex"?: AttributeValue<number>;
	/**
	 * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
	 * @see aria-colindex @see aria-rowspan.
	 */
	"aria-colspan"?: AttributeValue<number>;
	/**
	 * Identifies the element (or elements) whose contents or presence are controlled by the current element.
	 * @see aria-owns.
	 */
	"aria-controls"?: AttributeValue<string>;
	/** Indicates the element that represents the current item within a container or set of related elements. */
	"aria-current"?:
		| boolean
		| "false"
		| "true"
		| "page"
		| "step"
		| "location"
		| "date"
		| "time";
	/**
	 * Identifies the element (or elements) that describes the object.
	 * @see aria-labelledby
	 */
	"aria-describedby"?: AttributeValue<string>;
	/**
	 * Identifies the element that provides a detailed, extended description for the object.
	 * @see aria-describedby.
	 */
	"aria-details"?: AttributeValue<string>;
	/**
	 * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
	 * @see aria-hidden @see aria-readonly.
	 */
	"aria-disabled"?: AttributeValue<boolean | "false" | "true">;
	/**
	 * Indicates what functions can be performed when a dragged object is released on the drop target.
	 * @deprecated in ARIA 1.1
	 */
	"aria-dropeffect"?: AttributeValue<
		"none" | "copy" | "execute" | "link" | "move" | "popup"
	>;
	/**
	 * Identifies the element that provides an error message for the object.
	 * @see aria-invalid @see aria-describedby.
	 */
	"aria-errormessage"?: AttributeValue<string>;
	/** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
	"aria-expanded"?: AttributeValue<boolean | "false" | "true">;
	/**
	 * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
	 * allows assistive technology to override the general default of reading in document source order.
	 */
	"aria-flowto"?: AttributeValue<string>;
	/**
	 * Indicates an element's "grabbed" state in a drag-and-drop operation.
	 * @deprecated in ARIA 1.1
	 */
	"aria-grabbed"?: AttributeValue<boolean | "false" | "true">;
	/** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
	"aria-haspopup"?: AttributeValue<
		boolean | "false" | "true" | "menu" | "listbox" | "tree" | "grid" | "dialog"
	>;
	/**
	 * Indicates whether the element is exposed to an accessibility API.
	 * @see aria-disabled.
	 */
	"aria-hidden"?: AttributeValue<boolean | "false" | "true">;
	/**
	 * Indicates the entered value does not conform to the format expected by the application.
	 * @see aria-errormessage.
	 */
	"aria-invalid"?: AttributeValue<
		boolean | "false" | "true" | "grammar" | "spelling"
	>;
	/** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
	"aria-keyshortcuts"?: AttributeValue<string>;
	/**
	 * Defines a string value that labels the current element.
	 * @see aria-labelledby.
	 */
	"aria-label"?: AttributeValue<string>;
	/**
	 * Identifies the element (or elements) that labels the current element.
	 * @see aria-describedby.
	 */
	"aria-labelledby"?: AttributeValue<string>;
	/** Defines the hierarchical level of an element within a structure. */
	"aria-level"?: AttributeValue<number>;
	/** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
	"aria-live"?: AttributeValue<"off" | "assertive" | "polite">;
	/** Indicates whether an element is modal when displayed. */
	"aria-modal"?: AttributeValue<boolean | "false" | "true">;
	/** Indicates whether a text box accepts multiple lines of input or only a single line. */
	"aria-multiline"?: AttributeValue<boolean | "false" | "true">;
	/** Indicates that the user may select more than one item from the current selectable descendants. */
	"aria-multiselectable"?: AttributeValue<boolean | "false" | "true">;
	/** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
	"aria-orientation"?: AttributeValue<"horizontal" | "vertical">;
	/**
	 * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
	 * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
	 * @see aria-controls.
	 */
	"aria-owns"?: AttributeValue<string>;
	/**
	 * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
	 * A hint could be a sample value or a brief description of the expected format.
	 */
	"aria-placeholder"?: AttributeValue<string>;
	/**
	 * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
	 * @see aria-setsize.
	 */
	"aria-posinset"?: AttributeValue<number>;
	/**
	 * Indicates the current "pressed" state of toggle buttons.
	 * @see aria-checked @see aria-selected.
	 */
	"aria-pressed"?: AttributeValue<boolean | "false" | "mixed" | "true">;
	/**
	 * Indicates that the element is not editable, but is otherwise operable.
	 * @see aria-disabled.
	 */
	"aria-readonly"?: AttributeValue<boolean | "false" | "true">;
	/**
	 * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
	 * @see aria-atomic.
	 */
	"aria-relevant"?: AttributeValue<
		| "additions"
		| "additions removals"
		| "additions text"
		| "all"
		| "removals"
		| "removals additions"
		| "removals text"
		| "text"
		| "text additions"
		| "text removals"
	>;
	/** Indicates that user input is required on the element before a form may be submitted. */
	"aria-required"?: AttributeValue<boolean | "false" | "true">;
	/** Defines a human-readable, author-localized description for the role of an element. */
	"aria-roledescription"?: AttributeValue<string>;
	/**
	 * Defines the total number of rows in a table, grid, or treegrid.
	 * @see aria-rowindex.
	 */
	"aria-rowcount"?: AttributeValue<number>;
	/**
	 * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
	 * @see aria-rowcount @see aria-rowspan.
	 */
	"aria-rowindex"?: AttributeValue<number>;
	/**
	 * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
	 * @see aria-rowindex @see aria-colspan.
	 */
	"aria-rowspan"?: AttributeValue<number>;
	/**
	 * Indicates the current "selected" state of various widgets.
	 * @see aria-checked @see aria-pressed.
	 */
	"aria-selected"?: AttributeValue<boolean | "false" | "true">;
	/**
	 * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
	 * @see aria-posinset.
	 */
	"aria-setsize"?: AttributeValue<number>;
	/** Indicates if items in a table or grid are sorted in ascending or descending order. */
	"aria-sort"?: AttributeValue<"none" | "ascending" | "descending" | "other">;
	/** Defines the maximum allowed value for a range widget. */
	"aria-valuemax"?: AttributeValue<number>;
	/** Defines the minimum allowed value for a range widget. */
	"aria-valuemin"?: AttributeValue<number>;
	/**
	 * Defines the current value for a range widget.
	 * @see aria-valuetext.
	 */
	"aria-valuenow"?: AttributeValue<number>;
	/** Defines the human readable text alternative of aria-valuenow for a range widget. */
	"aria-valuetext"?: AttributeValue<string>;
}
