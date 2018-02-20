import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import "./App.css";
import { authUser, signOutUser } from "./libs/awsLib";
import Footer from "./components/Footer";

import { Layout, Menu, Icon } from 'antd';

import Routes from "./Routes";

const { Header, Content } = Layout;


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

  handleNavClick = (e) => {
    e.preventDefault();

  }

  render() {
    const childProps = {
      isAuthenticated: this.state.isAuthenticated,
      userHasAuthenticated: this.userHasAuthenticated,
      alertVisible: this.alertVisible,
    };

    return (
      !this.state.isAuthenticating &&
        <Layout className="App container-fluid"> 
          <Header style={{ position: 'fixed', width: '100%', background: "white", zIndex: 1000, padding: 0}}>
            <Menu
              theme="light"
              mode="horizontal"
              defaultSelectedKeys={['2']}
              style={{ lineHeight: '64px', color: "#1a9ed9", padding: "0px 32px" }}
            >
              <Menu.Item key="logo"><Link to="/" style={{color: "#ff8099"}}><Icon type="api" /><strong> flow </strong></Link></Menu.Item> 
              {this.state.isAuthenticated
                  ? [
                    <Menu.Item key="1"><Link to="/processmaps"><Icon type="profile" />  Process Maps</Link></Menu.Item>,
                    //<Menu.Item key="2"><Link to="/contact"><span className="glyphicon glyphicon-envelope"></span>  Contact</Link></Menu.Item>,
                    <Menu.Item key="3"><Link to="/myprofile"><Icon type="user" /> Profile</Link></Menu.Item>,
                    <Menu.Item key="logout"><span onClick={this.handleLogout}><Icon type="logout" />  Logout</span></Menu.Item>]
                  : [
                    <Menu.Item key="6"><Link to="/signup">Signup</Link></Menu.Item>,
                    <Menu.Item key="7"><Link to="/login"><Icon type="login" /> Login</Link></Menu.Item>]}
            </Menu>
          </Header>
          <Content style={{ padding: '0 50px', marginTop: 64, minHeight: "100vh" }}>
            <Routes childProps={childProps} />
          </Content>
          <Footer />
        </Layout>
    );
  }
}

export default withRouter(App);