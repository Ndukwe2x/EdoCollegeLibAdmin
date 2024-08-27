import React from 'react'
import './App.css'
import Home from './pages/Home';
import {  createBrowserRouter, RouterProvider,
      createRoutesFromElements, Route} from 'react-router-dom';
import DashboardSharedLayout,{loader as dashboardLayoutLoader} from './pagelayout/DashboardSharedLayout';
import CatalogueSetup,{loader as catalogueLoader,action as actionCatalogue } from './pages/CatalogueSetup';
import TokenGenerator, {loader as tokenGenLoader,action as actionToken} from './pages/TokenGenerator';
import LibraryBooks,{loader as bookLoader} from './pages/LibraryBooks';
import LibraryVideos,{loader as videoLoader} from './pages/LibraryVideos';
import ErrorSharedLayout from './pagelayout/ErrorSharedLayout';
import NotFound404 from './pages/NotFound404';
import DashboardMain from './pages/DashboardMain';
import { AuthProvider } from './auth/AuthContext';


const router=createBrowserRouter(createRoutesFromElements(
            <>    
              <Route path="/" element={<Home />} /> 
              <Route path="/dashboard" element={<DashboardSharedLayout/>} loader={dashboardLayoutLoader} > 
                  <Route index element={<DashboardMain/>}/>
                  <Route path='catalogue' element={<CatalogueSetup/>} loader={catalogueLoader}
                   action={actionCatalogue} />
                    <Route path='token/generator' element={<TokenGenerator/>} loader={tokenGenLoader} 
                    action={ actionToken} />
                    <Route path='books' element={<LibraryBooks />} loader={bookLoader} />
                    <Route path='videos' element={<LibraryVideos />} loader={videoLoader} />
              </Route>      
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
