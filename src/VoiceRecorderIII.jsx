/*eslint-disable*/
import { createElement, useState, useEffect } from "react";
import { Button, View, Text, PermissionsAndroid } from "react-native";
import Permissions from "react-native-permissions";
import Sound from "react-native-sound";
import AudioRecord from "react-native-audio-record";
import { Buffer } from "buffer";
export function VoiceRecorderIII({ yourName, style }) {
    let sound = null;
    const [recording, setRecording] = useState(false);
    const [audioFile, setAudioFile] = useState("");
    const [loaded, setLoaded] = useState(false);
    const [paused, setPaused] = useState(true);
    const [lastSound, setLastSound] = useState(null);
    useEffect(() => {
        checkPermission()
            .then(() => {
                const options = {
                    sampleRate: 16000, // default 44100
                    channels: 1, // 1 or 2, default 1
                    bitsPerSample: 16, // 8 or 16, default 16// android only (see below)
                    wavFile: "test.wav" // default 'audio.wav'
                };
                AudioRecord.init(options);
                console.info("AudioRecord", AudioRecord);
                AudioRecord.on("data", data => {
                    // base64-encoded audio data chunks
                    console.info("data", data);
                    const chunk = Buffer.from(data, "base64");
                    console.info("chunk size", chunk.byteLength);
                });
            })
            .catch(e => {
                console.error("permission denied", e);
            });
    }, []);

    const requestPremission = () => {
        console.info("request permission permissions", Permissions);
        Permissions.request("microphone").then(response => {
            console.info("request permission", response);
        });
    };

    const checkPermission = async () => {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
            title: "Microphone Permission",
            message: "App needs access to your microphone ",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
        });
        const p = await Permissions.check("microphone");
        console.info("permission", p);

        if (p === "authorized") {
            console.info("permission granted");
            return true;
        }
        requestPremission();
    };

    const start = () => {
        console.info("start recording", AudioRecord);
        setAudioFile("");
        setRecording(true);
        setLoaded(false);
        AudioRecord.start();
    };

    const stop = async () => {
        if (!recording) return;
        let audioFile = await AudioRecord.stop();
        setAudioFile(audioFile);
        setRecording(false);
    };

    const load = () => {
        return new Promise((resolve, reject) => {
            if (!audioFile) {
                return reject("file path is empty");
            }

            sound = new Sound(audioFile, "", error => {
                if (error) {
                    console.info("failed to load the sound", error);
                    return reject(error);
                }
                setLastSound(sound);
                setLoaded(true);
                return resolve();
            });
        });
    };

    const play = async () => {
        if (!loaded) {
            try {
                await load();
            } catch (e) {
                console.error("sound not loaded", e);
            }
        }
        setPaused(false);
        Sound.setCategory("Playback");
        console.info("start playing", sound);
        if (sound === null) {
            sound = lastSound;
        }
        sound.play(success => {
            if (success) {
                console.info("successfully finished playing");
                setPaused(true);
            } else {
                console.info("playback failed due to audio decoding errors");
            }
        });

        setPaused(false);
    };

    const pause = () => {
        if (!sound) {
            sound = lastSound;
        }
        sound.pause();
        setPaused(true);
    };

    return (
        <View>
            <Button title="Start" onPress={start} disabled={recording} />
            <Button title="stop" onPress={stop} disabled={!recording} />
            {paused ? ( // if paused then show play button
                <Button title="play" onPress={play} disabled={!audioFile} />
            ) : (
                <Button title="pause" onPress={pause} disabled={!audioFile} />
            )}
        </View>
    );
}
