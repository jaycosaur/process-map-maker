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
  CognitoUserPool,
  CognitoUser
} from "amazon-cognito-identity-js";
import config from "../config";

export default class Signup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      email: "",
      password: "",
      confirmPassword: "",
      confirmationCode: "",
      emailSent: false,
    };
  }

  validateForm() {
    return (   
      this.state.email.length > 0
    );
  }

  validateConfirmationForm() {
    return (
        this.state.confirmationCode.length > 0 &&
        this.state.password.length > 0 &&
        this.state.confirmPassword.length > 0 &&
        this.state.password === this.state.confirmPassword
    );
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = async event => {
    event.preventDefault();
    this.setState({ isLoading: true });
    this.sendReset(this.state.email);
    this.setState({ isLoading: false });
  }

  handleConfirmationSubmit = async event => {
    event.preventDefault();
    this.setState({ isLoading: true });
    const userPool = new CognitoUserPool({
        UserPoolId: config.cognito.USER_POOL_ID,
        ClientId: config.cognito.APP_CLIENT_ID
      })
    const cognitoUser = new CognitoUser({
          Username: this.state.email,
          Pool: userPool
      })
    cognitoUser.confirmPassword(this.state.confirmationCode, this.state.password,{
        onSuccess: this.props.history.push("/login"),          
        onFailure: function(err) {
            alert(err);
        },
    });
    this.setState({ isLoading: false });            
    
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
        <FormGroup controlId="password" bsSize="lg">
          <ControlLabel>Password</ControlLabel>
          <FormControl
            value={this.state.password}
            onChange={this.handleChange}
            type="password"
          />
        </FormGroup>
        <FormGroup controlId="confirmPassword" bsSize="lg">
          <ControlLabel>Confirm Password</ControlLabel>
          <FormControl
            value={this.state.confirmPassword}
            onChange={this.handleChange}
            type="password"
          />
        </FormGroup>
        <LoaderButton
          block
          bsSize="large"
          disabled={!this.validateConfirmationForm()}
          type="submit"
          isLoading={this.state.isLoading}
          text="Confirm"
          loadingText="Confirming…"
        />
      </form>
    );
  }

  sendReset(email) {
    const userPool = new CognitoUserPool({
      UserPoolId: config.cognito.USER_POOL_ID,
      ClientId: config.cognito.APP_CLIENT_ID
    })
    const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
    })
    cognitoUser.forgotPassword({
        onSuccess: 
            this.setState({ emailSent: true }),          
        onFailure: function(err) {
            alert(err);
        },
    });
  }

  renderForm() {
    return (
      <form onSubmit={this.handleSubmit}>
        <FormGroup controlId="email" bsSize="lg">
          <ControlLabel>Email</ControlLabel>
          <FormControl
            autoFocus
            type="email"
            value={this.state.email}
            onChange={this.handleChange}
          />
          <HelpBlock>A reset code will be sent to this email</HelpBlock>
        </FormGroup>
        <LoaderButton
          block
          bsSize="large"
          disabled={!this.validateForm()}
          type="submit"
          isLoading={this.state.isLoading}
          text="Send reset password"
          loadingText="Sending…"
        />
      </form>
    );
  }

  render() {
    return (
      <div className="Signup">
        {this.state.emailSent === false
          ? this.renderForm()
          : this.renderConfirmationForm()}
      </div>
    );
  }
}