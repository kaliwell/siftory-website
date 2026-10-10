import { hydrateRoot } from 'react-dom/client'
import { PromoFilm } from '../app/promo/promo-film'
import '../app/globals.css'
import '../app/promo/promo.css'
import '../app/promo/pain-scene.css'
hydrateRoot(document.getElementById('root')!, <PromoFilm />)
