import { Component, State, h } from "@stencil/core";
import cn from "classnames";

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
                  <svg
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    class="m-uh__open-icon"
                  >
                    <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"></path>
                  </svg>
                ) : (
                  <svg
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    class="m-uh__close-icon"
                  >
                    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"></path>
                  </svg>
                )}
              </div>
            </button>
            {!this.open && <div class="m-uh__dropdown">List of sites</div>}
          </div>
        </div>
      </header>
    );
  }
}
