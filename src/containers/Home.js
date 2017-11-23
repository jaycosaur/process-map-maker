import React, { Component } from "react";
import { Glyphicon, Alert, Jumbotron, Button, PageHeader, ListGroup, ListGroupItem, Grid, Row, Col, Panel, Well } from "react-bootstrap";

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
      this.setState({isError: true})
      this.setState({errorMessage: "Error: Couldn't fetch process maps"})
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

  bsStyleGen(datasetState) {
    switch(datasetState) {
      case "Pending Processing":
        return "info";

      case "Processing":
        return "warning";

      case "Processing Complete":
        return "success";
      
      case "Failed":
        return "danger";

      default:
        return "Failed";
    }
  };

  renderNews(news) {
    return (
      <Panel header={<p>Latest News</p>}>
        <Well>{"No news to show."}</Well>
      </Panel>
    );
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

  renderDatasetsList(datasets) {
    return [{}].concat(datasets).sort(function(b,a) {return a.createdAt - b.createdAt}).map(
      (dataset, i) =>
        i !== 0
          ? <ListGroupItem
              bsStyle={this.bsStyleGen(dataset.state)}
              key={dataset.datasetId}
              href={`/processmaps/${dataset.datasetId}`}
              onClick={this.handleDatasetClick}
              header={dataset.title.trim().split("\n")[0]}
            >
            <strong>Process Map Description:</strong>
            {dataset.description.toLocaleString()}
            <ul>
              <li>{"Current State: " + dataset.state.toLocaleString()}</li>
              <li>{"Created: " + new Date(dataset.createdAt).toLocaleString()}</li>
            </ul>
            </ListGroupItem>
          : <ListGroupItem
              key="new"
              href="/processmaps/new"
              onClick={this.handleDatasetClick}
            >
              <h4>
                <strong><span className="glyphicon glyphicon-plus-sign"></span> Create a new process map and share it with anyone</strong>
              </h4>
            </ListGroupItem>
    );
  }
  
  handleDatasetClick = event => {
    event.preventDefault();
    this.props.history.push(event.currentTarget.getAttribute("href"));
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

  renderDatasets() {
    return (
      <div className="datasets">
        {this.state.isError ? this.renderUpperAlert() : null}
        <Grid style={{'padding-top':'20px','margin':'0'}}>
          { !this.state.isFetching 
            ? 
            <Row className="show-grid">
              <Col xs={12} md={8}> 
                <PageHeader>Your Dashboard</PageHeader>
                <ListGroup>
                  {!this.state.isLoading && this.renderDatasetsList(this.state.datasets)}
                </ListGroup>
              </Col>
              <Col xs={12} md={4}> 
                {!this.state.isLoading && this.renderNews(this.state.news)}
              </Col> 
            </Row>
            :
            this.loadingSymbol()
            }
        </Grid>
      </div>
    );
  }

  render() {
    return (
      <div className="Home">
        {this.props.isAuthenticated ? this.renderDatasets() : this.renderLander()}
      </div>
    );
  }
}