// Shared menu navigation: arrow keys / gamepad d-pad + stick move a highlight
// across the `.menu-item` buttons inside `node`; Enter (native to the focused
// button) or the gamepad A button selects. Space is reserved for pause toggle.
// Apply with `use:menuNav`.
//
// The `.is-active` highlight only shows while the player is actually using a
// keyboard or gamepad. Using the mouse or touch clears it, so those users get
// the indicator from :hover / :active instead of a confusing persistent one.
export function menuNav(node) {
  let active = 0
  let nav = false // keyboard/gamepad highlight visible (vs mouse/touch)
  let raf
  // Assume buttons are held at mount so a press carried over from the previous
  // screen (e.g. the A that opened this menu) needs a release before it acts.
  let navHeld = true
  let prevSelect = true

  const items = () =>
    [...node.querySelectorAll('.menu-item')].filter((b) => !b.disabled)

  const render = () => {
    const els = items()
    if (!els.length) return
    active = ((active % els.length) + els.length) % els.length
    els.forEach((el, i) => el.classList.toggle('is-active', nav && i === active))
    if (nav) els[active].focus()
  }

  const exitNav = () => {
    if (!nav) return
    nav = false
    const els = items()
    els.forEach((el) => el.classList.remove('is-active'))
    if (els.includes(document.activeElement)) document.activeElement.blur()
  }

  // First directional press just reveals the highlight; subsequent ones move.
  const move = (dir) => {
    if (nav) active += dir
    nav = true
    render()
  }
  const onKey = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      e.stopPropagation() // keep arrows out of the game's keyboard input
      move(1)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      e.stopPropagation()
      move(-1)
    } else if (e.key === ' ') {
      // Space is reserved for pause; block its native button activation.
      e.preventDefault()
    }
    // Enter is handled natively by the focused button (confirm selection).
  }
  // On window, not node: nothing inside is focused until the player navigates.
  window.addEventListener('keydown', onKey)

  // Mouse / touch use cancels the keyboard-gamepad highlight.
  const onPointer = () => exitNav()
  window.addEventListener('mousemove', onPointer)
  window.addEventListener('pointerdown', onPointer)

  // Gamepad: d-pad / left-stick to move, A (button 0) to select. Start
  // (button 9) is intentionally ignored — it toggles pause elsewhere.
  const poll = () => {
    const gp = [...(navigator.getGamepads?.() ?? [])].find(Boolean)
    if (gp) {
      const x = gp.axes[0] ?? 0
      const y = gp.axes[1] ?? 0
      const next =
        gp.buttons[13]?.pressed || gp.buttons[15]?.pressed || y > 0.5 || x > 0.5
      const prev =
        gp.buttons[12]?.pressed || gp.buttons[14]?.pressed || y < -0.5 || x < -0.5
      if ((next || prev) && !navHeld) {
        move(next ? 1 : -1)
        navHeld = true
      } else if (!next && !prev) {
        navHeld = false
      }

      const sel = gp.buttons[0]?.pressed
      if (sel && !prevSelect) items()[active]?.click()
      prevSelect = sel
    }
    raf = requestAnimationFrame(poll)
  }
  raf = requestAnimationFrame(poll)

  return {
    destroy() {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousemove', onPointer)
      window.removeEventListener('pointerdown', onPointer)
      cancelAnimationFrame(raf)
    },
  }
}
