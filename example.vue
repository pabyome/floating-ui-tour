<template>
    <div>
      <h1>My Awesome App</h1>
      <p>
        <button id="feature1-btn" @click="showDetails('feature1')">Feature 1</button>
        Welcome to this application. We have some cool features.
      </p>
      <div id="feature2-area" style="margin-top: 20px; padding: 10px; border: 1px solid blue;">
        This is Feature 2. It does amazing things!
        <button id="feature3-btn" style="margin-left: 50px;">Inner Feature 3</button>
      </div>
      <button @click="startAppTour" style="margin-top: 30px;">Start Tour</button>
      <button @click="nextStep" v-if="tourState.isActive">Next Step</button>
      <button @click="stopTour" v-if="tourState.isActive">Stop Tour</button>
      <p v-if="tourState.isActive">
        Current Step: {{ tourState.currentStep?.title || tourState.currentStepIndex + 1 }}
        of {{ tourState.totalSteps }}
      </p>
    </div>
  </template>

  <script setup lang="ts">
  import { onMounted } from 'vue';
  import { useTour, type TourStepDefinition } from 'vue-floating-ui-tour'; // Or your package name

  const tourSteps: TourStepDefinition[] = [
    {
      target: '#feature1-btn',
      title: 'Feature One',
      content: 'This button shows details for the first feature. Click it to learn more!',
      placement: 'bottom-start',
    },
    {
      target: '#feature2-area',
      title: 'The Second Feature Area',
      content: 'Here you can find information and controls for Feature 2.',
      placement: 'right',
      offsetValue: 15,
    },
    {
      target: '#feature3-btn',
      title: 'Nested Feature Three',
      content: 'This is a sub-feature within Feature 2. It is super important.',
      placement: 'top-end',
      onBeforeShow: (step, index) => {
        console.log(`About to show step ${index + 1}: ${step.title}`);
      },
      onAfterShow: (step) => console.log(`${step.title} is now visible!`)
    },
    {
      target: 'h1',
      title: 'Application Title',
      content: 'This is the main title of our awesome application.',
      placement: 'bottom',
    }
  ];


  const {
    state: tourState,
    defineSteps,
    start,
    next,
    end,
    jumpTo
  } = useTour(tourSteps, {
    defaultPlacement: 'auto',
  });

  onMounted(() => {
    // defineSteps(tourSteps);
  });

  const startAppTour = () => {
    start();
  };

  const nextStep = () => {
    next();
  };

  const stopTour = () => {
    end();
  };

  const showDetails = (featureId: string) => {
    alert(`Showing details for ${featureId}`);
  };
  </script>
