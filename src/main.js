import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

if (import.meta.env.PROD) import('./swei-subset.css')
else import('./swei-cdn.css')

mount(App, { target: document.getElementById('app') })
