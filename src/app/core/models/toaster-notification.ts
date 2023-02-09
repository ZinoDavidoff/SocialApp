export interface TOAST {
    type: TOAST_STATE
    message: string 
}

export enum TOAST_STATE {
    Success,
    Error,
    Info,
    Warning
}