import { SupportedTypes, DataRequirement, Arguments } from './_statics';
import { Context } from '../scheduler/context';

export abstract class Job {
    abstract readonly name: string
    abstract readonly maximumImages: number
    abstract readonly minimumImages: number
    abstract readonly requiresData: DataRequirement
    abstract readonly supportedMediaTypes: SupportedTypes

    abstract async run (context: Context, inputs: Buffer[], args: Arguments): Promise<Buffer[]>
}
