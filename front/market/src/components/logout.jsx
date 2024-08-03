import React, { Component } from 'react'

class LogOut extends Component {
    componentDidMount(){
        localStorage.removeItem("token")
        window.location = "loginsignin/"
    }
    render() { 
        return null;
    }
}
 
export default LogOut;