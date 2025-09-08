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
        <Route path="/trialcases" element={<PredictData />}></Route>
        <Route path="/roles" element={<Roles />}></Route>
        {/* <Route path="/patientEntry" element={<PatientEntry />}></Route> */}
        <Route path="/imageEvaluation" element={<ImageEvaluation />}></Route>
        <Route path="/imageAssessment" element={<ImageAssessment />}></Route>
        <Route path="/approvalCases" element={<ApprovalCases />}></Route>

      </Routes>
      </main>
    </div>
  );
};

export default LayoutComponent;
