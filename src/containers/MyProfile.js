import React, { Component } from "react";
import {
  FormGroup,
  FormControl,
  ControlLabel,
  PageHeader,
  Grid, Panel
} from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import "./MyProfile.css";

import { Card, Row, Col, Form, Input, Icon, Button } from 'antd'

import { resetPassword } from "../libs/awsLib";

const FormItem = Form.Item;

export default (props) =>  
  <div className="MyProfile">
    <Row gutter={{ xs: 0, sm: 16 }} type="flex">
      <Col xs={{span: 24, order: 2}} md={{span: 16, order: 1}}>
        <ProfileContainer />
        <SubscriptionContainer />
        <BillingContainer />
      </Col>
      <Col xs={{span: 24, order: 1}} md={{span: 8, order: 2}}>
        <PasswordContainer />
      </Col>
    </Row>
  </div>

const cardStyle = {marginBottom: 16}

class ProfileContainer extends Component {
  render() {
    return (
      <Card style={cardStyle} className="col-card" loading title="Profile Information"></Card>
    )
  }
}

class SubscriptionContainer extends Component {
  render() {
    return (
      <Card style={cardStyle} className="col-card" loading title="Subscription Information"></Card>
    )
  }
}

class BillingContainer extends Component {
  render() {
    return (
      <Card style={cardStyle} className="col-card" loading title="Billing Information"></Card>
    )
  }
}

class PasswordContainer extends Component {

  handleSubmit = async (data) => {
    this.setState({ isLoading: true });
    await resetPassword(data.oldPassword, data.password);
    this.setState({ isLoading: false });
    //alert("Successfully changed password!");    
  }

  render() {
    return (
      <Card title="Change Password">
        <WrappedRegistrationForm handleSubmit={this.handleSubmit}/>
      </Card>
    )
  }
}

class RegistrationForm extends React.Component {

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
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
        <FormItem>
          {getFieldDecorator('oldpassword', {
            rules: [{
              required: true, message: 'Please input your existing password!',
            }],
          })(
            <Input size="large" prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Old Password" />
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
            <Input size="large" prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="New Password" />
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
            <Input size="large" onBlur={this.handleConfirmBlur} prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Confirm new password" />
          )}
        </FormItem>
        
        <FormItem>
          <div style={{display: "flex"}}>
            <Button htmlType="submit">Change Password</Button>
          </div>
        </FormItem>
      </Form>
    );
  }
}

const WrappedRegistrationForm = Form.create()(RegistrationForm);



