type PropertySet = import('types-siebel').PropertySet
type Application = import('types-siebel').Application

declare module 'siebel-utils' {
    export function app(): Application

    export function ps(some: string | object): PropertySet

    export function pa(name: string, value?:string ): string | null | boolean

    export function jsonToPs(json: object): PropertySet
    export function psToJson(ps: PropertySet): object

    export function importCss(path: string): void

    export function invokeService(serviceName: string, methodName: string, inputs?: object): object

    export function invokeWorkflow(workflowName: string, inputs?: object): object

    /**
     *
     * @param endpoint The name of workflow or Business Service
     * @param wfInputs_ServiceMethodName Workflow inputs as JSON or Business Service Method Name
     * @param serviceInputs Business Service inputs
     *
     * @example
     * // Workflow invocation
     * const outputs = invoke('X Schedule Task Workflow')
     * const outputs = invoke('X Close Account Workflow', {contactId: '1-777'})
     *
     * // Business Service invocation
     * const outputs = invoke('X Utils', 'RefreshPrimaryBusComp')
     * const outputs = invoke('X Utils', 'QueryBusComp', {object: 'Contact', component: 'Contact', searchSpec: '[Id] = "1-777'"})
     *
     * @returns JSON object
     */
    export function invoke(endpoint: string, wfInputs_ServiceMethodName?: string | object, serviceInputs?: object ): object

    export function globalize(): void
}