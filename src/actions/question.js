import * as api from "../api/index";

export const askQuestion = (questionData, navigate) => async (dispatch) => {
  try {
    const { data } = await api.postQuestion(questionData);
    dispatch({ type: "POST_QUESTION", payload: data });
    dispatch(fetchAllQuestions());
    navigate("/");
  } catch (error) {
    alert(error.response.data.message);
    console.log(error);
  }
};

export const fetchAllQuestions = () => async (disptach) => {
  try {
    const { data } = await api.getAllQuestions();
    disptach({ type: "FETCH_ALL_QUESTIONS", payload: data });
  } catch (error) {
    console.log(error);
  }
};

export const deleteQuestion = (id, navigate) => async (dispatch) => {
  try {
    await api.deleteQuestion(id);
    dispatch(fetchAllQuestions());
    navigate("/");
  } catch (error) {
    console.log(error);
  }
};

export const voteQuestion = (id, value) => async (dispatch,getState) => {
  try {
    await api.voteQuestion(id, value);
    const { data } = await api.getAllUsers();
    dispatch({ type: "FETCH_USERS", payload: data });
    dispatch(fetchAllQuestions());
  } catch (error) {
    console.log(error);
  }
};

export const postAnswer = (answerData) => async (dispatch) => {
  try {
    const { id, noOfAnswers, answerBody, userAnswered } = answerData;
    const { data } = await api.postAnswer(
      id,
      noOfAnswers,
      answerBody,
      userAnswered
    );
    
    dispatch({ type: "POST_ANSWER", payload: data });
    dispatch(fetchAllQuestions());
    const { data:users } = await api.getAllUsers();
    dispatch({ type: "FETCH_USERS", payload:users});
  } catch (error) {
    console.log(error);
  }
};

export const deleteAnswer = (id, answerId, noOfAnswers) => async (dispatch) => {
  try {
    await api.deleteAnswer(id, answerId, noOfAnswers);
    dispatch(fetchAllQuestions());
    const User = JSON.parse(localStorage.getItem('Profile'))
    const loggedInUser=User?.result
    loggedInUser.numberOfanswer -= 1
    const updatedUser={...User,result:loggedInUser}
    localStorage.setItem('Profile', JSON.stringify(updatedUser))
  } catch (error) {
    console.log(error);
  }
};
