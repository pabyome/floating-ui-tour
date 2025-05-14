# Customization

`Vue Floating UI Tour` is built with flexibility in mind, offering multiple ways to customize how your tour appears and behaves.


## 🎨 Styling the Tour

You can customize the tour using one of the following methods:

### 1. Override Default Styles

By default, the tour uses a provided stylesheet: `vue-floating-ui-tour.css`. You can override these default styles using your own CSS.

#### Default CSS Classes

| Class                     | Description                               |
|--------------------------|-------------------------------------------|
| `.v-tour__popover`       | Main popover container                    |
| `.v-tour__title`         | Popover title                             |
| `.v-tour__content`       | Popover content area                      |
| `.v-tour__footer`        | Popover footer (navigation buttons)       |
| `.v-tour__button`        | Base class for all buttons                |
| `.v-tour__button-prev`   | "Previous" button                         |
| `.v-tour__button-next`   | "Next" button                             |
| `.v-tour__button-finish` | "Finish" or "Close" button                |
| `.v-tour__arrow`         | Popover arrow                             |
| `.v-tour__overlay`       | Full-screen overlay                       |
| `.v-tour__highlighted-target` | Applied to the highlighted target   |

#### Example: Customize Popover and Button Style

```css
.v-tour__popover {
  background-color: #333;
  color: #fff;
  border-radius: 8px;
  border: 1px solid #555;
}

.v-tour__button-next {
  background-color: #4CAF50;
}

.v-tour__button-next:hover {
  background-color: #45a049;
}

```
### 2. Use Custom Classes via TourOptions

Rather than overriding default styles, you can apply your own classes using the TourOptions object.

---
Example
```js
import { useTour } from '@dev_mat/floating-ui-tour';

const options = {
  popoverClass: 'my-popover bg-gray-800 text-white p-4 rounded-lg shadow-xl',
  arrowClass: 'my-arrow',
  highlightClass: 'my-highlight border-2 border-blue-500 rounded',
  overlayClass: 'my-overlay bg-black bg-opacity-50',
};

const { start } = useTour(steps, options);
```

Define the styles for my-popover, my-arrow, etc. in your own CSS.

### 3. Render a Custom Popover with renderPopover
For full control over the structure and behavior of the popover, provide a custom renderPopover function.

Parameters
``` ts
renderPopover(
  step: TourStep,
  actions: { next: () => void; prev: () => void; finish: () => void },
  tour: TourControllerPublic
): HTMLElement

```

- step: The current step definition

- actions: Object with navigation functions

- tour: Public tour controller instance

- Example: Custom Popover Component

```js
const myCustomRenderPopover = (step, actions, tour) => {
  const popover = document.createElement('div');
  popover.className = 'custom-popover';
  popover.style.cssText = `
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    position: absolute;
    width: 300px;
    z-index: 10002;
    display: none;
  `;

  // Title
  if (step.title) {
    const title = document.createElement('h3');
    title.textContent = step.title;
    popover.appendChild(title);
  }

  // Content
  const content = document.createElement('div');
  if (typeof step.content === 'string') {
    content.innerHTML = step.content;
  } else if (typeof step.content === 'function') {
    const dynamicContent = step.content(step, tour.currentStepIndex, tour);
    if (typeof dynamicContent === 'string') {
      content.innerHTML = dynamicContent;
    } else {
      content.appendChild(dynamicContent);
    }
  } else {
    content.appendChild(step.content);
  }
  popover.appendChild(content);

  // Arrow
  if (tour.options.arrowClass) {
    const arrow = document.createElement('div');
    arrow.className = tour.options.arrowClass;
    arrow.style.position = 'absolute';
    popover.appendChild(arrow);
  }

  // Navigation Buttons
  const footer = document.createElement('div');
  footer.style.cssText = 'margin-top: 15px; display: flex; justify-content: space-between;';

  if (tour.currentStepIndex > 0) {
    const backBtn = document.createElement('button');
    backBtn.textContent = 'Back';
    backBtn.onclick = actions.prev;
    footer.appendChild(backBtn);
  }

  if (tour.currentStepIndex < tour.steps.length - 1) {
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.onclick = actions.next;
    footer.appendChild(nextBtn);
  }

  const finishBtn = document.createElement('button');
  finishBtn.textContent = tour.currentStepIndex === tour.steps.length - 1 ? 'Done!' : 'Skip';
  finishBtn.onclick = actions.finish;
  footer.appendChild(finishBtn);

  popover.appendChild(footer);

  return popover;
};
```

### Usage

```js
const { start } = useTour(steps, {
  renderPopover: myCustomRenderPopover,
  arrowClass: 'my-custom-arrow-class',
});
```


Key considerations for renderPopover:

The returned HTMLElement must have position: absolute for 
`@floating-ui/dom` to position it correctly.

The tour controller will manage showing/hiding this element by setting style.display.

If you want an arrow and are using the arrow middleware (default or custom), ensure an element with the class specified in arrowClass (or options.arrowClass) exists within your popover structure.

You are responsible for attaching event listeners to your custom buttons to call the `actions.next(), actions.prev(), and actions.finish()` methods.