import { IoCall} from 'react-icons/io5'
import { useCallRequest } from "../../customhooks"
import { child, ref, set } from 'firebase/database'
import { database } from '../../firebase/firebase'
import { useNavigate } from 'react-router-dom'


const IncomingCall = ({ fuid }) => {
    const onGoingCallRef = ref(database, `calls/${fuid}/onGoingCall`);
    const callRequestRef = ref(database, `calls/${fuid}/callRequest`);
    const statusRef = ref(database, `calls/${fuid}/status`);
    const call = useCallRequest(fuid)
    const navigate = useNavigate()

    const removeCallRequest = (state) => {
        set(child(callRequestRef, '/callState'), state).then(() => {
            setTimeout(() => {
                set(callRequestRef, {})
            }, 100);
        })
    }
    const acceptCall = () => {
        const callToken = call && encodeURIComponent(call?.callToken)
        set(statusRef, 'busy').then(() => {
            set(onGoingCallRef, call).then(async () => {
                removeCallRequest('accepted')
                navigate(`/incoming/${call?.callId}/${call?.callType}/${callToken}`)
            })
        })
    }
    const declineCall = () => {
        removeCallRequest('declined')
        set(statusRef, 'idle')
    }

    return (
        <div style={{display:'flex',justifyItems:'center', position:'relative',width:'100%'}} className="flex justify-center relative">
            {
                call && <div style={{position:'fixed',top:'60px',zIndex:'30',display:'flex',alignItems:'center',gap:'16px',backgroundColor:'#e2e8f0', boxShadow:'3px 3px #ebebebe', padding:'16px' ,borderRadius:'10px'}}  className="fixed top-20 z-50 flex items-center gap-4  bg-green-100 shadow-md rounded p-4">
                    <p>{call.callerName} is calling you</p>
                    <div style={{display:'flex',alignItems:'center', gap:'12px'}} className='flex items-center gap-3'>
                        <div onClick={acceptCall} style={{backgroundColor:'#22c55e',width:'fit-content',padding:'6px',cursor:'pointer', borderRadius:'50%'}} className='bg-green-500 w-fit p-2 cursor-pointer rounded-full'>
                            <IoCall />
                        </div>
                        <div onClick={declineCall} style={{backgroundColor:'#ef4444',width:'fit-content',padding:'6px',cursor:'pointer',borderRadius:'50%'}} className='bg-red-500 w-fit p-2 cursor-pointer rounded-full'>
                            <IoCall />
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default IncomingCall