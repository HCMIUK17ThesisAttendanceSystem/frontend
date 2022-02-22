import React, { Component } from 'react';
import { Switch, Route } from "react-router-dom";

import { Layout, Typography } from 'antd';
import {
  DesktopOutlined,
  ReadOutlined,
  CameraOutlined
} from '@ant-design/icons';

import SideDrawer from '../../components/Navigation/SideDrawer/SideDrawer';
import Dashboard from '../../pages/lecturer/Dashboard/Dashboard';
import Courses from '../../pages/lecturer/Courses/Courses';
import Reports from '../../pages/lecturer/Reports/Reports';
import TakePicture from '../../pages/lecturer/TakePicture/TakePicture';
import StudentList from '../../pages/lecturer/TakePicture/StudentList';

const { Content, Footer } = Layout;
const { Title } = Typography;

export default class LecturerLayout extends Component {
  render() {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <SideDrawer
          elements={[
            { key: 1, text: 'Dashboard', to: '/', icon: <DesktopOutlined /> },
            { key: 2, text: 'Courses', to: '/courses', icon: <ReadOutlined /> },
            { key: 3, text: 'Take Picture', to: '/takepicture', icon: <CameraOutlined /> },
            { key: 4, text: 'Student List', to: '/studentlist', icon: <CameraOutlined /> },
            // { key: 3, text: 'Reports', to: '/reports', icon: <PieChartOutlined /> }
          ]}
          onLogout={this.props.onLogout}
        />
        <Layout className="site-layout">
          <Content style={{ margin: '0 16px' }}>
            <Switch>
              <Route path={`/`} exact render={() => <Dashboard {...this.props} />} />
              <Route path={`/courses`} render={() => <Courses {...this.props} />} />
              <Route path={`/takepicture`} render={() => <TakePicture {...this.props} />} />
              <Route path={`/studentlist`} render={() => <StudentList {...this.props} />} />
              <Route path={`/reports/:courseId`} render={(props) => <Reports {...props} {...this.props} />} />
              <Route component={() => <Title>404 Not Found</Title>} />
            </Switch>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Presence ©2021 Created by HCMIU</Footer>
        </Layout>
      </Layout>
    )
  }
}
