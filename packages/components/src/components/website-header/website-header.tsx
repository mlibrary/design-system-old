import { Component, Prop, h } from "@stencil/core";

/**
 * @name Website Header
 * @description The Website Header displays our logo and shows users what U-M Library website that they are using.
 * @status experimental
 * @whenToUse If your website is hosted on lib.umich.edu.
 * @whenNotToUse If your website requires a more complicated U-M website header then you may need to work with the Design System team or build your own.
 */
@Component({
  tag: "m-website-header",
  styleUrl: "website-header.scss",
  shadow: true
})
export class WebsiteHeader {
  @Prop({ reflect: true }) name: string = "Website name";
  @Prop({ reflect: true }) to: string = "/";

  render() {
    return (
      <header class="website-header layout">
        <div class="website-header__inner-container">
          <a href={this.to} class="website-header__website-home-link">
            <m-logo></m-logo>

            <span class="website-header__website-name">{this.name}</span>
          </a>
        </div>
      </header>
    );
  }
}
