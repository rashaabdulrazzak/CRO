import {  Routes, Route, useLocation } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import'../../styles/global.css'
import 'primereact/resources/primereact.min.css'; 
import 'primeicons/primeicons.css';
import Home from '../../pages/Home';
import Users from '../../pages/Users';
import Login from '../../pages/Login';
import Roles from '../../pages/Roles';
import PredictData from '../../pages/PredictData';
import ImageEvaluation from '../../pages/ImageEvaluation';
import ImageAssessment from '../../pages/ImageAssesment';
import ApprovalCases from '../../pages/ApprovalCases';
import MonitorHome from '../../pages/MonitorHome';
import DataDownload from '../../pages/DataDownload';
import LockedData from '../../pages/LockedData';
import PathologyResults from '../../pages/PathologyResults';
import AiAssessment  from '../../pages/AiAssessment';

const LayoutComponent = () => {
  const location = useLocation()
     const isLoginPage = location.pathname === '/login';
  return (
    
    <div>
      {!isLoginPage && <NavBar />}
      <main>
      <Routes>
      <Route  path='/login' element={<Login/>}></Route>
      <Route path='/' element={<Home/>}></Route>
        <Route path="/users" element={<Users />}></Route>
        <Route path="/trial-cases" element={<PredictData />}></Route>
        <Route path="/roles" element={<Roles />}></Route>
        
        <Route path="/image-evaluation" element={<ImageEvaluation />}></Route>
        <Route path="/image-assessment" element={<ImageAssessment />}></Route>
        <Route path="/ai-assessment" element={<AiAssessment />}></Route>
         <Route path="/approval-cases" element={<ApprovalCases />}></Route>
         <Route path="/monitor-home" element={<MonitorHome />}></Route> 
         <Route path="/data-download" element={<DataDownload />}></Route> 
         <Route path="/locked-data" element={<LockedData />}></Route> 
         <Route path="/pathology-results" element={<PathologyResults />}></Route> 

      </Routes>
      </main>
    </div>
  );
};

export default LayoutComponent;
