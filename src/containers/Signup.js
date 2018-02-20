import React, { Component } from "react";
import {
  HelpBlock,
  FormGroup,
  FormControl,
  ControlLabel
} from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import "./Signup.css";
import {
  AuthenticationDetails,
  CognitoUserPool,
  CognitoUserAttribute
} from "amazon-cognito-identity-js";
import config from "../config";

import { Link } from 'react-router-dom'
import { Form, Input, Icon, Button } from 'antd';
const FormItem = Form.Item;


export default class Signup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      confirmationCode: "",
      newUser: null,
      email: null,
      password: null,
    };
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = async (formData) => {  
    this.setState({ isLoading: true });
  
    try {
      const newUser = await this.signup(formData.givenName,formData.familyName,formData.email, formData.password);
      this.setState({
        newUser: newUser,
        email: formData.email,
        password: formData.password
      });
    } catch (e) {
      alert(e);
    }
  
    this.setState({ isLoading: false });
  }

  handleConfirmationSubmit = async (formData) => {  
    this.setState({ isLoading: true });
  
    try {
      await this.confirm(this.state.newUser, formData.confirmationCode);
      await this.authenticate(
        this.state.newUser,
        this.state.email,
        this.state.password
      );
  
      this.props.userHasAuthenticated(true);
      this.props.history.push("/");
    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }

  renderConfirmationForm() {
    return (
      <form onSubmit={this.handleConfirmationSubmit}>
        <FormGroup controlId="confirmationCode" bsSize="large">
          <ControlLabel>Confirmation Code</ControlLabel>
          <FormControl
            autoFocus
            type="tel"
            value={this.state.confirmationCode}
            onChange={this.handleChange}
          />
          <HelpBlock>Please check your email for the code.</HelpBlock>
        </FormGroup>
        <LoaderButton
          block
          bsSize="large"
          disabled={this.state.isLoading}
          type="submit"
          isLoading={this.state.isLoading}
          text="Verify"
          loadingText="Verifying…"
        />
      </form>
    );
  }

  signup(givenName, familyName, email, password) {
    const userPool = new CognitoUserPool({
      UserPoolId: config.cognito.USER_POOL_ID,
      ClientId: config.cognito.APP_CLIENT_ID
    });

    var attributeList = [];

    var dataGivenName = {
      Name : 'given_name',
      Value : givenName
    };
    var dataFamilyName = {
      Name : 'family_name',
      Value : familyName
    };

    var attributeGivenName = new CognitoUserAttribute(dataGivenName);
    var attributeFamilyName = new CognitoUserAttribute(dataFamilyName);

    attributeList.push(attributeGivenName);
    attributeList.push(attributeFamilyName);
    
  
    return new Promise((resolve, reject) =>
      userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
  
        resolve(result.user);
      })
    );
  }
  
  confirm(user, confirmationCode) {
    return new Promise((resolve, reject) =>
      user.confirmRegistration(confirmationCode, true, function(err, result) {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      })
    );
  }
  
  authenticate(user, email, password) {
    const authenticationData = {
      Username: email,
      Password: password
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);
  
    return new Promise((resolve, reject) =>
      user.authenticateUser(authenticationDetails, {
        onSuccess: result => resolve(),
        onFailure: err => reject(err)
      })
    );
  }

  render() {
    return (
      <div className="Signup">
        <h1 style={{marginTop: "0px", 'text-align': 'center', 'font-size': '800%', 'color':'#fff'}}>
          <Icon type="api" spin={this.state.isLoading}/>
        </h1>
        {this.state.newUser === null
          ? < WrappedRegistrationForm handleSubmit={this.handleSubmit}/>
          : < WrappedConfirmationForm handleSubmit={this.handleConfirmationSubmit}/>}
      </div>
    );
  }
}

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
        width: 180, 
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

class RegistrationForm extends React.Component {

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        this.props.handleSubmit(values)
      }
    });
  }

  checkPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('Passwords that you enter must be the same!');
    } else {
      callback();
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const regexp = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})")

    return (
      <Form onSubmit={this.handleSubmit}>
        <h1 style={{color: "white", paddingBottom: 10, fontWeight: 200}}>Signup</h1>
        <FormItem>
          {getFieldDecorator('givenName', {
            rules: [{ required: true, message: 'Please input your firstname!', whitespace: true }],
          })(
            <Input size="large" prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="First Name" />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('familyName', {
            rules: [{ required: true, message: 'Please input your lastname!', whitespace: true }],
          })(
            <Input size="large" prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Last Name" />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('email', {
            rules: [{
              type: 'email', message: 'The input is not valid E-mail!',
            }, {
              required: true, message: 'Please input your E-mail!',
            }],
          })(
            <Input size="large" prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} type="email" placeholder="Email" />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{
              required: true, message: 'Please input your password!',
            },{
              pattern: regexp, message: 'Your password does not satisfy the requirements. Must contain 1 lowercase letter, 1 uppercase letter, 1 numeral, 1 special character, and must be at least 8 characters long.',
            }],
          })(
            <Input size="large" prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
          )}
        </FormItem>
        <FormItem
        >
          {getFieldDecorator('confirmPassword', {
            rules: [{
              required: true, message: 'Please confirm your password!',
            }, {
              validator: this.checkPassword,
            }],
          })(
            <Input size="large" onBlur={this.handleConfirmBlur} prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Confirm password" />
          )}
        </FormItem>
        
        <FormItem>
          <div style={{display: "flex"}}>
            <CustomButton htmlType="submit" text="Register" />
            <CustomButton secondary text={<Link to='/login'>Already a member?</Link>} />
          </div>
        </FormItem>
      </Form>
    );
  }
}

const WrappedRegistrationForm = Form.create()(RegistrationForm);

class ConfirmationForm extends React.Component {
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
        <h1 style={{color: "white", paddingBottom: 10, fontWeight: 200}}>Confirm Email Address</h1>
        <p style={{color: "white", paddingBottom: 10}}>A six digit confirmation code has been sent to your email address.</p>
        <FormItem>
          {getFieldDecorator('confirmationCode', {
            rules: [{ required: true, message: 'Please input the 6-digit confirmation code' }],
          })(
            <Input size="large" prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="number" placeholder="6-Digit Confirmation Code" />
          )}
        </FormItem>
        <FormItem>
          <div style={{display: "flex"}}>
            <CustomButton secondary htmlType="submit" text="Confirm Email" />
          </div>
        </FormItem>
      </Form>
    );
  }
}

const WrappedConfirmationForm = Form.create()(ConfirmationForm);
