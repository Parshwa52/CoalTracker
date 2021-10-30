import React, { Component } from "react";

export class testimonials extends Component {
  render() {
    return (
      <div id="testimonials">
        <h1>Want to verify your coal?</h1>
        <button
                    onClick={() => window.open('/ConsumerCompany')}
                    className="btn btn-warning btn-lg page-scroll"
                  >
                    Click here to verify
                  </button>{" "}
                  <br/><br/><br/>
      </div>
    );
  }
}

export default testimonials;
