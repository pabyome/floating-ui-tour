var y = Object.defineProperty;
var x = (p, t, s) => t in p ? y(p, t, { enumerable: !0, configurable: !0, writable: !0, value: s }) : p[t] = s;
var v = (p, t, s) => x(p, typeof t != "symbol" ? t + "" : t, s);
import { offset as I, inline as E, flip as w, shift as C, hide as _, arrow as T, autoUpdate as b, computePosition as O } from "@floating-ui/dom";
import { ref as A, reactive as H, readonly as P } from "vue";
const F = () => `tour_step_${Math.random().toString(36).substring(2, 9)}`;
class U {
  constructor(t = [], s = {}) {
    v(this, "steps", []);
    v(this, "currentStepIndex", -1);
    v(this, "isActive", !1);
    v(this, "options");
    v(this, "popoverElement");
    v(this, "arrowElement");
    v(this, "cleanupFloatingUI");
    v(this, "highlightOverlay");
    v(this, "originalTargetStyles", /* @__PURE__ */ new Map());
    this.options = {
      defaultPlacement: "bottom",
      defaultOffset: 10,
      popoverClass: "v-tour__popover",
      arrowClass: "v-tour__arrow",
      padding: 8,
      highlightTarget: !0,
      highlightClass: "v-tour__highlighted-target",
      overlayClass: "v-tour__overlay",
      overlayColor: "rgba(0,0,0,0.3)",
      onTourStart: () => {
      },
      onTourEnd: () => {
      },
      onStepChange: () => {
      },
      renderPopover: this._defaultRenderPopover.bind(this),
      ...s
    }, this.defineSteps(t);
  }
  _getTargetElement(t) {
    if (typeof t == "string")
      try {
        return document.querySelector(t);
      } catch (s) {
        return console.error(`[TourController] Invalid selector: ${t}`, s), null;
      }
    return t;
  }
  _createOrGetPopover(t) {
    const s = {
      next: () => this.next(),
      prev: () => this.prev(),
      finish: () => this.end()
    }, i = this.options.renderPopover(t, s, this);
    return !i || !(i instanceof HTMLElement) ? (console.error("[TourController] renderPopover must return an HTMLElement."), null) : (this.popoverElement = i, this.popoverElement.isConnected || document.body.appendChild(this.popoverElement), this.options.arrowClass && this.popoverElement.classList.contains(this.options.popoverClass) && (this.arrowElement = this.popoverElement.querySelector(`.${this.options.arrowClass}`) || void 0), this.popoverElement);
  }
  _defaultRenderPopover(t, s) {
    let i = document.getElementById("v-tour-default-popover");
    if (i || (i = document.createElement("div"), i.id = "v-tour-default-popover", i.className = this.options.popoverClass, i.style.position = "absolute", i.style.zIndex = "10002", i.style.display = "none"), i.innerHTML = "", this.options.arrowClass) {
      const e = document.createElement("div");
      e.className = this.options.arrowClass, e.style.position = "absolute", i.appendChild(e), this.arrowElement = e;
    } else
      this.arrowElement = void 0;
    if (t.title) {
      const e = document.createElement("h3");
      e.className = "v-tour__title", e.textContent = t.title, i.appendChild(e);
    }
    const n = document.createElement("div");
    n.className = "v-tour__content";
    const h = typeof t.content == "function" ? t.content(t, this.currentStepIndex, this) : t.content;
    typeof h == "string" ? n.innerHTML = h : h instanceof HTMLElement && n.appendChild(h), i.appendChild(n);
    const d = document.createElement("div");
    if (d.className = "v-tour__footer", this.currentStepIndex > 0) {
      const e = document.createElement("button");
      e.type = "button", e.textContent = "Previous", e.className = "v-tour__button v-tour__button-prev", e.onclick = s.prev, d.appendChild(e);
    }
    if (this.currentStepIndex < this.steps.length - 1) {
      const e = document.createElement("button");
      e.type = "button", e.textContent = "Next", e.className = "v-tour__button v-tour__button-next", e.onclick = s.next, d.appendChild(e);
    }
    const c = document.createElement("button");
    return c.type = "button", c.textContent = this.currentStepIndex === this.steps.length - 1 ? "Finish" : "Close", c.className = "v-tour__button v-tour__button-finish", c.onclick = s.finish, d.appendChild(c), d.hasChildNodes() && i.appendChild(d), i;
  }
  defineSteps(t) {
    this.steps = t.map((s) => ({ ...s, id: s.id || F() })), this.isActive && this.currentStepIndex >= this.steps.length ? this.end() : this.isActive && this.currentStepIndex !== -1 && this._showStepOnTarget(this.currentStepIndex);
  }
  start(t = 0) {
    if (!this.steps.length) {
      console.warn("[TourController] No steps defined.");
      return;
    }
    this.isActive = !0, this.options.onTourStart(this);
    const s = this.currentStepIndex !== -1 ? this.steps[this.currentStepIndex] : null;
    this.currentStepIndex = -1, this._showStepOnTarget(t, s);
  }
  async _showStepOnTarget(t, s = null) {
    if (t < 0 || t >= this.steps.length) {
      this.end();
      return;
    }
    const i = this.currentStepIndex;
    i !== -1 && i !== t && await this._hideStepUI(this.steps[i]), this.currentStepIndex = t;
    const n = this.steps[t], h = this._getTargetElement(n.target);
    if (!h) {
      console.warn(`[TourController] Target element not found for step ${t}:`, n.target), this.currentStepIndex < this.steps.length - 1 ? this.next() : this.end();
      return;
    }
    if (n.onBeforeShow && n.onBeforeShow(n, t, this) === !1) {
      this.currentStepIndex < this.steps.length - 1 ? this.next() : this.end();
      return;
    }
    const d = this._createOrGetPopover(n);
    if (this.popoverElement = d || void 0, !this.popoverElement) {
      this.end();
      return;
    }
    this.popoverElement.style.display = "block", h.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" }), this._applyHighlight(h);
    const c = [
      I(n.offsetValue ?? this.options.defaultOffset),
      E(),
      w({ padding: this.options.padding }),
      C({ padding: this.options.padding }),
      _({ strategy: "referenceHidden" }),
      ...n.middleware || []
    ];
    this.arrowElement && c.push(T({ element: this.arrowElement, padding: this.options.padding }));
    const e = async () => {
      var f;
      if (!this.isActive || !h.isConnected || !this.popoverElement || !this.popoverElement.isConnected) {
        this.cleanupFloatingUI && this.cleanupFloatingUI();
        return;
      }
      const u = await O(h, this.popoverElement, {
        placement: n.placement || this.options.defaultPlacement,
        middleware: c
      });
      if (this.popoverElement.style.left = `${u.x}px`, this.popoverElement.style.top = `${u.y}px`, (f = u.middlewareData.hide) != null && f.referenceHidden ? this.popoverElement.style.visibility = "hidden" : this.popoverElement.style.visibility = "visible", this.arrowElement && u.middlewareData.arrow) {
        const { x: g, y: m } = u.middlewareData.arrow, S = {
          top: "bottom",
          right: "left",
          bottom: "top",
          left: "right"
        }[u.placement.split("-")[0]];
        Object.assign(this.arrowElement.style, {
          left: g != null ? `${g}px` : "",
          top: m != null ? `${m}px` : "",
          right: "",
          bottom: "",
          [S]: `-${this.arrowElement.offsetHeight / 2}px`
        });
      }
    };
    this.cleanupFloatingUI && this.cleanupFloatingUI(), this.cleanupFloatingUI = b(h, this.popoverElement, e, {
      ancestorScroll: !0,
      ancestorResize: !0,
      elementResize: !0,
      animationFrame: !0
    });
    const o = this.steps[this.currentStepIndex], a = s !== void 0 ? s : i !== -1 && i !== t ? this.steps[i] : null;
    (this.currentStepIndex !== i || a && a.id !== o.id) && this.options.onStepChange(o, a, this), n.onAfterShow && n.onAfterShow(n, t, this);
  }
  _applyHighlight(t) {
    this.options.highlightTarget && (this.highlightOverlay || (this.highlightOverlay = document.createElement("div"), this.highlightOverlay.className = this.options.overlayClass, this.highlightOverlay.style.position = "fixed", this.highlightOverlay.style.top = "0", this.highlightOverlay.style.left = "0", this.highlightOverlay.style.width = "100vw", this.highlightOverlay.style.height = "100vh", this.highlightOverlay.style.zIndex = "10000", this.highlightOverlay.style.pointerEvents = "none", this.highlightOverlay.style.backgroundColor = this.options.overlayColor, document.body.appendChild(this.highlightOverlay)), this.highlightOverlay.style.display = "block", this.originalTargetStyles.has(t) || this.originalTargetStyles.set(t, {
      position: t.style.position,
      zIndex: t.style.zIndex,
      boxShadow: t.style.boxShadow
    }), t.style.position = t.style.position === "static" || !t.style.position ? "relative" : t.style.position, t.style.zIndex = "10001", t.style.boxShadow = `0 0 0 9999px ${this.options.overlayColor}`, this.options.highlightClass && t.classList.add(this.options.highlightClass));
  }
  _removeHighlight(t) {
    if (this.highlightOverlay && (this.highlightOverlay.style.display = "none"), t) {
      const s = this.originalTargetStyles.get(t);
      s ? (t.style.position = s.position || "", t.style.zIndex = s.zIndex || "", t.style.boxShadow = s.boxShadow || "", this.originalTargetStyles.delete(t)) : (t.style.removeProperty("z-index"), t.style.removeProperty("box-shadow")), this.options.highlightClass && t.classList.remove(this.options.highlightClass);
    }
  }
  async _hideStepUI(t, s = !1) {
    if (t.onBeforeHide && t.onBeforeHide(t, this.currentStepIndex, this) === !1 && !s)
      return;
    this.cleanupFloatingUI && (this.cleanupFloatingUI(), this.cleanupFloatingUI = void 0), this.popoverElement && (this.popoverElement.style.display = "none");
    const i = this._getTargetElement(t.target);
    this._removeHighlight(i), t.onAfterHide && t.onAfterHide(t, this.currentStepIndex, this);
  }
  next() {
    if (this.isActive)
      if (this.currentStepIndex < this.steps.length - 1) {
        const t = this.steps[this.currentStepIndex];
        this._showStepOnTarget(this.currentStepIndex + 1, t);
      } else
        this.end();
  }
  prev() {
    if (this.isActive && this.currentStepIndex > 0) {
      const t = this.steps[this.currentStepIndex];
      this._showStepOnTarget(this.currentStepIndex - 1, t);
    }
  }
  jumpTo(t) {
    if (!this.isActive) return;
    const s = this.currentStepIndex !== -1 ? this.steps[this.currentStepIndex] : null;
    let i = -1;
    typeof t == "number" ? i = t : i = this.steps.findIndex((n) => n.id === t), i !== -1 && i !== this.currentStepIndex ? this._showStepOnTarget(i, s) : i === -1 && console.warn(`[TourController] Step with ID or index "${t}" not found.`);
  }
  end() {
    if (!this.isActive) return;
    const t = this.currentStepIndex !== -1 ? this.steps[this.currentStepIndex] : null;
    t && this._hideStepUI(t, !0);
    const s = t;
    this.isActive = !1, this.currentStepIndex = -1, this.options.renderPopover === this._defaultRenderPopover.bind(this) && this.popoverElement ? (this.popoverElement.remove(), this.popoverElement = void 0, this.arrowElement = void 0) : this.popoverElement && (this.popoverElement.style.display = "none"), this.highlightOverlay && (this.highlightOverlay.remove(), this.highlightOverlay = void 0), this.originalTargetStyles.clear(), this.options.onTourEnd(this), this.options.onStepChange(null, s, this);
  }
  updateOptions(t) {
    this.options = { ...this.options, ...t }, this.isActive && this.currentStepIndex !== -1 && this._showStepOnTarget(this.currentStepIndex);
  }
}
let r = A(null);
const l = H({
  isActive: !1,
  currentStepIndex: -1,
  currentStep: null,
  totalSteps: 0
});
function M(p = [], t = {}) {
  if (r.value)
    r.value.updateOptions(t), (p.length > 0 || p.length === 0 && r.value.steps.length > 0) && (r.value.defineSteps(p), l.totalSteps = r.value.steps.length);
  else {
    const e = {
      ...t,
      onTourStart: (o) => {
        var a;
        l.isActive = !0, l.totalSteps = o.steps.length, (a = t.onTourStart) == null || a.call(t, o);
      },
      onTourEnd: (o) => {
        var a;
        l.isActive = !1, l.currentStepIndex = -1, l.currentStep = null, (a = t.onTourEnd) == null || a.call(t, o);
      },
      onStepChange: (o, a, u) => {
        var f;
        l.currentStepIndex = u.currentStepIndex, l.currentStep = o, l.totalSteps = u.steps.length, (f = t.onStepChange) == null || f.call(t, o, a, u);
      }
    };
    r.value = new U(p, e), l.isActive = r.value.isActive, l.currentStepIndex = r.value.currentStepIndex, l.currentStep = r.value.currentStepIndex !== -1 ? r.value.steps[r.value.currentStepIndex] : null, l.totalSteps = r.value.steps.length;
  }
  const s = (e) => {
    var o;
    (o = r.value) == null || o.defineSteps(e);
  }, i = (e) => {
    var o;
    return (o = r.value) == null ? void 0 : o.start(e);
  }, n = () => {
    var e;
    return (e = r.value) == null ? void 0 : e.next();
  }, h = () => {
    var e;
    return (e = r.value) == null ? void 0 : e.prev();
  }, d = () => {
    var e;
    return (e = r.value) == null ? void 0 : e.end();
  }, c = (e) => {
    var o;
    return (o = r.value) == null ? void 0 : o.jumpTo(e);
  };
  return {
    state: P(l),
    // Cast for explicit return type matching
    defineSteps: s,
    start: i,
    next: n,
    prev: h,
    jumpTo: c,
    end: d
  };
}
export {
  U as TourController,
  M as useTour
};
//# sourceMappingURL=vue-floating-ui-tour.es.js.map
