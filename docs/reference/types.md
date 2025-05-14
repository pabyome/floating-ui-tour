```ts
import type { Placement, Middleware } from '@floating-ui/dom';
```

### `TourControllerPublic`

```ts
export interface TourControllerPublic {
  steps: TourStep[];
  currentStepIndex: number;
  isActive: boolean;
  start: (index?: number) => void;
  next: () => void;
  prev: () => void;
  jumpTo: (stepIdOrIndex: string | number) => void;
  end: () => void;
  defineSteps: (steps: TourStepDefinition[]) => void;
  updateOptions: (options: Partial<TourOptions>) => void;
}
```

### `TourStepDefinition`

```ts
export interface TourStepDefinition {
  target: string | HTMLElement;
  content: string | ((step: TourStep, index: number, tour: TourControllerPublic) => string | HTMLElement);
  title?: string;
  placement?: Placement;
  offsetValue?: number;
  middleware?: Middleware[];
  onBeforeShow?: (step: TourStep, index: number, tour: TourControllerPublic) => void | boolean;
  onAfterShow?: (step: TourStep, index: number, tour: TourControllerPublic) => void;
  onBeforeHide?: (step: TourStep, index: number, tour: TourControllerPublic) => void | boolean;
  onAfterHide?: (step: TourStep, index: number, tour: TourControllerPublic) => void;
  id?: string;
  [key: string]: any;
}
```

### `TourStep`

```ts
export interface TourStep extends TourStepDefinition {
  id: string;
}
```

### `TourOptions`

```ts
export interface TourOptions {
  defaultPlacement?: Placement;
  defaultOffset?: number;
  popoverClass?: string;
  arrowClass?: string;
  padding?: number;
  onTourStart?: (tour: TourControllerPublic) => void;
  onTourEnd?: (tour: TourControllerPublic) => void;
  onStepChange?: (newStep: TourStep | null, oldStep: TourStep | null, tour: TourControllerPublic) => void;
  renderPopover?: (
    step: TourStep,
    actions: { next: () => void; prev: () => void; finish: () => void },
    tour: TourControllerPublic
  ) => HTMLElement;
  highlightTarget?: boolean;
  highlightClass?: string;
  overlayClass?: string;
  overlayColor?: string;
}
```