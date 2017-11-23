import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Nav, NavItem, Navbar} from "react-bootstrap";
import "./App.css";
import { authUser, signOutUser } from "./libs/awsLib";
import Footer from "./components/Footer";

import Routes from "./Routes";
import RouteNavItem from "./components/RouteNavItem";

class App extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      isAuthenticated: false,
      isAuthenticating: true,
      alertVisible: true,
    };
  }

  async componentDidMount() {
    try {
      if (await authUser()) {
        this.userHasAuthenticated(true);
      }
    }
    catch(e) {
      alert(e);
    }
  
    this.setState({ isAuthenticating: false });
  }
  
  userHasAuthenticated = authenticated => {
    this.setState({ isAuthenticated: authenticated });
  }

  handleLogout = event => {

    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );
  
    if (!confirmed) {
      return;
    }

    signOutUser();
  
    this.userHasAuthenticated(false);
    this.props.history.push("/login");
  }

  handleAlertDismiss() {
    this.setState({ alertVisible: false });
  }

  render() {
    const childProps = {
      isAuthenticated: this.state.isAuthenticated,
      userHasAuthenticated: this.userHasAuthenticated,
      alertVisible: this.alertVisible,
    };

    return (
      !this.state.isAuthenticating &&
      <div className="App container-fluid">
        <Navbar fluid collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/">
                <strong> flow </strong>
                <span className="brand-symbol glyphicon glyphicon-random"></span>
              </Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse className="navbar-dark bg-dark">
            <Nav pullRight>
              {this.state.isAuthenticated
                ? [
                  <RouteNavItem key={2} href="/processmaps"><span className="glyphicon glyphicon-ice-lolly"></span>  Process Maps</RouteNavItem>,
                  <RouteNavItem key={3} href="/contact"><span className="glyphicon glyphicon-envelope"></span>  Contact</RouteNavItem>,
                  <RouteNavItem key={4} href="/myprofile"><span className="glyphicon glyphicon-user"></span>  Profile</RouteNavItem>,
                  <NavItem key={5} onClick={this.handleLogout}><span className="glyphicon glyphicon-log-out"></span>  Logout</NavItem> ]
                : [
                  <RouteNavItem key={6} href="/login">
                    <strong>Login</strong>
                  </RouteNavItem>
                ]}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Routes childProps={childProps} />
        <Footer />
      </div>
    );
  }
}

export default withRouter(App);