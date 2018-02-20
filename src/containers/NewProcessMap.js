import React, { Component } from "react";
import "./NewProcessMap.css";
import { invokeApig } from "../libs/awsLib";
import sampleData from './sampleMap.json';

import { Form, Icon, Input, Button } from 'antd';
import { Link } from 'react-router-dom'
import LoadingSymbol from './../components/LoadingSymbol'

const FormItem = Form.Item;

export default class NewProcessMap extends Component {
  constructor(props) {
    super(props);
    this.file = null;
    this.state = {
      isSaving: false,
      content: sampleData,
    };
  }

  handleSave = async (formData) => {
    this.setState({ isSaving: true });
  
    try {
      const response = await this.createDataset({
        title: formData.title,
        description: formData.description,
        content: JSON.stringify(this.state.content)
      });
      this.setState({
        isUnsaved: false
      })
      this.props.history.push(`/processmaps/${response.processMapId}`);
    } catch (e) {
      console.log(e)
      alert(e);
      this.setState({ isSaving: false });
    }
  }

  createDataset(processMap) {
    return invokeApig({
      path: "/processmaps/",
      method: "POST",
      body: processMap
    });
  }

  render() {
      return (
        <div className="new-process-map-container">
          {this.state.isSaving&&<LoadingSymbol />}
          <WrappedNormalLoginForm handleSubmit={this.handleSave}/>
        </div>
      )
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
      <Form onSubmit={this.handleSubmit} className="login-form" style={{maxWidth: 520, margin: "0 auto"}}>
        <h1 style={{color: "white", paddingBottom: 10, fontWeight: 200}}>Add New Process Map</h1>
        <FormItem>
          {getFieldDecorator('title', {
            rules: [{ required: true, message: 'Please enter a title for your process map!' }],
          })(
            <Input size="large" type="text" prefix={<Icon type="book" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Process map title" />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('description', {
            rules: [{ required: true, message: 'Please enter a description for your process map!' }],
          })(
            <Input.TextArea autosize={{ minRows: 6, maxRows: 12 }} size="large" placeholder="Description" />
          )}
        </FormItem>
        <FormItem>
          <div style={{display: "flex"}}>
            <CustomButton htmlType="submit" text="Create" />
            <CustomButton secondary text={<Link to='/'>Go Back</Link>} />
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