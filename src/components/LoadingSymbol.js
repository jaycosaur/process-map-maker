import React, { Component } from 'react'
import { Icon } from 'antd'


export default class LoadingSymbol extends Component {
  render() {
    const leftPad = window.innerWidth/2-80
    const topPad = window.innerHeight/2-80
    return (
      <div style={{position:"fixed", left: leftPad, top:topPad, margin: "auto", zIndex: 1000, width: 160, height: 160}}>
        <Icon type="api" spin style={{color: "#ff8099", fontSize: "1000%"}}/>
        {window.width}
      </div>
    )
  }
}
