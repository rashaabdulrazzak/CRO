import LayoutComponent from './routes/Layout/LayoutComponent';

import { PrimeReactProvider } from 'primereact/api';
import { BrowserRouter } from 'react-router-dom';
// import 'primeflex/primeflex.css';

import 'primereact/resources/primereact.min.css';

// Icons
import 'primeicons/primeicons.css';


 //import 'primeflex/primeflex.css'
import './styles/App.scss'
import { AuthProvider } from './components/AuthContext';
function App() {
     return (

    <div className="App">
       <AuthProvider>
        <BrowserRouter>
      <PrimeReactProvider  >
      <LayoutComponent/>
      </PrimeReactProvider>
      </BrowserRouter>
       </AuthProvider>
     
    </div>
     )
}

export default App
