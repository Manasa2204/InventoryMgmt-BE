export function successResponse(res, result, message, status = 200) {
  return res
    .json({
      result: result,
      message: message,
      success: true,
    })
    .status(status);
}

export function errorResponse(res, error, status = 400) {
  return res
    .json({
      result: {},
      message: error?.message || "Some thing went wrong",
      success: false,
    })
    .status(status);
}
