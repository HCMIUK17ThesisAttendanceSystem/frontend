import React, { Component } from 'react'
import { Typography, Table, Tag } from 'antd'

import NavBreadcrumb from '../../../components/Navigation/NavBreadcrumb/NavBreadcrumb'
import axios from '../../../axios-instance'
import { convertToWeekday } from '../../../util/weekday'

const { Title, Text } = Typography
const { Column } = Table

export default class Reports extends Component {
  state = {
    loading: false,
    course: {},
    dates: [],
    studentAttendances: []
  }

  componentDidMount() {
    this.setState({ loading: true })
    const { courseId } = this.props.match.params
    axios.get(`/lecturer/overall-attendance/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${this.props.token}`
      }
    })
      .then(res => {
        console.log(res.data)
        this.setState({
          course: res.data.course,
          dates: res.data.dates,
          studentAttendances: res.data.studentAttendances,
          loading: false
        })
      })
      .catch(err => {
        this.props.onError(err)
        this.setState({ loading: false })
      })
  }

  render() {
    const { course, dates, studentAttendances, loading } = this.state

    let table = (
      <Table
        dataSource={studentAttendances}
        rowKey='id'
        loading={loading}
      >
        <Column title='#' key='#'
          render={(text, record) => studentAttendances.indexOf(record) + 1}
        />
        <Column title='Student ID' dataIndex='id' key='id' />
        <Column title='Student Name' dataIndex='name' key='name' />
        {
          dates.map((date, index) => (
            <Column title={date} key={date}
              render={(text, record) => record.attendances[index]
                ? <Tag>{record.attendances[index]}</Tag>
                : <Tag color='volcano'>Absence</Tag>
              }
            />
          ))
        }
      </Table>
    )

    return (
      <div>
        <NavBreadcrumb
          elements={[
            { key: 1, text: 'Lecturer', to: '/' },
            { key: 2, text: 'Attendance', to: '/courses' },
            { key: 3, text: course.subjectName }
          ]}
        />
        <div style={{ display: course.subjectName ? 'flex' : 'none', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>{course.subjectName} ({studentAttendances.length})</Title>
          <Text>{convertToWeekday(course.weekday)} ({course.periods && course.periods[0]} - {course.periods && course.periods[course.periods.length - 1]}) {course.room}</Text>
        </div>
        {table}
        {/* <h2>May put this in courses page</h2>
        <ul>
          <li>Overall course's info:</li>
          <li>
            <ul>
              <li>Subject name</li>
              <li>Course weekday, periods</li>
              <li>Room code</li>
              <li># of students</li>
              <li>Banned students or warning</li>
            </ul>
          </li>
          <li>Table of reports: </li>
          <li>
            <ul>
              <li>Stt</li>
              <li>Dates of sessions</li>
              <li># of attendees</li>
            </ul>
          </li>
          <li>Filters for course name</li>
          <li>Daily reports</li>
          <li>Ban warning</li>
          <li>Early praises</li>
        </ul> */}
      </div>
    )
  }
}
