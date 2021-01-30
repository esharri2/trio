import initDragAndDrop from "./trio/init.js";
import Drone from "./trio/drone.js";
import * as Tone from "tone";

(function () {
  // Create instances of Drone based on DOM
  const drones = {};
  initDrones(document.querySelectorAll("section.pad"));

  function initDrones(pads) {
    for (let pad of pads) {
      const id = pad.dataset ? pad.dataset.id : null;
      if (!id) return;
      drones[id] = new Drone(id, pad);
      initDropTarget(pad.querySelector(".drop-target"));
      initDraggable(pad.querySelector(".draggable"));
      initPlayButton(pad.querySelector("button.play"));
      initVolumeControl(pad.querySelector("input[name='volume']"), drones[id]);
      initVibratoControl(
        pad.querySelector("input[name='vibrato']"),
        drones[id]
      );

    }
  }

  function initDropTarget(dropTarget) {
    dropTarget.addEventListener("dragover", (event) => event.preventDefault());
    dropTarget.addEventListener("drop", (event) => {
      const { dataTransfer, target, x, y } = event;
      const draggableId = dataTransfer.getData("text/plain");
      if (draggableId === target.dataset.id) {
        const { top, left } = target.getBoundingClientRect();
        const draggable = target.querySelector(`#${draggableId}`);
        const newY = y - top;
        const newX = x - left;
        draggable.style.top = `${newY}px`;
        draggable.style.left = `${newX}px`;
        const dropTargetHeight = dropTarget.offsetHeight;  
        console.log({
          x: (newX / dropTargetHeight) * 2,
          y: (newY / dropTargetHeight) * 2,
        });
        drones[draggableId].noteStack = { x: (newX/dropTargetHeight) * 2, y: (newY/dropTargetHeight) * 2  };
      }
    });
  }

  function initDraggable(draggable) {
    draggable.addEventListener("dragstart", function (event) {
      event.dataTransfer.setData("text/plain", event.target.id);
    });
  }

  function initPlayButton(button) {
    button.addEventListener("click", (event) => {
      const button = event.currentTarget;
      const drone = drones[button.dataset.id];
      if (button.classList.contains("stop")) {
        drone.stop();
        const draggable = event.target.closest(".pad").querySelector(".draggable");
        // Clear style to recenter
        draggable.removeAttribute("style");
      } else {
        drone.play();
      }
      button.classList.toggle("stop");
    });
  }

  function initVolumeControl(input, drone) {
    input.addEventListener("input", event=>{
      drone.vol = event.target.value;
    })
  }

    function initVibratoControl(input, drone) {
      input.addEventListener("input", (event) => {
        drone.vibratoFrequency = event.target.value;
      });
    }

})();
