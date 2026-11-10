import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { useCartStore } from '../cart/store'
import { installFakeIntersectionObserver } from './intersectionObserver'

installFakeIntersectionObserver()

afterEach(() => {
  cleanup()
  sessionStorage.clear()
  localStorage.clear()
  useCartStore.setState({ items: [] })
})
