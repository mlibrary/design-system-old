import { Component, Prop, h } from "@stencil/core";

/**
 * @name Website Header
 * @description The Website Header displays our logo and shows users what U-M Library website that they are using.
 * @status experimental
 * @whenToUse If your website is hosted on lib.umich.edu.
 * @whenNotToUse If your website requires a more complicated U-M website header then you may need to work with the Design System team or build your own.
 * @slot Children
 * @example
 * <m-website-header name="Account">
 *   <a href="/">Log in</a>
 * </m-website-header>
 * 
 * <m-website-header name="Deep Blue Documents" variant="dark"></m-website-header>
 * @usedBy
 * - [Design System](https://design-system.lib.umich.edu/)
 */
@Component({
  tag: "m-website-header",
  styleUrl: "website-header.scss",
  shadow: true
})
export class WebsiteHeader {
  /**
   * The user-friendly name of the U-M Library website that uses this Header.
   */
  @Prop({ reflect: true }) name: string;

  /**
   * The URL linked to when you click the website name.
   */
  @Prop({ reflect: true }) to: string = "/";

  /**
   * Optionally set to `dark` for a blue background.
   */
  @Prop() variant: string;

  render() {
    const variant = this.variant === 'dark' ? ' website-header--dark' : '';
    const logoVariant = this.variant === 'dark' ? 'dark' : ''

    return (
      <header class={"website-header" + variant}>
        <div class="website-header__container">
          <div class="website-header__inner-container">
            <div class="website-header__logo-container">
              <a href="https://www.lib.umich.edu/" class="website-header__lib-link">
                <m-logo variant={logoVariant}></m-logo>
              </a>

              <a href={this.to} class="website-header__website-home-link">
                {this.name && (
                  <span class="website-header__website-name">{this.name}</span>
                )}
              </a>
            </div>

            <slot />
          </div>
        </div>
      </header>
    );
  }
}
