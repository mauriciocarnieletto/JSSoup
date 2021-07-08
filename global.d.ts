declare module "htmlparser" {
  class DefaultHandler {
    constructor(
      callback: (error: Error, dom) => void,
      { verbose: boolean, ignoreWhitespace: boolean }
    );
    dom: [] | string;
  }

  class Parser {
    constructor(handler: DefaultHandler);
    parseComplete(text: string): void;
  }
}
