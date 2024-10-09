import { Tooltip } from 'react-tooltip';
import { Formik } from 'formik';
import *  as Yup from 'yup';
import './login.css'
import { useState,useEffect,createContext,useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../../auth/authHandler';
import { useAuth} from '../../auth/AuthContext';
import PasswordInput from '../PasswordInput/PasswordInput';
import PromptModal from '../ModalDialogs/PromptModal';


const AdminLogin = () => {
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [loginError, setLoginError] = useState(false);
  const [loginResponse,setLoginResponse]=useState(null);
  const {setAuthenticatedUser}= useAuth(); //get global Auth context for setting user credentials
  const [promptBody,setPromptBody]=useState("");
  const [promptHeader,setPromptHeader]=useState("");
  const [promptMode,setPromptMode]=useState("");
  const [showModal,setShowModal]=useState(false);  
  const navigate= useNavigate();
 
  const tooltipStyle = { backgroundColor: '#20134488' };

 
  useEffect(()=>{
      if(loginResponse?.status===200)
       { 
         setLoginError(false)
         localStorage.setItem("credentials",JSON.stringify(loginResponse.data));
         setAuthenticatedUser(loginResponse); //set credentials on global context        
         navigate('/dashboard',{replace:true}); //move to admin dashboard authenticated.
       }else
       localStorage.removeItem("credentials");
   },[loginResponse])


  const loginSubmit = async (values) => {

  const { email: userEmail, password: adminpass } = values;

  setSubmitStatus("submitting");   
    try {
         
         const response = await loginAdmin(userEmail,adminpass);
         setLoginResponse(response);       
         values.email = ''; values.password = ''; //clear form after submit
    } 
    catch (error)
    {
      
      if (error.response && (error.response.status == 401 || error.response.status == 404))
        setLoginError(true);
      else if (error.code === "ERR_NETWORK"){
        setPromptHeader("Network Error");
        setPromptBody(" Please check your internet connection");
        setPromptMode("warning");
        setShowModal(true);
       // alert("Please check your internet connection");

      }
        
      else
        alert("Internal Server Error. Please try again later");
      
    }
    finally {
       setSubmitStatus("idle");
    }

  }
  
  return (
    <div className='formLoginAdmin center'>
      <h3>Admin</h3>
      <Formik initialValues={
        {
          email: '',
          password: ''
        }
      }
        validationSchema={Yup.object({
          email: Yup.string().required('* required')
            .matches(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
              { message: 'Invalid email address', excludeEmptyString: true })
            .max(60, "must not be longer than 60 characters")
          ,
          password: Yup.string().required('* required')
            .min(6, "must not be less than 6 characters")

        })}
        onSubmit={loginSubmit}
      >
        {

          formik => (<form onSubmit={formik.handleSubmit}  >
            {loginError && <p className='errTxt'>Wrong email or password</p>}
            <label htmlFor='email'>Email</label>
            <input className='form-control' id='email' name="email" maxLength={60} 
              disabled={submitStatus=="submitting"}
              type='email' placeholder='Enter your email' {...formik.getFieldProps('email')} />
            {formik.touched && formik.errors.email ? (<p className='errTxt'>{formik.errors.email}</p>) : null}

            <PasswordInput disabled={submitStatus=="submitting"} controller={formik}/>
                    
            <button type='submit' className='btn btn-primary submitBtn clearfix'
              disabled={submitStatus=="submitting"}
              data-tooltip-id="tooltipsubmit">
              Submit
              {submitStatus=="submitting" && (
                <div className="spinner-border text-light float-end " role="status">
                </div>
              )}

            </button>
            <Tooltip  id="tooltipsubmit" style={tooltipStyle} place="bottom" content="login to admin" />
          </form>)
        }
      </Formik>
      <p className='pswrd-reset'><a data-tooltip-id="tooltipresetpassword">Forgot Password?</a></p>
      <Tooltip id="tooltipresetpassword" style={tooltipStyle} place="bottom" content="reset password" />
      <PromptModal  onHide={()=>setShowModal(false)} headerText={promptHeader}
            show={showModal} bodyText={promptBody} mode={promptMode}/>
    </div>
  )

}
export default AdminLogin