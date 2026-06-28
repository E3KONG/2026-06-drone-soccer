<script>
  import selectUrl from '../../assets/hud/Icon_select.svg?url'

  let { onclick, children, selected } = $props()
</script>

<button
  class="menu-item"
  class:toggle={selected !== undefined}
  class:on={selected}
  type="button"
  {onclick}
>
  <img class="cursor" src={selectUrl} alt="" />
  <span>{@render children()}</span>
  <img class="cursor right" src={selectUrl} alt="" />
</button>
