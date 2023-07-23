"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidHttpUrl = exports.isEmail = exports.validateEmail = exports.isImage = exports.isDate = exports.isNumber = exports.validateDate = exports.validateNumber = exports.isText = exports.isUser = exports.validateText = void 0;
const validateText = (value) => {
    if (typeof value === "string" || value instanceof String)
        return value.trim();
    else
        return null;
};
exports.validateText = validateText;
const isUser = (value) => {
    var _a;
    if (Array.isArray(value)) {
        return value
            .map((it) => {
            it = (0, exports.validateText)(it);
            if (it)
                it = it.toLowerCase();
            return it;
        })
            .filter((it) => !!it);
    }
    else if ((0, exports.validateText)(value)) {
        return (_a = (0, exports.validateText)(value)) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    }
    return null;
};
exports.isUser = isUser;
const isText = (value) => {
    if (Array.isArray(value)) {
        return value
            .map((it) => {
            it = (0, exports.validateText)(it);
            return it;
        })
            .filter((it) => !!it);
    }
    else if ((0, exports.validateText)(value)) {
        return (0, exports.validateText)(value);
    }
    return null;
};
exports.isText = isText;
const validateNumber = (n) => {
    return !isNaN(parseFloat(n)) && !isNaN(n - 0);
};
exports.validateNumber = validateNumber;
const validateDate = (d) => {
    var timestamp = Date.parse(d);
    if (isNaN(timestamp) == false) {
        return d;
    }
    return null;
};
exports.validateDate = validateDate;
const isNumber = (value) => {
    if (Array.isArray(value)) {
        return value
            .map((it) => {
            return (0, exports.validateNumber)(it) ? Number(it) : null;
        })
            .filter((it) => !!it);
    }
    else if ((0, exports.validateNumber)(value)) {
        return (0, exports.validateNumber)(value) ? Number(value) : null;
    }
    return null;
};
exports.isNumber = isNumber;
const isDate = (value) => {
    if (Array.isArray(value)) {
        return value
            .map((it) => {
            return (0, exports.validateDate)(it);
        })
            .filter((it) => !!it);
    }
    else if ((0, exports.validateDate)(value)) {
        return (0, exports.validateDate)(value);
    }
    return null;
};
exports.isDate = isDate;
const isImage = (value) => {
    if (Array.isArray(value)) {
        return value
            .map((it) => {
            it = (0, exports.isValidHttpUrl)(it);
            // if (it) it = it.toLowerCase();
            return it;
        })
            .filter((it) => !!it);
    }
    else if ((0, exports.validateText)(value)) {
        return (0, exports.isValidHttpUrl)(value);
    }
    return null;
};
exports.isImage = isImage;
const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};
exports.validateEmail = validateEmail;
const isEmail = (value) => {
    var _a;
    if (Array.isArray(value)) {
        return value
            .map((it) => {
            var _a;
            let it1 = ((_a = (0, exports.validateEmail)(it)) === null || _a === void 0 ? void 0 : _a.length) ? it : null;
            // if (it) it = it.toLowerCase();
            return it1;
        })
            .filter((it) => !!it);
    }
    else if ((0, exports.validateText)(value)) {
        return ((_a = (0, exports.validateEmail)(value)) === null || _a === void 0 ? void 0 : _a.length) ? value : null;
    }
    return null;
};
exports.isEmail = isEmail;
const isValidHttpUrl = (string) => {
    let url;
    try {
        url = new URL((0, exports.validateText)(string));
    }
    catch (_) {
        return null;
    }
    return url.protocol === "http:" || url.protocol === "https:"
        ? url.toString()
        : null;
};
exports.isValidHttpUrl = isValidHttpUrl;
//# sourceMappingURL=typecheck.js.map