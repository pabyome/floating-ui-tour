import { DeepReadonly } from 'vue';
import { TourStepDefinition, TourOptions, TourStep } from '../core/types';

interface TourReactiveState {
    isActive: boolean;
    currentStepIndex: number;
    currentStep: TourStep | null;
    totalSteps: number;
}
export interface UseTourReturnType {
    state: DeepReadonly<TourReactiveState>;
    defineSteps: (steps: TourStepDefinition[]) => void;
    start: (index?: number) => void;
    next: () => void;
    prev: () => void;
    jumpTo: (stepIdOrIndex: string | number) => void;
    end: () => void;
}
export declare function useTour(initialSteps?: TourStepDefinition[], options?: TourOptions): UseTourReturnType;
export {};
