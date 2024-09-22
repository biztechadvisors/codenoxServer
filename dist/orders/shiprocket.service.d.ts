export declare class ShiprocketService {
    private readonly apiUrl;
    private readonly headers;
    private readonly logger;
    private makeShiprocketRequest;
    private handleApiError;
    createOrder(order: any): Promise<any>;
    generateLabel(orderId: number): Promise<any>;
    trackOrderByOrderId(orderId: string | number): Promise<any>;
    trackOrderByShipmentId(shipmentId: string | number): Promise<any>;
    calculateShippingCostAndChoosePartner(pickupPostcode: number, deliveryPostcode: number, weight?: string, cod?: boolean): Promise<{
        partner: string;
        shippingDetails: any;
    }>;
    private findMinimumShippingCost;
    calculateShippingCost(shippingData: any): Promise<any[]>;
    cancelOrder(orderId: string | number): Promise<any>;
    updateCustomerAddress(orderData: any): Promise<any>;
    returnShiprocketOrder(orderData: any): Promise<any>;
    getShiprocketOrders(): Promise<any>;
    returnAllShiprocketOrders(): Promise<any>;
    generateToken(email: string, password: string): Promise<any>;
}
