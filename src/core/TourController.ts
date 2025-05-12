import {
    computePosition,
    autoUpdate,
    offset as offsetMiddleware,
    shift,
    flip,
    arrow as arrowMiddleware,
    hide,
    inline,
    type Middleware,
  } from '@floating-ui/dom';
  import type { TourStepDefinition, TourStep, TourOptions, TourControllerPublic } from './types';
  import { generateId } from './utils';

  export class TourController implements TourControllerPublic {
    public steps: TourStep[] = [];
    public currentStepIndex: number = -1;
    public isActive: boolean = false;

    private options: Required<TourOptions>;
    private popoverElement?: HTMLElement;
    private arrowElement?: HTMLElement;
    private cleanupFloatingUI?: () => void;
    private highlightOverlay?: HTMLElement;
    private originalTargetStyles: Map<HTMLElement, Partial<CSSStyleDeclaration>> = new Map();

    constructor(steps: TourStepDefinition[] = [], options: TourOptions = {}) {
      this.options = {
        defaultPlacement: 'bottom',
        defaultOffset: 10,
        popoverClass: 'v-tour__popover',
        arrowClass: 'v-tour__arrow',
        padding: 8,
        highlightTarget: true,
        highlightClass: 'v-tour__highlighted-target',
        overlayClass: 'v-tour__overlay',
        overlayColor: 'rgba(0,0,0,0.3)',
        onTourStart: () => {},
        onTourEnd: () => {},
        onStepChange: () => {},
        renderPopover: this._defaultRenderPopover.bind(this),
        ...options,
      };
      this.defineSteps(steps);
    }

    private _getTargetElement(target: string | HTMLElement): HTMLElement | null {
      if (typeof target === 'string') {
        try {
          return document.querySelector(target);
        } catch (e) {
          console.error(`[TourController] Invalid selector: ${target}`, e);
          return null;
        }
      }
      return target;
    }

    private _createOrGetPopover(step: TourStep): HTMLElement | null {
      const actions = {
        next: () => this.next(),
        prev: () => this.prev(),
        finish: () => this.end(),
      };
      const popover = this.options.renderPopover(step, actions, this);

      if (!popover || !(popover instanceof HTMLElement)) {
        console.error("[TourController] renderPopover must return an HTMLElement.");
        return null;
      }
      this.popoverElement = popover;

      if (!this.popoverElement.isConnected) {
        document.body.appendChild(this.popoverElement);
      }

      if (this.options.arrowClass && this.popoverElement.classList.contains(this.options.popoverClass)) {
          this.arrowElement = this.popoverElement.querySelector<HTMLElement>(`.${this.options.arrowClass}`) || undefined;
      }
      return this.popoverElement;
    }

    private _defaultRenderPopover(
      step: TourStep,
      actions: { next: () => void; prev: () => void; finish: () => void }
    ): HTMLElement {

      let popover = document.getElementById('v-tour-default-popover');
      if (!popover) {
          popover = document.createElement('div');
          popover.id = 'v-tour-default-popover';
          popover.className = this.options.popoverClass;
          popover.style.position = 'absolute';
          popover.style.zIndex = '10002';
          popover.style.display = 'none';
      }
      popover.innerHTML = '';

      if (this.options.arrowClass) {
        const arrowEl = document.createElement('div');
        arrowEl.className = this.options.arrowClass;
        arrowEl.style.position = 'absolute';
        popover.appendChild(arrowEl);
        this.arrowElement = arrowEl;
      } else {
        this.arrowElement = undefined;
      }

      if (step.title) {
        const titleEl = document.createElement('h3');
        titleEl.className = 'v-tour__title';
        titleEl.textContent = step.title;
        popover.appendChild(titleEl);
      }

      const contentEl = document.createElement('div');
      contentEl.className = 'v-tour__content';
      const contentValue = typeof step.content === 'function'
        ? step.content(step, this.currentStepIndex, this)
        : step.content;
      if (typeof contentValue === 'string') {
          contentEl.innerHTML = contentValue;
      } else if (contentValue instanceof HTMLElement) {
          contentEl.appendChild(contentValue);
      }
      popover.appendChild(contentEl);

      // Footer & Buttons
      const footerEl = document.createElement('div');
      footerEl.className = 'v-tour__footer';

      if (this.currentStepIndex > 0) {
        const prevButton = document.createElement('button');
        prevButton.type = 'button';
        prevButton.textContent = 'Previous';
        prevButton.className = 'v-tour__button v-tour__button-prev';
        prevButton.onclick = actions.prev;
        footerEl.appendChild(prevButton);
      }

      if (this.currentStepIndex < this.steps.length - 1) {
        const nextButton = document.createElement('button');
        nextButton.type = 'button';
        nextButton.textContent = 'Next';
        nextButton.className = 'v-tour__button v-tour__button-next';
        nextButton.onclick = actions.next;
        footerEl.appendChild(nextButton);
      }

      const finishButton = document.createElement('button');
      finishButton.type = 'button';
      finishButton.textContent = this.currentStepIndex === this.steps.length - 1 ? 'Finish' : 'Close';
      finishButton.className = 'v-tour__button v-tour__button-finish';
      finishButton.onclick = actions.finish;
      footerEl.appendChild(finishButton);

      if (footerEl.hasChildNodes()) {
          popover.appendChild(footerEl);
      }
      return popover;
    }

    public defineSteps(steps: TourStepDefinition[]) {
      this.steps = steps.map((s) => ({ ...s, id: s.id || generateId() }));
      if (this.isActive && this.currentStepIndex >= this.steps.length) {
        this.end();
      } else if (this.isActive && this.currentStepIndex !== -1) {
        this._showStepOnTarget(this.currentStepIndex);
      }
    }

    public start(index: number = 0) {
      if (!this.steps.length) {
        console.warn('[TourController] No steps defined.');
        return;
      }
      this.isActive = true;
      this.options.onTourStart(this);
      const oldStep = this.currentStepIndex !== -1 ? this.steps[this.currentStepIndex] : null;
      this.currentStepIndex = -1;
      this._showStepOnTarget(index, oldStep);
    }

    private async _showStepOnTarget(index: number, oldStepForCallback: TourStep | null = null) {
      if (index < 0 || index >= this.steps.length) {
        this.end();
        return;
      }

      const previousIndex = this.currentStepIndex;
      if (previousIndex !== -1 && previousIndex !== index) {
        await this._hideStepUI(this.steps[previousIndex]);
      }

      this.currentStepIndex = index;
      const step = this.steps[index];
      const targetElement = this._getTargetElement(step.target);

      if (!targetElement) {
        console.warn(`[TourController] Target element not found for step ${index}:`, step.target);
        if (this.currentStepIndex < this.steps.length - 1) this.next(); else this.end();
        return;
      }

      if (step.onBeforeShow && step.onBeforeShow(step, index, this) === false) {
        if (this.currentStepIndex < this.steps.length - 1) this.next(); else this.end();
        return;
      }

      const popover = this._createOrGetPopover(step);
      this.popoverElement = popover || undefined;
      if (!this.popoverElement) {
          this.end();
          return;
      }

      this.popoverElement.style.display = 'block';
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      this._applyHighlight(targetElement);

      const middleware: Middleware[] = [
        offsetMiddleware(step.offsetValue ?? this.options.defaultOffset),
        inline(),
        flip({ padding: this.options.padding }),
        shift({ padding: this.options.padding }),
        hide({ strategy: 'referenceHidden' }),
        ...(step.middleware || [])
      ];
      if (this.arrowElement) {
        middleware.push(arrowMiddleware({ element: this.arrowElement, padding: this.options.padding }));
      }

      const updatePosition = async () => {
        if (!this.isActive || !targetElement.isConnected || !this.popoverElement || !this.popoverElement.isConnected) {
          if (this.cleanupFloatingUI) this.cleanupFloatingUI();
          return;
        }

        const pos = await computePosition(targetElement, this.popoverElement, {
          placement: step.placement || this.options.defaultPlacement,
          middleware: middleware,
        });

        this.popoverElement.style.left = `${pos.x}px`;
        this.popoverElement.style.top = `${pos.y}px`;

        if (pos.middlewareData.hide?.referenceHidden) {
          this.popoverElement.style.visibility = 'hidden';
        } else {
          this.popoverElement.style.visibility = 'visible';
        }

        if (this.arrowElement && pos.middlewareData.arrow) {
          const { x: arrowX, y: arrowY } = pos.middlewareData.arrow;
          const staticSideMap: Record<string, string> = {
            top: 'bottom', right: 'left', bottom: 'top', left: 'right',
          };
          const staticSide = staticSideMap[pos.placement.split('-')[0]];

          Object.assign(this.arrowElement.style, {
            left: arrowX != null ? `${arrowX}px` : '',
            top: arrowY != null ? `${arrowY}px` : '',
            right: '', bottom: '',
            [staticSide]: `-${this.arrowElement.offsetHeight / 2}px`,
          });
        }
      };

      if (this.cleanupFloatingUI) this.cleanupFloatingUI();
      this.cleanupFloatingUI = autoUpdate(targetElement, this.popoverElement, updatePosition, {
          ancestorScroll: true, ancestorResize: true, elementResize: true, animationFrame: true
      });

      const currentStepForCallback = this.steps[this.currentStepIndex];
      const actualOldStepForCallback = oldStepForCallback !== undefined ? oldStepForCallback : (previousIndex !== -1 && previousIndex !== index ? this.steps[previousIndex] : null);

      if (this.currentStepIndex !== previousIndex || (actualOldStepForCallback && actualOldStepForCallback.id !== currentStepForCallback.id) ) {
           this.options.onStepChange(currentStepForCallback, actualOldStepForCallback, this);
      }
      if (step.onAfterShow) step.onAfterShow(step, index, this);
    }

    private _applyHighlight(target: HTMLElement) {
      if (!this.options.highlightTarget) return;

      if (!this.highlightOverlay) {
        this.highlightOverlay = document.createElement('div');
        this.highlightOverlay.className = this.options.overlayClass;
        this.highlightOverlay.style.position = 'fixed';
        this.highlightOverlay.style.top = '0';
        this.highlightOverlay.style.left = '0';
        this.highlightOverlay.style.width = '100vw';
        this.highlightOverlay.style.height = '100vh';
        this.highlightOverlay.style.zIndex = '10000';
        this.highlightOverlay.style.pointerEvents = 'none';
        this.highlightOverlay.style.backgroundColor = this.options.overlayColor;
        document.body.appendChild(this.highlightOverlay);
      }
      this.highlightOverlay.style.display = 'block';

      if (!this.originalTargetStyles.has(target)) {
        this.originalTargetStyles.set(target, {
          position: target.style.position,
          zIndex: target.style.zIndex,
          boxShadow: target.style.boxShadow,

        });
      }

      target.style.position = (target.style.position === 'static' || !target.style.position) ? 'relative' : target.style.position;
      target.style.zIndex = '10001';
      target.style.boxShadow = `0 0 0 9999px ${this.options.overlayColor}`; // Punch-hole
      if (this.options.highlightClass) target.classList.add(this.options.highlightClass);
    }

    private _removeHighlight(target: HTMLElement | null) {
      if (this.highlightOverlay) {
        this.highlightOverlay.style.display = 'none';
      }
      if (target) {
        const originalStyles = this.originalTargetStyles.get(target);
        if (originalStyles) {
          target.style.position = originalStyles.position || '';
          target.style.zIndex = originalStyles.zIndex || '';
          target.style.boxShadow = originalStyles.boxShadow || '';
          this.originalTargetStyles.delete(target);
        } else {
          target.style.removeProperty('z-index');
          target.style.removeProperty('box-shadow');
        }
        if (this.options.highlightClass) target.classList.remove(this.options.highlightClass);
      }
    }

    private async _hideStepUI(step: TourStep, isEndingTour: boolean = false) {
      if (step.onBeforeHide && step.onBeforeHide(step, this.currentStepIndex, this) === false && !isEndingTour) {
        return;
      }

      if (this.cleanupFloatingUI) {
        this.cleanupFloatingUI();
        this.cleanupFloatingUI = undefined;
      }

      if (this.popoverElement) {
        this.popoverElement.style.display = 'none';
      }

      const targetElement = this._getTargetElement(step.target);
      this._removeHighlight(targetElement);

      if (step.onAfterHide) step.onAfterHide(step, this.currentStepIndex, this);
    }

    public next() {
      if (!this.isActive) return;
      if (this.currentStepIndex < this.steps.length - 1) {
        const oldStep = this.steps[this.currentStepIndex];
        this._showStepOnTarget(this.currentStepIndex + 1, oldStep);
      } else {
        this.end();
      }
    }

    public prev() {
      if (!this.isActive) return;
      if (this.currentStepIndex > 0) {
        const oldStep = this.steps[this.currentStepIndex];
        this._showStepOnTarget(this.currentStepIndex - 1, oldStep);
      }
    }

    public jumpTo(stepIdOrIndex: string | number) {
      if (!this.isActive) return;
      const oldStep = this.currentStepIndex !== -1 ? this.steps[this.currentStepIndex] : null;
      let newIndex = -1;
      if (typeof stepIdOrIndex === 'number') {
        newIndex = stepIdOrIndex;
      } else {
        newIndex = this.steps.findIndex(s => s.id === stepIdOrIndex);
      }

      if (newIndex !== -1 && newIndex !== this.currentStepIndex) {
        this._showStepOnTarget(newIndex, oldStep);
      } else if (newIndex === -1) {
        console.warn(`[TourController] Step with ID or index "${stepIdOrIndex}" not found.`);
      }
    }

    public end() {
      if (!this.isActive) return;

      const stepToHide = this.currentStepIndex !== -1 ? this.steps[this.currentStepIndex] : null;
      if (stepToHide) {
        this._hideStepUI(stepToHide, true);
      }
      const oldStepForCallback = stepToHide;


      this.isActive = false;
      this.currentStepIndex = -1;



      if (this.options.renderPopover === this._defaultRenderPopover.bind(this) && this.popoverElement) {
          this.popoverElement.remove();
          this.popoverElement = undefined;
          this.arrowElement = undefined;
      } else if (this.popoverElement) {

          this.popoverElement.style.display = 'none';
      }

      if (this.highlightOverlay) {
        this.highlightOverlay.remove();
        this.highlightOverlay = undefined;
      }
      this.originalTargetStyles.clear();


      this.options.onTourEnd(this);

      this.options.onStepChange(null, oldStepForCallback, this);
    }

    public updateOptions(newOptions: Partial<TourOptions>) {
      this.options = { ...this.options, ...newOptions };
      if (this.isActive && this.currentStepIndex !== -1) {
        this._showStepOnTarget(this.currentStepIndex);
      }
    }
  }
