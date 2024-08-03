import React, { Component } from 'react'
import { Outlet,Link } from 'react-router-dom';

class LogInSignIn extends Component {
    render() { 
        return (
            <div className='container'>
                <div className='row'>
                    <Link to="login">LogIn</Link>
                    <Link to="signin">SignIn</Link>
                    <Outlet/>
                </div>
            </div>
        );
    }
}
 
export default LogInSignIn;