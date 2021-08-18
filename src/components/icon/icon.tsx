import { Component, Prop, Host, h } from "@stencil/core";
import icons from "./icons.js";

/**
 * @name Icon
 * @description For SVG icons.
 * @status internal
 * @private
 */
@Component({
  tag: "m-icon"
})
export class Icon {
  @Prop() name: string;

  render() {
    const icon = icons[this.name];

    if (!icon) {
      console.log("Unable to find Icon with name: " + this.name);
      return null;
    }

    return <Host innerHTML={icon.svg}></Host>;
  }
}
