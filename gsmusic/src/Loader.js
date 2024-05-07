import React from "react";
import "./Loader.css";

function Loader() {
  return (
    <div className="main_contain">
      <div className="loader_container">
        <div class="loading">
          <div class="loading__letter">G</div>
          <div class="loading__letter">S</div>
          <div class="loading__letter">M</div>
          <div class="loading__letter">u</div>
          <div class="loading__letter">S</div>
          <div class="loading__letter">i</div>
          <div class="loading__letter">C</div>
        </div>
        <div class="loader">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
       
      </div>
    </div>
  );
}

export default Loader;
