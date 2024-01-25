import React from 'react'
import { usePresence } from '../../customhooks'
import { useSelector } from 'react-redux'
import { IoCall } from 'react-icons/io5'

const Card = ({ user, makeAudioCall }) => {
    const isOnline=usePresence(user.fuid)
    const loggedInUser=useSelector(state=>state.currentUserReducer?.result)
    return (
        <div key={user._id} style={{ padding: '6px 20px', boxShadow: '0 0 5px #ebebeb', borderRadius: '10px' }} className="user-profile-link">
            <h3>{user.name.charAt(0).toUpperCase()}</h3>
            <h5>{user.name}</h5>
            {
                (isOnline.isOnline && user._id !== loggedInUser._id) && <IoCall onClick={() => { makeAudioCall({ fuid: user.fuid, name: user.name }) }} style={{ backgroundColor: 'green', fontSize: '20px', padding: '5px', borderRadius: '50%', cursor: 'pointer',marginLeft:'auto' }} />
            }
        </div>
    )
}

export default Card