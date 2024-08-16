import React, { Component } from "react";
import Modal from "./components/Modal";
import ActivityFinder from "./components/ActivityFinder";
import axios from "axios";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewCompleted: false,
      todoList: [],
      modal: false,
      finder: false,
      activeItem: {
        title: "",
        description: "",
        completed: false,
      },
      location: "",
      duration: "",
      interests: "",
      limit: "5",
      message: "",
      response: "",
    };
  }

  componentDidMount() {
    this.refreshList();
  }

  refreshList = () => {
    axios
      .get("/api/tasks/")
      .then((res) => this.setState({ todoList: res.data }))
      .catch((err) => console.log(err));
  };

  toggle = () => {
    this.setState({ modal: !this.state.modal });
  };

  handleSubmit = (item) => {
    this.toggle();

    if (item.id) {
      axios
        .put(`/api/tasks/${item.id}/`, item)
        .then((res) => this.refreshList());
      return;
    }
    axios
      .post("/api/tasks/", item)
      .then((res) => this.refreshList());
  };

  
  handleFindSubmit = (location, duration, interests, limit) => {
    //e.preventDefault();
    this.setState({location: location, duration: duration, interests: interests, limit: limit})
    try {
      axios
        .post('http://127.0.0.1:8000/api/find-activities/', 
          { location: location, duration: duration, interests: interests, limit: limit })
        .then((res) => 
          { this.toggleFinder();
            this.refreshList(); })
        // if we really wanted to catch the error to handle it
        // uncomment below
        //.catch((error) => {
        //  console.error('Error calling /find-activities/:', error);
        //})
        ;
    } catch (error) {
      console.error('Error setting up axios call', error);
    }
  };

  handleChatSubmit = (e) => {
    e.preventDefault();

    try {
      axios
        .post('http://127.0.0.1:8000/api/generate-text/', { prompt: this.state.message })
        .then((res) => this.setState({ response: res.data["data"] }));
    } catch (error) {
      console.error('Error chatting with GPT:', error);
    }
  };  

  handleDelete = (item) => {
    axios
      .delete(`/api/tasks/${item.id}/`)
      .then((res) => this.refreshList());
  };

  toggleFinder = () => {
    this.setState({ finder: !this.state.finder });
  };

  findActivities = () => {
    this.setState({ finder: !this.state.finder });
  };

  createItem = () => {
    const item = { title: "", description: "", completed: false };

    this.setState({ activeItem: item, modal: !this.state.modal });
  };

  editItem = (item) => {
    this.setState({ activeItem: item, modal: !this.state.modal });
  };

  displayCompleted = (status) => {
    if (status) {
      return this.setState({ viewCompleted: true });
    }

    return this.setState({ viewCompleted: false });
  };

  renderTabList = () => {
    return (
      <div className="nav nav-tabs">
        <span
          onClick={() => this.displayCompleted(true)}
          className={this.state.viewCompleted ? "nav-link active" : "nav-link"}
        >
          Complete
        </span>
        <span
          onClick={() => this.displayCompleted(false)}
          className={this.state.viewCompleted ? "nav-link" : "nav-link active"}
        >
          Incomplete
        </span>
      </div>
    );
  };

  renderItems = () => {
    const { viewCompleted } = this.state;
    const newItems = this.state.todoList.filter(
      (item) => item.completed === viewCompleted
    );

    return newItems.map((item) => (
      <tr>    
        <td>
          {item.title}
        </td>
        <td>
          {item.description}
        </td>
        <td>
          {item.duration}
        </td>
        <td>
          {item.cost}
        </td>
        <td>
          {item.notes}
        </td>
        <td>
          <button
            className="btn btn-secondary mr-2"
            onClick={() => this.editItem(item)}
          >
            Edit
          </button>
          <button
            className="btn btn-danger"
            onClick={() => this.handleDelete(item)}
          >
            Delete
          </button>
        </td>
      </tr>
    ));
  };

  render() {
    return (
      <main className="container">
        <h1 className="text-uppercase text-center my-4">Activity Planner</h1>
        <h4 className="text-center my-4">Planning a trip or just looking for something to do?  Use the Activity Planner to find activities that suit YOUR interests!</h4>
        <div className="row">
          <div className="col-md-12 col-sm-10 mx-auto p-0">
            <div className="card p-3">
              <div className="mb-4">
                <button
                  className="btn btn-primary mx-1"
                  onClick={this.createItem}
                >
                  Add Activity
                </button>
                <button
                  className="btn btn-primary"
                  onClick={this.findActivities}
                >
                  Find Activities
                </button>

              </div>
              {this.renderTabList()}
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">Activity</th>
                    <th scope="col">Description</th>
                    <th scope="col">Time</th>
                    <th scope="col">Cost</th>
                    <th scope="col">Notes</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>              
                {this.renderItems()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {this.state.modal ? (
          <Modal
            activeItem={this.state.activeItem}
            toggle={this.toggle}
            onSave={this.handleSubmit}
          />
        ) : null}
        {this.state.finder ? (
          <ActivityFinder
            location={this.state.location}
            duration={this.state.duration}
            interests={this.state.interests}
            limit={this.state.limit}
            toggle={this.toggleFinder}
            onFind={this.handleFindSubmit}
          />
        ) : null}
        <div className="row text-center">
          <h2>Summarize tasks with GPT</h2>
          <form onSubmit={this.handleChatSubmit}>
            <textarea
              value={this.state.message}
              onChange={(e) => this.setState({ message: e.target.value })}
              rows="4"
              cols="50"
            />
            <br/>
            <button className="btn btn-primary" type="submit">Send</button>
          </form>
          {this.state.response && (
            <div>
              <h2>Response:</h2>
              <p>{this.state.response}</p>
            </div>
          )}
        </div>        
      </main>
    );
  }
}

export default App;
