import React from 'react'
import './App.css'
import Home from './pages/Home';
import {  createBrowserRouter, RouterProvider,
      createRoutesFromElements, Route} from 'react-router-dom';
import DashboardSharedLayout,{loader as dashboardLayoutLoader} from './pagelayout/DashboardSharedLayout';
import CatalogueSetup,{loader as catalogueLoader,action as actionCatalogue } from './pages/CatalogueSetup';
import TokenGenerator, {loader as tokenGenLoader} from './pages/TokenGenerator';
import LibraryBooks,{loader as bookLoader} from './pages/LibraryBooks';
import LibraryVideos,{loader as videoLoader} from './pages/LibraryVideos';
import ErrorSharedLayout from './pagelayout/ErrorSharedLayout';
import NotFound404 from './pages/NotFound404';
import DashboardMain,{loader as dashboardLoader} from './pages/DashboardMain';
import { AuthProvider } from './auth/AuthContext';
import AddBooks,{loader as booksCatalogueLoader} from './pages/AddBooks';
import AddVideos, {loader as videoCatalogueLoader} from './pages/AddVideos';
import StudentAccounts,{loader as studentsLoader} from './pages/StudentAccounts';


const router=createBrowserRouter(createRoutesFromElements(
            <>    
              <Route path="/" element={<Home />} /> 
              <Route path="/dashboard" element={<DashboardSharedLayout/>} loader={dashboardLayoutLoader} > 
                  <Route index element={<DashboardMain/>} loader={dashboardLoader}/>
                  <Route path='catalogue' element={<CatalogueSetup/>} loader={catalogueLoader}
                   action={actionCatalogue} />
                    <Route path='token-generator' element={<TokenGenerator/>} loader={tokenGenLoader}   />
                    <Route path='addbooks' element={<AddBooks/>} loader={booksCatalogueLoader} />
                    <Route path='addvideos' element={<AddVideos/>} loader={videoCatalogueLoader} />
                    <Route path='books' element={<LibraryBooks />} loader={bookLoader} />
                    <Route path='videos' element={<LibraryVideos />} loader={videoLoader} />
                    <Route path='students' element={<StudentAccounts/>} loader={studentsLoader} />
              </Route>  
              <Route path='dashboard/errorpage' element={<ErrorSharedLayout/>}   />    
              <Route path='*' element={<NotFound404/>} /> 
            </>        
));

function App() {
  return ( 
           <AuthProvider>  
            <RouterProvider router={router} />  
          </AuthProvider>
      ) 
   
}

export default App
