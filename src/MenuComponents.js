import React, { Component } from "react";
import "./App.css";
import { Link } from "react-router-dom";

class OptionComponent extends Component {
  handleMouseDown = event => {
    event.preventDefault();
    event.stopPropagation();
    this.props.onSelect(this.props.option, event);
  };

  handleMouseEnter = event => {
    this.props.onFocus(this.props.option, event);
  };

  handleMouseMove = event => {
    if (this.props.isFocused) return;
    this.props.onFocus(this.props.option, event);
  };

  render() {
    const { option, className } = this.props;
    return (
      <Link
        to={{
          pathname: `/${option.value}`,
          state: { fromDashboard: true }
        }}
        onClick={console.log}
        className={className}
      >
        <div>
          {option.posterURL !== "N/A" && <img alt="" src={option.posterURL} />}
        </div>
        <span>{option.title}</span>
      </Link>
    );
  }
}

const ValueComponent = ({ value }) => (
  <div className="value-component Select-value">
    <div>
      <img alt="" src={value.posterURL} />
    </div>
    <span>{value.title}</span>
    <div style={{ float: "right", paddingRight: 15 }}>
      <i
        className="fa fa-star"
        style={{ color: "#f7c61f" }}
        aria-hidden="true"
      />
      <span className=""> {value.rating}</span>
    </div>
  </div>
);

export { OptionComponent, ValueComponent };
