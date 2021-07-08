const assert = require("assert");
var expect = require("chai").expect;
import JSSoup from "../dist/jssoup";

const data = `
  <html><head><title>The Dormouse's story</title></head>
  <body>
  <p class="title"><b>The Dormouse's story</b></p>

  <p class="story">Once upon a time there were three little sisters; and their names were
  <a href="http://example.com/elsie" class="sister" id="link1">Elsie</a>,
  <a href="http://example.com/lacie" class="sister" id="link2">Lacie</a> and
  <a href="http://example.com/tillie" class="sister" id="link3">Tillie</a>;
  and they lived at the bottom of a well.</p>

  <p class="story">...</p>

  <span class="one">One</span>
  <span class="two">Two</span>
  <span class="three">Three</span>
  <span class="one two three">One Two Three</span>

  <div class=" whitespace">Whitespace Left</div>
  <div class="whitespace ">Whitespace Right</div>
  <div class=" whitespace ">Whitespace Left and Right</div>
  <div class="    so    much    whitespace    ">Whitespace</div>

  </body>
  </html>
`;

describe("contents", function () {
  it("should be OK", function (done) {
    var soup = new JSSoup("<a>hello</a>");
    assert.strictEqual(soup.contents.length, 1);
    assert.strictEqual(soup.contents[0].contents.length, 1);
    done();
  });

  it("should be OK", function (done) {
    var soup = new JSSoup("<a>hello<b>aa</b>cc</a>");
    assert.strictEqual(soup.contents.length, 1);
    assert.strictEqual(soup.contents[0].contents.length, 3);
    done();
  });
});

describe("parent", function () {
  it("should be OK", function (done) {
    var soup = new JSSoup("<a>hello</a>");
    assert.strictEqual(soup.parent, null);
    assert.strictEqual(soup.contents[0].parent, soup);
    assert.strictEqual(soup.contents[0].contents[0].parent, soup.contents[0]);
    done();
  });
});

describe("name", function () {
  it("should get correct name", function (done) {
    var soup = new JSSoup("<a>hello</a>");
    assert.strictEqual(soup.name, "[document]");
    assert.strictEqual(soup.contents[0].name, "a");
    done();
  });

  it("should not have name for SoupString", function (done) {
    var soup = new JSSoup("<a>hello</a>");
    assert.strictEqual(soup.contents[0].contents[0].name, undefined);
    done();
  });
});

describe("string", function () {
  it("should print text in first level without sub tag", function (done) {
    var soup = new JSSoup("<a>text</a>");
    assert.strictEqual(soup.contents[0].string, "text");
    done();
  });

  it("should print text in deepest level without sub tag", function (done) {
    var soup = new JSSoup("<a><b><c>text</c></b></a>");
    assert.strictEqual(soup.string, "text");
    done();
  });

  it("should return undefined with sub tag", function (done) {
    var soup = new JSSoup("<a>ab<b>text</b></a>");
    assert.strictEqual(soup.string, undefined);
    done();
  });

  it("should return undefined with nothing", function (done) {
    var soup = new JSSoup("<a></a>");
    assert.strictEqual(soup.string, undefined);
    done();
  });
});

describe("sibling", function () {
  it("should be OK without sibling", function (done) {
    var soup = new JSSoup("<a>hello</a>");
    assert.strictEqual(soup.previousSibling, undefined);
    assert.strictEqual(soup.nextSibling, undefined);
    assert.strictEqual(soup.contents[0].previousSibling, undefined);
    assert.strictEqual(soup.contents[0].nextSibling, undefined);
    assert.strictEqual(soup.contents[0].contents[0].previousSibling, undefined);
    assert.strictEqual(soup.contents[0].contents[0].nextSibling, undefined);
    done();
  });

  it("should be OK with sibling", function (done) {
    var soup = new JSSoup("<a>hello</a><b>df</b><c>df</c>");
    assert.strictEqual(soup.contents[0].previousSibling, undefined);
    assert.strictEqual(soup.contents[0].nextSibling.name, "b");
    assert.strictEqual(soup.contents[1].previousSibling.name, "a");
    assert.strictEqual(soup.contents[1].nextSibling.name, "c");
    assert.strictEqual(soup.contents[2].previousSibling.name, "b");
    assert.strictEqual(soup.contents[2].nextSibling, undefined);
    done();
  });
});

describe("attrs", function () {
  it("should be OK", function (done) {
    var soup = new JSSoup('<a class="hi">hello</a>');
    assert.ok(soup.contents[0].attrs);
    done();
  });

  it("should be OK", function (done) {
    var soup = new JSSoup('<a class="h1 h2 h3">hello</a>');
    assert.ok(soup.contents[0].attrs);
    done();
  });
});

describe("extract", function () {
  it("should be OK", function (done) {
    var soup = new JSSoup('<a class="hi">hello</a>');
    var a = soup.contents[0];
    a.extract();
    assert.strictEqual(a.parent, null);
    assert.strictEqual(soup.contents.length, 0);
    done();
  });

  it("should be OK with SoupString", function (done) {
    var soup = new JSSoup('<a class="hi">hello</a>');
    var text = soup.find(undefined, undefined, "hello");
    text.extract();
    assert.strictEqual(soup.contents[0].nextElement, null);
    assert.strictEqual(soup.descendants.length, 1);
    assert.strictEqual(soup.text, "");
    done();
  });

  it("should be OK", function (done) {
    var soup = new JSSoup('<a class="hi">1</a><b>2</b><c>3</c>');
    var a = soup.contents[0];
    var b = soup.contents[1];
    var c = soup.contents[2];
    var before = soup.descendants.length;
    a.extract();
    assert.strictEqual(soup.nextElement, b);
    assert.strictEqual(soup, b.previousElement);
    assert.strictEqual(b.nextElement.nextElement, c);
    assert.strictEqual(before, soup.descendants.length + 2);
    assert.strictEqual(a.nextElement.toString(), "1");
    assert.strictEqual(a.nextElement.nextElement, null);
    done();
  });

  it("should be OK with no sub contents", function (done) {
    var soup = new JSSoup('<a class="hi"></a><b></b><c></c>');
    var a = soup.contents[0];
    var b = soup.contents[1];
    var c = soup.contents[2];
    var before = soup.descendants.length;
    b.extract();
    assert.strictEqual(soup.nextElement, a);
    assert.strictEqual(soup, a.previousElement);
    assert.strictEqual(a.nextElement, c);
    assert.strictEqual(c.previousElement, a);
    assert.strictEqual(before, soup.descendants.length + 1);
    assert.strictEqual(a.nextElement.nextElement, null);
    assert.strictEqual(b.nextElement, null);
    assert.strictEqual(b.previousElement, null);
    assert.strictEqual(b.parent, null);
    done();
  });

  it("should be OK with combine function", function (done) {
    var soup = new JSSoup('<a class="hi">1</a><b>2</b><c>3</c>');
    var a = soup.contents[0];
    var b = soup.contents[1];
    var c = soup.contents[2];
    var before = soup.descendants.length;
    b.extract();
    assert.strictEqual(soup.text, "13");
    soup.append(b);
    assert.strictEqual(soup.text, "132");
    assert.strictEqual(before, soup.descendants.length);
    assert.strictEqual(c.nextElement.nextElement, b);
    assert.strictEqual(b.previousElement.previousElement, c);
    done();
  });
});

describe("find", function () {
  it("should be OK to find div with DOCTYPE", function (done) {
    var text = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html><head><title>The Dormouse's story</title></head>
      <body>
      <div class="one">One</div>
      </body>
      </html>
    `;
    var soup = new JSSoup(text);
    var tag = soup.find("div");
    assert.strictEqual(tag.text, "One");
    done();
  });
});

describe("findAll", function () {
  it("should find all elements", function (done) {
    var soup = new JSSoup("<a>hello</a>");
    var ret = soup.findAll();
    assert.strictEqual(ret.length, 1);
    soup = new JSSoup(data);
    ret = soup.findAll();
    assert.strictEqual(ret.length, 19);
    ret = soup.findAll("a");
    assert.strictEqual(ret.length, 3);
    ret = soup.findAll("p");
    assert.strictEqual(ret.length, 3);
    ret = soup.findAll("head");
    assert.strictEqual(ret.length, 1);
    ret = soup.findAll("title");
    assert.strictEqual(ret.length, 1);
    ret = soup.findAll("span");
    assert.strictEqual(ret.length, 4);
    ret = soup.findAll("div");
    assert.strictEqual(ret.length, 4);
    ret = soup.findAll("");
    assert.strictEqual(ret.length, 0);
    done();
  });

  it("should be OK with only name as argument", function (done) {
    var soup = new JSSoup("<a>hello</a>");
    var ret = soup.findAll("a");
    assert.strictEqual(ret.length, 1);
    assert.strictEqual(ret[0].name, "a");
    ret = soup.findAll("b");
    assert.strictEqual(ret.length, 0);
    done();
  });

  it("should be OK with only string as argument", function (done) {
    var soup = new JSSoup("<a>hello</a>");
    var ret = soup.findAll(undefined, undefined, "hello");
    assert.strictEqual(ret.length, 1);
    assert.strictEqual(ret[0].constructor.name, "SoupString");
    ret = soup.findAll("a", undefined, "hello");
    assert.strictEqual(ret.length, 1);
    assert.strictEqual(ret[0].string, "hello");
    assert.strictEqual(ret[0].name, "a");
    soup = new JSSoup(data);
    ret = soup.findAll(undefined, undefined, "...");
    assert.strictEqual(ret.length, 1);
    assert.strictEqual(ret[0], "...");
    ret = soup.findAll("p", undefined, "...");
    assert.strictEqual(ret.length, 1);
    assert.strictEqual(ret[0].name, "p");
    assert.strictEqual(ret[0].string, "...");
    done();
  });

  it("should be OK with attributes", function (done) {
    var soup = new JSSoup(data);
    var ret = soup.findAll("p", "title");
    assert.strictEqual(ret.length, 1);
    assert.strictEqual(ret[0].name, "p");
    var ret2 = soup.findAll("p", { class: "title" });
    assert.strictEqual(ret2.length, 1);
    assert.strictEqual(ret[0], ret2[0]);
    ret = soup.findAll("p", "story");
    assert.strictEqual(ret.length, 2);
    done();
  });

  it("should be OK with multiple classes", function (done) {
    var soup = new JSSoup(data);
    var ret = soup.findAll("span", "one");
    assert.strictEqual(ret.length, 2);
    assert.strictEqual(ret[0].name, "span");
    var ret2 = soup.findAll("span", "two");
    assert.strictEqual(ret2.length, 2);
    assert.strictEqual(ret2[0].name, "span");
    var ret3 = soup.findAll("span", "three");
    assert.strictEqual(ret3.length, 2);
    assert.strictEqual(ret3[0].name, "span");
    done();
  });

  it("should be OK with whitespace in class definition", function (done) {
    var soup = new JSSoup(data);
    var ret = soup.findAll("div", "whitespace");
    assert.strictEqual(ret.length, 4);
    assert.strictEqual(ret[0].name, "div");
    var ret2 = soup.findAll("div", ["whitespace"]);
    assert.strictEqual(ret2.length, 4);
    assert.strictEqual(ret2[0].name, "div");
    var ret3 = soup.findAll("div", { class: "whitespace" });
    assert.strictEqual(ret3.length, 4);
    assert.strictEqual(ret3[0].name, "div");
    var ret4 = soup.findAll("div", { class: ["whitespace"] });
    assert.strictEqual(ret4.length, 4);
    assert.strictEqual(ret4[0].name, "div");
    done();
  });

  it("should be OK with whitespace in class selector", function (done) {
    var soup = new JSSoup(data);
    var ret = soup.findAll("div", "whitespace ");
    assert.strictEqual(ret.length, 4);
    assert.strictEqual(ret[0].name, "div");
    var ret2 = soup.findAll("div", ["whitespace "]);
    assert.strictEqual(ret2.length, 4);
    assert.strictEqual(ret2[0].name, "div");
    var ret3 = soup.findAll("div", { class: "whitespace " });
    assert.strictEqual(ret3.length, 4);
    assert.strictEqual(ret3[0].name, "div");
    var ret4 = soup.findAll("div", { class: ["whitespace "] });
    assert.strictEqual(ret4.length, 4);
    assert.strictEqual(ret4[0].name, "div");
    done();
  });
});

describe("prev next", function () {
  it("should be OK", function (done) {
    var soup = new JSSoup(data);
    var cur = soup;
    var last = null;
    while (cur) {
      last = cur;
      cur = cur.nextElement;
    }
    while (last) {
      last = last.previousElement;
    }
    done();
  });
});

describe("descendants", function () {
  it("should be OK", function (done) {
    var soup = new JSSoup(data);
    assert.notstrictEqual(soup.descendants, soup.descendants);
    var cur = soup.nextElement;
    for (let i of soup.descendants) {
      assert.strictEqual(i, cur);
      cur = cur.nextElement;
    }
    done();
  });

  it("should be OK", function (done) {
    var soup = new JSSoup("<div><a></a><b></b></div>");
    var a = soup.nextElement.nextElement;
    assert.strictEqual(a.descendants.length, 0);
    done();
  });
});

describe("getText", function () {
  it("should be OK", function (done) {
    var soup = new JSSoup("<a>1<b>2</b>3</a>");
    assert.strictEqual(soup.getText(), "123");
    assert.strictEqual(soup.getText("|"), "1|2|3");
    assert.strictEqual(soup.getText(), soup.text);
    done();
  });

  it("should be OK", function (done) {
    var soup = new JSSoup("<div><a>1<b>2</b>3</a><c>4</c></div>");
    assert.strictEqual(soup.getText(), "1234");
    assert.strictEqual(soup.getText("|"), "1|2|3|4");
    assert.strictEqual(soup.getText(), soup.text);
    done();
  });

  it("should preserve whitespace is set ignoreWhitespace false", function (done) {
    const html = `<p>
  <span contenteditable="false">blabla bla bla</span>
\t<strong style="color: rgb(203, 65, 64);"> </strong> here a double space bla bla
</p>`;
    var soup = new JSSoup(html, false);
    assert.strictEqual(
      soup.getText(),
      "\n  blabla bla bla\n\t  here a double space bla bla\n"
    );
    done();
  });
});

describe("prettify", function () {
  it("should be OK", function (done) {
    var soup = new JSSoup("<a>1<b>2</b>3</a>");
    assert.strictEqual(soup.prettify(), "<a>\n 1\n <b>\n  2\n </b>\n 3\n</a>");
    done();
  });

  it("should be OK with attributes", function (done) {
    var soup = new JSSoup('<a class="h1 h2" id="h3 h4">1<b>2</b>3</a>');
    assert.strictEqual(
      soup.prettify(),
      '<a class="h1 h2" id="h3 h4">\n 1\n <b>\n  2\n </b>\n 3\n</a>'
    );
    done();
  });

  it("should be OK with indent argument", function (done) {
    var soup = new JSSoup('<a class="h1 h2" id="h3 h4">1<b>2</b>3</a>');
    assert.strictEqual(
      soup.prettify("", ""),
      '<a class="h1 h2" id="h3 h4">1<b>2</b>3</a>'
    );
    assert.strictEqual(
      soup.prettify("\t", ""),
      '<a class="h1 h2" id="h3 h4">\t1\t<b>\t\t2\t</b>\t3</a>'
    );
    assert.strictEqual(
      soup.prettify("\t", " "),
      '<a class="h1 h2" id="h3 h4"> \t1 \t<b> \t\t2 \t</b> \t3 </a>'
    );
    done();
  });

  it("should be OK with comments", function (done) {
    var soup = new JSSoup(
      '<a class="h1 h2" id="h3 h4"><!--<label "text" </label> -->1<b>2</b>3</a>'
    );
    assert.strictEqual(
      soup.prettify("", ""),
      '<a class="h1 h2" id="h3 h4"><!--<label "text" </label> -->1<b>2</b>3</a>'
    );
    done();
  });

  it("should be OK with doctype", function (done) {
    var text = `
    <!DOCTYPE HTML>
    <html>
    <head>
    </head>
    <body>
        <div>
        </div>
    </body>
    </html>
    `;
    var soup = new JSSoup(text);
    assert.strictEqual(
      soup.prettify("", ""),
      `<!DOCTYPE HTML><html><head></head><body><div></div></body></html>`
    );
    done();
  });

  it("should be able to skip DOCTYPE", function (done) {
    var text = `<!DOCTYPE HTML>
    <html>
    <head>
    </head>
    <body>
        <div>
        </div>
    </body>
    </html>
    `;
    var soup = new JSSoup(text);
    assert.strictEqual(
      soup.prettify("", ""),
      `<!DOCTYPE HTML><html><head></head><body><div></div></body></html>`
    );
    soup.nextElement.extract();
    assert.strictEqual(
      soup.find("html").prettify("", ""),
      `<html><head></head><body><div></div></body></html>`
    );
    done();
  });

  it("should be able to prettify for tag in builder", function (done) {
    var soup = new JSSoup('<meta charset="utf-8" />');
    assert.strictEqual(soup.prettify("", ""), `<meta charset="utf-8" />`);
    done();
  });

  it("should be able to prettify tag not in builder", function (done) {
    var soup = new JSSoup("<script></script>");
    assert.strictEqual(soup.prettify("", ""), `<script></script>`);
    done();
  });

  it("should be able to handle br", function (done) {
    var soup = new JSSoup("<br>");
    assert.strictEqual(soup.prettify("", ""), `<br />`);
    soup = new JSSoup("<br/>");
    assert.strictEqual(soup.prettify("", ""), `<br />`);
    done();
  });
});

describe("append", function () {
  it("should be OK", function (done) {
    var soup = new JSSoup('<a class="h1 h2" id="h3 h4">1<b>2</b>3</a>');
    var text2 = soup.find(undefined, undefined, "2");
    assert.strictEqual(text2, "2");
    text2.extract();
    var b = soup.find("b");
    assert.strictEqual(b.contents.length, 0);
    assert.strictEqual(text2.parent, null);
    var a = soup.find("a");
    a.append(text2);
    assert.strictEqual(b.nextSibling, "32");
    assert.strictEqual(b.nextSibling.nextSibling, null);
    assert.strictEqual(b.nextElement, "32");
    assert.strictEqual(b.nextElement.nextElement, null);
    done();
  });

  it("should be OK", function (done) {
    var soup = new JSSoup('<a class="h1 h2" id="h3 h4">1<b>2</b></a>');
    var text2 = soup.find(undefined, undefined, "2");
    assert.strictEqual(text2, "2");
    text2.extract();
    var b = soup.find("b");
    assert.strictEqual(b.contents.length, 0);
    assert.strictEqual(text2.parent, null);
    var a = soup.find("a");
    a.append(text2);
    assert.strictEqual(b.nextSibling, "2");
    assert.strictEqual(b.nextSibling.nextSibling, null);
    assert.strictEqual(b.nextElement, "2");
    assert.strictEqual(b.nextElement.nextElement, null);
    assert.strictEqual(text2.parent, a);
    assert.strictEqual(text2.previousSibling, b);
    assert.strictEqual(text2.previousElement, b);
    assert.strictEqual(text2.nextSibling, null);
    assert.strictEqual(text2.nextElement, null);
    done();
  });

  it("should be OK", function (done) {
    var soup = new JSSoup('<a class="h1 h2" id="h3 h4">1<b>2</b><c>3</c></a>');
    var a = soup.find("a");
    var b = soup.find("b");
    var c = soup.find("c");
    b.extract();
    a.append(b);
    assert.strictEqual(c.nextSibling, b);
    assert.strictEqual(c.nextSibling.nextSibling, undefined);
    assert.strictEqual(b.nextSibling, null);
    assert.strictEqual(c.nextElement, "3");
    assert.strictEqual(c.nextElement.nextElement, b);
    assert.strictEqual(b.nextElement, "2");
    assert.strictEqual(b.nextElement.nextElement, null);
    assert.strictEqual(b.nextElement.previousElement, b);
    assert.strictEqual(b.previousElement, "3");
    assert.strictEqual(b.parent, a);
    done();
  });
});

describe("findNextSiblings", function () {
  it("should be OK", function (done) {
    var soup = new JSSoup(data);
    var span = soup.find("span");
    var nextSiblings = span.findNextSiblings("span");
    assert.strictEqual(nextSiblings.length, 3);
    assert.strictEqual(nextSiblings[0].name, "span");
    assert.strictEqual(nextSiblings[1].name, "span");
    assert.strictEqual(nextSiblings[2].name, "span");
    done();
  });

  it("should be OK with attributes", function (done) {
    var soup = new JSSoup(data);
    var span = soup.find("span");
    var nextSiblings = span.findNextSiblings("span", "one");
    assert.strictEqual(nextSiblings.length, 1);
    assert.strictEqual(nextSiblings[0].name, "span");
    done();
  });
});

describe("findNextSibling", function () {
  it("should be OK", function (done) {
    var soup = new JSSoup(data);
    var span = soup.find("span");
    var nextSibling = span.findNextSibling("span");
    assert.strictEqual(nextSibling.name, "span");
    assert.strictEqual(nextSibling.text, "Two");
    done();
  });

  it("should be OK with attributes", function (done) {
    var soup = new JSSoup(data);
    var span = soup.find("span");
    var nextSibling = span.findNextSibling("span", "one");
    assert.strictEqual(nextSibling.name, "span");
    assert.strictEqual(nextSibling.text, "One Two Three");
    done();
  });
});

describe("findPreviousSiblings", function () {
  it("should be OK", function (done) {
    var soup = new JSSoup(data);
    var span = soup.find("span", "three");
    var previousSiblings = span.findPreviousSiblings("span");
    assert.strictEqual(previousSiblings.length, 2);
    assert.strictEqual(previousSiblings[0].name, "span");
    assert.strictEqual(previousSiblings[1].name, "span");
    done();
  });

  it("should be OK with attributes", function (done) {
    var soup = new JSSoup(data);
    var span = soup.find("span", "three");
    var previousSiblings = span.findPreviousSiblings("span", "one");
    assert.strictEqual(previousSiblings.length, 1);
    assert.strictEqual(previousSiblings[0].name, "span");
    done();
  });
});

describe("findPreviousSibling", function () {
  it("should be OK", function (done) {
    var soup = new JSSoup(data);
    var span = soup.find("span", "three");
    var previousSibling = span.findPreviousSibling("span");
    assert.strictEqual(previousSibling.name, "span");
    assert.strictEqual(previousSibling.text, "Two");
    done();
  });

  it("should be OK with attributes", function (done) {
    var soup = new JSSoup(data);
    var span = soup.find("span", "three");
    var previousSibling = span.findPreviousSibling("span", "one");
    assert.strictEqual(previousSibling.name, "span");
    assert.strictEqual(previousSibling.text, "One");
    done();
  });
});

describe("insert", function () {
  it("should throw exception for null element", function (done) {
    var soup = new JSSoup(data);
    expect(() => {
      soup.insert(0, null);
    }).to.throw();
    done();
  });

  it("should throw exception for node itself", function (done) {
    var soup = new JSSoup(data);
    var tag = soup.find("div");
    expect(() => {
      tag.insert(0, tag);
    }).to.throw();
    done();
  });

  it("should throw exception trying to insert into string", function (done) {
    var soup = new JSSoup(data);
    var p = soup.find("p");
    expect(() => {
      p.string.insert(0, "new node");
    }).to.throw();
    done();
  });

  it("should throw exception trying to insert at negative position", function (done) {
    var soup = new JSSoup(data);
    var p = soup.find("p");
    var div = soup.find("div");
    expect(() => {
      p.insert(-1, div);
    }).to.throw();
    done();
  });

  it("should be able to insert string", function (done) {
    var soup = new JSSoup("<div><p>hello</p></div>");
    var p = soup.find("p");
    p.insert(1, " world");
    assert.strictEqual(p.getText(), "hello world");
    done();
  });

  it("should not change if inserting child to current index", function (done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `;
    var soup = new JSSoup(html);
    var oldText = soup.getText();
    var div = soup.find("div");
    var p2 = soup.find("p", { id: "p2" });
    div.insert(1, p2);
    assert.strictEqual(oldText, soup.getText());
    done();
  });

  it("should change order if inserting child to begin", function (done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `;
    var soup = new JSSoup(html);
    var oldText = soup.getText();
    var div = soup.find("div");
    var p2 = soup.find("p", { id: "p2" });
    div.insert(0, p2);
    assert.strictEqual(soup.getText(), "p2p1p3");
    done();
  });

  it("should change order if inserting child to end", function (done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `;
    var soup = new JSSoup(html);
    var div = soup.find("div");
    var p2 = soup.find("p", { id: "p2" });
    div.insert(100, p2);
    assert.strictEqual(soup.getText(), "p1p3p2");
    done();
  });

  it("should be able to insert at the end", function (done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `;
    var soup = new JSSoup(html);
    var div = soup.find("div");
    var p2 = soup.find("p", { id: "p2" });
    soup.insert(100, p2);
    assert.strictEqual(soup.getText(), "p1p3p2");
    assert.strictEqual(div.nextSibling.prettify("", ""), '<p id="p2">p2</p>');
    done();
  });

  it("should be able to insert node from another DOM", function (done) {
    var html = `
    <div>
      <p id="p1">p1</p>
    </div>
    `;
    var toHtml = `
    <span>
      <a href="http" />
    </span>
    `;
    var fromSoup = new JSSoup(html);
    var toSoup = new JSSoup(toHtml);
    var div = fromSoup.find("div");
    var span = toSoup.find("span");
    span.insert(100, div);
    assert.strictEqual(
      span.prettify("", ""),
      '<span><a href="http"></a><div><p id="p1">p1</p></div></span>'
    );
    done();
  });

  it("should be able to insert JSSoup", function (done) {
    var html = `
    <div>
      <p id="p1">p1</p>
    </div>
    `;
    var toHtml = `
    <span>
      <a href="http" />
    </span>
    `;
    var fromSoup = new JSSoup(html);
    var toSoup = new JSSoup(toHtml);
    toSoup.insert(100, fromSoup);
    assert.strictEqual(
      toSoup.prettify("", ""),
      '<span><a href="http"></a></span><div><p id="p1">p1</p></div>'
    );
    done();
  });
});

describe("replaceWith", function () {
  it("should throw exception if parent is null", function (done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `;
    var soup = new JSSoup(html);
    var p1 = soup.find("p", { id: "p1" });
    var p2 = soup.find("p", { id: "p2" });
    p1.extract();
    expect(() => {
      p1.replaceWith(p2);
    }).to.throw();
    done();
  });

  it("should throw exception if replace with one itself", function (done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `;
    var soup = new JSSoup(html);
    var old = soup.prettify();
    var p1 = soup.find("p", { id: "p1" });
    p1.replaceWith(p1);
    assert.strictEqual(old, soup.prettify());
    done();
  });

  it("should throw exception if replace with ones parent", function (done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `;
    var soup = new JSSoup(html);
    var div = soup.find("div");
    var p1 = soup.find("p", { id: "p1" });
    expect(() => {
      p1.replaceWith(div);
    }).to.throw();
    done();
  });

  it("should be able to replace one with another", function (done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `;
    var soup = new JSSoup(html);
    var div = soup.find("div");
    var p1 = soup.find("p", { id: "p1" });
    var p2 = soup.find("p", { id: "p2" });
    p1.replaceWith(p2);
    assert.strictEqual(
      div.prettify("", ""),
      '<div><p id="p2">p2</p><p id="p3">p3</p></div>'
    );
    done();
  });

  it("should be able to replace SoupString", function (done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
    </div>
    `;
    var soup = new JSSoup(html);
    var div = soup.find("div");
    var p1 = soup.find("p", { id: "p1" });
    p1.string.replaceWith("hello");
    assert.strictEqual(
      div.prettify("", ""),
      '<div><p id="p1">hello</p><p id="p2">p2</p></div>'
    );
    done();
  });
});
