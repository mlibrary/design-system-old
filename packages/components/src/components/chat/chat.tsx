import { Component, State, h } from "@stencil/core";
import cn from "classnames";

function ChatIcon() {
  return (
    <svg height="24" viewBox="0 0 24 24" width="24" class="m-chat__svg">
      <path
        d="m15.65 15.92v1.88a1.44 1.44 0 0 1 -.43 1 1.37 1.37 0 0 1 -1 .44h-10.3l-2.92 2.96v-13.2a1.39 1.39 0 0 1 .42-1 1.36 1.36 0 0 1 1-.43h5.93v6.9a1.4 1.4 0 0 0 .43 1 1.33 1.33 0 0 0 1 .44z"
        fill="#ffcc06"
      />
      <path
        d="m21.53 4.24a1.45 1.45 0 0 1 1.47 1.45v13.2l-2.95-2.89h-10.28a1.37 1.37 0 0 1 -1-.44 1.47 1.47 0 0 1 -.42-1v-8.87a1.43 1.43 0 0 1 .42-1 1.39 1.39 0 0 1 1-.42z"
        fill="#10284b"
      />
    </svg>
  );
}

@Component({
  tag: "m-chat",
  styleUrl: "chat.scss",
  shadow: true
})
export class Chat {
  constructor() {
    this.open = false;
  }

  @State() open: boolean;

  toggle() {
    this.open = !this.open;
  }

  render() {
    return (
      <div
        class={cn("m-chat", {
          "m-chat--open": this.open
        })}
      >
        <button
          class="m-chat__button"
          aria-expanded={String(this.open)}
          onClick={() => this.toggle()}
        >
          <ChatIcon />
          <span class="m-chat__label">Ask a Librarian</span>
          <div aria-hidden="true" class="m-chat__icons">
            {!this.open ? (
              <svg
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                class="m-chat__open-icon"
              >
                <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"></path>
              </svg>
            ) : (
              <svg
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                class="m-chat__close-icon"
              >
                <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"></path>
              </svg>
            )}
          </div>
        </button>
        <div class="m-chat__window">
          <iframe
            class="m-chat__iframe"
            title="Ask a Librarian"
            src="https://libraryh3lp.com/chat/umlibraryaskalibrarian@chat.libraryh3lp.com?skin=27279"
          />
        </div>
      </div>
    );
  }
}
