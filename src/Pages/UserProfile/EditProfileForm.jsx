import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updateProfile } from "../../actions/users";

const EditProfileForm = ({ currentUser, setSwitch }) => {
  const [name, setName] = useState(currentUser?.result?.name);
  const [about, setAbout] = useState(currentUser?.result?.about);
  const [tags, setTags] = useState(currentUser?.result?.tags);
 
  const dispatch = useDispatch();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const updates={}
    if (name!==currentUser.result.name) {
      updates.name=name;
    }
    if (about!==currentUser.result.about) {
      updates.about=about;
    }
    if (tags!==currentUser.result.tags) {
      updates.tags=tags
    }
    const profile=JSON.parse(localStorage.getItem('Profile'))
   const updatedProfile ={...profile,result:{...profile.result,...updates}}
   localStorage.setItem('Profile', JSON.stringify(updatedProfile));
   if (updates.tags) {
    updates.tags=tags.split(' ');
   }
   console.log(updatedProfile)
      dispatch(updateProfile(currentUser?.result?._id, updates));
    setSwitch(false);
  };

  return (
    <div>
      <h1 className="edit-profile-title">Edit Your Profile</h1>
      <h2 className="edit-profile-title-2">Public information</h2>
      <form className="edit-profile-form" onSubmit={handleSubmit}>
        <label htmlFor="name">
          <h3>Display name</h3>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label htmlFor="about">
          <h3>About me</h3>
          <textarea
            id="about"
            cols="30"
            rows="10"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          ></textarea>
        </label>
        <label htmlFor="tags">
          <h3>Watched tags</h3>
          <p>Add tags separated by 1 space</p>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </label>
        <br />
        <input type="submit" value="Save profile" className="user-submit-btn" />
        <button
          type="button"
          className="user-cancel-btn"
          onClick={() => setSwitch(false)}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditProfileForm;
