import { useState } from "react";


const PasswordInput=({controller,disabled})=>{

const [showText,setShowText]=useState(false);
const controlHeightStyle={height:'40px'};
const buttonStyle={backgroundColor:'#392864', height:'40px',color:'#f8fbfd ' }

const toggleShowPassword=()=>{
  setShowText(preValue=>!preValue);
}

return(
    <div className="mt-2">
        <label htmlFor='password'>Password</label>
        <div className="input-group">
            <input id="password" name="password" style={controlHeightStyle} className="form-control"
             disabled={disabled} placeholder="Password" maxLength={15}
               type={showText?"text":"password"} {...controller.getFieldProps('password')}  /> 
            <button onClick={toggleShowPassword} className="btn" title={showText?"hide Password":"show password"}
            style={buttonStyle}  type="button" disabled={disabled}>
               {showText ? <i className="bi bi-eye-slash-fill"></i>:<i className="bi bi-eye-fill"></i>}
            </button>
        </div>
        {controller.touched && controller.errors.password ? (<p className='errTxt'>{controller.errors.password}</p>) : null}
    </div>
)

}
export default PasswordInput;