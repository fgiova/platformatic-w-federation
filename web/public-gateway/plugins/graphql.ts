import type { IncomingHttpHeaders } from "node:http";
import mercuriusWithGateway, {type MercuriusGatewayService} from "@mercuriusjs/gateway";
import type { FastifyInstance } from "fastify";
import { Pool, request as undiciRequest, getGlobalDispatcher, Agent } from "undici";


export default async function (fastify: FastifyInstance) {
	const graphqlEndpoints: MercuriusGatewayService[] = [] ;
	const endpoints = [
		{
			id: "users-service",
			graphqlEndpoint: "/graphql"
		},
		{
			id: "posts-service",
			graphqlEndpoint: "/graphql"
		},
		{
			id: "reviews-service",
			graphqlEndpoint: "/graphql"
		}
	];

	const defaultPoolOptions: Pool.Options = {
		bodyTimeout: 30e3, // 30 seconds
		headersTimeout: 30e3, // 30 seconds
		maxHeaderSize: 16384, // 16 KiB
		keepAliveMaxTimeout: 5 * 1000, // 5 seconds
		connections: 10,
		connect: {
			rejectUnauthorized: false,
		},
	};

	for (const endpoint of endpoints || []) {
		const { id, graphqlEndpoint } = endpoint;

		const serviceGw = {
			name: id,
			url: "",
		};

		if (graphqlEndpoint.startsWith("http")) {
			serviceGw.url = graphqlEndpoint;
		} else {
			serviceGw.url = new URL(
				graphqlEndpoint,
				`http://${id}.plt.local`,
			).toString();
		}

		const url = new URL(serviceGw.url);

		graphqlEndpoints.push({
			...serviceGw,
			agent: getGlobalDispatcher(),
			mandatory: true,
		});
	}

	await fastify.register(mercuriusWithGateway, {
		gateway: {
			services: graphqlEndpoints,
		},
	});

	await fastify.register(
		(await import("altair-fastify-plugin")).AltairFastify as never,
		{
			path: "/altair",
			baseURL: "/altair/",
			endpointURL: "/graphql",
		} as never,
	);
	console.log(
		`🚀 GraphQL Gateway ready with services: ${(endpoints || []).map((e) => e.id).join(", ")}`,
	);
}
