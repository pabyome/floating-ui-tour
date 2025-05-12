import { TourStepDefinition, TourStep, TourOptions, TourControllerPublic } from './types';

export declare class TourController implements TourControllerPublic {
    steps: TourStep[];
    currentStepIndex: number;
    isActive: boolean;
    private options;
    private popoverElement?;
    private arrowElement?;
    private cleanupFloatingUI?;
    private highlightOverlay?;
    private originalTargetStyles;
    constructor(steps?: TourStepDefinition[], options?: TourOptions);
    private _getTargetElement;
    private _createOrGetPopover;
    private _defaultRenderPopover;
    defineSteps(steps: TourStepDefinition[]): void;
    start(index?: number): void;
    private _showStepOnTarget;
    private _applyHighlight;
    private _removeHighlight;
    private _hideStepUI;
    next(): void;
    prev(): void;
    jumpTo(stepIdOrIndex: string | number): void;
    end(): void;
    updateOptions(newOptions: Partial<TourOptions>): void;
}
