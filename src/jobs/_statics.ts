export enum DataRequirement {
    NEVER = 'never',
    OPTIONAL = 'optional',
    ALWAYS = 'always'
}

export type SupportedMedia = 'apng' | 'gif' | 'jpeg' | 'png' | 'wav'
export type SupportedTypes = Set<SupportedMedia>