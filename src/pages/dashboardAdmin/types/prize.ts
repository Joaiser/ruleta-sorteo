export type Prize = {
    _id?: string;
    type: 'discount' | 'product';
    value: number | string;
    code: string;
    baseChance: number;
};
