import axios from "axios";
export const baseUrl="https://stac-vrio.onrender.com"
const API = axios.create({
  baseURL: baseUrl,
});

API.interceptors.request.use((req) => {
  if (localStorage.getItem("Profile")) {
    req.headers.authorization = `Bearer ${
      JSON.parse(localStorage.getItem("Profile")).token
    }`;
  }
  return req;
});

export const logIn = (authData) => API.post("/user/login", authData);
export const signUp = (authData) => API.post("/user/signup", authData);
export const forgotPassword = (authData) => API.post(`/user/forgot-password`,authData)
export const resetPassword = (authData) => API.patch(`/user/reset-password`,authData)

export const postQuestion = (questionData) =>
  API.post("/questions/Ask", questionData);
export const getAllQuestions = () => API.get("/questions/get");
export const getQuestionById = (questionId) => API.post("/questions/getbyid",{questionId})
export const deleteQuestion = (id) => API.delete(`/questions/delete/${id}`);
export const voteQuestion = (id, value) =>
  API.patch(`/questions/vote/${id}`, { value });

export const postAnswer = (id, noOfAnswers, answerBody, userAnswered) =>
  API.patch(`/answer/post/${id}`, { noOfAnswers, answerBody, userAnswered });
export const deleteAnswer = (id, answerId, noOfAnswers) =>API.patch(`/answer/delete/${id}`, { answerId, noOfAnswers });

export const getAllUsers = () => API.get("/user/getAllUsers");
export const updateProfile = (id, updateData) =>
  API.patch(`/user/update/${id}`, updateData);

export const makeCallApi=(data)=>API.post('/calls/makeCall',data)

export const getSubscription = () => API.get("/plan/getSubscription");
export const buySubscription = (priceId) => API.post("/plan/buySubscription",{priceId});
export const cancelSubscription = () => API.get("/plan/cancelSubscription");
