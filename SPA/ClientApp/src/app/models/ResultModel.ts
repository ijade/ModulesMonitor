export type ResultModel<T = any> = {
    isSuccess: boolean;
    errorMessage: string;
    content: T | null;
}