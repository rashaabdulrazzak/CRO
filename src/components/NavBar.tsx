import { Menubar } from "primereact/menubar";
// import SideBar from "./SideBar";
import { Avatar } from "primereact/avatar";
import { useRef,  } from "react";

import { useNavigate } from "react-router-dom";

import logo from '../assets/triacklogo.png'
import { Menu } from "primereact/menu";
const NavBar = () =>{
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const menuLeft = useRef<any>(null);
const navigate = useNavigate()
 const items = [
    {
        label: 'Rasha',
        items: [
            {
                label: 'My Profile',
                icon: 'pi pi-user',
            },
            {
                label: 'Log Out',
                icon: 'pi pi pi-sign-out',
                command:() => navigate('/login')
            }
        ]
    }
];
  
    const start = <img alt="logo" src={logo} className="mr-2 h-5   "></img>;

      const menuItems = [
        {
            label: 'Trial Cases',
            command:()=>navigate('/trialcases'),
             roles: ['field_coordinator']
           
        },
        {
            label: 'Image Assessment',
            command:()=>navigate('/imageAssessment')
        },
        {
            label: 'Pathology of Cases',
            
        },
        {
            label: ' Approval of Cases',
            command:() => navigate('/approvalCases')
            
        },
        {
            label: 'Users',
            command:() => navigate('/users')
            
        },
        {
            label: 'Roles',
            command:() => navigate('/roles')
            
        },
        {
            label: 'Entry',
            command:() => navigate('/patientEntry')
            
        },
        {
            label: 'evaluation',
            command:() => navigate('/imageEvaluation')
            
        },
    ];
const end = (
  <div className="flex items-center space-x-3 pr-6 ml-6" >
    <i
      className="pi pi-globe text-lg cursor-pointer"
    ></i>
    <i
      className="pi pi-bell text-lg cursor-pointer"
    ></i>

    <i
      className="pi pi-clone text-lg cursor-pointer"
    ></i>

    <Avatar
      image={"https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"}
      className="cursor-pointer w-10 h-10"
      onClick={(event) => menuLeft.current.toggle(event)}
      shape="circle"
    />

    {/* <h3 className="font-bold">Rasha</h3> */}
  </div>
);


    return (
        <div className="card ">
            <Menu model={items} popup ref={menuLeft} id="popup_menu_left" /> 
            <Menubar className="Navbar px-3 py-1.5" model={menuItems} start={start} end={end}  />
            
        </div>
    )
}

export default NavBar;