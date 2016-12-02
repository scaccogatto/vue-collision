# vue-collision

> fires a @collided[-groupName] event on collision with viewport or any other bounding box, [Waypoints](http://imakewebthings.com/waypoints/)-like

## Status

[![Build Status](https://travis-ci.org/scaccogatto/vue-collision.svg?branch=master)](https://travis-ci.org/scaccogatto/vue-collision)

## Features

- Uses [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- Wrap up your components in groups
- Group all your components in the `window` group by default
- Checks collisions group by group and fire custom events when a collision happens

## Installation

### npm
```js
$ npm install vue-collision --save-dev
```

### Vue's main.js
```js
import VueCollision from 'vue-collision'

// collision
Vue.use(VueCollision, { globalTriggers: ['resize', 'scroll'] })
```

### Arguments
- options [optional]: object defining what triggers the groups' checks

### Components
```js
<template>
  <component-name v-collision="['groupone']" @collide="onCollideHandler" @collide-groupone="onGroupOneCollide"></component-name>
</template>

<script>
  export default {
    methods: {
      onCollideHandler (collider) {
        // logic for 'window' group, called when the component collides with window
      },
      onGroupOneCollide (collider) {
        // logic for 'groupone' group, called when the component collides inside 'groupone' group
      }
    }
  }
</script>
```
## Usage

### v-collision directive
- Add `v-collision` directive to any component to make it part of the `vue-collision` family and a `window-group`'s direct son
- Specify a `v-collision.prevent` modifier in order to exclude the component from `window-group`
- Add a value to the directive (`v-collision="['groupone', 'grouptwo']"`) in order to reference the component into the `groupone` and `grouptwo` groups
- You can mix it together: `v-collision.prevent="['groupone', 'grouptwo']"`

### Events
- `@collide`: happens when the component is colliding with the window (based on: [innerWidth](https://developer.mozilla.org/en/docs/Web/API/window/innerWidth) and [innerHeight](https://developer.mozilla.org/en/docs/Web/API/window/innerHeight))
- `@collide[-groupName]`: happens when the component is colliding with someone in the same group
- Every event calls a `function (collider)` when fired. The `collider` is the Vue istance that is colliding with `this`

## API

- `VueCollision.checkAllGroups()`: it checks all the groups (even window's one) and fire the events stack
- `VueCollision.checkGroups(Array windowTest, Object customGroups)`: it tests the passed groups and/or Vue's components instances.
  - `windowTest` must be an array containing [Components](https://vuejs.org/v2/api/#Vue-component)
  - `customGroups` must be and an Object defined as:

```js
customGroups = {
  groupName: {
    combinations: [
      [Component, Component],
      [Component, Component],
      ...
    ]
  },
  groupTwoName: {
    combinations: [
      [Component, Component],
      [Component, Component],
      ...
    ]
  }
  ...
}
```

## Testing
This software uses [mocha](https://mochajs.org/) as testing framework, some functions are not being fully tested (`checkGroups` and `install`) since creating a fake VueJS environment in order to test some functions that urely on already fully tested sub-functions seems not worth.

- Clone this repository
- `cd vue-viewports`
- `npm install`
- `npm test`

*Feel free to contribute and ask questions*
