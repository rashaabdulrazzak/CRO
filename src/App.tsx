import LayoutComponent from './routes/Layout/LayoutComponent';
import './styles/App.scss'
import { PrimeReactProvider } from 'primereact/api';
import { BrowserRouter } from 'react-router-dom';
// import 'primeflex/primeflex.css';

import 'primereact/resources/primereact.min.css';

// Icons
import 'primeicons/primeicons.css';

// Layout utilities (spacing, grid, .field, .p-fluid, etc.)
// import 'primeflex/primeflex.css'
import { AuthProvider } from './components/AuthContext';
function App() {
     return (

    <div className="App">
       <AuthProvider>
        <BrowserRouter>
      <PrimeReactProvider>
      <LayoutComponent/>
      </PrimeReactProvider>
      </BrowserRouter>
       </AuthProvider>
     
    </div>
     )
}

export default App
