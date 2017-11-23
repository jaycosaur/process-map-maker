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

export default class Signup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      givenName: "",
      familyName: "",
      phoneNumber: "",
      organisation: "",
      email: "",
      password: "",
      confirmPassword: "",
      confirmationCode: "",
      newUser: null
    };
  }

  validateForm() {
    return (
      this.state.givenName.length > 0 &&
      this.state.familyName.length > 0 &&
      this.state.phoneNumber.length > 0 &&
      this.state.organisation.length > 0 &&      
      this.state.email.length > 0 &&
      this.state.password.length > 0 &&
      this.state.password === this.state.confirmPassword
    );
  }

  validateConfirmationForm() {
    return this.state.confirmationCode.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = async event => {
    event.preventDefault();
  
    this.setState({ isLoading: true });
  
    try {
      const newUser = await this.signup(this.state.givenName,this.state.familyName,this.state.phoneNumber,this.state.organisation,this.state.email, this.state.password);
      this.setState({
        newUser: newUser
      });
    } catch (e) {
      alert(e);
    }
  
    this.setState({ isLoading: false });
  }

  handleConfirmationSubmit = async event => {
    event.preventDefault();
  
    this.setState({ isLoading: true });
  
    try {
      await this.confirm(this.state.newUser, this.state.confirmationCode);
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
          disabled={!this.validateConfirmationForm()}
          type="submit"
          isLoading={this.state.isLoading}
          text="Verify"
          loadingText="Verifying…"
        />
      </form>
    );
  }

  signup(givenName, familyName, phoneNumber, organisation, email, password) {
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
    var dataPhoneNumber = {
      Name : 'phone_number',
      Value : phoneNumber
    };
    var dataOrganisation = {
      Name : 'organisation',
      Value : organisation
    };
    var attributeGivenName = new CognitoUserAttribute(dataGivenName);
    var attributeFamilyName = new CognitoUserAttribute(dataFamilyName);
    var attributePhoneNumber = new CognitoUserAttribute(dataPhoneNumber);
    var attributeOrganisation = new CognitoUserAttribute(dataOrganisation);

    attributeList.push(attributeGivenName);
    attributeList.push(attributeFamilyName);
    attributeList.push(attributePhoneNumber);
    attributeList.push(attributeOrganisation);
    
  
    return new Promise((resolve, reject) =>
      userPool.signUp(email, password, [], null, (err, result) => {
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

  renderForm() {
    return (
      <form onSubmit={this.handleSubmit}>
        <FormGroup controlId="givenName" bsSize="lg">
          <ControlLabel>First Name</ControlLabel>
          <FormControl
            autoFocus
            type="text"
            value={this.state.givenName}
            onChange={this.handleChange}
          />
        </FormGroup>
        <FormGroup controlId="familyName" bsSize="lg">
          <ControlLabel>Surname</ControlLabel>
          <FormControl
            autoFocus
            type="text"
            value={this.state.familyName}
            onChange={this.handleChange}
          />
        </FormGroup>
        <FormGroup controlId="email" bsSize="lg">
          <ControlLabel>Email</ControlLabel>
          <FormControl
            autoFocus
            type="email"
            value={this.state.email}
            onChange={this.handleChange}
          />
          <HelpBlock>This will be used to signin</HelpBlock>
        </FormGroup>
        <FormGroup controlId="phoneNumber" bsSize="lg">
          <ControlLabel>Phone Number</ControlLabel>
          <FormControl
            autoFocus
            type="tel"
            value={this.state.phoneNumber}
            onChange={this.handleChange}
          />
        </FormGroup>
        <FormGroup controlId="organisation" bsSize="lg">
          <ControlLabel>Organisation</ControlLabel>
          <FormControl
            autoFocus
            type="text"
            value={this.state.organisation}
            onChange={this.handleChange}
          />
        </FormGroup>
        <FormGroup controlId="password" bsSize="lg">
          <ControlLabel>Password</ControlLabel>
          <FormControl
            value={this.state.password}
            onChange={this.handleChange}
            type="password"
          />
          <HelpBlock>Password needs to be xxxxx kbsdfkhabsf.</HelpBlock>
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
          disabled={!this.validateForm()}
          type="submit"
          isLoading={this.state.isLoading}
          text="Signup"
          loadingText="Signing up…"
        />
      </form>
    );
  }

  render() {
    return (
      <div className="Signup">
        {this.state.newUser === null
          ? this.renderForm()
          : this.renderConfirmationForm()}
      </div>
    );
  }
}