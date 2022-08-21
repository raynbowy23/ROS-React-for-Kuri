import React, { createContext, useState } from 'react'
import PropTypes from 'prop-types'
import ROSLIB from 'roslib'

// Connect to ROS bridge using websocket
export function connectToROS(ip) {
    var ros = new ROSLIB.Ros({
        url: "ws://localhost:9090",
    });
    ros.on('connection', function () {
        console.log('Connected to websocket server.');
    });
    ros.on('error', function (error) {
        console.log('Error connecting to websocket server: ', error);
    });
    ros.on('close', function () {
        console.log('Connection to websocket server closed.');
    });

    return ros;
}

// Publish a given command to the given topic
export function publishTopic(publisher, cmd) {
	console.log('To ' + publisher.name);
	console.log('Publishing command of type ' + publisher.messageType);
	console.log(cmd)
	publisher.publish(cmd)
}