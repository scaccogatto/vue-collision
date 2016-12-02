import VueThrottleEvent from 'vue-throttle-event'
const $combination = require('js-combinatorics').combination;

const VueCollision = {
  install (Vue, options = { globalTriggers: ['resize', 'scroll'] }) {
    // setup an empty window group array
    VueCollision._windowGroup = []

    // setup an empty customGroup Object
    VueCollision._customGroups = {}

    // setup '_windowRect' update
    VueThrottleEvent._throttle('resize', 'vue-collision-window_rect_update', window)
    window.addEventListener('vue-collision-window_rect_update', VueCollision._updateWindowRect)

    // define the base window sizes
    window.dispatchEvent(new Event('vue-collision-window_rect_update'))

    // define global group checks
    for (let eventName of options.globalTriggers) {
      VueThrottleEvent._throttle(eventName, 'vue-collision-' + eventName, window)
      window.addEventListener('vue-collision-' + eventName, VueCollision.checkAllGroups)
    }

    // Vue directive 'v-collision'
    Vue.directive('collision', {
      bind (el, binding, vnode) {
        // if v-collision not '.prevent'
        if (typeof binding.modifiers.prevent === 'undefined') {
          VueCollision._windowGroup.push(vnode.child)
        }

        // if the user defined a custom collision group's array ['group1', 'group2', ..]
        if (typeof binding.value === 'object' && binding.value.length) {
          for (let customGroup of binding.value) {
            VueCollision._pushVnodeToGroup(vnode.child, customGroup)
          }
        }

        // setup istance variables
        vnode.child._collisionObject = {
          windowGroup: typeof binding.modifiers.prevent === 'undefined',
          customGroupsList: typeof binding.value === 'object' ? binding.value : []
        }
      },
      updated (el, binding, vnode, oldVnode) {
        // update vnode inside window's group
        if (typeof binding.modifiers.prevent === 'undefined') {
          let windowGroupIndex = VueCollision._windowGroup.findIndex(node => node === oldVnode.child)
          VueCollision._windowGroup[windowGroupIndex] = vnode.child
        }

        // if we had some custom groups
        if (typeof binding.oldValue === 'object' && binding.oldValue.length) {
          // clear vnode references that does not exist anymore
          let obsoleteGroups = binding.oldValue.filter(group => binding.value.indexOf(group) < 0)
          for (let oldGroup of obsoleteGroups) {
            VueCollision,_removeVnodeFromGroup(oldVnode.child, oldGroup)
          }

          // add new groups
          let newGroups = binding.value.filter(group => binding.oldValue.indexOf(group) < 0)
          for (let newGroup of newGroups) {
            VueCollision._pushVnodeToGroup(vnode.child, newGroup)
          }

          // update vnode inside its custom groups
          let updateGroups = binding.value.filter(group => binding.oldValue.indexOf(group) > -1)
          for (let updateGroup of updateGroups) {
            let vnodesIndex = VueCollision._customGroups[updateGroup].vnodes.findIndex(node => node === oldVnode.child)
            VueCollision._customGroups[customGroup].vnodes[vnodesIndex] = vnode.child
          }

          // update combinations' array if needed
          if (obsoleteGroups.lenght > 0 || newGroups.lenght > 0 || updateGroups.lenght > 0) {
            VueCollision._customGroups[customGroup]._combinations = VueCollision._combine(VueCollision._customGroups[customGroup].vnodes)
          }
        }

        // setup istance variables
        vnode.child._collisionObject.customGroups = typeof binding.value === 'object' ? binding.value : []
      },
      unbind (el, binding, vnode) {
        // if we had some custom groups
        if (typeof binding.value === 'object' && binding.oldValue.value) {
          // remove vnode from window's group
          if (typeof binding.modifiers.prevent === 'undefined') {
            let windowGroupIndex = VueCollision._windowGroup.findIndex(node => node === oldVNode.child)
            VueCollision._windowGroup.splice(windowGroupIndex, 1)
          }

          // remove reference from custom groups
          for (let group of binding.value) {
            VueCollision,_removeVnodeFromGroup(vnode.child, group)

            // update combinations
            VueCollision._customGroups[group]._combinations = VueCollision._combine(VueCollision._customGroups[group].vnodes)
          }
        }

        // free some memory
        delete vnode.child._collisionObject
      }
    })

    // check collisions on mount and update
    Vue.mixin({
      mounted () {
        if (typeof this._collisionObject !== 'undefined') {
          VueCollision.checkGroups([this], VueCollision._filterByGroups(this._collisionObject.customGroupsList))
        }
      },
      updated () {
        if (typeof this._collisionObject !== 'undefined') {
          VueCollision.checkGroups([this], VueCollision._filterByGroups(this._collisionObject.customGroupsList))
        }
      }
    })
  },
  checkAllGroups () {
    VueCollision.checkGroups()
  },
  checkGroups (windowGroup = VueCollision._windowGroup, customGroups = VueCollision._customGroups) {
    // window's collisions
    for (let vnode of windowGroup) {
      if (VueCollision._checkCollision(VueCollision._windowRect, vnode.$el.getBoundingClientRect())) {
        vnode.$emit('collide', window)
      }
    }

    // custom collisions
    for (let groupName of Object.keys(customGroups)) {
      for (let vnodeSet of customGroups[groupName].combinations) {
        if (VueCollision._checkCollision(vnodeSet[0].$el.getBoundingClientRect(), vnodeSet[1].$el.getBoundingClientRect())) {
          vnodeSet[0].$emit('collide-' + groupName, vnodeSet[1])
          vnodeSet[1].$emit('collide-' + groupName, vnodeSet[0])
        }
      }
    }
  },
  _updateWindowRect () {
    VueCollision._windowRect = VueCollision._getWindowRect()
  },
  _getWindowRect () {
    return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
  },
  _pushVnodeToGroup (vnode, groupName) {
    // if this is a new group
    if (!VueCollision._customGroups.hasOwnProperty(groupName)) {
      VueCollision._customGroups[groupName] = { vnodes: [], combinations: [] }
    }

    // push vnode
    VueCollision._customGroups[groupName].vnodes.push(vnode)

    // update combinations' array
    VueCollision._customGroups[groupName].combinations = VueCollision._combine(VueCollision._customGroups[groupName].vnodes)
  },
  _removeVnodeFromGroup (vnode, groupName) {
    let removeIndex = VueCollision._customGroups[groupName].vnodes.findIndex(node => node === vnode)
    VueCollision._customGroups[groupName].vnodes.splice(removeIndex, 1)

    // update combinations' array
    VueCollision._customGroups[groupName].combinations = VueCollision._combine(VueCollision._customGroups[groupName].vnodes)
  },
  _filterByGroups (filter) {
    let customGroups = []
    for (let groupName of filter) {
      customGroups.push(VueCollision._customGroups[groupName])
    }

    return customGroups
  },
  _combine (boxes) {
    let calculatedCombinations = []
    try {
      let combinations = $combination(boxes, 2)
      let combination = undefined
      while (combination = combinations.next()) {
        calculatedCombinations.push(combination)
      }
    } catch (e) { }

    return calculatedCombinations
  },
  _checkCollision (rect1, rect2) {
    return rect1.left < rect2.left + rect2.width &&
    rect1.left + rect1.width > rect2.left &&
    rect1.top < rect2.top + rect2.height &&
    rect1.height + rect1.top > rect2.top
  }
}

export default VueCollision

// in-browser load
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VueCollision)
}
