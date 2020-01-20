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
  @State() content;

  toggle() {
    this.open = !this.open;
  }

  componentWillLoad() {
    return fetch("https://cms.lib.umich.edu/api/universalheader")
      .then(response => response.json())
      .then(data => {
        this.content = {
          primary: data.filter(item => item.level === "1"),
          secondary: data.filter(item => item.level === "2")
        };
      });
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
                {this.open ? (
                  <m-icon name="expand-less"></m-icon>
                ) : (
                  <m-icon name="expand-more"></m-icon>
                )}
              </div>
            </button>
            {this.open && (
              <div class="m-uh__dropdown">
                <p class="m-uh__heading">
                  Explore what the library has to offer.
                </p>
                <ul class="m-uh__list-primary">
                  {this.content.primary.map(item => (
                    <li>
                      <a href={item.link}>{item.title}</a>
                      <p>{item.description}</p>
                    </li>
                  ))}
                </ul>
                <ul class="m-uh__list-secondary">
                  {this.content.secondary.map(item => (
                    <li>
                      <a href={item.link}>{item.title}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }
}
