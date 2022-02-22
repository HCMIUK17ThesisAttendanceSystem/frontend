import Title from 'antd/lib/typography/Title'
import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Table, Space, Button, Form, Input, InputNumber, Modal, message } from 'antd'
import NavBreadcrumb from '../../../components/Navigation/NavBreadcrumb/NavBreadcrumb'

import axios from '../../../axios-instance'

const { Column, ColumnGroup } = Table;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

export default class Subjects extends Component {
  state = {
    subjects: [],
    showForm: false,
    confirmLoading: false,
    loading: false
  }

  componentDidMount() {
    this.setState({ loading: true });
    axios.get('/admin/subjects', {
      headers: {
        'Authorization': `Bearer ${this.props.token}`
      }
    })
      .then(res => res.data)
      .then(resData => {
        this.setSubjects(resData.subjects);
        this.setState({ loading: false });
      })
      .catch(err => this.props.onError(err));
  }

  toggleForm = () => this.setState({ showForm: !this.state.showForm })

  setSubjects = (subjectData) => {
    const subjects = subjectData.map(subject => {
      return {
        ...subject,
        courseNo: subject.courseIds.length
      }
    });
    this.setState({ subjects });
  }

  createSubjectHandler = (values) => {
    axios.post('/admin/subject', values, {
      headers: {
        'Authorization': `Bearer ${this.props.token}`
      }
    })
      .then(res => {
        if (res.status === 201) {
          this.setState({ showForm: false });
          this.setSubjects([...this.state.subjects, res.data.subject]);
          message.success(res.data.message || 'New Subject Created :D');
        }
      })
      .catch(err => this.props.onError(err));
  }

  deleteSubjectHandler = (subjectId) => {
    axios.delete('/admin/subject/' + subjectId, {
      headers: {
        'Authorization': `Bearer ${this.props.token}`
      }
    })
      .then(res => {
        console.log(res)
        if (res.status === 200) {
          this.setSubjects(this.state.subjects.filter(subject => subject._id !== subjectId));
          message.success(res.data.message || 'Subject Deleted :D');
        }
      })
      .catch(err => this.props.onError(err));
  }

  render() {
    const { subjects, showForm, confirmLoading, loading } = this.state;

    const table = (
      <Table dataSource={subjects} rowKey='_id' loading={loading}>
        <Column
          title='Subject ID'
          dataIndex='id'
          key='id'
        />
        <Column
          title='Name'
          dataIndex='name'
          key='name'
        />
        <ColumnGroup title='Credit Number'>
          <Column
            title='Theory Credit(s)'
            dataIndex='creditTheory'
            key='creditTheory'
            align='right'
          />
          <Column
            title='Laboratory Credit(s)'
            dataIndex='creditLab'
            key='creditLab'
            align='right'
          />
        </ColumnGroup>
        <Column
          title='Course Number'
          dataIndex='courseNo'
          key='courseNo'
          align='right'
        />
        <Column
          title='Action'
          key='action'
          render={(text, record) => (
            <Space size='middle'>
              <Button type='primary'><Link to={`/courses?subjectId=${record._id}`}>View courses</Link></Button>
              <Button onClick={() => this.deleteSubjectHandler(record._id)} danger type='link'>Delete</Button>
            </Space>
          )}
        />
      </Table>
    );

    const form = (
      <Modal
        title={'Create New Subject'}
        visible={showForm}
        confirmLoading={confirmLoading}
        onCancel={this.toggleForm}
        footer={[]}
      >
        <Form
          {...layout}
          id={'subjectForm'}
          onFinish={this.createSubjectHandler}
          onFinishFailed={null}
        >
          <Form.Item
            label='Subject ID'
            name='id'
            rules={[{
              required: true,
              min: 7,
              max: 7,
              message: 'Please input the ID of subject!'
            }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label='Subject Name'
            name='name'
            rules={[{
              required: true,
              min: 5,
              message: 'Please input the full name of subject!'
            }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Theory Credits"
            name="creditTheory"
            rules={[{
              required: true,
              message: 'Please input a number >= 0'
            }, {
              type: 'number',
              message: 'Please input a number >= 0'
            }]}
          >
            <InputNumber min={0} value={0} />
          </Form.Item>
          <Form.Item
            label="Lab Credits"
            name="creditLab"
            rules={[{
              required: true,
              message: 'Please input a number >= 0'
            }, {
              type: 'number',
              message: 'Please input a number >= 0'
            }]}
          >
            <InputNumber min={0} value={0} />
          </Form.Item>
          <Form.Item {...tailLayout}>
            <Button
              type='primary'
              htmlType='submit'
            >Submit</Button>
            <Button
              type='link'
              onClick={this.toggleForm}
            >Cancel</Button>
          </Form.Item>
        </Form>
      </Modal>
    );

    return (
      <Fragment>
        <NavBreadcrumb
          elements={[
            { key: 1, text: 'Admin', to: '/' },
            { key: 2, text: 'Subjects' },
          ]}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Title level={3}>Subject List</Title>
          <Button type='primary' onClick={this.toggleForm}>Add new subject</Button>
        </div>
        {table}
        {form}
      </Fragment>
    )
  };
};
