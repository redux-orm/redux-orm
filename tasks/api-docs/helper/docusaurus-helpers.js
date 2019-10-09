const links = {};

function getLink(parent, name, link) {
    if (parent === "event") return name;
    let sig = `${parent}#${name}`;
    let out = links[sig];

    if (link) {
        links[sig] = link;
        out = link;
    } else if (!out) {
        sig = `null#${name}`;
        out = links[sig];
    }

    return out;
}

function docusaurusLink(
    parent,
    prefix,
    accessSymbol,
    name,
    methodSign,
    returnTypes,
    scope
) {
    const parentAndSymbol =
        scope === "instance" ? [parent.toLowerCase(), "+"] : [parent, "."];

    const link = ["#", ...parentAndSymbol, name].join("");

    return getLink(parent, name, link);
}

function docusaurusGuessLink(
    parent,
    prefix,
    accessSymbol,
    name,
    methodSign,
    returnTypes
) {
    const link = getLink(parent, name);
    if (link) {
        return `[${name}](${link})`;
    }
    return name;
}

function docusaurusParseLink(roughName) {
    if (!roughName) return;
    if (roughName.indexOf("http") >= 0) {
        return `[${roughName}](${roughName})`;
    }
    const parts = roughName.split(/[#\.:]/);
    const link = getLink(parts[0], parts[1]);
    if (link) {
        return `[${roughName}](${link})`;
    }
    return roughName;
}

function sanitize(returnTypes) {
    if (Array.isArray(returnTypes)) {
        return returnTypes.join("|");
    }
    return returnTypes;
}

function docusaurusAnchor(longname, scope) {
    return scope === "instance"
        ? `${longname
              .substr(0, longname.indexOf("#"))
              .toLowerCase()}+${longname.substr(longname.indexOf("#") + 1)}`
        : longname;
}

function isStatic() {
    return this.scope === "static" ? "static " : "";
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.substr(1);
}

exports.isStatic = isStatic;
exports.sanitize = sanitize;
exports.capitalize = capitalize;
exports.docusaurusAnchor = docusaurusAnchor;
exports.docusaurusGuessLink = docusaurusGuessLink;
exports.docusaurusParseLink = docusaurusParseLink;
exports.docusaurusLink = docusaurusLink;
