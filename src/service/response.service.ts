class Response {
  http200(message: string = "Fetch ok!", content: any = null) {
    return {
      ok: true,
      message,
      statusCode: 200,
      content,
    };
  }
  http201(message: string = "Fetch created ok!", content: any = null) {
    return {
      ok: true,
      message,
      statusCode: 201,
      content,
    };
  }
  http400(message: string = "Error bad request!", content: any = null) {
    return {
      ok: false,
      message,
      statusCode: 400,
      content,
    };
  }

  http401(message: string = "Error no authorization!", content: any = null) {
    return {
      ok: false,
      message,
      statusCode: 401,
      content,
    };
  }
  http404(message: string = "Error not found", content: any = null) {
    return {
      ok: false,
      message,
      statusCode: 404,
      content,
    };
  }
  http500(message: string = "Error server", content: any = null) {
    return {
      ok: false,
      message,
      statusCode: 500,
      content,
    };
  }
}

export const httpResponse = new Response();
