import fastify = require("fastify");
import { Server, IncomingMessage, ServerResponse } from "http";
import {FastifyInstance} from "fastify";

// extend FastifyInstance interface
declare module "fastify" {
    export interface FastifyInstance<Server, IncomingMessage, ServerResponse> {
        // TODO fill me
        db: any;
    }
}

declare const mongoConnector: fastify.Plugin<Server, IncomingMessage, ServerResponse, {
    db: {
        url: string
    },
    modelsPath: string
}>

export = mongoConnector