export default(()=>{

/**
 * Curve component for A-Frame to deal with spline curves
 */
const zAxis = new THREE.Vector3(0, 0, 1)
const degToRad = THREE.Math.degToRad

AFRAME.registerComponent('curve-point', {
  // dependencies: ['position'],

  schema: {},

  init: function () {
    this.el.addEventListener('componentchanged', this.changeHandler.bind(this))
    this.el.emit('curve-point-change')
  },

  changeHandler: function (event) {
    if (event.detail.name == 'position') {
      this.el.emit('curve-point-change')
    }
  }
})

AFRAME.registerComponent('curve', {
  // dependencies: ['curve-point'],

  schema: {
    type: {
      type: 'string',
      default: 'CatmullRom',
      oneOf: ['CatmullRom', 'CubicBezier', 'QuadraticBezier', 'Line']
    },
    closed: {
      type: 'boolean',
      default: false
    }
  },

  init: function () {
    this.pathPoints = null
    this.curve = null

    this.el.addEventListener('curve-point-change', this.update.bind(this))
  },

  update: function (oldData) {
    this.points = Array.from(
      this.el.querySelectorAll('a-curve-point, [curve-point]')
    )

    if (this.points.length <= 1) {
      console.warn('At least 2 curve-points needed to draw a curve')
      this.curve = null
    } else {
      // Get Array of Positions from Curve-Points
      var pointsArray = this.points.map(function (point) {
        if (
          point.x !== undefined &&
          point.y !== undefined &&
          point.z !== undefined
        ) {
          return point
        }

        return point.object3D.getWorldPosition()
      })

      // Update the Curve if either the Curve-Points or other Properties changed
      if (
        !AFRAME.utils.deepEqual(pointsArray, this.pathPoints) ||
        (oldData !== 'CustomEvent' &&
          !AFRAME.utils.deepEqual(this.data, oldData))
      ) {
        this.curve = null

        this.pathPoints = pointsArray

        // TODO: Make other Curve-Types work
        // this.threeConstructor = THREE[this.data.type + 'Curve3'];
        this.threeConstructor = THREE['CatmullRomCurve3']

        if (!this.threeConstructor) {
          throw new Error(
            'No Three constructor of type (case sensitive): ' +
              this.data.type +
              'Curve3'
          )
        }

        // Create Curve
        this.curve = new this.threeConstructor(this.pathPoints)
        this.curve.closed = this.data.closed

        this.el.emit('curve-updated')
      }
    }
  },

  remove: function () {
    this.el.removeEventListener('curve-point-change', this.update.bind(this))
  },

  closestPointInLocalSpace: function closestPoint (
    point,
    resolution,
    testPoint,
    currentRes
  ) {
    if (!this.curve) throw Error('Curve not instantiated yet.')
    resolution = resolution || 0.1 / this.curve.getLength()
    currentRes = currentRes || 0.5
    testPoint = testPoint || 0.5
    currentRes /= 2
    var aTest = testPoint + currentRes
    var bTest = testPoint - currentRes
    var a = this.curve.getPointAt(aTest)
    var b = this.curve.getPointAt(bTest)
    var aDistance = a.distanceTo(point)
    var bDistance = b.distanceTo(point)
    var aSmaller = aDistance < bDistance
    if (currentRes < resolution) {
      var tangent = this.curve.getTangentAt(aSmaller ? aTest : bTest)
      if (currentRes < resolution) {
        return {
          result: aSmaller ? aTest : bTest,
          location: aSmaller ? a : b,
          distance: aSmaller ? aDistance : bDistance,
          normal: normalFromTangent(tangent),
          tangent: tangent
        }
      }
    }
    if (aDistance < bDistance) {
      return this.closestPointInLocalSpace(point, resolution, aTest, currentRes)
    } else {
      return this.closestPointInLocalSpace(point, resolution, bTest, currentRes)
    }
  }
})

var tempQuaternion = new THREE.Quaternion()

function normalFromTangent (tangent) {
  var lineEnd = new THREE.Vector3(0, 1, 0)
  tempQuaternion.setFromUnitVectors(zAxis, tangent)
  lineEnd.applyQuaternion(tempQuaternion)
  return lineEnd
}

AFRAME.registerShader('line', {
  schema: {
    color: { default: '#ff0000' }
  },

  init: function (data) {
    this.material = new THREE.LineBasicMaterial(data)
  },

  update: function (data) {
    this.material = new THREE.LineBasicMaterial(data)
  }
})

AFRAME.registerComponent('draw-curve', {
  // dependencies: ['curve', 'material'],

  schema: {
    curve: { type: 'selector' }
  },

  init: function () {
    this.data.curve.addEventListener('curve-updated', this.update.bind(this))
  },

  update: function () {
    if (this.data.curve) {
      this.curve = this.data.curve.components.curve
    }

    if (this.curve && this.curve.curve) {
      var mesh = this.el.getOrCreateObject3D('mesh', THREE.Line)

      lineMaterial = mesh.material
        ? mesh.material
        : new THREE.LineBasicMaterial({
          color: '#ff0000'
        })

      var lineGeometry = new THREE.Geometry()
      lineGeometry.vertices = this.curve.curve.getPoints(
        this.curve.curve.points.length * 10
      )

      this.el.setObject3D('mesh', new THREE.Line(lineGeometry, lineMaterial))
    }
  },

  remove: function () {
    this.data.curve.removeEventListener('curve-updated', this.update.bind(this))
    this.el.getObject3D('mesh').geometry = new THREE.Geometry()
  }
})

AFRAME.registerComponent('clone-along-curve', {
  // dependencies: ['curve'],

  schema: {
    curve: { type: 'selector' },
    spacing: { default: 1 },
    rotation: {
      type: 'vec3',
      default: '0 0 0'
    },
    scale: {
      type: 'vec3',
      default: '1 1 1'
    }
  },

  init: function () {
    this.el.addEventListener('model-loaded', this.update.bind(this))
    this.data.curve.addEventListener('curve-updated', this.update.bind(this))
  },

  update: function () {
    this.remove()

    if (this.data.curve) {
      this.curve = this.data.curve.components.curve
    }

    if (!this.el.getObject3D('clones') && this.curve && this.curve.curve) {
      var mesh = this.el.getObject3D('mesh')

      var length = this.curve.curve.getLength()
      var start = 0
      var counter = start

      const cloneMesh = this.el.getOrCreateObject3D('clones', THREE.Group)

      const parent = new THREE.Object3D()
      mesh.scale.set(this.data.scale.x, this.data.scale.y, this.data.scale.z)
      mesh.rotation.set(
        degToRad(this.data.rotation.x),
        degToRad(this.data.rotation.y),
        degToRad(this.data.rotation.z)
      )
      mesh.rotation.order = 'YXZ'

      parent.add(mesh)

      while (counter <= length) {
        const child = parent.clone(true)

        child.position.copy(this.curve.curve.getPointAt(counter / length))

        tangent = this.curve.curve.getTangentAt(counter / length).normalize()

        child.quaternion.setFromUnitVectors(zAxis, tangent)

        cloneMesh.add(child)

        counter += this.data.spacing
      }
    }
  },

  remove: function () {
    this.curve = null
    if (this.el.getObject3D('clones')) {
      this.el.removeObject3D('clones')
    }
  }
})

AFRAME.registerPrimitive('a-draw-curve', {
  defaultComponents: {
    'draw-curve': {}
  },
  mappings: {
    curveref: 'draw-curve.curve'
  }
})

AFRAME.registerPrimitive('a-curve-point', {
  defaultComponents: {
    'curve-point': {}
  },
  mappings: {}
})

AFRAME.registerPrimitive('a-curve', {
  defaultComponents: {
    curve: {}
  },

  mappings: {
    type: 'curve.type'
  }
})

/**
 * Alongpath component for A-Frame.
 * Move Entities along a predefined Curve
 */
AFRAME.registerComponent('alongpath', {
  // dependencies: ['curve'],

  schema: {
    curve: { default: '' },
    triggers: { default: 'a-curve-point' },
    triggerRadius: { type: 'number', default: 0.01 },
    dur: { default: 1000 },
    delay: { default: 0 },
    loop: { default: false },
    rotate: { default: false },
    resetonplay: { default: true }
  },

  init: function () {
    // We have to fetch curve and triggers manually because of an A-FRAME ISSUE
    // with Property-Type "Selector" / "SelectorAll": https://github.com/aframevr/aframe/issues/2517
  },

  update: function (oldData) {
    this.curve = document.querySelector(this.data.curve)
    this.triggers = this.curve.querySelectorAll(this.data.triggers)

    if (!this.curve) {
      console.warn("Curve not found. Can't follow anything...")
    } else {
      this.initialPosition = this.el.object3D.position
    }

    this.reset()
  },

  reset: function () {
    // Reset to initial state
    this.interval = 0

    this.el.removeState('endofpath')
    this.el.removeState('moveonpath')

    if (this.activeTrigger) {
      this.activeTrigger.removeState('alongpath-active-trigger')
      this.activeTrigger = null
    }
  },

  getI_: function (interval, delay, dur) {
    var i = 0

    if (interval - delay >= dur) {
      // Time is up, we should be at the end of the path
      i = 1
    } else if (interval - delay < 0) {
      // We are still waiting for the delay-time to finish
      // so keep entity at the beginning of the path
      i = 0
    } else {
      // Update path position based on timing
      i = (interval - delay) / dur
    }

    return i
  },

  tick: function (time, timeDelta) {
    var curve = this.curve.components['curve']
      ? this.curve.components['curve'].curve
      : null

    if (curve) {
      // Only update position if we didn't reach
      // the end of the path
      if (!this.el.is('endofpath')) {
        this.interval = this.interval + timeDelta

        var i = this.getI_(this.interval, this.data.delay, this.data.dur)

        if (this.data.loop === false && i >= 1) {
          // Set the end-position
          this.el.setAttribute(
            'position',
            curve.points[curve.points.length - 1]
          )

          // We have reached the end of the path and are not going
          // to loop back to the beginning therefore set final state
          this.el.removeState('moveonpath')
          this.el.addState('endofpath')
          this.el.emit('movingended')
        } else if (this.data.loop === true && i >= 1) {
          // We have reached the end of the path
          // but we are looping through the curve,
          // so restart here.
          this.el.emit('movingended')
          this.interval = this.data.delay
        } else {
          // We are starting to move or somewhere in the middle of the path…
          if (!this.el.is('moveonpath')) {
            this.el.addState('moveonpath')
            this.el.emit('movingstarted')
          }

          // …updating position
          var p = curve.getPoint(i)
          this.el.setAttribute('position', p)
        }

        // Update Rotation of Entity
        if (this.data.rotate === true) {
          var nextInterval = this.interval + timeDelta
          var nextPosition = curve.getPoint(
            this.getI_(nextInterval, this.data.delay, this.data.dur)
          )

          this.el.object3D.lookAt(nextPosition)
        }

        // Check for Active-Triggers
        if (this.triggers && this.triggers.length > 0) {
          this.updateActiveTrigger()
        }
      }
    } else {
      console.error(
        'The entity associated with the curve property has no curve component.'
      )
    }
  },

  play: function () {
    if (this.data.resetonplay) {
      this.reset()
    }
  },

  remove: function () {
    this.el.object3D.position.copy(this.initialPosition)
  },

  updateActiveTrigger: function () {
    for (var i = 0; i < this.triggers.length; i++) {
      if (this.triggers[i].object3D) {
        if (
          this.triggers[i].object3D.position.distanceTo(
            this.el.object3D.position
          ) <= this.data.triggerRadius
        ) {
          // If this element is not the active trigger, activate it - and if necessary deactivate other triggers.
          if (this.activeTrigger && this.activeTrigger != this.triggers[i]) {
            this.activeTrigger.removeState('alongpath-active-trigger')
            this.activeTrigger.emit('alongpath-trigger-deactivated')

            this.activeTrigger = this.triggers[i]
            this.activeTrigger.addState('alongpath-active-trigger')
            this.activeTrigger.emit('alongpath-trigger-activated')
          } else if (!this.activeTrigger) {
            this.activeTrigger = this.triggers[i]
            this.activeTrigger.addState('alongpath-active-trigger')
            this.activeTrigger.emit('alongpath-trigger-activated')
          }

          break
        } else {
          // If this Element was the active trigger, deactivate it
          if (this.activeTrigger && this.activeTrigger == this.triggers[i]) {
            this.activeTrigger.removeState('alongpath-active-trigger')
            this.activeTrigger.emit('alongpath-trigger-deactivated')
            this.activeTrigger = null
          }
        }
      }
    }
  }
})

  


  
})()