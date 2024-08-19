import React, { Component } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap";

export default class ActivityFinder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // These values are not store in db
      // but are kept in state so user does not need to re-enter
      location: this.props.location,
      interests: this.props.interests,
      duration: this.props.duration,
      limit: this.props.limit
    };
  }


  render() {
    const { toggle, onFind } = this.props;

    return (
      <Modal isOpen={true} toggle={toggle}>
        <ModalHeader toggle={toggle}>Find Activities</ModalHeader>
        <ModalBody  style={{ cursor: this.props.gettingData ? 'wait' : 'default' }}>
          <Form> 
            <FormGroup>
              <Label for="location-title">Location of activities</Label>
              <Input
                type="text"
                id="location-title"
                name="location"
                value={this.state.location}
                onChange={e => this.setState({location : e.target.value})}
                placeholder='example: "London" or "Paris, France"'
              />
            </FormGroup>
            <FormGroup>
              <Label for="location-duration">How long will you be staying?</Label>
              <Input
                type="text"
                id="location-duration"
                name="duration"
                value={this.state.duration}
                onChange={e => this.setState({duration : e.target.value})}
                placeholder='example: "2 days" or "3 hours"'
              />
            </FormGroup>
            <FormGroup>
              <Label for="interests">Describe any special activities or circumstances to refine your search (optional)</Label>
              <Input
                type="textarea"
                id="interests"
                name="interests"
                value={this.state.interests}
                onChange={e => this.setState({interests : e.target.value})}
                placeholder='example: "I enjoy a mix of culture, history, good food and outdoor activities" or "Celebrate a 10 year anniversary."'
              />
            </FormGroup>
            <FormGroup>
              <Label for="limit">Limit activities to:</Label>
              <Input
                type="number"
                id="limit"
                name="limit"
                value={this.state.limit}
                pattern="\d+"
                onChange={e => this.setState({limit : e.target.value})}
                placeholder="Enter number of activites"
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            style={{ cursor: this.props.gettingData ? 'wait' : 'default' }}
            color="success"
            onClick={() => onFind(this.state.location, this.state.duration, this.state.interests, this.state.limit)}
          >
            Find Activities
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
