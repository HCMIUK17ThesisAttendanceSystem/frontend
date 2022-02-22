import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import fileSaver from 'file-saver'
import { Table, Space, Button, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import Highlighter from 'react-highlight-words'
import NavBreadcrumb from '../../../components/Navigation/NavBreadcrumb/NavBreadcrumb'
import axios from '../../../axios-instance'
import { convertToWeekday } from '../../../util/weekday'

const { Column } = Table;

export default class Courses extends Component {
  state = {
    courses: [],
    subjects: [],
    students: [],
    searchText: '',
    searchedColumn: '',
    loading: false
  }

  componentDidMount() {
    this.setState({ loading: true });
    axios.get('/lecturer/courses', {
      headers: {
        'Authorization': `Bearer ${this.props.token}`
      }
    })
      .then(res => {
        console.log(res.data)
        const { courses, subjects, students } = res.data
        this.setState({
          courses,
          subjects,
          students,
          loading: false
        })
      })
      .catch(err => {
        this.props.onError(err)
        this.setState({ loading: false })
      });
  }

  downloadOverallReport = (courseId) => {
    this.setState({ loading: true });
    axios.get(`/lecturer/download-report/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${this.props.token}`
      },
      responseType: 'arraybuffer'
    })
      .then(res => {
        const dirtyFileName = res.headers['content-disposition'];
        // const regex = /filename[^;=\n]*=(?:(\\?['"])(.*?)\1|(?:[^\s]+'.*?')?([^;\n]*))/;
        // let fileName = dirtyFileName.match(regex)[3];
        let blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fileSaver.saveAs(blob, dirtyFileName);
        this.setState({
          loading: false
        });
      })
      .catch(err => {
        this.props.onError(err)
        this.setState({ loading: false })
      });
  }

  getSubject = (subjectId) => this.state.subjects.find(subject => subject._id === subjectId);

  getStudent = (studentId) => this.state.students.find(student => student._id === studentId);

  // Search
  // _______
  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              this.setState({
                searchText: selectedKeys[0],
                searchedColumn: dataIndex,
              });
            }}
          >
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select(), 100);
      }
    },
    render: text =>
      this.state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };
  // _______

  render() {
    const { courses, loading/*, subjects, students*/ } = this.state;

    const table = (
      <Table dataSource={courses} rowKey='_id' loading={loading}>
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
        // {...this.getColumnSearchProps('classType')}
        />
        <Column
          title='Class Type'
          key='classType'
          render={(text, record) => (
            record.classType === "0" ? "Theory" : "Laboratory"
          )}
          filters={[
            {
              text: 'Theory',
              value: '0'
            },
            {
              text: 'Laboratory',
              value: '1'
            }
          ]}
          filterMultiple={false}
          onFilter={(value, record) => record.classType.indexOf(value) === 0}
        />
        <Column
          title='Room'
          key='room'
          render={(text, record) => record.roomId && record.roomId.code}
        />
        <Column
          title='Weekday'
          key='weekday'
          render={(text, record) => convertToWeekday(record.weekday)}
          defaultSortOrder='ascend'
          sorter={(a, b) => a.weekday - b.weekday}
        />
        <Column
          title='Periods'
          key='periods'
          render={(text, record) => (
            record.periods[0] + '-' + record.periods[record.periods.length - 1]
          )}
          defaultSortOrder='ascend'
          sorter={(a, b) => a.periods[0] - b.periods[0]}
        />
        <Column
          title='Student Number'
          key='studentNum'
          render={(text, record) => (
            record.regStudentIds.length
          )}
        />
        <Column
          title='Action'
          key='action'
          render={(text, record) => (
            <Space size='middle'>
              <Button type='primary'><Link to={`/reports/${record._id}`}>View attendances</Link></Button>
              <Button type='default' onClick={() => this.downloadOverallReport(record._id)}>Download report</Button>
              {/* <Button onClick={() => this.toggleUpdate(record._id)} type='default'>Update</Button> */}
            </Space>
          )}
        />
      </Table>
    );
    return (
      <div>
        <NavBreadcrumb
          elements={[
            { key: 1, text: 'Lecturer', to: '/' },
            { key: 2, text: 'Courses' },
          ]}
        />
        {table}
        {/* <ul>
          <li>Table for courses</li>
          <li>
            <ul>
              <li>Subject ID</li>
              <li>Subject name</li>
              <li>Subject type</li>
              <li>Course classroom</li>
              <li>Course periods</li>
              <li># of students</li>
              <li>act View course details</li>
              <li>act Edit policy</li>
              <li>act Download excel reports</li>
            </ul>
          </li>
          <li>Filters for type, periods</li>
          <li>Search for course name</li>
        </ul> */}
      </div>
    )
  }
}