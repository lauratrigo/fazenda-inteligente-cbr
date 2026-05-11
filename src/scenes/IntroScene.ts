import Phaser from "phaser";

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Elemento não encontrado: ${id}`);
  return element as T;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || target.matches("input, textarea, select, [contenteditable='true']");
}

export class IntroScene extends Phaser.Scene {
  private finished = false;
  private skipHandler?: (event: Event) => void;

  constructor() {
    super("IntroScene");
  }

  create(): void {
    const intro = getElement("intro-screen");
    const menu = getElement("main-menu");
    intro.classList.remove("is-hidden", "is-finished");
    menu.classList.add("is-hidden");
    document.title = "Vale dos Causos";

    this.skipHandler = (event: Event) => {
      if (event instanceof KeyboardEvent) {
        if (isEditableTarget(event.target)) return;
        if (!["Enter", " ", "Spacebar", "Space"].includes(event.key)) return;
      }

      this.finish();
    };

    intro.addEventListener("click", this.skipHandler);
    document.addEventListener("keydown", this.skipHandler);
    this.time.delayedCall(3600, () => this.finish());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
  }

  private finish(): void {
    if (this.finished) return;
    this.finished = true;

    const intro = getElement("intro-screen");
    intro.classList.add("is-finished");
    this.time.delayedCall(320, () => {
      intro.classList.add("is-hidden");
      this.cleanup();
      this.scene.start("MenuScene");
    });
  }

  private cleanup(): void {
    const intro = getElement("intro-screen");
    if (this.skipHandler) {
      intro.removeEventListener("click", this.skipHandler);
      document.removeEventListener("keydown", this.skipHandler);
      this.skipHandler = undefined;
    }
  }
}
