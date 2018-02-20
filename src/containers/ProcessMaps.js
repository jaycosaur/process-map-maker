import React, { Component } from "react";
import { Modal, Glyphicon, Form, Well, InputGroup, Button, FormGroup, FormControl, ControlLabel, HelpBlock, Row, Col} from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import "./ProcessMaps.css";
import { invokeApig } from "../libs/awsLib";
import Progress from 'react-progress';
import WorkflowChart from '../components/WorkflowChart';
import LoadingSymbol from './../components/LoadingSymbol'

import { message, Layout, Menu, Card, Icon, Collapse } from 'antd';
const { Content, Sider } = Layout;
const SubMenu = Menu.SubMenu;
const Panel = Collapse.Panel


export default class ProcessMap extends Component {
  constructor(props) {
    super(props);
    this.file = null;
    this.state = {
      processmap: null,
      isUnsaved: false,
      isLoading: null,
      isDeleting: false,
      title: null,
      description: null,
      content: {},
      isShared: null,
      sharedLinkCode: null,
      lastShared: null,
      uploadProgress: 0,
      newStream: "",
      hideEditPane: false,
      chartState: true,
      modalData: null,
      modalShow: false,
      devMode: false,
      collapsed: false,
    };
    this.nodeCallBackFn = this.nodeCallBackFn.bind(this);
    this.modalCallBack = this.modalCallBack.bind(this);
  }

  onCollapse = (collapsed) => {
    console.log(collapsed);
    this.setState({ collapsed });
  }

  modalView(){
    function FieldGroup({ id, label, help, ...props }) {
      return (
        <FormGroup controlId={id}>
          <ControlLabel>{label}</ControlLabel>
          <FormControl {...props} />
          {help && <HelpBlock>{help}</HelpBlock>}
        </FormGroup>
      );
    }

    return (
      <div>
      <Modal.Dialog bsSize='sm'>
        <Modal.Header>
          <Modal.Title>{this.state.modalData.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FieldGroup
            id="formControlsText"
            type="textarea"
            label="Description"
            value={this.state.modalData.description.length>0?this.state.modalData.description:"No description"}
            disabled={true}
          />
          <FieldGroup
            id="formControlsText"
            type="textarea"
            label="Node type"
            value={this.state.modalData.type}
            disabled={true}
          />
          <FieldGroup
            id="formControlsText"
            type="textarea"
            label="Stream"
            value={this.state.content.streams[this.state.modalData.stream].title}
            disabled={true}
          />
          <FieldGroup
            id="formControlsText"
            type="textarea"
            label="Attachments"
            value={this.state.modalData.attachment}
            href={this.state.modalData.attachment}
            disabled={true}
          />
          {/*JSON.stringify(this.state.modalData, null, 2)*/}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.modalCallBack}>Close</Button>
        </Modal.Footer>
      </Modal.Dialog>
    </div> );
  }

  async componentDidMount() {
    try {
      const results = await this.getDataset();
      this.setState({
        processMap: results,
        content: JSON.parse(results.content),
        title: results.title,
        description: results.description,
        id: results.processMapId,
        createdAt: results.createdAt,
        isShared: results.isShared,
        lastShared: results.lastShared,
        sharedLinkCode: results.sharedLinkCode
      });
      console.log(this.state.content);
    } catch (e) {
      alert(e);
    }
  }

  getDataset() {
    return invokeApig({ path: `/processmaps/${this.props.match.params.id}` });
  }

  saveProcessMap(processMap) {
    return invokeApig({
      path: `/processmaps/${this.props.match.params.id}`,
      method: "PUT",
      body: processMap
    });
  }

  handleSave = async event => {
    event.preventDefault();
    this.setState({ isLoading: true });
    try {
      await this.saveProcessMap({
        ...this.state.processMap,
        title: this.state.title,
        description: this.state.description,        
        content: JSON.stringify(this.state.content), 
        isShared: this.state.isShared,
        lastShared: this.state.lastShared,
        sharedLinkCode: this.state.sharedLinkCode
      });
      this.setState({
        isLoading: false,
        isUnsaved: false
      })
    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
    message.success('Process map saved!');
  }

  deleteProcessMap() {
    return invokeApig({
      path: `/processmaps/${this.props.match.params.id}`,
      method: "DELETE"
    });
  }
  
  handleDelete = async event => {
    event.preventDefault();
  
    const confirmed = window.confirm(
      "Are you sure you want to delete this process map?"
    );
  
    if (!confirmed) {
      return;
    }
  
    this.setState({ isDeleting: true });
    
      try {
        await this.deleteProcessMap();
        this.props.history.push("/");
      } catch (e) {
        alert(e);
        this.setState({ isDeleting: false });
      }
  }

  enableShare(shareInfo) {
    return invokeApig({
      path: `/processmaps/share/`,
      method: "POST",
      body: shareInfo
    });
  }

  handleShareButton = async event => {
    event.preventDefault();
    try {
      const response = await this.enableShare({
        id: this.props.match.params.id,
        title: this.state.title,
        description: this.state.description,
        content: JSON.stringify(this.state.content)
      });
      message.success('Process map has been shared!')
      this.setState({
        isShared: true,
        sharedLinkCode: response.shareId,
        lastShared: response.createdAt,
        isUnsaved: false
      });
    } catch (e) {
      alert(e);
    }
  }

  updateShare(shareInfo) {
    return invokeApig({
      path: `/processmaps/share/`,
      method: "POST",
      body: shareInfo
    });
  }

  handleUpdateShareButton = async event => {
    event.preventDefault();
    try {
      const response = await this.enableShare({
        id: this.props.match.params.id,
        title: this.state.title,
        description: this.state.description,
        content: JSON.stringify(this.state.content)
      });
      message.success('Successfully updated share!')
      this.setState({
        isShared: true,
        sharedLinkCode: response.shareId,
        lastShared: response.createdAt,
        isUnsaved: false
      });
    } catch (e) {
      alert(e);
    }
  }

  disableShare(shareInfo) {
    return invokeApig({
      path: `/processmaps/share/${this.state.sharedLinkCode}`,
      method: "DELETE",
      body: shareInfo
    });
  }
  
  handleShareDelete = async event => {
    event.preventDefault();
      try {
        await this.disableShare({
          id: this.props.match.params.id,
          shareId: this.state.sharedLinkCode
        });
        message.success('Successfully deleted share!')
        this.setState({
          isShared: false,
          sharedLinkCode: null,
          lastShared: null,
          isUnsaved: false
        });
      } catch (e) {
        alert(e);
      }
  }

  nodeCallBackFn  = (node) => {
    this.setState({
      modalShow: true,
      modalData: node})
    console.log('clicked!')
    console.log(node);
  }

  modalCallBack() {
    this.setState({modalShow: false});
    console.log('closed!')
  }

  errorCallBackFn  = (e) => {
    console.log(e);
    message.error("You have made an error! Please refresh the page")
  }

  updateProgress = (dataFromUpload) => {     
      this.setState({ uploadProgress: dataFromUpload });
  }

  validateForm() {
    return this.state.title.length > 0;
  }

  validateNewStreamForm() {
    return this.state.newStream.length > 0;
  }

  handleControlToggle = event => {
    console.log('contols toggled');
    var toSet = !this.state.hideEditPane;
    this.setState({ hideEditPane: toSet });  
  }

  handleChartToggle = event => {
    console.log('chart toggled');
    var toSet = !this.state.chartState;
    this.setState({ chartState: toSet });   
  }

  handleChange = event => {
    this.setState({
      isUnsaved: true,
      [event.target.id]: event.target.value
    });
  }

  handleStreamChange(i,e) {
    let content = {
          ...this.state.content, 
          streams : { 
            ...this.state.content.streams,
              [i] : {
                ...this.state.content.streams[i],
                [e.target.id]: e.target.value                              
              }
          } 
    }
    this.setState({
      isUnsaved: true,      
      content: content
    });
  }

  handleNodeChange(i,e) {
    let content = {
          ...this.state.content, 
          items : { 
            ...this.state.content.items,
              [i] : {
                ...this.state.content.items[i],
                [e.target.id]: e.target.value                              
              }
          }
    }
    this.setState({
      isUnsaved: true,      
      content: content
    });
  }

  addConnector(i,e){
    var connectorIds = Object.keys(this.state.content.items[i].connectors).map((key) => Number(key));
    var id = (Math.max(...connectorIds) > 0 ? Number(Math.max(...connectorIds) + 1) : 1);
    let content = {
      ...this.state.content, 
      items : { 
        ...this.state.content.items,
          [i] : {
            ...this.state.content.items[i],
            connectors : {
              ...this.state.content.items[i].connectors,
              [id] : {
                title : "",
                type : "",
                linkTo : null
              }
            }                              
          }
      }
    }
    this.setState({
      isUnsaved: true,      
      content: content
    });
    message.success('Connecter has been added!')
  }

  addNode = async event => {
    event.preventDefault();
    var nodeIds = Object.keys(this.state.content.items).map((key) => Number(key));
    var id = Math.max(...nodeIds) + 1;
    let content = {
      ...this.state.content, 
      items : { 
        ...this.state.content.items,
          [id] : {
            "title": "New node!",
            "id": id,
            "description": "",
            "type": "process-simple",
            "stream": 1,
            "attachment": "",
            "connectors": {}
            }
          }
      } 
    message.success('Node has been added!')
    this.setState({
      content: content,
      isUnsaved: true,
    });
  }

  deleteNode(i, e){
    var nodes = this.state.content.items
    delete nodes[i]    
    let content = {
      ...this.state.content, 
      items : { 
        ...nodes
        }
      };
    this.setState({
      content: content,
      isUnsaved: true,
    });
    message.success('Node has been deleted!')
  }

  deleteConnector(i, c, e){
    console.log('Deleting connect ' + c + ' from node ' + i);
    var connector = this.state.content.items[i].connectors
    delete connector[c]    
    let content = {
      ...this.state.content, 
      items : { 
        ...this.state.content.items,
        [i] : {
          ...this.state.content.items[i],
          connectors : connector
        }
        }
      };
    this.setState({
      content: content,
      isUnsaved: true,
    });
    message.success('Connector has been deleted!')
  }

  handleConnectorChange(connectorId,nodeId,e) {
    let value = e.target.value;
    if (e.target.id === "linkTo"){
      value = Number(value)
    }
    let content = {
          ...this.state.content, 
          items : { 
            ...this.state.content.items,
              [nodeId] : {
                ...this.state.content.items[nodeId],
                connectors : {
                  ...this.state.content.items[nodeId].connectors,  
                  [connectorId] : {
                    ...this.state.content.items[nodeId].connectors[connectorId],
                    [e.target.id]: value                                                  
                  }         
                }
              }
          }
    }
    this.setState({
      isUnsaved: true,      
      content: content
    });
  }

  handleFileChange = event => {
    this.file = event.target.files[0];
  }

  deleteStream(i, e){
    var newStreams = this.state.content.streams
    delete newStreams[i]    
    let content = {
      ...this.state.content, 
      streams : { 
        ...newStreams
        }
      };
    this.setState({
      content: content,
      isUnsaved: true,
    });
    message.success('Successfully deleted Stream!')
  }
  
  handleSubmitStreamEdit = async event => {
    event.preventDefault();
    var streamId = Object.keys(this.state.content.streams).map((key) => Number(key));
    var id = Math.max(...streamId) + 1
    let content = {
      ...this.state.content, 
      streams : { 
        ...this.state.content.streams,
          [id] : {
            id: id,
            title: this.state.newStream,
            order: id
          }
      } 
    }
    this.setState({
      content: content,
      newStream: "",
      isUnsaved: true,
    });
    message.success('Stream has been added!');
  }

  renderPropertyPane() {
    return (
        <form onSubmit={this.handleSubmit}>
            <FormGroup controlId="title" bsSize="small">
            <ControlLabel><small>Process map title</small></ControlLabel>
            <FormControl
                autoFocus
                type="name"
                value={this.state.title}
                onChange={this.handleChange}
            />
            </FormGroup>    
          <FormGroup controlId="description" bsSize="small">
            <ControlLabel><small>Description</small></ControlLabel>
            <FormControl
              onChange={this.handleChange}
              value={this.state.description}
              componentClass="textarea"
            />
          </FormGroup>
          <Row>
            <Col xs={12}>
              <LoaderButton
                block
                bsStyle="danger"
                bsSize="small"
                type="submit"
                isLoading={this.state.isDeleting}
                onClick={this.handleDelete}
                text={<span><span className="glyphicon glyphicon-trash"></span> Delete process map</span>}
                loadingText={"Deleting ..."}
              />
            </Col>
          </Row>
        </form>
    );
  }

  renderStream(id, stream) {
    return (
      <Panel collapsible
        eventKey={id}
        header={
          <span>
            <small>{id} - {this.state.content.streams[id].title} </small>
            <Button id='delete-stream-button' onClick={this.deleteStream.bind(this, id)} bsStyle="link" bsSize="xsmall"><Glyphicon glyph="trash"/></Button>
          </span>
          }
        key = {id}
      >
        <Well>
          <Form horizontal>
            <FormGroup key={1} controlId="title" bsSize="small" className="no-margin">
              <Col componentClass = {ControlLabel} sm={3}>
                Title
              </Col>
              <Col sm={9}>
                <FormControl
                    autoFocus
                    type="name"
                    value={this.state.content.streams[id].title}
                    onChange={this.handleStreamChange.bind(this, id)}
                />
              </Col>
            </FormGroup>   
          </Form>
        </Well>
      </Panel>
    );
  }

  renderStreamPane(streams) {
    var streamArray = Object.keys(streams).map((key) => [Number(key), streams[key]])
    return (
      <Collapse style={{maxWidth: 400}}>
        {[{}].concat(streamArray).map(
          (stream, i) =>
            i !== 0
              ? 
                this.renderStream(stream[0],stream[1])
              : 
                  <form key={i} id='new-stream-form' onSubmit={this.handleSubmitStreamEdit}>
                    <FormGroup key={1} controlId="newStream" bsSize="small">
                      <InputGroup>
                        <InputGroup.Addon
                          onClick={this.validateNewStreamForm() ? this.handleSubmitStreamEdit : null}
                          >
                          <span id="new-stream-add-button" style={{color: '#1a9ed9'}}className={this.validateNewStreamForm() ? "glyphicon glyphicon-plus" : "glyphicon glyphicon-flash"}></span>
                        </InputGroup.Addon>
                        <FormControl
                          autoFocus
                          type="name"
                          value={this.state.newStream}
                          placeholder="New stream title"
                          onChange={this.handleChange}
                          />
                      </InputGroup>
                    </FormGroup>   
                  </form>
        )}
      </Collapse>
    )
    
    
  }
 
  renderAddNewItemControl() {
    return (
      <Icon type="plus-circle" onClick={this.addNode} />         
    );
  }

  renderAddNewConnectorControl(id) {
    return (
      <Icon type="plus-circle" style={{color: "#008F09"}} onClick={this.addConnector.bind(this,id)} />
    );
  }
  
  renderItemsPane(content) {
    var contentArray = Object.keys(content.items).map((key) => [Number(key), content.items[key]])    
    return (
      <Collapse>
       {[{}].concat(contentArray).map(
        (item, i) =>
          i === 0
            ? 
              null
            : 
              this.renderItem(item[1])
      )}
      </Collapse>
    )
  }

  renderItem(item) {

    var streamArray = Object.keys(this.state.content.streams).map((key) => this.state.content.streams[key])
    
    return (
      <Panel collapsible
        eventKey={item.id}
        key={item.id}
        header={<span><small>{item.id} {item.title}</small><Button id='delete-node-button' onClick={this.deleteNode.bind(this, item.id)} bsStyle="link" bsSize="xsmall"><Glyphicon glyph="trash"/></Button></span>}
        onClick={this.handleDatasetClick}
        className='node-panel'
      >
      <Well className='no-border take-full-width'>
        <Form horizontal> 
            <FormGroup controlId="title" bsSize="small">
              <Col sm={3} componentClass={ControlLabel}>
                Item Title
              </Col>
              <Col sm={9}>
                <FormControl
                    autoFocus
                    type="name"
                    value={this.state.content.items[item.id].title}
                    onChange={this.handleNodeChange.bind(this, item.id)}
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
                  value={this.state.content.items[item.id].description}
                  onChange={this.handleNodeChange.bind(this, item.id)}
                />
              </Col>
            </FormGroup>
            <FormGroup controlId="type" bsSize="small">
              <Col xs={3} componentClass={ControlLabel}>
                Type
              </Col>
              <Col xs={9}>
                <FormControl componentClass="select" placeholder="select"
                  value={this.state.content.items[item.id].type}
                  onChange={this.handleNodeChange.bind(this, item.id)}
                >
                  <option value="start">Start</option>
                  <option value="finish">Finish</option>
                  <option value="process-simple">Simple Process</option>
                  <option value="decision">Decision</option>
                  <option value="connector-start">Start Connector</option>
                  <option value="connector-end">End Connector</option>
                  <option value="or-split">Split</option>
                  <option value="junction">Junction</option>
                  <option value="delay">Delay</option>
                </FormControl>
              </Col>
            </FormGroup>
            <FormGroup controlId="stream" bsSize="small">
              <Col xs={3} componentClass={ControlLabel}>
                Stream
              </Col>
              <Col xs={9}>
                <FormControl componentClass="select" placeholder="select"
                  value={this.state.content.items[item.id].stream}
                  onChange={this.handleNodeChange.bind(this, item.id)}         
                >
                  {[{}].concat(streamArray).map(
                    (stream, i) =>                   
                        i>0 ? <option value={stream['id']} key={i}>{stream['title']}</option> : null
                    )}
                </FormControl>
              </Col>
            </FormGroup>
          </Form>
          <Card title={<span><small>Connectors</small></span>} extra={this.renderAddNewConnectorControl(item.id)}>
            <Collapse>
              {this.renderConnectors(item.connectors, item.id)}
            </Collapse>
          </Card>
        </Well>
      </Panel>
    );
  }  

  renderConnectors(connectors, nodeId){
    var connectorsArray = Object.keys(connectors).map((key) => [Number(key), connectors[key]]);
    return [{}].concat(connectorsArray).map(
      (connector, i) =>
        i !== 0
          ? 
            this.renderConnector(connector[1], connector[0], nodeId)
          : 
          null         
    );
  }

  renderConnector(connector, i, nodeId){

    var nodeArray = Object.keys(this.state.content.items).map((key) => this.state.content.items[key])
    
    return (
      <Panel collapsible
        header={<span><small>Connector {i} <Button id = 'delete-connector-button' onClick={this.deleteConnector.bind(this, nodeId, i)} bsStyle="link" bsSize="small"><Glyphicon glyph="trash" /></Button></small></span>}
        onClick={this.handleDatasetClick}
        key = {i}
      >
        <Well>
          <Form horizontal>
            <FormGroup controlId="title" bsSize="small">
              <Col sm={3} componentClass={ControlLabel}>
                Title
              </Col>
              <Col sm={9}>
                <FormControl
                    autoFocus
                    type="name"
                    value={this.state.content.items[nodeId].connectors[i].title}
                    onChange={this.handleConnectorChange.bind(this, i, nodeId)}
                />
              </Col>
            </FormGroup>    
            <FormGroup controlId="type" bsSize="small">
              <Col sm={3} componentClass={ControlLabel}>
                Type
              </Col>
              <Col sm={9}>
                <FormControl componentClass="select" placeholder="select"
                value={this.state.content.items[nodeId].connectors[i].type}
                onChange={this.handleConnectorChange.bind(this, i, nodeId)}>
                  <option value="simple">Simple</option>
                  <option value="complex">Dotted</option>
                  <option value="doubleend">Double-Ended</option>
                </FormControl>
              </Col>
            </FormGroup>
            <FormGroup controlId="linkTo" bsSize="small">
              <Col sm={3} componentClass={ControlLabel}>
                Links to
              </Col>
              <Col sm={9}>
                <FormControl componentClass="select" placeholder="select"
                  value={this.state.content.items[nodeId].connectors[i].linkTo}
                  onChange={this.handleConnectorChange.bind(this, i, nodeId)}            
                  >
                  {[{}].concat(nodeArray).map(
                    (node, i) => 
                      i > 0 ?
                        <option value={node['id']} key={i}>{node['id'] + ' ' +node['title']}</option> : null
                    )}
                </FormControl>
              </Col>
            </FormGroup>
          </Form>
        </Well>
      </Panel>
    );
  }

  renderSharePane(){
    return(
      <form style={{maxWidth: 400}}>    
        <FormGroup bsSize="small">
          <ControlLabel><small>{this.state.isShared ? `Currently Shared (since ${new Date(this.state.lastShared).toLocaleString()})` : 'Not Shared' }</small></ControlLabel>
          {this.state.isShared 
            ?
            [
              <InputGroup>
                <InputGroup.Addon><span style={{color: '#1a9ed9'}}className="glyphicon glyphicon-copy"></span></InputGroup.Addon>
                <FormControl type="text" value={'https://www.'+ window.location.hostname + '/shared/' + this.state.sharedLinkCode}/>
              </InputGroup>,
            <HelpBlock><small>Share Link - copy and paste this in any browser to view</small></HelpBlock>]
            :
            null
          } 
        </FormGroup>
        <Row>
          <Col xs={6}>
            <Button block onClick={this.handleShareButton} bsSize='small'> <strong><span className="glyphicon glyphicon-send"></span> {this.state.isShared ? 'Update link' : 'Create new link'}</strong> </Button>
          </Col>
          <Col xs={6}>
            <Button bsStyle = 'danger' disabled = {!this.state.isShared} block onClick={this.handleShareDelete} bsSize='small'> <strong><span className="glyphicon glyphicon-trash"></span> Disable Sharing </strong> </Button>
          </Col>
        </Row>
      </form>
    );
  }

  unsavedAlert(){
    return(
              <LoaderButton
                  block
                  bsStyle="danger"
                  bsSize="small"
                  type="submit"
                  isLoading={this.state.isLoading}
                  text="Unsaved Changes"
                  loadingText={"Saving ..."}
                  onClick={this.handleSave}
                  className="banner"
                />
    );
  }

  hideBar(){
    return (
      <Row className = 'no-pad'>
        <Col className = 'no-pad' xs={6}>
          <Button className='full-button' block onClick={this.handleControlToggle} bsSize='small'> <strong><span className="glyphicon glyphicon-cog"></span> {this.state.hideEditPane ? 'Show' : 'Hide'} Controls</strong> </Button>
        </Col>
        <Col className = 'no-pad' xs={6}>
          <Button disabled={!this.state.devMode} className='full-button' block onClick={this.handleChartToggle} bsSize='small'> <strong><span className="glyphicon glyphicon-th-list"></span> {this.state.chartState ? 'Hide' : 'Show'} Chart</strong> </Button>
        </Col>
      </Row>
    );
  }

  hiddenHeader(){
    return (
      <Panel><strong>{this.state.title}</strong></Panel>
    );
  }

  renderPrettyPrint(objs){
      return (
        <pre><code><div dangerouslySetInnerHTML={{ __html: JSON.stringify(objs, null, 2)}} /></code></pre>
      )
  };

  renderChartPane(){
    return(
        <div className="viz">
          {this.state.hideEditPane ? this.hideBar() : null}
          <div className="chartcont modal-container">
            {this.state.modalShow && this.modalView()}
            { this.state.chartState 
              ? <WorkflowChart key={Math.random()} id="d3-workflow" data={ this.state.content } errorCallBack={this.errorCallBackFn} nodeCallBack={this.nodeCallBackFn}/> 
              : this.renderPrettyPrint(this.state.content,null,4)}
          </div>
        </div>
    )
  };

  render() {
      return (
        <div className="process-map-container">
          <Progress height="3" color="#1a9ed9" percent={this.state.uploadProgress} />
          {this.state.processMap?
          <Layout style={{ minHeight: '100vh' }}>
          <Sider
            collapsible
            collapsed={this.state.collapsed}
            onCollapse={this.onCollapse}
            width={400}
            style={{background: "white"}}
          >
            { this.state.isUnsaved !== false 
              
              ? this.unsavedAlert() : null
            }
            <Menu theme="light" defaultSelectedKeys={['1']} mode="inline">
              <SubMenu
                key="properties"
                title={<span><Icon type="appstore" /><span>Properties</span></span>}
                >
                <Card>{this.renderPropertyPane()}</Card>
              </SubMenu>
              <SubMenu
                key="share"
                title={<span>{this.state.isShared?<Icon type="link" />:<Icon type="share-alt" />}<span>Share</span></span>}
                >
                <Card>{this.renderSharePane()}</Card>
              </SubMenu>
              <SubMenu
                key="streams"
                title={<span><Icon type="layout" /><span>Streams</span></span>}
                >
                <Card>{this.renderStreamPane(this.state.content.streams)}</Card>
              </SubMenu>
              <SubMenu
                key="nodes"
                title={<span><Icon type="bars" /><span>Nodes {this.renderAddNewItemControl()}</span></span>}
                >
                <Card>{this.renderItemsPane(this.state.content)}</Card>
              </SubMenu>
            </Menu>
          </Sider>
          <Layout>
            <Content style={{ margin: '16px' }}>
              <div style={{ background: '#fff', minHeight: 360 }}>
                {this.renderChartPane()}
              </div>
            </Content>
          </Layout>
        </Layout>
          :
          <LoadingSymbol /> 
        }
        </div>
      )
    }
}