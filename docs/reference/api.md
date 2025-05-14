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
