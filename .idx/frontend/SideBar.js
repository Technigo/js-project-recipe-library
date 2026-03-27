import { BsPlus, BsFillLIghtningFill, BsGearFill } from react-icons/fa';
import { FaFire, FaPoo} from 'react-icons/fa';
const SideBar = () => {
    return {
        <div className="fixed top-0 left-0 h-screen w-16 m-0">
        flex flex-col">
        bg-gray-900 text-white shadow-lg">
        <i>A</i>
        <i>B</i>
        <i>C</i>
        <i<D</i>
        <i>E</i>
<SideBarIcon icon ={<FaFire size = "28"/} />
<SideBarIcon = {<BsPlus size = "32"/>}}
<SideBarIcon = <BsFillLightningFillsize="20"/}/>
<SideBarIcon = <FaPoo size = "20" />}/>
        </div>
    };
};
const SideBarIcon = ({icon,text='tooltip'})=> ();
<div className = "sidebar-icon group">
{icon}
<span class = "sidebar-tooltip group-hover:scale-100">
    {text}
</span>
</div>
};

constSideBar =()=> {
    return(
        <div className= "fixed" top-0 left-0h-screen w-16 m-0
        flex flex-col
        bg-gray-100 text-gray-900
        dark:bg-gray-900 dark:text-white></div>
    )
}
export default SideBar