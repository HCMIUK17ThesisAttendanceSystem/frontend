import React, { Component, Fragment } from 'react'
// import { Link } from 'react-router-dom'
import { Table, Space, Button, Form, InputNumber, Select, Modal, Typography } from 'antd'
import NavBreadcrumb from '../../../components/Navigation/NavBreadcrumb/NavBreadcrumb'

import axios from '../../../axios-instance'
import { range } from '../../../util/array-functions'
import { convertToWeekday } from '../../../util/weekday'

const { Column } = Table;
const { Item } = Form;
const { Option } = Select;
const { Title } = Typography;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

export default class Courses extends Component {
  state = {
    courses: [],
    subjects: [],
    lecturers: [],
    students: [],
    rooms: [],
    showForm: false,
    confirmLoading: false,
    loading: false,
    isUpdating: false,
    updatingCourse: {}
  }

  componentDidMount() {
    this.setState({ loading: true });
    axios.get(`/admin/courses`, {
      headers: {
        'Authorization': `Bearer ${this.props.token}`
      }
    })
      .then(res => this.setState({
        courses: res.data.courses,
        subjects: res.data.subjects,
        lecturers: res.data.lecturers,
        students: res.data.students,
        rooms: res.data.rooms,
        loading: false
      }))
      .catch(err => this.props.onError(err));
  }

  toggleCreate = () => this.setState({
    showForm: !this.state.showForm,
    isUpdating: false,
    updatingCourse: {}
  })

  toggleUpdate = (courseId) => {
    axios.get(`/admin/course/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${this.props.token}`
      }
    })
      .then(res => res.data.course)
      .then(course => this.setState({
        showForm: !this.state.showForm,
        isUpdating: true,
        updatingCourse: {
          ...course,
          startPeriod: course.periods[0],
          periodNum: course.periods.length
        }
      }))
      .catch(err => this.props.onError(err));
  }

  createCourseHandler = (values) => {
    console.log(values);
    const { subjectId, lecturerId, classType, roomId, weekday, startPeriod, periodNum } = values;
    const start = parseInt(startPeriod)
    const end = parseInt(startPeriod) + parseInt(periodNum) - 1
    const periods = range(start, end);
    this.setState({ confirmLoading: true });
    axios.post('/admin/course', {
      subjectId, lecturerId, classType, roomId, weekday, periods
    }, {
      headers: {
        'Authorization': `Bearer ${this.props.token}`
      }
    })
      .then(res => {
        if (res.status === 201) {
          this.setState({
            showForm: false,
            courses: [...this.state.courses, res.data.course],
            confirmLoading: false
          });
        }
      })
      .catch(err => this.props.onError(err));
  };

  updateRegistrationsHandler = (values) => {
    this.setState({ confirmLoading: true });
    axios.put('/admin/registrations', {
      ...values,
      courseId: this.state.updatingCourse._id
    }, {
      headers: {
        'Authorization': `Bearer ${this.props.token}`
      }
    })
      .then(res => {
        if (res.status === 200) {
          this.setState({
            showForm: !this.state.showForm,
            confirmLoading: false
          });
        }
        return res.data
      })
      .catch(err => this.props.onError(err));
  };

  deleteCourseHandler = (courseId) => {
    console.log(courseId)
    axios.delete(`/admin/course/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${this.props.token}`
      }
    })
      .then(res => {
        console.log(res)
        if (res.status === 200)
          this.setState({ courses: this.state.courses.filter(course => course._id !== courseId) });
      })
      .catch(err => this.props.onError(err));
  }

  getLecturer = (lecturerId) => {
    const lec = this.state.lecturers.find(lec => lec._id === lecturerId);
    return lec;
  }

  getSubject = (subjectId) => {
    const subject = this.state.subjects.find(subject => subject._id === subjectId);
    return subject;
  }

  getRoom = roomId => this.state.rooms.find(room => room._id === roomId);

  render() {
    const { courses, subjects, lecturers, students, rooms, showForm, confirmLoading, isUpdating, updatingCourse, loading } = this.state;

    const table = (
      <Table dataSource={courses} rowKey='_id'
        loading={loading}
      >
        <Column
          title='Subject ID'
          key='subjectId'
          render={(text, record) => (
            this.getSubject(record.subjectId).id
          )}
        />
        <Column
          title='Subject Name'
          key='subjectName'
          render={(text, record) => (
            this.getSubject(record.subjectId).name
          )}
        />
        <Column
          title='Lecturer Name'
          key='lecturerName'
          render={(text, record) => (
            this.getLecturer(record.lecturerId).name
          )}
        />
        <Column
          title='Class Type'
          key='classType'
          render={(text, record) => (
            record.classType === "0" ? "Theory" : "Laboratory"
          )}
        />
        <Column
          title='Room'
          key='room'
          render={(text, record) => (
            this.getRoom(record.roomId).code
          )}
        />
        <Column
          title='Weekday'
          key='weekday'
          render={(text, record) => convertToWeekday(record.weekday)}
          align='right'
        />
        <Column
          title='Periods'
          key='periods'
          render={(text, record) => (
            record.periods[0] + '-' + record.periods[record.periods.length - 1]
          )}
          align='right'
        />
        <Column
          title='Student number'
          key='studentNo'
          render={(text, record) => (
            record.regStudentIds.length
          )}
          align='right'
        />
        <Column
          title='Action'
          key='action'
          render={(text, record) => (
            <Space size='middle'>
              <Button onClick={() => this.toggleUpdate(record._id)} type='default'>Update Registrations</Button>
              <Button onClick={() => this.deleteCourseHandler(record._id)} danger type='link'>Delete</Button>
            </Space>
          )}
        />
      </Table>
    );

    const createFormItems = (
      <Fragment>
        <Item
          label='Subject'
          name='subjectId'
          rules={[{
            required: true,
            message: 'Please select the subject at hand :D'
          }]}
        >
          <Select
            showSearch
            placeholder='Select a subject'
            optionFilterProp='children'
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {
              subjects.map((subject, index) => (
                <Option key={index} value={subject._id}>
                  {`${subject.id} - ${subject.name}`}
                </Option>
              ))
            }
          </Select>
        </Item>
        <Item
          label='Lecturer'
          name='lecturerId'
          rules={[{
            required: true,
            message: 'Please select the responsible lecturer :D'
          }]}
        >
          <Select
            showSearch
            placeholder='Select the responsible lecturer'
            optionFilterProp='children'
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {
              lecturers.map(lecturer => (
                <Option value={lecturer._id}>
                  {lecturer.name}
                </Option>
              ))
            }
          </Select>
        </Item>
        <Item
          label='Class Type'
          name='classType'
          rules={[{
            required: true,
            message: 'Please select the corresponding type of class :D'
          }]}
        >
          <Select
            placeholder='Select the class type'
          // value={isUpdating && (updatingCourse.classType === "0" ? "Theory" : "Laboratory")}
          >
            <Option key={"0"} value={"0"}>Theory</Option>
            <Option key={"1"} value={"1"}>Laboratory</Option>
          </Select>
        </Item>
        <Item
          label='Room'
          name='roomId'
          rules={[{
            required: true,
            message: 'Please select the room code :D'
          }]}
        >
          <Select
            showSearch
            placeholder='Select a room'
            optionFilterProp='children'
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {
              rooms.map((room, index) => (
                <Option key={index} value={room._id}>
                  {`${room.code}`}
                </Option>
              ))
            }
          </Select>
        </Item>
        <Item
          label='Weekday'
          name='weekday'
          rules={[{
            required: true,
            message: 'Please select the weekday :D'
          }]}
        >
          <Select placeholder='Select the weekday'>
            <Option key={"1"} value={"1"}>Monday</Option>
            <Option key={"2"} value={"2"}>Tuesday</Option>
            <Option key={"3"} value={"3"}>Wednesday</Option>
            <Option key={"4"} value={"4"}>Thursday</Option>
            <Option key={"5"} value={"5"}>Friday</Option>
            <Option key={"6"} value={"6"}>Saturday</Option>
          </Select>
        </Item>
        <Item
          label='Starting period'
          name='startPeriod'
          rules={[{
            required: true,
            message: 'Please input the starting period :D'
          }, {
            type: 'number',
            message: 'Please input the starting period in number :D'
          }]}
        >
          <InputNumber min={1} max={15} />
        </Item>
        <Item
          label='Period number'
          name='periodNum'
          rules={[{
            required: true,
            message: 'Please input the number of periods :D'
          }, {
            type: 'number',
            message: 'Please input the number of periods :D'
          }]}
        >
          <InputNumber min={2} max={5} />
        </Item>
      </Fragment>
    );

    const updateFormItem = (
      <Item
        label='Registered students'
        name='regStudentIds'
      >
        <Select
          mode='multiple'
          allowClear={!isUpdating}
          defaultValue={isUpdating ? updatingCourse.regStudentIds : []}
          optionFilterProp='children'
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {
            students.map(student => (
              <Option value={student._id}>
                {`${student.id} - ${student.name}`}
              </Option>
            ))
          }
        </Select>
      </Item>
    );

    const form = (
      <Modal
        title={isUpdating ? 'Update Course\'s Registrations' : 'Create New Course'}
        visible={showForm}
        confirmLoading={confirmLoading}
        onCancel={this.toggleCreate}
        footer={[]}
      >
        <Form
          {...layout}
          id={'courseForm'}
          onFinish={isUpdating ? this.updateRegistrationsHandler : this.createCourseHandler}
          onFinishFailed={null}
          initialValues={isUpdating ? updatingCourse : null}
        >
          {
            isUpdating ?
              updateFormItem :
              createFormItems
          }
          <Item {...tailLayout}>
            <Button
              type='primary'
              htmlType='submit'
            >Submit</Button>
            {/* <Button
                htmlType='reset'
              >Reset</Button> */}
            <Button
              type='link'
              onClick={this.toggleCreate}
            >Cancel</Button>
          </Item>
        </Form>
      </Modal>
    );

    return (
      <Fragment>
        <NavBreadcrumb
          elements={[
            { key: 1, text: 'Admin', to: '/' },
            { key: 2, text: 'Courses' },
          ]}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Title level={3}>Course List</Title>
          <Button type='primary' onClick={this.toggleCreate}>Add new course</Button>
        </div>
        {table}
        {form}
      </Fragment>
    )
  };
};
