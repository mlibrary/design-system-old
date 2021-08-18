import { Component, State, h, Listen } from "@stencil/core";

/**
 * @name Universal Header
 * @description The Universal Header shows users that they are on a U-M Library website and provides a quick and organized way for users to access other library websites.
 * @status production
 * @whenToUse You must use the Universal Header at the top of every page of your website if it hosted with the lib.umich.edu domain.
 * @whenNotToUse If your website is not being hosted on lib.umich.edu.
 * @usedBy
 * - [Library Website](https://www.lib.umich.edu/)
 * - [Library Search](https://search.lib.umich.edu/)
 * - [Design System](https://design-system.lib.umich.edu/)
 * - [Michigan Publishing](https://www.publishing.umich.edu/)
 * @research
 * During Fall 2020 usability testing:
 * - 89% of participants noticed the Universal Header without being prompted.
 * - The label "Explore" matched most expectations and all participants had a positive reaction to the content in the dropdown menu.
 * - The header also helped participants recognize they were on a U-M Library website.
 * 
 * [View the research plan (Google Doc)](https://docs.google.com/document/d/1a5NkZEPaNUck3oHngV3cNFNgZ5BVGicCjRVKuDn2YJk/edit?usp=sharing)
 * 
 * [View the research findings (Google Slides)](https://docs.google.com/presentation/d/1G4iga9axTpl9xboJ-ydcbN8ZrDh6A3fo18T-HM7ItvM/edit?usp=sharing)
 */
@Component({
  tag: "m-universal-header",
  styleUrl: "universal-header.scss",
  shadow: true
})
export class UniversalHeader {
  @State() open = false;
  @State() error = false;
  @State() content;

  dropdown!: HTMLElement;

  componentDidLoad() {
    fetch("https://cms.lib.umich.edu/api/universalheader")
      .then(response => response.json())
      .then(data => {
        this.content = {
          primary: data.filter(item => item.level === "1"),
          secondary: data.filter(item => item.level === "2")
        };
      })
      .catch(() => {
        this.error = true;
      });
  }

  @Listen("focusout")
  close() {
    // Close when focus leaves universal header.
    this.open = false;
  }

  @Listen("keydown", { target: "window" })
  handleKeydown(e) {
    if (e.key === "Escape") {
      this.open = false;
    }
  }

  @Listen("click", { target: "document" })
  handleClick(e) {
    // Close on click outside of dropdown.
    if (this.dropdown && !this.dropdown.contains(e.composedPath()[0])) {
      this.open = false;
    }
  }

  toggle() {
    this.open = !this.open;
  }

  renderDropdown() {
    if (this.error) {
      return (
        <p class="m-uh__dropdown-error">
          <strong>Error</strong>: We are temporarily having trouble loading our
          list of library sites. Please try refreshing your page. You can also
          contact <a href="https://www.lib.umich.edu/ask">Ask a Librarian</a>{" "}
          for help.
        </p>
      );
    }

    if (this.content) {
      return [
        <p class="m-uh__heading">Explore what the library has to offer.</p>,
        <ul class="m-uh__list-primary">
          {this.content.primary.map(item => (
            <li>
              <a href={item.link} class="m-uh__item-link">
                <span class="m-uh__item-title">{item.title}</span>
                <span class="m-uh__item-desc">{item.description}</span>
              </a>
            </li>
          ))}
        </ul>,
        <ul class="m-uh__list-secondary">
          {this.content.secondary.map(item => (
            <li>
              <a href={item.link} class="m-uh__item-link">
                <span class="m-uh__item-title">{item.title}</span>
              </a>
            </li>
          ))}
        </ul>
      ];
    }

    return <p>Loading...</p>;
  }

  render() {
    return [
      <header class="m-uh">
        <div class="m-uh__content">
          <a class="m-uh__link" href="https://www.lib.umich.edu/">
            <span class="m-uh__link-text">University of Michigan Library</span>
            <span class="m-uh__link-text--small">
              <abbr title="University of Michigan">U-M</abbr> Library
            </span>
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
                {this.renderDropdown()}
              </div>
            )}
          </div>
        </div>
      </header>,
      <m-website-alerts />
    ];
  }
}
