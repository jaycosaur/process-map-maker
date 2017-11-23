import React, { Component } from 'react';
import "./Footer.css";

 
export default class Footer extends Component {

    render () {
        let today = new Date();
        let year = today.getFullYear();
        
        return (
            <footer className="footer">
                <span id='companyname' >grosvenor<strong className='blue-text'>.digital</strong></span>
                <span id='copyright' ><small><span className="glyphicon glyphicon-copyright-mark"></span> copyright {year}</small></span>
            </footer>
        )

    }
};