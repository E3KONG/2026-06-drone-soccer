<script>
  import selectUrl from '../../assets/hud/Icon_select.svg?url'

  let { onclick, children } = $props()
</script>

<button class="menu-item" type="button" {onclick}>
  <img class="cursor" src={selectUrl} alt="" />
  <span>{@render children()}</span>
  <img class="cursor right" src={selectUrl} alt="" />
</button>
