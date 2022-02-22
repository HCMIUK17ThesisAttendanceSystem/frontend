import React, {  } from 'react'
import './TakePicture.css'
import { WebcamCapture} from './Webcam'
import {Button} from 'antd'


const TakePicture = () => {



    const submitForm = () => {
        alert("Form submitted");
    }


    return (
        <div className="home-container">
            <div className="container">
                <div className="text">
                    <h2>Check attendance using Webcam</h2>
                    <form className="form">
                        <WebcamCapture/>
                        
                        <Button type='primary' id="login-button" onClick={(e) => submitForm(e)}>Submit</Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
export default TakePicture