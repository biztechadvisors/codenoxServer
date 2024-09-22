import { FAQ } from './faq.entity';
export declare enum QnAType {
    GENERAL_QUESTION = "GENERAL_QUESTION",
    SHIPPING_PRODUCTS_INSTALLATION = "SHIPPING_PRODUCTS_INSTALLATION"
}
export declare class QnA {
    id: number;
    question: string;
    answer: string;
    type: QnAType;
    faq: FAQ;
}
