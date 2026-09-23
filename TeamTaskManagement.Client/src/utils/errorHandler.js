export const getApiErrorMessage = (
    error,
    fallback = 'Something went wrong.'
) => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    if (error.response?.data?.errors) {
        const errors = error.response.data.errors;

        return Object.values(errors)
            .flat()
            .join(' ');
    }

    if (error.message) {
        return error.message;
    }

    return fallback;
};