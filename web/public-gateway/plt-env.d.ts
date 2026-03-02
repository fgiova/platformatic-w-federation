import type {
	PlatformaticApplication,
	PlatformaticGatewayConfig,
} from "@platformatic/gateway";
// biome-ignore lint/correctness/noUnusedImports: Platformatic types augmentation
import type { FastifyInstance } from "fastify";

declare module "fastify" {
	interface FastifyInstance {
		platformatic: PlatformaticApplication<PlatformaticGatewayConfig>;
	}
}
