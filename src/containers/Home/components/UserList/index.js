import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Promise from 'bluebird';

import { request } from 'services/request';
import * as endpoints from 'config/endpoints';
import * as contants from 'config/contants';
import './style.css';

class _UserList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      rows: [],
      isLoading: false,
      caching: {},// { phudev95: {...}, ... }
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (JSON.stringify(this.props) === JSON.stringify(nextProps) && JSON.stringify(this.state) === JSON.stringify(nextState)) {
      return false;
    }

    // Will fetch all users if old input value not equal with current input value of search box
    const oldUsers = this.props.users;
    const newUsers = nextProps.users;

    if (JSON.stringify(oldUsers) !== JSON.stringify(newUsers)) {
      this.setState({
        rows: [],
        isLoading: true
      });

      this.fetchUsers(newUsers);
    }

    return true;
  }

  /**
   * fetchUsers()
   * users: [user_a, user_b, ...]
   */
  fetchUsers = (users) => {
    const tempCaching = {};
    const { caching } = this.state;
    const startTime = new Date();

    // Remove value empty such as null, '', "" in user list
    users = _.compact(users);

    Promise
      .map(users, user => {
        // Check caching, is user has cached before, just return it and go to next user
        if (!_.isEmpty(caching[user])) {
          return caching[user];
        }

        // Fetch API
        const url = endpoints.getGithubUser(user);

        return request(url)
          .catch(err => {
            return null;
          })
          .then(result => {
            // Not Found User
            if (result && result.message) {
              result = _.extend({}, result, {
                login: user,
                error: result.message
              });
            }

            _.set(tempCaching, user, result);

            return result;
          });
      }, { concurrency: contants.CONCURRENCY_FETCH_USERS })
      .then(githubUsers => {
        console.log('== Completed in %ss', ((new Date() - startTime) / 1000), githubUsers);

        this.setState({
          isLoading: false,
          rows: githubUsers,
          caching: _.extend({}, caching, tempCaching)
        });
      })
      .catch(err => {
        console.log('== Fetch error', err);

        this.setState({
          isLoading: false
        });
      });
  }

  /**
   * getRows()
   */
  getRows = () => {
    const { rows, isLoading } = this.state;

    // Show loading
    if (_.isEmpty(rows)) {
      let message = 'Loading...';

      if (!isLoading) {
        message = 'No records.';
      }

      return <tr><td colSpan="2" className="text-center">{message}</td></tr>;
    }

    // Show records
    return _.chain(rows)
      .sortBy(['public_repos'])
      .map((row, index) => {
        const { login, public_repos, error } = row;

        return (
          <tr key={index}>
            <td>{login}</td>
            <td>{error || public_repos}</td>
          </tr>
        )
      })
      .value();
  };

  render() {
    return (
      <div className="container" id="user-list-table">
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Total Repos</th>
            </tr>
          </thead>
          <tbody>
            {this.getRows()}
          </tbody>
        </table>
      </div>
    );
  }
}

_UserList.propTypes = {
  users: PropTypes.array.isRequired
};

export const UserList = _UserList;
