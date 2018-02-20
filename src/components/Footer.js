import React, { Component } from 'react';
import "./Footer.css";

import { Layout } from 'antd';
const { Footer } = Layout;


 
export default class FooterOut extends Component {

    render () {
        let today = new Date();
        let year = today.getFullYear();
        
        return (
            <Footer style={{ textAlign: 'center', background: "#ff8099", color: "white" }}>
                <span id='companyname' >grosvenor<strong className='blue-text'>.digital</strong></span> <small><span className="glyphicon glyphicon-copyright-mark"></span> copyright {year}</small>
            </Footer>
        )

    }
};