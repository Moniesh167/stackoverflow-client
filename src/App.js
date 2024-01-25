import { BrowserRouter as Router } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import AllRoutes from "./AllRoutes";
import { fetchAllQuestions } from "./actions/question";
import { fetchAllUsers } from "./actions/users";
import IncomingCall from "./Pages/voip/IncomingCall";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from "./firebase/firebase";
import { get, off, onDisconnect, onValue, push, ref, remove, serverTimestamp, set } from "firebase/database";
import { getQuestionById } from "./api";

function App() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.currentUserReducer?.result);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const userPresence = () => {
    let userDataRef
    const authUnsub = onAuthStateChanged(auth, (User) => {
      if (User) {
        userDataRef = ref(database, `/status/${User?.uid}`)
        const isOfflineForDatabase = {
          isOnline: false,
          last_changed: serverTimestamp(),
        };

        const isOnlineForDatabase = {
          isOnline: true,
          last_changed: serverTimestamp(),
        };
        const dbRef = ref(database, '.info/connected')
        onValue(dbRef, (snap) => {
          if (snap.val() === false) {
            return;
          }
          onDisconnect(userDataRef).set(isOfflineForDatabase).then(() => {
            set(userDataRef, isOnlineForDatabase)
          })
        })
      } else {
        if (userDataRef) {
          off(userDataRef)
        }
        off(ref(database, '.info/connected'))
      }

    })

    const clearFunction = () => {
      authUnsub();
      if (userDataRef) {
        off(userDataRef)
      }
      off(ref(database, '.info/connected'))
    }

    return clearFunction
  }

  const checkNotifications = useCallback(() => {
    if (user) {
      const notificationRef = ref(database, `notifications/${user._id}`)

      onValue(notificationRef, (snap) => {
        const noti = []
        snap.forEach(n => {
          if (n.val().isRead === false) {
          }
          noti.push(n.val())
        })
        setNotifications(noti)
      })

      return () => {
        off(notificationRef)
      }
    }
    return () => {

    }
  },[user])

  const deleteNotification = (notificationId, userId) => {

    const notificationRef = ref(database, `notifications/${userId}/${notificationId}`)
    remove(notificationRef).then(() => console.log("Notification deleted.."))
  }

  const cancelCodeReviewRequest = ( reviewerId,notificationId) => {
    const reviewerRef = ref(database, `notifications/${reviewerId}`)
    const dataRef = push(reviewerRef)
    set(dataRef, { userId: user._id, data: `${user.name} is canceled your code review request.`, isRead: false, id: dataRef.key, isCodeReview: false, dateTime: serverTimestamp() })
    deleteNotification(notificationId, user._id)
  }

  const allowCodeReviewRequest = (questionId, reviewerId,notificationId) => {
    getQuestionById(questionId).then(res => {
      const question = res.data.question;
      const reviewerRef = ref(database, `notifications/${reviewerId}`)
      const dataRef = push(reviewerRef)
      set(dataRef, { userId: user._id, data: `Here is code of question ${question.questionTitle} you requested to ${user.name}.`, isRead: false, id: dataRef.key, isCodeReview: false, dateTime: serverTimestamp(),code:question.questionBody })
      deleteNotification(notificationId, user._id)

    }).catch(err => {
      console.log(err);
      alert(err.message);
    })

  }


  useEffect(() => {
    dispatch(fetchAllQuestions());
    dispatch(fetchAllUsers());
    const unsubUserPresence = userPresence()
    const unsubchecknotification = checkNotifications()

    return () => {
      unsubUserPresence();
      unsubchecknotification();

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);


  useEffect(() => {
    if (user) {
      const unsub = checkNotifications();
      get(ref(database, `notifications/${user._id}`)).then(snap => {
        if (snap.exists()) {
          const noti = []
          snap.forEach(item => {
            if (item.val().isRead === false) {
            }
            noti.push(item.val());
          })
          setNotifications(noti);

        }
      })
      return () => {
        unsub()
      }
    }
    return () => {

    }
  }, [checkNotifications, user])


  const [isMobile, setisMobile] = useState(true);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setisMobile(false);
    }
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        setisMobile(false);
      }
      else {
        setisMobile(true);
      }
    })
    return () => {
      window.removeEventListener('resize', () => {
        if (window.innerWidth <= 768) {
          setisMobile(false);
        }
        else {
          setisMobile(true);
        }
      })
    }
  }, []);



  const handleisMobile = () => {
    if (window.innerWidth <= 768) {
      setisMobile(p => !p);
    }
  };





  return (
    <div className="App">
      <Router>
        <Navbar handleisMobile={handleisMobile} setIsNotificationOpen={setIsNotificationOpen} notificationCount={notifications.length} />
        {user && <IncomingCall fuid={user.fuid} />}
        <div style={isNotificationOpen ? { transform: 'translateX(0%)' } : { transform: 'translateX(100%)' }} className="notification-container" >
          <div className="header">
            <h1 >Your notifications</h1>
            <p onClick={() => setIsNotificationOpen(false)}>X</p>
          </div>
          <div className="notification-box">
            {
              notifications.map(notification => {
                return <div className="notification">
                  {
                    notification.isRead === false && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'green', marginLeft: 'auto' }}></div>
                  }
                  <p id="notification-data">{notification.data.split('\n')[0]}</p>
                  {notification.code && <div style={{padding:'8px'}} id="code-block" >{notification.code}</div>}
                  <div className="date-time-container">
                    {
                      new Date(notification.dateTime).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric', year: 'numeric' })
                    }
                  </div>
                  {
                    notification.isCodeReview && <div className="button-container">
                      <button onClick={() => allowCodeReviewRequest(notification.questionId, notification.userId,notification.id)} className="" id="allow-button">Allow</button>
                      <button onClick={() => cancelCodeReviewRequest(notification.userId,notification.id)} className="" id="cancel-button">cancel</button>
                    </div>
                  }
                  {
                    !notification.isCodeReview && <button onClick={() => { deleteNotification(notification.id, user._id) }} id="ok-button">OK</button>
                  }
                </div>
              })
            }
          </div>
        </div>
        <AllRoutes isMobile={isMobile} handleisMobile={handleisMobile} />
      </Router>
    </div>
  );
}

export default App;
