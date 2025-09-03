
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { useState } from 'react';
import { PanelMenu } from 'primereact/panelmenu';

const SideBar = () =>{
    const [visible, setVisible] = useState(false);

    const items = [
       
        {
            label: 'Users',
            icon: 'pi pi-users  ',
             url: "/users",
        },
        {
            label: 'Canvases',
            icon: 'pi pi-palette',
             url: "/canvases",
        },
        {
            label: 'Downloads',
            icon: 'pi pi-download',
            url: "/downloads",
        },
        {
            label: 'Payments',
            icon: 'pi pi-credit-card',
            url: "/payments",
        },
        {
            label: 'Reviews',
            icon: 'pi pi-comment',
             url: "/reviews",
        },
       

    ];
     const itemsLower = [
       
        {
            label: 'Settings',
            icon: 'pi pi pi-cog ',
             url: "/settings",
        },
        {
            label: 'Performance',
            icon: 'pi pi-chart-bar',
             url: "/",
        }
       
       

    ];
    const customHeader = (
       <div className="flex align-items-center justify-content-between flex-shrink-0">
        <span className="inline-flex align-items-center gap-2">
            <Avatar image="https://thimly.com/assets/black-01-removebg-preview-Bo65H6jM.png" shape="circle"  size="xlarge"/>
        </span>
    </div>
    );
 
    return (
        <div className="card flex justify-content-center">
        <Sidebar header={customHeader} visible={visible} onHide={() => setVisible(false)}>
              <div className="flex flex-col h-full">
        <PanelMenu model={items} className="w-full md:w-20rem" />
         <hr className='my-3 mx-3' />

        <PanelMenu model={itemsLower} className="w-full md:w-20rem" />
         <div className="mt-auto">
                                    <hr className="mb-3 mx-3 border-top-1 border-none surface-border" />
                                    <a  className="m-3 flex align-items-center cursor-pointer p-3 gap-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors p-ripple">
                                        <Avatar image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png" shape="circle" />
                                        <span className="font-bold">Amy Elsner</span>
                                    </a>
                                </div>
                                </div>
        </Sidebar>

       
        <Button className="menu-btn" icon="pi pi-align-justify" size="small" onClick={() => setVisible(true)} />
    </div>
    )
}
export default SideBar