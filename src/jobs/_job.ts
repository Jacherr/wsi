import { SupportedTypes, DataRequirement } from "./_statics";

export abstract class Job {
    abstract readonly requiresData: DataRequirement
    abstract readonly supportedMediaTypes: SupportedTypes
}