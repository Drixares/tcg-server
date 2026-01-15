import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { apiRoutes } from "./routers";

export const app = new Elysia()
	.use(
		openapi({
			documentation: {
				info: {
					title: "TCG Server API",
					version: "1.0.0",
					description: "API for managing trading card game data",
				},
			},
		}),
	)
	.use(apiRoutes)
	.get("/welcome", () => "Welcome on the TCG One Piece API")
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.protocol}://${app.server?.hostname}:${app.server?.port}`,
);
