import React, { Component } from "react";
import {
  CognitoUserPool,
  AuthenticationDetails,
  CognitoUser
} from "amazon-cognito-identity-js";

import { Form, Icon, Input, Button } from 'antd';
import { Link } from 'react-router-dom'

import "./Login.css";

import config from "../config";

const FormItem = Form.Item;


export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      email: "",
      password: ""
    };
  }

  login(email, password) {
    const userPool = new CognitoUserPool({
      UserPoolId: config.cognito.USER_POOL_ID,
      ClientId: config.cognito.APP_CLIENT_ID
    });
    const user = new CognitoUser({ Username: email, Pool: userPool });
    const authenticationData = { Username: email, Password: password };
    const authenticationDetails = new AuthenticationDetails(authenticationData);
  
    return new Promise((resolve, reject) =>
      user.authenticateUser(authenticationDetails, {
        onSuccess: result => resolve(),
        onFailure: err => reject(err)
      })
    );
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = async (formInputs) => {
    this.setState({ isLoading: true });    
  
    try {
      await this.login(formInputs.email, formInputs.password);
      this.props.userHasAuthenticated(true);
    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });      
    }
  }

  render() {
    return (
      <div className="Login">
        <h1 style={{marginTop: "20px", 'text-align': 'center', 'font-size': '800%', 'color':'#fff'}}>
          <Icon type="api" spin={this.state.isLoading}/>
        </h1>
        < WrappedNormalLoginForm 
          handleSubmit = {this.handleSubmit} />
      </div>
    );
  }
}

class NormalLoginForm extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        this.props.handleSubmit(values)
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className="login-form">
        <h1 style={{color: "white", paddingBottom: 10, fontWeight: 200}}>Login</h1>
        <FormItem>
          {getFieldDecorator('email', {
            rules: [{ required: true, message: 'Please input your email!' }],
          })(
            <Input size="large" type="email" prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Email" />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your Password!' }],
          })(
            <Input size="large" prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
          )}
          <Link to='/login/resetpassword' style= {{color: "white"}}>Forgot password</Link>
        </FormItem>
        <FormItem>
          <div style={{display: "flex"}}>
            <CustomButton htmlType="submit" text="Login" />
            <CustomButton secondary text={<Link to='/signup'>Register Now</Link>} />
          </div>
        </FormItem>
      </Form>
    );
  }
}

const WrappedNormalLoginForm = Form.create()(NormalLoginForm);

class CustomButton extends Component {
  constructor(props){
    super(props)
    this.state= {
      isHovered : false
    }
  }

  render(){
    const baseStyle = 
      {
        width: 150, 
        height: 40, 
        borderRadius: "40px", 
        background: "none", 
        borderColor: "#ff8099", 
        color: "#ff8099", 
        fontSize: "120%", 
        fontWeight: "300", 
        lineHeight: "40px",
        margin: "auto"
      }

    const secondaryStyle = 
      { 
        ...baseStyle,
        background: "#ff8099", 
        borderColor: "#ff8099", 
        color: "#fff", 
      }

    const baseHover = {
      ...baseStyle,
      borderColor: "#fff", 
      color: "#fff", 
    }

    const secondaryHover = {
      ...secondaryStyle,
      background: "#fff", 
      borderColor: "#fff", 
      color: "#ff8099", 
    }

    const buttonStyle = !this.props.secondary?baseStyle:secondaryStyle
    const hoverStyle = !this.props.secondary?baseHover:secondaryHover

    return (
        <Button 
          onMouseOver = {e => this.setState({ isHovered: true})} 
          onMouseLeave = {e => this.setState({ isHovered: false})} 
          onClick = {this.props.onClick}
          style={!this.state.isHovered?buttonStyle:hoverStyle} 
          htmlType = {this.props.htmlType}
          >
          {this.props.text}
        </Button>
    )
  }
}

