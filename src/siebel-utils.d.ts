import {PropertySet, Application} from "./SiebelEnvironment"

declare module "siebel-utils" {
    export function app(): Application

    export function ps(): PropertySet
    export function ps(serialized: string): PropertySet
    export function ps(json: object): PropertySet

    export function pa(name: string): string | null
    export function pa(name: string, value: string): boolean

    export function jsonToPs(json: object): PropertySet
    export function psToJson(ps: PropertySet): object

    export function importCss(path: string): void

    export function invokeService(serviceName: string, methodName: string): object
    export function invokeService(serviceName: string, methodName: string, inputs: object): object

    export function invokeWorkflow(workflowName: string): void
    export function invokeWorkflow(workflowName: string, inputs: object): object

    export function invoke(workflowName: string): void
    export function invoke(workflowName: string, inputs: object): object
    export function invoke(serviceName: string, methodName: string): object
    export function invoke(serviceName: string, methodName: string, inputs: object): object
}