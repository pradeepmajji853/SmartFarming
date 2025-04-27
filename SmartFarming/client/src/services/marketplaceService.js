import api from './api';

// Get all listings with optional filters
export const getAllListings = async (filters = {}) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await api.get(`/marketplace?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching listings');
  }
};

// Get user's own listings
export const getMyListings = async () => {
  try {
    const response = await api.get(`/marketplace/my-listings`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching your listings');
  }
};

// Get listing by ID
export const getListingById = async (listingId) => {
  try {
    const response = await api.get(`/marketplace/${listingId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching listing details');
  }
};

// Create new listing
export const createListing = async (listingData) => {
  try {
    const response = await api.post(`/marketplace`, listingData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating listing');
  }
};

// Update existing listing
export const updateListing = async (listingId, listingData) => {
  try {
    const response = await api.put(`/marketplace/${listingId}`, listingData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating listing');
  }
};

// Delete a listing
export const deleteListing = async (listingId) => {
  try {
    const response = await api.delete(`/marketplace/${listingId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error deleting listing');
  }
};

// Make an offer on a listing
export const makeOffer = async (listingId, offerData) => {
  try {
    const response = await api.post(`/marketplace/${listingId}/offers`, offerData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error making offer');
  }
};

// Get offers for a listing
export const getOffersForListing = async (listingId) => {
  try {
    const response = await api.get(`/marketplace/${listingId}/offers`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching offers');
  }
};

// Get user's own offers
export const getMyOffers = async () => {
  try {
    const response = await api.get(`/marketplace/my-offers`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching your offers');
  }
};

// Respond to an offer (accept/reject)
export const respondToOffer = async (offerId, response) => {
  try {
    const res = await api.put(`/marketplace/offers/${offerId}/respond`, { response });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error responding to offer');
  }
};

// Export all functions
const marketplaceService = {
  getAllListings,
  getMyListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  makeOffer,
  getOffersForListing,
  getMyOffers,
  respondToOffer
};

export default marketplaceService;