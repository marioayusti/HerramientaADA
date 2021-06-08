ace.define("ace/mode/pseudo_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"], function (require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

    var pseudoHighlightRules = function () {

        var keywords = (
            "if|then|else|endif|case|of|default|endcase|" +
            "while|do|endwhile|repeat|until|for|to|inc|downto|endfor|" +
            "and|or|var|return|function|procedure|break|skip"
        );

        var builtinConstants = (
            "infinito|true|false|not|e|s|es|" +
            "int|float|boolean|char|string|pila|cola|lista"
        );

        var builtinFunctions = (
            "print|show|swap|charat|piso|techo|" +
            "push|pop|peek|enqueue|dequeue|front|size|isempty|" +
            "add|addfirst|addlast|index|get|getfirst|getlast|remove|removeindex|removefirst|removelast|" +
            "pow|sqrt|len|contains|abs|showvars"
        );

        var keywordMapper = this.createKeywordMapper({
            "invalid.deprecated": "debugger",
            "support.function": builtinFunctions,
            "variable.language": "self|cls",
            "constant.language": builtinConstants,
            "keyword": keywords
        }, "identifier", true);

        var strPre = "[uU]?";
        var strRawPre = "[rR]";
        var strFormatPre = "[fF]";
        var strRawFormatPre = "(?:[rR][fF]|[fF][rR])";
        var decimalInteger = "(?:(?:[1-9]\\d*)|(?:0))";
        var octInteger = "(?:0[oO]?[0-7]+)";
        var hexInteger = "(?:0[xX][\\dA-Fa-f]+)";
        var binInteger = "(?:0[bB][01]+)";
        var integer = "(?:" + decimalInteger + "|" + octInteger + "|" + hexInteger + "|" + binInteger + ")";

        var exponent = "(?:[eE][+-]?\\d+)";
        var fraction = "(?:\\.\\d+)";
        var intPart = "(?:\\d+)";
        var pointFloat = "(?:(?:" + intPart + "?" + fraction + ")|(?:" + intPart + "\\.))";
        var exponentFloat = "(?:(?:" + pointFloat + "|" + intPart + ")" + exponent + ")";
        var floatNumber = "(?:" + exponentFloat + "|" + pointFloat + ")";

        var stringEscape = "\\\\(x[0-9A-Fa-f]{2}|[0-7]{3}|[\\\\abfnrtv'\"]|U[0-9A-Fa-f]{8}|u[0-9A-Fa-f]{4})";

        this.$rules = {
            "start": [{
                    token: "comment",
                    regex: "//.*$"
                },
                {
                    token: "comment", // multi line comment
                    regex: "\\/\\*",
                    next: "comment"
                }, {
                    token: "string", // multi line " string start
                    regex: strPre + '"{1}',
                    next: "qqstring3"
                }, {
                    token: "string", // multi line ' string start
                    regex: strPre + "'{1}",
                    next: "qstring3"
                }, {
                    token: "string",
                    regex: strRawPre + '"{1}',
                    next: "rawqqstring3"
                }, {
                    token: "string",
                    regex: strRawPre + "'{1}",
                    next: "rawqstring3"
                }, {
                    token: "string",
                    regex: strFormatPre + '"{1}',
                    next: "fqqstring3"
                }, {
                    token: "string",
                    regex: strFormatPre + "'{1}",
                    next: "fqstring3"
                }, {
                    token: "string",
                    regex: strRawFormatPre + '"{1}',
                    next: "rfqqstring3"
                }, {
                    token: "string",
                    regex: strRawFormatPre + "'{1}",
                    next: "rfqstring3"
                }, {
                    token: "keyword.operator",
                    regex: "\\+|\\-|\\*|\\*\\*|\\/|\\/\\/|%|@|<<|>>|&|\\||\\^|~|<|>|<=|=>|==|!=|<>|="
                }, {
                    token: "punctuation",
                    regex: ",|:|;|\\->|\\+=|\\-=|\\*=|\\/=|\\/\\/=|%=|@=|&=|\\|=|^=|>>=|<<=|\\*\\*="
                }, {
                    token: "paren.lparen",
                    regex: "[\\[\\(\\{]"
                }, {
                    token: "paren.rparen",
                    regex: "[\\]\\)\\}]"
                }, {
                    token: "text",
                    regex: "\\s+"
                }, {
                    include: "constants"
                }
            ],
            "comment": [{
                token: "comment", // closing comment
                regex: "\\*\\/",
                next: "start"
            }, {
                defaultToken: "comment"
            }],
            "qqstring3": [{
                token: "constant.language.escape",
                regex: stringEscape
            }, {
                token: "string", // multi line " string end
                regex: '"{1}',
                next: "start"
            }, {
                defaultToken: "string"
            }],
            "qstring3": [{
                token: "constant.language.escape",
                regex: stringEscape
            }, {
                token: "string", // multi line ' string end
                regex: "'{1}",
                next: "start"
            }, {
                defaultToken: "string"
            }],
            "rawqqstring3": [{
                token: "string", // multi line " string end
                regex: '"{1}',
                next: "start"
            }, {
                defaultToken: "string"
            }],
            "rawqstring3": [{
                token: "string", // multi line ' string end
                regex: "'{1}",
                next: "start"
            }, {
                defaultToken: "string"
            }],
            "fqqstring3": [{
                token: "constant.language.escape",
                regex: stringEscape
            }, {
                token: "string", // multi line " string end
                regex: '"{1}',
                next: "start"
            }, {
                token: "paren.lparen",
                regex: "{",
                push: "fqstringParRules"
            }, {
                defaultToken: "string"
            }],
            "fqstring3": [{
                token: "constant.language.escape",
                regex: stringEscape
            }, {
                token: "string", // multi line ' string end
                regex: "'{1}",
                next: "start"
            }, {
                token: "paren.lparen",
                regex: "{",
                push: "fqstringParRules"
            }, {
                defaultToken: "string"
            }],
            "rfqqstring3": [{
                token: "string", // multi line " string end
                regex: '"{1}',
                next: "start"
            }, {
                token: "paren.lparen",
                regex: "{",
                push: "fqstringParRules"
            }, {
                defaultToken: "string"
            }],
            "rfqstring3": [{
                token: "string", // multi line ' string end
                regex: "'{1}",
                next: "start"
            }, {
                token: "paren.lparen",
                regex: "{",
                push: "fqstringParRules"
            }, {
                defaultToken: "string"
            }],
            "fqstringParRules": [{ //TODO: nested {}
                token: "paren.lparen",
                regex: "[\\[\\(]"
            }, {
                token: "paren.rparen",
                regex: "[\\]\\)]"
            }, {
                token: "string",
                regex: "\\s+"
            }, {
                token: "string",
                regex: "'(.)*'"
            }, {
                token: "string",
                regex: '"(.)*"'
            }, {
                token: "function.support",
                regex: "(!s|!r|!a)"
            }, {
                include: "constants"
            }, {
                token: 'paren.rparen',
                regex: "}",
                next: 'pop'
            }, {
                token: 'paren.lparen',
                regex: "{",
                push: "fqstringParRules"
            }],
            "constants": [{
                token: "constant.numeric", // float
                regex: floatNumber
            }, {
                token: "constant.numeric", // integer
                regex: integer + "\\b"
            }, {
                token: ["punctuation", "function.support"], // method
                regex: "(\\.)([a-zA-Z_]+)\\b"
            }, {
                token: keywordMapper,
                regex: "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
            }]
        };
        this.normalizeRules();
    };

    oop.inherits(pseudoHighlightRules, TextHighlightRules);

    exports.pseudoHighlightRules = pseudoHighlightRules;
});

ace.define("ace/mode/folding/pseudoic", ["require", "exports", "module", "ace/lib/oop", "ace/mode/folding/fold_mode"], function (require, exports, module) {
    "use strict";
    var oop = require("../../lib/oop");
    var BaseFoldMode = require("./fold_mode").FoldMode;
    var FoldMode = exports.FoldMode = function (markers) {
        this.foldingStartMarker = new RegExp("([\\[{])(?:\\s*)$|(" + markers + ")(?:\\s*)(?:#.*)?$");
    };
    oop.inherits(FoldMode, BaseFoldMode);
    (function () {
        this.getFoldWidgetRange = function (session, foldStyle, row) {
            var line = session.getLine(row);
            var match = line.match(this.foldingStartMarker);
            if (match) {
                if (match[1])
                    return this.openingBracketBlock(session, match[1], row, match.index);
                if (match[2])
                    return this.indentationBlock(session, row, match.index + match[2].length);
                return this.indentationBlock(session, row);
            }
        };
    }).call(FoldMode.prototype);
});

ace.define("ace/mode/pseudo", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/pseudo_highlight_rules", "ace/mode/folding/pseudoic", "ace/range"], function (require, exports, module) {
    "use strict";
    var oop = require("../lib/oop");
    var TextMode = require("./text").Mode;
    var pseudoHighlightRules = require("./pseudo_highlight_rules").pseudoHighlightRules;
    var pseudoFoldMode = require("./folding/pseudoic").FoldMode;
    var Range = require("../range").Range;
    var Mode = function () {
        this.HighlightRules = pseudoHighlightRules;
        this.foldingRules = new pseudoFoldMode("\\:");
        this.$behaviour = this.$defaultBehaviour;
    };
    oop.inherits(Mode, TextMode);
    (function () {
        this.lineCommentStart = "//";
        this.blockComment = {
            start: "/*",
            end: "*/"
        };
        this.getNextLineIndent = function (state, line, tab) {
            var indent = this.$getIndent(line);
            var tokenizedLine = this.getTokenizer().getLineTokens(line, state);
            var tokens = tokenizedLine.tokens;
            if (tokens.length && tokens[tokens.length - 1].type == "comment") {
                return indent;
            }
            if (state == "start") {
                var match = line.match(/^.*[\{\(\[:]\s*$/);
                if (match) {
                    indent += tab;
                }
            }
            return indent;
        };
        var outdents = {
            "pass": 1,
            "return": 1,
            "raise": 1,
            "break": 1,
            "continue": 1
        };
        this.checkOutdent = function (state, line, input) {
            if (input !== "\r\n" && input !== "\r" && input !== "\n")
                return false;
            var tokens = this.getTokenizer().getLineTokens(line.trim(), state).tokens;
            if (!tokens)
                return false;
            do {
                var last = tokens.pop();
            } while (last && (last.type == "comment" || (last.type == "text" && last.value.match(/^\s+$/))));
            if (!last)
                return false;
            return (last.type == "keyword" && outdents[last.value]);
        };
        this.autoOutdent = function (state, doc, row) {
            row += 1;
            var indent = this.$getIndent(doc.getLine(row));
            var tab = doc.getTabString();
            if (indent.slice(-tab.length) == tab)
                doc.remove(new Range(row, indent.length - tab.length, row, indent.length));
        };
        this.$id = "ace/mode/pseudo";
    }).call(Mode.prototype);
    exports.Mode = Mode;
});
(function () {
    ace.require(["ace/mode/pseudo"], function (m) {
        if (typeof module == "object" && typeof exports == "object" && module) {
            module.exports = m;
        }
    });
})();