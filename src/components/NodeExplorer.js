import React, { Component } from 'react'
import { Button, Modal } from 'react-bootstrap';

export default class NodeModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
        showModal: true,
        nodeData: null,
    };
    this.close = this.close.bind(this);
  }
  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
  }

  render() {
    return (
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h4>Text in a modal</h4>
            <p>Duis mollis, est non commodo luctus, nisi erat porttitor ligula.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
    );
  }
}

