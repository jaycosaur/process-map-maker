import React, { Component } from 'react';
import "./BottomWindow.css";

import { Row, Col, Panel, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

 
export default class BottomWindow extends Component {

    render () {
        
        return (
            <div className="bottom-window">
                <Row>
                    <Col xs={12} xs={6}>
                        <Panel>
                            <FormGroup controlId="description" bsSize="small">
                                <Col sm={3} componentClass={ControlLabel}>
                                    Description
                                </Col>
                                <Col sm={9}>
                                    <FormControl
                                    componentClass="textarea"
                                    value={'test test' }
                                    disabled={true}
                                    />
                                </Col>
                            </FormGroup>
                        </Panel>
                    </Col>
                    <Col xs={12} xs={6}>
                        <Panel>
                            <FormGroup controlId="description" bsSize="small">
                                <Col sm={3} componentClass={ControlLabel}>
                                    Description
                                </Col>
                                <Col sm={9}>
                                    <FormControl
                                    componentClass="textarea"
                                    value={'test test' }
                                    disabled={true}
                                    />
                                </Col>
                            </FormGroup>
                        </Panel>
                    </Col>
                </Row>
            </div>
        )

    }
};