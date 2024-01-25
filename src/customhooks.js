import { off, onValue, ref } from "firebase/database"
import { useEffect, useState } from "react"
import { database } from "./firebase/firebase"

export const usePresence = (uid) => {
    const [userPresence, setUserPresence] = useState({ isOnline: false, last_changed: new Date() })
    useEffect(() => {
        const userDataRef = ref(database, `status/${uid}`)
        onValue(userDataRef, (snap) => {
            if (snap.exists()) {
                const data= snap.val()
                setUserPresence(data)
            }
        })
        return () => {
            off(userDataRef)
        }
    }, [uid])

    return userPresence
}

export const useCallRequest = (uid) => {
    const [callRequest, setCallRequest] = useState(null)
    useEffect(() => {
        const callRequestRef = ref(database, `calls/${uid}/callRequest`)
        onValue(callRequestRef, (snap) => {
            if (snap.exists()) {
                const callRequest = snap.val()
                setCallRequest(callRequest)
                return
            }
            setCallRequest(null)
        })
        return () => {
            off(callRequestRef)
        }
    }, [uid])
    return callRequest
}