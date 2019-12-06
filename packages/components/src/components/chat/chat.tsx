import { Component, State, h } from "@stencil/core";
import cn from "classnames";

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" class="m-chat__svg">
      <path
        d="M14.2,6.35A1.47,1.47,0,0,1,15.65,7.8v8.8a1.44,1.44,0,0,1-.43,1,1.37,1.37,0,0,1-1,.44H3.92L1,21V7.8a1.39,1.39,0,0,1,.42-1,1.36,1.36,0,0,1,1-.43Z"
        fill="#ffcc06"
      />
      <path
        d="M21.56,3A1.43,1.43,0,0,1,23,4.44V17.65l-2.92-2.93H9.8a1.33,1.33,0,0,1-1-.44,1.4,1.4,0,0,1-.43-1V4.44a1.36,1.36,0,0,1,.43-1A1.39,1.39,0,0,1,9.8,3Z"
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
