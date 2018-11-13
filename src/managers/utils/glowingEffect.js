import { glowingEffectSelector } from '../../static/glowingEffectSelector'

export const addGlowingEffectToMapImages = (shadowRoot) => {
  const imagesElements = shadowRoot.querySelectorAll(glowingEffectSelector)
  for (let i = 0; i < imagesElements.length; i++) {
      const element = imagesElements[i].parentElement
      element.innerHTML = ' \
        <defs> \
          <filter id="glow"> \
            <femerge> \
              <femergenode in="SourceGraphic"></femergenode> \
            </femerge> \
          </filter> \
        </defs> \
        ' + element.innerHTML
  }
}