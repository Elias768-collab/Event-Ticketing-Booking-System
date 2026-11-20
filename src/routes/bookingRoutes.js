function getUserId(req) {
  return req.headers["x-user-id"];
}

export function registerBookingRoutes(router, bookingService) {
  // Create a pending booking.
  router.post("/api/bookings", async ({ req, body }) => {
    const booking = await bookingService.createBooking({
      tierId: body?.tierId,
      quantity: body?.quantity,
      userId: getUserId(req),
    });

    return {
      status: 201,
      body: { data: booking },
    };
  });

  // Pay for a pending booking.
  router.post(
    "/api/bookings/:reference/pay",
    async ({ req, params, body }) => {
      const booking = await bookingService.payBooking(
        params.reference,
        getUserId(req),
        {
          outcome: body?.outcome ?? "success",
        }
      );

      return {
        status: 200,
        body: { data: booking },
      };
    }
  );

  // Cancel a pending booking.
  router.post(
    "/api/bookings/:reference/cancel",
    async ({ req, params }) => {
      const booking = await bookingService.cancelBooking(
        params.reference,
        getUserId(req)
      );

      return {
        status: 200,
        body: { data: booking },
      };
    }
  );
}