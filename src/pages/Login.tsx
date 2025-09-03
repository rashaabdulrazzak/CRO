import { authLogin } from "../services";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";


import { useFormik } from 'formik';
import * as Yup from 'yup';
import log from '../assets/triacklogo.png'
import { LoginDTO } from "../modules"

const Login = () => {
  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('password is required').matches(
        /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/,
        'Password must be at least 8 characters long and contain one uppercase letter and one or more symbols'
    ),
  });
  const loginform = useFormik<LoginDTO>({
    initialValues: new LoginDTO(),
    validateOnChange: true,
    validationSchema:validationSchema,
    onSubmit: async () => {
      await authLogin(loginform.values);
    },
  });

  return (
    <div className="flex flex-nowrap login-form-container">
    <form className="" onSubmit={loginform.handleSubmit}>
      <div className="login-container">
      {/* <h1 className="font-bold">Welcome in DOSHTU</h1> */}
        <h1 className="font-bold">TraickLogin</h1>
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
     <div className="shopping-cart-container">
     <img src={log}/>
   </div>
 </div>
 
  );
};

export default Login;

