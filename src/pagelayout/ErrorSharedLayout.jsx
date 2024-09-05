

import serverError from '../assets/ServerError5003.gif'

const ErrorSharedLayout=()=>{    
    
   return(
    
            <main className="err-page relative">
                <h2 className="Errorheader absolute">Oops! Internal Server Error</h2>
                <p className="smllerrtext absolute">Web page encountered and error..</p>
                <div className="err-msgcontnt">                   
                  <img src={ serverError} alt />
                </div>
            </main>
     
   )

}
export default ErrorSharedLayout;