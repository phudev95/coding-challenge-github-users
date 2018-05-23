import React, { Component } from 'react';
import { UserList } from './components';

export class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      users: []
    };
  }

  handleChange = (event) => {
    const value = event.target.value.trim();

    if (value) {
      this.setState({
        value
      });
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const { value } = this.state;

    if (!value) return false;
    const users = value.split(',').map(user => String(user).trim());

    this.setState({
      users
    });
  };

  render() {
    const { value, users } = this.state;

    return (
      <div className="container">
        <form className="form-group" style={{ "marginTop": "40px" }} onSubmit={this.handleSubmit}>
          <div className="col-sm-10">
            <input
              type="text"
              value={value}
              className="form-control"
              placeholder="Ex: esco,heftybyte,phudev95,facebook,google,airbnb,reduxjs"
              onChange={this.handleChange}
            />
          </div>
          <button type="submit" className="btn btn-default col-sm-2">Search</button>
        </form>
        <div className="clearfix"></div>
        <UserList users={users} />
      </div>
    );
  }
}

