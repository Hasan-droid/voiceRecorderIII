import { createElement, useState } from "react";
import { Button, View, Text } from "react-native";
import { HelloWorld } from "./components/HelloWorld";
import AudioRecorderPlayer from "react-native-audio-recorder-player";

export function VoiceRecorderIII({ yourName, style }) {
    const [recordSecs, setRecordSecs] = useState(0);
    const [recordTime, setRecordTime] = useState("00:00:00");
    const [currentPositionSec, setCurrentPositionSec] = useState(0);
    const [currentDurationSec, setCurrentDurationSec] = useState(0);
    const [playTime, setPlayTime] = useState("00:00:00");
    const [duration, setDuration] = useState("00:00:00");
    const audioRecorderPlayer = new AudioRecorderPlayer();

    const onStartRecord = () => {
        console.log("onStartRecord");
        audioRecorderPlayer
            .startRecorder()
            .then(result => {
                console.info("onStartRecord", result);
                audioRecorderPlayer.addRecordBackListener(e => {
                    setRecordSecs(e.currentPosition);
                    setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
                    console.log("onStartRecord", result);
                    return;
                });
            })
            .catch(err => {
                console.error(err);
            });
    };

    const onStopRecord = () => {
        audioRecorderPlayer
            .stopRecorder()
            .then(result => {
                console.info("onStopRecord", result);
                audioRecorderPlayer.removeRecordBackListener();
                setRecordSecs(0);
            })
            .catch(err => {
                console.error(err);
            });
    };

    const onStartPlay = () => {
        console.info("onStartPlay");
        audioRecorderPlayer.startPlayer
            .then(result => {
                console.info("onStartPlay", result);
                audioRecorderPlayer.addPlayBackListener(e => {
                    setCurrentPositionSec(e.currentPosition);
                    setCurrentDurationSec(e.duration);
                    setPlayTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
                    setDuration(audioRecorderPlayer.mmssss(Math.floor(e.duration)));
                    return;
                });
            })
            .catch(err => {
                console.error(err);
            });
    };
    return (
        <View>
            <Button title={`start`} style={style} onPress={() => onStartRecord()} />
            <Button title={`stop`} style={style} onPress={() => onStopRecord()} />
            <Button title={`play!`} style={style} onPress={() => onStartPlay()} />
        </View>
    );
}
