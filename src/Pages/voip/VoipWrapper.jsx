import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllUsers } from '../../actions/users'
import { makeCallApi } from '../../api'
import loadingIcon from '../../assets/loading-icon.svg'
import "./voipwrapper.css"
import Card from './Card'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'

const VoipWrapper = ({ handleisMobile, isMobile }) => {
    const dispatch = useDispatch()
    const users = useSelector((state) => state.usersReducer);
    const user = useSelector((state) => state.currentUserReducer?.result);
    const [isMakingCall, setIsMakingCall] = useState(false)

    const navigate = useNavigate()

    const makeCallFunction = (callType, reciver) => {
        setIsMakingCall(true);

        makeCallApi({ callerName: user?.name || 'unknown', to: reciver.fuid, callType })
            .then((res) => {
                const { callToken, callId } = res.data.callData
                navigate(`/incoming/${callId}/${callType}/${encodeURIComponent(callToken)}/${reciver.fuid}/${reciver.name}`)
            })
            .catch(err => {
                console.log(err);
                toast.warning(err.response.data.message, { autoClose: 1500 })
            })
            .finally(() => {
                setIsMakingCall(false);
            })
    }

    const makeAudioCall = (reciver) => {
        makeCallFunction('video', reciver)
    }

    // const makeVideoCall = (reciver) => {
    //     makeCallFunction('video', reciver)
    // }

    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    return (
        <div className='home-container-1'>
            <LeftSidebar handleisMobile={handleisMobile} isMobile={isMobile} />
            <div className='home-container-2'>
                <div className='voip-wrapper'  >
                    <h1 >VOIP</h1>
                    {(user) && <p >call online user.</p>}
                    {
                        (users && user) && <div className=' users-container '>
                            {users.map(u => <Card makeAudioCall={makeAudioCall} user={u} key={u._id} />)}

                        </div>
                    }
                    {
                        isMakingCall && <div className='call-making '>
                            <img src={loadingIcon} alt='loading icon' />
                            <h1 >Making call request to server...</h1>
                            <p>Please wait it can take time.</p>
                        </div>
                    }

                    {
                        (!user) && <div className='not-login'>
                            Please login to use VOIP.
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default VoipWrapper