export interface IAnswers {
    [key: string]: string | number | Date;
}

export interface IQuestion {
    key: string;
    question: string;
}
