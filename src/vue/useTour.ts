import { reactive, readonly, ref, type Ref, type DeepReadonly } from 'vue';
import { TourController } from '../core/TourController';
import type { TourStepDefinition, TourOptions, TourStep, TourControllerPublic } from '../core/types';

interface TourReactiveState {
  isActive: boolean;
  currentStepIndex: number;
  currentStep: TourStep | null;
  totalSteps: number;
}

export interface UseTourReturnType {
  state: DeepReadonly<TourReactiveState>; // state will be a readonly version of TourReactiveState
  defineSteps: (steps: TourStepDefinition[]) => void;
  start: (index?: number) => void;
  next: () => void;
  prev: () => void;
  jumpTo: (stepIdOrIndex: string | number) => void;
  end: () => void;
}

let tourInstanceRef: Ref<TourController | null> = ref(null);

const tourState = reactive<TourReactiveState>({
  isActive: false,
  currentStepIndex: -1,
  currentStep: null,
  totalSteps: 0,
});

export function useTour(
    initialSteps: TourStepDefinition[] = [],
    options: TourOptions = {}
): UseTourReturnType {
  if (!tourInstanceRef.value) {
    const mergedOptions: TourOptions = {
      ...options,
      onTourStart: (tour: TourControllerPublic) => {
        tourState.isActive = true;
        tourState.totalSteps = tour.steps.length;
        options.onTourStart?.(tour);
      },
      onTourEnd: (tour: TourControllerPublic) => {
        tourState.isActive = false;
        tourState.currentStepIndex = -1;
        tourState.currentStep = null;
        options.onTourEnd?.(tour);
      },
      onStepChange: (newStep, oldStep, tour: TourControllerPublic) => {
        tourState.currentStepIndex = tour.currentStepIndex;
        tourState.currentStep = newStep;
        tourState.totalSteps = tour.steps.length;
        options.onStepChange?.(newStep, oldStep, tour);
      },
    };
    tourInstanceRef.value = new TourController(initialSteps, mergedOptions);
    tourState.isActive = tourInstanceRef.value.isActive;
    tourState.currentStepIndex = tourInstanceRef.value.currentStepIndex;
    tourState.currentStep = tourInstanceRef.value.currentStepIndex !== -1 ? tourInstanceRef.value.steps[tourInstanceRef.value.currentStepIndex] : null;
    tourState.totalSteps = tourInstanceRef.value.steps.length;

  } else {
    tourInstanceRef.value.updateOptions(options);
    if (initialSteps.length > 0 || (initialSteps.length === 0 && tourInstanceRef.value.steps.length > 0) ) {
      tourInstanceRef.value.defineSteps(initialSteps);
      tourState.totalSteps = tourInstanceRef.value.steps.length;
    }
  }

  const defineSteps = (steps: TourStepDefinition[]) => {
    tourInstanceRef.value?.defineSteps(steps);
  };

  const start = (index?: number) => tourInstanceRef.value?.start(index);
  const next = () => tourInstanceRef.value?.next();
  const prev = () => tourInstanceRef.value?.prev();
  const end = () => tourInstanceRef.value?.end();
  const jumpTo = (stepIdOrIndex: string | number) => tourInstanceRef.value?.jumpTo(stepIdOrIndex);

  return {
    state: readonly(tourState) as DeepReadonly<TourReactiveState>, // Cast for explicit return type matching
    defineSteps,
    start,
    next,
    prev,
    jumpTo,
    end,
  };
}
