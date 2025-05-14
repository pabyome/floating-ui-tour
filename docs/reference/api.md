# API Reference

This section provides a detailed reference for the `vue-floating-ui-tour` library's public API.

## `useTour()`

The primary way to interact with the tour functionality is through the `useTour` composable.

```typescript
import { useTour } from '@dev_mat/floating-ui-tour';

const {
  state,
  defineSteps,
  start,
  next,
  prev,
  jumpTo,
  end
} = useTour(initialSteps?, options?);
```


### Parameters

The `useTour` function can be called with optional initial steps and configuration options:

* **`initialSteps?: TourStepDefinition[]`**
    * **Type:** `TourStepDefinition[]`
    * **Default:** `[]` (empty array)
    * **Description:** An optional array of `TourStepDefinition` objects to initialize the tour with. If provided, these steps will be immediately available to the tour controller.

* **`options?: TourOptions`**

  * **Type:** `TourOptions`

  * **Default:** See individual options in `TourOptions` type definition.

  * **Description:** An optional object to configure the default behavior and appearance of the tour. These options can be overridden on a per-step basis where applicable.


### Return Value

The `useTour` composable returns an object (`UseTourReturnType`) containing the tour's reactive state and control methods:

* **`state: Readonly<TourReactiveState>`**
    * A readonly, reactive object representing the current state of the tour.
    * **Properties:**
        * `isActive: boolean`: Indicates if the tour is currently active.
        * `currentStepIndex: number`: The zero-based index of the currently displayed step. It is `-1` if no step is active or the tour has not started.
        * `currentStep: TourStep | null`: The `TourStep` object for the currently active step, or `null` if the tour is not active or has ended.
        * `totalSteps: number`: The total number of steps currently defined for the tour.

* **`defineSteps(steps: TourStepDefinition[]): void`**
    * Defines or redefines the sequence of steps for the tour. Calling this while a tour is active will update the steps; if the `currentStepIndex` becomes invalid, the tour may end or attempt to adjust.
    * **Parameters:**
        * `steps: TourStepDefinition[]`: An array of `TourStepDefinition` objects.

* **`start(index?: number): void`**
    * Starts the tour. If steps are defined, it will show the first step or the step at the specified `index`.
    * **Parameters:**
        * `index?: number`: Optional. The zero-based index of the step from which to start the tour. Defaults to `0`.

* **`next(): void`**
    * Advances the tour to the next step in the sequence. If the current step is the last one, calling `next()` will end the tour.

* **`prev(): void`**
    * Moves the tour to the previous step in the sequence. Does nothing if the current step is the first one.

* **`jumpTo(stepIdOrIndex: string | number): void`**
    * Navigates the tour directly to a specific step.
    * **Parameters:**
        * `stepIdOrIndex: string | number`: The `id` of the target step (if an `id` was provided in its `TourStepDefinition`) or its zero-based numerical index.

* **`end(): void`**
    * Stops the tour, hides the current popover and overlay, and resets the tour state.

## Types

The library exports several TypeScript interfaces and types to help with integration and provide strong typing for tour configurations.

* **`TourStepDefinition`**
    * The interface for defining an individual step in the tour.
    * Key properties include `target`, `content`, `title`, `placement`, `offsetValue`, `middleware`, `id`, and lifecycle hooks (`onBeforeShow`, `onAfterShow`, etc.).
    * Refer to the [Core Concepts > Defining Tour Steps](/guide/core-concepts#defining-tour-steps-tourstepdefinition) section for a detailed breakdown of its properties.

* **`TourOptions`**
    * The interface for configuring the overall tour behavior and default appearance.
    * Key properties include `defaultPlacement`, `defaultOffset`, `popoverClass`, `arrowClass`, `highlightTarget`, `overlayColor`, global lifecycle hooks (`onTourStart`, `onTourEnd`, `onStepChange`), and `renderPopover`.
    * Refer to the [Core Concepts > Configuring the Tour](/guide/core-concepts#configuring-the-tour-touroptions) section for details.

* **`TourStep`**
    * The interface representing a tour step once it has been processed by the tour controller (e.g., it will always have an `id`). This is the type of step object passed to callbacks like `onAfterShow`.

* **`TourControllerPublic`**
    * An interface representing the public API of the underlying tour controller instance. This object is passed to various callback functions (e.g., `onStepChange`, `renderPopover`, step lifecycle hooks), allowing access to the tour's current state and methods from within those callbacks.

* **`Placement`**
    * **Type:** (Re-exported from `@floating-ui/dom`)
    * A string literal type representing the possible placement values for the popover (e.g., `'top'`, `'bottom-start'`, `'right-end'`).

* **`Middleware`**
    * **Type:** (Re-exported from `@floating-ui/dom`)
    * The type for middleware functions used by `@floating-ui/dom` for advanced positioning logic.

* **`TourReactiveState`**
    * The interface describing the structure of the reactive `state` object returned by `useTour()`.
    * **Properties:** `isActive`, `currentStepIndex`, `currentStep`, `totalSteps`