import LayoutComponent from './routes/Layout/LayoutComponent';
import './styles/App.scss'
import { PrimeReactProvider } from 'primereact/api';
import { BrowserRouter } from 'react-router-dom';

import 'primereact/resources/primereact.min.css';

// Icons
import 'primeicons/primeicons.css';

// Layout utilities (spacing, grid, .field, .p-fluid, etc.)
import 'primeflex/primeflex.css'
function App() {
     return (
    <div className="App">
      <BrowserRouter>
      <PrimeReactProvider>
      <LayoutComponent/>
      </PrimeReactProvider>
      </BrowserRouter>
    </div>
     )
}

export default App
