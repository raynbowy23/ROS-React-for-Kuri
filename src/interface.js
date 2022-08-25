import ROSLIB from 'roslib'
import React from "react";
import './interface.css'
import { Button } from '@mui/material';
import { ArrowForward, ArrowBack, PlayArrow, Redo, Undo, ArrowUpward, ArrowDownward, RotateRight, RotateLeft } from '@mui/icons-material';
import { Grid } from '@mui/material';

import { networkConfig } from './config/network_info.js';
import { publishTopic, connectToROS } from './utils';

// ToDo: Remove commented out double-keypress code

const ros = connectToROS(networkConfig.ip);
const element = document

//// TODO: Checking topics by typing 'rostopics'
// Topics
const JOINTS_TOPIC = '/joint_states';
const VELOCITY_TOPIC = '/mobile_base/commands/velocity';
const EYELIDS_TOPIC = '/eyelids_controller/command';
const HEAD_TOPIC = '/head_controller/command';

// Message types
const TWIST_TYPE = 'geometry_msgs/Twist';
const JOINT_STATE_TYPE = 'sensor_msgs/JointState';
const JOINT_TRAJECTORY_TYPE = 'trajectory_msgs/JointTrajectory';
const JOINT_TRAJECTORY_POINT_TYPE = 'trajectory_msgs/JointTrajectoryPoint'

const LIN_SPEED = 0.2;
const ANG_SPEED = 0.4;

const HEAD_PAN_SPEED = 0.2;
const HEAD_TILT_SPEED = 0.1;

let counter;


// Key is pressed
// key_pressed = true (interval: if ... then send command)
// keyDownSet is updated to contain the pressed key and this is used in the above callback

// so key press has to trigger both an update of the set and creation of interval with a set-dependent callback
// So the callback has to be defined in the scope of the set

// A mouse click interface for users to send commands to Kuri
export class Interface extends React.Component{
  constructor() {
    super();
    console.log("constructed mouse click Interface");
    this.element = element;
    this.ros = ros;
    this.mouseDownSet = new Set();

    this.delta = 500;

    // Records the latest known position of each of the robots' joints
    this.latestPositions = {};
    
    // Listener(s)/Publisher(s)
    this.statesSubscriber = new ROSLIB.Topic({
      ros: ros,
      name: JOINTS_TOPIC,
      messageType: JOINT_STATE_TYPE
    })
    this.velocityPublisher = new ROSLIB.Topic({
      ros: ros,
      name: VELOCITY_TOPIC,
      messageType: TWIST_TYPE
    });
    this.eyesPublisher = new ROSLIB.Topic({
      ros: ros, 
      name: EYELIDS_TOPIC,
      messageType: JOINT_TRAJECTORY_TYPE
    });
    this.headPublisher = new ROSLIB.Topic({
      ros: ros, 
      name: HEAD_TOPIC,
      messageType: JOINT_TRAJECTORY_TYPE
    });

    // configure the joint states subscription
    this.statesSubscriber.subscribe(this.stateUpdaterCallback.bind(this));

    // tracks intervals used by this class
    this.intervals = {};

    this.handleBodyMovement = this.handleBodyForward.bind(this);
    this.handleBodyBackward = this.handleBodyBackward.bind(this);
    this.handleBodyRotRight = this.handleBodyRotRight.bind(this);
    this.handleBodyRotLeft = this.handleBodyRotLeft.bind(this);
    // this.handleHeadUp = this.handleHeadUp.bind(this);
    // this.handleHeadDown = this.handleHeadDown.bind(this);
    this.handleHeadTilt1 = this.handleHeadTilt1.bind(this);
    this.handleHeadTilt2 = this.handleHeadTilt2.bind(this);
    this.handleHeadTilt3 = this.handleHeadTilt3.bind(this);
    this.handleHeadTilt4 = this.handleHeadTilt4.bind(this);
    this.handleHeadTilt5 = this.handleHeadTilt5.bind(this);
    this.handleHeadPan1 = this.handleHeadPan1.bind(this);
    this.handleHeadPan2 = this.handleHeadPan2.bind(this);
    this.handleHeadPan3 = this.handleHeadPan3.bind(this);
    this.handleHeadPan4 = this.handleHeadPan4.bind(this);
    this.handleHeadPan5 = this.handleHeadPan5.bind(this);
    this.handleHeadRight = this.handleHeadRight.bind(this);
    this.handleHeadLeft = this.handleHeadLeft.bind(this);
    this.endHold = this.endHold.bind(this);

    this.lin_x = 0;
    this.ang_z = 0;
    this.goingBackwards = false;

    this.movement = false;

    this.tilt_pos = 3;
    this.pan_pos = 3;
  }

  // Updates the latest positions for Kuri's various joints
  stateUpdaterCallback(msg) {
    let positions = {};
    msg.name.forEach((x, i) => {
      positions[x] = msg.position[i];
    });
    this.latestPositions = positions;
  }

  mDownEvent(event) {
    this.mouseDownSet.add(event.button);
    event.preventDefault();

    return;
  }

  mUpEvent(event) {
    this.mouseDownSet.delete(event.button);
    event.preventDefault();

    return;
  }

  handleBodyForward() {
    // Check for double mouse press (will be deprecated when update)
    let doublePressMod = 1.0;
    let lin_x = 0;
    let ang_z = 0;

    this.movement = true;
    this.backward = false;

    counter = setInterval(() => {
    // Update movement variables (before publishing them)
      // lin_x += doublePressMod * LIN_SPEED * 1;
      lin_x = 0.2; // constant
      ang_z += doublePressMod * ANG_SPEED * 0;
      // track whether the robot is moving and/or reversing
      if (this.movement) {
        // Generate and send the appropriate message
        this.publishVelocityCmd.bind(this)(lin_x, ang_z, this.goingBackwards);
      }
    }, 1000);
  }

  handleBodyBackward() {
    console.log("called body backward");
    let lin_x = 0;
    let ang_z = 0;

    // Check for double mouse press
    let doublePressMod = 1.0;
    this.movement = true;
    this.backward = true;
    counter = setInterval(() => {
      // lin_x += doublePressMod * LIN_SPEED * -1;
      lin_x = -0.2; // constant
      ang_z += doublePressMod * ANG_SPEED * 0;
      if (this.movement) {
        // Generate and send the appropriate message
        this.publishVelocityCmd.bind(this)(lin_x, ang_z, this.goingBackwards);
      }
    }, 1000);
  }

  handleBodyRotRight() {
    let lin_x = 0;
    let ang_z = 0;

    // Check for double mouse press
    let doublePressMod = 1.0;
    this.movement = true;
    this.backward = false;
    counter = setInterval(() => {
      lin_x += doublePressMod * LIN_SPEED * 0;
      // ang_z += doublePressMod * ANG_SPEED * -1;
      ang_z = -0.4;
      if (this.movement) {
        // Generate and send the appropriate message
        this.publishVelocityCmd.bind(this)(lin_x, ang_z, this.goingBackwards);
      }
    }, 1000);
  }

  handleBodyRotLeft() {
    let lin_x = 0;
    let ang_z = 0;

    // Check for double mouse press
    let doublePressMod = 1.0;
    this.movement = true;
    this.backward = false;
    counter = setInterval(() => {
      lin_x += doublePressMod * LIN_SPEED * 0;
      // ang_z += doublePressMod * ANG_SPEED * 1;
      ang_z = 0.4;
      if (this.movement) {
        // Generate and send the appropriate message
        this.publishVelocityCmd.bind(this)(lin_x, ang_z, this.goingBackwards);
      }
    }, 1000);
  }

  // handleHeadUp() {
  //   counter = setInterval(() => {
  //     let pan = HEAD_PAN_SPEED * 0 + this.latestPositions["head_1_joint"];
  //     let tilt = HEAD_TILT_SPEED * -1 + this.latestPositions["head_2_joint"];
  //     this.publishHeadCmd.bind(this)(pan, tilt);
  //   }, 1000);
  // }

  // handleHeadDown() {
  //   counter = setInterval(() => {
  //     let pan = HEAD_PAN_SPEED * 0 + this.latestPositions["head_1_joint"];
  //     let tilt = HEAD_TILT_SPEED * 1 + this.latestPositions["head_2_joint"];
  //     this.publishHeadCmd.bind(this)(pan, tilt);
  //   }, 1000);
  // }

  handleHeadTilt1() {
    // counter = setInterval(() => {
    // }, 1000);
    let pan = this.latestPositions["head_1_joint"];
    // let tilt = -1.0 + this.latestPositions["head_2_joint"];
    let tilt = -1.2;

    this.tilt_pos = 1;
    this.publishHeadCmd.bind(this)(pan, tilt);
  }

  handleHeadTilt2() {
    // counter = setInterval(() => {
    // }, 1000);
    let pan = this.latestPositions["head_1_joint"];
    let tilt = 0;
    if (this.tilt_pos == 1){
      tilt = 0.3 + this.latestPositions["head_2_joint"];
    } else if (this.tilt_pos == 3){
      tilt = -0.3 + this.latestPositions["head_2_joint"];
    } else if (this.tilt_pos == 4){
      tilt = -0.6 + this.latestPositions["head_2_joint"];
    } else if (this.tilt_pos == 5){
      tilt = -0.9 + this.latestPositions["head_2_joint"];
    }
    this.tilt_pos = 2;
    
    this.publishHeadCmd.bind(this)(pan, tilt);
  }

  handleHeadTilt3() {
    let pan = this.latestPositions["head_1_joint"];
    let tilt = 0;
    if (this.tilt_pos == 1){
      tilt = 0.6 + this.latestPositions["head_2_joint"];
    } else if (this.tilt_pos == 2){
      tilt = 0.3 + this.latestPositions["head_2_joint"];
    } else if (this.tilt_pos == 4){
      tilt = -0.3 + this.latestPositions["head_2_joint"];
    } else if (this.tilt_pos == 5){
      tilt = -0.6 + this.latestPositions["head_2_joint"];
    }

    this.tilt_pos = 3;
    this.publishHeadCmd.bind(this)(pan, tilt);
  }

  handleHeadTilt4() {
    let pan = this.latestPositions["head_1_joint"];
    let tilt = 0;
    if (this.tilt_pos == 1){
      tilt = 0.9 + this.latestPositions["head_2_joint"];
    } else if (this.tilt_pos == 2){
      tilt = 0.6 + this.latestPositions["head_2_joint"];
    } else if (this.tilt_pos == 3){
      tilt = 0.3 + this.latestPositions["head_2_joint"];
    } else if (this.tilt_pos == 5){
      tilt = -0.3 + this.latestPositions["head_2_joint"];
    }

    this.tilt_pos = 4;
    this.publishHeadCmd.bind(this)(pan, tilt);
  }

  handleHeadTilt5() {
    let pan = this.latestPositions["head_1_joint"];
    let tilt = 1.5;

    this.tilt_pos = 5;
    this.publishHeadCmd.bind(this)(pan, tilt);
  }

  handleHeadPan1() {
    let pan = 1.2;
    let tilt = this.latestPositions["head_2_joint"];

    this.pan_pos = 1;
    this.publishHeadCmd.bind(this)(pan, tilt);
  }

  handleHeadPan2() {
    let tilt = this.latestPositions["head_2_joint"];
    let pan = 0;

    if (this.pan_pos == 1)
      pan = -0.4 + this.latestPositions["head_1_joint"];
    if (this.pan_pos == 3)
      pan = 0.35 + this.latestPositions["head_1_joint"];
    if (this.pan_pos == 4)
      pan = 0.7 + this.latestPositions["head_1_joint"];
    if (this.pan_pos == 5)
      pan = 1.1 + this.latestPositions["head_1_joint"];

    this.pan_pos = 2;
    this.publishHeadCmd.bind(this)(pan, tilt);
  }

  handleHeadPan3() {
    let tilt = this.latestPositions["head_2_joint"];
    let pan = 0;

    if (this.pan_pos == 1)
      pan = -0.75 + this.latestPositions["head_1_joint"];
    if (this.pan_pos == 2)
      pan = -0.35 + this.latestPositions["head_1_joint"];
    if (this.pan_pos == 4)
      pan = 0.35 + this.latestPositions["head_1_joint"];
    if (this.pan_pos == 5)
      pan = 0.75 + this.latestPositions["head_1_joint"];

    this.pan_pos = 3;
    this.publishHeadCmd.bind(this)(pan, tilt);
  }

  handleHeadPan4() {
    let tilt = this.latestPositions["head_2_joint"];
    let pan = 0;

    if (this.pan_pos == 1)
      pan = -1.1 + this.latestPositions["head_1_joint"];
    if (this.pan_pos == 2)
      pan = -0.7 + this.latestPositions["head_1_joint"];
    if (this.pan_pos == 3)
      pan = -0.35 + this.latestPositions["head_1_joint"];
    if (this.pan_pos == 5)
      pan = 0.4 + this.latestPositions["head_1_joint"];

    this.pan_pos = 4;
    this.publishHeadCmd.bind(this)(pan, tilt);
  }

  handleHeadPan5() {
    let tilt = this.latestPositions["head_2_joint"];
    let pan = -1.5;

    this.pan_pos = 5;
    this.publishHeadCmd.bind(this)(pan, tilt);
  }

  handleHeadRight() {
    counter = setInterval(() => {
      let pan = HEAD_PAN_SPEED * -1 + this.latestPositions["head_1_joint"];
      let tilt = HEAD_TILT_SPEED * 0 + this.latestPositions["head_2_joint"];
      this.publishHeadCmd.bind(this)(pan, tilt);
    }, 1000);
  }

  handleHeadLeft() {
    counter = setInterval(() => {
      let pan = HEAD_PAN_SPEED * 1 + this.latestPositions["head_1_joint"];
      let tilt = HEAD_TILT_SPEED * 0 + this.latestPositions["head_2_joint"];
        this.publishHeadCmd.bind(this)(pan, tilt);
      }, 1000);
  }
  
  endHold() {
    // Interrupts movement when mouse is unholded
    clearInterval(counter);
    this.eStop();
  }

  eStop() {
    const twist = new ROSLIB.Message({
      linear : {
        x : 0.0,
        y : 0.0,
        z : 0.0
      },
      angular : {
        x : 0.0,
        y : 0.0,
        z : 0.0
      }
    });
    publishTopic(this.velocityPublisher, twist);
  }

  publishVelocityCmd(lin_x, ang_z, backwards=false) {
    // If reversing, rotational inputs should be inverted
    const twist = new ROSLIB.Message({
      linear : {
        x : lin_x, // Would be constant velocity
        y : 0.0,
        z : 0.0
      },
      angular : {
        x : 0.0,
        y : 0.0,
        z : backwards ? -ang_z : ang_z
      }
    });
    publishTopic(this.velocityPublisher, twist);
  }

  publishHeadCmd(pan, tilt) {
    const traj = new ROSLIB.Message({
      joint_names: ["head_1_joint", "head_2_joint"],
      points: [{
        positions: [pan, tilt],
        velocities: [0, 0],
        effort: [],
        time_from_start: {
          secs: 1 // might need tweaking (rospy.Time(1))
        }
      }]
    });
    publishTopic(this.headPublisher, traj);
  }

  publishEyesCmd(position) {
    const traj = new ROSLIB.Message({
      joint_names: ["eyelids_joint"],
      points: [{
        positions: [position],
        velocities: [],
        effort: [],
        time_from_start: {
          secs: 1 // might need tweaking (rospy.Time(1))
        }
      }]
    });
    publishTopic(this.eyesPublisher, traj);
  }

  handleResetHead() {
    this.publishHeadCmd(0, 0)
  }

  openEyes() {
    this.publishEyesCmd(0.04);
  }

  smileEyes() {
    this.publishEyesCmd(-0.2); // Might be maximum??
  }

  closeEyes() {
    this.publishEyesCmd(1.0);
  }
  
  render () {
    return (

      <div className="handle_buttons">
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <div className="body_buttons">
              <p id="body_title">BODY</p>
              <div id="body_row">
                {/* <Grid item xs={6} id="left">Move Backward<Button id="body_backward" startIcon={<ArrowBack />} onMouseDown={ this.handleBodyBackward.bind(this) } onMouseUp={ this.endHold.bind(this) } /></Grid>
                <Grid item xs={6} id="right"><Button id="body_forward" startIcon={<ArrowForward />} onMouseDown={ this.handleBodyForward.bind(this) } onMouseUp={ this.endHold.bind(this) } />Move Forward </Grid> */}
                <div id="left">Move Backward<Button id="body_backward" startIcon={<ArrowBack />} onMouseDown={ this.handleBodyBackward.bind(this) } onMouseUp={ this.endHold.bind(this) } /></div>
                <div id="right"><Button id="body_forward" startIcon={<ArrowForward />} onMouseDown={ this.handleBodyForward.bind(this) } onMouseUp={ this.endHold.bind(this) } />Move Forward</div>
              </div>
              <div id="body_row">
                {/* <Grid item xs={6} id="left">    Turn Left<Button id="body_rotleft" startIcon={<Undo />} onMouseDown={ this.handleBodyRotLeft.bind(this) } onMouseUp={ this.endHold.bind(this) } /></Grid>
                <Grid item xs={6} id="right"><Button id="body_rotright" startIcon={<Redo />}onMouseDown={ this.handleBodyRotRight.bind(this) } onMouseUp={ this.endHold.bind(this) } />Turn Right    </Grid> */}
                <div id="left">Turn Left<Button id="body_rotleft" startIcon={<Undo />} onMouseDown={ this.handleBodyRotLeft.bind(this) } onMouseUp={ this.endHold.bind(this) } /></div>
                <div id="right"><Button id="body_rotright" startIcon={<Redo />} onMouseDown={ this.handleBodyRotRight.bind(this) } onMouseUp={ this.endHold.bind(this) } />Turn Right</div>
              </div>
            {/* <Grid item xs={6}>
              <div id="body_row">
                <label>Move Backward<Button id="body_backward" startIcon={<ArrowBack />} onMouseDown={ this.handleBodyBackward.bind(this) } onMouseUp={ this.endHold.bind(this) } /></label>
                <label>Turn Left<Button id="body_rotleft" startIcon={<Undo />} onMouseDown={ this.handleBodyRotLeft.bind(this) } onMouseUp={ this.endHold.bind(this) } /></label>
              </div>
            </Grid>
            <Grid item xs={6}>
                <label><Button id="body_forward" startIcon={<ArrowForward />} onMouseDown={ this.handleBodyForward.bind(this) } onMouseUp={ this.endHold.bind(this) } />Move Forward</label>
                <label><Button id="body_rotright" startIcon={<Redo />}onMouseDown={ this.handleBodyRotRight.bind(this) } onMouseUp={ this.endHold.bind(this) } />Turn Right</label>
            </Grid> */}
            </div>
            <div className="eye_buttons">
              <p id="eye_title">EYES</p>
              <div id="body_row">
                <Button id="eye_open" onClick={ this.openEyes.bind(this) } >Open&nbsp;</Button>
                <Button id="eye_smile" onClick={ this.smileEyes.bind(this) } >Smile</Button>
                <Button id="eye_close" onClick={ this.closeEyes.bind(this) } >Close</Button>
              </div>
            </div>
          </Grid>
          <Grid item xs={6}>
            <div className="head_buttons">
              <p id="head_title">HEAD</p>
              <Grid item xs={12}>
                <div id="body_row">
                  {/* <label>Move Down<Button id="head_down" startIcon={<ArrowDownward />} onMouseDown={ this.handleHeadDown.bind(this) } onMouseUp={ this.endHold.bind(this) } /></label>
                  <label><Button id="head_up" startIcon={<ArrowUpward />} onMouseDown={ this.handleHeadUp.bind(this) } onMouseUp={ this.endHold.bind(this) } />Move Up</label> */}
                  <Button id="head_tilt" onClick={ this.handleHeadTilt1.bind(this) } >Most Up</Button>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div id="body_row">
                  {/* <label>Move Left<Button id="head_left" startIcon={<RotateLeft />} onMouseDown={ this.handleHeadLeft.bind(this) } onMouseUp={ this.endHold.bind(this) } /></label>
                  <label><Button id="head_right" startIcon={<RotateRight />} onMouseDown={ this.handleHeadRight.bind(this) } onMouseUp={ this.endHold.bind(this) } />Move Right</label> */}
                  <Button id="head_tilt" onClick={ this.handleHeadTilt2.bind(this) } >Up</Button>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div id="body_row">
                  <Grid item xs={3}>
                    <span></span>
                    <Button id="head_pan" onClick={ this.handleHeadPan1.bind(this) } >Most Left&nbsp;</Button>
                    <span></span>
                  </Grid>
                  <Grid item xs={2}>
                    <span></span>
                    <Button id="head_pan" onClick={ this.handleHeadPan2.bind(this) } >Left&nbsp;</Button>
                    <span></span>
                  </Grid>
                  <Grid item xs={2} className="center">
                    <Button id="head_tilt" className="tilt_center" onClick={ this.handleHeadTilt3.bind(this) } >Tilt Center</Button>
                    <Button id="head_pan" className="pan_center" onClick={ this.handleHeadPan3.bind(this) } >Pan Center</Button>
                  </Grid>
                  <Grid item xs={2}>
                    <span></span>
                    <Button id="head_pan" onClick={ this.handleHeadPan4.bind(this) } >Right</Button>
                    <span></span>
                  </Grid>
                  <Grid item xs={3}>
                    <span></span>
                    <Button id="head_pan" onClick={ this.handleHeadPan5.bind(this) } >Most Right</Button>
                    <span></span>
                  </Grid>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div id="body_row">
                  <Button id="head_tilt" onClick={ this.handleHeadTilt4.bind(this) } >Down</Button>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div id="body_row">
                  <Button id="head_tilt" onClick={ this.handleHeadTilt5.bind(this) } >Most Down</Button>
                </div>
              </Grid>
              {/* <div id="body_row">
                <Button id="head_reset" onMouseDown={ this.handleResetHead.bind(this) } onMouseUp={ this.endHold.bind(this) } >Reset Head</Button>
              </div> */}
            </div>
          </Grid>
        </Grid>
      </div>
    )
  }

}