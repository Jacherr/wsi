import { Serializable } from '../server/statics';

export enum DataRequirement {
    NEVER = 'never',
    OPTIONAL = 'optional',
    ALWAYS = 'always'
}

export enum SupportedMedia {
    JPEG,
    PNG,
    GIF
}
export type SupportedTypes = Set<SupportedMedia>

export type Arguments = { [key: string]: Serializable }
