### Advanced Positioning with Middleware

Vue Floating UI Tour uses @floating-ui/dom for positioning. You can tap into its powerful middleware system for advanced control over how popovers are placed.

Provide an array of middleware functions to the middleware property of a TourStepDefinition or to TourOptions 
(though TourOptions doesn't directly have a middleware field for global middleware in the current types.ts; it's typically per-step).

```ts
import { useTour } from '@dev_mat/floating-ui-tour';
import { shift, flip, offset } from '@floating-ui/dom'; // Import middleware

const steps = [
  {
    target: '#my-element',
    content: 'This popover uses custom middleware.',
    placement: 'top',
    middleware: [
      offset(10), // Apply a 10px offset
      shift({ padding: 5 }), // Prevent overflow by shifting
      flip({ fallbackPlacements: ['bottom', 'right'], padding: 5 }), // Flip to other placements if it doesn't fit
    ],
  },
];

const { start } = useTour(steps);
```

Refer to the @floating-ui/dom documentation for a comprehensive list of available middleware and how to create custom ones.