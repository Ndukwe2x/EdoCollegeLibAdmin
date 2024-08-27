import './topbar.css';
import logo from '../../assets/edocollegelogo.png';
import appcaption from '../../assets/appcaption.png'
import AvatarProfile from '../AvatarProfile/AvatarProfile';

function TopBar({showSideMenu, showAvatar}){

function handleToggleSideBar(){
    
    document.body.classList.toggle('toggle-sidebar');


}
function handleToggleAvater(){


}

return (
    <div className='topbar fixed-top'>
          {showSideMenu && <i className="bi bi-list sidebar-icon icon-color" 
           title='toggle side menu' onClick={handleToggleSideBar}></i>}
           <div className='logo'>
            <img src={logo} alt='logo'/>                     
           </div>
            <h2 className='caption'>Edo College Library</h2>                    
            {  showAvatar && <AvatarProfile />}
    </div>
)

}

export default TopBar;