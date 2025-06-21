class FPS {
  constructor() {
    this.p1 = performance.now();
    this.p2 = performance.now();
    this.gap = performance.now();
    this.count = 0;
    this.fps = document.createElement('div');

    this.fps.className = 'fps';
    this.fps.innerHTML = `FPS: 60`;
    document.body.appendChild(this.fps);
  }

  update = () => {
    this.p1 = performance.now();
    this.count++;
    if (performance.now() - this.gap > 1000) {
      this.fps.innerHTML = `FPS: ${this.count}`;
      this.gap = performance.now();
      this.count = 0;
    }
    this.p2 = this.p1;
  };
}

export default FPS;
