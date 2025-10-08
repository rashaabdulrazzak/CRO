//import { authLogin } from "../services";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";


import { useFormik } from 'formik';
import * as Yup from 'yup';
import log from '../assets/triacklogo.png'
import { LoginDTO } from "../modules"
import { useAuth } from "../components/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('password is required').matches(
        /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/,
        'Password must be at least 8 characters long and contain one uppercase letter and one or more symbols'
    ),
  });
  const mockUsers = [
  { id: '1', username: 'coordinator1', password: 'Pass123!', email:"coordinator1@test.com", role: 'field_coordinator' },
  { id: '2', username: 'radiologist1', password: 'Pass123!', email:"radiologist1@test.com", role: 'radiologist' },
  { id: '5', username: 'monitor1', password: 'Pass123!', email:"monitor@test.com", role: 'monitor' },
  { id: '6', username: 'Biostatistician', password: 'Pass123!', email:"biostatistician@test.com", role: 'biostatistician' },
  { id: '7', username: 'patologcoordinator', password: 'Pass123!', email:"patologcoordinator@test.com", role: 'patolog_coordinator' },
];
  const loginform = useFormik<LoginDTO>({
    initialValues: new LoginDTO(),
    validateOnChange: true,
    validationSchema:validationSchema,
    onSubmit: async () => {
    //  await authLogin(loginform.values);
      const success = login(loginform.values.email, loginform.values.password);
      if (success) {
        // Redirect to a protected route or dashboard
        window.location.href = '/'; // Example redirect
      } else {
        alert('Invalid email or password');
      }
    },
  });

  return (
    <div className="flex flex-nowrap login-form-container">
    <form className="" onSubmit={loginform.handleSubmit}>
      <div className="login-container">
        <h1 className="font-bold">Traick Login</h1>
        <div className="login-form">
        <small className="p-error">{loginform.errors.email}</small>
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">
              <i className="pi pi-user text-white"></i>
            </span>
            <InputText
              placeholder="Username"
              value={loginform.values.email}
              onChange={loginform.handleChange}
              name="email"
            />
          </div>
          <small className="p-error">{loginform.errors.password}</small>
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">
              <i className="pi pi-lock text-white"></i>
            </span>
            <InputText
              type="password"
              placeholder="Password"
              name="password"
              value={loginform.values.password}
              onChange={loginform.handleChange}
            />
          </div>
          <Button className="login-btn text-white" label="Login" icon="pi pi-sign-in text-white  " />
        </div>
      </div>
    </form>
     <div className="flex flex-col items-center justify-center p-3 w-1/2">
     <img src={log}/>
      <div className="test-users-info" style={{ marginTop: '20px', padding: '15px' }}>
          <h3 style={{ marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>Test Users</h3>
          {mockUsers.map((user) => (
            <div key={user.id} style={{ marginBottom: '8px', fontSize: '14px' }}>
              <strong>Role:</strong> {user.role}<br />
              <strong>Email:</strong> {user.email}<br />
              <strong>Password:</strong> {user.password}
            </div>
          ))}
        </div>
   </div>
 </div>
 
  );
};

export default Login;

