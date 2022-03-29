import React, { Component } from "react";

export class testimonials extends Component {
  render() {
    return (
      <div id="testimonials">
        <h1>Want to verify your coal?</h1>
        
        <Link to={{
                            pathname: '/ConsumerCompany',
                            
                          }} >
                  <input type="button" value="Click here to verify"
                    
                    className="btn btn-custom btn-lg page-scroll"
                  />
                    
                  {" "}
                          </Link>

                  <br/><br/><br/>
      </div>
    );
  }
}

export default testimonials;
