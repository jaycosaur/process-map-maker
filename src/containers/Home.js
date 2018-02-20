import React, { Component } from "react";
import { Image, Panel, Glyphicon, Alert, Row, Col, Well } from "react-bootstrap";

import { Avatar, Button, Icon, Layout, Collapse, List } from 'antd'

import LoadingSymbol from './../components/LoadingSymbol'

import "./Home.css";

import { invokeApig } from '../libs/awsLib';

const { Sider, Content } = Layout;

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFetching: false,
      isLoading: true,
      errorMessage: null,
      isError: false,
      datasets: [],
      news: [],
      outages: []
    };

    this.handleAlertDismiss = this.handleAlertDismiss.bind(this);
  }

  handleAlertDismiss() {
    this.setState({isError: false})
  }

  async componentDidMount() {
    if (!this.props.isAuthenticated) {
      return;
    }

    this.setState({isFetching: true});
  
    try {
      const results = await this.datasets();
      this.setState({ datasets: results });
    } catch (e) {
      this.setState({isError: true});
      console.log(e);
      this.setState({errorMessage: "Error: Couldn't fetch process maps"});
    }

    try {
      const results = await this.news();
      this.setState({ news: results });
    } catch (e) {
      alert(e);
    }

    try {
      const results = await this.outages();
      this.setState({ outages: results });
    } catch (e) {
      alert(e);
    }
  
    this.setState( { isLoading: false } );
    this.setState( { isFetching: false } );
    
  }

  loadingSymbol() {
    return (
      <Col xs={4} xsOffset={4} id="loading-button">
        <Glyphicon glyph="refresh" className="spinning" />
      </Col>
    )
  }
  
  datasets() {
    return invokeApig({ path: "/processmaps/" });
  }

  news() {
    return {};
  }

  outages() {
    return {};
  }

  renderOutages(outages) {
    return (
      <Panel header={<h3>Service Outages</h3>}>
        "No outages have been planned."
      </Panel>
    );
  }

  renderUpperAlert() {
    return (
        <Alert style={{'border-radius': '0', 'background-color': '#d9534f', 'color':'white','border-width':'0'}} bsStyle="danger" onDismiss={this.handleAlertDismiss}>
          <p>{this.state.errorMessage}</p>
        </Alert>
      );
  }
  
  handleDatasetClick = event => {
    event.preventDefault();
    this.props.history.push(event.currentTarget.getAttribute("href"));
  }

  controlSection(){
      const ColPanel = Collapse.Panel;

      return (
        <Collapse bordered={false}>
          <ColPanel header={<span style={{paddingLeft: "10px"}}><small><span className="glyphicon glyphicon-question-sign" style={{color: "FF8099", marginRight: "10px"}}></span> Help</small></span>} eventKey='0'>{this.renderHelp()}</ColPanel>
          <ColPanel header={<span style={{paddingLeft: "10px"}}><small><span className="glyphicon glyphicon-bullhorn" style={{color: "FF8099", marginRight: "10px"}}></span> News</small></span>} eventKey='1'>{this.renderNews(this.state.news)}</ColPanel>
          <ColPanel header={<span style={{paddingLeft: "10px"}}><small><span className="glyphicon glyphicon-flash" style={{color: "FF8099", marginRight: "10px"}}></span> Planned Outages </small></span>} eventKey="2">{this.renderOutages()}</ColPanel>
          <ColPanel header={<span style={{paddingLeft: "10px"}}><small><span className="glyphicon glyphicon-heart-empty" style={{color: "FF8099", marginRight: "10px"}}></span> Process Map of the Week</small></span>} eventKey='3'>{this.renderOutages()}</ColPanel>
        </Collapse>
      )
  }

  renderNews(news) {
    return (
      <Well>{"No news to show."}</Well>
    );
  }


  renderHelp(){
    return (
      <Image key = {Math.random()} responsive src="https://source.unsplash.com/random/600x400" />
    );
  }
  

  renderProcessMapList() {

    const ListItem = (props) => 
      <List.Item 
        actions={[
          <Avatar icon="link" style={{ color: '#fff', backgroundColor: props.data.isShared?'#66bf80':"#7a8f99" }}/>,
          <CustomButtonSmall 
            text={<strong><Icon type="api"/> Go to map</strong>} 
            secondary
            onClick={this.handleDatasetClick} 
            href={`/processmaps/${props.data.processMapId}`} />,
            <Avatar disabled icon="delete" style={{ color: '#fff', backgroundColor: '#bf0000' }}/>]}
        >
          <List.Item.Meta
            avatar={<Avatar icon="api" style={{ color: '#fff', backgroundColor: '#ff8099' }}/>}
            title={props.data.title}
            description={props.data.description}
          />
          <div>{new Date(props.data.createdAt).toLocaleString()}</div>
      </List.Item>

    return (
      <div className="main-wrapper">
        {this.state.isError ? this.renderUpperAlert() : null}
          { !this.state.isFetching&&!this.state.isLoading
            ? <Layout style={{ minHeight: '100vh'}}>
                <Sider width={300} style={{background: "#fff", paddingLeft: "10px"}}>
                  {this.controlSection()}
                </Sider>
                <Content style={{marginTop: 10, marginRight: 30}}>
                  <div style={{float: "right", marginBottom: "10px"}}>
                      <CustomButtonSmall
                        secondary 
                        onClick={e => this.props.history.push("/processmaps/new")}
                        text={<span><Icon type="plus-circle" /> Create New</span>}/>
                  </div>
                  <div style={{margin: 24, marginTop: 50, padding: 24, background: "#fff"}}>
                    <List 
                      style={{width: "100%"}}
                      fill
                      dataSource={this.state.datasets.sort(function(b,a) {return a.createdAt - b.createdAt})}
                      renderItem={item => 
                        <ListItem data={item}/>
                    }/>
                  </div>
                </Content>
              </Layout>
            : <LoadingSymbol />
            }
      </div>
    );
  }

  render() {
    return (
      <div className="Home">
          {this.props.isAuthenticated ? 
            this.renderProcessMapList()
          : <LanderHome history={this.props.history}/>}
      </div>
    );
  }
}

class LanderHome extends Component {
  render() {
    return (
      <div className="main-wrapper">
        <div className="landing-content-container" style={{display: "flex", flexDirection: "row-reverse", alignContent: "center", alignItems: "center", justifyContent: "center", paddingLeft: "100px"}}>
          <div className="icon-wrapper" style={{width: "600px", textAlign: "center"}}>
            <SpinnerLogo />
          </div>
          <div className="text-wrapper" style={{maxWidth: "600px"}}>         
            <h1 style={{fontSize: "400%", fontWeight: "400", color: "white"}}>
              Let's make some process maps!
            </h1>
            <h3 style={{ fontWeight: "100", fontSize:"200%", color: "white"}}>
              Accurate, fast, flexible, shareable.
            </h3>
            <Row style={{display: "flex", flexWrap: "wrap", alignItems: "center", marginTop: "50px"}}>
              <CustomButton 
                onClick={e => this.props.history.push("/login")} 
                text="Login"/>
              <CustomButton 
                secondary
                onClick={e => this.props.history.push("/signup")} 
                text="Signup Now"/>
            </Row>
          </div>
        </div>
      </div>
    )
  }
}


class SpinnerLogo extends Component {
  constructor(props){
    super(props)
    this.state = {
      isHovered: false
    }
  }
  render() {
    return (
      <Icon 
        onMouseOver={e => this.setState({isHovered: true})}
        onMouseLeave={e => this.setState({isHovered: false})}
        style={{color: "white", fontSize: "2000%"}} 
        type="api" />
    )
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
        width: 250, 
        height: 50, 
        borderRadius: "40px", 
        background: "none", 
        borderColor: "#ff8099", 
        color: "#ff8099", 
        fontSize: "150%", 
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
      width: 255,
      height: 55,
      borderColor: "#fff", 
      color: "#fff", 
    }

    const secondaryHover = {
      ...secondaryStyle,
      width: 255,
      height: 55,
      background: "#fff", 
      borderColor: "#fff", 
      color: "#ff8099", 
    }

    const buttonStyle = !this.props.secondary?baseStyle:secondaryStyle
    const hoverStyle = !this.props.secondary?baseHover:secondaryHover

    return (
      <div style={{width: 260, height: 60}}>
        <Button 
          onMouseOver = {e => this.setState({ isHovered: true})} 
          onMouseLeave = {e => this.setState({ isHovered: false})} 
          onClick = {this.props.onClick}
          style={!this.state.isHovered?buttonStyle:hoverStyle} 
          >
          {this.props.text}
        </Button>
      </div>
    )
  }
}

class CustomButtonSmall extends Component {
  constructor(props){
    super(props)
    this.state= {
      isHovered : false
    }
  }

  render(){
    const baseStyle = 
      {
        height: 32, 
        borderRadius: "32px", 
        background: "none", 
        borderColor: "#ff8099", 
        color: "#ff8099", 
        fontWeight: "300", 
        lineHeight: "32px",
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
      <div style={{height: 32}}>
        <Button 
          onMouseOver = {e => this.setState({ isHovered: true})} 
          onMouseLeave = {e => this.setState({ isHovered: false})} 
          onClick = {this.props.onClick}
          style={!this.state.isHovered?buttonStyle:hoverStyle} 
          href={this.props.href?this.props.href:null}
          >
          {this.props.text}
        </Button>
      </div>
    )
  }
}
