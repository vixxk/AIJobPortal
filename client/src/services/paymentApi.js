import api from '../utils/axios';

export const getSubscriptionStatus = async () => {
    const response = await api.get('/payment/subscription-status');
    return response.data;
};

export const createPayPerUseOrder = async (featureType) => {
    const response = await api.post('/payment/create-pay-per-use', { featureType });
    return response.data;
};

export const createSubscriptionOrder = async (planKey) => {
    const response = await api.post('/payment/subscribe', { planKey });
    return response.data;
};

export const getPlans = async () => {
    const response = await api.get('/payment/plans');
    return response.data;
};

export const updatePlan = async (planData) => {
    const response = await api.patch('/payment/plans', planData);
    return response.data;
};

export const verifyPayment = async (orderId) => {
    const response = await api.get(`/payment/verify-payment/${orderId}`);
    return response.data;
};
