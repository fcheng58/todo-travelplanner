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

  
  handleFindSubmit = (location, duration, interests) => {
    //e.preventDefault();
    this.setState({location: location, duration: duration, interests: interests})
    try {
      axios
        .post('http://127.0.0.1:8000/api/find-activities/', 
          { location: location, duration: duration, interests: interests })
        .then((res) => 
          { this.toggleFinder();
            this.refreshList(); })
        .catch((error) => {
          console.error('Error calling /find-activities/:', error);
        });
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
//    const item = { location: this.state.location, duration: this.state.duration, interests: this.state.interests };

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
      <li
        key={item.id}
        className="list-group-item d-flex justify-content-between align-items-center"
      >
        <span
          className={`todo-title mr-2 ${
            this.state.viewCompleted ? "completed-todo" : ""
          }`}
          title={item.description}
        >
          {item.title}
        </span>
        <span>
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
        </span>
      </li>
    ));
  };

  render() {
    return (
      <main className="container">
        <h1 className="text-uppercase text-center my-4">Todo app</h1>
        <div className="row">
          <div className="col-md-6 col-sm-10 mx-auto p-0">
            <div className="card p-3">
              <div className="mb-4">
                <button
                  className="btn btn-primary"
                  onClick={this.createItem}
                >
                  Add task
                </button>
                <button
                  className="btn btn-primary"
                  onClick={this.findActivities}
                >
                  Find Activities
                </button>

              </div>
              {this.renderTabList()}
              <ul className="list-group list-group-flush border-top-0">
                {this.renderItems()}
              </ul>
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
            interests={this.state.duration}
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
