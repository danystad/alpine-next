import { intersect } from '../src/index.js'

document.addEventListener('alpine:initializing', () => {
    window.Alpine.directive('intersect', intersect)
})
