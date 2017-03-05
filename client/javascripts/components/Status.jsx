import React from 'react';

export default class Status extends React.Component {
  render() {
    if(this.props.message) {
      return <div>Status: {this.props.message}{this.props.message != 'Done!' ? '...' : ''}</div>
    } else {
      return null
    }
  }
}
