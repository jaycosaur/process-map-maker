import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel, HelpBlock, PageHeader, Grid, Row, Col, Panel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import "./ProcessMaps.css";
import { invokeApig, s3Upload } from "../libs/awsLib";



export default class ProcessMaps extends Component {
  constructor(props) {
    super(props);

    this.file = null;

    this.state = {
      isLoading: null,
      isDeleting: null,
      dataset: null,
      title: "",
      desciption: "",
      id: "",
      createdAt: "",
      processState: ""
    };
  }

  async componentDidMount() {
    try {
      const results = await this.getDataset();
      this.setState({
        dataset: results,
        title: results.title,
        description: results.description,
        id: results.datasetId,
        processState: results.state,
        createdAt: results.createdAt,
      });
    } catch (e) {
      alert(e);
    }
  }

  getDataset() {
    return invokeApig({ path: `/datasets/${this.props.match.params.id}` });
  }

  validateForm() {
    return this.state.title.length > 0;
  }
  
  formatFilename(str) {
    return str.length < 50
      ? str
      : str.substr(0, 20) + "..." + str.substr(str.length - 20, str.length);
  }
  
  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }
  
  handleFileChange = event => {
    this.file = event.target.files[0];
  }
  
  saveDataset(dataset) {
    return invokeApig({
      path: `/datasets/${this.props.match.params.id}`,
      method: "PUT",
      body: dataset
    });
  }
  
  handleSubmit = async event => {
    let uploadedFilename;
  
    event.preventDefault();
  
    if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
      alert("Please pick a file smaller than 100MB");
      return;
    }
  
    this.setState({ isLoading: true });
  
    try {
      if (this.file) {
        uploadedFilename = (await s3Upload(this.file))
          .Location;
      }
  
      await this.saveDataset({
        ...this.state.dataset,
        title: this.state.title,
        description: this.state.description,
        attachment: uploadedFilename || this.state.dataset.attachment
      });
      this.props.history.push("/");
    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }
  
  deleteDataset() {
    return invokeApig({
      path: `/datasets/${this.props.match.params.id}`,
      method: "DELETE"
    });
  }
  
  handleDelete = async event => {
    event.preventDefault();
  
    const confirmed = window.confirm(
      "Are you sure you want to delete this process map? This action cannot be undone, once it is gone it is gone forever."
    );
  
    if (!confirmed) {
      return;
    }
  
    this.setState({ isDeleting: true });
  
    try {
      await this.deleteDataset();
      this.props.history.push("/");
    } catch (e) {
      alert(e);
      this.setState({ isDeleting: false });
    }
  }

  bsStyleGen() {
    switch(this.state.processState) {
      case "Pending Processing":
        return "info";

      case "Processing":
        return "warning";

      case "Processing Complete":
        return "success";
      
      case "Failed":
        return "danger";

      default:
        return "danger";
    }
  };
  
  render() {
    return (
      <div className="ProcessMaps">
        <PageHeader>Dataset Summary</PageHeader>
        {this.state.dataset &&
                <form onSubmit={this.handleSubmit}>
                  <Grid>
                    <Row className="show-grid">
                      <Col xs={12} md={8}> 
                        <FormGroup controlId="instance-id">
                          <ControlLabel>Instance ID</ControlLabel>
                          <FormControl disabled
                            onChange={this.handleChange}
                            value={this.state.id}
                          />
                        </FormGroup>
                        <FormGroup controlId="instance-id">
                          <ControlLabel>Time of Creation</ControlLabel>
                          <FormControl disabled
                            onChange={this.handleChange}
                            value={new Date(this.state.createdAt).toLocaleString()}
                          />
                        </FormGroup>
                        <FormGroup controlId="title">
                          <ControlLabel>Name of Instance</ControlLabel>
                          <FormControl
                            onChange={this.handleChange}
                            value={this.state.title}
                          />
                          <HelpBlock>Must not contain any spaces or special characters, "-" is permitted.</HelpBlock>
                        </FormGroup>
                        <FormGroup controlId="description">
                          <ControlLabel>Short Description</ControlLabel>
                          <FormControl
                            onChange={this.handleChange}
                            value={this.state.description}
                            componentClass="textarea"
                          />
                        </FormGroup>
                        
                      </Col>
                      <Col xs={12} md={4}> 
                        <Panel bsStyle={this.bsStyleGen()} header={<h3><strong>Instance State:</strong> {this.state.processState}</h3>}> 
                          {this.state.processState === "Processing Complete" ? [
                            "This will be a graph showing a brief overview of the data"
                          ]:["Please wait until processing is completed to view the summary"]}
                        </Panel>
                        {this.state.dataset.attachment &&
                          <FormGroup>
                            <ControlLabel>Original Attachment</ControlLabel>
                            <FormControl.Static>
                              <a
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                href={this.state.dataset.attachment}
                              >
                                {this.formatFilename(this.state.dataset.attachment)}
                              </a>
                            </FormControl.Static>
                          </FormGroup>}
                          {this.state.dataset.attachmentCatergorised &&
                          <FormGroup>
                            <ControlLabel>Categorised Attachment</ControlLabel>
                            <FormControl.Static>
                              <a
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                href={this.state.dataset.attachmentCatergorised}
                              >
                                {this.formatFilename(this.state.dataset.attachmentCatergorised)}
                              </a>
                            </FormControl.Static>
                          </FormGroup>}
                          <Row>
                            <Col xs={6}>
                              <LoaderButton
                                block
                                bsStyle="primary"
                                bsSize="large"
                                disabled={!this.validateForm()}
                                type="submit"
                                isLoading={this.state.isLoading}
                                text="Save"
                                loadingText="Saving…"
                              />
                            </Col>
                            <Col xs={6}>
                              <LoaderButton
                                block
                                bsStyle="danger"
                                bsSize="large"
                                isLoading={this.state.isDeleting}
                                onClick={this.handleDelete}
                                text="Delete"
                                loadingText="Deleting…"
                              />
                            </Col>
                          </Row>
                      </Col>
                    </Row>
                  </Grid>
          </form>}
      </div>
    );
  }
}