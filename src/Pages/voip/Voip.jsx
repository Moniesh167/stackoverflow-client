import React from 'react'
import AgoraRTC from 'agora-rtc-sdk-ng'
import { BsArrowRepeat, BsFillMicFill, BsFillMicMuteFill, } from 'react-icons/bs'
import { useState, useRef, useEffect, useCallback } from 'react'
import { child, get, off, onValue, ref, set } from 'firebase/database';
import { IoCall, IoVideocam, IoVideocamOff } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';
import { database } from '../../firebase/firebase.js';
import loadingIcon from '../../assets/loading-icon.svg'
import { toast } from 'react-toastify'
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { useSelector } from 'react-redux';
import loadingBars from '../../assets/loading-bars.svg';
import "./voipwrapper.css"

const client = AgoraRTC.createClient({
    mode: "rtc",
    codec: "vp8",
});

let audioTrack;
let videoTrack;

const Voip = () => {
    const user = useSelector(state => state.currentUserReducer?.result)
    const navigate = useNavigate()
    const { callToken, callId, callType: type, reciverFuid, reciverName } = useParams();
    const callRequestRef = ref(database, `/calls/${reciverFuid}/callRequest`)
    const onGoingCallRef = ref(database, `/calls/${reciverFuid ? reciverFuid : user?.fuid}/onGoingCall`)
    const [isRemoteUserJoined, setIsRemoteUserJoined] = useState(false);
    const [callType, setcallType] = useState(type || 'audio')
    const statusRef = ref(database, `/calls/${user?.fuid}/status`)
    const [callerName, setCallerName] = useState(null)
    const [isAudioOn, setIsAudioOn] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [isSwitchingCall, setIsSwitchingCall] = useState(false);
    const [remoteAudioTracks, setRemoteAudioTracks] = useState(null);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [localNetworkQuality, setLocalNetworkQuality] = useState(null);

    const hangCall = () => {
        if (reciverFuid) {
            get(callRequestRef).then(snap => {
                if (snap.exists()) {
                    set(callRequestRef, {}).catch(err => console.error(err));
                }
            })
        }
        set(child(onGoingCallRef, '/callState'), 'hang').then(() => {

        })

    }

    const turnOnCamera = useCallback(async (flag) => {
        setIsVideoOn(flag);
        if (videoTrack) {
            return videoTrack.setEnabled(flag);
        }
        if (flag) {
            videoTrack = await AgoraRTC.createCameraVideoTrack();
            videoTrack.play("camera-video");
        }
    }, [])

    const turnOnMicrophone = useCallback(async (flag) => {
        setIsAudioOn(flag);
        if (audioTrack) {
            return audioTrack.setEnabled(flag);
        }
        if (flag) {
            audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const [isJoined, setIsJoined] = useState(false);
    const channel = useRef("");
    const appid = useRef("5abd32af43b84299b47aa940791f40db");
    const token = useRef("");

    const joinChannel = useCallback(async () => {
        // if (!channel.current) {
        //     channel.current = "react-room";
        // }

        if (isJoined) {
            await leaveChannel();
        }

        client.on("user-published", onUserPublish);
        client.on("user-joined", (user) => {
            const remoteAudioTracks = user.audioTrack || null;
            setRemoteAudioTracks(remoteAudioTracks);
        })

        await client.join(
            appid.current,
            channel.current,
            token.current || null,
            null
        );
        setIsJoined(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const leaveChannel = async () => {
        setIsJoined(false);
        await client.leave();
    };

    const onUserPublish = async (
        user,
        mediaType
    ) => {
        if (mediaType === "video") {
            const remoteTrack = await client.subscribe(user, mediaType);
            remoteTrack.play("remote-video");
        }
        if (mediaType === "audio") {
            const remoteTrack = await client.subscribe(user, mediaType);
            setRemoteAudioTracks(remoteTrack);
            remoteTrack.play();
        }
        setIsRemoteUserJoined(true);

    };

    const joinCall = useCallback(async (callType) => {
        get(onGoingCallRef).then(snap => {
            if (snap.exists()) {
                setCallerName(snap.val().callerName);
            }
        })
        if (callType === 'video') {
            await turnOnCamera(true);
            setIsVideoOn(true);
            await turnOnMicrophone(true);
            setIsAudioOn(true);
            if (!isJoined) {
                joinChannel().then(async () => {
                    await client.publish(videoTrack);
                    await client.publish(audioTrack);
                })
            }

        } else if (callType === 'audio') {
            await turnOnMicrophone(true);
            setIsAudioOn(true);
            if (!isJoined) {
                joinChannel().then(async () => {
                    await client.publish(audioTrack);
                })
            }
            // if (!callType.includes('/audio')) {
            //     const newUrl = window.location.pathname.replace('/video', '/audio');
            //     navigate(newUrl);
            // }
        }


        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const handleOnOffCamera = async () => {
        if (isVideoOn) {
            await turnOnCamera(false);
            // setIsVideoPubed(false);
            setIsVideoOn(false);
        } else {
            await turnOnCamera(true);
            // setIsVideoPubed(true);
            setIsVideoOn(true);
        }
    }
    const handleMicOnOff = async () => {
        if (isAudioOn) {
            turnOnMicrophone(false)
                .then(() => {
                    setIsAudioOn(false);
                }).catch(err => console.error(err));
            // setIsAudioPubed(false);

        } else {
            turnOnMicrophone(true)
                .then(() => {
                    setIsAudioOn(true);
                }).catch(err => console.error(err));
        }
    }

    const handleOnOffSpeaker = () => {
        if (remoteAudioTracks?.isPlaying) {
            remoteAudioTracks.stop();
            setIsSpeakerOn(false);
        } else {
            remoteAudioTracks?.play();
            setIsSpeakerOn(true);
        }
    }
    const handleSwitchCall = async () => {
        setIsSwitchingCall(true);
        if (callType === 'video') {
            set(child(onGoingCallRef, '/callType'), 'audio').then(async () => {
                const newUrl = window.location.pathname.replace('/video', '/audio');
                setcallType('audio');
                await client.unpublish(videoTrack).catch((err) => console.log('Something went wrong........', err));
                await turnOnCamera(false);
                setIsSwitchingCall(false);
                navigate(newUrl, { replace: true });
            }).catch(err => {
                console.log(err);
                setIsSwitchingCall(false);
            })

        }
        else if (callType === 'audio') {
            set(child(onGoingCallRef, '/callType'), 'video').then(async () => {
                const newUrl = window.location.pathname.replace('/audio', '/video');
                setcallType('video');
                await turnOnCamera(true);
                await client.publish(videoTrack);
                setIsSwitchingCall(false);
                navigate(newUrl, { replace: true });
            }).catch(err => {
                console.log('something went wrong', err);
                setIsSwitchingCall(false);
            })
        }
    }

    useEffect(() => {
        if (callToken && callId && callType) {
            channel.current = callId;
            token.current = callToken;
            client.on("network-quality", (network) => {
                const qualityScale = [
                    " unknown",
                    " excellent.",
                    " optimal.",
                    " impaired communication.",
                    " not smooth.",
                    " poor .",
                    " cannot communicate.",
                ];
                const downlink = network.downlinkNetworkQuality;
                const uplink = network.uplinkNetworkQuality;
                // quality numbers range is from 0 to 6 .
                const qualityNumber = downlink < uplink ? uplink : downlink;
                setLocalNetworkQuality(
                    `Network Quality: ${qualityScale[qualityNumber]}`
                );
            });

            joinCall(callType).then(() => {
                onValue(onGoingCallRef, async (snap) => {
                    if (snap.exists()) {
                        if (snap.val().callState === 'hang') {
                            set(onGoingCallRef, null);
                            set(statusRef, 'idle');
                            leaveChannel().then(() => {
                                turnOnMicrophone(false).catch(err => console.error(err));
                                turnOnCamera(false).then(async () => {
                                    navigate('/call')
                                    window.location.reload();
                                }).catch(err => console.error(err));
                            })
                            return
                        }

                        if (snap.val().callType === 'video') {
                            await turnOnCamera(true);
                            await client.publish(videoTrack)
                            setIsVideoOn(true);
                            const newUrl = window.location.pathname.replace('/audio', '/video');
                            navigate(newUrl, { replace: true });
                        } else if (snap.val().callType === 'audio') {
                            await turnOnCamera(false);
                            setIsVideoOn(false);
                            await client.unpublish(videoTrack);
                            await turnOnMicrophone(true);
                            await client.publish(audioTrack);
                            const newUrl = window.location.pathname.replace('/video', '/audio');
                            navigate(newUrl, { replace: true });
                        }
                        console.log('This is call snap', snap.val())
                        setcallType(snap.val().callType)
                    }
                })
            })

            if (reciverFuid) {
                onValue(callRequestRef, (snap) => {
                    if (snap.exists()) {
                        if (snap.val().callState === 'default') {
                            toast.info('calling...', { autoClose: 1000 })
                            setTimeout(async () => {
                                const onGoingCall = await get(onGoingCallRef).then((snap) => snap.exists())
                                if (!onGoingCall) {
                                    toast.warning('User not Answering.....', { autoClose: 1000 })
                                    leaveChannel().then(() => {
                                        navigate('/call')
                                    })
                                }
                            }, 1000 * 30);
                        } else if (snap.val().callState === 'accepted') {
                            set(statusRef, 'busy');
                            toast.success('call Accepted', { autoClose: 1500 })
                        } else if (snap.val().callState === 'declined') {
                            set(onGoingCallRef, null);
                            set(statusRef, 'idle');
                            leaveChannel().then(() => {
                                turnOnMicrophone(false).catch(err => console.error(err));
                                turnOnCamera(false).then(async () => {
                                    setTimeout(() => {
                                        navigate('/call')
                                        window.location.reload();
                                    }, 300);
                                }).catch(err => console.error(err));
                            })
                        }
                    }
                })
            }

        }

        return () => {
            off(child(onGoingCallRef, '/callType'))
            off(onGoingCallRef)
            off(callRequestRef);
        }


        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        <>
            <div>
                <h1 className='title-text' style={{ textAlign: 'center', padding: '12px', fontSize: '22px', fontWeight: 'bold' }}>Video And Audio Call</h1>
                <div style={{display:'flex',justifyContent:'center'}}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '650px', height: 'fit-content' }}>
                        <div style={{ width: '100%',maxWidth:'640px', background: 'black', display: 'flex', justifyContent: 'space-between', color: 'white', padding: '0 5px', fontSize: '14px' }} >
                            <div>{localNetworkQuality}</div>
                            <div >status: <span style={client.connectionState === 'CONNECTED' ? { color: 'green' } : { color: 'red' }} >{client.connectionState.toLocaleLowerCase()}</span></div>
                        </div>
                        <video style={callType === 'video' && isRemoteUserJoined ? { display: 'block', width: '120px' } : { display: 'none', width: '100%' }} className='video-call' id="camera-video" ></video>
                        <video style={callType === 'video' ? { display: 'block', width: '100%', maxWidth: '100%', margin: '0 auto' } : { display: 'none' }} className={`remote-video w-full max-w-full ${callType === 'video' ? 'block' : 'hidden'} `} id="remote-video" ></video>
                        <div id='audio-call-container' className=' bg-slate-950 relative'>
                            {(callType === 'audio' && (callerName !== user?.displayName)) && callerName && <div style={{ color: 'white', width: '100%', height: '400px', backgroundColor: '#dbeafe', fontSize: '24px', display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', alignItems: 'center' }} className='text-stone-50 w-full h-[400px] bg-blue-100 text-5xl flex flex-col gap-4 justify-center items-center'>
                                <h1>{callerName ? callerName.slice(0, 1).toUpperCase() : null}</h1>

                                <img src={loadingBars} alt="bars" />
                            </div>}
                            {(callType === 'audio' && reciverName) && <div style={{ color: 'white', width: '100%', height: '400px', backgroundColor: '#dbeafe', fontSize: '24px', display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', alignItems: 'center' }} className='text-stone-50 w-full h-[400px] bg-blue-100 text-5xl flex flex-col gap-4 justify-center items-center'>
                                <h1 className='p-2 bg-slate-900 rounded-full w-16 h-16 text-center'>{reciverName.slice(0, 1).toUpperCase()}</h1>
                                <img src={loadingBars} alt="bars" />
                            </div>}
                            {
                                isSwitchingCall && <div className="absolute top-0 left-0 right-0 bottom-0 bg-stone-50 flex justify-center items-center flex-col">
                                    <img className="w-20" src={loadingIcon} alt="loading icon" />
                                    <p>Switching call...</p>
                                </div>
                            }
                        </div>

                        <div className='call-control-container '>
                            {
                                (isJoined && !isSwitchingCall) && <div onClick={handleSwitchCall} className='call-control bg-blue-500 rounded-md p-1 text-3xl w-fit '>
                                    <BsArrowRepeat />
                                </div>
                            }
                            {
                                (isJoined && !isSwitchingCall) && <div onClick={handleOnOffSpeaker} className='call-control bg-blue-500 rounded-md p-1 text-3xl w-fit '>
                                    {isSpeakerOn ? <HiSpeakerWave /> : <HiSpeakerXMark />}
                                </div>
                            }

                            <div onClick={handleMicOnOff} className='call-control bg-blue-500 rounded-md p-1 text-3xl w-fit '>
                                {isAudioOn ? <BsFillMicFill /> : <BsFillMicMuteFill />}
                            </div>
                            {
                                callType === 'video' && <div onClick={handleOnOffCamera} className='call-control bg-blue-500 rounded-md p-1 text-3xl w-fit '>
                                    {isVideoOn ? <IoVideocam /> : <IoVideocamOff />}
                                </div>
                            }
                            {isJoined && <div style={{ backgroundColor: 'red' }} onClick={hangCall} className='call-control bg-red-500 rounded-md p-1  cursor-pointer text-3xl w-fit'>
                                <IoCall />
                            </div>}
                        </div>
                    </div>
                </div>


            </div>
        </>
    )
}

export default Voip
