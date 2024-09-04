import { Tooltip } from 'react-tooltip';
import { Formik } from 'formik';
import *  as Yup from 'yup';
import './login.css'
import { useState,useEffect,createContext,useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../auth/authHandler';
import { useAuth} from '../../auth/AuthContext'


const Login = () => {
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [loginError, setLoginError] = useState(false);
  const [loginResponse,setLoginResponse]=useState(null);
  const {setAuthenticatedUser}= useAuth(); //get global Auth context for setting user credentials
  const navigate= useNavigate();
 
  const tooltipStyle = { backgroundColor: '#20134488' };

 
  useEffect(()=>{
      if(loginResponse?.status===200)
       { 
         setLoginError(false)
         localStorage.setItem("credentials",JSON.stringify(loginResponse.data));
         setAuthenticatedUser(loginResponse); //set credentials on global context        
         navigate('/dashboard',{replace:true}); //move into library.
       }else
       localStorage.removeItem("credentials");
   },[loginResponse])


  const loginSubmit = async (values) => {

  const { username: username, tokenPass: token } = values;

  setSubmitStatus("submitting");   
    try {
         
         const response = await loginUser(username,token);
         setLoginResponse(response);       
         values.username = ''; values.token = ''; //clear form after submit
    } 
    catch (error)
    {
       console.log(error);
      if (error.response && (error.response.status == 401 || error.response.status == 404))
        setLoginError(true);
      else if (error.code === "ERR_NETWORK")
        alert("Please check your internet connection");
      else
        alert("Internal Server Error. Please try again later");
      
    }
    finally {
       setSubmitStatus("idle");
    }

  }
  
  return (
    <div className='formLoginAdmin center'>
      <h3>Student</h3>
      <Formik initialValues={
        {
          username: '',
          token: ''
        }
      }
        validationSchema={Yup.object({
          username: Yup.string().required('* required')
           
          ,
          token: Yup.string().required('* required')
            .min(6, "must not be less than 6 characters")

        })}
        onSubmit={loginSubmit}
      >
        {

          formik => (<form onSubmit={formik.handleSubmit}  >
            {loginError && <p className='errTxt'>Wrong UserName or token</p>}
            <label htmlFor='username'>UserName</label>
            <input className='form-control' id='username' name="username" maxLength={60} 
              disabled={submitStatus=="submitting"}
              type='text' placeholder='Enter your username' {...formik.getFieldProps('username')} />
            {formik.touched && formik.errors.username ? (<p className='errTxt'>{formik.errors.username}</p>) : null}
            
            <label htmlFor='token'>Token</label>
            <input className='form-control token-input' id='token' name='token' maxLength={12} 
            disabled={submitStatus=="submitting" }
              type='password' placeholder='Token' {...formik.getFieldProps('token')} />
            {formik.touched && formik.errors.token ? (<p className='errTxt'>{formik.errors.token}</p>) : null}
            
            <button type='submit' className='btn btn-primary submitBtn clearfix'
              disabled={submitStatus=="submitting"}
              data-tooltip-id="tooltipsubmit">
              Submit
              {submitStatus=="submitting" && (
                <div className="spinner-border text-light float-end " role="status">
                </div>
              )}

            </button>
            <Tooltip  id="tooltipsubmit" style={tooltipStyle} place="bottom" content="login to library" />
          </form>)
        }
      </Formik>
      <p className='pswrd-reset'><a data-tooltip-id="tooltipresetpassword">create student/user account?</a></p>
      <Tooltip id="tooltipresetpassword" style={tooltipStyle} place="bottom" content="create account/sign up" />
    </div>

  )

}
export default Login