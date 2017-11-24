import React, { Component } from "react";
import { Glyphicon, Form, Well, InputGroup, Button, FormGroup, FormControl, ControlLabel, HelpBlock, Grid, Row, Col, PanelGroup,Panel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import "./Shared.css";
import { invokeApig } from "../libs/awsLib";
import WorkflowChart from '../components/WorkflowChart';
import BottomWindow from '../components/BottomWindow';

export default class Shared extends Component {
  constructor(props) {
    super(props);
    this.file = null;
    this.state = {
      processmap: null,
      isLoading: null,
      title: null,
      description: null,
      content: {},
      sharedLinkCode: null,
      chartState: false,
    };
    this.nodeCallBackFn = this.nodeCallBackFn.bind(this)
  }

  async componentDidMount() {
    try {
      const results = await this.getDataset();
      this.setState({
        processMap: results[0],
        content: JSON.parse(results[0].content),
        title: results[0].title,
        description: results[0].description,
        id: results[0].processMapId,
        createdAt: results[0].createdAt,
        sharedLinkCode: results[0].sharedId
      });
      console.log(this.state.content);
    } catch (e) {
      alert(e);
    }
  }

  getDataset() {
    return invokeApig({ path: `/processmaps/share/${this.props.match.params.id}` });
  }

  nodeCallBackFn  = (node) => {
    console.log(node);
  }

  errorCallBackFn  = (e) => {
    console.log(e);
  }

  renderChartPane(width){
    return(
      <Col xs={12} sm={width} className = 'no-pad'>
        <PanelGroup className="viz">
          <Panel className="chartcont modal-container">
            <WorkflowChart id="d3-workflow" data={ this.state.content } key={Math.random()} errorCallBack = {this.errorCallBackFn} nodeCallBack={this.nodeCallBackFn}/>
          </Panel>
        </PanelGroup>
      </Col>
    )
  };

  render() {
      return (
        <div className="NewProcessMaps">
          {this.state.processMap &&
          <Grid fluid={true}>
              {this.renderChartPane(12)}
          </Grid>}
          <BottomWindow />
        </div>
      )
    }
}
