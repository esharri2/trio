import { AutoFilter, BitCrusher, Distortion, Freeverb, JCReverb, Master, Reverb, Synth, Vibrato, Volume } from "tone";
import {
  BufferGeometry,
  Line,
  LineBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  Vector3,
} from "three";
import synthSettings from "./synthSettings.json";

export default class {
  constructor(id, padElement) {
    this.id = id;
    this.synth = new Synth(synthSettings[id].settings);
    this.autoFilter = new AutoFilter(2, 200, synthSettings[id].filterOctaves);
    this.reverb = new Freeverb();
    this.distortion = new Distortion({
      distortion: 0,
      oversample: 'none',
    });
    this.bitCrusher = new BitCrusher({bits: 8})
    this.volume = new Volume({
      volume: 0,
      mute: false,
    });
    this.vibrato = new Vibrato({
      maxDelay: 0.005,
      frequency: 0,
      depth: 0.2,
      type: "sine",
    });
    this.settings = synthSettings[id];
    this.padElement = padElement;
    this.vizElement = padElement.querySelector(".viz");
    this.notes = [
      {
        x: 1,
        y: 1,
      },
    ];
    this.timeoutId;
    this.viz = {
      camera: new PerspectiveCamera(
        110,
        padElement.querySelector(".viz").offsetWidth /
          padElement.querySelector(".viz").offsetHeight,
        1,
        500
      ),
      material: new LineBasicMaterial({ color: 0x0a090c }),
      points: [],
      renderer: new WebGLRenderer({ alpha: true }),
      scene: new Scene(),
    };
  }

  set noteStack(newNotes) {
    this.notes.push(newNotes);
    this.handleNoteStackUpdate(newNotes);
  }

  set vol(value) {
    this.volume.volume.value = value;
  }

  set vibratoFrequency(value) {
    console.log(value);
    this.vibrato.frequency.value = value;
  }

  initViz() {
    const { camera, points, renderer, scene } = this.viz;
    const height = this.vizElement.offsetHeight;
    const width = this.vizElement.offsetWidth;

    renderer.setClearColor(0xfff5ff, 0);
    renderer.setSize(width, height);

    this.vizElement.appendChild(renderer.domElement);
    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);

    points.push(new Vector3(0, 0, 0));
  }

  play() {
    this.initViz();
    let currentNote = 0;
    const { filterOctaves, frequency, loopTime } = this.settings;
    console.log(this.reverb);
    this.synth.chain(this.volume, this.vibrato, this.autoFilter, Master);
    this.synth.frequency.value = frequency;
    this.synth.triggerAttack(frequency);

    const switchNote = () => {
      currentNote + 1 === this.notes.length ? (currentNote = 0) : currentNote++;
      if (this.notes.length > 1) {
        const { x, y } = this.notes[currentNote];
        const newFrequency = currentNote === 0 ? frequency : frequency * x;
        this.synth.frequency.rampTo(newFrequency, 0.05);
        const newFilterOctaves =
          currentNote === 0 ? filterOctaves : filterOctaves * y;
        this.rampEffectValue(
          this.autoFilter,
          "octaves",
          newFilterOctaves - this.autoFilter.octaves,
          loopTime
        );
      }

      this.timeoutId = window.setTimeout(switchNote, 1000 * loopTime);
    };

    switchNote();
  }

  stop() {
    this.synth.triggerRelease();
    this.clearScene();
    this.viz.points = [];
    this.viz.scene.dispose();
    this.notes = [this.notes[0]];
    clearTimeout(this.timeoutId);
  }

  clearScene() {
    const { scene } = this.viz;
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
  }

  convertToCoordinates(notes) {
    const height = this.vizElement.offsetHeight;
    const width = this.vizElement.offsetWidth;

    let coordinates = {};

    coordinates.x = (notes.x - 1) * (width / 2);
    coordinates.y = (notes.y - 1) * (height / 2) * -1;

    return coordinates;
  }

  handleNoteStackUpdate(newNotes) {
    const { camera, material, points, renderer, scene } = this.viz;
    const { loopTime } = this.settings;
    this.clearScene();

    const coordinates = this.convertToCoordinates(newNotes);
    let z = this.getRandomNumber(30);

    const isEvenPoint = points.length % 2;

    // Add point according to drop
    if (isEvenPoint) {
      z = z * -1;
    }
    points.push(new Vector3(coordinates.x, coordinates.y, z));

    const geometry = new BufferGeometry().setFromPoints(points);
    const line = new Line(geometry, material);
    scene.add(line);

    const baseRotation = 10;

    function animate() {
      requestAnimationFrame(animate);
      // line.rotation.x += (baseRotation - loopTime) * 0.001;
      // line.rotation.y += (baseRotation - loopTime) * 0.0008;
      line.rotation.z += (baseRotation - loopTime) * .0006;
      renderer.render(scene, camera);
    }
    animate();
  }

  getRandomNumber(max) {
    return Math.floor(Math.random() * max) + 1;
  }

  rampEffectValue(effect, valueName, changeValue, loopTime) {
    const totalTicks = loopTime * 100;
    let tickCount = 0;
    const changeValuePerTick = changeValue / totalTicks;

    const timer = setInterval(function () {
      const newValue = effect[valueName] + changeValuePerTick;
      effect[valueName] = newValue;
      tickCount++;
      if (tickCount === totalTicks) {
        clearInterval(timer);
      }
    }, 10);
  }
}
