import React, { Component } from 'react';
import './App.css';

class OptionComponent extends Component {

  handleMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.onSelect(this.props.option, event);
  }

  handleMouseEnter = (event) => {
    this.props.onFocus(this.props.option, event);
  }

  handleMouseMove = (event) => {
    if (this.props.isFocused) return;
    this.props.onFocus(this.props.option, event);
  }

  render() {
    return (
      <div 
        onMouseDown={this.handleMouseDown}
        onMouseEnter={this.handleMouseEnter}
        onMouseMove={this.handleMouseMove}
        className={this.props.className}
      >
        <div>
        {this.props.option.posterURL !== 'N/A' &&
          <img alt="" src={this.props.option.posterURL}/>
        }
        </div>
        <span>{this.props.option.title}</span>
      </div>
      )
  }
}

const ValueComponent = ({value}) => (
	<div className="value-component Select-value">
    <div>
      <img alt="" src={value.posterURL}/>
    </div>
    <span>{value.title}</span>
    <div  style={{float: 'right', paddingRight: 15}}>
      <i className='fa fa-star' style={{color: '#f7c61f'}} aria-hidden='true' />
      <span className=''> {value.rating}</span>
    </div>
	</div>
)

export {OptionComponent, ValueComponent}