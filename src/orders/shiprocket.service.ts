/* eslint-disable prettier/prettier */
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ShiprocketService {
    constructor(private httpService: HttpService) { }

    async generateToken(email: string, password: string) {
        try {
            const response = await lastValueFrom(this.httpService.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
                email,
                password,
            }));
            return response.data.token;
        } catch (error) {
            throw new Error('Error generating Shiprocket token');
        }
    }

    async createOrder(order: any) {
        try {
            const response = await lastValueFrom(this.httpService.post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', order, {
                headers: {
                    'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                },
            }));
            return (response as any).data;
        } catch (error) {
            console.log("error.response.data", error.response.data)
            throw new Error(`Error creating Shiprocket order ${error.response.data}`);
        }
    }

    async generateLabel(orderId: number) {
        try {
            const response = await lastValueFrom(this.httpService.post(`https://apiv2.shiprocket.in/v1/external/courier/generate/label/${orderId}`, null, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                },
            }));

            return response.data;
        } catch (error) {
            throw new Error('Error generating Shiprocket label');
        }
    }

    async trackOrderByOrderId(orderId: string | number) {
        try {
            const response = await lastValueFrom(this.httpService.get(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                },
            }));
            return response.data;
        } catch (error) {
            throw new Error('Error tracking Shiprocket order');
        }
    }

    async trackOrderByShipment_id(shipment_id: string | number) {
        try {
            const response = await lastValueFrom(this.httpService.get(`https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipment_id}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                },
            }));
            return response.data;
        } catch (error) {
            throw new Error('Error tracking Shiprocket order');
        }
    }

    async calculateShippingCost(shippingData: any) {
        try {
            const { pickup_postcode, delivery_postcode, weight, cod } = shippingData;
            const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickup_postcode}&delivery_postcode=${delivery_postcode}&weight=${weight}&cod=${cod}`;
            const response = await lastValueFrom(this.httpService.get(url, {
                headers: {
                    'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                },
            }));
            return response.data;
        } catch (error) {
            throw new Error('Error during Services calculateShippingCost ');
        }
    }

    async cancelOrder(order_id: string | number) {
        try {
            const ids = [order_id];
            const response = await lastValueFrom(this.httpService.post(
                'https://apiv2.shiprocket.in/v1/external/orders/cancel',
                { ids },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                    },
                }
            ));
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.error('Shiprocket API Error: Authentication failed. Check your credentials.');
                throw new Error('Authentication failed. Check your credentials.');
            } else {
                throw error;
            }
        }
    }

    async updateCustomerAddress(orderData: any) {
        try {
            const response = await lastValueFrom(this.httpService.post(
                'https://apiv2.shiprocket.in/v1/external/orders/address/update',
                orderData,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                    },
                }
            ));
            console.log('Shiprocket API Response:', (response as any).data);
            return (response as any).data;
        } catch (error) {
            if (error.response) {
                const shiprocketError = error.response.data;
                console.error('Shiprocket API Error:', shiprocketError);
                throw shiprocketError;
            } else {
                throw error;
            }
        }
    }

    async returnShiprocketOrder(orderData: any) {
        try {
            const response = await lastValueFrom(this.httpService.post(
                'https://apiv2.shiprocket.in/v1/external/orders/create/return',
                { orderData },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                    },
                }
            ));
            return (response as any).data;
        } catch (error) {
            if (error.response) {
                const shiprocketError = error.response.data;
                console.error('Shiprocket API Error:', shiprocketError);
                throw shiprocketError;
            } else {
                throw error;
            }
        }
    }

    async getShiprocketOrders() {
        try {
            const response = await lastValueFrom(this.httpService.get(
                'https://apiv2.shiprocket.in/v1/external/orders',
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                    },
                }
            ));
            if ((response as any).status !== 200) {
                const error = (response as any);
                console.error('Shiprocket API Error:', error);
                throw error;
            }
            return (response as any).data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async returnAllShiprocketOrder() {
        try {
            const response = await lastValueFrom(this.httpService.post(
                'https://apiv2.shiprocket.in/v1/external/orders/processing/return',
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                    },
                }
            ));
            return (response as any).data;
        } catch (error) {
            if (error.response) {
                const shiprocketError = error.response.data;
                console.error('Shiprocket API Error:', shiprocketError);
                throw shiprocketError;
            } else {
                throw error;
            }
        }
    }
}
