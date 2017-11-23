import React from "react";
import { Route, Switch } from "react-router-dom";

import AppliedRoute from "./components/AppliedRoute";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";

import Home from "./containers/Home";
import Login from "./containers/Login";
import Signup from "./containers/Signup";
import NewProcessMap from "./containers/NewProcessMap";
import ProcessMaps from "./containers/ProcessMaps";
import Contact from "./containers/Contact";
import MyProfile from "./containers/MyProfile";
import ResetPassword from "./containers/ResetPassword";
import Shared from "./containers/Shared";


import NotFound from "./containers/NotFound";

export default ({ childProps }) =>
  <Switch>
    <AppliedRoute path="/" exact component={Home} props={childProps} />
    <UnauthenticatedRoute path="/login" exact component={Login} props={childProps} />
    <UnauthenticatedRoute path="/login/resetpassword" exact component={ResetPassword} props={childProps} />
    <UnauthenticatedRoute path="/signup" exact component={Signup} props={childProps}/>
    <AuthenticatedRoute path="/processmaps" exact component={Home} props={childProps} />
    <AuthenticatedRoute path="/processmaps/new" exact component={NewProcessMap} props={childProps} />
    <AuthenticatedRoute path="/processmaps/:id" exact component={ProcessMaps} props={childProps} />
    <AuthenticatedRoute path="/shared/:id" exact component={Shared} props={childProps} />
    <AuthenticatedRoute path="/contact" exact component={Contact} props={childProps} />
    <AuthenticatedRoute path="/myprofile" exact component={MyProfile} props={childProps} />
    { /* Finally, catch all unmatched routes */ }
    <Route component={NotFound} />
  </Switch>;