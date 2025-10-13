export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  try {
    const response = await $fetch(`${config.public.apiBase}/stripe/cancel-subscription`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getCookie(event, "auth-token")}`,
      },
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || "Failed to cancel subscription",
    });
  }
});
