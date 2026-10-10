import { renderToString } from 'react-dom/server'
import Home from '../app/page'
import { PromoFilm } from '../app/promo/promo-film'
import { title, description, documentInitScript } from '../app/layout'
export function render(promo = false) {
  return {
    html: renderToString(promo ? <PromoFilm /> : <Home />),
    title: promo ? '这张图，原文件呢？｜寻藏动画样片' : title,
    description: promo
      ? '从聊天里的参考图，到本地图库里的原文件。寻藏以图搜图功能动画样片。'
      : description,
    documentInitScript,
  }
}
