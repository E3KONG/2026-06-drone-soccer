import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { colors } from './lib/constants/colors'

// CSS color variables from colors.ts to css
const root = document.documentElement
for (const [group, values] of Object.entries(colors)) {
  if (typeof values === 'string') {
    root.style.setProperty(`--color-${group}`, values)
  } else {
    for (const [shade, hex] of Object.entries(values)) {
      root.style.setProperty(`--color-${group}-${shade}`, hex)
    }
  }
}

mount(App, { target: document.getElementById('app') })