import { Flex, Button } from "@aws-amplify/ui-react";
import React from "react";

import Buckimg from "../photos/transparentdeer.png"

export default function Navbar(props) {
    return (
        <div className="navbar">
            <h1>Buckfit</h1>
            <img src={Buckimg} id="Buckimg"/>
            <div className="Button Container">
                <Button onClick={props.hide}>View Workouts</Button>
                <Button onClick={props.show}>Workout Builder</Button>
            </div>
            
        </div>
    )}