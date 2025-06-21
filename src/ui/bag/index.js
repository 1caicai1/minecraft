import grassIcon from "../../static/block-icon/grass.png";
import stoneIcon from "../../static/block-icon/stone.png";
import treeIcon from "../../static/block-icon/tree.png";
import woodIcon from "../../static/block-icon/wood.png";
import diamondIcon from "../../static/block-icon/diamond.png";
import quartzIcon from "../../static/block-icon/quartz.png";
import glassIcon from "../../static/block-icon/glass.png";
import { isMobile } from "../../utils";

class Bag {
  constructor() {
    this.wheelGap = false;
    this.current = 0;
    this.icon = [grassIcon, stoneIcon, treeIcon, woodIcon, diamondIcon, quartzIcon, glassIcon];
    this.iconIndex = 0;
    this.y = 0;
    this.bag = document.createElement("div");
    this.items = new Array(10).fill(null).map(() => {
      let item = document.createElement("div");
      item.className = "item";
      let img = document.createElement("img");
      if (this.icon[this.iconIndex]) {
        img.className = "icon";
        img.alt = "block";
        img.src = this.icon[this.iconIndex++];
        item.appendChild(img);
      }
      return item;
    });
    if (isMobile) return;

    this.bag.className = "bag";
    this.items[0].classList.add("selected");
    for (let i = 0; i < this.items.length; i++) {
      this.bag.appendChild(this.items[i]);
    }
    document.body.appendChild(this.bag);

    document.body.addEventListener("keydown", (e) => {
      if (isNaN(parseInt(e.key)) || e.key === "0") {
        return;
      }
      for (let i = 0; i < this.items.length; i++) {
        this.items[i].classList.remove("selected");
      }
      this.current = parseInt(e.key) - 1;
      this.items[this.current].classList.add("selected");
    });

    document.body.addEventListener("wheel", (e) => {
      if (!this.wheelGap) {
        this.wheelGap = true;
        setTimeout(() => {
          this.wheelGap = false;
        }, 100);
        if (e.deltaY > 0) {
          this.current++;
          if (this.current > 9) this.current = 0;
        } else if (e.deltaY < 0) {
          this.current--;
          if (this.current < 0) this.current = 9;
        }
        for (let i = 0; i < this.items.length; i++) {
          this.items[i].classList.remove("selected");
        }
        this.items[this.current].classList.add("selected");
      }
    });
  }
}

export default Bag;
