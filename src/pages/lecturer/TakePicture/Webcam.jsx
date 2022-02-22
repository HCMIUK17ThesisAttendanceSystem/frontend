import React, { useState } from 'react';
import Webcam from "react-webcam";
import {Button} from 'antd'


// const WebcamComponent = () => <Webcam />;

const videoConstraints = {
    width: 500,
    height: 300,
    facingMode: "user"
};

export const WebcamCapture = () => {

    const [image,setImage]=useState('');
    const webcamRef = React.useRef(null);

    
    const capture = React.useCallback(
        () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImage(imageSrc)
        });


    return (
        <div className="webcam-container">
            <div className="webcam-img">

                {image === '' ? <Webcam
                    audio={false}
                    height={300}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={500}
                    videoConstraints={videoConstraints}
                /> : <img src={image} alt=""/>}
            </div>
            <div>
                {image !== '' ?
                    <Button type='default' onClick={(e) => {
                        e.preventDefault();
                        setImage('')
                    }}
                        className="webcam-btn">
                        Retake Image</Button> :
                    <Button type='default' onClick={(e) => {
                        e.preventDefault();
                        capture();
                    }}
                        className="webcam-btn">Capture</Button>
                }
            </div>
        </div>
    );
};