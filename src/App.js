import React, { Component } from "react";
import {
  Container,
  Divider,
  Header,
  Image,
  Menu,
  Segment,
  Form,
  Card,
  Label,
  Message
} from 'semantic-ui-react';
import { AgGridReact } from "ag-grid-react";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      rowData: null,
      tableData: {
        columnDefs: [
          { headerName: "Name", field: "name", sortable: true, filter: true, cellRenderer: nameFormatter },
          { headerName: "Description", field: "description", sortable: true, filter: true },
          { headerName: "Clone URL", field: "clone_url", sortable: true, filter: true, cellRenderer: cloneUrlFormatter },
          { headerName: "Last Update", field: "updated_at", sortable: true, filter: true },
          { headerName: "Language", field: "language", sortable: true, filter: true },
        ],

        paginationPageSize: 10,
        pagination: true,
        animateRows: true,
        domLayout: "autoHeight",
        sizeColumnsToFit: true
      },
      userData: {
        name: "",
        imageUrl: "",
        repoUrl: "",
        reposCnt: 0,
        bio: ""
      },
      searchOptions: [
        { key: '', text: 'Select type', value: '' },
        { key: 'users', text: 'Users', value: 'users' },
        { key: 'org', text: 'Organization', value: 'org' },
      ],
      searchText: "",
      searchkey: "",
      submittedText: "",
      submittedKey: "",
      errorMessageText: "",
      isError: false
    };
    this.fnClickSearch = this.fnClickSearch.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.headleSelect = this.headleSelect.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.submittedText !== this.state.submittedText || prevState.submittedKey !== this.state.submittedKey) {
      var username = this.state.submittedText;
      var url = (this.state.submittedKey === "org" ? "https://api.github.com/orgs/" + username + "/repos" : "https://api.github.com/users/" + username + "/repos")
      var bioUrl = (this.state.submittedKey === "org" ? "https://api.github.com/orgs/" + username : "https://api.github.com/users/" + username);
      fetch(url).then(response => response.json()).then(json => {
        if (json.length > 0) {
          this.setState({
            rowData: json,
            isLoaded: true,
            errorMessageText: "Loading data...",
            isError: false
          });
        } else {
          this.setState({
            rowData: [],
            isLoaded: false,
            errorMessageText: "No data found",
            isError: true
          });
        }

      }).catch(error => {
        console.log(error);
      });

      fetch(bioUrl).then(resp => resp.json()).then(jsonData => {
        var ownerData = jsonData;
        this.setState({
          userData: {
            name: ownerData.name,
            imageUrl: ownerData.avatar_url,
            repoUrl: ownerData.url,
            reposCnt: ownerData.public_repos,
            bio: ownerData.bio || ownerData.description
          }
        });
      }).catch(error => {
        console.log(error);
      });
    }
  }
  handleChange(e, { name, value }) {
    this.setState({ searchText: value });
  }
  headleSelect(e, { name, value }) {
    this.setState({ searchkey: value });
  }

  fnClickSearch() {
    if (this.state.searchText.length > 0 && this.state.searchkey.length > 0) {
      this.setState({
        submittedText: this.state.searchText,
        submittedKey: this.state.searchkey,
        errorMessageText: "",
        isError: false
      });
    } else {
      this.setState({
        errorMessageText: "Please fill the form to continue",
        isError: true
      });
    }
  }
  onGridReady = (params) => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    params.api.sizeColumnsToFit();
    window.addEventListener('resize', function () {
      setTimeout(function () {
        params.api.sizeColumnsToFit();
      });
    });

    params.api.sizeColumnsToFit();
  };
  render() {
    var { isLoaded, searchOptions, searchText, searchkey, userData, errorMessageText, isError } = this.state;
    var html = "";
    var header = <Menu fixed='top' inverted>
      <Container>
        <Menu.Item as='a' header>
          <Image src='https://assets-global.website-files.com/5d779dddc494dd2921fdd1b2/6025443a144087099abb16e5_01_Builder.ai_C.svg' style={{ marginRight: '1.5em' }} />
          Builder AI Demo
        </Menu.Item>
      </Container>
    </Menu>;
    var errHtml = "";
    if (isError) {
      errHtml = <Message negative>{errorMessageText}</Message>;
    }
    var inputSearch = <Container style={{ marginTop: '5rem' }}>
      <Header as='h1'>Builder AI demo</Header>
      <p>Contain a form where you can enter a Github username or organisation.</p><p>
        Once the form is submitted, it returns a paginated list of public repositories for this specific user or organisation.
      </p><p>The results table must be paginated, sortable and filterable by all the options available on the API. </p>
      <Divider
        as='h4'
        className='header'
        horizontal
        style={{ margin: '3em 0em', textTransform: 'uppercase' }}
      >
        Please fill the form to Search
      </Divider>
      {errHtml}
      <Form onSubmit={this.fnClickSearch}>
        <Form.Group widths='equal'>
          <Form.Input
            value={searchText}
            placeholder='Name of the repo'
            onChange={this.handleChange}
          />
          <Form.Select
            options={searchOptions}
            placeholder='Select Type of repo'
            data-testid="selecttyperepo"
            value={searchkey}
            required={true}
            fluid
            onChange={this.headleSelect}
          />
        </Form.Group>
        <Form.Button content='Search' primary size='huge' />
      </Form>
    </Container>
    if (isLoaded) {
      html = <Container style={{ marginTop: '3rem' }}>
        <Divider
          as='h4'
          className='header'
          horizontal
          style={{ margin: '3em 0em', textTransform: 'uppercase' }}
        >
          Repos of {searchkey}:{searchText}
        </Divider>
        <Segment attached="bottom">
          <div style={{ width: '100%', height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
              <div style={{ overflow: 'hidden', flexGrow: '1' }}>
                <div className="ag-theme-alpine" style={{ width: '100%', height: '100%' }} >
                  < AgGridReact
                    animateRows={this.state.tableData.animateRows}
                    pagination={this.state.tableData.pagination}
                    paginationPageSize={this.state.tableData.paginationPageSize}
                    columnDefs={this.state.tableData.columnDefs}
                    domLayout={this.state.tableData.domLayout}
                    sizeColumnsToFit={this.state.tableData.sizeColumnsToFit}
                    rowData={this.state.rowData}
                    onGridReady={this.onGridReady}
                  >
                  </AgGridReact >
                </div >
              </div>
              <div style={{ backgroundColor: '#000', padding: '5rem' }}>
                <Segment raised>
                  <Label as='a' color='red' ribbon>
                    {userData.reposCnt} repos
                  </Label>
                  <Card>
                    <Card.Content>
                      <Image src={userData.imageUrl} size="medium" floated='right' />
                      <Card.Header>{userData.name}</Card.Header>
                      <Card.Description>{userData.bio}</Card.Description>
                    </Card.Content>
                  </Card>
                </Segment>
              </div>
            </div>
          </div>
        </Segment>
      </Container >;
    }
    return (
      <div className="App">{header}
        <Container style={{ margin: 20 }}>
          {inputSearch}
          {html}
        </Container>

      </div>
    );
  }
}

function nameFormatter(params) {
  return '<a href="' + params.data.html_url + '" target="_blank">' + params.value + '</a>';
}
function cloneUrlFormatter(params) {
  return '<a href="' + params.data.clone_url + '" target="_blank">' + params.value + '</a>';
}

export default App;
