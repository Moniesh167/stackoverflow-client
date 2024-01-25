import { signInWithEmailAndPassword } from "firebase/auth";
import * as api from "../api";
import { setCurrentUser } from "./currentUser";
import { fetchAllUsers } from "./users";
import { auth } from "../firebase/firebase";

export const signup = (authData, navigate) => async (dispatch) => {
  try {
    const { data } = await api.signUp(authData);
    dispatch({ type: "AUTH", data });
    dispatch(setCurrentUser(JSON.parse(localStorage.getItem("Profile"))));
    signInWithEmailAndPassword(auth,authData.email,authData.password)
    .catch(err=>console.log(err));
    dispatch(fetchAllUsers());
    navigate("/");
  } catch (error) {
    console.log(error);
  }
};

export const login = (authData, navigate) => async (dispatch) => {
  try {
    const { data } = await api.logIn(authData);
    dispatch({ type: "AUTH", data });
    dispatch(setCurrentUser(JSON.parse(localStorage.getItem("Profile"))));
    signInWithEmailAndPassword(auth,authData.email,authData.password).catch(err=>console.log(err));
    navigate("/");
  } catch (error) {
    alert('Error: ' + error.response.data.message)
    console.log(error);
  }
};
