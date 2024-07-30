"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpResponse = void 0;
class Response {
    http200(message = "Fetch ok!", content = null) {
        return {
            ok: true,
            message,
            statusCode: 200,
            content,
        };
    }
    http201(message = "Fetch created ok!", content = null) {
        return {
            ok: true,
            message,
            statusCode: 201,
            content,
        };
    }
    http400(message = "Error bad request!", content = null) {
        return {
            ok: false,
            message,
            statusCode: 400,
            content,
        };
    }
    http401(message = "Error no authorization!", content = null) {
        return {
            ok: false,
            message,
            statusCode: 401,
            content,
        };
    }
    http404(message = "Error not found", content = null) {
        return {
            ok: false,
            message,
            statusCode: 404,
            content,
        };
    }
    http500(message = "Error server", content = null) {
        return {
            ok: false,
            message,
            statusCode: 500,
            content,
        };
    }
}
exports.httpResponse = new Response();
