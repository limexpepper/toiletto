import React, { useState, useEffect } from "react";
import supabase from "../supabase";
import Sparkles from "./Sparkles/Sparkles";

function Review(id_entity) {

  const options = [
    { id_quality: "q1", quality: "automatic tap", selected: false },
    { id_quality: "q2", quality: "automatic soap dispenser", selected: false },
    { id_quality: "q3", quality: "dry", selected: false },
    { id_quality: "q4", quality: "odorless", selected: false },
    { id_quality: "q5", quality: "grime-free", selected: false },
    { id_quality: "q6", quality: "spacious cubicle", selected: false },
    { id_quality: "q7", quality: "no entrance door", selected: false },
    { id_quality: "q8", quality: "paper towels", selected: false },
    { id_quality: "q9", quality: "air-conditioned", selected: false },
    { id_quality: "q10", quality: "mirror", selected: false },
    { id_quality: "q11", quality: "music", selected: false },
    { id_quality: "q12", quality: "scent", selected: false }
  ];

  const [qualities, setQualities] = useState(options);
  const [prevRating, setPrevRating] = useState(0);
  const [calculatedRating, setCalculatedRating] = useState(0);
  const [animateSparkles, setAnimateSparkles] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null); // New state variable to store the timeout ID

  const [switcher, setSwitcher] = useState(false);
  const [submitReview, setSubmitReview] = useState(true);

  useEffect(() => {
    setPrevRating(calculatedRating);
    setCalculatedRating(calculateRating());
  }, [switcher])

  useEffect(() => {
    if (prevRating !== calculatedRating) {
      setAnimateSparkles(true); // Trigger the animation when the rating changes

      if (timeoutId) {
        clearTimeout(timeoutId); // Clear any previous timeouts if they exist
      }

      const newTimeoutId = setTimeout(() => {
        setAnimateSparkles(false); // Stop the animation after a short delay (e.g., 2000ms)
      }, 3000); // Adjust the delay time (in milliseconds) as per your preference

      setTimeoutId(newTimeoutId); // Store the new timeout ID
    }
  }, [prevRating, calculatedRating]);

  const calculateRating = () => {
    const isNill = qualities.every((option) => option.selected === false);

    const silverCount = qualities.slice(0, 6).filter((option) => option.selected === true).length;
    const isSilver = silverCount === 6;

    const silverCountOptional = qualities.slice(6, 8).filter((option) => option.selected === true).length;
    const isSilverOptional = silverCount >= 0;
  
    const goldCount = qualities.slice(8, 12).filter((option) => option.selected === true).length;
    const isGold = isSilver && silverCountOptional === 2 && (goldCount >= 1);

    return isNill ? 0 : isGold ? 3 : isSilver & isSilverOptional ? 2 : 1;
  };

  const handleOptionClick = (id_quality) => {
    const selectedQualities = qualities.map((option) =>
      id_quality === option.id_quality
        ? { ...option, selected: !option.selected }
        : option
        );
    setQualities(selectedQualities);
    setSwitcher(!switcher);
  };

  const handleFormSubmit = async () => {
    console.log("before setting state: " + submitReview)
    setSubmitReview(!submitReview);
    console.log("after setting state: " + submitReview)
    if (submitReview === false){
      console.log("submit button has been unselected")
      return;
    }
    
    const dataToInsert = {};
    qualities.forEach((option) => { 
      dataToInsert[option.quality] = option.selected;
      /* 
      This function is meant to prepare the data to be inserted into the database
      Each option is an object that has two properties: name and selected 
      In javascript, objects can be thought of as simple implementations of a key-value store, similar to a map data structure. 
      To set a key-value pair, use these [] brackets
      As such, [option.name] is the key and its value is option.selected
      */
    });

    const { error } = await supabase.from("reviews-toilets").insert({
      id_entity: id_entity.id_entity,
      stars: calculatedRating, 
      "auto-tap": dataToInsert["auto-tap"],
      "auto-soap": dataToInsert["auto-soap"],
      dry: dataToInsert.dry,
      odourless: dataToInsert.odorless,
      grimefree: dataToInsert["grime-free"],
      "spacious-cubicle": dataToInsert["spacious cubicle"],
      "no-entrance-door": dataToInsert["no entrance door"],
      "paper-towels": dataToInsert["paper towels"],
      mirror: dataToInsert.mirror,
      music: dataToInsert.music,
      scent: dataToInsert.scent,
      aircon: dataToInsert["air-conditioned"]
    });
    if (error) {
      console.error("Error inserting data:", error);
    } else {
      console.log("Data inserted successfully!");
    }
  };

  return (
    <div className="review">
      <div className="review-instructions">Rate this toilet</div>
      {/* <div className="review-instructions">select if the toilet has...</div> */}

      {/* <div className="grading-criteria">at least the first 6 qualities selected for toilet to qualify for 2 stars</div>
      <div className="grading-criteria">and any of the last 3 qualities selected to qualify for 3 stars</div> */}
      <div className="buttons-wrapper">
        {qualities.map((option) => (
          <button
            key={option.id_quality}
            onClick={() => handleOptionClick(option.id_quality)}
            className={option.selected === true ? "active" : ""}
          >
            {option.quality}
          </button>
        ))}
      </div>
      <div className="preview-and-submit">
        <Sparkles animateSparkles={animateSparkles}>
          <h2 id="rating">{calculatedRating} star</h2>
        </Sparkles>
        <button
          onClick={handleFormSubmit}
          className={
            submitReview === false
              ? "btn-submit-active"
              : "btn-submit"
          }
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default Review;
