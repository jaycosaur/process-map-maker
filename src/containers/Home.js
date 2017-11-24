import React, { Component } from "react";
import { Image, Form, FormGroup, ControlLabel, FormControl, PanelGroup, Glyphicon, Alert, Jumbotron, Button, PageHeader, ListGroup, ListGroupItem, Grid, Row, Col, Panel, Well } from "react-bootstrap";

import "./Home.css";

import { invokeApig } from '../libs/awsLib';

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
        {outages.length > 0 ? [
          outages[0]
        ] :
        [ "No outages have been planned." ]}
      </Panel>
    );
  }

  renderLander() {
    return (
      <div>
        <Jumbotron>
          <div className="Home">
            <div className="lander">
              <span style={{'font-size':'1000%', 'color':'#1a9ed9'}}className="brand-symbol glyphicon glyphicon-random"></span>
              <h1>Lets make some process maps!</h1>
              <p>Accurate, fast, easy peasey</p>
              <Button bsSize = 'large' bsStyle="primary" href="/login" onClick={this.handleDatasetClick}>Login</Button>
            </div>
          </div>
        </Jumbotron>
        <Grid id='lander-options'>
          <Col xs={12} md={4}>
            Option 1
          </Col>
          <Col xs={12} md={4}>
            Option 2
          </Col>
          <Col xs={12} md={4}>
            Option 3
          </Col>
        </Grid>
      </div>
    );
  }

  renderUpperAlert() {
    return (
        <Alert style={{'border-radius': '0', 'background-color': '#d9534f', 'color':'white','border-width':'0'}} bsStyle="danger" onDismiss={this.handleAlertDismiss}>
          <p>{this.state.errorMessage}</p>
        </Alert>
      );
  }

  addBar(){
    return (
      <Row className = 'no-pad'>
        <Col className = 'no-pad' xs={12}>
          <Button id='add-new-map-button' className='full-button' block href="/processmaps/new"
            onClick={this.handleDatasetClick} bsSize='small'>
              <strong><span className="glyphicon glyphicon-plus-sign"></span> Create a new process map and share it with anyone</strong> 
          </Button>
        </Col>
      </Row>
    );
  }

  renderProcessMapListInner(dataset){
    return (
      <Panel collapsible
        id='process-map-list-item'
        eventKey={dataset.processMapId}
        style={{'margin-bottom':'0px'}}
        key={dataset.processMapId}
        header={
          <span>
            <Button id='go-to-map-button' href={`/processmaps/${dataset.processMapId}`}
              onClick={this.handleDatasetClick} bsSize='small'>
              <strong><span className="glyphicon glyphicon-random"> </span> Go to map</strong> 
            </Button>
            <small>{dataset.title.trim().split("\n")[0]}</small>
            <span id='button-holder'>
              {dataset.isShared && 
                <Button id='share-map-button' bsStyle="link" bsSize="sm"><Glyphicon glyph="link"/></Button>}
              <Button id='delete-map-button' bsStyle="link" bsSize="sm"><Glyphicon glyph="trash"/></Button>
            </span>
          </span>
        }
        className='node-panel process-map-list-item'
      >
      <Well className='no-border take-full-width'>
        <Form horizontal> 
            <FormGroup controlId="title" bsSize="small">
              <Col sm={3} componentClass={ControlLabel}>
                Title
              </Col>
              <Col sm={9}>
                <FormControl
                    autoFocus
                    type="name"
                    value={dataset.title}
                    disabled={true}
                />
              </Col>
            </FormGroup>    
            <FormGroup controlId="description" bsSize="small">
              <Col sm={3} componentClass={ControlLabel}>
                Description
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass="textarea"
                  value={dataset.description}
                  disabled={true}
                />
              </Col>
            </FormGroup>
            <FormGroup controlId="createdAt" bsSize="small">
              <Col sm={3} componentClass={ControlLabel}>
                Created at
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass="textarea"
                  value={new Date(dataset.createdAt).toLocaleString()}
                  disabled={true}
                />
              </Col>
            </FormGroup>
            {dataset.isShared}
            <FormGroup controlId="isShared" bsSize="small">
              <Col sm={3} componentClass={ControlLabel}>
                Is shared?
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass="textarea"
                  value={dataset.isShared ? 'Yes' : 'No'}
                  disabled={true}
                />
              </Col>
            </FormGroup>
            <FormGroup controlId="lastShared" bsSize="small">
              <Col sm={3} componentClass={ControlLabel}>
                Last shared on:
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass="textarea"
                  value={dataset.lastShared}
                  disabled={true}
                />
              </Col>
            </FormGroup>
            <FormGroup controlId="shareLink" bsSize="small">
              <Col sm={3} componentClass={ControlLabel}>
                Share link:
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass="textarea"
                  value={dataset.sharedLinkCode}
                  disabled={true}
                />
              </Col>
            </FormGroup>
          </Form>
        </Well>
      </Panel>
    );
  }

  renderDatasetsList(datasets) {
    return [{}].concat(datasets).sort(function(b,a) {return a.createdAt - b.createdAt}).map(
      (dataset, i) =>
        i !== 0
          ? this.renderProcessMapListInner(datasets[i-1])
          : this.addBar()
    );
  }
  
  handleDatasetClick = event => {
    event.preventDefault();
    this.props.history.push(event.currentTarget.getAttribute("href"));
  }

  controlSection(){
      return (
          <Col xs={12} sm={12} className="sidebar home-sidebar">
              <PanelGroup accordion className = "sidebar-contents" bsStyle={this.state.isUnsaved !== false ? 'danger' : 'default'}>
                <Panel className='control-choice' header={<span><small><span className="glyphicon glyphicon-question-sign"></span> Help</small></span>} eventKey='0'>{this.renderHelp()}</Panel>
                <Panel className='control-choice' header={<span><small><span className="glyphicon glyphicon-bullhorn"></span> News</small></span>} eventKey='1'>{this.renderNews(this.state.news)}</Panel>
                <Panel className='control-choice'  header={<span><small><span className="glyphicon glyphicon-flash"></span> Planned Outages </small></span>} eventKey="2">{this.renderOutages()}</Panel>
                <Panel className='control-choice'  header={<span><small><span className="glyphicon glyphicon-heart-empty"></span> Process Map of the Week</small></span>} eventKey='3'></Panel>
              </PanelGroup>
          </Col>
      )
  }

  renderNews(news) {
    return (
      <Well>{"No news to show."}</Well>
    );
  }

  renderOutages(){
    return (
      <Well>{"No planned outages."}</Well>
    );
  }

  renderHelp(){
    return (
      <Image key = {Math.random()} responsive src="https://source.unsplash.com/random/600x400" />
    );
  }

  renderProcessMapList() {
    return (
      <div className="datasets">
        {this.state.isError ? this.renderUpperAlert() : null}
          { !this.state.isFetching&&!this.state.isLoading
            ? 
            <Row className="show-grid">
              <Col xs={12} md={4} id='control-section'> 
                {this.controlSection()}
              </Col> 
              <Col xs={12} sm={8} className="sidebar">
                <ListGroup>
                  {this.renderDatasetsList(this.state.datasets)}
                </ListGroup>
              </Col>
            </Row>
            :
            this.loadingSymbol()
            }
      </div>
    );
  }

  render() {
    return (
      <div className="Home">
        <Grid fluid={true}>
          {this.props.isAuthenticated ? 
            <Row className="show-grid">
              {this.renderProcessMapList()}
            </Row>
          : this.renderLander()}
        </Grid>
      </div>
    );
  }
}