"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendErrorResponse = exports.sendSuccessResponse = exports.sendResponse = void 0;
const sendResponse = (data, message = 'success', error = false) => {
    return {
        data,
        message,
        error,
        status: !!error
    };
};
exports.sendResponse = sendResponse;
const sendSuccessResponse = (data, message = "success") => {
    return {
        data,
        message,
        error: false,
        status: true,
    };
};
exports.sendSuccessResponse = sendSuccessResponse;
const sendErrorResponse = (message = "success", error = null, data) => {
    return {
        data: data || null,
        message,
        error,
        status: false,
    };
};
exports.sendErrorResponse = sendErrorResponse;
//# sourceMappingURL=sendresponse.js.map