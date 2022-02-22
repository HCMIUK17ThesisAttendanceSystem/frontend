import React, { Component } from 'react'
import {  Space,Table, Tag, Switch } from 'antd'
import { CloseOutlined, CheckOutlined } from '@ant-design/icons'
import NavBreadcrumb from '../../../components/Navigation/NavBreadcrumb/NavBreadcrumb'
import AntForm from '../../../components/AntForm/AntForm'

const { Column } = Table;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export default class StudentList extends Component {
  state = {
    loading: false,
    submitLoading: -1,
    checkingStudentId: '',
    isManuallyCheckingAttendance: false,
    showNoteModal: false,
    newAttendanceLoading: false,
    currentCourse: null,
    courseStudents: [],
    showSettingsModal: false,
    settings: {
      isManual: false,
      manualNote: ''
    }
  }

  render() {
    const {
      loading, submitLoading,
      showSettingsModal, settings, courseStudents
    } = this.state

    const settingsForm = (
      <AntForm
        visible={showSettingsModal}
        title={'Class Settings'}
        layout={{ ...layout }}
        id={'settingsForm'}
        initialValues={settings}
        onFinish={this.onSettingsChanged}
        onFinishFailed={null}
        onCancel={this.onToggleShowSettings}
      >
        
      </AntForm>
    )


    const table = (
      <Table
        dataSource={courseStudents}
        rowKey='_id'
        loading={loading}
        pagination={!settings.isManual && {
          total: courseStudents.length,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} students`,
          defaultPageSize: 5,
          defaultCurrent: 1
        }}
      >
        <Column
          title='Student ID'
          key='id'
          dataIndex='id'
          defaultSortOrder={'descend'}
          sorter={{
            compare: (a, b) => a.id.localeCompare(b.id),
            multiple: 1
          }}
        />
        <Column
          title='Student Name'
          key='name'
          dataIndex='name'
        />
        <Column
          title='Checking'
          key='checking'
          render={(text, record) => (
            <>
              {
                Array.isArray(record.checking)
                  ? record.checking.map(tag => {
                    let color = tag.length < 6 ? 'green' : 'gold';
                    if (tag === 'Has not checked')
                      color = 'volcano';
                    return (
                      <Tag color={color}>
                        {tag}
                      </Tag>
                    );
                  })
                  : <Tag color={'green'}>
                    {record.checking}
                  </Tag>
              }
            </>
          )}
          defaultSortOrder={!settings.isManual && 'descend'}
          sorter={!settings.isManual && {
            compare: (a, b) => a.checking[0].localeCompare(b.checking[0]),
            multiple: 2
          }} />
        <Column
          title='Action'
          key='action'
          render={(text, record, index) => (
            <Space size='middle'>
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                checked={record.checking[0] !== 'Has not checked'}
                loading={submitLoading === index}
                onChange={(checked) => settings.isManual
                  ? this.onCheckingAttendance({ note: settings.manualNote }, record._id, index)
                  : this.onToggleCheckAttendance(record._id, checked, index)
                }
              />
            </Space>
          )}
        />
      </Table>
    )

    return (
      <div>
        <NavBreadcrumb
          elements={[
            { key: 1, text: 'Lecturer', to: '/' },
            { key: 2, text: 'Student Attendance List' },
          ]}
        />
        {settingsForm}
       
        
        <div style={{ marginTop: '20px' }}>
          {table}
        </div>
        {/* <Divider>Note:</Divider>
        <p>The lecturer's dashboard contains:</p>
        <ul>
          <li>Attendance heartbeats of courses in a slide</li>
          <li>Upcoming course</li>
          <li>or current course (with number of present students)</li>
          <li>Warning of upcoming banned final</li>
          <li>Leave/off requests</li>
          <li>Available reports (quick download excel files)</li>
          <li>On demand helps</li>
          <li>Annoucements</li>
          <li>Bug reporting</li>
        </ul> */}
      </div>
    )
  }
}
