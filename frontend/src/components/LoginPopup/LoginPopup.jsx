import React, { useContext, useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const LoginPopup = ({ setShowLogin }) => {

  const {url, setToken} = useContext(StoreContext)

    const[currState, setCurrState] = useState("Login");
    const [errorMessage, setErrorMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [data, setData] = useState({
      name: "",
      email: "",
      password: ""
    })

    const onChangeHandler = (event)=> {
      const name = event.target.name;
      const value = event.target.value;
      setData(data=> ({...data, [name]: value}))
    }

    const onLogin = async (event) =>{
      event.preventDefault()
      setErrorMessage("")
      if (data.password.length < 8) {
        setErrorMessage("Password must be at least 8 characters");
        return;
      }
      let newUrl = url;
      if (currState=== "Login") {
        newUrl += "/api/user/login"
      }
      else{
        newUrl += "/api/user/register"
      }

      try {
        const payload = {
          ...data,
          email: data.email.trim().toLowerCase()
        };
        const response = await axios.post(newUrl, payload);

        if (response.data.success) {
          setToken(response.data.token);
          setShowLogin(false)
        }
        else{
          const message = response.data.message || "Something went wrong";
          setErrorMessage(message)
          if (currState === "Login" && message === "User not found") {
            setData((prev) => ({ ...prev, email: "", password: "" }));
          }
        }
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || "Unable to connect to server")
      }
    }


  return (
    <div className='login-popup'>
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
            <h2>{currState}</h2>
            <img onClick={()=>setShowLogin(false)} src={assets.cross_icon} alt="" />
        </div>
        <div className="login-popup-inputs">
            {currState === "Login" ? <></> : <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Your name' required />}
            <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Your email' required />
            <div className="password-input-wrapper">
              <input
                name='password'
                onChange={onChangeHandler}
                value={data.password}
                type={showPassword ? "text" : "password"}
                placeholder='Password'
                minLength={8}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" className="eye-icon" aria-hidden="true">
                    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c5 0 9.27 3.11 11 7-1 2.27-2.63 4.15-4.65 5.32M6.61 6.61C4.62 7.79 3 9.7 2 12c.69 1.55 1.73 2.94 3.02 4.05" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" className="eye-icon" aria-hidden="true">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </div>
        </div>
        <button type='submit'>{currState === "Sign Up" ? "Create Account" : "Login"}</button>
        <div className="login-popup-condition">
            <input type="checkbox" required/>
            <p>By continuing, i agree to the terms of use & privacy policy.</p>
        </div>
        {errorMessage && <p style={{color: "red", marginTop: "8px"}}>{errorMessage}</p>}
        {currState === "Login"
        ?<p>Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span></p>
        :<p>Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span></p>
        }  
      </form>
    </div>
  )
}

export default LoginPopup
