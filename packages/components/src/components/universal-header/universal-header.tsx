import { Component, State, h } from "@stencil/core";

@Component({
  tag: "m-universal-header",
  styleUrl: "universal-header.scss",
  shadow: true
})
export class UniversalHeader {
  constructor() {
    this.open = false;
  }

  @State() open: boolean;

  toggle() {
    this.open = !this.open;
  }

  render() {
    return (
      <header class="m-uh">
        <div class="m-uh__content">
          <a class="m-uh__link" href="https://www.lib.umich.edu/">
            University of Michigan Library
          </a>
          <div class="m-uh__button-container">
            <button
              class="m-uh__button"
              aria-expanded={String(this.open)}
              onClick={() => this.toggle()}
            >
              <span class="m-uh__button-label">Explore</span>
              <div aria-hidden="true" class="m-uh__icons">
                {!this.open ? (
                  <m-icon name="expand-more"></m-icon>
                ) : (
                  <m-icon name="expand-less"></m-icon>
                )}
              </div>
            </button>
            {this.open && <div class="m-uh__dropdown">List of sites</div>}
          </div>
        </div>
      </header>
    );
  }
}
