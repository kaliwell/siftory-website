import { hydrateRoot } from 'react-dom/client'
import Home from '../app/page'
import '../app/globals.css'
import '../app/depth-demo.css'
import '../app/index-lifecycle.css'
hydrateRoot(document.getElementById('root')!, <Home />)
