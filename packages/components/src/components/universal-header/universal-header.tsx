import { Component, State, h, Listen, Element } from "@stencil/core";

@Component({
  tag: "m-universal-header",
  styleUrl: "universal-header.scss",
  shadow: true
})
export class UniversalHeader {
  @State() open = false;
  @State() content;
  @Element() el: HTMLElement;

  dropdown!: HTMLElement;

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

  @Listen("keydown", { target: "window" })
  handleKeydown(e) {
    if (e.key === "Escape") {
      this.open = false;
    }
  }

  @Listen("click", { target: "document" })
  handleClick(e) {
    // must exists (be open)
    if (
      this.dropdown &&
      !(e.target.shadowRoot && e.target.shadowRoot.contains(this.dropdown))
    ) {
      this.open = false;
    }
  }

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
                {this.open ? (
                  <m-icon name="expand-less"></m-icon>
                ) : (
                  <m-icon name="expand-more"></m-icon>
                )}
              </div>
            </button>
            {this.open && (
              <div
                class="m-uh__dropdown"
                ref={el => (this.dropdown = el as HTMLElement)}
              >
                <p class="m-uh__heading">
                  Explore what the library has to offer.
                </p>
                <ul class="m-uh__list-primary">
                  {this.content.primary.map(item => (
                    <li>
                      <a href={item.link} class="m-uh__item-link">
                        <span class="m-uh__item-title">{item.title}</span>
                        <span class="m-uh__item-desc">{item.description}</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <ul class="m-uh__list-secondary">
                  {this.content.secondary.map(item => (
                    <li>
                      <a href={item.link} class="m-uh__item-link">
                        <span class="m-uh__item-title">{item.title}</span>
                      </a>
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
