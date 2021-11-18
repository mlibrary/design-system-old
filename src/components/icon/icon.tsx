import { Component, Prop, Host, h } from "@stencil/core";
import icons from "../../../icons.js";

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
  @Prop() size: string;

  render() {
    let icon = icons[this.name];

    if (!icon) {
      console.log("Unable to find Icon with name: " + this.name);
      return null;
    }

    let svg = icon.svg

    const sizedSvg = this.size ? svg
      .replace('width=\"16\"', `width=\"${this.size}\"`)
      .replace('height=\"16\"', `height=\"${this.size}\"`)
    : null

    return <Host innerHTML={sizedSvg || svg}></Host>;
  }
}
