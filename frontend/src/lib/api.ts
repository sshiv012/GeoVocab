import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export interface GeoVocabResponse {
  geoVocab: string
  geoHash: string
  latitude: number
  longitude: number
}

export interface ApiResponse<T> {
  message: string
  status: number
  data: T
}

export const api = {
  async getWordsFromCoordinates(lat: number, lon: number): Promise<GeoVocabResponse> {
    const response = await axios.get<ApiResponse<GeoVocabResponse>>(
      `${API_BASE_URL}/geovocab/latitude/${lat}/longitude/${lon}/words`
    )
    return response.data.data
  },

  async getLocationFromWords(words: string): Promise<GeoVocabResponse> {
    const response = await axios.get<ApiResponse<GeoVocabResponse>>(
      `${API_BASE_URL}/geovocab/words/${words}/location`
    )
    return response.data.data
  },

  async createPremiumGeovocab(geoHash: string, magicwords: string): Promise<GeoVocabResponse> {
    const response = await axios.post<ApiResponse<GeoVocabResponse>>(
      `${API_BASE_URL}/geovocab/premium`,
      { geoHash, magicwords }
    )
    return response.data.data
  },
}
