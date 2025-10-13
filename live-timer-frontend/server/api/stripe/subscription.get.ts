export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  try {
    const response = await $fetch(`${config.public.apiBase}/stripe/subscription`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getCookie(event, "auth-token")}`,
      },
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || "Failed to get subscription",
    });
  }
});
