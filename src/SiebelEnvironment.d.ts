declare var Siebel: Environment
declare function theApplication(): Application

export interface Environment {
    S_App: Application
}

export interface Application {
    GetProfileAttr(name: String): String | null
    NewPropertySet(): PropertySet
    GetService(name: string): Service
}

export interface PropertySet {
    // Serialization related
    // Decode functions works with side effect
    DecodeFromString(serializedPropertySet: string): boolean
    DecodeFromStringOld(oldFashionSerializedPropertySet: string): boolean
    EncodeAsString(): string
    EncodeAsStringOld(): string

    // Hierarchy handling

    GetChild(index: number): PropertySet
    GetChildByType(type: string): PropertySet | null
    GetChildByType(type: string, isChildren: boolean): PropertySet | null
    GetChildCount(): number
    RemoveChild(index: number): boolean

    // Properties Related
    GetFirstProperty(): string | null
    GetNextProperty(): string | null
    GetProperty(name: string): string
    SetProperty(name: string, value: string): boolean
    RemoveProperty(name: string): void
    GetPropertyCount(): number

    // Type
    GetType(): string
    SetType(type: string): boolean

    // Value
    GetValue(): string
    SetValue(value: string): boolean

    // Misc
    Reset(): void
    IsEmpty(): boolean
}

export interface Service {
    InvokeMethod(name: string, inputs: PropertySet)
}