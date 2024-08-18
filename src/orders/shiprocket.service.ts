import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

@Injectable()
export class ShiprocketService {
    private readonly apiUrl = 'https://apiv2.shiprocket.in/v1/external/';
    private readonly headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`,
    };
    private readonly logger = new Logger(ShiprocketService.name);

    private async makeShiprocketRequest(url: string, method: 'get' | 'post', data?: any) {
        try {
            const response = await axios.request({
                method,
                url,
                data,
                headers: this.headers,
            });
            return response.data;
        } catch (error) {
            this.handleApiError(error);
        }
    }

    private handleApiError(error: AxiosError) {
        if (error.response) {
            const statusCode = error.response.status;
            const errorMessage = error.response.data;
            if (statusCode === 401) {
                this.logger.error('Shiprocket API Authentication Error:', errorMessage);
                throw new Error('Shiprocket API Authentication Error. Check your credentials.');
            }
            this.logger.error('Shiprocket API Error:', errorMessage);
            throw new Error(`Shiprocket API Error: ${errorMessage}`);
        } else if (error.request) {
            this.logger.error('Network Error:', error.request);
            throw new Error('Network error. Please check your internet connection.');
        } else {
            this.logger.error('Unexpected Error:', error.message);
            throw new Error(`Unexpected Error: ${error.message}`);
        }
    }

    async createOrder(order: any) {
        return this.makeShiprocketRequest(`${this.apiUrl}orders/create/adhoc`, 'post', order);
    }

    async generateLabel(orderId: number) {
        return this.makeShiprocketRequest(`${this.apiUrl}courier/generate/label/${orderId}`, 'get');
    }

    async trackOrderByOrderId(orderId: string | number) {
        return this.makeShiprocketRequest(`${this.apiUrl}courier/track/awb/${orderId}`, 'get');
    }

    async trackOrderByShipmentId(shipmentId: string | number) {
        return this.makeShiprocketRequest(`${this.apiUrl}courier/track/shipment/${shipmentId}`, 'get');
    }

    async calculateShippingCostAndChoosePartner(
        pickupPostcode: number,
        deliveryPostcode: number,
        weight: string = '1',
        cod: boolean = true,
    ): Promise<{ partner: string; shippingDetails: any }> {
        try {
            const shippingDetails = await this.calculateShippingCost({
                pickup_postcode: pickupPostcode,
                delivery_postcode: deliveryPostcode,
                weight,
                cod,
            });

            const minShippingDetails = this.findMinimumShippingCost(shippingDetails);

            const courierDetails = {
                id: minShippingDetails.courier_company_id,
                currency: minShippingDetails.currency,
                city: minShippingDetails.city,
                cod: minShippingDetails.cod,
                courier_company_id: minShippingDetails.courier_company_id,
                courier_name: minShippingDetails.courier_name,
                min_weight: minShippingDetails.min_weight,
                cod_charges: minShippingDetails.cod_charges,
                postcode: minShippingDetails.postcode,
                region: minShippingDetails.region,
                state: minShippingDetails.state,
                zone: minShippingDetails.zone,
                shippingCost: minShippingDetails.shippingCost,
                estimated_delivery_days: minShippingDetails.estimated_delivery_days,
                etd: minShippingDetails.etd,
            };

            return { partner: minShippingDetails.courier_name, shippingDetails: courierDetails };
        } catch (error) {
            this.logger.error('Error calculating shipping cost and choosing partner:', error);
            throw error;
        }
    }

    private findMinimumShippingCost(shippingDetails: any[]): any {
        if (shippingDetails.length === 0) {
            this.logger.error('No shipping details available.');
            throw new Error('No shipping details available.');
        }

        return shippingDetails.reduce((min, current) => (
            current.shippingCost < min.shippingCost ? current : min
        ));
    }

    async calculateShippingCost(shippingData: any): Promise<any[]> {
        const { pickup_postcode, delivery_postcode, weight, cod } = shippingData;
        const url = `${this.apiUrl}courier/serviceability/?pickup_postcode=${pickup_postcode}&delivery_postcode=${delivery_postcode}&weight=${weight}&cod=${cod}`;

        try {
            const response = await this.makeShiprocketRequest(url, 'get');
            if (response?.data?.available_courier_companies) {
                return response.data.available_courier_companies.map(courier => ({
                    id: courier.id,
                    currency: response.currency,
                    city: courier.city,
                    cod: courier.cod,
                    courier_company_id: courier.courier_company_id,
                    courier_name: courier.courier_name,
                    min_weight: courier.min_weight,
                    cod_charges: courier.cod_charges,
                    postcode: courier.postcode,
                    region: courier.region,
                    state: courier.state,
                    zone: courier.zone,
                    shippingCost: courier.rate,
                    estimated_delivery_days: courier.estimated_delivery_days,
                    etd: courier.etd
                }));
            } else {
                this.logger.error('Invalid response format from Shiprocket API.');
                throw new Error('Invalid response format from Shiprocket API.');
            }
        } catch (error) {
            this.logger.error('Error calculating shipping cost:', error);
            throw error;
        }
    }

    async cancelOrder(orderId: string | number) {
        try {
            return this.makeShiprocketRequest(`${this.apiUrl}orders/cancel`, 'post', { ids: [orderId] });
        } catch (error) {
            this.handleApiError(error);
        }
    }

    async updateCustomerAddress(orderData: any) {
        return this.makeShiprocketRequest(`${this.apiUrl}orders/address/update`, 'post', orderData);
    }

    async returnShiprocketOrder(orderData: any) {
        return this.makeShiprocketRequest(`${this.apiUrl}orders/create/return`, 'post', { orderData });
    }

    async getShiprocketOrders() {
        return this.makeShiprocketRequest(`${this.apiUrl}orders`, 'get');
    }

    async returnAllShiprocketOrders() {
        return this.makeShiprocketRequest(`${this.apiUrl}orders/processing/return`, 'post');
    }

    async generateToken(email: string, password: string) {
        return this.makeShiprocketRequest(`${this.apiUrl}auth/login`, 'post', { email, password });
    }
}
