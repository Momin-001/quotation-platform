/**
 * standard success response
 * @param {any} data
 * @param {string} message
 * @returns {Response}
 */
export const successResponse = (data, message = "Success") => {
    return Response.json(
        {
            success: true,
            message,
            data,
        },
        { status: 200 }
    );
};

/**
 * standard error response
 * @param {string} message
 * @param {number} status
 * @returns {Response}
 */
export const errorResponse = (message = "Something went wrong", status = 500) => {
    return Response.json(
        {
            success: false,
            message,
            data: null,
        },
        { status }
    );
};
