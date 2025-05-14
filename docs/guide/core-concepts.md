# Core Concepts

Understanding these core concepts will help you make the most of `Vue Floating UI Tour`.

## 1. The Tour Controller

At the heart of the library is the `TourController`. While you typically interact with the tour via the `useTour` composable in Vue, the controller is responsible for all the underlying logic:

* Managing the list of tour steps.
* Tracking the current active step.
* Handling the display and positioning of popovers using `@floating-ui/dom`.
* Managing target element highlighting and the screen overlay.
* Executing lifecycle callback functions.

You'll encounter a reference to the `TourControllerPublic` interface in various callback functions, allowing you to access tour state and methods from within those callbacks.

## 2. Defining Tour Steps (`TourStepDefinition`)

Each step in your tour is defined by an object conforming to the `TourStepDefinition` interface. This is the primary way you describe what each part of your tour should look like and how it should behave.

Key properties include:

* `target: string | HTMLElement`: The most crucial property. It specifies which element on the page the tour step's popover should point to. This can be a CSS selector string (e.g., `'#myButton'`, `'.user-profile'`) or a direct `HTMLElement` object.
* `content: string | ((step: TourStep, index: number, tour: TourControllerPublic) => string | HTMLElement)`: The content displayed inside the popover. You can provide:
    * A simple string (HTML is allowed).
    * A function that returns a string or an `HTMLElement`. This function receives the current `step` object, its `index`, and the `tour` controller instance, allowing for dynamic content.
* `title?: string`: An optional title for the popover.
* `placement?: Placement`: (from `@floating-ui/dom`) Determines the popover's position relative to the target (e.g., `'top'`, `'bottom-start'`, `'right-end'`). Defaults to the `defaultPlacement` in `TourOptions` or `'bottom'`.
* `id?: string`: An optional unique identifier for the step. Useful for navigating directly to this step using `jumpTo(stepId)`. If not provided, a unique ID is generated automatically.
* `offsetValue?: number`: Specifies the distance (in pixels) between the target element and the popover. Defaults to `defaultOffset` in `TourOptions` or `10`.
* `middleware?: Middleware[]`: (from `@floating-ui/dom`) For advanced users, you can provide an array of `@floating-ui/dom` middleware functions to customize positioning behavior (e.g., `shift()`, `flip()`, custom middleware).
* **Lifecycle Hooks**: Functions that allow you to run code at specific points in a step's lifecycle:
    * `onBeforeShow?: (step, index, tour) => void | boolean`: Called before a step is shown. Return `false` to prevent the step from showing and potentially skip to the next.
    * `onAfterShow?: (step, index, tour) => void`: Called after a step (popover and highlight) has been shown.
    * `onBeforeHide?: (step, index, tour) => void | boolean`: Called before a step is hidden. Return `false` to prevent the step from hiding (note: this might interfere with tour progression unless handled carefully).
    * `onAfterHide?: (step, index, tour) => void`: Called after a step has been hidden.

*(A more detailed breakdown of `TourStepDefinition` properties can be found in the [API Reference - Types](/reference/types)).*

## 3. Configuring the Tour (`TourOptions`)

When initializing the tour with `useTour(steps, options)`, you can provide an `options` object to configure the default behavior and appearance for the entire tour. Many of these options can also be overridden on a per-step basis within a `TourStepDefinition`.

Key options include:

* `defaultPlacement?: Placement`: The default placement for all popovers if not specified in the step definition (e.g., `'bottom'`).
* `defaultOffset?: number`: The default offset (in pixels) for all popovers (default is `10`).
* `popoverClass?: string`: A CSS class to apply to all popover elements (default: `'v-tour__popover'`).
* `arrowClass?: string`: A CSS class for the popover's arrow element (default: `'v-tour__arrow'`). An arrow element must exist within your popover structure if you use this.
* `highlightTarget?: boolean`: Whether to highlight the target element for each step (default: `true`).
* `highlightClass?: string`: A CSS class to apply to the highlighted target element (default: `'v-tour__highlighted-target'`).
* `overlayClass?: string`: A CSS class for the full-screen overlay (default: `'v-tour__overlay'`).
* `overlayColor?: string`: The background color for the overlay (e.g., `'rgba(0,0,0,0.3)'`). This is used to create the "punch-hole" effect if `highlightTarget` is true.
* `padding?: number`: Padding used by `@floating-ui/dom` middleware like `flip` and `shift` to keep the popover within viewport boundaries (default: `8`).
* `renderPopover?: (step, actions, tour) => HTMLElement`: A powerful function to completely customize the rendering of the popover. It should return an `HTMLElement`.
    * `step`: The current `TourStep` object.
    * `actions`: An object with methods `{ next: () => void; prev: () => void; finish: () => void }` to control tour navigation from your custom popover.
    * `tour`: The `TourControllerPublic` instance.
* **Global Lifecycle Hooks**:
    * `onTourStart?: (tour: TourControllerPublic) => void`: Called when the tour starts.
    * `onTourEnd?: (tour: TourControllerPublic) => void`: Called when the tour ends.
    * `onStepChange?: (newStep: TourStep | null, oldStep: TourStep | null, tour: TourControllerPublic) => void`: Called whenever the current step changes. `newStep` will be `null` if the tour ends, and `oldStep` will be `null` if the tour starts.

*(A more detailed breakdown of `TourOptions` can be found in the [API Reference - Types](/reference/types)).*

## 4. The `useTour` Composable

This is your primary interface for interacting with the tour library in a Vue 3 component.

```typescript
import { useTour } from '@dev_mat/floating-ui-tour';

const {
  // Reactive State
  state, // Contains isActive, currentStepIndex, currentStep, totalSteps
  // Control Methods
  defineSteps,
  start,
  next,
  prev,
  jumpTo,
  end,
  updateOptions // New in controller, should be exposed if needed
} = useTour(initialSteps?, options?);

```
state: A readonly, reactive object providing the current status of the tour. Ideal for conditionally rendering UI or reacting to tour changes.

Control Methods: Functions to manage the tour flow (see API Reference for details).
By understanding these concepts, you can create highly effective and customized product tours for your users.
