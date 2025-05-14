# Getting Started
This guide will walk you through the basic steps to install and use `Vue Floating UI Tour` in your Vue 3 project.

## Installation

You can install `Vue Floating UI Tour` using npm or yarn:

::: code-group

```bash [npm]
npm install @dev_mat/floating-ui-tour
```

```bash [yarn]
yarn add @dev_mat/floating-ui-tour
```

```bash [pnpm]
pnpm add @dev_mat/floating-ui-tour
```

:::
> **Note:** `@floating-ui/dom` and `vue` are peer dependencies and must be installed if they’re not already in your project.

## Importing Styles

The library comes with default styling for the tour popovers. You need to import the CSS file into your project.
The most common way is to import it in your main JavaScript/TypeScript file (e.g., `main.js` or `main.ts`):

```ts
// main.js or main.ts
import { createApp } from 'vue';
import App from './App.vue';
import '@dev_mat/floating-ui-tour/style.css';

createApp(App).mount('#app');
```

Alternatively, if your bundler supports it, you can import it directly within a Vue component’s `<style>` block:

```vue
<style>
import '@dev_mat/floating-ui-tour/style.css';
</style>
```

## Basic Usage

Here's a simple example of how to set up and use the tour in a Vue component:

```vue
<template>
  <div>
    <button @click="startTour">Start Tour</button>
    <div id="step-1" style="margin-top: 20px; padding: 10px; border: 1px solid #ccc;">
      This is the first step's target.
    </div>
    <div data-step="step-2" style="margin-top: 200px; padding: 10px; border: 1px solid #ccc;">
      This is the second step's target.
    </div>
  </div>
</template>

<script setup>
import { useTour } from '@dev_mat/floating-ui-tour';

// 1. Define your tour steps
const steps = [
  {
    target: '#step-1',
    title: 'Welcome!',
    content: 'This is the first step of our tour. We are highlighting the element above.',
    placement: 'bottom',
  },
  {
    target: '[data-step="step-2"]',
    title: 'Another Feature',
    content: 'This popover demonstrates targeting an element with a data attribute and will appear on the right.',
    placement: 'right',
  },
  // ... more steps
];

// 2. Initialize the tour
const { start, defineSteps, currentStepIndex, isActive } = useTour(steps, {
  defaultOffset: 15,
  highlightTarget: true,
});

// 3. Control the tour
const startTour = () => {
  // Optional: redefine steps if needed
  // defineSteps(newStepsArray);
  start(); // Starts from step 0
};
</script>
```

## Explanation

### Define Steps (`steps` array)

Each object in the array represents a step in your tour:

* `target`: A CSS selector string (e.g., `#my-element`, `.feature-class`) or a direct `HTMLElement`.
* `content`: The main text or HTML content for the popover. Can be a function for dynamic content.
* `title` *(optional)*: A title for the popover.
* `placement` *(optional)*: Defines where the popover appears relative to the target (e.g., `'top'`, `'bottom'`, `'left-start'`).

### Initialize `useTour`

* Call `useTour()` with your steps array.
* You can pass an optional second argument for tour-wide configuration options.
* It returns:

  * Reactive state properties: `currentStepIndex`, `isActive`, etc.
  * Control methods: `start`, `defineSteps`, `next`, `prev`, `jumpTo`, `end`.

### Control the Tour

Use the following methods:

* `start()` — Begin the tour from the first step or a specific index.
* `next()` — Go to the next step.
* `prev()` — Go to the previous step.
* `jumpTo(stepIdOrIndex)` — Jump to a specific step.
* `end()` — Exit the tour.


## Tour with Dynamic Step Content
You can use a function for a step's content or title to make it dynamic.

```vue
<template>
  <div>
    <button @click="startDynamicTour">Start Dynamic Tour</button>
    <div id="user-greeting">Hello there!</div>
    <input type="text" v-model="userName" placeholder="Enter your name" id="name-input"/>
  </div>
</template>
```

```ts
<script setup>
import { ref } from 'vue';
import { useTour } from '@dev_mat/floating-ui-tour';

const userName = ref('');

const dynamicSteps = [
  {
    target: '#user-greeting',
    title: (step, index, tour) => `Step ${index + 1}: Greetings!`,
    content: (step, index, tour) => {
      const greetName = userName.value || 'Guest';
      return `Hello, ${greetName}! This content is dynamically generated. Try typing in the input below.`;
    },
    placement: 'bottom',
  },
  {
    target: '#name-input',
    title: 'Personalization',
    content: () => {
      if (userName.value) {
        return `Great, ${userName.value}! Your name will be used to personalize your experience.`;
      }
      return 'Enter your name here to see the greeting update in the next step (if you go back).';
    },
  }
];

const { start: startDynamicTour, defineSteps } = useTour(); // Initialize without steps first

const startTheDynamicTour = () => {
  defineSteps(dynamicSteps); // Define or update steps, especially if they depend on reactive data
  startDynamicTour();
}

</script>
```

## Using Lifecycle Hooks
Lifecycle hooks allow you to execute custom logic at different stages of a step or the tour.

```vue
<template>
  <div>
    <button @click="startLifecycleTour">Start Lifecycle Tour</button>
    <div id="step-one-target">First target</div>
    <div id="step-two-target" style="margin-top: 100px; display: none;">
      This target appears after a delay.
    </div>
  </div>
</template>
```

```ts
<script setup>
import { useTour } from '@dev_mat/floating-ui-tour';

let stepTwoTarget; // To store the element reference

const lifecycleSteps = [
  {
    target: '#step-one-target',
    title: 'Step 1: Preparations',
    content: 'This step will prepare something for the next step.',
    onAfterShow: (step, index, tour) => {
      console.log('Step 1 shown! Making step 2 target visible soon...');
      stepTwoTarget = document.getElementById('step-two-target');
      setTimeout(() => {
        if(stepTwoTarget) stepTwoTarget.style.display = 'block';
        console.log('Step 2 target is now visible!');
      }, 2000);
    },
  },
  {
    target: '#step-two-target',
    title: 'Step 2: The Revealed Target',
    content: 'This target was made visible by the previous step.',
    onBeforeShow: (step, index, tour) => {
      if (!stepTwoTarget || stepTwoTarget.style.display === 'none') {
        console.warn('Step 2 target is not visible yet! Skipping...');
        // alert('Please wait for the target to appear or implement better logic.');
        return false; // Prevents this step from showing if target isn't ready
      }
      return true; // Allow step to show
    },
    onAfterHide: () => {
        console.log('Step 2 hidden. Resetting its visibility.');
        if(stepTwoTarget) stepTwoTarget.style.display = 'none';
    }
  },
];

const tourControls = useTour(lifecycleSteps, {
  onTourStart: (tour) => {
    console.log('Tour has started!', tour);
  },
  onStepChange: (newStep, oldStep, tour) => {
    if (newStep) {
      console.log(`Moved to step: ${newStep.title || newStep.id}`);
    }
    if (oldStep) {
      console.log(`Left step: ${oldStep.title || oldStep.id}`);
    }
    if (!newStep && oldStep) {
        console.log('Tour ended or was closed from the last step.');
    }
  },
  onTourEnd: (tour) => {
    console.log('Tour has officially ended!', tour);
    // Clean up if necessary
    const target = document.getElementById('step-two-target');
    if (target) target.style.display = 'none';
  },
});

const startLifecycleTour = () => {
    const target = document.getElementById('step-two-target');
    if (target) target.style.display = 'none'; // Reset for demo
    tourControls.start();
}
</script>
```